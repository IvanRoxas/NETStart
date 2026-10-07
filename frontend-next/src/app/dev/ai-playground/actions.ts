"use server";

import { notFound } from "next/navigation";
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

export interface PlaygroundTestResult {
  missionId: string;
  promptVersion: string;
  generatedPrompt: string;
  aiResult: {
    data: EvaluateResult;
    source: string;
    confidence?: string;
  };
  chosenHintId: string | null;
  chosenHintText: string;
  fallbackUsed: boolean;
}

export async function runPlaygroundEvaluation(input: {
  missionId: string;
  plainEnglishCode: string;
  generatedJs: string;
  errorMessage: string;
}): Promise<PlaygroundTestResult> {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { missionId, plainEnglishCode, generatedJs, errorMessage } = input;
  const missionContext = getMissionContext(missionId);
  const candidateHints = getHintsForMission(missionId);
  const genericHint = getGenericHintForMission(missionId);
  const candidateHintIds = candidateHints.map((h) => h.hint_id);

  const fallbackEvaluate: EvaluateResult = {
    verdict: "incorrect",
    error_type: "logic",
    concept_tag: "general",
    hint_id: null,
    same_mistake_as_previous: false,
    confidence: "low",
  };

  const promptText = getEvaluatePrompt({
    missionContext,
    plainEnglishCode,
    generatedJs,
    errorMessage,
    candidateHints,
  });

  const aiResult = await generateStructuredResponse<EvaluateResult>(
    "dev_playground_evaluate",
    NOVA_SYSTEM_INSTRUCTION,
    promptText,
    evaluateSchema,
    getEvaluateJsonSchema(candidateHintIds),
    () => fallbackEvaluate,
    () => mockEvaluateResponse(candidateHintIds)
  );

  let chosenHintId: string | null = aiResult.data.hint_id;
  let chosenHintText = genericHint;
  let fallbackUsed = aiResult.source === "fallback";

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

  return {
    missionId,
    promptVersion: EVALUATE_PROMPT_VERSION,
    generatedPrompt: promptText,
    aiResult,
    chosenHintId,
    chosenHintText,
    fallbackUsed,
  };
}
