"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Flame,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Users,
  Search,
  Clock,
  Zap,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Award,
  Crown,
  Trash2,
  ShieldCheck,
  Timer,
  RotateCw,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CreateLeagueModal from "@/components/trivia/CreateLeagueModal";
import { useAppStore } from "@/store/useAppStore";
import {
  getAllLocalLeagues,
  computeUserLeagueSummary,
  removeLocalLeague,
  saveLocalLeague,
  getDeletedLocalLeagues,
  unmarkLocalLeagueDeleted,
  getLeagueShareUrl,
  type FriendshipLeague,
} from "@/lib/trivia-league";
import { copyTextToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export default function TriviaLeagueLounge() {
  const router = useRouter();
  const { profile } = useAppStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [leagues, setLeagues] = useState<FriendshipLeague[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"active" | "concluded">("active");

  function refreshLeagues() {
    const list = getAllLocalLeagues();
    setLeagues(list);
  }

  useEffect(() => {
    refreshLeagues();

    // Fetch user's leagues from cloud so team members see the arena too
    if (profile.id || profile.username) {
      const q = new URLSearchParams();
      if (profile.id) q.set("userId", profile.id);
      if (profile.username) q.set("username", profile.username);

      fetch(`/api/trivia/league?${q.toString()}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.leagues && Array.isArray(data.leagues)) {
            const deletedList = getDeletedLocalLeagues();
            data.leagues.forEach((l: FriendshipLeague) => {
              if (!deletedList.includes(l.code.toUpperCase())) {
                saveLocalLeague(l);
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
      const summary = computeUserLeagueSummary(
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

  // Find any active leagues where today's quiz has NOT been attempted
  const pendingDailyDrops = useMemo(() => {
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
      const res = await fetch(`/api/trivia/league?code=${clean}`);
      if (res.ok) {
        const data = await res.json();
        if (data.league) {
          unmarkLocalLeagueDeleted(clean);
          saveLocalLeague(data.league, true);
          refreshLeagues();
        }
      }
    } catch {}
    router.push(`/games/trivia/league/${clean}`);
  }

  async function handleCopyShare(league: FriendshipLeague) {
    const shareUrl = getLeagueShareUrl(league);
    const ok = await copyTextToClipboard(shareUrl);
    if (ok) {
      setCopiedCode(league.code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  }

  async function handleRemove(league: FriendshipLeague, e: React.MouseEvent) {
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
      : `Remove "${league.title}" from your tournaments?`;

    if (!confirm(message)) return;

    // Immediately remove locally and update UI state
    removeLocalLeague(league.code);
    setLeagues((prev) => prev.filter((l) => l.code !== league.code));

    // Delete or leave on Supabase cloud
    try {
      const q = new URLSearchParams({ code: league.code });
      if (profile.id) q.set("userId", profile.id);
      if (profile.username) q.set("username", profile.username);

      await fetch(`/api/trivia/league?${q.toString()}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Failed to delete league in cloud:", err);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Pending Daily Drop Urgent Action Callout ── */}
      {pendingDailyDrops.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 sm:p-6 border relative overflow-hidden shadow-sm"
          style={{
            borderColor: "var(--terra)",
            background:
              "linear-gradient(135deg, rgba(188, 108, 37, 0.14) 0%, rgba(221, 161, 94, 0.12) 100%)",
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--terra)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--terra)]" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider font-extrabold text-[var(--terra)]">
                Daily Quiz Drop Ready
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--terra)]/15 text-[var(--terra)] border border-[var(--terra)]/30 font-bold">
              {pendingDailyDrops.length} {pendingDailyDrops.length === 1 ? "Drop" : "Drops"} Pending
            </span>
          </div>

          <div className="space-y-3">
            {pendingDailyDrops.map(({ league, summary }) => (
              <div
                key={league.code}
                className="p-4 sm:p-5 rounded-2xl surface border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                style={{ borderColor: "rgba(188, 108, 37, 0.3)" }}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-[var(--terra)] text-white text-[10px] font-mono font-bold tracking-wider uppercase">
                      Day {summary.status.dayNumber} of {league.durationDays}
                    </span>
                    <span className="text-xs font-mono font-bold text-[var(--text-dim)]">
                      Code: {league.code}
                    </span>
                  </div>

                  <h3 className="font-space font-extrabold text-lg sm:text-xl text-[var(--text)] tracking-tight">
                    {league.title}
                  </h3>

                  <p className="text-xs text-[var(--text-dim)] flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>Host: <strong>{league.creatorName}</strong></span>
                    <span>•</span>
                    <span>{league.questionsPerDay} Questions</span>
                    <span>•</span>
                    <span className="capitalize">{league.difficulty}</span>
                    <span>•</span>
                    <span className="text-[var(--terra)] font-bold inline-flex items-center gap-1">
                      <Zap size={11} className="text-amber-500" />
                      <span>1 attempt locked for today</span>
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/games/trivia/league/${league.code}`)}
                  className="btn-terra px-5 py-3 rounded-xl font-space font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
                >
                  <Zap size={15} />
                  <span>Attempt Day {summary.status.dayNumber} Drop</span>
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
          borderColor: "var(--border)",
          background:
            "linear-gradient(135deg, rgba(221, 161, 94, 0.08) 0%, rgba(92, 106, 54, 0.06) 100%)",
        }}
      >
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[var(--terra)]/15 border border-[var(--terra)]/30 flex items-center justify-center text-[var(--terra)]">
              <Trophy size={16} />
            </span>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--terra)] font-bold">
              Multi-Day Tournaments
            </div>
          </div>

          <h2
            className="font-space text-2xl sm:text-3xl font-extrabold"
            style={{ color: "var(--text)" }}
          >
            Friendship Leagues
          </h2>

          <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-dim)] max-w-lg">
            Create or join a multi-day quiz tournament. All players get{" "}
            <strong>1 daily drop</strong> with speed velocity points and live
            cumulative standings.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="btn-terra px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
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
              borderColor: joinError ? "var(--terra)" : "var(--border)",
              color: "var(--text)",
            }}
          />
          <button
            type="submit"
            className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Enter</span>
            <ArrowRight size={13} />
          </button>
        </form>
        {joinError && (
          <p className="text-xs text-[var(--terra)] font-medium">{joinError}</p>
        )}
      </div>

      {/* ── My Tournaments List ── */}
      {leagues.length > 0 && (
        <div
          className="surface rounded-3xl p-5 sm:p-7 border shadow-xs space-y-5"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--border-dim)" }}>
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
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-dim)] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setFilterTab("active")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  filterTab === "active"
                    ? "bg-[var(--bg-card)] text-[var(--text)] shadow-xs"
                    : "text-[var(--text-mute)] hover:text-[var(--text)]"
                )}
              >
                Active ({activeLeagues.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("concluded")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  filterTab === "concluded"
                    ? "bg-[var(--bg-card)] text-[var(--text)] shadow-xs"
                    : "text-[var(--text-mute)] hover:text-[var(--text)]"
                )}
              >
                Concluded ({concludedLeagues.length})
              </button>
            </div>
          </div>

          {/* Active / Concluded List */}
          {filterTab === "active" ? (
            activeLeagues.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-dim)]">
                No active leagues at the moment. Join one above or create your own tournament!
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
                      onClick={() => router.push(`/games/trivia/league/${league.code}`)}
                      className={cn(
                        "p-4 sm:p-5 rounded-2xl border surface transition-all hover:shadow-sm cursor-pointer relative group",
                        isReady
                          ? "border-[var(--terra)]/40 bg-[var(--bg-card)]"
                          : "border-[var(--border-dim)]"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left column */}
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {summary.status.isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Day {summary.status.dayNumber} of {league.durationDays}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                <Clock size={10} />
                                Starts {league.startDate}
                              </span>
                            )}

                            {isHost ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                <Crown size={11} className="text-amber-600 dark:text-amber-400" /> Host
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                <Users size={11} /> Team Scholar
                              </span>
                            )}

                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-dim)] text-[var(--text-dim)]">
                              Code: {league.code}
                            </span>
                          </div>

                          <h4 className="font-space font-bold text-base sm:text-lg text-[var(--text)] group-hover:text-[var(--terra)] transition-colors">
                            {league.title}
                          </h4>

                          <div className="text-xs text-[var(--text-dim)] flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>Host: <strong>{league.creatorName}</strong></span>
                            <span>•</span>
                            <span>{league.questionsPerDay} Qs/day</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[var(--text)] font-semibold">
                              <Users size={12} /> {summary.leaderboard.length} Scholars
                            </span>
                          </div>
                        </div>

                        {/* Right column: Status badge & action */}
                        <div className="flex flex-wrap sm:flex-col items-start sm:items-end justify-between gap-2.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--border-dim)]">
                          {summary.status.isActive && (
                            summary.hasCompletedToday ? (
                              <div className="flex flex-col items-start sm:items-end gap-1">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold">
                                  <CheckCircle2 size={13} />
                                  <span>Day {summary.status.dayNumber} Done ({summary.todayPoints} pts)</span>
                                </div>
                                <span className="text-[10px] font-mono text-[var(--text-dim)] inline-flex items-center gap-1">
                                  {league.attemptPolicy === "strict" ? (
                                    <>
                                      <Clock size={11} className="text-[var(--text-mute)]" />
                                      <span>Waiting for midnight drop</span>
                                    </>
                                  ) : (
                                    <>
                                      <RotateCw size={11} className="text-[var(--olive)]" />
                                      <span>Re-attempts open</span>
                                    </>
                                  )}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--terra)]/15 border border-[var(--terra)]/35 text-[var(--terra)] text-xs font-mono font-bold animate-pulse">
                                <Zap size={13} />
                                <span>Today&apos;s Quiz Waiting</span>
                              </div>
                            )
                          )}

                          {/* Standings snippet */}
                          <div className="text-xs font-mono text-[var(--text-dim)] flex items-center gap-2">
                            {summary.userDaysCompleted > 0 && (
                              <span className="font-bold text-[var(--text)] inline-flex items-center gap-1">
                                <Award size={12} className="text-amber-600 dark:text-amber-400" />
                                <span>Rank #{summary.userRank} · {summary.userTotalPoints} pts</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto mt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyShare(league);
                              }}
                              className="px-3 py-1.5 rounded-xl border border-[var(--border-dim)] text-xs font-mono font-semibold text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--border)] flex items-center gap-1.5 cursor-pointer bg-[var(--bg-input)] transition-all"
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
                              className="p-2 rounded-xl border border-[var(--border-dim)] text-[var(--text-mute)] hover:text-rose-600 hover:border-rose-300/60 hover:bg-rose-500/10 cursor-pointer bg-[var(--bg-input)] transition-all"
                              title={isHost ? "Delete Tournament" : "Remove League"}
                              aria-label={isHost ? "Delete Tournament" : "Remove League"}
                            >
                              <Trash2 size={13} />
                            </button>

                            <div className="btn-terra px-3.5 py-1.5 rounded-xl font-space font-bold text-xs flex items-center gap-1.5 shadow-xs">
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
                No past tournaments found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {concludedLeagues.map(({ league, summary }) => (
                  <div
                    key={league.code}
                    onClick={() => router.push(`/games/trivia/league/${league.code}`)}
                    className="p-4 sm:p-5 rounded-2xl border surface transition-all hover:shadow-sm cursor-pointer group"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--bg-input)] text-[var(--text-dim)] border border-[var(--border-dim)]">
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
                          Ran for {league.durationDays} days • {summary.leaderboard.length} Contenders
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
                          className="p-2 rounded-xl border border-[var(--border-dim)] text-[var(--text-mute)] hover:text-rose-600 hover:border-rose-300/60 hover:bg-rose-500/10 cursor-pointer bg-[var(--bg-input)] transition-all"
                          title="Remove Tournament"
                          aria-label="Remove Tournament"
                        >
                          <Trash2 size={13} />
                        </button>
                        <div className="btn-secondary px-3 py-1.5 rounded-xl font-space font-bold text-xs flex items-center gap-1">
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
          className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border text-left space-y-2 shadow-xs transition-all hover:border-[var(--border)]"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--terra)]/10 text-[var(--terra)] border border-[var(--terra)]/20 flex items-center justify-center">
            <Timer size={18} strokeWidth={2.2} />
          </div>
          <div className="font-space font-bold text-xs sm:text-sm text-[var(--text)]">
            1 Attempt Daily
          </div>
          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
            Fresh questions drop at midnight. Once submitted, your daily score is locked.
          </p>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border text-left space-y-2 shadow-xs transition-all hover:border-[var(--border)]"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Zap size={18} strokeWidth={2.2} />
          </div>
          <div className="font-space font-bold text-xs sm:text-sm text-[var(--text)]">
            Velocity Scoring
          </div>
          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
            Fast correct answers under 8s award speed multipliers to boost your ranking.
          </p>
        </div>

        <div
          className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border text-left space-y-2 shadow-xs transition-all hover:border-[var(--border)]"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/25 flex items-center justify-center">
            <Trophy size={18} strokeWidth={2.2} />
          </div>
          <div className="font-space font-bold text-xs sm:text-sm text-[var(--text)]">
            Final Podium
          </div>
          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
            Top 3 scholars receive gold laurel proof cards shareable to WhatsApp at the end.
          </p>
        </div>
      </div>

      {/* Create League Modal */}
      <CreateLeagueModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
