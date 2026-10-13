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

export async function getActiveClientQuestions(): Promise<{
  questions: ClientAptitudeQuestion[];
  source: "database" | "json";
}> {
  try {
    let dbQuestions = await prisma.aptitudeQuestion.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" }
    });

    if (dbQuestions.length === 0) {
      await ensureDefaultAptitudeQuestionsInDb();
      dbQuestions = await prisma.aptitudeQuestion.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "asc" }
      });
    }

    if (dbQuestions.length > 0) {
      const clientQuestions: ClientAptitudeQuestion[] = dbQuestions.map((q, idx) => {
        let optsRecord: Record<string, string> = {};
        if (Array.isArray(q.options)) {
          const letters = ["A", "B", "C", "D", "E", "F"];
          (q.options as string[]).forEach((opt, oIdx) => {
            const letter = letters[oIdx] || String(oIdx + 1);
            optsRecord[letter] = String(opt);
          });
        } else if (q.options && typeof q.options === "object") {
          optsRecord = q.options as Record<string, string>;
        }

        return {
          id: q.id,
          category: normalizeAptitudeCategory(q.category),
          number: idx + 1,
          title: q.question.length > 40 ? q.question.slice(0, 37) + "..." : q.question,
          question: q.question,
          options: optsRecord
        };
      });

      return { questions: clientQuestions, source: "database" };
    }
  } catch (err) {
    console.warn("[APTITUDE] Failed to load questions from database, falling back to static json:", err);
  }

  // Fallback to static JSON file
  const fallbackQuestions: ClientAptitudeQuestion[] = questionsData.questions.map((q) => ({
    id: q.id,
    category: q.category as AptitudeCategory,
    number: q.number,
    title: q.title,
    question: q.question,
    options: q.options,
  }));

  return { questions: fallbackQuestions, source: "json" };
}
