"use client";

import React from "react";
import { ArticulateRoom } from "@/lib/articulate-room";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/game-words";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="max-w-md mx-auto space-y-5 text-center">
      {/* Speaker Banner */}
      <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: activeTeamColor }} />
          <span>{currentTurn?.speakerName} describing for <strong style={{ color: activeTeamColor }}>{activeTeamName}</strong></span>
        </div>
        <span className="text-[11px] text-[var(--olive)] uppercase tracking-wider font-extrabold">
          {isMyTeam ? "🎯 Guess!" : "👀 Watch"}
        </span>
      </div>

      {/* Countdown Timer */}
      <motion.div
        animate={isUrgent ? { scale: [1, 1.04, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-space font-extrabold text-3xl border transition-colors shadow-sm ${
          isUrgent
            ? "bg-red-500/15 border-red-500 text-red-500"
            : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)]"
        }`}
      >
        <Clock className="w-5 h-5" />
        <span>{secondsRemaining}s</span>
      </motion.div>

      {/* Category Hint & Score Card */}
      <div className="surface rounded-3xl p-6 sm:p-8 border border-[var(--border-dim)] shadow-sm space-y-4">
        {currentWord && (
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: CATEGORY_COLORS[currentWord.category] || "var(--olive)" }}
          >
            <span>{CATEGORY_ICONS[currentWord.category] || "📦"}</span>
            <span>Category: {currentWord.category}</span>
          </div>
        )}

        <div className="py-4">
          <div className="font-space font-extrabold text-4xl text-[var(--text)]">
            +{room.round_words_scored?.length || 0}
          </div>
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mt-1">
            Words Scored This Turn
          </div>
        </div>

        {/* Minimal Scoreboard */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-dim)]/50">
          <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border-dim)]">
            <div className="text-[10px] font-bold text-[var(--text-mute)] uppercase">{room.teams.teamA.name}</div>
            <div className="font-space font-extrabold text-xl mt-0.5" style={{ color: room.teams.teamA.color }}>
              {room.teams.teamA.score} pts
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border-dim)]">
            <div className="text-[10px] font-bold text-[var(--text-mute)] uppercase">{room.teams.teamB.name}</div>
            <div className="font-space font-extrabold text-xl mt-0.5" style={{ color: room.teams.teamB.color }}>
              {room.teams.teamB.score} pts
            </div>
          </div>
        </div>
      </div>

      {/* Floating Reactions Bar */}
      <div className="flex justify-center gap-3">
        {["🔥", "👏", "🧠", "⚡"].map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSendReaction(emoji)}
            className="w-11 h-11 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] hover:border-[var(--olive)] text-xl flex items-center justify-center cursor-pointer shadow-xs"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
