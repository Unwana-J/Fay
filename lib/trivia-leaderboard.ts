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

export interface CloudTriviaScore {
  id: string;
  username: string;
  avatar: string;
  score: number;
  total: number;
  pct: number;
  grade_label?: string;
  xp_earned?: number;
  challenge_id?: string;
}

/**
 * Computes leaderboard entries combining live Supabase cloud scores and the user's local stats.
 * Zero dummy data: Only real players who have taken the quiz appear.
 */
export function getTriviaLeaderboard(
  profile: UserProfile,
  history: TriviaHistoryItem[] = [],
  cloudScores: CloudTriviaScore[] = []
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
        ? "Naija Grandmaster"
        : bestPct >= 70
        ? "Rising Scholar"
        : "Curious Learner"
      : "New Challenger",
    bestScore,
    bestTotal,
    bestPct,
    gamesPlayed,
    triviaXP: totalTriviaXP,
    isUser: true,
  };

  // Convert cloud scores into scholar entries (excluding current user to avoid duplicate)
  const cloudEntries: TriviaScholarEntry[] = (cloudScores || [])
    .filter((c) => c.username?.trim().toLowerCase() !== username.toLowerCase())
    .map((c) => ({
      id: `cloud-${c.id || c.username}`,
      name: c.username,
      avatar: c.avatar || "/avatars/avatar-scholar.svg",
      title: c.pct >= 90 ? "Naija Titan" : c.pct >= 70 ? "Scholar" : "Challenger",
      bestScore: c.score,
      bestTotal: c.total,
      bestPct: c.pct,
      gamesPlayed: 1,
      triviaXP: c.xp_earned || c.score * 5,
      isUser: false,
    }));

  // Only include user if they have played at least once OR if no cloud scores exist yet
  const allEntries: TriviaScholarEntry[] = [];

  cloudEntries.forEach((e) => allEntries.push(e));

  // Add the current user
  allEntries.push(userEntry);

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
