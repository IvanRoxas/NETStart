"use client";

import React from 'react';
import {
  Play,
  CheckCircle2,
  Package,
  Trash2,
  Zap,
  Repeat
} from 'lucide-react';

/**
 * Clean SVG Cursor Pointer (Strictly No Emojis)
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
 * Authentic Level 2 Workspace Toolbox Sidebar matching Blockly categories
 */
function WorkspaceSidebarLevel2({
  showKeywords = true,
  showConditions = true,
}: {
  showKeywords?: boolean;
  showConditions?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-16 shrink-0 py-1 select-none font-mono">
      <div className="text-[8px] font-bold uppercase text-red-400 bg-red-950/40 border-l-2 border-red-500 px-1.5 py-0.5 rounded-r">
        Events
      </div>
      <div className="text-[8px] font-bold uppercase text-blue-400 bg-blue-950/40 border-l-2 border-blue-500 px-1.5 py-0.5 rounded-r">
        Actions
      </div>
      {showKeywords && (
        <div className="text-[8px] font-bold uppercase text-cyan-400 bg-cyan-950/40 border-l-2 border-cyan-500 px-1.5 py-0.5 rounded-r">
          Keywords
        </div>
      )}
      {showConditions && (
        <div className="text-[8px] font-bold uppercase text-purple-400 bg-purple-950/40 border-l-2 border-purple-500 px-1.5 py-0.5 rounded-r">
          Conditions
        </div>
      )}
      <div className="text-[8px] font-bold uppercase text-orange-400 bg-orange-950/40 border-l-2 border-orange-500 px-1.5 py-0.5 rounded-r">
        Loops
      </div>
    </div>
  );
}

/**
 * Slide 1: Sorting One (Section 1 Mechanic)
 * 100% Cargo items. Use Repeat 10 loop with Scan Current Item and Send to Cargo Bay.
 * Stationary center scanner reticle.
 * Cargo item flies directly UP and physically enters INSIDE the Cargo Bay box, then next item advances.
 */
export function MoonLevel2Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        /* Drag Send to Cargo Bay block inside Repeat loop */
        @keyframes dragSendCargoBlock {
          0%, 15% {
            transform: translate(-55px, 25px);
            opacity: 0.7;
          }
          32%, 85% {
            transform: translate(0px, 0px);
            opacity: 1;
          }
          95%, 100% {
            transform: translate(-55px, 25px);
            opacity: 0.7;
          }
        }
        @keyframes cursorDragSendCargo {
          0%, 15% { transform: translate(-55px, 25px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          40%, 85% { transform: translate(15px, 15px); opacity: 0; }
          95%, 100% { transform: translate(-55px, 25px); opacity: 1; }
        }
        @keyframes snapFlashSendCargo {
          0%, 30% { filter: brightness(1); }
          32% { filter: brightness(1.4); outline: 2px solid #3b82f6; }
          38%, 100% { filter: brightness(1); outline: none; }
        }

        /* Simulation Status in Slide 1: READY vs RUNNING CODE */
        @keyframes simStatusReadyL2S1 {
          0%, 32% { opacity: 1; }
          36%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes simStatusRunningL2S1 {
          0%, 32% { opacity: 0; }
          36%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }

        /* Laser Sweep across stationary center scanner */
        @keyframes laserSweep1 {
          0%, 28% { opacity: 0; top: 0%; }
          30%, 46% { opacity: 1; top: 80%; }
          48%, 100% { opacity: 0; top: 0%; }
        }

        /* Cargo item: Scanned, then FLIES DIRECTLY UP INTO CARGO BAY BOX and ENTERS IT */
        @keyframes cargoFlyIntoBay1 {
          0%, 28% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
            background: linear-gradient(135deg, #1e3a8a, #172554);
            border-color: rgba(59,130,246,0.6);
            box-shadow: none;
          }
          30%, 46% {
            transform: translate(0, 0) scale(1.05);
            opacity: 1;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-color: #93c5fd;
            box-shadow: 0 0 16px rgba(59,130,246,0.9);
          }
          /* Flies UP directly into Cargo Bay */
          50% {
            transform: translate(0, -12px) scale(1.02);
            opacity: 1;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-color: #93c5fd;
            box-shadow: 0 0 18px rgba(59,130,246,0.95);
          }
          64% {
            transform: translate(0, -62px) scale(0.95);
            opacity: 1;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-color: #bfdbfe;
            box-shadow: 0 0 22px rgba(59,130,246,1);
          }
          /* ACTUALLY ENTERS AND SETTLES INSIDE THE CARGO BAY BOX */
          68%, 80% {
            transform: translate(0, -62px) scale(0.72);
            opacity: 1;
            background: linear-gradient(135deg, #2563eb, #1e40af);
            border-color: #ffffff;
            box-shadow: 0 0 25px rgba(59,130,246,1);
          }
          84% {
            transform: translate(0, -62px) scale(0.5);
            opacity: 0;
          }
          88%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
            background: linear-gradient(135deg, #1e3a8a, #172554);
            border-color: rgba(59,130,246,0.6);
            box-shadow: none;
          }
        }

        /* Cargo Bay pulses and lights up when item enters */
        @keyframes cargoBayPulse1 {
          0%, 62% {
            transform: scale(1);
            border-color: rgba(96, 165, 250, 0.7);
            background-color: rgba(30, 58, 138, 0.35);
            box-shadow: 0 0 10px rgba(59,130,246,0.25);
          }
          66%, 82% {
            transform: scale(1.06);
            border-color: #93c5fd;
            background-color: rgba(59, 130, 246, 0.4);
            box-shadow: 0 0 24px rgba(59,130,246,0.95);
          }
          86%, 100% {
            transform: scale(1);
            border-color: rgba(96, 165, 250, 0.7);
            background-color: rgba(30, 58, 138, 0.35);
            box-shadow: 0 0 10px rgba(59,130,246,0.25);
          }
        }

        /* Incoming queue on right advances into stationary center scanner */
        @keyframes advanceQueue1 {
          0%, 80% { transform: translateX(0px); }
          84%, 92% { transform: translateX(-36px); }
          96%, 100% { transform: translateX(0px); }
        }
      `}</style>

      {/* LEFT PANE: Workspace with Blocks */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider">
            BLOCKS
          </span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-3 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <WorkspaceSidebarLevel2 showKeywords={false} showConditions={false} />

          {/* Block Stack: Start -> Repeat 10 [Scan, Send to Cargo Bay] */}
          <div className="flex flex-col w-[165px] relative z-20">
            {/* Start Block */}
            <div className="h-6 bg-[#ef4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center gap-1.5 shadow border-t border-x border-red-300/40">
              <Play size={8} fill="white" />
              <span>Start</span>
            </div>

            {/* Repeat 10 times Loop Block */}
            <div className="bg-[#f97316] text-white text-[9px] font-bold p-1 rounded-b shadow border-t border-black/20 flex flex-col gap-1">
              <div className="flex items-center gap-1 px-1">
                <Repeat size={10} />
                <span>repeat</span>
                <span className="bg-black/30 px-1 py-0.2 rounded font-mono text-[8.5px]">10</span>
                <span>times</span>
              </div>

              {/* Nested blocks inside loop */}
              <div className="ml-3 pl-1.5 border-l-2 border-amber-300/60 flex flex-col gap-1 py-0.5">
                {/* Scan Current Item */}
                <div className="h-5 bg-[#0ea5e9] text-white text-[8.5px] font-bold px-2 rounded flex items-center gap-1 shadow">
                  <span className="font-mono text-[8px] opacity-80">[ ]</span>
                  <span>Scan Current Item</span>
                </div>

                {/* Send to Cargo Bay (Animated Snapping) */}
                <div
                  className="relative h-5 bg-[#3b82f6] text-white text-[8.5px] font-bold px-2 rounded flex items-center justify-between shadow"
                  style={{
                    animation: 'dragSendCargoBlock 4.5s ease-in-out infinite, snapFlashSendCargo 4.5s ease-in-out infinite',
                  }}
                >
                  <span>Send to</span>
                  <span className="bg-black/30 px-1 py-0.2 rounded text-[7.5px] font-mono">
                    Cargo Bay <span className="text-[6px] opacity-75">▼</span>
                  </span>

                  <div
                    className="absolute -right-1 -top-1 z-30"
                    style={{ animation: 'cursorDragSendCargo 4.5s ease-in-out infinite' }}
                  >
                    <CursorPointer />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Conveyor Belt Simulation with Centralized Layout */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative justify-between p-2.5 overflow-hidden">
        {/* Simulation Header */}
        <div className="h-6 px-2.5 bg-[#170529] border border-white/10 rounded-md flex items-center justify-between shrink-0 mb-1 z-30">
          <span className="text-[9.5px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'simStatusReadyL2S1 4.5s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'simStatusRunningL2S1 4.5s ease-in-out infinite' }}
            >
              RUNNING CODE
            </span>
          </div>
        </div>

        {/* Centralized Simulation Arena */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full my-auto overflow-visible">
          {/* Top Drop Zone: CARGO BAY (Centered directly above scanner) */}
          <div className="flex justify-center w-full z-20 mb-3">
            <div
              className="w-36 h-9 rounded-xl border-2 border-dashed border-blue-400/80 bg-blue-950/40 flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(59,130,246,0.3)] select-none transition-transform"
              style={{ animation: 'cargoBayPulse1 4.5s ease-in-out infinite' }}
            >
              <Package size={15} className="text-blue-400" />
              <span className="font-mono font-black text-[10px] tracking-wider uppercase text-blue-300">
                CARGO BAY
              </span>
            </div>
          </div>

          {/* Conveyor Belt Track with Stationary Center Scanner */}
          <div className="relative w-full h-16 bg-[#130722] border-y-2 border-purple-500/50 rounded-lg flex items-center justify-center px-4 overflow-visible shadow-inner z-10">
            {/* Treads */}
            <div
              className="absolute inset-x-0 inset-y-0.5 opacity-25 pointer-events-none rounded-md overflow-hidden"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #c084fc 0, #c084fc 4px, transparent 4px, transparent 16px)',
                backgroundSize: '16px 100%',
              }}
            />
            {/* Roller Caps */}
            <div className="absolute left-1 inset-y-1 w-1.5 rounded-sm bg-purple-900/60 border border-purple-500/30 pointer-events-none" />
            <div className="absolute right-1 inset-y-1 w-1.5 rounded-sm bg-purple-900/60 border border-purple-500/30 pointer-events-none" />

            {/* Stationary Center Scanner Station */}
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0 z-20 overflow-visible">
              {/* Cyan Scanner Reticle - Fixed in place */}
              <div className="absolute -inset-1 rounded-lg border border-cyan-400/80 bg-cyan-950/30 shadow-[0_0_12px_rgba(6,182,212,0.5)] pointer-events-none z-10">
                <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />

                <div
                  className="absolute inset-x-0 h-0.5 bg-cyan-300 shadow-[0_0_8px_#22d3ee] pointer-events-none"
                  style={{ animation: 'laserSweep1 4.5s ease-in-out infinite' }}
                />
              </div>

              {/* Cargo Container: Flies straight up directly into Cargo Bay */}
              <div
                className="w-9 h-9 rounded-md flex flex-col items-center justify-center text-white border z-30 font-mono text-[7px] font-black pointer-events-none shadow-md"
                style={{ animation: 'cargoFlyIntoBay1 4.5s ease-in-out infinite' }}
              >
                <Package size={14} className="text-white drop-shadow" />
                <span className="leading-none mt-0.5">CARGO</span>
              </div>
            </div>

            {/* Incoming queue on right: rolls into center scanner */}
            <div
              className="absolute left-[calc(50%+28px)] flex items-center gap-2 overflow-visible"
              style={{ animation: 'advanceQueue1 4.5s ease-in-out infinite' }}
            >
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-md bg-[#18092c] border border-blue-400/40 flex items-center justify-center text-blue-300/80 shrink-0 shadow-sm"
                >
                  <Package size={13} className="text-blue-400/70" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Helper Note */}
        <div className="text-center py-0.5 z-20">
          <span className="text-[8.5px] font-mono text-purple-300/70">
            Loop scans & packs every Cargo item directly into the bay
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Sorting Two (Section 2 Mechanic - Binary Classification)
 * Mix of Cargo and Space Junk (Trash). Use If / Else condition block.
 * Cargo flies straight UP directly into CARGO BAY.
 * Trash drops straight DOWN directly into TRASH CHUTE.
 * Stationary center scanner reticle.
 */
export function MoonLevel2Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        /* Simulation Status in Slide 2: READY vs RUNNING CODE */
        @keyframes simStatusReadyL2S2 {
          0%, 15% { opacity: 1; }
          18%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes simStatusRunningL2S2 {
          0%, 15% { opacity: 0; }
          18%, 88% { opacity: 1; }
          94%, 100% { opacity: 0; }
        }

        /* Laser sweep animation across the 2 items in center scanner */
        @keyframes laserSweep2 {
          0%, 12% { opacity: 0; top: 0%; }
          15%, 28% { opacity: 1; top: 80%; }
          32%, 58% { opacity: 0; top: 0%; }
          60%, 74% { opacity: 1; top: 80%; }
          78%, 100% { opacity: 0; top: 0%; }
        }

        /* 2-Item Sequential Sorting:
           Cycle A (0 - 50%): Cargo item scanned -> flies straight UP directly into Cargo Bay box
           Cycle B (50 - 100%): Trash item scanned -> drops straight DOWN directly into Trash Chute box
        */
        @keyframes binaryItemAnimation {
          /* Item 1: Cargo scanned */
          0%, 14% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
            background: linear-gradient(135deg, #1e3a8a, #172554);
            border-color: rgba(59,130,246,0.6);
          }
          15%, 28% {
            transform: translate(0, 0) scale(1.05);
            opacity: 1;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-color: #93c5fd;
            box-shadow: 0 0 16px rgba(59,130,246,0.9);
          }
          /* Cargo flies UP directly into Cargo Bay box */
          32% {
            transform: translate(0, -12px) scale(1.02);
            opacity: 1;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-color: #93c5fd;
            box-shadow: 0 0 18px rgba(59,130,246,0.95);
          }
          40% {
            transform: translate(0, -62px) scale(0.95);
            opacity: 1;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-color: #bfdbfe;
            box-shadow: 0 0 22px rgba(59,130,246,1);
          }
          /* ENTERS INSIDE CARGO BAY */
          44%, 48% {
            transform: translate(0, -62px) scale(0.72);
            opacity: 1;
            background: linear-gradient(135deg, #2563eb, #1e40af);
            border-color: #ffffff;
          }
          49% {
            transform: translate(0, -62px) scale(0.5);
            opacity: 0;
          }

          /* Item 2: Trash arrives in scanner */
          50%, 58% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
            background: linear-gradient(135deg, #881337, #4c0519);
            border-color: rgba(244,63,94,0.6);
            box-shadow: none;
          }
          60%, 74% {
            transform: translate(0, 0) scale(1.05);
            opacity: 1;
            background: linear-gradient(135deg, #e11d48, #9f1239);
            border-color: #fda4af;
            box-shadow: 0 0 16px rgba(244,63,94,0.9);
          }
          /* Trash drops DOWN directly into Trash Chute box */
          78% {
            transform: translate(0, 12px) scale(1.02);
            opacity: 1;
            background: linear-gradient(135deg, #e11d48, #9f1239);
            border-color: #fda4af;
            box-shadow: 0 0 18px rgba(244,63,94,0.95);
          }
          86% {
            transform: translate(0, 62px) scale(0.95);
            opacity: 1;
            background: linear-gradient(135deg, #e11d48, #9f1239);
            border-color: #fecdd3;
            box-shadow: 0 0 22px rgba(244,63,94,1);
          }
          /* ENTERS INSIDE TRASH CHUTE */
          89%, 95% {
            transform: translate(0, 62px) scale(0.72);
            opacity: 1;
            background: linear-gradient(135deg, #be123c, #881337);
            border-color: #ffffff;
          }
          97% {
            transform: translate(0, 62px) scale(0.5);
            opacity: 0;
          }
          99%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
            background: linear-gradient(135deg, #1e3a8a, #172554);
            border-color: rgba(59,130,246,0.6);
          }
        }

        /* Cargo Bay Pulse (Top) */
        @keyframes cargoBayPulse2 {
          0%, 38% {
            transform: scale(1);
            border-color: rgba(96, 165, 250, 0.7);
            background-color: rgba(30, 58, 138, 0.35);
          }
          40%, 48% {
            transform: scale(1.06);
            border-color: #93c5fd;
            background-color: rgba(59, 130, 246, 0.4);
            box-shadow: 0 0 22px rgba(59,130,246,0.95);
          }
          52%, 100% {
            transform: scale(1);
            border-color: rgba(96, 165, 250, 0.7);
            background-color: rgba(30, 58, 138, 0.35);
          }
        }

        /* Trash Chute Pulse (Bottom) */
        @keyframes trashChutePulse2 {
          0%, 84% {
            transform: scale(1);
            border-color: rgba(251, 113, 133, 0.7);
            background-color: rgba(136, 19, 55, 0.35);
          }
          86%, 95% {
            transform: scale(1.06);
            border-color: #fda4af;
            background-color: rgba(244, 63, 94, 0.4);
            box-shadow: 0 0 22px rgba(244,63,94,0.95);
          }
          98%, 100% {
            transform: scale(1);
            border-color: rgba(251, 113, 133, 0.7);
            background-color: rgba(136, 19, 55, 0.35);
          }
        }

        /* Workspace Block Highlight during execution */
        @keyframes highlightCargoBranch {
          0%, 14% { box-shadow: none; outline: none; }
          18%, 46% { box-shadow: 0 0 10px #38bdf8; outline: 1.5px solid #38bdf8; }
          50%, 100% { box-shadow: none; outline: none; }
        }
        @keyframes highlightTrashBranch {
          0%, 58% { box-shadow: none; outline: none; }
          62%, 94% { box-shadow: 0 0 10px #fb7185; outline: 1.5px solid #fb7185; }
          98%, 100% { box-shadow: none; outline: none; }
        }

        /* Advance queue */
        @keyframes advanceQueue2 {
          0%, 42% { transform: translateX(0px); }
          46%, 50% { transform: translateX(-36px); }
          52%, 90% { transform: translateX(-36px); }
          94%, 98% { transform: translateX(-72px); }
          100% { transform: translateX(0px); }
        }
      `}</style>

      {/* LEFT PANE: Workspace with If / Else block */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider">
            BLOCKS
          </span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-3 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <WorkspaceSidebarLevel2 showKeywords={false} showConditions={true} />

          {/* Block Stack: Start -> Repeat -> If Cargo / Else Trash */}
          <div className="flex flex-col w-[165px] relative z-20">
            {/* Start Block */}
            <div className="h-6 bg-[#ef4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center gap-1.5 shadow border-t border-x border-red-300/40">
              <Play size={8} fill="white" />
              <span>Start</span>
            </div>

            {/* Repeat Block */}
            <div className="bg-[#f97316] text-white text-[9px] font-bold p-1 rounded-b shadow border-t border-black/20 flex flex-col gap-1">
              <div className="flex items-center gap-1 px-1">
                <Repeat size={10} />
                <span>repeat</span>
                <span className="bg-black/30 px-1 py-0.2 rounded font-mono text-[8.5px]">15</span>
                <span>times</span>
              </div>

              {/* Loop body */}
              <div className="ml-2 pl-1.5 border-l-2 border-amber-300/60 flex flex-col gap-1 py-0.5">
                {/* Scan Current Item */}
                <div className="h-5 bg-[#0ea5e9] text-white text-[8px] font-bold px-2 rounded flex items-center gap-1 shadow">
                  <span className="font-mono text-[7.5px] opacity-80">[ ]</span>
                  <span>Scan Current Item</span>
                </div>

                {/* If / Else Block */}
                <div className="bg-[#7c3aed] text-white text-[8px] font-bold p-1 rounded shadow flex flex-col gap-1">
                  <div className="flex items-center justify-between px-1">
                    <span>if item is</span>
                    <span className="bg-black/30 px-1 py-0.2 rounded font-mono text-[7px] text-cyan-200">
                      Cargo ▼
                    </span>
                  </div>

                  {/* Then: Send to Cargo Bay */}
                  <div
                    className="ml-2 pl-1.5 border-l border-purple-300/60 transition-all rounded"
                    style={{ animation: 'highlightCargoBranch 6s ease-in-out infinite' }}
                  >
                    <div className="h-4.5 bg-[#3b82f6] text-white text-[7.5px] font-bold px-1.5 rounded flex items-center justify-between shadow-sm">
                      <span>Send to</span>
                      <span className="text-[7px] font-mono bg-black/30 px-1 py-0.2 rounded">Cargo Bay ▼</span>
                    </div>
                  </div>

                  <div className="px-1 text-[7.5px] font-bold text-purple-200">else</div>

                  {/* Else: Send to Trash Chute */}
                  <div
                    className="ml-2 pl-1.5 border-l border-purple-300/60 transition-all rounded"
                    style={{ animation: 'highlightTrashBranch 6s ease-in-out infinite' }}
                  >
                    <div className="h-4.5 bg-[#e11d48] text-white text-[7.5px] font-bold px-1.5 rounded flex items-center justify-between shadow-sm">
                      <span>Send to</span>
                      <span className="text-[7px] font-mono bg-black/30 px-1 py-0.2 rounded">Trash ▼</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Conveyor Simulation with Cargo Bay (Top) & Trash Chute (Bottom) */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative justify-between p-2.5 overflow-hidden">
        <div className="h-6 px-2.5 bg-[#170529] border border-white/10 rounded-md flex items-center justify-between shrink-0 mb-1 z-30">
          <span className="text-[9.5px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'simStatusReadyL2S2 6s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'simStatusRunningL2S2 6s ease-in-out infinite' }}
            >
              RUNNING CODE
            </span>
          </div>
        </div>

        {/* Centralized Simulation Arena */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full my-auto overflow-visible">
          {/* Top Drop Zone: CARGO BAY (Centered directly above scanner) */}
          <div className="flex justify-center w-full z-20 mb-2.5">
            <div
              className="w-36 h-8 rounded-lg border-2 border-dashed border-blue-400/80 bg-blue-950/40 flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.3)] select-none transition-transform"
              style={{ animation: 'cargoBayPulse2 6s ease-in-out infinite' }}
            >
              <Package size={14} className="text-blue-400" />
              <span className="font-mono font-black text-[10px] tracking-wider uppercase text-blue-300">
                CARGO BAY
              </span>
            </div>
          </div>

          {/* Center Conveyor Track with Fixed Scanner */}
          <div className="relative w-full h-15 bg-[#130722] border-y-2 border-purple-500/50 rounded-lg flex items-center justify-center px-4 overflow-visible shadow-inner z-10">
            {/* Treads */}
            <div
              className="absolute inset-x-0 inset-y-0.5 opacity-25 pointer-events-none rounded-md overflow-hidden"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #c084fc 0, #c084fc 4px, transparent 4px, transparent 16px)',
                backgroundSize: '16px 100%',
              }}
            />
            {/* Roller Caps */}
            <div className="absolute left-1 inset-y-1 w-1.5 rounded-sm bg-purple-900/60 border border-purple-500/30 pointer-events-none" />
            <div className="absolute right-1 inset-y-1 w-1.5 rounded-sm bg-purple-900/60 border border-purple-500/30 pointer-events-none" />

            {/* Stationary Center Reticle */}
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0 overflow-visible z-20">
              <div className="absolute -inset-1 rounded-lg border border-cyan-400/80 bg-cyan-950/30 shadow-[0_0_12px_rgba(6,182,212,0.5)] pointer-events-none z-10">
                <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />

                <div
                  className="absolute inset-x-0 h-0.5 bg-cyan-300 shadow-[0_0_8px_#22d3ee] pointer-events-none"
                  style={{ animation: 'laserSweep2 6s ease-in-out infinite' }}
                />
              </div>

              {/* Sorting Item: Cargo flies straight UP into Cargo Bay, Trash drops straight DOWN into Trash Chute */}
              <div
                className="w-9 h-9 rounded-md flex flex-col items-center justify-center text-white border z-30 font-mono text-[7px] font-black pointer-events-none shadow-md"
                style={{ animation: 'binaryItemAnimation 6s ease-in-out infinite' }}
              >
                <Package size={14} className="text-white drop-shadow" />
                <span className="leading-none mt-0.5">ITEM</span>
              </div>
            </div>

            {/* Waiting items on belt to the right of scanner */}
            <div
              className="absolute left-[calc(50%+28px)] flex items-center gap-2 overflow-visible"
              style={{ animation: 'advanceQueue2 6s ease-in-out infinite' }}
            >
              <div className="w-8 h-8 rounded-md bg-[#18092c] border border-rose-400/40 flex items-center justify-center text-rose-300/80 shrink-0 shadow-sm">
                <Trash2 size={13} />
              </div>
              <div className="w-8 h-8 rounded-md bg-[#18092c] border border-blue-400/40 flex items-center justify-center text-blue-300/80 shrink-0 shadow-sm">
                <Package size={13} />
              </div>
            </div>
          </div>

          {/* Bottom Drop Zone: TRASH CHUTE (Centered directly below scanner) */}
          <div className="flex justify-center w-full z-20 mt-2.5">
            <div
              className="w-36 h-8 rounded-lg border-2 border-dashed border-rose-400/80 bg-rose-950/40 flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.3)] select-none transition-transform"
              style={{ animation: 'trashChutePulse2 6s ease-in-out infinite' }}
            >
              <Trash2 size={14} className="text-rose-400" />
              <span className="font-mono font-black text-[10px] tracking-wider uppercase text-rose-300">
                TRASH CHUTE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Sorting Three (Section 3 Mechanic - Tri-Classification)
 * Fuel, Cargo, and Trash. Visibly animates all 3 items entering their respective bays:
 * Fuel -> Fuel Bay (Top Right), Cargo -> Cargo Bay (Top Left), Trash -> Trash Chute (Bottom).
 * Stationary center scanner reticle.
 */
export function MoonLevel2Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        /* Simulation Status in Slide 3 */
        @keyframes simStatusReadyL2S3 {
          0%, 12% { opacity: 1; }
          16%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes simStatusRunningL2S3 {
          0%, 12% { opacity: 0; }
          16%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }

        /* Laser Sweep 3-Cycle */
        @keyframes laserSweep3 {
          0%, 8% { opacity: 0; top: 0%; }
          10%, 20% { opacity: 1; top: 80%; }
          24%, 40% { opacity: 0; top: 0%; }
          42%, 52% { opacity: 1; top: 80%; }
          56%, 72% { opacity: 0; top: 0%; }
          74%, 84% { opacity: 1; top: 80%; }
          88%, 100% { opacity: 0; top: 0%; }
        }

        /* 3-Item Tri-Classification Sort:
           Phase 1: Fuel (Yellow) flies UP-RIGHT directly INTO Fuel Bay box
           Phase 2: Cargo (Blue) flies UP-LEFT directly INTO Cargo Bay box
           Phase 3: Trash (Rose) drops straight DOWN directly INTO Trash Chute box
        */
        @keyframes triItemAnimation {
          /* Phase 1: Fuel (Yellow) */
          0%, 8% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
            background: linear-gradient(135deg, #78350f, #451a03);
            border-color: rgba(245,158,11,0.6);
          }
          10%, 20% {
            transform: translate(0, 0) scale(1.05);
            opacity: 1;
            background: linear-gradient(135deg, #f59e0b, #b45309);
            border-color: #fde68a;
            box-shadow: 0 0 16px rgba(245,158,11,0.9);
          }
          24% {
            transform: translate(25px, -16px) scale(1.02);
            opacity: 1;
            background: linear-gradient(135deg, #f59e0b, #b45309);
            border-color: #fde68a;
            box-shadow: 0 0 18px rgba(245,158,11,0.95);
          }
          28% {
            transform: translate(58px, -60px) scale(0.95);
            opacity: 1;
            background: linear-gradient(135deg, #f59e0b, #b45309);
            border-color: #fef08a;
            box-shadow: 0 0 22px rgba(245,158,11,1);
          }
          /* ENTERS INSIDE FUEL BAY */
          30%, 33% {
            transform: translate(58px, -60px) scale(0.72);
            opacity: 1;
            background: linear-gradient(135deg, #d97706, #92400e);
            border-color: #ffffff;
          }
          34% {
            transform: translate(58px, -60px) scale(0.5);
            opacity: 0;
          }

          /* Phase 2: Cargo (Blue) */
          35%, 40% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
            background: linear-gradient(135deg, #1e3a8a, #172554);
            border-color: rgba(59,130,246,0.6);
            box-shadow: none;
          }
          42%, 52% {
            transform: translate(0, 0) scale(1.05);
            opacity: 1;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-color: #93c5fd;
            box-shadow: 0 0 16px rgba(59,130,246,0.9);
          }
          56% {
            transform: translate(-25px, -16px) scale(1.02);
            opacity: 1;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-color: #93c5fd;
            box-shadow: 0 0 18px rgba(59,130,246,0.95);
          }
          60% {
            transform: translate(-58px, -60px) scale(0.95);
            opacity: 1;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-color: #bfdbfe;
            box-shadow: 0 0 22px rgba(59,130,246,1);
          }
          /* ENTERS INSIDE CARGO BAY */
          63%, 66% {
            transform: translate(-58px, -60px) scale(0.72);
            opacity: 1;
            background: linear-gradient(135deg, #2563eb, #1e40af);
            border-color: #ffffff;
          }
          67% {
            transform: translate(-58px, -60px) scale(0.5);
            opacity: 0;
          }

          /* Phase 3: Trash (Rose) */
          68%, 72% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
            background: linear-gradient(135deg, #881337, #4c0519);
            border-color: rgba(244,63,94,0.6);
            box-shadow: none;
          }
          74%, 84% {
            transform: translate(0, 0) scale(1.05);
            opacity: 1;
            background: linear-gradient(135deg, #e11d48, #9f1239);
            border-color: #fda4af;
            box-shadow: 0 0 16px rgba(244,63,94,0.9);
          }
          88% {
            transform: translate(0, 16px) scale(1.02);
            opacity: 1;
            background: linear-gradient(135deg, #e11d48, #9f1239);
            border-color: #fda4af;
            box-shadow: 0 0 18px rgba(244,63,94,0.95);
          }
          92% {
            transform: translate(0, 60px) scale(0.95);
            opacity: 1;
            background: linear-gradient(135deg, #e11d48, #9f1239);
            border-color: #fecdd3;
            box-shadow: 0 0 22px rgba(244,63,94,1);
          }
          /* ENTERS INSIDE TRASH CHUTE */
          94%, 97% {
            transform: translate(0, 60px) scale(0.72);
            opacity: 1;
            background: linear-gradient(135deg, #be123c, #881337);
            border-color: #ffffff;
          }
          98% {
            transform: translate(0, 60px) scale(0.5);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
            background: linear-gradient(135deg, #78350f, #451a03);
            border-color: rgba(245,158,11,0.6);
          }
        }

        /* Fuel Bay Pulse (Top Right) */
        @keyframes fuelBayPulse3 {
          0%, 26% {
            transform: scale(1);
            border-color: rgba(251, 191, 36, 0.7);
            background-color: rgba(120, 53, 15, 0.35);
          }
          28%, 34% {
            transform: scale(1.06);
            border-color: #fef08a;
            background-color: rgba(245, 158, 11, 0.4);
            box-shadow: 0 0 22px rgba(245,158,11,0.95);
          }
          38%, 100% {
            transform: scale(1);
            border-color: rgba(251, 191, 36, 0.7);
            background-color: rgba(120, 53, 15, 0.35);
          }
        }

        /* Cargo Bay Pulse (Top Left) */
        @keyframes cargoBayPulse3 {
          0%, 58% {
            transform: scale(1);
            border-color: rgba(96, 165, 250, 0.7);
            background-color: rgba(30, 58, 138, 0.35);
          }
          60%, 67% {
            transform: scale(1.06);
            border-color: #93c5fd;
            background-color: rgba(59, 130, 246, 0.4);
            box-shadow: 0 0 22px rgba(59,130,246,0.95);
          }
          70%, 100% {
            transform: scale(1);
            border-color: rgba(96, 165, 250, 0.7);
            background-color: rgba(30, 58, 138, 0.35);
          }
        }

        /* Trash Chute Pulse (Bottom) */
        @keyframes trashChutePulse3 {
          0%, 90% {
            transform: scale(1);
            border-color: rgba(251, 113, 133, 0.7);
            background-color: rgba(136, 19, 55, 0.35);
          }
          92%, 97% {
            transform: scale(1.06);
            border-color: #fda4af;
            background-color: rgba(244, 63, 94, 0.4);
            box-shadow: 0 0 22px rgba(244,63,94,0.95);
          }
          99%, 100% {
            transform: scale(1);
            border-color: rgba(251, 113, 133, 0.7);
            background-color: rgba(136, 19, 55, 0.35);
          }
        }

        /* Advance queue */
        @keyframes advanceQueue3 {
          0%, 28% { transform: translateX(0px); }
          32%, 35% { transform: translateX(-36px); }
          36%, 62% { transform: translateX(-36px); }
          66%, 69% { transform: translateX(-72px); }
          70%, 94% { transform: translateX(-72px); }
          98%, 100% { transform: translateX(0px); }
        }
      `}</style>

      {/* LEFT PANE: Workspace showing Tri-Classification */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider">
            BLOCKS
          </span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-3 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <WorkspaceSidebarLevel2 showKeywords={true} showConditions={true} />

          {/* Block Stack: Start -> Repeat -> Tri-Classifier */}
          <div className="flex flex-col w-[165px] relative z-20">
            {/* Start Block */}
            <div className="h-5.5 bg-[#ef4444] text-white text-[9px] font-bold px-2 rounded-t flex items-center gap-1.5 shadow border-t border-x border-red-300/40">
              <Play size={8} fill="white" />
              <span>Start</span>
            </div>

            {/* Repeat 20 Loop */}
            <div className="bg-[#f97316] text-white text-[8.5px] font-bold p-1 rounded-b shadow border-t border-black/20 flex flex-col gap-1">
              <div className="flex items-center gap-1 px-1">
                <Repeat size={10} />
                <span>repeat</span>
                <span className="bg-black/30 px-1 py-0.2 rounded font-mono text-[8px]">20</span>
                <span>times</span>
              </div>

              {/* Loop body */}
              <div className="ml-2 pl-1.5 border-l-2 border-amber-300/60 flex flex-col gap-1 py-0.5">
                {/* Scan Current Item */}
                <div className="h-4.5 bg-[#0ea5e9] text-white text-[7.5px] font-bold px-1.5 rounded flex items-center gap-1 shadow">
                  <span className="font-mono text-[7px] opacity-80">[ ]</span>
                  <span>Scan Current Item</span>
                </div>

                {/* Condition: If Fuel -> Fuel Bay, else if Cargo -> Cargo Bay, else Trash */}
                <div className="bg-[#7c3aed] text-white text-[7.5px] font-bold p-1 rounded shadow flex flex-col gap-0.5">
                  <div className="flex items-center justify-between px-0.5">
                    <span>if Fuel</span>
                    <span className="font-mono bg-black/30 px-1 py-0.2 rounded text-[7px]">Fuel Bay ▼</span>
                  </div>
                  <div className="flex items-center justify-between px-0.5">
                    <span>else if Cargo</span>
                    <span className="font-mono bg-black/30 px-1 py-0.2 rounded text-[7px]">Cargo Bay ▼</span>
                  </div>
                  <div className="flex items-center justify-between px-0.5">
                    <span>else</span>
                    <span className="font-mono bg-black/30 px-1 py-0.2 rounded text-[7px]">Trash ▼</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Conveyor Simulation with Fuel Bay, Cargo Bay & Trash Chute */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative justify-between p-2.5 overflow-hidden">
        <div className="h-6 px-2.5 bg-[#170529] border border-white/10 rounded-md flex items-center justify-between shrink-0 mb-1 z-30">
          <span className="text-[9.5px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'simStatusReadyL2S3 7.5s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'simStatusRunningL2S3 7.5s ease-in-out infinite' }}
            >
              RUNNING CODE
            </span>
          </div>
        </div>

        {/* Centralized Simulation Arena */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full my-auto overflow-visible">
          {/* Top Drop Zones: CARGO BAY (Left) + FUEL BAY (Right) */}
          <div className="flex items-center justify-center gap-2.5 w-full z-20 mb-2">
            <div
              className="flex-1 h-7.5 max-w-[130px] rounded-lg border-2 border-dashed border-blue-400/80 bg-blue-950/40 flex items-center justify-center gap-1 select-none transition-transform"
              style={{ animation: 'cargoBayPulse3 7.5s ease-in-out infinite' }}
            >
              <Package size={12} className="text-blue-400" />
              <span className="font-mono font-black text-[9px] tracking-wider uppercase text-blue-300">
                CARGO BAY
              </span>
            </div>
            <div
              className="flex-1 h-7.5 max-w-[130px] rounded-lg border-2 border-dashed border-amber-400/80 bg-amber-950/40 flex items-center justify-center gap-1 select-none transition-transform"
              style={{ animation: 'fuelBayPulse3 7.5s ease-in-out infinite' }}
            >
              <Zap size={12} className="text-amber-400 fill-amber-400" />
              <span className="font-mono font-black text-[9px] tracking-wider uppercase text-amber-300">
                FUEL BAY
              </span>
            </div>
          </div>

          {/* Center Conveyor Track with Fixed Scanner */}
          <div className="relative w-full h-15 bg-[#130722] border-y-2 border-purple-500/50 rounded-lg flex items-center justify-center px-4 overflow-visible shadow-inner z-10">
            {/* Treads */}
            <div
              className="absolute inset-x-0 inset-y-0.5 opacity-25 pointer-events-none rounded-md overflow-hidden"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #c084fc 0, #c084fc 4px, transparent 4px, transparent 16px)',
                backgroundSize: '16px 100%',
              }}
            />
            {/* Roller Caps */}
            <div className="absolute left-1 inset-y-1 w-1.5 rounded-sm bg-purple-900/60 border border-purple-500/30 pointer-events-none" />
            <div className="absolute right-1 inset-y-1 w-1.5 rounded-sm bg-purple-900/60 border border-purple-500/30 pointer-events-none" />

            {/* Stationary Center Reticle */}
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0 overflow-visible z-20">
              <div className="absolute -inset-1 rounded-lg border border-cyan-400/80 bg-cyan-950/30 shadow-[0_0_12px_rgba(6,182,212,0.5)] pointer-events-none z-10">
                <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />

                <div
                  className="absolute inset-x-0 h-0.5 bg-cyan-300 shadow-[0_0_8px_#22d3ee] pointer-events-none"
                  style={{ animation: 'laserSweep3 7.5s ease-in-out infinite' }}
                />
              </div>

              {/* Animated Sorting Item that cycles through Fuel (Yellow), Cargo (Blue), Trash (Rose) */}
              <div
                className="w-9 h-9 rounded-md flex flex-col items-center justify-center text-white border z-30 font-mono text-[7px] font-black pointer-events-none shadow-md"
                style={{ animation: 'triItemAnimation 7.5s ease-in-out infinite' }}
              >
                <Zap size={14} className="text-white drop-shadow" />
                <span className="leading-none mt-0.5">ITEM</span>
              </div>
            </div>

            {/* Waiting items on belt */}
            <div
              className="absolute left-[calc(50%+28px)] flex items-center gap-2 overflow-visible"
              style={{ animation: 'advanceQueue3 7.5s ease-in-out infinite' }}
            >
              <div className="w-8 h-8 rounded-md bg-[#18092c] border border-blue-400/40 flex items-center justify-center text-blue-300/80 shrink-0 shadow-sm">
                <Package size={13} />
              </div>
              <div className="w-8 h-8 rounded-md bg-[#18092c] border border-rose-400/40 flex items-center justify-center text-rose-300/80 shrink-0 shadow-sm">
                <Trash2 size={13} />
              </div>
            </div>
          </div>

          {/* Bottom Drop Zone: TRASH CHUTE (Bottom Center directly below scanner) */}
          <div className="flex justify-center w-full z-20 mt-2">
            <div
              className="w-36 h-7.5 rounded-lg border-2 border-dashed border-rose-400/80 bg-rose-950/40 flex items-center justify-center gap-1.5 select-none transition-transform"
              style={{ animation: 'trashChutePulse3 7.5s ease-in-out infinite' }}
            >
              <Trash2 size={13} className="text-rose-400" />
              <span className="font-mono font-black text-[9px] tracking-wider uppercase text-rose-300">
                TRASH CHUTE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Dedicated End Block Slide for Moon Level 2
 * Snaps the 'End' block to properly terminate the conveyor sorting routine.
 * Triggers the completion modal and green checkmark once connected!
 */
export function MoonLevel2Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        /* Drag End Block from Events toolbox into bottom of workspace */
        @keyframes dragEndBlockLevel2 {
          0%, 15% {
            transform: translate(-55px, 20px);
            opacity: 0.7;
          }
          32%, 85% {
            transform: translate(0px, 0px);
            opacity: 1;
          }
          95%, 100% {
            transform: translate(-55px, 20px);
            opacity: 0.7;
          }
        }
        @keyframes cursorEndLevel2 {
          0%, 15% { transform: translate(-55px, 20px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          40%, 85% { transform: translate(15px, 15px); opacity: 0; }
          95%, 100% { transform: translate(-55px, 20px); opacity: 1; }
        }
        @keyframes snapFlashEndL2 {
          0%, 30% { filter: brightness(1); }
          32% { filter: brightness(1.5); outline: 2px solid #ef4444; }
          38%, 100% { filter: brightness(1); outline: none; }
        }

        /* Simulation Status */
        @keyframes simStatusReadyL2S4 {
          0%, 36% { opacity: 1; }
          40%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes simStatusRunningL2S4 {
          0%, 36% { opacity: 0; }
          40%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }

        /* Level Completed pop-up appears only AFTER End block snaps */
        @keyframes popCheckmarkLevel2 {
          0%, 38% {
            transform: scale(0.6);
            opacity: 0;
            pointer-events: none;
          }
          45%, 88% {
            transform: scale(1);
            opacity: 1;
            pointer-events: auto;
          }
          94%, 100% {
            transform: scale(0.6);
            opacity: 0;
            pointer-events: none;
          }
        }
      `}</style>

      {/* LEFT PANE: Workspace with Animated End Block */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider">
            BLOCKS
          </span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-3 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <WorkspaceSidebarLevel2 showKeywords={false} showConditions={true} />

          {/* Block Stack: Start -> Repeat -> End (snapping) */}
          <div className="flex flex-col w-[165px] relative z-20">
            {/* Start Block */}
            <div className="h-5.5 bg-[#ef4444] text-white text-[9px] font-bold px-2 rounded-t flex items-center gap-1.5 shadow border-t border-x border-red-300/40">
              <Play size={8} fill="white" />
              <span>Start</span>
            </div>

            {/* Repeat loop body */}
            <div className="bg-[#f97316] text-white text-[8px] font-bold p-1 shadow border-t border-black/20 flex flex-col gap-0.5">
              <div className="flex items-center gap-1 px-1">
                <Repeat size={9} />
                <span>repeat 20 times</span>
              </div>
              <div className="ml-2 pl-1 border-l-2 border-amber-300/60 flex flex-col gap-0.5 py-0.5">
                <div className="h-4.5 bg-[#0ea5e9] text-white text-[7.5px] font-bold px-1.5 rounded flex items-center">
                  <span>Scan Current Item</span>
                </div>
                <div className="h-4.5 bg-[#8b5cf6] text-white text-[7.5px] font-bold px-1.5 rounded flex items-center justify-between">
                  <span>If item is Cargo...</span>
                  <span className="text-[7px] font-mono bg-black/30 px-1 py-0.2 rounded">Send ▼</span>
                </div>
              </div>
            </div>

            {/* End Block (Animated Snapping from Events) */}
            <div
              className="relative h-5.5 bg-[#dc2626] text-white text-[9px] font-black px-2 rounded-b flex items-center gap-1.5 shadow-xl border-t border-black/20"
              style={{
                animation: 'dragEndBlockLevel2 4.5s ease-in-out infinite, snapFlashEndL2 4.5s ease-in-out infinite',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-sm bg-white" />
              <span>End</span>

              <div
                className="absolute -right-1 -top-1 z-30"
                style={{ animation: 'cursorEndLevel2 4.5s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Conveyor Simulation with Completion popup strictly after End snaps */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative justify-between p-2.5 overflow-hidden">
        <div className="h-6 px-2.5 bg-[#170529] border border-white/10 rounded-md flex items-center justify-between shrink-0 mb-1 z-30">
          <span className="text-[9.5px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'simStatusReadyL2S4 4.5s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'simStatusRunningL2S4 4.5s ease-in-out infinite' }}
            >
              RUNNING CODE
            </span>
          </div>
        </div>

        {/* Centralized Simulation Arena */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full my-auto overflow-visible">
          {/* Top Drop Zones */}
          <div className="flex items-center justify-center gap-2.5 w-full z-20 mb-2">
            <div className="flex-1 h-7.5 max-w-[130px] rounded-lg border border-dashed border-blue-400/80 bg-blue-950/40 flex items-center justify-center gap-1 select-none">
              <Package size={12} className="text-blue-400" />
              <span className="font-mono font-black text-[9px] tracking-wider uppercase text-blue-300">
                CARGO BAY
              </span>
            </div>
            <div className="flex-1 h-7.5 max-w-[130px] rounded-lg border border-dashed border-amber-400/80 bg-amber-950/40 flex items-center justify-center gap-1 select-none">
              <Zap size={12} className="text-amber-400 fill-amber-400" />
              <span className="font-mono font-black text-[9px] tracking-wider uppercase text-amber-300">
                FUEL BAY
              </span>
            </div>
          </div>

          {/* Center Conveyor Track with All Items Sorted */}
          <div className="relative w-full h-15 bg-[#130722] border-y-2 border-purple-500/50 rounded-lg flex items-center justify-center px-4 overflow-hidden shadow-inner z-10">
            <div
              className="absolute inset-x-0 inset-y-0.5 opacity-25 pointer-events-none rounded-md overflow-hidden"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #c084fc 0, #c084fc 4px, transparent 4px, transparent 16px)',
                backgroundSize: '16px 100%',
              }}
            />

            {/* Prominent All Sorted Indicator */}
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9.5px] font-black uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>ALL ITEMS SORTED</span>
            </div>
          </div>

          {/* Bottom Drop Zone: TRASH CHUTE */}
          <div className="flex justify-center w-full z-20 mt-2">
            <div className="w-36 h-7.5 rounded-lg border border-dashed border-rose-400/80 bg-rose-950/40 flex items-center justify-center gap-1 select-none">
              <Trash2 size={13} className="text-rose-400" />
              <span className="font-mono font-black text-[9px] tracking-wider uppercase text-rose-300">
                TRASH CHUTE
              </span>
            </div>
          </div>
        </div>

        {/* Celebratory Checkmark + LEVEL COMPLETED pop-up over the simulation strictly after End snaps */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-3 select-none pointer-events-none z-30"
          style={{ animation: 'popCheckmarkLevel2 4.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite' }}
        >
          <div className="flex flex-col items-center gap-2 bg-[#0e041a]/95 backdrop-blur-sm border border-emerald-500/60 rounded-2xl px-6 py-3.5 shadow-[0_0_28px_rgba(16,185,129,0.45)]">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]">
              <CheckCircle2 size={26} strokeWidth={2.5} />
            </div>
            <span className="font-mono font-black text-sm text-emerald-400 tracking-wider">
              LEVEL COMPLETED
            </span>
            <span className="text-[10px] text-gray-300 text-center max-w-[170px] leading-tight">
              All items successfully sorted and mission completed!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
