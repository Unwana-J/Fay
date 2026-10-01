"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
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
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-xs font-mono text-[var(--text-dim)]">
        <span className="text-[var(--gold)] text-sm">∞</span>
        <span>Untimed Challenge (Open Indefinitely)</span>
      </div>
    );
  }

  if (countdown.isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-mono font-bold">
        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
        <span>Gauntlet Concluded · Submissions Closed</span>
      </div>
    );
  }

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-mono">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <Clock size={11} className="shrink-0" />
        <span className="font-bold tracking-tight">{countdown.formattedClock}</span>
        <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70">left</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-3 sm:p-4 bg-[var(--bg-base)]/90 dark:bg-black/40 border border-[var(--border-dim)] shadow-xs backdrop-blur-xs flex flex-col gap-2.5 w-full sm:w-auto sm:min-w-[300px]">
      {/* Header bar */}
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

      {/* Digits Display */}
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

        {/* Hours */}
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

        {/* Mins */}
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

        {/* Secs */}
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

      {/* Progress Bar & Sub-stats */}
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
          <span>{challenge.durationHours}h gauntlet</span>
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
  const { profile } = useAppStore();

  const [localChallenges, setLocalChallenges] = useState<TriviaChallenge[]>([]);

  useEffect(() => {
    const list = getAllLocalChallenges();
    setLocalChallenges(list);
  }, [activeChallenge]);

  const [view, setView] = useState<"list" | "detail" | "create" | "standings">(() => {
    if (activeChallenge) return "standings";
    const existing = getAllLocalChallenges();
    return existing.length > 0 ? "list" : "create";
  });

  const [title, setTitle] = useState("");
  const [durationHours, setDurationHours] = useState<number>(24);
  const [questionCount, setQuestionCount] = useState<number>(15);
  const [difficulty, setDifficulty] = useState<TriviaDifficultyFilter>("random");
  const [createdChallenge, setCreatedChallenge] = useState<TriviaChallenge | null>(activeChallenge);

  const [copiedLink, setCopiedLink] = useState(false);

  const currentChallenge = activeChallenge || createdChallenge;

  const [timeStatus, setTimeStatus] = useState(() =>
    currentChallenge ? getChallengeTimeStatus(currentChallenge) : null
  );

  const [scores, setScores] = useState<ChallengeParticipantScore[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);

  useEffect(() => {
    if (!currentChallenge) return;
    setTimeStatus(getChallengeTimeStatus(currentChallenge));
    const interval = setInterval(() => {
      setTimeStatus(getChallengeTimeStatus(currentChallenge));
    }, 30000);
    return () => clearInterval(interval);
  }, [currentChallenge]);

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
          const mergedMap = new Map<string, ChallengeParticipantScore>();
          local.forEach((s) => mergedMap.set(s.username.toLowerCase(), s));
          data.scores.forEach((cs: any) => {
            const key = cs.username.toLowerCase();
            const existing = mergedMap.get(key);
            if (!existing || cs.pct > existing.pct) {
              mergedMap.set(key, {
                id: cs.id,
                username: cs.username,
                avatar: cs.avatar || "/avatars/avatar-scholar.svg",
                score: cs.score,
                total: cs.total,
                pct: cs.pct,
                gradeLabel: cs.grade_label,
                completedAt: new Date(cs.created_at).getTime(),
              });
            }
          });
          setScores(Array.from(mergedMap.values()).sort((a, b) => b.pct - a.pct || b.score - a.score));
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
    });

    saveLocalChallenge(challenge);
    setCreatedChallenge(challenge);
    onSelectChallenge(challenge);
    setLocalChallenges(getAllLocalChallenges());
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

  // ── View 1: List of Active & Past Group Challenges ──
  if (view === "list") {
    const activeList = localChallenges.filter((c) => !getChallengeTimeStatus(c).isExpired);
    const pastList = localChallenges.filter((c) => getChallengeTimeStatus(c).isExpired);

    return (
      <div className="surface rounded-2xl sm:rounded-3xl p-5 sm:p-7 border shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5" style={{ borderColor: "var(--border-dim)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--terra)]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--olive)]">
                Scholar Gauntlets
              </span>
            </div>
            <h2 className="font-space font-extrabold text-2xl tracking-tight" style={{ color: "var(--text)" }}>
              Your Group Challenges
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-0.5">
              Track custom leaderboards, invite friends, and compete on identical question decks.
            </p>
          </div>

          <button
            onClick={() => setView("create")}
            className="px-4 py-2.5 rounded-xl btn-terra font-space font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all whitespace-nowrap self-start sm:self-auto shrink-0"
          >
            <Swords size={13} />
            <span>+ Convene Challenge</span>
          </button>
        </div>

        {/* Section 1: Active Challenges */}
        {activeList.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-space font-bold uppercase tracking-wider text-[var(--olive)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Gauntlets ({activeList.length})</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {activeList.map((c) => {
                const status = getChallengeTimeStatus(c);
                const cScores = getLocalChallengeScores(c.id);

                return (
                  <div
                    key={c.id}
                    className="p-5 sm:p-6 rounded-2xl border surface transition-all hover:shadow-xs relative overflow-hidden"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left info */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <VisibleCountdownTimer challenge={c} compact />
                          <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-dim)] border border-[var(--border-dim)]">
                            {c.difficulty}
                          </span>
                        </div>

                        <h3 className="font-space font-extrabold text-xl tracking-tight" style={{ color: "var(--text)" }}>
                          {c.title}
                        </h3>

                        <div className="text-xs text-[var(--text-dim)] flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span>Convened by <strong>Scholar {c.creatorName}</strong></span>
                          <span>•</span>
                          <span>{c.questionCount} Questions</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-[var(--text)]">
                            <Users size={12} /> {cScores.length} {cScores.length === 1 ? "Scholar" : "Scholars"}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-dim)]">
                        <button
                          onClick={() => {
                            onSelectChallenge(c);
                            setCreatedChallenge(c);
                            setView("standings");
                          }}
                          className="px-3.5 py-2.5 rounded-xl border font-space font-bold text-xs cursor-pointer hover:bg-[var(--bg-card)] transition-colors flex items-center justify-center gap-1.5 text-center"
                          style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                        >
                          <Trophy size={13} className="text-[var(--gold)]" />
                          <span>Leaderboard</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectChallenge(c);
                            onPlayChallenge(c);
                          }}
                          className="px-4 py-2.5 rounded-xl btn-terra font-space font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all text-center whitespace-nowrap"
                        >
                          <span>Play Deck</span>
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

        {/* Section 2: Concluded Challenges */}
        {pastList.length > 0 && (
          <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--border-dim)" }}>
            <span className="text-xs font-space font-bold uppercase tracking-wider text-[var(--text-mute)] block">
              Concluded Gauntlets ({pastList.length})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pastList.map((c) => {
                const cScores = getLocalChallengeScores(c.id);

                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl border surface opacity-90 hover:opacity-100 transition-opacity flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase text-[var(--text-mute)] block">
                        Concluded · Ran for {c.durationHours}h
                      </span>
                      <h4 className="font-space font-bold text-sm truncate" style={{ color: "var(--text)" }}>
                        {c.title}
                      </h4>
                      <p className="text-[11px] text-[var(--text-dim)]">
                        {cScores.length} Scholars competed
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectChallenge(c);
                        setCreatedChallenge(c);
                        setView("standings");
                      }}
                      className="w-full sm:w-auto px-3 py-1.5 rounded-lg border text-xs font-space font-bold cursor-pointer hover:bg-[var(--bg-card)] transition-colors text-center shrink-0"
                      style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                    >
                      Final Board
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {localChallenges.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--olive)]/10 text-[var(--olive)] mx-auto flex items-center justify-center text-xl">
              <Swords size={24} />
            </div>
            <h3 className="font-space font-extrabold text-lg text-[var(--text)]">
              No Group Challenges Yet
            </h3>
            <p className="text-xs text-[var(--text-dim)] max-w-sm mx-auto">
              Convene an invitational gauntlet, pick a duration, and drop the link in your group chats to see who tops the leaderboard.
            </p>
            <button
              onClick={() => setView("create")}
              className="px-5 py-3 rounded-2xl btn-terra font-space font-bold text-xs cursor-pointer inline-flex items-center gap-2 shadow-sm"
            >
              <span>Convene Your First Challenge</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── View 2: Challenge Custom Leaderboard (Standings Arena) ──
  if (currentChallenge && (view === "standings" || view === "detail")) {
    return (
      <div className="surface rounded-2xl p-6 sm:p-7 border shadow-xs space-y-6">
        {/* Navigation & Actions Top Bar */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border-dim)" }}>
          <button
            onClick={() => (localChallenges.length > 0 ? setView("list") : setView("create"))}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>All Group Challenges</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-xl border text-xs font-space font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[var(--bg-card)] transition-colors shadow-xs"
              style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
              title="Copy URL directly"
            >
              {copiedLink ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-1.5 rounded-xl text-xs font-space font-bold flex items-center gap-1.5 cursor-pointer bg-[#25D366] text-white hover:opacity-90 transition-opacity shadow-xs"
              title="Share challenge on WhatsApp"
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

        {/* Hero Tournament Banner Plaque */}
        <div
          className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 border relative overflow-hidden shadow-sm flex flex-col gap-5"
          style={{
            background: "linear-gradient(135deg, rgba(0, 135, 81, 0.12) 0%, rgba(166, 124, 30, 0.08) 100%)",
            borderColor: "rgba(0, 135, 81, 0.3)",
          }}
        >
          {/* Challenge Identity & Title (Full Width) */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--olive)]/15 text-[#008751] dark:text-emerald-400 border border-[var(--olive)]/30">
                <Swords size={11} /> Invitational Challenge
              </span>
              <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text-dim)]">
                {currentChallenge.difficulty} Mode
              </span>
            </div>

            <h2 className="font-space text-2xl sm:text-3xl font-extrabold tracking-tight break-words" style={{ color: "var(--text)" }}>
              {currentChallenge.title}
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-dim)]">
              Convened by <strong>Scholar {currentChallenge.creatorName}</strong> · {currentChallenge.questionCount} Questions · {scores.length} {scores.length === 1 ? "Scholar" : "Scholars"} Competing
            </p>
          </div>

          {/* Tournament Controls: Live Countdown Clock & Play Action */}
          <div className="pt-3 border-t border-[var(--border-dim)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <VisibleCountdownTimer challenge={currentChallenge} />
            </div>

            <button
              onClick={() => onPlayChallenge(currentChallenge)}
              className="px-6 py-3.5 rounded-2xl btn-terra font-space font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all whitespace-nowrap self-stretch sm:self-auto shrink-0"
            >
              <span>Play Challenge Deck</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Contenders Standings Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-space font-bold uppercase tracking-wider text-[var(--text-mute)] flex items-center gap-1.5">
              <Trophy size={13} />
              <span>Scholar Standings ({scores.length})</span>
            </span>
            <span className="text-[11px] font-mono text-[var(--text-dim)] flex items-center gap-1">
              <span>🔒 1st Attempt Locked</span>
            </span>
          </div>

          {scores.length === 0 ? (
            <div className="surface rounded-2xl p-8 border text-center space-y-3" style={{ borderColor: "var(--border-dim)" }}>
              <p className="font-space font-bold text-base text-[var(--text)]">
                The Board Awaits Its First Champion
              </p>
              <p className="text-xs text-[var(--text-dim)] max-w-sm mx-auto">
                No scholars have submitted runs for this challenge yet. Be the first to establish the baseline. Only your first attempt is posted to the tournament board.
              </p>
              <button
                onClick={() => onPlayChallenge(currentChallenge)}
                className="px-4 py-2 rounded-xl btn-terra font-space font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Play First Run</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : (
            <div className="surface rounded-2xl border overflow-hidden shadow-xs divide-y" style={{ borderColor: "var(--border-dim)" }}>
              {scores.map((s, idx) => {
                const isCurrentUser = profile?.username && s.username.toLowerCase() === profile.username.toLowerCase();

                return (
                  <div
                    key={s.id || s.username}
                    className={cn(
                      "p-4 flex items-center justify-between gap-3 transition-colors",
                      isCurrentUser ? "bg-[var(--olive)]/5" : "hover:bg-[var(--bg-input)]/50"
                    )}
                    style={{
                      borderLeft: isCurrentUser ? "4px solid var(--olive)" : "4px solid transparent",
                    }}
                  >
                    {/* Rank & Identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 text-center shrink-0">
                        {idx === 0 ? (
                          <span className="text-xl">🥇</span>
                        ) : idx === 1 ? (
                          <span className="text-xl">🥈</span>
                        ) : idx === 2 ? (
                          <span className="text-xl">🥉</span>
                        ) : (
                          <span className="font-space font-bold text-xs text-[var(--text-mute)]">
                            #{idx + 1}
                          </span>
                        )}
                      </div>

                      <UserAvatar avatar={s.avatar} size="md" />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-space font-bold text-sm truncate" style={{ color: "var(--text)" }}>
                            {s.username}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[var(--olive)]/20 text-[#008751]">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs truncate flex items-center gap-1.5" style={{ color: "var(--text-mute)" }}>
                          <span className="font-semibold">{s.gradeLabel || "Scholar"}</span>
                          <span>•</span>
                          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">1st run locked</span>
                        </div>
                      </div>
                    </div>

                    {/* Score & Accuracy */}
                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div>
                        <div className="font-space font-extrabold text-base" style={{ color: "var(--text)" }}>
                          {s.pct}%
                        </div>
                        <div className="text-[10px] font-semibold text-[var(--text-mute)]">
                          {s.score}/{s.total} score
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Share & Invite Strip */}
        <div className="surface rounded-2xl p-4 border space-y-2.5" style={{ borderColor: "var(--border-dim)" }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-space font-bold flex items-center gap-1.5" style={{ color: "var(--text)" }}>
              <Share2 size={13} className="text-[var(--terra)]" />
              <span>Invite Scholars to This Challenge</span>
            </span>
            <span className="text-[10px] text-[var(--text-mute)] font-mono">
              Direct challenge link
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border bg-[var(--bg-input)]/50 min-w-0" style={{ borderColor: "var(--border-dim)" }}>
              <span className="text-[11px] font-mono text-[var(--text-dim)] truncate select-all flex-1">
                {shareableUrl}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border text-xs font-space font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[var(--bg-card)] transition-colors shadow-xs"
                style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                title="Copy pure URL directly"
              >
                {copiedLink ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-4 py-2 rounded-xl text-xs font-space font-bold flex items-center justify-center gap-1.5 cursor-pointer bg-[#25D366] text-white hover:opacity-90 transition-opacity shadow-xs"
                title="Share formatted invite to WhatsApp"
              >
                <Share2 size={13} />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
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
            <span>{copiedLink ? "Link Copied to Clipboard" : "Copy Invite Link"}</span>
          </button>
        </div>
      </div>
    );
  }

  // ── View 3: Create a Challenge Form ──
  return (
    <form onSubmit={handleCreateChallenge} className="surface rounded-3xl p-7 sm:p-9 border shadow-sm space-y-7">
      {/* Top back button if challenges exist */}
      {localChallenges.length > 0 && (
        <button
          type="button"
          onClick={() => setView("list")}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>Back to My Challenges</span>
        </button>
      )}

      {/* Heading */}
      <div className="border-b pb-5" style={{ borderColor: "var(--border-dim)" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-8 h-8 rounded-xl bg-[var(--terra-bg)] border border-[var(--terra)]/20 text-[var(--terra)] flex items-center justify-center">
            <Swords size={16} />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--olive)]">
            Tournament Creator
          </span>
        </div>
        <h2 className="font-space font-extrabold text-2xl sm:text-3xl tracking-tight" style={{ color: "var(--text)" }}>
          Convene an Invitational Challenge
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
          Set your duration window, question pool, and invite friends to compete on an identical challenge deck.
        </p>
      </div>

      {/* Field 1: Challenge Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-mute)] mb-2">
          Challenge Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`e.g. ${profile?.username || "Scholar"}'s Independence Challenge`}
          className="w-full px-4 py-3.5 rounded-2xl border text-sm bg-[var(--bg-base)] focus:outline-none focus:border-[var(--olive)] transition-colors shadow-xs"
          style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
        />
      </div>

      {/* Field 2: Duration / Time Window */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-mute)] flex items-center gap-1.5">
            <Clock size={13} />
            <span>Challenge Duration</span>
          </label>
          <span className="text-[11px] font-mono text-[var(--text-dim)]">
            How long the challenge remains open
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {DURATION_CHOICES.map((opt) => (
            <button
              key={opt.hours}
              type="button"
              onClick={() => setDurationHours(opt.hours)}
              className={cn(
                "p-3 rounded-2xl border-2 text-center transition-all cursor-pointer",
                durationHours === opt.hours
                  ? "border-[var(--terra)] bg-[var(--terra-bg)] shadow-xs"
                  : "border-[var(--border-dim)] hover:border-[var(--border)] hover:bg-[var(--bg-card)]"
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

      {/* Field 3: Deck Size & Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-mute)] mb-2 flex items-center gap-1.5">
            <Target size={13} />
            <span>Questions in Deck</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[10, 15, 25].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={cn(
                  "py-2.5 px-3 rounded-xl border text-xs font-space font-bold transition-all cursor-pointer",
                  questionCount === count
                    ? "border-[var(--olive)] bg-[var(--olive)]/10 text-[var(--text)] shadow-xs"
                    : "border-[var(--border-dim)] text-[var(--text-mute)] hover:text-[var(--text)]"
                )}
              >
                {count} Questions
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
                    ? "border-[var(--gold)] bg-[var(--gold)]/10 font-bold text-[var(--text)] shadow-xs"
                    : "border-[var(--border-dim)] text-[var(--text-mute)] hover:text-[var(--text)]"
                )}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-3">
        <button
          type="submit"
          className="w-full py-4 rounded-2xl btn-terra font-space font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <span>Create &amp; Launch Challenge</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
