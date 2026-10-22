"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRight,
  Crown,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  Flame,
  Award,
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
import { generateMathleticsCardCanvas } from "@/lib/mathletics-card-canvas";
import { useAppStore } from "@/store/useAppStore";

export interface ChallengerInfo {
  name: string;
  score: number;
  total: number;
  pct: number;
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
  const [activeTab, setActiveTab] = useState<"arena" | "titans">("arena");
  const [gameState, setGameState] = useState<"setup" | "playing" | "summary">("setup");

  // Setup options
  const [selectedDifficulty, setSelectedDifficulty] = useState<MathleticsDifficultyFilter>(
    initialChallenge?.difficulty || "random"
  );
  const [selectedCategory, setSelectedCategory] = useState<MathleticsCategory | "all">("all");
  const [questionCount] = useState<number>(10);

  // Active Game State
  const [questions, setQuestions] = useState<MathleticsQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
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

  // Challenge context
  const activeChallenge = initialChallenge || null;
  const isChallengerMode = Boolean(challengerInfo || activeChallenge?.creatorScore);
  const activeChallengerName =
    challengerInfo?.name || activeChallenge?.creatorName || "Challenger";
  const activeChallengerScore =
    challengerInfo?.score ?? activeChallenge?.creatorScore?.score ?? 0;
  const activeChallengerTotal =
    challengerInfo?.total ?? activeChallenge?.creatorScore?.total ?? 10;
  const activeChallengerPct =
    challengerInfo?.pct ?? activeChallenge?.creatorScore?.pct ?? 0;

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

  // Start new round
  const handleStartRound = () => {
    let roundQuestions: MathleticsQuestion[] = [];

    if (activeChallenge && activeChallenge.questionIds.length > 0) {
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
    setTimeLeft(QUESTION_TIME_LIMIT);
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
    const timeSpent = QUESTION_TIME_LIMIT - timeLeft;

    // Speed bonus: up to +50 points for quick answers
    let bonus = 0;
    if (isCorrect) {
      const speedRatio = Math.max(0, timeLeft / QUESTION_TIME_LIMIT);
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
        timeSpentSeconds: QUESTION_TIME_LIMIT,
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
      setTimeLeft(QUESTION_TIME_LIMIT);
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
      title: "Mathletics 25s Challenge",
      creatorName: profile.username || "Scholar",
      createdAt: Date.now(),
      questionIds: questions.map((q) => q.id),
      questionCount: totalQuestions,
      difficulty: selectedDifficulty,
      creatorScore: {
        score: correctCount,
        total: totalQuestions,
        pct,
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
          a.download = `fey-mathletics-${Date.now()}.png`;
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
  const timerRatio = timeLeft / QUESTION_TIME_LIMIT;
  const isTimeCritical = timeLeft <= 7;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-4xl mx-auto">
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
              25s Sprint
            </span>
          </div>
          <h1 className="font-space text-3xl sm:text-4xl font-bold" style={{ color: "var(--text)" }}>
            Mathletics
          </h1>
        </div>

        {/* Navigation Tabs */}
        <div
          className="flex p-1 rounded-2xl border self-start sm:self-auto"
          style={{ borderColor: "var(--border-dim)", backgroundColor: "var(--surface)" }}
        >
          <button
            onClick={() => setActiveTab("arena")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === "arena"
                ? "bg-[var(--terra)] text-white shadow-sm"
                : "text-[var(--text-dim)] hover:text-[var(--text)]"
            }`}
          >
            Arena
          </button>
          <button
            onClick={() => setActiveTab("titans")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
              activeTab === "titans"
                ? "bg-[var(--olive)] text-white shadow-sm"
                : "text-[var(--text-dim)] hover:text-[var(--text)]"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            Titans
          </button>
        </div>
      </div>

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
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-xs block" style={{ color: "var(--text-dim)" }}>Accuracy</span>
                  <span className="font-bold" style={{ color: "var(--text)" }}>{leaderboard.userEntry.bestPct}%</span>
                </div>
                <div>
                  <span className="text-xs block" style={{ color: "var(--text-dim)" }}>Mathletics XP</span>
                  <span className="font-bold" style={{ color: "var(--gold)" }}>{leaderboard.userEntry.mathleticsXP} XP</span>
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
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: "var(--text)" }}>
                      {entry.bestScore}/{entry.bestTotal} ({entry.bestPct}%)
                    </div>
                    <div className="text-xs" style={{ color: "var(--gold)" }}>
                      {entry.mathleticsXP} XP
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
              {/* Challenger Banner if opened via challenge link */}
              {isChallengerMode && (
                <div
                  className="surface rounded-2xl p-4 sm:p-5 border flex items-center gap-4"
                  style={{
                    backgroundColor: "rgba(122, 28, 46, 0.05)",
                    borderColor: "var(--terra)",
                  }}
                >
                  <Swords className="w-8 h-8 flex-shrink-0" style={{ color: "var(--terra)" }} />
                  <div>
                    <h3 className="font-space font-bold text-base" style={{ color: "var(--text)" }}>
                      Challenge from {activeChallengerName}
                    </h3>
                    <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-dim)" }}>
                      Scored <strong style={{ color: "var(--terra)" }}>{activeChallengerScore}/{activeChallengerTotal}</strong> ({activeChallengerPct}% accuracy) on these exact questions. Can you out-calculate them in 25 seconds?
                    </p>
                  </div>
                </div>
              )}

              {/* Main Game Intro Card */}
              <div className="surface rounded-3xl p-6 sm:p-8 border" style={{ borderColor: "var(--border-dim)" }}>
                <div className="max-w-2xl">
                  <h2 className="font-space text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>
                    25-Second Mental Calculation
                  </h2>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-dim)" }}>
                    No scratchpad, no calculators. Test your mathematical intuition, order-of-magnitude estimation, and Socratic shortcuts against a running clock.
                  </p>

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
                          className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center capitalize ${
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
                        className={`py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
                          selectedCategory === "all"
                            ? "bg-[var(--terra)] text-white border-[var(--terra)]"
                            : "border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)]"
                        }`}
                      >
                        All 5 Pillars
                      </button>
                      {MATHLETICS_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
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
                    onClick={handleStartRound}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--terra)" }}
                  >
                    <span>{isChallengerMode ? "Accept Challenge" : "Begin Sprint"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
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
                    className="p-4 rounded-2xl border mb-8 flex items-center justify-between"
                    style={{
                      backgroundColor: "rgba(122, 28, 46, 0.05)",
                      borderColor: "var(--terra)",
                    }}
                  >
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--terra)" }}>
                        Duel Outcome
                      </div>
                      <div className="text-sm font-bold mt-0.5" style={{ color: "var(--text)" }}>
                        {userAnswers.filter((a) => a.isCorrect).length > activeChallengerScore
                          ? `Victory! You beat ${activeChallengerName}`
                          : userAnswers.filter((a) => a.isCorrect).length === activeChallengerScore
                          ? `Honorable Tie with ${activeChallengerName}`
                          : `${activeChallengerName} retained the lead`}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div>{activeChallengerName}: {activeChallengerScore}/{activeChallengerTotal}</div>
                      <div>You: {userAnswers.filter((a) => a.isCorrect).length}/{questions.length}</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
                  <button
                    onClick={handleStartRound}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                    style={{ backgroundColor: "var(--terra)" }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Another Round</span>
                  </button>

                  <button
                    onClick={handleCopyChallengeLink}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                    <span>{copiedLink ? "Challenge Link Copied!" : "Challenge a Friend"}</span>
                  </button>

                  <button
                    onClick={handleCopyProofCard}
                    disabled={isExportingCard}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all"
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
                            {ans.selected >= 0 ? ans.question.options[ans.selected] : "Timed out"}
                          </strong>
                          {!ans.isCorrect && (
                            <>
                              {" "}· Correct:{" "}
                              <strong style={{ color: "var(--olive)" }}>
                                {ans.question.options[ans.question.answer]}
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
    </div>
  );
}
