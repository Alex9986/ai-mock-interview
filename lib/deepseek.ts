import OpenAI from "openai";
import { DeepSeekMessage, QARecord, ScoreResult } from "./types";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error(
        "DEEPSEEK_API_KEY environment variable is not set. Please add it to your Vercel project settings."
      );
    }
    _client = new OpenAI({
      apiKey,
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
    });
  }
  return _client;
}

const INTERVIEWER_SYSTEM_PROMPT = `You are an experienced behavioral interviewer at a top technology company. Your role is to conduct a professional behavioral interview for the candidate.

Interview guidelines:
1. Ask ONE behavioral question at a time. Questions should follow the STAR method framework (Situation, Task, Action, Result).
2. After the candidate answers, you may ask ONE brief follow-up question if the answer lacks specific details or concrete examples. Otherwise, move to the next question.
3. Keep your responses concise and professional - you're an interviewer, not a coach during the interview.
4. Do NOT provide feedback or evaluation during the interview. Save that for the end.
5. Do NOT answer the candidate's questions about the "correct" answer.
6. Vary question topics: teamwork, conflict resolution, leadership, failure/challenges, time management, decision-making, etc.

Question format:
- First question: Start with "Let's begin. [Your question]"
- Subsequent questions: Transition naturally, e.g., "Thank you. Next question: [question]"
- Follow-ups: Be brief, e.g., "Could you elaborate on what specific actions you took?"

Maximum total questions (including follow-ups): 8`;

const SCORING_SYSTEM_PROMPT = `You are an experienced interview evaluator at a top technology company. Evaluate the candidate's behavioral interview performance based on the Q&A transcript provided.

Provide detailed scoring in the following format as JSON only (no markdown, no extra text):

{
  "contentQuality": <score 1-10>,
  "starMethod": <score 1-10>,
  "communication": <score 1-10>,
  "overall": <score 1-10>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement area 1>", "<improvement area 2>", "<improvement area 3>"]
}

Scoring criteria:
- contentQuality: Depth, relevance, and specificity of the answers. Did they provide concrete examples?
- starMethod: How well did they structure answers using Situation, Task, Action, Result? Clear context, specific actions, measurable results?
- communication: Clarity, conciseness, confidence in delivery. Professional language.
- overall: Holistic assessment of interview readiness for behavioral rounds at top tech companies.

For strengths and improvements, provide specific, actionable feedback.`;

export async function getNextQuestion(
  conversationHistory: DeepSeekMessage[],
  currentQuestionNumber: number
): Promise<string> {
  const messages: DeepSeekMessage[] = [
    { role: "system", content: INTERVIEWER_SYSTEM_PROMPT },
    ...conversationHistory,
  ];

  if (conversationHistory.length === 0) {
    messages.push({
      role: "user",
      content:
        "Start the behavioral interview. Ask the first question.",
    });
  } else {
    messages.push({
      role: "user",
      content: `(This was question #${currentQuestionNumber}. Based on the candidate's last answer, either ask a follow-up or move to the next behavioral question.)`,
    });
  }

  const client = getClient();
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages,
    temperature: 0.8,
    max_tokens: 300,
  });

  return (
    response.choices[0]?.message?.content ||
    "Let's continue with the next question."
  );
}

export async function scoreInterview(
  qaRecords: QARecord[]
): Promise<ScoreResult> {
  const transcript = qaRecords
    .map((record) => {
      const prefix = record.isFollowUp ? "Follow-up" : `Question ${record.questionNumber}`;
      return `Interviewer (${prefix}): ${record.question}\nCandidate: ${record.answer || "(no answer)"}`;
    })
    .join("\n\n");

  const messages: DeepSeekMessage[] = [
    { role: "system", content: SCORING_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Please evaluate this behavioral interview transcript:\n\n${transcript}`,
    },
  ];

  const client = getClient();
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages,
    temperature: 0.3,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content || "{}";

  try {
    // Try to parse the JSON response
    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      id: "",
      sessionId: "",
      contentQuality: parsed.contentQuality || 5,
      starMethod: parsed.starMethod || 5,
      communication: parsed.communication || 5,
      overall: parsed.overall || 5,
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || [],
      createdAt: new Date().toISOString(),
    };
  } catch {
    // Fallback if JSON parsing fails
    return {
      id: "",
      sessionId: "",
      contentQuality: 5,
      starMethod: 5,
      communication: 5,
      overall: 5,
      strengths: ["Review the transcript manually for detailed feedback."],
      improvements: ["AI scoring could not parse the response. Please try again."],
      createdAt: new Date().toISOString(),
    };
  }
}
