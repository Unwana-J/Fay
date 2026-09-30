"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  History,
  Trophy,
  Zap,
  Clock,
  Share2,
  RefreshCcw,
  Trash2,
  BarChart3,
  Swords,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAppStore, type TriviaHistoryItem } from "@/store/useAppStore";
import ShareTriviaModal from "@/components/games/ShareTriviaModal";
import { cn } from "@/lib/utils";

interface TriviaHistoryViewProps {
  onPlayDeck: (questionIds: string[], minutes: number) => void;
  onNewGame: () => void;
}

export default function TriviaHistoryView({ onPlayDeck, onNewGame }: TriviaHistoryViewProps) {
  const { triviaHistory = [], clearTriviaHistory } = useAppStore();
  const [selectedForShare, setSelectedForShare] = useState<TriviaHistoryItem | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Summary stats
  const totalGames = triviaHistory.length;
  const bestPct = totalGames > 0 ? Math.max(...triviaHistory.map((h) => h.pct)) : 0;
  const totalXP = triviaHistory.reduce((acc, h) => acc + (h.xpEarned || 0), 0);
  const totalQuestions = triviaHistory.reduce((acc, h) => acc + (h.total || 0), 0);

  function formatDate(timestamp: number) {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recent";
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="surface rounded-2xl p-5 border grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)] block mb-1">
            Games Played
          </span>
          <div className="font-space font-extrabold text-2xl" style={{ color: "var(--text)" }}>
            {totalGames}
          </div>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)] block mb-1">
            Best Accuracy
          </span>
          <div className="font-space font-extrabold text-2xl text-[var(--gold)]">
            {totalGames > 0 ? `${bestPct}%` : "—"}
          </div>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)] block mb-1">
            Questions Explored
          </span>
          <div className="font-space font-extrabold text-2xl" style={{ color: "var(--olive)" }}>
            {totalQuestions}
          </div>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)] block mb-1">
            Trivia XP Won
          </span>
          <div className="font-space font-extrabold text-2xl text-[#008751] flex items-center gap-1">
            <Zap size={18} /> {totalXP}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {totalGames === 0 ? (
        <div className="surface rounded-2xl p-8 sm:p-12 border text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--olive)]/10 text-[var(--olive)] mx-auto flex items-center justify-center text-3xl">
            📜
          </div>
          <div>
            <h3 className="font-space font-bold text-lg mb-1" style={{ color: "var(--text)" }}>
              No Trivia History Yet
            </h3>
            <p className="text-xs max-w-md mx-auto" style={{ color: "var(--text-dim)" }}>
              Complete a round of Naija Trivia to archive your runs here. Every game preserves your
              exact questions so you can resend challenge links to peers anytime!
            </p>
          </div>
          <button
            onClick={onNewGame}
            className="px-6 py-3 rounded-xl btn-terra font-space font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            Start First Trivia Game <ChevronRight size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-[var(--text-mute)] flex items-center gap-1.5">
              <History size={12} /> Past Rounds ({totalGames})
            </span>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-[11px] font-semibold">Are you sure?</span>
                <button
                  onClick={() => {
                    clearTriviaHistory();
                    setConfirmClear(false);
                  }}
                  className="px-2 py-1 bg-red-600 text-white rounded text-[11px] font-bold cursor-pointer"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 border rounded text-[11px] font-semibold cursor-pointer"
                  style={{ borderColor: "var(--border-dim)" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-[11px] text-[var(--text-mute)] hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 size={12} /> Clear History
              </button>
            )}
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {triviaHistory.map((item, idx) => {
              const isChallengerRun = Boolean(item.challengerName);
              const wonVsChallenger =
                isChallengerRun && item.score > (item.challengerScore || 0);
              const tiedVsChallenger =
                isChallengerRun && item.score === (item.challengerScore || 0);

              return (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="surface rounded-2xl p-5 border hover:border-[var(--border)] transition-all shadow-sm"
                  style={{ borderColor: "var(--border-dim)" }}
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-space font-extrabold text-lg" style={{ color: "var(--text)" }}>
                        {item.score}
                        <span className="text-sm font-semibold text-[var(--text-mute)]">
                          /{item.total}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-bold font-mono",
                          item.pct >= 80
                            ? "bg-[var(--gold)]/15 text-[var(--gold)]"
                            : item.pct >= 60
                            ? "bg-[var(--olive)]/15 text-[var(--olive)]"
                            : "bg-[var(--terra)]/15 text-[var(--terra)]"
                        )}
                      >
                        {item.pct}%
                      </span>
                      <span className="text-xs font-semibold" style={{ color: "var(--text-dim)" }}>
                        {item.gradeLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-mute)" }}>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {item.durationMinutes || 10}m
                      </span>
                      <span>•</span>
                      <span>{formatDate(item.timestamp)}</span>
                    </div>
                  </div>

                  {/* Versus Banner if played from a challenge */}
                  {isChallengerRun && (
                    <div
                      className="p-2.5 rounded-xl border text-xs mb-3 flex items-center justify-between"
                      style={{
                        background: wonVsChallenger
                          ? "rgba(0, 135, 81, 0.08)"
                          : tiedVsChallenger
                          ? "rgba(166, 124, 30, 0.08)"
                          : "var(--bg-input)",
                        borderColor: wonVsChallenger
                          ? "rgba(0, 135, 81, 0.3)"
                          : "var(--border-dim)",
                      }}
                    >
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Swords size={13} className="text-[#008751]" />
                        <span>
                          {wonVsChallenger
                            ? `Beat Scholar ${item.challengerName}!`
                            : tiedVsChallenger
                            ? `Tied with Scholar ${item.challengerName}`
                            : `Challenged by Scholar ${item.challengerName}`}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[var(--text-dim)]">
                        {item.score} vs {item.challengerScore}/{item.challengerTotal || item.total}
                      </span>
                    </div>
                  )}

                  {/* Category Breakdown Badges */}
                  {item.categoryBreakdown && item.categoryBreakdown.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.categoryBreakdown.map((cat) => (
                        <span
                          key={cat.category}
                          className="px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5"
                          style={{
                            background: "var(--bg-input)",
                            borderColor: "var(--border-dim)",
                            color: "var(--text)",
                          }}
                        >
                          <span className="text-[var(--text-mute)]">{cat.category}:</span>
                          <span className="font-mono font-bold">
                            {cat.correct}/{cat.total}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div
                    className="pt-3 border-t flex flex-wrap items-center justify-between gap-3"
                    style={{ borderColor: "var(--border-dim)" }}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#008751]">
                      <Zap size={14} /> +{item.xpEarned || 0} XP
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Replay Deck */}
                      <button
                        onClick={() => onPlayDeck(item.questionIds, item.durationMinutes || 10)}
                        title="Retry this exact set of questions"
                        className="px-3 py-1.5 rounded-lg border text-xs font-bold hover:bg-[var(--bg-input)] transition-colors flex items-center gap-1.5 cursor-pointer"
                        style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                      >
                        <RefreshCcw size={12} /> Replay Deck
                      </button>

                      {/* Resend / Share Challenge */}
                      <button
                        onClick={() => setSelectedForShare(item)}
                        className="px-3.5 py-1.5 rounded-lg font-space font-extrabold text-xs flex items-center gap-1.5 cursor-pointer text-white shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: "linear-gradient(135deg, #008751 0%, #10663f 100%)",
                        }}
                      >
                        <Share2 size={12} /> Resend Challenge
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share Modal when "Resend Challenge" is clicked */}
      {selectedForShare && (
        <ShareTriviaModal
          isOpen={Boolean(selectedForShare)}
          onClose={() => setSelectedForShare(null)}
          score={selectedForShare.score}
          total={selectedForShare.total}
          pct={selectedForShare.pct}
          gradeLabel={selectedForShare.gradeLabel}
          xpEarned={selectedForShare.xpEarned}
          byCategory={selectedForShare.categoryBreakdown}
          questionIds={selectedForShare.questionIds}
        />
      )}
    </div>
  );
}
