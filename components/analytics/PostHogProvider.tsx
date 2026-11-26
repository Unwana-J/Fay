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

  // Capture push notification opens (?source=push&template=...) once and clean the URL
  useEffect(() => {
    if (isVatar || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("source") !== "push") return;
    const template = url.searchParams.get("template") || "unknown";
    analytics.track("push_notification_opened", {
      template,
      path: pathname || "/",
    });
    url.searchParams.delete("source");
    url.searchParams.delete("template");
    const clean = url.pathname + (url.search ? url.search : "") + url.hash;
    window.history.replaceState(window.history.state, "", clean);
  }, [pathname, isVatar]);

  if (isVatar) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
