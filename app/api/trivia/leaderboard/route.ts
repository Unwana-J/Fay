import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        configured: false,
        scores: [],
      });
    }

    let query = supabase
      .from("trivia_scores")
      .select("id, created_at, username, avatar, score, total, pct, grade_label, xp_earned, challenge_id")
      .order("pct", { ascending: false })
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);

    if (challengeId) {
      query = query.eq("challenge_id", challengeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase leaderboard query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Deduplicate: If challengeId is set, lock strictly to the FIRST attempt (earliest created_at).
    // For global leaderboards, keep the best run.
    const selectedByPlayer = new Map<string, (typeof data)[0]>();

    if (challengeId) {
      // Sort chronologically ascending to capture the first attempt
      const chrono = [...(data || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      chrono.forEach((row) => {
        const key = row.username.trim().toLowerCase();
        if (!selectedByPlayer.has(key)) {
          selectedByPlayer.set(key, row);
        }
      });
    } else {
      (data || []).forEach((row) => {
        const key = row.username.trim().toLowerCase();
        const existing = selectedByPlayer.get(key);
        if (!existing || row.pct > existing.pct || (row.pct === existing.pct && row.score > existing.score)) {
          selectedByPlayer.set(key, row);
        }
      });
    }

    const uniqueScores = Array.from(selectedByPlayer.values()).sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct;
      return b.score - a.score;
    });

    return NextResponse.json({
      configured: true,
      scores: uniqueScores,
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
