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

const DEFAULT_NOTES_FALLBACK =
  "Understanding proven through Feynman vocal articulation and synthesis.";

// ── Encode ────────────────────────────────────────────────────────────────────

export function encodeSharedNote(payload: SharedNotePayload): string {
  try {
    const sanitizedPayload: SharedNotePayload = {
      ...payload,
      notes: payload.notes && payload.notes.trim().length > 0
        ? payload.notes
        : DEFAULT_NOTES_FALLBACK,
      author: payload.author || "Scholar",
      category: payload.category || "General",
      difficulty: payload.difficulty || "Scholar",
      date: payload.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      _v: "2",
    };

    const jsonStr = JSON.stringify(sanitizedPayload);
    // compressToEncodedURIComponent produces a URL-safe string directly
    return LZString.compressToEncodedURIComponent(jsonStr);
  } catch (err) {
    console.error("Failed to encode note payload", err);
    return "";
  }
}

// ── Decode ────────────────────────────────────────────────────────────────────

export function decodeSharedNote(encoded: string): SharedNotePayload | null {
  if (!encoded || typeof encoded !== "string") return null;

  try {
    // ── 1. Try lz-string directly (v2 compressed links) ───────────────────────
    let lzDecompressed = LZString.decompressFromEncodedURIComponent(encoded);

    // If direct decompress fails, try after decodeURIComponent (in case the web framework double-encoded it)
    if (!lzDecompressed) {
      try {
        lzDecompressed = LZString.decompressFromEncodedURIComponent(decodeURIComponent(encoded));
      } catch {}
    }

    // Also try replacing spaces with '+' if URL proxies converted '+' to ' '
    if (!lzDecompressed && encoded.includes(" ")) {
      try {
        lzDecompressed = LZString.decompressFromEncodedURIComponent(encoded.replace(/ /g, "+"));
      } catch {}
    }

    if (lzDecompressed) {
      const data = JSON.parse(lzDecompressed);
      if (data && data.topicText) {
        if (!data.notes || typeof data.notes !== "string" || data.notes.trim().length === 0) {
          data.notes = DEFAULT_NOTES_FALLBACK;
        }
        return data as SharedNotePayload;
      }
    }

    // ── 2. Fallback: legacy base64-encoded links (v1) ───────────────────────────
    let decodedUri = encoded;
    try {
      decodedUri = decodeURIComponent(encoded);
    } catch {}

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
    if (data && data.topicText) {
      if (!data.notes || typeof data.notes !== "string" || data.notes.trim().length === 0) {
        data.notes = DEFAULT_NOTES_FALLBACK;
      }
      return data as SharedNotePayload;
    }

    return null;
  } catch (err) {
    console.error("Failed to decode shared note payload", err);
    return null;
  }
}
