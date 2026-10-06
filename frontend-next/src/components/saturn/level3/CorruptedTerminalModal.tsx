"use client";

import React, { useEffect } from 'react';
import { X, Terminal, AlertTriangle, Cpu, Zap } from 'lucide-react';

interface CorruptedTerminalModalProps {
  id: 1 | 2 | 3;
  onClose: () => void;
}

const TERMINAL_CLUES: Record<
  1 | 2 | 3,
  {
    title: string;
    subtitle: string;
    icon: typeof Terminal;
    badge: string;
    rawLog: string;
  }
> = {
  1: {
    title: "Terminal 1: Sensors Task",
    subtitle: "PERIMETER SCANNER",
    icon: Cpu,
    badge: "2 CORES (50% RAM)",
    rawLog: "The perimeter sensors require 2 energy cores (50% RAM pressure) to run.",
  },
  2: {
    title: "Terminal 2: Debris Task",
    subtitle: "ASTEROID PULVERIZER",
    icon: AlertTriangle,
    badge: "3 CORES (75% THRESHOLD)",
    rawLog: "The asteroid pulverizer requires 3 cores (75% RAM pressure). Exceeding 75% without returning cores causes a critical memory leak!",
  },
  3: {
    title: "Terminal 3: Shields Task",
    subtitle: "DEFLECTOR SHIELDS",
    icon: Zap,
    badge: "2 CORES (50% RAM)",
    rawLog: "The deflector shield requires 2 energy cores (50% RAM pressure). Any leaked memory from previous tasks will cause a critical overflow!",
  },
};

export default function CorruptedTerminalModal({ id, onClose }: CorruptedTerminalModalProps) {
  const clue = TERMINAL_CLUES[id];
  const IconComponent = clue.icon;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      id="corrupted_terminal_backdrop"
      onClick={onClose}
      className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        id="corrupted_terminal_dialog"
        className="w-full max-w-md bg-[#0a0f1d] border border-amber-500/50 rounded-2xl p-5 shadow-[0_0_35px_rgba(245,158,11,0.2)] relative text-white flex flex-col gap-3.5 animate-in zoom-in-95 duration-200 cursor-default overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <IconComponent size={18} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                {clue.subtitle}
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {clue.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Clue Message Box */}
        <div className="bg-black/60 border border-amber-500/30 rounded-xl p-3.5 shadow-inner">
          <div className="flex items-center justify-between text-[10px] text-amber-400/90 uppercase tracking-wider border-b border-amber-500/20 pb-1.5 mb-2 font-mono">
            <span>Terminal Message</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[9px]">
              {clue.badge}
            </span>
          </div>
          <p className="text-xs text-amber-100 font-mono font-medium leading-relaxed">
            &quot;{clue.rawLog}&quot;
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[11px] text-gray-400 font-mono">
            Clue {id} of 3
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-sans font-bold text-xs uppercase rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
