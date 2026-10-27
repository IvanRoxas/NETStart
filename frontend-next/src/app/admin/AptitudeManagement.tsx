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
} from 'lucide-react';
import {
  getCanonicalAptitudeQuestions,
  CanonicalQuestion,
  CanonicalQuestionsData,
} from './actions/aptitudeAdmin';

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

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const canonicalData = await getCanonicalAptitudeQuestions();
      setData(canonicalData);
    } catch (err) {
      console.error("Failed to load canonical aptitude questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

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
      } else if (sub.includes("decomp") || sub.includes("task")) {
        map.task_decomposition.push(q);
      } else if (sub.includes("web")) {
        map.web_dev.push(q);
      } else if (sub.includes("cpp") || sub.includes("c++")) {
        map.cpp.push(q);
      } else if (sub.includes("py")) {
        map.python.push(q);
      } else if (sub.includes("java")) {
        map.java.push(q);
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
                Read-Only (Managed in File)
              </span>
            </div>
            <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-xs sm:text-sm text-gray-200 leading-relaxed space-y-1.5">
              <p>
                <strong className="text-[#ff912d]">Note:</strong> The question bank is canonically managed in <code className="text-[#ff912d] font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded border border-[#ff912d]/40">aptitude_questions.server.json</code>.
              </p>
              <p className="text-gray-400 text-xs">
                Student tests do not load questions from the database; they evaluate against the canonical JSON file to guarantee deterministic scoring, 22-question distribution across the 6 sections, and offline reliability.
              </p>
            </div>
            <p className="text-[11px] text-gray-400">
              This administrative view displays the active canonical question bank for audit and curriculum review. Question creation, editing, and deletion are managed directly via the source JSON file.
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: Title & Refresh Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Layers size={18} className="text-[#ff912d]" />
          <span>Canonical Questions ({questions.length} across 6 Sections)</span>
        </div>

        <button
          onClick={loadQuestions}
          disabled={loading}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-white/10 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Questions Grouped by 6 Sections (Read-Only) */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 font-mono text-xs">
          Loading canonical diagnostic questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl p-8 text-center text-gray-400 text-sm">
          No questions found in <code className="text-[#ff912d]">aptitude_questions.server.json</code>.
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
                          <CheckCircle2 size={12} /> Canonical Spec
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

                      {/* 4 Choices Grid (A, B, C, D) */}
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
    </div>
  );
}
