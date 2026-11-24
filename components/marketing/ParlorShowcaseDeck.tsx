"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Users,
  Brain,
  Calculator,
  MessagesSquare,
  Presentation,
  Compass,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Check,
  X,
  RotateCcw,
} from "lucide-react";

interface MiniQuizQuestion {
  badge: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const MINI_TASTE_TESTS: Record<string, MiniQuizQuestion[]> = {
  trivia: [
    {
      badge: "Live Naija Trivia Sample",
      question: "Which Nigerian author won the 2006 Orange Prize for Fiction for her novel 'Half of a Yellow Sun'?",
      options: ["Buchi Emecheta", "Chimamanda Ngozi Adichie", "Flora Nwapa", "Sefi Atta"],
      correctIndex: 1,
      explanation: "Chimamanda Ngozi Adichie won the Orange Prize in 2007 for Half of a Yellow Sun, chronicling the Biafran War.",
    },
    {
      badge: "Live Naija Trivia Sample",
      question: "What sits at the confluence of the Niger and Benue rivers in central Nigeria?",
      options: ["Makurdi", "Onitsha", "Lokoja", "Calabar"],
      correctIndex: 2,
      explanation: "Lokoja, the capital of Kogi State, lies directly at the confluence of the Niger and Benue rivers.",
    },
    {
      badge: "Live Naija Trivia Sample",
      question: "In economics, what term describes a market structure with a single buyer controlling demand?",
      options: ["Oligopoly", "Monopsony", "Monopoly", "Cartel"],
      correctIndex: 1,
      explanation: "While a monopoly has one seller, a monopsony has a single buyer dominating the market.",
    },
  ],
  mathletics: [
    {
      badge: "25s Quant Mental Shortcut",
      question: "Shortcut check: What is 25 × 36 in your head?",
      options: ["850", "900", "925", "960"],
      correctIndex: 1,
      explanation: "Since 25 = 100 ÷ 4, divide 36 by 4 to get 9, then multiply by 100 → 900 in 2 seconds!",
    },
    {
      badge: "25s Quant Mental Shortcut",
      question: "If a startup's revenue grows by 20% and then drops by 20%, what is the net change?",
      options: ["0% (Break even)", "-2%", "-4%", "+4%"],
      correctIndex: 2,
      explanation: "1.20 × 0.80 = 0.96, which is a 4% net decrease.",
    },
    {
      badge: "25s Quant Mental Shortcut",
      question: "What is 15% of 160?",
      options: ["22", "24", "26", "28"],
      correctIndex: 1,
      explanation: "10% of 160 is 16, and half of that (5%) is 8. 16 + 8 = 24.",
    },
  ],
};

export interface ParlorItem {
  id: string;
  tabLabel: string;
  badge: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  tags: string[];
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  image: string;
  urlPath: string;
  stat: string;
}

export const PARLOR_EXPERIENCES: ParlorItem[] = [
  {
    id: "daily-speaking",
    tabLabel: "90s Speaking",
    badge: "Core Daily Habit",
    title: "90-Second Speaking Challenge",
    description:
      "Pick a curated prompt across AI, economics, philosophy, or product. Jot your angle, then articulate it out loud in 90 seconds using the Feynman Technique.",
    href: "/discover",
    cta: "Start Speaking",
    accent: "var(--terra)",
    accentBg: "rgba(122, 28, 46, 0.08)",
    accentBorder: "rgba(122, 28, 46, 0.28)",
    tags: ["Feynman Technique", "Solo Habit", "1,000+ Topics"],
    Icon: Mic,
    image: "/showcase/discover-preview.png?v=classroom2",
    urlPath: "fey.lokinlabs.com.ng/discover",
    stat: "1,000+ Topics · Timed Research · Solo Habit",
  },
  {
    id: "friend-classrooms",
    tabLabel: "Classroom",
    badge: "Learn Together",
    title: "Friend Classrooms",
    description:
      "Start a 3, 5, or 7-day Classroom with 2–8 close friends—or invite them to your 7-day study schedule. Record your 90-second take to unlock everyone else's voice, swap unstarted topics, and add new topics anytime.",
    href: "/classroom",
    cta: "Enter Classroom",
    accent: "var(--olive)",
    accentBg: "rgba(68, 78, 44, 0.09)",
    accentBorder: "rgba(68, 78, 44, 0.28)",
    tags: ["Speak-to-Unlock", "7-Day Schedule", "Friend Circles"],
    Icon: Users,
    image: "/showcase/classroom-preview.png?v=classroom2",
    urlPath: "fey.lokinlabs.com.ng/classroom",
    stat: "Speak-to-Unlock Audio · 7-Day Schedule · Recordings Vault",
  },
  {
    id: "trivia",
    tabLabel: "Naija Trivia",
    badge: "Smart Game",
    title: "Naija Trivia Arcade",
    description:
      "Test your knowledge across 1,000+ curated questions on Nigerian history, culture, and general knowledge. Challenge friends head-to-head on the exact same deck.",
    href: "/games/trivia",
    cta: "Play Trivia",
    accent: "var(--olive)",
    accentBg: "rgba(68, 78, 44, 0.09)",
    accentBorder: "rgba(68, 78, 44, 0.28)",
    tags: ["1,000+ Questions", "1v1 Challenges", "Leaderboard"],
    Icon: Brain,
    image: "/showcase/trivia-preview.png?v=classroom2",
    urlPath: "fey.lokinlabs.com.ng/games/trivia",
    stat: "1,000+ Questions · 1v1 Challenge Links · Leaderboard",
  },
  {
    id: "mathletics",
    tabLabel: "Quant",
    badge: "Speed Arena",
    title: "Quant Mental Arena",
    description:
      "25-second rapid mental math and quantitative reasoning duels. Spot the Socratic shortcut across algebra, probability, and geometry before time expires.",
    href: "/games/mathletics",
    cta: "Play Quant",
    accent: "var(--olive)",
    accentBg: "rgba(68, 78, 44, 0.09)",
    accentBorder: "rgba(68, 78, 44, 0.28)",
    tags: ["25s Clock", "Mental Math", "Titans Leaderboard"],
    Icon: Calculator,
    image: "/showcase/mathletics-preview.png?v=classroom2",
    urlPath: "fey.lokinlabs.com.ng/games/mathletics",
    stat: "25s Rapid Duels · 6 Categories · Titans Rankings",
  },
  {
    id: "articulate",
    tabLabel: "Articulate",
    badge: "Party Game",
    title: "Online Articulate",
    description:
      "The fast-paced word description game for teams. Describe words without saying forbidden terms while the timer ticks down and an AI referee enforces rules.",
    href: "/play",
    cta: "Play Articulate",
    accent: "var(--terra)",
    accentBg: "rgba(122, 28, 46, 0.08)",
    accentBorder: "rgba(122, 28, 46, 0.28)",
    tags: ["Team Party", "Word Game", "AI Referee"],
    Icon: MessagesSquare,
    image: "/showcase/articulate-preview.png?v=classroom2",
    urlPath: "fey.lokinlabs.com.ng/play",
    stat: "Speech Recognition · AI Referee · Party Turns",
  },
  {
    id: "podium",
    tabLabel: "The Podium",
    badge: "Presentation Game",
    title: "The Podium",
    description:
      "Spin a spicy hot-take topic, jot your angle, and let AI build a bold 5-slide deck in seconds. Present your case to the room and share the deck via link.",
    href: "/podium",
    cta: "Play The Podium",
    accent: "var(--gold)",
    accentBg: "rgba(166, 124, 30, 0.10)",
    accentBorder: "rgba(166, 124, 30, 0.32)",
    tags: ["Hot Takes", "AI Slide Decks", "Party Night"],
    Icon: Presentation,
    image: "/showcase/podium-preview.png?v=classroom2",
    urlPath: "fey.lokinlabs.com.ng/podium",
    stat: "60+ Hot Takes · 5-Slide AI Decks · Presenter Mode",
  },
  {
    id: "constellation",
    tabLabel: "Constellation",
    badge: "Knowledge Atlas",
    title: "Knowledge Constellation",
    description:
      "Every topic you articulate is mapped into an interactive graph showing how disciplines connect and recommending adjacent ideas to explore next.",
    href: "/constellation",
    cta: "Explore Map",
    accent: "var(--gold)",
    accentBg: "rgba(166, 124, 30, 0.10)",
    accentBorder: "rgba(166, 124, 30, 0.32)",
    tags: ["Interactive Graph", "Topical Proximity", "Growth Map"],
    Icon: Compass,
    image: "/showcase/constellation-preview.png?v=classroom2",
    urlPath: "fey.lokinlabs.com.ng/constellation",
    stat: "Topical Proximity Canvas · Suns, Moons & Stars · Graph Map",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 320, damping: 32 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 30 : -30,
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 320, damping: 32 },
      opacity: { duration: 0.18 },
    },
  }),
};

export default function ParlorShowcaseDeck() {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [quizIndexMap, setQuizIndexMap] = useState<Record<string, number>>({});
  const [selectedAnsMap, setSelectedAnsMap] = useState<Record<string, number | null>>({});

  const total = PARLOR_EXPERIENCES.length;
  const currentIndex = ((page % total) + total) % total;
  const currentItem = PARLOR_EXPERIENCES[currentIndex];
  const miniList = MINI_TASTE_TESTS[currentItem.id];
  const currentQIdx = (quizIndexMap[currentItem.id] ?? 0) % (miniList?.length || 1);
  const activeMiniQuiz = miniList ? miniList[currentQIdx] : null;
  const activeAnswerKey = `${currentItem.id}-${currentQIdx}`;
  const selectedAns = selectedAnsMap[activeAnswerKey] ?? null;

  const handleNextMiniQuestion = () => {
    setQuizIndexMap((prev) => ({
      ...prev,
      [currentItem.id]: (prev[currentItem.id] ?? 0) + 1,
    }));
  };

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
    },
    []
  );

  const setIndex = (targetIndex: number) => {
    const diff = targetIndex - currentIndex;
    if (diff === 0) return;
    setPage([page + diff, diff > 0 ? 1 : -1]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) paginate(1);
      else paginate(-1);
    }
    setTouchStart(null);
  };

  const CurrentIcon = currentItem.Icon;

  return (
    <div className="w-full">
      {/* ── Top Category Switcher Tabs ── */}
      <div className="relative mb-6 w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar w-full min-w-0">
          {PARLOR_EXPERIENCES.map((item, idx) => {
            const isActive = idx === currentIndex;
            const TabIcon = item.Icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(idx)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0"
                style={{
                  background: isActive ? item.accentBg : "var(--bg-card)",
                  color: isActive ? item.accent : "var(--text-dim)",
                  border: isActive
                    ? `1.5px solid ${item.accentBorder}`
                    : "1px solid var(--border)",
                  boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
                }}
              >
                <TabIcon size={14} />
                <span>{item.tabLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── The Slideshow Card with Real In-App Preview ── */}
      <div
        className="relative overflow-hidden w-full min-w-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="surface rounded-3xl p-5 sm:p-8 shadow-sm w-full max-w-full min-w-0 box-border overflow-hidden"
            style={{
              background: "var(--bg-card)",
              border: `1.5px solid ${currentItem.accentBorder}`,
              borderTop: `5px solid ${currentItem.accent}`,
            }}
          >
            <div className="grid gap-6 lg:grid-cols-12 items-center w-full min-w-0">
              {/* Left Column: Details & Actions */}
              <div className="lg:col-span-5 flex flex-col justify-between w-full min-w-0">
                <div>
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        background: currentItem.accentBg,
                        color: currentItem.accent,
                      }}
                    >
                      <CurrentIcon size={20} />
                    </span>
                    <span
                      className="font-mono text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                      style={{
                        background: currentItem.accentBg,
                        color: currentItem.accent,
                      }}
                    >
                      {currentItem.badge}
                    </span>
                    <span
                      className="text-[11px] font-mono px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(68, 78, 44, 0.06)",
                        color: "var(--text-mute)",
                      }}
                    >
                      {currentIndex + 1} of {total}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-3 tracking-tight break-words">
                    {currentItem.title}
                  </h3>

                  <p
                    className="text-sm leading-relaxed mb-5 break-words"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {currentItem.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {currentItem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono px-2.5 py-1 rounded-md"
                        style={{
                          background: "var(--bg-panel)",
                          color: "var(--text-dim)",
                          border: "1px solid var(--border-dim)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Interactive 1-Question Taste Test (Trivia & Quant) */}
                  {activeMiniQuiz && (
                    <div
                      className="mb-5 p-3.5 rounded-2xl border"
                      style={{
                        background: "var(--bg-base)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="font-mono text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: currentItem.accentBg,
                            color: currentItem.accent,
                          }}
                        >
                          {activeMiniQuiz.badge}
                        </span>
                        <button
                          type="button"
                          onClick={handleNextMiniQuestion}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold hover:underline cursor-pointer"
                          style={{ color: "var(--olive)" }}
                        >
                          <RotateCcw size={11} />
                          <span>New Question</span>
                        </button>
                      </div>

                      <p
                        className="font-serif font-bold text-xs sm:text-sm leading-snug mb-2.5"
                        style={{ color: "var(--text)" }}
                      >
                        {activeMiniQuiz.question}
                      </p>

                      <div className="grid grid-cols-2 gap-1.5">
                        {activeMiniQuiz.options.map((opt, idx) => {
                          const isAnswered = selectedAns !== null;
                          const isSelected = selectedAns === idx;
                          const isCorrect = idx === activeMiniQuiz.correctIndex;

                          let borderColor = "var(--border-dim)";
                          let bg = "var(--bg-card)";
                          let textColor = "var(--text)";

                          if (isAnswered) {
                            if (isCorrect) {
                              borderColor = "var(--olive)";
                              bg = "rgba(68, 78, 44, 0.12)";
                              textColor = "var(--olive)";
                            } else if (isSelected && !isCorrect) {
                              borderColor = "var(--terra)";
                              bg = "rgba(122, 28, 46, 0.08)";
                              textColor = "var(--terra)";
                            }
                          }

                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                setSelectedAnsMap((prev) => ({
                                  ...prev,
                                  [activeAnswerKey]: idx,
                                }))
                              }
                              className="px-2.5 py-2 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-1.5 cursor-pointer"
                              style={{
                                borderColor,
                                background: bg,
                                color: textColor,
                              }}
                            >
                              <span className="truncate">{opt}</span>
                              {isAnswered && isCorrect && (
                                <Check size={13} className="shrink-0" />
                              )}
                              {isAnswered && isSelected && !isCorrect && (
                                <X size={13} className="shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {selectedAns !== null && (
                        <p
                          className="mt-2.5 text-[11px] leading-relaxed pt-2 border-t"
                          style={{
                            borderColor: "var(--border-dim)",
                            color: "var(--text-dim)",
                          }}
                        >
                          <strong
                            style={{
                              color:
                                selectedAns === activeMiniQuiz.correctIndex
                                  ? "var(--olive)"
                                  : "var(--terra)",
                            }}
                          >
                            {selectedAns === activeMiniQuiz.correctIndex
                              ? "Spot on! "
                              : "Not quite — "}
                          </strong>
                          {activeMiniQuiz.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link
                    href={currentItem.href}
                    className="btn-terra py-3 px-5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>{currentItem.cta}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => paginate(1)}
                    className="py-3 px-3.5 rounded-xl text-xs font-semibold border inline-flex items-center gap-1.5 transition-colors hover:bg-[var(--bg-panel)] cursor-pointer"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Right Column: In-App Browser Window Mockup */}
              <div className="lg:col-span-7 w-full min-w-0">
                <div
                  className="rounded-2xl overflow-hidden border shadow-sm flex flex-col surface w-full min-w-0"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--bg-base)",
                  }}
                >
                  {/* Browser Chrome Header */}
                  <div
                    className="px-3 py-2.5 sm:px-3.5 border-b flex items-center justify-between gap-2 min-w-0"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border-dim)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: "var(--terra)" }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: "var(--gold)" }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: "var(--olive)" }}
                      />
                      <span
                        className="ml-1.5 font-mono text-[11px] truncate min-w-0 flex-1"
                        style={{ color: "var(--text-mute)" }}
                      >
                        {currentItem.urlPath}
                      </span>
                    </div>

                    <Link
                      href={currentItem.href}
                      className="text-xs font-bold underline underline-offset-4 shrink-0 inline-flex items-center gap-1"
                      style={{ color: currentItem.accent }}
                    >
                      <span>Open Live</span>
                      <ExternalLink size={11} />
                    </Link>
                  </div>

                  {/* Real Screenshot Preview */}
                  <div className="relative aspect-[1280/820] w-full min-w-0 bg-[var(--bg-base)]">
                    <Image
                      src={currentItem.image}
                      alt={`${currentItem.title} interface screenshot`}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover object-top"
                      priority={currentIndex === 0}
                    />
                  </div>

                  {/* Bottom Info Strip */}
                  <div
                    className="px-3 py-2 sm:px-4 sm:py-2.5 border-t flex items-center justify-between gap-2 text-xs min-w-0"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border-dim)",
                    }}
                  >
                    <span
                      className="font-mono text-[10px] sm:text-[11px] truncate min-w-0 flex-1"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {currentItem.stat}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Slide Navigation Bar (Counter, Dots, Arrows) ── */}
      <div className="flex items-center justify-between gap-3 mt-5 px-1 w-full min-w-0">
        {/* Slide Counter */}
        <div
          className="font-mono text-xs font-medium"
          style={{ color: "var(--text-mute)" }}
        >
          <span className="font-bold" style={{ color: "var(--text)" }}>
            0{currentIndex + 1}
          </span>{" "}
          / 0{total}
        </div>

        {/* Indicator Dots */}
        <div className="flex items-center gap-1.5">
          {PARLOR_EXPERIENCES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className="h-2 rounded-full transition-all cursor-pointer"
              style={{
                width: idx === currentIndex ? "24px" : "8px",
                background:
                  idx === currentIndex
                    ? currentItem.accent
                    : "rgba(68, 78, 44, 0.2)",
              }}
            />
          ))}
        </div>

        {/* Flip Controls: Previous & Next */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => paginate(-1)}
            aria-label="Previous experience"
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:bg-[var(--bg-card)] hover:border-[var(--olive)] cursor-pointer"
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => paginate(1)}
            aria-label="Next experience"
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:bg-[var(--bg-card)] hover:border-[var(--olive)] cursor-pointer"
            style={{
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
