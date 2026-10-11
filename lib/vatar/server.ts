// lib/vatar/server.ts
import crypto from "node:crypto";

const VATAR_API_BASE = process.env.VATAR_API_URL || "https://lagoslife.app/api/games/v1";
const VATAR_SECRET = process.env.VATAR_SECRET || "";
const VATAR_WEBHOOK_SECRET = process.env.VATAR_WEBHOOK_SECRET || "";
const VATAR_RESULTS_SECRET = process.env.VATAR_RESULTS_SECRET || "";

// Internal secret for HMAC-signing stateless round tokens
const ROUND_SIGNING_SECRET =
  process.env.VATAR_ROUND_SECRET || process.env.VATAR_SECRET || "fey-vatar-stateless-round-secret-seed";

export interface VatarSessionVerifyResult {
  playerId: string;
  name: string;
  gameId: string;
  exp: number;
  mode: "live" | "test";
}

export interface VatarPurchaseDetails {
  id: string;
  productId: string;
  playerId: string;
  amount: number;
  currency: string;
  status: "paid" | "delivered" | "refunded";
  createdAt: number;
  mode: "live" | "test";
}

/**
 * Generic helper for calling the Vatar Games Backend API
 */
export async function vatarApi<T = unknown>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown
): Promise<{ status: number; data?: T; error?: string }> {
  if (!VATAR_SECRET) {
    return { status: 500, error: "VATAR_SECRET environment variable is not configured." };
  }

  try {
    const res = await fetch(`${VATAR_API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${VATAR_SECRET}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        status: res.status,
        error: json?.message || json?.error || `HTTP_${res.status}`,
      };
    }

    return { status: res.status, data: json as T };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { status: 500, error: message };
  }
}

/**
 * Verify a short-lived player session token directly with Vatar's API.
 */
export async function verifyVatarSession(session: string): Promise<VatarSessionVerifyResult | null> {
  if (!session) return null;
  const res = await vatarApi<VatarSessionVerifyResult>("/session/verify", "POST", { session });
  if (res.status === 200 && res.data?.playerId) {
    return res.data;
  }
  return null;
}

/**
 * Fetch purchase details from Vatar API to verify authenticity.
 */
export async function getVatarPurchase(purchaseId: string): Promise<VatarPurchaseDetails | null> {
  if (!purchaseId) return null;
  const res = await vatarApi<VatarPurchaseDetails>(`/purchases/${encodeURIComponent(purchaseId)}`, "GET");
  if (res.status === 200 && res.data?.id) {
    return res.data;
  }
  return null;
}

/**
 * Mark a verified purchase as delivered in Vatar's ledger.
 */
export async function deliverVatarPurchase(
  purchaseId: string
): Promise<{ success: boolean; status?: string }> {
  if (!purchaseId) return { success: false };
  const res = await vatarApi<{ id: string; status: string }>(
    `/purchases/${encodeURIComponent(purchaseId)}/deliver`,
    "POST",
    {}
  );
  return { success: res.status === 200, status: res.data?.status };
}

/**
 * Verify Webhook signature in constant time: sha256=<hex-hmac>
 */
export function verifyVatarWebhookSignature(rawBody: string | Buffer, headerSignature?: string | null): boolean {
  if (!VATAR_WEBHOOK_SECRET || !headerSignature) return false;

  const bodyBuffer = typeof rawBody === "string" ? Buffer.from(rawBody, "utf8") : rawBody;
  const expectedSig =
    "sha256=" +
    crypto
      .createHmac("sha256", VATAR_WEBHOOK_SECRET)
      .update(bodyBuffer)
      .digest("hex");

  const expectedBuf = Buffer.from(expectedSig);
  const actualBuf = Buffer.from(headerSignature);

  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

// ─── Stateless HMAC-Signed Round Tokens ──────────────────────────────────────
// Prevents clients from spoofing rounds or question IDs without touching the DB on every click.

export interface RoundTokenPayload {
  roundId: string;
  playerId: string;
  questionIds: string[];
  durationSeconds: number;
  startedAt: number;
  difficulty: string;
}

export function createSignedRoundToken(payload: RoundTokenPayload): string {
  const jsonStr = JSON.stringify(payload);
  const dataB64 = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", ROUND_SIGNING_SECRET)
    .update(dataB64)
    .digest("base64url");
  return `${dataB64}.${signature}`;
}

export function verifySignedRoundToken(token: string): RoundTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [dataB64, signature] = parts;

    const expectedSig = crypto
      .createHmac("sha256", ROUND_SIGNING_SECRET)
      .update(dataB64)
      .digest("base64url");

    const expectedBuf = Buffer.from(expectedSig);
    const actualBuf = Buffer.from(signature);

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return null;
    }

    const jsonStr = Buffer.from(dataB64, "base64url").toString("utf8");
    return JSON.parse(jsonStr) as RoundTokenPayload;
  } catch {
    return null;
  }
}
