"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shuffle, Search, ChevronRight, Star, StarOff,
  Plus, Trash2, SlidersHorizontal, Zap, Sparkles
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import {
  TOPIC_BANK, CATEGORIES, CATEGORY_ICONS,
  DIFFICULTIES, type Topic
} from "@/lib/topics";
import { cn } from "@/lib/utils";
import FeyLogo from "@/components/ui/FeyLogo";

const ROULETTE_DURATION = 2000; // ms

/* ─── Framer Motion Stagger Variants ──────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18
    }
  }
};

// ─── Roulette card ────────────────────────────────────────────────────────────
function RouletteCard({ topic, spinning }: { topic: Topic | null; spinning: boolean }) {
  return (
    <motion.div
      animate={spinning ? { 
        scale: [1, 1.01, 0.99, 1],
      } : topic ? {
        scale: [0.96, 1.02, 1],
      } : {}}
      transition={spinning ? { 
        repeat: Infinity, 
        duration: 0.4,
        ease: "easeInOut"
      } : {
        type: "spring",
        stiffness: 300,
        damping: 15
      }}
      className="relative rounded-2xl p-10 min-h-[300px] flex flex-col items-center justify-center text-center border overflow-hidden"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: topic ? "var(--olive)" : "var(--border-dim)",
        boxShadow: topic ? "0 12px 36px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(107, 122, 58, 0.08) inset" : "none"
      }}
    >
      {spinning && (
        <div className="absolute inset-0 bg-radial-glow opacity-30 animate-pulse pointer-events-none" />
      )}
      <AnimatePresence mode="wait">
        {spinning ? (
          <motion.div
            key="spinning-logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center justify-center gap-4"
          >
            {/* Spinning active ring around logo */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--gold)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <FeyLogo size={58} spinning={true} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[var(--gold)] animate-pulse">
                Accessing Neural Core...
              </span>
              <p className="text-xs text-[var(--text-mute)] mt-1 h-4 truncate max-w-[200px]">
                {topic?.text || "Searching database"}
              </p>
            </div>
          </motion.div>
        ) : topic ? (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="text-2xl">{CATEGORY_ICONS[topic.category]}</span>
              <span className="tag tag-olive">
                {topic.category}
              </span>
              <span className="tag tag-gold font-mono uppercase">
                {topic.difficulty}
              </span>
            </div>
            <p 
              className="font-space font-bold leading-snug text-display max-w-[36ch]" 
              style={{ 
                color: "var(--text)",
                fontSize: topic.text.length > 80 ? "1.25rem" : "1.6rem" 
              }}
            >
              {topic.text}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-space text-lg flex flex-col items-center gap-4"
            style={{ color: "var(--text-dim)" }}
          >
            <div className="w-20 h-20 rounded-full bg-[var(--bg-input)] flex items-center justify-center border border-[var(--border-dim)]">
              <FeyLogo size={42} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>Ready to think deeper?</p>
              <p className="text-xs text-[var(--text-mute)] mt-1">Spin to discover a tailored research prompt</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Topic card in picker grid ────────────────────────────────────────────────
function TopicPickerCard({ topic, onSelect }: { topic: Topic; onSelect: (t: Topic) => void }) {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.01, boxShadow: "0 8px 20px rgba(92,106,54,0.04)" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(topic)}
      className="w-full text-left p-4 rounded-xl transition-all surface hover:border-olive"
      style={{ background: "var(--bg-card)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 border"
          style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}
        >
          {CATEGORY_ICONS[topic.category]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug" style={{ color: "var(--text)" }}>{topic.text}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="tag tag-gold" style={{ fontSize: "10px", padding: "1px 5px" }}>
              {topic.difficulty}
            </span>
            <span className="text-xs" style={{ color: "var(--text-dim)" }}>{topic.category}</span>
          </div>
        </div>
        <ChevronRight size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--text-mute)" }} />
      </div>
    </motion.button>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────
function ConfirmModal({
  topic,
  researchMin,
  onConfirm,
  onCancel,
  onRespin,
}: {
  topic: Topic;
  researchMin: number;
  onConfirm: () => void;
  onCancel: () => void;
  onRespin: () => void;
}) {
  const isLongText = topic.text.length > 80;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 p-4 surface-modal"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 15 }}
        transition={{ type: "spring", stiffness: 280, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl p-6 md:p-8 max-w-lg w-full surface-raised max-h-[85vh] overflow-y-auto flex flex-col gap-6"
      >
        <div className="text-center">
          <div className="text-3xl mb-3">{CATEGORY_ICONS[topic.category]}</div>
          <h2 
            className="font-space font-bold leading-snug mb-3 text-display" 
            style={{ 
              color: "var(--text)",
              fontSize: isLongText ? "1.25rem" : "1.5rem"
            }}
          >
            {topic.text}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="tag tag-olive">
              {topic.category}
            </span>
            <span className="tag tag-gold uppercase">
              {topic.difficulty}
            </span>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--bg-input)", border: "1px solid var(--border-dim)" }}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)] mb-3">Your challenge</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold font-mono" style={{ color: "var(--text)" }}>{researchMin}</div>
              <div className="text-[10px] text-[var(--text-mute)] mt-0.5">min research</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono" style={{ color: "var(--text)" }}>1</div>
              <div className="text-[10px] text-[var(--text-mute)] mt-0.5">min speaking</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono" style={{ color: "var(--gold)" }}>
                +{topic.difficulty === "beginner" ? 100 : topic.difficulty === "intermediate" ? 150 : topic.difficulty === "advanced" ? 200 : 300}
              </div>
              <div className="text-[10px] text-[var(--text-mute)] mt-0.5">XP reward</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-auto pt-2">
          <button
            onClick={onRespin}
            className="flex-1 btn-ghost py-3"
          >
            <Shuffle size={14} className="inline mr-1.5" />Respin
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 btn-terra"
          >
            <Zap size={14} className="inline mr-1.5" />Begin Research
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-xs text-[var(--text-mute)] font-space">
        Loading Discover Dashboard...
      </div>
    }>
      <DiscoverPageContent />
    </Suspense>
  );
}

function DiscoverPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings, customTopics, startSession, updateSettings } = useAppStore();

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [query, setQuery] = useState("");
  const [filterCat, setFilterCat] = useState<string>(searchParams.get("category") ?? "all");
  const [filterDiff, setFilterDiff] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"roulette" | "browse">("roulette");
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newTopicText, setNewTopicText] = useState("");
  const spinRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allTopics = [...TOPIC_BANK, ...customTopics];

  const enabledPool = allTopics.filter((t) =>
    settings.enabledCategories.includes(t.category) &&
    (filterCat === "all" || t.category === filterCat) &&
    (filterDiff === "all" || t.difficulty === filterDiff)
  );

  const filteredTopics = enabledPool.filter((t) =>
    query === "" || t.text.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase())
  );

  const spin = useCallback(() => {
    if (enabledPool.length === 0) return;
    setSpinning(true);
    setSelectedTopic(null);

    spinRef.current = setInterval(() => {
      const rand = enabledPool[Math.floor(Math.random() * enabledPool.length)];
      setSelectedTopic(rand);
    }, 70);

    spinTimeoutRef.current = setTimeout(() => {
      clearInterval(spinRef.current!);
      const final = enabledPool[Math.floor(Math.random() * enabledPool.length)];
      setSelectedTopic(final);
      setSpinning(false);
      setShowConfirm(true);
    }, ROULETTE_DURATION);
  }, [enabledPool]);

  useEffect(() => () => {
    if (spinRef.current) clearInterval(spinRef.current);
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
  }, []);

  function handleConfirm() {
    if (!selectedTopic) return;
    const sessionId = startSession(selectedTopic, settings.researchMin);
    router.push(`/session/${sessionId}`);
  }

  function handlePickManual(topic: Topic) {
    setSelectedTopic(topic);
    setShowConfirm(true);
  }

  function toggleCategory(cat: string) {
    const enabled = settings.enabledCategories;
    updateSettings({
      enabledCategories: enabled.includes(cat) ? enabled.filter((c) => c !== cat) : [...enabled, cat],
    });
  }

  function toggleFavorite(cat: string) {
    const favs = settings.favoriteCategories;
    updateSettings({
      favoriteCategories: favs.includes(cat) ? favs.filter((c) => c !== cat) : [...favs, cat],
    });
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-8 max-w-5xl"
    >
      {/* Header */}
      <motion.div variants={cardVariants} className="mb-6">
        <h1 className="font-space text-3xl font-bold mb-1" style={{ color: "var(--text)" }}>Discover</h1>
        <p style={{ color: "var(--text-dim)" }}>Spin the roulette or browse topics across {CATEGORIES.length} categories.</p>
      </motion.div>

      {/* 2-Column Editorial Arrangement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Parameters / Filters */}
        <motion.div variants={cardVariants} className="lg:col-span-4 space-y-6">
          
          {/* Research Duration & Difficulty Settings */}
          <div className="rounded-xl p-5 surface flex flex-col gap-4">
            <div>
              <div className="text-label mb-2 flex items-center gap-1.5">
                <SlidersHorizontal size={12} style={{ color: "var(--olive)" }} />
                Research duration
              </div>
              <div className="flex flex-wrap gap-1">
                {[5, 10, 15, 20, 30].map((m) => (
                  <button
                    key={m}
                    onClick={() => updateSettings({ researchMin: m })}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                      settings.researchMin === m
                        ? "border-olive bg-white/5"
                        : "border-transparent"
                    )}
                    style={{
                      color: settings.researchMin === m ? "var(--text)" : "var(--text-dim)",
                    }}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div className="divider" />

            <div>
              <div className="text-label mb-2">Difficulty filter</div>
              <div className="flex flex-wrap gap-1">
                {(["all", ...DIFFICULTIES] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDiff(d)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border",
                      filterDiff === d
                        ? "border-olive bg-white/5"
                        : "border-transparent"
                    )}
                    style={{
                      color: filterDiff === d ? "var(--text)" : "var(--text-dim)",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Categories in Pool list */}
          <div className="rounded-xl p-5 surface">
            <div className="flex items-center justify-between mb-3">
              <span className="text-label">Categories in pool</span>
              <span className="text-xs font-mono" style={{ color: "var(--text-mute)" }}>{enabledPool.length} active</span>
            </div>
            
            <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => {
                const enabled = settings.enabledCategories.includes(cat);
                const isFav = settings.favoriteCategories.includes(cat);
                return (
                  <div key={cat} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-all">
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="flex items-center gap-2 text-xs font-medium text-left flex-1"
                      style={{
                        color: enabled ? "var(--text)" : "var(--text-mute)",
                        textDecoration: enabled ? "none" : "line-through",
                      }}
                    >
                      <span>{CATEGORY_ICONS[cat]}</span>
                      <span className="truncate">{cat}</span>
                    </button>
                    <button
                      onClick={() => toggleFavorite(cat)}
                      className="p-1 rounded hover:bg-black/5"
                    >
                      {isFav ? (
                        <Star size={12} className="fill-current text-yellow-500" style={{ color: "var(--gold)" }} />
                      ) : (
                        <StarOff size={12} style={{ color: "var(--text-mute)" }} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right Side: Main Interactive View */}
        <motion.div variants={cardVariants} className="lg:col-span-8 space-y-6">
          
          {/* Tab Selector */}
          <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--bg-panel)" }}>
            {(["roulette", "browse"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all",
                  activeTab === tab
                    ? "bg-white/40 text-black shadow-sm"
                    : "text-white/40 hover:text-white/70"
                )}
                style={{
                  backgroundColor: activeTab === tab ? "var(--bg-base)" : "transparent",
                  color: activeTab === tab ? "var(--text)" : "var(--text-mute)"
                }}
              >
                {tab === "roulette" ? "🎰 Roulette" : "📚 Browse"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "roulette" ? (
              <motion.div
                key="roulette"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Roulette card */}
                <RouletteCard topic={selectedTopic} spinning={spinning} />

                {/* Spin button */}
                <div className="flex justify-center">
                  <button
                    disabled={spinning || enabledPool.length === 0}
                    onClick={spin}
                    className="btn-terra w-full h-14"
                  >
                    <Shuffle size={16} className="mr-2" />
                    {spinning ? "Spinning…" : "Spin a Topic"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="browse"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-mute)" }} />
                  <input
                    type="text"
                    placeholder="Search topics…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl text-xs placeholder:text-[var(--text-mute)] focus:outline-none surface-input"
                    style={{ color: "var(--text)" }}
                  />
                </div>

                <div className="text-label">{filteredTopics.length} topics found</div>

                <div className="grid sm:grid-cols-2 gap-2 max-h-[480px] overflow-y-auto pr-1">
                  {filteredTopics.map((topic) => (
                    <TopicPickerCard key={topic.id} topic={topic} onSelect={handlePickManual} />
                  ))}
                  {filteredTopics.length === 0 && (
                    <div className="col-span-2 text-center py-16" style={{ color: "var(--text-mute)" }}>
                      No topics match your filters.
                    </div>
                  )}
                </div>

                {/* Add custom topic block */}
                <div className="surface rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-label">Custom topics</span>
                    <button
                      onClick={() => setShowAddCustom(!showAddCustom)}
                      className="flex items-center gap-1.5 text-xs font-semibold hover:text-white"
                      style={{ color: "var(--olive-text)" }}
                    >
                      <Plus size={12} /> Add topic
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {showAddCustom && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-2 mb-3">
                          <input
                            type="text"
                            placeholder="Enter your topic question…"
                            value={newTopicText}
                            onChange={(e) => setNewTopicText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newTopicText.trim()) {
                                useAppStore.getState().addCustomTopic({ text: newTopicText.trim(), category: "Startups", difficulty: "intermediate", tags: ["custom"] });
                                setNewTopicText("");
                                setShowAddCustom(false);
                              }
                            }}
                            className="flex-1 px-3 py-2.5 rounded-lg text-xs placeholder:text-[var(--text-mute)] focus:outline-none surface-input"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              if (newTopicText.trim()) {
                                useAppStore.getState().addCustomTopic({ text: newTopicText.trim(), category: "Startups", difficulty: "intermediate", tags: ["custom"] });
                                setNewTopicText("");
                                setShowAddCustom(false);
                              }
                            }}
                            className="btn-terra py-2 text-xs"
                          >
                            Add
                          </button>
                          <button onClick={() => setShowAddCustom(false)} className="btn-ghost py-2 text-xs">
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {customTopics.length > 0 ? (
                    <div className="space-y-1.5">
                      {customTopics.map((t) => (
                        <div key={t.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg" style={{ background: "var(--bg-input)" }}>
                          <span className="text-xs flex-1" style={{ color: "var(--text-dim)" }}>{t.text}</span>
                          <button
                            onClick={() => useAppStore.getState().removeCustomTopic(t.id)}
                            className="text-white/25 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "var(--text-mute)" }} className="text-xs">No custom topics yet.</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && selectedTopic && (
          <ConfirmModal
            topic={selectedTopic}
            researchMin={settings.researchMin}
            onConfirm={handleConfirm}
            onCancel={() => setShowConfirm(false)}
            onRespin={() => { setShowConfirm(false); setTimeout(spin, 100); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
