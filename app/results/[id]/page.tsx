"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { InterviewSession, QARecord, ScoreResult } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ScoreCard } from "@/components/results/ScoreCard";
import { DimensionScore } from "@/components/results/DimensionScore";
import { QAList } from "@/components/results/QAList";
import { Recommendations } from "@/components/results/Recommendations";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [qaRecords, setQaRecords] = useState<QARecord[]>([]);
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/interview/session/${sessionId}`);

        if (!response.ok) {
          throw new Error("Failed to load interview results");
        }

        const data = await response.json();
        setSession(data.session);
        setQaRecords(data.qaRecords);
        setScore(data.score);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load results"
        );
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      fetchResults();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-zinc-500">Generating your score...</p>
        </div>
      </div>
    );
  }

  if (error || !session || !score) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-danger">{error || "Results not found"}</p>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const getScoreColor = (s: number) => {
    if (s >= 8) return "text-success";
    if (s >= 6) return "text-warning";
    return "text-danger";
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Interview Results
          </h1>
          <p className="text-sm text-zinc-500">
            {new Date(session.startedAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            {session.category && ` · ${session.category}`}
          </p>
        </div>

        {/* Overall score */}
        <Card padding="lg" className="text-center">
          <div className="space-y-2">
            <p className="text-sm text-zinc-500">Overall Score</p>
            <p className={`text-5xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall}
            </p>
            <p className="text-xs text-zinc-600">out of 10</p>
          </div>
        </Card>

        {/* Dimension scores */}
        <Card padding="lg">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Score Breakdown
          </h3>
          <DimensionScore score={score} />
        </Card>

        {/* Strengths & Improvements */}
        <Recommendations
          strengths={score.strengths}
          improvements={score.improvements}
        />

        {/* Q&A Transcript */}
        <QAList records={qaRecords} />

        {/* Actions */}
        <div className="flex justify-center gap-4 pb-8">
          <Button variant="secondary" onClick={() => router.push("/")}>
            Back to Home
          </Button>
          <Button onClick={() => router.push("/interview")}>
            New Interview
          </Button>
        </div>
      </div>
    </div>
  );
}
