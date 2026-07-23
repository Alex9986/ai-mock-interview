"use client";

import { useEffect, useRef } from "react";
import { InterviewMessage } from "@/lib/types";

interface TranscriptAreaProps {
  messages: InterviewMessage[];
  isThinking: boolean;
}

export function TranscriptArea({ messages, isThinking }: TranscriptAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl bg-surface/50 border border-border min-h-0"
    >
      {messages.length === 0 && !isThinking && (
        <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
          <p>Your conversation with the AI interviewer will appear here.</p>
        </div>
      )}

      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "candidate" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === "interviewer"
                ? "bg-zinc-800 text-foreground rounded-tl-sm"
                : "bg-primary/20 text-foreground rounded-tr-sm"
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {msg.content}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}

      {isThinking && (
        <div className="flex justify-start">
          <div className="bg-zinc-800 text-zinc-400 rounded-2xl rounded-tl-sm px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs">Interviewer is thinking...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
