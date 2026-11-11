"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Zap, BookOpen, Mic, ArrowRight,
  Star, Shuffle, Sparkles, Compass,
  Gamepad2, ChevronRight, Flame, ShieldCheck,
  Target, Presentation, MessageSquareQuote, Trophy,
  Calculator, ScrollText, CheckCircle2, Radio, Calendar,
} from "lucide-react";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { useAppStore, getNext7ScheduleDays } from "@/store/useAppStore";
import { getLevelForXP, getLevelProgress, getNextLevel, ACHIEVEMENTS } from "@/lib/achievements";
import { CATEGORY_COLORS, CATEGORY_ICONS, TOPIC_BANK, DIFFICULTY_LABELS, DIFFICULTY_XP, DIFFICULTY_BONUS_XP, type Difficulty } from "@/lib/topics";
import { relativeDate, getLast52Weeks, getDayOfWeek, todayStr } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import FeyLogo from "@/components/ui/FeyLogo";
import FocusCategoryModal from "@/components/dashboard/FocusCategoryModal";
import StreakCalendarModal from "@/components/ui/StreakCalendarModal";
import UserAvatar from "@/components/ui/UserAvatar";
import { getDailyQuests } from "@/lib/quests";
import { analytics } from "@/lib/analytics";
import { useFeatureStore } from "@/store/useFeatureStore";
import LandingPageView from "@/components/marketing/LandingPageView";
import OnboardingModal from "@/components/auth/OnboardingModal";

const DAYS_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ─── Motivational copy & Wisdom Library ─────────────────────────── */
const HABIT_PROMPTS = [
  "Consistency beats intensity.",
  "Small efforts compound quickly.",
  "One concept at a time.",
  "Quiet progress is still progress.",
  "Curiosity has its own reason for existing.",
  "Thinking deeper is a super power.",
  "Make articulation a daily ritual.",
  "Focus on synthesis, not memorization.",
  "Your future self will thank you.",
  "Feed your mind daily.",
  "Great thinkers are lifelong learners.",
  "Stay curious, keep seeking.",
  "Build the discipline of explanation.",
];

const DAILY_QUOTES = [
  { quote: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
  { quote: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { quote: "I have no special talent. I am only passionately curious.", author: "Albert Einstein" },
  { quote: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { quote: "To know that we know what we know, and to know that we do not know what we do not know, that is true knowledge.", author: "Copernicus" },
  { quote: "Education is not the learning of facts, but the training of the mind to think.", author: "Albert Einstein" },
  { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { quote: "He who asks is a fool for five minutes, but he who does not ask remains a fool forever.", author: "Chinese Proverb" },
  { quote: "Real knowledge is to know the extent of one's ignorance.", author: "Confucius" },
  { quote: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { quote: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
  { quote: "The beautiful thing about learning is nobody can take it away from you.", author: "B.B. King" },
  { quote: "It is the mark of an educated mind to be able to entertain a thought without accepting it.", author: "Aristotle" },
  { quote: "Curiosity is the wick in the candle of learning.", author: "William Arthur Ward" },
  { quote: "Doubt is the origin of wisdom.", author: "René Descartes" },
  { quote: "Wonder is the beginning of wisdom.", author: "Socrates" },
  { quote: "Knowledge has to be improved, challenged, and increased constantly, or it vanishes.", author: "Peter Drucker" },
  { quote: "The important thing is not to stop questioning.", author: "Albert Einstein" },
  { quote: "An unexamined life is not worth living.", author: "Socrates" },
  { quote: "We do not write in order to be understood; we write in order to understand.", author: "C.S. Lewis" },
  { quote: "Self-education is, I firmly believe, the only kind of education there is.", author: "Isaac Asimov" },
  { quote: "I would rather have questions that can't be answered than answers that can't be questioned.", author: "Richard Feynman" },
  { quote: "Science is the belief in the ignorance of experts.", author: "Richard Feynman" },
];

function streakMessage(days: number, todayIndex: number) {
  if (days === 0) {
    return HABIT_PROMPTS[todayIndex % HABIT_PROMPTS.length];
  }
  if (days === 1) return "You started. Don't stop.";
  if (days < 5)  return "You're building a habit.";
  if (days < 10) return "You're getting sharper.";
  if (days < 21) return "This is becoming who you are.";
  return "You're in the top 5% of learners.";
}

/* ─── Activity heatmap ───────────────────────────────────────────── */
function ActivityHeatmap({
  researchDates,
  gameDates,
}: {
  researchDates: Set<string>;
  gameDates: Set<string>;
}) {
  const allDays = getLast52Weeks();

  const weeks: string[][] = [];
  let week: string[] = [];
  allDays.forEach((day, i) => {
    if (i === 0) for (let p = 0; p < getDayOfWeek(day); p++) week.push("");
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  });
  if (week.length > 0) weeks.push(week);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-0.5 min-w-max">
        {weeks.map((wk, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {wk.map((day, di) => {
              if (day === "") return <div key={di} className="w-[11px] h-[11px]" />;
              const isRes = researchDates.has(day);
              const isGm = gameDates.has(day);
              let bg = "rgba(68,78,44,0.06)";
              if (isRes && isGm) {
                bg = "linear-gradient(135deg, var(--terra) 50%, var(--olive) 50%)";
              } else if (isRes) {
                bg = "var(--terra)";
              } else if (isGm) {
                bg = "var(--olive)";
              }
              const titleText =
                isRes && isGm
                  ? `${day} · Research & Games`
                  : isRes
                  ? `${day} · Research Challenge`
                  : isGm
                  ? `${day} · Games`
                  : day;
              return (
                <div
                  key={di}
                  title={titleText}
                  className="w-[11px] h-[11px] rounded-[2px] transition-colors"
                  style={{
                    background: bg,
                    opacity: 1,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Weekly bar chart ───────────────────────────────────────────── */
function WeeklyBars({ sessions }: { sessions: Array<{ date: string }> }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { label: DAYS_ABBR[d.getDay()][0], count: sessions.filter((s) => s.date === key).length };
  });
  const max = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-1.5 h-10">
      {days.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(d.count / max) * 100}%` }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 180, damping: 12 }}
            className="w-full rounded-t-[3px] min-h-[2px]"
            style={{
              background: d.count > 0
                ? "var(--terra)"
                : "rgba(68,78,44,0.06)",
            }}
          />
          <span className="text-[9px] font-mono" style={{ color: "var(--text-mute)" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

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
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      staggerChildren: 0.04,
    }
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.12,
    }
  }
};

/* ─── Dashboard ──────────────────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const {
    profile,
    streak,
    sessions,
    triviaHistory = [],
    mathleticsHistory = [],
    articulateHistory = [],
    activeSession,
    settings,
    customTopics,
    startSession,
    claimedQuestIds,
    claimQuestXP,
    updateSettings,
    isOnboarded,
    pendingTopic,
    setPendingTopic,
    queuedTomorrowTopic,
    setQueuedTomorrowTopic,
    scheduledTopics = [],
    queueTopicNextAvailableDay,
    removeScheduledTopic,
    buyStreakShield,
  } = useAppStore();
  const difficultyMode: Difficulty = (settings.difficultyMode as Difficulty) ?? "Scholar";
  const level     = getLevelForXP(profile.xp);
  const nextLevel = getNextLevel(profile.xp);
  const progress  = getLevelProgress(profile.xp);
  const [mounted, setMounted] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [skippedToday, setSkippedToday] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [focusCategory, setFocusCategory] = useState<string | null>(null);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [spinOffset, setSpinOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<"practice" | "parlor">("practice");
  const [dismissedTomorrowModal, setDismissedTomorrowModal] = useState(false);

  const { activityDates, researchDates, gameDates } = useMemo(() => {
    const all = new Set<string>();
    const res = new Set<string>();
    const gm = new Set<string>();

    const toIso = (ts: number) => {
      const d = new Date(ts);
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const dy = String(d.getDate()).padStart(2, "0");
      return `${yr}-${mo}-${dy}`;
    };

    (sessions || []).forEach((s) => {
      if (s.date) {
        const dt = s.date.slice(0, 10);
        all.add(dt);
        res.add(dt);
      }
    });

    (triviaHistory || []).forEach((t) => {
      const dt = t.date ? t.date.slice(0, 10) : t.timestamp ? toIso(t.timestamp) : null;
      if (dt) {
        all.add(dt);
        gm.add(dt);
      }
    });

    (mathleticsHistory || []).forEach((m) => {
      const dt = m.date ? m.date.slice(0, 10) : m.timestamp ? toIso(m.timestamp) : null;
      if (dt) {
        all.add(dt);
        gm.add(dt);
      }
    });

    (articulateHistory || []).forEach((a) => {
      const dt = a.date ? a.date.slice(0, 10) : a.timestamp ? toIso(a.timestamp) : null;
      if (dt) {
        all.add(dt);
        gm.add(dt);
      }
    });

    (streak.history || []).forEach((h) => {
      if (h.date) {
        const dt = h.date.slice(0, 10);
        all.add(dt);
        if (!res.has(dt)) gm.add(dt);
      }
    });

    return { activityDates: all, researchDates: res, gameDates: gm };
  }, [sessions, triviaHistory, mathleticsHistory, articulateHistory, streak.history]);

  const { features, fetchFeatures } = useFeatureStore();

  useEffect(() => {
    setMounted(true);
    fetchFeatures();
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("accepted") === "1" || urlParams.get("onboard") === "1") {
        setShowOnboardingModal(true);
      }
      if (urlParams.get("tab") === "parlor" || urlParams.get("parlor") === "1") {
        setActiveTab("parlor");
      }
    }
  }, [fetchFeatures]);

  if (!mounted || !isOnboarded) {
    return (
      <>
        <LandingPageView onStartClick={() => setShowOnboardingModal(true)} />
        {mounted && showOnboardingModal && <OnboardingModal isOpen={true} />}
      </>
    );
  }

  const dailyQuests = getDailyQuests(sessions, streak, claimedQuestIds);

  function handleStartImpromptu() {
    const id = startSession(suggestedTopic, 0, "speaking");
    router.push(`/session/${id}`);
  }

  /* ── Stats ── */
  const totalResearchMin = sessions.reduce((a, s) => a + s.researchMinutes, 0);
  const totalSpeakSec    = sessions.reduce((a, s) => a + s.speakingSeconds, 0);
  const recentSessions   = sessions.slice(0, 4);
  const histMap: Record<string, number> = {};
  sessions.forEach((s) => { histMap[s.date] = (histMap[s.date] ?? 0) + 1; });
  const history = Object.entries(histMap).map(([date, count]) => ({ date, count }));

  /* ── Smart topic suggestion ────────────────────────────────────── */
  const completedTopicIds = new Set(sessions.map((s) => s.topicId));

  const todayIndex = (() => {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  })();

  const allTopics = [...TOPIC_BANK, ...(customTopics || [])];

  const todayIso = todayStr();
  const next7Days = getNext7ScheduleDays(todayIso);
  const upcomingScheduled = (scheduledTopics || [])
    .filter((item) => next7Days.includes(item.date))
    .sort((a, b) => a.date.localeCompare(b.date));
  const todayScheduledItem = (scheduledTopics || []).find((item) => item.date === todayIso);
  const nextQueuedItem =
    todayScheduledItem ||
    (queuedTomorrowTopic && queuedTomorrowTopic.queuedDate !== todayIso
      ? { date: todayIso, topic: queuedTomorrowTopic.topic }
      : upcomingScheduled[0] ||
        (queuedTomorrowTopic ? { date: next7Days[0], topic: queuedTomorrowTopic.topic } : null));

  const isScheduledForToday = Boolean(
    nextQueuedItem &&
      (todayScheduledItem ||
        (queuedTomorrowTopic && queuedTomorrowTopic.queuedDate !== todayIso))
  );

  const suggestedTopic = (() => {
    // 0. If user accepted a topic from the landing spinner
    if (pendingTopic) {
      return pendingTopic;
    }

    // 0b. If user has a topic scheduled for today, promote it today!
    if (
      isScheduledForToday &&
      nextQueuedItem &&
      !completedTopicIds.has(nextQueuedItem.topic.id) &&
      !skippedToday.includes(nextQueuedItem.topic.id)
    ) {
      return nextQueuedItem.topic;
    }

    const excluded = new Set([...completedTopicIds, ...skippedToday]);

    // 1. If user chose a specific focus category via the modal
    if (focusCategory) {
      const focusPool = allTopics.filter(
        (t) => t.category === focusCategory && t.difficulty === difficultyMode && !excluded.has(t.id)
      );
      if (focusPool.length > 0) {
        return focusPool[(todayIndex + spinOffset) % focusPool.length];
      }
      // Fallback: ignore difficulty filter for this category if pool is empty
      const focusPoolAll = allTopics.filter((t) => t.category === focusCategory && !excluded.has(t.id));
      if (focusPoolAll.length > 0) {
        return focusPoolAll[(todayIndex + spinOffset) % focusPoolAll.length];
      }
      const focusPoolCompleted = allTopics.filter((t) => t.category === focusCategory);
      if (focusPoolCompleted.length > 0) {
        return focusPoolCompleted[(todayIndex + spinOffset) % focusPoolCompleted.length];
      }
    }

    // 2. User's active categories: prioritize favoriteCategories, then enabledCategories
    const userCategories =
      settings.favoriteCategories.length > 0
        ? settings.favoriteCategories
        : settings.enabledCategories.length > 0
        ? settings.enabledCategories
        : ["Artificial Intelligence", "Technology"];

    // Filter by both category AND difficulty mode
    let pool = allTopics.filter(
      (t) => userCategories.includes(t.category) && t.difficulty === difficultyMode && !excluded.has(t.id)
    );

    if (pool.length === 0 && settings.enabledCategories.length > 0) {
      pool = allTopics.filter(
        (t) => settings.enabledCategories.includes(t.category) && t.difficulty === difficultyMode && !excluded.has(t.id)
      );
    }

    // Fallback: relax difficulty filter if the mode pool is exhausted
    if (pool.length === 0) {
      pool = allTopics.filter(
        (t) => userCategories.includes(t.category) && !excluded.has(t.id)
      );
    }

    if (pool.length === 0) {
      pool = allTopics.filter(
        (t) => userCategories.includes(t.category) && !completedTopicIds.has(t.id)
      );
    }

    if (pool.length === 0) {
      pool = allTopics.filter((t) => userCategories.includes(t.category));
    }

    if (pool.length === 0) {
      pool = allTopics;
    }

    return pool[(todayIndex + spinOffset) % pool.length];
  })();

  function handleStartSuggested() {
    const id = startSession(suggestedTopic, settings.researchMin);
    router.push(`/session/${id}`);
  }

  function handleSkipTopic() {
    if (spinning) return;
    if (pendingTopic) {
      setPendingTopic(null);
    }
    analytics.trackRouletteSpun({
      category: suggestedTopic.category,
      difficulty: suggestedTopic.difficulty,
    });
    setSpinning(true);
    setTimeout(() => {
      setSkippedToday((prev) => [...prev, suggestedTopic.id]);
      setSpinOffset((prev) => prev + 1);
      setSpinning(false);
    }, 500);
  }

  function handleSelectFocus(category: string | null) {
    setFocusCategory(category);
    setSpinning(true);
    setSpinOffset((prev) => prev + 1);
    setTimeout(() => {
      setSpinning(false);
    }, 500);
  }

  const dailyQuote = DAILY_QUOTES[todayIndex % DAILY_QUOTES.length];
  const heroCat = activeSession ? activeSession.topic.category : suggestedTopic.category;
  const catColor = CATEGORY_COLORS[heroCat] || "var(--terra)";

  const enablePodium = features?.enablePodium ?? true;
  const enableTrivia = features?.enableTrivia ?? true;
  const enableArticulate = (features?.enableOnlineArticulate ?? true) || (features?.enablePassThePhone ?? true);
  const enableMathletics = features?.enableMathletics ?? true;
  const activeParlorCount = (enablePodium ? 1 : 0) + (enableArticulate ? 1 : 0) + (enableTrivia ? 1 : 0) + (enableMathletics ? 1 : 0);

  function renderParlorCards() {
    return (
      <div className={cn(
        "grid gap-3.5",
        activeParlorCount >= 4
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : activeParlorCount === 3
          ? "grid-cols-1 md:grid-cols-3"
          : activeParlorCount === 2
          ? "grid-cols-1 md:grid-cols-2"
          : "grid-cols-1"
      )}>
        {/* Card 1: The Podium */}
        {enablePodium && (
          <Link href="/podium" className="group">
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="p-4 rounded-2xl border-[1.5px] h-full flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden bg-[var(--bg-card)] hover:border-[var(--gold)]"
              style={{
                borderColor: "var(--border)",
              }}
            >
              <div className="absolute -right-3 -bottom-3 text-[var(--gold)] opacity-5 select-none group-hover:scale-110 transition-transform pointer-events-none">
                <Presentation size={72} strokeWidth={1} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border-[1.5px]"
                    style={{ background: "rgba(166, 124, 30, 0.12)", borderColor: "var(--gold)" }}
                  >
                    <Presentation size={18} className="text-[var(--gold)]" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white bg-[var(--gold)]">
                    Party Slides
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm mb-1 group-hover:text-[var(--gold)] transition-colors" style={{ color: "var(--text)" }}>
                  The Podium
                </h4>
                <p className="text-[11px] leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>
                  Spin a spicy topic, jot your angle & let Fay-re build your slide deck.
                </p>
              </div>
              <div className="pt-2 border-t flex items-center justify-between text-xs font-semibold text-[var(--gold)]" style={{ borderColor: "var(--border-dim)" }}>
                <span>Present Deck</span>
                <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Start <ChevronRight size={12} />
                </span>
              </div>
            </motion.div>
          </Link>
        )}

        {/* Card 2: Online Articulate */}
        {enableArticulate && (
          <Link href="/play" className="group">
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="p-4 rounded-2xl border-[1.5px] h-full flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden bg-[var(--bg-card)] hover:border-[var(--terra)]"
              style={{
                borderColor: "var(--border)",
              }}
            >
              <div className="absolute -right-3 -bottom-3 text-[var(--terra)] opacity-5 select-none group-hover:scale-110 transition-transform pointer-events-none">
                <MessageSquareQuote size={72} strokeWidth={1} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border-[1.5px]"
                    style={{ background: "rgba(122, 28, 46, 0.12)", borderColor: "var(--terra)" }}
                  >
                    <MessageSquareQuote size={18} className="text-[var(--terra)]" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white bg-[var(--terra)]">
                    Multiplayer
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm mb-1 group-hover:text-[var(--terra)] transition-colors" style={{ color: "var(--text)" }}>
                  Online Articulate
                </h4>
                <p className="text-[11px] leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>
                  Fast-paced word describing game with speech recognition & AI referee.
                </p>
              </div>
              <div className="pt-2 border-t flex items-center justify-between text-xs font-semibold text-[var(--terra)]" style={{ borderColor: "var(--border-dim)" }}>
                <span>House Party</span>
                <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Play Room <ChevronRight size={12} />
                </span>
              </div>
            </motion.div>
          </Link>
        )}

        {/* Card 3: Naija Trivia */}
        {enableTrivia && (
          <Link href="/games/trivia" className="group">
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="p-4 rounded-2xl border-[1.5px] h-full flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden bg-[var(--bg-card)] hover:border-[var(--olive)]"
              style={{
                borderColor: "var(--border)",
              }}
            >
              <div className="absolute -right-3 -bottom-3 text-[var(--olive)] opacity-5 select-none group-hover:scale-110 transition-transform pointer-events-none">
                <Trophy size={72} strokeWidth={1} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border-[1.5px]"
                    style={{ background: "rgba(68, 78, 44, 0.12)", borderColor: "var(--olive)" }}
                  >
                    <Trophy size={18} className="text-[var(--olive)]" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white bg-[var(--olive)]">
                    Trivia Arcade
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm mb-1 group-hover:text-[var(--olive)] transition-colors" style={{ color: "var(--text)" }}>
                  Naija Trivia
                </h4>
                <p className="text-[11px] leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>
                  Test your mastery of Nigerian history, culture & general knowledge.
                </p>
              </div>
              <div className="pt-2 border-t flex items-center justify-between text-xs font-semibold text-[var(--olive)]" style={{ borderColor: "var(--border-dim)" }}>
                <span>Speed Quiz</span>
                <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Challenge <ChevronRight size={12} />
                </span>
              </div>
            </motion.div>
          </Link>
        )}

        {/* Card 4: Mathletics */}
        {enableMathletics && (
          <Link href="/games/mathletics" className="group">
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="p-4 rounded-2xl border-[1.5px] h-full flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden bg-[var(--bg-card)] hover:border-emerald-700"
              style={{
                borderColor: "var(--border)",
              }}
            >
              <div className="absolute -right-3 -bottom-3 text-emerald-700 opacity-5 select-none group-hover:scale-110 transition-transform pointer-events-none">
                <Calculator size={72} strokeWidth={1} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border-[1.5px]"
                    style={{ background: "rgba(45, 106, 79, 0.12)", borderColor: "rgb(45, 106, 79)" }}
                  >
                    <Calculator size={18} className="text-emerald-700" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white bg-emerald-700">
                    Speed Run
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm mb-1 group-hover:text-emerald-700 transition-colors" style={{ color: "var(--text)" }}>
                  Mathletics
                </h4>
                <p className="text-[11px] leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>
                  25s rapid mental calculation, algebra, and geometry speed duels.
                </p>
              </div>
              <div className="pt-2 border-t flex items-center justify-between text-xs font-semibold text-emerald-700" style={{ borderColor: "var(--border-dim)" }}>
                <span>Speed Arena</span>
                <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Duel <ChevronRight size={12} />
                </span>
              </div>
            </motion.div>
          </Link>
        )}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-4 sm:p-8 max-w-5xl mx-auto"
    >
      {/* ── Editorial Folio Header (Unified Typographic Lockup — Responsive Mobile First) ── */}
      <motion.div variants={cardVariants} className="mb-6 sm:mb-7">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Top metadata line: Date on left, Scholar status on right */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs font-medium text-[var(--text-dim)] tracking-tight">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>

            {/* Compact Scholar Status Pill Lockup (Clickable -> Opens Streak Calendar Modal) */}
            <button
              type="button"
              onClick={() => setShowStreakModal(true)}
              title="View Streak Calendar & Scholar's Seals"
              aria-label="View streak details and calendar"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--olive)] hover:bg-[var(--bg-panel)] transition-all cursor-pointer active:scale-[0.98] group select-none text-left"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)] group-hover:scale-125 transition-transform" />
              <div className="text-xs font-medium">
                <span className="font-semibold text-[var(--text)]">{profile.username}</span>
                <span className="text-[var(--text-mute)] mx-1">·</span>
                <span className="text-[var(--olive)] font-semibold">{level.title}</span>
              </div>
              <span className="text-[var(--border)] font-bold">·</span>
              <span className="inline-flex items-center gap-1 font-bold text-xs text-[var(--terra)]">
                <Flame size={12} className="text-[var(--terra)] fill-[var(--terra)] shrink-0 transition-transform group-hover:scale-110" />
                <span>{streak.current}d</span>
                {(streak.shields ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[var(--olive)]" title={`${streak.shields} Scholar's Seal active`}>
                    <ShieldCheck size={12} className="text-[var(--olive)]" />
                    <span className="text-[10px] font-mono">{streak.shields}</span>
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* Lead Headline & Literary Epigraph */}
          <div>
            <h1
              className="font-serif font-bold leading-tight tracking-tight text-[var(--text)]"
              style={{
                fontSize: "clamp(1.85rem, 4vw, 2.75rem)",
                fontFamily: "var(--font-serif), 'Lora', Georgia, serif",
              }}
            >
              {streakMessage(streak.current, todayIndex)}
            </h1>
            
            {/* Literary Epigraph */}
            <p
              className="mt-2 text-sm sm:text-base italic max-w-2xl leading-relaxed text-[var(--text-dim)]"
              style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif" }}
            >
              &ldquo;{dailyQuote.quote}&rdquo;{" "}
              <span className="not-italic font-sans text-xs font-bold text-[var(--text-mute)]">
                — {dailyQuote.author}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Day 0 Welcome Orientation Banner (Bespoke Scholar Induction) ── */}
      {sessions.length === 0 && (
        <motion.div
          variants={cardVariants}
          className="rounded-2xl p-5 sm:p-6 mb-6 border-[1.5px] bg-[var(--bg-card)] relative overflow-hidden"
          style={{
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-start gap-4 relative z-10">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-[1.5px] mt-0.5"
              style={{
                background: "var(--bg-panel)",
                borderColor: "var(--border)",
                color: "var(--terra)",
              }}
            >
              <FeyLogo size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-[var(--olive)]">
                <span>Scholar Induction</span>
                <span className="text-[var(--border)] font-bold">·</span>
                <span className="font-medium text-[var(--text-dim)]">First Vocal Sprint</span>
              </div>
              <h2
                className="font-serif font-bold text-xl sm:text-2xl mb-1.5 tracking-tight text-[var(--text)]"
                style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif" }}
              >
                Welcome, {profile.username || "Scholar"}!
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed max-w-2xl text-[var(--text-dim)]">
                Fey is designed to prove true understanding through voice. Select today&apos;s topic below, sketch your key points in 15 minutes, and articulate them simply under 90 seconds.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Dashboard Tab Bar (Crisp Solid Border Segmented Control) ── */}
      <motion.div variants={cardVariants} className="mb-6">
        <div
          className="relative flex p-1.5 rounded-2xl border-[1.5px] bg-[var(--bg-input)]/60 gap-2"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Tab 1: Daily Practice & Study */}
          <button
            type="button"
            onClick={() => setActiveTab("practice")}
            className={cn(
              "relative flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer select-none z-10",
              activeTab === "practice"
                ? "text-[var(--text)] font-bold"
                : "text-[var(--text-mute)] hover:text-[var(--text)]"
            )}
          >
            {activeTab === "practice" && (
              <motion.div
                layoutId="active-dashboard-tab"
                className="absolute inset-0 rounded-xl border-[1.5px]"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
                transition={{ type: "spring", stiffness: 480, damping: 36 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
              <BookOpen
                size={16}
                className={cn(
                  "transition-transform duration-200 shrink-0",
                  activeTab === "practice" ? "text-[var(--terra)] scale-110" : "opacity-60"
                )}
              />
              <span>Daily Practice<span className="hidden sm:inline"> & Study</span></span>
            </span>
          </button>

          {/* Tab 2: The Parlor & Games */}
          <button
            type="button"
            onClick={() => setActiveTab("parlor")}
            className={cn(
              "relative flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer select-none z-10",
              activeTab === "parlor"
                ? "text-[var(--text)] font-bold"
                : "text-[var(--text-mute)] hover:text-[var(--text)]"
            )}
          >
            {activeTab === "parlor" && (
              <motion.div
                layoutId="active-dashboard-tab"
                className="absolute inset-0 rounded-xl border-[1.5px]"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                }}
                transition={{ type: "spring", stiffness: 480, damping: 36 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
              <Gamepad2
                size={16}
                className={cn(
                  "transition-transform duration-200 shrink-0",
                  activeTab === "parlor" ? "text-[var(--gold)] scale-110" : "opacity-60"
                )}
              />
              <span>The Parlor<span className="hidden sm:inline"> & Games</span></span>
            </span>
          </button>
        </div>
      </motion.div>

      {/* ── Animated Tab Content Transition ── */}
      <AnimatePresence mode="wait">
        {activeTab === "parlor" ? (
          <motion.div
            key="parlor-tab-content"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
          <div
            className="surface rounded-2xl p-6 border relative overflow-hidden"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--bg-input)]/50 shrink-0">
                  <Gamepad2 size={18} className="text-[var(--gold)]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg sm:text-xl" style={{ color: "var(--text)" }}>
                    The Scholar&apos;s Parlor
                  </h3>
                  <p className="text-xs sm:text-sm" style={{ color: "var(--text-dim)" }}>
                    Party slide presentations, multiplayer word games, speed arithmetic, and cultural trivia.
                  </p>
                </div>
              </div>

              <Link
                href="/games"
                className="text-xs font-mono font-bold flex items-center gap-1 text-[var(--gold)] hover:underline"
              >
                <span>Full Games Hub ({activeParlorCount})</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {renderParlorCards()}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="practice-tab-content"
          variants={tabContentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* ── Top-of-Dashboard 7-Day Schedule Strip (Above the Hero Card!) ── */}
          {!activeSession && nextQueuedItem && !isScheduledForToday && (
            <motion.div
              variants={cardVariants}
              className="rounded-2xl p-4 sm:p-5 mb-5 border-[1.5px] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xs"
              style={{
                background: "rgba(68, 78, 44, 0.08)",
                borderColor: "var(--olive)",
              }}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--olive)]/15 border border-[var(--olive)]/30 shrink-0 mt-0.5 sm:mt-0">
                  <Calendar size={16} className="text-[var(--olive)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--olive)]">
                      7-Day Schedule ({Math.max(1, upcomingScheduled.length)}/7 Planned)
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-mute)]">
                      · Next:{" "}
                      {new Date(nextQueuedItem.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {nextQueuedItem.topic.difficulty}
                    </span>
                  </div>
                  <p className="font-serif font-bold text-sm sm:text-base leading-snug" style={{ color: "var(--text)" }}>
                    {nextQueuedItem.topic.text}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Link
                  href="/library?tab=schedule"
                  className="px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border border-[var(--olive)] bg-[var(--bg-card)] hover:bg-[var(--olive)] hover:text-white text-[var(--olive)] whitespace-nowrap transition-colors"
                >
                  Manage Schedule
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── The Centerpiece: Today's Feynman Inquiry (High-Impact Active Workspace) ── */}
          <motion.div
            variants={cardVariants}
            className="surface-hero rounded-2xl p-5 sm:p-8 md:p-9 mb-6 relative overflow-hidden"
          >
        {activeSession ? (
          /* Resume in-progress session */
          <div>
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b" style={{ borderColor: "var(--border-dim)" }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--terra)] animate-pulse" />
                <span className="text-xs font-bold tracking-wider uppercase text-[var(--terra)] font-mono">
                  Active Session in Progress
                </span>
              </div>
              <span className="text-xs font-medium text-[var(--text-mute)]">
                Pick up where you left off
              </span>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p
                  className="font-serif font-bold text-2xl sm:text-3xl"
                  style={{ color: "var(--text)", lineHeight: 1.25, maxWidth: "52ch", fontFamily: "var(--font-serif), 'Lora', Georgia, serif" }}
                >
                  {activeSession.topic.text}
                </p>
                <div className="flex items-center gap-2 mt-3.5">
                  <span className="tag tag-terra capitalize font-bold">{activeSession.stage}</span>
                  <span
                    className="tag font-bold inline-flex items-center gap-1.5"
                    style={{
                      backgroundColor: `${catColor}15`,
                      color: catColor,
                      border: `1px solid ${catColor}35`,
                    }}
                  >
                    <CategoryIcon category={heroCat} size={13} />
                    <span>{heroCat}</span>
                  </span>
                </div>
              </div>
              <Link href={`/session/${activeSession.id}`}>
                <button className="btn-terra whitespace-nowrap text-sm sm:text-base px-6 py-3.5 shadow-none">
                  Resume Session <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        ) : (
          /* Suggested topic */
          <div>
            {/* Active Workspace Structural Header */}
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b" style={{ borderColor: "var(--border-dim)" }}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--terra)]" />
                <span className="text-xs font-bold tracking-wider uppercase text-[var(--terra)] font-mono">
                  Active Articulation Workspace
                </span>
              </div>
              <div className="text-xs font-medium text-[var(--text-mute)] hidden sm:block">
                15m Research · 90s Vocal Articulation
              </div>
            </div>

            {/* Metadata and Unified Focus Trigger */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="tag font-bold font-mono text-xs px-2.5 py-1 inline-flex items-center gap-1.5"
                  style={{
                    backgroundColor: `${catColor}15`,
                    color: catColor,
                    border: `1px solid ${catColor}35`,
                  }}
                >
                  <CategoryIcon category={heroCat} size={13} />
                  <span>{heroCat}</span>
                </span>
                <span className="tag tag-olive font-mono text-xs px-2.5 py-1">
                  {DIFFICULTY_LABELS[suggestedTopic.difficulty as Difficulty]?.icon ?? "I"}{" "}
                  {suggestedTopic.difficulty}
                </span>
                <span className="tag tag-gold font-mono text-xs px-2.5 py-1">
                  +{DIFFICULTY_XP[suggestedTopic.difficulty as Difficulty] ?? 150} XP
                  {DIFFICULTY_BONUS_XP[suggestedTopic.difficulty as Difficulty] > 0 && (
                    <span className="ml-1 opacity-70">
                      (+{DIFFICULTY_BONUS_XP[suggestedTopic.difficulty as Difficulty]} bonus)
                    </span>
                  )}
                </span>
              </div>

              {/* Single, purposeful Focus selector pill */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowFocusModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all surface hover:border-[var(--olive-br)] hover:bg-[var(--bg-input)]/50 cursor-pointer border"
                  style={{
                    borderColor: focusCategory ? catColor : "var(--border)",
                    backgroundColor: focusCategory ? `${catColor}12` : undefined,
                  }}
                  title="Select or focus specific categories"
                >
                  <FeyLogo size={14} spinning={spinning} />
                  <span style={{ color: focusCategory ? catColor : "var(--text)" }}>
                    {focusCategory ? `Focus: ${focusCategory}` : "All Disciplines"}
                  </span>
                  <span className="text-[10px] opacity-60">▾</span>
                </button>

                {focusCategory && (
                  <button
                    type="button"
                    onClick={() => handleSelectFocus(null)}
                    className="text-xs font-mono text-[var(--text-mute)] hover:text-[var(--terra)] transition-colors px-1"
                    title="Reset focus to all categories"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Accepted Challenge Banner from Landing Page */}
            {pendingTopic && suggestedTopic.id === pendingTopic.id && (
              <div
                className="mb-4 p-3.5 rounded-2xl border-[1.5px] flex items-center justify-between gap-3 flex-wrap"
                style={{
                  background: "rgba(122, 28, 46, 0.05)",
                  borderColor: "var(--terra)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--terra)]/15 border border-[var(--terra)]/30 shrink-0">
                    <Target size={16} className="text-[var(--terra)]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--terra)]">
                      Your Accepted Challenge
                    </div>
                    <div className="text-xs text-[var(--text-dim)]">
                      You accepted this topic from the parlor roulette. Ready to articulate?
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingTopic(null)}
                  className="text-xs font-semibold underline underline-offset-4 cursor-pointer text-[var(--text-mute)]"
                >
                  Clear & use today&apos;s daily topic
                </button>
              </div>
            )}

            {/* Queued Yesterday Banner (Next-Day Return Commitment Fulfilled) */}
            {nextQueuedItem &&
              isScheduledForToday &&
              suggestedTopic.id === nextQueuedItem.topic.id && (
                <div
                  className="mb-4 p-4 rounded-2xl border-[1.5px] flex items-center justify-between gap-3 flex-wrap"
                  style={{
                    background: "rgba(122, 28, 46, 0.06)",
                    borderColor: "var(--terra)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--terra)]/15 border border-[var(--terra)]/30 shrink-0">
                      <Calendar size={17} className="text-[var(--terra)]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--terra)]">
                        Welcome Back, {profile.username || "Scholar"} · Your Scheduled Topic is Ready
                      </div>
                      <div className="text-xs text-[var(--text-dim)]">
                        You planned this <strong>{nextQueuedItem.topic.difficulty}</strong> topic for today in your 7-Day Schedule. Keep your commitment and start now.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStartSuggested}
                      className="btn-terra px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Start Scheduled Topic</span>
                      <ArrowRight size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeScheduledTopic(nextQueuedItem.date);
                        setQueuedTomorrowTopic(null);
                      }}
                      className="text-xs font-semibold underline underline-offset-4 cursor-pointer text-[var(--text-mute)] px-2"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

            {/* ── Difficulty Mode Toggle ── */}
            <div className="flex items-center gap-1.5 mb-4">
              {(["Novice", "Scholar", "Expert"] as Difficulty[]).map((mode) => {
                const isActive = difficultyMode === mode;
                const meta = DIFFICULTY_LABELS[mode];
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => updateSettings({ difficultyMode: mode })}
                    title={meta.description}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border"
                    style={{
                      borderColor: isActive ? "var(--terra)" : "var(--border)",
                      backgroundColor: isActive ? "var(--terra)" : "var(--bg-card)",
                      color: isActive ? "#FFFFFF" : "var(--text-dim)",
                    }}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>

            {/* The Question in classic editorial typography with subtle Fey spin state */}
            {spinning ? (
              <div className="py-6 my-2 flex items-center gap-3">
                <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                  <FeyLogo size={24} spinning={true} />
                </div>
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[var(--gold)] font-bold animate-pulse block">
                    Consulting Scholarship...
                  </span>
                  <span className="text-xs text-[var(--text-mute)] font-serif italic">
                    Selecting your daily articulation challenge
                  </span>
                </div>
              </div>
            ) : (
              <p
                className="font-serif font-bold mb-3 tracking-tight text-[var(--text)] transition-all duration-300"
                style={{
                  fontSize: "clamp(1.5rem, 3.2vw, 2.25rem)",
                  lineHeight: 1.25,
                  maxWidth: "52ch",
                  fontFamily: "var(--font-serif), 'Lora', Georgia, serif",
                }}
              >
                {suggestedTopic.text}
              </p>
            )}

            {/* Feynman challenge prompt */}
            <p
              className="text-sm sm:text-base font-serif italic mb-6 max-w-2xl leading-relaxed text-[var(--text-dim)]"
              style={{ fontFamily: "var(--font-serif), 'Lora', Georgia, serif" }}
            >
              Can you break down the essential concepts of this topic and articulate them simply in your own voice under 90 seconds?
            </p>

            {/* Action Bar — Signature Solid Maroon Anchor Block */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2.5 sm:gap-3 pt-4 border-t" style={{ borderColor: "var(--border-dim)" }}>
              <button
                onClick={handleStartSuggested}
                className="btn-terra w-full sm:w-auto whitespace-nowrap shrink-0 text-sm sm:text-base font-bold px-6 py-3.5 shadow-none"
              >
                <span>
                  {nextQueuedItem &&
                  nextQueuedItem.date <= todayIso &&
                  suggestedTopic.id === nextQueuedItem.topic.id
                    ? "Start Scheduled Topic (15m)"
                    : "Begin Research (15m)"}
                </span>
                <ArrowRight size={16} className="shrink-0" />
              </button>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleStartImpromptu}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-base)] text-xs font-semibold text-[var(--text)] whitespace-nowrap transition-colors cursor-pointer"
                  title="Already know the concept? Skip research and articulate immediately"
                >
                  <Zap size={14} className="text-[var(--gold)] shrink-0" />
                  <span>Impromptu (90s)</span>
                </button>

                <button
                  onClick={handleSkipTopic}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] hover:bg-[var(--bg-card)] text-xs font-semibold text-[var(--text-dim)] hover:text-[var(--text)] whitespace-nowrap transition-colors cursor-pointer"
                  title="Pick another question from your preferences"
                >
                  <Shuffle size={14} className="shrink-0" />
                  <span>Next Topic</span>
                </button>
              </div>

              {!upcomingScheduled.some((s) => s.topic.id === suggestedTopic.id) &&
                upcomingScheduled.length < 7 && (
                  <button
                    type="button"
                    onClick={() => {
                      queueTopicNextAvailableDay(suggestedTopic);
                    }}
                    className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[var(--olive)]/40 bg-[var(--bg-card)] hover:border-[var(--olive)] text-xs font-semibold text-[var(--olive)] whitespace-nowrap transition-colors cursor-pointer"
                    title="Add this question to your next open day in your 7-Day Study Schedule"
                  >
                    <Calendar size={14} className="shrink-0" />
                    <span>
                      {upcomingScheduled.length === 0
                        ? "Queue for Tomorrow"
                        : `Schedule Next Day (${upcomingScheduled.length}/7)`}
                    </span>
                  </button>
                )}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Next-Day Scheduled Topic Login Reminder Modal ── */}
      <AnimatePresence>
        {!activeSession &&
          nextQueuedItem &&
          nextQueuedItem.date <= todayIso &&
          !dismissedTomorrowModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDismissedTomorrowModal(true)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs"
            >
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 14 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 14 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg rounded-3xl p-6 sm:p-7 border-[1.5px] surface-raised shadow-2xl"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--terra)",
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--terra)]/10 border border-[var(--terra)]/30 text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--terra)]">
                    <Calendar size={13} />
                    <span>Scheduled for Today · Ready</span>
                  </div>
                  <span className="tag tag-olive text-[11px] font-mono">
                    {nextQueuedItem.topic.difficulty} Level
                  </span>
                </div>

                <h3 className="font-serif font-bold text-xl sm:text-2xl mb-1.5" style={{ color: "var(--text)" }}>
                  Welcome back, {profile.username || "Scholar"}!
                </h3>
                <p className="text-xs sm:text-sm mb-4 leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  You picked this <strong>{nextQueuedItem.topic.category}</strong> topic in your 7-Day Study Schedule for today. Ready to follow through?
                </p>

                <div
                  className="rounded-2xl p-4 sm:p-5 border mb-5"
                  style={{
                    background: "var(--bg-panel)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--olive)] mb-1">
                    {nextQueuedItem.topic.category} · +{DIFFICULTY_XP[nextQueuedItem.topic.difficulty as Difficulty] ?? 150} XP
                  </div>
                  <p className="font-serif font-bold text-base sm:text-lg leading-snug" style={{ color: "var(--text)" }}>
                    {nextQueuedItem.topic.text}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const t = nextQueuedItem.topic;
                      setDismissedTomorrowModal(true);
                      removeScheduledTopic(nextQueuedItem.date);
                      const id = startSession(t, settings.researchMin);
                      router.push(`/session/${id}`);
                    }}
                    className="btn-terra flex-1 py-3.5 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Start Scheduled Topic (15m)</span>
                    <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const t = nextQueuedItem.topic;
                      setDismissedTomorrowModal(true);
                      removeScheduledTopic(nextQueuedItem.date);
                      const id = startSession(t, 0, "speaking");
                      router.push(`/session/${id}`);
                    }}
                    className="py-3.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] hover:border-[var(--olive)] text-xs sm:text-sm font-semibold text-[var(--text)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Zap size={14} className="text-[var(--gold)]" />
                    <span>Impromptu (90s)</span>
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs flex-wrap gap-2" style={{ borderColor: "var(--border-dim)" }}>
                  <button
                    type="button"
                    onClick={() => setDismissedTomorrowModal(true)}
                    className="font-medium text-[var(--text-dim)] hover:text-[var(--text)] cursor-pointer"
                  >
                    Keep on dashboard for later today
                  </button>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/library?tab=schedule"
                      onClick={() => setDismissedTomorrowModal(true)}
                      className="font-medium text-[var(--olive)] hover:underline"
                    >
                      View 7-Day Schedule
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDismissedTomorrowModal(true);
                        removeScheduledTopic(nextQueuedItem.date);
                      }}
                      className="font-medium text-[var(--text-mute)] hover:text-[var(--red)] cursor-pointer"
                    >
                      Clear slot
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* ── Day 0 Orientation Guide: Distinct Background Rhythm ── */}
      {sessions.length === 0 && (
        <motion.div
          variants={cardVariants}
          className="rounded-2xl p-6 mb-6 border-[1.5px] bg-[var(--bg-panel)]/35"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold text-[var(--olive)] block mb-1">
                The Feynman Ritual
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold" style={{ color: "var(--text)" }}>
                How your articulation practice works
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-dim)]">
              First Sprint
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-3.5 pt-1">
            <div className="p-4 rounded-xl border-[1.5px] bg-[var(--bg-card)]" style={{ borderColor: "var(--border)" }}>
              <div className="text-xs font-bold mb-1.5 flex items-center gap-2 text-[var(--terra)]">
                <span>01</span>
                <span>Deep Research (15m)</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-dim)]">
                Read the prompt, outline core tenets in the distraction-free editor, and organize key analogies without rote memorization.
              </p>
            </div>

            <div className="p-4 rounded-xl border-[1.5px] bg-[var(--bg-card)]" style={{ borderColor: "var(--border)" }}>
              <div className="text-xs font-bold mb-1.5 flex items-center gap-2 text-[var(--olive)]">
                <span>02</span>
                <span>Vocal Synthesis (90s)</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-dim)]">
                Explain the concept aloud under pressure using real microphone capture. Listen back, re-record if needed, and refine your delivery.
              </p>
            </div>

            <div className="p-4 rounded-xl border-[1.5px] bg-[var(--bg-card)]" style={{ borderColor: "var(--border)" }}>
              <div className="text-xs font-bold mb-1.5 flex items-center gap-2 text-[var(--gold)]">
                <span>03</span>
                <span>Reflect & Expand</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-dim)]">
                Rate your understanding. Each completed sprint unlocks new nodes on your interactive Constellation Graph and lights up your activity ledger.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Daily Vows (3 Daily Quests) ── */}
      <motion.div
        variants={cardVariants}
        className="surface rounded-2xl p-5 mb-6 border-[1.5px]"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ScrollText size={16} className="text-[var(--olive)]" />
            <span className="font-serif font-bold text-sm sm:text-base text-[var(--text)]">
              Daily Vows & Quests
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[var(--bg-input)] text-[var(--text-dim)] border border-[var(--border-dim)]">
              Resets at midnight
            </span>
          </div>

          <div className="text-xs font-semibold text-[var(--text-dim)]">
            {dailyQuests.filter((q) => q.completed).length}/{dailyQuests.length} Fulfilled
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {dailyQuests.map((quest) => {
            const isDone = quest.completed;
            const isClaimed = quest.claimed;

            return (
              <div
                key={quest.id}
                className="p-3.5 rounded-xl border-[1.5px] flex flex-col justify-between transition-all"
                style={{
                  background: isClaimed
                    ? "var(--bg-input)/30"
                    : isDone
                    ? "rgba(166, 124, 30, 0.08)"
                    : "var(--bg-card)",
                  borderColor: isDone ? "var(--gold)" : "var(--border)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center border border-[var(--border)] bg-[var(--bg-input)]/40">
                      {quest.key === "daily-speech" && <Mic size={14} className="text-[var(--terra)]" />}
                      {quest.key === "vocal-conviction" && <Zap size={14} className="text-[var(--gold)]" />}
                      {quest.key === "clarity-mastery" && <CheckCircle2 size={14} className="text-[var(--olive)]" />}
                      {!["daily-speech", "vocal-conviction", "clarity-mastery"].includes(quest.key) && <Sparkles size={14} className="text-[var(--olive)]" />}
                    </div>
                    <span className="tag tag-gold font-mono text-[10px] px-1.5 py-0.5">
                      +{quest.rewardXP} XP
                    </span>
                  </div>
                  <div className="text-xs font-serif font-bold mb-1" style={{ color: "var(--text)" }}>
                    {quest.title}
                  </div>
                  <p className="text-[11px] leading-relaxed mb-3 text-[var(--text-dim)]">
                    {quest.description}
                  </p>
                </div>

                {/* Status & Claim Button */}
                <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: "var(--border-dim)" }}>
                  <span className="text-xs font-mono text-[var(--text-mute)]">
                    {quest.current}/{quest.target} {quest.key === "vocal-conviction" ? "sec" : "done"}
                  </span>

                  {isClaimed ? (
                    <span className="text-xs font-bold text-[var(--olive-br)] flex items-center gap-1">
                      ✓ Claimed
                    </span>
                  ) : isDone ? (
                    <button
                      type="button"
                      onClick={() => {
                        claimQuestXP(quest.id, quest.rewardXP);
                      }}
                      className="px-2.5 py-1 rounded-md text-xs font-bold text-white transition-all shadow-none hover:opacity-90 cursor-pointer"
                      style={{ background: "var(--gold)" }}
                    >
                      Claim +{quest.rewardXP} XP
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-[var(--text-mute)]">In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Consolidated Scholar Ledger ── */}
      <motion.div
        variants={cardVariants}
        className="surface rounded-2xl p-4 md:p-5 mb-6 border-[1.5px]"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
          <div className="px-4 py-2 text-left">
            <span className="text-xs font-semibold text-[var(--text-dim)] block mb-1.5">
              Completed Sprints
            </span>
            <span className="font-mono text-2xl font-bold" style={{ color: "var(--text)" }}>
              {sessions.length}
            </span>
            <span className="text-xs text-[var(--text-mute)] block mt-0.5">
              sessions recorded
            </span>
          </div>

          <div className="px-4 py-2 text-left">
            <span className="text-xs font-semibold text-[var(--text-dim)] block mb-1.5">
              Deep Research
            </span>
            <span className="font-mono text-2xl font-bold" style={{ color: "var(--text)" }}>
              {totalResearchMin >= 60
                ? `${Math.floor(totalResearchMin / 60)}h ${totalResearchMin % 60}m`
                : `${totalResearchMin}m`}
            </span>
            <span className="text-xs text-[var(--text-mute)] block mt-0.5">
              reading & notes
            </span>
          </div>

          <div className="px-4 py-2 text-left">
            <span className="text-xs font-semibold text-[var(--text-dim)] block mb-1.5">
              Vocal Synthesis
            </span>
            <span className="font-mono text-2xl font-bold" style={{ color: "var(--text)" }}>
              {Math.round(totalSpeakSec / 60)}m
            </span>
            <span className="text-xs text-[var(--text-mute)] block mt-0.5">
              spoken articulation
            </span>
          </div>

          <div className="px-4 py-2 text-left">
            <span className="text-xs font-semibold text-[var(--text-dim)] block mb-1.5">
              Scholarly XP
            </span>
            <span className="font-mono text-2xl font-bold" style={{ color: "var(--gold)" }}>
              {profile.xp.toLocaleString()}
            </span>
            <span className="text-xs text-[var(--text-mute)] block mt-0.5">
              {level.title}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Day 0 Milestone Tracker vs. Active Activity Heatmap ── */}
      {activityDates.size === 0 ? (
        <motion.div
          variants={cardVariants}
          className="surface rounded-2xl p-6 mb-6 border-[1.5px] text-center py-8"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-input)]/40">
            <Compass size={24} className="text-[var(--olive)] opacity-70" />
          </div>
          <h4 className="font-serif font-bold text-base mb-1" style={{ color: "var(--text)" }}>
            Your Consistency Ledger & Heatmap
          </h4>
          <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: "var(--text-dim)" }}>
            Complete your first 90-second voice sprint above to activate your daily habit streak, light up your Constellation graph, and record your vocal progress.
          </p>
        </motion.div>
      ) : (
        /* Active Scholar: Genuine Activity Heatmap & Weekly Rhythm */
        <div className="grid lg:grid-cols-3 gap-3 mb-6">
          <motion.div
            variants={cardVariants}
            className="lg:col-span-2 surface rounded-2xl p-5 border-[1.5px]"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif font-semibold text-sm" style={{ color: "var(--text)" }}>
                Scholarly Consistency
              </span>
              <span className="text-xs font-mono font-medium" style={{ color: "var(--text-mute)" }}>
                {activityDates.size} active {activityDates.size === 1 ? "day" : "days"}
              </span>
            </div>
            <ActivityHeatmap researchDates={researchDates} gameDates={gameDates} />
            <div className="flex flex-wrap items-center justify-end gap-3 mt-3 text-[10px] font-mono font-semibold" style={{ color: "var(--text-mute)" }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: "var(--terra)" }} />
                <span>Research Challenge</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: "var(--olive)" }} />
                <span>Games</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-[2px]"
                  style={{ background: "linear-gradient(135deg, var(--terra) 50%, var(--olive) 50%)" }}
                />
                <span>Both</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="surface rounded-2xl p-5 border-[1.5px]"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="font-serif font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>
              This Week
            </div>
            <WeeklyBars sessions={sessions} />

            <div className="mt-5 pt-4" style={{ borderTop: "1.5px solid var(--border-dim)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-medium" style={{ color: "var(--text-mute)" }}>Level {level.level}</span>
                {nextLevel && (
                  <span className="text-xs font-mono font-medium" style={{ color: "var(--text-mute)" }}>→ Lv {level.level + 1}</span>
                )}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden border border-[var(--border-dim)]" style={{ background: "var(--bg-input)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--gold)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                />
              </div>
              <div className="text-xs font-mono font-semibold mt-1.5" style={{ color: "var(--text-dim)" }}>{level.title}</div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Recent sessions + Achievements ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent sessions */}
        <motion.div
          variants={cardVariants}
          className="surface rounded-2xl p-5 border-[1.5px]"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-serif font-semibold text-sm" style={{ color: "var(--text)" }}>
              Recent Sprints
            </span>
            <Link href="/library">
              <span className="text-xs font-semibold hover:underline cursor-pointer" style={{ color: "var(--terra)" }}>
                View in Library →
              </span>
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-11 h-11 rounded-xl mx-auto mb-2.5 flex items-center justify-center border border-[var(--border)] bg-[var(--bg-input)]/30">
                <Mic size={20} className="text-[var(--olive)] opacity-60" />
              </div>
              <p className="font-serif text-sm italic" style={{ color: "var(--text-dim)" }}>
                No speeches recorded yet.
              </p>
              <p className="text-xs font-medium mt-1" style={{ color: "var(--text-mute)" }}>
                Complete today&apos;s topic above to record your first synthesis.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {recentSessions.map((s, i) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 py-3"
                  style={{
                    borderBottom: i < recentSessions.length - 1 ? "1px solid var(--border-dim)" : "none",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                    style={{
                      background: `${CATEGORY_COLORS[s.category] || "var(--bg-input)"}15`,
                      border: `1px solid ${CATEGORY_COLORS[s.category] || "var(--border)"}35`
                    }}
                  >
                    <CategoryIcon category={s.category} size={14} style={{ color: CATEGORY_COLORS[s.category] || "var(--olive)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-serif font-medium leading-snug truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {s.topicText}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono text-[var(--text-mute)]">{relativeDate(s.date)}</span>
                      <span className="text-[var(--text-mute)] text-[10px]">·</span>
                      <span className="tag tag-gold font-mono" style={{ fontSize: "10px", padding: "1px 5px" }}>
                        +{s.xpEarned} XP
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={10}
                        className={i <= s.ratings.confidence ? "" : "opacity-15"}
                        style={{ color: i <= s.ratings.confidence ? "var(--gold)" : "var(--text-mute)" }}
                        fill={i <= s.ratings.confidence ? "var(--gold)" : "none"}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Achievements */}
        <motion.div
          variants={cardVariants}
          className="surface rounded-2xl p-5 border-[1.5px]"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-serif font-semibold text-sm" style={{ color: "var(--text)" }}>
              Scholarly Milestones
            </span>
            <span className="text-xs font-mono font-medium" style={{ color: "var(--text-mute)" }}>
              {profile.unlockedAchievements.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ACHIEVEMENTS.slice(0, 9).map((ach) => {
              const unlocked = profile.unlockedAchievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  title={`${ach.title}: ${ach.description}`}
                  className="rounded-xl p-2.5 text-center transition-all"
                  style={{
                    background: unlocked ? "rgba(92,106,54,0.06)" : "var(--bg-input)/35",
                    border: `1.5px solid ${unlocked ? "rgba(68,78,44,0.28)" : "var(--border-dim)"}`,
                    opacity: unlocked ? 1 : 0.45,
                    filter: unlocked ? "none" : "grayscale(1)",
                  }}
                >
                  <div className="text-xl mb-1">{ach.icon}</div>
                  <div
                    className="text-[10px] font-semibold leading-tight truncate"
                    style={{ color: unlocked ? "var(--text)" : "var(--text-mute)" }}
                  >
                    {ach.title}
                  </div>
                </div>
              );
            })}
          </div>
          {profile.unlockedAchievements.length === 0 && (
            <p className="mt-3 text-xs text-center" style={{ color: "var(--text-mute)" }}>
              Complete sessions to unlock your first achievement.
            </p>
          )}
        </motion.div>
      </div>

          {/* ── Tabbed Footer Companion Callout ── */}
          {activeParlorCount > 0 && (
            <motion.div
              variants={cardVariants}
              className="mt-6 p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 flex-wrap surface"
              style={{ borderColor: "var(--border-dim)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--bg-input)]/50 shrink-0">
                  <Gamepad2 size={20} className="text-[var(--gold)]" />
                </div>
                <div>
                  <div className="font-serif font-bold text-sm" style={{ color: "var(--text)" }}>
                    Want to practice with peers?
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-dim)" }}>
                    Head to The Parlor for party slides, multiplayer word guessing, speed trivia & mental math.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("parlor")}
                className="btn-terra !text-xs !py-2 !px-3.5 flex items-center gap-1 cursor-pointer font-mono"
              >
                <span>Enter The Parlor</span>
                <ChevronRight size={13} />
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Topic Focus Modal */}
      <FocusCategoryModal
        isOpen={showFocusModal}
        onClose={() => setShowFocusModal(false)}
        activeFocus={focusCategory}
        onSelectFocus={handleSelectFocus}
      />

      {/* Streak Calendar & Loss Aversion Modal */}
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
            researchDates={researchDates}
            gameDates={gameDates}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
