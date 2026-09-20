"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Flame, Zap, BookOpen, Mic, ArrowRight,
  Star, ChevronRight, Shuffle, Trophy
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getLevelForXP, getLevelProgress, getNextLevel, ACHIEVEMENTS } from "@/lib/achievements";
import { CATEGORY_COLORS, CATEGORY_ICONS, TOPIC_BANK } from "@/lib/topics";
import { relativeDate, getLast52Weeks, getDayOfWeek } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import FeyLogo from "@/components/ui/FeyLogo";

const DAYS_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ─── Motivational copy & Wisdom Library ─────────────────────────── */
const HABIT_PROMPTS = [
  "You're building a habit.",
  "Consistency beats intensity.",
  "Small efforts compound quickly.",
  "One day at a time.",
  "Focus on progress, not perfection.",
  "Curiosity has its own reason for existing.",
  "Thinking deeper is a super power.",
  "Make learning a daily ritual.",
  "Quiet progress is still progress.",
  "Keep your mind active and open.",
  "Your future self will thank you.",
  "Feed your mind daily.",
  "Great thinkers are lifelong learners.",
  "Stay curious, keep seeking.",
  "Build the discipline of learning.",
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
  { quote: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
  { quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { quote: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
  { quote: "The beautiful thing about learning is nobody can take it away from you.", author: "B.B. King" },
  { quote: "It is the mark of an educated mind to be able to entertain a thought without accepting it.", author: "Aristotle" },
  { quote: "Curiosity is the wick in the candle of learning.", author: "William Arthur Ward" },
  { quote: "Doubt is the origin of wisdom.", author: "René Descartes" },
  { quote: "Wonder is the beginning of wisdom.", author: "Socrates" },
  { quote: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
  { quote: "By three methods we may learn wisdom: First, by reflection, which is noblest; Second, by imitation, which is easiest; and third by experience, which is the bitterest.", author: "Confucius" },
  { quote: "Knowledge has to be improved, challenged, and increased constantly, or it vanishes.", author: "Peter Drucker" },
  { quote: "The important thing is not to stop questioning.", author: "Albert Einstein" },
  { quote: "There is no end to education. The whole of life is a process of learning.", author: "Jiddu Krishnamurti" },
  { quote: "An unexamined life is not worth living.", author: "Socrates" },
  { quote: "Nature has written her laws in the language of mathematics.", author: "Galileo Galilei" },
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
          <span className="text-[9px]" style={{ color: "var(--text-mute)" }}>{d.label}</span>
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

/* ─── Dashboard ──────────────────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const { profile, streak, sessions, activeSession, settings, startSession } = useAppStore();
  const level     = getLevelForXP(profile.xp);
  const nextLevel = getNextLevel(profile.xp);
  const progress  = getLevelProgress(profile.xp);
  const [mounted, setMounted] = useState(false);
  const [skippedToday, setSkippedToday] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  /* ── Stats ── */
  const totalResearchMin = sessions.reduce((a, s) => a + s.researchMinutes, 0);
  const totalSpeakSec    = sessions.reduce((a, s) => a + s.speakingSeconds, 0);
  const recentSessions   = sessions.slice(0, 4);
  const histMap: Record<string, number> = {};
  sessions.forEach((s) => { histMap[s.date] = (histMap[s.date] ?? 0) + 1; });
  const history = Object.entries(histMap).map(([date, count]) => ({ date, count }));

  /* ── Smart topic suggestion ──────────────────────────────────────────────
     Rules (in priority order):
     1. Never show a topic the user has already completed
     2. Prefer the user's enabled categories
     3. Stable across the day — same topic until midnight or user skips
     4. If all topics in enabled categories are done, open to all categories
  ── */
  const completedTopicIds = new Set(sessions.map((s) => s.topicId));

  // Deterministic daily seed: changes at midnight, stable on refresh
  const todayIndex = (() => {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  })();

  const suggestedTopic = (() => {
    const excluded = new Set([...completedTopicIds, ...skippedToday]);

    // Pool 1: enabled categories, not done, not skipped
    let pool = TOPIC_BANK.filter(
      (t) => settings.enabledCategories.includes(t.category) && !excluded.has(t.id)
    );

    // Pool 2: fallback — any category not done
    if (pool.length === 0) {
      pool = TOPIC_BANK.filter((t) => !excluded.has(t.id));
    }

    // Pool 3: everything (user has done every topic — reset skips but keep completed filter)
    if (pool.length === 0) {
      pool = TOPIC_BANK.filter((t) => !completedTopicIds.has(t.id));
    }

    // Final fallback — everything (user has completed every topic)
    if (pool.length === 0) pool = TOPIC_BANK;

    // Stable pick for the day using seeded index
    return pool[todayIndex % pool.length];
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
      setSpinning(false);
    }, 1000);
  }

  const dailyQuote = DAILY_QUOTES[todayIndex % DAILY_QUOTES.length];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-8 max-w-5xl"
    >

      {/* ── Page heading ── */}
      <motion.div
        variants={cardVariants}
        className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="text-label mb-2">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1
            className="font-space font-extrabold leading-tight text-display"
            style={{ fontSize: "2.4rem", color: "var(--text)" }}
          >
            {streakMessage(streak.current, todayIndex)}
          </h1>
        </div>

        {/* Daily Wisdom / Quote */}
        <div className="max-w-sm md:max-w-md bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-dim)] self-start md:self-auto shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          {/* Elegant quote mark background */}
          <div className="absolute -top-1 -left-1 text-7xl font-serif text-[var(--olive-dim)]/30 pointer-events-none select-none">
            “
          </div>
          <p className="text-sm font-serif leading-relaxed relative z-10 pl-2 pr-1" style={{ color: "var(--text)" }}>
            {dailyQuote.quote}
          </p>
          <p className="text-[10px] uppercase tracking-widest font-bold mt-3 text-right" style={{ color: "var(--text-mute)" }}>
            — {dailyQuote.author}
          </p>
        </div>
      </motion.div>

      {/* ── Hero: Today's Challenge ── */}
      {(() => {
        const heroCat = activeSession ? activeSession.topic.category : suggestedTopic.category;
        const catColor = CATEGORY_COLORS[heroCat] || "var(--terra)";
        
        return (
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(92,106,54,0.06)" }}
            className="surface rounded-2xl p-7 mb-5"
          >
            {activeSession ? (
              /* Resume in-progress session */
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-olive mb-2 text-label">Session in progress</div>
                  <p
                    className="font-space font-bold text-display"
                    style={{ fontSize: "1.35rem", color: "var(--text)", lineHeight: 1.25, maxWidth: "52ch" }}
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
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="text-olive mb-3 text-label">Today's suggested topic</div>
                  <p
                    className={cn(
                      "font-space font-bold mb-6 text-display transition-all duration-300",
                      spinning ? "blur-sm scale-[0.99] opacity-50" : ""
                    )}
                    style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.75rem)", color: "var(--text)", lineHeight: 1.25, maxWidth: "52ch" }}
                  >
                    {spinning ? "Accessing neural data core..." : suggestedTopic.text}
                  </p>

                  <div className="flex items-center gap-4 flex-wrap">
                    <button onClick={handleStartSuggested} className="btn-terra">
                      Begin Research <ArrowRight size={15} />
                    </button>
                    <button onClick={handleSkipTopic} className="btn-ghost">
                      <Shuffle size={13} /> Pick a different topic
                    </button>
                    <div className="flex items-center gap-2 ml-auto">
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
                      <span className="tag tag-olive capitalize">{suggestedTopic.difficulty}</span>
                      <span className="tag tag-gold">+{suggestedTopic.difficulty === "beginner" ? 100 : suggestedTopic.difficulty === "intermediate" ? 150 : 200} XP</span>
                    </div>
                  </div>
                </div>

                {/* Animated Logo neural spinner */}
                <div className="flex flex-col items-center gap-2 shrink-0 self-center">
                  <button
                    disabled={spinning}
                    onClick={handleSkipTopic}
                    className="relative group w-20 h-20 rounded-2xl flex items-center justify-center border transition-all duration-300 hover:border-[var(--gold)]"
                    style={{
                      background: "var(--bg-input)",
                      borderColor: "var(--border-dim)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)"
                    }}
                    title="Click to spin a different topic"
                  >
                    {spinning && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-dashed border-[var(--gold)]"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    <FeyLogo size={46} spinning={spinning} />
                  </button>
                  <span className="text-[9px] uppercase tracking-[0.15em] font-mono" style={{ color: "var(--text-mute)" }}>
                    {spinning ? "Spinning..." : "Click to Spin"}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* ── Stat row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          {
            value: sessions.length.toString(),
            label: "Sessions",
            icon: <BookOpen size={13} style={{ color: "var(--olive)" }} />,
          },
          {
            value: totalResearchMin >= 60
              ? `${Math.floor(totalResearchMin / 60)}h ${totalResearchMin % 60}m`
              : `${totalResearchMin}m`,
            label: "Research",
            icon: <BookOpen size={13} style={{ color: "var(--terra)" }} />,
          },
          {
            value: `${Math.round(totalSpeakSec / 60)}m`,
            label: "Speaking",
            icon: <Mic size={13} style={{ color: "var(--olive-br)" }} />,
          },
          {
            value: profile.xp.toLocaleString(),
            label: "Total XP",
            icon: <Zap size={13} style={{ color: "var(--gold)" }} />,
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 24px rgba(92,106,54,0.05)" }}
            className="surface rounded-xl p-4"
          >
            <div className="flex items-center gap-1.5 mb-2">
              {s.icon}
              <span className="text-label">{s.label}</span>
            </div>
            <div
              className="font-mono font-semibold"
              style={{ fontSize: "2rem", color: "var(--text)", lineHeight: 1 }}
            >
              {s.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Activity + weekly ── */}
      <div className="grid lg:grid-cols-3 gap-3 mb-5">
        {/* Heatmap */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, scale: 1.005, boxShadow: "0 10px 24px rgba(92,106,54,0.04)" }}
          className="lg:col-span-2 surface rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-heading" style={{ fontSize: "0.9rem" }}>Activity</span>
            <span className="text-label">{sessions.length} sessions this year</span>
          </div>
          <ActivityHeatmap history={history} />
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

        {/* Weekly bars */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, scale: 1.005, boxShadow: "0 10px 24px rgba(92,106,54,0.04)" }}
          className="surface rounded-xl p-5"
        >
          <div className="text-heading mb-4" style={{ fontSize: "0.9rem" }}>This week</div>
          <WeeklyBars sessions={sessions} />

          {/* XP progress to next level */}
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--olive-dim)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-label">Level {level.level}</span>
              {nextLevel && <span className="text-label">→ Lv {level.level + 1}</span>}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--olive-dim)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "var(--gold)" }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              />
            </div>
            <div className="text-label mt-1.5">{level.title}</div>
          </div>
        </motion.div>
      </div>

      {/* ── Recent sessions + Achievements ── */}
      <div className="grid lg:grid-cols-2 gap-3">

        {/* Recent sessions */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3, scale: 1.005, boxShadow: "0 10px 24px rgba(92,106,54,0.04)" }}
          className="surface rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-heading" style={{ fontSize: "0.9rem" }}>Recent sessions</span>
            <Link href="/analytics">
              <span className="text-label hover:underline cursor-pointer" style={{ color: "var(--olive-text)" }}>
                View all
              </span>
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-4xl mb-3 opacity-30">📖</div>
              <p style={{ color: "var(--text-mute)", fontSize: "13px" }}>
                No sessions yet. Complete your first above.
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
                      className="text-sm font-medium leading-snug truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {s.topicText}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-label">{relativeDate(s.date)}</span>
                      <span style={{ color: "var(--text-mute)", fontSize: "10px" }}>·</span>
                      <span className="tag tag-gold" style={{ fontSize: "10px", padding: "1px 5px" }}>
                        +{s.xpEarned} XP
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={9}
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
          whileHover={{ y: -3, scale: 1.005, boxShadow: "0 10px 24px rgba(92,106,54,0.04)" }}
          className="surface rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-heading" style={{ fontSize: "0.9rem" }}>Achievements</span>
            <span className="text-label">
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
                    background: unlocked ? "rgba(92,106,54,0.05)" : "var(--bg-input)",
                    border: `1px solid ${unlocked ? "var(--olive-dim)" : "transparent"}`,
                    opacity: unlocked ? 1 : 0.35,
                    filter: unlocked ? "none" : "grayscale(1)",
                  }}
                >
                  <div className="text-xl mb-1">{ach.icon}</div>
                  <div
                    className="text-[10px] font-medium leading-tight"
                    style={{ color: unlocked ? "var(--text)" : "var(--text-mute)" }}
                  >
                    {ach.title}
                  </div>
                </div>
              );
            })}
          </div>
          {profile.unlockedAchievements.length === 0 && (
            <p className="mt-3 text-label text-center">
              Complete sessions to unlock achievements.
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
