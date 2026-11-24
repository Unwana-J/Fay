"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Calendar, Check, Plus } from "lucide-react";
import { CATEGORIES, type Difficulty, type Topic } from "@/lib/topics";
import { type ClassroomPresetCount } from "@/lib/classroom-types";
import { useAppStore } from "@/store/useAppStore";
import { useClassroomStore } from "@/store/useClassroomStore";
import { cn } from "@/lib/utils";

interface CreateClassroomModalProps {
  open: boolean;
  onClose: () => void;
  initialPresetTopics?: Topic[];
  initialMode?: "categories" | "schedule" | "custom";
}

type SetupMode = "categories" | "schedule" | "custom";

export default function CreateClassroomModal({
  open,
  onClose,
  initialPresetTopics = [],
  initialMode,
}: CreateClassroomModalProps) {
  const router = useRouter();
  const { profile, settings, customTopics } = useAppStore();
  const { createClassroom } = useClassroomStore();

  const defaultCats =
    settings.favoriteCategories?.length > 0
      ? settings.favoriteCategories.slice(0, 4)
      : settings.enabledCategories?.length > 0
      ? settings.enabledCategories.slice(0, 4)
      : ["Technology", "Philosophy", "Economics"];

  const displayHost =
    profile.username && profile.username !== "Scholar" ? profile.username : "Friend";

  const [title, setTitle] = useState(`${displayHost}'s Classroom`);
  const [mode, setMode] = useState<SetupMode>(
    initialMode || (initialPresetTopics.length > 0 ? "schedule" : "categories")
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(defaultCats);
  const [totalTopics, setTotalTopics] = useState<ClassroomPresetCount>(7);
  const [speakingDurationSec, setSpeakingDurationSec] = useState<number>(90);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    (settings.difficultyMode as Difficulty) || "Novice"
  );
  const [customFirstPrompt, setCustomFirstPrompt] = useState("");
  const [customFirstCategory, setCustomFirstCategory] = useState(
    defaultCats[0] || "Technology"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      const hostLabel =
        profile.username && profile.username !== "Scholar" ? profile.username : "Friend";
      setTitle(`${hostLabel}'s Classroom`);
      if (initialMode) {
        setMode(initialMode);
      } else if (initialPresetTopics.length > 0) {
        setMode("schedule");
      }
      if (initialPresetTopics.length > 0) {
        const len = initialPresetTopics.length;
        if (len <= 1) setTotalTopics(3);
        else if (len <= 3) setTotalTopics(3);
        else if (len <= 5) setTotalTopics(5);
        else setTotalTopics(7);
      }
    }
  }, [open, initialMode, initialPresetTopics.length, profile.username]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) {
        return prev.length > 1 ? prev.filter((c) => c !== cat) : prev;
      }
      if (prev.length >= 6) return prev;
      return [...prev, cat];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "custom" && !customFirstPrompt.trim()) {
      setError("Enter your custom opening topic, or switch to Shared Categories.");
      return;
    }

    setSubmitting(true);

    let presetTopics: Topic[] = [];
    if (mode === "schedule" && initialPresetTopics.length > 0) {
      presetTopics = initialPresetTopics.slice(0, totalTopics);
    } else if (mode === "custom" && customFirstPrompt.trim()) {
      presetTopics = [
        {
          id: `custom-classroom-${Date.now()}`,
          text: customFirstPrompt.trim(),
          category: customFirstCategory,
          difficulty,
          tags: ["custom", "classroom"],
        },
      ];
    }

    const res = await createClassroom({
      title: title.trim() || `${displayHost}'s Classroom`,
      hostId: profile.id || "local-scholar",
      hostName: profile.username || "Scholar",
      hostAvatar: profile.avatar || "/avatars/avatar-scholar.svg",
      totalTopics,
      speakingDurationSec,
      researchDurationMin: settings.researchMin || 10,
      categories: selectedCategories,
      difficulty,
      presetTopics,
      customTopicPool: customTopics || [],
    });

    setSubmitting(false);

    if (res.error || !res.classroom) {
      setError(res.error || "Could not create Classroom.");
      return;
    }

    onClose();
    router.push(`/classroom/${res.classroom.code}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border-[1.5px] p-5 sm:p-6 my-8 shadow-xl max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--olive)] mb-1 flex items-center gap-1.5">
                  <Users size={12} />
                  <span>Small Friend Circle · 2–8 Members</span>
                </div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl" style={{ color: "var(--text)" }}>
                  Start a Classroom
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                  Learn and articulate together. Each friend&apos;s audio unlocks once you record yours.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg border border-[var(--border-dim)] hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={15} style={{ color: "var(--text-dim)" }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Classroom Title */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-dim)" }}>
                  Classroom Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={70}
                  placeholder="e.g. Lagos Founders Book Club"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-[var(--olive)]"
                  style={{
                    background: "var(--bg-input)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                />
              </div>

              {/* Topic Selection Mode */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-dim)" }}>
                  How Topics Are Chosen
                </label>
                <div
                  className="grid grid-cols-3 p-1 rounded-xl border gap-1"
                  style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}
                >
                  {(
                    [
                      { id: "categories", label: "Shared Interests" },
                      {
                        id: "schedule",
                        label: `My Schedule (${initialPresetTopics.length})`,
                        disabled: initialPresetTopics.length === 0,
                      },
                      { id: "custom", label: "Custom Topic" },
                    ] as const
                  ).map((opt) => {
                    const active = mode === opt.id;
                    const isDisabled = "disabled" in opt && opt.disabled;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setMode(opt.id)}
                        className={cn(
                          "relative py-2 px-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                          active ? "text-white font-bold" : "text-[var(--text-dim)] hover:text-[var(--text)]"
                        )}
                      >
                        {active && (
                          <motion.div
                            layoutId="createClassroomModePill"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                            className="absolute inset-0 rounded-lg bg-[var(--olive)] z-0"
                          />
                        )}
                        <span className="relative z-10">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Mode Body */}
              {mode === "schedule" && initialPresetTopics.length > 0 ? (
                <div
                  className="rounded-xl p-3.5 border space-y-2"
                  style={{ background: "var(--bg-panel)", borderColor: "var(--olive)" }}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--olive)]">
                    <Calendar size={13} />
                    <span>
                      Importing {Math.min(totalTopics, initialPresetTopics.length)} scheduled topic
                      {initialPresetTopics.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                    Any remaining slots up to {totalTopics} topics will be filled from your selected categories, and friends can swap unstarted topics after joining.
                  </p>
                </div>
              ) : mode === "custom" ? (
                <div className="space-y-3 rounded-xl p-3.5 border" style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)" }}>
                  <div>
                    <label className="block text-[11px] font-mono font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
                      Opening Topic Prompt (Topic 1)
                    </label>
                    <textarea
                      rows={2}
                      value={customFirstPrompt}
                      onChange={(e) => setCustomFirstPrompt(e.target.value)}
                      maxLength={220}
                      placeholder="e.g. Explain how currency devaluation affects local manufacturing vs imports."
                      className="w-full px-3 py-2 rounded-lg border text-xs sm:text-sm focus:outline-none focus:border-[var(--olive)] resize-none"
                      style={{
                        background: "var(--bg-card)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px]" style={{ color: "var(--text-mute)" }}>
                      Category tag:
                    </span>
                    <select
                      value={customFirstCategory}
                      onChange={(e) => setCustomFirstCategory(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border text-xs font-medium"
                      style={{
                        background: "var(--bg-card)",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}

              {/* Topic Categories Multi-Select */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
                    Topic Categories ({selectedCategories.length}/6)
                  </label>
                  <span className="text-[10px]" style={{ color: "var(--text-mute)" }}>
                    Friends can swap future slots too
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl border" style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)" }}>
                  {CATEGORIES.map((cat) => {
                    const active = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all flex items-center gap-1 cursor-pointer active:scale-[0.97]",
                          active
                            ? "bg-[var(--olive)] text-white border-[var(--olive)] font-semibold"
                            : "bg-[var(--bg-card)] text-[var(--text-dim)] border-[var(--border-dim)] hover:border-[var(--olive)]"
                        )}
                      >
                        {active && <Check size={10} />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration & Speaking Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-dim)" }}>
                    Challenge Length
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {([1, 3, 5, 7] as ClassroomPresetCount[]).map((n) => {
                      const active = totalTopics === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setTotalTopics(n)}
                          className={cn(
                            "py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer active:scale-[0.97]",
                            active
                              ? "bg-[var(--olive)] text-white border-[var(--olive)]"
                              : "bg-[var(--bg-input)] text-[var(--text-dim)] border-[var(--border-dim)] hover:border-[var(--olive)]"
                          )}
                        >
                          {n === 1 ? "1 Day" : `${n} Days`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-dim)" }}>
                    Speaking Time
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[60, 90, 120].map((sec) => {
                      const active = speakingDurationSec === sec;
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setSpeakingDurationSec(sec)}
                          className={cn(
                            "py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer active:scale-[0.97]",
                            active
                              ? "bg-[var(--olive)] text-white border-[var(--olive)]"
                              : "bg-[var(--bg-input)] text-[var(--text-dim)] border-[var(--border-dim)] hover:border-[var(--olive)]"
                          )}
                        >
                          {sec}s
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-dim)" }}>
                  Topic Depth
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Novice", "Scholar", "Expert"] as Difficulty[]).map((d) => {
                    const active = difficulty === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer active:scale-[0.97]",
                          active
                            ? "bg-[var(--bg-panel)] border-[var(--olive)] text-[var(--olive)] font-bold"
                            : "bg-[var(--bg-input)] border-[var(--border-dim)] text-[var(--text-mute)] hover:text-[var(--text)]"
                        )}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div
                  className="rounded-xl px-3.5 py-2.5 text-xs font-medium border"
                  style={{
                    background: "var(--red-bg)",
                    borderColor: "var(--red)",
                    color: "var(--red)",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="pt-1 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors hover:bg-[var(--bg-input)] cursor-pointer"
                  style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-terra px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-transform active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>{submitting ? "Creating..." : "Create Classroom"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
