import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerId, playerName, avatar } = body;

    if (!playerId) {
      return NextResponse.json({ error: "Missing playerId" }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      // In-memory fallback if Supabase not configured in local sandbox
      return NextResponse.json({
        player: {
          playerId,
          displayName: playerName || "Scholar",
          avatar: avatar || null,
          scholarPoints: 0,
          roundsPlayed: 0,
          streak: 0,
          hints: 3,
          seals: 0,
          ownsMarathon: false,
        },
      });
    }

    // Upsert or fetch existing player profile
    let { data: player } = await supabase
      .from("vatar_players")
      .select("*")
      .eq("player_id", playerId)
      .maybeSingle();

    if (!player) {
      const { data: newPlayer } = await supabase
        .from("vatar_players")
        .insert({
          player_id: playerId,
          display_name: playerName || "Scholar",
          avatar: avatar || null,
          hints: 3,
        })
        .select()
        .single();
      player = newPlayer;
    }

    return NextResponse.json({
      player: {
        playerId: player.player_id,
        displayName: player.display_name,
        avatar: player.avatar,
        scholarPoints: player.scholar_points,
        roundsPlayed: player.rounds_played,
        streak: player.streak,
        hints: player.hints,
        seals: player.seals,
        ownsMarathon: player.owns_marathon,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
