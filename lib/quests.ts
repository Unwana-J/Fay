import { todayStr } from "@/lib/utils";
import type { CompletedSession, StreakData } from "@/store/useAppStore";

export interface DailyQuest {
  id: string;
  key: string;
  title: string;
  description: string;
  rewardXP: number;
  icon: string;
  target: number;
  current: number;
  completed: boolean;
  claimed: boolean;
}

export function getDailyQuests(
  sessions: CompletedSession[],
  streak: StreakData,
  claimedQuestIds: string[] = []
): DailyQuest[] {
  const today = todayStr();
  const todaysSessions = sessions.filter((s) => s.date === today);

  // Quest 1: Complete at least 1 Feynman articulation today
  const q1SessionsCount = todaysSessions.length;
  const q1Completed = q1SessionsCount >= 1;
  const q1Id = `${today}-daily-speech`;

  // Quest 2: Vocal Conviction — record at least 45 seconds of speech in a session
  const longestSpeechToday = todaysSessions.reduce(
    (max, s) => Math.max(max, s.speakingSeconds),
    0
  );
  const q2Completed = longestSpeechToday >= 45;
  const q2Id = `${today}-vocal-conviction`;

  // Quest 3: Deep Reflection or High Confidence (ratings.confidence >= 4)
  const highConfidenceSessions = todaysSessions.filter(
    (s) => s.ratings && s.ratings.confidence >= 4
  ).length;
  const q3Completed = highConfidenceSessions >= 1;
  const q3Id = `${today}-clarity-mastery`;

  return [
    {
      id: q1Id,
      key: "daily-speech",
      title: "The Daily Voice",
      description: "Record at least one vocal Feynman articulation today.",
      rewardXP: 40,
      icon: "🎙️",
      target: 1,
      current: Math.min(1, q1SessionsCount),
      completed: q1Completed,
      claimed: claimedQuestIds.includes(q1Id),
    },
    {
      id: q2Id,
      key: "vocal-conviction",
      title: "Sustained Articulation",
      description: "Speak for at least 45 seconds during your vocal synthesis.",
      rewardXP: 50,
      icon: "⚡",
      target: 45,
      current: Math.min(45, longestSpeechToday),
      completed: q2Completed,
      claimed: claimedQuestIds.includes(q2Id),
    },
    {
      id: q3Id,
      key: "clarity-mastery",
      title: "Conviction & Clarity",
      description: "Complete a sprint scoring 4 or higher on confidence.",
      rewardXP: 60,
      icon: "📜",
      target: 1,
      current: Math.min(1, highConfidenceSessions),
      completed: q3Completed,
      claimed: claimedQuestIds.includes(q3Id),
    },
  ];
}
