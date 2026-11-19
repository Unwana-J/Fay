import React from "react";
import { Composition, Still } from "remotion";
import { FeyBetaVideo } from "./FeyBetaVideo";
import { FeyTeaserVideo } from "./FeyTeaserVideo";
import { SocialCard, SocialCardProps } from "./SocialCard";
import { FPS, TEASER_FRAMES, TOTAL_FRAMES } from "./theme";

const DEFAULT_CARD_PROPS: SocialCardProps = {
  template: "broadside",
  tag: "THINKING & LEARNING",
  headline: "Feeling informed isn't the same as *knowing.*",
  body: "You can save 200 posts and still freeze when someone asks you to explain one out loud.",
  showBeta: true,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Motion Videos */}
      <Composition
        id="FeyBeta"
        component={FeyBetaVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="FeyBetaVertical"
        component={FeyBetaVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="FeyTeaser"
        component={FeyTeaserVideo}
        durationInFrames={TEASER_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="FeyTeaserVertical"
        component={FeyTeaserVideo}
        durationInFrames={TEASER_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />

      {/* Branded Editorial Social Cards */}
      <Still
        id="FeyCardLinkedin"
        component={SocialCard as unknown as React.FC<Record<string, unknown>>}
        width={1200}
        height={1500}
        defaultProps={DEFAULT_CARD_PROPS as unknown as Record<string, unknown>}
      />
      <Still
        id="FeyCardStatus"
        component={SocialCard as unknown as React.FC<Record<string, unknown>>}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_CARD_PROPS as unknown as Record<string, unknown>}
      />
      <Still
        id="FeyCardLandscape"
        component={SocialCard as unknown as React.FC<Record<string, unknown>>}
        width={1600}
        height={900}
        defaultProps={DEFAULT_CARD_PROPS as unknown as Record<string, unknown>}
      />
      <Still
        id="FeyCardSquare"
        component={SocialCard as unknown as React.FC<Record<string, unknown>>}
        width={1080}
        height={1080}
        defaultProps={DEFAULT_CARD_PROPS as unknown as Record<string, unknown>}
      />
    </>
  );
};
