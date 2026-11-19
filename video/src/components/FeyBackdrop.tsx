import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

interface FeyBackdropProps {
  variant?: "cream" | "chalk";
  showFrame?: boolean;
  children?: React.ReactNode;
}

export const FeyBackdrop: React.FC<FeyBackdropProps> = ({
  variant = "cream",
  showFrame = true,
  children,
}) => {
  const { width, height } = useVideoConfig();
  const isVertical = height > width;
  const isChalk = variant === "chalk";
  const pad = isVertical ? 36 : 44;

  const bgGradient = isChalk
    ? `radial-gradient(ellipse 85% 75% at 50% 42%, #2B341B 0%, ${COLORS.chalkboard} 58%, ${COLORS.chalkboardDeep} 100%)`
    : `radial-gradient(ellipse 90% 80% at 50% 35%, #FAF8F4 0%, ${COLORS.bgBase} 62%, #EFECE3 100%)`;

  const lineColor = isChalk ? "rgba(242, 239, 231, 0.11)" : "rgba(68, 78, 44, 0.12)";
  const tickColor = isChalk ? "rgba(217, 179, 92, 0.35)" : "rgba(68, 78, 44, 0.28)";

  return (
    <AbsoluteFill style={{ background: bgGradient, overflow: "hidden" }}>
      {/* Fine subtle archival dot / chalk grid */}
      <AbsoluteFill
        style={{
          backgroundImage: isChalk
            ? "radial-gradient(rgba(242, 239, 231, 0.055) 1px, transparent 1px)"
            : "radial-gradient(rgba(68, 78, 44, 0.055) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: isChalk ? 0.7 : 0.65,
        }}
      />

      {/* Subtle SVG paper/chalk grain */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          inset: 0,
          opacity: isChalk ? 0.07 : 0.032,
          pointerEvents: "none",
        }}
      >
        <filter id={`grain-${variant}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={isChalk ? "0.75" : "0.9"}
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${variant})`} />
      </svg>

      {/* Archival broadside border frame */}
      {showFrame && (
        <div
          style={{
            position: "absolute",
            inset: pad,
            border: `1px solid ${lineColor}`,
            borderRadius: 12,
            pointerEvents: "none",
          }}
        >
          {/* Corner editorial crosshairs */}
          {[
            { top: -1, left: -1 },
            { top: -1, right: -1 },
            { bottom: -1, left: -1 },
            { bottom: -1, right: -1 },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 14,
                height: 14,
                ...pos,
                borderTop: pos.top !== undefined ? `2px solid ${tickColor}` : undefined,
                borderBottom: pos.bottom !== undefined ? `2px solid ${tickColor}` : undefined,
                borderLeft: pos.left !== undefined ? `2px solid ${tickColor}` : undefined,
                borderRight: pos.right !== undefined ? `2px solid ${tickColor}` : undefined,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      )}

      {children}
    </AbsoluteFill>
  );
};
