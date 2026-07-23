import { ScoreResult } from "@/lib/types";
import { ScoreCard } from "./ScoreCard";

interface DimensionScoreProps {
  score: ScoreResult;
}

export function DimensionScore({ score }: DimensionScoreProps) {
  return (
    <div className="space-y-4">
      <ScoreCard label="Content Quality" score={score.contentQuality} />
      <ScoreCard label="STAR Method" score={score.starMethod} />
      <ScoreCard label="Communication" score={score.communication} />
    </div>
  );
}
