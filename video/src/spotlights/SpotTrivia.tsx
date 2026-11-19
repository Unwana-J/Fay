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

export const SpotTrivia: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bgBase }}>
      <SpotlightAudio
        musicFile="audio/funk-brass.mp3"
        musicStartSec={16.5}
        musicPeak={0.58}
        stampFrame={522}
        sfx={[
          { from: 76, file: "audio/sfx/paper-split.wav", volume: 0.34 },
          { from: 82 + 146, file: "audio/sfx/tap-soft.wav", volume: 0.38 },
          { from: 82 + 206, file: "audio/sfx/correct-chime.wav", volume: 0.42 },
          { from: 82 + 288, file: "audio/sfx/tap-soft.wav", volume: 0.36 },
          { from: 82 + 344, file: "audio/sfx/correct-chime.wav", volume: 0.44 },
          { from: 522, file: "audio/sfx/stamp-thump.wav", volume: 0.72 },
          { from: 534, file: "audio/sfx/unfold-shimmer.wav", volume: 0.36 },
        ]}
      />

      <Sequence from={0} durationInFrames={82}>
        <SpotlightHook
          badge="Naija Trivia · Leagues"
          line1="One daily drop."
          accent="Your whole crew on the board."
          variant="chalk"
          duration={82}
        />
      </Sequence>

      <Sequence from={82} durationInFrames={416}>
        <RealClipStage
          badge="Naija Trivia · Friendship Leagues"
          clipFile="clips/trivia.mp4"
          segments={[
            {
              stepLabel: "01 · Crew League",
              headline: "Multi-day drops with live crew standings.",
              sub: "Host a league for your WhatsApp group — everyone answers the exact same daily set.",
              url: "fey.lokinlabs.com.ng/games/trivia",
              durationInFrames: 146,
              sourceStartSec: 0.4,
              playbackRate: 1.6,
              zoom: [1.0, 1.015],
              verticalZoom: [1.22, 1.25],
              origin: [50, 50],
              verticalOrigin: [100, 48],
            },
            {
              stepLabel: "02 · Daily Drop",
              headline: "Same questions, live clock, instant insight.",
              sub: "History, Afrobeats, sports, and pop culture — with context after every answer.",
              url: "fey.lokinlabs.com.ng/games/trivia",
              durationInFrames: 142,
              sourceStartSec: 8.6,
              playbackRate: 1.65,
              zoom: [1.0, 1.015],
              verticalZoom: [1.22, 1.25],
              origin: [50, 50],
              verticalOrigin: [100, 48],
            },
            {
              stepLabel: "03 · Keep Climbing",
              headline: "Accuracy plus speed decides the crown.",
              sub: "Every drop locks your score onto the shared leaderboard for the week.",
              url: "fey.lokinlabs.com.ng/games/trivia",
              durationInFrames: 128,
              sourceStartSec: 16.6,
              playbackRate: 1.4,
              zoom: [1.0, 1.015],
              verticalZoom: [1.22, 1.25],
              origin: [50, 50],
              verticalOrigin: [100, 48],
            },
          ]}
        />
      </Sequence>

      <Sequence from={498} durationInFrames={SPOTLIGHT_FRAMES - 498}>
        <SpotlightEndCard
          featureName="Naija Trivia"
          url="fey.lokinlabs.com.ng/games/trivia"
          tagline="1,000+ questions."
          taglineAccent="Start a league tonight."
        />
      </Sequence>
    </AbsoluteFill>
  );
};
