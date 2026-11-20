"use client";

import React from "react";
import {
  ArticulateRoom,
  RoomPlayer,
  getNextSpeakerForTeam,
  calculateMatchPlayTime,
  peekNextTurnSchedule,
} from "@/lib/articulate-room";
import {
  Check,
  FastForward,
  Play,
  Trophy,
  Users,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Flag,
  ThumbsDown,
  ThumbsUp,
  Moon,
  CheckCircle2,
  LogOut,
  Crown,
  Mic,
  Clock,
  Timer,
  Loader2,
  UserPlus,
  Zap,
  ChevronDown,
  ChevronUp,
  Map,
  Snowflake,
  Repeat,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BoardMap from "@/app/play/BoardMap";
import RoomWheelCheckpointCard from "./RoomWheelCheckpointCard";

interface RoomRoundEndProps {
  room: ArticulateRoom;
  myPlayerId: string;
  myPlayerName: string;
  isHost: boolean;
  isStartingRound?: boolean;
  presencePlayers?: RoomPlayer[];
  knownNames?: Record<string, { name: string; avatar: string }>;
  onStartNextRound: (speakerId?: string) => void;
  onDisputeWord: (wordIndex: number) => void;
  onResolveDispute: (wordIndex: number, resolution: "concede" | "reject") => void;
  onClaimPassedWord?: (wordIndex: number) => void;
  onResolvePassedClaim?: (wordIndex: number, resolution: "award" | "reject") => void;
  onFinishGame?: () => void;
  onToggleInactive?: (targetPlayerId?: string) => void;
  onLeaveRoom?: () => void;
  onTransferHost?: (targetPlayerId: string) => void;
  onClaimHost?: () => void;
  isHostOnline?: boolean;
  onOpenLobbyQueue?: () => void;
  onAdmitPlayer?: (targetPlayerId: string, targetTeam: "A" | "B" | "C" | "D") => void;
  onAutoAdmitAll?: () => void;
  onSpinWheel?: () => Promise<void> | void;
  onResolveWheelChoice?: (
    choiceType: "forward" | "back" | "freeze" | "freeze_player",
    targetTeam?: "A" | "B" | "C" | "D",
    targetPlayerId?: string,
    targetPlayerName?: string
  ) => Promise<void> | void;
}

export default function RoomRoundEnd({
  room,
  myPlayerId,
  myPlayerName,
  isHost,
  isStartingRound = false,
  presencePlayers = [],
  knownNames = {},
  onStartNextRound,
  onDisputeWord,
  onResolveDispute,
  onClaimPassedWord,
  onResolvePassedClaim,
  onFinishGame,
  onToggleInactive,
  onLeaveRoom,
  onTransferHost,
  onClaimHost,
  isHostOnline = true,
  onOpenLobbyQueue,
  onAdmitPlayer,
  onAutoAdmitAll,
  onSpinWheel,
  onResolveWheelChoice,
}: RoomRoundEndProps) {
  const currentTurn = room.current_turn;
  const scoredWords = room.round_words_scored || [];
  const passedWords = room.round_words_passed || [];

  const turnTeamKey: "A" | "B" | "C" | "D" = currentTurn?.activeTeam || "A";
  const turnTeamObj =
    turnTeamKey === "A"
      ? room.teams.teamA
      : turnTeamKey === "B"
      ? room.teams.teamB
      : turnTeamKey === "C"
      ? room.teams.teamC || room.teams.teamA
      : room.teams.teamD || room.teams.teamA;
  const turnTeamName = turnTeamObj.name;
  const turnTeamColor = turnTeamObj.color;

  const myTeam: "A" | "B" | "C" | "D" | null = (room.teams?.teamA?.playerIds || []).includes(myPlayerId)
    ? "A"
    : (room.teams?.teamB?.playerIds || []).includes(myPlayerId)
    ? "B"
    : (room.teams?.teamC?.playerIds || []).includes(myPlayerId)
    ? "C"
    : (room.teams?.teamD?.playerIds || []).includes(myPlayerId)
    ? "D"
    : null;

  const isDescribingTeam = myTeam === turnTeamKey;
  const isOpposingTeam = myTeam !== null && !isDescribingTeam;

  // Collapsible section states to eliminate excessive scrolling on mobile
  const hasActiveDisputes =
    (room.round_words_scored || []).some((w) => w.disputeStatus === "disputed") ||
    (room.round_words_passed || []).some((w) => w.claimStatus === "claimed");

  const isWheelUnresolved = Boolean(
    room.wheel_state &&
      (room.wheel_state.status === "ready" || room.wheel_state.status === "choosing")
  );
  const isWheelAlreadySpun = Boolean(
    room.wheel_state &&
      (room.wheel_state.status === "choosing" || room.wheel_state.status === "resolved")
  );

  const [showWordAudit, setShowWordAudit] = React.useState<boolean>(true);
  const [showTeamRosters, setShowTeamRosters] = React.useState<boolean>(false);
  const [showWaitingQueue, setShowWaitingQueue] = React.useState<boolean>(true);
  const [showRoadmap, setShowRoadmap] = React.useState<boolean>(true);

  // Score goal & match conclusion calculations
  const playTime = calculateMatchPlayTime(room);
  const scoreGoal = room.settings?.scoreGoal || 20;
  const activeTeamsList: Array<{ key: "A" | "B" | "C" | "D"; team: typeof room.teams.teamA }> = [
    { key: "A", team: room.teams.teamA },
    { key: "B", team: room.teams.teamB },
    ...(room.teams.teamC ? [{ key: "C" as const, team: room.teams.teamC }] : []),
    ...(room.teams.teamD ? [{ key: "D" as const, team: room.teams.teamD }] : []),
  ];

  const reachingGoal = activeTeamsList.filter((t) => (t.team.score ?? 0) >= scoreGoal);
  const isGoalReached = reachingGoal.length > 0;
  const sortedTeams = [...activeTeamsList].sort((a, b) => (b.team.score ?? 0) - (a.team.score ?? 0));
  const topTeam = sortedTeams[0];
  const isTie = sortedTeams.length > 1 && sortedTeams[0].team.score === sortedTeams[1].team.score && (sortedTeams[0].team.score ?? 0) >= scoreGoal;

  const winningTeamKey: "A" | "B" | "C" | "D" | "tie" | null = isGoalReached
    ? isTie
      ? "tie"
      : topTeam.key
    : null;

  const winningTeamName = isTie ? "Tied Teams" : topTeam.team.name;
  const winningTeamColor = isTie ? "var(--gold)" : topTeam.team.color;
  const winningScore = topTeam.team.score;

  // Next round calculation (factors in Wheel Encore turns and Frozen opponent skips)
  const nextRoundNumber = (currentTurn?.roundNumber || 1) + 1;
  const turnSchedule = peekNextTurnSchedule(room);
  const nextActiveTeamKey: "A" | "B" | "C" | "D" = turnSchedule.nextTeamKey;
  const skippedFrozenTeams = turnSchedule.skippedFrozenTeams;
  const isExtraTurn = turnSchedule.isExtraTurn;

  const nextTeam =
    nextActiveTeamKey === "A"
      ? room.teams.teamA
      : nextActiveTeamKey === "B"
      ? room.teams.teamB
      : nextActiveTeamKey === "C"
      ? room.teams.teamC!
      : room.teams.teamD!;

  const nextTeamName = nextTeam.name;
  const nextTeamColor = nextTeam.color;

  const netPoints =
    scoredWords.filter((w) => w.disputeStatus !== "conceded").length +
    passedWords.filter((w) => w.claimStatus === "awarded").length;

  const isPlayerInactive = (pId: string) => {
    return Boolean(room.inactive_players?.includes(pId));
  };

  const isMeInactive = isPlayerInactive(myPlayerId);

  // Helper to resolve player display details
  const getPlayerDisplay = (pId: string) => {
    // 1. If it's me and I have a valid name, prefer local name
    if (pId === myPlayerId && myPlayerName && myPlayerName !== "Scholar" && myPlayerName !== "Learner") {
      return {
        id: pId,
        name: myPlayerName,
        avatar: "/avatars/avatar-scholar.svg",
        team: myTeam,
        isHost: isHost,
        joinedAt: room.player_details?.[pId]?.joinedAt || Date.now(),
      };
    }

    // 2. Persisted details in room
    const detailMatch = room.player_details?.[pId];
    if (detailMatch && detailMatch.name && detailMatch.name !== "Scholar" && detailMatch.name !== "Learner") {
      return {
        id: pId,
        name: detailMatch.name,
        avatar: detailMatch.avatar || "/avatars/avatar-scholar.svg",
        team: room.teams.teamA.playerIds.includes(pId)
          ? ("A" as const)
          : room.teams.teamB.playerIds.includes(pId)
          ? ("B" as const)
          : null,
        isHost: pId === room.host_id,
        joinedAt: detailMatch.joinedAt || Date.now(),
      };
    }

    // 3. Presence match
    const presenceMatch = presencePlayers.find((p) => p.id === pId);
    if (presenceMatch && presenceMatch.name && presenceMatch.name !== "Scholar" && presenceMatch.name !== "Learner") {
      return {
        ...presenceMatch,
        joinedAt: presenceMatch.joinedAt || detailMatch?.joinedAt || Date.now(),
      };
    }

    // 4. Known names cache
    const known = knownNames[pId];
    if (known && known.name && known.name !== "Scholar" && known.name !== "Learner") {
      return {
        id: pId,
        name: known.name,
        avatar: known.avatar || "/avatars/avatar-scholar.svg",
        team: room.teams.teamA.playerIds.includes(pId)
          ? ("A" as const)
          : room.teams.teamB.playerIds.includes(pId)
          ? ("B" as const)
          : null,
        isHost: pId === room.host_id,
        joinedAt: detailMatch?.joinedAt || Date.now(),
      };
    }

    // 5. Host fallback
    if (pId === room.host_id) {
      return {
        id: pId,
        name: room.host_name || "Host",
        avatar: "/avatars/avatar-scholar.svg",
        team: "A" as const,
        isHost: true,
        joinedAt: detailMatch?.joinedAt || Date.now(),
      };
    }

    if (detailMatch?.name) {
      return {
        id: pId,
        name: detailMatch.name,
        avatar: detailMatch.avatar || "/avatars/avatar-scholar.svg",
        team: room.teams.teamA.playerIds.includes(pId)
          ? ("A" as const)
          : room.teams.teamB.playerIds.includes(pId)
          ? ("B" as const)
          : null,
        isHost: pId === room.host_id,
        joinedAt: detailMatch.joinedAt || Date.now(),
      };
    }

    if (presenceMatch) return presenceMatch;

    if (known?.name) {
      return {
        id: pId,
        name: known.name,
        avatar: known.avatar || "/avatars/avatar-scholar.svg",
        team: room.teams.teamA.playerIds.includes(pId)
          ? ("A" as const)
          : room.teams.teamB.playerIds.includes(pId)
          ? ("B" as const)
          : null,
        isHost: pId === room.host_id,
        joinedAt: detailMatch?.joinedAt || Date.now(),
      };
    }

    const cleanId = pId.replace(/^guest-/, "");
    return {
      id: pId,
      name: `Player (${cleanId.slice(0, 5)})`,
      avatar: "/avatars/avatar-scholar.svg",
      team: null,
      isHost: false,
      joinedAt: detailMatch?.joinedAt || Date.now(),
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
      !room.teams.teamA.playerIds.includes(id) &&
      !room.teams.teamB.playerIds.includes(id) &&
      !(room.teams.teamC?.playerIds || []).includes(id) &&
      !(room.teams.teamD?.playerIds || []).includes(id)
  );

  // Sort strictly by joined arrival time ascending (FIFO - who joined first)
  const sortedWaitingScholars = waitingScholarIds
    .map((id) => getPlayerDisplay(id))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));

  // Compute next round speaker using sequential roster rotation
  const rawNextIds = nextTeam?.playerIds || [];
  const nextTeamActiveIds = rawNextIds.filter((id) => !isPlayerInactive(id));
  const lastSpeakerId = room.last_speaker_ids?.[`team${nextActiveTeamKey}` as keyof typeof room.last_speaker_ids];
  const lastSpeakerIndex = room.last_speaker_indices?.[`team${nextActiveTeamKey}` as keyof typeof room.last_speaker_indices];

  const nextSpeakerResult = getNextSpeakerForTeam(
    rawNextIds,
    room.inactive_players || [],
    lastSpeakerId,
    lastSpeakerIndex,
    room.frozen_players || []
  );
  const nextSpeakerId = nextSpeakerResult.speakerId || null;
  const skippedFrozenPlayers = nextSpeakerResult.skippedFrozenPlayerIds || [];

  const nextSpeakerDisplay = nextSpeakerId ? getPlayerDisplay(nextSpeakerId) : null;
  const isMeNextSpeaker = nextSpeakerId === myPlayerId;

  // Dynamic multi-team rosters
  const teamRosterList: Array<{
    key: "A" | "B" | "C" | "D";
    team: typeof room.teams.teamA;
    players: string[];
    activeCount: number;
    inactiveCount: number;
  }> = [
    {
      key: "A",
      team: room.teams.teamA,
      players: room.teams.teamA.playerIds || [],
      activeCount: (room.teams.teamA.playerIds || []).filter((id) => !isPlayerInactive(id)).length,
      inactiveCount: (room.teams.teamA.playerIds || []).filter((id) => isPlayerInactive(id)).length,
    },
    {
      key: "B",
      team: room.teams.teamB,
      players: room.teams.teamB.playerIds || [],
      activeCount: (room.teams.teamB.playerIds || []).filter((id) => !isPlayerInactive(id)).length,
      inactiveCount: (room.teams.teamB.playerIds || []).filter((id) => isPlayerInactive(id)).length,
    },
    ...(room.teams.teamC
      ? [{
          key: "C" as const,
          team: room.teams.teamC,
          players: room.teams.teamC.playerIds || [],
          activeCount: (room.teams.teamC.playerIds || []).filter((id) => !isPlayerInactive(id)).length,
          inactiveCount: (room.teams.teamC.playerIds || []).filter((id) => isPlayerInactive(id)).length,
        }]
      : []),
    ...(room.teams.teamD
      ? [{
          key: "D" as const,
          team: room.teams.teamD,
          players: room.teams.teamD.playerIds || [],
          activeCount: (room.teams.teamD.playerIds || []).filter((id) => !isPlayerInactive(id)).length,
          inactiveCount: (room.teams.teamD.playerIds || []).filter((id) => isPlayerInactive(id)).length,
        }]
      : []),
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5 text-center">
      {/* Round Complete Header */}
      <div className="space-y-1.5">
        <span className="text-xs uppercase tracking-wider font-extrabold text-[var(--olive)]">
          Intermission • Round {currentTurn?.roundNumber} Complete
        </span>
        <h1 className="font-space font-extrabold text-3xl sm:text-4xl text-[var(--text)]">
          {turnTeamName} Won +{netPoints} pts!
        </h1>
        <p className="text-xs text-[var(--text-dim)]">
          Described by <strong className="text-[var(--text)]">{currentTurn?.speakerName}</strong>
        </p>
      </div>

      {/* SECTION 1 (Conditional): Wheel Checkpoint Card (Triggers when landing on tile 7, 14, 21, 28...) */}
      {room.wheel_state && (
        <RoomWheelCheckpointCard
          room={room}
          myPlayerId={myPlayerId}
          myTeam={myTeam}
          isHost={isHost}
          presencePlayers={presencePlayers}
          knownNames={knownNames}
          onSpinWheel={onSpinWheel}
          onResolveWheelChoice={onResolveWheelChoice}
        />
      )}

      {/* SECTION 2: Unified Match Stage Card (Team Standings + Inline Player Rosters + Board Track Drawer + Next Round CTA) */}
      <div className="surface rounded-3xl p-5 sm:p-6 border border-[var(--border-dim)] shadow-sm space-y-5 text-left">
        {/* Top Header: Standings, Your Personal Status & Step Away Toggle */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Map className="w-4 h-4 text-[var(--olive)] shrink-0" />
            <h2 className="font-space font-bold text-sm text-[var(--text)]">
              Match Standings &amp; Players
            </h2>
            {isMeInactive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-space font-bold bg-amber-500/12 text-amber-700 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
                <Moon className="w-3 h-3 text-amber-500 shrink-0" />
                <span>You: Away</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-space font-bold bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>You: Active</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onToggleInactive && (
              <button
                type="button"
                onClick={() => onToggleInactive()}
                className={`px-2.5 py-1 rounded-xl text-xs font-space font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap ${
                  isMeInactive
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-amber-500/12 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/35"
                }`}
              >
                {isMeInactive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Mark Active</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Step Away</span>
                  </>
                )}
              </button>
            )}
            <span className="text-[11px] font-mono font-bold text-[var(--text-mute)]">
              Goal: {scoreGoal} pts
            </span>
          </div>
        </div>

        {/* Team Score Cards (With Players & Availability Directly Inside Each Team Card) + Collapsible Board Grid */}
        <BoardMap
          scoreA={room.teams.teamA.score}
          scoreB={room.teams.teamB.score}
          scoreC={room.teams.teamC?.score}
          scoreD={room.teams.teamD?.score}
          scoreGoal={room.settings.scoreGoal || 20}
          colorA={room.teams.teamA.color}
          colorB={room.teams.teamB.color}
          colorC={room.teams.teamC?.color || "#10B981"}
          colorD={room.teams.teamD?.color || "#F59E0B"}
          nameA={room.teams.teamA.name}
          nameB={room.teams.teamB.name}
          nameC={room.teams.teamC?.name || "Team Delta"}
          nameD={room.teams.teamD?.name || "Team Sigma"}
          activeTeam={nextActiveTeamKey}
          gameMode="classic"
          collapsibleGrid={true}
          defaultGridCollapsed={true}
          renderTeamFooter={(teamId) => {
            const rosterEntry = teamRosterList.find((tr) => tr.key === teamId);
            const players = rosterEntry?.players || [];
            const isTeamFrozen = Boolean((room.frozen_teams || []).includes(teamId));

            return (
              <div className="space-y-1.5">
                {isTeamFrozen && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-space font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 whitespace-nowrap">
                    <Snowflake className="w-2.5 h-2.5 shrink-0" />
                    <span>Frozen Next Turn</span>
                  </div>
                )}

                {players.length === 0 ? (
                  <p className="text-[11px] text-[var(--text-mute)] italic py-0.5">
                    No players on this team
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {players.map((pId) => {
                      const p = getPlayerDisplay(pId);
                      const isMe = pId === myPlayerId;
                      const inactive = isPlayerInactive(pId);
                      const isFrozenPlayer = Boolean((room.frozen_players || []).includes(pId));
                      const isNextSpeaker = nextActiveTeamKey === teamId && nextSpeakerId === pId;

                      return (
                        <div
                          key={pId}
                          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition ${
                            inactive
                              ? "bg-amber-500/5 border-amber-500/20 opacity-75"
                              : isFrozenPlayer
                              ? "bg-blue-500/5 border-blue-500/25"
                              : isMe
                              ? "bg-[var(--bg)] border-[var(--olive)]/35 font-semibold"
                              : "bg-[var(--bg)]/80 border-[var(--border-dim)]/70"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.avatar}
                              alt={p.name}
                              className="w-5 h-5 rounded-full border border-[var(--border-dim)] flex-shrink-0 bg-[var(--bg-card)] object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <span className="truncate text-[var(--text)] font-medium text-xs">
                              {p.name}
                            </span>
                            {isMe && (
                              <span className="text-[10px] text-[var(--olive)] font-bold shrink-0">
                                (You)
                              </span>
                            )}
                            {p.isHost && (
                              <span
                                className="inline-flex items-center justify-center p-0.5 rounded text-[var(--gold)] shrink-0"
                                title="Room Host"
                              >
                                <Crown className="w-3 h-3 fill-current" />
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isNextSpeaker && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-space font-bold bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 whitespace-nowrap">
                                <Mic className="w-2.5 h-2.5 shrink-0" /> Speaker
                              </span>
                            )}
                            {isFrozenPlayer && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-space font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 whitespace-nowrap">
                                <Snowflake className="w-2.5 h-2.5 shrink-0" /> Frozen
                              </span>
                            )}
                            {isHost && onTransferHost && pId !== myPlayerId && pId !== room.host_id && (
                              <button
                                type="button"
                                onClick={() => onTransferHost(pId)}
                                className="p-1 rounded-full border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-dim)] hover:text-[var(--text)] transition cursor-pointer inline-flex items-center justify-center"
                                title={`Make ${p.name} Host`}
                              >
                                <Crown className="w-2.5 h-2.5 text-[var(--gold)] shrink-0" />
                              </button>
                            )}
                            {(isHost || isMe) && onToggleInactive ? (
                              <button
                                type="button"
                                onClick={() => onToggleInactive(isMe ? undefined : pId)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-space font-bold border transition cursor-pointer whitespace-nowrap ${
                                  inactive
                                    ? "bg-amber-500/12 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30"
                                    : "bg-emerald-500/12 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                                }`}
                                title={inactive ? "Tap to mark Active" : "Tap to mark Away"}
                              >
                                {inactive ? (
                                  <>
                                    <Moon className="w-2.5 h-2.5 shrink-0" />
                                    <span>Away</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                    <span>Active</span>
                                  </>
                                )}
                              </button>
                            ) : inactive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-space font-bold bg-amber-500/12 text-amber-700 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
                                <Moon className="w-2.5 h-2.5 shrink-0" /> Away
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-space font-bold bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }}
        />

        {/* Victory Threshold or Next Turn Launch Stage */}
        {isGoalReached ? (
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-[var(--gold)] bg-[var(--gold)]/10 space-y-4 text-center">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--gold)] text-black font-space font-extrabold text-xs shadow-2xs">
                <Trophy className="w-3.5 h-3.5" />
                <span>Target Goal Reached ({scoreGoal} pts) • {playTime.formatted} played</span>
              </div>
              <h3 className="font-space font-extrabold text-xl text-[var(--text)]">
                {winningTeamKey === "tie"
                  ? "Tied at the Victory Threshold!"
                  : `${winningTeamName} Reached the Winning Score (${winningScore} pts)!`}
              </h3>
              <p className="text-xs text-[var(--text-dim)] max-w-md mx-auto leading-relaxed">
                Settle any word challenges below first, then announce the final champion or launch another round.
              </p>
            </div>

            {isHost ? (
              <div className="space-y-2.5">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    try {
                      navigator.vibrate?.(20);
                    } catch {}
                    onFinishGame?.();
                  }}
                  className="w-full bg-[var(--terra)] hover:brightness-110 text-white py-4 rounded-2xl font-space font-extrabold text-base shadow-md flex items-center justify-center gap-2.5 transition cursor-pointer touch-manipulation select-none"
                >
                  <Trophy className="w-5 h-5 text-[var(--gold)]" />
                  <span>Announce Winner &amp; Declare Victory ({winningTeamName})</span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      navigator.vibrate?.(15);
                    } catch {}
                    if (!isStartingRound) onStartNextRound(nextSpeakerId || undefined);
                  }}
                  disabled={isStartingRound}
                  className="w-full py-2.5 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-xs font-space font-bold text-[var(--text-dim)] hover:text-[var(--text)] transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Continue to Round {nextRoundNumber}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-dim)]">
                  Host (<strong>{room.host_name}</strong>) will announce the official match winner once word review is complete.
                </p>
                {!isHostOnline && (
                  <div className="pt-2 space-y-2">
                    {onClaimHost && (
                      <button
                        type="button"
                        onClick={onClaimHost}
                        className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-space font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Claim Host Privileges to Conclude Match</span>
                      </button>
                    )}
                    {onFinishGame && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Declare ${winningTeamName} the official winner and conclude the match now?`)) {
                            onFinishGame();
                          }
                        }}
                        className="w-full bg-[var(--terra)] hover:brightness-110 text-white py-3 rounded-2xl font-space font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Trophy className="w-4 h-4 text-[var(--gold)]" />
                        <span>Announce Winner &amp; Finish Match ({winningTeamName})</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border-dim)] space-y-3 text-center">
            {isExtraTurn && (
              <div className="p-2.5 rounded-xl bg-[var(--gold)]/15 border border-[var(--gold)]/35 text-xs font-space font-bold text-[var(--text)] flex items-center justify-center gap-2">
                <Repeat className="w-4 h-4 text-[var(--gold)] shrink-0" />
                <span>
                  <strong>Encore Turn Active!</strong> {nextTeamName} takes the stage back-to-back!
                </span>
              </div>
            )}

            {skippedFrozenTeams.length > 0 && (
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs font-space font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-500 shrink-0" />
                <span>
                  {skippedFrozenTeams
                    .map((k) => activeTeamsList.find((t) => t.key === k)?.team.name || `Team ${k}`)
                    .join(", ")}{" "}
                  is frozen this turn — skipping to <strong>{nextTeamName}</strong>!
                </span>
              </div>
            )}

            {skippedFrozenPlayers.length > 0 && (
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs font-space font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-500 shrink-0" />
                <span>
                  {skippedFrozenPlayers.map((pid) => getPlayerDisplay(pid).name).join(", ")} is frozen this round — passing the mic to{" "}
                  <strong>{nextSpeakerDisplay?.name || nextTeamName}</strong>!
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-2 text-[var(--text-dim)]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: nextTeamColor }} />
                <span>
                  Next up: <strong style={{ color: nextTeamColor }}>{nextTeamName}</strong>
                  {nextSpeakerDisplay?.name ? ` • ${nextSpeakerDisplay.name}` : ""}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-[var(--text-mute)]">
                Round {nextRoundNumber}
              </span>
            </div>

            {nextTeamActiveIds.length === 0 && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                  All players on <strong>{nextTeamName}</strong> are marked Away. Mark one Active below to start.
                </span>
              </div>
            )}

            {isMeNextSpeaker ? (
              <div className="space-y-1.5">
                <motion.button
                  whileHover={!isStartingRound && !isWheelUnresolved ? { scale: 1.01 } : {}}
                  whileTap={!isStartingRound && !isWheelUnresolved ? { scale: 0.98 } : {}}
                  onClick={() => {
                    try {
                      navigator.vibrate?.(15);
                    } catch {}
                    if (!isStartingRound && !isWheelUnresolved) onStartNextRound(nextSpeakerId || undefined);
                  }}
                  disabled={isStartingRound || isWheelUnresolved}
                  className={`w-full text-white py-3.5 rounded-2xl font-space font-extrabold text-base shadow-md flex items-center justify-center gap-2 transition touch-manipulation select-none ${
                    isStartingRound || isWheelUnresolved ? "opacity-55 cursor-not-allowed" : "cursor-pointer hover:brightness-105"
                  }`}
                  style={{ backgroundColor: "var(--terra)" }}
                >
                  {isStartingRound ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Starting Turn...</span>
                    </>
                  ) : isWheelUnresolved ? (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Complete Wheel Checkpoint Above First</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      <span>I&apos;m the Speaker — Start My Turn</span>
                    </>
                  )}
                </motion.button>
                <p className="text-[11px] text-[var(--text-dim)]">
                  You are describing this round. When you tap start, the 3-second countdown begins for everyone.
                </p>
              </div>
            ) : isHost ? (
              <div className="space-y-1.5">
                <motion.button
                  whileHover={!isStartingRound && !isWheelUnresolved ? { scale: 1.01 } : {}}
                  whileTap={!isStartingRound && !isWheelUnresolved ? { scale: 0.98 } : {}}
                  onClick={() => {
                    try {
                      navigator.vibrate?.(15);
                    } catch {}
                    if (!isStartingRound && !isWheelUnresolved) onStartNextRound(nextSpeakerId || undefined);
                  }}
                  disabled={isStartingRound || isWheelUnresolved}
                  className={`w-full bg-[var(--terra)] text-white py-3.5 px-4 rounded-2xl font-space font-extrabold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition touch-manipulation select-none ${
                    isStartingRound || isWheelUnresolved ? "opacity-55 cursor-not-allowed" : "cursor-pointer hover:brightness-105"
                  }`}
                >
                  {isStartingRound ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" />
                      <span className="truncate">Launching Round {nextRoundNumber}...</span>
                    </>
                  ) : isWheelUnresolved ? (
                    <>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                      <span className="truncate">Complete Wheel Checkpoint First</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
                      <span className="truncate">Start Round {nextRoundNumber} ({nextSpeakerDisplay?.name || nextTeamName})</span>
                    </>
                  )}
                </motion.button>
                <p className="text-[11px] text-[var(--text-dim)]">
                  You can launch as Host, or wait for {nextSpeakerDisplay?.name || nextTeamName} to start when ready.
                </p>
              </div>
            ) : !isHostOnline ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-xs font-bold text-amber-900 dark:text-amber-300">
                  Host ({room.host_name || "Host"}) appears offline
                </div>
                {onClaimHost && (
                  <button
                    type="button"
                    onClick={onClaimHost}
                    className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-space font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Claim Host &amp; Start Round {nextRoundNumber}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="py-1.5 space-y-1">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--text)]">
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: nextTeamColor }} />
                  <span>
                    Waiting for <strong>{nextSpeakerDisplay?.name || nextTeamName}</strong> to start Round {nextRoundNumber}...
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-dim)]">
                  The round will launch automatically on your screen as soon as they tap Start.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quiet Match Control Footer inside Match Standings Card */}
        {((isHost && onFinishGame && !isGoalReached) || onLeaveRoom) && (
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
            <span className="text-[11px] text-[var(--text-mute)]">
              Tap your status pill above to step away or rejoin speaker rotation.
            </span>
            <div className="flex items-center gap-2 ml-auto">
              {isHost && onFinishGame && !isGoalReached && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Conclude this match and show the final podium leaderboard now?")) {
                      onFinishGame();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-space font-bold bg-[var(--bg)] hover:bg-[var(--bg-hover)] text-[var(--text-dim)] hover:text-[var(--text)] border border-[var(--border-dim)] transition inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Conclude match early and reveal final match podium"
                >
                  <Trophy className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
                  <span>End Match Early</span>
                </button>
              )}

              {onLeaveRoom && (
                <button
                  type="button"
                  onClick={onLeaveRoom}
                  className="px-3 py-1.5 rounded-xl text-xs font-space font-bold bg-[var(--bg)] hover:bg-[var(--terra)]/10 text-[var(--text-dim)] hover:text-[var(--terra)] border border-[var(--border-dim)] hover:border-[var(--terra)]/30 transition inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Leave this match and return to the parlor"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Leave Match</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Word Audit & Disputes (With Maker-Checker Subtitle Inside) */}
      <div className="surface rounded-3xl p-5 sm:p-6 border border-[var(--border-dim)] shadow-sm space-y-3.5 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-space font-bold text-sm text-[var(--text)]">Word Audit &amp; Disputes</h3>
              {hasActiveDisputes && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30 animate-pulse">
                  Action Needed
                </span>
              )}
            </div>
            {(scoredWords.length > 0 || passedWords.length > 0) && (
              <p className="text-[11px] text-[var(--text-dim)]">
                Opponents can challenge questionable words; a point is only voided if the describing team confirms.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-emerald-600 whitespace-nowrap">+{netPoints} Confirmed</span>
            <button
              type="button"
              onClick={() => setShowWordAudit((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-space font-bold border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text)] transition cursor-pointer shadow-2xs whitespace-nowrap touch-manipulation select-none active:scale-95"
              title={showWordAudit ? "Collapse Word List" : "Expand Word List"}
            >
              {showWordAudit ? (
                <>
                  <ChevronUp size={13} />
                  <span>Hide Words</span>
                </>
              ) : (
                <>
                  <ChevronDown size={13} />
                  <span>View Words ({scoredWords.length + passedWords.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {showWordAudit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 overflow-hidden"
            >
              {scoredWords.length > 0 ? (
          <div className="space-y-3">
            {scoredWords.map((w, idx) => {
              const isDisputed = w.disputeStatus === "disputed";
              const isConceded = w.disputeStatus === "conceded";
              const isRejected = w.disputeStatus === "rejected";
              const disputeCount = w.disputeCount || (w.disputeStatus && w.disputeStatus !== "none" ? 1 : 0);
              const canDisputeAgain = disputeCount < 3;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isConceded
                      ? "bg-red-500/5 border-red-500/30 opacity-75"
                      : isDisputed
                      ? "bg-amber-500/10 border-amber-500/50 shadow-sm"
                      : "bg-[var(--bg-card)] border-[var(--border-dim)]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isConceded ? (
                        <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs font-bold">
                          ✕
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                      <span className={`text-sm font-bold ${isConceded ? "line-through text-red-500/80" : "text-[var(--text)]"}`}>
                        {w.word}
                      </span>
                      <span className="text-[10px] text-[var(--text-mute)] uppercase tracking-wider">
                        ({w.category})
                      </span>
                    </div>

                    {/* Status Badge or Challenge Action */}
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {!w.disputeStatus || w.disputeStatus === "none" ? (
                        isOpposingTeam && !isWheelAlreadySpun ? (
                          <button
                            type="button"
                            onClick={() => onDisputeWord(idx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 cursor-pointer transition shadow-2xs"
                          >
                            <Flag className="w-3 h-3" /> Challenge Word
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600">
                            +1 Valid Point
                          </span>
                        )
                      ) : isDisputed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-500/15 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" /> Disputed by {w.disputedBy} {disputeCount > 1 && `(${disputeCount}/3)`}
                        </span>
                      ) : isConceded ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-red-500">
                            Voided (Confirmed by {w.concededBy})
                          </span>
                          {canDisputeAgain && isDescribingTeam && !isWheelAlreadySpun && (
                            <button
                              type="button"
                              onClick={() => onDisputeWord(idx)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 cursor-pointer transition shadow-2xs"
                              title="Re-open discussion with opponents"
                            >
                              <Sparkles className="w-3 h-3" /> Re-Open ({3 - disputeCount} left)
                            </button>
                          )}
                        </div>
                      ) : isRejected ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-emerald-600">
                            Point Upheld (Dispute Contested)
                          </span>
                          {canDisputeAgain && isOpposingTeam && !isWheelAlreadySpun && (
                            <button
                              type="button"
                              onClick={() => onDisputeWord(idx)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 cursor-pointer transition shadow-2xs"
                              title="Challenge again after further discussion"
                            >
                              <Flag className="w-3 h-3" /> Re-Challenge ({3 - disputeCount} left)
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Checker Resolution Section for Describing Team */}
                  {isDisputed && isDescribingTeam && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <span className="text-xs text-[var(--text-dim)]">
                        Opponents challenged this word (Attempt {disputeCount}/3). Did your team legitimately articulate it?
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onResolveDispute(idx, "concede")}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-500 transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <ThumbsDown className="w-3 h-3" /> Concede (-1 pt)
                        </button>
                        <button
                          type="button"
                          onClick={() => onResolveDispute(idx, "reject")}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <ThumbsUp className="w-3 h-3" /> Contest (Keep Point)
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {isDisputed && isOpposingTeam && (
                    <div className="mt-2 pt-2 border-t border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 italic">
                      ⏳ Challenge submitted (Attempt {disputeCount}/3). Awaiting confirmation/concession from the describing team.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-mute)] italic">No words were scored this round.</p>
        )}

        {passedWords.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-[var(--border-dim)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)]">
                Words Passed ({passedWords.length})
              </span>
              <span className="text-[10px] text-[var(--text-dim)] italic">
                Did your team guess one before time? Claim it for opposing team confirmation.
              </span>
            </div>
            <div className="space-y-2">
              {passedWords.map((w, idx) => {
                const isClaimPending = w.claimStatus === "claimed";
                const isAwarded = w.claimStatus === "awarded";
                const isClaimRejected = w.claimStatus === "rejected";
                const claimCount = w.claimCount || (w.claimStatus && w.claimStatus !== "none" ? 1 : 0);
                const canClaimAgain = claimCount < 3;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all ${
                      isAwarded
                        ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs"
                        : isClaimPending
                        ? "bg-amber-500/10 border-amber-500/50 shadow-xs"
                        : "bg-[var(--bg)] border-[var(--border-dim)]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isAwarded ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                        ) : (
                          <FastForward className="w-4 h-4 text-[var(--text-mute)] flex-shrink-0" />
                        )}
                        <span className={`text-sm font-bold ${isAwarded ? "text-emerald-700 dark:text-emerald-300" : "text-[var(--text)]"}`}>
                          {w.word}
                        </span>
                        <span className="text-[10px] text-[var(--text-mute)] uppercase tracking-wider">
                          ({w.category})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {!w.claimStatus || w.claimStatus === "none" ? (
                          isDescribingTeam && !isWheelAlreadySpun ? (
                            <button
                              type="button"
                              onClick={() => onClaimPassedWord?.(idx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border border-[var(--olive)]/40 bg-[var(--olive)]/10 hover:bg-[var(--olive)]/20 text-[var(--olive)] cursor-pointer transition shadow-2xs"
                            >
                              <Sparkles className="w-3 h-3" /> We Got This (+1)
                            </button>
                          ) : (
                            <span className="text-[10px] text-[var(--text-mute)] italic">Passed</span>
                          )
                        ) : isClaimPending ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-500/15 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3" /> Claimed by {w.claimedBy} {claimCount > 1 && `(${claimCount}/3)`}
                          </span>
                        ) : isAwarded ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-emerald-600">
                              +1 Point Awarded (Confirmed by {w.awardedBy})
                            </span>
                            {canClaimAgain && isOpposingTeam && !isWheelAlreadySpun && (
                              <button
                                type="button"
                                onClick={() => onResolvePassedClaim?.(idx, "reject")}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 cursor-pointer transition shadow-2xs"
                                title="Revoke award if confirmed by mistake"
                              >
                                Revoke ({3 - claimCount} left)
                              </button>
                            )}
                          </div>
                        ) : isClaimRejected ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-[var(--text-mute)] line-through">
                              Claim Declined
                            </span>
                            {canClaimAgain && isDescribingTeam && !isWheelAlreadySpun && (
                              <button
                                type="button"
                                onClick={() => onClaimPassedWord?.(idx)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-[var(--olive)]/40 bg-[var(--olive)]/10 hover:bg-[var(--olive)]/20 text-[var(--olive)] cursor-pointer transition shadow-2xs"
                                title="Try claiming again after further discussion on call"
                              >
                                <Sparkles className="w-3 h-3" /> Re-Claim ({3 - claimCount} left)
                              </button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Opposing team confirmation buttons for pending claims */}
                    {isClaimPending && isOpposingTeam && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2.5 pt-2.5 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <span className="text-xs text-[var(--text-dim)]">
                          {turnTeamName} claims they articulated &amp; guessed this (Attempt {claimCount}/3). Confirm point?
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onResolvePassedClaim?.(idx, "reject")}
                            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-zinc-600/20 text-[var(--text-dim)] hover:bg-zinc-600/30 transition cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => onResolvePassedClaim?.(idx, "award")}
                            className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3 h-3" /> Confirm (+1)
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {isClaimPending && isDescribingTeam && (
                      <div className="mt-2 pt-2 border-t border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 italic">
                        ⏳ Claim submitted (Attempt {claimCount}/3). Waiting for opposing team confirmation.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Waiting Scholars & Spectators Queue (Only rendered when someone is waiting) */}
      {sortedWaitingScholars.length > 0 && (
        <div className="surface rounded-3xl p-5 border border-[var(--gold)]/40 bg-[var(--gold)]/5 shadow-sm space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[var(--gold)] animate-pulse" />
              <h2 className="font-space font-extrabold text-sm text-[var(--text)]">
                Waiting in Lobby Queue ({sortedWaitingScholars.length} Players)
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
              <button
                type="button"
                onClick={() => setShowWaitingQueue((v) => !v)}
                className="p-1.5 rounded-lg border border-[var(--border-dim)] text-[var(--text-dim)] hover:text-[var(--text)] transition cursor-pointer touch-manipulation select-none active:scale-95"
                title={showWaitingQueue ? "Collapse waiting queue" : "Expand waiting queue"}
              >
                {showWaitingQueue ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {showWaitingQueue && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 overflow-hidden"
              >
                <p className="text-xs text-[var(--text-dim)]">
                  These scholars joined during the sprint. Admit them into a team before launching Round {nextRoundNumber}.
                </p>

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
                          <div className="flex items-center gap-1 flex-wrap">
                            {activeTeamsList.map((t) => (
                              <button
                                key={t.key}
                                type="button"
                                onClick={() => onAdmitPlayer(scholar.id, t.key)}
                                className="text-[11px] font-space font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 hover:brightness-110"
                                style={{
                                  backgroundColor: `${t.team.color}15`,
                                  color: t.team.color,
                                  borderColor: `${t.team.color}40`,
                                }}
                                title={`Admit ${scholar.name} into ${t.team.name}`}
                              >
                                <UserPlus className="w-3 h-3" /> + {t.team.name.replace("Team ", "")}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
