"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import AuthGate from "@/components/auth/AuthGate";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Standalone public routes shouldn't be constrained by the 240px sidebar layout
  const isStandalone = pathname?.startsWith("/note/");

  if (isStandalone) {
    return (
      <AuthGate>
        <main className="min-h-screen flex flex-col w-full">
          {children}
        </main>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-h-screen flex flex-col" style={{ marginLeft: "240px" }}>
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
