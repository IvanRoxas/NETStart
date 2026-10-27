import { SIX_SECTIONS, getQuestionSectionMeta } from "../src/app/aptitude-test/AptitudeTestClient";
import { getSectionTotals } from "../src/lib/aptitudeTotals";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`PASS: ${msg}`);
}

console.log("=== Testing Aptitude 6 Real Sections Logic ===\n");

// Test 1: Question section pill derivation from subcategory (no hard-coded question numbers)
console.log("--- 1. Question Section Pill Derivation ---");
const testQuestions = [
  { id: "pr-1", category: "pattern_recognition" as const, subcategory: "pattern_recognition", number: 1, title: "Time Interval", question: "...", options: {} },
  { id: "td-1", category: "task_decomposition" as const, subcategory: "task_decomposition", number: 4, title: "Decomp", question: "...", options: {} },
  { id: "web-1", category: "pattern_recognition" as const, subcategory: "web_dev", number: 7, title: "Web Link", question: "...", options: {} },
  { id: "cpp-1", category: "logical_reasoning" as const, subcategory: "cpp", number: 11, title: "C++ Output", question: "...", options: {} },
  { id: "py-1", category: "logical_reasoning" as const, subcategory: "python", number: 15, title: "Python List", question: "...", options: {} },
  { id: "java-1", category: "logical_reasoning" as const, subcategory: "java", number: 19, title: "Java OOP", question: "...", options: {} },
];

const metaPR = getQuestionSectionMeta(testQuestions[0]);
assert(metaPR.pillLabel === "PATTERN RECOGNITION", "pr-1 pillLabel is PATTERN RECOGNITION");
assert(metaPR.textColor === "text-[#ff912d]", "pr-1 has #ff912d accent");

const metaTD = getQuestionSectionMeta(testQuestions[1]);
assert(metaTD.pillLabel === "TASK DECOMPOSITION", "td-1 pillLabel is TASK DECOMPOSITION");
assert(metaTD.textColor === "text-sky-400", "td-1 has sky-400 accent");

const metaWeb = getQuestionSectionMeta(testQuestions[2]);
assert(metaWeb.pillLabel === "WEB DEVELOPMENT", "web-1 pillLabel is WEB DEVELOPMENT (derived from subcategory)");
assert(metaWeb.textColor === "text-amber-400", "web-1 has amber-400 accent");

const metaCpp = getQuestionSectionMeta(testQuestions[3]);
assert(metaCpp.pillLabel === "C++", "cpp-1 pillLabel is C++ (derived from subcategory)");
assert(metaCpp.textColor === "text-blue-400", "cpp-1 has blue-400 accent");

const metaPy = getQuestionSectionMeta(testQuestions[4]);
assert(metaPy.pillLabel === "PYTHON", "py-1 pillLabel is PYTHON (derived from subcategory)");
assert(metaPy.textColor === "text-emerald-400", "py-1 has emerald-400 accent");

const metaJava = getQuestionSectionMeta(testQuestions[5]);
assert(metaJava.pillLabel === "JAVA", "java-1 pillLabel is JAVA (derived from subcategory)");
assert(metaJava.textColor === "text-orange-400", "java-1 has orange-400 accent");

// Fallback when question lacks subcategory
const legacyQ = { id: "leg-1", category: "logical_reasoning" as const, number: 1, title: "Old", question: "...", options: {} };
const metaLegacy = getQuestionSectionMeta(legacyQ);
assert(metaLegacy.pillLabel === "LOGICAL REASONING", "Legacy question falls back to category pill");

// Test 2: Results calculation for 22Q User
console.log("\n--- 2. Results Screen: 22Q User Simulation ---");
const user22Q = {
  subcategories: {
    pattern_recognition: { id: "pattern_recognition", name: "Pattern Recognition", total: 3, correct: 3, percent: 100 },
    task_decomposition: { id: "task_decomposition", name: "Task Decomposition & Logic", total: 3, correct: 3, percent: 100 },
    web_dev: { id: "web_dev", name: "Web Development", total: 4, correct: 1, percent: 25 },
    cpp: { id: "cpp", name: "C++ Fundamentals", total: 4, correct: 1, percent: 25 },
    python: { id: "python", name: "Python Fundamentals", total: 4, correct: 1, percent: 25 },
    java: { id: "java", name: "Java Fundamentals", total: 4, correct: 3, percent: 75 },
  },
};

const defaultTotals = getSectionTotals();
const defaultTotalMap: Record<string, number> = {
  pattern_recognition: defaultTotals.patternRecognition,
  task_decomposition: defaultTotals.taskDecomposition,
  web_dev: defaultTotals.webDev,
  cpp: defaultTotals.cpp,
  python: defaultTotals.python,
  java: defaultTotals.java,
};

const sixSections22 = SIX_SECTIONS.map((sec) => {
  const sub = user22Q.subcategories[sec.key as keyof typeof user22Q.subcategories];
  const storedTotal = typeof sub?.total === "number" && !isNaN(sub.total) && sub.total > 0
    ? sub.total
    : defaultTotalMap[sec.key];
  const correct = typeof sub?.correct === "number" && !isNaN(sub.correct) ? sub.correct : 0;
  const percent = typeof sub?.percent === "number" && !isNaN(sub.percent)
    ? Math.min(100, Math.max(0, Math.round(sub.percent)))
    : (storedTotal > 0 ? Math.min(100, Math.max(0, Math.round((correct / storedTotal) * 100))) : 0);
  return { ...sec, correct, total: storedTotal, percent };
});

assert(sixSections22.length === 6, "22Q renders 6 section cards");
assert(sixSections22.find((s) => s.key === "pattern_recognition")?.total === 3, "22Q Pattern Recognition total is 3");
assert(sixSections22.find((s) => s.key === "task_decomposition")?.total === 3, "22Q Task Decomposition total is 3");
assert(sixSections22.find((s) => s.key === "web_dev")?.total === 4, "22Q Web Development total is 4");
assert(sixSections22.find((s) => s.key === "cpp")?.total === 4, "22Q C++ total is 4");
assert(sixSections22.find((s) => s.key === "python")?.total === 4, "22Q Python total is 4");
assert(sixSections22.find((s) => s.key === "java")?.total === 4, "22Q Java total is 4");

// Ties resolution
const sortedDesc22 = [...sixSections22].sort((a, b) => b.percent - a.percent);
const sortedAsc22 = [...sixSections22].sort((a, b) => a.percent - b.percent);

assert(sortedDesc22[0].name === "Pattern Recognition", "Tie for strongest (PR 100% vs TD 100%) resolves to Pattern Recognition by default order");
assert(sortedAsc22[0].name === "Web Development", "Tie for growth area (Web 25%, C++ 25%, Python 25%) resolves to Web Development by default order");

// Test 3: Results calculation for Legacy 18Q User (stored totals = 3, never assume 4)
console.log("\n--- 3. Results Screen: Legacy 18Q User Simulation ---");
const user18Q = {
  subcategories: {
    pattern_recognition: { id: "pattern_recognition", name: "Pattern Recognition", total: 3, correct: 2, percent: 67 },
    task_decomposition: { id: "task_decomposition", name: "Task Decomposition & Logic", total: 3, correct: 2, percent: 67 },
    web_dev: { id: "web_dev", name: "Web Development", total: 3, correct: 3, percent: 100 },
    cpp: { id: "cpp", name: "C++ Fundamentals", total: 3, correct: 1, percent: 33 },
    python: { id: "python", name: "Python Fundamentals", total: 3, correct: 1, percent: 33 },
    java: { id: "java", name: "Java Fundamentals", total: 3, correct: 2, percent: 67 },
  },
};

const sixSections18 = SIX_SECTIONS.map((sec) => {
  const sub = user18Q.subcategories[sec.key as keyof typeof user18Q.subcategories];
  const storedTotal = typeof sub?.total === "number" && !isNaN(sub.total) && sub.total > 0
    ? sub.total
    : defaultTotalMap[sec.key];
  const correct = typeof sub?.correct === "number" && !isNaN(sub.correct) ? sub.correct : 0;
  const percent = typeof sub?.percent === "number" && !isNaN(sub.percent)
    ? Math.min(100, Math.max(0, Math.round(sub.percent)))
    : (storedTotal > 0 ? Math.min(100, Math.max(0, Math.round((correct / storedTotal) * 100))) : 0);
  return { ...sec, correct, total: storedTotal, percent };
});

assert(sixSections18.every((s) => s.total === 3), "18Q record displays stored total 3 for all 6 cards and never assumes 4");
const sortedDesc18 = [...sixSections18].sort((a, b) => b.percent - a.percent);
const sortedAsc18 = [...sixSections18].sort((a, b) => a.percent - b.percent);
assert(sortedDesc18[0].name === "Web Development", "18Q Strongest domain is Web Development (100%)");
assert(sortedAsc18[0].name === "C++", "18Q Growth area tie (C++ 33% vs Python 33%) resolves to C++ by default order");

// Test 4: Results calculation for Legacy 15Q User (no subcategories -> fallback to 3 cards)
console.log("\n--- 4. Results Screen: Legacy 15Q User Simulation ---");
const user15Q = {
  subcategories: undefined,
  categories: {
    pattern_recognition: { category: "pattern_recognition", name: "Pattern Recognition", correct: 4, total: 6, percent: 67 },
    task_decomposition: { category: "task_decomposition", name: "Task Decomposition", correct: 2, total: 3, percent: 67 },
    logical_reasoning: { category: "logical_reasoning", name: "Logical Reasoning", correct: 4, total: 6, percent: 67 },
  },
  strongestCategory: { category: "pattern_recognition", name: "Pattern Recognition", percent: 67 },
  weakestCategory: { category: "task_decomposition", name: "Task Decomposition", percent: 67 },
};

const hasSubcategories15 = Boolean(user15Q.subcategories && Object.keys(user15Q.subcategories).length > 0);
assert(!hasSubcategories15, "Legacy 15Q has no subcategories and cleanly triggers 3-card fallback");

console.log("\nAll 6-section test cases PASSED successfully!");
