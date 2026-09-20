"use client";

import React, { useState, useCallback } from "react";
import { useGameStore } from "@/store/useGameStore";
import SetupScreen from "./SetupScreen";
import HandoffScreen from "./HandoffScreen";
import SpeakerView from "./SpeakerView";
import RoundResults from "./RoundResults";
import GameOver from "./GameOver";
import SpinnerView from "./SpinnerView";
import { motion, AnimatePresence } from "framer-motion";

import BoardMap from "./BoardMap";
import { type GamePhase } from "@/store/useGameStore";

const stageVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export default function PlayPage() {
  const [overlayHidden, setOverlayHidden] = useState(false);
  const {
    activeSpeaker,
    activeTeam,
    startTurn,
    endTurn,
    currentRoundIndex,
    numberOfRounds,
    colorA,
    colorB,
    scoreGoal,
    phase,
    setPhase,
    resetGame,
    setSpinnerModifier,
    applyImmediateSpinnerAdvance,
    challengeRestriction,
    gameMode,
    getScore
  } = useGameStore();

  const scoreA = getScore("A");
  const scoreB = getScore("B");

  const handleStartGame = useCallback(() => {
    // Game store initialized via setup, triggers first handoff
    startTurn();
    setOverlayHidden(false);
    // setPhase("handoff") is handled by startGame()/startTurn() inside store
  }, [startTurn]);

  const handleTurnReady = useCallback(() => {
    setOverlayHidden(false);

    // Read live store scores at call-time to avoid stale closure
    const { getScore: liveGetScore, activeTeam: liveActiveTeam, scoreGoal: liveScoreGoal } = useGameStore.getState();
    const liveScore = liveGetScore(liveActiveTeam ?? "A");
    const isChanceTile = liveScore > 0 && liveScore < liveScoreGoal - 1 && liveScore % 7 === 4;

    if (isChanceTile) {
      setPhase("spinner");
    } else {
      setPhase("playing");
    }
  }, [setPhase]);

  const handleTimeUp = useCallback((elapsedSeconds: number) => {
    // End active turn, update history, and route to result card
    endTurn(elapsedSeconds);
    setOverlayHidden(false);
    // setPhase("results") is handled by endTurn() inside store
  }, [endTurn]);

  const handleNextTurn = useCallback(() => {
    // Prep next speaker in line
    startTurn();
    setOverlayHidden(false);
    // setPhase("handoff") is handled by startTurn() inside store
  }, [startTurn]);

  const handleGameOver = useCallback(() => {
    setOverlayHidden(false);
    setPhase("gameover");
  }, [setPhase]);

  const handleRestart = useCallback(() => {
    setOverlayHidden(false);
    resetGame();
  }, [resetGame]);

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto flex flex-col justify-center gap-6 relative">
      {phase === "setup" ? (
        <SetupScreen onStart={handleStartGame} />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[var(--border-dim)]/40 pb-3">
            <div>
              <h2 className="font-space font-extrabold text-2xl text-[var(--text)]">Fey Journey Map</h2>
              <p className="text-xs text-[var(--text-dim)]">Track your team's progress to the finish line!</p>
            </div>
            <button
              onClick={() => {
                if (confirm("End this game session? All progress will be reset.")) {
                  resetGame();
                }
              }}
              className="px-3.5 py-2 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-500 text-xs font-space font-bold transition-all cursor-pointer"
            >
              End Session
            </button>
          </div>

          {/* Persistent Journey Board and Left Guide */}
          <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
            {/* Left Column: Category Guide */}
            <div className="w-full lg:w-64 shrink-0 surface rounded-3xl p-5 border border-[var(--border-dim)] space-y-5">
              <div>
                <h3 className="font-space font-extrabold text-[10px] text-[var(--text)] tracking-wider uppercase">Category Legend</h3>
                <p className="text-[9px] text-[var(--text-mute)] leading-relaxed mt-1">
                  The active space color dictates the cards you describe next.
                </p>
              </div>

              {/* Color Categories List */}
              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md border" style={{ backgroundColor: "#8C6239", borderColor: "#8C6239" }} />
                  <span className="text-[var(--text-dim)] font-medium">📦 Object</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md border" style={{ backgroundColor: "#3B6360", borderColor: "#3B6360" }} />
                  <span className="text-[var(--text-dim)] font-medium">🌿 Nature</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md border" style={{ backgroundColor: "#5A4565", borderColor: "#5A4565" }} />
                  <span className="text-[var(--text-dim)] font-medium">👤 Person</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md border" style={{ backgroundColor: "#A67C1E", borderColor: "#A67C1E" }} />
                  <span className="text-[var(--text-dim)] font-medium">⚡ Action</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md border" style={{ backgroundColor: "#4E5460", borderColor: "#4E5460" }} />
                  <span className="text-[var(--text-dim)] font-medium">🌍 World</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-md border" style={{ backgroundColor: "#6B4C7A", borderColor: "#6B4C7A" }} />
                  <span className="text-[var(--text-dim)] font-medium">🎲 Random</span>
                </div>
              </div>

              {/* Special Spaces List */}
              <div className="border-t border-[var(--border-dim)]/40 pt-4 space-y-2.5">
                <h4 className="font-space font-extrabold text-[10px] text-[var(--text)] tracking-wider uppercase">Special Spaces</h4>
                <div className="flex items-start gap-3 text-xs leading-tight">
                  <span className="text-sm">🎲</span>
                  <div>
                    <span className="font-bold text-[var(--text)] block text-[10px]">Chance</span>
                    <span className="text-[9px] text-[var(--text-mute)]">Spin virtual modifier wheel</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs leading-tight">
                  <span className="text-sm">🔥</span>
                  <div>
                    <span className="font-bold text-[var(--text)] block text-[10px]">Double Move</span>
                    <span className="text-[9px] text-[var(--text-mute)]">Next turn points count double</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs leading-tight">
                  <span className="text-sm">⭐</span>
                  <div>
                    <span className="font-bold text-[var(--text)] block text-[10px]">Bonus</span>
                    <span className="text-[9px] text-[var(--text-mute)]">Get +1 extra point advantage</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs leading-tight">
                  <span className="text-sm">🧠</span>
                  <div>
                    <span className="font-bold text-[var(--text)] block text-[10px]">Challenge</span>
                    <span className="text-[9px] text-[var(--text-mute)]">Special speaking restrictions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Board Map */}
            <div className="flex-1 w-full overflow-x-auto">
              <BoardMap
                scoreA={scoreA}
                scoreB={scoreB}
                scoreGoal={scoreGoal}
                colorA={colorA}
                colorB={colorB}
                activeTeam={activeTeam}
                gameMode={gameMode}
              />
            </div>
          </div>

          {/* Focused Popups / Overlays */}
          <AnimatePresence>
            {!overlayHidden && phase === "handoff" && activeSpeaker && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-40" onClick={() => setOverlayHidden(true)}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className="w-full max-w-md bg-[var(--bg)] rounded-3xl p-6 border border-[var(--border-dim)] shadow-xl relative overflow-y-auto max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(() => {
                    const currentTeamScore = activeTeam === "A" ? scoreA : scoreB;
                    const isChance = currentTeamScore > 0 && currentTeamScore < scoreGoal - 1 && currentTeamScore % 7 === 4;
                    const isDouble = currentTeamScore > 0 && currentTeamScore < scoreGoal - 1 && currentTeamScore % 7 === 2;
                    const isChallenge = currentTeamScore > 0 && currentTeamScore < scoreGoal - 1 && currentTeamScore % 7 === 5;
                    const specialSpaceType = isChance ? "chance" : isDouble ? "double" : isChallenge ? "challenge" : null;

                    return (
                      <HandoffScreen
                        speakerName={activeSpeaker}
                        teamLabel={activeTeam === "A" ? "Alpha" : "Omega"}
                        specialSpaceType={specialSpaceType}
                        challengeRestriction={challengeRestriction}
                        onReady={handleTurnReady}
                        onMinimize={() => setOverlayHidden(true)}
                        gameMode={gameMode}
                      />
                    );
                  })()}
                </motion.div>
              </div>
            )}

            {!overlayHidden && phase === "spinner" && activeTeam && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-40" onClick={() => setOverlayHidden(true)}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className="w-full max-w-md bg-[var(--bg)] rounded-3xl p-6 border border-[var(--border-dim)] shadow-xl relative overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SpinnerView
                    activeTeam={activeTeam}
                    teamColor={activeTeam === "A" ? colorA : colorB}
                    onComplete={(modifier, targetTeam, spaces, label) => {
                      if (modifier !== "none") {
                        setSpinnerModifier(modifier);
                      }
                      if (spaces !== 0) {
                        applyImmediateSpinnerAdvance(targetTeam, spaces, label);
                      }
                      // Check if the advance immediately won the game (positive spaces to active team)
                      const updatedScore = useGameStore.getState().getScore(targetTeam);
                      const liveGoal = useGameStore.getState().scoreGoal;
                      if (spaces > 0 && updatedScore >= liveGoal) {
                        setPhase("gameover");
                      } else {
                        setPhase("playing");
                      }
                    }}
                  />
                </motion.div>
              </div>
            )}

            {!overlayHidden && phase === "playing" && (
              <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 z-40" onClick={() => setOverlayHidden(true)}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className="w-full max-w-2xl bg-[var(--bg)] rounded-[32px] p-6 border border-[var(--border-dim)] shadow-xl relative overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SpeakerView onTimeUp={handleTimeUp} />
                </motion.div>
              </div>
            )}

            {!overlayHidden && phase === "results" && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-40" onClick={() => setOverlayHidden(true)}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className="w-full max-w-3xl bg-[var(--bg)] rounded-[32px] p-6 border border-[var(--border-dim)] shadow-xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <RoundResults
                    onNextTurn={handleNextTurn}
                    onGameOver={handleGameOver}
                    onMinimize={() => setOverlayHidden(true)}
                  />
                </motion.div>
              </div>
            )}

            {!overlayHidden && phase === "gameover" && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-40" onClick={() => setOverlayHidden(true)}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className="w-full max-w-3xl bg-[var(--bg)] rounded-[32px] p-6 border border-[var(--border-dim)] shadow-xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GameOver
                    onRestart={handleRestart}
                    onMinimize={() => setOverlayHidden(true)}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Floating Action Bar to Resume Game */}
          {overlayHidden && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-dim)] px-6 py-4 rounded-full shadow-lg flex items-center gap-4 z-50 animate-pulse"
            >
              <span className="text-xs font-space font-bold text-[var(--text)]">Reviewing Board</span>
              <button
                onClick={() => setOverlayHidden(false)}
                className="bg-[var(--olive)] text-white text-xs font-space font-extrabold px-4 py-2 rounded-full hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
              >
                Resume Game
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
