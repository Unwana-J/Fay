"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Script from "next/script";
import {
  Trophy,
  Zap,
  Clock,
  Sparkles,
  HelpCircle,
  ShoppingBag,
  Flame,
  CheckCircle2,
  XCircle,
  Play,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import type {
  VatarSDK,
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
        setPurchaseNotice("Purchase delivered! ✨");
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

        // Check for any undelivered purchases interrupted by reload
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

    // Listen for purchases made outside the game loop
    vatar.onPurchase((p) => claimPurchase(p));

    // Handle backgrounding / incoming phone calls / pay sheets
    vatar.onPause(() => {
      setIsPaused(true);
    });

    vatar.onResume(() => {
      setIsPaused(false);
    });
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
        setPurchaseNotice(`Purchase not completed (${code || "error"})`);
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

  // ─── Answer selection (Suspense mode: client captures answer index) ────────
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

    // Eliminate 2 random incorrect options (we can randomly eliminate any 2 of the 4)
    const indices = [0, 1, 2, 3];
    const shuffled = indices.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedOptions((prev) => ({ ...prev, [currentQ.id]: shuffled }));
  };

  // ─── Finish round & compute server-authoritative score ─────────────────────
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

      // Submit new cumulative points to Vatar Leaderboard
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
      <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center bg-[#13110C] text-[#F5F2EB]">
        <div className="size-16 rounded-full bg-[#E9C9FF]/20 flex items-center justify-center mb-4 text-3xl">
          🏛️
        </div>
        <h1 className="text-2xl font-bold font-serif mb-2">Fey Trivia on Lagos Life</h1>
        <p className="text-sm text-[#A8A49C] max-w-xs mb-6">
          This game is made to run inside the Lagos Life phone. Open Lagos Life and launch Fey Trivia from your Games app!
        </p>
        <a
          href="https://lagoslife.app"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[#E9C9FF] px-8 text-sm font-bold text-black"
        >
          Open Lagos Life →
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

      <main className="min-h-dvh w-full max-w-md mx-auto flex flex-col bg-[#11110E] text-[#F3EFE6] select-none touch-manipulation font-sans">
        {/* Top Header Bar */}
        <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-white/10 bg-[#161512]">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏛️</span>
            <span className="font-serif font-bold text-base tracking-wide text-[#E9C9FF]">Fey Trivia</span>
          </div>

          <div className="flex items-center gap-3">
            {purchaseNotice && (
              <span className="text-xs font-semibold text-[#86EFAC] animate-pulse">{purchaseNotice}</span>
            )}
            <button
              onClick={() => {
                hasInteractedRef.current = true;
                setSoundEnabled(!soundEnabled);
              }}
              className="p-2 text-[#A8A49C] hover:text-white"
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold">
              <Trophy size={13} className="text-[#FACC15]" />
              <span>{scholarPoints.toLocaleString()}</span>
            </div>
          </div>
        </header>

        {/* Paused State Banner */}
        {isPaused && (
          <div className="bg-[#EAB308]/20 border-b border-[#EAB308]/40 px-4 py-2 text-center text-xs font-semibold text-[#FACC15]">
            Game paused while away · Resuming on return
          </div>
        )}

        {/* ─── SCREEN: HOME ──────────────────────────────────────────────── */}
        {screen === "home" && (
          <div className="flex-1 flex flex-col justify-between p-5">
            <div>
              {/* Player Welcome Card */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  {player?.avatar ? (
                    <img src={player.avatar} alt="Avatar" className="size-11 rounded-full object-cover border border-white/20" />
                  ) : (
                    <div className="size-11 rounded-full bg-[#E9C9FF]/20 flex items-center justify-center font-bold text-[#E9C9FF]">
                      {player?.name?.[0]?.toUpperCase() || "S"}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-bold leading-tight">{player?.name || "Scholar"}</h2>
                    <p className="text-xs text-[#A8A49C]">Level {Math.floor(scholarPoints / 500) + 1} Scholar</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-[#FB923C]">
                  <Flame size={15} />
                  <span>{streak}d</span>
                </div>
              </div>

              {/* Match Difficulty Picker */}
              <div className="mb-5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#A8A49C] block mb-2">Difficulty</label>
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
                          ? "bg-[#E9C9FF] text-black border-[#E9C9FF]"
                          : "bg-white/[0.03] text-[#A8A49C] border-white/10 hover:border-white/20"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Options */}
              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-wider text-[#A8A49C] block mb-2">Duration</label>
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
                          ? "bg-[#E9C9FF] text-black border-[#E9C9FF]"
                          : dur.locked
                          ? "bg-white/[0.01] text-white/30 border-white/5"
                          : "bg-white/[0.03] text-[#A8A49C] border-white/10"
                      }`}
                    >
                      <span>{dur.label}</span>
                      {dur.locked && <span className="text-[10px] text-[#E9C9FF]">Unlock ₦10k</span>}
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
                className="w-full h-14 rounded-full bg-[#E9C9FF] text-black font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-[#E9C9FF]/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Play size={18} fill="currentColor" />
                <span>{loadingRound ? "Loading Deck…" : "Start Sprint"}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    hasInteractedRef.current = true;
                    playSound("click");
                    fetchLeaderboard();
                    setScreen("leaderboard");
                  }}
                  className="h-12 rounded-xl bg-white/[0.04] border border-white/10 font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/[0.08]"
                >
                  <Trophy size={14} className="text-[#FACC15]" />
                  <span>Leaderboard</span>
                </button>
                <button
                  onClick={() => {
                    hasInteractedRef.current = true;
                    playSound("click");
                    setScreen("shop");
                  }}
                  className="h-12 rounded-xl bg-white/[0.04] border border-white/10 font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/[0.08]"
                >
                  <ShoppingBag size={14} className="text-[#E9C9FF]" />
                  <span>Shop ({hints} Hints)</span>
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
              <div className="flex items-center justify-between text-xs font-bold text-[#A8A49C] mb-4">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="flex items-center gap-1 text-[#FACC15]">
                  <Clock size={13} />
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* Category Pill & Hint Button */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-[#A8A49C]">
                  {currentQ.category}
                </span>
                <button
                  onClick={useHint}
                  disabled={Boolean(eliminatedOptions[currentQ.id])}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9C9FF]/10 text-[#E9C9FF] border border-[#E9C9FF]/30 text-xs font-bold disabled:opacity-40"
                >
                  <HelpCircle size={13} />
                  <span>50/50 ({hints})</span>
                </button>
              </div>

              {/* Question Text */}
              <h3 className="font-serif text-lg font-bold leading-snug mb-6 text-[#F5F2EB]">
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
                          ? "opacity-20 line-through border-transparent"
                          : isSelected
                          ? "bg-[#E9C9FF] text-black border-[#E9C9FF] font-semibold"
                          : "bg-white/[0.04] text-[#F3EFE6] border-white/10 hover:border-white/20 active:bg-white/[0.08]"
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  hasInteractedRef.current = true;
                  playSound("click");
                  setCurrentIndex((i) => Math.max(0, i - 1));
                }}
                className="text-xs font-bold text-[#A8A49C] disabled:opacity-30"
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
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#E9C9FF]"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  disabled={loadingRound}
                  onClick={finishRound}
                  className="h-10 px-5 rounded-full bg-[#E9C9FF] text-black font-bold text-xs"
                >
                  {loadingRound ? "Scoring…" : "Submit Round"}
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
                <span className="text-4xl">🎓</span>
                <h2 className="text-xl font-bold font-serif mt-2 mb-1">
                  {roundResult.remark?.title || "Round Complete"}
                </h2>
                <p className="text-xs text-[#A8A49C] max-w-xs mx-auto mb-4">
                  {roundResult.remark?.subtitle || "Great articulation of your knowledge."}
                </p>

                {/* Score Stats Grid */}
                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A8A49C] block">Accuracy</span>
                    <span className="text-lg font-extrabold text-[#FACC15]">{roundResult.pct}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A8A49C] block">Correct</span>
                    <span className="text-lg font-extrabold">
                      {roundResult.correct}/{roundResult.total}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A8A49C] block">Scholar Pts</span>
                    <span className="text-lg font-extrabold text-[#86EFAC]">+{roundResult.pointsAwarded}</span>
                  </div>
                </div>
              </div>

              {/* Explanations list */}
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A8A49C] mb-3">Round Review</h4>
              <div className="space-y-3 mb-6">
                {questions.map((q, idx) => {
                  const expl = roundResult.explanations[q.id];
                  const chosenIdx = answers[q.id];

                  return (
                    <div key={q.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      <div className="flex items-start gap-2 mb-1.5">
                        {expl?.correct ? (
                          <CheckCircle2 size={15} className="text-[#86EFAC] shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={15} className="text-[#F87171] shrink-0 mt-0.5" />
                        )}
                        <span className="font-semibold text-white/90">
                          {idx + 1}. {q.question}
                        </span>
                      </div>
                      <div className="pl-6 text-[#A8A49C] space-y-0.5">
                        <p>
                          Your answer: <span className="font-semibold text-white">{q.options[chosenIdx] ?? "None"}</span>
                        </p>
                        {!expl?.correct && (
                          <p className="text-[#86EFAC]">
                            Correct: <span className="font-semibold">{q.options[expl?.answer ?? 0]}</span>
                          </p>
                        )}
                        {expl?.explanation && <p className="pt-1 text-[11px] text-[#D4D0C5] italic">{expl.explanation}</p>}
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
              className="w-full h-13 rounded-full bg-[#E9C9FF] text-black font-bold text-sm"
            >
              Back to Campus
            </button>
          </div>
        )}

        {/* ─── SCREEN: LEADERBOARD ───────────────────────────────────────── */}
        {screen === "leaderboard" && (
          <div className="flex-1 flex flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold font-serif">Scholar Leaderboard</h2>
                <button
                  onClick={() => {
                    hasInteractedRef.current = true;
                    playSound("click");
                    setScreen("home");
                  }}
                  className="text-xs font-bold text-[#A8A49C]"
                >
                  Done
                </button>
              </div>

              {leaderboardMe && (
                <div className="p-3 rounded-xl bg-[#E9C9FF]/10 border border-[#E9C9FF]/30 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#E9C9FF]">{leaderboardMe.label}</span>
                    <span className="text-xs font-semibold">Your Rank</span>
                  </div>
                  <span className="text-sm font-extrabold text-[#E9C9FF]">
                    {leaderboardMe.score.toLocaleString()} pts
                  </span>
                </div>
              )}

              {loadingLeaderboard ? (
                <div className="text-center py-12 text-xs text-[#A8A49C]">Loading Vatar Leaderboard…</div>
              ) : leaderboardTop.length === 0 ? (
                <div className="text-center py-12 text-xs text-[#A8A49C]">
                  No scores recorded yet. Play a round to claim the #1 spot!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
                  {leaderboardTop.map((entry) => (
                    <div
                      key={entry.rank}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold w-6 text-white/50">#{entry.rank}</span>
                        <span className="font-semibold text-white/90">{entry.name}</span>
                      </div>
                      <span className="font-extrabold text-[#FACC15]">{entry.score.toLocaleString()}</span>
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
              className="w-full h-12 rounded-full bg-white/[0.08] text-white font-bold text-xs"
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
                <h2 className="text-base font-bold font-serif">Scholar Emporium</h2>
                <button
                  onClick={() => {
                    hasInteractedRef.current = true;
                    playSound("click");
                    setScreen("home");
                  }}
                  className="text-xs font-bold text-[#A8A49C]"
                >
                  Done
                </button>
              </div>

              <div className="space-y-3">
                {/* 1. Hints Pack */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold">10× 50/50 Hints</h4>
                    <p className="text-xs text-[#A8A49C]">Eliminates two incorrect choices</p>
                    <span className="text-xs font-semibold text-[#86EFAC] mt-1 block">Owned: {hints}</span>
                  </div>
                  <button
                    disabled={purchasingProduct === "hints_10"}
                    onClick={() => handleBuy("hints_10")}
                    className="h-10 px-4 rounded-full bg-[#E9C9FF] text-black text-xs font-bold disabled:opacity-50"
                  >
                    {purchasingProduct === "hints_10" ? "…" : "₦1,000"}
                  </button>
                </div>

                {/* 2. Scholar's Seal */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold">Scholar&apos;s Seal</h4>
                    <p className="text-xs text-[#A8A49C]">Protects streak if you miss a day</p>
                    <span className="text-xs font-semibold text-[#86EFAC] mt-1 block">Owned: {seals}</span>
                  </div>
                  <button
                    disabled={purchasingProduct === "scholar_seal"}
                    onClick={() => handleBuy("scholar_seal")}
                    className="h-10 px-4 rounded-full bg-[#E9C9FF] text-black text-xs font-bold disabled:opacity-50"
                  >
                    {purchasingProduct === "scholar_seal" ? "…" : "₦2,500"}
                  </button>
                </div>

                {/* 3. Marathon Mode */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold">Marathon Sprint</h4>
                    <p className="text-xs text-[#A8A49C]">Unlock 15-minute 30-question sprints</p>
                    <span className="text-xs font-semibold text-[#86EFAC] mt-1 block">
                      {ownsMarathon ? "Unlocked ✓" : "Locked"}
                    </span>
                  </div>
                  <button
                    disabled={ownsMarathon || purchasingProduct === "marathon"}
                    onClick={() => handleBuy("marathon")}
                    className="h-10 px-4 rounded-full bg-[#E9C9FF] text-black text-xs font-bold disabled:opacity-40"
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
              className="w-full h-12 rounded-full bg-white/[0.08] text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        )}
      </main>
    </>
  );
}
