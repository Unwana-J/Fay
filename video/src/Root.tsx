import React from "react";
import { Composition, Still } from "remotion";
import { FeyBetaVideo } from "./FeyBetaVideo";
import { FeyTeaserVideo } from "./FeyTeaserVideo";
import { SocialCard, SocialCardProps } from "./SocialCard";
import { SpotArticulate } from "./spotlights/SpotArticulate";
import { SPOTLIGHT_FRAMES } from "./spotlights/SpotlightShell";
import { SpotPodium } from "./spotlights/SpotPodium";
import { SpotQuant } from "./spotlights/SpotQuant";
import { SpotStudy } from "./spotlights/SpotStudy";
import { SpotTrivia } from "./spotlights/SpotTrivia";
import { FPS, TEASER_FRAMES, TOTAL_FRAMES } from "./theme";

const DEFAULT_CARD_PROPS: SocialCardProps = {
  template: "broadside",
  tag: "THINKING & WORK",
  headline: "The fastest way to find a hole in your thinking is to *say it out loud.*",
  body: "True understanding begins when you explain an idea simply, without notes.",
  showBeta: true,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Flagship Launch Film (65s) & Brand Soft-Launch Teaser (15s) */}
      <Composition id="FeyBeta" component={FeyBetaVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="FeyBetaVertical" component={FeyBetaVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
      <Composition id="FeyTeaser" component={FeyTeaserVideo} durationInFrames={TEASER_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="FeyTeaserVertical" component={FeyTeaserVideo} durationInFrames={TEASER_FRAMES} fps={FPS} width={1080} height={1920} />

      {/* 5-Film Feature Spotlight Series (20s each, 16:9 + 9:16) */}
      <Composition id="FeySpotStudy" component={SpotStudy} durationInFrames={SPOTLIGHT_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="FeySpotStudyVertical" component={SpotStudy} durationInFrames={SPOTLIGHT_FRAMES} fps={FPS} width={1080} height={1920} />

      <Composition id="FeySpotArticulate" component={SpotArticulate} durationInFrames={SPOTLIGHT_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="FeySpotArticulateVertical" component={SpotArticulate} durationInFrames={SPOTLIGHT_FRAMES} fps={FPS} width={1080} height={1920} />

      <Composition id="FeySpotPodium" component={SpotPodium} durationInFrames={SPOTLIGHT_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="FeySpotPodiumVertical" component={SpotPodium} durationInFrames={SPOTLIGHT_FRAMES} fps={FPS} width={1080} height={1920} />

      <Composition id="FeySpotTrivia" component={SpotTrivia} durationInFrames={SPOTLIGHT_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="FeySpotTriviaVertical" component={SpotTrivia} durationInFrames={SPOTLIGHT_FRAMES} fps={FPS} width={1080} height={1920} />

      <Composition id="FeySpotQuant" component={SpotQuant} durationInFrames={SPOTLIGHT_FRAMES} fps={FPS} width={1920} height={1080} />
      <Composition id="FeySpotQuantVertical" component={SpotQuant} durationInFrames={SPOTLIGHT_FRAMES} fps={FPS} width={1080} height={1920} />

      {/* Branded Editorial Social Cards */}
      <Still id="FeyCardLinkedin" component={SocialCard as unknown as React.FC<Record<string, unknown>>} width={1200} height={1500} defaultProps={DEFAULT_CARD_PROPS as unknown as Record<string, unknown>} />
      <Still id="FeyCardStatus" component={SocialCard as unknown as React.FC<Record<string, unknown>>} width={1080} height={1920} defaultProps={DEFAULT_CARD_PROPS as unknown as Record<string, unknown>} />
      <Still id="FeyCardLandscape" component={SocialCard as unknown as React.FC<Record<string, unknown>>} width={1600} height={900} defaultProps={DEFAULT_CARD_PROPS as unknown as Record<string, unknown>} />
      <Still id="FeyCardSquare" component={SocialCard as unknown as React.FC<Record<string, unknown>>} width={1080} height={1080} defaultProps={DEFAULT_CARD_PROPS as unknown as Record<string, unknown>} />
    </>
  );
};
