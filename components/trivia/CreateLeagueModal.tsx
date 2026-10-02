"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Calendar,
  Layers,
  Sparkles,
  X,
  ArrowRight,
  Copy,
  Check,
  Share2,
  Users,
  Loader2,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateLeagueModal({ isOpen, onClose }: CreateLeagueModalProps) {
  const router = useRouter();
  const { profile } = useAppStore();

  const [title, setTitle] = useState("");
  const [durationDays, setDurationDays] = useState<number>(5);
  const [questionsPerDay, setQuestionsPerDay] = useState<number>(5);
  const [category, setCategory] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("mixed");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please choose a title for your league.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/trivia/league", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          creatorName: profile.username || "Scholar",
          creatorId: profile.id,
          durationDays,
          questionsPerDay,
          difficulty,
          category,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.league) {
        setError(data.error || "Failed to create league.");
        return;
      }

      setCreatedCode(data.league.code);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#A3B18A", "#DDA15E", "#BC6C25"],
        });
      } catch {}
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || "An unexpected error occurred.");
    }
  }

  const leagueUrl = typeof window !== "undefined" && createdCode
    ? `${window.location.origin}/games/trivia/league/${createdCode}`
    : `https://fey.lokinlabs.com.ng/games/trivia/league/${createdCode || ""}`;

  function copyInviteLink() {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(leagueUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `🏆 Join my ${durationDays}-day Friendship League "${title.trim()}" on Fey!\n` +
      `Answer 1 daily quiz drop and compete for the top scholar ranking.\n\n` +
      `Join here: ${leagueUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 surface-modal backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        className="w-full max-w-lg rounded-2xl p-6 sm:p-7 surface-raised shadow-2xl relative border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-lg hover:bg-[var(--bg-input)]"
        >
          <X size={18} />
        </button>

        <AnimatePresence mode="wait">
          {!createdCode ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: "rgba(221, 161, 94, 0.12)",
                    borderColor: "var(--terra)",
                    color: "var(--terra)",
                  }}
                >
                  <Trophy size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1">
                    <Sparkles size={11} className="text-[var(--gold)]" /> Multi-Day Tournament
                  </div>
                  <h2 className="font-space text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
                    Create Friendship League
                  </h2>
                </div>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                Start a private multi-day tournament for your circle. Everyone answers <strong>1 daily quiz drop</strong> with live cumulative standings.
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text)" }}>
                    League Name <span className="text-[var(--terra)]">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="e.g. Lagos Tech Circle, Class of '24, Weekend Trivia"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none surface-input"
                    style={{ borderColor: error ? "var(--terra)" : "var(--border)", color: "var(--text)" }}
                    autoFocus
                  />
                  {error && <p className="text-xs text-[var(--terra)] mt-1 font-medium">{error}</p>}
                </div>

                {/* Duration */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text)" }}>
                    Tournament Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 14].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setDurationDays(days)}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                          durationDays === days
                            ? "border-[var(--olive)] bg-[var(--bg-input)] text-[var(--olive-text)] shadow-xs"
                            : "border-[var(--border-dim)] text-[var(--text-muted)] hover:text-[var(--text)]"
                        }`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>

                {/* Questions Per Day & Difficulty */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text)" }}>
                      Daily Drop Size
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[5, 10].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setQuestionsPerDay(count)}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            questionsPerDay === count
                              ? "border-[var(--olive)] bg-[var(--bg-input)] text-[var(--olive-text)] shadow-xs"
                              : "border-[var(--border-dim)] text-[var(--text-muted)] hover:text-[var(--text)]"
                          }`}
                        >
                          {count} Questions
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text)" }}>
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none surface-input"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }}
                    >
                      <option value="mixed">Mixed (Balanced)</option>
                      <option value="easy">Easy (Casual)</option>
                      <option value="medium">Medium (Standard)</option>
                      <option value="hard">Hard (Scholar Mode)</option>
                    </select>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text)" }}>
                    Topic Discipline
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none surface-input"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <option value="all">🇳🇬 All Topics (History, Pop Culture, General Knowledge)</option>
                    <option value="History">🏛️ Nigerian History & Politics</option>
                    <option value="Pop Culture">🎬 Pop Culture, Nollywood & Music</option>
                    <option value="General Knowledge">💡 General Knowledge & Landmarks</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-ghost text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-terra px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Launching...
                      </>
                    ) : (
                      <>
                        <Trophy size={14} /> Create League <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* SUCCESS STATE */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4 space-y-5 text-center"
            >
              <div
                className="w-14 h-14 rounded-full mx-auto flex items-center justify-center border shadow-sm"
                style={{
                  backgroundColor: "rgba(92, 106, 54, 0.15)",
                  borderColor: "var(--olive)",
                  color: "var(--olive-text)",
                }}
              >
                <Trophy size={28} />
              </div>

              <div>
                <h3 className="font-space text-2xl font-bold" style={{ color: "var(--text)" }}>
                  League Created!
                </h3>
                <p className="text-xs text-[var(--text-dim)] mt-1 max-w-sm mx-auto">
                  <strong>"{title}"</strong> is active for {durationDays} days. Share this link with your friends to start competing.
                </p>
              </div>

              {/* Code Box */}
              <div className="p-3.5 rounded-xl border bg-[var(--bg-input)] space-y-2" style={{ borderColor: "var(--border-dim)" }}>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-mute)]">League Code</div>
                <div className="font-mono text-2xl font-extrabold tracking-wider text-[var(--terra)]">
                  {createdCode}
                </div>
                <p className="text-[11px] text-[var(--text-mute)] truncate max-w-full px-2">
                  {leagueUrl}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={copyInviteLink}
                  className="flex-1 py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--bg-input)] transition-colors"
                  style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  {copied ? "Link Copied!" : "Copy Invite Link"}
                </button>
                <button
                  type="button"
                  onClick={shareWhatsApp}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Share2 size={14} /> Share on WhatsApp
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(`/games/trivia/league/${createdCode}`);
                  }}
                  className="w-full btn-terra py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Enter League Arena</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
