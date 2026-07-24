import { getSupabase } from "./supabase";
import { InterviewSession, QARecord, ScoreResult, FillerWordAnalysis } from "./types";

function supabase() {
  return getSupabase();
}

function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// Session operations

export async function createSession(category?: string): Promise<InterviewSession> {
  const id = generateId();
  const { error } = await supabase().from("sessions").insert({
    id,
    status: "in_progress",
    category: category || null,
    started_at: new Date().toISOString(),
  });

  if (error) throw new Error(`Failed to create session: ${error.message}`);

  return {
    id,
    status: "in_progress",
    category: category || null,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
}

export async function completeSession(sessionId: string): Promise<void> {
  const { error } = await supabase()
    .from("sessions")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) throw new Error(`Failed to complete session: ${error.message}`);
}

export async function getSession(sessionId: string): Promise<InterviewSession | null> {
  const { data, error } = await supabase()
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) return null;

  if (!data) return null;

  return {
    id: data.id,
    status: data.status,
    category: data.category,
    startedAt: data.started_at,
    completedAt: data.completed_at,
  };
}

export async function getAllSessions(): Promise<InterviewSession[]> {
  const { data, error } = await supabase()
    .from("sessions")
    .select("*")
    .order("started_at", { ascending: false });

  if (error) throw new Error(`Failed to get sessions: ${error.message}`);

  return (data || []).map((row) => ({
    id: row.id,
    status: row.status,
    category: row.category,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }));
}

// QA record operations

export async function createQARecord(
  sessionId: string,
  questionNumber: number,
  question: string,
  isFollowUp: boolean = false
): Promise<QARecord> {
  const id = generateId();
  const { error } = await supabase().from("qa_records").insert({
    id,
    session_id: sessionId,
    question_number: questionNumber,
    question,
    answer: null,
    is_follow_up: isFollowUp,
  });

  if (error) throw new Error(`Failed to create QA record: ${error.message}`);

  return {
    id,
    sessionId,
    questionNumber,
    question,
    answer: null,
    isFollowUp,
  };
}

export async function updateQARecordAnswer(qaId: string, answer: string): Promise<void> {
  const { error } = await supabase()
    .from("qa_records")
    .update({ answer })
    .eq("id", qaId);

  if (error) throw new Error(`Failed to update QA record: ${error.message}`);
}

export async function getQARecords(sessionId: string): Promise<QARecord[]> {
  const { data, error } = await supabase()
    .from("qa_records")
    .select("*")
    .eq("session_id", sessionId)
    .order("question_number", { ascending: true });

  if (error) throw new Error(`Failed to get QA records: ${error.message}`);

  return (data || []).map((row) => ({
    id: row.id,
    sessionId: row.session_id,
    questionNumber: row.question_number,
    question: row.question,
    answer: row.answer,
    isFollowUp: row.is_follow_up,
  }));
}

export async function getLatestQARecord(sessionId: string): Promise<QARecord | null> {
  const records = await getQARecords(sessionId);
  return records.length > 0 ? records[records.length - 1] : null;
}

// Score operations

export async function saveScore(
  sessionId: string,
  contentQuality: number,
  starMethod: number,
  communication: number,
  overall: number,
  strengths: string[],
  improvements: string[],
  fillerWords: FillerWordAnalysis | null = null
): Promise<ScoreResult> {
  const id = generateId();
  const { error } = await supabase().from("scores").insert({
    id,
    session_id: sessionId,
    content_quality: contentQuality,
    star_method: starMethod,
    communication,
    overall,
    strengths,
    improvements,
    filler_words: fillerWords,
    created_at: new Date().toISOString(),
  });

  if (error) throw new Error(`Failed to save score: ${error.message}`);

  return {
    id,
    sessionId,
    contentQuality,
    starMethod,
    communication,
    overall,
    strengths,
    improvements,
    fillerWords,
    createdAt: new Date().toISOString(),
  };
}

export async function getSessionScore(sessionId: string): Promise<ScoreResult | null> {
  const { data, error } = await supabase()
    .from("scores")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (error) return null;

  if (!data) return null;

  return {
    id: data.id,
    sessionId: data.session_id,
    contentQuality: data.content_quality,
    starMethod: data.star_method,
    communication: data.communication,
    overall: data.overall,
    strengths: data.strengths || [],
    improvements: data.improvements || [],
    fillerWords: data.filler_words || null,
    createdAt: data.created_at,
  };
}
