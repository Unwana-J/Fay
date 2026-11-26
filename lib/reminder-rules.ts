/**
 * Pure scheduling rules + copy for Fey practice reminders (server-side).
 *
 * Duolingo-inspired rules:
 * - One daily reminder, timed to the user's own habit (`reminder_minutes`, local time).
 * - One "streak at risk" nudge between 21:00 and 22:00 if the streak is alive and today is unpractised.
 * - Never during quiet hours (22:00–08:00), never after the user practised today,
 *   and at least 90 minutes between any two notifications.
 * - After 5 ignored reminders in a row, send one honest farewell and pause until they practise again.
 */

import { TOPIC_BANK, type Topic } from "@/lib/topics";

export const QUIET_START_MIN = 22 * 60;
export const QUIET_END_MIN = 8 * 60;
export const RISK_WINDOW_START_MIN = 21 * 60;
export const DAILY_WINDOW_MIN = 60; // tolerate scheduler delays
export const MIN_GAP_MS = 90 * 60 * 1000;
export const MAX_IGNORED_BEFORE_PAUSE = 5;

export interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string | null;
  timezone: string;
  reminder_minutes: number;
  streak: number;
  categories: string[] | null;
  last_practiced_at: string | null;
  last_sent_at: string | null;
  last_daily_sent_at: string | null;
  last_risk_sent_at: string | null;
  last_template: string | null;
  consecutive_ignored: number;
  paused_at: string | null;
}

export type ReminderKind = "daily" | "streak_risk" | "farewell";

export interface ReminderPayload {
  title: string;
  body: string;
  url: string;
  tag: string;
  template: string;
}

export interface ReminderPlan {
  kind: ReminderKind;
  payload: ReminderPayload;
  ttlSeconds: number;
  urgency: "normal" | "high";
}

// ─── Time helpers ──────────────────────────────────────────────────────────

export interface LocalParts {
  date: string; // YYYY-MM-DD
  minutes: number; // minutes since local midnight
}

export function localParts(at: Date, timeZone: string): LocalParts {
  let fmt: Intl.DateTimeFormat;
  try {
    fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
  } catch {
    return localParts(at, "Africa/Lagos");
  }
  const parts = Object.fromEntries(fmt.formatToParts(at).map((p) => [p.type, p.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function previousDate(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function sameLocalDay(iso: string | null, today: string, timeZone: string): boolean {
  return Boolean(iso) && localParts(new Date(iso as string), timeZone).date === today;
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ─── Topic hook ────────────────────────────────────────────────────────────

const MAX_TOPIC_CHARS = 110;

/** Deterministic per user per day, drawn only from the user's chosen categories. */
export function pickTopicForReminder(row: Pick<PushSubscriptionRow, "endpoint" | "categories">, date: string): Topic {
  const cats = Array.isArray(row.categories) ? row.categories : [];
  const short = (t: Topic) => t.text.length <= MAX_TOPIC_CHARS && t.difficulty !== "Expert";
  const inCats = TOPIC_BANK.filter((t) => short(t) && (cats.length === 0 || cats.includes(t.category)));
  const pool = inCats.length > 0 ? inCats : TOPIC_BANK.filter(short);
  const questions = pool.filter((t) => t.text.trim().endsWith("?"));
  const finalPool = questions.length >= 5 ? questions : pool;
  return finalPool[hash(`${row.endpoint}:${date}`) % finalPool.length];
}

// ─── Copy (Fey voice: curious, plain, never guilt-tripping, no emojis) ───────

interface TemplateContext {
  topic: string;
  streak: number;
}

interface Template {
  id: string;
  when?: (ctx: TemplateContext) => boolean;
  title: (ctx: TemplateContext) => string;
  body: (ctx: TemplateContext) => string;
}

const DAILY_TEMPLATES: Template[] = [
  {
    id: "daily_topic_question",
    title: () => "Today's question",
    body: ({ topic }) => `${topic} You have 90 seconds.`,
  },
  {
    id: "daily_explain_simply",
    title: () => "Can you explain it simply?",
    body: ({ topic }) => topic,
  },
  {
    id: "daily_streak_next_day",
    when: ({ streak }) => streak >= 2,
    title: ({ streak }) => `Day ${streak + 1} is waiting`,
    body: ({ streak }) => `Keep your ${streak}-day streak going. One topic, 90 seconds, your own words.`,
  },
  {
    id: "daily_small_habit",
    title: () => "One idea, in your own words",
    body: () => "That's the whole habit. Ninety seconds is enough to find out what you really understand.",
  },
];

const RISK_TEMPLATES: Template[] = [
  {
    id: "risk_ends_midnight",
    title: ({ streak }) => `Your ${streak}-day streak ends at midnight`,
    body: () => "One 90-second explanation keeps it alive.",
  },
  {
    id: "risk_topic_tonight",
    title: () => "Still time tonight",
    body: ({ topic, streak }) => `${topic} Explain it before midnight to keep your ${streak}-day streak.`,
  },
];

const FAREWELL: Template = {
  id: "farewell_pause",
  title: () => "We'll pause your reminders",
  body: () => "They don't seem to be helping right now. Your progress is safe, and Fey will be here when you're curious again.",
};

function chooseTemplate(templates: Template[], ctx: TemplateContext, lastTemplate: string | null, seed: string): Template {
  const eligible = templates.filter((t) => !t.when || t.when(ctx));
  const fresh = eligible.filter((t) => t.id !== lastTemplate);
  const pool = fresh.length > 0 ? fresh : eligible;
  return pool[hash(seed) % pool.length];
}

function render(t: Template, ctx: TemplateContext, kind: ReminderKind): ReminderPayload {
  return {
    title: t.title(ctx),
    body: t.body(ctx),
    url: "/",
    tag: kind === "streak_risk" ? "fey-streak" : "fey-daily",
    template: t.id,
  };
}

/** Deterministic 10% holdout group for scheduled reminders (never blocks social pushes). */
export function isInReminderHoldout(endpoint: string): boolean {
  return hash(`holdout:${endpoint}`) % 10 === 0;
}

// ─── Planner ───────────────────────────────────────────────────────────────

export function planReminder(row: PushSubscriptionRow, now: Date): ReminderPlan | null {
  if (row.paused_at) return null;
  if (isInReminderHoldout(row.endpoint)) return null;

  const tz = row.timezone || "Africa/Lagos";
  const local = localParts(now, tz);

  if (local.minutes < QUIET_END_MIN || local.minutes >= QUIET_START_MIN) return null;
  if (sameLocalDay(row.last_practiced_at, local.date, tz)) return null;
  if (row.last_sent_at && now.getTime() - new Date(row.last_sent_at).getTime() < MIN_GAP_MS) return null;

  const dailySentToday = sameLocalDay(row.last_daily_sent_at, local.date, tz);
  const riskSentToday = sameLocalDay(row.last_risk_sent_at, local.date, tz);
  const lastPracticedDate = row.last_practiced_at ? localParts(new Date(row.last_practiced_at), tz).date : null;
  const streakAlive = row.streak > 0 && lastPracticedDate === previousDate(local.date);

  const topic = pickTopicForReminder(row, local.date).text;
  const ctx: TemplateContext = { topic, streak: row.streak };
  const seed = `${row.endpoint}:${local.date}`;

  // 1. Streak at risk (evening window)
  if (streakAlive && !riskSentToday && local.minutes >= RISK_WINDOW_START_MIN) {
    const t = chooseTemplate(RISK_TEMPLATES, ctx, row.last_template, seed);
    const minutesToMidnight = 24 * 60 - local.minutes;
    return {
      kind: "streak_risk",
      payload: render(t, ctx, "streak_risk"),
      ttlSeconds: Math.max(600, minutesToMidnight * 60),
      urgency: "high",
    };
  }

  // 2. Daily reminder at the user's habit time
  const inDailyWindow =
    local.minutes >= row.reminder_minutes && local.minutes < row.reminder_minutes + DAILY_WINDOW_MIN;
  if (!dailySentToday && !riskSentToday && inDailyWindow) {
    if (row.consecutive_ignored >= MAX_IGNORED_BEFORE_PAUSE) {
      return { kind: "farewell", payload: render(FAREWELL, ctx, "farewell"), ttlSeconds: 6 * 3600, urgency: "normal" };
    }
    const t = chooseTemplate(DAILY_TEMPLATES, ctx, row.last_template, seed);
    return { kind: "daily", payload: render(t, ctx, "daily"), ttlSeconds: 4 * 3600, urgency: "normal" };
  }

  return null;
}

/** Column updates to apply after a successful send. */
export function stateAfterSend(row: PushSubscriptionRow, plan: ReminderPlan, now: Date) {
  const ignoredLast =
    Boolean(row.last_sent_at) &&
    (!row.last_practiced_at || new Date(row.last_practiced_at) < new Date(row.last_sent_at as string));
  const nowIso = now.toISOString();
  return {
    last_sent_at: nowIso,
    last_template: plan.payload.template,
    consecutive_ignored: ignoredLast ? row.consecutive_ignored + 1 : 0,
    ...(plan.kind === "streak_risk" ? { last_risk_sent_at: nowIso } : { last_daily_sent_at: nowIso }),
    ...(plan.kind === "farewell" ? { paused_at: nowIso } : {}),
  };
}
