interface ScoreCardProps {
  label: string;
  score: number;
  maxScore?: number;
}

export function ScoreCard({ label, score, maxScore = 10 }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  const color =
    percentage >= 80
      ? "bg-success"
      : percentage >= 60
        ? "bg-warning"
        : "bg-danger";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="font-medium text-foreground">
          {score} / {maxScore}
        </span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
