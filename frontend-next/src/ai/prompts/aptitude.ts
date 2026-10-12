import { AptitudeAIContext } from "@/types/aptitude";

export const APTITUDE_PROMPT_VERSION = "aptitude@v2.1";

export function getAptitudePrompt(context: AptitudeAIContext): string {
  const missed = context.missedConcepts?.slice(0, 5) || [];
  const balanced = context.strongestCategory === context.weakestCategory;

  return `
The student has just finished the NETStart diagnostic assessment (15 questions,
5 per category). This is a low-pressure starting point, not a grade.

<assessment_data>
- Overall: ${context.totalScore}
- Pattern Recognition: ${context.categories.patternRecognition} of 5 correct
- Task Decomposition: ${context.categories.taskDecomposition} of 5 correct
- Logical Reasoning: ${context.categories.logicalReasoning} of 5 correct
- Strongest area: ${balanced ? "balanced across all three" : context.strongestCategory}
- Area with most room to grow: ${balanced ? "none stands out" : context.weakestCategory}
- Concepts to reinforce: ${missed.length ? missed.join(", ") : "none"}
</assessment_data>

TASK
Assign the student to a learning track, calculate planet affinities, and provide a diagnostic evaluation note.
Return a structured JSON matching the requested schema:
- track: "WEB" | "LOGIC" | "BALANCED"
- summary: 1-2 sentences about their strengths as a space coder. Conclude with a sparkle emoji "✨".
- advice: 1-2 sentences of practical advice for their upcoming planetary missions (under 250 characters).
- planets: array of 6 planets with affinity (0-100) and reason (max 15 words).

MAPPING RULES
1. Track Assignment:
   - Pattern Recognition + Task Decomposition favors the WEB track.
   - Logical Reasoning + Task Decomposition favors the LOGIC track.
   - If scores are relatively equal, assign the BALANCED track.
2. Planet Categories & Topics (Only reference these exact topics, DO NOT mention frameworks, backend, networks, or anything outside this curriculum):
   - WEB planets:
     * MARS: Teaches Structure and Hyperlinks.
     * VENUS: Teaches Styling and Layout.
     * MERCURY: Teaches DOM and Events.
   - LOGIC planets:
     * JUPITER: Teaches Exceptions and Classes.
     * SATURN: Teaches Loops and Pointers.
     * EARTH: Teaches Dictionaries and Lists.
3. Affinity Scoring (0-100):
   - Calculate an affinity for ALL 6 planets based STRICTLY on the given scores.
   - Planets in the same track should have similar affinities. For LOGIC planets, they should stay close in affinity unless the scores clearly justify a gap.
   - Do NOT output identical affinities for all planets; introduce slight logical variance.
4. Summary & Advice:
   - Keep the summary short (1-2 sentences) and highly encouraging. Do NOT address the student by name or as "Operator".
   - Conclude the summary paragraph with a sparkle emoji "✨".
   - Keep the advice practical and encouraging (1-2 sentences, under 250 characters), focusing on reinforcing concepts during upcoming planetary missions.
   - Provide a brief (maximum 15 words) reason for each planet's affinity. Do NOT address the student by name or as "Operator".
   - NEVER use negative, discouraging, or judgmental words like "weak", "poor", "failed", "low", or "struggled". Frame everything positively as an "opportunity", "starting point", or "discovery area", even if scores are 1/5 or 0/5.
`;
}

export function getAptitudeFallback(context: AptitudeAIContext): import("../schemas/aptitudeSchema").AptitudeResult {
  const missedCount = context.missedConcepts?.length || 0;
  const advice = missedCount === 0
    ? "Your analytical baseline is fully primed. You are well prepared to tackle complex planetary architectures starting with the Lunar rover calibrations."
    : `Focus on reinforcing ${context.weakestCategory}${missedCount > 0 ? `, especially ${context.missedConcepts.slice(0, 2).join(" and ")}` : ""}, as you work through early planetary missions.`;

  return {
    track: null,
    summary: `Solid diagnostic baseline (${context.totalScore}). Your flight path has been unlocked! 🌟`,
    advice,
    planets: [
      { planet: "MARS", affinity: 80, reason: "A great place to start your journey." },
      { planet: "VENUS", affinity: 75, reason: "Learn styling in a colorful world." },
      { planet: "MERCURY", affinity: 70, reason: "Add interactivity to your creations." },
      { planet: "JUPITER", affinity: 65, reason: "Discover the power of object-oriented programming." },
      { planet: "SATURN", affinity: 60, reason: "Explore systems-level control and memory." },
      { planet: "EARTH", affinity: 55, reason: "Master data structures and logic." }
    ]
  };
}
