"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type SpeechInputState = "idle" | "listening" | "done" | "error" | "unsupported";

interface UseSpeechInputOptions {
  lang?: string;
  onFinalTranscript?: (text: string) => void;
}

export function useSpeechInput({
  lang = "en-US",
  onFinalTranscript,
}: UseSpeechInputOptions = {}) {
  const [state, setState] = useState<SpeechInputState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<any>(null);
  const onFinalRef = useRef(onFinalTranscript);

  useEffect(() => {
    onFinalRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) setState("unsupported");
  }, []);

  const start = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Cancel any existing session
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState("listening");
      setTranscript("");
      setInterim("");
    };

    recognition.onresult = (event: any) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      setInterim(interimText);
      if (finalText) {
        const cleaned = finalText.trim();
        setTranscript(cleaned);
        setInterim("");
        setState("done");
        onFinalRef.current?.(cleaned);
      }
    };

    recognition.onend = () => {
      setInterim("");
      setState((prev) => (prev === "listening" ? "done" : prev));
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      // "no-speech" is not a real error — just nobody spoke
      if (event.error === "no-speech") {
        setState("idle");
      } else {
        setState("error");
      }
      recognitionRef.current = null;
    };

    recognition.start();
  }, [lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    recognitionRef.current?.abort();
    setState("idle");
    setTranscript("");
    setInterim("");
  }, []);

  return {
    state,
    transcript,
    interim,
    isListening: state === "listening",
    isSupported: state !== "unsupported",
    start,
    stop,
    reset,
  };
}
