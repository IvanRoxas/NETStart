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
    track: "BALANCED",
    summary: "Mock AI Summary: Outstanding pattern recognition.",
    planets: [
      { planet: "MARS", affinity: 80, reason: "Mock reason" },
      { planet: "VENUS", affinity: 75, reason: "Mock reason" },
      { planet: "MERCURY", affinity: 70, reason: "Mock reason" },
      { planet: "JUPITER", affinity: 65, reason: "Mock reason" },
      { planet: "SATURN", affinity: 60, reason: "Mock reason" },
      { planet: "EARTH", affinity: 55, reason: "Mock reason" }
    ]
  };
}
