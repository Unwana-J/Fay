import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, SPRINGS } from "../theme";

interface RevealLineProps {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  distance?: number;
}

/** Crisp editorial masked slide-up reveal */
export const RevealLine: React.FC<RevealLineProps> = ({
  children,
  delay = 0,
  style,
  distance = 44,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: SPRINGS.editorial,
  });

  const y = interpolate(progress, [0, 1], [distance, 0]);
  const opacity = interpolate(frame, [delay, delay + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ overflow: "hidden", paddingBottom: 6 }}>
      <div
        style={{
          transform: `translateY(${y}px)`,
          opacity,
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface EditorialBadgeProps {
  label: string;
  tone?: "olive" | "terra" | "gold" | "chalk";
  delay?: number;
}

export const EditorialBadge: React.FC<EditorialBadgeProps> = ({
  label,
  tone = "olive",
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: SPRINGS.snappy,
  });

  const styles = {
    olive: {
      bg: "rgba(68, 78, 44, 0.09)",
      border: "rgba(68, 78, 44, 0.28)",
      color: COLORS.olive,
    },
    terra: {
      bg: COLORS.terraSoft,
      border: COLORS.terraBorder,
      color: COLORS.terra,
    },
    gold: {
      bg: COLORS.goldSoft,
      border: "rgba(166, 124, 30, 0.35)",
      color: COLORS.gold,
    },
    chalk: {
      bg: "rgba(242, 239, 231, 0.08)",
      border: "rgba(242, 239, 231, 0.22)",
      color: COLORS.chalkText,
    },
  }[tone];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 16px",
        borderRadius: 999,
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        fontFamily: FONTS.display,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: styles.color,
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(s, [0, 1], [12, 0])}px)`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: styles.color,
        }}
      />
      {label}
    </div>
  );
};

// Crisp zero-emoji Lucide-style icons
export const FlameIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 28,
  color = COLORS.gold,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export const TimerIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 28,
  color = COLORS.terra,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" x2="14" y1="2" y2="2" />
    <line x1="12" x2="15" y1="14" y2="11" />
    <circle cx="12" cy="14" r="8" />
  </svg>
);

export const SlidesIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 28,
  color = COLORS.olive,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

export const QuizIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 28,
  color = COLORS.olive,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

export const MicIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = COLORS.terra,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

export const CheckIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 20,
  color = COLORS.correctText,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
