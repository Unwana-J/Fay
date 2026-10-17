import { TRIVIA_QUESTIONS, type TriviaQuestion, type TriviaCategory, type TriviaDifficulty } from "@/lib/trivia-questions";
import { daysBetween, todayStr } from "@/lib/utils";

export interface FriendshipLeague {
  id?: string;
  code: string;
  title: string;
  creatorName: string;
  creatorId: string;
  durationDays: number; // 3, 5, 7, 14
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  questionsPerDay: number; // 5 or 10
  difficulty: string; // "mixed" | "easy" | "medium" | "hard"
  category: string; // "all" | TriviaCategory
  dailySeedMap: Record<string, string[]>; // { "day_1": ["h001", ...], "day_2": [...] }
  createdAt?: string;
  attemptPolicy?: "flexible" | "strict" | "unlimited";
  allowUnlimitedDrops?: boolean;
}

export interface LeagueDailyScore {
  id?: string;
  leagueCode: string;
  userId: string;
  username: string;
  avatar: string;
  dayNumber: number; // 1-indexed
  date: string; // YYYY-MM-DD
  score: number; // correct count
  totalQuestions: number;
  points: number; // score * 100 + speed bonus
  durationSeconds: number;
  questionResults?: Array<{ questionId: string; correct: boolean; selected: number }>;
  createdAt?: string;
}

export interface LeagueLeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  totalPoints: number;
  totalCorrect: number;
  totalQuestions: number;
  daysCompleted: number;
  completedToday: boolean;
  todayScore?: number;
  todayPoints?: number;
  rank: number;
  dailyBreakdown: Record<number, { score: number; points: number; totalQuestions?: number; date: string }>;
}

/**
 * Deterministic PRNG based on string seed.
 */
function createSeededRandom(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function () {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate distinct question IDs for each day of a multi-day league.
 * Deterministically keyed by seedKey (code) so all players get identical questions on identical days.
 */
export function generateDailyLeagueQuestions(
  durationDays: number,
  questionsPerDay: number,
  difficulty: string = "mixed",
  category: string = "all",
  seedKey?: string
): Record<string, string[]> {
  let pool = [...TRIVIA_QUESTIONS];

  if (category !== "all") {
    const catPool = pool.filter((q) => q.category.toLowerCase() === category.toLowerCase());
    if (catPool.length > 0) {
      pool = catPool;
    }
  }

  if (difficulty !== "mixed") {
    const diffPool = pool.filter((q) => q.difficulty === difficulty);
    if (diffPool.length > 0) {
      pool = diffPool;
    }
  }

  // Deterministic shuffle keyed by seedKey (league code)
  const rng = seedKey ? createSeededRandom(seedKey) : Math.random;
  const shuffled = [...pool].sort(() => rng() - 0.5);

  const dailyMap: Record<string, string[]> = {};
  for (let day = 1; day <= durationDays; day++) {
    const dayQuestions: string[] = [];
    for (let q = 0; q < questionsPerDay; q++) {
      // Modulo wrap-around guarantees every single question in the pool is exhausted before cycling
      const index = ((day - 1) * questionsPerDay + q) % shuffled.length;
      dayQuestions.push(shuffled[index].id);
    }
    dailyMap[`day_${day}`] = dayQuestions;
  }

  return dailyMap;
}

/**
 * Calculate the current status and day number of a league.
 */
export function getLeagueStatus(
  startDate: string,
  durationDays: number,
  currentDateStr: string = todayStr()
): {
  dayNumber: number;
  isUpcoming: boolean;
  isActive: boolean;
  isCompleted: boolean;
  daysRemaining: number;
} {
  const daysDiff = daysBetween(startDate, currentDateStr);

  if (daysDiff < 0) {
    return {
      dayNumber: 0,
      isUpcoming: true,
      isActive: false,
      isCompleted: false,
      daysRemaining: durationDays,
    };
  }

  const currentDay = daysDiff + 1;

  if (currentDay > durationDays) {
    return {
      dayNumber: durationDays,
      isUpcoming: false,
      isActive: false,
      isCompleted: true,
      daysRemaining: 0,
    };
  }

  return {
    dayNumber: currentDay,
    isUpcoming: false,
    isActive: true,
    isCompleted: false,
    daysRemaining: durationDays - currentDay,
  };
}

/**
 * Calculate points for a daily round:
 * 100 points per correct answer + speed multiplier based on average time per question.
 */
export function calculateLeaguePoints(
  score: number,
  totalQuestions: number,
  durationSeconds: number
): number {
  if (score <= 0) return 0;
  const basePoints = score * 100;
  const avgSeconds = durationSeconds / (totalQuestions || 1);

  // Speed bonus: up to 50 extra points per correct question if answered swiftly under 8 seconds
  let speedMultiplier = 0;
  if (avgSeconds <= 4) {
    speedMultiplier = 50;
  } else if (avgSeconds <= 8) {
    speedMultiplier = 30;
  } else if (avgSeconds <= 12) {
    speedMultiplier = 15;
  }

  return basePoints + (score * speedMultiplier);
}

/**
 * Aggregate individual score rows into a ranked leaderboard.
 * Deduplicates multiple scores by scholar username and ensures each tournament day
 * is only counted once per scholar (taking their best attempt if duplicates exist).
 */
export function aggregateLeagueLeaderboard(
  scores: LeagueDailyScore[],
  currentDayNumber: number
): LeagueLeaderboardEntry[] {
  const playerMap = new Map<string, LeagueLeaderboardEntry>();

  for (const s of scores) {
    const rawName = (s.username || "").trim();
    // Normalize scholar key by username first, falling back to userId
    const key = rawName ? rawName.toLowerCase() : (s.userId || "scholar").trim().toLowerCase();

    let entry = playerMap.get(key);
    if (!entry) {
      entry = {
        userId: s.userId || key,
        username: rawName || s.userId || "Scholar",
        avatar: s.avatar || "/avatars/avatar-scholar.svg",
        totalPoints: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        daysCompleted: 0,
        completedToday: false,
        rank: 0,
        dailyBreakdown: {},
      };
      playerMap.set(key, entry);
    } else {
      // Retain preferred avatar if available
      if ((!entry.avatar || entry.avatar === "/avatars/avatar-scholar.svg") && s.avatar && s.avatar !== "/avatars/avatar-scholar.svg") {
        entry.avatar = s.avatar;
      }
      if (s.userId && (!entry.userId || s.userId.length > entry.userId.length)) {
        entry.userId = s.userId;
      }
    }

    // Deduplicate by dayNumber - retain the best attempt for each day
    const existingDay = entry.dailyBreakdown[s.dayNumber];
    if (!existingDay) {
      entry.dailyBreakdown[s.dayNumber] = {
        score: s.score,
        points: s.points,
        totalQuestions: s.totalQuestions || 5,
        date: s.date,
      };
    } else if (s.points > existingDay.points || (s.points === existingDay.points && s.score > existingDay.score)) {
      entry.dailyBreakdown[s.dayNumber] = {
        score: s.score,
        points: s.points,
        totalQuestions: s.totalQuestions || existingDay.totalQuestions,
        date: s.date,
      };
    }
  }

  // Calculate cumulative stats strictly from distinct daily entries
  for (const entry of playerMap.values()) {
    const dailyEntries = Object.entries(entry.dailyBreakdown);
    entry.daysCompleted = dailyEntries.length;
    entry.totalPoints = dailyEntries.reduce((sum, [, d]) => sum + d.points, 0);
    entry.totalCorrect = dailyEntries.reduce((sum, [, d]) => sum + d.score, 0);
    entry.totalQuestions = dailyEntries.reduce((sum, [, d]) => sum + (d.totalQuestions || 0), 0);

    const todayRecord = entry.dailyBreakdown[currentDayNumber];
    if (todayRecord) {
      entry.completedToday = true;
      entry.todayScore = todayRecord.score;
      entry.todayPoints = todayRecord.points;
    } else {
      entry.completedToday = false;
    }
  }

  const entries = Array.from(playerMap.values());

  // Sort by Total Points DESC, then Total Correct DESC, then daysCompleted DESC
  entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.totalCorrect !== a.totalCorrect) return b.totalCorrect - a.totalCorrect;
    return b.daysCompleted - a.daysCompleted;
  });

  // Assign ranks
  entries.forEach((e, idx) => {
    e.rank = idx + 1;
  });

  return entries;
}

/**
 * Get the full question objects for a given day in the league.
 */
export function getQuestionsForLeagueDay(
  league: FriendshipLeague,
  dayNumber: number
): TriviaQuestion[] {
  let qIds = league.dailySeedMap?.[`day_${dayNumber}`];

  // If questions for this day are not yet in the seed map (e.g. extra drops added on the fly),
  // generate deterministic questions from the league-wide sequence to prevent duplicate recycling
  if (!qIds || qIds.length === 0) {
    const seed = league.code || "LEAGUE";
    const generatedMap = generateDailyLeagueQuestions(
      dayNumber,
      league.questionsPerDay || 5,
      league.difficulty || "mixed",
      league.category || "all",
      seed
    );
    qIds = generatedMap[`day_${dayNumber}`] || [];
    if (league.dailySeedMap) {
      league.dailySeedMap[`day_${dayNumber}`] = qIds;
    }
  }

  const qMap = new Map(TRIVIA_QUESTIONS.map((q) => [q.id, q]));
  const questions: TriviaQuestion[] = [];

  for (const id of qIds) {
    const q = qMap.get(id);
    if (q) questions.push(q);
  }

  return questions;
}

/**
 * Retrieve codes of leagues deleted or removed on this client.
 */
export function getDeletedLocalLeagues(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("fey_deleted_leagues");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Record a league as deleted on this client so cloud fetches do not resurrect it.
 */
export function markLocalLeagueDeleted(code: string) {
  if (typeof window === "undefined" || !code) return;
  try {
    const clean = code.toUpperCase();
    const list = getDeletedLocalLeagues();
    if (!list.includes(clean)) {
      localStorage.setItem("fey_deleted_leagues", JSON.stringify([...list, clean].slice(-100)));
    }
  } catch {}
}

/**
 * Unmark a league as deleted (e.g. when explicitly joined or re-created).
 */
export function unmarkLocalLeagueDeleted(code: string) {
  if (typeof window === "undefined" || !code) return;
  try {
    const clean = code.toUpperCase();
    const list = getDeletedLocalLeagues().filter((c) => c !== clean);
    localStorage.setItem("fey_deleted_leagues", JSON.stringify(list));
  } catch {}
}

/**
 * Retrieve all leagues saved in this browser's localStorage.
 * Checks direct fey_league_* keys and fey_recent_leagues for full persistence.
 * Filters out any leagues that were deleted locally.
 */
export function getAllLocalLeagues(): FriendshipLeague[] {
  if (typeof window === "undefined") return [];
  try {
    const codeMap = new Map<string, FriendshipLeague>();
    const deletedList = getDeletedLocalLeagues();

    // 1. Scan direct fey_league_* entries in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("fey_league_") && !key.startsWith("fey_league_scores_")) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.code) {
              const upper = parsed.code.toUpperCase();
              if (!deletedList.includes(upper)) {
                codeMap.set(upper, parsed);
              }
            }
          }
        } catch {}
      }
    }

    // 2. Also check fey_recent_leagues
    const raw = localStorage.getItem("fey_recent_leagues");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const rawCode = typeof item === "string" ? item : item?.code;
            const code = rawCode ? rawCode.toUpperCase() : null;
            if (code && !deletedList.includes(code) && !codeMap.has(code)) {
              const leagueRaw = localStorage.getItem(`fey_league_${code}`);
              if (leagueRaw) {
                try {
                  const leagueObj = JSON.parse(leagueRaw);
                  if (leagueObj && leagueObj.code) {
                    codeMap.set(code, leagueObj);
                  }
                } catch {}
              } else if (typeof item === "object" && item.title) {
                codeMap.set(code, item as FriendshipLeague);
              }
            }
          }
        }
      } catch {}
    }

    return Array.from(codeMap.values());
  } catch {
    return [];
  }
}

/**
 * Persist league locally.
 * If force is false and the league has been marked deleted, it will be skipped.
 */
export function saveLocalLeague(league: FriendshipLeague, force: boolean = false) {
  if (typeof window === "undefined" || !league?.code) return;
  try {
    const code = league.code.toUpperCase();
    if (!force) {
      const deletedList = getDeletedLocalLeagues();
      if (deletedList.includes(code)) return;
    } else {
      unmarkLocalLeagueDeleted(code);
    }

    localStorage.setItem(`fey_league_${code}`, JSON.stringify(league));
    const recentRaw = localStorage.getItem("fey_recent_leagues");
    const recent: any[] = recentRaw ? JSON.parse(recentRaw) : [];
    const cleanList = recent.map((item) => (typeof item === "string" ? item.toUpperCase() : item?.code?.toUpperCase())).filter(Boolean);
    if (!cleanList.includes(code)) {
      localStorage.setItem("fey_recent_leagues", JSON.stringify([code, ...cleanList].slice(0, 20)));
    }
  } catch {}
}

/**
 * Build a robust share URL with complete parameters so any team member
 * opening the link will see the complete arena even if not yet saved on their device.
 */
export function getLeagueShareUrl(league: FriendshipLeague): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://fey.lokinlabs.com.ng";
  const params = new URLSearchParams({
    t: league.title || "Friendship League",
    c: league.creatorName || "Scholar",
    d: String(league.durationDays || 5),
    q: String(league.questionsPerDay || 5),
    cat: league.category || "all",
    diff: league.difficulty || "mixed",
  });
  if (league.attemptPolicy) {
    params.set("pol", league.attemptPolicy);
  }
  return `${origin}/games/trivia/league/${league.code.toUpperCase()}?${params.toString()}`;
}

/**
 * Remove league from local storage and record in deleted list.
 */
export function removeLocalLeague(code: string) {
  if (typeof window === "undefined" || !code) return;
  try {
    const cleanCode = code.toUpperCase();
    markLocalLeagueDeleted(cleanCode);
    localStorage.removeItem(`fey_league_${cleanCode}`);
    localStorage.removeItem(`fey_league_scores_${cleanCode}`);
    const recentRaw = localStorage.getItem("fey_recent_leagues");
    if (recentRaw) {
      const recent: any[] = JSON.parse(recentRaw);
      const filtered = recent.filter((item) => {
        const itemCode = typeof item === "string" ? item.toUpperCase() : item?.code?.toUpperCase();
        return itemCode !== cleanCode;
      });
      localStorage.setItem("fey_recent_leagues", JSON.stringify(filtered));
    }
  } catch {}
}

/**
 * Retrieve stored scores for a league from localStorage.
 */
export function getLocalLeagueScores(code: string): LeagueDailyScore[] {
  if (typeof window === "undefined" || !code) return [];
  try {
    const raw = localStorage.getItem(`fey_league_scores_${code.toUpperCase()}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Compute comprehensive status & user progress for a league.
 */
export function computeUserLeagueSummary(
  league: FriendshipLeague,
  userId: string,
  username: string,
  scoresOverride?: LeagueDailyScore[]
) {
  const status = getLeagueStatus(league.startDate, league.durationDays);
  const scores = scoresOverride ?? getLocalLeagueScores(league.code);
  const leaderboard = aggregateLeagueLeaderboard(scores, status.dayNumber);

  const cleanName = (username || "").trim().toLowerCase();
  const keyMatch = (s: LeagueDailyScore) =>
    (cleanName && (s.username || "").trim().toLowerCase() === cleanName) ||
    (userId && s.userId === userId);

  const userLeaderboardEntry = leaderboard.find(
    (e) => (cleanName && (e.username || "").trim().toLowerCase() === cleanName) || (userId && e.userId === userId)
  );

  const todayScoreRows = scores.filter((s) => s.dayNumber === status.dayNumber && keyMatch(s));
  const todayScoreRow = todayScoreRows[0] || undefined;

  const hasCompletedToday = !!todayScoreRow;
  const userRank = userLeaderboardEntry?.rank ?? leaderboard.length + 1;
  const userTotalPoints = userLeaderboardEntry?.totalPoints ?? 0;
  const userTotalCorrect = userLeaderboardEntry?.totalCorrect ?? 0;
  const userDaysCompleted = userLeaderboardEntry?.daysCompleted ?? 0;

  return {
    status,
    scores,
    leaderboard,
    hasCompletedToday,
    todayScore: todayScoreRow?.score,
    todayPoints: todayScoreRow?.points,
    todayTotalQuestions: todayScoreRow?.totalQuestions ?? league.questionsPerDay,
    todayAttemptsCount: todayScoreRows.length,
    userRank,
    userTotalPoints,
    userTotalCorrect,
    userDaysCompleted,
  };
}
