import { AptitudeAIContext, AptitudeAIInsight } from "@/types/aptitude";

/**
 * Generates tailored AI diagnostic feedback and advice based strictly on
 * the compact aptitude assessment summary (no answers, no questions).
 */
export async function generateAptitudeAIInsights(
  context: AptitudeAIContext
): Promise<AptitudeAIInsight> {
  const apiKey =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `
You are Nova, the supportive AI flight instructor and telemetry analyst for the NETStart space exploration coding academy.
The student (Operator) has just completed their diagnostic aptitude assessment.

Here is the compact assessment telemetry:
- Overall Score: ${context.totalScore}
- Pattern Recognition: ${context.categories.patternRecognition}
- Task Decomposition: ${context.categories.taskDecomposition}
- Logical Reasoning: ${context.categories.logicalReasoning}
- Strongest Domain: ${context.strongestCategory}
- Growth Area: ${context.weakestCategory}
- Concepts to Reinforce: ${context.missedConcepts.length > 0 ? context.missedConcepts.join(", ") : "None! Flawless diagnostic."}

Provide a concise, motivating diagnostic analysis in JSON format with exactly these two fields:
{
  "summary": "A 1-2 sentence overview of their cognitive strengths as a space coder.",
  "advice": "A 1-2 sentence tactical recommendation for approaching upcoming planetary missions, especially targeting their growth areas."
}
Return only valid JSON.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanedText);
          if (parsed.summary && parsed.advice) {
            return {
              summary: String(parsed.summary).trim(),
              advice: String(parsed.advice).trim(),
            };
          }
        }
      }
    } catch (err) {
      console.warn("[GEMINI_AI] AI insight generation unavailable, utilizing deterministic profile fallback:", err);
    }
  }

  // Graceful deterministic fallback when Gemini is offline or unconfigured
  return generateFallbackInsight(context);
}

function generateFallbackInsight(context: AptitudeAIContext): AptitudeAIInsight {
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
