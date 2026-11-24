import { NextRequest, NextResponse } from "next/server";
import { saveIncidentReport, getAllIncidents, updateIncidentStatus } from "@/lib/admin-data";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { checkRateLimit, getClientIp, isBannedIdentifier, isBotPattern } from "@/lib/security-guard";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rate = checkRateLimit(`safety-report:${clientIp}`, 5, 300);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many incident reports submitted. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      reporterId,
      reporterEmail,
      reporterUsername,
      category,
      details,
      targetUser,
      roomId,
    } = body;

    if (!details || typeof details !== "string" || !details.trim()) {
      return NextResponse.json({ error: "Details are required" }, { status: 400 });
    }

    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    if (isBotPattern(reporterUsername) || isBannedIdentifier(reporterUsername) || isBannedIdentifier(reporterEmail)) {
      return NextResponse.json({ error: "Submission not permitted" }, { status: 403 });
    }

    // If unregistered / no reporterId, require email for follow-up
    if (!reporterId && (!reporterEmail || typeof reporterEmail !== "string" || !reporterEmail.includes("@"))) {
      return NextResponse.json(
        { error: "A valid email is required for unregistered users so we can follow up." },
        { status: 400 }
      );
    }

    const saved = await saveIncidentReport({
      reporterId: typeof reporterId === "string" ? reporterId.slice(0, 120) : undefined,
      reporterEmail: typeof reporterEmail === "string" ? reporterEmail.slice(0, 160) : undefined,
      reporterUsername: typeof reporterUsername === "string" ? reporterUsername.slice(0, 80) : undefined,
      category: category as any,
      details: details.trim().slice(0, 3000),
      targetUser: typeof targetUser === "string" ? targetUser.slice(0, 80) : undefined,
      roomId: typeof roomId === "string" ? roomId.slice(0, 40) : undefined,
    });

    return NextResponse.json({ success: true, incident: saved });
  } catch (err: any) {
    console.error("Error saving incident report:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const incidents = await getAllIncidents();
    return NextResponse.json({ success: true, incidents });
  } catch (err: any) {
    console.error("Error fetching incidents:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    const success = await updateIncidentStatus(id, status);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("Error updating incident:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
