"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Swords,
  Trophy,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Sparkles,
  Timer,
  Users,
  ShieldCheck,
  Calendar,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  MATHLETICS_CATEGORIES,
  type MathleticsCategory,
  type MathleticsDifficultyFilter,
} from "@/lib/mathletics-questions";
import {
  saveLocalMathleticsLeague,
  getMathleticsLeagueShareUrl,
  type MathleticsLeague,
} from "@/lib/mathletics-league";
import { copyTextToClipboard } from "@/lib/clipboard";

interface CreateMathleticsLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  preloadedQuestionIds?: string[];
  preloadedDifficulty?: MathleticsDifficultyFilter;
  preloadedCategory?: "all" | MathleticsCategory;
  preloadedTimerSeconds?: number;
  onLeagueCreated?: (league: MathleticsLeague) => void;
}

export default function CreateMathleticsLeagueModal({
  isOpen,
  onClose,
  preloadedQuestionIds,
  preloadedDifficulty,
  preloadedCategory,
  preloadedTimerSeconds,
  onLeagueCreated,
}: CreateMathleticsLeagueModalProps) {
  const router = useRouter();
  const { profile } = useAppStore();

  const isPreloadedSprint = Boolean(preloadedQuestionIds && preloadedQuestionIds.length > 0);

  // Flow State: step 1 (format selection) -> step 2 (configuration) -> step 3 (success)
  const [step, setStep] = useState<1 | 2 | 3>(isPreloadedSprint ? 2 : 1);
  const [selectedFormat, setSelectedFormat] = useState<"sprint_duel" | "marathon">(
    isPreloadedSprint ? "sprint_duel" : "sprint_duel"
  );

  // Form inputs
  const [title, setTitle] = useState("");
  const [durationDays, setDurationDays] = useState<number>(5);
  const [questionTimerSeconds, setQuestionTimerSeconds] = useState<number>(
    preloadedTimerSeconds && preloadedTimerSeconds >= 25 ? preloadedTimerSeconds : 25
  );
  const [difficulty, setDifficulty] = useState<MathleticsDifficultyFilter>(
    preloadedDifficulty || "random"
  );
  const [category, setCategory] = useState<"all" | MathleticsCategory>(
    preloadedCategory || "all"
  );
  const [attemptPolicy, setAttemptPolicy] = useState<"flexible" | "strict" | "host_controlled">(
    "flexible"
  );

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdLeague, setCreatedLeague] = useState<MathleticsLeague | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isPreloadedSprint) {
        setStep(2);
        setSelectedFormat("sprint_duel");
        setTitle(`Sprint Duel · ${profile.username || "Scholar"}`);
      } else {
        setStep(1);
        setSelectedFormat("sprint_duel");
        setTitle("");
      }
      setDifficulty(preloadedDifficulty || "random");
      setCategory(preloadedCategory || "all");
      setQuestionTimerSeconds(
        preloadedTimerSeconds && preloadedTimerSeconds >= 25 ? preloadedTimerSeconds : 25
      );
      setErrorMsg("");
      setCreatedLeague(null);
      setCopiedLink(false);
    }
  }, [isOpen, isPreloadedSprint, preloadedDifficulty, preloadedCategory, preloadedTimerSeconds, profile.username]);

  if (!isOpen) return null;

  async function handleCreateLeague(e: React.FormEvent) {
    e.preventDefault();
    const finalTitle =
      title.trim() ||
      (selectedFormat === "sprint_duel"
        ? `Mathletics Sprint Duel`
        : `Mathletics Marathon (${durationDays} Days)`);

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload: Record<string, any> = {
        title: finalTitle,
        creatorName: profile.username || "Scholar",
        creatorId: profile.id || "anonymous",
        format: selectedFormat,
        durationDays: selectedFormat === "sprint_duel" ? 1 : durationDays,
        difficulty,
        category,
        questionTimerSeconds: Math.max(25, Number(questionTimerSeconds) || 25),
        attemptPolicy: selectedFormat === "sprint_duel" ? "once" : attemptPolicy,
      };

      if (isPreloadedSprint && preloadedQuestionIds && preloadedQuestionIds.length > 0) {
        payload.questionIds = preloadedQuestionIds;
      }

      const res = await fetch("/api/mathletics/league", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.league) {
        throw new Error(data.error || "Failed to create league");
      }

      const league: MathleticsLeague = data.league;
      saveLocalMathleticsLeague(league, true);
      setCreatedLeague(league);
      onLeagueCreated?.(league);
      setStep(3);
    } catch (err: any) {
      console.error("Create league error:", err);
      setErrorMsg(err.message || "Failed to create league. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyShareLink() {
    if (!createdLeague) return;
    const url = getMathleticsLeagueShareUrl(createdLeague);
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  }

  function handleEnterArena() {
    if (!createdLeague) return;
    onClose();
    router.push(`/games/mathletics/league/${createdLeague.code}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl surface rounded-3xl border shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ borderColor: "var(--border-dim)" }}
      >
        {/* Header */}
        <div
          className="p-5 sm:p-6 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center border"
              style={{
                backgroundColor: "rgba(122, 28, 46, 0.08)",
                borderColor: "var(--terra)",
                color: "var(--terra)",
              }}
            >
              {selectedFormat === "sprint_duel" ? (
                <Swords className="w-4 h-4" />
              ) : (
                <Trophy className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="font-space font-bold text-lg" style={{ color: "var(--text)" }}>
                {step === 3
                  ? "League Ready"
                  : selectedFormat === "sprint_duel"
                  ? "Create Sprint Duel"
                  : "Create Marathon Tournament"}
              </h2>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                {step === 1
                  ? "Choose your tournament format"
                  : step === 2
                  ? selectedFormat === "sprint_duel"
                    ? "Instant 10-question sprint against friends"
                    : "Multi-day tournament with daily drops"
                  : "Share the code with your fellow scholars"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Format Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Sprint Duel Card */}
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedFormat("sprint_duel")}
                  className={`p-5 rounded-2xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                    selectedFormat === "sprint_duel"
                      ? "border-[var(--terra)] bg-[var(--surface-hover)] shadow-xs ring-1 ring-[var(--terra)]"
                      : "border-[var(--border-dim)] hover:border-[var(--border)] surface"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center border"
                        style={{
                          backgroundColor: "rgba(122, 28, 46, 0.1)",
                          borderColor: "var(--terra)",
                          color: "var(--terra)",
                        }}
                      >
                        <Swords className="w-5 h-5" />
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "rgba(122, 28, 46, 0.1)",
                          color: "var(--terra)",
                        }}
                      >
                        Fast
                      </span>
                    </div>

                    <h3 className="font-space font-bold text-base mb-1" style={{ color: "var(--text)" }}>
                      Sprint Duel
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                      One round, 10 seeded questions with custom timed sprint (min 25s). Everyone runs the exact same duel.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t text-[11px] font-semibold flex items-center gap-1.5" style={{ borderColor: "var(--border-dim)", color: "var(--olive)" }}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Single attempt · Live head-to-head</span>
                  </div>
                </motion.button>

                {/* Marathon Tournament Card */}
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedFormat("marathon")}
                  className={`p-5 rounded-2xl border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                    selectedFormat === "marathon"
                      ? "border-[var(--olive)] bg-[var(--surface-hover)] shadow-xs ring-1 ring-[var(--olive)]"
                      : "border-[var(--border-dim)] hover:border-[var(--border)] surface"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center border"
                        style={{
                          backgroundColor: "rgba(68, 78, 44, 0.1)",
                          borderColor: "var(--olive)",
                          color: "var(--olive)",
                        }}
                      >
                        <Trophy className="w-5 h-5" />
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "rgba(68, 78, 44, 0.1)",
                          color: "var(--olive)",
                        }}
                      >
                        Tournament
                      </span>
                    </div>

                    <h3 className="font-space font-bold text-base mb-1" style={{ color: "var(--text)" }}>
                      Marathon Tournament
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                      Multi-day tournament (3 to 14 days). Daily 10-question sprint drop with cumulative points and podium rankings.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t text-[11px] font-semibold flex items-center gap-1.5" style={{ borderColor: "var(--border-dim)", color: "var(--gold)" }}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Daily drop · Cumulative leaderboard</span>
                  </div>
                </motion.button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-2xl font-bold text-xs text-white shadow-sm flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  style={{ backgroundColor: "var(--terra)" }}
                >
                  <span>Configure League</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Configuration */}
          {step === 2 && (
            <form onSubmit={handleCreateLeague} className="space-y-5">
              {isPreloadedSprint && (
                <div
                  className="p-3.5 rounded-2xl border flex items-center gap-3 text-xs"
                  style={{
                    backgroundColor: "rgba(122, 28, 46, 0.06)",
                    borderColor: "var(--terra)",
                    color: "var(--text)",
                  }}
                >
                  <Swords className="w-4 h-4 flex-shrink-0" style={{ color: "var(--terra)" }} />
                  <span>
                    Your 10 questions from the round you just completed are pre-seeded into this duel so friends face the identical set!
                  </span>
                </div>
              )}

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-dim)" }}>
                  League Title
                </label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder={
                    selectedFormat === "sprint_duel"
                      ? "e.g. Friday Sprint Duel"
                      : "e.g. 5-Day Calculus Masters"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border text-sm font-sans focus:outline-none surface-input"
                  style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                />
              </div>

              {/* Duration picker for Marathon */}
              {selectedFormat === "marathon" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-dim)" }}>
                    Tournament Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 14].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setDurationDays(days)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                          durationDays === days
                            ? "bg-[var(--olive)] text-white border-[var(--olive)] shadow-xs"
                            : "border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)] surface"
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Duration (Min 25s) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
                    Question Duration
                  </label>
                  <span className="text-[11px]" style={{ color: "var(--olive)" }}>
                    Min 25s per question
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { sec: 25, label: "25s", sub: "Blitz" },
                    { sec: 45, label: "45s", sub: "Standard" },
                    { sec: 60, label: "60s", sub: "Deliberate" },
                    { sec: 90, label: "90s", sub: "Extended" },
                  ].map((d) => (
                    <button
                      key={d.sec}
                      type="button"
                      onClick={() => setQuestionTimerSeconds(d.sec)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                        questionTimerSeconds === d.sec
                          ? "bg-[var(--terra)] text-white border-[var(--terra)] shadow-xs"
                          : "border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)] surface"
                      }`}
                    >
                      <div className="font-bold">{d.label}</div>
                      <div className={`text-[10px] ${questionTimerSeconds === d.sec ? "text-white/80" : "text-[var(--text-dim)]"}`}>
                        {d.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-dim)" }}>
                  Difficulty Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["random", "easy", "medium", "hard"] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      disabled={isPreloadedSprint}
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center capitalize cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                        difficulty === diff
                          ? "bg-[var(--terra)] text-white border-[var(--terra)] shadow-xs"
                          : "border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)] surface"
                      }`}
                    >
                      {diff === "random" ? "Mixed" : diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Focus */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-dim)" }}>
                  Mathematical Pillar
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={isPreloadedSprint}
                    onClick={() => setCategory("all")}
                    className={`py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                      category === "all"
                        ? "bg-[var(--olive)] text-white border-[var(--olive)]"
                        : "border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)] surface"
                    }`}
                  >
                    All 5 Pillars
                  </button>
                  {MATHLETICS_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      disabled={isPreloadedSprint}
                      onClick={() => setCategory(cat)}
                      className={`py-1.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${
                        category === cat
                          ? "bg-[var(--olive)] text-white border-[var(--olive)]"
                          : "border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)] surface"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attempt Policy for Marathon */}
              {selectedFormat === "marathon" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-dim)" }}>
                    Tournament Schedule
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      {
                        id: "flexible" as const,
                        title: "Open Pace",
                        desc: "Scholars play any day at their own speed.",
                      },
                      {
                        id: "strict" as const,
                        title: "Daily Drop",
                        desc: "1 sprint unlocks each calendar day.",
                      },
                      {
                        id: "host_controlled" as const,
                        title: "Host Paced",
                        desc: "You manually unlock each subsequent round.",
                      },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setAttemptPolicy(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          attemptPolicy === p.id
                            ? "border-[var(--olive)] bg-[var(--surface-hover)] shadow-xs"
                            : "border-[var(--border-dim)] hover:border-[var(--border)] surface"
                        }`}
                      >
                        <div className="font-bold mb-0.5" style={{ color: "var(--text)" }}>
                          {p.title}
                        </div>
                        <div className="text-[11px] leading-tight" style={{ color: "var(--text-dim)" }}>
                          {p.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {errorMsg && (
                <p className="text-xs font-medium" style={{ color: "var(--red)" }}>
                  {errorMsg}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                {!isPreloadedSprint ? (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl font-bold text-xs text-white shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: "var(--terra)" }}
                >
                  {isSubmitting ? (
                    <span>Creating League...</span>
                  ) : (
                    <>
                      <span>
                        {selectedFormat === "sprint_duel"
                          ? "Create Sprint Duel"
                          : "Create Marathon"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Created Success */}
          {step === 3 && createdLeague && (
            <div className="text-center py-4 space-y-6">
              <div
                className="w-14 h-14 rounded-full mx-auto flex items-center justify-center border shadow-xs"
                style={{
                  backgroundColor: "rgba(68, 78, 44, 0.12)",
                  borderColor: "var(--olive)",
                  color: "var(--olive)",
                }}
              >
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-space font-bold text-xl mb-1" style={{ color: "var(--text)" }}>
                  {createdLeague.title}
                </h3>
                <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                  {createdLeague.format === "sprint_duel"
                    ? "Sprint Duel is live. Share the link with friends to duel."
                    : `${createdLeague.durationDays}-Day Marathon is live. Ready for Day 1.`}
                </p>
              </div>

              {/* Code Banner */}
              <div
                className="p-4 rounded-2xl border surface max-w-xs mx-auto"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <div className="text-[10px] uppercase tracking-widest font-mono font-bold text-[var(--text-dim)] mb-1">
                  League Code
                </div>
                <div
                  className="font-mono text-3xl font-extrabold tracking-widest"
                  style={{ color: "var(--terra)" }}
                >
                  {createdLeague.code}
                </div>
              </div>

              {/* Sharing buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all surface hover:border-[var(--text-dim)]"
                  style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Copy Challenge Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleEnterArena}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  style={{ backgroundColor: "var(--terra)" }}
                >
                  <span>Enter Arena</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
