"use client";

import React from 'react';
import { Image as ImageIcon, Sparkles, Check } from 'lucide-react';

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

function Mars2ToolboxSidebar({ activeCategory = "billboards" }: { activeCategory?: "billboards" | "images" | "captions" }) {
  return (
    <div className="flex flex-col gap-1.5 w-20 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "billboards"
          ? "text-red-300 bg-red-950/80 border-red-400"
          : "text-red-400/60 bg-red-950/30 border-red-500/30"
      }`}>
        Billboards
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "images"
          ? "text-amber-300 bg-amber-950/80 border-amber-400"
          : "text-amber-400/60 bg-amber-950/30 border-amber-500/30"
      }`}>
        Images
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "captions"
          ? "text-emerald-300 bg-emerald-950/80 border-emerald-400"
          : "text-emerald-400/60 bg-emerald-950/30 border-emerald-500/30"
      }`}>
        Captions
      </div>
    </div>
  );
}

/**
 * Authentic Martian Canyon & Stilted Billboard Stage replicating MarsImageBillboards.tsx
 */
function MarsCanyonBillboardScene({
  imageName = "dog.png",
  captionText = "I wag my tail and love to bark.",
  isVerified = false,
  highlightBillboard = false,
}: {
  imageName?: string;
  captionText?: string;
  isVerified?: boolean;
  highlightBillboard?: boolean;
}) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden bg-[#070314] select-none">
      {/* 1. Deep Space Cosmic Sky & Nebula */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030108] via-[#0b051e] to-[#200722] pointer-events-none" />
      <div className="absolute top-2 left-1/4 w-48 h-24 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-4 right-1/4 w-40 h-20 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Scattered Starfield */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" xmlns="http://www.w3.org/2000/svg">
        {[
          [20, 15], [45, 25], [75, 12], [88, 30], [12, 45], [60, 50], [80, 65], [30, 70], [92, 18], [15, 80]
        ].map(([x, y], i) => (
          <circle key={i} cx={`${x}%`} cy={`${y}%`} r={i % 3 === 0 ? 1.5 : 1} fill="#ffffff" opacity={0.7} />
        ))}
      </svg>

      {/* 2. Layered Canyon Rim & Distant Mesas */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 300" preserveAspectRatio="none">
        {/* Distant Canyon Silhouette */}
        <path
          d="M0,300 L0,150 L50,150 L65,110 L150,110 L165,150 L220,150 L235,90 L340,90 L355,150 L420,150 L435,100 L480,100 L500,150 L500,300 Z"
          fill="#1c072b"
          opacity="0.85"
        />
        {/* Mesa Strata Lines */}
        <line x1="65" y1="125" x2="150" y2="125" stroke="#3d145a" strokeWidth="2" opacity="0.7" />
        <line x1="235" y1="110" x2="340" y2="110" stroke="#3d145a" strokeWidth="2" opacity="0.7" />

        {/* Foreground Red Dunes */}
        <path
          d="M0,300 Q120,210 250,250 T500,230 L500,300 Z"
          fill="url(#marsSandGrad)"
        />
        <defs>
          <linearGradient id="marsSandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#831843" />
            <stop offset="40%" stopColor="#4c0519" />
            <stop offset="100%" stopColor="#1f0208" />
          </linearGradient>
        </defs>
      </svg>

      {/* 3. The Billboard on Stilts (Centerpiece) */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-end pb-3">
        {/* Billboard Display Screen */}
        <div
          className={`relative w-[210px] sm:w-[230px] rounded-xl border-3 p-2 bg-[#0c0408] flex flex-col items-center transition-all duration-300 shadow-2xl ${
            isVerified
              ? 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
              : highlightBillboard
              ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
              : 'border-[#78350f] shadow-lg'
          }`}
        >
          {/* Top Metal Bar with Floodlights */}
          <div className="w-full flex items-center justify-between border-b border-amber-900/60 pb-1 mb-1.5 px-1">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[8px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                BILLBOARD // MARS
              </span>
            </div>
            <span
              className={`text-[7.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                isVerified
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
                  : 'bg-black/50 border-amber-700/60 text-amber-400'
              }`}
            >
              {isVerified ? 'VERIFIED' : 'ACTIVE'}
            </span>
          </div>

          {/* Central Image Frame */}
          <div className="w-full h-20 rounded-lg bg-black/60 border border-white/10 flex flex-col items-center justify-center p-1 relative overflow-hidden group">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mb-0.5">
              <ImageIcon size={22} className="text-amber-300" />
            </div>
            <span className="text-[9px] font-mono font-bold text-white bg-black/70 px-2 py-0.5 rounded border border-white/10">
              {imageName}
            </span>
          </div>

          {/* Bottom Wooden Caption Plate */}
          <div className="w-full mt-1.5 px-2 py-1 rounded bg-[#2a1205] border border-amber-800/80 text-center shadow-inner">
            <p className="text-[9px] font-sans font-semibold text-amber-100 leading-tight">
              &quot;{captionText}&quot;
            </p>
          </div>
        </div>

        {/* Billboard Wooden/Alloy Support Stilts with Cross-Bracing */}
        <div className="relative w-[170px] h-10 flex justify-between pointer-events-none">
          {/* Left Stilt */}
          <div className="w-2.5 h-full bg-[#57270b] border-x border-[#78350f] shadow-md" />
          {/* Right Stilt */}
          <div className="w-2.5 h-full bg-[#57270b] border-x border-[#78350f] shadow-md" />
          {/* Diagonal Cross Struts */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 170 40">
            <line x1="10" y1="0" x2="160" y2="40" stroke="#78350f" strokeWidth="2.5" />
            <line x1="160" y1="0" x2="10" y2="40" stroke="#78350f" strokeWidth="2.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Mars Level 2 (Matching Billboard Images & Captions)
 */
export function MarsLevel2Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m2s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m2s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
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
          <Mars2ToolboxSidebar activeCategory="billboards" />

          {/* Blockly Block Stack: html_billboard */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-red-300/40">
              <span>Billboard #1</span>
            </div>

            {/* html_img */}
            <div className="h-7 bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Image src =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-amber-300 font-mono">&quot;dog.png&quot; ▾</span>
            </div>

            {/* html_caption */}
            <div className="h-7 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-emerald-400/20">
              <span>Caption:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-white font-sans truncate max-w-[105px]">I wag my tail...</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Martian Billboard Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm2s1Ready 7s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'm2s1Running 7s ease-in-out infinite' }}>BILLBOARD #1</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MarsCanyonBillboardScene
            imageName="dog.png"
            captionText="I wag my tail and love to bark."
            isVerified={true}
            highlightBillboard={true}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Selecting Image Sources with Dropdown
 */
export function MarsLevel2Step2Demo() {
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
          <Mars2ToolboxSidebar activeCategory="images" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-red-300/40">
              <span>Billboard #1</span>
            </div>

            <div
              className="relative h-7 bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-amber-300/40 z-20"
              style={{ animation: 'm2s2Pulse 6s ease-in-out infinite' }}
            >
              <span>Image src =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-amber-300 font-mono">&quot;dog.png&quot; ▾</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm2s2Cursor 6s ease-in-out infinite' }}>
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
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm2s2Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'm2s2Running 6s ease-in-out infinite' }}>SOURCE SELECTED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MarsCanyonBillboardScene
            imageName="dog.png"
            captionText="I wag my tail and love to bark."
            isVerified={false}
            highlightBillboard={true}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Snapping Caption Blocks to the Billboard Frame
 */
export function MarsLevel2Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m2s3Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m2s3Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m2s3Cursor {
          0% { transform: translate(-30px, 40px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(30px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-30px, 40px); opacity: 0; }
        }
        @keyframes m2s3Pulse {
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
          <Mars2ToolboxSidebar activeCategory="captions" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            <div className="h-7 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-red-300/40">
              <span>Billboard #1</span>
            </div>

            <div className="h-7 bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Image src =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-amber-300 font-mono">&quot;dog.png&quot; ▾</span>
            </div>

            <div
              className="relative h-7 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-emerald-400/20 z-20"
              style={{ animation: 'm2s3Pulse 6s ease-in-out infinite' }}
            >
              <span>Caption:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-white font-sans truncate max-w-[105px]">I wag my tail...</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm2s3Cursor 6s ease-in-out infinite' }}>
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
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm2s3Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)] animate-pulse whitespace-nowrap" style={{ animation: 'm2s3Running 6s ease-in-out infinite' }}>CAPTION LOCKED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MarsCanyonBillboardScene
            imageName="dog.png"
            captionText="I wag my tail and love to bark."
            isVerified={true}
            highlightBillboard={false}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Populate All 3 Billboards to Complete Mission
 */
export function MarsLevel2Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m2s4Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m2s4Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
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
          <Mars2ToolboxSidebar activeCategory="billboards" />

          <div className="flex flex-col gap-1.5 w-[190px] sm:w-[205px] relative z-20">
            <div className="rounded border border-red-400/40 bg-[#EF4444] p-1 shadow flex items-center justify-between">
              <span className="text-[9px] font-bold text-white">Billboard #1</span>
              <Check size={11} className="text-white" />
            </div>
            <div className="rounded border border-red-400/40 bg-[#EF4444] p-1 shadow flex items-center justify-between">
              <span className="text-[9px] font-bold text-white">Billboard #2</span>
              <Check size={11} className="text-white" />
            </div>
            <div className="rounded border border-red-400/40 bg-[#EF4444] p-1 shadow flex items-center justify-between">
              <span className="text-[9px] font-bold text-white">Billboard #3</span>
              <Check size={11} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: All Billboards Verified */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm2s4Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] font-bold whitespace-nowrap" style={{ animation: 'm2s4Running 6s ease-in-out infinite' }}>ALL 3 VERIFIED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MarsCanyonBillboardScene
            imageName="cat.png"
            captionText="Purring quietly on the colony perch."
            isVerified={true}
          />
        </div>
      </div>
    </div>
  );
}
