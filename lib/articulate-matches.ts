import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { calculateMatchPlayTime, type ArticulateRoom } from "@/lib/articulate-room";

/**
 * Articulate match ledger.
 *
 * `articulate_rooms` holds ONE mutable row per room, and "Play Again" (reset_game) wipes the
 * match clock. To get a durable all-time "hours played" figure we append one row per finished
 * match into `articulate_matches`, keyed by (room_code, started_at) so retries/double writes upsert.
 *
 * Totals = logged matches + any match still sitting in a room that was never logged
 * (in-progress, abandoned, or finished before this ledger existed — i.e. the backfill).
 */

export const ARTICULATE_MILESTONES_HOURS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

type TeamKey = "teamA" | "teamB" | "teamC" | "teamD";
const TEAM_KEYS: TeamKey[] = ["teamA", "teamB", "teamC", "teamD"];

interface TeamLike {
  name?: string;
  score?: number;
  playerIds?: string[];
}

type TeamsContainer = Partial<Record<TeamKey, TeamLike>> & {
  match_started_at?: string;
  match_ended_at?: string;
  goal_reached_at?: string;
  active_play_seconds?: number;
  last_activity_at?: string;
};

function collectPlayerIds(teams: TeamsContainer | null | undefined): string[] {
  const ids = new Set<string>();
  for (const k of TEAM_KEYS) {
    const list = teams?.[k]?.playerIds;
    if (Array.isArray(list)) list.forEach((id: string) => id && ids.add(id));
  }
  return Array.from(ids);
}

function teamScores(teams: TeamsContainer | null | undefined): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const k of TEAM_KEYS) {
    const t = teams?.[k];
    if (t) scores[t.name || k] = Number(t.score) || 0;
  }
  return scores;
}

function winnerName(teams: TeamsContainer | null | undefined): string | null {
  let best: { name: string; score: number } | null = null;
  let tie = false;
  for (const k of TEAM_KEYS) {
    const t = teams?.[k];
    if (!t) continue;
    const score = Number(t.score) || 0;
    if (!best || score > best.score) {
      best = { name: t.name || k, score };
      tie = false;
    } else if (score === best.score) {
      tie = true;
    }
  }
  return best && !tie && best.score > 0 ? best.name : null;
}

/**
 * Persist the room's current match into the ledger. Safe to call multiple times for the same
 * match (finish_game, then reset_game): the latest numbers win. Never throws.
 */
export async function logArticulateMatch(room: ArticulateRoom, reason: "finished" | "reset"): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  if (!room.match_started_at) return; // lobby only, nothing played

  const playerIds = collectPlayerIds(room.teams);
  const totalScore = Object.values(teamScores(room.teams)).reduce((a, b) => a + b, 0);
  const rounds = room.current_turn?.roundNumber || 0;
  if (rounds === 0 && totalScore === 0) return; // started then immediately abandoned

  const { seconds } = calculateMatchPlayTime(room);
  const playerCount = Math.max(1, playerIds.length);

  try {
    const { error } = await supabase.from("articulate_matches").upsert(
      [
        {
          room_code: room.room_code,
          room_name: room.room_name || null,
          host_name: room.host_name || null,
          started_at: room.match_started_at,
          ended_at: room.match_ended_at || room.last_activity_at || new Date().toISOString(),
          play_seconds: seconds,
          player_count: playerCount,
          player_seconds: seconds * playerCount,
          player_ids: playerIds,
          rounds,
          team_scores: teamScores(room.teams),
          winner: winnerName(room.teams),
          timer_seconds: room.settings?.timerSeconds || 45,
          end_reason: reason,
        },
      ],
      { onConflict: "room_code,started_at" }
    );
    if (error) console.warn("articulate_matches upsert warning:", error.message);
  } catch (err) {
    console.warn("articulate_matches upsert failed:", err);
  }
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export interface ArticulateStats {
  gameHours: number;
  playerHours: number;
  matches: number;
  roomsWithPlay: number;
  avgMatchMinutes: number;
  avgPlayers: number;
  last7Days: { gameHours: number; playerHours: number; matches: number };
  breakdown: {
    loggedMatches: number;
    unloggedRoomMatches: number;
    estimatedLegacyMatches: number;
  };
  milestone: { previous: number; next: number; progressPct: number };
  ledgerReady: boolean;
  generatedAt: string;
}

const PAGE = 1000;

async function fetchAll<T>(table: string, columns: string): Promise<{ rows: T[]; error: string | null }> {
  if (!supabase) return { rows: [], error: "Supabase not configured" };
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + PAGE - 1);
    if (error) return { rows, error: error.message };
    rows.push(...((data as unknown as T[]) || []));
    if (!data || data.length < PAGE) break;
  }
  return { rows, error: null };
}

function milestoneFor(hours: number) {
  let previous = 0;
  let next = ARTICULATE_MILESTONES_HOURS[ARTICULATE_MILESTONES_HOURS.length - 1];
  for (const m of ARTICULATE_MILESTONES_HOURS) {
    if (hours >= m) previous = m;
    else {
      next = m;
      break;
    }
  }
  if (hours >= next) next = previous * 2;
  const span = next - previous || 1;
  return { previous, next, progressPct: Math.min(100, Math.round(((hours - previous) / span) * 1000) / 10) };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

interface LedgerRow {
  room_code: string;
  started_at: string;
  ended_at?: string | null;
  play_seconds?: number | null;
  player_count?: number | null;
}

interface RoomRow {
  room_code: string;
  status?: ArticulateRoom["status"];
  settings?: ArticulateRoom["settings"];
  teams?: TeamsContainer | null;
  current_turn?: ArticulateRoom["current_turn"];
  active_players?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export async function getArticulateStats(): Promise<ArticulateStats> {
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;

  let gameSec = 0;
  let playerSec = 0;
  let matches = 0;
  let playersSum = 0;
  let wkGame = 0;
  let wkPlayer = 0;
  let wkMatches = 0;
  const rooms = new Set<string>();
  const breakdown = { loggedMatches: 0, unloggedRoomMatches: 0, estimatedLegacyMatches: 0 };

  const add = (code: string, sec: number, players: number, whenIso?: string) => {
    gameSec += sec;
    playerSec += sec * players;
    matches += 1;
    playersSum += players;
    rooms.add(code);
    if (whenIso && new Date(whenIso).getTime() >= weekAgo) {
      wkGame += sec;
      wkPlayer += sec * players;
      wkMatches += 1;
    }
  };

  // 1. Logged matches (durable ledger)
  const ledger = await fetchAll<LedgerRow>(
    "articulate_matches",
    "room_code, started_at, ended_at, play_seconds, player_count"
  );
  const ledgerReady = ledger.error === null;
  const loggedKeys = new Set<string>();
  for (const m of ledger.rows) {
    const key = `${m.room_code}|${new Date(m.started_at).toISOString()}`;
    loggedKeys.add(key);
    add(
      m.room_code,
      Number(m.play_seconds) || 0,
      Math.max(1, Number(m.player_count) || 1),
      m.ended_at || m.started_at
    );
    breakdown.loggedMatches += 1;
  }

  // 2. Matches still living inside room rows (in progress / abandoned / pre-ledger backfill)
  const roomRes = await fetchAll<RoomRow>(
    "articulate_rooms",
    "room_code, status, settings, teams, current_turn, active_players, created_at, updated_at"
  );
  for (const r of roomRes.rows) {
    const t: TeamsContainer = r.teams || {};
    const totalScore = TEAM_KEYS.reduce((s, k) => s + (Number(t?.[k]?.score) || 0), 0);
    const hasMatch = Boolean(t.match_started_at);
    const legacyPlayed = !hasMatch && (totalScore > 0 || (r.status && r.status !== "lobby"));
    if (!hasMatch && !legacyPlayed) continue;

    if (hasMatch && t.match_started_at) {
      const key = `${r.room_code}|${new Date(t.match_started_at).toISOString()}`;
      if (loggedKeys.has(key)) continue;
    }

    const partial: Partial<ArticulateRoom> = {
      status: r.status,
      settings: r.settings,
      teams: t as unknown as ArticulateRoom["teams"],
      current_turn: r.current_turn,
      match_started_at: t.match_started_at,
      match_ended_at: t.match_ended_at,
      goal_reached_at: t.goal_reached_at,
      active_play_seconds: t.active_play_seconds,
      last_activity_at: t.last_activity_at,
      updated_at: r.updated_at,
    };
    const { seconds } = calculateMatchPlayTime(partial);
    const ids = collectPlayerIds(t);
    const players = Math.max(1, ids.length || (Array.isArray(r.active_players) ? r.active_players.length : 1));
    add(r.room_code, seconds, players, t.last_activity_at || r.updated_at);
    if (hasMatch) breakdown.unloggedRoomMatches += 1;
    else breakdown.estimatedLegacyMatches += 1;
  }

  const gameHours = gameSec / 3600;
  const playerHours = playerSec / 3600;

  return {
    gameHours: round1(gameHours),
    playerHours: round1(playerHours),
    matches,
    roomsWithPlay: rooms.size,
    avgMatchMinutes: matches ? round1(gameSec / matches / 60) : 0,
    avgPlayers: matches ? round1(playersSum / matches) : 0,
    last7Days: { gameHours: round1(wkGame / 3600), playerHours: round1(wkPlayer / 3600), matches: wkMatches },
    breakdown,
    milestone: milestoneFor(playerHours),
    ledgerReady,
    generatedAt: new Date().toISOString(),
  };
}
