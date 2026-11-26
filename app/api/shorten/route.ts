import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/security-guard";
import { supabase } from "@/lib/supabase";
import { ALLOWED_SHARE_HOSTS } from "@/lib/share-origin";

// Server-side in-memory cache to return instantly on repeat requests (capped at 1000 entries)
const MAX_URL_CACHE_SIZE = 1000;
const serverUrlCache = new Map<string, string>();

function parseAllowedFeyUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    if (!ALLOWED_SHARE_HOSTS.has(parsed.hostname.toLowerCase())) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function generateShortCode(): string {
  return crypto.randomBytes(6).toString("base64url").slice(0, 7);
}

async function createFirstPartyShortCode(targetPath: string): Promise<string | null> {
  if (!supabase || !targetPath.startsWith("/") || targetPath.length > 32000) {
    return null;
  }

  const targetHash = crypto.createHash("sha256").update(targetPath).digest("hex");

  try {
    const { data: existing, error: selectErr } = await supabase
      .from("short_links")
      .select("code")
      .eq("target_hash", targetHash)
      .maybeSingle();

    if (!selectErr && existing?.code) {
      return existing.code;
    }

    // Attempt insert with retry on rare code collision
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = generateShortCode();
      const { error: insertErr } = await supabase
        .from("short_links")
        .insert({ code, target_path: targetPath, target_hash: targetHash });

      if (!insertErr) {
        return code;
      }

      // Unique target_hash race: re-fetch existing code
      if (insertErr.code === "23505") {
        const { data: raced } = await supabase
          .from("short_links")
          .select("code")
          .eq("target_hash", targetHash)
          .maybeSingle();
        if (raced?.code) return raced.code;
      } else {
        // Table missing or RLS error -> fall through gracefully
        return null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rate = checkRateLimit(`shorten:${clientIp}`, 20, 60);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing or unauthorized URL host" }, { status: 400 });
    }

    const parsed = parseAllowedFeyUrl(url);
    if (!parsed) {
      return NextResponse.json({ error: "Missing or unauthorized URL host" }, { status: 400 });
    }

    // Already a first-party short link
    if (/^\/s\/[A-Za-z0-9_-]{4,16}$/.test(parsed.pathname)) {
      return NextResponse.json({ shortUrl: url });
    }

    if (serverUrlCache.has(url)) {
      return NextResponse.json({ shortUrl: serverUrlCache.get(url)! });
    }

    let shortUrl = "";

    // Strategy 1 (Preferred): First-party /s/[code] via Supabase
    const targetPath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    const firstPartyCode = await createFirstPartyShortCode(targetPath);
    if (firstPartyCode) {
      shortUrl = `${parsed.origin}/s/${firstPartyCode}`;
    }

    // Strategy 2 (Fallback if short_links table is not migrated yet): TinyURL
    if (!shortUrl) {
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
        console.warn("TinyURL POST fallback failed:", err);
      }
    }

    if (!shortUrl) {
      return NextResponse.json({ error: "Shortener provider unavailable" }, { status: 502 });
    }

    if (serverUrlCache.size >= MAX_URL_CACHE_SIZE) {
      const oldestKey = serverUrlCache.keys().next().value;
      if (oldestKey) serverUrlCache.delete(oldestKey);
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
