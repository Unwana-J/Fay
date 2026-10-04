"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  FeatureFlags,
  DEFAULT_FEATURE_FLAGS,
  FEATURE_DEFINITIONS,
  FeatureDefinition,
} from "@/lib/feature-flags";

interface FeatureStoreState {
  features: FeatureFlags;
  isLoading: boolean;
  lastFetchedAt: number | null;
  error: string | null;

  // Actions
  fetchFeatures: () => Promise<FeatureFlags>;
  setFeature: (key: keyof FeatureFlags, enabled: boolean) => Promise<boolean>;
  resetAllFeatures: () => Promise<boolean>;
  setLocalFeatures: (features: FeatureFlags) => void;
}

const BROADCAST_CHANNEL_NAME = "fey_feature_flags_sync";

export const useFeatureStore = create<FeatureStoreState>()(
  persist(
    (set, get) => ({
      features: { ...DEFAULT_FEATURE_FLAGS },
      isLoading: false,
      lastFetchedAt: null,
      error: null,

      fetchFeatures: async () => {
        try {
          set({ isLoading: true, error: null });
          const res = await fetch("/api/features", {
            cache: "no-store",
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.features) {
              set({
                features: data.features,
                lastFetchedAt: Date.now(),
                isLoading: false,
              });
              return data.features;
            }
          }
        } catch (err: any) {
          console.warn("Failed to fetch feature flags from server:", err);
          set({ error: err?.message || "Failed to fetch features", isLoading: false });
        }
        return get().features;
      },

      setFeature: async (key: keyof FeatureFlags, enabled: boolean) => {
        // Optimistic local update
        const current = get().features;
        const optimistic = { ...current, [key]: enabled };
        set({ features: optimistic });

        // Broadcast to other open browser tabs
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          try {
            const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
            channel.postMessage({ type: "SYNC_FEATURES", features: optimistic });
            channel.close();
          } catch (e) {
            // Ignore channel errors
          }
        }

        try {
          const res = await fetch("/api/admin/features", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, enabled }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.features) {
              set({ features: data.features, lastFetchedAt: Date.now() });
              return true;
            }
          }
          // Revert on failure
          set({ features: current });
          return false;
        } catch (err) {
          console.error("Failed to persist feature flag update:", err);
          set({ features: current });
          return false;
        }
      },

      resetAllFeatures: async () => {
        try {
          const res = await fetch("/api/admin/features", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reset" }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.features) {
              set({ features: data.features, lastFetchedAt: Date.now() });

              if (typeof window !== "undefined" && "BroadcastChannel" in window) {
                try {
                  const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
                  channel.postMessage({ type: "SYNC_FEATURES", features: data.features });
                  channel.close();
                } catch (e) {}
              }
              return true;
            }
          }
          return false;
        } catch (err) {
          console.error("Failed to reset features:", err);
          return false;
        }
      },

      setLocalFeatures: (features: FeatureFlags) => {
        set({ features, lastFetchedAt: Date.now() });
      },
    }),
    {
      name: "fey_feature_store_v1",
      partialize: (state) => ({
        features: state.features,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);

// Tab synchronization setup on client
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    channel.onmessage = (event) => {
      if (event.data?.type === "SYNC_FEATURES" && event.data.features) {
        useFeatureStore.getState().setLocalFeatures(event.data.features);
      }
    };
  } catch (e) {
    // Graceful fallback
  }
}
