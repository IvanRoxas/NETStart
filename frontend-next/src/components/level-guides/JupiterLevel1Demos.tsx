"use client";

import React from 'react';
import { Lock, Unlock, Sparkles, Check, CheckCircle2 } from 'lucide-react';

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

function Jupiter1ToolboxSidebar({ activeCategory = "variables" }: { activeCategory?: "variables" | "actions" }) {
  return (
    <div className="flex flex-col gap-1.5 w-20 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "variables"
          ? "text-purple-300 bg-purple-950/80 border-purple-400"
          : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
      }`}>
        Variables
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "actions"
          ? "text-rose-300 bg-rose-950/80 border-rose-400"
          : "text-rose-400/60 bg-rose-950/30 border-rose-500/30"
      }`}>
        Actions
      </div>
    </div>
  );
}

/**
 * Authentic Jupiter Heavy Airlock Blast Gate Scene replicating JupiterLevel1Simulation.tsx
 */
function Jupiter1AirlockScene({
  isUnlocked = false,
  stringLockFilled = true,
  pinLockFilled = true,
  boolLockFilled = true,
}: {
  isUnlocked?: boolean;
  stringLockFilled?: boolean;
  pinLockFilled?: boolean;
  boolLockFilled?: boolean;
}) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#0f051c] select-none font-mono">
      {/* 1. Ceiling Mounted Siren Beacon */}
      <div className="w-full flex flex-col items-center shrink-0 z-30">
        <div className="w-full h-1.5 bg-[#1b0a2e] border-b border-purple-500/30" />
        <div className="w-10 h-4 bg-gradient-to-b from-black/60 to-transparent rounded-b-xl border-b border-x border-white/20 flex items-center justify-center shadow">
          <span
            className={`w-4 h-2 rounded-full transition-all duration-300 ${
              isUnlocked ? "bg-emerald-400 shadow-[0_0_14px_#22c55e]" : "bg-red-500 shadow-[0_0_14px_#ef4444] animate-pulse"
            }`}
          />
        </div>
      </div>

      {/* 2. Central Blast Gate Archway */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-3 min-h-0 my-auto">
        <div className="w-full max-w-[270px] h-[165px] rounded-2xl border-2 border-[#35135f] bg-[#090214] flex flex-col justify-between overflow-hidden shadow-2xl relative">
          {/* Top Marquee Status Bar */}
          <div className="h-6 bg-[#140626] border-b border-purple-900/50 flex items-center justify-center shrink-0 px-2">
            {isUnlocked ? (
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[9px] tracking-wider uppercase">
                <CheckCircle2 size={11} />
                <span>ACCESS GRANTED // AIRLOCK OPEN</span>
              </div>
            ) : (
              <span className="text-red-500 font-bold text-[8.5px] tracking-wider uppercase animate-pulse">
                ACCESS DENIED // 3 LOCKS ACTIVE
              </span>
            )}
          </div>

          {/* 3 Physical Security Locks on the Wall */}
          <div className="px-2.5 pt-1.5 grid grid-cols-3 gap-1.5 z-20">
            {/* String Lock */}
            <div
              className={`rounded p-1 border flex flex-col items-center text-center transition-all ${
                stringLockFilled
                  ? "bg-blue-950/60 border-blue-400 text-blue-200"
                  : "bg-black/50 border-white/10 text-gray-500"
              }`}
            >
              <span className="text-[6.5px] font-bold">STRING</span>
              <span className="text-[7.5px] font-black truncate max-w-[65px]">
                {stringLockFilled ? '"Jupiter"' : "LOCKED"}
              </span>
            </div>

            {/* PIN (int) Lock */}
            <div
              className={`rounded p-1 border flex flex-col items-center text-center transition-all ${
                pinLockFilled
                  ? "bg-emerald-950/60 border-emerald-400 text-emerald-200"
                  : "bg-black/50 border-white/10 text-gray-500"
              }`}
            >
              <span className="text-[6.5px] font-bold">PIN (INT)</span>
              <span className="text-[7.5px] font-black">
                {pinLockFilled ? "1234" : "LOCKED"}
              </span>
            </div>

            {/* Boolean Lock */}
            <div
              className={`rounded p-1 border flex flex-col items-center text-center transition-all ${
                boolLockFilled
                  ? "bg-amber-950/60 border-amber-400 text-amber-200"
                  : "bg-black/50 border-white/10 text-gray-500"
              }`}
            >
              <span className="text-[6.5px] font-bold">BOOLEAN</span>
              <span className="text-[7.5px] font-black">
                {boolLockFilled ? "TRUE" : "LOCKED"}
              </span>
            </div>
          </div>

          {/* Main Blast Doors (Sliding Apart) */}
          <div className="relative flex-1 m-2 rounded-lg bg-[#070110] border border-purple-950/60 flex items-center justify-center overflow-hidden">
            {/* Deep Interior Corridor Revealed When Doors Slide Apart */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#18062f] to-[#05010a]">
              <div className="flex flex-col items-center gap-0.5">
                <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-300 uppercase tracking-widest">
                  AIRLOCK CLEARED
                </span>
              </div>
            </div>

            {/* Sliding Left & Right Heavy Steel Door Wings */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1/2 bg-[#250d3d] border-r-2 border-purple-500/50 flex flex-col justify-between py-1 px-1.5 transition-transform duration-700 ease-in-out shadow-lg ${
                isUnlocked ? "-translate-x-full" : "translate-x-0"
              }`}
            >
              <div className="w-full h-0.5 bg-white/20 rounded" />
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <div className="w-full h-0.5 bg-white/20 rounded" />
            </div>

            <div
              className={`absolute top-0 bottom-0 right-0 w-1/2 bg-[#250d3d] border-l-2 border-purple-500/50 flex flex-col justify-between py-1 px-1.5 transition-transform duration-700 ease-in-out shadow-lg ${
                isUnlocked ? "translate-x-full" : "translate-x-0"
              }`}
            >
              <div className="w-full h-0.5 bg-white/20 rounded ml-auto" />
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse ml-auto" />
              <div className="w-full h-0.5 bg-white/20 rounded ml-auto" />
            </div>
          </div>

          {/* Bottom Deck Treadplate */}
          <div className="h-3 bg-[#110424] border-t border-purple-900/40 flex items-center justify-between px-3">
            <span className="w-8 h-0.5 bg-purple-500/40 rounded" />
            <span className="w-8 h-0.5 bg-purple-500/40 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Jupiter Level 1 (Declaring Variables & Opening Airlock)
 */
export function JupiterLevel1Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes j1s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes j1s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
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
          <Jupiter1ToolboxSidebar activeCategory="variables" />

          {/* Actual Blockly Stack: jupiter_variable_declare, jupiter_action_enter_code, jupiter_action_unlock_doors */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* create [String] password = "Jupiter" */}
            <div className="h-7 bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span className="font-mono">create</span>
              <span className="bg-[#2563EB] px-1.5 py-0.5 rounded text-[8.5px] font-bold">String</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-yellow-300 font-mono">password ▾</span>
              <span>=</span>
              <span className="bg-[#D946EF] px-1 py-0.5 rounded text-[8.5px] font-mono text-white">&quot;...&quot;</span>
            </div>

            {/* create [int] pin = 1234 */}
            <div className="h-7 bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span className="font-mono">create</span>
              <span className="bg-[#10B981] px-1.5 py-0.5 rounded text-[8.5px] font-bold">int</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-yellow-300 font-mono">pin ▾</span>
              <span>=</span>
              <span className="bg-[#10B981] px-1.5 py-0.5 rounded text-[8.5px] font-mono text-white">1234</span>
            </div>

            {/* create [boolean] override = true */}
            <div className="h-7 bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span className="font-mono">create</span>
              <span className="bg-[#F59E0B] text-slate-950 px-1.5 py-0.5 rounded text-[8.5px] font-bold">boolean</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-yellow-300 font-mono">override ▾</span>
              <span>=</span>
              <span className="bg-[#F59E0B] text-slate-950 px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold">true</span>
            </div>

            {/* enter [password ▾] into [String Lock ▾] */}
            <div className="h-6 bg-[#EC4899] text-white text-[9px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>enter</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-yellow-300 font-mono">password ▾</span>
              <span>into</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-cyan-200">String Lock ▾</span>
            </div>

            {/* unlock airlock doors */}
            <div className="h-7 bg-[#F43F5E] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-rose-400/40 border-t border-black/20">
              <span>unlock airlock doors</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Jupiter Blast Gates & Locks */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'j1s1Ready 7s ease-in-out infinite' }}>LOCKED</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'j1s1Running 7s ease-in-out infinite' }}>DOORS UNLOCKED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Jupiter1AirlockScene isUnlocked={true} stringLockFilled={true} pinLockFilled={true} boolLockFilled={true} />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Declaring Variables with Box Types (String, int, boolean)
 */
export function JupiterLevel1Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes j1s2Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes j1s2Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #8B5CF6; box-shadow: 0 0 16px rgba(139,92,246,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #8B5CF6; }
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
          <Jupiter1ToolboxSidebar activeCategory="variables" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* create [String] password = "..." */}
            <div
              className="relative h-7 bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-purple-400/40 z-20"
              style={{ animation: 'j1s2Pulse 6s ease-in-out infinite' }}
            >
              <span className="font-mono">create</span>
              <span className="bg-[#2563EB] px-1.5 py-0.5 rounded text-[8.5px] font-bold">String</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-yellow-300 font-mono">password ▾</span>
              <span>=</span>
              <span className="bg-[#D946EF] px-1 py-0.5 rounded text-[8.5px] font-mono text-white">&quot;...&quot;</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'j1s2Cursor 6s ease-in-out infinite' }}>
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
            <span className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]">VARIABLE ALLOCATED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Jupiter1AirlockScene isUnlocked={false} stringLockFilled={true} pinLockFilled={false} boolLockFilled={false} />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Entering Variables into Lock Slots
 */
export function JupiterLevel1Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes j1s3Cursor {
          0% { transform: translate(-30px, 40px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(30px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-30px, 40px); opacity: 0; }
        }
        @keyframes j1s3Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #EC4899; box-shadow: 0 0 16px rgba(236,72,153,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #EC4899; }
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
          <Jupiter1ToolboxSidebar activeCategory="actions" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div
              className="relative h-7 bg-[#EC4899] text-white text-[9.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-pink-400/40 z-20"
              style={{ animation: 'j1s3Pulse 6s ease-in-out infinite' }}
            >
              <span>enter</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-yellow-300 font-mono">password ▾</span>
              <span>into</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-cyan-200">String Lock ▾</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'j1s3Cursor 6s ease-in-out infinite' }}>
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
            <span className="text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]">LOCK INSERTION</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Jupiter1AirlockScene isUnlocked={false} stringLockFilled={true} pinLockFilled={true} boolLockFilled={false} />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Commanding Airlock to Unlock
 */
export function JupiterLevel1Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes j1s4Pulse {
          0%, 25% { filter: brightness(1); }
          30%, 85% { filter: brightness(1.3); outline: 2px solid #F43F5E; }
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
          <Jupiter1ToolboxSidebar activeCategory="actions" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div
              className="h-7 bg-[#F43F5E] text-white text-[9.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-rose-400/40"
              style={{ animation: 'j1s4Pulse 6s ease-in-out infinite' }}
            >
              <span>unlock airlock doors</span>
              <Unlock size={11} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Clearance Granted */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] font-bold whitespace-nowrap">
              CLEARANCE GRANTED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Jupiter1AirlockScene isUnlocked={true} stringLockFilled={true} pinLockFilled={true} boolLockFilled={true} />
        </div>
      </div>
    </div>
  );
}
