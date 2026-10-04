import type { ReactNode } from "react";
import FeatureGate from "@/components/ui/FeatureGate";

export default function TriviaLeagueLayout({ children }: { children: ReactNode }) {
  return (
    <FeatureGate
      flag="enableTriviaLeagues"
      title="Friendship Leagues are under revamp"
      message="We're upgrading tournament leagues. Your league progress is safe and will be back shortly."
      backHref="/games/trivia"
      backLabel="Back to Naija Trivia"
    >
      {children}
    </FeatureGate>
  );
}
