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

export const SpotArticulate: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bgBase }}>
      <SpotlightAudio
        musicFile="audio/playful-marimba.mp3"
        musicStartSec={0}
        musicPeak={0.62}
        naturalEnding={true}
        stampFrame={522}
        sfx={[
          { from: 76, file: "audio/sfx/paper-split.wav", volume: 0.34 },
          { from: 82 + 90, file: "audio/sfx/tap-soft.wav", volume: 0.36 },
          { from: 82 + 182, file: "audio/sfx/tap-soft.wav", volume: 0.36 },
          { from: 82 + 206, file: "audio/sfx/correct-chime.wav", volume: 0.38 },
          { from: 82 + 236, file: "audio/sfx/correct-chime.wav", volume: 0.40 },
          { from: 82 + 316, file: "audio/sfx/tap-soft.wav", volume: 0.38 },
          { from: 82 + 340, file: "audio/sfx/correct-chime.wav", volume: 0.38 },
          { from: 522, file: "audio/sfx/stamp-thump.wav", volume: 0.72 },
          { from: 534, file: "audio/sfx/unfold-shimmer.wav", volume: 0.36 },
        ]}
      />

      <Sequence from={0} durationInFrames={82}>
        <SpotlightHook
          badge="Fey Articulate · Online Room"
          line1="Host a room. Call your crew."
          accent="Don't say the word."
          variant="chalk"
          duration={82}
        />
      </Sequence>

      <Sequence from={82} durationInFrames={416}>
        <RealClipStage
          badge="Fey Articulate"
          clipFile="clips/articulate.mp4"
          segments={[
            {
              stepLabel: "01 · Host a Room",
              headline: "Set your teams, timer, and buzzer — then create a room.",
              sub: "Pick 2 to 4 teams, speaking time, and score to win in seconds.",
              url: "fey.lokinlabs.com.ng/play",
              durationInFrames: 90,
              sourceStartSec: 2.2,
              playbackRate: 2.65,
              zoom: [1.0, 1.015],
              verticalZoom: [1.22, 1.25],
              origin: [50, 50],
              verticalOrigin: [100, 44],
            },
            {
              stepLabel: "02 · Team Up Live",
              headline: "Share the invite link and hop on a call with friends.",
              sub: "Everyone joins Team Alpha or Team Omega in the live lobby.",
              url: "fey.lokinlabs.com.ng/play/room/FEY-FRI8",
              durationInFrames: 92,
              sourceStartSec: 11.4,
              playbackRate: 1.72,
              zoom: [1.0, 1.015],
              verticalZoom: [1.22, 1.25],
              origin: [50, 50],
              verticalOrigin: [100, 50],
            },
            {
              stepLabel: "03 · Describe Fast",
              headline: "Speak when it's your team's turn before time runs out.",
              sub: "Tap Got It! as teammates shout guesses — or Pass to keep moving.",
              url: "fey.lokinlabs.com.ng/play/room/FEY-FRI8",
              durationInFrames: 134,
              sourceStartSec: 21.2,
              playbackRate: 2.95,
              zoom: [1.0, 1.018],
              verticalZoom: [1.24, 1.28],
              origin: [54, 52],
              verticalOrigin: [100, 52],
            },
            {
              stepLabel: "04 · Sync The Board",
              headline: "Audit the round and watch your team advance.",
              sub: "Review every word together and race across the 20-tile board.",
              url: "fey.lokinlabs.com.ng/play/room/FEY-FRI8",
              durationInFrames: 100,
              sourceStartSec: 49.8,
              playbackRate: 1.9,
              zoom: [1.0, 1.02],
              verticalZoom: [1.22, 1.26],
              origin: [50, 56],
              verticalOrigin: [100, 58],
            },
          ]}
        />
      </Sequence>

      <Sequence from={498} durationInFrames={SPOTLIGHT_FRAMES - 498}>
        <SpotlightEndCard
          featureName="Articulate"
          url="fey.lokinlabs.com.ng/play"
          tagline="Create a room. Share the link."
          taglineAccent="Play live with friends."
        />
      </Sequence>
    </AbsoluteFill>
  );
};
