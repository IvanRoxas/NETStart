import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions, prisma } from "@/lib/auth";
import { generateStructuredResponse } from "@/ai/client";
import { NOVA_SYSTEM_INSTRUCTION } from "@/ai/prompts/shared";
import {
  getEvaluatePrompt,
  getEvaluateJsonSchema,
  EVALUATE_PROMPT_VERSION,
} from "@/ai/prompts/evaluate";
import { evaluateSchema, EvaluateResult } from "@/ai/schemas/evaluateSchema";
import { mockEvaluateResponse } from "@/ai/mock";
import {
  getHintsForMission,
  getGenericHintForMission,
} from "@/ai/data/hint_bank";
import { getMissionContext } from "@/ai/utils/missionContext";

// Cooldown tracking (in-memory per-user map)
// TODO: Move to a persistent store (such as Redis or Upstash) for multi-instance production deployment
const cooldownMap = new Map<string, number>();
const COOLDOWN_MS = 3000;

const evaluateInputSchema = z.object({
  missionId: z.string().min(1, "Mission ID is required"),
  currentSection: z.union([z.number(), z.string()]).optional().default(1),
  plainEnglishCode: z
    .string()
    .max(4000, "Student plain text code exceeds the 4000 character limit")
    .optional()
    .default(""),
  generatedJs: z
    .string()
    .max(4000, "Student generated JS code exceeds the 4000 character limit")
    .optional()
    .default(""),
  errorMessage: z.string().max(2000).optional().default(""),
  simulationState: z.record(z.string(), z.any()).optional().default({}),
  previousErrorTypes: z.array(z.string()).optional().default([]),
});

export async function POST(req: Request) {
  try {
    // 1. Session verification
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // 2. Server-side per-user cooldown check (3 seconds)
    const now = Date.now();
    const lastCalled = cooldownMap.get(userId) || 0;
    if (now - lastCalled < COOLDOWN_MS) {
      const waitRemaining = Math.ceil((COOLDOWN_MS - (now - lastCalled)) / 1000);
      return NextResponse.json(
        {
          error: "Rate limited",
          message: `Please wait ${waitRemaining}s before requesting another hint evaluation.`,
        },
        { status: 429 }
      );
    }
    cooldownMap.set(userId, now);

    // 3. Body validation
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = evaluateInputSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      missionId,
      plainEnglishCode,
      generatedJs,
      errorMessage,
      simulationState,
      previousErrorTypes,
    } = parseResult.data;

    // 4. Mission Context and Candidate Hints
    const missionContext = getMissionContext(missionId);
    const candidateHints = getHintsForMission(missionId);
    const genericHint = getGenericHintForMission(missionId);
    const candidateHintIds = candidateHints.map((h) => h.hint_id);

    // 5. AI Call
    const fallbackEvaluate: EvaluateResult = {
      verdict: "incorrect",
      error_type: "logic",
      concept_tag: "general",
      hint_id: null,
      same_mistake_as_previous: false,
      confidence: "low",
    };

    const aiPrompt = getEvaluatePrompt({
      missionContext,
      plainEnglishCode,
      generatedJs,
      errorMessage,
      simulationState,
      previousErrorTypes,
      candidateHints,
    });

    const aiResult = await generateStructuredResponse<EvaluateResult>(
      "sandbox_evaluate",
      NOVA_SYSTEM_INSTRUCTION,
      aiPrompt,
      evaluateSchema,
      getEvaluateJsonSchema(candidateHintIds),
      () => fallbackEvaluate,
      () => mockEvaluateResponse(candidateHintIds)
    );

    // 6. Resolve chosen hint text
    let chosenHintId: string | null = aiResult.data.hint_id;
    let chosenHintText = genericHint;
    let fallbackUsed = aiResult.source === "fallback";

    // If confidence is low, hint_id is null, or hint is not found, use generic fallback hint
    if (aiResult.data.confidence === "low" || !chosenHintId) {
      chosenHintId = null;
      chosenHintText = genericHint;
      fallbackUsed = true;
    } else {
      const matched = candidateHints.find((h) => h.hint_id === chosenHintId);
      if (matched) {
        chosenHintText = matched.hint_text;
      } else {
        chosenHintId = null;
        chosenHintText = genericHint;
        fallbackUsed = true;
      }
    }

    // 7. Database Updates: increment failureCount and log intervention
    const [progress] = await prisma.$transaction([
      prisma.missionProgress.upsert({
        where: {
          userId_missionId: {
            userId,
            missionId,
          },
        },
        update: {
          failureCount: { increment: 1 },
        },
        create: {
          userId,
          missionId,
          status: "IN_PROGRESS",
          failureCount: 1,
        },
      }),
      prisma.interventionLog.create({
        data: {
          userId,
          missionId,
          errorType: aiResult.data.error_type || "logic",
          hintId: chosenHintId || "generic_hint",
          promptVersion: EVALUATE_PROMPT_VERSION,
          confidence: aiResult.data.confidence,
          fallbackUsed,
        },
      }),
    ]);

    // 8. Return response
    return NextResponse.json({
      hint_text: chosenHintText,
      hint_id: chosenHintId,
      failureCount: progress.failureCount,
      fallbackUsed,
      source: aiResult.source,
    });
  } catch (error: any) {
    console.error("[EVALUATE_ROUTE_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error during evaluation" },
      { status: 500 }
    );
  }
}
