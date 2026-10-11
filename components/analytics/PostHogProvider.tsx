"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { analytics } from "@/lib/analytics";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isVatar = pathname?.startsWith("/vatar");

  useEffect(() => {
    // NDPA & Vatar §8 compliance: no analytics, tracking, or profiling inside game frames
    if (!isVatar) {
      analytics.init();
    }
  }, [isVatar]);

  if (isVatar) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
