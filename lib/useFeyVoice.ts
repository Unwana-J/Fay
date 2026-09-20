"use client";

import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "@/store/useGameStore";

export type FeyAnnouncement =
  | { type: "handoff"; speakerName: string; timerSeconds: number; gameMode: string }
  | { type: "turnStart" }
  | { type: "timeWarning"; secondsLeft: number }
  | { type: "correct" }
  | { type: "skip" }
  | { type: "turnEnd"; wordCount: number; teamName: string }
  | { type: "spinResult"; modifier: string }
  | { type: "roundSummary"; scoreA: number; scoreB: number; nextSpeaker?: string }
  | { type: "gameOver"; winner: string; score: number };

const CORRECT_PHRASES = ["Got it!", "Nice one!", "Correct!", "Yes!", "Well done!", "Spot on!"];
const SKIP_PHRASES = ["Moving on.", "Next word!", "Skipped.", "Let's go."];

function pickRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useFeyVoice() {
  const { feyVoiceEnabled } = useGameStore();
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    synthRef.current = window.speechSynthesis;

    const loadVoice = () => {
      const voices = synthRef.current!.getVoices();
      // Prefer Google English, fallback to any en-US/en-GB, then first available
      voiceRef.current =
        voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ??
        voices.find((v) => v.lang === "en-US") ??
        voices.find((v) => v.lang.startsWith("en")) ??
        voices[0] ??
        null;
    };

    loadVoice();
    if (synthRef.current) synthRef.current.onvoiceschanged = loadVoice;
  }, []);

  const speak = useCallback(
    (text: string, priority = false) => {
      if (!feyVoiceEnabled || typeof window === "undefined") return;
      const synth = synthRef.current ?? window.speechSynthesis;
      if (!synth) return;
      if (priority) synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.08;
      utterance.pitch = 1.0;
      utterance.volume = 0.95;
      if (voiceRef.current) utterance.voice = voiceRef.current;
      synth.speak(utterance);
    },
    [feyVoiceEnabled]
  );

  const announce = useCallback(
    (event: FeyAnnouncement) => {
      switch (event.type) {
        case "handoff":
          if (event.gameMode === "masterchef") {
            speak("Ready? Click Start Turn to reveal the next word.");
          } else {
            speak(
              `${event.speakerName}, get ready! You have ${event.timerSeconds} seconds. Go when you're set.`
            );
          }
          break;

        case "turnStart":
          speak("Go!", true);
          break;

        case "timeWarning":
          if (event.secondsLeft === 15) speak("15 seconds left, keep going!", true);
          else if (event.secondsLeft === 5) speak("5 seconds!", true);
          break;

        case "correct":
          speak(pickRandom(CORRECT_PHRASES));
          break;

        case "skip":
          speak(pickRandom(SKIP_PHRASES));
          break;

        case "turnEnd":
          speak(
            `Time! ${event.teamName} got ${event.wordCount} word${event.wordCount !== 1 ? "s" : ""} this round.`,
            true
          );
          break;

        case "spinResult":
          speak(`You landed on ${event.modifier}!`, true);
          break;

        case "roundSummary":
          if (event.nextSpeaker) {
            speak(
              `Alpha has ${event.scoreA} points, Omega has ${event.scoreB}. Up next: ${event.nextSpeaker}.`
            );
          } else {
            speak(`Final scores — Alpha: ${event.scoreA}, Omega: ${event.scoreB}.`);
          }
          break;

        case "gameOver":
          speak(
            `Game over! Team ${event.winner} wins with ${event.score} points. What an amazing game!`,
            true
          );
          break;
      }
    },
    [speak]
  );

  return { speak, announce };
}
