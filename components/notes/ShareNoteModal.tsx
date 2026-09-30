"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Check,
  ExternalLink,
  Sparkles,
  BookOpen,
  Mic,
  Copy,
  Globe,
  Image as ImageIcon,
} from "lucide-react";
import FeyLogo from "@/components/ui/FeyLogo";
import { encodeSharedNote, type SharedNotePayload } from "@/lib/share-note";
import { getShortenedUrl } from "@/lib/url-shortener";
import { copyTextToClipboard } from "@/lib/clipboard";
import { CATEGORY_COLORS, CATEGORY_ICONS, DIFFICULTY_LABELS, type Difficulty } from "@/lib/topics";
import { copyFeynmanCardToClipboard, downloadFeynmanCard } from "@/lib/feynman-card-canvas";

interface ShareNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: SharedNotePayload | null;
}

export default function ShareNoteModal({
  isOpen,
  onClose,
  note,
}: ShareNoteModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [activeUrl, setActiveUrl] = useState<string>("");
  const [highlightExcerpt, setHighlightExcerpt] = useState<string>("");

  // Extract clean sentence candidates from the note for 1-click preview selection
  const sentenceSuggestions = useMemo(() => {
    if (!note?.notes) return [];
    const clean = note.notes
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const sentences = clean
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 20 && s.length <= 220);
    return sentences.slice(0, 3);
  }, [note]);

  const fullShareUrl = useMemo(() => {
    if (!note) return "";
    const code = encodeSharedNote(note);
    if (!code) return "";
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local"));
    const origin =
      typeof window !== "undefined" && !isLocalhost
        ? window.location.origin
        : "https://fey.lokinlabs.com.ng";
    const baseUrl = `${origin}/note/${code}`;
    if (highlightExcerpt.trim()) {
      return `${baseUrl}?q=${encodeURIComponent(highlightExcerpt.trim())}`;
    }
    return baseUrl;
  }, [note, highlightExcerpt]);

  // Attempt to shorten the URL when modal opens or highlight changes
  React.useEffect(() => {
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

  if (!isOpen || !note) return null;

  const categoryColor = CATEGORY_COLORS[note.category] || "var(--terra)";
  const categoryIcon = CATEGORY_ICONS[note.category] || "📜";
  const diffMeta = DIFFICULTY_LABELS[note.difficulty as Difficulty] || {
    icon: "📖",
    label: note.difficulty || "Scholar",
  };

  async function handleCopy() {
    const urlToCopy = activeUrl || fullShareUrl;
    if (!urlToCopy) return;
    const ok = await copyTextToClipboard(urlToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleShareTwitter() {
    if (!note) return;
    const urlToShare = activeUrl || fullShareUrl;
    const quotePrefix = highlightExcerpt.trim()
      ? `“${highlightExcerpt.trim()}”\n\n— From my synthesis on "${note.topicText}" on @FeyPlatform:\n`
      : `Read my synthesis on "${note.topicText}" — articulated using the Feynman Technique on @FeyPlatform:\n\n`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(quotePrefix)}&url=${encodeURIComponent(urlToShare)}`,
      "_blank"
    );
  }

  function handleShareWhatsApp() {
    if (!note) return;
    const urlToShare = activeUrl || fullShareUrl;
    const quotePrefix = highlightExcerpt.trim()
      ? `“${highlightExcerpt.trim()}”\n\n— From my synthesis on "${note.topicText}":\n`
      : `Read my synthesis on "${note.topicText}" — articulated using the Feynman Technique on Fey:\n\n`;
    const text = `${quotePrefix}${urlToShare}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  }

  async function handleCopyCardImage() {
    if (!note) return;
    const cardData = {
      topicText: note.topicText,
      category: note.category,
      difficulty: note.difficulty,
      author: note.author,
      notesSnippet: highlightExcerpt.trim() || note.notes,
      speakingSeconds: note.speakingSeconds,
    };
    const success = await copyFeynmanCardToClipboard(cardData);
    if (success) {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2500);
    } else {
      await downloadFeynmanCard(cardData);
    }
  }

  function handleShareLinkedIn() {
    const urlToShare = activeUrl || fullShareUrl;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(urlToShare)}`,
      "_blank"
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-xl rounded-2xl p-6 sm:p-7 surface-raised shadow-2xl relative border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b mb-5" style={{ borderColor: "var(--border-dim)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg surface border flex items-center justify-center text-[var(--terra)]" style={{ borderColor: "var(--border-dim)" }}>
              <Globe size={16} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[var(--text)]">
                Publish &amp; Share Notes
              </h2>
              <p className="text-[11px] font-mono text-[var(--text-mute)]">
                Anyone with this link can read your synthesis and start their journey.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-black/5 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Highlight / Excerpt Selector */}
        <div
          className="mb-4 p-3.5 rounded-xl border"
          style={{ borderColor: "var(--border-dim)", background: "var(--bg-panel)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
              <Sparkles size={12} className="text-[var(--gold)]" />
              <span>Feature Quote / Excerpt in Preview</span>
            </span>
            {highlightExcerpt.trim() && (
              <button
                type="button"
                onClick={() => setHighlightExcerpt("")}
                className="text-[10px] font-mono text-[var(--terra)] hover:underline cursor-pointer"
              >
                Reset to Full Note
              </button>
            )}
          </div>

          {sentenceSuggestions.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setHighlightExcerpt("")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono shrink-0 border transition-all cursor-pointer ${
                  !highlightExcerpt.trim()
                    ? "border-[var(--terra)] text-[var(--terra)] bg-[var(--terra)]/10 font-bold"
                    : "border-[var(--border-dim)] text-[var(--text-mute)] hover:text-[var(--text)]"
                }`}
              >
                Full Note
              </button>
              {sentenceSuggestions.map((sentence, idx) => {
                const isSelected = highlightExcerpt.trim() === sentence;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setHighlightExcerpt(sentence)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono shrink-0 border transition-all cursor-pointer max-w-[200px] truncate ${
                      isSelected
                        ? "border-[var(--terra)] text-[var(--terra)] bg-[var(--terra)]/10 font-bold"
                        : "border-[var(--border-dim)] text-[var(--text-mute)] hover:text-[var(--text)]"
                    }`}
                    title={sentence}
                  >
                    “{sentence.slice(0, 32)}…”
                  </button>
                );
              })}
            </div>
          )}

          <input
            type="text"
            value={highlightExcerpt}
            onChange={(e) => setHighlightExcerpt(e.target.value)}
            placeholder="Type or edit a punchy quote for WhatsApp & X previews..."
            className="w-full px-3 py-1.5 rounded-lg border bg-transparent text-xs font-serif italic focus:outline-none"
            style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
          />
        </div>

        {/* Live Card Preview in Fey Editorial Aesthetic */}
        <div className="mb-5">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-mute)] mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-[var(--gold)]" />
              <span>Card Preview (WhatsApp / X / LinkedIn)</span>
            </div>
            {highlightExcerpt.trim() ? (
              <span className="text-[10px] text-[var(--gold)] font-mono">Excerpt Featured</span>
            ) : null}
          </div>

          <div
            className="rounded-xl p-5 border surface relative overflow-hidden transition-colors"
            style={{
              borderColor: highlightExcerpt.trim() ? "var(--terra)" : "var(--border)",
              background: "var(--bg-panel)",
            }}
          >
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="tag text-[10px] font-mono font-bold"
                style={{
                  backgroundColor: `${categoryColor}18`,
                  color: categoryColor,
                  border: `1px solid ${categoryColor}30`,
                }}
              >
                {categoryIcon} {note.category}
              </span>
              <span className="tag tag-olive text-[10px] font-mono">
                {diffMeta.icon} {diffMeta.label}
              </span>
              {note.speakingSeconds && note.speakingSeconds > 0 ? (
                <span className="tag tag-gold text-[10px] font-mono flex items-center gap-1">
                  <Mic size={9} />
                  <span>{note.speakingSeconds}s</span>
                </span>
              ) : null}
            </div>

            <h3
              className="font-serif font-bold text-base line-clamp-2 mb-2"
              style={{ color: "var(--text)" }}
            >
              {note.topicText}
            </h3>

            <p
              className={`font-serif italic text-xs leading-relaxed mb-3 ${
                highlightExcerpt.trim()
                  ? "line-clamp-4 text-[var(--text)] font-medium p-2 rounded-lg bg-[var(--terra)]/8 border border-[var(--terra)]/20"
                  : "line-clamp-3 text-[var(--text-dim)]"
              }`}
            >
              &ldquo;{highlightExcerpt.trim() || note.notes}&rdquo;
            </p>

            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-mute)] pt-2.5 border-t" style={{ borderColor: "var(--border-dim)" }}>
              <span>Scholar {note.author}</span>
              <span>Fey Academic Archive</span>
            </div>
          </div>
        </div>

        {/* Generated Link Field */}
        <div className="mb-5">
          <label className="block text-[11px] font-mono text-[var(--text-dim)] mb-1.5 flex items-center justify-between">
            <span>Your Public Shareable URL:</span>
            {activeUrl && activeUrl !== fullShareUrl && (
              <span className="text-[10px] text-[var(--olive)] font-medium">✓ Shortened</span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={activeUrl || fullShareUrl}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-mono surface border outline-none truncate text-[var(--text-dim)] select-all"
              style={{ borderColor: "var(--border-dim)" }}
            />
            <button
              onClick={handleCopy}
              className="btn-terra px-4 py-2 text-xs font-mono rounded-lg flex items-center gap-1.5 whitespace-nowrap"
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

        {/* Social Share & External Preview Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t flex-wrap" style={{ borderColor: "var(--border-dim)" }}>
          <a
            href={activeUrl || fullShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--terra)] hover:underline"
          >
            <span>Open in New Tab</span>
            <ExternalLink size={12} />
          </a>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyCardImage}
              className="btn-ghost px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--border-dim)] hover:border-[var(--text)] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy an aesthetic 1200x630 social proof card image to your clipboard"
            >
              {copiedCard ? <Check size={12} className="text-[var(--olive)]" /> : <ImageIcon size={12} className="text-[var(--gold)]" />}
              <span>{copiedCard ? "Card Copied!" : "Copy Card Image"}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="btn-ghost px-3 py-1.5 text-xs font-mono rounded-lg border border-[rgba(37,211,102,0.4)] text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
            >
              WhatsApp
            </button>
            <button
              onClick={handleShareTwitter}
              className="btn-ghost px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--border-dim)] hover:border-[var(--text)] transition-colors"
            >
              Post to X
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="btn-ghost px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--border-dim)] hover:border-[var(--text)] transition-colors"
            >
              LinkedIn
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
