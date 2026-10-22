"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shuffle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Mic,
  Timer,
  Flame,
} from "lucide-react";
import {
  ACCESSIBLE_ONBOARDING_TOPICS,
  CATEGORY_ICONS,
  type Topic,
} from "@/lib/topics";
import { useAppStore } from "@/store/useAppStore";
import FeyLogo from "@/components/ui/FeyLogo";

interface LandingTopicSpinnerProps {
  onStartClick?: () => void;
  className?: string;
}

export default function LandingTopicSpinner({
  onStartClick,
  className = "",
}: LandingTopicSpinnerProps) {
  const router = useRouter();
  const { isOnboarded, setPendingTopic } = useAppStore();

  const [status, setStatus] = useState<"idle" | "spinning" | "revealed">("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const spinIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTopic: Topic =
    ACCESSIBLE_ONBOARDING_TOPICS[currentIndex] ?? ACCESSIBLE_ONBOARDING_TOPICS[0];

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  const handleSpin = () => {
    if (status === "spinning") return;
    setStatus("spinning");

    const totalTopics = ACCESSIBLE_ONBOARDING_TOPICS.length;
    let stepCount = 0;
    const maxSteps = 12;

    if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);

    spinIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalTopics);
      stepCount++;

      if (stepCount >= maxSteps) {
        if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
        // Land on a random topic different from current
        let randIndex = Math.floor(Math.random() * totalTopics);
        if (randIndex === currentIndex && totalTopics > 1) {
          randIndex = (randIndex + 1) % totalTopics;
        }
        setCurrentIndex(randIndex);
        setStatus("revealed");
      }
    }, 75);
  };

  const handleAcceptTopic = () => {
    setAccepted(true);
    setPendingTopic(currentTopic);

    // Brief visual confirmation before transitioning
    setTimeout(() => {
      if (!isOnboarded) {
        if (onStartClick) {
          onStartClick();
        } else {
          router.push("/?accepted=1");
        }
      } else {
        router.push("/?accepted=1");
      }
    }, 280);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background shadow layer */}
      <div
        className="absolute -inset-3 sm:-inset-4 rounded-[28px] rotate-1 sm:rotate-2 pointer-events-none"
        style={{
          background: "rgba(92,106,54,0.07)",
          border: "1px solid var(--border-dim)",
        }}
      />

      {/* Main interactive card */}
      <div
        className="relative surface-hero rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_-20px_rgba(30,34,17,0.22)] border"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b" style={{ borderColor: "var(--border-dim)" }}>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "var(--terra)" }}
            />
            <span
              className="font-mono text-[11px] uppercase tracking-widest font-semibold"
              style={{ color: "var(--text-mute)" }}
            >
              Daily Speaking Sprint
            </span>
          </div>

          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "var(--gold-bg)", color: "var(--gold)" }}
          >
            <Flame size={13} /> 12-day streak
          </span>
        </div>

        <AnimatePresence mode="wait">
          {/* ── 1. IDLE STATE: Centered Fey Logo with "Spin me" + Feynman Loop Preview ── */}
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              {/* Central Fey Logo Button with spinning dashed ring */}
              <button
                type="button"
                onClick={handleSpin}
                className="group flex flex-col items-center justify-center cursor-pointer focus:outline-none py-3 my-2 text-center"
                title="Click to spin a topic"
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--gold)] opacity-50 group-hover:opacity-100 transition-opacity"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  />
                  <div
                    className="w-18 h-18 rounded-full flex items-center justify-center surface-raised border shadow-sm transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
                    style={{
                      background: "var(--bg-input)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <FeyLogo size={42} />
                  </div>
                </div>

                <div className="mt-3.5">
                  <span
                    className="font-space font-bold text-lg sm:text-xl block tracking-tight group-hover:text-[var(--terra)] transition-colors"
                    style={{ color: "var(--text)" }}
                  >
                    Spin me
                  </span>
                  <p
                    className="text-xs mt-1 max-w-xs"
                    style={{ color: "var(--text-dim)" }}
                  >
                    Click to discover a prompt and test your articulation
                  </p>
                </div>

                <div
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border surface hover:border-[var(--olive)] transition-colors"
                  style={{
                    borderColor: "var(--border-dim)",
                    color: "var(--olive)",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tap to spin a topic</span>
                </div>
              </button>

              {/* Feynman Sprint Checklist Preview */}
              <div className="mt-3 pt-4 border-t space-y-2" style={{ borderColor: "var(--border-dim)" }}>
                <div className="flex items-center justify-between text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>
                  <span>HOW THE 90S SPRINT WORKS</span>
                  <span>3 SIMPLE STEPS</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl border text-[11px]" style={{ background: "var(--bg-base)", borderColor: "var(--border-dim)" }}>
                    <span className="font-bold block" style={{ color: "var(--olive)" }}>1. Synthesize</span>
                    <span className="text-[10px]" style={{ color: "var(--text-mute)" }}>5m research</span>
                  </div>
                  <div className="p-2 rounded-xl border text-[11px]" style={{ background: "var(--terra-bg)", borderColor: "rgba(122,28,46,0.2)" }}>
                    <span className="font-bold block" style={{ color: "var(--terra)" }}>2. Articulate</span>
                    <span className="text-[10px]" style={{ color: "var(--text-mute)" }}>90s voice</span>
                  </div>
                  <div className="p-2 rounded-xl border text-[11px]" style={{ background: "var(--bg-base)", borderColor: "var(--border-dim)" }}>
                    <span className="font-bold block" style={{ color: "var(--olive)" }}>3. Reflect</span>
                    <span className="text-[10px]" style={{ color: "var(--text-mute)" }}>Self-critique</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── 2. SPINNING STATE: Animated Logo and Topic Shuffling ── */}
          {status === "spinning" && (
            <motion.div
              key="spinning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 text-center min-h-[300px]"
            >
              <div className="relative w-24 h-24 flex items-center justify-center mb-5">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--gold)]"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
                <FeyLogo size={48} spinning={true} />
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-[var(--gold)] font-bold animate-pulse block">
                  Accessing Inquiry Bank...
                </span>
                <p className="text-xs text-[var(--text-mute)] mt-2 h-5 truncate max-w-[280px]">
                  {currentTopic.text}
                </p>
              </div>
            </motion.div>
          )}

          {/* ── 3. REVEALED STATE: Topic Prompt + Steps + Audio Waveform + CTA ── */}
          {status === "revealed" && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-left"
            >
              {/* Category Badges & Respin Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base">
                    {CATEGORY_ICONS[currentTopic.category] || "💡"}
                  </span>
                  <span
                    className="text-[11px] font-bold font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full"
                    style={{
                      background: "rgba(68, 78, 44, 0.08)",
                      color: "var(--olive)",
                    }}
                  >
                    {currentTopic.category}
                  </span>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--bg-base)",
                      border: "1px solid var(--border-dim)",
                      color: "var(--text-dim)",
                    }}
                  >
                    Novice Level
                  </span>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(166, 124, 30, 0.1)",
                      color: "var(--gold)",
                    }}
                  >
                    90s Sprint
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSpin}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors hover:bg-[var(--bg-input)] cursor-pointer shrink-0"
                  style={{
                    borderColor: "var(--border-dim)",
                    color: "var(--text)",
                  }}
                  title="Spin another topic"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Respin</span>
                </button>
              </div>

              {/* Topic Question */}
              <p
                className="font-serif font-bold text-xl sm:text-[1.4rem] leading-snug mb-5 min-h-[58px]"
                style={{ color: "var(--text)" }}
              >
                &ldquo;{currentTopic.text}&rdquo;
              </p>

              {/* 3-Step Feynman Sequence */}
              <ol className="space-y-2 mb-5">
                {[
                  { label: "1. Synthesize Notes", detail: "5 min window", done: true },
                  { label: "2. Articulate Out Loud", detail: "90s recording", active: true },
                  { label: "3. Listen & Reflect", detail: "Self-rate clarity" },
                ].map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs"
                    style={{
                      background: s.active ? "var(--terra-bg)" : "var(--bg-base)",
                      border: `1px solid ${
                        s.active ? "rgba(122,28,46,0.2)" : "var(--border-dim)"
                      }`,
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                      style={{
                        background: s.done ? "var(--olive)" : "transparent",
                        border: s.done
                          ? "none"
                          : `1.5px solid ${s.active ? "var(--terra)" : "var(--border)"}`,
                        color: "#fff",
                      }}
                    >
                      {s.done ? "✓" : ""}
                    </span>
                    <span className="font-semibold flex-1">{s.label}</span>
                    <span className="text-[11px]" style={{ color: "var(--text-mute)" }}>
                      {s.detail}
                    </span>
                  </li>
                ))}
              </ol>

              {/* Audio Waveform Simulation */}
              <div
                className="flex items-center gap-3 p-3 rounded-2xl border mb-5"
                style={{
                  background: "var(--bg-base)",
                  borderColor: "var(--border-dim)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--terra)",
                    boxShadow: "0 3px 0 var(--terra-dk)",
                  }}
                >
                  <Mic size={16} color="#fff" />
                </div>
                <div className="flex items-end gap-[2px] h-7 flex-1">
                  {[30, 55, 40, 75, 50, 90, 65, 45, 80, 35, 60, 85, 50, 70, 40, 55, 30, 65, 45, 25].map(
                    (h, i) => (
                      <span
                        key={i}
                        className="flex-1 rounded-full transition-all duration-300"
                        style={{
                          height: `${h}%`,
                          background:
                            i < 12 ? "var(--olive)" : "rgba(68, 78, 44, 0.2)",
                        }}
                      />
                    )
                  )}
                </div>
                <span
                  className="inline-flex items-center gap-1 font-mono text-xs font-semibold shrink-0"
                  style={{ color: "var(--olive)" }}
                >
                  <Timer size={13} /> 0:52
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSpin}
                  className="btn-ghost !px-3.5 !py-2.5 !text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
                  title="Respin topic"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Respin</span>
                </button>

                <button
                  type="button"
                  onClick={handleAcceptTopic}
                  disabled={accepted}
                  className="w-full btn-terra !px-5 !py-2.5 !text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  {accepted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Challenge Accepted!</span>
                    </>
                  ) : (
                    <>
                      <span>Accept Topic &amp; Start Sprint</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
