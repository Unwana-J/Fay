import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/security-guard";
import { ensureWebPushConfigured, sendPushToRow, type PushTargetRow } from "@/lib/push-sender";

/**
 * Sends a single test notification to the caller's own push subscription endpoint.
 * Used from /profile so users (and founders) can verify notifications work on their device.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkRateLimit(`push-test:${ip}`, 3, 60).allowed) {
    return NextResponse.json({ error: "Please wait a minute before sending another test." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const endpoint = typeof body?.endpoint === "string" ? body.endpoint : "";
  if (!endpoint.startsWith("https://") || endpoint.length >= 1000) {
    return NextResponse.json({ error: "Invalid subscription endpoint." }, { status: 400 });
  }

  if (!supabase || !ensureWebPushConfigured()) {
    return NextResponse.json({ error: "Push service is not configured yet." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth, user_id, timezone")
    .eq("endpoint", endpoint)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Subscription not found. Try turning reminders on again." }, { status: 404 });
  }

  const outcome = await sendPushToRow(
    data as PushTargetRow,
    {
      title: "Fey reminders are active",
      body: "You're all set. We'll nudge you at your practice time and when friends play.",
      url: "/",
      tag: "fey-test",
      template: "test_push",
      renotify: true,
    },
    { ttlSeconds: 300, urgency: "high" }
  );

  if (outcome === "sent") return NextResponse.json({ ok: true });
  if (outcome === "expired") {
    return NextResponse.json({ error: "Your browser subscription expired. Turn reminders on again." }, { status: 410 });
  }
  return NextResponse.json({ error: "Could not deliver test notification." }, { status: 502 });
}
