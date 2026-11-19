// Renders the 5-Film Fey Feature Spotlight Series (20s each, 16:9 + 9:16) to video/out/spotlights/
// Usage:
//   node video/scripts/render-spotlights.mjs                (renders all 5 spotlights in 16:9 + 9:16 + hero stills)
//   node video/scripts/render-spotlights.mjs --stills-only  (renders hero preview stills only)
//   node video/scripts/render-spotlights.mjs --only articulate,trivia
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "out", "spotlights");
const stillsDir = path.join(outDir, "stills");
fs.mkdirSync(stillsDir, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const CATALOG = [
  {
    key: "study",
    id16: "FeySpotStudy",
    id9: "FeySpotStudyVertical",
    file16: "01-fey-study-16x9.mp4",
    file9: "01-fey-study-9x16.mp4",
    stillFrame: 158,
  },
  {
    key: "articulate",
    id16: "FeySpotArticulate",
    id9: "FeySpotArticulateVertical",
    file16: "02-fey-articulate-16x9.mp4",
    file9: "02-fey-articulate-9x16.mp4",
    stillFrame: 458,
  },
  {
    key: "podium",
    id16: "FeySpotPodium",
    id9: "FeySpotPodiumVertical",
    file16: "03-fey-podium-16x9.mp4",
    file9: "03-fey-podium-9x16.mp4",
    stillFrame: 382,
  },
  {
    key: "trivia",
    id16: "FeySpotTrivia",
    id9: "FeySpotTriviaVertical",
    file16: "04-fey-trivia-league-16x9.mp4",
    file9: "04-fey-trivia-league-9x16.mp4",
    stillFrame: 318,
  },
  {
    key: "quant",
    id16: "FeySpotQuant",
    id9: "FeySpotQuantVertical",
    file16: "05-fey-quant-16x9.mp4",
    file9: "05-fey-quant-9x16.mp4",
    stillFrame: 472,
  },
];

const argv = process.argv.slice(2);
const stillsOnly = argv.includes("--stills-only");
const onlyIdx = argv.indexOf("--only");
const filterKeys =
  onlyIdx !== -1 && argv[onlyIdx + 1]
    ? new Set(argv[onlyIdx + 1].split(",").map((s) => s.trim().toLowerCase()))
    : null;

const selected = filterKeys ? CATALOG.filter((c) => filterKeys.has(c.key)) : CATALOG;

console.log("1. Bundling Fey Spotlight compositions...");
const serveUrl = await bundle({
  entryPoint: path.join(rootDir, "src", "index.ts"),
  publicDir: path.join(rootDir, "public"),
});

const compCache = new Map();
async function getComp(id) {
  if (!compCache.has(id)) {
    compCache.set(
      id,
      await selectComposition({
        serveUrl,
        id,
        browserExecutable: CHROME,
      })
    );
  }
  return compCache.get(id);
}

console.log("2. Rendering hero preview stills...");
for (const item of selected) {
  for (const [suffix, id] of [
    ["16x9", item.id16],
    ["9x16", item.id9],
  ]) {
    const comp = await getComp(id);
    const out = path.join(stillsDir, `${item.key}-${suffix}.png`);
    await renderStill({
      composition: comp,
      serveUrl,
      frame: item.stillFrame,
      output: out,
      imageFormat: "png",
      browserExecutable: CHROME,
    });
    console.log(`  ✓ stills/${item.key}-${suffix}.png`);
  }
}

if (!stillsOnly) {
  for (const item of selected) {
    for (const [id, file] of [
      [item.id16, item.file16],
      [item.id9, item.file9],
    ]) {
      const comp = await getComp(id);
      const outputLocation = path.join(outDir, file);
      let lastPct = -1;
      console.log(`3. Rendering ${file} (${comp.width}x${comp.height}, ${comp.durationInFrames}f)...`);
      await renderMedia({
        composition: comp,
        serveUrl,
        codec: "h264",
        audioCodec: "aac",
        crf: 18,
        pixelFormat: "yuv420p",
        outputLocation,
        browserExecutable: CHROME,
        concurrency: 4,
        onProgress: ({ progress }) => {
          const pct = Math.floor(progress * 4) * 25;
          if (pct !== lastPct && pct > 0) {
            lastPct = pct;
            console.log(`  [${file}] ${pct}%`);
          }
        },
      });
      const sizeMB = (fs.statSync(outputLocation).size / (1024 * 1024)).toFixed(2);
      console.log(`  ✓ Done: out/spotlights/${file} (${sizeMB} MB)`);
    }
  }
}

console.log("ALL SPOTLIGHTS COMPLETE.");
