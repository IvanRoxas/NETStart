"use server";

import { requireSuperAdmin } from "@/app/admin/actions";
import { prisma } from "@/lib/auth";
import { logSystemAction } from "@/lib/logger";
import {
  ensureDefaultAptitudeQuestionsInDb,
  categoryToDbCategory,
} from "@/lib/aptitudeQuestionsHelper";
import questionsData from "@/server/data/aptitude_questions.server.json";

export interface CanonicalQuestion {
  id: string;
  category: string;
  subcategory: string;
  number: number;
  title: string;
  question: string;
  options: Record<string, string>;
  answer: string;
  concept: string;
  explanation: string;
}

export interface CanonicalSubcategory {
  id: string;
  name: string;
}

export interface CanonicalQuestionsData {
  test: string;
  totalQuestions: number;
  subcategories: Record<string, CanonicalSubcategory>;
  questions: CanonicalQuestion[];
  canUndo?: boolean;
  historyCount?: number;
  isAiGenerated?: boolean;
}

export async function getCanonicalAptitudeQuestions(): Promise<CanonicalQuestionsData> {
  await requireSuperAdmin();

  try {
    const historyCount = await prisma.aptitudeQuestionHistory.count();
    const canUndo = historyCount > 0;

    // If an undo snapshot is present, query active AI questions from DB
    if (canUndo) {
      const activeDbQuestions = await prisma.aptitudeQuestion.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      });

      if (activeDbQuestions.length > 0) {
        const letterMap = ["A", "B", "C", "D"];
        const codingSubs = ["web_dev", "cpp", "python", "java"];

        const mappedQuestions: CanonicalQuestion[] = activeDbQuestions.map((q, idx) => {
          let opts: Record<string, string> = {};
          const rawOpts = Array.isArray(q.options) ? q.options : [];
          if (rawOpts.length > 0) {
            rawOpts.forEach((opt: any, optIdx: number) => {
              opts[letterMap[optIdx] || `Opt${optIdx}`] = String(opt);
            });
          } else if (q.questionType === "TRUE_FALSE") {
            opts = { A: "True", B: "False" };
          } else if (q.questionType === "SHORT_ANSWER") {
            opts = { A: q.shortAnswer || "Answer" };
          }

          const cat = (q.category || "LOGIC").toUpperCase();
          let subcat = "task_decomposition";
          if (cat.includes("PATTERN")) {
            subcat = "pattern_recognition";
          } else if (cat.includes("CODING")) {
            subcat = codingSubs[idx % codingSubs.length];
          } else {
            subcat = "task_decomposition";
          }

          return {
            id: q.id,
            category: q.category,
            subcategory: subcat,
            number: idx + 1,
            title: `AI Diagnostic #${idx + 1} (${q.category})`,
            question: q.question,
            options: opts,
            answer: letterMap[q.correctAnswer ?? 0] || "A",
            concept: q.category,
            explanation: q.explanation || "AI-generated diagnostic question.",
          };
        });

        return {
          test: "Cognitive Aptitude Diagnostic (AI-Generated Session)",
          totalQuestions: mappedQuestions.length,
          subcategories: questionsData.subcategories as Record<string, CanonicalSubcategory>,
          questions: mappedQuestions,
          canUndo: true,
          historyCount,
          isAiGenerated: true,
        };
      }
    }
  } catch (err) {
    console.error("Error checking history in getCanonicalAptitudeQuestions:", err);
  }

  // Fallback to canonical JSON
  return {
    test: questionsData.test,
    totalQuestions: questionsData.totalQuestions,
    subcategories: questionsData.subcategories as Record<string, CanonicalSubcategory>,
    questions: questionsData.questions.map((q) => ({
      id: q.id,
      category: q.category,
      subcategory: (q as any).subcategory || q.category,
      number: q.number,
      title: q.title,
      question: q.question,
      options: q.options,
      answer: q.answer,
      concept: q.concept,
      explanation: q.explanation || "",
    })),
    canUndo: false,
    historyCount: 0,
    isAiGenerated: false,
  };
}

export interface CreateQuestionInput {
  question: string;
  questionType?: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  category: "LOGIC" | "PATTERN" | "CODING_READINESS";
  options?: string[];
  correctAnswer?: number;
  shortAnswer?: string;
  explanation?: string;
}

export async function getAdminAptitudeQuestions() {
  await requireSuperAdmin();

  await ensureDefaultAptitudeQuestionsInDb();

  const questions = await prisma.aptitudeQuestion.findMany({
    orderBy: { createdAt: "desc" },
  });

  return questions.map((q) => ({
    id: q.id,
    question: q.question,
    questionType: q.questionType || "MULTIPLE_CHOICE",
    category: q.category,
    options: Array.isArray(q.options) ? (q.options as string[]) : JSON.parse(q.options as string),
    correctAnswer: q.correctAnswer ?? 0,
    shortAnswer: q.shortAnswer || undefined,
    explanation: q.explanation || undefined,
    isActive: q.isActive,
    createdAt: q.createdAt,
  }));
}

export async function toggleAptitudeQuestionStatus(id: string, isActive: boolean) {
  try {
    const session = await requireSuperAdmin();

    await prisma.aptitudeQuestion.update({
      where: { id },
      data: { isActive },
    });

    await logSystemAction({
      actorId: (session.user as any).id,
      actorRole: "SUPER_ADMIN",
      action: "APTITUDE_QUESTION_TOGGLED",
      details: { questionId: id, isActive },
    });

    return { success: true };
  } catch (err: any) {
    console.error("toggleAptitudeQuestionStatus error:", err);
    return { success: false, error: err?.message || "Failed to toggle question status." };
  }
}

export async function deleteAptitudeQuestion(id: string) {
  try {
    const session = await requireSuperAdmin();

    await prisma.aptitudeQuestion.delete({
      where: { id },
    });

    await logSystemAction({
      actorId: (session.user as any).id,
      actorRole: "SUPER_ADMIN",
      action: "APTITUDE_QUESTION_DELETED",
      details: { questionId: id },
    });

    return { success: true };
  } catch (err: any) {
    console.error("deleteAptitudeQuestion error:", err);
    return { success: false, error: err?.message || "Failed to delete question." };
  }
}

export interface UpdateQuestionInput extends CreateQuestionInput {
  id: string;
}

export async function updateAptitudeQuestion(input: UpdateQuestionInput) {
  try {
    const session = await requireSuperAdmin();

    const qType = input.questionType || "MULTIPLE_CHOICE";
    let finalOpts = input.options || [];

    if (qType === "TRUE_FALSE") {
      finalOpts = ["True", "False"];
    } else if (qType === "SHORT_ANSWER") {
      finalOpts = [];
    }

    const updated = await prisma.aptitudeQuestion.update({
      where: { id: input.id },
      data: {
        question: input.question,
        questionType: qType,
        category: input.category,
        options: finalOpts,
        correctAnswer: input.correctAnswer ?? 0,
        shortAnswer: input.shortAnswer || null,
        explanation: input.explanation || null,
      },
    });

    await logSystemAction({
      actorId: (session.user as any).id,
      actorRole: "SUPER_ADMIN",
      action: "APTITUDE_QUESTION_UPDATED",
      details: { questionId: input.id, category: input.category },
    });

    return { success: true, question: updated };
  } catch (err: any) {
    console.error("updateAptitudeQuestion error:", err);
    return { success: false, error: err?.message || "Failed to update question." };
  }
}

export async function createManualAptitudeQuestion(input: CreateQuestionInput) {
  try {
    const session = await requireSuperAdmin();

    const qType = input.questionType || "MULTIPLE_CHOICE";
    let finalOpts = input.options || [];

    if (qType === "TRUE_FALSE") {
      finalOpts = ["True", "False"];
    } else if (qType === "SHORT_ANSWER") {
      finalOpts = [];
    }

    const newQuestion = await prisma.aptitudeQuestion.create({
      data: {
        question: input.question,
        questionType: qType,
        category: input.category,
        options: finalOpts,
        correctAnswer: input.correctAnswer ?? 0,
        shortAnswer: input.shortAnswer || null,
        explanation: input.explanation || null,
        isActive: true,
      },
    });

    await logSystemAction({
      actorId: (session.user as any).id,
      actorRole: "SUPER_ADMIN",
      action: "APTITUDE_QUESTION_CREATED",
      details: { questionId: newQuestion.id, category: input.category },
    });

    return { success: true, question: newQuestion };
  } catch (err: any) {
    console.error("createManualAptitudeQuestion error:", err);
    return { success: false, error: err?.message || "Failed to create question." };
  }
}

export async function generateAptitudeQuestionsAI(
  categoryFocus: "MIXED" | "LOGIC" | "PATTERN" | "CODING_READINESS" = "MIXED",
  difficulty: "STANDARD" | "STRICT_TECHNICAL" | "BEGINNER" = "STANDARD",
  count: number = 22
): Promise<{
  success: boolean;
  count?: number;
  questions?: any[];
  error?: string;
}> {
  try {
    const session = await requireSuperAdmin();

    const safeCount = Math.min(Math.max(1, Math.floor(count) || 22), 22);
    const apiKey = process.env.GEMINI_API_KEY;

    // STEP 1: Snapshot the current active questions before applying new AI questions
    const currentlyActive = await prisma.aptitudeQuestion.findMany({
      where: { isActive: true },
    });

    await prisma.aptitudeQuestionHistory.create({
      data: {
        actorId: (session.user as any)?.id || "admin",
        description: `Snapshot before generating ${safeCount} questions (${categoryFocus}, ${difficulty})`,
        snapshot: currentlyActive.length > 0 ? (currentlyActive as any) : (questionsData.questions as any),
      },
    });

    let difficultyDirective = "Target standard computer science undergraduate level diagnostic questions.";
    if (difficulty === "STRICT_TECHNICAL") {
      difficultyDirective = "Target rigorous, advanced technical questions testing Big-O analysis, algorithmic recursion, and system architecture.";
    } else if (difficulty === "BEGINNER") {
      difficultyDirective = "Target beginner-friendly algorithmic thinking and logic puzzles suitable for candidates with minimal programming experience.";
    }

    const promptText = `
Act as an expert computer science and cognitive assessment author.
Generate ${safeCount} distinct Aptitude Assessment diagnostic questions for software engineering candidates.
Target category focus: "${categoryFocus}" (Allowed categories: LOGIC, PATTERN, CODING_READINESS).
${difficultyDirective}
Supported question types: "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER".

STRICT REQUIREMENT: Respond ONLY with a valid raw JSON object conforming EXACTLY to this schema with NO markdown wrapping, codeblocks, or extra text:

{
  "questions": [
    {
      "question": "Clear diagnostic question text",
      "questionType": "MULTIPLE_CHOICE",
      "category": "LOGIC",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "shortAnswer": "",
      "explanation": "Brief explanation"
    }
  ]
}
`;

    let generatedItems: CreateQuestionInput[] = [];

    if (apiKey) {
      try {
        const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (response.ok) {
          const resData = await response.json();
          const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanedText);
            if (parsed.questions && Array.isArray(parsed.questions)) {
              generatedItems = parsed.questions;
            }
          }
        }
      } catch (err) {
        console.error("AI Generation API call error:", err);
      }
    }

    // Diverse fallback generator if API key is not set, Gemini fails, or returns fewer items
    if (generatedItems.length < safeCount) {
      const fallbackTemplates: CreateQuestionInput[] = [
        {
          question: "Given a directed acyclic graph (DAG), which algorithm produces a linear ordering of vertices such that for every directed edge (u, v), vertex u comes before v?",
          questionType: "MULTIPLE_CHOICE",
          category: "LOGIC",
          options: ["Topological Sort", "Dijkstra's Algorithm", "Kruskal's Algorithm", "Depth-First Inversion"],
          correctAnswer: 0,
          explanation: "Topological sorting linearly orders vertices in a DAG respecting directed dependencies."
        },
        {
          question: "In Python, what is the time complexity of looking up a key in a standard dictionary with n items on average?",
          questionType: "MULTIPLE_CHOICE",
          category: "CODING_READINESS",
          options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
          correctAnswer: 0,
          explanation: "Python dictionaries use hash tables, achieving average O(1) time complexity for lookups."
        },
        {
          question: "Examine the sequence of binary values: 0001, 0010, 0100, 1000. What is the next logical step in an 8-bit register representation?",
          questionType: "MULTIPLE_CHOICE",
          category: "PATTERN",
          options: ["0001 0000", "0000 0001", "1111 0000", "0011 0000"],
          correctAnswer: 0,
          explanation: "Each step bit-shifts left by 1 position (multiplication by 2)."
        },
        {
          question: "In object-oriented programming, encapsulating internal object state and exposing only approved methods prevents unauthorized mutations.",
          questionType: "TRUE_FALSE",
          category: "CODING_READINESS",
          options: ["True", "False"],
          correctAnswer: 0,
          explanation: "Encapsulation bundles data with accessor methods and restricts direct outside access."
        },
        {
          question: "Which data structure follows the Last-In, First-Out (LIFO) access pattern?",
          questionType: "MULTIPLE_CHOICE",
          category: "LOGIC",
          options: ["Stack", "Queue", "Binary Heap", "Linked List"],
          correctAnswer: 0,
          explanation: "Stacks operate strictly on the LIFO principle where the most recently pushed item is popped first."
        },
        {
          question: "Look at the pattern: 2, 6, 12, 20, 30, ?. What number comes next?",
          questionType: "MULTIPLE_CHOICE",
          category: "PATTERN",
          options: ["42", "40", "44", "36"],
          correctAnswer: 0,
          explanation: "Differences increase by 2: +4, +6, +8, +10, so +12 gives 30 + 12 = 42."
        },
        {
          question: "In modern JavaScript, which keyword declares a constant block-scoped variable that cannot be reassigned?",
          questionType: "SHORT_ANSWER",
          category: "CODING_READINESS",
          options: [],
          correctAnswer: 0,
          shortAnswer: "const",
          explanation: "const declares immutable variable identifiers within block scopes."
        },
        {
          question: "A binary search algorithm requires the input array to be sorted before execution.",
          questionType: "TRUE_FALSE",
          category: "LOGIC",
          options: ["True", "False"],
          correctAnswer: 0,
          explanation: "Binary search relies on order invariants to divide search space in half each step."
        },
        {
          question: "What is the worst-case time complexity of QuickSort when a naive pivot is chosen on an already sorted list?",
          questionType: "MULTIPLE_CHOICE",
          category: "LOGIC",
          options: ["O(n^2)", "O(n log n)", "O(n)", "O(log n)"],
          correctAnswer: 0,
          explanation: "Unbalanced partitions in QuickSort degrade performance to O(n^2)."
        },
        {
          question: "Look at the letter sequence: A, C, F, J, O, ?. Which letter comes next?",
          questionType: "MULTIPLE_CHOICE",
          category: "PATTERN",
          options: ["U", "T", "V", "W"],
          correctAnswer: 0,
          explanation: "Step sizes increase by 1: +2, +3, +4, +5, +6. O (15) + 6 = 21 (U)."
        },
        {
          question: "Which HTTP status code signifies that a requested resource was not found on the server?",
          questionType: "MULTIPLE_CHOICE",
          category: "CODING_READINESS",
          options: ["404", "200", "500", "403"],
          correctAnswer: 0,
          explanation: "HTTP 404 indicates Not Found."
        },
        {
          question: "In C++, dynamic memory allocated via the 'new' operator must be manually freed using which keyword to prevent memory leaks?",
          questionType: "SHORT_ANSWER",
          category: "CODING_READINESS",
          options: [],
          correctAnswer: 0,
          shortAnswer: "delete",
          explanation: "The delete keyword deallocates heap memory in C++."
        },
        {
          question: "Every recursive function must have at least one base case to prevent infinite recursion and stack overflow.",
          questionType: "TRUE_FALSE",
          category: "LOGIC",
          options: ["True", "False"],
          correctAnswer: 0,
          explanation: "Base cases terminate recursion."
        },
        {
          question: "Identify the missing value in the matrix sequence: [1, 2], [4, 8], [16, 32], [64, ?].",
          questionType: "MULTIPLE_CHOICE",
          category: "PATTERN",
          options: ["128", "256", "96", "100"],
          correctAnswer: 0,
          explanation: "Each element is multiplied by 2 sequentially."
        },
        {
          question: "Which of the following sorting algorithms offers guaranteed O(n log n) time complexity in worst, average, and best cases?",
          questionType: "MULTIPLE_CHOICE",
          category: "LOGIC",
          options: ["Merge Sort", "Quick Sort", "Bubble Sort", "Insertion Sort"],
          correctAnswer: 0,
          explanation: "Merge Sort consistently divides and merges arrays in O(n log n) time."
        },
        {
          question: "In relational databases, which SQL constraint ensures all values in a column are distinct?",
          questionType: "MULTIPLE_CHOICE",
          category: "CODING_READINESS",
          options: ["UNIQUE", "NOT NULL", "CHECK", "DEFAULT"],
          correctAnswer: 0,
          explanation: "UNIQUE enforces non-duplicate values."
        },
        {
          question: "Consider sequence: 1, 1, 2, 3, 5, 8, 13, ?. What is the next Fibonacci number?",
          questionType: "MULTIPLE_CHOICE",
          category: "PATTERN",
          options: ["21", "19", "20", "24"],
          correctAnswer: 0,
          explanation: "Fibonacci sum: 8 + 13 = 21."
        },
        {
          question: "A hash collision occurs when two different keys generate the same hash index in a hash map.",
          questionType: "TRUE_FALSE",
          category: "LOGIC",
          options: ["True", "False"],
          correctAnswer: 0,
          explanation: "Hash collisions occur when distinct inputs map to identical hash table slots."
        },
        {
          question: "Which protocol is the standard transport-layer protocol providing reliable, connection-oriented packet delivery?",
          questionType: "MULTIPLE_CHOICE",
          category: "CODING_READINESS",
          options: ["TCP", "UDP", "ICMP", "IP"],
          correctAnswer: 0,
          explanation: "Transmission Control Protocol (TCP) ensures guaranteed packet delivery and handshake ordering."
        },
        {
          question: "Look at the pattern: 100, 96, 88, 76, 60, ?. What number comes next?",
          questionType: "MULTIPLE_CHOICE",
          category: "PATTERN",
          options: ["40", "44", "48", "36"],
          correctAnswer: 0,
          explanation: "Decrements increase: -4, -8, -12, -16, so next is -20 -> 60 - 20 = 40."
        },
        {
          question: "In Python, lists are immutable while tuples are mutable.",
          questionType: "TRUE_FALSE",
          category: "CODING_READINESS",
          options: ["True", "False"],
          correctAnswer: 1,
          explanation: "False: Lists are mutable, whereas tuples are immutable."
        },
        {
          question: "Which design pattern restricts the instantiation of a class to one single instance across an entire application?",
          questionType: "MULTIPLE_CHOICE",
          category: "LOGIC",
          options: ["Singleton", "Factory", "Observer", "Decorator"],
          correctAnswer: 0,
          explanation: "Singleton pattern restricts a class to a single global instance."
        }
      ];

      for (const item of fallbackTemplates) {
        if (generatedItems.length >= safeCount) break;
        const cat = categoryFocus === "MIXED" ? item.category : categoryFocus;
        generatedItems.push({
          ...item,
          category: cat as "LOGIC" | "PATTERN" | "CODING_READINESS",
        });
      }
    }

    // STEP 2: Deactivate previous active questions
    await prisma.aptitudeQuestion.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // STEP 3: Insert newly generated questions
    const createdQuestions = [];
    for (const item of generatedItems.slice(0, safeCount)) {
      const qType = item.questionType || "MULTIPLE_CHOICE";
      let opts = item.options || [];
      if (qType === "TRUE_FALSE") opts = ["True", "False"];
      if (qType === "SHORT_ANSWER") opts = [];

      const q = await prisma.aptitudeQuestion.create({
        data: {
          question: item.question,
          questionType: qType,
          category: item.category || (categoryFocus === "MIXED" ? "LOGIC" : categoryFocus),
          options: opts,
          correctAnswer: typeof item.correctAnswer === "number" ? item.correctAnswer : 0,
          shortAnswer: item.shortAnswer || null,
          explanation: item.explanation || "AI Generated Diagnostic Question",
          isActive: true,
        },
      });
      createdQuestions.push(q);
    }

    await logSystemAction({
      actorId: (session.user as any).id,
      actorRole: "SUPER_ADMIN",
      action: "APTITUDE_QUESTIONS_AI_GENERATED",
      details: { count: createdQuestions.length, categoryFocus, difficulty },
    });

    return {
      success: true,
      count: createdQuestions.length,
      questions: createdQuestions,
    };
  } catch (err: any) {
    console.error("AI Generation error:", err);
    return {
      success: false,
      error: err?.message || "Failed to generate AI aptitude questions.",
    };
  }
}

export async function revertAptitudeQuestionsAI(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  restoredCount?: number;
}> {
  try {
    const session = await requireSuperAdmin();

    // Query the latest history snapshot
    const latestHistory = await prisma.aptitudeQuestionHistory.findFirst({
      orderBy: { createdAt: "desc" },
    });

    // Deactivate current active questions
    await prisma.aptitudeQuestion.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    let restoredCount = 0;

    if (latestHistory && latestHistory.snapshot) {
      const snapshotData = latestHistory.snapshot as any;
      if (Array.isArray(snapshotData)) {
        for (const item of snapshotData) {
          if (item.id) {
            if (item.options && typeof item.options === "object" && !Array.isArray(item.options)) {
              // Canonical JSON format
              const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
              const optsArray = [item.options.A, item.options.B, item.options.C, item.options.D].filter(Boolean);
              const correctIdx = letterMap[item.answer?.trim().toUpperCase()] ?? 0;
              await prisma.aptitudeQuestion.upsert({
                where: { id: item.id },
                update: {
                  question: item.question,
                  questionType: "MULTIPLE_CHOICE",
                  category: categoryToDbCategory(item.category),
                  options: optsArray,
                  correctAnswer: correctIdx,
                  explanation: item.explanation || null,
                  isActive: true,
                },
                create: {
                  id: item.id,
                  question: item.question,
                  questionType: "MULTIPLE_CHOICE",
                  category: categoryToDbCategory(item.category),
                  options: optsArray,
                  correctAnswer: correctIdx,
                  explanation: item.explanation || null,
                  isActive: true,
                },
              });
            } else {
              // DB AptitudeQuestion model format
              await prisma.aptitudeQuestion.upsert({
                where: { id: item.id },
                update: {
                  question: item.question,
                  questionType: item.questionType || "MULTIPLE_CHOICE",
                  category: item.category,
                  options: Array.isArray(item.options) ? item.options : [],
                  correctAnswer: item.correctAnswer ?? 0,
                  shortAnswer: item.shortAnswer || null,
                  explanation: item.explanation || null,
                  isActive: true,
                },
                create: {
                  id: item.id,
                  question: item.question,
                  questionType: item.questionType || "MULTIPLE_CHOICE",
                  category: item.category,
                  options: Array.isArray(item.options) ? item.options : [],
                  correctAnswer: item.correctAnswer ?? 0,
                  shortAnswer: item.shortAnswer || null,
                  explanation: item.explanation || null,
                  isActive: true,
                },
              });
            }
            restoredCount++;
          }
        }
      }
    }

    // If snapshot was empty or not found, fall back to canonical JSON questions
    if (restoredCount === 0) {
      await ensureDefaultAptitudeQuestionsInDb();
      restoredCount = questionsData.questions.length;
    }

    // Clear history stack
    await prisma.aptitudeQuestionHistory.deleteMany({});

    await logSystemAction({
      actorId: (session.user as any).id,
      actorRole: "SUPER_ADMIN",
      action: "APTITUDE_QUESTIONS_REVERTED",
      details: { restoredCount },
    });

    return {
      success: true,
      message: `Successfully reverted question bank to canonical set (${restoredCount} questions restored).`,
      restoredCount,
    };
  } catch (err: any) {
    console.error("Failed to revert aptitude questions:", err);
    return {
      success: false,
      error: err?.message || "Failed to revert aptitude questions.",
    };
  }
}
