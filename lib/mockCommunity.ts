import { uid } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RoomStatus = "lobby" | "research" | "speaking" | "voting" | "closed";
export type RoomVisibility = "public" | "private";
export type ParticipantStatus = "waiting" | "researching" | "speaking" | "submitted";

export interface CommunityUser {
  id: string;
  username: string;
  avatar: string; // vector path or image URL
  bio?: string;
  xp: number;
  level: number;
}

// Keep alias for backwards compatibility
export type MockUser = CommunityUser;

export interface FollowedUser {
  id: string;
  username: string;
  avatar: string;
  bio?: string;
  level?: number;
  xp?: number;
  followedAt: string;
}

export interface RoomParticipant {
  user: CommunityUser;
  status: ParticipantStatus;
  isHost: boolean;
}

export interface VoteData {
  upvotes: number;
  starRatings: number[]; // each element is 1, 2, or 3
  avgStars: number;
}

export interface RoomSubmission {
  id: string;
  roomId: string;
  user: CommunityUser;
  topicId: string;
  topicText: string;
  category: string;
  durationSec: number;
  submittedAt: string; // ISO
  votes: VoteData;
  isPublic: boolean;
  audioBase64?: string;
  leaderboardScore: number;
  userVoted?: 1 | 2 | 3 | null;
}

export interface ResearchRoom {
  id: string;
  topicId: string;
  topicText: string;
  category: string;
  difficulty: string;
  visibility: RoomVisibility;
  status: RoomStatus;
  host: CommunityUser;
  participants: RoomParticipant[];
  inviteCode: string;
  researchDurationMin: number;
  speakingDurationSec: number;
  createdAt: string;
  startedAt?: string;
  closedAt?: string;
  submissions: RoomSubmission[];
}

// ─── Default Users & Clean Defaults (Zero Dummy Data) ─────────────────────────

export const DEFAULT_COMMUNITY_USER: CommunityUser = {
  id: "guest",
  username: "Learner",
  avatar: "/avatars/avatar-scholar.svg",
  bio: "Exploring ideas on Fey.",
  xp: 0,
  level: 1,
};

export const SELF_USER = DEFAULT_COMMUNITY_USER;
export const MOCK_USERS: CommunityUser[] = [];
export const MOCK_SUBMISSIONS: RoomSubmission[] = [];
export const MOCK_ROOMS: ResearchRoom[] = [];
export const LEADERBOARD_TOPICS: Array<{
  topicId: string;
  topicText: string;
  category: string;
  totalSubmissions: number;
}> = [];

export function getLeaderboard(topicId: string, allSubmissions: RoomSubmission[] = []): RoomSubmission[] {
  return allSubmissions
    .filter((s) => s.topicId === topicId && s.isPublic)
    .sort((a, b) => b.leaderboardScore - a.leaderboardScore);
}

// ─── Room URL Encoding & Decoding (Zero-Config Sharing) ────────────────────────

export function encodeRoomPayload(room: ResearchRoom): string {
  try {
    const payload = {
      id: room.id,
      topicId: room.topicId,
      topicText: room.topicText,
      category: room.category,
      difficulty: room.difficulty,
      visibility: room.visibility,
      status: room.status,
      host: room.host,
      inviteCode: room.inviteCode,
      researchDurationMin: room.researchDurationMin,
      speakingDurationSec: room.speakingDurationSec,
      createdAt: room.createdAt,
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch {
    return "";
  }
}

export function decodeRoomPayload(encoded: string): Partial<ResearchRoom> | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
