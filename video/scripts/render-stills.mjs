import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "out", "stills");
fs.mkdirSync(outDir, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const STILLS = [
  { id: "FeyBeta", frame: 55, name: "01-act1-hook.png" },
  { id: "FeyBeta", frame: 236, name: "02-act1-split.png" },
  { id: "FeyBeta", frame: 375, name: "03-act2-chalk.png" },
  { id: "FeyBeta", frame: 525, name: "04-act2-ritual.png" },
  { id: "FeyBeta", frame: 635, name: "05-act3-tiles.png" },
  { id: "FeyBeta", frame: 748, name: "06-act3-reveal.png" },
  { id: "FeyBeta", frame: 895, name: "07-act4-articulate.png" },
  { id: "FeyBeta", frame: 1070, name: "08-act4-podium.png" },
  { id: "FeyBeta", frame: 1215, name: "09-act4-trivia.png" },
  { id: "FeyBeta", frame: 1395, name: "10-act4-mathletics.png" },
  { id: "FeyBeta", frame: 1515, name: "11-act5-proof.png" },
  { id: "FeyBeta", frame: 1655, name: "12-act5-beta.png" },
  { id: "FeyBetaVertical", frame: 1215, name: "13-vert-trivia.png" },
  { id: "FeyBetaVertical", frame: 1655, name: "14-vert-beta.png" },
];

console.log("Bundling Remotion project...");
const serveUrl = await bundle({
  entryPoint: path.join(rootDir, "src", "index.ts"),
  publicDir: path.join(rootDir, "public"),
});

const compCache = new Map();
for (const item of STILLS) {
  if (!compCache.has(item.id)) {
    compCache.set(
      item.id,
      await selectComposition({
        serveUrl,
        id: item.id,
        browserExecutable: CHROME,
      })
    );
  }
  const composition = compCache.get(item.id);
  const output = path.join(outDir, item.name);
  await renderStill({
    composition,
    serveUrl,
    frame: item.frame,
    output,
    imageFormat: "png",
    browserExecutable: CHROME,
  });
  console.log(`  ✓ ${item.name} (${item.id} @ f${item.frame})`);
}
console.log("Done.");
