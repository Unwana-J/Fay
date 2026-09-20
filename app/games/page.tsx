"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";

export default function GamesHub() {
  const games = [
    {
      id: "articulate",
      title: "Online Articulate",
      description: "The classic fast-paced word describing party game. Play with friends in real-time.",
      mainEmoji: "🎭",
      bgEmoji1: "⏳",
      bgEmoji2: "💬",
      href: "/play",
      color: "var(--terra)",
      tags: ["Multiplayer", "Word Game", "Party"],
      isNew: false
    },
    {
      id: "trivia",
      title: "Naija Trivia",
      description: "Test your knowledge of Nigerian history, pop culture, and general knowledge in this fast quiz.",
      mainEmoji: "🇳🇬",
      bgEmoji1: "🧠",
      bgEmoji2: "🥁",
      href: "/games/trivia",
      color: "var(--olive)",
      tags: ["Trivia", "Culture", "Knowledge"],
      isNew: true
    }
  ];

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="font-space text-4xl font-bold mb-3" style={{ color: "var(--text)" }}>Games</h1>
        <p style={{ color: "var(--text-dim)" }}>Take a break and challenge your mind with these games.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game, i) => (
          <Link key={game.id} href={game.href}>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              className="relative h-full rounded-[2rem] p-8 flex flex-col surface border transition-shadow hover:shadow-lg cursor-pointer overflow-hidden group"
            >
              {/* Illustration Area */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden rounded-r-[2rem] pointer-events-none">
                <div 
                  className="absolute -right-12 -top-12 w-64 h-64 rounded-full blur-3xl opacity-15 transition-opacity group-hover:opacity-30" 
                  style={{ backgroundColor: game.color }} 
                />
                
                <motion.div 
                  className="absolute right-6 top-16 text-7xl drop-shadow-2xl z-10"
                  variants={{
                    hover: { scale: 1.15, rotate: [0, -8, 8, -4, 4, 0], transition: { duration: 0.6 } }
                  }}
                >
                  {game.mainEmoji}
                </motion.div>
                
                <motion.div 
                  className="absolute right-28 top-6 text-4xl opacity-50 drop-shadow-md blur-[1px]"
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {game.bgEmoji1}
                </motion.div>

                <motion.div 
                  className="absolute -right-2 top-36 text-5xl opacity-60 drop-shadow-md blur-[0.5px]"
                  animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  {game.bgEmoji2}
                </motion.div>
              </div>

              {/* Top Badge */}
              <div className="flex justify-between items-start mb-12 relative z-10">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm text-xl border"
                  style={{ backgroundColor: `${game.color}15`, color: game.color, borderColor: `${game.color}30` }}
                >
                  {game.mainEmoji}
                </div>
                {game.isNew && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white bg-black/90 shadow-sm">
                    <Sparkles size={10} /> New
                  </span>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 relative z-10 w-[65%]">
                <h2 className="font-space text-3xl font-extrabold mb-3 tracking-tight" style={{ color: "var(--text)" }}>
                  {game.title}
                </h2>
                <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-dim)" }}>
                  {game.description}
                </p>
              </div>

              {/* Bottom Footer */}
              <div className="flex items-center justify-between mt-auto relative z-10">
                <div className="flex flex-wrap gap-2 w-[80%]">
                  {game.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-[10px] font-bold tracking-wide uppercase px-2.5 py-1.5 rounded-lg border"
                      style={{ backgroundColor: "var(--bg)", borderColor: "var(--border-dim)", color: "var(--text-mute)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="w-10 h-10 rounded-full bg-[var(--text)] text-[var(--bg)] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
                  <ChevronRight size={16} strokeWidth={3} />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
