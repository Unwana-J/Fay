"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Check,
  ExternalLink,
  Sparkles,
  Copy,
  Zap,
  Image as ImageIcon,
  Trophy,
} from "lucide-react";
import { getShortenedUrl } from "@/lib/url-shortener";
import { copyTextToClipboard } from "@/lib/clipboard";
import { copyTriviaCardToClipboard, downloadTriviaCard } from "@/lib/trivia-card-canvas";
import { useAppStore } from "@/store/useAppStore";

interface ShareTriviaModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  total: number;
  pct: number;
  gradeLabel: string;
  xpEarned: number;
  byCategory?: { category: string; correct: number; total: number }[];
  questionIds?: string[];
}

export default function ShareTriviaModal({
  isOpen,
  onClose,
  score,
  total,
  pct,
  gradeLabel,
  xpEarned,
  byCategory = [],
  questionIds = [],
}: ShareTriviaModalProps) {
  const { profile } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [activeUrl, setActiveUrl] = useState<string>("");
  const [customTaunt, setCustomTaunt] = useState<string>("");

  const authorName = profile?.username || "Scholar";

  // Public canonical challenge link with score & author metadata
  const fullShareUrl = useMemo(() => {
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local"));
    const origin =
      typeof window !== "undefined" && !isLocalhost
        ? window.location.origin
        : "https://fey.lokinlabs.com.ng";

    const params = new URLSearchParams();
    params.set("score", String(score));
    params.set("total", String(total));
    params.set("pct", String(pct));
    params.set("by", authorName);
    params.set("grade", gradeLabel);
    if (xpEarned > 0) params.set("xp", String(xpEarned));
    if (questionIds && questionIds.length > 0) {
      params.set("q", questionIds.join(","));
    }

    return `${origin}/games/trivia?${params.toString()}`;
  }, [score, total, pct, authorName, gradeLabel, xpEarned, questionIds]);

  // Shorten URL for WhatsApp compatibility
  useEffect(() => {
    if (!fullShareUrl) {
      setActiveUrl("");
      return;
    }
    setActiveUrl(fullShareUrl);
    let mounted = true;
    getShortenedUrl(fullShareUrl).then((short) => {
      if (mounted && short && short !== fullShareUrl) {
        setActiveUrl(short);
      }
    });
    return () => {
      mounted = false;
    };
  }, [fullShareUrl]);

  if (!isOpen) return null;

  const targetUrl = activeUrl || fullShareUrl;

  const shareHeadline = customTaunt.trim()
    ? customTaunt.trim()
    : `${authorName} got ${pct}% on Naija Trivia! Can you beat this? 🇳🇬`;

  const whatsappMessage = `🇳🇬 *Naija Trivia Challenge*\n*${authorName} got ${pct}% on Naija Trivia! Can you beat this?*\n\nScore: *${score}/${total}* (${gradeLabel})\nAnswer the exact same questions and see if you can top their score:\n${targetUrl}`;
  const twitterMessage = `${authorName} got ${pct}% on Naija Trivia! Can you beat this? 🇳🇬🎯 Play the exact same questions on @FeyPlatform:\n\n`;

  async function handleCopy() {
    if (!targetUrl) return;
    const ok = await copyTextToClipboard(`${shareHeadline}\n\n${targetUrl}`);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleShareWhatsApp() {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
  }

  function handleShareTwitter() {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterMessage)}&url=${encodeURIComponent(targetUrl)}`,
      "_blank"
    );
  }

  function handleShareLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(targetUrl)}`,
      "_blank"
    );
  }

  async function handleCopyCardImage() {
    const cardData = {
      score,
      total,
      pct,
      gradeLabel,
      author: authorName,
      xpEarned,
      categories: byCategory,
    };
    const ok = await copyTriviaCardToClipboard(cardData);
    if (ok) {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2500);
    } else {
      await downloadTriviaCard(cardData);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-lg rounded-3xl p-6 sm:p-7 surface-raised shadow-2xl relative border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b mb-5" style={{ borderColor: "var(--border-dim)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--olive)]/15 border border-[var(--olive)]/30 flex items-center justify-center text-lg">
              🇳🇬
            </div>
            <div>
              <h2 className="font-space font-extrabold text-base" style={{ color: "var(--text)" }}>
                Share Score &amp; Challenge Friends
              </h2>
              <p className="text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>
                Invite anyone to beat your score on Naija Trivia.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Live Card Preview (Naija Trivia Theme) */}
        <div className="mb-4">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-mute)] mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-[var(--gold)]" />
              <span>Link Preview Card (WhatsApp / X / LinkedIn)</span>
            </div>
            <span className="text-[10px] text-[var(--olive)] font-bold">1200 × 630 HD</span>
          </div>

          <div
            className="rounded-2xl p-5 border relative overflow-hidden"
            style={{
              borderColor: "rgba(0, 135, 81, 0.4)",
              background: "linear-gradient(145deg, #0e1a13 0%, #09100c 100%)",
              color: "#FDFBF7",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#52B788] flex items-center gap-1">
                <span>🇳🇬 Fey Trivia Arcade</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFD166]/15 border border-[#FFD166]/30 text-[#FFD166]">
                ⚔️ CHALLENGE
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-md bg-[#008751]/30 text-[#52B788] mb-1.5 border border-[#008751]/50">
                  {gradeLabel}
                </span>
                <h3 className="font-space font-extrabold text-lg text-white">
                  {authorName} got {pct}% on Naija Trivia!
                </h3>
                <p className="text-xs text-[#FFD166] font-bold">
                  Can you beat this? 🇳🇬
                </p>
                <p className="text-[11px] text-white/60 font-mono mt-0.5">
                  Answer the exact same {total} questions
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-[#008751]/40 min-w-[90px]">
                <div className="font-space font-black text-3xl text-white">
                  {score}<span className="text-sm font-normal text-white/50">/{total}</span>
                </div>
                <div className="text-[10px] font-mono text-[#52B788] font-bold">
                  {pct}% ACC
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
              <span>{total * 15}s total duration</span>
              <span className="text-[#FFD166]">fey.lokinlabs.com.ng</span>
            </div>
          </div>
        </div>

        {/* Custom Taunt / Invite Headline (Optional) */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold mb-1" style={{ color: "var(--text-dim)" }}>
            Custom Challenge Taunt (optional for WhatsApp &amp; X):
          </label>
          <input
            type="text"
            value={customTaunt}
            onChange={(e) => setCustomTaunt(e.target.value)}
            placeholder={`e.g. Think you know Naija better than me? Oya beat my ${score}/${total}!`}
            className="w-full px-3 py-2 rounded-xl border bg-transparent text-xs focus:outline-none"
            style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
          />
        </div>

        {/* Copy Link Row */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono" style={{ color: "var(--text-dim)" }}>
              Shareable Challenge Link:
            </span>
            {activeUrl && activeUrl !== fullShareUrl && (
              <span className="text-[10px] text-[var(--olive)] font-medium">✓ WhatsApp Ready</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={targetUrl}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-mono surface border outline-none truncate select-all"
              style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all"
              style={{
                background: copied ? "var(--olive)" : "var(--terra)",
                color: "#fff",
              }}
            >
              {copied ? (
                <>
                  <Check size={13} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t flex-wrap" style={{ borderColor: "var(--border-dim)" }}>
          <button
            onClick={handleCopyCardImage}
            className="px-3 py-2 text-xs font-mono rounded-xl border flex items-center gap-1.5 cursor-pointer hover:bg-black/5 transition-colors"
            style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
            title="Copy an aesthetic 1200x630 proof card image to your clipboard"
          >
            {copiedCard ? <Check size={12} className="text-[var(--olive)]" /> : <ImageIcon size={12} className="text-[var(--gold)]" />}
            <span>{copiedCard ? "Card Copied!" : "Copy Card Image"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2 text-xs font-mono font-bold rounded-xl border flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                borderColor: "rgba(37, 211, 102, 0.4)",
                background: "rgba(37, 211, 102, 0.12)",
                color: "#25D366",
              }}
            >
              <span>💬 WhatsApp</span>
            </button>
            <button
              onClick={handleShareTwitter}
              className="px-3 py-2 text-xs font-mono rounded-xl border flex items-center gap-1.5 cursor-pointer hover:bg-black/5 transition-colors"
              style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
            >
              <span>𝕏 Post</span>
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="px-3 py-2 text-xs font-mono rounded-xl border flex items-center gap-1.5 cursor-pointer hover:bg-black/5 transition-colors"
              style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
            >
              <span>in LinkedIn</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
