import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sanitizeScholarName } from "@/lib/name-moderation";
import {
  calculateMathleticsPoints,
  type MathleticsLeagueScore,
} from "@/lib/mathletics-league";
import { persistMathleticsScoreRow } from "@/lib/mathletics-db";
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
      leagueTitle,
      creatorName,
      durationDays,
      format,
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

    const rawClientPoints = Number(body.agilityScore || body.points || 0);
    const minValid = score * 100;
    const maxValid = score * 150;
    const agilityScore =
      score > 0 && rawClientPoints >= minValid && rawClientPoints <= maxValid
        ? Math.round(rawClientPoints)
        : calculateMathleticsPoints(score, totalQuestions, durationSeconds);
    const points = agilityScore;
    const playerIdentifier = userId || cleanUsername.toLowerCase();
    const dayNumber = typeof clientDayNumber === "number" && clientDayNumber >= 1 ? clientDayNumber : 1;

    const scoreRow: MathleticsLeagueScore = {
      leagueCode: cleanLeagueCode,
      userId: playerIdentifier,
      username: cleanUsername,
      avatar: avatar || "/avatars/avatar-scholar.svg",
      dayNumber,
      date: today,
      score,
      totalQuestions,
      agilityScore,
      points,
      durationSeconds,
      questionResults,
    };

    const persisted = await persistMathleticsScoreRow(scoreRow, {
      title: leagueTitle,
      creatorName,
      durationDays: typeof durationDays === "number" ? durationDays : undefined,
      format,
    });

    return NextResponse.json({
      success: true,
      stored: persisted.stored,
      dayNumber,
      points,
      agilityScore,
      data: persisted.data,
      error: persisted.error,
    });
  } catch (err: any) {
    console.error("Error submitting mathletics league score:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
