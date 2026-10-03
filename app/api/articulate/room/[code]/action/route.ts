import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { memoryRooms, ArticulateRoom, getNextSpeakerForTeam, sanitizeRoomPlayers } from "@/lib/articulate-room";
import { buildDeck } from "@/lib/game-words";

async function persistRoom(room: ArticulateRoom) {
  room = sanitizeRoomPlayers(room);
  room.updated_at = new Date().toISOString();
  if (!room.inactive_players) room.inactive_players = [];
  if (!room.player_details) room.player_details = {};
  if (!room.last_speaker_indices) room.last_speaker_indices = { teamA: -1, teamB: -1 };
  if (!room.last_speaker_ids) room.last_speaker_ids = {};
  memoryRooms.set(room.room_code, room);

  if (isSupabaseConfigured && supabase) {
    try {
      const teamsPayload = {
        room_name: room.room_name || "",
        teamA: room.teams.teamA,
        teamB: room.teams.teamB,
        player_details: room.player_details,
        inactive_players: room.inactive_players,
        kicked_players: room.kicked_players || [],
        last_speaker_indices: room.last_speaker_indices,
        last_speaker_ids: room.last_speaker_ids,
      };

      await supabase
        .from("articulate_rooms")
        .update({
          status: room.status,
          locked: room.locked,
          settings: room.settings,
          teams: teamsPayload,
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
  let room: ArticulateRoom | null = null;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("articulate_rooms")
        .select("*")
        .eq("room_code", normalized)
        .single();

      if (!error && data) {
        const rawTeams = data.teams || {};
        room = {
          id: data.id,
          room_code: data.room_code,
          room_name: rawTeams.room_name || data.room_name || undefined,
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
          kicked_players: rawTeams.kicked_players || [],
          player_details: rawTeams.player_details || {},
          last_speaker_indices: rawTeams.last_speaker_indices || { teamA: -1, teamB: -1 },
          last_speaker_ids: rawTeams.last_speaker_ids || {},
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
            joinedAt: Date.now(),
          };
        }

        room = sanitizeRoomPlayers(room);
        memoryRooms.set(normalized, room);
      }
    } catch (err) {
      console.warn("Could not query Supabase in action getRoom:", err);
    }
  }

  if (!room) {
    room = memoryRooms.get(normalized) || null;
  }

  if (room) {
    if (!room.inactive_players) room.inactive_players = [];
    if (!room.player_details) room.player_details = {};
    if (!room.kicked_players) room.kicked_players = [];
    room = sanitizeRoomPlayers(room);
  }

  return room;
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
    const { action, playerId, playerName, preferredTeam, targetTeam, settings, hostId, previousPlayerId } = body;

    switch (action) {
      // -------------------------------------------------------------
      // 1. JOIN ROOM
      // -------------------------------------------------------------
      case "join": {
        const id = String(playerId);
        const prevId = previousPlayerId ? String(previousPlayerId) : undefined;
        const name = String(playerName || "Scholar").trim();
        const normName = name.toLowerCase();

        // Check if player or former guest ID is kicked by host
        if (
          room.kicked_players?.includes(id) ||
          (prevId && room.kicked_players?.includes(prevId))
        ) {
          return NextResponse.json(
            { error: "You were removed from this room by the host." },
            { status: 403 }
          );
        }

        // Validate Name Uniqueness in the match
        const isGenericName = normName === "scholar" || normName === "learner" || !name;
        if (!isGenericName) {
          const conflictEntry = Object.values(room.player_details || {}).find(
            (d) => d.name?.trim().toLowerCase() === normName
          );

          if (conflictEntry) {
            const isSameId = conflictEntry.id === id;
            const isClaimedPrevId = prevId && conflictEntry.id === prevId;
            const isGuestUpgrade =
              conflictEntry.id.startsWith("guest-") &&
              (!prevId || prevId === conflictEntry.id);

            if (isSameId || isClaimedPrevId || isGuestUpgrade) {
              // Same user claiming/reconnecting: upgrade previous guest ID
              const oldId = conflictEntry.id;
              if (oldId !== id) {
                room.teams.teamA.playerIds = room.teams.teamA.playerIds.map((p) => (p === oldId ? id : p));
                room.teams.teamB.playerIds = room.teams.teamB.playerIds.map((p) => (p === oldId ? id : p));
                room.active_players = room.active_players.map((p) => (p === oldId ? id : p));
                room.spectators = room.spectators.map((p) => (p === oldId ? id : p));
                if (room.inactive_players) {
                  room.inactive_players = room.inactive_players.map((p) => (p === oldId ? id : p));
                }
                if (room.current_turn?.speakerId === oldId) {
                  room.current_turn.speakerId = id;
                }
                if (room.host_id === oldId) {
                  room.host_id = id;
                }
                if (room.player_details) {
                  delete room.player_details[oldId];
                }
              }
            } else {
              // Another distinct player already occupies this name!
              return NextResponse.json(
                { error: `The name "${name}" is already taken in this room. Please choose a unique nickname.` },
                { status: 400 }
              );
            }
          }
        }

        // If explicit previousPlayerId was passed and is different from id, migrate old slot
        if (prevId && prevId !== id) {
          room.teams.teamA.playerIds = room.teams.teamA.playerIds.map((p) => (p === prevId ? id : p));
          room.teams.teamB.playerIds = room.teams.teamB.playerIds.map((p) => (p === prevId ? id : p));
          room.active_players = room.active_players.map((p) => (p === prevId ? id : p));
          room.spectators = room.spectators.map((p) => (p === prevId ? id : p));
          if (room.inactive_players) {
            room.inactive_players = room.inactive_players.map((p) => (p === prevId ? id : p));
          }
          if (room.current_turn?.speakerId === prevId) {
            room.current_turn.speakerId = id;
          }
          if (room.host_id === prevId) {
            room.host_id = id;
          }
          if (room.player_details) {
            delete room.player_details[prevId];
          }
        }

        // CHECK LOCK CONDITION:
        const isReconnectingPlayer =
          room.active_players.includes(id) ||
          room.teams.teamA.playerIds.includes(id) ||
          room.teams.teamB.playerIds.includes(id);

        const isRoundPlaying = room.status === "playing" || room.locked;

        if (isRoundPlaying && !isReconnectingPlayer) {
          if (!room.spectators.includes(id)) {
            room.spectators.push(id);
          }
          // Remove from teams if placed in spectator lounge
          room.teams.teamA.playerIds = room.teams.teamA.playerIds.filter((p) => p !== id);
          room.teams.teamB.playerIds = room.teams.teamB.playerIds.filter((p) => p !== id);

          const existingDetail = room.player_details?.[id];
          if (!room.player_details) room.player_details = {};
          room.player_details[id] = {
            id,
            name: name || existingDetail?.name || "Scholar",
            avatar: String(body.avatar || existingDetail?.avatar || "/avatars/avatar-scholar.svg"),
            isHost: id === room.host_id,
            joinedAt: existingDetail?.joinedAt || Date.now(),
          };

          sanitizeRoomPlayers(room);
          await persistRoom(room);
          return NextResponse.json({
            success: true,
            room,
            isSpectator: true,
            message: "Round in progress. You have been placed in the Spectator Lounge until this round concludes.",
          });
        }

        // Admitted to lobby / game
        room.spectators = room.spectators.filter((sId) => sId !== id);

        const inA = room.teams.teamA.playerIds.includes(id);
        const inB = room.teams.teamB.playerIds.includes(id);

        if (!inA && !inB) {
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

        const existingDetail = room.player_details?.[id];
        const resolvedName =
          name && name !== "Scholar" && name !== "Learner"
            ? name
            : existingDetail?.name && existingDetail.name !== "Scholar" && existingDetail.name !== "Learner"
            ? existingDetail.name
            : name || "Scholar";

        const existingJoinedAt = room.player_details?.[id]?.joinedAt || Date.now();
        if (!room.player_details) room.player_details = {};
        room.player_details[id] = {
          id,
          name: resolvedName,
          avatar: String(body.avatar || existingDetail?.avatar || "/avatars/avatar-scholar.svg"),
          isHost: id === room.host_id,
          joinedAt: existingJoinedAt,
        };

        if (!room.active_players.includes(id)) {
          room.active_players.push(id);
        }

        sanitizeRoomPlayers(room);
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
      // 2b. ADMIT PLAYER FROM LOBBY / SPECTATORS QUEUE
      // -------------------------------------------------------------
      case "admit_player": {
        const targetId = String(body.targetPlayerId || playerId);
        const toTeam: "A" | "B" = body.targetTeam === "B" ? "B" : "A";

        // Remove from spectators
        room.spectators = (room.spectators || []).filter((sId) => sId !== targetId);

        // Remove from both teams to prevent duplicate assignments
        room.teams.teamA.playerIds = (room.teams.teamA.playerIds || []).filter((p) => p !== targetId);
        room.teams.teamB.playerIds = (room.teams.teamB.playerIds || []).filter((p) => p !== targetId);

        // Add to designated team
        if (toTeam === "A") {
          room.teams.teamA.playerIds.push(targetId);
        } else {
          room.teams.teamB.playerIds.push(targetId);
        }

        if (!room.active_players) room.active_players = [];
        if (!room.active_players.includes(targetId)) {
          room.active_players.push(targetId);
        }

        if (!room.player_details) room.player_details = {};
        if (!room.player_details[targetId]) {
          room.player_details[targetId] = {
            id: targetId,
            name: body.playerName || "Scholar",
            avatar: body.avatar || "/avatars/avatar-scholar.svg",
            isHost: targetId === room.host_id,
            joinedAt: Date.now(),
          };
        }

        // If marked away, reactivate
        if (room.inactive_players) {
          room.inactive_players = room.inactive_players.filter((p) => p !== targetId);
        }

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 2c. ADMIT ALL WAITING SPECTATORS (AUTO-BALANCE TEAMS)
      // -------------------------------------------------------------
      case "admit_all_spectators": {
        const waitingIds = Array.from(
          new Set([
            ...(room.spectators || []),
            ...Object.keys(room.player_details || {}).filter(
              (pId) =>
                !(room.teams.teamA.playerIds || []).includes(pId) &&
                !(room.teams.teamB.playerIds || []).includes(pId)
            ),
          ])
        );

        // Sort by joined arrival time ascending (FIFO)
        waitingIds.sort((a, b) => {
          const timeA = room.player_details?.[a]?.joinedAt || 0;
          const timeB = room.player_details?.[b]?.joinedAt || 0;
          return timeA - timeB;
        });

        for (const waitId of waitingIds) {
          const inA = (room.teams.teamA.playerIds || []).includes(waitId);
          const inB = (room.teams.teamB.playerIds || []).includes(waitId);

          if (!inA && !inB) {
            if ((room.teams.teamA.playerIds?.length || 0) <= (room.teams.teamB.playerIds?.length || 0)) {
              room.teams.teamA.playerIds.push(waitId);
            } else {
              room.teams.teamB.playerIds.push(waitId);
            }
          }

          if (!room.active_players.includes(waitId)) {
            room.active_players.push(waitId);
          }
          if (room.inactive_players) {
            room.inactive_players = room.inactive_players.filter((p) => p !== waitId);
          }
        }

        room.spectators = [];

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 2b. SHUFFLE TEAMS (Host randomly balances players)
      // -------------------------------------------------------------
      case "shuffle_teams": {
        if (room.status !== "lobby" && room.status !== "round_end") {
          return NextResponse.json(
            { error: "Can only shuffle teams between rounds" },
            { status: 400 }
          );
        }

        const allPlayers = [
          ...room.teams.teamA.playerIds,
          ...room.teams.teamB.playerIds,
        ];

        // Fisher-Yates shuffle
        for (let i = allPlayers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allPlayers[i], allPlayers[j]] = [allPlayers[j], allPlayers[i]];
        }

        const half = Math.ceil(allPlayers.length / 2);
        room.teams.teamA.playerIds = allPlayers.slice(0, half);
        room.teams.teamB.playerIds = allPlayers.slice(half);

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 3. START ROUND (LOCKS ROOM)
      // -------------------------------------------------------------
      case "start_round": {
        if (room.status === "playing") {
          return NextResponse.json({ success: true, room });
        }

        // Sync any knownNames sent from host's client cache into room.player_details
        if (body.knownNames && typeof body.knownNames === "object") {
          if (!room.player_details) room.player_details = {};
          Object.entries(body.knownNames).forEach(([pId, info]: [string, any]) => {
            if (info?.name && info.name !== "Scholar" && info.name !== "Learner" && !info.name.startsWith("Scholar (")) {
              if (!room.player_details![pId] || room.player_details![pId].name === "Scholar" || room.player_details![pId].name.startsWith("Scholar (")) {
                room.player_details![pId] = {
                  id: pId,
                  name: info.name,
                  avatar: info.avatar || "/avatars/avatar-scholar.svg",
                  isHost: pId === room.host_id,
                };
              }
            }
          });
        }

        // Ensure settings exist
        if (!room.settings) {
          room.settings = {
            timerSeconds: 45,
            scoreGoal: 20,
            categories: ["Object", "Nature", "Person", "Action", "World", "Random"],
            difficulty: "mixed",
          };
        }

        // Must have at least 1 player on both teams (or at least 1 total if solo testing)
        const totalPlayers =
          (room.teams?.teamA?.playerIds?.length || 0) + (room.teams?.teamB?.playerIds?.length || 0);
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
        if (activeTeam === "A" && (room.teams?.teamA?.playerIds?.length || 0) === 0) {
          activeTeam = "B";
        } else if (activeTeam === "B" && (room.teams?.teamB?.playerIds?.length || 0) === 0) {
          activeTeam = "A";
        }

        const rawTeamPlayerIds =
          activeTeam === "A"
            ? (room.teams?.teamA?.playerIds || [])
            : (room.teams?.teamB?.playerIds || []);

        if (!room.last_speaker_indices) room.last_speaker_indices = { teamA: -1, teamB: -1 };
        if (!room.last_speaker_ids) room.last_speaker_ids = {};

        const lastSpeakerId = activeTeam === "A" ? room.last_speaker_ids.teamA : room.last_speaker_ids.teamB;
        const lastSpeakerIndex = activeTeam === "A" ? room.last_speaker_indices.teamA : room.last_speaker_indices.teamB;

        let speakerId = "";
        let speakerIndex = -1;

        if (
          body.speakerId &&
          rawTeamPlayerIds.includes(body.speakerId) &&
          !(room.inactive_players || []).includes(body.speakerId)
        ) {
          speakerId = body.speakerId;
          speakerIndex = rawTeamPlayerIds.indexOf(speakerId);
        } else {
          const result = getNextSpeakerForTeam(
            rawTeamPlayerIds,
            room.inactive_players || [],
            lastSpeakerId,
            lastSpeakerIndex
          );
          speakerId = result.speakerId;
          speakerIndex = result.speakerIndex;
        }

        if (!speakerId) {
          speakerId = rawTeamPlayerIds[0] || room.host_id || "guest-scholar";
          speakerIndex = 0;
        }

        if (activeTeam === "A") {
          room.last_speaker_ids.teamA = speakerId;
          room.last_speaker_indices.teamA = speakerIndex;
        } else {
          room.last_speaker_ids.teamB = speakerId;
          room.last_speaker_indices.teamB = speakerIndex;
        }

        const speakerDetails = room.player_details?.[speakerId];
        const speakerName =
          speakerDetails?.name &&
          speakerDetails.name !== "Scholar" &&
          speakerDetails.name !== "Learner" &&
          !speakerDetails.name.startsWith("Scholar (")
            ? speakerDetails.name
            : speakerId === room.host_id && room.host_name && room.host_name !== "Scholar" && room.host_name !== "Scholar Host"
            ? room.host_name
            : speakerDetails?.name && speakerDetails.name !== "Scholar"
            ? speakerDetails.name
            : `Scholar (${speakerId.replace(/^guest-/, "").slice(0, 5)})`;

        // Ensure deck exists and has enough words with deduplication
        if (!room.deck || !Array.isArray(room.deck) || room.deck.length === 0 || (room.current_word_index || 0) >= room.deck.length - 15) {
          const usedWords = Array.isArray(room.deck) ? room.deck.map((w) => w.word) : [];
          const freshDeck = buildDeck(
            room.settings?.categories,
            room.settings?.difficulty || "mixed",
            80,
            usedWords
          );
          room.deck = [...(room.deck || []), ...freshDeck];
        }

        // LOCK ROOM & UPDATE STATUS
        room.status = "playing";
        room.locked = true; // LOCK ROOM: NO NEW PEOPLE CAN JOIN ACTIVE ROUND
        room.round_words_scored = [];
        room.round_words_passed = [];
        room.active_players = [
          ...(room.teams?.teamA?.playerIds || []),
          ...(room.teams?.teamB?.playerIds || []),
        ];

        const now = Date.now();
        const countdownMs = 3500; // 3.5s countdown before 30s timer begins
        room.current_turn = {
          roundNumber,
          activeTeam,
          speakerId,
          speakerName,
          startedAt: now + countdownMs,
          countdownEndsAt: now + countdownMs,
          durationSeconds: room.settings?.timerSeconds || 45,
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
          room.round_words_scored.push({
            ...currentWord,
            disputeStatus: "none",
          });

          const teamKey =
            room.current_turn?.activeTeam === "B" ? "teamB" : "teamA";
          room.teams[teamKey].score += 1;
        }

        room.current_word_index += 1;
        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 4b. DISPUTE WORD (Maker: Opponent flags a word)
      // -------------------------------------------------------------
      case "dispute_word": {
        const { wordIndex, opponentName } = body;
        if (typeof wordIndex !== "number" || !room.round_words_scored[wordIndex]) {
          return NextResponse.json({ error: "Invalid word index" }, { status: 400 });
        }

        const wordEntry = room.round_words_scored[wordIndex];
        const currentCount = wordEntry.disputeCount || 0;
        if (currentCount >= 3) {
          return NextResponse.json({ error: "Maximum of 3 dispute attempts reached" }, { status: 400 });
        }

        wordEntry.disputeCount = currentCount + 1;
        wordEntry.disputeStatus = "disputed";
        wordEntry.disputedBy = String(opponentName || "Opposing Team");

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 4c. RESOLVE DISPUTE (Checker: Describing team confirms or contests)
      // -------------------------------------------------------------
      case "resolve_dispute": {
        const { wordIndex, resolverName, resolution } = body;
        if (typeof wordIndex !== "number" || !room.round_words_scored[wordIndex]) {
          return NextResponse.json({ error: "Invalid word index" }, { status: 400 });
        }

        const wordEntry = room.round_words_scored[wordIndex];
        const prevStatus = wordEntry.disputeStatus;
        const turnTeam = room.current_turn?.activeTeam === "B" ? "teamB" : "teamA";

        if (resolution === "concede") {
          // Maker-checker consensus reached: describing team confirms the foul (voided)
          wordEntry.disputeStatus = "conceded";
          wordEntry.concededBy = String(resolverName || "Describing Team");

          if (prevStatus !== "conceded") {
            room.teams[turnTeam].score = Math.max(0, room.teams[turnTeam].score - 1);
          }
        } else if (resolution === "reject") {
          // Describing team contests the dispute / restores the point
          wordEntry.disputeStatus = "rejected";
          if (prevStatus === "conceded") {
            room.teams[turnTeam].score += 1;
          }
        }

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 4d. CLAIM PASSED WORD (Maker: Describing team claims an unmarked passed word)
      // -------------------------------------------------------------
      case "claim_passed_word": {
        const { wordIndex, claimantName } = body;
        if (typeof wordIndex !== "number" || !room.round_words_passed[wordIndex]) {
          return NextResponse.json({ error: "Invalid passed word index" }, { status: 400 });
        }

        const passedEntry = room.round_words_passed[wordIndex];
        const currentCount = passedEntry.claimCount || 0;
        if (currentCount >= 3) {
          return NextResponse.json({ error: "Maximum of 3 claim attempts reached" }, { status: 400 });
        }

        passedEntry.claimCount = currentCount + 1;
        passedEntry.claimStatus = "claimed";
        passedEntry.claimedBy = String(claimantName || "Describing Team");

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 4e. RESOLVE PASSED CLAIM (Checker: Opponent confirms or declines)
      // -------------------------------------------------------------
      case "resolve_passed_claim": {
        const { wordIndex, resolverName, resolution } = body;
        if (typeof wordIndex !== "number" || !room.round_words_passed[wordIndex]) {
          return NextResponse.json({ error: "Invalid passed word index" }, { status: 400 });
        }

        const passedEntry = room.round_words_passed[wordIndex];
        const prevStatus = passedEntry.claimStatus;
        const turnTeam = room.current_turn?.activeTeam === "B" ? "teamB" : "teamA";

        if (resolution === "award") {
          passedEntry.claimStatus = "awarded";
          passedEntry.awardedBy = String(resolverName || "Opposing Team");

          if (prevStatus !== "awarded") {
            room.teams[turnTeam].score += 1;
          }
        } else if (resolution === "reject") {
          passedEntry.claimStatus = "rejected";
          passedEntry.rejectedBy = String(resolverName || "Opposing Team");

          if (prevStatus === "awarded") {
            room.teams[turnTeam].score = Math.max(0, room.teams[turnTeam].score - 1);
          }
        }

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
        if (room.status !== "playing") {
          return NextResponse.json({ success: true, room });
        }

        // Prevent premature ending if round was started less than 5 seconds ago (unless manually triggered by speaker)
        const roundStartedAt = room.current_turn?.startedAt || 0;
        const now = Date.now();
        const isCurrentSpeaker = body.speakerId && body.speakerId === room.current_turn?.speakerId;
        if (roundStartedAt > 0 && now < roundStartedAt + 5000 && !isCurrentSpeaker && !body.manualEnd) {
          // Ignore premature clock-drift triggers from background peers
          return NextResponse.json({ success: true, room });
        }

        room.status = "round_end";
        room.locked = false; // UNLOCK ROOM: BETWEEN ROUNDS, NEW PEOPLE CAN ENTER!

        // Burn/advance the word that was active when the round buzzer sounded
        // so the other team NEVER sees the same word that was just described!
        const cutOffWord = room.deck[room.current_word_index];
        if (cutOffWord) {
          const alreadyTracked =
            room.round_words_scored.some((w) => w.word === cutOffWord.word) ||
            room.round_words_passed.some((w) => w.word === cutOffWord.word);
          if (!alreadyTracked) {
            room.round_words_passed.push(cutOffWord);
          }
          room.current_word_index += 1;
        }

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
      // 6b. FINISH GAME / DECLARE WINNER (After round review & contesting)
      // -------------------------------------------------------------
      case "finish_game":
      case "declare_winner": {
        room.status = "game_over";
        room.locked = false;
        await persistRoom(room);
        return NextResponse.json({ success: true, room });
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
          Math.max(120, (room.settings.scoreGoal || 20) * 3)
        );

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 8. UPDATE SETTINGS (Host adjusts duration 30s/60s or score goal)
      // -------------------------------------------------------------
      case "update_settings": {
        const actingHostId = String(hostId || playerId);
        if (room.host_id !== actingHostId) {
          return NextResponse.json(
            { error: "Only the host can modify match settings" },
            { status: 403 }
          );
        }
        if (room.status === "playing") {
          return NextResponse.json(
            { error: "Cannot modify settings while a round is in progress" },
            { status: 400 }
          );
        }

        if (settings) {
          if (settings.timerSeconds && (settings.timerSeconds === 30 || settings.timerSeconds === 45 || settings.timerSeconds === 60)) {
            room.settings.timerSeconds = settings.timerSeconds;
          }
          if (settings.scoreGoal && typeof settings.scoreGoal === "number") {
            room.settings.scoreGoal = Math.max(5, Math.min(100, Math.round(settings.scoreGoal)));
          }
        }

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 9. TOGGLE INACTIVE / AFK (Host or Self)
      // -------------------------------------------------------------
      case "toggle_inactive": {
        const actingHostId = body.hostId ? String(body.hostId) : null;
        const targetId = String(body.targetPlayerId || playerId);

        // If someone other than the player themselves is toggling, verify they are the host
        if (actingHostId && actingHostId !== targetId && room.host_id !== actingHostId) {
          return NextResponse.json(
            { error: "Only the host or the player can toggle away status" },
            { status: 403 }
          );
        }

        if (!room.inactive_players) room.inactive_players = [];

        const isCurrentlyInactive = room.inactive_players.includes(targetId);
        if (isCurrentlyInactive) {
          room.inactive_players = room.inactive_players.filter((p) => p !== targetId);
        } else {
          room.inactive_players.push(targetId);
        }

        await persistRoom(room);
        return NextResponse.json({
          success: true,
          room,
          isInactive: !isCurrentlyInactive,
        });
      }

      // -------------------------------------------------------------
      // 10. LEAVE ROOM
      // -------------------------------------------------------------
      case "leave_room": {
        const id = String(playerId);

        // Remove from team A & B
        room.teams.teamA.playerIds = room.teams.teamA.playerIds.filter((p) => p !== id);
        room.teams.teamB.playerIds = room.teams.teamB.playerIds.filter((p) => p !== id);

        // Remove from active players, spectators, and inactive players
        room.active_players = room.active_players.filter((p) => p !== id);
        room.spectators = room.spectators.filter((p) => p !== id);
        if (room.inactive_players) {
          room.inactive_players = room.inactive_players.filter((p) => p !== id);
        }

        // If the host leaves, transfer host to the first available player
        if (room.host_id === id) {
          const remainingPlayers = [
            ...room.teams.teamA.playerIds,
            ...room.teams.teamB.playerIds,
            ...room.spectators,
          ];
          if (remainingPlayers.length > 0) {
            const newHostId = remainingPlayers[0];
            room.host_id = newHostId;
            const newHostName = room.player_details?.[newHostId]?.name || "Scholar";
            room.host_name = newHostName;
          }
        }

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 11. RENAME PLAYER
      // -------------------------------------------------------------
      case "rename_player": {
        const id = String(playerId);
        const newName = String(body.newName || "").trim();
        if (!newName) {
          return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
        }

        const normNew = newName.toLowerCase();
        const isGeneric = normNew === "scholar" || normNew === "learner";

        if (!isGeneric) {
          const isTaken = Object.values(room.player_details || {}).some(
            (d) => d.id !== id && d.name?.trim().toLowerCase() === normNew
          );
          if (isTaken) {
            return NextResponse.json(
              { error: `The name "${newName}" is already taken by another scholar in this room.` },
              { status: 400 }
            );
          }
        }

        if (!room.player_details) room.player_details = {};
        if (room.player_details[id]) {
          room.player_details[id].name = newName;
          if (body.avatar) {
            room.player_details[id].avatar = String(body.avatar);
          }
        } else {
          room.player_details[id] = {
            id,
            name: newName,
            avatar: String(body.avatar || "/avatars/avatar-scholar.svg"),
            isHost: id === room.host_id,
          };
        }

        if (room.host_id === id) {
          room.host_name = newName;
        }

        sanitizeRoomPlayers(room);
        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 11b. KICK PLAYER (Host ejects a player from the room)
      // -------------------------------------------------------------
      case "kick_player": {
        const actingHostId = String(hostId || playerId);
        if (room.host_id !== actingHostId) {
          return NextResponse.json(
            { error: "Only the room host can remove players from the match" },
            { status: 403 }
          );
        }

        const targetId = String(body.targetPlayerId || "").trim();
        if (!targetId) {
          return NextResponse.json({ error: "Missing targetPlayerId" }, { status: 400 });
        }

        if (targetId === room.host_id) {
          return NextResponse.json({ error: "The host cannot kick themselves from the room" }, { status: 400 });
        }

        // Remove from everywhere
        room.teams.teamA.playerIds = (room.teams.teamA.playerIds || []).filter((p) => p !== targetId);
        room.teams.teamB.playerIds = (room.teams.teamB.playerIds || []).filter((p) => p !== targetId);
        room.active_players = (room.active_players || []).filter((p) => p !== targetId);
        room.spectators = (room.spectators || []).filter((p) => p !== targetId);
        if (room.inactive_players) {
          room.inactive_players = room.inactive_players.filter((p) => p !== targetId);
        }
        if (room.player_details) {
          delete room.player_details[targetId];
        }

        // Record in kicked_players list to deny re-entry
        if (!room.kicked_players) room.kicked_players = [];
        if (!room.kicked_players.includes(targetId)) {
          room.kicked_players.push(targetId);
        }

        // If the kicked player was currently speaking, end turn
        if (room.current_turn && room.current_turn.speakerId === targetId) {
          room.current_turn = null;
          room.status = "round_end";
        }

        sanitizeRoomPlayers(room);
        await persistRoom(room);

        return NextResponse.json({
          success: true,
          room,
          kickedPlayerId: targetId,
        });
      }

      // -------------------------------------------------------------
      // 12. RENAME ROOM / MATCH (Host custom group name)
      // -------------------------------------------------------------
      case "rename_room": {
        const actingHostId = String(hostId || playerId);
        if (room.host_id !== actingHostId) {
          return NextResponse.json(
            { error: "Only the host can rename the match" },
            { status: 403 }
          );
        }
        const newRoomName = String(body.newRoomName || body.roomName || "").trim();
        room.room_name = newRoomName || undefined;

        await persistRoom(room);
        return NextResponse.json({ success: true, room });
      }

      // -------------------------------------------------------------
      // 13. RENAME TEAM (Host custom team names)
      // -------------------------------------------------------------
      case "rename_team": {
        const actingHostId = String(hostId || playerId);
        if (room.host_id !== actingHostId) {
          return NextResponse.json(
            { error: "Only the host can rename teams" },
            { status: 403 }
          );
        }
        const targetTeamKey: "teamA" | "teamB" = (body.targetTeam === "B" || body.team === "B") ? "teamB" : "teamA";
        const newTeamName = String(body.newTeamName || body.teamName || "").trim();

        if (newTeamName) {
          room.teams[targetTeamKey].name = newTeamName;
        }

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
