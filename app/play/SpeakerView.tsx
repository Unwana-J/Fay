"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import { CATEGORY_COLORS, CATEGORY_ICONS, buildDeck } from "@/lib/game-words";
import { Check, FastForward, AlertCircle, Timer, Pause, Bot, Mic, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import canvasConfetti from "canvas-confetti";
import { useFeyVoice } from "@/lib/useFeyVoice";
import { useAIReferee } from "@/lib/useAIReferee";
import { useSpeechInput } from "@/lib/useSpeechInput";
import AIJudgePanel from "@/components/ui/AIJudgePanel";

export default function SpeakerView({ onTimeUp }: { onTimeUp: (elapsed: number) => void }) {
  const {
    timerSeconds,
    deck,
    currentWordIndex,
    correctInCurrentTurn,
    skippedInCurrentTurn,
    recordCorrect,
    recordSkip,
    activeSpeaker,
    activeTeam,
    resetGame,
    spinnerModifier,
    gameMode,
    colorA,
    colorB,
    recordCorrectForTeam,
    challengeRestriction
  } = useGameStore();

  const totalSeconds = timerSeconds + (spinnerModifier === "extra-time" ? 15 : 0);

  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [feedback, setFeedback] = useState<"correct" | "skip" | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [violationText, setViolationText] = useState("");
  const [showViolationChecker, setShowViolationChecker] = useState(false);
  const [violationResult, setViolationResult] = useState<string | null>(null);
  const warned15Ref = useRef(false);
  const warned5Ref = useRef(false);
  const { announce } = useFeyVoice();
  const { aiRefereeEnabled, checkViolation, isCheckingViolation } = useAIReferee();
  const violationMic = useSpeechInput({
    onFinalTranscript: async (text) => {
      if (!currentWord) return;
      setViolationText(text);
      setViolationResult(null);
      const result = await checkViolation(currentWord.word, text);
      if (result) {
        setViolationResult(
          result.violation
            ? `⚠️ Violation: ${result.type.replace("-", " ")} — "${result.excerpt}"`
            : "✅ No violation detected."
        );
      }
    },
  });

  // Fire voice "Go!" when the turn begins
  useEffect(() => {
    const t = setTimeout(() => announce({ type: "turnStart" }), 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Safeguard: auto-replenish deck if current word index nears or exceeds deck length
  useEffect(() => {
    if (deck.length > 0 && currentWordIndex >= deck.length - 2) {
      const moreDeck = buildDeck(
        ["Object", "Nature", "Person", "Action", "World", "Random"],
        "mixed",
        30
      );
      useGameStore.setState((state) => ({ deck: [...state.deck, ...moreDeck] }));
    }
  }, [currentWordIndex, deck.length]);

  // Keyboard shortcut listeners (Space for Correct, Esc/Enter for Skip)
  useEffect(() => {
    if (isPaused) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        if (confirm("Are you sure you want to end this turn early?")) {
          onTimeUp(totalSeconds - timeLeft);
        }
        return;
      }
      if (gameMode === "masterchef") {
        if (e.code === "ArrowLeft" || e.code === "KeyA") {
          e.preventDefault();
          handleCorrectForTeam("A");
        } else if (e.code === "ArrowRight" || e.code === "KeyL") {
          e.preventDefault();
          handleCorrectForTeam("B");
        } else if (e.code === "Space") {
          e.preventDefault();
          handleSkip();
        }
      } else {
        if (e.code === "Space") {
          e.preventDefault();
          handleCorrect();
        } else if (e.code === "ArrowRight" || e.code === "Enter") {
          e.preventDefault();
          handleSkip();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentWordIndex, isPaused, gameMode]);

  // Main countdown timer
  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  // Handle timer completion side effects
  useEffect(() => {
    if (timeLeft === 0 && !isPaused) {
      triggerConfetti();
      const teamName = activeTeam === "A" ? "Alpha" : "Omega";
      announce({ type: "turnEnd", wordCount: correctInCurrentTurn.length, teamName });
      onTimeUp(totalSeconds);
    }
  }, [timeLeft, onTimeUp, totalSeconds, isPaused]);

  // Voice time warnings (15s and 5s)
  useEffect(() => {
    if (!isPaused) {
      if (timeLeft === 15 && !warned15Ref.current) {
        warned15Ref.current = true;
        announce({ type: "timeWarning", secondsLeft: 15 });
      }
      if (timeLeft === 5 && !warned5Ref.current) {
        warned5Ref.current = true;
        announce({ type: "timeWarning", secondsLeft: 5 });
      }
    }
  }, [timeLeft, isPaused]);

  const triggerConfetti = () => {
    canvasConfetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 },
      colors: ["#A67C1E", "#444E2C", "#8C6239", "#3B6360"]
    });
  };

  const handleCorrect = () => {
    setFeedback("correct");
    setTimeout(() => setFeedback(null), 150);
    announce({ type: "correct" });
    recordCorrect();
  };

  const handleCorrectForTeam = (team: "A" | "B") => {
    setFeedback("correct");
    setTimeout(() => setFeedback(null), 150);
    announce({ type: "correct" });
    recordCorrectForTeam(team);
  };

  const handleSkip = () => {
    setFeedback("skip");
    setTimeout(() => setFeedback(null), 150);
    announce({ type: "skip" });
    recordSkip();
  };

  const handleCheckViolation = async () => {
    if (!currentWord || !violationText.trim()) return;
    setViolationResult(null);
    const result = await checkViolation(currentWord.word, violationText);
    if (result) {
      setViolationResult(
        result.violation
          ? `⚠️ Violation: ${result.type.replace("-", " ")} — "${result.excerpt}"`
          : "✅ No violation detected."
      );
    }
  };

  const currentWord = deck[currentWordIndex];
  const progressPercent = (timeLeft / totalSeconds) * 100;
  const isTimeCritical = timeLeft <= 10;
  const isAlpha = activeTeam === "A";

  return (
    <div className="max-w-2xl mx-auto flex flex-col justify-between min-h-[75vh] px-4 py-6 relative">
      {/* Visual Flash Feedback Overlay */}
      <AnimatePresence>
        {feedback === "correct" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500 rounded-3xl pointer-events-none z-50"
          />
        )}
        {feedback === "skip" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-amber-500 rounded-3xl pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-[var(--border-dim)] pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-mute)] block">
            {gameMode === "masterchef" ? "Mode" : "Speaker"}
          </span>
          <span className="text-sm font-space font-bold text-[var(--text)]">
            {gameMode === "masterchef" ? "🎙️ Moderator (All-Play)" : activeSpeaker}
          </span>
        </div>

        {/* Custom Timer Ring display */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                className="stroke-[var(--border-dim)] fill-none"
                strokeWidth="3.5"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="20"
                className="fill-none"
                strokeWidth="3.5"
                strokeDasharray={2 * Math.PI * 20}
                animate={{ strokeDashoffset: (2 * Math.PI * 20) * (1 - timeLeft / totalSeconds) }}
                transition={{ duration: 0.35, ease: "linear" }}
                style={{ stroke: isTimeCritical ? "var(--terra)" : "var(--olive)" }}
              />
            </svg>
            <span
              className={`absolute font-space font-extrabold text-sm ${
                isTimeCritical ? "text-[var(--terra)] animate-pulse" : "text-[var(--text)]"
              }`}
            >
              {timeLeft}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[var(--text-mute)] block">Score</span>
            <span className="text-sm font-space font-bold text-[var(--text)]">{correctInCurrentTurn.length} pts</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to end this turn early?")) {
                onTimeUp(totalSeconds - timeLeft);
              }
            }}
            className="px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-600 dark:text-red-400 font-space font-extrabold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
            title="End Turn Early"
          >
            End Turn
          </button>

          <button
            type="button"
            onClick={() => setIsPaused(true)}
            className="p-2 rounded-xl border border-[var(--border-dim)] hover:bg-[var(--border-dim)]/20 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors cursor-pointer"
            title="Pause Turn"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[var(--bg)]/95 backdrop-blur-md rounded-[32px] p-6 flex flex-col justify-center items-center text-center space-y-6 z-50"
          >
            <div className="p-3 bg-[var(--terra)]/10 text-[var(--terra)] rounded-full">
              <Pause className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-space font-extrabold text-2xl text-[var(--text)]">Turn Paused</h3>
              <p className="text-xs text-[var(--text-dim)] max-w-xs mx-auto leading-relaxed">
                The game timer is paused and words are hidden.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 w-full max-w-xs pt-4">
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full py-3 bg-[var(--olive)] text-white rounded-xl font-space font-bold text-xs shadow-sm hover:opacity-90 cursor-pointer"
              >
                Resume Turn
              </button>
              
              <button
                type="button"
                onClick={() => onTimeUp(totalSeconds - timeLeft)}
                className="w-full py-3 bg-[var(--terra)] text-white rounded-xl font-space font-bold text-xs shadow-sm hover:opacity-90 cursor-pointer"
              >
                End Turn Early
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to end this game session? Progress will be lost.")) {
                    resetGame();
                  }
                }}
                className="w-full py-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-500 font-space font-bold text-xs transition-colors cursor-pointer"
              >
                Quit Game
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card View */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 gap-4 w-full">
        {challengeRestriction && (
          <div className="w-full max-w-md bg-pink-500/10 border border-pink-500/20 text-pink-700 dark:text-pink-400 rounded-2xl p-3.5 flex items-center gap-3 text-left animate-pulse shadow-xs shrink-0">
            <span className="text-xl">🧠</span>
            <div>
              <strong className="text-[10px] uppercase font-space font-black tracking-wider block">Challenge Space Active</strong>
              <span className="text-[9px] opacity-90 block leading-tight font-medium mt-0.5">
                {challengeRestriction}
              </span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {currentWord ? (
            <motion.div
              key={currentWord.word}
              initial={{ opacity: 0, x: 120, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: feedback === "correct" ? -120 : 0,
                x: feedback === "skip" ? -120 : 0,
                scale: 0.95,
                transition: { duration: 0.18 }
              }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              className="w-full max-w-md surface rounded-[32px] p-8 border border-[var(--border-dim)] shadow-md hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between min-h-[300px]"
            >
              {/* Category tag */}
              <div className="flex items-center gap-2 self-start">
                <span className="text-2xl">{CATEGORY_ICONS[currentWord.category]}</span>
                <span
                  className="text-[10px] font-space font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                  style={{
                    color: CATEGORY_COLORS[currentWord.category],
                    backgroundColor: `${CATEGORY_COLORS[currentWord.category]}12`,
                    border: `1.5px solid ${CATEGORY_COLORS[currentWord.category]}25`
                  }}
                >
                  {currentWord.category}
                </span>
              </div>

              {/* Main Word Title */}
              <div className="text-center py-6">
                <h3 className="font-space font-black text-3xl sm:text-4xl text-[var(--text)] tracking-tight">
                  {currentWord.word}
                </h3>
              </div>

              {/* Difficulty badge */}
              <div className="flex justify-between items-center text-xs text-[var(--text-mute)] pt-4 border-t border-[var(--border-dim)]/40">
                <span className="capitalize font-medium">Difficulty: {currentWord.difficulty}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider">Pass the phone rules active</span>
              </div>
            </motion.div>
          ) : (
            <div className="text-center space-y-3">
              <AlertCircle className="w-12 h-12 mx-auto text-[var(--text-mute)]" />
              <p className="text-sm text-[var(--text-dim)] font-medium">No more words in the deck!</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Buttons */}
      {gameMode === "masterchef" ? (
        <div className="flex flex-col gap-3 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Team Alpha Correct button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCorrectForTeam("A")}
              className="py-4 rounded-2xl text-white font-space font-extrabold flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-sm hover:shadow-md transition-all text-xs"
              style={{ backgroundColor: colorA }}
            >
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3px]" /> Alpha Guessed
              </div>
              <span className="text-[9px] opacity-80 font-normal">Keyboard: A / ←</span>
            </motion.button>

            {/* Team Omega Correct button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCorrectForTeam("B")}
              className="py-4 rounded-2xl text-white font-space font-extrabold flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-sm hover:shadow-md transition-all text-xs"
              style={{ backgroundColor: colorB }}
            >
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3px]" /> Omega Guessed
              </div>
              <span className="text-[9px] opacity-80 font-normal">Keyboard: L / →</span>
            </motion.button>
          </div>

          {/* Skip button centered below */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="w-full py-3 rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-card)]/40 hover:bg-[var(--border-dim)]/20 text-[var(--text)] font-space font-extrabold flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors text-xs"
          >
            <div className="flex items-center gap-1.5">
              <FastForward className="w-4 h-4 text-[var(--text-mute)]" /> Skip Card
            </div>
            <span className="text-[9px] text-[var(--text-mute)] font-normal">Keyboard: Space</span>
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 pb-4">
          {/* Skip button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="py-4 rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-card)]/40 hover:bg-[var(--border-dim)]/20 text-[var(--text)] font-space font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <FastForward className="w-5 h-5 text-[var(--text-mute)]" /> Skip
          </motion.button>

          {/* Correct button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCorrect}
            className="py-4 rounded-2xl text-white font-space font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all"
            style={{ backgroundColor: isAlpha ? "var(--terra)" : "var(--olive)" }}
          >
            <Check className="w-5 h-5 stroke-[3px]" /> Correct
          </motion.button>
        </div>
      )}

      {/* AI Judge Panel — shown when AI referee is enabled */}
      {aiRefereeEnabled && currentWord && (
        <div className="pb-2 space-y-3">
          <AIJudgePanel
            targetWord={currentWord.word}
            gameMode={gameMode}
            colorA={colorA}
            colorB={colorB}
            onAccept={(correct, team) => {
              if (correct) {
                if (gameMode === "masterchef") {
                  handleCorrectForTeam(team || "A");
                } else {
                  handleCorrect();
                }
              } else {
                handleSkip();
              }
            }}
          />

          {/* Violation Checker — mic-first */}
          <div className="rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-card)] p-4 space-y-2">
            <button
              type="button"
              onClick={() => setShowViolationChecker((v) => !v)}
              className="w-full flex items-center gap-2 text-[11px] font-space font-extrabold uppercase tracking-wider text-[var(--text-mute)] cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              Flag Rule Violation
              <span className={`ml-auto transition-transform ${showViolationChecker ? "rotate-180" : ""}`}>▾</span>
            </button>
            <AnimatePresence>
              {showViolationChecker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden pt-1"
                >
                  {/* Mic button row */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {violationMic.isListening && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-red-400/50"
                          animate={{ scale: [1, 1.6, 2], opacity: [0.6, 0.3, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={violationMic.isListening ? violationMic.stop : violationMic.start}
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
                          violationMic.isListening
                            ? "bg-red-500 border-red-400 shadow-[0_0_12px_#ef444460]"
                            : "bg-[var(--bg)] border-[var(--border-dim)] hover:border-red-400/50"
                        }`}
                      >
                        <Mic className={`w-4 h-4 ${violationMic.isListening ? "text-white" : "text-[var(--text-mute)]"}`} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      {violationMic.isListening ? (
                        <motion.p
                          className="text-[11px] font-space font-bold text-red-400"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          Listening to speaker…
                        </motion.p>
                      ) : violationText ? (
                        <p className="text-xs text-[var(--text)] truncate">"{violationText}"</p>
                      ) : (
                        <p className="text-[11px] text-[var(--text-mute)]">Tap mic, then repeat what the speaker said</p>
                      )}
                      {violationMic.interim && (
                        <p className="text-[11px] text-[var(--text-dim)] italic truncate">{violationMic.interim}…</p>
                      )}
                    </div>
                    {isCheckingViolation && <Loader2 className="w-4 h-4 animate-spin text-[var(--text-mute)] flex-shrink-0" />}
                  </div>

                  {violationResult && (
                    <p className={`text-[11px] rounded-lg px-3 py-2 ${
                      violationResult.startsWith("⚠")
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    }`}>{violationResult}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Keyboard cues */}
      <div className="text-center text-[10px] text-[var(--text-mute)] font-medium">
        {gameMode === "masterchef" ? (
          <span>Keyboard: <kbd className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-dim)]">A</kbd> or <kbd className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-dim)]">←</kbd> for Alpha • <kbd className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-dim)]">L</kbd> or <kbd className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-dim)]">→</kbd> for Omega • <kbd className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-dim)]">Space</kbd> to Skip</span>
        ) : (
          <span>Keyboard: <kbd className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-dim)]">Space</kbd> for Correct • <kbd className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-dim)]">Enter</kbd> or <kbd className="bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-dim)]">→</kbd> to Skip</span>
        )}
      </div>
    </div>
  );
}
