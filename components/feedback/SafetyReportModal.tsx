"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, X, CheckCircle2, AlertTriangle, Mail } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { analytics } from "@/lib/analytics";

interface SafetyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoomId?: string;
  initialTargetUser?: string;
}

const CATEGORIES = [
  { id: "harassment", label: "Harassment or bullying in voice room / salon" },
  { id: "offensive_speech", label: "Offensive language or hate speech in speech recording" },
  { id: "inappropriate_content", label: "Inappropriate custom topic or slide content" },
  { id: "cheating_exploit", label: "Cheating, botting, or platform exploit" },
  { id: "other", label: "Other trust & safety concern" },
];

export default function SafetyReportModal({
  isOpen,
  onClose,
  initialRoomId,
  initialTargetUser,
}: SafetyReportModalProps) {
  const profile = useAppStore((s) => s.profile);
  const isRegistered = Boolean(profile.id && profile.hasClaimedAccount);

  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [details, setDetails] = useState("");
  const [targetUser, setTargetUser] = useState(initialTargetUser || "");
  const [roomId, setRoomId] = useState(initialRoomId || "");
  const [guestEmail, setGuestEmail] = useState(profile.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      setError("Please describe what occurred.");
      return;
    }

    if (!isRegistered && (!guestEmail || !guestEmail.includes("@"))) {
      setError("Please provide a valid email so our trust & safety team can follow up with you.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/safety/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterId: isRegistered ? profile.id : undefined,
          reporterEmail: guestEmail.trim() || profile.email,
          reporterUsername: profile.username || "Guest Scholar",
          category,
          details: details.trim(),
          targetUser: targetUser.trim() || undefined,
          roomId: roomId.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit incident report.");
      }

      // Track in PostHog
      analytics.trackIncidentReported({
        category,
        hasEmail: Boolean(guestEmail || profile.email),
        isRegistered,
        roomId: roomId.trim() || undefined,
        targetUser: targetUser.trim() || undefined,
      });

      setSubmitted(true);
      setTimeout(() => {
        setTimeout(() => {
          setSubmitted(false);
          setDetails("");
          onClose();
        }, 2200);
      }, 300);
    } catch (err: any) {
      setError(err.message || "Failed to send report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative w-full max-w-lg surface border rounded-2xl p-6 shadow-2xl z-10"
        style={{ borderColor: "var(--border-dim)" }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-[var(--bg-input)] transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-3"
          >
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
              style={{ background: "rgba(122, 28, 46, 0.15)", color: "var(--terra)" }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold" style={{ color: "var(--text)" }}>
              Report Received
            </h3>
            <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--text-dim)" }}>
              Our moderation team reviews every report. We hold the safety and dignity of our scholars above all else.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(122, 28, 46, 0.12)", color: "var(--terra)" }}
              >
                <ShieldAlert size={20} />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold" style={{ color: "var(--text)" }}>
                  Safety & Incident Report
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                  Flag misconduct, offensive audio, or toxic behavior. Reports go straight to the moderation desk.
                </p>
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase font-bold tracking-wider" style={{ color: "var(--text-mute)" }}>
                Nature of Incident
              </label>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors"
                    style={{
                      background: category === cat.id ? "rgba(122, 28, 46, 0.08)" : "var(--bg-input)",
                      borderColor: category === cat.id ? "var(--terra)" : "var(--border-dim)",
                      color: "var(--text)",
                    }}
                  >
                    <input
                      type="radio"
                      name="incident-category"
                      value={cat.id}
                      checked={category === cat.id}
                      onChange={() => setCategory(cat.id)}
                      className="accent-[var(--terra)]"
                    />
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Context: Room code or user (optional) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono uppercase" style={{ color: "var(--text-mute)" }}>
                  Reported User (Optional)
                </label>
                <input
                  type="text"
                  placeholder="@scholar_name"
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  className="w-full text-xs rounded-xl p-2.5 border mt-1 focus:outline-none focus:ring-1 focus:ring-[var(--terra)]"
                  style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)", color: "var(--text)" }}
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase" style={{ color: "var(--text-mute)" }}>
                  Room / Deck Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ROOM-1234"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full text-xs rounded-xl p-2.5 border mt-1 focus:outline-none focus:ring-1 focus:ring-[var(--terra)]"
                  style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)", color: "var(--text)" }}
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase font-bold tracking-wider" style={{ color: "var(--text-mute)" }}>
                What happened?
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please describe the incident with as much context as possible..."
                className="w-full text-xs rounded-xl p-3 resize-none border focus:outline-none focus:ring-1 focus:ring-[var(--terra)]"
                style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)", color: "var(--text)" }}
                required
              />
            </div>

            {/* Unregistered User Email Field */}
            {!isRegistered && (
              <div
                className="p-3 rounded-xl border space-y-1.5"
                style={{ background: "rgba(192, 156, 72, 0.08)", borderColor: "rgba(192, 156, 72, 0.25)" }}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--gold)" }}>
                  <Mail size={13} />
                  <span>Your Contact Email (Unregistered Scholar)</span>
                </div>
                <p className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                  Since you are browsing as a guest, please provide an email address so our moderation desk can follow up regarding this report.
                </p>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full text-xs rounded-lg p-2 border focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)", color: "var(--text)" }}
                  required
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-xs text-[var(--terra)] font-mono">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono" style={{ color: "var(--text-mute)" }}>
                {isRegistered ? `Reporting as @${profile.username}` : "Guest report"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-medium hover:bg-[var(--bg-input)] transition-colors"
                  style={{ color: "var(--text-mute)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-sm disabled:opacity-40 hover:brightness-110 active:scale-95 cursor-pointer text-white"
                  style={{ background: "var(--terra)" }}
                >
                  {submitting ? "Submitting..." : "Send Incident Report"}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
