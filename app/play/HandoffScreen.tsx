"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { useFeyVoice } from "@/lib/useFeyVoice";
import { useGameStore } from "@/store/useGameStore";

export default function HandoffScreen({
  speakerName,
  teamLabel,
  specialSpaceType,
  challengeRestriction,
  onReady,
  onMinimize,
  gameMode = "classic"
}: {
  speakerName: string;
  teamLabel: "Alpha" | "Omega";
  specialSpaceType: "chance" | "double" | "challenge" | null;
  challengeRestriction: string | null;
  onReady: () => void;
  onMinimize?: () => void;
  gameMode?: "classic" | "masterchef";
}) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const { announce } = useFeyVoice();
  const { timerSeconds } = useGameStore();

  // Announce who's up as soon as the handoff screen appears
  useEffect(() => {
    const t = setTimeout(() => {
      announce({ type: "handoff", speakerName, timerSeconds, gameMode });
    }, 600); // slight delay so screen is visible first
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      onReady();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onReady]);

  const handleStartCountdown = () => {
    setCountdown(3);
  };

  const isAlpha = teamLabel === "Alpha";
  const isMasterchef = gameMode === "masterchef";

  return (
    <div className="max-w-md mx-auto text-center flex flex-col items-center px-4 py-6 gap-6">
      <AnimatePresence mode="wait">
        {countdown === null ? (
          <motion.div
            key="handoff"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            {/* Animated Ring Decorator */}
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-dashed"
                style={{ borderColor: isMasterchef ? "var(--text-mute)" : isAlpha ? "var(--terra)" : "var(--olive)" }}
              />
              <span className="text-4xl">{isMasterchef ? "🎬" : isAlpha ? "🔥" : "🌱"}</span>
            </div>

            <div className="space-y-2">
              {/* Only show team badge in classic mode */}
              {!isMasterchef && (
                <span
                  className="text-xs uppercase font-space font-extrabold tracking-widest px-3 py-1 rounded-full border"
                  style={{
                    color: isAlpha ? "var(--terra)" : "var(--olive)",
                    borderColor: isAlpha ? "var(--terra-dim)" : "var(--olive-dim)",
                    backgroundColor: isAlpha ? "rgba(166,124,30,0.06)" : "rgba(68,78,44,0.06)"
                  }}
                >
                  Team {teamLabel}
                </span>
              )}
              {isMasterchef && (
                <span className="text-xs uppercase font-space font-black tracking-widest px-3.5 py-1 rounded-full bg-[#4E5460] text-white shadow-xs inline-flex items-center gap-1.5">
                  🎙️ Moderator Mode
                </span>
              )}
              <h2 className="font-space font-extrabold text-3xl text-[var(--text)] tracking-tight">
                {isMasterchef ? "Ready to Play?" : "Pass the Phone"}
              </h2>
              <p className="text-sm text-[var(--text-dim)] max-w-xs mx-auto leading-relaxed">
                {isMasterchef ? (
                  <>
                    Click <strong className="text-[var(--text)]">Start Turn</strong> to reveal words. Award a point to whichever team gets it right!
                  </>
                ) : (
                  <>
                    Hand the screen to <strong className="text-[var(--text)]">{speakerName}</strong>. Everyone else, look away!
                  </>
                )}
              </p>
            </div>

            {/* Special Space Landing Alert Card */}
            {specialSpaceType && (
              <div className="w-full max-w-sm rounded-2xl border p-4 text-left space-y-1.5 shadow-sm"
                style={{
                  backgroundColor: specialSpaceType === "double"
                    ? "rgba(166,124,30,0.08)"
                    : specialSpaceType === "challenge"
                    ? "rgba(236,72,153,0.08)"
                    : "rgba(78,84,96,0.08)",
                  borderColor: specialSpaceType === "double"
                    ? "var(--terra-dim)"
                    : specialSpaceType === "challenge"
                    ? "rgba(236,72,153,0.3)"
                    : "var(--border-dim)"
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg animate-bounce">
                    {specialSpaceType === "double" ? "🔥" : specialSpaceType === "challenge" ? "🧠" : "🎲"}
                  </span>
                  <strong className="text-xs uppercase font-space font-black tracking-wide"
                    style={{
                      color: specialSpaceType === "double"
                        ? "var(--terra)"
                        : specialSpaceType === "challenge"
                        ? "rgb(236,72,153)"
                        : "var(--text)"
                    }}
                  >
                    {specialSpaceType === "double" ? "Double Move Space Active!" : specialSpaceType === "challenge" ? "Challenge Space Active!" : "Chance Space Active!"}
                  </strong>
                </div>
                <p className="text-[10px] text-[var(--text-dim)] leading-tight font-medium">
                  {specialSpaceType === "double"
                    ? "Points earned during this turn will count DOUBLE on the board path!"
                    : specialSpaceType === "challenge"
                    ? `SPEAKING CONSTRAINT ACTIVE: "${challengeRestriction}"`
                    : "Landing on Chance activates the Spinner Wheel! Continue to spin for a modifier."}
                </p>
              </div>
            )}

            <div className="w-full max-w-xs flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={specialSpaceType === "chance" ? onReady : handleStartCountdown}
                className="w-full py-4 px-6 rounded-2xl text-white font-space font-extrabold shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                style={{ backgroundColor: isMasterchef ? "#4E5460" : isAlpha ? "var(--terra)" : "var(--olive)" }}
              >
                {specialSpaceType === "chance" ? (
                  <>Spin the Wheel 🎲</>
                ) : isMasterchef ? (
                  <>Start Turn <Play className="w-4 h-4 fill-current" /></>
                ) : (
                  <>I Have The Phone <Play className="w-4 h-4 fill-current" /></>
                )}
              </motion.button>

              {onMinimize && (
                <button
                  type="button"
                  onClick={onMinimize}
                  className="w-full py-2.5 rounded-xl border border-[var(--border-dim)] bg-[var(--border-dim)]/30 hover:bg-[var(--border-dim)]/60 text-[var(--text)] font-space font-bold text-xs transition-colors cursor-pointer"
                >
                  👁️ Peek at Board
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="countdown"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-6 py-12"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="text-9xl font-space font-extrabold"
              style={{ color: isAlpha ? "var(--terra)" : "var(--olive)" }}
            >
              {countdown}
            </motion.div>
            <div className="text-xs uppercase tracking-widest font-space font-bold text-[var(--text-mute)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Get Ready...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

