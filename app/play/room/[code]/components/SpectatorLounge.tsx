"use client";

import React from "react";
import { ArticulateRoom } from "@/lib/articulate-room";
import { Lock, Clock, Users, Flame, Heart, ThumbsUp, Zap, Sparkles } from "lucide-react";
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
  myPlayerId,
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

  const totalSpectators = Math.max(1, room.spectators?.length || 1);

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center py-6 px-4">
      {/* Locked Badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--terra)]/15 border border-[var(--terra)]/40 text-[var(--terra)] font-space font-bold text-xs uppercase tracking-wider"
      >
        <Lock className="w-3.5 h-3.5" />
        Round {currentTurn?.roundNumber || 1} in Progress • Room Locked
      </motion.div>

      {/* Main Waiting Card */}
      <div className="surface rounded-3xl p-6 sm:p-8 border border-[var(--border-dim)] shadow-xl relative overflow-hidden space-y-6">
        {/* Subtle glowing backdrop accent */}
        <div
          className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: activeTeamColor }}
        />

        <div className="space-y-3">
          <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-[var(--text)]">
            Spectator Waiting Lounge
          </h2>
          <p className="text-sm text-[var(--text-dim)] max-w-lg mx-auto leading-relaxed">
            A live round is actively underway! To ensure fair competition, no new players can enter mid-turn. You will be <span className="font-bold text-[var(--olive)]">automatically drafted</span> into the active lineup as soon as this round concludes.
          </p>
        </div>

        {/* Live Synchronized Countdown Timer */}
        <div className="flex flex-col items-center justify-center p-6 bg-[var(--bg)]/60 rounded-2xl border border-[var(--border-dim)]">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-mute)] mb-2">
            <Clock className="w-4 h-4 text-[var(--olive)] animate-spin" style={{ animationDuration: "8s" }} />
            Round Timer Remaining
          </div>
          <div className="font-space font-extrabold text-5xl sm:text-6xl text-[var(--text)] tracking-tight">
            {secondsRemaining}s
          </div>
          <div className="text-xs text-[var(--text-dim)] mt-2">
            Describing now: <span className="font-bold text-[var(--text)]">{currentTurn?.speakerName || "Active Speaker"}</span> for{" "}
            <span className="font-bold" style={{ color: activeTeamColor }}>
              {activeTeamName}
            </span>
          </div>
        </div>

        {/* Live Scoreboard Snapshot */}
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
            <div className="text-[11px] text-[var(--text-dim)] mt-1">
              {room.teams.teamA.playerIds.length} scholars
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
            <div className="text-[11px] text-[var(--text-dim)] mt-1">
              {room.teams.teamB.playerIds.length} scholars
            </div>
          </div>
        </div>

        {/* Live Cheer Reaction Bar */}
        <div className="pt-2 border-t border-[var(--border-dim)]/50 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-mute)]">
            Send Live Reactions to the Players
          </p>
          <div className="flex justify-center gap-3">
            {[
              { emoji: "🔥", label: "Fire" },
              { emoji: "👏", label: "Clap" },
              { emoji: "🧠", label: "Genius" },
              { emoji: "⚡", label: "Speed" },
              { emoji: "🎉", label: "Party" },
            ].map(({ emoji, label }) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSendReaction(emoji)}
                className="w-11 h-11 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] hover:border-[var(--olive)] text-xl flex items-center justify-center cursor-pointer shadow-sm"
                title={label}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Queue position badge */}
      <div className="inline-flex items-center gap-2 text-xs text-[var(--text-dim)] font-medium">
        <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
        You are in the admission queue • Admitting at round end ({totalSpectators} spectator{totalSpectators > 1 ? "s" : ""})
      </div>
    </div>
  );
}
