import type { TriviaQuestion } from "@/lib/trivia-questions";

/**
 * Answer-key overrides produced by accepted answer contests.
 * Maps questionId -> list of additional option indices that must be credited as correct.
 *
 * Shared by server (league hydration) and client (live play + leaderboard), so every
 * score that stored the player's `selected` index is re-graded retroactively.
 */
export type AnswerOverrideMap = Record<string, number[]>;

let overrides: AnswerOverrideMap = {};
const listeners = new Set<() => void>();

export function setAnswerOverrides(next: AnswerOverrideMap | null | undefined) {
  const clean: AnswerOverrideMap = {};
  for (const [qId, list] of Object.entries(next || {})) {
    if (!Array.isArray(list)) continue;
    const valid = Array.from(new Set(list.filter((n) => Number.isInteger(n) && n >= 0)));
    if (valid.length > 0) clean[qId] = valid;
  }
  overrides = clean;
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {}
  });
}

export function getAnswerOverrides(): AnswerOverrideMap {
  return overrides;
}

export function subscribeAnswerOverrides(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Extra accepted indices for a question (excluding the canonical answer). */
export function getOverrideAnswers(questionId: string): number[] {
  return overrides[questionId] || [];
}

/** True if `selected` is the canonical answer or an accepted contest override. */
export function isAnswerAccepted(
  question: Pick<TriviaQuestion, "id" | "answer">,
  selected: number
): boolean {
  if (selected < 0) return false;
  if (selected === question.answer) return true;
  return getOverrideAnswers(question.id).includes(selected);
}

/** Browser helper: pull the latest accepted overrides from the API and register them. */
export async function fetchAndApplyAnswerOverrides(): Promise<AnswerOverrideMap> {
  try {
    const res = await fetch("/api/trivia/contest?overrides=1", { cache: "no-store" });
    if (!res.ok) return overrides;
    const data = await res.json();
    if (data && data.overrides && typeof data.overrides === "object") {
      setAnswerOverrides(data.overrides);
    }
  } catch {}
  return overrides;
}
