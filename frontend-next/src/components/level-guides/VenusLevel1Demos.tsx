"use client";

import React from 'react';
import { Palette, Sparkles, Check } from 'lucide-react';

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

function VenusToolboxSidebar({ activeCategory = "targets" }: { activeCategory?: "targets" | "colors" | "borders" | "typography" }) {
  return (
    <div className="flex flex-col gap-1.5 w-20 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "targets"
          ? "text-pink-300 bg-pink-950/80 border-pink-400"
          : "text-pink-400/60 bg-pink-950/30 border-pink-500/30"
      }`}>
        Furniture
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "colors"
          ? "text-cyan-300 bg-cyan-950/80 border-cyan-400"
          : "text-cyan-400/60 bg-cyan-950/30 border-cyan-500/30"
      }`}>
        Colors
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "borders"
          ? "text-amber-300 bg-amber-950/80 border-amber-400"
          : "text-amber-400/60 bg-amber-950/30 border-amber-500/30"
      }`}>
        Borders
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "typography"
          ? "text-purple-300 bg-purple-950/80 border-purple-400"
          : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
      }`}>
        Text
      </div>
    </div>
  );
}

/**
 * Authentic Venus Lab SVG Scene replicating VenusLevel1Lab.tsx
 */
function VenusLabViewportScene({
  deskColor = "#0284c7",
  chairColor = "#475569",
  computerColor = "#1e293b",
  windowColor = "#0284c7",
  highlightTarget,
  laserProgress = 0,
  showLaser = false,
}: {
  deskColor?: string;
  chairColor?: string;
  computerColor?: string;
  windowColor?: string;
  highlightTarget?: 'desk' | 'chair' | 'window' | 'computer';
  laserProgress?: number;
  showLaser?: boolean;
}) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#070b14] overflow-hidden">
      <svg
        viewBox="0 0 1000 650"
        className="w-full h-full object-contain select-none"
      >
        <defs>
          <linearGradient id="demoLabWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="65%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#121215" />
          </linearGradient>

          <linearGradient id="demoLabFloor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#141417" />
            <stop offset="25%" stopColor="#0f0f12" />
            <stop offset="100%" stopColor="#08080a" />
          </linearGradient>

          <filter id="demoHighlightGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#38bdf8" floodOpacity="0.95" />
          </filter>
        </defs>

        {/* 1. Back Wall */}
        <rect x="0" y="0" width="1000" height="420" fill="url(#demoLabWall)" />

        {/* 2. Floor with Perspective Lines */}
        <rect x="0" y="420" width="1000" height="230" fill="url(#demoLabFloor)" />
        <line x1="0" y1="420" x2="1000" y2="420" stroke="#3f3f46" strokeOpacity="0.6" strokeWidth="1.5" />
        <line x1="120" y1="420" x2="0" y2="650" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1.2" />
        <line x1="320" y1="420" x2="180" y2="650" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1.2" />
        <line x1="500" y1="420" x2="500" y2="650" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1.2" />
        <line x1="680" y1="420" x2="820" y2="650" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1.2" />
        <line x1="880" y1="420" x2="1000" y2="650" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1.2" />

        {/* 3. Observatory Window */}
        <g id="demo-window" filter={highlightTarget === 'window' ? 'url(#demoHighlightGlow)' : undefined}>
          <rect x="180" y="60" width="640" height="135" rx="16" fill="#121215" stroke="#3f3f46" strokeWidth="1.8" />
          <rect x="188" y="68" width="624" height="119" rx="12" fill={windowColor} />
          <line x1="500" y1="68" x2="500" y2="187" stroke="#3f3f46" strokeWidth="1.5" />
        </g>

        {/* 4. Large Circular Carpet */}
        <ellipse cx="500" cy="558" rx="288" ry="76" fill="#000000" fillOpacity="0.5" />
        <ellipse cx="500" cy="555" rx="280" ry="74" fill="#312e81" stroke="#4f46e5" strokeWidth="3" />
        <ellipse cx="500" cy="555" rx="228" ry="60" fill="none" stroke="#6366f1" strokeWidth="2" />
        <ellipse cx="500" cy="555" rx="72" ry="19" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2" />

        {/* 5. Work Desk */}
        <g id="demo-desk" filter={highlightTarget === 'desk' ? 'url(#demoHighlightGlow)' : undefined}>
          {/* Surface */}
          <polygon points="560,400 920,400 950,440 540,440" fill={deskColor} stroke="#64748b" strokeWidth="1.5" />
          {/* Front Panel & Drawers */}
          <rect x="540" y="440" width="410" height="80" fill={deskColor} stroke="#64748b" strokeWidth="1.5" />
          <rect x="760" y="460" width="160" height="25" rx="3" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
          <line x1="820" y1="472" x2="860" y2="472" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          <rect x="760" y="490" width="160" height="25" rx="3" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
          <line x1="820" y1="502" x2="860" y2="502" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          {/* Desk Legs */}
          <rect x="560" y="520" width="14" height="67" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
          <rect x="920" y="520" width="14" height="67" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
        </g>

        {/* 6. Main Computer */}
        <g id="demo-computer" filter={highlightTarget === 'computer' ? 'url(#demoHighlightGlow)' : undefined}>
          {/* Monitor Stand */}
          <rect x="662" y="375" width="16" height="38" fill="#64748b" />
          <ellipse cx="670" cy="413" rx="28" ry="6" fill="#334155" />
          {/* Monitor Casing */}
          <rect x="585" y="250" width="170" height="125" rx="8" fill={computerColor} stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="595" y="258" width="150" height="100" rx="5" fill="#090d16" stroke="#334155" strokeWidth="1" />
          <text x="608" y="278" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">VENUS OS</text>
          <text x="608" y="296" fill="#94a3b8" fontSize="9" fontFamily="monospace">&gt; CSS Engine: Online</text>
          <text x="608" y="314" fill="#a7f3d0" fontSize="9" fontFamily="monospace">&gt; Palette Restored</text>
          {/* PC Tower */}
          <rect x="780" y="260" width="84" height="153" rx="6" fill={computerColor} stroke="#94a3b8" strokeWidth="1.5" />
          <rect x="786" y="266" width="72" height="141" rx="4" fill="#090d16" stroke="#334155" strokeWidth="1" />
          <circle cx="822" cy="282" r="5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          <circle cx="822" cy="282" r="2.5" fill="#38bdf8" />
        </g>

        {/* 7. Office Chair */}
        <g id="demo-chair" filter={highlightTarget === 'chair' ? 'url(#demoHighlightGlow)' : undefined}>
          <ellipse cx="440" cy="580" rx="36" ry="8" fill="#0f172a" />
          <line x1="440" y1="530" x2="440" y2="580" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
          {/* Cushion */}
          <rect x="380" y="495" width="120" height="35" rx="10" fill={chairColor} stroke="#64748b" strokeWidth="1.5" />
          {/* Backrest */}
          <rect x="395" y="370" width="90" height="115" rx="14" fill={chairColor} stroke="#64748b" strokeWidth="1.5" />
          {/* Armrests */}
          <path d="M 375,445 L 375,490 L 390,490" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 505,445 L 505,490 L 490,490" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Laser Scanner Sweep Beam */}
        {showLaser && (
          <g>
            <line
              x1={laserProgress}
              y1="0"
              x2={laserProgress}
              y2="650"
              stroke="#00f5d4"
              strokeWidth="4"
              opacity="0.9"
            />
            <line
              x1={laserProgress}
              y1="0"
              x2={laserProgress}
              y2="650"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <rect
              x={laserProgress - 40}
              y="0"
              width="40"
              height="650"
              fill="url(#laserGlowGrad)"
              opacity="0.3"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * Slide 1: How to Win Venus Level 1 (Spectrum Lab Styling Pipeline)
 */
export function VenusLevel1Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes v1s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes v1s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes v1s1Laser {
          0%, 25% { transform: translateX(0px); opacity: 0; }
          30% { transform: translateX(50px); opacity: 1; }
          85% { transform: translateX(950px); opacity: 1; }
          90%, 100% { transform: translateX(950px); opacity: 0; }
        }
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
          <VenusToolboxSidebar activeCategory="targets" />

          {/* Blockly Block Stack: venus_target_desk */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#EC4899] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-pink-300/40">
              <span>Furniture: #desk</span>
            </div>

            {/* venus_style_bgcolor */}
            <div className="h-7 bg-[#06B6D4] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Background Color =</span>
              <div className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded border border-white/20">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0284c7] border border-white" />
                <span className="font-mono text-[8px] text-cyan-200">#0284C7</span>
              </div>
            </div>

            {/* venus_style_border */}
            <div className="h-7 bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-amber-300/40">
              <span>Border:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-amber-200 font-mono">2px solid</span>
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-white" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Venus Lab Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'v1s1Ready 7s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'v1s1Running 7s ease-in-out infinite' }}>STYLING LAB</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <VenusLabViewportScene
            deskColor="#0284c7"
            chairColor="#ec4899"
            computerColor="#0f172a"
            windowColor="#0284c7"
            highlightTarget="desk"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Setting Background Colors with the Color Swatch
 */
export function VenusLevel1Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes v1s2Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes v1s2Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes v1s2Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes v1s2Pulse {
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
          <VenusToolboxSidebar activeCategory="colors" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#EC4899] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-pink-300/40">
              <span>Furniture: #desk</span>
            </div>

            <div
              className="relative h-7 bg-[#06B6D4] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-cyan-400/20 z-20"
              style={{ animation: 'v1s2Pulse 6s ease-in-out infinite' }}
            >
              <span>Background Color =</span>
              <div className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded border border-white/20">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0284c7] border border-white" />
                <span className="font-mono text-[8px] text-cyan-200">#0284C7</span>
              </div>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'v1s2Cursor 6s ease-in-out infinite' }}>
                <CursorPointer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Venus Lab Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'v1s2Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'v1s2Running 6s ease-in-out infinite' }}>COLOR SWATCH</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <VenusLabViewportScene
            deskColor="#0284c7"
            chairColor="#334155"
            computerColor="#1e293b"
            windowColor="#111113"
            highlightTarget="desk"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Styling Borders with Thickness & Color
 */
export function VenusLevel1Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes v1s3Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes v1s3Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes v1s3Cursor {
          0% { transform: translate(-30px, 40px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(30px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-30px, 40px); opacity: 0; }
        }
        @keyframes v1s3Pulse {
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
          <VenusToolboxSidebar activeCategory="borders" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#EC4899] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-pink-300/40">
              <span>Furniture: #chair</span>
            </div>

            <div
              className="relative h-7 bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-amber-300/40 z-20"
              style={{ animation: 'v1s3Pulse 6s ease-in-out infinite' }}
            >
              <span>Border:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-amber-200 font-mono">2px solid</span>
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-white" />

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'v1s3Cursor 6s ease-in-out infinite' }}>
                <CursorPointer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Venus Lab Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'v1s3Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'v1s3Running 6s ease-in-out infinite' }}>BORDER APPLIED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <VenusLabViewportScene
            deskColor="#1e293b"
            chairColor="#10b981"
            computerColor="#1e293b"
            windowColor="#111113"
            highlightTarget="chair"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Target Every Furniture Piece to Complete the Lab
 */
export function VenusLevel1Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes v1s4Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes v1s4Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
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
          <VenusToolboxSidebar activeCategory="targets" />

          <div className="flex flex-col gap-1.5 w-[190px] sm:w-[205px] relative z-20">
            {/* Target Desk */}
            <div className="rounded border border-pink-400/40 bg-[#EC4899] p-1 shadow">
              <span className="text-[9px] font-bold text-white">Furniture: #desk</span>
            </div>
            {/* Target Chair */}
            <div className="rounded border border-pink-400/40 bg-[#EC4899] p-1 shadow">
              <span className="text-[9px] font-bold text-white">Furniture: #chair</span>
            </div>
            {/* Target Window */}
            <div className="rounded border border-pink-400/40 bg-[#EC4899] p-1 shadow">
              <span className="text-[9px] font-bold text-white">Furniture: #window</span>
            </div>
            {/* Target Computer */}
            <div className="rounded border border-pink-400/40 bg-[#EC4899] p-1 shadow">
              <span className="text-[9px] font-bold text-white">Furniture: #computer</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Fully Restored Lab Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'v1s4Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] font-bold whitespace-nowrap" style={{ animation: 'v1s4Running 6s ease-in-out infinite' }}>LAB COMPLETED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <VenusLabViewportScene
            deskColor="#0284c7"
            chairColor="#ec4899"
            computerColor="#0f172a"
            windowColor="#0284c7"
          />
        </div>
      </div>
    </div>
  );
}
