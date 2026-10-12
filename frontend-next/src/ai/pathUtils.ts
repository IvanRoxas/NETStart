import { aptitudeSchema, AptitudeResult } from "./schemas/aptitudeSchema";
import { AptitudeAIContext } from "@/types/aptitude";
import { getAptitudeFallback } from "./prompts/aptitude";

export const DEFAULT_PLANET_SEQUENCE = ["MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"];

export function processAIPathResponse(
  rawResponse: any,
  aiContext: AptitudeAIContext
): {
  isValid: boolean;
  isFallback: boolean;
  result: AptitudeResult;
  pathOrder: string[];
} {
  let parsed: AptitudeResult;
  let isValid = true;
  let isFallback = false;

  // 1. Validation
  try {
    parsed = aptitudeSchema.parse(rawResponse);
    
    // Additional strict validation
    const uniquePlanets = new Set(parsed.planets.map(p => p.planet));
    if (uniquePlanets.size !== 6 || parsed.planets.length !== 6) {
      throw new Error("Response must contain exactly 6 unique planets.");
    }
  } catch (error) {
    isValid = false;
    isFallback = true;
    parsed = getAptitudeFallback(aiContext);
  }

  // 2. Compute Track from Scores
  const pattern = Number(aiContext.categories.patternRecognition) || 0;
  const logic = Number(aiContext.categories.logicalReasoning) || 0;
  const decomp = Number(aiContext.categories.taskDecomposition) || 0;

  let computedTrack: "WEB" | "LOGIC" | "BALANCED" = "BALANCED";
  
  // Current rule: strict 1-point difference decides track
  const diff = pattern - logic;
  if (diff > 0) computedTrack = "WEB";
  else if (diff < 0) computedTrack = "LOGIC";
  else computedTrack = "BALANCED";

  parsed.track = computedTrack; // Overwrite Gemini's label with our strict computed track

  // 3. Path Ordering
  const WEB_ORDER = ["MARS", "VENUS", "MERCURY"];
  const LOGIC_DEFAULT = ["JUPITER", "SATURN", "EARTH"];
  
  // Sort Logic Planets by affinity descending, tying under 5 points
  const logicPlanets = parsed.planets.filter(p => LOGIC_DEFAULT.includes(p.planet));
  logicPlanets.sort((a, b) => {
    const diff = b.affinity - a.affinity;
    if (Math.abs(diff) < 5) {
      return LOGIC_DEFAULT.indexOf(a.planet) - LOGIC_DEFAULT.indexOf(b.planet);
    }
    return diff;
  });
  const LOGIC_ORDER = logicPlanets.map(p => p.planet);

  let pathOrder: string[] = ["MOON"];

  if (pattern === logic && logic === decomp) {
    // All equal: skip affinity ordering, use default sequence
    pathOrder.push(...WEB_ORDER, ...LOGIC_DEFAULT);
  } else if (computedTrack === "BALANCED") {
    // Interleave starting with WEB
    for (let i = 0; i < 3; i++) {
      pathOrder.push(WEB_ORDER[i], LOGIC_ORDER[i]);
    }
  } else if (computedTrack === "WEB") {
    pathOrder.push(...WEB_ORDER, ...LOGIC_ORDER);
  } else if (computedTrack === "LOGIC") {
    pathOrder.push(...LOGIC_ORDER, ...WEB_ORDER);
  }

  // If fallback was generated originally, it is also validated above to ensure type safety.
  // We return the structured pathOrder
  return {
    isValid,
    isFallback,
    result: parsed,
    pathOrder,
  };
}
