"use client";

import React from 'react';
import { Cpu, Zap, RotateCcw, AlertTriangle, Play } from 'lucide-react';

function CursorPointer({ className = "" }: { className?: string }) {
  return (
    <svg
      width="30"
      height="30"
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

function Saturn3ToolboxSidebar({ activeCategory = "subsystems" }: { activeCategory?: "event" | "subsystems" | "memory" | "logic" }) {
  return (
    <div className="flex flex-col gap-1.5 w-18 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "event"
          ? "text-red-300 bg-red-950/80 border-red-400"
          : "text-red-400/60 bg-red-950/30 border-red-500/30"
      }`}>
        Event
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "subsystems"
          ? "text-purple-300 bg-purple-950/80 border-purple-400"
          : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
      }`}>
        Subsystems
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "memory"
          ? "text-emerald-300 bg-emerald-950/80 border-emerald-400"
          : "text-emerald-400/60 bg-emerald-950/30 border-emerald-500/30"
      }`}>
        Memory
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "logic"
          ? "text-blue-300 bg-blue-950/80 border-blue-400"
          : "text-blue-400/60 bg-blue-950/30 border-blue-500/30"
      }`}>
        Logic
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Saturn Level 3 (A Leak in the System! - Pointers & Heap Recycling)
 */
export function SaturnLevel3Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s3s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes s3s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes s3s1CoresTransfer {
          0%, 30% { transform: scale(1); filter: drop-shadow(0 0 5px #10b981); }
          50%, 85% { transform: scale(1.05); filter: drop-shadow(0 0 15px #10b981); }
          95%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px #10b981); }
        }
      `}</style>

      {/* LEFT PANE: Actual Blockly Blocks from Toolbox */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2 flex flex-row gap-2 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Saturn3ToolboxSidebar activeCategory="subsystems" />

          {/* Actual Blockly Stack: saturn3_start, cpp_pointer_declare, cpp_memory_new, cpp_run_task, cpp_memory_delete, saturn3_end */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Start */}
            <div className="h-6 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start</span>
            </div>

            {/* Ready Arm for [Sensors ▾] */}
            <div className="h-6 bg-[#6366F1] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Ready Arm for</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>
            </div>

            {/* Grab [2] Cores for [Sensors ▾] */}
            <div className="h-6 bg-[#10B981] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Grab</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-white font-mono font-bold">2</span>
              <span>Cores for</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>
            </div>

            {/* Run Subsystem: [Sensors ▾] */}
            <div className="h-6 bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Run Subsystem:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>
            </div>

            {/* Return Cores for [Sensors ▾] */}
            <div className="h-6 bg-[#F97316] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Return Cores for</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>
            </div>

            {/* End */}
            <div className="h-6 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Core Energy Rack & Pointer Allocation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 's3s1Ready 7s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 's3s1Running 7s ease-in-out infinite' }}>CORE ALLOCATED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#061012]">
          <div className="w-full max-w-[260px] h-[160px] rounded-xl border border-cyan-500/40 bg-[#0a1e22] p-2.5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1">
              <span className="text-[8.5px] font-mono text-cyan-300 font-bold">HEAP ENERGY RACK</span>
              <span className="text-[8.5px] font-mono text-emerald-400 font-bold">AVAILABLE: 4 CORES</span>
            </div>

            {/* 4 Energy Cores Display */}
            <div className="flex items-center justify-around py-1">
              {[1, 2, 3, 4].map((core) => (
                <div
                  key={core}
                  className="w-10 h-10 rounded-lg bg-black/60 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                  style={{ animation: 's3s1CoresTransfer 7s ease-in-out infinite' }}
                >
                  <Zap size={14} className="text-emerald-300" />
                  <span className="text-[6.5px] font-mono font-bold text-white">C{core}</span>
                </div>
              ))}
            </div>

            {/* Subsystem Allocation Monitor */}
            <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-cyan-500/30 text-[8px] font-mono">
              <span className="text-cyan-300 font-bold">Sensors: 2 Cores</span>
              <span className="text-emerald-300">Debris: 3 Cores</span>
              <span className="text-indigo-300">Shields: 2 Cores</span>
            </div>

            <span className="text-[7.5px] font-mono text-center text-cyan-200/80">
              Grab cores with 'new', run subsystem, and return cores with 'delete' to avoid leaks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Freeing Memory with Delete
 */
export function SaturnLevel3Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s3s2Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
      `}</style>

      {/* LEFT PANE */}
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
          <Saturn3ToolboxSidebar activeCategory="memory" />

          {/* Snapping Return Cores */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#8B5CF6] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Run Subsystem:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>
            </div>

            <div className="h-7 bg-[#F97316] text-white text-[9px] font-bold px-2 rounded-b flex items-center justify-between shadow border-t border-black/20">
              <span>Return Cores for</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>

              <div
                className="absolute right-4 -bottom-3 pointer-events-none z-30"
                style={{ animation: 's3s2Cursor 6s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <span className="text-orange-400 text-[9px] font-mono font-bold">RECYCLING CORES</span>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#061012]">
          <div className="w-full max-w-[260px] rounded-xl border border-orange-500/40 bg-[#161208] p-3 flex flex-col gap-2 shadow-xl">
            <span className="text-[9px] font-mono text-orange-300 font-bold uppercase tracking-wider">Heap Core Rule</span>
            <div className="flex flex-col gap-1.5 text-[9px] font-mono">
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-emerald-500/40">
                <span className="text-emerald-300 font-bold">new Core(N)</span>
                <span className="text-slate-300">Borrows N cores from rack</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-orange-500/40">
                <span className="text-orange-300 font-bold">delete ptr</span>
                <span className="text-slate-300">Returns cores so rack refuels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Running Core Subsystems
 * Authentic block: cpp_run_task for Sensors, Debris, Shield
 */
export function SaturnLevel3Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s3s3Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes s3s3Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #8B5CF6; box-shadow: 0 0 16px rgba(139,92,246,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #8B5CF6; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
      `}</style>

      {/* LEFT PANE */}
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
          <Saturn3ToolboxSidebar activeCategory="subsystems" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Grab Cores */}
            <div className="h-6 bg-[#10B981] text-white text-[8.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-emerald-400/40">
              <span>Grab 2 Cores for Sensors</span>
            </div>

            {/* Run Subsystem - Clicked */}
            <div
              className="relative h-7 bg-[#8B5CF6] text-white text-[9px] font-bold px-2 rounded-b flex items-center justify-between shadow border-t border-black/20 z-20"
              style={{ animation: 's3s3Pulse 6s ease-in-out infinite' }}
            >
              <span>Run Subsystem:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>

              <div
                className="absolute right-3 -bottom-3 pointer-events-none z-30"
                style={{ animation: 's3s3Cursor 6s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <span className="text-purple-400 text-[9px] font-mono font-bold">CORE EXECUTION</span>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#061012]">
          <div className="w-full max-w-[260px] rounded-xl border border-purple-500/40 bg-[#120822] p-3 flex flex-col gap-2 shadow-xl">
            <span className="text-[9px] font-mono text-purple-300 font-bold uppercase tracking-wider">Subsystem Processing</span>

            <div className="flex justify-around items-center py-1">
              <div className="text-center p-1.5 rounded bg-black/60 border border-cyan-400">
                <Cpu size={14} className="text-cyan-300 mx-auto" />
                <span className="text-[7px] font-mono text-cyan-200 block mt-0.5">Sensors</span>
              </div>
              <div className="text-center p-1.5 rounded bg-black/60 border border-amber-400">
                <Zap size={14} className="text-amber-300 mx-auto" />
                <span className="text-[7px] font-mono text-amber-200 block mt-0.5">Debris</span>
              </div>
              <div className="text-center p-1.5 rounded bg-black/60 border border-emerald-400">
                <RotateCcw size={14} className="text-emerald-300 mx-auto" />
                <span className="text-[7px] font-mono text-emerald-200 block mt-0.5">Shield</span>
              </div>
            </div>

            <span className="text-[8px] font-mono text-center text-purple-200/80">
              Each subsystem consumes cores while executing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Freeing Heap & Finishing Cleanly
 * Authentic blocks: cpp_memory_delete + saturn3_end
 */
export function SaturnLevel3Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s3s4Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes s3s4Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #EF4444; box-shadow: 0 0 16px rgba(239,68,68,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #EF4444; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
      `}</style>

      {/* LEFT PANE */}
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
          <Saturn3ToolboxSidebar activeCategory="event" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Run Subsystem */}
            <div className="h-6 bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-purple-400/40">
              <span>Run Subsystems</span>
            </div>

            {/* Return Cores */}
            <div className="h-6 bg-[#F97316] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Return Cores (delete)</span>
            </div>

            {/* End Program - Clicked */}
            <div
              className="relative h-7 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-red-400/40 border-t border-black/20 z-20"
              style={{ animation: 's3s4Pulse 6s ease-in-out infinite' }}
            >
              <span>End</span>

              <div
                className="absolute right-3 -bottom-3 pointer-events-none z-30"
                style={{ animation: 's3s4Cursor 6s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <span className="text-emerald-400 text-[9px] font-mono font-bold">HEAP CLEAN</span>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#061012]">
          <div className="w-full max-w-[260px] rounded-xl border border-emerald-500/40 bg-[#06180e] p-3 flex flex-col gap-2 shadow-xl">
            <span className="text-[9px] font-mono text-emerald-300 font-bold uppercase tracking-wider">Zero Memory Leak</span>

            <div className="w-full py-2 rounded bg-black/60 border border-emerald-400/40 text-center font-mono text-[9.5px] text-emerald-300 font-bold">
              Memory recycled: 4/4 cores available
            </div>

            <span className="text-[8px] font-mono text-center text-emerald-200/80">
              Always delete dynamically allocated cores to avoid crash
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
