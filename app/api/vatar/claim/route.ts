import { NextRequest, NextResponse } from "next/server";
import { getVatarPurchase, deliverVatarPurchase } from "@/lib/vatar/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerId, purchaseId } = body;

    if (!playerId || !purchaseId) {
      return NextResponse.json({ error: "Missing playerId or purchaseId" }, { status: 400 });
    }

    // 1. Verify directly with Vatar's authoritative ledger
    const purchase = await getVatarPurchase(purchaseId);
    if (!purchase) {
      return NextResponse.json({ error: "Purchase not found or not paid" }, { status: 404 });
    }

    if (purchase.status === "refunded") {
      return NextResponse.json({ error: "Purchase was refunded" }, { status: 409 });
    }

    // Verify ownership
    if (purchase.playerId !== playerId) {
      return NextResponse.json({ error: "Player ID mismatch" }, { status: 403 });
    }

    // 2. Grant inventory reward in Supabase with idempotent deduplication
    let itemGranted = false;
    if (isSupabaseConfigured && supabase) {
      // Check if already delivered in our table
      const { data: existingDelivery } = await supabase
        .from("vatar_deliveries")
        .select("purchase_id")
        .eq("purchase_id", purchase.id)
        .maybeSingle();

      if (!existingDelivery) {
        // Record delivery
        await supabase.from("vatar_deliveries").insert({
          purchase_id: purchase.id,
          player_id: playerId,
          product_id: purchase.productId,
          delivered_at: new Date().toISOString(),
        });

        // Grant item according to productId
        const { data: player } = await supabase
          .from("vatar_players")
          .select("hints, seals, owns_marathon")
          .eq("player_id", playerId)
          .maybeSingle();

        const updates: Record<string, unknown> = {};
        if (purchase.productId === "hints_10") {
          updates.hints = (player?.hints || 0) + 10;
        } else if (purchase.productId === "scholar_seal") {
          updates.seals = (player?.seals || 0) + 1;
        } else if (purchase.productId === "marathon") {
          updates.owns_marathon = true;
        }

        if (Object.keys(updates).length > 0) {
          await supabase.from("vatar_players").update(updates).eq("player_id", playerId);
        }
        itemGranted = true;
      }
    } else {
      itemGranted = true;
    }

    // 3. Mark delivered in Vatar API (safe to repeat)
    await deliverVatarPurchase(purchase.id);

    return NextResponse.json({
      success: true,
      productId: purchase.productId,
      itemGranted,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
