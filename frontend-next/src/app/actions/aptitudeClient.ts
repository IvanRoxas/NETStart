"use server";

import questionsData from "@/server/data/aptitude_questions.server.json";
import { ensureDefaultAptitudeQuestionsInDb } from "@/lib/aptitudeQuestionsHelper";

export interface AptitudeQuestionData {
  id: string;
  question: string;
  questionType: string;
  category: string;
  options: string[];
  shortAnswer?: string;
  explanation?: string;
}

export async function seedDefaultAptitudeQuestions() {
  await ensureDefaultAptitudeQuestionsInDb();
}

export async function getAptitudeQuestions() {
  return questionsData.questions.map((q) => ({
    id: q.id,
    question: q.question,
    questionType: "MULTIPLE_CHOICE",
    category: q.category,
    options: Object.values(q.options),
  }));
}

/**
 * @deprecated Use POST /api/aptitude/grade which handles atomic multi-section grading, deterministic orbit, and telemetry logs.
 */
export async function submitAptitudeTest(_userAnswers: Record<string, number | string>) {
  throw new Error("Deprecated: Please submit diagnostic answers via POST /api/aptitude/grade for full curriculum calibration.");
}
