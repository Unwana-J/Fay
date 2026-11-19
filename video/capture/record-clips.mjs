// Real browser screen recorder for Fey's 5 Feature Spotlights.
// Records authentic 30fps H.264 MP4 clips directly from the live production Next.js app
// with smooth cursor choreography, fake mic stream support, and exact beat markers.
//
// Usage:
//   node video/capture/record-clips.mjs                 (records all 5 clips)
//   node video/capture/record-clips.mjs study podium    (records selected clips)
//
// Requires the local production server running:
//   npm start -- -p 3123

import puppeteer from "puppeteer-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEO_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(VIDEO_ROOT, "..");
const OUT_DIR = path.join(VIDEO_ROOT, "public/clips");
const MARKERS_FILE = path.join(OUT_DIR, "markers.json");
const BASE = process.env.FEY_URL || "http://localhost:3123";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FFMPEG_DIR = path.join(VIDEO_ROOT, "node_modules/@remotion/compositor-darwin-arm64");
const FFMPEG_BIN = path.join(FFMPEG_DIR, "ffmpeg");

const FPS = 30;
const VIEWPORT = { width: 1280, height: 800, deviceScaleFactor: 1.5 }; // 1920x1200 Retina

fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Parse real Mathletics & Trivia answer keys from repo source so the demo player answers accurately on camera.
function loadQuestionAnswers(relFile) {
  const src = fs.readFileSync(path.join(REPO_ROOT, relFile), "utf8");
  const entries = [];
  const blockRx = /question:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?options:\s*\[([^\]]+)\]\s*,\s*answer:\s*(\d+)/g;
  let m;
  while ((m = blockRx.exec(src))) {
    const question = m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
    const opts = [...m[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) =>
      x[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim()
    );
    const ans = Number(m[3]);
    if (opts.length === 4 && !Number.isNaN(ans)) {
      entries.push({ question, options: opts, answer: ans });
    }
  }
  return entries;
}

const MATHLETICS_BANK = loadQuestionAnswers("lib/mathletics-questions.ts");
const TRIVIA_BANK = loadQuestionAnswers("lib/trivia-questions.ts");

function isoDateDaysAgo(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Clean scholarly profile seed (Adaeze)
const APP_SEED = {
  state: {
    isOnboarded: true,
    claimPromptDismissed: true,
    hasSeenArticulateGuide: true,
    hasSeenTriviaGuide: true,
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

// Hide non-marketing floating chrome + add subtle editorial cursor & compositor heartbeat
const INJECT_CSS = `
  div.fixed.bottom-5.right-5.z-40 { display: none !important; }
  nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display: none !important; }
  @keyframes __fey_hb { 0% { opacity: 0.01; } 50% { opacity: 0.02; } 100% { opacity: 0.01; } }
  #__fey_hb {
    position: fixed; bottom: 0; right: 0; width: 2px; height: 2px;
    background: #444E2C; pointer-events: none; z-index: 2147483640;
    animation: __fey_hb 0.5s linear infinite;
  }
  #__fey_cursor {
    position: fixed; left: 640px; top: 400px; width: 20px; height: 20px;
    margin-left: -10px; margin-top: -10px; border-radius: 999px;
    background: rgba(122, 28, 46, 0.16);
    border: 2.2px solid #7A1C2E;
    box-shadow: 0 4px 12px rgba(20, 26, 12, 0.22);
    pointer-events: none; z-index: 2147483647;
    transition: transform 0.11s ease, opacity 0.2s ease;
    opacity: 0;
  }
  #__fey_cursor::after {
    content: ""; position: absolute; left: 50%; top: 50%;
    width: 5px; height: 5px; margin: -2.5px 0 0 -2.5px;
    border-radius: 999px; background: #7A1C2E;
  }
  #__fey_cursor.down { transform: scale(0.76); background: rgba(122, 28, 46, 0.34); }
  .__fey_ripple {
    position: fixed; width: 18px; height: 18px; margin: -9px 0 0 -9px;
    border-radius: 999px; border: 2px solid #7A1C2E;
    pointer-events: none; z-index: 2147483646;
    animation: __fey_rip 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes __fey_rip {
    0% { transform: scale(0.8); opacity: 0.85; }
    100% { transform: scale(3.2); opacity: 0; }
  }
`;

async function injectOverlay(page) {
  await page.evaluate((css) => {
    if (!document.getElementById("__fey_rec_css")) {
      const style = document.createElement("style");
      style.id = "__fey_rec_css";
      style.textContent = css;
      document.head.appendChild(style);
    }
    if (!document.getElementById("__fey_hb")) {
      const hb = document.createElement("div");
      hb.id = "__fey_hb";
      document.body.appendChild(hb);
    }
    if (!document.getElementById("__fey_cursor")) {
      const cur = document.createElement("div");
      cur.id = "__fey_cursor";
      document.body.appendChild(cur);
    }
  }, INJECT_CSS);
}

// Smooth human-like pointer movement & click using our subtle editorial dot
const cursorPos = new WeakMap();

async function moveCursorTo(page, x, y, durationMs = 420) {
  const prev = cursorPos.get(page) || { x: 640, y: 400 };
  const steps = Math.max(8, Math.round(durationMs / 18));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const cx = prev.x + (x - prev.x) * ease;
    const cy = prev.y + (y - prev.y) * ease;
    await page.mouse.move(cx, cy);
    await page.evaluate(
      (px, py) => {
        const el = document.getElementById("__fey_cursor");
        if (el) {
          el.style.opacity = "1";
          el.style.left = `${px}px`;
          el.style.top = `${py}px`;
        }
      },
      cx,
      cy
    );
    await sleep(durationMs / steps);
  }
  cursorPos.set(page, { x, y });
}

async function clickPoint(page, x, y, { moveMs = 400, dwellBefore = 140, dwellAfter = 120 } = {}) {
  await injectOverlay(page);
  await moveCursorTo(page, x, y, moveMs);
  await sleep(dwellBefore);
  await page.evaluate(
    (px, py) => {
      const el = document.getElementById("__fey_cursor");
      if (el) el.classList.add("down");
      const rip = document.createElement("div");
      rip.className = "__fey_ripple";
      rip.style.left = `${px}px`;
      rip.style.top = `${py}px`;
      document.body.appendChild(rip);
      setTimeout(() => rip.remove(), 500);
    },
    x,
    y
  );
  await page.mouse.down();
  await sleep(65);
  await page.mouse.up();
  await page.evaluate(() => {
    const el = document.getElementById("__fey_cursor");
    if (el) el.classList.remove("down");
  });
  await sleep(dwellAfter);
}

async function findElementBoxByText(page, text, { selector = "button, a, [role=button]", exact = false } = {}) {
  return page.evaluate(
    (text, selector, exact) => {
      const els = [...document.querySelectorAll(selector)].filter((el) => {
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
        if (el.disabled) return false;
        const t = (el.innerText || "").replace(/\s+/g, " ").trim();
        if (!t) return false;
        const match = exact ? t.toLowerCase() === text.toLowerCase() : t.toLowerCase().includes(text.toLowerCase());
        if (!match) return false;
        const r = el.getBoundingClientRect();
        return r.width > 4 && r.height > 4;
      });
      els.sort((a, b) => (a.innerText || "").length - (b.innerText || "").length);
      const el = els[0];
      if (!el) return null;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, text: (el.innerText || "").trim() };
    },
    text,
    selector,
    exact
  );
}

async function clickByText(page, text, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 6000;
  const start = Date.now();
  let box = null;
  while (Date.now() - start < timeoutMs) {
    box = await findElementBoxByText(page, text, opts);
    if (box) break;
    await sleep(150);
  }
  if (!box) {
    console.warn(`  ! Could not find clickable text "${text}"`);
    return false;
  }
  // Wait briefly if scrollIntoView nudged layout
  await sleep(220);
  const refreshed = await findElementBoxByText(page, text, opts);
  const target = refreshed || box;
  await clickPoint(page, target.x, target.y, opts);
  return true;
}

async function hideCursor(page) {
  await page.evaluate(() => {
    const el = document.getElementById("__fey_cursor");
    if (el) el.style.opacity = "0";
  });
}

// Constant-FPS grid countFrames (exact Puppeteer v25 algorithm)
function countFrames(startTs, prevTs, ts, fps) {
  const end = Math.round((ts - startTs) * fps);
  const start = Math.round((prevTs - startTs) * fps);
  return Math.max(0, end - start);
}

// Direct CDP screencast -> Remotion bundled ffmpeg (H.264 yuv420p 30fps MP4)
async function startRecorder(page, outMp4Path) {
  const cdp = await page.createCDPSession();
  const width = Math.round(VIEWPORT.width * VIEWPORT.deviceScaleFactor);
  const height = Math.round(VIEWPORT.height * VIEWPORT.deviceScaleFactor);

  const ff = spawn(
    FFMPEG_BIN,
    [
      "-y",
      "-loglevel", "error",
      "-framerate", String(FPS),
      "-f", "image2pipe",
      "-vcodec", "png",
      "-i", "pipe:0",
      "-an",
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "16",
      "-pix_fmt", "yuv420p",
      "-vf", `scale=${width}:${height}:flags=lanczos`,
      "-movflags", "+faststart",
      outMp4Path,
    ],
    {
      cwd: FFMPEG_DIR,
      stdio: ["pipe", "ignore", "pipe"],
    }
  );

  let ffErr = "";
  ff.stdin.on("error", () => {});
  ff.stderr.on("data", (d) => {
    const s = d.toString();
    ffErr += s;
    if (s.trim()) console.error("  [ffmpeg]", s.trim());
  });

  let startTs = null;
  let prev = null; // { buffer, ts }
  let totalFrames = 0;
  let stopped = false;
  let writeChain = Promise.resolve();
  const wallStart = performance.now();
  const marks = {};

  function mark(label) {
    const t = Number(((performance.now() - wallStart) / 1000).toFixed(2));
    marks[label] = t;
    console.log(`    [${t.toFixed(2)}s] ${label}`);
    return t;
  }

  function queueFrames(buf, n) {
    if (n <= 0) return;
    totalFrames += n;
    writeChain = writeChain.then(async () => {
      for (let i = 0; i < n; i++) {
        if (ff.stdin.destroyed) return;
        const ok = ff.stdin.write(buf);
        if (!ok) {
          await new Promise((res) => ff.stdin.once("drain", res));
        }
      }
    });
  }

  cdp.on("Page.screencastFrame", (ev) => {
    void cdp.send("Page.screencastFrameAck", { sessionId: ev.sessionId }).catch(() => {});
    if (stopped || ev.metadata?.timestamp == null) return;
    const buf = Buffer.from(ev.data, "base64");
    const ts = ev.metadata.timestamp;
    if (prev) {
      if (startTs == null) startTs = prev.ts;
      const n = countFrames(startTs, prev.ts, ts, FPS);
      queueFrames(prev.buffer, n);
    }
    prev = { buffer: buf, ts, wallMs: performance.now() };
  });

  await cdp.send("Page.startScreencast", {
    format: "png",
    everyNthFrame: 1,
    maxWidth: width,
    maxHeight: height,
  });

  return {
    mark,
    async stop() {
      if (stopped) return;
      stopped = true;
      await cdp.send("Page.stopScreencast").catch(() => {});
      await cdp.detach().catch(() => {});
      if (prev) {
        const tailSec = Math.max(0.05, (performance.now() - prev.wallMs) / 1000);
        queueFrames(prev.buffer, Math.max(1, Math.round(tailSec * FPS)));
      }
      await writeChain;
      ff.stdin.end();
      await new Promise((resolve) => ff.once("close", resolve));
      if (ffErr.trim()) console.warn("  ffmpeg stderr:", ffErr.trim());
      const durationSec = Number((totalFrames / FPS).toFixed(2));
      const mb = (fs.statSync(outMp4Path).size / 1024 / 1024).toFixed(2);
      console.log(`  ✓ Saved ${path.relative(REPO_ROOT, outMp4Path)} (${durationSec}s · ${totalFrames}f · ${mb} MB)`);
      return { durationSec, totalFrames, width, height, marks };
    },
  };
}

// Click the right answer button on screen by matching rendered question + options against a question bank
async function clickCorrectOption(page, bank, { fallbackIndex = 0 } = {}) {
  const target = await page.evaluate((bankEntries, fallbackIdx) => {
    const clean = (s) =>
      (s || "")
        .replace(/^[A-D]\s+/i, "")
        .replace(/\$+/g, "")
        .replace(/\\text\{([^}]*)\}/g, "$1")
        .replace(/\\times/g, "x")
        .replace(/\\to/g, "->")
        .replace(/[₦,]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    // Find option buttons with A / B / C / D circle badges
    const buttons = [...document.querySelectorAll("button")].filter((btn) => {
      if (btn.disabled) return false;
      const r = btn.getBoundingClientRect();
      if (r.width < 120 || r.height < 36) return false;
      const firstBadge = btn.querySelector("span");
      const badgeTxt = (firstBadge?.innerText || "").trim();
      return ["A", "B", "C", "D"].includes(badgeTxt);
    });

    if (buttons.length < 4) return null;
    const group = buttons.slice(0, 4);
    const renderedTexts = group.map((b) => clean(b.innerText));
    const pageBody = clean(document.body.innerText);

    let bestScore = -1;
    let chosenIdx = fallbackIdx;
    for (const entry of bankEntries) {
      const bankOpts = entry.options.map((o) => clean(o));
      let optHits = 0;
      for (let i = 0; i < 4; i++) {
        if (renderedTexts[i] === bankOpts[i]) optHits += 2;
        else if (renderedTexts[i].includes(bankOpts[i]) || bankOpts[i].includes(renderedTexts[i])) optHits += 1;
      }
      if (optHits < 6) continue;
      // Bonus if question keywords appear on page
      const qWords = clean(entry.question).split(" ").filter((w) => w.length >= 4).slice(0, 8);
      let qHits = 0;
      for (const w of qWords) {
        if (pageBody.includes(w)) qHits++;
      }
      const totalScore = optHits * 10 + qHits;
      if (totalScore > bestScore) {
        bestScore = totalScore;
        chosenIdx = entry.answer;
      }
    }

    const btn = group[chosenIdx] || group[0];
    btn.scrollIntoView({ behavior: "smooth", block: "center" });
    const r = btn.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, chosenIdx, bestScore, label: btn.innerText.trim() };
  }, bank, fallbackIndex);

  if (!target) {
    console.warn("  ! Could not locate 4 option buttons");
    return false;
  }
  await sleep(160);
  await clickPoint(page, target.x, target.y, { moveMs: 420, dwellBefore: 160, dwellAfter: 120 });
  return true;
}

// =============================================================================
// 1. THE STUDY (/discover -> roulette spin -> /session/[id] research -> speak)
// =============================================================================
async function recordStudy(browser) {
  const page = await browser.newPage();

  // Serve an authentic, peer-reviewed ResearchPack matching ai-3 ("How do neural networks learn from data?")
  const CURATED_RESEARCH_PACK = {
    topicId: "ai-3",
    gist: "Neural networks learn by making a prediction, measuring how far off it is from the truth, and nudging millions of tiny connection weights backward so the error shrinks with each pass.",
    summary:
      "Rather than following hand-written rules, an artificial neural network learns patterns directly from labeled examples [S1]. During a forward pass, inputs travel through layers of weighted connections to produce a guess. A loss function measures the error between that guess and the target answer, and backpropagation computes how much each weight contributed to the mistake so gradient descent can nudge it in the right direction [S2]. Repeated over thousands of batches, early layers discover simple edges or phrases while deeper layers combine them into rich concepts [S1].",
    sections: [
      {
        heading: "Forward Pass & Prediction",
        body: "Each neuron computes a weighted sum of its inputs and passes the result through a non-linear activation function [S1]. Stacking layers allows the network to represent complex patterns that no single linear rule could separate.",
      },
      {
        heading: "Backpropagation & Gradient Descent",
        body: "When a guess misses the mark, backpropagation applies the chain rule in reverse—starting at the output error and assigning credit or blame to every weight [S2]. Gradient descent then adjusts each weight by a small step size [S3].",
      },
    ],
    sources: [
      {
        id: "S1",
        title: "Deep learning",
        url: "https://doi.org/10.1038/nature14539",
        publisher: "Nature · Europe PMC",
        authors: "LeCun, Bengio & Hinton",
        year: "2015",
        doi: "10.1038/nature14539",
      },
      {
        id: "S2",
        title: "Learning representations by back-propagating errors",
        url: "https://doi.org/10.1038/323533a0",
        publisher: "Nature · OpenAlex",
        authors: "Rumelhart, Hinton & Williams",
        year: "1986",
        doi: "10.1038/323533a0",
      },
      {
        id: "S3",
        title: "Artificial neural network",
        url: "https://en.wikipedia.org/wiki/Artificial_neural_network",
        publisher: "Wikipedia",
        year: "2026",
      },
    ],
    quiz: [
      {
        question: "What role does backpropagation play during neural network training?",
        options: [
          "It randomly deletes unused neurons",
          "It calculates how each weight contributed to the prediction error",
          "It downloads more labeled images from the internet",
          "It freezes all weights after the first forward pass",
        ],
        correctIndex: 1,
        explanation: "Backpropagation applies the chain rule backward from the loss so gradient descent knows how to adjust each weight.",
      },
    ],
    generatedAt: Date.now(),
    degraded: false,
  };

  await page.evaluateOnNewDocument((seed, pack) => {
    localStorage.setItem("fey-app-store", JSON.stringify(seed));
    // Serve authentic peer-reviewed ResearchPack for /api/ai/research cleanly without touching static assets
    const origFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input?.url || "";
      if (url.includes("/api/ai/research")) {
        let topicId = pack.topicId;
        try {
          const body = JSON.parse(init?.body || "{}");
          if (body.topicId) topicId = body.topicId;
        } catch {}
        return new Response(JSON.stringify({ ...pack, topicId }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return origFetch(input, init);
    };
    // Spin freely across all categories for 2.0s, then lock onto index 2 (ai-3: "How do neural networks learn from data?")
    const origRandom = Math.random;
    let spinStartedAt = 0;
    window.addEventListener(
      "click",
      (e) => {
        const txt = (e.target?.closest("button")?.innerText || "").toLowerCase();
        if (txt.includes("spin a topic")) {
          spinStartedAt = Date.now();
        }
      },
      true
    );
    Math.random = function () {
      if (spinStartedAt > 0) {
        const elapsed = Date.now() - spinStartedAt;
        if (elapsed >= 2000 && elapsed <= 3400) {
          return 2.3 / 698; // index 2 of TOPIC_BANK -> ai-3
        }
        if (elapsed > 3400) {
          spinStartedAt = 0;
        }
      }
      return origRandom.call(Math);
    };
  }, APP_SEED, CURATED_RESEARCH_PACK);

  await page.goto(`${BASE}/discover`, { waitUntil: "networkidle2", timeout: 60000 });
  await injectOverlay(page);
  await sleep(700);

  const rec = await startRecorder(page, path.join(OUT_DIR, "study.mp4"));
  rec.mark("discover_ready");
  await sleep(900);

  // 1. Spin the real in-app Discover topic roulette
  await clickByText(page, "Spin a Topic", { moveMs: 420 });
  rec.mark("spin_clicked");
  await sleep(2700); // Watch spinning dashed-gold butterfly + confirm modal appear
  rec.mark("topic_landed");
  await sleep(1100);

  // 2. Click "Begin Research" inside ConfirmModal -> navigates to /session/[id]
  await clickByText(page, "Begin Research", { moveMs: 380 });
  rec.mark("begin_research_clicked");

  // Wait for /session/[id] TipTap editor & ResearchReader to mount
  await page.waitForSelector(".ProseMirror", { timeout: 15000 }).catch(() => {});
  await injectOverlay(page);
  await sleep(1400);
  rec.mark("research_loaded");

  // Click Summary tab inside ResearchReader so cited passages & [S1]/[S2] badges shine
  await clickByText(page, "Summary", { exact: true, moveMs: 340 }).catch(() => {});
  await sleep(1100);
  rec.mark("summary_visible");

  // Click inside TipTap editor & write genuine 33-word Feynman note matching ai-3 (Neural Networks)
  const editorBox = await page.evaluate(() => {
    const el = document.querySelector(".ProseMirror");
    if (!el) return null;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const r = el.getBoundingClientRect();
    return { x: r.left + 80, y: r.top + 36 };
  });
  if (editorBox) {
    await clickPoint(page, editorBox.x, editorBox.y, { moveMs: 360 });
    rec.mark("typing_notes");
    await page.keyboard.type(
      "A neural network learns like tuning knobs on a radio: it makes a guess, measures how far off it was, and nudges each weight backward until errors shrink across thousands of examples.",
      { delay: 12 }
    );
  }
  await sleep(650);
  rec.mark("notes_ready");

  // 3. Click "I'm Ready to Speak" -> 3-2-1-Go countdown (~4.5s) -> live active mic waveform & timer ring
  await clickByText(page, "I'm Ready to Speak", { moveMs: 400 });
  rec.mark("speak_clicked");
  await hideCursor(page);
  await sleep(4800);
  rec.mark("mic_live");
  await sleep(4500);

  const meta = await rec.stop();
  await page.close();
  return meta;
}

// =============================================================================
// 2. FEY ARTICULATE — ONLINE ROOM (FRIENDS)
//    /play (Host an Online Match) -> /play/room/FEY-FRI8 (Lobby -> Live Cards -> Round Summary & Board)
// =============================================================================
async function recordArticulate(browser) {
  const page = await browser.newPage();

  const INITIAL_ONLINE_ROOM = {
    id: "room-fey-fri8",
    room_code: "FEY-FRI8",
    room_name: "Articulate & Chill",
    host_id: "demo-adaeze",
    host_name: "Adaeze",
    status: "lobby",
    locked: false,
    version: 1,
    settings: {
      timerSeconds: 45,
      scoreGoal: 20,
      categories: ["Object", "Nature", "Person", "Action", "World", "Random"],
      difficulty: "mixed",
      gameMode: "classic",
      buzzerSound: "classic",
      teamCount: 2,
    },
    teams: {
      teamA: { name: "Team Alpha", color: "#DC2626", score: 0, playerIds: ["demo-adaeze", "friend-tunde"] },
      teamB: { name: "Team Omega", color: "#2563EB", score: 0, playerIds: ["friend-chidi", "friend-kemi"] },
    },
    current_turn: null,
    deck: [
      { word: "Alarm Clock", category: "Object", difficulty: "easy" },
      { word: "Volcano", category: "Nature", difficulty: "easy" },
      { word: "Periscope", category: "Object", difficulty: "medium" },
      { word: "Compass", category: "Object", difficulty: "easy" },
      { word: "Waterfall", category: "Nature", difficulty: "easy" },
      { word: "Archipelago", category: "World", difficulty: "hard" },
      { word: "Telescope", category: "Object", difficulty: "medium" },
      { word: "Conductor", category: "Person", difficulty: "medium" },
      { word: "Sprinting", category: "Action", difficulty: "easy" },
    ],
    current_word_index: 0,
    round_words_scored: [],
    round_words_passed: [],
    active_players: ["demo-adaeze", "friend-tunde", "friend-chidi", "friend-kemi"],
    spectators: [],
    inactive_players: [],
    kicked_players: [],
    player_details: {
      "demo-adaeze": { id: "demo-adaeze", name: "Adaeze", avatar: "/avatars/avatar-luminary.svg", isHost: true, joinedAt: Date.now() - 40000 },
      "friend-tunde": { id: "friend-tunde", name: "Tunde", avatar: "/avatars/avatar-sage.svg", isHost: false, joinedAt: Date.now() - 32000 },
      "friend-chidi": { id: "friend-chidi", name: "Chidi", avatar: "/avatars/avatar-scholar.svg", isHost: false, joinedAt: Date.now() - 25000 },
      "friend-kemi": { id: "friend-kemi", name: "Kemi", avatar: "/avatars/avatar-oracle.svg", isHost: false, joinedAt: Date.now() - 18000 },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await page.evaluateOnNewDocument(
    (appSeed, initialRoom) => {
      localStorage.setItem("fey-app-store", JSON.stringify(appSeed));
      localStorage.setItem("fey_device_player_id", "demo-adaeze");
      localStorage.setItem("fey_player_name", "Adaeze");
      localStorage.removeItem("fey-multiplayer-game");

      const KEY = "__fey_online_room_demo_v1";
      const readRoom = () => {
        try {
          const raw = sessionStorage.getItem(KEY);
          if (raw) return JSON.parse(raw);
        } catch {}
        return JSON.parse(JSON.stringify(initialRoom));
      };
      const writeRoom = (r) => {
        r.updated_at = new Date().toISOString();
        sessionStorage.setItem(KEY, JSON.stringify(r));
        return r;
      };

      if (!sessionStorage.getItem(KEY)) {
        writeRoom(JSON.parse(JSON.stringify(initialRoom)));
      }

      // Allow our recorder to cleanly conclude the round right after the 4th card
      window.__feyFinishOnlineRound = () => {
        const r = readRoom();
        r.status = "round_end";
        r.version = (r.version || 1) + 1;
        writeRoom(r);
      };

      const origFetch = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const url = typeof input === "string" ? input : input?.url || "";
        const method = (init?.method || "GET").toUpperCase();

        // 1. Create Room (POST /api/articulate/room)
        if (url.includes("/api/articulate/room") && !url.includes("/action") && method === "POST") {
          const r = readRoom();
          try {
            const body = JSON.parse(init?.body || "{}");
            if (body.roomName) r.room_name = body.roomName;
            if (body.settings?.timerSeconds) r.settings.timerSeconds = body.settings.timerSeconds;
            if (body.settings?.scoreGoal) r.settings.scoreGoal = body.settings.scoreGoal;
          } catch {}
          writeRoom(r);
          return new Response(JSON.stringify({ room: r, serverTime: Date.now() }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // 2. Fetch Room State (GET /api/articulate/room?code=FEY-FRI8)
        if (url.includes("/api/articulate/room") && !url.includes("/action") && method === "GET") {
          const r = readRoom();
          const u = new URL(url, window.location.origin);
          const vParam = Number(u.searchParams.get("v") || "0");
          if (vParam && vParam === r.version) {
            return new Response(JSON.stringify({ unchanged: true, serverTime: Date.now() }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ room: r, serverTime: Date.now() }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        // 3. Room Actions (POST /api/articulate/room/FEY-FRI8/action)
        if (url.includes("/api/articulate/room/") && url.includes("/action") && method === "POST") {
          const r = readRoom();
          let payload = {};
          try {
            payload = JSON.parse(init?.body || "{}");
          } catch {}

          const act = payload.action;
          const now = Date.now();
          if (act === "join") {
            r.version = (r.version || 1) + 1;
          } else if (act === "start_round") {
            r.status = "playing";
            r.locked = true;
            r.match_started_at = r.match_started_at || new Date(now).toISOString();
            r.current_word_index = 0;
            r.round_words_scored = [];
            r.round_words_passed = [];
            r.current_turn = {
              roundNumber: 1,
              activeTeam: "A",
              speakerId: "demo-adaeze",
              speakerName: "Adaeze",
              startedAt: now,
              durationSeconds: r.settings.timerSeconds || 45,
              countdownEndsAt: now + 2600,
              turnEndsAt: now + 2600 + (r.settings.timerSeconds || 45) * 1000,
            };
            r.version = (r.version || 1) + 1;
          } else if (act === "score_word") {
            const w = r.deck[r.current_word_index];
            if (w) {
              r.round_words_scored = [...(r.round_words_scored || []), w];
              r.teams.teamA.score = (r.teams.teamA.score || 0) + 1;
              r.current_word_index = (r.current_word_index || 0) + 1;
            }
            r.version = (r.version || 1) + 1;
          } else if (act === "pass_word") {
            const w = r.deck[r.current_word_index];
            if (w) {
              r.round_words_passed = [...(r.round_words_passed || []), w];
              r.current_word_index = (r.current_word_index || 0) + 1;
            }
            r.version = (r.version || 1) + 1;
          } else if (act === "end_round") {
            r.status = "round_end";
            r.version = (r.version || 1) + 1;
          } else if (act === "switch_team") {
            r.version = (r.version || 1) + 1;
          }

          writeRoom(r);
          return new Response(JSON.stringify({ room: r, isSpectator: false, serverTime: Date.now() }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        return origFetch(input, init);
      };
    },
    APP_SEED,
    INITIAL_ONLINE_ROOM
  );

  await page.goto(`${BASE}/play`, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(600);
  // Dismiss first-time Online Room Guide modal cleanly BEFORE recording begins (persists hasSeenArticulateGuide)
  await page.keyboard.press("Escape");
  await sleep(500);
  await injectOverlay(page);
  await sleep(500);

  const rec = await startRecorder(page, path.join(OUT_DIR, "articulate.mp4"));
  rec.mark("online_setup_ready");
  await sleep(1100);

  // 1. On /play ("Online Room (Friends)" active by default): type Match Title & click Create Room & Invite Friends!
  const titleInput = await page.evaluate(() => {
    const el = document.querySelector('input[placeholder*="Friday Game Night"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + 90, y: r.top + r.height / 2 };
  });
  if (titleInput) {
    await clickPoint(page, titleInput.x, titleInput.y, { moveMs: 360 });
    await page.keyboard.type("Articulate & Chill", { delay: 24 });
    await sleep(300);
  }

  await clickByText(page, "Create Room & Invite Friends", { moveMs: 420 });
  rec.mark("room_created");

  // Wait for /play/room/FEY-FRI8 RoomLobby to mount
  await page.waitForFunction(
    () => document.body.innerText.includes("Multiplayer Room Lobby") || document.body.innerText.includes("Lock Room"),
    { timeout: 15000 }
  ).catch(() => {});
  await injectOverlay(page);
  await sleep(1400);
  rec.mark("lobby_visible");

  // Scroll smoothly down the lobby to showcase Team Alpha & Team Omega rosters + Start button
  await page.evaluate(() => window.scrollTo({ top: 320, behavior: "smooth" }));
  await sleep(1400);
  rec.mark("teams_visible");

  // 2. Click "Lock Room & Start Round 1" -> 3-2-1-GO synchronized countdown -> RoomSpeakerView!
  await clickByText(page, "Lock Room & Start Round 1", { moveMs: 420 });
  rec.mark("round_started");
  await sleep(3300); // Wait through 3-2-1-GO countdown
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await injectOverlay(page);
  await hideCursor(page);
  rec.mark("cards_live");
  await sleep(1150);

  // 3. Real online speaker turn: Got It! (+1) x2 -> Pass -> Got It! (+1) with floating +1 & confetti!
  await clickByText(page, "Got It!", { moveMs: 380 });
  rec.mark("word_1_got_it");
  await sleep(1050);

  await clickByText(page, "Got It!", { moveMs: 200 });
  rec.mark("word_2_got_it");
  await sleep(950);

  await clickByText(page, "Pass", { moveMs: 360 });
  rec.mark("word_3_passed");
  await sleep(950);

  await clickByText(page, "Got It!", { moveMs: 360 });
  rec.mark("word_4_got_it");
  await sleep(900);

  // 4. Conclude Round 1 cleanly -> RoomRoundEnd (Word Audit + Live Synchronized BoardMap!)
  await page.evaluate(() => window.__feyFinishOnlineRound?.());
  await page.waitForFunction(
    () => document.body.innerText.includes("Articulate Roadmap") || document.body.innerText.includes("Peek Track"),
    { timeout: 12000 }
  ).catch(() => {});
  await injectOverlay(page);
  await hideCursor(page);
  rec.mark("round_end_visible");
  await sleep(1300);

  // Scroll synchronously to Peek Track button so coordinates never drift mid-click
  const peekPt = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      (b.innerText || "").toLowerCase().includes("peek track")
    );
    if (!btn) return null;
    btn.scrollIntoView({ behavior: "instant", block: "center" });
    const r = btn.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await sleep(350);

  if (peekPt) {
    // Re-read exact box after layout settle
    const settledPt = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) =>
        (b.innerText || "").toLowerCase().includes("peek track")
      );
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    const pt = settledPt || peekPt;
    await clickPoint(page, pt.x, pt.y, { moveMs: 360 });
  }
  await sleep(250);

  // Verify board expanded; fallback direct DOM click if needed
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) =>
      (b.innerText || "").toLowerCase().includes("peek track")
    );
    if (btn) btn.click();
  });
  rec.mark("board_expanded");
  await hideCursor(page);
  await sleep(350);
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("span")].find((s) => s.innerText.includes("Articulate Roadmap"));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  await sleep(3300);

  const meta = await rec.stop();
  await page.close();
  return meta;
}

// =============================================================================
// 3. THE PODIUM (/podium: spin hot-take -> starter angles -> studio -> present)
// =============================================================================
async function recordPodium(browser) {
  const page = await browser.newPage();

  await page.evaluateOnNewDocument((appSeed) => {
    localStorage.setItem("fey-app-store", JSON.stringify(appSeed));
    // Deterministically land on cu-2 ("Owambe Is the Peak of Human Social Engineering", index 11/60)
    // on the first Math.random() call after clicking Spin, keeping every other topic fresh!
    const origRandom = Math.random;
    let armed = false;
    window.addEventListener(
      "click",
      (e) => {
        const txt = (e.target?.closest("button")?.innerText || "").toLowerCase();
        if (txt.includes("spin a hot-take")) {
          armed = true;
        }
      },
      true
    );
    Math.random = function () {
      if (armed) {
        armed = false;
        return 11.15 / 60; // exact index 11 -> cu-2
      }
      return origRandom.call(Math);
    };
  }, APP_SEED);

  await page.goto(`${BASE}/podium`, { waitUntil: "networkidle2", timeout: 60000 });
  await injectOverlay(page);
  await sleep(800);

  const rec = await startRecorder(page, path.join(OUT_DIR, "podium.mp4"));
  rec.mark("lobby_ready");
  await sleep(900);

  // 1. Spin a Hot-Take Topic -> lands on "Owambe Is the Peak of Human Social Engineering"
  await clickByText(page, "Spin a Hot-Take Topic", { moveMs: 420 });
  rec.mark("spin_clicked");
  await sleep(1800);
  rec.mark("topic_landed");
  await sleep(1100);

  // 2. Accept This Topic -> Notes phase with starter angle chips
  await clickByText(page, "Accept This Topic", { moveMs: 380 });
  rec.mark("notes_phase");
  await sleep(850);

  // Click the 3 real starter angle bullets so notes fill organically
  await clickByText(page, "Aso-ebi as social currency", { moveMs: 320, dwellBefore: 90, dwellAfter: 80 });
  await clickByText(page, "Jollof rice as political statement", { moveMs: 280, dwellBefore: 90, dwellAfter: 80 });
  await clickByText(page, "The DJ controls the room", { moveMs: 280, dwellBefore: 90, dwellAfter: 80 });
  await sleep(550);

  // 3. Open Slide Studio (Design Slides Yourself)
  await clickByText(page, "Design Slides Yourself", { moveMs: 380 });
  rec.mark("studio_open");
  await sleep(1200);

  // Switch Deck Theme live (click Fey Olive theme swatch so deck restyles cleanly on camera!)
  await clickByText(page, "Fey Olive", { moveMs: 360 }).catch(() => {});
  await sleep(950);
  rec.mark("theme_switched");

  // 4. Launch real fullscreen Presenter Mode & step through slides!
  await clickByText(page, "Present", { exact: true, moveMs: 380 });
  rec.mark("present_slide_1");
  await hideCursor(page);
  await sleep(1650);

  await page.keyboard.press("ArrowRight");
  rec.mark("present_slide_2");
  await sleep(1700);

  await page.keyboard.press("ArrowRight");
  rec.mark("present_slide_3");
  await sleep(1700);

  await page.keyboard.press("ArrowRight");
  rec.mark("present_slide_4");
  await sleep(1300);

  const meta = await rec.stop();
  await page.close();
  return meta;
}

// =============================================================================
// 4. NAIJA TRIVIA LEAGUE (/games/trivia/league/FEYNG26 -> Drops + Leaderboard -> Play Drop 3)
// =============================================================================
async function recordTrivia(browser) {
  const page = await browser.newPage();

  const startDate = isoDateDaysAgo(2); // Today = Day 3 of 5
  const endDate = isoDateDaysAgo(-2);
  const day1Date = isoDateDaysAgo(2);
  const day2Date = isoDateDaysAgo(1);

  const SEEDED_LEAGUE = {
    code: "FEYNG26",
    title: "Lagos Friday Crew",
    creatorName: "Tunde",
    creatorId: "friend-tunde",
    durationDays: 5,
    startDate,
    endDate,
    questionsPerDay: 5,
    difficulty: "mixed",
    category: "all",
    attemptPolicy: "flexible",
    unlockedUpToDay: 3,
    timerMode: "per_question",
    questionTimerSeconds: 20,
    totalDropSeconds: 150,
    dailySeedMap: {
      day_1: ["h001", "p001", "g001", "s001", "h002"],
      day_2: ["p002", "g002", "h003", "s003", "p004"],
      // Fresh Day 3 questions (none overlap with the 65s January film's Hakeem 1994!)
      day_3: ["s004", "p003", "s002", "g003", "h007"],
      day_4: ["h006", "g004", "h008", "h004", "h005"],
      day_5: ["h009", "h010", "g005", "p005", "s005"],
      _unlockedUpToDay: 3,
    },
  };

  const SEEDED_SCORES = [
    // Day 1
    { id: "sc-1", leagueCode: "FEYNG26", userId: "friend-tunde", username: "Tunde", avatar: "/avatars/avatar-sage.svg", dayNumber: 1, date: day1Date, score: 5, totalQuestions: 5, points: 650, durationSeconds: 29 },
    { id: "sc-2", leagueCode: "FEYNG26", userId: "demo-adaeze", username: "Adaeze", avatar: "/avatars/avatar-luminary.svg", dayNumber: 1, date: day1Date, score: 5, totalQuestions: 5, points: 650, durationSeconds: 32 },
    { id: "sc-3", leagueCode: "FEYNG26", userId: "friend-chidi", username: "Chidi", avatar: "/avatars/avatar-scholar.svg", dayNumber: 1, date: day1Date, score: 4, totalQuestions: 5, points: 520, durationSeconds: 34 },
    { id: "sc-4", leagueCode: "FEYNG26", userId: "friend-kemi", username: "Kemi", avatar: "/avatars/avatar-oracle.svg", dayNumber: 1, date: day1Date, score: 4, totalQuestions: 5, points: 460, durationSeconds: 44 },
    // Day 2
    { id: "sc-5", leagueCode: "FEYNG26", userId: "friend-tunde", username: "Tunde", avatar: "/avatars/avatar-sage.svg", dayNumber: 2, date: day2Date, score: 5, totalQuestions: 5, points: 650, durationSeconds: 26 },
    { id: "sc-6", leagueCode: "FEYNG26", userId: "demo-adaeze", username: "Adaeze", avatar: "/avatars/avatar-luminary.svg", dayNumber: 2, date: day2Date, score: 4, totalQuestions: 5, points: 520, durationSeconds: 33 },
    { id: "sc-7", leagueCode: "FEYNG26", userId: "friend-chidi", username: "Chidi", avatar: "/avatars/avatar-scholar.svg", dayNumber: 2, date: day2Date, score: 4, totalQuestions: 5, points: 520, durationSeconds: 36 },
    { id: "sc-8", leagueCode: "FEYNG26", userId: "friend-kemi", username: "Kemi", avatar: "/avatars/avatar-oracle.svg", dayNumber: 2, date: day2Date, score: 4, totalQuestions: 5, points: 520, durationSeconds: 38 },
  ];

  // Keep seeded local league untouched by remote cloud sync calls
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (req.url().includes("/api/trivia/league")) {
      return req.respond({ status: 404, contentType: "application/json", body: "{}" });
    }
    return req.continue();
  });

  await page.evaluateOnNewDocument(
    (appSeed, league, scores) => {
      localStorage.setItem("fey-app-store", JSON.stringify(appSeed));
      localStorage.setItem("fey_league_FEYNG26", JSON.stringify(league));
      localStorage.setItem("fey_league_scores_FEYNG26", JSON.stringify(scores));
      localStorage.setItem("fey_recent_leagues", JSON.stringify([league]));
    },
    APP_SEED,
    SEEDED_LEAGUE,
    SEEDED_SCORES
  );

  await page.goto(
    `${BASE}/games/trivia/league/FEYNG26?t=${encodeURIComponent("Lagos Friday Crew")}&d=5&q=5&c=Tunde&pol=flexible&u=3`,
    { waitUntil: "networkidle2", timeout: 60000 }
  );
  await injectOverlay(page);
  await sleep(900);

  const rec = await startRecorder(page, path.join(OUT_DIR, "trivia.mp4"));
  rec.mark("league_hub_ready");
  await sleep(1600);

  // Smooth scroll down to highlight the full ranked Crew Leaderboard, then back up to Play Drop 3
  await page.evaluate(() => window.scrollTo({ top: 560, behavior: "smooth" }));
  rec.mark("leaderboard_view");
  await sleep(2200);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(750);

  // Click "Play Drop 3" -> launches live Drop 3 question!
  await clickByText(page, "Play Drop 3", { moveMs: 420 });
  rec.mark("drop_3_q1");
  await sleep(1700);

  // Answer Q1 (Tobi Amusan) accurately!
  await clickByText(page, "Tobi Amusan", { selector: "button", moveMs: 420 });
  rec.mark("q1_answered");
  await sleep(2100);

  // Next Question -> Q2 (Fela Anikulapo-Kuti -> Afrobeat)
  await clickByText(page, "Next Question", { selector: "button", moveMs: 360 });
  rec.mark("drop_3_q2");
  await sleep(1650);

  await clickByText(page, "Afrobeat", { selector: "button", exact: true, moveMs: 400 });
  rec.mark("q2_answered");
  await hideCursor(page);
  await sleep(2100);

  const meta = await rec.stop();
  await page.close();
  return meta;
}

// =============================================================================
// 5. MATHLETICS (/games/mathletics -> Quantitative Reasoning -> Begin Sprint -> Feynman Shortcut)
// =============================================================================
async function recordMathletics(browser) {
  const page = await browser.newPage();

  await page.evaluateOnNewDocument((appSeed) => {
    localStorage.setItem("fey-app-store", JSON.stringify(appSeed));
  }, APP_SEED);

  await page.goto(`${BASE}/games/mathletics`, { waitUntil: "networkidle2", timeout: 60000 });
  await injectOverlay(page);
  await sleep(800);

  const rec = await startRecorder(page, path.join(OUT_DIR, "mathletics.mp4"));
  rec.mark("setup_ready");
  await sleep(950);

  // 1. Select Quantitative Reasoning pill
  await clickByText(page, "Quantitative Reasoning", { moveMs: 420 });
  rec.mark("qr_selected");
  await sleep(600);

  // 2. Click Begin Sprint -> Question 1 loads with live 25s timer!
  await clickByText(page, "Begin Sprint", { moveMs: 400 });
  rec.mark("q1_live");
  await sleep(2200);

  // 3. Click the exact right answer -> green checkmark + The Feynman Shortcut expands!
  await clickCorrectOption(page, MATHLETICS_BANK, { fallbackIndex: 0 });
  rec.mark("q1_shortcut");
  await sleep(2500);

  // 4. Next Question -> Question 2 loads!
  await clickByText(page, "Next Question", { moveMs: 380 });
  rec.mark("q2_live");
  await sleep(1900);

  await clickCorrectOption(page, MATHLETICS_BANK, { fallbackIndex: 0 });
  rec.mark("q2_shortcut");
  await hideCursor(page);
  await sleep(2200);

  const meta = await rec.stop();
  await page.close();
  return meta;
}

const RECORDERS = {
  study: recordStudy,
  articulate: recordArticulate,
  podium: recordPodium,
  trivia: recordTrivia,
  mathletics: recordMathletics,
  quant: recordMathletics,
};

const requested = process.argv.slice(2);
const targets = requested.length ? requested : ["study", "articulate", "podium", "trivia", "mathletics"];

const existingMarkers = fs.existsSync(MARKERS_FILE)
  ? JSON.parse(fs.readFileSync(MARKERS_FILE, "utf8"))
  : {};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  pipe: true,
  defaultViewport: VIEWPORT,
  args: [
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--autoplay-policy=no-user-gesture-required",
  ],
});

try {
  for (const name of targets) {
    const fn = RECORDERS[name];
    if (!fn) {
      console.warn(`Unknown clip "${name}"`);
      continue;
    }
    console.log(`\n● Recording real screen clip: ${name}`);
    const meta = await fn(browser);
    existingMarkers[name] = meta;
    fs.writeFileSync(MARKERS_FILE, JSON.stringify(existingMarkers, null, 2));
  }
} finally {
  await browser.close();
}

console.log(`\n✓ Done. Beat markers written to ${path.relative(REPO_ROOT, MARKERS_FILE)}`);
