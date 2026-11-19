import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FeyBackdrop } from "../components/FeyBackdrop";
import { COLORS, FONTS, SPRINGS } from "../theme";

/**
 * 60 frames (2.0s) spatial-partitioning bridge showing Fey's real dashboard toggle:
 * [ Daily Practice & Study ]  --->  [ The Parlor & Games ]
 */
export const StudyToParlorBridge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const enter = spring({ frame, fps, config: SPRINGS.editorial });
  const toggleSlide = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 22, stiffness: 240, mass: 0.85 },
  });
  const exitOpacity = interpolate(frame, [50, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const switched = frame >= 24;
  const pillW = isVertical ? 410 : 440;

  return (
    <FeyBackdrop variant="cream">
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 34,
          padding: isVertical ? "0 64px" : "0 140px",
          opacity: interpolate(enter, [0, 1], [0, 1]) * exitOpacity,
          transform: `translateY(${interpolate(enter, [0, 1], [22, 0])}px)`,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.serif,
            fontSize: isVertical ? 54 : 62,
            fontWeight: 700,
            color: COLORS.ink,
            textAlign: "center",
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
          }}
        >
          And when you&apos;re ready to play with friends…
        </div>

        {/* Fey's iconic segmented Study vs. Parlor toggle */}
        <div
          style={{
            position: "relative",
            width: pillW * 2 + 12,
            maxWidth: "100%",
            height: 82,
            padding: 6,
            borderRadius: 18,
            background: COLORS.bgPanel,
            border: `1.5px solid ${COLORS.oliveDim}`,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
            boxShadow: "0 16px 40px rgba(30, 35, 18, 0.08)",
          }}
        >
          {/* Sliding active white card */}
          <div
            style={{
              position: "absolute",
              top: 6,
              bottom: 6,
              left: 6,
              width: "calc(50% - 6px)",
              borderRadius: 13,
              background: COLORS.bgCard,
              border: `1.5px solid ${switched ? COLORS.terraBorder : COLORS.oliveDim}`,
              boxShadow: "0 6px 18px rgba(30, 35, 18, 0.08)",
              transform: `translateX(${interpolate(toggleSlide, [0, 1], [0, 100])}%)`,
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              textAlign: "center",
              fontFamily: FONTS.display,
              fontSize: isVertical ? 22 : 24,
              fontWeight: 700,
              color: switched ? COLORS.muted : COLORS.ink,
            }}
          >
            Daily Practice &amp; Study
          </div>
          <div
            style={{
              position: "relative",
              zIndex: 2,
              textAlign: "center",
              fontFamily: FONTS.display,
              fontSize: isVertical ? 22 : 24,
              fontWeight: 700,
              color: switched ? COLORS.terra : COLORS.muted,
            }}
          >
            The Parlor &amp; Games
          </div>
        </div>

        {/* 4 game chips lighting up cleanly once toggled */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            opacity: interpolate(toggleSlide, [0.4, 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(toggleSlide, [0.4, 1], [14, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px)`,
          }}
        >
          {["Articulate", "The Podium", "Naija Trivia", "Quant"].map((g) => (
            <div
              key={g}
              style={{
                padding: "9px 20px",
                borderRadius: 999,
                background: COLORS.bgCard,
                border: `1.5px solid ${COLORS.oliveDim}`,
                fontFamily: FONTS.display,
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.olive,
              }}
            >
              {g}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </FeyBackdrop>
  );
};
