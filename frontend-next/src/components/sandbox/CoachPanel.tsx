import React, { useState } from 'react';
import { CheckCircle2, Circle, Lock, Play, ChevronRight, Check, ArrowLeft, RotateCcw } from 'lucide-react';
import { ProjectBlueprint, CheckResult } from '@/lib/sandbox/projects/types';
import ConfirmModal from '@/components/ConfirmModal';

interface CoachPanelProps {
  project: ProjectBlueprint;
  currentStepIndex: number;
  unlockedSteps: number;
  onStepSelect: (index: number) => void;
  onCheckWork: () => void;
  onInsertStarter: (file: string, code: string) => void;
  checkResults: CheckResult[] | null;
  checking: boolean;
  score: number | null;
  onKeepImproving: () => void;
  onExit: () => void;
  onRestart: () => void;
  hintTiers: Record<number, number>;
  onHintTiersChange: (tiers: Record<number, number>) => void;
}

export default function CoachPanel({
  project,
  currentStepIndex,
  unlockedSteps,
  onStepSelect,
  onCheckWork,
  onInsertStarter,
  checkResults,
  checking,
  score,
  onKeepImproving,
  onExit,
  onRestart,
  hintTiers,
  onHintTiersChange
}: CoachPanelProps) {
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [pendingStarter, setPendingStarter] = useState<{ file: string; code: string } | null>(null);

  const showHint = () => {
    onHintTiersChange({
      ...hintTiers,
      [currentStepIndex]: Math.min((hintTiers[currentStepIndex] || 0) + 1, project.steps[currentStepIndex].hints.length)
    });
  };

  const step = project.steps[currentStepIndex];
  const hintsShown = hintTiers[currentStepIndex] || 0;
  const progressPercent = Math.round((unlockedSteps / project.steps.length) * 100);

  if (score !== null) {
    return (
      <div className="w-full lg:w-80 flex flex-col bg-[#150524] border-r border-white/10 h-full p-6 overflow-y-auto">
        <button onClick={onExit} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All projects
        </button>
        <h2 className="text-xl font-bold text-orange-400 mb-6">Functional</h2>
        <div className="text-6xl font-bold text-white mb-8">{score}<span className="text-2xl text-gray-400">/100</span></div>
        <button
          onClick={onKeepImproving}
          className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-semibold transition-colors mb-6"
        >
          Keep improving
        </button>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Final Results</h3>
        <ul className="space-y-3">
          {checkResults?.map((res, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="mt-0.5 shrink-0">
                {res.pass ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-red-500" />}
              </span>
              <span className={res.pass ? "text-gray-300" : "text-red-400"}>
                {res.message || res.id}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 flex flex-col bg-[#150524] border-r border-white/10 h-full">
      <div className="p-4 border-b border-white/10 relative overflow-hidden">
        <button onClick={onExit} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-3 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> All projects
        </button>
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-orange-400 truncate pr-2">{project.title}</h2>
          <button 
            onClick={() => setShowRestartConfirm(true)}
            className="text-gray-500 hover:text-red-400 transition-colors"
            title="Restart project"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 h-0.5 bg-orange-500/20 w-full">
          <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-2">
          {project.steps.map((s, i) => {
            const isUnlocked = i <= unlockedSteps;
            const isCurrent = i === currentStepIndex;
            return (
              <button
                key={s.id}
                onClick={() => isUnlocked && onStepSelect(i)}
                disabled={!isUnlocked}
                className={`w-full flex items-center gap-3 p-2 rounded text-left text-sm transition-colors ${
                  isCurrent ? 'bg-orange-500/20 text-orange-400' : 
                  isUnlocked ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600'
                }`}
              >
                {isUnlocked ? (
                  isCurrent ? <Play className="w-4 h-4 shrink-0" fill="currentColor" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">Step {i + 1}</span>
              </button>
            );
          })}
        </div>

        <div>
          <h3 className="text-lg font-bold text-white mb-2">{step.goal}</h3>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">{step.instructions}</p>
          
          {step.mode === 'guided' && step.starterCode && (
            <div className="space-y-2 mb-4">
              {step.starterCode.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => setPendingStarter({ file: sc.file, code: sc.code })}
                  className="w-full text-left p-2 rounded bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors flex items-center justify-between"
                >
                  Insert starter into {sc.file}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}

          {hintsShown > 0 && (
            <div className="space-y-3 mb-4">
              {step.hints.slice(0, hintsShown).map((hint, i) => (
                <div key={i} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-200">
                  <strong className="text-blue-400">Hint {i + 1}:</strong> {hint}
                </div>
              ))}
            </div>
          )}

          {hintsShown < step.hints.length && (
            <button
              onClick={showHint}
              className="text-sm text-orange-400 hover:text-orange-300 transition-colors underline mb-4"
            >
              Show hint ({step.hints.length - hintsShown} left)
            </button>
          )}

          <button
            onClick={onCheckWork}
            disabled={checking}
            className="w-full py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {checking ? 'Checking...' : (
              <>
                <Check className="w-4 h-4" /> Check my work
              </>
            )}
          </button>
        </div>

        {checkResults && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Results</h4>
            <ul className="space-y-3">
              {checkResults.map((res, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-0.5 shrink-0">
                    {res.pass ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-red-500" />}
                  </span>
                  <span className={res.pass ? "text-gray-300" : "text-red-400"}>
                    {res.message || "Requirement met"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showRestartConfirm}
        title="Restart Project?"
        message="Your code and progress for this project will be erased. Are you sure you want to restart?"
        confirmLabel="Restart"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowRestartConfirm(false);
          onRestart();
        }}
        onCancel={() => setShowRestartConfirm(false)}
      />

      <ConfirmModal
        isOpen={pendingStarter !== null}
        title="Insert Starter Code?"
        message={pendingStarter ? `Are you sure you want to insert starter code into ${pendingStarter.file}? Any unsaved changes in this file may be overwritten.` : ''}
        confirmLabel="Insert Code"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={() => {
          if (pendingStarter) {
            onInsertStarter(pendingStarter.file, pendingStarter.code);
            setPendingStarter(null);
          }
        }}
        onCancel={() => setPendingStarter(null)}
      />
    </div>
  );
}
