"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Star, Globe, Lock, Play, Filter, Clock, Sparkles, Share2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useCommunityStore } from "@/store/useCommunityStore";
import { MOCK_SUBMISSIONS, SELF_USER } from "@/lib/mockCommunity";
import ShareNoteModal from "@/components/notes/ShareNoteModal";
import type { SharedNotePayload } from "@/lib/share-note";

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

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type Filter = "all" | "public" | "private";
type Sort = "recent" | "rated" | "longest";

export default function LibraryPage() {
  const { sessions, profile } = useAppStore();
  const { mySubmissions, makeSubmissionPublic } = useCommunityStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [noteToShare, setNoteToShare] = useState<SharedNotePayload | null>(null);
  
  // Ref for global audio playback
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Solo session recordings (from sessions with audio)
  const soloRecordings = sessions
    .filter((s) => s.audioBase64 && s.speakingSeconds > 0)
    .map((s) => ({
      id: s.id,
      type: "solo" as const,
      topicText: s.topicText,
      category: s.category,
      difficulty: s.difficulty,
      notes: s.notes,
      durationSec: s.speakingSeconds,
      submittedAt: s.date + "T12:00:00Z",
      dateStr: s.date,
      xpEarned: s.xpEarned,
      tags: s.tags,
      isPublic: false,
      votes: { upvotes: 0, starRatings: [], avgStars: 0 },
      audioBase64: s.audioBase64,
    }));

  // Community room recordings
  const roomRecordings = mySubmissions.map((sub) => ({
    id: sub.id,
    type: "room" as const,
    topicText: sub.topicText,
    category: sub.category,
    durationSec: sub.durationSec,
    submittedAt: sub.submittedAt,
    isPublic: sub.isPublic,
    votes: sub.votes,
    audioBase64: sub.audioBase64,
  }));

  const all = [...roomRecordings, ...soloRecordings];

  const filtered = all
    .filter((r) => {
      if (filter === "public") return r.isPublic;
      if (filter === "private") return !r.isPublic;
      return true;
    })
    .sort((a, b) => {
      if (sort === "recent") return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      if (sort === "rated") return b.votes.avgStars - a.votes.avgStars;
      if (sort === "longest") return b.durationSec - a.durationSec;
      return 0;
    });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-space font-bold text-display mb-1" style={{ fontSize: "2rem" }}>
          Library
        </h1>
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          All your recordings in one place — solo sessions and community rooms.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {[
          { label: "Total Recordings", value: all.length },
          { label: "Total Time", value: `${Math.round(all.reduce((a, r) => a + r.durationSec, 0) / 60)}m` },
          { label: "Avg Rating", value: all.some((r) => r.votes.avgStars > 0) ? (all.reduce((a, r) => a + r.votes.avgStars, 0) / all.filter((r) => r.votes.avgStars > 0).length).toFixed(1) + " ★" : "—" },
        ].map((s, i) => (
          <div key={i} className="surface rounded-xl p-4">
            <div className="text-xl font-mono font-bold mb-0.5" style={{ color: "var(--text)" }}>{s.value}</div>
            <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--bg-input)" }}>
          {(["all", "public", "private"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
              style={{
                background: filter === f ? "var(--bg-card)" : "transparent",
                color: filter === f ? "var(--text)" : "var(--text-mute)",
              }}
            >
              {f === "public" ? <><Globe size={10} className="inline mr-1" />{f}</> : f === "private" ? <><Lock size={10} className="inline mr-1" />{f}</> : f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--bg-input)" }}>
          {(["recent", "rated", "longest"] as Sort[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
              style={{
                background: sort === s ? "var(--bg-card)" : "transparent",
                color: sort === s ? "var(--text)" : "var(--text-mute)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Recordings list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border surface p-8" style={{ borderColor: "var(--border-dim)" }}>
          <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-xl border" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
            🎙️
          </div>
          <p className="text-base font-semibold mb-1" style={{ color: "var(--text)" }}>Your library is waiting</p>
          <p className="text-xs max-w-sm mx-auto mb-6" style={{ color: "var(--text-dim)" }}>
            Recordings from your solo research speaking sessions and community room submissions will be stored privately here.
          </p>
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold"
          >
            <Sparkles size={14} /> Start a Session
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rec, i) => {
            const catColor = CATEGORY_COLORS[rec.category] || "var(--terra)";
            const isPlaying = playingId === rec.id;
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="surface rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="tag text-[10px]"
                        style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}30` }}
                      >
                        {rec.category}
                      </span>
                      <span
                        className="tag text-[10px]"
                        style={{ color: "var(--text-mute)", background: "var(--bg-input)" }}
                      >
                        {rec.type === "room" ? "Room" : "Solo"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text)" }}>
                      {rec.topicText}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const sub = mySubmissions.find((s) => s.id === rec.id);
                        if (sub && !sub.isPublic) makeSubmissionPublic(rec.id);
                      }}
                      className="tag text-[10px] flex items-center gap-1 transition-colors"
                      style={{
                        color: rec.isPublic ? "#22C55E" : "var(--text-mute)",
                        background: rec.isPublic ? "#22C55E18" : "var(--bg-input)",
                      }}
                    >
                      {rec.isPublic ? <Globe size={9} /> : <Lock size={9} />}
                      {rec.isPublic ? "Public" : "Private"}
                    </button>
                  </div>
                </div>

                {/* Audio player */}
                <div
                  className="rounded-lg px-4 py-2.5 flex items-center gap-3 mb-3"
                  style={{ background: "var(--bg-input)" }}
                >
                  <button
                    onClick={() => {
                      if (isPlaying) {
                        setPlayingId(null);
                        if (audioRef.current) audioRef.current.pause();
                      } else {
                        setPlayingId(rec.id);
                        if (audioRef.current && rec.audioBase64) {
                          audioRef.current.src = rec.audioBase64;
                          audioRef.current.currentTime = 0;
                          audioRef.current.play().catch(console.error);
                        }
                      }
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform hover:scale-110"
                    style={{ background: isPlaying ? "#DC2626" : "var(--terra)" }}
                  >
                    {isPlaying
                      ? <span className="w-2.5 h-2.5 bg-white rounded-sm" />
                      : <Play size={10} color="white" />}
                  </button>
                  <div className="flex-1 flex items-center gap-0.5 h-5">
                    {Array.from({ length: 40 }).map((_, j) => (
                      <div
                        key={j}
                        className="w-0.5 rounded-full transition-all"
                        style={{
                          height: `${Math.max(20, Math.random() * 100)}%`,
                          background: isPlaying && j < 20
                            ? catColor
                            : `${catColor}40`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--text-mute)" }}>
                    {formatDuration(rec.durationSec)}
                  </span>
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between text-[11px]" style={{ color: "var(--text-mute)" }}>
                  <div className="flex items-center gap-3">
                    <span>{timeAgo(rec.submittedAt)}</span>
                    {rec.votes.avgStars > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={10} fill="var(--gold)" stroke="var(--gold)" />
                        {rec.votes.avgStars.toFixed(1)}
                      </span>
                    )}
                    {rec.votes.upvotes > 0 && <span>↑ {rec.votes.upvotes}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    {"notes" in rec && rec.notes && (
                      <button
                        onClick={() =>
                          setNoteToShare({
                            topicId: rec.id,
                            topicText: rec.topicText,
                            category: rec.category,
                            difficulty: ("difficulty" in rec && rec.difficulty) || "Scholar",
                            notes: rec.notes || "",
                            author: profile.username || "Scholar",
                            date: ("dateStr" in rec && rec.dateStr) || "September 2026",
                            speakingSeconds: rec.durationSec,
                            xpEarned: ("xpEarned" in rec && rec.xpEarned) || 150,
                            tags: ("tags" in rec && rec.tags) || [],
                          })
                        }
                        className="btn-ghost flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono rounded-lg border border-[var(--border-dim)] hover:border-[var(--terra)] hover:text-[var(--terra)] transition-colors cursor-pointer"
                      >
                        <Share2 size={10} />
                        <span>Share Notes</span>
                      </button>
                    )}
                    <Clock size={10} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Share Note Modal */}
      <ShareNoteModal
        isOpen={Boolean(noteToShare)}
        onClose={() => setNoteToShare(null)}
        note={noteToShare}
      />

      {/* Global hidden audio element for playback */}
      <audio 
        ref={audioRef} 
        className="hidden" 
        onEnded={() => setPlayingId(null)} 
        onPause={() => setPlayingId(null)}
      />
    </div>
  );
}
