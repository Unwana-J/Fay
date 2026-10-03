"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Sparkles, X, MessageSquareHeart } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import FeedbackModal from "./FeedbackModal";
import SafetyReportModal from "./SafetyReportModal";

export default function FloatingFeedbackWidget() {
  const pathname = usePathname();
  const [minimized, setMinimized] = useState(false);

  // Store controls
  const isFeedbackPromptOpen = useAppStore((s) => s.isFeedbackPromptOpen);
  const openFeedbackPrompt = useAppStore((s) => s.openFeedbackPrompt);
  const closeFeedbackPrompt = useAppStore((s) => s.closeFeedbackPrompt);
  const feedbackTriggerActivity = useAppStore((s) => s.feedbackTriggerActivity);

  const isSafetyModalOpen = useAppStore((s) => s.isSafetyModalOpen);
  const openSafetyModal = useAppStore((s) => s.openSafetyModal);
  const closeSafetyModal = useAppStore((s) => s.closeSafetyModal);
  const safetyModalContext = useAppStore((s) => s.safetyModalContext);

  const feedbackSchedule = useAppStore((s) => s.feedbackSchedule);

  // Check if user submitted feedback in the last 30 days
  const hasSubmittedRecently = (() => {
    if (!feedbackSchedule?.hasSubmitted || !feedbackSchedule?.lastSubmittedAt) return false;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return Date.now() - feedbackSchedule.lastSubmittedAt < thirtyDaysMs;
  })();

  // Hide on admin portal
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* ── High-Visibility Floating Scholar Pill (Bottom-Right) ── */}
      <div className="fixed bottom-5 right-5 z-40 select-none">
        <AnimatePresence mode="wait">
          {hasSubmittedRecently ? (
            /* User already submitted within 30 days: Feedback trigger leaves the screen, only discreet Safety pill remains */
            <motion.div
              key="safety-only"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-[0_4px_20px_rgba(30,34,17,0.14)] hover:shadow-[0_6px_24px_rgba(30,34,17,0.18)] transition-all backdrop-blur-md cursor-pointer group"
              style={{
                background: "#FAF7F2",
                borderColor: "rgba(68, 78, 44, 0.22)",
              }}
              onClick={() => openSafetyModal()}
              title="Report safety incident or misconduct"
            >
              <ShieldAlert size={14} className="text-[#7A1C2E] group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-[11px] font-mono text-[#7A1C2E]">Safety</span>
            </motion.div>
          ) : !minimized ? (
            <motion.div
              key="feedback-full"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border shadow-[0_4px_24px_rgba(30,34,17,0.16)] transition-all hover:shadow-[0_6px_28px_rgba(30,34,17,0.22)] backdrop-blur-md"
              style={{
                background: "#FAF7F2", // Bright warm cream surface for unmistakable contrast
                borderColor: "rgba(68, 78, 44, 0.22)",
              }}
            >
              {/* Primary Feedback Trigger: "You dey feel am?" */}
              <button
                type="button"
                onClick={() => openFeedbackPrompt("floating_dock")}
                className="flex items-center gap-2 pr-1.5 rounded-full text-xs font-mono font-bold transition-all hover:opacity-85 active:scale-95 group cursor-pointer"
                style={{ color: "#1E2211" }} // High-contrast deep forest text
                title="Tell us what you think: You dey feel am?"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: "rgba(166, 124, 30, 0.16)", color: "#8A6615" }}
                >
                  <Sparkles size={13} className="fill-amber-400 text-amber-600" />
                </div>
                <span className="text-[12px] font-bold tracking-tight">You dey feel am?</span>
              </button>

              <div className="w-[1px] h-4 mx-0.5" style={{ background: "rgba(68, 78, 44, 0.18)" }} />

              {/* Safety Report Trigger */}
              <button
                type="button"
                onClick={() => openSafetyModal()}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-mono font-medium hover:bg-black/5 transition-all active:scale-95 cursor-pointer"
                style={{ color: "#7A1C2E" }}
                title="Report safety incident or misconduct"
                aria-label="Safety Desk"
              >
                <ShieldAlert size={14} className="text-[#7A1C2E]" />
                <span className="font-semibold text-[11px]">Safety</span>
              </button>

              {/* Discreet Minimize Button */}
              <button
                type="button"
                onClick={() => setMinimized(true)}
                className="p-1 rounded-full text-[var(--text-mute)] hover:text-[#1E2211] hover:bg-black/5 transition-colors ml-0.5"
                title="Minimize pill"
                aria-label="Minimize"
              >
                <X size={12} />
              </button>
            </motion.div>
          ) : (
            /* Minimized Icon Trigger (High Contrast & Visible) */
            <motion.button
              key="feedback-minimized"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={() => setMinimized(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-full border shadow-[0_4px_20px_rgba(0,0,0,0.14)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              style={{
                background: "#FAF7F2",
                borderColor: "rgba(68, 78, 44, 0.25)",
                color: "#1E2211",
              }}
              title="Expand feedback & safety desk"
            >
              <MessageSquareHeart size={15} className="text-amber-600 fill-amber-300" />
              <span className="text-xs font-mono font-bold">Feedback</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── "You dey feel am?" Modal ── */}
      <FeedbackModal
        isOpen={isFeedbackPromptOpen}
        onClose={closeFeedbackPrompt}
        triggerActivity={feedbackTriggerActivity}
      />

      {/* ── Safety Incident Report Modal ── */}
      <SafetyReportModal
        isOpen={isSafetyModalOpen}
        onClose={closeSafetyModal}
        initialRoomId={safetyModalContext?.roomId}
        initialTargetUser={safetyModalContext?.targetUser}
      />
    </>
  );
}
