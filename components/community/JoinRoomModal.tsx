"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, ArrowRight, KeyRound, AlertCircle } from "lucide-react";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useAppStore } from "@/store/useAppStore";
import { decodeRoomPayload } from "@/lib/mockCommunity";

export default function JoinRoomModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { rooms, importRoom } = useCommunityStore();
  const [codeOrUrl, setCodeOrUrl] = useState("");
  const [error, setError] = useState("");

  function handleJoin() {
    const input = codeOrUrl.trim();
    if (!input) {
      setError("Please enter a room code or invite link.");
      return;
    }

    // Check if it's a full URL
    if (input.includes("/community/room/")) {
      try {
        const url = new URL(input);
        const pathParts = url.pathname.split("/community/room/");
        const roomId = pathParts[1];
        const rParam = url.searchParams.get("r");
        if (rParam) {
          const decoded = decodeRoomPayload(rParam);
          if (decoded && decoded.id) {
            importRoom(decoded as any);
          }
        }
        onClose();
        router.push(url.pathname + url.search);
        return;
      } catch (err) {
        // Continue to check as raw code/id
      }
    }

    // Normalize room code (e.g. "FEY-A1B2" or "A1B2")
    let target = input;
    if (!target.toUpperCase().startsWith("FEY-") && target.length <= 6 && !target.startsWith("room-")) {
      target = `FEY-${target.toUpperCase()}`;
    } else {
      target = target.toUpperCase();
    }

    // Check if room exists in local store
    const found = rooms.find(
      (r) => r.inviteCode.toUpperCase() === target || r.id === input
    );

    if (found) {
      onClose();
      router.push(`/community/room/${found.id}`);
      return;
    }

    // Otherwise navigate to roomId route and let room page look for payload or invite
    onClose();
    router.push(`/community/room/${target}`);
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
        className="w-full max-w-md rounded-2xl p-6 surface-raised border shadow-2xl relative"
        style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{ background: "var(--bg-input)", borderColor: "var(--border-dim)" }}
            >
              <KeyRound size={16} className="text-[var(--olive)]" />
            </div>
            <div>
              <h3 className="font-space font-bold text-lg leading-tight" style={{ color: "var(--text)" }}>
                Join Research Room
              </h3>
              <p className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                Enter the room invite code or paste a shared link.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
          >
            <X size={15} style={{ color: "var(--text-mute)" }} />
          </button>
        </div>

        <div className="space-y-4 my-5">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: "var(--text)" }}>
              Room Code or Invite Link
            </label>
            <input
              type="text"
              placeholder="e.g. FEY-A1B2 or paste link"
              value={codeOrUrl}
              onChange={(e) => {
                setCodeOrUrl(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoin();
              }}
              className="w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none transition-all surface-input font-mono"
              style={{
                borderColor: error ? "var(--terra)" : "var(--border)",
                color: "var(--text)",
              }}
              autoFocus
            />
            {error && (
              <p className="text-xs text-[var(--terra)] mt-1.5 flex items-center gap-1">
                <AlertCircle size={12} /> {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border text-xs font-medium"
            style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleJoin}
            className="btn-primary px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            Join Room <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
