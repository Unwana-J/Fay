import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sanitizeScholarName } from "@/lib/name-moderation";
import {
  calculateMathleticsPoints,
  getMathleticsLeagueStatus,
  type MathleticsLeague,
} from "@/lib/mathletics-league";
import { todayStr } from "@/lib/utils";
import {
  getClientIp,
  checkRateLimit,
  isBotPattern,
  isBannedIdentifier,
  isPlausibleScore,
} from "@/lib/security-guard";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`math-league-score:${clientIp}`, 6, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please pace your sprints.", retryAfter: rateCheck.retryAfter },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      leagueCode,
      userId,
      username,
      avatar,
      score,
      totalQuestions = 10,
      dayNumber: clientDayNumber,
      durationSeconds = 0,
      questionResults = [],
    } = body;

    if (!leagueCode || !username || typeof score !== "number" || typeof totalQuestions !== "number") {
      return NextResponse.json({ error: "Invalid score payload." }, { status: 400 });
    }

    if (isBotPattern(username) || isBannedIdentifier(username) || (userId && isBannedIdentifier(userId))) {
      return NextResponse.json({ error: "Access prohibited." }, { status: 403 });
    }

    const scoreValidation = isPlausibleScore(score, totalQuestions);
    if (!scoreValidation.valid) {
      return NextResponse.json({ error: scoreValidation.reason || "Invalid score values." }, { status: 400 });
    }

    const cleanUsername = sanitizeScholarName(username);
    if (isBannedIdentifier(cleanUsername)) {
      return NextResponse.json({ error: "Access prohibited." }, { status: 403 });
    }

    const cleanLeagueCode = leagueCode.toUpperCase().trim();
    const today = todayStr();

    const agilityScore = calculateMathleticsPoints(score, totalQuestions, durationSeconds);
    const points = agilityScore;

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        success: true,
        stored: false,
        points,
        agilityScore,
        message: "Score recorded locally.",
      });
    }

    try {
      const { data: leagueRow } = await supabase
        .from("mathletics_leagues")
        .select("*")
        .eq("code", cleanLeagueCode)
        .maybeSingle();

      let dayNumber = 1;
      const isSprintDuel =
        leagueRow?.format === "sprint_duel" ||
        Number(leagueRow?.duration_days) === 1 ||
        leagueRow?.daily_seed_map?._format === "sprint_duel";

      if (leagueRow) {
        if (isSprintDuel) {
          dayNumber = 1;
        } else {
          const status = getMathleticsLeagueStatus(
            leagueRow.start_date,
            Math.max(leagueRow.duration_days || 5, clientDayNumber || 1),
            today
          );
          if (
            typeof clientDayNumber === "number" &&
            clientDayNumber >= 1 &&
            clientDayNumber <= 100
          ) {
            dayNumber = clientDayNumber;
          } else {
            dayNumber = status.dayNumber || 1;
          }
        }
      } else if (typeof clientDayNumber === "number" && clientDayNumber >= 1) {
        dayNumber = clientDayNumber;
      }

      // Check if user has already submitted an attempt for this day
      const playerIdentifier = userId || cleanUsername.toLowerCase();
      const { data: existingAttempts } = await supabase
        .from("mathletics_scores")
        .select("id, user_id, username, points, score, total_questions")
        .eq("league_code", cleanLeagueCode)
        .eq("day_number", dayNumber);

      const matchingAttempts = (existingAttempts || []).filter(
        (row: any) =>
          row.user_id === playerIdentifier ||
          (row.username && row.username.trim().toLowerCase() === cleanUsername.toLowerCase())
      );

      if (matchingAttempts.length > 0) {
        return NextResponse.json(
          {
            error: isSprintDuel
              ? "Sprint Duels allow exactly 1 attempt per scholar to preserve competitive integrity."
              : `Day ${dayNumber} sprint has already been submitted. Scores are locked to ensure fair standings.`,
            alreadyAttempted: true,
          },
          { status: 409 }
        );
      }

      // Insert score row
      const { data: inserted, error: insertError } = await supabase
        .from("mathletics_scores")
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
            agility_score: agilityScore,
            points,
            duration_seconds: durationSeconds,
            question_results: questionResults,
          },
        ])
        .select()
        .maybeSingle();

      if (insertError) {
        console.warn("Supabase mathletics_scores insert warning:", insertError.message);
        return NextResponse.json({
          success: true,
          stored: false,
          dayNumber,
          points,
          agilityScore,
        });
      }

      return NextResponse.json({
        success: true,
        stored: true,
        dayNumber,
        points,
        agilityScore,
        data: inserted,
      });
    } catch (e: any) {
      return NextResponse.json({
        success: true,
        stored: false,
        points,
        agilityScore,
        dayNumber: 1,
      });
    }
  } catch (err: any) {
    console.error("Error submitting mathletics league score:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
