import { prisma } from "@/lib/auth";
import questionsData from "@/server/data/aptitude_questions.server.json";
import { AptitudeCategory, ClientAptitudeQuestion } from "@/types/aptitude";

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

export async function ensureDefaultAptitudeQuestionsInDb() {
  try {
    const existingCount = await prisma.aptitudeQuestion.count();
    if (existingCount > 0) return;

    console.log("[APTITUDE] Auto-seeding default questions into database...");
    const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

    for (const q of questionsData.questions) {
      const optsArray = [q.options.A, q.options.B, q.options.C, q.options.D].filter(Boolean);
      const correctIdx = letterMap[q.answer?.trim().toUpperCase()] ?? 0;

      await prisma.aptitudeQuestion.create({
        data: {
          id: q.id,
          question: q.question,
          questionType: "MULTIPLE_CHOICE",
          category: categoryToDbCategory(q.category),
          options: optsArray,
          correctAnswer: correctIdx,
          explanation: q.explanation || null,
          isActive: true
        }
      });
    }
  } catch (err) {
    console.warn("[APTITUDE] Could not auto-seed default questions into DB:", err);
  }
}

export const MIN_DB_QUESTIONS = 15;

export interface StudentQuestion {
  id: string;
  category: AptitudeCategory;
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
  if (typeof q.correctAnswer !== "number" || !Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer >= 4) {
    return false;
  }

  return true;
}

export async function getStudentQuestionSet(): Promise<{
  questions: StudentQuestion[];
  source: "database" | "json";
}> {
  try {
    const dbQuestions = await prisma.aptitudeQuestion.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" }
    });

    const validQuestions = dbQuestions.filter(isStudentRenderableQuestion);

    if (validQuestions.length >= MIN_DB_QUESTIONS) {
      const letters = ["A", "B", "C", "D"];
      const studentQuestions: StudentQuestion[] = validQuestions.map((q, idx) => {
        const optsRecord: Record<string, string> = {};
        const optsArray = Array.isArray(q.options)
          ? (q.options as string[])
          : (JSON.parse(q.options as string) as string[]);

        optsArray.forEach((opt, oIdx) => {
          const letter = letters[oIdx] || String(oIdx + 1);
          optsRecord[letter] = String(opt);
        });

        return {
          id: q.id,
          category: normalizeAptitudeCategory(q.category),
          number: idx + 1,
          title: q.question.length > 40 ? q.question.slice(0, 37) + "..." : q.question,
          question: q.question,
          options: optsRecord,
          answer: letters[q.correctAnswer ?? 0] || "A",
          concept: q.explanation || `${q.category} Reasoning`,
        };
      });

      return { questions: studentQuestions, source: "database" };
    }
  } catch (err) {
    console.warn("[APTITUDE] Failed to load questions from database, falling back to static json:", err);
  }

  // Fallback to static JSON file
  const fallbackQuestions: StudentQuestion[] = questionsData.questions.map((q) => ({
    id: q.id,
    category: q.category as AptitudeCategory,
    number: q.number,
    title: q.title,
    question: q.question,
    options: q.options,
    answer: q.answer,
    concept: q.concept,
  }));

  return { questions: fallbackQuestions, source: "json" };
}

export async function getActiveClientQuestions(): Promise<{
  questions: ClientAptitudeQuestion[];
  source: "database" | "json";
}> {
  const { questions, source } = await getStudentQuestionSet();
  const clientQuestions: ClientAptitudeQuestion[] = questions.map((q) => ({
    id: q.id,
    category: q.category,
    number: q.number,
    title: q.title,
    question: q.question,
    options: q.options,
  }));

  return { questions: clientQuestions, source };
}

