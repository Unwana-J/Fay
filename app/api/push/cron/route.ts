import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { planReminder, stateAfterSend, type PushSubscriptionRow, type ReminderPlan } from "@/lib/reminder-rules";
import { ensureWebPushConfigured, sendPushToRow, type DeliveryOutcome } from "@/lib/push-sender";
import { dispatchScheduledLeagueDrops } from "@/lib/league-reminders";

/**
 * Reminder sender. Called every 15 minutes by the scheduler (.github/workflows/push-reminders.yml).
 *   Authorization: Bearer <CRON_SECRET>
 *   ?dryRun=1  → returns what would be sent without sending or writing anything.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TABLE = "push_subscriptions";
const PAGE_SIZE = 1000;
const SEND_CONCURRENCY = 25;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function loadActiveRows(): Promise<PushSubscriptionRow[]> {
  if (!supabase) return [];
  const rows: PushSubscriptionRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("enabled", true)
      .is("paused_at", null)
      .order("created_at", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...((data ?? []) as PushSubscriptionRow[]));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

async function deliver(row: PushSubscriptionRow, plan: ReminderPlan, now: Date): Promise<DeliveryOutcome> {
  const outcome = await sendPushToRow(row, plan.payload, {
    ttlSeconds: plan.ttlSeconds,
    urgency: plan.urgency,
  });
  if (outcome === "sent") {
    await supabase!.from(TABLE).update(stateAfterSend(row, plan, now)).eq("id", row.id);
  }
  return outcome;
}

async function handle(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!supabase) return NextResponse.json({ error: "Supabase not configured." }, { status: 500 });
  if (!ensureWebPushConfigured()) return NextResponse.json({ error: "VAPID keys not configured." }, { status: 500 });

  const dryRun = new URL(req.url).searchParams.get("dryRun") === "1";
  const now = new Date();

  let rows: PushSubscriptionRow[];
  try {
    rows = await loadActiveRows();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const planned = rows
    .map((row) => ({ row, plan: planReminder(row, now) }))
    .filter((p): p is { row: PushSubscriptionRow; plan: ReminderPlan } => p.plan !== null);

  if (dryRun) {
    const leagues = await dispatchScheduledLeagueDrops(rows, now, true);
    return NextResponse.json({
      scanned: rows.length,
      planned: planned.map(({ row, plan }) => ({
        id: row.id,
        timezone: row.timezone,
        kind: plan.kind,
        template: plan.payload.template,
        title: plan.payload.title,
        body: plan.payload.body,
      })),
      leagues,
    });
  }

  const tally: Record<DeliveryOutcome, number> & Record<string, number> = { sent: 0, expired: 0, failed: 0 };
  for (let i = 0; i < planned.length; i += SEND_CONCURRENCY) {
    const batch = planned.slice(i, i + SEND_CONCURRENCY);
    const results = await Promise.all(batch.map(({ row, plan }) => deliver(row, plan, now)));
    results.forEach((outcome, idx) => {
      tally[outcome] += 1;
      if (outcome === "sent") {
        const kind = batch[idx].plan.kind;
        tally[kind] = (tally[kind] ?? 0) + 1;
      }
    });
  }

  const leagues = await dispatchScheduledLeagueDrops(rows, now, false);

  return NextResponse.json({ scanned: rows.length, planned: planned.length, ...tally, leagues });
}

export const GET = handle;
export const POST = handle;
