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

interface AptitudeTestClientProps {
  initialUser: any;
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

export default function AptitudeTestClient({ initialUser }: AptitudeTestClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();
  const shouldOpenModal = searchParams ? searchParams.get("openModal") === "true" : false;

  // View states: 'BRIEFING' | 'QUIZ' | 'COMPLETED' | 'CUTSCENE'
  const [viewState, setViewState] = useState<"BRIEFING" | "QUIZ" | "COMPLETED" | "CUTSCENE">(
    initialUser?.hasTakenAptitudeTest
      ? "COMPLETED"
      : shouldOpenModal
      ? "BRIEFING"
      : "QUIZ"
  );

  const [questions, setQuestions] = useState<ClientAptitudeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<AptitudeTestResult | null>(() => {
    if (initialUser?.aptitudeResult) return initialUser.aptitudeResult;
    if (initialUser?.hasTakenAptitudeTest) {
      const pScore = initialUser.patternRecognitionScore ?? 0;
      const tScore = initialUser.taskDecompositionScore ?? 0;
      const lScore = initialUser.logicScore ?? 0;
      const pCorrect = Math.round((pScore / 100) * 5);
      const tCorrect = Math.round((tScore / 100) * 5);
      const lCorrect = Math.round((lScore / 100) * 5);
      const totCorrect = pCorrect + tCorrect + lCorrect;
      const totPercent = Math.round(((pScore + tScore + lScore) / 300) * 100);

      const cats = [
        { category: "pattern_recognition" as const, name: "Pattern Recognition", percent: pScore },
        { category: "task_decomposition" as const, name: "Task Decomposition", percent: tScore },
        { category: "logical_reasoning" as const, name: "Logical Reasoning", percent: lScore },
      ].sort((a, b) => b.percent - a.percent);

      return {
        totalCorrect: totCorrect,
        totalQuestions: 15,
        totalPercent: totPercent,
        categories: {
          pattern_recognition: {
            category: "pattern_recognition",
            name: "Pattern Recognition",
            correct: pCorrect,
            total: 5,
            percent: pScore,
          },
          task_decomposition: {
            category: "task_decomposition",
            name: "Task Decomposition",
            correct: tCorrect,
            total: 5,
            percent: tScore,
          },
          logical_reasoning: {
            category: "logical_reasoning",
            name: "Logical Reasoning",
            correct: lCorrect,
            total: 5,
            percent: lScore,
          },
        },
        strongestCategory: cats[0],
        weakestCategory: cats[cats.length - 1],
        missed: [],
        recommendedLearningPath: initialUser.recommendedLearningPath ?? "Fullstack Web & Distributed Systems",
        completedAt: new Date().toISOString(),
      };
    }
    return null;
  });

  // Custom in-app modal notification state (compliant with project rule: no alert() / confirm())
  const [toastNotification, setToastNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
    unansweredIds?: number[];
  } | null>(null);

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
        message: `All 15 questions must be answered before grading. Uncompleted: Question ${unansweredIndices.join(
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
        headers: { "Content-Type": "application/json" },
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
        setToastNotification({
          show: true,
          title: "Submission Error",
          message: data.message || "Could not grade assessment. Please try again.",
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
            Loading 15 server-verified algorithmic aptitude problems...
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
                Evaluate your core aptitude across 15 scenario-based questions: Pattern Recognition,
                Task Decomposition, and Logical Reasoning. Completing this unlocks all planetary sectors!
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 font-bold">
                15 Diagnostic Questions
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 font-bold">
                3 Cognitive Domains
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-[#ff912d]/15 border border-[#ff912d]/30 text-xs font-mono text-[#ff912d] font-bold">
                +150 XP & +50 Gears
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
    const catMeta = CATEGORY_META[currentQ.category] || CATEGORY_META.logical_reasoning;
    const CategoryIcon = catMeta.icon;
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
                className={`text-xs sm:text-sm font-mono font-bold px-3 py-1.5 rounded-xl border uppercase tracking-wider flex items-center gap-2 ${catMeta.badgeBg} ${catMeta.borderColor} ${catMeta.textColor}`}
              >
                <CategoryIcon size={16} /> {catMeta.name}
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

          {/* 15-Segment Progress Bar */}
          <div className="grid grid-cols-15 gap-1.5 sm:gap-2 w-full pt-1">
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
        {toastNotification?.show && (
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
                onClick={() => setToastNotification(null)}
                className="w-full py-3 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Review Unanswered Problems
              </button>
            </div>
          </div>
        )}

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
                  All 15 diagnostic questions have been recorded. Your answers will be graded locally and
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
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              [DIAGNOSTIC STATUS: CALIBRATED & VERIFIED]
            </div>
            <div className="text-sm font-bold text-white">System Profile Successfully Generated</div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-[#ff912d]/10 border border-[#ff912d]/30 px-3 py-1.5 rounded-xl text-[#ff912d] font-mono text-xs font-bold">
          <Award size={14} />
          <span>+200 XP & +50 Gears</span>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="bg-[#1e0a2d] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="text-center space-y-2 border-b border-white/10 pb-6">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-wider">
            Diagnostic Profile Report
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-sans">
            Comprehensive skill calibration across Pattern Recognition, Task Decomposition, and Logical Reasoning.
          </p>

          <div className="inline-flex items-center gap-3 mt-3 px-5 py-2 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs font-mono text-gray-400 uppercase">Overall Calibration:</span>
            <span className="text-xl sm:text-2xl font-black text-[#ff912d] font-display">
              {results?.totalCorrect ?? 0} / {results?.totalQuestions ?? 15}
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/40">
              {results?.totalPercent ?? 0}% Accuracy
            </span>
          </div>
        </div>

        {/* 3 Domain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pattern Recognition Card */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-400">
              <span className="flex items-center gap-1.5 text-[#ff912d]">
                <Cpu size={14} /> Pattern Recognition
              </span>
              <span className="text-[#ff912d] font-bold">
                {results?.categories.pattern_recognition.percent ?? 0}%
              </span>
            </div>
            <div className="text-2xl font-black font-display text-white">
              {results?.categories.pattern_recognition.correct ?? 0}{" "}
              <span className="text-xs text-gray-400 font-normal">/ 5 correct</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#ff912d] to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${results?.categories.pattern_recognition.percent ?? 0}%` }}
              />
            </div>
          </div>

          {/* Task Decomposition Card */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-400">
              <span className="flex items-center gap-1.5 text-sky-400">
                <Layers size={14} /> Task Decomposition
              </span>
              <span className="text-sky-400 font-bold">
                {results?.categories.task_decomposition.percent ?? 0}%
              </span>
            </div>
            <div className="text-2xl font-black font-display text-white">
              {results?.categories.task_decomposition.correct ?? 0}{" "}
              <span className="text-xs text-gray-400 font-normal">/ 5 correct</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${results?.categories.task_decomposition.percent ?? 0}%` }}
              />
            </div>
          </div>

          {/* Logical Reasoning Card */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-gray-400">
              <span className="flex items-center gap-1.5 text-purple-400">
                <Brain size={14} /> Logical Reasoning
              </span>
              <span className="text-purple-400 font-bold">
                {results?.categories.logical_reasoning.percent ?? 0}%
              </span>
            </div>
            <div className="text-2xl font-black font-display text-white">
              {results?.categories.logical_reasoning.correct ?? 0}{" "}
              <span className="text-xs text-gray-400 font-normal">/ 5 correct</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-500"
                style={{ width: `${results?.categories.logical_reasoning.percent ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Strongest & Weakest Category Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold">
                Strongest Domain
              </div>
              <div className="text-sm font-bold text-white">
                {results?.strongestCategory.name ?? "Pattern Recognition"} (
                {results?.strongestCategory.percent ?? 0}%)
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Target size={20} />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-amber-400 font-bold">
                Primary Growth Area
              </div>
              <div className="text-sm font-bold text-white">
                {results?.weakestCategory.name ?? "Task Decomposition"} (
                {results?.weakestCategory.percent ?? 0}%)
              </div>
            </div>
          </div>
        </div>

        {/* Missed Concepts Breakdown (If Any) */}
        {results?.missed && results.missed.length > 0 ? (
          <div className="bg-black/25 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              <AlertTriangle size={15} /> Targeted Concepts for Reinforcement ({results.missed.length})
            </div>
            <p className="text-xs text-gray-300">
              The following computational concepts were identified for additional practice during your upcoming planetary missions:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {results.missed.map((m) => (
                <div
                  key={m.id}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-200 flex items-center gap-2"
                >
                  <span className="text-[#ff912d] font-bold">[{m.id.toUpperCase()}]</span>
                  <span>{m.concept}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3 text-emerald-400 text-xs font-mono font-bold">
            <CheckCircle2 size={18} /> Zero telemetry errors detected! Flawless diagnostic calibration.
          </div>
        )}

        {/* Nova's AI Diagnostic Evaluation (from Gemini) */}
        {results?.aiInsight && (
          <div className="bg-gradient-to-br from-purple-900/30 via-[#260c44] to-[#160528] border border-purple-500/40 rounded-2xl p-6 space-y-3 relative overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 text-xs font-mono text-[#ff912d] font-bold uppercase tracking-wider">
              <Sparkles size={16} /> Nova AI Diagnostic Evaluation
            </div>
            <p className="text-sm text-gray-100 leading-relaxed font-sans font-medium">
              {results.aiInsight.summary}
            </p>
            <div className="pt-2 border-t border-purple-500/20 text-xs text-purple-200 leading-relaxed">
              <span className="font-bold text-white uppercase tracking-wider font-mono">
                Mission Directive:{" "}
              </span>
              {results.aiInsight.advice}
            </div>
          </div>
        )}

        {/* Recommended Orbit Learning Path */}
        <div className="bg-gradient-to-r from-[#ff912d]/10 to-purple-900/20 border border-[#ff912d]/30 rounded-2xl p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#ff912d] font-bold uppercase tracking-wider">
            <Compass size={16} /> Recommended Orbit Path
          </div>
          <div className="text-lg font-bold text-white font-display">
            {results?.recommendedLearningPath ?? "Fullstack Systems & Distributed Architecture"}
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Based on your analytical calibration, your learning trajectory is optimized. All planetary sectors are now primed.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setViewState("QUIZ");
              setSelectedAnswers({});
              setCurrentIndex(0);
              loadDiagnosticQuestions();
            }}
            className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} /> Recalibrate Assessment
          </button>
          <button
            onClick={() => setViewState("CUTSCENE")}
            className="w-full sm:w-auto px-8 py-4 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-[0_0_25px_rgba(255,145,45,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            Start Journey <Rocket size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
