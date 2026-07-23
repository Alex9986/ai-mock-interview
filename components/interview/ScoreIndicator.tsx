interface ScoreIndicatorProps {
  questionNumber: number;
  maxQuestions: number;
}

export function ScoreIndicator({ questionNumber, maxQuestions }: ScoreIndicatorProps) {
  const progress = Math.min((questionNumber / maxQuestions) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500 whitespace-nowrap">
        {questionNumber} / {maxQuestions}
      </span>
    </div>
  );
}
