import { NextRequest, NextResponse } from "next/server";
import { getClientIp } from "@/lib/security-guard";

/**
 * Next.js Edge Middleware
 * Blocks known stress-testing tools, banned IPs, and malicious automated agents.
 */

// Automated stress-testing and flooding agent signatures
const BLOCKED_USER_AGENTS = [
  /k6\//i,
  /artillery/i,
  /locust/i,
  /wrk/i,
  /autocannon/i,
  /apachebench/i,
  /jmeter/i,
];

export function middleware(req: NextRequest) {
  const userAgent = req.headers.get("user-agent") || "";
  const clientIp = getClientIp(req);

  // 1. Block known automated stress-testing tool user agents
  if (BLOCKED_USER_AGENTS.some((pattern) => pattern.test(userAgent))) {
    console.warn(`[Middleware] Blocked automated testing tool agent: "${userAgent}" from IP: ${clientIp}`);
    return NextResponse.json(
      { error: "Access Denied: Automated testing agents are prohibited." },
      { status: 403 }
    );
  }

  // 2. Block configurable banned IPs via environment variable (comma separated)
  const bannedIpsEnv = process.env.BANNED_IPS;
  if (bannedIpsEnv && clientIp !== "unknown-ip") {
    const bannedIps = bannedIpsEnv.split(",").map((ip) => ip.trim());
    if (bannedIps.includes(clientIp)) {
      console.warn(`[Middleware] Dropped request from banned IP: ${clientIp}`);
      return NextResponse.json({ error: "Access Denied." }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to API routes and core interactive endpoints
    "/api/:path*",
    "/games/:path*",
  ],
};
