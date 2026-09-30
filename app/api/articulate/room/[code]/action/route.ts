import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { memoryRooms, ArticulateRoom } from "@/lib/articulate-room";
import { buildDeck } from "@/lib/game-words";

async function persistRoom(room: ArticulateRoom) {
  room.updated_at = new Date().toISOString();
  memoryRooms.set(room.room_code, room);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from("articulate_rooms")
        .update({
          status: room.status,
          locked: room.locked,
          settings: room.settings,
          teams: room.teams,
          current_turn: room.current_turn,
          deck: room.deck,
          current_word_index: room.current_word_index,
          round_words_scored: room.round_words_scored,
          round_words_passed: room.round_words_passed,
          active_players: room.active_players,
          spectators: room.spectators,
          updated_at: room.updated_at,
        })
        .eq("room_code", room.room_code);
    } catch (err) {
      console.warn("Error updating room in Supabase:", err);
    }
  }
}

async function getRoom(code: string): Promise<ArticulateRoom | null> {
  const normalized = code.toUpperCase().trim();
  let room = memoryRooms.get(normalized);

  if (!room && isSupabaseConfigured && supabase) {
    const { data } = await supabase
      .from("articulate_rooms")
      .select("*")
      .eq("room_code", normalized)
      .single();

    if (data) {
      room = {
        id: data.id,
        room_code: data.room_code,
        host_id: data.host_id,
        host_name: data.host_name,
        status: data.status,
        locked: data.locked,
        settings: data.settings,
        teams: data.teams,
        current_turn: data.current_turn,
        deck: data.deck || [],
        current_word_index: data.current_word_index || 0,
        round_words_scored: data.round_words_scored || [],
        round_words_passed: data.round_words_passed || [],
        active_players: data.active_players || [],
        spectators: data.spectators || [],
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      memoryRooms.set(normalized, room);
    }
  }

  return room || null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const room = await getRoom(code);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, playerId, playerName, preferredTeam, targetTeam } = body;

    switch (action) {
      // -------------------------------------------------------------
      // 1. JOIN ROOM
      // -------------------------------------------------------------
      case "join": {
        const id = String(playerId);
        const name = String(playerName || "Scholar").trim();

        // CHECK LOCK CONDITION:
        // If room is locked and a round is actively playing:
        // Late joiners CANNOT join the active round; placed into spectator lounge!
        const isRoundPlaying = room.status === "playing" || room.locked;
        const isAlreadyActive = room.active_players.includes(id);

        if (isRoundPlaying && !isAlreadyActive) {
          if (!room.spectators.includes(id)) {
            room.spectators.push(id);
          }
          await persistRoom(room);
          return NextResponse.json({
            success: true,
            room,
            isSpectator: true,
            message: "Round in progress. You have been placed in the Spectator Lounge until this round concludes.",
          });
        }

        // Room is in lobby or round_end: player is admitted as active player
        room.spectators = room.spectators.filter((sId) => sId !== id);

        const inA = room.teams.teamA.playerIds.includes(id);
        const inB = room.teams.teamB.playerIds.includes(id);

        if (!inA && !inB) {
          // Assign to chosen team or balance teams
          const countA = room.teams.teamA.playerIds.length;
          const countB = room.teams.teamB.playerIds.length;

          let assignTeam: "A" | "B" = "A";
          if (preferredTeam === "B" || preferredTeam === "A") {
            assignTeam = preferredTeam;
          } else {
            assignTeam = countA <= countB ? "A" : "B";
          }

          if (assignTeam === "A") {
            room.teams.teamA.playerIds.push(id);
          } else {
            room.teams.teamB.playerIds.push(id);
          }
        }

        if (!room.active_players.includes(id)) {
          room.active_players.push(id);
        }

        await persistRoom(room);
        return NextResponse.json({
          success: true,
          room,
          isSpectator: false,
        });
      }

      // -------------------------------------------------------------
      // 2. SWITCH TEAM
      // -------------------------------------------------------------
      case "switch_team": {
        const id = String(playerId);
        const toTeam = targetTeam === "B" ? "B" : "A";

        if (room.status === "playing" && room.locked) {
          return NextResponse.json(
            { error: "Cannot switch teams while a round is in progress" },
            { status: 400 }
          );
        }

        // Remove from both
        room.teams.teamA.playerIds = room.teams.teamA.playerIds.filter((p) => p !== id);
        room.teams.teamB.playerIds = room.teams.teamB.playerIds.filter((p) => p !== id);

        if (toTeam === "A") {
          room.teams.teamA.playerIds.push(id);
        } else {
          room.teams.teamB.playerIds.push(id);
        }

        if (!room.active_players.includes(id)) {
          room.active_players.push(id);
        }

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 3. START ROUND (LOCKS ROOM)
      // -------------------------------------------------------------
      case "start_round": {
        // Must have at least 1 player on both teams (or at least 1 total if solo testing)
        const totalPlayers =
          room.teams.teamA.playerIds.length + room.teams.teamB.playerIds.length;
        if (totalPlayers === 0) {
          return NextResponse.json(
            { error: "At least one player is required to start" },
            { status: 400 }
          );
        }

        const roundNumber = (room.current_turn?.roundNumber || 0) + 1;

        // Alternate active team: Round 1 -> Team A, Round 2 -> Team B, etc.
        let activeTeam: "A" | "B" = roundNumber % 2 === 1 ? "A" : "B";
        // If the chosen team has 0 players, fallback to the other
        if (activeTeam === "A" && room.teams.teamA.playerIds.length === 0) {
          activeTeam = "B";
        } else if (activeTeam === "B" && room.teams.teamB.playerIds.length === 0) {
          activeTeam = "A";
        }

        const teamPlayerIds =
          activeTeam === "A"
            ? room.teams.teamA.playerIds
            : room.teams.teamB.playerIds;

        // Pick speaker by cycling
        const teamTurnIndex = Math.floor((roundNumber - 1) / 2);
        const speakerId = teamPlayerIds[teamTurnIndex % teamPlayerIds.length] || teamPlayerIds[0];
        const speakerName = body.speakerName || `Player (${speakerId.slice(0, 5)})`;

        // Ensure deck has enough words
        if (room.current_word_index >= room.deck.length - 10) {
          const freshDeck = buildDeck(
            room.settings.categories,
            room.settings.difficulty,
            80
          );
          room.deck = [...room.deck, ...freshDeck];
        }

        // LOCK ROOM & UPDATE STATUS
        room.status = "playing";
        room.locked = true; // LOCK ROOM: NO NEW PEOPLE CAN JOIN ACTIVE ROUND
        room.round_words_scored = [];
        room.round_words_passed = [];
        room.active_players = [
          ...room.teams.teamA.playerIds,
          ...room.teams.teamB.playerIds,
        ];

        room.current_turn = {
          roundNumber,
          activeTeam,
          speakerId,
          speakerName,
          startedAt: Date.now(),
          durationSeconds: room.settings.timerSeconds || 60,
        };

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 4. SCORE WORD (+1)
      // -------------------------------------------------------------
      case "score_word": {
        if (room.status !== "playing") {
          return NextResponse.json({ error: "Game is not playing" }, { status: 400 });
        }

        const currentWord = room.deck[room.current_word_index];
        if (currentWord) {
          room.round_words_scored.push(currentWord);

          const teamKey =
            room.current_turn?.activeTeam === "B" ? "teamB" : "teamA";
          room.teams[teamKey].score += 1;

          // Check Win Condition
          if (room.teams[teamKey].score >= room.settings.scoreGoal) {
            room.status = "game_over";
            room.locked = false;
          }
        }

        room.current_word_index += 1;
        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 5. PASS WORD
      // -------------------------------------------------------------
      case "pass_word": {
        if (room.status !== "playing") {
          return NextResponse.json({ error: "Game is not playing" }, { status: 400 });
        }

        const currentWord = room.deck[room.current_word_index];
        if (currentWord) {
          room.round_words_passed.push(currentWord);
        }

        room.current_word_index += 1;
        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 6. END ROUND (UNLOCKS ROOM & ADMITS SPECTATORS)
      // -------------------------------------------------------------
      case "end_round": {
        if (room.status === "game_over") {
          return NextResponse.json({ success: true, room });
        }

        room.status = "round_end";
        room.locked = false; // UNLOCK ROOM: BETWEEN ROUNDS, NEW PEOPLE CAN ENTER!

        // ADMIT WAITING SPECTATORS INTO TEAMS
        if (room.spectators && room.spectators.length > 0) {
          for (const specId of room.spectators) {
            const inA = room.teams.teamA.playerIds.includes(specId);
            const inB = room.teams.teamB.playerIds.includes(specId);
            if (!inA && !inB) {
              // Balance team distribution
              if (room.teams.teamA.playerIds.length <= room.teams.teamB.playerIds.length) {
                room.teams.teamA.playerIds.push(specId);
              } else {
                room.teams.teamB.playerIds.push(specId);
              }
            }
            if (!room.active_players.includes(specId)) {
              room.active_players.push(specId);
            }
          }
          // Clear spectators now that they are drafted into teams
          room.spectators = [];
        }

        await persistRoom(room);
        return NextResponse.json({
          success: true,
          room,
          message: "Round ended. Room unlocked and waiting spectators admitted!",
        });
      }

      // -------------------------------------------------------------
      // 7. RESET GAME
      // -------------------------------------------------------------
      case "reset_game": {
        room.status = "lobby";
        room.locked = false;
        room.teams.teamA.score = 0;
        room.teams.teamB.score = 0;
        room.current_turn = null;
        room.current_word_index = 0;
        room.round_words_scored = [];
        room.round_words_passed = [];
        room.deck = buildDeck(
          room.settings.categories,
          room.settings.difficulty,
          80
        );

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error performing room action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
