import { NextRequest, NextResponse } from "next/server";
import { getQuestionsByIds } from "@/lib/trivia-questions";
import { verifySignedRoundToken } from "@/lib/vatar/server";
import { getTriviaPerformanceRemark } from "@/lib/trivia-remarks";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roundToken, answers, playerName, avatar } = body;

    if (!roundToken || !answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Missing roundToken or answers payload" }, { status: 400 });
    }

    // 1. Verify tamper-proof HMAC round token
    const tokenPayload = verifySignedRoundToken(roundToken);
    if (!tokenPayload) {
      return NextResponse.json({ error: "Invalid or forged round token" }, { status: 403 });
    }

    const { roundId, playerId, questionIds, durationSeconds, startedAt, difficulty } = tokenPayload;

    // Check reasonable duration sanity (allow generous grace window for network lag)
    const elapsedSeconds = (Date.now() - startedAt) / 1000;
    if (elapsedSeconds > durationSeconds + 120) {
      return NextResponse.json({ error: "Round submission exceeded time window" }, { status: 400 });
    }

    // 2. Fetch authoritative questions directly by IDs
    const authoritativeQuestions = getQuestionsByIds(questionIds);
    const questionMap = new Map(authoritativeQuestions.map((q) => [q.id, q]));

    let correctCount = 0;
    const explanations: Record<string, { correct: boolean; answer: number; explanation: string }> = {};

    for (const qId of questionIds) {
      const q = questionMap.get(qId);
      if (!q) continue;

      const userChoice = answers[qId];
      const isCorrect = userChoice === q.answer;
      if (isCorrect) {
        correctCount++;
      }

      explanations[qId] = {
        correct: isCorrect,
        answer: q.answer,
        explanation: q.explanation || "",
      };
    }

    const total = questionIds.length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Scoring formula: Base points + difficulty multiplier
    const diffMultiplier = difficulty === "hard" ? 3 : difficulty === "medium" ? 2 : 1;
    const roundScore = correctCount * 100 * diffMultiplier;
    // Lifetime Scholar points increment (gives points even for participation)
    const pointsAwarded = Math.max(10, roundScore);

    const remark = getTriviaPerformanceRemark(pct);

    // 3. Single DB Write if Supabase is configured (upsert profile + record round)
    let totalScholarPoints = pointsAwarded;
    if (isSupabaseConfigured && supabase) {
      try {
        // Fetch or create profile
        const { data: existingPlayer } = await supabase
          .from("vatar_players")
          .select("scholar_points, rounds_played, best_round, streak")
          .eq("player_id", playerId)
          .maybeSingle();

        const newPoints = (existingPlayer?.scholar_points || 0) + pointsAwarded;
        const newRounds = (existingPlayer?.rounds_played || 0) + 1;
        const newBest = Math.max(existingPlayer?.best_round || 0, roundScore);
        const newStreak = (existingPlayer?.streak || 0) + 1;
        totalScholarPoints = newPoints;

        await supabase.from("vatar_players").upsert({
          player_id: playerId,
          display_name: playerName || "Scholar",
          avatar: avatar || null,
          scholar_points: newPoints,
          rounds_played: newRounds,
          best_round: newBest,
          streak: newStreak,
          updated_at: new Date().toISOString(),
        });

        await supabase.from("vatar_rounds").insert({
          round_id: roundId,
          player_id: playerId,
          difficulty,
          duration_s: Math.round(elapsedSeconds),
          score: roundScore,
          total,
          pct,
          points_awarded: pointsAwarded,
        });
      } catch (dbErr) {
        console.warn("[Vatar DB] Non-fatal DB save error:", dbErr);
      }
    }

    return NextResponse.json({
      roundId,
      score: roundScore,
      correct: correctCount,
      total,
      pct,
      pointsAwarded,
      totalScholarPoints,
      remark,
      explanations,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
