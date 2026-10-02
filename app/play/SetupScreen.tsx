"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, ArticulateHistoryItem } from "@/store/useAppStore";
import { useGameStore } from "@/store/useGameStore";
import { GAME_CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/game-words";
import { Plus, Trash2, ArrowRight, Settings, Users, Gamepad2, Mic, Bot, Globe, Smartphone, Lock, Loader2, Sparkles, Play, Trophy, X, ChevronRight, Clock, Target, Eye, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BoardMap from "./BoardMap";

export default function SetupScreen({ onStart }: { onStart: () => void }) {
  const router = useRouter();
  const { profile, updateProfile, articulateHistory = [], removeArticulateRoom, saveArticulateRoom } = useAppStore();

  const [playMode, setPlayMode] = useState<"online" | "local">("online");
  const [isCreatingOnline, setIsCreatingOnline] = useState(false);
  const [onlineJoinCode, setOnlineJoinCode] = useState("");
  const [onlineJoinError, setOnlineJoinError] = useState<string | null>(null);
  const [onlineTimerSeconds, setOnlineTimerSeconds] = useState<30 | 45 | 60>(45);
  const [onlineScoreGoal, setOnlineScoreGoal] = useState<number>(20);
  const [selectedCompletedMatch, setSelectedCompletedMatch] = useState<ArticulateHistoryItem | null>(null);
  const [isLoadingMatchDetails, setIsLoadingMatchDetails] = useState(false);

  const formatMatchDuration = (seconds?: number): string => {
    if (!seconds || seconds <= 0) return "15 mins";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins} min${mins === 1 ? "" : "s"}`;
    return `${mins}m ${secs}s`;
  };

  // Helper to fetch server room state and backfill participants & duration
  const enrichMatchDetails = useCallback(
    async (match: ArticulateHistoryItem): Promise<ArticulateHistoryItem> => {
      try {
        const res = await fetch(`/api/articulate/room?code=${match.roomCode}`);
        const data = await res.json();
        if (data.room) {
          const roomData = data.room;
          const allIds = Array.from(
            new Set([
              ...(roomData.teams?.teamA?.playerIds || []),
              ...(roomData.teams?.teamB?.playerIds || []),
              ...(roomData.spectators || []),
              ...Object.keys(roomData.player_details || {}),
            ])
          );

          const realParticipants = allIds.map((id) => {
            const detail = roomData.player_details?.[id];
            const team = (roomData.teams?.teamA?.playerIds || []).includes(id)
              ? ("A" as const)
              : (roomData.teams?.teamB?.playerIds || []).includes(id)
              ? ("B" as const)
              : null;
            return {
              id,
              name:
                detail?.name && detail.name !== "Scholar" && detail.name !== "Learner"
                  ? detail.name
                  : id === roomData.host_id
                  ? roomData.host_name
                  : `Scholar (${id.replace(/^guest-/, "").slice(0, 5)})`,
              avatar: detail?.avatar || "/avatars/avatar-scholar.svg",
              team,
              isHost: id === roomData.host_id,
            };
          });

          let realDuration = match.durationSeconds || 0;
          if (roomData.created_at && roomData.updated_at) {
            const start = new Date(roomData.created_at).getTime();
            const end = new Date(roomData.updated_at).getTime();
            const diff = Math.round((end - start) / 1000);
            if (diff > 20) {
              realDuration = diff;
            }
          }

          if (!realDuration || realDuration <= 0) {
            const totalScore = (match.scoreA || 0) + (match.scoreB || 0);
            const rounds = roomData.current_turn?.roundNumber || Math.max(1, Math.ceil(totalScore / 3.5));
            const timer = roomData.settings?.timerSeconds || 45;
            realDuration = rounds * timer + Math.round(rounds * 20);
          }

          const enriched: ArticulateHistoryItem = {
            ...match,
            scoreA: roomData.teams?.teamA?.score ?? match.scoreA,
            scoreB: roomData.teams?.teamB?.score ?? match.scoreB,
            scoreGoal: roomData.settings?.scoreGoal || match.scoreGoal || 20,
            teamAColor: roomData.teams?.teamA?.color || match.teamAColor || "#EF4444",
            teamBColor: roomData.teams?.teamB?.color || match.teamBColor || "#3B82F6",
            teamAName: roomData.teams?.teamA?.name || match.teamAName || "Team Alpha",
            teamBName: roomData.teams?.teamB?.name || match.teamBName || "Team Omega",
            gameMode: roomData.settings?.gameMode || match.gameMode || "classic",
            durationSeconds: realDuration,
            totalParticipants: realParticipants.length > 0 ? realParticipants.length : match.totalParticipants || 2,
            participants: realParticipants.length > 0 ? realParticipants : match.participants,
          };

          saveArticulateRoom(enriched);
          return enriched;
        }
      } catch (err) {
        console.warn("Could not enrich completed match:", err);
      }
      return match;
    },
    [saveArticulateRoom]
  );

  // When opening a completed match, enrich it immediately
  const handleOpenCompletedMatch = async (match: ArticulateHistoryItem) => {
    setSelectedCompletedMatch(match);
    setIsLoadingMatchDetails(true);
    try {
      const enriched = await enrichMatchDetails(match);
      setSelectedCompletedMatch(enriched);
    } finally {
      setIsLoadingMatchDetails(false);
    }
  };

  // Auto-enrich any legacy completed match missing participant lists or duration on mount
  useEffect(() => {
    const legacyRooms = (articulateHistory || []).filter(
      (r) => r.status === "game_over" && (!r.participants || r.participants.length === 0 || !r.durationSeconds)
    );
    legacyRooms.forEach((r) => {
      enrichMatchDetails(r);
    });
  }, [articulateHistory, enrichMatchDetails]);

  const {
    timerSeconds, setTimerSeconds,
    selectedCategories, toggleCategory, setSelectedCategories,
    difficulty, setDifficulty,
    numberOfRounds, setNumberOfRounds,
    playersA, playersB, setPlayers,
    colorA, colorB, setColors,
    scoreGoal, setScoreGoal,
    gameMode, setGameMode,
    feyVoiceEnabled, setFeyVoiceEnabled,
    aiRefereeEnabled, setAiRefereeEnabled,
    startGame
  } = useGameStore();

  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");

  const activeRooms = (articulateHistory || []).filter((r) => r.status !== "game_over");
  const completedRooms = (articulateHistory || []).filter((r) => r.status === "game_over");

  const AVAILABLE_COLORS = [
    { name: "Red", hex: "#EF4444" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Green", hex: "#10B981" },
    { name: "Orange", hex: "#F97316" },
    { name: "Purple", hex: "#8B5CF6" },
    { name: "Gold", hex: "#F59E0B" }
  ];

  const addPlayerA = () => {
    if (inputA.trim()) {
      setPlayers([...playersA, inputA.trim()], playersB);
      setInputA("");
    }
  };

  const addPlayerB = () => {
    if (inputB.trim()) {
      setPlayers(playersA, [...playersB, inputB.trim()]);
      setInputB("");
    }
  };

  const removePlayerA = (idx: number) => {
    const updated = playersA.filter((_, i) => i !== idx);
    setPlayers(updated, playersB);
  };

  const removePlayerB = (idx: number) => {
    const updated = playersB.filter((_, i) => i !== idx);
    setPlayers(playersA, updated);
  };

  const handleCreateOnlineRoom = async () => {
    setIsCreatingOnline(true);
    setOnlineJoinError(null);
    try {
      const effectiveHostId =
        profile?.id ||
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `scholar-${Math.random().toString(36).slice(2, 9)}`);
      const effectiveHostName = profile?.username?.trim() || "Scholar Host";

      if (!profile?.id) {
        updateProfile({ id: effectiveHostId, username: effectiveHostName });
      }

      const res = await fetch("/api/articulate/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostId: effectiveHostId,
          hostName: effectiveHostName,
          settings: {
            timerSeconds: onlineTimerSeconds,
            scoreGoal: onlineScoreGoal,
            categories: selectedCategories,
            difficulty,
          },
        }),
      });
      const data = await res.json();
      if (data.room?.room_code) {
        router.push(`/play/room/${data.room.room_code}`);
      } else {
        setOnlineJoinError(data.error || "Failed to create online room");
      }
    } catch (err) {
      console.error("Failed to create room:", err);
      setOnlineJoinError("Network error creating online room");
    } finally {
      setIsCreatingOnline(false);
    }
  };

  const handleJoinOnlineRoom = (e: React.FormEvent) => {
    e.preventDefault();
    let code = onlineJoinCode.trim().toUpperCase();
    if (!code) return;
    if (!code.startsWith("FEY-") && code.length === 4) {
      code = `FEY-${code}`;
    }
    router.push(`/play/room/${code}`);
  };

  const handleLaunch = () => {
    if (playersA.length === 0 || playersB.length === 0) {
      alert("Both teams need at least one player to begin!");
      return;
    }
    startGame();
    onStart();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--terra)] text-white rounded-2xl shadow-sm">
            <Gamepad2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-space font-extrabold text-3xl text-[var(--text)]">Fey Articulate</h1>
            <p className="text-sm text-[var(--text-dim)]">Fast-paced word description party game</p>
          </div>
        </div>

        {/* Mode Selector Pill */}
        <div className="flex p-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] shadow-xs">
          <button
            type="button"
            onClick={() => setPlayMode("online")}
            className={`py-2 px-4 rounded-xl text-xs font-bold font-space flex items-center gap-2 transition cursor-pointer ${
              playMode === "online"
                ? "bg-[var(--terra)] text-white shadow-sm"
                : "text-[var(--text-dim)] hover:text-[var(--text)]"
            }`}
          >
            <Globe className="w-4 h-4" />
            Online Room (Friends)
          </button>
          <button
            type="button"
            onClick={() => setPlayMode("local")}
            className={`py-2 px-4 rounded-xl text-xs font-bold font-space flex items-center gap-2 transition cursor-pointer ${
              playMode === "local"
                ? "bg-[var(--olive)] text-white shadow-sm"
                : "text-[var(--text-dim)] hover:text-[var(--text)]"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Pass-the-Phone (Local)
          </button>
        </div>
      </div>

      {/* Online Room Mode Screen (Clean & Instant) */}
      {playMode === "online" ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Host New Room Card */}
            <div className="surface rounded-3xl p-6 sm:p-8 border border-[var(--border-dim)] space-y-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[var(--terra)]/10 text-[var(--terra)]">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    Real-time Rooms
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="font-space font-extrabold text-2xl text-[var(--text)]">
                    Host an Online Match
                  </h2>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    Start a room in 1 second. Share the link to WhatsApp or group chat and friends can tap to join immediately.
                  </p>
                </div>

                {/* Host Match Configuration */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg)] border border-[var(--border-dim)] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-space text-[var(--text)] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
                      Host Match Settings
                    </span>
                    <span className="text-[10px] text-[var(--text-mute)] font-medium">
                      Host picks rules
                    </span>
                  </div>

                  {/* Sprint Duration Selector: 30s vs 45s vs 60s */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[var(--text-dim)] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[var(--text-mute)]" />
                        Speaking Sprint Duration
                      </span>
                      <span className="font-mono font-bold text-[var(--terra)]">
                        {onlineTimerSeconds}s
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setOnlineTimerSeconds(30)}
                        className={`py-2 px-2 rounded-xl text-xs font-space font-bold border transition-all cursor-pointer text-center ${
                          onlineTimerSeconds === 30
                            ? "bg-[var(--terra)] border-[var(--terra)] text-white shadow-xs"
                            : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:border-[var(--text-dim)]"
                        }`}
                      >
                        ⚡ 30s
                      </button>
                      <button
                        type="button"
                        onClick={() => setOnlineTimerSeconds(45)}
                        className={`py-2 px-2 rounded-xl text-xs font-space font-bold border transition-all cursor-pointer text-center ${
                          onlineTimerSeconds === 45
                            ? "bg-[var(--terra)] border-[var(--terra)] text-white shadow-xs"
                            : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:border-[var(--text-dim)]"
                        }`}
                      >
                        🎯 45s
                      </button>
                      <button
                        type="button"
                        onClick={() => setOnlineTimerSeconds(60)}
                        className={`py-2 px-2 rounded-xl text-xs font-space font-bold border transition-all cursor-pointer text-center ${
                          onlineTimerSeconds === 60
                            ? "bg-[var(--terra)] border-[var(--terra)] text-white shadow-xs"
                            : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:border-[var(--text-dim)]"
                        }`}
                      >
                        ⏱️ 60s
                      </button>
                    </div>
                  </div>

                  {/* Target Score Selector */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[var(--text-dim)] flex items-center gap-1">
                        <Target className="w-3 h-3 text-[var(--text-mute)]" />
                        Winning Target Score
                      </span>
                      <span className="font-mono font-bold text-[var(--olive)]">
                        First to {onlineScoreGoal} pts
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[20, 30, 50, 75, 100].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setOnlineScoreGoal(pts)}
                          className={`py-1.5 px-1.5 rounded-xl text-xs font-space font-bold border transition-all cursor-pointer text-center ${
                            onlineScoreGoal === pts
                              ? "bg-[var(--olive)] border-[var(--olive)] text-white shadow-xs"
                              : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:border-[var(--text-dim)]"
                          }`}
                        >
                          {pts} pts
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-dim)]/60 text-[10px] text-[var(--text-mute)] flex items-center gap-1.5">
                    <Lock className="w-3 h-3 shrink-0" />
                    <span>Round locks when active; late joiners enter in next round.</span>
                  </div>
                </div>

                {onlineJoinError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium">
                    {onlineJoinError}
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateOnlineRoom}
                disabled={isCreatingOnline}
                className="w-full bg-[var(--terra)] text-white py-4 rounded-2xl font-space font-extrabold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {isCreatingOnline ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Room...
                  </>
                ) : (
                  <>
                    Create Room & Invite Friends
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Join Existing Room Card */}
            <div className="surface rounded-3xl p-6 sm:p-8 border border-[var(--border-dim)] space-y-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-[var(--olive)]/10 text-[var(--olive)] w-fit">
                  <Users className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="font-space font-extrabold text-2xl text-[var(--text)]">
                    Join Friend&apos;s Match
                  </h2>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    Have a 4-letter room code from your host? Enter it below to jump directly into the team lobby.
                  </p>
                </div>

                <form onSubmit={handleJoinOnlineRoom} className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)] block mb-1.5">
                      Room Code
                    </label>
                    <input
                      type="text"
                      value={onlineJoinCode}
                      onChange={(e) => setOnlineJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FEY-9K2P"
                      maxLength={10}
                      className="w-full px-4 py-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-lg font-space font-extrabold tracking-wider text-[var(--text)] focus:border-[var(--olive)] focus:outline-none uppercase placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-[var(--text-mute)]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!onlineJoinCode.trim()}
                    className="w-full bg-[var(--olive)] text-white py-3.5 rounded-xl font-space font-bold text-sm shadow-sm hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
                  >
                    Enter Room <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-dim)] text-[11px] text-[var(--text-dim)] text-center">
                💡 Or simply tap the invite link sent to you on WhatsApp or iMessage.
              </div>
            </div>
          </div>

          {/* Active Matches (In Progress) */}
          {activeRooms.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <h3 className="font-space font-extrabold text-lg text-[var(--text)]">
                    Active Matches (In Progress)
                  </h3>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {activeRooms.length} {activeRooms.length === 1 ? "match" : "matches"}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-dim)] hidden sm:block">
                  Pick up right where your match was left off
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeRooms.map((room) => {
                  const statusLabel =
                    room.status === "lobby"
                      ? "In Lobby"
                      : room.status === "round_end"
                      ? `Round ${room.roundNumber} Intermission`
                      : `Round ${room.roundNumber} In Progress`;

                  return (
                    <div
                      key={room.roomCode}
                      className="surface rounded-2xl p-5 border border-[var(--border-dim)] hover:border-[var(--terra)]/40 transition shadow-xs flex flex-col justify-between space-y-4 relative group"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeArticulateRoom(room.roomCode);
                        }}
                        className="absolute top-4 right-4 text-[var(--text-mute)] hover:text-red-500 p-1 rounded-lg hover:bg-[var(--bg)] transition cursor-pointer"
                        title="Dismiss match"
                        aria-label="Dismiss match"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 pr-6 flex-wrap">
                          <span className="font-space font-extrabold text-lg tracking-wider text-[var(--text)]">
                            {room.roomCode}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {statusLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[var(--text-dim)] flex-wrap">
                          <span>Host: <strong className="text-[var(--text)]">{room.hostName || "Scholar"}</strong></span>
                          <span>•</span>
                          <span>{room.date}</span>
                          {room.myTeam && (
                            <>
                              <span>•</span>
                              <span className="font-bold text-[var(--terra)]">
                                Team {room.myTeam === "A" ? "Alpha" : "Omega"}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-dim)] flex items-center justify-between text-xs font-space">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--terra)]" />
                            <span className="font-bold text-[var(--text)]">Team Alpha</span>
                            <span className="font-extrabold text-sm text-[var(--terra)]">{room.scoreA}</span>
                          </div>
                          <span className="text-[var(--text-mute)] text-xs font-normal">vs</span>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-[var(--olive)]">{room.scoreB}</span>
                            <span className="font-bold text-[var(--text)]">Team Omega</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-[var(--olive)]" />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => router.push(`/play/room/${room.roomCode}`)}
                        className="w-full bg-[var(--terra)] text-white py-2.5 px-4 rounded-xl font-space font-bold text-xs shadow-sm hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Resume Match
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Match History (Completed Games) */}
          {completedRooms.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[var(--gold)]" />
                  <h3 className="font-space font-extrabold text-base text-[var(--text)]">
                    Recent Completed Matches
                  </h3>
                </div>
                <span className="text-xs text-[var(--text-dim)]">
                  {completedRooms.length} completed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {completedRooms.slice(0, 4).map((room) => {
                  const winner =
                    room.scoreA > room.scoreB
                      ? "Team Alpha Won"
                      : room.scoreB > room.scoreA
                      ? "Team Omega Won"
                      : "Tie Game";
                  const participantCount = room.totalParticipants || room.participants?.length || 2;

                  return (
                    <div
                      key={room.roomCode}
                      className="surface rounded-2xl p-4 border border-[var(--border-dim)] flex flex-col justify-between relative group hover:border-[var(--olive)]/30 transition-all shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-space font-bold text-sm text-[var(--text)]">
                              {room.roomCode}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20">
                              {winner}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeArticulateRoom(room.roomCode)}
                            className="text-[var(--text-mute)] hover:text-red-500 p-1.5 rounded-lg hover:bg-[var(--bg)] transition cursor-pointer"
                            title="Dismiss"
                            aria-label="Dismiss match from history"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-xs text-[var(--text-dim)] font-space">
                          Final: <strong className="text-[var(--terra)]">Alpha {room.scoreA}</strong> — <strong className="text-[var(--olive)]">{room.scoreB} Omega</strong> • {room.date}
                        </div>

                        {/* Badges: Participants & Time Spent */}
                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-space font-medium text-[var(--text-dim)] bg-[var(--bg-card)] px-2 py-0.5 rounded-md border border-[var(--border-dim)]">
                            <Users className="w-3 h-3 text-[var(--olive)]" />
                            {participantCount} {participantCount === 1 ? "Scholar" : "Scholars"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-space font-medium text-[var(--text-dim)] bg-[var(--bg-card)] px-2 py-0.5 rounded-md border border-[var(--border-dim)]">
                            <Clock className="w-3 h-3 text-[var(--gold)]" />
                            {formatMatchDuration(room.durationSeconds)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenCompletedMatch(room)}
                        className="w-full mt-3 bg-[var(--olive)]/10 hover:bg-[var(--olive)]/20 text-[var(--olive)] py-2 px-3 rounded-xl font-space font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Board & Recap
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Game Rules & Settings */}
          <div className="md:col-span-2 space-y-6">
            <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] space-y-6">
            <h2 className="font-space font-bold text-lg text-[var(--text)] flex items-center gap-2 pb-3 border-b border-[var(--border-dim)]">
              <Settings className="w-4 h-4 text-[var(--olive)]" /> Match Setup
            </h2>

            {/* Game Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)]">Game Mode</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "classic", name: "Classic Articulate", desc: "Teammates guess the words described by the active speaker" },
                  { id: "masterchef", name: "Masterchef Challenge", desc: "One describer for both teams; first team to guess wins the point" }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setGameMode(mode.id as "classic" | "masterchef")}
                    className={`p-3 rounded-2xl font-space transition-all border text-left flex flex-col justify-between h-20 cursor-pointer ${
                      gameMode === mode.id
                        ? "bg-[var(--olive)] border-[var(--olive)] text-white shadow-sm"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:bg-[var(--border-dim)]/20"
                    }`}
                  >
                    <span className="font-extrabold text-xs block">{mode.name}</span>
                    <span className={`text-[9px] leading-tight block mt-1 ${gameMode === mode.id ? "text-white/80" : "text-[var(--text-mute)]"}`}>
                      {mode.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Selection */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)]">Round Timer</label>
              <div className="grid grid-cols-3 gap-3">
                {[30, 45, 60].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTimerSeconds(s)}
                    className={`py-3 rounded-2xl font-space font-bold transition-all border ${
                      timerSeconds === s
                        ? "bg-[var(--olive)] border-[var(--olive)] text-white shadow-sm"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:bg-[var(--border-dim)]/20"
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            {/* Rounds Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)]">Number of Rounds</label>
                <span className="text-[10px] text-[var(--text-dim)]">Game ends when rounds complete or target score is reached</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: 3, label: "3 Rounds" },
                  { value: 5, label: "5 Rounds" },
                  { value: 10, label: "10 Rounds" },
                  { value: 999, label: "🏁 Until Finish" }
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setNumberOfRounds(r.value)}
                    className={`py-3 px-2 rounded-2xl font-space font-bold text-xs transition-all border cursor-pointer ${
                      numberOfRounds === r.value
                        ? "bg-[var(--olive)] border-[var(--olive)] text-white shadow-sm"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:bg-[var(--border-dim)]/20"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)]">Word Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {(["easy", "mixed", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-3 rounded-2xl font-space font-bold capitalize transition-all border cursor-pointer ${
                      difficulty === d
                        ? "bg-[var(--olive)] border-[var(--olive)] text-white shadow-sm"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:bg-[var(--border-dim)]/20"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Score Goal Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)]">Target Score (Spaces to Finish)</label>
                <span className="text-[10px] text-[var(--text-dim)]">Board size & winning goal</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { goal: 30, label: "30 pts (Quick)" },
                  { goal: 50, label: "50 pts (Standard)" },
                  { goal: 100, label: "100 pts (Marathon)" }
                ].map((g) => (
                  <button
                    key={g.goal}
                    type="button"
                    onClick={() => {
                      setScoreGoal(g.goal);
                      // Auto-suggest reasonable rounds for 100 pts if set to low rounds
                      if (g.goal === 100 && (numberOfRounds === 3 || numberOfRounds === 5)) {
                        setNumberOfRounds(999); // Switch to 'Until Finish'
                      }
                    }}
                    className={`py-3 px-2 rounded-2xl font-space font-bold text-xs transition-all border cursor-pointer ${
                      scoreGoal === g.goal
                        ? "bg-[var(--olive)] border-[var(--olive)] text-white shadow-sm"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:bg-[var(--border-dim)]/20"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Selection */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)]">Word Categories</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategories([...GAME_CATEGORIES])}
                    className="text-[10px] uppercase font-bold text-[var(--olive)] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[10px] text-[var(--text-mute)]">|</span>
                  <button
                    onClick={() => setSelectedCategories(["Random"])}
                    className="text-[10px] uppercase font-bold text-[var(--olive)] hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GAME_CATEGORIES.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  const color = CATEGORY_COLORS[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`flex items-center gap-2 p-3 rounded-2xl text-left border transition-all ${
                        active
                          ? "bg-[var(--bg-card)] shadow-sm font-semibold"
                          : "opacity-45 hover:opacity-75"
                      }`}
                      style={{
                        borderColor: active ? color : "var(--border-dim)",
                        borderWidth: active ? "2px" : "1px"
                      }}
                    >
                      <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                      <div className="flex flex-col">
                        <span className="text-xs text-[var(--text)]">{cat}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Teams roster setting */}
        <div className="space-y-6">
          <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] flex flex-col gap-6">
            <h2 className="font-space font-bold text-lg text-[var(--text)] flex items-center gap-2 pb-3 border-b border-[var(--border-dim)]">
              <Users className="w-4 h-4 text-[var(--terra)]" /> Team Rosters
            </h2>

            {/* Team A */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--terra)]" style={{ color: colorA }}>Team Alpha</span>
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colorA }} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Player name..."
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPlayerA()}
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text)] focus:outline-none focus:border-[var(--active-color)]"
                  style={{ "--active-color": colorA } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={addPlayerA}
                  className="p-2 text-white rounded-xl hover:opacity-90"
                  style={{ backgroundColor: colorA }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Team A Color Picker */}
              <div className="space-y-1.5 pb-2">
                <label className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-mute)] block">Team Color</label>
                <div className="flex gap-2">
                  {AVAILABLE_COLORS.map((c) => {
                    const isSelected = colorA === c.hex;
                    const isTaken = colorB === c.hex;
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        disabled={isTaken}
                        onClick={() => setColors(c.hex, colorB)}
                        className={`w-5.5 h-5.5 rounded-full border transition-all relative ${
                          isSelected ? "scale-110 shadow-sm border-[var(--text)]" : "opacity-80 border-transparent hover:opacity-100"
                        }`}
                        style={{
                          backgroundColor: c.hex,
                          cursor: isTaken ? "not-allowed" : "pointer",
                          opacity: isTaken ? 0.15 : 1
                        }}
                        title={isTaken ? `${c.name} (Taken)` : c.name}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {playersA.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-[var(--bg-card)]/60 px-3 py-1.5 rounded-xl border border-[var(--border-dim)] text-xs">
                    <span className="text-[var(--text)] font-medium">{p}</span>
                    <button
                      type="button"
                      onClick={() => removePlayerA(i)}
                      className="text-[var(--text-mute)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team B */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--olive)]" style={{ color: colorB }}>Team Omega</span>
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colorB }} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Player name..."
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPlayerB()}
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text)] focus:outline-none focus:border-[var(--active-color)]"
                  style={{ "--active-color": colorB } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={addPlayerB}
                  className="p-2 text-white rounded-xl hover:opacity-90"
                  style={{ backgroundColor: colorB }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Team B Color Picker */}
              <div className="space-y-1.5 pb-2">
                <label className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-mute)] block">Team Color</label>
                <div className="flex gap-2">
                  {AVAILABLE_COLORS.map((c) => {
                    const isSelected = colorB === c.hex;
                    const isTaken = colorA === c.hex;
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        disabled={isTaken}
                        onClick={() => setColors(colorA, c.hex)}
                        className={`w-5.5 h-5.5 rounded-full border transition-all relative ${
                          isSelected ? "scale-110 shadow-sm border-[var(--text)]" : "opacity-80 border-transparent hover:opacity-100"
                        }`}
                        style={{
                          backgroundColor: c.hex,
                          cursor: isTaken ? "not-allowed" : "pointer",
                          opacity: isTaken ? 0.15 : 1
                        }}
                        title={isTaken ? `${c.name} (Taken)` : c.name}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {playersB.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-[var(--bg-card)]/60 px-3 py-1.5 rounded-xl border border-[var(--border-dim)] text-xs">
                    <span className="text-[var(--text)] font-medium">{p}</span>
                    <button
                      type="button"
                      onClick={() => removePlayerB(i)}
                      className="text-[var(--text-mute)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Features — Opt-in */}
          <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] space-y-4">
            <h2 className="font-space font-bold text-base text-[var(--text)] flex items-center gap-2 pb-3 border-b border-[var(--border-dim)]">
              <Bot className="w-4 h-4 text-[var(--olive)]" /> Fey AI Features
              <span className="ml-auto text-[10px] uppercase font-bold text-[var(--text-mute)] border border-[var(--border-dim)] rounded-full px-2 py-0.5">Optional</span>
            </h2>

            {/* Voice Host toggle */}
            <button
              type="button"
              onClick={() => setFeyVoiceEnabled(!feyVoiceEnabled)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                feyVoiceEnabled
                  ? "bg-[var(--olive)]/10 border-[var(--olive)]/40"
                  : "bg-[var(--bg-card)] border-[var(--border-dim)] hover:border-[var(--olive)]/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                feyVoiceEnabled ? "bg-[var(--olive)] text-white" : "bg-[var(--bg)] text-[var(--text-mute)]"
              }`}>
                <Mic className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-space font-bold text-sm text-[var(--text)]">🎤 Fey Voice Host</p>
                <p className="text-[11px] text-[var(--text-dim)] leading-snug mt-0.5">Fey announces round starts, countdowns, correct answers and game results out loud.</p>
              </div>
              <div className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 flex-shrink-0 ${
                feyVoiceEnabled ? "bg-[var(--olive)]" : "bg-[var(--border-dim)]"
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  feyVoiceEnabled ? "translate-x-4" : "translate-x-0"
                }`} />
              </div>
            </button>

            {/* AI Referee toggle */}
            <button
              type="button"
              onClick={() => setAiRefereeEnabled(!aiRefereeEnabled)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                aiRefereeEnabled
                  ? "bg-[var(--olive)]/10 border-[var(--olive)]/40"
                  : "bg-[var(--bg-card)] border-[var(--border-dim)] hover:border-[var(--olive)]/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                aiRefereeEnabled ? "bg-[var(--olive)] text-white" : "bg-[var(--bg)] text-[var(--text-mute)]"
              }`}>
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-space font-bold text-sm text-[var(--text)]">🤖 AI Referee</p>
                <p className="text-[11px] text-[var(--text-dim)] leading-snug mt-0.5">Fey validates borderline guesses and flags rule violations automatically during play.</p>
              </div>
              <div className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 flex-shrink-0 ${
                aiRefereeEnabled ? "bg-[var(--olive)]" : "bg-[var(--border-dim)]"
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  aiRefereeEnabled ? "translate-x-4" : "translate-x-0"
                }`} />
              </div>
            </button>
          </div>

          {/* Launch Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLaunch}
            className="w-full bg-[var(--terra)] text-white py-4 rounded-2xl font-space font-extrabold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            Start Game <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
      )}

      {/* Completed Match Board & Recap Modal */}
      <AnimatePresence>
        {selectedCompletedMatch && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="surface border border-[var(--border-dim)] rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-dim)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center border border-[var(--gold)]/20">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-space font-extrabold text-lg text-[var(--text)]">
                        Match Board & Summary
                      </h2>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text-dim)]">
                        {selectedCompletedMatch.roomCode}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-dim)]">
                      Played on {selectedCompletedMatch.date}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCompletedMatch(null)}
                  className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-dim)] flex items-center justify-center text-[var(--text-mute)] hover:text-[var(--text)] transition cursor-pointer"
                  aria-label="Close match recap"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Match Winner & Score Banner */}
              <div className="surface rounded-2xl p-5 border border-[var(--gold)]/30 bg-[var(--gold)]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--gold)] font-bold">
                    Match Outcome
                  </span>
                  <div className="text-xl font-space font-extrabold text-[var(--text)] flex items-center gap-2">
                    {selectedCompletedMatch.scoreA > selectedCompletedMatch.scoreB ? (
                      <>
                        <span className="w-3 h-3 rounded-full bg-[var(--terra)]" />
                        Team Alpha Victory!
                      </>
                    ) : selectedCompletedMatch.scoreB > selectedCompletedMatch.scoreA ? (
                      <>
                        <span className="w-3 h-3 rounded-full bg-[var(--olive)]" />
                        Team Omega Victory!
                      </>
                    ) : (
                      "Scholarly Deadlock (Tie)!"
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[var(--bg-card)] px-4 py-2.5 rounded-2xl border border-[var(--border-dim)]">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-[var(--terra)]">Alpha</p>
                    <p className="text-xl font-space font-extrabold text-[var(--terra)]">{selectedCompletedMatch.scoreA}</p>
                  </div>
                  <span className="text-sm font-bold text-[var(--text-mute)]">:</span>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--olive)]">Omega</p>
                    <p className="text-xl font-space font-extrabold text-[var(--olive)]">{selectedCompletedMatch.scoreB}</p>
                  </div>
                </div>
              </div>

              {/* 4-Stat Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="surface rounded-2xl p-3.5 border border-[var(--border-dim)] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-mute)] font-medium">
                    <Users className="w-3.5 h-3.5 text-[var(--olive)]" /> Total Scholars
                  </div>
                  <div className="text-base font-space font-extrabold text-[var(--text)] flex items-center gap-1.5">
                    {isLoadingMatchDetails ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[var(--olive)]" />
                    ) : (
                      selectedCompletedMatch.totalParticipants || selectedCompletedMatch.participants?.length || 2
                    )}
                  </div>
                </div>

                <div className="surface rounded-2xl p-3.5 border border-[var(--border-dim)] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-mute)] font-medium">
                    <Clock className="w-3.5 h-3.5 text-[var(--gold)]" /> Time Spent
                  </div>
                  <div className="text-base font-space font-extrabold text-[var(--text)] flex items-center gap-1.5">
                    {isLoadingMatchDetails ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[var(--gold)]" />
                    ) : (
                      formatMatchDuration(selectedCompletedMatch.durationSeconds)
                    )}
                  </div>
                </div>

                <div className="surface rounded-2xl p-3.5 border border-[var(--border-dim)] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-mute)] font-medium">
                    <Target className="w-3.5 h-3.5 text-[var(--terra)]" /> Target Goal
                  </div>
                  <div className="text-base font-space font-extrabold text-[var(--text)]">
                    {selectedCompletedMatch.scoreGoal || 20} pts
                  </div>
                </div>

                <div className="surface rounded-2xl p-3.5 border border-[var(--border-dim)] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-mute)] font-medium">
                    <Gamepad2 className="w-3.5 h-3.5 text-[var(--olive)]" /> Game Mode
                  </div>
                  <div className="text-base font-space font-extrabold text-[var(--text)] capitalize truncate">
                    {selectedCompletedMatch.gameMode || "Classic"}
                  </div>
                </div>
              </div>

              {/* The Articulate Board Track */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-space font-bold text-sm text-[var(--text)] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                    Final Board Positions
                  </h3>
                  <span className="text-[11px] text-[var(--text-dim)]">
                    Step positions towards {selectedCompletedMatch.scoreGoal || 20} pts
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)]">
                  <BoardMap
                    scoreA={selectedCompletedMatch.scoreA}
                    scoreB={selectedCompletedMatch.scoreB}
                    scoreGoal={selectedCompletedMatch.scoreGoal || 20}
                    colorA={selectedCompletedMatch.teamAColor || "#EF4444"}
                    colorB={selectedCompletedMatch.teamBColor || "#10B981"}
                    activeTeam="A"
                    gameMode={selectedCompletedMatch.gameMode || "classic"}
                  />
                </div>
              </div>

              {/* Participants Roster Breakdown */}
              {isLoadingMatchDetails ? (
                <div className="surface rounded-2xl p-6 border border-[var(--border-dim)] text-center space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--olive)] mx-auto" />
                  <p className="text-xs font-space font-bold text-[var(--text-dim)]">
                    Retrieving scholar roster and match duration from server archive...
                  </p>
                </div>
              ) : selectedCompletedMatch.participants && selectedCompletedMatch.participants.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-space font-bold text-sm text-[var(--text)] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[var(--olive)]" />
                    Participating Scholars ({selectedCompletedMatch.participants.length})
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Team Alpha Roster */}
                    <div className="surface rounded-2xl p-3.5 border border-[var(--terra)]/20 bg-[var(--terra)]/5 space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-[var(--terra)]/20">
                        <span className="font-space font-extrabold text-xs text-[var(--terra)] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--terra)]" />
                          Team Alpha
                        </span>
                        <span className="text-[10px] font-mono text-[var(--terra)] font-bold">
                          {selectedCompletedMatch.participants.filter((p) => p.team === "A").length} Scholars
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {selectedCompletedMatch.participants
                          .filter((p) => p.team === "A")
                          .map((p) => (
                            <div key={p.id} className="flex items-center justify-between gap-2 text-xs py-0.5 border-b border-[var(--border-dim)]/40 last:border-0">
                              <span className="font-medium text-[var(--text)] truncate">{p.name}</span>
                              {p.isHost && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--terra)]/20 text-[var(--terra)] shrink-0">
                                  Host
                                </span>
                              )}
                            </div>
                          ))}
                        {selectedCompletedMatch.participants.filter((p) => p.team === "A").length === 0 && (
                          <p className="text-xs text-[var(--text-mute)] italic">No assigned scholars</p>
                        )}
                      </div>
                    </div>

                    {/* Team Omega Roster */}
                    <div className="surface rounded-2xl p-3.5 border border-[var(--olive)]/20 bg-[var(--olive)]/5 space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-[var(--olive)]/20">
                        <span className="font-space font-extrabold text-xs text-[var(--olive)] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[var(--olive)]" />
                          Team Omega
                        </span>
                        <span className="text-[10px] font-mono text-[var(--olive)] font-bold">
                          {selectedCompletedMatch.participants.filter((p) => p.team === "B").length} Scholars
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {selectedCompletedMatch.participants
                          .filter((p) => p.team === "B")
                          .map((p) => (
                            <div key={p.id} className="flex items-center justify-between gap-2 text-xs py-0.5 border-b border-[var(--border-dim)]/40 last:border-0">
                              <span className="font-medium text-[var(--text)] truncate">{p.name}</span>
                              {p.isHost && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--olive)]/20 text-[var(--olive)] shrink-0">
                                  Host
                                </span>
                              )}
                            </div>
                          ))}
                        {selectedCompletedMatch.participants.filter((p) => p.team === "B").length === 0 && (
                          <p className="text-xs text-[var(--text-mute)] italic">No assigned scholars</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push(`/play/room/${selectedCompletedMatch.roomCode}`)}
                  className="w-full sm:flex-1 bg-[var(--terra)] text-white py-3 px-4 rounded-xl font-space font-bold text-xs shadow-sm hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Re-Open Match Room
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCompletedMatch(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[var(--border-dim)] hover:bg-[var(--bg-card)] text-xs font-space font-bold text-[var(--text-dim)] cursor-pointer transition"
                >
                  Close Recap
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
