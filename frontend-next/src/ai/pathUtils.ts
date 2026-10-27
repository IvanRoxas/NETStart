import { aptitudeSchema, AptitudeResult } from "./schemas/aptitudeSchema";
import { AptitudeAIContext } from "@/types/aptitude";
import { getAptitudeFallback } from "./prompts/aptitude";
import { getSectionTotals, SectionTotals } from "@/lib/aptitudeTotals";

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

export interface ExtractedSubcategoryScore {
  correct: number;
  total: number;
  percent: number;
}

export interface ExtractedSubcategories {
  patternRecognition: number;
  taskDecomposition: number;
  webDev: number;
  cpp: number;
  python: number;
  java: number;
  totals: {
    patternRecognition: number;
    taskDecomposition: number;
    webDev: number;
    cpp: number;
    python: number;
    java: number;
  };
  percents: {
    patternRecognition: number;
    taskDecomposition: number;
    webDev: number;
    cpp: number;
    python: number;
    java: number;
  };
  details: {
    patternRecognition: ExtractedSubcategoryScore;
    taskDecomposition: ExtractedSubcategoryScore;
    webDev: ExtractedSubcategoryScore;
    cpp: ExtractedSubcategoryScore;
    python: ExtractedSubcategoryScore;
    java: ExtractedSubcategoryScore;
  };
}

export function extractSubcategoriesFromUserOrResult(
  userOrResult: any
): ExtractedSubcategories {
  const defaultTotals = getSectionTotals();

  const emptyResult = (totals = defaultTotals): ExtractedSubcategories => ({
    patternRecognition: 0,
    taskDecomposition: 0,
    webDev: 0,
    cpp: 0,
    python: 0,
    java: 0,
    totals: {
      patternRecognition: totals.patternRecognition,
      taskDecomposition: totals.taskDecomposition,
      webDev: totals.webDev,
      cpp: totals.cpp,
      python: totals.python,
      java: totals.java,
    },
    percents: {
      patternRecognition: 0,
      taskDecomposition: 0,
      webDev: 0,
      cpp: 0,
      python: 0,
      java: 0,
    },
    details: {
      patternRecognition: { correct: 0, total: totals.patternRecognition, percent: 0 },
      taskDecomposition: { correct: 0, total: totals.taskDecomposition, percent: 0 },
      webDev: { correct: 0, total: totals.webDev, percent: 0 },
      cpp: { correct: 0, total: totals.cpp, percent: 0 },
      python: { correct: 0, total: totals.python, percent: 0 },
      java: { correct: 0, total: totals.java, percent: 0 },
    },
  });

  if (!userOrResult) {
    return emptyResult();
  }

  const apt = userOrResult.aptitudeResult || userOrResult;
  const sub = apt.subcategories;

  // If subcategories are already stored (18-question or 22-question):
  if (sub && typeof sub === "object") {
    const parseSub = (entry: any, defaultTotal: number): ExtractedSubcategoryScore => {
      const storedTotal = Number(entry?.total);
      const total = !isNaN(storedTotal) && storedTotal > 0 ? storedTotal : defaultTotal;
      const rawCorrect = Math.max(0, Math.round(Number(entry?.correct) || 0));
      const correct = Math.min(total, rawCorrect);
      let percent: number;
      if (typeof entry?.percent === "number" && !isNaN(entry.percent)) {
        percent = Math.min(100, Math.max(0, Math.round(entry.percent)));
      } else {
        percent = total > 0 ? Math.min(100, Math.max(0, Math.round((correct / total) * 100))) : 0;
      }
      return { correct, total, percent };
    };

    const pr = parseSub(sub.pattern_recognition, defaultTotals.patternRecognition);
    const td = parseSub(sub.task_decomposition, defaultTotals.taskDecomposition);
    const web = parseSub(sub.web_dev, defaultTotals.webDev);
    const cpp = parseSub(sub.cpp, defaultTotals.cpp);
    const py = parseSub(sub.python, defaultTotals.python);
    const java = parseSub(sub.java, defaultTotals.java);

    return {
      patternRecognition: pr.correct,
      taskDecomposition: td.correct,
      webDev: web.correct,
      cpp: cpp.correct,
      python: py.correct,
      java: java.correct,
      totals: {
        patternRecognition: pr.total,
        taskDecomposition: td.total,
        webDev: web.total,
        cpp: cpp.total,
        python: py.total,
        java: java.total,
      },
      percents: {
        patternRecognition: pr.percent,
        taskDecomposition: td.percent,
        webDev: web.percent,
        cpp: cpp.percent,
        python: py.percent,
        java: java.percent,
      },
      details: {
        patternRecognition: pr,
        taskDecomposition: td,
        webDev: web,
        cpp: cpp,
        python: py,
        java: java,
      },
    };
  }

  // Legacy 15-question or User DB scores fallback:
  // Derive percentages from either apt.categories or direct user columns
  const safePct = (val: any) => {
    const n = Number(val);
    return isNaN(n) ? 0 : Math.min(100, Math.max(0, Math.round(n)));
  };

  let rawPat = apt.categories?.pattern_recognition?.percent;
  if (rawPat === undefined && apt.categories?.pattern_recognition?.total) {
    rawPat = Math.round(((apt.categories.pattern_recognition.correct || 0) / apt.categories.pattern_recognition.total) * 100);
  }
  if (rawPat === undefined) {
    rawPat = userOrResult.patternRecognitionScore ?? 0;
  }
  const patPct = safePct(rawPat);

  let rawDec = apt.categories?.task_decomposition?.percent;
  if (rawDec === undefined && apt.categories?.task_decomposition?.total) {
    rawDec = Math.round(((apt.categories.task_decomposition.correct || 0) / apt.categories.task_decomposition.total) * 100);
  }
  if (rawDec === undefined) {
    rawDec = userOrResult.taskDecompositionScore ?? 0;
  }
  const decPct = safePct(rawDec);

  let rawLog = apt.categories?.logical_reasoning?.percent;
  if (rawLog === undefined && apt.categories?.logical_reasoning?.total) {
    rawLog = Math.round(((apt.categories.logical_reasoning.correct || 0) / apt.categories.logical_reasoning.total) * 100);
  }
  if (rawLog === undefined) {
    rawLog = userOrResult.logicScore ?? 0;
  }
  const logPct = safePct(rawLog);

  // Scale percent onto current section totals (never produce a percent above 100 or NaN):
  const scaleToSection = (pct: number, total: number): ExtractedSubcategoryScore => {
    const validTotal = total > 0 ? total : 1;
    const correct = Math.min(validTotal, Math.max(0, Math.round((pct / 100) * validTotal)));
    const percent = Math.min(100, Math.max(0, Math.round((correct / validTotal) * 100)));
    return { correct, total: validTotal, percent };
  };

  const pr = scaleToSection(patPct, defaultTotals.patternRecognition);
  const td = scaleToSection(decPct, defaultTotals.taskDecomposition);
  const web = scaleToSection(patPct, defaultTotals.webDev);
  const cpp = scaleToSection(logPct, defaultTotals.cpp);
  const py = scaleToSection(logPct, defaultTotals.python);
  const java = scaleToSection(logPct, defaultTotals.java);

  return {
    patternRecognition: pr.correct,
    taskDecomposition: td.correct,
    webDev: web.correct,
    cpp: cpp.correct,
    python: py.correct,
    java: java.correct,
    totals: {
      patternRecognition: pr.total,
      taskDecomposition: td.total,
      webDev: web.total,
      cpp: cpp.total,
      python: py.total,
      java: java.total,
    },
    percents: {
      patternRecognition: pr.percent,
      taskDecomposition: td.percent,
      webDev: web.percent,
      cpp: cpp.percent,
      python: py.percent,
      java: java.percent,
    },
    details: {
      patternRecognition: pr,
      taskDecomposition: td,
      webDev: web,
      cpp: cpp,
      python: py,
      java: java,
    },
  };
}

export function computeDeterministicOrbitAndAffinities(
  categories: AptitudeAIContext["categories"] | ExtractedSubcategories,
  customTotals?: Partial<SectionTotals>
): DeterministicAffinities {
  const defaultTotals = getSectionTotals();
  const secTotals = {
    patternRecognition: customTotals?.patternRecognition ?? (categories as any).totals?.patternRecognition ?? defaultTotals.patternRecognition,
    taskDecomposition: customTotals?.taskDecomposition ?? (categories as any).totals?.taskDecomposition ?? defaultTotals.taskDecomposition,
    webDev: customTotals?.webDev ?? (categories as any).totals?.webDev ?? defaultTotals.webDev,
    cpp: customTotals?.cpp ?? (categories as any).totals?.cpp ?? defaultTotals.cpp,
    python: customTotals?.python ?? (categories as any).totals?.python ?? defaultTotals.python,
    java: customTotals?.java ?? (categories as any).totals?.java ?? defaultTotals.java,
  };

  const getPercent = (key: keyof typeof secTotals, val: any): number => {
    const directPct = (categories as any).percents?.[key];
    if (typeof directPct === "number" && !isNaN(directPct)) {
      return Math.min(100, Math.max(0, Math.round(directPct)));
    }
    const tot = secTotals[key] || 1;
    const num = Number(val) || 0;
    return Math.min(100, Math.max(0, Math.round((num / tot) * 100)));
  };

  const patternPct = getPercent("patternRecognition", categories.patternRecognition);
  const taskDecompPct = getPercent("taskDecomposition", categories.taskDecomposition);
  const webDevPct = getPercent("webDev", categories.webDev);
  const cppPct = getPercent("cpp", categories.cpp);
  const pythonPct = getPercent("python", categories.python);
  const javaPct = getPercent("java", categories.java);

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
  categories: AptitudeAIContext["categories"] | ExtractedSubcategories;
  deterministicWebReadiness?: number;
  deterministicLogicReadiness?: number;
  sectionTotals?: Partial<SectionTotals>;
}): string {
  const { firstPlanet, deterministicTrack, aiOverrideApplied, categories } = params;
  const defaultTotals = getSectionTotals();
  const secTotals = {
    patternRecognition: params.sectionTotals?.patternRecognition ?? (categories as any).totals?.patternRecognition ?? defaultTotals.patternRecognition,
    taskDecomposition: params.sectionTotals?.taskDecomposition ?? (categories as any).totals?.taskDecomposition ?? defaultTotals.taskDecomposition,
    webDev: params.sectionTotals?.webDev ?? (categories as any).totals?.webDev ?? defaultTotals.webDev,
    cpp: params.sectionTotals?.cpp ?? (categories as any).totals?.cpp ?? defaultTotals.cpp,
    python: params.sectionTotals?.python ?? (categories as any).totals?.python ?? defaultTotals.python,
    java: params.sectionTotals?.java ?? (categories as any).totals?.java ?? defaultTotals.java,
  };

  const getPercent = (key: keyof typeof secTotals, val: any): number => {
    const directPct = (categories as any).percents?.[key];
    if (typeof directPct === "number" && !isNaN(directPct)) {
      return Math.min(100, Math.max(0, Math.round(directPct)));
    }
    const tot = secTotals[key] || 1;
    const num = Number(val) || 0;
    return Math.min(100, Math.max(0, Math.round((num / tot) * 100)));
  };

  const webDevPct = getPercent("webDev", categories.webDev);
  const cppPct = getPercent("cpp", categories.cpp);
  const pythonPct = getPercent("python", categories.python);
  const javaPct = getPercent("java", categories.java);
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
  const deterministic = computeDeterministicOrbitAndAffinities(
    aiContext.categories,
    aiContext.sectionTotals
  );

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

  const defaultTotals = getSectionTotals();
  const candidateTotals = {
    patternRecognition: aiContext.sectionTotals?.patternRecognition ?? (aiContext.categories as any).totals?.patternRecognition ?? defaultTotals.patternRecognition,
    taskDecomposition: aiContext.sectionTotals?.taskDecomposition ?? (aiContext.categories as any).totals?.taskDecomposition ?? defaultTotals.taskDecomposition,
    webDev: aiContext.sectionTotals?.webDev ?? (aiContext.categories as any).totals?.webDev ?? defaultTotals.webDev,
    cpp: aiContext.sectionTotals?.cpp ?? (aiContext.categories as any).totals?.cpp ?? defaultTotals.cpp,
    python: aiContext.sectionTotals?.python ?? (aiContext.categories as any).totals?.python ?? defaultTotals.python,
    java: aiContext.sectionTotals?.java ?? (aiContext.categories as any).totals?.java ?? defaultTotals.java,
  };

  let candidateSectionScore = 0;
  let candidateSectionTotal = 4;
  let candidateSectionPercent = 0;

  if (candidatePlanet === "JUPITER") {
    candidateSectionScore = Number(aiContext.categories.java) || 0;
    candidateSectionTotal = candidateTotals.java;
    candidateSectionPercent = (aiContext.categoryPercents?.java ?? (aiContext.categories as any).percents?.java) ??
      (candidateSectionTotal > 0 ? (candidateSectionScore / candidateSectionTotal) * 100 : 0);
  } else if (candidatePlanet === "SATURN") {
    candidateSectionScore = Number(aiContext.categories.cpp) || 0;
    candidateSectionTotal = candidateTotals.cpp;
    candidateSectionPercent = (aiContext.categoryPercents?.cpp ?? (aiContext.categories as any).percents?.cpp) ??
      (candidateSectionTotal > 0 ? (candidateSectionScore / candidateSectionTotal) * 100 : 0);
  } else if (candidatePlanet === "EARTH") {
    candidateSectionScore = Number(aiContext.categories.python) || 0;
    candidateSectionTotal = candidateTotals.python;
    candidateSectionPercent = (aiContext.categoryPercents?.python ?? (aiContext.categories as any).percents?.python) ??
      (candidateSectionTotal > 0 ? (candidateSectionScore / candidateSectionTotal) * 100 : 0);
  } else if (candidatePlanet && WEB_PLANETS.has(candidatePlanet)) {
    candidateSectionScore = Number(aiContext.categories.webDev) || 0;
    candidateSectionTotal = candidateTotals.webDev;
    candidateSectionPercent = (aiContext.categoryPercents?.webDev ?? (aiContext.categories as any).percents?.webDev) ??
      (candidateSectionTotal > 0 ? (candidateSectionScore / candidateSectionTotal) * 100 : 0);
  }

  // Override gate: candidate's own section score must be >= 75% of its section total (e.g. 3 of 4)
  const candidatePassesSectionGate = candidateSectionPercent >= 74.99;

  let finalPathOrder = [...deterministic.pathOrder];
  let aiOverride: { applied: boolean; planet?: string; reason?: string } = { applied: false };

  if (
    isValid &&
    !isFallback &&
    candidatePlanet &&
    candidateAffinity >= 60 &&
    candidatePassesSectionGate &&
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
    sectionTotals: candidateTotals,
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

