"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users, Globe, Lock, Plus, ArrowRight, Star, ThumbsUp,
  Clock, Mic, Trophy, Search, Filter, Flame, Zap
} from "lucide-react";
import { useCommunityStore } from "@/store/useCommunityStore";
import {
  MOCK_SUBMISSIONS, MOCK_ROOMS, LEADERBOARD_TOPICS,
  type ResearchRoom, type RoomSubmission
} from "@/lib/mockCommunity";

import CreateRoomModal from "@/components/community/CreateRoomModal";

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

function SubmissionCard({ sub }: { sub: RoomSubmission }) {
  const { voteOnSubmission } = useCommunityStore();
  const [hoverStar, setHoverStar] = useState(0);
  const catColor = CATEGORY_COLORS[sub.category] || "var(--terra)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="surface rounded-xl p-5 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold shrink-0"
            style={{ background: `${catColor}18`, border: `1.5px solid ${catColor}40` }}
          >
            {sub.user.avatar}
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: "var(--text)" }}>{sub.user.username}</div>
            <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>
              {timeAgo(sub.submittedAt)} · {formatDuration(sub.durationSec)}
            </div>
          </div>
        </div>
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

      {/* Audio placeholder */}
      <div
        className="rounded-lg px-4 py-2.5 flex items-center gap-3"
        style={{ background: "var(--bg-input)" }}
      >
        <button
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-110"
          style={{ background: "var(--terra)" }}
        >
          <Mic size={12} color="white" />
        </button>
        <div className="flex-1 flex items-center gap-0.5 h-5">
          {Array.from({ length: 36 }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full"
              style={{
                height: `${Math.max(20, Math.random() * 100)}%`,
                background: `${catColor}${i < 18 ? "cc" : "40"}`,
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
          {/* Stars */}
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
          {/* Upvotes */}
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
        <Link href={`/community/topics/${sub.topicId}`}>
          <span className="text-[10px] hover:underline" style={{ color: "var(--terra)" }}>
            View leaderboard →
          </span>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Room Card ────────────────────────────────────────────────────────────────

function RoomCard({ room }: { room: ResearchRoom }) {
  const { joinRoom } = useCommunityStore();
  const catColor = CATEGORY_COLORS[room.category] || "var(--terra)";
  const { label, color } = STATUS_LABELS[room.status];
  const isJoinable = room.status === "research" || room.status === "lobby";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="surface rounded-xl p-5"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className="tag text-[10px]"
          style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}30` }}
        >
          {room.category}
        </span>
        <div className="flex items-center gap-1.5 text-[10px]" style={{ color }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
          {label}
        </div>
      </div>

      <p className="text-sm font-semibold leading-snug mb-3" style={{ color: "var(--text)" }}>
        {room.topicText}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-mute)" }}>
          <div className="flex items-center gap-1">
            <Users size={11} />
            <span>{room.participants.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>{room.researchDurationMin}min</span>
          </div>
          <div className="flex items-center gap-1">
            {room.visibility === "public" ? <Globe size={11} /> : <Lock size={11} />}
            <span>{room.visibility}</span>
          </div>
        </div>

        {isJoinable ? (
          <Link href={`/community/room/${room.id}`}>
            <button
              onClick={() => joinRoom(room.id)}
              className="btn-terra text-xs px-3 py-1.5"
            >
              Join <ArrowRight size={11} />
            </button>
          </Link>
        ) : room.status === "voting" ? (
          <Link href={`/community/room/${room.id}`}>
            <button className="btn-ghost text-xs px-3 py-1.5">Vote →</button>
          </Link>
        ) : (
          <Link href={`/community/topics/${room.topicId}`}>
            <button className="btn-ghost text-xs px-3 py-1.5">Results →</button>
          </Link>
        )}
      </div>

      {/* Participant avatars */}
      <div className="flex items-center gap-1 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-dim)" }}>
        {room.participants.slice(0, 6).map((p, i) => (
          <div
            key={i}
            title={p.user.username}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs border"
            style={{
              background: "var(--bg-input)",
              borderColor: p.status === "researching" ? "var(--terra)" : "var(--border-dim)",
            }}
          >
            {p.user.avatar}
          </div>
        ))}
        {room.participants.length > 6 && (
          <span className="text-[10px] ml-1" style={{ color: "var(--text-mute)" }}>
            +{room.participants.length - 6}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Community Page ──────────────────────────────────────────────────────

type Tab = "feed" | "rooms" | "leaderboards";

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>("feed");
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const { rooms } = useCommunityStore();

  const activeRooms = rooms.filter((r) => r.status !== "closed" && r.visibility === "public");
  const feedSubs = MOCK_SUBMISSIONS.filter((s) => s.isPublic);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "feed", label: "Community Feed", count: feedSubs.length },
    { id: "rooms", label: "Live Rooms", count: activeRooms.length },
    { id: "leaderboards", label: "Leaderboards" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="font-space font-bold text-display mb-1" style={{ fontSize: "2rem" }}>
            Community
          </h1>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            Research together, challenge each other, top the leaderboards.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-terra flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={14} /> Start a Room
        </button>
      </motion.div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: <Users size={14} style={{ color: "var(--terra)" }} />, label: "Active Rooms", value: activeRooms.length },
          { icon: <Mic size={14} style={{ color: "var(--gold)" }} />, label: "Recordings Today", value: 12 },
          { icon: <Trophy size={14} style={{ color: "var(--terra)" }} />, label: "Topics Covered", value: LEADERBOARD_TOPICS.length },
        ].map((s, i) => (
          <div key={i} className="surface rounded-xl p-4 flex items-center gap-3">
            {s.icon}
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
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? "var(--bg-card)" : "transparent",
              color: tab === t.id ? "var(--text)" : "var(--text-mute)",
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                style={{
                  background: tab === t.id ? "var(--terra)" : "var(--bg-panel)",
                  color: tab === t.id ? "white" : "var(--text-mute)",
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feed */}
      <AnimatePresence mode="wait">
        {tab === "feed" && (
          <motion.div
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {feedSubs.map((sub) => (
              <SubmissionCard key={sub.id} sub={sub} />
            ))}
          </motion.div>
        )}

        {tab === "rooms" && (
          <motion.div
            key="rooms"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {activeRooms.length === 0 ? (
              <div className="text-center py-16" style={{ color: "var(--text-mute)" }}>
                <Users size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No active rooms right now.</p>
                <button onClick={() => setShowCreate(true)} className="btn-terra mt-4">
                  Start one →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {activeRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "leaderboards" && (
          <motion.div
            key="lb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {LEADERBOARD_TOPICS.map((topic, i) => {
              const catColor = CATEGORY_COLORS[topic.category] || "var(--terra)";
              return (
                <Link key={topic.topicId} href={`/community/topics/${topic.topicId}`}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="surface rounded-xl p-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                        style={{ background: `${catColor}18`, color: catColor }}
                      >
                        {i === 0 ? "👑" : i === 1 ? "🥈" : "🥉"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>
                          {topic.topicText}
                        </p>
                        <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-mute)" }}>
                          <span
                            className="inline-block px-1.5 py-0.5 rounded"
                            style={{ background: `${catColor}18`, color: catColor }}
                          >
                            {topic.category}
                          </span>
                          <span>{topic.totalSubmissions} recordings</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} style={{ color: "var(--text-mute)" }} className="shrink-0" />
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  );
}
