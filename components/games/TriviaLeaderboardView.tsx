"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Zap,
  Target,
  ChevronRight,
  Flame,
  Swords,
  Crown,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getTriviaLeaderboard, type TriviaScholarEntry, type CloudTriviaScore } from "@/lib/trivia-leaderboard";
import UserAvatar from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";

interface TriviaLeaderboardViewProps {
  onPlay: () => void;
}

export default function TriviaLeaderboardView({ onPlay }: TriviaLeaderboardViewProps) {
  const { profile, triviaHistory = [] } = useAppStore();
  const [tab, setTab] = useState<"global" | "bests">("global");
  const [cloudScores, setCloudScores] = useState<CloudTriviaScore[]>([]);
  const [isLiveSync, setIsLiveSync] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  }, []);

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
      {/* User's Standing Hero Card */}
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
                <Zap size={15} /> {userEntry.triviaXP}
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
          <RefreshCw size={11} className={cn(isLoading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-[var(--bg-input)] border" style={{ borderColor: "var(--border-dim)" }}>
        <button
          onClick={() => setTab("global")}
          className={cn(
            "flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            tab === "global"
              ? "bg-[var(--bg-card)] text-[var(--text)] shadow-sm border border-[var(--border-dim)]"
              : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          <Crown size={13} className="text-[var(--gold)]" /> Global Scholars
        </button>
        <button
          onClick={() => setTab("bests")}
          className={cn(
            "flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
            tab === "bests"
              ? "bg-[var(--bg-card)] text-[var(--text)] shadow-sm border border-[var(--border-dim)]"
              : "text-[var(--text-mute)] hover:text-[var(--text)]"
          )}
        >
          <Sparkles size={13} className="text-[var(--olive)]" /> My Personal Bests
        </button>
      </div>

      {/* Global Leaderboard Tab */}
      {tab === "global" && (
        entries.length === 0 || (entries.length === 1 && entries[0].isUser && entries[0].gamesPlayed === 0) ? (
            <div className="surface rounded-2xl p-8 border text-center space-y-3" style={{ borderColor: "var(--border-dim)" }}>
              <div className="w-12 h-12 rounded-xl bg-[var(--olive)]/10 text-[var(--olive)] mx-auto flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <h4 className="font-space font-bold text-sm mb-1" style={{ color: "var(--text)" }}>
                  Leaderboard Awaits Its First Scholars
                </h4>
                <p className="text-xs max-w-sm mx-auto" style={{ color: "var(--text-dim)" }}>
                  Play a round or challenge your friends! As soon as anyone takes the quiz, their real score appears right here in real time.
                </p>
              </div>
            </div>
          ) : (
            <div className="surface rounded-2xl border overflow-hidden shadow-sm">
              <div className="divide-y" style={{ borderColor: "var(--border-dim)" }}>
            {entries.map((entry, idx) => {
              const isTopThree = (entry.rank || 0) <= 3;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={cn(
                    "p-4 flex items-center justify-between gap-3 transition-colors",
                    entry.isUser
                      ? "bg-[var(--olive)]/10 font-medium"
                      : "hover:bg-[var(--bg-input)]/50"
                  )}
                  style={{
                    borderLeft: entry.isUser
                      ? "4px solid #008751"
                      : "4px solid transparent",
                  }}
                >
                  {/* Left: Rank & Avatar & Identity */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div className="w-8 text-center shrink-0 font-space font-black text-sm">
                      {entry.rank === 1 && <span className="text-xl">🥇</span>}
                      {entry.rank === 2 && <span className="text-xl">🥈</span>}
                      {entry.rank === 3 && <span className="text-xl">🥉</span>}
                      {(entry.rank || 0) > 3 && (
                        <span className="text-xs text-[var(--text-mute)] font-mono">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <UserAvatar avatar={entry.avatar} size="md" />

                    {/* Name & Title */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-space font-bold text-xs truncate"
                          style={{ color: "var(--text)" }}
                        >
                          {entry.name}
                        </span>
                        {entry.isUser && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase bg-[#008751] text-white">
                            YOU
                          </span>
                        )}
                      </div>
                      <div
                        className="text-[11px] truncate"
                        style={{ color: "var(--text-mute)" }}
                      >
                        {entry.title}
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores & XP */}
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <div className="font-space font-extrabold text-sm" style={{ color: "var(--text)" }}>
                        {entry.bestPct}%
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>
                        {entry.bestScore}/{entry.bestTotal} high
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <div className="font-mono text-xs font-bold text-[#008751] flex items-center justify-end gap-1">
                        <Zap size={11} /> {entry.triviaXP}
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>
                        {entry.gamesPlayed} games
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </div>
          </div>
        )
      )}

      {/* Personal Bests Tab */}
      {tab === "bests" && (
        <div className="space-y-3">
          {personalBests.length === 0 ? (
            <div className="surface rounded-2xl p-8 border text-center space-y-2">
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                You have not completed any trivia games yet. Play a round to establish your personal records!
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
                  <div className="w-8 h-8 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] flex items-center justify-center font-space font-bold text-xs">
                    #{i + 1}
                  </div>
                  <div>
                    <div className="font-space font-bold text-sm" style={{ color: "var(--text)" }}>
                      {run.score}/{run.total} ({run.pct}%)
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--text-mute)" }}>
                      {run.gradeLabel} · {run.durationMinutes} min
                    </div>
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-[#008751] flex items-center gap-1">
                  <Zap size={12} /> +{run.xpEarned} XP
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Climb Ranks Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onPlay}
        className="w-full py-4 rounded-2xl btn-terra font-space font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
      >
        Play Trivia to Climb the Leaderboard <ChevronRight size={16} />
      </motion.button>
    </div>
  );
}
