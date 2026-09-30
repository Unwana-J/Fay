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
            backgroundColor: "#0B110E",
            backgroundImage: "radial-gradient(circle at 85% 15%, rgba(0, 135, 81, 0.22) 0%, transparent 55%), radial-gradient(circle at 15% 85%, rgba(166, 124, 30, 0.18) 0%, transparent 50%)",
            border: "12px solid #142019",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Subtle inner framing border */}
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 18,
              right: 18,
              bottom: 18,
              border: "1px solid rgba(0, 135, 81, 0.35)",
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(0, 135, 81, 0.25)",
                  border: "1px solid rgba(0, 135, 81, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                🇳🇬
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    color: "#FDFBF7",
                    fontSize: "20px",
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Fey Trivia Arcade
                </span>
                <span
                  style={{
                    color: "rgba(253, 251, 247, 0.55)",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  Think Deeper · Test Your Knowledge
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(166, 124, 30, 0.18)",
                border: "1px solid rgba(166, 124, 30, 0.45)",
                padding: "6px 14px",
                borderRadius: "20px",
              }}
            >
              <span style={{ fontSize: "12px", color: "#FFD166", fontWeight: 700, letterSpacing: "0.05em" }}>
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
                  padding: "6px 16px",
                  borderRadius: "24px",
                  backgroundColor: "rgba(0, 135, 81, 0.2)",
                  border: "1px solid rgba(0, 135, 81, 0.5)",
                  color: "#52B788",
                  fontSize: "16px",
                  fontWeight: 800,
                  marginBottom: "14px",
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
                  margin: "0 0 12px 0",
                  letterSpacing: "-0.03em",
                }}
              >
                Can you beat my score?
              </h1>

              <p
                style={{
                  fontSize: "18px",
                  color: "rgba(253, 251, 247, 0.7)",
                  margin: 0,
                  lineHeight: 1.45,
                }}
              >
                Challenged by <span style={{ color: "#FFD166", fontWeight: 700 }}>Scholar {by}</span> in Naija Trivia. Tap the link to test your wits in Nigerian history, music & culture!
              </p>
            </div>

            {/* Right Column: Score Badge Card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(20, 32, 25, 0.85)",
                border: "2px solid rgba(0, 135, 81, 0.5)",
                borderRadius: "28px",
                padding: "32px 48px",
                minWidth: "300px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  fontSize: "82px",
                  fontWeight: 900,
                  color: "#FDFBF7",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "baseline",
                }}
              >
                <span>{score}</span>
                <span style={{ fontSize: "40px", color: "rgba(253, 251, 247, 0.4)", fontWeight: 700, marginLeft: "4px" }}>
                  /{total}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "12px",
                  color: "#52B788",
                  fontSize: "18px",
                  fontWeight: 800,
                }}
              >
                <span>{pct}% Accuracy</span>
                {xp ? <span style={{ color: "#FFD166" }}>· +{xp} XP</span> : null}
              </div>
            </div>
          </div>

          {/* Footer Callout */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              paddingTop: "20px",
              borderTop: "1px solid rgba(253, 251, 247, 0.12)",
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "16px", color: "#FDFBF7", fontWeight: 700 }}>
                🇳🇬 1,000+ Curated Questions · Free on Fey
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#008751",
                color: "#FFFFFF",
                padding: "10px 22px",
                borderRadius: "14px",
                fontSize: "14px",
                fontWeight: 800,
                letterSpacing: "0.02em",
              }}
            >
              <span>Accept Challenge →</span>
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
    return new Response(`Failed to generate trivia image: ${e.message}`, {
      status: 500,
    });
  }
}
