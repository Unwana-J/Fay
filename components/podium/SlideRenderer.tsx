"use client";

import { type PodiumSlide, type SlideImageSize, type SlideImageFit } from "@/lib/podium-types";

interface SlideRendererProps {
  slide: PodiumSlide;
  isThumb?: boolean; // If true, render in thumbnail mode (smaller text, scaled)
}

export default function SlideRenderer({ slide, isThumb = false }: SlideRendererProps) {
  const imageSize: SlideImageSize = slide.imageSize || "medium";
  const imageFit: SlideImageFit = slide.imageFit || "contain";
  const isFullBleed = Boolean(slide.imageUrl && imageSize === "fill" && imageFit === "cover");

  // In closing or title-only layouts with large/fill framed images, start from top so the image has full vertical room
  const shouldJustifyStart =
    (slide.layout === "title-only" || slide.layout === "closing") &&
    Boolean(slide.imageUrl && (imageSize === "large" || imageSize === "fill") && !isFullBleed);

  const containerStyle: React.CSSProperties = {
    background: slide.bgColor,
    color: slide.textColor,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: shouldJustifyStart
      ? "flex-start"
      : slide.layout === "title-only" || slide.layout === "closing" || slide.layout === "quote"
      ? "center"
      : "flex-start",
    padding: isThumb ? "16px" : "56px",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  };

  const accentBarStyle: React.CSSProperties = {
    width: isThumb ? 24 : 80,
    height: isThumb ? 3 : 8,
    background: slide.accentColor,
    borderRadius: 99,
    marginBottom: isThumb ? 6 : 20,
    flexShrink: 0,
    position: "relative",
    zIndex: 2,
  };

  const textShadowStyle: React.CSSProperties = isFullBleed
    ? { textShadow: "0 2px 14px rgba(0,0,0,0.92), 0 0 2px rgba(0,0,0,0.9)" }
    : {};

  const photoFrameBaseStyle: React.CSSProperties = {
    borderRadius: isThumb ? 8 : 16,
    overflow: "hidden",
    boxShadow: isThumb ? "0 2px 8px rgba(0,0,0,0.3)" : "0 12px 32px rgba(0,0,0,0.45)",
    border: isThumb ? "2px solid rgba(255,255,255,0.25)" : "4px solid rgba(255,255,255,0.3)",
    background: "rgba(0,0,0,0.2)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
    zIndex: 2,
  };

  // Full-bleed background layer (when user selects Fill Page + Full Bleed)
  const fullBleedBackground = isFullBleed && slide.imageUrl ? (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.imageUrl}
        alt={slide.imageAlt || slide.title}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0,0,0,0.46) 0%, rgba(0,0,0,0.76) 100%)",
          zIndex: 1,
        }}
      />
    </>
  ) : null;

  // ── TITLE ONLY & CLOSING ──────────────────────────────────────────────────
  if (slide.layout === "title-only" || slide.layout === "closing") {
    return (
      <div style={containerStyle}>
        {fullBleedBackground}

        {/* Background decoration (when not full-bleed) */}
        {!isFullBleed && (
          <div
            style={{
              position: "absolute",
              right: isThumb ? -20 : -80,
              bottom: isThumb ? -20 : -80,
              width: isThumb ? 80 : 300,
              height: isThumb ? 80 : 300,
              borderRadius: "50%",
              background: slide.accentColor,
              opacity: 0.08,
              zIndex: 0,
            }}
          />
        )}

        <div style={{ position: "relative", zIndex: 2, width: "100%", display: "flex", flexDirection: "column", height: shouldJustifyStart ? "100%" : "auto" }}>
          <div style={accentBarStyle} />
          <h1
            style={{
              color: slide.textColor,
              fontFamily: "var(--font-space, 'Space Grotesk', sans-serif)",
              fontWeight: 900,
              fontSize: isThumb ? "clamp(11px, 3.2vw, 16px)" : "clamp(26px, 4vw, 58px)",
              lineHeight: 1.1,
              marginBottom: isThumb ? 3 : 12,
              letterSpacing: "-0.02em",
              ...textShadowStyle,
            }}
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p
              style={{
                color: slide.textColor,
                opacity: isFullBleed ? 0.95 : 0.7,
                fontSize: isThumb ? "clamp(7px, 1.8vw, 10px)" : "clamp(12px, 1.4vw, 16px)",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: slide.imageUrl && !isFullBleed ? (isThumb ? 4 : 16) : 0,
                ...textShadowStyle,
              }}
            >
              {slide.subtitle}
            </p>
          )}

          {!isFullBleed && slide.imageUrl && (
            <div
              style={{
                marginTop: isThumb ? 4 : 12,
                alignSelf: "center",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: imageSize === "fill" ? 1 : undefined,
                minHeight: 0,
              }}
            >
              <div
                style={{
                  ...photoFrameBaseStyle,
                  ...(imageSize === "fill"
                    ? {
                        width: "100%",
                        height: "100%",
                        maxHeight: isThumb ? 130 : 620,
                        maxWidth: "100%",
                      }
                    : imageSize === "large"
                    ? {
                        width: "100%",
                        maxWidth: isThumb ? 240 : 880,
                        maxHeight: isThumb ? 85 : 480,
                      }
                    : imageSize === "small"
                    ? {
                        maxWidth: isThumb ? 100 : 340,
                        maxHeight: isThumb ? 45 : 220,
                      }
                    : {
                        maxWidth: "100%",
                        maxHeight: isThumb ? 65 : 340,
                      }),
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.imageUrl}
                  alt={slide.imageAlt || slide.title}
                  style={{
                    maxHeight:
                      imageSize === "fill"
                        ? isThumb ? 130 : 600
                        : imageSize === "large"
                        ? isThumb ? 85 : 460
                        : imageSize === "small"
                        ? isThumb ? 45 : 200
                        : isThumb ? 65 : 340,
                    maxWidth: "100%",
                    width: imageSize === "fill" ? "100%" : "auto",
                    height: imageSize === "fill" ? "100%" : "auto",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── QUOTE ─────────────────────────────────────────────────────────────────
  if (slide.layout === "quote") {
    return (
      <div style={containerStyle}>
        {fullBleedBackground}

        <div
          style={{
            position: "absolute",
            top: isThumb ? 4 : 20,
            left: isThumb ? 8 : 40,
            fontSize: isThumb ? 32 : 120,
            color: slide.accentColor,
            opacity: 0.25,
            lineHeight: 1,
            fontFamily: "Georgia, serif",
            userSelect: "none",
            zIndex: 1,
          }}
        >
          &ldquo;
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: slide.imageUrl && !isThumb && !isFullBleed ? "row" : "column",
            alignItems: "center",
            gap: isThumb ? 8 : 32,
            width: "100%",
            zIndex: 2,
            position: "relative",
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                color: slide.textColor,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontStyle: "italic",
                fontSize: isThumb ? "clamp(9px, 2.2vw, 13px)" : "clamp(18px, 2.6vw, 36px)",
                lineHeight: 1.4,
                marginBottom: isThumb ? 6 : 18,
                maxWidth: "95%",
                ...textShadowStyle,
              }}
            >
              {slide.quote || slide.title}
            </p>
            {slide.attribution && (
              <p
                style={{
                  color: slide.accentColor,
                  fontSize: isThumb ? "clamp(7px, 1.4vw, 9px)" : "clamp(11px, 1.3vw, 15px)",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  ...textShadowStyle,
                }}
              >
                — {slide.attribution}
              </p>
            )}
          </div>

          {!isFullBleed && slide.imageUrl && (
            <div
              style={{
                ...photoFrameBaseStyle,
                ...(imageSize === "fill"
                  ? { maxHeight: isThumb ? 100 : 540, maxWidth: isThumb ? 160 : 700, flex: 2 }
                  : imageSize === "large"
                  ? { maxHeight: isThumb ? 75 : 420, maxWidth: isThumb ? 120 : 520, flex: 1.4 }
                  : imageSize === "small"
                  ? { maxHeight: isThumb ? 45 : 200, maxWidth: isThumb ? 70 : 260 }
                  : { maxHeight: isThumb ? 54 : 280, maxWidth: isThumb ? 80 : 360 }),
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.imageAlt || "Quote visual"}
                style={{
                  maxHeight:
                    imageSize === "fill"
                      ? isThumb ? 100 : 520
                      : imageSize === "large"
                      ? isThumb ? 75 : 400
                      : imageSize === "small"
                      ? isThumb ? 45 : 190
                      : isThumb ? 54 : 280,
                  maxWidth: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── TITLE + BULLETS ──────────────────────────────────────────────────────
  if (slide.layout === "title-bullets") {
    return (
      <div style={containerStyle}>
        {fullBleedBackground}

        <div style={{ position: "relative", zIndex: 2, width: "100%", display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={accentBarStyle} />
          <h2
            style={{
              color: slide.textColor,
              fontFamily: "var(--font-space, 'Space Grotesk', sans-serif)",
              fontWeight: 800,
              fontSize: isThumb ? "clamp(10px, 2.5vw, 13px)" : "clamp(18px, 2.5vw, 32px)",
              lineHeight: 1.2,
              marginBottom: isThumb ? 8 : 24,
              letterSpacing: "-0.01em",
              ...textShadowStyle,
            }}
          >
            {slide.title}
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: slide.imageUrl && !isThumb && !isFullBleed ? "row" : "column",
              alignItems: "flex-start",
              gap: isThumb ? 8 : 32,
              width: "100%",
              flex: 1,
            }}
          >
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: isThumb ? 4 : 16,
                flex: 1,
              }}
            >
              {(slide.bullets || []).map((bullet, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: isThumb ? 6 : 14 }}>
                  <span style={{ color: slide.accentColor, fontWeight: 900, fontSize: isThumb ? 8 : 18, lineHeight: 1.4, flexShrink: 0 }}>
                    →
                  </span>
                  <span
                    style={{
                      color: slide.textColor,
                      fontSize: isThumb ? "clamp(8px, 1.8vw, 11px)" : "clamp(13px, 1.6vw, 18px)",
                      lineHeight: 1.5,
                      opacity: isFullBleed ? 1 : 0.9,
                      ...textShadowStyle,
                    }}
                  >
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            {!isFullBleed && slide.imageUrl && (
              <div
                style={{
                  ...photoFrameBaseStyle,
                  ...(imageSize === "fill"
                    ? { maxHeight: isThumb ? 110 : 580, maxWidth: isThumb ? 220 : 850, flex: 2.2 }
                    : imageSize === "large"
                    ? { maxHeight: isThumb ? 80 : 460, maxWidth: isThumb ? 140 : 580, flex: 1.5 }
                    : imageSize === "small"
                    ? { maxHeight: isThumb ? 45 : 220, maxWidth: isThumb ? 70 : 280, flex: 0.7 }
                    : { maxHeight: isThumb ? 54 : 300, maxWidth: isThumb ? 90 : 380 }),
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.imageUrl}
                  alt={slide.imageAlt || slide.title}
                  style={{
                    maxHeight:
                      imageSize === "fill"
                        ? isThumb ? 110 : 560
                        : imageSize === "large"
                        ? isThumb ? 80 : 440
                        : imageSize === "small"
                        ? isThumb ? 45 : 210
                        : isThumb ? 54 : 300,
                    maxWidth: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── TITLE + BODY (default) ────────────────────────────────────────────────
  return (
    <div style={containerStyle}>
      {fullBleedBackground}

      <div style={{ position: "relative", zIndex: 2, width: "100%", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={accentBarStyle} />
        <h2
          style={{
            color: slide.textColor,
            fontFamily: "var(--font-space, 'Space Grotesk', sans-serif)",
            fontWeight: 800,
            fontSize: isThumb ? "clamp(10px, 2.5vw, 13px)" : "clamp(18px, 2.5vw, 32px)",
            lineHeight: 1.2,
            marginBottom: isThumb ? 6 : 22,
            letterSpacing: "-0.01em",
            ...textShadowStyle,
          }}
        >
          {slide.title}
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: slide.imageUrl && !isThumb && !isFullBleed ? "row" : "column",
            alignItems: "flex-start",
            gap: isThumb ? 8 : 32,
            width: "100%",
            flex: 1,
          }}
        >
          {slide.body && (
            <p
              style={{
                color: slide.textColor,
                opacity: isFullBleed ? 1 : 0.85,
                fontSize: isThumb ? "clamp(8px, 1.8vw, 11px)" : "clamp(15px, 1.8vw, 22px)",
                lineHeight: 1.6,
                flex: 1,
                ...textShadowStyle,
              }}
            >
              {slide.body}
            </p>
          )}

          {!isFullBleed && slide.imageUrl && (
            <div
              style={{
                ...photoFrameBaseStyle,
                ...(imageSize === "fill"
                  ? { maxHeight: isThumb ? 110 : 580, maxWidth: isThumb ? 220 : 850, flex: 2.2 }
                  : imageSize === "large"
                  ? { maxHeight: isThumb ? 80 : 460, maxWidth: isThumb ? 140 : 580, flex: 1.5 }
                  : imageSize === "small"
                  ? { maxHeight: isThumb ? 45 : 220, maxWidth: isThumb ? 70 : 280, flex: 0.7 }
                  : { maxHeight: isThumb ? 60 : 340, maxWidth: isThumb ? 100 : 420 }),
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.imageAlt || slide.title}
                style={{
                  maxHeight:
                    imageSize === "fill"
                      ? isThumb ? 110 : 560
                      : imageSize === "large"
                      ? isThumb ? 80 : 440
                      : imageSize === "small"
                      ? isThumb ? 45 : 210
                      : isThumb ? 60 : 340,
                  maxWidth: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

