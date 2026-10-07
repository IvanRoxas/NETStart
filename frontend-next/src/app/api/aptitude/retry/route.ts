import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";
import { generateStructuredResponse } from "@/ai/client";
import { aptitudeSchema } from "@/ai/schemas/aptitudeSchema";
import { getAptitudePrompt, getAptitudeFallback } from "@/ai/prompts/aptitude";
import { NOVA_SYSTEM_INSTRUCTION } from "@/ai/prompts/shared";
import { mockAptitudeResponse } from "@/ai/mock";
import { processAIPathResponse } from "@/ai/pathUtils";
import { AptitudeAIContext } from "@/types/aptitude";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const userId = session.user.id;
    
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        hasTakenAptitudeTest: true, 
        isFallback: true, 
        aptitudeResult: true,
        fallbackRetryAttempts: true,
        lastFallbackRetryAt: true
      }
    });

    if (!dbUser || !dbUser.hasTakenAptitudeTest || !dbUser.isFallback) {
      return NextResponse.json({ success: true, message: "No retry needed." });
    }

    const MAX_RETRIES = parseInt(process.env.GEMINI_MAX_RETRIES || "5", 10);
    const COOLDOWN_MINUTES = parseInt(process.env.GEMINI_RETRY_COOLDOWN_MIN || "10", 10);

    if (dbUser.fallbackRetryAttempts >= MAX_RETRIES) {
      return NextResponse.json({ success: false, message: "Max retries reached." });
    }

    if (dbUser.lastFallbackRetryAt) {
      const minutesSinceLastRetry = (Date.now() - dbUser.lastFallbackRetryAt.getTime()) / (1000 * 60);
      if (minutesSinceLastRetry < COOLDOWN_MINUTES) {
        return NextResponse.json({ success: false, message: "Cooldown active." });
      }
    }

    // Update attempt count and timestamp early to prevent parallel retries
    await prisma.user.update({
      where: { id: userId },
      data: {
        fallbackRetryAttempts: { increment: 1 },
        lastFallbackRetryAt: new Date()
      }
    });

    const apt = dbUser.aptitudeResult as any;
    if (!apt || !apt.categories) {
      return NextResponse.json({ success: false, message: "Invalid stored context." }, { status: 400 });
    }

    const aiContext: AptitudeAIContext = {
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
      missedConcepts: apt.missed?.map((m: any) => m.concept) || [],
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
      console.warn("[APTITUDE_RETRY] Gemini request failed:", err);
      return NextResponse.json({ success: false, message: "Gemini error." });
    }

    const { isFallback, result, pathOrder } = processAIPathResponse(rawResponse, aiContext);
    
    if (isFallback || fallbackUsedInFetch) {
      return NextResponse.json({ success: false, message: "Still failing, fallback used." });
    }

    const finalResult = {
      ...apt,
      aiInsight: {
        ...result,
        source: "gemini",
      }
    };

    await prisma.user.update({
      where: { id: userId },
      data: {
        aptitudeResult: finalResult as any,
        pathOrder,
        track: result.track,
        aiSummary: result.summary,
        planetReasons: result.planets.map(p => ({ planet: p.planet, reason: p.reason })),
        isFallback: false
      },
    });

    return NextResponse.json({ success: true, message: "Path regenerated successfully." });
  } catch (error: any) {
    console.error("[APTITUDE_RETRY] Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
