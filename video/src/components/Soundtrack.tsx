import React from "react";
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { TIMELINE, TOTAL_FRAMES } from "../theme";
import { OPENING_SFX_CUES } from "./OpeningSequence";

interface SfxCue {
  from: number;
  file: string;
  volume: number;
  durationInFrames?: number;
}

const MUSIC_FILE = "audio/music.mp3";

const A1 = TIMELINE.act1.start; // 0
const A2 = TIMELINE.act2.start; // 270
const A3 = TIMELINE.act3.start; // 435
const STUDY = TIMELINE.studyLoop.start; // 645
const BRIDGE = TIMELINE.bridge.start; // 1035
const A4_ART = TIMELINE.act4.start + TIMELINE.act4.articulate.start; // 1095
const A4_POD = TIMELINE.act4.start + TIMELINE.act4.podium.start; // 1249
const A4_TRI = TIMELINE.act4.start + TIMELINE.act4.trivia.start; // 1403
const A4_MAT = TIMELINE.act4.start + TIMELINE.act4.mathletics.start; // 1557
const A5 = TIMELINE.act5.start; // 1710

// Subtle acoustic SFX balanced cleanly over the Pixabay groove (65s / 1950f)
const SFX_CUES: SfxCue[] = [
  // Opening (0..90f): soft keyboard ticks during type-on + single soft thud on the hard cut at frame 90
  ...OPENING_SFX_CUES,

  // Act 1 (150..270f): The Receipt slaps & paper split
  { from: A1 + 166, file: "audio/sfx/tap-soft.wav", volume: 0.42 },
  { from: A1 + 182, file: "audio/sfx/tap-soft.wav", volume: 0.46 },
  { from: A1 + 220, file: "audio/sfx/paper-split.wav", volume: 0.38 },

  // Act 2: Feynman chalkboard texture
  { from: A2 + 12, file: "audio/sfx/chalk-write.wav", volume: 0.30 },

  // Act 3: The Crunch & Fey Butterfly unfold bloom
  { from: A3 + 109, file: "audio/sfx/crunch-fold.wav", volume: 0.68 },
  { from: A3 + 134, file: "audio/sfx/unfold-shimmer.wav", volume: 0.48 },

  // Act 4A — Daily Study Loop (01 Read -> 02 Pin Cue -> 03 Speak -> 04 Recall Check)
  { from: STUDY + 104, file: "audio/sfx/strike-pen.wav", volume: 0.30 }, // highlight sweep
  { from: STUDY + 152, file: "audio/sfx/tap-soft.wav", volume: 0.44 }, // "Add as cue" pinned
  { from: STUDY + 192, file: "audio/sfx/tap-soft.wav", volume: 0.34 }, // mic stage starts
  { from: STUDY + 306, file: "audio/sfx/tap-soft.wav", volume: 0.30 }, // Recall Q1
  { from: STUDY + 320, file: "audio/sfx/tap-soft.wav", volume: 0.32 }, // Recall Q2
  { from: STUDY + 334, file: "audio/sfx/correct-chime.wav", volume: 0.52 }, // Recall Q3 + +60 Bonus XP

  // Bridge: Study -> The Parlor toggle glide
  { from: BRIDGE + 18, file: "audio/sfx/tap-soft.wav", volume: 0.42 },

  // Act 4B.1 — Articulate: JOLLOF card pop + 3 pen strike-throughs
  { from: A4_ART + 34, file: "audio/sfx/tap-soft.wav", volume: 0.32 },
  { from: A4_ART + 58, file: "audio/sfx/strike-pen.wav", volume: 0.36 },
  { from: A4_ART + 72, file: "audio/sfx/strike-pen.wav", volume: 0.36 },
  { from: A4_ART + 86, file: "audio/sfx/strike-pen.wav", volume: 0.36 },

  // Act 4B.2 — The Podium: spin settle + 5-slide fan riffle
  { from: A4_POD + 28, file: "audio/sfx/tap-soft.wav", volume: 0.34 },
  { from: A4_POD + 54, file: "audio/sfx/deck-fan.wav", volume: 0.46 },

  // Act 4B.3 — Naija Trivia: B · 1994 correct lock-in + +150 XP chime
  { from: A4_TRI + 76, file: "audio/sfx/correct-chime.wav", volume: 0.56 },

  // Act 4B.4 — Mathletics: stopwatch ticks + D · 54 lock-in chime
  { from: A4_MAT + 48, file: "audio/sfx/clock-tick.wav", volume: 0.34 },
  { from: A4_MAT + 66, file: "audio/sfx/clock-tick.wav", volume: 0.38 },
  { from: A4_MAT + 84, file: "audio/sfx/clock-tick.wav", volume: 0.46 },
  { from: A4_MAT + 102, file: "audio/sfx/clock-tick.wav", volume: 0.50 },
  { from: A4_MAT + 120, file: "audio/sfx/clock-tick.wav", volume: 0.52 },
  { from: A4_MAT + 96, file: "audio/sfx/correct-chime.wav", volume: 0.48 },

  // Act 5: BETA wine-red ink seal THUMP (lands right at 61.8s on track's 1:02 breakdown!) + keystrokes
  { from: A5 + 143, file: "audio/sfx/stamp-thump.wav", volume: 0.72 },
  { from: A5 + 162, file: "audio/sfx/type-click.wav", volume: 0.28 },
  { from: A5 + 168, file: "audio/sfx/type-click.wav", volume: 0.26 },
  { from: A5 + 174, file: "audio/sfx/type-click.wav", volume: 0.28 },
  { from: A5 + 180, file: "audio/sfx/type-click.wav", volume: 0.26 },
  { from: A5 + 186, file: "audio/sfx/type-click.wav", volume: 0.28 },
];

function musicVolume(frame: number): number {
  const base = interpolate(
    frame,
    [0, 14, 88, 92, 1275, 1305, TOTAL_FRAMES - 75, TOTAL_FRAMES],
    [0, 0.36, 0.40, 0.54, 0.54, 0.62, 0.62, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Subtle ducking around The Crunch (f535..f585)
  const crunchDuck = interpolate(frame, [534, 548, 572, 592], [1, 0.56, 0.68, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Brief micro-duck on the BETA stamp impact (f1848..f1875)
  const stampDuck = interpolate(frame, [1846, 1854, 1868, 1882], [1, 0.60, 0.78, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return base * crunchDuck * stampDuck;
}

export const Soundtrack: React.FC = () => {
  return (
    <>
      <Audio src={staticFile(MUSIC_FILE)} volume={musicVolume} />

      {SFX_CUES.map((cue, idx) => (
        <Sequence
          key={`${cue.file}-${cue.from}-${idx}`}
          from={cue.from}
          durationInFrames={cue.durationInFrames ?? 45}
        >
          <Audio src={staticFile(cue.file)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
};
