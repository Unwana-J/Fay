import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONTS, SPRINGS } from "../theme";

interface BrowserFrameProps {
  /** Path inside video/public/, e.g. "shots/articulate-lobby.png" */
  shot?: string;
  url: string;
  width: number;
  height: number;
  enterDelay?: number;
  /** Slow push-in start/end scale on the screenshot */
  zoomFrom?: number;
  zoomTo?: number;
  /** Optional pan offsets in percent (x, y) */
  panX?: [number, number];
  panY?: [number, number];
  /** Duration of Ken Burns move in frames */
  zoomDuration?: number;
  /** Optional custom viewport children (e.g. live interactive screen or overlays) */
  children?: React.ReactNode;
  /** Optional secondary screenshot that crossfades in at crossfadeAt frame */
  secondShot?: string;
  crossfadeAt?: number;
  crossfadeDuration?: number;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  shot,
  url,
  width,
  height,
  enterDelay = 0,
  zoomFrom = 1.0,
  zoomTo = 1.04,
  panX = [0, 0],
  panY = [0, 0],
  zoomDuration = 165,
  children,
  secondShot,
  crossfadeAt = 40,
  crossfadeDuration = 12,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: Math.max(0, frame - enterDelay),
    fps,
    config: SPRINGS.editorial,
  });

  const translateY = interpolate(enter, [0, 1], [42, 0]);
  const rotateX = interpolate(enter, [0, 1], [6, 0]);
  const opacity = interpolate(frame, [enterDelay, enterDelay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const kbProgress = interpolate(frame, [enterDelay, enterDelay + zoomDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const imgScale = interpolate(kbProgress, [0, 1], [zoomFrom, zoomTo]);
  const imgX = interpolate(kbProgress, [0, 1], panX);
  const imgY = interpolate(kbProgress, [0, 1], panY);

  const secondOpacity = secondShot
    ? interpolate(frame, [crossfadeAt, crossfadeAt + crossfadeDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const chromeH = 38;

  return (
    <div
      style={{
        width,
        height,
        opacity,
        transform: `perspective(1400px) translateY(${translateY}px) rotateX(${rotateX}deg)`,
        borderRadius: 16,
        overflow: "hidden",
        background: COLORS.bgCard,
        border: `1.5px solid ${COLORS.oliveDim}`,
        boxShadow:
          "0 28px 70px rgba(30, 35, 18, 0.16), 0 8px 24px rgba(30, 35, 18, 0.08)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Clean editorial browser chrome */}
      <div
        style={{
          height: chromeH,
          background: COLORS.bgPanel,
          borderBottom: `1px solid ${COLORS.oliveDim}`,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 7 }}>
          {["#D2C9BC", "#D2C9BC", "#D2C9BC"].map((c, idx) => (
            <div
              key={idx}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: COLORS.bgBase,
              border: `1px solid ${COLORS.oliveDim}`,
              borderRadius: 999,
              padding: "3px 16px",
              fontFamily: FONTS.sans,
              fontSize: 12,
              fontWeight: 500,
              color: COLORS.muted,
              letterSpacing: "0.01em",
            }}
          >
            {url}
          </div>
        </div>
        <div style={{ width: 44 }} />
      </div>

      {/* Viewport */}
      <div
        style={{
          position: "relative",
          flex: 1,
          overflow: "hidden",
          background: COLORS.bgBase,
        }}
      >
        {shot && (
          <Img
            src={staticFile(shot)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top left",
              transform: `scale(${imgScale}) translate(${imgX}%, ${imgY}%)`,
              transformOrigin: "left top",
            }}
          />
        )}
        {secondShot && secondOpacity > 0 && (
          <Img
            src={staticFile(secondShot)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top left",
              opacity: secondOpacity,
              transform: `scale(${imgScale}) translate(${imgX}%, ${imgY}%)`,
              transformOrigin: "left top",
            }}
          />
        )}
        {children}
      </div>
    </div>
  );
};
