export type CelestialAscensionKind = "sun" | "moon" | "star";

export interface CelestialAscensionPayload {
  id: string;
  kind: CelestialAscensionKind;
  orbitLabel: string;
  headline: string;
  activityTitle: string;
  badgeText: string;
  rewardText: string;
  category: string;
  timestamp: number;
}

export const CELESTIAL_ASCENSION_EVENT = "fey:celestial-ascension";

export function triggerCelestialAscension(
  payload: Omit<CelestialAscensionPayload, "id" | "timestamp">
) {
  if (typeof window === "undefined") return;
  const fullPayload: CelestialAscensionPayload = {
    ...payload,
    id: `cel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
  };

  window.dispatchEvent(
    new CustomEvent<CelestialAscensionPayload>(CELESTIAL_ASCENSION_EVENT, {
      detail: fullPayload,
    })
  );
}
