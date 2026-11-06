"use client";

import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

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

function Jupiter1ToolboxSidebar({ activeCategory = "variables" }: { activeCategory?: "variables" | "actions" }) {
  return (
    <div className="flex flex-col gap-1.5 w-18 shrink-0 py-1.5 select-none font-mono">
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
          activeCategory === "variables"
            ? "text-purple-300 bg-purple-950/80 border-purple-400"
            : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
        }`}
      >
        Variables
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
          activeCategory === "actions"
            ? "text-rose-300 bg-rose-950/80 border-rose-400"
            : "text-rose-400/60 bg-rose-950/30 border-rose-500/30"
        }`}
      >
        Actions
      </div>
    </div>
  );
}

/**
 * Authentic Jupiter Heavy Airlock Blast Gate Scene replicating JupiterLevel1Simulation.tsx
 */
function Jupiter1AirlockScene({
  isUnlocked = false,
  stringLockFilled = false,
  pinLockFilled = false,
  boolLockFilled = false,
}: {
  isUnlocked?: boolean;
  stringLockFilled?: boolean;
  pinLockFilled?: boolean;
  boolLockFilled?: boolean;
}) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#0f051c] select-none font-mono">
      {/* 1. Ceiling Mounted Siren Beacon */}
      <div className="w-full flex flex-col items-center shrink-0 z-30">
        <div className="w-full h-1.5 bg-[#1b0a2e] border-b border-purple-500/30" />
        <div className="w-10 h-3.5 bg-gradient-to-b from-black/60 to-transparent rounded-b-xl border-b border-x border-white/20 flex items-center justify-center shadow">
          <span
            className={`w-3.5 h-1.5 rounded-full transition-all duration-300 ${
              isUnlocked
                ? "bg-emerald-400 shadow-[0_0_12px_#22c55e]"
                : "bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse"
            }`}
          />
        </div>
      </div>

      {/* 2. Central Blast Gate Archway */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-3 min-h-0 my-auto">
        <div className="w-full max-w-[270px] h-[155px] rounded-2xl border-2 border-[#35135f] bg-[#090214] flex flex-col justify-between overflow-hidden shadow-2xl relative">
          {/* Top Marquee Status Bar */}
          <div className="h-5.5 bg-[#140626] border-b border-purple-900/50 flex items-center justify-center shrink-0 px-2">
            {isUnlocked ? (
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[8.5px] tracking-wider uppercase">
                <CheckCircle2 size={11} />
                <span>ACCESS GRANTED // AIRLOCK OPEN</span>
              </div>
            ) : (
              <span className="text-red-500 font-bold text-[8px] tracking-wider uppercase animate-pulse">
                ACCESS DENIED // 3 LOCKS ACTIVE
              </span>
            )}
          </div>

          {/* 3 Physical Security Locks on the Wall */}
          <div className="px-2 pt-1 grid grid-cols-3 gap-1 z-20">
            {/* String Lock */}
            <div
              className={`rounded p-1 border flex flex-col items-center text-center transition-all ${
                stringLockFilled
                  ? "bg-blue-950/60 border-blue-400 text-blue-200"
                  : "bg-black/50 border-white/10 text-gray-500"
              }`}
            >
              <span className="text-[6.5px] font-bold">STRING</span>
              <span className="text-[7.5px] font-black truncate max-w-[65px]">
                {stringLockFilled ? '"..."' : "LOCKED"}
              </span>
            </div>

            {/* PIN (int) Lock */}
            <div
              className={`rounded p-1 border flex flex-col items-center text-center transition-all ${
                pinLockFilled
                  ? "bg-emerald-950/60 border-emerald-400 text-emerald-200"
                  : "bg-black/50 border-white/10 text-gray-500"
              }`}
            >
              <span className="text-[6.5px] font-bold">PIN (INT)</span>
              <span className="text-[7.5px] font-black">
                {pinLockFilled ? "PIN OK" : "LOCKED"}
              </span>
            </div>

            {/* Boolean Lock */}
            <div
              className={`rounded p-1 border flex flex-col items-center text-center transition-all ${
                boolLockFilled
                  ? "bg-amber-950/60 border-amber-400 text-amber-200"
                  : "bg-black/50 border-white/10 text-gray-500"
              }`}
            >
              <span className="text-[6.5px] font-bold">BOOLEAN</span>
              <span className="text-[7.5px] font-black">
                {boolLockFilled ? "TRUE" : "LOCKED"}
              </span>
            </div>
          </div>

          {/* Main Blast Doors (Sliding Apart) */}
          <div className="relative flex-1 m-1.5 rounded-lg bg-[#070110] border border-purple-950/60 flex items-center justify-center overflow-hidden">
            {/* Deep Interior Corridor Revealed When Doors Slide Apart */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#18062f] to-[#05010a]">
              <div className="flex flex-col items-center gap-0.5">
                <Sparkles size={15} className="text-emerald-400 animate-pulse" />
                <span className="text-[7.5px] font-black text-emerald-300 uppercase tracking-widest">
                  AIRLOCK CLEARED
                </span>
              </div>
            </div>

            {/* Sliding Left & Right Heavy Steel Door Wings */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1/2 bg-[#250d3d] border-r-2 border-purple-500/50 flex flex-col justify-between py-1 px-1.5 transition-transform duration-700 ease-in-out shadow-lg ${
                isUnlocked ? "-translate-x-full" : "translate-x-0"
              }`}
            >
              <div className="w-full h-0.5 bg-white/20 rounded" />
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <div className="w-full h-0.5 bg-white/20 rounded" />
            </div>

            <div
              className={`absolute top-0 bottom-0 right-0 w-1/2 bg-[#250d3d] border-l-2 border-purple-500/50 flex flex-col justify-between py-1 px-1.5 transition-transform duration-700 ease-in-out shadow-lg ${
                isUnlocked ? "translate-x-full" : "translate-x-0"
              }`}
            >
              <div className="w-full h-0.5 bg-white/20 rounded ml-auto" />
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse ml-auto" />
              <div className="w-full h-0.5 bg-white/20 rounded ml-auto" />
            </div>
          </div>

          {/* Bottom Deck Treadplate */}
          <div className="h-2.5 bg-[#110424] border-t border-purple-900/40 flex items-center justify-between px-3">
            <span className="w-8 h-0.5 bg-purple-500/40 rounded" />
            <span className="w-8 h-0.5 bg-purple-500/40 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Jupiter Level 1 (Declaring Variables & Opening Airlock)
 * Dynamic Animation:
 * - Left: Variables and action blocks are in place. The final "unlock airlock doors" block is dragged from Actions and snapped into the blank slot.
 * - Right: Simulation blast doors slide open to reveal the pathway.
 */
export function JupiterLevel1Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Unlock Doors Action (20% - 34%) */
        @keyframes j1s1DragUnlock {
          0%, 18% {
            transform: translate(-65px, 30px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 30px) scale(1.04);
            box-shadow: 0 8px 24px rgba(244, 63, 94, 0.4);
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

        /* Cursor movements: grabs block, snaps, clicks */
        @keyframes j1s1CursorMotion {
          0%, 12% { transform: translate(-80px, 45px); opacity: 0; }
          18% { transform: translate(-50px, 35px); opacity: 1; }
          22% { transform: translate(-50px, 35px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          40%, 46% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          52% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 45px); opacity: 0; }
        }

        @keyframes j1s1SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #f43f5e; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes j1s1TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes j1s1StatusLocked {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes j1s1StatusUnlocked {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes j1s1SceneUnlocked {
          0%, 38% { opacity: 0; }
          42%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes j1s1SceneLocked {
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
          <Jupiter1ToolboxSidebar activeCategory="actions" />

          {/* Blockly Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* create [String] password = "..." */}
            <div className="h-7 w-[195px] bg-[#8B5CF6] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span className="font-mono">create</span>
              <span className="bg-[#2563EB] px-1 py-0.5 rounded text-[8px] font-bold">String</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-yellow-300 font-mono">password ▾</span>
              <span>=</span>
              <span className="bg-[#D946EF] px-1 py-0.5 rounded text-[8px] font-mono text-white">&quot;...&quot;</span>
            </div>

            {/* create [int] pin = 0 */}
            <div className="h-6.5 w-[195px] bg-[#8B5CF6] text-white text-[9px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span className="font-mono">create</span>
              <span className="bg-[#10B981] px-1 py-0.5 rounded text-[8px] font-bold">int</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-yellow-300 font-mono">pin ▾</span>
              <span>=</span>
              <span className="bg-[#10B981] px-1.5 py-0.5 rounded text-[8px] font-mono text-white">0</span>
            </div>

            {/* enter [password ▾] into [String Lock ▾] */}
            <div className="h-6.5 w-[195px] bg-[#EC4899] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>enter</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-yellow-300 font-mono">password ▾</span>
              <span>into</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-cyan-200">String Lock ▾</span>
            </div>

            {/* Unlock Doors Slot: Blank dashed trace before snap */}
            <div className="relative w-[195px]">
              <div
                className="h-7 rounded-b border border-dashed border-rose-500/40 bg-rose-950/10"
                style={{ animation: 'j1s1TraceSlot 7.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Unlock Block */}
              <div
                className="absolute inset-0 h-7 bg-[#F43F5E] text-white text-[9px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-rose-400/40 border-t border-black/20 z-30"
                style={{
                  animation: 'j1s1DragUnlock 7.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, j1s1SnapPulse 7.5s ease-in-out infinite',
                }}
              >
                <span>unlock airlock doors</span>
                <span className="bg-black/40 text-[7.5px] px-1 py-0.5 rounded text-rose-200 font-mono">Open</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'j1s1CursorMotion 7.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
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
              style={{ animation: 'j1s1StatusLocked 7.5s ease-in-out infinite' }}
            >
              DOORS LOCKED
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'j1s1StatusUnlocked 7.5s ease-in-out infinite' }}
            >
              ACCESS GRANTED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'j1s1SceneLocked 7.5s ease-in-out infinite' }}>
            <Jupiter1AirlockScene isUnlocked={false} stringLockFilled={true} pinLockFilled={true} boolLockFilled={true} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'j1s1SceneUnlocked 7.5s ease-in-out infinite' }}>
            <Jupiter1AirlockScene isUnlocked={true} stringLockFilled={true} pinLockFilled={true} boolLockFilled={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Declaring Variables with Box Types (String, int, boolean)
 * Dynamic Animation:
 * - Left: create [String] password block is dragged from Variables category and snapped into workspace blank trace slot
 * - Right: Simulation String lock on the station wall powers up from offline to ready
 */
export function JupiterLevel1Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Variable Declare Block (20% - 35%) */
        @keyframes j1s2DragVar {
          0%, 18% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.04);
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
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

        @keyframes j1s2CursorMotion {
          0%, 14% { transform: translate(-75px, 35px); opacity: 0; }
          18% { transform: translate(-50px, 25px); opacity: 1; }
          22% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35%, 45% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          50% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-75px, 35px); opacity: 0; }
        }

        @keyframes j1s2SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #8b5cf6; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes j1s2TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes j1s2StatusOffline {
          0%, 34% { opacity: 1; }
          38%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes j1s2StatusReady {
          0%, 34% { opacity: 0; }
          38%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes j1s2SceneReady {
          0%, 35% { opacity: 0; }
          38%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes j1s2SceneOffline {
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
          <Jupiter1ToolboxSidebar activeCategory="variables" />

          {/* Blank dashed trace slot before snap */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            <div className="relative w-[195px]">
              <div
                className="h-7 rounded border border-dashed border-purple-500/40 bg-purple-950/10"
                style={{ animation: 'j1s2TraceSlot 6.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Variable Block */}
              <div
                className="absolute inset-0 h-7 bg-[#8B5CF6] text-white text-[9px] font-bold px-2 rounded flex items-center justify-between shadow border border-purple-400/40 z-30"
                style={{
                  animation: 'j1s2DragVar 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, j1s2SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span className="font-mono">create</span>
                <span className="bg-[#2563EB] px-1 py-0.5 rounded text-[8px] font-bold">String</span>
                <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-yellow-300 font-mono">password ▾</span>
                <span>=</span>
                <span className="bg-[#D946EF] px-1 py-0.5 rounded text-[8px] font-mono text-white">&quot;...&quot;</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'j1s2CursorMotion 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
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
              className="text-slate-400 drop-shadow-[0_0_6px_rgba(148,163,184,0.6)] whitespace-nowrap"
              style={{ animation: 'j1s2StatusOffline 6.5s ease-in-out infinite' }}
            >
              STANDBY
            </span>
            <span
              className="absolute right-0 text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'j1s2StatusReady 6.5s ease-in-out infinite' }}
            >
              VARIABLE DECLARED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'j1s2SceneOffline 6.5s ease-in-out infinite' }}>
            <Jupiter1AirlockScene isUnlocked={false} stringLockFilled={false} pinLockFilled={false} boolLockFilled={false} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'j1s2SceneReady 6.5s ease-in-out infinite' }}>
            <Jupiter1AirlockScene isUnlocked={false} stringLockFilled={true} pinLockFilled={false} boolLockFilled={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Entering Variables into Lock Slots
 * Dynamic Animation:
 * - Left: enter [password] into [String Lock] block is dragged from Actions and snapped below variable
 * - Right: Simulation String lock disengages from locked red to unlocked blue
 */
export function JupiterLevel1Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Enter Code Action (20% - 35%) */
        @keyframes j1s3DragEnter {
          0%, 18% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.04);
            box-shadow: 0 8px 24px rgba(236, 72, 153, 0.4);
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

        @keyframes j1s3CursorMotion {
          0%, 14% { transform: translate(-75px, 35px); opacity: 0; }
          18% { transform: translate(-50px, 25px); opacity: 1; }
          22% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35%, 45% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          50% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-75px, 35px); opacity: 0; }
        }

        @keyframes j1s3SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #ec4899; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes j1s3TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes j1s3StatusAwaiting {
          0%, 34% { opacity: 1; }
          38%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes j1s3StatusDisengaged {
          0%, 34% { opacity: 0; }
          38%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes j1s3SceneDisengaged {
          0%, 35% { opacity: 0; }
          38%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes j1s3SceneAwaiting {
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
          <Jupiter1ToolboxSidebar activeCategory="actions" />

          {/* Blockly Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* create [String] password = "..." */}
            <div className="h-7 w-[195px] bg-[#8B5CF6] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span className="font-mono">create</span>
              <span className="bg-[#2563EB] px-1 py-0.5 rounded text-[8px] font-bold">String</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-yellow-300 font-mono">password ▾</span>
              <span>=</span>
              <span className="bg-[#D946EF] px-1 py-0.5 rounded text-[8px] font-mono text-white">&quot;...&quot;</span>
            </div>

            {/* Enter Code Slot: Blank dashed trace before snap */}
            <div className="relative w-[195px]">
              <div
                className="h-7 rounded-b border border-dashed border-pink-500/40 bg-pink-950/10"
                style={{ animation: 'j1s3TraceSlot 6.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Enter Code Block */}
              <div
                className="absolute inset-0 h-7 bg-[#EC4899] text-white text-[9px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-pink-400/40 border-t border-black/20 z-30"
                style={{
                  animation: 'j1s3DragEnter 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, j1s3SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>enter</span>
                <span className="bg-black/50 px-1 py-0.5 rounded text-yellow-300 font-mono">password ▾</span>
                <span>into</span>
                <span className="bg-black/50 px-1 py-0.5 rounded text-cyan-200">String Lock ▾</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'j1s3CursorMotion 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
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
              style={{ animation: 'j1s3StatusAwaiting 6.5s ease-in-out infinite' }}
            >
              AWAITING CODE
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'j1s3StatusDisengaged 6.5s ease-in-out infinite' }}
            >
              LOCK DISENGAGED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'j1s3SceneAwaiting 6.5s ease-in-out infinite' }}>
            <Jupiter1AirlockScene isUnlocked={false} stringLockFilled={false} pinLockFilled={false} boolLockFilled={false} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'j1s3SceneDisengaged 6.5s ease-in-out infinite' }}>
            <Jupiter1AirlockScene isUnlocked={false} stringLockFilled={true} pinLockFilled={false} boolLockFilled={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Commanding Airlock to Unlock
 * Dynamic Animation:
 * - Left: unlock airlock doors block is dragged from Actions and snapped to the end of the stack
 * - Right: Simulation airlock blast doors slide apart, opening the pathway
 */
export function JupiterLevel1Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Unlock Action (20% - 35%) */
        @keyframes j1s4DragUnlock {
          0%, 18% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.04);
            box-shadow: 0 8px 24px rgba(244, 63, 94, 0.4);
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

        @keyframes j1s4CursorMotion {
          0%, 14% { transform: translate(-75px, 35px); opacity: 0; }
          18% { transform: translate(-50px, 25px); opacity: 1; }
          22% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          40%, 46% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          52% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-75px, 35px); opacity: 0; }
        }

        @keyframes j1s4SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #f43f5e; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes j1s4TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes j1s4StatusLocked {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes j1s4StatusOpen {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes j1s4SceneOpen {
          0%, 38% { opacity: 0; }
          42%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes j1s4SceneLocked {
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
          <Jupiter1ToolboxSidebar activeCategory="actions" />

          {/* Blockly Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* create [String] password = "..." */}
            <div className="h-6.5 w-[195px] bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span className="font-mono">create</span>
              <span className="bg-[#2563EB] px-1 py-0.5 rounded text-[7.5px] font-bold">String</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-yellow-300 font-mono">password ▾</span>
              <span>=</span>
              <span className="bg-[#D946EF] px-1 py-0.5 rounded text-[8px] font-mono text-white">&quot;...&quot;</span>
            </div>

            {/* enter [password ▾] into [String Lock ▾] */}
            <div className="h-6.5 w-[195px] bg-[#EC4899] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>enter</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-yellow-300 font-mono">password ▾</span>
              <span>into</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-cyan-200">String Lock ▾</span>
            </div>

            {/* Unlock Doors Slot: Blank dashed trace before snap */}
            <div className="relative w-[195px]">
              <div
                className="h-7 rounded-b border border-dashed border-rose-500/40 bg-rose-950/10"
                style={{ animation: 'j1s4TraceSlot 6.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Unlock Block */}
              <div
                className="absolute inset-0 h-7 bg-[#F43F5E] text-white text-[9px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-rose-400/40 border-t border-black/20 z-30"
                style={{
                  animation: 'j1s4DragUnlock 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, j1s4SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>unlock airlock doors</span>
                <span className="bg-black/40 text-[7.5px] px-1 py-0.5 rounded text-rose-200 font-mono">Open</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'j1s4CursorMotion 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
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
              style={{ animation: 'j1s4StatusLocked 6.5s ease-in-out infinite' }}
            >
              DOORS LOCKED
            </span>
            <span
              className="absolute right-0 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] font-bold whitespace-nowrap"
              style={{ animation: 'j1s4StatusOpen 6.5s ease-in-out infinite' }}
            >
              AIRLOCK OPEN
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'j1s4SceneLocked 6.5s ease-in-out infinite' }}>
            <Jupiter1AirlockScene isUnlocked={false} stringLockFilled={true} pinLockFilled={true} boolLockFilled={true} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'j1s4SceneOpen 6.5s ease-in-out infinite' }}>
            <Jupiter1AirlockScene isUnlocked={true} stringLockFilled={true} pinLockFilled={true} boolLockFilled={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
