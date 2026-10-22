import { ImageResponse } from "next/og";

export const alt = "Fey: A Daily Learning and Speaking Habit for Curious Minds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 604800; // Cache for 7 days

/** Default share card for every page that doesn't define its own OG image. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#F4EFE6",
          color: "#1E2211",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#444E2C" }}>Fey</div>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 5, textTransform: "uppercase", color: "#5C6A36" }}>
            Think Deeper. Articulate Clearly.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 66, fontWeight: 700, lineHeight: 1.08 }}>
            Learn something new every day.
          </div>
          <div style={{ display: "flex", fontSize: 66, fontWeight: 700, lineHeight: 1.08, color: "#7A1C2E" }}>
            Then say it out loud.
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, fontSize: 26, color: "#444E2C" }}>
          {["1 topic a day", "90-second explanation", "1,000+ topics", "Free"].map((t) => (
            <div
              key={t}
              style={{ display: "flex", padding: "10px 22px", border: "2px solid rgba(68,78,44,0.35)", borderRadius: 999 }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, immutable, no-transform, max-age=604800, s-maxage=604800",
      },
    },
  );
}
