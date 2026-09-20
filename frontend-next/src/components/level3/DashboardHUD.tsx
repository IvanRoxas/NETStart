"use client";

import React from 'react';
import { useLevelThreeState } from '@/context/LevelThreeContext';

export interface DashboardHUDProps {
  className?: string;
}

export default function DashboardHUD({ className = '' }: DashboardHUDProps) {
  const { engineCharge, activeSection, missionQueue, levelXP } = useLevelThreeState();

  // Clamp charge visual percentage between 0 and 100%
  const chargePercent = Math.min(100, Math.max(0, engineCharge));

  return (
    <div className={`flex justify-between items-center bg-slate-900 border-b border-slate-700 p-4 w-full select-none ${className}`}>
      {/* Left Side: Engine Charge Tracker */}
      <div className="flex items-center gap-3">
        <span className="text-xs sm:text-sm font-black font-mono tracking-wider text-slate-200">
          ENGINE CHARGE
        </span>
        <div className="w-32 sm:w-48 h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700 relative shadow-inner">
          <div
            className="h-full bg-yellow-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(250,204,21,0.6)]"
            style={{ width: `${chargePercent}%` }}
          />
        </div>
        <span className="text-xs font-mono font-bold text-yellow-400">
          {chargePercent}%
        </span>
      </div>

      {/* Right Side: Statistic Badges */}
      <div className="flex items-center gap-2.5">
        <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-300 shadow-sm">
          Section: <span className="text-white">{activeSection <= 3 ? activeSection : activeSection >= 4 ? `4 (${missionQueue[0] || 'Complete'})` : activeSection}</span>
        </div>
        <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-300 shadow-sm">
          XP: <span className="text-emerald-400 font-black">+{levelXP}</span>
        </div>
        <div className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-300 shadow-sm">
          Queued Missions: <span className="text-cyan-400 font-black">{missionQueue.length}</span>
        </div>
      </div>
    </div>
  );
}
