/**
 * Trivia Group Challenge Utilities
 *
 * Provides creation, state compression, time tracking, and persistence
 * for timed group trivia gauntlets and custom leaderboards.
 */

import LZString from "lz-string";
import {
  TRIVIA_QUESTIONS,
  type TriviaDifficultyFilter,
} from "./trivia-questions";

export interface TriviaChallenge {
  id: string;
  title: string;
  creatorName: string;
  createdAt: number;
  durationHours: number; // 2, 6, 24, 48, 168 (0 for no expiry)
  questionIds: string[];
  questionCount: number;
  difficulty: TriviaDifficultyFilter;
  creatorScore?: {
    score: number;
    total: number;
    pct: number;
    gradeLabel?: string;
  };
}

export interface ChallengeParticipantScore {
  id: string;
  username: string;
  avatar: string;
  score: number;
  total: number;
  pct: number;
  gradeLabel?: string;
  completedAt: number;
  timeSpentSeconds?: number;
}

export interface ChallengeTimeStatus {
  isExpired: boolean;
  status: "ACTIVE" | "CONCLUDED";
  elapsedText: string;
  remainingText: string;
  fullStatusText: string;
}

export interface DetailedCountdown {
  isExpired: boolean;
  isIndefinite: boolean;
  totalRemainingMs: number;
  totalDurationMs: number;
  elapsedMs: number;
  percentRemaining: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedClock: string;
  elapsedText: string;
  remainingText: string;
  fullStatusText: string;
}


export const DURATION_CHOICES = [
  { hours: 2, label: "2 Hours", desc: "Fast sprint" },
  { hours: 6, label: "6 Hours", desc: "Evening window" },
  { hours: 24, label: "24 Hours", desc: "Standard day" },
  { hours: 48, label: "48 Hours", desc: "Weekend cup" },
  { hours: 168, label: "7 Days", desc: "Week-long clash" },
];

/**
 * Creates a new TriviaChallenge with random shuffled questions from the pool.
 */
export function createTriviaChallenge(options: {
  title: string;
  creatorName: string;
  durationHours: number;
  questionCount: number;
  difficulty: TriviaDifficultyFilter;
  creatorScore?: TriviaChallenge["creatorScore"];
}): TriviaChallenge {
  const pool =
    options.difficulty === "random"
      ? TRIVIA_QUESTIONS
      : TRIVIA_QUESTIONS.filter((q) => q.difficulty === options.difficulty);

  // Shuffle and pick question IDs
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selectedIds = shuffled.slice(0, options.questionCount).map((q) => q.id);

  const id = `tc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    title: options.title.trim() || `${options.creatorName}'s Trivia Challenge`,
    creatorName: options.creatorName.trim() || "Scholar",
    createdAt: Date.now(),
    durationHours: options.durationHours,
    questionIds: selectedIds,
    questionCount: selectedIds.length,
    difficulty: options.difficulty,
    creatorScore: options.creatorScore,
  };
}

/**
 * Calculates human-readable time elapsed and remaining countdown.
 */
export function getChallengeTimeStatus(challenge: TriviaChallenge): ChallengeTimeStatus {
  const now = Date.now();
  const elapsedMs = Math.max(0, now - challenge.createdAt);

  // Format elapsed time
  let elapsedText: string;
  if (elapsedMs < 60_000) {
    elapsedText = "Active for < 1 min";
  } else if (elapsedMs < 3600_000) {
    const mins = Math.floor(elapsedMs / 60_000);
    elapsedText = `Active for ${mins}m`;
  } else {
    const hrs = Math.floor(elapsedMs / 3600_000);
    const mins = Math.floor((elapsedMs % 3600_000) / 60_000);
    elapsedText = mins > 0 ? `Active for ${hrs}h ${mins}m` : `Active for ${hrs}h`;
  }

  // If no duration set (open challenge)
  if (!challenge.durationHours || challenge.durationHours <= 0) {
    return {
      isExpired: false,
      status: "ACTIVE",
      elapsedText,
      remainingText: "Open indefinitely",
      fullStatusText: `${elapsedText} · Open indefinitely`,
    };
  }

  const expiresAt = challenge.createdAt + challenge.durationHours * 3600 * 1000;
  const remainingMs = expiresAt - now;
  const isExpired = remainingMs <= 0;

  let remainingText: string;
  if (isExpired) {
    remainingText = "Concluded";
  } else if (remainingMs < 3600_000) {
    const mins = Math.max(1, Math.floor(remainingMs / 60_000));
    remainingText = `Closes in ${mins}m`;
  } else {
    const hrs = Math.floor(remainingMs / 3600_000);
    const mins = Math.floor((remainingMs % 3600_000) / 60_000);
    remainingText = mins > 0 ? `Closes in ${hrs}h ${mins}m` : `Closes in ${hrs}h`;
  }

  return {
    isExpired,
    status: isExpired ? "CONCLUDED" : "ACTIVE",
    elapsedText,
    remainingText,
    fullStatusText: isExpired
      ? `Concluded · Ran for ${challenge.durationHours}h`
      : `${elapsedText} · ${remainingText}`,
  };
}

/**
 * Calculates a live-ticking digital countdown object with days, hours,
 * minutes, seconds, progress percentages, and status flags.
 */
export function getDetailedChallengeCountdown(challenge: TriviaChallenge): DetailedCountdown {
  const now = Date.now();
  const elapsedMs = Math.max(0, now - challenge.createdAt);

  let elapsedText: string;
  if (elapsedMs < 60_000) {
    elapsedText = "Active for < 1m";
  } else if (elapsedMs < 3600_000) {
    const mins = Math.floor(elapsedMs / 60_000);
    elapsedText = `Active for ${mins}m`;
  } else {
    const hrs = Math.floor(elapsedMs / 3600_000);
    const mins = Math.floor((elapsedMs % 3600_000) / 60_000);
    elapsedText = mins > 0 ? `Active for ${hrs}h ${mins}m` : `Active for ${hrs}h`;
  }

  if (!challenge.durationHours || challenge.durationHours <= 0) {
    return {
      isExpired: false,
      isIndefinite: true,
      totalRemainingMs: Infinity,
      totalDurationMs: Infinity,
      elapsedMs,
      percentRemaining: 100,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedClock: "∞",
      elapsedText,
      remainingText: "Open indefinitely",
      fullStatusText: `${elapsedText} · Open indefinitely`,
    };
  }

  const totalDurationMs = challenge.durationHours * 3600 * 1000;
  const expiresAt = challenge.createdAt + totalDurationMs;
  const remainingMs = Math.max(0, expiresAt - now);
  const isExpired = remainingMs <= 0;

  const percentRemaining = Math.max(0, Math.min(100, (remainingMs / totalDurationMs) * 100));

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const formattedClock =
    days > 0
      ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  let remainingText: string;
  if (isExpired) {
    remainingText = "Concluded";
  } else if (remainingMs < 60_000) {
    remainingText = `Closes in ${seconds}s`;
  } else if (remainingMs < 3600_000) {
    remainingText = `Closes in ${minutes}m ${seconds}s`;
  } else if (days > 0) {
    remainingText = `Closes in ${days}d ${hours}h`;
  } else {
    remainingText = `Closes in ${hours}h ${minutes}m`;
  }

  return {
    isExpired,
    isIndefinite: false,
    totalRemainingMs: remainingMs,
    totalDurationMs,
    elapsedMs,
    percentRemaining,
    days,
    hours,
    minutes,
    seconds,
    formattedClock,
    elapsedText,
    remainingText,
    fullStatusText: isExpired
      ? `Concluded · Ran for ${challenge.durationHours}h`
      : `${elapsedText} · ${remainingText}`,
  };
}


/**
 * URL State Compression (Zero-Database sharing via LZ-string)
 */
export function encodeChallengeToUrl(challenge: TriviaChallenge): string {
  try {
    const json = JSON.stringify(challenge);
    return LZString.compressToEncodedURIComponent(json);
  } catch (err) {
    console.error("Failed to encode challenge:", err);
    return "";
  }
}

export function decodeChallengeFromUrl(code: string): TriviaChallenge | null {
  try {
    let decompressed = LZString.decompressFromEncodedURIComponent(code);
    if (!decompressed && code.includes(" ")) {
      decompressed = LZString.decompressFromEncodedURIComponent(code.replace(/ /g, "+"));
    }
    if (!decompressed) {
      try {
        decompressed = LZString.decompressFromEncodedURIComponent(decodeURIComponent(code));
      } catch {}
    }
    if (!decompressed) return null;
    const parsed = JSON.parse(decompressed);
    if (parsed && parsed.id && Array.isArray(parsed.questionIds)) {
      return parsed as TriviaChallenge;
    }
    return null;
  } catch (err) {
    console.warn("Failed to decode challenge:", err);
    return null;
  }
}

/**
 * Local storage persistence helpers for peer offline fallback
 */
const CHALLENGE_STORE_KEY = "fey_trivia_challenges_v1";

export function saveLocalChallenge(challenge: TriviaChallenge): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(CHALLENGE_STORE_KEY);
    const map: Record<string, TriviaChallenge> = raw ? JSON.parse(raw) : {};
    map[challenge.id] = challenge;
    localStorage.setItem(CHALLENGE_STORE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Could not save local challenge:", e);
  }
}

export function getLocalChallenge(id: string): TriviaChallenge | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHALLENGE_STORE_KEY);
    if (!raw) return null;
    const map: Record<string, TriviaChallenge> = JSON.parse(raw);
    return map[id] || null;
  } catch (e) {
    return null;
  }
}

export function getAllLocalChallenges(): TriviaChallenge[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHALLENGE_STORE_KEY);
    if (!raw) return [];
    const map: Record<string, TriviaChallenge> = JSON.parse(raw);
    return Object.values(map).sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    return [];
  }
}

export interface RecordScoreResult {
  recorded: boolean;
  isFirstAttempt: boolean;
  officialScore: ChallengeParticipantScore;
}

export function getUserChallengeAttempt(challengeId: string, username: string): ChallengeParticipantScore | null {
  if (typeof window === "undefined" || !username) return null;
  const scores = getLocalChallengeScores(challengeId);
  return scores.find((s) => s.username.trim().toLowerCase() === username.trim().toLowerCase()) || null;
}

export function recordLocalChallengeScore(
  challengeId: string,
  score: ChallengeParticipantScore
): RecordScoreResult {
  if (typeof window === "undefined") {
    return { recorded: false, isFirstAttempt: false, officialScore: score };
  }
  try {
    const key = `fey_tc_${challengeId}_scores`;
    const raw = localStorage.getItem(key);
    const scores: ChallengeParticipantScore[] = raw ? JSON.parse(raw) : [];

    // Strictly lock challenge leaderboard: only the FIRST attempt is logged
    const existing = scores.find(
      (s) => s.username.trim().toLowerCase() === score.username.trim().toLowerCase()
    );

    if (existing) {
      // Score is locked from first attempt
      return {
        recorded: false,
        isFirstAttempt: false,
        officialScore: existing,
      };
    }

    scores.push(score);
    localStorage.setItem(key, JSON.stringify(scores));
    return {
      recorded: true,
      isFirstAttempt: true,
      officialScore: score,
    };
  } catch (e) {
    console.warn("Could not record local challenge score:", e);
    return { recorded: false, isFirstAttempt: false, officialScore: score };
  }
}

export function getLocalChallengeScores(challengeId: string): ChallengeParticipantScore[] {
  if (typeof window === "undefined") return [];
  try {
    const key = `fey_tc_${challengeId}_scores`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const list: ChallengeParticipantScore[] = JSON.parse(raw);
    return list.sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct;
      if (b.score !== a.score) return b.score - a.score;
      return (a.timeSpentSeconds || 999) - (b.timeSpentSeconds || 999);
    });
  } catch (e) {
    return [];
  }
}
