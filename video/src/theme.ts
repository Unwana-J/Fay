export const FPS = 30;
export const DURATION_SECONDS = 65;
export const TOTAL_FRAMES = FPS * DURATION_SECONDS; // 1950 frames (65s)

export const TEASER_SECONDS = 15;
export const TEASER_FRAMES = FPS * TEASER_SECONDS; // 450 frames (15s)

// Exact Fey semantic palette from app/globals.css & docs/BRAND_IDENTITY.md
export const COLORS = {
  // Paper & surfaces
  bgBase: "#F7F5F0",
  bgPanel: "#EFECE5",
  bgCard: "#FFFFFF",
  bgInput: "#E5E1D7",
  paperWarm: "#F4EFE6",

  // Ink & text
  ink: "#1E2312",
  oliveText: "#2C3415",
  muted: "#5D624E",
  subtle: "#8B8D7E",

  // Forest olive (structural framing, chalkboard, badges, labels)
  olive: "#444E2C",
  oliveBr: "#5C6A36",
  oliveDim: "#DCD5C9",
  chalkboard: "#202714",
  chalkboardDeep: "#171D0E",
  chalkText: "#F2EFE7",
  chalkMuted: "#B7BCA8",

  // Wine red (primary accents, BETA stamp, CTA, key highlight)
  terra: "#7A1C2E",
  terraDk: "#58101E",
  terraSoft: "rgba(122, 28, 46, 0.08)",
  terraBorder: "rgba(122, 28, 46, 0.24)",

  // Antique bronze gold (rewards, XP, stars, streak ONLY)
  gold: "#A67C1E",
  goldLight: "#D9B35C",
  goldSoft: "rgba(166, 124, 30, 0.12)",

  // Urgency (<10s) & error ONLY
  red: "#B53A3A",
  redSoft: "rgba(181, 58, 58, 0.10)",

  // Correct answer highlight (calm forest-emerald compatible with Fey editorial)
  correctBg: "#EAF3EC",
  correctBorder: "#2E6B43",
  correctText: "#1E4D2F",
} as const;

export const FONTS = {
  serif: '"Lora", Georgia, "Times New Roman", serif',
  display: '"Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif',
  sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
} as const;

// Tactile editorial spring presets (snappy settle, zero cartoon wobble)
export const SPRINGS = {
  editorial: { damping: 24, stiffness: 170, mass: 0.9 },
  snappy: { damping: 20, stiffness: 260, mass: 0.75 },
  heavyStamp: { damping: 16, stiffness: 320, mass: 1.1 },
  gentle: { damping: 28, stiffness: 120, mass: 1.0 },
  crunch: { damping: 18, stiffness: 280, mass: 0.8 },
} as const;

// Main Launch Film timing map (30 fps, total 1950 frames = 65.0s)
// Aligns naturally with the Pixabay track:
//   0:04.5 beat drop -> "How much of it do you actually know?"
//   0:43.0 chorus lift -> The Parlor games + 80+ curious minds
//   1:02.0 clean breakdown -> BETA ink-seal stamp!
export const TIMELINE = {
  act1: { start: 0, duration: 270 }, // 0.0s – 9.0s (The Receipt + Problem)
  act2: { start: 270, duration: 165 }, // 9.0s – 14.5s (Richard Feynman Chalkboard)
  act3: { start: 435, duration: 210 }, // 14.5s – 21.5s (The Crunch + Fey Reveal)
  studyLoop: { start: 645, duration: 390 }, // 21.5s – 34.5s (4-Step Study Loop)
  bridge: { start: 1035, duration: 60 }, // 34.5s – 36.5s (Study -> Parlor switch)
  act4: {
    start: 1095,
    duration: 615, // 36.5s – 57.0s (4 live games)
    articulate: { start: 0, duration: 154 },
    podium: { start: 154, duration: 154 },
    trivia: { start: 308, duration: 154 },
    mathletics: { start: 462, duration: 153 },
  },
  act5: { start: 1710, duration: 240 }, // 57.0s – 65.0s (Constellation + 80+ + BETA)
} as const;
