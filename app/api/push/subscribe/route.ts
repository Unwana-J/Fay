import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/security-guard";

/**
 * Stores Web Push subscriptions for practice reminders.
 * POST   — create/refresh a subscription (after the user opts in)
 * PATCH  — record practice activity so tonight's reminder is skipped
 * DELETE — remove a subscription
 *
 * Writes require SUPABASE_SERVICE_ROLE_KEY on the server (RLS has no public policies).
 */

const TABLE = "push_subscriptions";

function isValidEndpoint(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("https://") && value.length < 1000;
}

function isValidTimezone(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 64) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const n = typeof value === "number" ? Math.round(value) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function sanitizeCategories(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((c): c is string => typeof c === "string" && c.length > 0 && c.length <= 64)
    .slice(0, 30);
}

function rateLimited(req: NextRequest) {
  const ip = getClientIp(req);
  return !checkRateLimit(`push:${ip}`, 20, 60).allowed;
}

export async function POST(req: NextRequest) {
  if (rateLimited(req)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const sub = body?.subscription;
  if (!isValidEndpoint(sub?.endpoint) || typeof sub?.keys?.p256dh !== "string" || typeof sub?.keys?.auth !== "string") {
    return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
  }

  if (!supabase) return NextResponse.json({ stored: false, reason: "storage_not_configured" });

  const row = {
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
    user_id: typeof body.userId === "string" ? body.userId.slice(0, 128) : null,
    timezone: isValidTimezone(body.timezone) ? body.timezone : "Africa/Lagos",
    reminder_minutes: clampInt(body.reminderMinutes, 0, 24 * 60 - 1, 20 * 60),
    streak: clampInt(body.streak, 0, 100000, 0),
    last_practiced_at: typeof body.lastPracticedAt === "string" ? body.lastPracticedAt : new Date().toISOString(),
    categories: sanitizeCategories(body.categories) ?? [],
    consecutive_ignored: 0,
    paused_at: null,
    enabled: true,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from(TABLE).upsert(row, { onConflict: "endpoint" });
  if (error) {
    console.error("[push/subscribe] upsert failed", error.message);
    return NextResponse.json({ stored: false, reason: "storage_error" });
  }
  return NextResponse.json({ stored: true });
}

export async function PATCH(req: NextRequest) {
  if (rateLimited(req)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!isValidEndpoint(body?.endpoint)) return NextResponse.json({ error: "Invalid endpoint." }, { status: 400 });
  if (!supabase) return NextResponse.json({ stored: false });

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof body.lastPracticedAt === "string") {
    update.last_practiced_at = body.lastPracticedAt;
    // Practising again resets the back-off and resumes paused reminders.
    update.consecutive_ignored = 0;
    update.paused_at = null;
  }
  if (typeof body.streak === "number") {
    update.streak = clampInt(body.streak, 0, 100000, 0);
  }
  if (typeof body.enabled === "boolean") {
    update.enabled = body.enabled;
    if (body.enabled) {
      update.paused_at = null;
      update.consecutive_ignored = 0;
    }
  }
  if (typeof body.reminderMinutes === "number") {
    // Respect quiet hours (08:00–21:30)
    update.reminder_minutes = clampInt(body.reminderMinutes, 8 * 60, 21 * 60 + 30, 20 * 60);
  }
  if (isValidTimezone(body.timezone)) update.timezone = body.timezone;
  const categories = sanitizeCategories(body.categories);
  if (categories) update.categories = categories;

  const { error } = await supabase.from(TABLE).update(update).eq("endpoint", body.endpoint);
  return NextResponse.json({ stored: !error });
}

export async function DELETE(req: NextRequest) {
  if (rateLimited(req)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!isValidEndpoint(body?.endpoint)) return NextResponse.json({ error: "Invalid endpoint." }, { status: 400 });
  if (!supabase) return NextResponse.json({ removed: false });

  const { error } = await supabase.from(TABLE).delete().eq("endpoint", body.endpoint);
  return NextResponse.json({ removed: !error });
}
