/**
 * Mathletics Proof Card Generator
 *
 * Renders an authentic Bookish Print Editorial broadside onto an HTML5 Canvas (1200x630)
 * matching Fey's classical identity (Forest Olive, Terracotta Burgundy, Antique Gold,
 * Warm Parchment Canvas, and Editorial Serif typography).
 */

export interface MathleticsCardData {
  score: number;
  total: number;
  pct: number;
  gradeLabel: string;
  author: string;
  xpEarned?: number;
  date?: string;
  agilityScore?: number;
  theme?: "parchment" | "dark";
}

export async function generateMathleticsCardCanvas(
  data: MathleticsCardData
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D context");

  const isParchment = (data.theme || "parchment") === "parchment";

  const c = isParchment
    ? {
        bgStart: "#F7F2E9",
        bgMid: "#F4EFE6",
        bgEnd: "#EDE5D8",
        outerBorder: "#444E2C", // Forest Olive
        innerBorder: "rgba(166, 124, 30, 0.45)", // Antique Gold
        cornerAccent: "#A67C1E",
        headerBrand: "#444E2C",
        headerDate: "#6E7260",
        headline: "#1E2211",
        subtitle: "#525645",
        panelBg: "#FDFCFA",
        panelBorder: "rgba(68, 78, 44, 0.22)",
        scoreNumber: "#7A1C2E", // Wine Red hero score
        scoreTotal: "#7D8171",
        gradeBg: "#7A1C2E",
        gradeText: "#FDFBF7",
        xpBg: "#EDE5D6",
        xpBorder: "#A67C1E",
        xpText: "#8C6512",
        watermark: "rgba(68, 78, 44, 0.05)",
        footerMotto: "#7D8171",
      }
    : {
        bgStart: "#1E2211",
        bgMid: "#16190D",
        bgEnd: "#11130A",
        outerBorder: "#A67C1E",
        innerBorder: "rgba(166, 124, 30, 0.35)",
        cornerAccent: "#C99A2C",
        headerBrand: "#F4EFE6",
        headerDate: "#9B9E8D",
        headline: "#FDFCFA",
        subtitle: "#B5B8A8",
        panelBg: "#222714",
        panelBorder: "rgba(166, 124, 30, 0.3)",
        scoreNumber: "#D94E64",
        scoreTotal: "#9B9E8D",
        gradeBg: "#7A1C2E",
        gradeText: "#FDFCFA",
        xpBg: "rgba(166, 124, 30, 0.2)",
        xpBorder: "#A67C1E",
        xpText: "#E0B348",
        watermark: "rgba(255, 255, 255, 0.03)",
        footerMotto: "#9B9E8D",
      };

  // 1. Background Fill
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
  bgGrad.addColorStop(0, c.bgStart);
  bgGrad.addColorStop(0.5, c.bgMid);
  bgGrad.addColorStop(1, c.bgEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 630);

  // 2. Borders & Corner Accents
  ctx.strokeStyle = c.outerBorder;
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 1136, 566);

  ctx.strokeStyle = c.innerBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(42, 42, 1116, 546);

  // Corner ornaments
  const corners = [
    [42, 42],
    [1158, 42],
    [42, 588],
    [1158, 588],
  ];
  ctx.fillStyle = c.cornerAccent;
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Header Masthead
  ctx.font = "bold 20px 'Cinzel', serif, Georgia";
  ctx.fillStyle = c.headerBrand;
  ctx.letterSpacing = "4px";
  ctx.fillText("FEY · MATHLETICS ARENA", 70, 85);
  ctx.letterSpacing = "0px";

  ctx.font = "14px 'Inter', sans-serif";
  ctx.fillStyle = c.headerDate;
  ctx.textAlign = "right";
  ctx.fillText(data.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), 1130, 85);
  ctx.textAlign = "left";

  // Dividing rule
  ctx.strokeStyle = c.innerBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(70, 105);
  ctx.lineTo(1130, 105);
  ctx.stroke();

  // 4. Headline & Author
  ctx.font = "bold 38px 'Cinzel', serif, Georgia";
  ctx.fillStyle = c.headline;
  ctx.fillText("Proof of Mathematical Agility", 70, 160);

  ctx.font = "18px 'Inter', sans-serif";
  ctx.fillStyle = c.subtitle;
  ctx.fillText(`Recorded by Scholar ${data.author || "You"} · 25-Second Mental Duel`, 70, 195);

  // 5. Left Hero Card: Score & Accuracy
  const panelX = 70;
  const panelY = 225;
  const panelW = 460;
  const panelH = 310;

  ctx.fillStyle = c.panelBg;
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = c.panelBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  // Big Score
  ctx.font = "bold 88px 'Cinzel', serif, Georgia";
  ctx.fillStyle = c.scoreNumber;
  ctx.fillText(`${data.score}`, panelX + 45, panelY + 120);

  const scoreW = ctx.measureText(`${data.score}`).width;
  ctx.font = "32px 'Cinzel', serif, Georgia";
  ctx.fillStyle = c.scoreTotal;
  ctx.fillText(`/${data.total}`, panelX + 45 + scoreW + 6, panelY + 115);

  // Accuracy Pill
  ctx.font = "bold 22px 'Inter', sans-serif";
  ctx.fillStyle = c.headline;
  ctx.fillText(`${data.pct}% Accuracy`, panelX + 45, panelY + 180);

  // Grade Title Pill
  const gradeText = data.gradeLabel || "Mathlete";
  ctx.font = "bold 15px 'Inter', sans-serif";
  const gradeTextW = ctx.measureText(gradeText).width;
  const gradePillW = gradeTextW + 36;
  const gradePillH = 36;

  ctx.fillStyle = c.gradeBg;
  ctx.fillRect(panelX + 45, panelY + 215, gradePillW, gradePillH);
  ctx.fillStyle = c.gradeText;
  ctx.fillText(gradeText, panelX + 63, panelY + 239);

  // 6. Right Panel: Intellectual Breakdown & Challenge Prompt
  const rightX = 560;
  const rightY = 225;
  const rightW = 570;
  const rightH = 310;

  ctx.fillStyle = c.panelBg;
  ctx.fillRect(rightX, rightY, rightW, rightH);
  ctx.strokeStyle = c.panelBorder;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(rightX, rightY, rightW, rightH);

  ctx.font = "bold 20px 'Cinzel', serif, Georgia";
  ctx.fillStyle = c.headline;
  ctx.fillText("Mental Prowess Assessment", rightX + 40, rightY + 50);

  // XP Earned Box
  if (data.xpEarned) {
    ctx.fillStyle = c.xpBg;
    ctx.strokeStyle = c.xpBorder;
    ctx.lineWidth = 1;
    ctx.fillRect(rightX + 40, rightY + 75, 220, 50);
    ctx.strokeRect(rightX + 40, rightY + 75, 220, 50);

    ctx.font = "bold 18px 'Inter', sans-serif";
    ctx.fillStyle = c.xpText;
    ctx.fillText(`+${data.xpEarned} Mathletics XP`, rightX + 60, rightY + 107);
  }

  // Agility score
  const agility = data.agilityScore || Math.round(data.pct * 8.5);
  ctx.font = "16px 'Inter', sans-serif";
  ctx.fillStyle = c.subtitle;
  ctx.fillText(`Mental Agility Rating: ${agility} pts`, rightX + 40, rightY + 160);

  // Provocation quote
  ctx.font = "italic 18px Georgia, serif";
  ctx.fillStyle = c.headline;
  ctx.fillText('"Mathematics is not about numbers, but about understanding."', rightX + 40, rightY + 210);

  ctx.font = "14px 'Inter', sans-serif";
  ctx.fillStyle = c.subtitle;
  ctx.fillText("Can you beat this score in 25 seconds per question?", rightX + 40, rightY + 245);

  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.fillStyle = c.outerBorder;
  ctx.fillText("fey.lokinlabs.com.ng/games/mathletics", rightX + 40, rightY + 275);

  // 7. Footer
  ctx.font = "13px 'Inter', sans-serif";
  ctx.fillStyle = c.footerMotto;
  ctx.fillText("FEY · THINK DEEPER, ARTICULATE CLEARLY", 70, 565);

  return canvas;
}
