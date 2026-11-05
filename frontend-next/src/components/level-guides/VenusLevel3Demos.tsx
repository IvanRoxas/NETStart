"use client";

import React from 'react';
import { Radio, Sparkles, Check } from 'lucide-react';

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

function Venus3ToolboxSidebar({ activeCategory = "links" }: { activeCategory?: "links" | "sectors" | "styles" }) {
  return (
    <div className="flex flex-col gap-1.5 w-20 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "links"
          ? "text-blue-300 bg-blue-950/80 border-blue-400"
          : "text-blue-400/60 bg-blue-950/30 border-blue-500/30"
      }`}>
        Link CSS
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "sectors"
          ? "text-purple-300 bg-purple-950/80 border-purple-400"
          : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
      }`}>
        Sectors
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "styles"
          ? "text-pink-300 bg-pink-950/80 border-pink-400"
          : "text-pink-400/60 bg-pink-950/30 border-pink-500/30"
      }`}>
        Styles
      </div>
    </div>
  );
}

/**
 * Authentic AstroLink Central Spire & Annular Sectors replicating VenusLevel3Viewport.tsx
 */
function Venus3SpireViewportScene({
  activeSector = "all",
  alphaActive = true,
  betaActive = true,
  gammaActive = true,
}: {
  activeSector?: "alpha" | "beta" | "gamma" | "all";
  alphaActive?: boolean;
  betaActive?: boolean;
  gammaActive?: boolean;
}) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#070210] overflow-hidden select-none">
      {/* Background Cosmic Violet Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(147,51,234,0.2)_0%,_transparent_75%)] pointer-events-none" />

      {/* SVG Radial System Viewport */}
      <svg viewBox="0 0 360 360" className="w-[210px] h-[210px] sm:w-[230px] sm:h-[230px] overflow-visible relative z-10">
        <defs>
          <radialGradient id="v3CoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="60%" stopColor="#db2777" />
            <stop offset="100%" stopColor="#831843" />
          </radialGradient>
        </defs>

        {/* Outer Dish Ring Orbit */}
        <circle cx="180" cy="180" r="140" fill="none" stroke="#7e22ce" strokeWidth="1.5" strokeDasharray="4 6" opacity="0.6" />

        {/* 1. SECTOR ALPHA (Top Right Annular Slice, 330deg to 90deg) */}
        <path
          d="M 180,60 A 120,120 0 0,1 284,240 L 223,205 A 50,50 0 0,0 180,130 Z"
          fill={alphaActive ? "rgba(6, 182, 212, 0.25)" : "rgba(30, 41, 59, 0.4)"}
          stroke={alphaActive ? "#06b6d4" : "#475569"}
          strokeWidth="2"
          className="transition-all duration-300"
        />
        <text x="228" y="125" fill={alphaActive ? "#67e8f9" : "#64748b"} fontSize="10" fontFamily="monospace" fontWeight="bold">
          ALPHA
        </text>

        {/* 2. SECTOR BETA (Bottom Annular Slice, 90deg to 210deg) */}
        <path
          d="M 284,240 A 120,120 0 0,1 76,240 L 137,205 A 50,50 0 0,0 223,205 Z"
          fill={betaActive ? "rgba(168, 85, 247, 0.25)" : "rgba(30, 41, 59, 0.4)"}
          stroke={betaActive ? "#a855f7" : "#475569"}
          strokeWidth="2"
          className="transition-all duration-300"
        />
        <text x="165" y="275" fill={betaActive ? "#d8b4fe" : "#64748b"} fontSize="10" fontFamily="monospace" fontWeight="bold">
          BETA
        </text>

        {/* 3. SECTOR GAMMA (Top Left Annular Slice, 210deg to 330deg) */}
        <path
          d="M 76,240 A 120,120 0 0,1 180,60 L 180,130 A 50,50 0 0,0 137,205 Z"
          fill={gammaActive ? "rgba(244, 63, 94, 0.25)" : "rgba(30, 41, 59, 0.4)"}
          stroke={gammaActive ? "#f43f5e" : "#475569"}
          strokeWidth="2"
          className="transition-all duration-300"
        />
        <text x="95" y="125" fill={gammaActive ? "#fda4af" : "#64748b"} fontSize="10" fontFamily="monospace" fontWeight="bold">
          GAMMA
        </text>

        {/* Central Communication Spire / Spire Tower */}
        <circle cx="180" cy="180" r="32" fill="url(#v3CoreGlow)" stroke="#f472b6" strokeWidth="2.5" className="shadow-lg" />
        <circle cx="180" cy="180" r="14" fill="#ffffff" opacity="0.9" />
        <circle cx="180" cy="180" r="48" fill="none" stroke="#f472b6" strokeWidth="1" strokeDasharray="3 3" className="animate-spin" />
      </svg>
    </div>
  );
}

/**
 * Slide 1: How to Win Venus Level 3 (Linking External CSS to Spire Sectors)
 */
export function VenusLevel3Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes v3s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes v3s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
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
          <Venus3ToolboxSidebar activeCategory="links" />

          {/* Blockly Block Stack: venus3_html_head & links */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#2563EB] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-blue-300/40">
              <span>Main Head &lt;head&gt;</span>
            </div>

            {/* venus3_html_link (alpha.css) */}
            <div className="h-7 bg-[#3B82F6] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Connect:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-cyan-300 font-mono">alpha.css ▾</span>
            </div>

            {/* venus3_html_link (beta.css) */}
            <div className="h-7 bg-[#3B82F6] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Connect:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-purple-300 font-mono">beta.css ▾</span>
            </div>

            {/* venus3_html_link (gamma.css) */}
            <div className="h-7 bg-[#3B82F6] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-blue-400/20">
              <span>Connect:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-rose-300 font-mono">gamma.css ▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Venus Spire Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'v3s1Ready 7s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'v3s1Running 7s ease-in-out infinite' }}>3 SECTORS LINKED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Venus3SpireViewportScene alphaActive={true} betaActive={true} gammaActive={true} />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Attaching Stylesheets with <link rel="stylesheet">
 */
export function VenusLevel3Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes v3s2Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes v3s2Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes v3s2Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes v3s2Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #3B82F6; box-shadow: 0 0 16px rgba(59,130,246,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #3B82F6; }
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
          <Venus3ToolboxSidebar activeCategory="links" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#2563EB] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-blue-300/40">
              <span>Main Head &lt;head&gt;</span>
            </div>

            <div
              className="relative h-7 bg-[#3B82F6] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-blue-400/20 z-20"
              style={{ animation: 'v3s2Pulse 6s ease-in-out infinite' }}
            >
              <span>Connect:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-cyan-300 font-mono">alpha.css ▾</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'v3s2Cursor 6s ease-in-out infinite' }}>
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
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'v3s2Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'v3s2Running 6s ease-in-out infinite' }}>ALPHA LINKED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Venus3SpireViewportScene alphaActive={true} betaActive={false} gammaActive={false} />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Writing CSS Rules for Each Sector Tab
 */
export function VenusLevel3Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes v3s3Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes v3s3Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes v3s3Cursor {
          0% { transform: translate(-30px, 40px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(30px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-30px, 40px); opacity: 0; }
        }
        @keyframes v3s3Pulse {
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
          <Venus3ToolboxSidebar activeCategory="sectors" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#A855F7] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-300/40">
              <span>Sector: #sector-beta</span>
            </div>

            <div
              className="relative h-7 bg-[#EC4899] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-pink-400/20 z-20"
              style={{ animation: 'v3s3Pulse 6s ease-in-out infinite' }}
            >
              <span>Color =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-pink-200 font-mono">#A855F7</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'v3s3Cursor 6s ease-in-out infinite' }}>
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
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'v3s3Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'v3s3Running 6s ease-in-out infinite' }}>SECTOR STYLED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Venus3SpireViewportScene alphaActive={true} betaActive={true} gammaActive={false} />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Complete All Sectors to Broadcast Across Venus
 */
export function VenusLevel3Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes v3s4Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes v3s4Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
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
          <Venus3ToolboxSidebar activeCategory="links" />

          <div className="flex flex-col gap-1.5 w-[190px] sm:w-[205px] relative z-20">
            <div className="rounded border border-blue-400/40 bg-[#2563EB] p-1 shadow flex items-center justify-between">
              <span className="text-[9px] font-bold text-white">alpha.css Linked</span>
              <Check size={11} className="text-white" />
            </div>
            <div className="rounded border border-blue-400/40 bg-[#2563EB] p-1 shadow flex items-center justify-between">
              <span className="text-[9px] font-bold text-white">beta.css Linked</span>
              <Check size={11} className="text-white" />
            </div>
            <div className="rounded border border-blue-400/40 bg-[#2563EB] p-1 shadow flex items-center justify-between">
              <span className="text-[9px] font-bold text-white">gamma.css Linked</span>
              <Check size={11} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Broadcast Across Venus */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'v3s4Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] font-bold whitespace-nowrap" style={{ animation: 'v3s4Running 6s ease-in-out infinite' }}>BROADCAST ACTIVE</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Venus3SpireViewportScene alphaActive={true} betaActive={true} gammaActive={true} />
        </div>
      </div>
    </div>
  );
}
