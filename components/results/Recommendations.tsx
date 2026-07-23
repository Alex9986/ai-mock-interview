import { Card } from "@/components/ui/Card";

interface RecommendationsProps {
  strengths: string[];
  improvements: string[];
}

export function Recommendations({ strengths, improvements }: RecommendationsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card padding="lg">
        <h3 className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Strengths
        </h3>
        <ul className="space-y-2">
          {strengths.map((s, i) => (
            <li key={i} className="text-sm text-zinc-300 flex gap-2">
              <span className="text-success mt-0.5 shrink-0">&bull;</span>
              {s}
            </li>
          ))}
        </ul>
      </Card>

      <Card padding="lg">
        <h3 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Areas for Improvement
        </h3>
        <ul className="space-y-2">
          {improvements.map((imp, i) => (
            <li key={i} className="text-sm text-zinc-300 flex gap-2">
              <span className="text-warning mt-0.5 shrink-0">&bull;</span>
              {imp}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
