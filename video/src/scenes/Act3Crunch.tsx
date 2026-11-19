import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FeyBackdrop } from "../components/FeyBackdrop";
import { FeyButterfly } from "../components/FeyButterfly";
import { FlameIcon, QuizIcon, SlidesIcon, TimerIcon } from "../components/MotionPrimitives";
import { COLORS, FONTS, SPRINGS } from "../theme";

interface MechanicTile {
  id: string;
  label: string;
  sub: string;
  /** Desktop (1920x1080) offset from center */
  dx16: number;
  dy16: number;
  /** Vertical (1080x1920) offset from center */
  dx9: number;
  dy9: number;
  rot: number;
}

const MECHANICS: MechanicTile[] = [
  { id: "streak", label: "Daily Streaks", sub: "14d active", dx16: -560, dy16: -165, dx9: -290, dy9: -260, rot: -7 },
  { id: "timer", label: "Speed Rounds", sub: "45s sprint", dx16: 540, dy16: -175, dx9: 290, dy9: -240, rot: 6 },
  { id: "quiz", label: "Live Trivia", sub: "A · B · C · D", dx16: -600, dy16: 175, dx9: -285, dy9: 255, rot: 5 },
  { id: "slides", label: "Party Decks", sub: "5-slide pitch", dx16: 0, dy16: 245, dx9: 0, dy9: 430, rot: -3 },
  { id: "math", label: "Mental Math", sub: "+  −  ×  ÷", dx16: 570, dy16: 170, dx9: 285, dy9: 255, rot: -6 },
];

export const Act3Crunch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isVertical = height > width;

  // 0..86f:    "We took the best parts of the apps you love…" + 5 mechanic tiles hover in
  // 86..136f:  THE CRUNCH — tiles pull magnetically into dead center & squash into folded orb + shockwave
  //            Headline flips to "…and built them around Feynman's method."
  // 136..210f: Orb unfolds cleanly into the Fey Butterfly + wordmark reveal!

  const line1Opacity = interpolate(frame, [0, 12, 78, 92], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Opacity = interpolate(frame, [92, 104, 134, 146], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pull-in crunch progress (frame 84 -> 114)
  const crunchProgress = interpolate(frame, [84, 114], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.exp),
  });

  // Impact compression & shockwave at frame 114..138
  const impactFrame = Math.max(0, frame - 114);
  const shockScale = interpolate(impactFrame, [0, 26], [0.2, 2.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const shockOpacity = interpolate(impactFrame, [0, 6, 26], [0, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Folded paper diamond orb visible briefly between crunch impact (112) and butterfly unfold (138)
  const orbOpacity = interpolate(frame, [108, 115, 134, 142], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const orbScale =
    frame < 124
      ? interpolate(frame, [110, 118, 124], [1.35, 0.68, 0.88], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : interpolate(frame, [124, 140], [0.88, 1.15], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  // Butterfly reveal starting at frame 132
  const revealSpring = spring({
    frame: Math.max(0, frame - 134),
    fps,
    config: SPRINGS.editorial,
  });
  const wingUnfold = spring({
    frame: Math.max(0, frame - 138),
    fps,
    config: { damping: 18, stiffness: 150, mass: 0.9 },
  });
  const wordmarkSpring = spring({
    frame: Math.max(0, frame - 148),
    fps,
    config: SPRINGS.editorial,
  });
  const shimmer = interpolate(frame, [154, 188], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const renderTileVisual = (id: string) => {
    switch (id) {
      case "streak":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: COLORS.goldSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FlameIcon size={26} color={COLORS.gold} />
            </div>
            <div style={{ fontFamily: FONTS.display, fontSize: 30, fontWeight: 700, color: COLORS.gold }}>
              14d
            </div>
          </div>
        );
      case "timer": {
        const dash = interpolate(frame, [0, 90], [0, 62], { extrapolateRight: "clamp" });
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="46" height="46" viewBox="0 0 46 46">
              <circle cx="23" cy="23" r="18" fill="none" stroke={COLORS.oliveDim} strokeWidth="4" />
              <circle
                cx="23"
                cy="23"
                r="18"
                fill="none"
                stroke={COLORS.terra}
                strokeWidth="4"
                strokeDasharray="113"
                strokeDashoffset={dash}
                strokeLinecap="round"
                transform="rotate(-90 23 23)"
              />
            </svg>
            <TimerIcon size={24} color={COLORS.terra} />
          </div>
        );
      }
      case "quiz":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "rgba(68, 78, 44, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QuizIcon size={24} color={COLORS.olive} />
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {["A", "B", "C"].map((ltr, i) => (
                <div
                  key={ltr}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: i === 1 ? COLORS.olive : COLORS.bgPanel,
                    color: i === 1 ? "#FFFFFF" : COLORS.olive,
                    fontFamily: FONTS.display,
                    fontSize: 13,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {ltr}
                </div>
              ))}
            </div>
          </div>
        );
      case "slides":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "rgba(68, 78, 44, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SlidesIcon size={24} color={COLORS.olive} />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map((s) => (
                <div
                  key={s}
                  style={{
                    width: 22,
                    height: 30,
                    borderRadius: 5,
                    background: s === 0 ? COLORS.terra : COLORS.bgPanel,
                    border: `1px solid ${COLORS.oliveDim}`,
                  }}
                />
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 5,
              width: 56,
              height: 56,
            }}
          >
            {["+", "−", "×", "÷"].map((op, i) => (
              <div
                key={op}
                style={{
                  borderRadius: 7,
                  background: i === 2 ? COLORS.terra : COLORS.bgPanel,
                  color: i === 2 ? "#FFFFFF" : COLORS.olive,
                  fontFamily: FONTS.display,
                  fontSize: 17,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {op}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <FeyBackdrop variant="cream">
      {/* Headlines for Beat 1 & Beat 2 */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: isVertical ? "0 80px" : "0 200px",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        {line1Opacity > 0.01 && (
          <div
            style={{
              position: "absolute",
              textAlign: "center",
              maxWidth: isVertical ? 820 : 940,
              opacity: line1Opacity,
              transform: `translateY(${interpolate(frame, [0, 18], [24, 0], { extrapolateRight: "clamp" })}px)`,
              fontFamily: FONTS.serif,
              fontSize: isVertical ? 60 : 68,
              fontWeight: 700,
              color: COLORS.ink,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
            }}
          >
            We took the best parts of the apps you love…
          </div>
        )}

        {line2Opacity > 0.01 && (
          <div
            style={{
              position: "absolute",
              top: isVertical ? 260 : 128,
              textAlign: "center",
              maxWidth: isVertical ? 860 : 1120,
              opacity: line2Opacity,
              transform: `translateY(${interpolate(frame, [92, 108], [20, 0], { extrapolateRight: "clamp" })}px)`,
              fontFamily: FONTS.serif,
              fontSize: isVertical ? 56 : 64,
              fontWeight: 700,
              color: COLORS.ink,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
            }}
          >
            …and built them around{" "}
            <span style={{ color: COLORS.terra }}>Feynman&apos;s method.</span>
          </div>
        )}
      </AbsoluteFill>

      {/* Five floating mechanic tiles that crunch to center */}
      {frame < 120 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          {MECHANICS.map((tile, idx) => {
            const tileEnter = spring({
              frame: Math.max(0, frame - (4 + idx * 7)),
              fps,
              config: SPRINGS.editorial,
            });
            const baseDx = isVertical ? tile.dx9 : tile.dx16;
            const baseDy = isVertical ? tile.dy9 : tile.dy16;
            const hoverY = Math.sin(frame * 0.09 + idx * 1.4) * 8 * (1 - crunchProgress);

            const x = interpolate(crunchProgress, [0, 1], [baseDx, 0]);
            const y = interpolate(crunchProgress, [0, 1], [baseDy + hoverY, 0]);
            const scale =
              interpolate(tileEnter, [0, 1], [0.65, 1]) *
              interpolate(crunchProgress, [0, 0.85, 1], [1, 0.72, 0.22]);
            const rot = interpolate(crunchProgress, [0, 1], [tile.rot, tile.rot * 6]);
            const opacity =
              interpolate(tileEnter, [0, 1], [0, 1]) *
              interpolate(crunchProgress, [0.82, 1], [1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });

            return (
              <div
                key={tile.id}
                style={{
                  position: "absolute",
                  transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`,
                  opacity,
                  background: COLORS.bgCard,
                  border: `1.5px solid ${COLORS.oliveDim}`,
                  borderRadius: 20,
                  padding: "20px 24px",
                  minWidth: 224,
                  boxShadow: "0 18px 42px rgba(30, 35, 18, 0.10)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {renderTileVisual(tile.id)}
                <div>
                  <div
                    style={{
                      fontFamily: FONTS.display,
                      fontSize: 18,
                      fontWeight: 700,
                      color: COLORS.ink,
                    }}
                  >
                    {tile.label}
                  </div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: 14, color: COLORS.muted, marginTop: 2 }}>
                    {tile.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      )}

      {/* Radial paper-crunch shockwave ring */}
      {shockOpacity > 0.01 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
              border: `3px solid ${COLORS.terra}`,
              opacity: shockOpacity,
              transform: `scale(${shockScale})`,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 170,
              height: 170,
              borderRadius: "50%",
              border: `2px solid ${COLORS.gold}`,
              opacity: shockOpacity * 0.75,
              transform: `scale(${shockScale * 0.78})`,
            }}
          />
        </AbsoluteFill>
      )}

      {/* Folded origami paper diamond orb right at the crunch point */}
      {orbOpacity > 0.01 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
          <svg
            width="180"
            height="180"
            viewBox="0 0 180 180"
            style={{
              opacity: orbOpacity,
              transform: `scale(${orbScale}) rotate(${interpolate(frame, [110, 140], [-18, 45])}deg)`,
            }}
          >
            <polygon
              points="90,12 168,90 90,168 12,90"
              fill={COLORS.paperWarm}
              stroke={COLORS.terra}
              strokeWidth="3.5"
            />
            <polygon
              points="90,12 168,90 90,90"
              fill="rgba(122, 28, 46, 0.14)"
            />
            <polygon
              points="12,90 90,90 90,168"
              fill="rgba(68, 78, 44, 0.12)"
            />
            <line x1="12" y1="90" x2="168" y2="90" stroke={COLORS.oliveDim} strokeWidth="2" />
            <line x1="90" y1="12" x2="90" y2="168" stroke={COLORS.oliveDim} strokeWidth="2" />
          </svg>
        </AbsoluteFill>
      )}

      {/* BEAT 3: FEY BUTTERFLY UNFOLDS + BRAND LOCKUP */}
      {frame >= 132 && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              opacity: interpolate(revealSpring, [0, 1], [0, 1]),
              transform: `scale(${interpolate(revealSpring, [0, 1], [0.55, 1])})`,
            }}
          >
            <FeyButterfly
              size={isVertical ? 230 : 210}
              unfold={wingUnfold}
              flutter={Math.sin(frame * 0.18) * 2.5}
              shimmer={frame >= 154 ? shimmer : -1}
            />
          </div>

          <div
            style={{
              textAlign: "center",
              opacity: interpolate(wordmarkSpring, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(wordmarkSpring, [0, 1], [28, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: FONTS.serif,
                fontSize: isVertical ? 112 : 108,
                fontWeight: 700,
                color: COLORS.ink,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              Fey
            </div>
            <div
              style={{
                marginTop: 14,
                fontFamily: FONTS.display,
                fontSize: isVertical ? 28 : 28,
                fontWeight: 500,
                color: COLORS.olive,
                letterSpacing: "0.06em",
              }}
            >
              Think deeper. Articulate clearly.
            </div>
          </div>
        </AbsoluteFill>
      )}
    </FeyBackdrop>
  );
};
