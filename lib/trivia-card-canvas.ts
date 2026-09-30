/**
 * Trivia Proof Card Generator
 *
 * Renders an editorial 1200x630 broadside social card onto an HTML5 Canvas and exports
 * directly to clipboard or PNG download. Matches Fey's signature Bookish Print Editorial
 * design system (Forest Olive, Terracotta Burgundy, Antique Gold, Sage, Warm Ivory).
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

  // ── Background: Deep Editorial Forest Charcoal with Warm Gold & Wine Vignette ──
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
  bgGrad.addColorStop(0, "#151814");
  bgGrad.addColorStop(0.5, "#111410");
  bgGrad.addColorStop(1, "#0D0F0C");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 630);

  // Warm Antique Gold radial glow (top right)
  const radGlow1 = ctx.createRadialGradient(1060, 100, 20, 1060, 100, 480);
  radGlow1.addColorStop(0, "rgba(166, 124, 30, 0.16)");
  radGlow1.addColorStop(1, "transparent");
  ctx.fillStyle = radGlow1;
  ctx.fillRect(0, 0, 1200, 630);

  // Terracotta Wine radial glow (bottom left)
  const radGlow2 = ctx.createRadialGradient(140, 530, 20, 140, 530, 440);
  radGlow2.addColorStop(0, "rgba(122, 28, 46, 0.14)");
  radGlow2.addColorStop(1, "transparent");
  ctx.fillStyle = radGlow2;
  ctx.fillRect(0, 0, 1200, 630);

  // ── Outer & Inner Editorial Double Border (Fey Hallmark) ──
  // Outer frame: Antique Gold hairline
  ctx.strokeStyle = "rgba(166, 124, 30, 0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, 1136, 566);

  // Inner frame: Terracotta Wine hairline
  ctx.strokeStyle = "rgba(122, 28, 46, 0.55)";
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, 1120, 550);

  // Corner accent cornerstones
  ctx.fillStyle = "#A67C1E";
  ctx.fillRect(30, 30, 6, 6);
  ctx.fillRect(1164, 30, 6, 6);
  ctx.fillRect(30, 594, 6, 6);
  ctx.fillRect(1164, 594, 6, 6);

  // ── Top Header Brand ──
  ctx.fillStyle = "#A67C1E"; // Antique Bronze Gold
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("🇳🇬 FEY · NAIJA TRIVIA ARCADE", 72, 85);

  ctx.fillStyle = "#9E9A8E"; // Warm Muted Sage
  ctx.font = "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const displayDate =
    data.date ||
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  ctx.fillText(displayDate, 990, 85);

  // ── Grade Badge Pill (Terracotta Burgundy) ──
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const gradeTextWidth = ctx.measureText(data.gradeLabel).width;
  const gradePillWidth = Math.max(160, gradeTextWidth + 36);

  ctx.fillStyle = "rgba(122, 28, 46, 0.35)"; // Terracotta Burgundy fill
  ctx.fillRect(72, 114, gradePillWidth, 34);
  ctx.strokeStyle = "rgba(122, 28, 46, 0.85)";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(72, 114, gradePillWidth, 34);

  ctx.fillStyle = "#FDFBF7";
  ctx.fillText(data.gradeLabel, 88, 136);

  // ── XP Badge Pill (Bronze Gold) ──
  if (data.xpEarned && data.xpEarned > 0) {
    const xpStartX = 72 + gradePillWidth + 14;
    ctx.fillStyle = "rgba(166, 124, 30, 0.22)"; // Bronze Gold fill
    ctx.fillRect(xpStartX, 114, 150, 34);
    ctx.strokeStyle = "rgba(166, 124, 30, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(xpStartX, 114, 150, 34);

    ctx.fillStyle = "#FFD166";
    ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
    ctx.fillText(`⚡ +${data.xpEarned} XP EARNED`, xpStartX + 16, 136);
  }

  // ── Main Challenge Heading (Classical Serif Editorial) ──
  ctx.fillStyle = "#FDFBF7";
  ctx.font = "bold 44px Georgia, 'Times New Roman', serif";
  ctx.fillText(`${data.author} scored ${data.pct}% on Naija Trivia`, 72, 215);

  ctx.fillStyle = "#C8C4B7";
  ctx.font = "italic 20px Georgia, 'Times New Roman', serif";
  ctx.fillText("Can you beat this? 🇳🇬 Answer the exact same questions on Fey.", 72, 255);

  // ── Score Showcase Card Box (Forest Olive Surface) ──
  ctx.fillStyle = "rgba(25, 30, 23, 0.78)";
  ctx.fillRect(72, 290, 520, 182);
  ctx.strokeStyle = "rgba(92, 106, 54, 0.55)"; // Forest Olive border
  ctx.lineWidth = 1.5;
  ctx.strokeRect(72, 290, 520, 182);

  // Giant Score with Precise Measurement to Prevent ANY Overlapping
  const scoreStr = `${data.score}`;
  ctx.font = "bold 86px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const scoreWidth = ctx.measureText(scoreStr).width;

  ctx.fillStyle = "#FDFBF7";
  ctx.fillText(scoreStr, 105, 390);

  // Total denominator cleanly offset right after the score
  ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "rgba(253, 251, 247, 0.45)";
  ctx.fillText(`/${data.total}`, 105 + scoreWidth + 12, 390);

  // Subtitle stats in card
  ctx.fillStyle = "#A67C1E"; // Gold
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
  ctx.fillText(`${data.pct}% ACCURACY · ${data.total} QUESTIONS`, 105, 436);

  // ── Category Breakdown Right Panel ──
  if (data.categories && data.categories.length > 0) {
    ctx.fillStyle = "rgba(25, 30, 23, 0.65)";
    ctx.fillRect(620, 290, 490, 182);
    ctx.strokeStyle = "rgba(166, 124, 30, 0.35)"; // Gold border
    ctx.lineWidth = 1;
    ctx.strokeRect(620, 290, 490, 182);

    ctx.fillStyle = "#A67C1E";
    ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
    ctx.fillText("CATEGORY PERFORMANCE", 645, 320);

    let catY = 355;
    const catColors: Record<string, string> = {
      History: "#7A1C2E", // Terracotta Burgundy
      "Pop Culture": "#7B3FC8", // Purple Accent
      "General Knowledge": "#5C6A36", // Forest Olive
    };

    for (const cat of data.categories.slice(0, 3)) {
      ctx.fillStyle = "#FDFBF7";
      ctx.font = "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(cat.category, 645, catY);

      ctx.fillStyle = "rgba(253, 251, 247, 0.6)";
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
      ctx.fillText(`${cat.correct}/${cat.total}`, 1040, catY);

      // Mini bar background
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.fillRect(645, catY + 8, 430, 5);

      // Mini bar progress
      const p = cat.total > 0 ? cat.correct / cat.total : 0;
      ctx.fillStyle = catColors[cat.category] || "#5C6A36";
      ctx.fillRect(645, catY + 8, Math.round(430 * p), 5);

      catY += 38;
    }
  }

  // ── Divider Bar (Antique Gold Hairline) ──
  ctx.fillStyle = "rgba(166, 124, 30, 0.35)";
  ctx.fillRect(72, 510, 1056, 1);

  // ── Footer ──
  ctx.fillStyle = "#A67C1E"; // Antique Gold
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
  ctx.fillText("FEY · THINK DEEPER, ARTICULATE CLEARLY", 72, 545);

  ctx.fillStyle = "#FDFBF7";
  ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace";
  ctx.fillText("PLAY AT: fey.lokinlabs.com.ng/games/trivia", 750, 545);

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
