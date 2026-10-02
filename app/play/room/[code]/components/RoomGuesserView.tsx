"use client";

import React, { useState } from "react";
import { ArticulateRoom, RoomPlayer } from "@/lib/articulate-room";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/game-words";
import BoardMap from "@/app/play/BoardMap";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RoomGuesserViewProps {
  room: ArticulateRoom;
  secondsRemaining: number;
  myPlayerId: string;
  myTeam?: "A" | "B" | null;
  onSendReaction: (emoji: string) => void;
  speakerName?: string;
  presencePlayers?: RoomPlayer[];
  knownNames?: Record<string, { name: string; avatar: string }>;
}

export default function RoomGuesserView({
  room,
  secondsRemaining,
  myPlayerId,
  myTeam,
  onSendReaction,
  speakerName,
  presencePlayers = [],
  knownNames = {},
}: RoomGuesserViewProps) {
  const [showBoard, setShowBoard] = useState(false);
  const [flyingReactions, setFlyingReactions] = useState<{ id: number; emoji: string; xOffset: number }[]>([]);
  const currentTurn = room.current_turn;
  const currentWord = room.deck?.[room.current_word_index];
  const isUrgent = secondsRemaining <= 15;

  const handleReactionTap = (emoji: string) => {
    try {
      navigator.vibrate?.(10);
    } catch {}
    
    // Spawn floating emoji particle
    const reactionId = Date.now() + Math.random();
    const randomOffset = (Math.random() - 0.5) * 160;
    setFlyingReactions((prev) => [...prev.slice(-8), { id: reactionId, emoji, xOffset: randomOffset }]);
    setTimeout(() => {
      setFlyingReactions((prev) => prev.filter((r) => r.id !== reactionId));
    }, 1200);

    onSendReaction(emoji);
  };

  const speakerId = currentTurn?.speakerId;
  const rawSpeakerName = speakerName || currentTurn?.speakerName;
  const resolvedSpeakerName =
    rawSpeakerName &&
    rawSpeakerName !== "Scholar" &&
    rawSpeakerName !== "Learner" &&
    !rawSpeakerName.startsWith("Scholar (")
      ? rawSpeakerName
      : speakerId
      ? room.player_details?.[speakerId]?.name &&
        room.player_details[speakerId].name !== "Scholar" &&
        !room.player_details[speakerId].name.startsWith("Scholar (")
        ? room.player_details[speakerId].name
        : presencePlayers?.find((p) => p.id === speakerId)?.name &&
          presencePlayers.find((p) => p.id === speakerId)!.name !== "Scholar" &&
          !presencePlayers.find((p) => p.id === speakerId)!.name.startsWith("Scholar (")
        ? presencePlayers.find((p) => p.id === speakerId)!.name
        : knownNames?.[speakerId]?.name &&
          knownNames[speakerId].name !== "Scholar" &&
          !knownNames[speakerId].name.startsWith("Scholar (")
        ? knownNames[speakerId].name
        : speakerId === room.host_id && room.host_name && room.host_name !== "Scholar"
        ? room.host_name
        : rawSpeakerName || "Scholar"
      : rawSpeakerName || "Scholar";

  const isMyTeam =
    myTeam
      ? myTeam === currentTurn?.activeTeam
      : currentTurn?.activeTeam === "A"
      ? (room.teams?.teamA?.playerIds || []).includes(myPlayerId)
      : (room.teams?.teamB?.playerIds || []).includes(myPlayerId);

  const activeTeamName =
    currentTurn?.activeTeam === "B"
      ? room.teams?.teamB?.name || "Team Omega"
      : room.teams?.teamA?.name || "Team Alpha";

  const activeTeamColor =
    currentTurn?.activeTeam === "B"
      ? room.teams?.teamB?.color || "#3B82F6"
      : room.teams?.teamA?.color || "#EF4444";

  return (
    <div className="max-w-md mx-auto space-y-5 text-center relative">
      {/* Floating Reaction Particles */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {flyingReactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 1, y: "85vh", x: `calc(50vw + ${r.xOffset}px)`, scale: 0.8, rotate: 0 }}
              animate={{
                opacity: 0,
                y: "25vh",
                x: `calc(50vw + ${r.xOffset + (Math.random() - 0.5) * 60}px)`,
                scale: 1.8,
                rotate: (Math.random() - 0.5) * 35,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute text-4xl select-none"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Speaker Banner */}
      <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: activeTeamColor }} />
          <span>{resolvedSpeakerName} describing for <strong style={{ color: activeTeamColor }}>{activeTeamName}</strong></span>
        </div>
        <span className="text-[11px] text-[var(--olive)] uppercase tracking-wider font-extrabold">
          {isMyTeam ? "🎯 Guess!" : "👀 Watch"}
        </span>
      </div>

      {/* Countdown Timer with glowing aura */}
      <motion.div
        animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-space font-extrabold text-3xl border transition-colors shadow-sm ${
          isUrgent
            ? "bg-red-500/15 border-red-500 text-red-500 shadow-red-500/20 shadow-md"
            : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)]"
        }`}
      >
        <Clock className="w-5 h-5" />
        <span>{secondsRemaining}s</span>
      </motion.div>

      {/* Category Hint & Score Card */}
      <div className="surface rounded-3xl p-6 sm:p-8 border border-[var(--border-dim)] shadow-sm space-y-4">
        {currentWord && (
          <motion.div
            key={currentWord.category}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: CATEGORY_COLORS[currentWord.category] || "var(--olive)" }}
          >
            <span>{CATEGORY_ICONS[currentWord.category] || "📦"}</span>
            <span>Category: {currentWord.category}</span>
          </motion.div>
        )}

        <div className="py-4">
          <motion.div
            key={room.round_words_scored?.length || 0}
            initial={{ scale: 1.2, color: "var(--olive)" }}
            animate={{ scale: 1, color: "var(--text)" }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="font-space font-extrabold text-4xl"
          >
            +{room.round_words_scored?.length || 0}
          </motion.div>
          <div className="text-xs text-[var(--text-dim)] uppercase tracking-wider font-bold mt-1">
            Words Scored This Turn
          </div>
        </div>

        {/* Minimal Scoreboard */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-dim)]/50">
          <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border-dim)]">
            <div className="text-[10px] font-bold text-[var(--text-mute)] uppercase">{room.teams?.teamA?.name || "Team Alpha"}</div>
            <div className="font-space font-extrabold text-xl mt-0.5" style={{ color: room.teams?.teamA?.color || "#EF4444" }}>
              {room.teams?.teamA?.score ?? 0} pts
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border-dim)]">
            <div className="text-[10px] font-bold text-[var(--text-mute)] uppercase">{room.teams?.teamB?.name || "Team Omega"}</div>
            <div className="font-space font-extrabold text-xl mt-0.5" style={{ color: room.teams?.teamB?.color || "#3B82F6" }}>
              {room.teams?.teamB?.score ?? 0} pts
            </div>
          </div>
        </div>

        {/* Expandable Board Map Peek */}
        <div className="pt-2 border-t border-[var(--border-dim)]/40">
          <button
            type="button"
            onClick={() => setShowBoard(!showBoard)}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-xs text-[var(--olive)] font-bold hover:underline cursor-pointer transition"
          >
            <span>🗺️ {showBoard ? "Hide Board Map" : "Peek at Board Map"}</span>
            {showBoard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <AnimatePresence>
            {showBoard && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 text-left overflow-hidden"
              >
                <BoardMap
                  scoreA={room.teams?.teamA?.score ?? 0}
                  scoreB={room.teams?.teamB?.score ?? 0}
                  scoreGoal={room.settings?.scoreGoal || 20}
                  colorA={room.teams?.teamA?.color || "#EF4444"}
                  colorB={room.teams?.teamB?.color || "#3B82F6"}
                  activeTeam={currentTurn?.activeTeam || "A"}
                  gameMode="classic"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Reactions Bar */}
      <div className="flex justify-center gap-3">
        {["🔥", "👏", "🧠", "⚡"].map((emoji) => (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReactionTap(emoji)}
            className="w-11 h-11 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] hover:border-[var(--olive)] text-xl flex items-center justify-center cursor-pointer shadow-xs touch-manipulation select-none active:scale-95"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
