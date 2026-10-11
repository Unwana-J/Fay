// lib/vatar/sdk.ts
// Official Vatar Games SDK v1 TypeScript declarations and client hook

export interface VatarPlayer {
  id: string; // p_... live, t_... test
  name: string;
  avatar: string | null;
}

export interface VatarInitResult {
  player: VatarPlayer;
  session: string;
  mode: "live" | "test";
}

export interface VatarSessionResult {
  session: string;
  exp: number;
}

export interface VatarPurchaseResult {
  purchaseId: string;
  productId: string;
}

export interface VatarLeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export interface VatarLeaderboardResult {
  top: VatarLeaderboardEntry[];
  me: {
    rank: number | null;
    label: string;
    score: number;
  } | null;
}

export interface VatarMatchPlayer {
  id: string;
  name: string;
}

export interface VatarMatch {
  id: string;
  code: string;
  status: "open" | "playing" | "done" | "cancelled" | "void";
  stake: number;
  seats: number;
  players: VatarMatchPlayer[];
  me?: VatarMatchPlayer;
  winner?: string;
  result?: string;
  endsAt?: number;
  mode: "live" | "test";
}

export interface VatarSDK {
  init(): Promise<VatarInitResult>;
  session(): Promise<VatarSessionResult>;
  purchase(productId: string): Promise<VatarPurchaseResult>;
  purchases(): Promise<VatarPurchaseResult[]>;
  onPurchase(fn: (p: VatarPurchaseResult) => void): () => void;
  submitScore(score: number): Promise<{ best: number; accepted: boolean }>;
  leaderboard(): Promise<VatarLeaderboardResult>;
  onPause(fn: () => void): () => void;
  onResume(fn: () => void): () => void;
  match: {
    create(opts: { stake?: number; seats?: number }): Promise<VatarMatch>;
    join(code: string): Promise<VatarMatch>;
    quick(opts?: { stake?: number }): Promise<VatarMatch>;
    current(): Promise<VatarMatch | null>;
    leave(): Promise<VatarMatch | null>;
    onUpdate(fn: (m: VatarMatch) => void): () => void;
  };
}

declare global {
  interface Window {
    Vatar?: VatarSDK;
  }
}
