"use client";

import React from 'react';
import { Package, Zap, Wrench } from 'lucide-react';

/**
 * Large, Clear SVG Cursor Pointer (Strictly No Emojis)
 */
function CursorPointer({ className = "" }: { className?: string }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="white"
      stroke="#0f172a"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={`drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] pointer-events-none select-none ${className}`}
    >
      <path d="M5.5 3.5l11 7-5.5 1.5-3 5.5-2.5-14z" />
    </svg>
  );
}

function Mercury2ToolboxSidebar({ activeCategory = "loops" }: { activeCategory?: "loops" | "variables" | "logic" | "actions" }) {
  return (
    <div className="flex flex-col gap-1.5 w-18 shrink-0 py-1.5 select-none font-mono">
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === 'loops'
            ? 'text-purple-300 bg-purple-950/80 border-purple-400'
            : 'text-purple-400/60 bg-purple-950/30 border-purple-500/30'
          }`}
      >
        Loops
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === 'variables'
            ? 'text-cyan-300 bg-cyan-950/80 border-cyan-400'
            : 'text-cyan-400/60 bg-cyan-950/30 border-cyan-500/30'
          }`}
      >
        Variables
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === 'logic'
            ? 'text-blue-300 bg-blue-950/80 border-blue-400'
            : 'text-blue-400/60 bg-blue-950/30 border-blue-500/30'
          }`}
      >
        Logic
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === 'actions'
            ? 'text-emerald-300 bg-emerald-950/80 border-emerald-400'
            : 'text-emerald-400/60 bg-emerald-950/30 border-emerald-500/30'
          }`}
      >
        Actions
      </div>
    </div>
  );
}

/**
 * Authentic Conveyor Belt Rail & Warehouse Sorting Facility
 */
function Mercury2ConveyorScene({
  isSorting = false,
  crateType = 'equipment',
  sortedCount = 1,
  scannerActive = false,
  activeChute = 'equipment',
}: {
  isSorting?: boolean;
  crateType?: 'equipment' | 'organics' | 'energy';
  sortedCount?: number;
  scannerActive?: boolean;
  activeChute?: 'equipment' | 'organics' | 'energy';
}) {
  return (
    <div className="flex-1 w-full h-full min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#0a0514] select-none font-mono">
      <div className="w-full max-w-[270px] h-[155px] rounded-xl border border-purple-500/30 bg-[#140824] p-2.5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
        {/* Header Chutes */}
        <div className="grid grid-cols-3 gap-1.5 border-b border-purple-500/20 pb-1.5">
          <div
            className={`h-7 rounded flex items-center justify-center gap-1 transition-all duration-300 ${isSorting && activeChute === 'equipment'
                ? 'bg-cyan-900 border-2 border-cyan-300 shadow-[0_0_12px_#06b6d4]'
                : 'bg-cyan-950/60 border border-cyan-400/30 opacity-70'
              }`}
          >
            <Wrench size={10} className="text-cyan-300" />
            <span className="text-[7.5px] font-mono text-cyan-200 font-bold">EQUIP</span>
          </div>

          <div
            className={`h-7 rounded flex items-center justify-center gap-1 transition-all duration-300 ${isSorting && activeChute === 'organics'
                ? 'bg-emerald-900 border-2 border-emerald-300 shadow-[0_0_12px_#10b981]'
                : 'bg-emerald-950/60 border border-emerald-400/30 opacity-70'
              }`}
          >
            <Package size={10} className="text-emerald-300" />
            <span className="text-[7.5px] font-mono text-emerald-200 font-bold">ORGANIC</span>
          </div>

          <div
            className={`h-7 rounded flex items-center justify-center gap-1 transition-all duration-300 ${isSorting && activeChute === 'energy'
                ? 'bg-amber-900 border-2 border-amber-300 shadow-[0_0_12px_#f59e0b]'
                : 'bg-amber-950/60 border border-amber-400/30 opacity-70'
              }`}
          >
            <Zap size={10} className="text-amber-300" />
            <span className="text-[7.5px] font-mono text-amber-200 font-bold">ENERGY</span>
          </div>
        </div>

        {/* Conveyor Feeder Track */}
        <div className="w-full h-12 rounded bg-black/70 border border-purple-400/30 flex items-center px-3 relative overflow-hidden">
          {/* Scanner Archway */}
          <div
            className={`absolute left-[95px] top-0 bottom-0 w-8 border-x-2 transition-all duration-300 flex items-center justify-center z-10 ${scannerActive || isSorting
                ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                : 'border-slate-700 bg-slate-900/40'
              }`}
          >
            <div
              className={`w-0.5 h-full ${scannerActive || isSorting ? 'bg-cyan-300 animate-pulse shadow-[0_0_8px_#38bdf8]' : 'bg-slate-700'
                }`}
            />
          </div>

          {/* Moving Crate along track */}
          {isSorting ? (
            <div
              className="w-7 h-7 rounded border border-white flex items-center justify-center text-[8.5px] font-bold text-white shadow-lg relative z-20 transition-all duration-500 bg-cyan-600"
              style={{
                animation: 'm2CrateMotion 6.5s ease-in-out infinite',
              }}
            >
              <Wrench size={12} className="text-white" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-[8px] text-slate-400">
              <Package size={11} className="text-slate-500" />
            </div>
          )}
        </div>

        {/* Status Footer */}
        <div className="flex items-center justify-between text-[8px] font-mono text-purple-300">
          <span>SCANNER: {scannerActive || isSorting ? 'ONLINE' : 'STANDBY'}</span>
          <span className="text-emerald-400 font-bold">SORTED: {isSorting ? `${sortedCount}/20` : '0/20'}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Mercury Level 2 (The Conveyor Belt)
 * Dynamic Animation:
 * - Left: Repeat loop, Scan variable, and If condition are assembled.
 *   The Send crate to Equipment Belt block is dragged from Actions and snapped into the If branch.
 * - Right: Crate glides along the belt, scanner reads data, claw routes it into the Equipment chute!
 */
export function MercuryLevel2Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m2CrateMotion {
          0% { transform: translateX(0px); opacity: 0; }
          15% { transform: translateX(20px); opacity: 1; }
          45% { transform: translateX(75px); opacity: 1; }
          65%, 90% { transform: translateX(75px) translateY(-45px) scale(0.9); opacity: 0; }
          95%, 100% { transform: translateX(0px); opacity: 0; }
        }

        /* Drag Send to Belt Action (20% - 34%) */
        @keyframes m2s1DragRoute {
          0%, 18% {
            transform: translate(-65px, 30px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 30px) scale(1.04);
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
          }
          32% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          35%, 88% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 30px) scale(0.92);
            opacity: 0;
          }
        }

        @keyframes m2s1CursorMotion {
          0%, 12% { transform: translate(-80px, 45px); opacity: 0; }
          18% { transform: translate(-50px, 35px); opacity: 1; }
          22% { transform: translate(-50px, 35px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          40%, 46% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          52% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 45px); opacity: 0; }
        }

        @keyframes m2s1SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #10b981; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes m2s1TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes m2s1StatusIdle {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m2s1StatusSorting {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes m2s1SceneSorting {
          0%, 38% { opacity: 0; }
          42%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes m2s1SceneIdle {
          0%, 38% { opacity: 1; }
          42%, 88% { opacity: 0; }
          93%, 100% { opacity: 1; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury2ToolboxSidebar activeCategory="actions" />

          {/* Blockly Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Repeat 20 times */}
            <div className="h-6.5 w-[195px] bg-[#7C3AED] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Repeat</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-amber-300 font-mono">20</span>
              <span>times do:</span>
            </div>

            {/* Read X-Ray Scanner */}
            <div className="h-6 w-[187px] bg-[#0891B2] text-white text-[8.5px] font-bold px-2 ml-2 flex items-center shadow border-t border-black/20">
              <span>Read the X-Ray Scanner</span>
            </div>

            {/* If Scan reads Equipment */}
            <div className="h-6.5 w-[187px] bg-[#2563EB] text-white text-[8.5px] font-bold px-2 ml-2 flex items-center justify-between shadow border-t border-black/20">
              <span>If Scan reads:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-cyan-200 font-mono">Equipment ▾</span>
            </div>

            {/* Send to Equipment Belt: Blank dashed trace before snap */}
            <div className="relative w-[180px] ml-4">
              <div
                className="h-6 rounded border border-dashed border-emerald-500/40 bg-emerald-950/10"
                style={{ animation: 'm2s1TraceSlot 7.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Route Block */}
              <div
                className="absolute inset-0 h-6 bg-[#10B981] text-white text-[8.5px] font-bold px-2 rounded flex items-center justify-between shadow border-t border-black/20 z-30"
                style={{
                  animation: 'm2s1DragRoute 7.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m2s1SnapPulse 7.5s ease-in-out infinite',
                }}
              >
                <span>Send crate to:</span>
                <span className="bg-black/40 px-1 py-0.5 rounded text-[7.5px] text-emerald-200 font-mono">Equipment ▾</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm2s1CursorMotion 7.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Loop bottom cap */}
            <div className="h-4.5 w-[195px] bg-[#7C3AED] text-white text-[8px] font-bold px-2 rounded-b flex items-center border-t border-black/20 shadow border-b border-x border-purple-400/20">
              <span>End Loop</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 'm2s1StatusIdle 7.5s ease-in-out infinite' }}
            >
              CONVEYOR IDLE
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'm2s1StatusSorting 7.5s ease-in-out infinite' }}
            >
              CRATE SORTED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'm2s1SceneIdle 7.5s ease-in-out infinite' }}>
            <Mercury2ConveyorScene isSorting={false} scannerActive={false} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'm2s1SceneSorting 7.5s ease-in-out infinite' }}>
            <Mercury2ConveyorScene isSorting={true} scannerActive={true} activeChute="equipment" sortedCount={1} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Scan with Variables
 * Dynamic Animation:
 * - Left: Read X-Ray Scanner block is dragged from Variables and snapped inside Repeat 20 times loop
 * - Right: Scanner archway on the belt activates with pulsing cyan scanning beam
 */
export function MercuryLevel2Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Scan Block (20% - 35%) */
        @keyframes m2s2DragScan {
          0%, 18% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.04);
            box-shadow: 0 8px 24px rgba(8, 145, 178, 0.4);
          }
          32% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          35%, 88% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }

        @keyframes m2s2CursorMotion {
          0%, 14% { transform: translate(-75px, 35px); opacity: 0; }
          18% { transform: translate(-50px, 25px); opacity: 1; }
          22% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35%, 45% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          50% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-75px, 35px); opacity: 0; }
        }

        @keyframes m2s2SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #0891b2; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes m2s2TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes m2s2StatusOff {
          0%, 34% { opacity: 1; }
          38%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m2s2StatusActive {
          0%, 34% { opacity: 0; }
          38%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes m2s2SceneActive {
          0%, 35% { opacity: 0; }
          38%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes m2s2SceneOff {
          0%, 35% { opacity: 1; }
          38%, 88% { opacity: 0; }
          93%, 100% { opacity: 1; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury2ToolboxSidebar activeCategory="variables" />

          {/* Blockly Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Repeat 20 times */}
            <div className="h-7 w-[195px] bg-[#7C3AED] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Repeat</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-amber-300 font-mono">20</span>
              <span>times do:</span>
            </div>

            {/* Scan Variable Slot: Blank dashed trace before snap */}
            <div className="relative w-[187px] ml-2">
              <div
                className="h-6.5 rounded border border-dashed border-cyan-500/40 bg-cyan-950/10"
                style={{ animation: 'm2s2TraceSlot 6.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Scan Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#0891B2] text-white text-[9px] font-bold px-2 rounded flex items-center justify-between shadow border border-cyan-400/40 z-30"
                style={{
                  animation: 'm2s2DragScan 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m2s2SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Read X-Ray Scanner</span>
                <span className="bg-black/40 px-1 py-0.5 rounded text-[7.5px] text-cyan-200 font-mono">Scan</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm2s2CursorMotion 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Loop Bottom Cap */}
            <div className="h-5 w-[195px] bg-[#7C3AED] text-white text-[8.5px] font-bold px-2 rounded-b flex items-center border-t border-black/20 shadow border-b border-x border-purple-400/20">
              <span>End Loop</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-slate-400 drop-shadow-[0_0_6px_rgba(148,163,184,0.6)] whitespace-nowrap"
              style={{ animation: 'm2s2StatusOff 6.5s ease-in-out infinite' }}
            >
              SCANNER OFF
            </span>
            <span
              className="absolute right-0 text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'm2s2StatusActive 6.5s ease-in-out infinite' }}
            >
              X-RAY SCANNING
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'm2s2SceneOff 6.5s ease-in-out infinite' }}>
            <Mercury2ConveyorScene isSorting={false} scannerActive={false} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'm2s2SceneActive 6.5s ease-in-out infinite' }}>
            <Mercury2ConveyorScene isSorting={false} scannerActive={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Branch with If / Else
 * Dynamic Animation:
 * - Left: If Scan reads Equipment block is dragged from Logic category and snapped inside loop
 * - Right: Routing decision gate arms for Equipment, Organics, and Energy
 */
export function MercuryLevel2Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag If Block (20% - 35%) */
        @keyframes m2s3DragIf {
          0%, 18% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.04);
            box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
          }
          32% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          35%, 88% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }

        @keyframes m2s3CursorMotion {
          0%, 14% { transform: translate(-75px, 35px); opacity: 0; }
          18% { transform: translate(-50px, 25px); opacity: 1; }
          22% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35%, 45% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          50% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-75px, 35px); opacity: 0; }
        }

        @keyframes m2s3SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #2563eb; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes m2s3TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes m2s3StatusUnrouted {
          0%, 34% { opacity: 1; }
          38%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m2s3StatusArmed {
          0%, 34% { opacity: 0; }
          38%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes m2s3SceneArmed {
          0%, 35% { opacity: 0; }
          38%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes m2s3SceneUnrouted {
          0%, 35% { opacity: 1; }
          38%, 88% { opacity: 0; }
          93%, 100% { opacity: 1; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury2ToolboxSidebar activeCategory="logic" />

          {/* Blockly Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Repeat 20 times */}
            <div className="h-6.5 w-[195px] bg-[#7C3AED] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Repeat 20 times</span>
            </div>

            {/* Read X-Ray Scanner */}
            <div className="h-6 w-[187px] bg-[#0891B2] text-white text-[8.5px] font-bold px-2 ml-2 flex items-center shadow border-t border-black/20">
              <span>Read X-Ray Scanner</span>
            </div>

            {/* If Condition Slot: Blank dashed trace before snap */}
            <div className="relative w-[187px] ml-2">
              <div
                className="h-6.5 rounded border border-dashed border-blue-500/40 bg-blue-950/10"
                style={{ animation: 'm2s3TraceSlot 6.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged If Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#2563EB] text-white text-[8.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-blue-400/40 z-30"
                style={{
                  animation: 'm2s3DragIf 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m2s3SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>If Scan reads:</span>
                <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-cyan-200 font-mono">Equipment ▾</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm2s3CursorMotion 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Loop Bottom Cap */}
            <div className="h-5 w-[195px] bg-[#7C3AED] text-white text-[8.5px] font-bold px-2 rounded-b flex items-center border-t border-black/20 shadow border-b border-x border-purple-400/20">
              <span>End Loop</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 'm2s3StatusUnrouted 6.5s ease-in-out infinite' }}
            >
              UNROUTED
            </span>
            <span
              className="absolute right-0 text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'm2s3StatusArmed 6.5s ease-in-out infinite' }}
            >
              LOGIC ARMED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'm2s3SceneUnrouted 6.5s ease-in-out infinite' }}>
            <Mercury2ConveyorScene isSorting={false} scannerActive={false} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'm2s3SceneArmed 6.5s ease-in-out infinite' }}>
            <Mercury2ConveyorScene isSorting={false} scannerActive={true} activeChute="equipment" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Route Cargo to Belts
 * Dynamic Animation:
 * - Left: Send crate to Equipment Belt block is dragged from Actions and snapped into the If branch
 * - Right: All 20 crates sorted through chutes with full completion
 */
export function MercuryLevel2Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Route Block (20% - 35%) */
        @keyframes m2s4DragRoute {
          0%, 18% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.04);
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
          }
          32% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          35%, 88% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }

        @keyframes m2s4CursorMotion {
          0%, 14% { transform: translate(-75px, 35px); opacity: 0; }
          18% { transform: translate(-50px, 25px); opacity: 1; }
          22% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35%, 45% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          50% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-75px, 35px); opacity: 0; }
        }

        @keyframes m2s4SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #10b981; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes m2s4TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes m2s4StatusSorting {
          0%, 34% { opacity: 1; }
          38%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m2s4StatusComplete {
          0%, 34% { opacity: 0; }
          38%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes m2s4SceneComplete {
          0%, 35% { opacity: 0; }
          38%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes m2s4SceneSorting {
          0%, 35% { opacity: 1; }
          38%, 88% { opacity: 0; }
          93%, 100% { opacity: 1; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury2ToolboxSidebar activeCategory="actions" />

          {/* Blockly Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* If Condition Header */}
            <div className="h-6.5 w-[195px] bg-[#2563EB] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-blue-400/40">
              <span>If Scan reads:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-cyan-200 font-mono">Equipment ▾</span>
            </div>

            {/* Route Action Slot: Blank dashed trace before snap */}
            <div className="relative w-[187px] ml-2">
              <div
                className="h-6.5 rounded-b border border-dashed border-emerald-500/40 bg-emerald-950/10"
                style={{ animation: 'm2s4TraceSlot 6.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Route Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#10B981] text-white text-[8.5px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-emerald-400/40 border-t border-black/20 z-30"
                style={{
                  animation: 'm2s4DragRoute 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m2s4SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Send crate to:</span>
                <span className="bg-black/40 px-1 py-0.5 rounded text-[7.5px] text-emerald-200 font-mono">Equipment ▾</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm2s4CursorMotion 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 'm2s4StatusSorting 6.5s ease-in-out infinite' }}
            >
              SORTING
            </span>
            <span
              className="absolute right-0 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] font-bold whitespace-nowrap"
              style={{ animation: 'm2s4StatusComplete 6.5s ease-in-out infinite' }}
            >
              ALL 20 SORTED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'm2s4SceneSorting 6.5s ease-in-out infinite' }}>
            <Mercury2ConveyorScene isSorting={true} scannerActive={true} activeChute="equipment" sortedCount={14} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'm2s4SceneComplete 6.5s ease-in-out infinite' }}>
            <Mercury2ConveyorScene isSorting={true} scannerActive={true} activeChute="organics" sortedCount={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
