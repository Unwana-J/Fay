"use client";

import React from "react";
import { useGameStore } from "@/store/useGameStore";
import { Trophy, ArrowLeft, RotateCcw, Medal, Brain } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import ScholarTrophy from "@/components/ui/ScholarTrophy";

export default function GameOver({
  onRestart,
  onMinimize
}: {
  onRestart: () => void;
  onMinimize?: () => void;
}) {
  const { turnsHistory, resetGame, getActiveTeams, getScore } = useGameStore();

  const activeTeams = getActiveTeams();

  // Compute scores and rank teams descending
  const teamRankings = activeTeams
    .map((t) => ({
      ...t,
      score: getScore(t.id),
    }))
    .sort((a, b) => b.score - a.score);

  const highestScore = teamRankings[0]?.score || 0;
  const topTeams = teamRankings.filter((t) => t.score === highestScore);
  const isTie = topTeams.length > 1;

  const winner = isTie ? "Tie" : teamRankings[0]?.name || "Scholars";
  const winnerColor = isTie ? "#F59E0B" : teamRankings[0]?.color || "#F59E0B";

  // Find MVP (highest net points in a single turn)
  let mvpName = "N/A";
  let mvpScore = 0;
  turnsHistory.forEach((turn) => {
    const net = Math.max(
      0,
      turn.correctWords.length - (turn.disputedWords?.length || 0) + (turn.awardedWords?.length || 0)
    );
    if (net > mvpScore) {
      mvpScore = net;
      mvpName = turn.playerName;
    }
  });

  // Calculate global summary stats across all active teams
  const totalCorrect = teamRankings.reduce((sum, t) => sum + t.score, 0);
  const totalSkipped = turnsHistory.reduce((acc, t) => acc + t.skippedWords.length, 0);
  const totalAttempts = totalCorrect + totalSkipped;
  const gameAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const handlePlayAgain = () => {
    resetGame();
    onRestart();
  };

  const formattedWinnerName = winner === "Tie" ? "Scholars" : winner.toLowerCase().startsWith("team") ? winner : `Team ${winner}`;

  const gridColsClass =
    teamRankings.length === 2
      ? "grid-cols-2"
      : teamRankings.length === 3
      ? "grid-cols-3"
      : "grid-cols-2 sm:grid-cols-4";

  const RANK_BADGES = ["🥇 1st", "🥈 2nd", "🥉 3rd", "🎖️ 4th"];

  return (
    <div className="flex flex-col h-[75vh] md:h-[80vh] max-h-[640px] text-left">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-6">
        {/* Trophy Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="flex justify-center">
            <ScholarTrophy
              winnerColor={winnerColor}
              teamName={formattedWinnerName}
              size={170}
            />
          </div>
          <h2 className="font-space font-black text-4xl text-[var(--text)] tracking-tight">
            {winner === "Tie" ? "It's a Tie!" : `${formattedWinnerName} Wins!`}
          </h2>
          <p className="text-xs uppercase tracking-widest font-space font-bold text-[var(--text-mute)]">
            Match Completed
          </p>
        </div>

        {/* Main Scoreboard Display (Supports up to 4 teams) */}
        <div className={`grid ${gridColsClass} gap-3 sm:gap-4`}>
          {teamRankings.map((t, idx) => (
            <div
              key={t.id}
              className="surface rounded-3xl p-5 sm:p-6 border border-[var(--border-dim)] text-center space-y-2 relative overflow-hidden shadow-xs"
            >
              <div className="absolute top-0 inset-x-0 h-1.5" style={{ backgroundColor: t.color }} />
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text-dim)]">
                  {RANK_BADGES[idx] || `${idx + 1}th`}
                </span>
                <span className="text-[11px] font-space font-bold uppercase tracking-wider truncate" style={{ color: t.color }}>
                  {t.name}
                </span>
              </div>
              <div className="font-space font-black text-4xl sm:text-5xl lg:text-6xl text-[var(--text)] pt-1">
                {t.score}
              </div>
              <span className="text-[10px] text-[var(--text-mute)] block font-mono">points total</span>
            </div>
          ))}
        </div>

        {/* Highlights & MVP section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side: Game highlights */}
          <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-[var(--text-mute)] pb-2 border-b border-[var(--border-dim)]/40 flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-amber-500" /> Match Honors
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-mute)]">MVP Speaker</span>
                <span className="font-space font-bold text-[var(--text)]">{mvpName} ({mvpScore} pts)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-mute)] font-medium">Total Words Explained</span>
                <span className="font-space font-bold text-[var(--text)]">{totalCorrect}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-mute)] font-medium">Total Words Skipped</span>
                <span className="font-space font-bold text-[var(--text)]">{totalSkipped}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-mute)] font-medium">Guessing Accuracy</span>
                <span className="font-space font-bold text-[var(--text)]">{gameAccuracy}%</span>
              </div>
            </div>
          </div>

          {/* Right Side: Aggregate AI insights */}
          <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-[var(--text-mute)] pb-2 border-b border-[var(--border-dim)]/40 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-[var(--terra)]" /> Aggregate AI Review
            </h3>

            <div className="text-xs space-y-3 leading-relaxed text-[var(--text-dim)]">
              <p>
                Both teams demonstrated a strong speaking rate of around <strong>9.2 words/min</strong>, showing clear structural clarity and quick word retrieval.
              </p>
              <p className="italic">
                “Coaching tip: To increase speed, avoid starting clues by spelling or using narrow synonyms. Rely on action/gestures logic and broad category comparisons.”
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer Action Buttons */}
      <div className="pt-4 border-t border-[var(--border-dim)]/40 bg-[var(--bg)] flex flex-col gap-3 shrink-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1">
            <button className="w-full py-4 rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-card)]/40 hover:bg-[var(--border-dim)]/20 text-[var(--text)] font-space font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Home Dashboard
            </button>
          </Link>

          <button
            onClick={handlePlayAgain}
            className="flex-grow py-4 rounded-2xl text-white font-space font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all text-sm"
            style={{ backgroundColor: "var(--olive)" }}
          >
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>

        {onMinimize && (
          <button
            type="button"
            onClick={onMinimize}
            className="w-full py-2.5 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--border-dim)]/30 text-[var(--text)] font-space font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            👁️ Peek at Final Board
          </button>
        )}
      </div>
    </div>
  );
}
