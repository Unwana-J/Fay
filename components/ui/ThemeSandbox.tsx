"use client";

import { useEffect, useState } from "react";
import { Paintbrush, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Theme {
  id: string;
  name: string;
  desc: string;
  colors: Record<string, string>;
}

const THEMES: Theme[] = [
  {
    id: "burgundy-velvet",
    name: "Burgundy Velvet",
    desc: "Elegant paper editorial & deep red wine.",
    colors: {
      "--bg-base":    "#F4EFE6",
      "--bg-panel":   "#EBE5DA",
      "--bg-card":    "#FDFCFA",
      "--bg-input":   "#DCD5C9",
      "--bg-overlay": "#FDFCFA",
      "--olive":      "#444E2C",
      "--olive-br":   "#5C6A36",
      "--olive-dim":  "#DCD5C9",
      "--olive-text": "#333C1A",
      "--terra":      "#7A1C2E",
      "--terra-dk":   "#58101E",
      "--terra-bg":   "rgba(122,28,46,0.06)",
      "--gold":       "#A67C1E",
      "--gold-bg":    "rgba(166,124,30,0.06)",
      "--red":        "#B53A3A",
      "--red-bg":     "rgba(181,58,58,0.06)",
      "--text":       "#1E2211",
      "--text-dim":   "#525645",
      "--text-mute":  "#828574",
      "--border":     "rgba(68,78,44,0.18)",
      "--border-dim": "rgba(68,78,44,0.08)"
    }
  },
  {
    id: "midnight-aurora",
    name: "Midnight Aurora",
    desc: "Premium dark space & glowing purple.",
    colors: {
      "--bg-base":    "#0D0E16",
      "--bg-panel":   "#131622",
      "--bg-card":    "#1A1E2F",
      "--bg-input":   "#252B44",
      "--bg-overlay": "#1E2237",
      "--olive":      "#3B82F6",
      "--olive-br":   "#60A5FA",
      "--olive-dim":  "#252B44",
      "--olive-text": "#93C5FD",
      "--terra":      "#8B5CF6",
      "--terra-dk":   "#6D28D9",
      "--terra-bg":   "rgba(139,92,246,0.1)",
      "--gold":       "#10B981",
      "--gold-bg":    "rgba(16,185,129,0.1)",
      "--red":        "#EF4444",
      "--red-bg":     "rgba(239,68,68,0.1)",
      "--text":       "#F9FAFB",
      "--text-dim":   "#D1D5DB",
      "--text-mute":  "#6B7280",
      "--border":     "rgba(139,92,246,0.22)",
      "--border-dim": "rgba(139,92,246,0.1)"
    }
  },
  {
    id: "duolingo-forest",
    name: "Duolingo Forest",
    desc: "High-contrast playful green & gold.",
    colors: {
      "--bg-base":    "#F1F5F9",
      "--bg-panel":   "#FFFFFF",
      "--bg-card":    "#FFFFFF",
      "--bg-input":   "#E2E8F0",
      "--bg-overlay": "#FFFFFF",
      "--olive":      "#3B82F6",
      "--olive-br":   "#60A5FA",
      "--olive-dim":  "#E2E8F0",
      "--olive-text": "#1E40AF",
      "--terra":      "#22C55E",
      "--terra-dk":   "#15803D",
      "--terra-bg":   "rgba(34,197,94,0.1)",
      "--gold":       "#EAB308",
      "--gold-bg":    "rgba(234,179,8,0.1)",
      "--red":        "#EF4444",
      "--red-bg":     "rgba(239,68,68,0.1)",
      "--text":       "#0F172A",
      "--text-dim":   "#475569",
      "--text-mute":  "#94A3B8",
      "--border":     "rgba(15,23,42,0.12)",
      "--border-dim": "rgba(15,23,42,0.06)"
    }
  },
  {
    id: "forest-cabin",
    name: "Forest Cabin",
    desc: "Pine green & warm sienna copper.",
    colors: {
      "--bg-base":    "#FAF7F0",
      "--bg-panel":   "#1A2E22",
      "--bg-card":    "#FFFFFF",
      "--bg-input":   "#E3ECE6",
      "--bg-overlay": "#FFFFFF",
      "--olive":      "#2D5A27",
      "--olive-br":   "#3B7A33",
      "--olive-dim":  "#E3ECE6",
      "--olive-text": "#1A3E16",
      "--terra":      "#D35400",
      "--terra-dk":   "#A04000",
      "--terra-bg":   "rgba(211,84,0,0.08)",
      "--gold":       "#D4AC0D",
      "--gold-bg":    "rgba(212,172,13,0.08)",
      "--red":        "#C0392B",
      "--red-bg":     "rgba(192,57,43,0.08)",
      "--text":       "#1C281F",
      "--text-dim":   "#465A4C",
      "--text-mute":  "#7D9685",
      "--border":     "rgba(45,90,39,0.18)",
      "--border-dim": "rgba(45,90,39,0.08)"
    }
  },
  {
    id: "tokyo-cyberpunk",
    name: "Tokyo Cyberpunk",
    desc: "Matte black & hot neon yellow/pink.",
    colors: {
      "--bg-base":    "#0A0A0C",
      "--bg-panel":   "#111115",
      "--bg-card":    "#16161D",
      "--bg-input":   "#22222E",
      "--bg-overlay": "#16161D",
      "--olive":      "#FF007F",
      "--olive-br":   "#FF409F",
      "--olive-dim":  "#22222E",
      "--olive-text": "#FF007F",
      "--terra":      "#E8FF00",
      "--terra-dk":   "#B2C200",
      "--terra-bg":   "rgba(232,255,0,0.1)",
      "--gold":       "#00FFFF",
      "--gold-bg":    "rgba(0,255,255,0.1)",
      "--red":        "#FF3E3E",
      "--red-bg":     "rgba(255,62,62,0.1)",
      "--text":       "#FFFFFF",
      "--text-dim":   "#A5A5B2",
      "--text-mute":  "#5A5A66",
      "--border":     "rgba(232,255,0,0.25)",
      "--border-dim": "rgba(232,255,0,0.1)"
    }
  }
];

export default function ThemeSandbox() {
  const [activeTheme, setActiveTheme] = useState("burgundy-velvet");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("fey-theme-sandbox");
    if (saved) {
      const match = THEMES.find(t => t.id === saved);
      if (match) {
        setActiveTheme(saved);
        applyTheme(match.colors);
      }
    }
  }, []);

  function applyTheme(colors: Record<string, string>) {
    const root = document.documentElement;
    Object.entries(colors).forEach(([variable, value]) => {
      root.style.setProperty(variable, value);
    });
  }

  function handleSelectTheme(theme: Theme) {
    setActiveTheme(theme.id);
    localStorage.setItem("fey-theme-sandbox", theme.id);
    applyTheme(theme.colors);
  }

  return (
    <div 
      className="w-full px-8 py-3 flex items-center justify-between border-b flex-wrap gap-4 z-50 sticky top-0"
      style={{ 
        backgroundColor: "var(--bg-card)", 
        borderColor: "var(--border-dim)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
      }}
    >
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "var(--terra-bg)", color: "var(--terra)" }}
        >
          <Paintbrush size={16} />
        </div>
        <div>
          <h4 className="text-xs font-bold font-space uppercase tracking-wider" style={{ color: "var(--text)" }}>
            Theme Sandbox
          </h4>
          <p className="text-[10px]" style={{ color: "var(--text-mute)" }}>
            Click to preview live layouts. Once you choose, tell me in the chat which to keep!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {THEMES.map((theme) => {
          const isActive = theme.id === activeTheme;
          return (
            <button
              key={theme.id}
              onClick={() => handleSelectTheme(theme)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 border cursor-pointer",
                isActive 
                  ? "shadow-sm border-[var(--terra)]" 
                  : "border-[var(--border-dim)] hover:border-[var(--border)]"
              )}
              style={{
                backgroundColor: isActive ? "var(--terra-bg)" : "var(--bg-input)",
                color: isActive ? "var(--terra)" : "var(--text-dim)",
              }}
              title={theme.desc}
            >
              {/* Palette dots preview */}
              <div className="flex gap-0.5">
                <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: theme.colors["--bg-base"] }} />
                <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: theme.colors["--terra"] }} />
                <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: theme.colors["--gold"] }} />
              </div>
              
              <span>{theme.name}</span>
              
              {isActive && <Check size={11} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
