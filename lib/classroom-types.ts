import { TOPIC_BANK, type Topic, type Difficulty } from "@/lib/topics";

export type AppreciationTag = "clear_analogy" | "sharp_breakdown" | "new_angle";

export const APPRECIATION_TAG_META: Record<
  AppreciationTag,
  { label: string; shortLabel: string }
> = {
  clear_analogy: { label: "Clear Analogy", shortLabel: "Clear Analogy" },
  sharp_breakdown: { label: "Sharp Breakdown", shortLabel: "Sharp Breakdown" },
  new_angle: { label: "New Angle", shortLabel: "New Angle" },
};

export const APPRECIATION_TAGS: AppreciationTag[] = [
  "clear_analogy",
  "sharp_breakdown",
  "new_angle",
];

export interface HeardReceipt {
  userId: string;
  username: string;
  avatar: string;
  heardAt: string; // ISO string
}

export interface MarginNote {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: string; // ISO string
}

export interface ClassroomSubmission {
  id: string;
  classroomCode: string;
  slotNumber: number; // 1-indexed (1..totalTopics)
  userId: string;
  username: string;
  avatar: string;
  topicId: string;
  topicText: string;
  category: string;
  durationSeconds: number;
  audioUrl?: string; // Public Storage URL or compact data URI
  notes?: string;
  heardBy: HeardReceipt[];
  appreciations: Partial<Record<AppreciationTag, string[]>>; // userIds per tag
  marginNotes: MarginNote[];
  submittedAt: string; // ISO string
}

export interface ClassroomSlot {
  slotNumber: number; // 1-indexed
  topicId: string;
  topicText: string;
  category: string;
  difficulty: Difficulty;
  tags?: string[];
  swappedBy?: {
    userId: string;
    username: string;
    swappedAt: string;
  };
}

export interface ClassroomMember {
  userId: string;
  username: string;
  avatar: string;
  isHost: boolean;
  joinedAt: string;
  favoriteCategories?: string[];
}

export type ClassroomTotalTopics = number;
export type ClassroomPresetCount = 1 | 3 | 5 | 7;

export interface Classroom {
  id?: string;
  code: string; // Clean 6-char uppercase code e.g. "CL7K2M"
  title: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  totalTopics: number;
  speakingDurationSec: number; // 60 | 90 | 120
  researchDurationMin: number; // 5 | 10 | 15
  categories: string[];
  difficulty: Difficulty;
  maxMembers: number; // Default 8 for small friend circles
  members: ClassroomMember[];
  slots: ClassroomSlot[];
  manualUnlockedUpToSlot: number; // Starts at 1
  status: "active" | "completed";
  closedAt?: string;
  createdAt: string;
}

export const SAFETY_VALVE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Normalize join codes so "fey-7k2m", "FEY7K2M", or "7k2m9p" resolve consistently.
 */
export function normalizeClassroomCode(raw: string): string {
  return String(raw || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

export function generateClassroomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `CL${suffix}`;
}

/**
 * Format code for display (e.g. "CL7K2M" -> "CL-7K2M").
 */
export function formatClassroomCodeDisplay(code: string): string {
  const clean = normalizeClassroomCode(code);
  if (clean.startsWith("CL") && clean.length === 6) {
    return `CL-${clean.slice(2)}`;
  }
  return clean;
}

/**
 * Deterministic PRNG for syllabus topic seeding.
 */
function seededRandom(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a balanced Classroom syllabus from selected categories & difficulty,
 * or from pre-supplied Topics (e.g. imported from user's 7-Day Study Schedule).
 */
export function buildClassroomSyllabus(opts: {
  seed: string;
  totalTopics: number;
  categories: string[];
  difficulty: Difficulty;
  presetTopics?: Topic[];
  customTopicPool?: Topic[];
  excludeTopicIds?: string[];
  startingSlotNumber?: number;
}): ClassroomSlot[] {
  const {
    seed,
    totalTopics,
    categories,
    difficulty,
    presetTopics = [],
    customTopicPool = [],
    excludeTopicIds = [],
    startingSlotNumber = 1,
  } = opts;

  const slots: ClassroomSlot[] = [];
  const usedIds = new Set<string>(excludeTopicIds);

  // 1. Fill from presetTopics first (e.g., Schedule Import or Hand-Picked)
  for (const t of presetTopics) {
    if (slots.length >= totalTopics) break;
    if (!t || !t.text?.trim() || usedIds.has(t.id)) continue;
    usedIds.add(t.id);
    slots.push({
      slotNumber: startingSlotNumber + slots.length,
      topicId: t.id,
      topicText: t.text.trim(),
      category: t.category || categories[0] || "Technology",
      difficulty: t.difficulty || difficulty,
      tags: t.tags || [],
    });
  }

  if (slots.length >= totalTopics) {
    return slots;
  }

  // 2. Deterministically fill remaining slots across chosen categories
  const rng = seededRandom(seed);
  const fullBank = [...TOPIC_BANK, ...customTopicPool];
  const validCats =
    categories.length > 0 ? categories : ["Technology", "Philosophy", "Economics"];

  // Match category + difficulty first, then relax difficulty if needed
  let candidates = fullBank.filter(
    (t) => validCats.includes(t.category) && t.difficulty === difficulty && !usedIds.has(t.id)
  );
  if (candidates.length < totalTopics - slots.length) {
    const broader = fullBank.filter(
      (t) => validCats.includes(t.category) && !usedIds.has(t.id)
    );
    candidates = broader.length >= totalTopics - slots.length ? broader : fullBank.filter((t) => !usedIds.has(t.id));
  }

  // Shuffle deterministically
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Round-robin by category so multi-interest circles feel genuinely blended
  let guard = 0;
  while (slots.length < totalTopics && shuffled.length > 0 && guard < 200) {
    guard++;
    const targetCat = validCats[slots.length % validCats.length];
    const catIdx = shuffled.findIndex((t) => t.category === targetCat && !usedIds.has(t.id));
    const pickIdx = catIdx >= 0 ? catIdx : shuffled.findIndex((t) => !usedIds.has(t.id));
    if (pickIdx < 0) break;
    const picked = shuffled[pickIdx];
    usedIds.add(picked.id);
    slots.push({
      slotNumber: startingSlotNumber + slots.length,
      topicId: picked.id,
      topicText: picked.text,
      category: picked.category,
      difficulty: picked.difficulty,
      tags: picked.tags || [],
    });
  }

  return slots;
}

/**
 * Consensus Unlock + 24-Hour Safety Valve:
 * - Slot 1 is always unlocked.
 * - Slot N+1 unlocks immediately once ALL joined members (when >= 2 members) submit Slot N.
 * - Safety Valve: Once >= 1 member submits Slot N and 24 hours pass since the first submission
 *   on Slot N, Slot N+1 unlocks automatically so one busy friend never freezes the circle.
 * - Also honors `classroom.manualUnlockedUpToSlot` (Host manual early unlock).
 */
export function computeEffectiveUnlockedSlot(
  classroom: Classroom,
  submissions: ClassroomSubmission[],
  nowMs: number = Date.now()
): number {
  const total = classroom.totalTopics || classroom.slots.length || 1;
  let unlocked = Math.max(1, Math.min(total, classroom.manualUnlockedUpToSlot || 1));

  const memberIds = (classroom.members || []).map((m) => m.userId);

  for (let slot = 1; slot < total; slot++) {
    if (slot > unlocked) break;

    const slotSubs = submissions.filter((s) => s.slotNumber === slot);
    if (slotSubs.length === 0) {
      continue;
    }

    // 1. Fast Path: Consensus unlock when circle has >= 2 members and everyone submitted
    const submittedUserIds = new Set(slotSubs.map((s) => s.userId));
    const allMembersSubmitted =
      memberIds.length >= 2 && memberIds.every((id) => submittedUserIds.has(id));

    // 2. 24-Hour Safety Valve from earliest submission on this slot
    const earliestMs = slotSubs.reduce((min, s) => {
      const ts = new Date(s.submittedAt).getTime();
      return Number.isFinite(ts) && ts < min ? ts : min;
    }, Infinity);
    const safetyValveElapsed =
      Number.isFinite(earliestMs) && nowMs - earliestMs >= SAFETY_VALVE_MS;

    if (allMembersSubmitted || safetyValveElapsed) {
      unlocked = Math.max(unlocked, slot + 1);
    }
  }

  return Math.min(total, unlocked);
}

/**
 * Returns remaining milliseconds until the 24h Safety Valve unlocks Slot N+1,
 * or null if no submission exists on Slot N yet or Slot N+1 is already unlocked.
 */
export function getSafetyValveRemainingMs(
  slotNumber: number,
  classroom: Classroom,
  submissions: ClassroomSubmission[],
  nowMs: number = Date.now()
): number | null {
  const unlocked = computeEffectiveUnlockedSlot(classroom, submissions, nowMs);
  if (unlocked > slotNumber || slotNumber >= classroom.totalTopics) return null;

  const slotSubs = submissions.filter((s) => s.slotNumber === slotNumber);
  if (slotSubs.length === 0) return null;

  const earliestMs = slotSubs.reduce((min, s) => {
    const ts = new Date(s.submittedAt).getTime();
    return Number.isFinite(ts) && ts < min ? ts : min;
  }, Infinity);

  if (!Number.isFinite(earliestMs)) return null;
  return Math.max(0, SAFETY_VALVE_MS - (nowMs - earliestMs));
}

/**
 * Speak-to-Unlock Guard:
 * A member can always play their own recording.
 * To hear peers' recordings on Slot N, the viewer must have submitted their own recording on Slot N.
 */
export function hasUserUnlockedSlotAudio(
  slotNumber: number,
  viewerUserId: string,
  viewerUsername: string | undefined,
  submissions: ClassroomSubmission[]
): boolean {
  if (!viewerUserId && !viewerUsername) return false;
  const normName = viewerUsername?.trim().toLowerCase();
  return submissions.some(
    (s) =>
      s.slotNumber === slotNumber &&
      (s.userId === viewerUserId ||
        (normName &&
          normName !== "scholar" &&
          s.username?.trim().toLowerCase() === normName))
  );
}

/**
 * Find the next actionable (unlocked & unsubmitted) slot for a user in a Classroom.
 */
export function getNextActionableSlotForUser(
  classroom: Classroom,
  submissions: ClassroomSubmission[],
  userId: string,
  username?: string,
  nowMs: number = Date.now()
): ClassroomSlot | null {
  const unlockedUpTo = computeEffectiveUnlockedSlot(classroom, submissions, nowMs);
  for (let n = 1; n <= unlockedUpTo; n++) {
    const done = hasUserUnlockedSlotAudio(n, userId, username, submissions);
    if (!done) {
      return classroom.slots.find((s) => s.slotNumber === n) || null;
    }
  }
  return null;
}

/**
 * Check if a slot can still be swapped by a member:
 * Must have zero submissions so nobody loses recorded work.
 */
export function canSwapClassroomSlot(
  slotNumber: number,
  submissions: ClassroomSubmission[]
): boolean {
  return !submissions.some((s) => s.slotNumber === slotNumber);
}
