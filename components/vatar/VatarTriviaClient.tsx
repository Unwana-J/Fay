"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Script from "next/script";
import {
  Trophy,
  Clock,
  HelpCircle,
  ShoppingBag,
  Flame,
  CheckCircle2,
  XCircle,
  Play,
  ChevronRight,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import type {
  VatarPlayer,
  VatarPurchaseResult,
  VatarLeaderboardEntry,
} from "@/lib/vatar/sdk";
import { playAudioTone, playBuzzerSound } from "@/lib/sound";

type Screen = "home" | "playing" | "results" | "leaderboard" | "shop";

interface Question {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
}

interface FinishedExplanation {
  correct: boolean;
  answer: number;
  explanation: string;
}

export default function VatarTriviaClient() {
  const [sdkReady, setSdkReady] = useState(false);
  const [notFramed, setNotFramed] = useState(false);
  const [player, setPlayer] = useState<VatarPlayer | null>(null);
  const [screen, setScreen] = useState<Screen>("home");

  // Player state & inventory
  const [scholarPoints, setScholarPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hints, setHints] = useState(3);
  const [seals, setSeals] = useState(0);
  const [ownsMarathon, setOwnsMarathon] = useState(false);

  // Sound & pause handling
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const hasInteractedRef = useRef(false);

  // Round options & state
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "random">("random");
  const [durationMinutes, setDurationMinutes] = useState<5 | 10 | 15>(5);
  const [loadingRound, setLoadingRound] = useState(false);

  // Active game session
  const [roundToken, setRoundToken] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, number[]>>({});
  const [timeLeft, setTimeLeft] = useState(300);

  // Results state
  const [roundResult, setRoundResult] = useState<{
    score: number;
    correct: number;
    total: number;
    pct: number;
    pointsAwarded: number;
    remark?: { title: string; subtitle: string; grade: string };
    explanations: Record<string, FinishedExplanation>;
  } | null>(null);

  // Leaderboard data
  const [leaderboardTop, setLeaderboardTop] = useState<VatarLeaderboardEntry[]>([]);
  const [leaderboardMe, setLeaderboardMe] = useState<{ rank: number | null; label: string; score: number } | null>(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Purchasing status
  const [purchasingProduct, setPurchasingProduct] = useState<string | null>(null);
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  // ─── Sound helper (strictly after user tap per Lagos Life review rule 04) ───
  const playSound = useCallback((type: "click" | "correct" | "wrong" | "complete" | "tick") => {
    if (!soundEnabled || !hasInteractedRef.current || isPaused) return;
    try {
      if (type === "click") playAudioTone(520, "sine", 0.08);
      else if (type === "correct") playAudioTone(880, "sine", 0.2);
      else if (type === "wrong") playBuzzerSound("classic");
      else if (type === "complete") playAudioTone(1046, "triangle", 0.35);
      else if (type === "tick") playAudioTone(640, "sine", 0.04);
    } catch {}
  }, [soundEnabled, isPaused]);

  // ─── Claim & deliver purchases through server ──────────────────────────────
  const claimPurchase = useCallback(async (p: VatarPurchaseResult) => {
    if (!player) return;
    try {
      const res = await fetch("/api/vatar/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id, purchaseId: p.purchaseId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.productId === "hints_10") setHints((h) => h + 10);
        else if (data.productId === "scholar_seal") setSeals((s) => s + 1);
        else if (data.productId === "marathon") setOwnsMarathon(true);
        setPurchaseNotice("Acquisition delivered! ✨");
        setTimeout(() => setPurchaseNotice(null), 4000);
      }
    } catch (err) {
      console.error("Failed to claim purchase:", err);
    }
  }, [player]);

  // ─── Load player profile ───────────────────────────────────────────────────
  const loadProfile = useCallback(async (p: VatarPlayer) => {
    try {
      const res = await fetch("/api/vatar/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: p.id, playerName: p.name, avatar: p.avatar }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.player) {
          setScholarPoints(data.player.scholarPoints || 0);
          setStreak(data.player.streak || 0);
          setHints(data.player.hints ?? 3);
          setSeals(data.player.seals ?? 0);
          setOwnsMarathon(Boolean(data.player.ownsMarathon));
        }
      }
    } catch (err) {
      console.warn("Could not load player profile:", err);
    }
  }, []);

  // ─── Vatar SDK Initialization ──────────────────────────────────────────────
  const handleScriptLoad = () => {
    if (!window.Vatar) return;
    const vatar = window.Vatar;

    vatar
      .init()
      .then(({ player: initPlayer }) => {
        setSdkReady(true);
        setPlayer(initPlayer);
        loadProfile(initPlayer);

        vatar.purchases().then((list) => {
          list.forEach((p) => claimPurchase(p));
        });
      })
      .catch((err: { code?: string }) => {
        if (err?.code === "not_framed") {
          setNotFramed(true);
        } else {
          console.error("Vatar init error:", err);
        }
      });

    vatar.onPurchase((p) => claimPurchase(p));
    vatar.onPause(() => setIsPaused(true));
    vatar.onResume(() => setIsPaused(false));
  };

  // ─── Fetch Vatar Leaderboard ───────────────────────────────────────────────
  const fetchLeaderboard = async () => {
    if (!window.Vatar) return;
    setLoadingLeaderboard(true);
    try {
      const res = await window.Vatar.leaderboard();
      setLeaderboardTop(res.top || []);
      setLeaderboardMe(res.me);
    } catch (err) {
      console.warn("Failed to fetch leaderboard:", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // ─── Purchase a Product ────────────────────────────────────────────────────
  const handleBuy = async (productId: string) => {
    if (!window.Vatar) return;
    hasInteractedRef.current = true;
    playSound("click");
    setPurchasingProduct(productId);
    try {
      const res = await window.Vatar.purchase(productId);
      await claimPurchase(res);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code !== "cancelled") {
        setPurchaseNotice(`Acquisition cancelled (${code || "declined"})`);
        setTimeout(() => setPurchaseNotice(null), 3000);
      }
    } finally {
      setPurchasingProduct(null);
    }
  };

  // ─── Start a New Round ─────────────────────────────────────────────────────
  const startRound = async () => {
    if (!player) return;
    hasInteractedRef.current = true;
    playSound("click");
    setLoadingRound(true);
    try {
      const res = await fetch("/api/vatar/round/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: player.id,
          difficulty,
          durationMinutes,
        }),
      });

      if (!res.ok) throw new Error("Failed to start round");
      const data = await res.json();

      setRoundToken(data.roundToken);
      setQuestions(data.questions);
      setCurrentIndex(0);
      setAnswers({});
      setEliminatedOptions({});
      setTimeLeft(data.durationSeconds || durationMinutes * 60);
      setScreen("playing");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRound(false);
    }
  };

  // ─── Timer during round ────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "playing" || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishRound();
          return 0;
        }
        if (prev <= 10) {
          playSound("tick");
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, isPaused, playSound]);

  // ─── Answer selection (Suspense mode: captures answer) ─────────────────────
  const handleSelectOption = (optionIndex: number) => {
    hasInteractedRef.current = true;
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    playSound("click");
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionIndex }));

    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((idx) => idx + 1), 180);
    }
  };

  // ─── 50/50 Hint power-up ───────────────────────────────────────────────────
  const useHint = () => {
    if (hints <= 0) {
      setScreen("shop");
      return;
    }
    const currentQ = questions[currentIndex];
    if (!currentQ || eliminatedOptions[currentQ.id]) return;

    hasInteractedRef.current = true;
    playSound("click");
    setHints((h) => Math.max(0, h - 1));

    const indices = [0, 1, 2, 3];
    const shuffled = indices.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedOptions((prev) => ({ ...prev, [currentQ.id]: shuffled }));
  };

  // ─── Finish round & compute score ──────────────────────────────────────────
  const finishRound = async () => {
    if (!player || !roundToken) return;
    playSound("complete");
    setLoadingRound(true);

    try {
      const res = await fetch("/api/vatar/round/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundToken,
          answers,
          playerName: player.name,
          avatar: player.avatar,
        }),
      });

      if (!res.ok) throw new Error("Failed to finish round");
      const data = await res.json();

      setRoundResult(data);
      setScholarPoints(data.totalScholarPoints);
      setScreen("results");

      if (window.Vatar && data.totalScholarPoints > 0) {
        window.Vatar.submitScore(data.totalScholarPoints).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      setScreen("home");
    } finally {
      setLoadingRound(false);
    }
  };

  // ─── Fallback screen if opened outside Lagos Life frame ────────────────────
  if (notFramed) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center bg-[#F4EFE6] text-[#1E2211]">
        <div className="size-16 rounded-full bg-[#7A1C2E]/10 border border-[#7A1C2E]/30 flex items-center justify-center mb-4 text-3xl">
          🏛️
        </div>
        <h1 className="text-2xl font-bold font-serif text-[#1E2211] mb-2">Fey Trivia</h1>
        <p className="text-sm text-[#525645] max-w-xs mb-6 leading-relaxed">
          This scholarly parlor is crafted exclusively for the Lagos Life world. Open Lagos Life and launch Fey Trivia from your Games app!
        </p>
        <a
          href="https://lagoslife.app"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[#7A1C2E] px-8 text-sm font-bold text-white shadow-md active:scale-95 transition-all"
        >
          Enter Lagos Life →
        </a>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <>
      <Script
        src="https://lagoslife.app/sdk/vatar-games-v1.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      <main className="min-h-dvh w-full max-w-md mx-auto flex flex-col bg-[#F4EFE6] text-[#1E2211] select-none touch-manipulation font-sans">
        {/* Top Header Bar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-[#444E2C]/15 bg-[#EBE5DA]/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-base">🏛️</span>
            <span className="font-serif font-bold text-base tracking-wide text-[#333C1A]">Fey Trivia</span>
          </div>

          <div className="flex items-center gap-3">
            {purchaseNotice && (
              <span className="text-xs font-semibold text-[#444E2C] animate-pulse">{purchaseNotice}</span>
            )}
            <button
              onClick={() => {
                hasInteractedRef.current = true;
                setSoundEnabled(!soundEnabled);
              }}
              className="p-1.5 text-[#525645] hover:text-[#1E2211] transition-colors"
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDFCFA] border border-[#444E2C]/20 shadow-xs text-xs font-semibold text-[#444E2C]">
              <Trophy size={13} className="text-[#A67C1E]" />
              <span>{scholarPoints.toLocaleString()}</span>
            </div>
          </div>
        </header>

        {/* Paused State Banner */}
        {isPaused && (
          <div className="bg-[#A67C1E]/15 border-b border-[#A67C1E]/30 px-4 py-2 text-center text-xs font-semibold text-[#7A5408]">
            Game paused · Tap back in to resume
          </div>
        )}

        {/* ─── SCREEN: HOME ──────────────────────────────────────────────── */}
        {screen === "home" && (
          <div className="flex-1 flex flex-col justify-between p-5">
            <div>
              {/* Player Card */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FDFCFA] border border-[#444E2C]/15 shadow-xs mb-5">
                <div className="flex items-center gap-3">
                  {player?.avatar ? (
                    <img src={player.avatar} alt="Avatar" className="size-11 rounded-full object-cover border border-[#444E2C]/20" />
                  ) : (
                    <div className="size-11 rounded-full bg-[#7A1C2E]/10 border border-[#7A1C2E]/20 flex items-center justify-center font-serif font-bold text-[#7A1C2E]">
                      {player?.name?.[0]?.toUpperCase() || "P"}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-serif font-bold leading-tight text-[#1E2211]">{player?.name || "Player"}</h2>
                    <p className="text-xs text-[#525645]">Level {Math.floor(scholarPoints / 500) + 1}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#A67C1E] bg-[#A67C1E]/10 px-2 py-1 rounded-full border border-[#A67C1E]/20">
                  <Flame size={14} className="text-[#A67C1E]" />
                  <span>{streak}d</span>
                </div>
              </div>

              {/* Match Difficulty Picker */}
              <div className="mb-5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#525645] block mb-2 font-serif">
                  Difficulty
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["random", "easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        hasInteractedRef.current = true;
                        playSound("click");
                        setDifficulty(d);
                      }}
                      className={`h-11 rounded-xl text-xs font-bold capitalize transition-all border ${
                        difficulty === d
                          ? "bg-[#7A1C2E] text-white border-[#7A1C2E] shadow-sm"
                          : "bg-[#FDFCFA] text-[#525645] border-[#444E2C]/15 hover:border-[#444E2C]/30"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Options */}
              <div className="mb-6">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#525645] block mb-2 font-serif">
                  Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { m: 5, label: "5m · 10 Qs", locked: false },
                    { m: 10, label: "10m · 20 Qs", locked: false },
                    { m: 15, label: "15m · Marathon", locked: !ownsMarathon },
                  ].map((dur) => (
                    <button
                      key={dur.m}
                      disabled={dur.locked}
                      onClick={() => {
                        hasInteractedRef.current = true;
                        playSound("click");
                        setDurationMinutes(dur.m as 5 | 10 | 15);
                      }}
                      className={`h-12 rounded-xl px-2 text-xs font-bold transition-all border flex flex-col items-center justify-center ${
                        durationMinutes === dur.m
                          ? "bg-[#444E2C] text-white border-[#444E2C] shadow-sm"
                          : dur.locked
                          ? "bg-[#DCD5C9]/40 text-[#828574] border-transparent"
                          : "bg-[#FDFCFA] text-[#525645] border-[#444E2C]/15"
                      }`}
                    >
                      <span>{dur.label}</span>
                      {dur.locked && <span className="text-[10px] text-[#7A1C2E] font-medium">Unlock ₦10k</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-3">
              <button
                disabled={loadingRound || !sdkReady}
                onClick={startRound}
                className="w-full h-14 rounded-full bg-[#7A1C2E] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-[#7A1C2E]/25 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Play size={18} fill="currentColor" />
                <span>{loadingRound ? "Loading Deck…" : "Start Trivia"}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    hasInteractedRef.current = true;
                    playSound("click");
                    fetchLeaderboard();
                    setScreen("leaderboard");
                  }}
                  className="h-12 rounded-xl bg-[#FDFCFA] border border-[#444E2C]/15 font-bold text-xs text-[#333C1A] flex items-center justify-center gap-2 hover:bg-[#EBE5DA] transition-colors"
                >
                  <Trophy size={14} className="text-[#A67C1E]" />
                  <span>Leaderboard</span>
                </button>
                <button
                  onClick={() => {
                    hasInteractedRef.current = true;
                    playSound("click");
                    setScreen("shop");
                  }}
                  className="h-12 rounded-xl bg-[#FDFCFA] border border-[#444E2C]/15 font-bold text-xs text-[#333C1A] flex items-center justify-center gap-2 hover:bg-[#EBE5DA] transition-colors"
                >
                  <ShoppingBag size={14} className="text-[#7A1C2E]" />
                  <span>Shop ({hints})</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SCREEN: PLAYING ───────────────────────────────────────────── */}
        {screen === "playing" && currentQ && (
          <div className="flex-1 flex flex-col justify-between p-5">
            <div>
              {/* Progress & Time */}
              <div className="flex items-center justify-between text-xs font-bold text-[#525645] mb-4">
                <span className="font-serif">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="flex items-center gap-1 font-mono text-[#7A1C2E] font-bold">
                  <Clock size={13} />
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* Category Pill & Hint Button */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full bg-[#EBE5DA] border border-[#444E2C]/15 text-[11px] font-semibold text-[#444E2C] font-serif">
                  {currentQ.category}
                </span>
                <button
                  onClick={useHint}
                  disabled={Boolean(eliminatedOptions[currentQ.id])}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A67C1E]/10 text-[#7A5408] border border-[#A67C1E]/30 text-xs font-bold disabled:opacity-40"
                >
                  <HelpCircle size={13} />
                  <span>50/50 ({hints})</span>
                </button>
              </div>

              {/* Question Text */}
              <h3 className="font-serif text-lg font-bold leading-snug mb-6 text-[#1E2211]">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="flex flex-col gap-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = answers[currentQ.id] === idx;
                  const isEliminated = eliminatedOptions[currentQ.id]?.includes(idx);

                  return (
                    <button
                      key={idx}
                      disabled={isEliminated}
                      onClick={() => handleSelectOption(idx)}
                      className={`min-h-[52px] w-full p-3.5 rounded-xl text-left text-sm font-medium transition-all border flex items-center justify-between ${
                        isEliminated
                          ? "opacity-25 line-through border-transparent bg-transparent"
                          : isSelected
                          ? "bg-[#444E2C] text-white border-[#444E2C] font-semibold shadow-xs"
                          : "bg-[#FDFCFA] text-[#1E2211] border-[#444E2C]/15 hover:border-[#444E2C]/30 active:bg-[#EBE5DA]"
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 size={16} className="text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="pt-4 flex items-center justify-between border-t border-[#444E2C]/15">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  hasInteractedRef.current = true;
                  playSound("click");
                  setCurrentIndex((i) => Math.max(0, i - 1));
                }}
                className="text-xs font-bold text-[#525645] disabled:opacity-30"
              >
                ← Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => {
                    hasInteractedRef.current = true;
                    playSound("click");
                    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#7A1C2E]"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  disabled={loadingRound}
                  onClick={finishRound}
                  className="h-10 px-5 rounded-full bg-[#7A1C2E] text-white font-bold text-xs shadow-xs"
                >
                  {loadingRound ? "Evaluating…" : "Submit Sprint"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─── SCREEN: RESULTS ───────────────────────────────────────────── */}
        {screen === "results" && roundResult && (
          <div className="flex-1 flex flex-col justify-between p-5 overflow-y-auto">
            <div>
              <div className="text-center py-4">
                <span className="text-4xl">🎉</span>
                <h2 className="text-xl font-bold font-serif text-[#1E2211] mt-2 mb-1">
                  {roundResult.remark?.title || "Round Complete"}
                </h2>
                <p className="text-xs text-[#525645] max-w-xs mx-auto mb-4 leading-relaxed">
                  {roundResult.remark?.subtitle || "Great game! Here is how you performed."}
                </p>

                {/* Score Stats Grid */}
                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-[#FDFCFA] border border-[#444E2C]/15 shadow-xs mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#525645] block font-serif">Accuracy</span>
                    <span className="text-lg font-extrabold text-[#7A1C2E]">{roundResult.pct}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#525645] block font-serif">Correct</span>
                    <span className="text-lg font-extrabold text-[#1E2211]">
                      {roundResult.correct}/{roundResult.total}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#525645] block font-serif">Points</span>
                    <span className="text-lg font-extrabold text-[#444E2C]">+{roundResult.pointsAwarded}</span>
                  </div>
                </div>
              </div>

              {/* Explanations list */}
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#525645] mb-3 font-serif">
                Review Answers
              </h4>
              <div className="space-y-3 mb-6">
                {questions.map((q, idx) => {
                  const expl = roundResult.explanations[q.id];
                  const chosenIdx = answers[q.id];

                  return (
                    <div key={q.id} className="p-3.5 rounded-xl bg-[#FDFCFA] border border-[#444E2C]/15 text-xs shadow-2xs">
                      <div className="flex items-start gap-2 mb-1.5">
                        {expl?.correct ? (
                          <CheckCircle2 size={15} className="text-[#444E2C] shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={15} className="text-[#B53A3A] shrink-0 mt-0.5" />
                        )}
                        <span className="font-semibold text-[#1E2211]">
                          {idx + 1}. {q.question}
                        </span>
                      </div>
                      <div className="pl-6 text-[#525645] space-y-0.5">
                        <p>
                          Your answer: <span className="font-semibold text-[#1E2211]">{q.options[chosenIdx] ?? "Unanswered"}</span>
                        </p>
                        {!expl?.correct && (
                          <p className="text-[#444E2C]">
                            Correct: <span className="font-semibold">{q.options[expl?.answer ?? 0]}</span>
                          </p>
                        )}
                        {expl?.explanation && <p className="pt-1 text-[11px] text-[#525645] italic font-serif leading-relaxed">{expl.explanation}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                hasInteractedRef.current = true;
                playSound("click");
                setScreen("home");
              }}
              className="w-full h-13 rounded-full bg-[#7A1C2E] text-white font-bold text-sm shadow-md"
            >
              Play Again
            </button>
          </div>
        )}

        {/* ─── SCREEN: LEADERBOARD ───────────────────────────────────────── */}
        {screen === "leaderboard" && (
          <div className="flex-1 flex flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold font-serif text-[#1E2211]">Leaderboard</h2>
                <button
                  onClick={() => {
                    hasInteractedRef.current = true;
                    playSound("click");
                    setScreen("home");
                  }}
                  className="text-xs font-bold text-[#525645]"
                >
                  Done
                </button>
              </div>

              {leaderboardMe && (
                <div className="p-3.5 rounded-xl bg-[#FDFCFA] border border-[#A67C1E]/30 mb-4 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#A67C1E] font-serif">{leaderboardMe.label}</span>
                    <span className="text-xs font-semibold text-[#525645]">Your Rank</span>
                  </div>
                  <span className="text-sm font-extrabold text-[#444E2C]">
                    {leaderboardMe.score.toLocaleString()} pts
                  </span>
                </div>
              )}

              {loadingLeaderboard ? (
                <div className="text-center py-12 text-xs text-[#525645]">Loading leaderboard…</div>
              ) : leaderboardTop.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#525645]">
                  No scores recorded yet. Be the first to rank!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
                  {leaderboardTop.map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FDFCFA] border border-[#444E2C]/10 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold w-6 text-[#525645] font-serif">#{entry.rank}</span>
                        <span className="font-semibold text-[#1E2211]">{entry.name}</span>
                      </div>
                      <span className="font-extrabold text-[#A67C1E]">{entry.score.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                hasInteractedRef.current = true;
                playSound("click");
                setScreen("home");
              }}
              className="w-full h-12 rounded-full bg-[#EBE5DA] text-[#1E2211] font-bold text-xs border border-[#444E2C]/15"
            >
              Close
            </button>
          </div>
        )}

        {/* ─── SCREEN: SHOP ──────────────────────────────────────────────── */}
        {screen === "shop" && (
          <div className="flex-1 flex flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold font-serif text-[#1E2211]">Shop</h2>
                <button
                  onClick={() => {
                    hasInteractedRef.current = true;
                    playSound("click");
                    setScreen("home");
                  }}
                  className="text-xs font-bold text-[#525645]"
                >
                  Done
                </button>
              </div>

              <div className="space-y-3">
                {/* 1. Hints Pack */}
                <div className="p-4 rounded-2xl bg-[#FDFCFA] border border-[#444E2C]/15 shadow-xs flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold font-serif text-[#1E2211]">10× 50/50 Hints</h4>
                    <p className="text-xs text-[#525645]">Removes two wrong choices</p>
                    <span className="text-xs font-semibold text-[#444E2C] mt-1 block">Owned: {hints}</span>
                  </div>
                  <button
                    disabled={purchasingProduct === "hints_10"}
                    onClick={() => handleBuy("hints_10")}
                    className="h-10 px-4 rounded-full bg-[#7A1C2E] text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50"
                  >
                    {purchasingProduct === "hints_10" ? "…" : "₦1,000"}
                  </button>
                </div>

                {/* 2. Scholar's Seal */}
                <div className="p-4 rounded-2xl bg-[#FDFCFA] border border-[#444E2C]/15 shadow-xs flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold font-serif text-[#1E2211]">Streak Freeze</h4>
                    <p className="text-xs text-[#525645]">Protects streak if you miss a day</p>
                    <span className="text-xs font-semibold text-[#444E2C] mt-1 block">Owned: {seals}</span>
                  </div>
                  <button
                    disabled={purchasingProduct === "scholar_seal"}
                    onClick={() => handleBuy("scholar_seal")}
                    className="h-10 px-4 rounded-full bg-[#7A1C2E] text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-50"
                  >
                    {purchasingProduct === "scholar_seal" ? "…" : "₦2,500"}
                  </button>
                </div>

                {/* 3. Marathon Mode */}
                <div className="p-4 rounded-2xl bg-[#FDFCFA] border border-[#444E2C]/15 shadow-xs flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold font-serif text-[#1E2211]">Marathon Mode</h4>
                    <p className="text-xs text-[#525645]">Unlock 15-minute 30-question mode</p>
                    <span className="text-xs font-semibold text-[#444E2C] mt-1 block">
                      {ownsMarathon ? "Unlocked ✓" : "Locked"}
                    </span>
                  </div>
                  <button
                    disabled={ownsMarathon || purchasingProduct === "marathon"}
                    onClick={() => handleBuy("marathon")}
                    className="h-10 px-4 rounded-full bg-[#7A1C2E] text-white text-xs font-bold shadow-xs active:scale-95 transition-all disabled:opacity-40"
                  >
                    {ownsMarathon ? "Owned" : purchasingProduct === "marathon" ? "…" : "₦10,000"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                hasInteractedRef.current = true;
                playSound("click");
                setScreen("home");
              }}
              className="w-full h-12 rounded-full bg-[#EBE5DA] text-[#1E2211] font-bold text-xs border border-[#444E2C]/15"
            >
              Close
            </button>
          </div>
        )}
      </main>
    </>
  );
}
