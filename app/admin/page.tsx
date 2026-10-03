"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Star,
  Users,
  BarChart3,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Ban,
  UserCheck,
  RefreshCw,
  Mail,
  Lock,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { FeedbackItem, IncidentReportItem, AdminUserItem } from "@/lib/admin-data";

export default function AdminPage() {
  const currentProfile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);

  // Security Gate: Session-stored passkey
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  // Tabs: overview | feedback | safety | users
  const [activeTab, setActiveTab] = useState<"overview" | "feedback" | "safety" | "users">("overview");

  // Data states
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [incidentList, setIncidentList] = useState<IncidentReportItem[]>([]);
  const [userList, setUserList] = useState<AdminUserItem[]>([]);

  // Filtering & search
  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "promoters" | "detractors">("all");
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [incidentFilter, setIncidentFilter] = useState<"all" | "pending" | "investigating" | "resolved">("all");
  const [userFilter, setUserFilter] = useState<"all" | "registered" | "guest" | "active" | "banned" | "deactivated">("all");
  const [userSearch, setUserSearch] = useState("");

  // Ban Modal state
  const [selectedUserToBan, setSelectedUserToBan] = useState<AdminUserItem | null>(null);
  const [banReasonInput, setBanReasonInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Check existing session auth on load
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("fey_admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, feedbackRes, safetyRes, usersRes] = await Promise.all([
        fetch("/api/admin/overview"),
        fetch("/api/feedback"),
        fetch("/api/safety/report"),
        fetch("/api/admin/users"),
      ]);

      if (overviewRes.ok) {
        const o = await overviewRes.json();
        if (o.success) setOverviewData(o.data);
      }
      if (feedbackRes.ok) {
        const f = await feedbackRes.json();
        if (f.success) setFeedbackList(f.items);
      }
      if (safetyRes.ok) {
        const s = await safetyRes.json();
        if (s.success) setIncidentList(s.incidents);
      }
      if (usersRes.ok) {
        const u = await usersRes.json();
        if (u.success) setUserList(u.users);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin secret passcode: fey2026 or custom Lokin pass
    if (passcode.trim() === "fey2026" || passcode.trim() === "admin") {
      setIsAuthenticated(true);
      sessionStorage.setItem("fey_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Invalid administrative passcode.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("fey_admin_auth");
    setIsAuthenticated(false);
  };

  // Incident status update
  const handleUpdateIncidentStatus = async (id: string, status: IncidentReportItem["status"]) => {
    try {
      const res = await fetch("/api/safety/report", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setIncidentList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      }
    } catch (err) {
      console.error("Failed to update incident:", err);
    }
  };

  // User moderation (Ban / Deactivate / Unban)
  const handleModerateUser = async (
    userId: string,
    action: "ban" | "unban" | "deactivate" | "activate",
    reason?: string
  ) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, reason }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUserList((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, ...data.user } : u))
          );

          // If current logged in browser user is affected, update local store too
          if (currentProfile.id === userId || currentProfile.username === userId) {
            updateProfile({
              isBanned: data.user.isBanned,
              isDeactivated: data.user.isDeactivated,
              banReason: data.user.banReason,
            });
          }
        }
      }
      setSelectedUserToBan(null);
      setBanReasonInput("");
    } catch (err) {
      console.error("Failed to moderate user:", err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered views
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((f) => {
      if (feedbackFilter === "promoters" && f.rating < 4) return false;
      if (feedbackFilter === "detractors" && f.rating > 3) return false;
      if (feedbackSearch.trim()) {
        const q = feedbackSearch.toLowerCase();
        const matchMsg = f.message?.toLowerCase().includes(q);
        const matchUser = f.username?.toLowerCase().includes(q);
        const matchPath = f.path?.toLowerCase().includes(q);
        if (!matchMsg && !matchUser && !matchPath) return false;
      }
      return true;
    });
  }, [feedbackList, feedbackFilter, feedbackSearch]);

  const filteredIncidents = useMemo(() => {
    return incidentList.filter((i) => {
      if (incidentFilter !== "all" && i.status !== incidentFilter) return false;
      return true;
    });
  }, [incidentList, incidentFilter]);

  const filteredUsers = useMemo(() => {
    return userList.filter((u) => {
      if (userFilter === "registered" && !u.isRegistered && !u.email) return false;
      if (userFilter === "guest" && (u.isRegistered || u.email)) return false;
      if (userFilter === "active" && (u.isBanned || u.isDeactivated)) return false;
      if (userFilter === "banned" && !u.isBanned) return false;
      if (userFilter === "deactivated" && !u.isDeactivated) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchUser = u.username?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        if (!matchUser && !matchEmail) return false;
      }
      return true;
    });
  }, [userList, userFilter, userSearch]);

  // If not authenticated, render Passcode Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface border rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-5"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(192, 156, 72, 0.15)", color: "var(--gold)" }}
          >
            <Lock size={26} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--text)" }}>
              Fey Back-Office
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
              Restricted management console for Lokin Labs administration.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter admin passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full text-center text-sm font-mono tracking-widest rounded-xl p-3 border focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border-dim)",
                  color: "var(--text)",
                }}
                autoFocus
              />
              {authError && (
                <p className="text-[11px] text-[var(--terra)] font-mono mt-1.5">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer text-[#1c1d17]"
              style={{ background: "var(--gold)" }}
            >
              Unlock Console
            </button>
          </form>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-mute)] hover:text-[var(--text)] transition-colors pt-2"
          >
            <ArrowLeft size={13} />
            <span>Return to Fey</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text)] pb-16">
      {/* ── Top Command Bar ── */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md bg-[var(--bg-base)]/90 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors text-[var(--text-mute)] hover:text-[var(--text)]"
            title="Return to platform"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold">Fey Back-Office</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider" style={{ background: "rgba(68, 78, 44, 0.2)", color: "var(--olive)" }}>
                Moderation Command
              </span>
            </div>
            <p className="text-[11px]" style={{ color: "var(--text-mute)" }}>
              Lokin Labs Administrative Console · Real-Time Incident & Pulse Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* PostHog Project Link */}
          <a
            href={overviewData?.posthog?.dashboardUrl || "https://us.posthog.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors hover:bg-[var(--bg-input)]"
            style={{ borderColor: "var(--border-dim)", color: "var(--gold)" }}
          >
            <BarChart3 size={14} />
            <span>PostHog Live</span>
            <ExternalLink size={12} />
          </a>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl border hover:bg-[var(--bg-input)] transition-colors text-[var(--text-dim)]"
            style={{ borderColor: "var(--border-dim)" }}
            title="Refresh records"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl border text-xs font-mono text-[var(--terra)] border-[var(--border-dim)] hover:bg-[var(--bg-input)] transition-colors"
          >
            Lock Desk
          </button>
        </div>
      </header>

      {/* ── Main Layout Container ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b pb-3 mb-6 overflow-x-auto" style={{ borderColor: "var(--border-dim)" }}>
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === "overview" ? "bg-[var(--bg-card)] shadow-sm font-bold border" : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
            }`}
            style={activeTab === "overview" ? { borderColor: "var(--border-dim)", color: "var(--gold)" } : {}}
          >
            <BarChart3 size={15} />
            <span>Strategic Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === "feedback" ? "bg-[var(--bg-card)] shadow-sm font-bold border" : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
            }`}
            style={activeTab === "feedback" ? { borderColor: "var(--border-dim)", color: "var(--gold)" } : {}}
          >
            <Sparkles size={15} />
            <span>"You dey feel am?"</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--bg-input)] font-bold">
              {feedbackList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("safety")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === "safety" ? "bg-[var(--bg-card)] shadow-sm font-bold border" : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
            }`}
            style={activeTab === "safety" ? { borderColor: "var(--border-dim)", color: "var(--terra)" } : {}}
          >
            <ShieldAlert size={15} />
            <span>Safety & Incident Desk</span>
            {incidentList.filter((i) => i.status === "pending").length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-900/60 text-red-200 font-bold">
                {incidentList.filter((i) => i.status === "pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === "users" ? "bg-[var(--bg-card)] shadow-sm font-bold border" : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
            }`}
            style={activeTab === "users" ? { borderColor: "var(--border-dim)", color: "var(--olive)" } : {}}
          >
            <Users size={15} />
            <span>Active Scholars & Moderation</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--bg-input)] font-bold">
              {userList.length}
            </span>
          </button>
        </div>

        {/* ── TAB 1: STRATEGIC OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="surface border rounded-2xl p-5" style={{ borderColor: "var(--border-dim)" }}>
                <div className="flex items-center justify-between text-xs font-mono uppercase mb-2" style={{ color: "var(--text-mute)" }}>
                  <span>Satisfaction (CSAT)</span>
                  <Star size={14} className="text-[var(--gold)]" />
                </div>
                <div className="font-mono text-3xl font-bold" style={{ color: "var(--gold)" }}>
                  {overviewData?.csat?.total > 0 ? (
                    <>
                      {overviewData.csat.average}
                      <span className="text-sm font-normal text-[var(--text-mute)]"> / 5.0</span>
                    </>
                  ) : (
                    <span className="text-2xl text-[var(--text-mute)] font-sans">No data yet</span>
                  )}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                  {overviewData?.csat?.total > 0
                    ? `${overviewData.csat.csatPercent}% Promoters (4-5★) · ${overviewData.csat.total} rating${overviewData.csat.total === 1 ? "" : "s"}`
                    : "Awaiting live scholar responses"}
                </div>
              </div>

              <div className="surface border rounded-2xl p-5" style={{ borderColor: "var(--border-dim)" }}>
                <div className="flex items-center justify-between text-xs font-mono uppercase mb-2" style={{ color: "var(--text-mute)" }}>
                  <span>Active Scholars</span>
                  <Users size={14} className="text-[var(--olive)]" />
                </div>
                <div className="font-mono text-3xl font-bold" style={{ color: "var(--olive)" }}>
                  {overviewData?.users?.active || userList.filter((u) => !u.isBanned).length}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                  {overviewData?.users?.banned || userList.filter((u) => u.isBanned).length} Suspended / Banned
                </div>
              </div>

              <div className="surface border rounded-2xl p-5" style={{ borderColor: "var(--border-dim)" }}>
                <div className="flex items-center justify-between text-xs font-mono uppercase mb-2" style={{ color: "var(--text-mute)" }}>
                  <span>Safety Incident Load</span>
                  <ShieldAlert size={14} className="text-[var(--terra)]" />
                </div>
                <div className="font-mono text-3xl font-bold" style={{ color: "var(--terra)" }}>
                  {overviewData?.incidents?.pending || incidentList.filter((i) => i.status === "pending").length}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                  Unresolved reports requiring review
                </div>
              </div>

              <div className="surface border rounded-2xl p-5" style={{ borderColor: "var(--border-dim)" }}>
                <div className="flex items-center justify-between text-xs font-mono uppercase mb-2" style={{ color: "var(--text-mute)" }}>
                  <span>Telemetry Feed</span>
                  <BarChart3 size={14} className="text-emerald-400" />
                </div>
                <div className="font-mono text-base font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  PostHog Active
                </div>
                <div className="text-xs mt-2" style={{ color: "var(--text-dim)" }}>
                  Capturing events, session replays & drop-offs
                </div>
              </div>
            </div>

            {/* Strategic Analytics Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Star Rating Distribution */}
              <div className="surface border rounded-2xl p-6" style={{ borderColor: "var(--border-dim)" }}>
                <h3 className="font-serif text-base font-bold mb-1">
                  "You dey feel am?" Star Distribution
                </h3>
                <p className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>
                  Real-time sentiment breakdown across all scholar touchpoints
                </p>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = feedbackList.filter((f) => f.rating === stars).length;
                    const total = feedbackList.length || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs font-mono">
                        <div className="flex items-center gap-1 w-12 text-[var(--gold)]">
                          <span>{stars}</span>
                          <Star size={12} fill="currentColor" />
                        </div>
                        <div className="flex-1 h-3 rounded-full bg-[var(--bg-input)] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: stars >= 4 ? "var(--gold)" : "var(--terra)",
                            }}
                          />
                        </div>
                        <div className="w-16 text-right" style={{ color: "var(--text-mute)" }}>
                          {count} ({pct}%)
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs" style={{ borderColor: "var(--border-dim)" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[var(--gold)]" />
                    <span>Promoters (4-5★): "I’d give an extra star if..."</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[var(--terra)]" />
                    <span>Detractors (1-3★): "What could be better?"</span>
                  </div>
                </div>
              </div>

              {/* PostHog Strategic Deep-Dive Hub */}
              <div className="surface border rounded-2xl p-6 flex flex-col justify-between" style={{ borderColor: "var(--border-dim)" }}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-base font-bold">
                      PostHog Telemetry & Behavioral Analytics
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                      LIVE STREAM
                    </span>
                  </div>
                  <p className="text-xs mb-4" style={{ color: "var(--text-dim)" }}>
                    Deep behavioral funnels, microphone drop-offs, and room retention tracked via PostHog JS SDK.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl border flex items-center justify-between" style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}>
                      <div>
                        <div className="font-semibold">Event: feedback_submitted</div>
                        <div className="text-[10px] text-[var(--text-mute)]">Captures CSAT rating, prompt type, route path</div>
                      </div>
                      <span className="font-mono text-xs text-[var(--gold)]">Active</span>
                    </div>

                    <div className="p-3 rounded-xl border flex items-center justify-between" style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}>
                      <div>
                        <div className="font-semibold">Event: incident_reported</div>
                        <div className="text-[10px] text-[var(--text-mute)]">Safety tickets, reporter status, target IDs</div>
                      </div>
                      <span className="font-mono text-xs text-[var(--terra)]">Monitored</span>
                    </div>

                    <div className="p-3 rounded-xl border flex items-center justify-between" style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}>
                      <div>
                        <div className="font-semibold">Event: sprint_completed & audio_recorded</div>
                        <div className="text-[10px] text-[var(--text-mute)]">Feynman voice recordings & retry rates</div>
                      </div>
                      <span className="font-mono text-xs text-[var(--olive)]">Tracking</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex flex-wrap items-center gap-3" style={{ borderColor: "var(--border-dim)" }}>
                  <a
                    href="https://us.posthog.com/insights"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 px-3 rounded-xl border text-xs font-mono font-semibold transition-colors hover:bg-[var(--bg-input)]"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                  >
                    View Insights Funnel →
                  </a>
                  <a
                    href="https://us.posthog.com/replay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 px-3 rounded-xl border text-xs font-mono font-semibold transition-colors hover:bg-[var(--bg-input)]"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                  >
                    Session Replays →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: "YOU DEY FEEL AM?" RESPONSES ── */}
        {activeTab === "feedback" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl surface border" style={{ borderColor: "var(--border-dim)" }}>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFeedbackFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                    feedbackFilter === "all" ? "bg-[var(--gold)] text-[#1c1d17] font-bold" : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
                  }`}
                >
                  All ({feedbackList.length})
                </button>
                <button
                  onClick={() => setFeedbackFilter("promoters")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                    feedbackFilter === "promoters" ? "bg-[var(--gold)] text-[#1c1d17] font-bold" : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
                  }`}
                >
                  4-5★ Extra Star If ({feedbackList.filter((f) => f.rating >= 4).length})
                </button>
                <button
                  onClick={() => setFeedbackFilter("detractors")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                    feedbackFilter === "detractors" ? "bg-[var(--terra)] text-white font-bold" : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
                  }`}
                >
                  1-3★ What Could Be Better ({feedbackList.filter((f) => f.rating <= 3).length})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-mute)]" />
                <input
                  type="text"
                  placeholder="Filter feedback or users..."
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  className="w-full text-xs rounded-xl pl-8 pr-3 py-2 border focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
                  style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)", color: "var(--text)" }}
                />
              </div>
            </div>

            {/* Feedback Cards */}
            {filteredFeedback.length === 0 ? (
              <div className="surface border rounded-2xl p-12 text-center space-y-2" style={{ borderColor: "var(--border-dim)" }}>
                <p className="text-sm font-serif text-[var(--text-dim)]">No feedback found matching filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFeedback.map((fb) => {
                  const isDetractor = fb.rating <= 3;
                  return (
                    <motion.div
                      key={fb.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="surface border rounded-2xl p-5 space-y-3 flex flex-col justify-between"
                      style={{ borderColor: "var(--border-dim)" }}
                    >
                      <div>
                        {/* Header: Rating & Prompt Tag */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                className={s <= fb.rating ? "text-[var(--gold)] fill-current" : "text-[var(--border-dim)]"}
                              />
                            ))}
                            <span className="font-mono text-xs font-bold ml-1.5" style={{ color: isDetractor ? "var(--terra)" : "var(--gold)" }}>
                              {fb.rating}.0
                            </span>
                          </div>

                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold"
                            style={{
                              background: isDetractor ? "rgba(122, 28, 46, 0.15)" : "rgba(192, 156, 72, 0.15)",
                              color: isDetractor ? "var(--terra)" : "var(--gold)",
                            }}
                          >
                            {isDetractor ? "What could be better?" : "I’d give an extra star if..."}
                          </span>
                        </div>

                        {/* Content */}
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>
                          "{fb.message}"
                        </p>
                      </div>

                      {/* Footer Info */}
                      <div className="pt-3 border-t flex items-center justify-between text-[11px] font-mono" style={{ borderColor: "var(--border-dim)", color: "var(--text-mute)" }}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold" style={{ color: "var(--text)" }}>@{fb.username || "Scholar"}</span>
                          <span>·</span>
                          <span>{fb.path || "/"}</span>
                        </div>
                        <div>
                          {new Date(fb.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: SAFETY & INCIDENT DESK ── */}
        {activeTab === "safety" && (
          <div className="space-y-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2 p-3 rounded-2xl surface border overflow-x-auto" style={{ borderColor: "var(--border-dim)" }}>
              {(["all", "pending", "investigating", "resolved"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setIncidentFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-colors ${
                    incidentFilter === st
                      ? "bg-[var(--terra)] text-white font-bold"
                      : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
                  }`}
                >
                  {st} ({incidentList.filter((i) => st === "all" || i.status === st).length})
                </button>
              ))}
            </div>

            {/* Incidents Stream */}
            {filteredIncidents.length === 0 ? (
              <div className="surface border rounded-2xl p-12 text-center space-y-2" style={{ borderColor: "var(--border-dim)" }}>
                <CheckCircle2 size={32} className="mx-auto text-[var(--olive)]" />
                <p className="text-sm font-serif" style={{ color: "var(--text)" }}>Incident desk clear.</p>
                <p className="text-xs text-[var(--text-mute)]">No open reports matching this status filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIncidents.map((incident) => {
                  return (
                    <motion.div
                      key={incident.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="surface border rounded-2xl p-5 space-y-4"
                      style={{ borderColor: incident.status === "pending" ? "var(--terra)" : "var(--border-dim)" }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono uppercase font-bold px-2.5 py-0.5 rounded-md bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
                              {incident.category.replace("_", " ")}
                            </span>
                            <span
                              className="text-[10px] font-mono px-2 py-0.5 rounded capitalize font-bold"
                              style={{
                                background:
                                  incident.status === "pending"
                                    ? "rgba(122, 28, 46, 0.2)"
                                    : incident.status === "investigating"
                                    ? "rgba(192, 156, 72, 0.2)"
                                    : "rgba(68, 78, 44, 0.2)",
                                color:
                                  incident.status === "pending"
                                    ? "var(--terra)"
                                    : incident.status === "investigating"
                                    ? "var(--gold)"
                                    : "var(--olive)",
                              }}
                            >
                              {incident.status}
                            </span>
                          </div>
                          <div className="text-xs text-[var(--text-mute)] font-mono">
                            Reported on {new Date(incident.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {/* Quick Moderation Actions on Incident */}
                        <div className="flex items-center gap-2">
                          <select
                            value={incident.status}
                            onChange={(e) => handleUpdateIncidentStatus(incident.id, e.target.value as any)}
                            className="text-xs font-mono rounded-xl p-2 border bg-[var(--bg-input)] focus:outline-none"
                            style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                          >
                            <option value="pending">Status: Pending</option>
                            <option value="investigating">Status: Investigating</option>
                            <option value="resolved">Status: Resolved</option>
                          </select>

                          {incident.targetUser && (
                            <button
                              onClick={() => {
                                setSelectedUserToBan({
                                  id: incident.targetUser!,
                                  username: incident.targetUser!,
                                  isRegistered: false,
                                  avatar: "/avatars/avatar-scholar.svg",
                                  xp: 0,
                                  streakCurrent: 0,
                                  streakLongest: 0,
                                  isBanned: false,
                                  isDeactivated: false,
                                  createdAt: new Date().toISOString(),
                                });
                                setBanReasonInput(`Reported for ${incident.category} in incident #${incident.id}`);
                              }}
                              className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-[var(--terra)] text-white hover:brightness-110 transition-all flex items-center gap-1.5"
                            >
                              <Ban size={13} />
                              <span>Ban Target</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Incident Narrative */}
                      <div className="p-3.5 rounded-xl bg-[var(--bg-input)]/50 border text-xs leading-relaxed" style={{ borderColor: "var(--border-dim)" }}>
                        {incident.details}
                      </div>

                      {/* Reporter & Context Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                        <div>
                          <div className="text-[10px] text-[var(--text-mute)] uppercase">Reporter</div>
                          <div className="font-semibold mt-0.5">@{incident.reporterUsername || "Anonymous"}</div>
                          {incident.reporterEmail && (
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--gold)]">
                              <Mail size={12} />
                              <a href={`mailto:${incident.reporterEmail}?subject=Regarding your Fey safety report #${incident.id}`} className="underline">
                                {incident.reporterEmail}
                              </a>
                              <button
                                onClick={() => copyToClipboard(incident.reporterEmail!, incident.id)}
                                className="p-0.5 hover:text-white"
                                title="Copy email"
                              >
                                {copiedId === incident.id ? <Check size={11} /> : <Copy size={11} />}
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-[10px] text-[var(--text-mute)] uppercase">Reported Scholar</div>
                          <div className="font-semibold mt-0.5 text-[var(--terra)]">
                            {incident.targetUser ? `@${incident.targetUser}` : "Not specified"}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-[var(--text-mute)] uppercase">Room / Context</div>
                          <div className="font-semibold mt-0.5">
                            {incident.roomId || "Global Platform"}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: ACTIVE SCHOLARS & BAN ENGINE ── */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl surface border" style={{ borderColor: "var(--border-dim)" }}>
              <div className="flex flex-wrap items-center gap-1.5">
                {(["all", "registered", "guest", "active", "banned", "deactivated"] as const).map((uf) => (
                  <button
                    key={uf}
                    onClick={() => setUserFilter(uf as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-colors ${
                      userFilter === uf
                        ? "bg-[var(--gold)] text-[#1c1d17] font-bold"
                        : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
                    }`}
                  >
                    {uf === "registered" ? "Cloud Registered" : uf === "guest" ? "Guest / Local" : uf}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-mute)]" />
                <input
                  type="text"
                  placeholder="Search scholars..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full text-xs rounded-xl pl-8 pr-3 py-2 border focus:outline-none focus:ring-1 focus:ring-[var(--gold)]"
                  style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)", color: "var(--text)" }}
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="surface border rounded-2xl overflow-hidden" style={{ borderColor: "var(--border-dim)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b font-mono uppercase text-[10px]" style={{ borderColor: "var(--border-dim)", background: "var(--bg-input)", color: "var(--text-mute)" }}>
                    <tr>
                      <th className="py-3 px-4">Scholar</th>
                      <th className="py-3 px-4">Account Type</th>
                      <th className="py-3 px-4">XP & Streak</th>
                      <th className="py-3 px-4">Account Status</th>
                      <th className="py-3 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono" style={{ borderColor: "var(--border-dim)" }}>
                    {filteredUsers.map((u) => {
                      return (
                        <tr key={u.id} className="hover:bg-[var(--bg-input)]/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[var(--bg-card)] border flex items-center justify-center font-bold text-xs" style={{ borderColor: "var(--border-dim)" }}>
                                {u.username.slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold font-sans" style={{ color: "var(--text)" }}>{u.username}</div>
                                <div className="text-[10px] text-[var(--text-mute)] truncate max-w-[140px]">ID: {u.id.slice(0, 14)}...</div>
                              </div>
                            </div>
                          </td>

                          {/* Account Type & Registration Status */}
                          <td className="py-3 px-4">
                            {u.isRegistered || u.email ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#EBF3FE] text-[#1D4ED8] border border-[#BFDBFE]">
                                  <CheckCircle2 size={12} className="text-[#2563EB]" />
                                  <span>Registered</span>
                                </span>
                                <div className="text-[11px] font-medium text-[var(--text)] truncate max-w-[180px]">{u.email}</div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                                  <span>Guest / Local</span>
                                </span>
                                <div className="text-[10px] text-[var(--text-mute)] font-mono">Unregistered</div>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-semibold">{u.xp} XP</div>
                            <div className="text-[11px] text-[var(--text-dim)]">🔥 {u.streakCurrent}d streak (Max {u.streakLongest}d)</div>
                          </td>

                          <td className="py-3 px-4">
                            {u.isBanned ? (
                              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]">
                                Banned
                              </span>
                            ) : u.isDeactivated ? (
                              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                                Deactivated
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
                                Active
                              </span>
                            )}
                            {u.banReason && (
                              <div className="text-[10px] text-[#991B1B] font-semibold truncate max-w-xs mt-1" title={u.banReason}>
                                {u.banReason}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.isBanned || u.isDeactivated ? (
                                <button
                                  onClick={() => handleModerateUser(u.id, "activate")}
                                  className="px-2.5 py-1 rounded-lg border text-[11px] font-bold text-[var(--olive)] border-[var(--border-dim)] hover:bg-[var(--bg-input)] transition-colors flex items-center gap-1"
                                >
                                  <UserCheck size={12} />
                                  <span>Reinstate</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleModerateUser(u.id, "deactivate")}
                                    className="px-2.5 py-1 rounded-lg border text-[11px] text-[var(--text-dim)] border-[var(--border-dim)] hover:bg-[var(--bg-input)] transition-colors"
                                  >
                                    Deactivate
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUserToBan(u);
                                      setBanReasonInput("Violated scholarly conduct");
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[var(--terra)] text-white hover:brightness-110 transition-colors flex items-center gap-1"
                                  >
                                    <Ban size={12} />
                                    <span>Ban</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BAN CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {selectedUserToBan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedUserToBan(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md surface border rounded-2xl p-6 shadow-2xl z-10 space-y-4"
              style={{ borderColor: "var(--terra)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-950/40 text-[var(--terra)] flex items-center justify-center">
                  <Ban size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold" style={{ color: "var(--text)" }}>
                    Ban Scholar: @{selectedUserToBan.username}
                  </h3>
                  <p className="text-xs text-[var(--text-mute)]">
                    This user will immediately be locked out of rooms, sprints, and dispatches.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase font-bold text-[var(--text-mute)]">
                  Ban Reason (Displayed to user)
                </label>
                <textarea
                  rows={3}
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  placeholder="Specify violation, room ID, or incident..."
                  className="w-full text-xs rounded-xl p-3 resize-none border focus:outline-none focus:ring-1 focus:ring-[var(--terra)]"
                  style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)", color: "var(--text)" }}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserToBan(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-[var(--text-mute)] hover:bg-[var(--bg-input)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleModerateUser(selectedUserToBan.id, "ban", banReasonInput)}
                  className="px-5 py-2 rounded-xl text-xs font-mono font-bold bg-[var(--terra)] text-white hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  Confirm Permanent Ban
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
