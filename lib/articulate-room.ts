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

export interface RoomSettings {
  timerSeconds: number;
  scoreGoal: number;
  categories: GameCategory[];
  difficulty: GameDifficulty;
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
}

export type DisputeStatus = "none" | "disputed" | "conceded" | "rejected";

export interface ScoredWordEntry extends GameWord {
  disputeStatus?: DisputeStatus;
  disputedBy?: string; // Opponent who flagged it
  concededBy?: string; // Describing team member who confirmed it
}

export interface ArticulateRoom {
  id?: string;
  room_code: string;
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
  round_words_passed: GameWord[];
  active_players: string[]; // Player IDs locked in for active round
  spectators: string[]; // Player IDs waiting in spectator lounge
  inactive_players?: string[]; // Player IDs toggled AFK / Inactive
  player_details?: Record<string, { id: string; name: string; avatar: string; isHost?: boolean }>; // Persisted identity map
  created_at?: string;
  updated_at?: string;
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
  settings: Partial<RoomSettings> = {}
): ArticulateRoom {
  const mergedSettings: RoomSettings = {
    timerSeconds: settings.timerSeconds || 30,
    scoreGoal: settings.scoreGoal || 20,
    categories: settings.categories || ["Object", "Nature", "Person", "Action", "World", "Random"],
    difficulty: settings.difficulty || "mixed",
  };

  const deck = buildDeck(
    mergedSettings.categories,
    mergedSettings.difficulty,
    Math.max(120, mergedSettings.scoreGoal * 3)
  );

  return {
    room_code: code.toUpperCase().trim(),
    host_id: host.id,
    host_name: host.name,
    status: "lobby",
    locked: false,
    settings: mergedSettings,
    teams: {
      teamA: {
        name: "Team Alpha",
        color: "#EF4444",
        score: 0,
        playerIds: [host.id],
      },
      teamB: {
        name: "Team Omega",
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
    player_details: {
      [host.id]: {
        id: host.id,
        name: host.name,
        avatar: "/avatars/avatar-scholar.svg",
        isHost: true,
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
