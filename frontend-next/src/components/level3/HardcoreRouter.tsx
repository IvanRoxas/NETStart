"use client";

import React from 'react';
import { useLevelThreeState } from '@/context/LevelThreeContext';
import { OPTION_A_HARD_NAV, OPTION_B_HARD_SORT, OPTION_C_HARD_LOGIC } from '@/lib/level3/matrices';

export interface HardcoreRouterProps {
  onLoadModule: (moduleConfig: any) => void;
  onAllCompleted: () => void;
}

export default function HardcoreRouter({ onLoadModule, onAllCompleted }: HardcoreRouterProps) {
  const { activeSection, missionQueue, isLevelComplete } = useLevelThreeState();

  React.useEffect(() => {
    if (activeSection < 4) return;

    if (missionQueue.length === 0) {
      onAllCompleted();
      return;
    }

    const currentModule = missionQueue[0];
    if (currentModule === 'hard_nav') {
      onLoadModule(OPTION_A_HARD_NAV);
    } else if (currentModule === 'hard_sort') {
      onLoadModule(OPTION_B_HARD_SORT);
    } else if (currentModule === 'hard_logic') {
      onLoadModule(OPTION_C_HARD_LOGIC);
    }
  }, [activeSection, missionQueue, onLoadModule, onAllCompleted]);

  if (activeSection < 4) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="text-purple-400 font-bold uppercase tracking-wider">Active Challenge:</span>
        <span className="text-white font-black bg-purple-950/60 border border-purple-800 px-2.5 py-0.5 rounded">
          {missionQueue[0] ? missionQueue[0].toUpperCase().replace('_', ' ') : 'ALL CHALLENGES COMPLETED'}
        </span>
      </div>
      <div className="text-slate-400">
        Remaining Challenges: <span className="text-cyan-400 font-bold">{missionQueue.length}</span>
      </div>
    </div>
  );
}
