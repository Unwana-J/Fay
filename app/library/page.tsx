"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Star,
  Globe,
  Lock,
  Play,
  Clock,
  Sparkles,
  Share2,
  Calendar,
  Plus,
  Trash2,
  ArrowRight,
  Search,
  Check,
  RefreshCcw,
  X,
} from "lucide-react";
import { useAppStore, getNext7ScheduleDays } from "@/store/useAppStore";
import { useCommunityStore } from "@/store/useCommunityStore";
import { TOPIC_BANK, DIFFICULTY_LABELS, type Topic, type Difficulty } from "@/lib/topics";
import { todayStr, cn } from "@/lib/utils";
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
type LibraryTab = "recordings" | "schedule";

function formatScheduleDayLabel(dateIso: string, index: number): { badge: string; fullDate: string } {
  const d = new Date(dateIso + "T00:00:00");
  const fullDate = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  if (index === 0) return { badge: "Tomorrow", fullDate };
  return { badge: `Day ${index + 1}`, fullDate };
}

export default function LibraryPage() {
  const router = useRouter();
  const {
    sessions,
    profile,
    settings,
    updateSettings,
    customTopics,
    scheduledTopics = [],
    scheduleTopicForDate,
    removeScheduledTopic,
    startSession,
  } = useAppStore();
  const { mySubmissions, makeSubmissionPublic } = useCommunityStore();
  const [activeTab, setActiveTab] = useState<LibraryTab>("recordings");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [noteToShare, setNoteToShare] = useState<SharedNotePayload | null>(null);

  // 7-Day Schedule Picker Modal state
  const [planningForDate, setPlanningForDate] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCategory, setPickerCategory] = useState<string>("all");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "schedule") {
        setActiveTab("schedule");
      }
    }
  }, []);

  const todayIso = todayStr();
  const next7Days = useMemo(() => getNext7ScheduleDays(todayIso), [todayIso]);
  const activeScheduledMap = useMemo(() => {
    const map: Record<string, Topic> = {};
    for (const item of scheduledTopics) {
      if (item.date >= todayIso) {
        map[item.date] = item.topic;
      }
    }
    return map;
  }, [scheduledTopics, todayIso]);

  const scheduledCount = next7Days.filter((d) => Boolean(activeScheduledMap[d])).length;
  const activeDifficulty: Difficulty = (settings.difficultyMode as Difficulty) || "Novice";

  const availablePickerTopics = useMemo(() => {
    const allTopics = [...TOPIC_BANK, ...(customTopics || [])];
    const completedIds = new Set(sessions.map((s) => s.topicId));
    const scheduledIdsOnOtherDays = new Set(
      Object.entries(activeScheduledMap)
        .filter(([date]) => date !== planningForDate)
        .map(([, t]) => t.id)
    );
    const userCats =
      settings.favoriteCategories?.length > 0
        ? settings.favoriteCategories
        : settings.enabledCategories?.length > 0
        ? settings.enabledCategories
        : ["Artificial Intelligence", "Technology"];

    return allTopics.filter((t) => {
      if (completedIds.has(t.id) || scheduledIdsOnOtherDays.has(t.id)) return false;
      if (t.difficulty !== activeDifficulty) return false;
      if (pickerCategory === "all") {
        if (!userCats.includes(t.category)) return false;
      } else if (t.category !== pickerCategory) {
        return false;
      }
      if (pickerSearch.trim()) {
        const q = pickerSearch.toLowerCase();
        return (
          t.text.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [
    customTopics,
    sessions,
    activeScheduledMap,
    planningForDate,
    activeDifficulty,
    pickerCategory,
    pickerSearch,
    settings.favoriteCategories,
    settings.enabledCategories,
  ]);
  
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
        className="mb-6"
      >
        <h1 className="font-space font-bold text-display mb-1" style={{ fontSize: "2rem" }}>
          Library &amp; Study Schedule
        </h1>
        <p className="text-sm" style={{ color: "var(--text-dim)" }}>
          Review your recorded syntheses and plan up to 7 days of upcoming topics.
        </p>
      </motion.div>

      {/* Segmented Tab Control: Recordings vs 7-Day Schedule */}
      <div
        className="flex p-1.5 rounded-2xl border-[1.5px] bg-[var(--bg-input)]/60 gap-2 mb-6"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("recordings")}
          className={cn(
            "flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeTab === "recordings"
              ? "bg-[var(--bg-card)] text-[var(--text)] font-bold border border-[var(--border)]"
              : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          <Mic size={15} className={activeTab === "recordings" ? "text-[var(--terra)]" : "opacity-60"} />
          <span>Recordings ({all.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schedule")}
          className={cn(
            "flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeTab === "schedule"
              ? "bg-[var(--bg-card)] text-[var(--text)] font-bold border border-[var(--border)]"
              : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          <Calendar size={15} className={activeTab === "schedule" ? "text-[var(--olive)]" : "opacity-60"} />
          <span>7-Day Schedule ({scheduledCount}/7)</span>
        </button>
      </div>

      {activeTab === "schedule" ? (
        <motion.div
          key="schedule-view"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Schedule Overview Card */}
          <div
            className="rounded-2xl p-5 border-[1.5px] surface"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
              <div className="flex items-center gap-2">
                <Calendar size={17} className="text-[var(--olive)]" />
                <h2 className="font-serif font-bold text-lg" style={{ color: "var(--text)" }}>
                  Your 7-Day Topic Queue
                </h2>
              </div>
              <span className="tag tag-olive font-mono text-xs px-2.5 py-1">
                {scheduledCount}/7 Days Planned
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
              Plan up to 7 days ahead (1 topic per day). Whichever topic is scheduled for a given day will automatically greet you at the top of your Dashboard when you log in that day.
            </p>
          </div>

          {/* 7-Day Slots */}
          <div className="space-y-3">
            {next7Days.map((dateIso, idx) => {
              const { badge, fullDate } = formatScheduleDayLabel(dateIso, idx);
              const topic = activeScheduledMap[dateIso];
              const catColor = topic ? CATEGORY_COLORS[topic.category] || "var(--olive)" : "var(--border)";

              return (
                <div
                  key={dateIso}
                  className="rounded-2xl p-4 sm:p-5 border-[1.5px] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{
                    background: topic ? "var(--bg-card)" : "var(--bg-panel)",
                    borderColor: topic ? "var(--olive)" : "var(--border-dim)",
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className={cn(
                          "text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                          idx === 0
                            ? "bg-[var(--terra)] text-white"
                            : "bg-[var(--bg-input)] text-[var(--olive)] border border-[var(--border-dim)]"
                        )}
                      >
                        {badge} · {fullDate}
                      </span>
                      {topic && (
                        <>
                          <span
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${catColor}15`,
                              color: catColor,
                              border: `1px solid ${catColor}30`,
                            }}
                          >
                            {topic.category}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--text-mute)]">
                            {DIFFICULTY_LABELS[topic.difficulty]?.icon ?? "I"} {topic.difficulty}
                          </span>
                        </>
                      )}
                    </div>

                    {topic ? (
                      <p className="font-serif font-bold text-sm sm:text-base leading-snug" style={{ color: "var(--text)" }}>
                        {topic.text}
                      </p>
                    ) : (
                      <p className="text-xs italic" style={{ color: "var(--text-mute)" }}>
                        No topic scheduled for {fullDate} yet.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {topic ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            const id = startSession(topic, settings.researchMin);
                            router.push(`/session/${id}`);
                          }}
                          className="btn-terra px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1 cursor-pointer"
                        >
                          <span>Start Now</span>
                          <ArrowRight size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPickerSearch("");
                            setPickerCategory("all");
                            setPlanningForDate(dateIso);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border border-[var(--border)] bg-[var(--bg-panel)] hover:border-[var(--olive)] text-[var(--text)] whitespace-nowrap transition-colors cursor-pointer"
                        >
                          Swap
                        </button>
                        <button
                          type="button"
                          onClick={() => removeScheduledTopic(dateIso)}
                          className="p-1.5 rounded-lg border border-[var(--border-dim)] text-[var(--text-mute)] hover:text-[var(--red)] hover:border-[var(--red)] transition-colors cursor-pointer"
                          title="Remove from schedule"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPickerSearch("");
                          setPickerCategory("all");
                          setPlanningForDate(dateIso);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border border-[var(--olive)]/50 bg-[var(--bg-card)] hover:bg-[var(--olive)] hover:text-white text-[var(--olive)] flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Plan Topic</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <>
          {/* Quick 7-Day Schedule Summary Banner inside Recordings Tab */}
          <div
            className="rounded-2xl p-4 mb-6 border flex items-center justify-between gap-3 flex-wrap surface"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--olive)]/12 border border-[var(--olive)]/30 shrink-0">
                <Calendar size={16} className="text-[var(--olive)]" />
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: "var(--text)" }}>
                  7-Day Study Schedule · {scheduledCount}/7 Days Planned
                </div>
                <div className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                  {scheduledCount > 0
                    ? `Next queued topic: "${(activeScheduledMap[next7Days.find((d) => Boolean(activeScheduledMap[d]))!]?.text || "").slice(0, 52)}..."`
                    : "Queue up to 7 days of topics in advance so your daily question is always ready."}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border border-[var(--olive)] text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Manage 7-Day Schedule
            </button>
          </div>

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
        </>
      )}

      {/* 7-Day Schedule Topic Finder Modal */}
      <AnimatePresence>
        {planningForDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className="w-full max-w-2xl rounded-3xl p-5 sm:p-6 border-[1.5px] surface-raised shadow-2xl max-h-[85vh] flex flex-col"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b" style={{ borderColor: "var(--border-dim)" }}>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--olive)] mb-0.5 flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>
                      Plan Topic for{" "}
                      {new Date(planningForDate + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl" style={{ color: "var(--text)" }}>
                    Choose Your Scheduled Topic
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPlanningForDate(null)}
                  className="p-2 rounded-xl border border-[var(--border-dim)] text-[var(--text-mute)] hover:text-[var(--text)] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search + Level Switcher + Category Filters */}
              <div className="space-y-3 mb-4">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div
                    className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border"
                    style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}
                  >
                    <Search size={14} className="text-[var(--text-mute)] shrink-0" />
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search topics or keywords..."
                      className="w-full bg-transparent text-xs sm:text-sm focus:outline-none"
                      style={{ color: "var(--text)" }}
                    />
                  </div>

                  {/* Level Filter */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(["Novice", "Scholar", "Expert"] as Difficulty[]).map((lvl) => {
                      const isCurrent = activeDifficulty === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => updateSettings({ difficultyMode: lvl })}
                          className="px-2.5 py-2 rounded-xl text-xs font-mono font-semibold border transition-colors cursor-pointer"
                          style={{
                            borderColor: isCurrent ? "var(--terra)" : "var(--border)",
                            backgroundColor: isCurrent ? "var(--terra)" : "var(--bg-panel)",
                            color: isCurrent ? "#FFFFFF" : "var(--text-dim)",
                          }}
                        >
                          {DIFFICULTY_LABELS[lvl]?.icon} {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setPickerCategory("all")}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border whitespace-nowrap cursor-pointer"
                    style={{
                      borderColor: pickerCategory === "all" ? "var(--olive)" : "var(--border-dim)",
                      backgroundColor: pickerCategory === "all" ? "var(--olive)" : "var(--bg-panel)",
                      color: pickerCategory === "all" ? "#FFFFFF" : "var(--text-dim)",
                    }}
                  >
                    My Interests
                  </button>
                  {(settings.favoriteCategories?.length
                    ? settings.favoriteCategories
                    : settings.enabledCategories
                  ).map((cat) => {
                    const active = pickerCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setPickerCategory(cat)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border whitespace-nowrap cursor-pointer"
                        style={{
                          borderColor: active ? "var(--olive)" : "var(--border-dim)",
                          backgroundColor: active ? "var(--olive)" : "var(--bg-panel)",
                          color: active ? "#FFFFFF" : "var(--text-dim)",
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {availablePickerTopics.length === 0 ? (
                  <div className="text-center py-10 text-xs" style={{ color: "var(--text-mute)" }}>
                    No matching topics found at the {activeDifficulty} level. Try clearing your search or switching levels.
                  </div>
                ) : (
                  availablePickerTopics.slice(0, 30).map((t) => {
                    const isCurrentlyAssigned = activeScheduledMap[planningForDate]?.id === t.id;
                    const catColor = CATEGORY_COLORS[t.category] || "var(--olive)";
                    return (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                        style={{
                          background: isCurrentlyAssigned ? "rgba(68, 78, 44, 0.08)" : "var(--bg-panel)",
                          borderColor: isCurrentlyAssigned ? "var(--olive)" : "var(--border-dim)",
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor: `${catColor}15`,
                                color: catColor,
                                border: `1px solid ${catColor}30`,
                              }}
                            >
                              {t.category}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--text-mute)]">
                              {DIFFICULTY_LABELS[t.difficulty]?.icon} {t.difficulty}
                            </span>
                          </div>
                          <p className="font-serif font-bold text-xs sm:text-sm leading-snug" style={{ color: "var(--text)" }}>
                            {t.text}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            scheduleTopicForDate(t, planningForDate);
                            setPlanningForDate(null);
                          }}
                          className="btn-terra px-3.5 py-2 rounded-lg text-xs font-mono font-bold whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check size={13} />
                          <span>{isCurrentlyAssigned ? "Selected" : "Schedule for This Day"}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
