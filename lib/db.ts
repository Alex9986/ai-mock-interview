import fs from "fs";
import path from "path";
import { InterviewSession, QARecord, ScoreResult } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const QA_FILE = path.join(DATA_DIR, "qa_records.json");
const SCORES_FILE = path.join(DATA_DIR, "scores.json");

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON<T>(filePath: string, fallback: T): T {
  ensureDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function writeJSON<T>(filePath: string, data: T): void {
  ensureDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// Session operations
export function createSession(category?: string): InterviewSession {
  const sessions = readJSON<InterviewSession[]>(SESSIONS_FILE, []);
  const session: InterviewSession = {
    id: generateId(),
    status: "in_progress",
    category: category || null,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
  sessions.push(session);
  writeJSON(SESSIONS_FILE, sessions);
  return session;
}

export function completeSession(sessionId: string): void {
  const sessions = readJSON<InterviewSession[]>(SESSIONS_FILE, []);
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx !== -1) {
    sessions[idx].status = "completed";
    sessions[idx].completedAt = new Date().toISOString();
    writeJSON(SESSIONS_FILE, sessions);
  }
}

export function getSession(sessionId: string): InterviewSession | null {
  const sessions = readJSON<InterviewSession[]>(SESSIONS_FILE, []);
  return sessions.find((s) => s.id === sessionId) || null;
}

export function getAllSessions(): InterviewSession[] {
  return readJSON<InterviewSession[]>(SESSIONS_FILE, []).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

// QA record operations
export function createQARecord(
  sessionId: string,
  questionNumber: number,
  question: string,
  isFollowUp: boolean = false
): QARecord {
  const records = readJSON<QARecord[]>(QA_FILE, []);
  const record: QARecord = {
    id: generateId(),
    sessionId,
    questionNumber,
    question,
    answer: null,
    isFollowUp,
  };
  records.push(record);
  writeJSON(QA_FILE, records);
  return record;
}

export function updateQARecordAnswer(qaId: string, answer: string): void {
  const records = readJSON<QARecord[]>(QA_FILE, []);
  const idx = records.findIndex((r) => r.id === qaId);
  if (idx !== -1) {
    records[idx].answer = answer;
    writeJSON(QA_FILE, records);
  }
}

export function getQARecords(sessionId: string): QARecord[] {
  const records = readJSON<QARecord[]>(QA_FILE, []);
  return records
    .filter((r) => r.sessionId === sessionId)
    .sort((a, b) => a.questionNumber - b.questionNumber);
}

export function getLatestQARecord(sessionId: string): QARecord | null {
  const records = getQARecords(sessionId);
  return records.length > 0 ? records[records.length - 1] : null;
}

// Score operations
export function saveScore(
  sessionId: string,
  contentQuality: number,
  starMethod: number,
  communication: number,
  overall: number,
  strengths: string[],
  improvements: string[]
): ScoreResult {
  const scores = readJSON<ScoreResult[]>(SCORES_FILE, []);
  const score: ScoreResult = {
    id: generateId(),
    sessionId,
    contentQuality,
    starMethod,
    communication,
    overall,
    strengths,
    improvements,
    createdAt: new Date().toISOString(),
  };
  scores.push(score);
  writeJSON(SCORES_FILE, scores);
  return score;
}

export function getSessionScore(sessionId: string): ScoreResult | null {
  const scores = readJSON<ScoreResult[]>(SCORES_FILE, []);
  return scores.find((s) => s.sessionId === sessionId) || null;
}
