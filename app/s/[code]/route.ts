import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { PRIMARY_SITE_ORIGIN } from "@/lib/share-origin";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code } = await context.params;
  const cleanCode = (code || "").trim();

  // Keep redirects on the exact host that served /s/[code] so X crawlers on
  // fay-eight-liard.vercel.app never bounce onto a blocklisted host.
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const requestOrigin = host ? `${proto}://${host}` : PRIMARY_SITE_ORIGIN;

  if (!cleanCode || !/^[A-Za-z0-9_-]{4,16}$/.test(cleanCode) || !supabase) {
    return NextResponse.redirect(new URL("/", requestOrigin), 307);
  }

  try {
    const { data, error } = await supabase
      .from("short_links")
      .select("target_path")
      .eq("code", cleanCode)
      .maybeSingle();

    if (!error && data?.target_path && typeof data.target_path === "string" && data.target_path.startsWith("/")) {
      return NextResponse.redirect(new URL(data.target_path, requestOrigin), 307);
    }
  } catch (err) {
    console.error("Failed to resolve short link:", err);
  }

  return NextResponse.redirect(new URL("/", requestOrigin), 307);
}
