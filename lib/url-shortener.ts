/**
 * Client helper to shorten URLs via /api/shorten
 * Falls back gracefully to original long URL if shortener is unavailable.
 */

const shortUrlCache = new Map<string, string>();

export async function getShortenedUrl(fullUrl: string): Promise<string> {
  if (!fullUrl) return "";
  if (shortUrlCache.has(fullUrl)) {
    return shortUrlCache.get(fullUrl)!;
  }

  try {
    const res = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: fullUrl }),
    });

    if (!res.ok) {
      return fullUrl;
    }

    const data = await res.json();
    if (data?.shortUrl && typeof data.shortUrl === "string") {
      shortUrlCache.set(fullUrl, data.shortUrl);
      return data.shortUrl;
    }
  } catch (err) {
    console.warn("Failed to obtain short URL, using original link", err);
  }

  return fullUrl;
}
