"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles, Volume2 } from "lucide-react";

interface RoundCountdownOverlayProps {
  count: number; // 3, 2, 1, or 0 (GO!)
  roundNumber: number;
  speakerName: string;
  activeTeamName: string;
  activeTeamColor: string;
  isSpeaker: boolean;
  myTeam?: "A" | "B" | null;
  activeTeam: "A" | "B";
  onDismiss?: () => void;
}

function playBeep(frequency: number, duration = 0.12) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio autoplay or permission denied; fail silently
  }
}

export default function RoundCountdownOverlay({
  count,
  roundNumber,
  speakerName,
  activeTeamName,
  activeTeamColor,
  isSpeaker,
  myTeam,
  activeTeam,
  onDismiss,
}: RoundCountdownOverlayProps) {
  const lastSoundCountRef = useRef<number | null>(null);
  const isTeammate = myTeam === activeTeam && !isSpeaker;

  // Sound effect & haptic feedback triggers on countdown ticks
  useEffect(() => {
    if (lastSoundCountRef.current === count) return;
    lastSoundCountRef.current = count;

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        if (count > 0) navigator.vibrate(25);
        else navigator.vibrate(60);
      } catch {}
    }

    if (count === 3) playBeep(440, 0.12);
    else if (count === 2) playBeep(440, 0.12);
    else if (count === 1) playBeep(520, 0.14);
    else if (count <= 0) playBeep(880, 0.22);
  }, [count]);

  // Safety: Guarantee overlay never stays stuck on screen for more than 4s under any circumstance
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss?.();
    }, 3800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const displayCount = count > 0 ? count : "GO!";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => onDismiss?.()}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none cursor-pointer touch-manipulation"
      title="Tap anywhere to skip countdown"
    >
      <div className="max-w-md w-full mx-auto flex flex-col items-center text-center space-y-6">
        {/* Round & Team Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-xs text-xs font-bold uppercase tracking-wider text-white/90 shadow-sm"
        >
          <span>Round {roundNumber}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <span style={{ color: activeTeamColor }}>{activeTeamName}</span>
        </motion.div>

        {/* Role Headline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="space-y-1"
        >
          {isSpeaker ? (
            <>
              <div className="inline-flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
                <Flame className="w-4 h-4 animate-bounce" />
                <span>You are on the mic!</span>
              </div>
              <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-white">
                Get Ready to Describe!
              </h2>
              <p className="text-xs text-white/70 max-w-xs mx-auto">
                No saying the word, rhyming words, or initial letters. Speak fast!
              </p>
            </>
          ) : isTeammate ? (
            <>
              <div className="inline-flex items-center gap-2 text-emerald-400 font-extrabold text-sm uppercase tracking-wider">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>{speakerName} is describing</span>
              </div>
              <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-white">
                Get Ready to Guess!
              </h2>
              <p className="text-xs text-white/70 max-w-xs mx-auto">
                Shout out guesses to your teammate through voice call or audio!
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 text-white/60 font-extrabold text-sm uppercase tracking-wider">
                <span>Opposing Team Turn</span>
              </div>
              <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-white">
                {speakerName} is Describing
              </h2>
              <p className="text-xs text-white/70 max-w-xs mx-auto">
                Listen carefully and make sure they follow the rules!
              </p>
            </>
          )}
        </motion.div>

        {/* Massive Animated Countdown Number with Concentric Shockwave Rings */}
        <div className="relative py-6 flex items-center justify-center">
          {/* Concentric Expanding Shockwave Rings */}
          <motion.div
            key={`ring-outer-${count}`}
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="absolute w-32 h-32 rounded-full border-2 border-white/50 pointer-events-none"
            style={{ borderColor: activeTeamColor }}
          />
          <motion.div
            key={`ring-inner-${count}`}
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
            className="absolute w-28 h-28 rounded-full border border-white/40 pointer-events-none"
          />

          <AnimatePresence mode="popLayout">
            <motion.div
              key={displayCount}
              initial={{ scale: 0.2, opacity: 0, y: 15, rotate: displayCount === "GO!" ? -5 : 0 }}
              animate={{ scale: [0.2, 1.25, 1], opacity: 1, y: 0, rotate: 0 }}
              exit={{ scale: 1.8, opacity: 0, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className={`font-space font-black tracking-tighter drop-shadow-2xl select-none ${
                displayCount === "GO!"
                  ? "text-7xl sm:text-8xl text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.6)] animate-pulse"
                  : "text-8xl sm:text-9xl text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              }`}
            >
              {displayCount}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Tip Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-[11px] text-white/60 tracking-wider font-semibold uppercase flex items-center justify-center gap-1.5"
        >
          <span>Tap anywhere to jump straight into round</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
