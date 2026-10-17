"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Swords,
  Sparkles,
  X,
  ArrowRight,
  Flame,
  Zap,
  Clock,
  Users,
  Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NewGameActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLeague: () => void;
  onCreateChallenge: () => void;
  onCreateSolo: () => void;
}

function PersonLaptopIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="5" r="2.5" />
      <path d="M6 17a6 6 0 0 1 12 0" />
      <rect x="7.5" y="12.5" width="9" height="5.5" rx="1" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

export default function NewGameActionModal({
  isOpen,
  onClose,
  onCreateLeague,
  onCreateChallenge,
  onCreateSolo,
}: NewGameActionModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto overscroll-contain">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="surface rounded-3xl p-5 sm:p-8 max-w-lg w-full border shadow-2xl relative max-h-[calc(100dvh-1.5rem)] overflow-y-auto my-auto"
          style={{ borderColor: "var(--border-dim)" }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[var(--border-dim)] flex items-center justify-center text-[var(--text-mute)] hover:text-[var(--text)] hover:border-[var(--border)] transition-colors cursor-pointer bg-[var(--bg-input)]"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="mb-6 pr-8">
            <div className="flex items-center gap-2 mb-1.5">
              <Gamepad2 size={16} className="text-[var(--terra)]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--terra)]">
                Fey Game Creator
              </span>
            </div>
            <h3
              className="font-space text-2xl font-extrabold tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Start New Game
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-1">
              Select how you want to compete, test your knowledge, or challenge friends.
            </p>
          </div>

          {/* 3 Game Choices */}
          <div className="space-y-3">
            {/* Option 1: Create League */}
            <div
              onClick={() => {
                onClose();
                onCreateLeague();
              }}
              className="p-4 sm:p-5 rounded-2xl border surface cursor-pointer hover:scale-[1.01] hover:shadow-sm hover:border-[var(--terra)]/40 transition-all group relative overflow-hidden"
              style={{ borderColor: "var(--border-dim)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[var(--terra)]/15 border border-[var(--terra)]/30 flex items-center justify-center text-[var(--terra)] shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <Trophy size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-space font-extrabold text-base text-[var(--text)] group-hover:text-[var(--terra)] transition-colors">
                        Create League
                      </h4>
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--terra)]/15 text-[var(--terra)] border border-[var(--terra)]/30">
                        Multi-Day Cup
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                      Multi-day tournament with 1 daily drop, speed velocity points, and cumulative standings.
                    </p>
                  </div>
                </div>
                <div className="bg-[var(--terra)] hover:bg-[#8C2135] text-white px-3.5 py-1.5 rounded-xl text-xs font-space font-bold shrink-0 self-center hidden sm:flex items-center gap-1 shadow-xs transition-colors">
                  <span>Create</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>

            {/* Option 2: Create Challenge */}
            <div
              onClick={() => {
                onClose();
                onCreateChallenge();
              }}
              className="p-4 sm:p-5 rounded-2xl border surface cursor-pointer hover:scale-[1.01] hover:shadow-sm hover:border-[var(--olive)]/40 transition-all group relative overflow-hidden"
              style={{ borderColor: "var(--border-dim)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[var(--olive)]/15 border border-[var(--olive)]/30 flex items-center justify-center text-[var(--olive)] shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <Swords size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-space font-extrabold text-base text-[var(--text)] group-hover:text-[var(--olive)] transition-colors">
                        Create Challenge
                      </h4>
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--olive)]/15 text-[var(--olive)] border border-[var(--olive)]/30">
                        1v1 Challenge
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                      Pick questions and time window. Share link on WhatsApp so friends answer the exact same quiz.
                    </p>
                  </div>
                </div>
                <div className="bg-[var(--olive)] hover:bg-[#535F36] text-white px-3.5 py-1.5 rounded-xl text-xs font-space font-bold shrink-0 self-center hidden sm:flex items-center gap-1 shadow-xs transition-colors">
                  <span>Challenge</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>

            {/* Option 3: Solo Sprint */}
            <div
              onClick={() => {
                onClose();
                onCreateSolo();
              }}
              className="p-4 sm:p-5 rounded-2xl border surface cursor-pointer hover:scale-[1.01] hover:shadow-sm hover:border-[var(--gold)]/40 transition-all group relative overflow-hidden"
              style={{ borderColor: "var(--border-dim)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <PersonLaptopIcon size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-space font-extrabold text-base text-[var(--text)] group-hover:text-[var(--gold)] transition-colors">
                        Solo Sprint
                      </h4>
                      <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/25">
                        Practice
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                      Instant single-player trivia quiz (Quick, Standard, or Marathon) with detailed cultural explanations.
                    </p>
                  </div>
                </div>
                <div className="bg-[var(--gold)] hover:bg-[#B88A22] text-white px-3.5 py-1.5 rounded-xl text-xs font-space font-bold shrink-0 self-center hidden sm:flex items-center gap-1 shadow-xs transition-colors">
                  <span>Play Solo</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
