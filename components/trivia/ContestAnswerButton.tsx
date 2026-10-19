"use client";

import { useState } from "react";
import { Flag, Loader2, CheckCircle2, XCircle, Hourglass } from "lucide-react";
import type { TriviaQuestion } from "@/lib/trivia-questions";
import { setAnswerOverrides } from "@/lib/trivia-answer-overrides";
import { useAppStore } from "@/store/useAppStore";

type ContestResult = "accepted" | "rejected" | "pending";

interface ContestAnswerButtonProps {
  question: TriviaQuestion;
  /** Option the player picked (must differ from the official answer). */
  selected: number;
  leagueCode?: string;
  dayNumber?: number;
  /** Called when the contest is accepted so the caller can credit the point immediately. */
  onAccepted?: (questionId: string, selected: number) => void;
}

/**
 * Lets a player flag an answer key they believe is wrong.
 * The AI reviewer rules instantly when confident; otherwise the contest waits for admin review.
 * Accepted contests regrade every stored score that picked the same option.
 */
export default function ContestAnswerButton({
  question,
  selected,
  leagueCode,
  dayNumber,
  onAccepted,
}: ContestAnswerButtonProps) {
  const profile = useAppStore((s) => s.profile);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ContestResult | null>(null);
  const [message, setMessage] = useState("");

  if (selected < 0 || selected === question.answer) return null;

  async function submit() {
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/trivia/contest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          selected,
          reason: reason.trim() || undefined,
          userId: profile?.id,
          username: profile?.username,
          leagueCode,
          dayNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Could not submit your contest.");
        return;
      }
      if (data.overrides) setAnswerOverrides(data.overrides);

      const status: string = data.contest?.status || "pending";
      const aiReason: string = data.contest?.aiReason || "";
      if (status === "ai_accepted" || status === "admin_accepted") {
        setResult("accepted");
        setMessage(aiReason ? `You were right. ${aiReason}` : "You were right. Your point has been awarded.");
        onAccepted?.(question.id, selected);
      } else if (status === "ai_rejected" || status === "admin_rejected") {
        setResult("rejected");
        setMessage(
          aiReason
            ? `The official answer stands. ${aiReason} An admin can still review this.`
            : "The official answer stands."
        );
      } else {
        setResult("pending");
        setMessage("Sent for admin review. If upheld, your score updates automatically.");
      }
      setOpen(false);
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const tone =
      result === "accepted"
        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
        : result === "rejected"
        ? "bg-[var(--bg-input)] border-[var(--border-dim)] text-[var(--text-dim)]"
        : "bg-[var(--bg-input)] border-[var(--border-dim)] text-[var(--olive)]";
    const Icon = result === "accepted" ? CheckCircle2 : result === "rejected" ? XCircle : Hourglass;
    return (
      <div className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${tone}`}>
        <Icon size={14} className="shrink-0 mt-0.5" />
        <span>{message}</span>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold text-[var(--text-dim)] hover:text-[var(--olive)] hover:border-[var(--olive)] transition-colors"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <Flag size={12} />
        Contest Answer
      </button>
    );
  }

  return (
    <div className="p-3.5 rounded-xl border space-y-2.5 bg-[var(--bg-input)]" style={{ borderColor: "var(--border-dim)" }}>
      <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>
        Think &ldquo;{question.options[selected]}&rdquo; is correct?
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value.slice(0, 500))}
        rows={2}
        placeholder="Why? (optional, helps the reviewer)"
        className="w-full text-xs p-2.5 rounded-lg border bg-[var(--bg-card)] resize-none focus:outline-none focus:border-[var(--olive)]"
        style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
      />
      <p className="text-[10px] text-[var(--text-mute)] flex items-center gap-1">
        ⏱️ Clock is paused while you contest or review.
      </p>
      {message && <p className="text-[11px] text-[var(--red)]">{message}</p>}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={submitting}
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[var(--text-dim)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="btn-terra px-3.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 disabled:opacity-60"
        >
          {submitting && <Loader2 size={12} className="animate-spin" />}
          {submitting ? "Referee Reviewing..." : "Submit Contest"}
        </button>
      </div>
    </div>
  );
}
