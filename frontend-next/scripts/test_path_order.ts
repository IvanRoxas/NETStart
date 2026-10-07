import { processAIPathResponse } from "../src/ai/pathUtils";

const aiContext = {
  totalCorrect: 15,
  totalPercent: 100,
  totalScore: "15/15 (100%)",
  categories: {
    patternRecognition: 5,
    taskDecomposition: 5,
    logicalReasoning: 5,
  },
  strongestCategory: "Pattern Recognition (100%)",
  weakestCategory: "Logical Reasoning (100%)",
  missedConcepts: [],
};

function runTest(name: string, mockResponse: any, expectedValid: boolean, expectedFallback: boolean, expectedOrder: string[]) {
  console.log(`\n--- Test: ${name} ---`);
  const result = processAIPathResponse(mockResponse, aiContext);
  console.log("IsValid:", result.isValid, "Expected:", expectedValid);
  console.log("IsFallback:", result.isFallback, "Expected:", expectedFallback);
  console.log("PathOrder:", JSON.stringify(result.pathOrder));
  console.log("Expected PathOrder:", JSON.stringify(expectedOrder));
  if (
    result.isValid === expectedValid &&
    result.isFallback === expectedFallback &&
    JSON.stringify(result.pathOrder) === JSON.stringify(expectedOrder)
  ) {
    console.log("✅ PASSED");
  } else {
    console.log("❌ FAILED");
    process.exit(1);
  }
}

// 1. Valid Response (WEB Track)
runTest(
  "Valid Response (WEB Track)",
  {
    track: "WEB",
    summary: "Great job.",
    planets: [
      { planet: "MARS", affinity: 90, reason: "" },
      { planet: "VENUS", affinity: 85, reason: "" },
      { planet: "MERCURY", affinity: 80, reason: "" },
      { planet: "JUPITER", affinity: 70, reason: "" },
      { planet: "SATURN", affinity: 60, reason: "" },
      { planet: "EARTH", affinity: 50, reason: "" }
    ]
  },
  true,
  false,
  ["MOON", "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"]
);

// 2. Malformed Response (missing field)
runTest(
  "Malformed Response (missing field)",
  {
    track: "WEB",
    // missing summary
    planets: []
  },
  false,
  true,
  ["MOON", "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"]
);

// 3. Duplicate planets
runTest(
  "Duplicate planets",
  {
    track: "WEB",
    summary: "Duplicate test.",
    planets: [
      { planet: "MARS", affinity: 90, reason: "" },
      { planet: "MARS", affinity: 85, reason: "" },
      { planet: "MERCURY", affinity: 80, reason: "" },
      { planet: "JUPITER", affinity: 70, reason: "" },
      { planet: "SATURN", affinity: 60, reason: "" },
      { planet: "EARTH", affinity: 50, reason: "" }
    ]
  },
  false,
  true,
  ["MOON", "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"]
);

// 4. BALANCED interleaving
runTest(
  "BALANCED interleaving",
  {
    track: "BALANCED",
    summary: "Balanced.",
    planets: [
      { planet: "MARS", affinity: 90, reason: "" },
      { planet: "VENUS", affinity: 80, reason: "" },
      { planet: "MERCURY", affinity: 70, reason: "" },
      { planet: "JUPITER", affinity: 85, reason: "" },
      { planet: "SATURN", affinity: 75, reason: "" },
      { planet: "EARTH", affinity: 65, reason: "" }
    ]
  },
  true,
  false,
  ["MOON", "MARS", "JUPITER", "VENUS", "SATURN", "MERCURY", "EARTH"]
);

// 5. Tie-breaking
runTest(
  "Tie-breaking",
  {
    track: "LOGIC",
    summary: "Ties.",
    planets: [
      { planet: "EARTH", affinity: 90, reason: "" },
      { planet: "SATURN", affinity: 90, reason: "" }, // Tie with EARTH. SATURN is before EARTH in DEFAULT, so SATURN comes first.
      { planet: "JUPITER", affinity: 90, reason: "" }, // Tie. JUPITER comes before SATURN.
      { planet: "MARS", affinity: 50, reason: "" },
      { planet: "VENUS", affinity: 50, reason: "" },
      { planet: "MERCURY", affinity: 50, reason: "" }
    ]
  },
  true,
  false,
  ["MOON", "JUPITER", "SATURN", "EARTH", "MARS", "VENUS", "MERCURY"]
);

console.log("\nALL TESTS PASSED.");
