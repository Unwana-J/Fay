"use client";

import React from "react";
import { ArticulateRoom, RoomPlayer, getNextSpeakerForTeam } from "@/lib/articulate-room";
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
  Loader2,
  UserPlus,
  Zap,
  ChevronDown,
  ChevronUp,
  Map,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BoardMap from "@/app/play/BoardMap";

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

  const [showWordAudit, setShowWordAudit] = React.useState<boolean>(true);
  const [showTeamRosters, setShowTeamRosters] = React.useState<boolean>(false);
  const [showWaitingQueue, setShowWaitingQueue] = React.useState<boolean>(true);
  const [showRoadmap, setShowRoadmap] = React.useState<boolean>(true);

  // Score goal & match conclusion calculations
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

  // Next round calculation
  const nextRoundNumber = (currentTurn?.roundNumber || 1) + 1;
  const activeTeamKeys = activeTeamsList.map((t) => t.key);
  const nextActiveTeamKey: "A" | "B" | "C" | "D" = activeTeamKeys[(nextRoundNumber - 1) % activeTeamKeys.length];

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
      name: `Scholar (${cleanId.slice(0, 5)})`,
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
    lastSpeakerIndex
  );
  const nextSpeakerId = nextSpeakerResult.speakerId || null;

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
    <div className="max-w-2xl mx-auto space-y-6 text-center">
      {/* Round Complete Header */}
      <div className="space-y-2">
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

      {/* Victory Threshold Notice (Allows full review & contesting before declaring game over) */}
      {isGoalReached && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="surface rounded-3xl p-5 border-2 border-[var(--gold)] bg-[var(--gold)]/10 shadow-lg text-center space-y-2.5 relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--gold)] text-black font-space font-extrabold text-xs shadow-xs">
            <Trophy className="w-3.5 h-3.5" />
            <span>Target Goal Reached! ({scoreGoal} pts)</span>
          </div>
          <h3 className="font-space font-extrabold text-xl sm:text-2xl text-[var(--text)]">
            {winningTeamKey === "tie"
              ? "Tied at the Victory Threshold!"
              : `${winningTeamName} has reached the winning score (${winningScore} pts)!`}
          </h3>
          <p className="text-xs text-[var(--text-dim)] max-w-md mx-auto leading-relaxed">
            Review and contest any words below to settle fouls or claims. Once everyone has reviewed, the Host can announce the final champion or launch another round.
          </p>
        </motion.div>
      )}

      {/* Spectator Admission Notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-center gap-2 font-medium"
      >
        <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span>Room is unlocked! Waiting spectators are now drafted into the active roster for Round {nextRoundNumber}.</span>
      </motion.div>

      {/* Maker-Checker Dispute Notice */}
      <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-[11px] text-[var(--text-dim)] flex items-center justify-center gap-2 text-left">
        <ShieldCheck className="w-4 h-4 text-[var(--gold)] flex-shrink-0" />
        <span>
          <strong>Maker-Checker Consensus:</strong> Opponents can challenge questionable words (maker). A point is only voided if the describing team agrees and confirms the concession (checker).
        </span>
      </div>

      {/* Words Scored & Maker-Checker Disputes */}
      <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-dim)]">
          <div className="flex items-center gap-2">
            <h3 className="font-space font-bold text-sm text-[var(--text)]">Word Audit &amp; Disputes</h3>
            {hasActiveDisputes && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30 animate-pulse">
                Action Needed
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600">+{netPoints} Confirmed</span>
            <button
              type="button"
              onClick={() => setShowWordAudit((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-space font-bold border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text)] transition cursor-pointer shadow-2xs touch-manipulation select-none active:scale-95"
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
                        isOpposingTeam ? (
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
                          {canDisputeAgain && isDescribingTeam && (
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
                          {canDisputeAgain && isOpposingTeam && (
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
                          isDescribingTeam ? (
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
                            {canClaimAgain && isOpposingTeam && (
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
                            {canClaimAgain && isDescribingTeam && (
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

      {/* Team Rosters & Player Availability */}
      <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] shadow-sm space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-dim)]">
          <div>
            <h3 className="font-space font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--olive)]" />
              Team Rosters &amp; Availability
            </h3>
            <p className="text-[11px] text-[var(--text-dim)]">
              Check who is active before launching Round {nextRoundNumber}. Away scholars are skipped for speaking.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[var(--text-mute)]">
              {teamRosterList.reduce((acc, t) => acc + t.players.length, 0)} scholars
            </span>
            <button
              type="button"
              onClick={() => setShowTeamRosters((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-space font-bold border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text)] transition cursor-pointer shadow-2xs touch-manipulation select-none active:scale-95"
              title={showTeamRosters ? "Collapse team rosters" : "View team rosters"}
            >
              {showTeamRosters ? (
                <>
                  <ChevronUp size={13} />
                  <span>Hide Rosters</span>
                </>
              ) : (
                <>
                  <ChevronDown size={13} />
                  <span>View Rosters</span>
                </>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {showTeamRosters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className={`grid grid-cols-1 ${teamRosterList.length > 2 ? "sm:grid-cols-2" : "md:grid-cols-2"} gap-4`}>
          {teamRosterList.map(({ key, team, players, activeCount, inactiveCount }) => (
            <div
              key={key}
              className="p-4 rounded-2xl border space-y-3 bg-[var(--bg-card)]"
              style={{ borderColor: `${team.color}35` }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-dim)]/60">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shadow-xs shrink-0"
                    style={{ backgroundColor: team.color }}
                  />
                  <strong className="font-space font-bold text-xs text-[var(--text)]">
                    {team.name}
                  </strong>
                  <span className="text-[10px] font-bold text-[var(--text-mute)]">
                    ({team.score} pts)
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border-dim)] text-[var(--text-dim)]">
                  {activeCount} Active · {inactiveCount} Away
                </span>
              </div>

              <div className="space-y-2">
                {players.length === 0 ? (
                  <p className="text-xs text-[var(--text-mute)] italic py-2 text-center">
                    No scholars on this team
                  </p>
                ) : (
                  players.map((pId) => {
                    const p = getPlayerDisplay(pId);
                    const isMe = pId === myPlayerId;
                    const inactive = isPlayerInactive(pId);
                    const isNextSpeaker = nextActiveTeamKey === key && nextSpeakerId === pId;

                    return (
                      <div
                        key={pId}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs transition ${
                          inactive
                            ? "bg-amber-500/5 border-amber-500/20 opacity-70"
                            : isMe
                            ? "bg-[var(--olive)]/10 border-[var(--olive)]/30 font-semibold"
                            : "bg-[var(--bg)] border-[var(--border-dim)]/70"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="w-6 h-6 rounded-full border border-[var(--border-dim)] flex-shrink-0 bg-[var(--bg-card)] object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <span className="truncate text-[var(--text)]">
                            {p.name} {isMe && <span className="text-[10px] text-[var(--olive)] font-bold">(You)</span>}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {p.isHost && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-amber-500/15 text-amber-600 font-bold border border-amber-500/30">
                              <Crown className="w-2.5 h-2.5" /> Host
                            </span>
                          )}
                          {isNextSpeaker && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/15 text-emerald-600 font-bold border border-emerald-500/30">
                              <Mic className="w-2.5 h-2.5" /> Speaker
                            </span>
                          )}
                          {isHost && onTransferHost && pId !== myPlayerId && pId !== room.host_id && (
                            <button
                              type="button"
                              onClick={() => onTransferHost(pId)}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-950 transition cursor-pointer inline-flex items-center gap-0.5 shadow-2xs"
                              title={`Transfer host privileges to ${p.name}`}
                            >
                              <Crown className="w-2.5 h-2.5" />
                              <span className="hidden sm:inline">Make Host</span>
                            </button>
                          )}
                          {isHost && onToggleInactive && (
                            <button
                              type="button"
                              onClick={() => onToggleInactive(pId)}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition cursor-pointer inline-flex items-center gap-1 shadow-2xs ${
                                inactive
                                  ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                                  : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30"
                              }`}
                              title={inactive ? "Host Control: Mark scholar as Active" : "Host Control: Mark scholar as Away"}
                            >
                              {inactive ? "Active" : "Away"}
                            </button>
                          )}
                          {inactive ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/30">
                              <Moon className="w-2.5 h-2.5" /> Away
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Your Match Status & Availability Controls */}
      <div className="surface rounded-3xl p-5 border border-[var(--border-dim)] shadow-sm space-y-3 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-[var(--olive)]">
                Your Status
              </span>
              {isMeInactive ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                  <Moon className="w-2.5 h-2.5" /> Away / Inactive
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active &amp; Ready
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-dim)] mt-0.5">
              {isMeInactive
                ? "You are marked Away. Teammates can see you are unavailable on WhatsApp/call, and you won't be picked to describe words."
                : "You are marked Active and available to describe or guess in the upcoming sprints."}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onToggleInactive && (
              <button
                type="button"
                onClick={() => onToggleInactive()}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isMeInactive
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                }`}
              >
                {isMeInactive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> I&apos;m Back (Mark Active)
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5" /> Step Away (Mark Inactive)
                  </>
                )}
              </button>
            )}

            {isHost && onFinishGame && !isGoalReached && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Conclude this match and show the final podium leaderboard now?")) {
                    onFinishGame();
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--terra)]/10 hover:bg-[var(--terra)]/20 text-[var(--terra)] border border-[var(--terra)]/30 transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Conclude match early and reveal final match podium"
              >
                <Trophy className="w-3.5 h-3.5" /> End Match Early
              </button>
            )}

            {onLeaveRoom && (
              <button
                type="button"
                onClick={onLeaveRoom}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Leave this match and return to the parlor"
              >
                <LogOut className="w-3.5 h-3.5" /> Leave Match
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Waiting Scholars & Spectators Queue (Admit to balance before next round) */}
      {sortedWaitingScholars.length > 0 && (
        <div className="surface rounded-3xl p-5 border border-[var(--gold)]/40 bg-[var(--gold)]/5 shadow-sm space-y-4 text-left">
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
                  These scholars joined during the sprint. Admit them into Team Alpha or Team Omega before launching Round {nextRoundNumber} to balance the teams.
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

      {/* Articulate Board Map Progression (Roadmap from Start to Finish) */}
      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-mute)] flex items-center gap-1.5">
            <Map className="w-3.5 h-3.5 text-[var(--olive)]" />
            <span>Articulate Roadmap Progression</span>
          </span>
          <button
            type="button"
            onClick={() => setShowRoadmap((v) => !v)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-space font-bold border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text)] transition cursor-pointer shadow-2xs touch-manipulation select-none active:scale-95"
            title={showRoadmap ? "Collapse Roadmap Progression" : "Expand Roadmap Progression"}
          >
            {showRoadmap ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[var(--olive)]" />
                <span>Hide Roadmap</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--olive)]" />
                <span>View Roadmap</span>
              </>
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showRoadmap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Round CTA / Match Victory Controls */}
      <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] shadow-sm space-y-4">
        {isGoalReached ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-dim)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--gold)]">
                <Crown className="w-4 h-4" />
                <span>Match Deciding Phase</span>
              </div>
              <span className="text-[11px] font-bold text-[var(--text-mute)]">Goal: {scoreGoal} pts</span>
            </div>

            {isHost ? (
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    try {
                      navigator.vibrate?.(20);
                    } catch {}
                    onFinishGame?.();
                  }}
                  className="w-full bg-[var(--terra)] hover:brightness-110 text-white py-4 rounded-2xl font-space font-extrabold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 transition cursor-pointer touch-manipulation select-none active:scale-[0.98]"
                >
                  <Trophy className="w-5 h-5 text-[var(--gold)]" />
                  Announce Winner & Declare Victory ({winningTeamName})
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
                  className="w-full py-3 rounded-xl border border-[var(--border-dim)] hover:bg-[var(--bg-hover)] text-xs font-bold text-[var(--text-dim)] hover:text-[var(--text)] transition cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation select-none"
                >
                  <Play className="w-3.5 h-3.5" /> Continue to Round {nextRoundNumber} (Play Another Round)
                </button>

                <p className="text-xs text-[var(--text-dim)]">
                  👑 As Host, verify all word disputes and claims above are settled before announcing the final winner.
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-3 text-center">
                <div className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[var(--text)]">
                  <Trophy className="w-4 h-4 text-[var(--gold)] animate-bounce" />
                  <span>Victory Threshold Reached by <strong>{winningTeamName}</strong>!</span>
                </div>
                <p className="text-xs text-[var(--text-dim)] max-w-sm mx-auto">
                  Review the words above and dispute any fouls. Host ({room.host_name}) will announce the official match winner when review is concluded.
                </p>

                {!isHostOnline && (
                  <div className="pt-2 space-y-2.5">
                    <div className="p-3 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center gap-2 text-xs font-bold text-amber-950">
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                      Host ({room.host_name || "Host"}) appears offline or has left
                    </div>
                    {onClaimHost && (
                      <button
                        type="button"
                        onClick={onClaimHost}
                        className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-space font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition touch-manipulation select-none active:scale-[0.98]"
                      >
                        <Crown className="w-4 h-4 text-neutral-950" />
                        Claim Host Privileges to Conclude Match
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
                        className="w-full bg-[var(--terra)] hover:brightness-110 text-white py-3.5 rounded-2xl font-space font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer touch-manipulation select-none active:scale-[0.98]"
                      >
                        <Trophy className="w-4 h-4 text-[var(--gold)]" />
                        Announce Winner & Finish Match ({winningTeamName})
                      </button>
                    )}
                    <p className="text-xs text-[var(--text-dim)]">
                      The original host is unavailable. Any active scholar can claim host privileges or conclude the match.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[var(--text-dim)]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nextTeamColor }} />
                <span>Next turn: <strong style={{ color: nextTeamColor }}>{nextTeamName}</strong></span>
              </div>
              <span className="text-[11px] font-bold text-[var(--text-mute)]">Round {nextRoundNumber}</span>
            </div>

            {nextTeamActiveIds.length === 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                  All scholars in <strong>{nextTeamName}</strong> are currently marked Away. One member should tap &quot;I&apos;m Back&quot; above before starting.
                </span>
              </div>
            )}

            {isMeNextSpeaker ? (
              <div className="space-y-2">
                <motion.button
                  whileHover={!isStartingRound ? { scale: 1.02 } : {}}
                  whileTap={!isStartingRound ? { scale: 0.98 } : {}}
                  onClick={() => {
                    try {
                      navigator.vibrate?.(15);
                    } catch {}
                    if (!isStartingRound) onStartNextRound(nextSpeakerId || undefined);
                  }}
                  disabled={isStartingRound}
                  className={`w-full text-white py-4 rounded-2xl font-space font-extrabold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition touch-manipulation select-none active:scale-[0.98] ${
                    isStartingRound ? "opacity-75 cursor-not-allowed" : "cursor-pointer animate-pulse"
                  }`}
                  style={{ backgroundColor: nextTeamColor }}
                >
                  {isStartingRound ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starting Sprint...
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 fill-current" />
                      I&apos;m the Speaker — Start My Turn
                    </>
                  )}
                </motion.button>
                <p className="text-xs text-[var(--text-dim)]">
                  🎤 You are describing this round! When you tap start, the 3s countdown begins for everyone.
                </p>
              </div>
            ) : isHost ? (
              <div className="space-y-2">
                <motion.button
                  whileHover={!isStartingRound ? { scale: 1.02 } : {}}
                  whileTap={!isStartingRound ? { scale: 0.98 } : {}}
                  onClick={() => {
                    try {
                      navigator.vibrate?.(15);
                    } catch {}
                    if (!isStartingRound) onStartNextRound(nextSpeakerId || undefined);
                  }}
                  disabled={isStartingRound}
                  className={`w-full bg-[var(--terra)] text-white py-4 rounded-2xl font-space font-extrabold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition touch-manipulation select-none active:scale-[0.98] ${
                    isStartingRound ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {isStartingRound ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Launching Round {nextRoundNumber}...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      Start Round {nextRoundNumber} as Host ({nextSpeakerDisplay?.name || nextTeamName})
                    </>
                  )}
                </motion.button>
                <p className="text-xs text-[var(--text-dim)]">
                  👑 You can launch as Host, or wait for {nextSpeakerDisplay?.name || nextTeamName} to start when ready.
                </p>
              </div>
            ) : !isHostOnline ? (
              <div className="py-2 space-y-3">
                <div className="p-3 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center gap-2 text-xs font-bold text-amber-950">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                  Host ({room.host_name || "Host"}) appears offline or has left
                </div>
                {onClaimHost && (
                  <button
                    type="button"
                    onClick={onClaimHost}
                    className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-space font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition touch-manipulation select-none active:scale-[0.98]"
                  >
                    <Crown className="w-4 h-4 text-neutral-950" />
                    Claim Host & Start Round {nextRoundNumber}
                  </button>
                )}
                <p className="text-xs text-[var(--text-dim)]">
                  The original host left or lost connection. You can claim host controls to launch Round {nextRoundNumber}.
                </p>
              </div>
            ) : myTeam === nextActiveTeamKey ? (
              <div className="py-3 space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-[var(--text)]">
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: nextTeamColor }} />
                  Waiting for <strong>{nextSpeakerDisplay?.name || "your speaker"}</strong> to start the sprint...
                </div>
                <p className="text-xs text-[var(--text-dim)]">
                  Your teammate will describe words. The round will launch on your screen as soon as they tap Start!
                </p>
              </div>
            ) : (
              <div className="py-3 space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-[var(--text)]">
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: nextTeamColor }} />
                  Waiting for {nextSpeakerDisplay?.name ? `${nextSpeakerDisplay.name} (${nextTeamName})` : nextTeamName} to start...
                </div>
                <p className="text-xs text-[var(--text-dim)]">
                  The round will automatically launch on your screen as soon as they start!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
