import { config } from "dotenv";
config(); // load .env
import { generateStructuredResponse } from "../src/ai/client";
import { getAptitudePrompt, getAptitudeFallback } from "../src/ai/prompts/aptitude";
import { NOVA_SYSTEM_INSTRUCTION } from "../src/ai/prompts/shared";
import { aptitudeSchema } from "../src/ai/schemas/aptitudeSchema";
import { mockAptitudeResponse } from "../src/ai/mock";
import { processAIPathResponse } from "../src/ai/pathUtils";

async function runLiveTest() {
  console.log("Starting Live Gemini API Call...");

  const aiContext = {
    totalCorrect: 12,
    totalPercent: 80,
    totalScore: "12/15 (80%)",
    categories: {
      patternRecognition: 5, // perfect pattern
      taskDecomposition: 4, 
      logicalReasoning: 3, 
    },
    strongestCategory: "Pattern Recognition (100%)",
    weakestCategory: "Logical Reasoning (60%)",
    missedConcepts: ["Pointer Memory Management", "Deep Recursion"],
  };

  try {
    const response = await generateStructuredResponse(
      "aptitude-test-live",
      NOVA_SYSTEM_INSTRUCTION,
      getAptitudePrompt(aiContext),
      aptitudeSchema,
      {
        type: "OBJECT",
        properties: {
          track: { type: "STRING" },
          summary: { type: "STRING" },
          planets: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                planet: { type: "STRING" },
                affinity: { type: "NUMBER" },
                reason: { type: "STRING" }
              },
              required: ["planet", "affinity", "reason"]
            }
          }
        },
        required: ["track", "summary", "planets"]
      },
      () => getAptitudeFallback(aiContext),
      mockAptitudeResponse,
      0.2
    );

    console.log("\n--- RAW API RESPONSE (Source: " + response.source + ") ---");
    console.dir(response.data, { depth: null });

    console.log("\n--- PROCESSING VIA PATH UTILS ---");
    const processed = processAIPathResponse(response.data, aiContext);
    console.log("Is Valid:", processed.isValid);
    console.log("Is Fallback:", processed.isFallback);
    console.log("Path Order:", processed.pathOrder);
    
    if (processed.isValid && !processed.isFallback) {
      console.log("\n✅ GEMINI PAYLOAD IS PERFECTLY USABLE BY NETSTART.");
    } else {
      console.log("\n❌ GEMINI PAYLOAD FAILED TO PROCESS CLEANLY.");
    }

  } catch (err) {
    console.error("Live test failed:", err);
  }
}

runLiveTest();
