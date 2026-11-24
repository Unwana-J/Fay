"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Lock,
  Unlock,
  Mic,
  Play,
  Check,
  Headphones,
  Plus,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_PEERS = [
  {
    name: "Tunde",
    avatar: "/avatars/avatar-orator.svg",
    duration: "1:24",
    timeAgo: "18m ago",
    stamps: ["Clear Analogy", "Sharp Breakdown"],
    note: {
      author: "Zainab",
      avatar: "/avatars/avatar-luminary.svg",
      text: "The port congestion analogy made supply-side inflation click immediately.",
    },
  },
  {
    name: "Zainab",
    avatar: "/avatars/avatar-luminary.svg",
    duration: "1:12",
    timeAgo: "42m ago",
    stamps: ["New Angle"],
    note: null,
  },
];

export default function InteractiveClassroomPreview({
  onStartClick,
}: {
  onStartClick?: () => void;
}) {
  const [hasRecorded, setHasRecorded] = useState(false);
  const [playingPeer, setPlayingPeer] = useState<string | null>(null);

  return (
    <div
      className="rounded-3xl border-[1.5px] p-5 sm:p-6 shadow-sm surface"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--olive)",
        borderTop: "5px solid var(--olive)",
      }}
    >
      {/* Circle Header */}
      <div
        className="flex items-center justify-between gap-2 pb-3.5 mb-4 border-b flex-wrap"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest font-bold text-[var(--olive)]">
            7-Topic Classroom · Code CL-7K2M
          </div>
          <h4 className="font-serif font-bold text-lg" style={{ color: "var(--text)" }}>
            Lagos Builders Study Circle
          </h4>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center -space-x-1.5">
            {[
              "/avatars/avatar-architect.svg",
              "/avatars/avatar-orator.svg",
              "/avatars/avatar-luminary.svg",
              "/avatars/avatar-scholar.svg",
            ].map((src, idx) => (
              <img
                key={src}
                src={src}
                alt=""
                width={26}
                height={26}
                loading="lazy"
                className="w-6.5 h-6.5 rounded-full border-2 border-[var(--bg-card)] object-cover"
                style={{ zIndex: 4 - idx }}
              />
            ))}
          </div>
          <span className="font-mono text-[11px]" style={{ color: "var(--text-mute)" }}>
            4/8 Friends
          </span>
        </div>
      </div>

      {/* Mini Syllabus Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3.5">
        {[
          { n: 1, state: "done" },
          { n: 2, state: "done" },
          { n: 3, state: "active" },
          { n: 4, state: "locked" },
        ].map((s) => (
          <span
            key={s.n}
            className={cn(
              "px-2.5 py-1 rounded-lg border font-mono text-[10px] font-semibold inline-flex items-center gap-1 whitespace-nowrap",
              s.state === "active"
                ? "bg-[var(--olive)] text-white border-[var(--olive)] font-bold"
                : s.state === "done"
                ? "bg-[var(--bg-base)] text-[var(--olive)] border-[var(--border)]"
                : "bg-[var(--bg-panel)] text-[var(--text-mute)] border-[var(--border-dim)]"
            )}
          >
            {s.state === "done" ? (
              <Check size={10} aria-hidden="true" />
            ) : s.state === "active" ? (
              <Unlock size={10} aria-hidden="true" />
            ) : (
              <Lock size={10} aria-hidden="true" />
            )}
            <span>Topic {s.n}</span>
          </span>
        ))}
        <span
          className="px-2.5 py-1 rounded-lg border border-dashed font-mono text-[10px] font-semibold inline-flex items-center gap-1 whitespace-nowrap"
          style={{ borderColor: "var(--border)", color: "var(--text-mute)" }}
        >
          <Plus size={10} aria-hidden="true" />
          <span>Add Topics</span>
        </span>
      </div>

      {/* Active Topic Prompt */}
      <div
        className="rounded-2xl p-4 border mb-4"
        style={{ background: "var(--bg-base)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--terra)]">
            Topic 3 of 7 · Economics · 90s Speaking Time
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px]" style={{ color: "var(--text-mute)" }}>
            <RefreshCw size={10} aria-hidden="true" />
            <span>Swappable before start</span>
          </span>
        </div>
        <p className="font-serif font-bold text-sm sm:text-base leading-snug mb-3" style={{ color: "var(--text)" }}>
          Why do countries with abundant natural resources often grow slower than resource-scarce nations?
        </p>

        {/* Interactive Speak-to-Unlock Simulator */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2.5 border-t" style={{ borderColor: "var(--border-dim)" }}>
          <span className="text-xs font-medium" style={{ color: "var(--text-dim)" }}>
            {hasRecorded
              ? "Your 90s take is in — friends' recordings unlocked!"
              : "2 friends already recorded. Try unlocking their takes:"}
          </span>
          <button
            type="button"
            onClick={() => {
              setHasRecorded((prev) => !prev);
              setPlayingPeer(null);
            }}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-mono font-bold inline-flex items-center gap-1.5 transition-transform active:scale-[0.98] cursor-pointer",
              hasRecorded
                ? "border border-[var(--olive)] text-[var(--olive)] bg-[var(--bg-card)]"
                : "btn-terra"
            )}
          >
            {hasRecorded ? (
              <>
                <Lock size={12} aria-hidden="true" />
                <span>Reset Demo Lock</span>
              </>
            ) : (
              <>
                <Mic size={13} aria-hidden="true" />
                <span>Simulate Recording Yours</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Peer Audio Cards (Locked vs Unlocked) */}
      <div className="space-y-2.5">
        <AnimatePresence mode="wait">
          {SAMPLE_PEERS.map((peer) => {
            const isPlaying = playingPeer === peer.name;
            return (
              <motion.div
                key={`${peer.name}-${hasRecorded ? "open" : "locked"}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="rounded-2xl border p-3.5"
                style={{
                  background: "var(--bg-base)",
                  borderColor: hasRecorded ? "var(--olive)" : "var(--border-dim)",
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={peer.avatar}
                      alt=""
                      width={28}
                      height={28}
                      loading="lazy"
                      className="w-7 h-7 rounded-full border object-cover"
                      style={{ borderColor: "var(--border)" }}
                    />
                    <div>
                      <span className="text-xs font-bold block leading-none" style={{ color: "var(--text)" }}>
                        {peer.name}
                      </span>
                      <span className="text-[10px] font-mono" style={{ color: "var(--text-mute)" }}>
                        {peer.timeAgo} · {peer.duration}
                      </span>
                    </div>
                  </div>

                  {hasRecorded && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
                      style={{
                        background: "var(--bg-card)",
                        borderColor: "var(--border-dim)",
                        color: "var(--olive)",
                      }}
                    >
                      <Headphones size={10} aria-hidden="true" />
                      <span>Heard by 3</span>
                    </span>
                  )}
                </div>

                {hasRecorded ? (
                  <>
                    <div
                      className="rounded-xl px-3 py-2 flex items-center gap-2.5 mb-2"
                      style={{ background: "var(--bg-input)" }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setPlayingPeer((cur) => (cur === peer.name ? null : peer.name))
                        }
                        aria-label={isPlaying ? `Pause ${peer.name}'s take` : `Play ${peer.name}'s take`}
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
                        style={{ background: "var(--terra)" }}
                      >
                        {isPlaying ? (
                          <span className="w-2 h-2 bg-white rounded-xs" />
                        ) : (
                          <Play size={10} color="white" aria-hidden="true" />
                        )}
                      </button>
                      <div className="flex-1 flex items-center gap-0.5 h-4" aria-hidden="true">
                        {Array.from({ length: 30 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="w-0.5 rounded-full transition-colors"
                            style={{
                              height: `${28 + ((idx * 17) % 68)}%`,
                              background: isPlaying ? "var(--olive)" : "rgba(68, 78, 44, 0.42)",
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono" style={{ color: "var(--text-dim)" }}>
                        {peer.duration}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {peer.stamps.map((st) => (
                        <span
                          key={st}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--olive)]/12 text-[var(--olive)]"
                        >
                          {st}
                        </span>
                      ))}
                    </div>

                    {peer.note && (
                      <div
                        className="mt-2 rounded-lg px-2.5 py-1.5 text-[11px] flex items-start gap-1.5"
                        style={{ background: "var(--bg-card)" }}
                      >
                        <span className="font-bold shrink-0" style={{ color: "var(--text)" }}>
                          {peer.note.author}:
                        </span>
                        <span style={{ color: "var(--text-dim)" }}>{peer.note.text}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    className="rounded-xl px-3 py-2.5 border flex items-center justify-between gap-2"
                    style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}
                  >
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--text-dim)" }}>
                      <Lock size={12} className="text-[var(--terra)] shrink-0" aria-hidden="true" />
                      <span>Locked until you record Topic 3</span>
                    </span>
                    <span className="font-mono text-[10px]" style={{ color: "var(--text-mute)" }}>
                      Speak-to-Unlock
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom Footer Link */}
      <div
        className="mt-4 pt-3 border-t flex items-center justify-between gap-2 text-xs"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <span className="font-mono text-[10px]" style={{ color: "var(--text-mute)" }}>
          2–8 Friends · Consensus Unlock + 24h Safety Timer
        </span>
        {onStartClick ? (
          <Link href="/classroom" className="font-bold text-[var(--olive)] hover:underline">
            Open Classroom →
          </Link>
        ) : (
          <Link href="/classroom" className="font-bold text-[var(--olive)] hover:underline">
            Open Classroom →
          </Link>
        )}
      </div>
    </div>
  );
}
