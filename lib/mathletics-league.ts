import {
  MATHLETICS_QUESTIONS,
  type MathleticsQuestion,
  type MathleticsCategory,
  type MathleticsDifficultyFilter,
} from "@/lib/mathletics-questions";
import { daysBetween, todayStr } from "@/lib/utils";

export interface MathleticsLeague {
  id?: string;
  code: string;
  title: string;
  creatorName: string;
  creatorId: string;
  format: "sprint_duel" | "marathon"; // sprint_duel = 1 round; marathon = 3-14 days
  durationDays: number; // 1 for Sprint Duel, 3/5/7/14 for Marathon
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  questionsPerDay: number; // always 10 for Mathletics
  difficulty: MathleticsDifficultyFilter; // "random" | "easy" | "medium" | "hard"
  category: "all" | MathleticsCategory;
  dailySeedMap: Record<string, string[]>; // { "day_1": ["m_arith_001", ...] }
  attemptPolicy: "once" | "flexible" | "strict" | "host_controlled";
  unlockedUpToDay?: number;
  questionTimerSeconds: number; // always 25 for Mathletics
  createdAt?: string;
}

export interface MathleticsLeagueScore {
  id?: string;
  leagueCode: string;
  userId: string;
  username: string;
  avatar: string;
  dayNumber: number; // 1-indexed (always 1 for sprint_duel)
  date: string; // YYYY-MM-DD
  score: number; // correct count (0 to 10)
  totalQuestions: number; // 10
  agilityScore: number; // score * 100 + speed bonus
  points: number; // alias for agilityScore for leaderboard compatibility
  durationSeconds: number;
  questionResults?: Array<{
    questionId: string;
    correct: boolean;
    selected: number;
    timeSpentSeconds?: number;
  }>;
  createdAt?: string;
}

export interface MathleticsLeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  totalPoints: number; // cumulative agilityScore
  totalCorrect: number;
  totalQuestions: number;
  daysCompleted: number;
  completedToday: boolean;
  todayScore?: number;
  todayPoints?: number;
  rank: number;
  dailyBreakdown: Record<
    number,
    {
      score: number;
      points: number;
      totalQuestions?: number;
      durationSeconds?: number;
      date: string;
    }
  >;
}

/**
 * Deterministic PRNG based on string seed.
 */
export function createSeededRandom(seedStr: string) {
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
 * Generate distinct question IDs for each day of a Mathletics league.
 * Deterministically keyed by seedKey (code) so all players get identical questions.
 */
export function generateDailyMathleticsQuestions(
  durationDays: number,
  questionsPerDay: number = 10,
  difficulty: MathleticsDifficultyFilter = "random",
  category: "all" | MathleticsCategory = "all",
  seedKey?: string
): Record<string, string[]> {
  let pool = [...MATHLETICS_QUESTIONS];

  if (category !== "all") {
    const catPool = pool.filter((q) => q.category === category);
    if (catPool.length > 0) {
      pool = catPool;
    }
  }

  if (difficulty !== "random") {
    const diffPool = pool.filter((q) => q.difficulty === difficulty);
    if (diffPool.length > 0) {
      pool = diffPool;
    }
  }

  const rng = seedKey ? createSeededRandom(seedKey) : Math.random;
  const shuffled = [...pool].sort(() => rng() - 0.5);

  const dailyMap: Record<string, string[]> = {};
  for (let day = 1; day <= durationDays; day++) {
    const dayQuestions: string[] = [];
    for (let q = 0; q < questionsPerDay; q++) {
      const index = ((day - 1) * questionsPerDay + q) % shuffled.length;
      dayQuestions.push(shuffled[index].id);
    }
    dailyMap[`day_${day}`] = dayQuestions;
  }

  return dailyMap;
}

/**
 * Calculate the current status and day number of a Mathletics league.
 */
export function getMathleticsLeagueStatus(
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
 * Calculate agility points for a sprint round:
 * 100 points per correct answer + speed bonus based on avg seconds per question.
 */
export function calculateMathleticsPoints(
  score: number,
  totalQuestions: number,
  durationSeconds: number
): number {
  if (score <= 0) return 0;
  const basePoints = score * 100;
  const avgSeconds = durationSeconds / (totalQuestions || 1);

  let speedBonus = 0;
  if (avgSeconds <= 4) {
    speedBonus = 50;
  } else if (avgSeconds <= 8) {
    speedBonus = 30;
  } else if (avgSeconds <= 12) {
    speedBonus = 15;
  }

  return basePoints + score * speedBonus;
}

export function normalizeMathleticsScore(s: MathleticsLeagueScore): MathleticsLeagueScore {
  const score = Math.max(0, Math.min(s.score || 0, s.totalQuestions || 10));
  const points = s.agilityScore || s.points || calculateMathleticsPoints(score, s.totalQuestions || 10, s.durationSeconds || 0);
  return {
    ...s,
    score,
    points,
    agilityScore: points,
  };
}

/**
 * Aggregate individual score rows into a ranked leaderboard.
 * Deduplicates multiple attempts by scholar username/userId — retaining best attempt per day.
 * Sorts primarily by Total Points (agility score) DESC, then Total Correct DESC, then daysCompleted DESC.
 */
export function aggregateMathleticsLeaderboard(
  scores: MathleticsLeagueScore[],
  currentDayNumber: number
): MathleticsLeaderboardEntry[] {
  const playerMap = new Map<string, MathleticsLeaderboardEntry>();

  for (const rawScore of scores) {
    if (
      !rawScore ||
      rawScore.dayNumber <= 0 ||
      rawScore.username === "__LEAGUE_SYNC__" ||
      String(rawScore.userId || "").startsWith("__league_sync_")
    ) {
      continue;
    }

    const s = normalizeMathleticsScore(rawScore);
    const rawName = (s.username || "").trim();
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
      if (
        (!entry.avatar || entry.avatar === "/avatars/avatar-scholar.svg") &&
        s.avatar &&
        s.avatar !== "/avatars/avatar-scholar.svg"
      ) {
        entry.avatar = s.avatar;
      }
      if (s.userId && (!entry.userId || s.userId.length > entry.userId.length)) {
        entry.userId = s.userId;
      }
    }

    const existingDay = entry.dailyBreakdown[s.dayNumber];
    if (!existingDay) {
      entry.dailyBreakdown[s.dayNumber] = {
        score: s.score,
        points: s.points,
        totalQuestions: s.totalQuestions || 10,
        durationSeconds: s.durationSeconds,
        date: s.date,
      };
    } else if (
      s.points > existingDay.points ||
      (s.points === existingDay.points && s.score > existingDay.score)
    ) {
      entry.dailyBreakdown[s.dayNumber] = {
        score: s.score,
        points: s.points,
        totalQuestions: s.totalQuestions || existingDay.totalQuestions,
        durationSeconds: s.durationSeconds || existingDay.durationSeconds,
        date: s.date,
      };
    }
  }

  for (const entry of playerMap.values()) {
    const dailyEntries = Object.entries(entry.dailyBreakdown);
    entry.daysCompleted = dailyEntries.length;
    entry.totalPoints = dailyEntries.reduce((sum, [, d]) => sum + d.points, 0);
    entry.totalCorrect = dailyEntries.reduce((sum, [, d]) => sum + d.score, 0);
    entry.totalQuestions = dailyEntries.reduce(
      (sum, [, d]) => sum + (d.totalQuestions || 10),
      0
    );

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

  entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.totalCorrect !== a.totalCorrect) return b.totalCorrect - a.totalCorrect;
    return b.daysCompleted - a.daysCompleted;
  });

  entries.forEach((e, idx) => {
    e.rank = idx + 1;
  });

  return entries;
}

/**
 * Merge base and incoming league states.
 */
export function mergeMathleticsLeagueState(
  base: MathleticsLeague,
  incoming?: Partial<MathleticsLeague> | null
): MathleticsLeague {
  if (!incoming) return base;

  const baseSeed: Record<string, any> = { ...(base.dailySeedMap || {}) };
  const incSeed: Record<string, any> = { ...(incoming.dailySeedMap || {}) };
  const mergedSeed: Record<string, any> = { ...baseSeed, ...incSeed };

  const allKeys = new Set([...Object.keys(baseSeed), ...Object.keys(incSeed)]);
  for (const key of allKeys) {
    if (key.startsWith("day_")) {
      const a = Array.isArray(baseSeed[key]) ? baseSeed[key] : [];
      const b = Array.isArray(incSeed[key]) ? incSeed[key] : [];
      mergedSeed[key] = b.length >= a.length ? b : a;
    }
  }

  const maxDuration = Math.max(Number(base.durationDays) || 1, Number(incoming.durationDays) || 1);
  const maxUnlocked = Math.max(
    Number(base.unlockedUpToDay) || 1,
    Number(incoming.unlockedUpToDay) || 1,
    Number(baseSeed._unlockedUpToDay) || 1,
    Number(incSeed._unlockedUpToDay) || 1
  );

  const policy = incoming.attemptPolicy || base.attemptPolicy || baseSeed._policy || "once";
  const timer = Math.max(
    25,
    Number(incoming.questionTimerSeconds) ||
      Number(base.questionTimerSeconds) ||
      Number(baseSeed._questionTimer) ||
      Number(incSeed._questionTimer) ||
      25
  );
  const format =
    incoming.format ||
    base.format ||
    (maxDuration === 1 ? "sprint_duel" : "marathon");

  mergedSeed._unlockedUpToDay = maxUnlocked;
  mergedSeed._policy = policy;
  mergedSeed._questionTimer = timer;

  return {
    ...base,
    ...incoming,
    code: base.code || incoming.code || "MATHLETICS",
    title: base.title || incoming.title || "Mathletics League",
    creatorName: base.creatorName || incoming.creatorName || "Scholar",
    creatorId: base.creatorId || incoming.creatorId || "creator",
    format,
    durationDays: maxDuration,
    unlockedUpToDay: maxUnlocked,
    attemptPolicy: policy,
    questionTimerSeconds: timer,
    dailySeedMap: mergedSeed,
  };
}

/**
 * Hydrate league object and extract player scores from raw rows.
 */
export function hydrateMathleticsLeagueFromScoreRows(
  baseLeague: MathleticsLeague,
  rawRows: any[]
): { league: MathleticsLeague; scores: MathleticsLeagueScore[] } {
  let updatedLeague = { ...baseLeague };
  const playerScores: MathleticsLeagueScore[] = [];
  let maxScoredDay = 1;

  for (const row of rawRows || []) {
    const isSyncRow =
      row.day_number <= 0 ||
      row.username === "__LEAGUE_SYNC__" ||
      String(row.user_id || "").startsWith("__league_sync_");

    if (isSyncRow) {
      const metaList = Array.isArray(row.question_results)
        ? row.question_results
        : [row.question_results];
      const meta = metaList.find(
        (m: any) =>
          m &&
          (m._syncMeta ||
            m.unlockedUpToDay ||
            m.dailySeedMap ||
            m.durationDays)
      );
      if (meta) {
        updatedLeague = mergeMathleticsLeagueState(updatedLeague, {
          unlockedUpToDay: Number(
            meta.unlockedUpToDay || row.score || updatedLeague.unlockedUpToDay || 1
          ),
          durationDays: Number(
            meta.durationDays || row.total_questions || updatedLeague.durationDays || 1
          ),
          attemptPolicy: meta.attemptPolicy || updatedLeague.attemptPolicy,
          dailySeedMap: meta.dailySeedMap || updatedLeague.dailySeedMap,
        });
      }
      continue;
    }

    const dayNum = Number(row.day_number) || 1;
    if (dayNum > maxScoredDay) {
      maxScoredDay = dayNum;
    }

    playerScores.push(
      normalizeMathleticsScore({
        id: row.id,
        leagueCode: row.league_code,
        userId: row.user_id,
        username: row.username,
        avatar: row.avatar,
        dayNumber: dayNum,
        date: row.date,
        score: row.score,
        totalQuestions: row.total_questions || 10,
        agilityScore: row.agility_score || row.points || 0,
        points: row.points || row.agility_score || 0,
        durationSeconds: row.duration_seconds || 0,
        questionResults: row.question_results || [],
        createdAt: row.created_at,
      })
    );
  }

  const currentUnlocked = Number(
    updatedLeague.unlockedUpToDay ||
      (updatedLeague.dailySeedMap as any)?._unlockedUpToDay ||
      1
  );

  let effectiveUnlocked = Math.max(currentUnlocked, maxScoredDay);
  if (updatedLeague.format === "sprint_duel") {
    effectiveUnlocked = 1;
  } else if (updatedLeague.attemptPolicy === "flexible") {
    effectiveUnlocked = updatedLeague.durationDays;
  }

  updatedLeague.unlockedUpToDay = effectiveUnlocked;
  if (updatedLeague.dailySeedMap) {
    (updatedLeague.dailySeedMap as any)._unlockedUpToDay = effectiveUnlocked;
  }

  return {
    league: updatedLeague,
    scores: playerScores,
  };
}

/**
 * Get question objects for a given day in the league.
 */
export function getQuestionsForMathleticsLeagueDay(
  league: MathleticsLeague,
  dayNumber: number
): MathleticsQuestion[] {
  let qIds = league.dailySeedMap?.[`day_${dayNumber}`];

  if (!qIds || qIds.length === 0) {
    const seed = `${league.code}_D${dayNumber}`;
    const generatedMap = generateDailyMathleticsQuestions(
      dayNumber,
      league.questionsPerDay || 10,
      league.difficulty || "random",
      league.category || "all",
      seed
    );
    qIds = generatedMap[`day_${dayNumber}`] || [];
    if (league.dailySeedMap) {
      league.dailySeedMap[`day_${dayNumber}`] = qIds;
    }
  }

  const qMap = new Map(MATHLETICS_QUESTIONS.map((q) => [q.id, q]));
  const questions: MathleticsQuestion[] = [];

  for (const id of qIds) {
    const q = qMap.get(id);
    if (q) questions.push(q);
  }

  return questions;
}

/**
 * Retrieve codes of leagues deleted locally.
 */
export function getDeletedLocalMathleticsLeagues(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("fey_math_deleted_leagues");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markLocalMathleticsLeagueDeleted(code: string) {
  if (typeof window === "undefined" || !code) return;
  try {
    const clean = code.toUpperCase();
    const list = getDeletedLocalMathleticsLeagues();
    if (!list.includes(clean)) {
      localStorage.setItem("fey_math_deleted_leagues", JSON.stringify([...list, clean].slice(-100)));
    }
  } catch {}
}

export function unmarkLocalMathleticsLeagueDeleted(code: string) {
  if (typeof window === "undefined" || !code) return;
  try {
    const clean = code.toUpperCase();
    const list = getDeletedLocalMathleticsLeagues().filter((c) => c !== clean);
    localStorage.setItem("fey_math_deleted_leagues", JSON.stringify(list));
  } catch {}
}

/**
 * Retrieve all local Mathletics leagues from browser localStorage.
 */
export function getAllLocalMathleticsLeagues(): MathleticsLeague[] {
  if (typeof window === "undefined") return [];
  try {
    const codeMap = new Map<string, MathleticsLeague>();
    const deletedList = getDeletedLocalMathleticsLeagues();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("fey_math_league_") && !key.startsWith("fey_math_league_scores_")) {
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

    const rawRecent = localStorage.getItem("fey_math_recent_leagues");
    if (rawRecent) {
      try {
        const parsed = JSON.parse(rawRecent);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const rawCode = typeof item === "string" ? item : item?.code;
            const code = rawCode ? rawCode.toUpperCase() : null;
            if (code && !deletedList.includes(code) && !codeMap.has(code)) {
              const leagueRaw = localStorage.getItem(`fey_math_league_${code}`);
              if (leagueRaw) {
                try {
                  const leagueObj = JSON.parse(leagueRaw);
                  if (leagueObj && leagueObj.code) {
                    codeMap.set(code, leagueObj);
                  }
                } catch {}
              } else if (typeof item === "object" && item.title) {
                codeMap.set(code, item as MathleticsLeague);
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

export function saveLocalMathleticsLeague(league: MathleticsLeague, force: boolean = false) {
  if (typeof window === "undefined" || !league?.code) return;
  try {
    const code = league.code.toUpperCase();
    if (!force) {
      const deletedList = getDeletedLocalMathleticsLeagues();
      if (deletedList.includes(code)) return;
    } else {
      unmarkLocalMathleticsLeagueDeleted(code);
    }

    localStorage.setItem(`fey_math_league_${code}`, JSON.stringify(league));
    const recentRaw = localStorage.getItem("fey_math_recent_leagues");
    const recent: any[] = recentRaw ? JSON.parse(recentRaw) : [];
    const cleanList = recent
      .map((item) => (typeof item === "string" ? item.toUpperCase() : item?.code?.toUpperCase()))
      .filter(Boolean);
    if (!cleanList.includes(code)) {
      localStorage.setItem("fey_math_recent_leagues", JSON.stringify([code, ...cleanList].slice(0, 20)));
    }
  } catch {}
}

export function removeLocalMathleticsLeague(code: string) {
  if (typeof window === "undefined" || !code) return;
  try {
    const cleanCode = code.toUpperCase();
    markLocalMathleticsLeagueDeleted(cleanCode);
    localStorage.removeItem(`fey_math_league_${cleanCode}`);
    localStorage.removeItem(`fey_math_league_scores_${cleanCode}`);
    const recentRaw = localStorage.getItem("fey_math_recent_leagues");
    if (recentRaw) {
      const recent: any[] = JSON.parse(recentRaw);
      const filtered = recent.filter((item) => {
        const itemCode = typeof item === "string" ? item.toUpperCase() : item?.code?.toUpperCase();
        return itemCode !== cleanCode;
      });
      localStorage.setItem("fey_math_recent_leagues", JSON.stringify(filtered));
    }
  } catch {}
}

export function getLocalMathleticsLeagueScores(code: string): MathleticsLeagueScore[] {
  if (typeof window === "undefined" || !code) return [];
  try {
    const raw = localStorage.getItem(`fey_math_league_scores_${code.toUpperCase()}`);
    const parsed: MathleticsLeagueScore[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeMathleticsScore) : [];
  } catch {
    return [];
  }
}

export function getMathleticsLeagueShareUrl(league: MathleticsLeague): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://fey.lokinlabs.com.ng";
  const params = new URLSearchParams({
    t: league.title || "Mathletics League",
    c: league.creatorName || "Scholar",
    d: String(league.durationDays || 1),
    q: String(league.questionsPerDay || 10),
    cat: league.category || "all",
    diff: league.difficulty || "random",
    fmt: league.format || (league.durationDays === 1 ? "sprint_duel" : "marathon"),
    tim: String(league.questionTimerSeconds || 25),
  });
  if (league.attemptPolicy) {
    params.set("pol", league.attemptPolicy);
  }
  if (league.unlockedUpToDay) {
    params.set("u", String(league.unlockedUpToDay));
  }
  return `${origin}/games/mathletics/league/${league.code.toUpperCase()}?${params.toString()}`;
}

/**
 * Compute user league summary for Mathletics.
 */
export function computeUserMathleticsLeagueSummary(
  league: MathleticsLeague,
  userId: string,
  username: string,
  scoresOverride?: MathleticsLeagueScore[]
) {
  const status = getMathleticsLeagueStatus(league.startDate, league.durationDays);
  const scores = scoresOverride ?? getLocalMathleticsLeagueScores(league.code);
  const leaderboard = aggregateMathleticsLeaderboard(scores, status.dayNumber);

  const cleanName = (username || "").trim().toLowerCase();
  const keyMatch = (s: MathleticsLeagueScore) =>
    (cleanName && (s.username || "").trim().toLowerCase() === cleanName) ||
    (userId && s.userId === userId);

  const userLeaderboardEntry = leaderboard.find(
    (e) =>
      (cleanName && (e.username || "").trim().toLowerCase() === cleanName) ||
      (userId && e.userId === userId)
  );

  const todayScoreRows = scores.filter((s) => s.dayNumber === status.dayNumber && keyMatch(s));
  const todayScoreRow = todayScoreRows[0] || undefined;

  const hasCompletedToday = Boolean(todayScoreRow);
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
