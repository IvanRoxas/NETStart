import { aptitudeSchema, AptitudeResult } from "./schemas/aptitudeSchema";
import { AptitudeAIContext } from "@/types/aptitude";
import { getAptitudeFallback } from "./prompts/aptitude";

export const DEFAULT_PLANET_SEQUENCE = ["MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"];
export { normalizePathOrder } from "@/lib/unlockLogic";

export interface DeterministicAffinities {
  track: "WEB" | "LOGIC" | "BALANCED";
  pathOrder: string[];
  planets: Array<{
    planet: "MARS" | "VENUS" | "MERCURY" | "JUPITER" | "SATURN" | "EARTH";
    affinity: number;
    reason: string;
  }>;
  webReadiness: number;
  logicReadiness: number;
}

export function computeDeterministicOrbitAndAffinities(
  categories: AptitudeAIContext["categories"]
): DeterministicAffinities {
  const patternPct = Math.round(((Number(categories.patternRecognition) || 0) / 3) * 100);
  const taskDecompPct = Math.round(((Number(categories.taskDecomposition) || 0) / 3) * 100);
  const webDevPct = Math.round(((Number(categories.webDev) || 0) / 3) * 100);
  const cppPct = Math.round(((Number(categories.cpp) || 0) / 3) * 100);
  const pythonPct = Math.round(((Number(categories.python) || 0) / 3) * 100);
  const javaPct = Math.round(((Number(categories.java) || 0) / 3) * 100);

  // 1. Deterministic planet affinities (Strict User Override):
  // MARS, VENUS, MERCURY = weighted from webDev (60%) + patternRecognition (25%) + taskDecomposition (15%)
  const webAffinity = Math.min(100, Math.max(10, Math.round(webDevPct * 0.60 + patternPct * 0.25 + taskDecompPct * 0.15)));
  // SATURN (C++) = weighted from cpp (60%) + taskDecomposition (25%) + patternRecognition (15%)
  const saturnAffinity = Math.min(100, Math.max(10, Math.round(cppPct * 0.60 + taskDecompPct * 0.25 + patternPct * 0.15)));
  // EARTH (Python) = weighted from python (60%) + taskDecomposition (25%) + patternRecognition (15%)
  const earthAffinity = Math.min(100, Math.max(10, Math.round(pythonPct * 0.60 + taskDecompPct * 0.25 + patternPct * 0.15)));
  // JUPITER (Java) = weighted from java (60%) + taskDecomposition (25%) + patternRecognition (15%)
  const jupiterAffinity = Math.min(100, Math.max(10, Math.round(javaPct * 0.60 + taskDecompPct * 0.25 + patternPct * 0.15)));

  const marsAffinity = webAffinity;
  const venusAffinity = Math.min(100, Math.max(10, Math.round(webDevPct * 0.58 + patternPct * 0.27 + taskDecompPct * 0.15)));
  const mercuryAffinity = Math.min(100, Math.max(10, Math.round(webDevPct * 0.60 + taskDecompPct * 0.25 + patternPct * 0.15)));

  // 2. Logic planets sorted strictly by deterministic score, tie-breaker: default order ["JUPITER", "SATURN", "EARTH"]
  const LOGIC_DEFAULT: Array<"JUPITER" | "SATURN" | "EARTH"> = ["JUPITER", "SATURN", "EARTH"];
  const logicPlanetsWithScores: Array<{
    planet: "JUPITER" | "SATURN" | "EARTH";
    affinity: number;
    reason: string;
  }> = [
    { planet: "JUPITER", affinity: jupiterAffinity, reason: "Calibrated to your Java entry point and OOP logic." },
    { planet: "SATURN", affinity: saturnAffinity, reason: "Calibrated to your systems logic and C++ computational flow." },
    { planet: "EARTH", affinity: earthAffinity, reason: "Calibrated to your Python data structures and scripting." },
  ];

  logicPlanetsWithScores.sort((a, b) => {
    if (b.affinity !== a.affinity) {
      return b.affinity - a.affinity;
    }
    return LOGIC_DEFAULT.indexOf(a.planet) - LOGIC_DEFAULT.indexOf(b.planet);
  });

  const sortedLogicPlanets = logicPlanetsWithScores.map((p) => p.planet);

  // 3. Track Determination:
  const logicAvgPct = Math.round((cppPct + pythonPct + javaPct) / 3);
  const logicReadiness = Math.round(logicAvgPct * 0.60 + taskDecompPct * 0.25 + patternPct * 0.15);
  const webReadiness = webAffinity;

  let track: "WEB" | "LOGIC" | "BALANCED" = "BALANCED";
  if (Math.abs(webReadiness - logicReadiness) <= 5) {
    track = "BALANCED";
  } else if (webReadiness > logicReadiness) {
    track = "WEB";
  } else {
    track = "LOGIC";
  }

  // 4. Orbit Assembly:
  const WEB_ORDER = ["MARS", "VENUS", "MERCURY"];
  let pathOrder = ["MOON"];

  if (track === "WEB") {
    pathOrder.push(...WEB_ORDER, ...sortedLogicPlanets);
  } else if (track === "LOGIC") {
    pathOrder.push(...sortedLogicPlanets, ...WEB_ORDER);
  } else {
    if (logicReadiness > webReadiness) {
      pathOrder.push(...sortedLogicPlanets, ...WEB_ORDER);
    } else {
      pathOrder.push(...WEB_ORDER, ...sortedLogicPlanets);
    }
  }

  const allPlanets: Array<{
    planet: "MARS" | "VENUS" | "MERCURY" | "JUPITER" | "SATURN" | "EARTH";
    affinity: number;
    reason: string;
  }> = [
    { planet: "MARS", affinity: marsAffinity, reason: "Calibrated to your HTML structure baseline." },
    { planet: "VENUS", affinity: venusAffinity, reason: "Calibrated to your styling and visual syntax readiness." },
    { planet: "MERCURY", affinity: mercuryAffinity, reason: "Calibrated to your DOM logic and script execution baseline." },
    ...logicPlanetsWithScores,
  ];

  return {
    track,
    pathOrder,
    planets: allPlanets,
    webReadiness,
    logicReadiness,
  };
}

export function processAIPathResponse(
  rawResponse: any,
  aiContext: AptitudeAIContext
): {
  isValid: boolean;
  isFallback: boolean;
  result: AptitudeResult;
  pathOrder: string[];
} {
  const deterministic = computeDeterministicOrbitAndAffinities(aiContext.categories);

  let parsed: AptitudeResult;
  let isValid = true;
  let isFallback = false;

  try {
    parsed = aptitudeSchema.parse(rawResponse);
    const uniquePlanets = new Set(parsed.planets.map((p) => p.planet));
    if (uniquePlanets.size !== 6 || parsed.planets.length !== 6) {
      throw new Error("Response must contain exactly 6 unique planets.");
    }
  } catch (error) {
    isValid = false;
    isFallback = true;
    parsed = getAptitudeFallback(aiContext);
  }

  // Enforce deterministic track and deterministic planet affinities (Strict User Override: No AI Guessing)
  parsed.track = deterministic.track;
  parsed.planets = deterministic.planets.map((dp) => {
    const aiMatched = parsed.planets?.find((p) => p.planet === dp.planet);
    return {
      planet: dp.planet,
      affinity: dp.affinity,
      reason: aiMatched?.reason || dp.reason,
    };
  });

  return {
    isValid,
    isFallback,
    result: parsed,
    pathOrder: deterministic.pathOrder,
  };
}
