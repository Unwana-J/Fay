"use client";

import React, { useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { HelpCircle, RefreshCcw } from "lucide-react";
import { useFeyVoice } from "@/lib/useFeyVoice";

interface SpinnerViewProps {
  activeTeam: "A" | "B";
  teamColor: string;
  onComplete: (modifier: "none" | "double" | "extra-time", targetTeam: "A" | "B", spaces: number, label: string) => void;
}

interface SpinnerOption {
  label: string;
  color: string;
  textColor: string;
  icon: string;
  action: (team: "A" | "B") => { modifier: "none" | "double" | "extra-time"; targetTeam: "A" | "B"; spaces: number; label: string };
}

export default function SpinnerView({ activeTeam, teamColor, onComplete }: SpinnerViewProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const controls = useAnimation();
  const { announce } = useFeyVoice();

  const options: SpinnerOption[] = [
    { 
      label: "Fast Forward +2", 
      color: "#3B6360", 
      textColor: "#ffffff",
      icon: "🚀", 
      action: (team) => ({ modifier: "none", targetTeam: team, spaces: 2, label: "Spinner: Fast Forward +2!" }) 
    },
    { 
      label: "Double Points", 
      color: "#A67C1E", 
      textColor: "#ffffff",
      icon: "🔥", 
      action: (team) => ({ modifier: "double", targetTeam: team, spaces: 0, label: "Spinner: Double Points Active!" }) 
    },
    { 
      label: "Opponent Back -2", 
      color: "#8C6239", 
      textColor: "#ffffff",
      icon: "💨", 
      action: (team) => ({ modifier: "none", targetTeam: team === "A" ? "B" : "A", spaces: -2, label: "Spinner: Opponent Setback -2!" }) 
    },
    { 
      label: "Extra 15 Seconds", 
      color: "#5A4565", 
      textColor: "#ffffff",
      icon: "⏰", 
      action: (team) => ({ modifier: "extra-time", targetTeam: team, spaces: 0, label: "Spinner: Extra 15 Seconds!" }) 
    },
    { 
      label: "Bonus +1 Space", 
      color: "#6B4C7A", 
      textColor: "#ffffff",
      icon: "⭐", 
      action: (team) => ({ modifier: "none", targetTeam: team, spaces: 1, label: "Spinner: Bonus Space +1!" }) 
    },
    { 
      label: "No Action", 
      color: "#4E5460", 
      textColor: "#ffffff",
      icon: "🤷‍♂️", 
      action: (team) => ({ modifier: "none", targetTeam: team, spaces: 0, label: "Spinner: No Action" }) 
    },
  ];

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    // Pick a random winner option
    const winningIndex = Math.floor(Math.random() * options.length);
    const targetOption = options[winningIndex];

    // Calculate rotation: 5 full spins (1800deg) + offset to align winning section to top
    // 360 / 6 options = 60 degrees per wedge.
    // Index 0 represents the segment centered at 0-60 deg.
    // To land on index I at the TOP indicator (which is -90 deg from start, or offset 270 deg):
    const degPerWedge = 360 / options.length;
    const targetDeg = 1800 + (360 - winningIndex * degPerWedge) - 90;

    await controls.start({
      rotate: targetDeg,
      transition: { duration: 4.5, ease: [0.15, 0.85, 0.35, 1] }
    });

    setResult(targetOption.label);
    setIsSpinning(false);
    announce({ type: "spinResult", modifier: targetOption.label });

    // Run action callback after a small delay for dramatic effect
    setTimeout(() => {
      const outcome = targetOption.action(activeTeam);
      onComplete(outcome.modifier, outcome.targetTeam, outcome.spaces, outcome.label);
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto text-center space-y-8 py-6 relative">
      <div className="space-y-2">
        <span
          className="text-[10px] uppercase font-space font-extrabold tracking-widest px-3 py-1 rounded-full border"
          style={{
            borderColor: `${teamColor}40`,
            color: teamColor,
            backgroundColor: `${teamColor}08`
          }}
        >
          Chance Landed: Team {activeTeam}
        </span>
        <h2 className="font-space font-black text-3xl text-[var(--text)] tracking-tight">
          Spin the Wheel!
        </h2>
        <p className="text-xs text-[var(--text-dim)] max-w-xs mx-auto leading-relaxed">
          Spin to win power-ups, skip categories, or push back the opposing team.
        </p>
      </div>

      {/* Spinner Wheel container */}
      <div className="relative w-72 h-72 mx-auto flex items-center justify-center select-none pt-4">
        {/* Top Indicator Arrow */}
        <div className="absolute top-0 z-30 transform -translate-y-2 text-3xl text-[var(--text)]">
          ▼
        </div>

        {/* Outer Ring Shadow Decorator */}
        <div className="absolute inset-2 rounded-full border-4 border-[var(--border-dim)] shadow-xl pointer-events-none z-10 animate-pulse" />

        {/* The Animated Wheel SVG */}
        <motion.div
          animate={controls}
          initial={{ rotate: 0 }}
          className="w-64 h-64 rounded-full overflow-hidden shadow-2xl relative bg-[var(--bg-card)] border border-[var(--border-dim)]"
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {options.map((opt, i) => {
              // 6 wedges: 60 degrees each
              const startAngle = i * 60;
              const endAngle = (i + 1) * 60;
              
              // Helper coordinates for SVG pie segments
              const rad = Math.PI / 180;
              const x1 = 50 + 50 * Math.cos(startAngle * rad);
              const y1 = 50 + 50 * Math.sin(startAngle * rad);
              const x2 = 50 + 50 * Math.cos(endAngle * rad);
              const y2 = 50 + 50 * Math.sin(endAngle * rad);

              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

              // Rotate label text inside the center of each wedge
              const midAngle = startAngle + 30;
              const textX = 50 + 32 * Math.cos(midAngle * rad);
              const textY = 50 + 32 * Math.sin(midAngle * rad);

              return (
                <g key={i}>
                  <path d={pathData} fill={opt.color} stroke="var(--border-dim)" strokeWidth="0.5" />
                  <text
                    x={textX}
                    y={textY}
                    fill={opt.textColor}
                    fontSize="5.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                  >
                    {opt.icon}
                  </text>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* Inner Hub / Pin Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || !!result}
          className="absolute w-16 h-16 rounded-full bg-[var(--bg-card)] border-4 border-[var(--border-dim)] hover:border-[var(--text-mute)] shadow-lg hover:shadow-xl flex flex-col items-center justify-center cursor-pointer transition-all z-20 active:scale-95 disabled:cursor-not-allowed"
        >
          {isSpinning ? (
            <RefreshCcw className="w-5 h-5 text-[var(--text-mute)] animate-spin" />
          ) : (
            <span className="text-[10px] font-space font-black text-[var(--text)] leading-none text-center">
              TAP<br/>SPIN
            </span>
          )}
        </button>
      </div>

      {/* Result Display Overlay */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="p-4 bg-[var(--bg-card)] border border-[var(--border-dim)] rounded-2xl max-w-xs mx-auto shadow-md"
          >
            <span className="text-[10px] text-[var(--text-mute)] uppercase tracking-wider block font-bold">Outcome</span>
            <span className="font-space font-black text-lg text-[var(--text)]">{result}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
