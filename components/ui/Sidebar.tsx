"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  BookOpen, Compass, Network,
  Activity, User, Zap, X, Calendar, ChevronRight, Users, Library, Gamepad2
} from "lucide-react";
import { useAppStore, type CompletedSession } from "@/store/useAppStore";
import { getLevelForXP, getLevelProgress } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import FeyLogo from "@/components/ui/FeyLogo";
import UserAvatar from "@/components/ui/UserAvatar";

const NAV_ITEMS = [
  { href: "/",              label: "Dashboard",     icon: BookOpen },
  { href: "/discover",      label: "Discover",      icon: Compass },
  { href: "/games",         label: "Games",         icon: Gamepad2 },
  { href: "/community",     label: "Community",     icon: Users },
  { href: "/library",       label: "Library",       icon: Library },
  { href: "/constellation", label: "Constellation", icon: Network },
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

// ─── Streak Calculation Helper ───────────────────────────────────────────────
function getStreakDates(current: number, lastDate: string | null): string[] {
  if (current <= 0 || !lastDate) return [];
  const dates: string[] = [];
  const currentDate = new Date(lastDate + "T00:00:00");
  for (let i = 0; i < current; i++) {
    const d = new Date(currentDate);
    d.setDate(currentDate.getDate() - i);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dy = String(d.getDate()).padStart(2, "0");
    dates.push(`${yr}-${mo}-${dy}`);
  }
  return dates;
}

// ─── Calendar Generator ──────────────────────────────────────────────────────
function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sun, 6 = Sat
  const numDays = new Date(year, month + 1, 0).getDate();
  
  const days: Array<{ dateStr: string; dayNum: number; isPadding: boolean }> = [];
  
  // Padding for empty start cells
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ dateStr: "", dayNum: 0, isPadding: true });
  }
  
  // Month days
  for (let d = 1; d <= numDays; d++) {
    const yr = year;
    const mo = String(month + 1).padStart(2, "0");
    const dy = String(d).padStart(2, "0");
    days.push({ dateStr: `${yr}-${mo}-${dy}`, dayNum: d, isPadding: false });
  }
  
  return days;
}

// ─── Streak Calendar Modal ────────────────────────────────────────────────────
function StreakCalendarModal({
  onClose,
  streakCurrent,
  streakLongest,
  streakLastDate,
  streakShields,
  profileXp,
  onBuyShield,
  sessions,
}: {
  onClose: () => void;
  streakCurrent: number;
  streakLongest: number;
  streakLastDate: string | null;
  streakShields: number;
  profileXp: number;
  onBuyShield: () => boolean;
  sessions: CompletedSession[];
}) {
  const streakDates = getStreakDates(streakCurrent, streakLastDate);
  const hasSession = (dateStr: string) => sessions.some((s) => s.date === dateStr);
  const isStreak = (dateStr: string) => streakDates.includes(dateStr);
  const [shieldMsg, setShieldMsg] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Previous month details
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();

  const monthsToRender = [
    { label: prevMonthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }), days: getMonthDays(prevYear, prevMonth) },
    { label: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }), days: getMonthDays(currentYear, currentMonth) },
  ];

  function handleAcquireShield() {
    const ok = onBuyShield();
    if (ok) {
      setShieldMsg("Scholar's Seal secured! Your streak is protected.");
    } else {
      setShieldMsg("Insufficient XP. Complete sprints to earn 150 XP.");
    }
    setTimeout(() => setShieldMsg(null), 3000);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-6 surface-modal"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl p-8 max-w-2xl w-full surface-raised"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-space text-2xl font-bold text-display mb-1">Streak Calendar</h2>
            <p style={{ color: "var(--text-dim)" }} className="text-xs">
              Active streak: <span className="font-bold text-[var(--terra)]">{streakCurrent} days</span> · Longest streak: <span className="font-semibold">{streakLongest} days</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors">
            <X size={15} style={{ color: "var(--text-dim)" }} />
          </button>
        </div>

        <div className="print-divider mb-6" />

        {/* Calendar grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {monthsToRender.map((m, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-center font-space font-bold text-sm tracking-wide text-[var(--text)]">{m.label}</h3>
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[var(--text-mute)] tracking-wider mb-1">
                {WEEKDAY_HEADERS.map((h, i) => <div key={i}>{h}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1.5 justify-items-center">
                {m.days.map((day, dIdx) => {
                  if (day.isPadding) return <div key={dIdx} className="w-8 h-8" />;
                  
                  const played = hasSession(day.dateStr);
                  const active = isStreak(day.dateStr);

                  let cellClass = "w-8 h-8 flex items-center justify-center text-xs font-mono transition-all relative ";
                  const cellStyle: React.CSSProperties = {};

                  if (active) {
                    cellClass += "text-white font-bold bg-[var(--terra)] ";
                  } else if (played) {
                    cellClass += "rounded-full bg-[var(--bg-input)] border border-[var(--olive)] text-[var(--olive-text)]";
                  } else {
                    cellClass += "text-[var(--text)] rounded-full hover:bg-[var(--bg-input)]/50";
                  }

                  return (
                    <div
                      key={dIdx}
                      title={day.dateStr}
                      className={cellClass}
                      style={cellStyle}
                    >
                      {day.dayNum}
                      {active && played && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white/60" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Scholar's Seal (Loss Aversion / Streak Protection) */}
        <div
          className="p-4 rounded-xl border mb-4 flex items-center justify-between gap-4"
          style={{ background: "var(--bg-input)/30", borderColor: "var(--border-dim)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none">🛡️</span>
            <div>
              <div className="text-xs font-bold font-serif" style={{ color: "var(--text)" }}>
                Scholar&apos;s Seal of Protection
              </div>
              <p className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                Automatically shields your streak if you miss a single day. You hold{" "}
                <span className="font-bold font-mono" style={{ color: "var(--terra)" }}>
                  {streakShields} active
                </span>
                .
              </p>
              {shieldMsg && (
                <p className="text-[10px] font-mono text-[var(--terra)] mt-1 font-semibold">
                  {shieldMsg}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAcquireShield}
            disabled={profileXp < 150}
            className="btn-ghost text-xs px-3 py-1.5 whitespace-nowrap font-mono cursor-pointer"
            style={{
              opacity: profileXp >= 150 ? 1 : 0.5,
              borderColor: "var(--gold)",
              color: "var(--text)",
            }}
            title={profileXp < 150 ? "Earn 150 XP to acquire a seal" : "Acquire streak seal"}
          >
            Acquire (+1) · 150 XP
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-3 border-t" style={{ borderColor: "var(--border-dim)" }}>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-5 h-5 rounded-full bg-[var(--bg-input)] border border-[var(--olive)] flex items-center justify-center text-[10px] text-[var(--olive-text)] font-bold">12</div>
            <span style={{ color: "var(--text-dim)" }}>Completed Session</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-8 h-5 rounded-full bg-[var(--terra)] text-white flex items-center justify-center text-[10px] font-bold">12</div>
            <span style={{ color: "var(--text-dim)" }}>Active Streak Day</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Sidebar ────────────────────────────────────────────────────────────
export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { profile, streak, sessions, buyStreakShield } = useAppStore();
  const [showStreakModal, setShowStreakModal] = useState(false);
  
  const level   = getLevelForXP(profile.xp);
  const progress = getLevelProgress(profile.xp);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
            return (
              <Link key={href} href={href} onClick={onClose}>
                <motion.div
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn("nav-item", active && "active")}
                >
                  <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                  <span>{label}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-dot"
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--terra)" }}
                    />
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
              <span className={streak.current > 0 ? "flame-pulse text-base" : "opacity-45 text-sm"}>🔥</span>
              <span
                className="font-medium font-mono text-[11px]"
                style={{ color: streak.current > 0 ? "var(--terra)" : "var(--text)" }}
              >
                {streak.current} {streak.current === 1 ? "day streak" : "days streak"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {(streak.shields ?? 0) > 0 && (
                <span className="text-[10px] select-none" title={`${streak.shields} streak shield active`}>🛡️</span>
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
            sessions={sessions}
          />
        )}
      </AnimatePresence>
    </>
  );
}
