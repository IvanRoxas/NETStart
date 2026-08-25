"use client";

import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, CheckCircle2, Award, RefreshCw, Cpu, Activity, Sparkles, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAptitudeQuestions, submitAptitudeTest } from '../actions/aptitudeClient';

interface AptitudeTestClientProps {
  initialUser: any;
}

export default function AptitudeTestClient({ initialUser }: AptitudeTestClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldOpenModal = searchParams ? searchParams.get('openModal') === 'true' : false;
  
  // View states: 'BRIEFING' | 'QUIZ' | 'COMPLETED'
  const [viewState, setViewState] = useState<'BRIEFING' | 'QUIZ' | 'COMPLETED'>(
    initialUser?.hasTakenAptitudeTest 
      ? 'COMPLETED' 
      : shouldOpenModal 
      ? 'BRIEFING' 
      : 'QUIZ'
  );

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number | string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any>(
    initialUser?.hasTakenAptitudeTest
      ? {
          logicScore: initialUser.logicScore ?? 85,
          patternRecognitionScore: initialUser.patternRecognitionScore ?? 90,
          recommendedLearningPath: initialUser.recommendedLearningPath ?? "Fullstack Systems Engineering",
        }
      : null
  );

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
      const qList = await getAptitudeQuestions();
      setQuestions(qList);
    } catch (err) {
      console.error("Failed to load diagnostic questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    setSubmitting(true);
    try {
      const formattedPayload: Record<string, number | string> = {};
      questions.forEach((q, idx) => {
        formattedPayload[q.id] = selectedAnswers[idx] ?? 0;
      });

      const res = await submitAptitudeTest(formattedPayload);
      setResults(res);
      setViewState('COMPLETED');
    } catch (err) {
      console.error("Failed to submit diagnostic assessment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading Terminal State
  if (loading && viewState !== 'COMPLETED') {
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
            Fetching active algorithmic diagnostic questions...
          </p>
        </div>
      </div>
    );
  }

  // State 1: System Diagnostic Briefing Intro (Custom UI Modal Popup)
  if (viewState === 'BRIEFING') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
        
        {/* Glowing Custom Modal Outer Box */}
        <div className="w-full max-w-4xl bg-[#1a082c] border-2 border-[#ff912d]/70 shadow-[0_0_45px_rgba(255,145,45,0.4),0_0_80px_rgba(147,51,234,0.3)] rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          
          {/* Close Button to exit module */}
          <button
            onClick={() => router.push('/dashboard')}
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/5 border border-white/15 text-gray-400 hover:text-black hover:bg-[#ff912d] hover:border-[#ff912d] hover:scale-110 hover:rotate-90 shadow-md hover:shadow-[0_0_15px_rgba(255,145,45,0.6)] transition-all duration-200 cursor-pointer z-30 flex items-center justify-center"
            title="Close Module"
          >
            <X size={15} />
          </button>

          {/* Ambient Background Glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#ff912d]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Left Side: Information & Action Controls */}
          <div className="w-full md:w-7/12 space-y-5 text-left relative z-10">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#ff912d]/10 border border-[#ff912d]/40 text-[#ff912d] font-mono text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} /> Aptitude Test
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-wider leading-tight">
                Test Your Knowledge!
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans pr-4">
                Evaluates core algorithmic logic and pattern recognition skills. Let our engine find your path for you!
              </p>
            </div>

            {/* Quick Telemetry Chips */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 font-bold">
                {questions.length || 5} Questions
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 font-bold">
                ~3 Minutes
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-[#ff912d]/15 border border-[#ff912d]/30 text-xs font-mono text-[#ff912d] font-bold">
                +150 XP & +50 Gears
              </span>
            </div>

            {/* Action CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => setViewState('QUIZ')}
                className="w-full sm:w-auto px-9 py-3.5 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(255,145,45,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                Start Assessment <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Side: Glowing Square Graphic Box (No Telemetry Text) */}
          <div className="w-full md:w-5/12 aspect-square max-w-[260px] sm:max-w-[280px] bg-gradient-to-br from-[#160528] via-[#260847] to-[#0f0320] border-2 border-[#ff912d]/50 shadow-[0_0_25px_rgba(255,145,45,0.3)] rounded-2xl p-6 relative flex flex-col justify-center items-center overflow-hidden shrink-0 z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff912d]/15 via-purple-600/10 to-transparent opacity-60" />
            
            {/* SVG Glowing Orbit Graphic */}
            <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-dashed border-[#ff912d]/50 animate-spin" style={{ animationDuration: '22s' }} />
              <div className="absolute inset-2 rounded-full border border-purple-500/40 animate-spin" style={{ animationDuration: '14s', animationDirection: 'reverse' }} />
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#ff912d]/20 border-2 border-[#ff912d] flex items-center justify-center text-[#ff912d] shadow-[0_0_35px_rgba(255,145,45,0.5)] transition-transform duration-300 hover:scale-105">
                <Brain size={44} />
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // State 2: Active Assessment Runner
  if (viewState === 'QUIZ' && questions.length > 0) {
    const currentQ = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const isAnswered = selectedAnswers[currentIndex] !== undefined && String(selectedAnswers[currentIndex]).trim().length > 0;
    const optionCount = currentQ.options?.length || 0;

    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        
        {/* Terminal Header Telemetry Bar */}
        <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono font-bold text-[#ff912d] bg-[#ff912d]/10 px-4 py-2 rounded-xl border border-[#ff912d]/30 uppercase tracking-widest flex items-center gap-2">
                <Cpu size={16} /> {currentQ.category}
              </span>
              <span className="text-sm sm:text-base font-mono text-gray-300 font-bold">
                QUESTION {currentIndex + 1} OF {questions.length}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm sm:text-base font-mono font-bold text-gray-200">
              <Activity size={16} className="text-[#ff912d]" />
              <span>PROGRESS: {Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
            </div>
          </div>

          {/* Segmented Glowing Progress Bar */}
          <div className="flex items-center gap-2 w-full">
            {questions.map((_, i) => {
              const active = i <= currentIndex;
              const completed = i < currentIndex;
              return (
                <div
                  key={i}
                  className={`h-3 flex-1 rounded-full transition-all duration-300 ${
                    completed
                      ? 'bg-[#ff912d]'
                      : active
                      ? 'bg-[#ff912d]/80 animate-pulse'
                      : 'bg-black/40 border border-white/10'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Diagnostic Problem Console Card */}
        <div className="bg-[#1e0a2d] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          
          <div className="space-y-3 border-b border-white/10 pb-6">
            <div className="text-sm font-mono text-[#ff912d] font-bold uppercase tracking-widest flex items-center gap-2">
              <span>DIAGNOSTIC PROBLEM #{currentIndex + 1}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">{currentQ.questionType.replace('_', ' ')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-relaxed font-display">
              {currentQ.question}
            </h2>
          </div>

          {/* Cyber Telemetry Choice Grid (Scales up to 8 choices) */}
          {currentQ.questionType === "SHORT_ANSWER" ? (
            <div className="space-y-3 max-w-2xl">
              <label className="text-sm font-mono text-gray-300 uppercase tracking-wider block font-bold">
                Type Short Answer / Keyword:
              </label>
              <input
                type="text"
                value={selectedAnswers[currentIndex] !== undefined ? String(selectedAnswers[currentIndex]) : ""}
                onChange={(e) => {
                  setSelectedAnswers(prev => ({
                    ...prev,
                    [currentIndex]: e.target.value
                  }));
                }}
                placeholder="Type your answer here..."
                className="w-full p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/20 text-white font-mono text-lg outline-none focus:border-[#ff912d] transition-all shadow-inner"
              />
            </div>
          ) : (
            <div className={`grid gap-4 sm:gap-6 ${
              optionCount <= 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : optionCount <= 4
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}>
              {currentQ.options.map((opt: string, optIdx: number) => {
                const isSelected = selectedAnswers[currentIndex] === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-6 sm:p-7 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col justify-between gap-5 cursor-pointer min-h-[130px] relative group/card ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#ff912d]/20 via-[#2f1053] to-[#ff912d]/10 border-[#ff912d] text-white shadow-[0_0_30px_rgba(255,145,45,0.4)] scale-[1.01]'
                        : 'bg-[#1c0b32]/90 border-white/10 hover:border-[#ff912d]/60 hover:bg-[#280e4b] text-gray-100 active:scale-95'
                    }`}
                  >
                    {/* Choice Header Badge */}
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-sm font-mono font-bold px-3 py-1 rounded-lg border ${
                        isSelected
                          ? 'bg-[#ff912d] text-black border-[#ff912d]'
                          : 'bg-white/5 border-white/15 text-gray-300 group-hover/card:text-[#ff912d]'
                      }`}>
                        OPTION {String.fromCharCode(65 + optIdx)}
                      </span>

                      {isSelected && (
                        <div className="flex items-center gap-1.5 bg-[#ff912d]/20 border border-[#ff912d] px-2.5 py-1 rounded-full text-[#ff912d] text-xs font-mono font-bold uppercase">
                          <CheckCircle2 size={14} /> Selected
                        </div>
                      )}
                    </div>

                    {/* Choice Option Text */}
                    <span className="text-lg sm:text-xl md:text-2xl font-bold leading-snug tracking-wide">
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Fixed Navigation Control Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <button
              onClick={handlePrevQuestion}
              disabled={currentIndex === 0}
              className="px-8 py-3.5 rounded-xl border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 disabled:opacity-30 text-sm sm:text-base font-bold transition-all cursor-pointer"
            >
              Previous
            </button>

            {isLast ? (
              <button
                onClick={handleSubmitTest}
                disabled={!isAnswered || submitting}
                className="px-10 py-4 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-sm sm:text-base uppercase tracking-widest rounded-xl shadow-lg disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin text-black" /> Submitting Diagnostics...
                  </>
                ) : (
                  <>
                    Submit Diagnostic <CheckCircle2 size={20} />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!isAnswered}
                className="px-10 py-4 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-sm sm:text-base uppercase tracking-widest rounded-xl shadow-lg disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
              >
                Next Question <ArrowRight size={20} />
              </button>
            )}
          </div>

        </div>

      </div>
    );
  }

  // State 3: Assessment Results Summary Report
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* System Status Verified Header */}
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
          <span>+150 XP & +50 Gears</span>
        </div>
      </div>

      {/* Main Results Console Card */}
      <div className="bg-[#1e0a2d] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-wider">
            Diagnostic Profile Report
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            Your system readiness and cognitive skill breakdown.
          </p>
        </div>

        {/* Score Domain Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase">
              <span>Logical Analysis</span>
              <span className="text-[#ff912d] font-bold">{results?.logicScore ?? 85}%</span>
            </div>
            <div className="text-3xl font-black font-display text-white">
              {results?.logicScore ?? 85} <span className="text-xs text-gray-400 font-normal">/ 100</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-[#ff912d] to-orange-400 rounded-full" 
                style={{ width: `${results?.logicScore ?? 85}%` }} 
              />
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase">
              <span>Pattern Recognition</span>
              <span className="text-blue-400 font-bold">{results?.patternRecognitionScore ?? 90}%</span>
            </div>
            <div className="text-3xl font-black font-display text-white">
              {results?.patternRecognitionScore ?? 90} <span className="text-xs text-gray-400 font-normal">/ 100</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full" 
                style={{ width: `${results?.patternRecognitionScore ?? 90}%` }} 
              />
            </div>
          </div>

        </div>

        {/* Recommended Orbit Learning Path */}
        <div className="bg-gradient-to-r from-[#ff912d]/10 to-purple-900/20 border border-[#ff912d]/30 rounded-2xl p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#ff912d] font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Recommended Orbit Path
          </div>
          <div className="text-lg font-bold text-white">
            {results?.recommendedLearningPath ?? "Fullstack Systems & Distributed Architecture"}
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Based on your high analytical scores, all mission sectors and learning paths have been unlocked.
          </p>
        </div>

        {/* Action Buttons: Retake Assessment & Enter Dashboard */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setViewState('QUIZ');
              loadDiagnosticQuestions();
            }}
            className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} /> Retake Assessment
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-8 py-4 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            Enter Dashboard <ArrowRight size={18} />
          </button>
        </div>

      </div>

    </div>
  );
}
