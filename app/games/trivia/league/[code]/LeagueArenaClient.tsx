"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Share2,
  Copy,
  Check,
  Zap,
  Sparkles,
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
  saveLocalLeague,
  removeLocalLeague,
  getLeagueShareUrl,
} from "@/lib/trivia-league";
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
  // ALWAYS save locally so team members who join also see the arena in their dashboard!
  useEffect(() => {
    const leagueCode = code || initialLeague.code;
    if (typeof window !== "undefined" && leagueCode) {
      try {
        const stored = localStorage.getItem(`fey_league_${leagueCode}`);
        let activeLeague = initialLeague;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.code) {
            setLeague(parsed);
            activeLeague = parsed;
          }
        }

        // Persist for team members / visiting players so it's always in their "My Leagues"
        saveLocalLeague(activeLeague);

        // Hydrate local scores and merge with initialScores
        const storedScoresRaw = localStorage.getItem(`fey_league_scores_${leagueCode}`);
        const localScores: LeagueDailyScore[] = storedScoresRaw ? JSON.parse(storedScoresRaw) : [];
        if (localScores.length > 0) {
          const scoreMap = new Map<string, LeagueDailyScore>();
          for (const s of initialScores) {
            const playerKey = (s.username || s.userId || "").trim().toLowerCase();
            scoreMap.set(`${playerKey}_${s.dayNumber}`, s);
          }
          for (const s of localScores) {
            const playerKey = (s.username || s.userId || "").trim().toLowerCase();
            const existing = scoreMap.get(`${playerKey}_${s.dayNumber}`);
            if (!existing || s.points >= existing.points) {
              scoreMap.set(`${playerKey}_${s.dayNumber}`, s);
            }
          }
          const merged = Array.from(scoreMap.values());
          setScores(merged);
          const currentStatus = getLeagueStatus(activeLeague.startDate, activeLeague.durationDays);
          setLeaderboard(aggregateLeagueLeaderboard(merged, currentStatus.dayNumber));
        }
      } catch {}
    }
  }, [code, initialLeague.code, initialScores]);

  const [phase, setPhase] = useState<"overview" | "playing" | "round_summary">("overview");

  // Game Play State
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [elapsedRoundSeconds, setElapsedRoundSeconds] = useState(0);
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

  // Time remaining to next drop (midnight)
  const [timeToNextDrop, setTimeToNextDrop] = useState("");

  const status = getLeagueStatus(league.startDate, league.durationDays);
  const currentDay = status.dayNumber;

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
        if (!existing || s.points > existing.points) {
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

  // Round stopwatch during gameplay
  useEffect(() => {
    if (phase !== "playing") return;

    const timer = setInterval(() => {
      setElapsedRoundSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

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

    // Strict 1-trial integrity: Already completed drops cannot be retaken
    if (myScoresByDay.has(dayToPlay)) {
      setAttemptFeedback(`Drop ${dayToPlay} is already completed. Scores are strictly locked to ensure tournament balance.`);
      return;
    }

    // Sequential integrity: Drops must be unlocked one after another! Drop 2 only after Drop 1.
    if (dayToPlay > 1 && !myScoresByDay.has(dayToPlay - 1)) {
      setAttemptFeedback(`Drop ${dayToPlay} is locked. You must complete Drop ${dayToPlay - 1} first!`);
      return;
    }

    setActiveDropDay(dayToPlay);

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
    setPhase("playing");
  }

  function handleSelectOption(index: number) {
    if (isAnswerRevealed) return;

    const currentQ = questions[currentIndex];
    setSelectedAnswer(index);
    setIsAnswerRevealed(true);

    const isCorrect = index === currentQ.answer;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      playAudioTone(880, "sine", 0.15);
    } else {
      playAudioTone(220, "sawtooth", 0.25);
    }

    setQuestionResults((prev) => [
      ...prev,
      { questionId: currentQ.id, correct: isCorrect, selected: index },
    ]);
  }

  function handleNextQuestion() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((idx) => idx + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
    } else {
      finishDailyRound();
    }
  }

  async function finishDailyRound() {
    const elapsedSeconds = Math.max(5, Math.round((Date.now() - roundStartTime) / 1000));
    setDurationSeconds(elapsedSeconds);
    setPhase("round_summary");

    const finalPoints = calculateLeaguePoints(correctCount, questions.length, elapsedSeconds);
    const xpBonus = correctCount * 25 + 50;
    addXP(xpBonus);

    setAttemptFeedback(`Drop ${activeDropDay} recorded! You earned ${finalPoints} pts.`);

    // Save as local trivia round to maintain user's app streak
    saveTriviaRound({
      score: correctCount,
      total: questions.length,
      pct: Math.round((correctCount / questions.length) * 100),
      gradeLabel: `${league.title} · Drop ${activeDropDay}`,
      xpEarned: xpBonus,
      durationMinutes: Math.round(elapsedSeconds / 60),
      questionIds: questions.map((q) => q.id),
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
      score: correctCount,
      totalQuestions: questions.length,
      points: finalPoints,
      durationSeconds: elapsedSeconds,
      questionResults,
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

    if (correctCount >= Math.ceil(questions.length * 0.7)) {
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
          score: correctCount,
          totalQuestions: questions.length,
          durationSeconds: elapsedSeconds,
          questionResults,
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
    }
  }

  async function fetchLeagueData() {
    try {
      const res = await fetch(`/api/trivia/league?code=${league.code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.league) {
          setLeague(data.league);
          saveLocalLeague(data.league);
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
              if (!existing || s.points >= existing.points) {
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
  }

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
      <div className="flex items-center justify-between">
        <Link
          href="/games/trivia"
          className="text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors flex items-center gap-1.5"
        >
          ← Back to Trivia Arcade
        </Link>
        <div className="flex items-center gap-2">
          {!profile?.hasClaimedAccount && (
            <button
              onClick={openClaimAccountPrompt}
              className="text-[11px] font-space font-bold px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors cursor-pointer shadow-xs"
              title="Link free account to track your daily streak & protect tournament scores"
            >
              <span>Track Streak</span>
            </button>
          )}
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full border bg-[var(--bg-input)]" style={{ borderColor: "var(--border-dim)" }}>
            Code: <strong>{league.code}</strong>
          </span>
          <button
            type="button"
            onClick={handleDeleteTournament}
            className="p-1.5 rounded-xl border border-[var(--border-dim)] text-[var(--text-mute)] hover:text-rose-600 hover:border-rose-300/60 hover:bg-rose-500/10 cursor-pointer bg-[var(--bg-input)] transition-all"
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

            {/* Daily Action Card */}
            <div
              className="rounded-3xl p-6 surface border shadow-sm space-y-4"
              style={{
                borderColor: hasCompletedToday ? "var(--olive)" : "var(--terra)",
                background: hasCompletedToday ? "rgba(92, 106, 54, 0.05)" : "var(--bg-card)",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <span className="font-space font-bold text-lg text-[var(--text)]">
                      {nextUncompletedDay
                        ? `Drop ${nextUncompletedDay} ${nextUncompletedDay === 1 ? "Scheduled Drop" : "Sequential Drop"}`
                        : `All ${league.durationDays} Tournament Drops Completed!`}
                    </span>
                    {nextUncompletedDay ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--terra)] bg-[var(--terra)]/15 px-2.5 py-0.5 rounded-full border border-[var(--terra)]/30">
                        <Flame size={12} /> Ready to Play
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 size={12} /> All Drops Done
                      </span>
                    )}
                    {league.attemptPolicy === "unlimited" ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                        ♾️ Unlimited Drops
                      </span>
                    ) : league.attemptPolicy === "strict" ? (
                      <span className="text-[10px] font-mono text-[var(--text-mute)] px-2 py-0.5 rounded-full bg-[var(--bg-input)] border border-[var(--border-dim)]">
                        Strict 24h Paced
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                        Flexible Drops
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-dim)]">
                    {status.isCompleted
                      ? "This tournament has ended! Check out the final cumulative standings below."
                      : nextUncompletedDay
                      ? `Drops progress sequentially (Drop 2 unlocks after Drop 1). Answer today's ${league.questionsPerDay} questions swiftly to earn velocity bonus points.`
                      : `You have completed all ${league.durationDays} tournament drops! Check the live cumulative standings below.`}
                  </p>
                </div>

                {nextUncompletedDay && !status.isCompleted && (
                  <button
                    type="button"
                    onClick={() => startDailyRound(nextUncompletedDay)}
                    className="btn-terra px-6 py-3 rounded-2xl text-xs font-bold shadow-md shrink-0 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Start Drop {nextUncompletedDay}</span>
                  </button>
                )}
              </div>

              {/* ── Choice: Wait for Scheduled Drop vs Attempt Other Drops & Questions Now ── */}
              {!status.isCompleted && (
                <div className="pt-2 border-t border-[var(--border-dim)] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Wait for Scheduled Drop */}
                  <div
                    className={cn(
                      "p-4 rounded-2xl border surface space-y-2.5 flex flex-col justify-between transition-all",
                      hasCompletedToday
                        ? "bg-[var(--bg-input)]/70 border-[var(--border-dim)]"
                        : "opacity-80 bg-[var(--bg-input)]/40 border-[var(--border-dim)]"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-space font-bold text-[var(--text)]">
                          <Clock size={13} className="text-[var(--terra)]" />
                          <span>Wait for Scheduled Drop</span>
                        </div>
                        {hasCompletedToday ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            Paced
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[var(--text-mute)] px-2 py-0.5 rounded-full bg-[var(--bg-input)] border border-[var(--border-dim)]">
                            24h Cadence
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                        Pace with the daily cohort. Day {Math.min(currentDay + 1, league.durationDays)} unlocks naturally at midnight:
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[var(--border-dim)]/50">
                      <span className="text-xs font-mono font-bold text-[var(--olive)] flex items-center gap-1">
                        <Clock size={13} /> {timeToNextDrop || "Midnight"}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-mute)]">
                        {currentDay >= league.durationDays ? "Final drop day active" : `Next: Day ${currentDay + 1}`}
                      </span>
                    </div>
                  </div>

                  {/* Option B: Sequential Drops Progression */}
                  <div
                    className={cn(
                      "p-4 rounded-2xl border surface space-y-2.5 flex flex-col justify-between transition-all",
                      "border-[var(--terra)]/40 bg-[var(--terra)]/5 shadow-xs"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-space font-bold text-[var(--text)]">
                          <Zap size={14} className="text-[var(--terra)]" />
                          <span>Sequential Progression</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--terra)]/15 text-[var(--terra)] border border-[var(--terra)]/30">
                          One-by-One
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                        Drops open in sequence. Complete Drop 1 to open Drop 2, then Drop 3 without waiting 24 hours!
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-[var(--border-dim)]/50">
                      <span className="text-[10px] font-mono text-[var(--text-mute)]">
                        {nextUncompletedDay ? `Next in queue: Drop ${nextUncompletedDay}` : "All drops completed"}
                      </span>
                      {nextUncompletedDay ? (
                        <button
                          type="button"
                          onClick={() => startDailyRound(nextUncompletedDay)}
                          className="btn-terra px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xs"
                        >
                          <span>Play Drop {nextUncompletedDay}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                          ✓ All drops completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
                  const isNext = dayNum === nextUncompletedDay;
                  const isLocked = !isDone && !isNext;

                  return (
                    <div
                      key={dayNum}
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[145px]",
                        isDone
                          ? "border-[var(--olive)]/35 bg-[var(--olive)]/5"
                          : isNext
                          ? "border-[var(--terra)]/60 bg-[var(--terra)]/5 shadow-xs ring-1 ring-[var(--terra)]/20"
                          : "border-[var(--border-dim)] bg-[var(--bg-card)]/40 opacity-60"
                      )}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-space font-bold text-sm text-[var(--text)]">
                            Drop {dayNum}
                          </span>
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle2 size={11} /> Completed
                            </span>
                          ) : isNext ? (
                            <span className="text-[10px] font-mono font-bold text-[var(--terra)] bg-[var(--terra)]/15 px-2 py-0.5 rounded-full border border-[var(--terra)]/30">
                              Ready to Play
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--text-mute)] bg-[var(--bg-input)] px-2 py-0.5 rounded-full border border-[var(--border-dim)]">
                              <Lock size={10} /> Locked
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-[var(--text-dim)] flex items-center gap-1.5">
                          <span>{league.questionsPerDay} Questions</span>
                          <span>•</span>
                          <span>{league.category === "all" ? "All Topics" : league.category}</span>
                        </div>
                      </div>

                      <div className="pt-3">
                        {isDone ? (
                          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-dim)] text-xs font-mono">
                            <span className="text-[var(--text-dim)]">
                              Score: <strong className="text-[var(--text)]">{score.score}/{league.questionsPerDay}</strong>
                            </span>
                            <span className="font-bold text-[var(--olive)]">
                              +{score.points} pts
                            </span>
                          </div>
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
                <span className="text-[var(--text-dim)]">
                  Day {activeDropDay} Drop · Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-dim)] text-[var(--olive)]">
                  <Clock size={13} className="text-[var(--olive)] animate-pulse" />
                  <span>
                    {Math.floor(elapsedRoundSeconds / 60)}:
                    {String(elapsedRoundSeconds % 60).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-[var(--text-mute)] font-normal uppercase ml-0.5">Stopwatch</span>
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
                  const isCorrect = idx === currentQ.answer;

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
                  {currentQ.explanation && (
                    <p className="text-xs leading-relaxed text-[var(--text-dim)] bg-[var(--bg-input)] p-3.5 rounded-xl border border-[var(--border-dim)]">
                      💡 <strong>Insight:</strong> {currentQ.explanation}
                    </p>
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
                Day {activeDropDay} Drop Complete!
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

            <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              {nextUncompletedDay && nextUncompletedDay <= league.durationDays && (
                <button
                  type="button"
                  onClick={() => startDailyRound(nextUncompletedDay)}
                  className="w-full sm:w-auto btn-terra px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Sparkles size={14} /> Attempt Drop {nextUncompletedDay} Now <ArrowRight size={14} />
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
    </div>
  );
}
