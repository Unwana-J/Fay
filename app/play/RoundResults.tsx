"use client";

import React, { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { Check, X, ArrowRight, Brain, AlertCircle, Mic, Loader2, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFeyVoice } from "@/lib/useFeyVoice";
import { useSpeechInput } from "@/lib/useSpeechInput";

export default function RoundResults({
  onNextTurn,
  onGameOver,
  onMinimize,
  onPause
}: {
  onNextTurn: () => void;
  onGameOver: () => void;
  onMinimize?: () => void;
  onPause?: () => void;
}) {
  const {
    turnsHistory,
    turnOrder,
    currentTurnIndex,
    currentRoundIndex,
    numberOfRounds,
    awardCoachBonus,
    gameMode,
    colorA,
    colorB,
    scoreGoal,
    aiRefereeEnabled,
    getScore,
    getActiveTeams,
    getTeamName,
    teamNameA,
    teamNameB,
    toggleDisputeWordInLastTurn,
    toggleAwardPassedWordInLastTurn
  } = useGameStore();

  const isMasterchef = gameMode === "masterchef";

  // Get stats from the turn that just ended
  const lastTurn = turnsHistory[turnsHistory.length - 1];
  const secondLastTurn = turnsHistory[turnsHistory.length - 2];

  if (!lastTurn) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-[var(--text-mute)]" />
        <p className="text-sm text-[var(--text-dim)]">No turn history found.</p>
      </div>
    );
  }

  // Aggregate values for Masterchef mode splits
  const correctWords = isMasterchef
    ? [...(secondLastTurn?.correctWords || []), ...(lastTurn?.correctWords || [])]
    : lastTurn.correctWords;

  const skippedWords = isMasterchef
    ? [...(secondLastTurn?.skippedWords || []), ...(lastTurn?.skippedWords || [])]
    : lastTurn.skippedWords;

  const disputedWords = isMasterchef
    ? [...(secondLastTurn?.disputedWords || []), ...(lastTurn?.disputedWords || [])]
    : (lastTurn.disputedWords || []);

  const awardedWords = isMasterchef
    ? [...(secondLastTurn?.awardedWords || []), ...(lastTurn?.awardedWords || [])]
    : (lastTurn.awardedWords || []);

  const totalTime = isMasterchef
    ? Math.max(secondLastTurn?.totalTime || 0, lastTurn?.totalTime || 0)
    : lastTurn.totalTime;

  // Calculate simulated feedback metrics factoring disputes and awards
  const netCorrectCount = Math.max(0, correctWords.length - disputedWords.length + awardedWords.length);
  const totalAttempts = correctWords.length + skippedWords.length;
  const accuracy = totalAttempts > 0 ? Math.round((netCorrectCount / totalAttempts) * 100) : 0;
  const wordsPerMin = Math.round(netCorrectCount / (totalTime / 60 || 1));

  // Determine feedback copy based on raw stats
  const getSimulatedCoaching = () => {
    let pace = "Optimal speaking rhythm";
    let advice = "Great vocabulary pacing and explanation flow.";
    let fillerCount = Math.floor(Math.random() * 4) + 1; // Simulated fillers

    if (wordsPerMin > 14) {
      pace = "Very fast speaking pace";
      advice = "Slow down slightly to let teammates process complex clues.";
      fillerCount = Math.floor(Math.random() * 6) + 4;
    } else if (wordsPerMin < 6) {
      pace = "Deliberate and slow pace";
      advice = "Try explaining with immediate analogies to increase guessing speed.";
      fillerCount = Math.floor(Math.random() * 3);
    }

    if (skippedWords.length > 2) {
      advice += " Avoid skipping early; try at least one clue strategy first.";
    }

    return { pace, advice, fillerCount };
  };

  const coachStats = getSimulatedCoaching();

  // Determine if the full round of turns is complete
  const isRoundOver = currentTurnIndex === 0; // Zustand store advances index. If reset to 0, current round just bumped.

  // Calculate scores to check if Target Score was reached
  const activeTeams = getActiveTeams();
  const reachedGoal = activeTeams.some((t) => getScore(t.id) >= scoreGoal);
  const reachedMaxRounds = numberOfRounds !== 999 && isRoundOver && currentRoundIndex >= numberOfRounds;
  const isGameOver = reachedGoal || reachedMaxRounds;

  const nextSpeaker = turnOrder[currentTurnIndex];
  const { announce } = useFeyVoice();

  // --- Real AI Pronunciation Coaching ---
  interface CoachResult {
    pronunciationScore: number;
    paceScore: number;
    clarityScore: number;
    overallScore: number;
    paceFeedback: string;
    pronunciationTip: string;
    vocabularyTip: string;
    strength: string;
    improvement: string;
    challengeWords: string[];
  }
  const [coaching, setCoaching] = useState<CoachResult | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [pronunciationWord, setPronunciationWord] = useState<string | null>(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<string | null>(null);
  const activePronunciationWordRef = React.useRef<string | null>(null);

  const pronunciationMic = useSpeechInput({
    onFinalTranscript: async (spoken) => {
      const target = activePronunciationWordRef.current || pronunciationWord;
      if (!target) return;
      // Compare what they said vs the challenge word
      const cleanSpoken = spoken.toLowerCase().trim();
      const cleanTarget = target.toLowerCase().trim();
      const similar = cleanSpoken === cleanTarget;
      const prefix = cleanTarget.length >= 4 ? cleanTarget.slice(0, 4) : cleanTarget;
      const phonetic = cleanSpoken.includes(prefix);
      if (similar) {
        setPronunciationFeedback(`✅ "${spoken}" — clear pronunciation!`);
      } else if (phonetic) {
        setPronunciationFeedback(`🔊 "${spoken}" — close phonetic match. Fey would accept this.`);
      } else {
        setPronunciationFeedback(`⚠️ "${spoken}" — too different. Try pronouncing "${target}" more slowly.`);
      }
    },
  });

  // Fetch real AI coaching on mount if enabled
  useEffect(() => {
    if (!aiRefereeEnabled || !lastTurn) return;
    setCoachLoading(true);
    fetch("/api/ai/pronunciation-coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        speakerName: lastTurn.playerName,
        wordsCorrect: correctWords,
        wordsSkipped: skippedWords,
        timeSeconds: totalTime,
        wordsPerMinute: wordsPerMin,
        phoneticMatches: [],
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Network response was not ok");
        return r.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCoaching(data);
      })
      .catch(() => setCoaching(null))
      .finally(() => setCoachLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Announce scores once the results screen mounts
  useEffect(() => {
    const t = setTimeout(() => {
      if (isGameOver) {
        const ranked = activeTeams.map(t => ({ name: t.name, score: getScore(t.id) })).sort((a, b) => b.score - a.score);
        const winner = ranked[0]?.name || "Winner";
        const winScore = ranked[0]?.score || 0;
        announce({ type: "gameOver", winner, score: winScore });
      } else {
        announce({
          type: "roundSummary",
          scoreA: getScore("A"),
          scoreB: getScore("B"),
          nextSpeaker: nextSpeaker?.name
        });
      }
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Turn Summary Title */}
      <div className="text-center space-y-2">
        <h2 className="font-space font-extrabold text-3xl text-[var(--text)]">Turn Complete!</h2>
        <p className="text-sm text-[var(--text-dim)]">
          Scoreboard summary for <span className="font-semibold text-[var(--text)]">{lastTurn.playerName}</span> {isMasterchef ? "(Masterchef describer)" : `(${getTeamName(lastTurn.team)})`}
        </p>
      </div>

      {/* Special Space Landing Celebrations */}
      {(() => {
        const alerts: { teamName: string; space: string; desc: string; icon: string; color: string }[] = [];

        activeTeams.forEach((t) => {
          const tScore = getScore(t.id);
          const landedOnBonus = isMasterchef
            ? (t.id === lastTurn.team && Boolean(lastTurn?.note?.includes("Bonus Space")))
            : (lastTurn.team === t.id && Boolean(lastTurn.note?.includes("Bonus Space")));

          if (landedOnBonus) {
            alerts.push({ teamName: t.name, space: "Bonus Space", desc: "+1 Extra point awarded immediately!", icon: "⭐", color: t.color });
          }
          if (tScore > 0 && tScore < scoreGoal - 1 && tScore % 7 === 2 && (isMasterchef || lastTurn.team === t.id)) {
            alerts.push({ teamName: t.name, space: "Double Move Space", desc: "Next turn points count double!", icon: "🔥", color: t.color });
          }
          if (tScore > 0 && tScore < scoreGoal - 1 && tScore % 7 === 5 && (isMasterchef || lastTurn.team === t.id)) {
            alerts.push({ teamName: t.name, space: "Challenge Space", desc: "Speaking restriction active next turn!", icon: "🧠", color: "rgb(236,72,153)" });
          }
          if (tScore > 0 && tScore < scoreGoal - 1 && tScore % 7 === 4 && (isMasterchef || lastTurn.team === t.id)) {
            alerts.push({ teamName: t.name, space: "Chance Space", desc: "Next turn will start with a Spinner Wheel!", icon: "🎲", color: "var(--text)" });
          }
        });

        if (alerts.length === 0) return null;

        return (
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl border border-[var(--border-dim)] bg-[var(--bg-card)]/50 shadow-xs text-left animate-bounce">
                <span className="text-2xl">{alert.icon}</span>
                <div>
                  <strong className="text-xs uppercase font-space font-black tracking-wide block" style={{ color: alert.color }}>
                    {alert.teamName.toLowerCase().startsWith("team") ? alert.teamName : `Team ${alert.teamName}`} Landed on {alert.space}!
                  </strong>
                  <span className="text-[10px] text-[var(--text-dim)] block leading-tight font-medium mt-0.5">
                    {alert.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Score Summary */}
        <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] space-y-6">
          <div className="flex justify-around items-center text-center">
            <div>
              <span className="text-4xl font-space font-black text-[var(--olive)]">
                {netCorrectCount}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-mute)] block mt-1">
                Net Scored
              </span>
              {(disputedWords.length > 0 || awardedWords.length > 0) && (
                <span className="text-[9px] text-[var(--text-dim)] font-mono block">
                  {correctWords.length} raw {disputedWords.length > 0 ? `-${disputedWords.length}` : ""} {awardedWords.length > 0 ? `+${awardedWords.length}` : ""}
                </span>
              )}
            </div>
            <div className="w-[1px] h-10 bg-[var(--border-dim)]" />
            <div>
              <span className="text-4xl font-space font-black text-[var(--text-mute)]">
                {skippedWords.length}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-mute)] block mt-1">Skipped</span>
            </div>
            <div className="w-[1px] h-10 bg-[var(--border-dim)]" />
            <div>
              <span className="text-4xl font-space font-black text-[var(--text)]">
                {accuracy}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-mute)] block mt-1">Accuracy</span>
            </div>
          </div>

          {/* Masterchef Points Split display */}
          {isMasterchef && (
            <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] uppercase font-bold tracking-wider font-space border-t border-[var(--border-dim)]/40">
              <div className="bg-[var(--bg-card)]/50 border border-[var(--border-dim)] p-2.5 rounded-2xl text-center">
                <span style={{ color: colorA }} className="block text-lg font-black">{secondLastTurn?.correctWords.length || 0}</span>
                <span className="text-[var(--text-mute)] mt-0.5 block truncate">{teamNameA} Points</span>
              </div>
              <div className="bg-[var(--bg-card)]/50 border border-[var(--border-dim)] p-2.5 rounded-2xl text-center">
                <span style={{ color: colorB }} className="block text-lg font-black">{lastTurn?.correctWords.length || 0}</span>
                <span className="text-[var(--text-mute)] mt-0.5 block truncate">{teamNameB} Points</span>
              </div>
            </div>
          )}

          {/* Word By Word Breakdown with Interactive Disputes & Awards */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border-dim)]/40">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-[var(--text-mute)]">
                Word Review Log
              </h3>
              <span className="text-[10px] text-[var(--text-dim)] font-medium">
                Tap to dispute or claim
              </span>
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
              {correctWords.map((word, i) => {
                const isDisputed = disputedWords.includes(word);
                if (isDisputed) {
                  return (
                    <div key={`c-${i}`} className="flex items-center justify-between bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-2 rounded-xl border border-red-500/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="line-through font-medium opacity-70 truncate">{word}</span>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-300 shrink-0">
                          Disputed (-1)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleDisputeWordInLastTurn(word)}
                        className="text-[10px] font-bold text-red-600 dark:text-red-300 underline hover:opacity-80 cursor-pointer shrink-0 ml-2"
                      >
                        Restore
                      </button>
                    </div>
                  );
                }
                return (
                  <div key={`c-${i}`} className="flex items-center justify-between bg-green-500/5 text-green-700 dark:text-green-400 px-3 py-2 rounded-xl border border-green-500/10">
                    <span className="font-semibold truncate">{word}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <button
                        type="button"
                        onClick={() => toggleDisputeWordInLastTurn(word)}
                        className="text-[10px] font-semibold text-[var(--text-mute)] hover:text-red-500 underline transition cursor-pointer"
                        title="Flag rule violation / void point"
                      >
                        Dispute
                      </button>
                    </div>
                  </div>
                );
              })}

              {skippedWords.map((word, i) => {
                const isAwarded = awardedWords.includes(word);
                if (isAwarded) {
                  return (
                    <div key={`s-${i}`} className="flex items-center justify-between bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-2 rounded-xl border border-emerald-500/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold truncate">{word}</span>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                          Awarded (+1)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleAwardPassedWordInLastTurn(word)}
                        className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 underline hover:opacity-80 cursor-pointer shrink-0 ml-2"
                      >
                        Revert
                      </button>
                    </div>
                  );
                }
                return (
                  <div key={`s-${i}`} className="flex items-center justify-between bg-amber-500/5 text-amber-700 dark:text-amber-400 px-3 py-2 rounded-xl border border-amber-500/10">
                    <span className="font-semibold truncate">{word}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <X className="w-4 h-4 text-amber-600" />
                      <button
                        type="button"
                        onClick={() => toggleAwardPassedWordInLastTurn(word)}
                        className="text-[10px] font-semibold text-[var(--text-mute)] hover:text-emerald-600 underline transition cursor-pointer"
                        title="Claim buzzer beater (+1 point)"
                      >
                        Claim +1
                      </button>
                    </div>
                  </div>
                );
              })}

              {totalAttempts === 0 && (
                <div className="text-center py-6 text-[var(--text-mute)]">
                  No words attempted this round.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: AI Coaching Feedback */}
        <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] flex flex-col gap-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-[var(--text-mute)] pb-2 border-b border-[var(--border-dim)]/40 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-[var(--terra)]" /> AI Pronunciation Coach
          </h3>

          {/* Loading state */}
          {coachLoading && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-dim)] py-4">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--olive)]" />
              Fey is analysing {lastTurn.playerName}’s speaking…
            </div>
          )}

          {/* Real AI coaching */}
          {coaching && !coachLoading && (
            <div className="space-y-4 text-xs">
              {/* Score grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Pronunciation", score: coaching.pronunciationScore ?? 0 },
                  { label: "Pace", score: coaching.paceScore ?? 0 },
                  { label: "Clarity", score: coaching.clarityScore ?? 0 },
                ].map(({ label, score }) => (
                  <div key={label} className="bg-[var(--bg-card)]/50 p-2.5 rounded-xl border border-[var(--border-dim)]/40 text-center">
                    <span className="text-[9px] text-[var(--text-mute)] block">{label}</span>
                    <span className={`font-space font-bold text-sm ${
                      score >= 8 ? "text-emerald-400" : score >= 6 ? "text-amber-400" : "text-red-400"
                    }`}>{score.toFixed(1)}</span>
                  </div>
                ))}
              </div>

              {/* Pace feedback */}
              <div className="space-y-1">
                <span className="text-[10px] text-[var(--text-mute)] block uppercase font-bold tracking-wider">Speaking Pace</span>
                <p className="text-[var(--text-dim)] leading-relaxed">{coaching.paceFeedback} ({wordsPerMin} words/min)</p>
              </div>

              {/* Pronunciation tip */}
              <div className="space-y-1">
                <span className="text-[10px] text-[var(--text-mute)] block uppercase font-bold tracking-wider">🔊 Pronunciation Tip</span>
                <p className="text-[var(--text-dim)] leading-relaxed italic">“{coaching.pronunciationTip}”</p>
              </div>

              {/* Strength + Improvement */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-2.5">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase block">✓ Strength</span>
                  <p className="text-[var(--text-dim)] text-[11px] mt-0.5 leading-snug">{coaching.strength}</p>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-2.5">
                  <span className="text-[9px] text-amber-400 font-bold uppercase block">▲ Improve</span>
                  <p className="text-[var(--text-dim)] text-[11px] mt-0.5 leading-snug">{coaching.improvement}</p>
                </div>
              </div>

              {/* Challenge words — practice pronunciation */}
              {coaching.challengeWords?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-[var(--text-mute)] block uppercase font-bold tracking-wider">Practice These Words</span>
                  <div className="space-y-1.5">
                    {coaching.challengeWords.map((word) => (
                      <div key={word} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            activePronunciationWordRef.current = word;
                            setPronunciationWord(word);
                            setPronunciationFeedback(null);
                            pronunciationMic.start();
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-space font-bold transition-all cursor-pointer ${
                            pronunciationWord === word && pronunciationMic.isListening
                              ? "bg-[var(--olive)] text-white border-[var(--olive)] shadow-[0_0_10px_var(--olive)]"
                              : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:border-[var(--olive)]/40"
                          }`}
                        >
                          <Mic className="w-3 h-3" />
                          {word}
                          {pronunciationWord === word && pronunciationMic.isListening && (
                            <motion.span
                              className="inline-block w-1.5 h-1.5 rounded-full bg-white"
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            />
                          )}
                        </button>
                        {pronunciationWord === word && pronunciationFeedback && (
                          <p className="text-[10px] text-[var(--text-dim)] flex-1">{pronunciationFeedback}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-[var(--text-mute)]">Tap a word, say it aloud — Fey checks your pronunciation.</p>
                </div>
              )}
            </div>
          )}

          {/* Fallback simulated coaching if AI off */}
          {!coaching && !coachLoading && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--bg-card)]/50 p-3 rounded-2xl border border-[var(--border-dim)]/40">
                  <span className="text-[10px] text-[var(--text-mute)] block">Clarity Index</span>
                  <span className="font-space font-bold text-sm text-[var(--text)]">9.4/10</span>
                </div>
                <div className="bg-[var(--bg-card)]/50 p-3 rounded-2xl border border-[var(--border-dim)]/40">
                  <span className="text-[10px] text-[var(--text-mute)] block">Filler Words</span>
                  <span className="font-space font-bold text-sm text-[var(--text)]">{coachStats.fillerCount} found</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[var(--text-mute)] block">Speaking Pace</span>
                <p className="font-medium text-[var(--text)]">{coachStats.pace} ({wordsPerMin} words/min)</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[var(--text-mute)] block">Coach Recommendation</span>
                <p className="text-[var(--text-dim)] leading-relaxed italic">“{coachStats.advice}”</p>
              </div>
              <p className="text-[9px] text-[var(--text-mute)]">Enable AI Referee in Setup for personalised pronunciation coaching.</p>
            </div>
          )}

          {/* Next Steps / CTAs */}
          <div className="pt-6 border-t border-[var(--border-dim)]/40 mt-6 space-y-3">
            {/* AI Coach Bonus point notification */}
            {coachStats.fillerCount <= 2 && wordsPerMin >= 6 && (
              <div className="bg-[var(--olive)]/10 border border-[var(--olive-dim)]/30 rounded-2xl p-3 flex items-center gap-2.5 text-left mb-2 animate-bounce">
                <span className="text-base">✨</span>
                <div>
                  <strong className="text-[10px] text-[var(--text)] block uppercase tracking-wider font-space">AI Coach Bonus!</strong>
                  <span className="text-[9px] text-[var(--text-dim)] block leading-tight">
                    +1 point awarded to {getTeamName(lastTurn.team)} for clear articulation.
                  </span>
                </div>
              </div>
            )}

            {isGameOver ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const qualifies = coachStats.fillerCount <= 2 && wordsPerMin >= 6;
                    if (qualifies) {
                      awardCoachBonus(lastTurn.team, 1, "AI Coach Clarity Bonus");
                    }
                    onGameOver();
                  }}
                  className="w-full bg-[var(--terra)] text-white py-3.5 rounded-2xl font-space font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                >
                  View Final Standings <ArrowRight className="w-4 h-4" />
                </button>
                {onMinimize && (
                  <button
                    type="button"
                    onClick={onMinimize}
                    className="w-full py-2.5 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--border-dim)]/30 text-[var(--text)] font-space font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    👁️ Peek at Board
                  </button>
                )}
                {onPause && (
                  <button
                    type="button"
                    onClick={onPause}
                    className="w-full py-2.5 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--border-dim)]/30 text-[var(--text-dim)] hover:text-[var(--text)] font-space font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    title="Pause game and save match progress"
                  >
                    <Pause className="w-3.5 h-3.5 text-[var(--olive)]" />
                    Pause & Save Match
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-[var(--bg-card)]/60 p-3 rounded-2xl border border-[var(--border-dim)] text-center text-xs">
                  <span className="text-[var(--text-mute)]">Next up: </span>
                  <strong className="text-[var(--text)]">{nextSpeaker?.name}</strong> ({nextSpeaker ? getTeamName(nextSpeaker.team) : ""})
                </div>
                <button
                  onClick={() => {
                    const qualifies = coachStats.fillerCount <= 2 && wordsPerMin >= 6;
                    if (qualifies) {
                      awardCoachBonus(lastTurn.team, 1, "AI Coach Clarity Bonus");
                    }
                    onNextTurn();
                  }}
                  className="w-full bg-[var(--olive)] text-white py-3.5 rounded-2xl font-space font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                >
                  Continue Round <ArrowRight className="w-4 h-4" />
                </button>
                {onMinimize && (
                  <button
                    type="button"
                    onClick={onMinimize}
                    className="w-full py-2.5 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--border-dim)]/30 text-[var(--text)] font-space font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    👁️ Peek at Board
                  </button>
                )}
                {onPause && (
                  <button
                    type="button"
                    onClick={onPause}
                    className="w-full py-2.5 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-card)] hover:bg-[var(--border-dim)]/30 text-[var(--text-dim)] hover:text-[var(--text)] font-space font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    title="Pause game and save match progress"
                  >
                    <Pause className="w-3.5 h-3.5 text-[var(--olive)]" />
                    Pause & Save Match
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
