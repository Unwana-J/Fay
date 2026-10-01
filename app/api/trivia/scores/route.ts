import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      username,
      avatar,
      score,
      total,
      pct,
      gradeLabel,
      xpEarned,
      challengeId,
      questionIds,
      deviceId,
    } = body;

    if (!username || typeof score !== "number" || typeof total !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      // Graceful fallback if user hasn't added Supabase env vars yet
      return NextResponse.json({
        success: true,
        stored: false,
        message: "Supabase not configured yet. Score recorded locally.",
      });
    }

    const { data, error } = await supabase.from("trivia_scores").insert([
      {
        username: username.trim(),
        avatar: avatar || "/avatars/avatar-scholar.svg",
        score,
        total,
        pct: pct ?? Math.round((score / total) * 100),
        grade_label: gradeLabel || null,
        xp_earned: xpEarned || 0,
        challenge_id: challengeId || null,
        question_ids: questionIds || [],
        device_id: deviceId || null,
      },
    ]).select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, stored: true, data });
  } catch (err) {
    console.error("Error submitting score:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username || !isSupabaseConfigured || !supabase) {
      return NextResponse.json({ dates: [] });
    }

    const { data, error } = await supabase
      .from("trivia_scores")
      .select("created_at")
      .ilike("username", username.trim())
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !data) {
      return NextResponse.json({ dates: [] });
    }

    const dates = Array.from(
      new Set(
        data
          .filter((row) => row.created_at)
          .map((row) => new Date(row.created_at).toISOString().slice(0, 10))
      )
    );

    return NextResponse.json({ dates });
  } catch (err) {
    console.error("Error fetching user scores dates:", err);
    return NextResponse.json({ dates: [] });
  }
}
