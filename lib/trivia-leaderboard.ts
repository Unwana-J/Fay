import type { UserProfile, TriviaHistoryItem } from "@/store/useAppStore";
import { sanitizeScholarName, isBlockedHateSpeech } from "@/lib/name-moderation";

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
  total_xp?: number;
  games_played?: number;
}

/**
 * Computes leaderboard entries combining live Supabase cloud scores and the user's local stats.
 *
 * Ranking criteria:
 * 1. Total Accumulated Trivia XP (Points grinded from games & high-stakes challenges)
 * 2. Number of unique games played (rewards consistency and active dedication)
 * 3. Best Accuracy % (Tie-breaker)
 * 4. Best raw score (Tie-breaker)
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

  const username = sanitizeScholarName(profile.username?.trim() || "You");
  const userEntry: TriviaScholarEntry = {
    id: "user-current",
    name: username,
    avatar: profile.avatar || "/avatars/avatar-scholar.svg",
    title:
      totalTriviaXP >= 500
        ? "Naija Grandmaster"
        : totalTriviaXP >= 250
        ? "Naija Titan"
        : totalTriviaXP >= 120
        ? "Rising Scholar"
        : gamesPlayed > 0
        ? "Curious Learner"
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
    .filter((c) => {
      if (!c.username) return false;
      if (isBlockedHateSpeech(c.username)) return false;
      return c.username.trim().toLowerCase() !== username.toLowerCase();
    })
    .map((c) => {
      const cleanName = sanitizeScholarName(c.username);
      const earnedXP = c.total_xp ?? c.xp_earned ?? (c.score || 0) * 5;
      const games = c.games_played ?? 1;

      return {
        id: `cloud-${c.id || cleanName}`,
        name: cleanName,
        avatar: c.avatar || "/avatars/avatar-scholar.svg",
        title:
          earnedXP >= 500
            ? "Naija Grandmaster"
            : earnedXP >= 250
            ? "Naija Titan"
            : earnedXP >= 120
            ? "Honor Scholar"
            : c.pct >= 90
            ? "Scholar"
            : "Challenger",
        bestScore: c.score,
        bestTotal: c.total,
        bestPct: c.pct,
        gamesPlayed: games,
        triviaXP: earnedXP,
        isUser: false,
      };
    });

  // Combine user entry and cloud entries
  const allEntries: TriviaScholarEntry[] = [...cloudEntries, userEntry];

  // Sort by Total Trivia XP descending (primary metric),
  // then by Games Played descending (rewards persistence & unique games),
  // then by Best Accuracy % descending,
  // then by Best Score descending
  allEntries.sort((a, b) => {
    if (b.triviaXP !== a.triviaXP) return b.triviaXP - a.triviaXP;
    if (b.gamesPlayed !== a.gamesPlayed) return b.gamesPlayed - a.gamesPlayed;
    if (b.bestPct !== a.bestPct) return b.bestPct - a.bestPct;
    return b.bestScore - a.bestScore;
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
