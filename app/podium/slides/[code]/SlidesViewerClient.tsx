"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, BookOpen, Share2, Check, Mic, Sparkles } from "lucide-react";
import Link from "next/link";
import { decodePodiumDeck } from "@/lib/podium-share";
import { type PodiumDeck } from "@/lib/podium-types";
import SlideRenderer from "@/components/podium/SlideRenderer";
import FeyLogo from "@/components/ui/FeyLogo";

interface SlidesViewerClientProps {
  initialDeck: PodiumDeck | null;
  code: string;
}

export default function SlidesViewerClient({ initialDeck, code }: SlidesViewerClientProps) {
  const [deck, setDeck] = useState<PodiumDeck | null>(initialDeck);
  const [error, setError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!deck && code) {
      const decoded = decodePodiumDeck(code);
      if (!decoded) {
        setError(true);
      } else {
        setDeck(decoded);
      }
    }
  }, [deck, code]);

  useEffect(() => {
    if (!deck) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") setCurrentSlide((p) => Math.min(p + 1, deck.slides.length - 1));
      if (e.key === "ArrowLeft") setCurrentSlide((p) => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [deck]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    if (!deck) return;
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `Check out this presentation on "${deck.topic}" 🎤\n\n— Presented by ${deck.author} via @FeyPlatform:\n`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  if (error || (!deck && !code)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: "var(--bg)" }}>
        <div className="text-5xl mb-4">🎤</div>
        <h1 className="font-space font-bold text-2xl mb-2" style={{ color: "var(--text)" }}>Slide deck not found</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>This link may be broken or expired.</p>
        <Link href="/podium" className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: "var(--terra)", color: "#fff" }}>
          Create Your Own Presentation
        </Link>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg)" }}>
        <div className="relative w-20 h-20 flex items-center justify-center">
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--gold)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          />
          <FeyLogo size={46} spinning={true} />
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--gold)] animate-pulse">
          Loading Presentation...
        </span>
      </div>
    );
  }

  const slide = deck.slides[currentSlide];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b" style={{ borderColor: "var(--border-dim)", background: "var(--bg)" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-xl flex items-center justify-center text-base border hover:opacity-80 transition-opacity" style={{ background: "var(--gold)15", borderColor: "var(--gold)30" }}>
            <FeyLogo size={20} />
          </Link>
          <div>
            <div className="font-space font-bold text-sm leading-tight truncate max-w-[280px] sm:max-w-md" style={{ color: "var(--text)" }}>{deck.topic}</div>
            <div className="text-xs" style={{ color: "var(--text-mute)" }}>Presented by {deck.author} · {deck.createdAt}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareTwitter}
            className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border cursor-pointer hover:border-[var(--text)] transition-colors"
            style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
            title="Share on X"
          >
            <span>𝕏 Post</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border cursor-pointer hover:border-[var(--text)] transition-colors"
            style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
            title="Copy link"
          >
            {copied ? <Check size={13} className="text-[var(--olive)]" /> : <Share2 size={13} />}
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>

          <Link
            href="/podium"
            className="hidden md:flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-xl font-bold font-space hover:opacity-90 transition-opacity"
            style={{ background: "var(--terra)", color: "#fff" }}
          >
            <Mic size={12} /> Present Your Take
          </Link>
        </div>
      </div>

      {/* Slide Display */}
      <div className="flex-1 relative" style={{ background: slide?.bgColor || "#000" }}>
        <AnimatePresence mode="wait">
          {slide && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
            >
              <SlideRenderer slide={slide} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide Nav Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-t" style={{ background: "var(--bg)", borderColor: "var(--border-dim)" }}>
        <button
          onClick={() => setCurrentSlide((p) => Math.max(0, p - 1))}
          disabled={currentSlide === 0}
          className="w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer disabled:opacity-30 hover:opacity-70 transition-opacity"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <ChevronLeft size={16} style={{ color: "var(--text)" }} />
        </button>

        <div className="flex items-center gap-2">
          {deck.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="rounded-full transition-all cursor-pointer"
              style={{
                width: i === currentSlide ? 22 : 6,
                height: 6,
                background: i === currentSlide ? "var(--terra)" : "var(--border-dim)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((p) => Math.min(p + 1, deck.slides.length - 1))}
          disabled={currentSlide === deck.slides.length - 1}
          className="w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer disabled:opacity-30 hover:opacity-70 transition-opacity"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <ChevronRight size={16} style={{ color: "var(--text)" }} />
        </button>
      </div>

      {/* ── High-Converting Viral Rebuttal & Onboarding Banner ── */}
      <div className="px-6 py-6 border-t text-center surface-raised relative overflow-hidden" style={{ borderColor: "var(--border-dim)", background: "var(--bg-card)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--gold)] mb-2">
            <Sparkles size={12} />
            <span>Have a different perspective?</span>
          </div>

          <h3 className="font-space font-extrabold text-xl sm:text-2xl mb-1.5" style={{ color: "var(--text)" }}>
            Present Your Rebuttal or Spin a New Topic
          </h3>
          <p className="text-xs sm:text-sm mb-5 leading-relaxed" style={{ color: "var(--text-dim)" }}>
            Think you have a better angle on &ldquo;{deck.topic}&rdquo;? Fey lets you build bold slides in 60 seconds and articulate your thesis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/podium"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-space font-extrabold text-sm hover:opacity-90 transition-opacity shadow-sm"
              style={{ background: "var(--terra)", color: "#fff" }}
            >
              <Mic size={14} /> Present Your Take <ExternalLink size={13} />
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-space font-semibold text-xs border hover:border-[var(--text)] transition-colors"
              style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
            >
              <BookOpen size={13} /> Start Today&apos;s Feynman Sprint
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
