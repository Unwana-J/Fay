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
    const bgColor = deck?.slides?.[0]?.bgColor || "#101D17";
    const accentColor = deck?.slides?.[0]?.accentColor || "#DDAA55";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 70px",
            backgroundColor: bgColor,
            color: "#FFFFFF",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Subtle decorative grid/border */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "24px",
              right: "24px",
              bottom: "24px",
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
                  fontSize: "16px",
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
                fontSize: "15px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 600,
              }}
            >
              {slideCount} Slides Deck
            </div>
          </div>

          {/* Main content body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              zIndex: 2,
              maxWidth: "1000px",
            }}
          >
            <div
              style={{
                fontSize: topic.length > 60 ? "46px" : topic.length > 35 ? "54px" : "64px",
                fontWeight: 900,
                lineHeight: 1.15,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
              }}
            >
              &ldquo;{topic}&rdquo;
            </div>

            {subtitle && (
              <div
                style={{
                  fontSize: "24px",
                  color: "rgba(255, 255, 255, 0.75)",
                  lineHeight: 1.4,
                  fontWeight: 400,
                }}
              >
                {subtitle}
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
              paddingTop: "24px",
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
                  fontSize: "18px",
                }}
              >
                {author.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontSize: "18px", color: "#FFFFFF", fontWeight: 600 }}>
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
