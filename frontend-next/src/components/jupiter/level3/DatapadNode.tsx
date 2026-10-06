"use client";

import React from 'react';
import { Tablet, CheckCircle2, Sparkles } from 'lucide-react';

interface DatapadNodeProps {
  id: 1 | 2 | 3 | 4;
  label: string;
  isSatisfied: boolean;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  onClick: (id: 1 | 2 | 3 | 4) => void;
}

export default function DatapadNode({
  id,
  label,
  isSatisfied,
  xPercent,
  yPercent,
  onClick,
}: DatapadNodeProps) {
  return (
    <div
      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
    >
      <button
        type="button"
        onClick={() => onClick(id)}
        className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 focus:outline-none select-none ${
          isSatisfied ? 'opacity-90 hover:opacity-100 hover:scale-105' : 'hover:scale-110 active:scale-95'
        }`}
      >
        {/* Pulsing Aura if unsatisfied */}
        {!isSatisfied && (
          <div className="absolute inset-0 rounded-2xl bg-[#ff912d]/30 blur-md animate-pulse pointer-events-none" />
        )}

        {/* Compact Datapad Body */}
        <div
          className={`relative px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md ${
            isSatisfied
              ? 'bg-[#0a1610]/90 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : 'bg-[#140e1f]/90 border-[#ff912d] text-[#ff912d] shadow-[0_0_15px_rgba(255,145,45,0.4)] ring-1 ring-[#ff912d]/50 animate-pulse'
          }`}
        >
          {isSatisfied ? (
            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
          ) : (
            <Tablet size={13} className="text-[#ff912d] shrink-0" />
          )}

          <span className="text-[11px] font-mono font-bold tracking-wide whitespace-nowrap">
            Datapad {id}
          </span>

          {!isSatisfied && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff912d] animate-ping ml-0.5 shrink-0" />
          )}
        </div>

        {/* Floor shadow pedestal */}
        <div
          className={`w-12 h-2 rounded-full mt-1 blur-xs transition-colors ${
            isSatisfied ? 'bg-emerald-500/20' : 'bg-[#ff912d]/30'
          }`}
        />
      </button>
    </div>
  );
}
