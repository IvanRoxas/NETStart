import { prisma } from "@/lib/auth";
import questionsData from "@/server/data/aptitude_questions.server.json";
import { AptitudeCategory, ClientAptitudeQuestion } from "@/types/aptitude";
import { getSectionTotals, getLegacyCategoryTotals } from "./aptitudeTotals";

export { getSectionTotals, getLegacyCategoryTotals };

export function normalizeAptitudeCategory(cat: string): AptitudeCategory {
  const c = (cat || "").toLowerCase();
  if (c.includes("pattern")) return "pattern_recognition";
  if (c.includes("task") || c.includes("coding") || c.includes("readiness") || c.includes("decomp")) return "task_decomposition";
  return "logical_reasoning";
}

export function categoryToDbCategory(cat: string): "LOGIC" | "PATTERN" | "CODING_READINESS" {
  const norm = normalizeAptitudeCategory(cat);
  if (norm === "pattern_recognition") return "PATTERN";
  if (norm === "task_decomposition") return "CODING_READINESS";
  return "LOGIC";
}

let syncInitiated = false;

export async function ensureDefaultAptitudeQuestionsInDb() {
  try {
    const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
    const canonicalIds = questionsData.questions.map((q) => q.id);

    for (const q of questionsData.questions) {
      const optsArray = [q.options.A, q.options.B, q.options.C, q.options.D].filter(Boolean);
      const correctIdx = letterMap[q.answer?.trim().toUpperCase()] ?? 0;

      await prisma.aptitudeQuestion.upsert({
        where: { id: q.id },
        update: {
          question: q.question,
          questionType: "MULTIPLE_CHOICE",
          category: categoryToDbCategory(q.category),
          options: optsArray,
          correctAnswer: correctIdx,
          explanation: q.explanation || null,
          isActive: true,
        },
        create: {
          id: q.id,
          question: q.question,
          questionType: "MULTIPLE_CHOICE",
          category: categoryToDbCategory(q.category),
          options: optsArray,
          correctAnswer: correctIdx,
          explanation: q.explanation || null,
          isActive: true,
        },
      });
    }

    // Auto-deactivate legacy questions that are not part of canonical questions
    await prisma.aptitudeQuestion.updateMany({
      where: {
        id: { notIn: canonicalIds },
        isActive: true,
      },
      data: { isActive: false },
    });
  } catch (err) {
    console.warn("[APTITUDE] Auto-sync of default questions into DB caught warning:", err);
  }
}

export const MIN_DB_QUESTIONS = getSectionTotals().total;

export interface StudentQuestion {
  id: string;
  category: AptitudeCategory;
  subcategory?: string;
  number: number;
  title: string;
  question: string;
  options: Record<string, string>;
  answer: string;
  concept: string;
}

export function isStudentRenderableQuestion(q: any): boolean {
  if (!q) return false;
  const qType = (q.questionType || "MULTIPLE_CHOICE").toUpperCase();
  if (qType !== "MULTIPLE_CHOICE") return false;

  let opts: any[] = [];
  if (Array.isArray(q.options)) {
    opts = q.options;
  } else if (typeof q.options === "string") {
    try {
      const parsed = JSON.parse(q.options);
      if (Array.isArray(parsed)) opts = parsed;
    } catch {
      return false;
    }
  } else {
    return false;
  }

  if (opts.length !== 4) return false;
  if (
    typeof q.correctAnswer !== "number" ||
    !Number.isInteger(q.correctAnswer) ||
    q.correctAnswer < 0 ||
    q.correctAnswer >= 4
  ) {
    return false;
  }

  return true;
}

export async function getStudentQuestionSet(): Promise<{
  questions: StudentQuestion[];
  source: "database" | "json";
}> {
  // Trigger background auto-sync to DB so Admin panel remains consistent with canonical JSON
  if (!syncInitiated) {
    syncInitiated = true;
    ensureDefaultAptitudeQuestionsInDb().catch((err) => {
      console.warn("[APTITUDE] Background DB auto-sync error:", err);
    });
  }

  // Canonical JSON is the Single Source of Truth
  const canonicalQuestions: StudentQuestion[] = questionsData.questions.map((q) => ({
    id: q.id,
    category: q.category as AptitudeCategory,
    subcategory: (q as any).subcategory || q.category,
    number: q.number,
    title: q.title,
    question: q.question,
    options: q.options,
    answer: q.answer,
    concept: q.concept,
  }));

  return { questions: canonicalQuestions, source: "json" };
}

export async function getActiveClientQuestions(): Promise<{
  questions: ClientAptitudeQuestion[];
  source: "database" | "json";
}> {
  const { questions, source } = await getStudentQuestionSet();
  const clientQuestions: ClientAptitudeQuestion[] = questions.map((q) => ({
    id: q.id,
    category: q.category,
    subcategory: q.subcategory,
    number: q.number,
    title: q.title,
    question: q.question,
    options: q.options,
  }));

  return { questions: clientQuestions, source };
}
