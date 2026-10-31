import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "fey_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

function getExpectedPasscode(): string {
  const envPass = process.env.ADMIN_PASSCODE?.trim();
  return envPass && envPass.length > 0 ? envPass : "fey2026";
}

function getSigningSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    `fey-admin-secret-${getExpectedPasscode()}`
  );
}

function safeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function verifyAdminPasscode(input: string | null | undefined): boolean {
  if (!input || typeof input !== "string") return false;
  const trimmed = input.trim();
  if (!trimmed) return false;
  return safeEqualStrings(trimmed, getExpectedPasscode());
}

export function createAdminSessionToken(nowMs = Date.now()): string {
  const exp = Math.floor(nowMs / 1000) + SESSION_TTL_SECONDS;
  const payload = `v1.${exp}`;
  const sig = createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | null | undefined, nowMs = Date.now()): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Math.floor(nowMs / 1000)) return false;

  const payload = `v1.${parts[1]}`;
  const expectedSig = createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
  return safeEqualStrings(parts[2], expectedSig);
}

/**
 * Checks whether an incoming API request is authorized as an administrator,
 * either via the signed httpOnly session cookie OR via the `x-admin-key` header.
 */
export function isAdminAuthorized(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (verifyAdminSessionToken(cookieToken)) {
    return true;
  }
  const headerKey = req.headers.get("x-admin-key");
  if (verifyAdminPasscode(headerKey)) {
    return true;
  }
  return false;
}

export const ADMIN_COOKIE_MAX_AGE = SESSION_TTL_SECONDS;
