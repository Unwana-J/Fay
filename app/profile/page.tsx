"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pencil, Check, Star, Flame, Zap, BookOpen, Mic, Trophy } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { ACHIEVEMENTS, getLevelForXP, getNextLevel, getLevelProgress } from "@/lib/achievements";
import { CATEGORY_ICONS, CATEGORIES } from "@/lib/topics";
import { cn } from "@/lib/utils";

const AVATAR_OPTIONS = ["🧠", "🎙️", "📚", "🔬", "💡", "🌌", "⚡", "🏆", "🎯", "🚀"];

/* ─── Framer Motion Stagger Variants ──────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18
    }
  }
};

export default function ProfilePage() {
  const { profile, streak, sessions, settings, updateProfile, updateSettings } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [draftUsername, setDraftUsername] = useState(profile.username);
  const [draftBio, setDraftBio] = useState(profile.bio);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const level = getLevelForXP(profile.xp);
  const nextLevel = getNextLevel(profile.xp);
  const progress = getLevelProgress(profile.xp);
  const totalResearchMin = sessions.reduce((a, s) => a + s.researchMinutes, 0);
  const totalSpeakSec = sessions.reduce((a, s) => a + s.speakingSeconds, 0);
  const uniqueCats = [...new Set(sessions.map((s) => s.category))];
  const avgConf = sessions.length
    ? (sessions.reduce((a, s) => a + s.ratings.confidence, 0) / sessions.length).toFixed(1)
    : "—";

  function saveProfile() {
    updateProfile({ username: draftUsername.trim() || "Learner", bio: draftBio.trim() });
    setEditing(false);
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen p-8 max-w-5xl"
    >
      <motion.div variants={cardVariants} className="mb-10">
        <h1 className="font-space text-3xl font-bold mb-1 text-display" style={{ color: "var(--text)" }}>Profile</h1>
        <p style={{ color: "var(--text-dim)" }}>Your learning identity and achievements.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Profile Card */}
          <motion.div variants={cardVariants} className="rounded-2xl p-6 surface">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 mb-5">
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="relative w-20 h-20 rounded-xl flex items-center justify-center text-4xl hover:scale-105 transition-transform border"
                style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}
              >
                {profile.avatar || "🧠"}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border" style={{ backgroundColor: "var(--olive)", borderColor: "var(--bg-base)" }}>
                  <Pencil size={8} className="text-white" />
                </div>
              </button>

              {showAvatarPicker && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="grid grid-cols-5 gap-1.5 p-3 rounded-xl border bg-[var(--bg-card)]" style={{ borderColor: "var(--border)" }}>
                  {AVATAR_OPTIONS.map((a) => (
                    <button key={a} onClick={() => { updateProfile({ avatar: a }); setShowAvatarPicker(false); }}
                      className="w-8 h-8 rounded-lg hover:bg-[var(--bg-input)] flex items-center justify-center text-lg transition-colors">
                      {a}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Name & bio */}
            {editing ? (
              <div className="space-y-2.5">
                <input
                  value={draftUsername}
                  onChange={(e) => setDraftUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none surface-input"
                  style={{ color: "var(--text)" }}
                  placeholder="Username"
                />
                <textarea
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-xs resize-none focus:outline-none surface-input"
                  style={{ color: "var(--text-dim)" }}
                  placeholder="Short bio…"
                />
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="flex-1 btn-ghost py-2">Cancel</button>
                  <button onClick={saveProfile} className="flex-1 btn-terra py-2 text-xs">
                    <Check size={11} className="mr-1" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="font-bold text-lg" style={{ color: "var(--text)" }}>{profile.username}</span>
                  <button onClick={() => setEditing(true)} className="text-[var(--text-mute)] hover:text-[var(--text)] transition-colors">
                    <Pencil size={11} />
                  </button>
                </div>
                <p style={{ color: "var(--text-dim)" }} className="text-xs leading-relaxed">{profile.bio || "No bio set yet."}</p>
              </div>
            )}

            {/* Level */}
            <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border-dim)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Zap size={11} style={{ color: "var(--gold)" }} />
                  <span style={{ color: "var(--text)" }}>Level {level.level}</span>
                </div>
                <span className="text-xs font-mono font-semibold" style={{ color: "var(--gold)" }}>{level.title}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--olive-dim)" }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
                  className="h-full rounded-full"
                  style={{ background: "var(--gold)" }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1.5" style={{ color: "var(--text-mute)" }}>
                <span className="font-mono">{profile.xp} XP</span>
                {nextLevel && <span className="font-mono">→ {nextLevel.minXP} XP</span>}
              </div>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div variants={cardVariants} className="rounded-2xl p-5 grid grid-cols-2 gap-3 surface">
            {[
              { icon: <Flame size={13} style={{ color: "var(--terra)" }} />, value: streak.current, label: "streak" },
              { icon: <Trophy size={13} style={{ color: "var(--gold)" }} />, value: sessions.length, label: "sessions" },
              { icon: <BookOpen size={13} style={{ color: "var(--olive)" }} />, value: `${Math.round(totalResearchMin / 60)}h`, label: "research" },
              { icon: <Star size={13} style={{ color: "var(--gold)" }} />, value: avgConf, label: "avg score" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "var(--bg-input)" }}>
                <div className="flex items-center justify-center mb-1">{s.icon}</div>
                <div className="font-mono font-semibold text-lg" style={{ color: "var(--text)" }}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "var(--text-mute)" }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Favorite categories */}
          <motion.div variants={cardVariants} className="rounded-2xl p-5 surface">
            <div className="text-label mb-3">Favorite categories</div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const isFav = settings.favoriteCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      const favs = settings.favoriteCategories;
                      updateSettings({ favoriteCategories: isFav ? favs.filter((c) => c !== cat) : [...favs, cat] });
                    }}
                    className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] uppercase font-semibold transition-all border",
                      isFav
                        ? "border-[var(--olive)] bg-[var(--bg-input)] text-[var(--olive-text)]"
                        : "border-transparent text-[var(--text-mute)] hover:text-[var(--text-dim)]"
                    )}
                  >
                    {CATEGORY_ICONS[cat]}
                    <span>{cat.split(" ")[0]}</span>
                    {isFav && <Star size={8} className="fill-[#A67C1E] text-[#A67C1E]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Achievements */}
          <motion.div variants={cardVariants} className="rounded-2xl p-5 surface">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading" style={{ fontSize: "0.95rem" }}>Achievements</h3>
              <span className="text-label">{profile.unlockedAchievements.length}/{ACHIEVEMENTS.length} unlocked</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = profile.unlockedAchievements.includes(ach.id);
                return (
                  <motion.div
                    key={ach.id}
                    className="rounded-xl p-3 border transition-all"
                    style={{
                      backgroundColor: unlocked ? "rgba(92, 106, 54, 0.05)" : "var(--bg-input)",
                      borderColor: unlocked ? "rgba(92, 106, 54, 0.15)" : "transparent",
                      opacity: unlocked ? 1 : 0.35,
                      filter: unlocked ? "none" : "grayscale(1)"
                    }}
                  >
                    <div className="text-2xl mb-2">{ach.icon}</div>
                    <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--text)" }}>{ach.title}</div>
                    <div className="text-[10px] leading-tight" style={{ color: "var(--text-dim)" }}>{ach.description}</div>
                    {unlocked && (
                      <div className="mt-2 text-[10px] font-mono font-semibold" style={{ color: "var(--gold)" }}>+{ach.xpReward} XP</div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Category mastery */}
          {uniqueCats.length > 0 && (
            <motion.div variants={cardVariants} className="rounded-2xl p-5 surface">
              <h3 className="text-heading mb-4" style={{ fontSize: "0.95rem" }}>Category Mastery</h3>
              <div className="space-y-3">
                {uniqueCats.map((cat) => {
                  const count = sessions.filter((s) => s.category === cat).length;
                  const max = Math.max(...uniqueCats.map((c) => sessions.filter((s) => s.category === c).length));
                  const width = Math.round((count / max) * 100);
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
                          <span>{CATEGORY_ICONS[cat]}</span>
                          <span>{cat}</span>
                        </div>
                        <span className="font-mono text-xs font-semibold" style={{ color: "var(--text-mute)" }}>{count} sessions</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-[var(--bg-input)]">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${width}%` }}
                          transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
                          className="h-full rounded-full"
                          style={{ background: "var(--olive-br)" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
