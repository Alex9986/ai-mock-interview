"use client";

import { Button } from "@/components/ui/Button";

interface ControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isEnding: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onEndInterview: () => void;
  micSupported: boolean;
}

export function Controls({
  isRecording,
  isProcessing,
  isSpeaking,
  isEnding,
  onStartRecording,
  onStopRecording,
  onEndInterview,
  micSupported,
}: ControlsProps) {
  const micDisabled = isProcessing || isSpeaking;
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Mic toggle button */}
      {micSupported ? (
        <button
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={micDisabled}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? "bg-danger text-white recording-pulse"
              : "bg-surface border border-border text-foreground hover:bg-zinc-700"
          } ${micDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          title={
            isSpeaking
              ? "Interviewer is speaking..."
              : isRecording
              ? "Stop recording"
              : "Start recording"
          }
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isRecording ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            )}
          </svg>
        </button>
      ) : (
        <p className="text-sm text-warning">
          Microphone access is required for voice input.
        </p>
      )}

      {/* End interview button */}
      <Button
        variant="danger"
        size="md"
        onClick={onEndInterview}
        disabled={isEnding}
      >
        {isEnding ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Ending...
          </span>
        ) : (
          "End Interview"
        )}
      </Button>
    </div>
  );
}
