"use client";

import React, { useState, useEffect } from 'react';
import { Brain, Layers, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getAdminAptitudeQuestions } from './actions/aptitudeAdmin';

export default function AptitudeManagement() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await getAdminAptitudeQuestions();
      setQuestions(data);
    } catch (err) {
      console.error("Failed to load admin aptitude questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

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
                Student tests do not load questions from the database; they evaluate against the canonical JSON file to guarantee deterministic scoring, 15-question distribution across Logic, Pattern Recognition, and Task Decomposition, and offline reliability.
              </p>
            </div>
            <p className="text-[11px] text-gray-400">
              This administrative view is read-only for audit and historical reference. Question creation, deletion, and toggle controls are disabled.
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: Title & Refresh Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Layers size={18} className="text-[#ff912d]" />
          <span>Archived Database Questions ({questions.length})</span>
        </div>

        <button
          onClick={loadQuestions}
          disabled={loading}
          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-white/10 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Questions List (Read-Only) */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 font-mono text-xs">
          Loading diagnostic questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl p-8 text-center text-gray-400 text-sm">
          No database questions found. All active diagnostic tests are served directly from <code className="text-[#ff912d]">aptitude_questions.server.json</code>.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-[#1e0a2d] border border-white/10 rounded-2xl p-5 shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-gray-400">#{idx + 1}</span>
                  <span className="text-[10px] font-mono font-bold text-[#ff912d] bg-[#ff912d]/10 px-2 py-0.5 rounded border border-[#ff912d]/30 uppercase">
                    {q.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase">
                    {q.questionType || "MULTIPLE_CHOICE"}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Read-Only Record
                  </span>
                </div>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                {q.question}
              </h3>

              {/* Display Options or Short Answer based on question type */}
              {q.questionType === "SHORT_ANSWER" ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  Correct Short Answer: "{q.shortAnswer}"
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {Array.isArray(q.options) && q.options.map((opt: string, optIdx: number) => {
                    const isCorrect = optIdx === q.correctAnswer;
                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                          isCorrect
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                            : 'bg-black/20 border-white/5 text-gray-300'
                        }`}
                      >
                        <span className="font-mono text-[10px] opacity-60">[{String.fromCharCode(65 + optIdx)}]</span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.explanation && (
                <div className="text-[11px] text-gray-400 italic bg-black/30 p-2.5 rounded-xl border border-white/5">
                  Explanation: {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
