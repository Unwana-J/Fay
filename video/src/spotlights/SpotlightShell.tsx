import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { FeyBackdrop } from "../components/FeyBackdrop";
import { FeyButterfly } from "../components/FeyButterfly";
import { EditorialBadge } from "../components/MotionPrimitives";
import "../styles/fonts.css";
import { COLORS, FONTS, SPRINGS } from "../theme";

export const SPOTLIGHT_FRAMES = 600; // 20.0s @ 30fps

export interface SpotlightSfx {
  from: number;
  file: string;
  volume: number;
}

interface SpotlightAudioProps {
  /** Audio file path inside video/public/, e.g. "audio/music.mp3" */
  musicFile?: string;
  /** Start offset in seconds inside the music file */
  musicStartSec?: number;
  /** Peak music volume (0..1) */
  musicPeak?: number;
  /** Set true if the track has its own built-in ending (~18-20s) so we don't fade out early */
  naturalEnding?: boolean;
  sfx: SpotlightSfx[];
  /** Frame where BETA stamp slams down for brief ducking */
  stampFrame?: number;
}

export const SpotlightAudio: React.FC<SpotlightAudioProps> = ({
  musicFile = "audio/music.mp3",
  musicStartSec = 42.8,
  musicPeak = 0.56,
  naturalEnding = false,
  sfx,
  stampFrame = 516,
}) => {
  const musicVol = (f: number) => {
    const fadeStart = naturalEnding ? SPOTLIGHT_FRAMES - 14 : SPOTLIGHT_FRAMES - 48;
    const env = interpolate(f, [0, 8, fadeStart, SPOTLIGHT_FRAMES], [0, musicPeak, musicPeak, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const stampDuck = interpolate(
      f,
      [stampFrame - 6, stampFrame + 2, stampFrame + 16, stampFrame + 30],
      [1, 0.56, 0.78, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
    return env * stampDuck;
  };

  return (
    <>
      <Audio
        src={staticFile(musicFile)}
        startFrom={Math.round(musicStartSec * 30)}
        volume={musicVol}
      />
      {sfx.map((cue, idx) => (
        <Sequence key={`${cue.file}-${cue.from}-${idx}`} from={cue.from} durationInFrames={42}>
          <Audio src={staticFile(cue.file)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
};

interface SpotlightHookProps {
  badge: string;
  line1: string;
  accent: string;
  variant?: "chalk" | "cream";
  duration?: number;
}

/** Crisp 0..90f opening hook beat with smooth curtain exit */
export const SpotlightHook: React.FC<SpotlightHookProps> = ({
  badge,
  line1,
  accent,
  variant = "chalk",
  duration = 92,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const isVertical = height > width;
  const isDark = variant === "chalk";

  const uWidth = interpolate(frame, [16, 48], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const wipeUp = interpolate(frame, [duration - 14, duration], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

  const accentColor = isDark ? COLORS.goldLight : COLORS.terra;

  return (
    <AbsoluteFill>
      <FeyBackdrop variant={variant}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: isVertical ? "0 82px" : "0 200px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 28,
              maxWidth: isVertical ? 880 : 1280,
            }}
          >
            <EditorialBadge label={badge} tone={isDark ? "chalk" : "olive"} delay={0} />
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: isVertical ? 72 : 88,
                fontWeight: isDark ? 500 : 700,
                color: isDark ? COLORS.chalkText : COLORS.ink,
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
              }}
            >
              {line1}{" "}
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  fontStyle: "italic",
                  color: accentColor,
                  paddingRight: 5,
                }}
              >
                {accent}
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: -7,
                    height: 4,
                    width: `${uWidth}%`,
                    background: accentColor,
                    borderRadius: 2,
                  }}
                />
              </span>
            </div>
          </div>
        </AbsoluteFill>
      </FeyBackdrop>

      {frame >= duration - 14 && (
        <AbsoluteFill
          style={{
            background: COLORS.bgBase,
            transform: `translateY(${wipeUp}%)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

interface SpotlightEndCardProps {
  featureName: string;
  url: string;
  tagline: string;
  taglineAccent: string;
}

/** Shared cohesive Fey Feature Spotlight End Card (last ~3.5s / 108 frames) */
export const SpotlightEndCard: React.FC<SpotlightEndCardProps> = ({
  featureName,
  url,
  tagline,
  taglineAccent,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const enter = spring({ frame, fps, config: SPRINGS.editorial });
  const stamp = spring({ frame: Math.max(0, frame - 24), fps, config: SPRINGS.heavyStamp });
  const cta = spring({ frame: Math.max(0, frame - 36), fps, config: SPRINGS.editorial });
  const shimmer = interpolate(frame, [10, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <FeyBackdrop variant="cream">
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: isVertical ? "0 68px" : "0 140px",
        }}
      >
        <div
          style={{
            opacity: interpolate(enter, [0, 1], [0, 1]),
            transform: `scale(${interpolate(enter, [0, 1], [0.86, 1])})`,
          }}
        >
          <FeyButterfly
            size={isVertical ? 186 : 172}
            unfold={1}
            flutter={Math.sin(frame * 0.14) * 1.8}
            shimmer={frame >= 10 && frame <= 52 ? shimmer : -1}
          />
        </div>

        <div
          style={{
            marginTop: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            flexWrap: "wrap",
            opacity: interpolate(enter, [0, 1], [0, 1]),
          }}
        >
          <div
            style={{
              fontFamily: FONTS.serif,
              fontSize: isVertical ? 82 : 94,
              fontWeight: 700,
              color: COLORS.ink,
              letterSpacing: "-0.03em",
              lineHeight: 0.98,
            }}
          >
            {featureName}
          </div>

          {frame >= 23 && (
            <div
              style={{
                transform: `scale(${interpolate(stamp, [0, 1], [2.1, 1])}) rotate(-6deg)`,
                padding: 5,
                borderRadius: 11,
                border: `3px solid ${COLORS.terra}`,
                background: "rgba(122, 28, 46, 0.06)",
                boxShadow: "0 10px 24px rgba(122, 28, 46, 0.15)",
              }}
            >
              <div
                style={{
                  border: `1.5px dashed ${COLORS.terra}`,
                  borderRadius: 6,
                  padding: "6px 18px",
                  fontFamily: FONTS.display,
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: COLORS.terra,
                  lineHeight: 1,
                }}
              >
                BETA
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 28,
            padding: "12px 30px",
            borderRadius: 999,
            background: COLORS.bgCard,
            border: `1.5px solid ${COLORS.oliveDim}`,
            fontFamily: FONTS.display,
            fontSize: isVertical ? 26 : 27,
            fontWeight: 600,
            color: COLORS.olive,
            opacity: interpolate(cta, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(cta, [0, 1], [16, 0])}px)`,
          }}
        >
          {url}
        </div>

        <div
          style={{
            marginTop: 22,
            textAlign: "center",
            fontFamily: FONTS.serif,
            fontSize: isVertical ? 36 : 36,
            fontWeight: 600,
            color: COLORS.ink,
            opacity: interpolate(cta, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(cta, [0, 1], [16, 0])}px)`,
          }}
        >
          {tagline}{" "}
          <span style={{ color: COLORS.terra, fontStyle: "italic" }}>{taglineAccent}</span>
        </div>
      </AbsoluteFill>
    </FeyBackdrop>
  );
};

export interface RealClipSegment {
  /** Short pill label, e.g. "01 · Spin" */
  stepLabel: string;
  /** Concise editorial caption above the browser showcase */
  headline: string;
  /** Optional 1-line supporting caption (shown on vertical 9:16 where there is extra room) */
  sub?: string;
  /** Browser address bar URL */
  url: string;
  /** Duration of this beat in output frames (@ 30fps) */
  durationInFrames: number;
  /** Start timestamp in the source MP4 clip (seconds) */
  sourceStartSec: number;
  /** Playback rate multiplier (1.0 = real time, 1.15–1.35 = crisp pacing) */
  playbackRate?: number;
  /** Subtle focal zoom [from, to] inside the browser viewport (16:9 / base) */
  zoom?: [number, number];
  /** Slightly tighter focal zoom on 9:16 vertical so mobile viewers read UI effortlessly */
  verticalZoom?: [number, number];
  /** Focal transform-origin in % [x, y] (16:9 / base) */
  origin?: [number, number];
  /** Optional vertical-specific transform-origin in % [x, y] (e.g. [100, 48] cleanly frames past the left sidebar) */
  verticalOrigin?: [number, number];
}

interface RealClipStageProps {
  badge: string;
  /** Clip path inside video/public/, e.g. "clips/study.mp4" */
  clipFile: string;
  /** Segments played back-to-back across the showcase window */
  segments: RealClipSegment[];
}

/**
 * Honest-craft real screen recording showcase with light, restrained motion polish:
 * - Warm archival backdrop + minimal step pills & live editorial caption
 * - Large elevated BrowserFrame displaying real 30fps <OffthreadVideo> footage
 * - Subtle entrance settle, gentle focal zoom per segment, and 6-frame transitions
 */
export const RealClipStage: React.FC<RealClipStageProps> = ({
  badge,
  clipFile,
  segments,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Compute cumulative timeline starts for every segment
  let cursor = 0;
  const scheduled = segments.map((seg) => {
    const from = cursor;
    cursor += seg.durationInFrames;
    return { ...seg, from, end: cursor };
  });
  const totalDur = cursor;

  const activeIdx = Math.max(
    0,
    scheduled.findIndex((s, i) => frame < s.end || i === scheduled.length - 1)
  );
  const active = scheduled[activeIdx];
  const segLocal = Math.max(0, frame - active.from);

  const captionIn = spring({
    frame: segLocal,
    fps,
    config: SPRINGS.editorial,
  });

  const exitOpacity = interpolate(frame, [totalDur - 10, totalDur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const overallProgress = interpolate(frame, [0, totalDur], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Generous real-UI viewport sizing so authentic interface details stay razor-sharp
  const browserW = isVertical ? 992 : 1408;
  const browserH = isVertical ? 658 : 880; // Matches 16:10 recorded aspect + 38px chrome cleanly

  return (
    <FeyBackdrop variant="cream">
      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: isVertical ? "center" : "space-between",
          padding: isVertical ? "148px 44px 142px" : "34px 80px 38px",
          gap: isVertical ? 36 : 16,
        }}
      >
        {/* Top Editorial Header: Badge + Step Pills + Concise Caption */}
        <div
          style={{
            width: browserW,
            display: "flex",
            flexDirection: "column",
            alignItems: isVertical ? "center" : "stretch",
            gap: isVertical ? 22 : 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isVertical ? "center" : "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <EditorialBadge label={badge} tone="olive" delay={0} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
              {scheduled.map((seg, idx) => {
                const isCur = idx === activeIdx;
                const isPast = idx < activeIdx;
                return (
                  <div
                    key={seg.stepLabel}
                    style={{
                      padding: isVertical ? "7px 15px" : "5px 13px",
                      borderRadius: 999,
                      background: isCur
                        ? COLORS.terra
                        : isPast
                          ? "rgba(68, 78, 44, 0.12)"
                          : COLORS.bgCard,
                      border: `1px solid ${
                        isCur ? COLORS.terra : isPast ? COLORS.olive : COLORS.oliveDim
                      }`,
                      fontFamily: FONTS.display,
                      fontSize: isVertical ? 14 : 12.5,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      color: isCur ? "#FFFFFF" : isPast ? COLORS.olive : COLORS.muted,
                    }}
                  >
                    {seg.stepLabel}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            key={activeIdx}
            style={{
              textAlign: isVertical ? "center" : "left",
              opacity: interpolate(captionIn, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(captionIn, [0, 1], [12, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: isVertical ? 52 : 34,
                fontWeight: 700,
                color: COLORS.ink,
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
              }}
            >
              {active.headline}
            </div>
            {isVertical && active.sub && (
              <div
                style={{
                  marginTop: 12,
                  fontFamily: FONTS.sans,
                  fontSize: 22,
                  color: COLORS.muted,
                  lineHeight: 1.4,
                  maxWidth: 880,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {active.sub}
              </div>
            )}
          </div>
        </div>

        {/* Center Hero: Real Screen Recording inside Editorial BrowserFrame */}
        <div style={{ flexShrink: 0 }}>
          <BrowserFrame
            url={active.url}
            width={browserW}
            height={browserH}
            enterDelay={0}
          >
            {scheduled.map((seg, idx) => {
              const segZoom = isVertical
                ? seg.verticalZoom ?? [1.0, 1.02]
                : seg.zoom ?? [1.0, 1.015];
              const origin = isVertical
                ? seg.verticalOrigin ?? seg.origin ?? [50, 50]
                : seg.origin ?? [50, 50];

              return (
                <Sequence
                  key={`${seg.stepLabel}-${idx}`}
                  from={seg.from}
                  durationInFrames={seg.durationInFrames}
                  layout="none"
                >
                  <SegmentVideoLayer
                    clipFile={clipFile}
                    sourceStartSec={seg.sourceStartSec}
                    playbackRate={seg.playbackRate ?? 1}
                    durationInFrames={seg.durationInFrames}
                    zoom={segZoom}
                    origin={origin}
                    fadeIn={idx > 0}
                  />
                </Sequence>
              );
            })}
          </BrowserFrame>
        </div>

        {/* Subtle bottom progress hairline & quiet vertical footer */}
        <div
          style={{
            width: browserW,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: isVertical ? 18 : 0,
          }}
        >
          <div
            style={{
              width: "100%",
              height: 3,
              borderRadius: 99,
              background: COLORS.oliveDim,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${overallProgress}%`,
                background: COLORS.terra,
                borderRadius: 99,
              }}
            />
          </div>
          {isVertical && (
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: COLORS.muted,
              }}
            >
              Real App Footage · Fey Beta
            </div>
          )}
        </div>
      </AbsoluteFill>
    </FeyBackdrop>
  );
};

interface SegmentVideoLayerProps {
  clipFile: string;
  sourceStartSec: number;
  playbackRate: number;
  durationInFrames: number;
  zoom: [number, number];
  origin: [number, number];
  fadeIn: boolean;
}

const SegmentVideoLayer: React.FC<SegmentVideoLayerProps> = ({
  clipFile,
  sourceStartSec,
  playbackRate,
  durationInFrames,
  zoom,
  origin,
  fadeIn,
}) => {
  const local = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = interpolate(local, [0, durationInFrames], zoom, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const opacity = fadeIn
    ? interpolate(local, [0, 6], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <AbsoluteFill
      style={{
        opacity,
        overflow: "hidden",
        background: COLORS.bgBase,
      }}
    >
      <OffthreadVideo
        src={staticFile(clipFile)}
        startFrom={Math.max(0, Math.round(sourceStartSec * fps))}
        playbackRate={playbackRate}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          transformOrigin: `${origin[0]}% ${origin[1]}%`,
        }}
      />
    </AbsoluteFill>
  );
};
