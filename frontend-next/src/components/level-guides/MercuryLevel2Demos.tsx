"use client";

import React from 'react';
import { Package, Zap, Wrench } from 'lucide-react';

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

function Mercury2ToolboxSidebar({ activeCategory = "loops" }: { activeCategory?: "loops" | "variables" | "logic" | "actions" }) {
  return (
    <div className="flex flex-col gap-2 w-18 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeCategory === 'loops' ? 'text-purple-300 bg-purple-950/80 border-l-2 border-purple-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        Loops
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeCategory === 'variables' ? 'text-cyan-300 bg-cyan-950/80 border-l-2 border-cyan-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        Variables
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeCategory === 'logic' ? 'text-blue-300 bg-blue-950/80 border-l-2 border-blue-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        Logic
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeCategory === 'actions' ? 'text-emerald-300 bg-emerald-950/80 border-l-2 border-emerald-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        Actions
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Mercury Level 2 (The Conveyor Belt)
 * Authentic blocks: mercury2_loop_repeat20, mercury2_scan_var, mercury2_if_check, mercury2_route_to
 */
export function MercuryLevel2Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m2s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m2s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m2s1CrateFeed {
          0% { transform: translateX(-40px); opacity: 0; }
          15% { transform: translateX(0px); opacity: 1; }
          45% { transform: translateX(65px); opacity: 1; }
          65%, 90% { transform: translateX(65px) translateY(-50px); opacity: 0; }
          95%, 100% { transform: translateX(-40px); opacity: 0; }
        }
        @keyframes m2s1ClawPick {
          0%, 35% { transform: translate(110px, 15px); }
          45%, 55% { transform: translate(110px, 50px); }
          65%, 85% { transform: translate(60px, 10px); }
          95%, 100% { transform: translate(110px, 15px); }
        }
      `}</style>

      {/* LEFT PANE */}
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
          <Mercury2ToolboxSidebar activeCategory="loops" />

          {/* Actual Blockly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* mercury2_loop_repeat20 */}
            <div className="h-7 bg-[#7C3AED] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Repeat</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[9px] text-amber-300 font-mono">20</span>
              <span>times</span>
            </div>

            {/* mercury2_scan_var */}
            <div className="h-6 bg-[#0891B2] text-white text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Read the X-Ray Scanner</span>
            </div>

            {/* mercury2_if_check */}
            <div className="h-7 bg-[#2563EB] text-white text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>If</span>
              <span className="bg-[#0891B2] px-1 py-0.5 rounded text-[8px]">Scan Result</span>
              <span>reads</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-cyan-200">Equipment ▾</span>
            </div>

            {/* mercury2_route_to */}
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-4 flex items-center justify-between border-t border-black/20 shadow">
              <span>Send crate to</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-emerald-200">Equipment Belt ▾</span>
            </div>

            {/* mercury2_else */}
            <div className="h-6 bg-[#D97706] text-white text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Otherwise</span>
            </div>

            {/* mercury2_route_to inside else */}
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-4 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-emerald-400/20">
              <span>Send crate to</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-amber-200">Energy Belt ▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Conveyor Belt Rail */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm2s1Ready 7s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'm2s1Running 7s ease-in-out infinite' }}>SORTING CRATES</span>
          </div>
        </div>

        {/* Warehouse Floor */}
        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#0a0514]">
          <div className="w-full max-w-[270px] h-[150px] rounded-xl border border-purple-500/30 bg-[#140824] p-2.5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            {/* Header Chutes */}
            <div className="grid grid-cols-3 gap-2 border-b border-purple-500/20 pb-1.5">
              <div className="h-7 rounded bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center gap-1">
                <Wrench size={10} className="text-cyan-300" />
                <span className="text-[8px] font-mono text-cyan-200 font-bold">EQUIPMENT</span>
              </div>
              <div className="h-7 rounded bg-emerald-950/80 border border-emerald-400/40 flex items-center justify-center gap-1">
                <Package size={10} className="text-emerald-300" />
                <span className="text-[8px] font-mono text-emerald-200 font-bold">ORGANICS</span>
              </div>
              <div className="h-7 rounded bg-amber-950/80 border border-amber-400/40 flex items-center justify-center gap-1">
                <Zap size={10} className="text-amber-300" />
                <span className="text-[8px] font-mono text-amber-200 font-bold">ENERGY</span>
              </div>
            </div>

            {/* Conveyor Feeder Track */}
            <div className="w-full h-11 rounded bg-black/70 border border-purple-400/30 flex items-center px-3 relative overflow-hidden">
              {/* Scanner Archway */}
              <div className="absolute left-[95px] top-0 bottom-0 w-8 border-x-2 border-cyan-400 bg-cyan-500/15 flex items-center justify-center z-10">
                <div className="w-0.5 h-full bg-cyan-300 animate-pulse" />
              </div>

              {/* Moving Crate */}
              <div
                className="w-7 h-7 rounded bg-cyan-600 border border-white flex items-center justify-center text-[8.5px] font-bold text-white shadow-lg relative z-20"
                style={{ animation: 'm2s1CrateFeed 7s ease-in-out infinite' }}
              >
                <Wrench size={12} className="text-white" />
              </div>
            </div>

            {/* Status Footer */}
            <div className="flex items-center justify-between text-[8px] font-mono text-purple-300">
              <span>SCANNER: ACTIVE</span>
              <span className="text-emerald-400 font-bold">SORTED: 20/20</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Adding Logic & Routing Rules
 * Focus on mercury2_if_check with large cursor snapping
 */
export function MercuryLevel2Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m2s2Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m2s2Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m2s2Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes m2s2Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #2563EB; box-shadow: 0 0 16px rgba(37,99,235,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #2563EB; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
      `}</style>

      {/* LEFT PANE */}
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
          <Mercury2ToolboxSidebar activeCategory="logic" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* mercury2_if_check - Highlighted & Clicked */}
            <div
              className="relative h-7 bg-[#2563EB] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-blue-400/40 z-20"
              style={{ animation: 'm2s2Pulse 6s ease-in-out infinite' }}
            >
              <span>If</span>
              <span className="bg-[#0891B2] px-1 py-0.5 rounded text-[8px]">Scan Result</span>
              <span>reads</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-cyan-200">Equipment ▾</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm2s2Cursor 6s ease-in-out infinite' }}>
                <CursorPointer />
              </div>
            </div>

            {/* mercury2_route_to */}
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Send crate to</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-emerald-200">Equipment Belt ▾</span>
            </div>

            {/* mercury2_else */}
            <div className="h-6 bg-[#D97706] text-white text-[9px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Otherwise</span>
            </div>

            {/* mercury2_route_to fallback */}
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-emerald-400/20">
              <span>Send crate to</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-amber-200">Energy Belt ▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm2s2Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'm2s2Running 6s ease-in-out infinite' }}>RULE ARMED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#0a0514]">
          <div className="w-full max-w-[260px] h-[130px] rounded-xl border-2 border-blue-500/50 bg-[#120a22] p-3 flex flex-col justify-between shadow-2xl">
            <span className="text-[9px] font-mono text-blue-300 font-bold">ROUTING RULE</span>
            <div className="w-full py-2 rounded bg-black/60 border border-blue-400/40 text-center font-mono text-[10px] text-emerald-300 font-bold">
              Equipment → Equipment Belt
            </div>
            <span className="text-[8.5px] font-mono text-center text-slate-300">Claw automatically routes matches</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Branching with Else If and Else
 * Focus on mercury2_elseif_check & mercury2_else
 */
export function MercuryLevel2Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m2s3Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m2s3Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m2s3Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes m2s3Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #7C3AED; box-shadow: 0 0 16px rgba(124,58,237,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #7C3AED; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
      `}</style>

      {/* LEFT PANE */}
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
          <Mercury2ToolboxSidebar activeCategory="logic" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* mercury2_if_check */}
            <div className="h-6 bg-[#2563EB] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-blue-400/40">
              <span>If Scan reads</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-cyan-200">Equipment</span>
            </div>

            {/* mercury2_elseif_check - Clicked */}
            <div
              className="relative h-7 bg-[#7C3AED] text-white text-[9px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow z-20"
              style={{ animation: 'm2s3Pulse 6s ease-in-out infinite' }}
            >
              <span>Else If reads</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-emerald-200 font-mono">Organics ▾</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm2s3Cursor 6s ease-in-out infinite' }}>
                <CursorPointer />
              </div>
            </div>

            {/* mercury2_route_to */}
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Send crate to</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-emerald-200">Organics Belt ▾</span>
            </div>

            {/* mercury2_else */}
            <div className="h-6 bg-[#D97706] text-white text-[9px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Otherwise</span>
            </div>

            {/* mercury2_route_to fallback */}
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-emerald-400/20">
              <span>Send crate to</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-amber-200">Energy Belt ▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm2s3Ready 6s ease-in-out infinite' }}>STANDBY</span>
            <span className="absolute right-0 text-[#a855f7] drop-shadow-[0_0_6px_rgba(168,85,247,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'm2s3Running 6s ease-in-out infinite' }}>BRANCH CHECK</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#0a0514]">
          <div className="w-full max-w-[260px] h-[130px] rounded-xl border-2 border-purple-500/50 bg-[#120a22] p-2.5 flex flex-col justify-between shadow-2xl">
            <span className="text-[9px] font-mono text-purple-300 font-bold">MULTI-BRANCH LOGIC</span>
            <div className="grid grid-cols-3 gap-1.5 py-1">
              <div className="rounded p-1 bg-black/50 border border-cyan-500/30 text-center">
                <span className="text-[7.5px] font-mono text-cyan-300 block font-bold">IF</span>
                <span className="text-[7px] text-slate-300">Equipment</span>
              </div>
              <div className="rounded p-1 bg-purple-950/80 border border-purple-400 text-center">
                <span className="text-[7.5px] font-mono text-purple-200 block font-bold">ELSE IF</span>
                <span className="text-[7px] text-emerald-300">Organics</span>
              </div>
              <div className="rounded p-1 bg-black/50 border border-amber-500/30 text-center">
                <span className="text-[7.5px] font-mono text-amber-300 block font-bold">ELSE</span>
                <span className="text-[7px] text-amber-200">Energy</span>
              </div>
            </div>
            <span className="text-[8px] font-mono text-center text-slate-300">Every crate type has a matching branch</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Routing All 20 Crates
 * Focus on complete loop execution and belt sorting
 */
export function MercuryLevel2Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m2s4Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m2s4Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m2s4Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes m2s4Pulse {
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
          className="flex-1 p-3 flex flex-row gap-4 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury2ToolboxSidebar activeCategory="actions" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* mercury2_loop_repeat20 */}
            <div className="h-7 bg-[#7C3AED] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Repeat</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-yellow-300 font-mono">20</span>
              <span>times</span>
            </div>

            {/* mercury2_scan_var */}
            <div className="h-6 bg-[#0891B2] text-white text-[9px] font-bold px-2 ml-3 flex items-center shadow border-t border-black/20">
              <span>Read the X-Ray Scanner</span>
            </div>

            {/* mercury2_route_to - Clicked */}
            <div
              className="relative h-7 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-emerald-400/20 z-20"
              style={{ animation: 'm2s4Pulse 6s ease-in-out infinite' }}
            >
              <span>Send crate to</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-emerald-200">Matching Belt ▾</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm2s4Cursor 6s ease-in-out infinite' }}>
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
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm2s4Ready 6s ease-in-out infinite' }}>SORTING</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'm2s4Running 6s ease-in-out infinite' }}>20/20 SORTED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#0a0514]">
          <div className="w-full max-w-[260px] h-[130px] rounded-xl border-2 border-emerald-500/50 bg-[#120a22] p-2.5 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1">
              <span className="text-[9px] font-mono text-emerald-300 font-bold">ALL CARGO SORTED</span>
              <span className="text-[8px] font-mono text-emerald-400">100% ACCURACY</span>
            </div>

            <div className="flex justify-around items-center py-2">
              <div className="text-center">
                <span className="text-[11px] font-bold text-cyan-300 block">7</span>
                <span className="text-[7px] font-mono text-slate-400">Equipment</span>
              </div>
              <div className="text-center">
                <span className="text-[11px] font-bold text-emerald-300 block">7</span>
                <span className="text-[7px] font-mono text-slate-400">Organics</span>
              </div>
              <div className="text-center">
                <span className="text-[11px] font-bold text-amber-300 block">6</span>
                <span className="text-[7px] font-mono text-slate-400">Energy</span>
              </div>
            </div>

            <span className="text-[8.5px] font-mono text-center text-slate-300">Conveyor clears when loop completes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
