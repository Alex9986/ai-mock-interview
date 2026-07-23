"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const CATEGORIES = [
  "General",
  "Leadership",
  "Teamwork",
  "Conflict Resolution",
  "Failure & Resilience",
  "Time Management",
  "Decision Making",
  "Communication",
];

export default function Home() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  const startInterview = async () => {
    setIsStarting(true);
    setError("");

    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start interview");
      }

      const data = await response.json();

      // Navigate to interview page with session data
      const params = new URLSearchParams({
        sessionId: data.sessionId,
        history: JSON.stringify(data.conversationHistory),
      });
      router.push(`/interview?${params.toString()}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start interview"
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-primary">
              AI-Powered Mock Interview
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Behavioral Interview Practice
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Practice your behavioral interview skills with an AI interviewer.
              Answer questions naturally with your voice, and receive detailed
              feedback to improve.
            </p>
          </div>

          {/* Category selector */}
          <div className="space-y-3">
            <label className="text-sm text-zinc-500 block text-left">
              Interview Focus
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-white"
                      : "bg-surface border border-border text-zinc-400 hover:text-foreground hover:border-zinc-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-sm text-danger">
              {error}
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={startInterview}
            disabled={isStarting}
          >
            {isStarting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Starting Interview...
              </span>
            ) : (
              "Start Interview"
            )}
          </Button>

          <p className="text-xs text-zinc-600">
            A microphone is recommended for the best experience. This interview
            is conducted in English.
          </p>
        </div>
      </div>
    </div>
  );
}
