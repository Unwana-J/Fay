"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Copy,
  Check,
  Share2,
  ArrowLeft,
  Trophy,
  Swords,
  Crown,
  Sparkles,
  Users,
  Target,
  RefreshCw,
  Zap,
  Pencil,
  ChevronDown,
  ChevronUp,
  User,
  Globe,
  Trash2,
  Compass,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import {
  type TriviaChallenge,
  type ChallengeParticipantScore,
  createTriviaChallenge,
  getChallengeTimeStatus,
  getDetailedChallengeCountdown,
  type DetailedCountdown,
  encodeChallengeToUrl,
  saveLocalChallenge,
  getAllLocalChallenges,
  getPublicChallenges,
  deleteLocalChallenge,
  getLocalChallengeScores,
  DURATION_CHOICES,
} from "@/lib/trivia-challenge";
import { copyTextToClipboard } from "@/lib/clipboard";
import { type TriviaDifficultyFilter } from "@/lib/trivia-questions";
import UserAvatar from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";

/**
 * Live Ticking Visible Countdown Timer
 * Displays digital segmented clock boxes (Days, Hours, Mins, Secs)
 * along with a visual gauntlet progress bar.
 */
export function VisibleCountdownTimer({
  challenge,
  compact = false,
}: {
  challenge: TriviaChallenge;
  compact?: boolean;
}) {
  const [countdown, setCountdown] = useState(() => getDetailedChallengeCountdown(challenge));

  useEffect(() => {
    setCountdown(getDetailedChallengeCountdown(challenge));
    const timer = setInterval(() => {
      setCountdown(getDetailedChallengeCountdown(challenge));
    }, 1000);
    return () => clearInterval(timer);
  }, [challenge]);

  if (countdown.isIndefinite) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-[11px] font-mono text-[var(--text-dim)]">
        <span className="text-[var(--gold)] text-xs">∞</span>
        <span>Open Indefinitely</span>
      </div>
    );
  }

  if (countdown.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-[11px] font-mono font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
        <span>Concluded</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-bold">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <Clock size={11} className="shrink-0" />
        <span className="tracking-tight">{countdown.formattedClock}</span>
        <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70">left</span>
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="rounded-2xl p-3 sm:p-4 bg-[var(--bg-base)]/90 dark:bg-black/40 border border-[var(--border-dim)] shadow-xs backdrop-blur-xs flex flex-col gap-2.5 w-full sm:w-auto sm:min-w-[300px]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Gauntlet Closes In
          </span>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-mute)] font-medium">
          {countdown.elapsedText}
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 justify-center sm:justify-start">
        {countdown.days > 0 && (
          <>
            <div className="flex flex-col items-center">
              <div className="min-w-[40px] sm:min-w-[48px] px-2 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-dim)] shadow-inner text-center">
                <span className="font-mono font-black text-xl sm:text-2xl text-[var(--text)] tracking-wider">
                  {pad(countdown.days)}
                </span>
              </div>
              <span className="text-[9px] font-mono uppercase text-[var(--text-mute)] mt-1 tracking-wider font-semibold">
                Days
              </span>
            </div>
            <span className="font-mono font-bold text-lg sm:text-xl text-[var(--text-mute)] -mt-4">:</span>
          </>
        )}

        <div className="flex flex-col items-center">
          <div className="min-w-[40px] sm:min-w-[48px] px-2 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-dim)] shadow-inner text-center">
            <span className="font-mono font-black text-xl sm:text-2xl text-[var(--text)] tracking-wider">
              {pad(countdown.hours)}
            </span>
          </div>
          <span className="text-[9px] font-mono uppercase text-[var(--text-mute)] mt-1 tracking-wider font-semibold">
            Hours
          </span>
        </div>

        <span className="font-mono font-bold text-lg sm:text-xl text-[var(--text-mute)] -mt-4 animate-pulse">:</span>

        <div className="flex flex-col items-center">
          <div className="min-w-[40px] sm:min-w-[48px] px-2 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-dim)] shadow-inner text-center">
            <span className="font-mono font-black text-xl sm:text-2xl text-[var(--text)] tracking-wider">
              {pad(countdown.minutes)}
            </span>
          </div>
          <span className="text-[9px] font-mono uppercase text-[var(--text-mute)] mt-1 tracking-wider font-semibold">
            Mins
          </span>
        </div>

        <span className="font-mono font-bold text-lg sm:text-xl text-[var(--text-mute)] -mt-4 animate-pulse">:</span>

        <div className="flex flex-col items-center">
          <div className="min-w-[40px] sm:min-w-[48px] px-2 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/35 shadow-inner text-center">
            <span className="font-mono font-black text-xl sm:text-2xl text-[#008751] dark:text-emerald-400 tracking-wider">
              {pad(countdown.seconds)}
            </span>
          </div>
          <span className="text-[9px] font-mono uppercase text-emerald-700 dark:text-emerald-400 mt-1 tracking-wider font-bold">
            Secs
          </span>
        </div>
      </div>

      <div className="space-y-1 pt-0.5">
        <div className="w-full h-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-dim)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${countdown.percentRemaining}%`,
              background: "linear-gradient(90deg, #008751 0%, #A67C1E 100%)",
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[9px] font-mono text-[var(--text-dim)] px-0.5">
          <span>{Math.round(countdown.percentRemaining)}% window remaining</span>
          <span>{challenge.durationHours > 0 ? `${challenge.durationHours}h gauntlet` : "Permanent"}</span>
        </div>
      </div>
    </div>
  );
}

interface TriviaChallengeLoungeProps {
  activeChallenge: TriviaChallenge | null;
  onSelectChallenge: (challenge: TriviaChallenge | null) => void;
  onPlayChallenge: (challenge: TriviaChallenge) => void;
}

export default function TriviaChallengeLounge({
  activeChallenge,
  onSelectChallenge,
  onPlayChallenge,
}: TriviaChallengeLoungeProps) {
  const { profile, updateProfile } = useAppStore();

  const [localChallenges, setLocalChallenges] = useState<TriviaChallenge[]>([]);
  const [publicChallenges, setPublicChallenges] = useState<TriviaChallenge[]>([]);
  const [selectedSubTab, setSelectedSubTab] = useState<"my" | "public">("public");
  const [publicCategoryFilter, setPublicCategoryFilter] = useState<string>("all");

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");

  function refreshChallengeLists() {
    setLocalChallenges(getAllLocalChallenges());
    setPublicChallenges(getPublicChallenges());
  }

  useEffect(() => {
    refreshChallengeLists();
  }, [activeChallenge]);

  const [view, setView] = useState<"list" | "detail" | "create" | "standings">(() => {
    if (activeChallenge) return "standings";
    return "list";
  });

  // Creation form state
  const [title, setTitle] = useState("");
  const [durationHours, setDurationHours] = useState<number>(24);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<TriviaDifficultyFilter>("random");
  const [category, setCategory] = useState<string>("all");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [createdChallenge, setCreatedChallenge] = useState<TriviaChallenge | null>(activeChallenge);

  const [copiedLink, setCopiedLink] = useState(false);

  const currentChallenge = activeChallenge || createdChallenge;

  const [scores, setScores] = useState<ChallengeParticipantScore[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);

  const INITIAL_LIMIT = 10;
  const [isExpandedScores, setIsExpandedScores] = useState(false);
  const [highlightScoreId, setHighlightScoreId] = useState<string | null>(null);

  function handleJumpToUserInChallenge() {
    setIsExpandedScores(true);
    setTimeout(() => {
      const el = document.getElementById("lounge-challenge-user-row");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightScoreId("user-current");
        setTimeout(() => setHighlightScoreId(null), 2500);
      }
    }, 120);
  }

  function loadScores() {
    if (!currentChallenge) return;
    setIsLoadingScores(true);
    const local = getLocalChallengeScores(currentChallenge.id);

    const qIds = currentChallenge.questionIds?.join(",") || "";
    const params = new URLSearchParams();
    params.set("challengeId", currentChallenge.id);
    if (qIds) params.set("qIds", qIds);

    fetch(`/api/trivia/leaderboard?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.configured && Array.isArray(data.scores) && data.scores.length > 0) {
          const cloudList: ChallengeParticipantScore[] = data.scores.map((cs: any) => ({
            id: cs.id,
            username: cs.username,
            avatar: cs.avatar || "/avatars/avatar-scholar.svg",
            score: cs.score,
            total: cs.total,
            pct: cs.pct,
            gradeLabel: cs.grade_label,
            completedAt: new Date(cs.created_at).getTime(),
          }));

          try {
            if (typeof window !== "undefined") {
              const key = `fey_tc_${currentChallenge.id}_scores`;
              localStorage.setItem(key, JSON.stringify(cloudList));
            }
          } catch {}

          setScores(cloudList.sort((a, b) => b.pct - a.pct || b.score - a.score));
        } else {
          setScores(local);
        }
      })
      .catch(() => setScores(local))
      .finally(() => setIsLoadingScores(false));
  }

  useEffect(() => {
    loadScores();
  }, [currentChallenge, view]);

  const handleSaveName = async () => {
    if (!renameDraft.trim()) return;
    const newName = renameDraft.trim();
    updateProfile({ username: newName });
    setShowRenameModal(false);
    setTimeout(() => {
      loadScores();
    }, 400);
  };

  const shareableUrl = useMemo(() => {
    if (!currentChallenge) return "";
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://fey.lokinlabs.com.ng";

    const code = encodeChallengeToUrl(currentChallenge);
    return `${origin}/games/trivia?challenge=${code}`;
  }, [currentChallenge]);

  function handleCreateChallenge(e: React.FormEvent) {
    e.preventDefault();
    const challenge = createTriviaChallenge({
      title: title.trim() || `${profile?.username || "Scholar"}'s Trivia Challenge`,
      creatorName: profile?.username || "Scholar",
      durationHours,
      questionCount,
      difficulty,
      category,
      isPublic,
    });

    saveLocalChallenge(challenge);
    setCreatedChallenge(challenge);
    onSelectChallenge(challenge);
    refreshChallengeLists();
    setView("standings");
  }

  async function handleCopyLink() {
    if (!shareableUrl) return;
    const ok = await copyTextToClipboard(shareableUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  }

  function handleShareWhatsApp() {
    if (!shareableUrl || !currentChallenge) return;
    const text = encodeURIComponent(
      `⚔️ *${currentChallenge.title}* on Fey!\nAnswer the exact same ${currentChallenge.questionCount} questions and see where you rank on our group leaderboard:\n${shareableUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  function handleDeleteChallenge(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Delete this challenge from your list?")) {
      deleteLocalChallenge(id);
      refreshChallengeLists();
    }
  }

  // Filtered public list
  const filteredPublicChallenges = useMemo(() => {
    if (publicCategoryFilter === "all") return publicChallenges;
    return publicChallenges.filter(
      (c) => c.category?.toLowerCase() === publicCategoryFilter.toLowerCase()
    );
  }, [publicChallenges, publicCategoryFilter]);

  // ── View 1: List of Active & Past Challenges + Public Arena Feed ──
  if (view === "list") {
    const activeMyList = localChallenges.filter((c) => !getChallengeTimeStatus(c).isExpired);
    const pastMyList = localChallenges.filter((c) => getChallengeTimeStatus(c).isExpired);

    return (
      <div className="surface rounded-3xl p-5 sm:p-7 border shadow-xs space-y-6">
        {/* Top Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--terra)]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--olive)]">
                Head-to-Head Gauntlets
              </span>
            </div>
            <h2
              className="font-space font-extrabold text-2xl tracking-tight"
              style={{ color: "var(--text)" }}
            >
              Trivia Challenges &amp; Arena
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-0.5">
              Play identical decks, invite friends to 1v1 duels, or compete in public community clashes.
            </p>
          </div>

          <button
            onClick={() => setView("create")}
            className="px-4 py-2.5 rounded-xl btn-terra font-space font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all whitespace-nowrap self-start sm:self-auto shrink-0"
          >
            <Swords size={13} />
            <span>+ Create Challenge</span>
          </button>
        </div>

        {/* Sub-tab switcher: Public Community Arena vs My Challenges */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-dim)]">
          <button
            type="button"
            onClick={() => setSelectedSubTab("public")}
            className={cn(
              "flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              selectedSubTab === "public"
                ? "bg-[var(--bg-card)] text-[var(--text)] shadow-xs border border-[var(--border-dim)]"
                : "text-[var(--text-mute)] hover:text-[var(--text)]"
            )}
          >
            <Globe size={13} className="text-[var(--olive)]" />
            <span>🌍 Public Community Arena ({publicChallenges.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSubTab("my")}
            className={cn(
              "flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
              selectedSubTab === "my"
                ? "bg-[var(--bg-card)] text-[var(--text)] shadow-xs border border-[var(--border-dim)]"
                : "text-[var(--text-mute)] hover:text-[var(--text)]"
            )}
          >
            <Swords size={13} className="text-[var(--terra)]" />
            <span>⚔️ My Challenges ({localChallenges.length})</span>
          </button>
        </div>

        {/* ── Tab Mode 1: Public Community Arena ── */}
        {selectedSubTab === "public" && (
          <div className="space-y-4">
            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {["all", "History", "Pop Culture", "General Knowledge"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPublicCategoryFilter(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-space text-[11px] font-bold transition-all shrink-0 cursor-pointer border",
                    publicCategoryFilter.toLowerCase() === cat.toLowerCase()
                      ? "border-[var(--olive)] bg-[var(--olive)]/15 text-[var(--text)] shadow-xs"
                      : "border-[var(--border-dim)] bg-[var(--bg-input)] text-[var(--text-dim)] hover:text-[var(--text)]"
                  )}
                >
                  {cat === "all" ? "All Disciplines" : cat}
                </button>
              ))}
            </div>

            {/* Public Gauntlets List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredPublicChallenges.map((c) => {
                const cScores = getLocalChallengeScores(c.id);

                return (
                  <div
                    key={c.id}
                    className="p-5 sm:p-6 rounded-2xl border surface transition-all hover:shadow-xs relative overflow-hidden"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left details */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <VisibleCountdownTimer challenge={c} compact />
                          {c.category && (
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] border border-[var(--olive)]/30 font-bold">
                              {c.category}
                            </span>
                          )}
                          <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-dim)] border border-[var(--border-dim)]">
                            {c.difficulty}
                          </span>
                        </div>

                        <h3
                          className="font-space font-extrabold text-lg sm:text-xl tracking-tight"
                          style={{ color: "var(--text)" }}
                        >
                          {c.title}
                        </h3>

                        {c.description && (
                          <p className="text-xs text-[var(--text-dim)] leading-relaxed max-w-xl">
                            {c.description}
                          </p>
                        )}

                        <div className="text-xs text-[var(--text-dim)] flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
                          <span>By <strong>{c.creatorName}</strong></span>
                          <span>•</span>
                          <span>{c.questionCount} Questions</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-[var(--text)]">
                            <Users size={12} /> {cScores.length} {cScores.length === 1 ? "Scholar" : "Scholars"}
                          </span>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-dim)]">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectChallenge(c);
                            setCreatedChallenge(c);
                            setView("standings");
                          }}
                          className="px-3.5 py-2.5 rounded-xl border font-space font-bold text-xs cursor-pointer hover:bg-[var(--bg-card)] transition-colors flex items-center justify-center gap-1.5 text-center"
                          style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                        >
                          <Trophy size={13} className="text-[var(--gold)]" />
                          <span>Board</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectChallenge(c);
                            onPlayChallenge(c);
                          }}
                          className="px-4 py-2.5 rounded-xl btn-terra font-space font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all text-center whitespace-nowrap"
                        >
                          <Zap size={13} />
                          <span>Play Gauntlet</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tab Mode 2: My Created Challenges & Duels ── */}
        {selectedSubTab === "my" && (
          <div className="space-y-6">
            {/* Active challenges */}
            {activeMyList.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-space font-bold uppercase tracking-wider text-[var(--olive)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Gauntlets ({activeMyList.length})</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {activeMyList.map((c) => {
                    const cScores = getLocalChallengeScores(c.id);

                    return (
                      <div
                        key={c.id}
                        className="p-5 rounded-2xl border surface transition-all hover:shadow-xs relative"
                        style={{ borderColor: "var(--border-dim)" }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <VisibleCountdownTimer challenge={c} compact />
                              {c.isPublic && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold">
                                  Public Arena
                                </span>
                              )}
                              <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-dim)] border border-[var(--border-dim)]">
                                {c.difficulty}
                              </span>
                            </div>

                            <h3 className="font-space font-extrabold text-lg text-[var(--text)] tracking-tight">
                              {c.title}
                            </h3>

                            <div className="text-xs text-[var(--text-dim)] flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span>Convened by <strong>{c.creatorName}</strong></span>
                              <span>•</span>
                              <span>{c.questionCount} Questions</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-semibold text-[var(--text)]">
                                <Users size={12} /> {cScores.length} Contenders
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => handleDeleteChallenge(c.id, e)}
                              className="p-2 rounded-xl border border-[var(--border-dim)] text-[var(--text-mute)] hover:text-rose-600 hover:border-rose-300 cursor-pointer bg-[var(--bg-input)]"
                              title="Delete Challenge"
                            >
                              <Trash2 size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onSelectChallenge(c);
                                setCreatedChallenge(c);
                                setView("standings");
                              }}
                              className="px-3 py-2 rounded-xl border text-xs font-space font-bold cursor-pointer hover:bg-[var(--bg-card)]"
                              style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                            >
                              Leaderboard
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onSelectChallenge(c);
                                onPlayChallenge(c);
                              }}
                              className="px-4 py-2 rounded-xl btn-terra text-xs font-space font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <span>Play</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past challenges */}
            {pastMyList.length > 0 && (
              <div className="space-y-3 pt-3 border-t" style={{ borderColor: "var(--border-dim)" }}>
                <span className="text-xs font-space font-bold uppercase tracking-wider text-[var(--text-mute)] block">
                  Concluded Challenges ({pastMyList.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pastMyList.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl border surface opacity-90 hover:opacity-100 flex items-center justify-between gap-3"
                      style={{ borderColor: "var(--border-dim)" }}
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono uppercase text-[var(--text-mute)] block">
                          Concluded
                        </span>
                        <h4 className="font-space font-bold text-sm truncate text-[var(--text)]">
                          {c.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => {
                          onSelectChallenge(c);
                          setCreatedChallenge(c);
                          setView("standings");
                        }}
                        className="px-3 py-1.5 rounded-lg border text-xs font-space font-bold cursor-pointer"
                        style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                      >
                        Board
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {localChallenges.length === 0 && (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--olive)]/10 text-[var(--olive)] mx-auto flex items-center justify-center">
                  <Swords size={20} />
                </div>
                <h3 className="font-space font-extrabold text-base text-[var(--text)]">
                  No Custom Gauntlets Created Yet
                </h3>
                <p className="text-xs text-[var(--text-dim)] max-w-sm mx-auto">
                  Convene an invitational gauntlet, pick a duration, and drop the link in your group chats.
                </p>
                <button
                  onClick={() => setView("create")}
                  className="px-4 py-2.5 rounded-xl btn-terra font-space font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                >
                  <span>Convene Your First Challenge</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── View 2: Challenge Standings / Leaderboard Arena ──
  if (currentChallenge && (view === "standings" || view === "detail")) {
    return (
      <div className="surface rounded-2xl p-6 sm:p-7 border shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border-dim)" }}>
          <button
            onClick={() => setView("list")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back to Challenge Arena</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-xl border text-xs font-space font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[var(--bg-card)] transition-colors shadow-xs"
              style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
            >
              {copiedLink ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-1.5 rounded-xl text-xs font-space font-bold flex items-center gap-1.5 cursor-pointer bg-[#25D366] text-white hover:opacity-90 transition-opacity shadow-xs"
            >
              <Share2 size={13} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={loadScores}
              className="p-1.5 rounded-xl border text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-card)] cursor-pointer transition-colors"
              style={{ borderColor: "var(--border-dim)" }}
              title="Refresh standings"
            >
              <RefreshCw size={13} className={cn(isLoadingScores && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Hero Plaque */}
        <div
          className="rounded-3xl p-6 sm:p-7 surface border relative overflow-hidden"
          style={{
            borderColor: "var(--border)",
            background: "linear-gradient(135deg, rgba(221, 161, 94, 0.08) 0%, rgba(92, 106, 54, 0.08) 100%)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--terra)]">
                  Group Gauntlet
                </span>
                {currentChallenge.isPublic && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/30">
                    Public Community Arena
                  </span>
                )}
              </div>

              <h2 className="font-space font-extrabold text-2xl sm:text-3xl text-[var(--text)] tracking-tight">
                {currentChallenge.title}
              </h2>

              <p className="text-xs sm:text-sm text-[var(--text-dim)]">
                Host: <strong>Scholar {currentChallenge.creatorName}</strong> • {currentChallenge.questionCount} Questions •{" "}
                <span className="capitalize">{currentChallenge.difficulty}</span> pool
              </p>
            </div>

            <VisibleCountdownTimer challenge={currentChallenge} />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-space font-bold text-sm text-[var(--text)] flex items-center gap-1.5">
              <Trophy size={14} className="text-[var(--gold)]" /> Live Standings ({scores.length} Contenders)
            </h3>
            <button
              onClick={() => setShowRenameModal(true)}
              className="text-xs font-mono text-[var(--olive)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Pencil size={11} /> Rename Profile
            </button>
          </div>

          {scores.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-dim)] border border-dashed rounded-2xl" style={{ borderColor: "var(--border-dim)" }}>
              No contenders have completed this gauntlet yet. Be the first to play!
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden surface divide-y divide-[var(--border-dim)]" style={{ borderColor: "var(--border-dim)" }}>
              {scores.map((sc, idx) => {
                const isTop3 = idx < 3;
                return (
                  <div
                    key={sc.id || idx}
                    className={cn(
                      "p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs",
                      idx === 0 && "bg-amber-500/5"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold w-6 text-center text-sm">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                      </span>
                      <UserAvatar alt={sc.username} avatar={sc.avatar} size="sm" />
                      <div className="min-w-0">
                        <div className="font-space font-bold truncate text-[var(--text)]">
                          {sc.username}
                        </div>
                        <div className="text-[10px] text-[var(--text-dim)]">
                          {sc.score}/{sc.total} correct ({sc.pct}%)
                        </div>
                      </div>
                    </div>

                    <div className="font-mono font-bold text-sm text-[var(--text)]">
                      {sc.pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t" style={{ borderColor: "var(--border-dim)" }}>
          <button
            onClick={() => onPlayChallenge(currentChallenge)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl btn-terra font-space font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <span>Play This Challenge Deck</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl border font-space font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:bg-[var(--bg-card)] transition-colors"
            style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
          >
            {copiedLink ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
            <span>{copiedLink ? "Link Copied" : "Copy Invite Link"}</span>
          </button>
        </div>
      </div>
    );
  }

  // ── View 3: Create Challenge Form ──
  return (
    <form onSubmit={handleCreateChallenge} className="surface rounded-3xl p-7 sm:p-9 border shadow-sm space-y-7">
      <button
        type="button"
        onClick={() => setView("list")}
        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors cursor-pointer"
      >
        <ArrowLeft size={13} />
        <span>Back to Challenges</span>
      </button>

      <div className="border-b pb-5" style={{ borderColor: "var(--border-dim)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-8 h-8 rounded-xl bg-[var(--terra-bg)] border border-[var(--terra)]/20 text-[var(--terra)] flex items-center justify-center">
            <Swords size={16} />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--olive)]">
            Gauntlet Creator
          </span>
        </div>
        <h2 className="font-space font-extrabold text-2xl sm:text-3xl tracking-tight" style={{ color: "var(--text)" }}>
          Convene a Trivia Gauntlet
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
          Set your duration window, question pool, and invite friends to compete on an identical challenge deck.
        </p>
      </div>

      {/* Field 1: Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-mute)] mb-2">
          Challenge Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`e.g. ${profile?.username || "Scholar"}'s Naija History Gauntlet`}
          className="w-full px-4 py-3.5 rounded-2xl border text-sm bg-[var(--bg-base)] focus:outline-none focus:border-[var(--olive)] transition-colors shadow-xs"
          style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
        />
      </div>

      {/* Field 2: Visibility Toggle (Public Arena vs Private Link) */}
      <div className="p-4 rounded-2xl surface border space-y-2" style={{ borderColor: "var(--border-dim)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-[var(--olive)]" />
            <span className="font-space font-bold text-xs text-[var(--text)]">
              Feature on Public Community Arena
            </span>
          </div>
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 accent-[var(--terra)] cursor-pointer"
          />
        </div>
        <p className="text-[11px] text-[var(--text-dim)]">
          When checked, any scholar browsing the Fey Community Arena can discover and accept your gauntlet.
        </p>
      </div>

      {/* Field 3: Duration */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-mute)] mb-2 flex items-center gap-1.5">
          <Clock size={13} />
          <span>Challenge Duration</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {DURATION_CHOICES.map((opt) => (
            <button
              key={opt.hours}
              type="button"
              onClick={() => setDurationHours(opt.hours)}
              className={cn(
                "p-3 rounded-2xl border text-center transition-all cursor-pointer",
                durationHours === opt.hours
                  ? "border-[var(--terra)] bg-[var(--terra-bg)] shadow-xs"
                  : "border-[var(--border-dim)] hover:bg-[var(--bg-card)]"
              )}
            >
              <div className="text-xs font-space font-bold" style={{ color: "var(--text)" }}>
                {opt.label}
              </div>
              <div className="text-[10px] text-[var(--text-mute)] mt-0.5">
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Field 4: Discipline & Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-mute)] mb-2 flex items-center gap-1.5">
            <Compass size={13} />
            <span>Category</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["all", "History", "Culture", "Geography", "Sports", "Politics"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "py-2.5 px-2 rounded-xl border text-xs font-space font-bold transition-all cursor-pointer capitalize text-center",
                  category === cat
                    ? "border-[var(--olive)] bg-[var(--olive)]/15 text-[var(--text)] shadow-xs"
                    : "border-[var(--border-dim)] text-[var(--text-mute)] hover:text-[var(--text)]"
                )}
              >
                {cat === "all" ? "Mixed" : cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-mute)] mb-2 flex items-center gap-1.5">
            <Zap size={13} />
            <span>Difficulty Level</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(["random", "easy", "medium", "hard"] as TriviaDifficultyFilter[]).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setDifficulty(lvl)}
                className={cn(
                  "py-2.5 px-2 rounded-xl border text-xs font-space capitalize transition-all cursor-pointer text-center",
                  difficulty === lvl
                    ? "border-[var(--gold)] bg-[var(--gold)]/15 font-bold text-[var(--text)] shadow-xs"
                    : "border-[var(--border-dim)] text-[var(--text-mute)] hover:text-[var(--text)]"
                )}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Field 5: Question Count */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-mute)] mb-2 flex items-center gap-1.5">
          <Target size={13} />
          <span>Questions in Deck</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[5, 10, 15].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setQuestionCount(count)}
              className={cn(
                "py-2.5 px-3 rounded-xl border text-xs font-space font-bold transition-all cursor-pointer",
                questionCount === count
                  ? "border-[var(--olive)] bg-[var(--olive)]/15 text-[var(--text)] shadow-xs"
                  : "border-[var(--border-dim)] text-[var(--text-mute)] hover:text-[var(--text)]"
              )}
            >
              {count} Questions
            </button>
          ))}
        </div>
      </div>

      <div className="pt-3">
        <button
          type="submit"
          className="w-full py-4 rounded-2xl btn-terra font-space font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <span>Create &amp; Launch Gauntlet</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
