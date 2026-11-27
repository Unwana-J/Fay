import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Classroom,
  type ClassroomSubmission,
  type ClassroomTotalTopics,
  type AppreciationTag,
  normalizeClassroomCode,
} from "@/lib/classroom-types";
import type { Topic, Difficulty } from "@/lib/topics";
import { uid } from "@/lib/utils";

interface CreateClassroomInput {
  title: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  totalTopics: ClassroomTotalTopics;
  speakingDurationSec: number;
  researchDurationMin: number;
  categories: string[];
  difficulty: Difficulty;
  presetTopics?: Topic[];
  customTopicPool?: Topic[];
}

interface SubmitClassroomRecordingInput {
  classroomCode: string;
  slotNumber: number;
  userId: string;
  username: string;
  avatar: string;
  topicId: string;
  topicText: string;
  category: string;
  durationSeconds: number;
  audioData?: string;
  notes?: string;
}

interface ClassroomStoreState {
  classrooms: Classroom[];
  submissionsByCode: Record<string, ClassroomSubmission[]>;
  pushEnabledByCode: Record<string, string[]>;
  nudgedAtByKey: Record<string, number>;
  isLoading: boolean;
  lastSyncedAt: number | null;

  upsertLocalBundle: (classroom: Classroom, submissions: ClassroomSubmission[]) => void;
  fetchMyClassrooms: (userId: string, username?: string) => Promise<void>;
  fetchClassroom: (
    code: string
  ) => Promise<{
    classroom: Classroom;
    submissions: ClassroomSubmission[];
    pushEnabledUserIds?: string[];
  } | null>;
  createClassroom: (
    input: CreateClassroomInput
  ) => Promise<{ classroom?: Classroom; error?: string }>;
  joinClassroom: (
    code: string,
    member: {
      userId: string;
      username: string;
      avatar: string;
      favoriteCategories?: string[];
    }
  ) => Promise<{ classroom?: Classroom; submissions?: ClassroomSubmission[]; error?: string }>;
  swapSlotTopic: (opts: {
    code: string;
    slotNumber: number;
    topic: Topic;
    userId: string;
    username: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  unlockNextSlotEarly: (code: string, hostId: string) => Promise<{ ok: boolean; error?: string }>;
  setClassroomStatus: (
    code: string,
    hostId: string,
    status: "active" | "completed"
  ) => Promise<{ ok: boolean; error?: string }>;
  extendClassroom: (opts: {
    code: string;
    actorId: string;
    actorName: string;
    addCount: number;
    categories?: string[];
    difficulty?: Difficulty;
    presetTopics?: Topic[];
    customTopicPool?: Topic[];
  }) => Promise<{ ok: boolean; firstNewSlot?: number; error?: string }>;
  submitRecording: (
    input: SubmitClassroomRecordingInput
  ) => Promise<{ submission?: ClassroomSubmission; error?: string }>;
  markHeard: (
    code: string,
    submissionId: string,
    viewer: { userId: string; username: string; avatar: string }
  ) => Promise<void>;
  toggleAppreciation: (
    code: string,
    submissionId: string,
    tag: AppreciationTag,
    userId: string
  ) => Promise<void>;
  addMarginNote: (
    code: string,
    submissionId: string,
    author: { userId: string; username: string; avatar: string },
    text: string
  ) => Promise<void>;
  nudgeMember: (opts: {
    code: string;
    actorId: string;
    actorName: string;
    targetUserId: string;
    slotNumber?: number;
  }) => Promise<{
    ok: boolean;
    status?: "sent" | "quiet_hours" | "cooldown" | "not_enabled";
    message?: string;
  }>;
}

export const useClassroomStore = create<ClassroomStoreState>()(
  persist(
    (set, get) => ({
      classrooms: [],
      submissionsByCode: {},
      pushEnabledByCode: {},
      nudgedAtByKey: {},
      isLoading: false,
      lastSyncedAt: null,

      upsertLocalBundle: (classroom, submissions) => {
        const cleanCode = normalizeClassroomCode(classroom.code);
        set((s) => {
          const others = s.classrooms.filter(
            (c) => normalizeClassroomCode(c.code) !== cleanCode
          );
          const merged = [classroom, ...others].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return {
            classrooms: merged,
            submissionsByCode: {
              ...s.submissionsByCode,
              [cleanCode]: submissions,
            },
            lastSyncedAt: Date.now(),
          };
        });
      },

      fetchMyClassrooms: async (userId, username) => {
        if (!userId) return;
        set({ isLoading: true });
        try {
          const qs = new URLSearchParams({ userId });
          if (username) qs.set("username", username);
          const res = await fetch(`/api/classroom?${qs.toString()}`, { cache: "no-store" });
          if (!res.ok) {
            set({ isLoading: false });
            return;
          }
          const data = await res.json();
          if (Array.isArray(data?.items)) {
            set((s) => {
              const nextMap = new Map<string, Classroom>();
              const nextSubs = { ...s.submissionsByCode };
              // Preserve local cached ones first, overwrite with server truth
              for (const existing of s.classrooms) {
                nextMap.set(normalizeClassroomCode(existing.code), existing);
              }
              for (const item of data.items) {
                if (item?.classroom?.code) {
                  const clean = normalizeClassroomCode(item.classroom.code);
                  nextMap.set(clean, item.classroom);
                  nextSubs[clean] = Array.isArray(item.submissions) ? item.submissions : [];
                }
              }
              const sorted = Array.from(nextMap.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              return {
                classrooms: sorted,
                submissionsByCode: nextSubs,
                isLoading: false,
                lastSyncedAt: Date.now(),
              };
            });
            return;
          }
        } catch {}
        set({ isLoading: false });
      },

      fetchClassroom: async (code) => {
        const cleanCode = normalizeClassroomCode(code);
        if (!cleanCode) return null;
        try {
          const res = await fetch(`/api/classroom/${encodeURIComponent(cleanCode)}`, {
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.classroom) {
              get().upsertLocalBundle(data.classroom, data.submissions || []);
              const pushEnabledUserIds = Array.isArray(data.pushEnabledUserIds)
                ? data.pushEnabledUserIds
                : [];
              set((s) => ({
                pushEnabledByCode: {
                  ...s.pushEnabledByCode,
                  [cleanCode]: pushEnabledUserIds,
                },
              }));
              return {
                classroom: data.classroom,
                submissions: data.submissions || [],
                pushEnabledUserIds,
              };
            }
          }
        } catch {}

        // Offline / local fallback
        const local = get().classrooms.find(
          (c) => normalizeClassroomCode(c.code) === cleanCode
        );
        if (local) {
          return {
            classroom: local,
            submissions: get().submissionsByCode[cleanCode] || [],
          };
        }
        return null;
      },

      createClassroom: async (input) => {
        try {
          const res = await fetch("/api/classroom", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });
          const data = await res.json();
          if (!res.ok || !data?.classroom) {
            return { error: data?.error || "Could not create Classroom." };
          }
          get().upsertLocalBundle(data.classroom, data.submissions || []);
          return { classroom: data.classroom };
        } catch {
          return { error: "Network error creating Classroom. Please try again." };
        }
      },

      joinClassroom: async (code, member) => {
        const cleanCode = normalizeClassroomCode(code);
        if (!cleanCode) return { error: "Enter a valid Classroom code." };
        try {
          const res = await fetch(`/api/classroom/${encodeURIComponent(cleanCode)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "join", member }),
          });
          const data = await res.json();
          if (!res.ok || !data?.classroom) {
            return { error: data?.error || "Classroom not found. Check the code and try again." };
          }
          get().upsertLocalBundle(data.classroom, data.submissions || []);
          return { classroom: data.classroom, submissions: data.submissions || [] };
        } catch {
          return { error: "Could not join Classroom right now." };
        }
      },

      swapSlotTopic: async ({ code, slotNumber, topic, userId, username }) => {
        const cleanCode = normalizeClassroomCode(code);
        try {
          const res = await fetch(`/api/classroom/${encodeURIComponent(cleanCode)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "swap_slot",
              slotNumber,
              topic,
              swappedBy: { userId, username },
            }),
          });
          const data = await res.json();
          if (!res.ok || data?.error) {
            return { ok: false, error: data?.error || "Could not swap topic." };
          }
          if (data?.classroom) {
            get().upsertLocalBundle(data.classroom, data.submissions || []);
          }
          return { ok: true };
        } catch {
          return { ok: false, error: "Network error swapping topic." };
        }
      },

      unlockNextSlotEarly: async (code, hostId) => {
        const cleanCode = normalizeClassroomCode(code);
        try {
          const res = await fetch(`/api/classroom/${encodeURIComponent(cleanCode)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "unlock_next", hostId }),
          });
          const data = await res.json();
          if (!res.ok || data?.error) {
            return { ok: false, error: data?.error || "Could not unlock next topic." };
          }
          if (data?.classroom) {
            get().upsertLocalBundle(data.classroom, data.submissions || []);
          }
          return { ok: true };
        } catch {
          return { ok: false, error: "Network error unlocking topic." };
        }
      },

      setClassroomStatus: async (code, hostId, status) => {
        const cleanCode = normalizeClassroomCode(code);
        try {
          const res = await fetch(`/api/classroom/${encodeURIComponent(cleanCode)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "set_status", hostId, status }),
          });
          const data = await res.json();
          if (!res.ok || data?.error) {
            return { ok: false, error: data?.error || "Could not update Classroom status." };
          }
          if (data?.classroom) {
            get().upsertLocalBundle(data.classroom, data.submissions || []);
          }
          return { ok: true };
        } catch {
          return { ok: false, error: "Network error updating Classroom status." };
        }
      },

      extendClassroom: async (opts) => {
        const cleanCode = normalizeClassroomCode(opts.code);
        try {
          const res = await fetch(`/api/classroom/${encodeURIComponent(cleanCode)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "extend_topics",
              actorId: opts.actorId,
              actorName: opts.actorName,
              addCount: opts.addCount,
              categories: opts.categories,
              difficulty: opts.difficulty,
              presetTopics: opts.presetTopics,
              customTopicPool: opts.customTopicPool,
            }),
          });
          const data = await res.json();
          if (!res.ok || data?.error) {
            return { ok: false, error: data?.error || "Could not add topics." };
          }
          if (data?.classroom) {
            get().upsertLocalBundle(data.classroom, data.submissions || []);
          }
          return { ok: true, firstNewSlot: data?.firstNewSlot };
        } catch {
          return { ok: false, error: "Network error adding topics." };
        }
      },

      submitRecording: async (input) => {
        const cleanCode = normalizeClassroomCode(input.classroomCode);
        try {
          const res = await fetch("/api/classroom/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...input, classroomCode: cleanCode }),
          });
          const data = await res.json();
          if (!res.ok || data?.error) {
            return { error: data?.error || "Failed to submit Classroom recording." };
          }
          if (data?.classroom) {
            get().upsertLocalBundle(data.classroom, data.submissions || []);
          }
          return { submission: data.submission };
        } catch {
          return { error: "Network error uploading recording." };
        }
      },

      markHeard: async (code, submissionId, viewer) => {
        const cleanCode = normalizeClassroomCode(code);
        if (!viewer.userId) return;

        // Optimistic update
        set((s) => {
          const list = s.submissionsByCode[cleanCode] || [];
          const next = list.map((sub) => {
            if (sub.id !== submissionId || sub.userId === viewer.userId) return sub;
            if ((sub.heardBy || []).some((h) => h.userId === viewer.userId)) return sub;
            return {
              ...sub,
              heardBy: [
                ...(sub.heardBy || []),
                { ...viewer, heardAt: new Date().toISOString() },
              ],
            };
          });
          return { submissionsByCode: { ...s.submissionsByCode, [cleanCode]: next } };
        });

        try {
          const res = await fetch(`/api/classroom/${encodeURIComponent(cleanCode)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "mark_heard",
              submissionId,
              viewer: { ...viewer, heardAt: new Date().toISOString() },
            }),
          });
          const data = await res.json();
          if (res.ok && data?.classroom) {
            get().upsertLocalBundle(data.classroom, data.submissions || []);
          }
        } catch {}
      },

      toggleAppreciation: async (code, submissionId, tag, userId) => {
        const cleanCode = normalizeClassroomCode(code);
        if (!userId) return;

        // Optimistic toggle
        set((s) => {
          const list = s.submissionsByCode[cleanCode] || [];
          const next = list.map((sub) => {
            if (sub.id !== submissionId) return sub;
            const cur = sub.appreciations?.[tag] || [];
            const updatedTag = cur.includes(userId)
              ? cur.filter((id) => id !== userId)
              : [...cur, userId];
            return {
              ...sub,
              appreciations: { ...(sub.appreciations || {}), [tag]: updatedTag },
            };
          });
          return { submissionsByCode: { ...s.submissionsByCode, [cleanCode]: next } };
        });

        try {
          const res = await fetch(`/api/classroom/${encodeURIComponent(cleanCode)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "toggle_appreciation",
              submissionId,
              tag,
              userId,
            }),
          });
          const data = await res.json();
          if (res.ok && data?.classroom) {
            get().upsertLocalBundle(data.classroom, data.submissions || []);
          }
        } catch {}
      },

      addMarginNote: async (code, submissionId, author, text) => {
        const cleanCode = normalizeClassroomCode(code);
        const trimmed = text.trim().slice(0, 160);
        if (!trimmed || !author.userId) return;

        const note = {
          id: `note-${uid()}`,
          userId: author.userId,
          username: author.username,
          avatar: author.avatar,
          text: trimmed,
          createdAt: new Date().toISOString(),
        };

        // Optimistic append
        set((s) => {
          const list = s.submissionsByCode[cleanCode] || [];
          const next = list.map((sub) =>
            sub.id === submissionId
              ? { ...sub, marginNotes: [...(sub.marginNotes || []), note] }
              : sub
          );
          return { submissionsByCode: { ...s.submissionsByCode, [cleanCode]: next } };
        });

        try {
          const res = await fetch(`/api/classroom/${encodeURIComponent(cleanCode)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "add_margin_note",
              submissionId,
              note,
            }),
          });
          const data = await res.json();
          if (res.ok && data?.classroom) {
            get().upsertLocalBundle(data.classroom, data.submissions || []);
          }
        } catch {}
      },

      nudgeMember: async ({ code, actorId, actorName, targetUserId, slotNumber }) => {
        const cleanCode = normalizeClassroomCode(code);
        if (!cleanCode || !actorId || !targetUserId) {
          return { ok: false, message: "Missing nudge details." };
        }
        try {
          const res = await fetch(`/api/classroom/${encodeURIComponent(cleanCode)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "nudge",
              actorId,
              actorName,
              targetUserId,
              slotNumber,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (data?.status === "sent" || data?.status === "cooldown") {
            const key = `${cleanCode}:${targetUserId}`;
            set((s) => ({
              nudgedAtByKey: {
                ...s.nudgedAtByKey,
                [key]: Date.now(),
              },
            }));
          }
          if (data?.status === "not_enabled") {
            set((s) => ({
              pushEnabledByCode: {
                ...s.pushEnabledByCode,
                [cleanCode]: (s.pushEnabledByCode[cleanCode] || []).filter(
                  (id) => id !== targetUserId
                ),
              },
            }));
          }
          return {
            ok: Boolean(data?.ok),
            status: data?.status,
            message: data?.message || data?.error,
          };
        } catch {
          return { ok: false, message: "Could not send nudge right now." };
        }
      },
    }),
    {
      name: "fey-classroom-store",
      version: 1,
      partialize: (state) => ({
        classrooms: state.classrooms,
        submissionsByCode: state.submissionsByCode,
        nudgedAtByKey: state.nudgedAtByKey,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
