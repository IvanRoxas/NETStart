"use client";

import React from 'react';
import { Send, Sparkles, Check, Globe } from 'lucide-react';

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

function Mars3ToolboxSidebar({ activeCategory = "form" }: { activeCategory?: "form" | "options" | "input" | "button" }) {
  return (
    <div className="flex flex-col gap-1.5 w-20 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "form"
          ? "text-red-300 bg-red-950/80 border-red-400"
          : "text-red-400/60 bg-red-950/30 border-red-500/30"
      }`}>
        Form
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "options"
          ? "text-cyan-300 bg-cyan-950/80 border-cyan-400"
          : "text-cyan-400/60 bg-cyan-950/30 border-cyan-500/30"
      }`}>
        Options
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "input"
          ? "text-amber-300 bg-amber-950/80 border-amber-400"
          : "text-amber-400/60 bg-amber-950/30 border-amber-500/30"
      }`}>
        Input
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "button"
          ? "text-emerald-300 bg-emerald-950/80 border-emerald-400"
          : "text-emerald-400/60 bg-emerald-950/30 border-emerald-500/30"
      }`}>
        Button
      </div>
    </div>
  );
}

/**
 * Authentic Cosmic Space Radio Transmission Stage replicating SimulationConsole.tsx
 */
function MarsTransmissionSpaceScene({
  targetPlanet = "Venus",
  isTransmitting = true,
}: {
  targetPlanet?: "Venus" | "Mercury";
  isTransmitting?: boolean;
}) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#070314] select-none">
      {/* 1. Deep Space Cosmic Twilight Sky & Nebulae */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020008] via-[#0a041c] to-[#250819] pointer-events-none" />
      <div className="absolute top-1 left-1/4 w-44 h-24 bg-purple-600/25 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-4 right-1/4 w-40 h-20 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Twinkling Stars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-85" xmlns="http://www.w3.org/2000/svg">
        {[
          [15, 10], [35, 22], [55, 8], [82, 18], [92, 35], [10, 40], [28, 55], [70, 45], [88, 60]
        ].map(([x, y], i) => (
          <circle key={i} cx={`${x}%`} cy={`${y}%`} r={i % 2 === 0 ? 1.5 : 1} fill="#ffffff" opacity={0.75} />
        ))}
      </svg>

      {/* 2. Target Celestial Planets in Space */}
      <div className="relative z-10 w-full px-4 pt-3 flex justify-between items-start">
        {/* Venus (Top Left) */}
        <div
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            targetPlanet === 'Venus' ? 'scale-110 drop-shadow-[0_0_15px_#ec4899]' : 'opacity-40'
          }`}
        >
          <img
            src="/assets/planets/celestial/Venus.svg"
            alt="Venus"
            className="w-12 h-12 object-contain"
          />
          <span className="text-[8.5px] font-mono font-bold text-pink-300 tracking-wider">
            VENUS
          </span>
        </div>

        {/* Mercury (Top Right) */}
        <div
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            targetPlanet === 'Mercury' ? 'scale-110 drop-shadow-[0_0_15px_#38bdf8]' : 'opacity-40'
          }`}
        >
          <img
            src="/assets/planets/celestial/Mercury.svg"
            alt="Mercury"
            className="w-10 h-10 object-contain"
          />
          <span className="text-[8.5px] font-mono font-bold text-sky-300 tracking-wider">
            MERCURY
          </span>
        </div>
      </div>

      {/* 3. Signal Wave Energy Conduit */}
      {isTransmitting && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <defs>
            <linearGradient id="signalBeamGrad" x1="50%" y1="90%" x2={targetPlanet === 'Venus' ? '20%' : '80%'} y2="20%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <line
            x1="50%"
            y1="85%"
            x2={targetPlanet === 'Venus' ? '20%' : '80%'}
            y2="20%"
            stroke="url(#signalBeamGrad)"
            strokeWidth="3"
            strokeDasharray="6 6"
            className="animate-pulse"
          />
          <circle cx={targetPlanet === 'Venus' ? '20%' : '80%'} cy="20%" r="6" fill="#38bdf8" opacity="0.8" />
        </svg>
      )}

      {/* 4. Mars Horizon, Biodome & Radio Tower Antenna (Bottom) */}
      <div className="relative z-10 w-full flex flex-col items-center justify-end">
        {/* Radio Tower Antenna */}
        <div className="relative flex flex-col items-center">
          {/* Glowing Antenna Tip */}
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping mb-0.5 shadow-[0_0_8px_#f59e0b]" />
          {/* Antenna Mast */}
          <div className="w-1 h-8 bg-slate-300 shadow" />
          {/* Tower Lattice Legs */}
          <div className="w-8 h-6 border-x-2 border-t-2 border-slate-400 bg-slate-800/80 rounded-t flex items-center justify-center">
            <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Mars Red Dunes & Colony Biodome */}
        <div className="w-full h-11 bg-gradient-to-t from-[#1b0606] to-[#4c0519] border-t border-red-500/40 flex items-center justify-center px-4 relative">
          <div className="absolute -top-3 w-16 h-8 rounded-t-full bg-sky-950/70 border-t-2 border-x border-cyan-400/60 backdrop-blur-xs flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <span className="text-[7.5px] font-mono text-cyan-200 font-bold">DOME 1</span>
          </div>
          <span className="text-[8px] font-mono text-red-300 font-bold tracking-widest mt-2 uppercase">
            MARS TRANSMITTER ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Mars Level 3 (Full Form Pipeline to Transmit across Space)
 */
export function MarsLevel3Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m3s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m3s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
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
          <Mars3ToolboxSidebar activeCategory="form" />

          {/* Blockly Block Stack: html_form */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-red-300/40">
              <span>Form Container &lt;form&gt;</span>
            </div>

            {/* html_select */}
            <div className="h-7 bg-[#06B6D4] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Target Planet =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-cyan-200 font-mono">Venus ▾</span>
            </div>

            {/* html_input */}
            <div className="h-7 bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Input Field =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-amber-200 font-mono">&quot;Hello!&quot;</span>
            </div>

            {/* html_button */}
            <div className="h-7 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-emerald-400/20">
              <span>Submit Button =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-white font-mono">&quot;Send&quot;</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Mars Cosmic Transmission Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm3s1Ready 7s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'm3s1Running 7s ease-in-out infinite' }}>TRANSMITTING</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MarsTransmissionSpaceScene targetPlanet="Venus" isTransmitting={true} />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Target Planet Selection with Dropdown
 */
export function MarsLevel3Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m3s2Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m3s2Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m3s2Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes m3s2Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #06B6D4; box-shadow: 0 0 16px rgba(6,182,212,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #06B6D4; }
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
          <Mars3ToolboxSidebar activeCategory="options" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-red-300/40">
              <span>Form Container &lt;form&gt;</span>
            </div>

            <div
              className="relative h-7 bg-[#06B6D4] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-cyan-400/20 z-20"
              style={{ animation: 'm3s2Pulse 6s ease-in-out infinite' }}
            >
              <span>Target Planet =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-cyan-200 font-mono">Venus ▾</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm3s2Cursor 6s ease-in-out infinite' }}>
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
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm3s2Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'm3s2Running 6s ease-in-out infinite' }}>PLANET TARGETED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MarsTransmissionSpaceScene targetPlanet="Venus" isTransmitting={false} />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Typing the Transmission Message with Input Field
 */
export function MarsLevel3Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m3s3Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m3s3Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m3s3Cursor {
          0% { transform: translate(-30px, 40px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(30px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-30px, 40px); opacity: 0; }
        }
        @keyframes m3s3Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #F59E0B; box-shadow: 0 0 16px rgba(245,158,11,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #F59E0B; }
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
          <Mars3ToolboxSidebar activeCategory="input" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-red-300/40">
              <span>Form Container &lt;form&gt;</span>
            </div>

            <div className="h-7 bg-[#06B6D4] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Target Planet =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-cyan-200 font-mono">Venus ▾</span>
            </div>

            <div
              className="relative h-7 bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-amber-300/40 z-20"
              style={{ animation: 'm3s3Pulse 6s ease-in-out infinite' }}
            >
              <span>Input Field =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-amber-200 font-mono">&quot;Hello!&quot;</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm3s3Cursor 6s ease-in-out infinite' }}>
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
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm3s3Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'm3s3Running 6s ease-in-out infinite' }}>MESSAGE BUFFERED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MarsTransmissionSpaceScene targetPlanet="Venus" isTransmitting={false} />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Firing the Radio Signal with Submit Button
 */
export function MarsLevel3Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m3s4Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m3s4Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m3s4ButtonPulse {
          0%, 25% { filter: brightness(1); }
          30%, 85% { filter: brightness(1.3); outline: 2px solid #10b981; }
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
          <Mars3ToolboxSidebar activeCategory="button" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-red-300/40">
              <span>Form Container &lt;form&gt;</span>
            </div>

            <div className="h-7 bg-[#06B6D4] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Target Planet =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-cyan-200 font-mono">Venus ▾</span>
            </div>

            <div className="h-7 bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Input Field =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-amber-200 font-mono">&quot;Hello!&quot;</span>
            </div>

            <div
              className="h-7 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-emerald-400/20"
              style={{ animation: 'm3s4ButtonPulse 6s ease-in-out infinite' }}
            >
              <span>Submit Button =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-white font-mono">&quot;Send&quot;</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Radio Wave Broadcast Confirmed */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm3s4Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] font-bold whitespace-nowrap" style={{ animation: 'm3s4Running 6s ease-in-out infinite' }}>BROADCAST CONFIRMED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MarsTransmissionSpaceScene targetPlanet="Venus" isTransmitting={true} />
        </div>
      </div>
    </div>
  );
}
