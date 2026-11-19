// Fey app screenshot capture for the Beta motion video.
// Usage: node capture/capture.mjs [shotName ...]   (default: all shots)
// Requires the app running locally:  npm run build && npm start -- -p 3123
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/shots");
const BASE = process.env.FEY_URL || "http://localhost:3123";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Seeded demo scholar so onboarding never blocks a shot.
const SEED = {
  state: {
    isOnboarded: true,
    claimPromptDismissed: true,
    profile: {
      id: "demo-adaeze",
      username: "Adaeze",
      bio: "Building knowledge one topic at a time.",
      avatar: "/avatars/avatar-luminary.svg",
      xp: 2450,
      unlockedAchievements: [],
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 21,
      hasClaimedAccount: true,
    },
  },
  version: 11,
};

// Hide UI that shouldn't appear in marketing footage.
const HIDE_CSS = `
  div.fixed.bottom-5.right-5.z-40 { display: none !important; }
  nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display: none !important; }
  * { caret-color: transparent !important; }
`;

async function clickText(page, text, { selector = "button, a, [role=button], div, span, label" } = {}) {
  const ok = await page.evaluate(
    (text, selector) => {
      const els = [...document.querySelectorAll(selector)].filter((el) => {
        const t = (el.innerText || "").trim();
        if (!t || !t.includes(text)) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      // Prefer the smallest (most specific) matching element.
      els.sort((a, b) => a.innerText.length - b.innerText.length);
      const el = els[0];
      if (!el) return false;
      el.scrollIntoView({ block: "center" });
      el.click();
      return true;
    },
    text,
    selector
  );
  if (!ok) console.warn(`  ! could not find "${text}"`);
  return ok;
}

async function shot(page, name, opts = {}) {
  const file = path.join(OUT, `${name}.png`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(opts.settle ?? 600);
  await page.screenshot({ path: file, fullPage: !!opts.fullPage });
  console.log(`  ✓ ${path.relative(process.cwd(), file)}`);
}

async function go(page, route, wait = 2200) {
  await page.goto(BASE + route, { waitUntil: "networkidle2", timeout: 60000 });
  await page.addStyleTag({ content: HIDE_CSS });
  await sleep(wait);
}

const SHOTS = {
  async dashboard(page) {
    await go(page, "/");
    await shot(page, "dashboard");
  },
  async discover(page) {
    await go(page, "/discover");
    await shot(page, "discover");
  },
  async games(page) {
    await go(page, "/games");
    await shot(page, "games");
  },
  async articulate(page) {
    await go(page, "/play");
    await clickText(page, "Skip Guide", { selector: "button" });
    await sleep(900);
    await shot(page, "articulate-lobby");
  },
  async feynmansprint(page) {
    await go(page, "/");
    await clickText(page, "Impromptu (90s)", { selector: "button" });
    await sleep(2500);
    await page.addStyleTag({ content: HIDE_CSS });
    await shot(page, "feynman-sprint");
  },
  async triviaquestion(page) {
    await go(page, "/games/trivia");
    await clickText(page, "Skip Guide", { selector: "button" });
    await sleep(800);
    await clickText(page, "Start Solo Quiz", { selector: "button" });
    await sleep(2200);
    await shot(page, "trivia-question", { settle: 300 });
  },
  async podium(page) {
    await go(page, "/podium");
    await shot(page, "podium-home");
  },
  async trivia(page) {
    await go(page, "/games/trivia");
    await clickText(page, "Skip Guide", { selector: "button" });
    await sleep(900);
    await shot(page, "trivia-home");
    await clickText(page, "Play Solo", { selector: "button" });
    await sleep(900);
    await shot(page, "trivia-solo-setup");
  },
  async mathletics(page) {
    await go(page, "/games/mathletics");
    await clickText(page, "Skip Guide", { selector: "button" });
    await sleep(500);
    await shot(page, "mathletics-home");
    await clickText(page, "Begin Sprint", { selector: "button" });
    await sleep(2500);
    await shot(page, "mathletics-question", { settle: 200 });
  },
  async podiumspin(page) {
    await go(page, "/podium");
    await clickText(page, "Skip Guide", { selector: "button" });
    await clickText(page, "Spin a Hot-Take Topic", { selector: "button" });
    await sleep(5000);
    await shot(page, "podium-spin");
  },
  async articulatelocal(page) {
    await go(page, "/play");
    await clickText(page, "Skip Guide", { selector: "button" });
    await clickText(page, "Pass-the-Phone", { selector: "button" });
    await sleep(1200);
    await shot(page, "articulate-local");
  },
  async constellation(page) {
    await go(page, "/constellation");
    await shot(page, "constellation");
  },
};

const wanted = process.argv.slice(2);
const names = wanted.length ? wanted : Object.keys(SHOTS);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  pipe: true,
  defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 },
  args: ["--hide-scrollbars", "--no-first-run", "--no-default-browser-check"],
});

try {
  for (const name of names) {
    const fn = SHOTS[name];
    if (!fn) {
      console.warn(`Unknown shot: ${name}`);
      continue;
    }
    console.log(`→ ${name}`);
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((seed) => {
      if (!localStorage.getItem("fey-app-store")) {
        localStorage.setItem("fey-app-store", JSON.stringify(seed));
      }
    }, SEED);
    try {
      await fn(page, { clickText, shot, go, sleep });
    } catch (e) {
      console.error(`  ✗ ${name}: ${e.message}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}

export { clickText };
