import React, { useState } from 'react';
import { ProjectBlueprint } from '@/lib/sandbox/projects/types';

export type ProjectProgress = {
  unlockedSteps: number;
  totalSteps: number;
  score: number | null;
};

interface ProjectPickerProps {
  projects: ProjectBlueprint[];
  onSelect: (project: ProjectBlueprint) => void;
  progressMap: Record<string, ProjectProgress>;
}

export default function ProjectPicker({ projects, onSelect, progressMap }: ProjectPickerProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'web' | 'python'>('all');

  const filteredProjects = projects.filter(p => activeTab === 'all' || p.track === activeTab);
  
  const hasWeb = projects.some(p => p.track === 'web');
  const hasPython = projects.some(p => p.track === 'python');

  return (
    <div className="flex-1 overflow-y-auto bg-[#0d0418] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <h1 className="text-3xl font-bold text-white">Guided Projects</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('all')}
              className={`text-sm font-semibold transition-colors ${activeTab === 'all' ? 'text-orange-400' : 'text-gray-400 hover:text-gray-300'}`}
            >
              All
            </button>
            {hasWeb && (
              <button 
                onClick={() => setActiveTab('web')}
                className={`text-sm font-semibold transition-colors ${activeTab === 'web' ? 'text-orange-400' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Web
              </button>
            )}
            {hasPython && (
              <button 
                onClick={() => setActiveTab('python')}
                className={`text-sm font-semibold transition-colors ${activeTab === 'python' ? 'text-orange-400' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Python
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(p => {
            const progress = progressMap[p.id];
            const isCompleted = progress?.score !== null && progress?.score !== undefined;
            const isStarted = progress && progress.unlockedSteps > 0 && !isCompleted;
            const progressPercent = progress ? Math.round((progress.unlockedSteps / p.steps.length) * 100) : 0;
            
            return (
              <div
                key={p.id}
                className="flex flex-col bg-[#150524] border border-white/10 rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10"
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                      {p.track === 'web' ? 'HTML/CSS/JS' : p.track === 'python' ? 'Python' : 'JavaScript'}
                    </div>
                    {p.difficulty && (
                      <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-gray-300 uppercase">
                        {p.difficulty}
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-2">{p.title}</h2>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                    {p.description || 'Step-by-step guided project with automated checks.'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.planets && p.planets.length > 0 && (
                      <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded">
                        {p.planets.join(' · ')}
                      </span>
                    )}
                    {p.concepts?.slice(0, 2).map(c => (
                      <span key={c} className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                        {c}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (isCompleted && !window.confirm("Play again? Your previous code and progress will be reset.")) {
                        return;
                      }
                      onSelect(p);
                    }}
                    className="w-full py-2 rounded bg-white/5 hover:bg-orange-500 hover:text-white text-gray-300 text-sm font-semibold transition-colors mt-auto"
                  >
                    {isCompleted ? 'Play again' : isStarted ? 'Continue' : 'Start'}
                  </button>
                </div>
                
                {(isStarted || isCompleted) && (
                  <div className="bg-white/5 px-4 py-2 border-t border-white/10">
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
                      {isCompleted ? <span>Completed · score {progress.score}</span> : <span>{progress.unlockedSteps} / {p.steps.length} steps</span>}
                    </div>
                    <div className="h-1.5 bg-black/50 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full bg-orange-500 transition-all" style={{ width: `${isCompleted ? 100 : progressPercent}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
