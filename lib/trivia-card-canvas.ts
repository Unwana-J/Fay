/**
 * Trivia Proof Card Generator
 *
 * Renders an editorial 1200x630 social card onto an HTML5 Canvas and exports
 * directly to clipboard or PNG download. Zero external dependencies.
 */

export interface TriviaCardData {
  score: number;
  total: number;
  pct: number;
  gradeLabel: string;
  author: string;
  xpEarned?: number;
  date?: string;
  categories?: { category: string; correct: number; total: number }[];
}

export async function generateTriviaCardCanvas(data: TriviaCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D context");

  // ── Background: Deep Editorial Charcoal with Green & Gold Glow ──
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
  bgGrad.addColorStop(0, "#0e1812");
  bgGrad.addColorStop(0.5, "#0b110e");
  bgGrad.addColorStop(1, "#070c09");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 630);

  // Subtle decorative radial glows
  const radGlow1 = ctx.createRadialGradient(1050, 120, 10, 1050, 120, 450);
  radGlow1.addColorStop(0, "rgba(0, 135, 81, 0.22)");
  radGlow1.addColorStop(1, "transparent");
  ctx.fillStyle = radGlow1;
  ctx.fillRect(0, 0, 1200, 630);

  const radGlow2 = ctx.createRadialGradient(150, 520, 10, 150, 520, 400);
  radGlow2.addColorStop(0, "rgba(166, 124, 30, 0.18)");
  radGlow2.addColorStop(1, "transparent");
  ctx.fillStyle = radGlow2;
  ctx.fillRect(0, 0, 1200, 630);

  // ── Outer Editorial Accent Border ──
  ctx.strokeStyle = "rgba(0, 135, 81, 0.4)"; // Nigerian green outer border
  ctx.lineWidth = 3;
  ctx.strokeRect(32, 32, 1136, 566);

  ctx.strokeStyle = "rgba(166, 124, 30, 0.4)"; // Gold inner border
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, 1120, 550);

  // ── Top Header Brand ──
  ctx.fillStyle = "#52B788"; // Sage Green
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillText("🇳🇬 FEY · NAIJA TRIVIA ARCADE", 72, 85);

  ctx.fillStyle = "#8E8B82"; // Muted text
  ctx.font = "12px 'Courier New', monospace";
  ctx.fillText(data.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), 960, 85);

  // ── Grade Badge Pill ──
  ctx.fillStyle = "rgba(0, 135, 81, 0.25)";
  ctx.fillRect(72, 115, 230, 34);
  ctx.strokeStyle = "rgba(0, 135, 81, 0.7)";
  ctx.lineWidth = 1;
  ctx.strokeRect(72, 115, 230, 34);

  ctx.fillStyle = "#FDFBF7";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText(data.gradeLabel, 88, 137);

  if (data.xpEarned && data.xpEarned > 0) {
    ctx.fillStyle = "rgba(166, 124, 30, 0.25)";
    ctx.fillRect(315, 115, 150, 34);
    ctx.strokeStyle = "rgba(166, 124, 30, 0.6)";
    ctx.strokeRect(315, 115, 150, 34);

    ctx.fillStyle = "#FFD166";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`⚡ +${data.xpEarned} XP EARNED`, 328, 137);
  }

  // ── Main Challenge Heading ──
  ctx.fillStyle = "#FDFBF7";
  ctx.font = "bold 44px Georgia, serif";
  ctx.fillText("Can you beat my score?", 72, 215);

  ctx.fillStyle = "rgba(253, 251, 247, 0.7)";
  ctx.font = "italic 20px Georgia, serif";
  ctx.fillText(`Challenged by Scholar ${data.author} in Nigerian history, pop culture & general knowledge.`, 72, 255);

  // ── Score Showcase Card Box ──
  ctx.fillStyle = "rgba(20, 32, 25, 0.7)";
  ctx.fillRect(72, 290, 520, 180);
  ctx.strokeStyle = "rgba(0, 135, 81, 0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(72, 290, 520, 180);

  // Giant Score
  ctx.fillStyle = "#FDFBF7";
  ctx.font = "bold 82px sans-serif";
  ctx.fillText(`${data.score}`, 105, 385);

  ctx.fillStyle = "rgba(253, 251, 247, 0.4)";
  ctx.font = "bold 42px sans-serif";
  ctx.fillText(`/${data.total}`, 105 + ctx.measureText(`${data.score}`).width + 8, 385);

  // Subtitle stats in card
  ctx.fillStyle = "#52B788";
  ctx.font = "bold 18px monospace";
  ctx.fillText(`${data.pct}% ACCURACY · 15 SEC ROUNDS`, 105, 435);

  // ── Category Breakdown Right Panel (if available) ──
  if (data.categories && data.categories.length > 0) {
    ctx.fillStyle = "rgba(166, 124, 30, 0.08)";
    ctx.fillRect(620, 290, 490, 180);
    ctx.strokeStyle = "rgba(166, 124, 30, 0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(620, 290, 490, 180);

    ctx.fillStyle = "#FFD166";
    ctx.font = "bold 11px monospace";
    ctx.fillText("CATEGORY PERFORMANCE", 645, 320);

    let catY = 355;
    for (const cat of data.categories.slice(0, 3)) {
      ctx.fillStyle = "#FDFBF7";
      ctx.font = "14px sans-serif";
      ctx.fillText(cat.category, 645, catY);

      ctx.fillStyle = "rgba(253, 251, 247, 0.6)";
      ctx.font = "bold 13px monospace";
      ctx.fillText(`${cat.correct}/${cat.total}`, 1040, catY);

      // Mini bar background
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillRect(645, catY + 8, 430, 4);

      // Mini bar progress
      const p = cat.total > 0 ? (cat.correct / cat.total) : 0;
      ctx.fillStyle = "#008751";
      ctx.fillRect(645, catY + 8, Math.round(430 * p), 4);

      catY += 38;
    }
  }

  // ── Divider Bar ──
  ctx.fillStyle = "rgba(0, 135, 81, 0.4)";
  ctx.fillRect(72, 510, 1056, 1);

  // ── Footer ──
  ctx.fillStyle = "#FDFBF7";
  ctx.font = "bold 14px 'Courier New', monospace";
  ctx.fillText("FEY ACADEMIC ARCHIVE · THINK DEEPER, ARTICULATE CLEARLY", 72, 545);

  ctx.fillStyle = "#FFD166";
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillText("PLAY AT: fey.lokinlabs.com.ng/games/trivia", 740, 545);

  return canvas;
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

export async function downloadTriviaCard(data: TriviaCardData, filename = "fey-trivia-score.png") {
  const canvas = await generateTriviaCardCanvas(data);
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
