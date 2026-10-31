"use client";

import { useMemo, useState } from "react";
import {
  Crown,
  Flame,
  Gamepad2,
  Mic,
  Search,
  Swords,
  TrendingDown,
  TrendingUp,
  Users,
  CheckCircle2,
} from "lucide-react";
import type {
  AdminEngagementData,
  GameEngagementSummary,
  TopScholarRow,
} from "@/lib/admin-engagement";

type ScholarRankTab = "hours" | "xp" | "trivia" | "mathletics" | "streak";

const fmtHours = (h: number) =>
  h >= 100 ? Math.round(h).toLocaleString() : h.toLocaleString(undefined, { maximumFractionDigits: 1 });

function formatRelativeDate(iso: string | null): string {
  if (!iso) return "—";
  const ts = new Date(iso).getTime();
  if (!Number.isFinite(ts)) return "—";
  const diffHours = Math.floor((Date.now() - ts) / (3600 * 1000));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function gameIcon(game: GameEngagementSummary["game"]) {
  if (game === "articulate") return <Users size={15} />;
  if (game === "trivia") return <Gamepad2 size={15} />;
  if (game === "mathletics") return <Swords size={15} />;
  return <Mic size={15} />;
}

export default function GamesEngagementPanel({
  engagement,
}: {
  engagement: AdminEngagementData | null | undefined;
}) {
  const [scholarTab, setScholarTab] = useState<ScholarRankTab>("hours");
  const [scholarSearch, setScholarSearch] = useState("");

  const sortedScholars = useMemo(() => {
    const list = [...(engagement?.topScholars || [])];
    const q = scholarSearch.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (s) =>
            s.username.toLowerCase().includes(q) ||
            (s.email && s.email.toLowerCase().includes(q))
        )
      : list;

    filtered.sort((a: TopScholarRow, b: TopScholarRow) => {
      if (scholarTab === "hours") return b.totalHours - a.totalHours || b.totalSessions - a.totalSessions;
      if (scholarTab === "xp") return b.xp - a.xp || b.totalHours - a.totalHours;
      if (scholarTab === "trivia") {
        const aScore = a.triviaPoints || (a.triviaAccuracyPct ?? 0) * a.sessionsByGame.trivia;
        const bScore = b.triviaPoints || (b.triviaAccuracyPct ?? 0) * b.sessionsByGame.trivia;
        return bScore - aScore || (b.triviaAccuracyPct ?? 0) - (a.triviaAccuracyPct ?? 0);
      }
      if (scholarTab === "mathletics") {
        return b.mathleticsPoints - a.mathleticsPoints || b.sessionsByGame.mathletics - a.sessionsByGame.mathletics;
      }
      return b.streakLongest - a.streakLongest || b.streakCurrent - a.streakCurrent;
    });

    return filtered.slice(0, 12);
  }, [engagement?.topScholars, scholarTab, scholarSearch]);

  if (!engagement) {
    return (
      <div className="surface border rounded-2xl p-6 animate-pulse h-64" style={{ borderColor: "var(--border-dim)" }} />
    );
  }

  const maxDailyHours = Math.max(
    0.5,
    ...engagement.dailyTrend.map((d) => d.totalHours)
  );

  return (
    <div className="space-y-6">
      {/* ── 1. Per-Game Hours & Sessions Breakdown ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-serif text-base font-bold">Hours Played by Game</h3>
            <p className="text-xs" style={{ color: "var(--text-dim)" }}>
              Breakdown across Articulate, Trivia, Mathletics, and Feynman Sprints for the selected period.
            </p>
          </div>
          <span className="text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>
            Total: <strong style={{ color: "var(--text)" }}>{fmtHours(engagement.totals.playerHours)} player hrs</strong>{" "}
            ({fmtHours(engagement.totals.gameHours)} game hrs) · {engagement.totals.totalSessions.toLocaleString()} rounds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {engagement.games.map((g) => {
            const sharePct =
              engagement.totals.playerHours > 0
                ? Math.round((g.playerHours / engagement.totals.playerHours) * 100)
                : 0;
            return (
              <div
                key={g.game}
                className="surface border rounded-2xl p-5 flex flex-col justify-between"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div
                      className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase"
                      style={{ color: "var(--olive)" }}
                    >
                      {gameIcon(g.game)}
                      <span>{g.label}</span>
                    </div>
                    {g.deltaPct !== null && (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background:
                            g.deltaPct >= 0
                              ? "rgba(68, 78, 44, 0.15)"
                              : "rgba(181, 58, 58, 0.15)",
                          color: g.deltaPct >= 0 ? "var(--olive)" : "var(--red)",
                        }}
                      >
                        {g.deltaPct >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {g.deltaPct >= 0 ? `+${g.deltaPct}%` : `${g.deltaPct}%`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-mono text-3xl font-bold" style={{ color: "var(--text)" }}>
                      {fmtHours(g.playerHours)}
                    </span>
                    <span className="text-xs font-mono" style={{ color: "var(--text-mute)" }}>
                      hrs ({sharePct}%)
                    </span>
                  </div>

                  {g.game === "articulate" && (
                    <div className="text-[11px] font-mono mt-0.5" style={{ color: "var(--text-dim)" }}>
                      {fmtHours(g.gameHours)} hrs clock time
                    </div>
                  )}

                  {/* Share bar */}
                  <div
                    className="h-1.5 rounded-full overflow-hidden my-3"
                    style={{ background: "var(--bg-input)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(sharePct, g.sessions > 0 ? 4 : 0)}%`,
                        background: g.game === "articulate" ? "var(--gold)" : "var(--olive)",
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t text-[11px] font-mono" style={{ borderColor: "var(--border-dim)" }}>
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--text-mute)" }}>Rounds / Matches</span>
                    <span className="font-bold">{g.sessions.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--text-mute)" }}>Avg Duration</span>
                    <span className="font-bold">{g.avgMinutes} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--text-mute)" }}>Players</span>
                    <span className="font-bold">{g.uniquePlayers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: "var(--bg-input)",
                        color: g.exactSharePct === 100 ? "var(--olive)" : "var(--text-dim)",
                      }}
                    >
                      {g.exactSharePct === 100
                        ? "Exact durations"
                        : `${g.exactSharePct}% exact · ${100 - g.exactSharePct}% est.`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. 14-Day Activity Trend & Top Sprint Categories ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 surface border rounded-2xl p-6" style={{ borderColor: "var(--border-dim)" }}>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-serif text-base font-bold">14-Day Play Time Trend</h3>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>
                Daily player hours and completed rounds across all games over the past two weeks.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--gold)" }} />
                Articulate
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--olive)" }} />
                Other Games
              </span>
            </div>
          </div>

          <div className="grid grid-cols-14 gap-1.5 items-end h-36 pt-4">
            {engagement.dailyTrend.map((d) => {
              const totalPct = Math.min(100, Math.round((d.totalHours / maxDailyHours) * 100));
              const artPct =
                d.totalHours > 0 ? Math.round((d.byGame.articulate / d.totalHours) * 100) : 0;
              return (
                <div
                  key={d.date}
                  className="flex flex-col items-center gap-1.5 h-full justify-end group"
                  title={`${d.label}: ${d.totalHours} hrs across ${d.sessions} rounds`}
                >
                  <div className="text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-dim)" }}>
                    {d.totalHours > 0 ? `${d.totalHours}h` : "0"}
                  </div>
                  <div
                    className="w-full rounded-t-md overflow-hidden flex flex-col justify-end"
                    style={{
                      height: `${Math.max(totalPct, d.sessions > 0 ? 8 : 3)}%`,
                      background: d.sessions > 0 ? "var(--olive)" : "var(--bg-input)",
                    }}
                  >
                    {artPct > 0 && (
                      <div
                        style={{
                          height: `${artPct}%`,
                          background: "var(--gold)",
                        }}
                      />
                    )}
                  </div>
                  <span
                    className="text-[9px] font-mono truncate max-w-full"
                    style={{ color: "var(--text-mute)" }}
                  >
                    {d.label.split(" ")[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Sprint Categories */}
        <div className="surface border rounded-2xl p-6" style={{ borderColor: "var(--border-dim)" }}>
          <h3 className="font-serif text-base font-bold mb-1">Most-Practiced Topic Categories</h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>
            Completed Feynman vocal sprints by discipline.
          </p>

          {engagement.topCategories.length === 0 ? (
            <div className="text-xs font-mono py-8 text-center" style={{ color: "var(--text-mute)" }}>
              No completed vocal sprints recorded in this period yet.
            </div>
          ) : (
            <div className="space-y-3">
              {engagement.topCategories.map((cat) => {
                const maxCat = engagement.topCategories[0]?.sessions || 1;
                const pct = Math.round((cat.sessions / maxCat) * 100);
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold truncate">{cat.category}</span>
                      <span style={{ color: "var(--text-mute)" }}>
                        {cat.sessions} sprints · {cat.hours}h
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-input)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: "var(--olive)" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Top Scholars Leaderboard ── */}
      <div className="surface border rounded-2xl overflow-hidden" style={{ borderColor: "var(--border-dim)" }}>
        <div className="p-5 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "var(--border-dim)" }}>
          <div>
            <div className="flex items-center gap-2">
              <Crown size={16} style={{ color: "var(--gold)" }} />
              <h3 className="font-serif text-base font-bold">Top Scholars</h3>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
              Cross-game scholar rankings combining Sprints, Trivia, Mathletics, and Articulate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: "hours", label: "Most Hours" },
                { key: "xp", label: "Highest XP" },
                { key: "trivia", label: "Trivia" },
                { key: "mathletics", label: "Mathletics" },
                { key: "streak", label: "Longest Streak" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setScholarTab(t.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                  scholarTab === t.key
                    ? "font-bold text-white"
                    : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
                }`}
                style={scholarTab === t.key ? { background: "var(--olive)" } : {}}
              >
                {t.label}
              </button>
            ))}

            <div className="relative w-44">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-mute)]" />
              <input
                type="text"
                placeholder="Find scholar..."
                value={scholarSearch}
                onChange={(e) => setScholarSearch(e.target.value)}
                className="w-full text-xs rounded-xl pl-7 pr-2.5 py-1.5 border focus:outline-none"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border-dim)",
                  color: "var(--text)",
                }}
              />
            </div>
          </div>
        </div>

        {sortedScholars.length === 0 ? (
          <div className="p-10 text-center text-xs font-mono" style={{ color: "var(--text-mute)" }}>
            No scholars match this filter yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className="border-b font-mono uppercase text-[10px]"
                style={{
                  borderColor: "var(--border-dim)",
                  background: "var(--bg-input)",
                  color: "var(--text-mute)",
                }}
              >
                <tr>
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Scholar</th>
                  <th className="py-3 px-4">Hours Played</th>
                  <th className="py-3 px-4">Activity Breakdown</th>
                  <th className="py-3 px-4">Trivia / Math</th>
                  <th className="py-3 px-4">XP & Streak</th>
                  <th className="py-3 px-4 text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono" style={{ borderColor: "var(--border-dim)" }}>
                {sortedScholars.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-[var(--bg-input)]/40 transition-colors">
                    <td className="py-3 px-4 font-bold">
                      {idx < 3 ? (
                        <span
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px]"
                          style={{
                            background: "rgba(166, 124, 30, 0.18)",
                            color: "var(--gold)",
                          }}
                        >
                          {idx + 1}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-mute)" }}>{idx + 1}</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs shrink-0"
                          style={{
                            background: "var(--bg-card)",
                            borderColor: "var(--border-dim)",
                          }}
                        >
                          {s.username.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold font-sans" style={{ color: "var(--text)" }}>
                              {s.username}
                            </span>
                            {s.isRegistered && (
                              <span title="Registered account">
                                <CheckCircle2 size={12} style={{ color: "var(--olive)" }} />
                              </span>
                            )}
                          </div>
                          <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>
                            {s.isRegistered ? s.email || "Registered" : "Guest scholar"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-sm" style={{ color: "var(--text)" }}>
                        {fmtHours(s.totalHours)} hrs
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>
                        {s.totalSessions} {s.totalSessions === 1 ? "round" : "rounds"}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        {s.sessionsByGame.articulate > 0 && (
                          <span
                            className="px-2 py-0.5 rounded border"
                            style={{ borderColor: "var(--border-dim)" }}
                          >
                            Articulate: {s.sessionsByGame.articulate} ({fmtHours(s.hoursByGame.articulate)}h)
                          </span>
                        )}
                        {s.sessionsByGame.trivia > 0 && (
                          <span
                            className="px-2 py-0.5 rounded border"
                            style={{ borderColor: "var(--border-dim)" }}
                          >
                            Trivia: {s.sessionsByGame.trivia} ({fmtHours(s.hoursByGame.trivia)}h)
                          </span>
                        )}
                        {s.sessionsByGame.mathletics > 0 && (
                          <span
                            className="px-2 py-0.5 rounded border"
                            style={{ borderColor: "var(--border-dim)" }}
                          >
                            Math: {s.sessionsByGame.mathletics} ({fmtHours(s.hoursByGame.mathletics)}h)
                          </span>
                        )}
                        {s.sessionsByGame.sprint > 0 && (
                          <span
                            className="px-2 py-0.5 rounded border"
                            style={{ borderColor: "var(--border-dim)" }}
                          >
                            Sprints: {s.sessionsByGame.sprint} ({fmtHours(s.hoursByGame.sprint)}h)
                          </span>
                        )}
                        {s.totalSessions === 0 && (
                          <span style={{ color: "var(--text-mute)" }}>Profile only</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {s.triviaAccuracyPct !== null ? (
                          <div>
                            Trivia: <strong>{s.triviaAccuracyPct}%</strong>
                            {s.triviaPoints > 0 ? ` · ${s.triviaPoints} pts` : ""}
                          </div>
                        ) : (
                          <div style={{ color: "var(--text-mute)" }}>Trivia: —</div>
                        )}
                        {s.mathleticsPoints > 0 && (
                          <div className="text-[10px]" style={{ color: "var(--olive)" }}>
                            Mathletics: {s.mathleticsPoints.toLocaleString()} pts
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold" style={{ color: "var(--gold)" }}>
                        {s.xp.toLocaleString()} XP
                      </div>
                      <div
                        className="flex items-center gap-1 text-[10px]"
                        style={{ color: "var(--text-dim)" }}
                      >
                        <Flame size={11} style={{ color: "var(--gold)" }} />
                        <span>
                          {s.streakCurrent}d (Max {s.streakLongest}d)
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right" style={{ color: "var(--text-mute)" }}>
                      {formatRelativeDate(s.lastActiveIso)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
