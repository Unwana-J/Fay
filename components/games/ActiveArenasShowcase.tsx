"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy,
  Swords,
  Zap,
  Clock,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Plus,
  Users,
  CheckCircle2,
  Flame,
  Crown,
  Gamepad2,
  Presentation,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import {
  getAllLocalLeagues,
  computeUserLeagueSummary,
  saveLocalLeague,
  getDeletedLocalLeagues,
  type FriendshipLeague,
} from "@/lib/trivia-league";
import {
  getAllLocalChallenges,
  getPublicChallenges,
  getDetailedChallengeCountdown,
  getUserChallengeAttempt,
  type TriviaChallenge,
} from "@/lib/trivia-challenge";
import { cn } from "@/lib/utils";
import NewGameActionModal from "@/components/games/NewGameActionModal";
import CreateLeagueModal from "@/components/trivia/CreateLeagueModal";

interface ActiveArenasShowcaseProps {
  onTabChange?: (tab: "solo" | "league" | "challenge" | "leaderboard" | "history") => void;
  onStartChallenge?: (challenge: TriviaChallenge) => void;
  onCreateLeague?: () => void;
  onCreateChallenge?: () => void;
  showParlorLinks?: boolean;
  className?: string;
}

export default function ActiveArenasShowcase({
  onTabChange,
  onStartChallenge,
  onCreateLeague,
  onCreateChallenge,
  showParlorLinks = true,
  className,
}: ActiveArenasShowcaseProps) {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);

  const [leagues, setLeagues] = useState<FriendshipLeague[]>([]);
  const [challenges, setChallenges] = useState<TriviaChallenge[]>([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCreateLeagueModal, setShowCreateLeagueModal] = useState(false);

  // 1. Refresh leagues & sync from cloud
  useEffect(() => {
    const list = getAllLocalLeagues();
    setLeagues(list);

    if (profile.id || profile.username) {
      const q = new URLSearchParams();
      if (profile.id) q.set("userId", profile.id);
      if (profile.username) q.set("username", profile.username);

      fetch(`/api/trivia/league?${q.toString()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.leagues && Array.isArray(data.leagues)) {
            const deleted = getDeletedLocalLeagues();
            data.leagues.forEach((l: FriendshipLeague) => {
              if (!deleted.includes(l.code.toUpperCase())) {
                saveLocalLeague(l);
              }
            });
            setLeagues(getAllLocalLeagues());
          }
        })
        .catch(() => {});
    }
  }, [profile.id, profile.username]);

  // 2. Load challenges (local + public)
  useEffect(() => {
    const local = getAllLocalChallenges();
    const pub = getPublicChallenges();
    const map = new Map<string, TriviaChallenge>();
    pub.forEach((c) => map.set(c.id, c));
    local.forEach((c) => map.set(c.id, c));
    setChallenges(Array.from(map.values()));
  }, []);

  // Compute active leagues with user summaries
  const activeLeagues = useMemo(() => {
    return leagues
      .map((league) => {
        const summary = computeUserLeagueSummary(
          league,
          profile.id,
          profile.username || "Scholar"
        );
        return { league, summary };
      })
      .filter(({ summary }) => summary.status.isActive || summary.status.isUpcoming);
  }, [leagues, profile.id, profile.username]);

  // Leagues where today's quiz drop has NOT been completed
  const pendingDailyDrops = useMemo(() => {
    return activeLeagues.filter(
      ({ summary }) => summary.status.isActive && !summary.hasCompletedToday
    );
  }, [activeLeagues]);

  // Active challenges that have not expired
  const activeChallenges = useMemo(() => {
    return challenges
      .map((c) => {
        const countdown = getDetailedChallengeCountdown(c);
        const attempt = getUserChallengeAttempt(c.id, profile.username || "");
        return { challenge: c, countdown, attempt };
      })
      .filter(({ countdown }) => !countdown.isExpired);
  }, [challenges, profile.username]);

  const totalActiveCompetitions = activeLeagues.length + activeChallenges.length;

  function handleLeagueClick(code: string) {
    router.push(`/games/trivia/league/${code}`);
  }

  function handleChallengePlay(c: TriviaChallenge) {
    if (onStartChallenge) {
      onStartChallenge(c);
    } else {
      router.push(`/games/trivia?challenge=${encodeURIComponent(c.id)}`);
    }
  }

  return (
    <div className={cn("space-y-4 mb-6", className)}>
      {/* ── Active Arenas Section ── */}
      {totalActiveCompetitions > 0 ? (
        <div
          className="rounded-3xl p-5 sm:p-6 border relative overflow-hidden shadow-xs"
          style={{
            borderColor: pendingDailyDrops.length > 0 ? "var(--terra)" : "var(--border-dim)",
            background:
              pendingDailyDrops.length > 0
                ? "linear-gradient(135deg, rgba(188, 108, 37, 0.12) 0%, rgba(221, 161, 94, 0.08) 100%)"
                : "var(--bg-card)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--terra)] shrink-0" />
              <span className="font-space font-extrabold text-sm sm:text-base text-[var(--text)] tracking-tight">
                Live Arenas &amp; Active Competitions
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--terra)]/15 text-[var(--terra)] font-bold border border-[var(--terra)]/30">
                {totalActiveCompetitions} Active
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowActionModal(true)}
                className="btn-terra px-3 py-1.5 rounded-xl font-space font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                title="Create League, Challenge, or Solo"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>Create</span>
              </button>

              {onTabChange && (
                <>
                  {activeLeagues.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onTabChange("league")}
                      className="text-xs font-mono font-bold text-[var(--terra)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Leagues ({activeLeagues.length})</span>
                      <ChevronRight size={13} />
                    </button>
                  )}
                  {activeChallenges.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onTabChange("challenge")}
                      className="text-xs font-mono font-bold text-[var(--olive)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Challenges ({activeChallenges.length})</span>
                      <ChevronRight size={13} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Leagues with Pending Daily Drops (Top Priority) */}
            {pendingDailyDrops.slice(0, 2).map(({ league, summary }) => (
              <div
                key={league.code}
                onClick={() => handleLeagueClick(league.code)}
                className="p-4 rounded-2xl border surface flex flex-col justify-between gap-3 cursor-pointer hover:scale-[1.01] hover:shadow-sm transition-all relative group"
                style={{ borderColor: "rgba(188, 108, 37, 0.4)" }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[var(--terra)] text-white uppercase tracking-wider">
                      <Zap size={11} /> Day {summary.status.dayNumber} of {league.durationDays} Drop
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[var(--text-dim)]">
                      Code: {league.code}
                    </span>
                  </div>

                  <h4 className="font-space font-bold text-base text-[var(--text)] group-hover:text-[var(--terra)] transition-colors line-clamp-1">
                    {league.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                    Hosted by @{league.creatorName} • {league.questionsPerDay} Qs daily
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-dim)]">
                  <span className="text-[10px] font-mono font-bold text-[var(--terra)] inline-flex items-center gap-1">
                    <Flame size={12} /> Today&apos;s Quiz Ready
                  </span>
                  <div className="btn-terra px-3.5 py-1.5 rounded-xl font-space font-bold text-xs shadow-xs">
                    <span>Play Drop</span>
                  </div>
                </div>
              </div>
            ))}

            {/* 2. Other Active Leagues (already completed today) */}
            {activeLeagues
              .filter(({ summary }) => summary.status.isActive && summary.hasCompletedToday)
              .slice(0, pendingDailyDrops.length > 0 ? 1 : 2)
              .map(({ league, summary }) => (
                <div
                  key={league.code}
                  onClick={() => handleLeagueClick(league.code)}
                  className="p-4 rounded-2xl border surface flex flex-col justify-between gap-3 cursor-pointer hover:scale-[1.01] hover:shadow-sm transition-all relative group"
                  style={{ borderColor: "var(--border-dim)" }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 size={11} /> Day {summary.status.dayNumber} Completed
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[var(--text-dim)]">
                        Code: {league.code}
                      </span>
                    </div>

                    <h4 className="font-space font-bold text-base text-[var(--text)] group-hover:text-[var(--terra)] transition-colors line-clamp-1">
                      {league.title}
                    </h4>
                    <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                      {summary.userDaysCompleted > 0 ? (
                        <span className="font-semibold text-[var(--text)] inline-flex items-center gap-1">
                          <Crown size={11} className="text-amber-500" />
                          Rank #{summary.userRank} • {summary.userTotalPoints} total pts
                        </span>
                      ) : (
                        `Hosted by @${league.creatorName}`
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-dim)]">
                    <span className="text-[10px] font-mono text-[var(--text-dim)]">
                      Midnight drop resets next round
                    </span>
                    <div className="btn-secondary px-3 py-1.5 rounded-xl font-space font-bold text-xs">
                      <span>View</span>
                    </div>
                  </div>
                </div>
              ))}

            {/* 3. Active 1v1 / Group Challenges */}
            {activeChallenges.slice(0, 2).map(({ challenge, countdown, attempt }) => (
              <div
                key={challenge.id}
                onClick={() => handleChallengePlay(challenge)}
                className="p-4 rounded-2xl border surface flex flex-col justify-between gap-3 cursor-pointer hover:scale-[1.01] hover:shadow-sm transition-all relative group"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[var(--olive)]/15 text-[var(--olive)] border border-[var(--olive)]/30">
                      <Swords size={11} /> 1v1 Challenge
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-dim)] flex items-center gap-1">
                      <Clock size={10} />
                      {countdown.isIndefinite ? "Open" : countdown.remainingText}
                    </span>
                  </div>

                  <h4 className="font-space font-bold text-base text-[var(--text)] group-hover:text-[var(--olive)] transition-colors line-clamp-1">
                    {challenge.title}
                  </h4>
                  <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                    {challenge.questionCount} Questions • by @{challenge.creatorName}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-dim)]">
                  <span className="text-[10px] font-mono font-bold text-[var(--text-dim)]">
                    {attempt ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Score: {attempt.pct}% ({attempt.score}/{attempt.total})
                      </span>
                    ) : (
                      "Challenge ready to play"
                    )}
                  </span>
                  <div className="btn-primary px-3.5 py-1.5 rounded-xl font-space font-bold text-xs">
                    <span>{attempt ? "Replay Challenge" : "Play Challenge"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State: Quick-Action Starter Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => onTabChange ? onTabChange("league") : router.push("/games/trivia?tab=league")}
            className="p-4 sm:p-5 rounded-2xl border surface transition-all hover:scale-[1.01] hover:shadow-sm cursor-pointer group flex flex-col justify-between"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[var(--terra)]/15 text-[var(--terra)] border border-[var(--terra)]/30 flex items-center justify-center">
                  <Trophy size={16} />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--terra)]">
                  Tournament
                </span>
              </div>
              <h4 className="font-space font-bold text-base text-[var(--text)] group-hover:text-[var(--terra)] transition-colors">
                Friendship Leagues
              </h4>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                Create or join a multi-day quiz cup with 1 daily drop and live cumulative rankings.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[var(--border-dim)] flex items-center justify-between text-xs font-mono font-bold text-[var(--terra)]">
              <span>Start League</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onTabChange ? onTabChange("challenge") : router.push("/games/trivia?tab=challenge")}
            className="p-4 sm:p-5 rounded-2xl border surface transition-all hover:scale-[1.01] hover:shadow-sm cursor-pointer group flex flex-col justify-between"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[var(--olive)]/15 text-[var(--olive)] border border-[var(--olive)]/30 flex items-center justify-center">
                  <Swords size={16} />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--olive)]">
                  1v1 Challenges
                </span>
              </div>
              <h4 className="font-space font-bold text-base text-[var(--text)] group-hover:text-[var(--olive)] transition-colors">
                Scholar Challenges
              </h4>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                Send a 10-question challenge link to friends on WhatsApp with an instant share card.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-[var(--border-dim)] flex items-center justify-between text-xs font-mono font-bold text-[var(--olive)]">
              <span>Create Challenge</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      )}

      {/* ── Parlor Games Quick Access ── */}
      {showParlorLinks && (
        <div
          className="p-3.5 sm:p-4 rounded-2xl surface border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--terra)]/15 text-[var(--terra)] border border-[var(--terra)]/30 flex items-center justify-center">
              <Gamepad2 size={16} />
            </div>
            <div>
              <div className="font-space font-bold text-xs text-[var(--text)]">
                Fey Games Parlor
              </div>
              <p className="text-[11px] text-[var(--text-dim)]">
                More intellectual games &amp; party presentations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/podium"
              className="px-3 py-1.5 rounded-xl border border-[var(--border-dim)] text-xs font-space font-bold text-[var(--text)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all flex items-center gap-1.5 bg-[var(--bg-input)] shadow-xs"
            >
              <Presentation size={13} className="text-[var(--gold)]" />
              <span>The Podium</span>
              <ChevronRight size={12} />
            </Link>

            <Link
              href="/play"
              className="px-3 py-1.5 rounded-xl border border-[var(--border-dim)] text-xs font-space font-bold text-[var(--terra)] hover:border-[var(--terra)] hover:text-[var(--terra)] transition-all flex items-center gap-1.5 bg-[var(--bg-input)] shadow-xs"
            >
              <Users size={13} className="text-[var(--terra)]" />
              <span>Articulate Online</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* ── New Game Choice Action Modal ── */}
      <NewGameActionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        onCreateLeague={() => {
          if (onCreateLeague) {
            onCreateLeague();
          } else {
            setShowCreateLeagueModal(true);
          }
        }}
        onCreateChallenge={() => {
          if (onCreateChallenge) {
            onCreateChallenge();
          } else if (onTabChange) {
            onTabChange("challenge");
          } else {
            router.push("/games/trivia?tab=challenge");
          }
        }}
        onCreateSolo={() => {
          if (onTabChange) {
            onTabChange("solo");
          }
          const el = document.getElementById("solo-quiz-config");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            router.push("/games/trivia?tab=solo");
          }
        }}
      />

      {/* ── Direct League Creation Modal Fallback ── */}
      <CreateLeagueModal
        isOpen={showCreateLeagueModal}
        onClose={() => {
          setShowCreateLeagueModal(false);
          setLeagues(getAllLocalLeagues());
        }}
      />
    </div>
  );
}
