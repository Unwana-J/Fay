import { GameCategory, GameDifficulty, GameWord, buildDeck } from "./game-words";

export type RoomStatus = "lobby" | "playing" | "round_end" | "game_over";

export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  team: "A" | "B" | null;
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
}

export interface RoomTeam {
  name: string;
  color: string;
  score: number;
  playerIds: string[];
}

export interface CurrentTurn {
  roundNumber: number;
  activeTeam: "A" | "B";
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
  last_speaker_indices?: { teamA: number; teamB: number }; // Track strict round-robin index per team
  last_speaker_ids?: { teamA?: string; teamB?: string }; // Track strict last speaker ID per team
  created_at?: string;
  updated_at?: string;
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
  options: { roomName?: string; teamAName?: string; teamBName?: string } = {}
): ArticulateRoom {
  const mergedSettings: RoomSettings = {
    timerSeconds: settings.timerSeconds || 45,
    scoreGoal: settings.scoreGoal || 20,
    categories: settings.categories || ["Object", "Nature", "Person", "Action", "World", "Random"],
    difficulty: settings.difficulty || "mixed",
    buzzerSound: settings.buzzerSound || "classic",
  };

  const deck = buildDeck(
    mergedSettings.categories,
    mergedSettings.difficulty,
    Math.max(120, mergedSettings.scoreGoal * 3)
  );

  return {
    room_code: code.toUpperCase().trim(),
    room_name: options.roomName?.trim() || undefined,
    host_id: host.id,
    host_name: host.name,
    status: "lobby",
    locked: false,
    settings: mergedSettings,
    teams: {
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
    },
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
    last_speaker_indices: {
      teamA: -1,
      teamB: -1,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Robustly sanitizes player rosters and identity maps across a room:
 * 1. Purges kicked player IDs from all rosters.
 * 2. Deduplicates player arrays in both teams.
 * 3. Ensures no ID exists in both Team Alpha and Team Omega.
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
  if (!room.active_players) room.active_players = [];
  if (!room.spectators) room.spectators = [];
  if (!room.inactive_players) room.inactive_players = [];
  if (!room.player_details) room.player_details = {};
  if (!room.kicked_players) room.kicked_players = [];

  // 1. Remove kicked players from all lists
  if (room.kicked_players.length > 0) {
    const kickedSet = new Set(room.kicked_players);
    room.teams.teamA.playerIds = room.teams.teamA.playerIds.filter((id) => !kickedSet.has(id));
    room.teams.teamB.playerIds = room.teams.teamB.playerIds.filter((id) => !kickedSet.has(id));
    room.active_players = room.active_players.filter((id) => !kickedSet.has(id));
    room.spectators = room.spectators.filter((id) => !kickedSet.has(id));
    room.inactive_players = room.inactive_players.filter((id) => !kickedSet.has(id));
    for (const kId of kickedSet) {
      delete room.player_details[kId];
    }
  }

  // 2. Deduplicate within teams
  room.teams.teamA.playerIds = Array.from(new Set(room.teams.teamA.playerIds.filter(Boolean)));
  room.teams.teamB.playerIds = Array.from(new Set(room.teams.teamB.playerIds.filter(Boolean)));

  // 3. Prevent any player ID from existing in BOTH teamA and teamB
  const setA = new Set(room.teams.teamA.playerIds);
  room.teams.teamB.playerIds = room.teams.teamB.playerIds.filter((id) => !setA.has(id));

  // 4. Prevent any team player from existing in spectators
  const teamPlayerSet = new Set([...room.teams.teamA.playerIds, ...room.teams.teamB.playerIds]);
  room.spectators = Array.from(new Set(room.spectators.filter((id) => Boolean(id) && !teamPlayerSet.has(id))));

  // 5. Deduplicate and align active_players with actual team rosters
  room.active_players = Array.from(new Set([...room.teams.teamA.playerIds, ...room.teams.teamB.playerIds]));

  // 6. Clean inactive_players so only existing players remain
  const allExistingIds = new Set([...teamPlayerSet, ...room.spectators]);
  room.inactive_players = Array.from(new Set(room.inactive_players.filter((id) => allExistingIds.has(id))));

  // 7. Resolve duplicate display names (e.g. from user registration/guest transition)
  const nameToIdMap = new Map<string, string>();
  for (const [pId, detail] of Object.entries(room.player_details)) {
    if (!detail?.name) continue;
    const norm = detail.name.trim().toLowerCase();
    if (norm === "scholar" || norm === "learner") continue;

    if (nameToIdMap.has(norm)) {
      const existingId = nameToIdMap.get(norm)!;
      const existingInTeam = teamPlayerSet.has(existingId);
      const currentInTeam = teamPlayerSet.has(pId);

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

      // Drop the ghost ID
      room.teams.teamA.playerIds = room.teams.teamA.playerIds.filter((id) => id !== dropId);
      room.teams.teamB.playerIds = room.teams.teamB.playerIds.filter((id) => id !== dropId);
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

