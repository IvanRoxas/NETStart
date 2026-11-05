"use client";

import React from 'react';

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

function MarsToolboxSidebar({ activeCategory = "headings" }: { activeCategory?: "headings" | "text" | "structure" }) {
  return (
    <div className="flex flex-col gap-2 w-18 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeCategory === 'headings' ? 'text-red-300 bg-red-950/80 border-l-2 border-red-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        Headings
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeCategory === 'text' ? 'text-sky-300 bg-sky-950/80 border-l-2 border-sky-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        Text
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeCategory === 'structure' ? 'text-purple-300 bg-purple-950/80 border-l-2 border-purple-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        Structure
      </div>
    </div>
  );
}

/**
 * Authentic Martian Colony Landscape Backdrop matching MartianBillboard.tsx
 */
function MarsBillboardStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 bg-[#1a0808] overflow-hidden select-none">
      {/* Martian sky gradient & red dunes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a0e0e] via-[#3a1515] to-[#1a0808] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 -right-10 h-28 bg-[#451818] rounded-t-[100%] opacity-40 blur-xs" />
      <div className="absolute -bottom-14 -left-20 -right-20 h-24 bg-[#6b2222] rounded-t-[100%] opacity-30 blur-xs" />

      {/* Industrial Billboard Frame */}
      <div className="relative z-10 w-full max-w-[270px] rounded-xl border-4 border-[#78350f] bg-[#0c0404] p-3 shadow-2xl flex flex-col items-center">
        {/* Top solar header bar */}
        <div className="w-full flex items-center justify-between border-b border-[#78350f]/60 pb-1.5 mb-2">
          <span className="text-[8.5px] font-mono font-bold text-amber-400 tracking-wider">MARS HABITAT DOME 4</span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
        </div>

        {/* Billboard Screen */}
        <div className="w-full min-h-[130px] rounded bg-[#180a0a] border border-[#78350f]/40 p-2.5 flex flex-col items-center justify-center text-center font-sans">
          {children}
        </div>

        {/* Support Steel Pylons */}
        <div className="w-full flex justify-between px-6 -mb-5 mt-2 pointer-events-none">
          <div className="w-2.5 h-4 bg-[#78350f] border-x border-[#92400e]" />
          <div className="w-2.5 h-4 bg-[#78350f] border-x border-[#92400e]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Mars Level 1 (The Blank Billboard)
 * Authentic blocks: html_div, html_h1, html_h3, html_p
 */
export function MarsLevel1Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m1s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m1s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m1s1BoardRender {
          0%, 30% { opacity: 0; transform: scale(0.9); }
          35%, 92% { opacity: 1; transform: scale(1); }
          96%, 100% { opacity: 0; transform: scale(0.9); }
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
          <MarsToolboxSidebar activeCategory="headings" />

          {/* Actual Blockly Stack: html_h1, html_h3, html_p */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* html_h1 Main Title */}
            <div className="h-7 bg-[#E44D26] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-orange-400/40">
              <span>Main Title:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-amber-300 font-mono truncate max-w-[105px]">&quot;WELCOME TO MARS&quot;</span>
            </div>

            {/* html_h3 Subtitle */}
            <div className="h-7 bg-[#F97316] text-white text-[9.5px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Subtitle:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-orange-200 font-mono truncate max-w-[110px]">&quot;Dome 4 - Open 24/7&quot;</span>
            </div>

            {/* html_p Paragraph Text */}
            <div className="h-7 bg-[#0284C7] text-white text-[9px] font-bold px-2 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-sky-400/20">
              <span>Paragraph Text:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-sky-200 font-mono truncate max-w-[95px]">&quot;Stay hydrated...&quot;</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm1s1Ready 7s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'm1s1Running 7s ease-in-out infinite' }}>BILLBOARD LIVE</span>
          </div>
        </div>

        <MarsBillboardStage>
          <div className="flex flex-col items-center gap-1.5" style={{ animation: 'm1s1BoardRender 7s ease-in-out infinite' }}>
            <h1 className="text-sm font-black text-amber-300 font-mono tracking-wider drop-shadow-[0_0_8px_#f59e0b]">
              WELCOME TO MARS
            </h1>
            <h3 className="text-xs font-bold text-orange-300 tracking-wide">
              Habitat Dome 4 - Open 24/7
            </h3>
            <p className="text-[9.5px] text-slate-300 max-w-[210px] leading-relaxed">
              Visit our habitat dome and stay hydrated.
            </p>
          </div>
        </MarsBillboardStage>
      </div>
    </div>
  );
}

/**
 * Slide 2: Adding Headings & Text Presets
 * Focus on html_h1 block with large cursor choosing title preset
 */
export function MarsLevel1Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m1s2Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m1s2Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m1s2Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes m1s2Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #E44D26; box-shadow: 0 0 16px rgba(228,77,38,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #E44D26; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes m1s2HeadingAppear {
          0%, 30% { opacity: 0; transform: translateY(-6px); }
          35%, 92% { opacity: 1; transform: translateY(0); }
          96%, 100% { opacity: 0; transform: translateY(-6px); }
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
          <MarsToolboxSidebar activeCategory="headings" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* html_h1 Main Title - Clicked */}
            <div
              className="relative h-7 bg-[#E44D26] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-orange-400/40 z-20"
              style={{ animation: 'm1s2Pulse 6s ease-in-out infinite' }}
            >
              <span>Main Title:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-yellow-300 font-mono truncate max-w-[105px]">&quot;OLYMPUS PIZZA&quot; ▾</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm1s2Cursor 6s ease-in-out infinite' }}>
                <CursorPointer />
              </div>
            </div>

            {/* html_h3 Subtitle */}
            <div className="h-7 bg-[#F97316] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-orange-400/20">
              <span>Subtitle:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-orange-200 font-mono truncate max-w-[110px]">&quot;Hot slices fresh!&quot;</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm1s2Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'm1s2Running 6s ease-in-out infinite' }}>RENDERING</span>
          </div>
        </div>

        <MarsBillboardStage>
          <div className="flex flex-col items-center gap-1.5">
            <h1
              className="text-sm font-black text-yellow-400 font-mono tracking-wider drop-shadow-[0_0_8px_#facc15]"
              style={{ animation: 'm1s2HeadingAppear 6s ease-in-out infinite' }}
            >
              OLYMPUS PIZZA
            </h1>
            <p className="text-[10px] text-orange-200 font-medium">
              Hot slices fresh from the oven!
            </p>
          </div>
        </MarsBillboardStage>
      </div>
    </div>
  );
}

/**
 * Slide 3: Grouping Elements with Container Box (html_div)
 */
export function MarsLevel1Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m1s3Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m1s3Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m1s3DivGlow {
          0%, 35% { border-color: rgba(251, 191, 36, 0.2); background-color: transparent; }
          40%, 92% { border-color: #f59e0b; background-color: rgba(245, 158, 11, 0.12); box-shadow: 0 0 15px rgba(245, 158, 11, 0.3); }
          96%, 100% { border-color: rgba(251, 191, 36, 0.2); background-color: transparent; }
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
          <MarsToolboxSidebar activeCategory="structure" />

          {/* Actual Blockly Stack: html_div with html_h1 and html_p nested */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* html_div Container Box Header */}
            <div className="h-7 bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Container Box</span>
            </div>

            {/* Nested html_h1 */}
            <div className="h-6 bg-[#E44D26] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Main Title:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-amber-300 truncate max-w-[95px]">&quot;DUST STORM&quot;</span>
            </div>

            {/* Nested html_p */}
            <div className="h-6 bg-[#0284C7] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Paragraph:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-sky-200 truncate max-w-[95px]">&quot;High winds...&quot;</span>
            </div>

            {/* Container Box Bottom */}
            <div className="h-5 bg-[#8B5CF6] text-white text-[9px] font-bold px-2 rounded-b flex items-center border-t border-black/20 shadow border-b border-x border-purple-400/20">
              <span>End Box</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm1s3Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'm1s3Running 6s ease-in-out infinite' }}>CONTAINER ACTIVE</span>
          </div>
        </div>

        <MarsBillboardStage>
          {/* Framed inside <div> container */}
          <div
            className="w-full p-2.5 rounded-lg border-2 flex flex-col items-center gap-1 transition-all"
            style={{ animation: 'm1s3DivGlow 6s ease-in-out infinite' }}
          >
            <h1 className="text-sm font-black text-red-400 font-mono tracking-wider drop-shadow-[0_0_6px_#ef4444]">
              DUST STORM ALERT
            </h1>
            <p className="text-[10px] text-orange-200">
              High winds approaching Sector 7
            </p>
          </div>
        </MarsBillboardStage>
      </div>
    </div>
  );
}
