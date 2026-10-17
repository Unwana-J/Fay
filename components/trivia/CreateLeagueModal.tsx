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
  Zap,
  Clock,
  Infinity,
  ShieldCheck,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { FeyLogo } from "@/components/ui/FeyLogo";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { saveLocalLeague, unmarkLocalLeagueDeleted } from "@/lib/trivia-league";

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
  const [attemptPolicy, setAttemptPolicy] = useState<"host_controlled" | "flexible" | "strict" | "unlimited">("host_controlled");
  const [timerMode, setTimerMode] = useState<"per_question" | "total_bank">("per_question");
  const [questionTimerSeconds, setQuestionTimerSeconds] = useState<number>(25);
  const [totalDropMinutes, setTotalDropMinutes] = useState<number>(5);
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
          attemptPolicy,
          timerMode,
          questionTimerSeconds: timerMode === "per_question" ? questionTimerSeconds : 0,
          totalDropSeconds: timerMode === "total_bank" ? Math.round(totalDropMinutes * 60) : (questionsPerDay * questionTimerSeconds),
          allowUnlimitedDrops: attemptPolicy === "unlimited",
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok || !data.league) {
        setError(data.error || "Failed to create league.");
        return;
      }

      // Save to localStorage immediately so this device always has full league configuration
      if (typeof window !== "undefined") {
        try {
          unmarkLocalLeagueDeleted(data.league.code);
          saveLocalLeague(data.league, true);
        } catch {}
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

  const queryParams = new URLSearchParams({
    d: String(durationDays),
    q: String(questionsPerDay),
    t: title.trim(),
    c: profile.username || "Scholar",
    cat: category,
    diff: difficulty,
    pol: attemptPolicy,
    tmode: timerMode,
    tim: String(timerMode === "per_question" ? questionTimerSeconds : 0),
    tot: String(timerMode === "total_bank" ? Math.round(totalDropMinutes * 60) : (questionsPerDay * questionTimerSeconds)),
  }).toString();

  const baseUrl = typeof window !== "undefined"
    ? window.location.origin
    : "https://fey.lokinlabs.com.ng";

  const leagueUrl = createdCode
    ? `${baseUrl}/games/trivia/league/${createdCode}?${queryParams}`
    : `${baseUrl}/games/trivia/league`;

  function copyInviteLink() {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(leagueUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(
      `🏆 Join my ${durationDays}-day Daily League "${title.trim()}" on Fey!\n` +
      `Answer 1 daily quiz drop (${questionsPerDay} Qs) on your own schedule and compete for the top scholar ranking.\n\n` +
      `Join here: ${leagueUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 surface-modal backdrop-blur-md overflow-y-auto overscroll-contain">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        className="w-full max-w-lg rounded-3xl p-4 sm:p-6 surface-raised shadow-2xl relative border my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] flex flex-col overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
      >
        <AnimatePresence mode="wait">
          {!createdCode ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col min-h-0 flex-1 overflow-hidden"
            >
              {/* Streamlined Header */}
              <div
                className="shrink-0 pb-3 mb-3 border-b flex items-center justify-between"
                style={{ borderColor: "var(--border-dim)" }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: "rgba(122, 28, 46, 0.08)",
                      borderColor: "rgba(122, 28, 46, 0.2)",
                      color: "var(--terra)",
                    }}
                  >
                    <Trophy size={18} />
                  </div>
                  <div className="min-w-0">
                    <h2
                      className="font-space text-base sm:text-lg font-bold tracking-tight truncate"
                      style={{ color: "var(--text)" }}
                    >
                      Create Daily League
                    </h2>
                    <p className="text-[11px] leading-tight truncate" style={{ color: "var(--text-dim)" }}>
                      Daily quiz drops with circle standings
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-lg hover:bg-[var(--bg-input)] cursor-pointer shrink-0 ml-2"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto overscroll-contain pr-1 sm:pr-2 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text)" }}>
                    League Name <span className="text-[var(--terra)]">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="e.g. Lagos Tech Circle, Friday Trivia"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none surface-input"
                    style={{ borderColor: error ? "var(--terra)" : "var(--border)", color: "var(--text)" }}
                    autoFocus
                  />
                  {error && <p className="text-xs text-[var(--terra)] mt-1 font-medium">{error}</p>}
                </div>

                {/* Duration */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                      Tournament Duration
                    </label>
                    {attemptPolicy === "unlimited" && (
                      <span className="text-[10px] font-mono font-bold text-[var(--terra)] bg-[var(--terra)]/15 px-2 py-0.5 rounded-full border border-[var(--terra)]/30">
                        Marathon Mode
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {[
                      { days: 3, label: "3 Days" },
                      { days: 5, label: "5 Days" },
                      { days: 7, label: "7 Days" },
                      { days: 14, label: "14 Days" },
                      { days: 30, label: "30 Days" },
                    ].map(({ days, label }) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => {
                          setDurationDays(days);
                          if (attemptPolicy === "unlimited") setAttemptPolicy("flexible");
                        }}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          durationDays === days && attemptPolicy !== "unlimited"
                            ? "border-[var(--olive)] bg-[var(--bg-input)] text-[var(--olive-text)] shadow-xs"
                            : "border-[var(--border-dim)] text-[var(--text-muted)] hover:text-[var(--text)]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setDurationDays(30);
                        setAttemptPolicy("unlimited");
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        attemptPolicy === "unlimited"
                          ? "border-[var(--terra)] bg-[var(--terra)]/15 text-[var(--terra)] shadow-xs"
                          : "border-[var(--border-dim)] text-[var(--text-muted)] hover:text-[var(--text)]"
                      }`}
                    >
                      <Infinity size={12} className="shrink-0" />
                      <span>Extra</span>
                    </button>
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
                          className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            questionsPerDay === count
                              ? "border-[var(--olive)] bg-[var(--bg-input)] text-[var(--olive-text)] shadow-xs"
                              : "border-[var(--border-dim)] text-[var(--text-muted)] hover:text-[var(--text)]"
                          }`}
                        >
                          <span className="sm:hidden">{count} Qs</span>
                          <span className="hidden sm:inline">{count} Questions</span>
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
                      className="w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none surface-input cursor-pointer"
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
                    className="w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none surface-input cursor-pointer"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <option value="all">All Topics (Curated Mix)</option>
                    <option value="History">Nigerian History &amp; Politics</option>
                    <option value="Pop Culture">Pop Culture, Nollywood &amp; Music</option>
                    <option value="Sports">Nigerian Sports &amp; Super Eagles Lore</option>
                    <option value="General Knowledge">General Knowledge &amp; Landmarks</option>
                  </select>
                </div>

                {/* Timer Pacing (Strict Pace vs Total Drop Clock) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                      Timer Pacing
                    </label>
                    <span className="text-[10px] font-mono font-bold text-[var(--terra)]">
                      {timerMode === "per_question" ? `${questionTimerSeconds}s per Question` : `${totalDropMinutes}m Total Drop Clock`}
                    </span>
                  </div>

                  {/* Mode Toggle */}
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-dim)] gap-1">
                    <button
                      type="button"
                      onClick={() => setTimerMode("per_question")}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold font-space transition-all cursor-pointer ${
                        timerMode === "per_question"
                          ? "bg-[var(--bg-card)] text-[var(--terra)] shadow-xs border border-[var(--border-dim)]"
                          : "text-[var(--text-dim)] hover:text-[var(--text)]"
                      }`}
                    >
                      Per Question
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimerMode("total_bank")}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold font-space transition-all cursor-pointer ${
                        timerMode === "total_bank"
                          ? "bg-[var(--bg-card)] text-[var(--olive)] shadow-xs border border-[var(--border-dim)]"
                          : "text-[var(--text-dim)] hover:text-[var(--text)]"
                      }`}
                    >
                      Total Drop Clock
                    </button>
                  </div>

                  {/* Options for Selected Mode */}
                  {timerMode === "per_question" ? (
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[10, 15, 25, 40].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => setQuestionTimerSeconds(sec)}
                            className={`py-2 px-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                              questionTimerSeconds === sec
                                ? "border-[var(--terra)] bg-[var(--terra)]/10 text-[var(--terra)] shadow-xs font-bold"
                                : "border-[var(--border-dim)] bg-[var(--bg-card)] text-[var(--text-dim)] hover:text-[var(--text)]"
                            }`}
                          >
                            <span>{sec}s</span>
                            <span className="block text-[9px] font-normal opacity-80">
                              {sec === 10 ? "Anti-Cheat" : sec === 15 ? "Blitz" : sec === 25 ? "Standard" : "Deliberate"}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-[var(--text-dim)] mt-1.5 leading-tight">
                        Each question has its own clock. Unanswered questions auto-advance when time runs out.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-3 gap-2">
                        {[2, 3, 5].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setTotalDropMinutes(mins)}
                            className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                              totalDropMinutes === mins
                                ? "border-[var(--olive)] bg-[var(--olive)]/10 text-[var(--olive)] shadow-xs font-bold"
                                : "border-[var(--border-dim)] bg-[var(--bg-card)] text-[var(--text-dim)] hover:text-[var(--text)]"
                            }`}
                          >
                            <span>{mins} Mins</span>
                            <span className="block text-[9px] font-normal opacity-80">
                              {mins === 2 ? "Fast Bank" : mins === 3 ? "Balanced" : "Generous"}
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-[var(--text-dim)] mt-1.5 leading-tight">
                        Questions are untimed individually, but the entire drop closes immediately when the clock hits 0:00.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quiz Schedule Mode */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text)" }}>
                    Quiz Schedule
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAttemptPolicy("host_controlled")}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        attemptPolicy === "host_controlled"
                          ? "border-[var(--terra)] bg-[var(--terra)]/10 shadow-xs"
                          : "border-[var(--border-dim)] bg-[var(--bg-input)] hover:border-[var(--border)]"
                      }`}
                    >
                      <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-[var(--olive)]" />
                        <span>Host-Paced</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-dim)] mt-0.5 leading-tight">
                        Host manually unlocks each drop for all scholars.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttemptPolicy("flexible")}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        attemptPolicy === "flexible"
                          ? "border-[var(--terra)] bg-[var(--terra)]/10 shadow-xs"
                          : "border-[var(--border-dim)] bg-[var(--bg-input)] hover:border-[var(--border)]"
                      }`}
                    >
                      <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                        <Zap size={13} className="text-amber-500" />
                        <span>Self-Paced</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-dim)] mt-0.5 leading-tight">
                        Next drop unlocks right after finishing each one.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAttemptPolicy("strict")}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        attemptPolicy === "strict"
                          ? "border-[var(--terra)] bg-[var(--terra)]/10 shadow-xs"
                          : "border-[var(--border-dim)] bg-[var(--bg-input)] hover:border-[var(--border)]"
                      }`}
                    >
                      <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                        <Clock size={13} className="text-[var(--terra)]" />
                        <span>Daily (24h)</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-dim)] mt-0.5 leading-tight">
                        1 new drop unlocks every day at midnight.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAttemptPolicy("unlimited");
                        setDurationDays(30);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        attemptPolicy === "unlimited"
                          ? "border-[var(--terra)] bg-[var(--terra)]/10 shadow-xs"
                          : "border-[var(--border-dim)] bg-[var(--bg-input)] hover:border-[var(--border)]"
                      }`}
                    >
                      <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                        <Infinity size={13} className="text-[var(--olive)]" />
                        <span>Continuous</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-dim)] mt-0.5 leading-tight">
                        Play back-to-back drops with no wait time.
                      </p>
                    </button>
                  </div>
                </div>
              </div>

                {/* Sticky Action Footer */}
                <div className="pt-3 mt-2 border-t border-[var(--border-dim)] flex items-center justify-between shrink-0 bg-[var(--bg-card)]">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-ghost text-xs py-2 px-3 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-terra px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-transform"
                  >
                    {isLoading ? (
                      <>
                        <FeyLogo size={13} spinning={true} /> Launching...
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
              className="py-4 space-y-5 text-center overflow-y-auto max-h-full relative"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute top-0 right-0 p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-lg hover:bg-[var(--bg-input)] cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
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
