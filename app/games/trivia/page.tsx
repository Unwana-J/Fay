"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, ChevronRight, Clock, CheckCircle2, XCircle,
  RefreshCcw, BarChart3, Star, Zap, BookOpen
} from "lucide-react";
import { getFreshQuestions, QUESTION_COUNTS, TRIVIA_QUESTIONS, type TriviaQuestion, type TriviaCategory } from "@/lib/trivia-questions";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type ReviewMode = "instant" | "suspense";
type GamePhase = "setup" | "playing" | "results";
type DurationOption = { label: string; minutes: number; emoji: string };

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
}: {
  onStart: (minutes: number, mode: ReviewMode) => void;
  seenCount: number;
  totalCount: number;
  onResetSeen: () => void;
}) {
  const [duration, setDuration] = useState<DurationOption>(DURATION_OPTIONS[1]);
  const [mode, setMode] = useState<ReviewMode>("instant");

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto flex flex-col justify-center">
      {/* Back */}
      <Link href="/games" className="flex items-center gap-1.5 text-xs font-semibold mb-8 w-fit hover:text-[var(--text)] transition-colors" style={{ color: "var(--text-dim)" }}>
        <ArrowLeft size={13} /> Back to Games
      </Link>

      {/* Hero */}
      <div className="text-center mb-6">
        <div className="text-7xl mb-3">🇳🇬</div>
        <h1 className="font-space text-4xl font-extrabold tracking-tight mb-2" style={{ color: "var(--text)" }}>Naija Trivia</h1>
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          Test your knowledge of Nigerian history, pop culture &amp; general knowledge.
        </p>
      </div>

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
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border hover:bg-[var(--bg-input)] transition-colors shrink-0"
            style={{ color: "var(--text-mute)", borderColor: "var(--border-dim)" }}
          >
            Reset History
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Duration Selector */}
        <div className="surface rounded-2xl p-5 border">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-mute)" }}>
            <Clock size={10} className="inline mr-1.5" /> Game Duration
          </p>
          <div className="grid grid-cols-3 gap-3">
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.minutes}
                onClick={() => setDuration(opt)}
                className={cn(
                  "rounded-xl p-4 text-center border-2 transition-all",
                  duration.minutes === opt.minutes
                    ? "border-[var(--terra)] bg-[var(--terra-bg)]"
                    : "border-[var(--border-dim)] hover:border-[var(--border)]"
                )}
              >
                <div className="text-3xl mb-2">{opt.emoji}</div>
                <div className="font-space font-bold text-sm" style={{ color: "var(--text)" }}>{opt.label}</div>
                <div className="text-[10px] font-semibold mt-1" style={{ color: "var(--text-mute)" }}>
                  {opt.minutes} min · {QUESTION_COUNTS[opt.minutes]} Qs
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Review Mode Toggle */}
        <div className="surface rounded-2xl p-5 border">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-mute)" }}>
            <BookOpen size={10} className="inline mr-1.5" /> Answer Review Mode
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["instant", "suspense"] as ReviewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-xl p-4 text-left border-2 transition-all",
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
          className="w-full py-4 rounded-2xl btn-terra font-space font-extrabold text-base flex items-center justify-center gap-2"
        >
          Start Game <ChevronRight size={18} />
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
          // Force completion
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

  const handleSelect = useCallback((idx: number) => {
    if (revealed || selected !== null) return;
    setSelected(idx);
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
    if (reviewMode === "instant") {
      setRevealed(true);
    } else {
      // In suspense mode auto-advance after a short pause
      setTimeout(() => advance(newAnswers), 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, selected, answers, current, reviewMode]);

  const advance = useCallback((latestAnswers?: (number | null)[]) => {
    const ans = latestAnswers ?? answers;
    if (isLast) {
      clearInterval(timerRef.current!);
      onComplete(ans, timeLeft);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLast, answers, timeLeft, onComplete]);

  const getOptionStyle = (idx: number) => {
    if (!revealed) {
      if (selected === idx) return "border-[var(--terra)] bg-[var(--terra-bg)]";
      return "border-[var(--border-dim)] hover:border-[var(--border)] hover:bg-[var(--bg-card)]";
    }
    if (idx === q.answer) return "border-green-500 bg-green-500/10 text-green-700";
    if (selected === idx && idx !== q.answer) return "border-red-500 bg-red-500/10 text-red-600";
    return "border-[var(--border-dim)] opacity-50";
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/games" className="p-2 rounded-xl border hover:bg-[var(--bg-card)] transition-colors" style={{ borderColor: "var(--border-dim)" }}>
          <ArrowLeft size={14} style={{ color: "var(--text-dim)" }} />
        </Link>
        <div className="flex-1">
          <div className="flex justify-between text-xs font-semibold mb-1.5" style={{ color: "var(--text-mute)" }}>
            <span>Question {current + 1} / {questions.length}</span>
            <span className={cn("font-mono font-bold", timeLeft <= 30 && "text-red-500 animate-pulse")}>
              <Clock size={11} className="inline mr-1" />{formatTime(timeLeft)}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-input)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: timeLeft <= 30 ? "#B53A3A" : "var(--olive)" }}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="flex flex-col flex-1"
        >
          {/* Category Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${CATEGORY_COLORS[q.category]}15`, color: CATEGORY_COLORS[q.category] }}
            >
              {CATEGORY_ICONS[q.category]} {q.category}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "var(--bg-input)", color: "var(--text-mute)" }}
            >
              {q.difficulty}
            </span>
          </div>

          {/* Question */}
          <div className="surface rounded-2xl p-6 border mb-5">
            <p className="font-space font-bold text-xl leading-snug" style={{ color: "var(--text)" }}>
              {q.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-5">
            {q.options.map((opt, idx) => (
              <motion.button
                key={idx}
                whileTap={!revealed && selected === null ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(idx)}
                disabled={revealed || (reviewMode === "suspense" && selected !== null)}
                className={cn(
                  "w-full text-left rounded-xl border-2 p-4 flex items-center gap-3 transition-all",
                  getOptionStyle(idx),
                  "cursor-pointer disabled:cursor-default"
                )}
              >
                <span
                  className="w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-black shrink-0 font-space"
                  style={{
                    backgroundColor: revealed && idx === q.answer ? "#22C55E" : revealed && selected === idx ? "#EF4444" : "var(--bg-input)",
                    color: revealed && (idx === q.answer || selected === idx) ? "white" : "var(--text-mute)",
                    borderColor: "transparent",
                  }}
                >
                  {OPTION_LABELS[idx]}
                </span>
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{opt}</span>
                {revealed && idx === q.answer && <CheckCircle2 size={16} className="ml-auto text-green-500 shrink-0" />}
                {revealed && selected === idx && idx !== q.answer && <XCircle size={16} className="ml-auto text-red-500 shrink-0" />}
              </motion.button>
            ))}
          </div>

          {/* Explanation (Instant Mode) */}
          {revealed && q.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 mb-5 text-sm leading-relaxed border"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
            >
              <span className="font-bold text-xs uppercase tracking-wider block mb-1" style={{ color: "var(--olive)" }}>Explanation</span>
              {q.explanation}
            </motion.div>
          )}

          {/* Next Button (Instant Mode) */}
          {revealed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => advance()}
              className="w-full py-3.5 rounded-xl btn-terra font-space font-extrabold text-sm flex items-center justify-center gap-2 mt-auto"
            >
              {isLast ? "See Results" : "Next Question"} <ChevronRight size={14} />
            </motion.button>
          )}

          {/* Skip time-up option when no selection */}
          {!revealed && selected === null && (
            <button
              onClick={() => {
                const newAnswers = [...answers];
                // current already null, just advance
                advance(newAnswers);
              }}
              className="w-full py-2 text-xs font-semibold mt-auto"
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
}: {
  questions: TriviaQuestion[];
  answers: (number | null)[];
  reviewMode: ReviewMode;
  xpEarned: number;
  onRetry: () => void;
}) {
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
  );

  const grade =
    pct >= 80 ? { label: "Naija Expert! 🏆", color: "var(--gold)" } :
    pct >= 60 ? { label: "Sharp Sharp! 🎯", color: "var(--olive)" } :
    pct >= 40 ? { label: "Not bad o! 🙌", color: "var(--terra)" } :
                { label: "Keep studying! 📚", color: "var(--text-mute)" };

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🇳🇬</div>
        <h1 className="font-space text-3xl font-extrabold mb-1" style={{ color: "var(--text)" }}>Results</h1>
        <p className="text-sm font-bold" style={{ color: grade.color }}>{grade.label}</p>
      </div>

      {/* Score */}
      <div className="surface rounded-2xl border p-6 mb-5 text-center">
        <div className="font-space font-black text-6xl mb-2" style={{ color: "var(--text)" }}>
          {correct}<span className="text-3xl font-bold text-[var(--text-mute)]">/{total}</span>
        </div>
        <div className="text-sm font-semibold" style={{ color: "var(--text-dim)" }}>{pct}% accuracy</div>
        {xpEarned > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold" style={{ background: "var(--gold-bg)", color: "var(--gold)" }}>
            <Zap size={14} /> +{xpEarned} XP earned
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="surface rounded-2xl border p-5 mb-5">
        <p className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "var(--text-mute)" }}>
          <BarChart3 size={11} /> Category Breakdown
        </p>
        <div className="space-y-3">
          {byCategory.map(([cat, stat]) => {
            const catPct = Math.round((stat.correct / stat.total) * 100);
            return (
              <div key={cat}>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span style={{ color: "var(--text)" }}>{CATEGORY_ICONS[cat as TriviaCategory]} {cat}</span>
                  <span style={{ color: "var(--text-mute)" }}>{stat.correct}/{stat.total}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-input)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: CATEGORY_COLORS[cat as TriviaCategory] }}
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
          <p className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5" style={{ color: "var(--text-mute)" }}>
            <Star size={11} /> Answer Review
          </p>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.answer;
              return (
                <div key={q.id} className="text-xs">
                  <div className="flex items-start gap-2 mb-1">
                    {isCorrect
                      ? <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />
                      : <XCircle size={13} className="text-red-500 mt-0.5 shrink-0" />}
                    <span className="font-semibold" style={{ color: "var(--text)" }}>{q.question}</span>
                  </div>
                  <div className="ml-5 space-y-0.5">
                    <div className="text-green-600">✓ {q.options[q.answer]}</div>
                    {!isCorrect && answers[i] !== null && (
                      <div className="text-red-500">✗ You chose: {q.options[answers[i]!]}</div>
                    )}
                    {q.explanation && (
                      <div className="italic mt-1" style={{ color: "var(--text-mute)" }}>{q.explanation}</div>
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
        <button onClick={onRetry} className="flex-1 py-3.5 rounded-xl btn-ghost flex items-center justify-center gap-2 font-space font-bold text-sm">
          <RefreshCcw size={14} /> Play Again
        </button>
        <Link href="/games" className="flex-1 py-3.5 rounded-xl btn-terra flex items-center justify-center gap-2 font-space font-bold text-sm">
          Back to Games <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export default function TriviaPage() {
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

    // If the bank was completely exhausted and cycle reset, clear the seen list first
    if (wasReset) {
      resetSeenTriviaQuestions();
    }

    // Mark current selected questions as seen
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
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
