import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type PlaySessionGame = "sprint" | "trivia" | "mathletics" | "articulate" | "podium";

export interface LogPlaySessionInput {
  userId?: string | null;
  deviceId?: string | null;
  username?: string | null;
  avatar?: string | null;
  game: PlaySessionGame;
  mode?: "solo" | "challenge" | "league" | "room";
  durationSeconds: number;
  playerCount?: number;
  score?: number;
  total?: number;
  xpEarned?: number;
  sourceTable?: string;
  meta?: Record<string, unknown>;
}

/**
 * Best-effort server-side logger into `public.play_sessions`.
 * Never throws so gameplay routes are unaffected if the table has not been migrated yet.
 */
export async function logPlaySession(input: LogPlaySessionInput): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const durationSeconds = Math.max(1, Math.round(Number(input.durationSeconds) || 0));
  const playerCount = Math.max(1, Math.round(Number(input.playerCount) || 1));

  try {
    const { error } = await supabase.from("play_sessions").insert([
      {
        user_id: input.userId || null,
        device_id: input.deviceId || null,
        username: input.username || null,
        avatar: input.avatar || null,
        game: input.game,
        mode: input.mode || "solo",
        duration_seconds: durationSeconds,
        player_count: playerCount,
        score: typeof input.score === "number" ? input.score : null,
        total: typeof input.total === "number" ? input.total : null,
        xp_earned: typeof input.xpEarned === "number" ? input.xpEarned : 0,
        source_table: input.sourceTable || null,
        meta: input.meta || {},
      },
    ]);
    if (error) {
      // Quietly ignore if play_sessions migration hasn't been executed yet
    }
  } catch {
    // Non-blocking
  }
}
