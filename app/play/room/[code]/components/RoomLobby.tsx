"use client";

import React, { useState } from "react";
import { ArticulateRoom, RoomPlayer } from "@/lib/articulate-room";
import { Copy, Check, Share2, Play, Users, Crown, ArrowLeftRight, Clock, Target, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface RoomLobbyProps {
  room: ArticulateRoom;
  myPlayerId: string;
  isHost: boolean;
  presencePlayers: RoomPlayer[];
  onStartRound: () => void;
  onSwitchTeam: (targetTeam: "A" | "B") => void;
}

export default function RoomLobby({
  room,
  myPlayerId,
  isHost,
  presencePlayers,
  onStartRound,
  onSwitchTeam,
}: RoomLobbyProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/play/room/${room.room_code}`
    : `https://fey.lokinlabs.com.ng/play/room/${room.room_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Join my Fey Articulate party room! Code: ${room.room_code}\n\nTap link to enter:\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const myTeam = room.teams.teamA.playerIds.includes(myPlayerId)
    ? "A"
    : room.teams.teamB.playerIds.includes(myPlayerId)
    ? "B"
    : null;

  // Resolve player details from presence map
  const getPlayerDisplay = (pId: string) => {
    const found = presencePlayers.find((p) => p.id === pId);
    if (found) return found;
    if (pId === room.host_id) {
      return { id: pId, name: room.host_name, avatar: "/avatars/avatar-scholar.svg", isHost: true };
    }
    return { id: pId, name: `Scholar (${pId.slice(0, 5)})`, avatar: "/avatars/avatar-scholar.svg", isHost: false };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Room Code & Share Card */}
      <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-dim)]">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--olive)]">
              Multiplayer Room Lobby
            </span>
            <h1 className="font-space font-extrabold text-3xl text-[var(--text)] tracking-tight flex items-center gap-3">
              {room.room_code}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-dim)] hover:border-[var(--olive)] bg-[var(--bg-card)] text-[var(--text)] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#25D366] text-white hover:opacity-90 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Match Settings Strip */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-dim)] pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--text-mute)]" />
            <span>{room.settings.timerSeconds}s per round</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[var(--text-mute)]" />
            <span>First to {room.settings.scoreGoal} points</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[var(--text-mute)]" />
            <span>{room.settings.categories.length} categories</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-[var(--olive)] font-medium">
            <Users className="w-3.5 h-3.5" />
            <span>{room.teams.teamA.playerIds.length + room.teams.teamB.playerIds.length} players joined</span>
          </div>
        </div>
      </div>

      {/* Two Teams Column Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team Alpha */}
        <div
          className="surface rounded-3xl p-5 border shadow-sm space-y-4"
          style={{ borderColor: `${room.teams.teamA.color}40` }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-dim)]">
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full shadow-sm"
                style={{ backgroundColor: room.teams.teamA.color }}
              />
              <h2 className="font-space font-bold text-base text-[var(--text)]">
                {room.teams.teamA.name}
              </h2>
            </div>
            {myTeam !== "A" && (
              <button
                onClick={() => onSwitchTeam("A")}
                className="text-xs font-bold px-2.5 py-1 rounded-lg border border-[var(--border-dim)] hover:border-[var(--olive)] bg-[var(--bg-card)] text-[var(--text-dim)] flex items-center gap-1 cursor-pointer transition"
              >
                <ArrowLeftRight className="w-3 h-3" /> Join A
              </button>
            )}
          </div>

          <div className="space-y-2 min-h-[120px]">
            {room.teams.teamA.playerIds.length === 0 ? (
              <div className="text-xs text-[var(--text-mute)] text-center py-8 italic">
                No scholars in Team Alpha yet
              </div>
            ) : (
              room.teams.teamA.playerIds.map((pId) => {
                const p = getPlayerDisplay(pId);
                const isMe = pId === myPlayerId;
                return (
                  <div
                    key={pId}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      isMe
                        ? "bg-[var(--olive)]/10 border-[var(--olive)]/30 font-bold"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--bg)] flex items-center justify-center text-[10px] font-bold border border-[var(--border-dim)]">
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-[var(--text)]">
                        {p.name} {isMe && "(You)"}
                      </span>
                    </div>
                    {pId === room.host_id && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 font-bold">
                        <Crown className="w-3 h-3" /> Host
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Team Omega */}
        <div
          className="surface rounded-3xl p-5 border shadow-sm space-y-4"
          style={{ borderColor: `${room.teams.teamB.color}40` }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-dim)]">
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full shadow-sm"
                style={{ backgroundColor: room.teams.teamB.color }}
              />
              <h2 className="font-space font-bold text-base text-[var(--text)]">
                {room.teams.teamB.name}
              </h2>
            </div>
            {myTeam !== "B" && (
              <button
                onClick={() => onSwitchTeam("B")}
                className="text-xs font-bold px-2.5 py-1 rounded-lg border border-[var(--border-dim)] hover:border-[var(--olive)] bg-[var(--bg-card)] text-[var(--text-dim)] flex items-center gap-1 cursor-pointer transition"
              >
                <ArrowLeftRight className="w-3 h-3" /> Join B
              </button>
            )}
          </div>

          <div className="space-y-2 min-h-[120px]">
            {room.teams.teamB.playerIds.length === 0 ? (
              <div className="text-xs text-[var(--text-mute)] text-center py-8 italic">
                No scholars in Team Omega yet
              </div>
            ) : (
              room.teams.teamB.playerIds.map((pId) => {
                const p = getPlayerDisplay(pId);
                const isMe = pId === myPlayerId;
                return (
                  <div
                    key={pId}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      isMe
                        ? "bg-[var(--olive)]/10 border-[var(--olive)]/30 font-bold"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--bg)] flex items-center justify-center text-[10px] font-bold border border-[var(--border-dim)]">
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-[var(--text)]">
                        {p.name} {isMe && "(You)"}
                      </span>
                    </div>
                    {pId === room.host_id && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 font-bold">
                        <Crown className="w-3 h-3" /> Host
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Host Launch Control vs Player Waiting Indicator */}
      <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] shadow-sm space-y-3 text-center">
        {isHost ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartRound}
              className="w-full bg-[var(--terra)] text-white py-4 rounded-2xl font-space font-extrabold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Play className="w-5 h-5 fill-current" />
              Lock Room & Start Round 1
            </motion.button>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              🔒 When you click start, the room locks for Round 1. Any friends who join while the round is in progress will wait in the Spectator Lounge until this round ends.
            </p>
          </>
        ) : (
          <div className="py-2 space-y-1">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-[var(--text)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Waiting for {room.host_name} to launch Round 1...
            </div>
            <p className="text-xs text-[var(--text-dim)]">
              Stay on this screen. The match will automatically begin as soon as the host hits Start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
