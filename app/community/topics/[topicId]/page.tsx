"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Star, ThumbsUp, Trophy } from "lucide-react";
import { MOCK_SUBMISSIONS, LEADERBOARD_TOPICS, SELF_USER } from "@/lib/mockCommunity";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useState } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  "Artificial Intelligence": "#7A1C2E",
  "Finance": "#A67C1E",
  "Philosophy": "#4A5568",
  "Technology": "#2D5A27",
  "Psychology": "#553C7B",
  "Business": "#7A4420",
  "Science": "#1A5276",
  "History": "#6B4226",
  "Culture": "#7A5C3A",
  "Wildcard": "#6B4C7A",
};

const PODIUM_MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_HEIGHTS = ["h-32", "h-24", "h-20"];
const PODIUM_LABELS = ["1st", "2nd", "3rd"];

export default function TopicLeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  const { voteOnSubmission } = useCommunityStore();
  const [hoverStar, setHoverStar] = useState<Record<string, number>>({});

  const topic = LEADERBOARD_TOPICS.find((t) => t.topicId === topicId);
  const all = MOCK_SUBMISSIONS.filter((s) => s.topicId === topicId)
    .sort((a, b) => b.leaderboardScore - a.leaderboardScore);

  const catColor = topic ? CATEGORY_COLORS[topic.category] || "var(--terra)" : "var(--terra)";

  if (!topic) return (
    <div className="flex items-center justify-center h-screen text-sm" style={{ color: "var(--text-mute)" }}>
      Topic not found. <button onClick={() => router.back()} className="ml-2 underline">Go back</button>
    </div>
  );

  const top3 = all.slice(0, 3);
  const rest = all.slice(3);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button
        onClick={() => router.push("/community")}
        className="flex items-center gap-1.5 text-sm mb-6 hover:opacity-70 transition-opacity"
        style={{ color: "var(--text-mute)" }}
      >
        <ArrowLeft size={14} /> Community
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={16} style={{ color: catColor }} />
          <span
            className="tag text-[10px]"
            style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}30` }}
          >
            {topic.category}
          </span>
        </div>
        <h1 className="font-space font-bold text-xl leading-snug mb-1" style={{ color: "var(--text)" }}>
          {topic.topicText}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-mute)" }}>
          {topic.totalSubmissions} recordings · Updated live
        </p>
      </motion.div>

      {/* ── Podium ── */}
      {top3.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="surface rounded-2xl p-6 mb-6"
        >
          <div className="text-label text-center mb-6">Top Performers</div>
          <div className="flex items-end justify-center gap-4">
            {/* Render 2nd, 1st, 3rd for podium effect */}
            {[top3[1], top3[0], top3[2]].map((sub, podiumIdx) => {
              if (!sub) return <div key={podiumIdx} className="w-24" />;
              const rank = podiumIdx === 0 ? 1 : podiumIdx === 1 ? 0 : 2; // real rank index
              const heights = ["h-24", "h-32", "h-20"];
              const orders = [1, 0, 2];
              const realRank = orders[podiumIdx];

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + podiumIdx * 0.08 }}
                  className="flex flex-col items-center gap-2 w-24"
                >
                  <div className="text-2xl">{sub.user.avatar}</div>
                  <div className="text-xs font-bold text-center" style={{ color: "var(--text)" }}>
                    {sub.user.username.split(" ")[0]}
                  </div>
                  <div className="text-[10px] font-mono" style={{ color: "var(--text-mute)" }}>
                    ★ {sub.votes.avgStars.toFixed(1)} · ↑{sub.votes.upvotes}
                  </div>
                  <div
                    className={`w-full rounded-t-lg flex items-end justify-center pb-2 ${heights[podiumIdx]}`}
                    style={{
                      background: realRank === 0
                        ? `linear-gradient(to top, ${catColor}, ${catColor}88)`
                        : `${catColor}30`,
                    }}
                  >
                    <span className="text-xl">{PODIUM_MEDALS[realRank]}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Full Ranked List ── */}
      <div className="space-y-3">
        <div className="text-label mb-1">All Submissions</div>
        {all.map((sub, i) => {
          const hover = hoverStar[sub.id] || 0;
          const isSelf = sub.user.id === SELF_USER.id;
          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="surface rounded-xl p-4 flex items-center gap-4"
              style={isSelf ? { border: "1.5px solid var(--terra)" } : {}}
            >
              {/* Rank */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                style={{
                  background: i < 3 ? `${catColor}20` : "var(--bg-input)",
                  color: i < 3 ? catColor : "var(--text-mute)",
                }}
              >
                {i < 3 ? PODIUM_MEDALS[i] : `#${i + 1}`}
              </div>

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 border"
                style={{ background: "var(--bg-input)", borderColor: "var(--border)" }}
              >
                {sub.user.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                    {sub.user.username}
                  </span>
                  {isSelf && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--terra)", color: "white" }}>
                      You
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-mute)" }}>
                  <span>★ {sub.votes.avgStars.toFixed(1)}</span>
                  <span>↑ {sub.votes.upvotes}</span>
                  <span>{Math.floor(sub.durationSec / 60)}:{String(sub.durationSec % 60).padStart(2, "0")}</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right shrink-0">
                <div className="font-mono font-bold text-base" style={{ color: i === 0 ? catColor : "var(--text)" }}>
                  {sub.leaderboardScore}
                </div>
                <div className="text-[9px]" style={{ color: "var(--text-mute)" }}>pts</div>
              </div>

              {/* Vote stars */}
              <div className="flex gap-0.5 shrink-0">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    disabled={!!sub.userVoted}
                    onMouseEnter={() => !sub.userVoted && setHoverStar((h) => ({ ...h, [sub.id]: n }))}
                    onMouseLeave={() => setHoverStar((h) => ({ ...h, [sub.id]: 0 }))}
                    onClick={() => voteOnSubmission(sub.id, n as 1 | 2 | 3)}
                    className="disabled:cursor-default transition-transform hover:scale-110"
                  >
                    <Star
                      size={13}
                      fill={n <= (sub.userVoted || hover) ? catColor : "none"}
                      stroke={catColor}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
