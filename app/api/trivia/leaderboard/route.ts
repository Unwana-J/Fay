import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sanitizeScholarName, isBlockedHateSpeech } from "@/lib/name-moderation";
import { isBotPattern, isBannedIdentifier } from "@/lib/security-guard";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");
    const questionIdsParam = searchParams.get("qIds") || searchParams.get("questionIds");

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        configured: false,
        scores: [],
      });
    }

    // If query specifies challengeId and/or questionIds deck signature, match either
    const candidateIds = Array.from(
      new Set(
        [challengeId, questionIdsParam]
          .filter(Boolean)
          .map((s) => s!.trim())
      )
    );

    let query = supabase
      .from("trivia_scores")
      .select("id, created_at, username, avatar, score, total, pct, grade_label, xp_earned, challenge_id")
      .neq("grade_label", "Load Test")
      .not("username", "ilike", "LoadTest-%")
      .not("username", "ilike", "DbLoad-%")
      .not("username", "ilike", "Crash-%")
      .not("username", "ilike", "%VU%")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (candidateIds.length === 1) {
      query = query.eq("challenge_id", candidateIds[0]);
    } else if (candidateIds.length > 1) {
      query = query.in("challenge_id", candidateIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase leaderboard query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── CASE 1: SPECIFIC CHALLENGE BOARD (Locked strictly to FIRST attempt per player) ──
    if (candidateIds.length > 0) {
      const selectedByPlayer = new Map<string, (typeof data)[0]>();
      const chrono = [...(data || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      chrono.forEach((row) => {
        if (!row.username || isBlockedHateSpeech(row.username)) return;
        if (isBotPattern(row.username, row.grade_label) || isBannedIdentifier(row.username)) return;
        const cleanName = sanitizeScholarName(row.username);
        if (isBannedIdentifier(cleanName)) return;
        const key = cleanName.trim().toLowerCase();
        if (!selectedByPlayer.has(key)) {
          selectedByPlayer.set(key, {
            ...row,
            username: cleanName,
          });
        }
      });

      const challengeRanked = Array.from(selectedByPlayer.values()).sort((a, b) => {
        if (b.pct !== a.pct) return b.pct - a.pct;
        return b.score - a.score;
      });

      return NextResponse.json({
        configured: true,
        scores: challengeRanked,
      });
    }

    // ── CASE 2: GLOBAL SCHOLARS LEADERBOARD ───────────────────────────────────────
    // Aggregates ALL games played by each scholar:
    // - Total XP accumulated across games
    // - Count of unique games played
    // - Best high-score run (pct & score)
    const playerAggregates = new Map<
      string,
      {
        id: string;
        username: string;
        avatar: string;
        score: number;
        total: number;
        pct: number;
        grade_label?: string;
        xp_earned: number;
        total_xp: number;
        games_played: number;
        created_at: string;
      }
    >();

    (data || []).forEach((row) => {
      if (!row.username || isBlockedHateSpeech(row.username)) return;
      if (isBotPattern(row.username, row.grade_label) || isBannedIdentifier(row.username)) return;
      const cleanName = sanitizeScholarName(row.username);
      if (isBannedIdentifier(cleanName)) return;
      const key = cleanName.trim().toLowerCase();
      const rowXp =
        typeof row.xp_earned === "number" && row.xp_earned > 0
          ? row.xp_earned
          : (row.score || 0) * 5;

      const existing = playerAggregates.get(key);

      if (!existing) {
        playerAggregates.set(key, {
          id: row.id || `scholar-${key}`,
          username: cleanName,
          avatar: row.avatar || "/avatars/avatar-scholar.svg",
          score: row.score,
          total: row.total,
          pct: row.pct,
          grade_label: row.grade_label,
          xp_earned: rowXp,
          total_xp: rowXp,
          games_played: 1,
          created_at: row.created_at,
        });
      } else {
        existing.games_played += 1;
        existing.total_xp += rowXp;
        existing.xp_earned = existing.total_xp;

        // Keep best high-water mark for accuracy display
        if (
          row.pct > existing.pct ||
          (row.pct === existing.pct && row.score > existing.score)
        ) {
          existing.score = row.score;
          existing.total = row.total;
          existing.pct = row.pct;
          existing.grade_label = row.grade_label;
        }

        // Keep latest avatar if not default
        if (row.avatar && !row.avatar.includes("default")) {
          existing.avatar = row.avatar;
        }
      }
    });

    // Rank primary: Total XP accumulated
    // Secondary: Games played (reward consistency and unique games)
    // Tertiary: Best Accuracy %
    // Quaternary: Best raw score
    const globalRanked = Array.from(playerAggregates.values()).sort((a, b) => {
      if (b.total_xp !== a.total_xp) return b.total_xp - a.total_xp;
      if (b.games_played !== a.games_played) return b.games_played - a.games_played;
      if (b.pct !== a.pct) return b.pct - a.pct;
      return b.score - a.score;
    });

    return NextResponse.json({
      configured: true,
      scores: globalRanked,
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
