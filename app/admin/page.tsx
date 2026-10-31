"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Star,
  Users,
  BarChart3,
  Search,
  CheckCircle2,
  ExternalLink,
  Ban,
  RefreshCw,
  Mail,
  Lock,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Sliders,
  Smartphone,
  Globe,
  Radio,
  RotateCcw,
  EyeOff,
  Gamepad2,
  Swords,
  Trophy,
  Flag,
} from "lucide-react";
import AnswerContestsAdminPanel from "@/components/trivia/AnswerContestsAdminPanel";
import AdminOverviewTab, { type OverviewApiPayload } from "@/components/admin/AdminOverviewTab";
import AdminScholarsTab from "@/components/admin/AdminScholarsTab";
import BanScholarDialog from "@/components/admin/BanScholarDialog";
import { useAppStore } from "@/store/useAppStore";
import { useFeatureStore } from "@/store/useFeatureStore";
import { FEATURE_DEFINITIONS, type FeatureFlags } from "@/lib/feature-flags";
import type { FeedbackItem, IncidentReportItem, AdminUserItem } from "@/lib/admin-data";
import type { AdminRange } from "@/lib/admin-engagement";

type AdminTab = "overview" | "feedback" | "safety" | "users" | "features" | "contests";

export default function AdminPage() {
  const currentProfile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const { features, setFeature, resetAllFeatures, fetchFeatures: fetchFeatureFlags } = useFeatureStore();
  const [featureUpdatingKey, setFeatureUpdatingKey] = useState<string | null>(null);
  const [featureToast, setFeatureToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Server-backed session auth
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  // Tabs & range
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [range, setRange] = useState<AdminRange>("all");
  const [pendingContests, setPendingContests] = useState(0);

  // Data states
  const [loading, setLoading] = useState(false);
  const [overviewData, setOverviewData] = useState<OverviewApiPayload | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [incidentList, setIncidentList] = useState<IncidentReportItem[]>([]);
  const [userList, setUserList] = useState<AdminUserItem[]>([]);

  // Filtering & search
  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "promoters" | "detractors">("all");
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [incidentFilter, setIncidentFilter] = useState<"all" | "pending" | "investigating" | "resolved">("all");

  // Ban Modal state
  const [selectedUserToBan, setSelectedUserToBan] = useState<AdminUserItem | null>(null);
  const [banReasonInput, setBanReasonInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Verify existing server session cookie on mount
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!cancelled) {
          setIsAuthenticated(Boolean(data?.authenticated));
        }
      })
      .catch(() => {
        if (!cancelled) setIsAuthenticated(false);
      })
      .finally(() => {
        if (!cancelled) setAuthChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [refreshTick, setRefreshTick] = useState(0);

  const fetchData = useCallback(() => {
    setLoading(true);
    setRefreshTick((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    Promise.all([
      fetch(`/api/admin/overview?range=${range}`, { cache: "no-store" }),
      fetch("/api/feedback", { cache: "no-store" }),
      fetch("/api/safety/report", { cache: "no-store" }),
      fetch("/api/admin/users", { cache: "no-store" }),
      fetchFeatureFlags(),
    ])
      .then(async ([overviewRes, feedbackRes, safetyRes, usersRes]) => {
        if (cancelled) return;
        if (overviewRes.status === 401) {
          setIsAuthenticated(false);
          return;
        }
        if (overviewRes.ok) {
          const o = await overviewRes.json();
          if (!cancelled && o.success) setOverviewData(o.data);
        }
        if (feedbackRes.ok) {
          const f = await feedbackRes.json();
          if (!cancelled && f.success) setFeedbackList(f.items);
        }
        if (safetyRes.ok) {
          const s = await safetyRes.json();
          if (!cancelled && s.success) setIncidentList(s.incidents);
        }
        if (usersRes.ok) {
          const u = await usersRes.json();
          if (!cancelled && u.success) setUserList(u.users);
        }
      })
      .catch((err) => {
        console.error("Admin fetch error:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, range, refreshTick, fetchFeatureFlags]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim() || authSubmitting) return;
    setAuthSubmitting(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
        setPasscode("");
      } else {
        setAuthError(data.error || "Invalid administrative passcode.");
      }
    } catch {
      setAuthError("Unable to reach authentication service.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    setIsAuthenticated(false);
  };

  const handleToggleFeature = async (key: keyof FeatureFlags, currentValue: boolean) => {
    setFeatureUpdatingKey(key);
    const nextVal = !currentValue;
    const ok = await setFeature(key, nextVal);
    setFeatureUpdatingKey(null);

    if (ok) {
      const def = FEATURE_DEFINITIONS.find((f) => f.key === key);
      const label = def?.name || key;
      setFeatureToast({
        message: `${label} is now ${nextVal ? "ACTIVE (visible on platform)" : "DISABLED (hidden from users)"}.`,
        type: "success",
      });
      setTimeout(() => setFeatureToast(null), 4000);
    }
  };

  const handleResetFeatures = async () => {
    if (!confirm("Reset all platform feature flags to system defaults?")) return;
    setFeatureUpdatingKey("reset");
    const ok = await resetAllFeatures();
    setFeatureUpdatingKey(null);
    if (ok) {
      setFeatureToast({
        message: "All feature flags reset to system defaults.",
        type: "info",
      });
      setTimeout(() => setFeatureToast(null), 4000);
    }
  };

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

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-base)]">
        <div className="text-xs font-mono text-[var(--text-mute)]">Checking session...</div>
      </div>
    );
  }

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
            style={{ background: "rgba(68, 78, 44, 0.15)", color: "var(--olive)" }}
          >
            <Lock size={26} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold" style={{ color: "var(--text)" }}>
              Fey Admin
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
              Sign in with your administrative passcode to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter admin passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full text-center text-sm font-mono tracking-widest rounded-xl p-3 border focus:outline-none focus:ring-1 focus:ring-[var(--olive)]"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border-dim)",
                  color: "var(--text)",
                }}
                autoFocus
              />
              {authError && (
                <p className="text-[11px] font-mono mt-1.5" style={{ color: "var(--red)" }}>
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer text-white disabled:opacity-60"
              style={{ background: "var(--terra)" }}
            >
              {authSubmitting ? "Verifying..." : "Unlock Console"}
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

  const pendingIncidentsCount = incidentList.filter((i) => i.status === "pending").length;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text)] pb-16">
      {/* ── Top Header Bar ── */}
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
              <span className="font-serif text-lg font-bold">Fey Admin</span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider"
                style={{ background: "rgba(68, 78, 44, 0.16)", color: "var(--olive)" }}
              >
                Lokin Labs
              </span>
            </div>
            <p className="text-[11px]" style={{ color: "var(--text-mute)" }}>
              Platform Overview, Games & Community
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={overviewData?.posthog?.dashboardUrl || "https://us.posthog.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors hover:bg-[var(--bg-input)]"
            style={{ borderColor: "var(--border-dim)", color: "var(--olive)" }}
          >
            <BarChart3 size={14} />
            <span>PostHog</span>
            <ExternalLink size={12} />
          </a>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl border hover:bg-[var(--bg-input)] transition-colors text-[var(--text-dim)] cursor-pointer"
            style={{ borderColor: "var(--border-dim)" }}
            title="Refresh records"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl border text-xs font-mono hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
            style={{ borderColor: "var(--border-dim)", color: "var(--terra)" }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main Layout Container ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* Navigation Tabs */}
        <div
          className="flex items-center gap-2 border-b pb-3 mb-6 overflow-x-auto"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "bg-[var(--bg-card)] shadow-sm font-bold border"
                : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
            }`}
            style={activeTab === "overview" ? { borderColor: "var(--border-dim)", color: "var(--olive)" } : {}}
          >
            <BarChart3 size={15} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === "feedback"
                ? "bg-[var(--bg-card)] shadow-sm font-bold border"
                : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
            }`}
            style={activeTab === "feedback" ? { borderColor: "var(--border-dim)", color: "var(--olive)" } : {}}
          >
            <Sparkles size={15} />
            <span>Feedback</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--bg-input)] font-bold">
              {feedbackList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("safety")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === "safety"
                ? "bg-[var(--bg-card)] shadow-sm font-bold border"
                : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
            }`}
            style={activeTab === "safety" ? { borderColor: "var(--border-dim)", color: "var(--olive)" } : {}}
          >
            <ShieldAlert size={15} />
            <span>Safety Reports</span>
            {pendingIncidentsCount > 0 && (
              <span
                className="px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white"
                style={{ background: "var(--red)" }}
              >
                {pendingIncidentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === "users"
                ? "bg-[var(--bg-card)] shadow-sm font-bold border"
                : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
            }`}
            style={activeTab === "users" ? { borderColor: "var(--border-dim)", color: "var(--olive)" } : {}}
          >
            <Users size={15} />
            <span>Scholars</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--bg-input)] font-bold">
              {overviewData?.users?.total ?? userList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("features")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === "features"
                ? "bg-[var(--bg-card)] shadow-sm font-bold border"
                : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
            }`}
            style={activeTab === "features" ? { borderColor: "var(--border-dim)", color: "var(--olive)" } : {}}
          >
            <Sliders size={15} />
            <span>Feature Controls</span>
            <span
              className="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
              style={
                features?.enablePassThePhone === false
                  ? { background: "rgba(166, 124, 30, 0.2)", color: "var(--gold)" }
                  : { background: "var(--bg-input)", color: "var(--text-dim)" }
              }
            >
              {features?.enablePassThePhone === false ? "Local: OFF" : "Live"}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("contests")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer ${
              activeTab === "contests"
                ? "bg-[var(--bg-card)] shadow-sm font-bold border"
                : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
            }`}
            style={activeTab === "contests" ? { borderColor: "var(--border-dim)", color: "var(--olive)" } : {}}
          >
            <Flag size={15} />
            <span>Answer Contests</span>
            {pendingContests > 0 && (
              <span
                className="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(166, 124, 30, 0.2)", color: "var(--gold)" }}
              >
                {pendingContests}
              </span>
            )}
          </button>
        </div>

        {/* Toast Banner for Feature Updates */}
        <AnimatePresence>
          {featureToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3.5 rounded-2xl border text-xs font-mono flex items-center justify-between shadow-sm bg-[var(--bg-card)]"
              style={{
                borderColor: "var(--olive)",
                color: "var(--text)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--olive)" }} />
                <span>{featureToast.message}</span>
              </div>
              <button
                onClick={() => setFeatureToast(null)}
                className="text-[10px] uppercase font-bold text-[var(--text-mute)] hover:text-[var(--text)] ml-4"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TAB: ANSWER CONTESTS ── */}
        {activeTab === "contests" && (
          <AnswerContestsAdminPanel onPendingCount={setPendingContests} />
        )}

        {/* ── TAB 1: OVERVIEW (KPIs + Articulate Milestone + Games + Top Scholars + Feedback) ── */}
        {activeTab === "overview" && (
          <AdminOverviewTab
            overviewData={overviewData}
            feedbackList={feedbackList}
            incidentList={incidentList}
            userList={userList}
            range={range}
            onRangeChange={setRange}
            onOpenTab={(t) => setActiveTab(t)}
          />
        )}

        {/* ── TAB 2: FEEDBACK ── */}
        {activeTab === "feedback" && (
          <div className="space-y-4">
            <div
              className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl surface border"
              style={{ borderColor: "var(--border-dim)" }}
            >
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFeedbackFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                    feedbackFilter === "all"
                      ? "text-white font-bold"
                      : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
                  }`}
                  style={feedbackFilter === "all" ? { background: "var(--olive)" } : {}}
                >
                  All ({feedbackList.length})
                </button>
                <button
                  onClick={() => setFeedbackFilter("promoters")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                    feedbackFilter === "promoters"
                      ? "text-white font-bold"
                      : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
                  }`}
                  style={feedbackFilter === "promoters" ? { background: "var(--olive)" } : {}}
                >
                  4–5★ Happy ({feedbackList.filter((f) => f.rating >= 4).length})
                </button>
                <button
                  onClick={() => setFeedbackFilter("detractors")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                    feedbackFilter === "detractors"
                      ? "text-white font-bold"
                      : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
                  }`}
                  style={feedbackFilter === "detractors" ? { background: "var(--terra)" } : {}}
                >
                  1–3★ Unhappy ({feedbackList.filter((f) => f.rating <= 3).length})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-mute)]" />
                <input
                  type="text"
                  placeholder="Filter feedback or users..."
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  className="w-full text-xs rounded-xl pl-8 pr-3 py-2 border focus:outline-none"
                  style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)", color: "var(--text)" }}
                />
              </div>
            </div>

            {filteredFeedback.length === 0 ? (
              <div
                className="surface border rounded-2xl p-12 text-center space-y-2"
                style={{ borderColor: "var(--border-dim)" }}
              >
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
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                className={
                                  s <= fb.rating
                                    ? "text-[var(--olive)] fill-current"
                                    : "text-[var(--border-dim)]"
                                }
                              />
                            ))}
                            <span
                              className="font-mono text-xs font-bold ml-1.5"
                              style={{ color: isDetractor ? "var(--terra)" : "var(--olive)" }}
                            >
                              {fb.rating}.0
                            </span>
                          </div>

                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold"
                            style={{
                              background: isDetractor
                                ? "rgba(122, 28, 46, 0.15)"
                                : "rgba(68, 78, 44, 0.15)",
                              color: isDetractor ? "var(--terra)" : "var(--olive)",
                            }}
                          >
                            {isDetractor ? "What could be better?" : "Extra star if..."}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>
                          &ldquo;{fb.message}&rdquo;
                        </p>
                      </div>

                      <div
                        className="pt-3 border-t flex items-center justify-between text-[11px] font-mono"
                        style={{ borderColor: "var(--border-dim)", color: "var(--text-mute)" }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold" style={{ color: "var(--text)" }}>
                            @{fb.username || "Scholar"}
                          </span>
                          <span>·</span>
                          <span>{fb.path || "/"}</span>
                        </div>
                        <div>
                          {new Date(fb.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: SAFETY REPORTS ── */}
        {activeTab === "safety" && (
          <div className="space-y-4">
            <div
              className="flex items-center gap-2 p-3 rounded-2xl surface border overflow-x-auto"
              style={{ borderColor: "var(--border-dim)" }}
            >
              {(["all", "pending", "investigating", "resolved"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setIncidentFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-colors cursor-pointer ${
                    incidentFilter === st
                      ? "text-white font-bold"
                      : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
                  }`}
                  style={incidentFilter === st ? { background: "var(--olive)" } : {}}
                >
                  {st} ({incidentList.filter((i) => st === "all" || i.status === st).length})
                </button>
              ))}
            </div>

            {filteredIncidents.length === 0 ? (
              <div
                className="surface border rounded-2xl p-12 text-center space-y-2"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <CheckCircle2 size={32} className="mx-auto text-[var(--olive)]" />
                <p className="text-sm font-serif" style={{ color: "var(--text)" }}>
                  No safety reports in this view.
                </p>
                <p className="text-xs text-[var(--text-mute)]">
                  All community rooms and leaderboards are clear.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIncidents.map((incident) => (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="surface border rounded-2xl p-5 space-y-4"
                    style={{
                      borderColor:
                        incident.status === "pending" ? "var(--red)" : "var(--border-dim)",
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-mono uppercase font-bold px-2.5 py-0.5 rounded-md"
                            style={{
                              background: "rgba(181, 58, 58, 0.16)",
                              color: "var(--red)",
                            }}
                          >
                            {incident.category.replace("_", " ")}
                          </span>
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded capitalize font-bold"
                            style={{
                              background:
                                incident.status === "pending"
                                  ? "rgba(181, 58, 58, 0.2)"
                                  : incident.status === "investigating"
                                  ? "rgba(166, 124, 30, 0.2)"
                                  : "rgba(68, 78, 44, 0.2)",
                              color:
                                incident.status === "pending"
                                  ? "var(--red)"
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

                      <div className="flex items-center gap-2">
                        <select
                          value={incident.status}
                          onChange={(e) =>
                            handleUpdateIncidentStatus(
                              incident.id,
                              e.target.value as IncidentReportItem["status"]
                            )
                          }
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
                              setBanReasonInput(
                                `Reported for ${incident.category} in report #${incident.id}`
                              );
                            }}
                            className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-[var(--terra)] text-white hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Ban size={13} />
                            <span>Ban Target</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      className="p-3.5 rounded-xl bg-[var(--bg-input)]/50 border text-xs leading-relaxed"
                      style={{ borderColor: "var(--border-dim)" }}
                    >
                      {incident.details}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                      <div>
                        <div className="text-[10px] text-[var(--text-mute)] uppercase">Reporter</div>
                        <div className="font-semibold mt-0.5">
                          @{incident.reporterUsername || "Anonymous"}
                        </div>
                        {incident.reporterEmail && (
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--olive)]">
                            <Mail size={12} />
                            <a
                              href={`mailto:${incident.reporterEmail}?subject=Regarding your Fey safety report #${incident.id}`}
                              className="underline"
                            >
                              {incident.reporterEmail}
                            </a>
                            <button
                              onClick={() =>
                                copyToClipboard(incident.reporterEmail!, incident.id)
                              }
                              className="p-0.5 hover:opacity-80"
                              title="Copy email"
                            >
                              {copiedId === incident.id ? <Check size={11} /> : <Copy size={11} />}
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="text-[10px] text-[var(--text-mute)] uppercase">
                          Reported Scholar
                        </div>
                        <div className="font-semibold mt-0.5 text-[var(--terra)]">
                          {incident.targetUser ? `@${incident.targetUser}` : "Not specified"}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-[var(--text-mute)] uppercase">
                          Room / Context
                        </div>
                        <div className="font-semibold mt-0.5">
                          {incident.roomId || "Platform"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: SCHOLARS & MODERATION ── */}
        {activeTab === "users" && (
          <AdminScholarsTab
            users={userList}
            topScholars={overviewData?.engagement?.topScholars || []}
            onModerate={handleModerateUser}
            onRequestBan={(u) => {
              setSelectedUserToBan(u);
              setBanReasonInput("Violated scholarly conduct");
            }}
          />
        )}

        {/* ── TAB 5: FEATURE CONTROLS ── */}
        {activeTab === "features" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                className="surface border rounded-2xl p-5"
                style={{
                  borderColor:
                    features?.enablePassThePhone === false ? "var(--terra)" : "var(--border-dim)",
                }}
              >
                <div
                  className="flex items-center justify-between text-xs font-mono uppercase mb-2"
                  style={{ color: "var(--text-mute)" }}
                >
                  <span>Pass-the-Phone (Local Articulate)</span>
                  <Smartphone
                    size={14}
                    className={
                      features?.enablePassThePhone ? "text-[var(--olive)]" : "text-[var(--terra)]"
                    }
                  />
                </div>
                <div
                  className="font-mono text-2xl font-bold flex items-center gap-2"
                  style={{
                    color: features?.enablePassThePhone ? "var(--olive)" : "var(--terra)",
                  }}
                >
                  {features?.enablePassThePhone ? "ACTIVE" : "HIDDEN"}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                  {features?.enablePassThePhone
                    ? "Visible on /play alongside Online Room"
                    : "Hidden on /play (Online Rooms only)"}
                </div>
              </div>

              <div className="surface border rounded-2xl p-5" style={{ borderColor: "var(--border-dim)" }}>
                <div
                  className="flex items-center justify-between text-xs font-mono uppercase mb-2"
                  style={{ color: "var(--text-mute)" }}
                >
                  <span>Active Modules</span>
                  <Sliders size={14} className="text-[var(--olive)]" />
                </div>
                <div className="font-mono text-2xl font-bold" style={{ color: "var(--olive)" }}>
                  {Object.values(features || {}).filter(Boolean).length} / {FEATURE_DEFINITIONS.length}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                  {FEATURE_DEFINITIONS.length - Object.values(features || {}).filter(Boolean).length}{" "}
                  module(s) currently hidden
                </div>
              </div>

              <div
                className="surface border rounded-2xl p-5 flex flex-col justify-between"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <div>
                  <div
                    className="flex items-center justify-between text-xs font-mono uppercase mb-2"
                    style={{ color: "var(--text-mute)" }}
                  >
                    <span>Client Sync</span>
                    <RefreshCw size={14} className="text-[var(--olive)]" />
                  </div>
                  <div className="font-mono text-sm font-bold text-[var(--olive)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--olive)]" />
                    Multi-tab Broadcast Live
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                    Toggles take effect immediately without redeployment.
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={handleResetFeatures}
                    disabled={featureUpdatingKey === "reset"}
                    className="px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 hover:bg-[var(--bg-input)] transition-colors text-[var(--text-dim)] cursor-pointer"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <RotateCcw
                      size={12}
                      className={featureUpdatingKey === "reset" ? "animate-spin" : ""}
                    />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="surface border rounded-2xl overflow-hidden shadow-sm" style={{ borderColor: "var(--border-dim)" }}>
              <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border-dim)" }}>
                <div>
                  <h3 className="font-serif text-base font-bold" style={{ color: "var(--text)" }}>
                    Platform Feature Switches
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-mute)" }}>
                    Control game availability, local modes, and module visibility.
                  </p>
                </div>
                <Link
                  href="/play"
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-[var(--bg-input)]"
                  style={{ borderColor: "var(--border-dim)", color: "var(--olive)" }}
                >
                  <span>Open /play</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <div className="divide-y" style={{ borderColor: "var(--border-dim)" }}>
                {FEATURE_DEFINITIONS.map((def) => {
                  const isEnabled = features?.[def.key] ?? true;
                  const isUpdating = featureUpdatingKey === def.key;

                  return (
                    <div
                      key={def.key}
                      className="p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border"
                          style={{
                            background: isEnabled
                              ? "rgba(68, 78, 44, 0.12)"
                              : "rgba(122, 28, 46, 0.1)",
                            borderColor: isEnabled ? "var(--olive)" : "var(--terra)",
                            color: isEnabled ? "var(--olive)" : "var(--terra)",
                          }}
                        >
                          {def.iconName === "smartphone" && <Smartphone size={22} />}
                          {def.iconName === "globe" && <Globe size={22} />}
                          {def.iconName === "presentation" && <Sparkles size={22} />}
                          {def.iconName === "help-circle" && <Gamepad2 size={22} />}
                          {def.iconName === "radio" && <Radio size={22} />}
                          {def.iconName === "swords" && <Swords size={22} />}
                          {def.iconName === "trophy" && <Trophy size={22} />}
                          {def.iconName === "bar-chart" && <BarChart3 size={22} />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-serif font-bold text-base text-[var(--text)]">
                              {def.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-input)] text-[var(--text-mute)]">
                              {def.route}
                            </span>
                          </div>

                          <p className="text-xs text-[var(--text-dim)] max-w-2xl leading-relaxed">
                            {def.description}
                          </p>
                          <p
                            className="text-[11px] font-mono mt-0.5"
                            style={{ color: isEnabled ? "var(--olive)" : "var(--terra)" }}
                          >
                            {isEnabled
                              ? `● ${def.userImpact}`
                              : "○ Disabled: hidden from end users."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                        <span
                          className="text-xs font-mono font-bold px-2.5 py-1 rounded-full border"
                          style={
                            isEnabled
                              ? {
                                  background: "rgba(68, 78, 44, 0.12)",
                                  color: "var(--olive)",
                                  borderColor: "rgba(68, 78, 44, 0.3)",
                                }
                              : {
                                  background: "rgba(181, 58, 58, 0.12)",
                                  color: "var(--red)",
                                  borderColor: "rgba(181, 58, 58, 0.3)",
                                }
                          }
                        >
                          {isEnabled ? "ACTIVE" : "HIDDEN"}
                        </span>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleFeature(def.key, isEnabled)}
                          className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isEnabled ? "bg-[var(--olive)]" : "bg-neutral-600"
                          } ${isUpdating ? "opacity-60 cursor-wait" : ""}`}
                          aria-label={`Toggle ${def.name}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                              isEnabled ? "translate-x-6" : "translate-x-0"
                            }`}
                          >
                            {isUpdating ? (
                              <RefreshCw size={12} className="animate-spin text-neutral-600" />
                            ) : isEnabled ? (
                              <Check size={12} className="text-[var(--olive)] font-bold" />
                            ) : (
                              <EyeOff size={12} className="text-neutral-500" />
                            )}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Ban Confirmation Modal (<dialog closedby="any">) ── */}
      <BanScholarDialog
        user={selectedUserToBan}
        reason={banReasonInput}
        onReasonChange={setBanReasonInput}
        onCancel={() => setSelectedUserToBan(null)}
        onConfirm={(uid, reason) => handleModerateUser(uid, "ban", reason)}
      />
    </div>
  );
}
