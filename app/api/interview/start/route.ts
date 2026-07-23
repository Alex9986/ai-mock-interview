import { NextRequest, NextResponse } from "next/server";
import { createSession, createQARecord } from "@/lib/db";
import { getNextQuestion } from "@/lib/deepseek";
import { DeepSeekMessage } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const category = body.category as string | undefined;

    // Create interview session
    const session = createSession(category);

    // Get first question from DeepSeek
    const question = await getNextQuestion([], 0);

    // Save the Q&A record (answer will be filled later)
    createQARecord(session.id, 1, question, false);

    const assistantMessage: DeepSeekMessage = {
      role: "assistant",
      content: question,
    };

    return NextResponse.json({
      sessionId: session.id,
      question: {
        role: "interviewer",
        content: question,
        timestamp: new Date().toISOString(),
      },
      conversationHistory: [assistantMessage],
    });
  } catch (error) {
    console.error("Error starting interview:", error);
    return NextResponse.json(
      { error: "Failed to start interview. Please check your API key configuration." },
      { status: 500 }
    );
  }
}
