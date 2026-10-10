"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  PhoneCall,
  Users,
  ShieldAlert,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Headphones,
  Smartphone,
  Globe,
  Flame,
  Dice5,
  Brain,
  Star,
  EyeOff,
} from "lucide-react";
import { CATEGORY_ICONS, GAME_CATEGORIES } from "@/lib/game-words";

export type ArticulateGuideMode = "local" | "online";

interface ArticulateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip?: () => void;
  isFirstTime?: boolean;
  initialMode?: ArticulateGuideMode;
}

const LOCAL_STEPS = [
  {
    id: "local-device",
    title: "One Phone for the Whole Room",
    shortTitle: "1 Single Phone",
    badge: "IN-PERSON SETUP",
    icon: Smartphone,
    color: "var(--olive)",
  },
  {
    id: "local-handoff",
    title: "Screen Privacy & Physical Handoff",
    shortTitle: "No Peeking!",
    badge: "HANDOFF MECHANIC",
    icon: EyeOff,
    color: "var(--terra)",
  },
  {
    id: "local-rules",
    title: "Forbidden Words & Opponent Fouls",
    shortTitle: "Rules & Fouls",
    badge: "FAIR PLAY RULES",
    icon: ShieldAlert,
    color: "#B53A3A",
  },
  {
    id: "local-board",
    title: "The Board Map & Special Spaces",
    shortTitle: "Board & Victory",
    badge: "RACE TO FINISH",
    icon: Trophy,
    color: "var(--gold)",
  },
];

const ONLINE_STEPS = [
  {
    id: "online-voice",
    title: "Hop on an Audio Call First",
    shortTitle: "Voice Call",
    badge: "MANDATORY FOR ONLINE PLAY",
    icon: PhoneCall,
    color: "var(--terra)",
  },
  {
    id: "online-roles",
    title: "Teams & Multi-Device Sync",
    shortTitle: "Teams & Roles",
    badge: "HOW A ROUND WORKS",
    icon: Users,
    color: "var(--olive)",
  },
  {
    id: "online-rules",
    title: "Forbidden Words & The Buzzer",
    shortTitle: "Forbidden Rules",
    badge: "FAIR PLAY & PENALTIES",
    icon: ShieldAlert,
    color: "#B53A3A",
  },
  {
    id: "online-categories",
    title: "Word Categories & Victory",
    shortTitle: "Winning & Deck",
    badge: "THE FINISH LINE",
    icon: Trophy,
    color: "var(--gold)",
  },
];

export default function ArticulateGuideModal({
  isOpen,
  onClose,
  onSkip,
  isFirstTime = false,
  initialMode = "local",
}: ArticulateGuideModalProps) {
  const [guideMode, setGuideMode] = useState<ArticulateGuideMode>(initialMode);
  const [currentStep, setCurrentStep] = useState(0);

  // Sync mode and reset to step 0 when reopened
  useEffect(() => {
    if (isOpen) {
      setGuideMode(initialMode);
      setCurrentStep(0);
    }
  }, [isOpen, initialMode]);

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

  const steps = guideMode === "local" ? LOCAL_STEPS : ONLINE_STEPS;
  const step = steps[currentStep] || steps[0];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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
      aria-labelledby="articulate-guide-title"
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
            <div className="w-10 h-10 rounded-2xl bg-[var(--terra)]/15 border border-[var(--terra)]/25 flex items-center justify-center text-xl shrink-0 shadow-xs">
              🎭
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-space font-extrabold uppercase tracking-wider text-[var(--terra)]">
                  Fey Articulate
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-dim)] font-bold text-[var(--text-mute)]">
                  How to Play
                </span>
              </div>
              <h2
                id="articulate-guide-title"
                className="font-space font-extrabold text-lg sm:text-xl leading-tight"
                style={{ color: "var(--text)" }}
              >
                {guideMode === "local" ? "Pass-the-Phone Guide" : "Online Room Guide"}
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

        {/* Mode Switcher Tabs: Pass-the-Phone vs Online Room */}
        <div className="p-2 sm:px-6 pt-3 pb-1 border-b" style={{ borderColor: "var(--border-dim)", background: "var(--bg-base)" }}>
          <div className="flex p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] shadow-xs">
            <button
              type="button"
              onClick={() => {
                setGuideMode("local");
                setCurrentStep(0);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-space font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                guideMode === "local"
                  ? "bg-[var(--olive)] text-white shadow-xs"
                  : "text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              <Smartphone size={14} />
              <span>Pass-the-Phone (Local)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setGuideMode("online");
                setCurrentStep(0);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-space font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                guideMode === "online"
                  ? "bg-[var(--terra)] text-white shadow-xs"
                  : "text-[var(--text-dim)] hover:text-[var(--text)]"
              }`}
            >
              <Globe size={14} />
              <span>Online Room (Friends)</span>
            </button>
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div
          className="grid grid-cols-4 gap-1 p-2 sm:px-6 sm:py-2.5 border-b text-center text-xs"
          style={{ borderColor: "var(--border-dim)", background: "var(--bg-base)" }}
        >
          {steps.map((s, idx) => {
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
                    backgroundColor: isActive ? (guideMode === "local" ? "var(--olive)" : "var(--terra)") : "transparent",
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
        <div className="p-5 sm:p-7 min-h-[360px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${guideMode}-${step.id}`}
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
                    backgroundColor: guideMode === "local" ? "rgba(68,78,44,0.08)" : "var(--terra-bg)",
                    color: step.color,
                    border: `1px solid ${step.color}30`,
                  }}
                >
                  {step.badge}
                </span>
                <span className="text-xs font-semibold text-[var(--text-mute)]">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>

              <h3 className="font-space font-extrabold text-xl sm:text-2xl" style={{ color: "var(--text)" }}>
                {step.title}
              </h3>

              {/* ========================================================= */}
              {/* PASS-THE-PHONE (LOCAL) CONTENT */}
              {/* ========================================================= */}
              {guideMode === "local" && (
                <>
                  {/* LOCAL STEP 1: SINGLE DEVICE SETUP */}
                  {currentStep === 0 && (
                    <div className="space-y-3.5">
                      <div
                        className="p-4 rounded-2xl border-2 flex items-start gap-3.5"
                        style={{
                          borderColor: "var(--olive)",
                          backgroundColor: "rgba(68,78,44,0.06)",
                        }}
                      >
                        <div className="p-2.5 rounded-xl bg-[var(--olive)] text-white shrink-0 mt-0.5 shadow-xs">
                          <Smartphone className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-space font-extrabold text-sm text-[var(--olive)]">
                            Only 1 Device Needed For The Entire Group!
                          </h4>
                          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                            Pass-the-Phone is designed for friends and family gathered in the <strong>same room</strong>.
                            Everyone shares this single phone or laptop — nobody else needs an app, wifi connection, or separate phone!
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        <div className="surface rounded-2xl p-3.5 border space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2 text-xs font-space font-bold text-[var(--text)]">
                            <Users size={14} className="text-[var(--olive)]" />
                            <span>1. Build Rosters</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] leading-normal">
                            Enter player names into <strong>Team Alpha</strong> and <strong>Team Omega</strong>. Tap 🎲 <strong>Shuffle</strong> to balance teams evenly.
                          </p>
                        </div>

                        <div className="surface rounded-2xl p-3.5 border space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2 text-xs font-space font-bold text-[var(--text)]">
                            <Sparkles size={14} className="text-[var(--terra)]" />
                            <span>2. Sprint Timer</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] leading-normal">
                            Choose <strong>30s, 45s, or 60s</strong> speaking sprints. Shorter timers create frantic party energy!
                          </p>
                        </div>

                        <div className="surface rounded-2xl p-3.5 border space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2 text-xs font-space font-bold text-[var(--text)]">
                            <Trophy size={14} className="text-[var(--gold)]" />
                            <span>3. Winning Target</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] leading-normal">
                            Set your goal: <strong>30 pts</strong> (Quick), <strong>50 pts</strong> (Standard), or <strong>100 pts</strong> (Marathon).
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LOCAL STEP 2: HANDOFF & SCREEN PRIVACY */}
                  {currentStep === 1 && (
                    <div className="space-y-3.5">
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                        How do words stay secret on one screen? Through Fey&apos;s automatic <strong>Handoff Screen</strong> between turns:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="rounded-2xl p-4 border space-y-2 surface" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-[var(--terra)] text-white flex items-center justify-center font-space font-bold text-xs">
                              🙈
                            </span>
                            <div>
                              <h4 className="font-space font-bold text-sm text-[var(--text)]">1. "Pass The Phone"</h4>
                              <span className="text-[10px] text-[var(--text-mute)]">Everyone looks away</span>
                            </div>
                          </div>
                          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                            Fey clearly announces: <em>&ldquo;Hand the phone to Kana. Everyone else, look away!&rdquo;</em> Only the active speaker holds the device.
                          </p>
                        </div>

                        <div className="rounded-2xl p-4 border space-y-2 surface" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-[var(--olive)] text-white flex items-center justify-center font-space font-bold text-xs">
                              🚀
                            </span>
                            <div>
                              <h4 className="font-space font-bold text-sm text-[var(--text)]">2. 3-Second Ready Ring</h4>
                              <span className="text-[10px] text-[var(--text-mute)]">Tap 'I Have The Phone'</span>
                            </div>
                          </div>
                          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                            Once the speaker has the phone, they tap to start. A loud <strong>3... 2... 1...</strong> countdown plays so teammates know to get ready to shout!
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border surface flex items-center gap-3 text-xs" style={{ borderColor: "var(--border-dim)" }}>
                        <span className="text-xl">🔄</span>
                        <p style={{ color: "var(--text-dim)" }}>
                          <strong>Fair Alternating Order:</strong> Fey automatically rotates speakers back and forth between Team Alpha and Team Omega so every player gets an equal turn to describe and guess.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* LOCAL STEP 3: FORBIDDEN RULES & FOULS */}
                  {currentStep === 2 && (
                    <div className="space-y-3.5">
                      <div
                        className="p-3.5 rounded-2xl border bg-red-500/5 space-y-2"
                        style={{ borderColor: "rgba(181, 58, 58, 0.25)" }}
                      >
                        <div className="flex items-center gap-2 text-xs font-space font-bold text-red-600 dark:text-red-400">
                          <AlertTriangle size={15} />
                          <span>Strict Rules for the Speaker: You CANNOT:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" style={{ color: "var(--text)" }}>
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <span><strong>Say the word</strong> or any part of it (e.g. &apos;snow&apos; for &apos;snowman&apos;)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <span><strong>Say &quot;rhymes with&quot;</strong> or &quot;sounds like&quot; (e.g. &apos;rhymes with boat&apos;)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <span><strong>Spell letters out</strong> or give the starting letter (&apos;starts with B&apos;)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <span><strong>Use direct translations</strong> in other languages</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        <div className="surface rounded-2xl p-3.5 border space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2 text-xs font-space font-bold text-emerald-600 dark:text-emerald-400">
                            <span>✅</span>
                            <span>Correct (+1 pt)</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                            Tap <strong>Correct</strong> (or tap Spacebar) the instant your teammates shout the right answer.
                          </p>
                        </div>

                        <div className="surface rounded-2xl p-3.5 border space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2 text-xs font-space font-bold text-[var(--gold)]">
                            <span>⏩</span>
                            <span>Pass / Skip</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                            Word too difficult? Tap <strong>Pass</strong> (or Enter / Right Arrow) to draw the next card immediately.
                          </p>
                        </div>

                        <div className="surface rounded-2xl p-3.5 border space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2 text-xs font-space font-bold text-red-600 dark:text-red-400">
                            <span>🚨</span>
                            <span>Opponent Foul!</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                            Opponents sit close listening! If the speaker breaks a rule, opponents shout foul or tap <strong>🚨 Opponent Foul</strong> to skip the card!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LOCAL STEP 4: BOARD MAP & SPECIAL TILES */}
                  {currentStep === 3 && (
                    <div className="space-y-3.5">
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                        Every correct word moves your team token forward along the Journey Map. Land on special tiles for high-stakes twists:
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="rounded-2xl p-3 border surface space-y-1" style={{ borderColor: "rgba(166,124,30,0.3)" }}>
                          <div className="flex items-center gap-1.5 text-xs font-space font-bold text-[var(--terra)]">
                            <Flame size={14} />
                            <span>Double Move</span>
                          </div>
                          <p className="text-[10px] text-[var(--text-dim)] leading-tight">
                            Next turn points count <strong>DOUBLE</strong> on the board!
                          </p>
                        </div>

                        <div className="rounded-2xl p-3 border surface space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-1.5 text-xs font-space font-bold text-[var(--olive)]">
                            <Dice5 size={14} />
                            <span>Chance Space</span>
                          </div>
                          <p className="text-[10px] text-[var(--text-dim)] leading-tight">
                            Spin the virtual modifier wheel for sudden advantages!
                          </p>
                        </div>

                        <div className="rounded-2xl p-3 border surface space-y-1" style={{ borderColor: "rgba(236,72,153,0.3)" }}>
                          <div className="flex items-center gap-1.5 text-xs font-space font-bold text-pink-600 dark:text-pink-400">
                            <Brain size={14} />
                            <span>Challenge Tile</span>
                          </div>
                          <p className="text-[10px] text-[var(--text-dim)] leading-tight">
                            Speaking restriction (e.g. <em>No nouns allowed</em>, <em>One-word clues only</em>).
                          </p>
                        </div>

                        <div className="rounded-2xl p-3 border surface space-y-1" style={{ borderColor: "rgba(166,124,30,0.3)" }}>
                          <div className="flex items-center gap-1.5 text-xs font-space font-bold text-[var(--gold)]">
                            <Star size={14} />
                            <span>Bonus Space</span>
                          </div>
                          <p className="text-[10px] text-[var(--text-dim)] leading-tight">
                            Instantly get <strong>+1 extra tile</strong> advantage!
                          </p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl border surface space-y-1 text-xs" style={{ borderColor: "var(--border-dim)" }}>
                        <div className="font-space font-bold text-[var(--text)] flex items-center gap-2">
                          <span>⏸️</span>
                          <span>Need a Drink or Food Break?</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                          Tap <strong>&ldquo;Pause &amp; Save&rdquo;</strong> in the board header anytime. Your match state, scores, and round position are safely saved so you can resume whenever you&apos;re ready!
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ========================================================= */}
              {/* ONLINE ROOM (FRIENDS) CONTENT */}
              {/* ========================================================= */}
              {guideMode === "online" && (
                <>
                  {/* ONLINE STEP 1: VOICE CALL */}
                  {currentStep === 0 && (
                    <div className="space-y-3.5">
                      <div
                        className="p-4 rounded-2xl border-2 flex items-start gap-3.5"
                        style={{
                          borderColor: "var(--terra)",
                          backgroundColor: "var(--terra-bg)",
                        }}
                      >
                        <div className="p-2.5 rounded-xl bg-[var(--terra)] text-white shrink-0 mt-0.5 shadow-xs">
                          <Headphones className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-space font-extrabold text-sm text-[var(--terra)]">
                            Crucial: Hop on an Audio Call With Your Friends!
                          </h4>
                          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                            Fey Articulate synchronizes game cards, timers, scores, and buzzers on your screen in real time.
                            <strong> But players must hear each other speak and guess!</strong> You need to be in a voice call while playing online.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        <div className="surface rounded-2xl p-3.5 border space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2 text-xs font-space font-bold text-[var(--text)]">
                            <PhoneCall size={14} className="text-[var(--terra)]" />
                            <span>1. Group Audio Call</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] leading-normal">
                            Open a group voice call on <strong>WhatsApp, Discord, Google Meet, Zoom, FaceTime,</strong> or Telegram.
                          </p>
                        </div>

                        <div className="surface rounded-2xl p-3.5 border space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2 text-xs font-space font-bold text-[var(--olive)]" style={{ color: "var(--olive)" }}>
                            <Volume2 size={14} className="text-[var(--olive)]" />
                            <span>2. Headphones On</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] leading-normal">
                            Wear earphones so game buzzer sounds don&apos;t feedback or echo into your squad&apos;s microphones.
                          </p>
                        </div>

                        <div className="surface rounded-2xl p-3.5 border space-y-1" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2 text-xs font-space font-bold text-[var(--gold)]">
                            <Smartphone size={14} className="text-[var(--gold)]" />
                            <span>3. Playing In Person?</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] leading-normal">
                            Sitting together in the same room? Switch to <strong>Pass-the-Phone</strong> mode! No voice call needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ONLINE STEP 2: TEAMS & ROLES */}
                  {currentStep === 1 && (
                    <div className="space-y-3.5">
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                        Players join on their own phones or computers and divide into two squads: <strong className="text-[var(--terra)]">Team A</strong> and <strong className="text-[var(--olive)]">Team B</strong>.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="rounded-2xl p-4 border space-y-2 surface" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-[var(--terra)] text-white flex items-center justify-center font-space font-bold text-xs">
                              🗣️
                            </span>
                            <div>
                              <h4 className="font-space font-bold text-sm text-[var(--text)]">The Speaker Screen</h4>
                              <span className="text-[10px] text-[var(--text-mute)]">Only speaker sees cards</span>
                            </div>
                          </div>
                          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                            When it&apos;s your turn, secret words appear on your screen. You describe each word over the audio call as fast as you can!
                          </p>
                        </div>

                        <div className="rounded-2xl p-4 border space-y-2 surface" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-[var(--olive)] text-white flex items-center justify-center font-space font-bold text-xs">
                              👂
                            </span>
                            <div>
                              <h4 className="font-space font-bold text-sm text-[var(--text)]">The Guesser Screen</h4>
                              <span className="text-[10px] text-[var(--text-mute)]">Secret words are masked</span>
                            </div>
                          </div>
                          <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                            Teammates see a countdown timer without the secret words so no one can accidentally cheat. Listen and shout guesses over the call!
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border surface flex items-center gap-3 text-xs" style={{ borderColor: "var(--border-dim)" }}>
                        <span className="text-xl">🔄</span>
                        <p style={{ color: "var(--text-dim)" }}>
                          <strong>Live Synchronized Buzzer:</strong> Opponents see an Auditor View with a live <strong>🚨 Opponent Foul Buzzer</strong> button to buzz rule breaches in real time!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ONLINE STEP 3: FORBIDDEN RULES & BUZZER */}
                  {currentStep === 2 && (
                    <div className="space-y-3.5">
                      <div
                        className="p-3.5 rounded-2xl border bg-red-500/5 space-y-2"
                        style={{ borderColor: "rgba(181, 58, 58, 0.25)" }}
                      >
                        <div className="flex items-center gap-2 text-xs font-space font-bold text-red-600 dark:text-red-400">
                          <AlertTriangle size={15} />
                          <span>Strict Rules for the Speaker: You CANNOT:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" style={{ color: "var(--text)" }}>
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <span><strong>Say the word</strong> or any compound of it (e.g. &apos;snow&apos; for &apos;snowman&apos;)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <span><strong>Say &quot;rhymes with&quot;</strong> or &quot;sounds like&quot; (e.g. &apos;rhymes with boat&apos;)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <span><strong>Spell letters out</strong> or give the starting letter (&apos;starts with B&apos;)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <span><strong>Use direct translations</strong> in other languages</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="surface rounded-2xl p-3.5 border space-y-1.5" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2 text-xs font-space font-bold text-[var(--terra)]">
                            <span>🚨</span>
                            <span>Opponents Sound The Buzzer</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                            The opposing team monitors the speaker! If a rule is breached, opponents slam the <strong>Buzzer</strong> to dispute the point.
                          </p>
                        </div>

                        <div className="surface rounded-2xl p-3.5 border space-y-1.5" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center gap-2 text-xs font-space font-bold text-[var(--olive)]">
                            <span>⏩</span>
                            <span>Passing (Skipping) Cards</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                            If a word is genuinely too tough, hit <strong>Pass/Skip</strong> to get a fresh card. Pass sparingly so you don&apos;t burn valuable seconds!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ONLINE STEP 4: CATEGORIES & VICTORY */}
                  {currentStep === 3 && (
                    <div className="space-y-3.5">
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                        Fey Articulate features thousands of curated words across 6 distinct categories. First team to reach the score goal wins!
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        {GAME_CATEGORIES.map((cat) => (
                          <div
                            key={cat}
                            className="rounded-xl p-2.5 border surface flex items-center gap-2 text-xs"
                            style={{ borderColor: "var(--border-dim)" }}
                          >
                            <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                            <div>
                              <div className="font-space font-bold" style={{ color: "var(--text)" }}>
                                {cat}
                              </div>
                              <div className="text-[9px] font-semibold text-[var(--text-mute)]">
                                {cat === "Object"
                                  ? "Things & tools"
                                  : cat === "Nature"
                                  ? "Animals & flora"
                                  : cat === "Person"
                                  ? "Icons & roles"
                                  : cat === "Action"
                                  ? "Verbs & sports"
                                  : cat === "World"
                                  ? "Places & sights"
                                  : "Concepts & idioms"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div
                        className="p-3.5 rounded-2xl border bg-[var(--gold-bg)] flex items-center gap-3 text-xs"
                        style={{ borderColor: "rgba(166, 124, 30, 0.3)" }}
                      >
                        <div className="w-9 h-9 rounded-xl bg-[var(--gold)] text-white flex items-center justify-center text-base shrink-0 shadow-xs">
                          🏆
                        </div>
                        <div>
                          <h5 className="font-space font-bold text-[var(--gold)]">Winning Glory &amp; MVP Lore</h5>
                          <p className="text-[11px] text-[var(--text-dim)]">
                            After the final round, see the match breakdown: top describers, lightning-fast streaks, and words passed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom Navigation & Controls */}
          <div
            className="pt-5 mt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <div className="flex items-center gap-1.5 order-2 sm:order-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Jump to slide ${i + 1}`}
                  onClick={() => setCurrentStep(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentStep === i
                      ? `w-6 ${guideMode === "local" ? "bg-[var(--olive)]" : "bg-[var(--terra)]"}`
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

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className={`px-5 py-2.5 rounded-xl text-white font-space font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-95 ${
                    guideMode === "local" ? "bg-[var(--olive)]" : "bg-[var(--terra)]"
                  }`}
                >
                  Next Step <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-6 py-2.5 rounded-xl text-white font-space font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:opacity-95 ${
                    guideMode === "local" ? "bg-[var(--olive)]" : "bg-[var(--terra)]"
                  }`}
                >
                  <Sparkles size={14} /> Got It, Let&apos;s Play!
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
