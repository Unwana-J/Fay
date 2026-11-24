import { NextRequest, NextResponse } from "next/server";
import { saveFeedback, getAllFeedback } from "@/lib/admin-data";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp, isBannedIdentifier, isBotPattern } from "@/lib/security-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rate = checkRateLimit(`feedback:${clientIp}`, 6, 300);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many feedback submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { rating, promptType, message, userId, username, path } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (isBotPattern(username) || isBannedIdentifier(username) || (userId && isBannedIdentifier(userId))) {
      return NextResponse.json({ error: "Submission not permitted" }, { status: 403 });
    }

    const saved = await saveFeedback({
      rating,
      promptType: rating <= 3 ? "what_could_be_better" : "extra_star_if",
      message: message.trim().slice(0, 2000),
      userId: typeof userId === "string" ? userId.slice(0, 120) : undefined,
      username: typeof username === "string" ? username.slice(0, 80) : undefined,
      path: typeof path === "string" ? path.slice(0, 200) : undefined,
    });

    return NextResponse.json({ success: true, feedback: saved });
  } catch (err: any) {
    console.error("Error saving feedback:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const items = await getAllFeedback();
    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    console.error("Error fetching feedback:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
