"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  HelpCircle,
  ShieldCheck,
  Flame,
  Dices,
  Sprout,
  Scale,
  Crown,
  Plus,
  Moon,
  Sun,
  Mic,
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
import { isAnswerAccepted, fetchAndApplyAnswerOverrides, subscribeAnswerOverrides } from "@/lib/trivia-answer-overrides";
import ContestAnswerButton from "@/components/trivia/ContestAnswerButton";
import { useFeatureStore } from "@/store/useFeatureStore";
import { cn } from "@/lib/utils";
import ShareTriviaModal from "@/components/games/ShareTriviaModal";
import TriviaGuideModal from "@/components/games/TriviaGuideModal";
import TriviaHistoryView from "@/components/games/TriviaHistoryView";
import TriviaLeaderboardView from "@/components/games/TriviaLeaderboardView";
import TriviaChallengeLounge from "@/components/games/TriviaChallengeLounge";
import TriviaLeagueLounge from "@/components/trivia/TriviaLeagueLounge";
import ActiveArenasShowcase from "@/components/games/ActiveArenasShowcase";
import NewGameActionModal from "@/components/games/NewGameActionModal";
import CreateLeagueModal from "@/components/trivia/CreateLeagueModal";
import {
  type TriviaChallenge,
  decodeChallengeFromUrl,
  getLocalChallenge,
  recordLocalChallengeScore,
  getUserChallengeAttempt,
  type RecordScoreResult,
} from "@/lib/trivia-challenge";
import { getTriviaPerformanceRemark, type TriviaRemark } from "@/lib/trivia-remarks";


// ─── Types ───────────────────────────────────────────────────────────────────

export type ReviewMode = "instant" | "suspense";
export type GamePhase = "setup" | "playing" | "results";
export type SetupTab = "solo" | "league" | "challenge" | "leaderboard" | "history";
export type DurationOption = {
  label: string;
  minutes: number;
  emoji: string;
  icon: typeof Zap;
  iconColor: string;
};

export interface DifficultyOption {
  id: TriviaDifficultyFilter;
  label: string;
  emoji: string;
  desc: string;
  icon: typeof Dices;
  iconColor: string;
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
  { label: "Quick", minutes: 5, emoji: "⚡", icon: Zap, iconColor: "text-amber-500" },
  { label: "Standard", minutes: 10, emoji: "🎯", icon: Target, iconColor: "text-[var(--terra)]" },
  { label: "Marathon", minutes: 15, emoji: "🏆", icon: Trophy, iconColor: "text-[var(--gold)]" },
];

export const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { id: "random", label: "Random", emoji: "🎲", desc: "Mixed Pool (Default)", icon: Dices, iconColor: "text-[var(--olive)]" },
  { id: "easy", label: "Easy", emoji: "🌱", desc: "Cultural basics", icon: Sprout, iconColor: "text-emerald-500" },
  { id: "medium", label: "Medium", emoji: "⚖️", desc: "Balanced level", icon: Scale, iconColor: "text-amber-600 dark:text-amber-400" },
  { id: "hard", label: "Hard", emoji: "🔥", desc: "Scholar lore", icon: Flame, iconColor: "text-[var(--terra)]" },
];

const CATEGORY_COLORS: Record<TriviaCategory, string> = {
  "History": "var(--terra)",
  "Pop Culture": "#7B3FC8",
  "General Knowledge": "var(--olive)",
  "Sports": "#0284C7",
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
  onOpenGuide,
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
  onOpenGuide?: () => void;
}) {
  const [duration, setDuration] = useState<DurationOption>(DURATION_OPTIONS[1]);
  const [mode, setMode] = useState<ReviewMode>("instant");
  const [difficulty, setDifficulty] = useState<TriviaDifficultyFilter>("random");
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState(false);
  const [challengeCreateMode, setChallengeCreateMode] = useState(false);

  const profile = useAppStore((s) => s.profile);
  const openClaimAccountPrompt = useAppStore((s) => s.openClaimAccountPrompt);

  // Admin feature flags for sub-menus (temporarily disable during revamps)
  const { features, fetchFeatures } = useFeatureStore();
  const enableChallenges = features?.enableTriviaChallenges ?? true;
  const enableLeagues = features?.enableTriviaLeagues ?? true;
  const enableLeaderboard = features?.enableTriviaLeaderboard ?? true;
  const visibleTabCount = 2 + (enableChallenges ? 1 : 0) + (enableLeagues ? 1 : 0) + (enableLeaderboard ? 1 : 0);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  useEffect(() => {
    if (
      (activeTab === "challenge" && !enableChallenges) ||
      (activeTab === "league" && !enableLeagues) ||
      (activeTab === "leaderboard" && !enableLeaderboard)
    ) {
      onTabChange("solo");
    }
  }, [activeTab, enableChallenges, enableLeagues, enableLeaderboard, onTabChange]);

  const filteredPool =
    difficulty === "random"
      ? TRIVIA_QUESTIONS
      : TRIVIA_QUESTIONS.filter((q) => q.difficulty === difficulty);

  const seenSet = new Set(seenQuestionIds);
  const currentSeenCount = filteredPool.filter((q) => seenSet.has(q.id)).length;
  const currentTotalCount = filteredPool.length;

  return (
    <div className="min-h-screen px-3 py-4 sm:p-8 max-w-2xl mx-auto flex flex-col justify-center">
      {/* Top Bar: Back Link & Action Header */}
      <div className="flex items-center justify-between gap-2 mb-6">
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors py-1.5 whitespace-nowrap shrink-0 group active:scale-95"
        >
          <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5 shrink-0" />
          <span className="hidden xs:inline sm:inline">Back to </span>
          <span>Games</span>
        </Link>

        {/* Action Controls: Streak -> How to Play -> Create */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!profile.hasClaimedAccount && (
            <button
              type="button"
              onClick={openClaimAccountPrompt}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl border border-amber-500/35 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold font-space transition-all cursor-pointer whitespace-nowrap shadow-2xs active:scale-95 shrink-0"
              title="Link a free account to track your daily streak & ranking across devices"
            >
              <Flame size={13} className="text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Track Streak</span>
              <span className="sm:hidden">Streak</span>
            </button>
          )}

          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--bg-panel)] text-[var(--text)] text-xs font-bold font-space transition-all cursor-pointer whitespace-nowrap shadow-2xs active:scale-95 shrink-0"
              title="How to Play Naija Trivia"
              aria-label="How to Play Naija Trivia"
            >
              <HelpCircle size={14} className="text-[var(--olive)] shrink-0" />
              <span className="hidden sm:inline">How to Play</span>
            </button>
          )}

          {/* + Create Action Button */}
          <button
            type="button"
            onClick={() => setShowNewGameModal(true)}
            className="btn-terra inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold font-space transition-all cursor-pointer whitespace-nowrap shadow-xs hover:scale-[1.02] active:scale-95 shrink-0"
            title="Create League, Challenge, or Solo Quiz"
          >
            <Plus size={13} strokeWidth={2.5} className="shrink-0" />
            <span>Create</span>
          </button>
        </div>
      </div>

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
        className="grid gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-[var(--bg-input)] border mb-6 relative"
        style={{ borderColor: "var(--border-dim)", gridTemplateColumns: `repeat(${visibleTabCount}, minmax(0, 1fr))` }}
      >
        <button
          onClick={() => onTabChange("solo")}
          className={cn(
            "relative py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer truncate touch-manipulation select-none active:scale-[0.98] z-10",
            activeTab === "solo" ? "text-[var(--text)]" : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          {activeTab === "solo" && (
            <motion.div
              layoutId="activeTriviaTabPill"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="absolute inset-0 rounded-xl bg-[var(--bg-card)] shadow-xs border border-[var(--border-dim)] z-[-1]"
            />
          )}
          <Sparkles size={13} className="text-[var(--terra)] shrink-0" />
          <span className="hidden sm:inline">Play Solo</span>
          <span className="sm:hidden">Solo</span>
        </button>

        {enableLeagues && (
        <button
          onClick={() => onTabChange("league")}
          className={cn(
            "relative py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer truncate touch-manipulation select-none active:scale-[0.98] z-10",
            activeTab === "league" ? "text-[var(--text)]" : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          {activeTab === "league" && (
            <motion.div
              layoutId="activeTriviaTabPill"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="absolute inset-0 rounded-xl bg-[var(--bg-card)] shadow-xs border border-[var(--border-dim)] z-[-1]"
            />
          )}
          <Trophy size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Leagues</span>
        </button>
        )}

        {enableChallenges && (
        <button
          onClick={() => onTabChange("challenge")}
          className={cn(
            "relative py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer truncate touch-manipulation select-none active:scale-[0.98] z-10",
            activeTab === "challenge" ? "text-[var(--text)]" : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          {activeTab === "challenge" && (
            <motion.div
              layoutId="activeTriviaTabPill"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="absolute inset-0 rounded-xl bg-[var(--bg-card)] shadow-xs border border-[var(--border-dim)] z-[-1]"
            />
          )}
          <Swords size={13} className="text-[var(--olive)] shrink-0" />
          <span className="hidden sm:inline">Challenges</span>
          <span className="sm:hidden">1v1</span>
          {activeChallenge && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--terra)] animate-pulse shrink-0" />
          )}
        </button>
        )}

        {enableLeaderboard && (
        <button
          onClick={() => onTabChange("leaderboard")}
          className={cn(
            "relative py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer truncate touch-manipulation select-none active:scale-[0.98] z-10",
            activeTab === "leaderboard" ? "text-[var(--text)]" : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          {activeTab === "leaderboard" && (
            <motion.div
              layoutId="activeTriviaTabPill"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="absolute inset-0 rounded-xl bg-[var(--bg-card)] shadow-xs border border-[var(--border-dim)] z-[-1]"
            />
          )}
          <Crown size={13} className="text-[var(--gold)] shrink-0" />
          <span className="hidden sm:inline">Leaderboard</span>
          <span className="sm:hidden">Ranks</span>
        </button>
        )}

        <button
          onClick={() => onTabChange("history")}
          className={cn(
            "relative py-2 sm:py-2.5 px-1 sm:px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer truncate touch-manipulation select-none active:scale-[0.98] z-10",
            activeTab === "history" ? "text-[var(--text)]" : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          {activeTab === "history" && (
            <motion.div
              layoutId="activeTriviaTabPill"
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="absolute inset-0 rounded-xl bg-[var(--bg-card)] shadow-xs border border-[var(--border-dim)] z-[-1]"
            />
          )}
          <History size={12} className="shrink-0" />
          <span className="hidden sm:inline">History{historyCount > 0 ? ` (${historyCount})` : ""}</span>
          <span className="sm:hidden">History</span>
        </button>
      </div>

      {/* Tab: Friendship Leagues */}
      {activeTab === "league" && enableLeagues && (
        <TriviaLeagueLounge />
      )}

      {/* Tab: Group Challenge Lounge */}
      {activeTab === "challenge" && enableChallenges && (
        <TriviaChallengeLounge
          activeChallenge={activeChallenge}
          onSelectChallenge={onSelectChallenge}
          onPlayChallenge={onStartChallenge}
          initialCreateMode={challengeCreateMode}
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
      {activeTab === "leaderboard" && enableLeaderboard && (
        <TriviaLeaderboardView
          onPlay={() => onTabChange("solo")}
        />
      )}

      {/* Tab: Solo Quiz Setup */}
      {activeTab === "solo" && (
        <div>
          {/* Active Arenas, Leagues, Challenges & Parlor Games Showcase */}
          <ActiveArenasShowcase
            onTabChange={onTabChange}
            onStartChallenge={onStartChallenge}
            onCreateLeague={() => setShowCreateLeagueModal(true)}
            onCreateChallenge={() => {
              setChallengeCreateMode(true);
              onTabChange("challenge");
            }}
            showParlorLinks={true}
          />

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
                    <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[#008751] inline-flex items-center gap-1">
                      <Swords size={11} /> Head-to-Head Challenge
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
                <Target size={18} className="text-[var(--olive)]" />
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
            <div id="solo-quiz-config" className="surface rounded-2xl p-5 border scroll-mt-6">
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
                    <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center bg-[var(--bg-input)] border border-[var(--border-dim)] shadow-xs">
                      <opt.icon size={20} className={opt.iconColor} strokeWidth={2.2} />
                    </div>
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
                    <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center bg-[var(--bg-input)] border border-[var(--border-dim)] shadow-xs">
                      <opt.icon size={18} className={opt.iconColor} strokeWidth={2.2} />
                    </div>
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
                className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                style={{ color: "var(--text-mute)" }}
              >
                <BookOpen size={12} className="text-[var(--text-dim)]" />
                <span>When Answers Are Shown</span>
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
                    <Zap size={15} className="text-amber-500" />
                    <span>Instant Feedback</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                    See correct answers and explanations after every question.
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
                    <Clock size={15} className="text-[var(--terra)]" />
                    <span>Suspense Mode</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                    Answer without interruptions; see all answers at the end.
                  </div>
                </button>
              </div>
            </div>

            {/* Start Solo Button */}
            <button
              onClick={() => onStartSolo(duration.minutes, mode, difficulty)}
              className="w-full py-4 rounded-2xl btn-terra font-space font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer shadow-md hover:opacity-95 transition-opacity"
            >
              <span>{challenger ? `Accept Challenge · Play Same ${challenger.total || 15} Questions` : "Start Solo Quiz"}</span>
              <ChevronRight size={18} />
            </button>

            {/* Squad tournament callout */}
            {enableChallenges && (
            <div
              className="p-4 rounded-2xl border surface flex items-center justify-between gap-3 text-xs"
              style={{ borderColor: "var(--border-dim)" }}
            >
              <div>
                <span className="font-space font-bold text-[var(--text)] block">
                  Want to challenge your friends?
                </span>
                <span className="text-[11px] text-[var(--text-dim)]">
                  Create a timed challenge and share the link to see who tops the board.
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
            )}
          </div>
        </div>
      )}

      {/* ── New Game Action Modal (+ Button Options: League, Challenge, Solo) ── */}
      <NewGameActionModal
        isOpen={showNewGameModal}
        onClose={() => setShowNewGameModal(false)}
        onCreateLeague={() => setShowCreateLeagueModal(true)}
        onCreateChallenge={() => {
          setChallengeCreateMode(true);
          onTabChange("challenge");
        }}
        onCreateSolo={() => {
          onTabChange("solo");
          const el = document.getElementById("solo-quiz-config");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* ── Create League Modal ── */}
      <CreateLeagueModal
        isOpen={showCreateLeagueModal}
        onClose={() => setShowCreateLeagueModal(false)}
      />
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

  // Timer: strictly paused when an answer is revealed (review / explanation / contesting)
  useEffect(() => {
    if (revealed) return; // PAUSED during answer review, explanation, and contesting!

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
  }, [revealed, answers, onComplete]);

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
    if (isAnswerAccepted(q, idx)) return "border-green-600 bg-green-500/10 text-green-700 dark:text-green-400";
    if (selected === idx && !isAnswerAccepted(q, idx)) return "border-red-500 bg-red-500/10 text-red-600";
    return "border-[var(--border-dim)] opacity-40";
  };

  return (
    <div className="min-h-[calc(100dvh-8rem)] md:min-h-screen px-3.5 py-4 sm:p-8 pb-20 md:pb-8 max-w-2xl mx-auto flex flex-col">
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between mb-2.5 sm:mb-3 text-xs font-semibold">
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
              "text-amber-600 dark:text-amber-400": revealed,
              "text-red-500 animate-pulse": !revealed && timeLeft <= 30,
              "text-[var(--text-dim)]": !revealed && timeLeft > 30,
            })}
          >
            <Clock size={12} /> {formatTime(timeLeft)}
            {revealed && (
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-amber-700 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded">
                Paused
              </span>
            )}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 rounded-full overflow-hidden mb-5 sm:mb-8" style={{ background: "var(--bg-input)" }}>
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
          className="sm:my-auto py-1 sm:py-4"
        >
          {/* Question Text */}
          <h2
            className="font-space font-bold text-xl sm:text-3xl leading-snug mb-5 sm:mb-8 tracking-tight"
            style={{ color: "var(--text)" }}
          >
            {q.question}
          </h2>

          {/* Options */}
          <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={revealed || (reviewMode === "suspense" && selected !== null)}
                onClick={() => handleSelect(idx)}
                className={cn(
                  "w-full text-left p-3.5 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-3.5 font-semibold text-sm cursor-pointer shadow-xs touch-manipulation select-none active:scale-[0.99]",
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
                {revealed && isAnswerAccepted(q, idx) && (
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                )}
                {revealed && selected === idx && !isAnswerAccepted(q, idx) && (
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
              className="p-4 sm:p-5 rounded-2xl border text-xs leading-relaxed mb-4 shadow-xs"
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

          {/* Contest a wrong answer key (Instant Mode) */}
          {revealed && selected !== null && selected >= 0 && !isAnswerAccepted(q, selected) && (
            <div className="mb-4">
              <ContestAnswerButton key={`${q.id}_${selected}`} question={q} selected={selected} />
            </div>
          )}

          {/* Next Button (Instant Mode) */}
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2"
            >
              <button
                onClick={() => advance()}
                className="w-full py-3.5 sm:py-4 rounded-2xl btn-terra font-space font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] transition-transform touch-manipulation select-none"
              >
                <span>{isLast ? "Complete & View Results" : "Next Question"}</span>
                <ChevronRight size={16} />
              </button>
            </motion.div>
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

interface RedemptionSummary {
  originalCorrect: number;
  originalTotal: number;
  redeemedCount: number;
  missedTotal: number;
  adjustedScore: number;
  cappedPct: number;
  bonusXp: number;
}

function ResultsScreen({
  questions,
  answers,
  reviewMode,
  xpEarned,
  difficultyMode,
  onRetry,
  onStartFreshDeck,
  onStartRedemption,
  hasUsedRedemption,
  redemptionSummary,
  onViewHistory,
  onViewLeaderboard,
  challenger,
  activeChallenge,
  onViewChallengeBoard,
  challengeRecordResult,
}: {
  questions: TriviaQuestion[];
  answers: (number | null)[];
  reviewMode: ReviewMode;
  xpEarned: number;
  difficultyMode?: TriviaDifficultyFilter;
  onRetry: () => void;
  onStartFreshDeck: () => void;
  onStartRedemption: (missedQuestions: TriviaQuestion[]) => void;
  hasUsedRedemption: boolean;
  redemptionSummary: RedemptionSummary | null;
  onViewHistory: () => void;
  onViewLeaderboard: () => void;
  challenger?: ChallengerInfo | null;
  activeChallenge: TriviaChallenge | null;
  onViewChallengeBoard: () => void;
  challengeRecordResult?: RecordScoreResult | null;
}) {
  const [showShareModal, setShowShareModal] = useState(false);
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const openClaimAccountPrompt = useAppStore((s) => s.openClaimAccountPrompt);
  const startSession = useAppStore((s) => s.startSession);
  const addXP = useAppStore((s) => s.addXP);
  // Re-render when an answer contest is upheld so the score and review update live
  const [, setOverrideVersion] = useState(0);
  useEffect(() => subscribeAnswerOverrides(() => setOverrideVersion((v) => v + 1)), []);
  const rawCorrect = answers.filter((a, i) => a !== null && isAnswerAccepted(questions[i], a)).length;
  const rawTotal = questions.length;

  const correct = redemptionSummary ? redemptionSummary.adjustedScore : rawCorrect;
  const total = redemptionSummary ? redemptionSummary.originalTotal : rawTotal;
  const pct = redemptionSummary ? redemptionSummary.cappedPct : Math.round((rawCorrect / rawTotal) * 100);

  const missedQuestions = questions.filter(
    (q, i) => answers[i] === null || !isAnswerAccepted(q, answers[i] as number)
  );

  // Pick a missed question (or first question with explanation if 100%) for Game-to-Voice Cross-Pollination
  const crossPollinationQuestion = (() => {
    if (missedQuestions.length > 0) return { question: missedQuestions[0], wasMissed: true };
    const withExp = questions.find((q) => Boolean(q.explanation));
    return withExp ? { question: withExp, wasMissed: false } : questions[0] ? { question: questions[0], wasMissed: false } : null;
  })();

  // Near-miss & next-round target calculation
  const nearMissInfo = (() => {
    if (pct >= 100 || total <= 0) return null;
    const nextTargetPct = pct < 60 ? 60 : pct < 80 ? 80 : 100;
    const nextTierLabel = pct < 60 ? "Sharp Sharp Tier" : pct < 80 ? "Naija Expert Tier" : "Perfect Score";
    const neededCorrect = Math.ceil((nextTargetPct / 100) * total);
    const diff = Math.max(1, neededCorrect - correct);
    const isTrueNearMiss = diff <= 2;
    return { diff, neededCorrect, nextTargetPct, nextTierLabel, isTrueNearMiss };
  })();

  function handleLaunchVoiceFromTrivia(q: TriviaQuestion) {
    const correctOption = q.options[q.answer];
    const initialNotes = `Trivia Concept: ${q.question}\nKey Fact: ${correctOption}${
      q.explanation ? `\nContext: ${q.explanation}` : ""
    }`;
    addXP(50);
    const sessionId = startSession(
      {
        id: `trivia_voice_${q.id}`,
        text: `${q.question} — Explain why "${correctOption}" is the answer in your own words.`,
        category: "History",
        difficulty: "Scholar",
        tags: [q.category, "Trivia Synthesis"],
      },
      0,
      "speaking",
      60,
      initialNotes
    );
    router.push(`/session/${sessionId}`);
  }

  const byCategory = Object.entries(
    questions.reduce<Record<string, { correct: number; total: number }>>((acc, q, i) => {
      if (!acc[q.category]) acc[q.category] = { correct: 0, total: 0 };
      acc[q.category].total++;
      if (answers[i] !== null && isAnswerAccepted(q, answers[i] as number)) acc[q.category].correct++;
      return acc;
    }, {})
  ).map(([category, stat]) => ({
    category,
    correct: stat.correct,
    total: stat.total,
  }));

  const remark = getTriviaPerformanceRemark(pct, questions.map((q) => q.id).join(""));

  const isVersus = Boolean(challenger && challenger.total > 0);
  const userWon = isVersus && correct > (challenger?.score || 0);
  const userTied = isVersus && correct === (challenger?.score || 0);

  return (
    <div className="min-h-screen px-3 py-4 sm:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--olive)] mb-1 block">
          Official Assessment
        </span>
        <h1 className="font-space text-3xl sm:text-4xl font-extrabold mb-1.5" style={{ color: "var(--text)" }}>
          Results &amp; Analysis
        </h1>
        <p className="text-sm sm:text-base font-space font-black uppercase tracking-wider" style={{ color: remark.color }}>
          {remark.gradeTitle}
        </p>
      </div>

      {/* Cultural Examiner Commentary Verdict */}
      <div
        className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border surface text-center space-y-1.5 mb-6 relative overflow-hidden shadow-xs"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--text-mute)] flex items-center justify-center gap-1.5">
          <span>🇳🇬</span>
          <span>Examiner's Verdict</span>
        </div>
        <p className="font-space font-extrabold text-base sm:text-lg italic" style={{ color: "var(--text)" }}>
          “{remark.funMessage}”
        </p>
      </div>

      {/* Group Challenge Standings Notification */}
      {activeChallenge && (
        <div
          className="rounded-3xl p-5 border mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
          style={{
            borderColor:
              challengeRecordResult && !challengeRecordResult.isFirstAttempt
                ? "rgba(166, 124, 30, 0.35)"
                : "rgba(0, 135, 81, 0.35)",
            background:
              challengeRecordResult && !challengeRecordResult.isFirstAttempt
                ? "rgba(166, 124, 30, 0.08)"
                : "rgba(0, 135, 81, 0.08)",
          }}
        >
          <div className="space-y-1">
            <div
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold"
              style={{
                color:
                  challengeRecordResult && !challengeRecordResult.isFirstAttempt
                    ? "var(--gold)"
                    : "#008751",
              }}
            >
              {challengeRecordResult && !challengeRecordResult.isFirstAttempt ? (
                <>
                  <span>🔒</span>
                  <span>Leaderboard Locked · First Attempt Preserved</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Official 1st Attempt Logged to Leaderboard</span>
                </>
              )}
            </div>

            <div className="text-base font-space font-bold text-[var(--text)]">
              {activeChallenge.title}
            </div>

            <div className="text-xs text-[var(--text-dim)]">
              {challengeRecordResult && !challengeRecordResult.isFirstAttempt ? (
                <span>
                  Practice run complete ({pct}%). Your official tournament score remains locked at{" "}
                  <strong className="text-[var(--text)]">
                    {challengeRecordResult.officialScore.pct}% ({challengeRecordResult.officialScore.score}/{challengeRecordResult.officialScore.total})
                  </strong>{" "}
                  from your first attempt.
                </span>
              ) : (
                <span>
                  Your official tournament run is locked at{" "}
                  <strong className="text-[var(--text)]">
                    {pct}% ({correct}/{total})
                  </strong>
                  . Replays will not alter your position on the board.
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onViewChallengeBoard}
            className={cn(
              "px-4 py-2.5 rounded-xl font-space font-bold text-xs cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto shrink-0",
              challengeRecordResult && !challengeRecordResult.isFirstAttempt
                ? "border hover:bg-[var(--bg-card)] transition-colors text-[var(--text)]"
                : "btn-terra"
            )}
            style={
              challengeRecordResult && !challengeRecordResult.isFirstAttempt
                ? { borderColor: "var(--border-dim)" }
                : undefined
            }
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
              <span className="text-[var(--olive)]">Victory over {challenger?.by && challenger.by !== "Scholar" ? challenger.by : "Challenger"}</span>
            ) : userTied ? (
              <span className="text-[var(--gold)]">Honorable Stalemate with {challenger?.by && challenger.by !== "Scholar" ? challenger.by : "Challenger"}</span>
            ) : (
              <span style={{ color: "var(--text-mute)" }}>
                {challenger?.by && challenger.by !== "Scholar" ? challenger.by : "Challenger"} leads ({challenger?.score}/{challenger?.total})
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
          <div className="mt-3 flex flex-col items-center gap-1.5">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-space font-extrabold shadow-xs"
              style={{ background: "var(--gold-bg)", color: "var(--gold)" }}
            >
              <span>⚡ +{xpEarned} XP Earned</span>
              {Boolean(activeChallenge || challenger) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--gold)] text-black uppercase font-mono tracking-wider font-extrabold">
                  High-Stakes Challenge
                </span>
              )}
            </div>
            {Boolean(activeChallenge || challenger) && (
              <span className="text-[11px] text-[var(--gold)] font-medium">
                🔒 One-Trial Locked Multiplier &amp; Conviction Bonus applied!
              </span>
            )}
          </div>
        )}

        {/* Share Score Card Action */}
        <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--border-dim)" }}>
          {redemptionSummary && (
            <div
              className="mb-4 p-3.5 rounded-2xl border text-left"
              style={{
                borderColor: "var(--olive)",
                background: "rgba(68, 78, 44, 0.08)",
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--olive)]">
                  Redemption Complete · 1/1 Attempt Used
                </span>
                <span className="text-[10px] font-mono font-bold text-[var(--gold)]">
                  +{redemptionSummary.bonusXp} Recovery XP
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>
                You redeemed <strong>{redemptionSummary.redeemedCount}/{redemptionSummary.missedTotal}</strong> missed questions (0.5x recovery credit, capped below full score). Your adjusted round score moved from{" "}
                <strong>{redemptionSummary.originalCorrect}/{redemptionSummary.originalTotal}</strong> to{" "}
                <strong>{redemptionSummary.adjustedScore}/{redemptionSummary.originalTotal} ({redemptionSummary.cappedPct}%)</strong>.
              </p>
            </div>
          )}
          <button
            onClick={() => setShowShareModal(true)}
            className="w-full py-3.5 px-4 rounded-xl btn-terra font-space font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Share2 size={16} /> Share Score Card
          </button>
        </div>
      </div>

      {/* Redemption Drill (1 Attempt Capped) & Fresh Deck Target Nudge */}
      <div
        className="rounded-3xl p-5 border mb-6 flex flex-col gap-4 shadow-xs"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-card)",
        }}
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--olive)]">
              <Target size={13} className="text-[var(--terra)]" />
              <span>
                {nearMissInfo
                  ? nearMissInfo.isTrueNearMiss
                    ? `Near Miss · Just ${nearMissInfo.diff} Correct Answer${nearMissInfo.diff > 1 ? "s" : ""} Short`
                    : `Next Round Target · Aim for ${nearMissInfo.neededCorrect}/${total} (${nearMissInfo.nextTargetPct}%)`
                  : "Top Tier Mastery"}
              </span>
            </div>
            {!hasUsedRedemption && missedQuestions.length > 0 && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-[var(--terra)]/30 bg-[var(--terra)]/10 text-[var(--terra)]">
                1 Redemption Attempt Available
              </span>
            )}
          </div>

          <div className="text-sm sm:text-base font-space font-bold text-[var(--text)]">
            {nearMissInfo
              ? !hasUsedRedemption && missedQuestions.length > 0
                ? `Redeem your ${missedQuestions.length} missed question${missedQuestions.length > 1 ? "s" : ""} or play a fresh ${total}-question deck for ${nearMissInfo.nextTargetPct}% (${nearMissInfo.nextTierLabel})`
                : `Play a fresh ${total}-question deck and aim for ${nearMissInfo.neededCorrect}/${total} (${nearMissInfo.nextTargetPct}% ${nearMissInfo.nextTierLabel})`
              : "Flawless round! See where you stand on the Leaderboard."}
          </div>

          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
            {nearMissInfo
              ? !hasUsedRedemption && missedQuestions.length > 0
                ? `Redemption gives you 1 shot at only the ${missedQuestions.length} question${missedQuestions.length > 1 ? "s" : ""} you missed for half-credit recovery (+2 XP each, max score capped at 85%). Want a clean shot at 100%? Start a fresh deck instead.`
                : "Your 1 redemption attempt has been used for this round. Start a brand-new deck of questions for a clean full-score run."
              : "Your accuracy puts you among the top contenders today."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          {!hasUsedRedemption && missedQuestions.length > 0 && (
            <button
              type="button"
              onClick={() => onStartRedemption(missedQuestions)}
              className="btn-terra flex-1 py-2.5 px-4 rounded-xl font-space font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCcw size={13} />
              <span>Redeem {missedQuestions.length} Missed (1 Shot · Capped)</span>
            </button>
          )}
          <button
            type="button"
            onClick={nearMissInfo ? onStartFreshDeck : onViewLeaderboard}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--olive)] bg-[var(--bg-panel)] hover:bg-[var(--olive)] hover:text-white text-[var(--olive)] font-space font-bold text-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{nearMissInfo ? `Play Fresh Deck (${total} New Qs)` : "View Leaderboard"}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Game-to-Voice Cross-Pollination Nudge (Explain a Missed Question in 60s) */}
      {crossPollinationQuestion && (
        <div
          className="rounded-3xl p-5 border mb-6 shadow-xs"
          style={{
            borderColor: "var(--gold)",
            background: "rgba(166, 124, 30, 0.06)",
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--gold)]">
              <Mic size={13} className="text-[var(--terra)]" />
              <span>
                {crossPollinationQuestion.wasMissed
                  ? "Turn a Missed Question into Mastery"
                  : "Deepen Your Mastery"}
              </span>
            </div>
            <span className="tag tag-gold text-[10px] font-mono font-bold px-2 py-0.5">
              +50 Bonus XP
            </span>
          </div>

          <p className="font-serif font-bold text-sm sm:text-base mb-1.5" style={{ color: "var(--text)" }}>
            {crossPollinationQuestion.question.question}
          </p>
          <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--text-dim)" }}>
            <strong style={{ color: "var(--text)" }}>
              Answer: {crossPollinationQuestion.question.options[crossPollinationQuestion.question.answer]}.
            </strong>{" "}
            {crossPollinationQuestion.question.explanation ||
              "Articulate why this answer is correct in your own voice under 60 seconds to cement it in memory."}
          </p>

          <button
            type="button"
            onClick={() => handleLaunchVoiceFromTrivia(crossPollinationQuestion.question)}
            className="btn-terra w-full sm:w-auto px-4 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mic size={14} />
            <span>Explain in 60s Voice Challenge</span>
          </button>
        </div>
      )}

      {/* Save Score & Create Account Callout for Guest Players */}
      {!profile.hasClaimedAccount && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl p-5 border mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(166, 124, 30, 0.12) 0%, rgba(122, 28, 46, 0.08) 100%)",
            borderColor: "rgba(166, 124, 30, 0.35)",
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
              <Flame size={13} className="text-amber-500 animate-pulse" />
              <span>Playing as Guest · Streak Not Tracked</span>
            </div>
            <div className="text-base font-space font-bold text-[var(--text)]">
              Track your daily streak &amp; lock your rank
            </div>
            <p className="text-xs text-[var(--text-dim)] max-w-md leading-relaxed">
              Link a free account in 10 seconds so today&apos;s trivia match counts towards your daily streak and keeps your +{xpEarned} XP and score ({pct}%) safe across devices.
            </p>
          </div>
          <button
            onClick={openClaimAccountPrompt}
            className="btn-terra px-4 py-2.5 rounded-xl font-space font-bold text-xs cursor-pointer whitespace-nowrap shrink-0 shadow-md self-start sm:self-auto"
          >
            <span>Track Streak →</span>
          </button>
        </motion.div>
      )}

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
              const isCorrect = answers[i] !== null && isAnswerAccepted(q, answers[i] as number);
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
                    {!isCorrect && answers[i] !== null && (answers[i] as number) >= 0 && (
                      <div className="pt-1.5">
                        <ContestAnswerButton key={`${q.id}_${answers[i]}`} question={q} selected={answers[i] as number} />
                      </div>
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
        gradeLabel={remark.gradeTitle}
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
    triggerActivityFeedbackIfEligible,
    hasSeenTriviaGuide,
    dismissTriviaGuide,
  } = useAppStore();

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [setupTab, setSetupTab] = useState<SetupTab>(initialChallenge ? "challenge" : "solo");
  const [activeChallenge, setActiveChallenge] = useState<TriviaChallenge | null>(initialChallenge || null);

  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [reviewMode, setReviewMode] = useState<ReviewMode>("instant");
  const [totalSeconds, setTotalSeconds] = useState(600);
  const [lastSoloMinutes, setLastSoloMinutes] = useState(10);
  const [xpEarned, setXpEarned] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<TriviaDifficultyFilter>("random");
  const [lastChallengeResult, setLastChallengeResult] = useState<RecordScoreResult | null>(null);
  const [isRedemptionRound, setIsRedemptionRound] = useState(false);
  const [hasUsedRedemption, setHasUsedRedemption] = useState(false);
  const [redemptionSummary, setRedemptionSummary] = useState<RedemptionSummary | null>(null);
  const [preRedemptionSnapshot, setPreRedemptionSnapshot] = useState<{
    correct: number;
    total: number;
    xpEarned: number;
  } | null>(null);

  const [showGuideModal, setShowGuideModal] = useState(false);

  // Load accepted answer-contest overrides so grading reflects corrected answer keys
  useEffect(() => {
    fetchAndApplyAnswerOverrides();
  }, []);

  // Automatically display the How to Play guide for new users who have never played before
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("preview=1")) return;
    if (!hasSeenTriviaGuide && (!triviaHistory || triviaHistory.length === 0)) {
      setShowGuideModal(true);
    }
  }, [hasSeenTriviaGuide, triviaHistory]);

  const handleCloseGuide = () => {
    dismissTriviaGuide();
    setShowGuideModal(false);
  };

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

    setLastSoloMinutes(minutes);
    setCurrentDifficulty(difficulty);
    setQuestions(selectedQuestions);
    setTotalSeconds(minutes * 60);
    setReviewMode(mode);
    setLastChallengeResult(null);
    setIsRedemptionRound(false);
    setHasUsedRedemption(false);
    setRedemptionSummary(null);
    setPreRedemptionSnapshot(null);
    setPhase("playing");
  }

  function handleStartFreshDeck() {
    const count = QUESTION_COUNTS[lastSoloMinutes] || 15;
    const { questions: freshQuestions, wasReset } = getFreshQuestions(
      count,
      seenTriviaQuestionIds,
      currentDifficulty
    );
    if (wasReset) {
      resetSeenTriviaQuestions();
    }
    markTriviaQuestionsSeen(freshQuestions.map((q) => q.id));
    setQuestions(freshQuestions);
    setTotalSeconds(lastSoloMinutes * 60);
    setLastChallengeResult(null);
    setIsRedemptionRound(false);
    setHasUsedRedemption(false);
    setRedemptionSummary(null);
    setPreRedemptionSnapshot(null);
    setPhase("playing");
  }

  function handleStartRedemption(missedQuestions: TriviaQuestion[]) {
    if (hasUsedRedemption || missedQuestions.length === 0) return;
    const currentCorrect = answers.filter(
      (a, i) => a !== null && isAnswerAccepted(questions[i], a)
    ).length;
    setPreRedemptionSnapshot({
      correct: currentCorrect,
      total: questions.length,
      xpEarned,
    });
    setIsRedemptionRound(true);
    setHasUsedRedemption(true);
    setQuestions(missedQuestions);
    setTotalSeconds(Math.max(30, missedQuestions.length * 30));
    setPhase("playing");
  }

  function handleStartChallenge(challenge: TriviaChallenge) {
    setActiveChallenge(challenge);
    setIsRedemptionRound(false);
    setHasUsedRedemption(false);
    setRedemptionSummary(null);
    setPreRedemptionSnapshot(null);
    const existingAttempt = getUserChallengeAttempt(challenge.id, profile?.username || "");
    if (existingAttempt) {
      setLastChallengeResult({
        recorded: false,
        isFirstAttempt: false,
        officialScore: existingAttempt,
      });
    } else {
      setLastChallengeResult(null);
    }

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
    setActiveChallenge(null);
    setLastChallengeResult(null);
    setIsRedemptionRound(false);
    setHasUsedRedemption(false);
    setRedemptionSummary(null);
    setPreRedemptionSnapshot(null);
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
    const correct = finalAnswers.filter((a, i) => a !== null && isAnswerAccepted(questions[i], a)).length;
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);

    // Handle 1-Shot Redemption Round completion (capped score recovery, no leaderboard overwrite)
    if (isRedemptionRound && preRedemptionSnapshot) {
      const redeemedCount = correct;
      const missedTotal = total;
      // Half-credit recovery per redeemed question, strictly capped at max 85% of original total (and at least 1 below full score)
      const maxAllowedScore = Math.min(
        Math.max(1, preRedemptionSnapshot.total - 1),
        Math.floor(preRedemptionSnapshot.total * 0.85)
      );
      const rawAdjusted = Math.floor(preRedemptionSnapshot.correct + redeemedCount * 0.5);
      const adjustedScore = Math.max(
        preRedemptionSnapshot.correct,
        Math.min(maxAllowedScore, rawAdjusted)
      );
      const cappedPct = Math.round((adjustedScore / preRedemptionSnapshot.total) * 100);
      const bonusXp = redeemedCount * 2;

      setRedemptionSummary({
        originalCorrect: preRedemptionSnapshot.correct,
        originalTotal: preRedemptionSnapshot.total,
        redeemedCount,
        missedTotal,
        adjustedScore,
        cappedPct,
        bonusXp,
      });
      setIsRedemptionRound(false);
      setAnswers(finalAnswers);
      setXpEarned(preRedemptionSnapshot.xpEarned + bonusXp);
      if (bonusXp > 0) addXP(bonusXp);
      setPhase("results");
      return;
    }

    // High-Stakes XP Model:
    // Challenges are locked to a single attempt and carry real reputation stakes,
    // so they yield significantly higher XP than casual replayable solo rounds.
    const isChallengeGame = Boolean(activeChallenge || challenger);
    let totalXP = 0;

    if (isChallengeGame) {
      // 12 XP per correct question (2.4x the standard solo rate)
      const baseXP = correct * 12;
      // Conviction Bonus: awarded for taking on a locked, official single-trial challenge
      const convictionBonus = 30;
      // High-Stakes Accuracy Distinction
      const accuracyBonus =
        pct === 100 ? 100 : pct >= 80 ? 60 : pct >= 60 ? 30 : 0;
      // Victor Bounty: extra bonus for beating or matching the opponent/host
      const victorBonus =
        challenger?.score !== undefined && correct >= challenger.score ? 40 : 0;

      totalXP = baseXP + convictionBonus + accuracyBonus + victorBonus;
    } else {
      // Solo / Practice / Random game (unlimited re-attempts)
      const baseXP = correct * 5;
      const accuracyBonus =
        pct === 100 ? 40 : pct >= 80 ? 25 : pct >= 60 ? 10 : 0;
      totalXP = baseXP + accuracyBonus;
    }

    const byCategory = Object.entries(
      questions.reduce<Record<string, { correct: number; total: number }>>((acc, q, i) => {
        if (!acc[q.category]) acc[q.category] = { correct: 0, total: 0 };
        acc[q.category].total++;
        if (finalAnswers[i] !== null && isAnswerAccepted(q, finalAnswers[i] as number)) acc[q.category].correct++;
        return acc;
      }, {})
    ).map(([category, stat]) => ({
      category,
      correct: stat.correct,
      total: stat.total,
    }));

    const remark = getTriviaPerformanceRemark(pct, questions.map((q) => q.id).join(""));
    const gradeLabel = remark.gradeTitle;

    const cleanTriviaPlayerName =
      profile?.username && profile.username !== "Scholar" && profile.username !== "Learner"
        ? profile.username.trim()
        : "Player";

    // 1. Record in local challenge scores if playing a group challenge (locks to 1st attempt)
    let challengeRecordResult: RecordScoreResult | null = null;
    if (activeChallenge) {
      challengeRecordResult = recordLocalChallengeScore(activeChallenge.id, {
        id: `score_${Date.now()}`,
        username: cleanTriviaPlayerName,
        avatar: profile?.avatar || "/avatars/avatar-scholar.svg",
        score: correct,
        total,
        pct,
        gradeLabel,
        completedAt: Date.now(),
        timeSpentSeconds: totalSeconds - timeLeft,
      });
      setLastChallengeResult(challengeRecordResult);
    } else {
      setLastChallengeResult(null);
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

    // 3. Submit score to cloud leaderboard (non-blocking) - only for first attempts if it's a challenge!
    const shouldSubmitChallengeScore = activeChallenge
      ? challengeRecordResult?.isFirstAttempt !== false
      : false;

    fetch("/api/trivia/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: cleanTriviaPlayerName,
        avatar: profile?.avatar || "/avatars/avatar-scholar.svg",
        score: correct,
        total,
        pct,
        gradeLabel,
        xpEarned: totalXP,
        challengeId: shouldSubmitChallengeScore
          ? activeChallenge!.id
          : (challenger?.questionIds?.join(",") || undefined),
        questionIds: questions.map((q) => q.id),
        deviceId: profile?.id,
        durationSeconds: Math.max(5, totalSeconds - timeLeft),
      }),
    }).catch(() => {});

    setAnswers(finalAnswers);
    setXpEarned(totalXP);
    if (totalXP > 0) addXP(totalXP);
    setPhase("results");

    // Trigger NPS / Feedback prompt if eligible (after day 1, with 7-day snooze)
    setTimeout(() => {
      triggerActivityFeedbackIfEligible("trivia");
    }, 1200);
  }

  if (phase === "playing") {
    return (
      <>
        <GameScreen
          questions={questions}
          reviewMode={reviewMode}
          totalSeconds={totalSeconds}
          onComplete={handleComplete}
        />
        <TriviaGuideModal
          isOpen={showGuideModal}
          onClose={handleCloseGuide}
          onSkip={handleCloseGuide}
          isFirstTime={!hasSeenTriviaGuide && (!triviaHistory || triviaHistory.length === 0)}
        />
      </>
    );
  }

  if (phase === "results") {
    return (
      <>
        <ResultsScreen
          questions={questions}
          answers={answers}
          reviewMode={reviewMode}
          xpEarned={xpEarned}
          difficultyMode={currentDifficulty}
          onRetry={() => setPhase("setup")}
          onStartFreshDeck={handleStartFreshDeck}
          onStartRedemption={handleStartRedemption}
          hasUsedRedemption={hasUsedRedemption}
          redemptionSummary={redemptionSummary}
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
          challengeRecordResult={lastChallengeResult}
          onViewChallengeBoard={() => {
            setSetupTab("challenge");
            setPhase("setup");
          }}
        />
        <TriviaGuideModal
          isOpen={showGuideModal}
          onClose={handleCloseGuide}
          onSkip={handleCloseGuide}
          isFirstTime={!hasSeenTriviaGuide && (!triviaHistory || triviaHistory.length === 0)}
        />
      </>
    );
  }

  return (
    <>
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
        onOpenGuide={() => setShowGuideModal(true)}
      />
      <TriviaGuideModal
        isOpen={showGuideModal}
        onClose={handleCloseGuide}
        onSkip={handleCloseGuide}
        isFirstTime={!hasSeenTriviaGuide && (!triviaHistory || triviaHistory.length === 0)}
      />
    </>
  );
}
