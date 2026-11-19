import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FeyBackdrop } from "../components/FeyBackdrop";
import { EditorialBadge } from "../components/MotionPrimitives";
import { COLORS, FONTS, SPRINGS } from "../theme";

const QUOTE_WORDS = [
  { text: "“What", highlight: false },
  { text: "I", highlight: false },
  { text: "cannot", highlight: false },
  { text: "create,", highlight: true },
  { text: "I", highlight: false },
  { text: "do", highlight: false },
  { text: "not", highlight: false },
  { text: "understand.”", highlight: true },
];

/** Act 2 (165 frames = 5.5s): Pure Richard Feynman chalkboard beat */
export const Act2Feynman: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Chalk Feynman diagram stroke animation
  const diagDash = interpolate(frame, [6, 95], [460, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const attrIn = spring({
    frame: Math.max(0, frame - 74),
    fps,
    config: SPRINGS.editorial,
  });

  // Clean cream curtain wipe rising into Act 3 (frames 148..165)
  const creamWipe = interpolate(frame, [148, 165], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  return (
    <AbsoluteFill>
      <FeyBackdrop variant="chalk">
        {/* Subtle hand-drawn chalk Feynman diagram vertex in background */}
        <svg
          width={width}
          height={height}
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, opacity: 0.14, pointerEvents: "none" }}
        >
          <path
            d="M 140 220 L 340 420 L 140 620"
            fill="none"
            stroke={COLORS.chalkText}
            strokeWidth="2.5"
            strokeDasharray="460"
            strokeDashoffset={diagDash}
            strokeLinecap="round"
          />
          <path
            d="M 340 420 Q 370 390 400 420 T 460 420 T 520 420 T 580 420"
            fill="none"
            stroke={COLORS.goldLight}
            strokeWidth="2.5"
            strokeDasharray="460"
            strokeDashoffset={diagDash}
            strokeLinecap="round"
          />
          <circle cx="340" cy="420" r="5" fill={COLORS.goldLight} />
          <ellipse
            cx="1660"
            cy="820"
            rx="160"
            ry="58"
            transform="rotate(-24 1660 820)"
            fill="none"
            stroke={COLORS.chalkText}
            strokeWidth="2"
            strokeDasharray="460"
            strokeDashoffset={diagDash}
          />
          <ellipse
            cx="1660"
            cy="820"
            rx="160"
            ry="58"
            transform="rotate(28 1660 820)"
            fill="none"
            stroke={COLORS.goldLight}
            strokeWidth="2"
            strokeDasharray="460"
            strokeDashoffset={diagDash}
          />
        </svg>

        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: isVertical ? "0 86px" : "0 180px",
          }}
        >
          <div style={{ maxWidth: isVertical ? 900 : 1280, textAlign: "center" }}>
            <div style={{ marginBottom: 36 }}>
              <EditorialBadge label="The Backbone of Fey" tone="chalk" delay={4} />
            </div>

            {/* Word-by-word chalk quote */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                columnGap: isVertical ? 18 : 24,
                rowGap: isVertical ? 12 : 14,
                fontFamily: FONTS.serif,
                fontSize: isVertical ? 70 : 92,
                fontWeight: 500,
                lineHeight: 1.18,
                color: COLORS.chalkText,
                letterSpacing: "-0.02em",
              }}
            >
              {QUOTE_WORDS.map((w, idx) => {
                const wordStart = 12 + idx * 7;
                const s = spring({
                  frame: Math.max(0, frame - wordStart),
                  fps,
                  config: SPRINGS.editorial,
                });
                const uWidth = w.highlight
                  ? interpolate(frame, [wordStart + 10, wordStart + 28], [0, 100], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.out(Easing.cubic),
                    })
                  : 0;

                return (
                  <span
                    key={idx}
                    style={{
                      position: "relative",
                      display: "inline-block",
                      opacity: interpolate(s, [0, 1], [0, 1]),
                      transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
                      fontStyle: w.highlight ? "italic" : "normal",
                    }}
                  >
                    {w.text}
                    {w.highlight && (
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          bottom: 2,
                          height: 4,
                          width: `${uWidth}%`,
                          background: COLORS.goldLight,
                          borderRadius: 2,
                          opacity: 0.85,
                        }}
                      />
                    )}
                  </span>
                );
              })}
            </div>

            {/* Attribution */}
            <div
              style={{
                marginTop: 48,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                opacity: interpolate(attrIn, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(attrIn, [0, 1], [20, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 2,
                  background: COLORS.goldLight,
                  opacity: 0.75,
                }}
              />
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: isVertical ? 26 : 28,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: COLORS.goldLight,
                }}
              >
                Richard Feynman
              </div>
              <div
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 20,
                  color: COLORS.chalkMuted,
                  letterSpacing: "0.02em",
                }}
              >
                Nobel Prize Physicist · Namesake of Fey
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </FeyBackdrop>

      {frame >= 148 && (
        <AbsoluteFill
          style={{
            background: COLORS.bgBase,
            transform: `translateY(${creamWipe}%)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
