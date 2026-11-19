import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { FeyBackdrop } from "../components/FeyBackdrop";
import { CheckIcon, EditorialBadge, RevealLine, TimerIcon } from "../components/MotionPrimitives";
import { COLORS, FONTS, SPRINGS, TIMELINE } from "../theme";

interface GameStageProps {
  badge: string;
  title: string;
  headline: React.ReactNode;
  tieIn: string;
  browser: React.ReactNode;
  overlay?: React.ReactNode;
}

const GameStage: React.FC<GameStageProps> = ({
  badge,
  title,
  headline,
  tieIn,
  browser,
  overlay,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const tieInSpring = spring({
    frame: Math.max(0, frame - 82),
    fps,
    config: SPRINGS.editorial,
  });

  // Subtle scene exit fade in the final 10 frames (153-154f per game)
  const exitOpacity = interpolate(frame, [143, 153], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <FeyBackdrop variant="cream">
      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          flexDirection: isVertical ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: isVertical ? 42 : 64,
          padding: isVertical ? "94px 64px 86px" : "76px 96px",
        }}
      >
        {/* Editorial copy column */}
        <div
          style={{
            flex: isVertical ? "0 0 auto" : "0 0 640px",
            width: isVertical ? "100%" : 640,
            display: "flex",
            flexDirection: "column",
            alignItems: isVertical ? "center" : "flex-start",
            textAlign: isVertical ? "center" : "left",
            gap: isVertical ? 16 : 20,
          }}
        >
          <EditorialBadge label={badge} tone="olive" delay={2} />

          <RevealLine delay={6}>
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: isVertical ? 32 : 30,
                fontWeight: 700,
                color: COLORS.olive,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </div>
          </RevealLine>

          <RevealLine delay={11}>
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: isVertical ? 58 : 64,
                fontWeight: 700,
                color: COLORS.ink,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
              }}
            >
              {headline}
            </div>
          </RevealLine>

          {/* Feynman tie-in line (shown inline on desktop; below browser on vertical) */}
          {!isVertical && (
            <div
              style={{
                marginTop: 18,
                paddingTop: 22,
                borderTop: `1.5px solid ${COLORS.oliveDim}`,
                width: "100%",
                opacity: interpolate(tieInSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(tieInSpring, [0, 1], [18, 0])}px)`,
                fontFamily: FONTS.serif,
                fontStyle: "italic",
                fontSize: 28,
                color: COLORS.terra,
                lineHeight: 1.3,
              }}
            >
              {tieIn}
            </div>
          )}
        </div>

        {/* Browser showcase + floating interactive pop-out */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          {browser}
          {overlay}
        </div>

        {/* Vertical Feynman tie-in footer */}
        {isVertical && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 24,
              borderTop: `1.5px solid ${COLORS.oliveDim}`,
              width: "92%",
              textAlign: "center",
              opacity: interpolate(tieInSpring, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(tieInSpring, [0, 1], [18, 0])}px)`,
              fontFamily: FONTS.serif,
              fontStyle: "italic",
              fontSize: 34,
              color: COLORS.terra,
              lineHeight: 1.3,
            }}
          >
            {tieIn}
          </div>
        )}
      </AbsoluteFill>
    </FeyBackdrop>
  );
};

/* ============================================================================
 * GAME 1: ARTICULATE (Describe it. Don't say it.)
 * ========================================================================== */
const ArticulateScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const cardIn = spring({
    frame: Math.max(0, frame - 34),
    fps,
    config: SPRINGS.editorial,
  });

  // Live 45s countdown draining from 45 -> 40
  const secondsLeft = Math.max(40, 45 - Math.floor(Math.max(0, frame - 36) / 24));
  const ringProgress = interpolate(frame, [36, 160], [0.06, 0.34], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const circumference = 2 * Math.PI * 22;

  const forbidden = ["Rice", "Tomato", "Party"];

  return (
    <GameStage
      badge="01 / 04 · Word Party Game"
      title="Fey Articulate"
      headline={
        <>
          Describe it.
          <br />
          Don&apos;t say it.
        </>
      }
      tieIn="If you can explain it simply, you truly know it."
      browser={
        <BrowserFrame
          shot="shots/articulate-lobby.png"
          url="fey.lokinlabs.com.ng/play"
          width={isVertical ? 940 : 980}
          height={isVertical ? 610 : 640}
          enterDelay={6}
          zoomFrom={1.0}
          zoomTo={1.035}
        />
      }
      overlay={
        <div
          style={{
            position: "absolute",
            right: isVertical ? 24 : -26,
            bottom: isVertical ? -42 : -28,
            width: isVertical ? 410 : 380,
            background: COLORS.bgCard,
            borderRadius: 20,
            border: `1.5px solid ${COLORS.oliveDim}`,
            boxShadow: "0 26px 60px rgba(30, 35, 18, 0.22)",
            padding: "24px 26px",
            opacity: interpolate(cardIn, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(cardIn, [0, 1], [44, 0])}px) scale(${interpolate(cardIn, [0, 1], [0.92, 1])})`,
          }}
        >
          {/* Card top bar: category + draining 45s ring */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                background: "rgba(68, 78, 44, 0.1)",
                fontFamily: FONTS.display,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.09em",
                color: COLORS.olive,
              }}
            >
              CULTURE CARD
            </div>

            <div style={{ position: "relative", width: 54, height: 54 }}>
              <svg width="54" height="54" viewBox="0 0 54 54">
                <circle cx="27" cy="27" r="22" fill="none" stroke={COLORS.oliveDim} strokeWidth="4" />
                <circle
                  cx="27"
                  cy="27"
                  r="22"
                  fill="none"
                  stroke={COLORS.terra}
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * ringProgress}
                  strokeLinecap="round"
                  transform="rotate(-90 27 27)"
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONTS.display,
                  fontSize: 15,
                  fontWeight: 700,
                  color: COLORS.terra,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {secondsLeft}s
              </div>
            </div>
          </div>

          {/* Target word */}
          <div
            style={{
              marginTop: 10,
              fontFamily: FONTS.serif,
              fontSize: 44,
              fontWeight: 700,
              color: COLORS.ink,
              letterSpacing: "0.02em",
            }}
          >
            JOLLOF
          </div>

          {/* Forbidden words struck through one by one */}
          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop: `1px solid ${COLORS.oliveDim}`,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: COLORS.subtle,
                marginBottom: 10,
              }}
            >
              FORBIDDEN WORDS
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {forbidden.map((word, idx) => {
                const strikeW = interpolate(frame, [58 + idx * 14, 72 + idx * 14], [0, 100], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.cubic),
                });
                return (
                  <div
                    key={word}
                    style={{
                      position: "relative",
                      padding: "6px 14px",
                      borderRadius: 9,
                      background: COLORS.terraSoft,
                      border: `1px solid ${COLORS.terraBorder}`,
                      fontFamily: FONTS.sans,
                      fontSize: 15,
                      fontWeight: 600,
                      color: COLORS.terra,
                    }}
                  >
                    {word}
                    <div
                      style={{
                        position: "absolute",
                        left: 8,
                        right: 8,
                        top: "50%",
                        height: 2.5,
                        background: COLORS.terra,
                        borderRadius: 2,
                        transformOrigin: "left center",
                        transform: `scaleX(${strikeW / 100})`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      }
    />
  );
};

/* ============================================================================
 * GAME 2: THE PODIUM (Nigerian Customer Service is a Spiritual Test)
 * ========================================================================== */
const PODIUM_SLIDES = [
  { num: "01", title: "Nigerian Customer Service is a Spiritual Test", accent: true },
  { num: "02", title: 'Exhibit A: "Send DM for Price"', accent: false },
  { num: "03", title: 'The "I Am Coming" Paradox', accent: false },
  { num: "04", title: "Why Patience Is a Survival Skill", accent: false },
  { num: "05", title: "Case Closed. Any Questions?", accent: false },
];

const PodiumScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  return (
    <GameStage
      badge="02 / 04 · Slide Presentation Game"
      title="The Podium"
      headline="Spin a hot take. Build 5 slides. Defend it."
      tieIn="Think fast, structure your argument, hold the room."
      browser={
        <BrowserFrame
          shot="shots/podium-home.png"
          secondShot="shots/podium-spin.png"
          crossfadeAt={28}
          crossfadeDuration={10}
          url="fey.lokinlabs.com.ng/podium"
          width={isVertical ? 940 : 980}
          height={isVertical ? 610 : 640}
          enterDelay={4}
          zoomFrom={1.0}
          zoomTo={1.035}
        />
      }
      overlay={
        /* 5-slide mini deck cleanly spread so every slide title reads effortlessly */
        <div
          style={{
            position: "absolute",
            left: isVertical ? 14 : 24,
            right: isVertical ? 14 : -24,
            bottom: isVertical ? -54 : -42,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          {PODIUM_SLIDES.map((slide, idx) => {
            const s = spring({
              frame: Math.max(0, frame - (54 + idx * 7)),
              fps,
              config: SPRINGS.snappy,
            });
            const angle = (idx - 2) * 1.8;
            const lift = idx === 0 ? -8 : Math.abs(idx - 2) * 3;
            return (
              <div
                key={slide.num}
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: isVertical ? 122 : 124,
                  background: slide.accent ? COLORS.terra : COLORS.bgCard,
                  color: slide.accent ? "#FFFFFF" : COLORS.ink,
                  border: `1.5px solid ${slide.accent ? COLORS.terraDk : COLORS.oliveDim}`,
                  borderRadius: 12,
                  padding: "12px 13px",
                  boxShadow: "0 16px 34px rgba(30, 35, 18, 0.16)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  opacity: interpolate(s, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(s, [0, 1], [44, lift])}px) rotate(${interpolate(s, [0, 1], [0, angle])}deg)`,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    opacity: slide.accent ? 0.85 : 0.65,
                    color: slide.accent ? "#F4EFE6" : COLORS.olive,
                  }}
                >
                  SLIDE {slide.num}
                </div>
                <div
                  style={{
                    fontFamily: FONTS.serif,
                    fontSize: 13.5,
                    fontWeight: 700,
                    lineHeight: 1.24,
                  }}
                >
                  {slide.title}
                </div>
              </div>
            );
          })}
        </div>
      }
    />
  );
};

/* ============================================================================
 * GAME 3: NAIJA TRIVIA (Hakeem Olajuwon — B · 1994 -> +150 XP)
 * ========================================================================== */
const HAKEEM_OPTIONS = [
  { key: "A", label: "1992", correct: false },
  { key: "B", label: "1994", correct: true },
  { key: "C", label: "1996", correct: false },
  { key: "D", label: "1998", correct: false },
];

const TriviaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Reveal interactive Hakeem question card cleanly over the real Trivia screenshot at frame 24
  const qPanelIn = spring({
    frame: Math.max(0, frame - 22),
    fps,
    config: SPRINGS.editorial,
  });

  // Answer B · 1994 locks in at frame 76
  const answered = frame >= 76;
  const answerSpring = spring({
    frame: Math.max(0, frame - 76),
    fps,
    config: SPRINGS.snappy,
  });

  // +150 XP floats up in bronze gold at frame 86
  const xpSpring = spring({
    frame: Math.max(0, frame - 86),
    fps,
    config: SPRINGS.snappy,
  });

  return (
    <GameStage
      badge="03 / 04 · 1,000+ Questions"
      title="Naija Trivia"
      headline="How well do you really know Naija?"
      tieIn="Play solo, 1v1 duels, or turn a missed question into a 60s voice sprint."
      browser={
        <BrowserFrame
          shot="shots/trivia-home.png"
          url="fey.lokinlabs.com.ng/games/trivia"
          width={isVertical ? 940 : 980}
          height={isVertical ? 610 : 640}
          enterDelay={4}
          zoomFrom={1.0}
          zoomTo={1.04}
        >
          {/* Crisp recreation of Fey's live Trivia view with the user's Hakeem Olajuwon question */}
          <AbsoluteFill
            style={{
              background: COLORS.bgBase,
              opacity: interpolate(qPanelIn, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(qPanelIn, [0, 1], [24, 0])}px)`,
              padding: isVertical ? "32px 54px" : "36px 76px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Top progress strip matching Fey Trivia UI */}
            <div style={{ marginBottom: 26 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: COLORS.olive,
                    }}
                  >
                    SPORTS
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "2px 9px",
                      borderRadius: 6,
                      background: COLORS.goldSoft,
                      color: COLORS.gold,
                    }}
                  >
                    Medium
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.ink,
                  }}
                >
                  5 / 15
                </span>
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.muted,
                  }}
                >
                  4:09
                </span>
              </div>
              <div
                style={{
                  height: 5,
                  borderRadius: 99,
                  background: COLORS.oliveDim,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: answered ? "38%" : "33%",
                    height: "100%",
                    background: COLORS.olive,
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>

            {/* Question prompt */}
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: isVertical ? 28 : 30,
                fontWeight: 700,
                color: COLORS.ink,
                lineHeight: 1.24,
                marginBottom: 24,
                letterSpacing: "-0.015em",
              }}
            >
              In what year did Lagos-born NBA Hall of Famer Hakeem &apos;The Dream&apos; Olajuwon lead
              the Houston Rockets to their first NBA Championship?
            </div>

            {/* Answer options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {HAKEEM_OPTIONS.map((opt) => {
                const isWinner = opt.correct && answered;
                const rowScale = isWinner ? interpolate(answerSpring, [0, 0.5, 1], [1, 1.02, 1]) : 1;

                return (
                  <div
                    key={opt.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 18px",
                      borderRadius: 12,
                      background: isWinner ? COLORS.correctBg : COLORS.bgCard,
                      border: `1.5px solid ${isWinner ? COLORS.correctBorder : COLORS.oliveDim}`,
                      transform: `scale(${rowScale})`,
                      boxShadow: isWinner ? "0 8px 22px rgba(46, 107, 67, 0.14)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: isWinner ? COLORS.correctBorder : COLORS.bgPanel,
                          color: isWinner ? "#FFFFFF" : COLORS.muted,
                          fontFamily: FONTS.display,
                          fontSize: 13,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {opt.key}
                      </div>
                      <span
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: 18,
                          fontWeight: isWinner ? 700 : 500,
                          color: isWinner ? COLORS.correctText : COLORS.ink,
                        }}
                      >
                        {opt.label}
                      </span>
                    </div>

                    {isWinner && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          opacity: interpolate(answerSpring, [0, 1], [0, 1]),
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FONTS.display,
                            fontSize: 13,
                            fontWeight: 700,
                            color: COLORS.correctText,
                          }}
                        >
                          CORRECT
                        </span>
                        <CheckIcon size={18} color={COLORS.correctBorder} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
        </BrowserFrame>
      }
      overlay={
        /* Gold +150 XP reward pill popping on correct answer */
        frame >= 84 ? (
          <div
            style={{
              position: "absolute",
              right: isVertical ? 24 : -22,
              top: isVertical ? -28 : -24,
              padding: "14px 24px",
              borderRadius: 16,
              background: COLORS.bgCard,
              border: `2px solid ${COLORS.gold}`,
              boxShadow: "0 20px 44px rgba(166, 124, 30, 0.24)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: interpolate(xpSpring, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(xpSpring, [0, 1], [32, 0])}px) scale(${interpolate(xpSpring, [0, 1], [0.82, 1])})`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 30,
                fontWeight: 700,
                color: COLORS.gold,
                letterSpacing: "-0.02em",
              }}
            >
              +150 XP
            </span>
          </div>
        ) : null
      }
    />
  );
};

/* ============================================================================
 * GAME 4: MATHLETICS (Real Quantitative Reasoning — m_quant_024)
 * ========================================================================== */
const QUANT_OPTIONS = [
  { key: "A", label: "46", correct: false },
  { key: "B", label: "50", correct: false },
  { key: "C", label: "52", correct: false },
  { key: "D", label: "54", correct: true },
];

const MathleticsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // Reveal live Quantitative Reasoning round over real mathletics-home.png at frame 22
  const qPanelIn = spring({
    frame: Math.max(0, frame - 22),
    fps,
    config: SPRINGS.editorial,
  });

  // Countdown ticks 12s -> 7s, crossing into urgency red (#B53A3A) below 10s
  const tickVal = Math.max(7, 12 - Math.floor(Math.max(0, frame - 30) / 18));
  const isUrgent = tickVal < 10;
  const timerPct = interpolate(frame, [24, 138], [52, 26], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // D · 54 locks in right as the Mental Shortcut completes at frame 96
  const answered = frame >= 96;
  const answerSpring = spring({
    frame: Math.max(0, frame - 96),
    fps,
    config: SPRINGS.snappy,
  });

  const cardIn = spring({
    frame: Math.max(0, frame - 42),
    fps,
    config: SPRINGS.editorial,
  });

  const eqTokens = ["(4 + 5)", "×", "6", "=", "54"];

  return (
    <GameStage
      badge="04 / 04 · Live Mental Arena"
      title="Quant"
      headline="25 seconds. No calculator."
      tieIn="Still got that Primary 5 quantitative sharpness?"
      browser={
        <BrowserFrame
          shot="shots/mathletics-home.png"
          url="fey.lokinlabs.com.ng/games/mathletics"
          width={isVertical ? 940 : 980}
          height={isVertical ? 610 : 640}
          enterDelay={4}
          zoomFrom={1.0}
          zoomTo={1.035}
        >
          {/* Pixel-faithful live Quant Quantitative Reasoning view (m_quant_024) */}
          <AbsoluteFill
            style={{
              background: COLORS.bgBase,
              opacity: interpolate(qPanelIn, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(qPanelIn, [0, 1], [24, 0])}px)`,
              padding: isVertical ? "28px 46px 70px" : "30px 64px 72px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            {/* Header row matching Fey Quant UI */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 999,
                      border: `1px solid ${COLORS.olive}`,
                      fontFamily: FONTS.display,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: COLORS.olive,
                    }}
                  >
                    MENTAL ARENA
                  </span>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: COLORS.muted }}>
                    25s Sprint
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 28,
                    fontWeight: 700,
                    color: COLORS.ink,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Quant
                </div>
              </div>

              {/* Live stopwatch pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 15px",
                  borderRadius: 999,
                  background: isUrgent ? COLORS.redSoft : COLORS.bgCard,
                  border: `1.5px solid ${isUrgent ? COLORS.red : COLORS.oliveDim}`,
                  color: isUrgent ? COLORS.red : COLORS.ink,
                  fontFamily: FONTS.display,
                  fontSize: 16,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <TimerIcon size={16} color={isUrgent ? COLORS.red : COLORS.olive} />
                {tickVal}s
              </div>
            </div>

            {/* Category & draining countdown bar */}
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: COLORS.muted,
                  }}
                >
                  QUESTION 1 OF 10 ·{" "}
                  <span style={{ color: COLORS.olive }}>Quantitative Reasoning · Medium</span>
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 99,
                  background: COLORS.oliveDim,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${timerPct}%`,
                    height: "100%",
                    background: isUrgent ? COLORS.red : COLORS.olive,
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>

            {/* White broadside question card */}
            <div
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.oliveDim}`,
                borderRadius: 18,
                padding: isVertical ? "24px 26px" : "26px 32px",
                boxShadow: "0 8px 26px rgba(30, 35, 18, 0.04)",
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: isVertical ? 24 : 26,
                  fontWeight: 600,
                  color: COLORS.ink,
                  lineHeight: 1.38,
                  marginBottom: 20,
                }}
              >
                Study the number boxes:{" "}
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 700,
                    color: COLORS.olive,
                    background: "rgba(68, 78, 44, 0.08)",
                    padding: "2px 10px",
                    borderRadius: 8,
                    whiteSpace: "nowrap",
                  }}
                >
                  [2, 3, 4 → 20]
                </span>{" "}
                and{" "}
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 700,
                    color: COLORS.olive,
                    background: "rgba(68, 78, 44, 0.08)",
                    padding: "2px 10px",
                    borderRadius: 8,
                    whiteSpace: "nowrap",
                  }}
                >
                  [3, 4, 5 → 35]
                </span>
                . What is{" "}
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontWeight: 700,
                    color: COLORS.terra,
                    background: COLORS.terraSoft,
                    padding: "2px 10px",
                    borderRadius: 8,
                    whiteSpace: "nowrap",
                  }}
                >
                  [4, 5, 6 → ?]
                </span>
              </div>

              {/* 2x2 options grid matching real Mathletics UI */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {QUANT_OPTIONS.map((opt) => {
                  const isWinner = opt.correct && answered;
                  const rowScale = isWinner
                    ? interpolate(answerSpring, [0, 0.5, 1], [1, 1.03, 1])
                    : 1;
                  return (
                    <div
                      key={opt.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "13px 16px",
                        borderRadius: 12,
                        background: isWinner ? COLORS.correctBg : COLORS.bgBase,
                        border: `1.5px solid ${isWinner ? COLORS.correctBorder : COLORS.oliveDim}`,
                        transform: `scale(${rowScale})`,
                        boxShadow: isWinner ? "0 8px 20px rgba(46, 107, 67, 0.14)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: isWinner ? COLORS.correctBorder : COLORS.bgCard,
                            border: `1px solid ${isWinner ? COLORS.correctBorder : COLORS.oliveDim}`,
                            color: isWinner ? "#FFFFFF" : COLORS.muted,
                            fontFamily: FONTS.display,
                            fontSize: 12,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {opt.key}
                        </div>
                        <span
                          style={{
                            fontFamily: FONTS.display,
                            fontSize: 21,
                            fontWeight: 700,
                            color: isWinner ? COLORS.correctText : COLORS.ink,
                          }}
                        >
                          {opt.label}
                        </span>
                      </div>
                      {isWinner && <CheckIcon size={18} color={COLORS.correctBorder} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </AbsoluteFill>
        </BrowserFrame>
      }
      overlay={
        <div
          style={{
            position: "absolute",
            right: isVertical ? 24 : -24,
            bottom: isVertical ? -48 : -34,
            background: COLORS.bgCard,
            borderRadius: 20,
            border: `1.5px solid ${isUrgent ? COLORS.red : COLORS.oliveDim}`,
            boxShadow: isUrgent
              ? "0 24px 56px rgba(181, 58, 58, 0.22)"
              : "0 24px 56px rgba(30, 35, 18, 0.18)",
            padding: "18px 24px",
            minWidth: isVertical ? 410 : 410,
            opacity: interpolate(cardIn, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(cardIn, [0, 1], [36, 0])}px)`,
          }}
        >
          {/* Header with rule label + live ticking urgency clock */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
              gap: 16,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.09em",
                color: COLORS.olive,
              }}
            >
              RULE · (A + B) × C
            </span>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 999,
                background: isUrgent ? COLORS.redSoft : COLORS.bgPanel,
                border: `1px solid ${isUrgent ? COLORS.red : COLORS.oliveDim}`,
                color: isUrgent ? COLORS.red : COLORS.ink,
                fontFamily: FONTS.display,
                fontSize: 15,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <TimerIcon size={15} color={isUrgent ? COLORS.red : COLORS.olive} />
              00:{tickVal < 10 ? `0${tickVal}` : tickVal}
            </div>
          </div>

          {/* Equation tokens locking into 54 */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "nowrap" }}>
            {eqTokens.map((tok, idx) => {
              const tSpring = spring({
                frame: Math.max(0, frame - (60 + idx * 8)),
                fps,
                config: SPRINGS.snappy,
              });
              const isAnswer = idx === eqTokens.length - 1;
              return (
                <div
                  key={idx}
                  style={{
                    padding: isAnswer ? "8px 16px" : "8px 12px",
                    borderRadius: 10,
                    background: isAnswer ? COLORS.correctBg : COLORS.bgPanel,
                    border: `1.5px solid ${isAnswer ? COLORS.correctBorder : "transparent"}`,
                    fontFamily: FONTS.display,
                    fontSize: isAnswer ? 24 : 20,
                    fontWeight: 700,
                    color: isAnswer ? COLORS.correctText : COLORS.ink,
                    opacity: interpolate(tSpring, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(tSpring, [0, 1], [-22, 0])}px)`,
                  }}
                >
                  {tok}
                </div>
              );
            })}
          </div>
        </div>
      }
    />
  );
};

export const Act4Games: React.FC = () => {
  const { articulate, podium, trivia, mathletics } = TIMELINE.act4;
  return (
    <AbsoluteFill>
      <Sequence from={articulate.start} durationInFrames={articulate.duration}>
        <ArticulateScene />
      </Sequence>
      <Sequence from={podium.start} durationInFrames={podium.duration}>
        <PodiumScene />
      </Sequence>
      <Sequence from={trivia.start} durationInFrames={trivia.duration}>
        <TriviaScene />
      </Sequence>
      <Sequence from={mathletics.start} durationInFrames={mathletics.duration}>
        <MathleticsScene />
      </Sequence>
    </AbsoluteFill>
  );
};
