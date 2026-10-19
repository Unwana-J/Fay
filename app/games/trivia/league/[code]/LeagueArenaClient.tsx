"use client";

import { useState, useEffect, useMemo, useRef, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Zap,
  ChevronRight,
  Loader2,
  ShieldCheck,
  RotateCcw,
  Users,
  Award,
  Lock,
  Plus,
  Infinity,
  Crown,
  Trash2,
  ShieldAlert,
  X,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { FeyLogo } from "@/components/ui/FeyLogo";
import {
  type FriendshipLeague,
  type LeagueDailyScore,
  type LeagueLeaderboardEntry,
  getLeagueStatus,
  getQuestionsForLeagueDay,
  calculateLeaguePoints,
  aggregateLeagueLeaderboard,
  generateDailyLeagueQuestions,
  mergeLeagueState,
  saveLocalLeague,
  removeLocalLeague,
  getLeagueShareUrl,
  normalizeLeagueScoreRow,
} from "@/lib/trivia-league";
import {
  fetchAndApplyAnswerOverrides,
  subscribeAnswerOverrides,
  isAnswerAccepted,
} from "@/lib/trivia-answer-overrides";
import ContestAnswerButton from "@/components/trivia/ContestAnswerButton";
import { TRIVIA_QUESTIONS, type TriviaQuestion } from "@/lib/trivia-questions";
import { playAudioTone } from "@/lib/sound";
import confetti from "canvas-confetti";
import UserAvatar from "@/components/ui/UserAvatar";
import { todayStr, cn } from "@/lib/utils";

interface LeagueArenaClientProps {
  code?: string;
  initialLeague: FriendshipLeague;
  initialScores: LeagueDailyScore[];
  initialLeaderboard: LeagueLeaderboardEntry[];
}

export default function LeagueArenaClient({
  code,
  initialLeague,
  initialScores,
  initialLeaderboard,
}: LeagueArenaClientProps) {
  const router = useRouter();
  const { profile, addXP, saveTriviaRound, openClaimAccountPrompt } = useAppStore();

  const [league, setLeague] = useState<FriendshipLeague>(initialLeague);
  const [scores, setScores] = useState<LeagueDailyScore[]>(initialScores);
  const [leaderboard, setLeaderboard] = useState<LeagueLeaderboardEntry[]>(initialLeaderboard);

  // Hydrate custom league created locally & local scores if available.
  // ALWAYS merge with server state so stale localStorage never clobbers host unlocks or bonus questions!
  useEffect(() => {
    const leagueCode = code || initialLeague.code;
    if (typeof window !== "undefined" && leagueCode) {
      try {
        const stored = localStorage.getItem(`fey_league_${leagueCode}`);
        let activeLeague = initialLeague;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.code) {
            activeLeague = mergeLeagueState(initialLeague, parsed);
            setLeague(activeLeague);

            // If this user is the Host and their local device had unlocked drops, added extra drops,
            // or added bonus questions that haven't synced to the server yet, push them to cloud automatically!
            const cleanUser = (profile.username || "Scholar").trim().toLowerCase();
            const isHostUser =
              (activeLeague.creatorName || "").trim().toLowerCase() === cleanUser ||
              (profile.id && activeLeague.creatorId === profile.id);

            const serverUnlocked = Number(
              initialLeague.unlockedUpToDay || (initialLeague.dailySeedMap as any)?._unlockedUpToDay || 1
            );
            const mergedUnlocked = Number(
              activeLeague.unlockedUpToDay || (activeLeague.dailySeedMap as any)?._unlockedUpToDay || 1
            );
            const hasMoreDrops = (activeLeague.durationDays || 5) > (initialLeague.durationDays || 5);
            const hasMoreQuestions = Object.keys(activeLeague.dailySeedMap || {}).some((k) => {
              if (!k.startsWith("day_")) return false;
              const a = Array.isArray(activeLeague.dailySeedMap?.[k]) ? activeLeague.dailySeedMap[k].length : 0;
              const b = Array.isArray(initialLeague.dailySeedMap?.[k]) ? initialLeague.dailySeedMap[k].length : 0;
              return a > b;
            });

            if (isHostUser && (mergedUnlocked > serverUnlocked || hasMoreDrops || hasMoreQuestions)) {
              fetch("/api/trivia/league", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  code: activeLeague.code,
                  unlockedUpToDay: mergedUnlocked,
                  newDuration: activeLeague.durationDays,
                  attemptPolicy: activeLeague.attemptPolicy,
                  dailySeedMap: activeLeague.dailySeedMap,
                }),
              }).catch(() => {});
            }
          }
        }

        // Persist for team members / visiting players so it's always in their "My Leagues"
        saveLocalLeague(activeLeague);

        // Hydrate local scores and merge with initialScores
        const storedScoresRaw = localStorage.getItem(`fey_league_scores_${leagueCode}`);
        let localScores: LeagueDailyScore[] = storedScoresRaw ? JSON.parse(storedScoresRaw) : [];

        // Check for abandoned in-flight session from previous exit / page close
        const inFlightRaw = localStorage.getItem(`fey_league_in_flight_${leagueCode}`);
        if (inFlightRaw) {
          try {
            const session = JSON.parse(inFlightRaw);
            if (session && session.dayNumber) {
              const myUserKey = (profile.username || "Scholar").trim().toLowerCase();
              const alreadyScored = localScores.some(
                (s) =>
                  s.dayNumber === session.dayNumber &&
                  ((s.username || "").trim().toLowerCase() === myUserKey ||
                    (profile.id && s.userId === profile.id))
              );

              if (!alreadyScored || session.isBonusRound) {
                const answeredMap = new Map<string, { questionId: string; correct: boolean; selected: number }>(
                  (session.questionResults || []).map((r: { questionId: string; correct: boolean; selected: number }) => [
                    r.questionId,
                    r,
                  ])
                );
                const finalResults: Array<{ questionId: string; correct: boolean; selected: number }> = [];
                for (const qId of session.questionIds || []) {
                  if (answeredMap.has(qId)) {
                    finalResults.push(answeredMap.get(qId)!);
                  } else {
                    finalResults.push({ questionId: qId, correct: false, selected: -1 });
                  }
                }

                const roundCorrect = finalResults.filter((r) => r.correct).length;
                const totalCorrect = session.isBonusRound
                  ? (session.bonusBaseScore || 0) + roundCorrect
                  : roundCorrect;
                const totalQuestionsCount = session.isBonusRound
                  ? (session.bonusBaseTotal || 0) + finalResults.length
                  : finalResults.length;
                const totalDuration = session.isBonusRound
                  ? (session.bonusBaseDuration || 0) + (session.elapsedSeconds || 10)
                  : (session.elapsedSeconds || 10);
                const mergedResults = session.isBonusRound
                  ? [...(session.existingBonusResults || []), ...finalResults]
                  : finalResults;
                const finalPoints = calculateLeaguePoints(totalCorrect, totalQuestionsCount, totalDuration);

                const abandonedScore: LeagueDailyScore = {
                  id: `score_${Date.now()}_abandoned`,
                  leagueCode: activeLeague.code,
                  userId: profile.id || myUserKey,
                  username: profile.username || "Scholar",
                  avatar: profile.avatar || "/avatars/avatar-scholar.svg",
                  dayNumber: session.dayNumber,
                  date: todayStr(),
                  score: totalCorrect,
                  totalQuestions: totalQuestionsCount,
                  points: finalPoints,
                  durationSeconds: totalDuration,
                  questionResults: mergedResults,
                  createdAt: new Date().toISOString(),
                };

                localScores = [
                  ...localScores.filter(
                    (s) =>
                      !(
                        s.dayNumber === session.dayNumber &&
                        ((s.username || "").trim().toLowerCase() === myUserKey ||
                          (profile.id && s.userId === profile.id))
                      )
                  ),
                  abandonedScore,
                ];
                localStorage.setItem(`fey_league_scores_${leagueCode}`, JSON.stringify(localScores));

                fetch("/api/trivia/league/score", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    leagueCode: activeLeague.code,
                    userId: profile.id,
                    username: profile.username || "Scholar",
                    avatar: profile.avatar || "/avatars/avatar-scholar.svg",
                    dayNumber: session.dayNumber,
                    score: totalCorrect,
                    totalQuestions: totalQuestionsCount,
                    durationSeconds: totalDuration,
                    questionResults: mergedResults,
                    isBonusExtension: !!session.isBonusRound,
                  }),
                }).catch(() => {});

                setAttemptFeedback(
                  `⚠️ An unfinished session for Drop ${session.dayNumber} was saved. Your score (${totalCorrect}/${totalQuestionsCount}) has been recorded and Drop ${session.dayNumber} is locked until the next drop unlocks.`
                );
              }
            }
          } catch (err) {
            console.error("Failed to recover in-flight session:", err);
          } finally {
            localStorage.removeItem(`fey_league_in_flight_${leagueCode}`);
          }
        }

        if (localScores.length > 0 || initialScores.length > 0) {
          const scoreMap = new Map<string, LeagueDailyScore>();
          for (const s of initialScores) {
            const playerKey = (s.username || s.userId || "").trim().toLowerCase();
            scoreMap.set(`${playerKey}_${s.dayNumber}`, s);
          }
          for (const s of localScores) {
            const playerKey = (s.username || s.userId || "").trim().toLowerCase();
            const existing = scoreMap.get(`${playerKey}_${s.dayNumber}`);
            if (
              !existing ||
              (s.totalQuestions || 0) > (existing.totalQuestions || 0) ||
              s.points >= existing.points
            ) {
              scoreMap.set(`${playerKey}_${s.dayNumber}`, s);
            }
          }
          const merged = Array.from(scoreMap.values()).map(normalizeLeagueScoreRow);
          setScores(merged);
          const currentStatus = getLeagueStatus(activeLeague.startDate, activeLeague.durationDays);
          setLeaderboard(aggregateLeagueLeaderboard(merged, currentStatus.dayNumber));
        }
      } catch {}
    }
  }, [code, initialLeague, initialScores, profile.username, profile.id]);

  // Pull accepted answer contests and regrade scores + leaderboard whenever overrides change
  useEffect(() => {
    const regrade = () => {
      setScores((prev) => {
        const next = prev.map(normalizeLeagueScoreRow);
        const st = getLeagueStatus(league.startDate, league.durationDays);
        setLeaderboard(aggregateLeagueLeaderboard(next, st.dayNumber));
        return next;
      });
    };
    const unsubscribe = subscribeAnswerOverrides(regrade);
    fetchAndApplyAnswerOverrides();
    return unsubscribe;
  }, [league.startDate, league.durationDays]);

  const [phase, setPhase] = useState<"overview" | "playing" | "round_summary">("overview");

  // Game Play State
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [elapsedRoundSeconds, setElapsedRoundSeconds] = useState(0);
  const timerMode = league.timerMode || "per_question";
  const defaultQTimer = league.questionTimerSeconds || 25;
  const defaultDropBank = league.totalDropSeconds || ((league.questionsPerDay || 5) * 30);

  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(defaultQTimer);
  const [dropTimeLeft, setDropTimeLeft] = useState<number>(defaultDropBank);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [questionResults, setQuestionResults] = useState<
    Array<{ questionId: string; correct: boolean; selected: number }>
  >([]);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);
  const [attemptFeedback, setAttemptFeedback] = useState<string>("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Bonus Extension Round State
  const [isBonusRound, setIsBonusRound] = useState(false);
  const [bonusBaseScore, setBonusBaseScore] = useState(0);
  const [bonusBaseTotal, setBonusBaseTotal] = useState(0);
  const [bonusBaseDuration, setBonusBaseDuration] = useState(0);
  const [existingBonusResults, setExistingBonusResults] = useState<
    Array<{ questionId: string; correct: boolean; selected: number }>
  >([]);

  // Time remaining to next drop (midnight)
  const [timeToNextDrop, setTimeToNextDrop] = useState("");

  const status = getLeagueStatus(league.startDate, league.durationDays);
  const currentDay = status.dayNumber;

  const maxScoredDay = useMemo(() => {
    let max = 1;
    for (const s of scores) {
      if (s.dayNumber > max) max = s.dayNumber;
    }
    return max;
  }, [scores]);

  const rawUnlockedUpToDay: number = Number(
    league.unlockedUpToDay || (league.dailySeedMap as Record<string, unknown>)?._unlockedUpToDay || 1
  );

  const unlockedUpToDay: number = useMemo(() => {
    if (league.attemptPolicy === "flexible" || league.attemptPolicy === "unlimited") {
      return league.durationDays;
    }
    if (league.attemptPolicy === "strict") {
      return Math.max(rawUnlockedUpToDay, currentDay, maxScoredDay);
    }
    return Math.max(rawUnlockedUpToDay, maxScoredDay);
  }, [league.attemptPolicy, league.durationDays, rawUnlockedUpToDay, currentDay, maxScoredDay]);

  const isPacedByHostOrSchedule =
    league.attemptPolicy === "host_controlled" || league.attemptPolicy === "strict";

  const [activeDropDay, setActiveDropDay] = useState<number>(currentDay);

  // Check if current user has already completed drops
  const myUsername = (profile.username || "Scholar").trim().toLowerCase();
  const myIdentifier = profile.id || myUsername;

  // Map of scores per day for this scholar
  const myScoresByDay = useMemo(() => {
    const map = new Map<number, LeagueDailyScore>();
    for (const s of scores) {
      const match =
        (s.username || "").trim().toLowerCase() === myUsername ||
        (profile.id && s.userId === profile.id);
      if (match) {
        const existing = map.get(s.dayNumber);
        if (
          !existing ||
          (s.totalQuestions || 0) > (existing.totalQuestions || 0) ||
          s.points > existing.points
        ) {
          map.set(s.dayNumber, s);
        }
      }
    }
    return map;
  }, [scores, myUsername, profile.id]);

  const myTodayScore = myScoresByDay.get(currentDay);
  const hasCompletedToday = Boolean(myTodayScore);

  // Find next uncompleted drop in tournament for instant sequential progression
  const nextUncompletedDay = useMemo(() => {
    for (let day = 1; day <= league.durationDays; day++) {
      if (!myScoresByDay.has(day)) return day;
    }
    return null;
  }, [league.durationDays, myScoresByDay]);

  const isNextDayLockedByHost = Boolean(
    isPacedByHostOrSchedule && nextUncompletedDay && nextUncompletedDay > unlockedUpToDay
  );

  const [isUpdatingLeague, setIsUpdatingLeague] = useState(false);

  // Check if current user is the host/creator of this league
  const isCreator = useMemo(() => {
    if (typeof window === "undefined") return false;
    const cleanUser = (profile.username || "Scholar").trim().toLowerCase();
    const creatorUser = (league.creatorName || "").trim().toLowerCase();
    if (creatorUser && cleanUser && creatorUser === cleanUser) return true;
    if (league.creatorId && profile.id && league.creatorId === profile.id) return true;
    try {
      const local = localStorage.getItem(`fey_league_${league.code}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (
          parsed.creatorName?.trim().toLowerCase() === cleanUser ||
          (profile.id && parsed.creatorId === profile.id)
        ) {
          return true;
        }
      }
    } catch {}
    return false;
  }, [league.creatorName, league.creatorId, league.code, profile.username, profile.id]);

  async function handleAddExtraDrops(count: number) {
    if (isUpdatingLeague) return;
    setIsUpdatingLeague(true);
    try {
      const newDuration = league.durationDays + count;
      const updatedSeedMap: Record<string, string[]> = { ...(league.dailySeedMap || {}) };

      for (let d = league.durationDays + 1; d <= newDuration; d++) {
        if (!updatedSeedMap[`day_${d}`]) {
          const extraMap = generateDailyLeagueQuestions(
            1,
            league.questionsPerDay || 5,
            league.difficulty || "mixed",
            league.category || "all",
            `${league.code}_DAY_${d}`
          );
          updatedSeedMap[`day_${d}`] = extraMap["day_1"] || [];
        }
      }

      const updatedLeague: FriendshipLeague = {
        ...league,
        durationDays: newDuration,
        dailySeedMap: updatedSeedMap,
      };

      setLeague(updatedLeague);
      saveLocalLeague(updatedLeague);

      await fetch("/api/trivia/league", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: league.code,
          extraDrops: count,
          newDuration,
          attemptPolicy: league.attemptPolicy,
        }),
      });

      setAttemptFeedback(`🎉 Added ${count} extra drop${count > 1 ? "s" : ""}! Tournament expanded to ${newDuration} drops.`);
    } catch (err) {
      console.error("Failed to add extra drops:", err);
    } finally {
      setIsUpdatingLeague(false);
    }
  }

  async function handleToggleUnlimitedDrops() {
    if (isUpdatingLeague) return;
    setIsUpdatingLeague(true);
    try {
      const newDuration = Math.max(league.durationDays, 30);
      const updatedSeedMap: Record<string, any> = { ...(league.dailySeedMap || {}), _policy: "unlimited" };

      for (let d = league.durationDays + 1; d <= newDuration; d++) {
        if (!updatedSeedMap[`day_${d}`]) {
          const extraMap = generateDailyLeagueQuestions(
            1,
            league.questionsPerDay || 5,
            league.difficulty || "mixed",
            league.category || "all",
            `${league.code}_DAY_${d}`
          );
          updatedSeedMap[`day_${d}`] = extraMap["day_1"] || [];
        }
      }

      const updatedLeague: FriendshipLeague = {
        ...league,
        durationDays: newDuration,
        attemptPolicy: "unlimited",
        dailySeedMap: updatedSeedMap,
      };

      setLeague(updatedLeague);
      saveLocalLeague(updatedLeague);

      await fetch("/api/trivia/league", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: league.code,
          newDuration,
          attemptPolicy: "unlimited",
        }),
      });

      setAttemptFeedback("♾️ Unlimited Marathon Drops enabled! Drops will continuously unlock as you complete each one.");
    } catch (err) {
      console.error("Failed to enable unlimited drops:", err);
    } finally {
      setIsUpdatingLeague(false);
    }
  }

  async function handleDeleteTournament() {
    const isHost = isCreator;
    const message = isHost
      ? `Permanently delete "${league.title}"? This will delete the tournament and its leaderboard for all scholars.`
      : `Remove "${league.title}" from your tournaments?`;

    if (!confirm(message)) return;

    removeLocalLeague(league.code);

    try {
      const q = new URLSearchParams({ code: league.code });
      if (profile.id) q.set("userId", profile.id);
      if (profile.username) q.set("username", profile.username);

      await fetch(`/api/trivia/league?${q.toString()}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Failed to delete tournament in cloud:", err);
    }

    router.push("/games/trivia");
  }

  // Countdown timer to midnight
  useEffect(() => {
    function updateCountdown() {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeToNextDrop(
        `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`
      );
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Host power: Unlock next drop for all players in this league
  async function handleUnlockDrop(targetDay: number) {
    if (isUpdatingLeague) return;
    setIsUpdatingLeague(true);
    try {
      const updatedSeedMap: Record<string, any> = {
        ...(league.dailySeedMap || {}),
        _unlockedUpToDay: targetDay,
      };

      const updatedLeague: FriendshipLeague = {
        ...league,
        unlockedUpToDay: targetDay,
        dailySeedMap: updatedSeedMap,
      };

      setLeague(updatedLeague);
      saveLocalLeague(updatedLeague);

      await fetch("/api/trivia/league", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: league.code,
          unlockedUpToDay: targetDay,
          dailySeedMap: updatedSeedMap,
        }),
      });

      playAudioTone(880, "sine", 0.2);
      setAttemptFeedback(`🎉 Drop ${targetDay} unlocked! All scholars can now play Drop ${targetDay}.`);
    } catch (err) {
      console.error("Failed to unlock drop:", err);
    } finally {
      setIsUpdatingLeague(false);
    }
  }

  // Host power: Add dynamic bonus questions to any day's drop (reopening it for all players)
  async function handleAddQuestionsToDay(targetDay: number, count: number) {
    if (isUpdatingLeague) return;
    setIsUpdatingLeague(true);
    try {
      const currentDayKey = `day_${targetDay}`;
      const existingIds = new Set<string>(league.dailySeedMap?.[currentDayKey] || []);

      const available = TRIVIA_QUESTIONS.filter((q) => {
        if (existingIds.has(q.id)) return false;
        if (league.category && league.category !== "all") {
          return q.category.toLowerCase().includes(league.category.toLowerCase());
        }
        return true;
      });

      const pool = available.length >= count ? available : TRIVIA_QUESTIONS.filter((q) => !existingIds.has(q.id));
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const chosen = shuffled.slice(0, count).map((q) => q.id);

      const updatedSeedMap: Record<string, any> = {
        ...(league.dailySeedMap || {}),
        [currentDayKey]: [...(league.dailySeedMap?.[currentDayKey] || []), ...chosen],
      };

      const updatedLeague: FriendshipLeague = {
        ...league,
        dailySeedMap: updatedSeedMap,
      };

      setLeague(updatedLeague);
      saveLocalLeague(updatedLeague);

      await fetch("/api/trivia/league", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: league.code,
          dailySeedMap: updatedSeedMap,
        }),
      });

      playAudioTone(880, "sine", 0.2);
      setAttemptFeedback(
        `Added +${count} bonus questions to Drop ${targetDay}! Drop ${targetDay} is now reopened for all scholars.`
      );
    } catch (err) {
      console.error("Failed to add bonus questions to drop:", err);
    } finally {
      setIsUpdatingLeague(false);
    }
  }

  async function handleAddQuestionsToDrop(count: number) {
    return handleAddQuestionsToDay(activeDropDay, count);
  }

  // Start bonus round for a reopened drop
  function startBonusRound(targetDay: number) {
    const existingScore = myScoresByDay.get(targetDay);
    if (!existingScore) {
      startDailyRound(targetDay);
      return;
    }

    const allQuestions = getQuestionsForLeagueDay(league, targetDay);
    const existingResults = existingScore.questionResults || [];
    const answeredIds = new Set(existingResults.map((r) => r.questionId));
    const bonusQuestions = allQuestions.filter((q) => !answeredIds.has(q.id));

    if (bonusQuestions.length === 0) {
      setAttemptFeedback(`You have already completed all available questions for Drop ${targetDay}.`);
      return;
    }

    setActiveDropDay(targetDay);
    setIsBonusRound(true);
    setBonusBaseScore(existingScore.score);
    setBonusBaseTotal(existingResults.length || existingScore.totalQuestions || 5);
    setBonusBaseDuration(existingScore.durationSeconds || 0);
    setExistingBonusResults(existingResults);

    setQuestions(bonusQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setElapsedRoundSeconds(0);
    setCorrectCount(0);
    setQuestionResults([]);
    setRoundStartTime(Date.now());
    setAttemptFeedback("");
    setQuestionTimeLeft(league.questionTimerSeconds || 25);
    setDropTimeLeft(league.totalDropSeconds || (bonusQuestions.length * 30));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `fey_league_in_flight_${league.code}`,
          JSON.stringify({
            leagueCode: league.code,
            dayNumber: targetDay,
            isBonusRound: true,
            bonusBaseScore: existingScore.score,
            bonusBaseTotal: existingResults.length || existingScore.totalQuestions || 5,
            bonusBaseDuration: existingScore.durationSeconds || 0,
            existingBonusResults,
            startTime: Date.now(),
            elapsedSeconds: 0,
            questionIds: bonusQuestions.map((q) => q.id),
            questionResults: [],
            totalQuestions: bonusQuestions.length,
          })
        );
      } catch {}
    }

    setPhase("playing");
  }

  // Save in-flight progress to localStorage for recovery and anti-cheat enforcement
  const saveInFlightProgress = useCallback(
    (results: Array<{ questionId: string; correct: boolean; selected: number }>) => {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem(`fey_league_in_flight_${league.code}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.questionResults = results;
          parsed.elapsedSeconds = Math.max(5, Math.round((Date.now() - (parsed.startTime || Date.now())) / 1000));
          localStorage.setItem(`fey_league_in_flight_${league.code}`, JSON.stringify(parsed));
        }
      } catch {}
    },
    [league.code]
  );

  // Browser exit / tab close warning during active game drop
  useEffect(() => {
    if (phase !== "playing") return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Leaving now will save your current progress and permanently lock this drop.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [phase]);

  // Handle question timeout in per_question mode
  const handleQuestionTimeout = useCallback(() => {
    if (isAnswerRevealed) return;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setSelectedAnswer(-1);
    setIsAnswerRevealed(true);
    playAudioTone(220, "sawtooth", 0.25);

    setQuestionResults((prev) => {
      const next = [
        ...prev,
        { questionId: currentQ.id, correct: false, selected: -1 },
      ];
      saveInFlightProgress(next);
      return next;
    });
  }, [isAnswerRevealed, questions, currentIndex, saveInFlightProgress]);

  // Handle total drop clock expiration in total_bank mode
  const handleDropTimeout = useCallback(() => {
    const unanswered: Array<{ questionId: string; correct: boolean; selected: number }> = [];
    for (let i = currentIndex; i < questions.length; i++) {
      if (questions[i]) {
        unanswered.push({
          questionId: questions[i].id,
          correct: false,
          selected: -1,
        });
      }
    }
    const mergedResults = [...questionResults, ...unanswered];
    setQuestionResults(mergedResults);
    finishDailyRound(
      "⏱️ Drop clock expired! All remaining questions were marked incomplete.",
      mergedResults
    );
  }, [currentIndex, questions, questionResults]);

  // Gameplay timer loop: handles countdown (per_question or total_bank) and stopwatch
  useEffect(() => {
    if (phase !== "playing") return;

    const timer = setInterval(() => {
      setElapsedRoundSeconds((prev) => prev + 1);

      if (timerMode === "per_question") {
        if (!isAnswerRevealed) {
          setQuestionTimeLeft((prev) => {
            if (prev <= 1) {
              handleQuestionTimeout();
              return 0;
            }
            return prev - 1;
          });
        }
      } else {
        // total_bank mode: untimed per question, hard total drop clock
        setDropTimeLeft((prev) => {
          if (prev <= 1) {
            handleDropTimeout();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timerMode, isAnswerRevealed, handleQuestionTimeout, handleDropTimeout]);

  // If in unlimited drops marathon mode and user reaches the end, expand automatically
  useEffect(() => {
    if (league.attemptPolicy === "unlimited" && myScoresByDay.size >= league.durationDays && !isUpdatingLeague) {
      handleAddExtraDrops(3);
    }
  }, [league.attemptPolicy, league.durationDays, myScoresByDay.size, isUpdatingLeague]);

  function startDailyRound(targetDay?: number) {
    if (status.isCompleted) return;

    const dayToPlay =
      typeof targetDay === "number"
        ? targetDay
        : nextUncompletedDay ?? currentDay;

    // Check if drop is host locked
    if (isPacedByHostOrSchedule && dayToPlay > unlockedUpToDay) {
      setAttemptFeedback(`Drop ${dayToPlay} is locked. Awaiting Host to unlock this round.`);
      return;
    }

    // Strict 1-trial integrity: Check if already completed or has bonus questions
    if (myScoresByDay.has(dayToPlay)) {
      const existingScore = myScoresByDay.get(dayToPlay);
      const allQuestions = getQuestionsForLeagueDay(league, dayToPlay);
      const answeredCount = existingScore?.questionResults?.length || (existingScore ? (existingScore.totalQuestions || (league.questionsPerDay || 5)) : 0);
      if (allQuestions.length > answeredCount) {
        startBonusRound(dayToPlay);
        return;
      }
      setAttemptFeedback(`Drop ${dayToPlay} is already completed. Scores are strictly locked to ensure tournament balance.`);
      return;
    }

    // Sequential integrity: Drops must be unlocked one after another! Drop 2 only after Drop 1.
    if (dayToPlay > 1 && !myScoresByDay.has(dayToPlay - 1)) {
      setAttemptFeedback(`Drop ${dayToPlay} is locked. You must complete Drop ${dayToPlay - 1} first!`);
      return;
    }

    setActiveDropDay(dayToPlay);
    setIsBonusRound(false);

    let dropQuestions = getQuestionsForLeagueDay(league, dayToPlay);
    if (dropQuestions.length === 0) {
      const fallbackMap = generateDailyLeagueQuestions(
        league.durationDays,
        league.questionsPerDay || 5,
        league.difficulty || "mixed",
        league.category || "all",
        league.code
      );
      const qIds = fallbackMap[`day_${dayToPlay}`] || [];
      const qMap = new Map(TRIVIA_QUESTIONS.map((q) => [q.id, q]));
      dropQuestions = qIds.map((id) => qMap.get(id)).filter(Boolean) as TriviaQuestion[];
    }

    if (dropQuestions.length === 0) return;

    setQuestions(dropQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setElapsedRoundSeconds(0);
    setCorrectCount(0);
    setQuestionResults([]);
    setRoundStartTime(Date.now());
    setAttemptFeedback("");
    setQuestionTimeLeft(league.questionTimerSeconds || 25);
    setDropTimeLeft(league.totalDropSeconds || ((league.questionsPerDay || 5) * 30));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `fey_league_in_flight_${league.code}`,
          JSON.stringify({
            leagueCode: league.code,
            dayNumber: dayToPlay,
            isBonusRound: false,
            bonusBaseScore: 0,
            bonusBaseTotal: 0,
            bonusBaseDuration: 0,
            existingBonusResults: [],
            startTime: Date.now(),
            elapsedSeconds: 0,
            questionIds: dropQuestions.map((q) => q.id),
            questionResults: [],
            totalQuestions: dropQuestions.length,
          })
        );
      } catch {}
    }

    setPhase("playing");
  }

  function handleSelectOption(index: number) {
    if (isAnswerRevealed) return;

    const currentQ = questions[currentIndex];
    setSelectedAnswer(index);
    setIsAnswerRevealed(true);

    const isCorrect = isAnswerAccepted(currentQ, index);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      playAudioTone(880, "sine", 0.15);
    } else {
      playAudioTone(220, "sawtooth", 0.25);
    }

    setQuestionResults((prev) => {
      const next = [
        ...prev,
        { questionId: currentQ.id, correct: isCorrect, selected: index },
      ];
      saveInFlightProgress(next);
      return next;
    });
  }

  /** A contest on the current question was upheld: credit the point in the live round. */
  function handleContestAccepted(questionId: string, selected: number) {
    setQuestionResults((prev) => {
      let changed = false;
      const next = prev.map((r) => {
        if (r.questionId === questionId && r.selected === selected && !r.correct) {
          changed = true;
          return { ...r, correct: true };
        }
        return r;
      });
      if (changed) {
        setCorrectCount((c) => c + 1);
        saveInFlightProgress(next);
      }
      return changed ? next : prev;
    });
  }

  function handleNextQuestion() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((idx) => idx + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
      setQuestionTimeLeft(league.questionTimerSeconds || 25);
    } else {
      finishDailyRound();
    }
  }

  function handleConfirmLeaveDrop() {
    setShowLeaveConfirm(false);
    const answeredIds = new Set(questionResults.map((r) => r.questionId));
    const remaining: Array<{ questionId: string; correct: boolean; selected: number }> = [];
    for (const q of questions) {
      if (!answeredIds.has(q.id)) {
        remaining.push({
          questionId: q.id,
          correct: false,
          selected: -1,
        });
      }
    }
    const mergedResults = [...questionResults, ...remaining];
    finishDailyRound(
      `🚪 Drop ${activeDropDay} exited early. Your session was saved and Drop ${activeDropDay} is locked until the next drop unlocks.`,
      mergedResults
    );
  }

  async function finishDailyRound(
    overrideFeedback?: string,
    overrideResults?: Array<{ questionId: string; correct: boolean; selected: number }>
  ) {
    // Clear in-flight tracking so it's not treated as abandoned
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`fey_league_in_flight_${league.code}`);
      } catch {}
    }

    const elapsedSeconds = Math.max(5, Math.round((Date.now() - roundStartTime) / 1000));
    setDurationSeconds(elapsedSeconds);
    setPhase("round_summary");

    const finalResults = overrideResults || questionResults;
    const roundCorrect = finalResults.filter((r) => r.correct).length;

    const totalCorrect = isBonusRound ? (bonusBaseScore + roundCorrect) : roundCorrect;
    const totalQuestionsCount = isBonusRound ? (bonusBaseTotal + questions.length) : questions.length;
    const totalDuration = isBonusRound ? (bonusBaseDuration + elapsedSeconds) : elapsedSeconds;
    const mergedResults = isBonusRound ? [...existingBonusResults, ...finalResults] : finalResults;

    const finalPoints = calculateLeaguePoints(totalCorrect, totalQuestionsCount, totalDuration);
    const xpBonus = roundCorrect * 25 + 50;
    addXP(xpBonus);

    setAttemptFeedback(
      overrideFeedback || (
        isBonusRound
          ? `🎉 Bonus round complete! +${roundCorrect}/${questions.length} answered. New Drop ${activeDropDay} score: ${totalCorrect}/${totalQuestionsCount} (${finalPoints} pts).`
          : `Drop ${activeDropDay} recorded! You earned ${finalPoints} pts.`
      )
    );

    // Save as local trivia round to maintain user's app streak
    saveTriviaRound({
      score: totalCorrect,
      total: totalQuestionsCount,
      pct: Math.round((totalCorrect / totalQuestionsCount) * 100),
      gradeLabel: `${league.title} · Drop ${activeDropDay}${isBonusRound ? " (Bonus)" : ""}`,
      xpEarned: xpBonus,
      durationMinutes: Math.round(totalDuration / 60),
      questionIds: mergedResults.map((q) => q.questionId),
      categoryBreakdown: [],
    });

    const myScoreEntry: LeagueDailyScore = {
      id: `score_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      leagueCode: league.code,
      userId: myIdentifier,
      username: profile.username || "Scholar",
      avatar: profile.avatar || "/avatars/avatar-scholar.svg",
      dayNumber: activeDropDay,
      date: todayStr(),
      score: totalCorrect,
      totalQuestions: totalQuestionsCount,
      points: finalPoints,
      durationSeconds: totalDuration,
      questionResults: mergedResults,
      createdAt: new Date().toISOString(),
    };

    // Update local state immediately with the locked drop score
    setScores((prevScores) => {
      const myNameLower = (profile.username || "Scholar").trim().toLowerCase();
      const filtered = prevScores.filter(
        (s) =>
          !(
            s.dayNumber === activeDropDay &&
            ((s.username || "").trim().toLowerCase() === myNameLower ||
              (profile.id && s.userId === profile.id))
          )
      );
      const updated = [...filtered, myScoreEntry];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`fey_league_scores_${league.code}`, JSON.stringify(updated));
        } catch {}
      }
      setLeaderboard(aggregateLeagueLeaderboard(updated, currentDay));
      return updated;
    });

    if (roundCorrect >= Math.ceil(questions.length * 0.7)) {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ["#A3B18A", "#DDA15E", "#BC6C25"],
        });
      } catch {}
    }

    // Submit to Supabase / API in background for cloud sync
    setSubmittingScore(true);
    try {
      const res = await fetch("/api/trivia/league/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leagueCode: league.code,
          userId: profile.id,
          username: profile.username || "Scholar",
          avatar: profile.avatar || "/avatars/avatar-scholar.svg",
          dayNumber: activeDropDay,
          score: totalCorrect,
          totalQuestions: totalQuestionsCount,
          durationSeconds: totalDuration,
          questionResults: mergedResults,
          isBonusExtension: isBonusRound,
        }),
      });

      const data = await res.json();
      setSubmittingScore(false);

      if (res.ok) {
        // Refresh league data
        fetchLeagueData();
      }
    } catch {
      setSubmittingScore(false);
    } finally {
      setIsBonusRound(false);
    }
  }

  const fetchLeagueData = useCallback(async () => {
    if (!league.code) return;
    try {
      const res = await fetch(`/api/trivia/league?code=${league.code}&_t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.league) {
          setLeague((prev) => {
            const mergedLeague = mergeLeagueState(prev, data.league);
            saveLocalLeague(mergedLeague);
            return mergedLeague;
          });
        }
        if (data.scores && Array.isArray(data.scores)) {
          setScores((prevScores) => {
            const scoreMap = new Map<string, LeagueDailyScore>();
            for (const s of prevScores) {
              const playerKey = (s.username || s.userId || "").trim().toLowerCase();
              scoreMap.set(`${playerKey}_${s.dayNumber}`, s);
            }
            for (const s of data.scores) {
              const playerKey = (s.username || s.userId || "").trim().toLowerCase();
              const existing = scoreMap.get(`${playerKey}_${s.dayNumber}`);
              if (
                !existing ||
                (s.totalQuestions || 0) > (existing.totalQuestions || 0) ||
                s.points >= existing.points
              ) {
                scoreMap.set(`${playerKey}_${s.dayNumber}`, s);
              }
            }
            const merged = Array.from(scoreMap.values());
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(`fey_league_scores_${league.code}`, JSON.stringify(merged));
              } catch {}
            }
            setLeaderboard(aggregateLeagueLeaderboard(merged, currentDay));
            return merged;
          });
        }
      }
    } catch {}
  }, [league.code, currentDay]);

  // Live background sync: poll every 8s when not actively answering a question, and on tab focus
  useEffect(() => {
    if (phase === "playing") return;
    fetchLeagueData();

    const interval = setInterval(() => {
      fetchLeagueData();
    }, 8000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        fetchLeagueData();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [phase, fetchLeagueData]);

  const shareUrl = getLeagueShareUrl(league);

  function copyInviteLink() {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `🏆 Naija Trivia League: "${league.title}" on Fey!\n` +
      `Day ${currentDay} of ${league.durationDays} is live. Join the daily drop and test your knowledge:\n\n` +
      `${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-2">
        {phase === "playing" ? (
          <button
            type="button"
            onClick={() => setShowLeaveConfirm(true)}
            className="text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 group active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5 shrink-0" />
            <span className="hidden sm:inline">Back to Trivia Arcade</span>
            <span className="sm:hidden">Trivia</span>
          </button>
        ) : (
          <Link
            href="/games/trivia"
            className="text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 group active:scale-95"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5 shrink-0" />
            <span className="hidden sm:inline">Back to Trivia Arcade</span>
            <span className="sm:hidden">Trivia</span>
          </Link>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!profile?.hasClaimedAccount && (
            <button
              onClick={openClaimAccountPrompt}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold font-space transition-colors cursor-pointer whitespace-nowrap shadow-2xs active:scale-95"
              title="Link free account to track your daily streak & protect tournament scores"
            >
              <Flame size={12} className="text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Track Streak</span>
              <span className="sm:hidden">Streak</span>
            </button>
          )}
          <span className="text-[11px] font-mono px-2.5 h-8 flex items-center rounded-xl border bg-[var(--bg-input)] whitespace-nowrap" style={{ borderColor: "var(--border-dim)" }}>
            Code: <strong>{league.code}</strong>
          </span>
          <button
            type="button"
            disabled={isUpdatingLeague || phase === "playing"}
            onClick={handleDeleteTournament}
            className="h-8 w-8 flex items-center justify-center rounded-xl border border-[var(--border-dim)] text-[var(--text-mute)] hover:text-rose-600 hover:border-rose-300/60 hover:bg-rose-500/10 cursor-pointer bg-[var(--bg-input)] transition-all shrink-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            title={isCreator ? "Delete Tournament" : "Leave / Remove Tournament"}
            aria-label={isCreator ? "Delete Tournament" : "Leave / Remove Tournament"}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── PHASE: OVERVIEW & STANDINGS ─────────────────────────────────────── */}
        {phase === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Guest Tournament Standing Notice */}
            {!profile?.hasClaimedAccount && (
              <div
                className="rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
                style={{
                  background: "rgba(166, 124, 30, 0.08)",
                  borderColor: "rgba(166, 124, 30, 0.3)",
                  color: "var(--text)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Flame size={16} className="text-amber-500 shrink-0 animate-pulse" />
                  <div>
                    <span className="font-space font-bold text-xs" style={{ color: "var(--text)" }}>Competing as Guest (@{profile?.username || "Scholar"}):</span>{" "}
                    <span className="text-[11px] text-[var(--text-dim)]">
                      Link a free account to track your daily streak and ensure your tournament standing syncs across devices.
                    </span>
                  </div>
                </div>
                <button
                  onClick={openClaimAccountPrompt}
                  className="btn-terra px-3.5 py-1.5 rounded-xl text-xs font-space font-bold whitespace-nowrap self-start sm:self-auto cursor-pointer shadow-xs shrink-0"
                >
                  <span>Track Streak →</span>
                </button>
              </div>
            )}

            {/* League Hero Banner */}
            <div
              className="rounded-3xl p-6 sm:p-8 surface border relative overflow-hidden shadow-sm"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className="px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]"
                    style={{
                      background: "rgba(221, 161, 94, 0.15)",
                      color: "var(--terra)",
                      border: "1px solid var(--terra)",
                    }}
                  >
                    Friendship League
                  </span>
                  <span className="text-[var(--text-mute)]">Hosted by @{league.creatorName}</span>
                </div>

                <h1 className="font-space text-3xl sm:text-4xl font-extrabold" style={{ color: "var(--text)" }}>
                  {league.title}
                </h1>

                {/* Progress Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-[var(--bg-input)] border text-center" style={{ borderColor: "var(--border-dim)" }}>
                    <div className="text-[10px] uppercase font-bold text-[var(--text-mute)]">Tournament Day</div>
                    <div className="font-mono text-xl font-extrabold text-[var(--terra)]">
                      Day {currentDay} / {league.durationDays}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[var(--bg-input)] border text-center" style={{ borderColor: "var(--border-dim)" }}>
                    <div className="text-[10px] uppercase font-bold text-[var(--text-mute)]">Next Drop In</div>
                    <div className="font-mono text-base font-bold text-[var(--olive)] mt-0.5">
                      {status.isCompleted ? "Completed" : timeToNextDrop || "Midnight"}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[var(--bg-input)] border text-center" style={{ borderColor: "var(--border-dim)" }}>
                    <div className="text-[10px] uppercase font-bold text-[var(--text-mute)]">Daily Drop Size</div>
                    <div className="font-mono text-xl font-bold text-[var(--gold)]">
                      {league.questionsPerDay} Qs
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[var(--bg-input)] border text-center" style={{ borderColor: "var(--border-dim)" }}>
                    <div className="text-[10px] uppercase font-bold text-[var(--text-mute)]">Scholars Active</div>
                    <div className="font-mono text-xl font-bold text-[var(--text)]">
                      {leaderboard.length} Players
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {attemptFeedback && (
              <div
                className="p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3"
                style={{
                  backgroundColor: "rgba(92, 106, 54, 0.12)",
                  borderColor: "var(--olive)",
                  color: "var(--text)",
                }}
              >
                <span>{attemptFeedback}</span>
                <button
                  type="button"
                  onClick={() => setAttemptFeedback("")}
                  className="p-1 rounded-lg hover:bg-black/10 text-[var(--text-mute)] hover:text-[var(--text)] cursor-pointer shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X size={13} />
                </button>
              </div>
            )}

            {/* Daily Action Card */}
            <div
              className="rounded-3xl p-6 surface border shadow-sm space-y-4"
              style={{
                borderColor: hasCompletedToday || isNextDayLockedByHost ? "var(--olive)" : "var(--terra)",
                background: hasCompletedToday || isNextDayLockedByHost ? "rgba(92, 106, 54, 0.05)" : "var(--bg-card)",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <span className="font-space font-bold text-lg text-[var(--text)]">
                      {status.isCompleted
                        ? `Tournament Completed (${league.durationDays} Drops)`
                        : nextUncompletedDay
                        ? `Drop ${nextUncompletedDay}`
                        : `All ${league.durationDays} Tournament Drops Completed!`}
                    </span>
                    {nextUncompletedDay && !status.isCompleted ? (
                      isNextDayLockedByHost ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-mute)] bg-[var(--bg-input)] px-2.5 py-0.5 rounded-full border border-[var(--border-dim)]">
                          <Lock size={11} /> Locked by Host
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--terra)] bg-[var(--terra)]/15 px-2.5 py-0.5 rounded-full border border-[var(--terra)]/30">
                          <Flame size={12} /> Ready to Play
                        </span>
                      )
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 size={12} /> All Drops Done
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-[var(--text-mute)] px-2 py-0.5 rounded-full bg-[var(--bg-input)] border border-[var(--border-dim)]">
                      {league.attemptPolicy === "host_controlled"
                        ? "Host-Paced"
                        : league.attemptPolicy === "unlimited"
                        ? "Continuous"
                        : league.attemptPolicy === "strict"
                        ? "Daily (24h)"
                        : "Self-Paced"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-dim)]">
                    {status.isCompleted
                      ? "This tournament has ended! Check out the final cumulative standings below."
                      : nextUncompletedDay
                      ? isNextDayLockedByHost
                        ? `You have completed all unlocked drops so far. Drop ${nextUncompletedDay} unlocks when the Host opens it or on Day ${nextUncompletedDay}.`
                        : `Answer today's ${league.questionsPerDay} questions swiftly to earn velocity bonus points.`
                      : `You have completed all ${league.durationDays} tournament drops! Check the live cumulative standings below.`}
                  </p>
                </div>

                {nextUncompletedDay && !status.isCompleted && (
                  isNextDayLockedByHost ? (
                    isCreator ? (
                      <button
                        type="button"
                        disabled={isUpdatingLeague}
                        onClick={() => handleUnlockDrop(nextUncompletedDay)}
                        className="px-5 py-3 rounded-2xl text-xs font-bold bg-[var(--olive)] text-white hover:opacity-90 shadow-sm shrink-0 cursor-pointer transition-all"
                      >
                        <span>Unlock Drop {nextUncompletedDay}</span>
                      </button>
                    ) : null
                  ) : (
                    <button
                      type="button"
                      onClick={() => startDailyRound(nextUncompletedDay)}
                      className="btn-terra px-6 py-3 rounded-2xl text-xs font-bold shadow-md shrink-0 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <span>Play Drop {nextUncompletedDay}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* ── All Tournament Drops (Choose & Attempt Drops) ── */}
            <div
              className="rounded-3xl p-6 surface border shadow-sm space-y-4"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--border-dim)" }}>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-[var(--terra)]" />
                  <div>
                    <h3 className="font-space font-bold text-base text-[var(--text)]">
                      Tournament Drops ({league.durationDays} {league.attemptPolicy === "unlimited" ? "Continuous Drops" : "Days"})
                    </h3>
                    <p className="text-xs text-[var(--text-dim)]">
                      Drops unlock sequentially (Drop 2 requires Drop 1). Strictly 1 attempt per drop.
                    </p>
                  </div>
                </div>
                <div className="text-xs font-mono font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-3 py-1 rounded-full border border-[var(--olive)]/20 w-fit">
                  {myScoresByDay.size} / {league.durationDays} Drops Finished
                </div>
              </div>

              {/* Host Controls: Add Extra Drops or Toggle Unlimited Drops */}
              {isCreator && (
                <div className="p-3.5 rounded-2xl border border-[var(--olive)]/30 bg-[var(--olive)]/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--olive)]/20 flex items-center justify-center shrink-0 text-[var(--olive)]">
                      <Crown size={15} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                        <span>Host Controls</span>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-[var(--olive)]/20 text-[var(--olive)] font-bold">
                          Creator
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-dim)]">
                        {league.attemptPolicy === "unlimited"
                          ? "Unlimited mode active. New drops unlock automatically as you finish each one."
                          : "Extend this tournament by adding extra drops or enabling unlimited play."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Unlock Next Drop Button */}
                    {unlockedUpToDay < league.durationDays && (
                      <button
                        type="button"
                        onClick={() => handleUnlockDrop(unlockedUpToDay + 1)}
                        disabled={isUpdatingLeague}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--olive)] text-white hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                        title={`Unlock Drop ${unlockedUpToDay + 1} for all scholars`}
                      >
                        <ShieldCheck size={13} />
                        <span>Unlock Drop {unlockedUpToDay + 1}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAddExtraDrops(1)}
                      disabled={isUpdatingLeague}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--bg-card)] border border-[var(--border-dim)] hover:border-[var(--olive)] text-[var(--text)] hover:text-[var(--olive)] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      title="Add 1 more drop to tournament"
                    >
                      +1 Drop
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddExtraDrops(3)}
                      disabled={isUpdatingLeague}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--bg-card)] border border-[var(--border-dim)] hover:border-[var(--olive)] text-[var(--text)] hover:text-[var(--olive)] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      title="Add 3 more drops to tournament"
                    >
                      +3 Drops
                    </button>

                    {league.attemptPolicy !== "unlimited" && (
                      <button
                        type="button"
                        onClick={handleToggleUnlimitedDrops}
                        disabled={isUpdatingLeague}
                        className="btn-terra px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        Enable Unlimited Drops
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleDeleteTournament}
                      disabled={isUpdatingLeague}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                      title="Permanently delete this tournament"
                    >
                      <Trash2 size={12} />
                      <span>Delete League</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: league.durationDays }, (_, i) => i + 1).map((dayNum) => {
                  const score = myScoresByDay.get(dayNum);
                  const isDone = !!score;
                  const isHostLocked = isPacedByHostOrSchedule && dayNum > unlockedUpToDay;
                  const dayQuestions = getQuestionsForLeagueDay(league, dayNum);
                  const totalDayQuestions = dayQuestions.length || league.questionsPerDay || 5;
                  const answeredCount = score?.questionResults?.length || (isDone ? (score.totalQuestions || totalDayQuestions) : 0);
                  const hasBonusQuestions = isDone && totalDayQuestions > answeredCount;
                  const bonusCount = totalDayQuestions - answeredCount;

                  const isNext = !isDone && !isHostLocked && (dayNum === 1 || myScoresByDay.has(dayNum - 1));

                  return (
                    <div
                      key={dayNum}
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[160px]",
                        hasBonusQuestions
                          ? "border-amber-500/60 bg-amber-500/5 shadow-xs ring-1 ring-amber-500/25"
                          : isDone
                          ? "border-[var(--olive)]/35 bg-[var(--olive)]/5"
                          : isNext
                          ? "border-[var(--terra)]/60 bg-[var(--terra)]/5 shadow-xs ring-1 ring-[var(--terra)]/20"
                          : "border-[var(--border-dim)] bg-[var(--bg-card)]/40 opacity-70"
                      )}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-space font-bold text-sm text-[var(--text)]">
                            Drop {dayNum}
                          </span>
                          {hasBonusQuestions ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                              <Zap size={11} className="text-amber-500" /> +{bonusCount} Bonus Qs
                            </span>
                          ) : isDone ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle2 size={11} /> Completed
                            </span>
                          ) : isNext ? (
                            <span className="text-[10px] font-mono font-bold text-[var(--terra)] bg-[var(--terra)]/15 px-2 py-0.5 rounded-full border border-[var(--terra)]/30">
                              Ready to Play
                            </span>
                          ) : isHostLocked ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--text-mute)] bg-[var(--bg-input)] px-2 py-0.5 rounded-full border border-[var(--border-dim)]">
                              <Lock size={10} /> Locked by Host
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--text-mute)] bg-[var(--bg-input)] px-2 py-0.5 rounded-full border border-[var(--border-dim)]">
                              <Lock size={10} /> Locked
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-[var(--text-dim)] flex items-center gap-1.5">
                          <span>{totalDayQuestions} Questions</span>
                          <span>•</span>
                          <span>{league.category === "all" ? "All Topics" : league.category}</span>
                        </div>
                      </div>

                      <div className="pt-3">
                        {hasBonusQuestions ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[var(--bg-input)] border border-[var(--border-dim)] text-[11px] font-mono">
                              <span className="text-[var(--text-dim)]">Current: <strong>{score.score}/{answeredCount}</strong></span>
                              <span className="font-bold text-[var(--olive)]">+{score.points} pts</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => startBonusRound(dayNum)}
                              className="w-full btn-terra py-2 rounded-xl text-xs font-bold cursor-pointer hover:opacity-95 shadow-xs text-center flex items-center justify-center gap-1.5"
                            >
                              <span>Answer +{bonusCount} Bonus Questions</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        ) : isDone ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-dim)] text-xs font-mono">
                              <span className="text-[var(--text-dim)]">
                                Score: <strong className="text-[var(--text)]">{score.score}/{totalDayQuestions}</strong>
                              </span>
                              <span className="font-bold text-[var(--olive)]">
                                +{score.points} pts
                              </span>
                            </div>
                            {isCreator && (
                              <div className="flex items-center justify-between pt-1 text-[10px]">
                                <span className="text-[var(--text-mute)] font-mono">Host:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={isUpdatingLeague}
                                    onClick={() => handleAddQuestionsToDay(dayNum, 3)}
                                    className="px-2 py-0.5 rounded-md border border-[var(--border-dim)] hover:border-[var(--olive)] text-[var(--text-dim)] hover:text-[var(--olive)] font-bold transition-colors cursor-pointer"
                                    title="Add 3 questions and reopen this drop for everyone"
                                  >
                                    +3 Qs
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isUpdatingLeague}
                                    onClick={() => handleAddQuestionsToDay(dayNum, 5)}
                                    className="px-2 py-0.5 rounded-md border border-[var(--border-dim)] hover:border-[var(--olive)] text-[var(--text-dim)] hover:text-[var(--olive)] font-bold transition-colors cursor-pointer"
                                    title="Add 5 questions and reopen this drop for everyone"
                                  >
                                    +5 Qs
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : isHostLocked ? (
                          isCreator ? (
                            <button
                              type="button"
                              disabled={isUpdatingLeague}
                              onClick={() => handleUnlockDrop(dayNum)}
                              className="w-full py-2 rounded-xl border border-[var(--olive)] text-[var(--olive-text)] hover:bg-[var(--olive)] hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs text-center"
                            >
                              Unlock Drop {dayNum} for League
                            </button>
                          ) : (
                            <div className="text-[11px] text-[var(--text-mute)] font-mono py-1">
                              Awaiting Host to unlock Drop {dayNum}
                            </div>
                          )
                        ) : isNext ? (
                          <button
                            type="button"
                            onClick={() => startDailyRound(dayNum)}
                            className="w-full btn-terra py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all shadow-xs text-center"
                          >
                            Play Drop {dayNum}
                          </button>
                        ) : (
                          <div className="text-[11px] text-[var(--text-mute)] font-mono py-1">
                            Unlocks after Drop {dayNum - 1}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Standings Leaderboard */}
            <div className="rounded-3xl p-6 surface border shadow-sm space-y-4" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-dim)" }}>
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-[var(--gold)]" />
                  <h3 className="font-space font-bold text-base text-[var(--text)]">
                    Cumulative Standings
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyInviteLink}
                    className="p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 hover:bg-[var(--bg-input)] transition-colors"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                    title="Copy Invite Link"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span className="hidden sm:inline">{copied ? "Copied" : "Invite"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={shareWhatsApp}
                    className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 transition-colors shadow-xs"
                    title="Share to WhatsApp"
                  >
                    <Share2 size={14} />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>
                </div>
              </div>

              {leaderboard.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="text-3xl">🏁</div>
                  <h4 className="font-space font-bold text-sm text-[var(--text)]">No attempts submitted yet</h4>
                  <p className="text-xs text-[var(--text-dim)] max-w-sm mx-auto">
                    Be the first scholar to complete Day 1's drop and top the leaderboard!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry) => {
                    const isMe =
                      (entry.username || "").trim().toLowerCase() === myUsername ||
                      (profile.id && entry.userId === profile.id);

                    return (
                      <div
                        key={entry.username || entry.userId}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isMe
                            ? "border-[var(--olive)] bg-[var(--olive)]/8 shadow-xs"
                            : "border-[var(--border-dim)] bg-[var(--bg-card)]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank Badge */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                              entry.rank === 1
                                ? "bg-amber-400/20 text-amber-600 border border-amber-400/40"
                                : entry.rank === 2
                                ? "bg-slate-300/30 text-slate-700 border border-slate-300"
                                : entry.rank === 3
                                ? "bg-amber-700/15 text-amber-800 border border-amber-700/30"
                                : "bg-[var(--bg-input)] text-[var(--text-mute)] border border-[var(--border-dim)]"
                            }`}
                          >
                            {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                          </div>

                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[var(--border-dim)]">
                            <img src={entry.avatar} alt="" className="w-full h-full object-cover" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-space font-bold text-xs text-[var(--text)] truncate">
                                {entry.username}
                              </span>
                              {isMe && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--olive)]/20 text-[var(--olive)]">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[var(--text-mute)] flex items-center gap-2">
                              <span>{entry.daysCompleted}/{league.durationDays} Days played</span>
                              <span>•</span>
                              <span>{entry.totalCorrect} Correct answers</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-right">
                          <div>
                            <div className="font-mono font-bold text-sm text-[var(--terra)]">
                              {entry.totalPoints} pts
                            </div>
                            <div className="text-[9px] font-semibold text-[var(--text-mute)]">
                              {entry.completedToday ? (
                                <span className="text-emerald-600">✅ Day {currentDay} Done</span>
                              ) : (
                                <span className="text-amber-600">⏳ Pending Day {currentDay}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── PHASE: PLAYING DAILY DROP ────────────────────────────────────────── */}
        {phase === "playing" && currentQ && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-5"
          >
            {/* Header / Timer Bar */}
            <div className="rounded-2xl p-4 surface border shadow-xs space-y-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowLeaveConfirm(true)}
                    className="p-1 rounded-lg border border-[var(--border-dim)] hover:bg-rose-500/10 hover:border-rose-500/30 text-[var(--text-mute)] hover:text-rose-600 transition-colors cursor-pointer"
                    title="Leave Drop"
                    aria-label="Leave Drop"
                  >
                    <X size={13} />
                  </button>
                  <span className="text-[var(--text-dim)]">
                    Day {activeDropDay} {isBonusRound ? "Bonus Extension" : "Drop"} · Question {currentIndex + 1} of {questions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Countdown Timer Badge */}
                  <div
                    className={cn(
                      "flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-xl border transition-colors",
                      (timerMode === "per_question" ? questionTimeLeft <= 5 : dropTimeLeft <= 15)
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-600"
                        : "bg-[var(--bg-input)] border-[var(--border-dim)] text-[var(--olive)]"
                    )}
                  >
                    <Clock
                      size={13}
                      className={cn(
                        (timerMode === "per_question" ? questionTimeLeft <= 5 : dropTimeLeft <= 15)
                          ? "text-rose-600 animate-pulse"
                          : "text-[var(--olive)]"
                      )}
                    />
                    <span>
                      {timerMode === "per_question"
                        ? `${questionTimeLeft}s`
                        : `${Math.floor(dropTimeLeft / 60)}:${String(dropTimeLeft % 60).padStart(2, "0")}`}
                    </span>
                    <span className="text-[10px] text-[var(--text-mute)] font-normal uppercase ml-0.5">
                      {timerMode === "per_question" ? "Clock" : "Drop Bank"}
                    </span>
                  </div>

                  {/* Stopwatch */}
                  <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-[var(--text-mute)] px-2 py-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-dim)]">
                    <span>
                      {Math.floor(elapsedRoundSeconds / 60)}:
                      {String(elapsedRoundSeconds % 60).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 rounded-full bg-[var(--bg-input)] overflow-hidden">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                    background: "var(--terra)",
                  }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="rounded-3xl p-6 sm:p-8 surface border shadow-sm space-y-6" style={{ borderColor: "var(--border)" }}>
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-mute)]">
                  {currentQ.category}
                </span>
                <h2 className="font-space text-xl sm:text-2xl font-bold leading-snug" style={{ color: "var(--text)" }}>
                  {currentQ.question}
                </h2>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = isAnswerAccepted(currentQ, idx);

                  let btnStyle = "border-[var(--border-dim)] bg-[var(--bg-card)] hover:border-[var(--olive)]";
                  if (isAnswerRevealed) {
                    if (isCorrect) {
                      btnStyle = "border-emerald-500 bg-emerald-500/15 text-emerald-700 font-bold shadow-xs";
                    } else if (isSelected && !isCorrect) {
                      btnStyle = "border-rose-500 bg-rose-500/15 text-rose-700 font-bold";
                    } else {
                      btnStyle = "opacity-40 border-transparent bg-[var(--bg-input)]";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerRevealed}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span className="font-medium">{option}</span>
                      {isAnswerRevealed && isCorrect && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
                      {isAnswerRevealed && isSelected && !isCorrect && <XCircle size={18} className="text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Button */}
              {isAnswerRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-2 border-t"
                  style={{ borderColor: "var(--border-dim)" }}
                >
                  {selectedAnswer === -1 && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs font-semibold flex items-center gap-2">
                      <Clock size={14} className="text-rose-600 shrink-0" />
                      Time expired on this question. The correct answer is highlighted above.
                    </div>
                  )}

                  {currentQ.explanation && (
                    <p className="text-xs leading-relaxed text-[var(--text-dim)] bg-[var(--bg-input)] p-3.5 rounded-xl border border-[var(--border-dim)]">
                      💡 <strong>Insight:</strong> {currentQ.explanation}
                    </p>
                  )}

                  {selectedAnswer !== null && selectedAnswer >= 0 && !isAnswerAccepted(currentQ, selectedAnswer) && (
                    <ContestAnswerButton
                      key={`${currentQ.id}_${selectedAnswer}`}
                      question={currentQ}
                      selected={selectedAnswer}
                      leagueCode={league.code}
                      dayNumber={activeDropDay}
                      onAccepted={handleContestAccepted}
                    />
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="btn-terra px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                    >
                      {currentIndex + 1 < questions.length ? "Next Question" : "Complete Day Drop"}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── PHASE: ROUND SUMMARY ────────────────────────────────────────────── */}
        {phase === "round_summary" && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-6 sm:p-8 surface border shadow-sm text-center space-y-6"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border shadow-md"
              style={{
                backgroundColor: "rgba(92, 106, 54, 0.15)",
                borderColor: "var(--olive)",
                color: "var(--olive-text)",
              }}
            >
              <Award size={32} />
            </div>

            <div>
              <h2 className="font-space text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text)" }}>
                Day {activeDropDay} {isBonusRound ? "Bonus Round" : "Drop"} Complete!
              </h2>
              <p className="text-xs text-[var(--text-dim)] mt-1">
                Your performance has been recorded into <strong>{league.title}</strong> standings.
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--bg-input)] border max-w-md mx-auto" style={{ borderColor: "var(--border-dim)" }}>
              <div>
                <div className="font-mono text-2xl font-bold text-[var(--terra)]">
                  {correctCount}/{questions.length}
                </div>
                <div className="text-[10px] uppercase font-bold text-[var(--text-mute)]">Accuracy</div>
              </div>
              <div className="border-x border-[var(--border-dim)]">
                <div className="font-mono text-2xl font-bold text-[var(--gold)]">
                  {calculateLeaguePoints(correctCount, questions.length, durationSeconds)}
                </div>
                <div className="text-[10px] uppercase font-bold text-[var(--text-mute)]">League Points</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-[var(--olive)]">
                  {durationSeconds}s
                </div>
                <div className="text-[10px] uppercase font-bold text-[var(--text-mute)]">Time Spent</div>
              </div>
            </div>

            {attemptFeedback && (
              <div
                className="p-3.5 rounded-2xl border text-xs font-semibold max-w-md mx-auto leading-relaxed"
                style={{
                  backgroundColor: "rgba(92, 106, 54, 0.12)",
                  borderColor: "var(--olive)",
                  color: "var(--text)",
                }}
              >
                {attemptFeedback}
              </div>
            )}

            {submittingScore && (
              <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-dim)]">
                <FeyLogo size={14} spinning={true} /> Syncing results to league standings...
              </div>
            )}

            {submitError && (
              <p className="text-xs text-rose-600 font-semibold">{submitError}</p>
            )}

            {/* Host End-of-Round Power: Add dynamic bonus questions */}
            {isCreator && (
              <div
                className="p-4 rounded-2xl surface border text-left space-y-3 max-w-md mx-auto"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[var(--olive)]" />
                    <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Host Controls</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-mute)]">Day {activeDropDay} Drop</span>
                </div>
                <p className="text-xs text-[var(--text-dim)]">
                  Add bonus questions to Day {activeDropDay} for all scholars in this league:
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isUpdatingLeague}
                    onClick={() => handleAddQuestionsToDrop(3)}
                    className="flex-1 py-2 px-3 rounded-xl border border-[var(--olive)] text-[var(--olive-text)] hover:bg-[var(--olive)] hover:text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    +3 Questions
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingLeague}
                    onClick={() => handleAddQuestionsToDrop(5)}
                    className="flex-1 py-2 px-3 rounded-xl border border-[var(--olive)] text-[var(--olive-text)] hover:bg-[var(--olive)] hover:text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    +5 Questions
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              {nextUncompletedDay && nextUncompletedDay <= league.durationDays && (
                <button
                  type="button"
                  onClick={() => startDailyRound(nextUncompletedDay)}
                  className="w-full sm:w-auto btn-terra px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  Play Drop {nextUncompletedDay}
                </button>
              )}
              <button
                type="button"
                onClick={() => setPhase("overview")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold border border-[var(--border-dim)] hover:bg-[var(--bg-input)] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                style={{ color: "var(--text)" }}
              >
                <Trophy size={14} /> View League Standings
              </button>
              <button
                type="button"
                onClick={shareWhatsApp}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Share2 size={14} /> Share Score to WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leave Drop Confirmation Modal */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md surface border rounded-3xl p-6 shadow-2xl space-y-5"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-space font-bold text-base text-[var(--text)]">
                    Leave Current Drop?
                  </h3>
                  <p className="text-xs text-[var(--text-mute)]">
                    Drop {activeDropDay} is currently in progress
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-1.5 text-xs">
                <div className="font-bold text-rose-700 dark:text-rose-400">
                  Your session will be saved and permanently locked
                </div>
                <p className="text-[var(--text-dim)] leading-relaxed">
                  If you leave now, your current score ({isBonusRound ? bonusBaseScore + questionResults.filter((r) => r.correct).length : questionResults.filter((r) => r.correct).length}/{isBonusRound ? bonusBaseTotal + questions.length : questions.length}) will be permanently recorded. You will not be able to replay this drop until the next drop unlocks.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-dim)] hover:bg-[var(--bg-input)] text-[var(--text)] transition-colors cursor-pointer"
                >
                  Continue Quiz
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLeaveDrop}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                >
                  Save & Leave Drop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
