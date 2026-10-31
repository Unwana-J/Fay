import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  isAdminAuthorized,
  verifyAdminPasscode,
} from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/security-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    authenticated: isAdminAuthorized(req),
  });
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(`admin-login:${clientIp}`, 8, 60);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const passcode = typeof body?.passcode === "string" ? body.passcode : "";

    if (!verifyAdminPasscode(passcode)) {
      return NextResponse.json({ error: "Invalid administrative passcode." }, { status: 401 });
    }

    const token = createAdminSessionToken();
    const res = NextResponse.json({ success: true, authenticated: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, authenticated: false });
  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
