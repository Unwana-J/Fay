"use client";

import React, { useState, useEffect, useCallback, useRef, use } from "react";
import { useAppStore } from "@/store/useAppStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ArticulateRoom, RoomPlayer } from "@/lib/articulate-room";
import RoomLobby from "./components/RoomLobby";
import SpectatorLounge from "./components/SpectatorLounge";
import RoomSpeakerView from "./components/RoomSpeakerView";
import RoomGuesserView from "./components/RoomGuesserView";
import RoomRoundEnd from "./components/RoomRoundEnd";
import RoomGameOver from "./components/RoomGameOver";
import PlayerIdentityModal from "./components/PlayerIdentityModal";
import RoundCountdownOverlay from "./components/RoundCountdownOverlay";
import { Loader2, ArrowLeft, AlertCircle, Sparkles, Moon, LogOut, CheckCircle2, Edit2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

export default function ArticulateRoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = use(params);
  const roomCode = rawCode.toUpperCase().trim();

  const router = useRouter();
  const { profile, saveArticulateRoom, createAccount } = useAppStore();

  const [devicePlayerId, setDevicePlayerId] = useState<string>(() => {
    if (profile?.id) return profile.id;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fey_device_player_id");
      if (saved) return saved;
      const gen = "guest-" + Math.random().toString(36).slice(2, 9);
      localStorage.setItem("fey_device_player_id", gen);
      return gen;
    }
    return "guest-" + Math.random().toString(36).slice(2, 9);
  });

  const [savedLocalName, setSavedLocalName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("fey_player_name") || "";
    }
    return "";
  });

  useEffect(() => {
    if (profile?.id && profile.id !== devicePlayerId) {
      setDevicePlayerId(profile.id);
      if (typeof window !== "undefined") {
        localStorage.setItem("fey_device_player_id", profile.id);
      }
    }
  }, [profile?.id, devicePlayerId]);

  const myPlayerId = profile?.id || devicePlayerId;
  const myPlayerName = profile?.username || savedLocalName || "Scholar";
  const myAvatar = profile?.avatar || "/avatars/avatar-scholar.svg";

  const [room, setRoom] = useState<ArticulateRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const [presencePlayers, setPresencePlayers] = useState<RoomPlayer[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [identityModalMode, setIdentityModalMode] = useState<"join" | "edit">("join");
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);

  const channelRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasJoinedRef = useRef(false);

  // 1. Fetch Room State (Safe from transient serverless 404s)
  const fetchRoomState = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch(`/api/articulate/room?code=${roomCode}`);
      if (!res.ok) {
        // ONLY trigger fatal full-page error on initial load if room has never been loaded
        if (isInitial && res.status === 404) {
          setError("Room not found. Check the code and try again.");
        }
        return null;
      }
      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
        setError(null);
        return data.room as ArticulateRoom;
      }
      return null;
    } catch (err) {
      console.warn("Background room sync notice:", err);
      return null;
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [roomCode]);

  // 2. Dispatch Server Action
  const dispatchAction = useCallback(
    async (actionPayload: Record<string, any>) => {
      try {
        const res = await fetch(`/api/articulate/room/${roomCode}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(actionPayload),
        });
        const data = await res.json();
        if (data.room) {
          setRoom(data.room);
          if (typeof data.isSpectator === "boolean") {
            setIsSpectator(data.isSpectator);
          }
          // Broadcast action to peers via Supabase
          if (channelRef.current) {
            channelRef.current.send({
              type: "broadcast",
              event: "room_action",
              payload: { action: actionPayload.action, room: data.room },
            });
          }
          return data.room;
        }
      } catch (err) {
        console.error("Action error:", err);
      }
    },
    [roomCode]
  );

  const storedUsername = (profile?.username || savedLocalName)?.trim();
  const effectivePlayerName =
    storedUsername && storedUsername !== "Scholar" && storedUsername !== "Learner"
      ? storedUsername
      : room?.player_details?.[myPlayerId]?.name &&
        room.player_details[myPlayerId].name !== "Scholar" &&
        room.player_details[myPlayerId].name !== "Learner"
      ? room.player_details[myPlayerId].name
      : savedLocalName || "Scholar";

  // 3. Initial Mount & Join
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (hasJoinedRef.current) return;
      hasJoinedRef.current = true;

      const fetched = await fetchRoomState(true);
      if (!fetched || !mounted) return;

      const inA = fetched.teams.teamA.playerIds.includes(myPlayerId);
      const inB = fetched.teams.teamB.playerIds.includes(myPlayerId);
      const inSpectators = fetched.spectators.includes(myPlayerId);
      const alreadyInRoom = inA || inB || inSpectators;

      const hasKnownName = Boolean(
        storedUsername &&
        storedUsername !== "Scholar" &&
        storedUsername !== "Learner"
      );

      const serverName = fetched.player_details?.[myPlayerId]?.name;
      const hasServerName = Boolean(
        serverName &&
        serverName !== "Scholar" &&
        serverName !== "Learner"
      );

      if (hasKnownName || hasServerName) {
        // Player already has established name or is existing participant: auto-join
        const nameToUse = hasKnownName ? storedUsername : serverName!;

        const res = await fetch(`/api/articulate/room/${roomCode}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "join",
            playerId: myPlayerId,
            playerName: nameToUse,
            avatar: myAvatar,
          }),
        });

        const joinData = await res.json();
        if (mounted && joinData.room) {
          setRoom(joinData.room);
          setIsSpectator(Boolean(joinData.isSpectator));
          setHasJoinedRoom(true);
        }
      } else if (alreadyInRoom && serverName) {
        const res = await fetch(`/api/articulate/room/${roomCode}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "join",
            playerId: myPlayerId,
            playerName: serverName,
            avatar: myAvatar,
          }),
        });

        const joinData = await res.json();
        if (mounted && joinData.room) {
          setRoom(joinData.room);
          setIsSpectator(Boolean(joinData.isSpectator));
          setHasJoinedRoom(true);
        }
      } else {
        // Guest user opening WhatsApp link without a profile name: show Name Entry Gate
        setIdentityModalMode("join");
        setShowIdentityModal(true);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [fetchRoomState, myAvatar, myPlayerId, roomCode, storedUsername]);

  // Handle Save / Rename Identity
  const handleSaveIdentity = async (
    chosenName: string,
    chosenAvatar: string,
    preferredTeam?: "A" | "B"
  ) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fey_player_name", chosenName);
      localStorage.setItem("fey_player_avatar", chosenAvatar);
      localStorage.setItem("fey_device_player_id", myPlayerId);
    }
    setSavedLocalName(chosenName);

    createAccount({
      username: chosenName,
      avatar: chosenAvatar,
      bio: profile?.bio || "Building knowledge one topic at a time.",
      interests: [],
    });

    if (identityModalMode === "join") {
      const res = await fetch(`/api/articulate/room/${roomCode}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          playerId: myPlayerId,
          playerName: chosenName,
          avatar: chosenAvatar,
          preferredTeam,
        }),
      });
      const joinData = await res.json();
      if (joinData.room) {
        setRoom(joinData.room);
        setIsSpectator(Boolean(joinData.isSpectator));
        setHasJoinedRoom(true);
      }
      setShowIdentityModal(false);

      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "room_action",
          payload: { action: "join", room: joinData.room },
        });
        channelRef.current.track({
          id: myPlayerId,
          name: chosenName,
          avatar: chosenAvatar,
          isHost: joinData.room?.host_id === myPlayerId,
          joinedAt: Date.now(),
        });
      }
    } else {
      await dispatchAction({
        action: "rename_player",
        playerId: myPlayerId,
        newName: chosenName,
        avatar: chosenAvatar,
      });
      setShowIdentityModal(false);

      if (channelRef.current) {
        channelRef.current.track({
          id: myPlayerId,
          name: chosenName,
          avatar: chosenAvatar,
          isHost: room?.host_id === myPlayerId,
          joinedAt: Date.now(),
        });
      }
    }
  };

  // Sync Room to Persistent Local History so unfinished games can be resumed
  useEffect(() => {
    if (!room) return;
    const myTeam = (room.teams?.teamA?.playerIds || []).includes(myPlayerId)
      ? "A"
      : (room.teams?.teamB?.playerIds || []).includes(myPlayerId)
      ? "B"
      : null;

    saveArticulateRoom({
      id: room.room_code,
      roomCode: room.room_code,
      hostName: room.host_name,
      myTeam,
      status: room.status,
      scoreA: room.teams?.teamA?.score ?? 0,
      scoreB: room.teams?.teamB?.score ?? 0,
      scoreGoal: room.settings?.scoreGoal || 20,
      roundNumber: room.current_turn?.roundNumber || 1,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      timestamp: Date.now(),
    });
  }, [myPlayerId, room, saveArticulateRoom]);

  // 4. Supabase Realtime Channel (Presence + Broadcast)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase.channel(`articulate:${roomCode}`, {
      config: {
        presence: { key: myPlayerId },
        broadcast: { ack: false, self: false },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const players: RoomPlayer[] = [];
        Object.keys(state).forEach((key) => {
          const list = state[key] as any[];
          if (list && list[0]) {
            players.push({
              id: list[0].id || key,
              name: list[0].name || "Scholar",
              avatar: list[0].avatar || "/avatars/avatar-scholar.svg",
              team: list[0].team || null,
              isHost: Boolean(list[0].isHost),
              joinedAt: list[0].joinedAt || Date.now(),
            });
          }
        });
        setPresencePlayers(players);
      })
      .on("broadcast", { event: "room_action" }, (event) => {
        if (event.payload?.room) {
          setRoom(event.payload.room);
          // If room transitioned to round_end or lobby, update spectator state
          if (event.payload.room.status === "round_end" || event.payload.room.status === "lobby") {
            setIsSpectator(false);
          }
        } else {
          fetchRoomState();
        }
      })
      .on("broadcast", { event: "reaction" }, (event) => {
        const emoji = event.payload?.emoji;
        if (emoji) {
          const newReaction: FloatingReaction = {
            id: Math.random().toString(36).slice(2),
            emoji,
            x: 20 + Math.random() * 60, // random percentage across screen width
          };
          setReactions((prev) => [...prev.slice(-12), newReaction]);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: myPlayerId,
            name: effectivePlayerName,
            avatar: myAvatar,
            isHost: room?.host_id === myPlayerId,
            joinedAt: Date.now(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [effectivePlayerName, fetchRoomState, myAvatar, myPlayerId, room?.host_id, roomCode]);

  // 5. Polling Fallback (sync every 2.5s for seamless multi-device updates)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRoomState();
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchRoomState]);

  // 6. Synchronized Countdown & Round Timer
  useEffect(() => {
    if (!room || room.status !== "playing" || !room.current_turn) {
      setCountdownRemaining(null);
      return;
    }

    const turn = room.current_turn;
    const duration = turn.durationSeconds || room.settings?.timerSeconds || 30;
    const countdownEndsAt = turn.countdownEndsAt || turn.startedAt || Date.now();

    const updateTimer = () => {
      const now = Date.now();

      // Check pre-round 3-second countdown
      if (now < countdownEndsAt) {
        const remainingCountdown = Math.max(1, Math.ceil((countdownEndsAt - now) / 1000));
        setCountdownRemaining(remainingCountdown);
        setSecondsRemaining(duration);
        return;
      }

      // Flash "GO!" for 450ms after countdown finishes
      if (now < countdownEndsAt + 450) {
        setCountdownRemaining(0);
        setSecondsRemaining(duration);
        return;
      }

      setCountdownRemaining(null);
      const elapsed = Math.floor((now - countdownEndsAt) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setSecondsRemaining(remaining);

      // Time's up: only the active speaker or host triggers end_round to avoid race conditions
      if (remaining === 0) {
        const isSpeakerOrHost =
          myPlayerId === turn.speakerId || myPlayerId === room.host_id;
        if (isSpeakerOrHost) {
          dispatchAction({
            action: "end_round",
            speakerId: myPlayerId,
          });
        }
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dispatchAction, myPlayerId, room]);

  // Remove old floating reactions after animation
  useEffect(() => {
    if (reactions.length === 0) return;
    const timer = setTimeout(() => {
      setReactions((prev) => prev.slice(1));
    }, 2500);
    return () => clearTimeout(timer);
  }, [reactions]);

  // Handlers
  const handleStartRound = () => {
    dispatchAction({
      action: "start_round",
      hostId: myPlayerId,
    });
  };

  const handleScoreWord = () => {
    dispatchAction({
      action: "score_word",
      speakerId: room?.current_turn?.speakerId || myPlayerId,
    });
  };

  const handlePassWord = () => {
    dispatchAction({
      action: "pass_word",
      speakerId: room?.current_turn?.speakerId || myPlayerId,
    });
  };

  const handleEndRound = () => {
    dispatchAction({
      action: "end_round",
      speakerId: room?.current_turn?.speakerId || myPlayerId,
    });
  };

  const handleSwitchTeam = (targetTeam: "A" | "B") => {
    dispatchAction({
      action: "switch_team",
      playerId: myPlayerId,
      targetTeam,
    });
  };

  const handleResetGame = () => {
    dispatchAction({
      action: "reset_game",
      hostId: myPlayerId,
    });
  };

  const handleShuffleTeams = () => {
    dispatchAction({
      action: "shuffle_teams",
      hostId: myPlayerId,
    });
  };

  const handleUpdateSettings = (newSettings: { timerSeconds?: number; scoreGoal?: number }) => {
    dispatchAction({
      action: "update_settings",
      hostId: myPlayerId,
      settings: newSettings,
    });
  };

  const handleSendReaction = (emoji: string) => {
    // Add locally
    const newReaction: FloatingReaction = {
      id: Math.random().toString(36).slice(2),
      emoji,
      x: 20 + Math.random() * 60,
    };
    setReactions((prev) => [...prev.slice(-12), newReaction]);

    // Broadcast to peers
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "reaction",
        payload: { emoji },
      });
    }
  };

  const handleDisputeWord = (wordIndex: number) => {
    dispatchAction({
      action: "dispute_word",
      wordIndex,
      opponentId: myPlayerId,
      opponentName: myPlayerName,
    });
  };

  const handleResolveDispute = (wordIndex: number, resolution: "concede" | "reject") => {
    dispatchAction({
      action: "resolve_dispute",
      wordIndex,
      resolverId: myPlayerId,
      resolverName: myPlayerName,
      resolution,
    });
  };

  const handleToggleInactive = () => {
    dispatchAction({
      action: "toggle_inactive",
      playerId: myPlayerId,
    });
  };

  const handleLeaveRoom = () => {
    setShowLeaveConfirmModal(true);
  };

  const handleConfirmLeave = async () => {
    setShowLeaveConfirmModal(false);
    await dispatchAction({
      action: "leave_room",
      playerId: myPlayerId,
    });
    router.push("/play");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-[var(--olive)] animate-spin" />
        <p className="font-space font-bold text-sm text-[var(--text-dim)]">
          Connecting to Articulate Room {roomCode}...
        </p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-[var(--terra)]" />
        <h2 className="font-space font-bold text-xl text-[var(--text)]">
          Room Unavailable
        </h2>
        <p className="text-sm text-[var(--text-dim)]">{error || "Could not find room."}</p>
        <Link
          href="/play"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--terra)] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Parlor
        </Link>
      </div>
    );
  }

  const isHost = room.host_id === myPlayerId;
  const isPlaying = room.status === "playing";

  const myPlayerNameNormalized = (effectivePlayerName || "").trim().toLowerCase();
  const currentSpeakerNameNormalized = (room.current_turn?.speakerName || "").trim().toLowerCase();

  const isSpeakerByName = Boolean(
    myPlayerNameNormalized &&
    myPlayerNameNormalized !== "scholar" &&
    myPlayerNameNormalized !== "learner" &&
    currentSpeakerNameNormalized &&
    currentSpeakerNameNormalized === myPlayerNameNormalized
  );

  const isSpeakerById = Boolean(
    room.current_turn?.speakerId === myPlayerId ||
    (room.player_details?.[room.current_turn?.speakerId || ""] &&
      room.player_details[room.current_turn?.speakerId || ""].id === myPlayerId)
  );

  const isSpeaker = isPlaying && (isSpeakerById || isSpeakerByName);
  const isMeInactive = Boolean(room.inactive_players?.includes(myPlayerId));

  const isPlayerInTeamA = Boolean(
    (room.teams?.teamA?.playerIds || []).includes(myPlayerId) ||
    (room.teams?.teamA?.playerIds || []).some(
      (pid) =>
        room.player_details?.[pid]?.id === myPlayerId ||
        (myPlayerNameNormalized &&
          myPlayerNameNormalized !== "scholar" &&
          room.player_details?.[pid]?.name?.trim().toLowerCase() === myPlayerNameNormalized)
    )
  );

  const isPlayerInTeamB = Boolean(
    (room.teams?.teamB?.playerIds || []).includes(myPlayerId) ||
    (room.teams?.teamB?.playerIds || []).some(
      (pid) =>
        room.player_details?.[pid]?.id === myPlayerId ||
        (myPlayerNameNormalized &&
          myPlayerNameNormalized !== "scholar" &&
          room.player_details?.[pid]?.name?.trim().toLowerCase() === myPlayerNameNormalized)
    )
  );

  const isInMatch = isPlayerInTeamA || isPlayerInTeamB;
  const myTeam: "A" | "B" | null = isPlayerInTeamA ? "A" : isPlayerInTeamB ? "B" : null;

  // Decide if this user must view Spectator Lounge:
  // ONLY show spectator lounge if they are not in the match, not the speaker, and explicitly marked spectator or room is locked
  const showSpectatorLounge =
    isPlaying && !isSpeaker && !isInMatch && (isSpectator || room.locked);

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-4xl mx-auto flex flex-col justify-center relative overflow-hidden">
      {/* Floating Animated Reactions */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 1, y: "90vh", scale: 0.6 }}
              animate={{ opacity: 0, y: "10vh", scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: "easeOut" }}
              className="absolute text-3xl select-none"
              style={{ left: `${r.x}%` }}
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-dim)]/50">
        <Link
          href="/play"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-dim)] hover:text-[var(--text)] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Parlor
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isInMatch && (
            <>
              <button
                type="button"
                onClick={handleToggleInactive}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
                  isMeInactive
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                }`}
                title={isMeInactive ? "You are marked Away. Click to mark Active." : "Click to mark Away / Inactive."}
              >
                {isMeInactive ? (
                  <>
                    <Moon className="w-3 h-3 text-amber-500" />
                    <span className="hidden sm:inline">Away</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="hidden sm:inline">Active</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLeaveRoom}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/25 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Leave room"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden sm:inline">Leave</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setIdentityModalMode("edit");
              setShowIdentityModal(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-dim)] hover:text-[var(--text)] transition cursor-pointer px-2 py-1 rounded-lg hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-dim)]"
            title="Click to change your player name"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="truncate max-w-[110px] sm:max-w-none">{effectivePlayerName}</span>
            <Edit2 className="w-3 h-3 text-[var(--text-mute)] opacity-70" />
          </button>
          {isHost && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 border border-amber-500/30">
              Host
            </span>
          )}
        </div>
      </div>

      {/* Dynamic View Router */}
      <AnimatePresence mode="wait">
        {showSpectatorLounge ? (
          <motion.div
            key="spectator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <SpectatorLounge
              room={room}
              secondsRemaining={secondsRemaining}
              myPlayerId={myPlayerId}
              onSendReaction={handleSendReaction}
              presencePlayers={presencePlayers}
            />
          </motion.div>
        ) : room.status === "lobby" ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <RoomLobby
              room={room}
              myPlayerId={myPlayerId}
              isHost={isHost}
              presencePlayers={presencePlayers}
              onStartRound={handleStartRound}
              onSwitchTeam={handleSwitchTeam}
              onShuffleTeams={handleShuffleTeams}
              onUpdateSettings={handleUpdateSettings}
              onToggleInactive={handleToggleInactive}
              onLeaveRoom={handleLeaveRoom}
              onEditName={() => {
                setIdentityModalMode("edit");
                setShowIdentityModal(true);
              }}
            />
          </motion.div>
        ) : room.status === "playing" ? (
          isSpeaker ? (
            <motion.div
              key="speaker"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <RoomSpeakerView
                room={room}
                secondsRemaining={secondsRemaining}
                onScoreWord={handleScoreWord}
                onPassWord={handlePassWord}
                onEndRound={handleEndRound}
              />
            </motion.div>
          ) : (
            <motion.div
              key="guesser"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <RoomGuesserView
                room={room}
                secondsRemaining={secondsRemaining}
                myPlayerId={myPlayerId}
                myTeam={myTeam}
                onSendReaction={handleSendReaction}
              />
            </motion.div>
          )
        ) : room.status === "round_end" ? (
          <motion.div
            key="round_end"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <RoomRoundEnd
              room={room}
              myPlayerId={myPlayerId}
              myPlayerName={effectivePlayerName}
              isHost={isHost}
              presencePlayers={presencePlayers}
              onStartNextRound={handleStartRound}
              onDisputeWord={handleDisputeWord}
              onResolveDispute={handleResolveDispute}
              onToggleInactive={handleToggleInactive}
              onLeaveRoom={handleLeaveRoom}
            />
          </motion.div>
        ) : room.status === "game_over" ? (
          <motion.div
            key="game_over"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <RoomGameOver
              room={room}
              isHost={isHost}
              onResetGame={handleResetGame}
            />
          </motion.div>
        ) : (
          <div className="surface rounded-3xl p-8 border border-[var(--border-dim)] text-center space-y-3 my-auto">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--olive)] mx-auto" />
            <p className="text-sm font-space font-bold text-[var(--text-dim)]">
              Synchronizing game room...
            </p>
          </div>
        )}
      </AnimatePresence>

      {/* Player Identity Name Gate & In-Match Rename Modal */}
      <PlayerIdentityModal
        isOpen={showIdentityModal}
        mode={identityModalMode}
        roomCode={roomCode}
        hostName={room?.host_name}
        currentName={effectivePlayerName !== "Scholar" ? effectivePlayerName : ""}
        currentAvatar={myAvatar}
        onSave={handleSaveIdentity}
        onClose={() => {
          if (identityModalMode === "edit" || hasJoinedRoom) {
            setShowIdentityModal(false);
          }
        }}
      />

      {/* 3-Second Pre-Round Countdown Overlay */}
      <AnimatePresence>
        {isPlaying && countdownRemaining !== null && room?.current_turn && (
          <RoundCountdownOverlay
            count={countdownRemaining}
            roundNumber={room.current_turn.roundNumber}
            speakerName={room.current_turn.speakerName}
            activeTeamName={
              room.current_turn.activeTeam === "B"
                ? room.teams.teamB.name
                : room.teams.teamA.name
            }
            activeTeamColor={
              room.current_turn.activeTeam === "B"
                ? room.teams.teamB.color
                : room.teams.teamA.color
            }
            isSpeaker={isSpeaker}
            myTeam={myTeam}
            activeTeam={room.current_turn.activeTeam}
          />
        )}
      </AnimatePresence>

      {/* Leave & Away Prompt Modal */}
      {showLeaveConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface rounded-3xl p-6 max-w-sm w-full border border-[var(--border-dim)] shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto text-xl">
              <Moon className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-space font-extrabold text-lg text-[var(--text)]">
                Stepping Away?
              </h3>
              <p className="text-xs text-[var(--text-dim)]">
                If you just need a short break, set your status to <strong>Away</strong> so your team keeps your slot. You can also leave the match completely.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleToggleInactive();
                  setShowLeaveConfirmModal(false);
                }}
                className="w-full py-3 px-4 rounded-xl font-space font-bold text-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Moon className="w-4 h-4" />
                <span>Set Status to Away (Keep Slot)</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmLeave}
                className="w-full py-2.5 px-4 rounded-xl font-space font-bold text-xs bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Leave Match Completely</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLeaveConfirmModal(false)}
                className="w-full py-2 text-xs font-bold text-[var(--text-mute)] hover:text-[var(--text)] transition cursor-pointer"
              >
                Stay in Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
