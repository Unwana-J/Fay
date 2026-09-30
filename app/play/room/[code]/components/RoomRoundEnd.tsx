"use client";

import React from "react";
import { ArticulateRoom } from "@/lib/articulate-room";
import { Check, FastForward, Play, Trophy, Users, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface RoomRoundEndProps {
  room: ArticulateRoom;
  isHost: boolean;
  onStartNextRound: () => void;
}

export default function RoomRoundEnd({
  room,
  isHost,
  onStartNextRound,
}: RoomRoundEndProps) {
  const currentTurn = room.current_turn;
  const scoredWords = room.round_words_scored || [];
  const passedWords = room.round_words_passed || [];

  const turnTeamName =
    currentTurn?.activeTeam === "B"
      ? room.teams.teamB.name
      : room.teams.teamA.name;
  const turnTeamColor =
    currentTurn?.activeTeam === "B"
      ? room.teams.teamB.color
      : room.teams.teamA.color;

  // Next round calculation
  const nextRoundNumber = (currentTurn?.roundNumber || 1) + 1;
  const nextActiveTeamKey: "A" | "B" = nextRoundNumber % 2 === 1 ? "A" : "B";
  const nextTeamName =
    nextActiveTeamKey === "A" ? room.teams.teamA.name : room.teams.teamB.name;
  const nextTeamColor =
    nextActiveTeamKey === "A" ? room.teams.teamA.color : room.teams.teamB.color;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center">
      {/* Round Complete Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-wider font-extrabold text-[var(--olive)]">
          Intermission • Round {currentTurn?.roundNumber} Complete
        </span>
        <h1 className="font-space font-extrabold text-3xl sm:text-4xl text-[var(--text)]">
          {turnTeamName} Scored +{scoredWords.length} pts!
        </h1>
        <p className="text-xs text-[var(--text-dim)]">
          Described by <strong className="text-[var(--text)]">{currentTurn?.speakerName}</strong>
        </p>
      </div>

      {/* Spectator Admission Notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-center gap-2 font-medium"
      >
        <Sparkles className="w-4 h-4 text-emerald-500" />
        <span>Room is unlocked! Waiting spectators are now drafted into the active roster for Round {nextRoundNumber}.</span>
      </motion.div>

      {/* Words Scored & Passed Cards */}
      <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-dim)]">
          <h3 className="font-space font-bold text-sm text-[var(--text)]">Round Word Recap</h3>
          <span className="text-xs font-bold text-emerald-600">+{scoredWords.length} Points</span>
        </div>

        {scoredWords.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)]">
              Words Articulated:
            </span>
            <div className="flex flex-wrap gap-2">
              {scoredWords.map((w, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                >
                  <Check className="w-3 h-3 text-emerald-500" />
                  {w.word}
                </span>
              ))}
            </div>
          </div>
        )}

        {passedWords.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)]">
              Words Passed:
            </span>
            <div className="flex flex-wrap gap-2">
              {passedWords.map((w, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-[var(--bg)] text-[var(--text-dim)] border border-[var(--border-dim)]"
                >
                  <FastForward className="w-3 h-3 text-[var(--text-mute)]" />
                  {w.word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Total Scoreboard */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="p-5 rounded-2xl border text-left"
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
          <div className="text-[11px] text-[var(--text-dim)] mt-1">
            Goal: {room.settings.scoreGoal} pts
          </div>
        </div>

        <div
          className="p-5 rounded-2xl border text-left"
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
          <div className="text-[11px] text-[var(--text-dim)] mt-1">
            Goal: {room.settings.scoreGoal} pts
          </div>
        </div>
      </div>

      {/* Next Round CTA */}
      <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] shadow-sm space-y-3">
        <div className="text-xs text-[var(--text-dim)]">
          Next turn belongs to{" "}
          <strong style={{ color: nextTeamColor }}>{nextTeamName}</strong>
        </div>

        {isHost ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartNextRound}
              className="w-full bg-[var(--terra)] text-white py-4 rounded-2xl font-space font-extrabold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Play className="w-5 h-5 fill-current" />
              Lock Room & Start Round {nextRoundNumber}
            </motion.button>
            <p className="text-xs text-[var(--text-dim)]">
              🔒 Room will lock once Round {nextRoundNumber} begins.
            </p>
          </>
        ) : (
          <div className="py-2 space-y-1">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-[var(--text)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Waiting for {room.host_name} to launch Round {nextRoundNumber}...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
