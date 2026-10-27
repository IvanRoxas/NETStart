import questionsData from "@/server/data/aptitude_questions.server.json";

export interface SectionTotals {
  patternRecognition: number;
  taskDecomposition: number;
  webDev: number;
  cpp: number;
  python: number;
  java: number;
  total: number;
}

export interface LegacyCategoryTotals {
  pattern_recognition: number;
  task_decomposition: number;
  logical_reasoning: number;
  total: number;
}

export function getSectionTotals(): SectionTotals {
  const totals: SectionTotals = {
    patternRecognition: 0,
    taskDecomposition: 0,
    webDev: 0,
    cpp: 0,
    python: 0,
    java: 0,
    total: 0,
  };

  for (const q of questionsData.questions) {
    const sub = (q.subcategory || "").toLowerCase();
    if (sub === "pattern_recognition") totals.patternRecognition++;
    else if (sub === "task_decomposition") totals.taskDecomposition++;
    else if (sub === "web_dev") totals.webDev++;
    else if (sub === "cpp") totals.cpp++;
    else if (sub === "python") totals.python++;
    else if (sub === "java") totals.java++;
    totals.total++;
  }

  return totals;
}

export function getLegacyCategoryTotals(): LegacyCategoryTotals {
  const sec = getSectionTotals();
  return {
    pattern_recognition: sec.patternRecognition + sec.webDev,
    task_decomposition: sec.taskDecomposition,
    logical_reasoning: sec.cpp + sec.python + sec.java,
    total: sec.total,
  };
}
