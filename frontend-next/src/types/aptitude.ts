export type AptitudeCategory =
  | "pattern_recognition"
  | "task_decomposition"
  | "logical_reasoning";

export interface ClientAptitudeQuestion {
  id: string;
  category: AptitudeCategory;
  number: number;
  title: string;
  question: string;
  options: Record<string, string>;
}

export interface CategoryScore {
  category: AptitudeCategory;
  name: string;
  correct: number;
  total: number;
  percent: number;
}

export interface MissedQuestionItem {
  id: string;
  chosenOption: string;
  concept: string;
}

export interface CategorySummary {
  category: AptitudeCategory;
  name: string;
  percent: number;
}

export interface AptitudeAIInsight {
  summary: string;
  advice: string;
  source?: "gemini" | "mock" | "fallback";
}

export interface AptitudeTestResult {
  totalCorrect: number;
  totalQuestions: number;
  totalPercent: number;
  categories: {
    pattern_recognition: CategoryScore;
    task_decomposition: CategoryScore;
    logical_reasoning: CategoryScore;
  };
  strongestCategory: CategorySummary;
  weakestCategory: CategorySummary;
  missed: MissedQuestionItem[];
  recommendedLearningPath: string;
  aiInsight?: AptitudeAIInsight;
  completedAt: string;
}

export interface AptitudeAIContext {
  totalCorrect: number;
  totalPercent: number;
  totalScore: string;
  categories: {
    patternRecognition: string | number;
    taskDecomposition: string | number;
    logicalReasoning: string | number;
  };
  strongestCategory: string;
  weakestCategory: string;
  missedConcepts: string[];
}
