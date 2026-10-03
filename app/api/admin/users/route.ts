import { NextRequest, NextResponse } from "next/server";
import { getAllUsers, moderateUser } from "@/lib/admin-data";

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error("Error fetching admin users:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, reason } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "userId and action are required" }, { status: 400 });
    }

    if (!["ban", "unban", "deactivate", "activate"].includes(action)) {
      return NextResponse.json({ error: "Invalid moderation action" }, { status: 400 });
    }

    const updated = await moderateUser(userId, action, reason);
    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("Error moderating user:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
