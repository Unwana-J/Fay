"use client";

import { useEffect, useState } from "react";
import { Clock, Trophy, Users, AlertTriangle } from "lucide-react";
import type { ArticulateStats } from "@/lib/articulate-matches";

interface Props {
  adminKey?: string;
  initialStats?: ArticulateStats | null;
  refreshSignal?: unknown;
}

const fmtHours = (h: number) =>
  h >= 100 ? Math.round(h).toLocaleString() : h.toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function ArticulateMilestoneCard({ adminKey = "", initialStats, refreshSignal }: Props) {
  const [fetchedStats, setFetchedStats] = useState<ArticulateStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialStats) return;
    let cancelled = false;
    fetch("/api/admin/articulate-stats", {
      headers: adminKey ? { "x-admin-key": adminKey } : undefined,
      cache: "no-store",
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Could not load stats");
        if (!cancelled) {
          setFetchedStats(json.stats);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load stats");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [adminKey, initialStats, refreshSignal]);

  const stats = initialStats ?? fetchedStats;
  const m = stats?.milestone;
  const remaining = stats && m ? Math.max(0, m.next - stats.playerHours) : 0;
  const estimatedShare =
    stats && stats.matches > 0 ? Math.round((stats.breakdown.estimatedLegacyMatches / stats.matches) * 100) : 0;

  return (
    <div className="surface border rounded-2xl p-6" style={{ borderColor: "var(--border-dim)" }}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-serif text-base font-bold">Articulate Milestone Tracker</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
            Cumulative hours played across online Articulate rooms. Player hours count every participant in a match.
          </p>
        </div>
        {m && (
          <span
            className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 rounded-md"
            style={{ background: "rgba(166, 124, 30, 0.15)", color: "var(--gold)" }}
          >
            Target Milestone: {m.next.toLocaleString()} hrs
          </span>
        )}
      </div>

      {error && !stats && (
        <div className="text-xs font-mono flex items-center gap-2" style={{ color: "var(--red)" }}>
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      {!stats && !error && (
        <div className="h-24 rounded-xl animate-pulse" style={{ background: "var(--bg-input)" }} />
      )}

      {stats && m && (
        <>
          {/* Headline + progress */}
          <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mb-3">
            <div>
              <div className="font-mono text-4xl font-bold" style={{ color: "var(--gold)" }}>
                {fmtHours(stats.playerHours)}
                <span className="text-sm font-normal ml-1.5" style={{ color: "var(--text-mute)" }}>
                  player hours
                </span>
              </div>
            </div>
            <div className="font-mono text-lg font-bold pb-1" style={{ color: "var(--olive)" }}>
              {fmtHours(stats.gameHours)}
              <span className="text-xs font-normal ml-1.5" style={{ color: "var(--text-mute)" }}>
                game hours (clock time)
              </span>
            </div>
          </div>

          <div className="h-3 rounded-full overflow-hidden mb-1.5" style={{ background: "var(--bg-input)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${m.progressPct}%`, background: "var(--gold)" }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono mb-5" style={{ color: "var(--text-mute)" }}>
            <span>{m.previous.toLocaleString()} hrs</span>
            <span>
              {remaining > 0 ? `${fmtHours(remaining)} hrs to ${m.next.toLocaleString()} hrs` : "Milestone reached"} ·{" "}
              {m.progressPct}%
            </span>
            <span>{m.next.toLocaleString()} hrs</span>
          </div>

          {/* Supporting stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: <Trophy size={13} />, label: "Matches Played", value: stats.matches.toLocaleString() },
              { icon: <Clock size={13} />, label: "Avg Match", value: `${stats.avgMatchMinutes} min` },
              { icon: <Users size={13} />, label: "Avg Players", value: String(stats.avgPlayers) },
              {
                icon: <Clock size={13} />,
                label: "Last 7 Days",
                value: `${fmtHours(stats.last7Days.playerHours)} hrs`,
                sub: `${stats.last7Days.matches} matches`,
              },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3 border" style={{ borderColor: "var(--border-dim)" }}>
                <div
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase mb-1"
                  style={{ color: "var(--text-mute)" }}
                >
                  <span style={{ color: "var(--olive)" }}>{s.icon}</span>
                  {s.label}
                </div>
                <div className="font-mono text-base font-bold">{s.value}</div>
                {s.sub && (
                  <div className="text-[10px] font-mono" style={{ color: "var(--text-mute)" }}>
                    {s.sub}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Data quality note */}
          <p className="text-[11px] mt-4" style={{ color: "var(--text-mute)" }}>
            {stats.breakdown.loggedMatches} logged · {stats.breakdown.unloggedRoomMatches} active or saved in room ·{" "}
            {stats.breakdown.estimatedLegacyMatches} estimated from older rooms
            {estimatedShare > 0 ? ` (${estimatedShare}% of matches)` : ""}. Matches replayed with &ldquo;Play
            Again&rdquo; before match logging was added were not saved, so the true total is higher.
            {!stats.ledgerReady && " Match log table not found: run the latest supabase/schema.sql."}
          </p>
        </>
      )}
    </div>
  );
}
