import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FeyBackdrop } from "./components/FeyBackdrop";
import { FeyButterfly } from "./components/FeyButterfly";
import { CheckIcon, MicIcon } from "./components/MotionPrimitives";
import "./styles/fonts.css";
import { COLORS, FONTS, SPRINGS, TEASER_FRAMES } from "./theme";

const TEASER_SFX = [
  { from: 86, file: "audio/sfx/paper-split.wav", volume: 0.34 },
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
 *   0.0–2.9s   Chalkboard:  "What if learning felt less like scrolling…"
 *   2.9–5.9s   Cream paper: "…and more like a great conversation?"
 *   5.9–11.3s  Boards:      "Read. Speak. Play." + The Study live waveform + 4 tactile Game Boards
 *   11.3–15.0s End card:    Fey · BETA · fey.lokinlabs.com.ng · "Now open. Come think."
 */
export const FeyTeaserVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Music starts cleanly on the uplifting 0:42.8 chorus drop
  const musicVol = (f: number) => {
    const env = interpolate(f, [0, 10, TEASER_FRAMES - 44, TEASER_FRAMES], [0, 0.60, 0.60, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const stampDuck = interpolate(f, [356, 363, 378, 392], [1, 0.54, 0.78, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return env * stampDuck;
  };

  // Beat 1 (0..88f): Chalkboard hook
  const b1Wipe = interpolate(frame, [78, 92], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const b1Underline = interpolate(frame, [16, 48], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Beat 2 (88..176f): Cream answer
  const b2Local = Math.max(0, frame - 90);
  const b2In = spring({ frame: b2Local, fps, config: SPRINGS.editorial });
  const b2Underline = interpolate(frame, [112, 144], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const b2Out = interpolate(frame, [164, 176], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Beat 3 (176..340f): Read. Speak. Play. + The Study Strip + 4 Tactile Game Boards
  const b3Local = Math.max(0, frame - 176);
  const b3HeadIn = spring({ frame: b3Local, fps, config: SPRINGS.editorial });
  const b3Out = interpolate(frame, [328, 342], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Micro-animations inside the 4 game boards
  const artDash = interpolate(b3Local, [20, 140], [10, 56], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const podiumFan = spring({ frame: Math.max(0, b3Local - 46), fps, config: SPRINGS.snappy });
  const triviaHit = b3Local >= 88;
  const mathTick = Math.max(19, 25 - Math.floor(Math.max(0, b3Local - 48) / 18));

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
      subtitle: "Describe fast. No forbidden words.",
      accent: COLORS.terra,
      surface: "#FDF7F7",
      border: "rgba(122, 28, 46, 0.24)",
      badge: "WORD PARTY",
      delay: 16,
      visual: (
        <div
          style={{
            width: "100%",
            height: isVertical ? 148 : 158,
            borderRadius: 14,
            background: "#FFFFFF",
            border: "1px solid rgba(122, 28, 46, 0.16)",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: COLORS.terra,
              }}
            >
              CARD
            </span>
            {/* Draining 45s ring */}
            <div style={{ position: "relative", width: 38, height: 38 }}>
              <svg width="38" height="38" viewBox="0 0 38 38">
                <circle cx="19" cy="19" r="15" fill="none" stroke={COLORS.oliveDim} strokeWidth="3" />
                <circle
                  cx="19"
                  cy="19"
                  r="15"
                  fill="none"
                  stroke={COLORS.terra}
                  strokeWidth="3"
                  strokeDasharray="94"
                  strokeDashoffset={artDash}
                  strokeLinecap="round"
                  transform="rotate(-90 19 19)"
                />
              </svg>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONTS.display,
                  fontSize: 11,
                  fontWeight: 700,
                  color: COLORS.terra,
                }}
              >
                45s
              </span>
            </div>
          </div>

          <div
            style={{
              fontFamily: FONTS.serif,
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.ink,
              letterSpacing: "0.01em",
              lineHeight: 1,
            }}
          >
            OWAMBE
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            {["Party", "Lagos", "Aso Ebi"].map((w) => (
              <span
                key={w}
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: COLORS.terra,
                  background: COLORS.terraSoft,
                  padding: "3px 8px",
                  borderRadius: 6,
                  textDecoration: "line-through",
                }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "podium",
      title: "The Podium",
      subtitle: "Spin a hot take. Defend 5 slides.",
      accent: COLORS.gold,
      surface: "#FCF9F0",
      border: "rgba(166, 124, 30, 0.28)",
      badge: "SLIDE DECK",
      delay: 28,
      visual: (
        <div
          style={{
            width: "100%",
            height: isVertical ? 148 : 158,
            borderRadius: 14,
            background: COLORS.bgBase,
            border: "1px solid rgba(166, 124, 30, 0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 3-card fanned deck graphic */}
          {[
            { rot: -10, x: -34, bg: COLORS.bgCard, fg: COLORS.muted, label: "01", text: "THE TAKE" },
            { rot: 0, x: 0, bg: COLORS.terra, fg: "#FFFFFF", label: "02", text: "DEFEND IT" },
            { rot: 10, x: 34, bg: COLORS.bgCard, fg: COLORS.muted, label: "03", text: "VERDICT" },
          ].map((c, idx) => (
            <div
              key={c.label}
              style={{
                position: "absolute",
                width: 118,
                height: 88,
                borderRadius: 10,
                background: c.bg,
                border: `1.5px solid ${idx === 1 ? COLORS.terraDk : COLORS.oliveDim}`,
                padding: "10px 11px",
                boxShadow: "0 10px 22px rgba(30, 35, 18, 0.14)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transform: `translateX(${interpolate(podiumFan, [0, 1], [0, c.x])}px) rotate(${interpolate(podiumFan, [0, 1], [0, c.rot])}deg)`,
                zIndex: idx === 1 ? 3 : 1,
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: idx === 1 ? COLORS.goldLight : COLORS.gold,
                }}
              >
                SLIDE {c.label}
              </span>
              <span
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: 14,
                  fontWeight: 700,
                  color: c.fg,
                  lineHeight: 1.15,
                }}
              >
                {c.text}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "trivia",
      title: "Naija Trivia",
      subtitle: "1,000+ questions. 1v1 & Leagues.",
      accent: "#1E5B37",
      surface: "#F4F9F5",
      border: "rgba(30, 91, 55, 0.24)",
      badge: "CULTURE QUIZ",
      delay: 40,
      visual: (
        <div
          style={{
            width: "100%",
            height: isVertical ? 148 : 158,
            borderRadius: 14,
            background: "#FFFFFF",
            border: "1px solid rgba(30, 91, 55, 0.18)",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Minimalist Nigerian Green-White-Green architectural ribbon */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", width: 42, height: 14, borderRadius: 4, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
              <div style={{ flex: 1, background: "#1E6B3A" }} />
              <div style={{ flex: 1, background: "#FFFFFF" }} />
              <div style={{ flex: 1, background: "#1E6B3A" }} />
            </div>
            <span style={{ fontFamily: FONTS.display, fontSize: 11, fontWeight: 700, color: "#1E5B37" }}>
              1,000+ BANK
            </span>
          </div>

          {/* Mini A / B / C quiz rows with B lighting up green */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[
              { k: "A", w: "68%", win: false },
              { k: "B", w: "82%", win: true },
              { k: "C", w: "54%", win: false },
            ].map((row) => {
              const lit = row.win && triviaHit;
              return (
                <div
                  key={row.k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "5px 9px",
                    borderRadius: 8,
                    background: lit ? COLORS.correctBg : COLORS.bgBase,
                    border: `1px solid ${lit ? COLORS.correctBorder : COLORS.oliveDim}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        background: lit ? COLORS.correctBorder : COLORS.bgCard,
                        color: lit ? "#FFFFFF" : COLORS.muted,
                        fontFamily: FONTS.display,
                        fontSize: 11,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {row.k}
                    </span>
                    <div
                      style={{
                        height: 7,
                        width: row.w,
                        borderRadius: 99,
                        background: lit ? COLORS.correctBorder : "rgba(93, 98, 78, 0.25)",
                      }}
                    />
                  </div>
                  {lit && <CheckIcon size={14} color={COLORS.correctBorder} />}
                </div>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: "mathletics",
      title: "Mathletics",
      subtitle: "25s Quantitative Reasoning.",
      accent: COLORS.olive,
      surface: "#F5F6F0",
      border: "rgba(68, 78, 44, 0.26)",
      badge: "MENTAL ARENA",
      delay: 52,
      visual: (
        <div
          style={{
            width: "100%",
            height: isVertical ? 148 : 158,
            borderRadius: 14,
            background: "#FFFFFF",
            border: "1px solid rgba(68, 78, 44, 0.18)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          {/* Crisp 2x2 operator board tile */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 7,
              width: 102,
              height: 102,
              flexShrink: 0,
            }}
          >
            {[
              { op: "+", bg: COLORS.bgBase, fg: COLORS.olive },
              { op: "−", bg: COLORS.bgBase, fg: COLORS.olive },
              { op: "×", bg: COLORS.olive, fg: "#FFFFFF" },
              { op: "÷", bg: COLORS.terraSoft, fg: COLORS.terra },
            ].map((cell) => (
              <div
                key={cell.op}
                style={{
                  borderRadius: 10,
                  background: cell.bg,
                  color: cell.fg,
                  fontFamily: FONTS.display,
                  fontSize: 26,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cell.op}
              </div>
            ))}
          </div>

          {/* Live ticking sprint timer & sample badge */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flex: 1 }}>
            <div
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                background: COLORS.redSoft,
                border: `1.5px solid ${COLORS.red}`,
                fontFamily: FONTS.display,
                fontSize: 16,
                fontWeight: 700,
                color: COLORS.red,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {mathTick}s
            </div>
            <div
              style={{
                padding: "7px 10px",
                borderRadius: 8,
                background: "rgba(68, 78, 44, 0.08)",
                fontFamily: FONTS.display,
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.oliveText,
                whiteSpace: "nowrap",
              }}
            >
              [a, b → ?]
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.bgBase }}>
      <Audio src={staticFile("audio/music.mp3")} startFrom={Math.round(42.8 * 30)} volume={musicVol} />

      {TEASER_SFX.map((cue, idx) => (
        <Sequence key={`${cue.file}-${idx}`} from={cue.from} durationInFrames={42}>
          <Audio src={staticFile(cue.file)} volume={cue.volume} />
        </Sequence>
      ))}

      {/* BEAT 1 (0..92f): CHALKBOARD HOOK */}
      {frame < 94 && (
        <FeyBackdrop variant="chalk">
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: isVertical ? "0 86px" : "0 220px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                maxWidth: isVertical ? 880 : 1280,
                fontFamily: FONTS.serif,
                fontSize: isVertical ? 78 : 96,
                fontWeight: 500,
                color: COLORS.chalkText,
                lineHeight: 1.15,
                letterSpacing: "-0.025em",
              }}
            >
              What if learning felt less like{" "}
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  fontStyle: "italic",
                  color: COLORS.goldLight,
                  paddingRight: 5,
                }}
              >
                scrolling…
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: -7,
                    height: 4,
                    width: `${b1Underline}%`,
                    background: COLORS.goldLight,
                    borderRadius: 2,
                  }}
                />
              </span>
            </div>
          </AbsoluteFill>
        </FeyBackdrop>
      )}

      {/* CREAM CURTAIN & REMAINING BEATS (78..450f) */}
      {frame >= 78 && (
        <AbsoluteFill style={{ transform: frame < 92 ? `translateY(${b1Wipe}%)` : "none" }}>
          <FeyBackdrop variant="cream">
            {/* BEAT 2 (88..178f): "...and more like a great conversation?" */}
            {frame >= 86 && frame < 180 && (
              <AbsoluteFill
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  padding: isVertical ? "0 86px" : "0 210px",
                  textAlign: "center",
                  opacity: b2Out,
                }}
              >
                <div
                  style={{
                    maxWidth: isVertical ? 880 : 1280,
                    opacity: interpolate(b2In, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(b2In, [0, 1], [28, 0])}px)`,
                    fontFamily: FONTS.serif,
                    fontSize: isVertical ? 78 : 96,
                    fontWeight: 700,
                    color: COLORS.ink,
                    lineHeight: 1.14,
                    letterSpacing: "-0.025em",
                  }}
                >
                  …and more like a great{" "}
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
                        width: `${b2Underline}%`,
                        background: COLORS.terra,
                        borderRadius: 3,
                      }}
                    />
                  </span>
                </div>
              </AbsoluteFill>
            )}

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

                        {/* Signature mini-board graphic */}
                        {board.visual}

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
