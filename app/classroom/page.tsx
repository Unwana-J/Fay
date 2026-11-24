"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  Mic,
  Plus,
  KeyRound,
  Lock,
  Play,
  Share2,
  Trash2,
  Search,
  Check,
  X,
  Headphones,
} from "lucide-react";
import { useAppStore, getNext7ScheduleDays } from "@/store/useAppStore";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useClassroomStore } from "@/store/useClassroomStore";
import {
  CATEGORY_COLORS,
  TOPIC_BANK,
  DIFFICULTY_LABELS,
  type Topic,
  type Difficulty,
} from "@/lib/topics";
import {
  computeEffectiveUnlockedSlot,
  getNextActionableSlotForUser,
  formatClassroomCodeDisplay,
  normalizeClassroomCode,
} from "@/lib/classroom-types";
import { todayStr, cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";
import ShareNoteModal from "@/components/notes/ShareNoteModal";
import type { SharedNotePayload } from "@/lib/share-note";
import CreateClassroomModal from "@/components/classroom/CreateClassroomModal";
import JoinClassroomModal from "@/components/classroom/JoinClassroomModal";

type HubTab = "classrooms" | "schedule" | "recordings";
type VaultFilter = "all" | "solo" | "classroom";
type VaultSort = "recent" | "longest";

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

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

export default function ClassroomHubPage() {
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
  const { mySubmissions: legacyRoomSubmissions } = useCommunityStore();
  const {
    classrooms,
    submissionsByCode,
    fetchMyClassrooms,
  } = useClassroomStore();

  const [activeTab, setActiveTab] = useState<HubTab>("classrooms");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<"categories" | "schedule" | "custom">("categories");
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Schedule picker modal state
  const [planningForDate, setPlanningForDate] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCategory, setPickerCategory] = useState<string>("all");

  // Vault playback & filters
  const [vaultFilter, setVaultFilter] = useState<VaultFilter>("all");
  const [vaultSort, setVaultSort] = useState<VaultSort>("recent");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.25 | 1.5>(1);
  const [noteToShare, setNoteToShare] = useState<SharedNotePayload | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Read initial `?tab=` parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab");
      if (t === "schedule" || t === "recordings" || t === "classrooms") {
        setActiveTab(t);
      }
    }
  }, []);

  // Sync user's Classrooms from server
  useEffect(() => {
    if (profile?.id) {
      fetchMyClassrooms(profile.id, profile.username);
    }
  }, [profile?.id, profile?.username, fetchMyClassrooms]);

  // ─── 7-Day Solo Schedule State ─────────────────────────────────────────────
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

  const scheduledQueueTopics = useMemo(
    () => next7Days.map((d) => activeScheduledMap[d]).filter((t): t is Topic => Boolean(t)),
    [next7Days, activeScheduledMap]
  );
  const scheduledCount = scheduledQueueTopics.length;
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

  // ─── Unified Recordings Vault ──────────────────────────────────────────────
  const allVaultRecordings = useMemo(() => {
    // 1. Classroom recordings by this user
    const classroomRecs: Array<{
      id: string;
      scope: "classroom" | "solo";
      classroomCode?: string;
      classroomTitle?: string;
      slotNumber?: number;
      topicText: string;
      category: string;
      difficulty?: Difficulty;
      durationSec: number;
      submittedAt: string;
      dateStr?: string;
      audioSrc?: string;
      notes?: string;
      xpEarned?: number;
      tags?: string[];
      heardCount?: number;
    }> = [];

    const seenKeys = new Set<string>();

    for (const c of classrooms) {
      const code = normalizeClassroomCode(c.code);
      const subs = submissionsByCode[code] || [];
      for (const sub of subs) {
        const isMine =
          sub.userId === profile.id ||
          (profile.username &&
            profile.username !== "Scholar" &&
            sub.username?.trim().toLowerCase() === profile.username.trim().toLowerCase());
        if (!isMine || !sub.audioUrl) continue;
        const dedupKey = `${sub.topicId}-${sub.submittedAt.slice(0, 10)}`;
        seenKeys.add(dedupKey);
        classroomRecs.push({
          id: sub.id,
          scope: "classroom",
          classroomCode: c.code,
          classroomTitle: c.title,
          slotNumber: sub.slotNumber,
          topicText: sub.topicText,
          category: sub.category,
          durationSec: sub.durationSeconds,
          submittedAt: sub.submittedAt,
          dateStr: sub.submittedAt.slice(0, 10),
          audioSrc: sub.audioUrl,
          notes: sub.notes,
          heardCount: (sub.heardBy || []).length,
        });
      }
    }

    // 2. Solo recordings (avoiding duplicates already synced as Classroom submissions on same day/topic)
    for (const s of sessions) {
      if (!s.audioBase64 || s.speakingSeconds <= 0) continue;
      const dedupKey = `${s.topicId}-${s.date}`;
      if (seenKeys.has(dedupKey)) continue;
      classroomRecs.push({
        id: s.id,
        scope: "solo",
        topicText: s.topicText,
        category: s.category,
        difficulty: s.difficulty,
        durationSec: s.speakingSeconds,
        submittedAt: s.date + "T12:00:00Z",
        dateStr: s.date,
        audioSrc: s.audioBase64,
        notes: s.notes,
        xpEarned: s.xpEarned,
        tags: s.tags,
      });
    }

    // 3. Legacy room submissions (if any)
    for (const legacy of legacyRoomSubmissions) {
      if (!legacy.audioBase64) continue;
      classroomRecs.push({
        id: legacy.id,
        scope: "classroom",
        classroomTitle: "Past Salon",
        topicText: legacy.topicText,
        category: legacy.category,
        durationSec: legacy.durationSec,
        submittedAt: legacy.submittedAt,
        audioSrc: legacy.audioBase64,
      });
    }

    return classroomRecs;
  }, [classrooms, submissionsByCode, sessions, legacyRoomSubmissions, profile.id, profile.username]);

  const filteredRecordings = useMemo(() => {
    return allVaultRecordings
      .filter((r) => {
        if (vaultFilter === "solo") return r.scope === "solo";
        if (vaultFilter === "classroom") return r.scope === "classroom";
        return true;
      })
      .sort((a, b) => {
        if (vaultSort === "longest") return b.durationSec - a.durationSec;
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });
  }, [allVaultRecordings, vaultFilter, vaultSort]);

  function cyclePlaybackSpeed() {
    const next: 1 | 1.25 | 1.5 = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    setPlaybackRate(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  }

  function handlePlayVaultAudio(id: string, src?: string) {
    if (!src || !audioRef.current) return;
    if (playingId === id) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }
    setPlayingId(id);
    audioRef.current.src = src;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => setPlayingId(null));
  }

  // Split Classrooms into Active vs Completed
  const activeClassrooms = classrooms.filter((c) => c.status !== "completed");
  const completedClassrooms = classrooms.filter((c) => c.status === "completed");

  const tabs: Array<{ id: HubTab; label: string; count: string; icon: React.ElementType }> = [
    { id: "classrooms", label: "Classrooms", count: String(activeClassrooms.length), icon: Users },
    { id: "schedule", label: "Study Schedule", count: `${scheduledCount}/7`, icon: Calendar },
    { id: "recordings", label: "Recordings", count: String(allVaultRecordings.length), icon: Mic },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="font-space font-bold text-display mb-1" style={{ fontSize: "2rem" }}>
            Classroom
          </h1>
          <p className="text-sm" style={{ color: "var(--text-dim)" }}>
            Learn with close friends across multi-day topic challenges, plan your 7-day syllabus, and revisit your recordings.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowJoinModal(true)}
            className="px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all hover:bg-[var(--bg-input)] active:scale-[0.98] cursor-pointer"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            <KeyRound size={14} />
            <span>Join with Code</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCreateModalMode("categories");
              setShowCreateModal(true);
            }}
            className="btn-terra px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-transform active:scale-[0.98] cursor-pointer"
          >
            <Plus size={14} />
            <span>Start Classroom</span>
          </button>
        </div>
      </motion.div>

      {/* Sliding Segmented Tab Control */}
      <div
        className="grid grid-cols-3 p-1.5 rounded-2xl border-[1.5px] gap-1.5 mb-7"
        style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}
      >
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "relative py-2.5 px-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 z-10 cursor-pointer",
                isActive ? "text-[var(--text)] font-bold" : "text-[var(--text-mute)] hover:text-[var(--text)]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeClassroomHubTab"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute inset-0 rounded-xl border z-[-1]"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border)",
                  }}
                />
              )}
              <Icon
                size={14}
                className={isActive ? "text-[var(--terra)] shrink-0" : "opacity-65 shrink-0"}
              />
              <span className="truncate">{t.label}</span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.2 rounded-md hidden sm:inline-block"
                style={{
                  background: isActive ? "var(--bg-input)" : "transparent",
                  color: "var(--text-mute)",
                }}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: CLASSROOMS ─── */}
      {activeTab === "classrooms" && (
        <motion.div
          key="tab-classrooms"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="space-y-6"
        >
          {activeClassrooms.length === 0 && completedClassrooms.length === 0 ? (
            <div
              className="rounded-2xl border-[1.5px] p-7 sm:p-9 text-center surface"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center border"
                style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}
              >
                <Users size={22} className="text-[var(--olive)]" />
              </div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl mb-2" style={{ color: "var(--text)" }}>
                Learn &amp; Articulate With Close Friends
              </h2>
              <p className="text-xs sm:text-sm max-w-md mx-auto leading-relaxed mb-6" style={{ color: "var(--text-dim)" }}>
                Start a 3, 5, or 7-day Classroom with 2–8 friends. Each day, everyone learns and records a 90-second voice synthesis—and recording yours unlocks everyone else&apos;s take.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalMode("categories");
                    setShowCreateModal(true);
                  }}
                  className="btn-terra px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-transform active:scale-[0.98] cursor-pointer"
                >
                  Start a Classroom
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(true)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  Enter Invite Code
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeClassrooms.length > 0 && (
                <div className="space-y-3.5">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--olive)]">
                    Active Classrooms ({activeClassrooms.length})
                  </div>
                  {activeClassrooms.map((c) => {
                    const cleanCode = normalizeClassroomCode(c.code);
                    const subs = submissionsByCode[cleanCode] || [];
                    const unlockedSlot = computeEffectiveUnlockedSlot(c, subs);
                    const nextForMe = getNextActionableSlotForUser(
                      c,
                      subs,
                      profile.id,
                      profile.username
                    );
                    const currentSlotMeta =
                      nextForMe ||
                      c.slots.find((s) => s.slotNumber === unlockedSlot) ||
                      c.slots[0];
                    const slotSubsCount = subs.filter(
                      (s) => s.slotNumber === (currentSlotMeta?.slotNumber || 1)
                    ).length;

                    return (
                      <div
                        key={c.code}
                        className="rounded-2xl border-[1.5px] p-5 surface transition-all hover:border-[var(--olive)]"
                        style={{ borderColor: nextForMe ? "var(--olive)" : "var(--border)" }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-input)] text-[var(--olive)] border border-[var(--border-dim)]">
                                Topic {unlockedSlot} of {c.totalTopics}
                              </span>
                              <span className="font-mono text-[10px]" style={{ color: "var(--text-mute)" }}>
                                Code: {formatClassroomCodeDisplay(c.code)}
                              </span>
                            </div>
                            <h3 className="font-serif font-bold text-lg leading-snug" style={{ color: "var(--text)" }}>
                              {c.title}
                            </h3>
                          </div>

                          <div className="flex items-center -space-x-1.5 shrink-0">
                            {c.members.slice(0, 5).map((m) => (
                              <UserAvatar
                                key={m.userId}
                                avatar={m.avatar}
                                size="xs"
                                className="border-2 border-[var(--bg-card)]"
                              />
                            ))}
                            {c.members.length > 5 && (
                              <span className="w-6 h-6 rounded-full bg-[var(--bg-input)] border border-[var(--border)] text-[10px] font-mono flex items-center justify-center">
                                +{c.members.length - 5}
                              </span>
                            )}
                          </div>
                        </div>

                        {currentSlotMeta && (
                          <div
                            className="rounded-xl p-3.5 border mb-4"
                            style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)" }}
                          >
                            <div className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "var(--text-mute)" }}>
                              Current Prompt · {currentSlotMeta.category}
                            </div>
                            <p className="text-xs sm:text-sm font-medium leading-snug" style={{ color: "var(--text)" }}>
                              {currentSlotMeta.topicText}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                            {nextForMe
                              ? `Your turn on Topic ${nextForMe.slotNumber} · ${slotSubsCount}/${c.members.length} recorded`
                              : `Caught up · ${slotSubsCount}/${c.members.length} recorded on Topic ${unlockedSlot}`}
                          </span>

                          <Link
                            href={`/classroom/${c.code}`}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-mono font-bold transition-transform active:scale-[0.98]",
                              nextForMe
                                ? "btn-terra"
                                : "border border-[var(--olive)] text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white"
                            )}
                          >
                            {nextForMe ? `Record Topic ${nextForMe.slotNumber}` : "Open Classroom"}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {completedClassrooms.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: "var(--text-mute)" }}>
                    Completed Classrooms ({completedClassrooms.length})
                  </div>
                  {completedClassrooms.map((c) => (
                    <div
                      key={c.code}
                      className="rounded-2xl border p-4 surface flex items-center justify-between gap-3"
                      style={{ borderColor: "var(--border-dim)" }}
                    >
                      <div>
                        <h4 className="font-serif font-bold text-base" style={{ color: "var(--text)" }}>
                          {c.title}
                        </h4>
                        <div className="text-xs" style={{ color: "var(--text-mute)" }}>
                          {c.totalTopics} topics completed · {c.members.length} friends
                        </div>
                      </div>
                      <Link
                        href={`/classroom/${c.code}`}
                        className="px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold hover:border-[var(--olive)]"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        Replay Archive
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* ─── TAB 2: 7-DAY STUDY SCHEDULE ─── */}
      {activeTab === "schedule" && (
        <motion.div
          key="tab-schedule"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="space-y-4"
        >
          {/* Schedule Overview + Upgrade to Friend Classroom CTA */}
          <div
            className="rounded-2xl p-5 border-[1.5px] surface"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-[var(--olive)]" />
                  <h2 className="font-serif font-bold text-lg" style={{ color: "var(--text)" }}>
                    Your 7-Day Topic Queue
                  </h2>
                  <span className="tag tag-olive font-mono text-[11px] px-2 py-0.5">
                    {scheduledCount}/7 Planned
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed max-w-xl" style={{ color: "var(--text-dim)" }}>
                  Queue up to 7 days of personal study topics, or turn your planned lineup into a shared Classroom challenge with friends.
                </p>
              </div>

              {scheduledCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalMode("schedule");
                    setShowCreateModal(true);
                  }}
                  className="btn-terra px-4 py-2 rounded-xl text-xs font-mono font-bold transition-transform active:scale-[0.98] cursor-pointer shrink-0"
                >
                  Invite Friends to This Schedule
                </button>
              )}
            </div>
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
                            {topic.difficulty}
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
                          className="btn-terra px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap cursor-pointer"
                        >
                          Start Session
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
                        className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border border-[var(--olive)]/60 bg-[var(--bg-card)] hover:bg-[var(--olive)] hover:text-white text-[var(--olive)] flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
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
      )}

      {/* ─── TAB 3: RECORDINGS VAULT ─── */}
      {activeTab === "recordings" && (
        <motion.div
          key="tab-recordings"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="space-y-5"
        >
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Recordings", value: allVaultRecordings.length },
              {
                label: "Speaking Time",
                value: `${Math.round(
                  allVaultRecordings.reduce((acc, r) => acc + r.durationSec, 0) / 60
                )}m`,
              },
              {
                label: "Classroom Takes",
                value: allVaultRecordings.filter((r) => r.scope === "classroom").length,
              },
            ].map((s, idx) => (
              <div key={idx} className="surface rounded-xl p-4 border" style={{ borderColor: "var(--border-dim)" }}>
                <div className="text-xl font-mono font-bold mb-0.5" style={{ color: "var(--text)" }}>
                  {s.value}
                </div>
                <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Filter & Playback Speed Controls */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "solo", label: "Solo · Private" },
                  { id: "classroom", label: "Classroom" },
                ] as const
              ).map((f) => {
                const active = vaultFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setVaultFilter(f.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer",
                      active
                        ? "bg-[var(--olive)] text-white border-[var(--olive)]"
                        : "bg-[var(--bg-panel)] text-[var(--text-dim)] border-[var(--border-dim)] hover:border-[var(--olive)]"
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cyclePlaybackSpeed}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold hover:border-[var(--olive)] cursor-pointer"
                style={{ background: "var(--bg-panel)", borderColor: "var(--border)", color: "var(--text)" }}
                title="Playback Speed"
              >
                {playbackRate}x Speed
              </button>
              <select
                value={vaultSort}
                onChange={(e) => setVaultSort(e.target.value as VaultSort)}
                className="px-2.5 py-1.5 rounded-lg border text-xs font-medium"
                style={{ background: "var(--bg-panel)", borderColor: "var(--border)", color: "var(--text)" }}
              >
                <option value="recent">Most Recent</option>
                <option value="longest">Longest</option>
              </select>
            </div>
          </div>

          {/* Recordings List */}
          {filteredRecordings.length === 0 ? (
            <div
              className="rounded-2xl border p-8 text-center surface"
              style={{ borderColor: "var(--border-dim)" }}
            >
              <Mic size={24} className="mx-auto mb-3 text-[var(--text-mute)]" />
              <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
                No recordings in this view yet
              </p>
              <p className="text-xs mb-5" style={{ color: "var(--text-dim)" }}>
                Solo practice recordings stay private on your device; Classroom recordings are shared only with your invited circle.
              </p>
              <Link
                href="/"
                className="btn-terra inline-block px-4 py-2.5 rounded-xl text-xs font-mono font-bold"
              >
                Start a Solo Session
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredRecordings.map((rec) => {
                const catColor = CATEGORY_COLORS[rec.category] || "var(--terra)";
                const isPlaying = playingId === rec.id;

                return (
                  <div
                    key={rec.id}
                    className="surface rounded-2xl p-5 border"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span
                            className="tag text-[10px]"
                            style={{
                              background: `${catColor}18`,
                              color: catColor,
                              border: `1px solid ${catColor}30`,
                            }}
                          >
                            {rec.category}
                          </span>

                          {rec.scope === "solo" ? (
                            <span
                              className="tag text-[10px] flex items-center gap-1"
                              style={{ background: "var(--bg-input)", color: "var(--text-dim)" }}
                            >
                              <Lock size={9} />
                              <span>Solo · Private</span>
                            </span>
                          ) : rec.classroomCode ? (
                            <Link
                              href={`/classroom/${rec.classroomCode}`}
                              className="tag text-[10px] flex items-center gap-1 bg-[var(--olive)]/12 text-[var(--olive)] hover:underline"
                            >
                              <Users size={9} />
                              <span>
                                {rec.classroomTitle || "Classroom"}
                                {rec.slotNumber ? ` · Topic ${rec.slotNumber}` : ""}
                              </span>
                            </Link>
                          ) : (
                            <span
                              className="tag text-[10px]"
                              style={{ background: "var(--bg-input)", color: "var(--text-dim)" }}
                            >
                              {rec.classroomTitle || "Classroom"}
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-serif font-bold leading-snug" style={{ color: "var(--text)" }}>
                          {rec.topicText}
                        </p>
                      </div>
                    </div>

                    {/* Audio Player Bar */}
                    <div
                      className="rounded-xl px-4 py-2.5 flex items-center gap-3 mb-3"
                      style={{ background: "var(--bg-input)" }}
                    >
                      <button
                        type="button"
                        onClick={() => handlePlayVaultAudio(rec.id, rec.audioSrc)}
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer"
                        style={{ background: isPlaying ? "var(--red)" : "var(--terra)" }}
                        aria-label={isPlaying ? "Pause recording" : "Play recording"}
                      >
                        {isPlaying ? (
                          <span className="w-2.5 h-2.5 bg-white rounded-xs" />
                        ) : (
                          <Play size={11} color="white" />
                        )}
                      </button>

                      <div className="flex-1 flex items-center gap-0.5 h-5">
                        {Array.from({ length: 36 }).map((_, j) => (
                          <div
                            key={j}
                            className="w-0.5 rounded-full transition-colors"
                            style={{
                              height: `${24 + ((j * 13 + rec.durationSec) % 68)}%`,
                              background: isPlaying ? catColor : `${catColor}45`,
                            }}
                          />
                        ))}
                      </div>

                      <span className="text-[11px] font-mono shrink-0" style={{ color: "var(--text-mute)" }}>
                        {formatDuration(rec.durationSec)}
                      </span>
                    </div>

                    {/* Footer Meta */}
                    <div className="flex items-center justify-between text-[11px] flex-wrap gap-2" style={{ color: "var(--text-mute)" }}>
                      <div className="flex items-center gap-3">
                        <span>{timeAgo(rec.submittedAt)}</span>
                        {typeof rec.heardCount === "number" && rec.heardCount > 0 && (
                          <span className="flex items-center gap-1 text-[var(--olive)] font-medium">
                            <Headphones size={11} />
                            <span>Heard by {rec.heardCount}</span>
                          </span>
                        )}
                      </div>

                      {rec.notes && (
                        <button
                          type="button"
                          onClick={() =>
                            setNoteToShare({
                              topicId: rec.id,
                              topicText: rec.topicText,
                              category: rec.category,
                              difficulty: rec.difficulty || "Scholar",
                              notes: rec.notes || "",
                              author: profile.username || "Scholar",
                              date: rec.dateStr || todayIso,
                              speakingSeconds: rec.durationSec,
                              xpEarned: rec.xpEarned || 150,
                              tags: rec.tags || [],
                            })
                          }
                          className="px-2.5 py-1 text-[10px] font-mono font-semibold rounded-lg border border-[var(--border-dim)] hover:border-[var(--terra)] hover:text-[var(--terra)] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Share2 size={10} />
                          <span>Share Notes</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* 7-Day Schedule Topic Finder Modal */}
      <AnimatePresence>
        {planningForDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs"
            onClick={() => setPlanningForDate(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 6 }}
              transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl p-5 sm:p-6 border-[1.5px] shadow-2xl max-h-[85vh] flex flex-col"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
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
                              {t.difficulty}
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
                          <span>{isCurrentlyAssigned ? "Selected" : "Schedule Topic"}</span>
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

      {/* Modals */}
      <CreateClassroomModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        initialPresetTopics={scheduledQueueTopics}
        initialMode={createModalMode}
      />
      <JoinClassroomModal open={showJoinModal} onClose={() => setShowJoinModal(false)} />
      <ShareNoteModal
        isOpen={Boolean(noteToShare)}
        onClose={() => setNoteToShare(null)}
        note={noteToShare}
      />

      <audio
        ref={audioRef}
        className="hidden"
        onEnded={() => setPlayingId(null)}
        onPause={() => setPlayingId(null)}
      />
    </div>
  );
}
