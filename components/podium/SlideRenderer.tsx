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

  // ── TITLE ONLY (title card & closing) ─────────────────────────────────────
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
            fontSize: isThumb ? "clamp(12px, 3.5vw, 18px)" : "clamp(32px, 5vw, 72px)",
            lineHeight: 1.1,
            marginBottom: isThumb ? 6 : 20,
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
              fontSize: isThumb ? "clamp(8px, 2vw, 11px)" : "clamp(14px, 1.8vw, 20px)",
              fontWeight: 400,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {slide.subtitle}
          </p>
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
        <p
          style={{
            color: slide.textColor,
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: "italic",
            fontSize: isThumb ? "clamp(10px, 2.5vw, 14px)" : "clamp(20px, 3vw, 40px)",
            lineHeight: 1.4,
            marginBottom: isThumb ? 8 : 24,
            maxWidth: "90%",
          }}
        >
          {slide.quote || slide.title}
        </p>
        {slide.attribution && (
          <p
            style={{
              color: slide.accentColor,
              fontSize: isThumb ? "clamp(8px, 1.5vw, 10px)" : "clamp(12px, 1.4vw, 16px)",
              fontWeight: 600,
              letterSpacing: "0.06em",
            }}
          >
            — {slide.attribution}
          </p>
        )}
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
            marginBottom: isThumb ? 8 : 28,
            letterSpacing: "-0.01em",
          }}
        >
          {slide.title}
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: isThumb ? 4 : 16 }}>
          {(slide.bullets || []).map((bullet, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: isThumb ? 6 : 16 }}>
              <span style={{ color: slide.accentColor, fontWeight: 900, fontSize: isThumb ? 8 : 20, lineHeight: 1.4, flexShrink: 0 }}>→</span>
              <span style={{ color: slide.textColor, fontSize: isThumb ? "clamp(8px, 2vw, 11px)" : "clamp(14px, 1.8vw, 20px)", lineHeight: 1.5, opacity: 0.9 }}>
                {bullet}
              </span>
            </li>
          ))}
        </ul>
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
          marginBottom: isThumb ? 8 : 28,
          letterSpacing: "-0.01em",
        }}
      >
        {slide.title}
      </h2>
      {slide.body && (
        <p
          style={{
            color: slide.textColor,
            opacity: 0.85,
            fontSize: isThumb ? "clamp(8px, 2vw, 11px)" : "clamp(16px, 2vw, 24px)",
            lineHeight: 1.6,
            maxWidth: "80%",
          }}
        >
          {slide.body}
        </p>
      )}
    </div>
  );
}
