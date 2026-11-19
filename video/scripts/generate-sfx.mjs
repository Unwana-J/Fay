// Generates clean, warm, editorial acoustic SFX WAVs (48kHz 16-bit PCM)
// Zero external dependencies, deterministic, tactile stationery/acoustic feel.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/audio/sfx");
fs.mkdirSync(OUT, { recursive: true });

const SR = 48000;

// Deterministic PRNG (Mulberry32) so SFX sound identical every build
function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function writeWav(filename, samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SR, 24);
  buffer.writeUInt32LE(SR * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  const outPath = path.join(OUT, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`  ✓ ${filename} (${(numSamples / SR).toFixed(2)}s)`);
}

// Simple 1-pole low-pass and high-pass filters for shaping organic noise
function lowpass(arr, cutoffHz) {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / SR;
  const alpha = dt / (rc + dt);
  const out = new Float32Array(arr.length);
  let y = 0;
  for (let i = 0; i < arr.length; i++) {
    y = y + alpha * (arr[i] - y);
    out[i] = y;
  }
  return out;
}

function highpass(arr, cutoffHz) {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / SR;
  const alpha = rc / (rc + dt);
  const out = new Float32Array(arr.length);
  let y = 0;
  let prevX = 0;
  for (let i = 0; i < arr.length; i++) {
    y = alpha * (y + arr[i] - prevX);
    prevX = arr[i];
    out[i] = y;
  }
  return out;
}

function bandpass(arr, lowHz, highHz) {
  return lowpass(highpass(arr, lowHz), highHz);
}

function normalize(arr, peak = 0.85) {
  let max = 0;
  for (let i = 0; i < arr.length; i++) max = Math.max(max, Math.abs(arr[i]));
  if (max < 1e-6) return arr;
  const scale = peak / max;
  const out = new Float32Array(arr.length);
  for (let i = 0; i < arr.length; i++) out[i] = arr[i] * scale;
  return out;
}

const rng = makeRng(20261119);

// 1. tap-soft.wav — warm muted wood/paper tap for receipt lines & card entrances
{
  const len = Math.floor(SR * 0.11);
  const raw = new Float32Array(len);
  const noise = new Float32Array(len);
  for (let i = 0; i < len; i++) noise[i] = rng() * 2 - 1;
  const filt = bandpass(noise, 400, 1800);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const body = Math.sin(2 * Math.PI * (165 * Math.exp(-t * 28)) * t) * Math.exp(-t * 48);
    const click = filt[i] * Math.exp(-t * 95) * 0.65;
    raw[i] = body * 0.75 + click;
  }
  writeWav("tap-soft.wav", normalize(raw, 0.72));
}

// 2. freeze-stop.wav — crisp subtle record/scroll brake into dead silence
{
  const len = Math.floor(SR * 0.18);
  const raw = new Float32Array(len);
  const noise = new Float32Array(len);
  for (let i = 0; i < len; i++) noise[i] = rng() * 2 - 1;
  const filt = bandpass(noise, 700, 2600);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.sin(Math.min(1, t / 0.025) * (Math.PI / 2)) * Math.exp(-t * 24);
    const pitchDrop = Math.sin(2 * Math.PI * (260 * Math.exp(-t * 16)) * t) * env;
    raw[i] = pitchDrop * 0.55 + filt[i] * Math.exp(-t * 36) * 0.35;
  }
  writeWav("freeze-stop.wav", normalize(raw, 0.65));
}

// 3. paper-split.wav — delicate crisp paper crease/tear swish
{
  const len = Math.floor(SR * 0.28);
  const noise = new Float32Array(len);
  for (let i = 0; i < len; i++) noise[i] = rng() * 2 - 1;
  const crisp = bandpass(noise, 1400, 5200);
  const raw = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, t / 0.28)), 1.4);
    const flutter = 0.65 + 0.35 * Math.sin(2 * Math.PI * 38 * t);
    raw[i] = crisp[i] * env * flutter;
  }
  writeWav("paper-split.wav", normalize(raw, 0.55));
}

// 4. chalk-write.wav — gentle dry chalk-on-slate texture
{
  const len = Math.floor(SR * 0.75);
  const noise = new Float32Array(len);
  for (let i = 0; i < len; i++) noise[i] = rng() * 2 - 1;
  const chalk = bandpass(noise, 1800, 4400);
  const raw = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const strokeEnv =
      Math.sin(Math.min(1, t / 0.08) * (Math.PI / 2)) *
      Math.exp(-Math.max(0, t - 0.15) * 3.8);
    // rhythmic writing cadence
    const cadence = 0.5 + 0.5 * Math.sin(2 * Math.PI * 7.5 * t) * Math.sin(2 * Math.PI * 19 * t);
    raw[i] = chalk[i] * strokeEnv * (0.45 + 0.55 * cadence);
  }
  writeWav("chalk-write.wav", normalize(raw, 0.42));
}

// 5. crunch-fold.wav — crisp layered paper crunch + tactile bass compression
{
  const len = Math.floor(SR * 0.42);
  const noise = new Float32Array(len);
  for (let i = 0; i < len; i++) noise[i] = rng() * 2 - 1;
  const crinkleHi = bandpass(noise, 1600, 6800);
  const crinkleMid = bandpass(noise, 450, 1700);
  const raw = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    // Two fast crisp paper folds followed by tight center compression
    const b1 = Math.exp(-Math.pow((t - 0.05) / 0.032, 2));
    const b2 = Math.exp(-Math.pow((t - 0.12) / 0.042, 2)) * 1.15;
    const b3 = Math.exp(-Math.pow((t - 0.19) / 0.055, 2)) * 0.7;
    const thump = Math.sin(2 * Math.PI * (115 * Math.exp(-t * 14)) * t) * Math.exp(-t * 18);
    raw[i] = crinkleHi[i] * (b1 + b2 + b3) * 0.8 + crinkleMid[i] * (b1 + b2) * 0.55 + thump * 0.75;
  }
  writeWav("crunch-fold.wav", normalize(raw, 0.85));
}

// 6. unfold-shimmer.wav — warm editorial acoustic chord bloom (Dmaj9 felt bell) for butterfly reveal
{
  const len = Math.floor(SR * 1.15);
  const raw = new Float32Array(len);
  const freqs = [293.66, 440.0, 554.37, 659.25, 880.0]; // D4, A4, C#5, E5, A5
  const noise = new Float32Array(len);
  for (let i = 0; i < len; i++) noise[i] = rng() * 2 - 1;
  const airy = bandpass(noise, 1200, 3600);

  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let sum = 0;
    for (let k = 0; k < freqs.length; k++) {
      const delay = k * 0.032;
      if (t >= delay) {
        const dt = t - delay;
        const attack = Math.min(1, dt / 0.018);
        const decay = Math.exp(-dt * (2.6 + k * 0.45));
        const amp = 1 / (1 + k * 0.45);
        sum += Math.sin(2 * Math.PI * freqs[k] * dt) * attack * decay * amp;
      }
    }
    const airEnv = Math.sin(Math.min(1, t / 0.14) * (Math.PI / 2)) * Math.exp(-t * 6.5);
    raw[i] = sum * 0.55 + airy[i] * airEnv * 0.12;
  }
  writeWav("unfold-shimmer.wav", normalize(raw, 0.68));
}

// 7. strike-pen.wav — crisp ink/marker cross-out swipe for Articulate forbidden words
{
  const len = Math.floor(SR * 0.13);
  const noise = new Float32Array(len);
  for (let i = 0; i < len; i++) noise[i] = rng() * 2 - 1;
  const nib = bandpass(noise, 1200, 4200);
  const raw = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.sin(Math.PI * (t / 0.13));
    raw[i] = nib[i] * env;
  }
  writeWav("strike-pen.wav", normalize(raw, 0.55));
}

// 8. deck-fan.wav — soft 5-card paper riffle for The Podium slides fanning out
{
  const len = Math.floor(SR * 0.52);
  const noise = new Float32Array(len);
  for (let i = 0; i < len; i++) noise[i] = rng() * 2 - 1;
  const paper = bandpass(noise, 900, 3800);
  const raw = new Float32Array(len);
  const hits = [0.02, 0.10, 0.18, 0.26, 0.34];
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let env = 0;
    for (const h of hits) {
      if (t >= h) {
        const dt = t - h;
        env += Math.exp(-dt * 42) * Math.min(1, dt / 0.005);
      }
    }
    raw[i] = paper[i] * env;
  }
  writeWav("deck-fan.wav", normalize(raw, 0.62));
}

// 9. correct-chime.wav — refined two-note marimba/kalimba harmonic chime (E5 -> B5)
{
  const len = Math.floor(SR * 0.65);
  const raw = new Float32Array(len);
  const notes = [
    { start: 0.0, f: 659.25 }, // E5
    { start: 0.095, f: 987.77 }, // B5
  ];
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let sum = 0;
    for (const n of notes) {
      if (t >= n.start) {
        const dt = t - n.start;
        const atk = Math.min(1, dt / 0.006);
        const fund = Math.sin(2 * Math.PI * n.f * dt) * Math.exp(-dt * 5.8);
        const over = Math.sin(2 * Math.PI * n.f * 2 * dt) * Math.exp(-dt * 14) * 0.18;
        sum += (fund + over) * atk;
      }
    }
    raw[i] = sum;
  }
  writeWav("correct-chime.wav", normalize(raw, 0.72));
}

// 10. clock-tick.wav — crisp precision mechanical stopwatch tick
{
  const len = Math.floor(SR * 0.065);
  const noise = new Float32Array(len);
  for (let i = 0; i < len; i++) noise[i] = rng() * 2 - 1;
  const hi = bandpass(noise, 2400, 6200);
  const raw = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const ping = Math.sin(2 * Math.PI * 1950 * t) * Math.exp(-t * 140) * 0.55;
    const snap = hi[i] * Math.exp(-t * 180) * 0.85;
    raw[i] = ping + snap;
  }
  writeWav("clock-tick.wav", normalize(raw, 0.68));
}

// 11. stamp-thump.wav — weighty, tactile wine-red BETA ink-seal stamp landing on paper
{
  const len = Math.floor(SR * 0.30);
  const noise = new Float32Array(len);
  for (let i = 0; i < len; i++) noise[i] = rng() * 2 - 1;
  const slap = bandpass(noise, 320, 1900);
  const raw = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const sub = Math.sin(2 * Math.PI * (82 * Math.exp(-t * 14) + 38) * t) * Math.exp(-t * 18);
    const wood = Math.sin(2 * Math.PI * 240 * t) * Math.exp(-t * 68) * 0.45;
    const paperSlap = slap[i] * Math.exp(-t * 58) * 0.7;
    raw[i] = sub * 0.9 + wood + paperSlap;
  }
  writeWav("stamp-thump.wav", normalize(raw, 0.9));
}

// 12. type-click.wav — quiet tactile typewriter keystroke
{
  const len = Math.floor(SR * 0.045);
  const noise = new Float32Array(len);
  for (let i = 0; i < len; i++) noise[i] = rng() * 2 - 1;
  const click = bandpass(noise, 1800, 5600);
  const raw = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    raw[i] = click[i] * Math.exp(-t * 190);
  }
  writeWav("type-click.wav", normalize(raw, 0.5));
}

console.log("SFX generation complete.");
