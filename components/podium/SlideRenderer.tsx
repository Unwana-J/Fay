"use client";

import { type PodiumSlide } from "@/lib/podium-types";

interface SlideRendererProps {
  slide: PodiumSlide;
  isThumb?: boolean; // If true, render in thumbnail mode (smaller text, scaled)
}

export default function SlideRenderer({ slide, isThumb = false }: SlideRendererProps) {
  const containerStyle: React.CSSProperties = {
    background: slide.bgColor,
    color: slide.textColor,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: slide.layout === "title-only" || slide.layout === "closing" || slide.layout === "quote" ? "center" : "flex-start",
    padding: isThumb ? "16px" : "64px",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  };

  const accentBarStyle: React.CSSProperties = {
    width: isThumb ? 24 : 80,
    height: isThumb ? 3 : 8,
    background: slide.accentColor,
    borderRadius: 99,
    marginBottom: isThumb ? 8 : 24,
    flexShrink: 0,
  };

  const photoFrameStyle: React.CSSProperties = {
    borderRadius: isThumb ? 8 : 16,
    overflow: "hidden",
    boxShadow: isThumb ? "0 2px 8px rgba(0,0,0,0.3)" : "0 12px 32px rgba(0,0,0,0.45)",
    border: isThumb ? "2px solid rgba(255,255,255,0.25)" : "4px solid rgba(255,255,255,0.3)",
    background: "rgba(0,0,0,0.2)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  // ── TITLE ONLY & CLOSING ──────────────────────────────────────────────────
  if (slide.layout === "title-only" || slide.layout === "closing") {
    return (
      <div style={containerStyle}>
        {/* Background decoration */}
        <div style={{
          position: "absolute",
          right: isThumb ? -20 : -80,
          bottom: isThumb ? -20 : -80,
          width: isThumb ? 80 : 300,
          height: isThumb ? 80 : 300,
          borderRadius: "50%",
          background: slide.accentColor,
          opacity: 0.08,
        }} />

        <div style={accentBarStyle} />
        <h1
          style={{
            color: slide.textColor,
            fontFamily: "var(--font-space, 'Space Grotesk', sans-serif)",
            fontWeight: 900,
            fontSize: isThumb ? "clamp(11px, 3.2vw, 16px)" : "clamp(28px, 4.5vw, 64px)",
            lineHeight: 1.1,
            marginBottom: isThumb ? 4 : 16,
            letterSpacing: "-0.02em",
          }}
        >
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p
            style={{
              color: slide.textColor,
              opacity: 0.7,
              fontSize: isThumb ? "clamp(7px, 1.8vw, 10px)" : "clamp(13px, 1.6vw, 18px)",
              fontWeight: 400,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: slide.imageUrl ? (isThumb ? 6 : 20) : 0,
            }}
          >
            {slide.subtitle}
          </p>
        )}

        {slide.imageUrl && (
          <div style={{ marginTop: isThumb ? 4 : 16, alignSelf: "center" }}>
            <div style={photoFrameStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.imageAlt || slide.title}
                style={{
                  maxHeight: isThumb ? 60 : 340,
                  maxWidth: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── QUOTE ─────────────────────────────────────────────────────────────────
  if (slide.layout === "quote") {
    return (
      <div style={containerStyle}>
        <div style={{
          position: "absolute",
          top: isThumb ? 4 : 20,
          left: isThumb ? 8 : 40,
          fontSize: isThumb ? 32 : 120,
          color: slide.accentColor,
          opacity: 0.25,
          lineHeight: 1,
          fontFamily: "Georgia, serif",
          userSelect: "none",
        }}>"
        </div>

        <div style={{ display: "flex", flexDirection: slide.imageUrl && !isThumb ? "row" : "column", alignItems: "center", gap: isThumb ? 8 : 32, width: "100%", zIndex: 1 }}>
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
                }}
              >
                — {slide.attribution}
              </p>
            )}
          </div>

          {slide.imageUrl && (
            <div style={photoFrameStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.imageAlt || "Quote visual"}
                style={{
                  maxHeight: isThumb ? 54 : 280,
                  maxWidth: isThumb ? 80 : 360,
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
          }}
        >
          {slide.title}
        </h2>

        <div style={{ display: "flex", flexDirection: slide.imageUrl && !isThumb ? "row" : "column", alignItems: "flex-start", gap: isThumb ? 8 : 32, width: "100%", flex: 1 }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: isThumb ? 4 : 16, flex: 1 }}>
            {(slide.bullets || []).map((bullet, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: isThumb ? 6 : 14 }}>
                <span style={{ color: slide.accentColor, fontWeight: 900, fontSize: isThumb ? 8 : 18, lineHeight: 1.4, flexShrink: 0 }}>→</span>
                <span style={{ color: slide.textColor, fontSize: isThumb ? "clamp(8px, 1.8vw, 11px)" : "clamp(13px, 1.6vw, 18px)", lineHeight: 1.5, opacity: 0.9 }}>
                  {bullet}
                </span>
              </li>
            ))}
          </ul>

          {slide.imageUrl && (
            <div style={photoFrameStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.imageAlt || slide.title}
                style={{
                  maxHeight: isThumb ? 54 : 300,
                  maxWidth: isThumb ? 90 : 380,
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

  // ── TITLE + BODY (default) ────────────────────────────────────────────────
  return (
    <div style={containerStyle}>
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
        }}
      >
        {slide.title}
      </h2>

      <div style={{ display: "flex", flexDirection: slide.imageUrl && !isThumb ? "row" : "column", alignItems: "flex-start", gap: isThumb ? 8 : 32, width: "100%", flex: 1 }}>
        {slide.body && (
          <p
            style={{
              color: slide.textColor,
              opacity: 0.85,
              fontSize: isThumb ? "clamp(8px, 1.8vw, 11px)" : "clamp(15px, 1.8vw, 22px)",
              lineHeight: 1.6,
              flex: 1,
            }}
          >
            {slide.body}
          </p>
        )}

        {slide.imageUrl && (
          <div style={photoFrameStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.imageUrl}
              alt={slide.imageAlt || slide.title}
              style={{
                maxHeight: isThumb ? 60 : 340,
                maxWidth: isThumb ? 100 : 420,
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
