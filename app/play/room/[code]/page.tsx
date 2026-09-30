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
import { Loader2, ArrowLeft, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
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

  const { profile } = useAppStore();
  const myPlayerId = profile?.id || "guest-" + Math.random().toString(36).slice(2, 9);
  const myPlayerName = profile?.username || "Scholar";
  const myAvatar = profile?.avatar || "/avatars/avatar-scholar.svg";

  const [room, setRoom] = useState<ArticulateRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const [presencePlayers, setPresencePlayers] = useState<RoomPlayer[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);

  const channelRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // 3. Initial Mount & Join
  useEffect(() => {
    let mounted = true;

    async function init() {
      const fetched = await fetchRoomState(true);
      if (!fetched || !mounted) return;

      // Join the room on the server
      const res = await fetch(`/api/articulate/room/${roomCode}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          playerId: myPlayerId,
          playerName: myPlayerName,
          avatar: myAvatar,
        }),
      });

      const joinData = await res.json();
      if (mounted && joinData.room) {
        setRoom(joinData.room);
        setIsSpectator(Boolean(joinData.isSpectator));
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [fetchRoomState, myAvatar, myPlayerId, myPlayerName, roomCode]);

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
            name: myPlayerName,
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
  }, [fetchRoomState, myAvatar, myPlayerId, myPlayerName, room?.host_id, roomCode]);

  // 5. Polling Fallback (sync every 2.5s for seamless multi-device updates)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRoomState();
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchRoomState]);

  // 6. Synchronized Countdown Timer
  useEffect(() => {
    if (!room || room.status !== "playing" || !room.current_turn) {
      return;
    }

    const turn = room.current_turn;
    const duration = turn.durationSeconds || 60;
    const startedAt = turn.startedAt || Date.now();

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
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
    timerRef.current = setInterval(updateTimer, 500);

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
      speakerName: myPlayerName,
    });
  };

  const handleScoreWord = () => {
    dispatchAction({
      action: "score_word",
      speakerId: myPlayerId,
    });
  };

  const handlePassWord = () => {
    dispatchAction({
      action: "pass_word",
      speakerId: myPlayerId,
    });
  };

  const handleEndRound = () => {
    dispatchAction({
      action: "end_round",
      speakerId: myPlayerId,
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
  const isSpeaker = isPlaying && room.current_turn?.speakerId === myPlayerId;

  // Decide if this user must view Spectator Lounge:
  // 1. Explicitly marked isSpectator
  // 2. Room is locked / playing, and player is NOT in active_players
  const showSpectatorLounge =
    isPlaying && (isSpectator || (room.locked && !room.active_players?.includes(myPlayerId)));

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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-dim)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{myPlayerName}</span>
          </div>
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
              myPlayerName={myPlayerName}
              isHost={isHost}
              onStartNextRound={handleStartRound}
              onDisputeWord={handleDisputeWord}
              onResolveDispute={handleResolveDispute}
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
        ) : null}
      </AnimatePresence>
    </div>
  );
}
