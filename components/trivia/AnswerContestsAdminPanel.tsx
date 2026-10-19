"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, RefreshCw, Bot, Hourglass, Flag } from "lucide-react";
import { TRIVIA_QUESTIONS } from "@/lib/trivia-questions";
import type { AnswerContest, ContestStatus } from "@/lib/trivia-contests";

type Filter = "needs_review" | "all" | "accepted" | "rejected";

const STATUS_LABEL: Record<ContestStatus, string> = {
  pending: "Needs Review",
  ai_accepted: "AI Upheld",
  ai_rejected: "AI Declined",
  admin_accepted: "Admin Upheld",
  admin_rejected: "Admin Declined",
};

function statusTone(s: ContestStatus) {
  if (s === "ai_accepted" || s === "admin_accepted") return { bg: "rgba(68, 78, 44, 0.15)", color: "var(--olive)" };
  if (s === "pending") return { bg: "rgba(166, 124, 30, 0.15)", color: "var(--gold)" };
  return { bg: "var(--bg-input)", color: "var(--text-dim)" };
}

/**
 * Admin desk for answer contests. Upholding a contest adds the player's option as an accepted
 * answer for that question, which regrades every stored score that picked it.
 */
export default function AnswerContestsAdminPanel({
  adminKey,
  onPendingCount,
}: {
  adminKey: string;
  onPendingCount?: (n: number) => void;
}) {
  const [contests, setContests] = useState<AnswerContest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("needs_review");
  const [busyId, setBusyId] = useState<string | null>(null);

  const qMap = useMemo(() => new Map(TRIVIA_QUESTIONS.map((q) => [q.id, q])), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/trivia/contest", { headers: { "x-admin-key": adminKey }, cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load contests");
      setContests(data.contests || []);
    } catch (e: any) {
      setError(e.message || "Failed to load contests");
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    onPendingCount?.(contests.filter((c) => c.status === "pending").length);
  }, [contests, onPendingCount]);

  async function decide(id: string, decision: "accept" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch("/api/trivia/contest", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ id, decision }),
      });
      if (res.ok) {
        const status: ContestStatus = decision === "accept" ? "admin_accepted" : "admin_rejected";
        setContests((prev) => prev.map((c) => (c.id === id ? { ...c, status, reviewedBy: "admin" } : c)));
      }
    } finally {
      setBusyId(null);
    }
  }

  const filtered = contests.filter((c) => {
    if (filter === "needs_review") return c.status === "pending" || c.status === "ai_accepted" || c.status === "ai_rejected";
    if (filter === "accepted") return c.status === "ai_accepted" || c.status === "admin_accepted";
    if (filter === "rejected") return c.status === "ai_rejected" || c.status === "admin_rejected";
    return true;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: "needs_review", label: "Needs Review" },
    { key: "accepted", label: "Upheld" },
    { key: "rejected", label: "Declined" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold" style={{ color: "var(--text)" }}>
            Answer Contests
          </h2>
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            Players flag answer keys they believe are wrong. The AI rules instantly when confident; you have the final say.
            Upholding a contest credits every player who picked that option.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-xl border hover:bg-[var(--bg-input)] text-[var(--text-dim)]"
          style={{ borderColor: "var(--border-dim)" }}
          title="Refresh contests"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-colors ${
              filter === f.key ? "font-bold bg-[var(--bg-card)]" : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
            }`}
            style={{ borderColor: "var(--border-dim)", color: filter === f.key ? "var(--olive)" : undefined }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-[var(--red)] font-mono">{error}</p>}

      {!loading && filtered.length === 0 && (
        <div className="surface border rounded-2xl p-8 text-center text-xs" style={{ borderColor: "var(--border-dim)", color: "var(--text-mute)" }}>
          <Flag size={20} className="mx-auto mb-2 opacity-60" />
          No contests in this view.
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((c) => {
          const q = qMap.get(c.questionId);
          const tone = statusTone(c.status);
          const isUpheld = c.status === "ai_accepted" || c.status === "admin_accepted";
          const isFinal = c.status === "admin_accepted" || c.status === "admin_rejected";
          return (
            <div key={c.id} className="surface border rounded-2xl p-5 space-y-3" style={{ borderColor: "var(--border-dim)" }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-mute)" }}>
                    <span>{c.questionId}</span>
                    {c.leagueCode && <span>· League {c.leagueCode}{c.dayNumber ? ` · Drop ${c.dayNumber}` : ""}</span>}
                    <span>· {new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                    {q?.question || c.questionText}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0" style={{ background: tone.bg, color: tone.color }}>
                  {STATUS_LABEL[c.status]}
                </span>
              </div>

              {q && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, idx) => {
                    const isOfficial = idx === c.officialAnswer;
                    const isContested = idx === c.contestedAnswer;
                    return (
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-lg border flex items-center justify-between gap-2"
                        style={{
                          borderColor: isContested ? "var(--gold)" : isOfficial ? "var(--olive)" : "var(--border-dim)",
                          color: isOfficial || isContested ? "var(--text)" : "var(--text-mute)",
                        }}
                      >
                        <span>{opt}</span>
                        <span className="text-[9px] font-mono uppercase font-bold">
                          {isOfficial ? "Official" : isContested ? "Contested" : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {q?.explanation && (
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  <strong>Explanation:</strong> {q.explanation}
                </p>
              )}

              {c.reason && (
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  <strong>{c.username || "Player"}:</strong> {c.reason}
                </p>
              )}

              {c.aiVerdict && (
                <div className="text-[11px] p-2.5 rounded-lg bg-[var(--bg-input)] flex items-start gap-2" style={{ color: "var(--text-dim)" }}>
                  {c.aiVerdict === "unavailable" ? <Hourglass size={13} className="shrink-0 mt-0.5" /> : <Bot size={13} className="shrink-0 mt-0.5" />}
                  <span>
                    <strong>AI:</strong> {c.aiVerdict.replace("_", " ")}
                    {typeof c.aiConfidence === "number" && c.aiVerdict !== "unavailable" ? ` (${Math.round(c.aiConfidence * 100)}%)` : ""}
                    {c.aiReason ? ` — ${c.aiReason}` : ""}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                {(!isFinal || !isUpheld) && (
                  <button
                    onClick={() => decide(c.id, "accept")}
                    disabled={busyId === c.id || c.status === "admin_accepted"}
                    className="btn-terra px-3.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 size={12} />
                    Uphold & Award Points
                  </button>
                )}
                {(!isFinal || isUpheld) && (
                  <button
                    onClick={() => decide(c.id, "reject")}
                    disabled={busyId === c.id || c.status === "admin_rejected"}
                    className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold border inline-flex items-center gap-1.5 text-[var(--text-dim)] hover:bg-[var(--bg-input)] disabled:opacity-50"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <XCircle size={12} />
                    {isUpheld ? "Revoke" : "Decline"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
