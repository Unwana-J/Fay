import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BrowserFrame } from "../components/BrowserFrame";
import { FeyBackdrop } from "../components/FeyBackdrop";
import { CheckIcon, EditorialBadge, MicIcon } from "../components/MotionPrimitives";
import { COLORS, FONTS, SPRINGS } from "../theme";

const STEPS = [
  {
    num: "01",
    short: "Read Sources",
    headline: "Get a topic. Read cited sources in-app.",
    sub: "Curated from Wikipedia, Europe PMC & OpenAlex — in Gist, Summary, or Deep Dive.",
  },
  {
    num: "02",
    short: "Pin Cues",
    headline: "Highlight key lines into speaking cues.",
    sub: "Turn core points directly into notes and live speaking pointers.",
  },
  {
    num: "03",
    short: "Speak & Listen",
    headline: "Record it in your own voice. Listen back.",
    sub: "Guided scaffold + cues that gently fade so you speak from understanding.",
  },
  {
    num: "04",
    short: "Recall Quiz",
    headline: "Seal mastery with a 3-question quiz.",
    sub: "Verify what actually stuck and earn +60 Bonus XP.",
  },
];

/**
 * 390 frames (13.0s) showcasing Fey's signature PRD v3.0.0 Daily Study Loop:
 *   0..96f   Step 01 — Sourced Research Pack (Wikipedia, Europe PMC, OpenAlex + [S#])
 *   96..190f Step 02 — Highlight text -> "Add as cue" -> pins to speaking pointers
 *   190..292f Step 03 — Live Mic Waveform + 3-Stage Scaffold + Fading Cues + Playback
 *   292..390f Step 04 — Seal Your Understanding · 3-Question Recall Check (+60 Bonus XP)
 */
export const ActStudyLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  const activeStep =
    frame < 96 ? 0 : frame < 190 ? 1 : frame < 292 ? 2 : 3;

  const stepStart = [0, 96, 190, 292][activeStep];
  const stepLocal = frame - stepStart;

  const copySpring = spring({
    frame: stepLocal,
    fps,
    config: SPRINGS.editorial,
  });

  const exitOpacity = interpolate(frame, [378, 390], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Step 2 highlight sweep & cue pin animations
  const highlightPct = interpolate(frame, [104, 134], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cuePillSpring = spring({
    frame: Math.max(0, frame - 134),
    fps,
    config: SPRINGS.snappy,
  });
  const cuePinned = frame >= 152;
  const pinnedSpring = spring({
    frame: Math.max(0, frame - 152),
    fps,
    config: SPRINGS.snappy,
  });

  // Step 3 vocal stage animations
  const vocalLocal = Math.max(0, frame - 190);
  const vocalStage2 = vocalLocal >= 44;
  // Cue fades cleanly after 32f to illustrate Fading Retrieval Cues!
  const fadingCueOpacity = interpolate(vocalLocal, [0, 26, 62], [1, 1, 0.24], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const playbackIn = spring({
    frame: Math.max(0, vocalLocal - 56),
    fps,
    config: SPRINGS.editorial,
  });

  // Step 4 recall check animations
  const quizLocal = Math.max(0, frame - 292);
  const q1Done = quizLocal >= 14;
  const q2Done = quizLocal >= 28;
  const q3Done = quizLocal >= 42;
  const bonusSpring = spring({
    frame: Math.max(0, quizLocal - 46),
    fps,
    config: SPRINGS.snappy,
  });

  const currentStep = STEPS[activeStep];

  const urls = [
    "fey.lokinlabs.com.ng/session/research",
    "fey.lokinlabs.com.ng/session/research",
    "fey.lokinlabs.com.ng/session/speak",
    "fey.lokinlabs.com.ng/session/recall",
  ];

  return (
    <FeyBackdrop variant="cream">
      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          flexDirection: isVertical ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: isVertical ? 36 : 64,
          padding: isVertical ? "84px 58px 76px" : "74px 96px",
        }}
      >
        {/* Left / Top Editorial Narrative Column */}
        <div
          style={{
            flex: isVertical ? "0 0 auto" : "0 0 620px",
            width: isVertical ? "100%" : 620,
            display: "flex",
            flexDirection: "column",
            alignItems: isVertical ? "center" : "flex-start",
            textAlign: isVertical ? "center" : "left",
            gap: isVertical ? 14 : 18,
          }}
        >
          <EditorialBadge label="Daily Practice & Study" tone="terra" delay={0} />

          {/* 4-Step progress strip */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: isVertical ? "center" : "flex-start",
              marginTop: 4,
            }}
          >
            {STEPS.map((st, idx) => {
              const isCurrent = idx === activeStep;
              const isPast = idx < activeStep;
              return (
                <div
                  key={st.num}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: isCurrent
                      ? COLORS.terra
                      : isPast
                        ? "rgba(68, 78, 44, 0.14)"
                        : COLORS.bgPanel,
                    border: `1px solid ${
                      isCurrent ? COLORS.terra : isPast ? COLORS.olive : COLORS.oliveDim
                    }`,
                    fontFamily: FONTS.display,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: isCurrent ? "#FFFFFF" : isPast ? COLORS.olive : COLORS.muted,
                  }}
                >
                  {st.num} · {st.short}
                </div>
              );
            })}
          </div>

          {/* Dynamic headline per step */}
          <div
            key={activeStep}
            style={{
              opacity: interpolate(copySpring, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(copySpring, [0, 1], [20, 0])}px)`,
              marginTop: 6,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: isVertical ? 52 : 58,
                fontWeight: 700,
                color: COLORS.ink,
                lineHeight: 1.09,
                letterSpacing: "-0.025em",
              }}
            >
              {currentStep.headline}
            </div>
            <div
              style={{
                marginTop: 16,
                fontFamily: FONTS.sans,
                fontSize: isVertical ? 22 : 21,
                color: COLORS.muted,
                lineHeight: 1.45,
                maxWidth: isVertical ? 820 : 560,
              }}
            >
              {currentStep.sub}
            </div>
          </div>
        </div>

        {/* Right / Bottom Live Interactive Fey Study Workspace */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <BrowserFrame
            url={urls[activeStep]}
            width={isVertical ? 950 : 1000}
            height={isVertical ? 660 : 650}
            enterDelay={2}
          >
            {/* Top Session Stepper inside the app viewport */}
            <AbsoluteFill
              style={{
                background: COLORS.bgBase,
                padding: isVertical ? "22px 30px" : "24px 36px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* App session bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: 16,
                  borderBottom: `1px solid ${COLORS.oliveDim}`,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    fontFamily: FONTS.serif,
                    fontSize: 19,
                    fontWeight: 700,
                    color: COLORS.ink,
                  }}
                >
                  How does end-to-end encryption protect your messages?
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {["Research", "Speak", "Recall"].map((stage, idx) => {
                    const active =
                      (idx === 0 && activeStep <= 1) ||
                      (idx === 1 && activeStep === 2) ||
                      (idx === 2 && activeStep === 3);
                    const done =
                      (idx === 0 && activeStep >= 2) || (idx === 1 && activeStep >= 3);
                    return (
                      <div
                        key={stage}
                        style={{
                          padding: "4px 12px",
                          borderRadius: 999,
                          fontFamily: FONTS.display,
                          fontSize: 12,
                          fontWeight: 700,
                          background: active
                            ? COLORS.terra
                            : done
                              ? COLORS.correctBg
                              : COLORS.bgPanel,
                          color: active
                            ? "#FFFFFF"
                            : done
                              ? COLORS.correctText
                              : COLORS.muted,
                          border: `1px solid ${
                            active
                              ? COLORS.terra
                              : done
                                ? COLORS.correctBorder
                                : COLORS.oliveDim
                          }`,
                        }}
                      >
                        {stage}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ============================================================
               * STEPS 1 & 2: SOURCED RESEARCH READER + HIGHLIGHT TO CUE
               * ========================================================== */}
              {activeStep <= 1 && (
                <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 20, flex: 1 }}>
                  {/* Left: Grounded Multi-Source Research Reader */}
                  <div
                    style={{
                      background: COLORS.bgCard,
                      border: `1.5px solid ${COLORS.oliveDim}`,
                      borderRadius: 16,
                      padding: "20px 24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                      position: "relative",
                    }}
                  >
                    {/* Layer tabs + Accredited Source Badges */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {["Gist", "Summary", "Deep Dive"].map((tab, i) => (
                          <span
                            key={tab}
                            style={{
                              padding: "4px 11px",
                              borderRadius: 8,
                              fontFamily: FONTS.display,
                              fontSize: 12,
                              fontWeight: 700,
                              background: i === 1 ? COLORS.olive : COLORS.bgPanel,
                              color: i === 1 ? "#FFFFFF" : COLORS.muted,
                            }}
                          >
                            {tab}
                          </span>
                        ))}
                      </div>
                      <span
                        style={{
                          fontFamily: FONTS.display,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          color: COLORS.olive,
                        }}
                      >
                        VERIFIED SOURCES
                      </span>
                    </div>

                    {/* Accredited source chips */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        { code: "S1", name: "Wikipedia · E2EE" },
                        { code: "S2", name: "OpenAlex · Signal Protocol" },
                        { code: "S3", name: "Europe PMC" },
                      ].map((src) => (
                        <div
                          key={src.code}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: COLORS.bgBase,
                            border: `1px solid ${COLORS.oliveDim}`,
                            fontFamily: FONTS.sans,
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: COLORS.oliveText,
                          }}
                        >
                          <span style={{ color: COLORS.terra, fontWeight: 700 }}>[{src.code}]</span>
                          {src.name}
                        </div>
                      ))}
                    </div>

                    {/* Cited passage with live golden highlight sweep in Step 2 */}
                    <div
                      style={{
                        fontFamily: FONTS.serif,
                        fontSize: 17.5,
                        lineHeight: 1.62,
                        color: COLORS.ink,
                        marginTop: 4,
                      }}
                    >
                      In end-to-end encryption, messages are locked on your device before they ever
                      leave your phone{" "}
                      <span style={{ fontFamily: FONTS.display, fontSize: 12, fontWeight: 700, color: COLORS.terra }}>
                        [S1]
                      </span>
                      .{" "}
                      <span
                        style={{
                          background:
                            activeStep === 1
                              ? `linear-gradient(90deg, rgba(217, 179, 92, 0.42) ${highlightPct}%, transparent ${highlightPct}%)`
                              : "transparent",
                          borderRadius: 4,
                          padding: "2px 3px",
                        }}
                      >
                        Only the sender and recipient hold the private decryption keys — not even the
                        platform hosting the chat can read it
                      </span>{" "}
                      <span style={{ fontFamily: FONTS.display, fontSize: 12, fontWeight: 700, color: COLORS.terra }}>
                        [S2]
                      </span>
                      .
                    </div>

                    {/* Floating "Add as cue" action pill */}
                    {activeStep === 1 && frame >= 134 && (
                      <div
                        style={{
                          alignSelf: "flex-start",
                          marginTop: 4,
                          padding: "8px 16px",
                          borderRadius: 999,
                          background: cuePinned ? COLORS.olive : COLORS.terra,
                          color: "#FFFFFF",
                          fontFamily: FONTS.display,
                          fontSize: 13,
                          fontWeight: 700,
                          boxShadow: "0 12px 28px rgba(122, 28, 46, 0.25)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          opacity: interpolate(cuePillSpring, [0, 1], [0, 1]),
                          transform: `translateY(${interpolate(cuePillSpring, [0, 1], [12, 0])}px) scale(${cuePinned ? 0.96 : 1})`,
                        }}
                      >
                        {cuePinned ? "Added to Speaking Cues" : "+ Add as cue (18 words)"}
                      </div>
                    )}
                  </div>

                  {/* Right: User's Notes & Speaking Cues Panel */}
                  <div
                    style={{
                      background: COLORS.bgCard,
                      border: `1.5px solid ${cuePinned ? COLORS.terraBorder : COLORS.oliveDim}`,
                      borderRadius: 16,
                      padding: "20px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: COLORS.olive,
                      }}
                    >
                      MY NOTES & SPEAKING CUES
                    </div>

                    {/* Existing user note bullet */}
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: COLORS.bgBase,
                        border: `1px solid ${COLORS.oliveDim}`,
                        fontFamily: FONTS.sans,
                        fontSize: 14,
                        color: COLORS.ink,
                        lineHeight: 1.45,
                      }}
                    >
                      <span style={{ color: COLORS.olive, fontWeight: 700 }}>Analogy: </span>
                      Like sealing a letter in a locked box where only your friend owns the key.
                    </div>

                    {/* Newly pinned cue snapping in cleanly in Step 2 */}
                    {cuePinned && (
                      <div
                        style={{
                          padding: "12px 14px",
                          borderRadius: 12,
                          background: COLORS.goldSoft,
                          border: `1.5px solid ${COLORS.gold}`,
                          fontFamily: FONTS.sans,
                          fontSize: 14,
                          color: COLORS.ink,
                          lineHeight: 1.45,
                          opacity: interpolate(pinnedSpring, [0, 1], [0, 1]),
                          transform: `translateY(${interpolate(pinnedSpring, [0, 1], [16, 0])}px)`,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: FONTS.display,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            color: COLORS.gold,
                            marginBottom: 4,
                          }}
                        >
                          PINNED SPEAKING CUE · [S2]
                        </div>
                        Only sender &amp; recipient hold private keys — platform can&apos;t read it.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================
               * STEP 3: VOCAL SYNTHESIS (LIVE MIC + FADING CUES + PLAYBACK)
               * ========================================================== */}
              {activeStep === 2 && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 18,
                  }}
                >
                  {/* 3-Stage Timed Speaking Scaffold Pill */}
                  <div style={{ display: "flex", gap: 10 }}>
                    {[
                      { label: "1 · Plain Definition", active: !vocalStage2 },
                      { label: "2 · Real-World Analogy", active: vocalStage2 },
                      { label: "3 · Why It Matters", active: false },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 999,
                          background: s.active ? COLORS.terra : COLORS.bgCard,
                          color: s.active ? "#FFFFFF" : COLORS.muted,
                          border: `1px solid ${s.active ? COLORS.terra : COLORS.oliveDim}`,
                          fontFamily: FONTS.display,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {s.label}
                      </div>
                    ))}
                  </div>

                  {/* Live Recording Waveform Card */}
                  <div
                    style={{
                      width: "88%",
                      background: COLORS.bgCard,
                      border: `1.5px solid ${COLORS.terraBorder}`,
                      borderRadius: 20,
                      padding: "24px 32px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 16,
                      boxShadow: "0 14px 36px rgba(122, 28, 46, 0.08)",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: COLORS.terra,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: FONTS.display,
                            fontSize: 13,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            color: COLORS.terra,
                          }}
                        >
                          RECORDING VOCAL EXPLANATION
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: FONTS.display,
                          fontSize: 22,
                          fontWeight: 700,
                          color: COLORS.ink,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        00:{42 + Math.floor(vocalLocal / 16)} / 01:30
                      </span>
                    </div>

                    {/* Animated 28-bar microphone waveform */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        height: 68,
                        width: "100%",
                      }}
                    >
                      {Array.from({ length: 28 }).map((_, i) => {
                        const env = Math.sin((i / 27) * Math.PI);
                        const h =
                          12 +
                          Math.abs(Math.sin(vocalLocal * 0.25 + i * 0.65) * Math.cos(vocalLocal * 0.11 - i * 0.35)) *
                            54 *
                            (0.35 + 0.65 * env);
                        return (
                          <div
                            key={i}
                            style={{
                              width: 7,
                              height: h,
                              borderRadius: 99,
                              background: i % 4 === 0 ? COLORS.olive : COLORS.terra,
                              opacity: 0.9,
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Fading Retrieval Cue strip */}
                    <div
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        borderRadius: 12,
                        background: COLORS.bgBase,
                        border: `1px dashed ${COLORS.oliveDim}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        opacity: fadingCueOpacity,
                      }}
                    >
                      <span style={{ fontFamily: FONTS.sans, fontSize: 13.5, color: COLORS.ink }}>
                        <strong>Cue:</strong> Locked box analogy · Private keys stay on devices
                      </span>
                      <span
                        style={{
                          fontFamily: FONTS.display,
                          fontSize: 11,
                          fontWeight: 700,
                          color: COLORS.subtle,
                        }}
                      >
                        FADING CUE
                      </span>
                    </div>
                  </div>

                  {/* Instant Listen-Back Playback Bar */}
                  <div
                    style={{
                      width: "88%",
                      background: COLORS.bgCard,
                      border: `1.5px solid ${COLORS.oliveDim}`,
                      borderRadius: 14,
                      padding: "12px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      opacity: interpolate(playbackIn, [0, 1], [0, 1]),
                      transform: `translateY(${interpolate(playbackIn, [0, 1], [16, 0])}px)`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: COLORS.olive,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <MicIcon size={16} color="#FFFFFF" />
                      </div>
                      <span style={{ fontFamily: FONTS.display, fontSize: 14, fontWeight: 700, color: COLORS.ink }}>
                        Listen back &amp; refine before submitting
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: FONTS.display,
                        fontSize: 13,
                        fontWeight: 700,
                        color: COLORS.olive,
                      }}
                    >
                      SAVED TO LIBRARY
                    </span>
                  </div>
                </div>
              )}

              {/* ============================================================
               * STEP 4: SEAL YOUR UNDERSTANDING · 3-QUESTION RECALL CHECK
               * ========================================================== */}
              {activeStep === 3 && (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 16,
                    padding: "0 24px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div
                        style={{
                          fontFamily: FONTS.display,
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: "0.09em",
                          color: COLORS.olive,
                        }}
                      >
                        POST-SESSION VERIFICATION
                      </div>
                      <div
                        style={{
                          fontFamily: FONTS.serif,
                          fontSize: 28,
                          fontWeight: 700,
                          color: COLORS.ink,
                          marginTop: 2,
                        }}
                      >
                        Seal Your Understanding · 3-Question Recall Check
                      </div>
                    </div>

                    {/* +60 Bonus XP badge */}
                    <div
                      style={{
                        padding: "10px 18px",
                        borderRadius: 14,
                        background: COLORS.goldSoft,
                        border: `1.5px solid ${COLORS.gold}`,
                        fontFamily: FONTS.display,
                        fontSize: 22,
                        fontWeight: 700,
                        color: COLORS.gold,
                        opacity: interpolate(bonusSpring, [0, 1], [0, 1]),
                        transform: `scale(${interpolate(bonusSpring, [0, 1], [0.82, 1])})`,
                      }}
                    >
                      +60 Bonus XP
                    </div>
                  </div>

                  {/* 3 Recall Check rows verifying mastery */}
                  {[
                    {
                      q: "Q1 · Where does encryption and decryption occur in E2EE?",
                      ans: "Exclusively on sender & recipient devices",
                      done: q1Done,
                    },
                    {
                      q: "Q2 · Can the messaging provider decrypt stored payloads?",
                      ans: "No — only ciphertext passes through servers",
                      done: q2Done,
                    },
                    {
                      q: "Q3 · What protects forward secrecy across chat sessions?",
                      ans: "Rotating ephemeral cryptographic session keys",
                      done: q3Done,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: item.done ? COLORS.correctBg : COLORS.bgCard,
                        border: `1.5px solid ${item.done ? COLORS.correctBorder : COLORS.oliveDim}`,
                        borderRadius: 14,
                        padding: "15px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: FONTS.display, fontSize: 15, fontWeight: 700, color: COLORS.ink }}>
                          {item.q}
                        </div>
                        <div
                          style={{
                            fontFamily: FONTS.sans,
                            fontSize: 14,
                            color: item.done ? COLORS.correctText : COLORS.muted,
                            marginTop: 3,
                            fontWeight: item.done ? 600 : 400,
                          }}
                        >
                          {item.ans}
                        </div>
                      </div>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: item.done ? COLORS.correctBorder : COLORS.bgPanel,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {item.done && <CheckIcon size={17} color="#FFFFFF" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AbsoluteFill>
          </BrowserFrame>
        </div>
      </AbsoluteFill>
    </FeyBackdrop>
  );
};
