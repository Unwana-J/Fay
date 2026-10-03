import { NextRequest, NextResponse } from "next/server";
import { saveIncidentReport, getAllIncidents, updateIncidentStatus } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    // If unregistered / no reporterId, require email for follow-up
    if (!reporterId && (!reporterEmail || !reporterEmail.includes("@"))) {
      return NextResponse.json(
        { error: "A valid email is required for unregistered users so we can follow up." },
        { status: 400 }
      );
    }

    const saved = await saveIncidentReport({
      reporterId,
      reporterEmail,
      reporterUsername,
      category,
      details,
      targetUser,
      roomId,
    });

    return NextResponse.json({ success: true, incident: saved });
  } catch (err: any) {
    console.error("Error saving incident report:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const incidents = await getAllIncidents();
    return NextResponse.json({ success: true, incidents });
  } catch (err: any) {
    console.error("Error fetching incidents:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
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
