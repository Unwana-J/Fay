"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ArrowLeft, ChevronDown, ChevronUp, User, ShieldCheck, Sparkles, Flame } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getTriviaLeaderboard, type CloudTriviaScore } from "@/lib/trivia-leaderboard";
import {
  type TriviaChallenge,
  type ChallengeParticipantScore,
  getAllLocalChallenges,
  getChallengeTimeStatus,
  getLocalChallengeScores,
} from "@/lib/trivia-challenge";
import UserAvatar from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";

interface TriviaLeaderboardViewProps {
  onPlay: () => void;
}

export default function TriviaLeaderboardView({ onPlay }: TriviaLeaderboardViewProps) {
  const { profile, triviaHistory = [], openClaimAccountPrompt } = useAppStore();
  const [tab, setTab] = useState<"global" | "challenges" | "bests">("global");
  const [cloudScores, setCloudScores] = useState<CloudTriviaScore[]>([]);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Group challenges
  const [challenges, setChallenges] = useState<TriviaChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<TriviaChallenge | null>(null);
  const [challengeScores, setChallengeScores] = useState<ChallengeParticipantScore[]>([]);

  const INITIAL_LIMIT = 10;
  const [isExpandedGlobal, setIsExpandedGlobal] = useState(false);
  const [isExpandedChallenge, setIsExpandedChallenge] = useState(false);
  const [highlightGlobalUserId, setHighlightGlobalUserId] = useState<string | null>(null);
  const [highlightChallengeId, setHighlightChallengeId] = useState<string | null>(null);

  function handleJumpToUserGlobal() {
    setIsExpandedGlobal(true);
    setTimeout(() => {
      const el = document.getElementById("global-user-row");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightGlobalUserId("user-current");
        setTimeout(() => setHighlightGlobalUserId(null), 2500);
      }
    }, 120);
  }

  function handleJumpToUserChallenge() {
    setIsExpandedChallenge(true);
    setTimeout(() => {
      const el = document.getElementById("challenge-board-user-row");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightChallengeId(profile?.username || "current-user");
        setTimeout(() => setHighlightChallengeId(null), 2500);
      }
    }, 120);
  }

  function fetchLeaderboard() {
    setIsLoading(true);
    fetch("/api/trivia/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.configured) {
          setIsLiveSync(true);
        }
        if (Array.isArray(data.scores)) {
          setCloudScores(data.scores);
        }
      })
      .catch((err) => console.warn("Could not load cloud leaderboard:", err))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchLeaderboard();
    setChallenges(getAllLocalChallenges());
  }, []);

  // Fetch scores when selectedChallenge changes
  useEffect(() => {
    if (!selectedChallenge) return;
    const local = getLocalChallengeScores(selectedChallenge.id);

    const qIds = selectedChallenge.questionIds?.join(",") || "";
    const params = new URLSearchParams();
    params.set("challengeId", selectedChallenge.id);
    if (qIds) params.set("qIds", qIds);

    fetch(`/api/trivia/leaderboard?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.configured && Array.isArray(data.scores) && data.scores.length > 0) {
          const cloudScores: ChallengeParticipantScore[] = data.scores.map((cs: any) => ({
            id: cs.id,
            username: cs.username,
            avatar: cs.avatar || "/avatars/avatar-scholar.svg",
            score: cs.score,
            total: cs.total,
            pct: cs.pct,
            gradeLabel: cs.grade_label,
            completedAt: new Date(cs.created_at).getTime(),
          }));

          // Sync local storage so stale or renamed player names are purged
          try {
            if (typeof window !== "undefined") {
              const key = `fey_tc_${selectedChallenge.id}_scores`;
              localStorage.setItem(key, JSON.stringify(cloudScores));
            }
          } catch {}

          setChallengeScores(cloudScores.sort((a, b) => b.pct - a.pct || b.score - a.score));
        } else {
          setChallengeScores(local);
        }
      })
      .catch(() => setChallengeScores(local));
  }, [selectedChallenge]);

  const { entries, userEntry, userRank } = getTriviaLeaderboard(profile, triviaHistory, cloudScores);

  // User's personal best runs (top 5 by pct and score)
  const personalBests = [...triviaHistory]
    .sort((a, b) => {
      if (b.pct !== a.pct) return b.pct - a.pct;
      return b.score - a.score;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* User Standing Hero Card */}
      <div
        className="rounded-2xl p-5 border relative overflow-hidden shadow-sm"
        style={{
          background: "linear-gradient(135deg, rgba(0, 135, 81, 0.12) 0%, rgba(166, 124, 30, 0.08) 100%)",
          borderColor: "rgba(0, 135, 81, 0.3)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <UserAvatar avatar={userEntry.avatar} size="lg" />
              <div
                className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold border"
                style={{
                  background: userRank <= 3 ? "var(--gold)" : "var(--bg-card)",
                  color: userRank <= 3 ? "#000" : "var(--text)",
                  borderColor: "var(--border)",
                }}
              >
                #{userRank}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-space font-extrabold text-base" style={{ color: "var(--text)" }}>
                  {userEntry.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[var(--olive)]/20 text-[#008751]">
                  You
                </span>
                {!profile?.hasClaimedAccount && (
                  <button
                    onClick={openClaimAccountPrompt}
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer flex items-center gap-1"
                    title="Link free account to track your daily streak & ranking across devices"
                  >
                    <Flame size={11} className="text-amber-500 animate-pulse" /> Track Streak →
                  </button>
                )}
              </div>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                {userEntry.title}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-left sm:text-right">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)] block">
                Trivia XP
              </span>
              <span className="font-space font-extrabold text-lg text-[#008751] flex items-center gap-0.5">
                ⚡ {userEntry.triviaXP}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)] block">
                Total Games
              </span>
              <span className="font-space font-extrabold text-lg" style={{ color: "var(--text)" }}>
                {userEntry.gamesPlayed}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)] block">
                High Run
              </span>
              <span className="font-space font-extrabold text-lg text-[var(--gold)]">
                {userEntry.bestPct > 0 ? `${userEntry.bestPct}%` : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Leaderboard Notice */}
      {!profile?.hasClaimedAccount && (
        <div
          className="rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
          style={{
            background: "rgba(166, 124, 30, 0.08)",
            borderColor: "rgba(166, 124, 30, 0.3)",
            color: "var(--text)",
          }}
        >
          <div className="flex items-start sm:items-center gap-2.5">
            <span className="text-base shrink-0">⚠️</span>
            <div className="space-y-0.5">
              <div className="font-space font-bold text-xs" style={{ color: "var(--text)" }}>
                Track Your Daily Streak &amp; Rank
              </div>
              <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                Your standing as @{profile?.username || "Scholar"} is saved only in this browser. Link a free account to track your daily streak and lock your position on the Titan Leaderboard.
              </p>
            </div>
          </div>
          <button
            onClick={openClaimAccountPrompt}
            className="btn-terra px-3.5 py-2 rounded-xl text-xs font-space font-bold whitespace-nowrap self-start sm:self-auto cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <Flame size={13} className="text-amber-300 animate-pulse" />
            <span>Track Streak →</span>
          </button>
        </div>
      )}

      {/* Live sync indicator & Refresh */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isLiveSync ? "bg-green-500 animate-pulse" : "bg-[var(--gold)]"
            )}
          />
          <span className="text-[11px] font-semibold text-[var(--text-mute)]">
            {isLiveSync ? "Live Cloud Leaderboard" : "Community Standings"}
          </span>
        </div>
        <button
          onClick={fetchLeaderboard}
          disabled={isLoading}
          className="text-[11px] text-[var(--text-mute)] hover:text-[var(--text)] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>🔄 Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 rounded-xl bg-[var(--bg-input)] border" style={{ borderColor: "var(--border-dim)" }}>
        <button
          onClick={() => {
            setTab("global");
            setSelectedChallenge(null);
          }}
          className={cn(
            "flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5",
            tab === "global"
              ? "bg-[var(--bg-card)] text-[var(--text)] shadow-xs border border-[var(--border-dim)]"
              : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          <span>👑</span> Global Scholars
        </button>
        <button
          onClick={() => setTab("challenges")}
          className={cn(
            "flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5",
            tab === "challenges"
              ? "bg-[var(--bg-card)] text-[var(--text)] shadow-xs border border-[var(--border-dim)]"
              : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          <span>⚔️</span> Group Challenges ({challenges.length})
        </button>
        <button
          onClick={() => {
            setTab("bests");
            setSelectedChallenge(null);
          }}
          className={cn(
            "flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5",
            tab === "bests"
              ? "bg-[var(--bg-card)] text-[var(--text)] shadow-xs border border-[var(--border-dim)]"
              : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          <span>❇️</span> My Personal Bests
        </button>
      </div>

      {/* Ranking rule banner */}
      {tab === "global" && (
        <div className="p-3 rounded-xl bg-[var(--olive)]/10 border border-[var(--olive)]/20 text-xs flex items-center gap-2 text-[var(--text-dim)]">
          <span className="text-base">🏆</span>
          <span>
            <strong>Global Standing:</strong> Ranked primarily by <strong>Total Trivia XP</strong> accumulated across games and unique rounds completed. Single-trial group challenges award <strong>2.5x XP multipliers</strong>!
          </span>
        </div>
      )}

      {/* Tab 1: Global Leaderboard */}
      {tab === "global" && (
        entries.length === 0 || (entries.length === 1 && entries[0].isUser && entries[0].gamesPlayed === 0) ? (
          <div className="surface rounded-2xl p-8 border text-center space-y-2" style={{ borderColor: "var(--border-dim)" }}>
            <div className="text-[10px] font-mono uppercase tracking-widest font-bold text-[var(--olive)]">
              Empty Standings
            </div>
            <h4 className="font-serif font-extrabold text-base" style={{ color: "var(--text)" }}>
              Leaderboard Awaits Its First Scholars
            </h4>
            <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--text-dim)" }}>
              Play a round or convene a challenge. As soon as scholars complete questions, their verified scores appear here.
            </p>
          </div>
        ) : (
          <div className="surface rounded-2xl border overflow-hidden divide-y shadow-xs" style={{ borderColor: "var(--border-dim)" }}>
            {/* Table Column Headers */}
            <div className="px-4 py-2.5 bg-[var(--bg-input)]/40 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-mute)] border-b border-[var(--border-dim)]">
              <div className="flex items-center gap-2">
                <span>Scholar &amp; Title</span>
                {entries.length > INITIAL_LIMIT && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text-dim)] font-mono font-normal">
                    {isExpandedGlobal ? `All ${entries.length}` : `Top 10 of ${entries.length}`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {userRank > 0 && (
                  <button
                    type="button"
                    onClick={handleJumpToUserGlobal}
                    className="text-[10px] normal-case font-space font-bold px-2.5 py-0.5 rounded-full bg-[var(--olive)]/15 text-[#008751] hover:bg-[var(--olive)]/25 transition-colors cursor-pointer flex items-center gap-1 border border-[var(--olive)]/30"
                    title="Jump directly to your rank"
                  >
                    <User size={10} />
                    <span>View You (#{userRank})</span>
                  </button>
                )}
                <div className="flex items-center gap-4 sm:gap-6 text-right">
                  <span className="w-20">Accumulated XP</span>
                  <span className="w-16">High Run</span>
                </div>
              </div>
            </div>

            {/* Render Top 10 (or all when expanded) */}
            {(isExpandedGlobal ? entries : entries.slice(0, INITIAL_LIMIT)).map((entry, idx) => {
              const isHighlighted = highlightGlobalUserId === "user-current" && entry.isUser;

              return (
                <motion.div
                  key={entry.id}
                  id={entry.isUser ? "global-user-row" : undefined}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                  className={cn(
                    "p-4 flex items-center justify-between gap-3 transition-all",
                    entry.isUser
                      ? "bg-[var(--olive)]/5"
                      : "hover:bg-[var(--bg-input)]/50",
                    isHighlighted && "ring-2 ring-[#008751] bg-[var(--olive)]/20 shadow-md"
                  )}
                  style={{
                    borderLeft: entry.isUser
                      ? "4px solid var(--olive)"
                      : "4px solid transparent",
                  }}
                >
                  {/* Left: Rank & Avatar & Identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 text-center shrink-0">
                      {entry.rank === 1 ? (
                        <span className="text-xl">🥇</span>
                      ) : entry.rank === 2 ? (
                        <span className="text-xl">🥈</span>
                      ) : entry.rank === 3 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="font-space font-bold text-xs text-[var(--text-mute)]">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    <UserAvatar avatar={entry.avatar} size="md" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-space font-bold text-sm truncate" style={{ color: "var(--text)" }}>
                          {entry.name}
                        </span>
                        {entry.isUser && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[var(--olive)]/20 text-[#008751]">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs truncate" style={{ color: "var(--text-mute)" }}>
                        {entry.title}
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores (XP First, Accuracy Second) */}
                  <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                    <div className="w-20">
                      <div className="font-mono text-sm sm:text-base font-extrabold text-[#008751] flex items-center justify-end gap-0.5">
                        ⚡ {entry.triviaXP}
                      </div>
                      <div className="text-[10px] font-semibold text-[var(--text-mute)]">
                        {entry.gamesPlayed} {entry.gamesPlayed === 1 ? "game" : "games"}
                      </div>
                    </div>
                    <div className="w-16">
                      <div className="font-space font-extrabold text-sm sm:text-base" style={{ color: "var(--text)" }}>
                        {entry.bestPct}%
                      </div>
                      <div className="text-[10px] font-semibold text-[var(--text-mute)]">
                        {entry.bestScore}/{entry.bestTotal} high
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* If collapsed and user is outside Top 10, pin user standing preview */}
            {!isExpandedGlobal && userRank > INITIAL_LIMIT && (
              <>
                <div className="px-4 py-2 bg-[var(--bg-input)]/40 text-center text-[10px] font-mono text-[var(--text-dim)] flex items-center justify-center gap-3">
                  <div className="h-px bg-[var(--border-dim)] flex-1" />
                  <span>
                    ··· {userRank - INITIAL_LIMIT - 1 > 0 ? `${userRank - INITIAL_LIMIT - 1} more scholars · ` : ""}your rank (#{userRank}) ···
                  </span>
                  <div className="h-px bg-[var(--border-dim)] flex-1" />
                </div>

                <div
                  id="global-user-row"
                  className={cn(
                    "p-4 flex items-center justify-between gap-3 bg-[var(--olive)]/5 transition-all",
                    highlightGlobalUserId === "user-current" && "ring-2 ring-[#008751] bg-[var(--olive)]/20 shadow-md"
                  )}
                  style={{
                    borderLeft: "4px solid var(--olive)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 text-center shrink-0">
                      <span className="font-space font-bold text-xs text-[var(--text-mute)]">
                        #{userRank}
                      </span>
                    </div>

                    <UserAvatar avatar={userEntry.avatar} size="md" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-space font-bold text-sm truncate" style={{ color: "var(--text)" }}>
                          {userEntry.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[var(--olive)]/20 text-[#008751]">
                          You
                        </span>
                      </div>
                      <div className="text-xs truncate" style={{ color: "var(--text-mute)" }}>
                        {userEntry.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                    <div className="w-20">
                      <div className="font-mono text-sm sm:text-base font-extrabold text-[#008751] flex items-center justify-end gap-0.5">
                        ⚡ {userEntry.triviaXP}
                      </div>
                      <div className="text-[10px] font-semibold text-[var(--text-mute)]">
                        {userEntry.gamesPlayed} {userEntry.gamesPlayed === 1 ? "game" : "games"}
                      </div>
                    </div>
                    <div className="w-16">
                      <div className="font-space font-extrabold text-sm sm:text-base" style={{ color: "var(--text)" }}>
                        {userEntry.bestPct}%
                      </div>
                      <div className="text-[10px] font-semibold text-[var(--text-mute)]">
                        {userEntry.bestScore}/{userEntry.bestTotal} high
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* View More / Show Top 10 Toggle */}
            {entries.length > INITIAL_LIMIT && (
              <button
                type="button"
                onClick={() => setIsExpandedGlobal((prev) => !prev)}
                className="w-full py-3 px-4 bg-[var(--bg-card)]/40 hover:bg-[var(--bg-input)] text-xs font-space font-bold text-[var(--text)] flex items-center justify-center gap-2 cursor-pointer transition-colors border-t border-[var(--border-dim)]"
              >
                {isExpandedGlobal ? (
                  <>
                    <ChevronUp size={14} />
                    <span>Show Top 10 Only</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    <span>View More ({entries.length - INITIAL_LIMIT} more scholars)</span>
                  </>
                )}
              </button>
            )}
          </div>
        )
      )}

      {/* Tab 2: Group Challenges Custom Leaderboards */}
      {tab === "challenges" && (
        selectedChallenge ? (
          /* Single Challenge Custom Board */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>All Group Challenges</span>
              </button>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/games/trivia?challenge=${encodeURIComponent(selectedChallenge.id)}`;
                  navigator.clipboard.writeText(url);
                  alert("Challenge link copied to clipboard!");
                }}
                className="px-3 py-1.5 rounded-lg border text-xs font-space font-bold cursor-pointer hover:bg-[var(--bg-card)] transition-colors"
                style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
              >
                Share Link
              </button>
            </div>

            {/* Challenge Banner Plaque */}
            <div
              className="rounded-2xl p-5 border relative overflow-hidden shadow-sm"
              style={{
                background: "linear-gradient(135deg, rgba(0, 135, 81, 0.12) 0%, rgba(166, 124, 30, 0.08) 100%)",
                borderColor: "rgba(0, 135, 81, 0.3)",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      {getChallengeTimeStatus(selectedChallenge).fullStatusText}
                    </span>
                    <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text-dim)]">
                      {selectedChallenge.difficulty} Mode
                    </span>
                  </div>
                  <h3 className="font-space font-extrabold text-xl" style={{ color: "var(--text)" }}>
                    {selectedChallenge.title}
                  </h3>
                  <p className="text-xs text-[var(--text-dim)] mt-0.5">
                    Convened by <strong>Scholar {selectedChallenge.creatorName}</strong> · {selectedChallenge.questionCount} Questions · {challengeScores.length} Competing
                  </p>
                </div>
              </div>
            </div>

            {/* Standings Table Styled exactly like Global Leaderboard */}
            {(() => {
              const challengeUserIdx = challengeScores.findIndex((s) =>
                Boolean(
                  (profile?.username && s.username.toLowerCase() === profile.username.toLowerCase()) ||
                  (profile?.id && s.id && (s.id.includes(profile.id) || s.id === profile.id))
                )
              );
              const visibleChallengeScores = isExpandedChallenge ? challengeScores : challengeScores.slice(0, INITIAL_LIMIT);
              const showChallengeUserSeparately = !isExpandedChallenge && challengeUserIdx >= INITIAL_LIMIT;
              const userChallengeScore = challengeUserIdx >= 0 ? challengeScores[challengeUserIdx] : null;

              return (
                <div className="surface rounded-2xl border overflow-hidden divide-y shadow-xs" style={{ borderColor: "var(--border-dim)" }}>
                  {challengeScores.length > 0 && (
                    <div className="px-4 py-2.5 bg-[var(--bg-input)]/40 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-mute)] border-b border-[var(--border-dim)]">
                      <div className="flex items-center gap-2">
                        <span>Contender &amp; Rank</span>
                        {challengeScores.length > INITIAL_LIMIT && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text-dim)] font-mono font-normal">
                            {isExpandedChallenge ? `All ${challengeScores.length}` : `Top 10 of ${challengeScores.length}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {challengeUserIdx >= 0 && (
                          <button
                            type="button"
                            onClick={handleJumpToUserChallenge}
                            className="text-[10px] normal-case font-space font-bold px-2.5 py-0.5 rounded-full bg-[var(--olive)]/15 text-[#008751] hover:bg-[var(--olive)]/25 transition-colors cursor-pointer flex items-center gap-1 border border-[var(--olive)]/30"
                            title="Jump directly to your score"
                          >
                            <User size={10} />
                            <span>View You (#{challengeUserIdx + 1})</span>
                          </button>
                        )}
                        <span className="text-right">Accuracy &amp; Score</span>
                      </div>
                    </div>
                  )}

                  {challengeScores.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <p className="text-xs font-serif italic text-[var(--text-dim)]">
                        No scholars have completed this challenge yet.
                      </p>
                    </div>
                  ) : (
                    visibleChallengeScores.map((s, idx) => {
                      const isUser = Boolean(
                        (profile?.username && s.username.toLowerCase() === profile.username.toLowerCase()) ||
                        (profile?.id && s.id && (s.id.includes(profile.id) || s.id === profile.id))
                      );
                      const displayName = isUser && profile?.username ? profile.username : s.username;
                      const isHighlighted = isUser && highlightChallengeId !== null;

                      return (
                        <div
                          key={s.id || s.username || idx}
                          id={isUser ? "challenge-board-user-row" : undefined}
                          className={cn(
                            "p-4 flex items-center justify-between gap-3 transition-all",
                            isUser ? "bg-[var(--olive)]/5" : "hover:bg-[var(--bg-input)]/50",
                            isHighlighted && "ring-2 ring-[#008751] bg-[var(--olive)]/20 shadow-md"
                          )}
                          style={{
                            borderLeft: isUser ? "4px solid var(--olive)" : "4px solid transparent",
                          }}
                        >
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
                                  {displayName}
                                </span>
                                {isUser && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[var(--olive)]/20 text-[#008751]">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs truncate" style={{ color: "var(--text-mute)" }}>
                                {s.gradeLabel || "Scholar"}
                              </div>
                            </div>
                          </div>

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
                    })
                  )}

                  {/* Pinned User Standing if outside Top 10 */}
                  {showChallengeUserSeparately && userChallengeScore && (
                    <>
                      <div className="px-4 py-2 bg-[var(--bg-input)]/40 text-center text-[10px] font-mono text-[var(--text-dim)] flex items-center justify-center gap-3">
                        <div className="h-px bg-[var(--border-dim)] flex-1" />
                        <span>
                          ··· {challengeUserIdx - INITIAL_LIMIT > 0 ? `${challengeUserIdx - INITIAL_LIMIT} more scholars · ` : ""}your rank (#{challengeUserIdx + 1}) ···
                        </span>
                        <div className="h-px bg-[var(--border-dim)] flex-1" />
                      </div>

                      <div
                        id="challenge-board-user-row"
                        className={cn(
                          "p-4 flex items-center justify-between gap-3 bg-[var(--olive)]/5 transition-all",
                          highlightChallengeId !== null && "ring-2 ring-[#008751] bg-[var(--olive)]/20 shadow-md"
                        )}
                        style={{
                          borderLeft: "4px solid var(--olive)",
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 text-center shrink-0">
                            <span className="font-space font-bold text-xs text-[var(--text-mute)]">
                              #{challengeUserIdx + 1}
                            </span>
                          </div>

                          <UserAvatar avatar={userChallengeScore.avatar} size="md" />

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-space font-bold text-sm truncate" style={{ color: "var(--text)" }}>
                                {profile?.username || userChallengeScore.username}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-[var(--olive)]/20 text-[#008751]">
                                You
                              </span>
                            </div>
                            <div className="text-xs truncate" style={{ color: "var(--text-mute)" }}>
                              {userChallengeScore.gradeLabel || "Scholar"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right shrink-0">
                          <div>
                            <div className="font-space font-extrabold text-base" style={{ color: "var(--text)" }}>
                              {userChallengeScore.pct}%
                            </div>
                            <div className="text-[10px] font-semibold text-[var(--text-mute)]">
                              {userChallengeScore.score}/{userChallengeScore.total} score
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* View More / Show Top 10 Toggle */}
                  {challengeScores.length > INITIAL_LIMIT && (
                    <button
                      type="button"
                      onClick={() => setIsExpandedChallenge((prev) => !prev)}
                      className="w-full py-3 px-4 bg-[var(--bg-card)]/40 hover:bg-[var(--bg-input)] text-xs font-space font-bold text-[var(--text)] flex items-center justify-center gap-2 cursor-pointer transition-colors border-t border-[var(--border-dim)]"
                    >
                      {isExpandedChallenge ? (
                        <>
                          <ChevronUp size={14} />
                          <span>Show Top 10 Only</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          <span>View More ({challengeScores.length - INITIAL_LIMIT} more scholars)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          /* List of all user's group challenges */
          <div className="space-y-3">
            {challenges.length === 0 ? (
              <div className="surface rounded-2xl p-8 border text-center space-y-3" style={{ borderColor: "var(--border-dim)" }}>
                <p className="font-serif italic text-base text-[var(--text-dim)]">
                  No active or past group challenge leaderboards found.
                </p>
                <p className="text-xs text-[var(--text-mute)] max-w-sm mx-auto">
                  Start an invitational challenge from the Challenges tab to track custom friend rankings.
                </p>
              </div>
            ) : (
              challenges.map((c) => {
                const status = getChallengeTimeStatus(c);
                const cScores = getLocalChallengeScores(c.id);

                return (
                  <div
                    key={c.id}
                    className="surface rounded-2xl p-4 border flex items-center justify-between gap-4 transition-all hover:shadow-xs"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            status.isExpired ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                          )}
                        />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--olive)]">
                          {status.fullStatusText}
                        </span>
                      </div>
                      <h4 className="font-space font-bold text-base" style={{ color: "var(--text)" }}>
                        {c.title}
                      </h4>
                      <p className="text-xs text-[var(--text-mute)]">
                        Host: Scholar {c.creatorName} · {cScores.length} {cScores.length === 1 ? "Contender" : "Contenders"}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedChallenge(c)}
                      className="px-3.5 py-2 rounded-xl border text-xs font-space font-bold cursor-pointer hover:bg-[var(--bg-card)] transition-colors shrink-0"
                      style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                    >
                      View Board →
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )
      )}

      {/* Tab 3: Personal Bests */}
      {tab === "bests" && (
        <div className="space-y-3">
          {personalBests.length === 0 ? (
            <div className="surface rounded-2xl p-8 border text-center space-y-2" style={{ borderColor: "var(--border-dim)" }}>
              <p className="text-xs font-mono text-[var(--text-mute)]">
                You have not completed any trivia games yet. Play a round to establish your personal records.
              </p>
            </div>
          ) : (
            personalBests.map((run, i) => (
              <div
                key={run.id || i}
                className="surface rounded-xl p-4 border flex items-center justify-between gap-3"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center font-mono font-bold text-xs">
                    #{i + 1}
                  </div>
                  <div>
                    <div className="font-space font-bold text-sm" style={{ color: "var(--text)" }}>
                      {run.score}/{run.total} ({run.pct}%)
                    </div>
                    <div className="text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>
                      {run.gradeLabel} · {run.durationMinutes} min
                    </div>
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-[var(--olive)]">
                  +{run.xpEarned} XP
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Primary Climb Action */}
      <button
        onClick={onPlay}
        className="w-full py-4 rounded-2xl btn-terra font-space font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
      >
        <span>Play Trivia to Climb the Leaderboard</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
