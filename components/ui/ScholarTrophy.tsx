"use client";

import React from "react";
import { motion } from "framer-motion";

interface ScholarTrophyProps {
  className?: string;
  size?: number;
  winnerColor?: string;
  teamName?: string;
}

export default function ScholarTrophy({
  className = "",
  size = 180,
  winnerColor = "#EF4444",
  teamName = "Champions",
}: ScholarTrophyProps) {
  const trophyId = React.useId().replace(/:/g, "");

  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      {/* Background Radial Glow Aura */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.45, 0.75, 0.45],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: "easeInOut",
        }}
        className="absolute w-44 h-44 rounded-full blur-2xl -z-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${winnerColor}50 0%, #F59E0B35 50%, transparent 70%)`,
        }}
      />

      {/* Rotating Sunburst Rays */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
        className="absolute w-48 h-48 -z-10 pointer-events-none opacity-20"
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <radialGradient id={`sunburst-${trophyId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#FBBF24" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <polygon
              key={deg}
              points="100,100 92,0 108,0"
              fill={`url(#sunburst-${trophyId})`}
              transform={`rotate(${deg} 100 100)`}
            />
          ))}
        </svg>
      </motion.div>

      {/* Main Floating Trophy Illustration */}
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
        className="relative"
        style={{ width: size, height: size * 0.95 }}
      >
        <svg
          viewBox="0 0 240 220"
          className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Rich Metallic Gold Gradients */}
            <linearGradient id={`gold-cup-${trophyId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>

            <linearGradient id={`gold-highlight-${trophyId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FEF08A" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id={`gold-dark-${trophyId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="60%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>

            <linearGradient id={`gold-rim-${trophyId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#FFFBEB" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id={`laurel-grad-${trophyId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            <linearGradient id={`pedestal-grad-${trophyId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="50%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>

            <linearGradient id={`ribbon-grad-${trophyId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#991B1B" />
              <stop offset="30%" stopColor={winnerColor} />
              <stop offset="70%" stopColor={winnerColor} />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>

            <filter id={`glow-${trophyId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── 1. LAUREL WREATH (Left & Right Victory Branches) ── */}
          <g filter={`url(#glow-${trophyId})`} opacity="0.95">
            {/* Left Laurel Branch */}
            <path
              d="M 64,152 C 42,128 38,82 56,48 C 58,44 64,48 62,52 C 48,80 50,118 68,142 Z"
              fill={`url(#laurel-grad-${trophyId})`}
            />
            {/* Left Laurel Leaves */}
            <path d="M 44,60 C 30,52 32,40 44,46 C 50,49 52,57 44,60 Z" fill={`url(#laurel-grad-${trophyId})`} />
            <path d="M 38,82 C 24,76 24,64 36,68 C 44,71 44,79 38,82 Z" fill={`url(#laurel-grad-${trophyId})`} />
            <path d="M 36,106 C 22,102 20,88 34,90 C 42,91 44,101 36,106 Z" fill={`url(#laurel-grad-${trophyId})`} />
            <path d="M 40,128 C 26,128 26,114 38,114 C 46,114 48,124 40,128 Z" fill={`url(#laurel-grad-${trophyId})`} />
            <path d="M 50,146 C 36,150 34,136 46,134 C 54,133 58,142 50,146 Z" fill={`url(#laurel-grad-${trophyId})`} />

            {/* Right Laurel Branch */}
            <path
              d="M 176,152 C 198,128 202,82 184,48 C 182,44 176,48 178,52 C 192,80 190,118 172,142 Z"
              fill={`url(#laurel-grad-${trophyId})`}
            />
            {/* Right Laurel Leaves */}
            <path d="M 196,60 C 210,52 208,40 196,46 C 190,49 188,57 196,60 Z" fill={`url(#laurel-grad-${trophyId})`} />
            <path d="M 202,82 C 216,76 216,64 204,68 C 196,71 196,79 202,82 Z" fill={`url(#laurel-grad-${trophyId})`} />
            <path d="M 204,106 C 218,102 220,88 206,90 C 198,91 196,101 204,106 Z" fill={`url(#laurel-grad-${trophyId})`} />
            <path d="M 200,128 C 214,128 214,114 202,114 C 194,114 192,124 200,128 Z" fill={`url(#laurel-grad-${trophyId})`} />
            <path d="M 190,146 C 204,150 206,136 194,134 C 186,133 182,142 190,146 Z" fill={`url(#laurel-grad-${trophyId})`} />
          </g>

          {/* ── 2. ORNATE HANDLES ── */}
          {/* Left Handle */}
          <path
            d="M 82,64 C 44,64 42,106 72,118 C 76,119 74,127 70,126 C 34,112 36,54 82,54 Z"
            fill={`url(#gold-dark-${trophyId})`}
          />
          <path
            d="M 80,60 C 48,60 48,102 74,112"
            stroke={`url(#gold-highlight-${trophyId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Right Handle */}
          <path
            d="M 158,64 C 196,64 198,106 168,118 C 164,119 166,127 170,126 C 206,112 204,54 158,54 Z"
            fill={`url(#gold-dark-${trophyId})`}
          />
          <path
            d="M 160,60 C 192,60 192,102 166,112"
            stroke={`url(#gold-highlight-${trophyId})`}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* ── 3. TROPHY CUP BODY ── */}
          {/* Main Cup Body */}
          <path
            d="M 76,52 L 164,52 C 164,96 148,136 120,136 C 92,136 76,96 76,52 Z"
            fill={`url(#gold-cup-${trophyId})`}
          />

          {/* Cup Specular Side Shading */}
          <path
            d="M 80,56 C 80,94 94,130 114,134 C 98,128 84,94 84,56 Z"
            fill={`url(#gold-highlight-${trophyId})`}
            opacity="0.8"
          />
          <path
            d="M 160,56 C 160,94 146,130 126,134 C 142,128 156,94 156,56 Z"
            fill="#78350F"
            opacity="0.25"
          />

          {/* Top Oval Rim */}
          <ellipse cx="120" cy="52" rx="44" ry="9" fill={`url(#gold-rim-${trophyId})`} stroke="#B45309" strokeWidth="1.5" />
          <ellipse cx="120" cy="52" rx="38" ry="6" fill="#78350F" opacity="0.6" />

          {/* Stem & Neck */}
          <path
            d="M 112,136 L 128,136 L 126,158 L 114,158 Z"
            fill={`url(#gold-dark-${trophyId})`}
          />
          <ellipse cx="120" cy="146" rx="9" ry="3.5" fill={`url(#gold-rim-${trophyId})`} />
          <ellipse cx="120" cy="158" rx="14" ry="4" fill={`url(#gold-rim-${trophyId})`} />

          {/* ── 4. EMBOSSED MEDALLION ON CUP ── */}
          <circle cx="120" cy="90" r="17" fill="#78350F" opacity="0.3" />
          <circle cx="120" cy="89" r="16" fill={`url(#gold-cup-${trophyId})`} stroke="#B45309" strokeWidth="1" />
          {/* Embossed Star */}
          <polygon
            points="120,77 124,85 133,86 126,92 128,101 120,96 112,101 114,92 107,86 116,85"
            fill="#FFFBEB"
            stroke="#D97706"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />

          {/* ── 5. MARBLE & GOLD PEDESTAL BASE ── */}
          {/* Base upper step */}
          <polygon points="100,162 140,162 146,174 94,174" fill={`url(#gold-cup-${trophyId})`} stroke="#92400E" strokeWidth="1" />
          {/* Main pedestal block */}
          <rect x="88" y="174" width="64" height="26" rx="4" fill={`url(#pedestal-grad-${trophyId})`} stroke="#374151" strokeWidth="1.5" />
          
          {/* Golden Engraved Plaque */}
          <rect x="94" y="178" width="52" height="18" rx="2" fill={`url(#gold-cup-${trophyId})`} stroke="#B45309" strokeWidth="0.8" />
          <text
            x="120"
            y="190"
            textAnchor="middle"
            fontFamily="monospace"
            fontWeight="900"
            fontSize="7.5"
            fill="#78350F"
            letterSpacing="1"
          >
            FEY #1
          </text>

          {/* Base lower footer */}
          <rect x="82" y="198" width="76" height="8" rx="2" fill="#111827" stroke="#374151" strokeWidth="1" />
          <rect x="84" y="199" width="72" height="1.5" fill={`url(#gold-highlight-${trophyId})`} opacity="0.4" />

          {/* ── 6. VICTORY RIBBON SASH ── */}
          <g filter={`url(#glow-${trophyId})`}>
            {/* Left Ribbon Tail */}
            <path d="M 82,186 L 62,192 L 68,206 L 82,196 Z" fill="#7F1D1D" />
            <polygon points="62,192 50,202 68,206 58,198" fill="#581C87" opacity="0.3" />

            {/* Right Ribbon Tail */}
            <path d="M 158,186 L 178,192 L 172,206 L 158,196 Z" fill="#7F1D1D" />
            <polygon points="178,192 190,202 172,206 182,198" fill="#581C87" opacity="0.3" />

            {/* Center Front Ribbon Banner */}
            <path
              d="M 72,182 L 168,182 L 164,196 L 76,196 Z"
              fill={`url(#ribbon-grad-${trophyId})`}
              stroke="#FDE047"
              strokeWidth="0.8"
            />
            <text
              x="120"
              y="192"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
              fontWeight="900"
              fontSize="8"
              fill="#FFFBEB"
              letterSpacing="1.5"
            >
              VICTORY
            </text>
          </g>

          {/* ── 7. TWINKLING SPARKLE STARS ── */}
          {/* Sparkle 1 Top Left */}
          <path
            d="M 68,36 Q 68,44 76,44 Q 68,44 68,52 Q 68,44 60,44 Q 68,44 68,36 Z"
            fill="#FFFBEB"
            filter={`url(#glow-${trophyId})`}
          />
          {/* Sparkle 2 Top Right */}
          <path
            d="M 172,32 Q 172,40 180,40 Q 172,40 172,48 Q 172,40 164,40 Q 172,40 172,32 Z"
            fill="#FFFBEB"
            filter={`url(#glow-${trophyId})`}
          />
          {/* Sparkle 3 Cup Rim */}
          <path
            d="M 120,44 Q 120,49 125,49 Q 120,49 120,54 Q 120,49 115,49 Q 120,49 120,44 Z"
            fill="#FFFFFF"
          />
        </svg>
      </motion.div>
    </div>
  );
}
