"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, Globe, Lock, Plus, ArrowRight, Star, ThumbsUp,
  Clock, Mic, Trophy, Search, Filter, Flame, Zap, KeyRound,
  UserCheck, UserPlus, Sparkles, Check
} from "lucide-react";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useAppStore } from "@/store/useAppStore";
import {
  type ResearchRoom,
  type RoomSubmission,
  type CommunityUser,
  type FollowedUser,
} from "@/lib/mockCommunity";
import CreateRoomModal from "@/components/community/CreateRoomModal";
import JoinRoomModal from "@/components/community/JoinRoomModal";
import UserProfileModal from "@/components/community/UserProfileModal";
import UserAvatar from "@/components/ui/UserAvatar";

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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  lobby: { label: "In Lobby", color: "var(--text-mute)" },
  research: { label: "Researching", color: "var(--terra)" },
  speaking: { label: "Speaking", color: "#A67C1E" },
  voting: { label: "Voting Open", color: "#2D5A27" },
  closed: { label: "Closed", color: "var(--text-mute)" },
};

// ─── Submission Card ──────────────────────────────────────────────────────────

function SubmissionCard({
  sub,
  onInspectUser,
}: {
  sub: RoomSubmission;
  onInspectUser: (u: CommunityUser) => void;
}) {
  const { voteOnSubmission, following } = useCommunityStore();
  const [hoverStar, setHoverStar] = useState(0);
  const catColor = CATEGORY_COLORS[sub.category] || "var(--terra)";
  const isFollowed = following.some((u) => u.id === sub.user.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="surface rounded-xl p-5 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onInspectUser(sub.user)}
          className="flex items-center gap-2.5 text-left group"
        >
          <UserAvatar avatar={sub.user.avatar} size="md" className="group-hover:scale-105 transition-transform" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold group-hover:underline" style={{ color: "var(--text)" }}>
                {sub.user.username}
              </span>
              {isFollowed && (
                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-[var(--bg-input)] text-[var(--olive-text)] flex items-center gap-0.5">
                  <UserCheck size={9} /> Following
                </span>
              )}
            </div>
            <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>
              {timeAgo(sub.submittedAt)} · {formatDuration(sub.durationSec)}
            </div>
          </div>
        </button>
        <span
          className="tag text-[10px] shrink-0"
          style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}30` }}
        >
          {sub.category}
        </span>
      </div>

      {/* Topic */}
      <p className="text-sm font-medium leading-snug" style={{ color: "var(--text-dim)" }}>
        {sub.topicText}
      </p>

      {/* Audio player / bar */}
      <div
        className="rounded-lg px-4 py-2.5 flex items-center gap-3"
        style={{ background: "var(--bg-input)" }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--terra)" }}
        >
          <Mic size={12} color="white" />
        </div>
        <div className="flex-1 flex items-center gap-0.5 h-5">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full"
              style={{
                height: `${25 + ((i * 7) % 65)}%`,
                background: `${catColor}${i < 16 ? "cc" : "40"}`,
              }}
            />
          ))}
        </div>
        <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--text-mute)" }}>
          {formatDuration(sub.durationSec)}
        </span>
      </div>

      {/* Vote row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                disabled={!!sub.userVoted}
                onMouseEnter={() => !sub.userVoted && setHoverStar(n)}
                onMouseLeave={() => setHoverStar(0)}
                onClick={() => voteOnSubmission(sub.id, n as 1 | 2 | 3)}
                className="transition-transform hover:scale-110 disabled:cursor-default"
              >
                <Star
                  size={14}
                  fill={n <= (sub.userVoted || hoverStar) ? catColor : "none"}
                  stroke={catColor}
                  strokeWidth={1.5}
                />
              </button>
            ))}
            <span className="text-[11px] ml-1 font-mono" style={{ color: "var(--text-mute)" }}>
              {sub.votes.avgStars > 0 ? sub.votes.avgStars.toFixed(1) : "—"}
            </span>
          </div>
          <button
            disabled={!!sub.userVoted}
            onClick={() => voteOnSubmission(sub.id, 2)}
            className="flex items-center gap-1 text-[11px] transition-colors hover:text-[var(--terra)] disabled:cursor-default"
            style={{ color: "var(--text-mute)" }}
          >
            <ThumbsUp size={12} />
            <span>{sub.votes.upvotes}</span>
          </button>
        </div>
        <Link
          href={`/community/room/${sub.roomId}`}
          className="text-[11px] flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-mute)" }}
        >
          View Room <ArrowRight size={11} />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Room Card ────────────────────────────────────────────────────────────────

function RoomCard({
  room,
  onInspectUser,
}: {
  room: ResearchRoom;
  onInspectUser: (u: CommunityUser) => void;
}) {
  const { following } = useCommunityStore();
  const catColor = CATEGORY_COLORS[room.category] || "var(--terra)";
  const statusInfo = STATUS_LABELS[room.status] || STATUS_LABELS.lobby;
  const isJoinable = room.status === "lobby" || room.status === "research";

  // Check if any followed user is participating
  const followedParticipants = room.participants.filter((p) =>
    following.some((f) => f.id === p.user.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="surface rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="tag text-[10px]"
            style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}30` }}
          >
            {room.category}
          </span>
          <span
            className="tag text-[10px] uppercase font-mono"
            style={{ color: "var(--text-mute)", background: "var(--bg-input)" }}
          >
            {room.difficulty}
          </span>
          {followedParticipants.length > 0 && (
            <span className="tag text-[10px] bg-[var(--olive-light)] text-[var(--olive-text)] flex items-center gap-1 font-semibold">
              <UserCheck size={10} /> {followedParticipants[0].user.username.split(" ")[0]} here
            </span>
          )}
        </div>
        <span className="text-[11px] font-medium" style={{ color: statusInfo.color }}>
          ● {statusInfo.label}
        </span>
      </div>

      <p className="text-sm font-semibold leading-snug mb-3" style={{ color: "var(--text)" }}>
        {room.topicText}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-mute)" }}>
          <div className="flex items-center gap-1">
            <Users size={11} />
            <span>{room.participants.length} participant{room.participants.length === 1 ? "" : "s"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>{room.researchDurationMin}m research</span>
          </div>
          <div className="flex items-center gap-1">
            {room.visibility === "public" ? <Globe size={11} /> : <Lock size={11} />}
            <span className="capitalize">{room.visibility}</span>
          </div>
        </div>

        <Link href={`/community/room/${room.id}`}>
          <button className="btn-primary text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1">
            {isJoinable ? "Enter Room" : "View Results"} <ArrowRight size={11} />
          </button>
        </Link>
      </div>

      {/* Participant avatars */}
      <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-dim)" }}>
        <div className="flex items-center -space-x-1.5">
          {room.participants.slice(0, 5).map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onInspectUser(p.user)}
              title={`${p.user.username}${p.isHost ? " (Host)" : ""}`}
              className="hover:scale-110 transition-transform"
            >
              <UserAvatar avatar={p.user.avatar} size="xs" className="border-2 border-[var(--bg-card)]" />
            </button>
          ))}
        </div>
        <span className="text-[11px]" style={{ color: "var(--text-mute)" }}>
          Hosted by <strong style={{ color: "var(--text-dim)" }}>{room.host.username}</strong>
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Community Page ──────────────────────────────────────────────────────

type Tab = "feed" | "rooms" | "following" | "leaderboards";

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>("rooms");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [inspectUser, setInspectUser] = useState<CommunityUser | null>(null);

  const { rooms, mySubmissions, following } = useCommunityStore();
  const profile = useAppStore((s) => s.profile);

  // Active rooms
  const activeRooms = rooms.filter((r) => r.status !== "closed");

  // Public submissions across all rooms + user's own submissions
  const allSubmissionsMap = new Map<string, RoomSubmission>();
  rooms.forEach((r) => {
    r.submissions.forEach((s) => {
      if (s.isPublic) allSubmissionsMap.set(s.id, s);
    });
  });
  mySubmissions.forEach((s) => {
    if (s.isPublic) allSubmissionsMap.set(s.id, s);
  });
  const publicSubs = Array.from(allSubmissionsMap.values()).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  // Filtered rooms for "Following"
  const followingRooms = rooms.filter((r) =>
    r.participants.some((p) => following.some((f) => f.id === p.user.id))
  );

  // Filtered submissions for "Following"
  const followingSubs = publicSubs.filter((s) =>
    following.some((f) => f.id === s.user.id)
  );

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "rooms", label: "Live Rooms", count: activeRooms.length },
    { id: "feed", label: "Community Feed", count: publicSubs.length },
    { id: "following", label: "Following", count: following.length },
    { id: "leaderboards", label: "Members" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="font-space font-bold text-display mb-1" style={{ fontSize: "2rem" }}>
            Community
          </h1>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            Study together in live research rooms, explore ideas, and follow fellow learners.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowJoin(true)}
            className="px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all hover:bg-[var(--bg-input)]"
            style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
          >
            <KeyRound size={14} /> Join with Code
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm"
          >
            <Plus size={14} /> Start a Room
          </button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: <Users size={14} style={{ color: "var(--olive)" }} />, label: "Active Rooms", value: activeRooms.length },
          { icon: <Mic size={14} style={{ color: "var(--terra)" }} />, label: "Recordings", value: publicSubs.length },
          { icon: <UserCheck size={14} style={{ color: "var(--gold)" }} />, label: "Following", value: following.length },
        ].map((s, i) => (
          <div key={i} className="surface rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}>
              {s.icon}
            </div>
            <div>
              <div className="text-lg font-mono font-bold" style={{ color: "var(--text)" }}>{s.value}</div>
              <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 rounded-xl" style={{ background: "var(--bg-input)" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === t.id ? "var(--bg-card)" : "transparent",
              color: tab === t.id ? "var(--text)" : "var(--text-mute)",
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold"
                style={{
                  background: tab === t.id ? "var(--olive)" : "var(--bg-input)",
                  color: tab === t.id ? "white" : "var(--text-mute)",
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: LIVE ROOMS ── */}
      {tab === "rooms" && (
        <div className="space-y-4">
          {activeRooms.length === 0 ? (
            <div className="text-center py-16 surface rounded-2xl p-8 border" style={{ borderColor: "var(--border-dim)" }}>
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl border" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
                🚪
              </div>
              <h3 className="font-space font-bold text-base mb-1" style={{ color: "var(--text)" }}>
                No active rooms right now
              </h3>
              <p className="text-xs max-w-sm mx-auto mb-5" style={{ color: "var(--text-dim)" }}>
                Start a research room, pick a topic, and share the invite code with friends to study and speak together.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowCreate(true)}
                  className="btn-primary text-xs px-4 py-2.5 rounded-xl font-semibold"
                >
                  <Plus size={13} className="inline mr-1" /> Start the First Room
                </button>
                <button
                  onClick={() => setShowJoin(true)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-medium"
                  style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                >
                  Enter Code
                </button>
              </div>
            </div>
          ) : (
            activeRooms.map((room) => (
              <RoomCard key={room.id} room={room} onInspectUser={setInspectUser} />
            ))
          )}
        </div>
      )}

      {/* ── TAB: COMMUNITY FEED ── */}
      {tab === "feed" && (
        <div className="space-y-4">
          {publicSubs.length === 0 ? (
            <div className="text-center py-16 surface rounded-2xl p-8 border" style={{ borderColor: "var(--border-dim)" }}>
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl border" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
                🎙️
              </div>
              <h3 className="font-space font-bold text-base mb-1" style={{ color: "var(--text)" }}>
                No community recordings yet
              </h3>
              <p className="text-xs max-w-sm mx-auto mb-5" style={{ color: "var(--text-dim)" }}>
                Complete a session in a research room and choose to publish your synthesis talk to the community feed.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="btn-primary text-xs px-4 py-2.5 rounded-xl font-semibold"
              >
                Start a Room Session
              </button>
            </div>
          ) : (
            publicSubs.map((sub) => (
              <SubmissionCard key={sub.id} sub={sub} onInspectUser={setInspectUser} />
            ))
          )}
        </div>
      )}

      {/* ── TAB: FOLLOWING ── */}
      {tab === "following" && (
        <div className="space-y-6">
          {following.length === 0 ? (
            <div className="text-center py-16 surface rounded-2xl p-8 border" style={{ borderColor: "var(--border-dim)" }}>
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl border" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
                👥
              </div>
              <h3 className="font-space font-bold text-base mb-1" style={{ color: "var(--text)" }}>
                You aren't following anyone yet
              </h3>
              <p className="text-xs max-w-sm mx-auto mb-4" style={{ color: "var(--text-dim)" }}>
                When you follow peers in community rooms or leaderboards, you'll see the future research groups they join and their latest talks here.
              </p>
              <button
                onClick={() => setTab("rooms")}
                className="btn-primary text-xs px-4 py-2.5 rounded-xl font-semibold"
              >
                Browse Live Rooms
              </button>
            </div>
          ) : (
            <>
              {/* Followed Members Horizontal Strip */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-mute)" }}>
                  People You Follow ({following.length})
                </h3>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {following.map((u) => (
                    <button
                      key={u.id}
                      onClick={() =>
                        setInspectUser({
                          id: u.id,
                          username: u.username,
                          avatar: u.avatar,
                          bio: u.bio,
                          level: u.level || 1,
                          xp: u.xp || 0,
                        })
                      }
                      className="surface p-3 rounded-2xl border flex flex-col items-center gap-1.5 shrink-0 hover:scale-105 transition-all text-center min-w-[90px]"
                      style={{ borderColor: "var(--border-dim)" }}
                    >
                      <UserAvatar avatar={u.avatar} size="lg" />
                      <span className="text-xs font-semibold truncate max-w-[80px]" style={{ color: "var(--text)" }}>
                        {u.username}
                      </span>
                      <span className="text-[10px] text-[var(--olive-text)] font-mono">
                        Lvl {u.level || 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rooms where followed users are participating */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-mute)" }}>
                  Active Rooms with Followed Peers
                </h3>
                {followingRooms.length === 0 ? (
                  <div className="surface p-5 rounded-xl border text-center text-xs" style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}>
                    None of the learners you follow are currently in an active room.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {followingRooms.map((room) => (
                      <RoomCard key={room.id} room={room} onInspectUser={setInspectUser} />
                    ))}
                  </div>
                )}
              </div>

              {/* Submissions by followed users */}
              {followingSubs.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-mute)" }}>
                    Recent Talks by Followed Peers
                  </h3>
                  <div className="space-y-3">
                    {followingSubs.map((sub) => (
                      <SubmissionCard key={sub.id} sub={sub} onInspectUser={setInspectUser} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── TAB: MEMBERS / LEADERBOARD ── */}
      {tab === "leaderboards" && (
        <div className="space-y-4">
          <div className="surface p-5 rounded-2xl border" style={{ borderColor: "var(--border-dim)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={16} className="text-[var(--gold)]" />
              <h3 className="font-space font-bold text-sm" style={{ color: "var(--text)" }}>
                Community Members
              </h3>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>
              Fellow researchers in the Fey beta community. Click any learner to inspect their profile and follow them.
            </p>

            {/* Current user card */}
            <div className="p-3 rounded-xl border flex items-center justify-between mb-3" style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}>
              <div className="flex items-center gap-3">
                <UserAvatar avatar={profile.avatar} size="md" />
                <div>
                  <div className="text-xs font-bold" style={{ color: "var(--text)" }}>
                    {profile.username || "You"} <span className="text-[10px] text-[var(--olive-text)] font-semibold">(You)</span>
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>
                    "{profile.bio || "Exploring ideas."}"
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-semibold" style={{ color: "var(--gold)" }}>
                {profile.xp} XP
              </span>
            </div>

            {/* Followed peers */}
            {following.length > 0 ? (
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-mute)" }}>
                  Followed Scholars
                </span>
                {following.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() =>
                      setInspectUser({
                        id: u.id,
                        username: u.username,
                        avatar: u.avatar,
                        bio: u.bio,
                        level: u.level || 1,
                        xp: u.xp || 0,
                      })
                    }
                    className="w-full p-3 rounded-xl border flex items-center justify-between hover:bg-[var(--bg-input)] transition-colors text-left"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar avatar={u.avatar} size="md" />
                      <div>
                        <div className="text-xs font-bold" style={{ color: "var(--text)" }}>
                          {u.username}
                        </div>
                        <div className="text-[10px] truncate max-w-xs" style={{ color: "var(--text-mute)" }}>
                          {u.bio || "Active thinker"}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-input)] text-[var(--olive-text)] flex items-center gap-1">
                      <UserCheck size={11} /> Following
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center py-4" style={{ color: "var(--text-mute)" }}>
                Meet learners in live rooms to follow them here.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
        {showJoin && <JoinRoomModal onClose={() => setShowJoin(false)} />}
      </AnimatePresence>

      <UserProfileModal
        user={inspectUser}
        isOpen={!!inspectUser}
        onClose={() => setInspectUser(null)}
      />
    </div>
  );
}
