/**
 * Reusable Landing Page View for Fey.
 *
 * Rendered both at `/about` (always) and at `/` for search engines, AI crawlers,
 * and first-time un-onboarded visitors. When `onStartClick` is provided (on `/`),
 * clicking "Start Today's Topic" triggers the onboarding modal directly.
 */

import Link from "next/link";
import {
  Compass, Zap, Mic, Share2, Flame, Briefcase, Heart, GraduationCap,
  Users, Brain, MessagesSquare, Presentation, Timer, ArrowRight, BookOpen,
  Calculator,
} from "lucide-react";
import FeyLogo from "@/components/ui/FeyLogo";
import {
  SITE_TAGLINE, SITE_FAQ, AUDIENCES, HOW_IT_WORKS,
} from "@/lib/seo";
import JsonLd, { faqJsonLd, gamesJsonLd } from "@/components/seo/JsonLd";
import LandingTopicSpinner from "./LandingTopicSpinner";
import ParlorShowcaseDeck from "./ParlorShowcaseDeck";

const QUICK_STRIP = [
  {
    step: "01",
    title: "Pick a topic or game",
    detail: "Daily 90s speaking topic, trivia, mathletics, or party game",
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

        {/* Interactive Daily Speaking Sprint with Fey Spinner */}
        <LandingTopicSpinner onStartClick={onStartClick} />
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

        {/* ── Daily Habit & The Parlor (Interactive Slideshow Deck) ── */}
        <section id="experiences" className="max-w-6xl mx-auto px-5 py-16 sm:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <SectionLabel>Daily Habit &amp; The Parlor</SectionLabel>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Start with today&apos;s topic, or flip through a game
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

          <ParlorShowcaseDeck />
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

        {/* ── Final Call to Action ── */}
        <section className="px-5 pb-16 sm:pb-20">
          <div
            className="max-w-5xl mx-auto rounded-3xl px-6 py-12 sm:px-12 sm:py-16 text-center"
            style={{ background: "var(--olive)", color: "#F4EFE6" }}
          >
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-3">
              Think deeper. Articulate clearly.
            </h2>
            <p className="text-base sm:text-lg max-w-xl mx-auto mb-8" style={{ color: "rgba(244,239,230,0.85)" }}>
              Step into the parlor, challenge your friends, or start with today&apos;s 90-second speaking challenge.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-4">
              {onStartClick ? (
                <button
                  type="button"
                  onClick={onStartClick}
                  className="btn-terra !px-7 !py-3.5 !text-sm cursor-pointer"
                >
                  Start Today&apos;s Topic
                </button>
              ) : (
                <Link href="/" className="btn-terra !px-7 !py-3.5 !text-sm">
                  Start Today&apos;s Topic
                </Link>
              )}
              <Link
                href="/games"
                className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors inline-flex items-center gap-2 hover:bg-[rgba(244,239,230,0.08)]"
                style={{ borderColor: "rgba(244,239,230,0.4)", color: "#F4EFE6" }}
              >
                Explore All Games in the Parlor
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
            <Link href="/games/mathletics" className="hover:underline">Mathletics</Link>
            <Link href="/podium" className="hover:underline">The Podium</Link>
            <Link href="/about" className="hover:underline">About</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
