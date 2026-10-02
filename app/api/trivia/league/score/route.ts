import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sanitizeScholarName } from "@/lib/name-moderation";
import { calculateLeaguePoints, getLeagueStatus, type FriendshipLeague } from "@/lib/trivia-league";
import { todayStr } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      leagueCode,
      userId,
      username,
      avatar,
      score,
      totalQuestions,
      durationSeconds = 0,
      questionResults = [],
    } = body;

    if (!leagueCode || !username || typeof score !== "number" || typeof totalQuestions !== "number") {
      return NextResponse.json({ error: "Invalid score payload." }, { status: 400 });
    }

    const cleanUsername = sanitizeScholarName(username);
    const cleanLeagueCode = leagueCode.toUpperCase().trim();
    const today = todayStr();

    if (!isSupabaseConfigured || !supabase) {
      // Local calculation fallback
      const points = calculateLeaguePoints(score, totalQuestions, durationSeconds);
      return NextResponse.json({
        success: true,
        stored: false,
        points,
        message: "Score recorded locally.",
      });
    }

    // 1. Fetch league to determine the active day
    const { data: leagueRow, error: leagueError } = await supabase
      .from("friendship_leagues")
      .select("*")
      .eq("code", cleanLeagueCode)
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
    };

    const status = getLeagueStatus(league.startDate, league.durationDays, today);

    if (status.isCompleted) {
      return NextResponse.json({ error: "This league tournament has ended." }, { status: 400 });
    }
    if (status.isUpcoming) {
      return NextResponse.json({ error: "This league has not started yet." }, { status: 400 });
    }

    const dayNumber = status.dayNumber;

    // 2. Check if user has already submitted today's attempt
    const playerIdentifier = userId || cleanUsername.toLowerCase();
    const { data: existingAttempt } = await supabase
      .from("league_scores")
      .select("id")
      .eq("league_code", cleanLeagueCode)
      .eq("user_id", playerIdentifier)
      .eq("day_number", dayNumber)
      .maybeSingle();

    if (existingAttempt) {
      return NextResponse.json({
        error: "You have already completed your attempt for today's drop.",
        alreadyAttempted: true,
      }, { status: 409 });
    }

    // 3. Calculate points with velocity speed multipliers
    const points = calculateLeaguePoints(score, totalQuestions, durationSeconds);

    // 4. Insert score row into database
    const { data: inserted, error: insertError } = await supabase
      .from("league_scores")
      .insert([
        {
          league_code: cleanLeagueCode,
          user_id: playerIdentifier,
          username: cleanUsername,
          avatar: avatar || "/avatars/avatar-scholar.svg",
          day_number: dayNumber,
          date: today,
          score,
          total_questions: totalQuestions,
          points,
          duration_seconds: durationSeconds,
          question_results: questionResults,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Supabase league score insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stored: true,
      dayNumber,
      points,
      data: inserted,
    });
  } catch (err: any) {
    console.error("Error submitting league score:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
