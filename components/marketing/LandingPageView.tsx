/**
 * Reusable Landing Page View for Fey.
 *
 * Rendered both at `/about` (always) and at `/` for search engines, AI crawlers,
 * and first-time un-onboarded visitors. When `onStartClick` is provided (on `/`),
 * clicking "Start Today's Topic" triggers the onboarding modal directly.
 */

import Link from "next/link";
import {
  Compass,
  Zap,
  Mic,
  Share2,
  Briefcase,
  Heart,
  GraduationCap,
  Users,
  ArrowRight,
  Flame,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import FeyLogo from "@/components/ui/FeyLogo";
import { SITE_TAGLINE, SITE_FAQ, AUDIENCES } from "@/lib/seo";
import JsonLd, { faqJsonLd, gamesJsonLd } from "@/components/seo/JsonLd";
import LandingTopicSpinner from "./LandingTopicSpinner";
import ParlorShowcaseDeck from "./ParlorShowcaseDeck";
import InteractiveCategoryExplorer from "./InteractiveCategoryExplorer";

const QUICK_STRIP = [
  {
    step: "01",
    title: "Pick a topic or game",
    detail: "Daily 90s speaking topic, trivia, quant, or party game",
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

const FEATURED_ARCHETYPES = [
  {
    title: "The Architect",
    role: "Systems Designer",
    avatar: "/avatars/avatar-architect.svg",
    trait: "Deconstructs first principles and structural blueprints.",
  },
  {
    title: "The Orator",
    role: "Eloquent Speaker",
    avatar: "/avatars/avatar-orator.svg",
    trait: "Commands the room with persuasive, resonant spoken arguments.",
  },
  {
    title: "The Polymath",
    role: "Critical Thinker",
    avatar: "/avatars/avatar-scholar.svg",
    trait: "Connects mental models across history, science, and philosophy.",
  },
  {
    title: "The Visionary",
    role: "Catalyst of Ideas",
    avatar: "/avatars/avatar-luminary.svg",
    trait: "Chases unconventional angles and emerging frontier signals.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[11px] uppercase tracking-[0.2em] mb-3"
      style={{ color: "var(--olive-br)" }}
    >
      {children}
    </p>
  );
}

export default function LandingPageView({
  onStartClick,
  onLoginClick,
}: {
  onStartClick?: () => void;
  onLoginClick?: () => void;
}) {
  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: "var(--bg-base)", color: "var(--text)" }}
    >
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
            <span className="font-serif text-xl font-bold" style={{ color: "var(--text)" }}>
              Fey
            </span>
          </Link>
          <div
            className="flex items-center gap-4 sm:gap-6 text-sm font-medium"
            style={{ color: "var(--text-dim)" }}
          >
            <Link
              href="/discover"
              className="hover:text-[var(--olive)] transition-colors hidden md:inline"
            >
              Daily Habit
            </Link>
            <Link href="/games" className="hover:text-[var(--olive)] transition-colors">
              Games
            </Link>
            <a
              href="#why-fey"
              className="hover:text-[var(--olive)] transition-colors hidden sm:inline"
            >
              About
            </a>

            {onLoginClick ? (
              <button
                type="button"
                onClick={onLoginClick}
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors hover:bg-[var(--bg-card)] cursor-pointer"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                Log In
              </button>
            ) : (
              <Link
                href="/?login=1"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors hover:bg-[var(--bg-card)]"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                Log In
              </Link>
            )}

            {onStartClick ? (
              <button
                type="button"
                onClick={onStartClick}
                className="btn-terra !px-4 !py-2 !text-xs sm:!text-sm cursor-pointer"
              >
                Get Started
              </button>
            ) : (
              <Link
                href="/?onboard=1"
                className="btn-terra !px-4 !py-2 !text-xs sm:!text-sm"
              >
                Get Started
              </Link>
            )}
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
          <p className="text-lg leading-relaxed max-w-xl mb-7" style={{ color: "var(--text-dim)" }}>
            Discover topics you would never encounter in your everyday routine, packaged into a
            focused 10-minute daily habit. Research a fresh idea, articulate it out loud in 90
            seconds, or jump into smart games with friends.
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            {onStartClick ? (
              <button type="button" onClick={onStartClick} className="btn-terra cursor-pointer">
                Start Today&apos;s Topic
              </button>
            ) : (
              <Link href="/?onboard=1" className="btn-terra">
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

          {/* Interactive Archetype Quiz Micro-Hook */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono" style={{ color: "var(--text-mute)" }}>
            <span>Free in your browser · 1,000+ curated topics</span>
            <span className="hidden sm:inline">·</span>
            {onStartClick ? (
              <button
                type="button"
                onClick={onStartClick}
                className="font-semibold underline underline-offset-4 hover:text-[var(--terra)] transition-colors cursor-pointer"
                style={{ color: "var(--olive)" }}
              >
                Take the 3-tap Scholar Archetype Quiz →
              </button>
            ) : (
              <Link
                href="/?onboard=1"
                className="font-semibold underline underline-offset-4 hover:text-[var(--terra)] transition-colors"
                style={{ color: "var(--olive)" }}
              >
                Take the 3-tap Scholar Archetype Quiz →
              </Link>
            )}
          </div>
        </div>

        {/* Interactive Daily Speaking Sprint with Fey Spinner */}
        <LandingTopicSpinner onStartClick={onStartClick} />
      </header>

      <main>
        {/* ── 4-Step Quick Strip: Pick a topic → Think fast → Speak or answer → Share your score ── */}
        <section
          aria-labelledby="quick-strip-heading"
          className="border-y"
          style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)" }}
        >
          <h2 id="quick-strip-heading" className="sr-only">
            How Fey Works in 4 Steps
          </h2>
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
                      <span
                        className="font-mono text-[10px] uppercase tracking-widest"
                        style={{ color: "var(--text-mute)" }}
                      >
                        Step {step}
                      </span>
                      {idx < 3 && (
                        <ArrowRight
                          size={13}
                          className="hidden lg:inline"
                          style={{ color: "var(--text-mute)" }}
                        />
                      )}
                    </div>
                    <h3 className="font-serif text-base font-bold mt-0.5">{stTitle}</h3>
                    <p
                      className="text-xs leading-relaxed mt-0.5"
                      style={{ color: "var(--text-dim)" }}
                    >
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

        {/* ── The Philosophy (Why Fey Exists) + Interactive 23-Discipline Explorer ── */}
        <section
          id="why-fey"
          className="max-w-4xl mx-auto px-5 py-16 sm:py-20 text-center scroll-mt-20"
        >
          <SectionLabel>Why Fey</SectionLabel>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight mb-5">
            Reading makes you feel informed. Speaking proves you understand.
          </h2>
          <p
            className="text-lg leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ color: "var(--text-dim)" }}
          >
            It is easy to consume threads, articles, and videos all day and still struggle to
            explain the core idea when someone asks. Fey closes the gap between passive consumption
            and real mastery—challenging you to step into unfamiliar disciplines, synthesize what
            matters, and articulate it clearly in your own voice.
          </p>

          <InteractiveCategoryExplorer onStartClick={onStartClick} />
        </section>

        {/* ── Who It's For + Scholar Identity & Shareable Proof Showcase ── */}
        <section id="who" className="max-w-6xl mx-auto px-5 pb-16 sm:pb-20 scroll-mt-20">
          <div className="max-w-2xl mb-10">
            <SectionLabel>Who It&apos;s For</SectionLabel>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Designed for curious minds at every stage
            </h2>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 mb-14">
            {AUDIENCES.map((a, i) => {
              const Icon = AUDIENCE_ICONS[i];
              return (
                <li
                  key={a.who}
                  className="surface rounded-2xl p-6 sm:p-7 flex gap-5"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <span
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(68,78,44,0.1)", color: "var(--olive)" }}
                  >
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-serif text-xl font-bold mb-2">{a.who}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                      {a.need}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* ── Scholar Archetypes & Shareable Proof Card Showcase (Replaces duplicate 4-step list) ── */}
          <div
            className="surface rounded-3xl p-6 sm:p-10 border"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="grid gap-8 lg:grid-cols-12 items-center">
              {/* Left Column: 3-Tap Archetype Calibration Preview */}
              <div className="lg:col-span-7">
                <SectionLabel>Scholar Identity &amp; Progression</SectionLabel>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight mb-3">
                  Calibrate your learning archetype and build a lasting voice archive
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-dim)" }}>
                  Take a 10-second calibration quiz to discover your primary scholar archetype,
                  unlock daily speaking quests, protect your streak with Scholar&apos;s Seals, and
                  export shareable score cards after every session.
                </p>

                <div className="grid gap-3 sm:grid-cols-2 mb-6">
                  {FEATURED_ARCHETYPES.map((arch) => (
                    <div
                      key={arch.title}
                      className="rounded-2xl p-3.5 border flex items-start gap-3"
                      style={{
                        background: "var(--bg-base)",
                        borderColor: "var(--border-dim)",
                      }}
                    >
                      <img
                        src={arch.avatar}
                        alt={arch.title}
                        className="w-11 h-11 rounded-full border shrink-0 object-cover"
                        style={{ borderColor: "var(--olive)" }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-serif font-bold text-sm">{arch.title}</h4>
                          <span
                            className="font-mono text-[10px] px-1.5 py-0.2 rounded"
                            style={{
                              background: "rgba(166,124,30,0.12)",
                              color: "var(--gold)",
                            }}
                          >
                            {arch.role}
                          </span>
                        </div>
                        <p
                          className="text-xs leading-snug mt-1"
                          style={{ color: "var(--text-dim)" }}
                        >
                          {arch.trait}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {onStartClick ? (
                  <button
                    type="button"
                    onClick={onStartClick}
                    className="btn-terra !px-5 !py-3 !text-xs sm:!text-sm cursor-pointer"
                  >
                    Discover Your Scholar Archetype
                  </button>
                ) : (
                  <Link href="/?onboard=1" className="btn-terra !px-5 !py-3 !text-xs sm:!text-sm">
                    Discover Your Scholar Archetype
                  </Link>
                )}
              </div>

              {/* Right Column: Tactile Shareable Proof Card Mockup */}
              <div className="lg:col-span-5">
                <div
                  className="rounded-2xl p-5 sm:p-6 border relative overflow-hidden shadow-md"
                  style={{
                    background: "var(--bg-base)",
                    borderColor: "var(--olive)",
                    borderTop: "5px solid var(--terra)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b" style={{ borderColor: "var(--border-dim)" }}>
                    <span className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: "var(--terra)" }}>
                      Shareable Score Card
                    </span>
                    <span
                      className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: "rgba(166,124,30,0.14)", color: "var(--gold)" }}
                    >
                      <Flame size={12} /> 14d Streak · <ShieldCheck size={12} /> Seal Active
                    </span>
                  </div>

                  <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--olive)" }}>
                    Philosophy · 90-Second Vocal Sprint
                  </p>
                  <h4 className="font-serif font-bold text-lg leading-snug mb-3">
                    &ldquo;How does the Feynman Technique expose the illusion of explanatory depth?&rdquo;
                  </h4>

                  <blockquote
                    className="rounded-xl p-3.5 border text-xs leading-relaxed italic mb-4"
                    style={{
                      background: "var(--bg-card)",
                      borderColor: "var(--border-dim)",
                      color: "var(--text-dim)",
                    }}
                  >
                    &ldquo;When we read passively, our brain mistakes familiarity with terms for
                    understanding of the mechanism—until we are forced to explain cause-and-effect
                    out loud in plain words.&rdquo;
                  </blockquote>

                  <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: "var(--border-dim)" }}>
                    <div className="flex items-center gap-2">
                      <img
                        src="/avatars/avatar-architect.svg"
                        alt="Scholar avatar"
                        className="w-7 h-7 rounded-full border"
                        style={{ borderColor: "var(--olive)" }}
                      />
                      <div>
                        <span className="font-bold block leading-none">Adaeze · The Architect</span>
                        <span className="font-mono text-[10px]" style={{ color: "var(--text-mute)" }}>
                          fey.lokinlabs.com.ng
                        </span>
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 font-mono text-[11px] font-bold"
                      style={{ color: "var(--olive)" }}
                    >
                      <CheckCircle2 size={13} /> +150 XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ (Positioned at the bottom for search engines, AI crawlers & deeper readers) ── */}
        <section id="faq" className="max-w-3xl mx-auto px-5 pb-16 sm:pb-20 scroll-mt-20">
          <SectionLabel>Questions</SectionLabel>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {SITE_FAQ.map((f) => (
              <details key={f.q} className="surface rounded-xl px-5 py-4 group">
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center gap-4 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden
                    className="text-xl leading-none transition-transform group-open:rotate-45"
                    style={{ color: "var(--olive)" }}
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  {f.a}
                </p>
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
            <p
              className="text-base sm:text-lg max-w-xl mx-auto mb-8"
              style={{ color: "rgba(244,239,230,0.85)" }}
            >
              Step into the parlor, challenge your friends, or start with today&apos;s 90-second
              speaking challenge.
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
                <Link href="/?onboard=1" className="btn-terra !px-7 !py-3.5 !text-sm">
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
        <div
          className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: "var(--text-mute)" }}
        >
          <span className="flex items-center gap-2">
            <FeyLogo size={18} /> Fey by Lokin Labs
          </span>
          <span className="flex flex-wrap justify-center gap-5">
            <Link href="/discover" className="hover:underline">
              Daily Habit
            </Link>
            <Link href="/community" className="hover:underline">
              Community
            </Link>
            <Link href="/games" className="hover:underline">
              Games
            </Link>
            <Link href="/games/trivia" className="hover:underline">
              Naija Trivia
            </Link>
            <Link href="/games/mathletics" className="hover:underline">
              Quant
            </Link>
            <Link href="/podium" className="hover:underline">
              The Podium
            </Link>
            <Link href="/about" className="hover:underline">
              About
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
