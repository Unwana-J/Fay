import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  generateDailyLeagueQuestions,
  getLeagueStatus,
  aggregateLeagueLeaderboard,
  type FriendshipLeague,
  type LeagueDailyScore,
} from "@/lib/trivia-league";
import { todayStr, addDaysToDate, formatDateToIso } from "@/lib/utils";

// Generate clean unique 6-character code
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
      durationDays = 5,
      questionsPerDay = 5,
      difficulty = "mixed",
      category = "all",
      attemptPolicy = "flexible",
    } = body;

    if (!title || !creatorName) {
      return NextResponse.json({ error: "Title and Creator Name are required." }, { status: 400 });
    }

    const numDuration = Number(durationDays);
    const validDuration =
      attemptPolicy === "unlimited" || durationDays === "unlimited"
        ? 30
        : !isNaN(numDuration) && numDuration >= 1 && numDuration <= 100
        ? numDuration
        : 5;
    const validQPerDay = [5, 10].includes(Number(questionsPerDay)) ? Number(questionsPerDay) : 5;
    const validPolicy = ["flexible", "strict", "unlimited"].includes(attemptPolicy) ? attemptPolicy : "flexible";

    const today = todayStr();
    const startDate = today;
    const endDate = formatDateToIso(addDaysToDate(new Date(), validDuration - 1));
    const code = generateLeagueCode();

    const dailySeedMap = generateDailyLeagueQuestions(
      validDuration,
      validQPerDay,
      difficulty,
      category
    );

    // Embed policy into seed map metadata for schema-safe persistence
    (dailySeedMap as any)._policy = validPolicy;

    const leagueData: FriendshipLeague = {
      code,
      title: title.trim(),
      creatorName: creatorName.trim(),
      creatorId: creatorId || "anonymous",
      durationDays: validDuration,
      startDate,
      endDate,
      questionsPerDay: validQPerDay,
      difficulty,
      category,
      attemptPolicy: validPolicy,
      dailySeedMap,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("friendship_leagues").insert([
        {
          code: leagueData.code,
          title: leagueData.title,
          creator_name: leagueData.creatorName,
          creator_id: leagueData.creatorId,
          duration_days: leagueData.durationDays,
          start_date: leagueData.startDate,
          end_date: leagueData.endDate,
          questions_per_day: leagueData.questionsPerDay,
          difficulty: leagueData.difficulty,
          category: leagueData.category,
          daily_seed_map: leagueData.dailySeedMap,
        },
      ]).select().single();

      if (error) {
        console.error("Supabase insert league error:", error);
        // If Supabase fails, still return leagueData with stored: false
        return NextResponse.json({
          success: true,
          stored: false,
          league: leagueData,
        });
      }

      return NextResponse.json({
        success: true,
        stored: true,
        league: {
          ...leagueData,
          id: data?.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      stored: false,
      league: leagueData,
    });
  } catch (err: any) {
    console.error("Error creating league:", err);
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
      return NextResponse.json({
        error: "Supabase is not configured.",
        leagues: [],
      }, { status: code ? 404 : 200 });
    }

    // ── Mode A: Query user's participating & created leagues ──
    if (!code && (userId || username)) {
      const leaguesMap = new Map<string, FriendshipLeague>();

      // 1. Fetch leagues created by user
      let queryCreated = supabase.from("friendship_leagues").select("*");
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
            durationDays: row.duration_days,
            startDate: row.start_date,
            endDate: row.end_date,
            questionsPerDay: row.questions_per_day,
            difficulty: row.difficulty,
            category: row.category,
            attemptPolicy: row.daily_seed_map?._policy || "flexible",
            dailySeedMap: row.daily_seed_map,
            createdAt: row.created_at,
          });
        }
      }

      // 2. Fetch leagues where user submitted scores (as a team member / player)
      let queryScores = supabase.from("league_scores").select("league_code");
      if (userId && username) {
        queryScores = queryScores.or(`user_id.eq.${userId},username.ilike.${username}`);
      } else if (userId) {
        queryScores = queryScores.eq("user_id", userId);
      } else if (username) {
        queryScores = queryScores.ilike("username", username);
      }

      const { data: scoreLeagueRows } = await queryScores;
      if (scoreLeagueRows && Array.isArray(scoreLeagueRows)) {
        const participantCodes = Array.from(
          new Set(scoreLeagueRows.map((r: any) => r.league_code).filter(Boolean))
        ).filter((c) => !leaguesMap.has(c));

        if (participantCodes.length > 0) {
          const { data: partRows } = await supabase
            .from("friendship_leagues")
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
                durationDays: row.duration_days,
                startDate: row.start_date,
                endDate: row.end_date,
                questionsPerDay: row.questions_per_day,
                difficulty: row.difficulty,
                category: row.category,
                attemptPolicy: row.daily_seed_map?._policy || "flexible",
                dailySeedMap: row.daily_seed_map,
                createdAt: row.created_at,
              });
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        leagues: Array.from(leaguesMap.values()),
      });
    }

    // ── Mode B: Fetch single league by code ──
    const { data: leagueRow, error: leagueError } = await supabase
      .from("friendship_leagues")
      .select("*")
      .eq("code", code!)
      .maybeSingle();

    if (leagueError || !leagueRow) {
      return NextResponse.json({ error: "League not found." }, { status: 404 });
    }

    const league: FriendshipLeague = {
      id: leagueRow.id,
      code: leagueRow.code,
      title: leagueRow.title,
      creatorName: leagueRow.creator_name,
      creatorId: leagueRow.creator_id,
      durationDays: leagueRow.duration_days,
      startDate: leagueRow.start_date,
      endDate: leagueRow.end_date,
      questionsPerDay: leagueRow.questions_per_day,
      difficulty: leagueRow.difficulty,
      category: leagueRow.category,
      attemptPolicy: leagueRow.daily_seed_map?._policy || "flexible",
      dailySeedMap: leagueRow.daily_seed_map,
      createdAt: leagueRow.created_at,
    };

    // 2. Fetch all scores
    const { data: scoreRows, error: scoresError } = await supabase
      .from("league_scores")
      .select("*")
      .eq("league_code", code)
      .order("created_at", { ascending: true });

    const scores: LeagueDailyScore[] = (scoreRows || []).map((row: any) => ({
      id: row.id,
      leagueCode: row.league_code,
      userId: row.user_id,
      username: row.username,
      avatar: row.avatar,
      dayNumber: row.day_number,
      date: row.date,
      score: row.score,
      totalQuestions: row.total_questions,
      points: row.points,
      durationSeconds: row.duration_seconds,
      questionResults: row.question_results || [],
      createdAt: row.created_at,
    }));

    const status = getLeagueStatus(league.startDate, league.durationDays);
    const leaderboard = aggregateLeagueLeaderboard(scores, status.dayNumber);

    return NextResponse.json({
      success: true,
      league,
      scores,
      leaderboard,
      status,
    });
  } catch (err: any) {
    console.error("Error fetching league:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, extraDrops, newDuration, attemptPolicy } = body;

    if (!code) {
      return NextResponse.json({ error: "League code is required." }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const { data: leagueRow } = await supabase
        .from("friendship_leagues")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (leagueRow) {
        const updatedDuration = newDuration || (leagueRow.duration_days + (extraDrops || 1));
        const updatedPolicy = attemptPolicy || leagueRow.daily_seed_map?._policy || "flexible";
        const currentSeedMap = leagueRow.daily_seed_map || {};
        currentSeedMap._policy = updatedPolicy;

        for (let d = leagueRow.duration_days + 1; d <= updatedDuration; d++) {
          if (!currentSeedMap[`day_${d}`]) {
            const extraMap = generateDailyLeagueQuestions(
              1,
              leagueRow.questions_per_day || 5,
              leagueRow.difficulty || "mixed",
              leagueRow.category || "all",
              `${code}_DAY_${d}`
            );
            currentSeedMap[`day_${d}`] = extraMap["day_1"] || [];
          }
        }

        const newEndDate = formatDateToIso(addDaysToDate(new Date(leagueRow.start_date), updatedDuration - 1));

        await supabase
          .from("friendship_leagues")
          .update({
            duration_days: updatedDuration,
            end_date: newEndDate,
            daily_seed_map: currentSeedMap,
          })
          .eq("code", code);

        return NextResponse.json({
          success: true,
          durationDays: updatedDuration,
          dailySeedMap: currentSeedMap,
          attemptPolicy: updatedPolicy,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "League updated.",
    });
  } catch (err: any) {
    console.error("Error updating league:", err);
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

    // 1. Fetch league record to verify host vs participant
    const { data: leagueRow, error: fetchError } = await supabase
      .from("friendship_leagues")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (fetchError) {
      console.warn("Could not check league before delete:", fetchError);
    }

    const cleanUsername = (username || "").trim().toLowerCase();
    const creatorUser = (leagueRow?.creator_name || "").trim().toLowerCase();

    const isHost =
      !leagueRow || // if already deleted or doesn't exist, allow cleanup
      (userId && leagueRow.creator_id === userId) ||
      (cleanUsername && creatorUser === cleanUsername) ||
      leagueRow.creator_id === "anonymous" ||
      leagueRow.creator_id === "creator";

    if (isHost) {
      // Host deleting: delete all scores and the tournament row
      const { error: scoresErr } = await supabase
        .from("league_scores")
        .delete()
        .eq("league_code", code);

      if (scoresErr) {
        console.warn("Could not delete scores for league:", scoresErr);
      }

      const { error: leagueErr } = await supabase
        .from("friendship_leagues")
        .delete()
        .eq("code", code);

      if (leagueErr) {
        console.error("Supabase error deleting friendship_leagues:", leagueErr);
        return NextResponse.json({ error: leagueErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, mode: "deleted" });
    } else {
      // Participant leaving: remove participant scores so league won't appear on their dashboard
      let q = supabase.from("league_scores").delete().eq("league_code", code);
      if (userId && cleanUsername) {
        q = q.or(`user_id.eq.${userId},username.ilike.${cleanUsername}`);
      } else if (userId) {
        q = q.eq("user_id", userId);
      } else if (cleanUsername) {
        q = q.ilike("username", cleanUsername);
      }

      const { error: leaveErr } = await q;
      if (leaveErr) {
        console.warn("Could not remove participant scores for league:", leaveErr);
      }

      return NextResponse.json({ success: true, mode: "left" });
    }
  } catch (err: any) {
    console.error("Error in DELETE /api/trivia/league:", err);
    return NextResponse.json({ error: err.message || "Failed to delete league" }, { status: 500 });
  }
}

