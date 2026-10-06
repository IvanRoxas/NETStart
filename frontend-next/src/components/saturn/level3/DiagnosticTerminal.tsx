"use client";

import React from 'react';
import { Terminal, Zap, CheckCircle2 } from 'lucide-react';

interface DiagnosticTerminalProps {
  id: 1 | 2 | 3;
  label: string;
  isRead: boolean;
  isCompleted?: boolean;
  xPercent: number;
  yPercent: number;
  onClick: (id: 1 | 2 | 3) => void;
}

export default function DiagnosticTerminal({
  id,
  label,
  isRead,
  isCompleted = false,
  xPercent,
  yPercent,
  onClick,
}: DiagnosticTerminalProps) {
  const outerPolygon = 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)';
  const innerPolygon = 'polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)';

  return (
    <div
      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
    >
      <button
        type="button"
        onClick={() => onClick(id)}
        className="group relative flex flex-col items-center cursor-pointer transition-all duration-300 focus:outline-none select-none hover:scale-105 active:scale-95 font-mono"
      >
        {/* Sparking Aura effect when unread and not completed */}
        {!isRead && !isCompleted && (
          <>
            <div className="absolute inset-0 bg-amber-500/25 blur-md animate-pulse pointer-events-none" />
            <div className="absolute -top-3 -right-2 text-amber-300 animate-bounce pointer-events-none">
              <Zap size={14} className="fill-amber-400" />
            </div>
          </>
        )}

        {/* Chamfered Sci-Fi Wireframe Terminal Housing */}
        <div
          style={{
            clipPath: outerPolygon,
            backgroundColor: isCompleted
              ? '#10b981'
              : isRead
              ? 'rgba(6, 182, 212, 0.85)'
              : 'rgba(245, 158, 11, 0.9)',
            filter: isCompleted
              ? 'drop-shadow(0 0 16px rgba(16, 185, 129, 0.9))'
              : isRead
              ? 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.35))'
              : 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.5))',
            padding: '1.5px',
          }}
          className="relative transition-all"
        >
          <div
            style={{
              clipPath: innerPolygon,
              backgroundColor: isCompleted ? '#032014' : isRead ? '#07121d' : '#140e04',
            }}
            className="px-3 py-1.5 flex items-center gap-2 backdrop-blur-md"
          >
            {isCompleted ? (
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0 fill-emerald-500/30 shadow-[0_0_8px_#10b981]" />
            ) : isRead ? (
              <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
            ) : (
              <Terminal size={13} className="text-amber-400 shrink-0 animate-pulse" />
            )}

            <div className="flex flex-col text-left">
              <span className={`text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${isCompleted ? 'text-emerald-200' : 'text-white'}`}>
                Terminal {id}
              </span>
              <span className={`text-[8px] uppercase tracking-widest whitespace-nowrap font-extrabold ${isCompleted ? 'text-emerald-400' : 'text-gray-300'}`}>
                {label}
              </span>
            </div>

            {!isRead && !isCompleted && (
              <span className="w-1.5 h-1.5 bg-amber-400 animate-ping ml-0.5 shrink-0" />
            )}
          </div>
        </div>

        {/* Floor Mounting Wireframe Pedestal */}
        <div
          style={{
            clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 100%, 0 100%)',
            backgroundColor: isCompleted
              ? '#10b981'
              : isRead
              ? 'rgba(6, 182, 212, 0.4)'
              : 'rgba(245, 158, 11, 0.5)',
          }}
          className="w-14 h-1 mt-1 transition-colors"
        />
      </button>
    </div>
  );
}
