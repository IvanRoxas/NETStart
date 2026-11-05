"use client";

import React from 'react';
import { Wind, Droplets, Sprout, Sparkles, Check } from 'lucide-react';

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

function Mercury1ToolboxSidebar({ activeCategory = "tags" }: { activeCategory?: "tags" | "classes" | "ids" | "actions" }) {
  return (
    <div className="flex flex-col gap-1.5 w-20 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "tags"
          ? "text-red-300 bg-red-950/80 border-red-400"
          : "text-red-400/60 bg-red-950/30 border-red-500/30"
      }`}>
        Tag (vent)
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "classes"
          ? "text-amber-300 bg-amber-950/80 border-amber-400"
          : "text-amber-400/60 bg-amber-950/30 border-amber-500/30"
      }`}>
        Class (.shrub)
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "ids"
          ? "text-blue-300 bg-blue-950/80 border-blue-400"
          : "text-blue-400/60 bg-blue-950/30 border-blue-500/30"
      }`}>
        ID (#flower)
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "actions"
          ? "text-emerald-300 bg-emerald-950/80 border-emerald-400"
          : "text-emerald-400/60 bg-emerald-950/30 border-emerald-500/30"
      }`}>
        Actions
      </div>
    </div>
  );
}

/**
 * Authentic Mercury Biodome Stage replicating MercuryLevel1Biodome.tsx
 */
function MercuryBiodomeScene({
  ventsOpen = true,
  shrubsFertilized = true,
  flowerBloomed = true,
}: {
  ventsOpen?: boolean;
  shrubsFertilized?: boolean;
  flowerBloomed?: boolean;
}) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#030d08] select-none font-mono">
      {/* 1. Curved Glass Greenhouse Biodome Frame & Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#021a10] via-[#052818] to-[#010905] pointer-events-none" />

      {/* Dome Overhead Glass Rib Arches */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
        <path d="M 0,200 Q 150,20 300,200" fill="none" stroke="#34d399" strokeWidth="1.5" />
        <path d="M 50,200 Q 150,40 250,200" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="150" y1="20" x2="150" y2="200" stroke="#34d399" strokeWidth="1" opacity="0.5" />
      </svg>

      {/* 2. Top Ventilation Shutters (<vent>) */}
      <div className="relative z-20 w-full px-3 pt-2 flex items-center justify-between">
        {/* Left Vent */}
        <div
          className={`px-2 py-1 rounded border flex items-center gap-1 transition-all ${
            ventsOpen
              ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              : "bg-red-950/80 border-red-500 text-red-400"
          }`}
        >
          <Wind size={10} className={ventsOpen ? "animate-pulse" : ""} />
          <span className="text-[7.5px] font-bold">&lt;vent 1&gt; {ventsOpen ? "OPEN" : "SHUT"}</span>
        </div>

        {/* Right Vent */}
        <div
          className={`px-2 py-1 rounded border flex items-center gap-1 transition-all ${
            ventsOpen
              ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              : "bg-red-950/80 border-red-500 text-red-400"
          }`}
        >
          <Wind size={10} className={ventsOpen ? "animate-pulse" : ""} />
          <span className="text-[7.5px] font-bold">&lt;vent 2&gt; {ventsOpen ? "OPEN" : "SHUT"}</span>
        </div>
      </div>

      {/* 3. Centerpiece Flower Pedestal (#star-flower) & Foliage (.shrub) */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center min-h-0">
        {/* Blooming Centerpiece Star Flower (#star-flower) */}
        <div className="relative flex flex-col items-center">
          {/* Petals */}
          <div
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
              flowerBloomed
                ? "bg-emerald-950/80 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.7)] scale-110"
                : "bg-slate-900 border-slate-700 opacity-60"
            }`}
          >
            <Sprout
              size={28}
              className={`transition-colors duration-500 ${
                flowerBloomed ? "text-emerald-300 animate-pulse" : "text-slate-500"
              }`}
            />
          </div>

          <span
            className={`text-[8.5px] font-mono font-bold mt-1 px-2 py-0.5 rounded border transition-colors ${
              flowerBloomed
                ? "text-emerald-300 bg-emerald-950/70 border-emerald-400/50"
                : "text-slate-400 bg-black/50 border-white/10"
            }`}
          >
            #star-flower {flowerBloomed ? "BLOOMING" : "DORMANT"}
          </span>
        </div>
      </div>

      {/* 4. Terraced Garden Soil & Shrub Row (.shrub) */}
      <div className="relative z-20 w-full h-10 bg-gradient-to-t from-[#021008] to-[#0d2a1a] border-t border-emerald-500/40 px-3 flex items-center justify-between">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                shrubsFertilized ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-amber-700"
              }`}
            />
            <span className="text-[7px] text-emerald-300 font-mono">.shrub-{idx}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Mercury Level 1 (Full DOM Protocol to Revive the Biodome)
 */
export function MercuryLevel1Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
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
          <Mercury1ToolboxSidebar activeCategory="tags" />

          {/* Actual Blockly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Target Tag: vent do: Open */}
            <div className="h-6 bg-[#DC2626] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-red-400/40">
              <span>Target Tag</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;vent&quot;</span>
              <span>do:</span>
            </div>
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 flex items-center shadow border-l-2 border-emerald-300">
              <span>Open</span>
            </div>

            {/* Target Class: .shrub do: For each item do: Fertilize */}
            <div className="h-6 bg-[#D97706] text-white text-[9px] font-bold px-2 mt-1 flex items-center justify-between shadow border-t border-black/20">
              <span>Target Class</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;.shrub&quot;</span>
              <span>do:</span>
            </div>
            <div className="h-6 bg-[#7C3AED] text-white text-[8.5px] font-bold px-2 ml-2 flex items-center shadow border-l-2 border-purple-300">
              <span>For each item do:</span>
            </div>
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-4 flex items-center shadow border-l-2 border-emerald-300">
              <span>Fertilize</span>
            </div>

            {/* Target ID: star-flower */}
            <div className="h-6 bg-[#2563EB] text-white text-[9px] font-bold px-2 mt-1 flex items-center justify-between shadow border-t border-black/20">
              <span>Target ID</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;star-flower&quot;</span>
            </div>
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span>Fertilize</span>
            </div>
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-emerald-300/40 border-t border-black/20">
              <span>Water</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Mercury Biodome Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm1Ready 7s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'm1Running 7s ease-in-out infinite' }}>FLOWER BLOOMING</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MercuryBiodomeScene ventsOpen={true} shrubsFertilized={true} flowerBloomed={true} />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Target by Tag (<vent>)
 */
export function MercuryLevel1Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m1s2Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes m1s2Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #DC2626; box-shadow: 0 0 16px rgba(220,38,38,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #DC2626; }
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
          <Mercury1ToolboxSidebar activeCategory="tags" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div
              className="relative h-6 bg-[#DC2626] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-red-400/40 z-20"
              style={{ animation: 'm1s2Pulse 6s ease-in-out infinite' }}
            >
              <span>Target Tag</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;vent&quot;</span>
              <span>do:</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm1s2Cursor 6s ease-in-out infinite' }}>
                <CursorPointer />
              </div>
            </div>

            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center shadow border-l-2 border-emerald-300">
              <span>Open</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]">VENTS OPENING</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MercuryBiodomeScene ventsOpen={true} shrubsFertilized={false} flowerBloomed={false} />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Target by Class (.shrub) with Loops
 */
export function MercuryLevel1Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m1s3Cursor {
          0% { transform: translate(-30px, 40px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(30px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-30px, 40px); opacity: 0; }
        }
        @keyframes m1s3Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #D97706; box-shadow: 0 0 16px rgba(217,119,6,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #D97706; }
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
          <Mercury1ToolboxSidebar activeCategory="classes" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div
              className="relative h-6 bg-[#D97706] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-amber-400/40 z-20"
              style={{ animation: 'm1s3Pulse 6s ease-in-out infinite' }}
            >
              <span>Target Class</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;.shrub&quot;</span>
              <span>do:</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm1s3Cursor 6s ease-in-out infinite' }}>
                <CursorPointer />
              </div>
            </div>

            <div className="h-6 bg-[#7C3AED] text-white text-[8.5px] font-bold px-2 ml-2 flex items-center shadow border-l-2 border-purple-300">
              <span>For each item do:</span>
            </div>
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-4 rounded-b flex items-center shadow border-l-2 border-emerald-300">
              <span>Fertilize</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]">SHRUBS FERTILIZED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MercuryBiodomeScene ventsOpen={true} shrubsFertilized={true} flowerBloomed={false} />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Target Centerpiece by ID (#star-flower)
 */
export function MercuryLevel1Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m1s4Pulse {
          0%, 25% { filter: brightness(1); }
          30%, 85% { filter: brightness(1.3); outline: 2px solid #2563EB; }
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
          <Mercury1ToolboxSidebar activeCategory="ids" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div
              className="h-6 bg-[#2563EB] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-blue-400/40"
              style={{ animation: 'm1s4Pulse 6s ease-in-out infinite' }}
            >
              <span>Target ID</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;star-flower&quot;</span>
            </div>
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span>Fertilize</span>
            </div>
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-emerald-300/40 border-t border-black/20">
              <span>Water</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Biodome 100% Revived */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] font-bold whitespace-nowrap">
              BIODOME REVIVED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MercuryBiodomeScene ventsOpen={true} shrubsFertilized={true} flowerBloomed={true} />
        </div>
      </div>
    </div>
  );
}
