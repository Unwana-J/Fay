/**
 * Reusable Landing Page View for Fey.
 *
 * Rendered both at `/about` (always) and at `/` for search engines, AI crawlers,
 * and first-time un-onboarded visitors. When `onStartClick` is provided (on `/`),
 * clicking "Start Today's Topic" triggers the onboarding modal directly.
 */

import Image from "next/image";
import Link from "next/link";
import {
  Compass, Zap, Mic, Share2, Flame, Briefcase, Heart, GraduationCap,
  Users, Brain, MessagesSquare, Presentation, Timer, ArrowRight, BookOpen,
} from "lucide-react";
import FeyLogo from "@/components/ui/FeyLogo";
import {
  SITE_TAGLINE, SITE_FAQ, AUDIENCES, HOW_IT_WORKS,
} from "@/lib/seo";
import JsonLd, { faqJsonLd, gamesJsonLd } from "@/components/seo/JsonLd";

const QUICK_STRIP = [
  {
    step: "01",
    title: "Pick a topic or game",
    detail: "Daily 90s speaking topic, trivia, or party game",
    Icon: Compass,
  },
  {
    step: "02",
    title: "Think fast",
    detail: "Synthesize your angle before the clock runs down",
    Icon: Zap,
  },
  {
    step: "03",
    title: "Speak or answer",
    detail: "Explain in your own voice or lock in your answer",
    Icon: Mic,
  },
  {
    step: "04",
    title: "Share your score",
    detail: "Send a challenge link or score card to friends",
    Icon: Share2,
  },
];

const FEATURED_CARDS = [
  {
    id: "daily-speaking",
    badge: "Core Daily Habit",
    title: "90-Second Speaking Challenge",
    description:
      "Pick a curated topic across AI, economics, philosophy, or product. Jot your notes, then explain it out loud in 90 seconds using the Feynman Technique.",
    href: "/discover",
    cta: "Start Speaking",
    accent: "var(--terra)",
    accentBg: "rgba(122, 28, 46, 0.08)",
    accentBorder: "rgba(122, 28, 46, 0.28)",
    tags: ["Feynman Technique", "Solo Habit", "1,000+ Topics"],
    Icon: Mic,
  },
  {
    id: "community-salons",
    badge: "Learn Together",
    title: "Community Salons",
    description:
      "Open a room with a shareable link. Everyone records a timed explanation on the same topic, listens back to each voice, and votes on the clearest thinker.",
    href: "/community",
    cta: "Enter Salons",
    accent: "var(--olive)",
    accentBg: "rgba(68, 78, 44, 0.09)",
    accentBorder: "rgba(68, 78, 44, 0.28)",
    tags: ["Multiplayer", "Voice Rooms", "Peer Voting"],
    Icon: Users,
  },
  {
    id: "trivia",
    badge: "Smart Game",
    title: "Naija Trivia Arcade",
    description:
      "Test your knowledge across 1,000+ curated questions on Nigerian history, pop culture, and general knowledge. Challenge friends head-to-head on the exact same deck.",
    href: "/games/trivia",
    cta: "Play Trivia",
    accent: "var(--olive)",
    accentBg: "rgba(68, 78, 44, 0.09)",
    accentBorder: "rgba(68, 78, 44, 0.28)",
    tags: ["1,000+ Questions", "1v1 Challenges", "Leaderboard"],
    Icon: Brain,
  },
  {
    id: "articulate",
    badge: "Party Game",
    title: "Online Articulate",
    description:
      "The fast-paced word description game for teams. Describe words without saying the forbidden terms while the timer ticks down and an AI referee keeps score.",
    href: "/play",
    cta: "Play Articulate",
    accent: "var(--terra)",
    accentBg: "rgba(122, 28, 46, 0.08)",
    accentBorder: "rgba(122, 28, 46, 0.28)",
    tags: ["Team Party", "Word Game", "AI Referee"],
    Icon: MessagesSquare,
  },
  {
    id: "podium",
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
  },
  {
    id: "constellation",
    badge: "Personal Library",
    title: "Knowledge Constellation",
    description:
      "Every topic you articulate is mapped into an interactive graph showing how disciplines connect and recommending adjacent ideas to explore next.",
    href: "/constellation",
    cta: "Explore Map",
    accent: "var(--gold)",
    accentBg: "rgba(166, 124, 30, 0.10)",
    accentBorder: "rgba(166, 124, 30, 0.32)",
    tags: ["Knowledge Graph", "Streaks", "Audio Archive"],
    Icon: BookOpen,
  },
];

const AUDIENCE_ICONS = [Briefcase, GraduationCap, Heart, Users];

const SHOWCASE_CATEGORIES = [
  "Artificial Intelligence", "Product Management", "Economics", "Philosophy", "History",
  "Psychology", "Science", "Finance", "Startups", "Design", "Politics", "Medicine",
  "Marketing", "Culture", "Software Engineering", "Personal Finance",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--olive-br)" }}>
      {children}
    </p>
  );
}

export default function LandingPageView({
  onStartClick,
}: {
  onStartClick?: () => void;
}) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: "var(--bg-base)", color: "var(--text)" }}>
      <JsonLd data={faqJsonLd()} />
      <JsonLd data={gamesJsonLd()} />

      {/* ── Top Bar ── */}
      <nav
        className="sticky top-0 z-30 backdrop-blur-md border-b"
        style={{ background: "rgba(244,239,230,0.92)", borderColor: "var(--border-dim)" }}
        aria-label="Main"
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" style={{ color: "var(--olive)" }}>
            <FeyLogo size={30} />
            <span className="font-serif text-xl font-bold" style={{ color: "var(--text)" }}>Fey</span>
          </Link>
          <div className="flex items-center gap-5 sm:gap-8 text-sm font-medium" style={{ color: "var(--text-dim)" }}>
            <Link href="/discover" className="hover:text-[var(--olive)] transition-colors hidden sm:inline">
              Daily Habit
            </Link>
            <Link href="/games" className="hover:text-[var(--olive)] transition-colors">
              Games
            </Link>
            <a href="#why-fey" className="hover:text-[var(--olive)] transition-colors">
              About
            </a>
            <Link href="/games" className="btn-terra !px-4 !py-2 !text-sm">
              Play Now
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero: Daily Learning & Speaking Habit First ── */}
      <header className="max-w-6xl mx-auto px-5 pt-12 pb-12 sm:pt-16 sm:pb-16 grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
        <div>
          <SectionLabel>{SITE_TAGLINE}</SectionLabel>
          <h1 className="font-serif text-[2.5rem] leading-[1.08] sm:text-[3.5rem] font-bold tracking-tight mb-6">
            A curated new way to learn, think deeper, and speak clearly.
          </h1>
          <p className="text-lg leading-relaxed max-w-xl mb-8" style={{ color: "var(--text-dim)" }}>
            Discover topics you would never encounter in your everyday routine, packaged into a focused 10-minute daily
            habit. Research a fresh idea, articulate it out loud in 90 seconds, or jump into smart games with friends.
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            {onStartClick ? (
              <button type="button" onClick={onStartClick} className="btn-terra">
                Start Today&apos;s Topic
              </button>
            ) : (
              <Link href="/" className="btn-terra">
                Start Today&apos;s Topic
              </Link>
            )}
            <Link
              href="/games"
              className="px-5 py-3.5 rounded-xl text-sm font-bold border transition-colors hover:bg-[var(--bg-card)]"
              style={{ borderColor: "var(--olive)", color: "var(--olive)" }}
            >
              Explore Games Parlor
            </Link>
          </div>
          <p className="mt-5 text-xs font-mono" style={{ color: "var(--text-mute)" }}>
            Free in your browser · 1,000+ curated topics · Solo &amp; multiplayer
          </p>
        </div>

        {/* Interactive Daily Speaking Sprint preview card */}
        <div className="relative" aria-hidden>
          <div
            className="absolute -inset-4 rounded-[28px] rotate-2"
            style={{ background: "rgba(92,106,54,0.07)", border: "1px solid var(--border-dim)" }}
          />
          <div className="relative surface-hero rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_-20px_rgba(30,34,17,0.25)]">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--text-mute)" }}>
                Daily Speaking Sprint
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "var(--gold-bg)", color: "var(--gold)" }}
              >
                <Flame size={13} /> 12-day streak
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(92,106,54,0.1)", color: "var(--olive)" }}
              >
                Economics
              </span>
              <span
                className="inline-block text-[11px] font-mono px-2.5 py-1 rounded-full"
                style={{ background: "var(--bg-base)", border: "1px solid var(--border-dim)", color: "var(--text-dim)" }}
              >
                Novice Level
              </span>
            </div>
            <p className="font-serif text-2xl sm:text-[1.6rem] font-bold leading-snug mb-7">
              Explain inflation to someone who has never taken an economics class.
            </p>

            <ol className="space-y-2.5 mb-7">
              {[
                { label: "1. Synthesize Notes", detail: "5 min research window", done: true },
                { label: "2. Articulate Out Loud", detail: "90s voice recording", done: false, active: true },
                { label: "3. Listen & Reflect", detail: "Self-rate clarity & save", done: false },
              ].map((s) => (
                <li
                  key={s.label}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                  style={{
                    background: s.active ? "var(--terra-bg)" : "var(--bg-base)",
                    border: `1px solid ${s.active ? "rgba(122,28,46,0.2)" : "var(--border-dim)"}`,
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{
                      background: s.done ? "var(--olive)" : "transparent",
                      border: s.done ? "none" : `1.5px solid ${s.active ? "var(--terra)" : "var(--border)"}`,
                      color: "#fff",
                    }}
                  >
                    {s.done ? "✓" : ""}
                  </span>
                  <span className="text-sm font-semibold flex-1">{s.label}</span>
                  <span className="text-xs" style={{ color: "var(--text-mute)" }}>{s.detail}</span>
                </li>
              ))}
            </ol>

            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "var(--terra)", boxShadow: "0 4px 0 var(--terra-dk)" }}
              >
                <Mic size={20} color="#fff" />
              </div>
              <div className="flex items-end gap-[3px] h-9 flex-1">
                {[30, 55, 40, 75, 50, 90, 65, 45, 80, 35, 60, 85, 50, 70, 40, 55, 30, 65, 45, 25].map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-full"
                    style={{ height: `${h}%`, background: i < 12 ? "var(--olive)" : "var(--olive-dim)" }}
                  />
                ))}
              </div>
              <span className="inline-flex items-center gap-1 font-mono text-sm font-semibold" style={{ color: "var(--olive)" }}>
                <Timer size={14} /> 0:52
              </span>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ── 4-Step Quick Strip: Pick a game → Think fast → Speak or answer → Share your score ── */}
        <section className="border-y" style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)" }}>
          <div className="max-w-6xl mx-auto px-5 py-8">
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_STRIP.map(({ step, title: stTitle, detail, Icon }, idx) => (
                <li
                  key={step}
                  className="surface rounded-2xl p-4 flex items-start gap-3.5 relative"
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(68,78,44,0.1)", color: "var(--olive)" }}
                  >
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-mute)" }}>
                        Step {step}
                      </span>
                      {idx < 3 && (
                        <ArrowRight size={13} className="hidden lg:inline" style={{ color: "var(--text-mute)" }} />
                      )}
                    </div>
                    <h2 className="font-serif text-base font-bold mt-0.5">{stTitle}</h2>
                    <p className="text-xs leading-relaxed mt-0.5" style={{ color: "var(--text-dim)" }}>
                      {detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Colour-Coded Habit & Game Cards (Immediate Action) ── */}
        <section id="experiences" className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <SectionLabel>Daily Habit &amp; The Parlor</SectionLabel>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Start with today&apos;s topic, or jump into a game
              </h2>
            </div>
            <Link
              href="/games"
              className="text-sm font-semibold underline underline-offset-4 shrink-0"
              style={{ color: "var(--olive)" }}
            >
              Open Full Games Hub
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURED_CARDS.map((card) => {
              const Icon = card.Icon;
              return (
                <div
                  key={card.id}
                  className="surface rounded-3xl p-6 flex flex-col justify-between transition-transform hover:-translate-y-0.5"
                  style={{
                    border: `1.5px solid ${card.accentBorder}`,
                    borderTop: `5px solid ${card.accent}`,
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <span
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: card.accentBg, color: card.accent }}
                      >
                        <Icon size={22} />
                      </span>
                      <span
                        className="font-mono text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                        style={{ background: card.accentBg, color: card.accent }}
                      >
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold mb-2.5">{card.title}</h3>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-dim)" }}>
                      {card.description}
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-md"
                          style={{ background: "var(--bg-panel)", color: "var(--text-dim)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={card.href}
                      className="w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center transition-opacity hover:opacity-90"
                      style={{ background: card.accent, color: "#FFFFFF" }}
                    >
                      {card.cta}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Real In-App Screenshots: See What Playing Looks Like ── */}
        <section className="border-y" style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)" }}>
          <div className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
            <div className="max-w-2xl mb-10">
              <SectionLabel>Inside the Parlor</SectionLabel>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">
                See what playing on Fey looks like
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "var(--text-dim)" }}>
                Whether you are competing in a timed Naija Trivia challenge or spinning a spicy hot-take slide deck in
                The Podium, every mode runs right in your browser with zero setup.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Naija Trivia Real Screenshot */}
              <div className="surface rounded-3xl overflow-hidden flex flex-col" style={{ border: "1.5px solid var(--border)" }}>
                <div
                  className="px-4 py-3 border-b flex items-center justify-between"
                  style={{ background: "var(--bg-base)", borderColor: "var(--border-dim)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--terra)" }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--gold)" }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--olive)" }} />
                    <span className="ml-2 font-mono text-xs" style={{ color: "var(--text-mute)" }}>
                      fey.lokinlabs.com.ng/games/trivia
                    </span>
                  </div>
                  <Link
                    href="/games/trivia"
                    className="text-xs font-bold underline underline-offset-4"
                    style={{ color: "var(--olive)" }}
                  >
                    Play Trivia
                  </Link>
                </div>
                <div className="relative aspect-[1280/820] w-full bg-[var(--bg-base)]">
                  <Image
                    src="/showcase/trivia-preview.png"
                    alt="Naija Trivia Arcade interface showing 1v1 challenges, categories, and 1,000+ curated questions"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold">Naija Trivia Arcade</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                      1,000+ questions · 1v1 challenge links · Live Scholar Leaderboard
                    </p>
                  </div>
                  <Link href="/games/trivia" className="btn-terra !px-4 !py-2.5 !text-xs shrink-0">
                    Play Now
                  </Link>
                </div>
              </div>

              {/* The Podium Real Screenshot */}
              <div className="surface rounded-3xl overflow-hidden flex flex-col" style={{ border: "1.5px solid var(--border)" }}>
                <div
                  className="px-4 py-3 border-b flex items-center justify-between"
                  style={{ background: "var(--bg-base)", borderColor: "var(--border-dim)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--terra)" }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--gold)" }} />
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--olive)" }} />
                    <span className="ml-2 font-mono text-xs" style={{ color: "var(--text-mute)" }}>
                      fey.lokinlabs.com.ng/podium
                    </span>
                  </div>
                  <Link
                    href="/podium"
                    className="text-xs font-bold underline underline-offset-4"
                    style={{ color: "var(--gold)" }}
                  >
                    Play Podium
                  </Link>
                </div>
                <div className="relative aspect-[1280/820] w-full bg-[var(--bg-base)]">
                  <Image
                    src="/showcase/podium-preview.png"
                    alt="The Podium party presentation game showing hot-take spinner and AI slide generator"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold">The Podium</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                      60+ hot takes · Instant 5-slide AI decks · Shareable presentation links
                    </p>
                  </div>
                  <Link href="/podium" className="btn-terra !px-4 !py-2.5 !text-xs shrink-0">
                    Spin a Topic
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── The Philosophy (Why Fey Exists) ── */}
        <section id="why-fey" className="max-w-4xl mx-auto px-5 py-16 sm:py-20 text-center scroll-mt-20">
          <SectionLabel>Why Fey</SectionLabel>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-5">
            Reading makes you feel informed. Speaking proves you understand.
          </h2>
          <p className="text-lg leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: "var(--text-dim)" }}>
            It is easy to consume threads, articles, and videos all day and still struggle to explain the core idea
            when someone asks. Fey closes the gap between passive consumption and real mastery—challenging you to step
            into unfamiliar disciplines, synthesize what matters, and articulate it clearly in your own voice.
          </p>

          <div className="surface-olive rounded-3xl px-6 py-8 sm:px-10">
            <SectionLabel>Topic Categories</SectionLabel>
            <h3 className="font-serif text-xl sm:text-2xl font-bold mb-6">
              1,000+ prompts across 23 disciplines
            </h3>
            <ul className="flex flex-wrap justify-center gap-2">
              {SHOWCASE_CATEGORIES.map((c) => (
                <li
                  key={c}
                  className="text-xs sm:text-sm px-3.5 py-1.5 rounded-full"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--olive-text)" }}
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Who It's For + Daily Habit Loop ── */}
        <section id="who" className="max-w-6xl mx-auto px-5 pb-16 sm:pb-20 scroll-mt-20">
          <div className="max-w-2xl mb-10">
            <SectionLabel>Who It&apos;s For</SectionLabel>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Designed for curious minds at every stage
            </h2>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 mb-16">
            {AUDIENCES.map((a, i) => {
              const Icon = AUDIENCE_ICONS[i];
              return (
                <li key={a.who} className="surface rounded-2xl p-6 sm:p-7 flex gap-5" style={{ border: "1px solid var(--border)" }}>
                  <span
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(68,78,44,0.1)", color: "var(--olive)" }}
                  >
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-bold mb-2">{a.who}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>{a.need}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* The 4-stage Feynman daily loop */}
          <div className="surface rounded-3xl p-6 sm:p-10">
            <div className="max-w-2xl mb-8">
              <SectionLabel>The Feynman Loop</SectionLabel>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                How the daily speaking habit works
              </h3>
            </div>
            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {HOW_IT_WORKS.map((s) => (
                <li key={s.step} className="rounded-2xl p-5" style={{ background: "var(--bg-base)", border: "1px solid var(--border-dim)" }}>
                  <span className="font-mono text-xs font-bold" style={{ color: "var(--terra)" }}>
                    STEP {s.step}
                  </span>
                  <h4 className="font-serif text-lg font-bold mt-2 mb-1.5">{s.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── FAQ (Positioned at the bottom for search engines, AI crawlers & deeper readers) ── */}
        <section id="faq" className="max-w-3xl mx-auto px-5 pb-16 sm:pb-20 scroll-mt-20">
          <SectionLabel>Questions</SectionLabel>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {SITE_FAQ.map((f) => (
              <details key={f.q} className="surface rounded-xl px-5 py-4 group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center gap-4 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="text-xl leading-none transition-transform group-open:rotate-45" style={{ color: "var(--olive)" }}>
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--text-dim)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="px-5 pb-16 sm:pb-20">
          <div
            className="max-w-5xl mx-auto rounded-3xl px-6 py-14 sm:px-12 sm:py-16 text-center"
            style={{ background: "var(--olive)", color: "#F4EFE6" }}
          >
            <div className="flex justify-center mb-5" style={{ color: "#F4EFE6" }}>
              <FeyLogo size={44} />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-4">
              Think deeper. Articulate clearly.
            </h2>
            <p className="text-base sm:text-lg max-w-xl mx-auto mb-8" style={{ color: "rgba(244,239,230,0.82)" }}>
              Start with today&apos;s 90-second speaking topic, or challenge a friend in the Games Parlor.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {onStartClick ? (
                <button type="button" onClick={onStartClick} className="btn-terra">
                  Start Today&apos;s Topic
                </button>
              ) : (
                <Link href="/" className="btn-terra">
                  Start Today&apos;s Topic
                </Link>
              )}
              <Link
                href="/games"
                className="px-6 py-3.5 rounded-xl text-sm font-bold border transition-colors"
                style={{ borderColor: "rgba(244,239,230,0.4)", color: "#F4EFE6" }}
              >
                Play Games
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t" style={{ borderColor: "var(--border-dim)" }}>
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: "var(--text-mute)" }}>
          <span className="flex items-center gap-2">
            <FeyLogo size={18} /> Fey by Lokin Labs
          </span>
          <span className="flex gap-5">
            <Link href="/discover" className="hover:underline">Daily Habit</Link>
            <Link href="/community" className="hover:underline">Community</Link>
            <Link href="/games" className="hover:underline">Games</Link>
            <Link href="/games/trivia" className="hover:underline">Naija Trivia</Link>
            <Link href="/podium" className="hover:underline">The Podium</Link>
            <Link href="/about" className="hover:underline">About</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
