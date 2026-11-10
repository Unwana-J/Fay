"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, ShieldCheck, Flame } from "lucide-react";

const WEEKDAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

// ─── Streak Calculation Helper ───────────────────────────────────────────────
export function getStreakDates(current: number, lastDate: string | null): string[] {
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
export function getMonthDays(year: number, month: number) {
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
export default function StreakCalendarModal({
  onClose,
  streakCurrent,
  streakLongest,
  streakLastDate,
  streakShields,
  profileXp,
  onBuyShield,
  activityDates,
}: {
  onClose: () => void;
  streakCurrent: number;
  streakLongest: number;
  streakLastDate: string | null;
  streakShields: number;
  profileXp: number;
  onBuyShield: () => boolean;
  activityDates: Set<string>;
}) {
  const streakDates = getStreakDates(streakCurrent, streakLastDate);
  const hasActivity = (dateStr: string) => activityDates.has(dateStr);
  const isStreak = (dateStr: string) => streakDates.includes(dateStr);
  const [shieldMsg, setShieldMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 surface-modal backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-2xl w-full surface-raised shadow-2xl border border-[var(--border-dim)] my-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--terra)]" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--olive)] font-semibold">Scholar Cadence</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-display tracking-tight text-[var(--text)]">Streak Calendar</h2>
            <p style={{ color: "var(--text-dim)" }} className="text-xs mt-1">
              Active streak: <span className="font-bold text-[var(--terra)]">{streakCurrent} days</span> · Longest streak: <span className="font-semibold text-[var(--text)]">{streakLongest} days</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors cursor-pointer text-[var(--text-dim)] hover:text-[var(--text)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="print-divider mb-6" />

        {/* Calendar grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6">
          {monthsToRender.map((m, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-center font-serif font-bold text-sm tracking-wide text-[var(--text)]">{m.label}</h3>
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[var(--text-mute)] tracking-wider mb-1">
                {WEEKDAY_HEADERS.map((h, i) => <div key={i}>{h}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-y-1.5 justify-items-center">
                {m.days.map((day, dIdx) => {
                  if (day.isPadding) return <div key={dIdx} className="w-8 h-8" />;
                  
                  const played = hasActivity(day.dateStr);
                  const active = isStreak(day.dateStr);

                  let cellClass = "w-8 h-8 flex items-center justify-center text-xs font-mono transition-all relative rounded-full ";
                  const cellStyle: React.CSSProperties = {};

                  if (active) {
                    cellClass += "text-white font-bold bg-[var(--terra)] shadow-sm ";
                  } else if (played) {
                    cellClass += "bg-[var(--bg-input)] border border-[var(--olive)] text-[var(--olive-text)] font-semibold";
                  } else {
                    cellClass += "text-[var(--text)] hover:bg-[var(--bg-input)]/50";
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
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white/70" />
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
          className="p-4 rounded-xl border mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
          style={{ background: "var(--bg-input)/30", borderColor: "var(--border-dim)" }}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
              <ShieldCheck size={20} />
            </div>
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
            className="btn-ghost text-xs px-3 py-1.5 whitespace-nowrap font-mono cursor-pointer self-end sm:self-auto shrink-0"
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
    </motion.div>,
    document.body
  );
}
