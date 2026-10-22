import type { UserProfile } from "@/store/useAppStore";
import { sanitizeScholarName } from "@/lib/name-moderation";

export interface MathleticsScholarEntry {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bestScore: number;
  bestTotal: number;
  bestPct: number;
  gamesPlayed: number;
  mathleticsXP: number;
  isUser: boolean;
  rank?: number;
  rankBadge?: string;
  badgeColor?: string;
  historicalBio?: string;
}

export interface MathleticsHistoryRecord {
  id: string;
  timestamp: number;
  date: string;
  score: number;
  total: number;
  pct: number;
  gradeLabel: string;
  xpEarned: number;
  questionIds: string[];
}

/**
 * Historical benchmark titans of mathematics for the Mathletics Arena.
 */
const TITAN_MATHEMATICIANS: Omit<MathleticsScholarEntry, "rank" | "rankBadge" | "badgeColor">[] = [
  {
    id: "titan-gauss",
    name: "Carl Friedrich Gauss",
    avatar: "/avatars/avatar-scholar.svg",
    title: "Prince of Mathematicians",
    bestScore: 10,
    bestTotal: 10,
    bestPct: 100,
    gamesPlayed: 120,
    mathleticsXP: 1250,
    isUser: false,
    historicalBio: "Summed 1 to 100 in seconds as a schoolboy; pioneer of number theory and modular arithmetic.",
  },
  {
    id: "titan-hypatia",
    name: "Hypatia of Alexandria",
    avatar: "/avatars/avatar-scholar.svg",
    title: "Alexandrian Sage",
    bestScore: 10,
    bestTotal: 10,
    bestPct: 98,
    gamesPlayed: 94,
    mathleticsXP: 980,
    isUser: false,
    historicalBio: "Legendary mathematician and astronomer; master of conic sections and the astrolabe.",
  },
  {
    id: "titan-ramanujan",
    name: "Srinivasa Ramanujan",
    avatar: "/avatars/avatar-scholar.svg",
    title: "Intuitive Oracle",
    bestScore: 10,
    bestTotal: 10,
    bestPct: 97,
    gamesPlayed: 88,
    mathleticsXP: 920,
    isUser: false,
    historicalBio: "Saw infinite series in dreams; genius of mock theta functions, partitions, and taxicab numbers.",
  },
  {
    id: "titan-chike-obi",
    name: "Prof. Chike Obi",
    avatar: "/avatars/avatar-scholar.svg",
    title: "Titan of Nigerian Mathematics",
    bestScore: 10,
    bestTotal: 10,
    bestPct: 95,
    gamesPlayed: 82,
    mathleticsXP: 860,
    isUser: false,
    historicalBio: "First Nigerian to earn a PhD in mathematics; renowned for periodic solutions of non-linear ODEs.",
  },
  {
    id: "titan-euler",
    name: "Leonhard Euler",
    avatar: "/avatars/avatar-scholar.svg",
    title: "Analysis Master",
    bestScore: 10,
    bestTotal: 10,
    bestPct: 95,
    gamesPlayed: 75,
    mathleticsXP: 800,
    isUser: false,
    historicalBio: "History's most prolific author; gave us e, i, π, and solved the Seven Bridges of Königsberg.",
  },
  {
    id: "titan-lovelace",
    name: "Ada Lovelace",
    avatar: "/avatars/avatar-scholar.svg",
    title: "First Programmer",
    bestScore: 9,
    bestTotal: 10,
    bestPct: 90,
    gamesPlayed: 64,
    mathleticsXP: 680,
    isUser: false,
    historicalBio: "Recognized that computing engines could manipulate symbols, not just numbers.",
  },
  {
    id: "titan-noether",
    name: "Emmy Noether",
    avatar: "/avatars/avatar-scholar.svg",
    title: "Architect of Symmetry",
    bestScore: 9,
    bestTotal: 10,
    bestPct: 90,
    gamesPlayed: 58,
    mathleticsXP: 620,
    isUser: false,
    historicalBio: "Connected symmetry with conservation laws, laying the foundations of modern theoretical physics.",
  },
  {
    id: "titan-khwarizmi",
    name: "Muhammad al-Khwarizmi",
    avatar: "/avatars/avatar-scholar.svg",
    title: "Father of Algebra",
    bestScore: 8,
    bestTotal: 10,
    bestPct: 88,
    gamesPlayed: 50,
    mathleticsXP: 540,
    isUser: false,
    historicalBio: "Pioneered systematic methods for solving linear and quadratic equations (al-jabr).",
  },
  {
    id: "titan-johnson",
    name: "Katherine Johnson",
    avatar: "/avatars/avatar-scholar.svg",
    title: "Celestial Navigator",
    bestScore: 8,
    bestTotal: 10,
    bestPct: 85,
    gamesPlayed: 45,
    mathleticsXP: 480,
    isUser: false,
    historicalBio: "Calculated orbital trajectories for Mercury and Apollo 11 with mental and manual precision.",
  },
];

/**
 * Computes Mathletics leaderboard ranking combining Titans and User's stats.
 */
export function getMathleticsLeaderboard(
  profile: UserProfile,
  history: MathleticsHistoryRecord[] = []
): {
  entries: MathleticsScholarEntry[];
  userEntry: MathleticsScholarEntry;
  userRank: number;
} {
  const gamesPlayed = history.length;
  let bestScore = 0;
  let bestTotal = 10;
  let bestPct = 0;
  let totalXP = 0;

  history.forEach((h) => {
    totalXP += h.xpEarned || 0;
    if (h.pct > bestPct || (h.pct === bestPct && h.score > bestScore)) {
      bestPct = h.pct;
      bestScore = h.score;
      bestTotal = h.total;
    }
  });

  const username = sanitizeScholarName(profile.username?.trim() || "You");

  const userEntry: MathleticsScholarEntry = {
    id: "user-current",
    name: username,
    avatar: profile.avatar || "/avatars/avatar-scholar.svg",
    title:
      totalXP >= 600
        ? "Mathletics Grandmaster"
        : totalXP >= 350
        ? "Analytical Titan"
        : totalXP >= 150
        ? "Sharp Calculator"
        : gamesPlayed > 0
        ? "Aspiring Mathlete"
        : "New Challenger",
    bestScore,
    bestTotal,
    bestPct,
    gamesPlayed,
    mathleticsXP: totalXP,
    isUser: true,
  };

  const allEntries: MathleticsScholarEntry[] = [...TITAN_MATHEMATICIANS, userEntry];

  // Sort primarily by mathleticsXP descending, then gamesPlayed, then bestPct
  allEntries.sort((a, b) => {
    if (b.mathleticsXP !== a.mathleticsXP) return b.mathleticsXP - a.mathleticsXP;
    if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
    return b.bestPct - a.bestPct;
  });

  let userRank = 1;

  const rankedEntries = allEntries.map((entry, idx) => {
    const rank = idx + 1;
    let rankBadge = `#${rank}`;
    let badgeColor = "var(--text-dim)";

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
