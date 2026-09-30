import { NextRequest, NextResponse } from "next/server";

// Server-side in-memory cache to return instantly on repeat requests
const serverUrlCache = new Map<string, string>();

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing or invalid url" }, { status: 400 });
    }

    if (serverUrlCache.has(url)) {
      return NextResponse.json({ shortUrl: serverUrlCache.get(url)! });
    }

    let shortUrl = "";

    // Strategy 1: Fast POST to TinyURL with urlencoded body
    try {
      const postResponse = await fetch("https://tinyurl.com/api-create.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "FeyPlatform/1.0",
        },
        body: new URLSearchParams({ url }),
        signal: AbortSignal.timeout(10000),
      });

      if (postResponse.ok) {
        const text = (await postResponse.text()).trim();
        if (text.startsWith("http")) {
          shortUrl = text;
        }
      }
    } catch (err) {
      console.warn("TinyURL POST failed, attempting GET fallback:", err);
    }

    // Strategy 2: Fallback to GET TinyURL if POST failed
    if (!shortUrl) {
      try {
        const getResponse = await fetch(
          `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
          {
            method: "GET",
            headers: {
              "User-Agent": "FeyPlatform/1.0",
            },
            signal: AbortSignal.timeout(10000),
          }
        );

        if (getResponse.ok) {
          const text = (await getResponse.text()).trim();
          if (text.startsWith("http")) {
            shortUrl = text;
          }
        }
      } catch (err) {
        console.warn("TinyURL GET fallback also failed:", err);
      }
    }

    if (!shortUrl) {
      return NextResponse.json({ error: "Shortener provider unavailable" }, { status: 502 });
    }

    serverUrlCache.set(url, shortUrl);
    return NextResponse.json({ shortUrl });
  } catch (err: any) {
    console.error("URL shortening handler error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
