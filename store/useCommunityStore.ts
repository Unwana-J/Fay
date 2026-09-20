import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type ResearchRoom,
  type RoomSubmission,
  type RoomStatus,
  type RoomVisibility,
  type CommunityUser,
  type FollowedUser,
  DEFAULT_COMMUNITY_USER,
} from "@/lib/mockCommunity";
import { uid } from "@/lib/utils";

interface CommunityState {
  rooms: ResearchRoom[];
  mySubmissions: RoomSubmission[];
  activeRoomId: string | null;
  following: FollowedUser[];

  // Actions
  createRoom: (
    opts: {
      topicId: string;
      topicText: string;
      category: string;
      difficulty: string;
      visibility: RoomVisibility;
      researchDurationMin: number;
      speakingDurationSec: number;
    },
    user?: CommunityUser
  ) => string;
  importRoom: (room: ResearchRoom) => void;
  joinRoom: (roomId: string, user?: CommunityUser) => void;
  advanceRoomStatus: (roomId: string, status: RoomStatus) => void;
  submitRecording: (
    roomId: string,
    durationSec: number,
    user?: CommunityUser,
    audioBase64?: string
  ) => void;
  voteOnSubmission: (submissionId: string, stars: 1 | 2 | 3) => void;
  makeSubmissionPublic: (submissionId: string) => void;
  followUser: (user: FollowedUser) => void;
  unfollowUser: (userId: string) => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      rooms: [],
      mySubmissions: [],
      activeRoomId: null,
      following: [],

      createRoom: (opts, user) => {
        const id = `room-${uid()}`;
        const code = `FEY-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const hostUser = user || DEFAULT_COMMUNITY_USER;

        const newRoom: ResearchRoom = {
          id,
          topicId: opts.topicId,
          topicText: opts.topicText,
          category: opts.category,
          difficulty: opts.difficulty,
          visibility: opts.visibility,
          status: "lobby",
          host: hostUser,
          participants: [{ user: hostUser, status: "waiting", isHost: true }],
          inviteCode: code,
          researchDurationMin: opts.researchDurationMin,
          speakingDurationSec: opts.speakingDurationSec,
          createdAt: new Date().toISOString(),
          submissions: [],
        };
        set((s) => ({ rooms: [newRoom, ...s.rooms.filter((r) => r.id !== id)], activeRoomId: id }));
        return id;
      },

      importRoom: (room) => {
        set((s) => {
          const exists = s.rooms.find((r) => r.id === room.id || r.inviteCode === room.inviteCode);
          if (exists) {
            return {
              rooms: s.rooms.map((r) =>
                r.id === room.id || r.inviteCode === room.inviteCode
                  ? { ...r, ...room, participants: r.participants }
                  : r
              ),
            };
          }
          return { rooms: [room, ...s.rooms] };
        });
      },

      joinRoom: (roomId, user) => {
        const joinUser = user || DEFAULT_COMMUNITY_USER;
        set((s) => ({
          activeRoomId: roomId,
          rooms: s.rooms.map((r) => {
            if (r.id !== roomId && r.inviteCode !== roomId) return r;
            const alreadyIn = r.participants.some((p) => p.user.id === joinUser.id);
            if (alreadyIn) return r;
            return {
              ...r,
              participants: [
                ...r.participants,
                { user: joinUser, status: "waiting", isHost: false },
              ],
            };
          }),
        }));
      },

      advanceRoomStatus: (roomId, status) => {
        set((s) => ({
          rooms: s.rooms.map((r) =>
            r.id === roomId || r.inviteCode === roomId
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

      submitRecording: (roomId, durationSec, user, audioBase64) => {
        const room = get().rooms.find((r) => r.id === roomId || r.inviteCode === roomId);
        if (!room) return;
        const subUser = user || DEFAULT_COMMUNITY_USER;
        const sub: RoomSubmission = {
          id: `sub-${uid()}`,
          roomId: room.id,
          user: subUser,
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
            r.id === room.id
              ? {
                  ...r,
                  submissions: [...r.submissions.filter((x) => x.id !== sub.id), sub],
                  participants: r.participants.map((p) =>
                    p.user.id === subUser.id ? { ...p, status: "submitted" } : p
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
          rooms: s.rooms.map((r) => ({
            ...r,
            submissions: r.submissions.map((sub) =>
              sub.id === submissionId ? { ...sub, isPublic: true } : sub
            ),
          })),
        }));
      },

      followUser: (user) => {
        set((s) => {
          if (s.following.some((u) => u.id === user.id)) return s;
          return { following: [user, ...s.following] };
        });
      },

      unfollowUser: (userId) => {
        set((s) => ({
          following: s.following.filter((u) => u.id !== userId),
        }));
      },
    }),
    {
      name: "fey-community-store",
      version: 2,
      migrate: (persistedState: any, fromVersion: number) => {
        let state = { ...persistedState };
        // Purge dummy mock rooms from v1
        if (fromVersion === undefined || fromVersion < 2) {
          state.rooms = [];
          state.following = [];
        }
        return state;
      },
    }
  )
);
