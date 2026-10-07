export type HintTier = "LOW" | "MID" | "HIGH";

export interface CategoryScores {
  patternRecognition: number;
  taskDecomposition: number;
  logicalReasoning: number;
}

/**
 * Computes the hint tier based on the total aptitude score.
 * Total <= 9 -> LOW
 * Total 10-11 -> MID
 * Total >= 12 -> HIGH
 */
export function getHintTier(scores: CategoryScores): HintTier {
  const total = scores.patternRecognition + scores.taskDecomposition + scores.logicalReasoning;
  if (total <= 9) return "LOW";
  if (total <= 11) return "MID";
  return "HIGH";
}

/**
 * Returns the delay multiplier for the given tier based on env config or defaults.
 * Defaults: LOW 0.33, MID 0.66, HIGH 1.0
 */
export function getHintDelayMultiplier(tier: HintTier): number {
  switch (tier) {
    case "LOW":
      return parseFloat(process.env.NEXT_PUBLIC_HINT_DELAY_LOW || process.env.HINT_DELAY_LOW || "0.33");
    case "MID":
      return parseFloat(process.env.NEXT_PUBLIC_HINT_DELAY_MID || process.env.HINT_DELAY_MID || "0.66");
    case "HIGH":
      return parseFloat(process.env.NEXT_PUBLIC_HINT_DELAY_HIGH || process.env.HINT_DELAY_HIGH || "1.0");
    default:
      return 1.0;
  }
}
