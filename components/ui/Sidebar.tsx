"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  LayoutDashboard, Compass, Orbit,
  Activity, User, Zap, X, Calendar, ChevronRight, Users, BookOpen, Dices,
  ShieldAlert, Sparkles, ShieldCheck, Flame
} from "lucide-react";
import { useAppStore, type CompletedSession } from "@/store/useAppStore";
import { getLevelForXP, getLevelProgress } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import FeyLogo from "@/components/ui/FeyLogo";
import UserAvatar from "@/components/ui/UserAvatar";
import StreakCalendarModal from "@/components/ui/StreakCalendarModal";

const NAV_ITEMS = [
  { href: "/",              label: "Dashboard",     icon: LayoutDashboard },
  { href: "/discover",      label: "Discover",      icon: Compass },
  { href: "/games",         label: "Games",         icon: Dices },
  { href: "/community",     label: "Community",     icon: Users },
  { href: "/library",       label: "Library",       icon: BookOpen },
  { href: "/constellation", label: "Constellation", icon: Orbit },
  { href: "/analytics",     label: "Analytics",     icon: Activity },
  { href: "/profile",       label: "Profile",       icon: User },
];

const WEEKDAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

// ─── Gamified Count-Up score count animation ─────────────────────────────────
function CountUp({ end, duration = 1000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{count}</>;
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────
export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const {
    profile,
    streak,
    sessions,
    triviaHistory = [],
    articulateHistory = [],
    buyStreakShield,
    syncActivityDates,
    openFeedbackPrompt,
    openSafetyModal,
  } = useAppStore();
  const [showStreakModal, setShowStreakModal] = useState(false);
  
  const level   = getLevelForXP(profile.xp);
  const progress = getLevelProgress(profile.xp);

  // Sync historical scores from server if available for this scholar
  useEffect(() => {
    if (!profile?.username || profile.username.trim() === "Scholar") return;
    fetch(`/api/trivia/scores?username=${encodeURIComponent(profile.username.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.dates) && data.dates.length > 0) {
          syncActivityDates(data.dates);
        }
      })
      .catch(() => {});
  }, [profile?.username, syncActivityDates]);

  // Aggregate all unique active scholar dates across solo sessions, trivia, and articulate rooms
  const activityDates = useMemo(() => {
    const dates = new Set<string>();
    (sessions || []).forEach((s) => s.date && dates.add(s.date));
    (triviaHistory || []).forEach((t) => {
      if (t.date) dates.add(t.date);
      else if (t.timestamp) {
        const d = new Date(t.timestamp);
        const yr = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, "0");
        const dy = String(d.getDate()).padStart(2, "0");
        dates.add(`${yr}-${mo}-${dy}`);
      }
    });
    (articulateHistory || []).forEach((a) => {
      if (a.timestamp) {
        const d = new Date(a.timestamp);
        const yr = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, "0");
        const dy = String(d.getDate()).padStart(2, "0");
        dates.add(`${yr}-${mo}-${dy}`);
      }
    });
    (streak.history || []).forEach((h) => h.date && dates.add(h.date));
    return dates;
  }, [sessions, triviaHistory, articulateHistory, streak.history]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const [constellationPulse, setConstellationPulse] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    function onPulse(e: Event) {
      const custom = e as CustomEvent<{ kind?: "sun" | "moon" | "star" }>;
      const kind = custom.detail?.kind || "star";
      const label = kind === "sun" ? "+1 Sun" : kind === "moon" ? "+1 Moon" : "+1 Star";
      setConstellationPulse(label);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setConstellationPulse(null), 6500);
    }
    window.addEventListener("fey:constellation-nav-pulse", onPulse);
    return () => {
      window.removeEventListener("fey:constellation-nav-pulse", onPulse);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <aside className="h-screen w-60 surface-panel flex flex-col">

        {/* ── Wordmark ── */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-dim)" }}>
          <Link href="/" onClick={onClose} className="group flex items-center gap-2.5">
            {/* Custom Brain + Fairy Wings SVG Logo */}
            <FeyLogo size={28} />
            <div>
              <span
                className="font-space font-bold text-base tracking-tight"
                style={{ color: "var(--text)" }}
              >
                Fey
              </span>
              <div className="text-[9px] tracking-[0.14em] uppercase" style={{ color: "var(--text-mute)" }}>
                Think Deeper
              </div>
            </div>
          </Link>
          {/* Mobile close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
              aria-label="Close navigation"
            >
              <X size={16} style={{ color: "var(--text-dim)" }} />
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            const isConstellation = href === "/constellation";
            return (
              <Link key={href} href={href} onClick={onClose}>
                <motion.div
                  data-constellation-nav={isConstellation ? "desktop" : undefined}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  animate={
                    isConstellation && constellationPulse
                      ? { scale: [1, 1.06, 1], transition: { duration: 0.55 } }
                      : undefined
                  }
                  className={cn(
                    "nav-item",
                    active && "active",
                    isConstellation && constellationPulse && "ring-2 ring-[var(--gold)] bg-[var(--gold-bg)]"
                  )}
                >
                  <Icon
                    size={15}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={cn(isConstellation && constellationPulse && "text-[var(--gold)] animate-spin")}
                  />
                  <span>{label}</span>
                  {isConstellation && constellationPulse ? (
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold"
                      style={{
                        background: "var(--gold)",
                        color: "#FDFCFA",
                      }}
                    >
                      {constellationPulse}
                    </motion.span>
                  ) : (
                    active && (
                      <motion.span
                        layoutId="nav-dot"
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ background: "var(--terra)" }}
                      />
                    )
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* ── User Profile & Streak ── */}
        <div className="px-4 py-3.5 space-y-3" style={{ borderTop: "1px solid var(--border-dim)" }}>
          <div className="flex items-center gap-3">
            <UserAvatar avatar={profile.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>{profile.username}</div>
              <div className="text-[10px] truncate" style={{ color: "var(--text-mute)" }}>{level.title} · Lv {level.level}</div>
            </div>
          </div>

          {/* Elegant Streak Trigger */}
          <button
            type="button"
            onClick={() => setShowStreakModal(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-[var(--bg-input)]/70 border border-[var(--border-dim)] cursor-pointer text-left"
            style={{
              background: streak.current > 0 ? "rgba(122, 28, 46, 0.08)" : "var(--bg-input)/30",
            }}
          >
            <div className="flex items-center gap-1.5">
              {streak.current > 0 ? (
                <Flame size={15} className="text-amber-500 fill-amber-500/80 animate-pulse shrink-0" />
              ) : (
                <Flame size={15} className="text-[var(--text-mute)] opacity-50 shrink-0" />
              )}
              <span
                className="font-medium font-mono text-[11px]"
                style={{ color: streak.current > 0 ? "var(--terra)" : "var(--text)" }}
              >
                {streak.current} {streak.current === 1 ? "day streak" : "days streak"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {(streak.shields ?? 0) > 0 && (
                <span
                  className="inline-flex items-center text-amber-600 dark:text-amber-400"
                  title={`${streak.shields} streak shield active`}
                >
                  <ShieldCheck size={13} />
                </span>
              )}
              <span className="text-[10px] font-mono" style={{ color: "var(--text-mute)" }}>
                History →
              </span>
            </div>
          </button>
        </div>

        {/* ── XP / Level ── */}
        <div className="px-4 pb-4 pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono" style={{ color: "var(--text-mute)" }}>
              Level {level.level}
            </span>
            <span className="font-mono text-xs font-semibold" style={{ color: "var(--gold)" }}>
              {profile.xp} XP
            </span>
          </div>

          {/* XP bar */}
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--bg-input)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--gold)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </aside>

      {/* Streak calendar popup */}
      <AnimatePresence>
        {showStreakModal && (
          <StreakCalendarModal
            onClose={() => setShowStreakModal(false)}
            streakCurrent={streak.current}
            streakLongest={streak.longest}
            streakLastDate={streak.lastDate}
            streakShields={streak.shields ?? 1}
            profileXp={profile.xp}
            onBuyShield={buyStreakShield}
            activityDates={activityDates}
          />
        )}
      </AnimatePresence>
    </>
  );
}
