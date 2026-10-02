"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArticulateRoom } from "@/lib/articulate-room";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/game-words";
import { Check, FastForward, Clock, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import canvasConfetti from "canvas-confetti";

interface RoomSpeakerViewProps {
  room: ArticulateRoom;
  secondsRemaining: number;
  onScoreWord: () => void;
  onPassWord: () => void;
  onEndRound: () => void;
}

export default function RoomSpeakerView({
  room,
  secondsRemaining,
  onScoreWord,
  onPassWord,
  onEndRound,
}: RoomSpeakerViewProps) {
  const currentWord = room.deck?.[room.current_word_index];
  const currentTurn = room.current_turn;
  const isUrgent = secondsRemaining <= 15;

  const [feedback, setFeedback] = useState<"correct" | "pass" | null>(null);
  const [slideDirection, setSlideDirection] = useState<"right" | "left">("right");
  const [pointPops, setPointPops] = useState<{ id: number; text: string }[]>([]);

  const triggerHaptic = (type: "correct" | "pass") => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        if (type === "correct") navigator.vibrate(15);
        else navigator.vibrate(25);
      } catch {}
    }
  };

  const handleGotIt = useCallback(() => {
    setSlideDirection("right");
    onScoreWord();
    setFeedback("correct");
    triggerHaptic("correct");

    // Spawn floating +1 score animation
    const popId = Date.now();
    setPointPops((prev) => [...prev.slice(-4), { id: popId, text: "+1" }]);
    setTimeout(() => {
      setPointPops((prev) => prev.filter((p) => p.id !== popId));
    }, 900);

    try {
      canvasConfetti({
        particleCount: 16,
        spread: 50,
        origin: { y: 0.8 },
        disableForReducedMotion: true,
      });
    } catch {}

    setTimeout(() => {
      setFeedback(null);
    }, 150);
  }, [onScoreWord]);

  const handlePass = useCallback(() => {
    setSlideDirection("left");
    onPassWord();
    setFeedback("pass");
    triggerHaptic("pass");
    setTimeout(() => {
      setFeedback(null);
    }, 150);
  }, [onPassWord]);

  // Desktop keyboard shortcuts: Space / ArrowRight = Got It, ArrowLeft / P = Pass
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space" || e.code === "ArrowRight") {
        e.preventDefault();
        handleGotIt();
      } else if (e.code === "ArrowLeft" || e.code === "KeyP") {
        e.preventDefault();
        handlePass();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGotIt, handlePass]);

  const activeTeamColor =
    currentTurn?.activeTeam === "B"
      ? room.teams?.teamB?.color || "#3B82F6"
      : room.teams?.teamA?.color || "#EF4444";

  const activeTeamName =
    currentTurn?.activeTeam === "B"
      ? room.teams?.teamB?.name || "Team Omega"
      : room.teams?.teamA?.name || "Team Alpha";

  const getWordFontSize = (wordText: string) => {
    const len = wordText.length;
    if (len > 22) return "text-2xl sm:text-3xl";
    if (len > 15) return "text-3xl sm:text-4xl";
    if (len > 10) return "text-3xl sm:text-5xl";
    return "text-4xl sm:text-5xl";
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6 text-center pb-28 sm:pb-4 touch-manipulation select-none relative">
      {/* Speaker Role Banner */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-xs font-bold">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: activeTeamColor }} />
          <span className="text-[var(--text)] truncate">Describing for {activeTeamName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--olive)] flex-shrink-0">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider">Round {currentTurn?.roundNumber}</span>
        </div>
      </div>

      {/* Synchronized Circular/Bar Countdown with glowing aura */}
      <div className="flex flex-col items-center justify-center p-2 sm:p-4 relative">
        {isUrgent && (
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            className="absolute w-28 h-12 rounded-full bg-red-500/20 blur-md pointer-events-none"
          />
        )}
        <motion.div
          animate={isUrgent ? { scale: [1, 1.06, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          className={`relative z-10 flex items-center gap-2 px-5 py-2 sm:py-2.5 rounded-full font-space font-extrabold text-2xl sm:text-3xl border transition-colors shadow-sm ${
            isUrgent
              ? "bg-red-500/15 border-red-500 text-red-500 shadow-red-500/20 shadow-lg"
              : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)]"
          }`}
        >
          <Clock className={`w-5 h-5 ${isUrgent ? "animate-bounce" : ""}`} />
          <span>{secondsRemaining}s</span>
        </motion.div>
      </div>

      {/* Floating +1 Pop Particles */}
      <div className="relative pointer-events-none">
        <AnimatePresence>
          {pointPops.map((pop) => (
            <motion.div
              key={pop.id}
              initial={{ opacity: 1, y: 0, scale: 0.5, rotate: -6 }}
              animate={{ opacity: 0, y: -70, scale: 1.4, rotate: 6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute left-1/2 -translate-x-1/2 top-0 z-30 font-space font-black text-3xl text-emerald-500 drop-shadow-md flex items-center gap-1"
            >
              <span>{pop.text}</span>
              <span className="text-xl">🎯</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Word Flashcard with Kinetic Exit/Entry Spring Physics */}
      <div className="relative min-h-[220px] sm:min-h-[280px]">
        <AnimatePresence mode="popLayout" custom={slideDirection}>
          {currentWord ? (
            <motion.div
              key={currentWord.word}
              custom={slideDirection}
              initial={{
                opacity: 0,
                x: slideDirection === "right" ? -35 : 35,
                scale: 0.94,
                rotate: slideDirection === "right" ? -1.5 : 1.5,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                rotate: 0,
              }}
              exit={{
                opacity: 0,
                x: slideDirection === "right" ? 60 : -60,
                scale: 0.92,
                rotate: slideDirection === "right" ? 2 : -2,
              }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className={`surface rounded-3xl p-6 sm:p-12 border shadow-lg relative overflow-hidden transition-colors flex flex-col justify-center min-h-[220px] sm:min-h-[280px] ${
                feedback === "correct"
                  ? "border-emerald-500 bg-emerald-500/10 shadow-emerald-500/20"
                  : feedback === "pass"
                  ? "border-amber-500 bg-amber-500/10 shadow-amber-500/20"
                  : "border-[var(--border-dim)]"
              }`}
            >
              {/* Category Ribbon */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm mx-auto mb-4"
                style={{ backgroundColor: CATEGORY_COLORS[currentWord.category] || "var(--olive)" }}
              >
                <span>{CATEGORY_ICONS[currentWord.category] || "📦"}</span>
                <span>{currentWord.category}</span>
                <span className="opacity-75">• {currentWord.difficulty}</span>
              </motion.div>

              {/* Target Word with dynamic font scaling */}
              <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.08 }}
                className={`font-space font-extrabold ${getWordFontSize(currentWord.word)} text-[var(--text)] tracking-tight my-2 sm:my-4 leading-tight break-words`}
              >
                {currentWord.word}
              </motion.div>

              {/* Rules reminder */}
              <p className="text-[11px] sm:text-xs text-[var(--text-dim)] max-w-xs mx-auto mt-2 sm:mt-4 leading-relaxed">
                Describe without saying the word, rhymes with, or letter spelling!
              </p>
            </motion.div>
          ) : (
            <div className="surface rounded-3xl p-12 border border-[var(--border-dim)]">
              <p className="text-sm text-[var(--text-dim)]">Shuffling more words...</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Speaker Action Controls: Fixed Bottom Thumb Zone on Mobile, Centered Grid on Desktop */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/60 backdrop-blur-md border-t border-[var(--border-dim)] z-40 sm:static sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0 grid grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePass}
          className="flex items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl font-space font-extrabold text-base bg-[var(--bg-card)] border-2 border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--border)] shadow-sm cursor-pointer transition touch-manipulation active:bg-[var(--bg-hover)]"
        >
          <FastForward className="w-5 h-5" />
          <span>Pass</span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border-dim)] text-[var(--text-mute)] ml-1">←</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGotIt}
          className="flex items-center justify-center gap-2 py-4 sm:py-5 rounded-2xl font-space font-extrabold text-base bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-lg cursor-pointer transition touch-manipulation"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          <span>Got It! (+1)</span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-700/60 border border-emerald-400/30 text-white ml-1">Space</span>
        </motion.button>
      </div>

      {/* Live turn score tracker & desktop keyboard guide */}
      <div className="flex items-center justify-between px-2 text-xs text-[var(--text-dim)] font-medium pt-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Scored: <strong className="text-emerald-600">{room.round_words_scored?.length || 0}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Passed: <strong className="text-[var(--text)]">{room.round_words_passed?.length || 0}</strong>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[var(--text-mute)] font-mono">
          <Keyboard className="w-3 h-3" />
          <span>Keys: Space / → (Got it) • ← (Pass)</span>
        </div>
      </div>
    </div>
  );
}
