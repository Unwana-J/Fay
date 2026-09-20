import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MOCK_ROOMS, MOCK_SUBMISSIONS, SELF_USER,
  type ResearchRoom, type RoomSubmission, type RoomStatus, type RoomVisibility,
} from "@/lib/mockCommunity";
import { uid } from "@/lib/utils";

interface CommunityState {
  rooms: ResearchRoom[];
  mySubmissions: RoomSubmission[];
  activeRoomId: string | null;

  // Actions
  createRoom: (opts: {
    topicId: string; topicText: string; category: string; difficulty: string;
    visibility: RoomVisibility; researchDurationMin: number; speakingDurationSec: number;
  }) => string;
  joinRoom: (roomId: string) => void;
  advanceRoomStatus: (roomId: string, status: RoomStatus) => void;
  submitRecording: (roomId: string, durationSec: number, audioBase64?: string) => void;
  voteOnSubmission: (submissionId: string, stars: 1 | 2 | 3) => void;
  makeSubmissionPublic: (submissionId: string) => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      rooms: MOCK_ROOMS,
      mySubmissions: [],
      activeRoomId: null,

      createRoom: (opts) => {
        const id = `room-${uid()}`;
        const code = `FEY-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const newRoom: ResearchRoom = {
          id,
          topicId: opts.topicId,
          topicText: opts.topicText,
          category: opts.category,
          difficulty: opts.difficulty,
          visibility: opts.visibility,
          status: "lobby",
          host: SELF_USER,
          participants: [{ user: SELF_USER, status: "waiting", isHost: true }],
          inviteCode: code,
          researchDurationMin: opts.researchDurationMin,
          speakingDurationSec: opts.speakingDurationSec,
          createdAt: new Date().toISOString(),
          submissions: [],
        };
        set((s) => ({ rooms: [newRoom, ...s.rooms], activeRoomId: id }));
        return id;
      },

      joinRoom: (roomId) => {
        set((s) => ({
          activeRoomId: roomId,
          rooms: s.rooms.map((r) =>
            r.id === roomId && !r.participants.find((p) => p.user.id === SELF_USER.id)
              ? {
                  ...r,
                  participants: [...r.participants, { user: SELF_USER, status: "waiting", isHost: false }],
                }
              : r
          ),
        }));
      },

      advanceRoomStatus: (roomId, status) => {
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  status,
                  ...(status === "research" ? { startedAt: new Date().toISOString() } : {}),
                  ...(status === "closed" ? { closedAt: new Date().toISOString() } : {}),
                }
              : r
          ),
        }));
      },

      submitRecording: (roomId, durationSec, audioBase64) => {
        const room = get().rooms.find((r) => r.id === roomId);
        if (!room) return;
        const sub: RoomSubmission = {
          id: `sub-${uid()}`,
          roomId,
          user: SELF_USER,
          topicId: room.topicId,
          topicText: room.topicText,
          category: room.category,
          durationSec,
          submittedAt: new Date().toISOString(),
          votes: { upvotes: 0, starRatings: [], avgStars: 0 },
          isPublic: room.visibility === "public",
          audioBase64,
          leaderboardScore: 0,
        };
        set((s) => ({
          mySubmissions: [sub, ...s.mySubmissions],
          rooms: s.rooms.map((r) =>
            r.id === roomId
              ? {
                  ...r,
                  submissions: [...r.submissions, sub],
                  participants: r.participants.map((p) =>
                    p.user.id === SELF_USER.id ? { ...p, status: "submitted" } : p
                  ),
                }
              : r
          ),
        }));
      },

      voteOnSubmission: (submissionId, stars) => {
        const update = (sub: RoomSubmission): RoomSubmission => {
          if (sub.id !== submissionId || sub.userVoted) return sub;
          const newRatings = [...sub.votes.starRatings, stars];
          const avgStars = newRatings.reduce((a, b) => a + b, 0) / newRatings.length;
          const upvotes = sub.votes.upvotes + 1;
          const leaderboardScore = Math.round(upvotes * 10 + avgStars * 50);
          return {
            ...sub,
            userVoted: stars,
            votes: { upvotes, starRatings: newRatings, avgStars },
            leaderboardScore,
          };
        };
        set((s) => ({
          rooms: s.rooms.map((r) => ({ ...r, submissions: r.submissions.map(update) })),
          mySubmissions: s.mySubmissions.map(update),
        }));
      },

      makeSubmissionPublic: (submissionId) => {
        set((s) => ({
          mySubmissions: s.mySubmissions.map((sub) =>
            sub.id === submissionId ? { ...sub, isPublic: true } : sub
          ),
        }));
      },
    }),
    { name: "fey-community-store", version: 1 }
  )
);
