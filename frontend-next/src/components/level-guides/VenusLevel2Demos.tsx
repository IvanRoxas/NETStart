"use client";

import React from 'react';
import { Monitor, Sparkles, Check } from 'lucide-react';

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

function Venus2ToolboxSidebar({ activeCategory = "panels" }: { activeCategory?: "panels" | "display" | "justify" | "align" }) {
  return (
    <div className="flex flex-col gap-1.5 w-20 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "panels"
          ? "text-fuchsia-300 bg-fuchsia-950/80 border-fuchsia-400"
          : "text-fuchsia-400/60 bg-fuchsia-950/30 border-fuchsia-500/30"
      }`}>
        Panels
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "display"
          ? "text-cyan-300 bg-cyan-950/80 border-cyan-400"
          : "text-cyan-400/60 bg-cyan-950/30 border-cyan-500/30"
      }`}>
        Display
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "justify"
          ? "text-emerald-300 bg-emerald-950/80 border-emerald-400"
          : "text-emerald-400/60 bg-emerald-950/30 border-emerald-500/30"
      }`}>
        Justify
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "align"
          ? "text-amber-300 bg-amber-950/80 border-amber-400"
          : "text-amber-400/60 bg-amber-950/30 border-amber-500/30"
      }`}>
        Align
      </div>
    </div>
  );
}

/**
 * Authentic Venus Navigation Console Stage replicating VenusLevel2Lab.tsx
 */
function Venus2LabScreenScene({
  panelId = 1,
  layoutClass = "flex-row justify-evenly items-center",
  statusText = "Side-by-Side • Spread Evenly • Center",
  isAligned = true,
}: {
  panelId?: number;
  layoutClass?: string;
  statusText?: string;
  isAligned?: boolean;
}) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-3 bg-[#070b14] overflow-hidden select-none">
      {/* Background Ambience Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Main Console Viewport Screen */}
      <div
        className={`relative z-10 w-full flex-1 rounded-2xl p-3 flex flex-col justify-between overflow-hidden border transition-all duration-500 shadow-2xl ${
          isAligned
            ? "bg-gradient-to-b from-[#061522] via-[#04101a] to-[#040a12] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]"
            : "bg-[#09090b] border-zinc-700/80 shadow-inner"
        }`}
      >
        {/* Viewport Top Bar */}
        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 text-[9px] font-mono shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300">
            <Monitor size={12} className="text-cyan-400" />
            <span>#panel-{panelId}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[8.5px] font-mono text-zinc-300 truncate max-w-[130px]">
              {statusText}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isAligned ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-zinc-600"
              }`}
            />
          </div>
        </div>

        {/* Core Simulation Field */}
        <div className="relative flex-1 w-full rounded-xl bg-black/60 border border-zinc-800/80 p-2 my-1 overflow-hidden flex items-center justify-center">
          {/* Scanlines Effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 2px)",
            }}
          />

          {/* Dotted Target Blueprint Guides */}
          <div className="absolute inset-0 flex flex-row justify-evenly items-center pointer-events-none px-4 opacity-30">
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-cyan-400" />
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-pink-400" />
            <div className="w-10 h-10 rounded-full border-2 border-dashed border-amber-400" />
          </div>

          {/* Actual Dynamic Signal Cores (Alpha, Beta, Gamma) */}
          <div className={`relative w-full h-full flex ${layoutClass} transition-all duration-500`}>
            {/* Core Alpha */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-9 h-9 rounded-full bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.6)]">
                <span className="text-[9px] font-mono font-black text-cyan-200">α</span>
              </div>
              <span className="text-[7.5px] font-mono font-bold text-cyan-300">Alpha</span>
            </div>

            {/* Core Beta */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-9 h-9 rounded-full bg-pink-950/80 border-2 border-pink-400 flex items-center justify-center shadow-[0_0_12px_rgba(236,72,153,0.6)]">
                <span className="text-[9px] font-mono font-black text-pink-200">β</span>
              </div>
              <span className="text-[7.5px] font-mono font-bold text-pink-300">Beta</span>
            </div>

            {/* Core Gamma */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-9 h-9 rounded-full bg-amber-950/80 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.6)]">
                <span className="text-[9px] font-mono font-black text-amber-200">γ</span>
              </div>
              <span className="text-[7.5px] font-mono font-bold text-amber-300">Gamma</span>
            </div>
          </div>
        </div>

        {/* Viewport Bottom Calibration Status */}
        <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 pt-1 shrink-0">
          <span>Signal Calibration</span>
          <span className={isAligned ? "text-emerald-400 font-bold" : "text-amber-400"}>
            {isAligned ? "100% IN PHASE" : "CALIBRATING..."}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Venus Level 2 (Calibrating Flexbox Layout for All Panels)
 */
export function VenusLevel2Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes v2s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes v2s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
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
          <Venus2ToolboxSidebar activeCategory="panels" />

          {/* Blockly Block Stack: venus2_target_panel */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#A855F7] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-300/40">
              <span>Target: #panel-1</span>
            </div>

            {/* venus2_style_display */}
            <div className="h-6 bg-[#06B6D4] text-slate-950 text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Format:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-cyan-200 font-mono">Side-by-Side ▾</span>
            </div>

            {/* venus2_style_justify */}
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Horizontal:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-emerald-200 font-mono">Evenly Spaced ▾</span>
            </div>

            {/* venus2_style_align */}
            <div className="h-6 bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-amber-300/40">
              <span>Vertical:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-amber-200 font-mono">Center ▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Venus Navigation Console Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'v2s1Ready 7s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'v2s1Running 7s ease-in-out infinite' }}>LAYOUT ALIGNED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Venus2LabScreenScene
            panelId={1}
            layoutClass="flex-row justify-evenly items-center"
            statusText="Side-by-Side • Spread Evenly • Center"
            isAligned={true}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Format Block (display: flex vs block)
 */
export function VenusLevel2Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes v2s2Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes v2s2Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes v2s2Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes v2s2Pulse {
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
          <Venus2ToolboxSidebar activeCategory="display" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#A855F7] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-300/40">
              <span>Target: #panel-1</span>
            </div>

            <div
              className="relative h-6 bg-[#06B6D4] text-slate-950 text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-cyan-400/20 z-20"
              style={{ animation: 'v2s2Pulse 6s ease-in-out infinite' }}
            >
              <span>Format:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-cyan-200 font-mono">Side-by-Side ▾</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'v2s2Cursor 6s ease-in-out infinite' }}>
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
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'v2s2Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'v2s2Running 6s ease-in-out infinite' }}>FLEX ROW</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Venus2LabScreenScene
            panelId={1}
            layoutClass="flex-row justify-start items-center gap-2"
            statusText="Side-by-Side"
            isAligned={false}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Horizontal & Vertical Spacing (justify-content & align-items)
 */
export function VenusLevel2Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes v2s3Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes v2s3Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes v2s3Cursor {
          0% { transform: translate(-30px, 40px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(30px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-30px, 40px); opacity: 0; }
        }
        @keyframes v2s3Pulse {
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
          className="flex-1 p-2.5 flex flex-row gap-2 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Venus2ToolboxSidebar activeCategory="justify" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#A855F7] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-300/40">
              <span>Target: #panel-1</span>
            </div>

            <div className="h-6 bg-[#06B6D4] text-slate-950 text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Format:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-cyan-200 font-mono">Side-by-Side ▾</span>
            </div>

            <div
              className="relative h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-emerald-400/20 z-20"
              style={{ animation: 'v2s3Pulse 6s ease-in-out infinite' }}
            >
              <span>Horizontal:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-emerald-200 font-mono">Evenly Spaced ▾</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'v2s3Cursor 6s ease-in-out infinite' }}>
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
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'v2s3Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'v2s3Running 6s ease-in-out infinite' }}>SPACING APPLIED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Venus2LabScreenScene
            panelId={1}
            layoutClass="flex-row justify-evenly items-center"
            statusText="Side-by-Side • Spread Evenly"
            isAligned={true}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Calibrate All 5 Panels to Power Up the Station
 */
export function VenusLevel2Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes v2s4Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes v2s4Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
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
          <Venus2ToolboxSidebar activeCategory="panels" />

          <div className="flex flex-col gap-1 w-[190px] sm:w-[205px] relative z-20">
            <div className="rounded border border-purple-400/40 bg-[#A855F7] p-1 shadow flex items-center justify-between">
              <span className="text-[9px] font-bold text-white">#panel-1</span>
              <Check size={11} className="text-white" />
            </div>
            <div className="rounded border border-purple-400/40 bg-[#A855F7] p-1 shadow flex items-center justify-between">
              <span className="text-[9px] font-bold text-white">#panel-2</span>
              <Check size={11} className="text-white" />
            </div>
            <div className="rounded border border-purple-400/40 bg-[#A855F7] p-1 shadow flex items-center justify-between">
              <span className="text-[9px] font-bold text-white">#panel-3</span>
              <Check size={11} className="text-white" />
            </div>
            <div className="rounded border border-purple-400/40 bg-[#A855F7] p-1 shadow flex items-center justify-between">
              <span className="text-[9px] font-bold text-white">#panel-4</span>
              <Check size={11} className="text-white" />
            </div>
            <div className="rounded border border-purple-400/40 bg-[#A855F7] p-1 shadow flex items-center justify-between">
              <span className="text-[9px] font-bold text-white">#panel-5</span>
              <Check size={11} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: All 5 Panels Aligned */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'v2s4Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] font-bold whitespace-nowrap" style={{ animation: 'v2s4Running 6s ease-in-out infinite' }}>5/5 CALIBRATED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <Venus2LabScreenScene
            panelId={5}
            layoutClass="flex-row justify-evenly items-center"
            statusText="Complete • All 5 Panels Locked"
            isAligned={true}
          />
        </div>
      </div>
    </div>
  );
}
