export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (stats: AchievementStats) => boolean;
  category: "streak" | "sessions" | "research" | "speaking" | "exploration" | "mastery";
}

export interface AchievementStats {
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  researchMinutes: number;
  speakingMinutes: number;
  topicsMastered: number;
  expertTopicsCompleted: number;
  uniqueCategories: number;
  constellationNodes: number;
  xp: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-flame",
    title: "First Flame",
    description: "Complete your very first session.",
    icon: "🔥",
    xpReward: 50,
    category: "sessions",
    condition: (s) => s.totalSessions >= 1,
  },
  {
    id: "week-warrior",
    title: "Week Warrior",
    description: "Maintain a 7-day streak.",
    icon: "📅",
    xpReward: 200,
    category: "streak",
    condition: (s) => s.longestStreak >= 7,
  },
  {
    id: "month-mind",
    title: "Month Mind",
    description: "Maintain a 30-day streak.",
    icon: "🌕",
    xpReward: 750,
    category: "streak",
    condition: (s) => s.longestStreak >= 30,
  },
  {
    id: "voice-unlocked",
    title: "Voice Unlocked",
    description: "Complete 10 speaking sessions.",
    icon: "🎙️",
    xpReward: 150,
    category: "speaking",
    condition: (s) => s.speakingMinutes >= 10,
  },
  {
    id: "deep-researcher",
    title: "Deep Researcher",
    description: "Accumulate 10 hours of research time.",
    icon: "🧬",
    xpReward: 300,
    category: "research",
    condition: (s) => s.researchMinutes >= 600,
  },
  {
    id: "century-scholar",
    title: "Century Scholar",
    description: "Complete 100 topics.",
    icon: "📚",
    xpReward: 1000,
    category: "sessions",
    condition: (s) => s.topicsMastered >= 100,
  },
  {
    id: "expert-speaker",
    title: "Expert Speaker",
    description: "Complete 50 speaking sessions.",
    icon: "⭐",
    xpReward: 500,
    category: "speaking",
    condition: (s) => s.speakingMinutes >= 50,
  },
  {
    id: "constellation",
    title: "Constellation",
    description: "Build a knowledge graph with 25 connected nodes.",
    icon: "🌌",
    xpReward: 400,
    category: "exploration",
    condition: (s) => s.constellationNodes >= 25,
  },
  {
    id: "master-thinker",
    title: "Master Thinker",
    description: "Complete 10 expert-difficulty topics.",
    icon: "🏆",
    xpReward: 600,
    category: "mastery",
    condition: (s) => s.expertTopicsCompleted >= 10,
  },
  {
    id: "polymath",
    title: "Polymath",
    description: "Complete topics in 8 different categories.",
    icon: "🧭",
    xpReward: 350,
    category: "exploration",
    condition: (s) => s.uniqueCategories >= 8,
  },
  {
    id: "curious-mind",
    title: "Curious Mind",
    description: "Complete 10 sessions.",
    icon: "🔍",
    xpReward: 150,
    category: "sessions",
    condition: (s) => s.totalSessions >= 10,
  },
  {
    id: "iron-will",
    title: "Iron Will",
    description: "Complete a 14-day streak.",
    icon: "💪",
    xpReward: 400,
    category: "streak",
    condition: (s) => s.longestStreak >= 14,
  },
];

export const XP_LEVELS = [
  { level: 1, title: "Curious Beginner", minXP: 0 },
  { level: 2, title: "Eager Learner", minXP: 300 },
  { level: 3, title: "Active Thinker", minXP: 700 },
  { level: 4, title: "Deep Diver", minXP: 1300 },
  { level: 5, title: "Knowledge Seeker", minXP: 2100 },
  { level: 6, title: "Critical Thinker", minXP: 3100 },
  { level: 7, title: "Deep Thinker", minXP: 4300 },
  { level: 8, title: "Expert Analyst", minXP: 5700 },
  { level: 9, title: "Master Thinker", minXP: 7500 },
  { level: 10, title: "Polymath", minXP: 10000 },
];

export function getLevelForXP(xp: number): (typeof XP_LEVELS)[0] {
  let level = XP_LEVELS[0];
  for (const l of XP_LEVELS) {
    if (xp >= l.minXP) level = l;
  }
  return level;
}

export function getNextLevel(xp: number): (typeof XP_LEVELS)[0] | null {
  const current = getLevelForXP(xp);
  const idx = XP_LEVELS.findIndex((l) => l.level === current.level);
  return XP_LEVELS[idx + 1] ?? null;
}

export function getLevelProgress(xp: number): number {
  const current = getLevelForXP(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const range = next.minXP - current.minXP;
  const earned = xp - current.minXP;
  return Math.min(100, Math.round((earned / range) * 100));
}

export function checkNewAchievements(stats: AchievementStats, alreadyUnlocked: string[]): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) => !alreadyUnlocked.includes(a.id) && a.condition(stats)
  );
}
