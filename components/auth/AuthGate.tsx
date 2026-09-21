"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import OnboardingModal from "./OnboardingModal";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isOnboarded = useAppStore((s) => s.isOnboarded);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublicNote = pathname?.startsWith("/note/");

  return (
    <>
      {children}
      {mounted && !isOnboarded && !isPublicNote && <OnboardingModal isOpen={true} />}
    </>
  );
}
