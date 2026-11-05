"use client";

import React from 'react';

/**
 * Large, Clear SVG Cursor Pointer (Strictly No Emojis)
 * Sized 30x30 for prominent visibility
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

/**
 * Common Workspace Toolbox Sidebar matching Earth Level 3
 */
function Earth3ToolboxSidebar({ activeCategory = "connect" }: { activeCategory?: "connect" | "sequence" | "repairs" | "reboot" }) {
  return (
    <div className="flex flex-col gap-2 w-18 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeCategory === 'connect' ? 'text-indigo-300 bg-indigo-950/80 border-l-2 border-indigo-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        Connect
      </div>
      <div className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeCategory === 'sequence' ? 'text-emerald-300 bg-emerald-950/80 border-l-2 border-emerald-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        Sequence
      </div>
      <div className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeCategory === 'repairs' ? 'text-amber-300 bg-amber-950/80 border-l-2 border-amber-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        Repairs
      </div>
      <div className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeCategory === 'reboot' ? 'text-cyan-300 bg-cyan-950/80 border-l-2 border-cyan-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        Reboot
      </div>
    </div>
  );
}

/**
 * Radial Network Stage Canvas matching EarthLevel3Simulation.tsx
 */
function AstroLinkStage({
  children,
  phase = "offline",
}: {
  children?: React.ReactNode;
  phase?: "offline" | "connecting" | "synchronized";
}) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#090214] overflow-hidden">
      {/* Background stars & cosmic glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(88,28,135,0.25)_0%,_transparent_70%)]" />

      {/* SVG Radial AstroLink System */}
      <svg viewBox="0 0 400 400" className="w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] overflow-visible relative z-10">
        <defs>
          <radialGradient id="e3CoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#082f49" />
          </radialGradient>
        </defs>

        {/* Outer Circular Orbit Guide Ring */}
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke={phase === "synchronized" ? "#10b981" : "#a855f7"}
          strokeWidth={phase === "synchronized" ? "3" : "1.8"}
          strokeDasharray={phase === "synchronized" ? "none" : "6 6"}
          opacity={phase === "synchronized" ? 0.95 : 0.6}
        />

        {children}

        {/* Central Architect Core Mainframe */}
        <circle
          cx="200"
          cy="200"
          r="26"
          fill="url(#e3CoreGlow)"
          stroke="#38bdf8"
          strokeWidth="2.5"
          className="shadow-lg"
        />
        <circle cx="200" cy="200" r="12" fill="#ffffff" opacity="0.8" />
      </svg>
    </div>
  );
}

/**
 * =============================================================================
 * SLIDE 1: HOW TO WIN EARTH LEVEL 3 (THE MASTER REBOOT)
 * =============================================================================
 * Demonstrates the full sequence with authentic Blockly blocks:
 * 1. py_import_module: Link to Astrolink: Mars (HTML)
 * 2. py_def_func: Master Reboot Program: do
 * 3. py_module_execute: Restore System: Mars / Venus
 * 4. py_system_synchronize: Power Up Astrolink
 */
export function EarthLevel3Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Pipeline timing: 7.5 seconds loop */
        @keyframes e3s1StatusReady {
          0%, 25% { opacity: 1; }
          30%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes e3s1StatusSync {
          0%, 25% { opacity: 0; }
          30%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        @keyframes e3s1BeamsPulse {
          0%, 28% { stroke-dashoffset: 140; opacity: 0; }
          35%, 92% { stroke-dashoffset: 0; opacity: 1; stroke: #10b981; }
          96%, 100% { stroke-dashoffset: 140; opacity: 0; }
        }
        @keyframes e3s1NodesGlow {
          0%, 28% { fill: #1e1b4b; stroke: #6b21a8; }
          35%, 92% { fill: #064e3b; stroke: #10b981; filter: drop-shadow(0 0 10px #10b981); }
          96%, 100% { fill: #1e1b4b; stroke: #6b21a8; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-4 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Earth3ToolboxSidebar activeCategory="connect" />

          {/* Block Stack: Full Master Reboot Program */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* py_import_module 1 */}
            <div className="h-7 bg-[#6366F1] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-indigo-300/40">
              <span>Link to Astrolink:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-amber-300 truncate max-w-[85px]">Mars (HTML) ▾</span>
            </div>

            {/* py_import_module 2 */}
            <div className="h-7 bg-[#6366F1] text-white text-[9.5px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Link to Astrolink:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-pink-300 truncate max-w-[85px]">Venus (CSS) ▾</span>
            </div>

            {/* py_def_func Wrapper: Master Reboot Program: do */}
            <div className="h-7 bg-[#10B981] text-white text-[9.5px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Master Reboot Program:</span>
              <span className="font-mono text-[8.5px] text-emerald-200">do</span>
            </div>

            {/* py_module_execute 1 inside function */}
            <div className="h-6 bg-[#F59E0B] text-slate-950 text-[9px] font-black px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Restore:</span>
              <span className="bg-black/40 px-1 py-0.5 rounded text-[8px] text-white truncate max-w-[105px]">Mars: Rebuild Structure ▾</span>
            </div>

            {/* py_module_execute 2 inside function */}
            <div className="h-6 bg-[#F59E0B] text-slate-950 text-[9px] font-black px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Restore:</span>
              <span className="bg-black/40 px-1 py-0.5 rounded text-[8px] text-white truncate max-w-[105px]">Venus: Restore Colors ▾</span>
            </div>

            {/* py_system_synchronize: Power Up Astrolink */}
            <div className="h-7 bg-[#06B6D4] text-slate-950 text-[9.5px] font-black px-2 rounded-b flex items-center justify-between shadow border-b border-x border-cyan-300/40 border-t border-black/20">
              <span>Power Up Astrolink</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'e3s1StatusReady 7.5s ease-in-out infinite' }}
            >
              STANDBY
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap"
              style={{ animation: 'e3s1StatusSync 7.5s ease-in-out infinite' }}
            >
              SYNCHRONIZED
            </span>
          </div>
        </div>

        {/* Radial Canvas */}
        <div className="flex-1 relative">
          <AstroLinkStage phase="synchronized">
            {/* 5 Planetary Connection Beams */}
            <line x1="200" y1="200" x2="200" y2="60" stroke="#10b981" strokeWidth="2.5" strokeDasharray="140" style={{ animation: 'e3s1BeamsPulse 7.5s ease-in-out infinite' }} />
            <line x1="200" y1="200" x2="333" y2="157" stroke="#10b981" strokeWidth="2.5" strokeDasharray="140" style={{ animation: 'e3s1BeamsPulse 7.5s ease-in-out infinite' }} />
            <line x1="200" y1="200" x2="282" y2="313" stroke="#10b981" strokeWidth="2.5" strokeDasharray="140" style={{ animation: 'e3s1BeamsPulse 7.5s ease-in-out infinite' }} />
            <line x1="200" y1="200" x2="118" y2="313" stroke="#10b981" strokeWidth="2.5" strokeDasharray="140" style={{ animation: 'e3s1BeamsPulse 7.5s ease-in-out infinite' }} />
            <line x1="200" y1="200" x2="67" y2="157" stroke="#10b981" strokeWidth="2.5" strokeDasharray="140" style={{ animation: 'e3s1BeamsPulse 7.5s ease-in-out infinite' }} />

            {/* 5 Planetary Nodes */}
            <circle cx="200" cy="60" r="16" strokeWidth="2" style={{ animation: 'e3s1NodesGlow 7.5s ease-in-out infinite' }} />
            <circle cx="333" cy="157" r="16" strokeWidth="2" style={{ animation: 'e3s1NodesGlow 7.5s ease-in-out infinite' }} />
            <circle cx="282" cy="313" r="16" strokeWidth="2" style={{ animation: 'e3s1NodesGlow 7.5s ease-in-out infinite' }} />
            <circle cx="118" cy="313" r="16" strokeWidth="2" style={{ animation: 'e3s1NodesGlow 7.5s ease-in-out infinite' }} />
            <circle cx="67" cy="157" r="16" strokeWidth="2" style={{ animation: 'e3s1NodesGlow 7.5s ease-in-out infinite' }} />
          </AstroLinkStage>
        </div>
      </div>
    </div>
  );
}

/**
 * =============================================================================
 * SLIDE 2: CONNECTING PLANETARY SYSTEMS (IMPORT MODULES)
 * =============================================================================
 * Focus on Link to Astrolink: [ Planet ▾ ] blocks.
 */
export function EarthLevel3Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Timing: 6 seconds loop */
        @keyframes e3s2StatusReady {
          0%, 30% { opacity: 1; }
          35%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes e3s2StatusLinking {
          0%, 30% { opacity: 0; }
          35%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        @keyframes e3s2CursorSnap {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes e3s2BlockPulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #6366F1; box-shadow: 0 0 16px rgba(99,102,241,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #6366F1; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes e3s2SingleBeam {
          0%, 36% { stroke-dashoffset: 140; opacity: 0; }
          42%, 92% { stroke-dashoffset: 0; opacity: 1; }
          96%, 100% { stroke-dashoffset: 140; opacity: 0; }
        }
        @keyframes e3s2NodeTarget {
          0%, 38% { fill: #1e1b4b; stroke: #6b21a8; }
          44%, 92% { fill: #7f1d1d; stroke: #ef4444; filter: drop-shadow(0 0 12px #ef4444); }
          96%, 100% { fill: #1e1b4b; stroke: #6b21a8; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-4 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Earth3ToolboxSidebar activeCategory="connect" />

          {/* Block Stack: Connecting Systems */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* py_import_module Mars - Highlighted & Clicked */}
            <div
              className="relative h-7 bg-[#6366F1] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-indigo-300/40 z-20"
              style={{ animation: 'e3s2BlockPulse 6s ease-in-out infinite' }}
            >
              <span>Link to Astrolink:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-amber-300 truncate max-w-[85px]">Mars (HTML) ▾</span>

              {/* Large Visible Cursor */}
              <div
                className="absolute right-4 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'e3s2CursorSnap 6s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>

            {/* py_import_module Venus */}
            <div className="h-7 bg-[#6366F1] text-white text-[9.5px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Link to Astrolink:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-pink-300 truncate max-w-[85px]">Venus (CSS) ▾</span>
            </div>

            {/* py_import_module Mercury */}
            <div className="h-7 bg-[#6366F1] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-indigo-300/20">
              <span>Link to Astrolink:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-cyan-300 truncate max-w-[85px]">Mercury (JS) ▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'e3s2StatusReady 6s ease-in-out infinite' }}
            >
              STANDBY
            </span>
            <span
              className="absolute right-0 text-[#6366F1] drop-shadow-[0_0_6px_rgba(99,102,241,0.8)] animate-pulse whitespace-nowrap"
              style={{ animation: 'e3s2StatusLinking 6s ease-in-out infinite' }}
            >
              LINKING MARS
            </span>
          </div>
        </div>

        {/* Radial Canvas */}
        <div className="flex-1 relative">
          <AstroLinkStage phase="connecting">
            {/* Direct beam connecting to Mars (at top, 200, 60) */}
            <line
              x1="200" y1="200" x2="200" y2="60"
              stroke="#ef4444" strokeWidth="2.5" strokeDasharray="140"
              style={{ animation: 'e3s2SingleBeam 6s ease-in-out infinite' }}
            />

            {/* Mars Node */}
            <circle cx="200" cy="60" r="16" strokeWidth="2" style={{ animation: 'e3s2NodeTarget 6s ease-in-out infinite' }} />
            {/* Other nodes offline */}
            <circle cx="333" cy="157" r="16" fill="#1e1b4b" stroke="#6b21a8" strokeWidth="2" />
            <circle cx="282" cy="313" r="16" fill="#1e1b4b" stroke="#6b21a8" strokeWidth="2" />
            <circle cx="118" cy="313" r="16" fill="#1e1b4b" stroke="#6b21a8" strokeWidth="2" />
            <circle cx="67" cy="157" r="16" fill="#1e1b4b" stroke="#6b21a8" strokeWidth="2" />
          </AstroLinkStage>
        </div>
      </div>
    </div>
  );
}

/**
 * =============================================================================
 * SLIDE 3: MASTER REBOOT FUNCTION & SYNCHRONIZE
 * =============================================================================
 * Focus on function definition Master Reboot Program: do and Power Up Astrolink.
 */
export function EarthLevel3Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Timing: 6 seconds loop */
        @keyframes e3s3StatusReady {
          0%, 30% { opacity: 1; }
          35%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes e3s3StatusSync {
          0%, 30% { opacity: 0; }
          35%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        @keyframes e3s3CursorClick {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes e3s3SyncPulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #06B6D4; box-shadow: 0 0 16px rgba(6,182,212,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #06B6D4; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes e3s3AllBeams {
          0%, 36% { stroke-dashoffset: 140; opacity: 0; }
          42%, 92% { stroke-dashoffset: 0; opacity: 1; stroke: #10b981; }
          96%, 100% { stroke-dashoffset: 140; opacity: 0; }
        }
        @keyframes e3s3AllGreen {
          0%, 38% { fill: #1e1b4b; stroke: #6b21a8; }
          44%, 92% { fill: #064e3b; stroke: #10b981; filter: drop-shadow(0 0 12px #10b981); }
          96%, 100% { fill: #1e1b4b; stroke: #6b21a8; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-4 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Earth3ToolboxSidebar activeCategory="reboot" />

          {/* Block Stack */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Function Definition */}
            <div className="h-7 bg-[#10B981] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-emerald-400/40">
              <span>Master Reboot Program:</span>
              <span className="font-mono text-[8.5px] text-emerald-200">do</span>
            </div>

            {/* Nested Repairs inside function */}
            <div className="h-6 bg-[#F59E0B] text-slate-950 text-[9px] font-black px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Restore:</span>
              <span className="bg-black/40 px-1 py-0.5 rounded text-[8px] text-white truncate max-w-[105px]">Mars: Rebuild Structure ▾</span>
            </div>

            <div className="h-6 bg-[#F59E0B] text-slate-950 text-[9px] font-black px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Restore:</span>
              <span className="bg-black/40 px-1 py-0.5 rounded text-[8px] text-white truncate max-w-[105px]">Venus: Restore Colors ▾</span>
            </div>

            {/* Power Up Astrolink - Highlighted & Clicked */}
            <div
              className="relative h-7 bg-[#06B6D4] text-slate-950 text-[9.5px] font-black px-2 rounded-b flex items-center justify-between shadow border-b border-x border-cyan-300/40 border-t border-black/20 z-20"
              style={{ animation: 'e3s3SyncPulse 6s ease-in-out infinite' }}
            >
              <span>Power Up Astrolink</span>

              {/* Large Visible Cursor */}
              <div
                className="absolute right-4 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'e3s3CursorClick 6s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'e3s3StatusReady 6s ease-in-out infinite' }}
            >
              STANDBY
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap"
              style={{ animation: 'e3s3StatusSync 6s ease-in-out infinite' }}
            >
              SYNCHRONIZED
            </span>
          </div>
        </div>

        {/* Radial Canvas */}
        <div className="flex-1 relative">
          <AstroLinkStage phase="synchronized">
            {/* Beams simultaneously firing to all planets */}
            <line x1="200" y1="200" x2="200" y2="60" stroke="#10b981" strokeWidth="2.5" strokeDasharray="140" style={{ animation: 'e3s3AllBeams 6s ease-in-out infinite' }} />
            <line x1="200" y1="200" x2="333" y2="157" stroke="#10b981" strokeWidth="2.5" strokeDasharray="140" style={{ animation: 'e3s3AllBeams 6s ease-in-out infinite' }} />
            <line x1="200" y1="200" x2="282" y2="313" stroke="#10b981" strokeWidth="2.5" strokeDasharray="140" style={{ animation: 'e3s3AllBeams 6s ease-in-out infinite' }} />
            <line x1="200" y1="200" x2="118" y2="313" stroke="#10b981" strokeWidth="2.5" strokeDasharray="140" style={{ animation: 'e3s3AllBeams 6s ease-in-out infinite' }} />
            <line x1="200" y1="200" x2="67" y2="157" stroke="#10b981" strokeWidth="2.5" strokeDasharray="140" style={{ animation: 'e3s3AllBeams 6s ease-in-out infinite' }} />

            {/* Nodes all turn emerald green */}
            <circle cx="200" cy="60" r="16" strokeWidth="2" style={{ animation: 'e3s3AllGreen 6s ease-in-out infinite' }} />
            <circle cx="333" cy="157" r="16" strokeWidth="2" style={{ animation: 'e3s3AllGreen 6s ease-in-out infinite' }} />
            <circle cx="282" cy="313" r="16" strokeWidth="2" style={{ animation: 'e3s3AllGreen 6s ease-in-out infinite' }} />
            <circle cx="118" cy="313" r="16" strokeWidth="2" style={{ animation: 'e3s3AllGreen 6s ease-in-out infinite' }} />
            <circle cx="67" cy="157" r="16" strokeWidth="2" style={{ animation: 'e3s3AllGreen 6s ease-in-out infinite' }} />
          </AstroLinkStage>
        </div>
      </div>
    </div>
  );
}
