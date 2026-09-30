import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const score = searchParams.get("score") || "0";
    const total = searchParams.get("total") || "15";
    const pct = searchParams.get("pct") || String(Math.round((parseInt(score, 10) / parseInt(total, 10)) * 100) || 0);
    const by = searchParams.get("by") || "Scholar";
    const grade = searchParams.get("grade") || (parseInt(pct, 10) >= 80 ? "Naija Expert! 🏆" : parseInt(pct, 10) >= 60 ? "Sharp Sharp! 🎯" : parseInt(pct, 10) >= 40 ? "Not bad o! 🙌" : "Keep Studying! 📚");
    const xp = searchParams.get("xp");

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "54px 64px",
            backgroundColor: "#141712",
            backgroundImage: "radial-gradient(circle at 85% 15%, rgba(166, 124, 30, 0.20) 0%, transparent 55%), radial-gradient(circle at 15% 85%, rgba(122, 28, 46, 0.18) 0%, transparent 50%)",
            border: "12px solid #1C201A",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Subtle inner framing border - Antique Gold & Wine Red */}
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 18,
              right: 18,
              bottom: 18,
              border: "1px solid rgba(166, 124, 30, 0.45)",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              right: 24,
              bottom: 24,
              border: "1px solid rgba(122, 28, 46, 0.35)",
              display: "flex",
            }}
          />

          {/* Top Brand & Provenance Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(122, 28, 46, 0.35)",
                  border: "1px solid rgba(122, 28, 46, 0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                }}
              >
                🇳🇬
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    color: "#FDFBF7",
                    fontSize: "22px",
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Fey Trivia Arcade
                </span>
                <span
                  style={{
                    color: "#A67C1E",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  Think Deeper · Articulate Clearly
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(166, 124, 30, 0.2)",
                border: "1px solid rgba(166, 124, 30, 0.55)",
                padding: "8px 18px",
                borderRadius: "20px",
              }}
            >
              <span style={{ fontSize: "13px", color: "#FFD166", fontWeight: 800, letterSpacing: "0.05em" }}>
                ⚔️ SCHOLAR CHALLENGE
              </span>
            </div>
          </div>

          {/* Main Hero Score Centerpiece */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: "40px",
              margin: "20px 0",
              zIndex: 2,
            }}
          >
            {/* Left Column: Grade & Challenge Pitch */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 18px",
                  borderRadius: "24px",
                  backgroundColor: "rgba(122, 28, 46, 0.35)",
                  border: "1px solid rgba(122, 28, 46, 0.8)",
                  color: "#FDFBF7",
                  fontSize: "16px",
                  fontWeight: 800,
                  marginBottom: "16px",
                  width: "fit-content",
                }}
              >
                {grade}
              </div>

              <h1
                style={{
                  fontSize: "44px",
                  fontWeight: 900,
                  color: "#FDFBF7",
                  lineHeight: 1.15,
                  margin: "0 0 10px 0",
                  letterSpacing: "-0.03em",
                }}
              >
                {by} scored {pct}% on Naija Trivia
              </h1>

              <p
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  fontStyle: "italic",
                  color: "#C8C4B7",
                  margin: "0 0 10px 0",
                  lineHeight: 1.3,
                }}
              >
                Can you beat this? 🇳🇬
              </p>

              <p
                style={{
                  fontSize: "16px",
                  color: "rgba(253, 251, 247, 0.65)",
                  margin: 0,
                  lineHeight: 1.45,
                }}
              >
                Tap to answer the exact same questions and see if you can top their score on Fey!
              </p>
            </div>

            {/* Right Column: Score Badge Card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(25, 30, 23, 0.88)",
                border: "2px solid rgba(92, 106, 54, 0.55)",
                borderRadius: "28px",
                padding: "32px 48px",
                minWidth: "300px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  fontSize: "86px",
                  fontWeight: 900,
                  color: "#FDFBF7",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "baseline",
                }}
              >
                <span>{score}</span>
                <span style={{ fontSize: "42px", color: "rgba(253, 251, 247, 0.45)", fontWeight: 700, marginLeft: "8px" }}>
                  /{total}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "12px",
                }}
              >
                <span
                  style={{
                    color: "#A67C1E",
                    fontSize: "15px",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {pct}% Accuracy
                </span>
              </div>

              {xp && parseInt(xp, 10) > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "8px",
                    backgroundColor: "rgba(166, 124, 30, 0.2)",
                    border: "1px solid rgba(166, 124, 30, 0.5)",
                    padding: "4px 12px",
                    borderRadius: "12px",
                  }}
                >
                  <span style={{ color: "#FFD166", fontSize: "12px", fontWeight: 700 }}>
                    ⚡ +{xp} XP Earned
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Academic Provenance Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              paddingTop: "18px",
              borderTop: "1px solid rgba(166, 124, 30, 0.35)",
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  color: "#A67C1E",
                  fontSize: "13px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                FEY ACADEMIC ARCHIVE · PROOF OF INTELLECT
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "rgba(253, 251, 247, 0.5)", fontSize: "13px" }}>Play at:</span>
              <span
                style={{
                  color: "#FDFBF7",
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: "monospace",
                }}
              >
                fey.lokinlabs.com.ng/games/trivia
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal Error";
    console.error("OG trivia generation error:", message);
    return new Response("Failed to generate trivia OG image", { status: 500 });
  }
}
