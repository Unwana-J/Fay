import { NextRequest, NextResponse } from "next/server";
import { getClientIp, checkRateLimit, isBannedIdentifier } from "@/lib/security-guard";
import {
  aiReviewContest,
  buildOverrideMap,
  findExistingContest,
  findQuestion,
  isAdminRequest,
  listContests,
  loadAnswerOverrides,
  saveContest,
  statusFromAi,
  updateContestStatus,
  type ContestStatus,
} from "@/lib/trivia-contests";

export const dynamic = "force-dynamic";

/**
 * POST: a player contests an answer. Gemini reviews immediately.
 * GET ?overrides=1: public map of accepted answer overrides (used to regrade scores).
 * GET: admin list of contests (requires x-admin-key).
 * PATCH: admin accepts / rejects a contest (requires x-admin-key).
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`contest:${ip}`, 8, 300);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many contests. Please try again shortly.", retryAfter: rate.retryAfter },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { questionId, selected, reason, userId, username, leagueCode, dayNumber } = body || {};

    const q = typeof questionId === "string" ? findQuestion(questionId) : undefined;
    if (!q) return NextResponse.json({ error: "Unknown question." }, { status: 400 });

    const selectedIdx = Number(selected);
    if (!Number.isInteger(selectedIdx) || selectedIdx < 0 || selectedIdx >= q.options.length) {
      return NextResponse.json({ error: "Invalid option." }, { status: 400 });
    }
    if (selectedIdx === q.answer) {
      return NextResponse.json({ error: "That option is already the official answer." }, { status: 400 });
    }
    if ((username && isBannedIdentifier(username)) || (userId && isBannedIdentifier(userId))) {
      return NextResponse.json({ error: "Access prohibited." }, { status: 403 });
    }

    // Reuse an existing verdict for the same question + option so everyone gets the same outcome
    const existing = await findExistingContest(q.id, selectedIdx);
    if (existing && existing.status !== "pending") {
      const overrides = await loadAnswerOverrides(true);
      return NextResponse.json({ success: true, contest: existing, reused: true, overrides });
    }

    const ai = await aiReviewContest(q, selectedIdx, typeof reason === "string" ? reason : undefined);
    const status = statusFromAi(ai.verdict, ai.confidence);

    const contest = await saveContest({
      questionId: q.id,
      questionText: q.question,
      officialAnswer: q.answer,
      contestedAnswer: selectedIdx,
      reason: typeof reason === "string" ? reason.trim().slice(0, 500) : undefined,
      userId: typeof userId === "string" ? userId : undefined,
      username: typeof username === "string" ? username.slice(0, 60) : undefined,
      leagueCode: typeof leagueCode === "string" ? leagueCode.toUpperCase().slice(0, 12) : undefined,
      dayNumber: Number.isInteger(dayNumber) ? dayNumber : undefined,
      status,
      aiVerdict: ai.verdict,
      aiConfidence: ai.confidence,
      aiReason: ai.reason,
    });

    const overrides = await loadAnswerOverrides(true);
    return NextResponse.json({ success: true, contest, overrides });
  } catch (err: any) {
    console.error("[contest] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const wantsOverrides = req.nextUrl.searchParams.get("overrides");
    if (wantsOverrides) {
      const overrides = await loadAnswerOverrides();
      return NextResponse.json({ success: true, overrides });
    }

    if (!isAdminRequest(req.headers.get("x-admin-key"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const contests = await listContests();
    return NextResponse.json({ success: true, contests, overrides: buildOverrideMap(contests) });
  } catch (err: any) {
    console.error("[contest] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!isAdminRequest(req.headers.get("x-admin-key"))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id, decision } = await req.json();
    if (!id || (decision !== "accept" && decision !== "reject")) {
      return NextResponse.json({ error: "id and decision (accept|reject) are required" }, { status: 400 });
    }
    const status: ContestStatus = decision === "accept" ? "admin_accepted" : "admin_rejected";
    const ok = await updateContestStatus(id, status);
    const overrides = await loadAnswerOverrides(true);
    return NextResponse.json({ success: ok, overrides });
  } catch (err: any) {
    console.error("[contest] PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
