import { NextRequest, NextResponse } from "next/server";
import { getFreshQuestions, type TriviaDifficultyFilter } from "@/lib/trivia-questions";
import { createSignedRoundToken } from "@/lib/vatar/server";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerId, difficulty = "random", durationMinutes = 5 } = body;

    if (!playerId || typeof playerId !== "string") {
      return NextResponse.json({ error: "Missing or invalid playerId" }, { status: 400 });
    }

    // Question count based on duration
    const count = durationMinutes === 15 ? 30 : durationMinutes === 10 ? 20 : 10;
    const durationSeconds = durationMinutes * 60;

    // Fetch questions from question bank without exposing correct answer indices
    const { questions: selectedQuestions } = getFreshQuestions(count, [], difficulty as TriviaDifficultyFilter);

    // Filter out correct answers before sending questions to the client
    const clientQuestions = selectedQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
    }));

    const roundId = "rnd_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const questionIds = selectedQuestions.map((q) => q.id);

    // Create a tamper-proof HMAC-signed round token (stateless, zero DB writes here)
    const roundToken = createSignedRoundToken({
      roundId,
      playerId,
      questionIds,
      durationSeconds,
      startedAt: Date.now(),
      difficulty: String(difficulty),
    });

    return NextResponse.json({
      roundId,
      roundToken,
      questions: clientQuestions,
      durationSeconds,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
