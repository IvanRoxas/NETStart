import { getSystemSettings, updateSystemSettings } from "../src/lib/systemSettings";
import { getActiveClientQuestions } from "../src/lib/aptitudeQuestionsHelper";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`PASS: ${msg}`);
}

function seededRandom(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(array: T[], seedStr: string): T[] {
  const result = [...array];
  const rand = seededRandom(seedStr);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

async function runTests() {
  console.log("=== Testing Aptitude Question Shuffling Feature ===\n");

  // 1. Settings persistence test
  await updateSystemSettings({ shuffleAptitudeQuestions: true });
  let settings = await getSystemSettings();
  assert(settings.shuffleAptitudeQuestions === true, "Settings: shuffle enabled persists");

  await updateSystemSettings({ shuffleAptitudeQuestions: false });
  settings = await getSystemSettings();
  assert(settings.shuffleAptitudeQuestions === false, "Settings: shuffle disabled persists");

  await updateSystemSettings({ shuffleAptitudeQuestions: true });
  settings = await getSystemSettings();
  assert(settings.shuffleAptitudeQuestions === true, "Settings: re-enabled shuffle persists");

  // 2. Question dataset test
  const { questions: baseQuestions } = await getActiveClientQuestions();
  assert(baseQuestions.length === 22, `Base questions length is 22 (got ${baseQuestions.length})`);

  // 3. Shuffling uniqueness between two students
  const studentA_Id = "student-team-1-uuid";
  const studentB_Id = "student-team-2-uuid";

  const shuffledA = shuffleWithSeed(baseQuestions, studentA_Id).map((q, idx) => ({ ...q, number: idx + 1 }));
  const shuffledB = shuffleWithSeed(baseQuestions, studentB_Id).map((q, idx) => ({ ...q, number: idx + 1 }));

  assert(shuffledA.length === 22, "Student A received 22 questions");
  assert(shuffledB.length === 22, "Student B received 22 questions");

  // Verify non-linear order
  const orderA_ids = shuffledA.map(q => q.id).join(",");
  const orderB_ids = shuffledB.map(q => q.id).join(",");
  const base_ids = baseQuestions.map(q => q.id).join(",");

  assert(orderA_ids !== base_ids, "Student A order is non-linear (different from base order)");
  assert(orderB_ids !== base_ids, "Student B order is non-linear (different from base order)");
  assert(orderA_ids !== orderB_ids, "Student A and Student B have different question orders (prevents copying)");

  // Verify deterministic reload for Student A
  const shuffledA_reload = shuffleWithSeed(baseQuestions, studentA_Id).map((q, idx) => ({ ...q, number: idx + 1 }));
  const orderA_reload_ids = shuffledA_reload.map(q => q.id).join(",");
  assert(orderA_ids === orderA_reload_ids, "Student A receives the same order on reload (stable exam session)");

  // Verify sequential numbers 1..22
  const numbersA = shuffledA.map(q => q.number);
  const expectedNumbers = Array.from({ length: 22 }, (_, i) => i + 1);
  assert(JSON.stringify(numbersA) === JSON.stringify(expectedNumbers), "Student A questions are numbered sequentially 1 to 22");

  console.log("\nAll Shuffle Unit Tests PASSED successfully!");
}

runTests().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});

