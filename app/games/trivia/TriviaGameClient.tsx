"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  BarChart3,
  Star,
  Zap,
  BookOpen,
  Share2,
  Swords,
  Trophy,
} from "lucide-react";
import {
  getFreshQuestions,
  QUESTION_COUNTS,
  TRIVIA_QUESTIONS,
  type TriviaQuestion,
  type TriviaCategory,
} from "@/lib/trivia-questions";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import ShareTriviaModal from "@/components/games/ShareTriviaModal";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ReviewMode = "instant" | "suspense";
export type GamePhase = "setup" | "playing" | "results";
export type DurationOption = { label: string; minutes: number; emoji: string };

export interface ChallengerInfo {
  score: number;
  total: number;
  pct: number;
  by: string;
  grade?: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  { label: "Quick", minutes: 5, emoji: "⚡" },
  { label: "Standard", minutes: 10, emoji: "🎯" },
  { label: "Marathon", minutes: 15, emoji: "🏆" },
];

const CATEGORY_ICONS: Record<TriviaCategory, string> = {
  "History": "🏛️",
  "Pop Culture": "🎵",
  "General Knowledge": "🌍",
};

const CATEGORY_COLORS: Record<TriviaCategory, string> = {
  "History": "var(--terra)",
  "Pop Culture": "#7B3FC8",
  "General Knowledge": "var(--olive)",
};

const OPTION_LABELS = ["A", "B", "C", "D"];

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({
  onStart,
  seenCount,
  totalCount,
  onResetSeen,
  challenger,
}: {
  onStart: (minutes: number, mode: ReviewMode) => void;
  seenCount: number;
  totalCount: number;
  onResetSeen: () => void;
  challenger?: ChallengerInfo | null;
}) {
  const [duration, setDuration] = useState<DurationOption>(DURATION_OPTIONS[1]);
  const [mode, setMode] = useState<ReviewMode>("instant");

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-2xl mx-auto flex flex-col justify-center">
      {/* Back */}
      <Link
        href="/games"
        className="flex items-center gap-1.5 text-xs font-semibold mb-8 w-fit hover:text-[var(--text)] transition-colors"
        style={{ color: "var(--text-dim)" }}
      >
        <ArrowLeft size={13} /> Back to Games
      </Link>

      {/* Hero */}
      <div className="text-center mb-6">
        <div className="text-7xl mb-3">🇳🇬</div>
        <h1
          className="font-space text-4xl font-extrabold tracking-tight mb-2"
          style={{ color: "var(--text)" }}
        >
          Naija Trivia
        </h1>
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          Test your knowledge of Nigerian history, pop culture &amp; general knowledge.
        </p>
      </div>

      {/* Challenger Callout Banner (When arrived via challenge link) */}
      {challenger && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 border mb-6 relative overflow-hidden"
          style={{
            borderColor: "rgba(0, 135, 81, 0.4)",
            background: "linear-gradient(135deg, rgba(0, 135, 81, 0.12) 0%, rgba(166, 124, 30, 0.08) 100%)",
          }}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#008751]/20 border border-[#008751]/40 flex items-center justify-center shrink-0 text-xl text-[#008751]">
              <Swords size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#008751]">
                  Incoming Challenge
                </span>
                <span className="text-[10px] font-mono text-[var(--gold)]">
                  {challenger.grade || "Sharp Sharp! 🎯"}
                </span>
              </div>
              <div className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>
                Scholar {challenger.by} scored {challenger.score}/{challenger.total} ({challenger.pct}%)
              </div>
              <p className="text-xs text-[var(--text-dim)]">
                Can you beat their record? Start your game below to answer the call!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bank Progress & Deduplication Tracker */}
      <div className="surface rounded-2xl p-4 border mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center font-space font-bold text-sm">
            🎯
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: "var(--text)" }}>
              {seenCount} of {totalCount} questions explored
            </div>
            <div className="text-[11px]" style={{ color: "var(--text-mute)" }}>
              {seenCount >= totalCount
                ? "You have explored all questions! Next game will cycle fresh."
                : "No repeats — you will only see fresh questions until the bank is exhausted."}
            </div>
          </div>
        </div>
        {seenCount > 0 && (
          <button
            onClick={onResetSeen}
            title="Reset question history to allow all questions again"
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border hover:bg-[var(--bg-input)] transition-colors shrink-0 cursor-pointer"
            style={{ color: "var(--text-mute)", borderColor: "var(--border-dim)" }}
          >
            Reset History
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Duration Selector */}
        <div className="surface rounded-2xl p-5 border">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-3"
            style={{ color: "var(--text-mute)" }}
          >
            <Clock size={10} className="inline mr-1.5" /> Game Duration
          </p>
          <div className="grid grid-cols-3 gap-3">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.minutes}
                onClick={() => setDuration(opt)}
                className={cn(
                  "rounded-xl p-4 text-center border-2 transition-all cursor-pointer",
                  duration.minutes === opt.minutes
                    ? "border-[var(--terra)] bg-[var(--terra-bg)]"
                    : "border-[var(--border-dim)] hover:border-[var(--border)]"
                )}
              >
                <div className="text-3xl mb-2">{opt.emoji}</div>
                <div className="font-space font-bold text-sm" style={{ color: "var(--text)" }}>
                  {opt.label}
                </div>
                <div
                  className="text-[10px] font-semibold mt-1"
                  style={{ color: "var(--text-mute)" }}
                >
                  {opt.minutes} min · {QUESTION_COUNTS[opt.minutes]} Qs
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Review Mode Toggle */}
        <div className="surface rounded-2xl p-5 border">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-3"
            style={{ color: "var(--text-mute)" }}
          >
            <BookOpen size={10} className="inline mr-1.5" /> Answer Review Mode
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["instant", "suspense"] as ReviewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-xl p-4 text-left border-2 transition-all cursor-pointer",
                  mode === m
                    ? "border-[var(--olive)] bg-[var(--olive)]/5"
                    : "border-[var(--border-dim)] hover:border-[var(--border)]"
                )}
              >
                <div className="text-2xl mb-2">{m === "instant" ? "⚡" : "🎭"}</div>
                <div className="font-space font-bold text-sm mb-1" style={{ color: "var(--text)" }}>
                  {m === "instant" ? "Instant Feedback" : "Suspense Mode"}
                </div>
                <p className="text-[10px] leading-snug" style={{ color: "var(--text-mute)" }}>
                  {m === "instant"
                    ? "See the correct answer immediately after each question."
                    : "Answer all questions first, then review at the end."}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onStart(duration.minutes, mode)}
          className="w-full py-4 rounded-2xl btn-terra font-space font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer shadow-lg"
        >
          {challenger ? "Accept Challenge & Start" : "Start Game"} <ChevronRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Game Screen ──────────────────────────────────────────────────────────────

function GameScreen({
  questions,
  reviewMode,
  totalSeconds,
  onComplete,
}: {
  questions: TriviaQuestion[];
  reviewMode: ReviewMode;
  totalSeconds: number;
  onComplete: (answers: (number | null)[], timeLeft: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLast = current === questions.length - 1;
  const q = questions[current];

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          onComplete(answers, 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const timerPct = (timeLeft / totalSeconds) * 100;

  const handleSelect = useCallback(
    (idx: number) => {
      if (revealed || selected !== null) return;
      setSelected(idx);
      const newAnswers = [...answers];
      newAnswers[current] = idx;
      setAnswers(newAnswers);
      if (reviewMode === "instant") {
        setRevealed(true);
      } else {
        setTimeout(() => advance(newAnswers), 600);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revealed, selected, answers, current, reviewMode]
  );

  const advance = useCallback(
    (latestAnswers?: (number | null)[]) => {
      const ans = latestAnswers ?? answers;
      if (isLast) {
        clearInterval(timerRef.current!);
        onComplete(ans, timeLeft);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
        setRevealed(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLast, answers, timeLeft, onComplete]
  );

  const getOptionStyle = (idx: number) => {
    if (!revealed) {
      if (selected === idx) return "border-[var(--terra)] bg-[var(--terra-bg)]";
      return "border-[var(--border-dim)] hover:border-[var(--border)] hover:bg-[var(--bg-card)]";
    }
    if (idx === q.answer) return "border-green-500 bg-green-500/10 text-green-700";
    if (selected === idx && idx !== q.answer) return "border-red-500 bg-red-500/10 text-red-600";
    return "border-[var(--border-dim)] opacity-40";
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-2xl mx-auto flex flex-col justify-between">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5" style={{ color: "var(--text-dim)" }}>
            <span>{CATEGORY_ICONS[q.category]}</span>
            <span>{q.category}</span>
          </span>
          <span className="font-space font-bold text-sm" style={{ color: "var(--text)" }}>
            {current + 1}
            <span className="text-[var(--text-mute)] font-normal text-xs">/{questions.length}</span>
          </span>
          <span
            className={cn("font-mono font-bold text-xs flex items-center gap-1", {
              "text-red-500 animate-pulse": timeLeft <= 30,
              "text-[var(--text-dim)]": timeLeft > 30,
            })}
          >
            <Clock size={11} /> {formatTime(timeLeft)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1 rounded-full overflow-hidden mb-6" style={{ background: "var(--bg-input)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: CATEGORY_COLORS[q.category] }}
            animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question + Options */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="my-auto py-4"
        >
          {/* Question Text */}
          <h2
            className="font-space font-bold text-xl sm:text-2xl leading-snug mb-8"
            style={{ color: "var(--text)" }}
          >
            {q.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={revealed || (reviewMode === "suspense" && selected !== null)}
                onClick={() => handleSelect(idx)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 font-semibold text-sm cursor-pointer",
                  getOptionStyle(idx)
                )}
                style={{ color: "var(--text)" }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 border"
                  style={{ borderColor: "var(--border-dim)", background: "var(--bg-card)" }}
                >
                  {OPTION_LABELS[idx]}
                </span>
                <span className="flex-1">{opt}</span>
                {revealed && idx === q.answer && (
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                )}
                {revealed && selected === idx && idx !== q.answer && (
                  <XCircle size={16} className="text-red-500 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Explanation (Instant Mode) */}
          {revealed && q.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border text-xs leading-relaxed mb-4"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-dim)",
                color: "var(--text-dim)",
              }}
            >
              <span className="font-bold text-[var(--text)] block mb-1">💡 Did you know?</span>
              {q.explanation}
            </motion.div>
          )}

          {/* Next Button (Instant Mode) */}
          {revealed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => advance()}
              className="w-full py-3.5 rounded-xl btn-terra font-space font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLast ? "See Results" : "Next Question"} <ChevronRight size={16} />
            </motion.button>
          )}

          {/* Skip Button (Suspense Mode only) */}
          {!revealed && reviewMode === "suspense" && (
            <button
              onClick={() => advance()}
              className="text-xs font-semibold hover:text-[var(--text)] transition-colors mt-2 text-right block ml-auto cursor-pointer"
              style={{ color: "var(--text-mute)" }}
            >
              Skip →
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────

function ResultsScreen({
  questions,
  answers,
  reviewMode,
  xpEarned,
  onRetry,
  challenger,
}: {
  questions: TriviaQuestion[];
  answers: (number | null)[];
  reviewMode: ReviewMode;
  xpEarned: number;
  onRetry: () => void;
  challenger?: ChallengerInfo | null;
}) {
  const [showShareModal, setShowShareModal] = useState(false);
  const correct = answers.filter((a, i) => a === questions[i].answer).length;
  const total = questions.length;
  const pct = Math.round((correct / total) * 100);

  const byCategory = Object.entries(
    questions.reduce<Record<string, { correct: number; total: number }>>((acc, q, i) => {
      if (!acc[q.category]) acc[q.category] = { correct: 0, total: 0 };
      acc[q.category].total++;
      if (answers[i] === q.answer) acc[q.category].correct++;
      return acc;
    }, {})
  ).map(([category, stat]) => ({
    category,
    correct: stat.correct,
    total: stat.total,
  }));

  const grade =
    pct >= 80
      ? { label: "Naija Expert! 🏆", color: "var(--gold)" }
      : pct >= 60
      ? { label: "Sharp Sharp! 🎯", color: "var(--olive)" }
      : pct >= 40
      ? { label: "Not bad o! 🙌", color: "var(--terra)" }
      : { label: "Keep studying! 📚", color: "var(--text-mute)" };

  const isVersus = Boolean(challenger && challenger.total > 0);
  const userWon = isVersus && correct > (challenger?.score || 0);
  const userTied = isVersus && correct === (challenger?.score || 0);

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🇳🇬</div>
        <h1 className="font-space text-3xl font-extrabold mb-1" style={{ color: "var(--text)" }}>
          Results
        </h1>
        <p className="text-sm font-bold" style={{ color: grade.color }}>
          {grade.label}
        </p>
      </div>

      {/* Head-to-Head Challenger Comparison Banner */}
      {isVersus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-4 border mb-5 text-center relative overflow-hidden"
          style={{
            borderColor: userWon ? "rgba(0, 135, 81, 0.5)" : userTied ? "rgba(166, 124, 30, 0.5)" : "var(--border-dim)",
            background: userWon
              ? "linear-gradient(135deg, rgba(0, 135, 81, 0.15) 0%, rgba(82, 183, 136, 0.08) 100%)"
              : userTied
              ? "rgba(166, 124, 30, 0.1)"
              : "var(--bg-card)",
          }}
        >
          <div className="text-xs font-mono font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
            {userWon ? (
              <span className="text-[#008751] flex items-center gap-1">
                <Trophy size={14} /> Victory! You beat Scholar {challenger?.by}!
              </span>
            ) : userTied ? (
              <span className="text-[var(--gold)]">🤝 Honorable Stalemate with Scholar {challenger?.by}!</span>
            ) : (
              <span style={{ color: "var(--text-mute)" }}>
                🎯 Scholar {challenger?.by} still leads ({challenger?.score}/{challenger?.total})
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-dim)]">
            You scored {correct}/{total} ({pct}%) vs {challenger?.by}&apos;s {challenger?.score}/{challenger?.total} ({challenger?.pct}%).
          </p>
        </motion.div>
      )}

      {/* Score Box */}
      <div className="surface rounded-2xl border p-6 mb-5 text-center shadow-sm">
        <div className="font-space font-black text-6xl mb-2" style={{ color: "var(--text)" }}>
          {correct}
          <span className="text-3xl font-bold text-[var(--text-mute)]">/{total}</span>
        </div>
        <div className="text-sm font-semibold" style={{ color: "var(--text-dim)" }}>
          {pct}% accuracy
        </div>
        {xpEarned > 0 && (
          <div
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
            style={{ background: "var(--gold-bg)", color: "var(--gold)" }}
          >
            <Zap size={14} /> +{xpEarned} XP earned
          </div>
        )}

        {/* Share & Challenge Primary CTA Button */}
        <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border-dim)" }}>
          <button
            onClick={() => setShowShareModal(true)}
            className="w-full py-3.5 px-4 rounded-xl font-space font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md"
            style={{
              background: "linear-gradient(135deg, #008751 0%, #10663f 100%)",
              color: "#FFFFFF",
            }}
          >
            <Share2 size={16} /> Share Score &amp; Challenge Friends
          </button>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="surface rounded-2xl border p-5 mb-5">
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
          style={{ color: "var(--text-mute)" }}
        >
          <BarChart3 size={11} /> Category Breakdown
        </p>
        <div className="space-y-3">
          {byCategory.map((stat) => {
            const catPct = Math.round((stat.correct / stat.total) * 100);
            return (
              <div key={stat.category}>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span style={{ color: "var(--text)" }}>
                    {CATEGORY_ICONS[stat.category as TriviaCategory]} {stat.category}
                  </span>
                  <span style={{ color: "var(--text-mute)" }}>
                    {stat.correct}/{stat.total}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--bg-input)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: CATEGORY_COLORS[stat.category as TriviaCategory] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${catPct}%` }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Log (Suspense Mode) */}
      {reviewMode === "suspense" && (
        <div className="surface rounded-2xl border p-5 mb-5">
          <p
            className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5"
            style={{ color: "var(--text-mute)" }}
          >
            <Star size={11} /> Answer Review
          </p>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.answer;
              return (
                <div key={q.id} className="text-xs">
                  <div className="flex items-start gap-2 mb-1">
                    {isCorrect ? (
                      <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                    )}
                    <span className="font-semibold" style={{ color: "var(--text)" }}>
                      {q.question}
                    </span>
                  </div>
                  <div className="ml-5 space-y-0.5">
                    <div className="text-green-600">✓ {q.options[q.answer]}</div>
                    {!isCorrect && answers[i] !== null && (
                      <div className="text-red-500">✗ You chose: {q.options[answers[i]!]}</div>
                    )}
                    {q.explanation && (
                      <div className="italic mt-1" style={{ color: "var(--text-mute)" }}>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3.5 rounded-xl btn-ghost flex items-center justify-center gap-2 font-space font-bold text-sm cursor-pointer"
        >
          <RefreshCcw size={14} /> Play Again
        </button>
        <Link
          href="/games"
          className="flex-1 py-3.5 rounded-xl btn-terra flex items-center justify-center gap-2 font-space font-bold text-sm cursor-pointer"
        >
          Back to Games <ChevronRight size={14} />
        </Link>
      </div>

      {/* Share Score & Invite Modal */}
      <ShareTriviaModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        score={correct}
        total={total}
        pct={pct}
        gradeLabel={grade.label}
        xpEarned={xpEarned}
        byCategory={byCategory}
      />
    </div>
  );
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export default function TriviaGameClient({
  challenger,
}: {
  challenger?: ChallengerInfo | null;
}) {
  const {
    addXP,
    seenTriviaQuestionIds = [],
    markTriviaQuestionsSeen,
    resetSeenTriviaQuestions,
  } = useAppStore();
  const [phase, setPhase] = useState<GamePhase>("setup");
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [reviewMode, setReviewMode] = useState<ReviewMode>("instant");
  const [totalSeconds, setTotalSeconds] = useState(600);
  const [xpEarned, setXpEarned] = useState(0);

  function handleStart(minutes: number, mode: ReviewMode) {
    const count = QUESTION_COUNTS[minutes];
    const { questions: freshQuestions, wasReset } = getFreshQuestions(
      count,
      seenTriviaQuestionIds
    );

    if (wasReset) {
      resetSeenTriviaQuestions();
    }

    markTriviaQuestionsSeen(freshQuestions.map((q) => q.id));

    setQuestions(freshQuestions);
    setTotalSeconds(minutes * 60);
    setReviewMode(mode);
    setPhase("playing");
  }

  function handleComplete(finalAnswers: (number | null)[], _timeLeft: number) {
    const correct = finalAnswers.filter((a, i) => a === questions[i].answer).length;
    const pct = correct / questions.length;
    const base = correct * 5;
    const bonus = pct >= 0.8 ? 50 : 0;
    const total = base + bonus;
    setAnswers(finalAnswers);
    setXpEarned(total);
    if (total > 0) addXP(total);
    setPhase("results");
  }

  function handleRetry() {
    setPhase("setup");
    setQuestions([]);
    setAnswers([]);
    setXpEarned(0);
  }

  return (
    <AnimatePresence mode="wait">
      {phase === "setup" && (
        <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SetupScreen
            onStart={handleStart}
            seenCount={seenTriviaQuestionIds.length}
            totalCount={TRIVIA_QUESTIONS.length}
            onResetSeen={resetSeenTriviaQuestions}
            challenger={challenger}
          />
        </motion.div>
      )}
      {phase === "playing" && (
        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <GameScreen
            questions={questions}
            reviewMode={reviewMode}
            totalSeconds={totalSeconds}
            onComplete={handleComplete}
          />
        </motion.div>
      )}
      {phase === "results" && (
        <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <ResultsScreen
            questions={questions}
            answers={answers}
            reviewMode={reviewMode}
            xpEarned={xpEarned}
            onRetry={handleRetry}
            challenger={challenger}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
