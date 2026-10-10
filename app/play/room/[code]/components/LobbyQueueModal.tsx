"use client";

import React from "react";
import { ArticulateRoom, RoomPlayer } from "@/lib/articulate-room";
import {
  Users,
  X,
  UserPlus,
  ArrowLeftRight,
  Moon,
  Sparkles,
  ShieldAlert,
  Crown,
  Clock,
  Zap,
  UserX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LobbyQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: ArticulateRoom;
  myPlayerId: string;
  isHost: boolean;
  presencePlayers?: RoomPlayer[];
  knownNames?: Record<string, { name: string; avatar: string }>;
  onAdmitPlayer: (targetPlayerId: string, targetTeam: "A" | "B" | "C" | "D") => void;
  onAutoAdmitAll?: () => void;
  onSwitchPlayerTeam?: (targetPlayerId: string, targetTeam: "A" | "B" | "C" | "D") => void;
  onToggleInactive?: (targetPlayerId: string) => void;
  onKickPlayer?: (targetPlayerId: string) => void;
}

export default function LobbyQueueModal({
  isOpen,
  onClose,
  room,
  myPlayerId,
  isHost,
  presencePlayers = [],
  knownNames = {},
  onAdmitPlayer,
  onAutoAdmitAll,
  onSwitchPlayerTeam,
  onToggleInactive,
  onKickPlayer,
}: LobbyQueueModalProps) {
  if (!isOpen) return null;

  const teamAPlayers = room.teams?.teamA?.playerIds || [];
  const teamBPlayers = room.teams?.teamB?.playerIds || [];
  const teamCPlayers = room.teams?.teamC?.playerIds || [];
  const teamDPlayers = room.teams?.teamD?.playerIds || [];

  const isPlayerInactive = (pId: string) => {
    return Boolean(room.inactive_players?.includes(pId));
  };

  const teamAActiveCount = teamAPlayers.filter((id) => !isPlayerInactive(id)).length;
  const teamBActiveCount = teamBPlayers.filter((id) => !isPlayerInactive(id)).length;
  const teamCActiveCount = teamCPlayers.filter((id) => !isPlayerInactive(id)).length;
  const teamDActiveCount = teamDPlayers.filter((id) => !isPlayerInactive(id)).length;

  const activeTeamsList: Array<{
    key: "A" | "B" | "C" | "D";
    team: typeof room.teams.teamA;
    players: string[];
    activeCount: number;
  }> = [
    { key: "A", team: room.teams.teamA, players: teamAPlayers, activeCount: teamAActiveCount },
    { key: "B", team: room.teams.teamB, players: teamBPlayers, activeCount: teamBActiveCount },
    ...(room.teams.teamC ? [{ key: "C" as const, team: room.teams.teamC, players: teamCPlayers, activeCount: teamCActiveCount }] : []),
    ...(room.teams.teamD ? [{ key: "D" as const, team: room.teams.teamD, players: teamDPlayers, activeCount: teamDActiveCount }] : []),
  ];

  const getPlayerDisplay = (pId: string) => {
    const detail = room.player_details?.[pId];
    if (detail?.name && detail.name !== "Scholar" && detail.name !== "Learner") {
      return {
        id: pId,
        name: detail.name,
        avatar: detail.avatar || "/avatars/avatar-scholar.svg",
        isHost: pId === room.host_id,
        joinedAt: detail.joinedAt || Date.now(),
      };
    }
    const pres = presencePlayers.find((p) => p.id === pId);
    if (pres?.name && pres.name !== "Scholar" && pres.name !== "Learner") {
      return {
        id: pId,
        name: pres.name,
        avatar: pres.avatar || "/avatars/avatar-scholar.svg",
        isHost: pres.isHost || pId === room.host_id,
        joinedAt: pres.joinedAt || Date.now(),
      };
    }
    const known = knownNames[pId];
    if (known?.name && known.name !== "Scholar" && known.name !== "Learner") {
      return {
        id: pId,
        name: known.name,
        avatar: known.avatar || "/avatars/avatar-scholar.svg",
        isHost: pId === room.host_id,
        joinedAt: detail?.joinedAt || Date.now(),
      };
    }
    if (pId === room.host_id) {
      return {
        id: pId,
        name: room.host_name || "Host",
        avatar: "/avatars/avatar-scholar.svg",
        isHost: true,
        joinedAt: detail?.joinedAt || Date.now(),
      };
    }
    const clean = pId.replace(/^guest-/, "");
    return {
      id: pId,
      name: detail?.name || `Scholar (${clean.slice(0, 5)})`,
      avatar: detail?.avatar || "/avatars/avatar-scholar.svg",
      isHost: false,
      joinedAt: detail?.joinedAt || Date.now(),
    };
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
    (id) =>
      !teamAPlayers.includes(id) &&
      !teamBPlayers.includes(id) &&
      !teamCPlayers.includes(id) &&
      !teamDPlayers.includes(id)
  );

  // Sort strictly by joined arrival time ascending (FIFO - who joined first)
  const sortedWaitingScholars = waitingScholarIds
    .map((id) => getPlayerDisplay(id))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));

  const formatJoinedTime = (joinedAt?: number) => {
    if (!joinedAt) return "Just joined";
    const diffSec = Math.max(0, Math.floor((Date.now() - joinedAt) / 1000));
    if (diffSec < 45) return "Just joined";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin === 1) return "1 min ago";
    if (diffMin < 60) return `${diffMin} mins ago`;
    return "Earlier today";
  };

  const isUneven = Math.abs(teamAActiveCount - teamBActiveCount) >= 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="surface border border-[var(--border-dim)] rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-dim)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center border border-[var(--olive)]/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-space font-extrabold text-base sm:text-lg text-[var(--text)]">
                    Lobby & Scholar Roster
                  </h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--olive)]/15 text-[var(--olive)]">
                    {sortedWaitingScholars.length} in Queue
                  </span>
                </div>
                <p className="text-xs text-[var(--text-dim)]">
                  Ordered by arrival time (first joined first) • Admit to balance teams
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--bg-card)] border border-[var(--border-dim)] flex items-center justify-center text-[var(--text-mute)] hover:text-[var(--text)] transition cursor-pointer"
              aria-label="Close Lobby Queue"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Team Balance Summary Bar */}
          <div className={`grid gap-3 ${
            activeTeamsList.length === 4
              ? "grid-cols-2 sm:grid-cols-4"
              : activeTeamsList.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-2"
          }`}>
            {activeTeamsList.map(({ key, team, players, activeCount }) => (
              <div
                key={key}
                className="surface rounded-2xl p-3 border space-y-1"
                style={{ borderColor: `${team.color}40` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-space font-bold text-xs flex items-center gap-1.5 truncate"
                    style={{ color: team.color }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    {team.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border-dim)]">
                    {activeCount} Active
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-dim)]">
                  {players.length} total • {players.length - activeCount} away
                </p>
              </div>
            ))}
          </div>

          {/* Uneven Warning Notice */}
          {isUneven && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 font-medium">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-500" />
                <span>
                  Teams are currently uneven (
                  <strong>{room.teams?.teamA?.name}: {teamAActiveCount}</strong> vs{" "}
                  <strong>{room.teams?.teamB?.name}: {teamBActiveCount}</strong>). Admit waiting scholars below to balance.
                </span>
              </div>
            </div>
          )}

          {/* Waiting Queue List Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--gold)]" />
                <h3 className="font-space font-extrabold text-sm text-[var(--text)]">
                  Waiting in Lobby Queue (Ordered by arrival)
                </h3>
              </div>
              {sortedWaitingScholars.length > 1 && onAutoAdmitAll && isHost && (
                <button
                  type="button"
                  onClick={onAutoAdmitAll}
                  className="text-xs font-space font-bold px-3 py-1 rounded-xl bg-[var(--olive)] text-white hover:opacity-90 flex items-center gap-1.5 shadow-sm cursor-pointer transition"
                >
                  <Zap className="w-3.5 h-3.5" /> Auto-Balance All
                </button>
              )}
            </div>

            {sortedWaitingScholars.length === 0 ? (
              <div className="surface rounded-2xl p-6 border border-[var(--border-dim)] text-center space-y-1">
                <p className="font-space font-bold text-xs text-[var(--text-dim)]">
                  No scholars currently waiting in the lobby queue
                </p>
                <p className="text-[11px] text-[var(--text-mute)]">
                  When new friends click your room invite link, they will appear here in arrival order.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {sortedWaitingScholars.map((scholar, idx) => (
                  <div
                    key={scholar.id}
                    className="surface rounded-2xl p-3 border border-[var(--border-dim)] hover:border-[var(--olive)]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-[var(--bg-card)] border border-[var(--border-dim)] text-[10px] font-mono font-bold flex items-center justify-center text-[var(--text-mute)] flex-shrink-0">
                        #{idx + 1}
                      </span>
                      {scholar.avatar?.startsWith("/") || scholar.avatar?.includes(".svg") ? (
                        <img src={scholar.avatar} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <span className="text-xl flex-shrink-0">{scholar.avatar || "🎓"}</span>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-space font-bold text-xs text-[var(--text)] truncate">
                            {scholar.name}
                          </span>
                          {scholar.id === myPlayerId && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--olive)]/20 text-[var(--olive)]">
                              You
                            </span>
                          )}
                          {idx === 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[var(--gold)]/20 text-[var(--gold)]">
                              1st in Line
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--text-mute)] flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatJoinedTime(scholar.joinedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action Admission Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                      {activeTeamsList.map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => onAdmitPlayer(scholar.id, t.key)}
                          className="flex-1 sm:flex-none text-xs font-space font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center justify-center gap-1 hover:brightness-110"
                          style={{
                            backgroundColor: `${t.team.color}15`,
                            color: t.team.color,
                            borderColor: `${t.team.color}40`,
                          }}
                        >
                          <UserPlus className="w-3 h-3" />
                          + {t.team.name.replace("Team ", "")}
                        </button>
                      ))}

                      {isHost && onKickPlayer && scholar.id !== myPlayerId && scholar.id !== room.host_id && (
                        <button
                          type="button"
                          onClick={() => onKickPlayer(scholar.id)}
                          className="text-xs font-space font-bold p-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition cursor-pointer flex items-center justify-center"
                          title={`Kick ${scholar.name} out of room`}
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Team Management / Re-assignment Section */}
          <div className="space-y-3 pt-2 border-t border-[var(--border-dim)]">
            <h3 className="font-space font-bold text-xs text-[var(--text)] flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-[var(--olive)]" />
              Active Teams & Quick Balance
            </h3>

            <div className={`grid gap-3 ${
              activeTeamsList.length === 4
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                : activeTeamsList.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2"
            }`}>
              {activeTeamsList.map(({ key, team, players, activeCount }) => (
                <div key={key} className="surface rounded-2xl p-3 border border-[var(--border-dim)] space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-[var(--border-dim)]">
                    <span className="font-space font-bold text-xs truncate max-w-[130px]" style={{ color: team.color }}>
                      {team.name} ({players.length})
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-dim)]">
                      {activeCount} Active
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {players.length === 0 ? (
                      <p className="text-xs text-[var(--text-mute)] italic">No scholars on this team</p>
                    ) : (
                      players.map((pId) => {
                        const p = getPlayerDisplay(pId);
                        const inactive = isPlayerInactive(pId);
                        return (
                          <div
                            key={pId}
                            className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-dim)] text-xs"
                          >
                            <span className="truncate flex items-center gap-1.5">
                              {p.avatar?.startsWith("/") || p.avatar?.includes(".svg") ? (
                                <img src={p.avatar} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
                              ) : (
                                <span>{p.avatar || "🎓"}</span>
                              )}
                              <span className={inactive ? "opacity-60 line-through text-[var(--text-mute)]" : "font-medium"}>
                                {p.name}
                              </span>
                            </span>

                            <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
                              {onToggleInactive && (
                                <button
                                  type="button"
                                  onClick={() => onToggleInactive(pId)}
                                  className={`text-[10px] px-1.5 py-0.5 rounded border transition cursor-pointer ${
                                    inactive
                                      ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                                      : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                  }`}
                                  title={inactive ? "Mark active" : "Mark away"}
                                >
                                  {inactive ? "Set Active" : "Away"}
                                </button>
                              )}
                              {onSwitchPlayerTeam && (
                                <div className="flex items-center gap-0.5">
                                  {activeTeamsList
                                    .filter((other) => other.key !== key)
                                    .map((other) => (
                                      <button
                                        key={other.key}
                                        type="button"
                                        onClick={() => onSwitchPlayerTeam(pId, other.key)}
                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--olive)]/15 text-[var(--olive)] hover:bg-[var(--olive)]/25 border border-[var(--olive)]/30 cursor-pointer"
                                        title={`Move to ${other.team.name}`}
                                      >
                                        → {other.team.name.replace("Team ", "")}
                                      </button>
                                    ))}
                                </div>
                              )}
                              {isHost && onKickPlayer && pId !== myPlayerId && pId !== room.host_id && (
                                <button
                                  type="button"
                                  onClick={() => onKickPlayer(pId)}
                                  className="text-[10px] font-bold p-1 rounded border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 cursor-pointer"
                                  title={`Kick ${p.name}`}
                                >
                                  <UserX className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--olive)] text-white font-space font-bold text-xs shadow-sm hover:opacity-95 cursor-pointer transition"
            >
              Done & Return to Match
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
