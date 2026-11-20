import { GameCategory, GameDifficulty, GameWord, buildDeck } from "./game-words";

export type RoomStatus = "lobby" | "playing" | "round_end" | "game_over";

export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  team: "A" | "B" | "C" | "D" | null;
  isHost: boolean;
  joinedAt: number;
}

export type BuzzerSoundType = "classic" | "airhorn" | "bell" | "gong" | "arcade";

export interface BuzzerOption {
  id: BuzzerSoundType;
  label: string;
  icon: string;
  description: string;
}

export const BUZZER_OPTIONS: BuzzerOption[] = [
  { id: "classic", label: "Classic Buzzer", icon: "🚨", description: "Iconic board-game vibrating electric buzz" },
  { id: "airhorn", label: "Party Airhorn", icon: "📢", description: "Hype stadium triple DJ airhorn blast" },
  { id: "bell", label: "Boxing Bell", icon: "🔔", description: "Sharp triple-ding championship round bell" },
  { id: "gong", label: "Temple Gong", icon: "🥁", description: "Deep resonant cinematic bronze strike" },
  { id: "arcade", label: "8-Bit Arcade", icon: "👾", description: "Retro gaming down-pitch laser zap" },
];

export interface RoomSettings {
  timerSeconds: number;
  scoreGoal: number;
  categories: GameCategory[];
  difficulty: GameDifficulty;
  gameMode?: "classic" | "masterchef";
  buzzerSound?: BuzzerSoundType;
  teamCount?: number;
}

export interface RoomTeam {
  name: string;
  color: string;
  score: number;
  playerIds: string[];
}

export interface CurrentTurn {
  roundNumber: number;
  activeTeam: "A" | "B" | "C" | "D";
  speakerId: string;
  speakerName: string;
  startedAt: number;
  durationSeconds: number;
  countdownEndsAt?: number;
  turnEndsAt?: number;
}

export type DisputeStatus = "none" | "disputed" | "conceded" | "rejected";

export interface ScoredWordEntry extends GameWord {
  disputeStatus?: DisputeStatus;
  disputedBy?: string; // Opponent who flagged it
  concededBy?: string; // Describing team member who confirmed it
  disputeCount?: number; // Number of challenge/dispute attempts (up to 3)
}

export type PassedWordClaimStatus = "none" | "claimed" | "awarded" | "rejected";

export interface PassedWordEntry extends GameWord {
  claimStatus?: PassedWordClaimStatus;
  claimedBy?: string; // Describing team member who claimed it
  awardedBy?: string; // Opponent who confirmed and awarded it
  rejectedBy?: string; // Opponent who rejected it
  claimCount?: number; // Number of claim attempts (up to 3)
}

export type WheelWedgeId =
  | "tactical_2"
  | "tactical_3"
  | "extra_turn"
  | "freeze_opponent"
  | "bonus_1"
  | "push_leader_2";

export interface WheelWedgeSpec {
  id: WheelWedgeId;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  needsChoice: boolean;
}

export const WHEEL_WEDGES: WheelWedgeSpec[] = [
  {
    id: "tactical_2",
    label: "Tactical ±2",
    shortLabel: "±2 Step",
    description: "Move +2 steps forward OR push an opponent -2 steps back",
    color: "#3B6360",
    needsChoice: true,
  },
  {
    id: "tactical_3",
    label: "Power Swing ±3",
    shortLabel: "±3 Step",
    description: "Move +3 steps forward OR push an opponent -3 steps back",
    color: "#7A1C2E",
    needsChoice: true,
  },
  {
    id: "extra_turn",
    label: "Take Next Turn",
    shortLabel: "Encore",
    description: "Encore! Your team takes the very next turn back-to-back",
    color: "#A67C1E",
    needsChoice: false,
  },
  {
    id: "freeze_opponent",
    label: "Freeze Player / Team",
    shortLabel: "Freeze",
    description: "Freeze a rival team's next turn OR freeze a rival speaker in their tracks",
    color: "#2563EB",
    needsChoice: true,
  },
  {
    id: "bonus_1",
    label: "Forward +1",
    shortLabel: "+1 Step",
    description: "Instant +1 bonus step forward on the board",
    color: "#444E2C",
    needsChoice: false,
  },
  {
    id: "push_leader_2",
    label: "Leader Setback -2",
    shortLabel: "Top -2",
    description: "Automatically pushes the leading rival team back 2 steps",
    color: "#5A4565",
    needsChoice: false,
  },
];

export function isWheelCheckpointTile(score: number, scoreGoal: number): boolean {
  return score > 0 && score < scoreGoal && score % 7 === 0;
}

export interface RoomWheelState {
  roundNumber: number;
  team: "A" | "B" | "C" | "D";
  tileIndex: number;
  status: "ready" | "choosing" | "resolved";
  wedgeIndex?: number;
  wedgeId?: WheelWedgeId;
  wedgeLabel?: string;
  spinNonce?: number;
  spunBy?: string;
  resultSummary?: string;
  targetTeam?: "A" | "B" | "C" | "D";
  targetPlayerId?: string;
  targetPlayerName?: string;
  resolvedAt?: number;
}

export interface ArticulateRoom {
  id?: string;
  room_code: string;
  room_name?: string; // Custom match / group title e.g. "Lokin Labs Hangout", "Designers vs Engineers"
  host_id: string;
  host_name: string;
  status: RoomStatus;
  locked: boolean;
  settings: RoomSettings;
  teams: {
    teamA: RoomTeam;
    teamB: RoomTeam;
    teamC?: RoomTeam;
    teamD?: RoomTeam;
  };
  current_turn: CurrentTurn | null;
  deck: GameWord[];
  current_word_index: number;
  round_words_scored: ScoredWordEntry[];
  round_words_passed: PassedWordEntry[];
  active_players: string[]; // Player IDs locked in for active round
  spectators: string[]; // Player IDs waiting in spectator lounge
  inactive_players?: string[]; // Player IDs toggled AFK / Inactive
  kicked_players?: string[]; // Player IDs ejected from match by host
  player_details?: Record<string, { id: string; name: string; avatar: string; isHost?: boolean; joinedAt?: number }>; // Persisted identity map
  last_speaker_indices?: { teamA?: number; teamB?: number; teamC?: number; teamD?: number }; // Track strict round-robin index per team
  last_speaker_ids?: { teamA?: string; teamB?: string; teamC?: string; teamD?: string }; // Track strict last speaker ID per team
  wheel_state?: RoomWheelState | null; // Active or resolved wheel checkpoint event for the current round
  wheel_checkpoints_claimed?: Partial<Record<"A" | "B" | "C" | "D", number[]>>; // Track claimed checkpoints per team (e.g. { A: [7, 14] }) so a team cannot farm the same tile twice
  frozen_teams?: ("A" | "B" | "C" | "D")[]; // Teams whose next turn is frozen/skipped
  frozen_players?: string[]; // Individual player IDs whose next speaking turn is frozen/skipped
  extra_turn_team?: "A" | "B" | "C" | "D" | null; // Team granted an immediate back-to-back encore turn
  last_turn_skip_notice?: string | null; // Banner notice when a frozen team/player was skipped or encore turn triggered
  match_started_at?: string; // ISO timestamp when first round started
  match_ended_at?: string; // ISO timestamp when match concluded / winner declared
  goal_reached_at?: string; // ISO timestamp when victory scoreGoal was achieved
  active_play_seconds?: number; // Accumulated active play time, paused when inactive > 10m
  last_activity_at?: string; // ISO timestamp of most recent player action
  version?: number; // Monotonic revision counter, bumped on every persisted write (stale-snapshot rejection)
  created_at?: string;
  updated_at?: string;
}

/**
 * Calculates total active match play time in seconds and human-formatted string (e.g. "18m 42s" or "1h 15m").
 * - Starts timeline strictly when the first round begins (match_started_at), ignoring lobby setup time.
 * - Concludes timeline strictly when a winner is declared or victory score goal achieved (match_ended_at / goal_reached_at).
 * - Pauses accumulation if there is no game activity for > 10 minutes (600s).
 */
export function calculateMatchPlayTime(room: ArticulateRoom | Partial<ArticulateRoom>): { seconds: number; formatted: string } {
  const totalScore =
    (room.teams?.teamA?.score ?? 0) +
    (room.teams?.teamB?.score ?? 0) +
    (room.teams?.teamC?.score ?? 0) +
    (room.teams?.teamD?.score ?? 0);
  const timerSeconds = room.settings?.timerSeconds || 45;
  const recordedRounds = room.current_turn?.roundNumber || 0;
  const estimatedRounds = Math.max(1, Math.ceil(totalScore / 3.5));
  const rounds = Math.max(recordedRounds, estimatedRounds);

  // 1. Explicit active_play_seconds recorded by action tracker
  if (typeof room.active_play_seconds === "number" && room.active_play_seconds > 0) {
    const sec = Math.round(room.active_play_seconds);
    return { seconds: sec, formatted: formatMatchDuration(sec) };
  }

  // 2. Explicit match start timestamp
  if (room.match_started_at) {
    const startMs = new Date(room.match_started_at).getTime();
    const endIso =
      room.match_ended_at ||
      room.goal_reached_at ||
      (room.status === "game_over" ? (room.last_activity_at || room.updated_at) : undefined);

    let endMs: number;
    if (endIso) {
      endMs = new Date(endIso).getTime();
    } else {
      // In-progress room: if inactive for > 10 minutes, pause after 10m
      const lastActiveMs = room.last_activity_at ? new Date(room.last_activity_at).getTime() : startMs;
      const idleMs = Date.now() - lastActiveMs;
      endMs = idleMs > 10 * 60 * 1000 ? lastActiveMs + 10 * 60 * 1000 : Date.now();
    }

    const rawDiffSec = Math.max(1, Math.round((endMs - startMs) / 1000));

    // Cap timeline if excessive idle gaps (> 10m per round) occurred between rounds
    const maxPlausibleSec = rounds * (timerSeconds + 600); // 10 minutes max pause per round
    if (rawDiffSec <= maxPlausibleSec) {
      return { seconds: rawDiffSec, formatted: formatMatchDuration(rawDiffSec) };
    }

    // Normalized active duration with 10m pause applied
    const normalizedSec = Math.max(timerSeconds, Math.round(rounds * (timerSeconds + 25)));
    return { seconds: normalizedSec, formatted: formatMatchDuration(normalizedSec) };
  }

  // 3. Fallback for legacy rooms: calculate active play duration based on rounds and active speech
  const estimatedSeconds = Math.max(rounds * (timerSeconds + 25), timerSeconds);
  return { seconds: estimatedSeconds, formatted: formatMatchDuration(estimatedSeconds) };
}

export function formatMatchDuration(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${Math.max(1, totalSeconds)}s`;
  }
  const hours = Math.floor(totalSeconds / 3600);
  if (hours > 0) {
    const roundedMins = Math.round((totalSeconds % 3600) / 60);
    const displayHours = hours + Math.floor(roundedMins / 60);
    const displayMins = roundedMins % 60;
    return displayMins > 0 ? `${displayHours}h ${displayMins}m` : `${displayHours}h`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

/** Number of upcoming words shipped to clients (clients only ever read deck[current_word_index]). */
const CLIENT_DECK_WINDOW = 12;

/**
 * Produces a lightweight wire copy of the room: the full 120-200 word deck is replaced by a
 * sparse array containing only the current word and a small look-ahead window, so indices
 * stay valid (`deck[current_word_index]`) while payloads shrink dramatically.
 */
export function toClientRoom(room: ArticulateRoom): ArticulateRoom {
  const deck = room.deck || [];
  const idx = room.current_word_index || 0;
  const end = Math.min(deck.length, idx + CLIENT_DECK_WINDOW);
  const windowed: (GameWord | null)[] = new Array(Math.max(0, end)).fill(null);
  for (let i = idx; i < end; i++) windowed[i] = deck[i];
  return { ...room, deck: windowed as unknown as GameWord[] };
}

/**
 * Client-side ordering guard: returns true when `incoming` should replace `prev`.
 * Rejects snapshots carrying an older version (late poll responses, delayed broadcasts),
 * which is what caused previous turns to flash back onto screens.
 */
export function isRoomSnapshotFresh(prev: ArticulateRoom | null, incoming: ArticulateRoom): boolean {
  if (!prev) return true;
  if (typeof prev.version === "number" && typeof incoming.version === "number") {
    return incoming.version >= prev.version;
  }
  // Legacy rooms without versions: fall back to updated_at ordering
  if (prev.updated_at && incoming.updated_at) {
    return new Date(incoming.updated_at).getTime() >= new Date(prev.updated_at).getTime();
  }
  return true;
}

/**
 * Sequential round-robin speaker selection that steps forward through the team roster,
 * skipping inactive scholars without ever jumping or skipping active players.
 */
export function getNextSpeakerForTeam(
  playerIds: string[],
  inactivePlayerIds: string[] = [],
  lastSpeakerId?: string,
  lastSpeakerIndex?: number,
  frozenPlayerIds: string[] = []
): { speakerId: string; speakerIndex: number; skippedFrozenPlayerIds: string[] } {
  if (!playerIds || playerIds.length === 0) return { speakerId: "", speakerIndex: -1, skippedFrozenPlayerIds: [] };

  let lastIdx = -1;
  if (lastSpeakerId && playerIds.includes(lastSpeakerId)) {
    lastIdx = playerIds.indexOf(lastSpeakerId);
  } else if (typeof lastSpeakerIndex === "number" && lastSpeakerIndex >= 0 && lastSpeakerIndex < playerIds.length) {
    lastIdx = lastSpeakerIndex;
  }

  const skippedFrozenPlayerIds: string[] = [];
  const n = playerIds.length;
  for (let step = 1; step <= n; step++) {
    const candidateIdx = (lastIdx + step) % n;
    const candidateId = playerIds[candidateIdx];
    if (inactivePlayerIds.includes(candidateId)) continue;
    if (frozenPlayerIds.includes(candidateId) && skippedFrozenPlayerIds.length < n - 1) {
      skippedFrozenPlayerIds.push(candidateId);
      continue;
    }
    return { speakerId: candidateId, speakerIndex: candidateIdx, skippedFrozenPlayerIds };
  }

  const fallbackIdx = (lastIdx + 1) % n;
  return { speakerId: playerIds[fallbackIdx] || playerIds[0], speakerIndex: fallbackIdx, skippedFrozenPlayerIds };
}

/**
 * Computes which team takes the next turn in an ArticulateRoom, accounting for:
 * 1. `extra_turn_team` (Take Next Turn / Encore wedge from the Wheel)
 * 2. `frozen_teams` (Freeze Opponent wedge from the Wheel — skips frozen teams in rotation)
 */
export function peekNextTurnSchedule(room: ArticulateRoom): {
  nextTeamKey: "A" | "B" | "C" | "D";
  skippedFrozenTeams: ("A" | "B" | "C" | "D")[];
  isExtraTurn: boolean;
} {
  const activeKeys: ("A" | "B" | "C" | "D")[] = ["A", "B"];
  if (room.teams?.teamC) activeKeys.push("C");
  if (room.teams?.teamD) activeKeys.push("D");

  if (room.extra_turn_team && activeKeys.includes(room.extra_turn_team)) {
    return {
      nextTeamKey: room.extra_turn_team,
      skippedFrozenTeams: [],
      isExtraTurn: true,
    };
  }

  const currentTeam = room.current_turn?.activeTeam;
  let candidateIdx = 0;
  if (currentTeam && activeKeys.includes(currentTeam)) {
    candidateIdx = (activeKeys.indexOf(currentTeam) + 1) % activeKeys.length;
  } else {
    const nextRoundNumber = (room.current_turn?.roundNumber || 0) + 1;
    candidateIdx = (nextRoundNumber - 1) % activeKeys.length;
  }

  const frozenList = [...(room.frozen_teams || [])];
  const skippedFrozenTeams: ("A" | "B" | "C" | "D")[] = [];

  for (let i = 0; i < activeKeys.length; i++) {
    const candidateKey = activeKeys[(candidateIdx + i) % activeKeys.length];
    if (frozenList.includes(candidateKey) && skippedFrozenTeams.length < activeKeys.length - 1) {
      skippedFrozenTeams.push(candidateKey);
      continue;
    }
    return {
      nextTeamKey: candidateKey,
      skippedFrozenTeams,
      isExtraTurn: false,
    };
  }

  return {
    nextTeamKey: activeKeys[candidateIdx] || "A",
    skippedFrozenTeams,
    isExtraTurn: false,
  };
}

// In-memory server fallback map for zero-setup resilience
const globalRooms = globalThis as unknown as {
  _articulate_rooms?: Map<string, ArticulateRoom>;
};

if (!globalRooms._articulate_rooms) {
  globalRooms._articulate_rooms = new Map<string, ArticulateRoom>();
}

export const memoryRooms = globalRooms._articulate_rooms;

export function generateRoomCode(): string {
  // Generate 4-letter memorable uppercase alphanumeric code
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "FEY-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function createInitialRoom(
  code: string,
  host: { id: string; name: string },
  settings: Partial<RoomSettings> = {},
  options: {
    roomName?: string;
    teamAName?: string;
    teamBName?: string;
    teamCName?: string;
    teamDName?: string;
    teamCount?: number;
  } = {}
): ArticulateRoom {
  const mergedTeamCount = options.teamCount || settings.teamCount || 2;
  const mergedSettings: RoomSettings = {
    timerSeconds: settings.timerSeconds || 45,
    scoreGoal: settings.scoreGoal || 20,
    categories: settings.categories || ["Object", "Nature", "Person", "Action", "World", "Random"],
    difficulty: settings.difficulty || "mixed",
    buzzerSound: settings.buzzerSound || "classic",
    teamCount: mergedTeamCount,
  };

  const deck = buildDeck(
    mergedSettings.categories,
    mergedSettings.difficulty,
    Math.max(120, mergedSettings.scoreGoal * 3)
  );

  const teams: ArticulateRoom["teams"] = {
    teamA: {
      name: options.teamAName?.trim() || "Team Alpha",
      color: "#EF4444",
      score: 0,
      playerIds: [host.id],
    },
    teamB: {
      name: options.teamBName?.trim() || "Team Omega",
      color: "#3B82F6",
      score: 0,
      playerIds: [],
    },
  };

  if (mergedTeamCount >= 3) {
    teams.teamC = {
      name: options.teamCName?.trim() || "Team Delta",
      color: "#10B981",
      score: 0,
      playerIds: [],
    };
  }

  if (mergedTeamCount >= 4) {
    teams.teamD = {
      name: options.teamDName?.trim() || "Team Sigma",
      color: "#F59E0B",
      score: 0,
      playerIds: [],
    };
  }

  const last_speaker_indices: Record<string, number> = {
    teamA: -1,
    teamB: -1,
  };
  if (mergedTeamCount >= 3) last_speaker_indices.teamC = -1;
  if (mergedTeamCount >= 4) last_speaker_indices.teamD = -1;

  return {
    room_code: code.toUpperCase().trim(),
    room_name: options.roomName?.trim() || undefined,
    host_id: host.id,
    host_name: host.name,
    status: "lobby",
    locked: false,
    settings: mergedSettings,
    teams,
    current_turn: null,
    deck,
    current_word_index: 0,
    round_words_scored: [],
    round_words_passed: [],
    active_players: [host.id],
    spectators: [],
    inactive_players: [],
    kicked_players: [],
    player_details: {
      [host.id]: {
        id: host.id,
        name: host.name,
        avatar: "/avatars/avatar-scholar.svg",
        isHost: true,
        joinedAt: Date.now(),
      },
    },
    last_speaker_indices,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Robustly sanitizes player rosters and identity maps across a room:
 * 1. Purges kicked player IDs from all rosters.
 * 2. Deduplicates player arrays in all active teams.
 * 3. Ensures no ID exists in multiple teams.
 * 4. Ensures no team player is also in spectators.
 * 5. Re-syncs active_players with team rosters.
 * 6. Eliminates duplicate display names (ghost IDs from guest-to-registered transitions).
 */
export function sanitizeRoomPlayers(room: ArticulateRoom): ArticulateRoom {
  if (!room.teams) {
    room.teams = {
      teamA: { name: "Team Alpha", color: "#EF4444", score: 0, playerIds: [] },
      teamB: { name: "Team Omega", color: "#3B82F6", score: 0, playerIds: [] },
    };
  }
  if (!room.teams.teamA.playerIds) room.teams.teamA.playerIds = [];
  if (!room.teams.teamB.playerIds) room.teams.teamB.playerIds = [];
  if (room.teams.teamC && !room.teams.teamC.playerIds) room.teams.teamC.playerIds = [];
  if (room.teams.teamD && !room.teams.teamD.playerIds) room.teams.teamD.playerIds = [];
  if (!room.active_players) room.active_players = [];
  if (!room.spectators) room.spectators = [];
  if (!room.inactive_players) room.inactive_players = [];
  if (!room.player_details) room.player_details = {};
  if (!room.kicked_players) room.kicked_players = [];

  const allActiveTeamList = [
    room.teams.teamA,
    room.teams.teamB,
    ...(room.teams.teamC ? [room.teams.teamC] : []),
    ...(room.teams.teamD ? [room.teams.teamD] : []),
  ];

  // 1. Remove kicked players from all lists
  if (room.kicked_players.length > 0) {
    const kickedSet = new Set(room.kicked_players);
    for (const t of allActiveTeamList) {
      t.playerIds = t.playerIds.filter((id) => !kickedSet.has(id));
    }
    room.active_players = room.active_players.filter((id) => !kickedSet.has(id));
    room.spectators = room.spectators.filter((id) => !kickedSet.has(id));
    room.inactive_players = room.inactive_players.filter((id) => !kickedSet.has(id));
    for (const kId of kickedSet) {
      delete room.player_details[kId];
    }
  }

  // 2. Deduplicate within teams and prevent any player ID from existing in multiple teams
  const seenTeamPlayers = new Set<string>();
  for (const t of allActiveTeamList) {
    const uniqueTeamIds: string[] = [];
    for (const id of t.playerIds) {
      if (id && !seenTeamPlayers.has(id)) {
        seenTeamPlayers.add(id);
        uniqueTeamIds.push(id);
      }
    }
    t.playerIds = uniqueTeamIds;
  }

  // 4. Prevent any team player from existing in spectators
  room.spectators = Array.from(new Set(room.spectators.filter((id) => Boolean(id) && !seenTeamPlayers.has(id))));

  // 5. Deduplicate and align active_players with actual team rosters
  room.active_players = Array.from(seenTeamPlayers);

  // 6. Clean inactive_players so only existing players remain
  const allExistingIds = new Set([...seenTeamPlayers, ...room.spectators]);
  room.inactive_players = Array.from(new Set(room.inactive_players.filter((id) => allExistingIds.has(id))));

  // 7. Resolve duplicate display names (e.g. from user registration/guest transition)
  const nameToIdMap = new Map<string, string>();
  for (const [pId, detail] of Object.entries(room.player_details)) {
    if (!detail?.name) continue;
    const norm = detail.name.trim().toLowerCase();
    if (norm === "scholar" || norm === "learner") continue;

    if (nameToIdMap.has(norm)) {
      const existingId = nameToIdMap.get(norm)!;
      const existingInTeam = seenTeamPlayers.has(existingId);
      const currentInTeam = seenTeamPlayers.has(pId);

      let keepId = existingId;
      let dropId = pId;

      if (!existingInTeam && currentInTeam) {
        keepId = pId;
        dropId = existingId;
        nameToIdMap.set(norm, pId);
      } else if (existingInTeam && currentInTeam) {
        // Both in a team: if one is guest and one is registered, keep registered
        if (existingId.startsWith("guest-") && !pId.startsWith("guest-")) {
          keepId = pId;
          dropId = existingId;
          nameToIdMap.set(norm, pId);
        }
      }

      // Drop the ghost ID across all teams
      for (const t of allActiveTeamList) {
        t.playerIds = t.playerIds.filter((id) => id !== dropId);
      }
      room.active_players = room.active_players.filter((id) => id !== dropId);
      room.spectators = room.spectators.filter((id) => id !== dropId);
      room.inactive_players = room.inactive_players.filter((id) => id !== dropId);
      delete room.player_details[dropId];
    } else {
      nameToIdMap.set(norm, pId);
    }
  }

  return room;
}

