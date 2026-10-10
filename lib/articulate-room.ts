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
  match_started_at?: string; // ISO timestamp when first round started
  match_ended_at?: string; // ISO timestamp when match concluded
  version?: number; // Monotonic revision counter, bumped on every persisted write (stale-snapshot rejection)
  created_at?: string;
  updated_at?: string;
}

/**
 * Calculates total match play time in seconds and human-formatted string (e.g. "18m 42s").
 */
export function calculateMatchPlayTime(room: ArticulateRoom): { seconds: number; formatted: string } {
  // 1. Explicit match timestamps
  if (room.match_started_at) {
    const startMs = new Date(room.match_started_at).getTime();
    const endMs = room.match_ended_at
      ? new Date(room.match_ended_at).getTime()
      : room.updated_at
      ? new Date(room.updated_at).getTime()
      : Date.now();
    const diffSec = Math.max(1, Math.round((endMs - startMs) / 1000));
    return { seconds: diffSec, formatted: formatMatchDuration(diffSec) };
  }

  // 2. Room created_at and updated_at fallback (e.g. existing completed rooms)
  if (room.created_at && room.updated_at) {
    const startMs = new Date(room.created_at).getTime();
    const endMs = new Date(room.updated_at).getTime();
    const diffSec = Math.round((endMs - startMs) / 1000);

    // If within realistic play window (10s to 6 hours)
    if (diffSec > 10 && diffSec < 6 * 3600) {
      return { seconds: diffSec, formatted: formatMatchDuration(diffSec) };
    }
  }

  // 3. Fallback based on rounds played
  const rounds = room.current_turn?.roundNumber || 1;
  const turnSeconds = room.settings?.timerSeconds || 45;
  const estimatedSeconds = Math.max(rounds * (turnSeconds + 15), turnSeconds);
  return { seconds: estimatedSeconds, formatted: formatMatchDuration(estimatedSeconds) };
}

export function formatMatchDuration(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return `${Math.max(1, totalSeconds)}s`;
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return seconds > 0 ? `${hours}h ${minutes}m ${seconds}s` : `${hours}h ${minutes}m`;
  }
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
  lastSpeakerIndex?: number
): { speakerId: string; speakerIndex: number } {
  if (!playerIds || playerIds.length === 0) return { speakerId: "", speakerIndex: -1 };

  let lastIdx = -1;
  if (lastSpeakerId && playerIds.includes(lastSpeakerId)) {
    lastIdx = playerIds.indexOf(lastSpeakerId);
  } else if (typeof lastSpeakerIndex === "number" && lastSpeakerIndex >= 0 && lastSpeakerIndex < playerIds.length) {
    lastIdx = lastSpeakerIndex;
  }

  const n = playerIds.length;
  for (let step = 1; step <= n; step++) {
    const candidateIdx = (lastIdx + step) % n;
    const candidateId = playerIds[candidateIdx];
    if (!inactivePlayerIds.includes(candidateId)) {
      return { speakerId: candidateId, speakerIndex: candidateIdx };
    }
  }

  const fallbackIdx = (lastIdx + 1) % n;
  return { speakerId: playerIds[fallbackIdx] || playerIds[0], speakerIndex: fallbackIdx };
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

