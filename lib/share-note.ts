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

const ALLOWED_HTML_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "hr",
  "span",
  "a",
]);

/**
 * Strips potentially dangerous HTML tags/attributes (script, iframe, event handlers,
 * javascript:/data: hrefs) from decoded URL payloads to prevent reflected XSS.
 */
export function sanitizeSharedNoteHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  return html
    // Remove script, style, iframe, object, embed, form, input blocks completely
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|meta|link|base|svg|math)[\s\S]*?>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button|textarea|meta|link|base|svg|math)[^>]*\/?>/gi, "")
    // Sanitize remaining tags and strip event handlers / dangerous attributes
    .replace(/<\/?([a-zA-Z0-9-]+)([^>]*)>/g, (match, rawTag: string, rawAttrs: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_HTML_TAGS.has(tag)) {
        return "";
      }
      if (match.startsWith("</")) {
        return `</${tag}>`;
      }
      if (tag === "a" && rawAttrs) {
        const hrefMatch = rawAttrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const rawHref = (hrefMatch?.[1] || hrefMatch?.[2] || hrefMatch?.[3] || "").trim();
        if (/^https?:\/\//i.test(rawHref)) {
          const safeHref = rawHref.replace(/"/g, "&quot;");
          return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">`;
        }
        return "<a>";
      }
      return tag === "br" || tag === "hr" ? `<${tag} />` : `<${tag}>`;
    });
}

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
        } else {
          data.notes = sanitizeSharedNoteHtml(data.notes);
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
      } else {
        data.notes = sanitizeSharedNoteHtml(data.notes);
      }
      return data as SharedNotePayload;
    }

    return null;
  } catch (err) {
    console.error("Failed to decode shared note payload", err);
    return null;
  }
}
