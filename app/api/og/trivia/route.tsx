import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const challengeTitle = searchParams.get("challengeTitle") || searchParams.get("title");
    const difficulty = searchParams.get("difficulty") || "Mixed";
    const score = searchParams.get("score") || "0";
    const total = searchParams.get("total") || (challengeTitle ? "10" : "15");
    const pct = searchParams.get("pct") || String(Math.round((parseInt(score, 10) / parseInt(total, 10)) * 100) || 0);
    const by = searchParams.get("by") || "Scholar";
    const defaultGrade = challengeTitle
      ? `${difficulty.toUpperCase()} MODE`
      : parseInt(pct, 10) >= 80
      ? "Naija Expert! 🏆"
      : parseInt(pct, 10) >= 60
      ? "Sharp Sharp! 🎯"
      : parseInt(pct, 10) >= 40
      ? "Not bad o! 🙌"
      : "Keep Studying! 📚";
    const grade = searchParams.get("grade") || defaultGrade;
    const xp = searchParams.get("xp");
    const theme = searchParams.get("theme") || "parchment";
    const isParchment = theme === "parchment";

    // ── Editorial Color Palette ──
    const colors = isParchment
      ? {
          bg: "#F4EFE6",
          bgGradient: "radial-gradient(circle at 90% 10%, rgba(166, 124, 30, 0.08) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(122, 28, 46, 0.06) 0%, transparent 45%)",
          outerBorder: "#444E2C", // Forest Olive
          innerBorder: "rgba(166, 124, 30, 0.45)", // Antique Gold
          cornerPips: "#A67C1E",
          brandHeader: "#444E2C",
          brandSub: "#6E7260",
          headline: "#1E2211", // Deep forest black-brown
          subtitle: "#525645",
          bodyText: "#6E7260",
          cardBg: "#FDFCFA", // Warm Ivory Card
          cardBorder: "rgba(68, 78, 44, 0.22)",
          cardShadow: "0 10px 30px rgba(68, 78, 44, 0.08)",
          heroScore: "#7A1C2E", // Wine Red
          heroDenominator: "#7D8171",
          accuracyPillBg: "rgba(68, 78, 44, 0.08)",
          accuracyPillBorder: "rgba(68, 78, 44, 0.22)",
          accuracyPillText: "#333C1A",
          gradeBg: "#7A1C2E", // Burgundy
          gradeBorder: "#58101E",
          gradeText: "#FDFBF7",
          challengePillBg: "rgba(166, 124, 30, 0.12)",
          challengePillBorder: "rgba(166, 124, 30, 0.35)",
          challengePillText: "#8C6512",
          xpBg: "#EDE5D6",
          xpBorder: "#A67C1E",
          xpText: "#8C6512",
          footerBorder: "rgba(68, 78, 44, 0.25)",
          footerBrand: "#444E2C",
          footerUrl: "#7A1C2E",
        }
      : {
          bg: "#141712",
          bgGradient: "radial-gradient(circle at 85% 15%, rgba(166, 124, 30, 0.20) 0%, transparent 55%), radial-gradient(circle at 15% 85%, rgba(122, 28, 46, 0.18) 0%, transparent 50%)",
          outerBorder: "rgba(197, 160, 89, 0.65)",
          innerBorder: "rgba(122, 28, 46, 0.55)",
          cornerPips: "#D4AF37",
          brandHeader: "#D4AF37",
          brandSub: "#A5AA9B",
          headline: "#FDFBF7",
          subtitle: "#C8C4B7",
          bodyText: "rgba(253, 251, 247, 0.65)",
          cardBg: "rgba(25, 33, 26, 0.88)",
          cardBorder: "rgba(92, 106, 54, 0.55)",
          cardShadow: "0 20px 50px rgba(0,0,0,0.5)",
          heroScore: "#FDFBF7",
          heroDenominator: "rgba(253, 251, 247, 0.45)",
          accuracyPillBg: "rgba(197, 160, 89, 0.12)",
          accuracyPillBorder: "rgba(197, 160, 89, 0.35)",
          accuracyPillText: "#FFD166",
          gradeBg: "rgba(122, 28, 46, 0.45)",
          gradeBorder: "rgba(122, 28, 46, 0.9)",
          gradeText: "#FDFBF7",
          challengePillBg: "rgba(166, 124, 30, 0.2)",
          challengePillBorder: "rgba(166, 124, 30, 0.55)",
          challengePillText: "#FFD166",
          xpBg: "rgba(166, 124, 30, 0.2)",
          xpBorder: "rgba(166, 124, 30, 0.5)",
          xpText: "#FFD166",
          footerBorder: "rgba(166, 124, 30, 0.35)",
          footerBrand: "#A67C1E",
          footerUrl: "#FDFBF7",
        };

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "48px 56px",
            backgroundColor: colors.bg,
            backgroundImage: colors.bgGradient,
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Outer Framing Border */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              right: 24,
              bottom: 24,
              border: `2px solid ${colors.outerBorder}`,
              display: "flex",
            }}
          />
          {/* Inner Hairline Framing */}
          <div
            style={{
              position: "absolute",
              top: 32,
              left: 32,
              right: 32,
              bottom: 32,
              border: `1px solid ${colors.innerBorder}`,
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
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  backgroundColor: isParchment ? "rgba(68, 78, 44, 0.12)" : "rgba(122, 28, 46, 0.35)",
                  border: isParchment ? "1px solid rgba(68, 78, 44, 0.25)" : "1px solid rgba(122, 28, 46, 0.7)",
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
                    color: colors.brandHeader,
                    fontSize: "20px",
                    fontWeight: 900,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Fey Scholar Dispatch
                </span>
                <span
                  style={{
                    color: colors.brandSub,
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  Naija Trivia Arcade · Proof of Intellect
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: colors.challengePillBg,
                border: `1px solid ${colors.challengePillBorder}`,
                padding: "6px 16px",
                borderRadius: "20px",
              }}
            >
              <span style={{ fontSize: "12px", color: colors.challengePillText, fontWeight: 800, letterSpacing: "0.05em" }}>
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
              gap: "36px",
              margin: "16px 0",
              zIndex: 2,
            }}
          >
            {/* Left Column: Grade & Challenge Pitch */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "6px 18px",
                    borderRadius: "20px",
                    backgroundColor: colors.gradeBg,
                    border: `1px solid ${colors.gradeBorder}`,
                    color: colors.gradeText,
                    fontSize: "15px",
                    fontWeight: 800,
                    width: "fit-content",
                  }}
                >
                  {grade}
                </div>

                {xp && parseInt(xp, 10) > 0 && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      backgroundColor: colors.xpBg,
                      border: `1px solid ${colors.xpBorder}`,
                      color: colors.xpText,
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    ⚡ +{xp} XP Won
                  </div>
                )}
              </div>

              <h1
                style={{
                  fontSize: challengeTitle ? "40px" : "44px",
                  fontWeight: 900,
                  color: colors.headline,
                  lineHeight: 1.15,
                  margin: "0 0 10px 0",
                  letterSpacing: "-0.03em",
                  fontFamily: "Georgia, serif",
                }}
              >
                {challengeTitle ? challengeTitle : `${by} scored ${pct}% on Naija Trivia`}
              </h1>

              <p
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  fontStyle: "italic",
                  color: colors.subtitle,
                  margin: "0 0 10px 0",
                  lineHeight: 1.3,
                  fontFamily: "Georgia, serif",
                }}
              >
                {challengeTitle ? `Invitational Gauntlet · Hosted by Scholar ${by} 🇳🇬` : "Can you beat this? 🇳🇬"}
              </p>

              <p
                style={{
                  fontSize: "15px",
                  color: colors.bodyText,
                  margin: 0,
                  lineHeight: 1.45,
                }}
              >
                {challengeTitle
                  ? `Enter this custom gauntlet of ${total} curated questions. Compete against ${by} and claim the top ranking!`
                  : `Answer the exact same ${total} questions and see if you can top their score on Fey!`}
              </p>
            </div>

            {/* Right Column: Score Badge Card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.cardBg,
                border: `1.5px solid ${colors.cardBorder}`,
                borderRadius: "24px",
                padding: "28px 44px",
                minWidth: "290px",
                boxShadow: colors.cardShadow,
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: isParchment ? "#A67C1E" : "#D4AF37",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                {challengeTitle ? "★ Gauntlet Deck ★" : "★ Official Score ★"}
              </span>

              <div
                style={{
                  fontSize: challengeTitle ? "72px" : "82px",
                  fontWeight: 900,
                  color: colors.heroScore,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "baseline",
                }}
              >
                <span>{challengeTitle ? total : score}</span>
                <span
                  style={{
                    fontSize: challengeTitle ? "32px" : "40px",
                    color: colors.heroDenominator,
                    fontWeight: 700,
                    marginLeft: "6px",
                  }}
                >
                  {challengeTitle ? "Q's" : `/${total}`}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "5px 16px",
                  borderRadius: "16px",
                  backgroundColor: colors.accuracyPillBg,
                  border: `1px solid ${colors.accuracyPillBorder}`,
                  marginTop: "14px",
                }}
              >
                <span
                  style={{
                    color: colors.accuracyPillText,
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {challengeTitle
                    ? `${difficulty.toUpperCase()} · 24H CHALLENGE`
                    : `${pct}% ACCURACY · ${total} QUESTIONS`}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Academic Provenance Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              paddingTop: "16px",
              borderTop: `1px solid ${colors.footerBorder}`,
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  color: colors.footerBrand,
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                FEY · THINK DEEPER, ARTICULATE CLEARLY
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: colors.bodyText, fontSize: "12px" }}>Play at:</span>
              <span
                style={{
                  color: colors.footerUrl,
                  fontSize: "12px",
                  fontWeight: 800,
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
