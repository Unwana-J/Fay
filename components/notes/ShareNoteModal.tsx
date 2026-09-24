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
} from "lucide-react";
import FeyLogo from "@/components/ui/FeyLogo";
import { encodeSharedNote, type SharedNotePayload } from "@/lib/share-note";
import { getShortenedUrl } from "@/lib/url-shortener";
import { CATEGORY_COLORS, CATEGORY_ICONS, DIFFICULTY_LABELS, type Difficulty } from "@/lib/topics";

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
  const [activeUrl, setActiveUrl] = useState<string>("");

  const fullShareUrl = useMemo(() => {
    if (!note) return "";
    const code = encodeSharedNote(note);
    if (!code) return "";
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://fey-eight-liard.vercel.app";
    return `${origin}/note/${code}`;
  }, [note]);

  // Attempt to shorten the URL when modal opens or note changes
  React.useEffect(() => {
    if (!fullShareUrl) {
      setActiveUrl("");
      return;
    }
    setActiveUrl(fullShareUrl);
    let mounted = true;
    getShortenedUrl(fullShareUrl).then((short) => {
      if (mounted && short) {
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

  function handleCopy() {
    const urlToCopy = activeUrl || fullShareUrl;
    if (!urlToCopy) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleShareTwitter() {
    if (!note) return;
    const urlToShare = activeUrl || fullShareUrl;
    const text = `Read my synthesis on "${note.topicText}" — articulated using the Feynman Technique on @FeyPlatform:\n\n`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(urlToShare)}`,
      "_blank"
    );
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

        {/* Live Card Preview in Fey Editorial Aesthetic */}
        <div className="mb-5">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-mute)] mb-2 flex items-center gap-1.5">
            <Sparkles size={11} className="text-[var(--gold)]" />
            <span>Public Preview</span>
          </div>

          <div
            className="rounded-xl p-5 border surface relative overflow-hidden"
            style={{
              borderColor: "var(--border)",
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
              className="font-serif italic text-xs line-clamp-3 leading-relaxed text-[var(--text-dim)] mb-3"
            >
              &ldquo;{note.notes}&rdquo;
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

          <div className="flex items-center gap-2">
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
