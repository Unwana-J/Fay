"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, KeyRound } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useClassroomStore } from "@/store/useClassroomStore";
import { normalizeClassroomCode } from "@/lib/classroom-types";

interface JoinClassroomModalProps {
  open: boolean;
  onClose: () => void;
}

export default function JoinClassroomModal({ open, onClose }: JoinClassroomModalProps) {
  const router = useRouter();
  const { profile, settings } = useAppStore();
  const { joinClassroom } = useClassroomStore();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const clean = normalizeClassroomCode(code);
    if (!clean || clean.length < 4) {
      setError("Enter a valid Classroom invite code (e.g. CL-7K2M).");
      return;
    }

    setError(null);
    setLoading(true);
    const res = await joinClassroom(clean, {
      userId: profile.id || "local-scholar",
      username: profile.username || "Scholar",
      avatar: profile.avatar || "/avatars/avatar-scholar.svg",
      favoriteCategories:
        settings.favoriteCategories?.length > 0
          ? settings.favoriteCategories
          : settings.enabledCategories || [],
    });
    setLoading(false);

    if (res.error || !res.classroom) {
      setError(res.error || "Classroom not found. Double-check the code with your friend.");
      return;
    }

    setCode("");
    onClose();
    router.push(`/classroom/${res.classroom.code}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border-[1.5px] p-6 shadow-xl"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--olive)] mb-1 flex items-center gap-1.5">
                  <KeyRound size={12} />
                  <span>Invite Code</span>
                </div>
                <h2 className="font-serif font-bold text-xl" style={{ color: "var(--text)" }}>
                  Join a Friend&apos;s Classroom
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                  Enter the Classroom code shared by your friend.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg border border-[var(--border-dim)] hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={15} style={{ color: "var(--text-dim)" }} />
              </button>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CL-7K2M"
                maxLength={10}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border text-center font-mono text-lg font-bold tracking-widest uppercase focus:outline-none focus:border-[var(--olive)]"
                style={{
                  background: "var(--bg-input)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              />

              {error && (
                <div
                  className="rounded-xl px-3.5 py-2.5 text-xs font-medium border"
                  style={{
                    background: "var(--red-bg)",
                    borderColor: "var(--red)",
                    color: "var(--red)",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border text-xs font-semibold hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-terra px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-transform active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Joining..." : "Enter Classroom"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
