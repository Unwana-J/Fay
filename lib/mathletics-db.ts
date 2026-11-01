import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  type MathleticsLeague,
  type MathleticsLeagueScore,
  hydrateMathleticsLeagueFromScoreRows,
  generateDailyMathleticsQuestions,
} from "@/lib/mathletics-league";
import { todayStr, formatDateToIso, addDaysToDate } from "@/lib/utils";

/**
 * Check if an error represents a missing table in PostgreSQL / Supabase (code 42P01).
 */
function isTableMissingError(err: any): boolean {
  if (!err) return false;
  const msg = String(err.message || "").toLowerCase();
  const code = String(err.code || "");
  return (
    code === "42P01" ||
    msg.includes("does not exist") ||
    msg.includes("relation") ||
    msg.includes("could not find the table")
  );
}

export interface FetchedLeagueData {
  league: MathleticsLeague;
  scores: MathleticsLeagueScore[];
  sourceTable: "mathletics_leagues" | "friendship_leagues" | "fallback";
}

/**
 * Fetch a Mathletics league by its 6-character code, checking `mathletics_leagues` first,
 * falling back to `friendship_leagues`, and auto-creating if URL metadata is provided.
 */
export async function getOrRestoreMathleticsLeague(
  code: string,
  fallbackMeta?: Partial<MathleticsLeague>
): Promise<FetchedLeagueData | null> {
  const cleanCode = code.toUpperCase().trim();

  if (!isSupabaseConfigured || !supabase) {
    if (!fallbackMeta) return null;
    const fallbackLeague = buildFallbackLeague(cleanCode, fallbackMeta);
    return {
      league: fallbackLeague,
      scores: [],
      sourceTable: "fallback",
    };
  }

  let leagueRow: any = null;
  let sourceTable: "mathletics_leagues" | "friendship_leagues" = "mathletics_leagues";

  // 1. Try dedicated `mathletics_leagues` table
  try {
    const { data, error } = await supabase
      .from("mathletics_leagues")
      .select("*")
      .eq("code", cleanCode)
      .maybeSingle();

    if (!error && data) {
      leagueRow = data;
      sourceTable = "mathletics_leagues";
    } else if (isTableMissingError(error)) {
      sourceTable = "friendship_leagues";
    }
  } catch {
    sourceTable = "friendship_leagues";
  }

  // 2. If not found in `mathletics_leagues`, try `friendship_leagues`
  if (!leagueRow) {
    try {
      const { data, error } = await supabase
        .from("friendship_leagues")
        .select("*")
        .eq("code", cleanCode)
        .maybeSingle();

      if (!error && data) {
        leagueRow = data;
        sourceTable = "friendship_leagues";
      }
    } catch {}
  }

  // 3. If still not found, but we have URL metadata (e.g. from a shared league URL like ?t=...&c=...),
  // auto-create the league in the database so players can join and scores sync immediately!
  if (!leagueRow && fallbackMeta && (fallbackMeta.title || fallbackMeta.creatorName)) {
    const freshLeague = buildFallbackLeague(cleanCode, fallbackMeta);
    const persisted = await persistMathleticsLeagueRow(freshLeague);
    if (persisted.stored && persisted.league) {
      leagueRow = persisted.league;
      sourceTable = persisted.table;
    } else {
      return {
        league: freshLeague,
        scores: [],
        sourceTable: "fallback",
      };
    }
  }

  if (!leagueRow) return null;

  const baseLeague = mapRowToMathleticsLeague(leagueRow);

  // 4. Fetch scores from matching scores table
  let rawScoreRows: any[] = [];
  const scoreTable = sourceTable === "mathletics_leagues" ? "mathletics_scores" : "league_scores";

  try {
    const { data: scoreData, error: scoreErr } = await supabase
      .from(scoreTable)
      .select("*")
      .eq("league_code", cleanCode)
      .order("created_at", { ascending: true });

    if (!scoreErr && Array.isArray(scoreData)) {
      rawScoreRows = scoreData;
    } else if (scoreTable === "mathletics_scores" && isTableMissingError(scoreErr)) {
      // Fallback check on `league_scores`
      const { data: fallbackScores } = await supabase
        .from("league_scores")
        .select("*")
        .eq("league_code", cleanCode)
        .order("created_at", { ascending: true });
      if (Array.isArray(fallbackScores)) {
        rawScoreRows = fallbackScores;
      }
    }
  } catch {}

  const hydrated = hydrateMathleticsLeagueFromScoreRows(baseLeague, rawScoreRows);

  return {
    league: hydrated.league,
    scores: hydrated.scores,
    sourceTable,
  };
}

/**
 * Persist or upsert a Mathletics league row.
 * Tries `mathletics_leagues` first, falls back to `friendship_leagues`.
 */
export async function persistMathleticsLeagueRow(
  league: MathleticsLeague
): Promise<{ stored: boolean; league: any; table: "mathletics_leagues" | "friendship_leagues" }> {
  if (!isSupabaseConfigured || !supabase) {
    return { stored: false, league, table: "mathletics_leagues" };
  }

  const cleanCode = league.code.toUpperCase().trim();
  const insertPayload = {
    code: cleanCode,
    title: league.title.trim(),
    creator_name: league.creatorName.trim(),
    creator_id: league.creatorId || "anonymous",
    duration_days: league.durationDays || 1,
    start_date: league.startDate || todayStr(),
    end_date: league.endDate || todayStr(),
    questions_per_day: league.questionsPerDay || 10,
    difficulty: league.difficulty || "random",
    category: league.category || "all",
    daily_seed_map: {
      ...(league.dailySeedMap || {}),
      _format: league.format || (league.durationDays === 1 ? "sprint_duel" : "marathon"),
      _policy: league.attemptPolicy || (league.durationDays === 1 ? "once" : "flexible"),
      _unlockedUpToDay: league.unlockedUpToDay || 1,
      _questionTimer: league.questionTimerSeconds || 25,
    },
  };

  // 1. Try `mathletics_leagues`
  try {
    const { data, error } = await supabase
      .from("mathletics_leagues")
      .upsert(
        [
          {
            ...insertPayload,
            format: league.format || (league.durationDays === 1 ? "sprint_duel" : "marathon"),
          },
        ],
        { onConflict: "code" }
      )
      .select()
      .maybeSingle();

    if (!error && data) {
      return { stored: true, league: data, table: "mathletics_leagues" };
    }
  } catch {}

  // 2. Fall back to `friendship_leagues`
  try {
    const { data, error } = await supabase
      .from("friendship_leagues")
      .upsert([insertPayload], { onConflict: "code" })
      .select()
      .maybeSingle();

    if (!error && data) {
      return { stored: true, league: data, table: "friendship_leagues" };
    }
  } catch {}

  return { stored: false, league, table: "friendship_leagues" };
}

/**
 * Record a sprint round score in Supabase.
 * Automatically verifies/ensures the league exists so foreign key references pass cleanly.
 */
export async function persistMathleticsScoreRow(
  score: MathleticsLeagueScore,
  leagueMeta?: Partial<MathleticsLeague>
): Promise<{ stored: boolean; data?: any; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { stored: false, error: "Database not configured." };
  }

  const cleanCode = score.leagueCode.toUpperCase().trim();

  // 1. Ensure league row exists before inserting score
  const existing = await getOrRestoreMathleticsLeague(cleanCode, leagueMeta);
  const targetTable = existing?.sourceTable === "mathletics_leagues" ? "mathletics_scores" : "league_scores";

  const scorePayload = {
    league_code: cleanCode,
    user_id: score.userId,
    username: score.username,
    avatar: score.avatar || "/avatars/avatar-scholar.svg",
    day_number: score.dayNumber,
    date: score.date || todayStr(),
    score: score.score,
    total_questions: score.totalQuestions || 10,
    agility_score: score.agilityScore || score.points || 0,
    points: score.points || score.agilityScore || 0,
    duration_seconds: score.durationSeconds || 0,
    question_results: score.questionResults || [],
  };

  // 2. Try inserting into primary score table
  try {
    // Check for existing score to prevent duplicates
    const { data: existingAttempts } = await supabase
      .from(targetTable)
      .select("id, user_id, username, score, points")
      .eq("league_code", cleanCode)
      .eq("day_number", score.dayNumber);

    const isMatch = (row: any) =>
      row.user_id === score.userId ||
      (row.username && row.username.trim().toLowerCase() === score.username.trim().toLowerCase());

    const prior = (existingAttempts || []).find(isMatch);
    if (prior) {
      // If new attempt is better, update it; otherwise keep existing
      if ((score.points || 0) > (prior.points || 0)) {
        const { data: updated } = await supabase
          .from(targetTable)
          .update({
            score: score.score,
            points: score.points,
            duration_seconds: score.durationSeconds,
            question_results: score.questionResults,
          })
          .eq("id", prior.id)
          .select()
          .maybeSingle();
        return { stored: true, data: updated };
      }
      return { stored: true, data: prior };
    }

    const { data: inserted, error: insertErr } = await supabase
      .from(targetTable)
      .insert([scorePayload])
      .select()
      .maybeSingle();

    if (!insertErr && inserted) {
      return { stored: true, data: inserted };
    }

    // If targetTable was mathletics_scores and failed with table missing, try league_scores
    if (targetTable === "mathletics_scores" && isTableMissingError(insertErr)) {
      // Ensure league exists in friendship_leagues
      if (existing?.league) {
        await persistMathleticsLeagueRow(existing.league);
      }
      const { data: fallbackInserted, error: fallbackErr } = await supabase
        .from("league_scores")
        .insert([
          {
            league_code: cleanCode,
            user_id: score.userId,
            username: score.username,
            avatar: score.avatar || "/avatars/avatar-scholar.svg",
            day_number: score.dayNumber,
            date: score.date || todayStr(),
            score: score.score,
            total_questions: score.totalQuestions || 10,
            points: score.points || score.agilityScore || 0,
            duration_seconds: score.durationSeconds || 0,
            question_results: score.questionResults || [],
          },
        ])
        .select()
        .maybeSingle();

      if (!fallbackErr && fallbackInserted) {
        return { stored: true, data: fallbackInserted };
      }
      return { stored: false, error: fallbackErr?.message };
    }

    return { stored: false, error: insertErr?.message };
  } catch (err: any) {
    return { stored: false, error: err.message };
  }
}

function buildFallbackLeague(code: string, meta: Partial<MathleticsLeague>): MathleticsLeague {
  const isSprint = meta.format === "sprint_duel" || Number(meta.durationDays) === 1;
  const durationDays = isSprint ? 1 : [3, 5, 7, 14].includes(Number(meta.durationDays)) ? Number(meta.durationDays) : 5;
  const title = meta.title?.trim() || `Mathletics League (${code})`;
  const creatorName = meta.creatorName?.trim() && meta.creatorName !== "Scholar" ? meta.creatorName : "Host";
  const category = meta.category || "all";
  const difficulty = meta.difficulty || "random";
  const attemptPolicy = isSprint ? "once" : meta.attemptPolicy || "flexible";
  const today = todayStr();

  return {
    code,
    title,
    creatorName,
    creatorId: meta.creatorId || "creator",
    format: isSprint ? "sprint_duel" : "marathon",
    durationDays,
    startDate: today,
    endDate: formatDateToIso(addDaysToDate(new Date(), durationDays - 1)),
    questionsPerDay: 10,
    difficulty,
    category,
    attemptPolicy,
    unlockedUpToDay: Number(meta.unlockedUpToDay) > 0 ? Number(meta.unlockedUpToDay) : 1,
    questionTimerSeconds: Math.max(25, Number(meta.questionTimerSeconds) || 25),
    dailySeedMap:
      meta.dailySeedMap && Object.keys(meta.dailySeedMap).some((k) => k.startsWith("day_"))
        ? meta.dailySeedMap
        : generateDailyMathleticsQuestions(durationDays, 10, difficulty, category, code),
  };
}

function mapRowToMathleticsLeague(row: any): MathleticsLeague {
  const seed = row.daily_seed_map || {};
  const isSprint = row.format === "sprint_duel" || seed._format === "sprint_duel" || row.duration_days === 1;

  return {
    id: row.id,
    code: row.code,
    title: row.title,
    creatorName: row.creator_name,
    creatorId: row.creator_id,
    format: isSprint ? "sprint_duel" : "marathon",
    durationDays: row.duration_days || 1,
    startDate: row.start_date,
    endDate: row.end_date,
    questionsPerDay: row.questions_per_day || 10,
    difficulty: row.difficulty || "random",
    category: row.category || "all",
    dailySeedMap: seed,
    attemptPolicy: seed._policy || (isSprint ? "once" : "flexible"),
    unlockedUpToDay: Number(seed._unlockedUpToDay) || 1,
    questionTimerSeconds: Number(seed._questionTimer) || 25,
    createdAt: row.created_at,
  };
}
