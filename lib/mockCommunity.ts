import { uid } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RoomStatus = "lobby" | "research" | "speaking" | "voting" | "closed";
export type RoomVisibility = "public" | "private";
export type ParticipantStatus = "waiting" | "researching" | "speaking" | "submitted";

export interface MockUser {
  id: string;
  username: string;
  avatar: string; // emoji
  xp: number;
  level: number;
}

export interface RoomParticipant {
  user: MockUser;
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
  user: MockUser;
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
  host: MockUser;
  participants: RoomParticipant[];
  inviteCode: string;
  researchDurationMin: number;
  speakingDurationSec: number;
  createdAt: string;
  startedAt?: string;
  closedAt?: string;
  submissions: RoomSubmission[];
}

// ─── Mock Users ───────────────────────────────────────────────────────────────

export const MOCK_USERS: MockUser[] = [
  { id: "u1", username: "You", avatar: "🧠", xp: 1240, level: 3 },
  { id: "u2", username: "Amara K.", avatar: "🌿", xp: 3100, level: 6 },
  { id: "u3", username: "Rafael M.", avatar: "⚡", xp: 5800, level: 9 },
  { id: "u4", username: "Priya S.", avatar: "🎯", xp: 2200, level: 5 },
  { id: "u5", username: "Jonah T.", avatar: "🦋", xp: 890, level: 2 },
  { id: "u6", username: "Yuki N.", avatar: "🔭", xp: 4400, level: 8 },
  { id: "u7", username: "Soren B.", avatar: "📐", xp: 1670, level: 4 },
  { id: "u8", username: "Lucia V.", avatar: "🌊", xp: 6200, level: 10 },
];

export const SELF_USER = MOCK_USERS[0];

// ─── Leaderboard Score ────────────────────────────────────────────────────────

function calcScore(votes: VoteData): number {
  return Math.round(votes.upvotes * 10 + votes.avgStars * 50);
}

// ─── Mock Submissions (public feed) ──────────────────────────────────────────

export const MOCK_SUBMISSIONS: RoomSubmission[] = [
  {
    id: "sub1",
    roomId: "room1",
    user: MOCK_USERS[2],
    topicId: "t_llm",
    topicText: "Explain how transformers revolutionized natural language processing.",
    category: "Artificial Intelligence",
    durationSec: 148,
    submittedAt: "2026-07-29T07:12:00Z",
    votes: { upvotes: 84, starRatings: [3, 3, 2, 3, 3, 3], avgStars: 2.83 },
    isPublic: true,
    leaderboardScore: calcScore({ upvotes: 84, starRatings: [], avgStars: 2.83 }),
  },
  {
    id: "sub2",
    roomId: "room1",
    user: MOCK_USERS[7],
    topicId: "t_llm",
    topicText: "Explain how transformers revolutionized natural language processing.",
    category: "Artificial Intelligence",
    durationSec: 120,
    submittedAt: "2026-07-29T07:18:00Z",
    votes: { upvotes: 61, starRatings: [3, 2, 3, 2], avgStars: 2.5 },
    isPublic: true,
    leaderboardScore: calcScore({ upvotes: 61, starRatings: [], avgStars: 2.5 }),
  },
  {
    id: "sub3",
    roomId: "room2",
    user: MOCK_USERS[1],
    topicId: "t_passive",
    topicText: "Is passive index investing better than active fund management? Defend a position.",
    category: "Finance",
    durationSec: 165,
    submittedAt: "2026-07-28T16:44:00Z",
    votes: { upvotes: 102, starRatings: [3, 3, 3, 3, 3, 2, 3], avgStars: 2.86 },
    isPublic: true,
    leaderboardScore: calcScore({ upvotes: 102, starRatings: [], avgStars: 2.86 }),
  },
  {
    id: "sub4",
    roomId: "room2",
    user: MOCK_USERS[5],
    topicId: "t_passive",
    topicText: "Is passive index investing better than active fund management? Defend a position.",
    category: "Finance",
    durationSec: 112,
    submittedAt: "2026-07-28T17:00:00Z",
    votes: { upvotes: 77, starRatings: [3, 3, 2, 3], avgStars: 2.75 },
    isPublic: true,
    leaderboardScore: calcScore({ upvotes: 77, starRatings: [], avgStars: 2.75 }),
  },
  {
    id: "sub5",
    roomId: "room3",
    user: MOCK_USERS[3],
    topicId: "t_stoic",
    topicText: "What can stoicism teach a modern entrepreneur?",
    category: "Philosophy",
    durationSec: 178,
    submittedAt: "2026-07-27T10:00:00Z",
    votes: { upvotes: 53, starRatings: [2, 3, 3, 2, 3], avgStars: 2.6 },
    isPublic: true,
    leaderboardScore: calcScore({ upvotes: 53, starRatings: [], avgStars: 2.6 }),
  },
  {
    id: "sub6",
    roomId: "room3",
    user: MOCK_USERS[6],
    topicId: "t_stoic",
    topicText: "What can stoicism teach a modern entrepreneur?",
    category: "Philosophy",
    durationSec: 90,
    submittedAt: "2026-07-27T10:22:00Z",
    votes: { upvotes: 29, starRatings: [2, 2, 3], avgStars: 2.33 },
    isPublic: true,
    leaderboardScore: calcScore({ upvotes: 29, starRatings: [], avgStars: 2.33 }),
  },
];

// ─── Mock Rooms ───────────────────────────────────────────────────────────────

export const MOCK_ROOMS: ResearchRoom[] = [
  // Active public room — voting phase
  {
    id: "room1",
    topicId: "t_llm",
    topicText: "Explain how transformers revolutionized natural language processing.",
    category: "Artificial Intelligence",
    difficulty: "intermediate",
    visibility: "public",
    status: "voting",
    host: MOCK_USERS[2],
    participants: [
      { user: MOCK_USERS[2], status: "submitted", isHost: true },
      { user: MOCK_USERS[7], status: "submitted", isHost: false },
      { user: MOCK_USERS[3], status: "submitted", isHost: false },
      { user: MOCK_USERS[4], status: "speaking", isHost: false },
    ],
    inviteCode: "FEY-A1B2",
    researchDurationMin: 15,
    speakingDurationSec: 120,
    createdAt: "2026-07-29T06:45:00Z",
    startedAt: "2026-07-29T07:00:00Z",
    submissions: MOCK_SUBMISSIONS.filter((s) => s.roomId === "room1"),
  },
  // Active public room — research phase (joinable)
  {
    id: "room2",
    topicId: "t_passive",
    topicText: "Is passive index investing better than active fund management?",
    category: "Finance",
    difficulty: "expert",
    visibility: "public",
    status: "research",
    host: MOCK_USERS[1],
    participants: [
      { user: MOCK_USERS[1], status: "researching", isHost: true },
      { user: MOCK_USERS[5], status: "researching", isHost: false },
      { user: MOCK_USERS[6], status: "waiting", isHost: false },
    ],
    inviteCode: "FEY-C3D4",
    researchDurationMin: 20,
    speakingDurationSec: 150,
    createdAt: "2026-07-29T10:00:00Z",
    startedAt: "2026-07-29T10:05:00Z",
    submissions: [],
  },
  // Closed public room
  {
    id: "room3",
    topicId: "t_stoic",
    topicText: "What can stoicism teach a modern entrepreneur?",
    category: "Philosophy",
    difficulty: "intermediate",
    visibility: "public",
    status: "closed",
    host: MOCK_USERS[3],
    participants: [
      { user: MOCK_USERS[3], status: "submitted", isHost: true },
      { user: MOCK_USERS[6], status: "submitted", isHost: false },
    ],
    inviteCode: "FEY-E5F6",
    researchDurationMin: 15,
    speakingDurationSec: 120,
    createdAt: "2026-07-27T09:30:00Z",
    startedAt: "2026-07-27T09:35:00Z",
    closedAt: "2026-07-27T10:30:00Z",
    submissions: MOCK_SUBMISSIONS.filter((s) => s.roomId === "room3"),
  },
];

// ─── Topic Leaderboards (grouped by topicId) ──────────────────────────────────

export const LEADERBOARD_TOPICS = [
  {
    topicId: "t_llm",
    topicText: "Explain how transformers revolutionized natural language processing.",
    category: "Artificial Intelligence",
    totalSubmissions: 14,
  },
  {
    topicId: "t_passive",
    topicText: "Is passive index investing better than active fund management?",
    category: "Finance",
    totalSubmissions: 9,
  },
  {
    topicId: "t_stoic",
    topicText: "What can stoicism teach a modern entrepreneur?",
    category: "Philosophy",
    totalSubmissions: 7,
  },
];

export function getLeaderboard(topicId: string): RoomSubmission[] {
  return MOCK_SUBMISSIONS.filter((s) => s.topicId === topicId).sort(
    (a, b) => b.leaderboardScore - a.leaderboardScore
  );
}
