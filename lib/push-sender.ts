import webpush from "web-push";
import { supabase } from "@/lib/supabase";
import { localParts, QUIET_END_MIN, QUIET_START_MIN } from "@/lib/reminder-rules";

/**
 * Shared server-side Web Push delivery helper.
 * Used by both the scheduled reminder cron and event-driven social notifications.
 */

const TABLE = "push_subscriptions";
const SEND_CONCURRENCY = 25;

let vapidConfigured = false;

export function ensureWebPushConfigured(): boolean {
  if (vapidConfigured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "https://fey.lokinlabs.com.ng";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export interface PushTargetRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id?: string | null;
  timezone?: string | null;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag: string;
  template: string;
  renotify?: boolean;
}

export type DeliveryOutcome = "sent" | "expired" | "failed";

/** Sends one push notification and deletes expired (404/410) subscriptions automatically. */
export async function sendPushToRow(
  row: PushTargetRow,
  payload: PushPayload,
  opts: { ttlSeconds?: number; urgency?: "very-low" | "low" | "normal" | "high" } = {}
): Promise<DeliveryOutcome> {
  if (!ensureWebPushConfigured()) return "failed";
  try {
    await webpush.sendNotification(
      { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
      JSON.stringify(payload),
      {
        TTL: opts.ttlSeconds ?? 4 * 3600,
        urgency: opts.urgency ?? "normal",
        topic: payload.tag,
      }
    );
    return "sent";
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      if (supabase) {
        await supabase.from(TABLE).delete().eq("id", row.id);
      }
      return "expired";
    }
    console.error("[push-sender] send failed", status, (err as Error).message);
    return "failed";
  }
}

/**
 * Returns the subset of `userIds` that currently have at least one enabled
 * Web Push subscription. Safe to call on read paths; never exposes endpoints.
 */
export async function getPushEnabledUserIds(userIds: string[]): Promise<string[]> {
  if (!supabase || !ensureWebPushConfigured()) return [];
  const uniqueIds = Array.from(
    new Set(
      userIds
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter((id) => id.length > 0 && id !== "anonymous" && id !== "local-scholar")
    )
  ).slice(0, 50);

  if (uniqueIds.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("user_id")
      .eq("enabled", true)
      .in("user_id", uniqueIds);

    if (error || !data) return [];
    return Array.from(
      new Set(
        (data as Array<{ user_id?: string | null }>)
          .map((r) => (r.user_id || "").trim())
          .filter(Boolean)
      )
    );
  } catch {
    return [];
  }
}

/**
 * Sends an event-driven social notification to a set of user IDs.
 *
 * Rules:
 * - Never notifies `excludeUserId` (the actor who triggered the event).
 * - Does NOT count against daily practice reminder limits or back-off counters.
 * - Respects quiet hours (22:00–08:00 local time) by default.
 * - Safe to call inside Next.js `after()`; never throws.
 */
export async function sendSocialPushToUsers(
  userIds: string[],
  payloadOrBuilder: PushPayload | ((userId: string) => PushPayload),
  opts: {
    excludeUserId?: string | null;
    ttlSeconds?: number;
    respectQuietHours?: boolean;
  } = {}
): Promise<{
  targeted: number;
  sent: number;
  expired: number;
  failed: number;
  quietSkipped: number;
}> {
  const empty = { targeted: 0, sent: 0, expired: 0, failed: 0, quietSkipped: 0 };
  if (!supabase || !ensureWebPushConfigured()) return empty;

  const excluded = opts.excludeUserId?.trim();
  const uniqueIds = Array.from(
    new Set(
      userIds
        .map((id) => (typeof id === "string" ? id.trim() : ""))
        .filter((id) => id.length > 0 && id !== "anonymous" && id !== "local-scholar" && id !== excluded)
    )
  ).slice(0, 50);

  if (uniqueIds.length === 0) return empty;

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("id, endpoint, p256dh, auth, user_id, timezone")
      .eq("enabled", true)
      .in("user_id", uniqueIds);

    if (error || !data || data.length === 0) return empty;

    const now = new Date();
    const respectQuiet = opts.respectQuietHours !== false;
    const eligible = (data as PushTargetRow[]).filter((row) => {
      if (!respectQuiet) return true;
      const local = localParts(now, row.timezone || "Africa/Lagos");
      return local.minutes >= QUIET_END_MIN && local.minutes < QUIET_START_MIN;
    });
    const quietSkipped = data.length - eligible.length;

    if (eligible.length === 0) {
      return { ...empty, quietSkipped };
    }

    const tally = { targeted: eligible.length, sent: 0, expired: 0, failed: 0, quietSkipped };
    for (let i = 0; i < eligible.length; i += SEND_CONCURRENCY) {
      const batch = eligible.slice(i, i + SEND_CONCURRENCY);
      const results = await Promise.all(
        batch.map((row) => {
          const payload =
            typeof payloadOrBuilder === "function"
              ? payloadOrBuilder(row.user_id || "")
              : payloadOrBuilder;
          return sendPushToRow(row, payload, {
            ttlSeconds: opts.ttlSeconds ?? 12 * 3600,
            urgency: "normal",
          });
        })
      );
      for (const outcome of results) tally[outcome] += 1;
    }
    return tally;
  } catch (err) {
    console.error("[push-sender] social dispatch error", (err as Error).message);
    return empty;
  }
}
