"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";
import { useFeatureStore } from "@/store/useFeatureStore";
import type { FeatureFlags } from "@/lib/feature-flags";

interface FeatureGateProps {
  flag: keyof FeatureFlags;
  title?: string;
  message?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}

/**
 * Wraps a route/section and replaces it with an editorial "Under Revamp"
 * notice when the admin has disabled the corresponding feature flag.
 */
export default function FeatureGate({
  flag,
  title = "Under Revamp",
  message = "This corner of Fey is temporarily closed while we polish it. Please check back soon.",
  backHref = "/games",
  backLabel = "Back to Games",
  children,
}: FeatureGateProps) {
  const { features, fetchFeatures } = useFeatureStore();

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const enabled = features?.[flag] ?? true;
  if (enabled) return <>{children}</>;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div
        className="surface border rounded-3xl p-10 max-w-md w-full text-center space-y-4 shadow-sm"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <div
          className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(192, 156, 72, 0.15)", color: "var(--gold)" }}
        >
          <Wrench size={26} />
        </div>
        <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--text)" }}>
          {title}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
          {message}
        </p>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-mono font-bold hover:bg-[var(--bg-input)] transition-colors"
          style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
        >
          <ArrowLeft size={13} />
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
