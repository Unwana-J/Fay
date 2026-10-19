import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sanitizeScholarName } from "@/lib/name-moderation";
import { calculateLeaguePoints, getLeagueStatus, type FriendshipLeague } from "@/lib/trivia-league";
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
    const rateCheck = checkRateLimit(`league-score:${clientIp}`, 6, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please pace your rounds.", retryAfter: rateCheck.retryAfter },
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
      totalQuestions,
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

    const points = calculateLeaguePoints(score, totalQuestions, durationSeconds);

    if (!isSupabaseConfigured || !supabase) {
      // Local calculation fallback
      return NextResponse.json({
        success: true,
        stored: false,
        points,
        message: "Score recorded locally.",
      });
    }

    try {
      // 1. Fetch league to determine the active day
      const { data: leagueRow, error: leagueError } = await supabase
        .from("friendship_leagues")
        .select("*")
        .eq("code", cleanLeagueCode)
        .maybeSingle();

      let dayNumber = 1;

      if (leagueRow) {
        const status = getLeagueStatus(leagueRow.start_date, Math.max(leagueRow.duration_days || 5, clientDayNumber || 5), today);
        if (
          typeof clientDayNumber === "number" &&
          clientDayNumber >= 1 &&
          clientDayNumber <= 100
        ) {
          dayNumber = clientDayNumber;
        } else {
          dayNumber = status.dayNumber || 1;
        }
      } else if (typeof clientDayNumber === "number" && clientDayNumber >= 1) {
        dayNumber = clientDayNumber;
      }

      // 2. Check if user has already submitted an attempt for today
      const playerIdentifier = userId || cleanUsername.toLowerCase();
      const { data: existingAttempts } = await supabase
        .from("league_scores")
        .select("id, user_id, username, points, score, total_questions")
        .eq("league_code", cleanLeagueCode)
        .eq("day_number", dayNumber);

      const matchingAttempts = (existingAttempts || []).filter(
        (row: any) =>
          row.user_id === playerIdentifier ||
          String(row.user_id || "").startsWith(`${playerIdentifier}__ext_`) ||
          (row.username && row.username.trim().toLowerCase() === cleanUsername.toLowerCase())
      );

      const existingRecord = matchingAttempts.sort(
        (a: any, b: any) => (b.total_questions || 0) - (a.total_questions || 0) || (b.points || 0) - (a.points || 0)
      )[0];

      if (existingRecord) {
        if (body.isBonusExtension || totalQuestions > (existingRecord.total_questions || 0)) {
          const { data: updated, error: updateError } = await supabase
            .from("league_scores")
            .update({
              score,
              total_questions: totalQuestions,
              points,
              duration_seconds: durationSeconds,
              question_results: questionResults,
            })
            .eq("id", existingRecord.id)
            .select()
            .maybeSingle();

          // If RLS FOR UPDATE policy is not enabled in Supabase, updated will be null — fall back to INSERT
          if (updateError || !updated) {
            const { data: extInserted } = await supabase
              .from("league_scores")
              .insert([
                {
                  league_code: cleanLeagueCode,
                  user_id: `${playerIdentifier}__ext_${Date.now()}`,
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
              .maybeSingle();

            return NextResponse.json({
              success: true,
              stored: Boolean(extInserted),
              isBonusExtension: true,
              dayNumber,
              points,
              data: extInserted,
            });
          }

          return NextResponse.json({
            success: true,
            stored: true,
            isBonusExtension: true,
            dayNumber,
            points,
            data: updated,
          });
        }

        return NextResponse.json({
          error: `Drop ${dayNumber} has already been completed. Tournament drops cannot be reattempted to ensure fair and balanced scores.`,
          alreadyAttempted: true,
        }, { status: 409 });
      }

      // 3. Insert score row into database
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
        .maybeSingle();

      if (insertError) {
        console.error("Supabase league score insert error:", insertError);
        return NextResponse.json({
          success: true,
          stored: false,
          dayNumber,
          points,
        });
      }

      return NextResponse.json({
        success: true,
        stored: true,
        dayNumber,
        points,
        data: inserted,
      });
    } catch (e: any) {
      return NextResponse.json({
        success: true,
        stored: false,
        points,
        dayNumber: 1,
      });
    }
  } catch (err: any) {
    console.error("Error submitting league score:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
