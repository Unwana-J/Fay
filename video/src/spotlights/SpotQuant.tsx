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

export const SpotQuant: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bgBase }}>
      <SpotlightAudio
        musicFile="audio/arena-anthem.mp3"
        musicStartSec={0}
        musicPeak={0.58}
        naturalEnding={true}
        stampFrame={522}
        sfx={[
          { from: 76, file: "audio/sfx/paper-split.wav", volume: 0.34 },
          { from: 82 + 124, file: "audio/sfx/tap-soft.wav", volume: 0.38 },
          { from: 82 + 216, file: "audio/sfx/correct-chime.wav", volume: 0.44 },
          { from: 82 + 272, file: "audio/sfx/tap-soft.wav", volume: 0.36 },
          { from: 82 + 372, file: "audio/sfx/correct-chime.wav", volume: 0.46 },
          { from: 522, file: "audio/sfx/stamp-thump.wav", volume: 0.72 },
          { from: 534, file: "audio/sfx/unfold-shimmer.wav", volume: 0.36 },
        ]}
      />

      <Sequence from={0} durationInFrames={82}>
        <SpotlightHook
          badge="Fey · Quant"
          line1="25 seconds. No calculator."
          accent="Find the shortcut."
          variant="chalk"
          duration={82}
        />
      </Sequence>

      <Sequence from={82} durationInFrames={416}>
        <RealClipStage
          badge="Fey · Quant"
          clipFile="clips/mathletics.mp4"
          segments={[
            {
              stepLabel: "01 · Pick Your Focus",
              headline: "Mental math, algebra, and quantitative reasoning.",
              sub: "Choose your pace and topic focus — from 25-second blitzes to pattern triads.",
              url: "fey.lokinlabs.com.ng/games",
              durationInFrames: 124,
              sourceStartSec: 2.2,
              playbackRate: 2.25,
              zoom: [1.0, 1.015],
              verticalZoom: [1.22, 1.24],
              origin: [50, 50],
              verticalOrigin: [100, 26],
            },
            {
              stepLabel: "02 · Beat The Clock",
              headline: "Spot the pattern before 25 seconds run out.",
              sub: "No scratchpad, no calculators — pure estimation and clean logic.",
              url: "fey.lokinlabs.com.ng/games",
              durationInFrames: 148,
              sourceStartSec: 12.2,
              playbackRate: 2.15,
              zoom: [1.0, 1.015],
              verticalZoom: [1.22, 1.24],
              origin: [50, 50],
              verticalOrigin: [100, 26],
            },
            {
              stepLabel: "03 · Feynman Shortcut",
              headline: "Every answer reveals the mental trick behind it.",
              sub: "Learn the faster intuition immediately and challenge friends on the exact same set.",
              url: "fey.lokinlabs.com.ng/games",
              durationInFrames: 144,
              sourceStartSec: 26.8,
              playbackRate: 1.75,
              zoom: [1.0, 1.015],
              verticalZoom: [1.22, 1.24],
              origin: [50, 50],
              verticalOrigin: [100, 26],
            },
          ]}
        />
      </Sequence>

      <Sequence from={498} durationInFrames={SPOTLIGHT_FRAMES - 498}>
        <SpotlightEndCard
          featureName="Quant"
          url="fey.lokinlabs.com.ng/games"
          tagline="No scratchpad."
          taglineAccent="Pure intuition."
        />
      </Sequence>
    </AbsoluteFill>
  );
};
