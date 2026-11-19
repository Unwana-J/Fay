import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FeyBackdrop } from "../components/FeyBackdrop";
import { OPENING_FEED_POSTS, OpeningSequence } from "../components/OpeningSequence";
import { COLORS, FONTS, SPRINGS } from "../theme";

const RECEIPT_LINES = [
  { num: "1,000", rest: "posts read.", color: COLORS.terra, enterAt: 150 },
  { num: "240", rest: "bookmarks saved.", color: COLORS.olive, enterAt: 166 },
  { num: "40", rest: "tabs still open.", color: COLORS.gold, enterAt: 182 },
];

export const Act1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Act 1 (270 frames = 9.0s, keeps Act 2..5 100% locked to the Pixabay track):
  //   0..90    Dark green type-on: "What if learning felt less like scrolling..." + accelerating feed
  //   90       HARD CUT to cream (pattern interrupt, feed gone)
  //   90..150  "...and more like a great conversation?" fades & rises in calmly
  //   150..214 The Receipt ("1,000 posts read. / 240 bookmarks saved. / 40 tabs still open.")
  //   214..270 "Feeling informed / isn't the same as knowing." + chalk wipe into Act 2
  if (frame < 150) {
    return <OpeningSequence durationInFrames={150} fadeOutFrames={10} />;
  }

  // Receipt phase (150..214f)
  const receiptLocal = frame - 150;
  const scrollY = interpolate(Math.min(receiptLocal, 60), [0, 60], [-30, -340], {
    easing: Easing.out(Easing.quad),
  });
  const feedOpacity = interpolate(frame, [150, 158, 204, 214], [0, 0.26, 0.26, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const receiptIn = interpolate(frame, [150, 158], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const receiptOut = interpolate(frame, [204, 214], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Beat 3 (214..270f): "Feeling informed / isn't the same as knowing." + chalk wipe
  const b3Frame = Math.max(0, frame - 214);
  const b3In = spring({ frame: b3Frame, fps, config: SPRINGS.editorial });
  const crackProgress = interpolate(frame, [220, 244], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const underlineWidth = interpolate(frame, [232, 252], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const wipeUp = interpolate(frame, [254, 270], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const sidePad = isVertical ? 76 : 160;

  return (
    <FeyBackdrop variant="cream">
      {/* Soft blurred social/bookmark feed behind The Receipt */}
      {feedOpacity > 0.005 && (
        <AbsoluteFill
          style={{
            opacity: feedOpacity,
            filter: "blur(3.5px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            paddingTop: 80,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isVertical ? "1fr" : "1fr 1fr",
              gap: 24,
              width: isVertical ? width - 140 : 1280,
              transform: `translateY(${scrollY}px)`,
            }}
          >
            {[...OPENING_FEED_POSTS, ...OPENING_FEED_POSTS].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: COLORS.bgCard,
                  border: `1px solid ${COLORS.oliveDim}`,
                  borderRadius: 14,
                  padding: "22px 26px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      color: COLORS.olive,
                    }}
                  >
                    {item.tag}
                  </span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.muted} strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div
                  style={{
                    fontFamily: FONTS.serif,
                    fontSize: 22,
                    fontWeight: 600,
                    color: COLORS.ink,
                    lineHeight: 1.25,
                  }}
                >
                  {item.title}
                </div>
                <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.subtle }}>
                  {item.meta}
                </div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      )}

      {/* THE RECEIPT (150..214f) */}
      {frame < 216 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: `0 ${sidePad}px`,
            opacity: receiptIn * receiptOut,
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.94)",
              backdropFilter: "blur(8px)",
              padding: isVertical ? "46px 46px 50px" : "52px 72px 56px",
              borderRadius: 24,
              border: `1.5px solid ${COLORS.oliveDim}`,
              boxShadow: "0 28px 70px rgba(30, 35, 18, 0.12)",
              width: isVertical ? "100%" : 1080,
              maxWidth: isVertical ? 900 : 1080,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 22,
                borderBottom: `1.5px dashed ${COLORS.oliveDim}`,
                marginBottom: 26,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: isVertical ? 16 : 15,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: COLORS.olive,
                }}
              >
                THIS MONTH ON YOUR FEED
              </span>
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: isVertical ? 14 : 14,
                  fontWeight: 600,
                  color: COLORS.subtle,
                  letterSpacing: "0.06em",
                }}
              >
                01 — 03
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: isVertical ? 24 : 22 }}>
              {RECEIPT_LINES.map((row, idx) => {
                const s = spring({
                  frame: Math.max(0, frame - row.enterAt),
                  fps,
                  config: SPRINGS.snappy,
                });
                const rowOpacity = interpolate(frame, [row.enterAt, row.enterAt + 6], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });

                return (
                  <div
                    key={row.num}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: isVertical ? 20 : 28,
                      paddingBottom: idx < 2 ? (isVertical ? 22 : 20) : 0,
                      borderBottom: idx < 2 ? "1px solid rgba(220, 213, 201, 0.7)" : "none",
                      opacity: frame >= row.enterAt ? rowOpacity : 0,
                      transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px) scale(${interpolate(s, [0, 1], [0.97, 1])})`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: isVertical ? 64 : 76,
                        fontWeight: 700,
                        color: row.color,
                        letterSpacing: "-0.03em",
                        lineHeight: 1,
                        minWidth: isVertical ? 185 : 225,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {row.num}
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.serif,
                        fontSize: isVertical ? 52 : 66,
                        fontWeight: 700,
                        color: COLORS.ink,
                        letterSpacing: "-0.02em",
                        lineHeight: 1.08,
                      }}
                    >
                      {row.rest}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* BEAT 3 (214..270f): Feeling informed / isn't the same as knowing. */}
      {frame >= 214 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: `0 ${sidePad}px`,
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: isVertical ? 900 : 1320,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: isVertical ? 64 : 80,
                fontWeight: 500,
                color: COLORS.muted,
                letterSpacing: "-0.02em",
                opacity: interpolate(b3In, [0, 1], [0, 1]),
                transform: `translate(${interpolate(crackProgress, [0, 1], [0, -18])}px, ${interpolate(b3In, [0, 1], [24, 0])}px)`,
              }}
            >
              Feeling informed
            </div>

            <div
              style={{
                width: `${interpolate(crackProgress, [0, 1], [0, isVertical ? 680 : 820])}px`,
                height: 2,
                background: `linear-gradient(90deg, transparent 0%, ${COLORS.oliveDim} 15%, ${COLORS.terra} 50%, ${COLORS.oliveDim} 85%, transparent 100%)`,
                opacity: interpolate(crackProgress, [0, 0.2, 1], [0, 1, 0.85]),
              }}
            />

            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: isVertical ? 70 : 88,
                fontWeight: 700,
                color: COLORS.ink,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                opacity: interpolate(b3In, [0, 1], [0, 1]),
                transform: `translate(${interpolate(crackProgress, [0, 1], [0, 18])}px, ${interpolate(b3In, [0, 1], [30, 0])}px)`,
              }}
            >
              isn&apos;t the same as{" "}
              <span style={{ position: "relative", display: "inline-block", color: COLORS.ink }}>
                knowing.
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: -8,
                    height: 6,
                    width: `${underlineWidth}%`,
                    background: COLORS.terra,
                    borderRadius: 3,
                    opacity: 0.85,
                  }}
                />
              </span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* Smooth olive chalkboard curtain transition into Act 2 (Richard Feynman) */}
      {frame >= 252 && (
        <AbsoluteFill
          style={{
            background: COLORS.chalkboard,
            transform: `translateY(${wipeUp}%)`,
          }}
        />
      )}
    </FeyBackdrop>
  );
};
