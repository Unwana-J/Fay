"use client";

import React from "react";
import { ArticulateRoom } from "@/lib/articulate-room";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/game-words";
import { Clock, Volume2, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoomGuesserViewProps {
  room: ArticulateRoom;
  secondsRemaining: number;
  myPlayerId: string;
  onSendReaction: (emoji: string) => void;
}

export default function RoomGuesserView({
  room,
  secondsRemaining,
  myPlayerId,
  onSendReaction,
}: RoomGuesserViewProps) {
  const currentTurn = room.current_turn;
  const currentWord = room.deck[room.current_word_index];
  const isUrgent = secondsRemaining <= 15;

  const isMyTeam =
    currentTurn?.activeTeam === "A"
      ? room.teams.teamA.playerIds.includes(myPlayerId)
      : room.teams.teamB.playerIds.includes(myPlayerId);

  const activeTeamName =
    currentTurn?.activeTeam === "B"
      ? room.teams.teamB.name
      : room.teams.teamA.name;

  const activeTeamColor =
    currentTurn?.activeTeam === "B"
      ? room.teams.teamB.color
      : room.teams.teamA.color;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center">
      {/* Guesser Status Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: activeTeamColor }} />
          <span className="text-[var(--text)]">
            {currentTurn?.speakerName} is describing for{" "}
            <span style={{ color: activeTeamColor }}>{activeTeamName}</span>
          </span>
        </div>
        <div className="text-[var(--olive)] uppercase tracking-wider text-[11px]">
          {isMyTeam ? "🎯 Your Team's Turn — Guess Loudly!" : "👀 Opponent's Turn — Listen Closely"}
        </div>
      </div>

      {/* Synchronized Circular Countdown */}
      <div className="flex flex-col items-center justify-center p-4">
        <motion.div
          animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-space font-extrabold text-3xl sm:text-4xl border transition-colors shadow-sm ${
            isUrgent
              ? "bg-red-500/15 border-red-500 text-red-500"
              : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)]"
          }`}
        >
          <Clock className={`w-6 h-6 ${isUrgent ? "animate-bounce" : ""}`} />
          <span>{secondsRemaining}s</span>
        </motion.div>
      </div>

      {/* Category Hint Card (Word is hidden from guessers!) */}
      <div className="surface rounded-3xl p-8 sm:p-12 border border-[var(--border-dim)] shadow-lg relative overflow-hidden space-y-4">
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: activeTeamColor }}
        />

        {currentWord ? (
          <>
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: CATEGORY_COLORS[currentWord.category] || "var(--olive)" }}
            >
              <span>{CATEGORY_ICONS[currentWord.category] || "📦"}</span>
              <span>Category: {currentWord.category}</span>
              <span className="opacity-80">• {currentWord.difficulty}</span>
            </div>

            <div className="py-6">
              <div className="font-space font-extrabold text-3xl sm:text-4xl text-[var(--text)] tracking-tight">
                {isMyTeam ? "Shout Out Guesses!" : "Monitoring Guesses"}
              </div>
              <p className="text-xs text-[var(--text-dim)] mt-2 max-w-sm mx-auto">
                {isMyTeam
                  ? `Listen to ${currentTurn?.speakerName}'s clues and shout out your answers!`
                  : `Ensure ${currentTurn?.speakerName} doesn't say rhymes with or parts of the secret word.`}
              </p>
            </div>
          </>
        ) : (
          <div className="py-8">
            <p className="text-sm text-[var(--text-dim)]">Preparing words...</p>
          </div>
        )}

        {/* Live Points Counter for this round */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-[var(--border-dim)]/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-dim)] uppercase tracking-wider font-bold">This Turn:</span>
            <span className="font-space font-extrabold text-xl text-emerald-600">
              +{room.round_words_scored?.length || 0} pts
            </span>
          </div>
        </div>
      </div>

      {/* Floating Reaction Bar */}
      <div className="surface rounded-2xl p-4 border border-[var(--border-dim)] flex items-center justify-between gap-2 shadow-sm">
        <span className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider hidden sm:inline">
          Cheer:
        </span>
        <div className="flex items-center justify-center gap-2 flex-1">
          {[
            { emoji: "🔥", label: "Fire" },
            { emoji: "👏", label: "Clap" },
            { emoji: "🧠", label: "Big Brain" },
            { emoji: "⚡", label: "Fast" },
            { emoji: "😂", label: "Laugh" },
          ].map(({ emoji, label }) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSendReaction(emoji)}
              className="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--border-dim)] hover:border-[var(--olive)] text-lg flex items-center justify-center cursor-pointer shadow-xs transition"
              title={label}
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Overall Scoreboard */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="p-4 rounded-2xl border text-left"
          style={{
            borderColor: `${room.teams.teamA.color}40`,
            backgroundColor: `${room.teams.teamA.color}0D`,
          }}
        >
          <div className="text-xs font-bold text-[var(--text-mute)] uppercase tracking-wider">
            {room.teams.teamA.name}
          </div>
          <div className="font-space font-extrabold text-3xl mt-1" style={{ color: room.teams.teamA.color }}>
            {room.teams.teamA.score} <span className="text-xs font-normal text-[var(--text-dim)]">pts</span>
          </div>
        </div>

        <div
          className="p-4 rounded-2xl border text-left"
          style={{
            borderColor: `${room.teams.teamB.color}40`,
            backgroundColor: `${room.teams.teamB.color}0D`,
          }}
        >
          <div className="text-xs font-bold text-[var(--text-mute)] uppercase tracking-wider">
            {room.teams.teamB.name}
          </div>
          <div className="font-space font-extrabold text-3xl mt-1" style={{ color: room.teams.teamB.color }}>
            {room.teams.teamB.score} <span className="text-xs font-normal text-[var(--text-dim)]">pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
