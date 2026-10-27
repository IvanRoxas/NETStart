import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { addXPAndCheckLevelUp } from "@/lib/xp";
import { logSystemAction } from "@/lib/logger";
import { generateStructuredResponse } from "@/ai/client";
import { aptitudeSchema } from "@/ai/schemas/aptitudeSchema";
import { getAptitudePrompt, getAptitudeFallback } from "@/ai/prompts/aptitude";
import { NOVA_SYSTEM_INSTRUCTION } from "@/ai/prompts/shared";
import { mockAptitudeResponse } from "@/ai/mock";
import {
  processAIPathResponse,
  normalizePathOrder,
  computeDeterministicOrbitAndAffinities,
  extractSubcategoriesFromUserOrResult,
} from "@/ai/pathUtils";
import { getStudentQuestionSet } from "@/lib/aptitudeQuestionsHelper";
import { getSectionTotals, getLegacyCategoryTotals } from "@/lib/aptitudeTotals";
import {
  AptitudeCategory,
  AptitudeTestResult,
  CategoryScore,
  CategorySummary,
  MissedQuestionItem,
  AptitudeAIContext,
  SubcategoryScore,
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
      select: {
        hasTakenAptitudeTest: true,
        isBanned: true,
        isFallback: true,
        pathOrder: true,
        logicScore: true,
        patternRecognitionScore: true,
        taskDecompositionScore: true,
        aptitudeResult: true,
        recommendedLearningPath: true,
      },
    });

    if (dbUser?.isBanned) {
      return NextResponse.json(
        { success: false, message: "Account suspended." },
        { status: 403 }
      );
    }

    const isFirstTime = !dbUser?.hasTakenAptitudeTest;
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

    // Single Source of Truth: Canonical diagnostic questions from question bank
    const { questions: masterQuestions } = await getStudentQuestionSet();

    const hasSubmittedAnswers =
      rawAnswers && typeof rawAnswers === "object" && Object.keys(rawAnswers).length > 0;

    if (!isRegenerating && !hasSubmittedAnswers) {
      return NextResponse.json(
        { success: false, message: "Invalid payload format. Expected answers object." },
        { status: 400 }
      );
    }

    let aiContext: AptitudeAIContext;
    let baseResult: any = dbUser?.aptitudeResult;
    let recommendedLearningPath: string =
      dbUser?.recommendedLearningPath || "Fullstack Web & Distributed Systems";

    let categoriesFormatted: AptitudeTestResult["categories"];
    let subcategoriesFormatted: AptitudeTestResult["subcategories"];
    let strongestCategory: CategorySummary;
    let weakestCategory: CategorySummary;
    let missed: MissedQuestionItem[] = [];
    let totalCorrect = 0;
    let totalPercent = 0;
    let deterministicOrbit: ReturnType<typeof computeDeterministicOrbitAndAffinities>;

    // Case A: Fresh submission OR Fallback student re-answering all diagnostic questions
    if (hasSubmittedAnswers) {
      const validChoices = new Set(["A", "B", "C", "D"]);

      // Validate that all questions are answered
      for (const q of masterQuestions) {
        const chosen = rawAnswers[q.id];
        if (
          !chosen ||
          typeof chosen !== "string" ||
          !validChoices.has(chosen.trim().toUpperCase())
        ) {
          return NextResponse.json(
            {
              success: false,
              message: `Missing or invalid option selected for question ${q.number} (${q.id}). All ${masterQuestions.length} questions must be answered.`,
            },
            { status: 422 }
          );
        }
      }

      // 6 Subcategories Tracking (3 questions each)
      const subcategoryTotals: Record<string, { correct: number; total: number; name: string }> = {
        pattern_recognition: { correct: 0, total: 0, name: "Pattern Recognition" },
        task_decomposition: { correct: 0, total: 0, name: "Task Decomposition & Logic" },
        web_dev: { correct: 0, total: 0, name: "Web Development" },
        cpp: { correct: 0, total: 0, name: "C++ Fundamentals" },
        python: { correct: 0, total: 0, name: "Python Fundamentals" },
        java: { correct: 0, total: 0, name: "Java Fundamentals" },
      };

      masterQuestions.forEach((q) => {
        const userChoice = String(rawAnswers[q.id]).trim().toUpperCase();
        const isCorrect = userChoice === q.answer.trim().toUpperCase();

        const subcat = (q.subcategory || q.category) as string;
        const targetSub = subcategoryTotals[subcat] ? subcat : "pattern_recognition";

        subcategoryTotals[targetSub].total += 1;

        if (isCorrect) {
          subcategoryTotals[targetSub].correct += 1;
          totalCorrect += 1;
        } else {
          missed.push({
            id: q.id,
            chosenOption: userChoice,
            concept: q.concept,
          });
        }
      });

      const sectionTotals = getSectionTotals();
      const legacyTotals = getLegacyCategoryTotals();
      const totalQuestions = masterQuestions.length || sectionTotals.total;
      totalPercent = Math.round((totalCorrect / totalQuestions) * 100);

      const prCorrect = subcategoryTotals.pattern_recognition.correct;
      const tdCorrect = subcategoryTotals.task_decomposition.correct;
      const webCorrect = subcategoryTotals.web_dev.correct;
      const cppCorrect = subcategoryTotals.cpp.correct;
      const pyCorrect = subcategoryTotals.python.correct;
      const javaCorrect = subcategoryTotals.java.correct;

      // Legacy 3 Categories (for backwards compatibility with existing UI components)
      // pattern_recognition = Part 1 Pattern + Part 2 Web
      // task_decomposition = Part 1 Task Decomposition
      // logical_reasoning = Part 2 C++ + Python + Java
      const legacyPatternCorrect = prCorrect + webCorrect;
      const legacyPatternTotal = legacyTotals.pattern_recognition;
      const legacyTaskCorrect = tdCorrect;
      const legacyTaskTotal = legacyTotals.task_decomposition;
      const legacyLogicCorrect = cppCorrect + pyCorrect + javaCorrect;
      const legacyLogicTotal = legacyTotals.logical_reasoning;

      categoriesFormatted = {
        pattern_recognition: {
          category: "pattern_recognition",
          name: "Pattern Recognition",
          correct: legacyPatternCorrect,
          total: legacyPatternTotal,
          percent: Math.round((legacyPatternCorrect / legacyPatternTotal) * 100),
        },
        task_decomposition: {
          category: "task_decomposition",
          name: "Task Decomposition",
          correct: legacyTaskCorrect,
          total: legacyTaskTotal,
          percent: Math.round((legacyTaskCorrect / legacyTaskTotal) * 100),
        },
        logical_reasoning: {
          category: "logical_reasoning",
          name: "Logical Reasoning",
          correct: legacyLogicCorrect,
          total: legacyLogicTotal,
          percent: Math.round((legacyLogicCorrect / legacyLogicTotal) * 100),
        },
      };

      subcategoriesFormatted = {
        pattern_recognition: {
          id: "pattern_recognition",
          name: "Pattern Recognition",
          correct: prCorrect,
          total: sectionTotals.patternRecognition,
          percent: Math.round((prCorrect / sectionTotals.patternRecognition) * 100),
        },
        task_decomposition: {
          id: "task_decomposition",
          name: "Task Decomposition & Logic",
          correct: tdCorrect,
          total: sectionTotals.taskDecomposition,
          percent: Math.round((tdCorrect / sectionTotals.taskDecomposition) * 100),
        },
        web_dev: {
          id: "web_dev",
          name: "Web Development",
          correct: webCorrect,
          total: sectionTotals.webDev,
          percent: Math.round((webCorrect / sectionTotals.webDev) * 100),
        },
        cpp: {
          id: "cpp",
          name: "C++ Fundamentals",
          correct: cppCorrect,
          total: sectionTotals.cpp,
          percent: Math.round((cppCorrect / sectionTotals.cpp) * 100),
        },
        python: {
          id: "python",
          name: "Python Fundamentals",
          correct: pyCorrect,
          total: sectionTotals.python,
          percent: Math.round((pyCorrect / sectionTotals.python) * 100),
        },
        java: {
          id: "java",
          name: "Java Fundamentals",
          correct: javaCorrect,
          total: sectionTotals.java,
          percent: Math.round((javaCorrect / sectionTotals.java) * 100),
        },
      };

      // Calculate strongest and weakest categories
      const categoryList: CategoryScore[] = Object.values(categoriesFormatted);
      const sortedDesc = [...categoryList].sort((a, b) => b.percent - a.percent);
      strongestCategory = {
        category: sortedDesc[0].category,
        name: sortedDesc[0].name,
        percent: sortedDesc[0].percent,
      };
      weakestCategory = {
        category: sortedDesc[sortedDesc.length - 1].category,
        name: sortedDesc[sortedDesc.length - 1].name,
        percent: sortedDesc[sortedDesc.length - 1].percent,
      };

      // Deterministic Orbit & Planet Affinities (No AI Guessing)
      deterministicOrbit = computeDeterministicOrbitAndAffinities({
        patternRecognition: prCorrect,
        taskDecomposition: tdCorrect,
        webDev: webCorrect,
        cpp: cppCorrect,
        python: pyCorrect,
        java: javaCorrect,
      });

      // Assign recommended learning path
      const webDevPct = subcategoriesFormatted.web_dev.percent;
      const logicAvgPct = Math.round(
        (subcategoriesFormatted.cpp.percent +
          subcategoriesFormatted.python.percent +
          subcategoriesFormatted.java.percent) /
          3
      );

      if (deterministicOrbit.track === "WEB") {
        recommendedLearningPath =
          webDevPct >= 80
            ? "Frontend Engineering & Component Architecture (HTML / CSS / JavaScript)"
            : "Foundational Web Development & UI Architecture (HTML / CSS / JavaScript)";
      } else if (deterministicOrbit.track === "LOGIC") {
        recommendedLearningPath =
          logicAvgPct >= 80
            ? "Backend Engineering & Systems Architecture (Java / C++ / Python)"
            : "Foundational Logic & Systems Architecture (Java / C++ / Python)";
      } else {
        recommendedLearningPath =
          deterministicOrbit.webReadiness >= 80 && deterministicOrbit.logicReadiness >= 80
            ? "Fullstack Systems & Advanced Architecture (Full Planetary Sequence)"
            : "Fullstack Web & Distributed Systems";
      }

      baseResult = {
        totalCorrect,
        totalQuestions,
        totalPercent,
        categories: categoriesFormatted,
        subcategories: subcategoriesFormatted,
        strongestCategory,
        weakestCategory,
        missed,
        recommendedLearningPath,
        completedAt: new Date().toISOString(),
      };

      aiContext = {
        totalCorrect,
        totalPercent,
        totalScore: `${totalCorrect}/${totalQuestions} (${totalPercent}%)`,
        totalQuestions,
        categories: {
          patternRecognition: prCorrect,
          taskDecomposition: tdCorrect,
          webDev: webCorrect,
          cpp: cppCorrect,
          python: pyCorrect,
          java: javaCorrect,
        },
        sectionTotals: {
          patternRecognition: sectionTotals.patternRecognition,
          taskDecomposition: sectionTotals.taskDecomposition,
          webDev: sectionTotals.webDev,
          cpp: sectionTotals.cpp,
          python: sectionTotals.python,
          java: sectionTotals.java,
        },
        categoryPercents: {
          patternRecognition: subcategoriesFormatted.pattern_recognition.percent,
          taskDecomposition: subcategoriesFormatted.task_decomposition.percent,
          webDev: subcategoriesFormatted.web_dev.percent,
          cpp: subcategoriesFormatted.cpp.percent,
          python: subcategoriesFormatted.python.percent,
          java: subcategoriesFormatted.java.percent,
        },
        computedTrack: deterministicOrbit.track,
        defaultPathOrder: deterministicOrbit.pathOrder,
        defaultFirstPlanet: deterministicOrbit.pathOrder[1],
        strongestCategory: `${strongestCategory.name} (${strongestCategory.percent}%)`,
        weakestCategory: `${weakestCategory.name} (${weakestCategory.percent}%)`,
        missedConcepts: missed.map((m) => m.concept),
      };
    } else {
      // Case B: Regenerating context from stored dbUser
      const apt = (dbUser?.aptitudeResult as any) || {};
      const subs = extractSubcategoriesFromUserOrResult(dbUser);

      deterministicOrbit = computeDeterministicOrbitAndAffinities(subs);

      const calcTotalCorrect =
        subs.patternRecognition +
        subs.taskDecomposition +
        subs.webDev +
        subs.cpp +
        subs.python +
        subs.java;
      const defaultTotals = getSectionTotals();
      const userTotalQ = apt.totalQuestions ?? defaultTotals.total;
      const calcTotalPercent = Math.round((calcTotalCorrect / userTotalQ) * 100);

      aiContext = {
        totalCorrect: apt.totalCorrect ?? calcTotalCorrect,
        totalPercent: apt.totalPercent ?? calcTotalPercent,
        totalScore: `${apt.totalCorrect ?? calcTotalCorrect}/${userTotalQ} (${apt.totalPercent ?? calcTotalPercent}%)`,
        totalQuestions: userTotalQ,
        categories: subs,
        sectionTotals: subs.totals,
        categoryPercents: subs.percents,
        computedTrack: deterministicOrbit.track,
        defaultPathOrder: deterministicOrbit.pathOrder,
        defaultFirstPlanet: deterministicOrbit.pathOrder[1],
        strongestCategory: apt.strongestCategory?.name
          ? `${apt.strongestCategory.name} (${apt.strongestCategory.percent}%)`
          : "Pattern Recognition",
        weakestCategory: apt.weakestCategory?.name
          ? `${apt.weakestCategory.name} (${apt.weakestCategory.percent}%)`
          : "Logical Reasoning",
        missedConcepts: (apt.missed ?? []).map((m: any) => m?.concept).filter(Boolean),
      };
    }

    // Call Gemini API for personalized evaluation summary & advice
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
            summary: { type: "STRING" },
            advice: { type: "STRING" },
            recommendedFirstPlanet: {
              type: "STRING",
              enum: ["MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"],
            },
            overrideReason: { type: "STRING" },
          },
          required: ["summary", "advice"],
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

    // Enforce deterministic orbit and deterministic planet affinities (No AI Guessing)
    const {
      isFallback,
      result,
      pathOrder,
      aiOverride,
      finalTrack,
      recommendedLearningPath: finalLearningPath,
      deterministicTrack,
    } = processAIPathResponse(rawResponse, aiContext);
    const finalFallbackStatus = isFallback || fallbackUsedInFetch;

    // Suffix emoji indicator: ✨ for Gemini, 🌟 for Fallback
    const indicator = finalFallbackStatus ? "🌟" : "✨";
    const cleanSummary = result.summary.replace(/[\s✨🌟]+$/, "");
    result.summary = `${cleanSummary} ${indicator}`;

    const finalResult = {
      ...baseResult,
      totalQuestions: baseResult?.totalQuestions ?? getSectionTotals().total,
      recommendedLearningPath: finalLearningPath,
      deterministicTrack,
      aiInsight: {
        ...result,
        track: finalTrack,
        source: finalFallbackStatus ? "fallback" : "gemini",
      },
      aiOverride,
    };

    // SINGLE ATOMIC DATABASE COMMIT (Eliminates Zombie Lockout Vulnerability)
    await prisma.$transaction(async (tx) => {
      // Concurrency check inside transaction to prevent double rewards
      const currentDbUser = await tx.user.findUnique({
        where: { id: userId },
        select: { hasTakenAptitudeTest: true, isFallback: true },
      });

      if (
        currentDbUser?.hasTakenAptitudeTest &&
        !currentDbUser.isFallback &&
        !isRegenerating
      ) {
        throw new Error("ALREADY_COMPLETED");
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          hasTakenAptitudeTest: true,
          logicScore:
            baseResult?.categories?.logical_reasoning?.percent ??
            dbUser?.logicScore ??
            0,
          patternRecognitionScore:
            baseResult?.categories?.pattern_recognition?.percent ??
            dbUser?.patternRecognitionScore ??
            0,
          taskDecompositionScore:
            baseResult?.categories?.task_decomposition?.percent ??
            dbUser?.taskDecompositionScore ??
            0,
          recommendedLearningPath: finalLearningPath,
          aptitudeResult: finalResult as any,
          pathOrder: normalizePathOrder(pathOrder),
          track: finalTrack,
          aiSummary: result.summary,
          planetReasons: result.planets.map((p) => ({
            planet: p.planet,
            reason: p.reason,
            affinity: p.affinity,
          })),
          isFallback: finalFallbackStatus,
          ...(isFirstTime ? { gears: { increment: 50 } } : {}),
        },
      });

      if (isFirstTime) {
        await tx.notification.create({
          data: {
            userId,
            notificationType: "aptitude_completed",
            data: {
              title: "Aptitude Diagnostic Completed",
              message: `Diagnostic calibrated with an overall score of ${baseResult?.totalPercent ?? 0}%. Your flight path has been unlocked!`,
              logicScore:
                baseResult?.categories?.logical_reasoning?.percent ??
                dbUser?.logicScore ??
                0,
              patternRecognitionScore:
                baseResult?.categories?.pattern_recognition?.percent ??
                dbUser?.patternRecognitionScore ??
                0,
              taskDecompositionScore:
                baseResult?.categories?.task_decomposition?.percent ??
                dbUser?.taskDecompositionScore ??
                0,
              totalPercent: baseResult?.totalPercent ?? 0,
            },
          },
        });
      }
    });

    if (isFirstTime) {
      await addXPAndCheckLevelUp(userId, 200);

      await logSystemAction({
        actorId: userId,
        actorRole: "STUDENT",
        action: "APTITUDE_TEST_COMPLETED",
        targetUserId: userId,
        details: {
          totalCorrect: baseResult.totalCorrect,
          totalQuestions: baseResult.totalQuestions,
          totalPercent: baseResult.totalPercent,
          categories: {
            pattern: baseResult.categories.pattern_recognition.percent,
            task: baseResult.categories.task_decomposition.percent,
            logic: baseResult.categories.logical_reasoning.percent,
          },
          subcategories: baseResult.subcategories,
          missedConceptsCount: baseResult.missed.length,
          xpAwarded: 200,
          gearsAwarded: 50,
        },
      });
    }

    return NextResponse.json({
      success: true,
      result: finalResult,
      xpAwarded: isFirstTime ? 200 : 0,
      gearsAwarded: isFirstTime ? 50 : 0,
    });
  } catch (error: any) {
    if (error?.message === "ALREADY_COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          message: "You have already completed the aptitude test and have a valid path.",
        },
        { status: 400 }
      );
    }

    console.error("[APTITUDE_API] Grading error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error during assessment grading",
      },
      { status: 500 }
    );
  }
}
