import { NextRequest, NextResponse } from "next/server";
import { getSession, createQARecord, updateQARecordAnswer, getQARecords } from "@/lib/db";
import { getNextQuestion } from "@/lib/deepseek";
import { DeepSeekMessage } from "@/lib/types";

const MAX_QUESTIONS = parseInt(process.env.MAX_QUESTIONS || "6", 10);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, answer, conversationHistory } = body as {
      sessionId: string;
      answer: string;
      conversationHistory: DeepSeekMessage[];
    };

    if (!sessionId || !answer) {
      return NextResponse.json(
        { error: "sessionId and answer are required" },
        { status: 400 }
      );
    }

    // Validate session exists and is active
    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (session.status !== "in_progress") {
      return NextResponse.json(
        { error: "Session is already completed" },
        { status: 400 }
      );
    }

    // Update the latest Q&A record with the user's answer
    const records = getQARecords(sessionId);
    const latestRecord = records[records.length - 1];
    if (latestRecord) {
      updateQARecordAnswer(latestRecord.id, answer);
    }

    // Add user's answer to conversation history
    const updatedHistory: DeepSeekMessage[] = [
      ...conversationHistory,
      { role: "user", content: answer },
    ];

    // Check if we've reached the max questions
    const mainQuestions = records.filter((r) => !r.isFollowUp);
    const totalExchanges = records.length;
    const isLastQuestion =
      mainQuestions.length >= MAX_QUESTIONS || totalExchanges >= MAX_QUESTIONS + 2;

    if (isLastQuestion) {
      // Signal that this is the last exchange
      return NextResponse.json({
        isLastQuestion: true,
        currentQuestionNumber: mainQuestions.length,
      });
    }

    // Get next question from DeepSeek (retry on fallback responses)
    const currentQuestionNumber = mainQuestions.length;
    let nextQuestion = await getNextQuestion(updatedHistory, currentQuestionNumber);

    const fallbacks = [
      "Let's continue with the next question.",
      "Let's continue",
    ];
    let retries = 0;
    while (
      retries < 2 &&
      fallbacks.some((f) => nextQuestion.toLowerCase().includes(f.toLowerCase()))
    ) {
      nextQuestion = await getNextQuestion(updatedHistory, currentQuestionNumber);
      retries++;
    }

    // Determine if this is a follow-up (simple heuristic: if it starts with a follow-up-like phrase)
    const isFollowUp =
      nextQuestion.toLowerCase().includes("could you elaborate") ||
      nextQuestion.toLowerCase().includes("can you be more specific") ||
      nextQuestion.toLowerCase().includes("tell me more") ||
      nextQuestion.length < 60;

    // Save the new Q&A record
    const nextQuestionNumber = records.length + 1;
    createQARecord(sessionId, nextQuestionNumber, nextQuestion, isFollowUp);

    // Add assistant's response to history
    const newHistory: DeepSeekMessage[] = [
      ...updatedHistory,
      { role: "assistant", content: nextQuestion },
    ];

    return NextResponse.json({
      message: {
        role: "interviewer",
        content: nextQuestion,
        timestamp: new Date().toISOString(),
      },
      conversationHistory: newHistory,
      isFollowUp,
      isLastQuestion: false,
      currentQuestionNumber: mainQuestions.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing answer:", message);
    return NextResponse.json(
      { error: `Failed to process answer: ${message}` },
      { status: 500 }
    );
  }
}
