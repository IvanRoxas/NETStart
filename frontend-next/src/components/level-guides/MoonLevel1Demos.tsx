"use client";

import React from 'react';
import { Play, CheckCircle2 } from 'lucide-react';

/**
 * Clean SVG Cursor Pointer (No Emojis)
 */
function CursorPointer({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="white"
      stroke="#120420"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={`drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] pointer-events-none ${className}`}
    >
      <path d="M5.5 3.5l11 7-5.5 1.5-3 5.5-2.5-14z" />
    </svg>
  );
}

/**
 * Authentic Rover SVG sprite matching NETStart's exact game rover
 */
function RoverSprite({ rotation = 90 }: { rotation?: number }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,145,45,0.9)]"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <svg viewBox="0 0 40 40" className="w-full h-full">
        {/* Main Rover Body */}
        <polygon
          points="20,9 32,16 32,30 20,37 8,30 8,16"
          fill="#ff912d"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1.5"
        />
        {/* Front Nose Arrow */}
        <polygon
          points="20,1 27,12 13,12"
          fill="#fbbf24"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="1"
        />
        <circle cx="20" cy="7.5" r="2.5" fill="white" />
        {/* Left & Right Treads */}
        <rect
          x="1"
          y="19"
          width="7"
          height="8"
          rx="1.5"
          fill="#3b82f6"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.8"
        />
        <rect
          x="32"
          y="19"
          width="7"
          height="8"
          rx="1.5"
          fill="#3b82f6"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.8"
        />
        {/* Sensor Core */}
        <circle
          cx="20"
          cy="24"
          r="5"
          fill="rgba(0,0,0,0.6)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />
        <circle cx="20" cy="24" r="2.5" fill="#38bdf8" />
      </svg>
    </div>
  );
}

/**
 * Authentic 6x6 Moon Level 1 Maze Grid (from Section 1 in BlocklyMaze.tsx)
 */
function MoonGridLevel1({
  roverPos = { x: 1, y: 1, rot: 90 },
}: {
  roverPos?: { x: number; y: number; rot: number };
}) {
  const grid = [
    [0, 0, 0, 0, 0, 0],
    [0, 3, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 4, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
  ];

  return (
    <div
      className="grid gap-[2px] p-2 bg-[#120726] rounded-xl border border-purple-500/30 shadow-inner"
      style={{
        gridTemplateColumns: 'repeat(6, 1fr)',
        gridTemplateRows: 'repeat(6, 1fr)',
        width: '160px',
        height: '160px',
      }}
    >
      {grid.map((row, y) =>
        row.map((cell, x) => {
          const isRoverHere = roverPos.x === x && roverPos.y === y;

          if (cell === 0) {
            return (
              <div
                key={`${x}-${y}`}
                className="w-full h-full border border-white/5 bg-transparent rounded-sm"
              />
            );
          }

          if (cell === 4) {
            return (
              <div
                key={`${x}-${y}`}
                className="w-full h-full bg-emerald-950/70 border border-emerald-400/80 rounded-sm flex flex-col items-center justify-center relative shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute" />
                <span className="text-[7px] font-black text-emerald-300 font-mono leading-none z-10">
                  GOAL
                </span>
                {isRoverHere && (
                  <div className="absolute inset-0 p-0.5 z-20">
                    <RoverSprite rotation={roverPos.rot} />
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              key={`${x}-${y}`}
              className="w-full h-full bg-[#2D1B4E] border border-purple-500/40 rounded-sm flex items-center justify-center relative"
            >
              {isRoverHere && (
                <div className="absolute inset-0 p-0.5 z-20">
                  <RoverSprite rotation={roverPos.rot} />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

/**
 * Common Workspace Toolbox Sidebar - completely consistent across all 3 slides
 */
function WorkspaceSidebar() {
  return (
    <div className="flex flex-col gap-1.5 w-16 shrink-0 py-1 select-none">
      <div className="text-[8.5px] font-bold uppercase text-red-400 bg-red-950/40 border-l-2 border-red-500 px-1.5 py-1 rounded-r">
        Events
      </div>
      <div className="text-[8.5px] font-bold uppercase text-amber-300 bg-amber-950/40 border-l-2 border-amber-400 px-1.5 py-1 rounded-r">
        Movement
      </div>
    </div>
  );
}

/**
 * Slide 1: Accurate gameplay-wise.
 * Tools in this level are all Move [Direction ▾].
 * Rover stays completely STILL while block is placed, and moves ONLY AFTER the block is snapped!
 */
export function MoonLevel1Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        /* Drag 2nd Move block into workspace under 1st Move block */
        @keyframes dragSecondBlock {
          0%, 15% {
            transform: translate(-62px, 30px);
            opacity: 0.7;
          }
          32%, 85% {
            transform: translate(0px, 0px);
            opacity: 1;
          }
          95%, 100% {
            transform: translate(-62px, 30px);
            opacity: 0.7;
          }
        }
        /* Vector cursor dragging the 2nd block */
        @keyframes cursorDragSecond {
          0%, 15% { transform: translate(-62px, 30px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          40%, 85% { transform: translate(15px, 15px); opacity: 0; }
          95%, 100% { transform: translate(-62px, 30px); opacity: 1; }
        }
        /* Simulation Status: READY vs RUNNING CODE */
        @keyframes simStatusReady {
          0%, 36% { opacity: 1; }
          40%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes simStatusRunning {
          0%, 36% { opacity: 0; }
          40%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        /* Snap flash on block connection */
        @keyframes snapFlashSecond {
          0%, 30% { filter: brightness(1); }
          32% { filter: brightness(1.5); outline: 2px solid #ff912d; }
          38%, 100% { filter: brightness(1); outline: none; }
        }
        /* Rover remains completely still at (0,0) while block is placed.
           It moves ONLY AFTER the block is attached (after 38%) */
        @keyframes roverMoveAfterPlace {
          0%, 38% { transform: translate(0px, 0px) rotate(90deg); }
          46%, 56% { transform: translate(25px, 0px) rotate(90deg); }
          66%, 86% { transform: translate(50px, 0px) rotate(90deg); }
          96%, 100% { transform: translate(0px, 0px) rotate(90deg); }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-5 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <WorkspaceSidebar />

          {/* Block Stack: Start + 1st Move Right (static) + 2nd Move Right (snapping) */}
          <div className="flex flex-col w-[125px] relative z-20">
            {/* Start Block */}
            <div className="h-5 bg-[#ef4444] text-white text-[9px] font-bold px-2 rounded-t flex items-center gap-1.5 shadow border-t border-x border-red-300/40">
              <Play size={8} fill="white" />
              <span>Start</span>
            </div>

            {/* 1st Move Right block (static) */}
            <div className="h-5 bg-[#ff912d] text-white text-[9px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Move</span>
              <span className="bg-black/30 px-1 py-0.5 rounded text-[8px] flex items-center gap-0.5 font-mono">
                Right <span className="text-[6px] opacity-70">▼</span>
              </span>
            </div>

            {/* 2nd Move Right block snapping under the 1st */}
            <div
              className="relative h-5 bg-[#ff912d] text-white text-[9px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow rounded-b"
              style={{
                animation: 'dragSecondBlock 4.5s ease-in-out infinite, snapFlashSecond 4.5s ease-in-out infinite',
              }}
            >
              <span>Move</span>
              <span className="bg-black/30 px-1 py-0.5 rounded text-[8px] flex items-center gap-0.5 font-mono">
                Right <span className="text-[6px] opacity-70">▼</span>
              </span>

              <div
                className="absolute -right-1 -top-1 z-30"
                style={{ animation: 'cursorDragSecond 4.5s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'simStatusReady 4.5s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'simStatusRunning 4.5s ease-in-out infinite' }}
            >
              RUNNING CODE
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-2 relative">
          <div className="relative">
            <MoonGridLevel1 roverPos={{ x: -1, y: -1, rot: 0 }} />

            {/* Rover stays STILL during placement, then advances 2 tiles after block snaps */}
            <div
              className="absolute top-[32px] left-[32px] w-[24px] h-[24px] pointer-events-none z-30"
              style={{ animation: 'roverMoveAfterPlace 4.5s ease-in-out infinite' }}
            >
              <RoverSprite rotation={0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Clean click on RUN SIMULATION.
 * Tools are all Move [Direction ▾]: Move Right reaches corner (4,1), then Move Down moves south along the track!
 */
export function MoonLevel1Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        /* Vector cursor floats down and clicks dead-center on RUN SIMULATION */
        @keyframes vectorPointerClick {
          0%, 15% {
            transform: translate(25px, 20px) scale(1);
            opacity: 0.8;
          }
          24% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          29%, 36% {
            transform: translate(0px, 0px) scale(0.85);
            opacity: 1;
          }
          42%, 80% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          90%, 100% {
            transform: translate(25px, 20px) scale(1);
            opacity: 0.8;
          }
        }
        /* Button depression */
        @keyframes simButtonPressClean {
          0%, 25% {
            transform: translateY(0px);
            filter: brightness(1);
            border-bottom-width: 4px;
          }
          29%, 38% {
            transform: translateY(3px);
            filter: brightness(1.35);
            border-bottom-width: 0px;
            box-shadow: 0 0 20px rgba(255,145,45,0.9);
          }
          44%, 100% {
            transform: translateY(0px);
            filter: brightness(1);
            border-bottom-width: 4px;
          }
        }
        /* Simulation Status in Step 2 */
        @keyframes simStatusReady2 {
          0%, 28% { opacity: 1; }
          32%, 94% { opacity: 0; }
          97%, 100% { opacity: 1; }
        }
        @keyframes simStatusRunning2 {
          0%, 28% { opacity: 0; }
          32%, 94% { opacity: 1; }
          97%, 100% { opacity: 0; }
        }
        /* Rover executes sequence: 3 Move Right blocks to corner (4,1) + 1 Move Down block along the vertical track */
        @keyframes roverExecuteClean {
          0%, 28% { transform: translate(0px, 0px) rotate(90deg); }
          36%, 45% { transform: translate(25px, 0px) rotate(90deg); }
          50%, 59% { transform: translate(50px, 0px) rotate(90deg); }
          64%, 73% { transform: translate(75px, 0px) rotate(90deg); }
          79%, 90% { transform: translate(75px, 25px) rotate(180deg); }
          96%, 100% { transform: translate(0px, 0px) rotate(90deg); }
        }
      `}</style>

      {/* LEFT PANE: Workspace with Move Right + Move Down */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-5 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <WorkspaceSidebar />

          <div className="flex flex-col w-[125px] relative z-20">
            <div className="h-4.5 bg-[#ef4444] text-white text-[8px] font-bold px-2 rounded-t flex items-center gap-1 shadow">
              <Play size={7} fill="white" />
              <span>Start</span>
            </div>
            <div className="h-4.5 bg-[#ff912d] text-white text-[8px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Move</span>
              <span className="bg-black/30 px-1 py-0.5 rounded text-[7.5px] flex items-center gap-0.5 font-mono">
                Right <span className="text-[5.5px] opacity-70">▼</span>
              </span>
            </div>
            <div className="h-4.5 bg-[#ff912d] text-white text-[8px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Move</span>
              <span className="bg-black/30 px-1 py-0.5 rounded text-[7.5px] flex items-center gap-0.5 font-mono">
                Right <span className="text-[5.5px] opacity-70">▼</span>
              </span>
            </div>
            <div className="h-4.5 bg-[#ff912d] text-white text-[8px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Move</span>
              <span className="bg-black/30 px-1 py-0.5 rounded text-[7.5px] flex items-center gap-0.5 font-mono">
                Right <span className="text-[5.5px] opacity-70">▼</span>
              </span>
            </div>
            <div className="h-4.5 bg-[#ff912d] text-white text-[8px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Move</span>
              <span className="bg-black/30 px-1 py-0.5 rounded text-[7.5px] flex items-center gap-0.5 font-mono">
                Down <span className="text-[5.5px] opacity-70">▼</span>
              </span>
            </div>
            <div className="h-4.5 bg-[#dc2626] text-white text-[8px] font-bold px-2 rounded-b flex items-center gap-1 border-t border-black/20 shadow">
              <span className="w-1.5 h-1.5 bg-white rounded-sm" />
              <span>End</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation with Real RUN SIMULATION Button */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative justify-between">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'simStatusReady2 4.5s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'simStatusRunning2 4.5s ease-in-out infinite' }}
            >
              RUNNING CODE
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-2 relative">
          <div className="relative">
            <MoonGridLevel1 roverPos={{ x: -1, y: -1, rot: 0 }} />

            <div
              className="absolute top-[32px] left-[32px] w-[24px] h-[24px] pointer-events-none z-30"
              style={{ animation: 'roverExecuteClean 4.5s ease-in-out infinite' }}
            >
              <RoverSprite rotation={0} />
            </div>
          </div>
        </div>

        {/* Real Game Action Bar with RUN SIMULATION button */}
        <div className="p-2.5 bg-[#140624] border-t border-white/10 flex items-center justify-center relative">
          <div className="relative">
            <div
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-black font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 border-b-4 border-orange-800 shadow-lg cursor-pointer"
              style={{ animation: 'simButtonPressClean 4.5s ease-in-out infinite' }}
            >
              <Play size={12} fill="black" />
              <span>RUN SIMULATION</span>
            </div>

            {/* Clean Vector Pointer centered directly over the button */}
            <div
              className="absolute top-1 left-1/2 -translate-x-1/2 z-30"
              style={{ animation: 'vectorPointerClick 4.5s ease-in-out infinite' }}
            >
              <CursorPointer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Clean drag and snap of red End block (All tools are Move [Direction ▾])
 */
export function MoonLevel1Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        /* Animate 'End' block being dragged from the Events category */
        @keyframes dragEndBlockClean {
          0%, 15% {
            transform: translate(-62px, 20px);
            opacity: 0.6;
          }
          35%, 85% {
            transform: translate(0px, 0px);
            opacity: 1;
            box-shadow: 0 0 12px rgba(220, 38, 38, 0.7);
          }
          95%, 100% {
            transform: translate(-62px, 20px);
            opacity: 0.6;
          }
        }
        @keyframes cursorEndClean {
          0%, 15% { transform: translate(-62px, 20px); opacity: 1; }
          35% { transform: translate(0px, 0px); opacity: 1; }
          42%, 85% { transform: translate(15px, 15px); opacity: 0; }
          95%, 100% { transform: translate(-62px, 20px); opacity: 1; }
        }
        /* Snap flash on End block connection */
        @keyframes snapFlashEnd {
          0%, 33% { filter: brightness(1); }
          35% { filter: brightness(1.6); outline: 2px solid #ef4444; }
          40%, 100% { filter: brightness(1); outline: none; }
        }
        /* Simulation Status in Step 3 */
        @keyframes simStatusReady3 {
          0%, 35% { opacity: 1; }
          40%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes simStatusRunning3 {
          0%, 35% { opacity: 0; }
          40%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        /* Checkmark and LEVEL COMPLETED appear strictly AFTER the End block gets snapped (after 38%) */
        @keyframes popCheckmarkAfterEnd {
          0%, 37% {
            opacity: 0;
            transform: scale(0.65);
          }
          44% {
            opacity: 1;
            transform: scale(1.06);
          }
          48%, 86% {
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 16px rgba(16,185,129,0.5));
          }
          94%, 100% {
            opacity: 0;
            transform: scale(0.65);
          }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2 flex flex-row gap-5 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <WorkspaceSidebar />

          <div className="flex flex-col w-[125px] relative z-20">
            <div className="h-4 bg-[#ef4444] text-white text-[7.5px] font-bold px-1.5 rounded-t flex items-center gap-1 shadow">
              <Play size={6.5} fill="white" />
              <span>Start</span>
            </div>
            <div className="h-4 bg-[#ff912d] text-white text-[7.5px] font-bold px-1.5 flex items-center justify-between border-t border-black/20 shadow">
              <span>Move</span>
              <span className="bg-black/30 px-1 py-0.2 rounded text-[7px] flex items-center gap-0.5 font-mono">
                Right <span className="text-[5px] opacity-70">▼</span>
              </span>
            </div>
            <div className="h-4 bg-[#ff912d] text-white text-[7.5px] font-bold px-1.5 flex items-center justify-between border-t border-black/20 shadow">
              <span>Move</span>
              <span className="bg-black/30 px-1 py-0.2 rounded text-[7px] flex items-center gap-0.5 font-mono">
                Right <span className="text-[5px] opacity-70">▼</span>
              </span>
            </div>
            <div className="h-4 bg-[#ff912d] text-white text-[7.5px] font-bold px-1.5 flex items-center justify-between border-t border-black/20 shadow">
              <span>Move</span>
              <span className="bg-black/30 px-1 py-0.2 rounded text-[7px] flex items-center gap-0.5 font-mono">
                Right <span className="text-[5px] opacity-70">▼</span>
              </span>
            </div>
            <div className="h-4 bg-[#ff912d] text-white text-[7.5px] font-bold px-1.5 flex items-center justify-between border-t border-black/20 shadow">
              <span>Move</span>
              <span className="bg-black/30 px-1 py-0.2 rounded text-[7px] flex items-center gap-0.5 font-mono">
                Down <span className="text-[5px] opacity-70">▼</span>
              </span>
            </div>
            <div className="h-4 bg-[#ff912d] text-white text-[7.5px] font-bold px-1.5 flex items-center justify-between border-t border-black/20 shadow">
              <span>Move</span>
              <span className="bg-black/30 px-1 py-0.2 rounded text-[7px] flex items-center gap-0.5 font-mono">
                Down <span className="text-[5px] opacity-70">▼</span>
              </span>
            </div>

            {/* The Animated End Block */}
            <div
              className="relative h-4 bg-[#dc2626] text-white text-[7.5px] font-black px-1.5 rounded-b flex items-center gap-1 shadow-xl border-t border-black/20"
              style={{
                animation: 'dragEndBlockClean 4.5s ease-in-out infinite, snapFlashEnd 4.5s ease-in-out infinite',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-sm bg-white" />
              <span>End</span>

              <div
                className="absolute -right-1 -top-1 z-30"
                style={{ animation: 'cursorEndClean 4.5s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation showing Rover at GOAL + Checkmark and LEVEL COMPLETED pop up after snap */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'simStatusReady3 4.5s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'simStatusRunning3 4.5s ease-in-out infinite' }}
            >
              RUNNING CODE
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-2 relative">
          <div className="relative">
            {/* Rover positioned directly on GOAL at (4,3) */}
            <MoonGridLevel1 roverPos={{ x: 4, y: 3, rot: 180 }} />
          </div>

          {/* Celebratory Checkmark + LEVEL COMPLETED appears strictly AFTER End block snaps */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-3 select-none pointer-events-none z-30"
            style={{ animation: 'popCheckmarkAfterEnd 4.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite' }}
          >
            <div className="flex flex-col items-center gap-2 bg-[#0e041a]/90 backdrop-blur-sm border border-emerald-500/50 rounded-2xl px-5 py-3 shadow-[0_0_24px_rgba(16,185,129,0.35)]">
              <div className="w-11 h-11 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.5)]">
                <CheckCircle2 size={24} strokeWidth={2.5} />
              </div>
              <div className="text-[11px] font-black uppercase text-emerald-300 tracking-wider font-mono text-center">
                LEVEL COMPLETED
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
