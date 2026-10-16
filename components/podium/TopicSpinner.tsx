"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type PodiumTopic } from "@/lib/podium-types";
import FeyLogo from "@/components/ui/FeyLogo";

interface TopicSpinnerProps {
  topic: PodiumTopic;
  isSpinning?: boolean;
}

export default function TopicSpinner({ topic, isSpinning = false }: TopicSpinnerProps) {
  return (
    <div className="w-full max-w-lg mx-auto px-4 text-center min-h-[260px] flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {isSpinning ? (
          <motion.div
            key="spinning"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="flex flex-col items-center justify-center gap-3 py-6"
          >
            {/* Spinning active ring around branded Fey logo */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--gold)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
              />
              <FeyLogo size={58} spinning={true} />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-[var(--gold)] animate-pulse block mb-1">
                Synthesizing Socratic Hot-Take...
              </span>
              <p className="text-xs text-[var(--text-mute)] h-4 truncate max-w-[240px]">
                {topic.text}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="w-full flex flex-col items-center"
          >
            {/* Branded Fey Butterfly Crest */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 20 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm mb-4"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-dim)",
              }}
            >
              <FeyLogo size={32} />
            </motion.div>

            {/* Vibe badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border"
              style={{
                background: "rgba(166,124,30,0.12)",
                borderColor: "rgba(166,124,30,0.3)",
                color: "var(--gold)",
              }}
            >
              {topic.vibe}
            </motion.div>

            {/* Main topic */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-space font-black text-3xl sm:text-5xl leading-[1.08] tracking-tight mb-3"
              style={{ color: "var(--text)" }}
            >
              {topic.text}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-xs sm:text-sm uppercase tracking-[0.14em] font-semibold"
              style={{ color: "var(--text-mute)" }}
            >
              {topic.subtitle}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
