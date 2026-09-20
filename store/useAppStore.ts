import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Topic, type Difficulty, DIFFICULTY_XP } from "@/lib/topics";
import { checkNewAchievements, type AchievementStats } from "@/lib/achievements";
import { todayStr, daysBetween, uid } from "@/lib/utils";

export interface CompletedSession {
  id: string;
  topicId: string;
  topicText: string;
  category: string;
  difficulty: Difficulty;
  date: string;
  researchMinutes: number;
  notes: string;
  summary: string;
  speakingSeconds: number;
  reflection: {
    interesting: string;
    hardest: string;
    different: string;
  };
  ratings: {
    confidence: number;
    understanding: number;
    communication: number;
  };
  xpEarned: number;
  tags: string[];
  audioBase64?: string; // Base64 speaking recording
}

export interface ActiveSession {
  id: string;
  topic: Topic;
  stage: "research" | "notes" | "speaking" | "reflection";
  startedAt: number;
  researchDurationMin: number;
  notes: string;
  researchCompletedAt?: number;
  speakingCompletedAt?: number;
}

export interface StreakData {
  current: number;
  longest: number;
  lastDate: string | null;
  total: number;
  history: Array<{ date: string; count: number }>;
}

export interface UserProfile {
  id: string;
  username: string;
  bio: string;
  avatar: string;
  xp: number;
  unlockedAchievements: string[];
  createdAt?: number;
}

export interface AppState {
  // Authentication & Onboarding
  isOnboarded: boolean;
  createAccount: (data: { username: string; avatar: string; bio?: string; interests: string[] }) => void;
  resetUserData: () => void;

  // Profile
  profile: UserProfile;

  // Sessions
  sessions: CompletedSession[];
  activeSession: ActiveSession | null;

  // Streak
  streak: StreakData;

  // Settings
  settings: {
    enabledCategories: string[];
    favoriteCategories: string[];
    favoriteTopics: string[]; // List of favorited topic IDs
    preferredDifficulty: Difficulty | "any";
    researchMin: number;
    speakingSec: number;
    mode: "roulette" | "path";
  };

  // Custom topics
  customTopics: Topic[];

  // Trivia tracking
  seenTriviaQuestionIds: string[];

  // Actions
  startSession: (topic: Topic, researchMin: number) => string;
  updateActiveSessionStage: (stage: ActiveSession["stage"]) => void;
  updateNotes: (notes: string) => void;
  completeSession: (data: {
    notes: string;
    speakingSeconds: number;
    reflection: CompletedSession["reflection"];
    ratings: CompletedSession["ratings"];
    audioBase64?: string;
  }) => { xpEarned: number; newAchievements: string[] };
  abandonSession: () => void;
  updateProfile: (data: Partial<AppState["profile"]>) => void;
  updateSettings: (data: Partial<AppState["settings"]>) => void;
  toggleFavoriteTopic: (topicId: string) => void;
  updateSessionAudio: (sessionId: string, audioBase64: string, speakingSeconds: number) => void;
  addCustomTopic: (topic: Omit<Topic, "id">) => void;
  removeCustomTopic: (id: string) => void;
  addXP: (amount: number) => void;
  markTriviaQuestionsSeen: (ids: string[]) => void;
  resetSeenTriviaQuestions: () => void;
}

const DEFAULT_ENABLED_CATEGORIES = [
  "Artificial Intelligence",
  "Technology",
  "Software Engineering",
  "Finance",
  "Economics",
  "Psychology",
  "Business",
  "History",
  "Science",
  "Philosophy",
  "Startups",
  "Culture",
  "Wildcard",
  "Medicine",
  "Personal Finance",
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isOnboarded: false,
      profile: {
        id: uid(),
        username: "",
        bio: "Building knowledge one topic at a time.",
        avatar: "/avatars/avatar-scholar.svg",
        xp: 0,
        unlockedAchievements: [],
        createdAt: Date.now(),
      },
      sessions: [],
      activeSession: null,
      streak: {
        current: 0,
        longest: 0,
        lastDate: null,
        total: 0,
        history: [],
      },
      settings: {
        enabledCategories: DEFAULT_ENABLED_CATEGORIES,
        favoriteCategories: ["Artificial Intelligence", "Technology"],
        favoriteTopics: [],
        preferredDifficulty: "any",
        researchMin: 15,
        speakingSec: 60,
        mode: "roulette",
      },
      customTopics: [],
      seenTriviaQuestionIds: [],

      createAccount: ({ username, avatar, bio, interests }) => {
        set((s) => ({
          isOnboarded: true,
          profile: {
            ...s.profile,
            id: s.profile.id || uid(),
            username: username.trim(),
            avatar: avatar || "/avatars/avatar-scholar.svg",
            bio: bio?.trim() || "Building knowledge one topic at a time.",
            createdAt: s.profile.createdAt || Date.now(),
          },
          settings: {
            ...s.settings,
            favoriteCategories: interests.length > 0 ? interests : s.settings.favoriteCategories,
            enabledCategories: interests.length > 0 ? interests : s.settings.enabledCategories,
          },
        }));
      },

      resetUserData: () => {
        set({
          isOnboarded: false,
          profile: {
            id: uid(),
            username: "",
            bio: "Building knowledge one topic at a time.",
            avatar: "/avatars/avatar-scholar.svg",
            xp: 0,
            unlockedAchievements: [],
            createdAt: Date.now(),
          },
          sessions: [],
          activeSession: null,
          streak: {
            current: 0,
            longest: 0,
            lastDate: null,
            total: 0,
            history: [],
          },
          seenTriviaQuestionIds: [],
          customTopics: [],
        });
      },

      startSession: (topic, researchMin) => {
        const id = uid();
        set({
          activeSession: {
            id,
            topic,
            stage: "research",
            startedAt: Date.now(),
            researchDurationMin: researchMin,
            notes: "",
          },
        });
        return id;
      },

      updateActiveSessionStage: (stage) => {
        set((s) => ({
          activeSession: s.activeSession
            ? {
                ...s.activeSession,
                stage,
                ...(stage === "speaking" ? { researchCompletedAt: Date.now() } : {}),
                ...(stage === "reflection" ? { speakingCompletedAt: Date.now() } : {}),
              }
            : null,
        }));
      },

      updateNotes: (notes) => {
        set((s) => ({
          activeSession: s.activeSession ? { ...s.activeSession, notes } : null,
        }));
      },

      completeSession: (data) => {
        const state = get();
        if (!state.activeSession) return { xpEarned: 0, newAchievements: [] };
        const { topic, researchDurationMin } = state.activeSession;
        const today = todayStr();

        // XP calculation
        let xpEarned = DIFFICULTY_XP[topic.difficulty] ?? 100;
        const streak = state.streak;
        let currentStreak = streak.current;
        if (streak.lastDate === today) {
          // already counted
        } else if (streak.lastDate && daysBetween(streak.lastDate, today) === 1) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
        // streak bonus
        xpEarned += currentStreak * 10;
        // research bonus
        if (researchDurationMin >= 20) xpEarned += 25;
        // speaking bonus
        if (data.speakingSeconds >= 45) {
          xpEarned += 30;
        } else if (data.speakingSeconds >= 20) {
          xpEarned += 15;
        }

        const longest = Math.max(streak.longest, currentStreak);

        // Build history entry
        const histEntry = { date: today, count: 1 };
        const existingHist = streak.history.find((h) => h.date === today);
        const newHistory = existingHist
          ? streak.history.map((h) => (h.date === today ? { ...h, count: h.count + 1 } : h))
          : [histEntry, ...streak.history];

        const completedSession: CompletedSession = {
          id: uid(),
          topicId: topic.id,
          topicText: topic.text,
          category: topic.category,
          difficulty: topic.difficulty,
          date: today,
          researchMinutes: researchDurationMin,
          notes: data.notes,
          summary: "",
          speakingSeconds: data.speakingSeconds,
          reflection: data.reflection,
          ratings: data.ratings,
          xpEarned,
          tags: topic.tags || [],
          audioBase64: data.audioBase64,
        };

        const newSessions = [completedSession, ...state.sessions];
        const newXP = state.profile.xp + xpEarned;

        // Check achievements
        const stats: AchievementStats = {
          totalSessions: newSessions.length,
          currentStreak,
          longestStreak: longest,
          researchMinutes: newSessions.reduce((a, s) => a + s.researchMinutes, 0),
          speakingMinutes: Math.round(newSessions.reduce((a, s) => a + s.speakingSeconds, 0) / 60),
          topicsMastered: newSessions.length,
          expertTopicsCompleted: newSessions.filter((s) => s.difficulty === "expert").length,
          uniqueCategories: new Set(newSessions.map((s) => s.category)).size,
          constellationNodes: newSessions.length,
          xp: newXP,
        };

        const newAchievements = checkNewAchievements(stats, state.profile.unlockedAchievements);
        const newAchievementIds = newAchievements.map((a) => a.id);
        const achievementXP = newAchievements.reduce((a, ach) => a + ach.xpReward, 0);

        set({
          sessions: newSessions,
          activeSession: null,
          streak: {
            current: currentStreak,
            longest,
            lastDate: today,
            total: streak.total + 1,
            history: newHistory.slice(0, 400),
          },
          profile: {
            ...state.profile,
            xp: newXP + achievementXP,
            unlockedAchievements: [...state.profile.unlockedAchievements, ...newAchievementIds],
          },
        });

        return { xpEarned: xpEarned + achievementXP, newAchievements: newAchievementIds };
      },

      abandonSession: () => set({ activeSession: null }),

      updateProfile: (data) =>
        set((s) => ({ profile: { ...s.profile, ...data } })),

      updateSettings: (data) =>
        set((s) => ({ settings: { ...s.settings, ...data } })),

      toggleFavoriteTopic: (topicId) => {
        const favs = get().settings.favoriteTopics || [];
        const isFav = favs.includes(topicId);
        set((s) => ({
          settings: {
            ...s.settings,
            favoriteTopics: isFav ? favs.filter((id) => id !== topicId) : [...favs, topicId],
          },
        }));
      },

      updateSessionAudio: (sessionId, audioBase64, speakingSeconds) => {
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? { ...sess, audioBase64, speakingSeconds }
              : sess
          ),
        }));
      },

      addCustomTopic: (topic) => {
        const id = `custom-${uid()}`;
        set((s) => ({
          customTopics: [
            ...s.customTopics,
            { ...topic, id },
          ],
        }));
      },

      removeCustomTopic: (id) =>
        set((s) => ({
          customTopics: s.customTopics.filter((t) => t.id !== id),
        })),

      addXP: (amount) =>
        set((s) => ({
          profile: {
            ...s.profile,
            xp: s.profile.xp + amount,
          },
        })),

      markTriviaQuestionsSeen: (ids) =>
        set((s) => {
          const current = s.seenTriviaQuestionIds || [];
          const merged = Array.from(new Set([...current, ...ids]));
          return { seenTriviaQuestionIds: merged };
        }),

      resetSeenTriviaQuestions: () =>
        set({ seenTriviaQuestionIds: [] }),
    }),
    {
      name: "fey-app-store",
      version: 5,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      migrate: (persistedState: any, fromVersion: number) => {
        const state = { ...persistedState };
        // Always clear activeSession on cold start from persisted state 
        // to prevent being trapped in a stale session
        state.activeSession = null;

        // v1/v2 → v3 (or unversioned): auto-add any categories that didn't exist yet
        if (fromVersion === undefined || fromVersion < 3) {
          const existing: string[] = state?.settings?.enabledCategories ?? [];
          const merged = Array.from(new Set([...existing, ...DEFAULT_ENABLED_CATEGORIES]));
          state.settings = {
            ...(state?.settings ?? {}),
            enabledCategories: merged,
          };
        }

        // v3 → v4: handle onboarding state for existing beta testers/users
        if (fromVersion === undefined || fromVersion < 4) {
          const hasUsername =
            typeof state?.profile?.username === "string" &&
            state.profile.username.trim().length > 0 &&
            state.profile.username !== "Learner";
          const hasSessions = Array.isArray(state?.sessions) && state.sessions.length > 0;
          state.isOnboarded = Boolean(hasUsername || hasSessions);
          if (!state.profile?.avatar || state.profile.avatar === "🧠") {
            state.profile = { ...(state?.profile ?? {}), avatar: "/avatars/avatar-scholar.svg" };
          }
        }

        // v4 → v5: ensure enabledCategories strictly reflects user's chosen favorite categories if set
        if (fromVersion === undefined || fromVersion < 5) {
          const favs: string[] = state?.settings?.favoriteCategories ?? [];
          if (favs.length > 0) {
            state.settings = {
              ...(state?.settings ?? {}),
              enabledCategories: favs,
            };
          }
        }

        return state;
      },
    }
  )
);
