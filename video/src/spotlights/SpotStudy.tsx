import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { COLORS } from "../theme";
import {
  RealClipStage,
  SPOTLIGHT_FRAMES,
  SpotlightAudio,
  SpotlightEndCard,
  SpotlightHook,
} from "./SpotlightShell";

export const SpotStudy: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bgBase }}>
      <SpotlightAudio
        musicFile="audio/music.mp3"
        musicStartSec={4.5}
        musicPeak={0.56}
        stampFrame={522}
        sfx={[
          { from: 76, file: "audio/sfx/paper-split.wav", volume: 0.34 },
          { from: 82 + 136, file: "audio/sfx/tap-soft.wav", volume: 0.36 },
          { from: 82 + 288, file: "audio/sfx/correct-chime.wav", volume: 0.38 },
          { from: 522, file: "audio/sfx/stamp-thump.wav", volume: 0.72 },
          { from: 534, file: "audio/sfx/unfold-shimmer.wav", volume: 0.36 },
        ]}
      />

      <Sequence from={0} durationInFrames={82}>
        <SpotlightHook
          badge="Fey · The Study"
          line1="Reading feels like knowing."
          accent="Speaking proves it."
          variant="chalk"
          duration={82}
        />
      </Sequence>

      <Sequence from={82} durationInFrames={416}>
        <RealClipStage
          badge="Fey · The Study"
          clipFile="clips/study.mp4"
          segments={[
            {
              stepLabel: "01 · Spin",
              headline: "Spin a topic from your active pool.",
              sub: "Filter by discipline, difficulty, and research duration — then let the roulette choose.",
              url: "fey.lokinlabs.com.ng/discover",
              durationInFrames: 136,
              sourceStartSec: 2.0,
              playbackRate: 1.55,
              zoom: [1.0, 1.015],
              verticalZoom: [1.22, 1.25],
              origin: [50, 50],
              verticalOrigin: [100, 48],
            },
            {
              stepLabel: "02 · Read & Write",
              headline: "Read cited sources. Write in your own words.",
              sub: "No copy-paste shortcuts — summarize key mechanisms cleanly to unlock speaking.",
              url: "fey.lokinlabs.com.ng/session",
              durationInFrames: 152,
              sourceStartSec: 13.6,
              playbackRate: 2.4,
              zoom: [1.0, 1.015],
              verticalZoom: [1.22, 1.25],
              origin: [50, 50],
              verticalOrigin: [100, 46],
            },
            {
              stepLabel: "03 · Speak",
              headline: "Explain it aloud on the clock.",
              sub: "Live microphone capture with structured prompts to prove real understanding.",
              url: "fey.lokinlabs.com.ng/session",
              durationInFrames: 128,
              sourceStartSec: 33.4,
              playbackRate: 1.15,
              zoom: [1.0, 1.018],
              verticalZoom: [1.22, 1.26],
              origin: [50, 50],
              verticalOrigin: [100, 48],
            },
          ]}
        />
      </Sequence>

      <Sequence from={498} durationInFrames={SPOTLIGHT_FRAMES - 498}>
        <SpotlightEndCard
          featureName="The Study"
          url="fey.lokinlabs.com.ng/discover"
          tagline="Think deeper."
          taglineAccent="Articulate clearly."
        />
      </Sequence>
    </AbsoluteFill>
  );
};
