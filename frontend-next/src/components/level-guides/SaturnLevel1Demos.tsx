"use client";

import React from 'react';
import { Terminal, Check } from 'lucide-react';

/**
 * Large, Clear SVG Cursor Pointer (Strictly No Emojis)
 */
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

function Saturn1ToolboxSidebar({ activeCategory = "program" }: { activeCategory?: "program" | "storage" | "stream" | "io" }) {
  return (
    <div className="flex flex-col gap-1.5 w-20 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "program"
          ? "text-red-300 bg-red-950/80 border-red-400"
          : "text-red-400/60 bg-red-950/30 border-red-500/30"
        }`}>
        Program
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "storage"
          ? "text-purple-300 bg-purple-950/80 border-purple-400"
          : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
        }`}>
        Storage
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "stream"
          ? "text-cyan-300 bg-cyan-950/80 border-cyan-400"
          : "text-cyan-400/60 bg-cyan-950/30 border-cyan-500/30"
        }`}>
        Stream
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "io"
          ? "text-emerald-300 bg-emerald-950/80 border-emerald-400"
          : "text-emerald-400/60 bg-emerald-950/30 border-emerald-500/30"
        }`}>
        Read/Print
      </div>
    </div>
  );
}

/**
 * Authentic Cockpit Panoramic Windshield & CRT Terminal Stage replicating SaturnLevel1Simulation.tsx
 */
function Saturn1CockpitScene({
  isOnline = true,
  streamLine1 = "In (data):  > ORBIT",
  streamLine2 = "Out: Telemetry verified.",
}: {
  isOnline?: boolean;
  streamLine1?: string;
  streamLine2?: string;
}) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#020208] select-none font-mono">
      {/* 1. Cockpit Panoramic Windshield Overlooking Saturn */}
      <div className="relative w-full h-[85px] sm:h-[95px] overflow-hidden flex items-center justify-center shrink-0 border-b-2 border-slate-700/80">
        {/* Deep Space Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#02000a] via-[#09031a] to-[#120524] pointer-events-none" />

        {/* Stars */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80">
          {[
            [15, 20], [30, 45], [50, 15], [75, 25], [85, 60], [20, 75], [92, 15]
          ].map(([x, y], i) => (
            <circle key={i} cx={`${x}%`} cy={`${y}%`} r={1} fill="#ffffff" opacity={0.8} />
          ))}
        </svg>

        {/* Looming Saturn with Radiant Rings */}
        <div className="absolute -top-6 -right-4 w-32 h-32 pointer-events-none z-10 drop-shadow-[0_0_25px_rgba(192,132,252,0.8)]">
          <img
            src="/assets/planets/celestial/Saturn.svg"
            alt="Saturn"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Cockpit Canopy Struts / A-Pillars */}
        <div className="absolute inset-0 pointer-events-none flex z-20">
          <div className="w-[18%] h-full border-r-2 border-slate-700 bg-purple-950/20" />
          <div className="flex-1 h-full" />
          <div className="w-[22%] h-full border-l-2 border-slate-700 bg-purple-950/20" />
        </div>

        {/* Horizon Ambient Glow */}
        <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-sky-400/20 to-transparent pointer-events-none z-10" />
      </div>

      {/* 2. Physical CRT Monitor (Bottom Half) matching SaturnLevel1Simulation */}
      <div className="flex-1 w-full p-2 flex flex-col justify-between min-h-0 bg-[#07050e]">
        <div
          className={`relative w-full h-full rounded-xl border-2 p-2 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 ${isOnline
              ? "border-purple-600/80 bg-gradient-to-b from-[#1b142c] via-[#100c1c] to-[#090710]"
              : "border-slate-800 bg-[#090710] opacity-80"
            }`}
        >
          {/* Corner Screws */}
          <div className="absolute top-1 left-1.5 w-1 h-1 rounded-full bg-slate-600 border border-slate-500" />
          <div className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-slate-600 border border-slate-500" />
          <div className="absolute bottom-1 left-1.5 w-1 h-1 rounded-full bg-slate-600 border border-slate-500" />
          <div className="absolute bottom-1 right-1.5 w-1 h-1 rounded-full bg-slate-600 border border-slate-500" />

          {/* Header with Title and Boxed Badges */}
          <div className="flex items-center justify-between border-b border-purple-900/50 pb-1 text-[8.5px] shrink-0">
            <div className="flex items-center gap-1.5 font-bold text-purple-200">
              <Terminal size={11} className="text-purple-400" />
              <span>DATA TERMINAL</span>
              <span className="text-[7px] text-purple-400/80 uppercase">
                [{isOnline ? "ONLINE" : "STANDBY"}]
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[7px]">
              <span className="px-1 py-0.2 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">
                TIME: 45s
              </span>
              <span className="px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-400/40 text-cyan-300">
                SCORE: 1,000
              </span>
            </div>
          </div>

          {/* CRT Log Lines */}
          <div className="flex-1 py-1 flex flex-col justify-center gap-1 text-[8px] font-mono overflow-hidden">
            <div className="text-slate-400">&gt; System Ready.</div>
            <div className="text-emerald-400 font-bold">{streamLine1}</div>
            <div className="text-amber-300 font-bold">{streamLine2}</div>
          </div>

          {/* CRT Screen Footer */}
          <div className="flex items-center justify-between border-t border-purple-900/40 pt-0.5 text-[7px] text-slate-400 shrink-0">
            <span>BAUD: 9600</span>
            <span className="text-emerald-400 font-bold">TELEMETRY OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1: Program Entry & Stream Loop Foundation
 * Dynamic Animation:
 * - Left: "Repeat While Receiving Input" block is dragged from the Stream category and snapped between Start and End
 * - Right: Terminal comes online and activates the telemetry stream channel
 */
export function SaturnLevel1Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s1s1DragLoop {
          0%, 14% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(-65px, 25px) scale(1.03);
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
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0;
          }
        }
        @keyframes s1s1CursorMotion {
          0%, 10% { transform: translate(-80px, 40px); opacity: 0; }
          16% { transform: translate(-50px, 30px); opacity: 1; }
          20% { transform: translate(-50px, 30px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 40px); opacity: 0; }
        }
        @keyframes s1s1SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #0891b2; box-shadow: 0 0 16px rgba(8,145,178,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s1s1TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s1s1StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s1s1StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s1s1SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s1s1SceneLive {
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
          <Saturn1ToolboxSidebar activeCategory="stream" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start Program</span>
            </div>

            {/* Loop Slot: Blank dashed outline before snap */}
            <div className="relative w-full">
              <div
                className="h-14 rounded border border-dashed border-cyan-500/40 bg-cyan-950/10"
                style={{ animation: 's1s1TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Loop Block */}
              <div
                className="absolute inset-0 h-14 bg-[#0891B2] text-white text-[8.5px] font-bold p-1.5 rounded flex flex-col justify-between shadow border border-cyan-400/40 z-30"
                style={{
                  animation: 's1s1DragLoop 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s1s1SnapPulse 7s ease-in-out infinite',
                }}
              >
                <div className="flex items-center justify-between">
                  <span>Repeat While Receiving Input</span>
                </div>
                {/* Loop interior slot indicator */}
                <div className="h-5 ml-2.5 rounded bg-black/40 border border-cyan-300/30 flex items-center px-1.5 text-[7.5px] text-cyan-200">
                  <span className="italic">drop I/O stream blocks here</span>
                </div>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's1s1CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* End Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End Program</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[130px] shrink-0 h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 's1s1StatusStandby 7s ease-in-out infinite' }}
            >
              STANDBY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's1s1StatusLive 7s ease-in-out infinite' }}
            >
              STREAM ONLINE
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 's1s1SceneStandby 7s ease-in-out infinite' }}>
            <Saturn1CockpitScene isOnline={false} streamLine1="> Awaiting stream loop structure..." streamLine2="> Telemetry channel offline" />
          </div>
          <div className="absolute inset-0" style={{ animation: 's1s1SceneLive 7s ease-in-out infinite' }}>
            <Saturn1CockpitScene isOnline={true} streamLine1="> cin >> incoming stream loop ready" streamLine2="> Telemetry channel open" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Allocating Typed Storage Buffers
 * Dynamic Animation:
 * - Left: "Create Text Storage (string textWord);" is dragged and snapped right beneath Start Program
 * - Right: Memory buffer initializes and reserves RAM for incoming text stream
 */
export function SaturnLevel1Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s1s2DragStorage {
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
        @keyframes s1s2CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s1s2SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #9333ea; box-shadow: 0 0 16px rgba(147,51,234,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s1s2TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s1s2StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s1s2StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s1s2SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s1s2SceneLive {
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
          <Saturn1ToolboxSidebar activeCategory="storage" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start Program</span>
            </div>

            {/* Storage Slot: Blank dashed outline before snap */}
            <div className="relative w-full">
              <div
                className="h-6.5 rounded border border-dashed border-purple-500/40 bg-purple-950/10"
                style={{ animation: 's1s2TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Storage Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#9333EA] text-white text-[8px] font-bold px-2 rounded flex items-center justify-between shadow border border-purple-400/40 z-30"
                style={{
                  animation: 's1s2DragStorage 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s1s2SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span className="truncate">Create Text Storage (string textWord);</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's1s2CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Repeat Loop */}
            <div className="h-6.5 bg-[#0891B2] text-white text-[8.5px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span>Repeat While Receiving Input</span>
            </div>

            {/* End Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End Program</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[130px] shrink-0 h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 's1s2StatusStandby 7s ease-in-out infinite' }}
            >
              WAITING STORAGE
            </span>
            <span
              className="absolute right-0 text-[#a855f7] drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's1s2StatusLive 7s ease-in-out infinite' }}
            >
              STORAGE READY
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 's1s2SceneStandby 7s ease-in-out infinite' }}>
            <Saturn1CockpitScene isOnline={true} streamLine1="> Memory: No variable allocated" streamLine2="> Ingest buffer unavailable" />
          </div>
          <div className="absolute inset-0" style={{ animation: 's1s2SceneLive 7s ease-in-out infinite' }}>
            <Saturn1CockpitScene isOnline={true} streamLine1="> Memory: string textWord allocated [0x7F]" streamLine2="> Telemetry buffer initialized for stream" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Reading Input Stream (cin >>)
 * Dynamic Animation:
 * - Left: "Read Keyboard (cin >>);" is dragged from the Read/Print category and snapped inside the stream loop
 * - Right: Input channel unlocks and stream terminal ingests incoming packet
 */
export function SaturnLevel1Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s1s3DragCin {
          0%, 14% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(-65px, 25px) scale(1.03);
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
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0;
          }
        }
        @keyframes s1s3CursorMotion {
          0%, 10% { transform: translate(-80px, 40px); opacity: 0; }
          16% { transform: translate(-50px, 30px); opacity: 1; }
          20% { transform: translate(-50px, 30px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 40px); opacity: 0; }
        }
        @keyframes s1s3SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #16a34a; box-shadow: 0 0 16px rgba(22,163,74,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s1s3TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s1s3StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s1s3StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s1s3SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s1s3SceneLive {
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
          <Saturn1ToolboxSidebar activeCategory="io" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start Program</span>
            </div>

            {/* Storage */}
            <div className="h-6 bg-[#9333EA] text-white text-[8px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span className="truncate">Create Text Storage (string textWord);</span>
            </div>

            {/* Repeat Loop Top */}
            <div className="h-6 bg-[#0891B2] text-white text-[8.5px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span>Repeat While Receiving Input</span>
            </div>

            {/* cin Slot inside loop: Blank dashed outline before snap */}
            <div className="relative w-[178px] ml-3">
              <div
                className="h-6.5 rounded border border-dashed border-emerald-500/40 bg-emerald-950/10"
                style={{ animation: 's1s3TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged cin Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#16A34A] text-white text-[8.5px] font-bold px-2 rounded flex items-center justify-between shadow border-l-2 border-emerald-300 z-30"
                style={{
                  animation: 's1s3DragCin 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s1s3SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>Read Keyboard (cin &gt;&gt;);</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's1s3CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* End Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End Program</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[130px] shrink-0 h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 's1s3StatusStandby 7s ease-in-out infinite' }}
            >
              NO INPUT
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's1s3StatusLive 7s ease-in-out infinite' }}
            >
              CIN ACTIVE
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 's1s3SceneStandby 7s ease-in-out infinite' }}>
            <Saturn1CockpitScene isOnline={true} streamLine1="> Stream waiting for cin >>" streamLine2="> No input received" />
          </div>
          <div className="absolute inset-0" style={{ animation: 's1s3SceneLive 7s ease-in-out infinite' }}>
            <Saturn1CockpitScene isOnline={true} streamLine1="> KEYBOARD BUS: cin >> [SENSOR_DATA]" streamLine2="> Packet ingested into textWord buffer" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Printing Output Stream (cout <<) & Safe Exit
 * Dynamic Animation:
 * - Left: "Print Screen (cout <<);" is dragged right beneath cin >> inside the stream loop
 * - Right: Terminal echoes the verified telemetry stream and marks pipeline complete
 */
export function SaturnLevel1Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s1s4DragCout {
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
        @keyframes s1s4CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s1s4SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #ea580c; box-shadow: 0 0 16px rgba(234,88,12,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s1s4TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s1s4StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s1s4StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s1s4SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s1s4SceneLive {
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
          <Saturn1ToolboxSidebar activeCategory="io" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start Program</span>
            </div>

            {/* Storage */}
            <div className="h-6 bg-[#9333EA] text-white text-[8px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span className="truncate">Create Text Storage (string textWord);</span>
            </div>

            {/* Repeat Loop Top */}
            <div className="h-6 bg-[#0891B2] text-white text-[8.5px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span>Repeat While Receiving Input</span>
            </div>

            {/* cin inside loop */}
            <div className="h-6 bg-[#16A34A] text-white text-[8px] font-bold px-2 ml-3 flex items-center shadow border-l-2 border-emerald-300">
              <span>Read Keyboard (cin &gt;&gt;);</span>
            </div>

            {/* cout Slot inside loop: Blank dashed outline before snap */}
            <div className="relative w-[178px] ml-3">
              <div
                className="h-6.5 rounded border border-dashed border-orange-500/40 bg-orange-950/10"
                style={{ animation: 's1s4TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged cout Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#EA580C] text-white text-[8px] font-bold px-2 rounded flex items-center justify-between shadow border-l-2 border-orange-300 z-30"
                style={{
                  animation: 's1s4DragCout 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s1s4SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>Print Screen (cout &lt;&lt;);</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's1s4CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* End Program */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End Program</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[130px] shrink-0 h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 's1s4StatusStandby 7s ease-in-out infinite' }}
            >
              PROCESSING
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's1s4StatusLive 7s ease-in-out infinite' }}
            >
              STREAM VERIFIED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 's1s4SceneStandby 7s ease-in-out infinite' }}>
            <Saturn1CockpitScene isOnline={true} streamLine1="> cin >> textWord received" streamLine2="> Waiting for cout << to terminal" />
          </div>
          <div className="absolute inset-0" style={{ animation: 's1s4SceneLive 7s ease-in-out infinite' }}>
            <Saturn1CockpitScene isOnline={true} streamLine1="> cin >> [SENSOR_DATA] OK" streamLine2="> cout << [SENSOR_DATA] (Verified)" />
          </div>
        </div>
      </div>
    </div>
  );
}
