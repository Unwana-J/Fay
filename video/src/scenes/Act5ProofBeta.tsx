import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { FeyBackdrop } from "../components/FeyBackdrop";
import { FeyButterfly } from "../components/FeyButterfly";
import { COLORS, FONTS, SPRINGS } from "../theme";

const AVATARS = [
  "avatars/avatar-luminary.svg",
  "avatars/avatar-orator.svg",
  "avatars/avatar-philosopher.svg",
  "avatars/avatar-pioneer.svg",
  "avatars/avatar-cosmologist.svg",
  "avatars/avatar-architect.svg",
  "avatars/avatar-strategist.svg",
  "avatars/avatar-novelist.svg",
  "avatars/avatar-botanist.svg",
  "avatars/avatar-alchemist.svg",
  "avatars/avatar-artisan.svg",
  "avatars/avatar-scholar.svg",
];

const URL_TEXT = "fey.lokinlabs.com.ng";

export const Act5ProofBeta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Beat 1 (0..108f): Knowledge Constellation + 12 real scholar avatars lighting up + 80+ counter
  // Beat 2 (108..240f): Butterfly settles, wine-red BETA ink stamp lands, URL types out, "Come play. Come think."

  const beat1Out = interpolate(frame, [96, 110], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const countVal = Math.round(
    interpolate(frame, [16, 66], [0, 80], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

  // Beat 2 animations
  const b2In = spring({
    frame: Math.max(0, frame - 110),
    fps,
    config: SPRINGS.editorial,
  });

  // Heavy archival ink-seal BETA stamp slamming down at frame 142
  const stampSpring = spring({
    frame: Math.max(0, frame - 142),
    fps,
    config: SPRINGS.heavyStamp,
  });
  const stampScale = interpolate(stampSpring, [0, 1], [2.25, 1]);
  const stampOpacity = interpolate(frame, [141, 145], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // URL typewriter from frame 160..192
  const typedCount = Math.floor(
    interpolate(frame, [160, 192], [0, URL_TEXT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const typedUrl = URL_TEXT.slice(0, typedCount);

  // Final tagline at frame 190
  const ctaSpring = spring({
    frame: Math.max(0, frame - 190),
    fps,
    config: SPRINGS.editorial,
  });

  const shimmer = interpolate(frame, [120, 155], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <FeyBackdrop variant="cream">
      {/* BEAT 1: CONSTELLATION + 80+ SCHOLARS */}
      {frame < 114 && (
        <AbsoluteFill
          style={{
            opacity: beat1Out,
            flexDirection: isVertical ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: isVertical ? 48 : 74,
            padding: isVertical ? "96px 64px" : "80px 104px",
          }}
        >
          {/* Real Knowledge Constellation screenshot */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <BrowserFrame
              shot="shots/constellation.png"
              url="fey.lokinlabs.com.ng/constellation"
              width={isVertical ? 940 : 900}
              height={isVertical ? 580 : 600}
              enterDelay={0}
              zoomFrom={1.0}
              zoomTo={1.035}
              zoomDuration={110}
            >
              {/* Subtle glowing gold star pulses overlaid on the constellation orbit */}
              {[
                { left: "60%", top: "63%", delay: 8 },
                { left: "54%", top: "71%", delay: 20 },
                { left: "65%", top: "65%", delay: 32 },
                { left: "61%", top: "54%", delay: 44 },
              ].map((star, idx) => {
                const p = spring({
                  frame: Math.max(0, frame - star.delay),
                  fps,
                  config: SPRINGS.gentle,
                });
                return (
                  <div
                    key={idx}
                    style={{
                      position: "absolute",
                      left: star.left,
                      top: star.top,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(217,179,92,0.85) 0%, rgba(166,124,30,0) 72%)",
                      transform: `translate(-50%, -50%) scale(${interpolate(p, [0, 1], [0.2, 2.2])})`,
                      opacity: interpolate(p, [0, 0.5, 1], [0, 0.9, 0.35]),
                      pointerEvents: "none",
                    }}
                  />
                );
              })}
            </BrowserFrame>
          </div>

          {/* 80+ Counter & 12 Real Scholar Avatars */}
          <div
            style={{
              flex: isVertical ? "0 0 auto" : "0 0 680px",
              width: isVertical ? "100%" : 680,
              display: "flex",
              flexDirection: "column",
              alignItems: isVertical ? "center" : "flex-start",
              textAlign: isVertical ? "center" : "left",
              gap: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: isVertical ? 124 : 132,
                  fontWeight: 700,
                  color: COLORS.terra,
                  lineHeight: 0.95,
                  letterSpacing: "-0.04em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {countVal}+
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontFamily: FONTS.serif,
                  fontSize: isVertical ? 50 : 52,
                  fontWeight: 700,
                  color: COLORS.ink,
                  lineHeight: 1.12,
                  letterSpacing: "-0.02em",
                }}
              >
                curious minds
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: FONTS.sans,
                  fontSize: isVertical ? 26 : 24,
                  color: COLORS.muted,
                }}
              >
                in the last few weeks.
              </div>
            </div>

            {/* 12 real Fey scholar avatars lighting up in a clean wave */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: isVertical ? 16 : 14,
                marginTop: 8,
              }}
            >
              {AVATARS.map((src, idx) => {
                const avSpring = spring({
                  frame: Math.max(0, frame - (12 + idx * 4)),
                  fps,
                  config: SPRINGS.snappy,
                });
                return (
                  <div
                    key={src}
                    style={{
                      width: isVertical ? 88 : 78,
                      height: isVertical ? 88 : 78,
                      borderRadius: "50%",
                      background: COLORS.bgCard,
                      border: `2px solid ${idx % 4 === 0 ? COLORS.gold : COLORS.oliveDim}`,
                      padding: 4,
                      boxShadow: "0 8px 20px rgba(30, 35, 18, 0.08)",
                      opacity: interpolate(avSpring, [0, 1], [0, 1]),
                      transform: `scale(${interpolate(avSpring, [0, 1], [0.55, 1])})`,
                      overflow: "hidden",
                    }}
                  >
                    <Img
                      src={staticFile(src)}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* BEAT 2: FEY · BETA INK STAMP END CARD */}
      {frame >= 106 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            padding: isVertical ? "0 72px" : "0 140px",
          }}
        >
          {/* Butterfly emblem */}
          <div
            style={{
              opacity: interpolate(b2In, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(b2In, [0, 1], [28, 0])}px) scale(${interpolate(b2In, [0, 1], [0.88, 1])})`,
            }}
          >
            <FeyButterfly
              size={isVertical ? 200 : 186}
              unfold={1}
              flutter={Math.sin(frame * 0.12) * 1.8}
              shimmer={frame >= 120 && frame <= 160 ? shimmer : -1}
            />
          </div>

          {/* Wordmark + Wine-Red BETA Ink Seal */}
          <div
            style={{
              marginTop: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 26,
              opacity: interpolate(b2In, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(b2In, [0, 1], [24, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: isVertical ? 122 : 126,
                fontWeight: 700,
                color: COLORS.ink,
                letterSpacing: "-0.03em",
                lineHeight: 0.95,
              }}
            >
              Fey
            </div>

            {/* Archival wine-red BETA stamp */}
            {frame >= 141 && (
              <div
                style={{
                  opacity: stampOpacity,
                  transform: `scale(${stampScale}) rotate(-6deg)`,
                  padding: "6px",
                  borderRadius: 12,
                  border: `3.5px solid ${COLORS.terra}`,
                  background: "rgba(122, 28, 46, 0.06)",
                  boxShadow: "0 10px 26px rgba(122, 28, 46, 0.16)",
                }}
              >
                <div
                  style={{
                    border: `1.5px dashed ${COLORS.terra}`,
                    borderRadius: 7,
                    padding: isVertical ? "8px 22px" : "8px 24px",
                    fontFamily: FONTS.display,
                    fontSize: isVertical ? 34 : 36,
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    color: COLORS.terra,
                    lineHeight: 1,
                  }}
                >
                  BETA
                </div>
              </div>
            )}
          </div>

          {/* Hairline rule */}
          <div
            style={{
              width: isVertical ? 420 : 480,
              height: 1.5,
              background: COLORS.oliveDim,
              marginTop: 34,
              marginBottom: 30,
              opacity: interpolate(b2In, [0, 1], [0, 1]),
            }}
          />

          {/* Typewriter URL pill */}
          <div
            style={{
              minHeight: 54,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {frame >= 158 && (
              <div
                style={{
                  padding: "12px 30px",
                  borderRadius: 999,
                  background: COLORS.bgCard,
                  border: `1.5px solid ${COLORS.oliveDim}`,
                  boxShadow: "0 10px 28px rgba(30, 35, 18, 0.06)",
                  fontFamily: FONTS.display,
                  fontSize: isVertical ? 30 : 30,
                  fontWeight: 600,
                  color: COLORS.olive,
                  letterSpacing: "0.02em",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <span>{typedUrl}</span>
                {typedCount < URL_TEXT.length && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 3,
                      height: 28,
                      background: COLORS.terra,
                      marginLeft: 4,
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Closing CTA */}
          <div
            style={{
              marginTop: 30,
              opacity: interpolate(ctaSpring, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(ctaSpring, [0, 1], [18, 0])}px)`,
              fontFamily: FONTS.serif,
              fontSize: isVertical ? 42 : 40,
              fontWeight: 600,
              color: COLORS.ink,
              letterSpacing: "-0.015em",
            }}
          >
            Come play.{" "}
            <span style={{ color: COLORS.terra, fontStyle: "italic" }}>Come think.</span>
          </div>
        </AbsoluteFill>
      )}
    </FeyBackdrop>
  );
};
