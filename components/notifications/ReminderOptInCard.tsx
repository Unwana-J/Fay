"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BellRing, Share, SquarePlus, Check } from "lucide-react";
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

type CardState = "hidden" | "ask" | "ios-install" | "working" | "done" | "denied";

/**
 * Soft-ask for practice reminders, shown on the sprint completion screen.
 * The native permission dialog only appears after the user taps "Remind me".
 */
export default function ReminderOptInCard({
  userId,
  streak,
  categories,
}: {
  userId: string;
  streak: number;
  categories?: string[];
}) {
  const [state, setState] = useState<CardState>("hidden");
  const [env, setEnv] = useState<PushEnvironment>("unsupported");
  const [reminderMinutes, setReminderMinutes] = useState(() => suggestedReminderMinutes());

  useEffect(() => {
    if (!shouldShowReminderPrompt()) return;
    const detected = getPushEnvironment();
    setEnv(detected);
    setReminderMinutes(suggestedReminderMinutes());
    setState(detected === "ios-needs-install" ? "ios-install" : "ask");
    analytics.track("reminder_prompt_shown", { variant: detected, streak });
  }, [streak]);

  if (state === "hidden") return null;

  const timeLabel = formatReminderTime(reminderMinutes);

  async function handleAccept() {
    setState("working");
    const result = await subscribeToReminders({ userId, reminderMinutes, streak, categories });
    if (result.ok) {
      setPromptState({ status: "accepted", at: Date.now(), reminderMinutes });
      analytics.track("reminder_opt_in", { stored: result.stored, reminderMinutes, streak });
      setState("done");
    } else if (result.reason === "denied") {
      setPromptState({ status: "denied", at: Date.now() });
      analytics.track("reminder_permission_denied", { streak });
      setState("denied");
    } else {
      setPromptState({ status: "dismissed", at: Date.now() });
      analytics.track("reminder_permission_dismissed", { reason: result.reason, streak });
      setState("hidden");
    }
  }

  function handleDismiss() {
    setPromptState({ status: "dismissed", at: Date.now() });
    analytics.track("reminder_prompt_dismissed", { variant: env, streak });
    setState("hidden");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.46 }}
      className="w-full rounded-2xl p-5 border surface text-left"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <BellRing size={15} className="text-[var(--olive)]" />
        <span className="font-serif font-bold text-sm" style={{ color: "var(--text)" }}>
          {state === "done" ? "Reminder set" : "Keep this going?"}
        </span>
      </div>

      {state === "ask" || state === "working" ? (
        <>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-dim)" }}>
            I&apos;ll remind you tomorrow around <strong style={{ color: "var(--text)" }}>{timeLabel}</strong>,
            close to when you practised today. One reminder a day, never late at night.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleAccept}
              disabled={state === "working"}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60"
              style={{ background: "var(--terra)" }}
            >
              {state === "working" ? "Setting up..." : "Remind me"}
            </button>
            <button
              onClick={handleDismiss}
              disabled={state === "working"}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--bg-input)]"
              style={{ color: "var(--text-dim)" }}
            >
              Not now
            </button>
          </div>
        </>
      ) : null}

      {state === "ios-install" ? (
        <>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>
            On iPhone, reminders only work once Fey is on your Home Screen. It takes two taps:
          </p>
          <ol className="space-y-2 mb-4 text-sm" style={{ color: "var(--text)" }}>
            <li className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--text-mute)]">1</span>
              Tap <Share size={14} className="text-[var(--olive)]" /> <strong>Share</strong> in Safari
            </li>
            <li className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--text-mute)]">2</span>
              Choose <SquarePlus size={14} className="text-[var(--olive)]" /> <strong>Add to Home Screen</strong>
            </li>
          </ol>
          <p className="text-xs mb-4" style={{ color: "var(--text-mute)" }}>
            Then open Fey from your Home Screen and finish a sprint to turn on reminders.
          </p>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-[var(--bg-input)]"
            style={{ color: "var(--text-dim)" }}
          >
            Got it
          </button>
        </>
      ) : null}

      {state === "done" ? (
        <p className="text-sm leading-relaxed flex items-start gap-2" style={{ color: "var(--text-dim)" }}>
          <Check size={15} className="text-[var(--olive)] mt-0.5 shrink-0" />
          <span>
            You&apos;ll hear from me tomorrow around <strong style={{ color: "var(--text)" }}>{timeLabel}</strong>,
            unless you&apos;ve already practised.
          </span>
        </p>
      ) : null}

      {state === "denied" ? (
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
          Notifications are blocked for Fey. You can allow them later in your browser&apos;s site settings.
        </p>
      ) : null}
    </motion.div>
  );
}
