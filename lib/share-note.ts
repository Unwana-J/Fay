/**
 * Utility to encode and decode public shared notes into URL-safe strings.
 * Zero-database: state is completely portable via URL.
 *
 * Uses lz-string LZ compression to dramatically reduce URL length (typically
 * 60–75% shorter than raw base64).  The codec is:
 *
 *   encode: JSON → LZ-compress → URL-safe string (no extra base64 step)
 *   decode: URL-safe string → LZ-decompress → JSON
 *
 * Old base64-only links (v1) are detected and decoded via the legacy path so
 * that previously shared links continue to work.
 */

import LZString from "lz-string";

export interface SharedNotePayload {
  topicId?: string;
  topicText: string;
  category: string;
  difficulty: string;
  notes: string;
  author: string;
  date: string;
  speakingSeconds?: number;
  xpEarned?: number;
  tags?: string[];
  /** Internal version tag — "2" means lz-string compressed, absent = legacy base64 */
  _v?: string;
}

// ── Encode ────────────────────────────────────────────────────────────────────

export function encodeSharedNote(payload: SharedNotePayload): string {
  try {
    const jsonStr = JSON.stringify({ ...payload, _v: "2" });
    // compressToEncodedURIComponent produces a URL-safe string directly
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (err) {
    console.error("Failed to encode note payload", err);
    return "";
  }
}

// ── Decode ────────────────────────────────────────────────────────────────────

export function decodeSharedNote(encoded: string): SharedNotePayload | null {
  try {
    // ── Try lz-string first (v2 links) ──────────────────────────────────────
    const lzDecompressed = LZString.decompressFromEncodedURIComponent(encoded);
    if (lzDecompressed) {
      const data = JSON.parse(lzDecompressed);
      if (!data.topicText || !data.notes) return null;
      return data as SharedNotePayload;
    }

    // ── Fallback: legacy base64-encoded links (v1) ───────────────────────────
    const decodedUri = decodeURIComponent(encoded);
    let jsonStr = "";

    if (typeof window !== "undefined" && typeof window.atob === "function") {
      const binary = atob(decodedUri);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      jsonStr = decodeURIComponent(
        Array.prototype.map
          .call(bytes, (byte: number) => "%" + ("00" + byte.toString(16)).slice(-2))
          .join("")
      );
    } else {
      jsonStr = Buffer.from(decodedUri, "base64").toString("utf-8");
    }

    const data = JSON.parse(jsonStr);
    if (!data.topicText || !data.notes) return null;
    return data as SharedNotePayload;
  } catch (err) {
    console.error("Failed to decode shared note payload", err);
    return null;
  }
}
