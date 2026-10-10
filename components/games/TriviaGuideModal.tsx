"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Clock,
  Swords,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Zap,
  Target,
  Share2,
  Flame,
} from "lucide-react";

interface TriviaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip?: () => void;
  isFirstTime?: boolean;
}

const STEPS = [
  {
    id: "questions",
    title: "1,000+ Curated Questions",
    shortTitle: "Categories",
    badge: "INTELLECTUAL PILLARS",
    icon: BookOpen,
    color: "var(--olive)",
  },
  {
    id: "sprints",
    title: "Sprint Modes & Review Cadence",
    shortTitle: "Pace & Modes",
    badge: "CHOOSE YOUR FORMAT",
    icon: Clock,
    color: "var(--terra)",
  },
  {
    id: "challenges",
    title: "Squad Challenges & Leaderboards",
    shortTitle: "Challenges & Ranks",
    badge: "BRAGGING RIGHTS",
    icon: Swords,
    color: "var(--gold)",
  },
];

export default function TriviaGuideModal({
  isOpen,
  onClose,
  onSkip,
  isFirstTime = false,
}: TriviaGuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset to step 0 when reopened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const step = STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trivia-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Backdrop click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-2xl rounded-3xl surface-raised shadow-2xl border overflow-hidden my-auto"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          className="px-5 py-4 sm:px-7 sm:py-5 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border-dim)", background: "var(--bg-panel)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--olive)]/15 border border-[var(--olive)]/25 flex items-center justify-center text-xl shrink-0 shadow-xs">
              🇳🇬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-space font-extrabold uppercase tracking-wider text-[var(--olive-text)]">
                  Naija Trivia Arcade
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-dim)] font-bold text-[var(--text-mute)]">
                  How to Play
                </span>
              </div>
              <h2
                id="trivia-guide-title"
                className="font-space font-extrabold text-lg sm:text-xl leading-tight"
                style={{ color: "var(--text)" }}
              >
                Trivia Rules &amp; Arcade Guide
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFirstTime && (
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-space font-bold px-3 py-1.5 rounded-xl border border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
              >
                Skip Guide
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close guide"
              className="p-2 rounded-xl text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div
          className="grid grid-cols-3 gap-1 p-2 sm:px-6 sm:py-2.5 border-b text-center text-xs"
          style={{ borderColor: "var(--border-dim)", background: "var(--bg-base)" }}
        >
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStep === idx;
            const isCompleted = currentStep > idx;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`py-2 px-1 sm:px-2 rounded-xl font-space font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-[var(--bg-card)] text-[var(--text)] shadow-xs border border-[var(--border-dim)]"
                    : isCompleted
                    ? "text-[var(--olive)] hover:bg-[var(--bg-card)]/50"
                    : "text-[var(--text-mute)] hover:text-[var(--text)]"
                }`}
              >
                <div
                  className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 text-xs"
                  style={{
                    backgroundColor: isActive ? s.color : "transparent",
                    color: isActive ? "#FFFFFF" : "currentColor",
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={13} className="text-[var(--olive)]" />
                  ) : (
                    <Icon size={12} />
                  )}
                </div>
                <span className="text-[10px] sm:text-xs truncate">
                  {s.shortTitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Step Content Body */}
        <div className="p-5 sm:p-7 min-h-[350px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Step Subtitle & Badge */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[10px] font-space font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--olive-dim)",
                    color: step.color,
                    border: `1px solid ${step.color}30`,
                  }}
                >
                  {step.badge}
                </span>
                <span className="text-xs font-semibold text-[var(--text-mute)]">
                  Step {currentStep + 1} of {STEPS.length}
                </span>
              </div>

              <h3 className="font-space font-extrabold text-xl sm:text-2xl" style={{ color: "var(--text)" }}>
                {step.title}
              </h3>

              {/* STEP 1: QUESTION BANK & TOPICS */}
              {currentStep === 0 && (
                <div className="space-y-3.5">
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                    Naija Trivia is an intellectual arcade designed to challenge your cultural depth across 3 core pillars of Nigerian knowledge:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="surface rounded-2xl p-3.5 border space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                      <div className="flex items-center gap-1.5 text-xs font-space font-bold text-[var(--terra)]">
                        <span>🏛️</span>
                        <span>Nigerian History</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-dim)] leading-normal">
                        Pre-colonial kingdoms, independence heroes, key treaties, and constitutional milestones.
                      </p>
                    </div>

                    <div className="surface rounded-2xl p-3.5 border space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                      <div className="flex items-center gap-1.5 text-xs font-space font-bold text-[#7B3FC8]">
                        <span>🎶</span>
                        <span>Pop Culture</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-dim)] leading-normal">
                        Afrobeats legends, Nollywood cinema classics, sports heroes, and viral cultural phenomenons.
                      </p>
                    </div>

                    <div className="surface rounded-2xl p-3.5 border space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                      <div className="flex items-center gap-1.5 text-xs font-space font-bold text-[var(--olive)]">
                        <span>🌍</span>
                        <span>General Knowledge</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-dim)] leading-normal">
                        Geography, state lore, national symbols, natural landmarks, and economy.
                      </p>
                    </div>
                  </div>

                  <div
                    className="p-3.5 rounded-2xl border surface flex items-center justify-between gap-3 text-xs"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <div>
                      <span className="font-space font-bold text-[var(--text)] block">
                        4 Tailored Difficulty Levels
                      </span>
                      <span className="text-[11px] text-[var(--text-dim)]">
                        Choose between <strong>Random (Mixed)</strong>, <strong>Easy (Cultural Basics)</strong>, <strong>Medium</strong>, or <strong>Hard (Scholar Lore)</strong>.
                      </span>
                    </div>
                    <span className="text-2xl shrink-0">🎯</span>
                  </div>
                </div>
              )}

              {/* STEP 2: SPRINTS & REVIEW CADENCE */}
              {currentStep === 1 && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div
                      className="rounded-2xl p-4 border space-y-2 surface"
                      style={{ borderColor: "var(--border-dim)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-[var(--terra-bg)] text-[var(--terra)] font-bold text-xs">
                          ⚡
                        </span>
                        <div>
                          <h4 className="font-space font-bold text-sm text-[var(--text)]">Sprint Durations</h4>
                          <span className="text-[10px] text-[var(--text-mute)]">Pick your pace</span>
                        </div>
                      </div>
                      <ul className="text-xs text-[var(--text-dim)] space-y-1.5 pt-1">
                        <li>• <strong>Quick Sprint (5 min):</strong> 10 questions for a brisk break.</li>
                        <li>• <strong>Standard (10 min):</strong> 15 questions for a balanced run.</li>
                        <li>• <strong>Marathon (15 min):</strong> 25 questions for serious loremasters.</li>
                      </ul>
                    </div>

                    <div
                      className="rounded-2xl p-4 border space-y-2 surface"
                      style={{ borderColor: "var(--border-dim)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-[var(--olive-dim)] text-[var(--olive)] font-bold text-xs">
                          📖
                        </span>
                        <div>
                          <h4 className="font-space font-bold text-sm text-[var(--text)]">Review Cadence</h4>
                          <span className="text-[10px] text-[var(--text-mute)]">Learn vs. Test</span>
                        </div>
                      </div>
                      <ul className="text-xs text-[var(--text-dim)] space-y-1.5 pt-1">
                        <li>• <strong>Instant Feedback:</strong> Unveils detailed historical explanation immediately after each pick.</li>
                        <li>• <strong>Suspense Mode:</strong> Rapid non-stop answering; review full breakdown on the scorecard.</li>
                      </ul>
                    </div>
                  </div>

                  <div
                    className="p-3 rounded-xl border surface flex items-center gap-3 text-xs"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <span className="text-xl">⏱️</span>
                    <p style={{ color: "var(--text-dim)" }}>
                      <strong>Beat The Clock:</strong> Each question is timed. Fast, accurate streaks award bonus XP to boost your scholar standing!
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: CHALLENGES & RANKS */}
              {currentStep === 2 && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="surface rounded-2xl p-3.5 border space-y-1.5" style={{ borderColor: "var(--border-dim)" }}>
                      <div className="flex items-center gap-2 text-xs font-space font-bold text-[var(--terra)]">
                        <Swords size={14} />
                        <span>Squad Challenges</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                        Convene a custom challenge or share your completed round link on WhatsApp. Friends answer the exact same deck to see who tops your board.
                      </p>
                    </div>

                    <div className="surface rounded-2xl p-3.5 border space-y-1.5" style={{ borderColor: "var(--border-dim)" }}>
                      <div className="flex items-center gap-2 text-xs font-space font-bold text-[var(--gold)]">
                        <Trophy size={14} />
                        <span>Broadside Proof Cards</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                        Export aesthetic 1200x630 proof cards with 1-click clipboard copy to share on Twitter/X, Instagram Stories, and group chats.
                      </p>
                    </div>
                  </div>

                  <div
                    className="p-3.5 rounded-2xl border bg-[var(--gold-bg)] flex items-center gap-3 text-xs"
                    style={{ borderColor: "rgba(166, 124, 30, 0.3)" }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[var(--gold)] text-white flex items-center justify-center text-base shrink-0 shadow-xs">
                      🇳🇬
                    </div>
                    <div>
                      <h5 className="font-space font-bold text-[var(--gold)]">Climb the Scholar Leaderboard</h5>
                      <p className="text-[11px] text-[var(--text-dim)]">
                        Compete against historic Nigerian intellects and real-time players to earn ranks from <em>&quot;Sharp Sharp&quot;</em> to <em>&quot;Naija Expert&quot;</em>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Navigation & Controls */}
          <div
            className="pt-5 mt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <div className="flex items-center gap-1.5 order-2 sm:order-1">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Jump to slide ${i + 1}`}
                  onClick={() => setCurrentStep(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentStep === i
                      ? "w-6 bg-[var(--olive)]"
                      : "w-2 bg-[var(--border-dim)] hover:bg-[var(--text-mute)]"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2.5 rounded-xl border font-space font-bold text-xs flex items-center gap-1 hover:bg-[var(--bg-panel)] transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                >
                  <ChevronLeft size={15} /> Back
                </button>
              )}

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl btn-terra font-space font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-95"
                >
                  Next Step <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl btn-terra font-space font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:opacity-95"
                >
                  <Sparkles size={14} /> Got It, Start Sprint!
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
