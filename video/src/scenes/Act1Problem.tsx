import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FeyBackdrop } from "../components/FeyBackdrop";
import { COLORS, FONTS, SPRINGS } from "../theme";

const MOCK_POSTS = [
  { tag: "THREAD · 18 POSTS", title: "How Central Banks Actually Move Interest Rates", meta: "Bookmarked · 4 days ago" },
  { tag: "SAVED REEL · 01:42", title: "Quantum Computing Explained Without Math", meta: "Saved to Read Later" },
  { tag: "OPEN TAB · #34", title: "The Economics of African Trade Corridors", meta: "Opened 2 weeks ago" },
  { tag: "NEWSLETTER · UNREAD", title: "Why End-to-End Encryption Works (Mostly)", meta: "Inbox · 12 min read" },
  { tag: "BOOKMARK · 214", title: "Game Theory & Why Markets Panic Together", meta: "Liked · Never revisited" },
  { tag: "PODCAST · 1.5X", title: "The Hidden Architecture of Modern Supply Chains", meta: "Played while commuting" },
  { tag: "SAVED POST", title: "Cognitive Biases Every Builder Should Know", meta: "Highlighted 6 lines" },
  { tag: "OPEN TAB · #40", title: "How Compilers Turn Code Into Silicon", meta: "Still open since Tuesday" },
];

const RECEIPT_LINES = [
  { num: "1,000", rest: "posts read.", color: COLORS.terra, enterAt: 0 },
  { num: "240", rest: "bookmarks saved.", color: COLORS.olive, enterAt: 24 },
  { num: "40", rest: "tabs still open.", color: COLORS.gold, enterAt: 48 },
];

export const Act1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Beat timings inside Act 1 (270 frames = 9s)
  // Beat 1: 0..96   ("1,000 posts read. / 240 bookmarks saved. / 40 tabs still open.")
  // Beat 2: 96..184 ("How much of it do you actually know? / Try explaining one. Out loud.")
  // Beat 3: 184..270 ("Feeling informed / isn't the same as knowing.")

  // Background feed is softly visible from frame 0 so the thumbnail looks rich, freezes dead at frame 94
  const scrollFrame = Math.min(frame, 94);
  const scrollY = interpolate(scrollFrame, [0, 94], [-40, -560], {
    easing: Easing.out(Easing.quad),
  });
  const feedOpacity = interpolate(frame, [0, 88, 98], [0.34, 0.34, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Beat 1 exit
  const b1Out = interpolate(frame, [84, 96], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Beat 2 entrance & exit
  const b2Frame = Math.max(0, frame - 98);
  const b2In = spring({ frame: b2Frame, fps, config: SPRINGS.editorial });
  const b2SubIn = spring({ frame: Math.max(0, frame - 130), fps, config: SPRINGS.editorial });
  const b2Out = interpolate(frame, [172, 184], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorBlink = Math.floor(frame / 10) % 2 === 0 ? 1 : 0.15;

  // Beat 3 entrance, hairline split & chalk wipe transition
  const b3Frame = Math.max(0, frame - 186);
  const b3In = spring({ frame: b3Frame, fps, config: SPRINGS.editorial });
  const crackProgress = interpolate(frame, [198, 226], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const underlineWidth = interpolate(frame, [214, 240], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const wipeUp = interpolate(frame, [252, 270], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const sidePad = isVertical ? 76 : 160;

  return (
    <FeyBackdrop variant="cream">
      {/* Blurred scrolling social/bookmark feed in Beat 1 */}
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
            {[...MOCK_POSTS, ...MOCK_POSTS].map((item, idx) => (
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
                  {/* Bookmark outline glyph */}
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

      {/* BEAT 1: THE RECEIPT (1,000 posts read / 240 bookmarks saved / 40 tabs still open) */}
      {frame < 98 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: `0 ${sidePad}px`,
            opacity: b1Out,
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
            {/* Receipt header */}
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

            {/* 3 crisp receipt rows slapping in */}
            <div style={{ display: "flex", flexDirection: "column", gap: isVertical ? 24 : 22 }}>
              {RECEIPT_LINES.map((row, idx) => {
                // Row 0 is already crisp on frame 0 so the paused thumbnail looks sharp & iconic!
                const isFirst = idx === 0;
                const s = isFirst
                  ? 1
                  : spring({
                      frame: Math.max(0, frame - row.enterAt),
                      fps,
                      config: SPRINGS.snappy,
                    });
                const rowVisible = isFirst || frame >= row.enterAt;
                const rowOpacity = isFirst
                  ? 1
                  : interpolate(frame, [row.enterAt, row.enterAt + 6], [0, 1], {
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
                      borderBottom: idx < 2 ? `1px solid rgba(220, 213, 201, 0.7)` : "none",
                      opacity: rowVisible ? rowOpacity : 0,
                      transform: isFirst
                        ? "none"
                        : `translateY(${interpolate(s, [0, 1], [28, 0])}px) scale(${interpolate(s, [0, 1], [0.97, 1])})`,
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

      {/* BEAT 2: How much of it do you actually know? / Try explaining one. Out loud. */}
      {frame >= 94 && frame < 188 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: `0 ${sidePad}px`,
            opacity:
              b2Out *
              interpolate(frame, [96, 105], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
          }}
        >
          <div style={{ textAlign: "center", maxWidth: isVertical ? 900 : 1260 }}>
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: isVertical ? 70 : 88,
                fontWeight: 700,
                color: COLORS.ink,
                lineHeight: 1.12,
                letterSpacing: "-0.025em",
                transform: `translateY(${interpolate(b2In, [0, 1], [34, 0])}px)`,
              }}
            >
              How much of it do you
              <br />
              actually{" "}
              <span style={{ color: COLORS.terra, fontStyle: "italic" }}>know</span>?
              <span
                style={{
                  display: "inline-block",
                  width: 5,
                  height: isVertical ? 58 : 74,
                  background: COLORS.olive,
                  marginLeft: 14,
                  verticalAlign: "-8px",
                  borderRadius: 3,
                  opacity: cursorBlink,
                }}
              />
            </div>

            <div
              style={{
                marginTop: 30,
                fontFamily: FONTS.serif,
                fontStyle: "italic",
                fontSize: isVertical ? 36 : 40,
                fontWeight: 400,
                color: COLORS.muted,
                opacity: interpolate(b2SubIn, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(b2SubIn, [0, 1], [22, 0])}px)`,
              }}
            >
              Try explaining one. Out loud.
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* BEAT 3: Feeling informed / isn't the same as knowing. */}
      {frame >= 184 && (
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
                transform: `translate(${interpolate(crackProgress, [0, 1], [0, -18])}px, ${interpolate(b3In, [0, 1], [26, 0])}px)`,
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
                transform: `translate(${interpolate(crackProgress, [0, 1], [0, 18])}px, ${interpolate(b3In, [0, 1], [32, 0])}px)`,
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

      {/* Smooth olive chalkboard curtain transition into Act 2 */}
      {frame >= 250 && (
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
