"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Dices,
  BookOpen,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/games", label: "Games", icon: Dices },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/profile", label: "Profile", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on full-screen / immersive game flows
  const isImmersive =
    pathname?.startsWith("/session/") ||
    pathname?.startsWith("/podium/slides/") ||
    pathname?.startsWith("/podium/present") ||
    pathname?.startsWith("/play/room/") ||
    pathname?.startsWith("/note/") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/vatar");

  if (isImmersive) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-[var(--border-dim)] bg-[var(--bg-base)]/95 backdrop-blur-lg pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-lg select-none"
    >
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center h-full py-1 rounded-xl transition-all active:scale-95 touch-manipulation relative",
                isActive
                  ? "text-[var(--terra)] font-bold"
                  : "text-[var(--text-dim)] hover:text-[var(--text)]"
              )}
            >
              <div className="relative">
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.4 : 1.9}
                  className={cn("transition-transform", isActive && "scale-105")}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--terra)]" />
                )}
              </div>
              <span className="text-[10px] font-space tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
