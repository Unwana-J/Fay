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
    } = body;

    if (!title || !creatorName) {
      return NextResponse.json({ error: "Title and Creator Name are required." }, { status: 400 });
    }

    const validDuration = [3, 5, 7, 14].includes(Number(durationDays)) ? Number(durationDays) : 5;
    const validQPerDay = [5, 10].includes(Number(questionsPerDay)) ? Number(questionsPerDay) : 5;

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

    if (!code) {
      return NextResponse.json({ error: "League code is required." }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        error: "Supabase is not configured.",
      }, { status: 404 });
    }

    // 1. Fetch league details
    const { data: leagueRow, error: leagueError } = await supabase
      .from("friendship_leagues")
      .select("*")
      .eq("code", code)
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
