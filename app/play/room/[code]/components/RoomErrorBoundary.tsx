"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class RoomErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Articulate Room Runtime Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="surface rounded-3xl p-8 border border-[var(--border-dim)] text-center space-y-4 max-w-md mx-auto my-12 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-space font-extrabold text-lg text-[var(--text)]">
              Room Render Sync Hiccup
            </h3>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              We recovered from a temporary view glitch. Tap below to re-synchronize your room view.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                this.props.onReset?.();
                if (typeof window !== "undefined") {
                  window.location.reload();
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--olive)] text-white text-xs font-bold shadow-xs cursor-pointer hover:opacity-90 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-sync Room
            </button>
            <Link
              href="/play"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text)] text-xs font-bold hover:bg-[var(--bg)] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Parlor
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
