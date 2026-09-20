"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CheckCircle, XCircle, AlertTriangle, Loader2, Scale, Mic, MicOff, RotateCcw } from "lucide-react";
import { useAIReferee, type ValidationResult } from "@/lib/useAIReferee";
import { useSpeechInput } from "@/lib/useSpeechInput";

interface AIJudgePanelProps {
  targetWord: string;
  gameMode?: "classic" | "masterchef";
  colorA?: string;
  colorB?: string;
  onAccept?: (correct: boolean, team?: "A" | "B") => void;
}

export default function AIJudgePanel({
  targetWord,
  gameMode = "classic",
  colorA,
  colorB,
  onAccept
}: AIJudgePanelProps) {
  const { validateGuess, isValidating } = useAIReferee();
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [manualGuess, setManualGuess] = useState("");
  const [showManual, setShowManual] = useState(false);

  const targetWordRef = React.useRef(targetWord);
  useEffect(() => {
    targetWordRef.current = targetWord;
  }, [targetWord]);

  const { state, transcript, interim, isListening, isSupported, start, reset } = useSpeechInput({
    onFinalTranscript: async (text) => {
      // Auto-submit to Fey as soon as speech ends
      setResult(null);
      const res = await validateGuess(targetWordRef.current, text);
      setResult(res);
    },
  });

  const handleManualSubmit = async () => {
    if (!manualGuess.trim() || isValidating) return;
    setResult(null);
    const res = await validateGuess(targetWordRef.current, manualGuess);
    setResult(res);
  };

  const handleReset = () => {
    reset();
    setResult(null);
    setManualGuess("");
  };

  const displayText = transcript || interim || "";
  const confidencePct = result ? Math.round(result.confidence * 100) : 0;
  const verdictColor = result?.correct
    ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
    : "text-red-400 border-red-400/30 bg-red-400/10";

  return (
    <div className="rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-card)] p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[var(--olive)]/20 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-[var(--olive)]" />
        </div>
        <span className="text-[11px] font-space font-extrabold uppercase tracking-wider text-[var(--text-mute)]">
          Fey AI Referee
        </span>
        {(result || displayText) && (
          <button
            onClick={handleReset}
            className="ml-auto flex items-center gap-1 text-[10px] text-[var(--text-mute)] hover:text-[var(--text)] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {/* Main Mic Button */}
      {!result && (
        <div className="flex flex-col items-center gap-3 py-2">
          {/* Mic button */}
          <div className="relative">
            {/* Listening pulse rings */}
            {isListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[var(--olive)]/40"
                  animate={{ scale: [1, 1.5, 1.8], opacity: [0.6, 0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[var(--olive)]/30"
                  animate={{ scale: [1, 1.8, 2.2], opacity: [0.4, 0.2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                />
              </>
            )}

            <motion.button
              type="button"
              onClick={isListening ? undefined : start}
              whileTap={{ scale: 0.93 }}
              disabled={isValidating || state === "unsupported"}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer disabled:opacity-40 ${
                isListening
                  ? "bg-[var(--olive)] shadow-[0_0_20px_var(--olive)] border-2 border-[var(--olive)]/60"
                  : "bg-[var(--bg)] border-2 border-[var(--border-dim)] hover:border-[var(--olive)]/60 hover:bg-[var(--olive)]/5"
              }`}
            >
              {isValidating ? (
                <Loader2 className="w-6 h-6 animate-spin text-[var(--olive)]" />
              ) : isListening ? (
                <Mic className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-[var(--text-mute)]" />
              )}
            </motion.button>
          </div>

          {/* Status label */}
          <div className="text-center space-y-0.5">
            {state === "unsupported" ? (
              <p className="text-[11px] text-[var(--text-mute)]">
                Mic not supported — use text below
              </p>
            ) : isListening ? (
              <>
                <motion.p
                  className="text-xs font-space font-bold text-[var(--olive)]"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Listening…
                </motion.p>
                {interim && (
                  <p className="text-sm text-[var(--text-dim)] italic max-w-[200px] truncate">
                    "{interim}"
                  </p>
                )}
              </>
            ) : isValidating ? (
              <p className="text-[11px] text-[var(--text-mute)]">Fey is thinking…</p>
            ) : (
              <p className="text-[11px] text-[var(--text-mute)]">
                Tap mic, then say the player's guess
              </p>
            )}
          </div>

          {/* Transcript preview (after speech, before result) */}
          {displayText && !isListening && !isValidating && (
            <div className="w-full bg-[var(--bg)]/60 border border-[var(--border-dim)] rounded-xl px-3 py-2 text-center">
              <span className="text-xs text-[var(--text)] font-medium">"{displayText}"</span>
            </div>
          )}

          {/* Manual fallback toggle */}
          <button
            type="button"
            onClick={() => setShowManual((v) => !v)}
            className="text-[10px] text-[var(--text-mute)] hover:text-[var(--text)] underline underline-offset-2 cursor-pointer"
          >
            {showManual ? "Hide" : "Type manually instead"}
          </button>

          {/* Manual text input fallback */}
          <AnimatePresence>
            {showManual && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full flex gap-2 overflow-hidden"
              >
                <input
                  type="text"
                  value={manualGuess}
                  onChange={(e) => setManualGuess(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                  placeholder={"e.g. \"airplane\""}
                  className="flex-1 bg-[var(--bg)] border border-[var(--border-dim)] rounded-xl px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-mute)] focus:outline-none focus:border-[var(--olive)]/60"
                />
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualGuess.trim() || isValidating}
                  className="px-3 py-2 rounded-xl bg-[var(--olive)] text-white text-xs font-space font-bold disabled:opacity-40 cursor-pointer hover:brightness-110"
                >
                  <Scale className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl border p-3 space-y-2 ${verdictColor}`}
          >
            {/* Heard text */}
            {displayText && (
              <p className="text-[10px] opacity-60">
                Fey heard: <em>"{displayText}"</em>
              </p>
            )}

            {/* Verdict */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {result.correct ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="font-space font-extrabold text-sm">
                  {result.correct ? "Correct!" : "Incorrect"}
                </span>
                {result.phoneticMatch && (
                  <span className="text-[9px] font-space font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">
                    🔊 Phonetic match
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold opacity-70">{confidencePct}% confident</span>
            </div>

            {/* Confidence bar */}
            <div className="h-1 rounded-full bg-current/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-current"
                initial={{ width: 0 }}
                animate={{ width: `${confidencePct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>

            {/* Reason */}
            {result.reason && (
              <p className="text-[11px] opacity-80 leading-snug italic">"{result.reason}"</p>
            )}

            {/* Low confidence warning */}
            {result.confidence < 0.65 && (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                Low confidence — moderator call recommended.
              </div>
            )}

            {/* Accept/Override */}
            {onAccept && (
              <div className="flex gap-2 pt-1">
                {gameMode === "masterchef" && result.correct ? (
                  <>
                    <button
                      onClick={() => onAccept(true, "A")}
                      className="flex-1 py-1.5 rounded-lg text-white text-[11px] font-space font-bold transition-all cursor-pointer shadow-xs hover:brightness-110"
                      style={{ backgroundColor: colorA || "#EF4444" }}
                    >
                      ✓ Alpha
                    </button>
                    <button
                      onClick={() => onAccept(true, "B")}
                      className="flex-1 py-1.5 rounded-lg text-white text-[11px] font-space font-bold transition-all cursor-pointer shadow-xs hover:brightness-110"
                      style={{ backgroundColor: colorB || "#3B82F6" }}
                    >
                      ✓ Omega
                    </button>
                    <button
                      onClick={() => onAccept(false)}
                      className="px-2.5 py-1.5 rounded-lg border border-current/30 text-current text-[11px] font-space font-bold hover:bg-current/10 transition-all cursor-pointer"
                    >
                      Skip
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onAccept(result.correct)}
                      className="flex-1 py-1.5 rounded-lg bg-current/20 hover:bg-current/30 text-current text-[11px] font-space font-bold transition-all cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onAccept(!result.correct)}
                      className="flex-1 py-1.5 rounded-lg border border-current/30 text-current text-[11px] font-space font-bold hover:bg-current/10 transition-all cursor-pointer"
                    >
                      Override
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
