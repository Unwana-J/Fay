"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import AuthGate from "@/components/auth/AuthGate";
import FloatingFeedbackWidget from "@/components/feedback/FloatingFeedbackWidget";
import { useAppStore } from "@/store/useAppStore";
import { ShieldAlert, Sparkles } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openFeedbackPrompt = useAppStore((s) => s.openFeedbackPrompt);
  const openSafetyModal = useAppStore((s) => s.openSafetyModal);

  // Standalone routes (public shared notes & dedicated admin portal)
  const isStandalone = pathname?.startsWith("/note/") || pathname?.startsWith("/admin");

  if (isStandalone) {
    return (
      <AuthGate>
        <main className="min-h-screen flex flex-col w-full">
          {children}
        </main>
        <FloatingFeedbackWidget />
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="flex min-h-screen">
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

        {/* Main content — no left margin on mobile */}
        <main className="flex-1 min-h-screen flex flex-col md:ml-60">
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

          <div className="flex-1">
            {children}
          </div>
        </main>
        <FloatingFeedbackWidget />
      </div>
    </AuthGate>
  );
}
