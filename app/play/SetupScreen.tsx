"use client";

import React, { useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { GAME_CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/game-words";
import { Plus, Trash2, ArrowRight, Settings, Users, Gamepad2, Mic, Bot } from "lucide-react";
import { motion } from "framer-motion";

export default function SetupScreen({ onStart }: { onStart: () => void }) {
  const {
    timerSeconds, setTimerSeconds,
    selectedCategories, toggleCategory, setSelectedCategories,
    difficulty, setDifficulty,
    numberOfRounds, setNumberOfRounds,
    playersA, playersB, setPlayers,
    colorA, colorB, setColors,
    scoreGoal, setScoreGoal,
    gameMode, setGameMode,
    feyVoiceEnabled, setFeyVoiceEnabled,
    aiRefereeEnabled, setAiRefereeEnabled,
    startGame
  } = useGameStore();

  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");

  const AVAILABLE_COLORS = [
    { name: "Red", hex: "#EF4444" },
    { name: "Blue", hex: "#3B82F6" },
    { name: "Green", hex: "#10B981" },
    { name: "Orange", hex: "#F97316" },
    { name: "Purple", hex: "#8B5CF6" },
    { name: "Gold", hex: "#F59E0B" }
  ];

  const addPlayerA = () => {
    if (inputA.trim()) {
      setPlayers([...playersA, inputA.trim()], playersB);
      setInputA("");
    }
  };

  const addPlayerB = () => {
    if (inputB.trim()) {
      setPlayers(playersA, [...playersB, inputB.trim()]);
      setInputB("");
    }
  };

  const removePlayerA = (idx: number) => {
    const updated = playersA.filter((_, i) => i !== idx);
    setPlayers(updated, playersB);
  };

  const removePlayerB = (idx: number) => {
    const updated = playersB.filter((_, i) => i !== idx);
    setPlayers(playersA, updated);
  };

  const handleLaunch = () => {
    if (playersA.length === 0 || playersB.length === 0) {
      alert("Both teams need at least one player to begin!");
      return;
    }
    startGame();
    onStart();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[var(--terra)] text-white rounded-2xl shadow-sm">
          <Gamepad2 className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-space font-extrabold text-3xl text-[var(--text)]">Fey Live</h1>
          <p className="text-sm text-[var(--text-dim)]">Pass-the-phone multiplayer party game</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Game Rules & Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] space-y-6">
            <h2 className="font-space font-bold text-lg text-[var(--text)] flex items-center gap-2 pb-3 border-b border-[var(--border-dim)]">
              <Settings className="w-4 h-4 text-[var(--olive)]" /> Match Setup
            </h2>

            {/* Game Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)]">Game Mode</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "classic", name: "Classic Articulate", desc: "Teammates guess the words described by the active speaker" },
                  { id: "masterchef", name: "Masterchef Challenge", desc: "One describer for both teams; first team to guess wins the point" }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setGameMode(mode.id as "classic" | "masterchef")}
                    className={`p-3 rounded-2xl font-space transition-all border text-left flex flex-col justify-between h-20 cursor-pointer ${
                      gameMode === mode.id
                        ? "bg-[var(--olive)] border-[var(--olive)] text-white shadow-sm"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:bg-[var(--border-dim)]/20"
                    }`}
                  >
                    <span className="font-extrabold text-xs block">{mode.name}</span>
                    <span className={`text-[9px] leading-tight block mt-1 ${gameMode === mode.id ? "text-white/80" : "text-[var(--text-mute)]"}`}>
                      {mode.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timer Selection */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)]">Round Timer</label>
              <div className="grid grid-cols-3 gap-3">
                {[30, 45, 60].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTimerSeconds(s)}
                    className={`py-3 rounded-2xl font-space font-bold transition-all border ${
                      timerSeconds === s
                        ? "bg-[var(--olive)] border-[var(--olive)] text-white shadow-sm"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:bg-[var(--border-dim)]/20"
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            {/* Rounds Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)]">Number of Rounds</label>
                <span className="text-[10px] text-[var(--text-dim)]">Game ends when rounds complete or target score is reached</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: 3, label: "3 Rounds" },
                  { value: 5, label: "5 Rounds" },
                  { value: 10, label: "10 Rounds" },
                  { value: 999, label: "🏁 Until Finish" }
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setNumberOfRounds(r.value)}
                    className={`py-3 px-2 rounded-2xl font-space font-bold text-xs transition-all border cursor-pointer ${
                      numberOfRounds === r.value
                        ? "bg-[var(--olive)] border-[var(--olive)] text-white shadow-sm"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:bg-[var(--border-dim)]/20"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)]">Word Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {(["easy", "mixed", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-3 rounded-2xl font-space font-bold capitalize transition-all border cursor-pointer ${
                      difficulty === d
                        ? "bg-[var(--olive)] border-[var(--olive)] text-white shadow-sm"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:bg-[var(--border-dim)]/20"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Score Goal Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)]">Target Score (Spaces to Finish)</label>
                <span className="text-[10px] text-[var(--text-dim)]">Board size & winning goal</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { goal: 30, label: "30 pts (Quick)" },
                  { goal: 50, label: "50 pts (Standard)" },
                  { goal: 100, label: "100 pts (Marathon)" }
                ].map((g) => (
                  <button
                    key={g.goal}
                    type="button"
                    onClick={() => {
                      setScoreGoal(g.goal);
                      // Auto-suggest reasonable rounds for 100 pts if set to low rounds
                      if (g.goal === 100 && (numberOfRounds === 3 || numberOfRounds === 5)) {
                        setNumberOfRounds(999); // Switch to 'Until Finish'
                      }
                    }}
                    className={`py-3 px-2 rounded-2xl font-space font-bold text-xs transition-all border cursor-pointer ${
                      scoreGoal === g.goal
                        ? "bg-[var(--olive)] border-[var(--olive)] text-white shadow-sm"
                        : "bg-[var(--bg-card)] border-[var(--border-dim)] text-[var(--text)] hover:bg-[var(--border-dim)]/20"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Selection */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-wider font-bold text-[var(--text-mute)]">Word Categories</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategories([...GAME_CATEGORIES])}
                    className="text-[10px] uppercase font-bold text-[var(--olive)] hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-[10px] text-[var(--text-mute)]">|</span>
                  <button
                    onClick={() => setSelectedCategories(["Random"])}
                    className="text-[10px] uppercase font-bold text-[var(--olive)] hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GAME_CATEGORIES.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  const color = CATEGORY_COLORS[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`flex items-center gap-2 p-3 rounded-2xl text-left border transition-all ${
                        active
                          ? "bg-[var(--bg-card)] shadow-sm font-semibold"
                          : "opacity-45 hover:opacity-75"
                      }`}
                      style={{
                        borderColor: active ? color : "var(--border-dim)",
                        borderWidth: active ? "2px" : "1px"
                      }}
                    >
                      <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                      <div className="flex flex-col">
                        <span className="text-xs text-[var(--text)]">{cat}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Teams roster setting */}
        <div className="space-y-6">
          <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] flex flex-col gap-6">
            <h2 className="font-space font-bold text-lg text-[var(--text)] flex items-center gap-2 pb-3 border-b border-[var(--border-dim)]">
              <Users className="w-4 h-4 text-[var(--terra)]" /> Team Rosters
            </h2>

            {/* Team A */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--terra)]" style={{ color: colorA }}>Team Alpha</span>
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colorA }} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Player name..."
                  value={inputA}
                  onChange={(e) => setInputA(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPlayerA()}
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text)] focus:outline-none focus:border-[var(--active-color)]"
                  style={{ "--active-color": colorA } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={addPlayerA}
                  className="p-2 text-white rounded-xl hover:opacity-90"
                  style={{ backgroundColor: colorA }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Team A Color Picker */}
              <div className="space-y-1.5 pb-2">
                <label className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-mute)] block">Team Color</label>
                <div className="flex gap-2">
                  {AVAILABLE_COLORS.map((c) => {
                    const isSelected = colorA === c.hex;
                    const isTaken = colorB === c.hex;
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        disabled={isTaken}
                        onClick={() => setColors(c.hex, colorB)}
                        className={`w-5.5 h-5.5 rounded-full border transition-all relative ${
                          isSelected ? "scale-110 shadow-sm border-[var(--text)]" : "opacity-80 border-transparent hover:opacity-100"
                        }`}
                        style={{
                          backgroundColor: c.hex,
                          cursor: isTaken ? "not-allowed" : "pointer",
                          opacity: isTaken ? 0.15 : 1
                        }}
                        title={isTaken ? `${c.name} (Taken)` : c.name}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {playersA.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-[var(--bg-card)]/60 px-3 py-1.5 rounded-xl border border-[var(--border-dim)] text-xs">
                    <span className="text-[var(--text)] font-medium">{p}</span>
                    <button
                      type="button"
                      onClick={() => removePlayerA(i)}
                      className="text-[var(--text-mute)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team B */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--olive)]" style={{ color: colorB }}>Team Omega</span>
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colorB }} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Player name..."
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPlayerB()}
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-dim)] text-[var(--text)] focus:outline-none focus:border-[var(--active-color)]"
                  style={{ "--active-color": colorB } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={addPlayerB}
                  className="p-2 text-white rounded-xl hover:opacity-90"
                  style={{ backgroundColor: colorB }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Team B Color Picker */}
              <div className="space-y-1.5 pb-2">
                <label className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-mute)] block">Team Color</label>
                <div className="flex gap-2">
                  {AVAILABLE_COLORS.map((c) => {
                    const isSelected = colorB === c.hex;
                    const isTaken = colorA === c.hex;
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        disabled={isTaken}
                        onClick={() => setColors(colorA, c.hex)}
                        className={`w-5.5 h-5.5 rounded-full border transition-all relative ${
                          isSelected ? "scale-110 shadow-sm border-[var(--text)]" : "opacity-80 border-transparent hover:opacity-100"
                        }`}
                        style={{
                          backgroundColor: c.hex,
                          cursor: isTaken ? "not-allowed" : "pointer",
                          opacity: isTaken ? 0.15 : 1
                        }}
                        title={isTaken ? `${c.name} (Taken)` : c.name}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {playersB.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-[var(--bg-card)]/60 px-3 py-1.5 rounded-xl border border-[var(--border-dim)] text-xs">
                    <span className="text-[var(--text)] font-medium">{p}</span>
                    <button
                      type="button"
                      onClick={() => removePlayerB(i)}
                      className="text-[var(--text-mute)] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Features — Opt-in */}
          <div className="surface rounded-3xl p-6 border border-[var(--border-dim)] space-y-4">
            <h2 className="font-space font-bold text-base text-[var(--text)] flex items-center gap-2 pb-3 border-b border-[var(--border-dim)]">
              <Bot className="w-4 h-4 text-[var(--olive)]" /> Fey AI Features
              <span className="ml-auto text-[10px] uppercase font-bold text-[var(--text-mute)] border border-[var(--border-dim)] rounded-full px-2 py-0.5">Optional</span>
            </h2>

            {/* Voice Host toggle */}
            <button
              type="button"
              onClick={() => setFeyVoiceEnabled(!feyVoiceEnabled)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                feyVoiceEnabled
                  ? "bg-[var(--olive)]/10 border-[var(--olive)]/40"
                  : "bg-[var(--bg-card)] border-[var(--border-dim)] hover:border-[var(--olive)]/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                feyVoiceEnabled ? "bg-[var(--olive)] text-white" : "bg-[var(--bg)] text-[var(--text-mute)]"
              }`}>
                <Mic className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-space font-bold text-sm text-[var(--text)]">🎤 Fey Voice Host</p>
                <p className="text-[11px] text-[var(--text-dim)] leading-snug mt-0.5">Fey announces round starts, countdowns, correct answers and game results out loud.</p>
              </div>
              <div className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 flex-shrink-0 ${
                feyVoiceEnabled ? "bg-[var(--olive)]" : "bg-[var(--border-dim)]"
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  feyVoiceEnabled ? "translate-x-4" : "translate-x-0"
                }`} />
              </div>
            </button>

            {/* AI Referee toggle */}
            <button
              type="button"
              onClick={() => setAiRefereeEnabled(!aiRefereeEnabled)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                aiRefereeEnabled
                  ? "bg-[var(--olive)]/10 border-[var(--olive)]/40"
                  : "bg-[var(--bg-card)] border-[var(--border-dim)] hover:border-[var(--olive)]/30"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                aiRefereeEnabled ? "bg-[var(--olive)] text-white" : "bg-[var(--bg)] text-[var(--text-mute)]"
              }`}>
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-space font-bold text-sm text-[var(--text)]">🤖 AI Referee</p>
                <p className="text-[11px] text-[var(--text-dim)] leading-snug mt-0.5">Fey validates borderline guesses and flags rule violations automatically during play.</p>
              </div>
              <div className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 flex-shrink-0 ${
                aiRefereeEnabled ? "bg-[var(--olive)]" : "bg-[var(--border-dim)]"
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  aiRefereeEnabled ? "translate-x-4" : "translate-x-0"
                }`} />
              </div>
            </button>
          </div>

          {/* Launch Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLaunch}
            className="w-full bg-[var(--terra)] text-white py-4 rounded-2xl font-space font-extrabold text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            Start Game <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
