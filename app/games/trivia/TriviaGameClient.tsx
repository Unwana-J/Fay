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
  Zap,
  Target,
  Trophy,
  Swords,
  History,
  Sparkles,
  BookOpen,
  Share2,
} from "lucide-react";
import {
  getFreshQuestions,
  getQuestionsByIds,
  QUESTION_COUNTS,
  TRIVIA_QUESTIONS,
  type TriviaQuestion,
  type TriviaCategory,
  type TriviaDifficultyFilter,
} from "@/lib/trivia-questions";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import ShareTriviaModal from "@/components/games/ShareTriviaModal";
import TriviaHistoryView from "@/components/games/TriviaHistoryView";
import TriviaLeaderboardView from "@/components/games/TriviaLeaderboardView";
import TriviaChallengeLounge from "@/components/games/TriviaChallengeLounge";
import {
  type TriviaChallenge,
  decodeChallengeFromUrl,
  getLocalChallenge,
  recordLocalChallengeScore,
} from "@/lib/trivia-challenge";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ReviewMode = "instant" | "suspense";
export type GamePhase = "setup" | "playing" | "results";
export type SetupTab = "solo" | "challenge" | "leaderboard" | "history";
export type DurationOption = { label: string; minutes: number; emoji: string };

export interface DifficultyOption {
  id: TriviaDifficultyFilter;
  label: string;
  emoji: string;
  desc: string;
}

export interface ChallengerInfo {
  score: number;
  total: number;
  pct: number;
  by: string;
  grade?: string;
  questionIds?: string[];
}

const DURATION_OPTIONS: DurationOption[] = [
  { label: "Quick", minutes: 5, emoji: "⚡" },
  { label: "Standard", minutes: 10, emoji: "🎯" },
  { label: "Marathon", minutes: 15, emoji: "🏆" },
];

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { id: "random", label: "Random", emoji: "🎲", desc: "Mixed Pool (Default)" },
  { id: "easy", label: "Easy", emoji: "🌱", desc: "Cultural basics" },
  { id: "medium", label: "Medium", emoji: "⚖️", desc: "Balanced level" },
  { id: "hard", label: "Hard", emoji: "🔥", desc: "Scholar lore" },
];

const CATEGORY_COLORS: Record<TriviaCategory, string> = {
  "History": "var(--terra)",
  "Pop Culture": "#7B3FC8",
  "General Knowledge": "var(--olive)",
};

const OPTION_LABELS = ["A", "B", "C", "D"];

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen({
  activeTab,
  onTabChange,
  historyCount,
  onStartSolo,
  onPlayDeck,
  seenQuestionIds,
  onResetSeen,
  challenger,
  activeChallenge,
  onSelectChallenge,
  onStartChallenge,
}: {
  activeTab: SetupTab;
  onTabChange: (tab: SetupTab) => void;
  historyCount: number;
  onStartSolo: (minutes: number, mode: ReviewMode, difficulty: TriviaDifficultyFilter) => void;
  onPlayDeck: (questionIds: string[], minutes: number) => void;
  seenQuestionIds: string[];
  onResetSeen: () => void;
  challenger?: ChallengerInfo | null;
  activeChallenge: TriviaChallenge | null;
  onSelectChallenge: (challenge: TriviaChallenge | null) => void;
  onStartChallenge: (challenge: TriviaChallenge) => void;
}) {
  const [duration, setDuration] = useState<DurationOption>(DURATION_OPTIONS[1]);
  const [mode, setMode] = useState<ReviewMode>("instant");
  const [difficulty, setDifficulty] = useState<TriviaDifficultyFilter>("random");

  const filteredPool =
    difficulty === "random"
      ? TRIVIA_QUESTIONS
      : TRIVIA_QUESTIONS.filter((q) => q.difficulty === difficulty);

  const seenSet = new Set(seenQuestionIds);
  const currentSeenCount = filteredPool.filter((q) => seenSet.has(q.id)).length;
  const currentTotalCount = filteredPool.length;

  return (
    <div className="min-h-screen px-3 py-4 sm:p-8 max-w-2xl mx-auto flex flex-col justify-center">
      {/* Back Link */}
      <Link
        href="/games"
        className="flex items-center gap-1.5 text-xs font-semibold mb-6 w-fit hover:text-[var(--text)] transition-colors"
        style={{ color: "var(--text-dim)" }}
      >
        <ArrowLeft size={13} /> Back to Games
      </Link>

      {/* Hero Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🇳🇬</div>
        <h1
          className="font-space text-3xl sm:text-4xl font-extrabold tracking-tight mb-1"
          style={{ color: "var(--text)" }}
        >
          Naija Trivia
        </h1>
        <p className="text-xs sm:text-sm" style={{ color: "var(--text-dim)" }}>
          Test your knowledge of Nigerian history, pop culture &amp; general knowledge.
        </p>
      </div>

      {/* Navigation Tab Bar */}
      <div
        className="grid grid-cols-4 gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-[var(--bg-input)] border mb-6"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <button
          onClick={() => onTabChange("solo")}
          className={cn(
            "py-2 sm:py-2.5 px-1 sm:px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer truncate",
            activeTab === "solo"
              ? "bg-[var(--bg-card)] text-[var(--text)] shadow-xs border border-[var(--border-dim)]"
              : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          <span>🎮</span>
          <span className="hidden sm:inline">Play </span>
          <span>Quiz</span>
        </button>

        <button
          onClick={() => onTabChange("challenge")}
          className={cn(
            "py-2 sm:py-2.5 px-1 sm:px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer relative truncate",
            activeTab === "challenge"
              ? "bg-[var(--bg-card)] text-[var(--text)] shadow-xs border border-[var(--border-dim)]"
              : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          <span>⚔️</span>
          <span>Clash</span>
          {activeChallenge && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--terra)] animate-pulse shrink-0" />
          )}
        </button>

        <button
          onClick={() => onTabChange("leaderboard")}
          className={cn(
            "py-2 sm:py-2.5 px-1 sm:px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer truncate",
            activeTab === "leaderboard"
              ? "bg-[var(--bg-card)] text-[var(--text)] shadow-xs border border-[var(--border-dim)]"
              : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          <Trophy size={12} className="text-[var(--gold)] shrink-0" />
          <span className="hidden sm:inline">Leader</span>
          <span>board</span>
        </button>

        <button
          onClick={() => onTabChange("history")}
          className={cn(
            "py-2 sm:py-2.5 px-1 sm:px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer truncate",
            activeTab === "history"
              ? "bg-[var(--bg-card)] text-[var(--text)] shadow-xs border border-[var(--border-dim)]"
              : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          <History size={12} className="shrink-0" />
          <span>History{historyCount > 0 ? ` (${historyCount})` : ""}</span>
        </button>
      </div>

      {/* Tab: Group Challenge Lounge */}
      {activeTab === "challenge" && (
        <TriviaChallengeLounge
          activeChallenge={activeChallenge}
          onSelectChallenge={onSelectChallenge}
          onPlayChallenge={onStartChallenge}
        />
      )}

      {/* Tab: History */}
      {activeTab === "history" && (
        <TriviaHistoryView
          onPlayDeck={onPlayDeck}
          onNewGame={() => onTabChange("solo")}
        />
      )}

      {/* Tab: Leaderboard */}
      {activeTab === "leaderboard" && (
        <TriviaLeaderboardView
          onPlay={() => onTabChange("solo")}
        />
      )}

      {/* Tab: Solo Quiz Setup */}
      {activeTab === "solo" && (
        <div>
          {/* Challenger Benchmark Banner */}
          {challenger && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 border mb-6 relative overflow-hidden"
              style={{
                borderColor: "rgba(0, 135, 81, 0.4)",
                background:
                  "linear-gradient(135deg, rgba(0, 135, 81, 0.14) 0%, rgba(166, 124, 30, 0.08) 100%)",
              }}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#008751]/20 border border-[#008751]/40 flex items-center justify-center shrink-0 text-xl text-[#008751]">
                  <Swords size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#008751]">
                      ⚔️ Head-to-Head Challenge
                    </span>
                    <span className="text-[10px] font-mono text-[var(--gold)]">
                      {challenger.grade || "Sharp Sharp! 🎯"}
                    </span>
                  </div>
                  <div className="text-base font-extrabold truncate" style={{ color: "var(--text)" }}>
                    {challenger.by} scored {challenger.pct}% on Naija Trivia!
                  </div>
                  <p className="text-xs text-[var(--text-dim)] mt-1">
                    Can you beat this? You will answer the{" "}
                    <strong>exact same {challenger.total || 15} questions</strong>.
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
                <div className="text-xs font-bold flex items-center gap-2" style={{ color: "var(--text)" }}>
                  <span>
                    {currentSeenCount} of {currentTotalCount} questions explored
                  </span>
                  {difficulty !== "random" && (
                    <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-input)] border border-[var(--border-dim)] text-[var(--text-dim)]">
                      {difficulty} mode
                    </span>
                  )}
                </div>
                <div className="text-[11px]" style={{ color: "var(--text-mute)" }}>
                  {currentSeenCount >= currentTotalCount
                    ? `You have explored all ${difficulty !== "random" ? difficulty : ""} questions! Next game will cycle fresh.`
                    : "No repeats — you will only see fresh questions until the bank is exhausted."}
                </div>
              </div>
            </div>
            {currentSeenCount > 0 && (
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
                    type="button"
                    onClick={() => setDuration(opt)}
                    className={cn(
                      "rounded-xl p-4 text-center border-2 transition-all cursor-pointer",
                      duration.minutes === opt.minutes
                        ? "border-[var(--terra)] bg-[var(--terra-bg)] shadow-xs"
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

            {/* Difficulty Mode Selector */}
            <div className="surface rounded-2xl p-5 border">
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--text-mute)" }}
                >
                  <Zap size={10} className="inline mr-1.5" /> Difficulty Mode
                </p>
                <span className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider">
                  {difficulty === "random" ? "Default · All Levels" : `Filtered: ${difficulty}`}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDifficulty(opt.id)}
                    className={cn(
                      "rounded-xl p-3.5 text-center border-2 transition-all cursor-pointer",
                      difficulty === opt.id
                        ? "border-[var(--gold)] bg-[var(--gold)]/10 shadow-xs"
                        : "border-[var(--border-dim)] hover:border-[var(--border)]"
                    )}
                  >
                    <div className="text-2xl mb-1.5">{opt.emoji}</div>
                    <div className="font-space font-bold text-sm" style={{ color: "var(--text)" }}>
                      {opt.label}
                    </div>
                    <div
                      className="text-[10px] font-semibold mt-0.5"
                      style={{ color: "var(--text-mute)" }}
                    >
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Review Cadence Selector */}
            <div className="surface rounded-2xl p-5 border">
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "var(--text-mute)" }}
              >
                <BookOpen size={10} className="inline mr-1.5" /> Review Cadence
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("instant")}
                  className={cn(
                    "rounded-xl p-4 text-left border-2 transition-all cursor-pointer",
                    mode === "instant"
                      ? "border-[var(--olive)] bg-[var(--olive)]/5 shadow-xs"
                      : "border-[var(--border-dim)] hover:border-[var(--border)]"
                  )}
                >
                  <div className="font-space font-bold text-sm flex items-center gap-1.5" style={{ color: "var(--text)" }}>
                    <span>⚡ Instant Feedback</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                    Reveal explanation immediately after each question.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("suspense")}
                  className={cn(
                    "rounded-xl p-4 text-left border-2 transition-all cursor-pointer",
                    mode === "suspense"
                      ? "border-[var(--olive)] bg-[var(--olive)]/5 shadow-xs"
                      : "border-[var(--border-dim)] hover:border-[var(--border)]"
                  )}
                >
                  <div className="font-space font-bold text-sm flex items-center gap-1.5" style={{ color: "var(--text)" }}>
                    <span>⏳ Suspense Mode</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                    Answer continuously; review full breakdown at the end.
                  </div>
                </button>
              </div>
            </div>

            {/* Start Solo Button */}
            <button
              onClick={() => onStartSolo(duration.minutes, mode, difficulty)}
              className="w-full py-4 rounded-2xl btn-terra font-space font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer shadow-md hover:opacity-95 transition-opacity"
            >
              <span>{challenger ? `Accept Challenge · Play Same ${challenger.total || 15} Questions` : "Start Solo Sprint"}</span>
              <ChevronRight size={18} />
            </button>

            {/* Squad tournament callout */}
            <div
              className="p-4 rounded-2xl border surface flex items-center justify-between gap-3 text-xs"
              style={{ borderColor: "var(--border-dim)" }}
            >
              <div>
                <span className="font-space font-bold text-[var(--text)] block">
                  Want to challenge your friends?
                </span>
                <span className="text-[11px] text-[var(--text-dim)]">
                  Convene a timed challenge and share the link to see who tops the board.
                </span>
              </div>
              <button
                onClick={() => onTabChange("challenge")}
                className="px-3.5 py-2 rounded-xl border font-space font-bold text-xs hover:bg-[var(--bg-input)] transition-colors cursor-pointer shrink-0"
                style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
              >
                Start Challenge →
              </button>
            </div>
          </div>
        </div>
      )}
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
    if (idx === q.answer) return "border-green-600 bg-green-500/10 text-green-700 dark:text-green-400";
    if (selected === idx && idx !== q.answer) return "border-red-500 bg-red-500/10 text-red-600";
    return "border-[var(--border-dim)] opacity-40";
  };

  return (
    <div className="min-h-screen px-3 py-4 sm:p-8 max-w-2xl mx-auto flex flex-col justify-between">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between mb-3 text-xs font-semibold">
          <span className="flex items-center gap-2" style={{ color: "var(--text-dim)" }}>
            <span className="font-space font-bold uppercase tracking-wider text-xs">{q.category}</span>
            <span
              className={cn(
                "text-[10px] font-mono font-bold px-2 py-0.5 rounded capitalize",
                q.difficulty === "easy"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : q.difficulty === "hard"
                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              )}
            >
              {q.difficulty}
            </span>
          </span>
          <span className="font-space font-bold text-sm" style={{ color: "var(--text)" }}>
            {current + 1}
            <span className="text-[var(--text-mute)] font-normal text-xs">/{questions.length}</span>
          </span>
          <span
            className={cn("font-mono font-bold text-xs flex items-center gap-1.5", {
              "text-red-500 animate-pulse": timeLeft <= 30,
              "text-[var(--text-dim)]": timeLeft > 30,
            })}
          >
            <Clock size={12} /> {formatTime(timeLeft)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 rounded-full overflow-hidden mb-8" style={{ background: "var(--bg-input)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: CATEGORY_COLORS[q.category] }}
            animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question & Options */}
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
            className="font-space font-bold text-2xl sm:text-3xl leading-snug mb-8 tracking-tight"
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
                  "w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-3.5 font-semibold text-sm cursor-pointer shadow-xs",
                  getOptionStyle(idx)
                )}
                style={{ color: "var(--text)" }}
              >
                <span
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 border"
                  style={{ borderColor: "var(--border-dim)", background: "var(--bg-card)" }}
                >
                  {OPTION_LABELS[idx]}
                </span>
                <span className="flex-1 leading-snug">{opt}</span>
                {revealed && idx === q.answer && (
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                )}
                {revealed && selected === idx && idx !== q.answer && (
                  <XCircle size={18} className="text-red-500 shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Explanation (Instant Mode) */}
          {revealed && q.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border text-xs leading-relaxed mb-5 shadow-xs"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-dim)",
                color: "var(--text-dim)",
              }}
            >
              <span className="font-space font-bold text-[var(--olive)] block mb-1">
                Context &amp; Analysis
              </span>
              {q.explanation}
            </motion.div>
          )}

          {/* Next Button (Instant Mode) */}
          {revealed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => advance()}
              className="w-full py-4 rounded-2xl btn-terra font-space font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>{isLast ? "Complete & View Results" : "Next Question"}</span>
              <ChevronRight size={16} />
            </motion.button>
          )}

          {/* Skip Button (Suspense Mode only) */}
          {!revealed && reviewMode === "suspense" && (
            <button
              onClick={() => advance()}
              className="text-xs font-mono font-bold hover:text-[var(--text)] transition-colors mt-2 text-right block ml-auto cursor-pointer"
              style={{ color: "var(--text-mute)" }}
            >
              Skip Question →
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
  difficultyMode,
  onRetry,
  onViewHistory,
  onViewLeaderboard,
  challenger,
  activeChallenge,
  onViewChallengeBoard,
}: {
  questions: TriviaQuestion[];
  answers: (number | null)[];
  reviewMode: ReviewMode;
  xpEarned: number;
  difficultyMode?: TriviaDifficultyFilter;
  onRetry: () => void;
  onViewHistory: () => void;
  onViewLeaderboard: () => void;
  challenger?: ChallengerInfo | null;
  activeChallenge: TriviaChallenge | null;
  onViewChallengeBoard: () => void;
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
      ? { label: "Naija Expert", color: "var(--gold)" }
      : pct >= 60
      ? { label: "Sharp Sharp", color: "var(--olive)" }
      : pct >= 40
      ? { label: "Not bad o", color: "var(--terra)" }
      : { label: "Keep studying", color: "var(--text-mute)" };

  const isVersus = Boolean(challenger && challenger.total > 0);
  const userWon = isVersus && correct > (challenger?.score || 0);
  const userTied = isVersus && correct === (challenger?.score || 0);

  return (
    <div className="min-h-screen px-3 py-4 sm:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--olive)] mb-1 block">
          Official Assessment
        </span>
        <h1 className="font-space text-3xl sm:text-4xl font-extrabold mb-1" style={{ color: "var(--text)" }}>
          Results &amp; Analysis
        </h1>
        <p className="text-sm font-space font-bold uppercase tracking-wider" style={{ color: grade.color }}>
          {grade.label}
        </p>
      </div>

      {/* Group Challenge Standings Notification */}
      {activeChallenge && (
        <div
          className="rounded-3xl p-5 border mb-6 flex items-center justify-between gap-4 shadow-sm"
          style={{ borderColor: "rgba(68, 78, 44, 0.25)", background: "rgba(68, 78, 44, 0.08)" }}
        >
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--olive)] mb-0.5">
              Challenge Standings Recorded
            </div>
            <div className="text-base font-space font-bold text-[var(--text)]">
              {activeChallenge.title}
            </div>
          </div>
          <button
            onClick={onViewChallengeBoard}
            className="px-4 py-2.5 rounded-xl btn-terra text-xs font-space font-bold cursor-pointer shadow-xs"
          >
            View Challenge Board →
          </button>
        </div>
      )}

      {/* Head-to-Head Challenger Comparison */}
      {isVersus && (
        <div
          className="rounded-3xl p-5 border mb-6 text-center relative overflow-hidden shadow-xs"
          style={{
            borderColor: userWon ? "rgba(68, 78, 44, 0.4)" : "var(--border-dim)",
            background: userWon ? "rgba(68, 78, 44, 0.08)" : "var(--bg-card)",
          }}
        >
          <div className="text-xs font-space font-bold uppercase tracking-wider mb-1">
            {userWon ? (
              <span className="text-[var(--olive)]">Victory over Scholar {challenger?.by}</span>
            ) : userTied ? (
              <span className="text-[var(--gold)]">Honorable Stalemate with Scholar {challenger?.by}</span>
            ) : (
              <span style={{ color: "var(--text-mute)" }}>
                Scholar {challenger?.by} leads ({challenger?.score}/{challenger?.total})
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-dim)]">
            You scored {pct}% ({correct}/{total}) vs {challenger?.by}&apos;s {challenger?.pct}% ({challenger?.score}/{challenger?.total}) on this deck.
          </p>
        </div>
      )}

      {/* Score Box */}
      <div className="surface rounded-3xl border p-7 mb-6 text-center shadow-sm">
        <div className="font-space font-black text-6xl sm:text-7xl mb-2" style={{ color: "var(--text)" }}>
          {correct}
          <span className="text-3xl sm:text-4xl font-bold text-[var(--text-mute)]">/{total}</span>
        </div>
        <div
          className="text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          style={{ color: "var(--text-dim)" }}
        >
          <span>{pct}% accuracy</span>
          {difficultyMode && (
            <>
              <span>•</span>
              <span className="capitalize">{difficultyMode} mode</span>
            </>
          )}
        </div>
        {xpEarned > 0 && (
          <div
            className="mt-3 inline-block px-3.5 py-1.5 rounded-full text-xs font-space font-bold"
            style={{ background: "var(--gold-bg)", color: "var(--gold)" }}
          >
            +{xpEarned} XP Earned
          </div>
        )}

        {/* Share Proof Card Action */}
        <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border-dim)" }}>
          <button
            onClick={() => setShowShareModal(true)}
            className="w-full py-3.5 px-4 rounded-xl btn-terra font-space font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Share2 size={16} /> Share Broadside Proof Card
          </button>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="surface rounded-3xl border p-6 mb-6 shadow-xs">
        <p
          className="text-xs font-space font-bold uppercase tracking-wider mb-4"
          style={{ color: "var(--text-mute)" }}
        >
          Category Performance
        </p>
        <div className="space-y-3.5">
          {byCategory.map((stat) => {
            const catPct = Math.round((stat.correct / stat.total) * 100);
            return (
              <div key={stat.category}>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span style={{ color: "var(--text)" }}>{stat.category}</span>
                  <span className="font-mono" style={{ color: "var(--text-mute)" }}>
                    {stat.correct}/{stat.total}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
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

      {/* Suspense Mode Answer Review */}
      {reviewMode === "suspense" && (
        <div className="surface rounded-3xl border p-6 mb-6 shadow-xs">
          <p
            className="text-xs font-space font-bold uppercase tracking-wider mb-4"
            style={{ color: "var(--text-mute)" }}
          >
            Answer Review
          </p>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.answer;
              return (
                <div key={q.id} className="text-xs border-b pb-3.5" style={{ borderColor: "var(--border-dim)" }}>
                  <div className="flex items-start gap-2 mb-1.5">
                    {isCorrect ? (
                      <CheckCircle2 size={15} className="text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                    )}
                    <span className="font-space font-bold text-sm" style={{ color: "var(--text)" }}>
                      {q.question}
                    </span>
                  </div>
                  <div className="ml-6 space-y-1 text-xs">
                    <div className="text-green-700 font-semibold">Correct: {q.options[q.answer]}</div>
                    {!isCorrect && answers[i] !== null && (
                      <div className="text-red-600">Your answer: {q.options[answers[i]!]}</div>
                    )}
                    {q.explanation && (
                      <div className="text-xs mt-1 text-[var(--text-dim)] leading-relaxed">
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

      {/* Primary Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3.5 rounded-2xl border flex items-center justify-center gap-2 font-space font-bold text-sm cursor-pointer hover:bg-[var(--bg-card)] transition-colors"
          style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
        >
          <RefreshCcw size={15} /> Play Again
        </button>
        <Link
          href="/games"
          className="flex-1 py-3.5 rounded-2xl btn-terra flex items-center justify-center gap-2 font-space font-bold text-sm cursor-pointer"
        >
          <span>Back to Games</span>
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Secondary Explorations */}
      <div className="flex gap-3 mt-3">
        <button
          onClick={onViewHistory}
          className="flex-1 py-2.5 rounded-xl border text-xs font-space font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[var(--bg-card)] transition-colors"
          style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
        >
          <History size={13} /> Match Archive
        </button>
        <button
          onClick={onViewLeaderboard}
          className="flex-1 py-2.5 rounded-xl border text-xs font-space font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[var(--bg-card)] transition-colors"
          style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
        >
          <Trophy size={13} className="text-[var(--gold)]" /> Titan Leaderboard
        </button>
      </div>

      {/* Share Score Modal */}
      <ShareTriviaModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        score={correct}
        total={total}
        pct={pct}
        gradeLabel={grade.label}
        xpEarned={xpEarned}
        byCategory={byCategory}
        questionIds={questions.map((q) => q.id)}
      />
    </div>
  );
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export default function TriviaGameClient({
  challenger,
  initialChallenge = null,
}: {
  challenger?: ChallengerInfo | null;
  initialChallenge?: TriviaChallenge | null;
}) {
  const {
    profile,
    addXP,
    seenTriviaQuestionIds = [],
    markTriviaQuestionsSeen,
    resetSeenTriviaQuestions,
    triviaHistory = [],
    saveTriviaRound,
  } = useAppStore();

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [setupTab, setSetupTab] = useState<SetupTab>(initialChallenge ? "challenge" : "solo");
  const [activeChallenge, setActiveChallenge] = useState<TriviaChallenge | null>(initialChallenge || null);

  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [reviewMode, setReviewMode] = useState<ReviewMode>("instant");
  const [totalSeconds, setTotalSeconds] = useState(600);
  const [xpEarned, setXpEarned] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<TriviaDifficultyFilter>("random");

  // Read URL search params on client for challenge codes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("challenge");
    if (code) {
      const decoded = decodeChallengeFromUrl(code);
      if (decoded) {
        setActiveChallenge(decoded);
        setSetupTab("challenge");
      }
    } else {
      const challengeId = params.get("challengeId");
      if (challengeId) {
        const local = getLocalChallenge(challengeId);
        if (local) {
          setActiveChallenge(local);
          setSetupTab("challenge");
        }
      }
    }
  }, []);

  function handleStartSolo(
    minutes: number,
    mode: ReviewMode,
    difficulty: TriviaDifficultyFilter = "random"
  ) {
    let selectedQuestions: TriviaQuestion[] = [];

    // If challenger specified exact question IDs, load those exact questions
    if (challenger?.questionIds && challenger.questionIds.length > 0) {
      const matched = getQuestionsByIds(challenger.questionIds);
      if (matched.length > 0) {
        selectedQuestions = matched;
      }
    }

    if (selectedQuestions.length === 0) {
      const count = QUESTION_COUNTS[minutes] || 15;
      const { questions: freshQuestions, wasReset } = getFreshQuestions(
        count,
        seenTriviaQuestionIds,
        difficulty
      );

      if (wasReset) {
        resetSeenTriviaQuestions();
      }

      selectedQuestions = freshQuestions;
    }

    markTriviaQuestionsSeen(selectedQuestions.map((q) => q.id));

    setCurrentDifficulty(difficulty);
    setQuestions(selectedQuestions);
    setTotalSeconds(minutes * 60);
    setReviewMode(mode);
    setPhase("playing");
  }

  function handleStartChallenge(challenge: TriviaChallenge) {
    setActiveChallenge(challenge);
    const matched = getQuestionsByIds(challenge.questionIds);
    const finalQuestions =
      matched.length > 0 ? matched : TRIVIA_QUESTIONS.slice(0, challenge.questionCount);

    setCurrentDifficulty(challenge.difficulty);
    setQuestions(finalQuestions);
    setTotalSeconds(Math.max(10, challenge.questionCount) * 45); // 45s per question
    setReviewMode("instant");
    setPhase("playing");
  }

  function handlePlayDeck(questionIds: string[], minutes: number) {
    const matched = getQuestionsByIds(questionIds);
    if (matched.length > 0) {
      setQuestions(matched);
      setTotalSeconds(minutes * 60);
      setReviewMode("instant");
      setCurrentDifficulty("random");
      setPhase("playing");
    }
  }

  function handleComplete(finalAnswers: (number | null)[], timeLeft: number) {
    const correct = finalAnswers.filter((a, i) => a === questions[i].answer).length;
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    const base = correct * 5;
    const bonus = pct >= 80 ? 50 : 0;
    const totalXP = base + bonus;

    const byCategory = Object.entries(
      questions.reduce<Record<string, { correct: number; total: number }>>((acc, q, i) => {
        if (!acc[q.category]) acc[q.category] = { correct: 0, total: 0 };
        acc[q.category].total++;
        if (finalAnswers[i] === q.answer) acc[q.category].correct++;
        return acc;
      }, {})
    ).map(([category, stat]) => ({
      category,
      correct: stat.correct,
      total: stat.total,
    }));

    const gradeLabel =
      pct >= 80
        ? "Naija Expert"
        : pct >= 60
        ? "Sharp Sharp"
        : pct >= 40
        ? "Not bad o"
        : "Keep studying";

    // 1. Record in local challenge scores if playing a group challenge
    if (activeChallenge) {
      recordLocalChallengeScore(activeChallenge.id, {
        id: `score_${Date.now()}`,
        username: profile?.username?.trim() || "Scholar",
        avatar: profile?.avatar || "/avatars/avatar-scholar.svg",
        score: correct,
        total,
        pct,
        gradeLabel,
        completedAt: Date.now(),
        timeSpentSeconds: totalSeconds - timeLeft,
      });
    }

    // 2. Persist round in trivia history
    saveTriviaRound({
      score: correct,
      total,
      pct,
      gradeLabel,
      xpEarned: totalXP,
      durationMinutes: Math.max(1, Math.round(totalSeconds / 60)),
      questionIds: questions.map((q) => q.id),
      categoryBreakdown: byCategory,
      reviewMode,
      difficultyMode: currentDifficulty,
      challengerName: challenger?.by,
      challengerScore: challenger?.score,
      challengerTotal: challenger?.total,
      challengerPct: challenger?.pct,
    });

    // 3. Submit score to cloud leaderboard (non-blocking)
    fetch("/api/trivia/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: profile?.username?.trim() || "Scholar",
        avatar: profile?.avatar || "/avatars/avatar-scholar.svg",
        score: correct,
        total,
        pct,
        gradeLabel,
        xpEarned: totalXP,
        challengeId: activeChallenge ? activeChallenge.id : (challenger?.questionIds?.join(",") || undefined),
        questionIds: questions.map((q) => q.id),
        deviceId: profile?.id,
      }),
    }).catch(() => {});

    setAnswers(finalAnswers);
    setXpEarned(totalXP);
    if (totalXP > 0) addXP(totalXP);
    setPhase("results");
  }

  if (phase === "playing") {
    return (
      <GameScreen
        questions={questions}
        reviewMode={reviewMode}
        totalSeconds={totalSeconds}
        onComplete={handleComplete}
      />
    );
  }

  if (phase === "results") {
    return (
      <ResultsScreen
        questions={questions}
        answers={answers}
        reviewMode={reviewMode}
        xpEarned={xpEarned}
        difficultyMode={currentDifficulty}
        onRetry={() => setPhase("setup")}
        onViewHistory={() => {
          setSetupTab("history");
          setPhase("setup");
        }}
        onViewLeaderboard={() => {
          setSetupTab("leaderboard");
          setPhase("setup");
        }}
        challenger={challenger}
        activeChallenge={activeChallenge}
        onViewChallengeBoard={() => {
          setSetupTab("challenge");
          setPhase("setup");
        }}
      />
    );
  }

  return (
    <SetupScreen
      activeTab={setupTab}
      onTabChange={setSetupTab}
      historyCount={triviaHistory.length}
      onStartSolo={handleStartSolo}
      onPlayDeck={handlePlayDeck}
      seenQuestionIds={seenTriviaQuestionIds}
      onResetSeen={resetSeenTriviaQuestions}
      challenger={challenger}
      activeChallenge={activeChallenge}
      onSelectChallenge={setActiveChallenge}
      onStartChallenge={handleStartChallenge}
    />
  );
}
