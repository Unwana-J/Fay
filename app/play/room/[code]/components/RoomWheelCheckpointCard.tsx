"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { ArticulateRoom, RoomPlayer, WHEEL_WEDGES } from "@/lib/articulate-room";
import { FeyLogo } from "@/components/ui/FeyLogo";
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Snowflake,
  RotateCw,
  CheckCircle2,
  Repeat,
  Users,
  UserX,
  Eye,
} from "lucide-react";
import canvasConfetti from "canvas-confetti";

interface RoomWheelCheckpointCardProps {
  room: ArticulateRoom;
  myPlayerId: string;
  myTeam: "A" | "B" | "C" | "D" | null;
  isHost: boolean;
  presencePlayers?: RoomPlayer[];
  knownNames?: Record<string, { name: string; avatar: string }>;
  onSpinWheel?: () => Promise<void> | void;
  onResolveWheelChoice?: (
    choiceType: "forward" | "back" | "freeze" | "freeze_player",
    targetTeam?: "A" | "B" | "C" | "D",
    targetPlayerId?: string,
    targetPlayerName?: string
  ) => Promise<void> | void;
}

export default function RoomWheelCheckpointCard({
  room,
  myPlayerId,
  myTeam,
  isHost,
  presencePlayers = [],
  knownNames = {},
  onSpinWheel,
  onResolveWheelChoice,
}: RoomWheelCheckpointCardProps) {
  const ws = room.wheel_state;
  const controls = useAnimation();

  const [isSpinningAnim, setIsSpinningAnim] = useState(false);
  const [isDispatchingSpin, setIsDispatchingSpin] = useState(false);
  const [isResolvingChoice, setIsResolvingChoice] = useState(false);
  const [selectedRivalKey, setSelectedRivalKey] = useState<"A" | "B" | "C" | "D" | null>(null);
  const lastAnimatedNonceRef = useRef<number | null>(null);

  const activeTeamsList: Array<{ key: "A" | "B" | "C" | "D"; team: typeof room.teams.teamA }> = [
    { key: "A", team: room.teams.teamA },
    { key: "B", team: room.teams.teamB },
    ...(room.teams.teamC ? [{ key: "C" as const, team: room.teams.teamC }] : []),
    ...(room.teams.teamD ? [{ key: "D" as const, team: room.teams.teamD }] : []),
  ];

  const wheelTeamKey = ws?.team || room.current_turn?.activeTeam || "A";
  const wheelTeamObj =
    activeTeamsList.find((t) => t.key === wheelTeamKey)?.team || room.teams.teamA;
  const rivalTeams = activeTeamsList.filter((t) => t.key !== wheelTeamKey);

  // Resolve player name helper for individual player freeze targeting
  const resolvePlayerName = (pId: string) => {
    const detail = room.player_details?.[pId];
    if (detail?.name && detail.name !== "Scholar" && detail.name !== "Learner") {
      return detail.name;
    }
    const pres = presencePlayers.find((p) => p.id === pId);
    if (pres?.name && pres.name !== "Scholar" && pres.name !== "Learner") {
      return pres.name;
    }
    const known = knownNames[pId];
    if (known?.name && known.name !== "Scholar" && known.name !== "Learner") {
      return known.name;
    }
    if (pId === room.host_id && room.host_name) {
      return room.host_name;
    }
    return `Player (${pId.replace(/^guest-/, "").slice(0, 5)})`;
  };

  // Default rival target to the rival with the highest score
  useEffect(() => {
    if (rivalTeams.length > 0 && (!selectedRivalKey || selectedRivalKey === wheelTeamKey)) {
      const sortedRivals = [...rivalTeams].sort(
        (a, b) => (b.team.score ?? 0) - (a.team.score ?? 0)
      );
      setSelectedRivalKey(sortedRivals[0].key);
    }
  }, [wheelTeamKey, rivalTeams.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trigger synchronized wheel spin animation across ALL devices (both teams!) whenever spinNonce updates
  useEffect(() => {
    if (!ws || typeof ws.wedgeIndex !== "number" || !ws.spinNonce) return;
    if (lastAnimatedNonceRef.current === ws.spinNonce) return;

    const winningIndex = ws.wedgeIndex;
    const degPerWedge = 360 / WHEEL_WEDGES.length;
    const targetDeg = 1800 + (270 - (winningIndex * degPerWedge + degPerWedge / 2));

    // If this spin happened more than 12 seconds ago (e.g. page refresh after resolution), jump straight to final angle
    const ageMs = Date.now() - ws.spinNonce;
    lastAnimatedNonceRef.current = ws.spinNonce;

    if (ws.status === "resolved" && ageMs > 12000) {
      controls.set({ rotate: targetDeg });
      return;
    }

    setIsSpinningAnim(true);
    controls.set({ rotate: 0 });
    controls
      .start({
        rotate: targetDeg,
        transition: { duration: 3.4, ease: [0.15, 0.85, 0.3, 1] },
      })
      .then(() => {
        setIsSpinningAnim(false);
        try {
          canvasConfetti({
            particleCount: 28,
            spread: 65,
            origin: { y: 0.6 },
            disableForReducedMotion: true,
          });
        } catch {}
      });
  }, [ws?.spinNonce, ws?.wedgeIndex, ws?.status, controls]);

  if (!ws) return null;

  const isSpeaker = room.current_turn?.speakerId === myPlayerId;
  const isMyWheelTeam = myTeam === wheelTeamKey;
  const wheelTeamHasActiveHuman = (wheelTeamObj.playerIds || []).some(
    (id) => !id.startsWith("ghost-") && !(room.inactive_players || []).includes(id)
  );
  const canControlWheel =
    isMyWheelTeam || isSpeaker || (isHost && !wheelTeamHasActiveHuman);

  const hasPendingAudit =
    (room.round_words_scored || []).some((w) => w.disputeStatus === "disputed") ||
    (room.round_words_passed || []).some((w) => w.claimStatus === "claimed");

  const activeWedge =
    typeof ws.wedgeIndex === "number" ? WHEEL_WEDGES[ws.wedgeIndex] : null;
  const stepsCount = ws.wedgeId === "tactical_3" ? 3 : 2;

  const handleTriggerSpin = async () => {
    if (
      !onSpinWheel ||
      isDispatchingSpin ||
      isSpinningAnim ||
      ws.status !== "ready" ||
      hasPendingAudit
    )
      return;
    setIsDispatchingSpin(true);
    try {
      try {
        navigator.vibrate?.(25);
      } catch {}
      await onSpinWheel();
    } finally {
      setIsDispatchingSpin(false);
    }
  };

  const handleConfirmChoice = async (
    choiceType: "forward" | "back" | "freeze" | "freeze_player",
    explicitTargetTeam?: "A" | "B" | "C" | "D",
    targetPlayerId?: string,
    targetPlayerName?: string
  ) => {
    if (!onResolveWheelChoice || isResolvingChoice) return;
    setIsResolvingChoice(true);
    try {
      try {
        navigator.vibrate?.(20);
      } catch {}
      const target = explicitTargetTeam || selectedRivalKey || rivalTeams[0]?.key || "B";
      await onResolveWheelChoice(choiceType, target, targetPlayerId, targetPlayerName);
    } finally {
      setIsResolvingChoice(false);
    }
  };

  const activeRivalTeam =
    rivalTeams.find((r) => r.key === selectedRivalKey) || rivalTeams[0];
  const activeRivalPlayers = (activeRivalTeam?.team.playerIds || []).map((pid) => ({
    id: pid,
    name: resolvePlayerName(pid),
    isFrozen: Boolean(room.frozen_players?.includes(pid)),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="surface rounded-3xl p-5 sm:p-6 border-2 border-[var(--gold)]/70 bg-gradient-to-b from-[var(--gold)]/12 via-[var(--bg-card)] to-[var(--bg-card)] shadow-xl space-y-5 text-center relative overflow-hidden"
    >
      {/* Top Broadcast Banner (Visible to BOTH the playing team and all opposing teams!) */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--gold)] text-black font-space font-extrabold text-xs shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Wheel Checkpoint • Tile {ws.tileIndex}</span>
        </div>

        <h2 className="font-space font-black text-2xl sm:text-3xl text-[var(--text)] tracking-tight">
          {ws.status === "ready"
            ? `${wheelTeamObj.name} Landed on Tile ${ws.tileIndex}!`
            : isSpinningAnim
            ? `${ws.spunBy || wheelTeamObj.name} Spun the Wheel...`
            : ws.status === "choosing"
            ? `${wheelTeamObj.name} Landed on: ${activeWedge?.label}!`
            : `Wheel Landed on: ${activeWedge?.label}!`}
        </h2>

        <p className="text-xs text-[var(--text-dim)] max-w-md mx-auto leading-relaxed">
          {ws.status === "ready"
            ? isMyWheelTeam
              ? "Your team landed on a Wheel Checkpoint! Tap Spin to see your power-up or sabotage."
              : `Watch live as ${wheelTeamObj.name} spins the Checkpoint Wheel!`
            : isSpinningAnim
            ? "Everyone in the room is watching the wheel spin..."
            : ws.status === "choosing"
            ? isMyWheelTeam
              ? "Make your tactical choice below!"
              : `${wheelTeamObj.name} landed on ${activeWedge?.label} (${activeWedge?.description}) and is choosing their target!`
            : ws.resultSummary}
        </p>
      </div>

      {/* Prominent "Landed On" Broadcast Pill (Visible to all teams as soon as wheel stops) */}
      <AnimatePresence>
        {activeWedge && !isSpinningAnim && ws.status !== "ready" && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border-2 shadow-sm mx-auto"
            style={{
              backgroundColor: `${activeWedge.color}20`,
              borderColor: activeWedge.color,
            }}
          >
            <span
              className="w-3 h-3 rounded-full animate-ping shrink-0"
              style={{ backgroundColor: activeWedge.color }}
            />
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[var(--text-dim)]">
                {wheelTeamObj.name} Spun &amp; Landed On
              </div>
              <div className="font-space font-black text-sm sm:text-base text-[var(--text)]">
                {activeWedge.label} — <span className="font-normal text-xs text-[var(--text-dim)]">{activeWedge.description}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wheel + Interactive Controls Layout */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-1">
        {/* Animated 6-Wedge SVG Wheel */}
        <div className="relative w-60 h-60 sm:w-64 sm:h-64 flex items-center justify-center select-none shrink-0">
          {/* Top Pointer Indicator */}
          <div className="absolute -top-2 z-30 text-2xl text-[var(--gold)] drop-shadow-md">
            ▼
          </div>

          {/* Outer Decorative Ring */}
          <div className="absolute inset-1 rounded-full border-4 border-[var(--gold)]/40 shadow-xl pointer-events-none z-10" />

          <motion.div
            animate={controls}
            initial={{ rotate: 0 }}
            className="w-56 h-56 sm:w-60 sm:h-60 rounded-full overflow-hidden shadow-2xl relative bg-[var(--bg)] border border-[var(--border-dim)]"
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {WHEEL_WEDGES.map((wedge, i) => {
                const startAngle = i * 60;
                const endAngle = (i + 1) * 60;
                const rad = Math.PI / 180;
                const x1 = 50 + 50 * Math.cos(startAngle * rad);
                const y1 = 50 + 50 * Math.sin(startAngle * rad);
                const x2 = 50 + 50 * Math.cos(endAngle * rad);
                const y2 = 50 + 50 * Math.sin(endAngle * rad);
                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                const midAngle = startAngle + 30;
                const textX = 50 + 31 * Math.cos(midAngle * rad);
                const textY = 50 + 31 * Math.sin(midAngle * rad);

                const isWinningWedge =
                  !isSpinningAnim &&
                  ws.status !== "ready" &&
                  ws.wedgeIndex === i;

                return (
                  <g key={wedge.id}>
                    <path
                      d={pathData}
                      fill={wedge.color}
                      stroke={isWinningWedge ? "#FACC15" : "rgba(255,255,255,0.22)"}
                      strokeWidth={isWinningWedge ? "1.6" : "0.6"}
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="#FFFFFF"
                      fontSize="4.2"
                      fontWeight="800"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                      style={{ letterSpacing: "0.02em" }}
                    >
                      {wedge.shortLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </motion.div>

          {/* Center Spin Hub Button */}
          <button
            type="button"
            onClick={handleTriggerSpin}
            disabled={
              ws.status !== "ready" ||
              !canControlWheel ||
              hasPendingAudit ||
              isDispatchingSpin ||
              isSpinningAnim
            }
            className={`absolute w-16 h-16 rounded-full bg-[var(--bg-card)] border-4 shadow-lg flex flex-col items-center justify-center z-20 transition-all ${
              ws.status === "ready" && canControlWheel && !hasPendingAudit
                ? "border-[var(--gold)] hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                : "border-[var(--border-dim)] opacity-90 cursor-default"
            }`}
          >
            {isSpinningAnim || isDispatchingSpin ? (
              <FeyLogo size={24} spinning={true} />
            ) : ws.status === "ready" ? (
              <span className="text-[10px] font-space font-black text-[var(--text)] leading-none text-center">
                TAP
                <br />
                SPIN
              </span>
            ) : (
              <span className="text-[9px] font-space font-extrabold text-[var(--gold)] uppercase">
                LANDED
              </span>
            )}
          </button>
        </div>

        {/* Right Side: Action Panel / Tactical Decision / Result Card */}
        <div className="flex-1 w-full max-w-md space-y-4 text-left">
          {/* Wedge Legend / Ready State */}
          {ws.status === "ready" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {WHEEL_WEDGES.map((w) => (
                  <div
                    key={w.id}
                    className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border-dim)] flex items-start gap-2"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                      style={{ backgroundColor: w.color }}
                    />
                    <div className="min-w-0">
                      <div className="font-space font-bold text-xs text-[var(--text)] truncate">
                        {w.label}
                      </div>
                      <div className="text-[10px] text-[var(--text-dim)] leading-snug">
                        {w.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasPendingAudit ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-800 dark:text-amber-300 text-center font-bold">
                  Resolve the pending word challenge or claim below first to confirm {wheelTeamObj.name}&apos;s landing tile!
                </div>
              ) : canControlWheel ? (
                <button
                  type="button"
                  onClick={handleTriggerSpin}
                  disabled={isDispatchingSpin}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[var(--terra)] hover:brightness-110 text-white font-space font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.98]"
                >
                  <RotateCw className={`w-4 h-4 ${isDispatchingSpin ? "animate-spin" : ""}`} />
                  <span>Spin the Wheel for {wheelTeamObj.name}</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--gold)]/40 text-xs text-[var(--text)] text-center font-medium flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4 text-[var(--gold)] animate-pulse shrink-0" />
                  <span>
                    Watching live — waiting for <strong style={{ color: wheelTeamObj.color }}>{wheelTeamObj.name}</strong> to spin the wheel!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Spinning Animation State */}
          {ws.status !== "ready" && isSpinningAnim && (
            <div className="p-5 rounded-2xl bg-[var(--bg)] border border-[var(--border-dim)] text-center space-y-2">
              <div className="flex justify-center">
                <FeyLogo size={28} spinning={true} />
              </div>
              <div className="font-space font-bold text-sm text-[var(--text)]">
                Wheel in Motion...
              </div>
              <p className="text-xs text-[var(--text-dim)]">
                Hold tight while the pointer locks in what {wheelTeamObj.name} landed on!
              </p>
            </div>
          )}

          {/* Tactical Choice State (After Spin Animation Finishes) */}
          <AnimatePresence>
            {ws.status === "choosing" && !isSpinningAnim && activeWedge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-[var(--bg)] border-2 border-[var(--gold)]/60 space-y-4 shadow-md"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border-dim)]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-[var(--gold)]">
                      Tactical Decision
                    </span>
                    <h3 className="font-space font-extrabold text-base text-[var(--text)]">
                      {activeWedge.label}
                    </h3>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-space font-extrabold text-white"
                    style={{ backgroundColor: activeWedge.color }}
                  >
                    {canControlWheel ? "Your Choice" : "Live Decision"}
                  </span>
                </div>

                {/* Rival Team Selector when > 1 rival team */}
                {rivalTeams.length > 1 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)] block">
                      Select Rival Team:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {rivalTeams.map((r) => {
                        const isSelected = selectedRivalKey === r.key;
                        return (
                          <button
                            key={r.key}
                            type="button"
                            disabled={!canControlWheel}
                            onClick={() => setSelectedRivalKey(r.key)}
                            className={`p-2 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-[var(--bg-card)] border-[var(--text)] ring-1 ring-[var(--text)]"
                                : "bg-[var(--bg-card)]/50 border-[var(--border-dim)] opacity-75 hover:opacity-100"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: r.team.color }}
                              />
                              <span className="font-space font-bold text-xs text-[var(--text)] truncate">
                                {r.team.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[var(--text-dim)] shrink-0 ml-1">
                              {r.team.score} pts
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {canControlWheel ? (
                  ws.wedgeId === "freeze_opponent" ? (
                    <div className="space-y-3">
                      {/* Option 1: Freeze an entire rival team's next turn */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)] flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-500" />
                          <span>Freeze Rival Team&apos;s Next Turn:</span>
                        </span>
                        <button
                          type="button"
                          disabled={isResolvingChoice || !activeRivalTeam}
                          onClick={() =>
                            handleConfirmChoice("freeze", activeRivalTeam?.key)
                          }
                          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-space font-extrabold text-xs flex items-center justify-between cursor-pointer transition shadow-xs"
                        >
                          <span className="flex items-center gap-2">
                            <Snowflake className="w-4 h-4" />
                            <span>
                              Freeze {activeRivalTeam?.team.name}&apos;s Entire Next Turn
                            </span>
                          </span>
                          <span className="text-[10px] font-mono opacity-90">
                            Skip Team
                          </span>
                        </button>
                      </div>

                      {/* Option 2: Freeze a specific player on that rival team (only shown when rival team has >= 2 players so the mic can pass to a teammate) */}
                      {activeRivalPlayers.length > 1 && (
                        <div className="space-y-1.5 pt-2 border-t border-[var(--border-dim)]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)] flex items-center gap-1">
                            <UserX className="w-3 h-3 text-blue-400" />
                            <span>Or Freeze a Specific Speaker on {activeRivalTeam?.team.name}:</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {activeRivalPlayers.map((rp) => (
                              <button
                                key={rp.id}
                                type="button"
                                disabled={isResolvingChoice || rp.isFrozen}
                                onClick={() =>
                                  handleConfirmChoice(
                                    "freeze_player",
                                    activeRivalTeam?.key,
                                    rp.id,
                                    rp.name
                                  )
                                }
                                className="py-2 px-3 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 font-space font-bold text-xs flex items-center justify-between gap-2 cursor-pointer transition"
                              >
                                <span className="truncate flex items-center gap-1.5">
                                  <Snowflake className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{rp.name}</span>
                                </span>
                                <span className="text-[9px] uppercase font-mono shrink-0">
                                  {rp.isFrozen ? "Frozen" : "Freeze"}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        disabled={isResolvingChoice}
                        onClick={() => handleConfirmChoice("forward")}
                        className="py-3.5 px-4 rounded-xl bg-[var(--olive)] hover:brightness-110 text-white font-space font-extrabold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition shadow-sm"
                      >
                        <div className="flex items-center gap-1.5">
                          <ArrowUpRight className="w-4 h-4" />
                          <span>Advance +{stepsCount} Steps</span>
                        </div>
                        <span className="text-[10px] opacity-85 font-normal">
                          Boost {wheelTeamObj.name}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={isResolvingChoice || (activeRivalTeam?.team.score ?? 0) === 0}
                        onClick={() =>
                          handleConfirmChoice(
                            "back",
                            activeRivalTeam?.key
                          )
                        }
                        className={`py-3.5 px-4 rounded-xl bg-[var(--terra)] text-white font-space font-extrabold text-xs flex flex-col items-center justify-center gap-1 transition shadow-sm ${
                          (activeRivalTeam?.team.score ?? 0) === 0
                            ? "opacity-45 cursor-not-allowed"
                            : "hover:brightness-110 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <ArrowDownLeft className="w-4 h-4" />
                          <span>Push Rival -{stepsCount} Steps</span>
                        </div>
                        <span className="text-[10px] opacity-85 font-normal truncate max-w-full">
                          {(activeRivalTeam?.team.score ?? 0) === 0
                            ? `${activeRivalTeam?.team.name} is at Start (0 pts)`
                            : `Set back ${activeRivalTeam?.team.name}`}
                        </span>
                      </button>
                    </div>
                  )
                ) : (
                  <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--gold)]/40 text-xs text-[var(--text)] text-center space-y-1">
                    <div className="font-space font-bold">
                      <span style={{ color: wheelTeamObj.color }}>{wheelTeamObj.name}</span> landed on{" "}
                      <strong>{activeWedge.label}</strong>!
                    </div>
                    <div className="text-[11px] text-[var(--text-dim)]">
                      Waiting for them to lock in their tactical choice...
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resolved Outcome Banner (Shown to all teams!) */}
          <AnimatePresence>
            {ws.status === "resolved" && !isSpinningAnim && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-[var(--bg)] border-2 border-emerald-500/40 space-y-2 shadow-sm"
              >
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-space font-extrabold text-xs uppercase tracking-wider">
                  {ws.wedgeId === "freeze_opponent" ? (
                    <Snowflake className="w-4 h-4 text-blue-500" />
                  ) : ws.wedgeId === "extra_turn" ? (
                    <Repeat className="w-4 h-4 text-[var(--gold)]" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Wheel Outcome Applied • {activeWedge?.label || "Complete"}</span>
                </div>
                <p className="font-space font-bold text-sm text-[var(--text)] leading-snug">
                  {ws.resultSummary}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
