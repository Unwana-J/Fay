"use client";

import { useState, useCallback } from "react";
import { useGameStore } from "@/store/useGameStore";

export interface ValidationResult {
  correct: boolean;
  confidence: number; // 0.0 – 1.0
  reason: string;
  phoneticMatch?: boolean; // true when Fey accepted a mispronunciation
}

export interface ViolationResult {
  violation: boolean;
  type: "said-word" | "part-of-word" | "spelled" | "rhyme-hint" | "none";
  excerpt: string;
}

export function useAIReferee() {
  const { aiRefereeEnabled, difficulty } = useGameStore();
  const [isValidating, setIsValidating] = useState(false);
  const [isCheckingViolation, setIsCheckingViolation] = useState(false);
  const [lastValidation, setLastValidation] = useState<ValidationResult | null>(null);
  const [violations, setViolations] = useState<ViolationResult[]>([]);

  /** Ask Gemini whether a player's guess matches the target word */
  const validateGuess = useCallback(
    async (targetWord: string, guess: string): Promise<ValidationResult | null> => {
      if (!aiRefereeEnabled || !guess.trim()) return null;
      setIsValidating(true);
      try {
        const res = await fetch("/api/ai/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetWord, guess, difficulty }),
        });
        if (!res.ok) throw new Error("API error");
        const data: ValidationResult = await res.json();
        setLastValidation(data);
        return data;
      } catch {
        return null;
      } finally {
        setIsValidating(false);
      }
    },
    [aiRefereeEnabled, difficulty]
  );

  /** Check if the speaker's description broke any rules */
  const checkViolation = useCallback(
    async (targetWord: string, description: string): Promise<ViolationResult | null> => {
      if (!aiRefereeEnabled || !description.trim()) return null;
      setIsCheckingViolation(true);
      try {
        const res = await fetch("/api/ai/check-violation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetWord, description }),
        });
        if (!res.ok) throw new Error("API error");
        const data: ViolationResult = await res.json();
        if (data.violation) {
          setViolations((prev) => [...prev, data]);
        }
        return data;
      } catch {
        return null;
      } finally {
        setIsCheckingViolation(false);
      }
    },
    [aiRefereeEnabled]
  );

  const clearSession = useCallback(() => {
    setViolations([]);
    setLastValidation(null);
  }, []);

  return {
    validateGuess,
    checkViolation,
    isValidating,
    isCheckingViolation,
    lastValidation,
    violations,
    clearSession,
    aiRefereeEnabled,
  };
}
