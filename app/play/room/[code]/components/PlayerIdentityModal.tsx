"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, User, ArrowRight, X, Check, Flame } from "lucide-react";
import Image from "next/image";
import { useAppStore } from "@/store/useAppStore";

interface PlayerIdentityModalProps {
  isOpen: boolean;
  mode: "join" | "edit";
  roomCode: string;
  hostName?: string;
  currentName?: string;
  currentAvatar?: string;
  preferredTeam?: "A" | "B" | null;
  takenNames?: string[];
  onSave: (name: string, avatar: string, preferredTeam?: "A" | "B") => void;
  onClose?: () => void;
}

const AVATAR_OPTIONS = [
  { id: "/avatars/avatar-scholar.svg", label: "Scholar" },
  { id: "/avatars/avatar-orator.svg", label: "Orator" },
  { id: "/avatars/avatar-philosopher.svg", label: "Philosopher" },
  { id: "/avatars/avatar-alchemist.svg", label: "Alchemist" },
  { id: "/avatars/avatar-architect.svg", label: "Architect" },
  { id: "/avatars/avatar-strategist.svg", label: "Strategist" },
  { id: "/avatars/avatar-luminary.svg", label: "Luminary" },
  { id: "/avatars/avatar-pioneer.svg", label: "Pioneer" },
];

export default function PlayerIdentityModal({
  isOpen,
  mode,
  roomCode,
  hostName,
  currentName = "",
  currentAvatar = "/avatars/avatar-scholar.svg",
  preferredTeam = null,
  takenNames = [],
  onSave,
  onClose,
}: PlayerIdentityModalProps) {
  const { profile, openClaimAccountPrompt } = useAppStore();

  const [name, setName] = useState(
    currentName && currentName !== "Scholar" && currentName !== "Learner"
      ? currentName
      : profile?.username || ""
  );
  const [selectedAvatar, setSelectedAvatar] = useState(
    currentAvatar || profile?.avatar || "/avatars/avatar-scholar.svg"
  );
  const [teamChoice, setTeamChoice] = useState<"A" | "B" | "auto">(
    preferredTeam || "auto"
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a name so teammates recognize you.");
      return;
    }
    if (trimmed.length > 25) {
      setError("Name must be 25 characters or fewer.");
      return;
    }

    const lower = trimmed.toLowerCase();
    const isOwnCurrent = currentName && currentName.trim().toLowerCase() === lower;
    if (!isOwnCurrent && takenNames.some((t) => t && t.trim().toLowerCase() === lower)) {
      setError(`"${trimmed}" is already taken in this room. Please choose a unique name.`);
      return;
    }

    setError(null);
    onSave(
      trimmed,
      selectedAvatar,
      teamChoice === "auto" ? undefined : teamChoice
    );
  };

  const hasPreviousName = Boolean(name && name !== "Scholar" && name !== "Learner");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md surface rounded-3xl p-6 border border-[var(--border-dim)] shadow-2xl relative space-y-5"
        >
          {/* Close button only in edit mode */}
          {mode === "edit" && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--bg-input)] hover:bg-[var(--border-dim)] flex items-center justify-center text-[var(--text-dim)] hover:text-[var(--text)] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Header */}
          <div className="space-y-1.5 text-center">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-[var(--olive)] inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {mode === "join"
                ? hasPreviousName
                  ? `Welcome Back • Room ${roomCode}`
                  : `Join Match • ${roomCode}`
                : "Update Identity"}
            </span>
            <h2 className="font-space font-extrabold text-2xl text-[var(--text)]">
              {mode === "join"
                ? hasPreviousName
                  ? `Play as @${name || "Scholar"}?`
                  : "What's Your Name?"
                : "Edit Player Name"}
            </h2>
            <p className="text-xs text-[var(--text-dim)] max-w-xs mx-auto">
              {mode === "join"
                ? hasPreviousName
                  ? hostName
                    ? `${hostName} invited you to play. Confirm your player name and team below to join!`
                    : "Confirm your player name and team below to enter this match."
                  : hostName
                    ? `${hostName} invited you to play Articulate. Enter your name so players know who you are.`
                    : "Enter your name so teammates and opponents know who is speaking and guessing."
                : "Change how your name and avatar appear to other players in this match."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-mute)] block">
                Your Name / Nickname
              </label>
              <div className="relative">
                <input
                  type="text"
                  autoFocus={!hasPreviousName}
                  placeholder="e.g. Tolu, Kemi, Femi, Chidi"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  maxLength={25}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-dim)] text-sm font-semibold text-[var(--text)] placeholder:text-[var(--text-mute)]/60 focus:outline-none focus:border-[var(--olive)] focus:ring-1 focus:ring-[var(--olive)] transition"
                />
                <User className="w-4 h-4 text-[var(--text-mute)] absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
              {hasPreviousName && mode === "join" && (
                <p className="text-[11px] text-[var(--olive)] font-medium flex items-center gap-1 pt-0.5">
                  <Check className="w-3 h-3" /> Found your saved player handle. Confirm or edit for this match.
                </p>
              )}
              {error && (
                <p className="text-xs text-red-500 font-medium pt-0.5">{error}</p>
              )}
            </div>

            {/* Avatar Selector */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-mute)] block">
                Choose Avatar
              </label>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {AVATAR_OPTIONS.map((av) => {
                  const isSelected = selectedAvatar === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition cursor-pointer relative ${
                        isSelected
                          ? "bg-[var(--olive)]/15 border-[var(--olive)] shadow-xs"
                          : "bg-[var(--bg-input)]/50 border-[var(--border-dim)]/70 hover:border-[var(--border-dim)]"
                      }`}
                    >
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[var(--bg)] border border-[var(--border-dim)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={av.id}
                          alt={av.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[9px] font-medium text-[var(--text-dim)] truncate max-w-full">
                        {av.label}
                      </span>
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[var(--olive)] text-white flex items-center justify-center text-[8px] font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Team choice (Only in join mode) */}
            {mode === "join" && (
              <div className="space-y-1.5 text-left pt-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-mute)] block">
                  Team Placement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTeamChoice("auto")}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      teamChoice === "auto"
                        ? "bg-[var(--olive)]/15 border-[var(--olive)] text-[var(--text)]"
                        : "bg-[var(--bg-input)]/50 border-[var(--border-dim)] text-[var(--text-dim)]"
                    }`}
                  >
                    Auto-Balance
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeamChoice("A")}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      teamChoice === "A"
                        ? "bg-red-500/15 border-red-500 text-red-600 dark:text-red-400"
                        : "bg-[var(--bg-input)]/50 border-[var(--border-dim)] text-[var(--text-dim)]"
                    }`}
                  >
                    Team Alpha
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeamChoice("B")}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      teamChoice === "B"
                        ? "bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400"
                        : "bg-[var(--bg-input)]/50 border-[var(--border-dim)] text-[var(--text-dim)]"
                    }`}
                  >
                    Team Omega
                  </button>
                </div>
              </div>
            )}

            {/* Submit CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[var(--terra)] hover:bg-[var(--terra)]/90 text-white font-space font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>
                {mode === "join"
                  ? hasPreviousName
                    ? `Enter Room as ${name || "Scholar"}`
                    : "Enter Room & Play"
                  : "Save Changes"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {mode === "join" && !profile?.hasClaimedAccount && (
              <div className="space-y-1.5 pt-1 text-center">
                <p className="text-[11px] text-[var(--text-mute)] flex items-center justify-center gap-1.5 flex-wrap">
                  <span>Want today&apos;s match to count?</span>
                  <button
                    type="button"
                    onClick={() => openClaimAccountPrompt()}
                    className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Flame className="w-3 h-3 text-amber-500 animate-pulse" /> Track Streak
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => openClaimAccountPrompt()}
                    className="font-bold underline text-[var(--text)] hover:text-[var(--terra)] cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
