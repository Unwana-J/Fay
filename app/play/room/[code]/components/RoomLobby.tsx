"use client";

import React, { useState } from "react";
import { ArticulateRoom, RoomPlayer, BuzzerSoundType, BUZZER_OPTIONS } from "@/lib/articulate-room";
import { Copy, Check, Share2, Play, Users, Crown, ArrowLeftRight, Clock, Target, Layers, Dices, Moon, LogOut, UserPlus, Zap, Loader2, Edit2, X, UserX, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { playBuzzerSound } from "@/lib/sound";

interface RoomLobbyProps {
  room: ArticulateRoom;
  myPlayerId: string;
  isHost: boolean;
  isStartingRound?: boolean;
  presencePlayers: RoomPlayer[];
  knownNames?: Record<string, { name: string; avatar: string }>;
  onStartRound: () => void;
  onSwitchTeam: (targetTeam: "A" | "B") => void;
  onShuffleTeams?: () => void;
  onUpdateSettings?: (settings: { timerSeconds?: number; scoreGoal?: number; buzzerSound?: BuzzerSoundType }) => void;
  onToggleInactive?: (targetPlayerId?: string) => void;
  onKickPlayer?: (targetPlayerId: string) => void;
  onLeaveRoom?: () => void;
  onEditName?: () => void;
  onOpenLobbyQueue?: () => void;
  onAdmitPlayer?: (targetPlayerId: string, targetTeam: "A" | "B") => void;
  onAutoAdmitAll?: () => void;
  onRenameRoom?: (newName: string) => void;
  onRenameTeam?: (team: "A" | "B", newName: string) => void;
}

export default function RoomLobby({
  room,
  myPlayerId,
  isHost,
  isStartingRound = false,
  presencePlayers,
  knownNames = {},
  onStartRound,
  onSwitchTeam,
  onShuffleTeams,
  onUpdateSettings,
  onToggleInactive,
  onKickPlayer,
  onLeaveRoom,
  onEditName,
  onOpenLobbyQueue,
  onAdmitPlayer,
  onAutoAdmitAll,
  onRenameRoom,
  onRenameTeam,
}: RoomLobbyProps) {
  const [copied, setCopied] = useState(false);
  const [isEditingRoomName, setIsEditingRoomName] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState(room.room_name || "");
  const [editingTeam, setEditingTeam] = useState<"A" | "B" | null>(null);
  const [teamNameInput, setTeamNameInput] = useState("");

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

  const myTeam = (room.teams?.teamA?.playerIds || []).includes(myPlayerId)
    ? "A"
    : (room.teams?.teamB?.playerIds || []).includes(myPlayerId)
    ? "B"
    : null;

  const isPlayerInactive = (pId: string) => {
    const isExplicit = Boolean(room.inactive_players?.includes(pId));
    // If presence tracking is active and this player is not in presence state, mark as away
    const isPresenceAway = presencePlayers.length > 0 && !presencePlayers.some((p) => p.id === pId);
    return isExplicit || isPresenceAway;
  };

  const teamAPlayers = room.teams?.teamA?.playerIds || [];
  const teamAActiveCount = teamAPlayers.filter((id) => !isPlayerInactive(id)).length;
  const teamAInactiveCount = teamAPlayers.length - teamAActiveCount;

  const teamBPlayers = room.teams?.teamB?.playerIds || [];
  const teamBActiveCount = teamBPlayers.filter((id) => !isPlayerInactive(id)).length;
  const teamBInactiveCount = teamBPlayers.length - teamBActiveCount;

  // Resolve player details from presence map, knownNames cache, or persisted details
  const getPlayerDisplay = (pId: string) => {
    // 1. If it's me and I have a valid name, prefer local name
    if (pId === myPlayerId && room.player_details?.[pId]?.name) {
      const myDetail = room.player_details[pId];
      return { id: pId, name: myDetail.name, avatar: myDetail.avatar || "/avatars/avatar-scholar.svg", isHost: pId === room.host_id, joinedAt: myDetail.joinedAt || Date.now() };
    }
    // 2. Check persisted room.player_details
    const detail = room.player_details?.[pId];
    if (detail && detail.name && detail.name !== "Scholar" && detail.name !== "Learner") {
      return { id: pId, name: detail.name, avatar: detail.avatar || "/avatars/avatar-scholar.svg", isHost: pId === room.host_id, joinedAt: detail.joinedAt || Date.now() };
    }
    // 3. Check presence map
    const found = presencePlayers.find((p) => p.id === pId);
    if (found && found.name && found.name !== "Scholar" && found.name !== "Learner") {
      return { id: pId, name: found.name, avatar: found.avatar || "/avatars/avatar-scholar.svg", isHost: found.isHost || pId === room.host_id, joinedAt: found.joinedAt || Date.now() };
    }
    // 4. Check knownNames persistent cache
    const known = knownNames[pId];
    if (known && known.name && known.name !== "Scholar" && known.name !== "Learner") {
      return { id: pId, name: known.name, avatar: known.avatar || "/avatars/avatar-scholar.svg", isHost: pId === room.host_id, joinedAt: detail?.joinedAt || Date.now() };
    }
    // 5. Host fallback
    if (pId === room.host_id) {
      return { id: pId, name: room.host_name || "Host", avatar: "/avatars/avatar-scholar.svg", isHost: true, joinedAt: detail?.joinedAt || Date.now() };
    }
    // 6. If detail, presence, or known has any name
    if (detail?.name) {
      return { id: pId, name: detail.name, avatar: detail.avatar || "/avatars/avatar-scholar.svg", isHost: pId === room.host_id, joinedAt: detail.joinedAt || Date.now() };
    }
    if (found?.name) {
      return { id: pId, name: found.name, avatar: found.avatar || "/avatars/avatar-scholar.svg", isHost: found.isHost || pId === room.host_id, joinedAt: found.joinedAt || Date.now() };
    }
    if (known?.name) {
      return { id: pId, name: known.name, avatar: known.avatar || "/avatars/avatar-scholar.svg", isHost: pId === room.host_id, joinedAt: detail?.joinedAt || Date.now() };
    }
    const cleanId = pId.replace(/^guest-/, "");
    return { id: pId, name: `Scholar (${cleanId.slice(0, 5)})`, avatar: "/avatars/avatar-scholar.svg", isHost: false, joinedAt: detail?.joinedAt || Date.now() };
  };

  // Find all unassigned or spectator scholars
  const allKnownIds = Array.from(
    new Set([
      ...(room.spectators || []),
      ...presencePlayers.map((p) => p.id),
      ...Object.keys(room.player_details || {}),
    ])
  );

  const waitingScholarIds = allKnownIds.filter(
    (id) => !teamAPlayers.includes(id) && !teamBPlayers.includes(id)
  );

  // Sort strictly by joined arrival time ascending (FIFO - who joined first)
  const sortedWaitingScholars = waitingScholarIds
    .map((id) => getPlayerDisplay(id))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Room Code & Share Card */}
      <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-dim)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--olive)]">
                Multiplayer Room Lobby
              </span>
              {room.room_name && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--terra)]/10 text-[var(--terra)] font-bold font-space truncate max-w-[240px]">
                  {room.room_name}
                </span>
              )}
            </div>
            {isEditingRoomName && isHost ? (
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <input
                  type="text"
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  placeholder="e.g. Lokin Labs Hangout"
                  maxLength={40}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--terra)] text-sm font-space font-bold text-[var(--text)] focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onRenameRoom?.(roomNameInput.trim());
                      setIsEditingRoomName(false);
                    } else if (e.key === "Escape") {
                      setIsEditingRoomName(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    onRenameRoom?.(roomNameInput.trim());
                    setIsEditingRoomName(false);
                  }}
                  className="p-1.5 rounded-lg bg-[var(--terra)] text-white hover:opacity-90 cursor-pointer"
                  title="Save Match Title"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingRoomName(false)}
                  className="p-1.5 rounded-lg bg-[var(--bg-card)] border text-[var(--text-mute)] hover:text-[var(--text)] cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="font-space font-extrabold text-3xl text-[var(--text)] tracking-tight flex items-center gap-3">
                  {room.room_code}
                </h1>
                {isHost && onRenameRoom && (
                  <button
                    type="button"
                    onClick={() => {
                      setRoomNameInput(room.room_name || "");
                      setIsEditingRoomName(true);
                    }}
                    className="p-1.5 rounded-xl border border-[var(--border-dim)] hover:border-[var(--terra)] text-[var(--text-mute)] hover:text-[var(--terra)] transition cursor-pointer text-xs font-space flex items-center gap-1 shadow-2xs"
                    title="Rename Match / Group"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">{room.room_name ? "Rename Match" : "Add Match Name"}</span>
                  </button>
                )}
              </div>
            )}
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
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-dim)] pt-2 border-t border-[var(--border-dim)]/60">
          {/* Duration Selector */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--text-mute)]" />
            {isHost && onUpdateSettings ? (
              <div className="flex items-center gap-1 bg-[var(--bg-input)]/60 p-0.5 rounded-lg border border-[var(--border-dim)]">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ timerSeconds: 30 })}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono transition cursor-pointer ${
                    room.settings.timerSeconds === 30
                      ? "bg-[var(--terra)] text-white shadow-xs"
                      : "text-[var(--text-dim)] hover:text-[var(--text)]"
                  }`}
                  title="Switch to 30 seconds (Blitz)"
                >
                  ⚡ 30s
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ timerSeconds: 45 })}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono transition cursor-pointer ${
                    room.settings.timerSeconds === 45
                      ? "bg-[var(--terra)] text-white shadow-xs"
                      : "text-[var(--text-dim)] hover:text-[var(--text)]"
                  }`}
                  title="Switch to 45 seconds (Classic)"
                >
                  🎯 45s
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ timerSeconds: 60 })}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono transition cursor-pointer ${
                    room.settings.timerSeconds === 60
                      ? "bg-[var(--terra)] text-white shadow-xs"
                      : "text-[var(--text-dim)] hover:text-[var(--text)]"
                  }`}
                  title="Switch to 60 seconds (Relaxed)"
                >
                  ⏱️ 60s
                </button>
              </div>
            ) : (
              <span className="font-medium font-mono">{room.settings.timerSeconds}s per sprint</span>
            )}
          </div>

          {/* Points Goal Selector */}
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[var(--text-mute)]" />
            {isHost && onUpdateSettings ? (
              <div className="flex items-center gap-1 bg-[var(--bg-input)]/60 p-0.5 rounded-lg border border-[var(--border-dim)]">
                <span className="text-[10px] text-[var(--text-mute)] pl-1 pr-0.5 hidden sm:inline">First to:</span>
                {[20, 30, 50, 75, 100].map((pts) => (
                  <button
                    key={pts}
                    type="button"
                    onClick={() => onUpdateSettings({ scoreGoal: pts })}
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold font-mono transition cursor-pointer ${
                      room.settings.scoreGoal === pts
                        ? "bg-[var(--olive)] text-white shadow-xs"
                        : "text-[var(--text-dim)] hover:text-[var(--text)]"
                    }`}
                    title={`First to ${pts} points`}
                  >
                    {pts}pts
                  </button>
                ))}
              </div>
            ) : (
              <span className="font-medium">First to {room.settings.scoreGoal} points</span>
            )}
          </div>

          {/* Buzzer Sound Selector */}
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-[var(--text-mute)]" />
            {isHost && onUpdateSettings ? (
              <div className="flex items-center gap-1 bg-[var(--bg-input)]/60 p-0.5 rounded-lg border border-[var(--border-dim)]">
                <span className="text-[10px] text-[var(--text-mute)] pl-1 pr-0.5 hidden sm:inline">Buzzer:</span>
                {BUZZER_OPTIONS.map((opt) => {
                  const isSelected = (room.settings.buzzerSound || "classic") === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onUpdateSettings({ buzzerSound: opt.id });
                        playBuzzerSound(opt.id);
                      }}
                      className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold font-space transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-[var(--terra)] text-white shadow-xs"
                          : "text-[var(--text-dim)] hover:text-[var(--text)]"
                      }`}
                      title={`${opt.label}: ${opt.description} (Tap to select & preview)`}
                    >
                      <span>{opt.icon}</span>
                      <span className="hidden md:inline">{opt.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => playBuzzerSound(room.settings.buzzerSound || "classic")}
                className="flex items-center gap-1 font-medium hover:text-[var(--text)] transition cursor-pointer px-2 py-0.5 rounded-lg bg-[var(--bg-input)]/40 border border-[var(--border-dim)] text-[11px]"
                title="Tap to preview this room's buzzer sound"
              >
                <span>{BUZZER_OPTIONS.find((b) => b.id === (room.settings.buzzerSound || "classic"))?.icon || "🚨"}</span>
                <span>{BUZZER_OPTIONS.find((b) => b.id === (room.settings.buzzerSound || "classic"))?.label || "Classic Buzzer"}</span>
                <span className="text-[9px] opacity-70">🔊</span>
              </button>
            )}
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

      {/* Waiting Lobby Queue (Ordered by arrival time) */}
      {sortedWaitingScholars.length > 0 && (
        <div className="surface rounded-3xl p-5 border border-[var(--gold)]/40 bg-[var(--gold)]/5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--gold)]/20">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--gold)] animate-pulse" />
              <h2 className="font-space font-extrabold text-sm text-[var(--text)]">
                Waiting in Lobby Queue ({sortedWaitingScholars.length} Scholars)
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--gold)]/20 text-[var(--gold)]">
                Arrival Order (FIFO)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isHost && onAutoAdmitAll && sortedWaitingScholars.length > 1 && (
                <button
                  type="button"
                  onClick={onAutoAdmitAll}
                  className="text-xs font-space font-bold px-3 py-1.5 rounded-xl bg-[var(--olive)] text-white hover:opacity-90 flex items-center gap-1.5 shadow-sm cursor-pointer transition"
                >
                  <Zap className="w-3.5 h-3.5" /> Auto-Balance All
                </button>
              )}
              {onOpenLobbyQueue && (
                <button
                  type="button"
                  onClick={onOpenLobbyQueue}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text)] transition cursor-pointer"
                >
                  View Roster
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedWaitingScholars.map((scholar, idx) => (
              <div
                key={scholar.id}
                className="surface rounded-2xl p-3 border border-[var(--border-dim)] flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-[var(--bg)] border border-[var(--border-dim)] text-[10px] font-mono font-bold flex items-center justify-center text-[var(--text-mute)] flex-shrink-0">
                    #{idx + 1}
                  </span>
                  {scholar.avatar?.startsWith("/") || scholar.avatar?.includes(".svg") ? (
                    <img src={scholar.avatar} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <span className="text-lg flex-shrink-0">{scholar.avatar || "🎓"}</span>
                  )}
                  <div className="min-w-0">
                    <div className="font-space font-bold text-xs text-[var(--text)] truncate">
                      {scholar.name}
                    </div>
                    <div className="text-[9px] text-[var(--text-dim)]">
                      {idx === 0 ? "First to join" : `Joined #${idx + 1}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {onAdmitPlayer && (
                    <>
                      <button
                        type="button"
                        onClick={() => onAdmitPlayer(scholar.id, "A")}
                        className="text-[11px] font-space font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 hover:brightness-110"
                        style={{
                          backgroundColor: `${room.teams.teamA.color}15`,
                          color: room.teams.teamA.color,
                          borderColor: `${room.teams.teamA.color}40`,
                        }}
                        title={`Admit ${scholar.name} into ${room.teams.teamA.name}`}
                      >
                        <UserPlus className="w-3 h-3" /> + Alpha
                      </button>
                      <button
                        type="button"
                        onClick={() => onAdmitPlayer(scholar.id, "B")}
                        className="text-[11px] font-space font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 hover:brightness-110"
                        style={{
                          backgroundColor: `${room.teams.teamB.color}15`,
                          color: room.teams.teamB.color,
                          borderColor: `${room.teams.teamB.color}40`,
                        }}
                        title={`Admit ${scholar.name} into ${room.teams.teamB.name}`}
                      >
                        <UserPlus className="w-3 h-3" /> + Omega
                      </button>
                    </>
                  )}
                  {isHost && onKickPlayer && scholar.id !== myPlayerId && scholar.id !== room.host_id && (
                    <button
                      type="button"
                      onClick={() => onKickPlayer(scholar.id)}
                      className="p-1 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition cursor-pointer flex items-center justify-center"
                      title={`Kick ${scholar.name} out of room`}
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams Header with Host Shuffle Action */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--text-dim)] uppercase tracking-wider">
          Teams & Speaking Order (Turns go in order of who joined)
        </span>
        {isHost && onShuffleTeams && (
          <button
            type="button"
            onClick={onShuffleTeams}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border-dim)] hover:border-[var(--olive)] bg-[var(--bg-card)] text-[var(--text)] transition cursor-pointer shadow-xs"
          >
            <Dices className="w-3.5 h-3.5 text-[var(--olive)]" />
            Randomize Teams
          </button>
        )}
      </div>

      {/* Two Teams Column Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team Alpha */}
        <div
          className="surface rounded-3xl p-5 border shadow-sm space-y-4"
          style={{ borderColor: `${room.teams.teamA.color}40` }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-dim)] gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0"
                style={{ backgroundColor: room.teams.teamA.color }}
              />
              {editingTeam === "A" && isHost ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={teamNameInput}
                    onChange={(e) => setTeamNameInput(e.target.value)}
                    placeholder="Team Alpha"
                    maxLength={24}
                    className="px-2 py-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--terra)] text-xs font-space font-bold text-[var(--text)] focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (teamNameInput.trim()) onRenameTeam?.("A", teamNameInput.trim());
                        setEditingTeam(null);
                      } else if (e.key === "Escape") {
                        setEditingTeam(null);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (teamNameInput.trim()) onRenameTeam?.("A", teamNameInput.trim());
                      setEditingTeam(null);
                    }}
                    className="p-1 rounded bg-[var(--terra)] text-white hover:opacity-90 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="p-1 rounded bg-[var(--bg-card)] border text-[var(--text-mute)] hover:text-[var(--text)] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h2 className="font-space font-bold text-base text-[var(--text)]">
                    {room.teams.teamA.name}
                  </h2>
                  {isHost && onRenameTeam && (
                    <button
                      type="button"
                      onClick={() => {
                        setTeamNameInput(room.teams.teamA.name);
                        setEditingTeam("A");
                      }}
                      className="text-[var(--text-mute)] hover:text-[var(--terra)] p-0.5 rounded transition cursor-pointer"
                      title="Rename Team"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border-dim)] text-[var(--text-dim)]">
                {teamAActiveCount} Active{teamAInactiveCount > 0 ? ` · ${teamAInactiveCount} Away` : ""}
              </span>
            </div>
            {myTeam !== "A" ? (
              <button
                onClick={() => onSwitchTeam("A")}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[var(--border-dim)] hover:border-[var(--olive)] bg-[var(--bg-card)] text-[var(--text)] flex items-center gap-1 cursor-pointer transition shadow-xs"
              >
                <ArrowLeftRight className="w-3 h-3" /> Join {room.teams.teamA.name}
              </button>
            ) : (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Your Team
              </span>
            )}
          </div>

          <div className="space-y-2 min-h-[120px]">
            {room.teams.teamA.playerIds.length === 0 ? (
              <div className="text-xs text-[var(--text-mute)] text-center py-8 italic">
                No scholars in Team Alpha yet
              </div>
            ) : (
              room.teams.teamA.playerIds.map((pId, idx) => {
                const p = getPlayerDisplay(pId);
                const isMe = pId === myPlayerId;
                const inactive = isPlayerInactive(pId);
                return (
                  <div
                    key={pId}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                      inactive
                        ? "bg-amber-500/5 border-amber-500/20 opacity-70"
                        : isMe
                        ? "bg-[var(--olive)]/10 border-[var(--olive)]/30 font-bold"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[var(--bg)] flex items-center justify-center text-[10px] font-bold text-[var(--text-mute)] border border-[var(--border-dim)]">
                        #{idx + 1}
                      </span>
                      <span className="text-[var(--text)] truncate">
                        {p.name}
                      </span>
                      {isMe && (
                        <button
                          type="button"
                          onClick={onEditName}
                          className="text-[10px] text-[var(--olive)] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer ml-1 flex-shrink-0"
                          title="Click to rename yourself"
                        >
                          (You - edit)
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isHost && onToggleInactive && (
                        <button
                          type="button"
                          onClick={() => onToggleInactive(pId)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer flex items-center gap-1 shadow-2xs ${
                            inactive
                              ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                              : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          }`}
                          title={inactive ? "Host Control: Mark scholar as Active" : "Host Control: Mark scholar as Away (skips speaking turn if having connection issues)"}
                        >
                          {inactive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Set Active</span>
                            </>
                          ) : (
                            <>
                              <Moon className="w-2.5 h-2.5 text-amber-500" />
                              <span>Mark Away</span>
                            </>
                          )}
                        </button>
                      )}
                      {inactive ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-600 font-medium border border-amber-500/30">
                          <Moon className="w-2.5 h-2.5" /> Away
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--text-dim)] bg-[var(--bg)] px-2 py-0.5 rounded-full border border-[var(--border-dim)] font-medium">
                          {idx === 0 ? "1st Speaker" : idx === 1 ? "2nd Speaker" : idx === 2 ? "3rd Speaker" : `${idx + 1}th Speaker`}
                        </span>
                      )}
                      {pId === room.host_id && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 font-bold">
                          <Crown className="w-3 h-3" /> Host
                        </span>
                      )}
                      {isHost && onKickPlayer && pId !== myPlayerId && pId !== room.host_id && (
                        <button
                          type="button"
                          onClick={() => onKickPlayer(pId)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                          title={`Kick ${p.name} out of room`}
                        >
                          <UserX className="w-2.5 h-2.5" />
                          <span>Kick</span>
                        </button>
                      )}
                    </div>
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
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-dim)] gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0"
                style={{ backgroundColor: room.teams.teamB.color }}
              />
              {editingTeam === "B" && isHost ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={teamNameInput}
                    onChange={(e) => setTeamNameInput(e.target.value)}
                    placeholder="Team Omega"
                    maxLength={24}
                    className="px-2 py-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--olive)] text-xs font-space font-bold text-[var(--text)] focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (teamNameInput.trim()) onRenameTeam?.("B", teamNameInput.trim());
                        setEditingTeam(null);
                      } else if (e.key === "Escape") {
                        setEditingTeam(null);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (teamNameInput.trim()) onRenameTeam?.("B", teamNameInput.trim());
                      setEditingTeam(null);
                    }}
                    className="p-1 rounded bg-[var(--olive)] text-white hover:opacity-90 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="p-1 rounded bg-[var(--bg-card)] border text-[var(--text-mute)] hover:text-[var(--text)] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h2 className="font-space font-bold text-base text-[var(--text)]">
                    {room.teams.teamB.name}
                  </h2>
                  {isHost && onRenameTeam && (
                    <button
                      type="button"
                      onClick={() => {
                        setTeamNameInput(room.teams.teamB.name);
                        setEditingTeam("B");
                      }}
                      className="text-[var(--text-mute)] hover:text-[var(--olive)] p-0.5 rounded transition cursor-pointer"
                      title="Rename Team"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border-dim)] text-[var(--text-dim)]">
                {teamBActiveCount} Active{teamBInactiveCount > 0 ? ` · ${teamBInactiveCount} Away` : ""}
              </span>
            </div>
            {myTeam !== "B" ? (
              <button
                onClick={() => onSwitchTeam("B")}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[var(--border-dim)] hover:border-[var(--olive)] bg-[var(--bg-card)] text-[var(--text)] flex items-center gap-1 cursor-pointer transition shadow-xs"
              >
                <ArrowLeftRight className="w-3 h-3" /> Join {room.teams.teamB.name}
              </button>
            ) : (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Your Team
              </span>
            )}
          </div>

          <div className="space-y-2 min-h-[120px]">
            {room.teams.teamB.playerIds.length === 0 ? (
              <div className="text-xs text-[var(--text-mute)] text-center py-8 italic">
                No scholars in Team Omega yet
              </div>
            ) : (
              room.teams.teamB.playerIds.map((pId, idx) => {
                const p = getPlayerDisplay(pId);
                const isMe = pId === myPlayerId;
                const inactive = isPlayerInactive(pId);
                return (
                  <div
                    key={pId}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                      inactive
                        ? "bg-amber-500/5 border-amber-500/20 opacity-70"
                        : isMe
                        ? "bg-[var(--olive)]/10 border-[var(--olive)]/30 font-bold"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[var(--bg)] flex items-center justify-center text-[10px] font-bold text-[var(--text-mute)] border border-[var(--border-dim)]">
                        #{idx + 1}
                      </span>
                      <span className="text-[var(--text)] truncate">
                        {p.name}
                      </span>
                      {isMe && (
                        <button
                          type="button"
                          onClick={onEditName}
                          className="text-[10px] text-[var(--olive)] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer ml-1 flex-shrink-0"
                          title="Click to rename yourself"
                        >
                          (You - edit)
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isHost && onToggleInactive && (
                        <button
                          type="button"
                          onClick={() => onToggleInactive(pId)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer flex items-center gap-1 shadow-2xs ${
                            inactive
                              ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                              : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          }`}
                          title={inactive ? "Host Control: Mark scholar as Active" : "Host Control: Mark scholar as Away (skips speaking turn if having connection issues)"}
                        >
                          {inactive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Set Active</span>
                            </>
                          ) : (
                            <>
                              <Moon className="w-2.5 h-2.5 text-amber-500" />
                              <span>Mark Away</span>
                            </>
                          )}
                        </button>
                      )}
                      {inactive ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-600 font-medium border border-amber-500/30">
                          <Moon className="w-2.5 h-2.5" /> Away
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--text-dim)] bg-[var(--bg)] px-2 py-0.5 rounded-full border border-[var(--border-dim)] font-medium">
                          {idx === 0 ? "1st Speaker" : idx === 1 ? "2nd Speaker" : idx === 2 ? "3rd Speaker" : `${idx + 1}th Speaker`}
                        </span>
                      )}
                      {pId === room.host_id && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-600 font-bold">
                          <Crown className="w-3 h-3" /> Host
                        </span>
                      )}
                      {isHost && onKickPlayer && pId !== myPlayerId && pId !== room.host_id && (
                        <button
                          type="button"
                          onClick={() => onKickPlayer(pId)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                          title={`Kick ${p.name} out of room`}
                        >
                          <UserX className="w-2.5 h-2.5" />
                          <span>Kick</span>
                        </button>
                      )}
                    </div>
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
              whileHover={{ scale: isStartingRound ? 1 : 1.02 }}
              whileTap={{ scale: isStartingRound ? 1 : 0.98 }}
              onClick={() => {
                try {
                  navigator.vibrate?.(15);
                } catch {}
                onStartRound();
              }}
              disabled={isStartingRound}
              className={`w-full py-4 rounded-2xl font-space font-extrabold text-base shadow-md flex items-center justify-center gap-2 transition touch-manipulation select-none active:scale-[0.98] ${
                isStartingRound
                  ? "bg-[var(--terra)]/80 text-white cursor-wait opacity-90"
                  : "bg-[var(--terra)] text-white hover:shadow-lg cursor-pointer"
              }`}
            >
              {isStartingRound ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Locking Room & Starting Round 1...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Lock Room & Start Round 1</span>
                </>
              )}
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
