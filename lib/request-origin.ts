import { headers } from "next/headers";
import { ALLOWED_SHARE_HOSTS, PRIMARY_SITE_ORIGIN } from "./share-origin";

/**
 * Resolves the active request origin on the server (e.g. fey.lokinlabs.com.ng
 * or fay-eight-liard.vercel.app) so Open Graph / Twitter Card metadata matches
 * the exact host being crawled.
 */
export async function getRequestOrigin(): Promise<string> {
  try {
    const hdrs = await headers();
    const rawHost = (hdrs.get("x-forwarded-host") || hdrs.get("host") || "")
      .split(",")[0]
      .trim()
      .toLowerCase();

    if (!rawHost) return PRIMARY_SITE_ORIGIN;

    const hostname = rawHost.split(":")[0];
    if (
      ALLOWED_SHARE_HOSTS.has(hostname) &&
      hostname !== "localhost" &&
      hostname !== "127.0.0.1"
    ) {
      const proto = (hdrs.get("x-forwarded-proto") || "https")
        .split(",")[0]
        .trim();
      return `${proto}://${hostname}`;
    }
  } catch {
    // Fallback safely during static generation or when headers() is unavailable
  }

  return PRIMARY_SITE_ORIGIN;
}
