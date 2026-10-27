"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Award,
  RefreshCw,
  Cpu,
  Activity,
  Sparkles,
  X,
  Rocket,
  AlertTriangle,
  Layers,
  HelpCircle,
  TrendingUp,
  Target,
  Compass,
  Globe,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import VisualNovelCutscene from "@/components/VisualNovelCutscene";
import introScenes from "@/data/introduction_scenes.json";
import {
  ClientAptitudeQuestion,
  AptitudeTestResult,
  AptitudeCategory,
} from "@/types/aptitude";
import { getSectionTotals } from "@/lib/aptitudeTotals";

interface AptitudeTestClientProps {
  initialUser: any;
}

export interface SectionDisplayConfig {
  key: "pattern_recognition" | "task_decomposition" | "web_dev" | "cpp" | "python" | "java";
  name: string;
  pillLabel: string;
  icon: typeof Brain;
  textColor: string;
  badgeBg: string;
  borderColor: string;
  gradient: string;
}

export const SIX_SECTIONS: SectionDisplayConfig[] = [
  {
    key: "pattern_recognition",
    name: "Pattern Recognition",
    pillLabel: "PATTERN RECOGNITION",
    icon: Cpu,
    textColor: "text-[#ff912d]",
    badgeBg: "bg-[#ff912d]/10",
    borderColor: "border-[#ff912d]/30",
    gradient: "from-[#ff912d] to-amber-400",
  },
  {
    key: "task_decomposition",
    name: "Task Decomposition",
    pillLabel: "TASK DECOMPOSITION",
    icon: Layers,
    textColor: "text-sky-400",
    badgeBg: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    gradient: "from-sky-500 to-cyan-400",
  },
  {
    key: "web_dev",
    name: "Web Development",
    pillLabel: "WEB DEVELOPMENT",
    icon: Globe,
    textColor: "text-amber-400",
    badgeBg: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    gradient: "from-amber-500 to-yellow-400",
  },
  {
    key: "cpp",
    name: "C++",
    pillLabel: "C++",
    icon: Cpu,
    textColor: "text-blue-400",
    badgeBg: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    gradient: "from-blue-500 to-indigo-400",
  },
  {
    key: "python",
    name: "Python",
    pillLabel: "PYTHON",
    icon: Sparkles,
    textColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    key: "java",
    name: "Java",
    pillLabel: "JAVA",
    icon: Brain,
    textColor: "text-orange-400",
    badgeBg: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    gradient: "from-orange-500 to-red-400",
  },
];

export function getQuestionSectionMeta(q?: ClientAptitudeQuestion) {
  if (!q) {
    return {
      name: "Logical Reasoning",
      pillLabel: "LOGICAL REASONING",
      icon: Brain,
      textColor: "text-purple-400",
      badgeBg: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      gradient: "from-purple-500 to-violet-400",
    };
  }

  const raw = (q.subcategory || q.category || "").toLowerCase().trim();

  if (raw === "pattern_recognition" || raw.includes("pattern")) return SIX_SECTIONS[0];
  if (raw === "task_decomposition" || raw.includes("decomp") || raw.includes("task")) return SIX_SECTIONS[1];
  if (raw === "web_dev" || raw.includes("web")) return SIX_SECTIONS[2];
  if (raw === "cpp" || raw.includes("c++")) return SIX_SECTIONS[3];
  if (raw === "python" || raw.includes("py")) return SIX_SECTIONS[4];
  if (raw === "java" || raw.includes("java")) return SIX_SECTIONS[5];

  const legacy = CATEGORY_META[q.category] || CATEGORY_META.logical_reasoning;
  return {
    name: legacy.name,
    pillLabel: legacy.name.toUpperCase(),
    icon: legacy.icon,
    textColor: legacy.textColor,
    badgeBg: legacy.badgeBg,
    borderColor: legacy.borderColor,
    gradient: "from-purple-500 to-violet-400",
  };
}

const CATEGORY_META: Record<
  AptitudeCategory,
  { name: string; icon: typeof Brain; badgeBg: string; borderColor: string; textColor: string }
> = {
  pattern_recognition: {
    name: "Pattern Recognition",
    icon: Cpu,
    badgeBg: "bg-[#ff912d]/10",
    borderColor: "border-[#ff912d]/30",
    textColor: "text-[#ff912d]",
  },
  task_decomposition: {
    name: "Task Decomposition",
    icon: Layers,
    badgeBg: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    textColor: "text-sky-400",
  },
  logical_reasoning: {
    name: "Logical Reasoning",
    icon: Brain,
    badgeBg: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
  },
};

const getPlanetIcon = (planet: string) => {
  const p = (planet || "").toLowerCase();
  if (p.includes("earth")) return "/assets/planets/celestial/Earth.svg";
  if (p.includes("mars")) return "/assets/planets/celestial/Mars.svg";
  if (p.includes("venus")) return "/assets/planets/celestial/Venus.svg";
  if (p.includes("mercury")) return "/assets/planets/celestial/Mercury.svg";
  if (p.includes("saturn")) return "/assets/planets/celestial/Saturn.svg";
  if (p.includes("jupiter")) return "/assets/planets/celestial/Jupiter.svg";
  return "/assets/planets/celestial/Mars.svg";
};

const SHOW_PLANET_AFFINITY = false;

export default function AptitudeTestClient({ initialUser }: AptitudeTestClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const expectedUserId = initialUser?.id || (session?.user as any)?.id;
  const shouldOpenModal = searchParams ? searchParams.get("openModal") === "true" : false;

  // View states: 'BRIEFING' | 'QUIZ' | 'COMPLETED' | 'CUTSCENE'
  const [viewState, setViewState] = useState<"BRIEFING" | "QUIZ" | "COMPLETED" | "CUTSCENE">(
    initialUser?.hasTakenAptitudeTest
      ? "COMPLETED"
      : "BRIEFING"
  );

  const [questions, setQuestions] = useState<ClientAptitudeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<AptitudeTestResult | null>(() => {
    if (initialUser?.aptitudeResult) {
      const res = { ...initialUser.aptitudeResult };
      if (!res.categories) {
        const pScore = initialUser.patternRecognitionScore ?? 0;
        const tScore = initialUser.taskDecompositionScore ?? 0;
        const lScore = initialUser.logicScore ?? 0;
        const pCorrect = Math.round((pScore / 100) * 6);
        const tCorrect = Math.round((tScore / 100) * 3);
        const lCorrect = Math.round((lScore / 100) * 9);
        res.categories = {
          pattern_recognition: { category: "pattern_recognition", name: "Pattern Recognition", correct: pCorrect, total: 6, percent: pScore },
          task_decomposition: { category: "task_decomposition", name: "Task Decomposition", correct: tCorrect, total: 3, percent: tScore },
          logical_reasoning: { category: "logical_reasoning", name: "Logical Reasoning", correct: lCorrect, total: 9, percent: lScore },
        };
      }
      if (!res.strongestCategory || !res.weakestCategory) {
        const cats = [
          { category: "pattern_recognition" as const, name: "Pattern Recognition", percent: res.categories?.pattern_recognition?.percent ?? initialUser.patternRecognitionScore ?? 0 },
          { category: "task_decomposition" as const, name: "Task Decomposition", percent: res.categories?.task_decomposition?.percent ?? initialUser.taskDecompositionScore ?? 0 },
          { category: "logical_reasoning" as const, name: "Logical Reasoning", percent: res.categories?.logical_reasoning?.percent ?? initialUser.logicScore ?? 0 },
        ].sort((a, b) => b.percent - a.percent);
        if (!res.strongestCategory) res.strongestCategory = cats[0];
        if (!res.weakestCategory) res.weakestCategory = cats[cats.length - 1];
      }
      if (!res.aiInsight && (initialUser.aiSummary || initialUser.track || initialUser.planetReasons)) {
        res.aiInsight = {
          summary: initialUser.aiSummary || "",
          advice: "",
          track: initialUser.track,
          planets: Array.isArray(initialUser.planetReasons)
            ? initialUser.planetReasons.map((pr: any) => ({
                planet: pr.planet,
                reason: pr.reason,
                affinity: pr.affinity ?? 75,
              }))
            : undefined,
        };
      } else if (res.aiInsight && (!res.aiInsight.planets || res.aiInsight.planets.length === 0) && Array.isArray(initialUser.planetReasons)) {
        res.aiInsight.planets = initialUser.planetReasons.map((pr: any) => ({
          planet: pr.planet,
          reason: pr.reason,
          affinity: pr.affinity ?? 75,
        }));
      }
      return res;
    }
    if (initialUser?.hasTakenAptitudeTest) {
      const pScore = initialUser.patternRecognitionScore ?? 0;
      const tScore = initialUser.taskDecompositionScore ?? 0;
      const lScore = initialUser.logicScore ?? 0;
      const pCorrect = Math.round((pScore / 100) * 7);
      const tCorrect = Math.round((tScore / 100) * 3);
      const lCorrect = Math.round((lScore / 100) * 12);
      const totCorrect = pCorrect + tCorrect + lCorrect;
      const totPercent = Math.round((totCorrect / 22) * 100);

      const cats = [
        { category: "pattern_recognition" as const, name: "Pattern Recognition", percent: pScore },
        { category: "task_decomposition" as const, name: "Task Decomposition", percent: tScore },
        { category: "logical_reasoning" as const, name: "Logical Reasoning", percent: lScore },
      ].sort((a, b) => b.percent - a.percent);

      return {
        totalCorrect: totCorrect,
        totalQuestions: 22,
        totalPercent: totPercent,
        categories: {
          pattern_recognition: {
            category: "pattern_recognition",
            name: "Pattern Recognition",
            correct: pCorrect,
            total: 7,
            percent: pScore,
          },
          task_decomposition: {
            category: "task_decomposition",
            name: "Task Decomposition",
            correct: tCorrect,
            total: 3,
            percent: tScore,
          },
          logical_reasoning: {
            category: "logical_reasoning",
            name: "Logical Reasoning",
            correct: lCorrect,
            total: 12,
            percent: lScore,
          },
        },
        strongestCategory: cats[0],
        weakestCategory: cats[cats.length - 1],
        missed: [],
        recommendedLearningPath: initialUser.recommendedLearningPath ?? "Fullstack Web & Distributed Systems",
        completedAt: new Date().toISOString(),
        aiInsight: (initialUser.aiSummary || initialUser.track || initialUser.planetReasons) ? {
          summary: initialUser.aiSummary || "",
          advice: "",
          track: initialUser.track,
          planets: Array.isArray(initialUser.planetReasons)
            ? initialUser.planetReasons.map((pr: any) => ({
                planet: pr.planet,
                reason: pr.reason,
                affinity: pr.affinity ?? 75,
              }))
            : undefined,
        } : undefined,
      };
    }
    return null;
  });

  // Check if results has 6-section subcategories (v2.2+ / v2.4 schema)
  const hasSubcategories = Boolean(
    results?.subcategories &&
      typeof results.subcategories === "object" &&
      Object.keys(results.subcategories).length > 0 &&
      (results.subcategories.pattern_recognition ||
        results.subcategories.task_decomposition ||
        results.subcategories.web_dev ||
        results.subcategories.cpp ||
        results.subcategories.python ||
        results.subcategories.java)
  );

  // Compute 6 section display data using stored totals (or getSectionTotals fallback)
  const sixSectionsData = useMemo(() => {
    if (!results?.subcategories) return [];

    const defaultTotals = getSectionTotals();
    const defaultTotalMap: Record<string, number> = {
      pattern_recognition: defaultTotals.patternRecognition,
      task_decomposition: defaultTotals.taskDecomposition,
      web_dev: defaultTotals.webDev,
      cpp: defaultTotals.cpp,
      python: defaultTotals.python,
      java: defaultTotals.java,
    };

    return SIX_SECTIONS.map((sec) => {
      const sub = results.subcategories?.[sec.key as keyof typeof results.subcategories];
      const storedTotal =
        typeof sub?.total === "number" && !isNaN(sub.total) && sub.total > 0
          ? sub.total
          : defaultTotalMap[sec.key];
      const correct =
        typeof sub?.correct === "number" && !isNaN(sub.correct)
          ? sub.correct
          : 0;
      const percent =
        typeof sub?.percent === "number" && !isNaN(sub.percent)
          ? Math.min(100, Math.max(0, Math.round(sub.percent)))
          : (storedTotal > 0 ? Math.min(100, Math.max(0, Math.round((correct / storedTotal) * 100))) : 0);

      return {
        ...sec,
        correct,
        total: storedTotal,
        percent,
      };
    });
  }, [results?.subcategories]);

  // Compute Strongest Domain and Primary Growth Area over the 6 sections by percentage (ties: default order)
  const { strongestDomain, primaryGrowthArea } = useMemo(() => {
    if (hasSubcategories && sixSectionsData.length > 0) {
      // Ties: use the default order.
      // Array.prototype.sort in ES2019+ is stable, preserving SIX_SECTIONS order upon equal percentages.
      const sortedDesc = [...sixSectionsData].sort((a, b) => b.percent - a.percent);
      const sortedAsc = [...sixSectionsData].sort((a, b) => a.percent - b.percent);

      return {
        strongestDomain: {
          name: sortedDesc[0].name,
          percent: sortedDesc[0].percent,
        },
        primaryGrowthArea: {
          name: sortedAsc[0].name,
          percent: sortedAsc[0].percent,
        },
      };
    }

    // Fallback for legacy 3-category records without subcategories
    return {
      strongestDomain: {
        name: results?.strongestCategory?.name ?? "Pattern Recognition",
        percent: results?.strongestCategory?.percent ?? 0,
      },
      primaryGrowthArea: {
        name: results?.weakestCategory?.name ?? "Task Decomposition",
        percent: results?.weakestCategory?.percent ?? 0,
      },
    };
  }, [hasSubcategories, sixSectionsData, results]);

  // Custom in-app modal notification state (compliant with project rule: no alert() / confirm())
  const [toastNotification, setToastNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    unansweredIds?: number[];
    isRetakeBlocked?: boolean;
    buttonText?: string;
    action?: () => void;
  } | null>(null);

  const renderToastNotificationModal = () => {
    if (!toastNotification?.show) return null;

    const isRetakeBlocked =
      toastNotification.isRetakeBlocked ||
      toastNotification.buttonText?.toLowerCase().includes("profile") ||
      toastNotification.message?.toLowerCase().includes("already completed") ||
      toastNotification.message?.toLowerCase().includes("valid path");

    const handleButtonClick = () => {
      if (toastNotification.action) {
        toastNotification.action();
      } else if (isRetakeBlocked) {
        router.push("/profile");
      }
      setToastNotification(null);
    };

    const buttonLabel = isRetakeBlocked
      ? "Back to Profile"
      : toastNotification.buttonText ||
        (toastNotification.unansweredIds && toastNotification.unansweredIds.length > 0
          ? "Review Unanswered Problems"
          : "Close");

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="w-full max-w-md bg-[#1e0a2d] border border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.3)] space-y-5 text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display text-white uppercase tracking-wider">
              {toastNotification.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
              {toastNotification.message}
            </p>
          </div>
          <button
            onClick={handleButtonClick}
            className="w-full py-3 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer active:scale-95"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    );
  };

  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);

  useEffect(() => {
    if (!initialUser?.hasTakenAptitudeTest) {
      loadDiagnosticQuestions();
    } else {
      setLoading(false);
    }
  }, []);

  const loadDiagnosticQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/aptitude/questions");
      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error("Failed to load diagnostic questions:", err);
      setToastNotification({
        show: true,
        title: "Telemetry Link Offline",
        message: "Failed to download diagnostic questions. Please refresh or check your network.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Find unanswered questions for validation
  const unansweredIndices = useMemo(() => {
    if (!questions.length) return [];
    return questions
      .map((q, idx) => (selectedAnswers[q.id] ? null : idx + 1))
      .filter((n): n is number => n !== null);
  }, [questions, selectedAnswers]);

  const attemptSubmit = () => {
    if (unansweredIndices.length > 0) {
      setToastNotification({
        show: true,
        title: "Unanswered Questions Detected",
        message: `All ${questions.length} questions must be answered before grading. Uncompleted: Question ${unansweredIndices.join(
          ", "
        )}.`,
        unansweredIds: unansweredIndices,
      });
      // Automatically jump to the first unanswered question
      const firstUnansweredIndex = unansweredIndices[0] - 1;
      if (firstUnansweredIndex >= 0 && firstUnansweredIndex < questions.length) {
        setCurrentIndex(firstUnansweredIndex);
      }
      return;
    }

    setConfirmSubmitModal(true);
  };

  const handleSubmitTest = async () => {
    setConfirmSubmitModal(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/aptitude/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(expectedUserId ? { "x-expected-user-id": expectedUserId } : {}),
        },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setResults(data.result);
        try {
          await update({ hasTakenAptitudeTest: true });
        } catch (e) {
          console.error("Failed to update session claim:", e);
        }
        setViewState("COMPLETED");
      } else {
        const isRetakeBlock =
          data.message?.toLowerCase().includes("already completed") ||
          data.message?.toLowerCase().includes("valid path") ||
          data.isRetakeBlocked;

        setToastNotification({
          show: true,
          title: "Submission Error",
          message: data.message || "Could not grade assessment. Please try again.",
          isRetakeBlocked: Boolean(isRetakeBlock),
          buttonText: isRetakeBlock ? "Back to Profile" : "Close",
          action: isRetakeBlock ? () => router.push("/profile") : undefined,
        });
      }
    } catch (err: any) {
      console.error("Failed to submit diagnostic assessment:", err);
      setToastNotification({
        show: true,
        title: "Connection Refused",
        message: err?.message || "Communication with the grading server failed.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Loading Screen
  if (loading && viewState !== "COMPLETED" && viewState !== "CUTSCENE") {
    return (
      <div className="w-full max-w-2xl mx-auto py-20 flex flex-col items-center justify-center gap-4 text-center">
        <div className="p-4 rounded-2xl bg-[#ff912d]/10 border border-[#ff912d]/30 text-[#ff912d] animate-spin">
          <RefreshCw size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="text-white font-bold text-base uppercase tracking-wider font-display">
            Calibrating Diagnostic Console...
          </h3>
          <p className="text-xs text-gray-400 font-mono">
            Loading {questions.length || 22} server-verified algorithmic aptitude problems across 6 skill sectors...
          </p>
        </div>
      </div>
    );
  }

  // State 1: Briefing Intro Modal (Custom UI Modal)
  if (viewState === "BRIEFING") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        <div className="w-full max-w-4xl bg-[#1a082c] border-2 border-[#ff912d]/70 shadow-[0_0_45px_rgba(255,145,45,0.4),0_0_80px_rgba(147,51,234,0.3)] rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <button
            onClick={() => router.push("/dashboard")}
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/5 border border-white/15 text-gray-400 hover:text-black hover:bg-[#ff912d] hover:border-[#ff912d] hover:scale-110 hover:rotate-90 shadow-md hover:shadow-[0_0_15px_rgba(255,145,45,0.6)] transition-all duration-200 cursor-pointer z-30 flex items-center justify-center"
            title="Close Module"
          >
            <X size={15} />
          </button>

          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#ff912d]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full md:w-7/12 space-y-5 text-left relative z-10">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#ff912d]/10 border border-[#ff912d]/40 text-[#ff912d] font-mono text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} /> Diagnostic Aptitude Assessment
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-wider leading-tight">
                Calibrate Your Space Coding Path
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans pr-4">
                Evaluate your core aptitude across {questions.length || 22} scenario-based questions covering Pattern Recognition,
                Task Decomposition & Logic, Web Development, C++, Python, and Java. Completing this unlocks all planetary sectors!
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 font-bold">
                {questions.length || 22} Diagnostic Questions
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 font-bold">
                6 Skill Sectors
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-[#ff912d]/15 border border-[#ff912d]/30 text-xs font-mono text-[#ff912d] font-bold">
                +200 XP & +50 Gears
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setViewState("QUIZ")}
                className="w-full sm:w-auto px-9 py-3.5 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(255,145,45,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                Begin Assessment <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="w-full md:w-5/12 aspect-square max-w-[260px] sm:max-w-[280px] bg-gradient-to-br from-[#160528] via-[#260847] to-[#0f0320] border-2 border-[#ff912d]/50 shadow-[0_0_25px_rgba(255,145,45,0.3)] rounded-2xl p-6 relative flex flex-col justify-center items-center overflow-hidden shrink-0 z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff912d]/15 via-purple-600/10 to-transparent opacity-60" />
            <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border border-dashed border-[#ff912d]/50 animate-spin"
                style={{ animationDuration: "22s" }}
              />
              <div
                className="absolute inset-2 rounded-full border border-purple-500/40 animate-spin"
                style={{ animationDuration: "14s", animationDirection: "reverse" }}
              />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#ff912d]/20 border-2 border-[#ff912d] flex items-center justify-center text-[#ff912d] shadow-[0_0_35px_rgba(255,145,45,0.5)] transition-transform duration-300 hover:scale-105">
                <Brain size={44} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Active Assessment Runner (QUIZ)
  if (viewState === "QUIZ" && questions.length > 0) {
    const currentQ = questions[currentIndex];
    const sectionMeta = getQuestionSectionMeta(currentQ);
    const SectionIcon = sectionMeta.icon;
    const isLast = currentIndex === questions.length - 1;
    const currentSelected = selectedAnswers[currentQ.id];
    const isAnswered = Boolean(currentSelected);
    const answeredCount = Object.keys(selectedAnswers).length;

    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
        {/* Terminal Header Telemetry Bar */}
        <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`text-xs sm:text-sm font-mono font-bold px-3 py-1.5 rounded-xl border uppercase tracking-wider flex items-center gap-2 ${sectionMeta.badgeBg} ${sectionMeta.borderColor} ${sectionMeta.textColor}`}
              >
                <SectionIcon size={16} /> {sectionMeta.pillLabel}
              </span>
              <span className="text-xs sm:text-sm font-mono text-gray-300 font-bold">
                QUESTION {currentIndex + 1} OF {questions.length}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm font-mono font-bold text-gray-300">
              <Activity size={16} className="text-[#ff912d]" />
              <span>
                COMPLETED: {answeredCount} / {questions.length} (
                {Math.round((answeredCount / questions.length) * 100)}%)
              </span>
            </div>
          </div>

          {/* Dynamic Segment Progress Bar */}
          <div
            className="grid gap-1.5 sm:gap-2 w-full pt-1"
            style={{ gridTemplateColumns: `repeat(${questions.length || 22}, minmax(0, 1fr))` }}
          >
            {questions.map((q, i) => {
              const active = i === currentIndex;
              const answered = Boolean(selectedAnswers[q.id]);
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  title={`Question ${i + 1}: ${q.title}`}
                  className={`h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-[#ff912d] ring-2 ring-[#ff912d]/50 ring-offset-2 ring-offset-[#1e0a2d] scale-110"
                      : answered
                      ? "bg-emerald-400"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Problem Card */}
        <div className="bg-[#1e0a2d] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="space-y-3 border-b border-white/10 pb-6">
            <div className="text-xs sm:text-sm font-mono text-[#ff912d] font-bold uppercase tracking-widest flex items-center gap-2">
              <span>DIAGNOSTIC PROBLEM #{currentIndex + 1}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{currentQ.title}</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-relaxed font-display whitespace-pre-line">
              {currentQ.question}
            </h2>
          </div>

          {/* 4 Choices Grid (A, B, C, D) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {Object.entries(currentQ.options).map(([optKey, optText]) => {
              const isSelected = currentSelected === optKey;

              return (
                <button
                  key={optKey}
                  onClick={() => handleSelectOption(currentQ.id, optKey)}
                  className={`p-5 sm:p-6 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer min-h-[120px] relative group/card ${
                    isSelected
                      ? "bg-gradient-to-br from-[#ff912d]/25 via-[#2f1053] to-[#ff912d]/15 border-[#ff912d] text-white shadow-[0_0_30px_rgba(255,145,45,0.4)] scale-[1.01]"
                      : "bg-[#1c0b32]/90 border-white/10 hover:border-[#ff912d]/60 hover:bg-[#280e4b] text-gray-100 active:scale-95"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-lg border ${
                        isSelected
                          ? "bg-[#ff912d] text-black border-[#ff912d]"
                          : "bg-white/5 border-white/15 text-gray-300 group-hover/card:text-[#ff912d]"
                      }`}
                    >
                      OPTION {optKey}
                    </span>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 bg-[#ff912d]/20 border border-[#ff912d] px-2.5 py-1 rounded-full text-[#ff912d] text-xs font-mono font-bold uppercase">
                        <CheckCircle2 size={14} /> Selected
                      </div>
                    )}
                  </div>

                  <span className="text-base sm:text-lg md:text-xl font-bold leading-snug tracking-wide text-white">
                    {optText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10 gap-3">
            <button
              onClick={handlePrevQuestion}
              disabled={currentIndex === 0}
              className="px-6 sm:px-8 py-3.5 rounded-xl border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 disabled:opacity-30 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            <div className="flex items-center gap-3">
              {isLast ? (
                <button
                  onClick={attemptSubmit}
                  disabled={submitting}
                  className="px-8 sm:px-10 py-3.5 sm:py-4 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-[0_0_25px_rgba(255,145,45,0.4)] disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin text-black" />
                      Grading & Saving...
                    </>
                  ) : (
                    <>
                      Submit Diagnostic <CheckCircle2 size={18} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-8 sm:px-10 py-3.5 sm:py-4 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  Next Question <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Custom Toast Warning Modal (No browser alert) */}
        {renderToastNotificationModal()}

        {/* Custom Confirm Submission Modal */}
        {confirmSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-[#1e0a2d] border border-[#ff912d]/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_45px_rgba(255,145,45,0.35)] space-y-5 text-center relative">
              <div className="w-14 h-14 rounded-2xl bg-[#ff912d]/10 border border-[#ff912d]/40 text-[#ff912d] mx-auto flex items-center justify-center">
                <Sparkles size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-white uppercase tracking-wider">
                  Confirm Submission
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  All {questions.length || 22} diagnostic questions have been recorded. Your answers will be graded locally and
                  saved to your profile.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setConfirmSubmitModal(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Review Answers
                </button>
                <button
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  {submitting ? "Grading..." : "Confirm & Grade"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // State 3: Visual Novel Cutscene
  if (viewState === "CUTSCENE") {
    return (
      <div className="animate-in fade-in duration-300">
        <VisualNovelCutscene
          username={initialUser?.name || "Operator"}
          userId={initialUser?.id}
          missionId="prologue"
          scenes={introScenes as any}
          backgroundBase="/scenes/backgrounds/"
          onFinished={() => {
            router.push("/modules?fromCutscene=true");
          }}
        />
      </div>
    );
  }

  // State 4: Completed Report Screen
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Telemetry Status Bar */}
      <div className="bg-[#1e0a2d] border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-sm font-mono font-bold text-emerald-400 uppercase tracking-wider">
              [DIAGNOSTIC STATUS: CALIBRATED & VERIFIED]
            </div>
            <div className="text-base font-bold text-white">System Profile Successfully Generated</div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#ff912d]/10 border border-[#ff912d]/30 px-3.5 py-2 rounded-xl text-[#ff912d] font-mono text-sm font-bold">
          <Award size={16} />
          <span>+200 XP & +50 Gears</span>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="bg-[#1e0a2d] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="text-center space-y-2.5 border-b border-white/10 pb-6">
          <h2 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-wider">
            Diagnostic Profile Report
          </h2>
          <p className="text-sm sm:text-base text-gray-200 font-sans max-w-2xl mx-auto">
            {hasSubcategories
              ? "Comprehensive skill calibration across Pattern Recognition, Task Decomposition, Web Development, C++, Python, and Java."
              : "Comprehensive skill calibration across Pattern Recognition, Task Decomposition, and Logical Reasoning."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-3">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-sm font-mono text-gray-300 uppercase font-semibold">Overall Calibration:</span>
              <span className="text-2xl sm:text-3xl font-black text-[#ff912d] font-display">
                {results?.totalCorrect ?? 0} / {results?.totalQuestions ?? 22}
              </span>
              <span className="text-sm font-mono font-bold px-3 py-1 rounded-lg bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/40">
                {results?.totalPercent ?? 0}% Accuracy
              </span>
            </div>
            {results?.aiInsight?.track && (
              <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-sm font-bold">
                <span className="text-gray-400 uppercase">Cognitive Track:</span>
                <span className="text-white uppercase font-black">{results.aiInsight.track} SYSTEMS</span>
              </div>
            )}
          </div>
        </div>

        {/* 6 Section Domain Cards (or 3-Card Fallback for Legacy Records without Subcategories) */}
        {hasSubcategories ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sixSectionsData.map((sec) => (
              <div
                key={sec.key}
                className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-3.5 hover:border-white/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between font-mono uppercase">
                  <span className={`flex items-center gap-2 text-sm sm:text-base font-bold ${sec.textColor}`}>
                    <sec.icon size={18} /> {sec.name}
                  </span>
                  <span className={`text-base sm:text-lg font-black ${sec.textColor}`}>
                    {sec.percent}%
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black font-display text-white">
                  {sec.correct}{" "}
                  <span className="text-sm sm:text-base text-gray-300 font-normal">
                    / {sec.total} correct
                  </span>
                </div>
                <div className="h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                  <div
                    className={`h-full bg-gradient-to-r ${sec.gradient} rounded-full transition-all duration-500`}
                    style={{ width: `${sec.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pattern Recognition Card */}
            <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-3.5">
              <div className="flex items-center justify-between font-mono uppercase">
                <span className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#ff912d]">
                  <Cpu size={18} /> Pattern Recognition
                </span>
                <span className="text-base sm:text-lg text-[#ff912d] font-black">
                  {results?.categories?.pattern_recognition?.percent ?? 0}%
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-display text-white">
                {results?.categories?.pattern_recognition?.correct ?? 0}{" "}
                <span className="text-sm sm:text-base text-gray-300 font-normal">
                  / {results?.categories?.pattern_recognition?.total ?? 6} correct
                </span>
              </div>
              <div className="h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#ff912d] to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${results?.categories?.pattern_recognition?.percent ?? 0}%` }}
                />
              </div>
            </div>

            {/* Task Decomposition Card */}
            <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-3.5">
              <div className="flex items-center justify-between font-mono uppercase">
                <span className="flex items-center gap-2 text-sm sm:text-base font-bold text-sky-400">
                  <Layers size={18} /> Task Decomposition
                </span>
                <span className="text-base sm:text-lg text-sky-400 font-black">
                  {results?.categories?.task_decomposition?.percent ?? 0}%
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-display text-white">
                {results?.categories?.task_decomposition?.correct ?? 0}{" "}
                <span className="text-sm sm:text-base text-gray-300 font-normal">
                  / {results?.categories?.task_decomposition?.total ?? 3} correct
                </span>
              </div>
              <div className="h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${results?.categories?.task_decomposition?.percent ?? 0}%` }}
                />
              </div>
            </div>

            {/* Logical Reasoning Card */}
            <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-3.5">
              <div className="flex items-center justify-between font-mono uppercase">
                <span className="flex items-center gap-2 text-sm sm:text-base font-bold text-purple-400">
                  <Brain size={18} /> Logical Reasoning
                </span>
                <span className="text-base sm:text-lg text-purple-400 font-black">
                  {results?.categories?.logical_reasoning?.percent ?? 0}%
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-display text-white">
                {results?.categories?.logical_reasoning?.correct ?? 0}{" "}
                <span className="text-sm sm:text-base text-gray-300 font-normal">
                  / {results?.categories?.logical_reasoning?.total ?? 6} correct
                </span>
              </div>
              <div className="h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-500"
                  style={{ width: `${results?.categories?.logical_reasoning?.percent ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Strongest & Weakest Category Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-mono uppercase text-emerald-400 font-bold tracking-wider">
                Strongest Domain
              </div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                {strongestDomain.name} ({strongestDomain.percent}%)
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Target size={22} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-mono uppercase text-amber-400 font-bold tracking-wider">
                Primary Growth Area
              </div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                {primaryGrowthArea.name} ({primaryGrowthArea.percent}%)
              </div>
            </div>
          </div>
        </div>

        {/* Missed Concepts Breakdown (If Any) */}
        {results?.missed && results.missed.length > 0 ? (
          <div className="bg-black/25 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-3.5">
            <div className="flex items-center gap-2 text-sm sm:text-base font-mono text-amber-400 font-bold uppercase tracking-wider">
              <AlertTriangle size={18} /> Targeted Concepts for Reinforcement ({results.missed.length})
            </div>
            <p className="text-sm sm:text-base text-gray-200">
              The following computational concepts were identified for additional practice during your upcoming planetary missions:
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {results.missed.map((m) => (
                <div
                  key={m.id}
                  className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-mono text-gray-100 flex items-center gap-2 font-medium"
                >
                  <span className="text-[#ff912d] font-bold">[{m.id.toUpperCase()}]</span>
                  <span>{m.concept}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-center gap-3 text-emerald-400 text-sm sm:text-base font-mono font-bold">
            <CheckCircle2 size={22} /> Zero telemetry errors detected! Flawless diagnostic calibration.
          </div>
        )}

        {/* Nova's AI Diagnostic Evaluation (from Gemini) */}
        {results?.aiInsight && (
          <div className="bg-gradient-to-br from-purple-900/30 via-[#260c44] to-[#160528] border border-purple-500/40 rounded-2xl p-6 sm:p-7 space-y-3.5 relative overflow-hidden shadow-lg">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-mono text-[#ff912d] font-bold uppercase tracking-wider">
              <Sparkles size={18} /> Nova AI Diagnostic Evaluation
            </div>
            <p className="text-base sm:text-lg text-gray-100 leading-relaxed font-sans font-medium">
              {(() => {
                const summary = results.aiInsight.summary?.trim() || "";
                if (!summary) return "";
                if (summary.endsWith("✨") || summary.endsWith("🌟")) return summary;
                const isFallback = results.aiInsight.source === "fallback" || (results as any).isFallback;
                return `${summary} ${isFallback ? "🌟" : "✨"}`;
              })()}
            </p>
            {Boolean(results.aiInsight.advice?.trim()) && (
              <div className="pt-3 border-t border-purple-500/20 text-sm sm:text-base text-purple-200 leading-relaxed">
                <span className="font-bold text-white uppercase tracking-wider font-mono">
                  Mission Directive:{" "}
                </span>
                {results.aiInsight.advice}
              </div>
            )}
          </div>
        )}

        {/* Planetary Affinity Alignment (Nova AI Computed Curriculum Mapping) */}
        {SHOW_PLANET_AFFINITY && results?.aiInsight?.planets && results.aiInsight.planets.length > 0 && (
          <div className="bg-black/25 border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-sm sm:text-base font-mono text-[#ff912d] font-bold uppercase tracking-wider">
                <Globe size={18} /> Planetary Affinity Alignment ({results.aiInsight.planets.length} Celestial Sectors)
              </div>
              <span className="text-xs font-mono text-gray-400">
                Calibrated to your cognitive profile
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-200">
              Nova AI has analyzed your diagnostic results and mapped your affinities across the celestial sectors of your learning orbit:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {results.aiInsight.planets.map((p) => {
                const iconSrc = getPlanetIcon(p.planet);
                return (
                  <div
                    key={p.planet}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3 hover:border-[#ff912d]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={iconSrc}
                          alt={p.planet}
                          className="w-7 h-7 object-contain drop-shadow"
                        />
                        <span className="font-bold text-white uppercase text-sm font-display tracking-wider">
                          {p.planet}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/40">
                        {p.affinity}% Affinity
                      </span>
                    </div>
                    {/* Affinity Bar */}
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-[#ff912d] to-amber-300 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(10, p.affinity))}%` }}
                      />
                    </div>
                    {/* Reason */}
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                      {p.reason}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommended Orbit Learning Path */}
        <div className="bg-gradient-to-r from-[#ff912d]/10 to-purple-900/20 border border-[#ff912d]/30 rounded-2xl p-6 sm:p-7 space-y-2.5">
          <div className="flex items-center gap-2 text-sm sm:text-base font-mono text-[#ff912d] font-bold uppercase tracking-wider">
            <Compass size={18} /> Recommended Orbit Path
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-display">
            {results?.recommendedLearningPath ?? "Fullstack Systems & Distributed Architecture"}
          </div>
          <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
            Based on your analytical calibration, your learning trajectory is optimized. All planetary sectors are now primed.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          {(() => {
            const isFallbackUser = Boolean(
              initialUser?.isFallback ?? (initialUser?.aptitudeResult as any)?.isFallback ?? results?.aiInsight?.source === "fallback"
            );
            const hasValidPath = Boolean(
              (initialUser?.pathOrder && initialUser.pathOrder.length > 0) ||
              results?.recommendedLearningPath ||
              initialUser?.recommendedLearningPath
            );
            const isRetakeLocked = Boolean(initialUser?.hasTakenAptitudeTest && !isFallbackUser && hasValidPath);

            return isRetakeLocked ? (
              <button
                onClick={() => router.push("/profile")}
                className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
              >
                <Compass size={18} /> View Profile Orbit
              </button>
            ) : (
              <button
                onClick={() => {
                  setViewState("QUIZ");
                  setSelectedAnswers({});
                  setCurrentIndex(0);
                  loadDiagnosticQuestions();
                }}
                className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
              >
                <RefreshCw size={18} /> Recalibrate Assessment
              </button>
            );
          })()}
          <button
            onClick={() => setViewState("CUTSCENE")}
            className="w-full sm:w-auto px-9 py-4 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(255,145,45,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            Start Journey <Rocket size={20} />
          </button>
        </div>
      </div>

      {/* Custom Toast Warning Modal in Completed View */}
      {renderToastNotificationModal()}
    </div>
  );
}
