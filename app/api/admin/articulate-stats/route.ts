import { NextRequest, NextResponse } from "next/server";
import { getArticulateStats } from "@/lib/articulate-matches";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** GET: all-time Articulate hours played + milestone progress (requires admin session or x-admin-key). */
export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const stats = await getArticulateStats();
    return NextResponse.json({ success: true, stats });
  } catch (err) {
    console.error("Error computing Articulate stats:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
