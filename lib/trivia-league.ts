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
  dailyBreakdown: Record<number, { score: number; points: number; date: string }>;
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
    if (catPool.length >= durationDays * questionsPerDay) {
      pool = catPool;
    }
  }

  if (difficulty !== "mixed") {
    const diffPool = pool.filter((q) => q.difficulty === difficulty);
    if (diffPool.length >= durationDays * questionsPerDay) {
      pool = diffPool;
    }
  }

  // Deterministic or random shuffle
  const rng = seedKey ? createSeededRandom(seedKey) : Math.random;
  const shuffled = [...pool].sort(() => rng() - 0.5);
  const totalNeeded = durationDays * questionsPerDay;
  const selected = shuffled.slice(0, totalNeeded);

  const dailyMap: Record<string, string[]> = {};
  for (let day = 1; day <= durationDays; day++) {
    const start = (day - 1) * questionsPerDay;
    const end = start + questionsPerDay;
    dailyMap[`day_${day}`] = selected.slice(start, end).map((q) => q.id);
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
 */
export function aggregateLeagueLeaderboard(
  scores: LeagueDailyScore[],
  currentDayNumber: number
): LeagueLeaderboardEntry[] {
  const playerMap = new Map<string, LeagueLeaderboardEntry>();

  for (const s of scores) {
    const key = s.userId || s.username.toLowerCase();
    let entry = playerMap.get(key);
    if (!entry) {
      entry = {
        userId: s.userId || s.username,
        username: s.username,
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
    }

    entry.totalPoints += s.points;
    entry.totalCorrect += s.score;
    entry.totalQuestions += s.totalQuestions;
    entry.daysCompleted += 1;
    entry.dailyBreakdown[s.dayNumber] = {
      score: s.score,
      points: s.points,
      date: s.date,
    };

    if (s.dayNumber === currentDayNumber) {
      entry.completedToday = true;
      entry.todayScore = s.score;
      entry.todayPoints = s.points;
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
  const qIds = league.dailySeedMap[`day_${dayNumber}`] || [];
  const qMap = new Map(TRIVIA_QUESTIONS.map((q) => [q.id, q]));
  const questions: TriviaQuestion[] = [];

  for (const id of qIds) {
    const q = qMap.get(id);
    if (q) questions.push(q);
  }

  return questions;
}

/**
 * Retrieve all leagues saved in this browser's localStorage.
 */
export function getAllLocalLeagues(): FriendshipLeague[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("fey_recent_leagues");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const leagues: FriendshipLeague[] = [];

    // Handles array of codes or array of objects
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const code = typeof item === "string" ? item : item.code;
        if (!code) continue;
        const leagueRaw = localStorage.getItem(`fey_league_${code.toUpperCase()}`);
        if (leagueRaw) {
          try {
            const leagueObj = JSON.parse(leagueRaw);
            if (leagueObj && leagueObj.code) {
              leagues.push(leagueObj);
            }
          } catch {}
        } else if (typeof item === "object" && item.title) {
          leagues.push(item as FriendshipLeague);
        }
      }
    }
    return leagues;
  } catch {
    return [];
  }
}

/**
 * Persist league locally.
 */
export function saveLocalLeague(league: FriendshipLeague) {
  if (typeof window === "undefined" || !league?.code) return;
  try {
    const code = league.code.toUpperCase();
    localStorage.setItem(`fey_league_${code}`, JSON.stringify(league));
    const recentRaw = localStorage.getItem("fey_recent_leagues");
    const recent: string[] = recentRaw ? JSON.parse(recentRaw) : [];
    if (!recent.includes(code)) {
      localStorage.setItem("fey_recent_leagues", JSON.stringify([code, ...recent].slice(0, 15)));
    }
  } catch {}
}

/**
 * Remove league from local storage.
 */
export function removeLocalLeague(code: string) {
  if (typeof window === "undefined" || !code) return;
  try {
    const cleanCode = code.toUpperCase();
    localStorage.removeItem(`fey_league_${cleanCode}`);
    localStorage.removeItem(`fey_league_scores_${cleanCode}`);
    const recentRaw = localStorage.getItem("fey_recent_leagues");
    if (recentRaw) {
      const recent: any[] = JSON.parse(recentRaw);
      const filtered = recent.filter((item) => (typeof item === "string" ? item : item.code) !== cleanCode);
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

  const keyMatch = (s: LeagueDailyScore) =>
    (s.userId && s.userId === userId) ||
    (s.username && s.username.toLowerCase() === username.toLowerCase());

  const userLeaderboardEntry = leaderboard.find(
    (e) => (userId && e.userId === userId) || (username && e.username.toLowerCase() === username.toLowerCase())
  );

  const todayScoreRow = scores.find((s) => s.dayNumber === status.dayNumber && keyMatch(s));

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
    userRank,
    userTotalPoints,
    userTotalCorrect,
    userDaysCompleted,
  };
}
