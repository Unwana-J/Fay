import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  generateDailyMathleticsQuestions,
  getMathleticsLeagueStatus,
  aggregateMathleticsLeaderboard,
  hydrateMathleticsLeagueFromScoreRows,
  mergeMathleticsLeagueState,
  type MathleticsLeague,
  type MathleticsLeagueScore,
} from "@/lib/mathletics-league";
import {
  persistMathleticsLeagueRow,
  getOrRestoreMathleticsLeague,
} from "@/lib/mathletics-db";
import { todayStr, addDaysToDate, formatDateToIso } from "@/lib/utils";

export const dynamic = "force-dynamic";

function generateLeagueCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      creatorName,
      creatorId,
      format = "sprint_duel",
      durationDays = 1,
      difficulty = "random",
      category = "all",
      attemptPolicy,
      questionIds,
      questionTimerSeconds = 25,
    } = body;

    if (!title || !creatorName) {
      return NextResponse.json({ error: "Title and Creator Name are required." }, { status: 400 });
    }

    const isSprint = format === "sprint_duel" || Number(durationDays) === 1;
    const validFormat: "sprint_duel" | "marathon" = isSprint ? "sprint_duel" : "marathon";
    const validDuration = isSprint ? 1 : [3, 5, 7, 14].includes(Number(durationDays)) ? Number(durationDays) : 5;
    const validQuestionsPerDay = 10;
    const validPolicy = isSprint
      ? "once"
      : ["flexible", "strict", "host_controlled"].includes(attemptPolicy)
      ? attemptPolicy
      : "flexible";
    const validQuestionTimer = Math.max(25, Number(questionTimerSeconds) || 25);

    const today = todayStr();
    const startDate = today;
    const endDate = formatDateToIso(addDaysToDate(new Date(), validDuration - 1));
    const code = generateLeagueCode();

    let dailySeedMap: Record<string, string[]> = {};
    if (isSprint && Array.isArray(questionIds) && questionIds.length > 0) {
      dailySeedMap = {
        day_1: questionIds.slice(0, validQuestionsPerDay),
      };
    } else {
      dailySeedMap = generateDailyMathleticsQuestions(
        validDuration,
        validQuestionsPerDay,
        difficulty,
        category,
        code
      );
    }

    (dailySeedMap as any)._policy = validPolicy;
    (dailySeedMap as any)._format = validFormat;
    (dailySeedMap as any)._unlockedUpToDay = 1;
    (dailySeedMap as any)._questionTimer = validQuestionTimer;

    const leagueData: MathleticsLeague = {
      code,
      title: title.trim(),
      creatorName: creatorName.trim(),
      creatorId: creatorId || "anonymous",
      format: validFormat,
      durationDays: validDuration,
      startDate,
      endDate,
      questionsPerDay: validQuestionsPerDay,
      difficulty,
      category,
      attemptPolicy: validPolicy,
      unlockedUpToDay: 1,
      questionTimerSeconds: validQuestionTimer,
      dailySeedMap,
      createdAt: new Date().toISOString(),
    };

    const persisted = await persistMathleticsLeagueRow(leagueData);
    return NextResponse.json({
      success: true,
      stored: persisted.stored,
      league: {
        ...leagueData,
        id: persisted.league?.id,
      },
    });
  } catch (err: any) {
    console.error("Error creating mathletics league:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.toUpperCase().trim();
    const userId = searchParams.get("userId")?.trim();
    const username = searchParams.get("username")?.trim();

    if (!code && !userId && !username) {
      return NextResponse.json({ error: "League code or user identifier is required." }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        {
          error: "Supabase is not configured.",
          leagues: [],
        },
        { status: code ? 404 : 200 }
      );
    }

    // ── Mode A: Query user's participating & created leagues ──
    if (!code && (userId || username)) {
      const leaguesMap = new Map<string, MathleticsLeague>();

      let queryCreated = supabase.from("mathletics_leagues").select("*");
      if (userId && username) {
        queryCreated = queryCreated.or(`creator_id.eq.${userId},creator_name.ilike.${username}`);
      } else if (userId) {
        queryCreated = queryCreated.eq("creator_id", userId);
      } else if (username) {
        queryCreated = queryCreated.ilike("creator_name", username);
      }

      const { data: createdRows } = await queryCreated;
      if (createdRows && Array.isArray(createdRows)) {
        for (const row of createdRows) {
          leaguesMap.set(row.code, {
            id: row.id,
            code: row.code,
            title: row.title,
            creatorName: row.creator_name,
            creatorId: row.creator_id,
            format: row.format || row.daily_seed_map?._format || (row.duration_days === 1 ? "sprint_duel" : "marathon"),
            durationDays: row.duration_days,
            startDate: row.start_date,
            endDate: row.end_date,
            questionsPerDay: row.questions_per_day || 10,
            difficulty: row.difficulty || "random",
            category: row.category || "all",
            attemptPolicy: row.daily_seed_map?._policy || (row.duration_days === 1 ? "once" : "flexible"),
            unlockedUpToDay: row.daily_seed_map?._unlockedUpToDay || 1,
            questionTimerSeconds: row.daily_seed_map?._questionTimer || 25,
            dailySeedMap: row.daily_seed_map,
            createdAt: row.created_at,
          });
        }
      }

      let queryScores = supabase
        .from("mathletics_scores")
        .select("*")
        .order("created_at", { ascending: true });
      if (userId && username) {
        queryScores = queryScores.or(`user_id.eq.${userId},username.ilike.${username}`);
      } else if (userId) {
        queryScores = queryScores.eq("user_id", userId);
      } else if (username) {
        queryScores = queryScores.ilike("username", username);
      }

      const { data: scoreLeagueRows } = await queryScores;
      const userScores: MathleticsLeagueScore[] = [];

      if (scoreLeagueRows && Array.isArray(scoreLeagueRows)) {
        for (const row of scoreLeagueRows) {
          if (
            row.day_number <= 0 ||
            row.username === "__LEAGUE_SYNC__" ||
            String(row.user_id || "").startsWith("__league_sync_")
          ) {
            continue;
          }
          userScores.push({
            id: row.id,
            leagueCode: row.league_code,
            userId: row.user_id,
            username: row.username,
            avatar: row.avatar,
            dayNumber: row.day_number,
            date: row.date,
            score: row.score,
            totalQuestions: row.total_questions || 10,
            agilityScore: row.agility_score || row.points || 0,
            points: row.points || row.agility_score || 0,
            durationSeconds: row.duration_seconds || 0,
            questionResults: row.question_results,
            createdAt: row.created_at,
          });
        }

        const participantCodes = Array.from(
          new Set(scoreLeagueRows.map((r: any) => r.league_code).filter(Boolean))
        ).filter((c) => !leaguesMap.has(c));

        if (participantCodes.length > 0) {
          const { data: partRows } = await supabase
            .from("mathletics_leagues")
            .select("*")
            .in("code", participantCodes);

          if (partRows && Array.isArray(partRows)) {
            for (const row of partRows) {
              leaguesMap.set(row.code, {
                id: row.id,
                code: row.code,
                title: row.title,
                creatorName: row.creator_name,
                creatorId: row.creator_id,
                format: row.format || row.daily_seed_map?._format || (row.duration_days === 1 ? "sprint_duel" : "marathon"),
                durationDays: row.duration_days,
                startDate: row.start_date,
                endDate: row.end_date,
                questionsPerDay: row.questions_per_day || 10,
                difficulty: row.difficulty || "random",
                category: row.category || "all",
                attemptPolicy: row.daily_seed_map?._policy || (row.duration_days === 1 ? "once" : "flexible"),
                unlockedUpToDay: row.daily_seed_map?._unlockedUpToDay || 1,
                questionTimerSeconds: row.daily_seed_map?._questionTimer || 25,
                dailySeedMap: row.daily_seed_map,
                createdAt: row.created_at,
              });
            }
          }
        }
      }

      const allLeagueCodes = Array.from(leaguesMap.keys());
      if (allLeagueCodes.length > 0) {
        const { data: allLeagueScoreRows } = await supabase
          .from("mathletics_scores")
          .select("*")
          .in("league_code", allLeagueCodes)
          .order("created_at", { ascending: true });

        if (allLeagueScoreRows && Array.isArray(allLeagueScoreRows)) {
          const rowsByCode = new Map<string, any[]>();
          for (const r of allLeagueScoreRows) {
            const c = r.league_code;
            if (!rowsByCode.has(c)) rowsByCode.set(c, []);
            rowsByCode.get(c)!.push(r);
          }
          for (const [c, baseL] of leaguesMap.entries()) {
            const hydrated = hydrateMathleticsLeagueFromScoreRows(baseL, rowsByCode.get(c) || []);
            leaguesMap.set(c, hydrated.league);
          }
        }
      }

      return NextResponse.json({
        success: true,
        leagues: Array.from(leaguesMap.values()),
        userScores,
      });
    }

    // ── Mode B: Fetch single league by code ──
    const fallbackMeta: Partial<MathleticsLeague> = {
      title: searchParams.get("t") ? decodeURIComponent(searchParams.get("t")!) : undefined,
      creatorName: searchParams.get("c") ? decodeURIComponent(searchParams.get("c")!) : undefined,
      durationDays: searchParams.get("d") ? Number(searchParams.get("d")) : undefined,
      questionsPerDay: searchParams.get("q") ? Number(searchParams.get("q")) : 10,
      category: (searchParams.get("cat") as any) || "all",
      difficulty: (searchParams.get("diff") as any) || "random",
      format: (searchParams.get("fmt") as any) || undefined,
      questionTimerSeconds: searchParams.get("tim") ? Number(searchParams.get("tim")) : 25,
      unlockedUpToDay: searchParams.get("u") ? Number(searchParams.get("u")) : 1,
    };

    const fetched = await getOrRestoreMathleticsLeague(code!, fallbackMeta);
    if (!fetched) {
      return NextResponse.json({ error: "League not found." }, { status: 404 });
    }

    const { league, scores } = fetched;
    const status = getMathleticsLeagueStatus(league.startDate, league.durationDays);
    const leaderboard = aggregateMathleticsLeaderboard(scores, status.dayNumber);

    return NextResponse.json(
      {
        success: true,
        league,
        scores,
        leaderboard,
        status,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15",
        },
      }
    );
  } catch (err: any) {
    console.error("Error fetching mathletics league:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, extraDrops, newDuration, attemptPolicy, dailySeedMap, unlockedUpToDay } = body;

    if (!code) {
      return NextResponse.json({ error: "League code is required." }, { status: 400 });
    }

    const cleanCode = String(code).toUpperCase().trim();

    if (isSupabaseConfigured && supabase) {
      const { data: leagueRow } = await supabase
        .from("mathletics_leagues")
        .select("*")
        .eq("code", cleanCode)
        .maybeSingle();

      if (leagueRow) {
        const { data: existingScoreRows } = await supabase
          .from("mathletics_scores")
          .select("*")
          .eq("league_code", cleanCode)
          .order("created_at", { ascending: true });

        const baseLeague: MathleticsLeague = {
          id: leagueRow.id,
          code: leagueRow.code,
          title: leagueRow.title,
          creatorName: leagueRow.creator_name,
          creatorId: leagueRow.creator_id,
          format: leagueRow.format || (leagueRow.duration_days === 1 ? "sprint_duel" : "marathon"),
          durationDays: leagueRow.duration_days,
          startDate: leagueRow.start_date,
          endDate: leagueRow.end_date,
          questionsPerDay: leagueRow.questions_per_day || 10,
          difficulty: leagueRow.difficulty || "random",
          category: leagueRow.category || "all",
          attemptPolicy: leagueRow.daily_seed_map?._policy || "flexible",
          unlockedUpToDay: leagueRow.daily_seed_map?._unlockedUpToDay || 1,
          questionTimerSeconds: leagueRow.daily_seed_map?._questionTimer || 25,
          dailySeedMap: leagueRow.daily_seed_map || {},
          createdAt: leagueRow.created_at,
        };

        const { league: currentHydrated } = hydrateMathleticsLeagueFromScoreRows(
          baseLeague,
          existingScoreRows || []
        );

        const targetDuration = Number(
          newDuration ||
            (extraDrops ? currentHydrated.durationDays + Number(extraDrops) : currentHydrated.durationDays)
        );
        const targetPolicy = attemptPolicy || currentHydrated.attemptPolicy || "flexible";
        const targetUnlocked = Number(
          unlockedUpToDay ||
            dailySeedMap?._unlockedUpToDay ||
            currentHydrated.unlockedUpToDay ||
            1
        );

        let updatedLeague = mergeMathleticsLeagueState(currentHydrated, {
          durationDays: targetDuration,
          attemptPolicy: targetPolicy,
          unlockedUpToDay: targetUnlocked,
          dailySeedMap: dailySeedMap || currentHydrated.dailySeedMap,
        });

        const mergedSeedMap: Record<string, any> = { ...(updatedLeague.dailySeedMap || {}) };
        mergedSeedMap._policy = updatedLeague.attemptPolicy;
        mergedSeedMap._unlockedUpToDay = updatedLeague.unlockedUpToDay;

        for (let d = 1; d <= updatedLeague.durationDays; d++) {
          if (!mergedSeedMap[`day_${d}`]) {
            const extraMap = generateDailyMathleticsQuestions(
              1,
              updatedLeague.questionsPerDay || 10,
              updatedLeague.difficulty || "random",
              updatedLeague.category || "all",
              `${cleanCode}_DAY_${d}`
            );
            mergedSeedMap[`day_${d}`] = extraMap["day_1"] || [];
          }
        }

        updatedLeague.dailySeedMap = mergedSeedMap;
        const newEndDate = formatDateToIso(
          addDaysToDate(new Date(updatedLeague.startDate), updatedLeague.durationDays - 1)
        );
        updatedLeague.endDate = newEndDate;

        const { data: updatedRows, error: updateErr } = await supabase
          .from("mathletics_leagues")
          .update({
            duration_days: updatedLeague.durationDays,
            end_date: newEndDate,
            daily_seed_map: mergedSeedMap,
          })
          .eq("code", cleanCode)
          .select();

        if (updateErr || !updatedRows || updatedRows.length === 0) {
          await supabase.from("mathletics_scores").insert([
            {
              league_code: cleanCode,
              user_id: `__league_sync_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              username: "__LEAGUE_SYNC__",
              avatar: "/avatars/avatar-scholar.svg",
              day_number: 0,
              date: todayStr(),
              score: updatedLeague.unlockedUpToDay || 1,
              total_questions: updatedLeague.durationDays || 1,
              agility_score: 0,
              points: 0,
              duration_seconds: 0,
              question_results: [
                {
                  _syncMeta: true,
                  unlockedUpToDay: updatedLeague.unlockedUpToDay,
                  durationDays: updatedLeague.durationDays,
                  attemptPolicy: updatedLeague.attemptPolicy,
                  dailySeedMap: mergedSeedMap,
                },
              ],
            },
          ]);
        }

        return NextResponse.json({
          success: true,
          league: updatedLeague,
          unlockedUpToDay: updatedLeague.unlockedUpToDay,
          durationDays: updatedLeague.durationDays,
          dailySeedMap: mergedSeedMap,
          attemptPolicy: updatedLeague.attemptPolicy,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "League updated locally.",
    });
  } catch (err: any) {
    console.error("Error updating mathletics league:", err);
    return NextResponse.json({ error: err.message || "Failed to update league" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.toUpperCase().trim();
    const userId = searchParams.get("userId")?.trim();
    const username = searchParams.get("username")?.trim();

    if (!code) {
      return NextResponse.json({ error: "League code is required." }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ success: true, message: "Deleted locally (cloud not configured)." });
    }

    const { data: leagueRow } = await supabase
      .from("mathletics_leagues")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    const cleanUsername = (username || "").trim().toLowerCase();
    const creatorUser = (leagueRow?.creator_name || "").trim().toLowerCase();

    const isHost =
      !leagueRow ||
      (userId && leagueRow.creator_id === userId) ||
      (cleanUsername && creatorUser === cleanUsername) ||
      leagueRow.creator_id === "anonymous" ||
      leagueRow.creator_id === "creator";

    if (isHost) {
      await supabase.from("mathletics_scores").delete().eq("league_code", code);
      const { error: leagueErr } = await supabase
        .from("mathletics_leagues")
        .delete()
        .eq("code", code);

      if (leagueErr) {
        return NextResponse.json({ error: leagueErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, mode: "deleted" });
    } else {
      let q = supabase.from("mathletics_scores").delete().eq("league_code", code);
      if (userId && cleanUsername) {
        q = q.or(`user_id.eq.${userId},username.ilike.${cleanUsername}`);
      } else if (userId) {
        q = q.eq("user_id", userId);
      } else if (cleanUsername) {
        q = q.ilike("username", cleanUsername);
      }

      await q;
      return NextResponse.json({ success: true, mode: "left" });
    }
  } catch (err: any) {
    console.error("Error in DELETE /api/mathletics/league:", err);
    return NextResponse.json({ error: err.message || "Failed to delete league" }, { status: 500 });
  }
}
