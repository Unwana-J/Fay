import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing or invalid url" }, { status: 400 });
    }

    // Call TinyURL free endpoint
    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`,
      {
        method: "GET",
        headers: {
          "User-Agent": "FeyPlatform/1.0",
        },
        // Timeout after 5 seconds
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Shortener provider failed" }, { status: 502 });
    }

    const shortUrl = (await response.text()).trim();

    if (!shortUrl.startsWith("http")) {
      return NextResponse.json({ error: "Invalid shortener response" }, { status: 502 });
    }

    return NextResponse.json({ shortUrl });
  } catch (err: any) {
    console.error("URL shortening error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
