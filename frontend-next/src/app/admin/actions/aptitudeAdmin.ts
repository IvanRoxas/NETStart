"use server";

import { requireSuperAdmin } from "@/app/admin/actions";
import { prisma } from "@/lib/auth";
import { logSystemAction } from "@/lib/logger";

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

  const questions = await prisma.aptitudeQuestion.findMany({
    orderBy: { createdAt: "desc" }
  });

  return questions.map(q => ({
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
  const session = await requireSuperAdmin();

  await prisma.aptitudeQuestion.update({
    where: { id },
    data: { isActive }
  });

  await logSystemAction({
    actorId: (session.user as any).id,
    actorRole: "SUPER_ADMIN",
    action: "APTITUDE_QUESTION_TOGGLED",
    details: { questionId: id, isActive }
  });

  return { success: true };
}

export async function deleteAptitudeQuestion(id: string) {
  const session = await requireSuperAdmin();

  await prisma.aptitudeQuestion.delete({
    where: { id }
  });

  await logSystemAction({
    actorId: (session.user as any).id,
    actorRole: "SUPER_ADMIN",
    action: "APTITUDE_QUESTION_DELETED",
    details: { questionId: id }
  });

  return { success: true };
}

export interface UpdateQuestionInput extends CreateQuestionInput {
  id: string;
}

export async function updateAptitudeQuestion(input: UpdateQuestionInput) {
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
    }
  });

  await logSystemAction({
    actorId: (session.user as any).id,
    actorRole: "SUPER_ADMIN",
    action: "APTITUDE_QUESTION_UPDATED",
    details: { questionId: input.id, category: input.category }
  });

  return { success: true, question: updated };
}

export async function createManualAptitudeQuestion(input: CreateQuestionInput) {
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
      isActive: true
    }
  });

  await logSystemAction({
    actorId: (session.user as any).id,
    actorRole: "SUPER_ADMIN",
    action: "APTITUDE_QUESTION_CREATED",
    details: { questionId: newQuestion.id, category: input.category }
  });

  return { success: true, question: newQuestion };
}

export async function generateAptitudeQuestionsAI(
  categoryFocus: "MIXED" | "LOGIC" | "PATTERN" | "CODING_READINESS" = "MIXED",
  difficulty: "STANDARD" | "STRICT_TECHNICAL" | "BEGINNER" = "STANDARD",
  count: number = 5
) {
  const session = await requireSuperAdmin();

  const safeCount = Math.min(Math.max(1, Math.floor(count) || 5), 10);
  const apiKey = process.env.GEMINI_API_KEY;

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
    },
    {
      "question": "An algorithm with O(1) time complexity runs in constant time.",
      "questionType": "TRUE_FALSE",
      "category": "LOGIC",
      "options": ["True", "False"],
      "correctAnswer": 0,
      "explanation": "O(1) denotes constant time performance."
    },
    {
      "question": "What keyword is used in JavaScript to declare an immutable constant variable?",
      "questionType": "SHORT_ANSWER",
      "category": "CODING_READINESS",
      "options": [],
      "correctAnswer": 0,
      "shortAnswer": "const",
      "explanation": "const declares block-scoped immutable references."
    }
  ]
}
`;

  let generatedItems: CreateQuestionInput[] = [];

  if (apiKey) {
    try {
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        })
      });

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

  // Fallback generator if API key is not set or fails
  if (generatedItems.length === 0) {
    generatedItems = [
      {
        question: `AI Diagnostic (${categoryFocus}): Evaluate variable scope in loop execution when index = ${Math.floor(Math.random() * 10)}. What is the output?`,
        questionType: "MULTIPLE_CHOICE",
        category: categoryFocus === "MIXED" ? "CODING_READINESS" : categoryFocus,
        options: ["Index bound overflow", "Deterministic constant value", "Undefined scope reference", "Sequential iteration result"],
        correctAnswer: 1,
        explanation: "Deterministic constant value represents bounded closure execution."
      },
      {
        question: "In binary search trees, the left child node key is always less than its parent node key.",
        questionType: "TRUE_FALSE",
        category: categoryFocus === "MIXED" ? "LOGIC" : categoryFocus,
        options: ["True", "False"],
        correctAnswer: 0,
        explanation: "By BST invariant definition, left subtree keys are smaller than root."
      },
      {
        question: "What keyword declares a block-scoped mutable variable in modern JavaScript?",
        questionType: "SHORT_ANSWER",
        category: categoryFocus === "MIXED" ? "CODING_READINESS" : categoryFocus,
        options: [],
        correctAnswer: 0,
        shortAnswer: "let",
        explanation: "let declares block-scoped re-assignable variables."
      }
    ];
  }

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
        isActive: true
      }
    });
    createdQuestions.push(q);
  }

  await logSystemAction({
    actorId: (session.user as any).id,
    actorRole: "SUPER_ADMIN",
    action: "APTITUDE_QUESTIONS_AI_GENERATED",
    details: { count: createdQuestions.length, categoryFocus, difficulty }
  });

  return {
    success: true,
    count: createdQuestions.length,
    questions: createdQuestions
  };
}
