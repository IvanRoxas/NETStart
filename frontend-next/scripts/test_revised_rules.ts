import { getHintTier } from "../src/lib/hints";
import { processAIPathResponse } from "../src/ai/pathUtils";

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
};

const runTests = () => {
  console.log("Running Hint Tier Tests...");
  const hintTests = [
    { scores: [1,1,1], expected: "LOW" }, // 3
    { scores: [3,3,3], expected: "LOW" }, // 9
    { scores: [4,4,4], expected: "HIGH" }, // 12
    { scores: [5,5,5], expected: "HIGH" }, // 15
    { scores: [5,5,1], expected: "MID" }, // 11
    { scores: [0,0,0], expected: "LOW" }, // 0
  ];

  for (const t of hintTests) {
    const tier = getHintTier({
      patternRecognition: t.scores[0],
      taskDecomposition: t.scores[1],
      logicalReasoning: t.scores[2]
    });
    assert(tier === t.expected, `Hint tier for ${t.scores.join("/")} should be ${t.expected}, got ${tier}`);
  }
  console.log("✅ Hint Tier Tests Passed!");

  console.log("\nRunning Path Ordering Tests...");

  // Mock aiContext for testing path ordering
  const getContext = (p: number, d: number, l: number) => ({
    totalCorrect: p+d+l,
    totalPercent: 0,
    totalScore: "",
    categories: { patternRecognition: p, taskDecomposition: d, logicalReasoning: l },
    strongestCategory: "", weakestCategory: "", missedConcepts: []
  });

  // Test 1: WEB profile
  const webContext = getContext(5, 3, 1);
  const webResponse = {
    track: "WEB",
    summary: "",
    planets: [
      { planet: "MARS", affinity: 90, reason: "" },
      { planet: "VENUS", affinity: 80, reason: "" },
      { planet: "MERCURY", affinity: 70, reason: "" },
      { planet: "EARTH", affinity: 99, reason: "" }, // Highest logic affinity
      { planet: "SATURN", affinity: 50, reason: "" },
      { planet: "JUPITER", affinity: 40, reason: "" }
    ]
  };
  const webProcessed = processAIPathResponse(webResponse, webContext);
  assert(webProcessed.pathOrder.join(",") === "MOON,MARS,VENUS,MERCURY,EARTH,SATURN,JUPITER", "WEB order failed");

  // Test 2: LOGIC Ties (Difference < 5 points)
  const logicContext = getContext(1, 3, 5);
  const logicResponse = {
    track: "LOGIC",
    summary: "",
    planets: [
      { planet: "MARS", affinity: 10, reason: "" },
      { planet: "VENUS", affinity: 10, reason: "" },
      { planet: "MERCURY", affinity: 10, reason: "" },
      { planet: "SATURN", affinity: 84, reason: "" },
      { planet: "EARTH", affinity: 82, reason: "" },
      { planet: "JUPITER", affinity: 80, reason: "" }
    ]
  };
  // Difference between Saturn(84) and Jupiter(80) is 4 (less than 5).
  // Between Saturn(84) and Earth(82) is 2 (less than 5).
  // Wait, the sort uses `b.affinity - a.affinity`. 
  // Let's see: Saturn vs Earth: diff=2. Tie break: JUPITER, SATURN, EARTH.
  // So SATURN vs EARTH -> SATURN wins.
  // SATURN vs JUPITER -> JUPITER wins.
  // Result should be JUPITER, SATURN, EARTH because all are within 5 points of each other.
  const logicProcessed = processAIPathResponse(logicResponse, logicContext);
  assert(logicProcessed.pathOrder.join(",") === "MOON,JUPITER,SATURN,EARTH,MARS,VENUS,MERCURY", "Logic ties failed");

  // Test 3: BALANCED Interleaving
  const balancedContext = getContext(4, 3, 4); // diff === 0
  const balancedResponse = {
    track: "BALANCED",
    summary: "",
    planets: [
      { planet: "MARS", affinity: 50, reason: "" },
      { planet: "VENUS", affinity: 50, reason: "" },
      { planet: "MERCURY", affinity: 50, reason: "" },
      { planet: "EARTH", affinity: 80, reason: "" },
      { planet: "SATURN", affinity: 60, reason: "" },
      { planet: "JUPITER", affinity: 40, reason: "" }
    ]
  };
  // Logic order by affinity (no ties): EARTH, SATURN, JUPITER
  // WEB order: MARS, VENUS, MERCURY
  // Interleaved starting with WEB: MARS, EARTH, VENUS, SATURN, MERCURY, JUPITER
  const balancedProcessed = processAIPathResponse(balancedResponse, balancedContext);
  assert(balancedProcessed.pathOrder.join(",") === "MOON,MARS,EARTH,VENUS,SATURN,MERCURY,JUPITER", "BALANCED interleave failed");

  console.log("✅ Path Ordering Tests Passed!");
};

runTests();
