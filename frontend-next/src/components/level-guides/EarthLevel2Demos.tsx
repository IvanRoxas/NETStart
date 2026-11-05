"use client";

import React from 'react';
import { ShieldCheck, Check, Globe, Folder, Play } from 'lucide-react';

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
 * Common Workspace Toolbox Sidebar matching Earth Level 2
 */
function Earth2ToolboxSidebar({ activeTab = "profiles" }: { activeTab?: "profiles" | "orbits" }) {
  if (activeTab === "orbits") {
    return (
      <div className="flex flex-col gap-2 w-18 shrink-0 py-1.5 select-none font-mono">
        <div className="text-[9.5px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 border-l-2 border-purple-400 px-2 py-1 rounded-r shadow-xs">
          Orbits
        </div>
        <div className="text-[9.5px] font-bold uppercase tracking-wider text-sky-300 bg-sky-950/50 border-l-2 border-sky-400 px-2 py-1 rounded-r shadow-xs">
          Planets
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-18 shrink-0 py-1.5 select-none font-mono">
      <div className="text-[9.5px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 border-l-2 border-cyan-400 px-2 py-1 rounded-r shadow-xs">
        Profiles
      </div>
      <div className="text-[9.5px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/50 border-l-2 border-amber-400 px-2 py-1 rounded-r shadow-xs">
        Values
      </div>
    </div>
  );
}

/**
 * =============================================================================
 * SLIDE 1: HOW TO WIN EARTH LEVEL 2 (THE PLANETARY ARCHIVE)
 * =============================================================================
 * Demonstrates the full level pipeline:
 * 1. Build dictionary profile for planets
 * 2. Scanner sweeps and verifies each planetary record
 * 3. Orbits unlock to sequence all planets around the Sun
 */
export function EarthLevel2Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Pipeline timing: 7 seconds loop */
        @keyframes e2s1StatusReady {
          0%, 20% { opacity: 1; }
          25%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes e2s1StatusRunning {
          0%, 20% { opacity: 0; }
          25%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        @keyframes e2s1ScanLaser {
          0%, 25% { top: 0%; opacity: 0; }
          28% { top: 0%; opacity: 1; }
          65% { top: 95%; opacity: 1; }
          70%, 100% { top: 95%; opacity: 0; }
        }
        @keyframes e2s1BadgeVerified {
          0%, 65% { opacity: 0; transform: scale(0.8); }
          68%, 94% { opacity: 1; transform: scale(1); }
          98%, 100% { opacity: 0; }
        }
        @keyframes e2s1BadgeUnverified {
          0%, 65% { opacity: 1; }
          68%, 94% { opacity: 0; }
          98%, 100% { opacity: 1; }
        }
        @keyframes e2s1CardGlow {
          0%, 65% { border-color: rgba(6, 182, 212, 0.4); box-shadow: 0 0 15px rgba(6, 182, 212, 0.15); }
          68%, 94% { border-color: #10b981; box-shadow: 0 0 25px rgba(16, 185, 129, 0.4); }
          98%, 100% { border-color: rgba(6, 182, 212, 0.4); box-shadow: 0 0 15px rgba(6, 182, 212, 0.15); }
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
          <Earth2ToolboxSidebar />

          {/* Block Stack: Profile Definition for Earth matching earth2_planet_dict */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Header: Planet: Earth ▾ */}
            <div className="h-8 bg-[#0284c7] text-white text-[10.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-cyan-300/40">
              <div className="flex items-center gap-1.5">
                <Globe size={12} className="text-cyan-200" />
                <span>Planet:</span>
              </div>
              <span className="bg-black/50 px-2 py-0.5 rounded text-[10px] text-cyan-200 font-mono font-bold">Earth ▾</span>
            </div>

            {/* Description socket */}
            <div className="h-7 bg-[#0369a1] text-white text-[10px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span className="text-cyan-200">Description:</span>
              <span className="bg-[#0284C7] px-1.5 py-0.5 rounded text-[8.5px] text-white truncate max-w-[105px]">Blue planet...</span>
            </div>

            {/* Type socket */}
            <div className="h-7 bg-[#0369a1] text-white text-[10px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span className="text-cyan-200">Type:</span>
              <span className="bg-[#10B981] px-2 py-0.5 rounded text-[9px] text-white font-bold">Rocky</span>
            </div>

            {/* Features socket */}
            <div className="h-7 bg-[#0369a1] text-white text-[10px] font-bold px-2 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-cyan-400/20">
              <span className="text-cyan-200">Features:</span>
              <span className="bg-[#F59E0B] px-1.5 py-0.5 rounded text-[8.5px] text-slate-950 font-bold truncate max-w-[105px]">Life and Water</span>
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
              style={{ animation: 'e2s1StatusReady 7s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'e2s1StatusRunning 7s ease-in-out infinite' }}
            >
              SCANNING PROFILE
            </span>
          </div>
        </div>

        {/* Center Monitor: Planetary Dossier Card */}
        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#030712]">
          <div
            className="w-full max-w-[260px] rounded-xl border-2 p-2.5 bg-[#0a1824] relative flex flex-col gap-2 overflow-hidden shadow-xl"
            style={{ animation: 'e2s1CardGlow 7s ease-in-out infinite' }}
          >
            {/* Laser Scanner Sweep Beam */}
            <div
              className="absolute left-0 right-0 h-1 bg-cyan-300 shadow-[0_0_15px_#22d3ee,0_0_30px_#22d3ee] pointer-events-none z-30"
              style={{ animation: 'e2s1ScanLaser 7s ease-in-out infinite' }}
            >
              <div className="w-full h-8 -translate-y-4 bg-gradient-to-b from-cyan-400/25 to-transparent" />
            </div>

            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1.5">
              <span className="text-[8.5px] font-mono text-cyan-400 font-bold">SEC // 03-TERRA</span>
              <div className="relative flex items-center">
                <span
                  className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-black/50 border border-white/10 text-gray-400"
                  style={{ animation: 'e2s1BadgeUnverified 7s ease-in-out infinite' }}
                >
                  UNVERIFIED
                </span>
                <span
                  className="absolute right-0 text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-400 text-emerald-300 flex items-center gap-1 shadow-sm whitespace-nowrap"
                  style={{ animation: 'e2s1BadgeVerified 7s ease-in-out infinite' }}
                >
                  <ShieldCheck size={10} className="text-emerald-400" />
                  VERIFIED
                </span>
              </div>
            </div>

            {/* Planet Avatar & Name */}
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-lg bg-black/40 border border-cyan-500/40 p-1 flex items-center justify-center shrink-0">
                <img
                  src="/assets/planets/celestial/Earth.svg"
                  alt="Earth"
                  className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] uppercase font-mono text-slate-400 font-bold">Planetary Record</span>
                <span className="text-sm font-black text-white font-mono uppercase leading-tight">Earth</span>
                <span className="text-[9px] text-cyan-300 font-sans">Our Home Planet</span>
              </div>
            </div>

            {/* Data Fields */}
            <div className="flex flex-col gap-1 text-[9px] font-mono">
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/40 border border-white/10">
                <span className="text-slate-400">&quot;type&quot;</span>
                <span className="text-emerald-300 font-bold">&quot;Rocky&quot;</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/40 border border-white/10">
                <span className="text-slate-400">&quot;features&quot;</span>
                <span className="text-cyan-300 font-bold">&quot;Life and Water&quot;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * =============================================================================
 * SLIDE 2: BUILDING PLANET PROFILES (DICTIONARIES)
 * =============================================================================
 * Cursor moves to snap attribute blocks into the planet profile dictionary.
 * Simulation scanner sweeps and updates verified badge!
 */
export function EarthLevel2Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Timing: 6 seconds loop */
        @keyframes e2s2StatusReady {
          0%, 30% { opacity: 1; }
          35%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes e2s2StatusRunning {
          0%, 30% { opacity: 0; }
          35%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        @keyframes e2s2CursorSnap {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes e2s2BlockSnapPulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #38bdf8; box-shadow: 0 0 16px rgba(56,189,248,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #38bdf8; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes e2s2ScannerSweep {
          0%, 36% { top: 0%; opacity: 0; }
          40% { top: 0%; opacity: 1; }
          75% { top: 95%; opacity: 1; }
          80%, 100% { top: 95%; opacity: 0; }
        }
        @keyframes e2s2VerifiedStamp {
          0%, 72% { opacity: 0; transform: scale(0.6); }
          76%, 92% { opacity: 1; transform: scale(1); }
          96%, 100% { opacity: 0; }
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
          <Earth2ToolboxSidebar />

          {/* Block Stack: Matching earth2_planet_dict */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Header: Planet: Mercury ▾ */}
            <div className="h-8 bg-[#64748b] text-white text-[10.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-slate-400/40">
              <div className="flex items-center gap-1.5">
                <Globe size={12} className="text-slate-200" />
                <span>Planet:</span>
              </div>
              <span className="bg-black/50 px-2 py-0.5 rounded text-[10px] text-slate-200 font-mono font-bold">Mercury ▾</span>
            </div>

            {/* Description */}
            <div className="h-7 bg-[#475569] text-white text-[10px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span className="text-slate-300">Description:</span>
              <span className="bg-[#0284C7] px-1.5 py-0.5 rounded text-[8.5px] text-white truncate max-w-[105px]">Small, rocky...</span>
            </div>

            {/* Type (Rocky) - Highlighted & Clicked */}
            <div
              className="relative h-7 bg-[#475569] text-white text-[10px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow z-20"
              style={{ animation: 'e2s2BlockSnapPulse 6s ease-in-out infinite' }}
            >
              <span className="text-slate-300">Type:</span>
              <span className="bg-[#10B981] px-2 py-0.5 rounded text-[9px] text-white font-bold">Rocky</span>

              {/* Large Visible Cursor */}
              <div
                className="absolute right-4 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'e2s2CursorSnap 6s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>

            {/* Features */}
            <div className="h-7 bg-[#475569] text-white text-[10px] font-bold px-2 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-slate-500/20">
              <span className="text-slate-300">Features:</span>
              <span className="bg-[#F59E0B] px-1.5 py-0.5 rounded text-[8.5px] text-slate-950 font-bold truncate max-w-[105px]">Hot &amp; Cold...</span>
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
              style={{ animation: 'e2s2StatusReady 6s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'e2s2StatusRunning 6s ease-in-out infinite' }}
            >
              RUNNING CODE
            </span>
          </div>
        </div>

        {/* Center: Mercury ID Card */}
        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#030712]">
          <div className="w-full max-w-[260px] rounded-xl border-2 border-slate-500/50 p-2.5 bg-[#0f172a] relative flex flex-col gap-2 overflow-hidden shadow-xl">
            {/* Laser Beam */}
            <div
              className="absolute left-0 right-0 h-1 bg-cyan-300 shadow-[0_0_15px_#22d3ee] pointer-events-none z-30"
              style={{ animation: 'e2s2ScannerSweep 6s ease-in-out infinite' }}
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-600 pb-1.5">
              <span className="text-[8.5px] font-mono text-slate-300 font-bold">SEC // 01-HERMES</span>
              <div
                className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-400 text-emerald-300 flex items-center gap-1 shadow-sm"
                style={{ animation: 'e2s2VerifiedStamp 6s ease-in-out infinite' }}
              >
                <ShieldCheck size={10} className="text-emerald-400" />
                VERIFIED
              </div>
            </div>

            {/* Planet Avatar */}
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-lg bg-black/40 border border-slate-500 p-1 flex items-center justify-center shrink-0">
                <img
                  src="/assets/planets/celestial/Mercury.svg"
                  alt="Mercury"
                  className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(148,163,184,0.6)]"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] uppercase font-mono text-slate-400 font-bold">Planetary Record</span>
                <span className="text-sm font-black text-white font-mono uppercase leading-tight">Mercury</span>
                <span className="text-[9px] text-slate-300 font-sans">The Swift Planet</span>
              </div>
            </div>

            {/* Data Fields */}
            <div className="flex flex-col gap-1 text-[9px] font-mono">
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/40 border border-white/10">
                <span className="text-slate-400">&quot;type&quot;</span>
                <span className="text-emerald-300 font-bold">&quot;Rocky&quot;</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/40 border border-white/10">
                <span className="text-slate-400">&quot;features&quot;</span>
                <span className="text-amber-300 font-bold">&quot;Hot/Cold Extremes&quot;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * =============================================================================
 * SLIDE 3: ORDERING PLANETARY ORBITS (PYTHON LISTS)
 * =============================================================================
 * Focus on Tab 2: arranging Mercury through Saturn in orbital order.
 * Simulation reveals the authentic solar system canvas with rotating planets
 * and emerald illuminated orbit rings!
 */
export function EarthLevel2Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Timing: 6 seconds loop */
        @keyframes e2s3StatusReady {
          0%, 30% { opacity: 1; }
          35%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes e2s3StatusRunning {
          0%, 30% { opacity: 0; }
          35%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        @keyframes e2s3CursorPlace {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes e2s3OrbitGlow {
          0%, 36% { border-color: rgba(255, 255, 255, 0.15); box-shadow: none; }
          42%, 92% { border-color: #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.6); }
          96%, 100% { border-color: rgba(255, 255, 255, 0.15); box-shadow: none; }
        }
        @keyframes e2s3Spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
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
          <Earth2ToolboxSidebar activeTab="orbits" />

          {/* Block Stack: Python List matching earth2_solar_system_list */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Header: solar_system = [ */}
            <div className="h-7 bg-[#8B5CF6] text-white text-[10px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span className="font-mono">solar_system = [</span>
            </div>

            {/* Orbit 1: Mercury */}
            <div className="h-6 bg-[#7C3AED] text-white text-[9.5px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span className="text-purple-200">Orbit 1:</span>
              <span className="bg-[#64748B] px-1.5 py-0.5 rounded text-[8.5px] text-white font-mono">Mercury</span>
            </div>

            {/* Orbit 2: Venus */}
            <div className="h-6 bg-[#7C3AED] text-white text-[9.5px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span className="text-purple-200">Orbit 2:</span>
              <span className="bg-[#D97706] px-1.5 py-0.5 rounded text-[8.5px] text-white font-mono">Venus</span>
            </div>

            {/* Orbit 3: Earth - Clicked / Placed */}
            <div
              className="relative h-6 bg-[#7C3AED] text-white text-[9.5px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow z-20"
              style={{ animation: 'e2s3BlockSnapPulse 6s ease-in-out infinite' }}
            >
              <span className="text-purple-200">Orbit 3:</span>
              <span className="bg-[#0284C7] px-1.5 py-0.5 rounded text-[8.5px] text-white font-mono font-bold">Earth</span>

              {/* Large Visible Cursor */}
              <div
                className="absolute right-4 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'e2s3CursorPlace 6s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>

            {/* Orbit 4: Mars */}
            <div className="h-6 bg-[#7C3AED] text-white text-[9.5px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span className="text-purple-200">Orbit 4:</span>
              <span className="bg-[#DC2626] px-1.5 py-0.5 rounded text-[8.5px] text-white font-mono">Mars</span>
            </div>

            {/* List closing: ] */}
            <div className="h-5 bg-[#8B5CF6] text-white text-[10px] font-bold px-2 rounded-b flex items-center border-t border-black/20 shadow border-b border-x border-purple-400/20">
              <span className="font-mono">]</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation with Solar System Orbits */}
      <div className="w-1/2 h-full flex flex-col bg-[#020409] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'e2s3StatusReady 6s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'e2s3StatusRunning 6s ease-in-out infinite' }}
            >
              6 / 6 ALIGNED
            </span>
          </div>
        </div>

        {/* Authentic Solar System Canvas from EarthLevel2Simulation.tsx */}
        <div className="flex-1 min-h-0 relative flex items-center justify-center p-2 overflow-hidden">
          <div className="relative w-[240px] h-[240px] flex items-center justify-center">
            {/* Central Sun */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center pointer-events-none">
              <div
                className="w-9 h-9 rounded-full border border-amber-100 flex items-center justify-center shadow-lg"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #fffbeb 15%, #fde047 35%, #f59e0b 65%, #ea580c 85%, #c2410c 100%)',
                  boxShadow: '0 0 20px #f59e0b, 0 0 40px rgba(245, 158, 11, 0.6)',
                }}
              />
              <span className="text-[7.5px] font-black uppercase text-amber-300 tracking-wider mt-0.5 font-mono">
                SUN
              </span>
            </div>

            {/* Orbit 1: Mercury (r=35px) */}
            <div
              className="absolute top-1/2 left-1/2 rounded-full border pointer-events-none"
              style={{
                width: '70px',
                height: '70px',
                animation: 'e2s3OrbitGlow 6s ease-in-out infinite, e2s3Spin 8s linear infinite',
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#94a3b8] shadow-[0_0_6px_#94a3b8]" />
            </div>

            {/* Orbit 2: Venus (r=55px) */}
            <div
              className="absolute top-1/2 left-1/2 rounded-full border pointer-events-none"
              style={{
                width: '110px',
                height: '110px',
                animation: 'e2s3OrbitGlow 6s ease-in-out infinite, e2s3Spin 11s linear infinite',
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#ec4899] shadow-[0_0_6px_#ec4899]" />
            </div>

            {/* Orbit 3: Earth (r=75px) */}
            <div
              className="absolute top-1/2 left-1/2 rounded-full border pointer-events-none"
              style={{
                width: '150px',
                height: '150px',
                animation: 'e2s3OrbitGlow 6s ease-in-out infinite, e2s3Spin 14s linear infinite',
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#06b6d4] shadow-[0_0_8px_#06b6d4]" />
            </div>

            {/* Orbit 4: Mars (r=95px) */}
            <div
              className="absolute top-1/2 left-1/2 rounded-full border pointer-events-none"
              style={{
                width: '190px',
                height: '190px',
                animation: 'e2s3OrbitGlow 6s ease-in-out infinite, e2s3Spin 17s linear infinite',
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_6px_#ef4444]" />
            </div>

            {/* Orbit 5: Jupiter (r=115px) */}
            <div
              className="absolute top-1/2 left-1/2 rounded-full border pointer-events-none"
              style={{
                width: '230px',
                height: '230px',
                animation: 'e2s3OrbitGlow 6s ease-in-out infinite, e2s3Spin 21s linear infinite',
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

