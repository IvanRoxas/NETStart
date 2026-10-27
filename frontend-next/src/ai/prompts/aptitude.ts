import { AptitudeAIContext } from "@/types/aptitude";
import { AptitudeResult } from "../schemas/aptitudeSchema";
import { getSectionTotals, SectionTotals } from "@/lib/aptitudeTotals";

export const APTITUDE_PROMPT_VERSION = "aptitude@v2.4";

export function getAptitudePrompt(context: AptitudeAIContext): string {
  const missed = context.missedConcepts?.slice(0, 5) || [];
  const assignedTrack = context.computedTrack || "BALANCED";
  const defaultFirst =
    context.defaultFirstPlanet ||
    (context.defaultPathOrder && context.defaultPathOrder[1]) ||
    "MARS";
  const defaultOrbit = context.defaultPathOrder
    ? context.defaultPathOrder.join(" -> ")
    : `MOON -> ${defaultFirst} -> ...`;

  const totals = context.sectionTotals || getSectionTotals();

  return `
The student has completed the NETStart diagnostic assessment (22 questions across 6 sections). This is a low-pressure starting point, not a grade.

<assessment_data>
- Overall Score: ${context.totalScore}
- Part 1: Pattern Recognition: ${context.categories.patternRecognition ?? 0} of ${totals.patternRecognition} correct
- Part 1: Task Decomposition & Logic: ${context.categories.taskDecomposition ?? 0} of ${totals.taskDecomposition} correct
- Part 2: Web Development (HTML/CSS/JS): ${context.categories.webDev ?? 0} of ${totals.webDev} correct
- Part 2: C++ Fundamentals: ${context.categories.cpp ?? 0} of ${totals.cpp} correct
- Part 2: Python Fundamentals: ${context.categories.python ?? 0} of ${totals.python} correct
- Part 2: Java Fundamentals: ${context.categories.java ?? 0} of ${totals.java} correct
- Deterministic Default Orbit: ${defaultOrbit}
- Deterministic First Planet After Moon: ${defaultFirst}
- Deterministic Track: ${assignedTrack}
- Strongest Area: ${context.strongestCategory || "General Baseline"}
- Area with Most Room to Grow: ${context.weakestCategory || "None stands out"}
- Concepts to Reinforce: ${missed.length ? missed.join(", ") : "none"}
</assessment_data>

TASK
You are Nova AI, flight coordinator for NETStart.
You see the student's scores and the deterministic default orbit order.

CRITICAL RULES FOR FIRST PLANET OVERRIDE:
1. You may only propose a different first planet ("recommendedFirstPlanet") if one specific language/domain is clearly stronger than the default suggests (e.g. Java is 4/4 while others are lower).
2. Otherwise, you MUST return the planet that is already first ("${defaultFirst}").
3. If proposing a different planet, you MUST provide an "overrideReason" (maximum 15 words explaining why that language should start first).
4. If keeping the default, you do not need an overrideReason.
5. DO NOT output affinities or track (affinities and track are computed deterministically by the system).

Return a structured JSON with:
- summary: 1-2 sentences highlighting their cognitive and coding readiness strengths as a space coder. Conclude with a sparkle emoji "✨". Do NOT address the student by name or as "Operator".
- advice: 1-2 sentences of practical advice for their upcoming planetary missions based on their missed concepts (under 250 characters).
- recommendedFirstPlanet: One of "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH".
- overrideReason: Optional string (max 15 words) explaining the override, or omit if keeping "${defaultFirst}".
`;
}

export function getAptitudeFallback(context: AptitudeAIContext): AptitudeResult {
  const missedCount = context.missedConcepts?.length || 0;
  const weakest = context.weakestCategory || "foundational syntax";
  const advice =
    missedCount === 0
      ? "Your analytical baseline is fully primed. You are well prepared to tackle complex planetary architectures starting with the Lunar calibrations."
      : `Focus on reinforcing ${weakest}${missedCount > 0 ? `, especially ${context.missedConcepts.slice(0, 2).join(" and ")}` : ""}, as you work through early missions.`;

  const defaultFirst =
    context.defaultFirstPlanet ||
    (context.defaultPathOrder && context.defaultPathOrder[1]) ||
    "MARS";

  const totals = context.sectionTotals || getSectionTotals();
  type SectionKey = Exclude<keyof SectionTotals, "total">;
  const getPct = (key: SectionKey, val: any) => {
    if (context.categoryPercents?.[key] !== undefined) {
      return Math.min(100, Math.max(0, context.categoryPercents[key]));
    }
    const tot = totals[key] || 1;
    return Math.min(100, Math.max(0, Math.round(((Number(val) || 0) / tot) * 100)));
  };

  const patternPct = getPct("patternRecognition", context.categories.patternRecognition);
  const taskDecompPct = getPct("taskDecomposition", context.categories.taskDecomposition);
  const webDevPct = getPct("webDev", context.categories.webDev);
  const cppPct = getPct("cpp", context.categories.cpp);
  const pythonPct = getPct("python", context.categories.python);
  const javaPct = getPct("java", context.categories.java);

  const webAffinity = Math.min(100, Math.max(10, Math.round(webDevPct * 0.60 + patternPct * 0.25 + taskDecompPct * 0.15)));
  const saturnAffinity = Math.min(100, Math.max(10, Math.round(cppPct * 0.60 + taskDecompPct * 0.25 + patternPct * 0.15)));
  const earthAffinity = Math.min(100, Math.max(10, Math.round(pythonPct * 0.60 + taskDecompPct * 0.25 + patternPct * 0.15)));
  const jupiterAffinity = Math.min(100, Math.max(10, Math.round(javaPct * 0.60 + taskDecompPct * 0.25 + patternPct * 0.15)));

  return {
    track: context.computedTrack || null,
    summary: `Solid diagnostic baseline (${context.totalScore}). Your flight path has been unlocked! 🌟`,
    advice,
    recommendedFirstPlanet: defaultFirst as any,
    overrideReason: undefined,
    planets: [
      { planet: "MARS", affinity: webAffinity, reason: "Calibrated to your web structure baseline." },
      { planet: "VENUS", affinity: webAffinity, reason: "Calibrated to your styling and visual syntax readiness." },
      { planet: "MERCURY", affinity: webAffinity, reason: "Calibrated to your DOM logic and script execution baseline." },
      { planet: "JUPITER", affinity: jupiterAffinity, reason: "Calibrated to your Java entry point and OOP logic." },
      { planet: "SATURN", affinity: saturnAffinity, reason: "Calibrated to your systems logic and C++ flow." },
      { planet: "EARTH", affinity: earthAffinity, reason: "Calibrated to your Python data structures and scripting." },
    ],
    aiOverride: {
      applied: false,
    },
  };
}


