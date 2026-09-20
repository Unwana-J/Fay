"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Globe, Lock, Clock, Mic, ChevronDown } from "lucide-react";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useAppStore } from "@/store/useAppStore";
import { TOPIC_BANK } from "@/lib/topics";

const DURATIONS = [10, 15, 20, 30];
const SPEAKING_DURATIONS = [60, 90, 120, 150, 180];

export default function CreateRoomModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { createRoom } = useCommunityStore();
  const profile = useAppStore((s) => s.profile);

  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [researchMin, setResearchMin] = useState(15);
  const [speakingSec, setSpeakingSec] = useState(120);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<(typeof TOPIC_BANK)[0] | null>(null);

  const filtered = TOPIC_BANK.filter((t) =>
    t.text.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 6);

  const handleCreate = () => {
    if (!selectedTopic) return;
    const id = createRoom(
      {
        topicId: selectedTopic.id,
        topicText: selectedTopic.text,
        category: selectedTopic.category,
        difficulty: selectedTopic.difficulty,
        visibility,
        researchDurationMin: researchMin,
        speakingDurationSec: speakingSec,
      },
      {
        id: profile.id,
        username: profile.username || "Learner",
        avatar: profile.avatar || "/avatars/avatar-scholar.svg",
        bio: profile.bio,
        xp: profile.xp,
        level: Math.floor(profile.xp / 500) + 1,
      }
    );
    onClose();
    router.push(`/community/room/${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="surface-raised rounded-2xl p-7 max-w-lg w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-space font-bold text-xl" style={{ color: "var(--text)" }}>
            Start a Research Room
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
          >
            <X size={16} style={{ color: "var(--text-mute)" }} />
          </button>
        </div>

        {/* Topic search */}
        <div className="mb-5">
          <label className="text-label block mb-2">Choose a Topic</label>
          {selectedTopic ? (
            <div
              className="rounded-xl p-3 flex items-center justify-between cursor-pointer"
              style={{ background: "var(--bg-input)", border: "1.5px solid var(--terra)" }}
              onClick={() => setSelectedTopic(null)}
            >
              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {selectedTopic.text}
              </span>
              <X size={14} style={{ color: "var(--text-mute)" }} />
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors"
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />
              {search && (
                <div
                  className="mt-2 rounded-xl overflow-hidden border"
                  style={{ borderColor: "var(--border-dim)" }}
                >
                  {filtered.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTopic(t); setSearch(""); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--bg-input)] transition-colors"
                      style={{ color: "var(--text)" }}
                    >
                      {t.text}
                      <span className="ml-2 text-[10px]" style={{ color: "var(--text-mute)" }}>
                        {t.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Visibility */}
        <div className="mb-5">
          <label className="text-label block mb-2">Visibility</label>
          <div className="grid grid-cols-2 gap-2">
            {(["public", "private"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all"
                style={{
                  background: visibility === v ? "var(--terra)" : "var(--bg-input)",
                  color: visibility === v ? "white" : "var(--text-dim)",
                  borderColor: visibility === v ? "var(--terra)" : "var(--border)",
                }}
              >
                {v === "public" ? <Globe size={14} /> : <Lock size={14} />}
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-[11px] mt-2" style={{ color: "var(--text-mute)" }}>
            {visibility === "public"
              ? "Recordings will appear in the Community Feed and count toward leaderboards."
              : "Only invited participants can see this room and its recordings."}
          </p>
        </div>

        {/* Durations */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-label block mb-2 flex items-center gap-1">
              <Clock size={11} /> Research Time
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setResearchMin(d)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono border transition-all"
                  style={{
                    background: researchMin === d ? "var(--terra)" : "var(--bg-input)",
                    color: researchMin === d ? "white" : "var(--text-dim)",
                    borderColor: researchMin === d ? "var(--terra)" : "var(--border)",
                  }}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-label block mb-2 flex items-center gap-1">
              <Mic size={11} /> Speaking Limit
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {SPEAKING_DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setSpeakingSec(d)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono border transition-all"
                  style={{
                    background: speakingSec === d ? "var(--terra)" : "var(--bg-input)",
                    color: speakingSec === d ? "white" : "var(--text-dim)",
                    borderColor: speakingSec === d ? "var(--terra)" : "var(--border)",
                  }}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={!selectedTopic}
          className="w-full btn-terra justify-center py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Create Room & Get Invite Link →
        </button>
      </motion.div>
    </motion.div>
  );
}
