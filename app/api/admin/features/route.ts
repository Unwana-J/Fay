import { NextRequest, NextResponse } from "next/server";
import {
  getFeatureFlags,
  updateFeatureFlag,
  updateMultipleFeatureFlags,
  resetFeatureFlagsToDefaults,
  FeatureFlags,
} from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const features = await getFeatureFlags();
    return NextResponse.json({
      success: true,
      features,
    });
  } catch (error: any) {
    console.error("Admin feature fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch features",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if reset action requested
    if (body.action === "reset") {
      const resetFeatures = await resetFeatureFlagsToDefaults();
      return NextResponse.json({
        success: true,
        features: resetFeatures,
        message: "Feature flags successfully reset to system defaults",
      });
    }

    // Single key update: { key: "enablePassThePhone", enabled: false }
    if (body.key && typeof body.enabled === "boolean") {
      const updated = await updateFeatureFlag(
        body.key as keyof FeatureFlags,
        body.enabled
      );
      return NextResponse.json({
        success: true,
        features: updated,
        updatedKey: body.key,
        enabled: body.enabled,
      });
    }

    // Bulk update: { features: { enablePassThePhone: false, ... } }
    if (body.features && typeof body.features === "object") {
      const updated = await updateMultipleFeatureFlags(body.features);
      return NextResponse.json({
        success: true,
        features: updated,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid request payload. Expected 'key' and 'enabled' or 'features' object.",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Admin feature update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update feature flags",
      },
      { status: 500 }
    );
  }
}
