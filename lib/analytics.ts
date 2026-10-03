import posthog from "posthog-js";

export const analytics = {
  init: () => {
    if (typeof window === "undefined") return;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    if (key && !posthog.__loaded) {
      posthog.init(key, {
        api_host: host,
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
      });
    }
  },

  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window === "undefined" || !posthog.__loaded) return;
    posthog.identify(userId, traits);
  },

  reset: () => {
    if (typeof window === "undefined" || !posthog.__loaded) return;
    posthog.reset();
  },

  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window === "undefined" || !posthog.__loaded) return;
    posthog.capture(eventName, properties);
  },

  // Feynman Sprint Events
  trackSprintStarted: (data: {
    topicId: string;
    topicText: string;
    category: string;
    difficulty: string;
    mode: "impromptu" | "standard";
  }) => {
    analytics.track("sprint_started", data);
  },

  trackSprintStage: (data: {
    topicId: string;
    stage: "research" | "notes" | "speaking" | "reflection";
  }) => {
    analytics.track("sprint_stage_reached", data);
  },

  trackAudioRecorded: (data: {
    topicId: string;
    durationSeconds: number;
    retryCount: number;
  }) => {
    analytics.track("audio_recorded", data);
  },

  trackSprintCompleted: (data: {
    topicId: string;
    topicText: string;
    category: string;
    difficulty: string;
    xpEarned: number;
    durationSeconds?: number;
    ratings?: {
      confidence: number;
      understanding: number;
      communication: number;
    };
  }) => {
    analytics.track("sprint_completed", data);
  },

  // Habit & Retention Events
  trackStreakUpdated: (data: {
    streakCount: number;
    shieldsRemaining: number;
  }) => {
    analytics.track("streak_advanced", data);
  },

  trackAccountClaimPrompt: (data: {
    streakCount: number;
    action: "shown" | "submitted" | "dismissed";
    email?: string;
  }) => {
    analytics.track("account_claim_prompt", data);
  },

  // Discovery & Games
  trackRouletteSpun: (data: {
    category?: string;
    difficulty?: string;
  }) => {
    analytics.track("topic_roulette_spun", data);
  },

  trackProofCardShared: (data: {
    topicId: string;
    method: "clipboard" | "download";
  }) => {
    analytics.track("proof_card_shared", data);
  },

  trackPodiumDeckGenerated: (data: {
    topic: string;
    slidesCount: number;
  }) => {
    analytics.track("podium_deck_generated", data);
  },

  // Feedback & Safety
  trackFeedbackSubmitted: (data: {
    rating: number;
    promptType: "what_could_be_better" | "extra_star_if";
    message: string;
    path?: string;
    username?: string;
  }) => {
    analytics.track("feedback_submitted", data);
  },

  trackIncidentReported: (data: {
    category: string;
    hasEmail: boolean;
    isRegistered: boolean;
    roomId?: string;
    targetUser?: string;
  }) => {
    analytics.track("incident_reported", data);
  },
};

