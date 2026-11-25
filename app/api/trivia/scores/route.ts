import { NextRequest, NextResponse, after } from "next/server";
import { sendSocialPushToUsers } from "@/lib/push-sender";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sanitizeScholarName } from "@/lib/name-moderation";
import { logPlaySession } from "@/lib/play-sessions";
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

    // 1. IP Rate Limiting: Max 1 score submission per 10 seconds, max 6 per minute
    const rateCheck = checkRateLimit(`trivia-score:${clientIp}`, 6, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many score submissions. Please pace your rounds.", retryAfter: rateCheck.retryAfter },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter || 10) } }
      );
    }

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
      durationSeconds,
    } = body;

    if (!username || typeof score !== "number" || typeof total !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 2. Anti-Bot / Load-Test Pattern Detection
    if (isBotPattern(username, gradeLabel)) {
      console.warn(`[Security] Blocked bot/load-test submission: "${username}" [${gradeLabel}] from IP: ${clientIp}`);
      return NextResponse.json({ error: "Automated test patterns not permitted" }, { status: 403 });
    }

    // 3. Banned Account / Malicious Identifier Check
    if (isBannedIdentifier(username) || (deviceId && isBannedIdentifier(deviceId))) {
      console.warn(`[Security] Blocked banned identifier submission: "${username}" from IP: ${clientIp}`);
      return NextResponse.json({ error: "Account suspended from public leaderboards" }, { status: 403 });
    }

    // 4. Score Plausibility & Sanity Validation
    const scoreValidation = isPlausibleScore(score, total, xpEarned);
    if (!scoreValidation.valid) {
      return NextResponse.json({ error: scoreValidation.reason || "Implausible score values" }, { status: 400 });
    }

    const cleanUsername = sanitizeScholarName(username);

    if (isBannedIdentifier(cleanUsername)) {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    if (!isSupabaseConfigured || !supabase) {
      // Graceful fallback if user hasn't added Supabase env vars yet
      return NextResponse.json({
        success: true,
        stored: false,
        message: "Supabase not configured yet. Score recorded locally.",
      });
    }

    const baseRow = {
      username: cleanUsername,
      avatar: avatar || "/avatars/avatar-scholar.svg",
      score,
      total,
      pct: pct ?? Math.round((score / total) * 100),
      grade_label: gradeLabel || null,
      xp_earned: xpEarned || 0,
      challenge_id: challengeId || null,
      question_ids: questionIds || [],
      device_id: deviceId || null,
    };

    const cleanDuration =
      typeof durationSeconds === "number" && durationSeconds > 0
        ? Math.min(3600, Math.max(3, Math.round(durationSeconds)))
        : null;

    let { data, error } = await supabase
      .from("trivia_scores")
      .insert([cleanDuration ? { ...baseRow, duration_seconds: cleanDuration } : baseRow])
      .select();

    if (error && cleanDuration && error.message?.includes("duration_seconds")) {
      const retry = await supabase.from("trivia_scores").insert([baseRow]).select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logPlaySession({
      userId: deviceId || null,
      deviceId: deviceId || null,
      username: cleanUsername,
      avatar: avatar || "/avatars/avatar-scholar.svg",
      game: "trivia",
      mode: challengeId ? "challenge" : "solo",
      durationSeconds: cleanDuration ?? Math.max(15, total * 18),
      score,
      total,
      xpEarned: xpEarned || 0,
      sourceTable: "trivia_scores",
    });

    if (challengeId && supabase) {
      const db = supabase;
      const challengeRef = String(challengeId);
      const actorDeviceId = typeof deviceId === "string" ? deviceId : null;
      after(async () => {
        const { data: peers } = await db
          .from("trivia_scores")
          .select("device_id")
          .eq("challenge_id", challengeRef)
          .limit(30);
        const peerIds = (peers || [])
          .map((r: { device_id?: string | null }) => r.device_id || "")
          .filter(Boolean);
        await sendSocialPushToUsers(
          peerIds,
          {
            title: `${cleanUsername} answered your Trivia challenge`,
            body: `They scored ${score}/${total}. See how you compare.`,
            url: "/games/trivia",
            tag: `fey-trivia-challenge-${challengeRef}`,
            template: "social_trivia_challenge",
            renotify: true,
          },
          { excludeUserId: actorDeviceId }
        );
      });
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
      return NextResponse.json({ dates: [], records: [] });
    }

    const { data, error } = await supabase
      .from("trivia_scores")
      .select("id, score, total, pct, grade_label, xp_earned, challenge_id, question_ids, created_at")
      .ilike("username", username.trim())
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !data) {
      return NextResponse.json({ dates: [], records: [] });
    }

    const dates = Array.from(
      new Set(
        data
          .filter((row) => row.created_at)
          .map((row) => new Date(row.created_at).toISOString().slice(0, 10))
      )
    );

    return NextResponse.json({ dates, records: data });
  } catch (err) {
    console.error("Error fetching user scores dates:", err);
    return NextResponse.json({ dates: [], records: [] });
  }
}

const GENERIC_PLACEHOLDER_NAMES = new Set([
  "scholar",
  "learner",
  "player",
  "you",
  "anonymous",
  "guest",
  "challenger",
]);

export async function PATCH(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`trivia-patch:${clientIp}`, 10, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Too many updates. Please wait." }, { status: 429 });
    }

    const body = await req.json();
    const { oldUsername, newUsername, deviceId, oldDeviceId, newDeviceId, authUserId } = body;

    if (!newUsername || typeof newUsername !== "string") {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    if (isBotPattern(newUsername) || isBannedIdentifier(newUsername)) {
      return NextResponse.json({ error: "Prohibited username" }, { status: 403 });
    }

    const cleanNewName = sanitizeScholarName(newUsername);
    if (isBannedIdentifier(cleanNewName)) {
      return NextResponse.json({ error: "Prohibited username" }, { status: 403 });
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ success: true, stored: false });
    }

    const cleanOldName =
      typeof oldUsername === "string" && oldUsername.trim()
        ? sanitizeScholarName(oldUsername.trim())
        : "";
    const isGenericOldName =
      !cleanOldName || GENERIC_PLACEHOLDER_NAMES.has(cleanOldName.toLowerCase());

    const targetDeviceId =
      (typeof newDeviceId === "string" && newDeviceId.trim()) ||
      (typeof authUserId === "string" && authUserId.trim()) ||
      (typeof deviceId === "string" && deviceId.trim()) ||
      null;

    const candidateIds = Array.from(
      new Set(
        [deviceId, oldDeviceId, newDeviceId, authUserId]
          .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
          .map((v) => v.trim())
      )
    );

    if (candidateIds.length === 0 && isGenericOldName) {
      return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
    }

    let triviaUpdated = 0;
    let leagueUpdated = 0;

    // 1. Update trivia_scores (matching any of the user's known device IDs)
    const triviaPayload: Record<string, string> = { username: cleanNewName };
    if (targetDeviceId) {
      triviaPayload.device_id = targetDeviceId;
    }

    if (candidateIds.length > 0) {
      const { data, error } = await supabase
        .from("trivia_scores")
        .update(triviaPayload)
        .in("device_id", candidateIds)
        .select("id");

      if (error) {
        console.error("Error updating trivia_scores by device_id:", error);
      } else {
        triviaUpdated += data?.length || 0;
      }

      // Also catch legacy trivia_scores rows where device_id was null
      if (!isGenericOldName) {
        const { data: legacyData } = await supabase
          .from("trivia_scores")
          .update(triviaPayload)
          .ilike("username", cleanOldName)
          .is("device_id", null)
          .select("id");
        triviaUpdated += legacyData?.length || 0;
      }
    } else if (!isGenericOldName) {
      const { data, error } = await supabase
        .from("trivia_scores")
        .update({ username: cleanNewName })
        .ilike("username", cleanOldName)
        .select("id");

      if (error) {
        console.error("Error updating trivia_scores by username:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      triviaUpdated += data?.length || 0;
    }

    // 2. Update league_scores (both direct user_id matches and __ext_* bonus extension rows)
    try {
      if (candidateIds.length > 0) {
        const { data: directLeague } = await supabase
          .from("league_scores")
          .update({ username: cleanNewName })
          .in("user_id", candidateIds)
          .neq("username", "__LEAGUE_SYNC__")
          .select("id");
        leagueUpdated += directLeague?.length || 0;

        for (const id of candidateIds) {
          const { data: extLeague } = await supabase
            .from("league_scores")
            .update({ username: cleanNewName })
            .like("user_id", `${id}__ext_%`)
            .neq("username", "__LEAGUE_SYNC__")
            .select("id");
          leagueUpdated += extLeague?.length || 0;
        }
      }

      if (!isGenericOldName) {
        // Legacy fallback rows where user_id was set to oldUsername.toLowerCase() (or when no deviceId was passed)
        let legacyLeagueQuery = supabase
          .from("league_scores")
          .update({ username: cleanNewName })
          .ilike("username", cleanOldName)
          .neq("username", "__LEAGUE_SYNC__");

        if (candidateIds.length > 0) {
          legacyLeagueQuery = legacyLeagueQuery.eq("user_id", cleanOldName.toLowerCase());
        }

        const { data: legacyLeague } = await legacyLeagueQuery.select("id");
        leagueUpdated += legacyLeague?.length || 0;
      }
    } catch (leagueErr) {
      console.warn("Could not propagate rename to league_scores:", leagueErr);
    }

    // 3. Best-effort propagation to mathletics_scores and play_sessions
    try {
      if (candidateIds.length > 0) {
        await supabase
          .from("mathletics_scores")
          .update({ username: cleanNewName })
          .in("user_id", candidateIds)
          .neq("username", "__LEAGUE_SYNC__");

        const sessionPayload: Record<string, string> = { username: cleanNewName };
        if (targetDeviceId) {
          sessionPayload.user_id = targetDeviceId;
          sessionPayload.device_id = targetDeviceId;
        }
        await supabase
          .from("play_sessions")
          .update(sessionPayload)
          .or(`device_id.in.(${candidateIds.join(",")}),user_id.in.(${candidateIds.join(",")})`);
      }
    } catch {
      // Optional tables may not exist in all environments
    }

    return NextResponse.json({
      success: true,
      updatedCount: triviaUpdated + leagueUpdated,
      triviaUpdated,
      leagueUpdated,
    });
  } catch (err) {
    console.error("Error patching score username:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

