import { QARecord } from "@/lib/types";
import { Card } from "@/components/ui/Card";

interface QAListProps {
  records: QARecord[];
}

export function QAList({ records }: QAListProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Q&A Transcript</h3>
      {records.map((record, i) => (
        <Card key={record.id} padding="md">
          <div className="space-y-3">
            <div>
              <span className="text-xs text-primary font-medium">
                {record.isFollowUp ? "Follow-up" : `Question ${record.questionNumber}`}
              </span>
              <p className="text-sm text-foreground mt-1 leading-relaxed">
                {record.question}
              </p>
            </div>
            <div className="border-t border-border pt-3">
              <span className="text-xs text-zinc-500 font-medium">Your Answer</span>
              <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                {record.answer || (
                  <span className="italic text-zinc-600">No answer recorded</span>
                )}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
