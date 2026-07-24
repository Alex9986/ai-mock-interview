import { NextRequest, NextResponse } from "next/server";
import {
  completeSession,
  getSession,
  getQARecords,
  saveScore,
} from "@/lib/db";
import { scoreInterview } from "@/lib/deepseek";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body as { sessionId: string };

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    // Validate session
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

    // Get all Q&A records
    const qaRecords = getQARecords(sessionId);

    if (qaRecords.length === 0) {
      return NextResponse.json(
        { error: "No Q&A records found for this session" },
        { status: 400 }
      );
    }

    // Score the interview via DeepSeek
    const scoreResult = await scoreInterview(qaRecords);

    // Save to database
    const savedScore = saveScore(
      sessionId,
      scoreResult.contentQuality,
      scoreResult.starMethod,
      scoreResult.communication,
      scoreResult.overall,
      scoreResult.strengths,
      scoreResult.improvements,
      scoreResult.fillerWords
    );

    // Mark session as completed
    completeSession(sessionId);

    return NextResponse.json({
      score: savedScore,
      session: { ...session, status: "completed", completedAt: new Date().toISOString() },
      qaRecords,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error completing interview:", message);
    return NextResponse.json(
      { error: `Failed to complete interview: ${message}` },
      { status: 500 }
    );
  }
}
