import { NextRequest, NextResponse } from "next/server";
import { getSession, getQARecords, getSessionScore } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = getSession(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const qaRecords = getQARecords(id);
    const score = getSessionScore(id);

    return NextResponse.json({
      session,
      qaRecords,
      score,
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
