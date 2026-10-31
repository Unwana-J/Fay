import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getArticulateStats, type ArticulateStats } from "@/lib/articulate-matches";
import { calculateMatchPlayTime, type ArticulateRoom } from "@/lib/articulate-room";

export type AdminRange = "7d" | "30d" | "all";

export interface GameEngagementSummary {
  game: "articulate" | "trivia" | "mathletics" | "sprint";
  label: string;
  playerHours: number;
  gameHours: number;
  prevPlayerHours: number | null;
  deltaPct: number | null;
  sessions: number;
  avgMinutes: number;
  uniquePlayers: number;
  exactSharePct: number;
  note?: string;
}

export interface DailyActivityPoint {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Oct 25"
  totalHours: number;
  sessions: number;
  byGame: {
    articulate: number;
    trivia: number;
    mathletics: number;
    sprint: number;
  };
}

export interface TopScholarRow {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  isRegistered: boolean;
  isBanned: boolean;
  xp: number;
  streakCurrent: number;
  streakLongest: number;
  totalHours: number;
  totalSessions: number;
  hoursByGame: {
    sprint: number;
    trivia: number;
    mathletics: number;
    articulate: number;
  };
  sessionsByGame: {
    sprint: number;
    trivia: number;
    mathletics: number;
    articulate: number;
  };
  triviaAccuracyPct: number | null;
  triviaPoints: number;
  mathleticsPoints: number;
  lastActiveIso: string | null;
}

export interface CategoryBreakdownItem {
  category: string;
  sessions: number;
  hours: number;
}

export interface AdminEngagementData {
  range: AdminRange;
  supabaseConnected: boolean;
  totals: {
    playerHours: number;
    gameHours: number;
    prevPlayerHours: number | null;
    hoursDeltaPct: number | null;
    totalSessions: number;
    prevSessions: number | null;
    sessionsDeltaPct: number | null;
    activePlayersInRange: number;
    activeToday: number;
    newScholarsThisWeek: number;
  };
  games: GameEngagementSummary[];
  articulateMilestone: ArticulateStats;
  dailyTrend: DailyActivityPoint[];
  topScholars: TopScholarRow[];
  topCategories: CategoryBreakdownItem[];
}

const PAGE = 1000;
const GENERIC_NAMES = new Set(["player", "scholar", "guest", "learner", "anonymous", "user", "host"]);

async function fetchAllRows<T>(table: string, columns: string): Promise<T[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select(columns).range(from, from + PAGE - 1);
    if (error || !data) break;
    rows.push(...(data as unknown as T[]));
    if (data.length < PAGE) break;
  }
  return rows;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function computeDeltaPct(current: number, prev: number | null): number | null {
  if (prev === null) return null;
  if (prev <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 100);
}

function normalizeName(name?: string | null): string | null {
  if (!name || typeof name !== "string") return null;
  const clean = name.trim().toLowerCase();
  if (!clean || GENERIC_NAMES.has(clean)) return null;
  return clean;
}

interface RawProfileRow {
  id: string;
  username?: string | null;
  email?: string | null;
  avatar?: string | null;
  xp?: number | null;
  streak?: { current?: number; longest?: number } | null;
  is_banned?: boolean | null;
  is_deactivated?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface RawSprintRow {
  user_id?: string | null;
  category?: string | null;
  research_minutes?: number | null;
  speaking_seconds?: number | null;
  xp_earned?: number | null;
  created_at?: string | null;
}

interface RawTriviaScoreRow {
  username?: string | null;
  avatar?: string | null;
  score?: number | null;
  total?: number | null;
  pct?: number | null;
  xp_earned?: number | null;
  device_id?: string | null;
  duration_seconds?: number | null;
  created_at?: string | null;
}

interface RawLeagueScoreRow {
  user_id?: string | null;
  username?: string | null;
  avatar?: string | null;
  score?: number | null;
  total_questions?: number | null;
  points?: number | null;
  duration_seconds?: number | null;
  created_at?: string | null;
}

interface RawMathScoreRow {
  user_id?: string | null;
  username?: string | null;
  avatar?: string | null;
  score?: number | null;
  total_questions?: number | null;
  points?: number | null;
  agility_score?: number | null;
  duration_seconds?: number | null;
  created_at?: string | null;
}

interface RawArticulateMatchRow {
  room_code: string;
  host_name?: string | null;
  started_at: string;
  ended_at?: string | null;
  play_seconds?: number | null;
  player_count?: number | null;
  player_ids?: string[] | null;
}

interface RawArticulateRoomRow {
  room_code: string;
  host_id?: string | null;
  host_name?: string | null;
  status?: string | null;
  settings?: { timerSeconds?: number; scoreGoal?: number } | null;
  teams?: Record<string, unknown> | null;
  current_turn?: { roundNumber?: number } | null;
  active_players?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export async function getAdminEngagement(range: AdminRange = "all"): Promise<AdminEngagementData> {
  const nowMs = Date.now();
  const dayMs = 24 * 3600 * 1000;
  const windowDays = range === "7d" ? 7 : range === "30d" ? 30 : null;
  const currentStartMs = windowDays ? nowMs - windowDays * dayMs : 0;
  const prevStartMs = windowDays ? nowMs - windowDays * 2 * dayMs : null;

  const [
    articulateMilestone,
    profiles,
    sprints,
    triviaScores,
    leagueScores,
    mathScores,
    articulateMatches,
    articulateRooms,
  ] = await Promise.all([
    getArticulateStats(),
    fetchAllRows<RawProfileRow>(
      "user_profiles",
      "id, username, email, avatar, xp, streak, is_banned, is_deactivated, created_at, updated_at"
    ),
    fetchAllRows<RawSprintRow>(
      "completed_sessions",
      "user_id, category, research_minutes, speaking_seconds, xp_earned, created_at"
    ),
    fetchAllRows<RawTriviaScoreRow>(
      "trivia_scores",
      "username, avatar, score, total, pct, xp_earned, device_id, created_at"
    ),
    fetchAllRows<RawLeagueScoreRow>(
      "league_scores",
      "user_id, username, avatar, score, total_questions, points, duration_seconds, created_at"
    ),
    fetchAllRows<RawMathScoreRow>(
      "mathletics_scores",
      "user_id, username, avatar, score, total_questions, points, agility_score, duration_seconds, created_at"
    ),
    fetchAllRows<RawArticulateMatchRow>(
      "articulate_matches",
      "room_code, host_name, started_at, ended_at, play_seconds, player_count, player_ids"
    ),
    fetchAllRows<RawArticulateRoomRow>(
      "articulate_rooms",
      "room_code, host_id, host_name, status, settings, teams, current_turn, active_players, created_at, updated_at"
    ),
  ]);

  // ─── Scholar Identity Resolution ───────────────────────────────────────────
  const scholarMap = new Map<
    string,
    TopScholarRow & { _triviaCorrect: number; _triviaTotal: number; _earnedXpSum: number }
  >();
  const nameToCanonicalId = new Map<string, string>();

  const ensureScholar = (
    rawId?: string | null,
    rawName?: string | null,
    avatar?: string | null
  ): (TopScholarRow & { _triviaCorrect: number; _triviaTotal: number; _earnedXpSum: number }) | null => {
    const normName = normalizeName(rawName);
    const cleanId = rawId?.trim() || null;

    if (cleanId && scholarMap.has(cleanId)) {
      const existing = scholarMap.get(cleanId)!;
      if (normName && GENERIC_NAMES.has(existing.username.toLowerCase())) {
        existing.username = rawName!.trim();
      }
      if (normName && !nameToCanonicalId.has(normName)) {
        nameToCanonicalId.set(normName, existing.id);
      }
      return existing;
    }

    if (normName && nameToCanonicalId.has(normName)) {
      const targetId = nameToCanonicalId.get(normName)!;
      const existing = scholarMap.get(targetId)!;
      if (cleanId && !scholarMap.has(cleanId)) {
        scholarMap.set(cleanId, existing);
      }
      return existing;
    }

    if (!cleanId && !normName) return null;

    const canonicalId = cleanId || `scholar:${normName}`;
    const entry: TopScholarRow & { _triviaCorrect: number; _triviaTotal: number; _earnedXpSum: number } = {
      id: canonicalId,
      username: rawName?.trim() || "Scholar",
      avatar: avatar || "/avatars/avatar-scholar.svg",
      isRegistered: false,
      isBanned: false,
      xp: 0,
      streakCurrent: 0,
      streakLongest: 0,
      totalHours: 0,
      totalSessions: 0,
      hoursByGame: { sprint: 0, trivia: 0, mathletics: 0, articulate: 0 },
      sessionsByGame: { sprint: 0, trivia: 0, mathletics: 0, articulate: 0 },
      triviaAccuracyPct: null,
      triviaPoints: 0,
      mathleticsPoints: 0,
      lastActiveIso: null,
      _triviaCorrect: 0,
      _triviaTotal: 0,
      _earnedXpSum: 0,
    };

    scholarMap.set(canonicalId, entry);
    if (normName) nameToCanonicalId.set(normName, canonicalId);
    return entry;
  };

  const bumpLastActive = (
    scholar: { lastActiveIso: string | null },
    iso?: string | null
  ) => {
    if (!iso) return;
    const t = new Date(iso).getTime();
    if (!Number.isFinite(t)) return;
    if (!scholar.lastActiveIso || t > new Date(scholar.lastActiveIso).getTime()) {
      scholar.lastActiveIso = new Date(t).toISOString();
    }
  };

  let newScholarsThisWeek = 0;
  const weekAgoMs = nowMs - 7 * dayMs;

  for (const p of profiles) {
    const s = ensureScholar(p.id, p.username, p.avatar);
    if (!s) continue;
    s.email = p.email || undefined;
    s.isRegistered = Boolean(p.email);
    s.isBanned = Boolean(p.is_banned);
    s.xp = Math.max(s.xp, Number(p.xp) || 0);
    s.streakCurrent = Math.max(s.streakCurrent, Number(p.streak?.current) || 0);
    s.streakLongest = Math.max(s.streakLongest, Number(p.streak?.longest) || 0);
    bumpLastActive(s, p.updated_at || p.created_at);
    if (p.created_at && new Date(p.created_at).getTime() >= weekAgoMs) {
      newScholarsThisWeek += 1;
    }
  }

  // ─── Daily 14-day Trend Buckets ────────────────────────────────────────────
  const dailyMap = new Map<string, DailyActivityPoint>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(nowMs - i * dayMs);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dailyMap.set(key, {
      date: key,
      label,
      totalHours: 0,
      sessions: 0,
      byGame: { articulate: 0, trivia: 0, mathletics: 0, sprint: 0 },
    });
  }

  // Per-game accumulators for selected range & previous period
  type Bucket = {
    playerSec: number;
    gameSec: number;
    prevPlayerSec: number;
    sessions: number;
    prevSessions: number;
    exactSessions: number;
    players: Set<string>;
  };

  const buckets: Record<"articulate" | "trivia" | "mathletics" | "sprint", Bucket> = {
    articulate: { playerSec: 0, gameSec: 0, prevPlayerSec: 0, sessions: 0, prevSessions: 0, exactSessions: 0, players: new Set() },
    trivia: { playerSec: 0, gameSec: 0, prevPlayerSec: 0, sessions: 0, prevSessions: 0, exactSessions: 0, players: new Set() },
    mathletics: { playerSec: 0, gameSec: 0, prevPlayerSec: 0, sessions: 0, prevSessions: 0, exactSessions: 0, players: new Set() },
    sprint: { playerSec: 0, gameSec: 0, prevPlayerSec: 0, sessions: 0, prevSessions: 0, exactSessions: 0, players: new Set() },
  };

  const activePlayersInRange = new Set<string>();
  const activeTodaySet = new Set<string>();
  const todayMidnightMs = nowMs - dayMs;
  const categoryMap = new Map<string, { sessions: number; seconds: number }>();

  const recordEvent = (
    game: "articulate" | "trivia" | "mathletics" | "sprint",
    whenIso: string | null | undefined,
    gameSec: number,
    playerSec: number,
    isExact: boolean,
    playerKeys: string[]
  ) => {
    const ts = whenIso ? new Date(whenIso).getTime() : nowMs;
    const validTs = Number.isFinite(ts) ? ts : nowMs;
    const dayKey = new Date(validTs).toISOString().slice(0, 10);

    const dayBucket = dailyMap.get(dayKey);
    if (dayBucket) {
      const hrs = playerSec / 3600;
      dayBucket.totalHours = round1(dayBucket.totalHours + hrs);
      dayBucket.sessions += 1;
      dayBucket.byGame[game] = round1(dayBucket.byGame[game] + hrs);
    }

    if (validTs >= todayMidnightMs) {
      playerKeys.forEach((k) => k && activeTodaySet.add(k));
    }

    const b = buckets[game];
    if (validTs >= currentStartMs) {
      b.gameSec += gameSec;
      b.playerSec += playerSec;
      b.sessions += 1;
      if (isExact) b.exactSessions += 1;
      playerKeys.forEach((k) => {
        if (k) {
          b.players.add(k);
          activePlayersInRange.add(k);
        }
      });
    } else if (prevStartMs !== null && validTs >= prevStartMs && validTs < currentStartMs) {
      b.prevPlayerSec += playerSec;
      b.prevSessions += 1;
    }
  };

  // 1. Solo Sprints (completed_sessions)
  for (const sp of sprints) {
    const sec = Math.max(
      30,
      (Number(sp.research_minutes) || 0) * 60 + (Number(sp.speaking_seconds) || 0)
    );
    const ts = sp.created_at ? new Date(sp.created_at).getTime() : nowMs;
    const inRange = !Number.isFinite(ts) || ts >= currentStartMs;

    const scholar = ensureScholar(sp.user_id, null, null);
    const pKey = scholar?.id || sp.user_id || "";
    recordEvent("sprint", sp.created_at, sec, sec, true, pKey ? [pKey] : []);

    if (scholar && inRange) {
      scholar.hoursByGame.sprint += sec / 3600;
      scholar.totalHours += sec / 3600;
      scholar.sessionsByGame.sprint += 1;
      scholar.totalSessions += 1;
      scholar._earnedXpSum += Number(sp.xp_earned) || 0;
      bumpLastActive(scholar, sp.created_at);
    }

    if (sp.category && inRange) {
      const cat = sp.category.trim();
      const prev = categoryMap.get(cat) || { sessions: 0, seconds: 0 };
      prev.sessions += 1;
      prev.seconds += sec;
      categoryMap.set(cat, prev);
    }
  }

  // 2. Trivia League Rounds (exact duration_seconds)
  for (const ls of leagueScores) {
    const totalQ = Math.max(1, Number(ls.total_questions) || 5);
    const hasExact = typeof ls.duration_seconds === "number" && ls.duration_seconds > 0;
    const sec = hasExact ? Math.min(1800, Math.max(5, Number(ls.duration_seconds))) : totalQ * 18;
    const ts = ls.created_at ? new Date(ls.created_at).getTime() : nowMs;
    const inRange = !Number.isFinite(ts) || ts >= currentStartMs;

    const scholar = ensureScholar(ls.user_id, ls.username, ls.avatar);
    const pKey = scholar?.id || ls.user_id || normalizeName(ls.username) || "";
    recordEvent("trivia", ls.created_at, sec, sec, hasExact, pKey ? [pKey] : []);

    if (scholar && inRange) {
      scholar.hoursByGame.trivia += sec / 3600;
      scholar.totalHours += sec / 3600;
      scholar.sessionsByGame.trivia += 1;
      scholar.totalSessions += 1;
      scholar._triviaCorrect += Number(ls.score) || 0;
      scholar._triviaTotal += totalQ;
      scholar.triviaPoints += Number(ls.points) || 0;
      bumpLastActive(scholar, ls.created_at);
    }
  }

  // 3. Trivia Solo / Challenge Rounds (trivia_scores)
  for (const tsRow of triviaScores) {
    const totalQ = Math.max(1, Number(tsRow.total) || 10);
    const hasExact = typeof tsRow.duration_seconds === "number" && tsRow.duration_seconds > 0;
    const sec = hasExact ? Math.min(1800, Math.max(5, Number(tsRow.duration_seconds))) : totalQ * 18;
    const ts = tsRow.created_at ? new Date(tsRow.created_at).getTime() : nowMs;
    const inRange = !Number.isFinite(ts) || ts >= currentStartMs;

    const scholar = ensureScholar(tsRow.device_id, tsRow.username, tsRow.avatar);
    const pKey = scholar?.id || tsRow.device_id || normalizeName(tsRow.username) || "";
    recordEvent("trivia", tsRow.created_at, sec, sec, hasExact, pKey ? [pKey] : []);

    if (scholar && inRange) {
      scholar.hoursByGame.trivia += sec / 3600;
      scholar.totalHours += sec / 3600;
      scholar.sessionsByGame.trivia += 1;
      scholar.totalSessions += 1;
      scholar._triviaCorrect += Number(tsRow.score) || 0;
      scholar._triviaTotal += totalQ;
      scholar._earnedXpSum += Number(tsRow.xp_earned) || 0;
      bumpLastActive(scholar, tsRow.created_at);
    }
  }

  // 4. Mathletics Rounds (exact duration_seconds)
  for (const ms of mathScores) {
    const totalQ = Math.max(1, Number(ms.total_questions) || 10);
    const hasExact = typeof ms.duration_seconds === "number" && ms.duration_seconds > 0;
    const sec = hasExact ? Math.min(1800, Math.max(5, Number(ms.duration_seconds))) : totalQ * 15;
    const ts = ms.created_at ? new Date(ms.created_at).getTime() : nowMs;
    const inRange = !Number.isFinite(ts) || ts >= currentStartMs;

    const scholar = ensureScholar(ms.user_id, ms.username, ms.avatar);
    const pKey = scholar?.id || ms.user_id || normalizeName(ms.username) || "";
    recordEvent("mathletics", ms.created_at, sec, sec, hasExact, pKey ? [pKey] : []);

    if (scholar && inRange) {
      scholar.hoursByGame.mathletics += sec / 3600;
      scholar.totalHours += sec / 3600;
      scholar.sessionsByGame.mathletics += 1;
      scholar.totalSessions += 1;
      scholar.mathleticsPoints += Number(ms.points || ms.agility_score) || 0;
      bumpLastActive(scholar, ms.created_at);
    }
  }

  // 5. Articulate Matches (ledger + unlogged room rows)
  // Build a map of player_details from rooms so player_ids in articulate_matches can resolve to names
  const roomPlayerDetails = new Map<string, { name: string; avatar?: string }>();
  for (const r of articulateRooms) {
    const details = (r.teams as Record<string, unknown> | null)?.player_details as
      | Record<string, { name?: string; avatar?: string }>
      | undefined;
    if (details && typeof details === "object") {
      for (const [pid, info] of Object.entries(details)) {
        if (info?.name) roomPlayerDetails.set(pid, { name: info.name, avatar: info.avatar });
      }
    }
  }

  const loggedRoomMatches = new Set<string>();
  for (const m of articulateMatches) {
    const key = `${m.room_code}|${new Date(m.started_at).toISOString()}`;
    loggedRoomMatches.add(key);
    const sec = Math.max(1, Number(m.play_seconds) || 0);
    const pCount = Math.max(1, Number(m.player_count) || 1);
    const whenIso = m.ended_at || m.started_at;
    const ts = whenIso ? new Date(whenIso).getTime() : nowMs;
    const inRange = !Number.isFinite(ts) || ts >= currentStartMs;

    const pKeys: string[] = [];
    const ids = Array.isArray(m.player_ids) ? m.player_ids : [];
    for (const pid of ids) {
      const detail = roomPlayerDetails.get(pid);
      const scholar = ensureScholar(pid, detail?.name, detail?.avatar);
      if (scholar) {
        pKeys.push(scholar.id);
        if (inRange) {
          scholar.hoursByGame.articulate += sec / 3600;
          scholar.totalHours += sec / 3600;
          scholar.sessionsByGame.articulate += 1;
          scholar.totalSessions += 1;
          bumpLastActive(scholar, whenIso);
        }
      }
    }
    if (pKeys.length === 0 && m.host_name) {
      const hostScholar = ensureScholar(null, m.host_name, null);
      if (hostScholar) {
        pKeys.push(hostScholar.id);
        if (inRange) {
          hostScholar.hoursByGame.articulate += sec / 3600;
          hostScholar.totalHours += sec / 3600;
          hostScholar.sessionsByGame.articulate += 1;
          hostScholar.totalSessions += 1;
          bumpLastActive(hostScholar, whenIso);
        }
      }
    }

    recordEvent("articulate", whenIso, sec, sec * pCount, true, pKeys);
  }

  for (const r of articulateRooms) {
    const t = (r.teams || {}) as Record<string, unknown>;
    const teamKeys = ["teamA", "teamB", "teamC", "teamD"] as const;
    const totalScore = teamKeys.reduce((sum, k) => {
      const teamObj = t[k] as { score?: number } | undefined;
      return sum + (Number(teamObj?.score) || 0);
    }, 0);
    const matchStartedAt = typeof t.match_started_at === "string" ? t.match_started_at : undefined;
    const hasMatch = Boolean(matchStartedAt);
    const legacyPlayed = !hasMatch && (totalScore > 0 || (r.status && r.status !== "lobby"));
    if (!hasMatch && !legacyPlayed) continue;

    if (hasMatch && matchStartedAt) {
      const key = `${r.room_code}|${new Date(matchStartedAt).toISOString()}`;
      if (loggedRoomMatches.has(key)) continue;
    }

    const partial: Partial<ArticulateRoom> = {
      status: (r.status as ArticulateRoom["status"]) || "lobby",
      settings: r.settings as ArticulateRoom["settings"],
      teams: t as unknown as ArticulateRoom["teams"],
      current_turn: r.current_turn as ArticulateRoom["current_turn"],
      match_started_at: matchStartedAt,
      match_ended_at: typeof t.match_ended_at === "string" ? t.match_ended_at : undefined,
      goal_reached_at: typeof t.goal_reached_at === "string" ? t.goal_reached_at : undefined,
      active_play_seconds: typeof t.active_play_seconds === "number" ? t.active_play_seconds : undefined,
      last_activity_at: typeof t.last_activity_at === "string" ? t.last_activity_at : undefined,
      updated_at: r.updated_at || undefined,
    };

    const { seconds } = calculateMatchPlayTime(partial);
    const idSet = new Set<string>();
    for (const k of teamKeys) {
      const teamObj = t[k] as { playerIds?: string[] } | undefined;
      if (Array.isArray(teamObj?.playerIds)) {
        teamObj.playerIds.forEach((id) => id && idSet.add(id));
      }
    }
    const pCount = Math.max(
      1,
      idSet.size || (Array.isArray(r.active_players) ? r.active_players.length : 1)
    );
    const whenIso =
      (typeof t.last_activity_at === "string" ? t.last_activity_at : undefined) ||
      r.updated_at ||
      r.created_at;
    const ts = whenIso ? new Date(whenIso).getTime() : nowMs;
    const inRange = !Number.isFinite(ts) || ts >= currentStartMs;

    const pKeys: string[] = [];
    for (const pid of idSet) {
      const detail = roomPlayerDetails.get(pid);
      const scholar = ensureScholar(pid, detail?.name, detail?.avatar);
      if (scholar) {
        pKeys.push(scholar.id);
        if (inRange) {
          scholar.hoursByGame.articulate += seconds / 3600;
          scholar.totalHours += seconds / 3600;
          scholar.sessionsByGame.articulate += 1;
          scholar.totalSessions += 1;
          bumpLastActive(scholar, whenIso);
        }
      }
    }
    if (pKeys.length === 0 && r.host_name) {
      const hostScholar = ensureScholar(r.host_id, r.host_name, null);
      if (hostScholar) {
        pKeys.push(hostScholar.id);
        if (inRange) {
          hostScholar.hoursByGame.articulate += seconds / 3600;
          hostScholar.totalHours += seconds / 3600;
          hostScholar.sessionsByGame.articulate += 1;
          hostScholar.totalSessions += 1;
          bumpLastActive(hostScholar, whenIso);
        }
      }
    }

    recordEvent("articulate", whenIso, seconds, seconds * pCount, hasMatch, pKeys);
  }

  // ─── Build Per-Game Summaries ──────────────────────────────────────────────
  const buildSummary = (
    key: "articulate" | "trivia" | "mathletics" | "sprint",
    label: string,
    note?: string
  ): GameEngagementSummary => {
    const b = buckets[key];
    const playerHours = round1(b.playerSec / 3600);
    const gameHours = round1(b.gameSec / 3600);
    const prevPlayerHours = prevStartMs !== null ? round1(b.prevPlayerSec / 3600) : null;
    const exactSharePct = b.sessions > 0 ? Math.round((b.exactSessions / b.sessions) * 100) : 100;
    return {
      game: key,
      label,
      playerHours,
      gameHours,
      prevPlayerHours,
      deltaPct: computeDeltaPct(playerHours, prevPlayerHours),
      sessions: b.sessions,
      avgMinutes: b.sessions > 0 ? round1(b.gameSec / b.sessions / 60) : 0,
      uniquePlayers: b.players.size,
      exactSharePct,
      note,
    };
  };

  const games: GameEngagementSummary[] = [
    buildSummary(
      "articulate",
      "Articulate (Online Rooms)",
      "Player hours count every active player in the match."
    ),
    buildSummary(
      "trivia",
      "Naija Trivia & Leagues",
      "Combines multi-day leagues and solo/challenge quizzes."
    ),
    buildSummary("mathletics", "Mathletics", "Timed mental math duels and marathons."),
    buildSummary(
      "sprint",
      "Feynman Vocal Sprints",
      "Deep reading + 90-second vocal synthesis sessions."
    ),
  ];

  const totalPlayerSec =
    buckets.articulate.playerSec +
    buckets.trivia.playerSec +
    buckets.mathletics.playerSec +
    buckets.sprint.playerSec;
  const totalGameSec =
    buckets.articulate.gameSec +
    buckets.trivia.gameSec +
    buckets.mathletics.gameSec +
    buckets.sprint.gameSec;
  const prevTotalPlayerSec =
    buckets.articulate.prevPlayerSec +
    buckets.trivia.prevPlayerSec +
    buckets.mathletics.prevPlayerSec +
    buckets.sprint.prevPlayerSec;
  const totalSessions =
    buckets.articulate.sessions +
    buckets.trivia.sessions +
    buckets.mathletics.sessions +
    buckets.sprint.sessions;
  const prevTotalSessions =
    buckets.articulate.prevSessions +
    buckets.trivia.prevSessions +
    buckets.mathletics.prevSessions +
    buckets.sprint.prevSessions;

  const playerHours = round1(totalPlayerSec / 3600);
  const gameHours = round1(totalGameSec / 3600);
  const prevPlayerHours = prevStartMs !== null ? round1(prevTotalPlayerSec / 3600) : null;
  const prevSessions = prevStartMs !== null ? prevTotalSessions : null;

  // Finalize scholar rows
  const topScholars: TopScholarRow[] = Array.from(new Set(scholarMap.values()))
    .map((s) => {
      const accuracy =
        s._triviaTotal > 0 ? Math.round((s._triviaCorrect / s._triviaTotal) * 100) : null;
      return {
        id: s.id,
        username: s.username,
        email: s.email,
        avatar: s.avatar,
        isRegistered: s.isRegistered,
        isBanned: s.isBanned,
        xp: Math.max(s.xp, s._earnedXpSum),
        streakCurrent: s.streakCurrent,
        streakLongest: s.streakLongest,
        totalHours: round1(s.totalHours),
        totalSessions: s.totalSessions,
        hoursByGame: {
          sprint: round1(s.hoursByGame.sprint),
          trivia: round1(s.hoursByGame.trivia),
          mathletics: round1(s.hoursByGame.mathletics),
          articulate: round1(s.hoursByGame.articulate),
        },
        sessionsByGame: s.sessionsByGame,
        triviaAccuracyPct: accuracy,
        triviaPoints: s.triviaPoints,
        mathleticsPoints: s.mathleticsPoints,
        lastActiveIso: s.lastActiveIso,
      };
    })
    .filter((s) => s.totalSessions > 0 || s.xp > 0 || s.isRegistered)
    .sort((a, b) => b.totalHours - a.totalHours || b.xp - a.xp);

  const topCategories: CategoryBreakdownItem[] = Array.from(categoryMap.entries())
    .map(([category, v]) => ({
      category,
      sessions: v.sessions,
      hours: round1(v.seconds / 3600),
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 6);

  return {
    range,
    supabaseConnected: isSupabaseConfigured,
    totals: {
      playerHours,
      gameHours,
      prevPlayerHours,
      hoursDeltaPct: computeDeltaPct(playerHours, prevPlayerHours),
      totalSessions,
      prevSessions,
      sessionsDeltaPct: computeDeltaPct(totalSessions, prevSessions),
      activePlayersInRange: activePlayersInRange.size,
      activeToday: activeTodaySet.size,
      newScholarsThisWeek,
    },
    games,
    articulateMilestone,
    dailyTrend: Array.from(dailyMap.values()),
    topScholars: topScholars.slice(0, 30),
    topCategories,
  };
}
