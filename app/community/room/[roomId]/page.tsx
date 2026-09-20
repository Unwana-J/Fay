"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Users, Globe, Lock, Copy, Check, Clock, Mic, StopCircle,
  ChevronRight, Star, ThumbsUp, ArrowLeft, Play, Share2
} from "lucide-react";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useAppStore } from "@/store/useAppStore";
import {
  type RoomParticipant,
  type RoomSubmission,
  type CommunityUser,
  encodeRoomPayload,
  decodeRoomPayload
} from "@/lib/mockCommunity";
import UserAvatar from "@/components/ui/UserAvatar";
import UserProfileModal from "@/components/community/UserProfileModal";

const CATEGORY_COLORS: Record<string, string> = {
  "Artificial Intelligence": "#7A1C2E",
  "Finance": "#A67C1E",
  "Philosophy": "#4A5568",
  "Technology": "#2D5A27",
  "Psychology": "#553C7B",
  "Business": "#7A4420",
  "Science": "#1A5276",
  "History": "#6B4226",
  "Culture": "#7A5C3A",
  "Wildcard": "#6B4C7A",
};

function ParticipantBadge({
  p,
  onInspect,
}: {
  p: RoomParticipant;
  onInspect: (u: CommunityUser) => void;
}) {
  const statusColor: Record<string, string> = {
    waiting: "var(--border)",
    researching: "var(--terra)",
    speaking: "var(--gold)",
    submitted: "#22C55E",
  };
  return (
    <button
      type="button"
      onClick={() => onInspect(p.user)}
      className="flex flex-col items-center gap-1.5 group cursor-pointer"
      title={`Click to view ${p.user.username}`}
    >
      <div className="relative group-hover:scale-105 transition-transform">
        <UserAvatar avatar={p.user.avatar} size="lg" className="border-2 shadow-sm" />
        <span
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-card)]"
          style={{ background: statusColor[p.status] || "var(--border)" }}
        />
      </div>
      <span className="text-[10px] font-medium text-center truncate max-w-[64px]" style={{ color: "var(--text-dim)" }}>
        {p.user.username.split(" ")[0]}
        {p.isHost && <span className="block text-[9px] font-semibold" style={{ color: "var(--terra)" }}>host</span>}
      </span>
    </button>
  );
}

function CountdownTimer({ totalSec, onComplete }: { totalSec: number; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(totalSec);
  const pct = (remaining / totalSec) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  useEffect(() => {
    if (remaining <= 0) { onComplete(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const color = remaining < 60 ? "#DC2626" : remaining < totalSec * 0.33 ? "var(--gold)" : "var(--terra)";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--bg-input)" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke={color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-2xl" style={{ color }}>
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <span className="text-[10px]" style={{ color: "var(--text-mute)" }}>remaining</span>
        </div>
      </div>
    </div>
  );
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const { rooms, advanceRoomStatus, submitRecording, voteOnSubmission, importRoom, joinRoom } = useCommunityStore();
  const profile = useAppStore((s) => s.profile);

  const [inspectUser, setInspectUser] = useState<CommunityUser | null>(null);
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [hoverStar, setHoverStar] = useState<Record<string, number>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync room from URL param if opened via shared link
  useEffect(() => {
    const rParam = searchParams.get("r");
    if (rParam) {
      const decoded = decodeRoomPayload(rParam);
      if (decoded && decoded.id) {
        importRoom(decoded as any);
      }
    }
  }, [searchParams]);

  const room = rooms.find((r) => r.id === roomId || r.inviteCode === roomId);

  // Auto-join room when ready
  useEffect(() => {
    if (room && profile.username && profile.username !== "Learner") {
      const alreadyIn = room.participants.some(
        (p) => p.user.id === profile.id || p.user.username === profile.username
      );
      if (!alreadyIn) {
        joinRoom(room.id, {
          id: profile.id,
          username: profile.username,
          avatar: profile.avatar || "/avatars/avatar-scholar.svg",
          bio: profile.bio,
          xp: profile.xp,
          level: Math.floor(profile.xp / 500) + 1,
        });
      }
    }
  }, [room, profile.id, profile.username]);

  if (!room) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-3 text-center px-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl border mb-1" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
        🔍
      </div>
      <h2 className="font-space font-bold text-lg" style={{ color: "var(--text)" }}>Research Room Not Found</h2>
      <p className="text-xs max-w-xs mb-3" style={{ color: "var(--text-dim)" }}>
        This room may have ended or the invite link is incomplete.
      </p>
      <button
        onClick={() => router.push("/community")}
        className="btn-primary text-xs px-4 py-2 rounded-xl"
      >
        Return to Community
      </button>
    </div>
  );

  const catColor = CATEGORY_COLORS[room.category] || "var(--terra)";
  const selfParticipant = room.participants.find(
    (p) => p.user.id === profile.id || p.user.username === profile.username
  );
  const isHost = selfParticipant?.isHost;

  const copyInvite = () => {
    const encoded = encodeRoomPayload(room);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/community/room/${room.id}?code=${room.inviteCode}${encoded ? `&r=${encoded}` : ""}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startRecording = () => {
    setRecording(true);
    setRecordingSec(0);
    timerRef.current = setInterval(() => setRecordingSec((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSubmit = () => {
    submitRecording(
      room.id,
      recordingSec,
      {
        id: profile.id,
        username: profile.username || "Learner",
        avatar: profile.avatar || "/avatars/avatar-scholar.svg",
        bio: profile.bio,
        xp: profile.xp,
        level: Math.floor(profile.xp / 500) + 1,
      }
    );
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Back + breadcrumb */}
      <button
        onClick={() => router.push("/community")}
        className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity"
        style={{ color: "var(--text-mute)" }}
      >
        <ArrowLeft size={14} /> Community
      </button>

      {/* Room header */}
      <div className="surface rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="tag text-[10px]"
                style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}30` }}
              >
                {room.category}
              </span>
              <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-mute)" }}>
                {room.visibility === "public" ? <Globe size={10} /> : <Lock size={10} />}
                {room.visibility}
              </div>
            </div>
            <h1 className="font-space font-bold text-lg leading-snug" style={{ color: "var(--text)" }}>
              {room.topicText}
            </h1>
          </div>
          <button
            onClick={copyInvite}
            className="btn-ghost flex items-center gap-1.5 text-xs whitespace-nowrap shrink-0"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : room.inviteCode}
          </button>
        </div>

        {/* Participants */}
        <div className="flex items-center gap-4 flex-wrap">
          {room.participants.map((p, i) => (
            <ParticipantBadge key={i} p={p} onInspect={setInspectUser} />
          ))}
          <div
            className="w-11 h-11 rounded-full border-2 border-dashed flex items-center justify-center"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-[18px]">+</span>
          </div>
        </div>
      </div>

      {/* ── LOBBY ── */}
      {room.status === "lobby" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🚪</div>
          <h2 className="font-space font-bold text-xl mb-2" style={{ color: "var(--text)" }}>Waiting in Lobby</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>
            Invite friends using code <strong>{room.inviteCode}</strong>, then start when everyone's ready.
          </p>
          {isHost && (
            <button
              onClick={() => advanceRoomStatus(room.id, "research")}
              className="btn-terra"
            >
              Start Research Phase →
            </button>
          )}
        </motion.div>
      )}

      {/* ── RESEARCH ── */}
      {room.status === "research" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="surface rounded-2xl p-6 flex flex-col items-center">
            <div className="text-label mb-4">Research Phase</div>
            <CountdownTimer
              totalSec={room.researchDurationMin * 60}
              onComplete={() => advanceRoomStatus(room.id, "speaking")}
            />
            {isHost && (
              <button
                onClick={() => advanceRoomStatus(room.id, "speaking")}
                className="btn-ghost text-xs mt-4"
              >
                Skip to Speaking →
              </button>
            )}
          </div>
          <div className="surface rounded-2xl p-5">
            <div className="text-label mb-3">Your Private Notes</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Take notes here — only you can see these..."
              rows={7}
              className="w-full text-sm resize-none outline-none rounded-xl px-4 py-3"
              style={{
                background: "var(--bg-input)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
            />
          </div>
        </motion.div>
      )}

      {/* ── SPEAKING ── */}
      {room.status === "speaking" && !submitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface rounded-2xl p-8 text-center">
          <div className="text-label mb-3">Speaking Phase</div>
          <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>
            Record your explanation. Max {Math.floor(room.speakingDurationSec / 60)}:{String(room.speakingDurationSec % 60).padStart(2, "0")} minutes.
          </p>

          <AnimatePresence mode="wait">
            {!recording ? (
              <motion.button
                key="start"
                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                onClick={startRecording}
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
                style={{ background: "var(--terra)" }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mic size={28} color="white" />
              </motion.button>
            ) : (
              <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                <motion.button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: "#DC2626" }}
                  whileHover={{ scale: 1.08 }}
                  animate={{ boxShadow: ["0 0 0 0 rgba(220,38,38,0.4)", "0 0 0 14px rgba(220,38,38,0)", "0 0 0 0 rgba(220,38,38,0)"] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <StopCircle size={28} color="white" />
                </motion.button>
                <div className="font-mono text-2xl font-bold mt-4" style={{ color: "var(--text)" }}>
                  {String(Math.floor(recordingSec / 60)).padStart(2, "0")}:{String(recordingSec % 60).padStart(2, "0")}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!recording && recordingSec > 0 && (
            <button onClick={handleSubmit} className="btn-terra">
              Submit Recording →
            </button>
          )}
          {!recording && recordingSec === 0 && (
            <p className="text-xs" style={{ color: "var(--text-mute)" }}>Tap the mic to start recording.</p>
          )}
        </motion.div>
      )}

      {/* ── SUBMITTED / WAITING ── */}
      {(room.status === "speaking" && submitted) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="font-space font-bold text-xl mb-2" style={{ color: "var(--text)" }}>Recording Submitted!</h2>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            Waiting for other participants to finish...
          </p>
        </motion.div>
      )}

      {/* ── VOTING ── */}
      {room.status === "voting" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="text-label mb-1">Vote on Submissions</div>
          {room.submissions.map((sub) => {
            const hover = hoverStar[sub.id] || 0;
            return (
              <div key={sub.id} className="surface rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border"
                    style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}
                  >
                    {sub.user.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: "var(--text)" }}>{sub.user.username}</div>
                    <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>
                      {Math.floor(sub.durationSec / 60)}:{String(sub.durationSec % 60).padStart(2, "0")}
                    </div>
                  </div>
                </div>
                <div
                  className="rounded-lg px-4 py-2.5 flex items-center gap-3 mb-3"
                  style={{ background: "var(--bg-input)" }}
                >
                  <button
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: catColor }}
                  >
                    <Play size={10} color="white" />
                  </button>
                  <div className="flex-1 flex items-center gap-0.5 h-4">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i} className="w-0.5 rounded-full" style={{ height: `${Math.max(20, Math.random() * 100)}%`, background: `${catColor}60` }} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      disabled={!!sub.userVoted}
                      onMouseEnter={() => !sub.userVoted && setHoverStar((h) => ({ ...h, [sub.id]: n }))}
                      onMouseLeave={() => setHoverStar((h) => ({ ...h, [sub.id]: 0 }))}
                      onClick={() => voteOnSubmission(sub.id, n as 1 | 2 | 3)}
                      className="flex items-center gap-1 text-xs transition-transform hover:scale-110 disabled:cursor-default"
                      style={{ color: "var(--text-mute)" }}
                    >
                      <Star
                        size={16}
                        fill={n <= (sub.userVoted || hover) ? catColor : "none"}
                        stroke={catColor}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                  {sub.userVoted && (
                    <span className="text-xs ml-1" style={{ color: "var(--terra)" }}>Voted ✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* ── CLOSED ── */}
      {room.status === "closed" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="surface rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">🏁</div>
            <h2 className="font-space font-bold text-lg mb-1" style={{ color: "var(--text)" }}>Room Closed</h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-dim)" }}>Final results are in. See the full leaderboard:</p>
            <a href={`/community/topics/${room.topicId}`} className="btn-terra inline-flex items-center gap-2">
              View Topic Leaderboard <ChevronRight size={14} />
            </a>
          </div>
          {room.submissions.map((sub, i) => (
            <div key={sub.id} className="surface rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{sub.user.username}</span>
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-mute)" }}>
                <span>★ {sub.votes.avgStars.toFixed(1)}</span>
                <span>↑ {sub.votes.upvotes}</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* User profile inspection & follow modal */}
      <UserProfileModal
        user={inspectUser}
        isOpen={!!inspectUser}
        onClose={() => setInspectUser(null)}
      />
    </div>
  );
}
