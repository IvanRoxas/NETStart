"use client";

import React from 'react';
import { Wind, Sprout, Sparkles } from 'lucide-react';

/**
 * Large, Clear SVG Cursor Pointer (Strictly No Emojis)
 */
function CursorPointer({ className = "" }: { className?: string }) {
  return (
    <svg
      width="26"
      height="26"
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
    <div className="flex flex-col gap-1.5 w-18 shrink-0 py-1.5 select-none font-mono">
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "tags"
            ? "text-red-300 bg-red-950/80 border-red-400"
            : "text-red-400/60 bg-red-950/30 border-red-500/30"
          }`}
      >
        Tags
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "classes"
            ? "text-amber-300 bg-amber-950/80 border-amber-400"
            : "text-amber-400/60 bg-amber-950/30 border-amber-500/30"
          }`}
      >
        Classes
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "ids"
            ? "text-blue-300 bg-blue-950/80 border-blue-400"
            : "text-blue-400/60 bg-blue-950/30 border-blue-500/30"
          }`}
      >
        IDs
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "actions"
            ? "text-emerald-300 bg-emerald-950/80 border-emerald-400"
            : "text-emerald-400/60 bg-emerald-950/30 border-emerald-500/30"
          }`}
      >
        Actions
      </div>
    </div>
  );
}

/**
 * Authentic Mercury Biodome Stage replicating MercuryLevel1Biodome.tsx
 */
function MercuryBiodomeScene({
  ventsOpen = false,
  shrubsFertilized = false,
  flowerBloomed = false,
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
          className={`px-2 py-0.5 rounded border flex items-center gap-1 transition-all duration-300 ${ventsOpen
              ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              : "bg-red-950/80 border-red-500 text-red-400"
            }`}
        >
          <Wind size={10} className={ventsOpen ? "animate-pulse" : ""} />
          <span className="text-[7.5px] font-bold">&lt;vent 1&gt; {ventsOpen ? "OPEN" : "SHUT"}</span>
        </div>

        {/* Right Vent */}
        <div
          className={`px-2 py-0.5 rounded border flex items-center gap-1 transition-all duration-300 ${ventsOpen
              ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              : "bg-red-950/80 border-red-500 text-red-400"
            }`}
        >
          <Wind size={10} className={ventsOpen ? "animate-pulse" : ""} />
          <span className="text-[7.5px] font-bold">&lt;vent 2&gt; {ventsOpen ? "OPEN" : "SHUT"}</span>
        </div>
      </div>

      {/* 3. Centerpiece Star Flower (#star-flower) */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center min-h-0">
        <div className="relative flex flex-col items-center">
          {/* Flower Glow Ring */}
          {flowerBloomed && (
            <div className="absolute -inset-2 rounded-full border border-emerald-400/60 animate-ping pointer-events-none" />
          )}

          <div
            className={`w-13 h-13 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${flowerBloomed
                ? "bg-emerald-950/80 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.7)] scale-110"
                : "bg-slate-900 border-slate-700 opacity-60"
              }`}
          >
            <Sprout
              size={26}
              className={`transition-colors duration-500 ${flowerBloomed ? "text-emerald-300 animate-pulse" : "text-slate-500"
                }`}
            />
          </div>

          <div className="flex items-center gap-1 mt-1">
            {flowerBloomed && <Sparkles size={9} className="text-emerald-300 animate-spin" />}
            <span
              className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border transition-colors ${flowerBloomed
                  ? "text-emerald-300 bg-emerald-950/70 border-emerald-400/50"
                  : "text-slate-400 bg-black/50 border-white/10"
                }`}
            >
              #star-flower {flowerBloomed ? "BLOOMING" : "DORMANT"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Garden Soil & Shrub Row (.shrub) */}
      <div className="relative z-20 w-full h-8 bg-gradient-to-t from-[#021008] to-[#0d2a1a] border-t border-emerald-500/40 px-3 flex items-center justify-between">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${shrubsFertilized ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-amber-700"
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
 * Dynamic Animation:
 * - Left: Vents and shrubs blocks are placed. Target ID: "star-flower" block is dragged from IDs and snapped to the bottom.
 * - Right: Biodome responds with open vents, fertilized shrubs, and blooming star flower.
 */
export function MercuryLevel1Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Target ID Block (20% - 34%) */
        @keyframes m1s1DragId {
          0%, 18% {
            transform: translate(-65px, 30px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 30px) scale(1.04);
            box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
          }
          32% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          35%, 88% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 30px) scale(0.92);
            opacity: 0;
          }
        }

        @keyframes m1s1CursorMotion {
          0%, 12% { transform: translate(-80px, 45px); opacity: 0; }
          18% { transform: translate(-50px, 35px); opacity: 1; }
          22% { transform: translate(-50px, 35px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          40%, 46% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          52% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 45px); opacity: 0; }
        }

        @keyframes m1s1SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #2563eb; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes m1s1TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes m1s1StatusDormant {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m1s1StatusRevived {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes m1s1SceneRevived {
          0%, 38% { opacity: 0; }
          42%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes m1s1SceneDormant {
          0%, 38% { opacity: 1; }
          42%, 88% { opacity: 0; }
          93%, 100% { opacity: 1; }
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
          <Mercury1ToolboxSidebar activeCategory="ids" />

          {/* Blockly Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Target Tag: "vent" */}
            <div className="h-6.5 w-[195px] bg-[#DC2626] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-red-400/40">
              <span>Target Tag</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;vent&quot;</span>
              <span>do:</span>
            </div>
            <div className="h-6 w-[187px] bg-[#10B981] text-white text-[9px] font-bold px-2 ml-2 flex items-center shadow border-t border-black/20">
              <span>Open</span>
            </div>

            {/* Target Class: ".shrub" */}
            <div className="h-6.5 w-[195px] bg-[#D97706] text-white text-[9px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Target Class</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;.shrub&quot;</span>
              <span>do:</span>
            </div>
            <div className="h-6 w-[187px] bg-[#7C3AED] text-white text-[8.5px] font-bold px-2 ml-2 flex items-center shadow border-t border-black/20">
              <span>For each item: Fertilize</span>
            </div>

            {/* Target ID Slot: Blank dashed trace before snap */}
            <div className="relative w-[195px]">
              <div
                className="h-12 rounded-b border border-dashed border-blue-500/40 bg-blue-950/10"
                style={{ animation: 'm1s1TraceSlot 7.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Target ID Block */}
              <div
                className="absolute inset-0 flex flex-col z-30"
                style={{
                  animation: 'm1s1DragId 7.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m1s1SnapPulse 7.5s ease-in-out infinite',
                }}
              >
                <div className="h-6.5 bg-[#2563EB] text-white text-[9px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
                  <span>Target ID</span>
                  <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;star-flower&quot;</span>
                </div>
                <div className="h-5.5 bg-[#10B981] text-white text-[8.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-emerald-400/40 border-t border-black/20">
                  <span>Water &amp; Bloom</span>
                </div>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 top-2 pointer-events-none z-40"
                  style={{ animation: 'm1s1CursorMotion 7.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 'm1s1StatusDormant 7.5s ease-in-out infinite' }}
            >
              DORMANT
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'm1s1StatusRevived 7.5s ease-in-out infinite' }}
            >
              BIODOME REVIVED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'm1s1SceneDormant 7.5s ease-in-out infinite' }}>
            <MercuryBiodomeScene ventsOpen={false} shrubsFertilized={false} flowerBloomed={false} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'm1s1SceneRevived 7.5s ease-in-out infinite' }}>
            <MercuryBiodomeScene ventsOpen={true} shrubsFertilized={true} flowerBloomed={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Target by Tag (<vent>)
 * Dynamic Animation:
 * - Left: Target Tag "vent" block is dragged from Tags category and snapped into workspace blank trace slot
 * - Right: Simulation greenhouse vents swing open in cyan
 */
export function MercuryLevel1Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Tag Block (20% - 35%) */
        @keyframes m1s2DragTag {
          0%, 18% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.04);
            box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4);
          }
          32% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          35%, 88% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }

        @keyframes m1s2CursorMotion {
          0%, 14% { transform: translate(-75px, 35px); opacity: 0; }
          18% { transform: translate(-50px, 25px); opacity: 1; }
          22% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35%, 45% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          50% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-75px, 35px); opacity: 0; }
        }

        @keyframes m1s2SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #dc2626; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes m1s2TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes m1s2StatusShut {
          0%, 34% { opacity: 1; }
          38%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m1s2StatusOpen {
          0%, 34% { opacity: 0; }
          38%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes m1s2SceneOpen {
          0%, 35% { opacity: 0; }
          38%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes m1s2SceneShut {
          0%, 35% { opacity: 1; }
          38%, 88% { opacity: 0; }
          93%, 100% { opacity: 1; }
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
          <Mercury1ToolboxSidebar activeCategory="tags" />

          {/* Blank dashed trace slot before snap */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            <div className="relative w-[195px]">
              <div
                className="h-13 rounded border border-dashed border-red-500/40 bg-red-950/10"
                style={{ animation: 'm1s2TraceSlot 6.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Tag Block */}
              <div
                className="absolute inset-0 flex flex-col z-30"
                style={{
                  animation: 'm1s2DragTag 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m1s2SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <div className="h-7 bg-[#DC2626] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-red-400/40">
                  <span>Target Tag</span>
                  <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;vent&quot;</span>
                  <span>do:</span>
                </div>
                <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-emerald-400/40 border-t border-black/20">
                  <span>Open</span>
                </div>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 top-2 pointer-events-none z-40"
                  style={{ animation: 'm1s2CursorMotion 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] whitespace-nowrap"
              style={{ animation: 'm1s2StatusShut 6.5s ease-in-out infinite' }}
            >
              VENTS SHUT
            </span>
            <span
              className="absolute right-0 text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'm1s2StatusOpen 6.5s ease-in-out infinite' }}
            >
              VENTS OPENED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'm1s2SceneShut 6.5s ease-in-out infinite' }}>
            <MercuryBiodomeScene ventsOpen={false} shrubsFertilized={false} flowerBloomed={false} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'm1s2SceneOpen 6.5s ease-in-out infinite' }}>
            <MercuryBiodomeScene ventsOpen={true} shrubsFertilized={false} flowerBloomed={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Target by Class (.shrub) with Loops
 * Dynamic Animation:
 * - Left: For each item: Fertilize block is dragged from Classes category and snapped inside Target Class
 * - Right: Simulation garden shrubs along bottom row light up in glowing emerald green
 */
export function MercuryLevel1Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Loop Block (20% - 35%) */
        @keyframes m1s3DragLoop {
          0%, 18% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.04);
            box-shadow: 0 8px 24px rgba(124, 58, 237, 0.4);
          }
          32% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          35%, 88% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }

        @keyframes m1s3CursorMotion {
          0%, 14% { transform: translate(-75px, 35px); opacity: 0; }
          18% { transform: translate(-50px, 25px); opacity: 1; }
          22% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35%, 45% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          50% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-75px, 35px); opacity: 0; }
        }

        @keyframes m1s3SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #7c3aed; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes m1s3TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes m1s3StatusWilted {
          0%, 34% { opacity: 1; }
          38%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m1s3StatusFertilized {
          0%, 34% { opacity: 0; }
          38%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes m1s3SceneFertilized {
          0%, 35% { opacity: 0; }
          38%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes m1s3SceneWilted {
          0%, 35% { opacity: 1; }
          38%, 88% { opacity: 0; }
          93%, 100% { opacity: 1; }
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
          <Mercury1ToolboxSidebar activeCategory="classes" />

          {/* Blockly Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Target Class Header */}
            <div className="h-7 w-[195px] bg-[#D97706] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-amber-400/40">
              <span>Target Class</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;.shrub&quot;</span>
              <span>do:</span>
            </div>

            {/* Loop Slot: Blank dashed trace before snap */}
            <div className="relative w-[187px] ml-2">
              <div
                className="h-6.5 rounded-b border border-dashed border-purple-500/40 bg-purple-950/10"
                style={{ animation: 'm1s3TraceSlot 6.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Loop Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#7C3AED] text-white text-[9px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-purple-400/40 border-t border-black/20 z-30"
                style={{
                  animation: 'm1s3DragLoop 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m1s3SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>For each item:</span>
                <span className="bg-[#10B981] px-1 py-0.5 rounded text-[8px] text-white font-bold">Fertilize</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm1s3CursorMotion 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 'm1s3StatusWilted 6.5s ease-in-out infinite' }}
            >
              WILTED SHRUBS
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'm1s3StatusFertilized 6.5s ease-in-out infinite' }}
            >
              SHRUBS FERTILIZED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'm1s3SceneWilted 6.5s ease-in-out infinite' }}>
            <MercuryBiodomeScene ventsOpen={false} shrubsFertilized={false} flowerBloomed={false} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'm1s3SceneFertilized 6.5s ease-in-out infinite' }}>
            <MercuryBiodomeScene ventsOpen={false} shrubsFertilized={true} flowerBloomed={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Target Unique Plants by ID (#star-flower)
 * Dynamic Animation:
 * - Left: Water action block is dragged from Actions category and snapped under Fertilize
 * - Right: Star flower expands and reaches full emerald bloom
 */
export function MercuryLevel1Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Water Block (20% - 35%) */
        @keyframes m1s4DragWater {
          0%, 18% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.04);
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
          }
          32% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          35%, 88% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }

        @keyframes m1s4CursorMotion {
          0%, 14% { transform: translate(-75px, 35px); opacity: 0; }
          18% { transform: translate(-50px, 25px); opacity: 1; }
          22% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          40%, 46% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          52% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-75px, 35px); opacity: 0; }
        }

        @keyframes m1s4SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #10b981; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes m1s4TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes m1s4StatusDormant {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m1s4StatusBloomed {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes m1s4SceneBloomed {
          0%, 38% { opacity: 0; }
          42%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes m1s4SceneDormant {
          0%, 38% { opacity: 1; }
          42%, 88% { opacity: 0; }
          93%, 100% { opacity: 1; }
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
          <Mercury1ToolboxSidebar activeCategory="actions" />

          {/* Blockly Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Target ID Header */}
            <div className="h-7 w-[195px] bg-[#2563EB] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-blue-400/40">
              <span>Target ID</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">&quot;star-flower&quot;</span>
            </div>

            {/* Fertilize Action */}
            <div className="h-6 w-[195px] bg-[#10B981] text-white text-[9px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span>Fertilize</span>
            </div>

            {/* Water Action Slot: Blank dashed trace before snap */}
            <div className="relative w-[195px]">
              <div
                className="h-6.5 rounded-b border border-dashed border-emerald-500/40 bg-emerald-950/10"
                style={{ animation: 'm1s4TraceSlot 6.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Water Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#10B981] text-white text-[9px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-emerald-400/40 border-t border-black/20 z-30"
                style={{
                  animation: 'm1s4DragWater 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m1s4SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Water</span>
                <span className="bg-black/40 px-1 py-0.5 rounded text-[8px] text-emerald-200 font-mono">Bloom</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm1s4CursorMotion 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 'm1s4StatusDormant 6.5s ease-in-out infinite' }}
            >
              FLOWER DORMANT
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'm1s4StatusBloomed 6.5s ease-in-out infinite' }}
            >
              FLOWER BLOOMED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'm1s4SceneDormant 6.5s ease-in-out infinite' }}>
            <MercuryBiodomeScene ventsOpen={false} shrubsFertilized={false} flowerBloomed={false} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'm1s4SceneBloomed 6.5s ease-in-out infinite' }}>
            <MercuryBiodomeScene ventsOpen={false} shrubsFertilized={false} flowerBloomed={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
