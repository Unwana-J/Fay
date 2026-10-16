"use client";

import { motion } from "framer-motion";
import FeyLogo from "@/components/ui/FeyLogo";

export default function GlobalLoading() {
  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none"
      style={{ background: "transparent" }}
    >
      <div className="relative w-24 h-24 flex items-center justify-center mb-5">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--gold)] opacity-60"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <FeyLogo size={52} spinning={true} />
      </div>

      <motion.p
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--gold)] font-bold"
      >
        Think Deeper...
      </motion.p>
    </div>
  );
}
