import { NextRequest, NextResponse } from "next/server";
import { verifyVatarWebhookSignature, getVatarPurchase, deliverVatarPurchase } from "@/lib/vatar/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-vatar-signature");

    // 1. Verify HMAC constant-time signature
    if (!verifyVatarWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload?.type;

    if (eventType === "purchase.paid") {
      const { purchaseId, productId, playerId } = payload.data || {};

      if (purchaseId && playerId) {
        // Re-check with API directly before fulfilling
        const p = await getVatarPurchase(purchaseId);
        if (p && p.status === "paid" && p.playerId === playerId) {
          if (isSupabaseConfigured && supabase) {
            const { data: existing } = await supabase
              .from("vatar_deliveries")
              .select("purchase_id")
              .eq("purchase_id", p.id)
              .maybeSingle();

            if (!existing) {
              await supabase.from("vatar_deliveries").insert({
                purchase_id: p.id,
                player_id: playerId,
                product_id: productId,
                delivered_at: new Date().toISOString(),
              });

              const { data: player } = await supabase
                .from("vatar_players")
                .select("hints, seals, owns_marathon")
                .eq("player_id", playerId)
                .maybeSingle();

              const updates: Record<string, unknown> = {};
              if (productId === "hints_10") updates.hints = (player?.hints || 0) + 10;
              if (productId === "scholar_seal") updates.seals = (player?.seals || 0) + 1;
              if (productId === "marathon") updates.owns_marathon = true;

              if (Object.keys(updates).length > 0) {
                await supabase.from("vatar_players").update(updates).eq("player_id", playerId);
              }
            }
          }
          await deliverVatarPurchase(p.id);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
