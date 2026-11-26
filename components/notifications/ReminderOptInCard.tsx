"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, Share, SquarePlus, Check, X } from "lucide-react";
import { analytics } from "@/lib/analytics";
import {
  formatReminderTime,
  getPushEnvironment,
  setPromptState,
  shouldShowReminderPrompt,
  subscribeToReminders,
  suggestedReminderMinutes,
  type PushEnvironment,
} from "@/lib/push-notifications";

type ModalState = "hidden" | "ask" | "ios-install" | "working" | "done" | "denied";
export type ReminderPromptContext = "sprint" | "league" | "classroom";

/**
 * Centered soft-ask popup for practice & league reminders, shown ~900ms after a milestone
 * so the celebration lands first and the prompt isn't buried below the fold.
 * Shares a single 7-day snooze across sprints, leagues, and classrooms so users are never double-asked.
 * The native browser permission dialog only appears after the user taps "Remind me".
 */
export default function ReminderOptInCard({
  userId,
  streak,
  categories,
  context = "sprint",
}: {
  userId: string;
  streak: number;
  categories?: string[];
  context?: ReminderPromptContext;
}) {
  const [state, setState] = useState<ModalState>("hidden");
  const [env, setEnv] = useState<PushEnvironment>("unsupported");
  const [reminderMinutes, setReminderMinutes] = useState(() => suggestedReminderMinutes());

  useEffect(() => {
    if (!shouldShowReminderPrompt()) return;
    const detected = getPushEnvironment();
    setEnv(detected);
    setReminderMinutes(suggestedReminderMinutes());
    const timer = setTimeout(() => {
      setState(detected === "ios-needs-install" ? "ios-install" : "ask");
      analytics.track("reminder_prompt_shown", { variant: detected, streak, presentation: "modal", context });
    }, 900);
    return () => clearTimeout(timer);
  }, [streak, context]);

  useEffect(() => {
    if (state === "hidden" || state === "working") return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (state === "done" || state === "denied") {
          setState("hidden");
        } else {
          setPromptState({ status: "dismissed", at: Date.now() });
          analytics.track("reminder_prompt_dismissed", { variant: env, streak, presentation: "modal" });
          setState("hidden");
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state, env, streak]);

  const timeLabel = formatReminderTime(reminderMinutes);

  async function handleAccept() {
    setState("working");
    const result = await subscribeToReminders({ userId, reminderMinutes, streak, categories });
    if (result.ok) {
      setPromptState({ status: "accepted", at: Date.now(), reminderMinutes });
      analytics.track("reminder_opt_in", { stored: result.stored, reminderMinutes, streak, presentation: "modal" });
      setState("done");
    } else if (result.reason === "denied") {
      setPromptState({ status: "denied", at: Date.now() });
      analytics.track("reminder_permission_denied", { streak, presentation: "modal" });
      setState("denied");
    } else {
      setPromptState({ status: "dismissed", at: Date.now() });
      analytics.track("reminder_permission_dismissed", { reason: result.reason, streak, presentation: "modal" });
      setState("hidden");
    }
  }

  function handleDismiss() {
    if (state === "working") return;
    if (state === "ask" || state === "ios-install") {
      setPromptState({ status: "dismissed", at: Date.now() });
      analytics.track("reminder_prompt_dismissed", { variant: env, streak, presentation: "modal" });
    }
    setState("hidden");
  }

  const isOpen = state !== "hidden";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="reminder-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
          onClick={handleDismiss}
          role="dialog"
          aria-modal="true"
          aria-labelledby="fey-reminder-modal-title"
        >
          <motion.div
            key="reminder-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl p-6 border shadow-2xl text-left"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
            }}
          >
            <button
              type="button"
              onClick={handleDismiss}
              disabled={state === "working"}
              aria-label="Close reminder prompt"
              className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-[var(--bg-input)] disabled:opacity-40 cursor-pointer"
              style={{ color: "var(--text-mute)" }}
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mb-3 pr-8">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0"
                style={{
                  borderColor: "var(--border-dim)",
                  background: "var(--bg-input)",
                }}
              >
                {state === "done" ? (
                  <Check size={17} className="text-[var(--olive)]" />
                ) : (
                  <BellRing size={17} className="text-[var(--olive)]" />
                )}
              </div>
              <div>
                <h3
                  id="fey-reminder-modal-title"
                  className="font-serif font-bold text-base leading-snug"
                  style={{ color: "var(--text)" }}
                >
                  {state === "done"
                    ? "Reminders on"
                    : state === "denied"
                    ? "Notifications blocked"
                    : context === "league"
                    ? "Don't miss the next drop"
                    : context === "classroom"
                    ? "Hear when friends record"
                    : "Keep this going?"}
                </h3>
                {streak > 0 && context === "sprint" && state !== "done" && state !== "denied" && (
                  <p className="text-[11px] font-mono" style={{ color: "var(--gold)" }}>
                    {streak === 1 ? "Day 1 complete" : `${streak}-day streak active`}
                  </p>
                )}
              </div>
            </div>

            {state === "ask" || state === "working" ? (
              <>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-dim)" }}>
                  {context === "league" ? (
                    <>
                      Get notified when the next drop unlocks, friends post scores, or your daily
                      practice time comes around. Never late at night.
                    </>
                  ) : context === "classroom" ? (
                    <>
                      Get notified when someone in your Classroom records a take, unlocks the next
                      topic, or leaves a margin note. Never late at night.
                    </>
                  ) : (
                    <>
                      I&apos;ll remind you tomorrow around{" "}
                      <strong style={{ color: "var(--text)" }}>{timeLabel}</strong>, close to when you
                      practised today. One reminder a day, never late at night.
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={state === "working"}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60 cursor-pointer"
                    style={{ background: "var(--terra)" }}
                  >
                    {state === "working" ? "Setting up..." : "Remind me"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    disabled={state === "working"}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--bg-input)] cursor-pointer"
                    style={{ color: "var(--text-dim)" }}
                  >
                    Not now
                  </button>
                </div>
              </>
            ) : null}

            {state === "ios-install" ? (
              <>
                <p className="text-sm leading-relaxed mb-3.5" style={{ color: "var(--text-dim)" }}>
                  On iPhone, reminders only work once Fey is on your Home Screen. It takes two taps:
                </p>
                <ol className="space-y-2.5 mb-4 text-sm" style={{ color: "var(--text)" }}>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[var(--text-mute)]">1</span>
                    Tap <Share size={14} className="text-[var(--olive)]" /> <strong>Share</strong> in Safari
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[var(--text-mute)]">2</span>
                    Choose <SquarePlus size={14} className="text-[var(--olive)]" /> <strong>Add to Home Screen</strong>
                  </li>
                </ol>
                <p className="text-xs mb-5" style={{ color: "var(--text-mute)" }}>
                  Then open Fey from your Home Screen and finish a sprint to turn on reminders.
                </p>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                  style={{ background: "var(--terra)" }}
                >
                  Got it
                </button>
              </>
            ) : null}

            {state === "done" ? (
              <>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-dim)" }}>
                  {context === "league" ? (
                    <>You&apos;ll hear when new drops open or friends post scores.</>
                  ) : context === "classroom" ? (
                    <>You&apos;ll hear when friends record or unlock the next topic.</>
                  ) : (
                    <>
                      You&apos;ll hear from me tomorrow around{" "}
                      <strong style={{ color: "var(--text)" }}>{timeLabel}</strong>, unless you&apos;ve
                      already practised.
                    </>
                  )}
                </p>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                  style={{ background: "var(--terra)" }}
                >
                  Done
                </button>
              </>
            ) : null}

            {state === "denied" ? (
              <>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-dim)" }}>
                  Notifications are blocked for Fey. You can allow them anytime in your browser&apos;s
                  site settings.
                </p>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-[var(--bg-input)] cursor-pointer"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  Close
                </button>
              </>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
