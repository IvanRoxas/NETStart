"use client";

import React from 'react';
import { Terminal, Sparkles, Check } from 'lucide-react';

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
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "program"
          ? "text-red-300 bg-red-950/80 border-red-400"
          : "text-red-400/60 bg-red-950/30 border-red-500/30"
      }`}>
        Program
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "storage"
          ? "text-purple-300 bg-purple-950/80 border-purple-400"
          : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
      }`}>
        Storage
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "stream"
          ? "text-cyan-300 bg-cyan-950/80 border-cyan-400"
          : "text-cyan-400/60 bg-cyan-950/30 border-cyan-500/30"
      }`}>
        Stream
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "io"
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
  streamLine1 = "> cin >> ORBIT",
  streamLine2 = "> cout << ORBIT (Verified)",
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

      {/* 2. Physical CRT Monitor (Bottom Half) */}
      <div className="flex-1 w-full p-2 flex flex-col justify-between min-h-0 bg-[#07050e]">
        <div
          className={`relative w-full h-full rounded-xl border-2 p-2 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 ${
            isOnline
              ? "border-purple-600/80 bg-gradient-to-b from-[#1b142c] via-[#100c1c] to-[#090710]"
              : "border-slate-800 bg-[#090710] opacity-80"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-purple-900/50 pb-1 text-[8.5px] shrink-0">
            <div className="flex items-center gap-1.5 font-bold text-purple-200">
              <Terminal size={11} className="text-purple-400" />
              <span>DATA TERMINAL</span>
            </div>
            <span className="text-[7.5px] font-bold text-cyan-300 px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-400/40">
              {isOnline ? "ONLINE" : "STANDBY"}
            </span>
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
 * Slide 1: How to Win Saturn Level 1 (Full C++ I/O Telemetry Stream Pipeline)
 */
export function SaturnLevel1Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s1s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes s1s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
      `}</style>

      {/* LEFT PANE: Actual Blockly Blocks */}
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
          <Saturn1ToolboxSidebar activeCategory="program" />

          {/* Actual Blockly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-6 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start Program</span>
            </div>

            <div className="h-6 bg-[#9333EA] text-white text-[8px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span className="truncate">Create Text Storage (string textWord);</span>
            </div>

            <div className="h-6 bg-[#0284C7] text-white text-[8px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span className="truncate">Create Number Storage (int sensorNum);</span>
            </div>

            <div className="h-6 bg-[#EAB308] text-slate-950 text-[8px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span className="truncate">Create Choice Storage (bool userChoice);</span>
            </div>

            <div className="h-6 bg-[#0891B2] text-white text-[8.5px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span>Repeat While Receiving Input</span>
            </div>

            <div className="h-6 bg-[#16A34A] text-white text-[8px] font-bold px-2 ml-3 flex items-center shadow border-l-2 border-emerald-300">
              <span>Read Keyboard (cin &gt;&gt;);</span>
            </div>

            <div className="h-6 bg-[#EA580C] text-white text-[8px] font-bold px-2 ml-3 flex items-center shadow border-l-2 border-orange-300">
              <span>Print Screen (cout &lt;&lt;);</span>
            </div>

            <div className="h-6 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End Program</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Cockpit & CRT Data Terminal Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 's1s1Ready 7s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 's1s1Running 7s ease-in-out infinite' }}>STREAMING I/O</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Saturn1CockpitScene isOnline={true} streamLine1="> cin >> ORBIT" streamLine2="> cout << ORBIT (Verified)" />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Allocating Typed Storage Buffers
 */
export function SaturnLevel1Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s1s2Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes s1s2Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #9333EA; box-shadow: 0 0 16px rgba(147,51,234,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #9333EA; }
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
          <Saturn1ToolboxSidebar activeCategory="storage" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div
              className="relative h-7 bg-[#9333EA] text-white text-[8.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-purple-400/40 z-20"
              style={{ animation: 's1s2Pulse 6s ease-in-out infinite' }}
            >
              <span className="truncate">Create Text Storage (string textWord);</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 's1s2Cursor 6s ease-in-out infinite' }}>
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
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-purple-300 drop-shadow-[0_0_6px_rgba(192,132,252,0.6)]">STORAGE ALLOCATED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Saturn1CockpitScene isOnline={true} streamLine1="> Memory: string textWord allocated" streamLine2="> Storage Buffer Ready" />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Telemetry Stream Loop (while receiving input)
 */
export function SaturnLevel1Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s1s3Cursor {
          0% { transform: translate(-30px, 40px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(30px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-30px, 40px); opacity: 0; }
        }
        @keyframes s1s3Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #0891B2; box-shadow: 0 0 16px rgba(8,145,178,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #0891B2; }
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
          <Saturn1ToolboxSidebar activeCategory="stream" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div
              className="relative h-7 bg-[#0891B2] text-white text-[9px] font-bold px-2 rounded flex items-center justify-between shadow border border-cyan-400/40 z-20"
              style={{ animation: 's1s3Pulse 6s ease-in-out infinite' }}
            >
              <span>Repeat While Receiving Input</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 's1s3Cursor 6s ease-in-out infinite' }}>
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
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]">STREAM ACTIVE</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Saturn1CockpitScene isOnline={true} streamLine1="> Stream Loop Active" streamLine2="> Waiting for incoming packets..." />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Closing with 'End Program' for Safe Exit
 */
export function SaturnLevel1Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s1s4Pulse {
          0%, 25% { filter: brightness(1); }
          30%, 85% { filter: brightness(1.3); outline: 2px solid #EF4444; }
          90%, 100% { filter: brightness(1); }
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
          <Saturn1ToolboxSidebar activeCategory="program" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div
              className="h-7 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-red-400/40"
              style={{ animation: 's1s4Pulse 6s ease-in-out infinite' }}
            >
              <span>End Program</span>
              <Check size={11} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Clean Terminal Shutdown */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] font-bold whitespace-nowrap">
              PROGRAM TERMINATED (CODE 0)
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Saturn1CockpitScene isOnline={true} streamLine1="> 10/10 Packets Processed" streamLine2="> Telemetry Mission Complete" />
        </div>
      </div>
    </div>
  );
}
