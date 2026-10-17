"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  ArrowUp,
  ArrowDown,
  LayoutTemplate,
  Pencil,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { usePodiumStore } from "@/store/usePodiumStore";
import { useAppStore } from "@/store/useAppStore";
import { type SlideLayout } from "@/lib/podium-types";
import { encodePodiumDeck } from "@/lib/podium-share";
import { PODIUM_THEMES } from "@/lib/podium-themes";
import { copyTextToClipboard } from "@/lib/clipboard";
import { getShortenedUrl } from "@/lib/url-shortener";
import SlideRenderer from "@/components/podium/SlideRenderer";
import TopicSpinner from "@/components/podium/TopicSpinner";
import FeyLogo from "@/components/ui/FeyLogo";
import FeatureGate from "@/components/ui/FeatureGate";

// Compresses client-side uploaded photos to a lightweight data URL for instant rendering & shareability
function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PodiumPage() {
  return (
    <FeatureGate
      flag="enablePodium"
      title="The Podium is under revamp"
      message="We're rebuilding the stage for even spicier slide decks. The Podium will be back shortly."
    >
      <PodiumPageInner />
    </FeatureGate>
  );
}

function PodiumPageInner() {
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
    savedDecks,
    saveDeck,
    deleteSavedDeck,
    updateSlide,
    applyThemeToDeck,
    applyThemeToSlide,
    createManualDeck,
    addSlide,
    deleteSlide,
    moveSlide,
    changeSlideLayout,
    reset,
  } = usePodiumStore();

  const { profile } = useAppStore();

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customSubInput, setCustomSubInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(notesTimeLimit);
  const [timerRunning, setTimerRunning] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [isSpinningTopic, setIsSpinningTopic] = useState(false);

  // Featured slide & quote for sharing / preview card
  const [featuredSlideIndex, setFeaturedSlideIndex] = useState<number>(0);
  const [featuredQuote, setFeaturedQuote] = useState<string>("");

  // Deterministic share code derived from generatedDeck
  const shareCode = useMemo(() => {
    if (!generatedDeck) return "";
    return encodePodiumDeck(generatedDeck);
  }, [generatedDeck]);

  // Target full URL including ?slide= and ?q= query parameters
  const targetShareUrl = useMemo(() => {
    if (!shareCode) return "";
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local"));
    const origin =
      typeof window !== "undefined" && !isLocalhost
        ? window.location.origin
        : "https://fey.lokinlabs.com.ng";
    const baseUrl = `${origin}/podium/slides/${shareCode}`;
    const params = new URLSearchParams();
    if (featuredSlideIndex > 0) {
      params.set("slide", String(featuredSlideIndex + 1));
    }
    if (featuredQuote.trim()) {
      params.set("q", featuredQuote.trim());
    }
    const qStr = params.toString();
    return qStr ? `${baseUrl}?${qStr}` : baseUrl;
  }, [shareCode, featuredSlideIndex, featuredQuote]);

  // Shortened URL state (prefers compact 28-char link for WhatsApp & Status)
  const [shortUrl, setShortUrl] = useState<string>("");
  const [isShortening, setIsShortening] = useState<boolean>(false);

  useEffect(() => {
    if (!targetShareUrl) {
      setShortUrl("");
      setIsShortening(false);
      return;
    }
    let mounted = true;
    setIsShortening(true);
    getShortenedUrl(targetShareUrl).then((short) => {
      if (mounted) {
        setIsShortening(false);
        if (short && short !== targetShareUrl) {
          setShortUrl(short);
        } else {
          setShortUrl("");
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, [targetShareUrl]);

  // Effective share URL (prefers compact short link)
  const effectiveShareUrl = shortUrl || targetShareUrl;

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
    setIsSpinningTopic(true);
    setTimeout(() => setIsSpinningTopic(false), 850);
  };

  const handleAcceptTopic = () => {
    setTimerRunning(false);
    setTimeLeft(notesTimeLimit);
    setPhase("notes");
  };

  const handleRespin = () => {
    setIsSpinningTopic(true);
    spinLocalTopic();
    setTimeout(() => setIsSpinningTopic(false), 850);
  };

  const handleConfirmCustom = () => {
    setCustomTopic(customInput, customSubInput);
    confirmCustomTopic();
    setShowCustomForm(false);
    setPhase("notes");
  };

  const handleDesignYourself = () => {
    createManualDeck(profile.username || "Scholar");
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
      setGenerationError(err.message || "Something went wrong while contacting AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (!generatedDeck) return;
    setPhase("share");
  };

  const handleCopyLink = async () => {
    let urlToCopy = shortUrl;
    if (!urlToCopy) {
      if (isShortening) {
        try {
          const res = await getShortenedUrl(targetShareUrl);
          if (res && res !== targetShareUrl) urlToCopy = res;
        } catch {}
      }
      if (!urlToCopy) urlToCopy = targetShareUrl;
    }
    if (!urlToCopy) return;
    const ok = await copyTextToClipboard(urlToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold mb-6 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors group"
              >
                <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
                <span>Back to Games</span>
              </Link>
              <div className="flex items-center gap-3.5 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border relative group"
                  style={{ background: "rgba(166,124,30,0.12)", borderColor: "rgba(166,124,30,0.25)" }}
                >
                  <FeyLogo size={36} />
                  <span className="absolute -bottom-1 -right-1 text-sm drop-shadow-sm">🎤</span>
                </div>
                <div>
                  <h1
                    className="font-space text-4xl font-extrabold tracking-tight"
                    style={{ color: "var(--text)" }}
                  >
                    The Podium
                  </h1>
                  <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                    Spin a topic · Jot your hot takes · Design slides with or without AI
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

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleStartNew}
                className="w-full py-4 rounded-2xl font-space font-extrabold text-lg tracking-tight flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90"
                style={{ background: "var(--terra)", color: "#fff" }}
              >
                <Shuffle size={20} /> Spin a Hot-Take Topic
              </button>

              <button
                onClick={() => {
                  reset();
                  setShowCustomForm(true);
                }}
                className="w-full py-3.5 rounded-2xl font-space font-bold text-sm tracking-tight flex items-center justify-center gap-2 cursor-pointer border hover:opacity-90 transition-opacity"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-dim)",
                  color: "var(--text)",
                }}
              >
                <PenLine size={15} style={{ color: "var(--gold)" }} /> Or Write Your Own Topic
              </button>
            </div>

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
            className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative"
          >
            {/* Top Back Navigation */}
            <div className="absolute top-6 left-4 sm:left-8">
              <button
                type="button"
                onClick={() => setPhase("lobby")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                style={{ color: "var(--text-dim)" }}
              >
                <ArrowLeft size={13} /> Back to Lobby
              </button>
            </div>

            <TopicSpinner topic={currentTopic} isSpinning={isSpinningTopic} />

            <div className="w-full max-w-lg mt-10 space-y-3">
              {/* Accept */}
              <button
                onClick={handleAcceptTopic}
                disabled={isSpinningTopic}
                className="w-full py-4 rounded-2xl font-space font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--terra)", color: "#fff" }}
              >
                <ChevronRight size={18} /> Accept This Topic
              </button>

              {/* Re-spin / Custom */}
              <div className="flex gap-3">
                <button
                  onClick={handleRespin}
                  disabled={isSpinningTopic}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
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
                  disabled={isSpinningTopic}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50"
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
            {/* Top Back Navigation Breadcrumbs */}
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPhase("topic")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                style={{ color: "var(--text-dim)" }}
              >
                <ArrowLeft size={13} /> Back to Topic
              </button>
              <span className="text-xs" style={{ color: "var(--border-dim)" }}>·</span>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setPhase("lobby");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                style={{ color: "var(--text-mute)" }}
              >
                Exit to Lobby
              </button>
            </div>

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

            {/* Slide Creation Modes */}
            <div className="mt-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Design Slides Yourself (Instant & Zero Dependency) */}
                <button
                  type="button"
                  onClick={handleDesignYourself}
                  className="p-4 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] hover:border-[var(--gold)] group flex flex-col justify-between"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-dim)",
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">✍️</span>
                      <span
                        className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "rgba(166,124,30,0.15)", color: "var(--gold)" }}
                      >
                        Instant · 0ms
                      </span>
                    </div>
                    <div className="font-space font-extrabold text-base mb-1 text-[var(--text)] group-hover:text-[var(--gold)] transition-colors">
                      Design Slides Yourself
                    </div>
                    <div className="text-xs text-[var(--text-dim)] leading-relaxed">
                      Convert your topic &amp; notes directly into editable slides. No AI latency, full creative control.
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold" style={{ color: "var(--gold)" }}>
                    Open Slide Studio <ChevronRight size={13} />
                  </div>
                </button>

                {/* 2. Generate with AI (Gemini speechwriter) */}
                <button
                  type="button"
                  onClick={handleGenerateSlides}
                  className="p-4 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.01] hover:border-[var(--terra)] group flex flex-col justify-between"
                  style={{
                    background: "color-mix(in srgb, var(--terra) 8%, var(--bg-card))",
                    borderColor: "rgba(140, 45, 25, 0.4)",
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">✨</span>
                      <span
                        className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "var(--terra)", color: "#fff" }}
                      >
                        AI Speechwriter
                      </span>
                    </div>
                    <div className="font-space font-extrabold text-base mb-1 text-[var(--text)] group-hover:text-[var(--terra)] transition-colors">
                      Generate with AI
                    </div>
                    <div className="text-xs text-[var(--text-dim)] leading-relaxed">
                      Let Fay-re brainstorm bold punchlines, structure arguments, and polish your notes into 5 punchy slides.
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold" style={{ color: "var(--terra)" }}>
                    Build with AI <Sparkles size={13} />
                  </div>
                </button>
              </div>

              {/* Back button */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setPhase("topic")}
                  className="text-xs font-semibold cursor-pointer hover:opacity-75 transition-opacity"
                  style={{ color: "var(--text-mute)" }}
                >
                  ← Pick or spin a different topic
                </button>
              </div>
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
            {/* Spinning active ring around branded Fey logo */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-6">
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--gold)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              />
              <FeyLogo size={64} spinning={true} />
            </div>

            <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-[var(--gold)] mb-2 animate-pulse">
              Fay-re Synthesis...
            </span>

            <h2
              className="font-space font-extrabold text-2xl mb-2"
              style={{ color: "var(--text)" }}
            >
              Building your slides...
            </h2>
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              Fay-re is crafting your masterpiece.
            </p>

            {generationError && (
              <div className="mt-6 p-5 rounded-2xl border border-red-500/30 bg-red-500/10 text-sm max-w-md mx-auto space-y-3">
                <p className="font-bold text-red-400">AI Slide Generation Notice</p>
                <p className="text-xs text-red-300/90 leading-relaxed">{generationError}</p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={handleDesignYourself}
                    className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs cursor-pointer transition-opacity text-white flex items-center justify-center gap-1.5 shadow-sm"
                    style={{ background: "var(--terra)" }}
                  >
                    <PenLine size={13} /> Draft from my notes instead
                  </button>
                  <button
                    onClick={() => setPhase("notes")}
                    className="py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer hover:bg-white/5 transition-colors"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                  >
                    ← Back to Notes
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════
            PREVIEW  (with inline slide editing)
            ════════════════════════════════════════ */}
        {phase === "preview" && generatedDeck && (() => {
          const editSlide = editingSlideIndex !== null ? generatedDeck.slides[editingSlideIndex] : null;
          return (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto px-4 sm:px-8 py-8"
            >
              {/* Top Back Navigation Breadcrumbs */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPhase("notes")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                  style={{ color: "var(--text-dim)" }}
                >
                  <ArrowLeft size={13} /> Back to Notes
                </button>
                <span className="text-xs" style={{ color: "var(--border-dim)" }}>·</span>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setPhase("lobby");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                  style={{ color: "var(--text-mute)" }}
                >
                  Exit to Lobby
                </button>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-mute)" }}>
                    Preview & Edit
                  </p>
                  <h2 className="font-space font-extrabold text-xl" style={{ color: "var(--text)" }}>
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

              {/* Deck Theme Selector Bar */}
              <div
                className="p-3 sm:p-4 mb-6 rounded-2xl border flex flex-wrap items-center justify-between gap-3"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)" }}
              >
                <div className="flex items-center gap-2">
                  <Palette size={15} style={{ color: "var(--gold)" }} />
                  <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Deck Theme:</span>
                  <span className="text-xs hidden sm:inline" style={{ color: "var(--text-mute)" }}>
                    Switch palette across all slides
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PODIUM_THEMES.map((theme) => {
                    const isCurrentTheme =
                      generatedDeck.slides[0]?.bgColor.toLowerCase() === theme.bgColor.toLowerCase();
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => applyThemeToDeck(theme)}
                        title={`${theme.name} — ${theme.description}`}
                        className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                          isCurrentTheme
                            ? "border-[var(--terra)] shadow-sm scale-105"
                            : "border-[var(--border-dim)] hover:border-[var(--border)] opacity-85 hover:opacity-100"
                        }`}
                        style={{ background: "var(--bg-input)", color: "var(--text)" }}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 flex items-center justify-center shrink-0"
                          style={{ backgroundColor: theme.bgColor }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                        </span>
                        <span className="text-[11px]">{theme.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Two-column layout: thumbnails + editor */}
              <div className="flex gap-6 items-start">


                {/* ── Left: slide list ── */}
                <div className="flex-1 space-y-3 min-w-0">
                  {generatedDeck.slides.map((slide, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-2xl overflow-hidden border transition-all"
                      style={{
                        borderColor: editingSlideIndex === i ? "var(--terra)" : "var(--border-dim)",
                        boxShadow: editingSlideIndex === i ? "0 0 0 2px var(--terra)" : "none",
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        className="h-28 sm:h-36 cursor-pointer"
                        style={{ background: slide.bgColor }}
                        onClick={() => { setCurrentSlide(i); setPhase("present"); }}
                      >
                        <SlideRenderer slide={slide} isThumb />
                      </div>

                      {/* Footer row */}
                      <div
                        className="px-4 py-2 flex items-center gap-2 sm:gap-3"
                        style={{ background: "var(--bg-card)" }}
                      >
                        <span className="font-mono text-xs font-semibold shrink-0" style={{ color: "var(--text-mute)" }}>
                          {i + 1}
                        </span>
                        <span className="text-xs font-bold truncate flex-1" style={{ color: "var(--text)" }}>
                          {slide.title}
                        </span>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase shrink-0"
                          style={{ background: "var(--bg-input)", color: "var(--text-mute)" }}
                        >
                          {slide.layout}
                        </span>

                        {/* Reorder buttons */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSlide(i, i - 1);
                              if (editingSlideIndex === i) setEditingSlideIndex(i - 1);
                              else if (editingSlideIndex === i - 1) setEditingSlideIndex(i);
                            }}
                            disabled={i === 0}
                            title="Move slide up"
                            className="p-1 rounded hover:bg-[var(--bg-input)] cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                          >
                            <ArrowUp size={12} style={{ color: "var(--text-dim)" }} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSlide(i, i + 1);
                              if (editingSlideIndex === i) setEditingSlideIndex(i + 1);
                              else if (editingSlideIndex === i + 1) setEditingSlideIndex(i);
                            }}
                            disabled={i === generatedDeck.slides.length - 1}
                            title="Move slide down"
                            className="p-1 rounded hover:bg-[var(--bg-input)] cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                          >
                            <ArrowDown size={12} style={{ color: "var(--text-dim)" }} />
                          </button>
                        </div>

                        {/* Delete button (if >1 slide) */}
                        {generatedDeck.slides.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSlide(i);
                              if (editingSlideIndex === i) {
                                setEditingSlideIndex(null);
                              } else if (editingSlideIndex !== null && editingSlideIndex > i) {
                                setEditingSlideIndex(editingSlideIndex - 1);
                              }
                            }}
                            title="Delete slide"
                            className="p-1 rounded hover:bg-red-500/10 cursor-pointer transition-colors shrink-0"
                          >
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        )}

                        <button
                          onClick={() => setEditingSlideIndex(editingSlideIndex === i ? null : i)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                          style={{
                            borderColor: editingSlideIndex === i ? "var(--terra)" : "var(--border-dim)",
                            color: editingSlideIndex === i ? "var(--terra)" : "var(--text-dim)",
                            background: editingSlideIndex === i ? "color-mix(in srgb, var(--terra) 10%, transparent)" : "transparent",
                          }}
                        >
                          <Pencil size={11} />
                          {editingSlideIndex === i ? "Done" : "Edit"}
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Add Slide Toolbar */}
                  <div
                    className="p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Plus size={15} style={{ color: "var(--gold)" }} />
                      <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Add Slide:</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      {([
                        { layout: "title-body", label: "Body Text" },
                        { layout: "title-bullets", label: "Bullets" },
                        { layout: "quote", label: "Quote" },
                        { layout: "title-only", label: "Cover" },
                        { layout: "closing", label: "Closing" },
                      ] as const).map(({ layout, label }) => (
                        <button
                          key={layout}
                          type="button"
                          onClick={() => {
                            addSlide(layout);
                            setEditingSlideIndex(generatedDeck.slides.length);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 hover:border-[var(--terra)] hover:text-[var(--terra)] transition-all cursor-pointer"
                          style={{
                            borderColor: "var(--border-dim)",
                            background: "var(--bg-input)",
                            color: "var(--text-dim)",
                          }}
                        >
                          <Plus size={11} /> {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Right: edit panel ── */}
                <AnimatePresence>
                  {editSlide !== null && editingSlideIndex !== null && (
                    <motion.div
                      key={`edit-${editingSlideIndex}`}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      className="w-80 shrink-0 rounded-2xl border p-5 sticky top-6"
                      style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)" }}
                    >
                      {/* Panel header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-mute)" }}>
                            Slide {editingSlideIndex + 1} of {generatedDeck.slides.length}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (editingSlideIndex > 0) {
                                moveSlide(editingSlideIndex, editingSlideIndex - 1);
                                setEditingSlideIndex(editingSlideIndex - 1);
                              }
                            }}
                            disabled={editingSlideIndex === 0}
                            title="Move slide up"
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] cursor-pointer disabled:opacity-20 transition-opacity"
                          >
                            <ArrowUp size={13} style={{ color: "var(--text-dim)" }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingSlideIndex < generatedDeck.slides.length - 1) {
                                moveSlide(editingSlideIndex, editingSlideIndex + 1);
                                setEditingSlideIndex(editingSlideIndex + 1);
                              }
                            }}
                            disabled={editingSlideIndex === generatedDeck.slides.length - 1}
                            title="Move slide down"
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] cursor-pointer disabled:opacity-20 transition-opacity"
                          >
                            <ArrowDown size={13} style={{ color: "var(--text-dim)" }} />
                          </button>
                          {generatedDeck.slides.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                deleteSlide(editingSlideIndex);
                                setEditingSlideIndex(null);
                              }}
                              title="Delete slide"
                              className="p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors"
                            >
                              <Trash2 size={13} className="text-red-400" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingSlideIndex(null)}
                            title="Close edit panel"
                            className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] cursor-pointer"
                          >
                            <X size={14} style={{ color: "var(--text-mute)" }} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">

                        {/* Layout Selector */}
                        <div>
                          <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-dim)" }}>
                            Slide Layout
                          </label>
                          <div
                            className="grid grid-cols-3 gap-1 p-1 rounded-xl border text-center"
                            style={{ background: "var(--bg-base)", borderColor: "var(--border-dim)" }}
                          >
                            {([
                              { id: "title-body", label: "Body" },
                              { id: "title-bullets", label: "Bullets" },
                              { id: "quote", label: "Quote" },
                              { id: "title-only", label: "Cover" },
                              { id: "closing", label: "Closing" },
                            ] as const).map(({ id, label }) => {
                              const isCurrent = editSlide.layout === id;
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => changeSlideLayout(editingSlideIndex, id as SlideLayout)}
                                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer truncate ${
                                    isCurrent
                                      ? "bg-[var(--terra)] text-white shadow-sm"
                                      : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--bg-card)]"
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Title — all layouts */}
                        <div>
                          <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-dim)" }}>
                            Title
                          </label>
                          <textarea
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl border bg-transparent text-sm resize-none focus:outline-none focus:ring-1"
                            style={{ borderColor: "var(--border-dim)", color: "var(--text)", outlineColor: "var(--terra)" }}
                            value={editSlide.title}
                            onChange={(e) => updateSlide(editingSlideIndex, { title: e.target.value })}
                          />
                        </div>

                        {/* Subtitle — title-only */}
                        {(editSlide.layout === "title-only") && (
                          <div>
                            <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-dim)" }}>
                              Subtitle
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-xl border bg-transparent text-sm focus:outline-none"
                              style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                              value={editSlide.subtitle ?? ""}
                              onChange={(e) => updateSlide(editingSlideIndex, { subtitle: e.target.value })}
                            />
                          </div>
                        )}

                        {/* Body — title-body */}
                        {editSlide.layout === "title-body" && (
                          <div>
                            <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-dim)" }}>
                              Body text
                            </label>
                            <textarea
                              rows={4}
                              className="w-full px-3 py-2 rounded-xl border bg-transparent text-sm resize-none focus:outline-none"
                              style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                              value={editSlide.body ?? ""}
                              onChange={(e) => updateSlide(editingSlideIndex, { body: e.target.value })}
                            />
                          </div>
                        )}

                        {/* Bullets — title-bullets */}
                        {editSlide.layout === "title-bullets" && (
                          <div>
                            <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-dim)" }}>
                              Bullet points
                            </label>
                            <div className="space-y-2">
                              {(editSlide.bullets ?? []).map((bullet, bi) => (
                                <div key={bi} className="flex gap-2 items-start">
                                  <span className="mt-2.5 text-xs shrink-0" style={{ color: "var(--terra)" }}>→</span>
                                  <input
                                    type="text"
                                    className="flex-1 px-3 py-2 rounded-xl border bg-transparent text-sm focus:outline-none"
                                    style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                                    value={bullet}
                                    onChange={(e) => {
                                      const bullets = [...(editSlide.bullets ?? [])];
                                      bullets[bi] = e.target.value;
                                      updateSlide(editingSlideIndex, { bullets });
                                    }}
                                  />
                                  <button
                                    onClick={() => {
                                      const bullets = (editSlide.bullets ?? []).filter((_, idx) => idx !== bi);
                                      updateSlide(editingSlideIndex, { bullets });
                                    }}
                                    className="mt-1.5 p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
                                  >
                                    <Trash2 size={12} className="text-red-400" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const bullets = [...(editSlide.bullets ?? []), "New point"];
                                  updateSlide(editingSlideIndex, { bullets });
                                }}
                                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border cursor-pointer hover:opacity-80 w-full mt-1"
                                style={{ borderColor: "var(--border-dim)", color: "var(--text-mute)", borderStyle: "dashed" }}
                              >
                                <Plus size={11} /> Add bullet
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Quote + Attribution — quote layout */}
                        {editSlide.layout === "quote" && (
                          <>
                            <div>
                              <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-dim)" }}>
                                Quote
                              </label>
                              <textarea
                                rows={3}
                                className="w-full px-3 py-2 rounded-xl border bg-transparent text-sm resize-none focus:outline-none font-serif italic"
                                style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                                value={editSlide.quote ?? ""}
                                onChange={(e) => updateSlide(editingSlideIndex, { quote: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text-dim)" }}>
                                Attribution
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 rounded-xl border bg-transparent text-sm focus:outline-none"
                                style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                                value={editSlide.attribution ?? ""}
                                onChange={(e) => updateSlide(editingSlideIndex, { attribution: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {/* Slide Image (Available on any slide) */}
                        <div className="pt-3 border-t" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-dim)" }}>
                              <ImageIcon size={13} style={{ color: "var(--gold)" }} />
                              Slide Image (optional)
                            </label>
                            {editSlide.imageUrl && (
                              <button
                                type="button"
                                onClick={() => updateSlide(editingSlideIndex, { imageUrl: undefined })}
                                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Trash2 size={11} /> Remove
                              </button>
                            )}
                          </div>

                          {editSlide.imageUrl ? (
                            <div className="space-y-2">
                              <div
                                className="relative rounded-xl overflow-hidden border p-1"
                                style={{ borderColor: "var(--border-dim)", background: "var(--bg-base)" }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={editSlide.imageUrl}
                                  alt="Slide attachment"
                                  className="w-full h-24 object-contain rounded-lg"
                                />
                              </div>
                              <label
                                className="w-full py-1.5 rounded-lg border text-center text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center gap-1.5"
                                style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                              >
                                <Upload size={12} />
                                Change Image
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const compressed = await compressImageFile(file);
                                    updateSlide(editingSlideIndex, { imageUrl: compressed });
                                  }}
                                />
                              </label>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <label
                                className="w-full py-2.5 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)", background: "var(--bg-base)" }}
                              >
                                <Upload size={13} style={{ color: "var(--gold)" }} />
                                Upload Photo / Meme
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const compressed = await compressImageFile(file);
                                    updateSlide(editingSlideIndex, { imageUrl: compressed });
                                  }}
                                />
                              </label>

                              <input
                                type="url"
                                placeholder="Or paste image link (https://...)"
                                className="w-full px-3 py-1.5 rounded-lg border bg-transparent text-xs focus:outline-none"
                                style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const val = (e.target as HTMLInputElement).value.trim();
                                    if (val) {
                                      updateSlide(editingSlideIndex, { imageUrl: val });
                                      (e.target as HTMLInputElement).value = "";
                                    }
                                  }
                                }}
                                onBlur={(e) => {
                                  const val = e.target.value.trim();
                                  if (val) {
                                    updateSlide(editingSlideIndex, { imageUrl: val });
                                    e.target.value = "";
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Slide Colors & Theme */}
                        <div className="pt-3 border-t" style={{ borderColor: "var(--border-dim)" }}>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--text-dim)" }}>
                              <Palette size={13} style={{ color: "var(--gold)" }} />
                              Slide Colors
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                applyThemeToDeck({
                                  bgColor: editSlide.bgColor,
                                  textColor: editSlide.textColor,
                                  accentColor: editSlide.accentColor,
                                });
                              }}
                              className="text-[11px] font-semibold text-[var(--terra)] hover:underline cursor-pointer"
                              title="Apply this color scheme to all slides in the deck"
                            >
                              Apply to all slides
                            </button>
                          </div>

                          {/* Quick Palette Swatches */}
                          <div className="grid grid-cols-5 gap-1.5 mb-3">
                            {PODIUM_THEMES.map((theme) => {
                              const isSelected =
                                editSlide.bgColor.toLowerCase() === theme.bgColor.toLowerCase();
                              return (
                                <button
                                  key={theme.id}
                                  type="button"
                                  onClick={() => {
                                    updateSlide(editingSlideIndex, {
                                      bgColor: theme.bgColor,
                                      textColor: theme.textColor,
                                      accentColor: theme.accentColor,
                                    });
                                  }}
                                  title={theme.name}
                                  className={`h-7 rounded-lg border flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                                    isSelected
                                      ? "ring-2 ring-[var(--terra)]"
                                      : "opacity-80 hover:opacity-100"
                                  }`}
                                  style={{
                                    backgroundColor: theme.bgColor,
                                    borderColor: isSelected ? "var(--terra)" : "var(--border-dim)",
                                  }}
                                >
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: theme.accentColor }}
                                  />
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom Color Inputs */}
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-[10px] block font-mono text-[var(--text-mute)] mb-1">Background</span>
                              <div
                                className="flex items-center gap-1 border rounded-lg p-1"
                                style={{ borderColor: "var(--border-dim)", background: "var(--bg-base)" }}
                              >
                                <input
                                  type="color"
                                  value={editSlide.bgColor.startsWith("#") ? editSlide.bgColor : "#0052cc"}
                                  onChange={(e) => updateSlide(editingSlideIndex, { bgColor: e.target.value })}
                                  className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={editSlide.bgColor}
                                  onChange={(e) => updateSlide(editingSlideIndex, { bgColor: e.target.value })}
                                  className="w-full text-[10px] font-mono bg-transparent focus:outline-none truncate"
                                  style={{ color: "var(--text)" }}
                                />
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] block font-mono text-[var(--text-mute)] mb-1">Text</span>
                              <div
                                className="flex items-center gap-1 border rounded-lg p-1"
                                style={{ borderColor: "var(--border-dim)", background: "var(--bg-base)" }}
                              >
                                <input
                                  type="color"
                                  value={editSlide.textColor.startsWith("#") ? editSlide.textColor : "#ffffff"}
                                  onChange={(e) => updateSlide(editingSlideIndex, { textColor: e.target.value })}
                                  className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={editSlide.textColor}
                                  onChange={(e) => updateSlide(editingSlideIndex, { textColor: e.target.value })}
                                  className="w-full text-[10px] font-mono bg-transparent focus:outline-none truncate"
                                  style={{ color: "var(--text)" }}
                                />
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] block font-mono text-[var(--text-mute)] mb-1">Accent</span>
                              <div
                                className="flex items-center gap-1 border rounded-lg p-1"
                                style={{ borderColor: "var(--border-dim)", background: "var(--bg-base)" }}
                              >
                                <input
                                  type="color"
                                  value={editSlide.accentColor.startsWith("#") ? editSlide.accentColor : "#ffd166"}
                                  onChange={(e) => updateSlide(editingSlideIndex, { accentColor: e.target.value })}
                                  className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                                />
                                <input
                                  type="text"
                                  value={editSlide.accentColor}
                                  onChange={(e) => updateSlide(editingSlideIndex, { accentColor: e.target.value })}
                                  className="w-full text-[10px] font-mono bg-transparent focus:outline-none truncate"
                                  style={{ color: "var(--text)" }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Live preview strip */}

                      <div className="mt-5">
                        <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--text-mute)" }}>
                          Live preview
                        </p>
                        <div
                          className="rounded-xl overflow-hidden"
                          style={{ height: 120, background: editSlide.bgColor }}
                        >
                          <SlideRenderer slide={editSlide} isThumb />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom action */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { reset(); setPhase("lobby"); }}
                  className="flex-1 py-3 rounded-2xl border font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                >
                  Start Over
                </button>
              </div>
            </motion.div>
          );
        })()}

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
        {phase === "share" && generatedDeck && (() => {
          const featuredSlide =
            generatedDeck.slides[featuredSlideIndex] || generatedDeck.slides[0];
          const hasCustomQuote = featuredQuote.trim().length > 0;
          const displayQuote = hasCustomQuote
            ? `“${featuredQuote.trim()}”`
            : featuredSlideIndex > 0
            ? (featuredSlide.quote ? `“${featuredSlide.quote}”` : featuredSlide.title)
            : `“${generatedDeck.subtitle || generatedDeck.topic}”`;

          const shareHeadline = hasCustomQuote
            ? `${displayQuote}\n\n— From presentation: "${generatedDeck.topic}" 🎤`
            : featuredSlideIndex > 0
            ? `${displayQuote} (Slide ${featuredSlideIndex + 1} of ${generatedDeck.slides.length})\n\nFrom presentation: "${generatedDeck.topic}" 🎤`
            : `Check out my presentation: "${generatedDeck.topic}" 🎤`;

          const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
            `${shareHeadline}\n\n${effectiveShareUrl}`
          )}`;
          const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareHeadline
          )}&url=${encodeURIComponent(effectiveShareUrl)}`;
          const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            effectiveShareUrl
          )}`;

          return (
            <motion.div
              key="share"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto px-4 sm:px-6 py-8 text-center"
            >
              {/* Top Back Navigation */}
              <div className="flex items-center justify-between mb-6 text-left">
                <button
                  type="button"
                  onClick={() => setPhase("preview")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                  style={{ color: "var(--text-dim)" }}
                >
                  <ArrowLeft size={13} /> Back to Slide Studio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setPhase("lobby");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                  style={{ color: "var(--text-mute)" }}
                >
                  Exit to Lobby
                </button>
              </div>

              <div className="text-5xl mb-3">🎤</div>
              <h2
                className="font-space font-extrabold text-2xl mb-1.5"
                style={{ color: "var(--text)" }}
              >
                Your slide deck is ready!
              </h2>
              <p className="text-xs sm:text-sm mb-6" style={{ color: "var(--text-dim)" }}>
                Share anywhere — recipients see your custom preview card and can browse without an account.
              </p>

              {/* ── Featured Slide / Highlight Section ── */}
              <div
                className="p-4 rounded-2xl border mb-5 text-left"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)" }}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text)" }}>
                    <Sparkles size={13} style={{ color: "var(--gold)" }} />
                    Highlight in Preview Card
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>
                    Slide {featuredSlideIndex + 1} of {generatedDeck.slides.length}
                  </span>
                </div>

                <p className="text-[11px] mb-3" style={{ color: "var(--text-mute)" }}>
                  Choose which slide appears as the main image and punchline when sharing on WhatsApp, X, and LinkedIn:
                </p>

                {/* Slide Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
                  {generatedDeck.slides.map((s, idx) => {
                    const isSelected = featuredSlideIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFeaturedSlideIndex(idx)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 border transition-all cursor-pointer flex flex-col items-start gap-0.5 text-left ${
                          isSelected ? "ring-2 ring-[var(--terra)]" : "opacity-75 hover:opacity-100"
                        }`}
                        style={{
                          borderColor: isSelected ? "var(--terra)" : "var(--border-dim)",
                          background: isSelected ? "color-mix(in srgb, var(--terra) 12%, var(--bg-card))" : "var(--bg-base)",
                          color: isSelected ? "var(--terra)" : "var(--text-dim)",
                          minWidth: 100,
                        }}
                      >
                        <span className="font-mono text-[10px]">
                          {idx === 0 ? "★ Slide 1 (Cover)" : `Slide ${idx + 1}`}
                        </span>
                        <span className="max-w-[130px] truncate text-[11px] font-semibold text-[var(--text)]">
                          {s.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Highlight Punchline */}
                <div>
                  <label className="block text-[11px] font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
                    Custom Punchline or Takeaway (optional override):
                  </label>
                  <input
                    type="text"
                    value={featuredQuote}
                    onChange={(e) => setFeaturedQuote(e.target.value)}
                    placeholder={
                      featuredSlideIndex > 0
                        ? (featuredSlide.quote || featuredSlide.title || "e.g. A punchy takeaway from this slide")
                        : (generatedDeck.subtitle || generatedDeck.topic || "e.g. A bold opening statement")
                    }
                    className="w-full px-3 py-2 rounded-xl border bg-transparent text-xs focus:outline-none"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                  />
                </div>
              </div>

              {/* Dynamic Live Preview Card */}
              <div
                className="rounded-2xl overflow-hidden mb-6 border shadow-sm"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <div
                  className="h-44 sm:h-52"
                  style={{ background: featuredSlide.bgColor }}
                >
                  <SlideRenderer slide={featuredSlide} isThumb />
                </div>
                <div
                  className="px-4 py-2.5 border-t flex items-center justify-between text-xs"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)" }}
                >
                  <span className="text-[11px] font-serif italic truncate flex-1 text-left mr-2" style={{ color: "var(--text-dim)" }}>
                    {displayQuote}
                  </span>
                  <span
                    className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: "var(--bg-input)", color: "var(--text-mute)" }}
                  >
                    Card Preview
                  </span>
                </div>
              </div>

              {/* Link label and compact status badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "var(--text-dim)" }}>
                  Shareable Link:
                </span>
                {isShortening ? (
                  <span className="text-[11px] flex items-center gap-1 font-mono text-[var(--gold)] animate-pulse">
                    <Sparkles size={11} /> Shortening link for WhatsApp...
                  </span>
                ) : shortUrl ? (
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <Check size={11} /> WhatsApp &amp; Status Ready
                  </span>
                ) : null}
              </div>

              {/* Copy link row */}
              <div className="flex gap-2 mb-4">
                <input
                  readOnly
                  value={effectiveShareUrl}
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

              {/* Social share row */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2.5 mb-6">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px] py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: "rgba(37, 211, 102, 0.4)",
                    background: "rgba(37, 211, 102, 0.08)",
                    color: "#25D366",
                  }}
                >
                  <span>💬 WhatsApp</span>
                </a>
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[100px] py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: "var(--border-dim)",
                    color: "var(--text-dim)",
                  }}
                >
                  𝕏 Share on X
                </a>
                <a
                  href={linkedInShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[100px] py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-80 transition-opacity"
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
          );
        })()}

      </AnimatePresence>

      {/* Global Custom Topic Modal */}
      <AnimatePresence>
        {showCustomForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCustomForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-3xl p-6 border shadow-2xl"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-dim)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="font-space font-bold text-lg"
                  style={{ color: "var(--text)" }}
                >
                  Custom Presentation Topic
                </h3>
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="p-1 rounded-lg hover:bg-[var(--bg-input)] cursor-pointer"
                >
                  <X size={16} style={{ color: "var(--text-mute)" }} />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
                    Presentation Title / Thesis
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                    placeholder="e.g. Remote work proved 50% of meetings are pointless"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
                    Subtitle / Frame (optional)
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border bg-transparent text-sm focus:outline-none"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                    placeholder="e.g. An Unsolicited Exposé · Field Notes"
                    value={customSubInput}
                    onChange={(e) => setCustomSubInput(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmCustom}
                disabled={!customInput.trim()}
                className="w-full py-3.5 rounded-xl font-bold text-sm cursor-pointer disabled:opacity-40 transition-opacity shadow-sm"
                style={{ background: "var(--terra)", color: "#fff" }}
              >
                Continue to Notes &amp; Slides →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
