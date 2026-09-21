"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  Share2,
  Sparkles,
  ArrowRight,
  Check,
  Award,
  Clock,
  Quote,
  Feather,
} from "lucide-react";
import FeyLogo from "@/components/ui/FeyLogo";
import { decodeSharedNote, type SharedNotePayload } from "@/lib/share-note";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DIFFICULTY_LABELS,
  type Difficulty,
} from "@/lib/topics";
import { useAppStore } from "@/store/useAppStore";
import OnboardingModal from "@/components/auth/OnboardingModal";

export default function NoteContent({
  initialNote,
  code,
}: {
  initialNote: SharedNotePayload | null;
  code?: string;
}) {
  const [note, setNote] = useState<SharedNotePayload | null>(initialNote);
  const [copied, setCopied] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { isOnboarded } = useAppStore();

  // Dual hydration: if server didn't supply initialNote or on client navigation,
  // attempt decoding in client with full access to window.location
  useEffect(() => {
    if (!note) {
      // 1. Try prop code if provided
      if (code) {
        const decoded = decodeSharedNote(code);
        if (decoded) {
          setNote(decoded);
          return;
        }
      }

      // 2. Fallback: extract directly from window.location.pathname
      if (typeof window !== "undefined") {
        const parts = window.location.pathname.split("/note/");
        if (parts.length > 1 && parts[1]) {
          const rawParam = parts[1].split("?")[0].split("#")[0];
          const decoded = decodeSharedNote(rawParam);
          if (decoded) {
            setNote(decoded);
          }
        }
      }
    }
  }, [note, code]);

  function handleCopyLink() {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleShareTwitter() {
    if (!note) return;
    const tweet = `Read this synthesis on "${note.topicText}" — written using the Feynman Technique on Fey.\n\n`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  }

  function handleShareLinkedIn() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank"
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl surface flex items-center justify-center mb-5 border border-[var(--border)]">
          <Feather size={28} className="text-[var(--terra)]" />
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2 text-[var(--text)]">
          Dispatch Not Found
        </h1>
        <p className="font-serif italic text-sm text-[var(--text-dim)] mb-6">
          This note link appears to be broken or corrupted. The original scholar may need to generate a new share link.
        </p>
        <Link href="/">
          <button className="btn-terra px-6 py-3 text-sm flex items-center gap-2">
            Return to Fey <ArrowRight size={15} />
          </button>
        </Link>
      </div>
    );
  }

  const categoryColor = CATEGORY_COLORS[note.category] || "var(--terra)";
  const categoryIcon = CATEGORY_ICONS[note.category] || "📜";
  const diffMeta = DIFFICULTY_LABELS[note.difficulty as Difficulty] || {
    icon: "📖",
    label: note.difficulty || "Scholar",
    description: "",
  };

  const wordCount = note.notes ? note.notes.trim().split(/\s+/).length : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text)]">
      {/* ── Editorial Top Navigation Bar ── */}
      <header
        className="w-full border-b sticky top-0 z-30 backdrop-blur-md bg-[var(--bg-base)]/90"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <FeyLogo size={22} />
            <div className="flex flex-col">
              <span className="font-serif font-bold tracking-tight text-lg leading-tight group-hover:text-[var(--terra)] transition-colors">
                Fey
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text-mute)]">
                Think Deeper
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium border surface hover:border-[var(--olive-br)] transition-all cursor-pointer text-[var(--text-dim)]"
              style={{ borderColor: "var(--border-dim)" }}
            >
              {copied ? (
                <>
                  <Check size={13} className="text-[var(--olive)]" />
                  <span className="text-[var(--olive)]">Copied Link</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span>Share Note</span>
                </>
              )}
            </button>

            {isOnboarded ? (
              <Link href="/">
                <button className="btn-ghost px-4 py-1.5 text-xs font-mono rounded-full border border-[var(--border-dim)]">
                  Dashboard →
                </button>
              </Link>
            ) : (
              <button
                onClick={() => setShowOnboarding(true)}
                className="btn-terra px-4 py-1.5 text-xs font-mono rounded-full flex items-center gap-1.5"
              >
                <span>Join Fey</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Broadside Note Container ── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 sm:py-14">
        {/* Folio Header & Dateline */}
        <div className="border-b pb-4 mb-8" style={{ borderColor: "var(--border-dim)" }}>
          <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--text-mute)] mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--terra)]" />
              <span>Scholar Dispatch</span>
              <span>·</span>
              <span>{note.date || "September 2026"}</span>
            </div>

            <div className="flex items-center gap-2 text-[10px] lowercase">
              <Clock size={12} />
              <span>
                {readTimeMin} min read · {wordCount} words
              </span>
            </div>
          </div>

          {/* Badges: Category + Difficulty + Spoken synthesis */}
          <div className="flex items-center gap-2.5 flex-wrap mt-2">
            <span
              className="tag font-bold font-mono text-[11px]"
              style={{
                backgroundColor: `${categoryColor}15`,
                color: categoryColor,
                border: `1px solid ${categoryColor}30`,
              }}
            >
              {categoryIcon} {note.category}
            </span>

            <span className="tag tag-olive font-mono text-[11px]">
              {diffMeta.icon} {diffMeta.label}
            </span>

            {note.speakingSeconds && note.speakingSeconds > 0 ? (
              <span className="tag tag-gold font-mono text-[11px] flex items-center gap-1">
                <Mic size={11} />
                <span>{note.speakingSeconds}s Spoken Synthesis</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* ── The Feynman Inquiry Title ── */}
        <h1
          className="font-serif font-bold tracking-tight mb-6"
          style={{
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            lineHeight: 1.22,
            color: "var(--text)",
          }}
        >
          {note.topicText}
        </h1>

        {/* Scholar Byline & Provenance */}
        <div
          className="p-4 rounded-xl border surface flex items-center justify-between gap-4 mb-10 flex-wrap"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-sm text-white"
              style={{ background: categoryColor }}
            >
              {note.author ? note.author.slice(0, 1).toUpperCase() : "S"}
            </div>
            <div>
              <div className="text-sm font-semibold font-serif text-[var(--text)]">
                Synthesized by Scholar {note.author}
              </div>
              <div className="text-[11px] font-mono text-[var(--text-mute)]">
                Verified via the Feynman Articulation Method
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-[var(--text-dim)] flex items-center gap-1.5">
            <Award size={14} className="text-[var(--gold)]" />
            <span>Fey Academic Archive</span>
          </div>
        </div>

        {/* ── The Manuscript Body ── */}
        <article className="prose-fey mb-12">
          <div
            className="surface rounded-2xl p-7 sm:p-10 border relative"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-card)",
              boxShadow: "0 4px 24px -6px rgba(0,0,0,0.04)",
            }}
          >
            {/* Subtle watermark seal */}
            <div className="absolute top-6 right-6 opacity-10 pointer-events-none select-none">
              <FeyLogo size={42} />
            </div>

            <div className="text-label mb-4 flex items-center gap-1.5 text-[var(--text-mute)]">
              <Quote size={13} className="text-[var(--terra)]" />
              <span>Scholar&apos;s Notes &amp; Simplification</span>
            </div>

            {/* Note text rendered gracefully */}
            <div
              className="font-serif leading-relaxed text-[1.12rem] whitespace-pre-wrap selection:bg-[var(--terra)] selection:text-white"
              style={{ color: "var(--text)" }}
            >
              {note.notes}
            </div>

            {/* Tags footer inside note */}
            {note.tags && note.tags.length > 0 && (
              <div
                className="mt-8 pt-5 border-t flex items-center gap-1.5 flex-wrap"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <span className="text-[10px] font-mono text-[var(--text-mute)] uppercase mr-1">
                  Topics:
                </span>
                {note.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md surface border border-[var(--border-dim)] text-[var(--text-dim)]"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* ── Share & Distribution Strip ── */}
        <div
          className="flex items-center justify-between p-4 rounded-xl border surface mb-12 flex-wrap gap-3"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="text-xs font-serif italic text-[var(--text-dim)]">
            Enjoyed this synthesis? Share it with fellow thinkers:
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareTwitter}
              className="btn-ghost px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--border-dim)] flex items-center gap-1.5 hover:border-[var(--text)] transition-colors"
            >
              <span>Share on X</span>
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="btn-ghost px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--border-dim)] flex items-center gap-1.5 hover:border-[var(--text)] transition-colors"
            >
              <span>LinkedIn</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="btn-terra px-3 py-1.5 text-xs font-mono rounded-lg flex items-center gap-1.5"
            >
              {copied ? <Check size={12} /> : <Share2 size={12} />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>

        {/* ── High-Converting Viral Onboarding CTA Banner ── */}
        <div
          className="rounded-2xl p-8 sm:p-10 border text-center relative overflow-hidden surface-raised"
          style={{
            borderColor: "var(--terra)",
            background: "linear-gradient(180deg, var(--bg-card) 0%, rgba(122,28,46,0.04) 100%)",
          }}
        >
          {/* Decorative motif */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 bg-[var(--terra)]/10 text-[var(--terra)]">
            <Sparkles size={22} />
          </div>

          <h2
            className="font-serif font-bold text-2xl sm:text-3xl mb-3 tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Think Deeper. Articulate Clearly.
          </h2>

          <p
            className="font-serif italic text-sm sm:text-base text-[var(--text-dim)] max-w-xl mx-auto mb-6 leading-relaxed"
          >
            Passive reading creates the illusion of explanatory depth. Fey challenges you to research a topic for 15 minutes, then prove true understanding by speaking it aloud in 90 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isOnboarded ? (
              <Link href="/">
                <button className="btn-terra px-7 py-3 text-sm flex items-center gap-2 font-mono">
                  <span>Start Today&apos;s Sprint</span>
                  <ArrowRight size={15} />
                </button>
              </Link>
            ) : (
              <button
                onClick={() => setShowOnboarding(true)}
                className="btn-terra px-7 py-3 text-sm flex items-center gap-2 font-mono"
              >
                <span>Start Your Learning Journey</span>
                <ArrowRight size={15} />
              </button>
            )}

            <Link href="/discover">
              <button className="btn-ghost px-5 py-3 text-sm font-mono border border-[var(--border-dim)] rounded-xl">
                Browse 700+ Disciplines
              </button>
            </Link>
          </div>

          <div className="mt-6 text-[11px] font-mono text-[var(--text-mute)] flex items-center justify-center gap-4">
            <span>✓ Based on the Feynman Technique</span>
            <span>·</span>
            <span>✓ 20 Academic Fields</span>
            <span>·</span>
            <span>✓ Free to explore</span>
          </div>
        </div>
      </main>

      {/* ── Scholarly Colophon Footer ── */}
      <footer
        className="w-full border-t py-8 px-6 text-center mt-auto"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-mute)]">
          <div className="flex items-center gap-2">
            <FeyLogo size={14} />
            <span>Fey Platform · The Articulation Engine</span>
          </div>
          <p className="italic font-serif text-[11px]">
            &ldquo;If you want to master something, teach it.&rdquo; — Richard Feynman
          </p>
        </div>
      </footer>

      {/* Onboarding modal triggered on CTA click for new users */}
      <OnboardingModal isOpen={showOnboarding} />
    </div>
  );
}
