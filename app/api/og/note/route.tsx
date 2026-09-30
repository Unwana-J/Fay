import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { decodeSharedNote } from "@/lib/share-note";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code") || "";
    const note = code ? decodeSharedNote(code) : null;

    const topicText = note?.topicText || searchParams.get("topic") || "Scholar Dispatch";
    const author = note?.author || searchParams.get("author") || "Scholar";
    const category = note?.category || searchParams.get("category") || "Philosophy";
    const rawNotes = note?.notes || searchParams.get("notes") || "Articulated using the Feynman Technique on Fey.";
    const cleanNotes = rawNotes
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const snippet = cleanNotes.length > 180 ? cleanNotes.slice(0, 180) + "…" : cleanNotes;

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
            backgroundColor: "#161D19",
            color: "#FFFFFF",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Subtle border */}
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

          {/* Header */}
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
              <span style={{ fontSize: "20px" }}>📜</span>
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#DDAA55",
                }}
              >
                Scholar Dispatch · Fey
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
              {category}
            </div>
          </div>

          {/* Topic & synthesis */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              zIndex: 2,
              maxWidth: "1020px",
            }}
          >
            <div
              style={{
                fontSize: topicText.length > 50 ? "46px" : "56px",
                fontWeight: 900,
                lineHeight: 1.15,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              &ldquo;{topicText}&rdquo;
            </div>

            {snippet && (
              <div
                style={{
                  fontSize: "24px",
                  color: "rgba(255, 255, 255, 0.78)",
                  lineHeight: 1.45,
                  fontWeight: 400,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{snippet}&rdquo;
              </div>
            )}
          </div>

          {/* Footer */}
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
            <div style={{ fontSize: "18px", color: "#FFFFFF", fontWeight: 600 }}>
              Articulated by <span style={{ color: "#DDAA55" }}>{author}</span> via Feynman Technique
            </div>

            <div
              style={{
                fontSize: "16px",
                color: "#DDAA55",
                fontWeight: 700,
              }}
            >
              fey.lokinlabs.com.ng
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
