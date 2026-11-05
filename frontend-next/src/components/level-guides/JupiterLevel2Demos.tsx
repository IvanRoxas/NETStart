"use client";

import React from 'react';
import { ShieldAlert, ShieldCheck, Play, Server, Zap } from 'lucide-react';

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

function Jupiter2ToolboxSidebar({ activeCategory = "stream" }: { activeCategory?: "stream" | "rules" | "actions" }) {
  return (
    <div className="flex flex-col gap-1.5 w-20 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "stream"
          ? "text-emerald-300 bg-emerald-950/80 border-emerald-400"
          : "text-emerald-400/60 bg-emerald-950/30 border-emerald-500/30"
        }`}>
        Data Stream
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "rules"
          ? "text-blue-300 bg-blue-950/80 border-blue-400"
          : "text-blue-400/60 bg-blue-950/30 border-blue-500/30"
        }`}>
        Error Rules
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "actions"
          ? "text-amber-300 bg-amber-950/80 border-amber-400"
          : "text-amber-400/60 bg-amber-950/30 border-amber-500/30"
        }`}>
        Actions
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Jupiter Level 2 (Full Try/Catch Defense Pipeline)
 */
export function JupiterLevel2Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes j2s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes j2s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes j2s1PacketMove {
          0%, 25% { transform: translateX(0); opacity: 1; }
          60% { transform: translateX(70px); opacity: 1; }
          85%, 100% { transform: translateX(130px); opacity: 0; }
        }
        @keyframes j2s1WallIntercept {
          0%, 45% { transform: scale(0.8); opacity: 0; }
          50%, 88% { transform: scale(1); opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes j2s1LaserBeam {
          0%, 50% { opacity: 0; width: 0; }
          55%, 75% { opacity: 1; width: 65px; }
          80%, 100% { opacity: 0; }
        }
      `}</style>

      {/* LEFT PANE: Actual Blockly Blocks from Toolbox */}
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
          <Jupiter2ToolboxSidebar activeCategory="stream" />

          {/* Actual Blockly Stack: java_try_wrapper, java_start_data_stream, java_catch_block, java_action_pill, java_finally_block */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Try Wrapper Top Header */}
            <div className="h-7 bg-[#2563EB] text-white text-[10.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-blue-400/40">
              <span>Try Running:</span>
            </div>

            {/* Nested inside Try Body: Start Data Stream */}
            <div className="h-7 bg-[#10B981] text-white text-[10px] font-bold px-2 ml-3 flex items-center gap-1.5 shadow border-l-2 border-emerald-300">
              <Play size={10} className="fill-white" />
              <span>Start Data Stream</span>
            </div>

            {/* Try Wrapper Middle Divider: unless: */}
            <div className="h-6 bg-[#2563EB] text-white text-[10px] font-bold px-2 flex items-center shadow">
              <span>unless:</span>
            </div>

            {/* Catch Block 1: When [Missing Value v] occurs: */}
            <div className="h-7 bg-[#6366F1] text-white text-[10px] font-bold px-2 ml-2 flex items-center justify-between shadow border-t border-black/20">
              <span className="font-mono">When</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[9px] text-yellow-300 font-mono font-bold truncate max-w-[95px]">Missing Value ▾</span>
              <span>occurs:</span>
            </div>

            {/* Action inside Catch 1: Quarantine with Wall */}
            <div className="h-6 bg-[#FF912D] text-slate-950 text-[9.5px] font-black px-2 ml-5 flex items-center justify-between shadow">
              <span>Quarantine with Wall ▾</span>
            </div>

            {/* Catch Block 2: When [Divide by Zero v] occurs: */}
            <div className="h-7 bg-[#6366F1] text-white text-[10px] font-bold px-2 ml-2 flex items-center justify-between shadow border-t border-black/20">
              <span className="font-mono">When</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[9px] text-fuchsia-300 font-mono font-bold truncate max-w-[95px]">Divide by Zero ▾</span>
              <span>occurs:</span>
            </div>

            {/* Action inside Catch 2: Recalibrate with Gun Turret */}
            <div className="h-6 bg-[#FF912D] text-slate-950 text-[9.5px] font-black px-2 ml-5 flex items-center justify-between shadow">
              <span>Recalibrate with Gun ▾</span>
            </div>

            {/* Default Finally Block: Default: Accept Data */}
            <div className="h-6 bg-[#FF912D] text-slate-950 text-[9.5px] font-black px-2 ml-2 rounded-b flex items-center justify-between shadow border-b border-x border-amber-300/40">
              <span>Default: Accept Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation Rail Matching JupiterLevel2Simulation.tsx */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'j2s1Ready 7s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'j2s1Running 7s ease-in-out infinite' }}>STREAM DEFENSE</span>
          </div>
        </div>

        {/* Defense Grid Stream Rail */}
        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#08020f]">
          <div className="w-full max-w-[270px] h-[160px] rounded-xl border border-purple-500/30 bg-[#120622] p-2.5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            {/* Header Status Bar */}
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-1 z-10">
              <span className="text-[8.5px] font-mono text-purple-300 font-bold">GRID DEFENSE // WAVE 1</span>
              <span className="text-[8.5px] font-mono text-emerald-400 font-bold">CORE: 100%</span>
            </div>

            {/* Conveyor Rail Track */}
            <div className="relative w-full h-14 bg-black/60 rounded-lg border border-purple-500/30 flex items-center px-2 overflow-hidden">
              {/* Rail center guidelines */}
              <div className="absolute inset-x-0 h-0.5 bg-purple-500/20 top-1/2 -translate-y-1/2" />

              {/* Data Entity: NULL_SESSION (Missing Value) */}
              <div
                className="absolute left-2 flex items-center gap-1.5 z-20"
                style={{ animation: 'j2s1PacketMove 7s linear infinite' }}
              >
                <div className="w-8 h-8 rounded-lg border-2 border-dashed border-red-500 bg-red-950/80 shadow-[0_0_10px_#ef4444] flex flex-col items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="font-mono text-[7px] font-black text-red-200">NULL</span>
                </div>
              </div>

              {/* Defense Counter: Quarantine Wall deployed */}
              <div
                className="absolute left-24 w-2.5 h-10 rounded bg-cyan-400 border border-white shadow-[0_0_12px_#22d3ee] z-30"
                style={{ animation: 'j2s1WallIntercept 7s ease-in-out infinite' }}
              />

              {/* Target Server Core on the right */}
              <div className="absolute right-2 w-10 h-10 rounded-lg bg-emerald-950/80 border-2 border-emerald-400 flex flex-col items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.5)] z-10">
                <Server size={14} className="text-emerald-300" />
                <span className="text-[6.5px] font-mono font-bold text-emerald-200">SERVER</span>
              </div>
            </div>

            {/* Bottom Status Feed */}
            <div className="w-full flex items-center justify-between text-[8px] font-mono text-slate-400 px-1">
              <span>Trap: Missing Value</span>
              <span className="text-cyan-300 font-bold">Action: Quarantine Wall</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Adding Error Catch Rules
 */
export function JupiterLevel2Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes j2s2Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes j2s2Highlight {
          0%, 30% { border-color: rgba(99, 102, 241, 0.4); }
          35%, 85% { border-color: #f59e0b; box-shadow: 0 0 15px rgba(245, 158, 11, 0.6); }
          90%, 100% { border-color: rgba(99, 102, 241, 0.4); }
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
          <Jupiter2ToolboxSidebar activeCategory="rules" />

          {/* Snapping When [error v] occurs into unless: */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#2563EB] text-white text-[10.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-blue-400/40">
              <span>Try Running:</span>
            </div>

            <div className="h-7 bg-[#10B981] text-white text-[10px] font-bold px-2 ml-3 flex items-center gap-1.5 shadow border-l-2 border-emerald-300">
              <Play size={10} className="fill-white" />
              <span>Start Data Stream</span>
            </div>

            <div className="h-6 bg-[#2563EB] text-white text-[10px] font-bold px-2 flex items-center shadow">
              <span>unless:</span>
            </div>

            {/* Targeted Catch Block being configured */}
            <div
              className="h-7 bg-[#6366F1] text-white text-[10px] font-bold px-2 ml-2 rounded-b flex items-center justify-between shadow border-2"
              style={{ animation: 'j2s2Highlight 6s ease-in-out infinite' }}
            >
              <span className="font-mono">When</span>
              <span className="bg-black/60 px-1.5 py-0.5 rounded text-[9px] text-yellow-300 font-mono font-bold">Missing Value ▾</span>
              <span>occurs:</span>

              <div
                className="absolute right-4 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'j2s2Cursor 6s ease-in-out infinite' }}
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
          <span className="text-emerald-400 text-[9px] font-mono font-bold">SELECTING RULE</span>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#08020f]">
          <div className="w-full max-w-[260px] rounded-xl border border-indigo-500/40 bg-[#120622] p-3 flex flex-col gap-2.5 shadow-xl">
            <span className="text-[9px] font-mono text-indigo-300 font-bold uppercase tracking-wider">Error Types Match Guide</span>

            <div className="flex flex-col gap-1.5 text-[9px] font-mono">
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-red-500/40 text-red-300">
                <span>Missing Value</span>
                <span className="text-slate-400">NullPointer</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-fuchsia-500/40 text-fuchsia-300">
                <span>Divide by Zero</span>
                <span className="text-slate-400">Arithmetic</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-amber-500/40 text-amber-300">
                <span>Invalid Number</span>
                <span className="text-slate-400">NumberFormat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Defense Actions (Wall vs Laser)
 * Authentic block: java_action_pill (Quarantine with Wall / Vaporize with Laser)
 */
export function JupiterLevel2Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes j2s3Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes j2s3Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #FF912D; box-shadow: 0 0 16px rgba(255,145,45,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #FF912D; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes j2s3WallDeploy {
          0%, 30% { transform: scale(0.5); opacity: 0; }
          40%, 88% { transform: scale(1); opacity: 1; }
          95%, 100% { transform: scale(0.5); opacity: 0; }
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
          <Jupiter2ToolboxSidebar activeCategory="actions" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Catch Block */}
            <div className="h-7 bg-[#6366F1] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-indigo-400/40">
              <span className="font-mono">When</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-yellow-300 font-mono">Missing Value ▾</span>
              <span>occurs:</span>
            </div>

            {/* Action 1: Quarantine with Wall - Clicked */}
            <div
              className="relative h-7 bg-[#FF912D] text-slate-950 text-[9px] font-black px-2 ml-3 flex items-center justify-between shadow border-t border-black/20 z-20"
              style={{ animation: 'j2s3Pulse 6s ease-in-out infinite' }}
            >
              <span>Action:</span>
              <span className="bg-black/60 px-1.5 py-0.5 rounded text-[8.5px] text-amber-200 font-mono">Quarantine with Wall ▾</span>

              <div
                className="absolute right-3 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'j2s3Cursor 6s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>

            {/* Action 2: Vaporize with Laser */}
            <div className="h-6 bg-[#FF912D] text-slate-950 text-[9px] font-black px-2 ml-3 rounded-b flex items-center justify-between shadow border-t border-black/20 border-b border-x border-amber-500/30">
              <span>Action:</span>
              <span className="bg-black/60 px-1.5 py-0.5 rounded text-[8.5px] text-amber-200 font-mono">Vaporize Laser ▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <span className="text-amber-400 text-[9px] font-mono font-bold">DEFENSE ACTIVE</span>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#08020f]">
          <div className="w-full max-w-[260px] rounded-xl border border-amber-500/40 bg-[#150702] p-3 flex flex-col gap-2 shadow-xl">
            <span className="text-[9px] font-mono text-amber-300 font-bold uppercase tracking-wider">Turret Defenses</span>

            <div className="flex justify-around items-center py-2">
              <div
                className="w-20 h-14 rounded-lg bg-black/60 border border-amber-400/50 flex flex-col items-center justify-center text-center transition-all"
                style={{ animation: 'j2s3WallDeploy 6s ease-in-out infinite' }}
              >
                <ShieldAlert size={16} className="text-amber-400" />
                <span className="text-[7.5px] font-mono text-amber-200 mt-1">Barrier Wall</span>
              </div>
              <div className="w-20 h-14 rounded-lg bg-black/60 border border-cyan-400/50 flex flex-col items-center justify-center text-center">
                <Zap size={16} className="text-cyan-400" />
                <span className="text-[7.5px] font-mono text-cyan-200 mt-1">Defense Laser</span>
              </div>
            </div>

            <span className="text-[8px] font-mono text-center text-amber-200/80">
              Barrier walls block corrupted packets without crashing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Default Finally Block
 * Authentic block: java_finally_block
 */
export function JupiterLevel2Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes j2s4Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes j2s4Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #10B981; box-shadow: 0 0 16px rgba(16,185,129,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #10B981; }
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
          <Jupiter2ToolboxSidebar activeCategory="stream" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Try */}
            <div className="h-6 bg-[#2563EB] text-white text-[9px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-blue-400/40">
              <span>Try Running: Start Data Stream</span>
            </div>

            {/* Catch */}
            <div className="h-6 bg-[#6366F1] text-white text-[9px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span>Catch Errors & Defend</span>
            </div>

            {/* Finally Wrapper - Clicked */}
            <div
              className="relative h-7 bg-[#10B981] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center justify-between shadow border-t border-black/20 border-b border-x border-emerald-400/40 z-20"
              style={{ animation: 'j2s4Pulse 6s ease-in-out infinite' }}
            >
              <span>Always at end do:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-emerald-200 font-mono">Close Grid ▾</span>

              <div
                className="absolute right-3 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'j2s4Cursor 6s ease-in-out infinite' }}
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
          <span className="text-emerald-400 text-[9px] font-mono font-bold">STREAM SECURED</span>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#08020f]">
          <div className="w-full max-w-[260px] rounded-xl border border-emerald-500/40 bg-[#061e12] p-3 flex flex-col gap-2 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1">
              <span className="text-[9px] font-mono text-emerald-300 font-bold uppercase tracking-wider">FINALLY BLOCK</span>
              <ShieldCheck size={12} className="text-emerald-400" />
            </div>

            <div className="w-full py-2 rounded bg-black/60 border border-emerald-400/40 text-center font-mono text-[9.5px] text-emerald-300 font-bold">
              Clean shutdown executed every run
            </div>

            <span className="text-[8px] font-mono text-center text-emerald-200/80">
              The finally block runs whether an error was caught or not
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
