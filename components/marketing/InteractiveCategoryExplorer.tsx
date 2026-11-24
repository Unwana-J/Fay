"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, CheckCircle2, Mic, Clock } from "lucide-react";
import { TOPIC_BANK, type Topic } from "@/lib/topics";
import { useAppStore } from "@/store/useAppStore";
import CategoryIcon from "@/components/ui/CategoryIcon";

const SHOWCASE_CATEGORIES = [
  "Artificial Intelligence",
  "Product Management",
  "Economics",
  "Philosophy",
  "History",
  "Psychology",
  "Science",
  "Finance",
  "Startups",
  "Design",
  "Politics",
  "Medicine",
  "Marketing",
  "Culture",
  "Software Engineering",
  "Personal Finance",
];

export default function InteractiveCategoryExplorer({
  onStartClick,
}: {
  onStartClick?: () => void;
}) {
  const router = useRouter();
  const { isOnboarded, setPendingTopic } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("Philosophy");
  const [promptIndexMap, setPromptIndexMap] = useState<Record<string, number>>({});
  const [acceptedId, setAcceptedId] = useState<string | null>(null);

  const categoryPrompts = useMemo(() => {
    const filtered = TOPIC_BANK.filter((t) => t.category === selectedCategory);
    // Prefer Novice & Scholar prompts first so visitors get accessible, punchy questions
    return [...filtered].sort((a, b) => {
      const rank = { Novice: 0, Scholar: 1, Expert: 2 };
      return (rank[a.difficulty] ?? 1) - (rank[b.difficulty] ?? 1);
    });
  }, [selectedCategory]);

  const currentIdx = promptIndexMap[selectedCategory] ?? 0;
  const activeTopic: Topic | undefined =
    categoryPrompts[currentIdx % Math.max(categoryPrompts.length, 1)];

  function handleSelectCategory(cat: string) {
    setSelectedCategory(cat);
    setAcceptedId(null);
  }

  function handleShufflePrompt() {
    setAcceptedId(null);
    setPromptIndexMap((prev) => ({
      ...prev,
      [selectedCategory]: ((prev[selectedCategory] ?? 0) + 1) % Math.max(categoryPrompts.length, 1),
    }));
  }

  function handleAcceptPrompt() {
    if (!activeTopic) return;
    setAcceptedId(activeTopic.id);
    setPendingTopic(activeTopic);

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
    }, 240);
  }

  return (
    <div className="surface-olive rounded-3xl px-5 py-8 sm:px-10 sm:py-10 text-center">
      <p
        className="font-mono text-[11px] uppercase tracking-[0.2em] mb-2"
        style={{ color: "var(--olive-br)" }}
      >
        Interactive Topic Categories
      </p>
      <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2">
        1,000+ prompts across 23 disciplines
      </h3>
      <p className="text-xs sm:text-sm mb-6 max-w-lg mx-auto" style={{ color: "var(--text-dim)" }}>
        Tap any discipline below to preview a real 90-second speaking prompt from the bank.
      </p>

      {/* Interactive Category Pills */}
      <ul className="flex flex-wrap justify-center gap-2 mb-7">
        {SHOWCASE_CATEGORIES.map((cat) => {
          const isSelected = cat === selectedCategory;
          return (
            <li key={cat}>
              <button
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className="text-xs sm:text-sm px-3.5 py-1.5 rounded-full transition-all inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                style={{
                  background: isSelected ? "var(--olive)" : "var(--bg-card)",
                  border: isSelected ? "1.5px solid var(--olive)" : "1px solid var(--border)",
                  color: isSelected ? "#F4EFE6" : "var(--olive-text)",
                  fontWeight: isSelected ? 700 : 500,
                  boxShadow: isSelected ? "0 4px 12px rgba(68, 78, 44, 0.22)" : "none",
                }}
              >
                <CategoryIcon category={cat} size={13} />
                <span>{cat}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Live Preview Card for Selected Discipline */}
      {activeTopic && (
        <div className="max-w-2xl mx-auto text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${activeTopic.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="rounded-2xl p-5 sm:p-6 border shadow-sm"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                    style={{
                      background: "rgba(68, 78, 44, 0.1)",
                      color: "var(--olive)",
                    }}
                  >
                    <CategoryIcon category={selectedCategory} size={12} />
                    <span>{selectedCategory}</span>
                  </span>

                  <span
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border"
                    style={{
                      background: "var(--bg-base)",
                      borderColor: "var(--border-dim)",
                      color: "var(--text-dim)",
                    }}
                  >
                    {activeTopic.difficulty} Level
                  </span>

                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full"
                    style={{
                      background: "rgba(166, 124, 30, 0.12)",
                      color: "var(--gold)",
                    }}
                  >
                    <Clock size={11} /> 90s Speaking Time
                  </span>
                </div>

                <span className="font-mono text-[10px]" style={{ color: "var(--text-mute)" }}>
                  Prompt {(currentIdx % categoryPrompts.length) + 1} of {categoryPrompts.length}
                </span>
              </div>

              <p
                className="font-serif font-bold text-lg sm:text-xl leading-snug mb-5"
                style={{ color: "var(--text)" }}
              >
                &ldquo;{activeTopic.text}&rdquo;
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: "var(--border-dim)" }}>
                <button
                  type="button"
                  onClick={handleShufflePrompt}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text)",
                  }}
                >
                  <Shuffle size={13} />
                  <span>Another {selectedCategory} Prompt</span>
                </button>

                <button
                  type="button"
                  onClick={handleAcceptPrompt}
                  disabled={acceptedId === activeTopic.id}
                  className="btn-terra !px-4 !py-2 !text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {acceptedId === activeTopic.id ? (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Challenge Queued</span>
                    </>
                  ) : (
                    <>
                      <Mic size={13} />
                      <span>Articulate This Topic</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
