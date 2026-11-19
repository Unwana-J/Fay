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

export const SpotPodium: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bgBase }}>
      <SpotlightAudio
        musicFile="audio/funk-brass.mp3"
        musicStartSec={51.2}
        musicPeak={0.58}
        stampFrame={522}
        sfx={[
          { from: 76, file: "audio/sfx/paper-split.wav", volume: 0.34 },
          { from: 82 + 130, file: "audio/sfx/tap-soft.wav", volume: 0.4 },
          { from: 82 + 262, file: "audio/sfx/deck-fan.wav", volume: 0.42 },
          { from: 82 + 322, file: "audio/sfx/tap-soft.wav", volume: 0.36 },
          { from: 82 + 372, file: "audio/sfx/tap-soft.wav", volume: 0.36 },
          { from: 522, file: "audio/sfx/stamp-thump.wav", volume: 0.72 },
          { from: 534, file: "audio/sfx/unfold-shimmer.wav", volume: 0.36 },
        ]}
      />

      <Sequence from={0} durationInFrames={82}>
        <SpotlightHook
          badge="The Podium"
          line1="Spin a wild take."
          accent="Defend it in five slides."
          variant="chalk"
          duration={82}
        />
      </Sequence>

      <Sequence from={82} durationInFrames={416}>
        <RealClipStage
          badge="The Podium"
          clipFile="clips/podium.mp4"
          segments={[
            {
              stepLabel: "01 · Spin a Take",
              headline: "Get an unhinged prompt on the spot.",
              sub: "Spin from 60+ hot takes or pitch your own thesis for the room.",
              url: "fey.lokinlabs.com.ng/podium",
              durationInFrames: 130,
              sourceStartSec: 1.5,
              playbackRate: 1.5,
              zoom: [1.0, 1.015],
              verticalZoom: [1.22, 1.25],
              origin: [50, 50],
              verticalOrigin: [100, 48],
            },
            {
              stepLabel: "02 · Style Your Deck",
              headline: "Build your slides and pick a palette.",
              sub: "Design live in the slide studio or let AI draft five punchy slides from your notes.",
              url: "fey.lokinlabs.com.ng/podium",
              durationInFrames: 132,
              sourceStartSec: 18.8,
              playbackRate: 1.5,
              zoom: [1.0, 1.015],
              verticalZoom: [1.22, 1.25],
              origin: [50, 50],
              verticalOrigin: [100, 46],
            },
            {
              stepLabel: "03 · Take The Stage",
              headline: "Present live and share your deck link.",
              sub: "Fullscreen presenter mode with one-click shareable links for the whole group.",
              url: "fey.lokinlabs.com.ng/podium",
              durationInFrames: 154,
              sourceStartSec: 25.6,
              playbackRate: 1.18,
              zoom: [1.0, 1.015],
              verticalZoom: [1.0, 1.02],
              origin: [50, 50],
              verticalOrigin: [50, 50],
            },
          ]}
        />
      </Sequence>

      <Sequence from={498} durationInFrames={SPOTLIGHT_FRAMES - 498}>
        <SpotlightEndCard
          featureName="The Podium"
          url="fey.lokinlabs.com.ng/podium"
          tagline="No prep."
          taglineAccent="Pure conviction."
        />
      </Sequence>
    </AbsoluteFill>
  );
};
