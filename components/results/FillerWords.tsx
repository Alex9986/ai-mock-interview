"use client";

import { Card } from "@/components/ui/Card";
import { FillerWordAnalysis } from "@/lib/types";

interface FillerWordsProps {
  fillerWords: FillerWordAnalysis | null;
}

export function FillerWords({ fillerWords }: FillerWordsProps) {
  if (!fillerWords) return null;

  return (
    <Card padding="lg">
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Speech & Fluency Analysis
      </h3>

      {fillerWords.detected ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-warning font-medium mb-1.5">
              Filler words & hesitation patterns detected:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {fillerWords.examples.map((word, i) => (
                <span
                  key={i}
                  className="inline-block px-2 py-0.5 rounded text-xs bg-warning/10 text-warning border border-warning/20"
                >
                  &ldquo;{word}&rdquo;
                </span>
              ))}
            </div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-1">Advice</p>
            <p className="text-sm text-zinc-300">{fillerWords.advice}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-400">{fillerWords.advice || "No filler words or hesitation patterns detected. Your speech was clear and fluent."}</p>
      )}
    </Card>
  );
}
