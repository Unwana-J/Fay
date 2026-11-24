"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Timer,
  Trophy,
  Swords,
  RotateCcw,
  Share2,
  Check,
  Sparkles,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Crown,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  Flame,
  Award,
  ShieldCheck,
  Zap,
  User,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MathView } from "@/components/math/MathView";
import {
  MATHLETICS_CATEGORIES,
  MATHLETICS_QUESTIONS,
  type MathleticsQuestion,
  type MathleticsCategory,
  type MathleticsDifficultyFilter,
  getMathleticsQuestions,
} from "@/lib/mathletics-questions";
import {
  type MathleticsChallenge,
  encodeChallengeToUrl,
  decodeChallengeFromUrl,
  decodeQuestionIds,
} from "@/lib/mathletics-challenge";
import {
  getMathleticsLeaderboard,
  type MathleticsScholarEntry,
} from "@/lib/mathletics-leaderboard";
import {
  getAllLocalMathleticsLeagues,
  computeUserMathleticsLeagueSummary,
  type MathleticsLeague,
} from "@/lib/mathletics-league";
import { generateMathleticsCardCanvas } from "@/lib/mathletics-card-canvas";
import { useAppStore } from "@/store/useAppStore";
import MathleticsLeagueLounge from "@/components/mathletics/MathleticsLeagueLounge";
import CreateMathleticsLeagueModal from "@/components/mathletics/CreateMathleticsLeagueModal";

export interface ChallengerInfo {
  name: string;
  score: number;
  total: number;
  pct: number;
  agilityScore?: number;
}

interface MathleticsGameClientProps {
  initialChallenge?: MathleticsChallenge | null;
  challengerInfo?: ChallengerInfo | null;
}

const QUESTION_TIME_LIMIT = 25; // 25s per question

export default function MathleticsGameClient({
  initialChallenge,
  challengerInfo,
}: MathleticsGameClientProps) {
  const {
    profile,
    mathleticsHistory,
    seenMathleticsQuestionIds,
    markMathleticsQuestionsSeen,
    saveMathleticsRound,
    addXP,
  } = useAppStore();

  // Mode & Navigation
  const [activeTab, setActiveTab] = useState<"arena" | "titans" | "leagues">("arena");
  const [gameState, setGameState] = useState<"setup" | "playing" | "summary">("setup");
  const [showCreateDuelModal, setShowCreateDuelModal] = useState(false);

  // Setup options
  const [selectedDifficulty, setSelectedDifficulty] = useState<MathleticsDifficultyFilter>(
    initialChallenge?.difficulty || "random"
  );
  const [questionTimerSeconds, setQuestionTimerSeconds] = useState<number>(
    initialChallenge?.questionTimerSeconds && initialChallenge.questionTimerSeconds >= 25
      ? initialChallenge.questionTimerSeconds
      : 25
  );
  const [selectedCategory, setSelectedCategory] = useState<MathleticsCategory | "all">("all");
  const [questionCount] = useState<number>(10);

  // Active Game State
  const [questions, setQuestions] = useState<MathleticsQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(
    initialChallenge?.questionTimerSeconds && initialChallenge.questionTimerSeconds >= 25
      ? initialChallenge.questionTimerSeconds
      : 25
  );
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Scores and Timing Metrics
  const [userAnswers, setUserAnswers] = useState<
    Array<{
      question: MathleticsQuestion;
      selected: number;
      isCorrect: boolean;
      timeSpentSeconds: number;
      bonusPoints: number;
    }>
  >([]);
  const [agilityScore, setAgilityScore] = useState(0);

  // Sharing & Export states
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingCard, setIsExportingCard] = useState(false);
  const [cardCopied, setCardCopied] = useState(false);

  const router = useRouter();
  const [dismissedChallenger, setDismissedChallenger] = useState(false);
  const [localLeagues, setLocalLeagues] = useState<MathleticsLeague[]>([]);

  useEffect(() => {
    setLocalLeagues(getAllLocalMathleticsLeagues());
  }, [gameState, activeTab, showCreateDuelModal]);

  const activeLeaguePreviews = useMemo(() => {
    return localLeagues
      .map((league) => ({
        league,
        summary: computeUserMathleticsLeagueSummary(
          league,
          profile.id,
          profile.username || "Scholar"
        ),
      }))
      .filter(({ summary }) => summary.status.isActive || summary.status.isUpcoming)
      .slice(0, 3);
  }, [localLeagues, profile.id, profile.username]);

  // Challenge context
  const activeChallenge = dismissedChallenger ? null : initialChallenge || null;
  const activeChallengerInfo = dismissedChallenger ? null : challengerInfo || null;
  const isChallengerMode = Boolean(activeChallengerInfo || activeChallenge?.creatorScore);
  const activeChallengerName =
    activeChallengerInfo?.name || activeChallenge?.creatorName || "Challenger";
  const activeChallengerScore =
    activeChallengerInfo?.score ?? activeChallenge?.creatorScore?.score ?? 0;
  const activeChallengerTotal =
    activeChallengerInfo?.total ?? activeChallenge?.creatorScore?.total ?? 10;
  const activeChallengerPct =
    activeChallengerInfo?.pct ?? activeChallenge?.creatorScore?.pct ?? 0;
  const activeChallengerAgility =
    activeChallengerInfo?.agilityScore ??
    activeChallenge?.creatorScore?.agilityScore ??
    activeChallengerScore * 120;

  // Initialize questions if challenge provided
  useEffect(() => {
    if (activeChallenge && activeChallenge.questionIds.length > 0) {
      const questionMap = new Map(MATHLETICS_QUESTIONS.map((q) => [q.id, q]));
      const loaded = activeChallenge.questionIds
        .map((id) => questionMap.get(id))
        .filter((q): q is MathleticsQuestion => Boolean(q));
      if (loaded.length > 0) {
        setQuestions(loaded);
      }
    }
  }, [activeChallenge]);

  // Start new round (or fresh solo round after completing a 1v1 challenge)
  const handleStartRound = (forceFresh: boolean = false) => {
    let roundQuestions: MathleticsQuestion[] = [];

    if (forceFresh) {
      setDismissedChallenger(true);
      if (typeof window !== "undefined" && window.location.search) {
        router.replace("/games/mathletics");
      }
    }

    if (!forceFresh && activeChallenge && activeChallenge.questionIds.length > 0) {
      const map = new Map(MATHLETICS_QUESTIONS.map((q) => [q.id, q]));
      roundQuestions = activeChallenge.questionIds
        .map((id) => map.get(id))
        .filter((q): q is MathleticsQuestion => Boolean(q));
    } else {
      roundQuestions = getMathleticsQuestions({
        count: questionCount,
        difficulty: selectedDifficulty,
        category: selectedCategory,
        excludeIds: seenMathleticsQuestionIds,
      });
    }

    if (roundQuestions.length === 0) {
      roundQuestions = getMathleticsQuestions({ count: questionCount });
    }

    setQuestions(roundQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setUserAnswers([]);
    setAgilityScore(0);
    setTimeLeft(questionTimerSeconds);
    setIsTimerActive(true);
    setGameState("playing");
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (!isTimerActive || gameState !== "playing") return;

    if (timeLeft <= 0) {
      handleTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft, gameState]);

  // Handle Answer Selection
  const handleSelectOption = (optionIndex: number) => {
    if (isAnswerRevealed || selectedOption !== null) return;

    setIsTimerActive(false);
    setSelectedOption(optionIndex);
    setIsAnswerRevealed(true);

    const currentQ = questions[currentIndex];
    const isCorrect = optionIndex === currentQ.answer;
    const timeSpent = questionTimerSeconds - timeLeft;

    // Speed bonus: up to +50 points for quick answers
    let bonus = 0;
    if (isCorrect) {
      const speedRatio = Math.max(0, timeLeft / questionTimerSeconds);
      bonus = Math.round(speedRatio * 50);
      setAgilityScore((prev) => prev + 100 + bonus);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQ,
        selected: optionIndex,
        isCorrect,
        timeSpentSeconds: timeSpent,
        bonusPoints: bonus,
      },
    ]);
  };

  // Handle Time Expired
  const handleTimeExpired = () => {
    if (isAnswerRevealed) return;
    setIsTimerActive(false);
    setSelectedOption(-1); // -1 indicates timeout
    setIsAnswerRevealed(true);

    const currentQ = questions[currentIndex];
    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQ,
        selected: -1,
        isCorrect: false,
        timeSpentSeconds: questionTimerSeconds,
        bonusPoints: 0,
      },
    ]);
  };

  // Advance to Next Question or Summary
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      setTimeLeft(questionTimerSeconds);
      setIsTimerActive(true);
    } else {
      finishRound();
    }
  };

  // Complete Round and Persist Results
  const finishRound = useCallback(() => {
    setIsTimerActive(false);
    setGameState("summary");

    const totalQuestions = questions.length || 10;
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    const pct = Math.round((correctCount / totalQuestions) * 100);

    const gradeLabel =
      pct >= 90
        ? "Analytical Titan"
        : pct >= 70
        ? "Mental Mathlete"
        : pct >= 50
        ? "Sharp Thinker"
        : "Curious Scholar";

    // XP calculation: 15 XP per correct answer + 25 XP completion bonus
    const xpEarned = correctCount * 15 + 25;
    addXP(xpEarned);

    // Track seen question IDs to avoid repeat
    const ids = questions.map((q) => q.id);
    markMathleticsQuestionsSeen(ids);

    // Category breakdown
    const catMap = new Map<string, { correct: number; total: number }>();
    for (const ans of userAnswers) {
      const cat = ans.question.category;
      const cur = catMap.get(cat) || { correct: 0, total: 0 };
      cur.total += 1;
      if (ans.isCorrect) cur.correct += 1;
      catMap.set(cat, cur);
    }
    const breakdown = Array.from(catMap.entries()).map(([category, val]) => ({
      category,
      correct: val.correct,
      total: val.total,
    }));

    // Save to local Zustand store
    saveMathleticsRound({
      score: correctCount,
      total: totalQuestions,
      pct,
      gradeLabel,
      xpEarned,
      agilityScore,
      questionIds: ids,
      categoryBreakdown: breakdown,
      difficultyMode: selectedDifficulty,
      challengerName: isChallengerMode ? activeChallengerName : undefined,
      challengerScore: isChallengerMode ? activeChallengerScore : undefined,
    });

    // Trigger celebration confetti on high scores
    if (pct >= 70) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#7A1C2E", "#444E2C", "#A67C1E"],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [
    questions,
    userAnswers,
    selectedDifficulty,
    isChallengerMode,
    activeChallengerName,
    activeChallengerScore,
    agilityScore,
    addXP,
    markMathleticsQuestionsSeen,
    saveMathleticsRound,
  ]);

  // Share Challenge Link Creator
  const handleCopyChallengeLink = () => {
    const totalQuestions = questions.length || 10;
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    const pct = Math.round((correctCount / totalQuestions) * 100);

    const challengePayload: MathleticsChallenge = {
      id: "math-" + Date.now(),
      title: `Quant ${questionTimerSeconds}s Challenge`,
      creatorName: profile.username || "Scholar",
      createdAt: Date.now(),
      questionIds: questions.map((q) => q.id),
      questionCount: totalQuestions,
      difficulty: selectedDifficulty,
      questionTimerSeconds,
      creatorScore: {
        score: correctCount,
        total: totalQuestions,
        pct,
        agilityScore,
      },
    };

    const code = encodeChallengeToUrl(challengePayload);
    const url = `${window.location.origin}/games/mathletics?challenge=${code}`;

    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Canvas Proof Card Clipboard Export
  const handleCopyProofCard = async () => {
    setIsExportingCard(true);
    try {
      const totalQuestions = questions.length || 10;
      const correctCount = userAnswers.filter((a) => a.isCorrect).length;
      const pct = Math.round((correctCount / totalQuestions) * 100);

      const canvas = await generateMathleticsCardCanvas({
        score: correctCount,
        total: totalQuestions,
        pct,
        gradeLabel: pct >= 80 ? "Titan" : pct >= 60 ? "Mathlete" : "Scholar",
        author: profile.username || "Scholar",
        agilityScore,
        xpEarned: correctCount * 15 + 25,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          setCardCopied(true);
          setTimeout(() => setCardCopied(false), 2500);
        } catch {
          // Fallback download if clipboard image copy not supported
          const dataUrl = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = `fey-quant-${Date.now()}.png`;
          a.click();
        } finally {
          setIsExportingCard(false);
        }
      });
    } catch (err) {
      console.error("Failed to export proof card:", err);
      setIsExportingCard(false);
    }
  };

  // Titans Leaderboard data
  const leaderboard = useMemo(() => {
    return getMathleticsLeaderboard(profile, mathleticsHistory);
  }, [profile, mathleticsHistory]);

  const currentQ = questions[currentIndex];
  const timerRatio = timeLeft / questionTimerSeconds;
  const isTimeCritical = timeLeft <= Math.min(7, Math.round(questionTimerSeconds * 0.25));

  const handleReturnToSetup = () => {
    setIsTimerActive(false);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setDismissedChallenger(true);
    if (typeof window !== "undefined" && window.location.search) {
      router.replace("/games/mathletics");
    }
    setGameState("setup");
    setActiveTab("arena");
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* ── Top Back Navigation Bar ── */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {activeTab === "arena" && gameState !== "setup" ? (
          <button
            type="button"
            onClick={handleReturnToSetup}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors py-1.5 cursor-pointer group active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 shrink-0" />
            <span>Back to Quant Dashboard</span>
          </button>
        ) : (
          <Link
            href="/games"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors py-1.5 group active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 shrink-0" />
            <span>Back to Games</span>
          </Link>
        )}
      </div>

      {/* ── Top Header Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: "rgba(68, 78, 44, 0.08)",
                borderColor: "var(--olive)",
                color: "var(--olive)",
              }}
            >
              Mental Arena
            </span>
            <span className="text-xs" style={{ color: "var(--text-dim)" }}>
              {questionTimerSeconds}s Sprint
            </span>
          </div>
          <button
            type="button"
            onClick={handleReturnToSetup}
            className="text-left cursor-pointer hover:opacity-80 transition-opacity"
            title="Return to Quant Dashboard"
          >
            <h1 className="font-space text-3xl sm:text-4xl font-bold" style={{ color: "var(--text)" }}>
              Quant
            </h1>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          className="flex p-1 rounded-2xl border self-start sm:self-auto relative"
          style={{ borderColor: "var(--border-dim)", backgroundColor: "var(--surface)" }}
        >
          <button
            onClick={handleReturnToSetup}
            className="relative flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer z-10"
          >
            {activeTab === "arena" && (
              <motion.div
                layoutId="activeMathleticsTab"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                className="absolute inset-0 rounded-xl z-[-1] shadow-xs"
                style={{ backgroundColor: "var(--terra)" }}
              />
            )}
            <User className={`w-3.5 h-3.5 ${activeTab === "arena" ? "text-white" : "text-[var(--text-dim)]"}`} />
            <span className={activeTab === "arena" ? "text-white" : "text-[var(--text-dim)] hover:text-[var(--text)]"}>
              Arena
            </span>
          </button>

          <button
            onClick={() => setActiveTab("leagues")}
            className="relative flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer z-10"
          >
            {activeTab === "leagues" && (
              <motion.div
                layoutId="activeMathleticsTab"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                className="absolute inset-0 rounded-xl z-[-1] shadow-xs"
                style={{ backgroundColor: "var(--terra)" }}
              />
            )}
            <Swords className={`w-3.5 h-3.5 ${activeTab === "leagues" ? "text-white" : "text-[var(--text-dim)]"}`} />
            <span className={activeTab === "leagues" ? "text-white" : "text-[var(--text-dim)] hover:text-[var(--text)]"}>
              Leagues
            </span>
          </button>

          <button
            onClick={() => setActiveTab("titans")}
            className="relative flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer z-10"
          >
            {activeTab === "titans" && (
              <motion.div
                layoutId="activeMathleticsTab"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                className="absolute inset-0 rounded-xl z-[-1] shadow-xs"
                style={{ backgroundColor: "var(--olive)" }}
              />
            )}
            <Crown className={`w-3.5 h-3.5 ${activeTab === "titans" ? "text-white" : "text-[var(--text-dim)]"}`} />
            <span className={activeTab === "titans" ? "text-white" : "text-[var(--text-dim)] hover:text-[var(--text)]"}>
              Titans
            </span>
          </button>
        </div>
      </div>

      {/* ── LEAGUES TAB VIEW ── */}
      {activeTab === "leagues" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MathleticsLeagueLounge />
        </motion.div>
      )}

      {/* ── TITANS TAB VIEW ── */}
      {activeTab === "titans" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="surface rounded-3xl p-6 sm:p-8 border" style={{ borderColor: "var(--border-dim)" }}>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6" style={{ color: "var(--gold)" }} />
              <h2 className="font-space text-xl font-bold" style={{ color: "var(--text)" }}>
                Mathematical Titans Leaderboard
              </h2>
            </div>
            <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>
              Benchmark your mental calculation agility against history’s most revered mathematical minds and fellow scholars.
            </p>

            {/* User Standing Card */}
            <div
              className="p-4 rounded-2xl border mb-6 flex items-center justify-between flex-wrap gap-4"
              style={{
                backgroundColor: "rgba(68, 78, 44, 0.06)",
                borderColor: "var(--olive)",
              }}
            >
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--olive)" }}>
                  Your Current Standing
                </div>
                <div className="text-lg font-bold" style={{ color: "var(--text)" }}>
                  Rank {leaderboard.userEntry.rankBadge} · {leaderboard.userEntry.title}
                </div>
              </div>
              <div className="flex items-center gap-5 text-sm">
                <div>
                  <span className="text-xs block" style={{ color: "var(--text-dim)" }}>Best Score</span>
                  <span className="font-bold" style={{ color: "var(--text)" }}>
                    {leaderboard.userEntry.bestScore}/{leaderboard.userEntry.bestTotal} ({leaderboard.userEntry.bestPct}%)
                  </span>
                </div>
                <div>
                  <span className="text-xs block" style={{ color: "var(--text-dim)" }}>Agility</span>
                  <span className="font-bold font-mono" style={{ color: "var(--olive)" }}>
                    {leaderboard.userEntry.bestAgilityScore} pts
                  </span>
                </div>
                <div>
                  <span className="text-xs block" style={{ color: "var(--text-dim)" }}>Quant XP</span>
                  <span className="font-bold font-mono" style={{ color: "var(--gold)" }}>{leaderboard.userEntry.mathleticsXP} XP</span>
                </div>
              </div>
            </div>

            {/* Titans List */}
            <div className="divide-y" style={{ borderColor: "var(--border-dim)" }}>
              {leaderboard.entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`py-3.5 flex items-center justify-between gap-4 transition-colors ${
                    entry.isUser ? "rounded-xl px-3 my-1 border bg-[var(--surface-hover)]" : ""
                  }`}
                  style={entry.isUser ? { borderColor: "var(--olive)" } : {}}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 font-bold text-sm text-center"
                      style={{ color: entry.badgeColor || "var(--text-dim)" }}
                    >
                      {entry.rankBadge}
                    </span>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2" style={{ color: "var(--text)" }}>
                        {entry.name}
                        {entry.isUser && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-white"
                            style={{ backgroundColor: "var(--terra)" }}
                          >
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-dim)" }}>
                        {entry.title} {entry.historicalBio ? `· ${entry.historicalBio}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold flex items-center justify-end gap-2" style={{ color: "var(--text)" }}>
                      <span>{entry.bestScore}/{entry.bestTotal} ({entry.bestPct}%)</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/25">
                        {entry.bestAgilityScore} pts
                      </span>
                    </div>
                    <div className="text-xs font-mono mt-0.5" style={{ color: "var(--gold)" }}>
                      {entry.mathleticsXP} XP · {entry.gamesPlayed} {entry.gamesPlayed === 1 ? "run" : "runs"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── ARENA TAB VIEW ── */}
      {activeTab === "arena" && (
        <>
          {/* ── STATE 1: SETUP SCREEN ── */}
          {gameState === "setup" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {isChallengerMode ? (
                /* ── Dedicated Head-to-Head Quant Challenge Landing Card ── */
                <div
                  className="rounded-3xl p-6 sm:p-8 surface border relative overflow-hidden shadow-sm space-y-6"
                  style={{
                    borderColor: "var(--border)",
                    background:
                      "linear-gradient(135deg, rgba(122, 28, 46, 0.06) 0%, rgba(68, 78, 44, 0.07) 100%)",
                  }}
                >
                  {/* Header Badges */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono uppercase tracking-wider font-extrabold"
                      style={{
                        backgroundColor: "rgba(122, 28, 46, 0.1)",
                        borderColor: "rgba(122, 28, 46, 0.3)",
                        color: "var(--terra)",
                      }}
                    >
                      <Swords size={12} />
                      <span>Head-to-Head Quant Challenge</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text-dim)]">
                      <ShieldCheck size={12} className="text-[var(--olive)]" />
                      <span>Locked Identical Deck</span>
                    </span>
                  </div>

                  {/* Challenger Score & Agility Plaque */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] shadow-2xs">
                    <div className="space-y-1.5">
                      <div className="text-xs font-mono uppercase tracking-wider font-bold text-[var(--text-mute)]">
                        Target Benchmark to Beat
                      </div>
                      <h2
                        className="font-space font-extrabold text-xl sm:text-2xl tracking-tight"
                        style={{ color: "var(--text)" }}
                      >
                        {activeChallengerName} scored {activeChallengerScore}/{activeChallengerTotal} ({activeChallengerPct}%)
                      </h2>
                      <p className="text-xs sm:text-sm text-[var(--text-dim)] leading-relaxed">
                        Clocked <strong className="text-[var(--olive)] font-mono">{activeChallengerAgility} agility pts</strong> across these{" "}
                        <strong className="text-[var(--text)]">exact {activeChallengerTotal} mental calculation problems</strong>. Can you out-calculate them under the {questionTimerSeconds}s clock?
                      </p>
                    </div>

                    {/* Dual Score Pill: Accuracy + Agility Points */}
                    <div className="flex sm:flex-col items-center justify-center px-5 py-3.5 rounded-2xl bg-[var(--olive)]/10 border border-[var(--olive)]/25 shrink-0 gap-3 sm:gap-1 text-center">
                      <div className="font-mono font-black text-2xl sm:text-3xl text-[var(--terra)] leading-none">
                        {activeChallengerScore}/{activeChallengerTotal}
                        <span className="text-sm font-bold text-[var(--text-dim)] ml-1">({activeChallengerPct}%)</span>
                      </div>
                      <div className="text-xs font-mono font-extrabold text-[var(--olive)]">
                        <span>{activeChallengerAgility} Agility Pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Locked Match Rules & Scoring Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="p-3.5 rounded-2xl bg-[var(--bg-card)]/85 border border-[var(--border-dim)] text-center">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-bold">
                        Deck Size
                      </div>
                      <div className="font-space font-extrabold text-sm sm:text-base text-[var(--text)] mt-0.5">
                        {activeChallengerTotal} Problems
                      </div>
                      <div className="text-[10px] text-[var(--text-dim)] mt-0.5">Locked Cards</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[var(--bg-card)]/85 border border-[var(--border-dim)] text-center">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-bold">
                        Turn Timer
                      </div>
                      <div className="font-space font-extrabold text-sm sm:text-base text-[var(--text)] mt-0.5">
                        {questionTimerSeconds}s / card
                      </div>
                      <div className="text-[10px] text-[var(--text-dim)] mt-0.5">No Calculator</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[var(--bg-card)]/85 border border-[var(--border-dim)] text-center">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-bold">
                        Score Target
                      </div>
                      <div className="font-space font-extrabold text-sm sm:text-base text-[var(--terra)] mt-0.5">
                        {activeChallengerScore}/{activeChallengerTotal} ({activeChallengerPct}%)
                      </div>
                      <div className="text-[10px] text-[var(--text-dim)] mt-0.5">Accuracy</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[var(--bg-card)]/85 border border-[var(--border-dim)] text-center">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-bold">
                        Agility Target
                      </div>
                      <div className="font-space font-extrabold text-sm sm:text-base text-[var(--olive)] mt-0.5">
                        {activeChallengerAgility} pts
                      </div>
                      <div className="text-[10px] text-[var(--text-dim)] mt-0.5">100 + Speed Bonus</div>
                    </div>
                  </div>

                  {/* Primary CTA + Escape Hatch */}
                  <div className="space-y-3 pt-1">
                    <button
                      onClick={() => handleStartRound(false)}
                      className="w-full py-4 rounded-2xl font-space font-extrabold text-base text-white shadow-md transition-all hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                      style={{ backgroundColor: "var(--terra)" }}
                    >
                      <span>Accept Challenge · Solve Same {activeChallengerTotal} Problems</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setDismissedChallenger(true);
                          router.replace("/games/mathletics");
                        }}
                        className="text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] underline underline-offset-4 cursor-pointer transition-colors"
                      >
                        Or switch to the Quant Dashboard instead
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Full Quant Dashboard (Personal Stats + Active Leagues + Solo Sprint Setup) ── */
                <div className="space-y-5">
                  {/* 1. Personal Quant Standing & Stats Summary Bar */}
                  <div
                    className="rounded-3xl p-5 sm:p-6 surface border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    style={{
                      borderColor: "var(--border-dim)",
                      background:
                        "linear-gradient(135deg, rgba(68, 78, 44, 0.06) 0%, rgba(166, 124, 30, 0.05) 100%)",
                    }}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[var(--olive)]">
                          Quant Dashboard · Your Standing
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--olive)]/15 text-[var(--olive)] border border-[var(--olive)]/25">
                          Rank {leaderboard.userEntry.rankBadge}
                        </span>
                      </div>
                      <div className="font-space font-extrabold text-lg sm:text-xl" style={{ color: "var(--text)" }}>
                        {leaderboard.userEntry.name} · {leaderboard.userEntry.title}
                      </div>
                      <p className="text-xs text-[var(--text-dim)]">
                        {mathleticsHistory.length > 0
                          ? `${mathleticsHistory.length} ${mathleticsHistory.length === 1 ? "sprint" : "sprints"} completed · ${seenMathleticsQuestionIds.length} of ${MATHLETICS_QUESTIONS.length} problems explored`
                          : `Explore ${MATHLETICS_QUESTIONS.length} curated mental math, estimation, and probability problems.`}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 shrink-0">
                      <div className="px-3.5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-center">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-bold">
                          Best Score
                        </div>
                        <div className="font-space font-extrabold text-sm text-[var(--text)] mt-0.5">
                          {leaderboard.userEntry.bestScore}/{leaderboard.userEntry.bestTotal} ({leaderboard.userEntry.bestPct}%)
                        </div>
                      </div>

                      <div className="px-3.5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-center">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-bold">
                          Best Agility
                        </div>
                        <div className="font-mono font-extrabold text-sm text-[var(--olive)] mt-0.5">
                          {leaderboard.userEntry.bestAgilityScore} pts
                        </div>
                      </div>

                      <div className="px-3.5 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-center">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-mute)] font-bold">
                          Quant XP
                        </div>
                        <div className="font-mono font-extrabold text-sm text-[var(--gold)] mt-0.5">
                          {leaderboard.userEntry.mathleticsXP} XP
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Active Quant Leagues & Friend Duels Quick-Access Bar */}
                  <div
                    className="rounded-3xl p-5 surface border shadow-xs space-y-3.5"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Swords className="w-4 h-4 text-[var(--terra)]" />
                        <span className="font-space font-bold text-sm text-[var(--text)]">
                          Active Quant Leagues &amp; Duels
                        </span>
                        {activeLeaguePreviews.length > 0 && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--terra)]/10 text-[var(--terra)]">
                            {activeLeaguePreviews.length} Active
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCreateDuelModal(true)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer transition-all shadow-2xs"
                          style={{ backgroundColor: "var(--terra)" }}
                        >
                          + Create League / Duel
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("leagues")}
                          className="px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer hover:bg-[var(--surface-hover)] transition-colors"
                          style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                        >
                          All Leagues →
                        </button>
                      </div>
                    </div>

                    {activeLeaguePreviews.length === 0 ? (
                      <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <span className="text-[var(--text-dim)]">
                          No active Quant leagues yet. Start a 1-round <strong>Sprint Duel</strong> or multi-day <strong>Marathon League</strong> with friends.
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("leagues")}
                          className="text-xs font-bold text-[var(--olive)] hover:underline shrink-0 cursor-pointer"
                        >
                          Join with Code →
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeLeaguePreviews.map(({ league, summary }) => {
                          const isSprint = league.format === "sprint_duel" || league.durationDays === 1;
                          return (
                            <div
                              key={league.code}
                              onClick={() => router.push(`/games/mathletics/league/${league.code}`)}
                              className="p-3.5 rounded-2xl border bg-[var(--bg-card)] hover:border-[var(--terra)]/50 transition-all cursor-pointer flex items-center justify-between gap-3"
                              style={{ borderColor: "var(--border-dim)" }}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-[var(--olive)]/15 text-[var(--olive)]">
                                    {isSprint ? "Sprint Duel" : `Day ${summary.status.dayNumber}/${league.durationDays}`}
                                  </span>
                                  <span className="text-[10px] font-mono text-[var(--text-dim)]">
                                    {league.code}
                                  </span>
                                </div>
                                <div className="font-space font-bold text-sm truncate text-[var(--text)]">
                                  {league.title}
                                </div>
                                <div className="text-[11px] text-[var(--text-dim)]">
                                  {summary.userDaysCompleted > 0
                                    ? `Rank #${summary.userRank} · ${summary.userTotalCorrect}/${summary.userDaysCompleted * 10} (${summary.userTotalPoints} agility pts)`
                                    : `Host: ${league.creatorName} · 10 Problems`}
                                </div>
                              </div>
                              <span
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shrink-0"
                                style={{ backgroundColor: summary.hasCompletedToday ? "var(--olive)" : "var(--terra)" }}
                              >
                                {summary.hasCompletedToday ? "Board" : "Play"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. Standard Solo Quant Setup Card */}
                  <div className="surface rounded-3xl p-6 sm:p-8 border" style={{ borderColor: "var(--border-dim)" }}>
                    <div className="max-w-2xl">
                      <h2 className="font-space text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
                        {questionTimerSeconds}-Second Mental Calculation
                      </h2>
                      <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-dim)" }}>
                        No scratchpad, no calculators. Test your mathematical intuition, order-of-magnitude estimation, and Socratic shortcuts against a running clock.
                      </p>

                      {/* Turn Duration Selector (Min 25s) */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
                            Question Duration
                          </label>
                          <span className="text-xs font-semibold" style={{ color: "var(--olive)" }}>
                            Min 25s per question
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { sec: 25, label: "25s", desc: "Blitz" },
                            { sec: 45, label: "45s", desc: "Standard" },
                            { sec: 60, label: "60s", desc: "Deliberate" },
                            { sec: 90, label: "90s", desc: "Extended" },
                          ].map((d) => (
                            <button
                              key={d.sec}
                              type="button"
                              onClick={() => {
                                setQuestionTimerSeconds(d.sec);
                                setTimeLeft(d.sec);
                              }}
                              className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                                questionTimerSeconds === d.sec
                                  ? "bg-[var(--terra)] text-white border-[var(--terra)] shadow-xs"
                                  : "border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text-dim)]"
                              }`}
                            >
                              <span className="font-bold block">{d.label}</span>
                              <span className={`text-[10px] block mt-0.5 ${questionTimerSeconds === d.sec ? "text-white/80" : "text-[var(--text-dim)]"}`}>
                                {d.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty Selector */}
                      <div className="mb-6">
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-dim)" }}>
                          Select Difficulty
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {(["random", "easy", "medium", "hard"] as const).map((diff) => (
                            <button
                              key={diff}
                              onClick={() => setSelectedDifficulty(diff)}
                              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center capitalize cursor-pointer ${
                                selectedDifficulty === diff
                                  ? "bg-[var(--olive)] text-white border-[var(--olive)] shadow-sm"
                                  : "border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text-dim)]"
                              }`}
                            >
                              {diff === "random" ? "Mixed" : diff}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Topic Selector */}
                      <div className="mb-8">
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-dim)" }}>
                          Topic Focus
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedCategory("all")}
                            className={`py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                              selectedCategory === "all"
                                ? "bg-[var(--terra)] text-white border-[var(--terra)]"
                                : "border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)]"
                            }`}
                          >
                            All Categories
                          </button>
                          {MATHLETICS_CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                                selectedCategory === cat
                                  ? "bg-[var(--terra)] text-white border-[var(--terra)]"
                                  : "border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)]"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Start Action Button */}
                      <button
                        onClick={() => handleStartRound(true)}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        style={{ backgroundColor: "var(--terra)" }}
                      >
                        <span>Begin Sprint</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STATE 2: ACTIVE QUESTION VIEW ── */}
          {gameState === "playing" && currentQ && (
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Progress & Countdown Header */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--olive)" }}>
                    Question {currentIndex + 1} of {questions.length}
                  </div>
                  <div className="text-sm font-semibold mt-0.5" style={{ color: "var(--text-dim)" }}>
                    {currentQ.category} · <span className="capitalize">{currentQ.difficulty}</span>
                  </div>
                </div>

                {/* Circular / Pill Countdown Timer */}
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors"
                  style={{
                    backgroundColor: isTimeCritical ? "rgba(181, 58, 58, 0.12)" : "var(--surface)",
                    borderColor: isTimeCritical ? "var(--red)" : "var(--border-dim)",
                    color: isTimeCritical ? "var(--red)" : "var(--text)",
                  }}
                >
                  <Timer className={`w-4 h-4 ${isTimeCritical ? "animate-pulse" : ""}`} />
                  <span className="font-mono font-bold text-sm">{timeLeft}s</span>
                </div>
              </div>

              {/* Countdown Progress Bar */}
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-hover)" }}>
                <div
                  className="h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{
                    width: `${timerRatio * 100}%`,
                    backgroundColor: isTimeCritical ? "var(--red)" : "var(--olive)",
                  }}
                />
              </div>

              {/* Question Card */}
              <div className="surface rounded-3xl p-6 sm:p-10 border shadow-sm" style={{ borderColor: "var(--border-dim)" }}>
                <div className="text-lg sm:text-2xl font-serif font-medium leading-relaxed mb-8" style={{ color: "var(--text)" }}>
                  <MathView>{currentQ.question}</MathView>
                </div>

                {/* 4 Multiple Choice Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.answer;

                    let buttonBg = "var(--surface)";
                    let buttonBorder = "var(--border-dim)";
                    let textColor = "var(--text)";

                    if (isAnswerRevealed) {
                      if (isCorrect) {
                        buttonBg = "rgba(68, 78, 44, 0.14)";
                        buttonBorder = "var(--olive)";
                        textColor = "var(--olive)";
                      } else if (isSelected) {
                        buttonBg = "rgba(181, 58, 58, 0.12)";
                        buttonBorder = "var(--red)";
                        textColor = "var(--red)";
                      }
                    } else if (isSelected) {
                      buttonBg = "rgba(122, 28, 46, 0.08)";
                      buttonBorder = "var(--terra)";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerRevealed}
                        className="p-4 rounded-2xl border text-left font-serif transition-all flex items-center justify-between group disabled:cursor-default active:scale-[0.99]"
                        style={{
                          backgroundColor: buttonBg,
                          borderColor: buttonBorder,
                          color: textColor,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-6 h-6 rounded-full border text-xs flex items-center justify-center font-sans font-bold flex-shrink-0"
                            style={{ borderColor: buttonBorder }}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-base sm:text-lg">
                            <MathView>{opt}</MathView>
                          </span>
                        </div>

                        {isAnswerRevealed && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "var(--olive)" }} />
                        )}
                        {isAnswerRevealed && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: "var(--red)" }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feynman Socratic Shortcut Box (Shown After Selection) */}
                <AnimatePresence>
                  {isAnswerRevealed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-2xl p-4 sm:p-5 border mb-6"
                      style={{
                        backgroundColor: "rgba(68, 78, 44, 0.05)",
                        borderColor: "var(--olive)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider" style={{ color: "var(--olive)" }}>
                        <Sparkles className="w-4 h-4" />
                        <span>The Feynman Shortcut</span>
                      </div>
                      <div className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                        <MathView>{currentQ.explanation}</MathView>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Next Question CTA */}
                {isAnswerRevealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm flex items-center gap-2 transition-all active:scale-95"
                      style={{ backgroundColor: "var(--terra)" }}
                    >
                      <span>{currentIndex + 1 < questions.length ? "Next Question" : "See Results"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STATE 3: ROUND SUMMARY ── */}
          {gameState === "summary" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary Card */}
              <div className="surface rounded-3xl p-6 sm:p-10 border shadow-sm" style={{ borderColor: "var(--border-dim)" }}>
                <div className="text-center max-w-md mx-auto mb-8">
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-3 inline-block"
                    style={{
                      backgroundColor: "rgba(166, 124, 30, 0.1)",
                      borderColor: "var(--gold)",
                      color: "var(--gold)",
                    }}
                  >
                    Sprint Complete
                  </span>

                  {/* Hero Score */}
                  <div className="font-space text-6xl sm:text-7xl font-bold my-2" style={{ color: "var(--terra)" }}>
                    {userAnswers.filter((a) => a.isCorrect).length}
                    <span className="text-3xl sm:text-4xl" style={{ color: "var(--text-dim)" }}>
                      /{questions.length}
                    </span>
                  </div>

                  <div className="text-lg font-bold" style={{ color: "var(--text)" }}>
                    {Math.round((userAnswers.filter((a) => a.isCorrect).length / (questions.length || 1)) * 100)}% Accuracy
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                    Mental Agility Rating: <strong style={{ color: "var(--text)" }}>{agilityScore} pts</strong>
                  </div>
                </div>

                {/* Challenger Comparison if in Duel */}
                {isChallengerMode && (
                  <div
                    className="p-4 sm:p-5 rounded-2xl border mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    style={{
                      backgroundColor: "rgba(122, 28, 46, 0.05)",
                      borderColor: "var(--terra)",
                    }}
                  >
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--terra)" }}>
                        Duel Outcome
                      </div>
                      <div className="text-sm sm:text-base font-bold mt-0.5" style={{ color: "var(--text)" }}>
                        {agilityScore > activeChallengerAgility ||
                        (agilityScore === activeChallengerAgility &&
                          userAnswers.filter((a) => a.isCorrect).length > activeChallengerScore)
                          ? `Victory! You out-calculated ${activeChallengerName}`
                          : userAnswers.filter((a) => a.isCorrect).length === activeChallengerScore &&
                            agilityScore === activeChallengerAgility
                          ? `Honorable Tie with ${activeChallengerName}`
                          : `${activeChallengerName} retained the lead`}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 text-xs font-mono">
                      <div className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-dim)]">
                        <span className="text-[var(--text-dim)]">{activeChallengerName}:</span>{" "}
                        <strong className="text-[var(--text)]">{activeChallengerScore}/{activeChallengerTotal}</strong>{" "}
                        <span className="text-[var(--olive)] font-bold">({activeChallengerAgility} agility pts)</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-dim)]">
                        <span className="text-[var(--text-dim)]">You:</span>{" "}
                        <strong className="text-[var(--text)]">{userAnswers.filter((a) => a.isCorrect).length}/{questions.length}</strong>{" "}
                        <span className="text-[var(--terra)] font-bold">({agilityScore} agility pts)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 mb-10">
                  <button
                    onClick={() => handleStartRound(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    style={{ backgroundColor: "var(--terra)" }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Fresh Round</span>
                  </button>

                  <button
                    onClick={handleReturnToSetup}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all surface cursor-pointer hover:border-[var(--text-dim)]"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                  >
                    <ArrowLeft className="w-4 h-4 text-[var(--olive)]" />
                    <span>Quant Dashboard</span>
                  </button>

                  <button
                    onClick={() => setShowCreateDuelModal(true)}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all surface cursor-pointer hover:border-[var(--text-dim)]"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                  >
                    <Swords className="w-4 h-4 text-[var(--terra)]" />
                    <span>Create Friend Duel</span>
                  </button>

                  <button
                    onClick={handleCopyProofCard}
                    disabled={isExportingCard}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all surface cursor-pointer hover:border-[var(--text-dim)]"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                  >
                    {cardCopied ? <Check className="w-4 h-4 text-green-600" /> : <Download className="w-4 h-4" />}
                    <span>{cardCopied ? "Proof Card Copied!" : "Share Proof Card"}</span>
                  </button>
                </div>

                {/* Socratic Review: Question-by-Question Breakdown */}
                <div className="border-t pt-8" style={{ borderColor: "var(--border-dim)" }}>
                  <h3 className="font-space font-bold text-lg mb-4" style={{ color: "var(--text)" }}>
                    Round Review &amp; Socratic Shortcuts
                  </h3>

                  <div className="space-y-4">
                    {userAnswers.map((ans, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border"
                        style={{
                          backgroundColor: ans.isCorrect
                            ? "rgba(68, 78, 44, 0.04)"
                            : "rgba(181, 58, 58, 0.04)",
                          borderColor: ans.isCorrect ? "var(--olive)" : "var(--red)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="text-sm font-bold font-serif" style={{ color: "var(--text)" }}>
                            <span className="font-sans mr-2 text-xs" style={{ color: "var(--text-dim)" }}>
                              Q{idx + 1}.
                            </span>
                            <MathView>{ans.question.question}</MathView>
                          </div>
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: ans.isCorrect ? "var(--olive)" : "var(--red)",
                              color: "#FFF",
                            }}
                          >
                            {ans.isCorrect ? `+${100 + ans.bonusPoints} pts` : "Missed"}
                          </span>
                        </div>

                        <div className="text-xs mb-2" style={{ color: "var(--text-dim)" }}>
                          Your answer:{" "}
                          <strong style={{ color: ans.isCorrect ? "var(--olive)" : "var(--red)" }}>
                            {ans.selected >= 0 ? <MathView>{ans.question.options[ans.selected]}</MathView> : "Timed out"}
                          </strong>
                          {!ans.isCorrect && (
                            <>
                              {" "}· Correct:{" "}
                              <strong style={{ color: "var(--olive)" }}>
                                <MathView>{ans.question.options[ans.question.answer]}</MathView>
                              </strong>
                            </>
                          )}
                        </div>

                        <div
                          className="text-xs p-3 rounded-xl border mt-2 leading-relaxed"
                          style={{
                            backgroundColor: "var(--surface)",
                            borderColor: "var(--border-dim)",
                            color: "var(--text-dim)",
                          }}
                        >
                          <strong className="block text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--olive)" }}>
                            Shortcut:
                          </strong>
                          <MathView>{ans.question.explanation}</MathView>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Preloaded Sprint Duel Modal */}
      <CreateMathleticsLeagueModal
        isOpen={showCreateDuelModal}
        onClose={() => setShowCreateDuelModal(false)}
        preloadedQuestionIds={questions.map((q) => q.id)}
        preloadedDifficulty={selectedDifficulty}
        preloadedCategory={selectedCategory}
        preloadedTimerSeconds={questionTimerSeconds}
        onLeagueCreated={(createdLeague) => {
          // Immediately register creator's finished score into the new league!
          const correctCount = userAnswers.filter((a) => a.isCorrect).length;
          const totalQuestions = questions.length || 10;
          const totalDuration = userAnswers.reduce((sum, a) => sum + (a.timeSpentSeconds || 0), 0);

          fetch("/api/mathletics/league/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              leagueCode: createdLeague.code,
              userId: profile.id || profile.username || "Scholar",
              username: profile.username || "Scholar",
              avatar: profile.avatar || "/avatars/avatar-scholar.svg",
              dayNumber: 1,
              score: correctCount,
              totalQuestions,
              durationSeconds: totalDuration,
              questionResults: userAnswers.map((a) => ({
                questionId: a.question.id,
                correct: a.isCorrect,
                selected: a.selected,
                timeSpentSeconds: a.timeSpentSeconds,
              })),
            }),
          }).catch(() => {});
        }}
      />
    </div>
  );
}
