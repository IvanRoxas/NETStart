"use client";

import React from 'react';
import { Zap, Cpu, Check } from 'lucide-react';

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
 * Authentic Core Energy Rack & Heap Stage
 */
function HeapEnergyRackStage({
  coresAvailable = 4,
  coresBorrowed = 0,
  activeSubsystem = "None",
  isExecuting = false,
  statusMessage = "Heap memory ready for allocation",
}: {
  coresAvailable?: number;
  coresBorrowed?: number;
  activeSubsystem?: string;
  isExecuting?: boolean;
  statusMessage?: string;
}) {
  return (
    <div className="w-full max-w-[260px] h-[160px] rounded-xl border border-cyan-500/40 bg-[#0a1e22] p-2.5 flex flex-col justify-between shadow-2xl relative overflow-hidden font-mono select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1 shrink-0">
        <span className="text-[8.5px] text-cyan-300 font-bold">HEAP ENERGY RACK</span>
        <span className={`text-[8.5px] font-bold ${coresAvailable === 4 ? 'text-emerald-400' : 'text-amber-400'}`}>
          AVAILABLE: {coresAvailable}/4 CORES
        </span>
      </div>

      {/* 4 Energy Cores Display */}
      <div className="flex items-center justify-around py-1">
        {[1, 2, 3, 4].map((core) => {
          const isBorrowed = core > coresAvailable;
          return (
            <div
              key={core}
              className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
                isBorrowed
                  ? "bg-purple-950/40 border border-dashed border-purple-500/40 opacity-40"
                  : "bg-black/60 border-2 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
              }`}
            >
              <Zap size={14} className={isBorrowed ? "text-purple-400/40" : "text-emerald-300"} />
              <span className={`text-[6.5px] font-bold ${isBorrowed ? 'text-slate-500' : 'text-white'}`}>
                C{core}
              </span>
            </div>
          );
        })}
      </div>

      {/* Subsystem Allocation Monitor */}
      <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-cyan-500/30 text-[8px]">
        <div className="flex items-center gap-1">
          <Cpu size={10} className={isExecuting ? "text-cyan-400 animate-pulse" : "text-slate-400"} />
          <span className="text-cyan-300 font-bold">Active: {activeSubsystem}</span>
        </div>
        <span className={coresBorrowed > 0 ? "text-amber-300 font-bold" : "text-emerald-400 font-bold"}>
          {coresBorrowed > 0 ? `${coresBorrowed} Cores Borrowed` : "Heap Free"}
        </span>
      </div>

      <span className="text-[7.5px] text-center text-cyan-200/80 truncate">
        {statusMessage}
      </span>
    </div>
  );
}

/**
 * Slide 1: The Arm Pointer Lifecycle (Start to Pointer Setup)
 * Dynamic Animation:
 * - Left: "Ready Arm for [Sensors ▾]" is dragged from Subsystems toolbox and snapped under Start
 * - Right: Robotic arm aligns to Sensors pointer channel
 */
export function SaturnLevel3Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s3s1DragArm {
          0%, 14% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.03);
          }
          34% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          38%, 86% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }
        @keyframes s3s1CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s3s1SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #6366f1; box-shadow: 0 0 16px rgba(99,102,241,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s3s1TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s3s1StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s3s1StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s3s1SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s3s1SceneLive {
          0%, 36% { opacity: 0; pointer-events: none; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; pointer-events: none; }
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
          <Saturn3ToolboxSidebar activeCategory="subsystems" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start</span>
            </div>

            {/* Arm Pointer Slot: Blank dashed outline before snap */}
            <div className="relative w-full">
              <div
                className="h-6.5 rounded border border-dashed border-indigo-500/40 bg-indigo-950/10"
                style={{ animation: 's3s1TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Arm Pointer Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#6366F1] text-white text-[8.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-indigo-400/40 z-30"
                style={{
                  animation: 's3s1DragArm 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s3s1SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>Ready Arm for</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's3s1CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* End Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[125px] h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 's3s1StatusStandby 7s ease-in-out infinite' }}
            >
              STANDBY
            </span>
            <span
              className="absolute right-0 text-[#818cf8] drop-shadow-[0_0_6px_rgba(129,140,248,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's3s1StatusLive 7s ease-in-out infinite' }}
            >
              ARM READY
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#061012]">
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's3s1SceneStandby 7s ease-in-out infinite' }}>
            <HeapEnergyRackStage coresAvailable={4} coresBorrowed={0} activeSubsystem="None" isExecuting={false} statusMessage="Awaiting pointer initialization..." />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's3s1SceneLive 7s ease-in-out infinite' }}>
            <HeapEnergyRackStage coresAvailable={4} coresBorrowed={0} activeSubsystem="Sensors" isExecuting={false} statusMessage="Arm aligned to sensorPtr -> Ready to grab cores" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Allocating Cores with 'new'
 * Dynamic Animation:
 * - Left: "Grab [2] Cores for [Sensors ▾]" is dragged from Memory toolbox and snapped under Ready Arm
 * - Right: 2 cores are borrowed from the Heap Rack and allocated to the Sensors task
 */
export function SaturnLevel3Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s3s2DragGrab {
          0%, 14% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.03);
          }
          34% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          38%, 86% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }
        @keyframes s3s2CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s3s2SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #10b981; box-shadow: 0 0 16px rgba(16,185,129,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s3s2TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s3s2StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s3s2StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s3s2SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s3s2SceneLive {
          0%, 36% { opacity: 0; pointer-events: none; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; pointer-events: none; }
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
          <Saturn3ToolboxSidebar activeCategory="memory" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start</span>
            </div>

            {/* Ready Arm */}
            <div className="h-6.5 bg-[#6366F1] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Ready Arm for</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>
            </div>

            {/* Grab Cores Slot: Blank dashed outline before snap */}
            <div className="relative w-full">
              <div
                className="h-6.5 rounded border border-dashed border-emerald-500/40 bg-emerald-950/10"
                style={{ animation: 's3s2TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Grab Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#10B981] text-white text-[8.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-emerald-400/40 z-30"
                style={{
                  animation: 's3s2DragGrab 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s3s2SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>Grab</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-white font-mono font-bold">2</span>
                <span>Cores for</span>
                <span className="bg-black/50 px-1 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's3s2CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* End Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[125px] h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 's3s2StatusStandby 7s ease-in-out infinite' }}
            >
              WAITING CORES
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's3s2StatusLive 7s ease-in-out infinite' }}
            >
              CORES ALLOCATED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#061012]">
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's3s2SceneStandby 7s ease-in-out infinite' }}>
            <HeapEnergyRackStage coresAvailable={4} coresBorrowed={0} activeSubsystem="Sensors" isExecuting={false} statusMessage="Sensors awaiting core allocation..." />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's3s2SceneLive 7s ease-in-out infinite' }}>
            <HeapEnergyRackStage coresAvailable={2} coresBorrowed={2} activeSubsystem="Sensors" isExecuting={false} statusMessage="new Core(2): 2 cores borrowed from heap rack" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Executing the Subsystem Task
 * Dynamic Animation:
 * - Left: "Run Subsystem: [Sensors ▾]" is dragged from Subsystems toolbox and snapped under Grab Cores
 * - Right: Sensors subsystem executes; planetary radar scans area
 */
export function SaturnLevel3Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s3s3DragRun {
          0%, 14% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.03);
          }
          34% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          38%, 86% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }
        @keyframes s3s3CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s3s3SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #8b5cf6; box-shadow: 0 0 16px rgba(139,92,246,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s3s3TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s3s3StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s3s3StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s3s3SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s3s3SceneLive {
          0%, 36% { opacity: 0; pointer-events: none; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; pointer-events: none; }
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
          <Saturn3ToolboxSidebar activeCategory="subsystems" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start</span>
            </div>

            {/* Ready Arm */}
            <div className="h-6 bg-[#6366F1] text-white text-[8px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Ready Arm for</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>
            </div>

            {/* Grab Cores */}
            <div className="h-6 bg-[#10B981] text-white text-[8px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Grab 2 Cores for</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>
            </div>

            {/* Run Subsystem Slot: Blank dashed outline before snap */}
            <div className="relative w-full">
              <div
                className="h-6.5 rounded border border-dashed border-purple-500/40 bg-purple-950/10"
                style={{ animation: 's3s3TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Run Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-purple-400/40 z-30"
                style={{
                  animation: 's3s3DragRun 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s3s3SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>Run Subsystem:</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's3s3CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* End Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[125px] h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 's3s3StatusStandby 7s ease-in-out infinite' }}
            >
              READY TO RUN
            </span>
            <span
              className="absolute right-0 text-[#c084fc] drop-shadow-[0_0_6px_rgba(192,132,252,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's3s3StatusLive 7s ease-in-out infinite' }}
            >
              TASK EXECUTING
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#061012]">
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's3s3SceneStandby 7s ease-in-out infinite' }}>
            <HeapEnergyRackStage coresAvailable={2} coresBorrowed={2} activeSubsystem="Sensors" isExecuting={false} statusMessage="Cores loaded -> Awaiting run command" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's3s3SceneLive 7s ease-in-out infinite' }}>
            <HeapEnergyRackStage coresAvailable={2} coresBorrowed={2} activeSubsystem="Sensors" isExecuting={true} statusMessage="runSensors() active: Radar telemetry scanning" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Freeing Memory with 'delete' (Zero Memory Leaks)
 * Dynamic Animation:
 * - Left: "Return Cores for [Sensors ▾]" is dragged and snapped under Run Subsystem
 * - Right: Cores return to Heap Rack; 4/4 cores restored, zero memory leaks!
 */
export function SaturnLevel3Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s3s4DragReturn {
          0%, 14% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.03);
          }
          34% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          38%, 86% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }
        @keyframes s3s4CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s3s4SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #f97316; box-shadow: 0 0 16px rgba(249,115,22,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s3s4TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s3s4StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s3s4StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s3s4SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s3s4SceneLive {
          0%, 36% { opacity: 0; pointer-events: none; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; pointer-events: none; }
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
          <Saturn3ToolboxSidebar activeCategory="memory" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start</span>
            </div>

            {/* Ready Arm */}
            <div className="h-6 bg-[#6366F1] text-white text-[8px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Ready Arm for Sensors</span>
            </div>

            {/* Grab Cores */}
            <div className="h-6 bg-[#10B981] text-white text-[8px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Grab 2 Cores for Sensors</span>
            </div>

            {/* Run Subsystem */}
            <div className="h-6 bg-[#8B5CF6] text-white text-[8px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Run Subsystem: Sensors</span>
            </div>

            {/* Return Cores Slot: Blank dashed outline before snap */}
            <div className="relative w-full">
              <div
                className="h-6.5 rounded border border-dashed border-orange-500/40 bg-orange-950/10"
                style={{ animation: 's3s4TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Return Cores Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#F97316] text-white text-[8.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-orange-400/40 z-30"
                style={{
                  animation: 's3s4DragReturn 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s3s4SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>Return Cores for</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-cyan-200 font-mono">Sensors ▾</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's3s4CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* End Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[130px] h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 's3s4StatusStandby 7s ease-in-out infinite' }}
            >
              CORES IN USE
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's3s4StatusLive 7s ease-in-out infinite' }}
            >
              ZERO MEMORY LEAK
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#061012]">
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's3s4SceneStandby 7s ease-in-out infinite' }}>
            <HeapEnergyRackStage coresAvailable={2} coresBorrowed={2} activeSubsystem="Sensors" isExecuting={false} statusMessage="Sensors task done -> Cores still locked in heap" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's3s4SceneLive 7s ease-in-out infinite' }}>
            <HeapEnergyRackStage coresAvailable={4} coresBorrowed={0} activeSubsystem="None" isExecuting={false} statusMessage="delete sensorPtr -> All 4 cores recycled safely" />
          </div>
        </div>
      </div>
    </div>
  );
}
