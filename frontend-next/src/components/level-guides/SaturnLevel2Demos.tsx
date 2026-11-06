"use client";

import React from 'react';
import { Shield, Orbit } from 'lucide-react';

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

function Saturn2ToolboxSidebar({ activeCategory = "events" }: { activeCategory?: "events" | "functions" | "cases" | "actions" }) {
  return (
    <div className="flex flex-col gap-1.5 w-18 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "events"
          ? "text-red-300 bg-red-950/80 border-red-400"
          : "text-red-400/60 bg-red-950/30 border-red-500/30"
      }`}>
        Events
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "functions"
          ? "text-purple-300 bg-purple-950/80 border-purple-400"
          : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
      }`}>
        Functions
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "cases"
          ? "text-blue-300 bg-blue-950/80 border-blue-400"
          : "text-blue-400/60 bg-blue-950/30 border-blue-500/30"
      }`}>
        Cases
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "actions"
          ? "text-pink-300 bg-pink-950/80 border-pink-400"
          : "text-pink-400/60 bg-pink-950/30 border-pink-500/30"
      }`}>
        Actions
      </div>
    </div>
  );
}

/**
 * Stage simulating Saturn Ring Router Canvas
 */
function SaturnRingStage({
  isOnline = true,
  ring1Active = false,
  shieldActive = false,
  statusText = "Route debris into matching orbit rings",
}: {
  isOnline?: boolean;
  ring1Active?: boolean;
  shieldActive?: boolean;
  statusText?: string;
}) {
  return (
    <div className="w-full max-w-[260px] h-[160px] rounded-xl border border-purple-500/30 bg-[#140624] p-2.5 flex flex-col justify-between shadow-2xl relative overflow-hidden font-mono select-none">
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-1 shrink-0">
        <span className="text-[8.5px] text-purple-300 font-bold">SATURN RING ROUTER</span>
        <Orbit size={12} className={isOnline ? "text-cyan-400 animate-spin" : "text-slate-500"} style={{ animationDuration: '10s' }} />
      </div>

      {/* Ring Canvas */}
      <div className="relative w-full h-20 flex items-center justify-center overflow-hidden">
        {/* Saturn Core */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 shadow-[0_0_15px_rgba(245,158,11,0.6)] z-10" />

        {/* Orbit Ring 1 (Ice) */}
        <div
          className={`absolute w-24 h-12 rounded-[100%] border transition-all duration-500 ${
            ring1Active
              ? "border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)] scale-105"
              : "border-cyan-400/30"
          }`}
        />

        {/* Orbit Ring 2 (Rock) */}
        <div className="absolute w-32 h-16 rounded-[100%] border border-amber-500/40" />

        {/* Orbit Ring 3 (Mineral) */}
        <div className="absolute w-40 h-20 rounded-[100%] border border-slate-500/30" />

        {/* Shield Barrier Bubble */}
        {shieldActive && (
          <div className="absolute w-28 h-28 rounded-full border-2 border-blue-400 bg-blue-500/20 shadow-[0_0_20px_#38bdf8] flex items-center justify-center animate-pulse z-20">
            <Shield size={20} className="text-blue-300" />
          </div>
        )}

        {/* Debris particle when active */}
        {ring1Active && (
          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee] z-20"
            style={{
              animation: 's2DebrisOrbit 4s linear infinite',
            }}
          />
        )}
      </div>

      <span className="text-[7.5px] text-center text-purple-200/80 truncate">
        {statusText}
      </span>
    </div>
  );
}

/**
 * Slide 1: Jumpstarting the Rings (Function Prototype & Program Foundation)
 * Dynamic Animation:
 * - Left: "Declare Function: Route to Orbit" is dragged and snapped at the top of the stack
 * - Right: Ring Router boots online and initializes orbital tracking
 */
export function SaturnLevel2Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s2DebrisOrbit {
          from { transform: rotate(0deg) translateX(48px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(48px) rotate(-360deg); }
        }
        @keyframes s2s1DragProto {
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
        @keyframes s2s1CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s2s1SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #8b5cf6; box-shadow: 0 0 16px rgba(139,92,246,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s2s1TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s2s1StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s1StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s2s1SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s1SceneLive {
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
          <Saturn2ToolboxSidebar activeCategory="functions" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Function Prototype Slot: Blank dashed outline before snap */}
            <div className="relative w-full">
              <div
                className="h-6.5 rounded-t border border-dashed border-purple-500/40 bg-purple-950/10"
                style={{ animation: 's2s1TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Prototype Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40 z-30"
                style={{
                  animation: 's2s1DragProto 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s2s1SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span className="truncate">Declare Function: Route to Orbit</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's2s1CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Start Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span>Start</span>
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
              style={{ animation: 's2s1StatusStandby 7s ease-in-out infinite' }}
            >
              STANDBY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's2s1StatusLive 7s ease-in-out infinite' }}
            >
              ROUTER ONLINE
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#080314]">
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's2s1SceneStandby 7s ease-in-out infinite' }}>
            <SaturnRingStage isOnline={false} ring1Active={false} statusText="Awaiting function prototypes..." />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's2s1SceneLive 7s ease-in-out infinite' }}>
            <SaturnRingStage isOnline={true} ring1Active={false} statusText="Prototypes loaded: routeToOrbit() ready" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Case Situation Handlers (Switch-Case Matching)
 * Dynamic Animation:
 * - Left: "Case [Ice Debris ▾]:" is dragged from the Cases toolbox and snapped into the switch body
 * - Right: Ingestion radar locks onto approaching ice debris and evaluates case match
 */
export function SaturnLevel2Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s2s2DragCase {
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
        @keyframes s2s2CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s2s2SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #3b82f6; box-shadow: 0 0 16px rgba(59,130,246,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s2s2TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s2s2StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s2StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s2s2SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s2SceneLive {
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
          <Saturn2ToolboxSidebar activeCategory="cases" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start</span>
            </div>

            {/* Case Slot: Blank dashed outline before snap */}
            <div className="relative w-full">
              <div
                className="h-12 rounded border border-dashed border-blue-500/40 bg-blue-950/10"
                style={{ animation: 's2s2TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Case Block */}
              <div
                className="absolute inset-0 h-12 bg-[#3B82F6] text-white text-[9px] font-bold p-1 rounded flex flex-col justify-between shadow border border-blue-400/40 z-30"
                style={{
                  animation: 's2s2DragCase 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s2s2SnapPulse 7s ease-in-out infinite',
                }}
              >
                <div className="flex items-center justify-between">
                  <span>Case</span>
                  <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-cyan-200 font-mono">Ice Debris ▾</span>
                  <span>:</span>
                </div>
                <div className="h-4 ml-2.5 rounded bg-black/40 border border-blue-300/30 flex items-center px-1 text-[7px] text-blue-200">
                  <span className="italic">drop action block here</span>
                </div>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's2s2CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
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
              style={{ animation: 's2s2StatusStandby 7s ease-in-out infinite' }}
            >
              SCANNING
            </span>
            <span
              className="absolute right-0 text-[#60a5fa] drop-shadow-[0_0_6px_rgba(96,165,250,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's2s2StatusLive 7s ease-in-out infinite' }}
            >
              CASE MATCHED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#080314]">
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's2s2SceneStandby 7s ease-in-out infinite' }}>
            <SaturnRingStage isOnline={true} ring1Active={false} statusText="Scanning approaching debris field..." />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's2s2SceneLive 7s ease-in-out infinite' }}>
            <SaturnRingStage isOnline={true} ring1Active={false} statusText="Detected: ICE DEBRIS -> Matching case ObjectType::ICE" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Connecting Route Action to Orbit Ring
 * Dynamic Animation:
 * - Left: "Route to [Orbit 1 ▾]" is dragged and snapped inside the Case block mouth
 * - Right: Debris enters chute and Orbit Ring 1 spins into stable resonance
 */
export function SaturnLevel2Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s2DebrisOrbit {
          from { transform: rotate(0deg) translateX(48px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(48px) rotate(-360deg); }
        }
        @keyframes s2s3DragRoute {
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
        @keyframes s2s3CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s2s3SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #ec4899; box-shadow: 0 0 16px rgba(236,72,153,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s2s3TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s2s3StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s3StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s2s3SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s3SceneLive {
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
          <Saturn2ToolboxSidebar activeCategory="actions" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start</span>
            </div>

            {/* Case Header */}
            <div className="h-6.5 bg-[#3B82F6] text-white text-[9px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Case</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-cyan-200 font-mono">Ice Debris ▾</span>
              <span>:</span>
            </div>

            {/* Route Action Slot inside Case: Blank dashed outline before snap */}
            <div className="relative w-[178px] ml-3">
              <div
                className="h-6.5 rounded border border-dashed border-pink-500/40 bg-pink-950/10"
                style={{ animation: 's2s3TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Route Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#EC4899] text-white text-[8.5px] font-bold px-2 rounded flex items-center justify-between shadow border-l-2 border-pink-300 z-30"
                style={{
                  animation: 's2s3DragRoute 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s2s3SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>Route to</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-white font-mono">Orbit 1 ▾</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's2s3CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
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
              style={{ animation: 's2s3StatusStandby 7s ease-in-out infinite' }}
            >
              ROUTING...
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's2s3StatusLive 7s ease-in-out infinite' }}
            >
              ORBIT 1 STABLE
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#080314]">
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's2s3SceneStandby 7s ease-in-out infinite' }}>
            <SaturnRingStage isOnline={true} ring1Active={false} statusText="Awaiting route destination for Ice Debris..." />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's2s3SceneLive 7s ease-in-out infinite' }}>
            <SaturnRingStage isOnline={true} ring1Active={true} statusText="routeToOrbit(1) executed -> Ice Ring Stabilized" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Defensive Case: Shielding Asteroid Hazards
 * Dynamic Animation:
 * - Left: "Activate Shield" is dragged and snapped inside the Big Asteroid case mouth
 * - Right: Giant hazard asteroid incoming; on snap, the energy deflector shield flares up and protects the station
 */
export function SaturnLevel2Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s2s4DragShield {
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
        @keyframes s2s4CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s2s4SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #ec4899; box-shadow: 0 0 16px rgba(236,72,153,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s2s4TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s2s4StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s4StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s2s4SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s4SceneLive {
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
          <Saturn2ToolboxSidebar activeCategory="actions" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start</span>
            </div>

            {/* Case Big Asteroid */}
            <div className="h-6.5 bg-[#3B82F6] text-white text-[9px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Case</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-red-300 font-mono">Big Asteroid ▾</span>
              <span>:</span>
            </div>

            {/* Shield Action Slot inside Case: Blank dashed outline before snap */}
            <div className="relative w-[178px] ml-3">
              <div
                className="h-6.5 rounded border border-dashed border-pink-500/40 bg-pink-950/10"
                style={{ animation: 's2s4TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Shield Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#EC4899] text-white text-[8.5px] font-bold px-2 rounded flex items-center justify-between shadow border-l-2 border-pink-300 z-30"
                style={{
                  animation: 's2s4DragShield 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s2s4SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>Activate Shield</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's2s4CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
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
              className="text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.6)] whitespace-nowrap"
              style={{ animation: 's2s4StatusStandby 7s ease-in-out infinite' }}
            >
              HAZARD ALERT
            </span>
            <span
              className="absolute right-0 text-[#38bdf8] drop-shadow-[0_0_6px_rgba(56,189,248,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's2s4StatusLive 7s ease-in-out infinite' }}
            >
              SHIELD DEFLECTED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#080314]">
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's2s4SceneStandby 7s ease-in-out infinite' }}>
            <SaturnRingStage isOnline={true} ring1Active={false} shieldActive={false} statusText="Incoming collision: Big Asteroid detected!" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-3" style={{ animation: 's2s4SceneLive 7s ease-in-out infinite' }}>
            <SaturnRingStage isOnline={true} ring1Active={false} shieldActive={true} statusText="activateShield() engaged -> Asteroid deflected safely!" />
          </div>
        </div>
      </div>
    </div>
  );
}
