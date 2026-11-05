"use client";

import React from 'react';
import { Play } from 'lucide-react';

/**
 * Large, Clear SVG Cursor Pointer (Strictly No Emojis)
 * Sized 30x30 for high visibility and prominence matching Moon Level 1
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
 * Common Workspace Toolbox Sidebar matching Moon Level 1 layout
 */
function Earth1ToolboxSidebar() {
  return (
    <div className="flex flex-col gap-2 w-18 shrink-0 py-1.5 select-none font-mono">
      <div className="text-[9.5px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/50 border-l-2 border-purple-400 px-2 py-1 rounded-r shadow-xs">
        Data
      </div>
      <div className="text-[9.5px] font-bold uppercase tracking-wider text-blue-300 bg-blue-950/50 border-l-2 border-blue-400 px-2 py-1 rounded-r shadow-xs">
        Tools
      </div>
    </div>
  );
}

/**
 * Authentic Laboratory Stage Backdrop matching EarthLevel1Lab.tsx
 */
function LabStageBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#030712] flex flex-col justify-end items-center pb-2">
      {/* Deep Space Observatory Window */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 360">
          <defs>
            <radialGradient id="labCosmosReal" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#090d16" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#020617" stopOpacity="1" />
            </radialGradient>
            <linearGradient id="bulkheadLeftReal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0b0f19" />
              <stop offset="70%" stopColor="#131b2e" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="bulkheadRightReal" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#0b0f19" />
              <stop offset="70%" stopColor="#131b2e" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="floorDeckGradReal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="35%" stopColor="#090d16" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          {/* Deep Space Window */}
          <polygon points="90,20 710,20 780,240 20,240" fill="url(#labCosmosReal)" stroke="#1e293b" strokeWidth="2" />

          {/* Twinkling Space Stars */}
          <circle cx="150" cy="50" r="1.5" fill="#ffffff" opacity="0.85" />
          <circle cx="280" cy="80" r="1.2" fill="#7dd3fc" opacity="0.9" />
          <circle cx="420" cy="40" r="1.8" fill="#ffffff" opacity="0.95" />
          <circle cx="560" cy="70" r="1.2" fill="#a78bfa" opacity="0.85" />
          <circle cx="640" cy="110" r="1.5" fill="#ffffff" opacity="0.75" />
          <circle cx="210" cy="130" r="1" fill="#bae6fd" opacity="0.6" />
          <circle cx="370" cy="120" r="1.2" fill="#ffffff" opacity="0.8" />
          <circle cx="500" cy="140" r="1" fill="#7dd3fc" opacity="0.7" />

          {/* Observatory Window Mullions */}
          <line x1="90" y1="20" x2="20" y2="240" stroke="#334155" strokeWidth="2" />
          <line x1="710" y1="20" x2="780" y2="240" stroke="#334155" strokeWidth="2" />
          <line x1="280" y1="20" x2="260" y2="240" stroke="#1e293b" strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="520" y1="20" x2="540" y2="240" stroke="#1e293b" strokeWidth="1.5" strokeOpacity="0.7" />

          {/* Bulkhead Walls */}
          <path d="M 0 0 L 90 20 L 20 240 L 0 240 Z" fill="url(#bulkheadLeftReal)" stroke="#334155" strokeWidth="1.5" />
          <path d="M 800 0 L 710 20 L 780 240 L 800 240 Z" fill="url(#bulkheadRightReal)" stroke="#334155" strokeWidth="1.5" />

          {/* Floor Deck with perspective seams */}
          <rect x="0" y="240" width="800" height="120" fill="url(#floorDeckGradReal)" />
          <line x1="0" y1="240" x2="800" y2="240" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="2" />
          <line x1="160" y1="240" x2="70" y2="360" stroke="#25354d" strokeWidth="1.5" />
          <line x1="640" y1="240" x2="730" y2="360" stroke="#25354d" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Ceiling Industrial Rail */}
      <div className="absolute top-1.5 inset-x-2 h-2 rounded bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 shadow-md border-b border-slate-600 z-20 pointer-events-none flex items-center justify-between px-2">
        <div className="w-1.5 h-0.5 bg-slate-500 rounded-full" />
        <div className="w-20 h-0.5 bg-slate-600 rounded-full" />
        <div className="w-1.5 h-0.5 bg-slate-500 rounded-full" />
      </div>

      {/* Stage Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end items-center">
        {children}
      </div>
    </div>
  );
}

/**
 * Authentic 3D Laboratory Countertop matching EarthLevel1Lab.tsx
 */
function LabCountertop({
  children,
  ledText = "['ASTRO', 'LINK']",
}: {
  children: React.ReactNode;
  ledText?: string;
}) {
  return (
    <div className="w-full max-w-[340px] sm:max-w-[360px] flex flex-col items-center relative z-20">
      {/* Nova behind Counter */}
      <div className="relative -mb-4 flex flex-col items-center pointer-events-none z-10">
        <img
          src="/assets/global/npcs/Nova Idle.svg"
          alt="Nova"
          className="w-18 h-18 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
        />
      </div>

      {/* Platinum Countertop Slab */}
      <div
        className="w-full rounded-t-lg px-2 pt-2.5 pb-2 flex flex-col items-center relative z-20 shadow-[0_6px_20px_rgba(0,0,0,0.6)] border-t-2 border-x-2 border-slate-300"
        style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 60%, #cbd5e1 100%)',
        }}
      >
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mb-1 opacity-90" />
        <div className="w-full flex items-center justify-center min-h-[36px]">
          {children}
        </div>
      </div>

      {/* 3D Front Lip */}
      <div className="w-full h-2 bg-[#475569] border-t border-slate-300 relative z-20" />

      {/* Counter Base with Target LED Display */}
      <div className="w-[94%] bg-[#0f172a] border-t border-slate-700 px-3 py-1 rounded-b flex items-center justify-between shadow-lg relative z-10">
        <span className="text-[8.5px] font-mono uppercase tracking-wider text-slate-400">Ledger:</span>
        <span className="text-[10px] font-mono font-bold text-cyan-300 bg-black/60 px-2 py-0.5 rounded border border-cyan-500/30 truncate max-w-[200px]">
          {ledText}
        </span>
      </div>
    </div>
  );
}

/**
 * =============================================================================
 * SLIDE 1: HOW TO WIN THE LEVEL (MASTER LEDGER PIPELINE)
 * =============================================================================
 * Full pipeline showing how blocks connect and execute sequentially:
 * - 0% - 20%: Load Data executes -> Raw string "#@ASTRO_LINK*" appears
 * - 25% - 48%: Cut block executes -> Lasers fire and slice boundary junk #@ and *
 * - 50% - 72%: Split block executes -> Boom! Delimiter detonates -> ASTRO and LINK separate
 * - 75% - 92%: Print Data executes -> Ledger screen lights up ['ASTRO', 'LINK']
 */
export function EarthLevel1Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        /* Pipeline timing: 8 seconds loop */
        @keyframes e1s1StatusReady {
          0%, 18% { opacity: 1; }
          22%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes e1s1StatusRunning {
          0%, 18% { opacity: 0; }
          22%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        @keyframes e1s1TraceLine {
          0%, 20% { top: 34px; }   /* Load Data */
          25%, 48% { top: 66px; }  /* Cut from 2 to 12 */
          50%, 72% { top: 98px; }  /* Split at "_" */
          75%, 90% { top: 130px; } /* Print Data */
          94%, 100% { top: 162px; }/* End Program */
        }
        @keyframes e1s1LaserBeam {
          0%, 26% { opacity: 0; height: 0px; }
          28%, 44% { opacity: 1; height: 140px; }
          48%, 100% { opacity: 0; height: 0px; }
        }
        @keyframes e1s1JunkCut {
          0%, 28% { opacity: 1; transform: scale(1); filter: none; }
          30%, 44% { opacity: 1; transform: scale(1.08); filter: drop-shadow(0 0 10px #ef4444); background-color: #ef4444; }
          48%, 92% { opacity: 0; transform: scale(0.2); width: 0px; margin: 0px; padding: 0px; border-width: 0px; }
          96%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes e1s1BoomShockwave {
          0%, 50% { opacity: 0; transform: scale(0.2); }
          52% { opacity: 1; transform: scale(1.2); }
          58%, 100% { opacity: 0; transform: scale(2.8); }
        }
        @keyframes e1s1BoomFireball {
          0%, 50% { opacity: 0; transform: scale(0.2); }
          52% { opacity: 1; transform: scale(1.4); }
          56%, 100% { opacity: 0; transform: scale(2.2); }
        }
        @keyframes e1s1CounterShake {
          0%, 50% { transform: translate(0, 0); }
          51% { transform: translate(-3px, 1px); }
          53% { transform: translate(3px, -1px); }
          55% { transform: translate(-2px, 1px); }
          57% { transform: translate(2px, -1px); }
          59%, 100% { transform: translate(0, 0); }
        }
        @keyframes e1s1DelimExplode {
          0%, 48% { opacity: 1; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); background-color: #ef4444; }
          52%, 92% { opacity: 0; transform: scale(0.1); width: 0px; margin: 0px; padding: 0px; border-width: 0px; }
          96%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes e1s1ChunkSplitLeft {
          0%, 52% { transform: translateX(0px); }
          56%, 92% { transform: translateX(-8px); }
          96%, 100% { transform: translateX(0px); }
        }
        @keyframes e1s1ChunkSplitRight {
          0%, 52% { transform: translateX(0px); }
          56%, 92% { transform: translateX(8px); }
          96%, 100% { transform: translateX(0px); }
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
          <Earth1ToolboxSidebar />

          {/* Block Stack: Spacious, comfortable, Moon Level 1 scale */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Active Execution Line indicator */}
            <div
              className="absolute -left-2 w-1.5 h-8 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] pointer-events-none transition-all duration-300"
              style={{ animation: 'e1s1TraceLine 8s ease-in-out infinite' }}
            />

            {/* Start Program */}
            <div className="h-8 bg-[#ef4444] text-white text-[11px] font-bold px-2.5 rounded-t flex items-center gap-1.5 shadow border-t border-x border-red-300/40">
              <Play size={10} fill="white" />
              <span>Start Program</span>
            </div>

            {/* Load Data */}
            <div className="h-8 bg-[#8b5cf6] text-white text-[11px] font-bold px-2.5 flex items-center border-t border-black/20 shadow">
              <span>Load Data</span>
            </div>

            {/* Cut from 2 to 12 */}
            <div className="h-8 bg-[#ef4444] text-white text-[10.5px] font-bold px-2.5 flex items-center justify-between border-t border-black/20 shadow">
              <span>Cut</span>
              <span className="bg-black/50 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 font-bold border border-white/10">2</span>
              <span>to</span>
              <span className="bg-black/50 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 font-bold border border-white/10">12</span>
            </div>

            {/* Split at "_" */}
            <div className="h-8 bg-[#10b981] text-white text-[10.5px] font-bold px-2.5 flex items-center justify-between border-t border-black/20 shadow">
              <span>Split at</span>
              <span className="bg-black/50 px-2.5 py-0.5 rounded text-[10px] font-mono text-emerald-200 font-bold border border-white/10">&quot;_&quot;</span>
            </div>

            {/* Print Data */}
            <div className="h-8 bg-[#3b82f6] text-white text-[11px] font-bold px-2.5 flex items-center border-t border-black/20 shadow">
              <span>Print Data</span>
            </div>

            {/* End Program */}
            <div className="h-8 bg-[#ef4444] text-white text-[11px] font-bold px-2.5 rounded-b flex items-center shadow border-b border-x border-red-300/40 border-t border-black/20">
              <span>End Program</span>
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
              style={{ animation: 'e1s1StatusReady 8s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'e1s1StatusRunning 8s ease-in-out infinite' }}
            >
              RUNNING CODE
            </span>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <LabStageBackdrop>
            {/* Ceiling Rail Gantry Lasers */}
            <div className="absolute top-2 inset-x-0 pointer-events-none z-30 flex justify-center">
              <div className="relative w-[280px] h-6 flex justify-between px-6">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-3 bg-[#1e293b] border border-slate-600 rounded-xs flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                  </div>
                  <div
                    className="w-0.5 bg-white shadow-[0_0_10px_#ef4444,0_0_20px_#dc2626] pointer-events-none"
                    style={{ animation: 'e1s1LaserBeam 8s ease-in-out infinite' }}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-6 h-3 bg-[#1e293b] border border-slate-600 rounded-xs flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                  </div>
                  <div
                    className="w-0.5 bg-white shadow-[0_0_10px_#ef4444,0_0_20px_#dc2626] pointer-events-none"
                    style={{ animation: 'e1s1LaserBeam 8s ease-in-out infinite' }}
                  />
                </div>
              </div>
            </div>

            {/* Split Boom from EarthLevel1Lab.tsx */}
            <div className="absolute top-[68%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-40">
              <div
                className="w-14 h-14 rounded-full border-4 border-amber-400 bg-orange-600/50 shadow-[0_0_25px_#f97316]"
                style={{ animation: 'e1s1BoomShockwave 8s ease-out infinite' }}
              />
              <div
                className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white shadow-[0_0_20px_#ffffff,0_0_35px_#f59e0b,0_0_50px_#ef4444]"
                style={{ animation: 'e1s1BoomFireball 8s ease-out infinite' }}
              />
            </div>

            {/* Countertop with Tiles */}
            <div
              className="w-full flex justify-center"
              style={{ animation: 'e1s1CounterShake 8s ease-in-out infinite' }}
            >
              <LabCountertop ledText="['ASTRO', 'LINK']">
                <div className="flex items-center gap-0.5 font-mono font-bold text-[10.5px] text-white">
                  <div
                    className="flex items-center gap-0.5 overflow-hidden transition-all duration-300"
                    style={{ animation: 'e1s1JunkCut 8s ease-in-out infinite' }}
                  >
                    <span className="w-4.5 h-6 rounded bg-red-950/70 border border-red-500/80 text-red-300 flex items-center justify-center">#</span>
                    <span className="w-4.5 h-6 rounded bg-red-950/70 border border-red-500/80 text-red-300 flex items-center justify-center">@</span>
                  </div>

                  <div
                    className="flex items-center gap-0.5 transition-transform duration-300"
                    style={{ animation: 'e1s1ChunkSplitLeft 8s ease-in-out infinite' }}
                  >
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">A</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">S</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">T</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">R</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">O</span>
                  </div>

                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ animation: 'e1s1DelimExplode 8s ease-in-out infinite' }}
                  >
                    <span className="w-4.5 h-6 rounded bg-amber-950/70 border border-amber-500 text-amber-300 flex items-center justify-center">_</span>
                  </div>

                  <div
                    className="flex items-center gap-0.5 transition-transform duration-300"
                    style={{ animation: 'e1s1ChunkSplitRight 8s ease-in-out infinite' }}
                  >
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">L</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">I</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">N</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">K</span>
                  </div>

                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ animation: 'e1s1JunkCut 8s ease-in-out infinite' }}
                  >
                    <span className="w-4.5 h-6 rounded bg-red-950/70 border border-red-500/80 text-red-300 flex items-center justify-center">*</span>
                  </div>
                </div>
              </LabCountertop>
            </div>
          </LabStageBackdrop>
        </div>
      </div>
    </div>
  );
}

/**
 * =============================================================================
 * SLIDE 2: THE CUT BLOCK (ONLY CUT RELEVANT BLOCKS)
 * =============================================================================
 * Focus strictly on Cut:
 * Workspace Stack: Start -> Load Data -> Cut 2 to 12 -> End Program. (NO Split, NO Replace!)
 * - 0% - 30%: Status READY. Large cursor moves to Cut block and clicks it.
 * - 30% - 38%: Cut block flashes with highlight glow.
 * - 36%: Status flips to RUNNING CODE.
 * - 42% - 54%: Gantry lasers align with slice points 2 and 12.
 * - 56% - 74%: Laser beams fire down, outer junk #@ and * vaporize!
 * - 78% - 94%: Clean slice 'ASTRO_LINK' remains.
 */
export function EarthLevel1Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        /* Aligned Cut timing: 6 seconds loop */
        @keyframes simStatusReadyE2 {
          0%, 35% { opacity: 1; }
          40%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes simStatusRunningE2 {
          0%, 35% { opacity: 0; }
          40%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        @keyframes e1s2CutPulse {
          0%, 15% { filter: brightness(1); outline: none; }
          25%, 35% { filter: brightness(1.4); outline: 2px solid #ff912d; box-shadow: 0 0 16px rgba(255,145,45,0.9); }
          45%, 85% { filter: brightness(1.15); outline: 1px solid #ff912d; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes e1s2CursorMoveClick {
          0% { transform: translate(-50px, 30px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; } /* Click */
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-50px, 30px); opacity: 0; }
        }
        @keyframes e1s2LaserGuide {
          0%, 38% { opacity: 0; }
          42%, 55% { opacity: 1; }
          58%, 100% { opacity: 0; }
        }
        @keyframes e1s2LaserFire {
          0%, 54% { opacity: 0; height: 0px; }
          56%, 74% { opacity: 1; height: 145px; }
          78%, 100% { opacity: 0; height: 0px; }
        }
        @keyframes e1s2OuterJunkVaporize {
          0%, 55% { opacity: 1; transform: scale(1); filter: none; }
          58%, 74% { opacity: 1; transform: scale(1.08); background-color: #ef4444; filter: drop-shadow(0 0 12px #ef4444); }
          78%, 92% { opacity: 0; transform: scale(0.2); width: 0px; margin: 0px; padding: 0px; border-width: 0px; }
          96%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes e1s2LaserGantrySlideLeft {
          0%, 36% { transform: translateX(-35px); }
          44%, 82% { transform: translateX(0px); }
          90%, 100% { transform: translateX(-35px); }
        }
        @keyframes e1s2LaserGantrySlideRight {
          0%, 36% { transform: translateX(35px); }
          44%, 82% { transform: translateX(0px); }
          90%, 100% { transform: translateX(35px); }
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
          <Earth1ToolboxSidebar />

          {/* Clean Block Stack: ONLY Cut-relevant blocks */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Start Program */}
            <div className="h-8 bg-[#ef4444] text-white text-[11px] font-bold px-2.5 rounded-t flex items-center gap-1.5 shadow border-t border-x border-red-300/40">
              <Play size={10} fill="white" />
              <span>Start Program</span>
            </div>

            {/* Load Data */}
            <div className="h-8 bg-[#8b5cf6] text-white text-[11px] font-bold px-2.5 flex items-center border-t border-black/20 shadow">
              <span>Load Data</span>
            </div>

            {/* Cut Block - Highlighted & Clicked */}
            <div
              className="relative h-8 bg-[#ef4444] text-white text-[10.5px] font-bold px-2.5 flex items-center justify-between border-t border-black/20 shadow z-20"
              style={{ animation: 'e1s2CutPulse 6s ease-in-out infinite' }}
            >
              <span>Cut</span>
              <span className="bg-black/50 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 font-bold border border-white/20">2</span>
              <span>to</span>
              <span className="bg-black/50 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 font-bold border border-white/20">12</span>

              {/* Large Visible Cursor Pointer Clicking */}
              <div
                className="absolute right-4 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'e1s2CursorMoveClick 6s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>

            {/* End Program */}
            <div className="h-8 bg-[#ef4444] text-white text-[11px] font-bold px-2.5 rounded-b flex items-center shadow border-b border-x border-red-300/40 border-t border-black/20">
              <span>End Program</span>
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
              style={{ animation: 'simStatusReadyE2 6s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'simStatusRunningE2 6s ease-in-out infinite' }}
            >
              RUNNING CODE
            </span>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <LabStageBackdrop>
            {/* Ceiling Rail Gantry Lasers */}
            <div className="absolute top-2 inset-x-0 pointer-events-none z-30 flex justify-center">
              <div className="relative w-[280px] h-6 flex justify-between px-7">
                <div
                  className="flex flex-col items-center"
                  style={{ animation: 'e1s2LaserGantrySlideLeft 6s ease-in-out infinite' }}
                >
                  <div className="w-7 h-4 bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-slate-600 rounded-xs flex items-center justify-between px-1">
                    <div className="w-1.5 h-0.5 bg-amber-400 rounded-full" />
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                  </div>
                  <div
                    className="w-0 border-l-2 border-dashed border-red-500 shadow-[0_0_8px_#ef4444] h-[145px]"
                    style={{ animation: 'e1s2LaserGuide 6s ease-in-out infinite' }}
                  />
                  <div
                    className="w-1 bg-white shadow-[0_0_12px_#ef4444,0_0_24px_#dc2626] -mt-[145px] pointer-events-none"
                    style={{ animation: 'e1s2LaserFire 6s ease-in-out infinite' }}
                  />
                </div>

                <div
                  className="flex flex-col items-center"
                  style={{ animation: 'e1s2LaserGantrySlideRight 6s ease-in-out infinite' }}
                >
                  <div className="w-7 h-4 bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-slate-600 rounded-xs flex items-center justify-between px-1">
                    <div className="w-1.5 h-0.5 bg-amber-400 rounded-full" />
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                  </div>
                  <div
                    className="w-0 border-l-2 border-dashed border-red-500 shadow-[0_0_8px_#ef4444] h-[145px]"
                    style={{ animation: 'e1s2LaserGuide 6s ease-in-out infinite' }}
                  />
                  <div
                    className="w-1 bg-white shadow-[0_0_12px_#ef4444,0_0_24px_#dc2626] -mt-[145px] pointer-events-none"
                    style={{ animation: 'e1s2LaserFire 6s ease-in-out infinite' }}
                  />
                </div>
              </div>
            </div>

            {/* Countertop with Tiles & Cut Action */}
            <LabCountertop ledText="Clean Slice: 'ASTRO_LINK'">
              <div className="flex items-center gap-0.5 font-mono font-bold text-[10.5px] text-white">
                <div
                  className="flex items-center gap-0.5 overflow-hidden transition-all duration-300"
                  style={{ animation: 'e1s2OuterJunkVaporize 6s ease-in-out infinite' }}
                >
                  <span className="w-4.5 h-6 rounded bg-red-950/70 border border-red-500/80 text-red-300 flex items-center justify-center">#</span>
                  <span className="w-4.5 h-6 rounded bg-red-950/70 border border-red-500/80 text-red-300 flex items-center justify-center">@</span>
                </div>

                <div className="flex items-center gap-0.5">
                  <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400/80 text-emerald-300 flex items-center justify-center">A</span>
                  <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400/80 text-emerald-300 flex items-center justify-center">S</span>
                  <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400/80 text-emerald-300 flex items-center justify-center">T</span>
                  <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400/80 text-emerald-300 flex items-center justify-center">R</span>
                  <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400/80 text-emerald-300 flex items-center justify-center">O</span>
                  <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400/80 text-emerald-300 flex items-center justify-center">_</span>
                  <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400/80 text-emerald-300 flex items-center justify-center">L</span>
                  <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400/80 text-emerald-300 flex items-center justify-center">I</span>
                  <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400/80 text-emerald-300 flex items-center justify-center">N</span>
                  <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400/80 text-emerald-300 flex items-center justify-center">K</span>
                </div>

                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ animation: 'e1s2OuterJunkVaporize 6s ease-in-out infinite' }}
                >
                  <span className="w-4.5 h-6 rounded bg-red-950/70 border border-red-500/80 text-red-300 flex items-center justify-center">*</span>
                </div>
              </div>
            </LabCountertop>
          </LabStageBackdrop>
        </div>
      </div>
    </div>
  );
}

/**
 * =============================================================================
 * SLIDE 3: THE SPLIT BLOCK (ONLY SPLIT RELEVANT BLOCKS + VISCERAL BOOM)
 * =============================================================================
 * Focus strictly on Split:
 * Workspace Stack: Start -> Load Data -> Split at "_" -> End Program. (NO Cut, NO Replace!)
 * - 0% - 30%: Status READY. Large cursor moves to Split block and clicks it.
 * - 30% - 38%: Split block flashes with emerald highlight.
 * - 36%: Status flips to RUNNING CODE.
 * - 40% - 48%: Tile '_' arms pulsing red (isDelimArmed from EarthLevel1Lab.tsx).
 * - 50% - 66%: BOOM! Visceral shockwave ring + central fireball core + 8 flying embers + countertop shake!
 * - 68% - 90%: Delimiter detonates into split gap, ASTRO and LINK separate into ['ASTRO', 'LINK'].
 */
export function EarthLevel1Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        /* Aligned Split timing: 6 seconds loop */
        @keyframes simStatusReadyE3 {
          0%, 35% { opacity: 1; }
          40%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes simStatusRunningE3 {
          0%, 35% { opacity: 0; }
          40%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        @keyframes e1s3SplitPulse {
          0%, 15% { filter: brightness(1); outline: none; }
          25%, 35% { filter: brightness(1.4); outline: 2px solid #10b981; box-shadow: 0 0 16px rgba(16,185,129,0.9); }
          45%, 85% { filter: brightness(1.15); outline: 1px solid #10b981; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes e1s3CursorMoveClick {
          0% { transform: translate(-50px, 30px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; } /* Click */
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-50px, 30px); opacity: 0; }
        }
        /* Delimiter armed state matching EarthLevel1Lab.tsx isDelimArmed */
        @keyframes e1s3DelimArm {
          0%, 38% { background-color: #1e293b; transform: scale(1); border-color: #64748b; }
          40%, 48% { background-color: #ef4444; transform: scale(1.15); border-color: #fca5a5; box-shadow: 0 0 15px #ef4444; }
          50%, 92% { opacity: 0; transform: scale(0.1); width: 0px; margin: 0px; padding: 0px; border-width: 0px; }
          96%, 100% { opacity: 1; transform: scale(1); }
        }
        /* EXACT VISCERAL BOOM FROM EarthLevel1Lab.tsx lines 1339-1351 */
        @keyframes e1s3BoomShockwave {
          0%, 48% { opacity: 0; transform: scale(0.2); }
          50% { opacity: 1; transform: scale(1); }
          58%, 100% { opacity: 0; transform: scale(2.8); }
        }
        @keyframes e1s3BoomFireball {
          0%, 48% { opacity: 0; transform: scale(0.2); }
          50% { opacity: 1; transform: scale(1.4); }
          56%, 100% { opacity: 0; transform: scale(2.2); }
        }
        /* Countertop rumble shake from EarthLevel1Lab.tsx */
        @keyframes e1s3CounterShake {
          0%, 48% { transform: translate(0, 0); }
          50% { transform: translate(-3px, 1px); }
          52% { transform: translate(3px, -1px); }
          54% { transform: translate(-2px, 1px); }
          56% { transform: translate(2px, -1px); }
          58%, 100% { transform: translate(0, 0); }
        }
        @keyframes e1s3ChunkLeft {
          0%, 50% { transform: translateX(0px); }
          54%, 92% { transform: translateX(-10px); }
          96%, 100% { transform: translateX(0px); }
        }
        @keyframes e1s3ChunkRight {
          0%, 50% { transform: translateX(0px); }
          54%, 92% { transform: translateX(10px); }
          96%, 100% { transform: translateX(0px); }
        }
        @keyframes e1s3BracketFade {
          0%, 52% { opacity: 0; transform: scale(0.6); }
          56%, 92% { opacity: 1; transform: scale(1); }
          96%, 100% { opacity: 0; transform: scale(0.6); }
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
          <Earth1ToolboxSidebar />

          {/* Clean Block Stack: ONLY Split-relevant blocks */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Start Program */}
            <div className="h-8 bg-[#ef4444] text-white text-[11px] font-bold px-2.5 rounded-t flex items-center gap-1.5 shadow border-t border-x border-red-300/40">
              <Play size={10} fill="white" />
              <span>Start Program</span>
            </div>

            {/* Load Data */}
            <div className="h-8 bg-[#8b5cf6] text-white text-[11px] font-bold px-2.5 flex items-center border-t border-black/20 shadow">
              <span>Load Data</span>
            </div>

            {/* Split Block - Highlighted & Clicked (NO Cut, NO Replace!) */}
            <div
              className="relative h-8 bg-[#10b981] text-white text-[10.5px] font-bold px-2.5 flex items-center justify-between border-t border-black/20 shadow z-20"
              style={{ animation: 'e1s3SplitPulse 6s ease-in-out infinite' }}
            >
              <span>Split at</span>
              <span className="bg-black/50 px-2.5 py-0.5 rounded text-[10px] font-mono text-emerald-200 font-bold border border-white/20">&quot;_&quot;</span>

              {/* Large Visible Cursor Pointer Clicking */}
              <div
                className="absolute right-4 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'e1s3CursorMoveClick 6s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>

            {/* End Program */}
            <div className="h-8 bg-[#ef4444] text-white text-[11px] font-bold px-2.5 rounded-b flex items-center shadow border-b border-x border-red-300/40 border-t border-black/20">
              <span>End Program</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation with Visceral Boom */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'simStatusReadyE3 6s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'simStatusRunningE3 6s ease-in-out infinite' }}
            >
              RUNNING CODE
            </span>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <LabStageBackdrop>
            {/* VISCERAL BOOM EXPLOSION: EXACT SPECS FROM EarthLevel1Lab.tsx */}
            <div className="absolute top-[68%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
              {/* Fiery Shockwave Ring */}
              <div
                className="w-14 h-14 rounded-full border-4 border-amber-400 bg-orange-600/50 shadow-[0_0_25px_#f97316]"
                style={{ animation: 'e1s3BoomShockwave 6s ease-out infinite' }}
              />
              {/* Central Blinding Fireball Core */}
              <div
                className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white shadow-[0_0_20px_#ffffff,0_0_35px_#f59e0b,0_0_50px_#ef4444]"
                style={{ animation: 'e1s3BoomFireball 6s ease-out infinite' }}
              />
              {/* 8 Flying Ember Sparks */}
              <div
                className="absolute -top-3 -left-3 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#f59e0b]"
                style={{ animation: 'e1s3BoomShockwave 6s ease-out infinite' }}
              />
              <div
                className="absolute -top-3 -right-3 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#f59e0b]"
                style={{ animation: 'e1s3BoomShockwave 6s ease-out infinite' }}
              />
              <div
                className="absolute -bottom-3 -left-3 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#f59e0b]"
                style={{ animation: 'e1s3BoomShockwave 6s ease-out infinite' }}
              />
              <div
                className="absolute -bottom-3 -right-3 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#f59e0b]"
                style={{ animation: 'e1s3BoomShockwave 6s ease-out infinite' }}
              />
              <div
                className="absolute -top-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]"
                style={{ animation: 'e1s3BoomShockwave 6s ease-out infinite' }}
              />
              <div
                className="absolute -bottom-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]"
                style={{ animation: 'e1s3BoomShockwave 6s ease-out infinite' }}
              />
              <div
                className="absolute -left-4 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"
                style={{ animation: 'e1s3BoomShockwave 6s ease-out infinite' }}
              />
              <div
                className="absolute -right-4 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"
                style={{ animation: 'e1s3BoomShockwave 6s ease-out infinite' }}
              />
            </div>

            {/* Countertop with Split Action and Table Shake */}
            <div
              className="w-full flex justify-center"
              style={{ animation: 'e1s3CounterShake 6s ease-in-out infinite' }}
            >
              <LabCountertop ledText="['ASTRO', 'LINK']">
                <div className="flex items-center font-mono font-bold text-[10.5px] text-white">
                  <span
                    className="text-emerald-400 text-sm font-black mr-1"
                    style={{ animation: 'e1s3BracketFade 6s ease-in-out infinite' }}
                  >
                    [
                  </span>

                  <div
                    className="flex items-center gap-0.5 transition-transform duration-300"
                    style={{ animation: 'e1s3ChunkLeft 6s ease-in-out infinite' }}
                  >
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400 text-emerald-300 flex items-center justify-center">A</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400 text-emerald-300 flex items-center justify-center">S</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400 text-emerald-300 flex items-center justify-center">T</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400 text-emerald-300 flex items-center justify-center">R</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400 text-emerald-300 flex items-center justify-center">O</span>
                  </div>

                  {/* Delimiter that arms and detonates */}
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ animation: 'e1s3DelimArm 6s ease-in-out infinite' }}
                  >
                    <span className="w-4.5 h-6 rounded flex items-center justify-center text-white">_</span>
                  </div>

                  <span
                    className="text-emerald-300 text-sm font-black mx-1"
                    style={{ animation: 'e1s3BracketFade 6s ease-in-out infinite' }}
                  >
                    ,
                  </span>

                  <div
                    className="flex items-center gap-0.5 transition-transform duration-300"
                    style={{ animation: 'e1s3ChunkRight 6s ease-in-out infinite' }}
                  >
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400 text-emerald-300 flex items-center justify-center">L</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400 text-emerald-300 flex items-center justify-center">I</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400 text-emerald-300 flex items-center justify-center">N</span>
                    <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-emerald-400 text-emerald-300 flex items-center justify-center">K</span>
                  </div>

                  <span
                    className="text-emerald-400 text-sm font-black ml-1"
                    style={{ animation: 'e1s3BracketFade 6s ease-in-out infinite' }}
                  >
                    ]
                  </span>
                </div>
              </LabCountertop>
            </div>
          </LabStageBackdrop>
        </div>
      </div>
    </div>
  );
}

/**
 * =============================================================================
 * SLIDE 4: THE REPLACE BLOCK (ONLY REPLACE RELEVANT BLOCKS)
 * =============================================================================
 * Focus strictly on Replace:
 * Workspace Stack: Start -> Load Data -> Replace "3" with "E" -> End Program. (NO Cut, NO Split!)
 * - 0% - 30%: Status READY. Large cursor moves to Replace block and clicks it.
 * - 30% - 38%: Replace block flashes with amber highlight glow.
 * - 36%: Status flips to RUNNING CODE.
 * - 40% - 55%: Overhead crane trolley moves over column '3', lowers cable & catch claw.
 * - 55% - 70%: Clamps and hoists corrupted '3' off-screen.
 * - 70% - 85%: Descends with clean 'E' and drops it into slot -> flashes emerald green!
 * - 85% - 94%: Ledger reflects clean repaired word 'NET_START'.
 */
export function EarthLevel1Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        /* Aligned Replace timing: 6.5 seconds loop */
        @keyframes simStatusReadyE4 {
          0%, 35% { opacity: 1; }
          40%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes simStatusRunningE4 {
          0%, 35% { opacity: 0; }
          40%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
        }
        @keyframes e1s4ReplacePulse {
          0%, 15% { filter: brightness(1); outline: none; }
          25%, 35% { filter: brightness(1.4); outline: 2px solid #f59e0b; box-shadow: 0 0 16px rgba(245,158,11,0.9); }
          45%, 85% { filter: brightness(1.15); outline: 1px solid #f59e0b; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes e1s4CursorMoveClick {
          0% { transform: translate(-50px, 30px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; } /* Click */
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-50px, 30px); opacity: 0; }
        }
        @keyframes e1s4CraneHoist {
          0%, 38% { transform: translateY(-30px); }
          44%, 54% { transform: translateY(115px); } /* Lower to grab 3 */
          60%, 68% { transform: translateY(-30px); } /* Hoist 3 off-screen */
          74%, 84% { transform: translateY(115px); } /* Lower with E */
          90%, 100% { transform: translateY(-30px); }/* Retract */
        }
        @keyframes e1s4CraneCarrying {
          0%, 44% { opacity: 0; }
          45%, 62% { opacity: 1; content: '3'; }
          68%, 85% { opacity: 1; content: 'E'; }
          90%, 100% { opacity: 0; }
        }
        @keyframes e1s4TileOld3 {
          0%, 50% { opacity: 1; }
          54%, 74% { opacity: 0; }
          76%, 100% { opacity: 0; }
        }
        @keyframes e1s4TileNewE {
          0%, 76% { opacity: 0; transform: scale(0.5); }
          80%, 92% { opacity: 1; transform: scale(1); background-color: #065f46; border-color: #10b981; filter: drop-shadow(0 0 10px #10b981); }
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
          <Earth1ToolboxSidebar />

          {/* Clean Block Stack: ONLY Replace-relevant blocks */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* Start Program */}
            <div className="h-8 bg-[#ef4444] text-white text-[11px] font-bold px-2.5 rounded-t flex items-center gap-1.5 shadow border-t border-x border-red-300/40">
              <Play size={10} fill="white" />
              <span>Start Program</span>
            </div>

            {/* Load Data */}
            <div className="h-8 bg-[#8b5cf6] text-white text-[11px] font-bold px-2.5 flex items-center border-t border-black/20 shadow">
              <span>Load Data</span>
            </div>

            {/* Replace Block - Highlighted & Clicked (NO Cut, NO Split!) */}
            <div
              className="relative h-8 bg-[#f59e0b] text-slate-950 text-[10px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow z-20"
              style={{ animation: 'e1s4ReplacePulse 6.5s ease-in-out infinite' }}
            >
              <span>Replace</span>
              <span className="bg-black/60 px-1.5 py-0.5 rounded text-[9.5px] font-mono text-amber-300 font-bold border border-white/10">&quot;3&quot;</span>
              <span>with</span>
              <span className="bg-black/60 px-1.5 py-0.5 rounded text-[9.5px] font-mono text-emerald-300 font-bold border border-white/10">&quot;E&quot;</span>

              {/* Large Visible Cursor Pointer Clicking */}
              <div
                className="absolute right-4 -bottom-3 pointer-events-none z-30"
                style={{ animation: 'e1s4CursorMoveClick 6.5s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>

            {/* End Program */}
            <div className="h-8 bg-[#ef4444] text-white text-[11px] font-bold px-2.5 rounded-b flex items-center shadow border-b border-x border-red-300/40 border-t border-black/20">
              <span>End Program</span>
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
              style={{ animation: 'simStatusReadyE4 6.5s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap"
              style={{ animation: 'simStatusRunningE4 6.5s ease-in-out infinite' }}
            >
              RUNNING CODE
            </span>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <LabStageBackdrop>
            {/* Overhead Crane Trolley */}
            <div className="absolute top-2 inset-x-0 pointer-events-none z-30 flex justify-center">
              <div className="relative w-[280px] h-6 flex items-center">
                <div className="absolute left-[78px] flex flex-col items-center">
                  <div className="w-7 h-4 rounded bg-[#1e293b] border-2 border-amber-500 flex items-center justify-center shadow-md">
                    <div className="w-2.5 h-1.5 bg-amber-400 rounded-xs" />
                  </div>

                  <div
                    className="flex flex-col items-center transition-transform"
                    style={{ animation: 'e1s4CraneHoist 6.5s ease-in-out infinite' }}
                  >
                    <div className="w-0.5 h-6 bg-slate-400" />
                    <div className="w-6 h-3.5 bg-amber-600 border border-amber-300 rounded-xs flex items-center justify-center shadow">
                      <span
                        className="text-[8.5px] font-black font-mono text-amber-200 bg-slate-900 px-1 rounded border border-amber-400/80 leading-none"
                        style={{ animation: 'e1s4CraneCarrying 6.5s ease-in-out infinite' }}
                      >
                        3
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Countertop with Tiles & Crane Swapping */}
            <LabCountertop ledText="Clean Data: 'NET_START'">
              <div className="flex items-center gap-0.5 font-mono font-bold text-[10.5px] text-white">
                <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">N</span>

                <div className="relative w-4.5 h-6">
                  <span
                    className="absolute inset-0 rounded bg-amber-950/70 border border-amber-500 text-amber-300 flex items-center justify-center"
                    style={{ animation: 'e1s4TileOld3 6.5s ease-in-out infinite' }}
                  >
                    3
                  </span>
                  <span
                    className="absolute inset-0 rounded flex items-center justify-center text-emerald-300 font-bold"
                    style={{ animation: 'e1s4TileNewE 6.5s ease-in-out infinite' }}
                  >
                    E
                  </span>
                </div>

                <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">T</span>
                <span className="w-4.5 h-6 rounded bg-slate-800 border border-slate-600 text-slate-400 flex items-center justify-center">_</span>
                <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">S</span>
                <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">T</span>
                <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">A</span>
                <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">R</span>
                <span className="w-4.5 h-6 rounded bg-[#1e293b] border border-slate-600 flex items-center justify-center">T</span>
              </div>
            </LabCountertop>
          </LabStageBackdrop>
        </div>
      </div>
    </div>
  );
}
