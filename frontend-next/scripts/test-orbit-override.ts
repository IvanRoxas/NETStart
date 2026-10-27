/**
 * Automated Test Suite for Aptitude Orbit Bounded Override & Deterministic Readiness (22-Question Schema)
 * Run with: npx tsx scripts/test-orbit-override.ts
 */

import {
  computeDeterministicOrbitAndAffinities,
  processAIPathResponse,
  extractSubcategoriesFromUserOrResult,
} from "../src/ai/pathUtils";
import { AptitudeAIContext } from "../src/types/aptitude";
import { getSectionTotals } from "../src/lib/aptitudeTotals";
import questionsData from "../src/server/data/aptitude_questions.server.json";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log("=================================================================");
  console.log("   NETStart Aptitude Diagnostic v2.4 (22 Questions) Test Suite   ");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  // ---------------------------------------------------------------------------
  // TEST 1: Question Bank Integrity
  // ---------------------------------------------------------------------------
  console.log("TEST 1: Question Bank Integrity (22 Questions, Unique IDs, Answer Keys)");
  try {
    const questions = questionsData.questions;
    assert(questions.length === 22, `Total questions must be exactly 22 (got ${questions.length})`);

    const idSet = new Set<string>();
    const subCounts: Record<string, number> = {
      pattern_recognition: 0,
      task_decomposition: 0,
      web_dev: 0,
      cpp: 0,
      python: 0,
      java: 0,
    };

    const newIds = ["web-4", "cpp-4", "py-4", "java-4"];

    for (const q of questions) {
      assert(!idSet.has(q.id), `Question ID must be unique: duplicated id ${q.id}`);
      idSet.add(q.id);

      const sub = (q.subcategory || "").toLowerCase();
      assert(sub in subCounts, `Unknown subcategory "${q.subcategory}" on question ${q.id}`);
      subCounts[sub]++;

      const ans = q.answer?.trim().toUpperCase();
      assert(["A", "B", "C", "D"].includes(ans), `Answer must be A, B, C, or D for ${q.id} (got ${ans})`);
      assert(
        q.options && typeof q.options === "object" && Boolean(q.options[ans as keyof typeof q.options]),
        `Answer option "${ans}" must exist in options for ${q.id}`
      );

      if (newIds.includes(q.id)) {
        assert(ans === "D", `New question ${q.id} must have correct answer D (got ${ans})`);
      }
    }

    assert(subCounts.pattern_recognition === 3, `pattern_recognition count must be 3 (got ${subCounts.pattern_recognition})`);
    assert(subCounts.task_decomposition === 3, `task_decomposition count must be 3 (got ${subCounts.task_decomposition})`);
    assert(subCounts.web_dev === 4, `web_dev count must be 4 (got ${subCounts.web_dev})`);
    assert(subCounts.cpp === 4, `cpp count must be 4 (got ${subCounts.cpp})`);
    assert(subCounts.python === 4, `python count must be 4 (got ${subCounts.python})`);
    assert(subCounts.java === 4, `java count must be 4 (got ${subCounts.java})`);

    const answerKeyDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    for (const q of questions) {
      const ans = q.answer?.trim().toUpperCase();
      answerKeyDistribution[ans] = (answerKeyDistribution[ans] || 0) + 1;
    }

    console.log("  Answer-Key Distribution (22 Questions):");
    console.log(`    A: ${answerKeyDistribution.A}, B: ${answerKeyDistribution.B}, C: ${answerKeyDistribution.C}, D: ${answerKeyDistribution.D}`);
    console.log("  PASS: Question bank verification passed.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Question bank test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Specialist Case (PR 2/3, TD 2/3, Web 2/4, C++ 0/4, Python 0/4, Java 4/4)
  // ---------------------------------------------------------------------------
  console.log("TEST 2: Specialist Case (PR 2/3, TD 2/3, Web 2/4, C++ 0/4, Python 0/4, Java 4/4)");
  try {
    const specialistCategories = {
      patternRecognition: 2,
      taskDecomposition: 2,
      webDev: 2,
      cpp: 0,
      python: 0,
      java: 4,
    };

    const deterministic = computeDeterministicOrbitAndAffinities(specialistCategories);

    // Verify affinities
    // PR 2/3 = 67%, TD 2/3 = 67%, Java 4/4 = 100% -> Jupiter: 100*0.60 + 67*0.25 + 67*0.15 = 87
    // C++ 0/4 = 0% -> Saturn: 0*0.60 + 67*0.25 + 67*0.15 = 27
    // Python 0/4 = 0% -> Earth: 0*0.60 + 67*0.25 + 67*0.15 = 27
    // Web 2/4 = 50% -> Web: 50*0.60 + 67*0.25 + 67*0.15 = 57
    const jupiter = deterministic.planets.find((p) => p.planet === "JUPITER")?.affinity;
    const saturn = deterministic.planets.find((p) => p.planet === "SATURN")?.affinity;
    const earth = deterministic.planets.find((p) => p.planet === "EARTH")?.affinity;
    const mars = deterministic.planets.find((p) => p.planet === "MARS")?.affinity;

    assert(jupiter === 87, `Jupiter affinity should be 87 (got ${jupiter})`);
    assert(saturn === 27, `Saturn affinity should be 27 (got ${saturn})`);
    assert(earth === 27, `Earth affinity should be 27 (got ${earth})`);
    assert(mars === 57, `Mars affinity should be 57 (got ${mars})`);

    // Verify logicReadiness = Math.max(jupiter, saturn, earth)
    assert(deterministic.logicReadiness === 87, `logicReadiness should be 87 (got ${deterministic.logicReadiness})`);
    assert(deterministic.webReadiness === 57, `webReadiness should be 57 (got ${deterministic.webReadiness})`);
    assert(deterministic.track === "LOGIC", `Track should be LOGIC (got ${deterministic.track})`);

    // Jupiter first on the math alone
    const expectedOrder = ["MOON", "JUPITER", "SATURN", "EARTH", "MARS", "VENUS", "MERCURY"];
    assert(
      JSON.stringify(deterministic.pathOrder) === JSON.stringify(expectedOrder),
      `pathOrder should be ${JSON.stringify(expectedOrder)} (got ${JSON.stringify(deterministic.pathOrder)})`
    );

    // Gemini proposes JUPITER -> already first -> aiOverride.applied is false
    const aiContext: AptitudeAIContext = {
      totalCorrect: 10,
      totalPercent: 45,
      totalScore: "10/22 (45%)",
      totalQuestions: 22,
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
    assert(resSame.pathOrder[1] === "JUPITER", "First planet after MOON must be JUPITER on math alone");

    console.log("  PASS: Specialist case verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Specialist case error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 3: 4/4 In A Language Is Not Capped At 3 And Gives 100%
  // ---------------------------------------------------------------------------
  console.log("TEST 3: 4/4 In Language Not Capped At 3 (Gives 100% and 60% Affinity Alone)");
  try {
    const perfectCategories = {
      patternRecognition: 0,
      taskDecomposition: 0,
      webDev: 4,
      cpp: 0,
      python: 0,
      java: 0,
    };

    const deterministic = computeDeterministicOrbitAndAffinities(perfectCategories);
    const marsAffinity = deterministic.planets.find((p) => p.planet === "MARS")?.affinity;

    // 4/4 = 100% * 0.60 = 60. (If it were capped at 3/4 = 75%, 75 * 0.60 = 45).
    assert(marsAffinity === 60, `Mars affinity for 4/4 webDev should be 60 (got ${marsAffinity})`);

    const extracted = extractSubcategoriesFromUserOrResult({
      aptitudeResult: {
        totalQuestions: 22,
        subcategories: {
          web_dev: { id: "web_dev", name: "Web Development", correct: 4, total: 4, percent: 100 },
        },
      },
    });

    assert(extracted.webDev === 4, `Extracted webDev count should be 4 (not capped to 3) (got ${extracted.webDev})`);
    assert(extracted.totals.webDev === 4, `Extracted webDev total should be 4 (got ${extracted.totals.webDev})`);
    assert(extracted.percents.webDev === 100, `Extracted webDev percent should be 100% (got ${extracted.percents.webDev})`);

    console.log("  PASS: 4/4 not capped at 3 verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: 4/4 capping test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Override Gate Isolation (3/4 Passes vs 2/4 Fails with Affinity >= 60)
  // ---------------------------------------------------------------------------
  console.log("TEST 4: Override Gate Isolation (3/4 Passes vs 2/4 Fails with Affinity >= 60)");
  try {
    // 4A: 3/4 candidate (75% >= 75%) with Affinity >= 60 -> PASSES
    // Java = 3/4 (75%), TD = 2/3 (67%), PR = 2/3 (67%)
    // Jupiter Affinity: 75 * 0.60 + 67 * 0.25 + 67 * 0.15 = 45 + 16.75 + 10.05 = 71.8 -> 72 >= 60
    // Web = 4/4 (100%), PR = 2/3 (67%), TD = 2/3 (67%)
    // Web Affinity: 100 * 0.60 + 67 * 0.25 + 67 * 0.15 = 87 -> Web track, MARS first
    const score3Categories = {
      patternRecognition: 2,
      taskDecomposition: 2,
      webDev: 4,
      cpp: 0,
      python: 0,
      java: 3, // 3 of 4 = 75%
    };

    const det3 = computeDeterministicOrbitAndAffinities(score3Categories);
    const jupiterAff3 = det3.planets.find((p) => p.planet === "JUPITER")?.affinity;
    assert(jupiterAff3 === 72, `Jupiter affinity should be 72 >= 60 (got ${jupiterAff3})`);
    assert(det3.pathOrder[1] === "MARS", `Deterministic first planet should be MARS (got ${det3.pathOrder[1]})`);

    const context3: AptitudeAIContext = {
      totalCorrect: 11,
      totalPercent: 50,
      totalScore: "11/22 (50%)",
      totalQuestions: 22,
      categories: score3Categories,
      computedTrack: det3.track,
      defaultPathOrder: det3.pathOrder,
      defaultFirstPlanet: det3.pathOrder[1],
      strongestCategory: "Web",
      weakestCategory: "C++",
      missedConcepts: [],
    };

    const resScore3 = processAIPathResponse(
      {
        summary: "Solid Java foundation ✨",
        advice: "Dive into OOP logic.",
        recommendedFirstPlanet: "JUPITER",
        overrideReason: "Java 3/4 passes 75% gate and shows strong readiness.",
      },
      context3
    );

    assert(resScore3.aiOverride.applied, "3/4 Java with affinity >= 60 MUST PASS the override gate");
    assert(resScore3.aiOverride.planet === "JUPITER", "Override planet must be JUPITER");
    assert(resScore3.pathOrder[1] === "JUPITER", "First planet after MOON must become JUPITER");

    // 4B: 2/4 candidate (50% < 75%) with Affinity >= 60 -> FAILS Section Gate
    // Java = 2/4 (50%), TD = 3/3 (100%), PR = 3/3 (100%)
    // Jupiter Affinity: 50 * 0.60 + 100 * 0.25 + 100 * 0.15 = 30 + 25 + 15 = 70 >= 60!
    // Affinity gate passes (70 >= 60), BUT section gate fails (50% < 75%)
    // Web = 4/4 (100%) -> Web Affinity = 100 -> MARS first
    const score2Categories = {
      patternRecognition: 3,
      taskDecomposition: 3,
      webDev: 4,
      cpp: 0,
      python: 0,
      java: 2, // 2 of 4 = 50% < 75%
    };

    const det2 = computeDeterministicOrbitAndAffinities(score2Categories);
    const jupiterAff2 = det2.planets.find((p) => p.planet === "JUPITER")?.affinity;
    assert(jupiterAff2 === 70, `Jupiter affinity should be 70 >= 60 (got ${jupiterAff2})`);
    assert(det2.pathOrder[1] === "MARS", "Deterministic first planet should be MARS");

    const context2: AptitudeAIContext = {
      totalCorrect: 12,
      totalPercent: 55,
      totalScore: "12/22 (55%)",
      totalQuestions: 22,
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
        summary: "Developing Java fundamentals ✨",
        advice: "Strengthen syntax.",
        recommendedFirstPlanet: "JUPITER",
        overrideReason: "Try Java first.",
      },
      context2
    );

    assert(!resScore2.aiOverride.applied, "2/4 Java MUST FAIL the section score gate despite affinity 70 >= 60");
    assert(resScore2.pathOrder[1] === "MARS", "First planet after MOON must remain MARS (override rejected)");

    console.log("  PASS: Override gate isolation (3/4 pass vs 2/4 fail) verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Override gate isolation test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Stored 18Q User Compatibility (Preserves Percentages & Orbit)
  // ---------------------------------------------------------------------------
  console.log("TEST 5: Stored 18Q User Compatibility (Preserves Percentages & Orbit)");
  try {
    const stored18QUser = {
      id: "user-18q-test",
      email: "test18q@example.com",
      aptitudeResult: {
        totalQuestions: 18,
        totalCorrect: 8,
        totalPercent: 44,
        subcategories: {
          pattern_recognition: { id: "pattern_recognition", name: "Pattern Recognition", correct: 2, total: 3, percent: 67 },
          task_decomposition: { id: "task_decomposition", name: "Task Decomposition", correct: 2, total: 3, percent: 67 },
          web_dev: { id: "web_dev", name: "Web Development", correct: 1, total: 3, percent: 33 },
          cpp: { id: "cpp", name: "C++ Systems", correct: 0, total: 3, percent: 0 },
          python: { id: "python", name: "Python Scripting", correct: 0, total: 3, percent: 0 },
          java: { id: "java", name: "Java Enterprise", correct: 3, total: 3, percent: 100 },
        },
      },
    };

    const extracted = extractSubcategoriesFromUserOrResult(stored18QUser);

    // Stored totals must be 3
    assert(extracted.totals.webDev === 3, `Stored 18Q webDev total should be 3 (got ${extracted.totals.webDev})`);
    assert(extracted.totals.java === 3, `Stored 18Q java total should be 3 (got ${extracted.totals.java})`);

    // Stored percentages must be preserved exactly
    assert(extracted.percents.webDev === 33, `Stored 18Q webDev percent should be 33% (got ${extracted.percents.webDev})`);
    assert(extracted.percents.java === 100, `Stored 18Q java percent should be 100% (got ${extracted.percents.java})`);

    // Deterministic orbit computed with stored percentages
    const deterministic = computeDeterministicOrbitAndAffinities(extracted);
    const jupiterAffinity = deterministic.planets.find((p) => p.planet === "JUPITER")?.affinity;

    // Jupiter: 100*0.60 + 67*0.25 + 67*0.15 = 87
    assert(jupiterAffinity === 87, `Jupiter affinity should be 87 for stored 18Q user (got ${jupiterAffinity})`);
    assert(deterministic.track === "LOGIC", "Track should be LOGIC");
    assert(deterministic.pathOrder[1] === "JUPITER", "First planet should be JUPITER");

    console.log("  PASS: Stored 18Q user compatibility verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Stored 18Q compatibility test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Legacy 15Q Record Compatibility (No NaN, No Percent > 100)
  // ---------------------------------------------------------------------------
  console.log("TEST 6: Legacy 15Q Record Compatibility (No NaN, Never Over 100%)");
  try {
    const legacy15QUser = {
      id: "user-15q-test",
      email: "test15q@example.com",
      logicScore: 85,
      patternRecognitionScore: 60,
      taskDecompositionScore: 40,
      aptitudeResult: {
        totalQuestions: 15,
        totalCorrect: 9,
        totalPercent: 60,
        categories: {
          pattern_recognition: { correct: 3, total: 5, percent: 60 },
          task_decomposition: { correct: 2, total: 5, percent: 40 },
          logical_reasoning: { correct: 4, total: 5, percent: 80 },
        },
      },
    };

    const extracted = extractSubcategoriesFromUserOrResult(legacy15QUser);

    // Verify all counts and totals
    for (const [key, score] of Object.entries(extracted.details)) {
      assert(!isNaN(score.correct), `Score correct for ${key} must not be NaN`);
      assert(!isNaN(score.total), `Score total for ${key} must not be NaN`);
      assert(!isNaN(score.percent), `Score percent for ${key} must not be NaN`);
      assert(score.percent >= 0 && score.percent <= 100, `Score percent for ${key} must be between 0 and 100 (got ${score.percent})`);
      assert(score.correct <= score.total, `Score correct (${score.correct}) must not exceed total (${score.total}) for ${key}`);
    }

    // Verify degenerate cases (null, empty, NaN values)
    const emptyUser = extractSubcategoriesFromUserOrResult({});
    for (const [key, score] of Object.entries(emptyUser.details)) {
      assert(!isNaN(score.percent), `Empty user score percent for ${key} must not be NaN`);
      assert(score.percent >= 0 && score.percent <= 100, `Empty user percent for ${key} must be 0-100`);
    }

    const corruptedUser = extractSubcategoriesFromUserOrResult({
      logicScore: "invalid_string",
      patternRecognitionScore: 9999, // Should clamp to 100
      taskDecompositionScore: -50,   // Should clamp to 0
    });
    assert(corruptedUser.details.patternRecognition.percent <= 100, "Corrupted high score must clamp to <= 100");
    assert(corruptedUser.details.taskDecomposition.percent >= 0, "Corrupted low score must clamp to >= 0");
    assert(!isNaN(corruptedUser.details.cpp.percent), "Corrupted string score must not produce NaN");

    console.log("  PASS: Legacy 15Q compatibility verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Legacy 15Q compatibility test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Exact-Tie Case (Follows Default Deterministic Order)
  // ---------------------------------------------------------------------------
  console.log("TEST 7: Exact-Tie Case (Strict Tie-Breaker and Default Ordering)");
  try {
    // All sections scored identically (e.g. 2/3 and 2/4 = 50% language, 67% logic)
    const tieCategories = {
      patternRecognition: 2,
      taskDecomposition: 2,
      webDev: 2,
      cpp: 2,
      python: 2,
      java: 2,
    };

    const deterministic = computeDeterministicOrbitAndAffinities(tieCategories);

    // All logic affinities identical: 50*0.6 + 67*0.25 + 67*0.15 = 57
    const jupiter = deterministic.planets.find((p) => p.planet === "JUPITER")?.affinity;
    const saturn = deterministic.planets.find((p) => p.planet === "SATURN")?.affinity;
    const earth = deterministic.planets.find((p) => p.planet === "EARTH")?.affinity;
    const mars = deterministic.planets.find((p) => p.planet === "MARS")?.affinity;

    assert(jupiter === 57 && saturn === 57 && earth === 57, `Logic affinities must be identical 57 (got J=${jupiter}, S=${saturn}, E=${earth})`);
    assert(mars === 57, `Mars affinity must be 57 (got ${mars})`);
    assert(deterministic.track === "BALANCED", "Track must be BALANCED on exact tie");

    // Order: MOON, then Web trio (Mars, Venus, Mercury), then Logic planets in default order (Jupiter, Saturn, Earth)
    const expectedTieOrder = ["MOON", "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"];
    assert(
      JSON.stringify(deterministic.pathOrder) === JSON.stringify(expectedTieOrder),
      `Exact tie pathOrder should be ${JSON.stringify(expectedTieOrder)} (got ${JSON.stringify(deterministic.pathOrder)})`
    );

    console.log("  PASS: Exact-tie case verified.\n");
    passed++;
  } catch (err: any) {
    console.error("  FAIL: Exact-tie test error:", err.message, "\n");
    failed++;
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Combinations Analysis Table for (Language /4, TD /3, PR /3)
  // ---------------------------------------------------------------------------
  console.log("TEST 8: Override Gate Combinations Table Generation");
  console.log("=========================================================================================================");
  console.log(" Lang /4 (Pct) | TD /3 (Pct) | PR /3 (Pct) | Logic Aff | Web Aff | Sec Gate (>=75%) | Logic Pass? | Web Pass?");
  console.log("=========================================================================================================");

  let logicPassCount = 0;
  let logicFailCount = 0;
  let webPassCount = 0;
  let webFailCount = 0;

  for (let L = 0; L <= 4; L++) {
    const lPct = Math.round((L / 4) * 100);
    const secGate = lPct >= 75;

    for (let TD = 0; TD <= 3; TD++) {
      const tdPct = Math.round((TD / 3) * 100);

      for (let PR = 0; PR <= 3; PR++) {
        const prPct = Math.round((PR / 3) * 100);

        // Logic candidate: Lang (60%) + TD (25%) + PR (15%)
        const logicAff = Math.min(100, Math.max(10, Math.round(lPct * 0.60 + tdPct * 0.25 + prPct * 0.15)));
        const logicPasses = secGate && logicAff >= 60;

        // Web candidate: WebDev (60%) + PR (25%) + TD (15%)
        const webAff = Math.min(100, Math.max(10, Math.round(lPct * 0.60 + prPct * 0.25 + tdPct * 0.15)));
        const webPasses = secGate && webAff >= 60;

        if (logicPasses) logicPassCount++;
        else logicFailCount++;

        if (webPasses) webPassCount++;
        else webFailCount++;

        console.log(
          ` ${L}/4 (${String(lPct).padStart(3)}%)   | ${TD}/3 (${String(tdPct).padStart(3)}%)  | ${PR}/3 (${String(prPct).padStart(3)}%)  |    ${String(logicAff).padStart(3)}    |   ${String(webAff).padStart(3)}   |     ${secGate ? "PASS" : "FAIL"}       |     ${logicPasses ? "PASS" : "FAIL"}     |    ${webPasses ? "PASS" : "FAIL"}`
        );
      }
    }
  }

  console.log("=========================================================================================================");
  console.log(`Combinations Summary (Total: 80):`);
  console.log(`Logic Candidate: ${logicPassCount} PASS, ${logicFailCount} FAIL`);
  console.log(`Web Candidate  : ${webPassCount} PASS, ${webFailCount} FAIL`);
  console.log("=========================================================================================================\n");
  passed++;

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("=================================================================");
  console.log(`TEST SUITE FINISHED: ${passed} passed, ${failed} failed`);
  console.log("=================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test execution failed:", e);
  process.exit(1);
});
