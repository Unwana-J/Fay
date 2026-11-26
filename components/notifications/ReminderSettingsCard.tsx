"use client";

import { useEffect, useState } from "react";
import { BellRing, Check, Share, SquarePlus } from "lucide-react";
import { analytics } from "@/lib/analytics";
import {
  formatReminderTime,
  getPromptState,
  getPushEnvironment,
  getStoredPushEndpoint,
  sendTestPush,
  setPromptState,
  subscribeToReminders,
  suggestedReminderMinutes,
  updateReminderPreferences,
  type PushEnvironment,
} from "@/lib/push-notifications";

const TIME_SLOTS: number[] = [];
for (let m = 8 * 60; m <= 21 * 60 + 30; m += 30) TIME_SLOTS.push(m);

const PAUSED_KEY = "fey:reminders-paused";

export default function ReminderSettingsCard({
  userId,
  streak,
  categories,
}: {
  userId: string;
  streak: number;
  categories?: string[];
}) {
  const [env, setEnv] = useState<PushEnvironment>("unsupported");
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [hasEndpoint, setHasEndpoint] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(20 * 60);
  const [busy, setBusy] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  useEffect(() => {
    const detected = getPushEnvironment();
    setEnv(detected);
    if (detected === "supported") setPermission(Notification.permission);
    setHasEndpoint(Boolean(getStoredPushEndpoint()));
    try {
      setPaused(localStorage.getItem(PAUSED_KEY) === "1");
    } catch {
      /* ignore */
    }
    const saved = getPromptState()?.reminderMinutes;
    const raw = typeof saved === "number" ? saved : suggestedReminderMinutes();
    const snapped = Math.min(21 * 60 + 30, Math.max(8 * 60, Math.round(raw / 30) * 30));
    setReminderMinutes(snapped);
  }, []);

  const isSubscribed = env === "supported" && permission === "granted" && hasEndpoint;

  async function handleEnable() {
    setBusy(true);
    setStatusNote(null);
    const res = await subscribeToReminders({ userId, reminderMinutes, streak, categories });
    setBusy(false);
    if (res.ok) {
      setPermission("granted");
      setHasEndpoint(Boolean(getStoredPushEndpoint()));
      setPaused(false);
      try {
        localStorage.removeItem(PAUSED_KEY);
      } catch {
        /* ignore */
      }
      setPromptState({ status: "accepted", at: Date.now(), reminderMinutes });
      analytics.track("reminder_opt_in", { stored: res.stored, reminderMinutes, streak, presentation: "profile" });
      setStatusNote(res.stored ? "Reminders enabled." : "Permission granted (storage pending).");
    } else if (res.reason === "denied") {
      setPermission("denied");
      setPromptState({ status: "denied", at: Date.now() });
      setStatusNote("Notifications are blocked in your browser settings.");
    } else {
      setStatusNote("Could not enable reminders right now.");
    }
  }

  async function handleTogglePause() {
    const nextPaused = !paused;
    setBusy(true);
    setStatusNote(null);
    const ok = await updateReminderPreferences({ enabled: !nextPaused });
    setBusy(false);
    if (ok) {
      setPaused(nextPaused);
      try {
        if (nextPaused) localStorage.setItem(PAUSED_KEY, "1");
        else localStorage.removeItem(PAUSED_KEY);
      } catch {
        /* ignore */
      }
      analytics.track(nextPaused ? "reminder_paused" : "reminder_resumed", { presentation: "profile" });
      setStatusNote(nextPaused ? "Reminders paused." : "Reminders resumed.");
    } else {
      setStatusNote("Could not update preference.");
    }
  }

  async function handleTimeChange(nextMinutes: number) {
    setReminderMinutes(nextMinutes);
    if (!isSubscribed) return;
    setStatusNote(null);
    const ok = await updateReminderPreferences({ reminderMinutes: nextMinutes });
    if (ok) {
      analytics.track("reminder_time_changed", { reminderMinutes: nextMinutes });
      setStatusNote(`Daily time updated to ${formatReminderTime(nextMinutes)}.`);
    }
  }

  async function handleSendTest() {
    setBusy(true);
    setStatusNote(null);
    let res = await sendTestPush();
    // Auto-resync if the browser already has permission/endpoint locally but the server row is missing
    if (!res.ok && (res.status === 404 || res.status === 410)) {
      const synced = await subscribeToReminders({ userId, reminderMinutes, streak, categories });
      if (synced.ok && synced.stored) {
        res = await sendTestPush();
      } else if (synced.ok && !synced.stored) {
        setBusy(false);
        setStatusNote("Could not save subscription to server. Check SUPABASE_SERVICE_ROLE_KEY.");
        return;
      }
    }
    setBusy(false);
    setStatusNote(res.ok ? "Test notification sent." : res.error || "Could not send test.");
  }

  return (
    <div className="rounded-2xl p-5 surface border" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <BellRing size={15} className="text-[var(--olive)]" />
          <h3 className="text-heading text-sm font-semibold" style={{ color: "var(--text)" }}>
            Practice &amp; League Reminders
          </h3>
        </div>
        <span
          className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full border"
          style={{
            borderColor: isSubscribed && !paused ? "var(--olive)" : "var(--border-dim)",
            color: isSubscribed && !paused ? "var(--olive-text)" : "var(--text-mute)",
            background: isSubscribed && !paused ? "var(--bg-input)" : "transparent",
          }}
        >
          {permission === "denied"
            ? "Blocked"
            : isSubscribed
            ? paused
              ? "Paused"
              : "Active"
            : "Off"}
        </span>
      </div>

      {env === "ios-needs-install" ? (
        <div className="space-y-2.5 text-xs" style={{ color: "var(--text-dim)" }}>
          <p>On iPhone, add Fey to your Home Screen first to enable notifications:</p>
          <ol className="space-y-1.5" style={{ color: "var(--text)" }}>
            <li className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-[var(--text-mute)]">1</span>
              Tap <Share size={12} className="text-[var(--olive)]" /> <strong>Share</strong> in Safari
            </li>
            <li className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-[var(--text-mute)]">2</span>
              Tap <SquarePlus size={12} className="text-[var(--olive)]" /> <strong>Add to Home Screen</strong>
            </li>
          </ol>
        </div>
      ) : env === "unsupported" ? (
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
          This browser doesn&apos;t support Web Push notifications. Try Chrome, Edge, or Safari on a
          Home Screen install.
        </p>
      ) : permission === "denied" ? (
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
          Notifications are blocked for Fey in this browser. Allow them in your browser&apos;s site
          settings, then reload this page.
        </p>
      ) : !isSubscribed ? (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
            Get one daily practice nudge at your chosen time, plus instant alerts when friends
            record in your Classroom or unlock a league drop. Never late at night.
          </p>
          <button
            type="button"
            onClick={handleEnable}
            disabled={busy}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white transition-opacity disabled:opacity-60 cursor-pointer"
            style={{ background: "var(--terra)" }}
          >
            {busy ? "Setting up..." : "Turn on reminders"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="fey-reminder-time" className="text-xs font-medium" style={{ color: "var(--text-dim)" }}>
              Daily reminder time
            </label>
            <select
              id="fey-reminder-time"
              value={reminderMinutes}
              onChange={(e) => handleTimeChange(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg border text-xs font-mono"
              style={{
                borderColor: "var(--border-dim)",
                background: "var(--bg-input)",
                color: "var(--text)",
              }}
            >
              {TIME_SLOTS.map((m) => (
                <option key={m} value={m}>
                  {formatReminderTime(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePause}
              disabled={busy}
              className="flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors hover:bg-[var(--bg-input)] disabled:opacity-50 cursor-pointer"
              style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
            >
              {paused ? "Resume reminders" : "Pause reminders"}
            </button>
            <button
              type="button"
              onClick={handleSendTest}
              disabled={busy || paused}
              className="flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-colors hover:bg-[var(--bg-input)] disabled:opacity-50 cursor-pointer"
              style={{ borderColor: "var(--border-dim)", color: "var(--olive-text)" }}
            >
              Send test
            </button>
          </div>
        </div>
      )}

      {statusNote && (
        <p className="mt-3 text-[11px] flex items-center gap-1.5" style={{ color: "var(--olive-text)" }}>
          <Check size={12} className="shrink-0" />
          <span>{statusNote}</span>
        </p>
      )}
    </div>
  );
}
