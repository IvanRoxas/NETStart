"use server";

import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { addXPAndCheckLevelUp } from "@/lib/xp";
import { logSystemAction } from "@/lib/logger";

export interface AptitudeQuestionData {
  id: string;
  question: string;
  questionType: string;
  category: string; // LOGIC, PATTERN, CODING_READINESS
  options: string[];
  shortAnswer?: string;
  explanation?: string;
}

export async function seedDefaultAptitudeQuestions() {
  const existingCount = await prisma.aptitudeQuestion.count();
  if (existingCount > 0) return;

  const defaultQuestions = [
    {
      question: "Which pattern correctly completes the sequence: 2, 4, 8, 16, 32, ___?",
      questionType: "MULTIPLE_CHOICE",
      category: "PATTERN",
      options: ["48", "64", "128", "36"],
      correctAnswer: 1,
      explanation: "Each number is multiplied by 2 (doubling sequence)."
    },
    {
      question: "If all Explorers are Coders, and some Coders are Pilots, which of the following MUST be true?",
      questionType: "MULTIPLE_CHOICE",
      category: "LOGIC",
      options: [
        "All Pilots are Explorers",
        "Some Coders are Explorers",
        "No Explorers are Pilots",
        "All Coders are Explorers"
      ],
      correctAnswer: 1,
      explanation: "Since all Explorers are Coders, any Explorer is a Coder, which means some Coders are definitely Explorers."
    },
    {
      question: "In binary search trees, the left child node key is always less than its parent node key.",
      questionType: "TRUE_FALSE",
      category: "LOGIC",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "By BST invariant definition, left subtree keys are smaller than root."
    },
    {
      question: "What keyword is used in JavaScript to declare an immutable constant variable?",
      questionType: "SHORT_ANSWER",
      category: "CODING_READINESS",
      options: [],
      correctAnswer: 0,
      shortAnswer: "const",
      explanation: "const declares block-scoped immutable references."
    },
    {
      question: "A data packet travels through 3 network nodes: Node A doubles signal, Node B subtracts 5, Node C squares result. If input is 7, what is output?",
      questionType: "MULTIPLE_CHOICE",
      category: "LOGIC",
      options: ["81", "49", "64", "100"],
      correctAnswer: 0,
      explanation: "Node A: 7 * 2 = 14. Node B: 14 - 5 = 9. Node C: 9^2 = 81."
    }
  ];

  for (const q of defaultQuestions) {
    await prisma.aptitudeQuestion.create({
      data: {
        question: q.question,
        questionType: q.questionType,
        category: q.category,
        options: q.options,
        correctAnswer: q.correctAnswer,
        shortAnswer: q.shortAnswer || null,
        explanation: q.explanation,
        isActive: true,
      }
    });
  }
}

export async function getAptitudeQuestions(): Promise<AptitudeQuestionData[]> {
  await seedDefaultAptitudeQuestions();

  const questions = await prisma.aptitudeQuestion.findMany({
    where: { isActive: true },
    select: {
      id: true,
      question: true,
      questionType: true,
      category: true,
      options: true,
      shortAnswer: true,
      explanation: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return questions.map(q => ({
    id: q.id,
    question: q.question,
    questionType: q.questionType || "MULTIPLE_CHOICE",
    category: q.category,
    options: Array.isArray(q.options) ? (q.options as string[]) : JSON.parse(q.options as string),
    shortAnswer: q.shortAnswer || undefined,
    explanation: q.explanation || undefined,
  }));
}

export async function submitAptitudeTest(userAnswers: Record<string, number | string>) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const dbQuestions = await prisma.aptitudeQuestion.findMany({
    where: { isActive: true },
    select: {
      id: true,
      questionType: true,
      category: true,
      correctAnswer: true,
      shortAnswer: true,
    }
  });

  let logicCorrect = 0;
  let logicTotal = 0;
  let patternCorrect = 0;
  let patternTotal = 0;
  let totalScore = 0;

  dbQuestions.forEach((q) => {
    const rawAnswer = userAnswers[q.id];
    let isCorrect = false;

    if (q.questionType === "SHORT_ANSWER") {
      const userText = (rawAnswer ?? "").toString().trim().toLowerCase();
      const expectedText = (q.shortAnswer ?? "").trim().toLowerCase();
      isCorrect = userText.length > 0 && (userText === expectedText || expectedText.includes(userText));
    } else {
      isCorrect = Number(rawAnswer) === q.correctAnswer;
    }

    if (q.category === "LOGIC" || q.category === "CODING_READINESS") {
      logicTotal++;
      if (isCorrect) logicCorrect++;
    } else if (q.category === "PATTERN") {
      patternTotal++;
      if (isCorrect) patternCorrect++;
    }

    if (isCorrect) totalScore++;
  });

  const logicScore = logicTotal > 0 ? Math.round((logicCorrect / logicTotal) * 100) : 80;
  const patternRecognitionScore = patternTotal > 0 ? Math.round((patternCorrect / patternTotal) * 100) : 85;

  let recommendedLearningPath = "Fullstack Web & Distributed Systems";
  if (logicScore >= 80 && patternRecognitionScore >= 80) {
    recommendedLearningPath = "Fullstack Systems & Advanced Architecture (HTML/CSS/JS/React/Node)";
  } else if (logicScore >= 70) {
    recommendedLearningPath = "Frontend Engineering & Component Architecture (HTML/CSS/JS)";
  } else {
    recommendedLearningPath = "Foundational Logic & Interactive Web Technologies";
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        hasTakenAptitudeTest: true,
        logicScore,
        patternRecognitionScore,
        recommendedLearningPath,
        gears: { increment: 50 },
      }
    });

    await tx.notification.create({
      data: {
        userId,
        notificationType: "aptitude_completed",
        data: {
          title: "Aptitude Test Ready",
          message: "Your aptitude test is ready! Check it out to see your recommended learning path.",
          logicScore,
          patternRecognitionScore,
        }
      }
    });
  });

  await addXPAndCheckLevelUp(userId, 150);

  await logSystemAction({
    actorId: userId,
    actorRole: "STUDENT",
    action: "APTITUDE_TEST_COMPLETED",
    targetUserId: userId,
    details: {
      logicScore,
      patternRecognitionScore,
      recommendedLearningPath,
      xpAwarded: 150,
      gearsAwarded: 50,
    }
  });

  return {
    success: true,
    logicScore,
    patternRecognitionScore,
    recommendedLearningPath,
    xpAwarded: 150,
    gearsAwarded: 50,
  };
}
