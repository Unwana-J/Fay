"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ArrowLeft } from "lucide-react";
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
  const { profile, triviaHistory = [] } = useAppStore();
  const [tab, setTab] = useState<"global" | "challenges" | "bests">("global");
  const [cloudScores, setCloudScores] = useState<CloudTriviaScore[]>([]);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Group challenges
  const [challenges, setChallenges] = useState<TriviaChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<TriviaChallenge | null>(null);
  const [challengeScores, setChallengeScores] = useState<ChallengeParticipantScore[]>([]);

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
          setChallengeScores(Array.from(mergedMap.values()).sort((a, b) => b.pct - a.pct || b.score - a.score));
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
              <div className="flex items-center gap-2">
                <h3 className="font-space font-extrabold text-base" style={{ color: "var(--text)" }}>
                  {userEntry.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[var(--olive)]/20 text-[#008751]">
                  You
                </span>
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
                High Score
              </span>
              <span className="font-space font-extrabold text-lg text-[var(--gold)]">
                {userEntry.bestPct > 0 ? `${userEntry.bestPct}%` : "—"}
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
                Trivia XP
              </span>
              <span className="font-space font-extrabold text-lg text-[#008751] flex items-center gap-0.5">
                ⚡ {userEntry.triviaXP}
              </span>
            </div>
          </div>
        </div>
      </div>

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
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn(
                  "p-4 flex items-center justify-between gap-3 transition-colors",
                  entry.isUser
                    ? "bg-[var(--olive)]/5"
                    : "hover:bg-[var(--bg-input)]/50"
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

                {/* Right: Scores */}
                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <div className="font-space font-extrabold text-base" style={{ color: "var(--text)" }}>
                      {entry.bestPct}%
                    </div>
                    <div className="text-[10px] font-semibold text-[var(--text-mute)]">
                      {entry.bestScore}/{entry.bestTotal} high
                    </div>
                  </div>
                  <div className="w-16">
                    <div className="font-mono text-xs font-bold text-[#008751] flex items-center justify-end gap-0.5">
                      ⚡ {entry.triviaXP}
                    </div>
                    <div className="text-[10px] font-semibold text-[var(--text-mute)]">
                      {entry.gamesPlayed} {entry.gamesPlayed === 1 ? "game" : "games"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
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
            <div className="surface rounded-2xl border overflow-hidden divide-y shadow-xs" style={{ borderColor: "var(--border-dim)" }}>
              {challengeScores.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-xs font-serif italic text-[var(--text-dim)]">
                    No scholars have completed this challenge yet.
                  </p>
                </div>
              ) : (
                challengeScores.map((s, idx) => {
                  const isUser = s.username.toLowerCase() === (profile?.username || "").toLowerCase();
                  return (
                    <div
                      key={s.id || s.username || idx}
                      className={cn(
                        "p-4 flex items-center justify-between gap-3 transition-colors",
                        isUser ? "bg-[var(--olive)]/5" : "hover:bg-[var(--bg-input)]/50"
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
                              {s.username}
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
            </div>
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
