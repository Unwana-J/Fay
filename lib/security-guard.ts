import { NextRequest } from "next/server";

/**
 * Security & Anti-Abuse Guard for Fey
 * Protects against Layer-7 DoS flooding, bot stress testers, and score manipulation.
 */

// Banned accounts, emails, and identifiers
const KNOWN_BANNED_IDENTIFIERS = new Set<string>([
  "victorjonah199@gmail.com",
  "凌雲龍",
]);

// Bot / Load-Test Patterns
const BOT_PATTERNS = [
  /^(?:LoadTest|DbLoad|Crash|StressTest)[-_]?VU\d+/i,
  /[-_]VU\d+/i,
  /^VU\d+[-_]I\d+/i,
  /LoadTest/i,
  /DbLoad/i,
  /^Crash[-_]/i,
];

// In-Memory Rate Limiter (sliding window per key)
interface RateLimitEntry {
  timestamps: number[];
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 10 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < 3600_000);
      if (entry.timestamps.length === 0 && (!entry.blockedUntil || entry.blockedUntil < now)) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000).unref?.();
}

/**
 * Accurately extracts the client's real IP address from standard proxy headers.
 */
export function getClientIp(req: NextRequest | Request): string {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  const cfConnecting = headers.get("cf-connecting-ip");
  if (cfConnecting) return cfConnecting.trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown-ip";
}

/**
 * Sliding-window rate limiter.
 * @param key Unique key, e.g. "scores:192.168.1.1"
 * @param maxRequests Maximum requests permitted in the window
 * @param windowSeconds Window length in seconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let entry = rateLimitStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitStore.set(key, entry);
  }

  // Check if currently blocked
  if (entry.blockedUntil && entry.blockedUntil > now) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  // Filter timestamps within window
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    // If request volume is more than 3x the limit within the window, impose a temporary block (5 minutes)
    if (entry.timestamps.length >= maxRequests * 3) {
      entry.blockedUntil = now + 5 * 60 * 1000;
    }
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter: Math.max(1, retryAfter) };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
  };
}

/**
 * Detects known stress-testing/bot patterns in usernames or payload labels.
 */
export function isBotPattern(username?: string, gradeLabel?: string): boolean {
  if (gradeLabel && /load\s*test/i.test(gradeLabel)) return true;
  if (!username) return false;
  return BOT_PATTERNS.some((pattern) => pattern.test(username.trim()));
}

/**
 * Checks if a username or identifier is banned.
 */
export function isBannedIdentifier(identifier?: string): boolean {
  if (!identifier) return false;
  const clean = identifier.trim().toLowerCase();
  for (const banned of KNOWN_BANNED_IDENTIFIERS) {
    if (clean === banned.toLowerCase()) return true;
  }
  return false;
}

/**
 * Validates whether trivia score parameters are physically plausible.
 */
export function isPlausibleScore(
  score: number,
  total: number,
  xpEarned?: number
): { valid: boolean; reason?: string } {
  if (typeof score !== "number" || typeof total !== "number") {
    return { valid: false, reason: "Score and total must be numbers" };
  }
  if (total <= 0 || total > 100) {
    return { valid: false, reason: "Total questions outside valid range (1-100)" };
  }
  if (score < 0 || score > total) {
    return { valid: false, reason: "Score cannot be negative or exceed total questions" };
  }
  if (typeof xpEarned === "number" && (xpEarned < 0 || xpEarned > 1500)) {
    return { valid: false, reason: "XP earned outside reasonable bounds (0-1500)" };
  }
  return { valid: true };
}
