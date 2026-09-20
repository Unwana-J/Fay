"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Check, Compass, BookOpen } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/topics";

const AVATAR_OPTIONS = [
  { emoji: "🧠", label: "Mind" },
  { emoji: "🎙️", label: "Speaker" },
  { emoji: "🦉", label: "Scholar" },
  { emoji: "⚡", label: "Catalyst" },
  { emoji: "🚀", label: "Pioneer" },
  { emoji: "📚", label: "Bookworm" },
  { emoji: "🇳🇬", label: "Naija" },
  { emoji: "💡", label: "Innovator" },
  { emoji: "🎨", label: "Creative" },
  { emoji: "🔬", label: "Scientist" },
  { emoji: "🏛️", label: "Historian" },
  { emoji: "🌍", label: "Explorer" },
];

export default function OnboardingModal({ isOpen }: { isOpen: boolean }) {
  const { createAccount } = useAppStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("🧠");
  const [bio, setBio] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Artificial Intelligence",
    "Technology",
    "History",
  ]);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function handleNextFromStep1() {
    if (!username.trim()) {
      setError("Please choose a username to continue.");
      return;
    }
    setError("");
    setStep(2);
  }

  function toggleCategory(cat: string) {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length <= 1) {
        setError("Please keep at least 1 category selected.");
        return;
      }
      setError("");
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setError("");
      setSelectedCategories([...selectedCategories, cat]);
    }
  }

  function handleComplete() {
    createAccount({
      username: username.trim(),
      avatar,
      bio: bio.trim() || "Building knowledge one topic at a time.",
      interests: selectedCategories,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 surface-modal backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-xl rounded-2xl p-6 sm:p-8 surface-raised shadow-2xl relative border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
      >
        {/* Subtle decorative glow */}
        <div
          className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: "var(--olive)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-15"
          style={{ background: "var(--terra)" }}
        />

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--olive)] text-white text-xs font-bold flex items-center justify-center font-mono">
              {step}
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--text-mute)" }}>
              Step {step} of 3
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: s === step ? "24px" : "8px",
                  background: s <= step ? "var(--olive)" : "var(--border)",
                }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-space text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: "var(--text)" }}>
                  Welcome to Fey
                </h2>
                <p className="text-xs sm:text-sm" style={{ color: "var(--text-dim)" }}>
                  Research deeply, articulate clearly, and synthesize ideas in your own voice. Let's create your beta account.
                </p>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: "var(--text)" }}>
                  Choose Your Learning Avatar
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((item) => {
                    const isSelected = avatar === item.emoji;
                    return (
                      <button
                        key={item.emoji}
                        type="button"
                        onClick={() => setAvatar(item.emoji)}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center group"
                        style={{
                          background: isSelected ? "var(--bg-input)" : "transparent",
                          borderColor: isSelected ? "var(--olive)" : "var(--border-dim)",
                          boxShadow: isSelected ? "0 0 0 2px var(--olive)" : "none",
                        }}
                      >
                        <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                          {item.emoji}
                        </span>
                        <span
                          className="text-[10px] truncate max-w-full font-medium"
                          style={{ color: isSelected ? "var(--text)" : "var(--text-mute)" }}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text)" }}>
                  Your Display Name <span className="text-[var(--terra)]">*</span>
                </label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="e.g. Adaeze, Tobi, or Scholar"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNextFromStep1();
                  }}
                  className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none transition-all surface-input"
                  style={{
                    borderColor: error ? "var(--terra)" : "var(--border)",
                    color: "var(--text)",
                  }}
                  autoFocus
                />
              </div>

              {/* Bio / Motivation */}
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text)" }}>
                  Your Learning Mission <span className="text-[10px] font-normal" style={{ color: "var(--text-mute)" }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Sharpening my verbal communication skills."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none transition-all surface-input"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                />
              </div>

              {error && (
                <p className="text-xs font-medium text-[var(--terra)]">{error}</p>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextFromStep1}
                  className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                >
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: INTERESTS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                <h2 className="font-space text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: "var(--text)" }}>
                  What do you want to master?
                </h2>
                <p className="text-xs sm:text-sm" style={{ color: "var(--text-dim)" }}>
                  Pick topics you want on your dashboard roulette, constellation map, and trivia bank.
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat);
                    const icon = CATEGORY_ICONS[cat] || "📖";
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all"
                        style={{
                          background: isSelected ? "var(--bg-input)" : "transparent",
                          borderColor: isSelected ? "var(--olive)" : "var(--border-dim)",
                          color: isSelected ? "var(--text)" : "var(--text-mute)",
                        }}
                      >
                        <span className="text-base shrink-0">{icon}</span>
                        <span className="truncate flex-1">{cat}</span>
                        {isSelected && <Check size={12} className="text-[var(--olive)] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-dim)" }}>
                <span>{selectedCategories.length} categories chosen</span>
                {error && <span className="text-[var(--terra)]">{error}</span>}
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors"
                  style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                >
                  <ArrowLeft size={13} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                >
                  Next Step <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CONFIRMATION & LAUNCH */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl border shadow-inner" style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}>
                {avatar}
              </div>

              <div>
                <h2 className="font-space text-2xl sm:text-3xl font-bold mb-1" style={{ color: "var(--text)" }}>
                  Ready to explore, {username}?
                </h2>
                <p className="text-xs sm:text-sm max-w-sm mx-auto" style={{ color: "var(--text-dim)" }}>
                  Your private learning workspace is initialized with personalized research roulette, knowledge constellation graph, and over 1,000 trivia questions.
                </p>
              </div>

              <div className="rounded-xl p-4 border text-left space-y-2 surface" style={{ borderColor: "var(--border-dim)" }}>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--text-mute)" }}>Profile Identity</span>
                  <span className="font-semibold" style={{ color: "var(--text)" }}>{username}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--text-mute)" }}>Selected Focus</span>
                  <span className="font-semibold" style={{ color: "var(--text)" }}>
                    {selectedCategories.slice(0, 3).join(", ")}{selectedCategories.length > 3 ? ` +${selectedCategories.length - 3}` : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--text-mute)" }}>Starter Bonus</span>
                  <span className="font-mono font-semibold" style={{ color: "var(--gold)" }}>+50 Starter XP</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors"
                  style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                >
                  <ArrowLeft size={13} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
                >
                  <Sparkles size={16} /> Enter Fey
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
