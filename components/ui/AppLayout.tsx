"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import MobileBottomNav from "@/components/ui/MobileBottomNav";
import AuthGate from "@/components/auth/AuthGate";
import FloatingFeedbackWidget from "@/components/feedback/FloatingFeedbackWidget";
import CelestialAscensionOverlay from "@/components/ui/CelestialAscensionOverlay";
import { useAppStore } from "@/store/useAppStore";
import { Orbit, ShieldAlert, Sparkles } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileConstellationPulse, setMobileConstellationPulse] = useState<string | null>(null);
  const isOnboarded = useAppStore((s) => s.isOnboarded);
  const openFeedbackPrompt = useAppStore((s) => s.openFeedbackPrompt);
  const openSafetyModal = useAppStore((s) => s.openSafetyModal);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    function onPulse(e: Event) {
      const custom = e as CustomEvent<{ kind?: "sun" | "moon" | "star" }>;
      const kind = custom.detail?.kind || "star";
      const label = kind === "sun" ? "+1 Sun" : kind === "moon" ? "+1 Moon" : "+1 Star";
      setMobileConstellationPulse(label);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setMobileConstellationPulse(null), 6500);
    }
    window.addEventListener("fey:constellation-nav-pulse", onPulse);
    return () => {
      window.removeEventListener("fey:constellation-nav-pulse", onPulse);
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Vatar / Lagos Life embedded games: complete isolation from AuthGate, sidebars, and widgets
  const isVatar = pathname?.startsWith("/vatar");
  if (isVatar) {
    return <main className="min-h-screen flex flex-col w-full">{children}</main>;
  }

  // Standalone routes (public shared notes, public landing page, root landing for un-onboarded visitors & admin portal)
  const isRootLanding = pathname === "/" && (!mounted || !isOnboarded);
  const isStandalone = pathname?.startsWith("/note/") || pathname?.startsWith("/admin") || pathname === "/about" || isRootLanding;

  if (isStandalone) {
    return (
      <AuthGate>
        <main className="min-h-screen flex flex-col w-full">
          {children}
        </main>
        <FloatingFeedbackWidget />
        <CelestialAscensionOverlay />
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="flex min-h-screen w-full max-w-full overflow-x-hidden">
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — hidden on mobile unless open */}
        <div
          className={`
            fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
            md:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content — no left margin on mobile, strictly constrained */}
        <main className="flex-1 min-h-screen flex flex-col md:ml-60 w-full max-w-full min-w-0 overflow-x-hidden">
          {/* Mobile top bar with hamburger */}
          <div
            className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 border-b backdrop-blur-md bg-[var(--bg-base)]/90"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
                aria-label="Open navigation"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="2" y1="4.5" x2="16" y2="4.5" />
                  <line x1="2" y1="9" x2="16" y2="9" />
                  <line x1="2" y1="13.5" x2="16" y2="13.5" />
                </svg>
              </button>
              <span className="ml-3 font-serif font-bold text-base" style={{ color: "var(--text)" }}>Fey</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/constellation"
                data-constellation-nav="mobile"
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold border transition-all flex items-center gap-1.5 ${
                  mobileConstellationPulse
                    ? "border-[var(--gold)] bg-[var(--gold-bg)] text-[var(--gold)] ring-2 ring-[var(--gold)]/30"
                    : "border-[var(--border-dim)] hover:bg-[var(--bg-input)] text-[var(--text-dim)]"
                }`}
                title="Constellation"
                aria-label="Constellation"
              >
                <Orbit size={13} className={mobileConstellationPulse ? "text-[var(--gold)] animate-spin" : "text-[var(--gold)]"} />
                {mobileConstellationPulse && (
                  <span className="text-[10px] font-bold text-[var(--gold)]">
                    {mobileConstellationPulse}
                  </span>
                )}
              </Link>
              <button
                onClick={() => openFeedbackPrompt("mobile_top")}
                className="px-2.5 py-1 rounded-full text-xs font-mono font-medium border border-[var(--border-dim)] hover:bg-[var(--bg-input)] transition-colors text-[var(--gold)] flex items-center gap-1 cursor-pointer"
                title="You dey feel am?"
              >
                <Sparkles size={12} className="text-amber-500" />
                <span className="text-[11px]">Pulse</span>
              </button>
              <button
                onClick={() => openSafetyModal()}
                className="p-1.5 rounded-full border border-[var(--border-dim)] hover:bg-[var(--bg-input)] transition-colors text-[var(--terra)] cursor-pointer"
                title="Safety & Incident Desk"
                aria-label="Safety Desk"
              >
                <ShieldAlert size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 pb-16 md:pb-0">
            {children}
          </div>
        </main>
        <MobileBottomNav />
        <FloatingFeedbackWidget />
        <CelestialAscensionOverlay />
      </div>
    </AuthGate>
  );
}
