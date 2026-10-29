"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  Layers,
  RefreshCw,
  CheckCircle2,
  Cpu,
  Globe,
  Sparkles,
  RotateCcw,
  Sparkle,
} from 'lucide-react';
import {
  getCanonicalAptitudeQuestions,
  CanonicalQuestion,
  CanonicalQuestionsData,
  generateAptitudeQuestionsAI,
  revertAptitudeQuestionsAI,
} from './actions/aptitudeAdmin';
import ConfirmModal from '@/components/ConfirmModal';
import AdminToast from '@/components/AdminToast';

interface SectionConfig {
  key: string;
  title: string;
  icon: typeof Brain;
  textColor: string;
  badgeBg: string;
  borderColor: string;
}

const SECTION_CONFIGS: SectionConfig[] = [
  {
    key: "pattern_recognition",
    title: "Pattern Recognition",
    icon: Cpu,
    textColor: "text-[#ff912d]",
    badgeBg: "bg-[#ff912d]/10",
    borderColor: "border-[#ff912d]/30",
  },
  {
    key: "task_decomposition",
    title: "Task Decomposition & Logic",
    icon: Layers,
    textColor: "text-sky-400",
    badgeBg: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
  },
  {
    key: "web_dev",
    title: "Web Development (HTML/CSS/JS)",
    icon: Globe,
    textColor: "text-amber-400",
    badgeBg: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  {
    key: "cpp",
    title: "C++ Fundamentals",
    icon: Cpu,
    textColor: "text-blue-400",
    badgeBg: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    key: "python",
    title: "Python Fundamentals",
    icon: Sparkles,
    textColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  {
    key: "java",
    title: "Java Fundamentals",
    icon: Brain,
    textColor: "text-orange-400",
    badgeBg: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
];

export default function AptitudeManagement() {
  const [data, setData] = useState<CanonicalQuestionsData | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Generation State
  const [generating, setGenerating] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [categoryFocus, setCategoryFocus] = useState<"MIXED" | "LOGIC" | "PATTERN" | "CODING_READINESS">("MIXED");
  const [difficulty, setDifficulty] = useState<"STANDARD" | "STRICT_TECHNICAL" | "BEGINNER">("STANDARD");
  const [generateCount, setGenerateCount] = useState<number>(22);

  // Modal & Toast States
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const canonicalData = await getCanonicalAptitudeQuestions();
      setData(canonicalData);
    } catch (err) {
      console.error("Failed to load canonical aptitude questions:", err);
      setToast({
        message: "Failed to load diagnostic questions.",
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const res = await generateAptitudeQuestionsAI(categoryFocus, difficulty, generateCount);
      if (res.success) {
        setToast({
          message: `Successfully generated ${res.count || generateCount} AI diagnostic questions!`,
          type: 'success',
        });
        await loadQuestions();
      } else {
        setToast({
          message: res.error || "Failed to generate AI questions.",
          type: 'error',
        });
      }
    } catch (err: any) {
      console.error("AI question generation error:", err);
      setToast({
        message: err?.message || "Failed to generate AI questions.",
        type: 'error',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRevertConfirm = async () => {
    setReverting(true);
    try {
      const res = await revertAptitudeQuestionsAI();
      setShowRevertModal(false);
      if (res.success) {
        setToast({
          message: res.message || "Successfully reverted to canonical questions.",
          type: 'success',
        });
        await loadQuestions();
      } else {
        setToast({
          message: res.error || "Failed to revert questions.",
          type: 'error',
        });
      }
    } catch (err: any) {
      console.error("Revert questions error:", err);
      setShowRevertModal(false);
      setToast({
        message: err?.message || "Failed to revert questions.",
        type: 'error',
      });
    } finally {
      setReverting(false);
    }
  };

  const questions = data?.questions || [];

  // Group questions by their 6 sections
  const questionsBySection = useMemo(() => {
    const map: Record<string, CanonicalQuestion[]> = {
      pattern_recognition: [],
      task_decomposition: [],
      web_dev: [],
      cpp: [],
      python: [],
      java: [],
    };

    for (const q of questions) {
      const sub = (q.subcategory || q.category || "").toLowerCase();
      if (map[sub]) {
        map[sub].push(q);
      } else if (sub.includes("pattern")) {
        map.pattern_recognition.push(q);
      } else if (sub.includes("decomp") || sub.includes("task") || sub.includes("logic")) {
        map.task_decomposition.push(q);
      } else if (sub.includes("web")) {
        map.web_dev.push(q);
      } else if (sub.includes("cpp") || sub.includes("c++")) {
        map.cpp.push(q);
      } else if (sub.includes("py")) {
        map.python.push(q);
      } else if (sub.includes("java")) {
        map.java.push(q);
      } else {
        map.task_decomposition.push(q);
      }
    }

    // Sort questions within each section by question number
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.number - b.number);
    }

    return map;
  }, [questions]);

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <AdminToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* AI Quiz Generation Engine Card */}
      <div className="bg-[#1e0a2d] border border-[#ff912d]/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[#ff912d]/10 border border-[#ff912d]/30 text-[#ff912d] shrink-0">
              <Sparkles size={26} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black font-display text-white uppercase tracking-wider">
                  A.I. Quiz Generation Engine
                </h2>
                {data?.isAiGenerated ? (
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkle size={12} /> AI-Generated Set Active
                  </span>
                ) : (
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> Canonical Spec Active (22 Questions)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300">
                Generate diagnostic aptitude questions dynamically with automated history snapshot backup and one-click rollback.
              </p>
            </div>
          </div>
        </div>

        {/* AI Parameters Controls & Actions */}
        <div className="pt-2 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Category Focus */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                Category Focus
              </label>
              <select
                value={categoryFocus}
                onChange={(e) => setCategoryFocus(e.target.value as any)}
                className="w-full bg-black/40 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none focus:border-[#ff912d] transition-colors"
              >
                <option value="MIXED" className="bg-[#1e0a2d]">Mixed Categories (Full Set)</option>
                <option value="LOGIC" className="bg-[#1e0a2d]">Logic & Reasoning</option>
                <option value="PATTERN" className="bg-[#1e0a2d]">Pattern Recognition</option>
                <option value="CODING_READINESS" className="bg-[#1e0a2d]">Coding Readiness</option>
              </select>
            </div>

            {/* Difficulty Directive */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-black/40 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none focus:border-[#ff912d] transition-colors"
              >
                <option value="STANDARD" className="bg-[#1e0a2d]">Standard (Undergrad CS)</option>
                <option value="STRICT_TECHNICAL" className="bg-[#1e0a2d]">Strict Technical (Algorithms)</option>
                <option value="BEGINNER" className="bg-[#1e0a2d]">Beginner (Foundations)</option>
              </select>
            </div>

            {/* Question Count (Max 22) */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                Question Count (Max 22)
              </label>
              <select
                value={generateCount}
                onChange={(e) => setGenerateCount(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none focus:border-[#ff912d] transition-colors"
              >
                <option value={22} className="bg-[#1e0a2d]">22 Questions (Full Bank)</option>
                <option value={15} className="bg-[#1e0a2d]">15 Questions</option>
                <option value={10} className="bg-[#1e0a2d]">10 Questions</option>
                <option value={5} className="bg-[#1e0a2d]">5 Questions</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:self-end pt-1">
            <button
              onClick={handleGenerateAI}
              disabled={generating || reverting}
              className="px-5 py-2.5 bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Generate Questions
                </>
              )}
            </button>

            {/* Undo / Revert Button */}
            <button
              onClick={() => setShowRevertModal(true)}
              disabled={generating || reverting}
              className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl border transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50 ${
                data?.canUndo
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10'
              }`}
              title="Revert to original canonical questions"
            >
              <RotateCcw size={15} className={reverting ? "animate-spin" : ""} />
              <span>{data?.canUndo ? "Undo / Revert to Original" : "Revert to Original"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Canonical Question Bank Banner */}
      <div className="bg-[#1e0a2d] border-2 border-[#ff912d]/50 rounded-3xl p-6 sm:p-7 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-[#ff912d]/10 border border-[#ff912d]/30 text-[#ff912d] shrink-0 mt-0.5">
            <Brain size={28} />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                Cognitive Aptitude Question Bank
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/40 uppercase tracking-wider">
                {data?.isAiGenerated ? "AI-Modified Session" : "Canonical Spec (Managed in File)"}
              </span>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-xs sm:text-sm text-gray-200 leading-relaxed space-y-1.5">
              <p>
                <strong className="text-[#ff912d]">Note:</strong> The baseline question bank is canonically defined in <code className="text-[#ff912d] font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded border border-[#ff912d]/40">aptitude_questions.server.json</code>.
              </p>
              <p className="text-gray-400 text-xs">
                Student tests evaluate against the active diagnostic question bank to guarantee deterministic scoring, 22-question distribution across the 6 sections, and offline reliability.
              </p>
            </div>
            <p className="text-[11px] text-gray-400">
              This administrative view displays the active question bank for audit and curriculum review. AI generation snapshots previous question sets to enable one-click restoration anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: Title & Refresh Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Layers size={18} className="text-[#ff912d]" />
          <span>Active Questions ({questions.length} across 6 Sections)</span>
        </div>

        <button
          onClick={loadQuestions}
          disabled={loading || generating || reverting}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-white/10 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Questions Grouped by 6 Sections */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 font-mono text-xs">
          Loading diagnostic questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl p-8 text-center text-gray-400 text-sm">
          No active questions found. Click "Revert to Original" to load baseline canonical questions.
        </div>
      ) : (
        <div className="space-y-8">
          {SECTION_CONFIGS.map((section) => {
            const sectionQuestions = questionsBySection[section.key] || [];
            const SectionIcon = section.icon;

            return (
              <div key={section.key} className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl px-5 py-3.5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border ${section.badgeBg} ${section.borderColor} ${section.textColor}`}>
                      <SectionIcon size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {section.title}
                      </h3>
                      <span className="text-[11px] font-mono text-gray-400 uppercase">
                        Subcategory: {section.key}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl border ${section.badgeBg} ${section.borderColor} ${section.textColor}`}>
                    {sectionQuestions.length} {sectionQuestions.length === 1 ? 'Question' : 'Questions'}
                  </span>
                </div>

                {/* Section Questions Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {sectionQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-[#1e0a2d] border border-white/10 rounded-2xl p-5 shadow-md flex flex-col gap-3.5 hover:border-white/20 transition-all"
                    >
                      {/* Question Top Metadata */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-black text-[#ff912d] bg-[#ff912d]/10 px-2.5 py-1 rounded-lg border border-[#ff912d]/30">
                            QUESTION #{q.number}
                          </span>
                          <span className="text-xs font-mono text-gray-400 font-bold px-2 py-1 rounded-lg bg-black/30 border border-white/10">
                            ID: {q.id}
                          </span>
                          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${section.badgeBg} ${section.borderColor} ${section.textColor}`}>
                            {q.concept}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> Active Question
                        </span>
                      </div>

                      {/* Question Title & Prompt */}
                      <div className="space-y-1">
                        <div className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">
                          {q.title}
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed whitespace-pre-line">
                          {q.question}
                        </h4>
                      </div>

                      {/* Choices Grid (A, B, C, D) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                        {Object.entries(q.options).map(([optKey, optText]) => {
                          const isCorrect = optKey.trim().toUpperCase() === q.answer.trim().toUpperCase();

                          return (
                            <div
                              key={optKey}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
                                isCorrect
                                  ? 'bg-emerald-500/15 border-emerald-500/50 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                  : 'bg-black/25 border-white/10 text-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`font-mono text-[11px] font-black px-2 py-0.5 rounded border ${
                                    isCorrect
                                      ? 'bg-emerald-500 text-black border-emerald-400'
                                      : 'bg-white/5 border-white/10 text-gray-400'
                                  }`}
                                >
                                  {optKey}
                                </span>
                                <span className="leading-snug">{optText}</span>
                              </div>
                              {isCorrect && (
                                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                                  <CheckCircle2 size={12} /> Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Correct Answer Callout */}
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl">
                        <CheckCircle2 size={14} className="shrink-0" />
                        <span>Correct Answer: Option {q.answer}</span>
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="text-xs text-gray-300 bg-black/40 p-3 rounded-xl border border-white/10 space-y-1">
                          <span className="font-bold text-[#ff912d] uppercase tracking-wider text-[10px] block">
                            Explanation:
                          </span>
                          <p className="leading-relaxed text-gray-300">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal: Undo / Revert to Canonical Spec */}
      <ConfirmModal
        isOpen={showRevertModal}
        title="Revert Diagnostic Question Bank"
        message="Are you sure you want to revert to the original canonical question bank (22 questions)? Any active AI-generated questions will be replaced and original baseline questions will be restored."
        confirmLabel="Revert to Original Questions"
        cancelLabel="Cancel"
        variant="warning"
        loading={reverting}
        onConfirm={handleRevertConfirm}
        onCancel={() => setShowRevertModal(false)}
      />
    </div>
  );
}
