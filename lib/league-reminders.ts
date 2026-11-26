import { supabase } from "@/lib/supabase";
import { getLeagueStatus } from "@/lib/trivia-league";
import { localParts, QUIET_START_MIN, type PushSubscriptionRow } from "@/lib/reminder-rules";
import { sendPushToRow, type PushPayload } from "@/lib/push-sender";
import { todayStr } from "@/lib/utils";

/**
 * Scheduled daily drop reminders for active multi-day leagues (strict / flexible).
 * Called by /api/push/cron alongside daily practice reminders.
 *
 * Rules:
 * - Only runs for auto-scheduled leagues (attemptPolicy "strict" or "flexible") on Day 2+.
 * - Skips players who already submitted today's drop.
 * - Sends at most 1 scheduled league drop reminder per user per local day, between 09:00 and 22:00.
 * - Does NOT affect practice reminder counters or back-off state.
 */

const LEAGUE_REMINDER_START_MIN = 9 * 60;
const SEND_CONCURRENCY = 25;

interface ActiveLeagueCandidate {
  code: string;
  title: string;
  dayNumber: number;
  questionsPerDay: number;
  url: string;
  participantIds: Set<string>;
  completedTodayIds: Set<string>;
}

export interface LeagueCronRow extends PushSubscriptionRow {
  last_league_sent_at?: string | null;
}

export interface LeagueDispatchSummary {
  leaguesScanned: number;
  planned: number;
  sent: number;
  expired: number;
  failed: number;
  preview?: Array<{ id: string; leagueCode: string; title: string; body: string }>;
}

function sameLocalDay(iso: string | null | undefined, today: string, tz: string): boolean {
  return Boolean(iso) && localParts(new Date(iso as string), tz).date === today;
}

async function loadActiveAutoLeagues(today: string): Promise<ActiveLeagueCandidate[]> {
  if (!supabase) return [];

  const { data: rows, error } = await supabase
    .from("friendship_leagues")
    .select("code, title, creator_id, start_date, end_date, duration_days, questions_per_day, category, daily_seed_map")
    .lte("start_date", today)
    .gte("end_date", today)
    .limit(150);

  if (error || !rows || rows.length === 0) return [];

  const eligible: Array<{
    code: string;
    title: string;
    creatorId: string;
    dayNumber: number;
    questionsPerDay: number;
    url: string;
  }> = [];

  for (const row of rows as any[]) {
    const cat = String(row.category || "").toLowerCase();
    if (cat === "classroom") continue;

    const policy = String(row.daily_seed_map?._policy || "flexible");
    // Host-controlled leagues send instant pushes when the host unlocks; unlimited has no daily drops.
    if (policy !== "flexible" && policy !== "strict") continue;

    const duration = Number(row.duration_days) || 5;
    const status = getLeagueStatus(row.start_date, duration, today);
    if (!status.isActive || status.dayNumber < 2 || status.dayNumber > duration) continue;

    const isMath = cat === "mathletics";
    eligible.push({
      code: String(row.code),
      title: String(row.title || (isMath ? "Quant Arena League" : "Trivia League")),
      creatorId: String(row.creator_id || ""),
      dayNumber: status.dayNumber,
      questionsPerDay: Number(row.questions_per_day) || 5,
      url: isMath ? `/games/mathletics/league/${row.code}` : `/games/trivia/league/${row.code}`,
    });
  }

  if (eligible.length === 0) return [];

  const codes = eligible.map((l) => l.code);
  const { data: scoreRows } = await supabase
    .from("league_scores")
    .select("league_code, user_id, day_number")
    .in("league_code", codes)
    .gt("day_number", 0)
    .limit(2000);

  const byCode = new Map<string, { participants: Set<string>; byDay: Map<number, Set<string>> }>();
  for (const l of eligible) {
    const participants = new Set<string>();
    if (l.creatorId && l.creatorId !== "anonymous") participants.add(l.creatorId);
    byCode.set(l.code, { participants, byDay: new Map() });
  }

  for (const s of (scoreRows || []) as Array<{ league_code: string; user_id?: string | null; day_number: number }>) {
    const bucket = byCode.get(s.league_code);
    if (!bucket) continue;
    const baseUid = String(s.user_id || "").split("__ext_")[0].trim();
    if (!baseUid || baseUid.startsWith("__")) continue;
    bucket.participants.add(baseUid);
    if (!bucket.byDay.has(s.day_number)) bucket.byDay.set(s.day_number, new Set());
    bucket.byDay.get(s.day_number)!.add(baseUid);
  }

  return eligible.map((l) => {
    const bucket = byCode.get(l.code)!;
    return {
      code: l.code,
      title: l.title,
      dayNumber: l.dayNumber,
      questionsPerDay: l.questionsPerDay,
      url: l.url,
      participantIds: bucket.participants,
      completedTodayIds: bucket.byDay.get(l.dayNumber) ?? new Set<string>(),
    };
  });
}

export async function dispatchScheduledLeagueDrops(
  rows: LeagueCronRow[],
  now: Date,
  dryRun: boolean
): Promise<LeagueDispatchSummary> {
  const empty: LeagueDispatchSummary = { leaguesScanned: 0, planned: 0, sent: 0, expired: 0, failed: 0 };
  if (!supabase || rows.length === 0) return empty;

  const today = todayStr();
  const leagues = await loadActiveAutoLeagues(today);
  if (leagues.length === 0) return empty;

  // Map userId -> first active league where they still need to play today's drop
  const userToLeague = new Map<string, ActiveLeagueCandidate>();
  for (const league of leagues) {
    for (const uid of league.participantIds) {
      if (league.completedTodayIds.has(uid)) continue;
      if (!userToLeague.has(uid)) userToLeague.set(uid, league);
    }
  }

  if (userToLeague.size === 0) {
    return { ...empty, leaguesScanned: leagues.length };
  }

  const jobs: Array<{ row: LeagueCronRow; league: ActiveLeagueCandidate; payload: PushPayload }> = [];

  for (const row of rows) {
    if (!row.user_id) continue;
    const league = userToLeague.get(row.user_id);
    if (!league) continue;

    const tz = row.timezone || "Africa/Lagos";
    const local = localParts(now, tz);
    if (local.minutes < LEAGUE_REMINDER_START_MIN || local.minutes >= QUIET_START_MIN) continue;
    if (sameLocalDay(row.last_league_sent_at, local.date, tz)) continue;

    jobs.push({
      row,
      league,
      payload: {
        title: `Drop ${league.dayNumber} is open`,
        body: `${league.title} — ${league.questionsPerDay} questions waiting for your score.`,
        url: league.url,
        tag: `fey-league-drop-${league.code}-d${league.dayNumber}`,
        template: "scheduled_league_drop",
        renotify: true,
      },
    });
  }

  if (dryRun) {
    return {
      leaguesScanned: leagues.length,
      planned: jobs.length,
      sent: 0,
      expired: 0,
      failed: 0,
      preview: jobs.map(({ row, league, payload }) => ({
        id: row.id,
        leagueCode: league.code,
        title: payload.title,
        body: payload.body,
      })),
    };
  }

  const tally = { sent: 0, expired: 0, failed: 0 };
  const nowIso = now.toISOString();

  for (let i = 0; i < jobs.length; i += SEND_CONCURRENCY) {
    const batch = jobs.slice(i, i + SEND_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async ({ row, payload }) => {
        const outcome = await sendPushToRow(row, payload, { ttlSeconds: 10 * 3600, urgency: "normal" });
        if (outcome === "sent") {
          // Best-effort stamp (safe even if 20261127 migration hasn't been run yet)
          await supabase!.from("push_subscriptions").update({ last_league_sent_at: nowIso }).eq("id", row.id);
        }
        return outcome;
      })
    );
    for (const outcome of results) tally[outcome] += 1;
  }

  return {
    leaguesScanned: leagues.length,
    planned: jobs.length,
    ...tally,
  };
}
