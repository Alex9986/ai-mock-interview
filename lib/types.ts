export interface InterviewSession {
  id: string;
  status: "in_progress" | "completed";
  category: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface QARecord {
  id: string;
  sessionId: string;
  questionNumber: number;
  question: string;
  answer: string | null;
  isFollowUp: boolean;
}

export interface FillerWordAnalysis {
  detected: boolean;
  examples: string[];
  advice: string;
}

export interface ScoreResult {
  id: string;
  sessionId: string;
  contentQuality: number;
  starMethod: number;
  communication: number;
  overall: number;
  strengths: string[];
  improvements: string[];
  fillerWords: FillerWordAnalysis | null;
  createdAt: string;
}

export interface InterviewMessage {
  role: "interviewer" | "candidate";
  content: string;
  timestamp: string;
}

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StartInterviewResponse {
  sessionId: string;
  question: InterviewMessage;
}

export interface AnswerResponse {
  message: InterviewMessage;
  isFollowUp: boolean;
  isLastQuestion: boolean;
}

export interface ScoreResponse {
  score: ScoreResult;
  session: InterviewSession;
  qaRecords: QARecord[];
}
