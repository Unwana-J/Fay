"use client";

import React, { useState } from "react";
import { ArticulateRoom, RoomPlayer } from "@/lib/articulate-room";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/game-words";
import BoardMap from "@/app/play/BoardMap";
import {
  Lock,
  Clock,
  Sparkles,
  Trophy,
  Users,
  Eye,
  ChevronDown,
  ChevronUp,
  Mic,
  Moon,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SpectatorLoungeProps {
  room: ArticulateRoom;
  secondsRemaining: number;
  myPlayerId: string;
  onSendReaction: (emoji: string) => void;
  presencePlayers?: RoomPlayer[];
  knownNames?: Record<string, { name: string; avatar: string }>;
}

export default function SpectatorLounge({
  room,
  secondsRemaining,
  myPlayerId,
  onSendReaction,
  presencePlayers = [],
  knownNames = {},
}: SpectatorLoungeProps) {
  const [showRoster, setShowRoster] = useState(false);
  const [showBoardDetails, setShowBoardDetails] = useState(true);

  const currentTurn = room.current_turn;
  const currentWord = room.deck?.[room.current_word_index];
  const scoreGoal = room.settings?.scoreGoal || 20;

  const scoreA = room.teams?.teamA?.score ?? 0;
  const scoreB = room.teams?.teamB?.score ?? 0;
  const scoreC = room.teams?.teamC?.score ?? 0;
  const scoreD = room.teams?.teamD?.score ?? 0;
  const pctA = Math.min(100, Math.round((scoreA / scoreGoal) * 100));
  const pctB = Math.min(100, Math.round((scoreB / scoreGoal) * 100));

  const isUrgent = secondsRemaining <= 10;

  const activeTeamsList = [
    { key: "A" as const, team: room.teams.teamA, players: room.teams?.teamA?.playerIds || [] },
    { key: "B" as const, team: room.teams.teamB, players: room.teams?.teamB?.playerIds || [] },
    ...(room.teams.teamC ? [{ key: "C" as const, team: room.teams.teamC, players: room.teams.teamC.playerIds }] : []),
    ...(room.teams.teamD ? [{ key: "D" as const, team: room.teams.teamD, players: room.teams.teamD.playerIds }] : []),
  ];

  const activeTeamKey = currentTurn?.activeTeam || "A";
  const activeTeamObj =
    activeTeamKey === "A"
      ? room.teams.teamA
      : activeTeamKey === "B"
      ? room.teams.teamB
      : activeTeamKey === "C"
      ? room.teams.teamC || room.teams.teamA
      : room.teams.teamD || room.teams.teamA;
  const activeTeamName = activeTeamObj.name;
  const activeTeamColor = activeTeamObj.color;

  // Score differential / lead
  const sortedByScore = [...activeTeamsList].sort((a, b) => (b.team.score ?? 0) - (a.team.score ?? 0));
  const leader = sortedByScore[0];
  const second = sortedByScore[1];
  const leadDiff = leader && second ? Math.abs((leader.team.score ?? 0) - (second.team.score ?? 0)) : 0;
  const isTied = leader && second && leader.team.score === second.team.score;
  const leadText = isTied
    ? "Scores are tied!"
    : `${leader.team.name} leads by ${leadDiff} pts`;

  const wordsScoredThisTurn = room.round_words_scored?.length || 0;

  const isPlayerInactive = (pId: string) => {
    return (room.inactive_players || []).includes(pId);
  };

  const getPlayerDisplay = (pId: string) => {
    const detail = room.player_details?.[pId];
    if (detail?.name && detail.name !== "Scholar" && detail.name !== "Learner") {
      return detail;
    }
    const pres = presencePlayers.find((p) => p.id === pId);
    if (pres?.name && pres.name !== "Scholar" && pres.name !== "Learner") {
      return pres;
    }
    const known = knownNames[pId];
    if (known?.name && known.name !== "Scholar" && known.name !== "Learner") {
      return { id: pId, name: known.name, avatar: known.avatar || "/avatars/avatar-scholar.svg", isHost: pId === room.host_id };
    }
    if (pId === room.host_id) {
      return { id: pId, name: room.host_name || "Host", avatar: "/avatars/avatar-scholar.svg", isHost: true };
    }
    if (detail?.name) return detail;
    if (pres) return pres;
    if (known?.name) {
      return { id: pId, name: known.name, avatar: known.avatar || "/avatars/avatar-scholar.svg", isHost: pId === room.host_id };
    }
    const clean = pId.replace(/^guest-/, "");
    return { id: pId, name: `Scholar (${clean.slice(0, 5)})`, avatar: "/avatars/avatar-scholar.svg", isHost: false };
  };

  const teamAPlayers = room.teams?.teamA?.playerIds || [];
  const teamBPlayers = room.teams?.teamB?.playerIds || [];

  const speakerId = currentTurn?.speakerId;
  const rawSpeakerName = currentTurn?.speakerName;
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
        : presencePlayers.find((p) => p.id === speakerId)?.name &&
          presencePlayers.find((p) => p.id === speakerId)!.name !== "Scholar" &&
          !presencePlayers.find((p) => p.id === speakerId)!.name.startsWith("Scholar (")
        ? presencePlayers.find((p) => p.id === speakerId)!.name
        : knownNames[speakerId]?.name &&
          knownNames[speakerId].name !== "Scholar" &&
          !knownNames[speakerId].name.startsWith("Scholar (")
        ? knownNames[speakerId].name
        : speakerId === room.host_id && room.host_name && room.host_name !== "Scholar"
        ? room.host_name
        : rawSpeakerName || "Active Scholar"
      : rawSpeakerName || "Active Scholar";

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-center py-6 px-3 sm:px-4">
      {/* ── 1. Spectator Header Strip ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--terra)]/15 text-[var(--terra)] font-bold font-space uppercase tracking-wider text-[11px]">
            <Eye className="w-3.5 h-3.5" /> Spectator Lounge
          </span>
          <span className="text-[var(--text-dim)] font-medium">
            Round {currentTurn?.roundNumber || 1} in Progress
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 text-[11px] text-[var(--gold)] bg-[var(--gold-dim)]/20 px-3 py-1 rounded-full font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Drafting you into play in {secondsRemaining}s!</span>
        </div>
      </div>

      {/* ── 2. Live Match Arena Hero Card ── */}
      <div className="surface rounded-3xl p-5 sm:p-7 border border-[var(--border-dim)] shadow-md space-y-6">
        {/* Countdown & Speaker Live Tracker */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span
              className="w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: activeTeamColor }}
            />
            <span className="text-xs sm:text-sm font-bold text-[var(--text)]">
              <strong className="text-[var(--text)]">{resolvedSpeakerName}</strong> is articulating for{" "}
              <span className="font-extrabold" style={{ color: activeTeamColor }}>
                {activeTeamName}
              </span>
            </span>
          </div>

          {/* Huge Animated Timer */}
          <motion.div
            animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.9 }}
            className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-space font-extrabold text-4xl sm:text-5xl border transition-colors shadow-xs ${
              isUrgent
                ? "bg-red-500/15 border-red-500 text-red-500"
                : "bg-[var(--bg)] border-[var(--border-dim)] text-[var(--text)]"
            }`}
          >
            <Clock className="w-6 h-6 sm:w-7 sm:h-7 opacity-80" />
            <span>{secondsRemaining}s</span>
          </motion.div>

          {/* Current Category Pill & Round Words Counter */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {currentWord && (
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: CATEGORY_COLORS[currentWord.category] || "var(--olive)" }}
              >
                <span>{CATEGORY_ICONS[currentWord.category] || "📦"}</span>
                <span>Active Category: {currentWord.category}</span>
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--bg)] border border-[var(--border-dim)] text-[var(--text)]">
              <span className="font-mono text-emerald-500 font-extrabold">+{wordsScoredThisTurn}</span>
              <span className="text-[var(--text-dim)]">words scored this round</span>
            </div>
          </div>
        </div>

        {/* ── 3. Prominent Head-to-Head Live Scoreboard ── */}
        <div className="space-y-3 pt-2 border-t border-[var(--border-dim)]/70 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="font-space font-extrabold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[var(--gold)]" /> Live Scoreboard Race
            </span>
            <span className="font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded-md text-[11px]">
              First to {scoreGoal} pts
            </span>
          </div>

          {/* Lead Status Banner */}
          <div className="text-center py-1.5 px-3 rounded-xl bg-[var(--bg)] border border-[var(--border-dim)] text-xs font-bold text-[var(--text)]">
            {leadText}
          </div>

          {/* Team Cards Grid */}
          <div className={`grid gap-3.5 ${
            activeTeamsList.length === 4
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : activeTeamsList.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2"
          }`}>
            {activeTeamsList.map(({ key, team }) => {
              const score = team.score ?? 0;
              const pct = Math.min(100, Math.round((score / scoreGoal) * 100));
              const isSpeaking = activeTeamKey === key;
              return (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border space-y-2 transition-all ${
                    isSpeaking
                      ? "bg-[var(--bg)] shadow-xs ring-2 ring-[var(--olive)]/30"
                      : "bg-[var(--bg-card)] opacity-90"
                  }`}
                  style={{ borderColor: `${team.color}40` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shadow-xs"
                        style={{ backgroundColor: team.color }}
                      />
                      <strong className="font-space font-bold text-sm text-[var(--text)] truncate max-w-[120px]">
                        {team.name}
                      </strong>
                      {isSpeaking && (
                        <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600">
                          Speaking
                        </span>
                      )}
                    </div>
                    <div
                      className="font-space font-extrabold text-2xl"
                      style={{ color: team.color }}
                    >
                      {score}{" "}
                      <span className="text-xs font-normal text-[var(--text-dim)]">/ {scoreGoal}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-[var(--border-dim)]/50 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: team.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-mute)] font-mono">
                      <span>{pct}% completed</span>
                      <span>{Math.max(0, scoreGoal - score)} pts to win</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. Interactive Cheer Reactions ── */}
        <div className="space-y-2 pt-2 border-t border-[var(--border-dim)]/50">
          <p className="text-[11px] text-[var(--text-dim)] font-medium">
            Cheer on the scholars! Tap an emoji to float across all screens:
          </p>
          <div className="flex justify-center gap-2.5">
            {["🔥", "👏", "🧠", "⚡", "🎉", "😱"].map((emoji) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.18 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => onSendReaction(emoji)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[var(--bg)] border border-[var(--border-dim)] hover:border-[var(--olive)] text-xl flex items-center justify-center cursor-pointer shadow-xs transition"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Full Articulate Roadmap Board Map ── */}
      <div className="surface rounded-3xl p-5 sm:p-6 border border-[var(--border-dim)] shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-dim)]">
          <div>
            <h3 className="font-space font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <span>🗺️</span> Articulate Roadmap (Live Board)
            </h3>
            <p className="text-[11px] text-[var(--text-dim)]">
              Follow Team Alpha and Team Omega tokens advancing tile-by-tile to the finish line.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBoardDetails(!showBoardDetails)}
            className="p-1.5 rounded-lg border border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)] cursor-pointer"
            title={showBoardDetails ? "Collapse Board" : "Expand Board"}
          >
            {showBoardDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <AnimatePresence>
          {showBoardDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <BoardMap
                scoreA={scoreA}
                scoreB={scoreB}
                scoreC={scoreC}
                scoreD={scoreD}
                scoreGoal={scoreGoal}
                colorA={room.teams?.teamA?.color || "#EF4444"}
                colorB={room.teams?.teamB?.color || "#3B82F6"}
                colorC={room.teams?.teamC?.color || "#10B981"}
                colorD={room.teams?.teamD?.color || "#F59E0B"}
                nameA={room.teams?.teamA?.name || "Team Alpha"}
                nameB={room.teams?.teamB?.name || "Team Omega"}
                nameC={room.teams?.teamC?.name || "Team Delta"}
                nameD={room.teams?.teamD?.name || "Team Sigma"}
                activeTeam={activeTeamKey}
                gameMode="classic"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 6. Team Rosters & Scholars Overview ── */}
      <div className="surface rounded-3xl p-5 border border-[var(--border-dim)] shadow-sm space-y-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--olive)]" />
            <h4 className="font-space font-bold text-xs text-[var(--text)]">
              Scholars on the Field ({activeTeamsList.reduce((acc, t) => acc + (t.players?.length || 0), 0)} total)
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowRoster(!showRoster)}
            className="text-xs text-[var(--olive)] font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            {showRoster ? "Hide Rosters" : "View Teams"}
            {showRoster ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <AnimatePresence>
          {showRoster && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`grid grid-cols-1 sm:grid-cols-2 ${activeTeamsList.length > 2 ? "lg:grid-cols-4" : ""} gap-3 pt-2`}
            >
              {activeTeamsList.map((teamEntry) => {
                const pList = teamEntry.players || [];
                return (
                  <div
                    key={teamEntry.key}
                    className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-dim)] space-y-1.5"
                  >
                    <strong
                      className="text-[11px] font-bold uppercase tracking-wider block"
                      style={{ color: teamEntry.team.color }}
                    >
                      {teamEntry.team.name} ({pList.length})
                    </strong>
                    <div className="space-y-1">
                      {pList.map((pId) => {
                        const p = getPlayerDisplay(pId);
                        const isDescribing = currentTurn?.speakerId === pId;
                        const away = isPlayerInactive(pId);
                        return (
                          <div
                            key={pId}
                            className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-dim)]/50"
                          >
                            <span className="truncate text-[var(--text)]">{p.name}</span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {p.isHost && (
                                <span className="text-[9px] font-bold text-amber-600 bg-amber-500/10 px-1 rounded">
                                  Host
                                </span>
                              )}
                              {isDescribing && (
                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1 rounded inline-flex items-center gap-0.5">
                                  <Mic className="w-2.5 h-2.5" /> Mic
                                </span>
                              )}
                              {away && (
                                <span className="text-[9px] font-medium text-amber-600 bg-amber-500/10 px-1 rounded">
                                  Away
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {pList.length === 0 && (
                        <p className="text-[11px] text-[var(--text-muted)] italic">No scholars assigned</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
