/**
 * Feynman Proof Card Generator
 *
 * Renders an editorial 1200x630 social card onto an HTML5 Canvas and exports
 * directly to clipboard or PNG download. Zero external dependencies.
 */

export interface FeynmanCardData {
  topicText: string;
  category: string;
  difficulty: string;
  author: string;
  notesSnippet: string;
  speakingSeconds?: number;
  xpEarned?: number;
  date?: string;
}

export async function generateFeynmanCardCanvas(data: FeynmanCardData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not initialize 2D context");

  // ── Background: Deep Editorial Charcoal with Warm Vignette ──
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
  bgGrad.addColorStop(0, "#15171e");
  bgGrad.addColorStop(0.5, "#101217");
  bgGrad.addColorStop(1, "#0a0c0f");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 630);

  // ── Outer Editorial Accent Border ──
  ctx.strokeStyle = "rgba(166, 124, 30, 0.4)"; // Gold border
  ctx.lineWidth = 3;
  ctx.strokeRect(32, 32, 1136, 566);

  ctx.strokeStyle = "rgba(122, 28, 46, 0.5)"; // Terracotta inner border
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, 1120, 550);

  // ── Top Header Brand ──
  ctx.fillStyle = "#A67C1E"; // Gold
  ctx.font = "bold 13px 'Courier New', monospace";
  ctx.fillText("FEY · PROOF OF INTELLECT", 72, 85);

  ctx.fillStyle = "#8E8B82"; // Muted text
  ctx.font = "12px 'Courier New', monospace";
  ctx.fillText(data.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), 960, 85);

  // ── Category & Difficulty Pill ──
  ctx.fillStyle = "rgba(122, 28, 46, 0.35)"; // Terracotta pill
  ctx.fillRect(72, 115, 200, 32);
  ctx.strokeStyle = "rgba(122, 28, 46, 0.8)";
  ctx.lineWidth = 1;
  ctx.strokeRect(72, 115, 200, 32);

  ctx.fillStyle = "#FDFBF7";
  ctx.font = "bold 12px sans-serif";
  ctx.fillText(`${data.category.toUpperCase()} · ${data.difficulty.toUpperCase()}`, 88, 136);

  if (data.speakingSeconds && data.speakingSeconds > 0) {
    ctx.fillStyle = "rgba(166, 124, 30, 0.25)";
    ctx.fillRect(285, 115, 210, 32);
    ctx.strokeStyle = "rgba(166, 124, 30, 0.6)";
    ctx.strokeRect(285, 115, 210, 32);

    ctx.fillStyle = "#FFD166";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`🎙️ ${data.speakingSeconds}s VOCAL SYNTHESIS`, 298, 136);
  }

  // ── Main Topic Heading (Wrapped) ──
  ctx.fillStyle = "#FDFBF7";
  ctx.font = "bold 38px Georgia, serif";
  const maxWidth = 1040;
  const words = data.topicText.split(" ");
  let line = "";
  let y = 205;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), 72, y);
      line = words[n] + " ";
      y += 48;
      if (y > 270) {
        line += "…";
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), 72, y);

  // ── Divider Bar ──
  ctx.fillStyle = "rgba(166, 124, 30, 0.5)";
  ctx.fillRect(72, y + 25, 90, 4);

  // ── Quote / Synthesis Excerpt Box ──
  const quoteY = y + 55;
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.fillRect(72, quoteY, 1056, 130);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1;
  ctx.strokeRect(72, quoteY, 1056, 130);

  // Clean and trim notes
  const cleanSnippet = data.notesSnippet
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const quoteText = cleanSnippet.length > 200 ? cleanSnippet.slice(0, 197) + "…" : cleanSnippet;

  ctx.fillStyle = "#D6D3CD";
  ctx.font = "italic 18px Georgia, serif";
  const quoteWords = quoteText.split(" ");
  let qLine = "";
  let qY = quoteY + 38;

  for (let n = 0; n < quoteWords.length; n++) {
    const testLine = qLine + quoteWords[n] + " ";
    if (ctx.measureText(testLine).width > 1000 && n > 0) {
      ctx.fillText(qLine.trim(), 96, qY);
      qLine = quoteWords[n] + " ";
      qY += 28;
      if (qY > quoteY + 95) {
        qLine += "…";
        break;
      }
    } else {
      qLine = testLine;
    }
  }
  ctx.fillText(`“${qLine.trim()}”`, 96, qY);

  // ── Footer: Scholar Attribution & Colophon ──
  const footerY = 540;
  ctx.fillStyle = "#A67C1E";
  ctx.font = "bold 15px Georgia, serif";
  ctx.fillText(`Synthesized by Scholar ${data.author || "Scholar"}`, 72, footerY);

  ctx.fillStyle = "#7D7A73";
  ctx.font = "12px 'Courier New', monospace";
  ctx.fillText("VERIFIED VIA THE FEYNMAN ARTICULATION METHOD", 72, footerY + 22);

  ctx.fillStyle = "#FFD166";
  ctx.font = "bold 14px 'Courier New', monospace";
  ctx.fillText("fey.lokinlabs.com.ng", 920, footerY + 10);

  return canvas;
}

export async function copyFeynmanCardToClipboard(data: FeynmanCardData): Promise<boolean> {
  try {
    const canvas = await generateFeynmanCardCanvas(data);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, "image/png");
    });
  } catch (err) {
    console.error("Failed to copy card image to clipboard:", err);
    return false;
  }
}

export async function downloadFeynmanCard(data: FeynmanCardData): Promise<void> {
  const canvas = await generateFeynmanCardCanvas(data);
  const link = document.createElement("a");
  link.download = `fey-proof-${(data.topicText || "sprint").slice(0, 30).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
