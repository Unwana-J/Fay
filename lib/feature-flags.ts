import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface FeatureFlags {
  // Main Game Modules
  enablePassThePhone: boolean; // Pass-the-Phone (Local Articulate) on /play
  enableOnlineArticulate: boolean; // Online Rooms on /play
  enablePodium: boolean; // The Podium slide deck game on /podium
  enableTrivia: boolean; // Naija Trivia Arcade on /games/trivia
  enableCommunitySalons: boolean; // Community Audio Salons on /community

  // Game Sub-Menus & Modes (Revamp / Temporary Maintenance Controls)
  enableTriviaChallenges: boolean; // 1v1 Head-to-Head Challenges in Trivia
  enableTriviaLeagues: boolean; // Friendship Tournament Leagues in Trivia
  enableTriviaLeaderboard: boolean; // Live Scholar Leaderboards in Trivia
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enablePassThePhone: true,
  enableOnlineArticulate: true,
  enablePodium: true,
  enableTrivia: true,
  enableCommunitySalons: true,
  enableTriviaChallenges: true,
  enableTriviaLeagues: true,
  enableTriviaLeaderboard: true,
};

export interface FeatureDefinition {
  key: keyof FeatureFlags;
  name: string;
  category: "Party Games" | "Game Sub-Menus & Modes" | "Community";
  description: string;
  route: string;
  userImpact: string;
  iconName: "smartphone" | "globe" | "presentation" | "help-circle" | "radio" | "swords" | "trophy" | "bar-chart";
  isPrimary?: boolean;
}

export const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  {
    key: "enablePassThePhone",
    name: "Pass-the-Phone (Local Articulate)",
    category: "Party Games",
    description: "Allows groups to pass a single smartphone around for local turn-based word describing on /play.",
    route: "/play",
    userImpact: "When disabled, the 'Pass-the-Phone (Local)' button is completely hidden from all users. Only Online Rooms are accessible.",
    iconName: "smartphone",
    isPrimary: true,
  },
  {
    key: "enableOnlineArticulate",
    name: "Online Articulate Rooms",
    category: "Party Games",
    description: "Allows players to host and join real-time multiplayer Articulate rooms with 4-letter join codes.",
    route: "/play & /play/room/[code]",
    userImpact: "Controls online multiplayer room creation and match joining.",
    iconName: "globe",
  },
  {
    key: "enablePodium",
    name: "The Podium (AI Slide Deck)",
    category: "Party Games",
    description: "Impromptu controversial hot-take spinner with Gemini-generated 5-slide party presentations.",
    route: "/podium",
    userImpact: "When disabled, completely hidden from Dashboard & Games hub. Direct visits to /podium show an editorial 'Under Revamp' maintenance page.",
    iconName: "presentation",
    isPrimary: true,
  },
  {
    key: "enableTrivia",
    name: "Naija Trivia Arcade",
    category: "Party Games",
    description: "1,000+ Nigerian intellectual quizzes, head-to-head shareable challenge links, and multi-day friendship leagues.",
    route: "/games/trivia",
    userImpact: "Controls access to the Naija Trivia Arcade across the dashboard and games hub.",
    iconName: "help-circle",
  },
  {
    key: "enableTriviaChallenges",
    name: "1v1 Trivia Challenges",
    category: "Game Sub-Menus & Modes",
    description: "Head-to-head challenge links (?challenge=...) and the '1v1' challenge creation lounge in Naija Trivia.",
    route: "/games/trivia (1v1 Tab)",
    userImpact: "When disabled, hides the '1v1' menu tab, challenge CTA banners, and share-challenge buttons during revamping.",
    iconName: "swords",
    isPrimary: true,
  },
  {
    key: "enableTriviaLeagues",
    name: "Trivia Friendship Leagues",
    category: "Game Sub-Menus & Modes",
    description: "Multi-day tournament leagues where groups of friends compete on identical daily question seeds.",
    route: "/games/trivia (Leagues Tab)",
    userImpact: "When disabled, hides the '🏆 Leagues' menu tab and locks league lobby creation during maintenance.",
    iconName: "trophy",
  },
  {
    key: "enableTriviaLeaderboard",
    name: "Trivia Scholar Leaderboards",
    category: "Game Sub-Menus & Modes",
    description: "Global live leaderboards comparing player scores against Nigerian intellectual titans.",
    route: "/games/trivia (Ranks Tab)",
    userImpact: "When disabled, hides the 'Top / Ranks' tab from the trivia menu.",
    iconName: "bar-chart",
  },
  {
    key: "enableCommunitySalons",
    name: "Community Audio Salons",
    category: "Community",
    description: "Peer vocal articulation rooms and shared public voice dispatches.",
    route: "/community",
    userImpact: "Controls access to community vocal deliberation rooms.",
    iconName: "radio",
  },
];

// In-memory runtime cache for server-side persistence across requests
let globalFlagsCache: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };
let hasInitializedFromDb = false;

/**
 * Retrieve current feature flags from database or in-memory runtime cache
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  if (isSupabaseConfigured && supabase && !hasInitializedFromDb) {
    try {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("key, enabled");

      if (!error && data && data.length > 0) {
        data.forEach((row: { key: string; enabled: boolean }) => {
          if (row.key in globalFlagsCache) {
            (globalFlagsCache as any)[row.key] = Boolean(row.enabled);
          }
        });
        hasInitializedFromDb = true;
      }
    } catch (err) {
      console.warn("Supabase feature flags read error, falling back to cache:", err);
    }
  }

  return { ...globalFlagsCache };
}

/**
 * Update a single feature flag
 */
export async function updateFeatureFlag(
  key: keyof FeatureFlags,
  enabled: boolean
): Promise<FeatureFlags> {
  globalFlagsCache[key] = enabled;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from("feature_flags")
        .upsert(
          {
            key,
            enabled,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );
    } catch (err) {
      console.warn(`Supabase feature flag update error for ${key}:`, err);
    }
  }

  return { ...globalFlagsCache };
}

/**
 * Update multiple feature flags at once
 */
export async function updateMultipleFeatureFlags(
  updates: Partial<FeatureFlags>
): Promise<FeatureFlags> {
  Object.entries(updates).forEach(([key, val]) => {
    if (key in globalFlagsCache && typeof val === "boolean") {
      (globalFlagsCache as any)[key] = val;
    }
  });

  if (isSupabaseConfigured && supabase) {
    try {
      const upsertRows = Object.entries(updates).map(([key, enabled]) => ({
        key,
        enabled: Boolean(enabled),
        updated_at: new Date().toISOString(),
      }));

      await supabase
        .from("feature_flags")
        .upsert(upsertRows, { onConflict: "key" });
    } catch (err) {
      console.warn("Supabase multiple feature flags update error:", err);
    }
  }

  return { ...globalFlagsCache };
}

/**
 * Reset all feature flags to platform defaults
 */
export async function resetFeatureFlagsToDefaults(): Promise<FeatureFlags> {
  return updateMultipleFeatureFlags(DEFAULT_FEATURE_FLAGS);
}
