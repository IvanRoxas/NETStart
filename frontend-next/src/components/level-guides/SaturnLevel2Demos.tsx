"use client";

import React from 'react';
import { Shield, Sparkles, Orbit, Play } from 'lucide-react';

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
 * Slide 1: How to Win Saturn Level 2 (Jumpstarting the Rings)
 */
export function SaturnLevel2Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s2s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes s2s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes s2s1DebrisOrbit {
          from { transform: rotate(0deg) translateX(45px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(45px) rotate(-360deg); }
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
          <Saturn2ToolboxSidebar activeCategory="cases" />

          {/* Actual Blockly Stack: saturn2_start, saturn2_func_route_orbit, saturn2_func_activate_shield, saturn2_case, saturn2_route_orbit, saturn2_end */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Start Program */}
            <div className="h-6 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start Program</span>
            </div>

            {/* Declare Function: Route Orbit */}
            <div className="h-6 bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span className="truncate">Declare Function: Route Orbit</span>
            </div>

            {/* Declare Function: Activate Shield */}
            <div className="h-6 bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span className="truncate">Declare Function: Activate Shield</span>
            </div>

            {/* Case Ice Debris: */}
            <div className="h-6 bg-[#3B82F6] text-white text-[9px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Case</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-cyan-200 font-mono">Ice Debris ▾</span>
              <span>:</span>
            </div>

            {/* Action inside Case 1: Route to Orbit 1 */}
            <div className="h-6 bg-[#EC4899] text-white text-[8.5px] font-bold px-2 ml-3 flex items-center justify-between shadow border-l-2 border-pink-300">
              <span>Route to</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">Orbit 1 ▾</span>
            </div>

            {/* Case Big Asteroid: */}
            <div className="h-6 bg-[#3B82F6] text-white text-[9px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Case</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-red-300 font-mono">Big Asteroid ▾</span>
              <span>:</span>
            </div>

            {/* Action inside Case 2: Activate Shield */}
            <div className="h-6 bg-[#EC4899] text-white text-[8.5px] font-bold px-2 ml-3 flex items-center shadow border-l-2 border-pink-300">
              <span>Activate Shield</span>
            </div>

            {/* End Program */}
            <div className="h-6 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End Program</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Saturn Ring Orbit Routing */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 's2s1Ready 7s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 's2s1Running 7s ease-in-out infinite' }}>ROUTING RINGS</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#080314]">
          <div className="w-full max-w-[260px] h-[160px] rounded-xl border border-purple-500/30 bg-[#140624] p-2.5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-1">
              <span className="text-[8.5px] font-mono text-purple-300 font-bold">SATURN RING ROUTER</span>
              <Orbit size={12} className="text-cyan-400" />
            </div>

            {/* Ring Simulation Canvas */}
            <div className="relative w-full h-20 flex items-center justify-center overflow-hidden">
              {/* Saturn Core */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 shadow-[0_0_15px_rgba(245,158,11,0.6)] z-10" />

              {/* Orbit Ring 1 (Ice) */}
              <div className="absolute w-24 h-12 rounded-[100%] border border-cyan-400/50 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />

              {/* Orbit Ring 2 (Rock) */}
              <div className="absolute w-32 h-16 rounded-[100%] border border-amber-500/50" />

              {/* Orbiting Ice Debris */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee] z-20"
                style={{ animation: 's2s1DebrisOrbit 4s linear infinite' }}
              />
            </div>

            <span className="text-[7.5px] font-mono text-center text-purple-200/80">
              Use switch cases to route ice, rock, and mineral debris into matching orbit rings
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Case Labels & Action Handlers
 */
export function SaturnLevel2Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s2s2Cursor {
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
          <Saturn2ToolboxSidebar activeCategory="actions" />

          {/* Configuring Route to Orbit */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#3B82F6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-blue-400/40">
              <span>Case</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-cyan-200 font-mono">Ice Debris ▾</span>
              <span>:</span>
            </div>

            <div className="h-7 bg-[#EC4899] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between shadow border-l-2 border-pink-300">
              <span>Route to</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">Orbit 1 ▾</span>

              <div
                className="absolute right-4 -bottom-3 pointer-events-none z-30"
                style={{ animation: 's2s2Cursor 6s ease-in-out infinite' }}
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
          <span className="text-cyan-400 text-[9px] font-mono font-bold">CASE MAPPINGS</span>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#080314]">
          <div className="w-full max-w-[260px] rounded-xl border border-purple-500/30 bg-[#140624] p-3 flex flex-col gap-2 shadow-xl">
            <span className="text-[9px] font-mono text-purple-300 font-bold uppercase tracking-wider">Orbit Assignment Guide</span>
            <div className="flex flex-col gap-1.5 text-[9px] font-mono">
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-cyan-500/40">
                <span className="text-cyan-300 font-bold">Ice Debris</span>
                <span className="text-slate-300">Route to Orbit 1</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-amber-500/40">
                <span className="text-amber-300 font-bold">Rock Debris</span>
                <span className="text-slate-300">Route to Orbit 2</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-slate-500/40">
                <span className="text-slate-300 font-bold">Mineral Debris</span>
                <span className="text-slate-300">Route to Orbit 3</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-red-500/40">
                <span className="text-red-300 font-bold">Big Asteroid</span>
                <span className="text-rose-300">Activate Shield</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Shielding from Big Asteroids
 * Authentic blocks: saturn2_case (Big Asteroid) + saturn2_activate_shield
 */
export function SaturnLevel2Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s2s3Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes s2s3Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #EF4444; box-shadow: 0 0 16px rgba(239,68,68,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #EF4444; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s2s3ShieldGlow {
          0%, 30% { transform: scale(0.6); opacity: 0; }
          40%, 88% { transform: scale(1); opacity: 1; filter: drop-shadow(0 0 16px #3b82f6); }
          95%, 100% { transform: scale(0.6); opacity: 0; }
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
          <Saturn2ToolboxSidebar activeCategory="actions" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Case Big Asteroid */}
            <div className="h-7 bg-[#3B82F6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-blue-400/40">
              <span>Case</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-red-300 font-mono">Big Asteroid ▾</span>
              <span>:</span>
            </div>

            {/* Activate Shield - Clicked */}
            <div
              className="relative h-7 bg-[#EC4899] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between shadow border-l-2 border-pink-300 z-20"
              style={{ animation: 's2s3Pulse 6s ease-in-out infinite' }}
            >
              <span>Activate Shield</span>

              <div
                className="absolute right-3 -bottom-3 pointer-events-none z-30"
                style={{ animation: 's2s3Cursor 6s ease-in-out infinite' }}
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
          <span className="text-red-400 text-[9px] font-mono font-bold">HAZARD DEFENSE</span>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#080314]">
          <div className="w-full max-w-[260px] rounded-xl border border-red-500/40 bg-[#1e070d] p-3 flex flex-col items-center gap-2 shadow-xl">
            <span className="text-[9px] font-mono text-red-300 font-bold uppercase tracking-wider">Asteroid Shield Deflection</span>

            <div
              className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center my-1 transition-all"
              style={{ animation: 's2s3ShieldGlow 6s ease-in-out infinite' }}
            >
              <Shield size={28} className="text-blue-300" />
            </div>

            <span className="text-[8px] font-mono text-center text-red-200/80">
              Big asteroids trigger protective deflector shield
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Completing the Rings Protocol with 'End'
 * Authentic block: saturn2_end
 */
export function SaturnLevel2Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s2s4Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes s2s4Pulse {
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
          <Saturn2ToolboxSidebar activeCategory="events" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Start */}
            <div className="h-6 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start Program</span>
            </div>

            {/* Switch Cases */}
            <div className="h-6 bg-[#3B82F6] text-white text-[9px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span>Case Ice: Route to Orbit 1</span>
            </div>
            <div className="h-6 bg-[#3B82F6] text-white text-[9px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span>Case Rock: Route to Orbit 2</span>
            </div>

            {/* End Program - Clicked */}
            <div
              className="relative h-7 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-red-400/40 border-t border-black/20 z-20"
              style={{ animation: 's2s4Pulse 6s ease-in-out infinite' }}
            >
              <span>End Program</span>

              <div
                className="absolute right-3 -bottom-3 pointer-events-none z-30"
                style={{ animation: 's2s4Cursor 6s ease-in-out infinite' }}
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
          <span className="text-emerald-400 text-[9px] font-mono font-bold">RINGS ACTIVE</span>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#080314]">
          <div className="w-full max-w-[260px] rounded-xl border border-emerald-500/40 bg-[#06180c] p-3 flex flex-col gap-2 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1">
              <span className="text-[9px] font-mono text-emerald-300 font-bold uppercase tracking-wider">ALL 4 ORBITS JUMPSTARTED</span>
              <Orbit size={12} className="text-emerald-400" />
            </div>

            <div className="w-full py-2 rounded bg-black/60 border border-emerald-400/40 text-center font-mono text-[9.5px] text-emerald-300 font-bold">
              Saturnian planetary shield 100% stable
            </div>

            <span className="text-[8px] font-mono text-center text-emerald-200/80">
              Switch statement successfully routes all space debris
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
