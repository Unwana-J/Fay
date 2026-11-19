// Fey Branded Social Card Generator (LinkedIn 4:5, WhatsApp Status 9:16, Landscape 16:9, Square 1:1)
//
// Usage examples:
//   node video/scripts/make-card.mjs --preset starter-pack
//   node video/scripts/make-card.mjs --batch path/to/cards.json
//   node video/scripts/make-card.mjs \
//     --template broadside \
//     --format linkedin,status \
//     --tag "THINKING & LEARNING" \
//     --headline "Feeling informed isn't the same as *knowing.*" \
//     --body "Try explaining one thing you read this week out loud." \
//     --out my-card
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "out", "cards");
fs.mkdirSync(outDir, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const FORMAT_MAP = {
  linkedin: "FeyCardLinkedin", // 1200x1500 (4:5 LinkedIn & IG portrait)
  portrait: "FeyCardLinkedin",
  status: "FeyCardStatus", // 1080x1920 (9:16 WhatsApp Status, IG Stories, TikTok)
  vertical: "FeyCardStatus",
  landscape: "FeyCardLandscape", // 1600x900 (16:9 X/Twitter, LinkedIn wide)
  square: "FeyCardSquare", // 1080x1080 (1:1 universal)
};

// Built-in starter pack (intentionally fresh from the 65s January Launch Film!)
const PRESETS = {
  "starter-pack": [
    {
      name: "w1-mon-say-it-out-loud",
      formats: ["linkedin", "status"],
      props: {
        template: "broadside",
        tag: "THINKING & WORK",
        headline: "The fastest way to find a hole in your thinking is to *say it out loud.*",
        body: "In your head, every argument sounds airtight. The second you try to explain a work pitch, a book, or a new concept without notes, the real gaps show up.",
        showBeta: true,
      },
    },
    {
      name: "w1-fri-quant-triangles",
      formats: ["linkedin", "status"],
      props: {
        template: "puzzle",
        tag: "MATHLETICS · QUANTITATIVE REASONING",
        headline: "Think your *Primary 5* brain is still sharp?",
        timerLabel: "25s · No calculator",
        samples: ["[5, 3 → 16]", "[7, 4 → 33]"],
        prompt: "[6, 2 → ?]",
        options: ["28", "32", "24", "34"],
        body: "Drop your answer (and the rule) in the comments.",
        footerNote: "Play live · fey.lokinlabs.com.ng",
        showBeta: true,
      },
    },
    {
      name: "w2-mon-feynman-principle",
      formats: ["linkedin", "status"],
      props: {
        template: "chalkboard",
        tag: "RICHARD FEYNMAN · 1974",
        headline: "“The first principle is that you must not *fool yourself* — and you are the easiest person to fool.”",
        attribution: "Richard Feynman · Caltech Address",
        body: "Skimming feels like learning. Explaining simply in your own words is the only honest test.",
        showBeta: true,
      },
    },
    {
      name: "w2-wed-streaks-lesson",
      formats: ["linkedin", "status"],
      props: {
        template: "lesson",
        tag: "BUILDING IN PUBLIC · #01",
        headline: "Why punishing broken streaks makes people *quit.*",
        body: "Most learning apps treat missing one busy Tuesday like a failure. You lose a 14-day streak, feel defeated, and quietly stop opening the app.",
        callout: "On Fey, Scholar's Seals protect your streak automatically when life gets loud — because consistency beats guilt.",
        showBeta: true,
      },
    },
  ],
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

let jobs = [];

if (args.preset) {
  const preset = PRESETS[args.preset];
  if (!preset) {
    console.error(`Unknown preset "${args.preset}". Available: ${Object.keys(PRESETS).join(", ")}`);
    process.exit(1);
  }
  jobs = preset;
} else if (args.batch) {
  const raw = fs.readFileSync(path.resolve(process.cwd(), args.batch), "utf8");
  const parsed = JSON.parse(raw);
  jobs = Array.isArray(parsed) ? parsed : [parsed];
} else if (args.headline) {
  const formats = String(args.format || "linkedin")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const props = {
    template: args.template || "broadside",
    tag: args.tag || undefined,
    headline: String(args.headline).replace(/\\n/g, "\n"),
    body: args.body ? String(args.body).replace(/\\n/g, "\n") : undefined,
    attribution: args.attribution || undefined,
    callout: args.callout || undefined,
    prompt: args.prompt || undefined,
    timerLabel: args.timer || undefined,
    footerNote: args.footer || undefined,
    showBeta: args.beta === undefined ? true : args.beta !== "false",
  };

  if (args.samples) {
    props.samples = String(args.samples).split("|").map((s) => s.trim());
  }
  if (args.options) {
    props.options = String(args.options).split("|").map((s) => s.trim());
  }
  if (args.items) {
    // Format: "1,000:posts read.|240:bookmarks saved.|40:tabs still open."
    props.items = String(args.items)
      .split("|")
      .map((pair) => {
        const idx = pair.indexOf(":");
        if (idx === -1) return { num: "•", label: pair.trim() };
        return { num: pair.slice(0, idx).trim(), label: pair.slice(idx + 1).trim() };
      });
  }

  jobs = [
    {
      name: args.out || `card-${Date.now()}`,
      formats,
      props,
    },
  ];
} else {
  console.log(`Fey Social Card Generator
Usage:
  node video/scripts/make-card.mjs --preset starter-pack
  node video/scripts/make-card.mjs --batch cards.json
  node video/scripts/make-card.mjs --template broadside --format linkedin,status --tag "..." --headline "..." --body "..." --out name

Templates: broadside | chalkboard | puzzle | receipt | lesson
Formats:   linkedin (1200x1500) | status (1080x1920) | landscape (1600x900) | square (1080x1080)`);
  process.exit(0);
}

console.log("Bundling Fey card templates...");
const serveUrl = await bundle({
  entryPoint: path.join(rootDir, "src", "index.ts"),
  publicDir: path.join(rootDir, "public"),
});

for (const job of jobs) {
  const formats = job.formats && job.formats.length ? job.formats : ["linkedin"];
  for (const fmt of formats) {
    const compId = FORMAT_MAP[fmt];
    if (!compId) {
      console.warn(`  ! Unknown format "${fmt}", skipping.`);
      continue;
    }
    const composition = await selectComposition({
      serveUrl,
      id: compId,
      inputProps: job.props,
      browserExecutable: CHROME,
    });
    const suffix = formats.length > 1 ? `-${fmt}` : "";
    const fileName = `${job.name}${suffix}.png`;
    const output = path.join(outDir, fileName);
    await renderStill({
      composition,
      serveUrl,
      output,
      inputProps: job.props,
      imageFormat: "png",
      browserExecutable: CHROME,
    });
    console.log(`  ✓ video/out/cards/${fileName} (${composition.width}x${composition.height})`);
  }
}
console.log("Done.");
