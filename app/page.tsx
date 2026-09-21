"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap, BookOpen, Mic, ArrowRight,
  Star, Shuffle, Sparkles, Compass
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getLevelForXP, getLevelProgress, getNextLevel, ACHIEVEMENTS } from "@/lib/achievements";
import { CATEGORY_COLORS, CATEGORY_ICONS, TOPIC_BANK, DIFFICULTY_LABELS, DIFFICULTY_XP, DIFFICULTY_BONUS_XP, type Difficulty } from "@/lib/topics";
import { relativeDate, getLast52Weeks, getDayOfWeek } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import FeyLogo from "@/components/ui/FeyLogo";
import FocusCategoryModal from "@/components/dashboard/FocusCategoryModal";
import UserAvatar from "@/components/ui/UserAvatar";
import { getDailyQuests } from "@/lib/quests";

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
function ActivityHeatmap({ history }: { history: Array<{ date: string; count: number }> }) {
  const allDays = getLast52Weeks();
  const histMap: Record<string, number> = {};
  history.forEach((h) => { histMap[h.date] = h.count; });

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
            {wk.map((day, di) =>
              day === "" ? (
                <div key={di} className="w-[11px] h-[11px]" />
              ) : (
                <div
                  key={di}
                  title={day}
                  className="w-[11px] h-[11px] rounded-[2px] transition-colors"
                  style={{
                    background: !histMap[day]
                      ? "rgba(68,78,44,0.06)"
                      : histMap[day] === 1
                      ? "rgba(68,78,44,0.22)"
                      : histMap[day] === 2
                      ? "rgba(68,78,44,0.55)"
                      : "var(--olive)",
                    opacity: 1,
                  }}
                />
              )
            )}
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

/* ─── Dashboard ──────────────────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const {
    profile,
    streak,
    sessions,
    activeSession,
    settings,
    customTopics,
    startSession,
    claimedQuestIds,
    claimQuestXP,
    updateSettings,
  } = useAppStore();
  const difficultyMode: Difficulty = (settings.difficultyMode as Difficulty) ?? "Scholar";
  const level     = getLevelForXP(profile.xp);
  const nextLevel = getNextLevel(profile.xp);
  const progress  = getLevelProgress(profile.xp);
  const [mounted, setMounted] = useState(false);
  const [skippedToday, setSkippedToday] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [focusCategory, setFocusCategory] = useState<string | null>(null);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [spinOffset, setSpinOffset] = useState(0);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

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

  const suggestedTopic = (() => {
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-8 max-w-5xl"
    >
      {/* ── Editorial Folio Header ── */}
      <motion.div variants={cardVariants} className="mb-8">
        {/* Folio top dateline */}
        <div className="flex items-center justify-between border-b pb-2.5 mb-4" style={{ borderColor: "var(--border-dim)" }}>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--text-mute)" }}>
            <span>Daily Dispatch</span>
            <span>·</span>
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]" style={{ color: "var(--text-mute)" }}>
            <span>Scholar {profile.username}</span>
            <span>·</span>
            <span style={{ color: "var(--olive)" }}>{level.title}</span>
            <span>·</span>
            <span className="flex items-center gap-1 font-semibold" style={{ color: "var(--terra)" }}>
              <span>🔥 {streak.current}d</span>
              {(streak.shields ?? 0) > 0 && (
                <span className="select-none" title={`${streak.shields} Scholar's Seal active`}>🛡️</span>
              )}
            </span>
          </div>
        </div>

        {/* Lead title & Integrated Epigraph */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1
              className="font-serif font-bold leading-tight tracking-tight"
              style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.5rem)", color: "var(--text)" }}
            >
              {streakMessage(streak.current, todayIndex)}
            </h1>
            
            {/* Literary Epigraph (no awkward floating quote box!) */}
            <div
              className="mt-2.5 pl-3.5 border-l-2 text-sm font-serif italic max-w-2xl leading-relaxed"
              style={{
                borderColor: "rgba(122, 28, 46, 0.4)",
                color: "var(--text-dim)",
              }}
            >
              &ldquo;{dailyQuote.quote}&rdquo;
              <span className="ml-2 not-italic font-sans text-[10px] uppercase font-bold tracking-wider" style={{ color: "var(--text-mute)" }}>
                — {dailyQuote.author}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── The Centerpiece: Today's Feynman Inquiry ── */}
      <motion.div
        variants={cardVariants}
        className="surface rounded-2xl p-7 md:p-8 mb-6 border relative overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        {activeSession ? (
          /* Resume in-progress session */
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-olive mb-2 text-label">Session in progress</div>
              <p
                className="font-serif font-bold text-2xl"
                style={{ color: "var(--text)", lineHeight: 1.3, maxWidth: "52ch" }}
              >
                {activeSession.topic.text}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="tag tag-terra capitalize">{activeSession.stage}</span>
                <span
                  className="tag font-bold"
                  style={{
                    backgroundColor: `${catColor}15`,
                    color: catColor,
                    border: `1px solid ${catColor}30`,
                  }}
                >
                  {CATEGORY_ICONS[heroCat]} {heroCat}
                </span>
              </div>
            </div>
            <Link href={`/session/${activeSession.id}`}>
              <button className="btn-terra whitespace-nowrap">
                Resume Session <ArrowRight size={15} />
              </button>
            </Link>
          </div>
        ) : (
          /* Suggested topic */
          <div>
            {/* Metadata and Unified Focus Trigger */}
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="tag font-bold font-mono text-[11px]"
                  style={{
                    backgroundColor: `${catColor}15`,
                    color: catColor,
                    border: `1px solid ${catColor}30`,
                  }}
                >
                  {CATEGORY_ICONS[heroCat]} {heroCat}
                </span>
                <span className="tag tag-olive font-mono text-[11px]">
                  {DIFFICULTY_LABELS[suggestedTopic.difficulty as Difficulty]?.icon ?? "📖"}{" "}
                  {suggestedTopic.difficulty}
                </span>
                <span className="tag tag-gold font-mono text-[11px]">
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
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono transition-all surface hover:border-[var(--olive-br)] hover:bg-[var(--bg-input)]/50 cursor-pointer"
                  style={{
                    borderColor: focusCategory ? catColor : "var(--border-dim)",
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
                    className="text-[11px] font-mono text-[var(--text-mute)] hover:text-[var(--terra)] transition-colors px-1"
                    title="Reset focus to all categories"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

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
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium transition-all border"
                    style={{
                      borderColor: isActive ? "var(--terra)" : "var(--border-dim)",
                      backgroundColor: isActive ? "rgba(122,28,46,0.08)" : "transparent",
                      color: isActive ? "var(--terra)" : "var(--text-mute)",
                    }}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>

            {/* The Question in classic editorial typography */}
            <p
              className={cn(
                "font-serif font-bold mb-3 tracking-tight transition-all duration-300",
                spinning ? "blur-sm scale-[0.99] opacity-50" : ""
              )}
              style={{
                fontSize: "clamp(1.35rem, 2.7vw, 1.85rem)",
                color: "var(--text)",
                lineHeight: 1.3,
                maxWidth: "54ch",
              }}
            >
              {spinning ? "Consulting scholarship..." : suggestedTopic.text}
            </p>

            {/* Feynman challenge prompt */}
            <p
              className="text-sm font-serif italic mb-6 max-w-2xl leading-relaxed"
              style={{ color: "var(--text-dim)" }}
            >
              Can you break down the essential concepts of this topic and articulate them simply in your own voice under 90 seconds?
            </p>

            {/* Action Bar */}
            <div className="flex items-center gap-3 pt-3 border-t flex-wrap" style={{ borderColor: "var(--border-dim)" }}>
              <button onClick={handleStartSuggested} className="btn-terra">
                Begin Research (15m) <ArrowRight size={15} />
              </button>

              <button
                onClick={handleStartImpromptu}
                className="btn-ghost text-xs flex items-center gap-1.5 cursor-pointer font-mono"
                title="Already know the concept? Skip research and articulate immediately"
              >
                <Zap size={13} style={{ color: "var(--gold)" }} /> Impromptu Speech (90s)
              </button>

              <button
                onClick={handleSkipTopic}
                className="btn-ghost text-xs cursor-pointer font-mono"
                title="Pick another question from your preferences"
              >
                <Shuffle size={13} /> Next Topic
              </button>

              <div className="ml-auto text-[11px] font-mono hidden md:flex items-center gap-2" style={{ color: "var(--text-mute)" }}>
                <span>15m Notes</span>
                <span>·</span>
                <span>90s Vocal Articulation</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Daily Vows (Duolingo Habit Engine: 3 Daily Quests) ── */}
      <motion.div
        variants={cardVariants}
        className="surface rounded-xl p-5 mb-6 border"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">📜</span>
            <span className="font-serif font-semibold text-sm" style={{ color: "var(--text)" }}>
              Daily Vows & Quests
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--bg-input)]/50" style={{ color: "var(--text-mute)" }}>
              Resets at midnight
            </span>
          </div>

          <div className="text-xs font-mono" style={{ color: "var(--text-mute)" }}>
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
                className="p-3.5 rounded-xl border flex flex-col justify-between transition-all"
                style={{
                  background: isClaimed
                    ? "var(--bg-input)/20"
                    : isDone
                    ? "rgba(166, 124, 30, 0.08)"
                    : "var(--bg-card)",
                  borderColor: isDone ? "var(--gold)" : "var(--border-dim)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-lg select-none">{quest.icon}</span>
                    <span className="tag tag-gold font-mono text-[10px] px-1.5 py-0.5">
                      +{quest.rewardXP} XP
                    </span>
                  </div>
                  <div className="text-xs font-serif font-bold mb-1" style={{ color: "var(--text)" }}>
                    {quest.title}
                  </div>
                  <p className="text-[11px] leading-relaxed mb-3" style={{ color: "var(--text-dim)" }}>
                    {quest.description}
                  </p>
                </div>

                {/* Status & Claim Button */}
                <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: "var(--border-dim)" }}>
                  <span className="font-mono text-[10px]" style={{ color: "var(--text-mute)" }}>
                    {quest.current}/{quest.target} {quest.key === "vocal-conviction" ? "sec" : "done"}
                  </span>

                  {isClaimed ? (
                    <span className="text-[11px] font-mono text-[var(--olive-br)] font-bold flex items-center gap-1">
                      ✓ Claimed
                    </span>
                  ) : isDone ? (
                    <button
                      type="button"
                      onClick={() => {
                        claimQuestXP(quest.id, quest.rewardXP);
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold text-white transition-all shadow-sm hover:scale-105 cursor-pointer"
                      style={{ background: "var(--gold)" }}
                    >
                      Claim +{quest.rewardXP} XP
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-[var(--text-mute)]">In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Consolidated Scholar Ledger (Replaces 4 isolated SaaS cards) ── */}
      <motion.div
        variants={cardVariants}
        className="surface rounded-xl p-4 md:p-5 mb-6 border"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border-dim)]">
          <div className="px-4 py-2 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-mute)] block mb-1">
              Completed Sprints
            </span>
            <span className="font-mono text-2xl font-bold" style={{ color: "var(--text)" }}>
              {sessions.length}
            </span>
            <span className="text-[11px] font-mono text-[var(--text-mute)] block mt-0.5">
              sessions recorded
            </span>
          </div>

          <div className="px-4 py-2 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-mute)] block mb-1">
              Deep Research
            </span>
            <span className="font-mono text-2xl font-bold" style={{ color: "var(--text)" }}>
              {totalResearchMin >= 60
                ? `${Math.floor(totalResearchMin / 60)}h ${totalResearchMin % 60}m`
                : `${totalResearchMin}m`}
            </span>
            <span className="text-[11px] font-mono text-[var(--text-mute)] block mt-0.5">
              reading & notes
            </span>
          </div>

          <div className="px-4 py-2 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-mute)] block mb-1">
              Vocal Synthesis
            </span>
            <span className="font-mono text-2xl font-bold" style={{ color: "var(--text)" }}>
              {Math.round(totalSpeakSec / 60)}m
            </span>
            <span className="text-[11px] font-mono text-[var(--text-mute)] block mt-0.5">
              spoken articulation
            </span>
          </div>

          <div className="px-4 py-2 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-mute)] block mb-1">
              Scholarly XP
            </span>
            <span className="font-mono text-2xl font-bold" style={{ color: "var(--gold)" }}>
              {profile.xp.toLocaleString()}
            </span>
            <span className="text-[11px] font-mono text-[var(--text-mute)] block mt-0.5">
              {level.title}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Day 0 Orientation vs. Active Scholar Activity ── */}
      {sessions.length === 0 ? (
        /* Day 0: Thoughtful onboarding orientation guide */
        <motion.div
          variants={cardVariants}
          className="surface rounded-xl p-6 mb-6 border"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold block mb-0.5" style={{ color: "var(--olive)" }}>
                The Feynman Ritual
              </span>
              <h3 className="font-serif text-lg font-semibold" style={{ color: "var(--text)" }}>
                How your articulation practice works
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-input)]/50" style={{ color: "var(--text-mute)" }}>
              First Sprint
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-lg border" style={{ background: "var(--bg-input)/20", borderColor: "var(--border-dim)" }}>
              <div className="font-mono text-xs font-bold mb-1.5" style={{ color: "var(--terra)" }}>
                01 / Deep Research (15m)
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                Read the prompt, outline core tenets in the distraction-free editor, and organize key analogies without rote memorization.
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{ background: "var(--bg-input)/20", borderColor: "var(--border-dim)" }}>
              <div className="font-mono text-xs font-bold mb-1.5" style={{ color: "var(--olive)" }}>
                02 / Vocal Synthesis (90s)
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                Explain the concept aloud under pressure using real microphone capture. Listen back, re-record if needed, and refine your delivery.
              </p>
            </div>

            <div className="p-4 rounded-lg border" style={{ background: "var(--bg-input)/20", borderColor: "var(--border-dim)" }}>
              <div className="font-mono text-xs font-bold mb-1.5" style={{ color: "var(--gold)" }}>
                03 / Reflect & Expand
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                Rate your understanding. Each completed sprint unlocks new nodes on your interactive Constellation Graph and lights up your activity ledger.
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Active Scholar: Genuine Activity Heatmap & Weekly Rhythm */
        <div className="grid lg:grid-cols-3 gap-3 mb-6">
          <motion.div
            variants={cardVariants}
            className="lg:col-span-2 surface rounded-xl p-5 border"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif font-semibold text-sm" style={{ color: "var(--text)" }}>
                Scholarly Consistency
              </span>
              <span className="text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>
                {sessions.length} sessions this year
              </span>
            </div>
            <ActivityHeatmap history={history} />
            <div className="flex items-center justify-end gap-1.5 mt-3">
              <span className="text-[10px] font-mono" style={{ color: "var(--text-mute)" }}>Less</span>
              {[0.4, 0.55, 0.75, 1].map((op, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-[2px]"
                  style={{ background: `var(--olive)`, opacity: op }}
                />
              ))}
              <span className="text-[10px] font-mono" style={{ color: "var(--text-mute)" }}>More</span>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="surface rounded-xl p-5 border"
            style={{ borderColor: "var(--border-dim)" }}
          >
            <div className="font-serif font-semibold text-sm mb-4" style={{ color: "var(--text)" }}>
              This Week
            </div>
            <WeeklyBars sessions={sessions} />

            <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border-dim)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>Level {level.level}</span>
                {nextLevel && (
                  <span className="text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>→ Lv {level.level + 1}</span>
                )}
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-input)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--gold)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                />
              </div>
              <div className="text-[11px] font-mono mt-1.5" style={{ color: "var(--text-mute)" }}>{level.title}</div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Recent sessions + Achievements ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent sessions */}
        <motion.div
          variants={cardVariants}
          className="surface rounded-xl p-5 border"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-serif font-semibold text-sm" style={{ color: "var(--text)" }}>
              Recent Sprints
            </span>
            <Link href="/library">
              <span className="text-xs font-mono hover:underline cursor-pointer" style={{ color: "var(--terra)" }}>
                View in Library →
              </span>
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-3xl mb-2 opacity-35">🎙️</div>
              <p className="font-serif text-sm italic" style={{ color: "var(--text-dim)" }}>
                No speeches recorded yet.
              </p>
              <p className="text-xs font-mono mt-1" style={{ color: "var(--text-mute)" }}>
                Complete today&apos;s inquiry above to record your first synthesis.
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
                      border: `1px solid ${CATEGORY_COLORS[s.category] || "var(--border-dim)"}30`
                    }}
                  >
                    {CATEGORY_ICONS[s.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-serif font-medium leading-snug truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {s.topicText}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>{relativeDate(s.date)}</span>
                      <span style={{ color: "var(--text-mute)", fontSize: "10px" }}>·</span>
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
          className="surface rounded-xl p-5 border"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-serif font-semibold text-sm" style={{ color: "var(--text)" }}>
              Scholarly Milestones
            </span>
            <span className="text-xs font-mono" style={{ color: "var(--text-mute)" }}>
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
                  className="rounded-lg p-2.5 text-center transition-all"
                  style={{
                    background: unlocked ? "rgba(92,106,54,0.06)" : "var(--bg-input)/35",
                    border: `1px solid ${unlocked ? "rgba(68,78,44,0.2)" : "transparent"}`,
                    opacity: unlocked ? 1 : 0.4,
                    filter: unlocked ? "none" : "grayscale(1)",
                  }}
                >
                  <div className="text-xl mb-1">{ach.icon}</div>
                  <div
                    className="text-[10px] font-medium leading-tight truncate"
                    style={{ color: unlocked ? "var(--text)" : "var(--text-mute)" }}
                  >
                    {ach.title}
                  </div>
                </div>
              );
            })}
          </div>
          {profile.unlockedAchievements.length === 0 && (
            <p className="mt-3 text-xs font-mono text-center" style={{ color: "var(--text-mute)" }}>
              Complete sessions to unlock your first achievement.
            </p>
          )}
        </motion.div>
      </div>

      {/* Topic Focus Modal */}
      <FocusCategoryModal
        isOpen={showFocusModal}
        onClose={() => setShowFocusModal(false)}
        activeFocus={focusCategory}
        onSelectFocus={handleSelectFocus}
      />
    </motion.div>
  );
}
