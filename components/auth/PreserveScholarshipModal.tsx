"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ShieldCheck, Check, Sparkles, X, ArrowRight, Lock, Eye, EyeOff, Smartphone, Laptop, Loader2, User } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { analytics } from "@/lib/analytics";
import confetti from "canvas-confetti";

export default function PreserveScholarshipModal() {
  const pathname = usePathname();
  const {
    streak,
    profile,
    sessions,
    triviaHistory = [],
    articulateHistory = [],
    registerWithCloud,
    loginWithCloud,
    dismissClaimAccountPrompt,
    claimPromptDismissed,
    isClaimAccountModalOpen,
    closeClaimAccountPrompt,
  } = useAppStore();

  const [mode, setMode] = useState<"register" | "login">("register");
  const [username, setUsername] = useState(
    profile?.username && profile.username !== "Scholar" && profile.username !== "Learner"
      ? profile.username
      : ""
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!username && typeof window !== "undefined") {
      const localName = localStorage.getItem("fey_player_name");
      if (localName && localName !== "Scholar" && localName !== "Learner") {
        setUsername(localName);
      } else if (profile?.username && profile.username !== "Scholar" && profile.username !== "Learner") {
        setUsername(profile.username);
      }
    }
  }, [profile?.username, username]);

  const hasExistingUsername = Boolean(
    (profile?.username && profile.username !== "Scholar" && profile.username !== "Learner") ||
    (typeof window !== "undefined" && localStorage.getItem("fey_player_name") && localStorage.getItem("fey_player_name") !== "Scholar" && localStorage.getItem("fey_player_name") !== "Learner")
  );

  const triviaCount = triviaHistory?.length ?? 0;
  const articulateCount = articulateHistory?.length ?? 0;
  const sessionsCount = sessions?.length ?? 0;
  const userXP = profile?.xp ?? 0;

  const isInLiveRoom = pathname?.startsWith("/play/room/");

  const isEligibleAutomatically =
    !isInLiveRoom &&
    !profile.hasClaimedAccount &&
    !claimPromptDismissed &&
    (streak.current >= 3 || triviaCount >= 2 || articulateCount >= 1 || userXP >= 100);

  const shouldShow = Boolean(isClaimAccountModalOpen || isEligibleAutomatically);

  const handleDismiss = () => {
    if (isClaimAccountModalOpen) {
      closeClaimAccountPrompt();
    } else {
      dismissClaimAccountPrompt();
    }
  };

  useEffect(() => {
    if (shouldShow) {
      analytics.trackAccountClaimPrompt({
        streakCount: streak.current,
        action: "shown",
      });
    }
  }, [shouldShow, streak.current]);

  if (!shouldShow) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "register") {
      if (!username.trim()) {
        setError("Please enter or confirm your scholar name.");
        return;
      }
      if (username.trim().length > 25) {
        setError("Scholar name must be 25 characters or fewer.");
        return;
      }
    }
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      if (mode === "register") {
        const result = await registerWithCloud(email.trim(), password, username.trim());
        if (!result.success) {
          setError(result.error || "Failed to create cloud account.");
          setIsLoading(false);
          return;
        }
      } else {
        const result = await loginWithCloud(email.trim(), password);
        if (!result.success) {
          setError(result.error || "Invalid email or password.");
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
      setIsSuccess(true);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#A3B18A", "#DDA15E", "#BC6C25"],
        });
      } catch {
        // safe fallback
      }

      setTimeout(() => {
        handleDismiss();
      }, 2400);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "An unexpected error occurred.");
    }
  }

  const isArticulateCentric = articulateCount > 0 && sessionsCount === 0 && triviaCount === 0;
  const isTriviaCentric = triviaCount > 0 && sessionsCount === 0;
  const milestoneLabel =
    streak.current >= 3
      ? `${streak.current}-Day Streak Milestone Reached`
      : articulateCount >= 1
      ? "Articulate Orator Milestone Reached"
      : triviaCount >= 2
      ? "Trivia Competitor Milestone Reached"
      : userXP >= 100
      ? `${userXP} Scholarly XP Milestone Reached`
      : "Preserve Your Progress";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 surface-modal backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="w-full max-w-lg rounded-2xl p-6 sm:p-8 surface-raised shadow-2xl relative border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
      >
        {/* Subtle decorative glow */}
        <div
          className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: "var(--terra)" }}
        />

        {/* Close / Dismiss */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-lg hover:bg-[var(--bg-input)] cursor-pointer"
          aria-label="Dismiss modal"
        >
          <X size={18} />
        </button>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-5"
            >
              {/* Header Badge */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: "rgba(221, 161, 94, 0.12)",
                    borderColor: "var(--terra)",
                    color: "var(--terra)",
                  }}
                >
                  <Flame size={24} className="animate-pulse" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[var(--gold)]" />
                    {milestoneLabel}
                  </div>
                  <h2 className="font-serif text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
                    {mode === "register"
                      ? hasExistingUsername
                        ? `Track Streak as @${username || "Scholar"}`
                        : "Track Your Streak & Progress"
                      : "Sign In to Scholar Account"}
                  </h2>
                </div>
              </div>

              {/* Progress Summary Pill */}
              <div
                className="grid grid-cols-3 gap-3 p-3 rounded-xl border text-center"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border-dim)",
                }}
              >
                <div>
                  <div className="font-mono font-bold text-lg" style={{ color: "var(--terra)" }}>
                    {streak.current} {streak.current === 1 ? "Day" : "Days"}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">Active Streak</div>
                </div>
                <div className="border-x" style={{ borderColor: "var(--border-dim)" }}>
                  <div className="font-mono font-bold text-lg" style={{ color: "var(--olive)" }}>
                    {isArticulateCentric ? articulateCount : isTriviaCentric ? triviaCount : sessions.length}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                    {isArticulateCentric ? "Articulate Matches" : isTriviaCentric ? "Trivia Matches" : "Topics Mastered"}
                  </div>
                </div>
                <div>
                  <div className="font-mono font-bold text-lg" style={{ color: "var(--gold)" }}>
                    {profile.xp}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">Scholarly XP</div>
                </div>
              </div>

              {/* Device Sync Benefit Callout */}
              <div
                className="flex items-start gap-2.5 p-3 rounded-xl border text-xs"
                style={{
                  background: "rgba(92, 106, 54, 0.08)",
                  borderColor: "rgba(92, 106, 54, 0.25)",
                  color: "var(--text)",
                }}
              >
                <div className="flex items-center gap-1 shrink-0 mt-0.5 text-[var(--olive-text)]">
                  <Smartphone size={15} />
                  <Laptop size={15} />
                </div>
                <p className="leading-relaxed">
                  <strong>Sync across all your devices:</strong> Set up your email &amp; password to preserve your streak, {isArticulateCentric ? "Articulate match history, and parlor stats" : isTriviaCentric ? "trivia scores, and leaderboard rank" : "audio recordings, and notes"} safely in the cloud and log in anywhere.
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex items-center gap-2 border-b pb-1" style={{ borderColor: "var(--border-dim)" }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className={`text-xs font-semibold pb-1.5 border-b-2 transition-colors ${
                    mode === "register"
                      ? "border-[var(--terra)] text-[var(--text)]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  Create Cloud Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className={`text-xs font-semibold pb-1.5 border-b-2 transition-colors ${
                    mode === "login"
                      ? "border-[var(--terra)] text-[var(--text)]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  Existing Account Login
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {mode === "register" && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-label">Scholar Name / Handle</label>
                      {hasExistingUsername ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Check size={11} /> Confirming your player name
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--text-mute)] font-medium">
                          Your public display name
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (error) setError("");
                        }}
                        placeholder="e.g. Amina, Chidi, Kelechi"
                        maxLength={25}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none transition-colors surface-input pr-10"
                        style={{
                          borderColor: error && !username.trim() ? "var(--red)" : "var(--border)",
                          color: "var(--text)",
                        }}
                      />
                      <User size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      {hasExistingUsername
                        ? "We found your player name. Confirm or edit it before linking to your cloud account."
                        : "This handle will represent your scores, trivia rank, and party room honors."}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-label mb-1.5 block">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="scholar@university.edu"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors surface-input"
                    style={{
                      borderColor: error ? "var(--red)" : "var(--border)",
                      color: "var(--text)",
                    }}
                    autoFocus={hasExistingUsername}
                  />
                </div>

                <div>
                  <label className="text-label mb-1.5 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "register" ? "Create a password (min 6 chars)" : "Enter your password"}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors surface-input pr-10"
                      style={{
                        borderColor: error ? "var(--red)" : "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {error && <p className="text-xs text-[var(--red)] mt-1.5 font-medium">{error}</p>}
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="btn-ghost text-xs cursor-pointer"
                    disabled={isLoading}
                  >
                    {isClaimAccountModalOpen ? "Close for now" : "Remind me tomorrow"}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-terra px-5 py-2.5 text-xs font-semibold flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Saving...
                      </>
                    ) : mode === "register" ? (
                      <>
                        <Flame size={14} className="text-amber-300" /> Track Streak &amp; Save <ArrowRight size={13} />
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={14} /> Log In &amp; Sync Streak <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <Lock size={11} /> Zero spam. Used strictly for multi-device sync & streak preservation.
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 flex flex-col items-center justify-center text-center gap-4"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border"
                style={{
                  backgroundColor: "rgba(163, 177, 138, 0.15)",
                  borderColor: "var(--olive)",
                  color: "var(--olive)",
                }}
              >
                <Check size={32} />
              </div>
              <h3 className="font-serif text-2xl font-bold" style={{ color: "var(--text)" }}>
                Scholarship Sealed in the Cloud
              </h3>
              <p className="text-sm max-w-sm text-[var(--text-dim)]">
                Your progress for <strong>@{profile.username || "Scholar"}</strong> is safely synced to <strong>{email}</strong>. You can now sign in on any device without losing your streak.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
