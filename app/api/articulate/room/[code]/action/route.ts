import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  memoryRooms,
  ArticulateRoom,
  RoomTeam,
  getNextSpeakerForTeam,
  sanitizeRoomPlayers,
  toClientRoom,
  WHEEL_WEDGES,
  isWheelCheckpointTile,
  peekNextTurnSchedule,
} from "@/lib/articulate-room";
import { buildDeck } from "@/lib/game-words";
import { logArticulateMatch } from "@/lib/articulate-matches";

/** Thrown when another request modified the room between our read and write. */
class RoomConflictError extends Error {}

/** Rooms (request-scoped objects) that should be written unconditionally on the final retry attempt. */
const forceWriteRooms = new WeakSet<ArticulateRoom>();

async function persistRoom(room: ArticulateRoom) {
  const expectedUpdatedAt = room.updated_at;
  const forceUnconditionalWrite = forceWriteRooms.has(room);
  room = sanitizeRoomPlayers(room);
  room.updated_at = new Date().toISOString();
  room.version = (room.version || 0) + 1;
  if (!room.inactive_players) room.inactive_players = [];
  if (!room.player_details) room.player_details = {};
  if (!room.last_speaker_indices) room.last_speaker_indices = { teamA: -1, teamB: -1 };
  if (!room.last_speaker_ids) room.last_speaker_ids = {};

  if (isSupabaseConfigured && supabase) {
    try {
      const teamsPayload = {
        room_name: room.room_name || "",
        host_id: room.host_id,
        host_name: room.host_name,
        match_started_at: room.match_started_at,
        match_ended_at: room.match_ended_at,
        goal_reached_at: room.goal_reached_at,
        active_play_seconds: room.active_play_seconds,
        last_activity_at: room.last_activity_at,
        teamA: room.teams.teamA,
        teamB: room.teams.teamB,
        ...(room.teams.teamC ? { teamC: room.teams.teamC } : {}),
        ...(room.teams.teamD ? { teamD: room.teams.teamD } : {}),
        player_details: room.player_details,
        inactive_players: room.inactive_players,
        kicked_players: room.kicked_players || [],
        last_speaker_indices: room.last_speaker_indices,
        last_speaker_ids: room.last_speaker_ids,
        wheel_state: room.wheel_state || null,
        wheel_checkpoints_claimed: room.wheel_checkpoints_claimed || {},
        frozen_teams: room.frozen_teams || [],
        frozen_players: room.frozen_players || [],
        extra_turn_team: room.extra_turn_team || null,
        last_turn_skip_notice: room.last_turn_skip_notice || null,
        _version: room.version,
      };

      let query = supabase
        .from("articulate_rooms")
        .update({
          host_id: room.host_id,
          host_name: room.host_name,
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

      // Compare-and-swap: only write if nobody else wrote since we read
      if (expectedUpdatedAt && !forceUnconditionalWrite) {
        query = query.eq("updated_at", expectedUpdatedAt);
      }

      const { data, error } = await query.select("id");
      if (!error && Array.isArray(data) && data.length === 0 && expectedUpdatedAt && !forceUnconditionalWrite) {
        throw new RoomConflictError("Room was modified concurrently");
      }
      if (error) {
        console.warn("Error updating room in Supabase:", error);
      }
    } catch (err) {
      if (err instanceof RoomConflictError) throw err;
      console.warn("Error updating room in Supabase:", err);
    }
  }

  memoryRooms.set(room.room_code, room);
}

function getActiveTeamKeys(room: ArticulateRoom): ("A" | "B" | "C" | "D")[] {
  const keys: ("A" | "B" | "C" | "D")[] = ["A", "B"];
  if (room.teams.teamC) keys.push("C");
  if (room.teams.teamD) keys.push("D");
  return keys;
}

function getTeamObj(room: ArticulateRoom, key: "A" | "B" | "C" | "D"): RoomTeam {
  if (key === "B") return room.teams.teamB;
  if (key === "C" && room.teams.teamC) return room.teams.teamC;
  if (key === "D" && room.teams.teamD) return room.teams.teamD;
  return room.teams.teamA;
}

function removePlayerFromAllTeams(room: ArticulateRoom, playerId: string) {
  room.teams.teamA.playerIds = (room.teams.teamA.playerIds || []).filter((p) => p !== playerId);
  room.teams.teamB.playerIds = (room.teams.teamB.playerIds || []).filter((p) => p !== playerId);
  if (room.teams.teamC) {
    room.teams.teamC.playerIds = (room.teams.teamC.playerIds || []).filter((p) => p !== playerId);
  }
  if (room.teams.teamD) {
    room.teams.teamD.playerIds = (room.teams.teamD.playerIds || []).filter((p) => p !== playerId);
  }
}

function replacePlayerInAllTeams(room: ArticulateRoom, oldId: string, newId: string) {
  room.teams.teamA.playerIds = (room.teams.teamA.playerIds || []).map((p) => (p === oldId ? newId : p));
  room.teams.teamB.playerIds = (room.teams.teamB.playerIds || []).map((p) => (p === oldId ? newId : p));
  if (room.teams.teamC) {
    room.teams.teamC.playerIds = (room.teams.teamC.playerIds || []).map((p) => (p === oldId ? newId : p));
  }
  if (room.teams.teamD) {
    room.teams.teamD.playerIds = (room.teams.teamD.playerIds || []).map((p) => (p === oldId ? newId : p));
  }
}

function isPlayerInAnyTeam(room: ArticulateRoom, playerId: string): boolean {
  if ((room.teams.teamA.playerIds || []).includes(playerId)) return true;
  if ((room.teams.teamB.playerIds || []).includes(playerId)) return true;
  if (room.teams.teamC && (room.teams.teamC.playerIds || []).includes(playerId)) return true;
  if (room.teams.teamD && (room.teams.teamD.playerIds || []).includes(playerId)) return true;
  return false;
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
        const effectiveHostId = rawTeams.host_id || data.host_id;
        const effectiveHostName = rawTeams.host_name || data.host_name;
        room = {
          id: data.id,
          room_code: data.room_code,
          room_name: rawTeams.room_name || data.room_name || undefined,
          host_id: effectiveHostId,
          host_name: effectiveHostName,
          status: data.status,
          locked: data.locked,
          settings: data.settings,
          teams: {
            teamA: rawTeams.teamA || { name: "Team Alpha", color: "#EF4444", score: 0, playerIds: [] },
            teamB: rawTeams.teamB || { name: "Team Omega", color: "#3B82F6", score: 0, playerIds: [] },
            ...(rawTeams.teamC ? { teamC: rawTeams.teamC } : {}),
            ...(rawTeams.teamD ? { teamD: rawTeams.teamD } : {}),
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
          wheel_state: rawTeams.wheel_state || null,
          wheel_checkpoints_claimed: rawTeams.wheel_checkpoints_claimed || {},
          frozen_teams: Array.isArray(rawTeams.frozen_teams) ? rawTeams.frozen_teams : [],
          frozen_players: Array.isArray(rawTeams.frozen_players) ? rawTeams.frozen_players : [],
          extra_turn_team: rawTeams.extra_turn_team || null,
          last_turn_skip_notice: rawTeams.last_turn_skip_notice || null,
          match_started_at: rawTeams.match_started_at || undefined,
          match_ended_at: rawTeams.match_ended_at || undefined,
          goal_reached_at: rawTeams.goal_reached_at || undefined,
          active_play_seconds: typeof rawTeams.active_play_seconds === "number" ? rawTeams.active_play_seconds : undefined,
          last_activity_at: rawTeams.last_activity_at || undefined,
          version: typeof rawTeams._version === "number" ? rawTeams._version : 0,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };

        const currentRoom = room;
        if (!currentRoom.player_details) currentRoom.player_details = {};
        if (currentRoom.host_id) {
          const activeHostId = currentRoom.host_id;
          const details = currentRoom.player_details;
          Object.keys(details).forEach((pId) => {
            if (details[pId]) {
              details[pId].isHost = pId === activeHostId;
            }
          });
          if (!details[activeHostId]) {
            details[activeHostId] = {
              id: activeHostId,
              name: currentRoom.host_name,
              avatar: "/avatars/avatar-scholar.svg",
              isHost: true,
              joinedAt: Date.now(),
            };
          }
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

function actionResponse(payload: Record<string, any>, init?: number | ResponseInit) {
  const options = typeof init === "number" ? { status: init } : init;
  const wirePayload = payload.room ? { ...payload, room: toClientRoom(payload.room as ArticulateRoom) } : payload;
  return NextResponse.json({ ...wirePayload, serverTime: Date.now() }, options);
}

const MAX_WRITE_ATTEMPTS = 4;
const TURN_SCOPED_ACTIONS = new Set(["score_word", "pass_word", "end_round"]);
/** Grace window after the turn deadline during which in-flight score/pass taps are still honoured. */
const LATE_TAP_GRACE_MS = 2000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json().catch(() => ({}));

  for (let attempt = 1; attempt <= MAX_WRITE_ATTEMPTS; attempt++) {
    try {
      const room = await getRoom(code);
      if (!room) {
        return actionResponse({ error: "Room not found" }, { status: 404 });
      }
      if (attempt === MAX_WRITE_ATTEMPTS) {
        // Last resort: never leave a player's action unapplied because of contention
        forceWriteRooms.add(room);
      }
      return await handleAction(room, body);
    } catch (error) {
      if (error instanceof RoomConflictError && attempt < MAX_WRITE_ATTEMPTS) {
        // Small jittered backoff, then re-read the latest state and re-apply the action
        await new Promise((r) => setTimeout(r, 25 + Math.random() * 75 * attempt));
        continue;
      }
      console.error("Error performing room action:", error);
      return actionResponse(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  return actionResponse({ error: "Room is busy, please retry" }, { status: 503 });
}

const TEN_MINUTES_SEC = 600;
const ACTIVE_GAMEPLAY_ACTIONS = new Set([
  "start_round",
  "score_word",
  "pass_word",
  "end_round",
  "dispute_word",
  "resolve_dispute",
  "claim_passed_word",
  "resolve_passed_claim",
  "spin_wheel",
  "resolve_wheel_choice",
  "finish_game",
  "declare_winner",
]);

function hasPendingWordAudit(room: ArticulateRoom): boolean {
  const hasDisputed = (room.round_words_scored || []).some(
    (w) => w.disputeStatus === "disputed"
  );
  const hasClaimed = (room.round_words_passed || []).some(
    (w) => w.claimStatus === "claimed"
  );
  return hasDisputed || hasClaimed;
}

function isWheelAlreadySpunThisRound(room: ArticulateRoom): boolean {
  const roundNum = room.current_turn?.roundNumber;
  if (!room.wheel_state || typeof roundNum !== "number") return false;
  return (
    room.wheel_state.roundNumber === roundNum &&
    (room.wheel_state.status === "choosing" || room.wheel_state.status === "resolved")
  );
}

function canPlayerControlWheel(room: ArticulateRoom, callerId: string | undefined, targetTeam: "A" | "B" | "C" | "D"): boolean {
  if (!callerId) return true;
  const teamIds = getTeamObj(room, targetTeam).playerIds || [];
  if (teamIds.includes(callerId)) return true;
  if (room.current_turn?.speakerId === callerId) return true;
  // Allow host fallback if the spinning team has no active human players or only ghost players
  const hasActiveHumanOnTeam = teamIds.some(
    (id) => !id.startsWith("ghost-") && !(room.inactive_players || []).includes(id)
  );
  if (!hasActiveHumanOnTeam && room.host_id === callerId) return true;
  return false;
}

function syncWheelCheckpoint(room: ArticulateRoom) {
  if (!room.current_turn) return;
  const activeTeam = room.current_turn.activeTeam || "A";
  const roundNumber = room.current_turn.roundNumber || 1;
  const scoreGoal = room.settings?.scoreGoal || 20;
  const teamScore = getTeamObj(room, activeTeam).score;

  // If this round's wheel was already spun (choosing or resolved), keep it intact
  if (
    room.wheel_state &&
    room.wheel_state.roundNumber === roundNumber &&
    (room.wheel_state.status === "choosing" || room.wheel_state.status === "resolved")
  ) {
    return;
  }

  const claimedForTeam = room.wheel_checkpoints_claimed?.[activeTeam] || [];
  const alreadyClaimedThisTile = claimedForTeam.includes(teamScore);

  if (isWheelCheckpointTile(teamScore, scoreGoal) && !alreadyClaimedThisTile) {
    room.wheel_state = {
      roundNumber,
      team: activeTeam,
      tileIndex: teamScore,
      status: "ready",
    };
  } else if (room.wheel_state && room.wheel_state.roundNumber === roundNumber && room.wheel_state.status === "ready") {
    // Score moved off the checkpoint tile due to dispute/claim before spinning
    room.wheel_state = null;
  }
}

function recordRoomActivity(room: ArticulateRoom, action: string) {
  if (!ACTIVE_GAMEPLAY_ACTIONS.has(action)) return;

  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  // If match has not started yet, it starts strictly on first start_round
  if (!room.match_started_at) {
    if (action === "start_round") {
      room.match_started_at = nowIso;
      room.active_play_seconds = 0;
      room.last_activity_at = nowIso;
    }
    return;
  }

  // Accumulate active play seconds if match is active (not already game_over)
  if (room.status !== "game_over") {
    if (room.last_activity_at) {
      const lastMs = new Date(room.last_activity_at).getTime();
      const elapsedSec = Math.max(0, Math.round((now - lastMs) / 1000));
      // Pause timeline if inactive for > 10 minutes (credit at most 10 minutes from this gap)
      const creditSec = Math.min(elapsedSec, TEN_MINUTES_SEC);
      room.active_play_seconds = (room.active_play_seconds || 0) + creditSec;
    } else {
      const startMs = new Date(room.match_started_at).getTime();
      const elapsedSec = Math.max(0, Math.round((now - startMs) / 1000));
      room.active_play_seconds = Math.min(elapsedSec, TEN_MINUTES_SEC);
    }
  }

  room.last_activity_at = nowIso;

  // Track if any team has reached the victory scoreGoal
  const scoreGoal = room.settings?.scoreGoal || 20;
  const isGoalReached =
    (room.teams.teamA.score >= scoreGoal) ||
    (room.teams.teamB.score >= scoreGoal) ||
    (room.teams.teamC ? room.teams.teamC.score >= scoreGoal : false) ||
    (room.teams.teamD ? room.teams.teamD.score >= scoreGoal : false);

  if (isGoalReached && !room.goal_reached_at) {
    room.goal_reached_at = nowIso;
  }

  if (action === "finish_game" || action === "declare_winner") {
    if (!room.match_ended_at) {
      room.match_ended_at = nowIso;
    }
  }
}

async function handleAction(room: ArticulateRoom, body: any): Promise<NextResponse> {
  {
    const { action, playerId, playerName, preferredTeam, targetTeam, settings, hostId, previousPlayerId } = body;
    recordRoomActivity(room, action);

    // ---------------------------------------------------------------
    // TURN GUARDS: reject delayed packets that belong to a previous turn
    // ---------------------------------------------------------------
    if (TURN_SCOPED_ACTIONS.has(action) && room.current_turn) {
      if (
        typeof body.roundNumber === "number" &&
        body.roundNumber !== room.current_turn.roundNumber
      ) {
        return actionResponse({ success: true, room, ignored: "stale_turn" });
      }

      const turnEndsAt = room.current_turn.turnEndsAt || 0;
      const nowMs = Date.now();

      if ((action === "score_word" || action === "pass_word") && turnEndsAt && nowMs > turnEndsAt + LATE_TAP_GRACE_MS) {
        return actionResponse({ success: true, room, ignored: "turn_expired" });
      }

      // Automatic (timer-driven) end requests are only honoured once the SERVER clock says time is up,
      // so a device with a fast clock can never cut a round short.
      if (action === "end_round" && body.auto && turnEndsAt && nowMs < turnEndsAt - 750) {
        return actionResponse({ success: true, room, ignored: "too_early" });
      }
    }

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
          return actionResponse(
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
                replacePlayerInAllTeams(room, oldId, id);
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
              return actionResponse(
                { error: `The name "${name}" is already taken in this room. Please choose a unique nickname.` },
                { status: 400 }
              );
            }
          }
        }

        // If explicit previousPlayerId was passed and is different from id, migrate old slot
        if (prevId && prevId !== id) {
          replacePlayerInAllTeams(room, prevId, id);
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
          isPlayerInAnyTeam(room, id);

        const isRoundPlaying = room.status === "playing" || room.locked;

        if (isRoundPlaying && !isReconnectingPlayer) {
          if (!room.spectators.includes(id)) {
            room.spectators.push(id);
          }
          // Remove from teams if placed in spectator lounge
          removePlayerFromAllTeams(room, id);

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
          return actionResponse({
            success: true,
            room,
            isSpectator: true,
            message: "Round in progress. You have been placed in the Spectator Lounge until this round concludes.",
          });
        }

        // Admitted to lobby / game
        room.spectators = room.spectators.filter((sId) => sId !== id);

        const alreadyInAnyTeam = isPlayerInAnyTeam(room, id);

        if (!alreadyInAnyTeam) {
          const activeKeys = getActiveTeamKeys(room);
          let assignTeam: "A" | "B" | "C" | "D" = "A";
          if (preferredTeam && activeKeys.includes(preferredTeam)) {
            assignTeam = preferredTeam;
          } else {
            // Pick active team with fewest players
            let minCount = Infinity;
            for (const key of activeKeys) {
              const count = getTeamObj(room, key).playerIds?.length || 0;
              if (count < minCount) {
                minCount = count;
                assignTeam = key;
              }
            }
          }

          getTeamObj(room, assignTeam).playerIds.push(id);
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
        return actionResponse({
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
        const activeKeys = getActiveTeamKeys(room);
        const toTeam: "A" | "B" | "C" | "D" = activeKeys.includes(targetTeam) ? targetTeam : "A";

        if (room.status === "playing" && room.locked) {
          return actionResponse(
            { error: "Cannot switch teams while a round is in progress" },
            { status: 400 }
          );
        }

        removePlayerFromAllTeams(room, id);
        getTeamObj(room, toTeam).playerIds.push(id);

        if (!room.active_players.includes(id)) {
          room.active_players.push(id);
        }

        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 2b. ADMIT PLAYER FROM LOBBY / SPECTATORS QUEUE
      // -------------------------------------------------------------
      case "admit_player": {
        const targetId = String(body.targetPlayerId || playerId);
        const activeKeys = getActiveTeamKeys(room);
        const toTeam: "A" | "B" | "C" | "D" = activeKeys.includes(body.targetTeam) ? body.targetTeam : "A";

        // Remove from spectators
        room.spectators = (room.spectators || []).filter((sId) => sId !== targetId);

        // Remove from all teams to prevent duplicate assignments
        removePlayerFromAllTeams(room, targetId);

        // Add to designated team
        getTeamObj(room, toTeam).playerIds.push(targetId);

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
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 2c. ADMIT ALL WAITING SPECTATORS (AUTO-BALANCE TEAMS)
      // -------------------------------------------------------------
      case "admit_all_spectators": {
        const waitingIds = Array.from(
          new Set([
            ...(room.spectators || []),
            ...Object.keys(room.player_details || {}).filter(
              (pId) => !isPlayerInAnyTeam(room, pId)
            ),
          ])
        );

        // Sort by joined arrival time ascending (FIFO)
        waitingIds.sort((a, b) => {
          const timeA = room.player_details?.[a]?.joinedAt || 0;
          const timeB = room.player_details?.[b]?.joinedAt || 0;
          return timeA - timeB;
        });

        const activeKeys = getActiveTeamKeys(room);
        for (const waitId of waitingIds) {
          if (!isPlayerInAnyTeam(room, waitId)) {
            let bestKey: "A" | "B" | "C" | "D" = activeKeys[0];
            let minCount = Infinity;
            for (const key of activeKeys) {
              const count = getTeamObj(room, key).playerIds?.length || 0;
              if (count < minCount) {
                minCount = count;
                bestKey = key;
              }
            }
            getTeamObj(room, bestKey).playerIds.push(waitId);
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
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 2b. SHUFFLE TEAMS (Host randomly balances players)
      // -------------------------------------------------------------
      case "shuffle_teams": {
        if (room.status !== "lobby" && room.status !== "round_end") {
          return actionResponse(
            { error: "Can only shuffle teams between rounds" },
            { status: 400 }
          );
        }

        const activeKeys = getActiveTeamKeys(room);
        const allPlayers: string[] = [];
        for (const key of activeKeys) {
          allPlayers.push(...(getTeamObj(room, key).playerIds || []));
          getTeamObj(room, key).playerIds = [];
        }

        // Fisher-Yates shuffle
        for (let i = allPlayers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allPlayers[i], allPlayers[j]] = [allPlayers[j], allPlayers[i]];
        }

        // Distribute round-robin across active teams
        allPlayers.forEach((pId, idx) => {
          const teamKey = activeKeys[idx % activeKeys.length];
          getTeamObj(room, teamKey).playerIds.push(pId);
        });

        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 3. START ROUND (LOCKS ROOM)
      // -------------------------------------------------------------
      case "start_round": {
        if (room.status === "playing") {
          return actionResponse({ success: true, room });
        }

        // Prevent starting next round if a Wheel Checkpoint is still waiting to be spun or resolved
        if (
          room.status === "round_end" &&
          room.wheel_state &&
          (room.wheel_state.status === "ready" || room.wheel_state.status === "choosing")
        ) {
          return actionResponse(
            { error: "Please complete the Wheel Checkpoint spin before starting the next round." },
            { status: 400 }
          );
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

        // Must have at least 1 player total to start
        const activeKeys = getActiveTeamKeys(room);
        let totalPlayers = 0;
        for (const key of activeKeys) {
          totalPlayers += getTeamObj(room, key).playerIds?.length || 0;
        }
        if (totalPlayers === 0) {
          return actionResponse(
            { error: "At least one player is required to start" },
            { status: 400 }
          );
        }

        const roundNumber = (room.current_turn?.roundNumber || 0) + 1;

        // Determine next active team factoring in Wheel effects (Encore extra_turn_team or skipped frozen_teams)
        const schedule = peekNextTurnSchedule(room);
        let activeTeam: "A" | "B" | "C" | "D" = schedule.nextTeamKey;

        // Consume any extra turn or skipped frozen teams
        if (schedule.isExtraTurn) {
          room.extra_turn_team = null;
          room.last_turn_skip_notice = `${getTeamObj(room, activeTeam).name} launched their Encore Turn from the Wheel!`;
        } else if (schedule.skippedFrozenTeams.length > 0) {
          const skippedNames = schedule.skippedFrozenTeams.map((k) => getTeamObj(room, k).name).join(", ");
          room.frozen_teams = (room.frozen_teams || []).filter((k) => !schedule.skippedFrozenTeams.includes(k));
          room.last_turn_skip_notice = `${skippedNames} was frozen and skipped this turn!`;
        } else {
          room.last_turn_skip_notice = null;
        }

        // Clear previous round's wheel state on new round start
        room.wheel_state = null;

        // If the chosen team has 0 players, fallback to the next active team with players
        const teamIndex = activeKeys.indexOf(activeTeam);
        if ((getTeamObj(room, activeTeam).playerIds?.length || 0) === 0) {
          for (let step = 1; step < activeKeys.length; step++) {
            const nextCandidate = activeKeys[(Math.max(0, teamIndex) + step) % activeKeys.length];
            if ((getTeamObj(room, nextCandidate).playerIds?.length || 0) > 0) {
              activeTeam = nextCandidate;
              break;
            }
          }
        }

        const rawTeamPlayerIds = getTeamObj(room, activeTeam).playerIds || [];

        if (!room.last_speaker_indices) room.last_speaker_indices = { teamA: -1, teamB: -1 };
        if (!room.last_speaker_ids) room.last_speaker_ids = {};

        const teamKeyProp = activeTeam === "A" ? "teamA" : activeTeam === "B" ? "teamB" : activeTeam === "C" ? "teamC" : "teamD";
        const lastSpeakerId = room.last_speaker_ids[teamKeyProp];
        const lastSpeakerIndex = room.last_speaker_indices[teamKeyProp];

        let speakerId = "";
        let speakerIndex = -1;

        const result = getNextSpeakerForTeam(
          rawTeamPlayerIds,
          room.inactive_players || [],
          lastSpeakerId,
          lastSpeakerIndex,
          room.frozen_players || []
        );

        if (
          body.speakerId &&
          rawTeamPlayerIds.includes(body.speakerId) &&
          !(room.inactive_players || []).includes(body.speakerId) &&
          !(room.frozen_players || []).includes(body.speakerId)
        ) {
          speakerId = body.speakerId;
          speakerIndex = rawTeamPlayerIds.indexOf(speakerId);
        } else {
          speakerId = result.speakerId;
          speakerIndex = result.speakerIndex;
        }

        if (result.skippedFrozenPlayerIds && result.skippedFrozenPlayerIds.length > 0) {
          const skippedPlayerNames = result.skippedFrozenPlayerIds
            .map((pid) => room.player_details?.[pid]?.name || "A player")
            .join(", ");
          room.frozen_players = (room.frozen_players || []).filter(
            (pid) => !result.skippedFrozenPlayerIds.includes(pid)
          );
          room.last_turn_skip_notice = `${skippedPlayerNames} was frozen and skipped as speaker this round!`;
        }

        if (!speakerId) {
          speakerId = rawTeamPlayerIds[0] || room.host_id || "guest-player";
          speakerIndex = 0;
        }

        room.last_speaker_ids[teamKeyProp] = speakerId;
        room.last_speaker_indices[teamKeyProp] = speakerIndex;

        const speakerDetails = room.player_details?.[speakerId];
        const speakerName =
          speakerDetails?.name &&
          speakerDetails.name !== "Scholar" &&
          speakerDetails.name !== "Learner" &&
          !speakerDetails.name.startsWith("Scholar (")
            ? speakerDetails.name
            : speakerId === room.host_id && room.host_name && room.host_name !== "Scholar" && room.host_name !== "Scholar Host"
            ? room.host_name
            : speakerDetails?.name && speakerDetails.name !== "Scholar" && speakerDetails.name !== "Learner" && !speakerDetails.name.startsWith("Scholar (")
            ? speakerDetails.name
            : `Player (${speakerId.replace(/^guest-/, "").slice(0, 5)})`;

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
        if (!room.match_started_at) {
          room.match_started_at = new Date().toISOString();
        }
        room.round_words_scored = [];
        room.round_words_passed = [];
        const activeFieldPlayers: string[] = [];
        for (const key of activeKeys) {
          activeFieldPlayers.push(...(getTeamObj(room, key).playerIds || []));
        }
        room.active_players = Array.from(new Set(activeFieldPlayers));

        const now = Date.now();
        const countdownMs = 3500; // 3.5s countdown before timer begins
        const durationSeconds = room.settings?.timerSeconds || 45;
        const countdownEndsAt = now + countdownMs;
        const turnEndsAt = countdownEndsAt + durationSeconds * 1000;
        room.current_turn = {
          roundNumber,
          activeTeam,
          speakerId,
          speakerName,
          startedAt: countdownEndsAt,
          countdownEndsAt,
          turnEndsAt,
          durationSeconds,
        };

        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 4. SCORE WORD (+1)
      // -------------------------------------------------------------
      case "score_word": {
        if (room.status !== "playing") {
          return actionResponse({ error: "Game is not playing" }, { status: 400 });
        }

        const currentWord = room.deck[room.current_word_index];
        if (currentWord) {
          room.round_words_scored.push({
            ...currentWord,
            disputeStatus: "none",
          });

          const activeKey = room.current_turn?.activeTeam || "A";
          getTeamObj(room, activeKey).score += 1;
        }

        room.current_word_index += 1;
        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 4b. DISPUTE WORD (Maker: Opponent flags a word)
      // -------------------------------------------------------------
      case "dispute_word": {
        if (isWheelAlreadySpunThisRound(room)) {
          return actionResponse(
            { error: "Word disputes are locked after the Checkpoint Wheel has been spun for this round." },
            { status: 400 }
          );
        }

        const { wordIndex, opponentName } = body;
        if (typeof wordIndex !== "number" || !room.round_words_scored[wordIndex]) {
          return actionResponse({ error: "Invalid word index" }, { status: 400 });
        }

        const wordEntry = room.round_words_scored[wordIndex];
        const currentCount = wordEntry.disputeCount || 0;
        if (currentCount >= 3) {
          return actionResponse({ error: "Maximum of 3 dispute attempts reached" }, { status: 400 });
        }

        wordEntry.disputeCount = currentCount + 1;
        wordEntry.disputeStatus = "disputed";
        wordEntry.disputedBy = String(opponentName || "Opposing Team");

        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 4c. RESOLVE DISPUTE (Checker: Describing team confirms or contests)
      // -------------------------------------------------------------
      case "resolve_dispute": {
        const { wordIndex, resolverName, resolution } = body;
        if (typeof wordIndex !== "number" || !room.round_words_scored[wordIndex]) {
          return actionResponse({ error: "Invalid word index" }, { status: 400 });
        }

        const wordEntry = room.round_words_scored[wordIndex];
        const prevStatus = wordEntry.disputeStatus;
        const turnTeamKey = room.current_turn?.activeTeam || "A";
        const turnTeamObj = getTeamObj(room, turnTeamKey);

        if (resolution === "concede") {
          // Maker-checker consensus reached: describing team confirms the foul (voided)
          wordEntry.disputeStatus = "conceded";
          wordEntry.concededBy = String(resolverName || "Describing Team");

          if (prevStatus !== "conceded") {
            turnTeamObj.score = Math.max(0, turnTeamObj.score - 1);
          }
        } else if (resolution === "reject") {
          // Describing team contests the dispute / restores the point
          wordEntry.disputeStatus = "rejected";
          if (prevStatus === "conceded") {
            turnTeamObj.score += 1;
          }
        }

        syncWheelCheckpoint(room);
        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 4d. CLAIM PASSED WORD (Maker: Describing team claims an unmarked passed word)
      // -------------------------------------------------------------
      case "claim_passed_word": {
        if (isWheelAlreadySpunThisRound(room)) {
          return actionResponse(
            { error: "Word claims are locked after the Checkpoint Wheel has been spun for this round." },
            { status: 400 }
          );
        }

        const { wordIndex, claimantName } = body;
        if (typeof wordIndex !== "number" || !room.round_words_passed[wordIndex]) {
          return actionResponse({ error: "Invalid passed word index" }, { status: 400 });
        }

        const passedEntry = room.round_words_passed[wordIndex];
        const currentCount = passedEntry.claimCount || 0;
        if (currentCount >= 3) {
          return actionResponse({ error: "Maximum of 3 claim attempts reached" }, { status: 400 });
        }

        passedEntry.claimCount = currentCount + 1;
        passedEntry.claimStatus = "claimed";
        passedEntry.claimedBy = String(claimantName || "Describing Team");

        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 4e. RESOLVE PASSED CLAIM (Checker: Opponent confirms or declines)
      // -------------------------------------------------------------
      case "resolve_passed_claim": {
        const { wordIndex, resolverName, resolution } = body;
        if (typeof wordIndex !== "number" || !room.round_words_passed[wordIndex]) {
          return actionResponse({ error: "Invalid passed word index" }, { status: 400 });
        }

        const passedEntry = room.round_words_passed[wordIndex];
        const prevStatus = passedEntry.claimStatus;
        const turnTeamKey = room.current_turn?.activeTeam || "A";
        const turnTeamObj = getTeamObj(room, turnTeamKey);

        if (resolution === "award") {
          passedEntry.claimStatus = "awarded";
          passedEntry.awardedBy = String(resolverName || "Opposing Team");

          if (prevStatus !== "awarded") {
            turnTeamObj.score += 1;
          }
        } else if (resolution === "reject") {
          passedEntry.claimStatus = "rejected";
          passedEntry.rejectedBy = String(resolverName || "Opposing Team");

          if (prevStatus === "awarded") {
            turnTeamObj.score = Math.max(0, turnTeamObj.score - 1);
          }
        }

        syncWheelCheckpoint(room);
        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 4f. SPIN CHECKPOINT WHEEL (When landing on tile 7, 14, 21, 28...)
      // -------------------------------------------------------------
      case "spin_wheel": {
        const ws = room.wheel_state;
        if (!ws || ws.status !== "ready") {
          return actionResponse({ success: true, room });
        }

        if (hasPendingWordAudit(room)) {
          return actionResponse(
            { error: "Please resolve any pending word challenges or claims before spinning the Checkpoint Wheel." },
            { status: 400 }
          );
        }

        const activeTeam = ws.team;
        if (!canPlayerControlWheel(room, playerId ? String(playerId) : undefined, activeTeam)) {
          return actionResponse(
            { error: "Only members of the team on the Wheel Checkpoint can spin." },
            { status: 403 }
          );
        }

        const activeTeamObj = getTeamObj(room, activeTeam);
        const scoreGoal = room.settings?.scoreGoal || 20;
        const activeKeys = getActiveTeamKeys(room);
        const opponentKeys = activeKeys.filter((k) => k !== activeTeam);

        // Mark this checkpoint tile as claimed for this team so they cannot farm the same tile twice
        if (!room.wheel_checkpoints_claimed) room.wheel_checkpoints_claimed = {};
        const prevClaimed = room.wheel_checkpoints_claimed[activeTeam] || [];
        if (!prevClaimed.includes(ws.tileIndex)) {
          room.wheel_checkpoints_claimed[activeTeam] = [...prevClaimed, ws.tileIndex];
        }

        // Check if any rival team has > 0 points; if all rivals are at Start (0 pts), avoid a wasted "push_leader_2"
        const anyRivalAboveZero = opponentKeys.some((k) => (getTeamObj(room, k).score || 0) > 0);
        const eligibleIndices = WHEEL_WEDGES.map((w, idx) => ({ w, idx }))
          .filter(({ w }) => anyRivalAboveZero || w.id !== "push_leader_2")
          .map(({ idx }) => idx);

        const wedgeIndex =
          eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)] ??
          Math.floor(Math.random() * WHEEL_WEDGES.length);
        const wedge = WHEEL_WEDGES[wedgeIndex];

        ws.wedgeIndex = wedgeIndex;
        ws.wedgeId = wedge.id;
        ws.wedgeLabel = wedge.label;
        ws.spinNonce = Date.now();
        ws.spunBy = String(playerName || room.current_turn?.speakerName || activeTeamObj.name);

        if (wedge.id === "extra_turn") {
          room.extra_turn_team = activeTeam;
          ws.status = "resolved";
          ws.resultSummary = `${activeTeamObj.name} unlocked an Encore Turn — they take the very next round!`;
          ws.resolvedAt = Date.now();
        } else if (wedge.id === "bonus_1") {
          const maxScore = Math.max(activeTeamObj.score, scoreGoal - 1);
          activeTeamObj.score = Math.min(maxScore, activeTeamObj.score + 1);
          ws.status = "resolved";
          ws.resultSummary = `${activeTeamObj.name} advanced +1 bonus step to tile ${activeTeamObj.score}!`;
          ws.resolvedAt = Date.now();
        } else if (wedge.id === "push_leader_2") {
          let leaderKey = opponentKeys[0] || "B";
          let maxRivalScore = -1;
          for (const k of opponentKeys) {
            const s = getTeamObj(room, k).score;
            if (s > maxRivalScore) {
              maxRivalScore = s;
              leaderKey = k;
            }
          }
          const leaderObj = getTeamObj(room, leaderKey);
          const before = leaderObj.score;
          leaderObj.score = Math.max(0, leaderObj.score - 2);
          const delta = before - leaderObj.score;
          ws.status = "resolved";
          ws.targetTeam = leaderKey;
          ws.resultSummary =
            delta > 0
              ? `${leaderObj.name} was pushed back -${delta} ${delta === 1 ? "step" : "steps"} to tile ${leaderObj.score}!`
              : `${leaderObj.name} was targeted for a -2 setback (already at Start)!`;
          ws.resolvedAt = Date.now();
        } else if (wedge.id === "freeze_opponent") {
          // Always transition to "choosing" so the spinning team can pick WHICH rival team OR rival player to freeze!
          ws.status = "choosing";
        } else {
          // tactical_2 or tactical_3 requires tactical choice (Forward vs Sabotage Opponent)
          ws.status = "choosing";
        }

        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 4g. RESOLVE WHEEL TACTICAL CHOICE (Forward Boost vs Sabotage / Freeze Target)
      // -------------------------------------------------------------
      case "resolve_wheel_choice": {
        const ws = room.wheel_state;
        if (!ws || ws.status !== "choosing") {
          return actionResponse({ success: true, room });
        }

        const activeTeam = ws.team;
        if (!canPlayerControlWheel(room, playerId ? String(playerId) : undefined, activeTeam)) {
          return actionResponse(
            { error: "Only members of the team on the Wheel Checkpoint can lock in this tactical choice." },
            { status: 403 }
          );
        }

        const choiceType: "forward" | "back" | "freeze" | "freeze_player" = body.choiceType;
        const activeTeamObj = getTeamObj(room, activeTeam);
        const scoreGoal = room.settings?.scoreGoal || 20;
        const activeKeys = getActiveTeamKeys(room);
        const opponentKeys = activeKeys.filter((k) => k !== activeTeam);
        const chosenTarget: "A" | "B" | "C" | "D" =
          body.targetTeam && opponentKeys.includes(body.targetTeam)
            ? body.targetTeam
            : opponentKeys[0] || (activeTeam === "A" ? "B" : "A");
        const targetObj = getTeamObj(room, chosenTarget);

        const steps = ws.wedgeId === "tactical_3" ? 3 : 2;

        // Check how many active (non-away) players the target team has
        const targetTeamActivePlayers = (targetObj.playerIds || []).filter(
          (pid) => !(room.inactive_players || []).includes(pid)
        );

        if (choiceType === "freeze_player" && body.targetPlayerId) {
          const targetPlayerId = String(body.targetPlayerId);
          const targetPlayerName =
            String(body.targetPlayerName || "").trim() ||
            room.player_details?.[targetPlayerId]?.name ||
            "Rival Speaker";

          // If this rival team only has 1 active player, freezing that player is equivalent to freezing their team turn
          if (targetTeamActivePlayers.length <= 1) {
            if (!room.frozen_teams) room.frozen_teams = [];
            if (!room.frozen_teams.includes(chosenTarget)) {
              room.frozen_teams.push(chosenTarget);
            }
            ws.status = "resolved";
            ws.targetTeam = chosenTarget;
            ws.targetPlayerId = targetPlayerId;
            ws.targetPlayerName = targetPlayerName;
            ws.resultSummary = `${activeTeamObj.name} froze ${targetPlayerName} (${targetObj.name}) — their team skips their next turn!`;
            ws.resolvedAt = Date.now();
          } else {
            if (!room.frozen_players) room.frozen_players = [];
            if (!room.frozen_players.includes(targetPlayerId)) {
              room.frozen_players.push(targetPlayerId);
            }
            ws.status = "resolved";
            ws.targetTeam = chosenTarget;
            ws.targetPlayerId = targetPlayerId;
            ws.targetPlayerName = targetPlayerName;
            ws.resultSummary = `${activeTeamObj.name} froze ${targetPlayerName} (${targetObj.name}) — they will be skipped on their next speaking turn!`;
            ws.resolvedAt = Date.now();
          }
        } else if (ws.wedgeId === "freeze_opponent" || choiceType === "freeze") {
          if (!room.frozen_teams) room.frozen_teams = [];
          if (!room.frozen_teams.includes(chosenTarget)) {
            room.frozen_teams.push(chosenTarget);
          }
          ws.status = "resolved";
          ws.targetTeam = chosenTarget;
          ws.resultSummary = `${activeTeamObj.name} froze ${targetObj.name}'s entire next turn!`;
          ws.resolvedAt = Date.now();
        } else if (choiceType === "forward") {
          const maxScore = Math.max(activeTeamObj.score, scoreGoal - 1);
          const before = activeTeamObj.score;
          activeTeamObj.score = Math.min(maxScore, activeTeamObj.score + steps);
          const gained = activeTeamObj.score - before;
          ws.status = "resolved";
          ws.targetTeam = activeTeam;
          ws.resultSummary = `${activeTeamObj.name} chose to surge forward +${gained} ${gained === 1 ? "step" : "steps"} to tile ${activeTeamObj.score}!`;
          ws.resolvedAt = Date.now();
        } else {
          // Sabotage opponent back
          const before = targetObj.score;
          targetObj.score = Math.max(0, targetObj.score - steps);
          const lost = before - targetObj.score;
          ws.status = "resolved";
          ws.targetTeam = chosenTarget;
          ws.resultSummary =
            lost > 0
              ? `${activeTeamObj.name} pushed ${targetObj.name} back -${lost} ${lost === 1 ? "step" : "steps"} to tile ${targetObj.score}!`
              : `${activeTeamObj.name} targeted ${targetObj.name} (already at Start)!`;
          ws.resolvedAt = Date.now();
        }

        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 5. PASS WORD
      // -------------------------------------------------------------
      case "pass_word": {
        if (room.status !== "playing") {
          return actionResponse({ error: "Game is not playing" }, { status: 400 });
        }

        const currentWord = room.deck[room.current_word_index];
        if (currentWord) {
          room.round_words_passed.push(currentWord);
        }

        room.current_word_index += 1;
        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 6. END ROUND (UNLOCKS ROOM & ADMITS SPECTATORS)
      // -------------------------------------------------------------
      case "end_round": {
        if (room.status !== "playing") {
          return actionResponse({ success: true, room });
        }

        // Prevent premature ending if round was started less than 5 seconds ago (unless manually triggered by speaker)
        const roundStartedAt = room.current_turn?.startedAt || 0;
        const now = Date.now();
        const isCurrentSpeaker = body.speakerId && body.speakerId === room.current_turn?.speakerId;
        if (roundStartedAt > 0 && now < roundStartedAt + 5000 && !isCurrentSpeaker && !body.manualEnd) {
          // Ignore premature clock-drift triggers from background peers
          return actionResponse({ success: true, room });
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
          const activeKeys = getActiveTeamKeys(room);
          for (const specId of room.spectators) {
            if (!isPlayerInAnyTeam(room, specId)) {
              // Balance team distribution
              let bestKey: "A" | "B" | "C" | "D" = activeKeys[0];
              let minCount = Infinity;
              for (const key of activeKeys) {
                const count = getTeamObj(room, key).playerIds?.length || 0;
                if (count < minCount) {
                  minCount = count;
                  bestKey = key;
                }
              }
              getTeamObj(room, bestKey).playerIds.push(specId);
            }
            if (!room.active_players.includes(specId)) {
              room.active_players.push(specId);
            }
          }
          // Clear spectators now that they are drafted into teams
          room.spectators = [];
        }

        // Check if active team landed on a Wheel Checkpoint tile (7, 14, 21, 28...)
        syncWheelCheckpoint(room);

        await persistRoom(room);
        return actionResponse({
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
        if (!room.match_ended_at) {
          room.match_ended_at = new Date().toISOString();
        }
        await persistRoom(room);
        // Append to the durable match ledger (powers all-time Articulate hours in admin)
        await logArticulateMatch(room, "finished");
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 7. RESET GAME
      // -------------------------------------------------------------
      case "reset_game": {
        // "Play Again" wipes the match clock below, so log the outgoing match first.
        // Upsert keyed by (room_code, started_at), so an already-finished match is not double counted.
        if (room.match_started_at) {
          await logArticulateMatch(
            { ...room, teams: { ...room.teams } } as ArticulateRoom,
            room.match_ended_at ? "finished" : "reset"
          );
        }
        room.status = "lobby";
        room.locked = false;
        room.match_started_at = undefined;
        room.match_ended_at = undefined;
        room.goal_reached_at = undefined;
        room.active_play_seconds = undefined;
        room.last_activity_at = undefined;
        room.teams.teamA.score = 0;
        room.teams.teamB.score = 0;
        if (room.teams.teamC) room.teams.teamC.score = 0;
        if (room.teams.teamD) room.teams.teamD.score = 0;
        room.current_turn = null;
        room.current_word_index = 0;
        room.round_words_scored = [];
        room.round_words_passed = [];
        room.wheel_state = null;
        room.wheel_checkpoints_claimed = {};
        room.frozen_teams = [];
        room.frozen_players = [];
        room.extra_turn_team = null;
        room.last_turn_skip_notice = null;
        room.deck = buildDeck(
          room.settings.categories,
          room.settings.difficulty,
          Math.max(120, (room.settings.scoreGoal || 20) * 3)
        );

        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 8. UPDATE SETTINGS (Host adjusts duration 30s/60s, score goal, or team count)
      // -------------------------------------------------------------
      case "update_settings": {
        const actingHostId = String(hostId || playerId);
        if (room.host_id !== actingHostId) {
          return actionResponse(
            { error: "Only the host can modify match settings" },
            { status: 403 }
          );
        }
        if (room.status === "playing") {
          return actionResponse(
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
          if (
            settings.buzzerSound &&
            ["classic", "airhorn", "bell", "gong", "arcade"].includes(settings.buzzerSound)
          ) {
            room.settings.buzzerSound = settings.buzzerSound;
          }
        }

        // Support dynamically expanding or adjusting team count in lobby (2, 3, or 4 teams)
        const requestedTeamCount = typeof body.teamCount === "number" ? body.teamCount : typeof settings?.teamCount === "number" ? settings.teamCount : null;
        if (requestedTeamCount && [2, 3, 4].includes(requestedTeamCount)) {
          room.settings.teamCount = requestedTeamCount;
          if (requestedTeamCount >= 3 && !room.teams.teamC) {
            room.teams.teamC = {
              name: "Team Delta",
              color: "#10B981",
              score: 0,
              playerIds: [],
            };
            if (room.last_speaker_indices) room.last_speaker_indices.teamC = -1;
          }
          if (requestedTeamCount >= 4 && !room.teams.teamD) {
            room.teams.teamD = {
              name: "Team Sigma",
              color: "#F59E0B",
              score: 0,
              playerIds: [],
            };
            if (room.last_speaker_indices) room.last_speaker_indices.teamD = -1;
          }
          if (requestedTeamCount < 4 && room.teams.teamD) {
            const orphaned = room.teams.teamD.playerIds || [];
            orphaned.forEach((id, idx) => {
              if (idx % 2 === 0) room.teams.teamA.playerIds.push(id);
              else room.teams.teamB.playerIds.push(id);
            });
            delete room.teams.teamD;
            if (room.last_speaker_indices) delete room.last_speaker_indices.teamD;
            if (room.last_speaker_ids) delete room.last_speaker_ids.teamD;
          }
          if (requestedTeamCount < 3 && room.teams.teamC) {
            const orphaned = room.teams.teamC.playerIds || [];
            orphaned.forEach((id, idx) => {
              if (idx % 2 === 0) room.teams.teamA.playerIds.push(id);
              else room.teams.teamB.playerIds.push(id);
            });
            delete room.teams.teamC;
            if (room.last_speaker_indices) delete room.last_speaker_indices.teamC;
            if (room.last_speaker_ids) delete room.last_speaker_ids.teamC;
          }
        }

        sanitizeRoomPlayers(room);
        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 9. TOGGLE INACTIVE / AFK (Host or Self)
      // -------------------------------------------------------------
      case "toggle_inactive": {
        const actingHostId = body.hostId ? String(body.hostId) : null;
        const targetId = String(body.targetPlayerId || playerId);

        // If someone other than the player themselves is toggling, verify they are the host
        if (actingHostId && actingHostId !== targetId && room.host_id !== actingHostId) {
          return actionResponse(
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
        return actionResponse({
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
        const chosenNewHost = body.newHostId || body.targetPlayerId;

        // Remove from all teams
        removePlayerFromAllTeams(room, id);

        // Remove from active players, spectators, and inactive players
        room.active_players = room.active_players.filter((p) => p !== id);
        room.spectators = room.spectators.filter((p) => p !== id);
        if (room.inactive_players) {
          room.inactive_players = room.inactive_players.filter((p) => p !== id);
        }

        if (room.player_details?.[id]) {
          room.player_details[id].isHost = false;
        }

        // If the host leaves, transfer host to designated successor or best available player
        if (room.host_id === id) {
          let newHostId: string | null = null;
          let newHostName = "Scholar";

          // If a specific successor was chosen by the host
          if (chosenNewHost && chosenNewHost !== id) {
            newHostId = String(chosenNewHost);
            newHostName =
              room.player_details?.[newHostId]?.name ||
              body.newHostName ||
              body.targetPlayerName ||
              "Scholar";
          } else {
            // Fallback: search remaining players, prioritizing non-inactive team members
            const activeKeys = getActiveTeamKeys(room);
            const teamPlayers: string[] = [];
            for (const key of activeKeys) {
              teamPlayers.push(...(getTeamObj(room, key).playerIds || []));
            }
            const nonInactiveTeamPlayers = teamPlayers.filter(
              (p) => !(room.inactive_players || []).includes(p)
            );
            const remainingPlayers = [
              ...nonInactiveTeamPlayers,
              ...teamPlayers.filter((p) => (room.inactive_players || []).includes(p)),
              ...room.spectators,
            ].filter((p) => p !== id);

            if (remainingPlayers.length > 0) {
              newHostId = remainingPlayers[0];
              newHostName = room.player_details?.[newHostId]?.name || "Scholar";
            }
          }

          if (newHostId) {
            room.host_id = newHostId;
            room.host_name = newHostName;
            if (!room.player_details) room.player_details = {};
            Object.keys(room.player_details).forEach((pId) => {
              if (room.player_details![pId]) {
                room.player_details![pId].isHost = pId === newHostId;
              }
            });
            if (room.player_details[newHostId]) {
              room.player_details[newHostId].isHost = true;
            } else {
              room.player_details[newHostId] = {
                id: newHostId,
                name: newHostName,
                avatar: "/avatars/avatar-scholar.svg",
                isHost: true,
                joinedAt: Date.now(),
              };
            }
          }
        }

        sanitizeRoomPlayers(room);
        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 11. RENAME PLAYER
      // -------------------------------------------------------------
      case "rename_player": {
        const id = String(playerId);
        const newName = String(body.newName || "").trim();
        if (!newName) {
          return actionResponse({ error: "Name cannot be empty" }, { status: 400 });
        }

        const normNew = newName.toLowerCase();
        const isGeneric = normNew === "scholar" || normNew === "learner";

        if (!isGeneric) {
          const isTaken = Object.values(room.player_details || {}).some(
            (d) => d.id !== id && d.name?.trim().toLowerCase() === normNew
          );
          if (isTaken) {
            return actionResponse(
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
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 11b. KICK PLAYER (Host ejects a player from the room)
      // -------------------------------------------------------------
      case "kick_player": {
        const actingHostId = String(hostId || playerId);
        if (room.host_id !== actingHostId) {
          return actionResponse(
            { error: "Only the room host can remove players from the match" },
            { status: 403 }
          );
        }

        const targetId = String(body.targetPlayerId || "").trim();
        if (!targetId) {
          return actionResponse({ error: "Missing targetPlayerId" }, { status: 400 });
        }

        if (targetId === room.host_id) {
          return actionResponse({ error: "The host cannot kick themselves from the room" }, { status: 400 });
        }

        // Remove from everywhere
        removePlayerFromAllTeams(room, targetId);
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

        return actionResponse({
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
          return actionResponse(
            { error: "Only the host can rename the match" },
            { status: 403 }
          );
        }
        const newRoomName = String(body.newRoomName || body.roomName || "").trim();
        room.room_name = newRoomName || undefined;

        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 13. RENAME TEAM (Host custom team names)
      // -------------------------------------------------------------
      case "rename_team": {
        const actingHostId = String(hostId || playerId);
        if (room.host_id !== actingHostId) {
          return actionResponse(
            { error: "Only the host can rename teams" },
            { status: 403 }
          );
        }
        const targetTeam = body.targetTeam || body.team;
        const targetTeamKey: "teamA" | "teamB" | "teamC" | "teamD" =
          targetTeam === "B" ? "teamB" : targetTeam === "C" ? "teamC" : targetTeam === "D" ? "teamD" : "teamA";
        const newTeamName = String(body.newTeamName || body.teamName || "").trim();

        if (newTeamName && room.teams[targetTeamKey]) {
          room.teams[targetTeamKey].name = newTeamName;
        }

        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      // -------------------------------------------------------------
      // 14. TRANSFER HOST
      // -------------------------------------------------------------
      case "transfer_host": {
        const callerId = String(hostId || playerId);
        const targetId = String(body.targetPlayerId || body.newHostId);

        if (!targetId) {
          return actionResponse({ error: "Target player ID is required" }, { status: 400 });
        }

        if (callerId !== room.host_id) {
          return actionResponse({ error: "Only the current host can transfer host privileges" }, { status: 403 });
        }

        if (targetId === room.host_id) {
          return actionResponse({ error: "Player is already the host" }, { status: 400 });
        }

        // Verify target exists in room
        const targetDetail = room.player_details?.[targetId];
        const allRoomPlayers = [
          ...room.active_players,
          ...room.spectators,
          ...(room.teams?.teamA?.playerIds || []),
          ...(room.teams?.teamB?.playerIds || []),
          ...(room.teams?.teamC?.playerIds || []),
          ...(room.teams?.teamD?.playerIds || []),
          ...Object.keys(room.player_details || {}),
        ];

        if (!allRoomPlayers.includes(targetId) && !targetDetail) {
          return actionResponse({ error: "Target player not found in this room" }, { status: 404 });
        }

        const newHostName =
          targetDetail?.name ||
          body.targetPlayerName ||
          body.newHostName ||
          "Scholar";

        const previousHostId = room.host_id;
        room.host_id = targetId;
        room.host_name = newHostName;

        if (!room.player_details) room.player_details = {};
        Object.keys(room.player_details).forEach((pId) => {
          if (room.player_details![pId]) {
            room.player_details![pId].isHost = pId === targetId;
          }
        });

        if (room.player_details[targetId]) {
          room.player_details[targetId].isHost = true;
          room.player_details[targetId].name = newHostName;
        } else {
          room.player_details[targetId] = {
            id: targetId,
            name: newHostName,
            avatar: "/avatars/avatar-scholar.svg",
            isHost: true,
            joinedAt: Date.now(),
          };
        }

        sanitizeRoomPlayers(room);
        await persistRoom(room);
        return actionResponse({ success: true, room, previousHostId, newHostId: targetId });
      }

      // -------------------------------------------------------------
      // 15. CLAIM HOST (Safety recovery if host disconnected or went away)
      // -------------------------------------------------------------
      case "claim_host": {
        const claimantId = String(playerId);
        const claimantName = String(playerName || body.claimantName || "Scholar");

        if (!claimantId || claimantId === "undefined" || claimantId === "null") {
          return actionResponse({ error: "Claimant player ID is required" }, { status: 400 });
        }

        const previousHostId = room.host_id;
        room.host_id = claimantId;
        room.host_name = claimantName;

        if (!room.player_details) room.player_details = {};
        Object.keys(room.player_details).forEach((pId) => {
          if (room.player_details![pId]) {
            room.player_details![pId].isHost = pId === claimantId;
          }
        });

        if (room.player_details[claimantId]) {
          room.player_details[claimantId].isHost = true;
          room.player_details[claimantId].name = claimantName;
        } else {
          room.player_details[claimantId] = {
            id: claimantId,
            name: claimantName,
            avatar: body.avatar || "/avatars/avatar-scholar.svg",
            isHost: true,
            joinedAt: Date.now(),
          };
        }

        if (!room.active_players.includes(claimantId) && !room.spectators.includes(claimantId)) {
          room.active_players.push(claimantId);
        }

        if (room.inactive_players) {
          room.inactive_players = room.inactive_players.filter((p) => p !== claimantId);
        }

        sanitizeRoomPlayers(room);
        await persistRoom(room);
        return actionResponse({ success: true, room, previousHostId, newHostId: claimantId });
      }

      // -------------------------------------------------------------
      // 16. DEV PLAYTEST: ADD GHOST PLAYER (Local testing helper)
      // -------------------------------------------------------------
      case "dev_add_ghost": {
        const ghostNames = ["Ghost Tunde", "Ghost Amaka", "Ghost Chidi", "Ghost Zainab", "Ghost Femi", "Ghost Ngozi"];
        const existingNames = new Set(
          Object.values(room.player_details || {}).map((d) => d.name?.trim().toLowerCase())
        );
        const pickedName =
          body.ghostName ||
          ghostNames.find((n) => !existingNames.has(n.toLowerCase())) ||
          `Ghost #${Object.keys(room.player_details || {}).length + 1}`;
        const ghostId = `ghost-${Math.random().toString(36).slice(2, 8)}`;

        const activeKeys = getActiveTeamKeys(room);
        let assignTeam: "A" | "B" | "C" | "D" =
          body.targetTeam && activeKeys.includes(body.targetTeam) ? body.targetTeam : "B";
        if (!body.targetTeam) {
          // Pick team with fewest players (preferring B over A if tied so user on A gets an opponent)
          let minCount = Infinity;
          for (const key of [...activeKeys].reverse()) {
            const count = getTeamObj(room, key).playerIds?.length || 0;
            if (count < minCount) {
              minCount = count;
              assignTeam = key;
            }
          }
        }

        getTeamObj(room, assignTeam).playerIds.push(ghostId);
        if (!room.active_players.includes(ghostId)) {
          room.active_players.push(ghostId);
        }
        if (!room.player_details) room.player_details = {};
        room.player_details[ghostId] = {
          id: ghostId,
          name: pickedName,
          avatar: "/avatars/avatar-scholar.svg",
          isHost: false,
          joinedAt: Date.now(),
        };

        sanitizeRoomPlayers(room);
        await persistRoom(room);
        return actionResponse({ success: true, room, ghostId, ghostName: pickedName, team: assignTeam });
      }

      // -------------------------------------------------------------
      // 17. DEV PLAYTEST: JUMP TO TILE 7 / TRIGGER WHEEL CHECKPOINT
      // -------------------------------------------------------------
      case "dev_trigger_wheel": {
        const targetTeamKey: "A" | "B" | "C" | "D" =
          body.targetTeam || room.current_turn?.activeTeam || "A";
        const teamObj = getTeamObj(room, targetTeamKey);
        const scoreGoal = room.settings?.scoreGoal || 20;

        // Pick the next checkpoint tile (7, 14, 21...) or 7 by default
        const currentScore = teamObj.score || 0;
        let nextCheckpoint = 7;
        if (currentScore >= 7 && currentScore < 14 && scoreGoal > 14) {
          nextCheckpoint = 14;
        } else if (currentScore >= 14 && currentScore < 21 && scoreGoal > 21) {
          nextCheckpoint = 21;
        }
        teamObj.score = nextCheckpoint;

        // Ensure this checkpoint is un-claimed for dev testing so it can be spun repeatedly
        if (room.wheel_checkpoints_claimed?.[targetTeamKey]) {
          room.wheel_checkpoints_claimed[targetTeamKey] =
            room.wheel_checkpoints_claimed[targetTeamKey]!.filter((t) => t !== nextCheckpoint);
        }

        const roundNum = room.current_turn?.roundNumber || 1;
        const speakerId =
          teamObj.playerIds?.[0] || room.current_turn?.speakerId || room.host_id;
        const speakerName =
          room.player_details?.[speakerId]?.name ||
          room.current_turn?.speakerName ||
          room.host_name ||
          "Speaker";

        room.status = "round_end";
        room.locked = false;
        room.current_turn = {
          roundNumber: roundNum,
          activeTeam: targetTeamKey,
          speakerId,
          speakerName,
          startedAt: Date.now() - 30000,
          durationSeconds: room.settings?.timerSeconds || 45,
        };
        room.wheel_state = {
          roundNumber: roundNum,
          team: targetTeamKey,
          tileIndex: nextCheckpoint,
          status: "ready",
        };

        await persistRoom(room);
        return actionResponse({ success: true, room });
      }

      default:
        return actionResponse({ error: "Unknown action" }, { status: 400 });
    }
  }
}
