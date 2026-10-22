import LZString from "lz-string";
import {
  MATHLETICS_QUESTIONS,
  type MathleticsQuestion,
  type MathleticsDifficultyFilter,
} from "./mathletics-questions";

export interface MathleticsChallenge {
  id: string;
  title: string;
  creatorName: string;
  createdAt: number;
  questionIds: string[];
  questionCount: number;
  difficulty: MathleticsDifficultyFilter;
  creatorScore?: {
    score: number;
    total: number;
    pct: number;
    gradeLabel?: string;
  };
}

/**
 * Encodes a Mathletics challenge into a compressed base64 URL safe string.
 */
export function encodeChallengeToUrl(challenge: MathleticsChallenge): string {
  try {
    const minified = {
      i: challenge.id,
      t: challenge.title,
      c: challenge.creatorName,
      a: challenge.createdAt,
      q: challenge.questionIds,
      n: challenge.questionCount,
      d: challenge.difficulty,
      s: challenge.creatorScore
        ? {
            sc: challenge.creatorScore.score,
            to: challenge.creatorScore.total,
            pc: challenge.creatorScore.pct,
            gl: challenge.creatorScore.gradeLabel,
          }
        : undefined,
    };
    return LZString.compressToEncodedURIComponent(JSON.stringify(minified));
  } catch (err) {
    console.error("Failed to encode challenge:", err);
    return "";
  }
}

/**
 * Decodes a challenge code from URL.
 */
export function decodeChallengeFromUrl(code: string): MathleticsChallenge | null {
  if (!code) return null;
  try {
    const jsonStr = LZString.decompressFromEncodedURIComponent(code);
    if (!jsonStr) return null;
    const raw = JSON.parse(jsonStr);

    if (!Array.isArray(raw.q) || raw.q.length === 0) return null;

    return {
      id: raw.i || "challenge-" + Date.now(),
      title: raw.t || "Mathletics Challenge",
      creatorName: raw.c || "Scholar",
      createdAt: raw.a || Date.now(),
      questionIds: raw.q,
      questionCount: raw.n || raw.q.length,
      difficulty: raw.d || "random",
      creatorScore: raw.s
        ? {
            score: raw.s.sc ?? 0,
            total: raw.s.to ?? raw.q.length,
            pct: raw.s.pc ?? 0,
            gradeLabel: raw.s.gl,
          }
        : undefined,
    };
  } catch (err) {
    console.error("Failed to decode challenge:", err);
    return null;
  }
}

/**
 * Retrieves the concrete Mathletics questions for a given challenge.
 */
export function getQuestionsFromChallenge(challenge: MathleticsChallenge): MathleticsQuestion[] {
  const map = new Map<string, MathleticsQuestion>();
  for (const q of MATHLETICS_QUESTIONS) {
    map.set(q.id, q);
  }

  const result: MathleticsQuestion[] = [];
  for (const id of challenge.questionIds) {
    const found = map.get(id);
    if (found) {
      result.push(found);
    }
  }

  // If some questions missing from pool, backfill with random questions
  if (result.length < challenge.questionCount) {
    const missing = challenge.questionCount - result.length;
    const existingIds = new Set(result.map((q) => q.id));
    const fillers = MATHLETICS_QUESTIONS.filter((q) => !existingIds.has(q.id)).slice(0, missing);
    result.push(...fillers);
  }

  return result;
}

/**
 * Encode simple comma-separated question IDs into lightweight hex/b64 string.
 */
export function encodeQuestionIds(ids: string[]): string {
  try {
    return LZString.compressToEncodedURIComponent(ids.join(","));
  } catch {
    return ids.join(",");
  }
}

/**
 * Decode question IDs from lightweight string.
 */
export function decodeQuestionIds(encoded: string): string[] {
  if (!encoded) return [];
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encoded);
    if (decompressed && decompressed.includes("m_")) {
      return decompressed.split(",").filter(Boolean);
    }
  } catch {
    // fallback
  }
  return encoded.split(",").filter(Boolean);
}
