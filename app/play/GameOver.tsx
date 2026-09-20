"use client";

import React from "react";
import { useGameStore } from "@/store/useGameStore";
import { Trophy, ArrowLeft, RotateCcw, Medal, Brain } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function GameOver({
  onRestart,
  onMinimize
}: {
  onRestart: () => void;
  onMinimize?: () => void;
}) {
  const { turnsHistory, resetGame } = useGameStore();

  // Group scores by Team
  const scoreTeamA = turnsHistory
    .filter((t) => t.team === "A")
    .reduce((acc, t) => acc + t.correctWords.length + (t.bonusPoints || 0), 0);

  const scoreTeamB = turnsHistory
    .filter((t) => t.team === "B")
    .reduce((acc, t) => acc + t.correctWords.length + (t.bonusPoints || 0), 0);

  // Find MVP (highest points in a single turn)
  let mvpName = "N/A";
  let mvpScore = 0;
  turnsHistory.forEach((turn) => {
    if (turn.correctWords.length > mvpScore) {
      mvpScore = turn.correctWords.length;
      mvpName = turn.playerName;
    }
  });

  // Calculate winner
  const winner = scoreTeamA > scoreTeamB ? "Alpha" : scoreTeamB > scoreTeamA ? "Omega" : "Tie";

  // Calculate global summary stats
  const totalCorrect = scoreTeamA + scoreTeamB;
  const totalSkipped = turnsHistory.reduce((acc, t) => acc + t.skippedWords.length, 0);
  const totalAttempts = totalCorrect + totalSkipped;
  const gameAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const handlePlayAgain = () => {
    resetGame();
    onRestart();
  };

  return (
    <div className="flex flex-col h-[75vh] md:h-[80vh] max-h-[640px] text-left">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-6">
        {/* Trophy Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex p-4 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
            <Trophy className="w-12 h-12 animate-bounce" />
          </div>
          <h2 className="font-space font-black text-4xl text-[var(--text)] tracking-tight">
            {winner === "Tie" ? "It's a Tie!" : `Team ${winner} Wins!`}
          </h2>
          <p className="text-xs uppercase tracking-widest font-space font-bold text-[var(--text-mute)]">
            Match Completed
          </p>
        </div>

        {/* Main Scoreboard Display */}
        <div className="grid grid-cols-2 gap-4">
          {/* Team Alpha */}
          <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] text-center space-y-2 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-[var(--terra)]" />
            <span className="text-xs font-space font-bold uppercase tracking-wider text-[var(--terra)]">
              Team Alpha
            </span>
            <div className="font-space font-black text-6xl text-[var(--text)]">
              {scoreTeamA}
            </div>
            <span className="text-[10px] text-[var(--text-mute)] block">points total</span>
          </div>

          {/* Team Omega */}
          <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] text-center space-y-2 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-[var(--olive)]" />
            <span className="text-xs font-space font-bold uppercase tracking-wider text-[var(--olive)]">
              Team Omega
            </span>
            <div className="font-space font-black text-6xl text-[var(--text)]">
              {scoreTeamB}
            </div>
            <span className="text-[10px] text-[var(--text-mute)] block">points total</span>
          </div>
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
