import { NextRequest, NextResponse } from "next/server";
import { saveFeedback, getAllFeedback } from "@/lib/admin-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rating, promptType, message, userId, username, path } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const saved = await saveFeedback({
      rating,
      promptType: rating <= 3 ? "what_could_be_better" : "extra_star_if",
      message,
      userId,
      username,
      path,
    });

    return NextResponse.json({ success: true, feedback: saved });
  } catch (err: any) {
    console.error("Error saving feedback:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const items = await getAllFeedback();
    return NextResponse.json({ success: true, items });
  } catch (err: any) {
    console.error("Error fetching feedback:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
