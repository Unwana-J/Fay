import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Soundtrack } from "./components/Soundtrack";
import { Act1Problem } from "./scenes/Act1Problem";
import { Act2Feynman } from "./scenes/Act2Feynman";
import { Act3Crunch } from "./scenes/Act3Crunch";
import { Act4Games } from "./scenes/Act4Games";
import { Act5ProofBeta } from "./scenes/Act5ProofBeta";
import { ActStudyLoop } from "./scenes/ActStudyLoop";
import { StudyToParlorBridge } from "./scenes/StudyToParlorBridge";
import "./styles/fonts.css";
import { COLORS, TIMELINE } from "./theme";

export const FeyBetaVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgBase }}>
      <Soundtrack />
      <Sequence from={TIMELINE.act1.start} durationInFrames={TIMELINE.act1.duration} name="Act 1: The Receipt">
        <Act1Problem />
      </Sequence>
      <Sequence from={TIMELINE.act2.start} durationInFrames={TIMELINE.act2.duration} name="Act 2: Richard Feynman">
        <Act2Feynman />
      </Sequence>
      <Sequence from={TIMELINE.act3.start} durationInFrames={TIMELINE.act3.duration} name="Act 3: The Crunch">
        <Act3Crunch />
      </Sequence>
      <Sequence from={TIMELINE.studyLoop.start} durationInFrames={TIMELINE.studyLoop.duration} name="Act 4A: Daily Study Loop">
        <ActStudyLoop />
      </Sequence>
      <Sequence from={TIMELINE.bridge.start} durationInFrames={TIMELINE.bridge.duration} name="Bridge: Study to Parlor">
        <StudyToParlorBridge />
      </Sequence>
      <Sequence from={TIMELINE.act4.start} durationInFrames={TIMELINE.act4.duration} name="Act 4B: The Four Games">
        <Act4Games />
      </Sequence>
      <Sequence from={TIMELINE.act5.start} durationInFrames={TIMELINE.act5.duration} name="Act 5: Proof + Beta">
        <Act5ProofBeta />
      </Sequence>
    </AbsoluteFill>
  );
};
