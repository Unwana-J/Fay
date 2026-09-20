"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Globe, Lock, Clock, Mic, Search, Sparkles, Plus, Check } from "lucide-react";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useAppStore } from "@/store/useAppStore";
import { TOPIC_BANK, CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, type Topic, type Difficulty } from "@/lib/topics";
import { uid, cn } from "@/lib/utils";

const DURATIONS = [10, 15, 20, 30];
const SPEAKING_DURATIONS = [60, 90, 120, 150, 180];

export default function CreateRoomModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { createRoom } = useCommunityStore();
  const { profile, customTopics, addCustomTopic } = useAppStore();

  const [mode, setMode] = useState<"search" | "custom">("search");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [researchMin, setResearchMin] = useState(15);
  const [speakingSec, setSpeakingSec] = useState(120);

  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  // Custom topic inputs
  const [customText, setCustomText] = useState("");
  const [customCategory, setCustomCategory] = useState<string>("Technology");
  const [customDifficulty, setCustomDifficulty] = useState<Difficulty>("intermediate");

  const allTopics = useMemo(() => {
    return [...(customTopics || []), ...TOPIC_BANK];
  }, [customTopics]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      // Return 6 diverse suggestions across topics when search is empty so user can click immediately
      return allTopics.slice(0, 6);
    }
    return allTopics
      .filter((t) => {
        const matchText = t.text.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        const matchTag = t.tags?.some((tag) => tag.toLowerCase().includes(q));
        return matchText || matchCat || matchTag;
      })
      .slice(0, 8);
  }, [allTopics, search]);

  function handleSelectCustom(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newTopic: Topic = {
      id: `custom-${uid()}`,
      text: trimmed,
      category: customCategory || "Technology",
      difficulty: customDifficulty || "intermediate",
      tags: ["custom", "community"],
    };
    addCustomTopic(newTopic);
    setSelectedTopic(newTopic);
    setSearch("");
  }

  function handleApplyCustom() {
    const trimmed = customText.trim();
    if (!trimmed) return;
    const newTopic: Topic = {
      id: `custom-${uid()}`,
      text: trimmed,
      category: customCategory,
      difficulty: customDifficulty,
      tags: ["custom", "community"],
    };
    addCustomTopic(newTopic);
    setSelectedTopic(newTopic);
    setCustomText("");
  }

  const handleCreate = () => {
    if (!selectedTopic) return;
    const id = createRoom(
      {
        topicId: selectedTopic.id,
        topicText: selectedTopic.text,
        category: selectedTopic.category,
        difficulty: selectedTopic.difficulty,
        visibility,
        researchDurationMin: researchMin,
        speakingDurationSec: speakingSec,
      },
      {
        id: profile.id,
        username: profile.username || "Learner",
        avatar: profile.avatar || "/avatars/avatar-scholar.svg",
        bio: profile.bio,
        xp: profile.xp,
        level: Math.floor(profile.xp / 500) + 1,
      }
    );
    onClose();
    router.push(`/community/room/${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="surface-raised rounded-2xl p-6 sm:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-space font-bold text-xl" style={{ color: "var(--text)" }}>
            Start a Research Room
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
          >
            <X size={16} style={{ color: "var(--text-mute)" }} />
          </button>
        </div>

        {/* Topic Selection */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-label">Choose a Topic</label>
            {!selectedTopic && (
              <span className="text-[11px]" style={{ color: "var(--text-mute)" }}>
                Pick from library or create your own
              </span>
            )}
          </div>

          {selectedTopic ? (
            <div
              className="rounded-xl p-3.5 border flex items-start justify-between gap-3 surface-input"
              style={{
                borderColor: "var(--olive)",
                background: "var(--bg-input)",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: `${CATEGORY_COLORS[selectedTopic.category] || "var(--olive)"}18`,
                      color: CATEGORY_COLORS[selectedTopic.category] || "var(--olive-text)",
                    }}
                  >
                    {CATEGORY_ICONS[selectedTopic.category] || "📖"} {selectedTopic.category}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-black/5 text-[var(--text-mute)] capitalize">
                    {selectedTopic.difficulty}
                  </span>
                  {selectedTopic.id.startsWith("custom-") && (
                    <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[var(--gold)]/20 text-[var(--gold)]">
                      Custom Topic
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text)" }}>
                  {selectedTopic.text}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedTopic(null);
                  setSearch("");
                }}
                className="text-xs text-[var(--text-mute)] hover:text-[var(--terra)] p-1 rounded transition-colors shrink-0"
                title="Change topic"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div>
              {/* Mode switch: Search vs Custom */}
              <div
                className="flex rounded-lg p-0.5 mb-2.5 bg-[var(--bg-input)] border"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <button
                  type="button"
                  onClick={() => setMode("search")}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                    mode === "search"
                      ? "bg-[var(--bg-card)] text-[var(--text)] shadow-sm"
                      : "text-[var(--text-mute)] hover:text-[var(--text-dim)]"
                  )}
                >
                  <Search size={12} /> Search Library
                </button>
                <button
                  type="button"
                  onClick={() => setMode("custom")}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                    mode === "custom"
                      ? "bg-[var(--bg-card)] text-[var(--text)] shadow-sm"
                      : "text-[var(--text-mute)] hover:text-[var(--text-dim)]"
                  )}
                >
                  <Plus size={12} /> Write Custom Topic
                </button>
              </div>

              {mode === "search" ? (
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by topic, keyword, or category..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && search.trim()) {
                          if (filtered.length > 0) {
                            setSelectedTopic(filtered[0]);
                            setSearch("");
                          } else {
                            handleSelectCustom(search.trim());
                          }
                        }
                      }}
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs sm:text-sm outline-none border transition-colors surface-input"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                      autoFocus
                    />
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-mute)] pointer-events-none"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-mute)] hover:text-[var(--text)]"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Results dropdown */}
                  <div
                    className="mt-2 rounded-xl overflow-hidden border max-h-52 overflow-y-auto divide-y"
                    style={{
                      borderColor: "var(--border-dim)",
                      background: "var(--bg-input)",
                    }}
                  >
                    {/* Instant custom topic option from typed search */}
                    {search.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSelectCustom(search.trim())}
                        className="w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20 text-[var(--text)]"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <Sparkles size={13} className="text-[var(--gold)] shrink-0" />
                          <span className="truncate">
                            Use custom: <span className="font-semibold">&ldquo;{search.trim()}&rdquo;</span>
                          </span>
                        </div>
                        <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--gold)]/20 text-[var(--gold)] shrink-0">
                          Custom
                        </span>
                      </button>
                    )}

                    {filtered.length > 0 ? (
                      filtered.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedTopic(t);
                            setSearch("");
                          }}
                          className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-[var(--bg-card)] transition-colors flex items-center justify-between gap-3"
                          style={{ color: "var(--text)" }}
                        >
                          <span className="truncate font-medium flex-1">{t.text}</span>
                          <span
                            className="text-[10px] font-semibold shrink-0 px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${CATEGORY_COLORS[t.category] || "var(--olive)"}15`,
                              color: CATEGORY_COLORS[t.category] || "var(--olive-text)",
                            }}
                          >
                            {CATEGORY_ICONS[t.category] || "📖"} {t.category}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-xs mb-2" style={{ color: "var(--text-mute)" }}>
                          No library topics match &ldquo;{search}&rdquo;.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSelectCustom(search.trim())}
                          className="btn-terra px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Sparkles size={12} /> Use &ldquo;{search.trim()}&rdquo; as Custom Topic
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Dedicated Custom Topic Input */
                <div
                  className="space-y-3 p-3.5 rounded-xl border surface-input"
                  style={{ borderColor: "var(--border-dim)" }}
                >
                  <div>
                    <label
                      className="text-[11px] font-semibold block mb-1"
                      style={{ color: "var(--text)" }}
                    >
                      Topic Prompt or Research Question
                    </label>
                    <textarea
                      rows={2}
                      maxLength={160}
                      placeholder="e.g. How does transformer self-attention work under the hood?"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-xs outline-none border resize-none surface-input"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        className="text-[10px] font-semibold uppercase tracking-wider block mb-1"
                        style={{ color: "var(--text-mute)" }}
                      >
                        Category
                      </label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none border surface-input cursor-pointer"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        {CATEGORIES.map((c) => (
                          <option
                            key={c}
                            value={c}
                            style={{ background: "var(--bg-card)", color: "var(--text)" }}
                          >
                            {CATEGORY_ICONS[c] || "📖"} {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        className="text-[10px] font-semibold uppercase tracking-wider block mb-1"
                        style={{ color: "var(--text-mute)" }}
                      >
                        Difficulty
                      </label>
                      <select
                        value={customDifficulty}
                        onChange={(e) => setCustomDifficulty(e.target.value as Difficulty)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none border surface-input cursor-pointer"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        <option value="beginner" style={{ background: "var(--bg-card)", color: "var(--text)" }}>
                          Beginner
                        </option>
                        <option value="intermediate" style={{ background: "var(--bg-card)", color: "var(--text)" }}>
                          Intermediate
                        </option>
                        <option value="advanced" style={{ background: "var(--bg-card)", color: "var(--text)" }}>
                          Advanced
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={!customText.trim()}
                      onClick={handleApplyCustom}
                      className="btn-terra px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Check size={12} /> Set Custom Topic
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visibility */}
        <div className="mb-5">
          <label className="text-label block mb-2">Visibility</label>
          <div className="grid grid-cols-2 gap-2">
            {(["public", "private"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all"
                style={{
                  background: visibility === v ? "var(--terra)" : "var(--bg-input)",
                  color: visibility === v ? "white" : "var(--text-dim)",
                  borderColor: visibility === v ? "var(--terra)" : "var(--border)",
                }}
              >
                {v === "public" ? <Globe size={14} /> : <Lock size={14} />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-[11px] mt-2" style={{ color: "var(--text-mute)" }}>
            {visibility === "public"
              ? "Recordings will appear in the Community Feed and count toward leaderboards."
              : "Only invited participants can see this room and its recordings."}
          </p>
        </div>

        {/* Durations */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-label block mb-2 flex items-center gap-1">
              <Clock size={11} /> Research Time
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setResearchMin(d)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono border transition-all"
                  style={{
                    background: researchMin === d ? "var(--terra)" : "var(--bg-input)",
                    color: researchMin === d ? "white" : "var(--text-dim)",
                    borderColor: researchMin === d ? "var(--terra)" : "var(--border)",
                  }}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-label block mb-2 flex items-center gap-1">
              <Mic size={11} /> Speaking Limit
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {SPEAKING_DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSpeakingSec(d)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono border transition-all"
                  style={{
                    background: speakingSec === d ? "var(--terra)" : "var(--bg-input)",
                    color: speakingSec === d ? "white" : "var(--text-dim)",
                    borderColor: speakingSec === d ? "var(--terra)" : "var(--border)",
                  }}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={!selectedTopic}
          className="w-full btn-terra justify-center py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Create Room & Get Invite Link →
        </button>
      </motion.div>
    </motion.div>
  );
}
