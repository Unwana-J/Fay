import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FeyBackdrop } from "./components/FeyBackdrop";
import { FeyButterfly } from "./components/FeyButterfly";
import { MicIcon } from "./components/MotionPrimitives";
import { OpeningAudioLayer, OpeningSequence } from "./components/OpeningSequence";
import "./styles/fonts.css";
import { COLORS, FONTS, SPRINGS, TEASER_FRAMES } from "./theme";

const TEASER_SFX = [
  { from: 176, file: "audio/sfx/tap-soft.wav", volume: 0.32 },
  // 4 tactile tabletop board placements
  { from: 192, file: "audio/sfx/tap-soft.wav", volume: 0.36 },
  { from: 204, file: "audio/sfx/tap-soft.wav", volume: 0.36 },
  { from: 216, file: "audio/sfx/tap-soft.wav", volume: 0.36 },
  { from: 228, file: "audio/sfx/tap-soft.wav", volume: 0.38 },
  { from: 266, file: "audio/sfx/correct-chime.wav", volume: 0.34 },
  // End card BETA ink seal
  { from: 362, file: "audio/sfx/stamp-thump.wav", volume: 0.72 },
  { from: 374, file: "audio/sfx/unfold-shimmer.wav", volume: 0.36 },
];

/**
 * 15-Second Soft-Launch Film (450 frames @ 30fps)
 * Restrained, high-taste editorial pacing with NYT-Games-style tactile Game Boards:
 *   0.0–3.0s   Chalkboard:  Type-on "What if learning felt less like scrolling..." + accelerating feed
 *   3.0–5.9s   Hard cut:    Cream calm "...and more like a great conversation?"
 *   5.9–11.3s  Boards:      "Read. Speak. Play." + The Study live waveform + 4 tactile Game Boards
 *   11.3–15.0s End card:    Fey · BETA · fey.lokinlabs.com.ng · "Now open. Come think."
 */
export const FeyTeaserVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Music starts softly during the dark type-on, then lifts cleanly at the frame-90 hard cut
  const musicVol = (f: number) => {
    const env = interpolate(
      f,
      [0, 12, 88, 92, TEASER_FRAMES - 44, TEASER_FRAMES],
      [0, 0.38, 0.42, 0.60, 0.60, 0],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
    const stampDuck = interpolate(f, [356, 363, 378, 392], [1, 0.54, 0.78, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return env * stampDuck;
  };

  // Beat 3 (176..340f): Read. Speak. Play. + The Study Strip + 4 Tactile Game Boards
  const b3Local = Math.max(0, frame - 176);
  const b3HeadIn = spring({ frame: b3Local, fps, config: SPRINGS.editorial });
  const b3Out = interpolate(frame, [328, 342], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Beat 4 (340..450f): Quiet Confident End Card
  const b4Local = Math.max(0, frame - 340);
  const endIn = spring({ frame: b4Local, fps, config: SPRINGS.editorial });
  const stampSpring = spring({ frame: Math.max(0, frame - 362), fps, config: SPRINGS.heavyStamp });
  const stampScale = interpolate(stampSpring, [0, 1], [2.2, 1]);
  const ctaSpring = spring({ frame: Math.max(0, frame - 378), fps, config: SPRINGS.editorial });
  const shimmer = interpolate(frame, [350, 390], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const boards = [
    {
      id: "articulate",
      title: "Articulate",
      subtitle: "Host a room. Speak on your team's turn.",
      accent: COLORS.terra,
      surface: "#FDF7F7",
      border: "rgba(122, 28, 46, 0.24)",
      shotBorder: "rgba(122, 28, 46, 0.16)",
      shotBg: "#F7F5F0",
      badge: "ONLINE ROOM",
      delay: 16,
      shot: "shots/card-articulate.png",
    },
    {
      id: "podium",
      title: "The Podium",
      subtitle: "Spin a hot take. Defend 5 slides.",
      accent: COLORS.gold,
      surface: "#FCF9F0",
      border: "rgba(166, 124, 30, 0.28)",
      shotBorder: "rgba(30, 38, 24, 0.28)",
      shotBg: "#1C2418",
      badge: "SLIDE DECK",
      delay: 28,
      shot: "shots/card-podium.png",
    },
    {
      id: "trivia",
      title: "Naija Trivia",
      subtitle: "1,000+ questions. 1v1 & crew leagues.",
      accent: "#1E5B37",
      surface: "#F4F9F5",
      border: "rgba(30, 91, 55, 0.24)",
      shotBorder: "rgba(30, 91, 55, 0.18)",
      shotBg: "#FFFFFF",
      badge: "CULTURE & LEAGUES",
      delay: 40,
      shot: "shots/card-trivia.png",
    },
    {
      id: "quant",
      title: "Quant",
      subtitle: "25s Quantitative Reasoning sprints.",
      accent: COLORS.olive,
      surface: "#F5F6F0",
      border: "rgba(68, 78, 44, 0.26)",
      shotBorder: "rgba(68, 78, 44, 0.18)",
      shotBg: "#FFFFFF",
      badge: "MENTAL ARENA",
      delay: 52,
      shot: "shots/card-quant.png",
    },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.bgBase }}>
      <Audio src={staticFile("audio/music.mp3")} startFrom={Math.round(42.8 * 30)} volume={musicVol} />

      <OpeningAudioLayer />

      {TEASER_SFX.map((cue, idx) => (
        <Sequence key={`${cue.file}-${idx}`} from={cue.from} durationInFrames={42}>
          <Audio src={staticFile(cue.file)} volume={cue.volume} />
        </Sequence>
      ))}

      {/* BEATS 1 & 2 (0..176f): 3.0s Dark Type-On -> Hard Cut @ f90 -> Calm Cream Answer */}
      {frame < 176 && <OpeningSequence durationInFrames={176} fadeOutFrames={10} />}

      {/* REMAINING BEATS (174..450f) */}
      {frame >= 174 && (
        <AbsoluteFill>
          <FeyBackdrop variant="cream">
            {/* BEAT 3 (176..342f): READ. SPEAK. PLAY. + THE STUDY BAR + 4 TACTILE GAME BOARDS */}
            {frame >= 174 && frame < 344 && (
              <AbsoluteFill
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  gap: isVertical ? 30 : 28,
                  padding: isVertical ? "96px 56px" : "68px 88px",
                  opacity: b3Out,
                }}
              >
                {/* Header + Compact Daily Study Live-Mic Strip */}
                <div
                  style={{
                    width: "100%",
                    maxWidth: isVertical ? 940 : 1660,
                    display: "flex",
                    flexDirection: isVertical ? "column" : "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: isVertical ? 20 : 24,
                    opacity: interpolate(b3HeadIn, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(b3HeadIn, [0, 1], [20, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONTS.serif,
                      fontSize: isVertical ? 76 : 74,
                      fontWeight: 700,
                      color: COLORS.ink,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.04,
                    }}
                  >
                    Read.{" "}
                    <span style={{ color: COLORS.terra, fontStyle: "italic", paddingRight: 4 }}>
                      Speak.
                    </span>{" "}
                    Play.
                  </div>

                  {/* Sleek Daily Study live-mic bar */}
                  <div
                    style={{
                      background: COLORS.bgCard,
                      border: `1.5px solid ${COLORS.terraBorder}`,
                      borderRadius: 16,
                      padding: isVertical ? "16px 24px" : "16px 26px",
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      boxShadow: "0 12px 32px rgba(122, 28, 46, 0.08)",
                      width: isVertical ? "100%" : "auto",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: COLORS.terraSoft,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MicIcon size={19} color={COLORS.terra} />
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: FONTS.display,
                            fontSize: 11.5,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            color: COLORS.terra,
                          }}
                        >
                          THE STUDY · DAILY SPRINTS
                        </div>
                        <div
                          style={{
                            fontFamily: FONTS.serif,
                            fontSize: 19,
                            fontWeight: 700,
                            color: COLORS.ink,
                          }}
                        >
                          Read cited sources. Explain in 90s.
                        </div>
                      </div>
                    </div>

                    {/* Live waveform */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4, height: 28 }}>
                      {Array.from({ length: 12 }).map((_, i) => {
                        const env = Math.sin((i / 11) * Math.PI);
                        const h = 6 + Math.abs(Math.sin(b3Local * 0.3 + i * 0.7)) * 22 * (0.35 + 0.65 * env);
                        return (
                          <div
                            key={i}
                            style={{
                              width: 4,
                              height: h,
                              borderRadius: 99,
                              background: i % 3 === 0 ? COLORS.olive : COLORS.terra,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4 Tactile Tabletop Game Boards (4-up desktop, 2x2 vertical) */}
                <div
                  style={{
                    width: "100%",
                    maxWidth: isVertical ? 940 : 1660,
                    display: "grid",
                    gridTemplateColumns: isVertical ? "1fr 1fr" : "repeat(4, 1fr)",
                    gap: isVertical ? 22 : 24,
                  }}
                >
                  {boards.map((board, idx) => {
                    const s = spring({
                      frame: Math.max(0, b3Local - board.delay),
                      fps,
                      config: SPRINGS.snappy,
                    });
                    const initTilt = idx % 2 === 0 ? -3.5 : 3.5;

                    return (
                      <div
                        key={board.id}
                        style={{
                          background: board.surface,
                          border: `1.5px solid ${board.border}`,
                          borderRadius: 22,
                          padding: isVertical ? "20px 20px 22px" : "22px 22px 26px",
                          boxShadow: "0 20px 48px rgba(30, 35, 18, 0.09)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                          opacity: interpolate(s, [0, 1], [0, 1]),
                          transform: `translateY(${interpolate(s, [0, 1], [48, 0])}px) rotate(${interpolate(s, [0, 1], [initTilt, 0])}deg) scale(${interpolate(s, [0, 1], [0.94, 1])})`,
                        }}
                      >
                        {/* Top badge */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span
                            style={{
                              fontFamily: FONTS.display,
                              fontSize: 11.5,
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              color: board.accent,
                            }}
                          >
                            {board.badge}
                          </span>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: board.accent,
                            }}
                          />
                        </div>

                        {/* Real app screen preview with subtle Ken Burns push-in */}
                        <div
                          style={{
                            width: "100%",
                            height: isVertical ? 236 : 212,
                            borderRadius: 14,
                            overflow: "hidden",
                            background: board.shotBg,
                            border: `1px solid ${board.shotBorder}`,
                            boxShadow: "0 8px 20px rgba(30, 35, 18, 0.08)",
                            position: "relative",
                          }}
                        >
                          <Img
                            src={staticFile(board.shot)}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center center",
                              transform: `scale(${interpolate(
                                Math.max(0, b3Local - board.delay),
                                [0, 140],
                                [1.0, 1.045],
                                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                              )})`,
                              transformOrigin: "center center",
                            }}
                          />
                        </div>

                        {/* Title & punchy line */}
                        <div>
                          <div
                            style={{
                              fontFamily: FONTS.serif,
                              fontSize: isVertical ? 30 : 32,
                              fontWeight: 700,
                              color: COLORS.ink,
                              lineHeight: 1.1,
                            }}
                          >
                            {board.title}
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              fontFamily: FONTS.sans,
                              fontSize: isVertical ? 16 : 16,
                              color: COLORS.muted,
                              lineHeight: 1.35,
                            }}
                          >
                            {board.subtitle}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AbsoluteFill>
            )}

            {/* BEAT 4 (340..450f): QUIET CONFIDENT END CARD */}
            {frame >= 340 && (
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
                    opacity: interpolate(endIn, [0, 1], [0, 1]),
                    transform: `scale(${interpolate(endIn, [0, 1], [0.85, 1])})`,
                  }}
                >
                  <FeyButterfly
                    size={isVertical ? 204 : 190}
                    unfold={1}
                    flutter={Math.sin(frame * 0.14) * 1.8}
                    shimmer={frame >= 350 && frame <= 392 ? shimmer : -1}
                  />
                </div>

                <div
                  style={{
                    marginTop: 28,
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    opacity: interpolate(endIn, [0, 1], [0, 1]),
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONTS.serif,
                      fontSize: 124,
                      fontWeight: 700,
                      color: COLORS.ink,
                      lineHeight: 0.95,
                    }}
                  >
                    Fey
                  </div>

                  {frame >= 361 && (
                    <div
                      style={{
                        transform: `scale(${stampScale}) rotate(-6deg)`,
                        padding: 6,
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
                          padding: "8px 22px",
                          fontFamily: FONTS.display,
                          fontSize: 34,
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

                <div
                  style={{
                    marginTop: 34,
                    padding: "13px 34px",
                    borderRadius: 999,
                    background: COLORS.bgCard,
                    border: `1.5px solid ${COLORS.oliveDim}`,
                    fontFamily: FONTS.display,
                    fontSize: 30,
                    fontWeight: 600,
                    color: COLORS.olive,
                    opacity: interpolate(ctaSpring, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(ctaSpring, [0, 1], [16, 0])}px)`,
                  }}
                >
                  fey.lokinlabs.com.ng
                </div>

                <div
                  style={{
                    marginTop: 26,
                    textAlign: "center",
                    fontFamily: FONTS.serif,
                    fontSize: 40,
                    fontWeight: 600,
                    color: COLORS.ink,
                    lineHeight: 1.25,
                    opacity: interpolate(ctaSpring, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(ctaSpring, [0, 1], [16, 0])}px)`,
                  }}
                >
                  Now open.{" "}
                  <span style={{ color: COLORS.terra, fontStyle: "italic" }}>Come think.</span>
                </div>
              </AbsoluteFill>
            )}
          </FeyBackdrop>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
