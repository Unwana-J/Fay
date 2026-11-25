"use client";

/**
 * Client helpers for Fey practice reminders (Web Push).
 *
 * Duolingo-style rules baked in here:
 * - Never ask for permission on page load; ask after a completed sprint, behind our own soft prompt.
 * - Reminder time defaults to ~23.5h after the user practised (30 minutes earlier than today's time).
 * - "Not now" snoozes the soft prompt for 7 days so we don't nag.
 */

const PROMPT_STATE_KEY = "fey:reminder-prompt";
const SUBSCRIPTION_ENDPOINT_KEY = "fey:push-endpoint";
const SNOOZE_DAYS = 7;

export type ReminderPromptStatus = "accepted" | "dismissed" | "denied";

export interface ReminderPromptState {
  status: ReminderPromptStatus;
  at: number;
  reminderMinutes?: number;
}

export type PushEnvironment =
  | "supported"
  | "ios-needs-install"
  | "unsupported";

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(ua) || iPadOS;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.("(display-mode: standalone)").matches || nav.standalone === true;
}

export function getPushEnvironment(): PushEnvironment {
  if (typeof window === "undefined") return "unsupported";
  const hasApis = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  // iOS only exposes Web Push to sites installed on the Home Screen (iOS 16.4+).
  if (isIOS() && !isStandalone()) return "ios-needs-install";
  return hasApis ? "supported" : "unsupported";
}

export function getPromptState(): ReminderPromptState | null {
  try {
    const raw = localStorage.getItem(PROMPT_STATE_KEY);
    return raw ? (JSON.parse(raw) as ReminderPromptState) : null;
  } catch {
    return null;
  }
}

export function setPromptState(state: ReminderPromptState) {
  try {
    localStorage.setItem(PROMPT_STATE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked — ignore */
  }
}

/** Whether the soft prompt should be shown right now. */
export function shouldShowReminderPrompt(): boolean {
  const env = getPushEnvironment();
  if (env === "unsupported") return false;
  if (env === "supported" && Notification.permission === "denied") return false;

  const state = getPromptState();
  if (!state) return true;
  if (state.status === "accepted") {
    // Re-offer only if the browser lost the permission (e.g. site data cleared).
    return env === "supported" && Notification.permission !== "granted";
  }
  if (state.status === "denied") return false;
  return Date.now() - state.at > SNOOZE_DAYS * 24 * 60 * 60 * 1000;
}

/** Duolingo's "23.5 hours later": today's practice time minus 30 minutes, rounded to 5 minutes. */
export function suggestedReminderMinutes(now = new Date()): number {
  const minutes = now.getHours() * 60 + now.getMinutes() - 30;
  const wrapped = (minutes + 24 * 60) % (24 * 60);
  const rounded = Math.round(wrapped / 5) * 5;
  // Respect quiet hours (22:00–08:00): clamp into the allowed window.
  if (rounded >= 22 * 60) return 21 * 60 + 30;
  if (rounded < 8 * 60) return 8 * 60;
  return rounded;
}

export function formatReminderTime(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")}${suffix}`;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
  } catch (err) {
    console.warn("[fey] service worker registration failed", err);
    return null;
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export type SubscribeResult =
  | { ok: true; stored: boolean }
  | { ok: false; reason: "denied" | "dismissed" | "unsupported" | "error" };

/** Must be called directly from a user tap (required on iOS). */
export async function subscribeToReminders(opts: {
  userId: string;
  reminderMinutes: number;
  streak: number;
}): Promise<SubscribeResult> {
  if (getPushEnvironment() !== "supported") return { ok: false, reason: "unsupported" };

  const permission = await Notification.requestPermission();
  if (permission === "denied") return { ok: false, reason: "denied" };
  if (permission !== "granted") return { ok: false, reason: "dismissed" };

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    console.warn("[fey] NEXT_PUBLIC_VAPID_PUBLIC_KEY missing — permission granted but no push subscription created.");
    return { ok: true, stored: false };
  }

  try {
    const registration = (await registerServiceWorker()) ?? (await navigator.serviceWorker.ready);
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }

    localStorage.setItem(SUBSCRIPTION_ENDPOINT_KEY, subscription.endpoint);

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId: opts.userId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        reminderMinutes: opts.reminderMinutes,
        streak: opts.streak,
        lastPracticedAt: new Date().toISOString(),
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { stored?: boolean };
    return { ok: true, stored: Boolean(json.stored) };
  } catch (err) {
    console.error("[fey] push subscription failed", err);
    return { ok: false, reason: "error" };
  }
}

/**
 * Tell the server the user practised, so tonight's reminder / streak-at-risk nudge is skipped.
 * Fire-and-forget; no-op if the user never subscribed.
 */
export function syncPracticeActivity(streak: number) {
  if (typeof window === "undefined") return;
  let endpoint: string | null = null;
  try {
    endpoint = localStorage.getItem(SUBSCRIPTION_ENDPOINT_KEY);
  } catch {
    return;
  }
  if (!endpoint) return;

  fetch("/api/push/subscribe", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      endpoint,
      streak,
      lastPracticedAt: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  }).catch(() => {
    /* offline — next sprint will resync */
  });
}
