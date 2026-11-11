"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle2, XCircle, Loader2, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ResearchPack,
  type ResearchQuizQuestion,
  getCachedResearch,
  cacheResearch,
  setMemoryResearch,
} from "@/lib/research-types";
import { useAppStore } from "@/store/useAppStore";

const XP_PER_QUESTION = 15;
const PERFECT_BONUS_XP = 15;

export default function ResearchQuizCard({
  sessionId,
  topicId,
  topicText,
  category,
  tags,
  onBonusXPClaimed,
}: {
  sessionId: string;
  topicId: string;
  topicText: string;
  category: string;
  tags?: string[];
  onBonusXPClaimed?: (xp: number) => void;
}) {
  const addXP = useAppStore((s) => s.addXP);
  const claimKey = `fey-research-quiz-claimed:${sessionId}`;

  const [questions, setQuestions] = useState<ResearchQuizQuestion[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "active" | "done" | "error">("idle");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [claimedXP, setClaimedXP] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(claimKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { score: number; xp: number };
        setScore(parsed.score);
        setClaimedXP(parsed.xp);
        setStatus("done");
        return;
      }
    } catch {
      /* ignore */
    }
    const cached = getCachedResearch(topicId);
    if (cached?.quiz && cached.quiz.length > 0) {
      setQuestions(cached.quiz);
    }
  }, [claimKey, topicId]);

  async function handleStartQuiz() {
    if (questions && questions.length > 0) {
      setCurrentIdx(0);
      setSelectedIdx(null);
      setScore(0);
      setStatus("active");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/ai/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, topic: topicText, category, tags }),
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) throw new Error(String(res.status));
      const pack = (await res.json()) as ResearchPack;
      setMemoryResearch(pack);
      if (!pack.degraded) cacheResearch(pack);
      if (pack.quiz && pack.quiz.length > 0) {
        setQuestions(pack.quiz);
        setCurrentIdx(0);
        setSelectedIdx(null);
        setScore(0);
        setStatus("active");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function handleSelectOption(idx: number) {
    if (selectedIdx !== null || !questions) return;
    setSelectedIdx(idx);
    const isCorrect = idx === questions[currentIdx].correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (!questions || selectedIdx === null) return;
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedIdx(null);
      return;
    }
    // Quiz finished — calculate and award XP once
    const totalQ = questions.length;
    const baseXP = score * XP_PER_QUESTION;
    const bonus = score === totalQ ? PERFECT_BONUS_XP : 0;
    const totalXP = baseXP + bonus;
    if (totalXP > 0) {
      addXP(totalXP);
      onBonusXPClaimed?.(totalXP);
    }
    setClaimedXP(totalXP);
    setStatus("done");
    try {
      window.localStorage.setItem(claimKey, JSON.stringify({ score, xp: totalXP }));
    } catch {
      /* ignore */
    }
  }

  const currentQuestion = questions?.[currentIdx];
  const totalQuestions = questions?.length ?? 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.38 }}
      className="w-full rounded-2xl p-5 border surface text-left"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BookOpen size={15} style={{ color: "var(--olive)" }} />
          <span className="font-serif font-bold text-sm" style={{ color: "var(--text)" }}>
            Seal Your Understanding · 3-Question Recall Check
          </span>
        </div>
        <span className="tag tag-gold text-[10px] font-mono font-bold">
          {status === "done" && claimedXP !== null ? `+${claimedXP} XP Claimed` : "Up to +60 Bonus XP"}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1"
          >
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
              Test what stuck from the reading pack. Earn +{XP_PER_QUESTION} XP per correct answer, plus a +{PERFECT_BONUS_XP} XP bonus for a 3/3 score.
            </p>
            <button
              onClick={handleStartQuiz}
              className="btn-terra px-4 py-2 text-xs font-mono rounded-lg whitespace-nowrap cursor-pointer"
            >
              Take Recall Check
            </button>
          </motion.div>
        )}

        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 py-4 text-xs font-semibold"
            style={{ color: "var(--olive-text)" }}
          >
            <Loader2 size={14} className="animate-spin" />
            <span>Preparing 3 recall questions from your reading sources…</span>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-3 py-2 text-xs"
            style={{ color: "var(--text-dim)" }}
          >
            <span>We couldn't load the recall questions right now.</span>
            <button onClick={handleStartQuiz} className="btn-ghost px-3 py-1.5 text-xs font-mono">
              Try Again
            </button>
          </motion.div>
        )}

        {status === "active" && currentQuestion && (
          <motion.div
            key={`q-${currentIdx}`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="space-y-3 pt-1"
          >
            <div className="flex items-center justify-between text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>
              <span>
                Question {currentIdx + 1} of {totalQuestions}
              </span>
              <span>Score: {score}/{totalQuestions}</span>
            </div>

            <p className="font-space font-bold text-sm leading-snug" style={{ color: "var(--text)" }}>
              {currentQuestion.question}
            </p>

            <div className="space-y-2">
              {currentQuestion.options.map((opt, idx) => {
                const isRevealed = selectedIdx !== null;
                const isCorrect = idx === currentQuestion.correctIndex;
                const isChosen = idx === selectedIdx;

                let borderColor = "var(--border-dim)";
                let bg = "var(--bg-input)";
                if (isRevealed) {
                  if (isCorrect) {
                    borderColor = "var(--olive)";
                    bg = "rgba(68, 78, 44, 0.12)";
                  } else if (isChosen) {
                    borderColor = "var(--red)";
                    bg = "rgba(181, 58, 58, 0.10)";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isRevealed}
                    onClick={() => handleSelectOption(idx)}
                    className={cn(
                      "w-full text-left rounded-xl px-3.5 py-2.5 text-xs border transition-all flex items-start justify-between gap-2.5",
                      !isRevealed && "hover:border-[var(--olive)] cursor-pointer"
                    )}
                    style={{ borderColor, background: bg, color: "var(--text)" }}
                  >
                    <span className="leading-relaxed">{opt}</span>
                    {isRevealed && isCorrect && (
                      <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" style={{ color: "var(--olive)" }} />
                    )}
                    {isRevealed && isChosen && !isCorrect && (
                      <XCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "var(--red)" }} />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedIdx !== null && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-3 text-xs space-y-2 border"
                style={{ background: "var(--bg-panel)", borderColor: "var(--border-dim)" }}
              >
                <p className="leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  <span className="font-bold" style={{ color: "var(--text)" }}>
                    {selectedIdx === currentQuestion.correctIndex ? "Correct · " : "From the reading · "}
                  </span>
                  {currentQuestion.explanation}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="btn-terra px-4 py-1.5 text-xs font-mono rounded-lg cursor-pointer"
                  >
                    {currentIdx + 1 < totalQuestions ? "Next Question" : "Claim Bonus XP"}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {status === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-4 border flex items-center justify-between gap-3 flex-wrap"
            style={{ borderColor: "var(--gold)", background: "rgba(166, 124, 30, 0.08)" }}
          >
            <div className="flex items-center gap-2.5">
              <Award size={18} style={{ color: "var(--gold)" }} />
              <div>
                <div className="text-xs font-bold font-serif" style={{ color: "var(--text)" }}>
                  Recall Complete · {score}/{totalQuestions} Correct
                  {score === totalQuestions ? " (Perfect Recall!)" : ""}
                </div>
                <div className="text-[11px] font-mono" style={{ color: "var(--text-dim)" }}>
                  {claimedXP && claimedXP > 0
                    ? `+${claimedXP} Bonus XP added to your scholar profile`
                    : "Review the reading pack on your next session to boost recall"}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
