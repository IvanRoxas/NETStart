/**
 * Automated Test Suite for Aptitude Orbit Bounded Override & Deterministic Readiness
 * Run with: npx tsx scripts/test-orbit-override.ts
 */

import {
  computeDeterministicOrbitAndAffinities,
  processAIPathResponse,
} from "../src/ai/pathUtils";
import { AptitudeAIContext } from "../src/types/aptitude";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log("=================================================================");
  console.log("   NETStart Aptitude Diagnostic v2.3 Orbit Override Tests       ");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  // ---------------------------------------------------------------------------
  // TEST 1: The Specialist Case (PR 2, TD 2, Web 1, C++ 0, Python 0, Java 3)
  // ---------------------------------------------------------------------------
  console.log("TEST 1: Specialist Case (PR 2, TD 2, Web 1, C++ 0, Python 0, Java 3)");
  try {
    const specialistCategories = {
      patternRecognition: 2,
      taskDecomposition: 2,
      webDev: 1,
      cpp: 0,
      python: 0,
      java: 3,
    };

    const deterministic = computeDeterministicOrbitAndAffinities(specialistCategories);

    // Verify affinities
    const jupiter = deterministic.planets.find((p) => p.planet === "JUPITER")?.affinity;
    const saturn = deterministic.planets.find((p) => p.planet === "SATURN")?.affinity;
    const earth = deterministic.planets.find((p) => p.planet === "EARTH")?.affinity;
    const mars = deterministic.planets.find((p) => p.planet === "MARS")?.affinity;
    const venus = deterministic.planets.find((p) => p.planet === "VENUS")?.affinity;
    const mercury = deterministic.planets.find((p) => p.planet === "MERCURY")?.affinity;

    assert(jupiter === 87, `Jupiter affinity should be 87 (got ${jupiter})`);
    assert(saturn === 27, `Saturn affinity should be 27 (got ${saturn})`);
    assert(earth === 27, `Earth affinity should be 27 (got ${earth})`);
    assert(mars === 47, `Mars affinity should be 47 (got ${mars})`);
    assert(venus === 47, `Venus affinity should be 47 (got ${venus})`);
    assert(mercury === 47, `Mercury affinity should be 47 (got ${mercury})`);

    // Verify logicReadiness = Math.max(jupiter, saturn, earth)
    assert(
      deterministic.logicReadiness === 87,
      `logicReadiness should be Math.max(87, 27, 27) = 87 (got ${deterministic.logicReadiness})`
    );
    assert(
      deterministic.webReadiness === 47,
      `webReadiness should be 47 (got ${deterministic.webReadiness})`
    );
    assert(deterministic.track === "LOGIC", `Track should be LOGIC (got ${deterministic.track})`);

    // Verify deterministic pathOrder
    const expectedOrder = ["MOON", "JUPITER", "SATURN", "EARTH", "MARS", "VENUS", "MERCURY"];
    assert(
      JSON.stringify(deterministic.pathOrder) === JSON.stringify(expectedOrder),
      `pathOrder should be ${JSON.stringify(expectedOrder)} (got ${JSON.stringify(deterministic.pathOrder)})`
    );

    // Test 1B: Gemini proposes JUPITER (which is already first) -> override not applied (stays default)
    const aiContext: AptitudeAIContext = {
      totalCorrect: 8,
      totalPercent: 44,
      totalScore: "8/18 (44%)",
      categories: specialistCategories,
      computedTrack: deterministic.track,
      defaultPathOrder: deterministic.pathOrder,
      defaultFirstPlanet: deterministic.pathOrder[1],
      strongestCategory: "Java (100%)",
      weakestCategory: "C++ (0%)",
      missedConcepts: [],
    };

    const resSame = processAIPathResponse(
      {
        summary: "Excellent Java capabilities ✨",
        advice: "Continue practicing foundational logic.",
        recommendedFirstPlanet: "JUPITER",
      },
      aiContext
    );
    assert(!resSame.aiOverride.applied, "Override must NOT be applied when recommendedFirstPlanet matches current first");
    assert(
      JSON.stringify(resSame.pathOrder) === JSON.stringify(expectedOrder),
      "pathOrder must remain identical to deterministic order"
    );

    // Test 1C: Specialist with Web default, Gemini proposes Java override
    // Student with Web 2 (67%), PR 2, TD 2, C++ 0, Python 0, Java 3
    // Web affinity = 67 >= 60, Java = 87 >= 60. Suppose track placed MARS first:
    const webFirstContext: AptitudeAIContext = {
      ...aiContext,
      categories: { patternRecognition: 2, taskDecomposition: 2, webDev: 3, cpp: 0, python: 0, java: 3 },
    };
    // Suppose deterministic path placed Web first:
    const webDet = computeDeterministicOrbitAndAffinities(webFirstContext.categories);
    // Web readiness = 87, Logic readiness = 87. Balanced tie: webFirst.
    const resOverride = processAIPathResponse(
      {
        summary: "Remarkable Java mastery ✨",
        advice: "Dive into Java classes and OOP.",
        recommendedFirstPlanet: "JUPITER",
        overrideReason: "Java 3/3 displays elite mastery over web foundations.",
      },
      webFirstContext
    );
    if (webDet.pathOrder[1] !== "JUPITER") {
      assert(resOverride.aiOverride.applied, "Override should be applied when JUPITER is recommended over Web first");
      assert(resOverride.aiOverride.planet === "JUPITER", "Override planet should be JUPITER");
      assert(resOverride.pathOrder[1] === "JUPITER", "First planet after MOON must be JUPITER");
    }

    console.log("  PASS: Specialist case verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Specialist case error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Gemini proposing a planet with affinity < 60 (Must be rejected)
  // ---------------------------------------------------------------------------
  console.log("TEST 2: Gemini proposing a planet with affinity < 60 (Must be rejected)");
  try {
    const aiContext: AptitudeAIContext = {
      totalCorrect: 8,
      totalPercent: 44,
      totalScore: "8/18 (44%)",
      categories: {
        patternRecognition: 2,
        taskDecomposition: 2,
        webDev: 1,
        cpp: 0,
        python: 0,
        java: 3,
      },
      computedTrack: "LOGIC",
      defaultPathOrder: ["MOON", "JUPITER", "SATURN", "EARTH", "MARS", "VENUS", "MERCURY"],
      defaultFirstPlanet: "JUPITER",
      strongestCategory: "Java",
      weakestCategory: "C++",
      missedConcepts: [],
    };

    // Saturn affinity is 27 (< 60)
    const resLowAffinity = processAIPathResponse(
      {
        summary: "Let us try Saturn first ✨",
        advice: "Focus on systems pointers.",
        recommendedFirstPlanet: "SATURN",
        overrideReason: "Systems logic is valuable to learn early.",
      },
      aiContext
    );

    assert(!resLowAffinity.aiOverride.applied, "Override must be rejected when affinity < 60 (Saturn=27)");
    assert(resLowAffinity.aiOverride.planet === undefined, "Override planet must be undefined when rejected");
    assert(
      JSON.stringify(resLowAffinity.pathOrder) === JSON.stringify(aiContext.defaultPathOrder),
      "pathOrder must strictly retain deterministic order"
    );

    // Earth affinity is 27 (< 60)
    const resEarthLow = processAIPathResponse(
      {
        summary: "Let us try Python first ✨",
        advice: "Python scripts are easy to read.",
        recommendedFirstPlanet: "EARTH",
        overrideReason: "Python is beginner friendly.",
      },
      aiContext
    );
    assert(!resEarthLow.aiOverride.applied, "Override must be rejected for Earth (affinity 27 < 60)");
    assert(
      JSON.stringify(resEarthLow.pathOrder) === JSON.stringify(aiContext.defaultPathOrder),
      "pathOrder must strictly retain deterministic order"
    );

    console.log("  PASS: Low affinity (<60) rejection verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Low affinity test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Gemini proposing an invalid planet (Must be rejected)
  // ---------------------------------------------------------------------------
  console.log("TEST 3: Gemini proposing an invalid planet");
  try {
    const aiContext: AptitudeAIContext = {
      totalCorrect: 12,
      totalPercent: 67,
      totalScore: "12/18 (67%)",
      categories: {
        patternRecognition: 2,
        taskDecomposition: 2,
        webDev: 2,
        cpp: 2,
        python: 2,
        java: 2,
      },
      computedTrack: "BALANCED",
      defaultPathOrder: ["MOON", "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"],
      defaultFirstPlanet: "MARS",
      strongestCategory: "Balanced",
      weakestCategory: "None",
      missedConcepts: [],
    };

    // Invalid planet name: "PLUTO"
    const resPluto = processAIPathResponse(
      {
        summary: "Let's explore the outer edge ✨",
        advice: "Prepare for deep space.",
        recommendedFirstPlanet: "PLUTO",
        overrideReason: "Pluto is cool.",
      },
      aiContext
    );
    assert(!resPluto.aiOverride.applied, "Invalid planet 'PLUTO' must be rejected");
    assert(
      JSON.stringify(resPluto.pathOrder) === JSON.stringify(aiContext.defaultPathOrder),
      "pathOrder must strictly retain deterministic order"
    );

    // Invalid planet name: "HTML"
    const resHtml = processAIPathResponse(
      {
        summary: "Let's learn HTML ✨",
        advice: "HTML first.",
        recommendedFirstPlanet: "HTML",
      },
      aiContext
    );
    assert(!resHtml.aiOverride.applied, "Invalid planet 'HTML' must be rejected");

    // Invalid planet: empty string or random text
    const resEmpty = processAIPathResponse(
      {
        summary: "Test empty ✨",
        advice: "Advice",
        recommendedFirstPlanet: "   ",
      },
      aiContext
    );
    assert(!resEmpty.aiOverride.applied, "Empty/whitespace planet must be rejected");

    console.log("  PASS: Invalid planet rejection verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Invalid planet test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Gemini timeout / error / fallback
  // ---------------------------------------------------------------------------
  console.log("TEST 4: Gemini timeout / error / fallback");
  try {
    const aiContext: AptitudeAIContext = {
      totalCorrect: 10,
      totalPercent: 56,
      totalScore: "10/18 (56%)",
      categories: {
        patternRecognition: 2,
        taskDecomposition: 2,
        webDev: 2,
        cpp: 1,
        python: 1,
        java: 2,
      },
      computedTrack: "WEB",
      defaultPathOrder: ["MOON", "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"],
      defaultFirstPlanet: "MARS",
      strongestCategory: "Web",
      weakestCategory: "C++",
      missedConcepts: ["pointers"],
    };

    // 4A: null response (timeout / network error)
    const resNull = processAIPathResponse(null, aiContext);
    assert(resNull.isFallback, "isFallback must be true on null/timeout response");
    assert(!resNull.isValid, "isValid must be false on null response");
    assert(!resNull.aiOverride.applied, "aiOverride.applied must be false on timeout/error");
    assert(
      JSON.stringify(resNull.pathOrder) === JSON.stringify(aiContext.defaultPathOrder),
      "pathOrder must strictly retain deterministic order on timeout"
    );

    // 4B: Malformed JSON string or invalid schema structure
    const resMalformed = processAIPathResponse("not valid json at all", aiContext);
    assert(resMalformed.isFallback, "isFallback must be true on malformed response");
    assert(!resMalformed.aiOverride.applied, "aiOverride.applied must be false on malformed response");
    assert(
      JSON.stringify(resMalformed.pathOrder) === JSON.stringify(aiContext.defaultPathOrder),
      "pathOrder must strictly retain deterministic order on malformed response"
    );

    // 4C: Empty object missing required fields
    const resEmptyObj = processAIPathResponse({}, aiContext);
    assert(resEmptyObj.isFallback, "isFallback must be true on empty object missing required summary/advice");
    assert(!resEmptyObj.aiOverride.applied, "aiOverride.applied must be false on empty response");

    console.log("  PASS: Gemini timeout/error/fallback handling verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Timeout/fallback test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Web Block Trio Override (Mars/Venus/Mercury moved as a block)
  // ---------------------------------------------------------------------------
  console.log("TEST 5: Web Block Trio Override (Mars/Venus/Mercury moved as a fixed block)");
  try {
    // Student with Java 3, Web 3, C++ 0, Python 0.
    // Logic readiness = 87, Web readiness = 87.
    // Default Logic order: ["MOON", "JUPITER", "SATURN", "EARTH", "MARS", "VENUS", "MERCURY"]
    const aiContext: AptitudeAIContext = {
      totalCorrect: 11,
      totalPercent: 61,
      totalScore: "11/18 (61%)",
      categories: {
        patternRecognition: 2,
        taskDecomposition: 2,
        webDev: 2,
        cpp: 0,
        python: 0,
        java: 3,
      },
      computedTrack: "LOGIC",
      defaultPathOrder: ["MOON", "JUPITER", "SATURN", "EARTH", "MARS", "VENUS", "MERCURY"],
      defaultFirstPlanet: "JUPITER",
      strongestCategory: "Java",
      weakestCategory: "C++",
      missedConcepts: [],
    };

    // Gemini proposes VENUS (affinity 87 >= 60). Since it's a web planet, the whole web trio must move as a block
    const resWebBlock = processAIPathResponse(
      {
        summary: "Web readiness is stellar ✨",
        advice: "Start with the web foundations.",
        recommendedFirstPlanet: "VENUS",
        overrideReason: "Visual styling and web foundations are strong.",
      },
      aiContext
    );

    assert(resWebBlock.aiOverride.applied, "Web override should be applied");
    assert(resWebBlock.aiOverride.planet === "VENUS", "Override planet should be VENUS");
    // Verify whole web trio is moved as a block in fixed order (MARS, VENUS, MERCURY) right after MOON
    const expectedWebBlockOrder = ["MOON", "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"];
    assert(
      JSON.stringify(resWebBlock.pathOrder) === JSON.stringify(expectedWebBlockOrder),
      `pathOrder must move web trio as fixed block: expected ${JSON.stringify(expectedWebBlockOrder)}, got ${JSON.stringify(resWebBlock.pathOrder)}`
    );

    console.log("  PASS: Web trio block move verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Web block move test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Schema tolerance - Gemini returns null/NONE/invalid for override fields
  // ---------------------------------------------------------------------------
  console.log("TEST 6: Tolerant Schema - Gemini returns recommendedFirstPlanet null and overrideReason null");
  try {
    const aiContext: AptitudeAIContext = {
      totalCorrect: 12,
      totalPercent: 67,
      totalScore: "12/18 (67%)",
      categories: {
        patternRecognition: 2,
        taskDecomposition: 2,
        webDev: 2,
        cpp: 2,
        python: 2,
        java: 2,
      },
      computedTrack: "BALANCED",
      defaultPathOrder: ["MOON", "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"],
      defaultFirstPlanet: "MARS",
      strongestCategory: "Balanced",
      weakestCategory: "None",
      missedConcepts: [],
    };

    // 6A: Gemini returns explicit null for recommendedFirstPlanet and overrideReason
    const resNullOverride = processAIPathResponse(
      {
        summary: "Excellent problem solving baseline ✨",
        advice: "Proceed with lunar calibrations.",
        recommendedFirstPlanet: null,
        overrideReason: null,
      },
      aiContext
    );

    assert(resNullOverride.isValid, "Response must remain valid when override fields are null");
    assert(!resNullOverride.isFallback, "Response must NOT trigger fallback when override fields are null");
    assert(!resNullOverride.aiOverride.applied, "Override must NOT be applied when recommendedFirstPlanet is null");
    assert(resNullOverride.result.summary.includes("Excellent problem solving"), "Summary must be preserved");
    assert(resNullOverride.result.advice === "Proceed with lunar calibrations.", "Advice must be preserved");
    assert(
      JSON.stringify(resNullOverride.pathOrder) === JSON.stringify(aiContext.defaultPathOrder),
      "pathOrder must remain default"
    );

    // 6B: Gemini returns empty string or "NONE"
    const resNone = processAIPathResponse(
      {
        summary: "Great analytical profile ✨",
        advice: "Focus on loops.",
        recommendedFirstPlanet: "NONE",
        overrideReason: "",
      },
      aiContext
    );
    assert(resNone.isValid && !resNone.isFallback, "NONE / empty string must be valid without triggering fallback");
    assert(!resNone.aiOverride.applied, "Override must NOT be applied for 'NONE'");
    assert(resNone.result.summary.includes("Great analytical profile"), "Summary must be preserved for 'NONE'");

    console.log("  PASS: Schema tolerance for null/NONE/empty override fields verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Schema tolerance test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Raw Section Score Gate (score 1 rejected vs score 2 accepted)
  // ---------------------------------------------------------------------------
  console.log("TEST 7: Raw Section Score Gate (score 1 rejected vs score 2 accepted)");
  try {
    // Score profile producing candidate affinity exactly 60:
    // Java = 1/3 (33%), TD = 3/3 (100%), PR = 3/3 (100%)
    // jupiterAffinity = Math.round(33 * 0.60 + 100 * 0.25 + 100 * 0.15) = Math.round(19.8 + 25 + 15) = 60
    // WebDev = 2/3 (67%) -> webAffinity = Math.round(67 * 0.60 + 100 * 0.25 + 100 * 0.15) = 80
    // Track: Web affinity 80 > Logic affinity 60 -> track = "WEB", default first = "MARS"
    const score1Categories = {
      patternRecognition: 3,
      taskDecomposition: 3,
      webDev: 2,
      cpp: 0,
      python: 0,
      java: 1, // Score 1!
    };
    const det1 = computeDeterministicOrbitAndAffinities(score1Categories);
    const jupiterAffinity1 = det1.planets.find((p) => p.planet === "JUPITER")?.affinity;
    assert(jupiterAffinity1 === 60, `Jupiter affinity must be exactly 60 (got ${jupiterAffinity1})`);
    assert(det1.pathOrder[1] === "MARS", "Deterministic first planet must be MARS");

    const context1: AptitudeAIContext = {
      totalCorrect: 9,
      totalPercent: 50,
      totalScore: "9/18 (50%)",
      categories: score1Categories,
      computedTrack: det1.track,
      defaultPathOrder: det1.pathOrder,
      defaultFirstPlanet: det1.pathOrder[1],
      strongestCategory: "Logic & Pattern",
      weakestCategory: "Java",
      missedConcepts: [],
    };

    // 7A: Candidate with affinity 60 but section score 1 -> MUST BE REJECTED
    const resScore1 = processAIPathResponse(
      {
        summary: "Solid analytical foundation ✨",
        advice: "Practice OOP syntax.",
        recommendedFirstPlanet: "JUPITER",
        overrideReason: "Has high potential in Java.",
      },
      context1
    );
    assert(!resScore1.aiOverride.applied, "Override must be REJECTED when section score is 1, even if affinity is 60");
    assert(resScore1.pathOrder[1] === "MARS", "First planet must remain MARS");

    // 7B: Candidate with section score 2 (affinity >= 60) -> MUST BE ACCEPTED
    // Java = 2/3 (67%), TD = 2/3 (67%), PR = 2/3 (67%) -> jupiterAffinity = 67 >= 60
    // WebDev = 3/3 (100%) -> webAffinity = 87
    // Deterministic: track = BALANCED, tie-break webReadiness (87) >= logicReadiness (67) -> MARS first
    const score2Categories = {
      patternRecognition: 2,
      taskDecomposition: 2,
      webDev: 3,
      cpp: 0,
      python: 0,
      java: 2, // Score 2!
    };
    const det2 = computeDeterministicOrbitAndAffinities(score2Categories);
    const jupiterAffinity2 = det2.planets.find((p) => p.planet === "JUPITER")?.affinity;
    assert(jupiterAffinity2 === 67, `Jupiter affinity must be 67 >= 60 (got ${jupiterAffinity2})`);
    assert(det2.pathOrder[1] === "MARS", "Deterministic first planet must be MARS");

    const context2: AptitudeAIContext = {
      totalCorrect: 9,
      totalPercent: 50,
      totalScore: "9/18 (50%)",
      categories: score2Categories,
      computedTrack: det2.track,
      defaultPathOrder: det2.pathOrder,
      defaultFirstPlanet: det2.pathOrder[1],
      strongestCategory: "Web",
      weakestCategory: "C++",
      missedConcepts: [],
    };

    const resScore2 = processAIPathResponse(
      {
        summary: "Competent Java understanding ✨",
        advice: "Dive into Java classes.",
        recommendedFirstPlanet: "JUPITER",
        overrideReason: "Java 2/3 is strong enough for early start.",
      },
      context2
    );
    assert(resScore2.aiOverride.applied, "Override must be ACCEPTED when section score is 2 and affinity >= 60");
    assert(resScore2.aiOverride.planet === "JUPITER", "Override planet must be JUPITER");
    assert(resScore2.pathOrder[1] === "JUPITER", "First planet after MOON must be JUPITER");

    console.log("  PASS: Raw section score gate (score 1 rejected vs score 2 accepted) verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Raw section score gate test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Track and RecommendedLearningPath Consistency
  // ---------------------------------------------------------------------------
  console.log("TEST 8: Track & Learning Path Consistency (Applied Override vs No Override)");
  try {
    // 8A: Applied override case (Web default, JUPITER overridden to first)
    // Student with Web 3 (100%), Java 3 (100%), PR 2, TD 2
    const overrideCategories = {
      patternRecognition: 2,
      taskDecomposition: 2,
      webDev: 3,
      cpp: 0,
      python: 0,
      java: 3,
    };
    const detOverride = computeDeterministicOrbitAndAffinities(overrideCategories);
    assert(detOverride.track === "BALANCED", "Original deterministic track should be BALANCED");
    assert(detOverride.pathOrder[1] === "MARS", "Original deterministic first planet should be MARS");

    const overrideContext: AptitudeAIContext = {
      totalCorrect: 10,
      totalPercent: 56,
      totalScore: "10/18 (56%)",
      categories: overrideCategories,
      computedTrack: detOverride.track,
      defaultPathOrder: detOverride.pathOrder,
      defaultFirstPlanet: detOverride.pathOrder[1],
      strongestCategory: "Java",
      weakestCategory: "C++",
      missedConcepts: [],
    };

    const resApplied = processAIPathResponse(
      {
        summary: "Strong Java capability ✨",
        advice: "Start with Java OOP.",
        recommendedFirstPlanet: "JUPITER",
        overrideReason: "Java 3/3 indicates readiness.",
      },
      overrideContext
    );

    assert(resApplied.aiOverride.applied, "Override must be applied");
    assert(resApplied.pathOrder[1] === "JUPITER", "First planet must be JUPITER");
    assert(resApplied.finalTrack === "LOGIC", "finalTrack must be LOGIC when first planet is JUPITER");
    assert(resApplied.result.track === "LOGIC", "result.track must be LOGIC when first planet is JUPITER");
    assert(
      resApplied.deterministicTrack === "BALANCED",
      "deterministicTrack must retain original deterministic value (BALANCED)"
    );
    assert(
      resApplied.recommendedLearningPath === "Backend Engineering & Systems Architecture (Java / C++ / Python)",
      `recommendedLearningPath must match Java logic label (got ${resApplied.recommendedLearningPath})`
    );

    // 8B: No-override case keeps deterministic track and path
    // Same student, but Gemini does not override (proposes MARS or null)
    const resNoOverride = processAIPathResponse(
      {
        summary: "Balanced skillset ✨",
        advice: "Follow standard track.",
        recommendedFirstPlanet: null,
      },
      overrideContext
    );

    assert(!resNoOverride.aiOverride.applied, "Override must NOT be applied");
    assert(resNoOverride.finalTrack === "BALANCED", "finalTrack must remain BALANCED when no override applied");
    assert(resNoOverride.result.track === "BALANCED", "result.track must remain BALANCED when no override applied");
    assert(
      resNoOverride.deterministicTrack === "BALANCED",
      "deterministicTrack must be BALANCED"
    );
    assert(
      resNoOverride.recommendedLearningPath === "Fullstack Systems & Advanced Architecture (Full Planetary Sequence)" ||
      resNoOverride.recommendedLearningPath === "Fullstack Web & Distributed Systems",
      `recommendedLearningPath must remain deterministic BALANCED label (got ${resNoOverride.recommendedLearningPath})`
    );

    console.log("  PASS: Track & learning path consistency verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Track & learning path consistency test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("=================================================================");
  console.log(`TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log("=================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
