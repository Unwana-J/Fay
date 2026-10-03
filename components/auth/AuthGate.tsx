"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import OnboardingModal from "./OnboardingModal";
import PreserveScholarshipModal from "./PreserveScholarshipModal";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isOnboarded = useAppStore((s) => s.isOnboarded);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profile = useAppStore((s) => s.profile);
  const isSuspended = Boolean(profile.isBanned || profile.isDeactivated);

  const isPublicNote = pathname?.startsWith("/note/");
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      {children}
      {mounted && isSuspended && !isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="surface border max-w-md w-full p-6 rounded-2xl text-center space-y-4" style={{ borderColor: "var(--terra)" }}>
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center" style={{ background: "rgba(122, 28, 46, 0.15)", color: "var(--terra)" }}>
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="font-serif text-xl font-bold" style={{ color: "var(--text)" }}>
              {profile.isBanned ? "Account Suspended" : "Account Deactivated"}
            </h2>
            <p className="text-xs" style={{ color: "var(--text-dim)" }}>
              {profile.banReason
                ? `Reason: ${profile.banReason}`
                : "Your scholarly account has been suspended by the moderation desk for policy or safety violations."}
            </p>
            <div className="p-3 rounded-xl border text-[11px] font-mono text-left" style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}>
              <div>Scholar: @{profile.username}</div>
              <div>ID: {profile.id}</div>
              <div className="mt-1" style={{ color: "var(--text-mute)" }}>Inquiries: safety@lokinlabs.ng</div>
            </div>
          </div>
        </div>
      )}
      {mounted && !isSuspended && !isOnboarded && !isPublicNote && !isAdmin && <OnboardingModal isOpen={true} />}
      {mounted && !isSuspended && isOnboarded && !isPublicNote && !isAdmin && <PreserveScholarshipModal />}
    </>
  );
}

