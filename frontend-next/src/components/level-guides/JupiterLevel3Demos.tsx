"use client";

import React from 'react';
import { Cpu, ShieldCheck, KeyRound, Play } from 'lucide-react';

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

function Jupiter3ToolboxSidebar({ activeCategory = "blueprints" }: { activeCategory?: "blueprints" | "data" | "actions" | "badges" }) {
  return (
    <div className="flex flex-col gap-1.5 w-20 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "blueprints"
          ? "text-indigo-300 bg-indigo-950/80 border-indigo-400"
          : "text-indigo-400/60 bg-indigo-950/30 border-indigo-500/30"
      }`}>
        Blueprints
      </div>
      <div className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "data"
          ? "text-emerald-300 bg-emerald-950/80 border-emerald-400"
          : "text-emerald-400/60 bg-emerald-950/30 border-emerald-500/30"
      }`}>
        Profile Data
      </div>
      <div className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "actions"
          ? "text-purple-300 bg-purple-950/80 border-purple-400"
          : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
      }`}>
        Actions
      </div>
      <div className={`text-[8.5px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "badges"
          ? "text-amber-300 bg-amber-950/80 border-amber-400"
          : "text-amber-400/60 bg-amber-950/30 border-amber-500/30"
      }`}>
        Print Badges
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Jupiter Level 3 (The AI Core Lockdown)
 */
export function JupiterLevel3Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes j3s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes j3s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes j3s1CardPrint {
          0%, 30% { transform: translateY(-20px); opacity: 0; }
          45%, 90% { transform: translateY(0); opacity: 1; }
          95%, 100% { opacity: 0; }
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
          <Jupiter3ToolboxSidebar activeCategory="blueprints" />

          {/* Actual Blockly Stack: java_class_wrapper, java_private_clearance, java_public_role, java_method_block, java_instantiate_object */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Class Blueprint Wrapper: class AdminProfile { */}
            <div className="h-7 bg-[#6366F1] text-white text-[10px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-indigo-400/40">
              <span>Blueprint: class</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-yellow-300 font-mono text-[9px]">AdminProfile ▾</span>
              <span>&#123;</span>
            </div>

            {/* Private Data Inside Blueprint: clearanceLevel = 4 */}
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between shadow">
              <span>Private: clearanceLevel =</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-yellow-300 font-mono">4 ▾</span>
            </div>

            {/* Public Data Inside Blueprint: role = "Admin" */}
            <div className="h-6 bg-[#E11D48] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between shadow">
              <span>Public: role =</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;Admin&quot; ▾</span>
            </div>

            {/* Action Inside Blueprint: unlockDoors() */}
            <div className="h-6 bg-[#8B5CF6] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between shadow">
              <span>Action:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-cyan-200 font-mono">unlockDoors() ▾</span>
            </div>

            {/* Blueprint Close */}
            <div className="h-5 bg-[#6366F1] text-white text-[9px] font-bold px-2 flex items-center shadow">
              <span>&#125;</span>
            </div>

            {/* Instantiation: Print Physical Badge: new AdminProfile() */}
            <div className="h-7 bg-[#FF912D] text-slate-950 text-[9.5px] font-black px-2 mt-1 rounded shadow flex items-center justify-between border-t border-amber-300/40">
              <span>Print Badge: new</span>
              <span className="bg-black/70 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[9px]">AdminProfile ▾</span>
              <span>()</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic AI Vault & Physical Badge Scanner */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'j3s1Ready 7s ease-in-out infinite' }}>SCANNING</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'j3s1Running 7s ease-in-out infinite' }}>CORE UNLOCKED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#0c0414]">
          <div className="w-full max-w-[260px] h-[160px] rounded-xl border border-indigo-500/40 bg-[#160826] p-2.5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-indigo-500/30 pb-1">
              <span className="text-[8.5px] font-mono text-indigo-300 font-bold">AI VAULT // AUTH SLOT</span>
              <KeyRound size={12} className="text-amber-400" />
            </div>

            {/* Printed Physical Badge */}
            <div className="w-full flex items-center justify-center py-1">
              <div
                className="w-44 p-2 rounded-lg bg-black/70 border-2 border-emerald-400 flex items-center gap-2.5 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                style={{ animation: 'j3s1CardPrint 7s ease-in-out infinite' }}
              >
                <div className="w-8 h-8 rounded bg-emerald-950 border border-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} className="text-emerald-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[7.5px] font-mono font-bold text-emerald-300 uppercase leading-none">Admin Profile</span>
                  <span className="text-[9px] font-mono font-black text-white">CLEARANCE: 4</span>
                  <span className="text-[7px] text-slate-400">Action: unlockDoors</span>
                </div>
              </div>
            </div>

            <span className="text-[7.5px] font-mono text-center text-indigo-200/80">
              Define class blueprint and print badge with 'new' to authorize AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Instantiating Physical Badges with New
 */
export function JupiterLevel3Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes j3s2Cursor {
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
          <Jupiter3ToolboxSidebar activeCategory="badges" />

          {/* Instantiation block */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-8 bg-[#FF912D] text-slate-950 text-[10px] font-black px-2 rounded shadow flex items-center justify-between border-t border-amber-300/40">
              <span>Print Badge: new</span>
              <span className="bg-black/70 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[9.5px]">AdminProfile ▾</span>
              <span>()</span>

              <div
                className="absolute right-4 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'j3s2Cursor 6s ease-in-out infinite' }}
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
          <span className="text-amber-400 text-[9px] font-mono font-bold">OOP INSTANTIATION</span>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#0c0414]">
          <div className="w-full max-w-[260px] rounded-xl border border-amber-500/40 bg-[#160826] p-3 flex flex-col gap-2 shadow-xl">
            <span className="text-[9px] font-mono text-amber-300 font-bold uppercase tracking-wider">Blueprint vs Physical Object</span>
            <div className="flex flex-col gap-1.5 text-[9px] font-mono">
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-indigo-500/40">
                <span className="text-indigo-300 font-bold">Blueprint: class</span>
                <span className="text-slate-300">The design template</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-amber-500/40">
                <span className="text-amber-300 font-bold">new Object()</span>
                <span className="text-slate-300">Creates real badge in memory</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Encapsulating Clearance & Role Methods
 * Authentic blocks: java_private_clearance, java_public_role, java_method_block
 */
export function JupiterLevel3Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes j3s3Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes j3s3Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #10B981; box-shadow: 0 0 16px rgba(16,185,129,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #10B981; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
      `}</style>

      {/* LEFT PANE */}
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
          <Jupiter3ToolboxSidebar activeCategory="data" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Class Blueprint */}
            <div className="h-7 bg-[#6366F1] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-indigo-400/40">
              <span>class AdminProfile &#123;</span>
            </div>

            {/* Private Clearance - Clicked */}
            <div
              className="relative h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between shadow border-t border-black/20 z-20"
              style={{ animation: 'j3s3Pulse 6s ease-in-out infinite' }}
            >
              <span>private clearance =</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-emerald-200 font-mono">4</span>

              <div
                className="absolute right-3 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'j3s3Cursor 6s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>

            {/* Public Role */}
            <div className="h-6 bg-[#3B82F6] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between shadow border-t border-black/20">
              <span>public role =</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-blue-200 font-mono">&quot;Admin&quot;</span>
            </div>

            {/* Action Method */}
            <div className="h-6 bg-[#A855F7] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between shadow border-t border-black/20 border-b border-x border-purple-400/20">
              <span>Method: unlockDoors()</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <span className="text-emerald-400 text-[9px] font-mono font-bold">ENCAPSULATION</span>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#0c0414]">
          <div className="w-full max-w-[260px] rounded-xl border border-emerald-500/40 bg-[#081e10] p-3 flex flex-col gap-2 shadow-xl">
            <span className="text-[9px] font-mono text-emerald-300 font-bold uppercase tracking-wider">Access Modifiers</span>

            <div className="flex flex-col gap-1.5 text-[8.5px] font-mono">
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-emerald-500/30">
                <span className="text-emerald-300 font-bold">private</span>
                <span className="text-slate-300">Protected security clearance</span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-black/50 border border-blue-500/30">
                <span className="text-blue-300 font-bold">public</span>
                <span className="text-slate-300">Readable badge title</span>
              </div>
            </div>

            <span className="text-[8px] font-mono text-center text-emerald-200/80">
              Encapsulation prevents unauthorized clearance tampering
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Printing 4 Badges to Bypass Lockdown
 * Authentic blocks: new AdminProfile(), TechProfile(), SecurityProfile(), VisitorProfile()
 */
export function JupiterLevel3Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes j3s4Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes j3s4Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #FF912D; box-shadow: 0 0 16px rgba(255,145,45,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #FF912D; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes j3s4BadgeGlow {
          0%, 30% { opacity: 0.3; }
          40%, 90% { opacity: 1; filter: drop-shadow(0 0 10px #10b981); }
          96%, 100% { opacity: 0.3; }
        }
      `}</style>

      {/* LEFT PANE */}
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
          <Jupiter3ToolboxSidebar activeCategory="badges" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Print Admin Badge */}
            <div className="h-6 bg-[#FF912D] text-slate-950 text-[9px] font-black px-2 rounded-t flex items-center justify-between border-t border-amber-300/40">
              <span>new AdminProfile()</span>
            </div>
            {/* Print Tech Badge */}
            <div className="h-6 bg-[#FF912D] text-slate-950 text-[9px] font-black px-2 flex items-center justify-between border-t border-black/20">
              <span>new TechProfile()</span>
            </div>
            {/* Print Security Badge */}
            <div className="h-6 bg-[#FF912D] text-slate-950 text-[9px] font-black px-2 flex items-center justify-between border-t border-black/20">
              <span>new SecurityProfile()</span>
            </div>
            {/* Print Visitor Badge - Clicked */}
            <div
              className="relative h-7 bg-[#FF912D] text-slate-950 text-[9px] font-black px-2 rounded-b flex items-center justify-between border-t border-black/20 border-b border-amber-300/40 z-20"
              style={{ animation: 'j3s4Pulse 6s ease-in-out infinite' }}
            >
              <span>new VisitorProfile()</span>

              <div
                className="absolute right-3 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'j3s4Cursor 6s ease-in-out infinite' }}
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
          <span className="text-emerald-400 text-[9px] font-mono font-bold">4/4 BADGES ACTIVE</span>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#0c0414]">
          <div className="w-full max-w-[260px] rounded-xl border border-emerald-500/40 bg-[#120822] p-2.5 flex flex-col gap-2 shadow-xl">
            <span className="text-[9px] font-mono text-emerald-300 font-bold uppercase tracking-wider">Authentication Grid</span>

            <div className="grid grid-cols-4 gap-1 py-1">
              <div
                className="rounded p-1 bg-black/60 border border-emerald-400 flex flex-col items-center text-center transition-all"
                style={{ animation: 'j3s4BadgeGlow 6s ease-in-out infinite' }}
              >
                <KeyRound size={12} className="text-yellow-400" />
                <span className="text-[6px] font-mono mt-0.5 text-slate-300">Admin</span>
              </div>
              <div
                className="rounded p-1 bg-black/60 border border-emerald-400 flex flex-col items-center text-center transition-all"
                style={{ animation: 'j3s4BadgeGlow 6s ease-in-out infinite', animationDelay: '0.4s' }}
              >
                <KeyRound size={12} className="text-cyan-400" />
                <span className="text-[6px] font-mono mt-0.5 text-slate-300">Tech</span>
              </div>
              <div
                className="rounded p-1 bg-black/60 border border-emerald-400 flex flex-col items-center text-center transition-all"
                style={{ animation: 'j3s4BadgeGlow 6s ease-in-out infinite', animationDelay: '0.8s' }}
              >
                <KeyRound size={12} className="text-purple-400" />
                <span className="text-[6px] font-mono mt-0.5 text-slate-300">Security</span>
              </div>
              <div
                className="rounded p-1 bg-black/60 border border-emerald-400 flex flex-col items-center text-center transition-all"
                style={{ animation: 'j3s4BadgeGlow 6s ease-in-out infinite', animationDelay: '1.2s' }}
              >
                <KeyRound size={12} className="text-emerald-400" />
                <span className="text-[6px] font-mono mt-0.5 text-slate-300">Visitor</span>
              </div>
            </div>

            <span className="text-[7.5px] font-mono text-center text-emerald-200/80">
              Instantiate all 4 profiles to unlock the AI Core
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
