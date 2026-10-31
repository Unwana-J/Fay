"use client";

import {
  AlertTriangle,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import ArticulateMilestoneCard from "@/components/admin/ArticulateMilestoneCard";
import GamesEngagementPanel from "@/components/admin/GamesEngagementPanel";
import type { FeedbackItem, IncidentReportItem, AdminUserItem } from "@/lib/admin-data";
import type { AdminEngagementData, AdminRange } from "@/lib/admin-engagement";

export interface OverviewApiPayload {
  supabaseConnected: boolean;
  csat: {
    average: number;
    total: number;
    promoters: number;
    detractors: number;
    csatPercent: number;
    ratingCounts: Record<1 | 2 | 3 | 4 | 5, number>;
    lowSample: boolean;
  };
  recentFeedback: FeedbackItem[];
  incidents: {
    total: number;
    pending: number;
    investigating: number;
    resolved: number;
  };
  users: {
    total: number;
    active: number;
    banned: number;
    deactivated: number;
    registered: number;
    guest: number;
  };
  engagement: AdminEngagementData;
  posthog: {
    configured: boolean;
    host: string;
    dashboardUrl: string;
  };
}

interface Props {
  overviewData: OverviewApiPayload | null;
  feedbackList: FeedbackItem[];
  incidentList: IncidentReportItem[];
  userList: AdminUserItem[];
  range: AdminRange;
  onRangeChange: (next: AdminRange) => void;
  onOpenTab: (tab: "feedback" | "safety" | "users") => void;
}

const fmtHours = (h: number) =>
  h >= 100 ? Math.round(h).toLocaleString() : h.toLocaleString(undefined, { maximumFractionDigits: 1 });

export default function AdminOverviewTab({
  overviewData,
  feedbackList,
  incidentList,
  userList,
  range,
  onRangeChange,
  onOpenTab,
}: Props) {
  const engagement = overviewData?.engagement;
  const totalScholars = overviewData?.users?.total ?? userList.length;
  const activeScholars =
    overviewData?.users?.active ??
    userList.filter((u) => !u.isBanned && !u.isDeactivated).length;
  const suspendedScholars =
    (overviewData?.users?.banned ?? userList.filter((u) => u.isBanned).length) +
    (overviewData?.users?.deactivated ??
      userList.filter((u) => u.isDeactivated && !u.isBanned).length);
  const registeredScholars =
    overviewData?.users?.registered ??
    userList.filter((u) => u.isRegistered || Boolean(u.email)).length;

  const pendingIncidents =
    overviewData?.incidents?.pending ??
    incidentList.filter((i) => i.status === "pending").length;
  const investigatingIncidents =
    overviewData?.incidents?.investigating ??
    incidentList.filter((i) => i.status === "investigating").length;
  const resolvedIncidents =
    overviewData?.incidents?.resolved ??
    incidentList.filter((i) => i.status === "resolved").length;

  const totalRatings = overviewData?.csat?.total ?? feedbackList.length;
  const recentComments = overviewData?.recentFeedback ?? feedbackList.slice(0, 3);
  const hoursDelta = engagement?.totals.hoursDeltaPct ?? null;

  return (
    <div className="space-y-6">
      {/* ── Supabase Fallback Warning Banner ── */}
      {overviewData && !overviewData.supabaseConnected && (
        <div
          className="surface border rounded-2xl p-4 flex items-start gap-3 text-xs"
          style={{ borderColor: "var(--red)" }}
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: "var(--red)" }} />
          <div>
            <div className="font-bold" style={{ color: "var(--red)" }}>
              Supabase is not connected in this environment
            </div>
            <p className="mt-0.5" style={{ color: "var(--text-dim)" }}>
              Moderation actions and scores are currently using an in-memory fallback that resets when the server
              restarts. Add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to persist changes.
            </p>
          </div>
        </div>
      )}

      {/* ── Date Range Bar & Growth Strip ── */}
      <div
        className="surface border rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div>
            <span style={{ color: "var(--text-mute)" }}>Active Today: </span>
            <strong style={{ color: "var(--olive)" }}>
              {engagement?.totals.activeToday ?? 0}
            </strong>
          </div>
          <div>
            <span style={{ color: "var(--text-mute)" }}>New This Week: </span>
            <strong style={{ color: "var(--text)" }}>
              +{engagement?.totals.newScholarsThisWeek ?? 0}
            </strong>
          </div>
          <div>
            <span style={{ color: "var(--text-mute)" }}>Active in Range: </span>
            <strong style={{ color: "var(--text)" }}>
              {engagement?.totals.activePlayersInRange ?? 0}
            </strong>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(
            [
              { key: "7d", label: "Last 7 Days" },
              { key: "30d", label: "Last 30 Days" },
              { key: "all", label: "All Time" },
            ] as const
          ).map((r) => (
            <button
              key={r.key}
              onClick={() => onRangeChange(r.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                range === r.key
                  ? "text-white font-bold"
                  : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
              }`}
              style={range === r.key ? { background: "var(--olive)" } : {}}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Hours Played */}
        <div className="surface border rounded-2xl p-5" style={{ borderColor: "var(--border-dim)" }}>
          <div
            className="flex items-center justify-between text-xs font-mono uppercase mb-2"
            style={{ color: "var(--text-mute)" }}
          >
            <span>Hours Played</span>
            <Clock size={14} style={{ color: "var(--olive)" }} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold" style={{ color: "var(--olive)" }}>
              {fmtHours(engagement?.totals.playerHours ?? 0)}
              <span className="text-sm font-normal ml-1" style={{ color: "var(--text-mute)" }}>
                hrs
              </span>
            </span>
            {hoursDelta !== null && (
              <span
                className="inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded"
                style={{
                  background:
                    hoursDelta >= 0 ? "rgba(68, 78, 44, 0.15)" : "rgba(181, 58, 58, 0.15)",
                  color: hoursDelta >= 0 ? "var(--olive)" : "var(--red)",
                }}
              >
                {hoursDelta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {hoursDelta >= 0 ? `+${hoursDelta}%` : `${hoursDelta}%`}
              </span>
            )}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
            {fmtHours(engagement?.totals.gameHours ?? 0)} clock hrs ·{" "}
            {(engagement?.totals.totalSessions ?? 0).toLocaleString()} rounds
          </div>
        </div>

        {/* 2. Scholars (Consistent Total / Active / Suspended) */}
        <div
          onClick={() => onOpenTab("users")}
          className="surface border rounded-2xl p-5 cursor-pointer hover:brightness-105 transition-all"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div
            className="flex items-center justify-between text-xs font-mono uppercase mb-2"
            style={{ color: "var(--text-mute)" }}
          >
            <span>Scholars</span>
            <Users size={14} style={{ color: "var(--olive)" }} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold" style={{ color: "var(--olive)" }}>
              {totalScholars}
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--text-mute)" }}>
              total ({activeScholars} active)
            </span>
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
            {registeredScholars} registered · {totalScholars - registeredScholars} guest
            {suspendedScholars > 0 ? ` · ${suspendedScholars} suspended` : ""}
          </div>
        </div>

        {/* 3. Satisfaction */}
        <div
          onClick={() => onOpenTab("feedback")}
          className="surface border rounded-2xl p-5 cursor-pointer hover:brightness-105 transition-all"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div
            className="flex items-center justify-between text-xs font-mono uppercase mb-2"
            style={{ color: "var(--text-mute)" }}
          >
            <span>Satisfaction</span>
            <Star size={14} style={{ color: "var(--olive)" }} />
          </div>
          <div className="flex items-baseline gap-2">
            {totalRatings > 0 ? (
              <>
                <span className="font-mono text-3xl font-bold" style={{ color: "var(--olive)" }}>
                  {overviewData?.csat?.average ?? "0.0"}
                  <span className="text-sm font-normal" style={{ color: "var(--text-mute)" }}>
                    {" "}
                    / 5.0
                  </span>
                </span>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{ background: "var(--bg-input)", color: "var(--text-mute)" }}
                >
                  n = {totalRatings}
                </span>
              </>
            ) : (
              <span className="text-2xl font-sans" style={{ color: "var(--text-mute)" }}>
                No ratings yet
              </span>
            )}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
            {totalRatings > 0 ? (
              <>
                {overviewData?.csat?.csatPercent ?? 0}% Happy (4–5★)
                {totalRatings < 30 ? " · Low sample (<30)" : ""}
              </>
            ) : (
              "Awaiting scholar ratings"
            )}
          </div>
        </div>

        {/* 4. Open Safety Reports */}
        <div
          onClick={() => onOpenTab("safety")}
          className="surface border rounded-2xl p-5 cursor-pointer hover:brightness-105 transition-all"
          style={{
            borderColor: pendingIncidents > 0 ? "var(--red)" : "var(--border-dim)",
          }}
        >
          <div
            className="flex items-center justify-between text-xs font-mono uppercase mb-2"
            style={{ color: "var(--text-mute)" }}
          >
            <span>Open Reports</span>
            <ShieldAlert
              size={14}
              style={{ color: pendingIncidents > 0 ? "var(--red)" : "var(--olive)" }}
            />
          </div>
          <div
            className="font-mono text-3xl font-bold"
            style={{ color: pendingIncidents > 0 ? "var(--red)" : "var(--olive)" }}
          >
            {pendingIncidents}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
            {pendingIncidents > 0
              ? `${pendingIncidents} awaiting review · ${investigatingIncidents} investigating`
              : `All clear · ${resolvedIncidents} resolved`}
          </div>
        </div>
      </div>

      {/* ── Articulate All-Time Milestone Card ── */}
      <ArticulateMilestoneCard initialStats={engagement?.articulateMilestone} />

      {/* ── Games & Top Scholars Section ── */}
      <GamesEngagementPanel engagement={engagement} />

      {/* ── Feedback Distribution & Latest Comments ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Star Rating Distribution */}
        <div className="surface border rounded-2xl p-6" style={{ borderColor: "var(--border-dim)" }}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-serif text-base font-bold">Feedback Star Distribution</h3>
            <span className="text-xs font-mono" style={{ color: "var(--text-mute)" }}>
              n = {totalRatings}
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>
            Ratings collected from the in-app feedback prompt across games and sprints.
          </p>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = feedbackList.filter((f) => f.rating === stars).length;
              const total = feedbackList.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={stars} className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1 w-12" style={{ color: "var(--olive)" }}>
                    <span>{stars}</span>
                    <Star size={12} fill="currentColor" />
                  </div>
                  <div className="flex-1 h-3 rounded-full bg-[var(--bg-input)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: stars >= 4 ? "var(--olive)" : "var(--terra)",
                      }}
                    />
                  </div>
                  <div className="w-16 text-right" style={{ color: "var(--text-mute)" }}>
                    {count} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-2 text-xs"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: "var(--olive)" }} />
              <span>Happy (4–5★): &ldquo;I&rsquo;d give an extra star if...&rdquo;</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: "var(--terra)" }} />
              <span>Unhappy (1–3★): &ldquo;What could be better?&rdquo;</span>
            </div>
          </div>
        </div>

        {/* Latest Scholar Comments + PostHog Shortcut */}
        <div
          className="surface border rounded-2xl p-6 flex flex-col justify-between"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-serif text-base font-bold">Latest Scholar Feedback</h3>
              <button
                type="button"
                onClick={() => onOpenTab("feedback")}
                className="text-xs font-mono hover:underline cursor-pointer"
                style={{ color: "var(--olive)" }}
              >
                View all ({feedbackList.length})
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>
              Most recent written responses from scholars.
            </p>

            {recentComments.length === 0 ? (
              <div
                className="p-8 rounded-xl border text-center text-xs font-mono"
                style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)", color: "var(--text-mute)" }}
              >
                <MessageSquare size={18} className="mx-auto mb-2 opacity-60" />
                No feedback comments submitted yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentComments.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-3.5 rounded-xl border space-y-1.5"
                    style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-bold px-1.5 py-0.5 rounded text-[10px]"
                          style={{
                            background:
                              fb.rating >= 4
                                ? "rgba(68, 78, 44, 0.16)"
                                : "rgba(122, 28, 46, 0.16)",
                            color: fb.rating >= 4 ? "var(--olive)" : "var(--terra)",
                          }}
                        >
                          {fb.rating}★
                        </span>
                        <span className="font-semibold">@{fb.username || "Scholar"}</span>
                        <span style={{ color: "var(--text-mute)" }}>· {fb.path || "/"}</span>
                      </div>
                      <span className="text-[10px]" style={{ color: "var(--text-mute)" }}>
                        {new Date(fb.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>
                      &ldquo;{fb.message}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <span style={{ color: "var(--text-mute)" }}>
              PostHog web analytics:{" "}
              <strong style={{ color: overviewData?.posthog?.configured ? "var(--olive)" : "var(--text-dim)" }}>
                {overviewData?.posthog?.configured ? "Key configured" : "Not configured"}
              </strong>
            </span>
            <a
              href={overviewData?.posthog?.dashboardUrl || "https://us.posthog.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-semibold hover:bg-[var(--bg-input)] transition-colors"
              style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
            >
              <span>Open PostHog</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
