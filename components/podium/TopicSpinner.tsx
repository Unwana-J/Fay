"use client";

import { motion } from "framer-motion";
import { type PodiumTopic } from "@/lib/podium-types";

interface TopicSpinnerProps {
  topic: PodiumTopic;
}

export default function TopicSpinner({ topic }: TopicSpinnerProps) {
  return (
    <motion.div
      key={topic.id}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className="w-full max-w-lg mx-auto px-4 text-center"
    >
      {/* Vibe badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border"
        style={{
          background: "var(--gold)15",
          borderColor: "var(--gold)40",
          color: "var(--gold)",
        }}
      >
        {topic.vibe}
      </motion.div>

      {/* Main topic */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="font-space font-black text-4xl sm:text-5xl leading-[1.05] tracking-tight mb-4"
        style={{ color: "var(--text)" }}
      >
        {topic.text}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm uppercase tracking-[0.12em] font-semibold"
        style={{ color: "var(--text-mute)" }}
      >
        {topic.subtitle}
      </motion.p>
    </motion.div>
  );
}
