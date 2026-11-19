import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "out");
const stillsDir = path.join(outDir, "stills");
fs.mkdirSync(stillsDir, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const onlyTeasers = process.argv.includes("--teasers");

const POLISHED_STILLS = onlyTeasers
  ? [
      { id: "FeyTeaser", frame: 45, name: "t01-soft-hook.png" },
      { id: "FeyTeaser", frame: 275, name: "t02-soft-showcase.png" },
      { id: "FeyTeaser", frame: 410, name: "t03-soft-end.png" },
      { id: "FeyTeaserVertical", frame: 275, name: "t04-soft-vert-showcase.png" },
    ]
  : [
      { id: "FeyBeta", frame: 705, name: "s01-study-read.png" },
      { id: "FeyBeta", frame: 810, name: "s02-study-cue.png" },
      { id: "FeyBeta", frame: 910, name: "s03-study-speak.png" },
      { id: "FeyBeta", frame: 1005, name: "s04-study-recall.png" },
      { id: "FeyBeta", frame: 1072, name: "s05-bridge-parlor.png" },
      { id: "FeyBetaVertical", frame: 810, name: "s06-vert-study-cue.png" },
      { id: "FeyTeaserVertical", frame: 275, name: "t04-soft-vert-showcase.png" },
    ];

const VIDEOS = onlyTeasers
  ? [
      { id: "FeyTeaser", file: "fey-teaser-15s-16x9.mp4" },
      { id: "FeyTeaserVertical", file: "fey-teaser-15s-9x16.mp4" },
    ]
  : [
      { id: "FeyTeaser", file: "fey-teaser-15s-16x9.mp4" },
      { id: "FeyTeaserVertical", file: "fey-teaser-15s-9x16.mp4" },
      { id: "FeyBeta", file: "fey-beta-16x9.mp4" },
      { id: "FeyBetaVertical", file: "fey-beta-9x16.mp4" },
    ];

console.log("1. Bundling Remotion project...");
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

console.log("2. Rendering preview stills...");
for (const item of POLISHED_STILLS) {
  const composition = await getComp(item.id);
  await renderStill({
    composition,
    serveUrl,
    frame: item.frame,
    output: path.join(stillsDir, item.name),
    imageFormat: "png",
    browserExecutable: CHROME,
  });
  console.log(`  ✓ ${item.name}`);
}

for (const v of VIDEOS) {
  const composition = await getComp(v.id);
  const outputLocation = path.join(outDir, v.file);
  let lastLogged = -1;
  console.log(`3. Rendering ${v.file} (${composition.width}x${composition.height}, ${composition.durationInFrames}f @ ${composition.fps}fps)...`);
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    audioCodec: "aac",
    crf: 18,
    pixelFormat: "yuv420p",
    outputLocation,
    browserExecutable: CHROME,
    concurrency: 4,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10) * 10;
      if (pct !== lastLogged && pct % 20 === 0) {
        lastLogged = pct;
        console.log(`  [${v.file}] ${pct}%`);
      }
    },
  });
  const sizeMB = (fs.statSync(outputLocation).size / (1024 * 1024)).toFixed(2);
  console.log(`  ✓ Done: out/${v.file} (${sizeMB} MB)`);
}
console.log("ALL 4 RENDERS COMPLETE.");
