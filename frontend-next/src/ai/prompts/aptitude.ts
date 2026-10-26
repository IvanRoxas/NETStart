import { AptitudeAIContext } from "@/types/aptitude";
import { AptitudeResult } from "../schemas/aptitudeSchema";

export const APTITUDE_PROMPT_VERSION = "aptitude@v2.2";

export function getAptitudePrompt(context: AptitudeAIContext): string {
  const missed = context.missedConcepts?.slice(0, 5) || [];
  const assignedTrack = context.computedTrack || "BALANCED";

  return `
The student has just finished the NETStart diagnostic assessment (18 questions across 6 sections, 3 questions per section). This is a low-pressure starting point, not a grade.

<assessment_data>
- Overall Score: ${context.totalScore}
- Part 1: Pattern Recognition: ${context.categories.patternRecognition ?? 0} of 3 correct
- Part 1: Task Decomposition & Logic: ${context.categories.taskDecomposition ?? 0} of 3 correct
- Part 2: Web Development (HTML/CSS/JS): ${context.categories.webDev ?? 0} of 3 correct
- Part 2: C++ Fundamentals: ${context.categories.cpp ?? 0} of 3 correct
- Part 2: Python Fundamentals: ${context.categories.python ?? 0} of 3 correct
- Part 2: Java Fundamentals: ${context.categories.java ?? 0} of 3 correct
- Deterministic Track Assignment: ${assignedTrack}
- Strongest area: ${context.strongestCategory || "General Baseline"}
- Area with most room to grow: ${context.weakestCategory || "None stands out"}
- Concepts to reinforce: ${missed.length ? missed.join(", ") : "none"}
</assessment_data>

TASK
Provide a diagnostic evaluation for the student's assigned learning track and calculate planet affinities.
Return a structured JSON matching the requested schema:
- track: "${assignedTrack}" (Must match the deterministic track assignment: "WEB" | "LOGIC" | "BALANCED")
- summary: 1-2 sentences highlighting their cognitive and coding readiness strengths as a space coder. Conclude with a sparkle emoji "✨".
- advice: 1-2 sentences of practical advice for their upcoming planetary missions based on their missed concepts (under 250 characters).
- planets: array of 6 planets with affinity (0-100) and reason (max 15 words).

MAPPING RULES
1. Track & Planet Mapping (Only reference these exact topics, DO NOT mention frameworks, backend, networks, or anything outside this curriculum):
   - WEB planets:
     * MARS: Teaches HTML Structure and Hyperlinks.
     * VENUS: Teaches CSS Styling and Layout.
     * MERCURY: Teaches JavaScript DOM and Events.
   - LOGIC planets:
     * JUPITER: Teaches Java Exceptions and Classes (align with Java score).
     * SATURN: Teaches C++ Loops and Pointers (align with C++ score).
     * EARTH: Teaches Python Dictionaries and Lists (align with Python score).
2. Affinity Scoring (0-100):
   - Calculate an affinity for ALL 6 planets based STRICTLY on the given section scores.
   - WEB planets (MARS, VENUS, MERCURY) are weighted from Web Dev (60%) + Pattern Recognition (25%) + Task Decomposition (15%).
   - SATURN (C++) is weighted from C++ (60%) + Task Decomposition (25%) + Pattern Recognition (15%).
   - EARTH (Python) is weighted from Python (60%) + Task Decomposition (25%) + Pattern Recognition (15%).
   - JUPITER (Java) is weighted from Java (60%) + Task Decomposition (25%) + Pattern Recognition (15%).
   - Introduce slight logical variance for reasons based on missed concepts, but maintain proximity to these mathematical weights.
3. Summary & Advice:
   - Keep the summary short (1-2 sentences) and highly encouraging. Do NOT address the student by name or as "Operator".
   - Conclude the summary paragraph with a sparkle emoji "✨".
   - Keep the advice practical and encouraging (1-2 sentences, under 250 characters), focusing on reinforcing concepts during upcoming planetary missions.
   - Provide a brief (maximum 15 words) reason for each planet's affinity without addressing the student as "Operator".
   - NEVER use negative, discouraging, or judgmental words like "weak", "poor", "failed", "low", or "struggled". Frame everything positively as an "opportunity", "starting point", or "discovery area", even if scores are 0/3.
`;
}

export function getAptitudeFallback(context: AptitudeAIContext): AptitudeResult {
  const missedCount = context.missedConcepts?.length || 0;
  const weakest = context.weakestCategory || "foundational syntax";
  const advice = missedCount === 0
    ? "Your analytical baseline is fully primed. You are well prepared to tackle complex planetary architectures starting with the Lunar calibrations."
    : `Focus on reinforcing ${weakest}${missedCount > 0 ? `, especially ${context.missedConcepts.slice(0, 2).join(" and ")}` : ""}, as you work through early missions.`;

  // Deterministic planet affinity math from actual section scores
  const patternPct = Math.round(((Number(context.categories.patternRecognition) || 0) / 3) * 100);
  const taskDecompPct = Math.round(((Number(context.categories.taskDecomposition) || 0) / 3) * 100);
  const webDevPct = Math.round(((Number(context.categories.webDev) || 0) / 3) * 100);
  const cppPct = Math.round(((Number(context.categories.cpp) || 0) / 3) * 100);
  const pythonPct = Math.round(((Number(context.categories.python) || 0) / 3) * 100);
  const javaPct = Math.round(((Number(context.categories.java) || 0) / 3) * 100);

  const webAffinity = Math.min(100, Math.max(10, Math.round(webDevPct * 0.60 + patternPct * 0.25 + taskDecompPct * 0.15)));
  const saturnAffinity = Math.min(100, Math.max(10, Math.round(cppPct * 0.60 + taskDecompPct * 0.25 + patternPct * 0.15)));
  const earthAffinity = Math.min(100, Math.max(10, Math.round(pythonPct * 0.60 + taskDecompPct * 0.25 + patternPct * 0.15)));
  const jupiterAffinity = Math.min(100, Math.max(10, Math.round(javaPct * 0.60 + taskDecompPct * 0.25 + patternPct * 0.15)));

  return {
    track: context.computedTrack || null,
    summary: `Solid diagnostic baseline (${context.totalScore}). Your flight path has been unlocked! 🌟`,
    advice,
    planets: [
      { planet: "MARS", affinity: webAffinity, reason: "Calibrated to your web structure baseline." },
      { planet: "VENUS", affinity: Math.max(10, webAffinity - 2), reason: "Calibrated to your styling and visual syntax readiness." },
      { planet: "MERCURY", affinity: Math.max(10, webAffinity - 4), reason: "Calibrated to your DOM logic and script execution baseline." },
      { planet: "JUPITER", affinity: jupiterAffinity, reason: "Calibrated to your Java entry point and OOP logic." },
      { planet: "SATURN", affinity: saturnAffinity, reason: "Calibrated to your systems logic and C++ flow." },
      { planet: "EARTH", affinity: earthAffinity, reason: "Calibrated to your Python data structures and scripting." }
    ]
  };
}
