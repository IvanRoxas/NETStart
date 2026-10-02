import { AptitudeAIContext } from "@/types/aptitude";

export const APTITUDE_PROMPT_VERSION = "aptitude@v2";

export function getAptitudePrompt(context: AptitudeAIContext): string {
  const missed = context.missedConcepts.slice(0, 5);
  const balanced = context.strongestCategory === context.weakestCategory;

  return `
The Operator has just finished the NETStart diagnostic assessment (15 questions,
5 per category). This is a low-pressure starting point, not a grade.

<assessment_data>
- Overall: ${context.totalCorrect} of 15 correct (${context.totalPercent}%)
- Pattern Recognition: ${context.categories.patternRecognition} of 5 correct
- Task Decomposition: ${context.categories.taskDecomposition} of 5 correct
- Logical Reasoning: ${context.categories.logicalReasoning} of 5 correct
- Strongest area: ${balanced ? "balanced across all three" : context.strongestCategory}
- Area with most room to grow: ${balanced ? "none stands out" : context.weakestCategory}
- Concepts to reinforce: ${missed.length ? missed.join(", ") : "none"}
</assessment_data>

TASK
Write a short, motivating diagnostic note as JSON matching the schema:
- summary: 1-2 sentences about their strengths as a space coder.
- advice: 1-2 sentences of practical advice for their first planetary missions.

RULES
- Use only the categories, concepts, and numbers in <assessment_data>.
  Do not invent others.
- Frame the result as a starting point. Never say or imply whether the
  Operator is suited or unsuited for programming or an IT degree.
- Keep it encouraging even for low scores, and never mention the score as
  a failure.
- Each field must be under 250 characters.
`;
}

export function getAptitudeFallback(context: AptitudeAIContext) {
  const missedCount = context.missedConcepts.length;
  if (missedCount === 0) {
    return {
      summary: `Outstanding diagnostic performance (${context.totalScore})! You demonstrated exceptional mastery across Pattern Recognition, Task Decomposition, and Logical Reasoning.`,
      advice: "Your analytical baseline is fully primed. You are well prepared to tackle complex planetary architectures starting with the Lunar rover calibrations."
    };
  }
  return {
    summary: `Solid diagnostic baseline (${context.totalScore}) with particular strength in ${context.strongestCategory}.`,
    advice: `Focus on reinforcing ${context.weakestCategory}, especially ${context.missedConcepts.slice(0, 2).join(" and ")}, as you work through early planetary missions.`
  };
}
