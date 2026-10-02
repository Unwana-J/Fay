"use client";

import React, { useEffect } from "react";
import { ArticulateRoom } from "@/lib/articulate-room";
import { Trophy, RotateCcw, Home, Crown } from "lucide-react";
import { motion } from "framer-motion";
import canvasConfetti from "canvas-confetti";
import Link from "next/link";

interface RoomGameOverProps {
  room: ArticulateRoom;
  isHost: boolean;
  onResetGame: () => void;
}

export default function RoomGameOver({
  room,
  isHost,
  onResetGame,
}: RoomGameOverProps) {
  const winner =
    room.teams.teamA.score >= room.settings.scoreGoal
      ? room.teams.teamA
      : room.teams.teamB.score >= room.settings.scoreGoal
      ? room.teams.teamB
      : room.teams.teamA.score > room.teams.teamB.score
      ? room.teams.teamA
      : room.teams.teamB;

  useEffect(() => {
    try {
      canvasConfetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center py-6">
      {/* Trophy & Winner Badge */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full mx-auto flex items-center justify-center shadow-xl border-4"
        style={{
          backgroundColor: `${winner.color}20`,
          borderColor: winner.color,
          color: winner.color,
        }}
      >
        <Trophy className="w-10 h-10" />
      </motion.div>

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 border border-amber-500/30">
          <Crown className="w-3.5 h-3.5" /> Match Decided!
        </span>
        <h1 className="font-space font-extrabold text-3xl sm:text-4xl text-[var(--text)]">
          {winner.name} Wins!
        </h1>
        <p className="text-xs text-[var(--text-dim)]">
          Articulated their way to victory with {winner.score} points
        </p>
      </div>

      {/* Final Scoreboard Card */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="p-5 rounded-2xl border text-left shadow-sm"
          style={{
            borderColor: `${room.teams.teamA.color}40`,
            backgroundColor: `${room.teams.teamA.color}0D`,
          }}
        >
          <div className="text-xs font-bold text-[var(--text-mute)] uppercase tracking-wider">
            {room.teams.teamA.name}
          </div>
          <div className="font-space font-extrabold text-4xl mt-1" style={{ color: room.teams.teamA.color }}>
            {room.teams.teamA.score} <span className="text-xs font-normal text-[var(--text-dim)]">pts</span>
          </div>
        </div>

        <div
          className="p-5 rounded-2xl border text-left shadow-sm"
          style={{
            borderColor: `${room.teams.teamB.color}40`,
            backgroundColor: `${room.teams.teamB.color}0D`,
          }}
        >
          <div className="text-xs font-bold text-[var(--text-mute)] uppercase tracking-wider">
            {room.teams.teamB.name}
          </div>
          <div className="font-space font-extrabold text-4xl mt-1" style={{ color: room.teams.teamB.color }}>
            {room.teams.teamB.score} <span className="text-xs font-normal text-[var(--text-dim)]">pts</span>
          </div>
        </div>
      </div>

      {/* Match Word Review Accordion */}
      {(room.round_words_scored?.length > 0 || room.round_words_passed?.length > 0) && (
        <div className="surface rounded-2xl border border-[var(--border-dim)] p-4 text-left space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-dim)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-mute)]">
              Final Round Words
            </span>
            <span className="text-[11px] text-[var(--text-dim)] font-medium">
              {room.round_words_scored?.length || 0} scored • {room.round_words_passed?.length || 0} passed
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {room.round_words_scored?.map((w, idx) => (
              <span
                key={`scored-${idx}`}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  w.disputeStatus === "conceded"
                    ? "bg-red-500/10 text-red-600 line-through border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                }`}
              >
                {w.word}
              </span>
            ))}
            {room.round_words_passed?.map((w, idx) => (
              <span
                key={`passed-${idx}`}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  w.claimStatus === "awarded"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold"
                    : "bg-[var(--bg-card)] text-[var(--text-mute)] border-[var(--border-dim)]"
                }`}
              >
                {w.word} (passed)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {isHost && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onResetGame}
            className="w-full bg-[var(--terra)] text-white py-4 rounded-2xl font-space font-extrabold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <RotateCcw className="w-5 h-5" />
            Rematch (Play Again)
          </motion.button>
        )}

        <Link
          href="/play"
          className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-xs font-bold border border-[var(--border-dim)] hover:border-[var(--olive)] bg-[var(--bg-card)] text-[var(--text)] transition cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Back to Parlor
        </Link>
      </div>
    </div>
  );
}
