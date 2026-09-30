"use client";

import React from "react";
import { ArticulateRoom } from "@/lib/articulate-room";
import { Check, FastForward, Play, Trophy, Users, ArrowRight, Sparkles, AlertTriangle, ShieldCheck, Flag, ThumbsDown, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";

interface RoomRoundEndProps {
  room: ArticulateRoom;
  myPlayerId: string;
  myPlayerName: string;
  isHost: boolean;
  onStartNextRound: () => void;
  onDisputeWord: (wordIndex: number) => void;
  onResolveDispute: (wordIndex: number, resolution: "concede" | "reject") => void;
}

export default function RoomRoundEnd({
  room,
  myPlayerId,
  myPlayerName,
  isHost,
  onStartNextRound,
  onDisputeWord,
  onResolveDispute,
}: RoomRoundEndProps) {
  const currentTurn = room.current_turn;
  const scoredWords = room.round_words_scored || [];
  const passedWords = room.round_words_passed || [];

  const turnTeamKey = currentTurn?.activeTeam === "B" ? "B" : "A";
  const turnTeamName =
    turnTeamKey === "B" ? room.teams.teamB.name : room.teams.teamA.name;
  const turnTeamColor =
    turnTeamKey === "B" ? room.teams.teamB.color : room.teams.teamA.color;

  const myTeam = room.teams.teamA.playerIds.includes(myPlayerId)
    ? "A"
    : room.teams.teamB.playerIds.includes(myPlayerId)
    ? "B"
    : null;

  const isDescribingTeam = myTeam === turnTeamKey;
  const isOpposingTeam = myTeam !== null && !isDescribingTeam;

  // Next round calculation
  const nextRoundNumber = (currentTurn?.roundNumber || 1) + 1;
  const nextActiveTeamKey: "A" | "B" = nextRoundNumber % 2 === 1 ? "A" : "B";
  const nextTeamName =
    nextActiveTeamKey === "A" ? room.teams.teamA.name : room.teams.teamB.name;
  const nextTeamColor =
    nextActiveTeamKey === "A" ? room.teams.teamA.color : room.teams.teamB.color;

  const netPoints = scoredWords.filter((w) => w.disputeStatus !== "conceded").length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center">
      {/* Round Complete Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-wider font-extrabold text-[var(--olive)]">
          Intermission • Round {currentTurn?.roundNumber} Complete
        </span>
        <h1 className="font-space font-extrabold text-3xl sm:text-4xl text-[var(--text)]">
          {turnTeamName} Won +{netPoints} pts!
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
        <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span>Room is unlocked! Waiting spectators are now drafted into the active roster for Round {nextRoundNumber}.</span>
      </motion.div>

      {/* Maker-Checker Dispute Notice */}
      <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-[11px] text-[var(--text-dim)] flex items-center justify-center gap-2 text-left">
        <ShieldCheck className="w-4 h-4 text-[var(--gold)] flex-shrink-0" />
        <span>
          <strong>Maker-Checker Consensus:</strong> Opponents can challenge questionable words (maker). A point is only voided if the describing team agrees and confirms the concession (checker).
        </span>
      </div>

      {/* Words Scored & Maker-Checker Disputes */}
      <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-dim)]">
          <h3 className="font-space font-bold text-sm text-[var(--text)]">Word Audit & Disputes</h3>
          <span className="text-xs font-bold text-emerald-600">+{netPoints} Confirmed</span>
        </div>

        {scoredWords.length > 0 ? (
          <div className="space-y-3">
            {scoredWords.map((w, idx) => {
              const isDisputed = w.disputeStatus === "disputed";
              const isConceded = w.disputeStatus === "conceded";
              const isRejected = w.disputeStatus === "rejected";

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isConceded
                      ? "bg-red-500/5 border-red-500/30 opacity-60"
                      : isDisputed
                      ? "bg-amber-500/10 border-amber-500/50 shadow-sm"
                      : "bg-[var(--bg-card)] border-[var(--border-dim)]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isConceded ? (
                        <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs font-bold">
                          ✕
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                      <span className={`text-sm font-bold ${isConceded ? "line-through text-red-500/80" : "text-[var(--text)]"}`}>
                        {w.word}
                      </span>
                      <span className="text-[10px] text-[var(--text-mute)] uppercase tracking-wider">
                        ({w.category})
                      </span>
                    </div>

                    {/* Status Badge or Challenge Action */}
                    <div className="flex items-center gap-2">
                      {!w.disputeStatus || w.disputeStatus === "none" ? (
                        isOpposingTeam ? (
                          <button
                            type="button"
                            onClick={() => onDisputeWord(idx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 cursor-pointer transition"
                          >
                            <Flag className="w-3 h-3" /> Challenge Word
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600">
                            +1 Valid Point
                          </span>
                        )
                      ) : isDisputed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-500/15 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" /> Disputed by {w.disputedBy}
                        </span>
                      ) : isConceded ? (
                        <span className="text-[11px] font-bold text-red-500">
                          Voided (Confirmed by {w.concededBy})
                        </span>
                      ) : isRejected ? (
                        <span className="text-[11px] font-bold text-emerald-600">
                          Point Upheld (Dispute Contested)
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Checker Resolution Section for Describing Team */}
                  {isDisputed && isDescribingTeam && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <span className="text-xs text-[var(--text-dim)]">
                        Opponents challenged this word. Did your team legitimately articulate it?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onResolveDispute(idx, "concede")}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-500 transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <ThumbsDown className="w-3 h-3" /> Concede (-1 pt)
                        </button>
                        <button
                          type="button"
                          onClick={() => onResolveDispute(idx, "reject")}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <ThumbsUp className="w-3 h-3" /> Contest (Keep Point)
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {isDisputed && isOpposingTeam && (
                    <div className="mt-2 pt-2 border-t border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 italic">
                      ⏳ Challenge submitted. Awaiting confirmation/concession from the describing team.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-mute)] italic">No words were scored this round.</p>
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
