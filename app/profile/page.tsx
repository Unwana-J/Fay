"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pencil,
  Check,
  Star,
  Flame,
  Zap,
  BookOpen,
  Trophy,
  RotateCcw,
  AlertTriangle,
  ShieldCheck,
  Cloud,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  Lock,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { ACHIEVEMENTS, getLevelForXP, getNextLevel, getLevelProgress } from "@/lib/achievements";
import { CATEGORY_ICONS, CATEGORIES } from "@/lib/topics";
import { cn } from "@/lib/utils";
import { AVATARS } from "@/lib/avatars";
import UserAvatar from "@/components/ui/UserAvatar";

/* ─── Framer Motion Stagger Variants ──────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18,
    },
  },
};

export default function ProfilePage() {
  const {
    profile,
    streak,
    sessions,
    settings,
    authEmail,
    authUserId,
    isCloudSynced,
    lastCloudSyncAt,
    registerWithCloud,
    loginWithCloud,
    logoutFromCloud,
    syncToCloud,
    updateProfile,
    updateSettings,
    resetUserData,
  } = useAppStore();

  const [editing, setEditing] = useState(false);
  const [draftUsername, setDraftUsername] = useState(profile.username);
  const [draftBio, setDraftBio] = useState(profile.bio);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [authEmailInput, setAuthEmailInput] = useState("");
  const [authPasswordInput, setAuthPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const level = getLevelForXP(profile.xp);
  const nextLevel = getNextLevel(profile.xp);
  const progress = getLevelProgress(profile.xp);
  const totalResearchMin = sessions.reduce((a, s) => a + s.researchMinutes, 0);
  const uniqueCats = [...new Set(sessions.map((s) => s.category))];
  const avgConf = sessions.length
    ? (sessions.reduce((a, s) => a + s.ratings.confidence, 0) / sessions.length).toFixed(1)
    : "—";

  function saveProfile() {
    updateProfile({ username: draftUsername.trim() || "Learner", bio: draftBio.trim() });
    setEditing(false);
  }

  async function handleManualSync() {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      await syncToCloud();
      setSyncFeedback("Synced successfully!");
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch {
      setSyncFeedback("Sync failed. Check connection.");
      setTimeout(() => setSyncFeedback(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authEmailInput.trim() || !authEmailInput.includes("@")) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    if (!authPasswordInput || authPasswordInput.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthError("");
    setIsAuthLoading(true);

    try {
      if (authMode === "register") {
        const res = await registerWithCloud(authEmailInput.trim(), authPasswordInput);
        if (!res.success) {
          setAuthError(res.error || "Failed to create cloud account.");
          setIsAuthLoading(false);
          return;
        }
      } else {
        const res = await loginWithCloud(authEmailInput.trim(), authPasswordInput);
        if (!res.success) {
          setAuthError(res.error || "Invalid email or password.");
          setIsAuthLoading(false);
          return;
        }
      }

      setIsAuthLoading(false);
      setShowAuthModal(false);
      setAuthPasswordInput("");
    } catch (err: any) {
      setIsAuthLoading(false);
      setAuthError(err.message || "An unexpected error occurred.");
    }
  }

  const userEmail = authEmail || profile.email;
  const isUserAuthenticated = Boolean(authUserId || (authEmail && isCloudSynced));

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto"
    >
      <motion.div variants={cardVariants} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space text-3xl font-bold mb-1 text-display" style={{ color: "var(--text)" }}>Profile</h1>
          <p style={{ color: "var(--text-dim)" }}>Your scholarly identity, cloud backup status, and achievements.</p>
        </div>

        {/* Cloud Status Pill */}
        <div className="flex items-center gap-2">
          {isUserAuthenticated ? (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold"
              style={{
                backgroundColor: "rgba(92, 106, 54, 0.12)",
                borderColor: "var(--olive)",
                color: "var(--olive-text)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[var(--olive)] animate-pulse" />
              <span>Cloud Synced</span>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode("register");
                setShowAuthModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold hover:bg-[var(--bg-input)] transition-all"
              style={{
                borderColor: "var(--terra)",
                color: "var(--terra)",
              }}
            >
              <Cloud size={13} />
              <span>Enable Cloud Backup</span>
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Profile Card */}
          <motion.div variants={cardVariants} className="rounded-2xl p-6 surface">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 mb-5">
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="relative group hover:scale-105 transition-transform"
                title="Change Avatar"
              >
                <UserAvatar avatar={profile.avatar} size="2xl" className="shadow-md" />
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border shadow"
                  style={{ backgroundColor: "var(--olive)", borderColor: "var(--bg-base)" }}
                >
                  <Pencil size={10} className="text-white" />
                </div>
              </button>

              {showAvatarPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="grid grid-cols-4 gap-2 p-3 rounded-2xl border bg-[var(--bg-card)] shadow-xl max-h-60 overflow-y-auto w-full"
                  style={{ borderColor: "var(--border)" }}
                >
                  {AVATARS.map((a) => {
                    const isSelected = profile.avatar === a.path;
                    return (
                      <button
                        key={a.id}
                        onClick={() => {
                          updateProfile({ avatar: a.path });
                          setShowAvatarPicker(false);
                        }}
                        title={`${a.title} (${a.role})`}
                        className="p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all hover:bg-[var(--bg-input)]"
                        style={{
                          borderColor: isSelected ? "var(--olive)" : "transparent",
                          background: isSelected ? "var(--bg-input)" : "transparent",
                        }}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img src={a.path} alt={a.title} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[9px] font-semibold truncate max-w-[55px]" style={{ color: "var(--text-dim)" }}>
                          {a.title.replace("The ", "")}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Name & bio */}
            {editing ? (
              <div className="space-y-2.5">
                <input
                  value={draftUsername}
                  onChange={(e) => setDraftUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none surface-input"
                  style={{ color: "var(--text)" }}
                  placeholder="Username"
                />
                <textarea
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-xs resize-none focus:outline-none surface-input"
                  style={{ color: "var(--text-dim)" }}
                  placeholder="Short bio…"
                />
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex-1 btn-ghost py-2">Cancel</button>
                  <button onClick={saveProfile} className="flex-1 btn-terra py-2 text-xs">
                    <Check size={11} className="mr-1" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="font-bold text-lg" style={{ color: "var(--text)" }}>{profile.username}</span>
                  <button onClick={() => setEditing(true)} className="text-[var(--text-mute)] hover:text-[var(--text)] transition-colors">
                    <Pencil size={11} />
                  </button>
                </div>
                <p style={{ color: "var(--text-dim)" }} className="text-xs leading-relaxed">{profile.bio || "No bio set yet."}</p>
                {userEmail && (
                  <p className="text-[11px] font-mono text-[var(--text-mute)] mt-1">{userEmail}</p>
                )}
              </div>
            )}

            {/* Level */}
            <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border-dim)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Zap size={11} style={{ color: "var(--gold)" }} />
                  <span style={{ color: "var(--text)" }}>Level {level.level}</span>
                </div>
                <span className="text-xs font-mono font-semibold" style={{ color: "var(--gold)" }}>{level.title}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--olive-dim)" }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
                  className="h-full rounded-full"
                  style={{ background: "var(--gold)" }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1.5" style={{ color: "var(--text-mute)" }}>
                <span className="font-mono">{profile.xp} XP</span>
                {nextLevel && <span className="font-mono">→ {nextLevel.minXP} XP</span>}
              </div>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div variants={cardVariants} className="rounded-2xl p-5 grid grid-cols-2 gap-3 surface">
            {[
              { icon: <Flame size={13} style={{ color: "var(--terra)" }} />, value: streak.current, label: "streak" },
              { icon: <Trophy size={13} style={{ color: "var(--gold)" }} />, value: sessions.length, label: "sessions" },
              { icon: <BookOpen size={13} style={{ color: "var(--olive)" }} />, value: `${Math.round(totalResearchMin / 60)}h`, label: "research" },
              { icon: <Star size={13} style={{ color: "var(--gold)" }} />, value: avgConf, label: "avg score" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "var(--bg-input)" }}>
                <div className="flex items-center justify-center mb-1">{s.icon}</div>
                <div className="font-mono font-semibold text-lg" style={{ color: "var(--text)" }}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "var(--text-mute)" }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Cloud Account & Multi-Device Sync Card */}
          <motion.div variants={cardVariants} className="rounded-2xl p-5 surface border" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[var(--olive)]" />
                <h3 className="text-heading text-sm font-semibold" style={{ color: "var(--text)" }}>Cloud Backup & Sync</h3>
              </div>
              {isUserAuthenticated && (
                <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--olive-text)]">
                  Active
                </span>
              )}
            </div>

            {isUserAuthenticated ? (
              <div className="space-y-3">
                <div className="text-xs space-y-1.5 p-3 rounded-xl bg-[var(--bg-input)] border" style={{ borderColor: "var(--border-dim)" }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: "var(--text-mute)" }}>Account</span>
                    <span className="font-medium text-[var(--text)] truncate max-w-[160px]">{userEmail}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: "var(--text-mute)" }}>Devices</span>
                    <span className="text-[var(--olive-text)] flex items-center gap-1 font-semibold text-[11px]">
                      <Smartphone size={12} /> <Laptop size={12} /> Multi-Device
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ color: "var(--text-mute)" }}>Last Synced</span>
                    <span className="font-mono text-[11px]" style={{ color: "var(--text-dim)" }}>
                      {lastCloudSyncAt ? new Date(lastCloudSyncAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently"}
                    </span>
                  </div>
                </div>

                {syncFeedback && (
                  <p className="text-xs font-semibold text-center text-[var(--olive-text)] animate-fade-in">
                    {syncFeedback}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--bg-input)] transition-all"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                  >
                    <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </button>
                  <button
                    type="button"
                    onClick={logoutFromCloud}
                    className="py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[var(--bg-input)] transition-all"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                    title="Sign Out"
                  >
                    <LogOut size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  Your notes, vocal recordings, and <strong>{streak.current}-day streak</strong> are currently saved only in this browser cache.
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setShowAuthModal(true);
                    }}
                    className="w-full btn-terra py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={14} /> Create Cloud Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setShowAuthModal(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--bg-input)] transition-colors"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                  >
                    Sign In to Existing Account
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Favorite categories */}
          <motion.div variants={cardVariants} className="rounded-2xl p-5 surface">
            <div className="text-label mb-3">Favorite categories</div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isFav = settings.favoriteCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      const favs = settings.favoriteCategories;
                      updateSettings({ favoriteCategories: isFav ? favs.filter((c) => c !== cat) : [...favs, cat] });
                    }}
                    className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] uppercase font-semibold transition-all border",
                      isFav
                        ? "border-[var(--olive)] bg-[var(--bg-input)] text-[var(--olive-text)]"
                        : "border-transparent text-[var(--text-mute)] hover:text-[var(--text-dim)]"
                    )}
                  >
                    {CATEGORY_ICONS[cat]}
                    <span>{cat.split(" ")[0]}</span>
                    {isFav && <Star size={8} className="fill-[#A67C1E] text-[#A67C1E]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Reset Beta Data Controls */}
          <motion.div variants={cardVariants} className="rounded-2xl p-5 surface border" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw size={15} className="text-[var(--text-mute)]" />
              <h3 className="text-heading text-sm font-semibold" style={{ color: "var(--text)" }}>Local Storage Controls</h3>
            </div>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[var(--bg-input)]"
                style={{ borderColor: "var(--border-dim)", color: "var(--terra)" }}
              >
                Reset Local Cache & Re-onboard
              </button>
            ) : (
              <div className="p-3 rounded-xl border space-y-3" style={{ background: "rgba(122, 28, 46, 0.06)", borderColor: "rgba(122, 28, 46, 0.25)" }}>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={15} className="text-[var(--terra)] shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-tight" style={{ color: "var(--text)" }}>
                    This will clear local sessions, streaks, and cache on this device.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-1.5 rounded-lg border text-xs font-medium"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetConfirm(false);
                      resetUserData();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-[var(--terra)] text-white text-xs font-semibold"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Achievements */}
          <motion.div variants={cardVariants} className="rounded-2xl p-5 surface">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading" style={{ fontSize: "0.95rem" }}>Achievements</h3>
              <span className="text-label">{profile.unlockedAchievements.length}/{ACHIEVEMENTS.length} unlocked</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = profile.unlockedAchievements.includes(ach.id);
                return (
                  <motion.div
                    key={ach.id}
                    className="rounded-xl p-3 border transition-all"
                    style={{
                      backgroundColor: unlocked ? "rgba(92, 106, 54, 0.05)" : "var(--bg-input)",
                      borderColor: unlocked ? "rgba(92, 106, 54, 0.15)" : "transparent",
                      opacity: unlocked ? 1 : 0.35,
                      filter: unlocked ? "none" : "grayscale(1)",
                    }}
                  >
                    <div className="text-2xl mb-2">{ach.icon}</div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--text)" }}>{ach.title}</div>
                    <div className="text-[10px] leading-tight" style={{ color: "var(--text-dim)" }}>{ach.description}</div>
                    {unlocked && (
                      <div className="mt-2 text-[10px] font-mono font-semibold" style={{ color: "var(--gold)" }}>+{ach.xpReward} XP</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Category mastery */}
          {uniqueCats.length > 0 && (
            <motion.div variants={cardVariants} className="rounded-2xl p-5 surface">
              <h3 className="text-heading mb-4" style={{ fontSize: "0.95rem" }}>Category Mastery</h3>
              <div className="space-y-3">
                {uniqueCats.map((cat) => {
                  const count = sessions.filter((s) => s.category === cat).length;
                  const max = Math.max(...uniqueCats.map((c) => sessions.filter((s) => s.category === c).length));
                  const width = Math.round((count / max) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
                          <span>{CATEGORY_ICONS[cat]}</span>
                          <span>{cat}</span>
                        </div>
                        <span className="font-mono text-xs font-semibold" style={{ color: "var(--text-mute)" }}>{count} sessions</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-[var(--bg-input)]">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${width}%` }}
                          transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
                          className="h-full rounded-full"
                          style={{ background: "var(--olive-br)" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Cloud Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 surface-modal backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="w-full max-w-md rounded-2xl p-6 sm:p-7 surface-raised shadow-2xl relative border overflow-hidden"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
            >
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError("");
                }}
                className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-lg hover:bg-[var(--bg-input)]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: "rgba(92, 106, 54, 0.12)",
                    borderColor: "var(--olive)",
                    color: "var(--olive-text)",
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-space text-xl font-bold" style={{ color: "var(--text)" }}>
                    {authMode === "register" ? "Create Cloud Account" : "Sign In to Scholar Account"}
                  </h3>
                  <p className="text-xs text-[var(--text-dim)]">
                    {authMode === "register" ? "Sync notes & streak across devices" : "Restore your scholarship anywhere"}
                  </p>
                </div>
              </div>

              {/* Mode switch tabs */}
              <div className="flex gap-2 p-1 rounded-xl bg-[var(--bg-input)] border mb-4" style={{ borderColor: "var(--border-dim)" }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMode === "register"
                      ? "bg-[var(--bg-card)] text-[var(--text)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  New Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMode === "login"
                      ? "bg-[var(--bg-card)] text-[var(--text)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  Existing Sign In
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text)" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="scholar@university.edu"
                    value={authEmailInput}
                    onChange={(e) => {
                      setAuthEmailInput(e.target.value);
                      if (authError) setAuthError("");
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none surface-input"
                    style={{ borderColor: authError ? "var(--terra)" : "var(--border)", color: "var(--text)" }}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text)" }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={authMode === "register" ? "Create a password (min 6 chars)" : "Enter your password"}
                      value={authPasswordInput}
                      onChange={(e) => {
                        setAuthPasswordInput(e.target.value);
                        if (authError) setAuthError("");
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none surface-input pr-10"
                      style={{ borderColor: authError ? "var(--terra)" : "var(--border)", color: "var(--text)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {authError && <p className="text-xs font-medium text-[var(--terra)] mt-1.5">{authError}</p>}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthModal(false);
                      setAuthError("");
                    }}
                    className="btn-ghost text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="btn-primary px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    {isAuthLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Processing...
                      </>
                    ) : authMode === "register" ? (
                      <>
                        <ShieldCheck size={13} /> Save to Cloud <ArrowRight size={13} />
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={13} /> Log In & Sync <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)] mt-4">
                <Lock size={11} /> Multi-device synchronization & streak preservation.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
