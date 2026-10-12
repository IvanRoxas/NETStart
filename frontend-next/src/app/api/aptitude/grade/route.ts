import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { addXPAndCheckLevelUp } from "@/lib/xp";
import { logSystemAction } from "@/lib/logger";
import questionsData from "@/server/data/aptitude_questions.server.json";
import { generateStructuredResponse } from "@/ai/client";
import { aptitudeSchema } from "@/ai/schemas/aptitudeSchema";
import { getAptitudePrompt, getAptitudeFallback } from "@/ai/prompts/aptitude";
import { NOVA_SYSTEM_INSTRUCTION } from "@/ai/prompts/shared";
import { mockAptitudeResponse } from "@/ai/mock";
import { processAIPathResponse } from "@/ai/pathUtils";
import {
  AptitudeCategory,
  AptitudeTestResult,
  CategoryScore,
  CategorySummary,
  MissedQuestionItem,
  AptitudeAIContext,
} from "@/types/aptitude";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const rawAnswers = body.answers || body;
    
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasTakenAptitudeTest: true, isFallback: true, pathOrder: true, logicScore: true, patternRecognitionScore: true, taskDecompositionScore: true, aptitudeResult: true }
    });

    let isRegenerating = false;

    if (dbUser?.hasTakenAptitudeTest) {
      if (!dbUser.isFallback && dbUser.pathOrder && dbUser.pathOrder.length > 0) {
        return NextResponse.json(
          { success: false, message: "You have already completed the aptitude test and have a valid path." },
          { status: 400 }
        );
      }
      if (dbUser.isFallback) {
        isRegenerating = true;
      }
    }

    if (!isRegenerating && (!rawAnswers || typeof rawAnswers !== "object")) {
      return NextResponse.json(
        { success: false, message: "Invalid payload format. Expected answers object." },
        { status: 400 }
      );
    }

    const masterQuestions = questionsData.questions;
    
    let aiContext: AptitudeAIContext;
    let baseResult: any = dbUser?.aptitudeResult;

    if (!isRegenerating) {
      const categoryTotals: Record<AptitudeCategory, { correct: number; total: number }> = {
        pattern_recognition: { correct: 0, total: 0 },
        task_decomposition: { correct: 0, total: 0 },
        logical_reasoning: { correct: 0, total: 0 },
      };

      const missed: MissedQuestionItem[] = [];
      const validChoices = new Set(["A", "B", "C", "D"]);

      // Validate that all 15 questions are answered
      for (const q of masterQuestions) {
        const chosen = rawAnswers[q.id];
        if (!chosen || typeof chosen !== "string" || !validChoices.has(chosen.trim().toUpperCase())) {
          return NextResponse.json(
            {
              success: false,
              message: `Missing or invalid option selected for question ${q.number} (${q.id}). All 15 questions must be answered.`,
            },
            { status: 422 }
          );
        }
      }

      // Local Algorithmic Grading
      let totalCorrect = 0;

      masterQuestions.forEach((q) => {
        const cat = q.category as AptitudeCategory;
        const userChoice = String(rawAnswers[q.id]).trim().toUpperCase();
        const isCorrect = userChoice === q.answer.trim().toUpperCase();

        categoryTotals[cat].total += 1;

        if (isCorrect) {
          categoryTotals[cat].correct += 1;
          totalCorrect += 1;
        } else {
          missed.push({
            id: q.id,
            chosenOption: userChoice,
            concept: q.concept,
          });
        }
      });

      const totalQuestions = masterQuestions.length; // 15
      const totalPercent = Math.round((totalCorrect / totalQuestions) * 100);

      const categoriesFormatted: AptitudeTestResult["categories"] = {
        pattern_recognition: {
          category: "pattern_recognition",
          name: "Pattern Recognition",
          correct: categoryTotals.pattern_recognition.correct,
          total: categoryTotals.pattern_recognition.total,
          percent: Math.round(
            (categoryTotals.pattern_recognition.correct / categoryTotals.pattern_recognition.total) * 100
          ),
        },
        task_decomposition: {
          category: "task_decomposition",
          name: "Task Decomposition",
          correct: categoryTotals.task_decomposition.correct,
          total: categoryTotals.task_decomposition.total,
          percent: Math.round(
            (categoryTotals.task_decomposition.correct / categoryTotals.task_decomposition.total) * 100
          ),
        },
        logical_reasoning: {
          category: "logical_reasoning",
          name: "Logical Reasoning",
          correct: categoryTotals.logical_reasoning.correct,
          total: categoryTotals.logical_reasoning.total,
          percent: Math.round(
            (categoryTotals.logical_reasoning.correct / categoryTotals.logical_reasoning.total) * 100
          ),
        },
      };

      // Calculate strongest and weakest categories
      const categoryList: CategoryScore[] = Object.values(categoriesFormatted);
      const sortedDesc = [...categoryList].sort((a, b) => b.percent - a.percent);
      const strongestCategory: CategorySummary = {
        category: sortedDesc[0].category,
        name: sortedDesc[0].name,
        percent: sortedDesc[0].percent,
      };
      const weakestCategory: CategorySummary = {
        category: sortedDesc[sortedDesc.length - 1].category,
        name: sortedDesc[sortedDesc.length - 1].name,
        percent: sortedDesc[sortedDesc.length - 1].percent,
      };

      // Determine recommended learning path based on performance
      let recommendedLearningPath = "Fullstack Web & Distributed Systems";
      if (categoriesFormatted.pattern_recognition.percent >= 80 && categoriesFormatted.logical_reasoning.percent >= 80) {
        recommendedLearningPath = "Fullstack Systems & Advanced Architecture (HTML/CSS/JS/React/Node)";
      } else if (categoriesFormatted.logical_reasoning.percent >= 60) {
        recommendedLearningPath = "Frontend Engineering & Component Architecture (HTML/CSS/JS)";
      } else {
        recommendedLearningPath = "Foundational Logic & Interactive Web Technologies";
      }

      const completedAt = new Date().toISOString();

      baseResult = {
        totalCorrect,
        totalQuestions,
        totalPercent,
        categories: categoriesFormatted,
        strongestCategory,
        weakestCategory,
        missed,
        recommendedLearningPath,
        completedAt,
      };

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            hasTakenAptitudeTest: true,
            logicScore: categoriesFormatted.logical_reasoning.percent,
            patternRecognitionScore: categoriesFormatted.pattern_recognition.percent,
            taskDecompositionScore: categoriesFormatted.task_decomposition.percent,
            recommendedLearningPath,
            aptitudeResult: baseResult as any,
            gears: { increment: 50 },
          },
        });

        await tx.notification.create({
          data: {
            userId,
            notificationType: "aptitude_completed",
            data: {
              title: "Aptitude Diagnostic Completed",
              message: `Diagnostic calibrated with an overall score of ${totalPercent}%. Your flight path has been unlocked!`,
              logicScore: categoriesFormatted.logical_reasoning.percent,
              patternRecognitionScore: categoriesFormatted.pattern_recognition.percent,
              taskDecompositionScore: categoriesFormatted.task_decomposition.percent,
              totalPercent,
            },
          },
        });
      });

      await addXPAndCheckLevelUp(userId, 150);

      await logSystemAction({
        actorId: userId,
        actorRole: "STUDENT",
        action: "APTITUDE_TEST_COMPLETED",
        targetUserId: userId,
        details: {
          totalCorrect,
          totalQuestions,
          totalPercent,
          categories: {
            pattern: categoriesFormatted.pattern_recognition.percent,
            task: categoriesFormatted.task_decomposition.percent,
            logic: categoriesFormatted.logical_reasoning.percent,
          },
          missedConceptsCount: missed.length,
          xpAwarded: 150,
          gearsAwarded: 50,
        },
      });
      
      aiContext = {
        totalCorrect,
        totalPercent,
        totalScore: `${totalCorrect}/${totalQuestions} (${totalPercent}%)`,
        categories: {
          patternRecognition: categoriesFormatted.pattern_recognition.correct,
          taskDecomposition: categoriesFormatted.task_decomposition.correct,
          logicalReasoning: categoriesFormatted.logical_reasoning.correct,
        },
        strongestCategory: `${strongestCategory.name} (${strongestCategory.percent}%)`,
        weakestCategory: `${weakestCategory.name} (${weakestCategory.percent}%)`,
        missedConcepts: missed.map((m) => m.concept),
      };
    } else {
      // Regenerating context from stored dbUser
      const apt = dbUser!.aptitudeResult as any;
      aiContext = {
        totalCorrect: apt.totalCorrect,
        totalPercent: apt.totalPercent,
        totalScore: `${apt.totalCorrect}/${apt.totalQuestions} (${apt.totalPercent}%)`,
        categories: {
          patternRecognition: apt.categories.pattern_recognition.correct,
          taskDecomposition: apt.categories.task_decomposition.correct,
          logicalReasoning: apt.categories.logical_reasoning.correct,
        },
        strongestCategory: `${apt.strongestCategory.name} (${apt.strongestCategory.percent}%)`,
        weakestCategory: `${apt.weakestCategory.name} (${apt.weakestCategory.percent}%)`,
        missedConcepts: apt.missed.map((m: any) => m.concept),
      };
    }

    // Call Gemini API layer
    let rawResponse: any;
    let fallbackUsedInFetch = false;

    try {
      const response = await generateStructuredResponse(
        "aptitude",
        NOVA_SYSTEM_INSTRUCTION,
        getAptitudePrompt(aiContext),
        aptitudeSchema,
        {
          type: "OBJECT",
          properties: {
            track: { type: "STRING" },
            summary: { type: "STRING" },
            planets: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  planet: { type: "STRING" },
                  affinity: { type: "NUMBER" },
                  reason: { type: "STRING" }
                },
                required: ["planet", "affinity", "reason"]
              }
            }
          },
          required: ["track", "summary", "planets"]
        },
        () => getAptitudeFallback(aiContext),
        mockAptitudeResponse,
        0.2
      );
      
      rawResponse = response.data;
      if (response.source === "fallback") fallbackUsedInFetch = true;
    } catch (err) {
      console.warn("[APTITUDE_API] Post-grading Gemini context generation caught error:", err);
      rawResponse = getAptitudeFallback(aiContext);
      fallbackUsedInFetch = true;
    }

    const { isFallback, result, pathOrder } = processAIPathResponse(rawResponse, aiContext);
    
    const finalFallbackStatus = isFallback || fallbackUsedInFetch;

    const finalResult = {
      ...baseResult,
      aiInsight: {
        ...result,
        source: finalFallbackStatus ? "fallback" : "gemini",
      }
    };

    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          aptitudeResult: finalResult as any,
          pathOrder,
          track: result.track,
          aiSummary: result.summary,
          planetReasons: result.planets.map(p => ({ planet: p.planet, reason: p.reason })),
          isFallback: finalFallbackStatus
        },
      });
    } catch (err) {
      console.warn("[APTITUDE_API] Failed to update user with AI insights:", err);
    }

    return NextResponse.json({
      success: true,
      result: finalResult,
      xpAwarded: isRegenerating ? 0 : 150,
      gearsAwarded: isRegenerating ? 0 : 50,
    });
  } catch (error: any) {
    console.error("[APTITUDE_API] Grading error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error during assessment grading" },
      { status: 500 }
    );
  }
}
