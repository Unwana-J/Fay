"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  ShieldCheck,
  Smartphone,
  Laptop,
  User,
  Compass,
  Mic,
  Brain,
  Zap,
  Layers,
  Flame,
  SlidersHorizontal,
  RotateCcw,
  X,
  Target,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { CATEGORIES } from "@/lib/topics";
import { AVATARS, DEFAULT_AVATAR_PATH, PRESET_MISSIONS } from "@/lib/avatars";
import UserAvatar from "@/components/ui/UserAvatar";
import { FeyLogo } from "@/components/ui/FeyLogo";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { useRouter, usePathname } from "next/navigation";

/* ─── Archetype Quiz Configuration ────────────────────────────────────── */

interface QuizInstinctOption {
  id: "systems" | "rhetoric" | "synthesis" | "frontier";
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface QuizArenaOption {
  id: "clarity" | "persuasion" | "range" | "speed";
  title: string;
  subtitle: string;
  mission: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface QuizClusterOption {
  id: "frontier_tech" | "markets_strategy" | "mind_society" | "culture_craft";
  title: string;
  subtitle: string;
  categories: string[];
  Icon: React.ComponentType<{ size?: number; className?: string }>;
}

const Q1_INSTINCTS: QuizInstinctOption[] = [
  {
    id: "systems",
    title: "Deconstruct how it works under the hood",
    subtitle: "Map the first principles, mechanisms, and cause-and-effect",
    Icon: Layers,
  },
  {
    id: "rhetoric",
    title: "Test it out loud in a sharp debate or explanation",
    subtitle: "Turn raw ideas into persuasive, memorable spoken arguments",
    Icon: Mic,
  },
  {
    id: "synthesis",
    title: "Connect it to history, human behavior, or philosophy",
    subtitle: "Find the deeper patterns across seemingly unrelated worlds",
    Icon: Brain,
  },
  {
    id: "frontier",
    title: "Chase the rabbit hole where nobody else is looking",
    subtitle: "Explore unconventional angles, emerging trends, and wildcards",
    Icon: Compass,
  },
];

const Q2_ARENAS: QuizArenaOption[] = [
  {
    id: "clarity",
    title: "Effortless Clarity",
    subtitle: "Making complex ideas simple and structured in 90 seconds",
    mission: "Explaining complex ideas in simple, memorable terms",
    Icon: Target,
  },
  {
    id: "persuasion",
    title: "Presence & Conviction",
    subtitle: "Holding the room and speaking clearly in high-stakes moments",
    mission: "Sharpening verbal articulation & public speaking",
    Icon: Flame,
  },
  {
    id: "range",
    title: "Multidisciplinary Range",
    subtitle: "Pulling mental models from disciplines outside my comfort zone",
    mission: "Deepening critical thinking & mental models",
    Icon: Compass,
  },
  {
    id: "speed",
    title: "Speed & Sharpness",
    subtitle: "Thinking on my feet and synthesizing under time pressure",
    mission: "Preparing for high-stakes presentations & interviews",
    Icon: Zap,
  },
];

const Q3_CLUSTERS: QuizClusterOption[] = [
  {
    id: "frontier_tech",
    title: "Frontier & Systems",
    subtitle: "AI, Technology, Science & Software Engineering",
    categories: ["Artificial Intelligence", "Technology", "Science", "Software Engineering"],
    Icon: Zap,
  },
  {
    id: "markets_strategy",
    title: "Markets & Strategy",
    subtitle: "Economics, Startups, Product Management & Finance",
    categories: ["Economics", "Startups", "Product Management", "Finance"],
    Icon: Layers,
  },
  {
    id: "mind_society",
    title: "Mind & Society",
    subtitle: "Philosophy, Psychology, History & Politics",
    categories: ["Philosophy", "Psychology", "History", "Politics"],
    Icon: Brain,
  },
  {
    id: "culture_craft",
    title: "Culture & Expression",
    subtitle: "Public Speaking, Design, Culture & Marketing",
    categories: ["Public Speaking", "Design", "Culture", "Marketing"],
    Icon: Mic,
  },
];

const ARCHETYPE_TRAITS: Record<string, string> = {
  scholar: "Synthesizes mental models across eras and disciplines to see the whole board.",
  orator: "Commands attention by turning intricate ideas into resonant, unshakeable speech.",
  pioneer: "Ventures beyond familiar territory to connect emerging signals before others notice.",
  architect: "Strips away noise to expose clean structural blueprints and first-principles logic.",
  alchemist: "Tests every assumption against empirical reality and rigorous cause-and-effect.",
  philosopher: "Probes beneath surface opinions to uncover timeless truths and hidden premises.",
  novelist: "Weaves vivid narratives and human analogies that make abstract concepts unforgettable.",
  strategist: "Reads second-order incentives and translates complexity into decisive execution.",
  botanist: "Observes organic systems and long-term evolutionary patterns with quiet precision.",
  cosmologist: "Zooms out to first principles and universal scales to reframe everyday problems.",
  artisan: "Obsesses over form, nuance, and clarity until every sentence carries weight.",
  luminary: "Sparks high-energy discourse and challenges conventional wisdom with bold angles.",
};

function computeArchetypeId(
  instinct: QuizInstinctOption["id"],
  arena: QuizArenaOption["id"],
  cluster: QuizClusterOption["id"]
): string {
  const matrix: Record<QuizInstinctOption["id"], Record<QuizArenaOption["id"], string>> = {
    systems: {
      clarity: "architect",
      persuasion: "strategist",
      range: "cosmologist",
      speed: "alchemist",
    },
    rhetoric: {
      clarity: "novelist",
      persuasion: "orator",
      range: "luminary",
      speed: "strategist",
    },
    synthesis: {
      clarity: "philosopher",
      persuasion: "scholar",
      range: "scholar",
      speed: "philosopher",
    },
    frontier: {
      clarity: "artisan",
      persuasion: "luminary",
      range: "pioneer",
      speed: "pioneer",
    },
  };

  // Nuance adjustment for ecological/scientific clusters
  if (instinct === "systems" && cluster === "mind_society" && arena === "range") {
    return "botanist";
  }
  return matrix[instinct]?.[arena] || "scholar";
}

export default function OnboardingModal({
  isOpen,
  onClose,
  initialMode = "create",
}: {
  isOpen: boolean;
  onClose?: () => void;
  initialMode?: "create" | "signin";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { createAccount, loginWithCloud, pendingTopic } = useAppStore();

  const [mode, setMode] = useState<"create" | "signin">(initialMode);
  const [signInType, setSignInType] = useState<"cloud" | "guest">("cloud");

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Quiz & Reveal flow states
  const [quizStep, setQuizStep] = useState<1 | 2 | 3>(1);
  const [phase, setPhase] = useState<"quiz" | "calibrating" | "reveal">("quiz");
  const [instinctAns, setInstinctAns] = useState<QuizInstinctOption["id"]>("systems");
  const [arenaAns, setArenaAns] = useState<QuizArenaOption["id"]>("clarity");
  const [clusterAns, setClusterAns] = useState<QuizClusterOption["id"]>("frontier_tech");

  // Profile customization state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR_PATH);
  const [mission, setMission] = useState(PRESET_MISSIONS[0]);
  const [customMission, setCustomMission] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Artificial Intelligence",
    "Technology",
    "Science",
    "Software Engineering",
  ]);
  const [showAvatarDrawer, setShowAvatarDrawer] = useState(false);
  const [showCustomizeDrawer, setShowCustomizeDrawer] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const matchedAvatarObj =
    AVATARS.find((a) => a.path === avatar || a.id === avatar) || AVATARS[0];
  const matchedTrait =
    ARCHETYPE_TRAITS[matchedAvatarObj.id] || ARCHETYPE_TRAITS.scholar;

  function handleSelectQ1(id: QuizInstinctOption["id"]) {
    setInstinctAns(id);
    setQuizStep(2);
  }

  function handleSelectQ2(opt: QuizArenaOption) {
    setArenaAns(opt.id);
    setMission(opt.mission);
    setQuizStep(3);
  }

  function handleSelectQ3(opt: QuizClusterOption) {
    setClusterAns(opt.id);
    // Keep accepted topic's category included if user spun one on landing page
    const baseCats = [...opt.categories];
    if (pendingTopic?.category && !baseCats.includes(pendingTopic.category)) {
      baseCats.unshift(pendingTopic.category);
    }
    setSelectedCategories(baseCats);

    const assignedId = computeArchetypeId(instinctAns, arenaAns, opt.id);
    const foundAvatar = AVATARS.find((a) => a.id === assignedId) || AVATARS[0];
    setAvatar(foundAvatar.path);

    setPhase("calibrating");
    setTimeout(() => {
      setPhase("reveal");
    }, 650);
  }

  function handleSkipToManual() {
    setPhase("reveal");
    setShowCustomizeDrawer(true);
  }

  function handleRetakeQuiz() {
    setShowAvatarDrawer(false);
    setShowCustomizeDrawer(false);
    setQuizStep(1);
    setPhase("quiz");
    setError("");
  }

  async function handleCloudSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await loginWithCloud(email.trim(), password);
      setIsLoading(false);
      if (!result.success) {
        setError(result.error || "Invalid email or password.");
        return;
      }
      if (pathname && pathname.includes("/community/room/")) {
        router.refresh();
      }
    } catch (err: unknown) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Sign in failed.");
    }
  }

  function handleQuickGuestSignIn() {
    if (!username.trim()) {
      setError("Please enter your display name.");
      return;
    }
    createAccount({
      username: username.trim(),
      avatar,
      bio: "Exploring ideas on Fey.",
      interests: selectedCategories,
    });
    if (pathname && pathname.includes("/community/room/")) {
      router.refresh();
    }
  }

  function toggleCategory(cat: string) {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length <= 1) {
        setError("Please keep at least 1 category selected.");
        return;
      }
      setError("");
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setError("");
      setSelectedCategories([...selectedCategories, cat]);
    }
  }

  function handleComplete() {
    if (!username.trim()) {
      setError("Please enter your display name to claim your profile.");
      return;
    }

    const finalBio = mission.startsWith("Custom")
      ? customMission.trim() || "Building knowledge one topic at a time."
      : mission;

    createAccount({
      username: username.trim(),
      avatar,
      bio: finalBio,
      interests: selectedCategories,
    });

    if (pathname && pathname.includes("/community/room/")) {
      router.refresh();
    }
  }

  const progressNumber = phase === "quiz" ? quizStep : 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 surface-modal backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-xl rounded-3xl p-5 sm:p-7 surface-raised shadow-2xl relative border overflow-hidden max-h-[92vh] overflow-y-auto"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
      >
        {/* Header / Mode Indicator */}
        {mode === "create" ? (
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              {phase === "quiz" && quizStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setQuizStep((prev) => (prev === 3 ? 2 : 1))}
                  className="w-7 h-7 rounded-full border flex items-center justify-center transition-colors hover:bg-[var(--bg-input)] cursor-pointer"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  title="Previous question"
                >
                  <ArrowLeft size={13} />
                </button>
              ) : (
                <span
                  className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center font-mono"
                  style={{ background: phase === "reveal" ? "var(--gold)" : "var(--olive)" }}
                >
                  {phase === "reveal" ? <Check size={13} /> : quizStep}
                </span>
              )}
              <span
                className="text-xs uppercase tracking-wider font-mono font-semibold"
                style={{ color: "var(--text-mute)" }}
              >
                {phase === "quiz"
                  ? "Profile Calibration"
                  : phase === "calibrating"
                  ? "Synthesizing Archetype..."
                  : "Archetype Unlocked"}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Step pills */}
              <div className="hidden xs:flex gap-1">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: s === progressNumber ? "20px" : "7px",
                      background:
                        s <= progressNumber
                          ? s === 4
                            ? "var(--gold)"
                            : "var(--olive)"
                          : "var(--border)",
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-xl border text-[var(--olive-text)] hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                style={{ borderColor: "var(--border-dim)" }}
              >
                Log In
              </button>

              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="w-7 h-7 rounded-xl border flex items-center justify-center hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border-dim)", color: "var(--text-mute)" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-between mb-4 pb-2.5 border-b"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--olive-text)]">
              <ShieldCheck size={16} /> Existing Scholar Login
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("create");
                  setError("");
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg border hover:bg-[var(--bg-input)] transition-colors inline-flex items-center gap-1 cursor-pointer"
                style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
              >
                <ArrowLeft size={12} /> New Account
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="w-7 h-7 rounded-xl border flex items-center justify-center hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border-dim)", color: "var(--text-mute)" }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Accepted Topic Banner from Landing Page */}
        {mode === "create" && pendingTopic && (
          <div
            className="mb-4 p-3 rounded-2xl border text-xs flex items-center gap-2.5"
            style={{
              background: "rgba(122, 28, 46, 0.05)",
              borderColor: "rgba(122, 28, 46, 0.35)",
            }}
          >
            <span
              className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(122, 28, 46, 0.1)", color: "var(--terra)" }}
            >
              <Target size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <div
                className="font-bold font-mono uppercase text-[10px] tracking-wider"
                style={{ color: "var(--terra)" }}
              >
                Queued First Topic · {pendingTopic.category}
              </div>
              <div
                className="font-serif font-bold text-xs truncate mt-0.5"
                style={{ color: "var(--text)" }}
              >
                &ldquo;{pendingTopic.text}&rdquo;
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ─── SIGN IN MODE ──────────────────────────────────────────────── */}
          {mode === "signin" && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-5"
            >
              <div>
                <h2
                  className="font-serif text-2xl sm:text-3xl font-bold mb-1"
                  style={{ color: "var(--text)" }}
                >
                  Welcome Back to Fey
                </h2>
                <p className="text-xs sm:text-sm" style={{ color: "var(--text-dim)" }}>
                  Log in to restore your active streak, voice recordings, and customized knowledge library.
                </p>
              </div>

              {/* Sub-tab selection */}
              <div
                className="flex p-1.5 rounded-2xl border bg-[var(--bg-input)] shadow-inner gap-1.5"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSignInType("cloud");
                    setError("");
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation select-none active:scale-[0.98] ${
                    signInType === "cloud"
                      ? "bg-[var(--bg-card)] text-[var(--text)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[var(--border)] ring-1 ring-[var(--olive)]/25"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]/40 border border-transparent"
                  }`}
                >
                  <ShieldCheck
                    size={13}
                    className={signInType === "cloud" ? "text-[var(--olive)]" : "opacity-60"}
                  />
                  <span>Cloud Account (Email)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignInType("guest");
                    setError("");
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation select-none active:scale-[0.98] ${
                    signInType === "guest"
                      ? "bg-[var(--bg-card)] text-[var(--text)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[var(--border)] ring-1 ring-[var(--gold)]/25"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]/40 border border-transparent"
                  }`}
                >
                  <User
                    size={13}
                    className={signInType === "guest" ? "text-[var(--gold)]" : "opacity-60"}
                  />
                  <span>Quick Guest Name</span>
                </button>
              </div>

              {signInType === "cloud" ? (
                <form onSubmit={handleCloudSignIn} className="space-y-3.5">
                  <div
                    className="flex items-center gap-2 p-2.5 rounded-xl border text-[11px]"
                    style={{
                      background: "rgba(92, 106, 54, 0.08)",
                      borderColor: "rgba(92, 106, 54, 0.25)",
                      color: "var(--text)",
                    }}
                  >
                    <div className="flex gap-1 text-[var(--olive-text)] shrink-0">
                      <Smartphone size={13} />
                      <Laptop size={13} />
                    </div>
                    <span>Access your notes and vocal streak across all your devices.</span>
                  </div>

                  <div>
                    <label
                      className="text-xs font-semibold block mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="scholar@university.edu"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none surface-input"
                      style={{
                        borderColor: error ? "var(--terra)" : "var(--border)",
                        color: "var(--text)",
                      }}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label
                      className="text-xs font-semibold block mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError("");
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none surface-input pr-10"
                        style={{
                          borderColor: error ? "var(--terra)" : "var(--border)",
                          color: "var(--text)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {error && (
                      <p className="text-xs font-medium text-[var(--terra)] mt-1.5">{error}</p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <FeyLogo size={15} spinning={true} /> Logging In...
                        </>
                      ) : (
                        <span>Sign In &amp; Restore Streak</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label
                      className="text-xs font-semibold block mb-1.5"
                      style={{ color: "var(--text)" }}
                    >
                      Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Adaeze, Tobi, or Scholar"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) setError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleQuickGuestSignIn();
                      }}
                      className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none surface-input"
                      style={{
                        borderColor: error ? "var(--terra)" : "var(--border)",
                        color: "var(--text)",
                      }}
                      autoFocus
                    />
                    {error && (
                      <p className="text-xs font-medium text-[var(--terra)] mt-1.5">{error}</p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleQuickGuestSignIn}
                      className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold"
                    >
                      Enter as Guest
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── PHASE 1: 3-TAP ARCHETYPE QUIZ ─────────────────────────────── */}
          {mode === "create" && phase === "quiz" && (
            <motion.div
              key={`quiz-${quizStep}`}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {quizStep === 1 && (
                <>
                  <div>
                    <span
                      className="inline-block font-mono text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full mb-2"
                      style={{ background: "rgba(68, 78, 44, 0.1)", color: "var(--olive)" }}
                    >
                      Question 1 of 3 · Your Instinct
                    </span>
                    <h2
                      className="font-serif text-xl sm:text-2xl font-bold leading-snug"
                      style={{ color: "var(--text)" }}
                    >
                      You encounter a strange, provocative new idea. What is your first move?
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                      3 quick taps to discover your learning archetype and calibrate your daily feed.
                    </p>
                  </div>

                  <div className="grid gap-2.5 pt-1">
                    {Q1_INSTINCTS.map((opt) => {
                      const Icon = opt.Icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectQ1(opt.id)}
                          className="group w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 hover:border-[var(--olive)] hover:bg-[var(--bg-input)] active:scale-[0.99] cursor-pointer"
                          style={{
                            borderColor: "var(--border)",
                            background: "var(--bg-base)",
                          }}
                        >
                          <span
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                            style={{
                              background: "rgba(68, 78, 44, 0.1)",
                              color: "var(--olive)",
                            }}
                          >
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div
                              className="font-serif font-bold text-sm sm:text-base group-hover:text-[var(--olive)] transition-colors"
                              style={{ color: "var(--text)" }}
                            >
                              {opt.title}
                            </div>
                            <div
                              className="text-xs mt-0.5 leading-relaxed"
                              style={{ color: "var(--text-dim)" }}
                            >
                              {opt.subtitle}
                            </div>
                          </div>
                          <ArrowRight
                            size={15}
                            className="shrink-0 mt-1 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                            style={{ color: "var(--olive)" }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {quizStep === 2 && (
                <>
                  <div>
                    <span
                      className="inline-block font-mono text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full mb-2"
                      style={{ background: "rgba(122, 28, 46, 0.08)", color: "var(--terra)" }}
                    >
                      Question 2 of 3 · Your Speaking Edge
                    </span>
                    <h2
                      className="font-serif text-xl sm:text-2xl font-bold leading-snug"
                      style={{ color: "var(--text)" }}
                    >
                      When you explain an idea out loud, what quality matters most to you?
                    </h2>
                  </div>

                  <div className="grid gap-2.5 pt-1">
                    {Q2_ARENAS.map((opt) => {
                      const Icon = opt.Icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectQ2(opt)}
                          className="group w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 hover:border-[var(--terra)] hover:bg-[var(--bg-input)] active:scale-[0.99] cursor-pointer"
                          style={{
                            borderColor: "var(--border)",
                            background: "var(--bg-base)",
                          }}
                        >
                          <span
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                            style={{
                              background: "rgba(122, 28, 46, 0.09)",
                              color: "var(--terra)",
                            }}
                          >
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div
                              className="font-serif font-bold text-sm sm:text-base group-hover:text-[var(--terra)] transition-colors"
                              style={{ color: "var(--text)" }}
                            >
                              {opt.title}
                            </div>
                            <div
                              className="text-xs mt-0.5 leading-relaxed"
                              style={{ color: "var(--text-dim)" }}
                            >
                              {opt.subtitle}
                            </div>
                          </div>
                          <ArrowRight
                            size={15}
                            className="shrink-0 mt-1 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                            style={{ color: "var(--terra)" }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {quizStep === 3 && (
                <>
                  <div>
                    <span
                      className="inline-block font-mono text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full mb-2"
                      style={{ background: "rgba(166, 124, 30, 0.12)", color: "var(--gold)" }}
                    >
                      Question 3 of 3 · Starting Territory
                    </span>
                    <h2
                      className="font-serif text-xl sm:text-2xl font-bold leading-snug"
                      style={{ color: "var(--text)" }}
                    >
                      Which territory pulls your curiosity first?
                    </h2>
                    <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                      This seeds your initial topic roulette (you can fine-tune individual topics anytime).
                    </p>
                  </div>

                  <div className="grid gap-2.5 pt-1">
                    {Q3_CLUSTERS.map((opt) => {
                      const Icon = opt.Icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectQ3(opt)}
                          className="group w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 hover:border-[var(--olive)] hover:bg-[var(--bg-input)] active:scale-[0.99] cursor-pointer"
                          style={{
                            borderColor: "var(--border)",
                            background: "var(--bg-base)",
                          }}
                        >
                          <span
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                            style={{
                              background: "rgba(166, 124, 30, 0.12)",
                              color: "var(--gold)",
                            }}
                          >
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div
                              className="font-serif font-bold text-sm sm:text-base group-hover:text-[var(--olive)] transition-colors"
                              style={{ color: "var(--text)" }}
                            >
                              {opt.title}
                            </div>
                            <div
                              className="text-xs mt-0.5 leading-relaxed"
                              style={{ color: "var(--text-dim)" }}
                            >
                              {opt.subtitle}
                            </div>
                          </div>
                          <ArrowRight
                            size={15}
                            className="shrink-0 mt-1 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                            style={{ color: "var(--olive)" }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Subtle escape hatch for manual setup */}
              <div className="pt-2 flex items-center justify-between text-[11px]" style={{ color: "var(--text-mute)" }}>
                <span>Takes ~10 seconds</span>
                <button
                  type="button"
                  onClick={handleSkipToManual}
                  className="underline underline-offset-4 hover:text-[var(--text)] transition-colors cursor-pointer"
                >
                  Skip quiz &amp; pick manually
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── PHASE 2: CALIBRATING SPINNER ANIMATION ────────────────────── */}
          {mode === "create" && phase === "calibrating" && (
            <motion.div
              key="calibrating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-12 flex flex-col items-center justify-center text-center"
            >
              <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--gold)]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                />
                <FeyLogo size={46} spinning={true} />
              </div>
              <span
                className="font-mono text-xs uppercase tracking-[0.2em] font-bold animate-pulse"
                style={{ color: "var(--gold)" }}
              >
                Assigning Your Scholar Archetype...
              </span>
              <p className="text-xs mt-1.5" style={{ color: "var(--text-dim)" }}>
                Calibrating topic roulette and daily speaking prompts
              </p>
            </motion.div>
          )}

          {/* ─── PHASE 3: ARCHETYPE REVEAL + NAME SIGN-OFF ─────────────────── */}
          {mode === "create" && phase === "reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Revealed Archetype Card */}
              <div
                className="rounded-2xl p-4 sm:p-5 border relative overflow-hidden"
                style={{
                  background: "var(--bg-base)",
                  borderColor: "var(--olive)",
                  boxShadow: "0 10px 30px -15px rgba(68, 78, 44, 0.2)",
                }}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  <div className="relative shrink-0">
                    <UserAvatar avatar={avatar} size="xl" className="shadow-md ring-2 ring-[var(--olive)]" />
                    <span
                      className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase shadow-sm"
                      style={{ background: "var(--gold)", color: "#fff" }}
                    >
                      +50 XP
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                      <span
                        className="font-mono text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(68, 78, 44, 0.12)", color: "var(--olive)" }}
                      >
                        Assigned Archetype
                      </span>
                      <span
                        className="font-mono text-[10px] font-semibold"
                        style={{ color: "var(--gold)" }}
                      >
                        {matchedAvatarObj.role}
                      </span>
                    </div>

                    <h2
                      className="font-serif text-2xl sm:text-3xl font-bold leading-tight"
                      style={{ color: "var(--text)" }}
                    >
                      {matchedAvatarObj.title}
                    </h2>

                    <p
                      className="text-xs leading-relaxed mt-1"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {matchedTrait}
                    </p>
                  </div>
                </div>

                {/* Quick Controls to Swap Avatar or Retake Quiz */}
                <div
                  className="mt-3.5 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs"
                  style={{ borderColor: "var(--border-dim)" }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAvatarDrawer(!showAvatarDrawer);
                        setShowCustomizeDrawer(false);
                      }}
                      className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg border hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }}
                    >
                      <SlidersHorizontal size={12} />
                      <span>{showAvatarDrawer ? "Hide Avatars" : "Swap Avatar"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomizeDrawer(!showCustomizeDrawer);
                        setShowAvatarDrawer(false);
                      }}
                      className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg border hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }}
                    >
                      <span>
                        {showCustomizeDrawer
                          ? "Hide Topics"
                          : `Topics (${selectedCategories.length})`}
                      </span>
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${showCustomizeDrawer ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleRetakeQuiz}
                    className="inline-flex items-center gap-1 text-[11px] font-medium hover:underline cursor-pointer"
                    style={{ color: "var(--text-mute)" }}
                  >
                    <RotateCcw size={11} />
                    <span>Retake Quiz</span>
                  </button>
                </div>

                {/* Expandable Avatar Switcher Drawer */}
                <AnimatePresence>
                  {showAvatarDrawer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1" style={{ borderColor: "var(--border-dim)" }}>
                        {AVATARS.map((item) => {
                          const isSelected = avatar === item.path;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setAvatar(item.path)}
                              className="flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center cursor-pointer"
                              style={{
                                background: isSelected ? "var(--bg-card)" : "transparent",
                                borderColor: isSelected ? "var(--olive)" : "var(--border-dim)",
                              }}
                            >
                              <div className="w-9 h-9 rounded-full overflow-hidden mb-1 border" style={{ borderColor: isSelected ? "var(--olive)" : "var(--border)" }}>
                                <img src={item.path} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] font-semibold truncate max-w-full" style={{ color: "var(--text)" }}>
                                {item.title}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expandable Topic & Mission Customizer Drawer */}
                <AnimatePresence>
                  {showCustomizeDrawer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t space-y-3" style={{ borderColor: "var(--border-dim)" }}>
                        <div>
                          <label className="text-[11px] font-semibold block mb-1.5" style={{ color: "var(--text)" }}>
                            Fine-tune Your Topic Categories ({selectedCategories.length} selected)
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                            {CATEGORIES.map((cat) => {
                              const isSelected = selectedCategories.includes(cat);
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => toggleCategory(cat)}
                                  className="flex items-center gap-1.5 p-2 rounded-xl border text-left text-[11px] font-medium transition-all cursor-pointer"
                                  style={{
                                    background: isSelected ? "var(--bg-card)" : "transparent",
                                    borderColor: isSelected ? "var(--olive)" : "var(--border-dim)",
                                    color: isSelected ? "var(--text)" : "var(--text-mute)",
                                  }}
                                >
                                  <CategoryIcon category={cat} size={13} />
                                  <span className="truncate flex-1">{cat}</span>
                                  {isSelected && <Check size={11} className="text-[var(--olive)] shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold block mb-1" style={{ color: "var(--text)" }}>
                            Learning Mission
                          </label>
                          <div className="relative">
                            <select
                              value={mission}
                              onChange={(e) => setMission(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none surface-input appearance-none pr-8 cursor-pointer"
                              style={{ borderColor: "var(--border)", color: "var(--text)" }}
                            >
                              {PRESET_MISSIONS.map((m) => (
                                <option key={m} value={m} style={{ background: "var(--bg-card)", color: "var(--text)" }}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={14}
                              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                              style={{ color: "var(--text-mute)" }}
                            />
                          </div>
                          {mission.startsWith("Custom") && (
                            <input
                              type="text"
                              maxLength={100}
                              placeholder="Write your custom learning mission..."
                              value={customMission}
                              onChange={(e) => setCustomMission(e.target.value)}
                              className="mt-2 w-full px-3 py-2 rounded-xl border text-xs focus:outline-none surface-input"
                              style={{ borderColor: "var(--border)", color: "var(--text)" }}
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Selected Category Preview Chips (when drawer is closed) */}
              {!showCustomizeDrawer && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono mr-1" style={{ color: "var(--text-mute)" }}>
                    Starting Feed:
                  </span>
                  {selectedCategories.slice(0, 4).map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border"
                      style={{
                        background: "var(--bg-base)",
                        borderColor: "var(--border-dim)",
                        color: "var(--olive-text)",
                      }}
                    >
                      <CategoryIcon category={cat} size={11} />
                      <span>{cat}</span>
                    </span>
                  ))}
                  {selectedCategories.length > 4 && (
                    <span className="text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>
                      +{selectedCategories.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Final Step: Sign Your Scholar Card */}
              <div className="pt-1">
                <label
                  className="text-xs font-semibold block mb-1.5"
                  style={{ color: "var(--text)" }}
                >
                  Sign Your Card (Display Name) <span className="text-[var(--terra)]">*</span>
                </label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="e.g. Adaeze, Tobi, or Scholar"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleComplete();
                  }}
                  className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none transition-all surface-input"
                  style={{
                    borderColor: error ? "var(--terra)" : "var(--border)",
                    color: "var(--text)",
                  }}
                  autoFocus
                />
                {error && (
                  <p className="text-xs font-medium text-[var(--terra)] mt-1.5">{error}</p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono" style={{ color: "var(--gold)" }}>
                  +50 Starter XP Ready
                </span>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="btn-terra px-6 py-3 rounded-xl text-sm font-bold cursor-pointer shadow-md"
                >
                  {pendingTopic ? "Claim Identity & Start Sprint" : "Claim Identity & Enter Fey"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
