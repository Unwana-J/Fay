"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, BookOpen } from "lucide-react";
import Link from "next/link";
import { decodePodiumDeck } from "@/lib/podium-share";
import { type PodiumDeck } from "@/lib/podium-types";
import SlideRenderer from "@/components/podium/SlideRenderer";

export default function PodiumSlidesViewer() {
  const params = useParams();
  const [deck, setDeck] = useState<PodiumDeck | null>(null);
  const [error, setError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const code = params?.code as string;
    if (!code) { setError(true); return; }
    const decoded = decodePodiumDeck(code);
    if (!decoded) { setError(true); return; }
    setDeck(decoded);
  }, [params?.code]);

  useEffect(() => {
    if (!deck) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") setCurrentSlide((p) => Math.min(p + 1, deck.slides.length - 1));
      if (e.key === "ArrowLeft") setCurrentSlide((p) => Math.max(0, p - 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [deck]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: "var(--bg)" }}>
        <div className="text-5xl mb-4">🎤</div>
        <h1 className="font-space font-bold text-2xl mb-2" style={{ color: "var(--text)" }}>Slide deck not found</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>This link may be broken or expired.</p>
        <Link href="/" className="px-6 py-3 rounded-xl font-bold text-sm" style={{ background: "var(--terra)", color: "#fff" }}>
          Start Your Learning Journey
        </Link>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-3xl animate-pulse">✨</div>
      </div>
    );
  }

  const slide = deck.slides[currentSlide];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b" style={{ borderColor: "var(--border-dim)", background: "var(--bg)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: "var(--gold)20" }}>🎤</div>
          <div>
            <div className="font-space font-bold text-sm leading-tight" style={{ color: "var(--text)" }}>{deck.topic}</div>
            <div className="text-xs" style={{ color: "var(--text-mute)" }}>Presented by {deck.author} · {deck.createdAt}</div>
          </div>
        </div>
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 text-xs px-4 py-2 rounded-xl font-bold border hover:opacity-80 transition-opacity"
          style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
        >
          <BookOpen size={12} /> Try Fey
        </Link>
      </div>

      {/* Slide */}
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

      {/* Slide nav */}
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
                width: i === currentSlide ? 20 : 6,
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

      {/* Conversion banner */}
      <div className="px-4 py-5 border-t text-center" style={{ borderColor: "var(--border-dim)", background: "var(--bg-card)" }}>
        <p className="text-sm font-bold mb-1" style={{ color: "var(--text)" }}>Want to build your own slide deck?</p>
        <p className="text-xs mb-3" style={{ color: "var(--text-dim)" }}>Fey turns your ideas into presentations instantly — and helps you think deeper along the way.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-space font-bold text-sm hover:opacity-90 transition-opacity"
          style={{ background: "var(--terra)", color: "#fff" }}
        >
          Start Your Learning Journey <ExternalLink size={13} />
        </Link>
      </div>
    </div>
  );
}
