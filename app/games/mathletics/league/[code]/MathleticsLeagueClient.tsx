"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Swords,
  Timer,
  RotateCcw,
  Share2,
  Check,
  Sparkles,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Crown,
  CheckCircle2,
  XCircle,
  Download,
  Users,
  Award,
  Lock,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MathView } from "@/components/math/MathView";
import {
  type MathleticsLeague,
  type MathleticsLeagueScore,
  type MathleticsLeaderboardEntry,
  getMathleticsLeagueStatus,
  getQuestionsForMathleticsLeagueDay,
  calculateMathleticsPoints,
  aggregateMathleticsLeaderboard,
  generateDailyMathleticsQuestions,
  mergeMathleticsLeagueState,
  saveLocalMathleticsLeague,
  removeLocalMathleticsLeague,
  getMathleticsLeagueShareUrl,
  normalizeMathleticsScore,
} from "@/lib/mathletics-league";
import { type MathleticsQuestion } from "@/lib/mathletics-questions";
import { generateMathleticsCardCanvas } from "@/lib/mathletics-card-canvas";
import { copyTextToClipboard } from "@/lib/clipboard";
import { useAppStore } from "@/store/useAppStore";
import { todayStr, cn } from "@/lib/utils";

interface MathleticsLeagueClientProps {
  code?: string;
  initialLeague: MathleticsLeague;
  initialScores: MathleticsLeagueScore[];
  initialLeaderboard: MathleticsLeaderboardEntry[];
}

const QUESTION_TIME_LIMIT = 25;

export default function MathleticsLeagueClient({
  code,
  initialLeague,
  initialScores,
  initialLeaderboard,
}: MathleticsLeagueClientProps) {
  const router = useRouter();
  const { profile, addXP } = useAppStore();

  const [league, setLeague] = useState<MathleticsLeague>(initialLeague);
  const [scores, setScores] = useState<MathleticsLeagueScore[]>(initialScores);
  const [leaderboard, setLeaderboard] = useState<MathleticsLeaderboardEntry[]>(initialLeaderboard);

  // Sync with local storage on mount
  useEffect(() => {
    const leagueCode = code || initialLeague.code;
    if (typeof window !== "undefined" && leagueCode) {
      try {
        const stored = localStorage.getItem(`fey_math_league_${leagueCode}`);
        let activeLeague = initialLeague;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.code) {
            activeLeague = mergeMathleticsLeagueState(initialLeague, parsed);
            setLeague(activeLeague);
          }
        }
        saveLocalMathleticsLeague(activeLeague);

        const storedScoresRaw = localStorage.getItem(`fey_math_league_scores_${leagueCode}`);
        const localScores: MathleticsLeagueScore[] = storedScoresRaw ? JSON.parse(storedScoresRaw) : [];

        if (localScores.length > 0 || initialScores.length > 0) {
          const scoreMap = new Map<string, MathleticsLeagueScore>();
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
          const merged = Array.from(scoreMap.values()).map(normalizeMathleticsScore);
          setScores(merged);
          const currentStatus = getMathleticsLeagueStatus(activeLeague.startDate, activeLeague.durationDays);
          setLeaderboard(aggregateMathleticsLeaderboard(merged, currentStatus.dayNumber));
        }
      } catch {}
    }
  }, [code, initialLeague, initialScores]);

  // Phase state: overview | playing | round_summary
  const [phase, setPhase] = useState<"overview" | "playing" | "round_summary">("overview");

  // Game state
  const [activeDay, setActiveDay] = useState<number>(1);
  const [questions, setQuestions] = useState<MathleticsQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialLeague.questionTimerSeconds || 25);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [userAnswers, setUserAnswers] = useState<
    Array<{
      question: MathleticsQuestion;
      selected: number;
      isCorrect: boolean;
      timeSpentSeconds: number;
      bonusPoints: number;
    }>
  >([]);
  const [roundAgilityScore, setRoundAgilityScore] = useState(0);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [attemptFeedback, setAttemptFeedback] = useState("");

  // Share and proof card
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingCard, setIsExportingCard] = useState(false);
  const [cardCopied, setCardCopied] = useState(false);

  const questionTimeLimit = Math.max(25, Number(league.questionTimerSeconds) || 25);
  const status = getMathleticsLeagueStatus(league.startDate, league.durationDays);
  const isSprintDuel = league.format === "sprint_duel" || league.durationDays === 1;

  const myUsername = (profile.username || "Scholar").trim().toLowerCase();
  const myUserId = profile.id || myUsername;

  // Check if current user has already completed each day
  const myScoresByDay = useMemo(() => {
    const map = new Map<number, MathleticsLeagueScore>();
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

  const hasCompletedCurrentDay = Boolean(myScoresByDay.get(status.dayNumber));

  // Host verification
  const isCreator = useMemo(() => {
    const cleanUser = myUsername;
    const creatorUser = (league.creatorName || "").trim().toLowerCase();
    if (creatorUser && cleanUser && creatorUser === cleanUser) return true;
    if (league.creatorId && profile.id && league.creatorId === profile.id) return true;
    return false;
  }, [league.creatorName, league.creatorId, myUsername, profile.id]);

  // Start Sprint Round
  function handleStartSprint(dayNumber: number = status.dayNumber) {
    if (myScoresByDay.has(dayNumber)) {
      setAttemptFeedback(
        isSprintDuel
          ? "You have already completed this Sprint Duel. Scores are locked to preserve competitive fairness."
          : `You have already completed Day ${dayNumber}. Scores are locked.`
      );
      return;
    }

    const roundQuestions = getQuestionsForMathleticsLeagueDay(league, dayNumber);
    setActiveDay(dayNumber);
    setQuestions(roundQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setUserAnswers([]);
    setRoundAgilityScore(0);
    setTimeLeft(questionTimeLimit);
    setIsTimerActive(true);
    setAttemptFeedback("");
    setPhase("playing");
  }

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerActive || phase !== "playing") return;

    if (timeLeft <= 0) {
      handleTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft, phase]);

  function handleSelectOption(optionIndex: number) {
    if (isAnswerRevealed || selectedOption !== null) return;

    setIsTimerActive(false);
    setSelectedOption(optionIndex);
    setIsAnswerRevealed(true);

    const currentQ = questions[currentIndex];
    const isCorrect = optionIndex === currentQ.answer;
    const timeSpent = questionTimeLimit - timeLeft;

    let bonus = 0;
    if (isCorrect) {
      const speedRatio = Math.max(0, timeLeft / questionTimeLimit);
      bonus = Math.round(speedRatio * 50);
      setRoundAgilityScore((prev) => prev + 100 + bonus);
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
  }

  function handleTimeExpired() {
    if (isAnswerRevealed) return;
    setIsTimerActive(false);
    setSelectedOption(-1);
    setIsAnswerRevealed(true);

    const currentQ = questions[currentIndex];
    setUserAnswers((prev) => [
      ...prev,
      {
        question: currentQ,
        selected: -1,
        isCorrect: false,
        timeSpentSeconds: questionTimeLimit,
        bonusPoints: 0,
      },
    ]);
  }

  function handleNextQuestion() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
      setTimeLeft(questionTimeLimit);
      setIsTimerActive(true);
    } else {
      finishSprintRound();
    }
  }

  // Complete round and submit score
  const finishSprintRound = useCallback(async () => {
    setIsTimerActive(false);
    setPhase("round_summary");

    const totalQuestions = questions.length || 10;
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    const totalDuration = userAnswers.reduce((sum, a) => sum + (a.timeSpentSeconds || 0), 0);

    const xpEarned = correctCount * 15 + 25;
    addXP(xpEarned);

    if (correctCount >= 7) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#7A1C2E", "#444E2C", "#A67C1E"],
        });
      } catch {}
    }

    // Submit to API
    setIsSubmittingScore(true);
    const scorePayload: MathleticsLeagueScore = {
      leagueCode: league.code,
      userId: myUserId,
      username: profile.username || "Scholar",
      avatar: profile.avatar || "/avatars/avatar-scholar.svg",
      dayNumber: activeDay,
      date: todayStr(),
      score: correctCount,
      totalQuestions,
      agilityScore: roundAgilityScore,
      points: roundAgilityScore,
      durationSeconds: totalDuration,
      questionResults: userAnswers.map((a) => ({
        questionId: a.question.id,
        correct: a.isCorrect,
        selected: a.selected,
        timeSpentSeconds: a.timeSpentSeconds,
      })),
    };

    // Save locally
    const storedRaw = localStorage.getItem(`fey_math_league_scores_${league.code}`);
    const localScores: MathleticsLeagueScore[] = storedRaw ? JSON.parse(storedRaw) : [];
    const updatedLocal = [...localScores.filter((s) => s.dayNumber !== activeDay), scorePayload];
    localStorage.setItem(`fey_math_league_scores_${league.code}`, JSON.stringify(updatedLocal));

    setScores((prev) => {
      const next = [...prev.filter((s) => s.dayNumber !== activeDay || s.username !== scorePayload.username), scorePayload];
      const curStatus = getMathleticsLeagueStatus(league.startDate, league.durationDays);
      setLeaderboard(aggregateMathleticsLeaderboard(next, curStatus.dayNumber));
      return next;
    });

    try {
      await fetch("/api/mathletics/league/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scorePayload),
      });
    } catch (err) {
      console.warn("Failed to submit score to cloud (stored locally):", err);
    } finally {
      setIsSubmittingScore(false);
    }
  }, [questions, userAnswers, activeDay, league, myUserId, profile, roundAgilityScore, addXP]);

  async function handleCopyShareLink() {
    const url = getMathleticsLeagueShareUrl(league);
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  }

  async function handleCopyProofCard() {
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
        agilityScore: roundAgilityScore,
        xpEarned: correctCount * 15 + 25,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCardCopied(true);
          setTimeout(() => setCardCopied(false), 2500);
        } catch {
          const dataUrl = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = `fey-mathletics-league-${Date.now()}.png`;
          a.click();
        } finally {
          setIsExportingCard(false);
        }
      });
    } catch {
      setIsExportingCard(false);
    }
  }

  const currentQ = questions[currentIndex];
  const timerRatio = timeLeft / questionTimeLimit;
  const isTimeCritical = timeLeft <= Math.min(7, Math.round(questionTimeLimit * 0.25));

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
      {/* ── TOP BREADCRUMB NAVIGATION ── */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => (phase === "overview" ? router.push("/games/mathletics") : setPhase("overview"))}
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{phase === "overview" ? "Mathletics Arena" : "League Standings"}</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
            style={{
              backgroundColor: isSprintDuel ? "rgba(122, 28, 46, 0.08)" : "rgba(68, 78, 44, 0.08)",
              borderColor: isSprintDuel ? "var(--terra)" : "var(--olive)",
              color: isSprintDuel ? "var(--terra)" : "var(--olive)",
            }}
          >
            {isSprintDuel ? "Sprint Duel" : `Marathon · Day ${status.dayNumber}`}
          </span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg border surface text-[var(--text-dim)]" style={{ borderColor: "var(--border-dim)" }}>
            {league.code}
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 1: LEAGUE OVERVIEW & LEADERBOARD
      ═══════════════════════════════════════════════════════════════════ */}
      {phase === "overview" && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Hero Banner Card */}
          <div className="surface rounded-3xl p-6 sm:p-8 border shadow-xs" style={{ borderColor: "var(--border-dim)" }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center border"
                    style={{
                      backgroundColor: isSprintDuel ? "rgba(122, 28, 46, 0.1)" : "rgba(68, 78, 44, 0.1)",
                      borderColor: isSprintDuel ? "var(--terra)" : "var(--olive)",
                      color: isSprintDuel ? "var(--terra)" : "var(--olive)",
                    }}
                  >
                    {isSprintDuel ? <Swords className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">
                    {isSprintDuel ? "Head-to-Head Duel" : `${league.durationDays}-Day Tournament`}
                  </span>
                </div>

                <h1 className="font-space text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text)" }}>
                  {league.title}
                </h1>

                <p className="text-xs sm:text-sm text-[var(--text-dim)] flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>Host: <strong>{league.creatorName}</strong></span>
                  <span>•</span>
                  <span>10 Questions ({questionTimeLimit}s Sprint)</span>
                  <span>•</span>
                  <span className="capitalize">{league.difficulty} Difficulty</span>
                  <span>•</span>
                  <span>{leaderboard.length} Scholars Contending</span>
                </p>
              </div>

              {/* Action Button */}
              <div className="flex flex-col gap-2 shrink-0">
                {hasCompletedCurrentDay ? (
                  <div className="p-3 rounded-2xl border text-center text-xs" style={{ borderColor: "var(--olive)", backgroundColor: "rgba(68, 78, 44, 0.06)" }}>
                    <div className="font-bold flex items-center justify-center gap-1.5" style={{ color: "var(--olive)" }}>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSprintDuel ? "Duel Completed" : `Day ${status.dayNumber} Completed`}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-dim)] mt-0.5">
                      Your Score: {myScoresByDay.get(status.dayNumber)?.points} pts
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartSprint(status.dayNumber)}
                    className="px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    style={{ backgroundColor: "var(--terra)" }}
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isSprintDuel ? "Begin Sprint Duel" : `Begin Day ${status.dayNumber} Sprint`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="px-4 py-2.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 surface transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Challenge Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Invite Friends</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {attemptFeedback && (
              <div className="mt-4 p-3 rounded-xl border text-xs font-medium" style={{ borderColor: "var(--gold)", backgroundColor: "rgba(166, 124, 30, 0.08)", color: "var(--text)" }}>
                {attemptFeedback}
              </div>
            )}
          </div>

          {/* Leaderboard Table Card */}
          <div className="surface rounded-3xl p-6 sm:p-8 border shadow-xs" style={{ borderColor: "var(--border-dim)" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5" style={{ color: "var(--gold)" }} />
                <h2 className="font-space text-lg font-bold" style={{ color: "var(--text)" }}>
                  Live Standings
                </h2>
              </div>
              <span className="text-xs font-mono font-semibold text-[var(--text-dim)]">
                Ranked by Agility Points
              </span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Users className="w-8 h-8 mx-auto text-[var(--text-dim)] opacity-50" />
                <p className="text-xs text-[var(--text-dim)]">
                  No scholars have run the sprint yet. Be the first to set the benchmark!
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--border-dim)" }}>
                {leaderboard.map((entry) => {
                  const isUser =
                    (entry.username || "").trim().toLowerCase() === myUsername ||
                    (profile.id && entry.userId === profile.id);

                  let rankColor = "var(--text-dim)";
                  if (entry.rank === 1) rankColor = "var(--gold)";
                  else if (entry.rank === 2) rankColor = "#A0A0A0";
                  else if (entry.rank === 3) rankColor = "#CD7F32";

                  return (
                    <div
                      key={entry.userId}
                      className={cn(
                        "py-3.5 flex items-center justify-between gap-4 transition-colors",
                        isUser ? "rounded-xl px-3 my-1 border bg-[var(--surface-hover)]" : ""
                      )}
                      style={isUser ? { borderColor: "var(--olive)" } : {}}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 font-mono font-bold text-sm text-center" style={{ color: rankColor }}>
                          #{entry.rank}
                        </span>

                        <div className="min-w-0">
                          <div className="font-bold text-sm flex items-center gap-2 truncate" style={{ color: "var(--text)" }}>
                            <span className="truncate">{entry.username}</span>
                            {isUser && (
                              <span
                                className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider text-white shrink-0"
                                style={{ backgroundColor: "var(--terra)" }}
                              >
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--text-dim)]">
                            {entry.totalCorrect} / {entry.totalQuestions} Correct
                            {!isSprintDuel && ` · ${entry.daysCompleted} of ${league.durationDays} Days`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold font-mono" style={{ color: "var(--terra)" }}>
                          {entry.totalPoints} pts
                        </div>
                        <div className="text-[11px] text-[var(--text-dim)]">
                          {Math.round((entry.totalCorrect / (entry.totalQuestions || 1)) * 100)}% accuracy
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

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 2: PLAYING QUESTION SPRINT
      ═══════════════════════════════════════════════════════════════════ */}
      {phase === "playing" && currentQ && (
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
              <div className="text-sm font-semibold mt-0.5 text-[var(--text-dim)]">
                {currentQ.category} · <span className="capitalize">{currentQ.difficulty}</span>
              </div>
            </div>

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
          <div className="w-full h-1.5 rounded-full overflow-hidden surface">
            <div
              className="h-full transition-all duration-1000 ease-linear rounded-full"
              style={{
                width: `${timerRatio * 100}%`,
                backgroundColor: isTimeCritical ? "var(--red)" : "var(--olive)",
              }}
            />
          </div>

          {/* Question Card */}
          <div className="surface rounded-3xl p-6 sm:p-10 border shadow-xs" style={{ borderColor: "var(--border-dim)" }}>
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
                    className="p-4 rounded-2xl border text-left font-serif transition-all flex items-center justify-between group disabled:cursor-default active:scale-[0.99] cursor-pointer"
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

            {/* Socratic Shortcut Box (shown after answer) */}
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
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

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 3: ROUND SUMMARY
      ═══════════════════════════════════════════════════════════════════ */}
      {phase === "round_summary" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="surface rounded-3xl p-6 sm:p-10 border shadow-xs" style={{ borderColor: "var(--border-dim)" }}>
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

              <div className="font-space text-6xl sm:text-7xl font-bold my-2" style={{ color: "var(--terra)" }}>
                {userAnswers.filter((a) => a.isCorrect).length}
                <span className="text-3xl sm:text-4xl text-[var(--text-dim)]">
                  /{questions.length}
                </span>
              </div>

              <div className="text-lg font-bold" style={{ color: "var(--text)" }}>
                {Math.round((userAnswers.filter((a) => a.isCorrect).length / (questions.length || 1)) * 100)}% Accuracy
              </div>
              <div className="text-xs mt-1 text-[var(--text-dim)]">
                Agility Score Earned: <strong className="font-mono" style={{ color: "var(--text)" }}>{roundAgilityScore} pts</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <button
                onClick={() => setPhase("overview")}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                style={{ backgroundColor: "var(--terra)" }}
              >
                <Trophy className="w-4 h-4" />
                <span>View Standings</span>
              </button>

              <button
                onClick={handleCopyShareLink}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all surface cursor-pointer hover:border-[var(--text-dim)]"
                style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? "Link Copied" : "Challenge a Friend"}</span>
              </button>

              <button
                onClick={handleCopyProofCard}
                disabled={isExportingCard}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all surface cursor-pointer hover:border-[var(--text-dim)]"
                style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
              >
                {cardCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
                <span>{cardCopied ? "Proof Card Copied" : "Share Proof Card"}</span>
              </button>
            </div>

            {/* Review Question Breakdown */}
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
                      backgroundColor: ans.isCorrect ? "rgba(68, 78, 44, 0.04)" : "rgba(181, 58, 58, 0.04)",
                      borderColor: ans.isCorrect ? "var(--olive)" : "var(--red)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="text-sm font-bold font-serif" style={{ color: "var(--text)" }}>
                        <span className="font-sans mr-2 text-xs text-[var(--text-dim)]">Q{idx + 1}.</span>
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

                    <div className="text-xs mb-2 text-[var(--text-dim)]">
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
                      className="text-xs p-3 rounded-xl border mt-2 leading-relaxed surface"
                      style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
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
    </div>
  );
}
