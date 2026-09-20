"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, UserPlus, UserCheck, Trophy, Sparkles, BookOpen } from "lucide-react";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useAppStore } from "@/store/useAppStore";
import { type CommunityUser } from "@/lib/mockCommunity";
import UserAvatar from "@/components/ui/UserAvatar";

interface UserProfileModalProps {
  user: CommunityUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  const currentProfile = useAppStore((s) => s.profile);
  const { following, followUser, unfollowUser } = useCommunityStore();
  const [hoverUnfollow, setHoverUnfollow] = useState(false);

  if (!isOpen || !user) return null;

  const isSelf = user.id === currentProfile.id || user.username === currentProfile.username;
  const isFollowed = following.some((u) => u.id === user.id);

  function handleToggleFollow() {
    if (!user) return;
    if (isFollowed) {
      unfollowUser(user.id);
    } else {
      followUser({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        level: user.level,
        xp: user.xp,
        followedAt: new Date().toISOString(),
      });
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 surface-modal backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-6 surface-raised border shadow-2xl relative"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
        >
          <X size={15} style={{ color: "var(--text-mute)" }} />
        </button>

        {/* Avatar & Basic Info */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="mb-3">
            <UserAvatar avatar={user.avatar} size="2xl" className="shadow-md" />
          </div>
          <h3 className="font-space font-bold text-lg" style={{ color: "var(--text)" }}>
            {user.username}
          </h3>
          <span
            className="text-[11px] font-semibold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full mt-1"
            style={{ background: "var(--bg-input)", color: "var(--olive-text)" }}
          >
            Level {user.level || 1} Scholar
          </span>
          <p className="text-xs mt-3 max-w-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
            "{user.bio || "Exploring ideas on Fey."}"
          </p>
        </div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-2 gap-2 p-3 rounded-xl border mb-5 surface"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="text-center border-r" style={{ borderColor: "var(--border-dim)" }}>
            <span className="text-[10px] uppercase font-semibold" style={{ color: "var(--text-mute)" }}>
              Experience
            </span>
            <div className="font-mono text-sm font-bold mt-0.5" style={{ color: "var(--gold)" }}>
              {user.xp || 0} XP
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-semibold" style={{ color: "var(--text-mute)" }}>
              Community
            </span>
            <div className="text-sm font-semibold mt-0.5" style={{ color: "var(--text)" }}>
              Active Thinker
            </div>
          </div>
        </div>

        {/* Action button */}
        {isSelf ? (
          <div
            className="w-full py-2.5 rounded-xl text-center text-xs font-semibold border"
            style={{ borderColor: "var(--border-dim)", color: "var(--text-mute)", background: "var(--bg-input)" }}
          >
            This is your profile
          </div>
        ) : (
          <button
            type="button"
            onClick={handleToggleFollow}
            onMouseEnter={() => setHoverUnfollow(true)}
            onMouseLeave={() => setHoverUnfollow(false)}
            className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            style={{
              background: isFollowed
                ? hoverUnfollow
                  ? "var(--terra)"
                  : "var(--bg-input)"
                : "var(--olive)",
              color: isFollowed
                ? hoverUnfollow
                  ? "#ffffff"
                  : "var(--text)"
                : "#ffffff",
              border: isFollowed ? "1px solid var(--border)" : "none",
            }}
          >
            {isFollowed ? (
              hoverUnfollow ? (
                <span>Unfollow</span>
              ) : (
                <>
                  <UserCheck size={14} className="text-[var(--olive)]" />
                  <span>Following</span>
                </>
              )
            ) : (
              <>
                <UserPlus size={14} />
                <span>Follow {user.username.split(" ")[0]}</span>
              </>
            )}
          </button>
        )}
      </motion.div>
    </div>
  );
}
