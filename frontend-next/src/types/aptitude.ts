export type AptitudeCategory =
  | "pattern_recognition"
  | "task_decomposition"
  | "logical_reasoning";

export interface ClientAptitudeQuestion {
  id: string;
  category: AptitudeCategory;
  subcategory?: string;
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

export interface SubcategoryScore {
  id: string;
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
  track?: "WEB" | "LOGIC" | "BALANCED" | null;
  planets?: Array<{ planet: string; affinity: number; reason: string }>;
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
  subcategories?: {
    pattern_recognition: SubcategoryScore;
    task_decomposition: SubcategoryScore;
    web_dev: SubcategoryScore;
    cpp: SubcategoryScore;
    python: SubcategoryScore;
    java: SubcategoryScore;
  };
  strongestCategory: CategorySummary;
  weakestCategory: CategorySummary;
  missed: MissedQuestionItem[];
  recommendedLearningPath: string;
  deterministicTrack?: "WEB" | "LOGIC" | "BALANCED";
  aiInsight?: AptitudeAIInsight;
  aiOverride?: {
    applied: boolean;
    planet?: string;
    reason?: string;
  };
  completedAt: string;
}

export interface AptitudeAIContext {
  totalCorrect: number;
  totalPercent: number;
  totalScore: string;
  categories: {
    patternRecognition: string | number;
    taskDecomposition: string | number;
    logicalReasoning?: string | number;
    webDev?: string | number;
    cpp?: string | number;
    python?: string | number;
    java?: string | number;
  };
  computedTrack?: "WEB" | "LOGIC" | "BALANCED";
  defaultPathOrder?: string[];
  defaultFirstPlanet?: string;
  strongestCategory: string;
  weakestCategory: string;
  missedConcepts: string[];
}
