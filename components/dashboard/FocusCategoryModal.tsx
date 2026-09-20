"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Check, Compass, Sparkles, Layers, ArrowRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { CATEGORY_COLORS, CATEGORY_ICONS, TOPIC_BANK } from "@/lib/topics";
import FeyLogo from "@/components/ui/FeyLogo";

interface FocusCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFocus: string | null;
  onSelectFocus: (category: string | null) => void;
}

export default function FocusCategoryModal({
  isOpen,
  onClose,
  activeFocus,
  onSelectFocus,
}: FocusCategoryModalProps) {
  const router = useRouter();
  const { settings, customTopics } = useAppStore();

  if (!isOpen) return null;

  const allTopics = [...TOPIC_BANK, ...customTopics];

  // User's active pool of categories
  const activeCategories =
    settings.enabledCategories.length > 0
      ? settings.enabledCategories
      : settings.favoriteCategories.length > 0
      ? settings.favoriteCategories
      : ["Technology", "Artificial Intelligence"];

  // Total topics in user's active categories
  const totalActiveTopics = allTopics.filter((t) =>
    activeCategories.includes(t.category)
  ).length;

  function handleChooseCategory(cat: string | null) {
    onSelectFocus(cat);
    onClose();
  }

  function handleGoToDiscover() {
    onClose();
    router.push("/discover");
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 surface-modal backdrop-blur-md">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="w-full max-w-2xl rounded-2xl p-6 sm:p-7 surface-raised shadow-2xl relative border overflow-hidden z-10"
          style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
        >
          {/* Subtle decorative glow */}
          <div
            className="absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ background: "var(--gold)" }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl border transition-colors hover:bg-[var(--bg-input)]"
            style={{ borderColor: "var(--border-dim)", color: "var(--text-mute)" }}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0"
              style={{
                background: "var(--bg-input)",
                borderColor: "var(--border-dim)",
              }}
            >
              <FeyLogo size={28} spinning={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="font-space text-xl sm:text-2xl font-bold"
                  style={{ color: "var(--text)" }}
                >
                  Target Your Topic Roulette
                </h2>
              </div>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-dim)" }}>
                Focus the roulette on a specific discipline or spin across all your selected topics.
              </p>
            </div>
          </div>

          {/* Category Selection Grid */}
          <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
            {/* Option 1: All Selected Categories */}
            <button
              onClick={() => handleChooseCategory(null)}
              className="w-full p-4 rounded-xl border text-left transition-all relative group flex items-center justify-between"
              style={{
                background: activeFocus === null ? "var(--bg-input)" : "transparent",
                borderColor: activeFocus === null ? "var(--olive)" : "var(--border-dim)",
                boxShadow:
                  activeFocus === null
                    ? "0 0 0 1px var(--olive), 0 4px 12px rgba(68, 78, 44, 0.08)"
                    : "none",
              }}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border shrink-0"
                  style={{
                    background: "rgba(68, 78, 44, 0.1)",
                    borderColor: "rgba(68, 78, 44, 0.2)",
                    color: "var(--olive-text)",
                  }}
                >
                  <Layers size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                      All My Selected Categories
                    </span>
                    {activeFocus === null && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--olive)] text-white">
                        Active Pool
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-mute)" }}>
                    Random rotation across {activeCategories.length} categories ({totalActiveTopics} topics)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeFocus === null ? (
                  <div className="w-6 h-6 rounded-full bg-[var(--olive)] text-white flex items-center justify-center">
                    <Check size={13} />
                  </div>
                ) : (
                  <span
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border group-hover:bg-[var(--bg-input)] transition-colors"
                    style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                  >
                    Select All
                  </span>
                )}
              </div>
            </button>

            {/* Individual categories grid */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider mb-2.5 flex items-center justify-between" style={{ color: "var(--text-mute)" }}>
                <span>Selected Categories ({activeCategories.length})</span>
                <span>Click to focus roulette</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeCategories.map((cat) => {
                  const isFocused = activeFocus === cat;
                  const catColor = CATEGORY_COLORS[cat] || "var(--olive)";
                  const topicCount = allTopics.filter((t) => t.category === cat).length;
                  const icon = CATEGORY_ICONS[cat] || "📖";

                  return (
                    <button
                      key={cat}
                      onClick={() => handleChooseCategory(cat)}
                      className="p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group hover:border-[var(--olive)]"
                      style={{
                        background: isFocused ? "var(--bg-input)" : "transparent",
                        borderColor: isFocused ? catColor : "var(--border-dim)",
                        boxShadow: isFocused ? `0 0 0 1px ${catColor}40` : "none",
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl shrink-0">{icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-medium text-xs sm:text-sm truncate"
                              style={{ color: isFocused ? "var(--text)" : "var(--text-dim)" }}
                            >
                              {cat}
                            </span>
                          </div>
                          <span
                            className="text-[11px] block mt-0.5"
                            style={{ color: "var(--text-mute)" }}
                          >
                            {topicCount} topics available
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {isFocused ? (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: catColor }}
                          >
                            <Check size={11} />
                          </span>
                        ) : (
                          <span
                            className="text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                            style={{ color: catColor }}
                          >
                            Focus <Sparkles size={11} />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discover Banner / Link to add more */}
            <div
              className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4"
              style={{
                background: "rgba(68, 78, 44, 0.04)",
                borderColor: "rgba(68, 78, 44, 0.15)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "rgba(68, 78, 44, 0.12)", color: "var(--olive)" }}
                >
                  <Compass size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: "var(--text)" }}>
                    Want to explore more categories?
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-dim)" }}>
                    Add science, history, finance, or philosophy to expand your roulette pool.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoToDiscover}
                className="btn-terra px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-center"
              >
                <span>Discover Page</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
