import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
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
import { AptitudeAIContext } from "@/types/aptitude";
import { getSectionTotals } from "@/lib/aptitudeTotals";
import { assertExpectedSessionUser } from "@/lib/sessionGuard";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const userId = session.user.id;
    const mismatch = assertExpectedSessionUser(req, userId, "POST /api/aptitude/retry");
    if (mismatch) return mismatch;

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isBanned: true,
        aptitudeResult: true,
        logicScore: true,
        patternRecognitionScore: true,
        taskDecompositionScore: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    if (dbUser.isBanned) {
      return NextResponse.json(
        { success: false, message: "Account suspended." },
        { status: 403 }
      );
    }

    const MAX_RETRIES = parseInt(process.env.GEMINI_MAX_RETRIES || "5", 10);
    const COOLDOWN_MINUTES = parseInt(process.env.GEMINI_RETRY_COOLDOWN_MIN || "10", 10);
    const cutoff = new Date(Date.now() - COOLDOWN_MINUTES * 60 * 1000);

    const claim = await prisma.user.updateMany({
      where: {
        id: userId,
        isFallback: true,
        hasTakenAptitudeTest: true,
        fallbackRetryAttempts: { lt: MAX_RETRIES },
        OR: [
          { lastFallbackRetryAt: null },
          { lastFallbackRetryAt: { lte: cutoff } },
        ],
      },
      data: {
        fallbackRetryAttempts: { increment: 1 },
        lastFallbackRetryAt: new Date(),
      },
    });

    if (claim.count === 0) {
      return NextResponse.json({ success: true, message: "No retry needed or cooldown active." });
    }

    const apt = (dbUser.aptitudeResult as any) || {};
    const subs = extractSubcategoriesFromUserOrResult(dbUser);

    const deterministic = computeDeterministicOrbitAndAffinities(subs);

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

    const aiContext: AptitudeAIContext = {
      totalCorrect: apt.totalCorrect ?? calcTotalCorrect,
      totalPercent: apt.totalPercent ?? calcTotalPercent,
      totalScore: `${apt.totalCorrect ?? calcTotalCorrect}/${userTotalQ} (${apt.totalPercent ?? calcTotalPercent}%)`,
      totalQuestions: userTotalQ,
      categories: subs,
      sectionTotals: subs.totals,
      categoryPercents: subs.percents,
      computedTrack: deterministic.track,
      defaultPathOrder: deterministic.pathOrder,
      defaultFirstPlanet: deterministic.pathOrder[1],
      strongestCategory: apt.strongestCategory?.name
        ? `${apt.strongestCategory.name} (${apt.strongestCategory.percent ?? 0}%)`
        : "Pattern Recognition",
      weakestCategory: apt.weakestCategory?.name
        ? `${apt.weakestCategory.name} (${apt.weakestCategory.percent ?? 0}%)`
        : "Logical Reasoning",
      missedConcepts: (apt.missed ?? []).map((m: any) => m?.concept).filter(Boolean),
    };

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
      console.warn("[APTITUDE_RETRY] Gemini request failed:", err);
      return NextResponse.json({ success: false, message: "Gemini error." });
    }

    const {
      isFallback,
      result,
      pathOrder,
      aiOverride,
      finalTrack,
      recommendedLearningPath: finalLearningPath,
      deterministicTrack,
    } = processAIPathResponse(rawResponse, aiContext);

    if (isFallback || fallbackUsedInFetch) {
      return NextResponse.json({ success: false, message: "Still failing, fallback retained." });
    }

    // Suffix Gemini emoji indicator ✨
    const cleanSummary = result.summary.replace(/[\s✨🌟]+$/, "");
    result.summary = `${cleanSummary} ✨`;

    const finalResult = {
      ...apt,
      totalQuestions: apt.totalQuestions ?? defaultTotals.total,
      totalCorrect: apt.totalCorrect ?? calcTotalCorrect,
      totalPercent: apt.totalPercent ?? calcTotalPercent,
      subcategories: apt.subcategories || {
        pattern_recognition: { id: "pattern_recognition", name: "Pattern Recognition", correct: subs.patternRecognition, total: subs.totals.patternRecognition, percent: subs.percents.patternRecognition },
        task_decomposition: { id: "task_decomposition", name: "Task Decomposition", correct: subs.taskDecomposition, total: subs.totals.taskDecomposition, percent: subs.percents.taskDecomposition },
        web_dev: { id: "web_dev", name: "Web Development", correct: subs.webDev, total: subs.totals.webDev, percent: subs.percents.webDev },
        cpp: { id: "cpp", name: "C++ Systems", correct: subs.cpp, total: subs.totals.cpp, percent: subs.percents.cpp },
        python: { id: "python", name: "Python Scripting", correct: subs.python, total: subs.totals.python, percent: subs.percents.python },
        java: { id: "java", name: "Java Enterprise", correct: subs.java, total: subs.totals.java, percent: subs.percents.java },
      },
      recommendedLearningPath: finalLearningPath,
      deterministicTrack,
      aiInsight: {
        ...result,
        track: finalTrack,
        source: "gemini",
      },
      aiOverride,
    };

    await prisma.user.update({
      where: { id: userId },
      data: {
        aptitudeResult: finalResult as any,
        pathOrder: normalizePathOrder(pathOrder),
        track: finalTrack,
        recommendedLearningPath: finalLearningPath,
        aiSummary: result.summary,
        planetReasons: result.planets.map((p) => ({
          planet: p.planet,
          reason: p.reason,
          affinity: p.affinity,
        })),
        isFallback: false,
      },
    });

    return NextResponse.json({ success: true, message: "Path regenerated successfully." });
  } catch (error: any) {
    console.error("[APTITUDE_RETRY] Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
