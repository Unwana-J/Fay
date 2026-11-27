"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  Share2,
  Lock,
  Unlock,
  Play,
  Mic,
  Headphones,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  X,
  Clock,
  Plus,
  Archive,
  RotateCcw,
  Award,
  Bell,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { toXSafeUrl } from "@/lib/share-origin";
import ReminderOptInCard from "@/components/notifications/ReminderOptInCard";
import { useClassroomStore } from "@/store/useClassroomStore";
import {
  type ClassroomSlot,
  type ClassroomSubmission,
  APPRECIATION_TAGS,
  APPRECIATION_TAG_META,
  computeEffectiveUnlockedSlot,
  getSafetyValveRemainingMs,
  hasUserUnlockedSlotAudio,
  canSwapClassroomSlot,
  formatClassroomCodeDisplay,
  normalizeClassroomCode,
  isSameClassroomScholar,
  getClassroomCompletionSummary,
} from "@/lib/classroom-types";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  TOPIC_BANK,
  type Topic,
  type Difficulty,
} from "@/lib/topics";
import { copyTextToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";
import UserAvatar from "@/components/ui/UserAvatar";

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

function formatCountdownHours(ms: number): string {
  const totalMins = Math.max(1, Math.ceil(ms / 60000));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function formatCollectiveDuration(totalSec: number): string {
  const safe = Math.max(0, Math.round(totalSec));
  if (safe < 60) return `${safe}s`;
  const mins = Math.floor(safe / 60);
  const rem = safe % 60;
  if (rem === 0) return `${mins}m`;
  return `${mins}m ${rem}s`;
}

export default function ClassroomDetailClient({ code }: { code: string }) {
  const router = useRouter();
  const cleanCode = normalizeClassroomCode(code);

  const {
    profile,
    settings,
    sessions,
    customTopics,
    updateProfile,
    startSession,
  } = useAppStore();

  const {
    classrooms,
    submissionsByCode,
    pushEnabledByCode,
    nudgedAtByKey,
    fetchClassroom,
    joinClassroom,
    swapSlotTopic,
    unlockNextSlotEarly,
    setClassroomStatus,
    extendClassroom,
    submitRecording,
    markHeard,
    toggleAppreciation,
    addMarginNote,
    nudgeMember,
  } = useClassroomStore();

  const classroom = useMemo(
    () => classrooms.find((c) => normalizeClassroomCode(c.code) === cleanCode) || null,
    [classrooms, cleanCode]
  );
  const submissions = useMemo(
    () => submissionsByCode[cleanCode] || [],
    [submissionsByCode, cleanCode]
  );

  const [initialLoading, setInitialLoading] = useState(!classroom);
  const [notFound, setNotFound] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [didAutoSelectSlot, setDidAutoSelectSlot] = useState(false);

  // Invite & Join UI state
  const [copiedKind, setCopiedKind] = useState<"link" | "code" | null>(null);
  const [joinNameInput, setJoinNameInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Audio playback state
  const [playingSubId, setPlayingSubId] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.25 | 1.5>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Margin note inputs per submission
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [openNotesForSub, setOpenNotesForSub] = useState<Record<string, boolean>>({});

  // Swap slot modal state
  const [swappingSlotNum, setSwappingSlotNum] = useState<number | null>(null);
  const [swapMode, setSwapMode] = useState<"bank" | "custom">("bank");
  const [swapSearch, setSwapSearch] = useState("");
  const [swapCategory, setSwapCategory] = useState<string>("all");
  const [swapCustomText, setSwapCustomText] = useState("");
  const [swapCustomCategory, setSwapCustomCategory] = useState<string>("Technology");
  const [swapSaving, setSwapSaving] = useState(false);
  const [unlockingNext, setUnlockingNext] = useState(false);

  // Close / Reopen & Extend Syllabus UI state
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendMode, setExtendMode] = useState<"categories" | "custom">("categories");
  const [extendCount, setExtendCount] = useState<1 | 3 | 5 | 7>(3);
  const [extendCategories, setExtendCategories] = useState<string[]>([]);
  const [extendCustomText, setExtendCustomText] = useState("");
  const [extendCustomCategory, setExtendCustomCategory] = useState("Technology");
  const [extendingSaving, setExtendingSaving] = useState(false);
  const [extendError, setExtendError] = useState<string | null>(null);
  const didAutoOpenExtendRef = useRef(false);
  const [nudgingUserId, setNudgingUserId] = useState<string | null>(null);
  const [nudgeNoticeByUser, setNudgeNoticeByUser] = useState<Record<string, string>>({});
  const [publishingSavedTake, setPublishingSavedTake] = useState(false);
  const [publishSavedError, setPublishSavedError] = useState<string | null>(null);

  // Initial load + gentle 12s sync while visible
  useEffect(() => {
    let active = true;
    fetchClassroom(cleanCode).then((res) => {
      if (!active) return;
      setInitialLoading(false);
      if (!res) setNotFound(true);
    });

    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchClassroom(cleanCode);
      }
    }, 12000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [cleanCode, fetchClassroom]);

  // Auto-focus current unlocked slot on first hydration
  useEffect(() => {
    if (classroom && !didAutoSelectSlot) {
      const unlocked = computeEffectiveUnlockedSlot(classroom, submissions);
      // Pick earliest unlocked slot the user hasn't recorded yet, else latest unlocked
      let target = unlocked;
      for (let n = 1; n <= unlocked; n++) {
        if (!hasUserUnlockedSlotAudio(n, profile.id, profile.username, submissions)) {
          target = n;
          break;
        }
      }
      setSelectedSlot(target);
      setDidAutoSelectSlot(true);
    }
  }, [classroom, submissions, didAutoSelectSlot, profile.id, profile.username]);

  const isMember = useMemo(() => {
    if (!classroom) return false;
    const norm = profile.username?.trim().toLowerCase();
    return classroom.members.some(
      (m) =>
        m.userId === profile.id ||
        (norm && norm !== "scholar" && m.username?.trim().toLowerCase() === norm)
    );
  }, [classroom, profile.id, profile.username]);

  const isHost = Boolean(classroom && classroom.hostId === profile.id);
  const unlockedUpTo = classroom ? computeEffectiveUnlockedSlot(classroom, submissions) : 1;
  const currentSlotObj: ClassroomSlot | undefined = classroom?.slots.find(
    (s) => s.slotNumber === selectedSlot
  );
  const isSlotUnlocked = selectedSlot <= unlockedUpTo;

  const slotSubmissions = useMemo(
    () =>
      submissions
        .filter((s) => s.slotNumber === selectedSlot)
        .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()),
    [submissions, selectedSlot]
  );

  const hasRecordedCurrentSlot = useMemo(
    () => hasUserUnlockedSlotAudio(selectedSlot, profile.id, profile.username, submissions),
    [selectedSlot, profile.id, profile.username, submissions]
  );

  const safetyValveRemaining = useMemo(
    () =>
      classroom ? getSafetyValveRemainingMs(selectedSlot, classroom, submissions) : null,
    [classroom, selectedSlot, submissions]
  );

  const completionSummary = useMemo(
    () => (classroom ? getClassroomCompletionSummary(classroom, submissions) : null),
    [classroom, submissions]
  );

  const pushEnabledSet = useMemo(
    () => new Set(pushEnabledByCode[cleanCode] || []),
    [pushEnabledByCode, cleanCode]
  );

  // Detect if the user already has a matching local recording in their Library for this slot
  // (e.g. if a Classroom session lost its URL query or had a transient network error)
  const matchingLocalSession = useMemo(() => {
    if (!currentSlotObj || !isSlotUnlocked || hasRecordedCurrentSlot) return null;
    const targetText = currentSlotObj.topicText.trim().toLowerCase();
    return (
      sessions.find(
        (s) =>
          Boolean(s.audioBase64) &&
          s.speakingSeconds > 0 &&
          (s.topicId === currentSlotObj.topicId ||
            s.topicText.trim().toLowerCase() === targetText)
      ) || null
    );
  }, [currentSlotObj, isSlotUnlocked, hasRecordedCurrentSlot, sessions]);

  // Support deep-linking directly into Extend Modal via `?extend=1`
  useEffect(() => {
    if (!classroom || !isMember || didAutoOpenExtendRef.current) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("extend") === "1") {
      didAutoOpenExtendRef.current = true;
      setExtendError(null);
      setExtendMode("categories");
      setExtendCount(3);
      setExtendCategories(
        classroom.categories?.length > 0
          ? classroom.categories.slice(0, 6)
          : ["Technology", "Philosophy"]
      );
      setExtendCustomCategory(classroom.categories?.[0] || "Technology");
      setShowExtendModal(true);
    }
  }, [classroom, isMember]);

  // Swap bank candidates
  const swapCandidates = useMemo(() => {
    if (!classroom) return [];
    const usedIds = new Set(classroom.slots.map((s) => s.topicId));
    const pool = [...TOPIC_BANK, ...(customTopics || [])];
    const preferredCats =
      settings.favoriteCategories?.length > 0
        ? settings.favoriteCategories
        : classroom.categories;
    const query = swapSearch.trim().toLowerCase();

    const filtered = pool.filter((t) => {
      if (usedIds.has(t.id)) return false;
      if (swapCategory === "all") {
        // When browsing without a query, prioritize Suggested categories;
        // when actively searching, search across the entire Topic Bank.
        if (!query && preferredCats.length > 0 && !preferredCats.includes(t.category)) {
          return false;
        }
      } else if (t.category !== swapCategory) {
        return false;
      }
      if (query) {
        return (
          t.text.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          (t.tags || []).some((tg) => tg.toLowerCase().includes(query))
        );
      }
      return true;
    });

    if (query && swapCategory === "all" && preferredCats.length > 0) {
      return filtered.sort((a, b) => {
        const aPref = preferredCats.includes(a.category) ? 0 : 1;
        const bPref = preferredCats.includes(b.category) ? 0 : 1;
        return aPref - bPref;
      });
    }
    return filtered;
  }, [classroom, customTopics, settings.favoriteCategories, swapCategory, swapSearch]);

  function getInviteUrl() {
    if (typeof window === "undefined") {
      return `https://fey.lokinlabs.com.ng/classroom/${cleanCode}`;
    }
    return `${window.location.origin}/classroom/${cleanCode}`;
  }

  async function handleCopyInviteLink() {
    await copyTextToClipboard(getInviteUrl());
    setCopiedKind("link");
    setTimeout(() => setCopiedKind(null), 2000);
  }

  async function handleCopyCode() {
    await copyTextToClipboard(formatClassroomCodeDisplay(cleanCode));
    setCopiedKind("code");
    setTimeout(() => setCopiedKind(null), 2000);
  }

  function handleWhatsAppInvite() {
    if (!classroom) return;
    const url = getInviteUrl();
    const slot1Recorded = submissions.some((s) => s.slotNumber === 1);
    const firstTopic = classroom.slots[0]?.topicText || "";
    const msg = slot1Recorded
      ? `I started a ${classroom.totalTopics}-topic Fey Classroom ("${classroom.title}") and already recorded Topic 1: "${firstTopic}". Record your ${classroom.speakingDurationSec}s take to unlock & hear mine: ${url}`
      : `Join my ${classroom.totalTopics}-topic Fey Classroom ("${classroom.title}") — we learn and record a ${classroom.speakingDurationSec}s take on each topic together: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  }

  function handleXInvite() {
    if (!classroom) return;
    const xUrl = toXSafeUrl(getInviteUrl());
    const slot1Recorded = submissions.some((s) => s.slotNumber === 1);
    const firstTopic = classroom.slots[0]?.topicText || "";
    const msg = slot1Recorded
      ? `I started a ${classroom.totalTopics}-topic Fey Classroom ("${classroom.title}") and already recorded Topic 1: "${firstTopic}". Record your ${classroom.speakingDurationSec}s take to unlock and hear mine:`
      : `Join my ${classroom.totalTopics}-topic Fey Classroom ("${classroom.title}") — learn and record a ${classroom.speakingDurationSec}s take on each topic together:`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(xUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function handleJoinCircle(e: React.FormEvent) {
    e.preventDefault();
    if (!classroom) return;
    setJoinError(null);

    const needsCustomName = !profile.username || profile.username === "Scholar";
    const chosenName = needsCustomName ? joinNameInput.trim() : profile.username;
    if (!chosenName) {
      setJoinError("Enter your name so your friends recognize your voice.");
      return;
    }

    if (needsCustomName && chosenName !== profile.username) {
      updateProfile({ username: chosenName });
    }

    setJoining(true);
    const res = await joinClassroom(cleanCode, {
      userId: profile.id || "local-scholar",
      username: chosenName,
      avatar: profile.avatar || "/avatars/avatar-scholar.svg",
      favoriteCategories:
        settings.favoriteCategories?.length > 0
          ? settings.favoriteCategories
          : settings.enabledCategories || [],
    });
    setJoining(false);

    if (res.error) {
      setJoinError(res.error);
    }
  }

  function launchSlotSession(slot: ClassroomSlot, initialStage: "research" | "speaking") {
    if (!classroom) return;
    const topicObj: Topic = {
      id: slot.topicId,
      text: slot.topicText,
      category: slot.category,
      difficulty: slot.difficulty || classroom.difficulty,
      tags: slot.tags || [],
    };
    const sessionId = startSession(
      topicObj,
      classroom.researchDurationMin || settings.researchMin || 10,
      initialStage,
      classroom.speakingDurationSec || 90,
      undefined,
      { code: cleanCode, slot: slot.slotNumber }
    );
    router.push(
      `/session/${sessionId}?classroom=${encodeURIComponent(cleanCode)}&slot=${slot.slotNumber}`
    );
  }

  function cycleSpeed() {
    const next: 1 | 1.25 | 1.5 = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
    setPlaybackRate(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  }

  function handlePlaySubmission(sub: ClassroomSubmission) {
    if (!sub.audioUrl || !audioRef.current) return;
    if (playingSubId === sub.id) {
      audioRef.current.pause();
      setPlayingSubId(null);
      return;
    }
    setPlayingSubId(sub.id);
    audioRef.current.src = sub.audioUrl;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => setPlayingSubId(null));

    // Register "Heard by" receipt if playing a friend's recording
    if (sub.userId !== profile.id) {
      markHeard(cleanCode, sub.id, {
        userId: profile.id,
        username: profile.username || "Scholar",
        avatar: profile.avatar || "/avatars/avatar-scholar.svg",
      });
    }
  }

  async function handleSwapPick(newTopic: Topic) {
    if (!swappingSlotNum) return;
    setSwapSaving(true);
    const res = await swapSlotTopic({
      code: cleanCode,
      slotNumber: swappingSlotNum,
      topic: newTopic,
      userId: profile.id,
      username: profile.username || "Member",
    });
    setSwapSaving(false);
    if (res.ok) {
      setSwappingSlotNum(null);
      setSwapCustomText("");
    }
  }

  async function handleUnlockNextEarly() {
    if (!classroom || !isHost) return;
    setUnlockingNext(true);
    const prevUnlocked = unlockedUpTo;
    const res = await unlockNextSlotEarly(cleanCode, profile.id);
    setUnlockingNext(false);
    if (res.ok && prevUnlocked < classroom.totalTopics) {
      setSelectedSlot(prevUnlocked + 1);
    }
  }

  function openExtendModal(
    initialMode: "categories" | "custom" = "categories",
    initialCount: 1 | 3 | 5 | 7 = 3
  ) {
    if (!classroom) return;
    setExtendError(null);
    setExtendMode(initialMode);
    setExtendCount(initialCount);
    setExtendCategories(
      classroom.categories?.length > 0
        ? classroom.categories.slice(0, 6)
        : ["Technology", "Philosophy"]
    );
    setExtendCustomCategory(classroom.categories?.[0] || "Technology");
    setShowExtendModal(true);
  }

  function toggleExtendCategory(cat: string) {
    setExtendCategories((prev) => {
      if (prev.includes(cat)) {
        return prev.length > 1 ? prev.filter((c) => c !== cat) : prev;
      }
      if (prev.length >= 6) return prev;
      return [...prev, cat];
    });
  }

  async function handleToggleClassroomStatus(nextStatus: "active" | "completed") {
    if (!classroom || !isHost) return;
    setTogglingStatus(true);
    await setClassroomStatus(cleanCode, profile.id, nextStatus);
    setTogglingStatus(false);
    setConfirmingClose(false);
  }

  async function handleExtendSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classroom) return;
    setExtendError(null);

    if (extendMode === "custom" && !extendCustomText.trim()) {
      setExtendError("Enter a topic prompt, or switch to Shared Interests.");
      return;
    }

    setExtendingSaving(true);
    const presetTopics: Topic[] =
      extendMode === "custom"
        ? [
            {
              id: `custom-ext-${Date.now()}`,
              text: extendCustomText.trim(),
              category: extendCustomCategory,
              difficulty: (classroom.difficulty as Difficulty) || "Novice",
              tags: ["custom", "classroom"],
            },
          ]
        : [];

    const res = await extendClassroom({
      code: cleanCode,
      actorId: profile.id || "local-scholar",
      actorName: profile.username || "Scholar",
      addCount: extendMode === "custom" ? 1 : extendCount,
      categories: extendCategories,
      difficulty: (classroom.difficulty as Difficulty) || "Novice",
      presetTopics,
      customTopicPool: customTopics || [],
    });
    setExtendingSaving(false);

    if (!res.ok) {
      setExtendError(res.error || "Could not add topics right now.");
      return;
    }

    setExtendCustomText("");
    setShowExtendModal(false);
    if (res.firstNewSlot) {
      setSelectedSlot(res.firstNewSlot);
    }
  }

  if (initialLoading && !classroom) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="text-xs font-mono uppercase tracking-widest text-[var(--olive)] mb-2">
          Loading Classroom...
        </div>
      </div>
    );
  }

  if (notFound || !classroom) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div
          className="rounded-2xl border-[1.5px] p-8 surface"
          style={{ borderColor: "var(--border)" }}
        >
          <h1 className="font-serif font-bold text-2xl mb-2" style={{ color: "var(--text)" }}>
            Classroom Not Found
          </h1>
          <p className="text-xs sm:text-sm mb-6" style={{ color: "var(--text-dim)" }}>
            We couldn&apos;t find a Classroom matching code{" "}
            <span className="font-mono font-bold">{formatClassroomCodeDisplay(cleanCode)}</span>.
          </p>
          <Link
            href="/classroom"
            className="btn-terra inline-block px-5 py-2.5 rounded-xl text-xs font-mono font-bold"
          >
            Back to Classrooms
          </Link>
        </div>
      </div>
    );
  }

  const catColor = currentSlotObj
    ? CATEGORY_COLORS[currentSlotObj.category] || "var(--olive)"
    : "var(--olive)";

  async function handlePublishSavedTake() {
    if (!classroom || !currentSlotObj || !matchingLocalSession) return;
    setPublishingSavedTake(true);
    setPublishSavedError(null);
    const res = await submitRecording({
      classroomCode: cleanCode,
      slotNumber: currentSlotObj.slotNumber,
      userId: profile.id || "local-scholar",
      username: profile.username || "Scholar",
      avatar: profile.avatar || "/avatars/avatar-scholar.svg",
      topicId: currentSlotObj.topicId,
      topicText: currentSlotObj.topicText,
      category: currentSlotObj.category,
      durationSeconds: matchingLocalSession.speakingSeconds,
      audioData: matchingLocalSession.audioBase64,
      notes: matchingLocalSession.notes,
    });
    setPublishingSavedTake(false);
    if (res.error) {
      setPublishSavedError(res.error);
    }
  }

  async function handleNudgeMember(targetUserId: string) {
    if (!classroom || !isMember) return;
    setNudgingUserId(targetUserId);
    const res = await nudgeMember({
      code: cleanCode,
      actorId: profile.id || "local-scholar",
      actorName: profile.username || "Your friend",
      targetUserId,
      slotNumber: selectedSlot,
    });
    setNudgingUserId(null);
    if (res.message) {
      setNudgeNoticeByUser((prev) => ({ ...prev, [targetUserId]: res.message! }));
    }
  }

  const unrecordedMembersOnSlot = classroom.members.filter(
    (m) =>
      !slotSubmissions.some((s) =>
        isSameClassroomScholar(s.userId, s.username, m.userId, m.username)
      )
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Breadcrumb & Host Lifecycle Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <Link
          href="/classroom"
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:text-[var(--text)] transition-colors"
          style={{ color: "var(--text-dim)" }}
        >
          <ArrowLeft size={14} />
          <span>All Classrooms</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          {isHost && classroom.status === "active" && (
            confirmingClose ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={togglingStatus}
                  onClick={() => handleToggleClassroomStatus("completed")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold text-white cursor-pointer"
                  style={{ background: "var(--red)" }}
                >
                  {togglingStatus ? "Closing..." : "Confirm Close"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingClose(false)}
                  className="px-2 py-1 rounded-lg border text-[11px] font-mono cursor-pointer"
                  style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingClose(true)}
                className="px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold flex items-center gap-1 hover:border-[var(--red)] hover:text-[var(--red)] transition-colors cursor-pointer"
                style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)", color: "var(--text-mute)" }}
                title="Archive this Classroom into Completed Classrooms"
              >
                <Archive size={11} />
                <span>Close Classroom</span>
              </button>
            )
          )}

          <button
            type="button"
            onClick={handleCopyCode}
            className="px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1.5 hover:border-[var(--olive)] transition-colors cursor-pointer"
            style={{ background: "var(--bg-panel)", borderColor: "var(--border)", color: "var(--text)" }}
          >
            <span>{formatClassroomCodeDisplay(classroom.code)}</span>
            {copiedKind === "code" ? <Check size={11} className="text-[var(--olive)]" /> : <Copy size={11} />}
          </button>
        </div>
      </div>

      {/* Full-Circle Celebration Card (All Participants Completed the Final Topic) */}
      {completionSummary?.allMembersFinishedFinalTopic && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="rounded-2xl border-[1.5px] p-5 sm:p-6 mb-6 relative overflow-hidden"
          style={{
            borderColor: "var(--gold)",
            background:
              "linear-gradient(180deg, rgba(166, 124, 30, 0.09) 0%, var(--bg-card) 52%)",
          }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div>
              <div
                className="text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5"
                style={{ color: "var(--gold)" }}
              >
                <Award size={13} />
                <span>
                  {completionSummary.allMembersCompletedEverySlot
                    ? `Full Sweep · ${completionSummary.totalTopics}/${completionSummary.totalTopics} Topics`
                    : `Circle Complete · ${completionSummary.totalTopics}/${completionSummary.totalTopics} Topics`}
                </span>
              </div>
              <h2
                className="font-serif font-bold text-xl sm:text-2xl leading-snug mb-1"
                style={{ color: "var(--text)" }}
              >
                {completionSummary.allMembersCompletedEverySlot
                  ? "Every voice, every topic — well done."
                  : `All ${completionSummary.totalTopics} topics completed together.`}
              </h2>
              <p className="text-xs sm:text-sm max-w-xl leading-relaxed" style={{ color: "var(--text-dim)" }}>
                All {completionSummary.memberCount} of you stepped up and put these ideas into your own words. Every recording stays playable below whenever you want to revisit.
              </p>
            </div>

            {/* Circle Avatars Cluster */}
            <div className="flex items-center -space-x-2 shrink-0 pt-1">
              {classroom.members.slice(0, 6).map((m) => (
                <div
                  key={m.userId}
                  className="rounded-full p-0.5"
                  style={{ background: "var(--gold)" }}
                  title={m.username}
                >
                  <UserAvatar
                    avatar={m.avatar}
                    size="sm"
                    className="border-2 border-[var(--bg-card)]"
                  />
                </div>
              ))}
              {classroom.members.length > 6 && (
                <span
                  className="w-8 h-8 rounded-full border-2 border-[var(--bg-card)] text-[10px] font-mono font-bold flex items-center justify-center"
                  style={{ background: "var(--bg-input)", color: "var(--text)" }}
                >
                  +{classroom.members.length - 6}
                </span>
              )}
            </div>
          </div>

          {/* Collective Recap Metrics */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold"
              style={{
                background: "var(--bg-panel)",
                borderColor: "var(--border-dim)",
                color: "var(--text)",
              }}
            >
              <Mic size={11} style={{ color: "var(--gold)" }} />
              <span>
                {completionSummary.totalTakes} take{completionSummary.totalTakes === 1 ? "" : "s"} recorded
              </span>
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold"
              style={{
                background: "var(--bg-panel)",
                borderColor: "var(--border-dim)",
                color: "var(--text)",
              }}
            >
              <Clock size={11} style={{ color: "var(--gold)" }} />
              <span>{formatCollectiveDuration(completionSummary.totalDurationSeconds)} articulated</span>
            </span>
            {completionSummary.totalInteractions > 0 ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold"
                style={{
                  background: "var(--bg-panel)",
                  borderColor: "var(--border-dim)",
                  color: "var(--text)",
                }}
              >
                <MessageSquare size={11} style={{ color: "var(--gold)" }} />
                <span>
                  {completionSummary.totalInteractions} note{completionSummary.totalInteractions === 1 ? "" : "s"} &amp; stamp{completionSummary.totalInteractions === 1 ? "" : "s"}
                </span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold"
                style={{
                  background: "var(--bg-panel)",
                  borderColor: "var(--border-dim)",
                  color: "var(--text)",
                }}
              >
                <Check size={11} style={{ color: "var(--olive)" }} />
                <span>
                  {completionSummary.totalTopics}/{completionSummary.totalTopics} topics completed
                </span>
              </span>
            )}
          </div>

          {/* Subtle Extend Nudge */}
          {isMember && (
            <div
              className="pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{ borderColor: "var(--border-dim)" }}
            >
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                Momentum like this is rare. Keep this circle going with a fresh round — same code, same friends, zero repeats.
              </p>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => openExtendModal("custom", 1)}
                  className="px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold hover:border-[var(--olive)] transition-colors cursor-pointer"
                  style={{
                    background: "var(--bg-panel)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                >
                  Custom Topic
                </button>
                <button
                  type="button"
                  onClick={() => openExtendModal("categories", 3)}
                  className="btn-terra px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add 3 Topics</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Manually Closed / Archived Classroom Banner (only when closed before everyone finished) */}
      {classroom.status === "completed" && !completionSummary?.allMembersFinishedFinalTopic && (
        <div
          className="rounded-2xl border-[1.5px] p-4 sm:p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 surface"
          style={{ borderColor: "var(--olive)" }}
        >
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--olive)] mb-0.5 flex items-center gap-1.5">
              <Archive size={12} />
              <span>Classroom Closed &amp; Archived</span>
            </div>
            <p className="text-xs sm:text-sm" style={{ color: "var(--text-dim)" }}>
              All recorded speeches remain playable below. Add new topics anytime to continue with the same circle.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {isHost && (
              <button
                type="button"
                disabled={togglingStatus}
                onClick={() => handleToggleClassroomStatus("active")}
                className="px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 hover:border-[var(--olive)] cursor-pointer"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                <RotateCcw size={12} />
                <span>{togglingStatus ? "Reopening..." : "Reopen"}</span>
              </button>
            )}
            {isMember && (
              <button
                type="button"
                onClick={() => openExtendModal("categories", 3)}
                className="btn-terra px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add More Topics</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Classroom Header & Invite Strip */}
      <div
        className="rounded-2xl border-[1.5px] p-5 sm:p-6 mb-6 surface"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--olive)] mb-1">
              {classroom.totalTopics}-Topic Classroom · {classroom.speakingDurationSec}s Speaking Time
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl leading-tight" style={{ color: "var(--text)" }}>
              {classroom.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 hover:bg-[var(--bg-input)] active:scale-[0.98] transition-all cursor-pointer"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              {copiedKind === "link" ? <Check size={13} className="text-[var(--olive)]" /> : <Copy size={13} />}
              <span>{copiedKind === "link" ? "Link Copied" : "Copy Link"}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppInvite}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[var(--olive)] text-white flex items-center gap-1.5 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <Share2 size={13} />
              <span>Invite on WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleXInvite}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-[#14171A] text-white flex items-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Share on X</span>
            </button>
          </div>
        </div>

        {/* Members Strip */}
        <div
          className="pt-3.5 border-t flex items-center justify-between gap-3 flex-wrap"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {classroom.members.map((m) => {
              const recordedThisSlot = slotSubmissions.some((s) =>
                isSameClassroomScholar(s.userId, s.username, m.userId, m.username)
              );
              return (
                <div
                  key={m.userId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs"
                  style={{
                    background: recordedThisSlot ? "rgba(68, 78, 44, 0.09)" : "var(--bg-input)",
                    borderColor: recordedThisSlot ? "var(--olive)" : "var(--border-dim)",
                    color: "var(--text)",
                  }}
                >
                  <UserAvatar avatar={m.avatar} size="xs" />
                  <span className="font-medium text-[11px]">{m.username}</span>
                  {recordedThisSlot && <Check size={11} className="text-[var(--olive)]" />}
                </div>
              );
            })}
          </div>
          <span className="text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>
            {classroom.members.length}/{classroom.maxMembers || 8} Friends
          </span>
        </div>
      </div>

      {/* Join Classroom Banner for Non-Members Opening Invite Link */}
      {!isMember && (
        <form
          onSubmit={handleJoinCircle}
          className="rounded-2xl border-[1.5px] p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ background: "var(--bg-card)", borderColor: "var(--terra)" }}
        >
          <div className="flex-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--terra)] mb-1">
              You&apos;re Invited by {classroom.hostName}
            </div>
            <p className="text-xs sm:text-sm font-medium" style={{ color: "var(--text)" }}>
              Join this Classroom circle so you can record your {classroom.speakingDurationSec}s takes and unlock your friends&apos; recordings.
            </p>
            {(!profile.username || profile.username === "Scholar") && (
              <input
                type="text"
                value={joinNameInput}
                onChange={(e) => setJoinNameInput(e.target.value)}
                placeholder="Your first name (e.g. Tunde)"
                maxLength={40}
                className="mt-2.5 w-full sm:w-64 px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:border-[var(--olive)]"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />
            )}
            {joinError && (
              <div className="text-xs mt-1.5" style={{ color: "var(--red)" }}>
                {joinError}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={joining}
            className="btn-terra px-5 py-2.5 rounded-xl text-xs font-mono font-bold shrink-0 cursor-pointer"
          >
            {joining ? "Joining..." : "Join Classroom"}
          </button>
        </form>
      )}

      {/* Syllabus Slot Selector (Topic 1..N) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--olive)]">
            Classroom Syllabus
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-mute)" }}>
            Unlocked up to Topic {unlockedUpTo} of {classroom.totalTopics}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
          {classroom.slots.map((slot) => {
            const unlocked = slot.slotNumber <= unlockedUpTo;
            const active = selectedSlot === slot.slotNumber;
            const myDone = hasUserUnlockedSlotAudio(
              slot.slotNumber,
              profile.id,
              profile.username,
              submissions
            );
            const countOnSlot = submissions.filter((s) => s.slotNumber === slot.slotNumber).length;

            return (
              <button
                key={slot.slotNumber}
                type="button"
                onClick={() => setSelectedSlot(slot.slotNumber)}
                className={cn(
                  "px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer active:scale-[0.98]",
                  active
                    ? "bg-[var(--olive)] text-white border-[var(--olive)] font-bold"
                    : unlocked
                    ? "bg-[var(--bg-card)] text-[var(--text)] border-[var(--border)] hover:border-[var(--olive)]"
                    : "bg-[var(--bg-panel)] text-[var(--text-mute)] border-[var(--border-dim)] opacity-80"
                )}
              >
                {myDone ? (
                  <Check size={12} className={active ? "text-white" : "text-[var(--olive)]"} />
                ) : unlocked ? (
                  <Unlock size={11} className="opacity-75" />
                ) : (
                  <Lock size={11} className="opacity-65" />
                )}
                <span>Topic {slot.slotNumber}</span>
                {countOnSlot > 0 && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-md",
                      active ? "bg-white/20 text-white" : "bg-[var(--bg-input)] text-[var(--text-mute)]"
                    )}
                  >
                    {countOnSlot}/{classroom.members.length}
                  </span>
                )}
              </button>
            );
          })}

          {isMember && (
            <button
              type="button"
              onClick={() => openExtendModal("categories", 3)}
              className="px-3.5 py-2 rounded-xl border border-dashed text-xs font-mono font-bold flex items-center gap-1 whitespace-nowrap transition-colors hover:border-[var(--olive)] hover:text-[var(--olive)] cursor-pointer shrink-0"
              style={{ borderColor: "var(--border)", color: "var(--text-dim)", background: "var(--bg-panel)" }}
            >
              <Plus size={12} />
              <span>Add Topics</span>
            </button>
          )}
        </div>
      </div>

      {/* Individual Final-Topic Done Note (waiting on remaining friends before full-circle completion) */}
      {isMember &&
        classroom.status === "active" &&
        !completionSummary?.allMembersFinishedFinalTopic &&
        unlockedUpTo >= classroom.totalTopics &&
        hasUserUnlockedSlotAudio(classroom.totalTopics, profile.id, profile.username, submissions) && (
          <div
            className="rounded-2xl border p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ background: "rgba(68, 78, 44, 0.07)", borderColor: "var(--olive)" }}
          >
            <div>
              <div className="text-xs font-serif font-bold" style={{ color: "var(--text)" }}>
                You finished all {classroom.totalTopics}/{classroom.totalTopics} topics
              </div>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                {completionSummary && completionSummary.pendingFinalSlotMembers.length > 0
                  ? `Waiting on ${completionSummary.pendingFinalSlotMembers
                      .map((m) => m.username)
                      .join(", ")} to wrap up Topic ${classroom.totalTopics}. You can line up the next round anytime.`
                  : "Invite friends to unlock their takes, or add more topics to keep this Classroom going."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openExtendModal("categories", 3)}
              className="px-3.5 py-2 rounded-xl border border-[var(--olive)] text-xs font-mono font-bold text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add More Topics</span>
            </button>
          </div>
        )}

      {/* Selected Topic Card */}
      {currentSlotObj && (
        <div
          className="rounded-2xl border-[1.5px] p-5 sm:p-6 mb-6 surface"
          style={{ borderColor: isSlotUnlocked ? "var(--olive)" : "var(--border)" }}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-input)] text-[var(--olive)]">
                Topic {currentSlotObj.slotNumber} of {classroom.totalTopics}
              </span>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                style={{
                  backgroundColor: `${catColor}15`,
                  color: catColor,
                  border: `1px solid ${catColor}30`,
                }}
              >
                {currentSlotObj.category}
              </span>
              {currentSlotObj.swappedBy && (
                <span className="text-[10px] font-mono text-[var(--text-mute)]">
                  Picked by {currentSlotObj.swappedBy.username}
                </span>
              )}
            </div>

            {/* Swap Unstarted Topic Button */}
            {isMember && canSwapClassroomSlot(currentSlotObj.slotNumber, submissions) && (
              <button
                type="button"
                onClick={() => {
                  setSwapSearch("");
                  setSwapCategory("all");
                  setSwapMode("bank");
                  setSwappingSlotNum(currentSlotObj.slotNumber);
                }}
                className="px-2.5 py-1 rounded-lg border text-[11px] font-mono font-semibold flex items-center gap-1 hover:border-[var(--olive)] transition-colors cursor-pointer"
                style={{ background: "var(--bg-panel)", borderColor: "var(--border)", color: "var(--text-dim)" }}
              >
                <RefreshCw size={11} />
                <span>Swap Topic</span>
              </button>
            )}
          </div>

          <h2 className="font-serif font-bold text-lg sm:text-xl leading-snug mb-5" style={{ color: "var(--text)" }}>
            {currentSlotObj.topicText}
          </h2>

          {/* Action State on Selected Slot */}
          {!isSlotUnlocked ? (
            <div
              className="rounded-xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)" }}
            >
              <div className="flex items-center gap-2.5">
                <Lock size={16} className="text-[var(--text-mute)] shrink-0" />
                <p className="text-xs sm:text-sm" style={{ color: "var(--text-dim)" }}>
                  Unlocks automatically as soon as everyone submits Topic {selectedSlot - 1} (or via the 24-hour safety timer). You can still swap this topic before anyone starts.
                </p>
              </div>
              {isHost && selectedSlot === unlockedUpTo + 1 && (
                <button
                  type="button"
                  disabled={unlockingNext}
                  onClick={handleUnlockNextEarly}
                  className="px-3.5 py-2 rounded-xl border border-[var(--olive)] text-xs font-mono font-bold text-[var(--olive)] hover:bg-[var(--olive)] hover:text-white shrink-0 transition-colors cursor-pointer"
                >
                  {unlockingNext ? "Unlocking..." : "Unlock Early"}
                </button>
              )}
            </div>
          ) : !hasRecordedCurrentSlot ? (
            <div
              className="rounded-xl p-4 sm:p-5 border"
              style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold mb-0.5" style={{ color: "var(--text)" }}>
                    Speak to Unlock Circle Audio
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                    Read the research brief or jump straight into an impromptu {classroom.speakingDurationSec}s voice take.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => launchSlotSession(currentSlotObj, "speaking")}
                    className="px-3.5 py-2.5 rounded-xl border text-xs font-mono font-semibold hover:border-[var(--olive)] transition-colors cursor-pointer"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    Impromptu {classroom.speakingDurationSec}s
                  </button>
                  <button
                    type="button"
                    onClick={() => launchSlotSession(currentSlotObj, "research")}
                    className="btn-terra px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-transform active:scale-[0.98] cursor-pointer"
                  >
                    <Mic size={14} />
                    <span>Learn &amp; Record</span>
                  </button>
                </div>
              </div>

              {matchingLocalSession && isMember && (
                <div
                  className="mt-4 pt-3.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{ borderColor: "var(--border-dim)" }}
                >
                  <div>
                    <div className="text-xs font-bold text-[var(--olive)]">
                      Found your saved {formatDuration(matchingLocalSession.speakingSeconds)} take for this topic
                    </div>
                    <p className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                      Publish your existing recording from your Recordings vault to unlock the circle immediately.
                    </p>
                    {publishSavedError && (
                      <div className="text-[11px] mt-1" style={{ color: "var(--red)" }}>
                        {publishSavedError}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={publishingSavedTake}
                    onClick={handlePublishSavedTake}
                    className="px-4 py-2 rounded-xl border border-[var(--olive)] bg-[var(--olive)] text-white text-xs font-mono font-bold shrink-0 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
                  >
                    {publishingSavedTake ? "Publishing..." : "Publish Saved Take"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className="rounded-xl px-4 py-3 border flex items-center justify-between gap-3 flex-wrap"
              style={{ background: "rgba(68, 78, 44, 0.08)", borderColor: "var(--olive)" }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--olive)]">
                <Check size={14} />
                <span>
                  You recorded Topic {currentSlotObj.slotNumber} · Circle audio unlocked
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold cursor-pointer"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text)" }}
                >
                  {playbackRate}x Speed
                </button>
                <button
                  type="button"
                  onClick={() => launchSlotSession(currentSlotObj, "speaking")}
                  className="px-2.5 py-1 rounded-lg border text-[11px] font-mono font-medium hover:border-[var(--olive)] cursor-pointer"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                >
                  Re-record
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Circle Recordings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--olive)]">
            Circle Recordings ({slotSubmissions.length}/{classroom.members.length})
          </h3>
          {isSlotUnlocked &&
            selectedSlot === unlockedUpTo &&
            selectedSlot < classroom.totalTopics &&
            slotSubmissions.length > 0 && (
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-mute)" }}>
                {safetyValveRemaining !== null && safetyValveRemaining > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    <span>Auto-advances in {formatCountdownHours(safetyValveRemaining)}</span>
                  </span>
                )}
                {isHost && (
                  <button
                    type="button"
                    disabled={unlockingNext}
                    onClick={handleUnlockNextEarly}
                    className="text-[var(--olive)] font-mono font-bold hover:underline cursor-pointer"
                  >
                    {unlockingNext ? "Unlocking..." : "Unlock Topic " + (selectedSlot + 1)}
                  </button>
                )}
              </div>
            )}
        </div>

        {slotSubmissions.length === 0 ? (
          <div
            className="rounded-2xl border p-7 text-center surface"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <Users size={20} className="mx-auto mb-2 text-[var(--text-mute)]" />
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
              No takes recorded on Topic {selectedSlot} yet
            </p>
            <p className="text-xs" style={{ color: "var(--text-dim)" }}>
              Be the first to record your {classroom.speakingDurationSec}s explanation—your friends will see that yours is waiting for them to unlock.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {slotSubmissions.map((sub) => {
              const isMine =
                sub.userId === profile.id ||
                (profile.username &&
                  profile.username !== "Scholar" &&
                  sub.username?.trim().toLowerCase() === profile.username.trim().toLowerCase());
              const canPlay = isMine || hasRecordedCurrentSlot;
              const isPlaying = playingSubId === sub.id;
              const heardList = sub.heardBy || [];
              const notesList = sub.marginNotes || [];
              const notesExpanded = Boolean(openNotesForSub[sub.id]) || notesList.length > 0;

              return (
                <div
                  key={sub.id}
                  className="rounded-2xl border-[1.5px] p-5 surface"
                  style={{ borderColor: isMine ? "var(--olive)" : "var(--border)" }}
                >
                  {/* Submitter Header */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar avatar={sub.avatar} size="md" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
                            {sub.username}
                          </span>
                          {isMine && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--olive)]/12 text-[var(--olive)] font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px]" style={{ color: "var(--text-mute)" }}>
                          {timeAgo(sub.submittedAt)} · {formatDuration(sub.durationSeconds)}
                        </div>
                      </div>
                    </div>

                    {/* Heard By Avatars Receipt */}
                    {heardList.length > 0 && (
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                        style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}
                        title={`Heard by ${heardList.map((h) => h.username).join(", ")}`}
                      >
                        <Headphones size={11} className="text-[var(--olive)]" />
                        <span className="text-[10px] font-medium" style={{ color: "var(--text-dim)" }}>
                          Heard by
                        </span>
                        <div className="flex items-center -space-x-1">
                          {heardList.slice(0, 4).map((h) => (
                            <UserAvatar key={h.userId} avatar={h.avatar} size="xs" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Audio Waveform — Unlocked vs Speak-to-Unlock Locked */}
                  {canPlay ? (
                    <>
                      <div
                        className="rounded-xl px-4 py-3 flex items-center gap-3 mb-3.5"
                        style={{ background: "var(--bg-input)" }}
                      >
                        <button
                          type="button"
                          onClick={() => handlePlaySubmission(sub)}
                          disabled={!sub.audioUrl}
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 disabled:opacity-40 cursor-pointer"
                          style={{ background: isPlaying ? "var(--red)" : "var(--terra)" }}
                          aria-label={isPlaying ? "Pause audio" : "Play audio"}
                        >
                          {isPlaying ? (
                            <span className="w-2.5 h-2.5 bg-white rounded-xs" />
                          ) : (
                            <Play size={13} color="white" />
                          )}
                        </button>

                        <div className="flex-1 flex items-center gap-0.5 h-6">
                          {Array.from({ length: 38 }).map((_, idx) => (
                            <div
                              key={idx}
                              className="w-0.5 rounded-full transition-colors"
                              style={{
                                height: `${24 + ((idx * 17 + sub.durationSeconds) % 70)}%`,
                                background: isPlaying ? catColor : `${catColor}55`,
                              }}
                            />
                          ))}
                        </div>

                        <span className="text-xs font-mono font-semibold shrink-0" style={{ color: "var(--text-dim)" }}>
                          {formatDuration(sub.durationSeconds)}
                        </span>
                      </div>

                      {/* Collaborative Appreciation Stamps + Margin Note Toggle */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {APPRECIATION_TAGS.map((tagKey) => {
                            const voters = sub.appreciations?.[tagKey] || [];
                            const active = voters.includes(profile.id);
                            return (
                              <button
                                key={tagKey}
                                type="button"
                                onClick={() =>
                                  toggleAppreciation(cleanCode, sub.id, tagKey, profile.id)
                                }
                                className={cn(
                                  "px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all active:scale-[0.97] cursor-pointer",
                                  active
                                    ? "bg-[var(--olive)] text-white border-[var(--olive)] font-semibold"
                                    : "bg-[var(--bg-panel)] text-[var(--text-dim)] border-[var(--border-dim)] hover:border-[var(--olive)]"
                                )}
                              >
                                <span>{APPRECIATION_TAG_META[tagKey].label}</span>
                                {voters.length > 0 && (
                                  <span className="font-mono text-[10px] opacity-85">
                                    {voters.length}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setOpenNotesForSub((prev) => ({ ...prev, [sub.id]: !prev[sub.id] }))
                          }
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                          style={{ color: "var(--text-dim)" }}
                        >
                          <MessageSquare size={12} />
                          <span>
                            {notesList.length > 0
                              ? `Notes (${notesList.length})`
                              : "Add Margin Note"}
                          </span>
                        </button>
                      </div>

                      {/* Margin Notes Thread */}
                      {notesExpanded && (
                        <div
                          className="mt-3 pt-3 border-t space-y-2.5"
                          style={{ borderColor: "var(--border-dim)" }}
                        >
                          {notesList.map((n) => (
                            <div
                              key={n.id}
                              className="rounded-lg px-3 py-2 text-xs flex items-start gap-2"
                              style={{ background: "var(--bg-panel)" }}
                            >
                              <UserAvatar avatar={n.avatar} size="xs" />
                              <div className="flex-1 min-w-0">
                                <span className="font-bold mr-1.5" style={{ color: "var(--text)" }}>
                                  {n.username}:
                                </span>
                                <span style={{ color: "var(--text-dim)" }}>{n.text}</span>
                              </div>
                            </div>
                          ))}

                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const draft = (noteDrafts[sub.id] || "").trim();
                              if (!draft) return;
                              addMarginNote(
                                cleanCode,
                                sub.id,
                                {
                                  userId: profile.id,
                                  username: profile.username || "Scholar",
                                  avatar: profile.avatar || "/avatars/avatar-scholar.svg",
                                },
                                draft
                              );
                              setNoteDrafts((prev) => ({ ...prev, [sub.id]: "" }));
                            }}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={noteDrafts[sub.id] || ""}
                              onChange={(e) =>
                                setNoteDrafts((prev) => ({
                                  ...prev,
                                  [sub.id]: e.target.value,
                                }))
                              }
                              maxLength={160}
                              placeholder={`Leave a quick note for ${sub.username}...`}
                              className="flex-1 px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:border-[var(--olive)]"
                              style={{
                                background: "var(--bg-input)",
                                borderColor: "var(--border)",
                                color: "var(--text)",
                              }}
                            />
                            <button
                              type="submit"
                              className="p-2 rounded-lg bg-[var(--olive)] text-white hover:opacity-90 cursor-pointer"
                              aria-label="Send margin note"
                            >
                              <Send size={12} />
                            </button>
                          </form>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Speak-to-Unlock Locked State */
                    <div
                      className="rounded-xl px-4 py-3.5 border flex items-center justify-between gap-3"
                      style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border)] shrink-0">
                          <Lock size={13} className="text-[var(--terra)]" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                            Locked until you record Topic {selectedSlot}
                          </div>
                          <div className="text-[11px]" style={{ color: "var(--text-mute)" }}>
                            Record your own take first so {sub.username}&apos;s angle doesn&apos;t bias yours.
                          </div>
                        </div>
                      </div>

                      {currentSlotObj && isSlotUnlocked && (
                        <button
                          type="button"
                          onClick={() => launchSlotSession(currentSlotObj, "research")}
                          className="btn-terra px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold shrink-0 cursor-pointer"
                        >
                          Record Yours
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pending Friends Indicator + 1-Tap Nudge (when you've recorded and friend has push on) */}
            {unrecordedMembersOnSlot.length > 0 && (
              <div
                className="rounded-xl border px-4 py-3 mt-1"
                style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)" }}
              >
                <div className="text-[11px] font-mono uppercase tracking-wider mb-2" style={{ color: "var(--text-mute)" }}>
                  Waiting on Topic {selectedSlot}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {unrecordedMembersOnSlot.map((m) => {
                    const isSelf = isSameClassroomScholar(
                      m.userId,
                      m.username,
                      profile.id,
                      profile.username
                    );
                    const canNudge =
                      isMember &&
                      hasRecordedCurrentSlot &&
                      !isSelf &&
                      pushEnabledSet.has(m.userId);
                    const nudgeKey = `${cleanCode}:${m.userId}`;
                    const recentlyNudged =
                      Date.now() - (nudgedAtByKey[nudgeKey] || 0) < 6 * 3600 * 1000;
                    const isSending = nudgingUserId === m.userId;
                    const notice = nudgeNoticeByUser[m.userId];

                    return (
                      <div
                        key={m.userId}
                        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs"
                        style={{
                          background: "var(--bg-card)",
                          borderColor: "var(--border-dim)",
                          color: "var(--text)",
                        }}
                      >
                        <UserAvatar avatar={m.avatar} size="xs" />
                        <span className="font-medium">{m.username}</span>

                        {canNudge && (
                          <button
                            type="button"
                            disabled={isSending || recentlyNudged}
                            onClick={() => handleNudgeMember(m.userId)}
                            className={cn(
                              "ml-0.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer disabled:cursor-default",
                              recentlyNudged
                                ? "bg-[var(--olive)]/12 text-[var(--olive)]"
                                : "bg-[var(--terra)] text-white hover:opacity-90 active:scale-[0.97]"
                            )}
                            title={notice || `Send a gentle nudge to ${m.username}`}
                          >
                            {recentlyNudged ? (
                              <>
                                <Check size={11} />
                                <span>Nudged</span>
                              </>
                            ) : (
                              <>
                                <Bell size={11} />
                                <span>{isSending ? "..." : "Nudge"}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {Object.values(nudgeNoticeByUser).length > 0 && (
                  <div className="text-[11px] mt-2" style={{ color: "var(--text-dim)" }}>
                    {Object.values(nudgeNoticeByUser).slice(-1)[0]}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Swap Unstarted Topic Modal */}
      <AnimatePresence>
        {swappingSlotNum !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs"
            onClick={() => setSwappingSlotNum(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 6 }}
              transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl border-[1.5px] p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b" style={{ borderColor: "var(--border-dim)" }}>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--olive)] mb-0.5">
                    Topic {swappingSlotNum} · Unstarted Slot
                  </div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl" style={{ color: "var(--text)" }}>
                    Swap in Your Topic Pick
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSwappingSlotNum(null)}
                  className="p-2 rounded-xl border border-[var(--border-dim)] text-[var(--text-mute)] hover:text-[var(--text)] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Bank vs Custom Toggle */}
              <div
                className="grid grid-cols-2 p-1 rounded-xl border gap-1 mb-4"
                style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}
              >
                {(
                  [
                    { id: "bank", label: "Browse Topic Bank" },
                    { id: "custom", label: "Write Custom Prompt" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSwapMode(m.id)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                      swapMode === m.id
                        ? "bg-[var(--olive)] text-white font-bold"
                        : "text-[var(--text-dim)] hover:text-[var(--text)]"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {swapMode === "custom" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-dim)" }}>
                      Custom Prompt for Topic {swappingSlotNum}
                    </label>
                    <textarea
                      rows={3}
                      value={swapCustomText}
                      onChange={(e) => setSwapCustomText(e.target.value)}
                      maxLength={220}
                      placeholder="Write a clear question or concept you want everyone in the Classroom to explain..."
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[var(--olive)] resize-none"
                      style={{
                        background: "var(--bg-input)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs" style={{ color: "var(--text-mute)" }}>
                      Category:
                    </span>
                    <select
                      value={swapCustomCategory}
                      onChange={(e) => setSwapCustomCategory(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border text-xs font-medium"
                      style={{
                        background: "var(--bg-input)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={swapSaving || !swapCustomText.trim()}
                      onClick={() =>
                        handleSwapPick({
                          id: `custom-swap-${Date.now()}`,
                          text: swapCustomText.trim(),
                          category: swapCustomCategory,
                          difficulty: (classroom.difficulty as Difficulty) || "Novice",
                          tags: ["custom"],
                        })
                      }
                      className="btn-terra px-4 py-2.5 rounded-xl text-xs font-mono font-bold disabled:opacity-50 cursor-pointer"
                    >
                      {swapSaving ? "Saving..." : `Set as Topic ${swappingSlotNum}`}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5 mb-3">
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                      style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}
                    >
                      <Search size={14} className="text-[var(--text-mute)] shrink-0" />
                      <input
                        type="text"
                        value={swapSearch}
                        onChange={(e) => setSwapSearch(e.target.value)}
                        placeholder="Search topics..."
                        className="w-full bg-transparent text-xs sm:text-sm focus:outline-none"
                        style={{ color: "var(--text)" }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <button
                        type="button"
                        onClick={() => setSwapCategory("all")}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border whitespace-nowrap cursor-pointer",
                          swapCategory === "all"
                            ? "bg-[var(--olive)] text-white border-[var(--olive)]"
                            : "bg-[var(--bg-panel)] text-[var(--text-dim)] border-[var(--border-dim)]"
                        )}
                      >
                        Suggested
                      </button>
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSwapCategory(cat)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border whitespace-nowrap cursor-pointer",
                            swapCategory === cat
                              ? "bg-[var(--olive)] text-white border-[var(--olive)]"
                              : "bg-[var(--bg-panel)] text-[var(--text-dim)] border-[var(--border-dim)]"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {swapCandidates.length === 0 ? (
                      <div
                        className="rounded-xl border p-6 text-center"
                        style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)" }}
                      >
                        <p className="text-xs sm:text-sm font-semibold mb-1" style={{ color: "var(--text)" }}>
                          No matching topics found
                          {swapSearch.trim() ? ` for "${swapSearch.trim()}"` : ""}
                        </p>
                        <p className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>
                          {swapCategory !== "all"
                            ? `No results inside ${swapCategory}. Try searching all categories or write your own prompt.`
                            : "Try another keyword or turn this into a custom prompt for your Classroom."}
                        </p>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {swapCategory !== "all" && (
                            <button
                              type="button"
                              onClick={() => setSwapCategory("all")}
                              className="px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold hover:border-[var(--olive)] cursor-pointer"
                              style={{ background: "var(--bg-card)", borderColor: "var(--border)", color: "var(--text)" }}
                            >
                              Search All Categories
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (swapSearch.trim() && !swapCustomText.trim()) {
                                setSwapCustomText(swapSearch.trim());
                              }
                              setSwapMode("custom");
                            }}
                            className="btn-terra px-4 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer"
                          >
                            Write Custom Prompt
                          </button>
                        </div>
                      </div>
                    ) : (
                      swapCandidates.slice(0, 25).map((t) => (
                        <div
                          key={t.id}
                          className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)" }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-mono font-bold text-[var(--olive)] mb-0.5">
                              {t.category} · {t.difficulty}
                            </div>
                            <p className="font-serif font-bold text-xs sm:text-sm leading-snug" style={{ color: "var(--text)" }}>
                              {t.text}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={swapSaving}
                            onClick={() => handleSwapPick(t)}
                            className="btn-terra px-3 py-1.5 rounded-lg text-xs font-mono font-bold shrink-0 cursor-pointer"
                          >
                            Select
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extend Classroom / Add More Topics Modal */}
      <AnimatePresence>
        {showExtendModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs"
            onClick={() => setShowExtendModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 6 }}
              transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border-[1.5px] p-5 sm:p-6 shadow-2xl max-h-[88vh] overflow-y-auto"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b" style={{ borderColor: "var(--border-dim)" }}>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--olive)] mb-0.5">
                    Currently {classroom.totalTopics} Topics · Continue Circle
                  </div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl" style={{ color: "var(--text)" }}>
                    Add More Topics to Classroom
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                    New topics append to this Classroom without repeating any earlier prompts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  className="p-2 rounded-xl border border-[var(--border-dim)] text-[var(--text-mute)] hover:text-[var(--text)] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleExtendSubmit} className="space-y-4">
                <div
                  className="grid grid-cols-2 p-1 rounded-xl border gap-1"
                  style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}
                >
                  {(
                    [
                      { id: "categories", label: "Shared Interests" },
                      { id: "custom", label: "Custom Topic (+1)" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setExtendMode(m.id)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                        extendMode === m.id
                          ? "bg-[var(--olive)] text-white font-bold"
                          : "text-[var(--text-dim)] hover:text-[var(--text)]"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {extendMode === "categories" ? (
                  <>
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-dim)" }}>
                        How Many Topics to Add
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {([1, 3, 5, 7] as const).map((n) => {
                          const active = extendCount === n;
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setExtendCount(n)}
                              className={cn(
                                "py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer",
                                active
                                  ? "bg-[var(--olive)] text-white border-[var(--olive)]"
                                  : "bg-[var(--bg-input)] text-[var(--text-dim)] border-[var(--border-dim)] hover:border-[var(--olive)]"
                              )}
                            >
                              +{n} {n === 1 ? "Topic" : "Topics"}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-dim)" }}>
                        Topic Categories ({extendCategories.length}/6)
                      </label>
                      <div
                        className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl border"
                        style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)" }}
                      >
                        {CATEGORIES.map((cat) => {
                          const active = extendCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => toggleExtendCategory(cat)}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all flex items-center gap-1 cursor-pointer",
                                active
                                  ? "bg-[var(--olive)] text-white border-[var(--olive)] font-semibold"
                                  : "bg-[var(--bg-card)] text-[var(--text-dim)] border-[var(--border-dim)] hover:border-[var(--olive)]"
                              )}
                            >
                              {active && <Check size={10} />}
                              <span>{cat}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-dim)" }}>
                        Topic {classroom.totalTopics + 1} Prompt
                      </label>
                      <textarea
                        rows={3}
                        value={extendCustomText}
                        onChange={(e) => setExtendCustomText(e.target.value)}
                        maxLength={220}
                        placeholder="Write the next question or concept for your Classroom..."
                        className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[var(--olive)] resize-none"
                        style={{
                          background: "var(--bg-input)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs" style={{ color: "var(--text-mute)" }}>
                        Category:
                      </span>
                      <select
                        value={extendCustomCategory}
                        onChange={(e) => setExtendCustomCategory(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-medium"
                        style={{
                          background: "var(--bg-input)",
                          borderColor: "var(--border)",
                          color: "var(--text)",
                        }}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {extendError && (
                  <div
                    className="rounded-xl px-3.5 py-2.5 text-xs font-medium border"
                    style={{
                      background: "var(--red-bg)",
                      borderColor: "var(--red)",
                      color: "var(--red)",
                    }}
                  >
                    {extendError}
                  </div>
                )}

                <div className="pt-1 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExtendModal(false)}
                    className="px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-[var(--bg-input)] cursor-pointer"
                    style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={extendingSaving}
                    className="btn-terra px-5 py-2.5 rounded-xl text-xs font-mono font-bold disabled:opacity-60 cursor-pointer"
                  >
                    {extendingSaving
                      ? "Adding..."
                      : extendMode === "custom"
                      ? "Add Custom Topic"
                      : `Add +${extendCount} Topic${extendCount === 1 ? "" : "s"}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMember && (
        <ReminderOptInCard
          context="classroom"
          userId={profile.id || "local-scholar"}
          streak={useAppStore.getState().streak?.current ?? 0}
          categories={
            useAppStore.getState().settings?.favoriteCategories?.length
              ? useAppStore.getState().settings.favoriteCategories
              : useAppStore.getState().settings?.enabledCategories
          }
        />
      )}

      <audio
        ref={audioRef}
        className="hidden"
        onEnded={() => setPlayingSubId(null)}
        onPause={() => setPlayingSubId(null)}
      />
    </div>
  );
}
