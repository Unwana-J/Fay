"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Share2,
  Check,
  Sparkles,
  Copy,
  Image as ImageIcon,
  Download,
} from "lucide-react";
import { copyTextToClipboard } from "@/lib/clipboard";
import {
  copyTriviaCardToClipboard,
  downloadTriviaCard,
  type TriviaCardTheme,
} from "@/lib/trivia-card-canvas";
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
  const [downloading, setDownloading] = useState(false);
  const [customTaunt, setCustomTaunt] = useState<string>("");
  const [cardTheme, setCardTheme] = useState<TriviaCardTheme>("parchment");

  const authorName = profile?.username || "Scholar";

  // Public canonical challenge link with score & author metadata
  const fullShareUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://fey.lokinlabs.com.ng";

    const params = new URLSearchParams();
    params.set("score", String(score));
    params.set("total", String(total));
    params.set("pct", String(pct));
    // Clean author name to avoid special characters in query string
    params.set("by", authorName.replace(/[^\w\s-]/g, "").trim() || "Scholar");
    if (cardTheme !== "parchment") {
      params.set("theme", cardTheme);
    }
    if (questionIds && questionIds.length > 0) {
      params.set("q", questionIds.join(","));
    }

    return `${origin}/games/trivia?${params.toString()}`;
  }, [score, total, pct, authorName, cardTheme, questionIds]);

  // Always use the canonical branded URL for WhatsApp and social links
  // This guarantees WhatsApp/iMessage scrapers hit Fey's SSR metadata with 200 OK
  const targetUrl = fullShareUrl.trim();

  if (!isOpen) return null;

  const shareHeadline = customTaunt.trim()
    ? customTaunt.trim()
    : `${authorName} got ${pct}% on Naija Trivia! Can you beat this? 🇳🇬`;

  const whatsappMessage = customTaunt.trim()
    ? `${customTaunt.trim()}\n\n🇳🇬 *Naija Trivia Challenge*\nScore: *${score}/${total}* (${gradeLabel})\nPlay the exact same questions:\n${targetUrl}`
    : `🇳🇬 *Naija Trivia Challenge*\n*${authorName} got ${pct}% on Naija Trivia! Can you beat this?*\n\nScore: *${score}/${total}* (${gradeLabel})\nAnswer the exact same questions and see if you can top their score:\n${targetUrl}`;

  const twitterMessage = customTaunt.trim()
    ? `${customTaunt.trim()} 🇳🇬🎯 Play the exact same questions:`
    : `${authorName} got ${pct}% on Naija Trivia! Can you beat this? 🇳🇬🎯 Play the exact same questions:`;

  async function handleCopy() {
    if (!targetUrl) return;
    const ok = await copyTextToClipboard(targetUrl);
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
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullShareUrl)}`,
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
      theme: cardTheme,
    };
    const ok = await copyTriviaCardToClipboard(cardData);
    if (ok) {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2500);
    } else {
      await downloadTriviaCard(cardData);
    }
  }

  async function handleDownloadCardImage() {
    setDownloading(true);
    try {
      const cardData = {
        score,
        total,
        pct,
        gradeLabel,
        author: authorName,
        xpEarned,
        categories: byCategory,
        theme: cardTheme,
      };
      await downloadTriviaCard(cardData, `fey-trivia-${authorName.toLowerCase()}-${score}of${total}.png`);
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  }

  const isParchment = cardTheme === "parchment";

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

        {/* Live Card Preview Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-[var(--text-mute)]">
              <Sparkles size={11} className="text-[var(--gold)]" />
              <span>Broadside Proof Card</span>
            </div>

            {/* Editorial Theme Toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-[var(--border-dim)]">
              <button
                type="button"
                onClick={() => setCardTheme("parchment")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                  isParchment
                    ? "bg-[var(--bg-card)] text-[var(--text)] font-bold shadow-xs border border-[var(--border)]"
                    : "text-[var(--text-mute)] hover:text-[var(--text)]"
                }`}
              >
                📜 Parchment
              </button>
              <button
                type="button"
                onClick={() => setCardTheme("dark")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                  !isParchment
                    ? "bg-[var(--bg-card)] text-[var(--text)] font-bold shadow-xs border border-[var(--border)]"
                    : "text-[var(--text-mute)] hover:text-[var(--text)]"
                }`}
              >
                🌙 Dark
              </button>
            </div>
          </div>

          {/* Dynamic Editorial Broadside Preview */}
          <div
            className="rounded-2xl p-5 border relative overflow-hidden transition-all duration-300"
            style={{
              borderColor: isParchment ? "#444E2C" : "rgba(166, 124, 30, 0.45)",
              borderWidth: "2px",
              background: isParchment
                ? "linear-gradient(145deg, #F8F3EA 0%, #EDE4D6 100%)"
                : "linear-gradient(145deg, #151814 0%, #0D0F0C 100%)",
              color: isParchment ? "#1E2211" : "#FDFBF7",
              boxShadow: isParchment
                ? "0 6px 24px rgba(68, 78, 44, 0.12)"
                : "0 8px 32px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Inner hairline framing */}
            <div
              className="absolute inset-1.5 rounded-xl pointer-events-none"
              style={{
                border: isParchment
                  ? "1px solid rgba(166, 124, 30, 0.45)"
                  : "1px solid rgba(122, 28, 46, 0.35)",
              }}
            />

            {/* Corner diamond flourishes */}
            <div
              className="absolute top-1 left-1 text-[8px] pointer-events-none"
              style={{ color: isParchment ? "#A67C1E" : "#D4AF37" }}
            >
              ◆
            </div>
            <div
              className="absolute top-1 right-1 text-[8px] pointer-events-none"
              style={{ color: isParchment ? "#A67C1E" : "#D4AF37" }}
            >
              ◆
            </div>
            <div
              className="absolute bottom-1 left-1 text-[8px] pointer-events-none"
              style={{ color: isParchment ? "#A67C1E" : "#D4AF37" }}
            >
              ◆
            </div>
            <div
              className="absolute bottom-1 right-1 text-[8px] pointer-events-none"
              style={{ color: isParchment ? "#A67C1E" : "#D4AF37" }}
            >
              ◆
            </div>

            {/* Top Bar */}
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span
                className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ color: isParchment ? "#444E2C" : "#D4AF37" }}
              >
                <span>🇳🇬</span>
                <span>Fey Scholar Dispatch</span>
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                style={{
                  background: isParchment ? "rgba(166, 124, 30, 0.15)" : "#A67C1E15",
                  border: isParchment ? "1px solid rgba(166, 124, 30, 0.4)" : "1px solid #A67C1E4D",
                  color: isParchment ? "#8C6512" : "#FFD166",
                }}
              >
                ⚔️ CHALLENGE
              </span>
            </div>

            {/* Centerpiece Row */}
            <div className="flex items-center justify-between gap-4 mb-3 relative z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-md"
                    style={{
                      background: "#7A1C2E",
                      color: "#FDFBF7",
                      border: "1px solid #58101E",
                    }}
                  >
                    {gradeLabel}
                  </span>
                  {xpEarned > 0 && (
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                      style={{
                        background: isParchment ? "#EDE5D6" : "rgba(166,124,30,0.25)",
                        border: "1px solid #A67C1E",
                        color: isParchment ? "#8C6512" : "#FFD166",
                      }}
                    >
                      +{xpEarned} XP
                    </span>
                  )}
                </div>

                <h3
                  className="font-serif font-extrabold text-lg truncate leading-tight"
                  style={{ color: isParchment ? "#1E2211" : "#FFFFFF" }}
                >
                  {authorName} scored {pct}% on Naija Trivia
                </h3>
                <p
                  className="text-xs italic font-serif"
                  style={{ color: isParchment ? "#525645" : "#C8C4B7" }}
                >
                  Can you beat this? 🇳🇬
                </p>
                <p
                  className="text-[11px] font-mono mt-0.5"
                  style={{ color: isParchment ? "#6E7260" : "rgba(255,255,255,0.5)" }}
                >
                  Answer the exact same {total} questions on Fey
                </p>
              </div>

              {/* Score Plaque */}
              <div
                className="flex flex-col items-center justify-center p-3 rounded-2xl min-w-[100px] border shadow-xs"
                style={{
                  background: isParchment ? "#FDFCFA" : "rgba(25,30,23,0.85)",
                  borderColor: isParchment ? "rgba(68, 78, 44, 0.22)" : "rgba(92,106,54,0.55)",
                }}
              >
                <div
                  className="font-space font-black text-3xl leading-none"
                  style={{ color: isParchment ? "#7A1C2E" : "#FFFFFF" }}
                >
                  {score}
                  <span
                    className="text-sm font-normal"
                    style={{ color: isParchment ? "#7D8171" : "rgba(255,255,255,0.45)" }}
                  >
                    /{total}
                  </span>
                </div>
                <div
                  className="text-[10px] font-mono font-bold mt-1"
                  style={{ color: isParchment ? "#444E2C" : "#A67C1E" }}
                >
                  {pct}% ACCURACY
                </div>
              </div>
            </div>

            {/* Bottom Colophon */}
            <div
              className="pt-2 border-t flex items-center justify-between text-[10px] font-mono relative z-10"
              style={{
                borderColor: isParchment ? "rgba(68, 78, 44, 0.18)" : "rgba(255,255,255,0.1)",
                color: isParchment ? "#6E7260" : "rgba(255,255,255,0.5)",
              }}
            >
              <span style={{ color: isParchment ? "#444E2C" : "#A67C1E" }}>
                Fey Academic Archive
              </span>
              <span style={{ color: isParchment ? "#7A1C2E" : "rgba(255,255,255,0.7)" }}>
                fey.lokinlabs.com.ng
              </span>
            </div>
          </div>
        </div>

        {/* Custom Taunt / Invite Headline */}
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
            <span className="text-[10px] text-[var(--olive)] font-medium">✓ Official Fey Dispatch</span>
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

        {/* Social Share Buttons & Proof Card Actions */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t flex-wrap" style={{ borderColor: "var(--border-dim)" }}>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyCardImage}
              className="px-3 py-2 text-xs font-mono rounded-xl border flex items-center gap-1.5 cursor-pointer hover:bg-black/5 transition-colors"
              style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
              title="Copy an aesthetic 1200x630 proof card image to your clipboard"
            >
              {copiedCard ? <Check size={12} className="text-[var(--olive)]" /> : <ImageIcon size={12} className="text-[var(--gold)]" />}
              <span>{copiedCard ? "Card Copied!" : "Copy Image"}</span>
            </button>
            <button
              onClick={handleDownloadCardImage}
              disabled={downloading}
              className="p-2 text-xs rounded-xl border flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors text-[var(--text-dim)]"
              style={{ borderColor: "var(--border-dim)" }}
              title="Download 1200x630 PNG proof card"
            >
              {downloading ? <Check size={13} className="text-[var(--olive)]" /> : <Download size={13} />}
            </button>
          </div>

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
