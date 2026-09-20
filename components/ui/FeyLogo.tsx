"use client";

import React from "react";

interface FeyLogoProps {
  className?: string;
  size?: number;
  spinning?: boolean;
  color?: string;
}

export default function FeyLogo({ className, size = 32, spinning = false, color }: FeyLogoProps) {
  const spinId = React.useId().replace(/:/g, ""); // clean ID for styles

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <style>{`
        .wing-left-${spinId} {
          transform-origin: 42px 54px;
          animation: ${spinning ? `left-flap-${spinId} 0.15s ease-in-out infinite` : "none"};
        }
        .wing-right-${spinId} {
          transform-origin: 58px 54px;
          animation: ${spinning ? `right-flap-${spinId} 0.15s ease-in-out infinite` : "none"};
        }
        .brain-core-${spinId} {
          transform-origin: 50px 48px;
          animation: ${spinning ? `brain-pulse-${spinId} 0.3s ease-in-out infinite` : "none"};
        }

        @keyframes left-flap-${spinId} {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          50% { transform: rotate(18deg) scaleX(0.7) skewY(-8deg); }
        }
        @keyframes right-flap-${spinId} {
          0%, 100% { transform: rotate(0deg) scaleX(1); }
          50% { transform: rotate(-18deg) scaleX(0.7) skewY(8deg); }
        }
        @keyframes brain-pulse-${spinId} {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px var(--gold)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 8px var(--gold)); }
        }
      `}</style>

      {/* ── BACKGROUND WINGS (Emerging from behind the brain core) ── */}
      <g className={`wing-left-${spinId}`}>
        {/* Left Upper Wing */}
        <path 
          d="M 40,42 C 20,8 2,16 6,38 C 8,48 26,50 42,54" 
          strokeWidth="2.5" 
          stroke={color || "var(--terra)"} 
          fill={color || "var(--terra)"}
        />
        {/* Left Lower Wing */}
        <path 
          d="M 42,54 C 20,48 8,63 13,72 C 16,78 28,68 41,62" 
          strokeWidth="2.5" 
          stroke={color || "var(--terra)"} 
          fill={color || "var(--terra)"}
          opacity="0.9"
        />
        {/* Left Wing Veins (contrasting white/ivory negative lines) */}
        <path d="M 22,26 C 28,34 36,38 41,41" strokeWidth="1" stroke="var(--bg-card)" opacity="0.65" />
        <path d="M 24,56 C 30,58 35,57 41,54" strokeWidth="1" stroke="var(--bg-card)" opacity="0.65" />
      </g>

      <g className={`wing-right-${spinId}`}>
        {/* Right Upper Wing */}
        <path 
          d="M 60,42 C 80,8 98,16 94,38 C 92,48 74,50 58,54" 
          strokeWidth="2.5" 
          stroke={color || "var(--terra)"} 
          fill={color || "var(--terra)"}
        />
        {/* Right Lower Wing */}
        <path 
          d="M 58,54 C 80,48 92,63 87,72 C 84,78 72,68 59,62" 
          strokeWidth="2.5" 
          stroke={color || "var(--terra)"} 
          fill={color || "var(--terra)"}
          opacity="0.9"
        />
        {/* Right Wing Veins (contrasting white/ivory negative lines) */}
        <path d="M 78,26 C 72,34 64,38 59,41" strokeWidth="1" stroke="var(--bg-card)" opacity="0.65" />
        <path d="M 76,56 C 70,58 65,57 59,54" strokeWidth="1" stroke="var(--bg-card)" opacity="0.65" />
      </g>

      {/* ── FOREGROUND BRAIN CORE ── */}
      <g className={`brain-core-${spinId}`}>
        {/* Left Hemisphere Lobe */}
        <path 
          d="M 49,30 C 37,30 32,38 32,48 C 32,54 36,58 41,60 C 44,61 48,58 49,55 Z" 
          fill="var(--bg-card)" 
          stroke="var(--gold)"
          strokeWidth="2.2"
        />
        {/* Left Lobe Gyri Folds */}
        <path d="M 38,40 C 35,45 42,48 48,46" stroke="var(--gold)" strokeWidth="1.25" opacity="0.7" />
        <path d="M 36,50 C 40,52 43,49 48,52" stroke="var(--gold)" strokeWidth="1.25" opacity="0.7" />

        {/* Right Hemisphere Lobe */}
        <path 
          d="M 51,30 C 63,30 68,38 68,48 C 68,54 64,58 59,60 C 56,61 52,58 51,55 Z" 
          fill="var(--bg-card)" 
          stroke="var(--gold)"
          strokeWidth="2.2"
        />
        {/* Right Lobe Gyri Folds */}
        <path d="M 62,40 C 65,45 58,48 52,46" stroke="var(--gold)" strokeWidth="1.25" opacity="0.7" />
        <path d="M 64,50 C 60,52 57,49 52,52" stroke="var(--gold)" strokeWidth="1.25" opacity="0.7" />

        {/* ── CENTRAL SPINE & NEURAL NODES ── */}
        <path d="M 50,54 L 50,78" stroke="var(--gold)" strokeWidth="1.5" opacity="0.8" />
        
        {/* Spinal Vertebrae Beads */}
        <circle cx="50" cy="61" r="2.2" fill="var(--gold)" />
        <circle cx="50" cy="68" r="1.6" fill="var(--gold)" />
        <circle cx="50" cy="74" r="1.1" fill="var(--gold)" />
      </g>
    </svg>
  );
}
