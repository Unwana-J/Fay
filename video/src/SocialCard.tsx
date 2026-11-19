import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { FeyBackdrop } from "./components/FeyBackdrop";
import { FeyButterfly } from "./components/FeyButterfly";
import { TimerIcon } from "./components/MotionPrimitives";
import "./styles/fonts.css";
import { COLORS, FONTS } from "./theme";

export type CardTemplate = "broadside" | "chalkboard" | "puzzle" | "receipt" | "lesson";

export interface ReceiptItem {
  num: string;
  label: string;
  tone?: "terra" | "olive" | "gold";
}

export interface SocialCardProps {
  template: CardTemplate;
  /** Small uppercase kicker pill, e.g. "THE FEYNMAN TECHNIQUE" or "BUILDING IN PUBLIC · #01" */
  tag?: string;
  /** Main headline. Wrap a phrase in *asterisks* to accent it in wine-red (or gold on chalkboard). */
  headline: string;
  /** Optional supporting paragraph or secondary italic line */
  body?: string;
  /** Optional attribution line (e.g. "Richard Feynman · Namesake of Fey") */
  attribution?: string;
  /** Optional pull-quote or takeaway callout (for lesson template) */
  callout?: string;
  /** Optional 3-row receipt items (for receipt template) */
  items?: ReceiptItem[];
  /** Optional puzzle sample chips (for puzzle template, e.g. ["[2, 3, 4 → 20]", "[3, 4, 5 → 35]"]) */
  samples?: string[];
  /** Optional puzzle target prompt (e.g. "[4, 5, 6 → ?]") */
  prompt?: string;
  /** Optional 4 multiple-choice options for puzzle template */
  options?: string[];
  /** Optional timer label for puzzle template (e.g. "25s · No calculator") */
  timerLabel?: string;
  /** Optional small footer callout beside the Fey colophon (e.g. "Beta · fey.lokinlabs.com.ng") */
  footerNote?: string;
  /** Show subtle BETA badge beside colophon */
  showBeta?: boolean;
}

/** Renders text with *accented* phrases highlighted cleanly without HTML injection */
const RichText: React.FC<{
  text: string;
  accentColor: string;
  italicAccent?: boolean;
  underlineAccent?: boolean;
}> = ({ text, accentColor, italicAccent = true, underlineAccent = false }) => {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, lineIdx) => {
        const parts = line.split(/(\*[^*]+\*)/g);
        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {parts.map((part, pIdx) => {
              if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
                const inner = part.slice(1, -1);
                return (
                  <span
                    key={pIdx}
                    style={{
                      color: accentColor,
                      fontStyle: italicAccent ? "italic" : "normal",
                      position: "relative",
                      display: "inline-block",
                      paddingRight: italicAccent ? 4 : 0,
                    }}
                  >
                    {inner}
                    {underlineAccent && (
                      <span
                        style={{
                          position: "absolute",
                          left: 0,
                          right: italicAccent ? 4 : 0,
                          bottom: -7,
                          height: 4,
                          background: accentColor,
                          borderRadius: 2,
                          opacity: 0.85,
                        }}
                      />
                    )}
                  </span>
                );
              }
              return <React.Fragment key={pIdx}>{part}</React.Fragment>;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

/** Quiet editorial Fey colophon anchored cleanly at the bottom of every card */
const FeyColophon: React.FC<{
  dark?: boolean;
  footerNote?: string;
  showBeta?: boolean;
  compact?: boolean;
}> = ({ dark = false, footerNote, showBeta = false, compact = false }) => {
  const borderColor = dark ? "rgba(242, 239, 231, 0.14)" : "rgba(68, 78, 44, 0.16)";
  const textColor = dark ? COLORS.chalkMuted : COLORS.muted;
  const brandColor = dark ? COLORS.chalkText : COLORS.ink;

  return (
    <div
      style={{
        width: "100%",
        paddingTop: compact ? 20 : 26,
        borderTop: `1px solid ${borderColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <FeyButterfly size={compact ? 40 : 46} withTile={true} />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontFamily: FONTS.serif,
                fontSize: compact ? 22 : 24,
                fontWeight: 700,
                color: brandColor,
                lineHeight: 1,
              }}
            >
              Fey
            </span>
            {showBeta && (
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: dark ? COLORS.goldLight : COLORS.terra,
                  border: `1.5px solid ${dark ? COLORS.goldLight : COLORS.terra}`,
                  borderRadius: 5,
                  padding: "2px 7px",
                  lineHeight: 1.1,
                }}
              >
                BETA
              </span>
            )}
          </div>
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: compact ? 12 : 13,
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: textColor,
            }}
          >
            Think deeper. Articulate clearly.
          </span>
        </div>
      </div>

      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: compact ? 15 : 16,
          fontWeight: 600,
          color: dark ? COLORS.goldLight : COLORS.olive,
          letterSpacing: "0.02em",
        }}
      >
        {footerNote || "fey.lokinlabs.com.ng"}
      </div>
    </div>
  );
};

export const SocialCard: React.FC<SocialCardProps> = (props) => {
  const {
    template,
    tag,
    headline,
    body,
    attribution,
    callout,
    items,
    samples,
    prompt,
    options,
    timerLabel,
    footerNote,
    showBeta = false,
  } = props;

  const { width, height } = useVideoConfig();
  const isLandscape = width > height;
  const isStatus = height >= 1800; // 1080x1920 WhatsApp Status / Stories
  const isDark = template === "chalkboard";

  // Safe inner margins respecting WhatsApp Status / LinkedIn UI chrome
  const padX = isLandscape ? 112 : 96;
  const padTop = isStatus ? 160 : isLandscape ? 78 : 104;
  const padBottom = isStatus ? 160 : isLandscape ? 72 : 96;

  const tagBadge = tag ? (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        padding: "8px 18px",
        borderRadius: 999,
        background: isDark
          ? "rgba(242, 239, 231, 0.08)"
          : template === "puzzle"
            ? COLORS.terraSoft
            : "rgba(68, 78, 44, 0.09)",
        border: `1px solid ${
          isDark
            ? "rgba(242, 239, 231, 0.22)"
            : template === "puzzle"
              ? COLORS.terraBorder
              : "rgba(68, 78, 44, 0.28)"
        }`,
        fontFamily: FONTS.display,
        fontSize: isLandscape ? 14 : 15,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: isDark
          ? COLORS.chalkText
          : template === "puzzle"
            ? COLORS.terra
            : COLORS.olive,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: isDark
            ? COLORS.goldLight
            : template === "puzzle"
              ? COLORS.terra
              : COLORS.olive,
        }}
      />
      {tag}
    </div>
  ) : null;

  return (
    <FeyBackdrop variant={isDark ? "chalk" : "cream"}>
      {/* Subtle chalk Feynman diagram doodles on chalkboard template */}
      {isDark && (
        <svg
          width={width}
          height={height}
          viewBox="0 0 1200 1500"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, opacity: 0.13, pointerEvents: "none" }}
        >
          <path
            d="M 80 180 L 230 330 L 80 480"
            fill="none"
            stroke={COLORS.chalkText}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 230 330 Q 260 300 290 330 T 350 330 T 410 330"
            fill="none"
            stroke={COLORS.goldLight}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="230" cy="330" r="5" fill={COLORS.goldLight} />
          <ellipse
            cx="1020"
            cy="1180"
            rx="150"
            ry="54"
            transform="rotate(-24 1020 1180)"
            fill="none"
            stroke={COLORS.chalkText}
            strokeWidth="2"
          />
          <ellipse
            cx="1020"
            cy="1180"
            rx="150"
            ry="54"
            transform="rotate(28 1020 1180)"
            fill="none"
            stroke={COLORS.goldLight}
            strokeWidth="2"
          />
        </svg>
      )}

      <AbsoluteFill
        style={{
          padding: `${padTop}px ${padX}px ${padBottom}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 40,
          }}
        >
          {tagBadge || <div />}
          {template === "puzzle" && timerLabel && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 999,
                background: COLORS.bgCard,
                border: `1.5px solid ${COLORS.red}`,
                fontFamily: FONTS.display,
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.red,
              }}
            >
              <TimerIcon size={17} color={COLORS.red} />
              {timerLabel}
            </div>
          )}
        </div>

        {/* Center Content by Template */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: isLandscape ? "24px 0" : "40px 0",
          }}
        >
          {/* 1. BROADSIDE (Warm archival cream quote / insight) */}
          {template === "broadside" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: isLandscape ? 24 : 34,
                maxWidth: isLandscape ? 1240 : 960,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: isLandscape ? 72 : isStatus ? 76 : 74,
                  fontWeight: 700,
                  color: COLORS.ink,
                  lineHeight: 1.12,
                  letterSpacing: "-0.025em",
                }}
              >
                <RichText text={headline} accentColor={COLORS.terra} underlineAccent={true} />
              </div>

              <div
                style={{
                  width: 96,
                  height: 3,
                  background: COLORS.terra,
                  borderRadius: 2,
                }}
              />

              {body && (
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: isLandscape ? 26 : 30,
                    fontWeight: 400,
                    color: COLORS.muted,
                    lineHeight: 1.5,
                    maxWidth: isLandscape ? 1020 : 880,
                  }}
                >
                  {body}
                </div>
              )}

              {attribution && (
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 20,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: COLORS.olive,
                  }}
                >
                  — {attribution}
                </div>
              )}
            </div>
          )}

          {/* 2. CHALKBOARD (Richard Feynman deep olive-slate) */}
          {template === "chalkboard" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: isLandscape ? 28 : 38,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: isLandscape ? 72 : isStatus ? 76 : 74,
                  fontWeight: 500,
                  color: COLORS.chalkText,
                  lineHeight: 1.18,
                  letterSpacing: "-0.02em",
                  maxWidth: isLandscape ? 1220 : 940,
                }}
              >
                <RichText text={headline} accentColor={COLORS.goldLight} underlineAccent={true} />
              </div>

              <div style={{ width: 72, height: 2, background: COLORS.goldLight, opacity: 0.8 }} />

              {attribution && (
                <div
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: isLandscape ? 24 : 26,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: COLORS.goldLight,
                  }}
                >
                  {attribution}
                </div>
              )}

              {body && (
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: isLandscape ? 22 : 26,
                    color: COLORS.chalkMuted,
                    lineHeight: 1.48,
                    maxWidth: isLandscape ? 980 : 820,
                  }}
                >
                  {body}
                </div>
              )}
            </div>
          )}

          {/* 3. PUZZLE (Quantitative Reasoning / Mathletics / Naija Trivia hook) */}
          {template === "puzzle" && (
            <div style={{ display: "flex", flexDirection: "column", gap: isLandscape ? 22 : 30 }}>
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: isLandscape ? 48 : isStatus ? 56 : 54,
                  fontWeight: 700,
                  color: COLORS.ink,
                  lineHeight: 1.12,
                  letterSpacing: "-0.02em",
                }}
              >
                <RichText text={headline} accentColor={COLORS.terra} />
              </div>

              {/* Printed broadside puzzle card */}
              <div
                style={{
                  background: COLORS.bgCard,
                  border: `1.5px solid ${COLORS.oliveDim}`,
                  borderRadius: 22,
                  padding: isLandscape ? "28px 34px" : "36px 40px",
                  boxShadow: "0 20px 52px rgba(30, 35, 18, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: isLandscape ? 20 : 28,
                }}
              >
                {samples && samples.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: COLORS.muted,
                      }}
                    >
                      STUDY THE SAMPLE RULE
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                      {samples.map((s, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: isLandscape ? "12px 22px" : "14px 26px",
                            borderRadius: 14,
                            background: "rgba(68, 78, 44, 0.09)",
                            border: `1.5px solid rgba(68, 78, 44, 0.22)`,
                            fontFamily: FONTS.display,
                            fontSize: isLandscape ? 28 : 32,
                            fontWeight: 700,
                            color: COLORS.oliveText,
                          }}
                        >
                          {s}
                        </div>
                      ))}
                      {prompt && (
                        <div
                          style={{
                            padding: isLandscape ? "12px 24px" : "14px 28px",
                            borderRadius: 14,
                            background: COLORS.terraSoft,
                            border: `2px solid ${COLORS.terra}`,
                            fontFamily: FONTS.display,
                            fontSize: isLandscape ? 28 : 34,
                            fontWeight: 700,
                            color: COLORS.terra,
                          }}
                        >
                          {prompt}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!samples && prompt && (
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: isLandscape ? 30 : 34,
                      fontWeight: 700,
                      color: COLORS.ink,
                      lineHeight: 1.3,
                    }}
                  >
                    {prompt}
                  </div>
                )}

                {options && options.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}
                  >
                    {options.map((opt, idx) => {
                      const ltr = String.fromCharCode(65 + idx);
                      return (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: isLandscape ? "14px 20px" : "18px 22px",
                            borderRadius: 14,
                            background: COLORS.bgBase,
                            border: `1.5px solid ${COLORS.oliveDim}`,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: COLORS.bgCard,
                              border: `1px solid ${COLORS.oliveDim}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: FONTS.display,
                              fontSize: 15,
                              fontWeight: 700,
                              color: COLORS.olive,
                            }}
                          >
                            {ltr}
                          </div>
                          <span
                            style={{
                              fontFamily: FONTS.display,
                              fontSize: isLandscape ? 24 : 28,
                              fontWeight: 700,
                              color: COLORS.ink,
                            }}
                          >
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {body && (
                <div
                  style={{
                    fontFamily: FONTS.serif,
                    fontStyle: "italic",
                    fontSize: isLandscape ? 24 : 28,
                    color: COLORS.terra,
                  }}
                >
                  {body}
                </div>
              )}
            </div>
          )}

          {/* 4. RECEIPT (Numbered 3-row editorial list) */}
          {template === "receipt" && (
            <div
              style={{
                background: COLORS.bgCard,
                border: `1.5px solid ${COLORS.oliveDim}`,
                borderRadius: 24,
                padding: isLandscape ? "38px 54px" : "48px 52px",
                boxShadow: "0 24px 60px rgba(30, 35, 18, 0.09)",
                display: "flex",
                flexDirection: "column",
                gap: isLandscape ? 20 : 28,
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: isLandscape ? 44 : 48,
                  fontWeight: 700,
                  color: COLORS.ink,
                  paddingBottom: 20,
                  borderBottom: `1.5px dashed ${COLORS.oliveDim}`,
                  lineHeight: 1.12,
                }}
              >
                <RichText text={headline} accentColor={COLORS.terra} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: isLandscape ? 18 : 26 }}>
                {(items || []).map((row, idx) => {
                  const toneMap = {
                    terra: COLORS.terra,
                    olive: COLORS.olive,
                    gold: COLORS.gold,
                  };
                  const numColor = toneMap[row.tone || (idx === 0 ? "terra" : idx === 1 ? "olive" : "gold")];
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 24,
                        paddingBottom: idx < (items?.length || 0) - 1 ? (isLandscape ? 16 : 22) : 0,
                        borderBottom:
                          idx < (items?.length || 0) - 1 ? `1px solid rgba(220, 213, 201, 0.7)` : "none",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONTS.display,
                          fontSize: isLandscape ? 54 : 62,
                          fontWeight: 700,
                          color: numColor,
                          minWidth: isLandscape ? 170 : 185,
                          lineHeight: 1,
                        }}
                      >
                        {row.num}
                      </span>
                      <span
                        style={{
                          fontFamily: FONTS.serif,
                          fontSize: isLandscape ? 42 : 48,
                          fontWeight: 700,
                          color: COLORS.ink,
                          lineHeight: 1.12,
                        }}
                      >
                        {row.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {body && (
                <div
                  style={{
                    marginTop: 4,
                    paddingTop: 18,
                    borderTop: `1.5px dashed ${COLORS.oliveDim}`,
                    fontFamily: FONTS.serif,
                    fontStyle: "italic",
                    fontSize: isLandscape ? 24 : 28,
                    color: COLORS.muted,
                  }}
                >
                  {body}
                </div>
              )}
            </div>
          )}

          {/* 5. LESSON (Building in Public / Structured Founder Note) */}
          {template === "lesson" && (
            <div style={{ display: "flex", flexDirection: "column", gap: isLandscape ? 24 : 32 }}>
              <div
                style={{
                  fontFamily: FONTS.serif,
                  fontSize: isLandscape ? 58 : isStatus ? 64 : 62,
                  fontWeight: 700,
                  color: COLORS.ink,
                  lineHeight: 1.12,
                  letterSpacing: "-0.025em",
                }}
              >
                <RichText text={headline} accentColor={COLORS.terra} />
              </div>

              {body && (
                <div
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: isLandscape ? 25 : 29,
                    color: COLORS.muted,
                    lineHeight: 1.55,
                  }}
                >
                  {body}
                </div>
              )}

              {callout && (
                <div
                  style={{
                    background: COLORS.bgCard,
                    borderLeft: `5px solid ${COLORS.terra}`,
                    borderTop: `1px solid ${COLORS.oliveDim}`,
                    borderRight: `1px solid ${COLORS.oliveDim}`,
                    borderBottom: `1px solid ${COLORS.oliveDim}`,
                    borderRadius: "4px 16px 16px 4px",
                    padding: isLandscape ? "22px 28px" : "28px 34px",
                    fontFamily: FONTS.serif,
                    fontStyle: "italic",
                    fontSize: isLandscape ? 28 : 32,
                    fontWeight: 600,
                    color: COLORS.ink,
                    lineHeight: 1.35,
                    boxShadow: "0 14px 34px rgba(30, 35, 18, 0.06)",
                  }}
                >
                  {callout}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Quiet Fey Colophon */}
        <FeyColophon
          dark={isDark}
          footerNote={footerNote}
          showBeta={showBeta}
          compact={isLandscape}
        />
      </AbsoluteFill>
    </FeyBackdrop>
  );
};
