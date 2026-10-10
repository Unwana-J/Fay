import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Topic, type Difficulty, DIFFICULTY_XP } from "@/lib/topics";
import { checkNewAchievements, type AchievementStats } from "@/lib/achievements";
import { todayStr, daysBetween, uid, formatDateToIso, getYesterdayStr } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { renameLocalChallengeParticipant } from "@/lib/trivia-challenge";
import {
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  syncStateToCloud,
  syncSessionToCloud,
} from "@/lib/auth-sync";

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
  shields: number; // Scholar's seals of protection
}

// ─── Unified Streak Logic ────────────────────────────────────────────────────
export function advanceStreakState(
  streak: StreakData | undefined,
  today: string = todayStr()
): StreakData {
  const currentStreakVal = streak?.current ?? 0;
  let remainingShields = streak?.shields ?? 1;
  let currentStreak = currentStreakVal;

  if (streak?.lastDate === today) {
    // Already counted today
  } else if (streak?.lastDate && daysBetween(streak.lastDate, today) === 1) {
    currentStreak += 1;
  } else if (streak?.lastDate && daysBetween(streak.lastDate, today) === 2 && remainingShields > 0) {
    // Scholar's Seal preserved the streak!
    currentStreak += 1;
    remainingShields -= 1;
  } else {
    currentStreak = 1;
  }

  const longest = Math.max(streak?.longest ?? 0, currentStreak);

  // Build history entry
  const histEntry = { date: today, count: 1 };
  const historyList = Array.isArray(streak?.history) ? streak.history : [];
  const existingHist = historyList.find((h) => h.date === today);
  const newHistory = existingHist
    ? historyList.map((h) => (h.date === today ? { ...h, count: h.count + 1 } : h))
    : [histEntry, ...historyList];

  return {
    current: currentStreak,
    longest,
    lastDate: today,
    total: (streak?.total ?? 0) + (streak?.lastDate === today ? 0 : 1),
    history: newHistory.slice(0, 400),
    shields: remainingShields,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reconcileStreakState(state: any): StreakData {
  const today = todayStr();
  const activityDates = new Set<string>();

  if (Array.isArray(state?.sessions)) {
    for (const s of state.sessions) {
      if (s?.date) activityDates.add(s.date);
    }
  }

  if (Array.isArray(state?.triviaHistory)) {
    for (const t of state.triviaHistory) {
      if (t?.date) {
        activityDates.add(t.date);
      } else if (t?.timestamp) {
        const d = new Date(t.timestamp);
        activityDates.add(formatDateToIso(d));
      }
    }
  }

  if (Array.isArray(state?.articulateHistory)) {
    for (const a of state.articulateHistory) {
      if (a?.timestamp) {
        const d = new Date(a.timestamp);
        activityDates.add(formatDateToIso(d));
      }
    }
  }

  if (Array.isArray(state?.streak?.history)) {
    for (const h of state.streak.history) {
      if (h?.date) activityDates.add(h.date);
    }
  }

  const existingStreak: StreakData = state?.streak ?? {
    current: 0,
    longest: 0,
    lastDate: null,
    total: 0,
    history: [],
    shields: 1,
  };

  if (activityDates.size === 0) {
    return existingStreak;
  }

  // Sort dates ascending
  const sortedDates = Array.from(activityDates).sort();
  const mostRecentDate = sortedDates[sortedDates.length - 1];

  const fullHistory = Array.from(activityDates)
    .sort()
    .reverse()
    .map((date) => {
      const existing = existingStreak.history?.find((h) => h.date === date);
      return { date, count: existing?.count ?? 1 };
    });

  const diffFromToday = daysBetween(mostRecentDate, today);
  let currentStreak = 0;
  let shields = existingStreak.shields ?? 1;

  // Active if most recent was today (diff 0), yesterday (diff 1), or 2 days with shield
  if (diffFromToday <= 1 || (diffFromToday === 2 && shields > 0)) {
    let checkDate = new Date(mostRecentDate + "T00:00:00");
    let consecutive = 0;

    while (true) {
      const checkStr = formatDateToIso(checkDate);
      if (activityDates.has(checkStr)) {
        consecutive++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevStr = formatDateToIso(prevDate);
        if (activityDates.has(prevStr) && shields > 0) {
          shields--;
          consecutive++;
          checkDate = prevDate;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    currentStreak = consecutive;
  } else {
    currentStreak = 0;
  }

  const longest = Math.max(
    existingStreak.longest ?? 0,
    currentStreak,
    sortedDates.length > 0 ? 1 : 0
  );

  return {
    current: currentStreak,
    longest,
    lastDate: mostRecentDate,
    total: Math.max(existingStreak.total ?? 0, sortedDates.length),
    history: fullHistory.slice(0, 400),
    shields,
  };
}

export interface UserProfile {
  id: string;
  username: string;
  bio: string;
  avatar: string;
  xp: number;
  unlockedAchievements: string[];
  createdAt?: number;
  email?: string;
  hasClaimedAccount?: boolean;
  isBanned?: boolean;
  banReason?: string;
  isDeactivated?: boolean;
}

export interface TriviaHistoryItem {
  id: string;
  timestamp: number;
  date: string;
  score: number;
  total: number;
  pct: number;
  gradeLabel: string;
  xpEarned: number;
  durationMinutes: number;
  questionIds: string[];
  categoryBreakdown: { category: string; correct: number; total: number }[];
  reviewMode?: "instant" | "suspense";
  difficultyMode?: "random" | "easy" | "medium" | "hard";
  challengerName?: string;
  challengerScore?: number;
  challengerTotal?: number;
  challengerPct?: number;
}

export interface ArticulateHistoryItem {
  id: string; // room code
  roomCode: string;
  roomName?: string; // Custom match / group title e.g. "Lokin Labs Hangout", "Design vs Eng"
  hostName: string;
  myTeam?: "A" | "B" | "C" | "D" | null;
  status: "lobby" | "playing" | "round_end" | "game_over";
  scoreA: number;
  scoreB: number;
  scoreC?: number;
  scoreD?: number;
  scoreGoal: number;
  roundNumber: number;
  date: string;
  timestamp: number;
  durationSeconds?: number;
  totalParticipants?: number;
  participants?: Array<{ id: string; name: string; avatar: string; team?: "A" | "B" | "C" | "D" | null; isHost?: boolean }>;
  teamAName?: string;
  teamBName?: string;
  teamCName?: string;
  teamDName?: string;
  teamAColor?: string;
  teamBColor?: string;
  teamCColor?: string;
  teamDColor?: string;
  teamCount?: number;
  gameMode?: "classic" | "masterchef";
}

export interface FeedbackScheduleData {
  lastPromptedAt?: number;
  lastSkippedAt?: number;
  hasSubmitted?: boolean;
  lastSubmittedAt?: number;
}

export interface AppState {

  // Authentication & Onboarding
  isOnboarded: boolean;
  createAccount: (data: { username: string; avatar: string; bio?: string; interests: string[] }) => void;
  resetUserData: () => void;
  claimAccount: (email: string) => void;
  dismissClaimAccountPrompt: () => void;
  claimPromptDismissed: boolean;
  isClaimAccountModalOpen: boolean;
  openClaimAccountPrompt: () => void;
  closeClaimAccountPrompt: () => void;

  // Cloud Authentication & Sync (Supabase)
  authEmail: string | null;
  authUserId: string | null;
  isCloudSynced: boolean;
  lastCloudSyncAt: number | null;
  registerWithCloud: (email: string, password: string, confirmedUsername?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithCloud: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutFromCloud: () => Promise<void>;
  syncToCloud: () => Promise<void>;

  // Profile
  profile: UserProfile;


  // Sessions
  sessions: CompletedSession[];
  activeSession: ActiveSession | null;

  // Streak
  streak: StreakData;

  // Daily Quests
  claimedQuestIds: string[];
  claimQuestXP: (questId: string, xpReward: number) => void;
  buyStreakShield: () => boolean;

  // Settings
  settings: {
    enabledCategories: string[];
    favoriteCategories: string[];
    favoriteTopics: string[]; // List of favorited topic IDs
    preferredDifficulty: Difficulty | "any";
    difficultyMode: Difficulty; // The active difficulty mode for the daily sprint
    researchMin: number;
    speakingSec: number;
    mode: "roulette" | "path";
  };

  // Custom topics
  customTopics: Topic[];

  // Trivia tracking & history
  seenTriviaQuestionIds: string[];
  triviaHistory: TriviaHistoryItem[];

  // Actions
  startSession: (topic: Topic, researchMin: number, initialStage?: "research" | "speaking") => string;
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
  saveTriviaRound: (round: Omit<TriviaHistoryItem, "id" | "timestamp" | "date">) => void;
  clearTriviaHistory: () => void;

  // Articulate online room history
  articulateHistory: ArticulateHistoryItem[];
  saveArticulateRoom: (item: ArticulateHistoryItem) => void;
  removeArticulateRoom: (roomCode: string) => void;

  // Game Guides & How to Play
  hasSeenArticulateGuide: boolean;
  hasSeenTriviaGuide: boolean;
  dismissArticulateGuide: () => void;
  dismissTriviaGuide: () => void;

  // Unified streak & activity synchronization
  recordDailyActivity: (date?: string) => void;
  syncActivityDates: (dates: string[]) => void;

  // NPS & Activity Feedback Prompt Scheduling
  feedbackSchedule: FeedbackScheduleData;
  isFeedbackPromptOpen: boolean;
  feedbackTriggerActivity?: string;
  openFeedbackPrompt: (activity?: string) => void;
  closeFeedbackPrompt: () => void;
  triggerActivityFeedbackIfEligible: (activity: string) => boolean;
  recordFeedbackSkipped: () => void;
  recordFeedbackSubmitted: () => void;

  // Safety Incident Reporting Modal
  isSafetyModalOpen: boolean;
  safetyModalContext?: { roomId?: string; targetUser?: string };
  openSafetyModal: (context?: { roomId?: string; targetUser?: string }) => void;
  closeSafetyModal: () => void;
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
        shields: 1, // 1 free Scholar's Seal on account creation
      },
      claimedQuestIds: [],
      authEmail: null,
      authUserId: null,
      isCloudSynced: false,
      lastCloudSyncAt: null,
      settings: {
        enabledCategories: DEFAULT_ENABLED_CATEGORIES,
        favoriteCategories: ["Artificial Intelligence", "Technology"],
        favoriteTopics: [],
        preferredDifficulty: "any",
        difficultyMode: "Scholar",
        researchMin: 15,
        speakingSec: 60,
        mode: "roulette",
      },
      customTopics: [],
      seenTriviaQuestionIds: [],
      triviaHistory: [],
      articulateHistory: [],
      hasSeenArticulateGuide: false,
      hasSeenTriviaGuide: false,

      feedbackSchedule: {
        lastPromptedAt: undefined,
        lastSkippedAt: undefined,
        hasSubmitted: false,
        lastSubmittedAt: undefined,
      },
      isFeedbackPromptOpen: false,
      feedbackTriggerActivity: undefined,
      isSafetyModalOpen: false,
      safetyModalContext: undefined,

      registerWithCloud: async (email, password, confirmedUsername) => {
        const state = get();
        const trimmed = email.trim().toLowerCase();
        const chosenUsername = confirmedUsername?.trim() || state.profile.username || "Scholar";
        const updatedProfile = {
          ...state.profile,
          username: chosenUsername,
        };

        const res = await signUpWithEmail(trimmed, password, {
          profile: updatedProfile,
          streak: state.streak,
          settings: state.settings,
          sessions: state.sessions,
          claimedQuestIds: state.claimedQuestIds,
        });

        if (res.success && res.user) {
          set((s) => ({
            authEmail: trimmed,
            authUserId: res.user!.id,
            isCloudSynced: true,
            lastCloudSyncAt: Date.now(),
            profile: {
              ...s.profile,
              id: res.user!.id,
              email: trimmed,
              username: chosenUsername,
              hasClaimedAccount: true,
            },
            claimPromptDismissed: true,
            isClaimAccountModalOpen: false,
          }));

          if (typeof window !== "undefined") {
            localStorage.setItem("fey_player_name", chosenUsername);
            localStorage.setItem("fey_device_player_id", res.user!.id);
          }

          analytics.identify(res.user.id, {
            email: trimmed,
            username: chosenUsername,
            hasClaimedAccount: true,
          });
          analytics.track("account_registered_cloud", { email: trimmed, username: chosenUsername });
          return { success: true };
        } else {
          return { success: false, error: res.error || "Failed to seal scholarship in the cloud." };
        }
      },

      loginWithCloud: async (email, password) => {
        const trimmed = email.trim().toLowerCase();
        const res = await signInWithEmail(trimmed, password);
        if (res.success && res.user && res.data) {
          const local = get();
          const cloud = res.data;

          // Merge sessions: union by topicId + date or id
          const existingSessionKeys = new Set(local.sessions.map((s) => `${s.topicId}-${s.date}`));
          const cloudSessions = cloud.sessions || [];
          const mergedSessions = [...local.sessions];
          for (const cs of cloudSessions) {
            if (!existingSessionKeys.has(`${cs.topicId}-${cs.date}`)) {
              mergedSessions.push(cs);
            }
          }
          mergedSessions.sort((a, b) => (b.date > a.date ? 1 : -1));

          // Merge achievements
          const mergedAchievements = Array.from(
            new Set([...local.profile.unlockedAchievements, ...(cloud.unlockedAchievements || [])])
          );

          // Merge claimed quest ids
          const mergedQuests = Array.from(
            new Set([...local.claimedQuestIds, ...(cloud.claimedQuestIds || [])])
          );

          // Merge streak
          const mergedStreak: StreakData = {
            current: Math.max(local.streak.current, cloud.streak?.current || 0),
            longest: Math.max(local.streak.longest, cloud.streak?.longest || 0),
            total: Math.max(local.streak.total, cloud.streak?.total || 0),
            lastDate: cloud.streak?.lastDate || local.streak.lastDate,
            shields: Math.max(local.streak.shields, cloud.streak?.shields ?? 1),
            history: reconcileStreakState({
              sessions: mergedSessions,
              streak: {
                history: [...(local.streak.history || []), ...(cloud.streak?.history || [])],
              },
            }).history,
          };

          const finalXP = Math.max(local.profile.xp, cloud.profile.xp || 0);

          set({
            isOnboarded: true,
            authEmail: res.user.email,
            authUserId: res.user.id,
            isCloudSynced: true,
            lastCloudSyncAt: Date.now(),
            profile: {
              ...local.profile,
              id: res.user.id,
              email: res.user.email,
              username: cloud.profile.username || local.profile.username || "Scholar",
              avatar: cloud.profile.avatar || local.profile.avatar || "/avatars/avatar-scholar.svg",
              bio: cloud.profile.bio || local.profile.bio,
              xp: finalXP,
              unlockedAchievements: mergedAchievements,
              hasClaimedAccount: true,
            },
            sessions: mergedSessions,
            streak: mergedStreak,
            claimedQuestIds: mergedQuests,
            settings: cloud.settings || local.settings,
          });

          analytics.identify(res.user.id, {
            email: res.user.email,
            username: cloud.profile.username || local.profile.username,
          });
          analytics.track("account_logged_in_cloud", { email: res.user.email });

          return { success: true };
        } else {
          return { success: false, error: res.error || "Invalid email or password." };
        }
      },

      logoutFromCloud: async () => {
        await signOutUser();
        set({
          authEmail: null,
          authUserId: null,
          isCloudSynced: false,
          lastCloudSyncAt: null,
        });
        analytics.track("account_logged_out_cloud", {});
      },

      syncToCloud: async () => {
        const state = get();
        if (!state.authUserId) return;
        const ok = await syncStateToCloud(state.authUserId, {
          profile: state.profile,
          streak: state.streak,
          settings: state.settings,
          claimedQuestIds: state.claimedQuestIds,
        });
        if (ok) {
          set({ lastCloudSyncAt: Date.now(), isCloudSynced: true });
        }
      },

      createAccount: ({ username, avatar, bio, interests }) => {
        const state = get();
        const profileId = state.profile.id || uid();
        set((s) => ({
          isOnboarded: true,
          profile: {
            ...s.profile,
            id: profileId,
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
        analytics.identify(profileId, {
          username: username.trim(),
          bio: bio?.trim(),
          interests,
        });
        analytics.track("onboarding_completed", {
          username: username.trim(),
          interests,
        });
      },

      resetUserData: () => {
        analytics.reset();
        set({
          isOnboarded: false,
          authEmail: null,
          authUserId: null,
          isCloudSynced: false,
          lastCloudSyncAt: null,
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
            shields: 1,
          },
          claimedQuestIds: [],
          seenTriviaQuestionIds: [],
          triviaHistory: [],
          customTopics: [],
          claimPromptDismissed: false,
          isClaimAccountModalOpen: false,
        });
      },

      claimPromptDismissed: false,
      isClaimAccountModalOpen: false,

      openClaimAccountPrompt: () => set({ isClaimAccountModalOpen: true }),
      closeClaimAccountPrompt: () => set({ isClaimAccountModalOpen: false }),

      claimAccount: (email: string) => {
        const trimmed = email.trim().toLowerCase();
        set((s) => ({
          profile: {
            ...s.profile,
            email: trimmed,
            hasClaimedAccount: true,
          },
          claimPromptDismissed: true,
          isClaimAccountModalOpen: false,
        }));
        const state = get();
        analytics.identify(state.profile.id, {
          email: trimmed,
          username: state.profile.username,
          hasClaimedAccount: true,
        });
        analytics.trackAccountClaimPrompt({
          streakCount: state.streak.current,
          action: "submitted",
          email: trimmed,
        });
      },

      dismissClaimAccountPrompt: () => {
        set({ claimPromptDismissed: true, isClaimAccountModalOpen: false });
        analytics.trackAccountClaimPrompt({
          streakCount: get().streak.current,
          action: "dismissed",
        });
      },


      startSession: (topic, researchMin, initialStage = "research") => {
        const id = uid();
        set({
          activeSession: {
            id,
            topic,
            stage: initialStage,
            startedAt: Date.now(),
            researchDurationMin: researchMin,
            notes: initialStage === "speaking" ? "Impromptu Articulation (Direct-to-speech sprint)" : "",
            ...(initialStage === "speaking" ? { researchCompletedAt: Date.now() } : {}),
          },
        });
        analytics.trackSprintStarted({
          topicId: topic.id,
          topicText: topic.text,
          category: topic.category,
          difficulty: topic.difficulty,
          mode: initialStage === "speaking" ? "impromptu" : "standard",
        });
        return id;
      },

      updateActiveSessionStage: (stage) => {
        const current = get().activeSession;
        if (current) {
          analytics.trackSprintStage({
            topicId: current.topic.id,
            stage,
          });
        }
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

        // Advance streak using unified helper
        const updatedStreak = advanceStreakState(state.streak, today);
        const currentStreak = updatedStreak.current;
        const remainingShields = updatedStreak.shields;
        const longest = updatedStreak.longest;

        // XP calculation
        let xpEarned = DIFFICULTY_XP[topic.difficulty] ?? 100;
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
          expertTopicsCompleted: newSessions.filter((s) => s.difficulty === "Expert").length,
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
          streak: updatedStreak,
          profile: {
            ...state.profile,
            xp: newXP + achievementXP,
            unlockedAchievements: [...state.profile.unlockedAchievements, ...newAchievementIds],
          },
        });

        analytics.trackSprintCompleted({
          topicId: topic.id,
          topicText: topic.text,
          category: topic.category,
          difficulty: topic.difficulty,
          xpEarned: xpEarned + achievementXP,
          durationSeconds: data.speakingSeconds,
          ratings: data.ratings,
        });

        analytics.trackStreakUpdated({
          streakCount: currentStreak,
          shieldsRemaining: remainingShields,
        });

        // If logged into cloud account, sync session and profile state in background
        if (state.authUserId) {
          syncSessionToCloud(state.authUserId, completedSession).catch(() => {});
          syncStateToCloud(state.authUserId, {
            profile: {
              ...state.profile,
              xp: newXP + achievementXP,
              unlockedAchievements: [...state.profile.unlockedAchievements, ...newAchievementIds],
            },
            streak: updatedStreak,
            settings: state.settings,
            claimedQuestIds: state.claimedQuestIds,
          }).catch(() => {});
        }

        return { xpEarned: xpEarned + achievementXP, newAchievements: newAchievementIds };
      },

      abandonSession: () => set({ activeSession: null }),

      claimQuestXP: (questId, xpReward) => {
        const state = get();
        if (state.claimedQuestIds.includes(questId)) return;
        const newClaimed = [...state.claimedQuestIds, questId];
        const newProfile = {
          ...state.profile,
          xp: state.profile.xp + xpReward,
        };
        set({
          claimedQuestIds: newClaimed,
          profile: newProfile,
        });
        if (state.authUserId) {
          syncStateToCloud(state.authUserId, {
            profile: newProfile,
            streak: state.streak,
            settings: state.settings,
            claimedQuestIds: newClaimed,
          }).catch(() => {});
        }
      },

      buyStreakShield: () => {
        const state = get();
        const cost = 150;
        if (state.profile.xp < cost) return false;
        const currentShields = state.streak.shields ?? 0;
        const newProfile = {
          ...state.profile,
          xp: state.profile.xp - cost,
        };
        const newStreak = {
          ...state.streak,
          shields: currentShields + 1,
        };
        set({
          profile: newProfile,
          streak: newStreak,
        });
        if (state.authUserId) {
          syncStateToCloud(state.authUserId, {
            profile: newProfile,
            streak: newStreak,
            settings: state.settings,
            claimedQuestIds: state.claimedQuestIds,
          }).catch(() => {});
        }
        return true;
      },

      updateProfile: (data) => {
        const oldUsername = get().profile.username;
        const newUsername = data.username?.trim();

        if (newUsername && newUsername !== oldUsername) {
          // 1. Sync local challenge scores in browser
          if (typeof window !== "undefined") {
            try {
              renameLocalChallengeParticipant(oldUsername, newUsername);
              localStorage.setItem("fey_player_name", newUsername);
            } catch {}

            // 2. Sync to Supabase so past scores in trivia_scores reflect the new name
            fetch("/api/trivia/scores", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                oldUsername,
                newUsername,
                deviceId: get().profile.id,
              }),
            }).catch(() => {});
          }
        }

        const updatedProfile = { ...get().profile, ...data };
        set({ profile: updatedProfile });

        const authUserId = get().authUserId;
        if (authUserId) {
          syncStateToCloud(authUserId, {
            profile: updatedProfile,
            streak: get().streak,
            settings: get().settings,
            claimedQuestIds: get().claimedQuestIds,
          }).catch(() => {});
        }
      },

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

      addXP: (amount) => {
        const state = get();
        const newProfile = {
          ...state.profile,
          xp: state.profile.xp + amount,
        };
        set({ profile: newProfile });
        if (state.authUserId) {
          syncStateToCloud(state.authUserId, {
            profile: newProfile,
            streak: state.streak,
            settings: state.settings,
            claimedQuestIds: state.claimedQuestIds,
          }).catch(() => {});
        }
      },

      markTriviaQuestionsSeen: (ids) =>
        set((s) => {
          const current = s.seenTriviaQuestionIds || [];
          const merged = Array.from(new Set([...current, ...ids]));
          return { seenTriviaQuestionIds: merged };
        }),

      resetSeenTriviaQuestions: () =>
        set({ seenTriviaQuestionIds: [] }),

      saveTriviaRound: (round) => {
        const state = get();
        const today = todayStr();
        const item: TriviaHistoryItem = {
          ...round,
          id: uid(),
          timestamp: Date.now(),
          date: today,
        };
        const existing = Array.isArray(state.triviaHistory) ? state.triviaHistory : [];
        const updatedStreak = advanceStreakState(state.streak, today);
        set({
          triviaHistory: [item, ...existing].slice(0, 100),
          streak: updatedStreak,
        });
        if (state.authUserId) {
          syncStateToCloud(state.authUserId, {
            profile: state.profile,
            streak: updatedStreak,
            settings: state.settings,
            claimedQuestIds: state.claimedQuestIds,
          }).catch(() => {});
        }
      },

      clearTriviaHistory: () =>
        set({ triviaHistory: [] }),

      saveArticulateRoom: (item) => {
        const state = get();
        const today = todayStr();
        const list = Array.isArray(state.articulateHistory) ? state.articulateHistory : [];
        const filtered = list.filter((r) => r.roomCode !== item.roomCode);
        const updatedStreak = advanceStreakState(state.streak, today);
        set({
          articulateHistory: [item, ...filtered].slice(0, 20),
          streak: updatedStreak,
        });
        if (state.authUserId) {
          syncStateToCloud(state.authUserId, {
            profile: state.profile,
            streak: updatedStreak,
            settings: state.settings,
            claimedQuestIds: state.claimedQuestIds,
          }).catch(() => {});
        }
      },

      removeArticulateRoom: (roomCode) =>
        set((s) => ({
          articulateHistory: (s.articulateHistory || []).filter(
            (r) => r.roomCode !== roomCode
          ),
        })),

      dismissArticulateGuide: () => set({ hasSeenArticulateGuide: true }),
      dismissTriviaGuide: () => set({ hasSeenTriviaGuide: true }),

      recordDailyActivity: (date = todayStr()) => {
        const state = get();
        const updatedStreak = advanceStreakState(state.streak, date);
        set({ streak: updatedStreak });
        if (state.authUserId) {
          syncStateToCloud(state.authUserId, {
            profile: state.profile,
            streak: updatedStreak,
            settings: state.settings,
            claimedQuestIds: state.claimedQuestIds,
          }).catch(() => {});
        }
      },

      syncActivityDates: (dates) =>
        set((s) => {
          if (!Array.isArray(dates) || dates.length === 0) return {};
          const currentHist = s.streak?.history || [];
          const existingDates = new Set(currentHist.map((h) => h.date));
          const newEntries = dates
            .filter((d) => !existingDates.has(d))
            .map((d) => ({ date: d, count: 1 }));
          if (newEntries.length === 0) return {};

          const dummyState = {
            ...s,
            streak: {
              ...(s.streak || {}),
              history: [...newEntries, ...currentHist],
            },
          };
          return {
            streak: reconcileStreakState(dummyState),
          };
        }),

      // NPS & Activity Feedback Prompt Engine
      openFeedbackPrompt: (activity = "manual") =>
        set({ isFeedbackPromptOpen: true, feedbackTriggerActivity: activity }),

      closeFeedbackPrompt: () =>
        set({ isFeedbackPromptOpen: false }),

      triggerActivityFeedbackIfEligible: (activity: string) => {
        const state = get();
        const schedule = state.feedbackSchedule || {};
        const now = Date.now();

        // 1. If user already submitted feedback in the last 30 days, snooze
        if (schedule.hasSubmitted && schedule.lastSubmittedAt) {
          const daysSinceSubmitted = (now - schedule.lastSubmittedAt) / (1000 * 60 * 60 * 24);
          if (daysSinceSubmitted < 30) return false;
        }

        // 2. If user skipped, only show again after 1 full week (7 days)
        if (schedule.lastSkippedAt) {
          const daysSinceSkipped = (now - schedule.lastSkippedAt) / (1000 * 60 * 60 * 24);
          if (daysSinceSkipped < 7) return false;
        }

        // 3. New User check: For brand-new users, show only AFTER day 1
        // Existing users: account > 24h old OR streak >= 2 OR has XP / sessions / history
        const createdAt = state.profile?.createdAt || now;
        const hoursSinceCreated = (now - createdAt) / (1000 * 60 * 60);
        const hasExistingHistory =
          (state.streak?.current || 0) >= 2 ||
          (state.profile?.xp || 0) > 0 ||
          (state.sessions || []).length > 0 ||
          (state.triviaHistory || []).length > 0;

        const isBrandNewDayOneUser = hoursSinceCreated < 24 && !hasExistingHistory;

        if (isBrandNewDayOneUser) {
          // Brand-new day 1 user with no prior history; wait until day 2+
          return false;
        }

        // 4. Do not prompt more than once every 12 hours
        if (schedule.lastPromptedAt) {
          const hoursSincePrompt = (now - schedule.lastPromptedAt) / (1000 * 60 * 60);
          if (hoursSincePrompt < 12) return false;
        }

        // User is eligible! Trigger the prompt at the end of this activity
        set({
          isFeedbackPromptOpen: true,
          feedbackTriggerActivity: activity,
          feedbackSchedule: {
            ...schedule,
            lastPromptedAt: now,
          },
        });
        return true;
      },

      recordFeedbackSkipped: () => {
        const state = get();
        const schedule = state.feedbackSchedule || {};
        set({
          isFeedbackPromptOpen: false,
          feedbackSchedule: {
            ...schedule,
            lastSkippedAt: Date.now(),
          },
        });
      },

      recordFeedbackSubmitted: () => {
        const state = get();
        const schedule = state.feedbackSchedule || {};
        set({
          isFeedbackPromptOpen: false,
          feedbackSchedule: {
            ...schedule,
            hasSubmitted: true,
            lastSubmittedAt: Date.now(),
          },
        });
      },

      openSafetyModal: (context) =>
        set({ isSafetyModalOpen: true, safetyModalContext: context }),

      closeSafetyModal: () =>
        set({ isSafetyModalOpen: false, safetyModalContext: undefined }),
    }),

    {
      name: "fey-app-store",
      version: 11,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.streak = reconcileStreakState(state);
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      migrate: (persistedState: any, fromVersion: number) => {
        const state = { ...persistedState };
        // Always clear activeSession on cold start from persisted state 
        // to prevent being trapped in a stale session
        state.activeSession = null;

        // Ensure triviaHistory & articulateHistory arrays exist
        state.triviaHistory = Array.isArray(state?.triviaHistory) ? state.triviaHistory : [];
        state.articulateHistory = Array.isArray(state?.articulateHistory) ? state.articulateHistory : [];

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

        // v5 → v6: habit mechanics (Scholar's Seal and daily quests)
        if (fromVersion === undefined || fromVersion < 6) {
          state.streak = {
            ...(state?.streak ?? {}),
            shields: state?.streak?.shields ?? 1,
          };
          state.claimedQuestIds = state?.claimedQuestIds ?? [];
        }

        // v6 → v7: difficulty modes (Novice / Scholar / Expert)
        if (fromVersion === undefined || fromVersion < 7) {
          state.settings = {
            ...(state?.settings ?? {}),
            difficultyMode: state?.settings?.difficultyMode ?? "Scholar",
          };
          // Normalize any legacy difficulty strings on completed sessions
          if (Array.isArray(state?.sessions)) {
            state.sessions = state.sessions.map((s: { difficulty?: string }) => {
              const d = s.difficulty?.toLowerCase();
              const normalized =
                d === "beginner" ? "Novice" :
                d === "intermediate" ? "Scholar" :
                (d === "advanced" || d === "expert") ? "Expert" :
                s.difficulty ?? "Scholar";
              return { ...s, difficulty: normalized };
            });
          }
        }

        // v9 → v10: Reconcile streak state from all historical activities
        state.streak = reconcileStreakState(state);

        // v10 → v11: Ensure hasSeenArticulateGuide & hasSeenTriviaGuide exist
        if (fromVersion === undefined || fromVersion < 11) {
          state.hasSeenArticulateGuide = typeof state?.hasSeenArticulateGuide === "boolean" ? state.hasSeenArticulateGuide : false;
          state.hasSeenTriviaGuide = typeof state?.hasSeenTriviaGuide === "boolean" ? state.hasSeenTriviaGuide : false;
        }

        state.hasSeenArticulateGuide = typeof state?.hasSeenArticulateGuide === "boolean" ? state.hasSeenArticulateGuide : false;
        state.hasSeenTriviaGuide = typeof state?.hasSeenTriviaGuide === "boolean" ? state.hasSeenTriviaGuide : false;

        // Ensure profile has an id
        if (!state?.profile?.id) {
          state.profile = {
            ...(state?.profile ?? {}),
            id: uid(),
          };
        }

        return state;
      },
    }
  )
);
