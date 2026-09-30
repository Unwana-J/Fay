"use client";

import React, { useState, useEffect } from "react";
import { ArticulateRoom } from "@/lib/articulate-room";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/game-words";
import { Check, FastForward, Clock, AlertTriangle } from "lucide-react";
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
  const currentWord = room.deck[room.current_word_index];
  const currentTurn = room.current_turn;
  const isUrgent = secondsRemaining <= 15;

  const [feedback, setFeedback] = useState<"correct" | "pass" | null>(null);

  const handleGotIt = () => {
    setFeedback("correct");
    // Trigger celebratory micro-confetti
    try {
      canvasConfetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}

    setTimeout(() => {
      setFeedback(null);
      onScoreWord();
    }, 180);
  };

  const handlePass = () => {
    setFeedback("pass");
    setTimeout(() => {
      setFeedback(null);
      onPassWord();
    }, 180);
  };

  const activeTeamColor =
    currentTurn?.activeTeam === "B"
      ? room.teams.teamB.color
      : room.teams.teamA.color;

  const activeTeamName =
    currentTurn?.activeTeam === "B"
      ? room.teams.teamB.name
      : room.teams.teamA.name;

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center">
      {/* Speaker Role Banner */}
      <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTeamColor }} />
          <span className="text-[var(--text)]">You are describing for {activeTeamName}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--olive)]">
          <span className="text-[11px] uppercase tracking-wider">Round {currentTurn?.roundNumber}</span>
        </div>
      </div>

      {/* Synchronized Circular/Bar Countdown */}
      <div className="flex flex-col items-center justify-center p-4">
        <motion.div
          animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-space font-extrabold text-2xl sm:text-3xl border transition-colors shadow-sm ${
            isUrgent
              ? "bg-red-500/15 border-red-500 text-red-500"
              : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)]"
          }`}
        >
          <Clock className={`w-5 h-5 ${isUrgent ? "animate-bounce" : ""}`} />
          <span>{secondsRemaining}s</span>
        </motion.div>
      </div>

      {/* Main Word Flashcard */}
      <AnimatePresence mode="wait">
        {currentWord ? (
          <motion.div
            key={currentWord.word}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className={`surface rounded-3xl p-8 sm:p-12 border shadow-lg relative overflow-hidden transition-colors ${
              feedback === "correct"
                ? "border-emerald-500 bg-emerald-500/10"
                : feedback === "pass"
                ? "border-amber-500 bg-amber-500/10"
                : "border-[var(--border-dim)]"
            }`}
          >
            {/* Category Ribbon */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm mb-6"
              style={{ backgroundColor: CATEGORY_COLORS[currentWord.category] || "var(--olive)" }}
            >
              <span>{CATEGORY_ICONS[currentWord.category] || "📦"}</span>
              <span>{currentWord.category}</span>
              <span className="opacity-75">• {currentWord.difficulty}</span>
            </div>

            {/* Target Word */}
            <div className="font-space font-extrabold text-4xl sm:text-5xl text-[var(--text)] tracking-tight my-4">
              {currentWord.word}
            </div>

            {/* Rules reminder */}
            <p className="text-xs text-[var(--text-dim)] max-w-xs mx-auto mt-4 leading-relaxed">
              Describe without saying the word, rhymes with, or letter spelling!
            </p>
          </motion.div>
        ) : (
          <div className="surface rounded-3xl p-12 border border-[var(--border-dim)]">
            <p className="text-sm text-[var(--text-dim)]">Shuffling more words...</p>
          </div>
        )}
      </AnimatePresence>

      {/* Speaker Action Controls */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePass}
          className="flex items-center justify-center gap-2 py-5 rounded-2xl font-space font-extrabold text-base bg-[var(--bg-card)] border-2 border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--border)] shadow-sm cursor-pointer transition"
        >
          <FastForward className="w-5 h-5" />
          Pass
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGotIt}
          className="flex items-center justify-center gap-2 py-5 rounded-2xl font-space font-extrabold text-base bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg cursor-pointer transition"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          Got It! (+1)
        </motion.button>
      </div>

      {/* Live turn score tracker */}
      <div className="flex items-center justify-center gap-6 text-xs text-[var(--text-dim)] font-medium pt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Scored: <strong className="text-emerald-600">{room.round_words_scored?.length || 0}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Passed: <strong className="text-[var(--text)]">{room.round_words_passed?.length || 0}</strong>
        </span>
      </div>
    </div>
  );
}
