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
  sessions,
}: {
  onClose: () => void;
  streakCurrent: number;
  streakLongest: number;
  streakLastDate: string | null;
  sessions: CompletedSession[];
}) {
  const streakDates = getStreakDates(streakCurrent, streakLastDate);
  const hasSession = (dateStr: string) => sessions.some((s) => s.date === dateStr);
  const isStreak = (dateStr: string) => streakDates.includes(dateStr);

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

                  // Compute borders for streak styling to merge adjacent days horizontally
                  const dayOfWeek = new Date(day.dateStr + "T00:00:00").getDay();
                  
                  const yesterdayStr = (() => {
                    const d = new Date(day.dateStr + "T00:00:00");
                    d.setDate(d.getDate() - 1);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  })();
                  const tomorrowStr = (() => {
                    const d = new Date(day.dateStr + "T00:00:00");
                    d.setDate(d.getDate() + 1);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  })();

                  const mergeLeft = active && streakDates.includes(yesterdayStr) && dayOfWeek !== 0;
                  const mergeRight = active && streakDates.includes(tomorrowStr) && dayOfWeek !== 6;

                  let cellStyle: React.CSSProperties = {};
                  let cellClass = "w-8 h-8 flex items-center justify-center text-xs font-semibold transition-all relative ";

                  if (active) {
                    cellClass += "bg-[var(--terra)] text-white font-bold ";
                    if (mergeLeft && mergeRight) {
                      cellClass += "rounded-none";
                    } else if (mergeLeft) {
                      cellClass += "rounded-r-full rounded-l-none";
                    } else if (mergeRight) {
                      cellClass += "rounded-l-full rounded-r-none";
                    } else {
                      cellClass += "rounded-full";
                    }
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
                      {/* Sub dot for sessions on streak days */}
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

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t" style={{ borderColor: "var(--border-dim)" }}>
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
export default function Sidebar() {
  const pathname = usePathname();
  const { profile, streak, sessions } = useAppStore();
  const [showStreakModal, setShowStreakModal] = useState(false);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [15, -15]), { stiffness: 180, damping: 20 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-15, 15]), { stiffness: 180, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Normalized coordinates from 0 to 1
    const mouseX = (e.clientX - rect.left) / width;
    const mouseY = (e.clientY - rect.top) / height;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };
  
  const level   = getLevelForXP(profile.xp);
  const progress = getLevelProgress(profile.xp);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-60 surface-panel flex flex-col z-40">

        {/* ── Wordmark ── */}
        <div className="px-5 pt-6 pb-4" style={{ borderBottom: "1px solid var(--border-dim)" }}>
          <Link href="/" className="group flex items-center gap-2.5">
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
        </div>

        {/* ── Streak — hero metric in the sidebar ── */}
        <div style={{ perspective: 1000 }}>
          <motion.div 
            onClick={() => setShowStreakModal(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "px-5 py-4 rounded-xl cursor-pointer group m-2 border shadow-sm relative overflow-hidden",
              streak.current > 0 
                ? "border-transparent shadow-md hover:shadow-lg"
                : "border-dashed border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-input)]/40 hover:border-solid"
            )}
            style={{
              backgroundColor: streak.current > 0 ? "var(--terra)" : undefined,
              color: streak.current > 0 ? "#FFFFFF" : undefined,
              transformStyle: "preserve-3d",
              rotateX,
              rotateY,
            }}
          >
          <div className="flex items-center justify-between mb-2" style={{ transform: "translateZ(10px)" }}>
            <div 
              className="text-label"
              style={{ color: streak.current > 0 ? "rgba(255, 255, 255, 0.8)" : "var(--text-mute)" }}
            >
              Today's streak
            </div>
            <Calendar size={12} className={cn("transition-colors", streak.current > 0 ? "text-white/80 group-hover:text-white" : "text-[var(--text-mute)] group-hover:text-[var(--text)]")} />
          </div>
          <div className="flex items-end gap-3" style={{ transform: "translateZ(15px)" }}>
            <motion.span
              whileHover={{ scale: 1.22, rotate: [0, -8, 8, 0] }}
              transition={{ type: "spring", stiffness: 350, damping: 10 }}
              className={cn("text-4xl leading-none select-none inline-block cursor-pointer", streak.current > 0 ? "flame-pulse" : "opacity-40")}
              style={{ filter: streak.current > 0 ? "drop-shadow(0 4px 12px rgba(255,255,255,0.25))" : "none" }}
            >
              🔥
            </motion.span>
            <div>
              <div
                className="font-mono font-bold leading-none"
                style={{
                  fontSize: "3rem",
                  color: streak.current > 0 ? "#FFFFFF" : "var(--text-mute)",
                  lineHeight: 1,
                }}
              >
                <CountUp end={streak.current} />
              </div>
              <div className="text-label mt-1" style={{ color: streak.current > 0 ? "rgba(255, 255, 255, 0.8)" : undefined }}>
                {streak.current === 0 ? "days" : streak.current === 1 ? "day" : "days"}
              </div>
            </div>
          </div>
          {streak.current > 0 && (
            <div
              className="mt-2 text-xs"
              style={{ color: "rgba(255, 255, 255, 0.9)", transform: "translateZ(10px)" }}
            >
              Best: {streak.longest}d — click to view
            </div>
          )}
        </motion.div>
      </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn("nav-item", active && "active")}
                >
                  <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                  <span>{label}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-dot"
                      className="ml-auto w-1 h-1 rounded-full"
                      style={{ background: "var(--terra)" }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* ── User Profile ── */}
        <div className="px-4 py-3 flex items-center gap-3" style={{ borderTop: "1px solid var(--border-dim)" }}>
          <UserAvatar avatar={profile.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>{profile.username}</div>
            <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>Level {level.level}</div>
          </div>
        </div>

        {/* ── XP / Level ── */}
        <div className="px-4 pb-5 pt-3" style={{ borderTop: "1px solid var(--border-dim)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-mute)" }}>{level.title}</span>
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
            sessions={sessions}
          />
        )}
      </AnimatePresence>
    </>
  );
}
