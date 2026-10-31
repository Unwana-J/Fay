import { NextRequest, NextResponse } from "next/server";
import { getAllFeedback, getAllIncidents, getAllUsers } from "@/lib/admin-data";
import { getAdminEngagement, type AdminRange } from "@/lib/admin-engagement";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rangeParam = req.nextUrl.searchParams.get("range");
    const range: AdminRange =
      rangeParam === "7d" || rangeParam === "30d" ? rangeParam : "all";

    const [feedback, incidents, users, engagement] = await Promise.all([
      getAllFeedback(),
      getAllIncidents(),
      getAllUsers(),
      getAdminEngagement(range),
    ]);

    // Rating distribution
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedback.forEach((f) => {
      const r = f.rating as 1 | 2 | 3 | 4 | 5;
      if (ratingCounts[r] !== undefined) ratingCounts[r]++;
    });

    const totalRatings = feedback.length;
    const avgRating =
      totalRatings > 0
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalRatings).toFixed(1)
        : "0";

    const promoters = feedback.filter((f) => f.rating >= 4).length;
    const detractors = feedback.filter((f) => f.rating <= 3).length;
    const csatPercent = totalRatings > 0 ? Math.round((promoters / totalRatings) * 100) : 0;

    // Incidents
    const pendingIncidents = incidents.filter((i) => i.status === "pending").length;
    const investigatingIncidents = incidents.filter((i) => i.status === "investigating").length;
    const resolvedIncidents = incidents.filter((i) => i.status === "resolved").length;

    // Users (consistent breakdown across card and tab badge)
    const activeUsers = users.filter((u) => !u.isBanned && !u.isDeactivated).length;
    const bannedUsers = users.filter((u) => u.isBanned).length;
    const deactivatedUsers = users.filter((u) => u.isDeactivated && !u.isBanned).length;
    const registeredUsers = users.filter((u) => u.isRegistered || Boolean(u.email)).length;
    const guestUsers = users.length - registeredUsers;

    const posthogConfigured = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    const posthogProjectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID || "";
    const dashboardUrl = posthogProjectId
      ? `https://us.posthog.com/project/${posthogProjectId}/dashboard`
      : "https://us.posthog.com";

    return NextResponse.json({
      success: true,
      data: {
        supabaseConnected: isSupabaseConfigured,
        csat: {
          average: Number(avgRating),
          total: totalRatings,
          promoters,
          detractors,
          csatPercent,
          ratingCounts,
          lowSample: totalRatings < 30,
        },
        recentFeedback: feedback.slice(0, 3),
        incidents: {
          total: incidents.length,
          pending: pendingIncidents,
          investigating: investigatingIncidents,
          resolved: resolvedIncidents,
        },
        users: {
          total: users.length,
          active: activeUsers,
          banned: bannedUsers,
          deactivated: deactivatedUsers,
          registered: registeredUsers,
          guest: guestUsers,
        },
        engagement,
        posthog: {
          configured: posthogConfigured,
          host: posthogHost,
          dashboardUrl,
        },
      },
    });
  } catch (err: unknown) {
    console.error("Error generating admin overview:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
