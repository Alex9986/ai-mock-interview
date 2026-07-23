"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DeepSeekMessage, InterviewMessage } from "@/lib/types";
import { VideoDisplay } from "@/components/interview/VideoDisplay";
import { TranscriptArea } from "@/components/interview/TranscriptArea";
import { Controls } from "@/components/interview/Controls";
import { ScoreIndicator } from "@/components/interview/ScoreIndicator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";

const MAX_QUESTIONS = parseInt(process.env.NEXT_PUBLIC_MAX_QUESTIONS || "6", 10);

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      }
    >
      <InterviewContent />
    </Suspense>
  );
}

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") || "";
  const historyParam = searchParams.get("history");

  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<
    DeepSeekMessage[]
  >([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [micSupported, setMicSupported] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check microphone support
  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (SpeechRecognition && typeof SpeechRecognition === "function") {
      setMicSupported(true);
    }
  }, []);

  // Init interview - load first question from history
  useEffect(() => {
    if (!sessionId || !historyParam) {
      router.push("/");
      return;
    }

    try {
      const history = JSON.parse(decodeURIComponent(historyParam)) as DeepSeekMessage[];
      setConversationHistory(history);

      // Extract first question
      const firstQuestion = history.find((m) => m.role === "assistant");
      if (firstQuestion) {
        const msg: InterviewMessage = {
          role: "interviewer",
          content: firstQuestion.content,
          timestamp: new Date().toISOString(),
        };
        setMessages([msg]);
        speakText(firstQuestion.content);
      }
    } catch {
      router.push("/");
    }
  }, [sessionId, historyParam, router]);

  // Speak text using TTS
  const speakText = useCallback((text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find a good English voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find(
          (v) => v.lang.startsWith("en") && v.name.includes("Google")
        ) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      synthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Start recording (STT)
  const startRecording = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognition || typeof SpeechRecognition !== "function") return;

    const recognition = new (SpeechRecognition as new () => SpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        submitAnswer(transcript.trim());
      }
    };

    recognition.onerror = (event: Event) => {
      const errorEvent = event as SpeechRecognitionErrorEvent;
      console.error("Speech recognition error:", errorEvent.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // Submit answer (voice or text)
  const submitAnswer = async (answer: string) => {
    stopRecording();
    setTextAnswer("");
    setShowTextInput(false);

    // Add user message
    const userMsg: InterviewMessage = {
      role: "candidate",
      content: answer,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    setIsThinking(true);

    try {
      const response = await fetch("/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          answer,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to process answer");
      }

      const data = await response.json();

      if (data.isLastQuestion) {
        // Complete the interview
        completeInterview();
        return;
      }

      // Add interviewer response
      const interviewerMsg: InterviewMessage = {
        role: "interviewer",
        content: data.message.content,
        timestamp: data.message.timestamp,
      };
      setMessages((prev) => [...prev, interviewerMsg]);
      setConversationHistory(data.conversationHistory);
      setQuestionNumber(data.currentQuestionNumber || questionNumber + 1);
      speakText(data.message.content);
    } catch (err) {
      console.error("Error submitting answer:", err);
    } finally {
      setIsProcessing(false);
      setIsThinking(false);
    }
  };

  // Complete the interview
  const completeInterview = async () => {
    setIsEnding(true);
    setIsThinking(false);

    try {
      const response = await fetch("/api/interview/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete interview");
      }

      router.push(`/results/${sessionId}`);
    } catch (err) {
      console.error("Error completing interview:", err);
      setIsEnding(false);
    }
  };

  // Handle text input submission
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textAnswer.trim()) {
      submitAnswer(textAnswer.trim());
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="px-6 py-3 border-b border-border bg-surface/50">
        <ScoreIndicator
          questionNumber={questionNumber}
          maxQuestions={MAX_QUESTIONS}
        />
      </div>

      {/* Main interview area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
        {/* Video / Avatar display */}
        <div className="lg:w-2/5 flex flex-col gap-4">
          <VideoDisplay isRecording={isRecording} />

          {/* Text input fallback */}
          <Card padding="sm" className="shrink-0">
            <div className="flex items-center gap-2">
              {!showTextInput ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTextInput(true)}
                  className="text-xs text-zinc-500"
                >
                  Type instead of speaking
                </Button>
              ) : (
                <form onSubmit={handleTextSubmit} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    disabled={isProcessing}
                    className="flex-1 bg-zinc-900 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                  <Button type="submit" size="sm" disabled={isProcessing || !textAnswer.trim()}>
                    Send
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTextInput(false)}
                  >
                    Cancel
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </div>

        {/* Transcript */}
        <div className="lg:w-3/5 flex flex-col min-h-0">
          <TranscriptArea messages={messages} isThinking={isThinking} />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="px-6 py-4 border-t border-border bg-surface/50">
        <Controls
          isRecording={isRecording}
          isProcessing={isProcessing}
          isEnding={isEnding}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onEndInterview={() => setShowEndModal(true)}
          micSupported={micSupported}
        />
      </div>

      {/* End interview confirmation modal */}
      <Modal
        open={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="End Interview?"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            Are you sure you want to end this interview? Your answers so far
            will be saved and scored.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEndModal(false)}
            >
              Continue Interview
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setShowEndModal(false);
                completeInterview();
              }}
              disabled={isEnding}
            >
              End & Score
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
