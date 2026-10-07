import { config } from "dotenv";
config();
import { generateStructuredResponse } from "../src/ai/client";
import { getAptitudePrompt, getAptitudeFallback } from "../src/ai/prompts/aptitude";
import { NOVA_SYSTEM_INSTRUCTION } from "../src/ai/prompts/shared";
import { aptitudeSchema } from "../src/ai/schemas/aptitudeSchema";
import { mockAptitudeResponse } from "../src/ai/mock";
import { processAIPathResponse } from "../src/ai/pathUtils";

const profiles = [
  { name: "Web-strong", scores: [5, 3, 1] },
  { name: "Logic-strong", scores: [1, 3, 5] },
  { name: "Balanced", scores: [4, 4, 4] },
  { name: "Near-tie", scores: [4, 3, 3] },
  { name: "All low", scores: [1, 1, 1] },
  { name: "All high", scores: [5, 5, 5] },
];

async function runProfileTests() {
  console.log("Starting Profile Latency Tests (3 runs per profile)...");
  const results = [];
  const latencies: Record<string, number[]> = {};

  for (const profile of profiles) {
    console.log(`\nTesting Profile: ${profile.name} [${profile.scores.join("/")}]`);
    latencies[profile.name] = [];

    const totalCorrect = profile.scores[0] + profile.scores[1] + profile.scores[2];
    const totalPercent = Math.round((totalCorrect / 15) * 100);

    const aiContext = {
      totalCorrect,
      totalPercent,
      totalScore: `${totalCorrect}/15 (${totalPercent}%)`,
      categories: {
        patternRecognition: profile.scores[0],
        taskDecomposition: profile.scores[1],
        logicalReasoning: profile.scores[2],
      },
      strongestCategory: "N/A",
      weakestCategory: "N/A",
      missedConcepts: [],
    };

    for (let i = 0; i < 3; i++) {
      const startTime = performance.now();
      try {
        const response = await generateStructuredResponse(
          "aptitude-test-profiles",
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

        const elapsed = performance.now() - startTime;
        latencies[profile.name].push(elapsed);
        console.log(`  Run ${i + 1}: ${elapsed.toFixed(0)} ms`);

        if (i === 0) { // save only first result to json
          const processed = processAIPathResponse(response.data, aiContext);
          results.push({
            profile: profile.name,
            scores: profile.scores.join("/"),
            track: response.data.track,
            summary: response.data.summary,
            planets: response.data.planets,
            pathOrder: processed.pathOrder
          });
        }
      } catch (err) {
        console.error(`  Run ${i + 1} failed:`, err);
      }
    }

    const arr = latencies[profile.name];
    if (arr.length > 0) {
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      console.log(`  => Min: ${min.toFixed(0)}ms | Avg: ${avg.toFixed(0)}ms | Max: ${max.toFixed(0)}ms`);
    }
  }

  const fs = require('fs');
  fs.writeFileSync('profiles_results.json', JSON.stringify(results, null, 2));
  console.log("\nFinished testing all profiles. Results saved to profiles_results.json");
}

runProfileTests();
