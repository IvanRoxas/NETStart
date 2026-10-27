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

export interface ExtractedSubcategories {
  patternRecognition: number;
  taskDecomposition: number;
  webDev: number;
  cpp: number;
  python: number;
  java: number;
}

export function extractSubcategoriesFromUserOrResult(
  userOrResult: any
): ExtractedSubcategories {
  if (!userOrResult) {
    return { patternRecognition: 0, taskDecomposition: 0, webDev: 0, cpp: 0, python: 0, java: 0 };
  }

  const apt = userOrResult.aptitudeResult || userOrResult;
  const sub = apt.subcategories;

  // If new 18-question subcategories are already stored:
  if (sub && typeof sub === "object") {
    const clamp3 = (val: any) => Math.min(3, Math.max(0, Math.round(Number(val) || 0)));
    return {
      patternRecognition: clamp3(sub.pattern_recognition?.correct),
      taskDecomposition: clamp3(sub.task_decomposition?.correct),
      webDev: clamp3(sub.web_dev?.correct),
      cpp: clamp3(sub.cpp?.correct),
      python: clamp3(sub.python?.correct),
      java: clamp3(sub.java?.correct),
    };
  }

  // Legacy 15-question or User DB scores fallback:
  // Derive percentages from either apt.categories or direct user columns
  const patPct =
    apt.categories?.pattern_recognition?.percent ??
    (apt.categories?.pattern_recognition?.total
      ? Math.round(((apt.categories.pattern_recognition.correct || 0) / apt.categories.pattern_recognition.total) * 100)
      : userOrResult.patternRecognitionScore ?? 0);

  const decPct =
    apt.categories?.task_decomposition?.percent ??
    (apt.categories?.task_decomposition?.total
      ? Math.round(((apt.categories.task_decomposition.correct || 0) / apt.categories.task_decomposition.total) * 100)
      : userOrResult.taskDecompositionScore ?? 0);

  const logPct =
    apt.categories?.logical_reasoning?.percent ??
    (apt.categories?.logical_reasoning?.total
      ? Math.round(((apt.categories.logical_reasoning.correct || 0) / apt.categories.logical_reasoning.total) * 100)
      : userOrResult.logicScore ?? 0);

  const scaleTo3 = (pct: number) => Math.min(3, Math.max(0, Math.round(((Number(pct) || 0) / 100) * 3)));

  return {
    patternRecognition: scaleTo3(patPct),
    taskDecomposition: scaleTo3(decPct),
    webDev: scaleTo3(patPct),
    cpp: scaleTo3(logPct),
    python: scaleTo3(logPct),
    java: scaleTo3(logPct),
  };
}

export function computeDeterministicOrbitAndAffinities(
  categories: AptitudeAIContext["categories"]
): DeterministicAffinities {
  const patternPct = Math.min(100, Math.max(0, Math.round(((Number(categories.patternRecognition) || 0) / 3) * 100)));
  const taskDecompPct = Math.min(100, Math.max(0, Math.round(((Number(categories.taskDecomposition) || 0) / 3) * 100)));
  const webDevPct = Math.min(100, Math.max(0, Math.round(((Number(categories.webDev) || 0) / 3) * 100)));
  const cppPct = Math.min(100, Math.max(0, Math.round(((Number(categories.cpp) || 0) / 3) * 100)));
  const pythonPct = Math.min(100, Math.max(0, Math.round(((Number(categories.python) || 0) / 3) * 100)));
  const javaPct = Math.min(100, Math.max(0, Math.round(((Number(categories.java) || 0) / 3) * 100)));

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
  const venusAffinity = webAffinity;
  const mercuryAffinity = webAffinity;

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
  const logicReadiness = Math.max(jupiterAffinity, saturnAffinity, earthAffinity);
  const webReadiness = webAffinity;

  let track: "WEB" | "LOGIC" | "BALANCED" = "BALANCED";
  if (Math.abs(webReadiness - logicReadiness) <= 5) {
    track = "BALANCED";
  } else if (webReadiness > logicReadiness) {
    track = "WEB";
  } else {
    track = "LOGIC";
  }

  // 4. Orbit Assembly (Deterministic Default):
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

export function deriveRecommendedLearningPath(params: {
  firstPlanet: string;
  deterministicTrack: "WEB" | "LOGIC" | "BALANCED";
  aiOverrideApplied: boolean;
  categories: AptitudeAIContext["categories"];
  deterministicWebReadiness?: number;
  deterministicLogicReadiness?: number;
}): string {
  const { firstPlanet, deterministicTrack, aiOverrideApplied, categories } = params;

  const webDevNum = Number(categories.webDev) || 0;
  const cppNum = Number(categories.cpp) || 0;
  const pythonNum = Number(categories.python) || 0;
  const javaNum = Number(categories.java) || 0;

  const webDevPct = Math.round((webDevNum / 3) * 100);
  const cppPct = Math.round((cppNum / 3) * 100);
  const pythonPct = Math.round((pythonNum / 3) * 100);
  const javaPct = Math.round((javaNum / 3) * 100);
  const logicAvgPct = Math.round((cppPct + pythonPct + javaPct) / 3);

  if (!aiOverrideApplied) {
    if (deterministicTrack === "WEB") {
      return webDevPct >= 80
        ? "Frontend Engineering & Component Architecture (HTML / CSS / JavaScript)"
        : "Foundational Web Development & UI Architecture (HTML / CSS / JavaScript)";
    }
    if (deterministicTrack === "LOGIC") {
      return logicAvgPct >= 80
        ? "Backend Engineering & Systems Architecture (Java / C++ / Python)"
        : "Foundational Logic & Systems Architecture (Java / C++ / Python)";
    }
    // BALANCED
    const webReadiness = params.deterministicWebReadiness ?? webDevPct;
    const logicReadiness = params.deterministicLogicReadiness ?? logicAvgPct;
    return webReadiness >= 80 && logicReadiness >= 80
      ? "Fullstack Systems & Advanced Architecture (Full Planetary Sequence)"
      : "Fullstack Web & Distributed Systems";
  }

  // Override was applied: derive from final first planet
  const upperFirst = firstPlanet.toUpperCase().trim();
  if (upperFirst === "MARS" || upperFirst === "VENUS" || upperFirst === "MERCURY") {
    return webDevPct >= 80
      ? "Frontend Engineering & Component Architecture (HTML / CSS / JavaScript)"
      : "Foundational Web Development & UI Architecture (HTML / CSS / JavaScript)";
  }

  if (upperFirst === "JUPITER") {
    return javaPct >= 80
      ? "Backend Engineering & Systems Architecture (Java / C++ / Python)"
      : "Foundational Logic & Systems Architecture (Java / C++ / Python)";
  }

  if (upperFirst === "SATURN") {
    return cppPct >= 80
      ? "Backend Engineering & Systems Architecture (Java / C++ / Python)"
      : "Foundational Logic & Systems Architecture (Java / C++ / Python)";
  }

  if (upperFirst === "EARTH") {
    return pythonPct >= 80
      ? "Backend Engineering & Systems Architecture (Java / C++ / Python)"
      : "Foundational Logic & Systems Architecture (Java / C++ / Python)";
  }

  return "Fullstack Web & Distributed Systems";
}

export function processAIPathResponse(
  rawResponse: any,
  aiContext: AptitudeAIContext
): {
  isValid: boolean;
  isFallback: boolean;
  result: AptitudeResult & {
    planets: Array<{
      planet: "MARS" | "VENUS" | "MERCURY" | "JUPITER" | "SATURN" | "EARTH";
      affinity: number;
      reason: string;
    }>;
    track: "WEB" | "LOGIC" | "BALANCED";
  };
  pathOrder: string[];
  aiOverride: {
    applied: boolean;
    planet?: string;
    reason?: string;
  };
  finalTrack: "WEB" | "LOGIC" | "BALANCED";
  recommendedLearningPath: string;
  deterministicTrack: "WEB" | "LOGIC" | "BALANCED";
} {
  const deterministic = computeDeterministicOrbitAndAffinities(aiContext.categories);

  let parsed: AptitudeResult;
  let isValid = true;
  let isFallback = false;

  try {
    parsed = aptitudeSchema.parse(rawResponse);
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

  // Bounded First-Planet Override Evaluation
  const VALID_PLANETS = new Set(["MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"]);
  const WEB_PLANETS = new Set(["MARS", "VENUS", "MERCURY"]);

  const currentFirstPlanet = deterministic.pathOrder[1]; // First planet after MOON
  const rawCandidate =
    typeof parsed.recommendedFirstPlanet === "string"
      ? parsed.recommendedFirstPlanet.toUpperCase().trim()
      : undefined;
  const candidatePlanet = rawCandidate && VALID_PLANETS.has(rawCandidate) ? rawCandidate : undefined;
  const candidateAffinity = candidatePlanet
    ? deterministic.planets.find((p) => p.planet === candidatePlanet)?.affinity ?? 0
    : 0;

  // Raw section score requirement: Logic planet candidate requires its own section score >= 2; Web planet requires webDev >= 2
  let candidateSectionScore = 0;
  if (candidatePlanet === "JUPITER") {
    candidateSectionScore = Number(aiContext.categories.java) || 0;
  } else if (candidatePlanet === "SATURN") {
    candidateSectionScore = Number(aiContext.categories.cpp) || 0;
  } else if (candidatePlanet === "EARTH") {
    candidateSectionScore = Number(aiContext.categories.python) || 0;
  } else if (candidatePlanet && WEB_PLANETS.has(candidatePlanet)) {
    candidateSectionScore = Number(aiContext.categories.webDev) || 0;
  }

  let finalPathOrder = [...deterministic.pathOrder];
  let aiOverride: { applied: boolean; planet?: string; reason?: string } = { applied: false };

  if (
    isValid &&
    !isFallback &&
    candidatePlanet &&
    candidateAffinity >= 60 &&
    candidateSectionScore >= 2 &&
    candidatePlanet !== currentFirstPlanet
  ) {
    const cleanReason = parsed.overrideReason?.trim()
      ? parsed.overrideReason.trim().split(/\s+/).slice(0, 15).join(" ")
      : undefined;

    if (WEB_PLANETS.has(candidatePlanet)) {
      // If a web planet is chosen, move the whole web trio as a block (Mars/Venus/Mercury in fixed order)
      if (!WEB_PLANETS.has(currentFirstPlanet)) {
        const nonWebPlanets = deterministic.pathOrder.filter(
          (p) => p !== "MOON" && !WEB_PLANETS.has(p)
        );
        finalPathOrder = ["MOON", "MARS", "VENUS", "MERCURY", ...nonWebPlanets];
        aiOverride = {
          applied: true,
          planet: candidatePlanet,
          reason: cleanReason,
        };
      }
    } else {
      // Logic planet chosen (JUPITER, SATURN, EARTH)
      // Move only that planet to the first position after MOON; never reorder the rest
      const otherPlanets = deterministic.pathOrder.filter(
        (p) => p !== "MOON" && p !== candidatePlanet
      );
      finalPathOrder = ["MOON", candidatePlanet, ...otherPlanets];
      aiOverride = {
        applied: true,
        planet: candidatePlanet,
        reason: cleanReason,
      };
    }
  }

  const finalFirstPlanet = finalPathOrder[1]; // First planet after MOON

  // Track and learning path consistency:
  // User.track & aiInsight.track: WEB if first planet is MARS/VENUS/MERCURY, LOGIC if JUPITER/SATURN/EARTH.
  // If no override applied, keep the deterministic track as-is (including BALANCED).
  let finalTrack: "WEB" | "LOGIC" | "BALANCED" = deterministic.track;
  if (aiOverride.applied) {
    if (WEB_PLANETS.has(finalFirstPlanet)) {
      finalTrack = "WEB";
    } else {
      finalTrack = "LOGIC";
    }
  }

  const recommendedLearningPath = deriveRecommendedLearningPath({
    firstPlanet: finalFirstPlanet,
    deterministicTrack: deterministic.track,
    aiOverrideApplied: aiOverride.applied,
    categories: aiContext.categories,
    deterministicWebReadiness: deterministic.webReadiness,
    deterministicLogicReadiness: deterministic.logicReadiness,
  });

  const fullResult = {
    ...parsed,
    track: finalTrack,
    planets: deterministic.planets.map((dp) => {
      const aiMatched = parsed.planets?.find((p) => p.planet === dp.planet);
      return {
        planet: dp.planet,
        affinity: dp.affinity,
        reason: aiMatched?.reason || dp.reason,
      };
    }),
    aiOverride,
  };

  return {
    isValid,
    isFallback,
    result: fullResult,
    pathOrder: finalPathOrder,
    aiOverride,
    finalTrack,
    recommendedLearningPath,
    deterministicTrack: deterministic.track,
  };
}
