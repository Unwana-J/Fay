"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { analytics } from "@/lib/analytics";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerActivity?: string;
}

export default function FeedbackModal({ isOpen, onClose, triggerActivity }: FeedbackModalProps) {
  const pathname = usePathname();
  const profile = useAppStore((s) => s.profile);
  const recordFeedbackSkipped = useAppStore((s) => s.recordFeedbackSkipped);
  const recordFeedbackSubmitted = useAppStore((s) => s.recordFeedbackSubmitted);
  const storeTriggerActivity = useAppStore((s) => s.feedbackTriggerActivity);

  const activeActivity = triggerActivity || storeTriggerActivity || "activity";

  const [rating, setRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeRating = hoverRating || rating || 0;
  const isDetractor = rating !== null && rating <= 3;

  const handleSkip = () => {
    setSkipped(true);
    recordFeedbackSkipped();

    // Track skip in PostHog
    analytics.track("feedback_skipped", {
      path: pathname || "/",
      activity: activeActivity,
      username: profile.username,
    });

    setTimeout(() => {
      setSkipped(false);
      setRating(null);
      setMessage("");
      onClose();
    }, 1800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError("Please pick a star rating first.");
      return;
    }
    if (!message.trim()) {
      setError("Please tell us your thoughts in the box below.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const promptType = rating <= 3 ? "what_could_be_better" : "extra_star_if";

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          promptType,
          message: message.trim(),
          userId: profile.id,
          username: profile.username || "Scholar",
          path: pathname || "/",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }

      // Track in PostHog
      analytics.trackFeedbackSubmitted({
        rating,
        promptType,
        message: message.trim(),
        path: pathname || "/",
        username: profile.username,
      });

      // Mark submitted in local store
      recordFeedbackSubmitted();

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setRating(null);
        setMessage("");
        onClose();
      }, 1300);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
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
        onClick={handleSkip}
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="relative w-full max-w-md surface border rounded-2xl p-6 shadow-2xl z-10"
        style={{ borderColor: "var(--border-dim)" }}
      >
        {/* Skip / Close Button */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-lg text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-[var(--bg-input)] transition-colors"
          aria-label="Skip"
          title="Skip"
        >
          <X size={18} />
        </button>

        {/* ── SKIPPED STATE ── */}
        {skipped ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-3"
          >
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-3xl"
              style={{ background: "rgba(192, 156, 72, 0.15)" }}
            >
              🎉
            </div>
            <h3 className="font-serif text-xl font-bold" style={{ color: "var(--text)" }}>
              Let's try this again sometime, Have fun!!
            </h3>
            <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--text-mute)" }}>
              We'll check back with you in a week. Enjoy your scholarship!
            </p>
          </motion.div>
        ) : submitted ? (
          /* ── SUBMITTED STATE ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-3"
          >
            <div
              className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
              style={{ background: "rgba(68, 78, 44, 0.15)", color: "var(--olive)" }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold" style={{ color: "var(--text)" }}>
              We hear you loud and clear!
            </h3>
            <p className="text-xs max-w-xs mx-auto" style={{ color: "var(--text-dim)" }}>
              Thank you, Scholar. Your candid feedback directly shapes the next iteration of Fey.
            </p>
          </motion.div>
        ) : (
          /* ── FEEDBACK FORM STATE ── */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-1 pr-6">
                <span className="text-xs font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded" style={{ background: "rgba(192, 156, 72, 0.15)", color: "var(--gold)" }}>
                  Scholar Pulse
                </span>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-[11px] font-mono text-[var(--text-mute)] hover:text-[var(--text)] underline decoration-dotted transition-colors"
                >
                  Skip for now →
                </button>
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
                You dey feel am?
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                Give us your genuine take. 1 to 5 stars, no filter.
              </p>
            </div>

            {/* 1-5 Star Interactive Selector */}
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = activeRating >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => {
                        setRating(starVal);
                        setError(null);
                      }}
                      className="p-1.5 transition-transform hover:scale-125 active:scale-95 focus:outline-none cursor-pointer"
                      aria-label={`${starVal} star${starVal > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={32}
                        className="transition-colors duration-200"
                        style={{
                          color: isFilled ? "var(--gold)" : "var(--border-dim)",
                          fill: isFilled ? "var(--gold)" : "transparent",
                          filter: isFilled ? "drop-shadow(0 2px 6px rgba(192, 156, 72, 0.4))" : "none",
                        }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Score Label */}
              <div className="text-xs font-mono font-medium h-4" style={{ color: "var(--text-dim)" }}>
                {activeRating === 1 && "E no reach at all 😕"}
                {activeRating === 2 && "E dey shaky 😐"}
                {activeRating === 3 && "E manage dey okay 🙂"}
                {activeRating === 4 && "E sweet well well! 😊"}
                {activeRating === 5 && "Omo, na fire! 🔥"}
              </div>
            </div>

            {/* Dynamic Prompt & Text Box (Appears based on star selection) */}
            <AnimatePresence mode="wait">
              {rating !== null && (
                <motion.div
                  key={rating <= 3 ? "detractor" : "promoter"}
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-2 overflow-hidden"
                >
                  <div className="flex items-center gap-2">
                    {isDetractor ? (
                      <MessageSquare size={15} style={{ color: "var(--terra)" }} />
                    ) : (
                      <Sparkles size={15} style={{ color: "var(--gold)" }} />
                    )}
                    <label
                      htmlFor="feedback-message"
                      className="font-serif text-sm font-semibold"
                      style={{ color: isDetractor ? "var(--terra)" : "var(--text)" }}
                    >
                      {isDetractor ? "What could be better?" : "I’d give an extra star if……"}
                    </label>
                  </div>

                  <textarea
                    id="feedback-message"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      isDetractor
                        ? "Tell us what felt slow, confusing, or didn't work the way you expected..."
                        : "What feature, topic, sound, or magic touch would make Fey completely unforgettable?..."
                    }
                    className="w-full text-xs rounded-xl p-3 resize-none border focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
                    style={{
                      background: "var(--bg-input)",
                      borderColor: "var(--border-dim)",
                      color: "var(--text)",
                    }}
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="text-xs text-[var(--terra)] font-mono">
                {error}
              </p>
            )}

            {/* Actions: Skip & Submit */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSkip}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium hover:bg-[var(--bg-input)] transition-colors text-[var(--text-mute)] hover:text-[var(--text)]"
              >
                Skip
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting || rating === null}
                  className="px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 cursor-pointer"
                  style={{
                    background: isDetractor ? "var(--terra)" : "var(--gold)",
                    color: "#1c1d17",
                  }}
                >
                  {submitting ? "Sending..." : "Submit Take"}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
