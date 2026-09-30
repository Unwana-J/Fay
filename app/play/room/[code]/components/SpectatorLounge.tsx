"use client";

import React from "react";
import { ArticulateRoom } from "@/lib/articulate-room";
import { Lock, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SpectatorLoungeProps {
  room: ArticulateRoom;
  secondsRemaining: number;
  myPlayerId: string;
  onSendReaction: (emoji: string) => void;
}

export default function SpectatorLounge({
  room,
  secondsRemaining,
  onSendReaction,
}: SpectatorLoungeProps) {
  const currentTurn = room.current_turn;
  const activeTeamName =
    currentTurn?.activeTeam === "B"
      ? room.teams.teamB.name
      : room.teams.teamA.name;
  const activeTeamColor =
    currentTurn?.activeTeam === "B"
      ? room.teams.teamB.color
      : room.teams.teamA.color;

  return (
    <div className="max-w-md mx-auto space-y-6 text-center py-8 px-4">
      {/* Locked Status Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--terra)]/10 text-[var(--terra)] text-xs font-bold font-space uppercase tracking-wider">
        <Lock className="w-3.5 h-3.5" />
        Round {currentTurn?.roundNumber || 1} in Progress
      </div>

      {/* Main Minimal Card */}
      <div className="surface rounded-3xl p-6 sm:p-8 border border-[var(--border-dim)] shadow-md space-y-6">
        {/* Countdown */}
        <div className="space-y-2">
          <div className="font-space font-extrabold text-6xl text-[var(--text)] tracking-tight">
            {secondsRemaining}s
          </div>
          <p className="text-xs text-[var(--text-dim)]">
            <strong className="text-[var(--text)]">{currentTurn?.speakerName}</strong> is describing for{" "}
            <span className="font-bold" style={{ color: activeTeamColor }}>{activeTeamName}</span>
          </p>
        </div>

        {/* Minimal Score Strip */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-[var(--bg)] rounded-2xl border border-[var(--border-dim)]">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)]">
              {room.teams.teamA.name}
            </div>
            <div className="font-space font-extrabold text-xl" style={{ color: room.teams.teamA.color }}>
              {room.teams.teamA.score} <span className="text-xs text-[var(--text-dim)] font-normal">pts</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)]">
              {room.teams.teamB.name}
            </div>
            <div className="font-space font-extrabold text-xl" style={{ color: room.teams.teamB.color }}>
              {room.teams.teamB.score} <span className="text-xs text-[var(--text-dim)] font-normal">pts</span>
            </div>
          </div>
        </div>

        {/* Admission message */}
        <div className="text-xs text-[var(--text-dim)] flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--gold)]" />
          <span>You&apos;ll be drafted into the match in {secondsRemaining}s!</span>
        </div>

        {/* Cheer Reactions */}
        <div className="flex justify-center gap-2 pt-2 border-t border-[var(--border-dim)]/50">
          {["🔥", "👏", "🧠", "⚡"].map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSendReaction(emoji)}
              className="w-10 h-10 rounded-xl bg-[var(--bg)] border border-[var(--border-dim)] hover:border-[var(--olive)] text-lg flex items-center justify-center cursor-pointer shadow-xs"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
