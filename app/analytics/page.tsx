"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart
} from "recharts";
import { TrendingUp, Clock, Mic, BookOpen, Flame, Star } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getLast7Days, getLast52Weeks, getDayOfWeek } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Custom Premium Palette for Charts ──────────────────────────────────────
const EDITORIAL_PALETTE = [
  "var(--olive)",
  "var(--terra)",
  "var(--gold)",
  "#62694C", // lighter olive
  "#8F4351", // light burgundy
  "#C09C48", // light gold
  "#8E9283", // muted olive grey
];

/* ─── Framer Motion Stagger Variants ──────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18
    }
  }
};

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, scale: 1.01 }}
      className="surface rounded-xl p-5"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: "var(--bg-input)", border: "1px solid var(--border-dim)" }}>
        {icon}
      </div>
      <div className="font-mono font-semibold" style={{ fontSize: "1.75rem", color: "var(--text)", lineHeight: 1 }}>{value}</div>
      <div className="text-label mt-1">{label}</div>
      {sub && <div style={{ color: "var(--text-mute)" }} className="text-[10px] mt-0.5">{sub}</div>}
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { sessions, streak } = useAppStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // ── Trend data (last 14 sessions) ──
  const trendData = sessions.slice(0, 14).reverse().map((s, i) => ({
    name: `S${i + 1}`,
    confidence: s.ratings.confidence,
    understanding: s.ratings.understanding,
    communication: s.ratings.communication,
  }));

  // ── Weekly bar chart ──
  const last7 = getLast7Days();
  const weeklyData = last7.map((day) => ({
    name: new Date(day + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" }),
    sessions: sessions.filter((s) => s.date === day).length,
    research: sessions.filter((s) => s.date === day).reduce((a, s) => a + s.researchMinutes, 0),
  }));

  // ── Category distribution ──
  const catCounts: Record<string, number> = {};
  sessions.forEach((s) => { catCounts[s.category] = (catCounts[s.category] ?? 0) + 1; });
  const pieData = Object.entries(catCounts).map(([cat, count], idx) => ({
    name: cat,
    value: count,
    color: EDITORIAL_PALETTE[idx % EDITORIAL_PALETTE.length],
  }));

  // ── Summary stats ──
  const totalResearchMin = sessions.reduce((a, s) => a + s.researchMinutes, 0);
  const totalSpeakSec = sessions.reduce((a, s) => a + s.speakingSeconds, 0);
  const avgConf = sessions.length ? (sessions.reduce((a, s) => a + s.ratings.confidence, 0) / sessions.length).toFixed(1) : "0";

  // ── Heatmap ──
  const histMap: Record<string, number> = {};
  sessions.forEach((s) => { histMap[s.date] = (histMap[s.date] ?? 0) + 1; });
  const allDays = getLast52Weeks();
  const weeks: string[][] = [];
  let week: string[] = [];
  allDays.forEach((day, i) => {
    if (i === 0) for (let p = 0; p < getDayOfWeek(day); p++) week.push("");
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length > 0) weeks.push(week);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl px-3 py-2 text-xs border surface-raised bg-[var(--bg-card)]">
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span style={{ color: "var(--text-dim)" }} className="capitalize">{p.name}:</span>
            <span style={{ color: "var(--text)" }} className="font-semibold">{p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto"
    >
      <motion.div variants={cardVariants} className="mb-10">
        <h1 className="font-space text-3xl font-bold mb-1 text-display" style={{ color: "var(--text)" }}>Analytics</h1>
        <p style={{ color: "var(--text-dim)" }}>Track your learning progress and identify patterns.</p>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard icon={<BookOpen size={14} style={{ color: "var(--olive)" }} />} label="Research time" value={`${Math.round(totalResearchMin / 60)}h ${totalResearchMin % 60}m`} sub={`${sessions.length} sessions`} />
        <StatCard icon={<Mic size={14} style={{ color: "var(--terra)" }} />} label="Speaking time" value={`${Math.round(totalSpeakSec / 60)}m`} sub="On the mic" />
        <StatCard icon={<Star size={14} style={{ color: "var(--gold)" }} />} label="Avg confidence" value={`${avgConf}/5`} sub="Self-rated" />
        <StatCard icon={<Flame size={14} style={{ color: "var(--terra)" }} />} label="Longest streak" value={`${streak.longest}d`} sub={`Current: ${streak.current}d`} />
      </div>

      {/* Trend chart */}
      <motion.div variants={cardVariants} className="rounded-xl p-5 mb-5 surface">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-heading" style={{ fontSize: "0.9rem" }}>Skill Trends</h3>
            <p style={{ color: "var(--text-mute)" }} className="text-xs mt-0.5">Confidence, Understanding & Communication over recent sessions</p>
          </div>
          <TrendingUp size={16} style={{ color: "var(--text-mute)" }} />
        </div>
        {trendData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs" style={{ color: "var(--text-mute)" }}>Complete sessions to see trends</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradConf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradUnd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--olive-br)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--olive-br)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradComm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--terra)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--terra)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(68,78,44,0.08)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-mute)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fill: "var(--text-mute)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="confidence" stroke="var(--gold)" fill="url(#gradConf)" strokeWidth={2} dot={false} name="Confidence" />
              <Area type="monotone" dataKey="understanding" stroke="var(--olive-br)" fill="url(#gradUnd)" strokeWidth={2} dot={false} name="Understanding" />
              <Area type="monotone" dataKey="communication" stroke="var(--terra)" fill="url(#gradComm)" strokeWidth={2} dot={false} name="Communication" />
            </AreaChart>
          </ResponsiveContainer>
        )}
        <div className="flex items-center gap-4 mt-3">
          {[{ color: "var(--gold)", label: "Confidence" }, { color: "var(--olive-br)", label: "Understanding" }, { color: "var(--terra)", label: "Communication" }].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-dim)" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />{l.label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bar + Pie */}
      <div className="grid lg:grid-cols-2 gap-3 mb-5">
        
        {/* Daily Activity */}
        <motion.div variants={cardVariants} className="rounded-xl p-5 surface">
          <h3 className="text-heading mb-4" style={{ fontSize: "0.9rem" }}>Daily Activity (7 days)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(68,78,44,0.08)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-mute)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-mute)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sessions" fill="var(--olive-br)" radius={[3,3,0,0]} name="Sessions" />
              <Bar dataKey="research" fill="var(--terra)" radius={[3,3,0,0]} name="Research Min" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            {[{ color: "var(--olive-br)", label: "Sessions" }, { color: "var(--terra)", label: "Research min" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-dim)" }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />{l.label}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category distribution */}
        <motion.div variants={cardVariants} className="rounded-xl p-5 surface">
          <h3 className="text-heading mb-4" style={{ fontSize: "0.9rem" }}>Category Distribution</h3>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs" style={{ color: "var(--text-mute)" }}>No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {pieData.slice(0, 6).map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="truncate" style={{ color: "var(--text-dim)" }}>{d.name}</span>
                    <span className="font-mono text-xs ml-auto" style={{ color: "var(--text-mute)" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Activity heatmap */}
      <motion.div variants={cardVariants} className="rounded-xl p-5 surface">
        <h3 className="text-heading mb-4" style={{ fontSize: "0.9rem" }}>Year Activity</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-0.5 min-w-max">
            {weeks.map((wk, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {wk.map((day, di) =>
                  day === "" ? <div key={di} className="w-[11px] h-[11px]" /> : (
                    <div key={di} title={day}
                      className="w-[11px] h-[11px] rounded-[2px] transition-colors cursor-default"
                      style={{
                        background: !histMap[day]
                          ? "var(--olive-dim)"
                          : histMap[day] === 1
                          ? "rgba(68,78,44,0.4)"
                          : histMap[day] === 2
                          ? "rgba(68,78,44,0.7)"
                          : "var(--olive)",
                        opacity: !histMap[day] ? 0.4 : 1,
                      }}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-1.5 mt-3">
          <span className="text-label">Less</span>
          {[0.4, 0.55, 0.75, 1].map((op, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-[2px]"
              style={{ background: `var(--olive)`, opacity: op }}
            />
          ))}
          <span className="text-label">More</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
