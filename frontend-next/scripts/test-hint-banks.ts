/**
 * Automated test script for NETStart Planetary Hint Banks & Mission Contexts.
 * Run with: npx tsx scripts/test-hint-banks.ts
 */

import {
  getSectionHints,
  getHintsForMission,
  getGenericHintForMission,
} from "../src/ai/data/hint_bank";
import { getMissionContext } from "../src/ai/utils/missionContext";

const EXPECTED_MISSIONS = [
  // Moon
  "moon-1",
  "moon-2",
  "moon-3",
  // Mars
  "mars-1",
  "mars-1-part2",
  "mars-2",
  "mars-3",
  // Venus
  "venus-1",
  "venus-2",
  "venus-3",
  // Mercury
  "mercury-1",
  "mercury-2",
  "mercury-3",
  // Jupiter
  "jupiter-1",
  "jupiter-2",
  "jupiter-3",
  // Saturn
  "saturn-1",
  "saturn-2",
  "saturn-3",
  // Earth
  "earth-1",
  "earth-2",
  "earth-3",
];

const VALID_ERROR_TYPES = new Set([
  "syntax",
  "logic",
  "wrong_output",
  "missing_step",
  "none",
]);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    console.error(`❌ FAIL: ${message}`);
  }
}

console.log("\n=======================================================");
console.log("🚀 NETSTART PLANETARY HINT BANK VERIFICATION SUITE");
console.log("=======================================================\n");

const allHintIds = new Set<string>();
let totalHintsCount = 0;

for (const missionId of EXPECTED_MISSIONS) {
  console.log(`Checking mission: [${missionId}]...`);

  // 1. Check getSectionHints
  const sectionHints = getSectionHints(missionId);
  assert(!!sectionHints, `[${missionId}] Section hints object exists`);

  // 2. Check Generic Hint
  const genericHint = getGenericHintForMission(missionId);
  assert(
    typeof genericHint === "string" && genericHint.length > 20,
    `[${missionId}] Generic hint is descriptive (length: ${genericHint?.length || 0})`
  );

  // 3. Check Hints Array
  const hints = getHintsForMission(missionId);
  assert(
    Array.isArray(hints) && hints.length > 0,
    `[${missionId}] Hints list is populated (count: ${hints?.length || 0})`
  );

  // 4. Validate Individual Hint Entries
  for (const h of hints) {
    totalHintsCount++;

    // Uniqueness
    assert(
      !allHintIds.has(h.hint_id),
      `[${missionId}] Unique hint_id '${h.hint_id}'`
    );
    allHintIds.add(h.hint_id);

    // Mission ID match
    assert(
      h.mission_id === missionId,
      `[${missionId}] hint_id '${h.hint_id}' has matching mission_id '${h.mission_id}'`
    );

    // Valid error type
    assert(
      VALID_ERROR_TYPES.has(h.error_type),
      `[${missionId}] hint_id '${h.hint_id}' has valid error_type '${h.error_type}'`
    );

    // Concept tag
    assert(
      typeof h.concept_tag === "string" && h.concept_tag.length > 0,
      `[${missionId}] hint_id '${h.hint_id}' has concept_tag`
    );

    // Applies when
    assert(
      typeof h.applies_when === "string" && h.applies_when.length > 5,
      `[${missionId}] hint_id '${h.hint_id}' has applies_when explanation`
    );

    // Hint text
    assert(
      typeof h.hint_text === "string" && h.hint_text.length > 10,
      `[${missionId}] hint_id '${h.hint_id}' has actionable hint_text`
    );
  }

  // 5. Check Mission Context
  const context = getMissionContext(missionId);
  assert(
    context.missionId === missionId,
    `[${missionId}] Mission context returned for '${context.missionId}'`
  );
  assert(
    !context.title.startsWith("Mission ") || missionId === "mars-1-part2",
    `[${missionId}] Mission context has specialized title: '${context.title}'`
  );
  assert(
    context.goal.length > 15,
    `[${missionId}] Mission context has clear goal: '${context.goal}'`
  );
  assert(
    context.allowedConcepts.length > 0,
    `[${missionId}] Mission context lists allowed concepts (${context.allowedConcepts.join(", ")})`
  );
  assert(
    context.expectedBehavior.length > 15,
    `[${missionId}] Mission context details expected behavior`
  );
}

// Fallback test for unexpected mission id
console.log("\nChecking fallback behavior for unknown mission...");
const fallbackHints = getSectionHints("unknown-planet-99");
assert(
  fallbackHints.generic_hint.includes("Check your code structure"),
  "Unknown mission gracefully falls back to generic hint"
);
assert(
  fallbackHints.hints.length === 0,
  "Unknown mission returns empty hints array"
);

console.log("\n=======================================================");
console.log(`📊 SUMMARY:`);
console.log(`   Total Assertions: ${totalTests}`);
console.log(`   Passed:           ${passedTests}`);
console.log(`   Failed:           ${failedTests}`);
console.log(`   Total Hints:      ${totalHintsCount}`);
console.log(`   Unique Hint IDs:  ${allHintIds.size}`);
console.log("=======================================================\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL PLANETARY HINT BANK CHECKS PASSED PERFECTLY!\n");
}
