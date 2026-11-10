"use client";

import React from 'react';
import { Zap, Cpu, Shield, AlertTriangle } from 'lucide-react';

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
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "event"
          ? "text-red-300 bg-red-950/80 border-red-400"
          : "text-red-400/60 bg-red-950/30 border-red-500/30"
        }`}>
        Event
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "subsystems"
          ? "text-purple-300 bg-purple-950/80 border-purple-400"
          : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
        }`}>
        Subsystems
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "memory"
          ? "text-emerald-300 bg-emerald-950/80 border-emerald-400"
          : "text-emerald-400/60 bg-emerald-950/30 border-emerald-500/30"
        }`}>
        Memory
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "logic"
          ? "text-blue-300 bg-blue-950/80 border-blue-400"
          : "text-blue-400/60 bg-blue-950/30 border-blue-500/30"
        }`}>
        Logic
      </div>
    </div>
  );
}

/**
 * 1-to-1 Authentic Reproduction of ProcessingBayCanvas.tsx (Saturn Level 3)
 * Features:
 * - Upper clerestory observation window overlooking deep space & Saturn ring curve
 * - Overhead telemetry HUD header with RAM PRESSURE gauge bar & warning siren
 * - Left: Heap Bay with 4 energy core sockets (C1, C2, C3, C4) & glowing batteries
 * - Center: Overhead crane rail & robotic crane arm
 * - Right: Mainframe Subsystem Bay (Sensors, Debris, Shields)
 */
function Saturn3ProcessingBayScene({
  coresAvailable = 4,
  coresInMainframe = 0,
  activeArmSubsystem = "None",
  isTaskExecuting = false,
  cranePosition = "heap", // 'heap' | 'center' | 'mainframe'
  statusText = "Awaiting instructions...",
}: {
  coresAvailable?: number;
  coresInMainframe?: number;
  activeArmSubsystem?: string;
  isTaskExecuting?: boolean;
  cranePosition?: "heap" | "center" | "mainframe";
  statusText?: string;
}) {
  const ramPressure = coresInMainframe * 25;

  return (
    <div className="relative w-full h-full bg-[#0c121e] overflow-hidden select-none font-mono flex flex-col justify-between border-2 border-[#1b273b]">
      {/* 1. Overhead Telemetry HUD Header */}
      <div className="w-full h-6 px-2.5 flex items-center justify-between border-b border-[#1c2a40] bg-[#090f1a]/95 z-20 shrink-0 text-[8px] tracking-wider uppercase backdrop-blur-md">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#22d3ee]" />
          <span className="text-gray-300 font-bold">CORE PROCESSING BAY</span>
        </div>

        {/* Live RAM Pressure Gauge Bar */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 text-[7.5px]">
            <span className="text-gray-400 font-bold">RAM:</span>
            <span className={`font-extrabold ${ramPressure > 50 ? 'text-amber-400' : 'text-cyan-300'}`}>
              {ramPressure}%
            </span>
          </div>

          <div className="w-16 h-1.5 rounded-full bg-black/80 border border-gray-700/80 relative overflow-hidden flex items-center shadow-inner">
            <div
              style={{ width: `${ramPressure}%` }}
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_6px_#10b981] transition-all duration-500"
            />
          </div>

          {/* Warning Siren Indicator */}
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
        </div>
      </div>

      {/* 2. Background Observation Window & Bulkhead Wall */}
      <div className="relative flex-1 w-full min-h-0 flex flex-col justify-between overflow-hidden">
        {/* Clerestory Observation Window (Top 45%) */}
        <div className="relative w-full h-[62px] border-b-2 border-[#202e44] bg-[#070d1c] overflow-hidden shrink-0">
          {/* Deep Space void & stars */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#050a18] via-[#0a1228] to-[#120d26]" />
          <div className="absolute top-1 right-8 w-28 h-12 rounded-full bg-purple-600/20 blur-xl pointer-events-none" />
          <div className="absolute bottom-1 left-8 w-32 h-10 rounded-full bg-cyan-500/15 blur-xl pointer-events-none" />

          {/* Curved Saturn Ring Rim */}
          <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 800 135" preserveAspectRatio="none">
            <defs>
              <linearGradient id="s3SaturnRingGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                <stop offset="40%" stopColor="#c084fc" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <path d="M -50 150 Q 400 55 850 150" fill="none" stroke="url(#s3SaturnRingGrad)" strokeWidth="6" />
            <path d="M -50 145 Q 400 60 850 145" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          </svg>

          {/* Window Dividing Strut */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 bg-[#141e2e] border-x border-black/60 shadow" />
        </div>

        {/* Overhead Crane Rail across center */}
        <div className="relative w-full h-3 bg-[#162133] border-y border-[#2a3c5a] flex items-center px-2 z-15 shadow-sm">
          <div className="w-full h-0.5 bg-black/60 border-t border-cyan-400/30" />
          {/* Robotic Crane Arm Trolley */}
          <div
            className={`absolute top-0 bottom-0 w-7 rounded bg-cyan-500/80 border border-white/60 shadow-[0_0_8px_#38bdf8] flex items-center justify-center transition-all duration-700 ${cranePosition === "heap"
                ? "left-[20%]"
                : cranePosition === "mainframe"
                  ? "left-[72%]"
                  : "left-[46%]"
              }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_#fff]" />
          </div>
        </div>

        {/* 3. Machine Floor Deck: Heap Bay (Left) vs Mainframe Bay (Right) */}
        <div className="relative flex-1 w-full flex items-center justify-between px-3 py-1 bg-gradient-to-b from-[#0f1726] to-[#070b14] z-10">
          {/* HEAP BAY (Left) */}
          <div className="w-[42%] h-full rounded-lg border border-cyan-500/40 bg-[#0a1624]/90 p-1.5 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between border-b border-cyan-500/25 pb-0.5">
              <span className="text-[7.5px] font-bold text-cyan-300">HEAP BAY</span>
              <span className="text-[7px] font-bold text-emerald-400">{coresAvailable}/4 CORES</span>
            </div>

            {/* 4 Core Sockets */}
            <div className="grid grid-cols-4 gap-1 py-1">
              {[1, 2, 3, 4].map((core) => {
                const isLoaded = core <= coresAvailable;
                return (
                  <div
                    key={core}
                    className={`h-7 rounded flex flex-col items-center justify-center border transition-all duration-300 ${isLoaded
                        ? "bg-black/60 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                        : "bg-purple-950/20 border-dashed border-purple-500/30 opacity-30"
                      }`}
                  >
                    <Zap size={10} className={isLoaded ? "text-emerald-300" : "text-slate-600"} />
                    <span className={`text-[5.5px] font-bold ${isLoaded ? 'text-white' : 'text-slate-500'}`}>
                      C{core}
                    </span>
                  </div>
                );
              })}
            </div>

            <span className="text-[6.5px] text-slate-400 truncate text-center">
              Dynamic Core Pool (new / delete)
            </span>
          </div>

          {/* MAINFRAME BAY (Right) */}
          <div className="w-[54%] h-full rounded-lg border border-purple-500/40 bg-[#140b22]/90 p-1.5 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between border-b border-purple-500/25 pb-0.5">
              <span className="text-[7.5px] font-bold text-purple-300">MAINFRAME CORES</span>
              <span className="text-[7px] font-bold text-cyan-300">ARM: {activeArmSubsystem}</span>
            </div>

            {/* 3 Subsystem Sockets (Sensors, Debris, Shields) */}
            <div className="grid grid-cols-3 gap-1 py-1">
              {/* Sensors Socket */}
              <div
                className={`h-7 rounded border p-0.5 flex flex-col items-center justify-center transition-all ${coresInMainframe > 0
                    ? "bg-cyan-950/80 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                    : "bg-black/40 border-slate-700/60 opacity-60"
                  }`}
              >
                <Cpu size={9} className={isTaskExecuting ? "text-cyan-300 animate-pulse" : "text-cyan-400"} />
                <span className="text-[6px] text-cyan-200 font-bold">Sensors</span>
                <span className="text-[5px] text-slate-300 font-mono">
                  {coresInMainframe > 0 ? "2 CORES" : "IDLE"}
                </span>
              </div>

              {/* Debris Socket */}
              <div className="h-7 rounded border border-slate-700/60 bg-black/40 opacity-60 flex flex-col items-center justify-center">
                <Zap size={9} className="text-purple-400" />
                <span className="text-[6px] text-purple-200 font-bold">Debris</span>
                <span className="text-[5px] text-slate-400 font-mono">IDLE</span>
              </div>

              {/* Shields Socket */}
              <div className="h-7 rounded border border-slate-700/60 bg-black/40 opacity-60 flex flex-col items-center justify-center">
                <Shield size={9} className="text-emerald-400" />
                <span className="text-[6px] text-emerald-200 font-bold">Shields</span>
                <span className="text-[5px] text-slate-400 font-mono">IDLE</span>
              </div>
            </div>

            <span className="text-[6.5px] text-purple-200/80 truncate text-center">
              {statusText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1: The Arm Pointer Lifecycle (Start to Pointer Setup)
 * Dynamic Animation:
 * - Left: "Ready Arm for [Sensors ▾]" is dragged and snapped under Start!
 * - Right: Robotic crane arm moves over to the Sensors subsystem channel
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

            {/* Arm Pointer Slot: Blank dashed outline under Start */}
            <div className="relative w-full">
              <div
                className="h-6.5 border border-dashed border-indigo-500/40 bg-indigo-950/10"
                style={{ animation: 's3s1TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Arm Pointer Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#6366F1] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20 z-30"
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

      {/* RIGHT PANE: Authentic Processing Bay Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[130px] shrink-0 h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
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

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 's3s1SceneStandby 7s ease-in-out infinite' }}>
            <Saturn3ProcessingBayScene coresAvailable={4} coresInMainframe={0} activeArmSubsystem="None" cranePosition="heap" statusText="Awaiting pointer initialization..." />
          </div>
          <div className="absolute inset-0" style={{ animation: 's3s1SceneLive 7s ease-in-out infinite' }}>
            <Saturn3ProcessingBayScene coresAvailable={4} coresInMainframe={0} activeArmSubsystem="Sensors" cranePosition="center" statusText="sensorPtr initialized for Sensors" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Allocating Cores with 'new'
 * Dynamic Animation:
 * - Left: "Grab [2] Cores for [Sensors ▾]" is dragged and snapped under Ready Arm
 * - Right: Robotic crane arm transfers 2 cores from Heap Bay to Mainframe
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
                className="h-6.5 border border-dashed border-emerald-500/40 bg-emerald-950/10"
                style={{ animation: 's3s2TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Grab Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#10B981] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20 z-30"
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

      {/* RIGHT PANE: Authentic Simulation Stage */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[130px] shrink-0 h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
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

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 's3s2SceneStandby 7s ease-in-out infinite' }}>
            <Saturn3ProcessingBayScene coresAvailable={4} coresInMainframe={0} activeArmSubsystem="Sensors" cranePosition="heap" statusText="Sensors awaiting core allocation..." />
          </div>
          <div className="absolute inset-0" style={{ animation: 's3s2SceneLive 7s ease-in-out infinite' }}>
            <Saturn3ProcessingBayScene coresAvailable={2} coresInMainframe={2} activeArmSubsystem="Sensors" cranePosition="mainframe" statusText="new Core(2) -> Cores loaded into Sensors" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Executing the Subsystem Task
 * Dynamic Animation:
 * - Left: "Run Subsystem: [Sensors ▾]" is dragged and snapped under Grab Cores
 * - Right: Sensors radar spins and emits telemetry pulse waves
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
                className="h-6.5 border border-dashed border-purple-500/40 bg-purple-950/10"
                style={{ animation: 's3s3TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Run Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20 z-30"
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

      {/* RIGHT PANE: Authentic Simulation Stage */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[130px] shrink-0 h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
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

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 's3s3SceneStandby 7s ease-in-out infinite' }}>
            <Saturn3ProcessingBayScene coresAvailable={2} coresInMainframe={2} activeArmSubsystem="Sensors" cranePosition="mainframe" isTaskExecuting={false} statusText="Cores loaded -> Awaiting run command" />
          </div>
          <div className="absolute inset-0" style={{ animation: 's3s3SceneLive 7s ease-in-out infinite' }}>
            <Saturn3ProcessingBayScene coresAvailable={2} coresInMainframe={2} activeArmSubsystem="Sensors" cranePosition="mainframe" isTaskExecuting={true} statusText="runSensors() active: Telemetry scanning" />
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
 * - Right: Cores return to Heap Bay; all 4 cores restored, zero memory leaks!
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
                className="h-6.5 border border-dashed border-orange-500/40 bg-orange-950/10"
                style={{ animation: 's3s4TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Return Cores Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#F97316] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20 z-30"
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

      {/* RIGHT PANE: Authentic Simulation Stage */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[130px] shrink-0 h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
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

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 's3s4SceneStandby 7s ease-in-out infinite' }}>
            <Saturn3ProcessingBayScene coresAvailable={2} coresInMainframe={2} activeArmSubsystem="Sensors" cranePosition="mainframe" statusText="Sensors done -> Cores held in memory" />
          </div>
          <div className="absolute inset-0" style={{ animation: 's3s4SceneLive 7s ease-in-out infinite' }}>
            <Saturn3ProcessingBayScene coresAvailable={4} coresInMainframe={0} activeArmSubsystem="None" cranePosition="heap" statusText="delete sensorPtr -> 4/4 cores recycled" />
          </div>
        </div>
      </div>
    </div>
  );
}
