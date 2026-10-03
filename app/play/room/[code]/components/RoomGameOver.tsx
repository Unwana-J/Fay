"use client";

import React, { useEffect, useState } from "react";
import { ArticulateRoom, RoomPlayer } from "@/lib/articulate-room";
import { Trophy, RotateCcw, Home, Crown, Share2, Copy, Check, Sparkles, Target, Clock, Users, Flame, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import canvasConfetti from "canvas-confetti";
import Link from "next/link";
import BoardMap from "@/app/play/BoardMap";
import ScholarTrophy from "@/components/ui/ScholarTrophy";

interface RoomGameOverProps {
  room: ArticulateRoom;
  isHost: boolean;
  myPlayerId?: string;
  presencePlayers?: RoomPlayer[];
  knownNames?: Record<string, { name: string; avatar: string }>;
  onResetGame: () => void;
}

export default function RoomGameOver({
  room,
  isHost,
  myPlayerId,
  presencePlayers = [],
  knownNames = {},
  onResetGame,
}: RoomGameOverProps) {
  const [copied, setCopied] = useState(false);
  const [showBoard, setShowBoard] = useState(true);

  const teamA = room.teams.teamA;
  const teamB = room.teams.teamB;

  const isTie = teamA.score === teamB.score;
  const isWinnerA = teamA.score > teamB.score;
  const winner = isWinnerA ? teamA : teamB;
  const runnerUp = isWinnerA ? teamB : teamA;
  const margin = Math.abs(teamA.score - teamB.score);

  useEffect(() => {
    try {
      // First burst
      canvasConfetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: [winner.color, "#D97706", "#10B981", "#EF4444", "#3B82F6"],
      });

      // Side fireworks burst
      const timer = setTimeout(() => {
        canvasConfetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: [winner.color, "#F59E0B", "#FCD34D"],
        });
        canvasConfetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: [winner.color, "#F59E0B", "#FCD34D"],
        });
      }, 350);

      return () => clearTimeout(timer);
    } catch {}
  }, [winner.color]);

  // Player name resolution helper
  const getPlayerName = (pId: string): string => {
    const detail = room.player_details?.[pId];
    if (detail?.name && detail.name !== "Scholar" && detail.name !== "Learner") return detail.name;
    const presence = presencePlayers.find((p) => p.id === pId);
    if (presence?.name && presence.name !== "Scholar" && presence.name !== "Learner") return presence.name;
    const known = knownNames[pId];
    if (known?.name && known.name !== "Scholar" && known.name !== "Learner") return known.name;
    if (pId === room.host_id) return room.host_name || "Host";
    return `Scholar (${pId.replace(/^guest-/, "").slice(0, 5)})`;
  };

  const handleCopyRecap = () => {
    const title = room.room_name ? `${room.room_name} (${room.room_code})` : `Room ${room.room_code}`;
    const text = `🏆 Fey Articulate Match Results!\n${title}\n\n👑 ${winner.name}: ${winner.score} pts\n⚔️ ${runnerUp.name}: ${runnerUp.score} pts\n\nMargin: ${margin} pts lead • Target: ${room.settings.scoreGoal} pts\nPlay on Fey: https://fey.lokinlabs.com.ng/play`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const title = room.room_name ? `${room.room_name} (${room.room_code})` : `Room ${room.room_code}`;
    const text = encodeURIComponent(
      `🏆 Fey Articulate Match Result!\n${title}\n\n👑 ${winner.name}: ${winner.score} pts\n⚔️ ${runnerUp.name}: ${runnerUp.score} pts\n\nMargin: ${margin} pts lead! Play with us: https://fey.lokinlabs.com.ng/play/room/${room.room_code}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center py-4 sm:py-6">
      {/* Hero Victory & Winner Podium Showcase */}
      <div className="space-y-4">
        <motion.div
          initial={{ scale: 0.75, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="relative inline-flex items-center justify-center my-1"
        >
          <ScholarTrophy
            winnerColor={winner.color}
            teamName={winner.name}
            size={180}
          />
        </motion.div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-space font-bold uppercase tracking-wider text-[var(--gold)] bg-[var(--gold)]/10 border border-[var(--gold)]/30">
              <Sparkles className="w-3.5 h-3.5" /> Match Decided
            </span>
            {room.room_name && (
              <span className="text-xs font-space font-extrabold px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text)]">
                {room.room_name}
              </span>
            )}
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text-mute)]">
              {room.room_code}
            </span>
          </div>

          <h1 className="font-space font-black text-3xl sm:text-5xl text-[var(--text)] tracking-tight">
            {isTie ? "Scholarly Deadlock!" : `${winner.name} Triumphs!`}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-dim)] max-w-md mx-auto leading-relaxed">
            {isTie
              ? `Both teams tied at ${winner.score} points with equal eloquence and speed.`
              : `Articulated with mastery to reach ${winner.score} points (${margin} pts ahead of ${runnerUp.name}).`}
          </p>
        </div>
      </div>

      {/* Duel Podium Scoreboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Team 1 (Winner or Team A) */}
        <div
          className={`p-5 rounded-3xl border text-left shadow-sm space-y-3 relative overflow-hidden transition-all ${
            isWinnerA && !isTie ? "ring-2 ring-[var(--gold)]/50 shadow-md" : ""
          }`}
          style={{
            borderColor: `${teamA.color}50`,
            backgroundColor: `${teamA.color}0D`,
          }}
        >
          {isWinnerA && !isTie && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--gold)] text-black text-[10px] font-space font-black uppercase tracking-wider shadow-sm">
              <Crown className="w-3 h-3 fill-current" /> Winner
            </div>
          )}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: teamA.color }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: teamA.color }} />
              {teamA.name}
            </span>
            <div className="font-space font-black text-4xl sm:text-5xl mt-1 text-[var(--text)] flex items-baseline gap-1.5">
              {teamA.score}
              <span className="text-xs font-normal text-[var(--text-dim)]">/ {room.settings.scoreGoal} pts</span>
            </div>
          </div>

          {/* Roster of Scholars */}
          <div className="pt-2 border-t border-[var(--border-dim)]/50 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[var(--text-mute)] block">
              Scholars ({teamA.playerIds.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {teamA.playerIds.map((pId) => (
                <span
                  key={pId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text)] truncate max-w-[130px]"
                >
                  {getPlayerName(pId)}
                  {pId === room.host_id && (
                    <Crown className="w-2.5 h-2.5 text-[var(--gold)] shrink-0" />
                  )}
                </span>
              ))}
              {teamA.playerIds.length === 0 && (
                <span className="text-[11px] text-[var(--text-mute)] italic">No assigned scholars</span>
              )}
            </div>
          </div>
        </div>

        {/* Team 2 (Runner Up or Team B) */}
        <div
          className={`p-5 rounded-3xl border text-left shadow-sm space-y-3 relative overflow-hidden transition-all ${
            !isWinnerA && !isTie ? "ring-2 ring-[var(--gold)]/50 shadow-md" : ""
          }`}
          style={{
            borderColor: `${teamB.color}50`,
            backgroundColor: `${teamB.color}0D`,
          }}
        >
          {!isWinnerA && !isTie && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--gold)] text-black text-[10px] font-space font-black uppercase tracking-wider shadow-sm">
              <Crown className="w-3 h-3 fill-current" /> Winner
            </div>
          )}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: teamB.color }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: teamB.color }} />
              {teamB.name}
            </span>
            <div className="font-space font-black text-4xl sm:text-5xl mt-1 text-[var(--text)] flex items-baseline gap-1.5">
              {teamB.score}
              <span className="text-xs font-normal text-[var(--text-dim)]">/ {room.settings.scoreGoal} pts</span>
            </div>
          </div>

          {/* Roster of Scholars */}
          <div className="pt-2 border-t border-[var(--border-dim)]/50 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[var(--text-mute)] block">
              Scholars ({teamB.playerIds.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {teamB.playerIds.map((pId) => (
                <span
                  key={pId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text)] truncate max-w-[130px]"
                >
                  {getPlayerName(pId)}
                  {pId === room.host_id && (
                    <Crown className="w-2.5 h-2.5 text-[var(--gold)] shrink-0" />
                  )}
                </span>
              ))}
              {teamB.playerIds.length === 0 && (
                <span className="text-[11px] text-[var(--text-mute)] italic">No assigned scholars</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Match 4-Stat Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-left">
        <div className="surface rounded-2xl p-3.5 border border-[var(--border-dim)] space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-mute)] font-medium">
            <Target className="w-3.5 h-3.5 text-[var(--terra)]" /> Target Goal
          </div>
          <div className="text-base font-space font-extrabold text-[var(--text)]">
            {room.settings.scoreGoal} pts
          </div>
        </div>

        <div className="surface rounded-2xl p-3.5 border border-[var(--border-dim)] space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-mute)] font-medium">
            <Clock className="w-3.5 h-3.5 text-[var(--gold)]" /> Sprint Timer
          </div>
          <div className="text-base font-space font-extrabold text-[var(--text)]">
            {room.settings.timerSeconds}s per turn
          </div>
        </div>

        <div className="surface rounded-2xl p-3.5 border border-[var(--border-dim)] space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-mute)] font-medium">
            <Users className="w-3.5 h-3.5 text-[var(--olive)]" /> Total Scholars
          </div>
          <div className="text-base font-space font-extrabold text-[var(--text)]">
            {teamA.playerIds.length + teamB.playerIds.length} players
          </div>
        </div>

        <div className="surface rounded-2xl p-3.5 border border-[var(--border-dim)] space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-mute)] font-medium">
            <Flame className="w-3.5 h-3.5 text-[var(--terra)]" /> Final Round
          </div>
          <div className="text-base font-space font-extrabold text-[var(--text)]">
            Round {room.current_turn?.roundNumber || 1}
          </div>
        </div>
      </div>

      {/* The Fey Board Journey Map */}
      <div className="surface rounded-3xl border border-[var(--border-dim)] p-3.5 sm:p-5 text-left space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-1 border-b border-[var(--border-dim)]/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--gold)]" />
            <h3 className="font-space font-bold text-sm text-[var(--text)]">
              Final Board Track Position
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowBoard(!showBoard)}
            className="text-xs font-space font-bold text-[var(--olive)] hover:underline cursor-pointer"
          >
            {showBoard ? "Hide Board" : "Show Board"}
          </button>
        </div>

        {showBoard && (
          <BoardMap
            scoreA={teamA.score}
            scoreB={teamB.score}
            scoreGoal={room.settings.scoreGoal}
            colorA={teamA.color}
            colorB={teamB.color}
            activeTeam={null}
            gameMode={room.settings.gameMode || "classic"}
          />
        )}
      </div>

      {/* Match Final Words Review */}
      {(room.round_words_scored?.length > 0 || room.round_words_passed?.length > 0) && (
        <div className="surface rounded-3xl border border-[var(--border-dim)] p-4 sm:p-5 text-left space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-dim)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-mute)]">
              Final Sprint Words
            </span>
            <span className="text-[11px] text-[var(--text-dim)] font-medium font-mono">
              {room.round_words_scored?.length || 0} scored • {room.round_words_passed?.length || 0} passed
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {room.round_words_scored?.map((w, idx) => (
              <span
                key={`scored-${idx}`}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition ${
                  w.disputeStatus === "conceded"
                    ? "bg-red-500/10 text-red-600 line-through border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                }`}
              >
                {w.disputeStatus !== "conceded" && <Check className="w-3 h-3 text-emerald-500" />}
                {w.word}
              </span>
            ))}
            {room.round_words_passed?.map((w, idx) => (
              <span
                key={`passed-${idx}`}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border ${
                  w.claimStatus === "awarded"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold"
                    : "bg-[var(--bg-card)] text-[var(--text-mute)] border-[var(--border-dim)]"
                }`}
              >
                {w.word} <span className="text-[10px] text-[var(--text-mute)]">(pass)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Share & Social Proof Action Strip */}
      <div className="flex items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="flex-1 bg-[#25D366] text-white py-3 px-4 rounded-2xl font-space font-bold text-xs shadow-sm hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <Share2 className="w-4 h-4" />
          Share to WhatsApp
        </button>
        <button
          type="button"
          onClick={handleCopyRecap}
          className="flex-1 bg-[var(--bg-card)] border border-[var(--border-dim)] hover:border-[var(--olive)] text-[var(--text)] py-3 px-4 rounded-2xl font-space font-bold text-xs shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? "Recap Copied!" : "Copy Summary"}
        </button>
      </div>

      {/* Host Rematch vs Guest Status Actions */}
      <div className="space-y-3 pt-2">
        {isHost ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onResetGame}
            className="w-full bg-[var(--terra)] text-white py-4 rounded-2xl font-space font-extrabold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <RotateCcw className="w-5 h-5" />
            Rematch (Play Again)
          </motion.button>
        ) : (
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] flex items-center justify-center gap-2.5 text-xs text-[var(--text-dim)] font-space font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Waiting for Host to start Rematch...
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link
            href="/play"
            className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold border border-[var(--border-dim)] hover:border-[var(--olive)] bg-[var(--bg-card)] text-[var(--text)] transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Back to Parlor
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl text-xs font-bold border border-[var(--border-dim)] hover:bg-[var(--border-dim)]/20 text-[var(--text-mute)] hover:text-[var(--text)] transition cursor-pointer"
          >
            Dashboard <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

