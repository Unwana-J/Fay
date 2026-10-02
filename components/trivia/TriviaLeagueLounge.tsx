"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus,
  Users,
  Search,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CreateLeagueModal from "@/components/trivia/CreateLeagueModal";

interface StoredLeagueInfo {
  code: string;
  title: string;
  durationDays: number;
  lastVisited: number;
}

export default function TriviaLeagueLounge() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [recentLeagues, setRecentLeagues] = useState<StoredLeagueInfo[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fey_recent_leagues");
      if (saved) {
        setRecentLeagues(JSON.parse(saved));
      }
    } catch {}
  }, []);

  function handleJoinLeague(e: React.FormEvent) {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (!clean || clean.length < 4) {
      setJoinError("Please enter a valid league code.");
      return;
    }
    setJoinError("");
    router.push(`/games/trivia/league/${clean}`);
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div
        className="rounded-3xl p-6 sm:p-7 surface border relative overflow-hidden shadow-xs"
        style={{
          borderColor: "var(--border)",
          background: "linear-gradient(135deg, rgba(221, 161, 94, 0.08) 0%, rgba(92, 106, 54, 0.06) 100%)",
        }}
      >
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[var(--terra)]/15 border border-[var(--terra)]/30 flex items-center justify-center text-base">
              🏆
            </span>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--terra)] font-bold">
              Multi-Day Tournaments
            </div>
          </div>

          <h2 className="font-space text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text)" }}>
            Friendship Leagues
          </h2>

          <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-dim)] max-w-lg">
            Create or join a multi-day quiz tournament. All players get <strong>1 daily drop</strong> with speed velocity points and live cumulative standings.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="btn-terra px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Plus size={14} /> Start New League
            </button>
          </div>
        </div>
      </div>

      {/* Join with League Code */}
      <div className="rounded-2xl p-5 surface border space-y-3" style={{ borderColor: "var(--border-dim)" }}>
        <h3 className="font-space font-bold text-xs text-[var(--text)] flex items-center gap-1.5">
          <Search size={14} className="text-[var(--olive)]" /> Join with League Code
        </h3>
        <form onSubmit={handleJoinLeague} className="flex gap-2">
          <input
            type="text"
            maxLength={10}
            placeholder="e.g. 7K2M9P"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              if (joinError) setJoinError("");
            }}
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-mono uppercase font-bold focus:outline-none surface-input"
            style={{ borderColor: joinError ? "var(--terra)" : "var(--border)", color: "var(--text)" }}
          />
          <button
            type="submit"
            className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
          >
            <span>Enter</span>
            <ArrowRight size={13} />
          </button>
        </form>
        {joinError && <p className="text-xs text-[var(--terra)] font-medium">{joinError}</p>}
      </div>

      {/* Rules Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[var(--bg-input)] border text-left space-y-1" style={{ borderColor: "var(--border-dim)" }}>
          <div className="text-lg mb-1">⏳</div>
          <div className="font-space font-bold text-xs text-[var(--text)]">1 Attempt Daily</div>
          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
            Fresh questions drop at midnight. Once submitted, your daily score is locked.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-input)] border text-left space-y-1" style={{ borderColor: "var(--border-dim)" }}>
          <div className="text-lg mb-1">⚡</div>
          <div className="font-space font-bold text-xs text-[var(--text)]">Velocity Scoring</div>
          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
            Fast correct answers under 8s award speed multipliers to boost your ranking.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-input)] border text-left space-y-1" style={{ borderColor: "var(--border-dim)" }}>
          <div className="text-lg mb-1">🥇</div>
          <div className="font-space font-bold text-xs text-[var(--text)]">Final Podium</div>
          <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
            Top 3 scholars receive gold laurel proof cards shareable to WhatsApp at the end.
          </p>
        </div>
      </div>

      {/* Create League Modal */}
      <CreateLeagueModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
