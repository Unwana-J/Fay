import { NextResponse } from "next/server";
import { getFeatureFlags } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const features = await getFeatureFlags();
    return NextResponse.json(
      {
        success: true,
        features,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching feature flags:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve features",
      },
      { status: 500 }
    );
  }
}
