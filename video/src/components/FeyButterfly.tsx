import React from "react";
import { interpolate } from "remotion";

interface FeyButterflyProps {
  size?: number;
  /** 0 = folded shut, 1 = fully open wings */
  unfold?: number;
  /** subtle wing breathing oscillation in degrees */
  flutter?: number;
  /** show the rounded linen card tile behind the butterfly */
  withTile?: boolean;
  /** 0..1 shimmer sweep across the emblem */
  shimmer?: number;
}

export const FeyButterfly: React.FC<FeyButterflyProps> = ({
  size = 160,
  unfold = 1,
  flutter = 0,
  withTile = true,
  shimmer = -1,
}) => {
  const leftScaleX = interpolate(unfold, [0, 1], [0.18, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rightScaleX = leftScaleX;
  const wingRotate = flutter;
  const shimmerX = interpolate(shimmer, [0, 1], [-140, 220], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        style={{ overflow: "visible" }}
      >
        <defs>
          <clipPath id="feyTileClip">
            <rect width="512" height="512" rx="112" />
          </clipPath>
          <linearGradient id="feyGoldShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(217,179,92,0)" />
            <stop offset="50%" stopColor="rgba(217,179,92,0.52)" />
            <stop offset="100%" stopColor="rgba(217,179,92,0)" />
          </linearGradient>
        </defs>

        {withTile && (
          <>
            <rect
              width="512"
              height="512"
              rx="112"
              fill="#F4EFE6"
              style={{
                filter: "drop-shadow(0 14px 32px rgba(30, 35, 18, 0.14))",
              }}
            />
            <rect
              x="16"
              y="16"
              width="480"
              height="480"
              rx="96"
              fill="none"
              stroke="#444E2C"
              strokeWidth="4"
              strokeOpacity="0.18"
            />
          </>
        )}

        <g transform="translate(64, 64) scale(3.84)">
          {/* Left Wings */}
          <g
            transform={`translate(50, 50) scale(${leftScaleX}, 1) rotate(${-wingRotate}) translate(-50, -50)`}
          >
            <path
              d="M 40,42 C 20,8 2,16 6,38 C 8,48 26,50 42,54"
              strokeWidth="2.5"
              stroke="#7A1C2E"
              fill="#7A1C2E"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 42,54 C 20,48 8,63 13,72 C 16,78 28,68 41,62"
              strokeWidth="2.5"
              stroke="#7A1C2E"
              fill="#7A1C2E"
              opacity="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 22,26 C 28,34 36,38 41,41"
              strokeWidth="1.2"
              stroke="#FDFCFA"
              opacity="0.75"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 24,56 C 30,58 35,57 41,54"
              strokeWidth="1.2"
              stroke="#FDFCFA"
              opacity="0.75"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Right Wings */}
          <g
            transform={`translate(50, 50) scale(${rightScaleX}, 1) rotate(${wingRotate}) translate(-50, -50)`}
          >
            <path
              d="M 60,42 C 80,8 98,16 94,38 C 92,48 74,50 58,54"
              strokeWidth="2.5"
              stroke="#7A1C2E"
              fill="#7A1C2E"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 58,54 C 80,48 92,63 87,72 C 84,78 72,68 59,62"
              strokeWidth="2.5"
              stroke="#7A1C2E"
              fill="#7A1C2E"
              opacity="0.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 78,26 C 72,34 64,38 59,41"
              strokeWidth="1.2"
              stroke="#FDFCFA"
              opacity="0.75"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 76,56 C 70,58 65,57 59,54"
              strokeWidth="1.2"
              stroke="#FDFCFA"
              opacity="0.75"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Brain-lobe core & golden spine */}
          <g>
            <path
              d="M 49,30 C 37,30 32,38 32,48 C 32,54 36,58 41,60 C 44,61 48,58 49,55 Z"
              fill="#FDFCFA"
              stroke="#A67C1E"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 38,40 C 35,45 42,48 48,46"
              stroke="#A67C1E"
              strokeWidth="1.3"
              opacity="0.75"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 36,50 C 40,52 43,49 48,52"
              stroke="#A67C1E"
              strokeWidth="1.3"
              opacity="0.75"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 51,30 C 63,30 68,38 68,48 C 68,54 64,58 59,60 C 56,61 52,58 51,55 Z"
              fill="#FDFCFA"
              stroke="#A67C1E"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 62,40 C 65,45 58,48 52,46"
              stroke="#A67C1E"
              strokeWidth="1.3"
              opacity="0.75"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 64,50 C 60,52 57,49 52,52"
              stroke="#A67C1E"
              strokeWidth="1.3"
              opacity="0.75"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 50,54 L 50,78"
              stroke="#A67C1E"
              strokeWidth="1.8"
              opacity="0.85"
              strokeLinecap="round"
            />
            <circle cx="50" cy="61" r="2.2" fill="#A67C1E" />
            <circle cx="50" cy="68" r="1.6" fill="#A67C1E" />
            <circle cx="50" cy="74" r="1.2" fill="#A67C1E" />
          </g>
        </g>

        {/* Optional diagonal gold shimmer sweep */}
        {shimmer >= 0 && shimmer <= 1 && withTile && (
          <g clipPath="url(#feyTileClip)">
            <rect
              x={shimmerX}
              y="-60"
              width="140"
              height="640"
              fill="url(#feyGoldShimmer)"
              transform="rotate(20 256 256)"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
