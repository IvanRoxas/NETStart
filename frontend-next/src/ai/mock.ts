import { EvaluateResult } from "./schemas/evaluateSchema";
import { AptitudeResult } from "./schemas/aptitudeSchema";

export function mockEvaluateResponse(hintIdChoices: string[]): EvaluateResult {
  return {
    verdict: "incorrect",
    error_type: "logic",
    concept_tag: "loops",
    hint_id: hintIdChoices.length > 0 ? hintIdChoices[0] : null,
    same_mistake_as_previous: false,
    confidence: "high",
  };
}

export function mockAptitudeResponse(): AptitudeResult {
  return {
    summary: "Mock AI Summary: Outstanding pattern recognition.",
    advice: "Mock AI Advice: Keep focusing on loops and decomposition.",
  };
}
