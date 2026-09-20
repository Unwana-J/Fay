"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import OnboardingModal from "./OnboardingModal";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const isOnboarded = useAppStore((s) => s.isOnboarded);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {children}
      {mounted && !isOnboarded && <OnboardingModal isOpen={true} />}
    </>
  );
}
