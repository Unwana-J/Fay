"use client";

import { useState, useEffect, useTransition } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import {
  type FriendshipLeague,
  type LeagueDailyScore,
  type LeagueLeaderboardEntry,
  getLeagueStatus,
  getQuestionsForLeagueDay,
  calculateLeaguePoints,
} from "@/lib/trivia-league";
import { type TriviaQuestion } from "@/lib/trivia-questions";
import { playAudioTone } from "@/lib/sound";
import confetti from "canvas-confetti";
import UserAvatar from "@/components/ui/UserAvatar";

interface LeagueArenaClientProps {
  initialLeague: FriendshipLeague;
  initialScores: LeagueDailyScore[];
  initialLeaderboard: LeagueLeaderboardEntry[];
}

export default function LeagueArenaClient({
  initialLeague,
  initialScores,
  initialLeaderboard,
}: LeagueArenaClientProps) {
  const { profile, addXP, saveTriviaRound } = useAppStore();

  const [league, setLeague] = useState<FriendshipLeague>(initialLeague);
  const [scores, setScores] = useState<LeagueDailyScore[]>(initialScores);
  const [leaderboard, setLeaderboard] = useState<LeagueLeaderboardEntry[]>(initialLeaderboard);

  const [phase, setPhase] = useState<"overview" | "playing" | "round_summary">("overview");

  // Game Play State
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [correctCount, setCorrectCount] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [questionResults, setQuestionResults] = useState<
    Array<{ questionId: string; correct: boolean; selected: number }>
  >([]);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);

  // Time remaining to next drop (midnight)
  const [timeToNextDrop, setTimeToNextDrop] = useState("");

  const status = getLeagueStatus(league.startDate, league.durationDays);
  const currentDay = status.dayNumber;

  // Check if current user has already completed today's drop
  const myIdentifier = profile.id || profile.username.toLowerCase();
  const myTodayScore = scores.find(
    (s) =>
      (s.userId === myIdentifier || s.username.toLowerCase() === profile.username.toLowerCase()) &&
      s.dayNumber === currentDay
  );
  const hasCompletedToday = Boolean(myTodayScore);

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

  // Question countdown during gameplay
  useEffect(() => {
    if (phase !== "playing" || isAnswerRevealed) return;

    if (timerSeconds <= 0) {
      handleTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timerSeconds, isAnswerRevealed]);

  function startDailyRound() {
    if (hasCompletedToday || status.isCompleted || status.isUpcoming) return;

    const dailyQuestions = getQuestionsForLeagueDay(league, currentDay);
    if (dailyQuestions.length === 0) return;

    setQuestions(dailyQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
    setTimerSeconds(15);
    setCorrectCount(0);
    setQuestionResults([]);
    setRoundStartTime(Date.now());
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

  function handleTimeExpired() {
    const currentQ = questions[currentIndex];
    setIsAnswerRevealed(true);
    setSelectedAnswer(-1); // timeout
    playAudioTone(220, "sawtooth", 0.25);

    setQuestionResults((prev) => [
      ...prev,
      { questionId: currentQ.id, correct: false, selected: -1 },
    ]);
  }

  function handleNextQuestion() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((idx) => idx + 1);
      setSelectedAnswer(null);
      setIsAnswerRevealed(false);
      setTimerSeconds(15);
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

    // Save as local trivia round to maintain user's app streak
    saveTriviaRound({
      score: correctCount,
      total: questions.length,
      pct: Math.round((correctCount / questions.length) * 100),
      gradeLabel: `${league.title} · Day ${currentDay}`,
      xpEarned: xpBonus,
      durationMinutes: Math.round(elapsedSeconds / 60),
      questionIds: questions.map((q) => q.id),
      categoryBreakdown: [],
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

    // Submit to Supabase / API
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
      } else {
        setSubmitError(data.error || "Failed to record cloud score.");
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
        if (data.league) setLeague(data.league);
        if (data.scores) setScores(data.scores);
        if (data.leaderboard) setLeaderboard(data.leaderboard);
      }
    } catch {}
  }

  const shareUrl = typeof window !== "undefined"
    ? window.location.href
    : `https://fey.lokinlabs.com.ng/games/trivia/league/${league.code}`;

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
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full border bg-[var(--bg-input)]" style={{ borderColor: "var(--border-dim)" }}>
            Code: <strong>{league.code}</strong>
          </span>
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
              className="rounded-3xl p-6 surface border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{
                borderColor: hasCompletedToday ? "var(--olive)" : "var(--terra)",
                background: hasCompletedToday ? "rgba(92, 106, 54, 0.05)" : "var(--bg-card)",
              }}
            >
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-space font-bold text-lg text-[var(--text)]">
                    Day {currentDay} Daily Drop
                  </span>
                  {hasCompletedToday ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 size={12} /> Completed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--terra)] bg-[var(--terra)]/15 px-2 py-0.5 rounded-full border border-[var(--terra)]/30">
                      <Flame size={12} /> 1 Attempt Only
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-dim)]">
                  {hasCompletedToday
                    ? `You scored ${myTodayScore?.score}/${league.questionsPerDay} (${myTodayScore?.points} pts) on today's quiz drop. Next drop unlocks at midnight.`
                    : status.isCompleted
                    ? "This tournament has ended! Check out the final podium below."
                    : `Answer today's ${league.questionsPerDay} questions swiftly to earn speed velocity bonus points.`}
                </p>
              </div>

              {!hasCompletedToday && !status.isCompleted && (
                <button
                  type="button"
                  onClick={startDailyRound}
                  className="btn-terra px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md shrink-0"
                >
                  <Sparkles size={14} /> Start Day {currentDay} Drop <ArrowRight size={14} />
                </button>
              )}
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
                      entry.userId === myIdentifier ||
                      entry.username.toLowerCase() === profile.username.toLowerCase();

                    return (
                      <div
                        key={entry.userId}
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
                  Day {currentDay} Drop · Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="font-mono text-sm font-bold flex items-center gap-1" style={{ color: timerSeconds <= 4 ? "var(--terra)" : "var(--olive)" }}>
                  <Clock size={14} /> {timerSeconds}s
                </span>
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
                Day {currentDay} Drop Complete!
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

            {submittingScore && (
              <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-dim)]">
                <Loader2 size={14} className="animate-spin" /> Syncing results to league standings...
              </div>
            )}

            {submitError && (
              <p className="text-xs text-rose-600 font-semibold">{submitError}</p>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPhase("overview")}
                className="w-full sm:w-auto btn-terra px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <Trophy size={14} /> View League Standings
              </button>
              <button
                type="button"
                onClick={shareWhatsApp}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Share2 size={14} /> Share Today's Score to WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
