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

    const highlight = (searchParams.get("highlight") || searchParams.get("q") || "").trim();
    const snippet = highlight || (cleanNotes.length > 180 ? cleanNotes.slice(0, 180) + "…" : cleanNotes);
    const isHighlight = Boolean(highlight);

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
              top: "20px",
              left: "20px",
              right: "20px",
              bottom: "20px",
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
                  fontSize: "15px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#DDAA55",
                }}
              >
                {isHighlight ? "Featured Quote · Fey" : "Scholar Dispatch · Fey"}
              </span>
            </div>

            <div
              style={{
                fontSize: "14px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.7)",
                fontWeight: 600,
                background: "rgba(255, 255, 255, 0.06)",
                padding: "8px 16px",
                borderRadius: "999px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
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
              maxWidth: "1050px",
            }}
          >
            {isHighlight ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: snippet.length > 100 ? "34px" : snippet.length > 50 ? "42px" : "50px",
                    fontWeight: 800,
                    lineHeight: 1.25,
                    color: "#FFFFFF",
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{snippet}&rdquo;
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    color: "#DDAA55",
                    fontWeight: 600,
                  }}
                >
                  From synthesis on &ldquo;{topicText}&rdquo;
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
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
            )}
          </div>

          {/* Footer */}
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
            <div style={{ fontSize: "17px", color: "#FFFFFF", fontWeight: 600 }}>
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
