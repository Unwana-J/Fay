import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sanitizeScholarName, isBlockedHateSpeech } from "@/lib/name-moderation";
import { isBotPattern, isBannedIdentifier } from "@/lib/security-guard";

const GENERIC_PLACEHOLDER_NAMES = new Set([
  "scholar",
  "learner",
  "player",
  "you",
  "anonymous",
  "guest",
  "challenger",
]);

function normalizeStableId(rawId: unknown, normName: string): string | null {
  if (typeof rawId !== "string") return null;
  const trimmed = rawId.trim().replace(/__ext_\d+$/, "");
  if (!trimmed) return null;
  if (trimmed.startsWith("__league_sync_")) return null;
  if (trimmed.toLowerCase() === normName) return null;
  return trimmed;
}

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
      .select("id, created_at, username, avatar, score, total, pct, grade_label, xp_earned, challenge_id, device_id")
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
      const seenIds = new Set<string>();
      const chrono = [...(data || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      chrono.forEach((row) => {
        if (!row.username || isBlockedHateSpeech(row.username)) return;
        if (isBotPattern(row.username, row.grade_label) || isBannedIdentifier(row.username)) return;
        const cleanName = sanitizeScholarName(row.username);
        if (isBannedIdentifier(cleanName)) return;
        const normName = cleanName.trim().toLowerCase();
        const stableId = normalizeStableId((row as any).device_id, normName);
        if (stableId && seenIds.has(stableId)) return;
        if (!selectedByPlayer.has(normName)) {
          if (stableId) seenIds.add(stableId);
          selectedByPlayer.set(normName, {
            ...row,
            username: cleanName,
          });
        }
      });

      const challengeRanked = Array.from(selectedByPlayer.values()).sort((a, b) => {
        if (b.pct !== a.pct) return b.pct - a.pct;
        return b.score - a.score;
      });

      return NextResponse.json(
        {
          configured: true,
          scores: challengeRanked,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        }
      );
    }

    // ── CASE 2: GLOBAL SCHOLARS LEADERBOARD ───────────────────────────────────────
    // Aggregates ALL games played by each scholar across:
    // - Solo trivia rounds
    // - High-stakes group challenges
    // - Friendship league tournament drops
    // Unifies renamed accounts that share a stable device_id/user_id (and cross-device
    // rows that share a non-generic username) so renaming never duplicates a scholar.
    interface NormalizedScoreEvent {
      id: string;
      cleanName: string;
      normName: string;
      stableId: string | null;
      avatar: string;
      score: number;
      total: number;
      pct: number;
      grade_label?: string;
      xp: number;
      isLeagueDrop: boolean;
      leagueCode?: string;
      dayNumber?: number;
      challengeId?: string | null;
      createdAt: string;
      timestamp: number;
    }

    const events: NormalizedScoreEvent[] = [];

    // 1. Collect regular trivia & group challenges
    (data || []).forEach((row) => {
      if (!row.username || isBlockedHateSpeech(row.username)) return;
      if (isBotPattern(row.username, row.grade_label) || isBannedIdentifier(row.username)) return;
      const cleanName = sanitizeScholarName(row.username);
      if (isBannedIdentifier(cleanName)) return;
      const normName = cleanName.trim().toLowerCase();
      const rowXp =
        typeof row.xp_earned === "number" && row.xp_earned > 0
          ? row.xp_earned
          : (row.score || 0) * 5;

      events.push({
        id: row.id || `scholar-${normName}`,
        cleanName,
        normName,
        stableId: normalizeStableId((row as any).device_id, normName),
        avatar: row.avatar || "/avatars/avatar-scholar.svg",
        score: row.score || 0,
        total: row.total || 10,
        pct: row.pct || 0,
        grade_label: row.grade_label,
        xp: rowXp,
        isLeagueDrop: false,
        challengeId: row.challenge_id || null,
        createdAt: row.created_at,
        timestamp: new Date(row.created_at).getTime() || 0,
      });
    });

    // 2. Query and collect Friendship League tournament scores
    try {
      const { data: leagueData, error: leagueErr } = await supabase
        .from("league_scores")
        .select("id, created_at, user_id, username, avatar, score, total_questions, points, day_number, league_code")
        .gt("day_number", 0)
        .neq("username", "__LEAGUE_SYNC__")
        .not("username", "ilike", "LoadTest-%")
        .not("username", "ilike", "DbLoad-%")
        .not("username", "ilike", "Crash-%")
        .not("username", "ilike", "%VU%")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (leagueErr) {
        console.warn("Could not query league_scores for global rankings:", leagueErr.message);
      } else if (Array.isArray(leagueData)) {
        leagueData.forEach((row: any) => {
          if (
            !row.username ||
            row.day_number <= 0 ||
            row.username === "__LEAGUE_SYNC__" ||
            String(row.user_id || "").startsWith("__league_sync_")
          ) {
            return;
          }
          if (isBlockedHateSpeech(row.username)) return;
          if (isBotPattern(row.username) || isBannedIdentifier(row.username)) return;
          const cleanName = sanitizeScholarName(row.username);
          if (isBannedIdentifier(cleanName)) return;
          const normName = cleanName.trim().toLowerCase();

          const totalQ = row.total_questions || 5;
          const rowScore = row.score || 0;
          const rowPct = Math.round((rowScore / totalQ) * 100);
          // Tournament drop points include speed velocity + accuracy bonus
          const rowXp =
            typeof row.points === "number" && row.points > 0
              ? row.points
              : rowScore * 25 + 50;

          events.push({
            id: row.id || `scholar-league-${normName}`,
            cleanName,
            normName,
            stableId: normalizeStableId(row.user_id, normName),
            avatar: row.avatar || "/avatars/avatar-scholar.svg",
            score: rowScore,
            total: totalQ,
            pct: rowPct,
            grade_label: `League Drop (${row.league_code || ""})`,
            xp: rowXp,
            isLeagueDrop: true,
            leagueCode: String(row.league_code || "").toUpperCase().trim(),
            dayNumber: Number(row.day_number) || 1,
            createdAt: row.created_at,
            timestamp: new Date(row.created_at).getTime() || 0,
          });
        });
      }
    } catch (lErr: any) {
      console.warn("Error processing league scores for leaderboard:", lErr?.message);
    }

    // Sort all events newest-first so each unified player inherits their latest username & avatar
    events.sort((a, b) => b.timestamp - a.timestamp);

    // Disjoint-Set (Union-Find) to unify rows belonging to the same player across renames & devices
    const parent = events.map((_, idx) => idx);
    const find = (i: number): number => {
      let root = i;
      while (parent[root] !== root) root = parent[root];
      let curr = i;
      while (parent[curr] !== root) {
        const next = parent[curr];
        parent[curr] = root;
        curr = next;
      }
      return root;
    };
    const union = (a: number, b: number) => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) {
        // Keep the smaller index (more recent event) as the canonical root
        if (ra < rb) parent[rb] = ra;
        else parent[ra] = rb;
      }
    };

    const firstByStableId = new Map<string, number>();
    const firstByNormName = new Map<string, number>();

    events.forEach((ev, idx) => {
      if (ev.stableId) {
        const prev = firstByStableId.get(ev.stableId);
        if (prev !== undefined) union(prev, idx);
        else firstByStableId.set(ev.stableId, idx);
      }

      if (!GENERIC_PLACEHOLDER_NAMES.has(ev.normName)) {
        const prev = firstByNormName.get(ev.normName);
        if (prev !== undefined) union(prev, idx);
        else firstByNormName.set(ev.normName, idx);
      }
    });

    // Deduplicate repeated games per unified player before summing XP & counts:
    // - League drops: at most 1 per (player, leagueCode, dayNumber) — prevents __ext_* bonus
    //   extension rows or cross-name replays of the same drop from double-counting.
    // - Group challenges: at most 1 per (player, challengeId) — keeps earliest (first) attempt.
    // - Solo rounds: collapse accidental double-submits (identical score/total/xp within 30s).
    const dedupedLeagueDrops = new Map<string, { root: number; ev: NormalizedScoreEvent }>();
    const dedupedChallenges = new Map<string, { root: number; ev: NormalizedScoreEvent }>();
    const soloEventsByRoot = new Map<number, NormalizedScoreEvent[]>();
    const canonicalIdentityByRoot = new Map<
      number,
      { id: string; username: string; avatar: string; created_at: string }
    >();

    events.forEach((ev, idx) => {
      const root = find(idx);

      // Record newest username & non-default avatar for this player regardless of dedupe
      const ident = canonicalIdentityByRoot.get(root);
      if (!ident) {
        canonicalIdentityByRoot.set(root, {
          id: ev.id,
          username: ev.cleanName,
          avatar: ev.avatar || "/avatars/avatar-scholar.svg",
          created_at: ev.createdAt,
        });
      } else if (
        (!ident.avatar || ident.avatar.includes("avatar-scholar") || ident.avatar.includes("default")) &&
        ev.avatar &&
        !ev.avatar.includes("default")
      ) {
        ident.avatar = ev.avatar;
      }

      if (ev.isLeagueDrop && ev.leagueCode && ev.dayNumber) {
        const dropKey = `${root}::${ev.leagueCode}::${ev.dayNumber}`;
        const existingDrop = dedupedLeagueDrops.get(dropKey);
        if (
          !existingDrop ||
          ev.total > existingDrop.ev.total ||
          (ev.total === existingDrop.ev.total && ev.xp > existingDrop.ev.xp) ||
          (ev.total === existingDrop.ev.total && ev.xp === existingDrop.ev.xp && ev.score > existingDrop.ev.score)
        ) {
          dedupedLeagueDrops.set(dropKey, { root, ev });
        }
      } else if (!ev.isLeagueDrop && ev.challengeId) {
        const challengeKey = `${root}::${ev.challengeId}`;
        const existingChallenge = dedupedChallenges.get(challengeKey);
        // Keep earliest (first) attempt for single-trial group challenges
        if (!existingChallenge || ev.timestamp < existingChallenge.ev.timestamp) {
          dedupedChallenges.set(challengeKey, { root, ev });
        }
      } else {
        const list = soloEventsByRoot.get(root) || [];
        const isDuplicateSubmit = list.some(
          (prev) =>
            prev.score === ev.score &&
            prev.total === ev.total &&
            prev.xp === ev.xp &&
            Math.abs(prev.timestamp - ev.timestamp) <= 30_000
        );
        if (!isDuplicateSubmit) {
          list.push(ev);
          soloEventsByRoot.set(root, list);
        }
      }
    });

    const playerAggregates = new Map<
      number,
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
        league_drops: number;
        created_at: string;
      }
    >();

    const addEventToAggregate = (root: number, ev: NormalizedScoreEvent) => {
      const ident = canonicalIdentityByRoot.get(root);
      const existing = playerAggregates.get(root);

      if (!existing) {
        playerAggregates.set(root, {
          id: ident?.id || ev.id,
          username: ident?.username || ev.cleanName,
          avatar: ident?.avatar || ev.avatar || "/avatars/avatar-scholar.svg",
          score: ev.score,
          total: ev.total,
          pct: ev.pct,
          grade_label: ev.grade_label,
          xp_earned: ev.xp,
          total_xp: ev.xp,
          games_played: 1,
          league_drops: ev.isLeagueDrop ? 1 : 0,
          created_at: ident?.created_at || ev.createdAt,
        });
      } else {
        existing.games_played += 1;
        if (ev.isLeagueDrop) {
          existing.league_drops += 1;
        }
        existing.total_xp += ev.xp;
        existing.xp_earned = existing.total_xp;

        // Keep best high-water mark for accuracy display
        if (
          ev.pct > existing.pct ||
          (ev.pct === existing.pct && ev.score > existing.score)
        ) {
          existing.score = ev.score;
          existing.total = ev.total;
          existing.pct = ev.pct;
          existing.grade_label = ev.grade_label;
        }
      }
    };

    dedupedLeagueDrops.forEach(({ root, ev }) => addEventToAggregate(root, ev));
    dedupedChallenges.forEach(({ root, ev }) => addEventToAggregate(root, ev));
    soloEventsByRoot.forEach((list, root) => {
      list.forEach((ev) => addEventToAggregate(root, ev));
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

    return NextResponse.json(
      {
        configured: true,
        scores: globalRanked,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
