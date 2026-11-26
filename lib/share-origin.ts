/**
 * Central share-origin utilities for Fey.
 *
 * Primary brand domain remains fey.lokinlabs.com.ng (WhatsApp, LinkedIn, SEO).
 * For X/Twitter shares, we route through an X-safe mirror origin (defaults to
 * the Vercel deployment URL, overrideable via NEXT_PUBLIC_X_SHARE_ORIGIN) so
 * friends can post Podium decks, Notes, and Trivia challenges without hitting
 * X's false-positive .com.ng domain filter.
 */

export const PRIMARY_SITE_ORIGIN = "https://fey.lokinlabs.com.ng";

export const X_SAFE_ORIGIN = (
  process.env.NEXT_PUBLIC_X_SHARE_ORIGIN || "https://fay-eight-liard.vercel.app"
).replace(/\/+$/, "");

function extractHostname(origin: string): string {
  try {
    return new URL(origin).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export const ALLOWED_SHARE_HOSTS = new Set(
  [
    "fey.lokinlabs.com.ng",
    "www.fey.lokinlabs.com.ng",
    "fay-eight-liard.vercel.app",
    extractHostname(X_SAFE_ORIGIN),
    "localhost",
    "127.0.0.1",
  ].filter(Boolean)
);

/**
 * Converts a Fey share URL (including first-party /s/[code] links) into an
 * X-safe URL on X_SAFE_ORIGIN. Never returns a tinyurl.com link — if a third-party
 * shortener URL is passed, falls back to rewriting fallbackFullUrl instead.
 */
export function toXSafeUrl(rawUrl: string, fallbackFullUrl?: string): string {
  const pickCandidate = (candidate?: string): string | null => {
    if (!candidate) return null;
    try {
      const parsed = new URL(candidate);
      const host = parsed.hostname.toLowerCase();
      if (host.includes("tinyurl.com") || host.includes("bit.ly")) {
        return null;
      }
      if (ALLOWED_SHARE_HOSTS.has(host)) {
        return `${X_SAFE_ORIGIN}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      return null;
    } catch {
      if (candidate.startsWith("/")) {
        return `${X_SAFE_ORIGIN}${candidate}`;
      }
      return null;
    }
  };

  return (
    pickCandidate(rawUrl) ||
    pickCandidate(fallbackFullUrl) ||
    X_SAFE_ORIGIN
  );
}
