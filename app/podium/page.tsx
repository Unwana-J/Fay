"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Shuffle,
  PenLine,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  ExternalLink,
  X,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { usePodiumStore } from "@/store/usePodiumStore";
import { useAppStore } from "@/store/useAppStore";
import { encodePodiumDeck } from "@/lib/podium-share";
import SlideRenderer from "@/components/podium/SlideRenderer";
import TopicSpinner from "@/components/podium/TopicSpinner";

export default function PodiumPage() {
  const {
    phase,
    setPhase,
    currentTopic,
    spinLocalTopic,
    setCurrentTopic,
    customTopic,
    customSubtitle,
    setCustomTopic,
    confirmCustomTopic,
    isUsingCustomTopic,
    notes,
    setNotes,
    notesTimeLimit,
    setNotesTimeLimit,
    slideStyle,
    setSlideStyle,
    generatedDeck,
    isGenerating,
    generationError,
    setGeneratedDeck,
    setIsGenerating,
    setGenerationError,
    currentSlideIndex,
    setCurrentSlide,
    nextSlide,
    prevSlide,
    shareCode,
    savedDecks,
    saveDeck,
    deleteSavedDeck,
    reset,
  } = usePodiumStore();

  const { profile } = useAppStore();

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customSubInput, setCustomSubInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(notesTimeLimit);
  const [timerRunning, setTimerRunning] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // ── Countdown timer for notes phase ──────────────────────────────
  useEffect(() => {
    if (phase !== "notes" || !timerRunning || notesTimeLimit === 0) return;
    setTimeLeft(notesTimeLimit);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, timerRunning, notesTimeLimit]);

  // ── Keyboard navigation in present phase ─────────────────────────
  useEffect(() => {
    if (phase !== "present" || !generatedDeck) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") setPhase("preview");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, generatedDeck, nextSlide, prevSlide, setPhase]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleStartNew = () => {
    reset();
    spinLocalTopic();
    setPhase("topic");
  };

  const handleAcceptTopic = () => {
    setTimerRunning(false);
    setTimeLeft(notesTimeLimit);
    setPhase("notes");
  };

  const handleRespin = () => {
    spinLocalTopic();
  };

  const handleConfirmCustom = () => {
    setCustomTopic(customInput, customSubInput);
    confirmCustomTopic();
    setShowCustomForm(false);
    setPhase("notes");
  };

  const handleGenerateSlides = async () => {
    if (!currentTopic) return;
    setIsGenerating(true);
    setGenerationError(null);
    setPhase("generating");
    try {
      const res = await fetch("/api/ai/generate-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: currentTopic.text,
          subtitle: currentTopic.subtitle,
          notes,
          author: profile.username || "Scholar",
          style: slideStyle,
          category: currentTopic.category,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.deck) throw new Error(data.error || "Generation failed");
      setGeneratedDeck(data.deck);
      saveDeck(data.deck);
      setCurrentSlide(0);
      setPhase("preview");
    } catch (err: any) {
      setGenerationError(err.message || "Something went wrong");
      setPhase("notes");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (!generatedDeck) return;
    const code = encodePodiumDeck(generatedDeck);
    const url = `${window.location.origin}/podium/slides/${code}`;
    setShareUrl(url);
    setPhase("share");
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <AnimatePresence mode="wait">

        {/* ════════════════════════════════════════
            LOBBY
            ════════════════════════════════════════ */}
        {phase === "lobby" && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto px-4 sm:px-8 py-12"
          >
            {/* Header */}
            <div className="mb-3">
              <Link
                href="/games"
                className="flex items-center gap-1.5 text-xs mb-6 hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-dim)" }}
              >
                <ArrowLeft size={13} /> Games
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border"
                  style={{ background: "rgba(166,124,30,0.12)", borderColor: "rgba(166,124,30,0.25)" }}
                >
                  🎤
                </div>
                <div>
                  <h1
                    className="font-space text-4xl font-extrabold tracking-tight"
                    style={{ color: "var(--text)" }}
                  >
                    The Podium
                  </h1>
                  <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                    Spin a topic · Jot your hot takes · Let AI build your slides
                  </p>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: Shuffle, label: "Spin", desc: "Get a wild topic" },
                { icon: PenLine, label: "Note", desc: "Jot your angle" },
                { icon: Sparkles, label: "Present", desc: "AI builds slides" },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="p-4 rounded-2xl border text-center"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)" }}
                >
                  <Icon size={20} className="mx-auto mb-2" style={{ color: "var(--gold)" }} />
                  <div
                    className="font-space font-bold text-sm mb-1"
                    style={{ color: "var(--text)" }}
                  >
                    {label}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-mute)" }}>
                    {desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Slide style selector */}
            <div className="mb-6">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--text-mute)" }}
              >
                Slide Style
              </p>
              <div className="flex gap-3 flex-wrap">
                {(["bold", "minimal", "academic-chaos"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlideStyle(s)}
                    className="px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                    style={{
                      background: slideStyle === s ? "var(--gold)" : "var(--bg-card)",
                      color: slideStyle === s ? "#000" : "var(--text-dim)",
                      borderColor: slideStyle === s ? "var(--gold)" : "var(--border-dim)",
                    }}
                  >
                    {s === "bold"
                      ? "💥 Bold"
                      : s === "minimal"
                      ? "🤍 Minimal"
                      : "🎓 Academic Chaos"}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleStartNew}
              className="w-full py-4 rounded-2xl font-space font-extrabold text-lg tracking-tight flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: "var(--terra)", color: "#fff" }}
            >
              <Mic size={20} /> Spin a Topic &amp; Start
            </button>

            {/* Saved decks */}
            {savedDecks.length > 0 && (
              <div className="mt-10">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "var(--text-mute)" }}
                >
                  Past Presentations
                </p>
                <div className="space-y-3">
                  {savedDecks.slice(0, 5).map((deck) => (
                    <div
                      key={deck.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border"
                      style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)" }}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-space font-bold text-sm truncate"
                          style={{ color: "var(--text)" }}
                        >
                          {deck.topic}
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-mute)" }}>
                          {deck.createdAt}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setGeneratedDeck(deck);
                          setCurrentSlide(0);
                          setPhase("preview");
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteSavedDeck(deck.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors"
                      >
                        <X size={13} style={{ color: "var(--text-mute)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════
            TOPIC
            ════════════════════════════════════════ */}
        {phase === "topic" && currentTopic && (
          <motion.div
            key="topic"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
          >
            <TopicSpinner topic={currentTopic} />

            <div className="w-full max-w-lg mt-10 space-y-3">
              {/* Accept */}
              <button
                onClick={handleAcceptTopic}
                className="w-full py-4 rounded-2xl font-space font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90"
                style={{ background: "var(--terra)", color: "#fff" }}
              >
                <ChevronRight size={18} /> Accept This Topic
              </button>

              {/* Re-spin / Custom */}
              <div className="flex gap-3">
                <button
                  onClick={handleRespin}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: "var(--border-dim)",
                    color: "var(--text-dim)",
                    background: "var(--bg-card)",
                  }}
                >
                  <Shuffle size={15} /> Re-spin
                </button>
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: "var(--border-dim)",
                    color: "var(--text-dim)",
                    background: "var(--bg-card)",
                  }}
                >
                  <PenLine size={15} /> Custom Topic
                </button>
              </div>

              {/* Back */}
              <button
                onClick={() => setPhase("lobby")}
                className="w-full py-2 text-xs cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-mute)" }}
              >
                ← Back to lobby
              </button>
            </div>

            {/* Custom topic modal */}
            <AnimatePresence>
              {showCustomForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                  onClick={() => setShowCustomForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="w-full max-w-md rounded-3xl p-6 border"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3
                      className="font-space font-bold text-lg mb-4"
                      style={{ color: "var(--text)" }}
                    >
                      Custom Topic
                    </h3>
                    <div className="space-y-3 mb-4">
                      <input
                        className="w-full px-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none"
                        style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                        placeholder="Your bold topic title..."
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                      />
                      <input
                        className="w-full px-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none"
                        style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                        placeholder="Subtitle (optional — e.g. 'A Sociological Study')"
                        value={customSubInput}
                        onChange={(e) => setCustomSubInput(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleConfirmCustom}
                      disabled={!customInput.trim()}
                      className="w-full py-3 rounded-xl font-bold text-sm cursor-pointer disabled:opacity-40 transition-opacity"
                      style={{ background: "var(--terra)", color: "#fff" }}
                    >
                      Use This Topic
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ════════════════════════════════════════
            NOTES
            ════════════════════════════════════════ */}
        {phase === "notes" && currentTopic && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto px-4 sm:px-8 py-8"
          >
            {/* Topic header + timer */}
            <div className="flex items-start justify-between mb-6 gap-4">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: "var(--text-mute)" }}
                >
                  {currentTopic.vibe}
                </p>
                <h2
                  className="font-space font-extrabold text-2xl"
                  style={{ color: "var(--text)" }}
                >
                  {currentTopic.text}
                </h2>
                <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                  {currentTopic.subtitle}
                </p>
              </div>

              {notesTimeLimit > 0 && (
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    className="text-2xl font-mono font-bold"
                    style={{
                      color:
                        timerRunning && timeLeft < 30 ? "var(--red)" : "var(--gold)",
                    }}
                  >
                    {formatTime(timerRunning ? timeLeft : notesTimeLimit)}
                  </div>
                  <button
                    onClick={() => {
                      if (!timerRunning) setTimeLeft(notesTimeLimit);
                      setTimerRunning(!timerRunning);
                    }}
                    className="text-xs px-3 py-1 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                  >
                    {timerRunning ? "Pause" : "Start Timer"}
                  </button>
                </div>
              )}
            </div>

            {/* Seed bullets */}
            {currentTopic.seedBullets.length > 0 && (
              <div
                className="mb-4 p-4 rounded-2xl border"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)" }}
              >
                <p
                  className="text-xs font-bold mb-2"
                  style={{ color: "var(--text-mute)" }}
                >
                  💡 Starter angles (click to add)
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentTopic.seedBullets.map((bullet, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        setNotes(notes ? `${notes}\n• ${bullet}` : `• ${bullet}`)
                      }
                      className="text-xs px-3 py-1.5 rounded-full border cursor-pointer hover:opacity-80 transition-opacity text-left"
                      style={{
                        borderColor: "var(--border-dim)",
                        color: "var(--text-dim)",
                        background: "var(--bg-base)",
                      }}
                    >
                      + {bullet}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes textarea */}
            <textarea
              className="w-full h-56 px-4 py-4 rounded-2xl border bg-transparent text-sm leading-relaxed resize-none focus:outline-none font-mono"
              style={{
                borderColor: "var(--border-dim)",
                color: "var(--text)",
                background: "var(--bg-card)",
              }}
              placeholder={`Jot your hot takes, arguments, evidence...\n\nYou can skip notes and let AI freestyle from the topic.`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* Action buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setPhase("topic")}
                className="flex-1 py-3 rounded-2xl border font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  borderColor: "var(--border-dim)",
                  color: "var(--text-dim)",
                  background: "var(--bg-card)",
                }}
              >
                ← Change Topic
              </button>
              <button
                onClick={handleGenerateSlides}
                className="flex-[2] py-3 rounded-2xl font-space font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: "var(--terra)", color: "#fff" }}
              >
                <Sparkles size={16} /> Build My Slides
              </button>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════
            GENERATING
            ════════════════════════════════════════ */}
        {phase === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl mb-6"
            >
              ✨
            </motion.div>
            <h2
              className="font-space font-extrabold text-2xl mb-2"
              style={{ color: "var(--text)" }}
            >
              Building your slides...
            </h2>
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              Gemini is crafting your masterpiece.
            </p>
            {generationError && (
              <div className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-sm text-red-400 max-w-sm">
                {generationError}
                <button
                  onClick={() => setPhase("notes")}
                  className="block mt-2 underline text-xs cursor-pointer"
                >
                  ← Go back
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════
            PREVIEW
            ════════════════════════════════════════ */}
        {phase === "preview" && generatedDeck && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-4 sm:px-8 py-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: "var(--text-mute)" }}
                >
                  Preview
                </p>
                <h2
                  className="font-space font-extrabold text-xl"
                  style={{ color: "var(--text)" }}
                >
                  {generatedDeck.topic}
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPhase("present")}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: "var(--terra)", color: "#fff" }}
                >
                  <Mic size={14} /> Present
                </button>
                <button
                  onClick={handleShare}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity border"
                  style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                >
                  <ExternalLink size={14} /> Share
                </button>
              </div>
            </div>

            {/* Slide thumbnails */}
            <div className="space-y-4">
              {generatedDeck.slides.map((slide, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => {
                    setCurrentSlide(i);
                    setPhase("present");
                  }}
                  className="cursor-pointer rounded-2xl overflow-hidden border hover:ring-2 hover:ring-[var(--terra)] transition-all"
                  style={{ borderColor: "var(--border-dim)" }}
                >
                  <div className="h-36 sm:h-48" style={{ background: slide.bgColor }}>
                    <SlideRenderer slide={slide} isThumb />
                  </div>
                  <div
                    className="px-4 py-2 flex items-center gap-3"
                    style={{ background: "var(--bg-card)" }}
                  >
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--text-mute)" }}
                    >
                      Slide {i + 1}
                    </span>
                    <span
                      className="text-xs font-bold truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {slide.title}
                    </span>
                    <span
                      className="ml-auto text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "var(--bg-input)", color: "var(--text-mute)" }}
                    >
                      {slide.layout}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Start over */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  reset();
                  setPhase("lobby");
                }}
                className="flex-1 py-3 rounded-2xl border font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity"
                style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════
            PRESENT  (full-screen, z-50)
            ════════════════════════════════════════ */}
        {phase === "present" && generatedDeck && (
          <motion.div
            key="present"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{
              background:
                generatedDeck.slides[currentSlideIndex]?.bgColor || "#000",
            }}
          >
            {/* Slide area */}
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <SlideRenderer slide={generatedDeck.slides[currentSlideIndex]} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-md">
              <button
                onClick={() => setPhase("preview")}
                className="text-white/60 hover:text-white text-xs cursor-pointer flex items-center gap-1 transition-colors"
              >
                <X size={13} /> Exit
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={prevSlide}
                  disabled={currentSlideIndex === 0}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} className="text-white" />
                </button>
                <span className="text-white/60 font-mono text-sm">
                  {currentSlideIndex + 1} / {generatedDeck.slides.length}
                </span>
                <button
                  onClick={nextSlide}
                  disabled={
                    currentSlideIndex === generatedDeck.slides.length - 1
                  }
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} className="text-white" />
                </button>
              </div>

              <button
                onClick={handleShare}
                className="text-white/60 hover:text-white text-xs cursor-pointer flex items-center gap-1 transition-colors"
              >
                Share <ExternalLink size={12} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════
            SHARE
            ════════════════════════════════════════ */}
        {phase === "share" && generatedDeck && (
          <motion.div
            key="share"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-lg mx-auto px-4 sm:px-8 py-12 text-center"
          >
            <div className="text-6xl mb-4">🎤</div>
            <h2
              className="font-space font-extrabold text-2xl mb-2"
              style={{ color: "var(--text)" }}
            >
              Your slide deck is ready!
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--text-dim)" }}>
              Share the link — anyone can view your presentation, no account
              needed.
            </p>

            {/* First slide preview */}
            {generatedDeck.slides[0] && (
              <div
                className="rounded-2xl overflow-hidden mb-6 border"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <div
                  className="h-40"
                  style={{ background: generatedDeck.slides[0].bgColor }}
                >
                  <SlideRenderer slide={generatedDeck.slides[0]} isThumb />
                </div>
              </div>
            )}

            {/* Copy link row */}
            <div className="flex gap-2 mb-4">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2.5 rounded-xl border text-xs font-mono bg-transparent focus:outline-none"
                style={{
                  borderColor: "var(--border-dim)",
                  color: "var(--text-dim)",
                }}
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer transition-all"
                style={{
                  background: copied ? "var(--olive)" : "var(--terra)",
                  color: "#fff",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Social share */}
            <div className="flex gap-3 mb-6">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `I just presented: "${generatedDeck.topic}" 🎤`
                )}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                style={{
                  borderColor: "var(--border-dim)",
                  color: "var(--text-dim)",
                }}
              >
                𝕏 Share on X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                style={{
                  borderColor: "var(--border-dim)",
                  color: "var(--text-dim)",
                }}
              >
                in LinkedIn
              </a>
            </div>

            {/* Nav buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setPhase("preview")}
                className="flex-1 py-3 rounded-2xl border font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  borderColor: "var(--border-dim)",
                  color: "var(--text-dim)",
                }}
              >
                ← Back to Preview
              </button>
              <button
                onClick={() => {
                  reset();
                  setPhase("lobby");
                }}
                className="flex-1 py-3 rounded-2xl font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: "var(--terra)", color: "#fff" }}
              >
                New Presentation
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
