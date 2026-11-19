import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "../theme";
import { FeyBackdrop } from "./FeyBackdrop";

// Reuses the exact post-title feed list from Act 1 so the main film and teaser share one visual world.
export const OPENING_FEED_POSTS = [
  { tag: "THREAD · 18 POSTS", title: "How Central Banks Actually Move Interest Rates", meta: "Bookmarked · 4 days ago" },
  { tag: "SAVED REEL · 01:42", title: "Quantum Computing Explained Without Math", meta: "Saved to Read Later" },
  { tag: "OPEN TAB · #34", title: "The Economics of African Trade Corridors", meta: "Opened 2 weeks ago" },
  { tag: "NEWSLETTER · UNREAD", title: "Why End-to-End Encryption Works (Mostly)", meta: "Inbox · 12 min read" },
  { tag: "BOOKMARK · 214", title: "Game Theory & Why Markets Panic Together", meta: "Liked · Never revisited" },
  { tag: "PODCAST · 1.5X", title: "The Hidden Architecture of Modern Supply Chains", meta: "Played while commuting" },
  { tag: "SAVED POST", title: "Cognitive Biases Every Builder Should Know", meta: "Highlighted 6 lines" },
  { tag: "OPEN TAB · #40", title: "How Compilers Turn Code Into Silicon", meta: "Still open since Tuesday" },
];

const PART_ONE = "What if learning felt less like "; // 32 chars (31 + trailing space)
const PART_TWO_WORD = "scrolling"; // 9 chars

// Subtle keyboard ticks during type-on + single clean soft thud on the hard cut at frame 90
export const OPENING_SFX_CUES: Array<{ from: number; file: string; volume: number; durationInFrames?: number }> = [
  // Soft keyboard ticks across "What if learning felt less like" (6..45f)
  { from: 7, file: "audio/sfx/type-click.wav", volume: 0.13, durationInFrames: 10 },
  { from: 12, file: "audio/sfx/type-click.wav", volume: 0.12, durationInFrames: 10 },
  { from: 17, file: "audio/sfx/type-click.wav", volume: 0.13, durationInFrames: 10 },
  { from: 22, file: "audio/sfx/type-click.wav", volume: 0.12, durationInFrames: 10 },
  { from: 28, file: "audio/sfx/type-click.wav", volume: 0.13, durationInFrames: 10 },
  { from: 35, file: "audio/sfx/type-click.wav", volume: 0.12, durationInFrames: 10 },
  { from: 41, file: "audio/sfx/type-click.wav", volume: 0.12, durationInFrames: 10 },
  // Slightly slower ticks on "scrolling" (45..58f)
  { from: 46, file: "audio/sfx/type-click.wav", volume: 0.14, durationInFrames: 10 },
  { from: 51, file: "audio/sfx/type-click.wav", volume: 0.13, durationInFrames: 10 },
  { from: 56, file: "audio/sfx/type-click.wav", volume: 0.14, durationInFrames: 10 },
  // Three deliberate dots (59, 62, 65)
  { from: 59, file: "audio/sfx/type-click.wav", volume: 0.16, durationInFrames: 10 },
  { from: 62, file: "audio/sfx/type-click.wav", volume: 0.16, durationInFrames: 10 },
  { from: 65, file: "audio/sfx/type-click.wav", volume: 0.17, durationInFrames: 10 },
  // Single soft thud right on the hard cut at frame 90 (3.0s)
  { from: 90, file: "audio/sfx/stamp-thump.wav", volume: 0.44, durationInFrames: 30 },
];

export const OpeningAudioLayer: React.FC = () => (
  <>
    {OPENING_SFX_CUES.map((cue, idx) => (
      <Sequence key={`open-sfx-${cue.from}-${idx}`} from={cue.from} durationInFrames={cue.durationInFrames ?? 18}>
        <Audio src={staticFile(cue.file)} volume={cue.volume} />
      </Sequence>
    ))}
  </>
);

interface OpeningSequenceProps {
  /** Total duration of this opening block (dark 0..90 + cream answer 90..end). */
  durationInFrames: number;
  /** Optional subtle 3-frame waveform flash in corner at frames 86..88 (default true) */
  showWaveformFlash?: boolean;
  /** Frames before durationInFrames to gently fade out the cream answer line (0 = no fade out) */
  fadeOutFrames?: number;
}

/**
 * Shared 3.0s Dark-Green Type-On -> Hard Cut at Frame 90 -> Calm Cream Pattern Interrupt.
 *
 * Frame-accurate spec @ 30fps:
 *   0-6    Dark green, blinking cursor (8f cycle), faded feed cards drifting slowly up (~10% opacity)
 *   6-45   "What if learning felt less like" types on (~1 char/f, slight slow-down on last words; solid cursor)
 *   45-66  "scrolling..." types in italic gold one beat slower; 3 dots enter 1 by 1 (f59, f62, f65)
 *   66-84  Hold on full line (cover frame = f66); cursor blinks; background feed speeds up + blurs slightly
 *   84-90  Cursor fades; brief 3-frame speaking-cue waveform tease in bottom-right corner (f86..88)
 *   90     HARD CUT to cream (no cross-fade, feed disappears completely)
 *   90-102 "...and more like a great conversation?" fades & rises in ("conversation?" in wine red italic)
 */
export const OpeningSequence: React.FC<OpeningSequenceProps> = ({
  durationInFrames,
  showWaveformFlash = true,
  fadeOutFrames = 10,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isVertical = height > width;

  // ---------------------------------------------------------------------------
  // DARK SCENE (Frames 0..89 — exact hard cut at frame 90!)
  // ---------------------------------------------------------------------------
  if (frame < 90) {
    // 1. Background feed cards: slow steady upward drift 0..66, then fast thumb-flick acceleration + slight blur 66..90
    const slowDrift = interpolate(Math.min(frame, 66), [0, 66], [-18, -145], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fastFlick =
      frame > 66
        ? interpolate(frame, [66, 90], [0, -560], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.in(Easing.cubic),
          })
        : 0;
    const feedY = slowDrift + fastFlick;

    const feedBlur = interpolate(frame, [66, 86], [0.6, 4.4], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.quad),
    });
    const feedOpacity = interpolate(frame, [0, 66, 84, 90], [0.105, 0.105, 0.135, 0.14], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // 2. Type-on reveal calculations
    // 6..45f: "What if learning felt less like " (~1 char/f with slight ease-out slowdown on final words)
    let part1Count = 0;
    if (frame >= 6) {
      const u1 = Math.min(1, (frame - 6) / 39);
      const eased1 = 1 - Math.pow(1 - u1, 1.45);
      part1Count = Math.min(PART_ONE.length, Math.floor(eased1 * PART_ONE.length + 0.001));
      if (frame >= 45) part1Count = PART_ONE.length;
    }

    // 45..58f: "scrolling" one beat slower (~1.44f per char)
    let part2WordCount = 0;
    if (frame >= 45) {
      const u2 = Math.min(1, (frame - 45) / 13);
      part2WordCount = Math.min(PART_TWO_WORD.length, Math.floor(u2 * PART_TWO_WORD.length + 0.001));
      if (frame >= 58) part2WordCount = PART_TWO_WORD.length;
    }

    // 59, 62, 65: Three dots appear one at a time
    const dotsCount = frame >= 65 ? 3 : frame >= 62 ? 2 : frame >= 59 ? 1 : 0;

    const revealedPart1 = PART_ONE.slice(0, part1Count);
    const revealedPart2 = PART_TWO_WORD.slice(0, part2WordCount) + ".".repeat(dotsCount);

    // 3. Cursor logic:
    //    - Solid (no blink) while typing (6..65f)
    //    - Blinking on an 8-frame cycle (4f on / 4f off) before typing (0..5f) and while holding (66..83f)
    //    - Gently fades out across 84..89f
    const isTyping = frame >= 6 && frame < 66;
    const blinkPhase = frame < 6 ? Math.floor(frame / 4) % 2 === 0 : Math.floor((frame - 66) / 4) % 2 === 0;
    const cursorFade = interpolate(frame, [84, 88], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const cursorOpacity = (isTyping ? 1 : blinkPhase ? 1 : 0) * cursorFade;

    // 4. Optional quick 3-frame speaking-cue waveform tease in bottom-right corner (frames 86..88)
    const waveFlashVisible = showWaveformFlash && frame >= 86 && frame <= 88;
    const waveBarHeights = [10, 22, 32, 18, 36, 26, 14, 28, 12];

    const headlineFontSize = isVertical ? 76 : 94;
    const cursorH = isVertical ? 68 : 84;
    const maxW = isVertical ? 880 : 1240;

    return (
      <FeyBackdrop variant="chalk">
        {/* Drifting low-contrast feed cards behind the chalkboard headline */}
        <AbsoluteFill
          style={{
            opacity: feedOpacity,
            filter: `blur(${feedBlur.toFixed(2)}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: isVertical ? 120 : 40,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isVertical ? "1fr" : "1fr 1fr",
              gap: isVertical ? 22 : 24,
              width: isVertical ? width - 130 : 1320,
              transform: `translateY(${feedY}px)`,
            }}
          >
            {[...OPENING_FEED_POSTS, ...OPENING_FEED_POSTS, ...OPENING_FEED_POSTS].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(242, 239, 231, 0.08)",
                  border: "1px solid rgba(242, 239, 231, 0.18)",
                  borderRadius: 14,
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.09em",
                    color: COLORS.chalkMuted,
                  }}
                >
                  {item.tag}
                </span>
                <div
                  style={{
                    fontFamily: FONTS.serif,
                    fontSize: isVertical ? 22 : 21,
                    fontWeight: 600,
                    color: COLORS.chalkText,
                    lineHeight: 1.25,
                  }}
                >
                  {item.title}
                </div>
                <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.chalkMuted }}>
                  {item.meta}
                </span>
              </div>
            ))}
          </div>
        </AbsoluteFill>

        {/* Subtle radial dark vignette so the center headline always reads effortlessly */}
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 68% 50% at 50% 50%, rgba(23, 29, 14, 0.62) 0%, rgba(23, 29, 14, 0) 100%)",
          }}
        />

        {/* Vertically centered safe-zone type-on block */}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: isVertical ? "0 82px" : "0 200px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: maxW,
              fontFamily: FONTS.serif,
              fontSize: headlineFontSize,
              fontWeight: 500,
              lineHeight: 1.16,
              letterSpacing: "-0.025em",
              textAlign: "left",
            }}
          >
            {/* Invisible full-line layout anchor so lines never jump or reflow while typing */}
            <div style={{ visibility: "hidden", userSelect: "none" }} aria-hidden="true">
              {PART_ONE}
              <span style={{ fontStyle: "italic" }}>{PART_TWO_WORD}...</span>
            </div>

            {/* Live typed overlay + inline cursor */}
            <div style={{ position: "absolute", inset: 0 }}>
              <span style={{ color: COLORS.chalkText }}>{revealedPart1}</span>
              {revealedPart2.length > 0 && (
                <span style={{ fontStyle: "italic", color: COLORS.goldLight, paddingRight: 4 }}>
                  {revealedPart2}
                </span>
              )}
              <span
                style={{
                  display: "inline-block",
                  width: 4.5,
                  height: cursorH,
                  borderRadius: 2,
                  background: frame >= 45 ? COLORS.goldLight : COLORS.chalkText,
                  marginLeft: revealedPart1.length === 0 ? 0 : 6,
                  verticalAlign: "-0.12em",
                  opacity: cursorOpacity,
                }}
              />
            </div>
          </div>
        </AbsoluteFill>

        {/* Optional brief 3-frame speaking-cue waveform tease in bottom-right corner (frames 86..88) */}
        {waveFlashVisible && (
          <div
            style={{
              position: "absolute",
              right: isVertical ? 68 : 88,
              bottom: isVertical ? 196 : 84,
              padding: "12px 18px",
              borderRadius: 999,
              background: "rgba(242, 239, 231, 0.08)",
              border: "1px solid rgba(217, 179, 92, 0.38)",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: COLORS.goldLight,
                marginRight: 6,
              }}
            />
            {waveBarHeights.map((baseH, idx) => {
              const jitter = frame === 87 ? 1.2 : frame === 88 ? 0.85 : 1;
              return (
                <div
                  key={idx}
                  style={{
                    width: 4,
                    height: Math.round(baseH * jitter),
                    borderRadius: 99,
                    background: idx % 2 === 0 ? COLORS.goldLight : COLORS.chalkText,
                  }}
                />
              );
            })}
          </div>
        )}
      </FeyBackdrop>
    );
  }

  // ---------------------------------------------------------------------------
  // CREAM SCENE (Frame 90+: HARD CUT — feed completely gone, pure calm!)
  // ---------------------------------------------------------------------------
  const creamLocal = frame - 90; // 0 at frame 90

  // Frames 90–102 (creamLocal 0..12): "...and more like a great conversation?" fades & rises in
  const textProgress = interpolate(creamLocal, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const textOpacity = textProgress;
  const textY = interpolate(textProgress, [0, 1], [26, 0]);

  // Subtle wine-red underline glides cleanly after the text settles (frames 104..128)
  const underlineW = interpolate(creamLocal, [14, 38], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const fadeOut =
    fadeOutFrames > 0
      ? interpolate(frame, [durationInFrames - fadeOutFrames, durationInFrames], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <FeyBackdrop variant="cream">
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: isVertical ? "0 82px" : "0 200px",
          textAlign: "center",
          opacity: fadeOut,
        }}
      >
        <div
          style={{
            maxWidth: isVertical ? 880 : 1280,
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            fontFamily: FONTS.serif,
            fontSize: isVertical ? 76 : 94,
            fontWeight: 700,
            color: COLORS.ink,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
          }}
        >
          ...and more like a great{" "}
          <span
            style={{
              position: "relative",
              display: "inline-block",
              color: COLORS.terra,
              fontStyle: "italic",
              paddingRight: 5,
            }}
          >
            conversation?
            <span
              style={{
                position: "absolute",
                left: 0,
                bottom: -7,
                height: 5,
                width: `${underlineW}%`,
                background: COLORS.terra,
                borderRadius: 3,
              }}
            />
          </span>
        </div>
      </AbsoluteFill>
    </FeyBackdrop>
  );
};
