import type { UserProfile, TriviaHistoryItem } from "@/store/useAppStore";

export interface TriviaScholarEntry {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bestScore: number;
  bestTotal: number;
  bestPct: number;
  gamesPlayed: number;
  triviaXP: number;
  isUser: boolean;
  rank?: number;
  rankBadge?: string;
  badgeColor?: string;
}

// Curated Nigerian scholars reflecting Fey's high-intellectual editorial world
export const BASE_COMMUNITY_SCHOLARS: Omit<TriviaScholarEntry, "isUser" | "rank" | "rankBadge" | "badgeColor">[] = [
  {
    id: "scholar-amina-bello",
    name: "Amina Bello",
    avatar: "/avatars/avatar-orator.svg",
    title: "Grand Historian · Kano",
    bestScore: 24,
    bestTotal: 25,
    bestPct: 96,
    gamesPlayed: 38,
    triviaXP: 1840,
  },
  {
    id: "scholar-chidi-nnamdi",
    name: "Chidi Nnamdi",
    avatar: "/avatars/avatar-philosopher.svg",
    title: "Naija Savant · Enugu",
    bestScore: 19,
    bestTotal: 20,
    bestPct: 95,
    gamesPlayed: 31,
    triviaXP: 1520,
  },
  {
    id: "scholar-damilola-bakare",
    name: "Damilola Bakare",
    avatar: "/avatars/avatar-luminary.svg",
    title: "Pop Culture Oracle · Lagos",
    bestScore: 14,
    bestTotal: 15,
    bestPct: 93,
    gamesPlayed: 25,
    triviaXP: 1260,
  },
  {
    id: "scholar-ngozi-eze",
    name: "Ngozi Eze",
    avatar: "/avatars/avatar-scholar.svg",
    title: "Polymath of General Knowledge · Abuja",
    bestScore: 13,
    bestTotal: 15,
    bestPct: 87,
    gamesPlayed: 20,
    triviaXP: 990,
  },
  {
    id: "scholar-tunde-oladipo",
    name: "Tunde Oladipo",
    avatar: "/avatars/avatar-alchemist.svg",
    title: "Benin & Nok Specialist · Ibadan",
    bestScore: 12,
    bestTotal: 15,
    bestPct: 80,
    gamesPlayed: 16,
    triviaXP: 810,
  },
  {
    id: "scholar-emeka-okeke",
    name: "Emeka Okeke",
    avatar: "/avatars/avatar-pioneer.svg",
    title: "Nollywood & Highlife Archivist · Asaba",
    bestScore: 11,
    bestTotal: 15,
    bestPct: 73,
    gamesPlayed: 14,
    triviaXP: 680,
  },
  {
    id: "scholar-fatima-danjuma",
    name: "Fatima Danjuma",
    avatar: "/avatars/avatar-architect.svg",
    title: "Caliphate & Sahel Scholar · Sokoto",
    bestScore: 10,
    bestTotal: 15,
    bestPct: 67,
    gamesPlayed: 11,
    triviaXP: 540,
  },
];

/**
 * Computes leaderboard entries combining base scholars with the user's live profile and trivia history.
 */
export function getTriviaLeaderboard(
  profile: UserProfile,
  history: TriviaHistoryItem[] = []
): {
  entries: TriviaScholarEntry[];
  userEntry: TriviaScholarEntry;
  userRank: number;
} {
  const gamesPlayed = history.length;
  let bestScore = 0;
  let bestTotal = 15;
  let bestPct = 0;
  let totalTriviaXP = 0;

  history.forEach((h) => {
    totalTriviaXP += h.xpEarned || 0;
    if (h.pct > bestPct || (h.pct === bestPct && h.score > bestScore)) {
      bestPct = h.pct;
      bestScore = h.score;
      bestTotal = h.total;
    }
  });

  const username = profile.username?.trim() || "You";
  const userEntry: TriviaScholarEntry = {
    id: "user-current",
    name: username,
    avatar: profile.avatar || "/avatars/avatar-scholar.svg",
    title: gamesPlayed > 0
      ? bestPct >= 90
        ? "Naija Grandmaster · Contender"
        : bestPct >= 70
        ? "Rising Scholar · Challenger"
        : "Curious Learner · Aspirant"
      : "Scholarly Aspirant · New",
    bestScore,
    bestTotal,
    bestPct,
    gamesPlayed,
    triviaXP: totalTriviaXP,
    isUser: true,
  };

  const allEntries: TriviaScholarEntry[] = [
    ...BASE_COMMUNITY_SCHOLARS.map((s) => ({ ...s, isUser: false })),
    userEntry,
  ];

  // Sort by Best Accuracy % descending, then by Trivia XP descending, then by Games Played descending
  allEntries.sort((a, b) => {
    if (b.bestPct !== a.bestPct) return b.bestPct - a.bestPct;
    if (b.triviaXP !== a.triviaXP) return b.triviaXP - a.triviaXP;
    return b.gamesPlayed - a.gamesPlayed;
  });

  let userRank = 1;

  const rankedEntries = allEntries.map((entry, idx) => {
    const rank = idx + 1;
    let rankBadge = `#${rank}`;
    let badgeColor = "var(--text-mute)";

    if (rank === 1) {
      rankBadge = "🥇 1st";
      badgeColor = "var(--gold)";
    } else if (rank === 2) {
      rankBadge = "🥈 2nd";
      badgeColor = "#A0A0A0";
    } else if (rank === 3) {
      rankBadge = "🥉 3rd";
      badgeColor = "#CD7F32";
    }

    if (entry.isUser) {
      userRank = rank;
    }

    return {
      ...entry,
      rank,
      rankBadge,
      badgeColor,
    };
  });

  const computedUserEntry = rankedEntries.find((e) => e.isUser) || {
    ...userEntry,
    rank: userRank,
    rankBadge: `#${userRank}`,
    badgeColor: "var(--olive)",
  };

  return {
    entries: rankedEntries,
    userEntry: computedUserEntry,
    userRank,
  };
}
