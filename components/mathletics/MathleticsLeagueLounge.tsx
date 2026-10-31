"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Swords,
  Timer,
  Zap,
  Plus,
  Users,
  Search,
  ArrowRight,
  Check,
  Share2,
  Trash2,
  Crown,
  CheckCircle2,
  ChevronRight,
  Clock,
  Award,
  Flame,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  getAllLocalMathleticsLeagues,
  computeUserMathleticsLeagueSummary,
  removeLocalMathleticsLeague,
  saveLocalMathleticsLeague,
  getDeletedLocalMathleticsLeagues,
  unmarkLocalMathleticsLeagueDeleted,
  getMathleticsLeagueShareUrl,
  type MathleticsLeague,
} from "@/lib/mathletics-league";
import { copyTextToClipboard } from "@/lib/clipboard";
import CreateMathleticsLeagueModal from "@/components/mathletics/CreateMathleticsLeagueModal";
import { cn } from "@/lib/utils";

export default function MathleticsLeagueLounge() {
  const router = useRouter();
  const { profile } = useAppStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [leagues, setLeagues] = useState<MathleticsLeague[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"active" | "concluded">("active");

  function refreshLeagues() {
    const list = getAllLocalMathleticsLeagues();
    setLeagues(list);
  }

  useEffect(() => {
    refreshLeagues();

    if (profile.id || profile.username) {
      const q = new URLSearchParams();
      if (profile.id) q.set("userId", profile.id);
      if (profile.username) q.set("username", profile.username);

      fetch(`/api/mathletics/league?${q.toString()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.leagues && Array.isArray(data.leagues)) {
            const deletedList = getDeletedLocalMathleticsLeagues();
            data.leagues.forEach((l: MathleticsLeague) => {
              if (!deletedList.includes(l.code.toUpperCase())) {
                saveLocalMathleticsLeague(l);
              }
            });
            refreshLeagues();
          }
        })
        .catch(() => {});
    }
  }, [showCreateModal, profile.id, profile.username]);

  const leagueSummaries = useMemo(() => {
    return leagues.map((league) => {
      const summary = computeUserMathleticsLeagueSummary(
        league,
        profile.id,
        profile.username || "Scholar"
      );
      return { league, summary };
    });
  }, [leagues, profile.id, profile.username]);

  const activeLeagues = useMemo(() => {
    return leagueSummaries.filter(
      ({ summary }) => summary.status.isActive || summary.status.isUpcoming
    );
  }, [leagueSummaries]);

  const concludedLeagues = useMemo(() => {
    return leagueSummaries.filter(({ summary }) => summary.status.isCompleted);
  }, [leagueSummaries]);

  const pendingSprints = useMemo(() => {
    return activeLeagues.filter(
      ({ summary }) => summary.status.isActive && !summary.hasCompletedToday
    );
  }, [activeLeagues]);

  async function handleJoinLeague(e: React.FormEvent) {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (!clean || clean.length < 4) {
      setJoinError("Please enter a valid league code.");
      return;
    }
    setJoinError("");
    try {
      const res = await fetch(`/api/mathletics/league?code=${clean}`);
      if (res.ok) {
        const data = await res.json();
        if (data.league) {
          unmarkLocalMathleticsLeagueDeleted(clean);
          saveLocalMathleticsLeague(data.league, true);
          refreshLeagues();
        }
      }
    } catch {}
    router.push(`/games/mathletics/league/${clean}`);
  }

  async function handleCopyShare(league: MathleticsLeague) {
    const shareUrl = getMathleticsLeagueShareUrl(league);
    const ok = await copyTextToClipboard(shareUrl);
    if (ok) {
      setCopiedCode(league.code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  }

  async function handleRemove(league: MathleticsLeague, e: React.MouseEvent) {
    e.stopPropagation();

    const cleanUsername = (profile.username || "").trim().toLowerCase();
    const creatorUser = (league.creatorName || "").trim().toLowerCase();
    const isHost =
      (league.creatorId && profile.id && league.creatorId === profile.id) ||
      (cleanUsername && creatorUser === cleanUsername) ||
      league.creatorId === "anonymous" ||
      league.creatorId === "creator";

    const message = isHost
      ? `Permanently delete "${league.title}"? This will delete the tournament and its leaderboard for all scholars.`
      : `Remove "${league.title}" from your leagues?`;

    if (!confirm(message)) return;

    removeLocalMathleticsLeague(league.code);
    setLeagues((prev) => prev.filter((l) => l.code !== league.code));

    try {
      const q = new URLSearchParams({ code: league.code });
      if (profile.id) q.set("userId", profile.id);
      if (profile.username) q.set("username", profile.username);

      await fetch(`/api/mathletics/league?${q.toString()}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Failed to delete league in cloud:", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Pending Sprint Alert Callout ── */}
      {pendingSprints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 sm:p-6 border relative overflow-hidden shadow-xs"
          style={{
            borderColor: "var(--terra)",
            backgroundColor: "rgba(122, 28, 46, 0.05)",
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--terra)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--terra)]" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider font-extrabold text-[var(--terra)]">
                Sprint Ready
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--terra)]/15 text-[var(--terra)] border border-[var(--terra)]/30 font-bold">
              {pendingSprints.length} {pendingSprints.length === 1 ? "Sprint" : "Sprints"} Waiting
            </span>
          </div>

          <div className="space-y-3">
            {pendingSprints.map(({ league, summary }) => (
              <div
                key={league.code}
                className="p-4 sm:p-5 rounded-2xl surface border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ borderColor: "rgba(122, 28, 46, 0.2)" }}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-[var(--terra)] text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                      {league.format === "sprint_duel"
                        ? "Sprint Duel"
                        : `Day ${summary.status.dayNumber} of ${league.durationDays}`}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--text-dim)]">
                      Code: {league.code}
                    </span>
                  </div>

                  <h3 className="font-space font-bold text-lg text-[var(--text)] tracking-tight">
                    {league.title}
                  </h3>

                  <p className="text-xs text-[var(--text-dim)] flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Host: <strong>{league.creatorName}</strong></span>
                    <span>•</span>
                    <span>10 Questions</span>
                    <span>•</span>
                    <span className="capitalize">{league.difficulty}</span>
                    <span>•</span>
                    <span className="text-[var(--terra)] font-bold inline-flex items-center gap-1">
                      <Zap size={11} className="text-amber-500" />
                      <span>Single attempt</span>
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/games/mathletics/league/${league.code}`)}
                  className="px-5 py-3 rounded-2xl font-space font-bold text-xs text-white flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
                  style={{ backgroundColor: "var(--terra)" }}
                >
                  <Zap size={14} />
                  <span>
                    {league.format === "sprint_duel"
                      ? "Run Sprint Duel"
                      : `Begin Day ${summary.status.dayNumber}`}
                  </span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Hero Banner */}
      <div
        className="rounded-3xl p-6 sm:p-7 surface border relative overflow-hidden shadow-xs"
        style={{
          borderColor: "var(--border-dim)",
          background:
            "linear-gradient(135deg, rgba(122, 28, 46, 0.06) 0%, rgba(68, 78, 44, 0.06) 100%)",
        }}
      >
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: "rgba(122, 28, 46, 0.1)",
                borderColor: "rgba(122, 28, 46, 0.25)",
                color: "var(--terra)",
              }}
            >
              <Swords size={16} />
            </span>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--terra)] font-bold">
              Friend Competitions
            </div>
          </div>

          <h2 className="font-space text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text)" }}>
            Mathletics Leagues
          </h2>

          <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-dim)] max-w-lg">
            Challenge friends to a head-to-head <strong>Sprint Duel</strong> on the exact same 10 questions,
            or start a multi-day <strong>Marathon Tournament</strong> with live agility velocity rankings.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
              style={{ backgroundColor: "var(--terra)" }}
            >
              <Plus size={14} /> Start New League
            </button>
          </div>
        </div>
      </div>

      {/* Join with League Code */}
      <div
        className="rounded-2xl p-5 surface border space-y-3"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <h3 className="font-space font-bold text-xs text-[var(--text)] flex items-center gap-1.5">
          <Search size={14} className="text-[var(--olive)]" /> Join with League Code
        </h3>
        <form onSubmit={handleJoinLeague} className="flex gap-2">
          <input
            type="text"
            maxLength={10}
            placeholder="e.g. 7K2M9P"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              if (joinError) setJoinError("");
            }}
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-mono uppercase font-bold focus:outline-none surface-input"
            style={{
              borderColor: joinError ? "var(--terra)" : "var(--border-dim)",
              color: "var(--text)",
            }}
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shrink-0 cursor-pointer transition-all active:scale-95"
            style={{ backgroundColor: "var(--olive)" }}
          >
            <span>Enter</span>
            <ArrowRight size={13} />
          </button>
        </form>
        {joinError && (
          <p className="text-xs text-[var(--terra)] font-medium">{joinError}</p>
        )}
      </div>

      {/* ── My Leagues List ── */}
      {leagues.length > 0 && (
        <div
          className="surface rounded-3xl p-5 sm:p-7 border shadow-xs space-y-5"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-[var(--terra)]" />
              <h3 className="font-space font-extrabold text-xl text-[var(--text)]">
                My Leagues
              </h3>
              <span className="text-xs font-mono text-[var(--text-dim)]">
                ({leagues.length})
              </span>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-hover)] border border-[var(--border-dim)] self-start sm:self-auto relative">
              <button
                type="button"
                onClick={() => setFilterTab("active")}
                className="relative px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer z-10"
              >
                {filterTab === "active" && (
                  <motion.div
                    layoutId="mathleticsLoungeFilterPill"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-lg surface shadow-xs z-[-1]"
                  />
                )}
                <span className={filterTab === "active" ? "text-[var(--text)]" : "text-[var(--text-dim)] hover:text-[var(--text)]"}>
                  Active ({activeLeagues.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab("concluded")}
                className="relative px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer z-10"
              >
                {filterTab === "concluded" && (
                  <motion.div
                    layoutId="mathleticsLoungeFilterPill"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-lg surface shadow-xs z-[-1]"
                  />
                )}
                <span className={filterTab === "concluded" ? "text-[var(--text)]" : "text-[var(--text-dim)] hover:text-[var(--text)]"}>
                  Concluded ({concludedLeagues.length})
                </span>
              </button>
            </div>
          </div>

          {filterTab === "active" ? (
            activeLeagues.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-dim)]">
                No active leagues at the moment. Create a Sprint Duel or enter a code above!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {activeLeagues.map(({ league, summary }) => {
                  const isReady = summary.status.isActive && !summary.hasCompletedToday;
                  const isHost =
                    (league.creatorId && league.creatorId === profile.id) ||
                    (league.creatorName &&
                      (league.creatorName || "").trim().toLowerCase() ===
                        (profile.username || "").trim().toLowerCase());

                  return (
                    <div
                      key={league.code}
                      onClick={() => router.push(`/games/mathletics/league/${league.code}`)}
                      className={cn(
                        "p-4 sm:p-5 rounded-2xl border surface transition-all hover:shadow-xs cursor-pointer group",
                        isReady
                          ? "border-[var(--terra)]/40 bg-[var(--surface)]"
                          : "border-[var(--border-dim)]"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {league.format === "sprint_duel" ? (
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                                style={{
                                  backgroundColor: "rgba(122, 28, 46, 0.1)",
                                  color: "var(--terra)",
                                  border: "1px solid rgba(122, 28, 46, 0.25)",
                                }}
                              >
                                <Swords size={11} />
                                <span>Sprint Duel</span>
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                                style={{
                                  backgroundColor: "rgba(68, 78, 44, 0.1)",
                                  color: "var(--olive)",
                                  border: "1px solid rgba(68, 78, 44, 0.25)",
                                }}
                              >
                                <Calendar size={11} />
                                <span>Day {summary.status.dayNumber} of {league.durationDays}</span>
                              </span>
                            )}

                            {isHost ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                <Crown size={11} className="text-amber-600 dark:text-amber-400" /> Host
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                <Users size={11} /> Contender
                              </span>
                            )}

                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border surface text-[var(--text-dim)]" style={{ borderColor: "var(--border-dim)" }}>
                              Code: {league.code}
                            </span>
                          </div>

                          <h4 className="font-space font-bold text-base sm:text-lg text-[var(--text)] group-hover:text-[var(--terra)] transition-colors">
                            {league.title}
                          </h4>

                          <div className="text-xs text-[var(--text-dim)] flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>Host: <strong>{league.creatorName}</strong></span>
                            <span>•</span>
                            <span>10 Questions ({league.questionTimerSeconds || 25}s)</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[var(--text)] font-semibold">
                              <Users size={12} /> {summary.leaderboard.length} Scholars
                            </span>
                          </div>
                        </div>

                        {/* Right column */}
                        <div className="flex flex-wrap sm:flex-col items-start sm:items-end justify-between gap-2.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--border-dim)]">
                          {summary.hasCompletedToday ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold">
                              <CheckCircle2 size={13} />
                              <span>
                                {league.format === "sprint_duel"
                                  ? `Score: ${summary.todayPoints} pts`
                                  : `Day ${summary.status.dayNumber} Done (${summary.todayPoints} pts)`}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--terra)]/15 border border-[var(--terra)]/35 text-[var(--terra)] text-xs font-mono font-bold animate-pulse">
                              <Zap size={13} />
                              <span>Sprint Waiting</span>
                            </div>
                          )}

                          {summary.userDaysCompleted > 0 && (
                            <div className="text-xs font-mono text-[var(--text-dim)] flex items-center gap-1 font-bold">
                              <Award size={12} className="text-amber-600 dark:text-amber-400" />
                              <span>Rank #{summary.userRank} · {summary.userTotalPoints} pts</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 w-full sm:w-auto mt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyShare(league);
                              }}
                              className="px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold text-[var(--text-dim)] hover:text-[var(--text)] flex items-center gap-1.5 cursor-pointer surface transition-all"
                              style={{ borderColor: "var(--border-dim)" }}
                              title="Copy Share Link"
                            >
                              {copiedCode === league.code ? (
                                <>
                                  <Check size={13} className="text-emerald-500" />
                                  <span className="text-xs text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Share2 size={13} />
                                  <span className="text-xs">Share</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleRemove(league, e)}
                              className="p-2 rounded-xl border border-[var(--border-dim)] text-[var(--text-dim)] hover:text-rose-600 hover:border-rose-300 cursor-pointer surface transition-all"
                              title={isHost ? "Delete League" : "Leave League"}
                              aria-label={isHost ? "Delete League" : "Leave League"}
                            >
                              <Trash2 size={13} />
                            </button>

                            <div
                              className="px-3.5 py-1.5 rounded-xl font-space font-bold text-xs text-white flex items-center gap-1.5 shadow-xs"
                              style={{ backgroundColor: "var(--terra)" }}
                            >
                              <span>Arena</span>
                              <ChevronRight size={13} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            concludedLeagues.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-dim)]">
                No past leagues found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {concludedLeagues.map(({ league, summary }) => (
                  <div
                    key={league.code}
                    onClick={() => router.push(`/games/mathletics/league/${league.code}`)}
                    className="p-4 sm:p-5 rounded-2xl border surface transition-all hover:shadow-xs cursor-pointer group"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border surface text-[var(--text-dim)]" style={{ borderColor: "var(--border-dim)" }}>
                            Concluded Tournament
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[var(--text-dim)]">
                            Code: {league.code}
                          </span>
                        </div>
                        <h4 className="font-space font-bold text-base sm:text-lg text-[var(--text)] group-hover:text-[var(--terra)] transition-colors">
                          {league.title}
                        </h4>
                        <div className="text-xs text-[var(--text-dim)]">
                          Ran for {league.durationDays} {league.durationDays === 1 ? "round" : "days"} • {summary.leaderboard.length} Contenders
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {summary.userRank <= 3 && summary.userDaysCompleted > 0 && (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
                            <Crown size={14} className="text-amber-500" />
                            <span>Finished #{summary.userRank} ({summary.userTotalPoints} pts)</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleRemove(league, e)}
                          className="p-2 rounded-xl border border-[var(--border-dim)] text-[var(--text-dim)] hover:text-rose-600 hover:border-rose-300 cursor-pointer surface transition-all"
                          title="Remove League"
                        >
                          <Trash2 size={13} />
                        </button>
                        <div className="px-3 py-1.5 rounded-xl font-space font-bold text-xs flex items-center gap-1 border surface" style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}>
                          <span>Podium</span>
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Rules Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className="p-4 sm:p-5 rounded-2xl surface border text-left space-y-2 shadow-xs transition-all hover:border-[var(--border)]"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: "rgba(122, 28, 46, 0.08)",
              borderColor: "rgba(122, 28, 46, 0.2)",
              color: "var(--terra)",
            }}
          >
            <Timer size={18} strokeWidth={2.2} />
          </div>
          <div className="font-space font-bold text-xs sm:text-sm text-[var(--text)]">
            One Attempt Per Scholar
          </div>
          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
            Every scholar gets exactly one sprint attempt. Scores are locked immediately upon submission.
          </p>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl surface border text-left space-y-2 shadow-xs transition-all hover:border-[var(--border)]"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: "rgba(166, 124, 30, 0.1)",
              borderColor: "rgba(166, 124, 30, 0.25)",
              color: "var(--gold)",
            }}
          >
            <Zap size={18} strokeWidth={2.2} />
          </div>
          <div className="font-space font-bold text-xs sm:text-sm text-[var(--text)]">
            Agility Scoring
          </div>
          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
            100 points per correct answer plus speed multipliers up to +50 points for answers within 4 seconds.
          </p>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl surface border text-left space-y-2 shadow-xs transition-all hover:border-[var(--border)]"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: "rgba(68, 78, 44, 0.1)",
              borderColor: "rgba(68, 78, 44, 0.25)",
              color: "var(--olive)",
            }}
          >
            <Trophy size={18} strokeWidth={2.2} />
          </div>
          <div className="font-space font-bold text-xs sm:text-sm text-[var(--text)]">
            Podium Leaderboard
          </div>
          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
            Live rankings update in real time as each friend finishes their sprint round.
          </p>
        </div>
      </div>

      {/* Create League Modal */}
      <CreateMathleticsLeagueModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
