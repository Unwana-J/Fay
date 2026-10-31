"use client";

import { useEffect, useId, useRef } from "react";
import { Ban } from "lucide-react";
import type { AdminUserItem } from "@/lib/admin-data";

interface Props {
  user: AdminUserItem | null;
  reason: string;
  onReasonChange: (val: string) => void;
  onCancel: () => void;
  onConfirm: (userId: string, reason: string) => void;
}

export default function BanScholarDialog({
  user,
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (user) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [user]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onCancel();
    };
    dialog.addEventListener("close", handleClose);

    // Fallback for browsers without native closedby="any" support (e.g. Safari)
    let handleBackdropClick: ((event: MouseEvent) => void) | null = null;
    if (typeof HTMLDialogElement !== "undefined" && !("closedBy" in HTMLDialogElement.prototype)) {
      handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      };
      dialog.addEventListener("click", handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener("close", handleClose);
      if (handleBackdropClick) {
        dialog.removeEventListener("click", handleBackdropClick);
      }
    };
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: "any" } as Record<string, string>)}
      aria-labelledby={titleId}
      className="m-auto w-full max-w-md surface border rounded-2xl p-6 shadow-2xl space-y-4 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      style={{ borderColor: "var(--terra)", color: "var(--text)" }}
    >
      {user && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(122, 28, 46, 0.18)", color: "var(--terra)" }}
            >
              <Ban size={22} />
            </div>
            <div>
              <h3 id={titleId} className="font-serif text-lg font-bold" style={{ color: "var(--text)" }}>
                Ban Scholar: @{user.username}
              </h3>
              <p className="text-xs" style={{ color: "var(--text-mute)" }}>
                This user will be locked out of rooms, sprints, and leaderboards.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`${titleId}-reason`}
              className="text-[11px] font-mono uppercase font-bold"
              style={{ color: "var(--text-mute)" }}
            >
              Ban Reason (Shown to user)
            </label>
            <textarea
              id={`${titleId}-reason`}
              rows={3}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Specify violation, room code, or report..."
              className="w-full text-xs rounded-xl p-3 resize-none border focus:outline-none"
              style={{
                background: "var(--bg-input)",
                borderColor: "var(--border-dim)",
                color: "var(--text)",
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="px-4 py-2 rounded-xl text-xs font-mono hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
              style={{ color: "var(--text-mute)" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(user.id, reason)}
              className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-white hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
              style={{ background: "var(--terra)" }}
            >
              Confirm Ban
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
