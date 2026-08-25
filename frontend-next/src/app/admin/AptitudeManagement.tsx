"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Plus, Trash2, CheckCircle2, XCircle, RefreshCw, Layers, Edit3, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import {
  getAdminAptitudeQuestions,
  generateAptitudeQuestionsAI,
  toggleAptitudeQuestionStatus,
  deleteAptitudeQuestion,
  createManualAptitudeQuestion,
  updateAptitudeQuestion,
} from './actions/aptitudeAdmin';

export default function AptitudeManagement() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [categoryFocus, setCategoryFocus] = useState("MIXED");
  const [generateCount, setGenerateCount] = useState(5);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Deletion Confirmation Modal state (No browser confirm)
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Custom AI System Prompt State
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(`Act as an expert computer science and cognitive assessment author.
Generate 5 distinct Aptitude Assessment diagnostic questions for software engineering candidates.
Target category focus: "MIXED" (Allowed categories: LOGIC, PATTERN, CODING_READINESS).
Supported question types: "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER".

STRICT REQUIREMENT: Respond ONLY with a valid raw JSON object conforming EXACTLY to this schema:
{
  "questions": [
    {
      "question": "Clear diagnostic question text",
      "questionType": "MULTIPLE_CHOICE",
      "category": "LOGIC",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "shortAnswer": "",
      "explanation": "Brief explanation"
    },
    {
      "question": "An algorithm with O(1) time complexity runs in constant time.",
      "questionType": "TRUE_FALSE",
      "category": "LOGIC",
      "options": ["True", "False"],
      "correctAnswer": 0,
      "explanation": "O(1) denotes constant time performance."
    },
    {
      "question": "What keyword is used in JavaScript to declare an immutable constant variable?",
      "questionType": "SHORT_ANSWER",
      "category": "CODING_READINESS",
      "options": [],
      "correctAnswer": 0,
      "shortAnswer": "const",
      "explanation": "const declares block-scoped immutable references."
    }
  ]
}`);

  // Manual Creation / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = Create, string = Edit
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER">("MULTIPLE_CHOICE");
  const [questionCategory, setQuestionCategory] = useState<"LOGIC" | "PATTERN" | "CODING_READINESS">("LOGIC");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [shortAnswer, setShortAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

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

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const res = await generateAptitudeQuestionsAI(customPrompt, categoryFocus, generateCount);
      showNotification(`Successfully generated ${res.count} AI Aptitude questions!`);
      await loadQuestions();
    } catch (err: any) {
      console.error(err);
      showNotification("Failed to generate AI questions");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleAptitudeQuestionStatus(id, !currentStatus);
      setQuestions(prev => prev.map(q => q.id === id ? { ...q, isActive: !currentStatus } : q));
      showNotification(`Question ${!currentStatus ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteAction = async () => {
    if (!deletingId) return;
    try {
      await deleteAptitudeQuestion(deletingId);
      setQuestions(prev => prev.filter(q => q.id !== deletingId));
      showNotification("Question deleted successfully.");
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete question.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setQuestionText("");
    setQuestionType("MULTIPLE_CHOICE");
    setQuestionCategory("LOGIC");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setShortAnswer("");
    setExplanation("");
    setShowModal(true);
  };

  const handleOpenEdit = (q: any) => {
    setEditingId(q.id);
    setQuestionText(q.question);
    setQuestionType(q.questionType || "MULTIPLE_CHOICE");
    setQuestionCategory(q.category || "LOGIC");
    setOptions(Array.isArray(q.options) && q.options.length >= 4 ? q.options : [q.options?.[0] || "", q.options?.[1] || "", q.options?.[2] || "", q.options?.[3] || ""]);
    setCorrectAnswer(q.correctAnswer ?? 0);
    setShortAnswer(q.shortAnswer || "");
    setExplanation(q.explanation || "");
    setShowModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      showNotification("Please fill in the question text.");
      return;
    }
    if (questionType === "MULTIPLE_CHOICE" && options.some(o => !o.trim())) {
      showNotification("Please fill in all 4 choices.");
      return;
    }
    if (questionType === "SHORT_ANSWER" && !shortAnswer.trim()) {
      showNotification("Please specify the correct short answer / identification keyword.");
      return;
    }

    try {
      if (editingId) {
        // Update existing question
        await updateAptitudeQuestion({
          id: editingId,
          question: questionText,
          questionType: questionType,
          category: questionCategory,
          options: questionType === "MULTIPLE_CHOICE" ? options : questionType === "TRUE_FALSE" ? ["True", "False"] : [],
          correctAnswer: correctAnswer,
          shortAnswer: shortAnswer,
          explanation: explanation,
        });
        showNotification("Question updated successfully!");
      } else {
        // Create new question
        await createManualAptitudeQuestion({
          question: questionText,
          questionType: questionType,
          category: questionCategory,
          options: questionType === "MULTIPLE_CHOICE" ? options : questionType === "TRUE_FALSE" ? ["True", "False"] : [],
          correctAnswer: correctAnswer,
          shortAnswer: shortAnswer,
          explanation: explanation,
        });
        showNotification("Question created successfully!");
      }

      setShowModal(false);
      await loadQuestions();
    } catch (err) {
      console.error(err);
      showNotification("Failed to save question.");
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[120] bg-[#ff912d] text-black font-black px-6 py-3 rounded-2xl shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header Banner & AI Generator Control Card */}
      <div className="bg-[#1e0a2d] border border-[#ff912d]/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <Brain className="text-[#ff912d]" size={24} />
              <h2 className="text-xl sm:text-2xl font-black font-display text-white uppercase tracking-wider">
                A.I. Quiz Generation Engine
              </h2>
            </div>
          </div>

          {/* AI Generation Inputs & Trigger */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <select
              value={categoryFocus}
              onChange={(e) => setCategoryFocus(e.target.value)}
              className="bg-black/40 border border-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl outline-none focus:border-[#ff912d]"
            >
              <option value="MIXED" className="bg-[#1e0a2d]">Category: Mixed</option>
              <option value="LOGIC" className="bg-[#1e0a2d]">Category: Logic</option>
              <option value="PATTERN" className="bg-[#1e0a2d]">Category: Pattern</option>
              <option value="CODING_READINESS" className="bg-[#1e0a2d]">Category: Coding Readiness</option>
            </select>

            <select
              value={generateCount}
              onChange={(e) => setGenerateCount(Number(e.target.value))}
              className="bg-black/40 border border-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl outline-none focus:border-[#ff912d]"
            >
              <option value={3} className="bg-[#1e0a2d]">3 Questions</option>
              <option value={5} className="bg-[#1e0a2d]">5 Questions</option>
              <option value={10} className="bg-[#1e0a2d]">10 Questions</option>
            </select>

            <button
              onClick={handleGenerateAI}
              disabled={generating}
              className="px-6 py-2.5 bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Generating AI Quiz...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generate AI Questions
                </>
              )}
            </button>
          </div>
        </div>

        {/* Intuitive AI System Prompt Editor Section */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowPromptEditor(!showPromptEditor)}
              className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff912d] hover:underline cursor-pointer"
            >
              <Edit3 size={14} />
              <span>{showPromptEditor ? "Hide Prompt Configuration" : "Configure AI Prompt Instructions & Rules"}</span>
              {showPromptEditor ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showPromptEditor && (
              <span className="text-[11px] font-mono text-gray-400 hidden sm:inline">
                {customPrompt.length} chars
              </span>
            )}
          </div>

          {showPromptEditor && (
            <div className="mt-4 space-y-4 bg-black/30 border border-white/10 p-4 sm:p-5 rounded-2xl">
              
              {/* Presets Control Bar */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-gray-300 font-bold uppercase tracking-wider block">
                  Quick System Prompt Presets:
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setCustomPrompt(`Act as an expert computer science and cognitive assessment author.
Generate 5 distinct Aptitude Assessment diagnostic questions for software engineering candidates.
Target category focus: "${categoryFocus}".
Supported question types: "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER".

STRICT REQUIREMENT: Respond ONLY with a valid raw JSON object conforming EXACTLY to this schema:
{
  "questions": [
    {
      "question": "Clear diagnostic question text",
      "questionType": "MULTIPLE_CHOICE",
      "category": "LOGIC",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "shortAnswer": "",
      "explanation": "Brief explanation"
    }
  ]
}`);
                      showNotification("Loaded Standard Assessment Prompt Preset!");
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Standard Assessment
                  </button>

                  <button
                    onClick={() => {
                      setCustomPrompt(`Act as a Senior Systems Architect and Algorithmic Thinking Evaluator.
Generate high-caliber technical diagnostic questions testing Big-O time complexity, data structures, recursion, and task decomposition.
Target category focus: "${categoryFocus}".
Supported question types: "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER".

STRICT REQUIREMENT: Respond ONLY with a valid raw JSON object conforming EXACTLY to the standard questions schema.`);
                      showNotification("Loaded Strict Technical Prompt Preset!");
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Strict Technical
                  </button>

                  <button
                    onClick={() => {
                      setCustomPrompt(`Act as an encouraging CS educator.
Generate beginner-friendly algorithmic thinking and logic puzzles suitable for candidates with zero prior coding experience.
Target category focus: "${categoryFocus}".
Supported question types: "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER".

STRICT REQUIREMENT: Respond ONLY with a valid raw JSON object conforming EXACTLY to the standard questions schema.`);
                      showNotification("Loaded Beginner Friendly Prompt Preset!");
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Beginner Friendly
                  </button>
                </div>
              </div>

              {/* Textarea Editor */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 font-bold">
                  <span>Custom Gemini Prompt Instructions:</span>
                  <span className="text-[#ff912d]">Active Focus: {categoryFocus}</span>
                </div>
                <textarea
                  rows={8}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 text-emerald-400 font-mono text-xs p-4 rounded-2xl resize-y outline-none focus:border-[#ff912d] shadow-inner leading-relaxed"
                />
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono text-gray-400">
                  Tip: Changes are automatically included in your next AI Question Generation.
                </span>
                <button
                  onClick={() => showNotification("AI System Prompt configuration saved!")}
                  className="px-4 py-2 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Control Bar: Title & Manual Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Layers size={18} className="text-[#ff912d]" />
          <span>Active Question Bank ({questions.length})</span>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus size={14} /> Add Question
        </button>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 font-mono text-xs">
          Loading diagnostic questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-[#1e0a2d] border border-white/10 rounded-2xl p-8 text-center text-gray-400 text-sm">
          No questions generated yet. Click "Generate AI Questions" above to populate questions.
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
                  {!q.isActive && (
                    <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Edit Question Button */}
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer"
                    title="Edit Question"
                  >
                    <Edit3 size={16} />
                  </button>
                  {/* Toggle Active Status */}
                  <button
                    onClick={() => handleToggle(q.id, q.isActive)}
                    className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                      q.isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-gray-500/10 border-gray-500/30 text-gray-400 hover:bg-gray-500/20'
                    }`}
                    title="Toggle Active Status"
                  >
                    {q.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  </button>
                  {/* Delete Question (Opens Custom UI Modal) */}
                  <button
                    onClick={() => setDeletingId(q.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 size={16} />
                  </button>
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
                  {q.options.map((opt: string, optIdx: number) => {
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

      {/* Custom UI Modal: Create / Edit Diagnostic Question */}
      {showModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleSaveQuestion} 
            className="bg-[#1e0a2d] border border-[#ff912d]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl relative z-10"
          >
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 font-display uppercase tracking-wider">
              {editingId ? "Edit Diagnostic Question" : "Add Diagnostic Question"}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 font-bold">Category</label>
                <select
                  value={questionCategory}
                  onChange={(e: any) => setQuestionCategory(e.target.value)}
                  className="w-full mt-1 bg-black/40 border border-white/20 text-white text-xs p-2.5 rounded-xl outline-none"
                >
                  <option value="LOGIC" className="bg-[#1e0a2d]">LOGIC</option>
                  <option value="PATTERN" className="bg-[#1e0a2d]">PATTERN</option>
                  <option value="CODING_READINESS" className="bg-[#1e0a2d]">CODING_READINESS</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-bold">Question Type</label>
                <select
                  value={questionType}
                  onChange={(e: any) => setQuestionType(e.target.value)}
                  className="w-full mt-1 bg-black/40 border border-white/20 text-white text-xs p-2.5 rounded-xl outline-none"
                >
                  <option value="MULTIPLE_CHOICE" className="bg-[#1e0a2d]">Multiple Choice</option>
                  <option value="TRUE_FALSE" className="bg-[#1e0a2d]">True / False</option>
                  <option value="SHORT_ANSWER" className="bg-[#1e0a2d]">Short Answer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold">Question Text</label>
              <textarea
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full mt-1 bg-black/40 border border-white/20 text-white text-xs p-2.5 rounded-xl resize-none outline-none focus:border-[#ff912d]"
                placeholder="Enter diagnostic question..."
              />
            </div>

            {/* Multiple Choice Options Input */}
            {questionType === "MULTIPLE_CHOICE" && (
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-bold">Options (4 choices - select correct radio)</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswerOption"
                      checked={correctAnswer === i}
                      onChange={() => setCorrectAnswer(i)}
                      className="accent-[#ff912d] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }}
                      className="flex-1 bg-black/40 border border-white/20 text-white text-xs p-2 rounded-xl"
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* True / False Select */}
            {questionType === "TRUE_FALSE" && (
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-bold">Correct Answer</label>
                <div className="flex items-center gap-6 bg-black/30 p-3 rounded-xl border border-white/10">
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                    <input
                      type="radio"
                      name="tfOption"
                      checked={correctAnswer === 0}
                      onChange={() => setCorrectAnswer(0)}
                      className="accent-[#ff912d]"
                    />
                    True
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                    <input
                      type="radio"
                      name="tfOption"
                      checked={correctAnswer === 1}
                      onChange={() => setCorrectAnswer(1)}
                      className="accent-[#ff912d]"
                    />
                    False
                  </label>
                </div>
              </div>
            )}

            {/* Short Answer Input */}
            {questionType === "SHORT_ANSWER" && (
              <div>
                <label className="text-xs text-gray-400 font-bold">Correct Short Answer / Keyword</label>
                <input
                  type="text"
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  className="w-full mt-1 bg-black/40 border border-white/20 text-white text-xs p-2.5 rounded-xl font-mono text-emerald-400"
                  placeholder="e.g. const, let, function, O(1)..."
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 font-bold">Explanation (Optional)</label>
              <input
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full mt-1 bg-black/40 border border-white/20 text-white text-xs p-2.5 rounded-xl"
                placeholder="Brief explanation..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
              >
                {editingId ? "Update Question" : "Save Question"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom UI Confirmation Modal: Delete Question (Replaces browser confirm) */}
      {deletingId && (
        <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e0a2d] border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-center relative z-10 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <AlertTriangle size={24} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white font-display uppercase tracking-wider">
                Delete Diagnostic Question
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-all"
              >
                Delete Question
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
