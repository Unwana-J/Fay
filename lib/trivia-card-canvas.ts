/**
 * Trivia Proof Card Generator
 *
 * Renders an authentic Bookish Print Editorial broadside onto an HTML5 Canvas (1200x630)
 * matching Fey's classical identity (Forest Olive, Terracotta Burgundy, Antique Gold,
 * Warm Parchment Canvas, and Editorial Serif typography).
 */

export type TriviaCardTheme = "parchment" | "dark";

export interface TriviaCardData {
  score: number;
  total: number;
  pct: number;
  gradeLabel: string;
  author: string;
  xpEarned?: number;
  date?: string;
  categories?: { category: string; correct: number; total: number }[];
  theme?: TriviaCardTheme;
}

export async function generateTriviaCardCanvas(data: TriviaCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D context");

  const theme = data.theme || "parchment";
  const isParchment = theme === "parchment";

  // ── Palette Definition ──
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
        headline: "#1E2211", // Deep forest black-brown
        subtitle: "#525645",
        panelBg: "#FDFCFA", // Warm Ivory card
        panelBorder: "rgba(68, 78, 44, 0.22)",
        panelShadow: "rgba(68, 78, 44, 0.06)",
        badgeTop: "#A67C1E",
        scoreNumber: "#7A1C2E", // Wine Red hero score
        scoreTotal: "#7D8171",
        scorePillBg: "rgba(68, 78, 44, 0.08)",
        scorePillBorder: "rgba(68, 78, 44, 0.2)",
        scorePillText: "#333C1A",
        gradeBg: "#7A1C2E", // Burgundy
        gradeBorder: "#58101E",
        gradeText: "#FDFBF7",
        xpBg: "#EDE5D6",
        xpBorder: "#A67C1E",
        xpText: "#8C6512",
        catText: "#1E2211",
        catRatio: "#525645",
        catTrack: "#E8E2D4",
        divider: "rgba(68, 78, 44, 0.35)",
        footerBrand: "#333C1A",
        footerUrl: "#7A1C2E",
      }
    : {
        bgStart: "#151B16",
        bgMid: "#111612",
        bgEnd: "#0D110E",
        outerBorder: "rgba(197, 160, 89, 0.65)", // Antique Gold leaf
        innerBorder: "rgba(122, 28, 46, 0.55)", // Burgundy
        cornerAccent: "#D4AF37",
        headerBrand: "#D4AF37",
        headerDate: "#9A9E92",
        headline: "#FDFBF7",
        subtitle: "#C5C2B6",
        panelBg: "rgba(25, 33, 26, 0.85)",
        panelBorder: "rgba(92, 106, 54, 0.45)",
        panelShadow: "rgba(0, 0, 0, 0.4)",
        badgeTop: "#D4AF37",
        scoreNumber: "#FDFBF7",
        scoreTotal: "#8E9484",
        scorePillBg: "rgba(197, 160, 89, 0.12)",
        scorePillBorder: "rgba(197, 160, 89, 0.35)",
        scorePillText: "#FFD166",
        gradeBg: "rgba(122, 28, 46, 0.45)",
        gradeBorder: "rgba(122, 28, 46, 0.9)",
        gradeText: "#FDFBF7",
        xpBg: "rgba(197, 160, 89, 0.2)",
        xpBorder: "rgba(197, 160, 89, 0.65)",
        xpText: "#FFD166",
        catText: "#FDFBF7",
        catRatio: "#A5AA9B",
        catTrack: "rgba(255, 255, 255, 0.09)",
        divider: "rgba(197, 160, 89, 0.35)",
        footerBrand: "#D4AF37",
        footerUrl: "#FDFBF7",
      };

  // ── Background Canvas ──
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
  bgGrad.addColorStop(0, c.bgStart);
  bgGrad.addColorStop(0.5, c.bgMid);
  bgGrad.addColorStop(1, c.bgEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 630);

  // Soft Radial Warmth Vignette
  const vignette = ctx.createRadialGradient(600, 315, 180, 600, 315, 660);
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, isParchment ? "rgba(68, 78, 44, 0.08)" : "rgba(0, 0, 0, 0.5)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 1200, 630);

  // ── Ornate Double Hairline Framing ──
  // Outer frame
  ctx.strokeStyle = c.outerBorder;
  ctx.lineWidth = isParchment ? 2.5 : 2;
  ctx.strokeRect(32, 32, 1136, 566);

  // Inner hairline frame
  ctx.strokeStyle = c.innerBorder;
  ctx.lineWidth = 1;
  ctx.strokeRect(42, 42, 1116, 546);

  // 4 Corner Diamond Accent Flourishes
  const corners = [
    [32, 32],
    [1168, 32],
    [32, 598],
    [1168, 598],
  ];
  ctx.fillStyle = c.cornerAccent;
  for (const [cx, cy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx + 6, cy);
    ctx.lineTo(cx, cy + 6);
    ctx.lineTo(cx - 6, cy);
    ctx.closePath();
    ctx.fill();
  }

  // ── Top Header Brand ──
  ctx.fillStyle = c.headerBrand;
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("🇳🇬 FEY · SCHOLAR DISPATCH", 72, 85);

  ctx.fillStyle = c.headerDate;
  ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const displayDate =
    data.date ||
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  ctx.textAlign = "right";
  ctx.fillText(displayDate, 1128, 85);
  ctx.textAlign = "left";

  // ── Hero Badges (Grade & XP) ──
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const gradeTextWidth = ctx.measureText(data.gradeLabel).width;
  const gradePillWidth = Math.max(160, gradeTextWidth + 34);

  // Grade Badge
  ctx.fillStyle = c.gradeBg;
  drawRoundRect(ctx, 72, 112, gradePillWidth, 34, 17);
  ctx.fill();
  ctx.strokeStyle = c.gradeBorder;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = c.gradeText;
  ctx.fillText(data.gradeLabel, 88, 134);

  // XP Badge
  if (data.xpEarned && data.xpEarned > 0) {
    const xpStartX = 72 + gradePillWidth + 14;
    ctx.fillStyle = c.xpBg;
    drawRoundRect(ctx, xpStartX, 112, 150, 34, 17);
    ctx.fill();
    ctx.strokeStyle = c.xpBorder;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = c.xpText;
    ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
    ctx.fillText(`⚡ +${data.xpEarned} XP WON`, xpStartX + 16, 134);
  }

  // ── Grand Editorial Headline (Georgia Serif with Auto-Scale) ──
  ctx.fillStyle = c.headline;
  const headlineText = `${data.author} scored ${data.pct}% on Naija Trivia`;
  let headlineFontSize = 44;
  ctx.font = `bold ${headlineFontSize}px Georgia, 'Times New Roman', serif`;
  while (ctx.measureText(headlineText).width > 1056 && headlineFontSize > 28) {
    headlineFontSize -= 2;
    ctx.font = `bold ${headlineFontSize}px Georgia, 'Times New Roman', serif`;
  }
  ctx.fillText(headlineText, 72, 212);

  ctx.fillStyle = c.subtitle;
  ctx.font = "italic 20px Georgia, 'Times New Roman', serif";
  ctx.fillText("Can you beat this? 🇳🇬 Answer the exact same questions on Fey.", 72, 252);

  // ── Left Card: Score Showcase ──
  const panelY = 286;
  const panelH = 194;
  const leftPanelW = 515;

  ctx.fillStyle = c.panelBg;
  drawRoundRect(ctx, 72, panelY, leftPanelW, panelH, 18);
  ctx.fill();
  ctx.strokeStyle = c.panelBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Score Card Top Label
  ctx.fillStyle = c.badgeTop;
  ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
  ctx.fillText("★ OFFICIAL SCORE ★", 102, panelY + 32);

  // Giant Score Text with PRECISE Measurement
  const scoreStr = `${data.score}`;
  ctx.font = "bold 88px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const scoreWidth = ctx.measureText(scoreStr).width;

  ctx.fillStyle = c.scoreNumber;
  ctx.fillText(scoreStr, 102, panelY + 115);

  // Total Denominator offset cleanly
  ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = c.scoreTotal;
  ctx.fillText(`/${data.total}`, 102 + scoreWidth + 12, panelY + 115);

  // Accuracy Pill inside left card
  ctx.fillStyle = c.scorePillBg;
  drawRoundRect(ctx, 102, panelY + 140, 310, 32, 16);
  ctx.fill();
  ctx.strokeStyle = c.scorePillBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = c.scorePillText;
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
  ctx.fillText(`${data.pct}% ACCURACY · ${data.total} QUESTIONS`, 120, panelY + 161);

  // ── Right Card: Discipline Breakdown ──
  const rightPanelX = 612;
  const rightPanelW = 515;

  ctx.fillStyle = c.panelBg;
  drawRoundRect(ctx, rightPanelX, panelY, rightPanelW, panelH, 18);
  ctx.fill();
  ctx.strokeStyle = c.panelBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = c.badgeTop;
  ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
  ctx.fillText("DISCIPLINE PERFORMANCE", rightPanelX + 30, panelY + 32);

  if (data.categories && data.categories.length > 0) {
    let catY = panelY + 68;
    const catFills: Record<string, string> = isParchment
      ? {
          History: "#7A1C2E", // Wine Red
          "Pop Culture": "#7B3FC8", // Royal Purple
          "General Knowledge": "#444E2C", // Forest Olive
        }
      : {
          History: "#A83246",
          "Pop Culture": "#9D4EDD",
          "General Knowledge": "#5C6A36",
        };

    const catIcons: Record<string, string> = {
      History: "🏛️",
      "Pop Culture": "🎵",
      "General Knowledge": "🌍",
    };

    for (const cat of data.categories.slice(0, 3)) {
      ctx.fillStyle = c.catText;
      ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      const icon = catIcons[cat.category] || "•";
      ctx.fillText(`${icon} ${cat.category}`, rightPanelX + 30, catY);

      ctx.fillStyle = c.catRatio;
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
      ctx.fillText(`${cat.correct}/${cat.total}`, rightPanelX + rightPanelW - 70, catY);

      // Track
      ctx.fillStyle = c.catTrack;
      drawRoundRect(ctx, rightPanelX + 30, catY + 8, rightPanelW - 60, 6, 3);
      ctx.fill();

      // Progress
      const p = cat.total > 0 ? cat.correct / cat.total : 0;
      if (p > 0) {
        ctx.fillStyle = catFills[cat.category] || (isParchment ? "#444E2C" : "#5C6A36");
        drawRoundRect(ctx, rightPanelX + 30, catY + 8, Math.round((rightPanelW - 60) * p), 6, 3);
        ctx.fill();
      }

      catY += 40;
    }
  } else {
    // Fallback scholarly motto & seal
    ctx.fillStyle = c.catText;
    ctx.font = "italic 16px Georgia, 'Times New Roman', serif";
    ctx.fillText("“Docendo discimus — By teaching, we learn.”", rightPanelX + 30, panelY + 80);
    ctx.fillStyle = c.subtitle;
    ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("Mastered through high-conviction cognitive recall.", rightPanelX + 30, panelY + 110);
    ctx.fillText("Fey Scholar Archive · Proof of Articulation.", rightPanelX + 30, panelY + 135);
  }

  // ── Divider Bar (Editorial Hairline with Diamond) ──
  ctx.fillStyle = c.divider;
  ctx.fillRect(72, 514, 1056, 1);

  // Center diamond flourish on divider
  ctx.fillStyle = c.cornerAccent;
  ctx.beginPath();
  ctx.moveTo(600, 510);
  ctx.lineTo(605, 514);
  ctx.lineTo(600, 518);
  ctx.lineTo(595, 514);
  ctx.closePath();
  ctx.fill();

  // ── Footer ──
  ctx.fillStyle = c.footerBrand;
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
  ctx.fillText("FEY · THINK DEEPER, ARTICULATE CLEARLY", 72, 548);

  ctx.fillStyle = c.footerUrl;
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
  ctx.textAlign = "right";
  ctx.fillText("PLAY AT: fey.lokinlabs.com.ng/games/trivia", 1128, 548);
  ctx.textAlign = "left";

  return canvas;
}

/**
 * Helper to draw crisp rounded rectangles on Canvas
 */
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

export async function copyTriviaCardToClipboard(data: TriviaCardData): Promise<boolean> {
  try {
    const canvas = await generateTriviaCardCanvas(data);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return false;

    if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to copy trivia card to clipboard:", err);
    return false;
  }
}

export async function downloadTriviaCard(data: TriviaCardData, filename = "fey-trivia-broadside.png") {
  const canvas = await generateTriviaCardCanvas(data);
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
