import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  generateRoomCode,
  createInitialRoom,
  memoryRooms,
  ArticulateRoom,
} from "@/lib/articulate-room";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { hostId, hostName, settings } = body;

    const effectiveHostId = (hostId && String(hostId).trim()) || `host-${Math.random().toString(36).slice(2, 9)}`;
    const effectiveHostName = (hostName && String(hostName).trim()) || "Scholar Host";

    // Generate unique code
    let code = generateRoomCode();
    let attempts = 0;
    while (attempts < 5) {
      if (!memoryRooms.has(code)) break;
      code = generateRoomCode();
      attempts++;
    }

    const newRoom: ArticulateRoom = createInitialRoom(
      code,
      { id: effectiveHostId, name: effectiveHostName },
      settings
    );

    // Save in memory cache
    memoryRooms.set(code, newRoom);

    const teamsPayload = {
      teamA: newRoom.teams.teamA,
      teamB: newRoom.teams.teamB,
      player_details: newRoom.player_details || {},
      inactive_players: newRoom.inactive_players || [],
    };

    // Persist in Supabase if available
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("articulate_rooms")
          .insert({
            room_code: newRoom.room_code,
            host_id: newRoom.host_id,
            host_name: newRoom.host_name,
            status: newRoom.status,
            locked: newRoom.locked,
            settings: newRoom.settings,
            teams: teamsPayload,
            current_turn: newRoom.current_turn,
            deck: newRoom.deck,
            current_word_index: newRoom.current_word_index,
            round_words_scored: newRoom.round_words_scored,
            round_words_passed: newRoom.round_words_passed,
            active_players: newRoom.active_players,
            spectators: newRoom.spectators,
          })
          .select()
          .single();

        if (!error && data) {
          newRoom.id = data.id;
          memoryRooms.set(code, newRoom);
        } else if (error) {
          console.warn("Supabase articulate_rooms insert notice:", error.message);
        }
      } catch (err) {
        console.warn("Supabase room persist warning:", err);
      }
    }

    return NextResponse.json({
      success: true,
      room: newRoom,
    });
  } catch (error) {
    console.error("Error creating articulate room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const codeParam = searchParams.get("code");

    if (!codeParam) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    const code = codeParam.toUpperCase().trim();

    // Check memory first
    let room = memoryRooms.get(code);

    // If not in memory, query Supabase
    if (!room && isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("articulate_rooms")
        .select("*")
        .eq("room_code", code)
        .single();

      if (!error && data) {
        const rawTeams = data.teams || {};
        room = {
          id: data.id,
          room_code: data.room_code,
          host_id: data.host_id,
          host_name: data.host_name,
          status: data.status,
          locked: data.locked,
          settings: data.settings,
          teams: {
            teamA: rawTeams.teamA || { name: "Team Alpha", color: "#EF4444", score: 0, playerIds: [] },
            teamB: rawTeams.teamB || { name: "Team Omega", color: "#3B82F6", score: 0, playerIds: [] },
          },
          current_turn: data.current_turn,
          deck: data.deck || [],
          current_word_index: data.current_word_index || 0,
          round_words_scored: data.round_words_scored || [],
          round_words_passed: data.round_words_passed || [],
          active_players: data.active_players || [],
          spectators: data.spectators || [],
          inactive_players: rawTeams.inactive_players || [],
          player_details: rawTeams.player_details || {},
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        if (!room.player_details) room.player_details = {};
        if (room.host_id && !room.player_details[room.host_id]) {
          room.player_details[room.host_id] = {
            id: room.host_id,
            name: room.host_name,
            avatar: "/avatars/avatar-scholar.svg",
            isHost: true,
          };
        }

        memoryRooms.set(code, room);
      }
    }

    if (!room) {
      return NextResponse.json(
        { error: "Room not found", exists: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      exists: true,
      room,
    });
  } catch (error) {
    console.error("Error fetching articulate room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}
