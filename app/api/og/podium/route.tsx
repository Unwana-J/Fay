import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { decodePodiumDeck } from "@/lib/podium-share";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || "";
    const deck = code ? decodePodiumDeck(code) : null;

    const topic = deck?.topic || searchParams.get("topic") || "Party Presentation";
    const subtitle = deck?.subtitle || searchParams.get("subtitle") || "A Bold Party Presentation on Fey";
    const author = deck?.author || searchParams.get("author") || "Scholar";
    const slideCount = deck?.slides?.length || 5;

    const slideParam = searchParams.get("slide");
    const highlight = searchParams.get("highlight") || searchParams.get("q") || "";
    const slideIdx = slideParam ? Math.max(0, Math.min(parseInt(slideParam, 10) - 1, slideCount - 1)) : 0;
    const featuredSlide = (deck?.slides && deck.slides[slideIdx]) ? deck.slides[slideIdx] : deck?.slides?.[0];

    const bgColor = featuredSlide?.bgColor || deck?.slides?.[0]?.bgColor || "#101D17";
    const accentColor = featuredSlide?.accentColor || deck?.slides?.[0]?.accentColor || "#DDAA55";

    const isHighlightMode = Boolean(slideIdx > 0 || highlight);

    let displayHeading = topic;
    let displaySub = subtitle;
    let countBadge = `${slideCount} Slides Deck`;

    if (isHighlightMode) {
      countBadge = `Slide ${slideIdx + 1} of ${slideCount}`;
      if (highlight) {
        displayHeading = highlight.startsWith("“") || highlight.startsWith('"') ? highlight : `“${highlight}”`;
        displaySub = `From "${topic}"`;
      } else if (featuredSlide) {
        if (featuredSlide.quote) {
          displayHeading = `“${featuredSlide.quote}”`;
          displaySub = featuredSlide.attribution ? `${featuredSlide.attribution} · From "${topic}"` : `From "${topic}"`;
        } else if (featuredSlide.body) {
          displayHeading = featuredSlide.title;
          displaySub = featuredSlide.body;
        } else if (featuredSlide.bullets && featuredSlide.bullets.length > 0) {
          displayHeading = featuredSlide.title;
          displaySub = featuredSlide.bullets.slice(0, 2).join(" • ");
        } else {
          displayHeading = featuredSlide.title;
          displaySub = `From "${topic}"`;
        }
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "55px 65px",
            backgroundColor: bgColor,
            color: "#FFFFFF",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Subtle decorative border */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              right: "20px",
              bottom: "20px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "28px",
              pointerEvents: "none",
            }}
          />

          {/* Header pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "rgba(255, 255, 255, 0.08)",
                padding: "10px 20px",
                borderRadius: "999px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <span style={{ fontSize: "20px" }}>🎤</span>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: accentColor,
                }}
              >
                The Podium · Fey
              </span>
            </div>

            <div
              style={{
                fontSize: "14px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.7)",
                fontWeight: 700,
                background: "rgba(255, 255, 255, 0.06)",
                padding: "8px 16px",
                borderRadius: "999px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {countBadge}
            </div>
          </div>

          {/* Main content body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              zIndex: 2,
              maxWidth: "1050px",
            }}
          >
            <div
              style={{
                fontSize:
                  displayHeading.length > 70
                    ? "40px"
                    : displayHeading.length > 40
                    ? "50px"
                    : "62px",
                fontWeight: 900,
                lineHeight: 1.15,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
              }}
            >
              {displayHeading.startsWith("“") ? displayHeading : `“${displayHeading}”`}
            </div>

            {displaySub && (
              <div
                style={{
                  fontSize: "23px",
                  color: "rgba(255, 255, 255, 0.8)",
                  lineHeight: 1.4,
                  fontWeight: 400,
                  maxWidth: "960px",
                }}
              >
                {displaySub}
              </div>
            )}
          </div>

          {/* Footer info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 2,
              paddingTop: "22px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: accentColor,
                  color: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "17px",
                }}
              >
                {author.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: "17px", color: "#FFFFFF", fontWeight: 600 }}>
                Presented by {author}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px",
                color: accentColor,
                fontWeight: 700,
              }}
            >
              <span>fey.lokinlabs.com.ng</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate OG image: ${e.message}`, { status: 500 });
  }
}
