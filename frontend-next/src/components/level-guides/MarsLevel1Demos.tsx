"use client";

import React from 'react';
import { ShieldAlert } from 'lucide-react';

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

function MarsToolboxSidebar({ activeCategory = "headings" }: { activeCategory?: "headings" | "text" | "structure" }) {
  return (
    <div className="flex flex-col gap-1.5 w-18 shrink-0 py-1.5 select-none font-mono">
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${
          activeCategory === 'headings'
            ? 'text-red-300 bg-red-950/80 border-l-2 border-red-400'
            : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'
        }`}
      >
        Headings
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${
          activeCategory === 'text'
            ? 'text-sky-300 bg-sky-950/80 border-l-2 border-sky-400'
            : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'
        }`}
      >
        Text
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${
          activeCategory === 'structure'
            ? 'text-purple-300 bg-purple-950/80 border-l-2 border-purple-400'
            : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'
        }`}
      >
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
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2.5 bg-[#1a0808] overflow-hidden select-none">
      {/* Martian sky gradient & red dunes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a0e0e] via-[#3a1515] to-[#1a0808] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 -right-10 h-28 bg-[#451818] rounded-t-[100%] opacity-40 blur-xs pointer-events-none" />
      <div className="absolute -bottom-14 -left-20 -right-20 h-24 bg-[#6b2222] rounded-t-[100%] opacity-30 blur-xs pointer-events-none" />

      {/* Industrial Billboard Frame */}
      <div className="relative z-10 w-full max-w-[270px] rounded-xl border-3 border-[#78350f] bg-[#0c0404] p-2.5 shadow-2xl flex flex-col items-center">
        {/* Top solar header bar */}
        <div className="w-full flex items-center justify-between border-b border-[#78350f]/60 pb-1 mb-2">
          <span className="text-[8.5px] font-mono font-bold text-amber-400 tracking-wider">MARS HABITAT DOME 4</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
        </div>

        {/* Billboard Screen */}
        <div className="w-full min-h-[125px] rounded bg-[#180a0a] border border-[#78350f]/40 p-2 flex flex-col items-center justify-center text-center font-sans relative overflow-hidden">
          {children}
        </div>

        {/* Support Steel Pylons */}
        <div className="w-full flex justify-between px-6 -mb-4 mt-1.5 pointer-events-none">
          <div className="w-2.5 h-3 bg-[#78350f] border-x border-[#92400e]" />
          <div className="w-2.5 h-3 bg-[#78350f] border-x border-[#92400e]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1: Step 1 - The Blank Billboard
 * Dynamic Animation:
 * - Left: Large Title (h1) block is dragged from Headings toolbox and snapped into the top of the stack
 * - Right: Billboard starts completely blank/dormant; ONLY renders after the title block snaps in!
 */
export function MarsLevel1Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Large Title Block */
        @keyframes m1s1DragTitle {
          0%, 12% {
            transform: translate(-65px, -15px) scale(0.92);
            opacity: 0.6;
          }
          32%, 85% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, -15px) scale(0.92);
            opacity: 0.6;
          }
        }
        @keyframes m1s1CursorDrag {
          0%, 12% { transform: translate(-65px, -15px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          38%, 85% { transform: translate(25px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-65px, -15px); opacity: 0; }
        }
        @keyframes m1s1SnapPulse {
          0%, 30% { filter: brightness(1); outline: none; }
          32% { filter: brightness(1.4); outline: 2px solid #E44D26; box-shadow: 0 0 16px rgba(228, 77, 38, 0.9); }
          40%, 85% { filter: brightness(1.05); outline: 1px solid rgba(228, 77, 38, 0.5); }
          92%, 100% { filter: brightness(1); outline: none; }
        }

        /* Simulation Reaction (Applies ONLY after block snaps at 32%) */
        @keyframes m1s1ScreenDormant {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m1s1ScreenActive {
          0%, 30% { opacity: 0; transform: scale(0.94); }
          34%, 88% { opacity: 1; transform: scale(1); }
          94%, 100% { opacity: 0; transform: scale(0.94); }
        }
        @keyframes m1s1StatusStandby {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m1s1StatusLive {
          0%, 30% { opacity: 0; }
          34%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2.5 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <MarsToolboxSidebar activeCategory="headings" />

          {/* Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Slot for Large Title: Dragged into place with clean blank trace */}
            <div className="relative mb-1">
              {/* Silhouette trace slot (Blank with traces) */}
              <div className="h-7 w-[195px] rounded-t border border-dashed border-orange-500/40 bg-orange-950/10" />

              {/* Animated Dragged Title Block */}
              <div
                className="absolute inset-0 h-7 w-[195px] bg-[#E44D26] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-orange-400/40 z-30"
                style={{
                  animation: 'm1s1DragTitle 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m1s1SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Main Title:</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-amber-300 font-mono truncate max-w-[105px]">
                  &quot;WELCOME TO MARS&quot;
                </span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm1s1CursorDrag 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Static Pre-existing structure */}
            <div className="h-7 w-[195px] bg-[#F97316] text-white text-[9.5px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Subtitle:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-orange-200 font-mono truncate max-w-[105px]">
                &quot;Dome 4 - Open 24/7&quot;
              </span>
            </div>

            <div className="h-7 w-[195px] bg-[#0284C7] text-white text-[9px] font-bold px-2 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-sky-400/20">
              <span>Paragraph Text:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-sky-200 font-mono truncate max-w-[95px]">
                &quot;Stay hydrated...&quot;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
              style={{ animation: 'm1s1StatusStandby 6.5s ease-in-out infinite' }}
            >
              BLANK BILLBOARD
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.8)] font-black"
              style={{ animation: 'm1s1StatusLive 6.5s ease-in-out infinite' }}
            >
              BILLBOARD LIVE
            </span>
          </div>
        </div>

        <MarsBillboardStage>
          {/* DORMANT STATE (0% - 30%): Screen is blank with subtle grid traces */}
          <div
            className="absolute inset-0 p-2 flex flex-col items-center justify-center pointer-events-none"
            style={{ animation: 'm1s1ScreenDormant 6.5s ease-in-out infinite' }}
          >
            <div className="w-full h-full rounded border border-dashed border-[#78350f]/30 bg-black/40 flex items-center justify-center opacity-40">
              <div
                className="w-full h-full opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(245,158,11,0.4) 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                }}
              />
            </div>
          </div>

          {/* ACTIVE STATE (35% - 88%): Billboard is fully live and styled */}
          <div
            className="flex flex-col items-center gap-1 transition-all"
            style={{ animation: 'm1s1ScreenActive 6.5s ease-in-out infinite' }}
          >
            <h1 className="text-[12.5px] font-black text-amber-300 font-mono tracking-wider drop-shadow-[0_0_8px_#f59e0b]">
              WELCOME TO MARS
            </h1>
            <h3 className="text-[10px] font-bold text-orange-300 tracking-wide">
              Habitat Dome 4 - Open 24/7
            </h3>
            <p className="text-[9px] text-slate-200 max-w-[205px] leading-relaxed">
              Visit our habitat dome and stay hydrated.
            </p>
          </div>
        </MarsBillboardStage>
      </div>
    </div>
  );
}

/**
 * Slide 2: Step 2 - Add Headings & Text
 * Dynamic Animation:
 * - Left: Paragraph Text (p) block is dragged from Text toolbox into the stack
 * - Right: Simulation starts missing body description; description text renders ONLY after snap!
 */
export function MarsLevel1Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Paragraph Block */
        @keyframes m1s2DragText {
          0%, 12% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0.6;
          }
          32%, 85% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0.6;
          }
        }
        @keyframes m1s2CursorDrag {
          0%, 12% { transform: translate(-65px, 25px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          38%, 85% { transform: translate(25px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-65px, 25px); opacity: 0; }
        }
        @keyframes m1s2SnapPulse {
          0%, 30% { filter: brightness(1); outline: none; }
          32% { filter: brightness(1.4); outline: 2px solid #0284c7; box-shadow: 0 0 16px rgba(2, 132, 199, 0.9); }
          40%, 85% { filter: brightness(1.05); outline: 1px solid rgba(2, 132, 199, 0.5); }
          92%, 100% { filter: brightness(1); outline: none; }
        }

        /* Simulation Text Pop-in after snap */
        @keyframes m1s2TextMissing {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m1s2TextRendered {
          0%, 30% { opacity: 0; transform: translateY(6px); }
          34%, 88% { opacity: 1; transform: translateY(0); }
          94%, 100% { opacity: 0; transform: translateY(6px); }
        }
        @keyframes m1s2StatusIncomplete {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m1s2StatusComplete {
          0%, 30% { opacity: 0; }
          34%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2.5 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <MarsToolboxSidebar activeCategory="text" />

          {/* Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* html_h1 Main Title */}
            <div className="h-7 w-[195px] bg-[#E44D26] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-orange-400/40">
              <span>Main Title:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-yellow-300 font-mono truncate max-w-[105px]">
                &quot;OLYMPUS PIZZA&quot;
              </span>
            </div>

            {/* html_h3 Subtitle */}
            <div className="h-7 w-[195px] bg-[#F97316] text-white text-[9.5px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Subtitle:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-orange-200 font-mono truncate max-w-[105px]">
                &quot;Hot slices fresh!&quot;
              </span>
            </div>

            {/* Dragged Paragraph Text Block with blank trace slot */}
            <div className="relative w-[195px] mt-0.5">
              {/* Silhouette trace slot (Blank with traces) */}
              <div className="h-7 rounded-b border border-dashed border-sky-500/40 bg-sky-950/10" />

              {/* Animated Dragged Paragraph Block */}
              <div
                className="absolute inset-0 h-7 bg-[#0284C7] text-white text-[9px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-sky-400/30 z-30"
                style={{
                  animation: 'm1s2DragText 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m1s2SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Paragraph Text:</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-sky-200 font-mono truncate max-w-[95px]">
                  &quot;Fresh crust...&quot;
                </span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm1s2CursorDrag 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
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
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
              style={{ animation: 'm1s2StatusIncomplete 6.5s ease-in-out infinite' }}
            >
              TITLE ONLY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.8)] font-black"
              style={{ animation: 'm1s2StatusComplete 6.5s ease-in-out infinite' }}
            >
              MESSAGE COMPLETE
            </span>
          </div>
        </div>

        <MarsBillboardStage>
          <div className="flex flex-col items-center gap-1 w-full">
            <h1 className="text-[12.5px] font-black text-yellow-400 font-mono tracking-wider drop-shadow-[0_0_8px_#facc15]">
              OLYMPUS PIZZA
            </h1>
            <div className="text-[10px] font-bold text-orange-300">
              Hot slices fresh from the oven!
            </div>

            {/* BEFORE SNAP: Blank trace placeholder */}
            <div
              className="relative w-full max-w-[190px] h-5 rounded border border-dashed border-sky-500/30 bg-sky-950/10"
              style={{ animation: 'm1s2TextMissing 6.5s ease-in-out infinite' }}
            />

            {/* AFTER SNAP: Description renders dynamically */}
            <div
              className="w-full max-w-[200px] text-[9px] text-slate-200 leading-snug transition-all"
              style={{ animation: 'm1s2TextRendered 6.5s ease-in-out infinite' }}
            >
              Fresh Martian crust baked with asteroid spice, delivered fast to Dome 4!
            </div>
          </div>
        </MarsBillboardStage>
      </div>
    </div>
  );
}

/**
 * Slide 3: Step 3 - Group with Div Containers
 * Dynamic Animation:
 * - Left: Container Box (html_div) block is dragged from Structure toolbox to group the elements
 * - Right: Simulation starts ungrouped; ONLY receives glowing container border after block snaps!
 */
export function MarsLevel1Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Container Box Block */
        @keyframes m1s3DragDiv {
          0%, 12% {
            transform: translate(-65px, -15px) scale(0.92);
            opacity: 0.6;
          }
          32%, 85% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, -15px) scale(0.92);
            opacity: 0.6;
          }
        }
        @keyframes m1s3CursorDrag {
          0%, 12% { transform: translate(-65px, -15px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          38%, 85% { transform: translate(25px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-65px, -15px); opacity: 0; }
        }
        @keyframes m1s3SnapPulse {
          0%, 30% { filter: brightness(1); outline: none; }
          32% { filter: brightness(1.4); outline: 2px solid #8B5CF6; box-shadow: 0 0 16px rgba(139, 92, 246, 0.9); }
          40%, 85% { filter: brightness(1.05); outline: 1px solid rgba(139, 92, 246, 0.5); }
          92%, 100% { filter: brightness(1); outline: none; }
        }

        /* Simulation Div Frame Reveal */
        @keyframes m1s3UngroupedView {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m1s3GroupedFrame {
          0%, 30% { opacity: 0; transform: scale(0.94); }
          34%, 88% { opacity: 1; transform: scale(1); }
          94%, 100% { opacity: 0; transform: scale(0.94); }
        }
        @keyframes m1s3StatusUngrouped {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m1s3StatusGrouped {
          0%, 30% { opacity: 0; }
          34%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2.5 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <MarsToolboxSidebar activeCategory="structure" />

          {/* Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Dragged Container Box Header with blank trace slot */}
            <div className="relative w-[195px]">
              {/* Silhouette trace slot (Blank with traces) */}
              <div className="h-7 rounded-t border border-dashed border-purple-500/40 bg-purple-950/10" />

              {/* Animated Dragged Div Block */}
              <div
                className="absolute inset-0 h-7 bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40 z-30"
                style={{
                  animation: 'm1s3DragDiv 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m1s3SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Container Box</span>
                <span className="bg-black/40 text-[8px] px-1 py-0.5 rounded text-purple-200 font-mono">&lt;div&gt;</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm1s3CursorDrag 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Nested Elements inside div */}
            <div className="h-6.5 w-[187px] bg-[#E44D26] text-white text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Main Title:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-amber-300 font-mono truncate max-w-[95px]">
                &quot;DUST STORM&quot;
              </span>
            </div>

            <div className="h-6.5 w-[187px] bg-[#0284C7] text-white text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Paragraph:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-sky-200 font-mono truncate max-w-[95px]">
                &quot;High winds...&quot;
              </span>
            </div>

            {/* Container Box Bottom */}
            <div className="h-5 w-[195px] bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 rounded-b flex items-center border-t border-black/20 shadow border-b border-x border-purple-400/20">
              <span>End Box</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
              style={{ animation: 'm1s3StatusUngrouped 6.5s ease-in-out infinite' }}
            >
              UNGROUPED
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.8)] font-black"
              style={{ animation: 'm1s3StatusGrouped 6.5s ease-in-out infinite' }}
            >
              DIV CONTAINER BOX
            </span>
          </div>
        </div>

        <MarsBillboardStage>
          {/* BEFORE SNAP: Ungrouped / loose elements (0% - 30%) */}
          <div
            className="absolute inset-0 p-2 flex flex-col items-center justify-center gap-1.5"
            style={{ animation: 'm1s3UngroupedView 6.5s ease-in-out infinite' }}
          >
            <h1 className="text-[12.5px] font-black text-red-400 font-mono tracking-wider">
              DUST STORM ALERT
            </h1>
            <p className="text-[9px] text-orange-200">
              High winds approaching Sector 7
            </p>
          </div>

          {/* AFTER SNAP: Framed in Glowing Div Container (35% - 88%) */}
          <div
            className="w-full p-2 rounded-lg border-2 border-amber-500/80 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.35)] flex flex-col items-center gap-1 transition-all"
            style={{ animation: 'm1s3GroupedFrame 6.5s ease-in-out infinite' }}
          >
            <div className="flex items-center gap-1 text-[8px] font-mono text-amber-400 font-bold uppercase tracking-wider">
              <ShieldAlert size={10} className="text-amber-400" />
              <span>COLONY ALERT CONTAINER</span>
            </div>

            <h1 className="text-[12.5px] font-black text-red-400 font-mono tracking-wider drop-shadow-[0_0_8px_#ef4444]">
              DUST STORM ALERT
            </h1>
            <p className="text-[9px] text-orange-200 font-medium text-center">
              High winds approaching Sector 7 - Seek shelter in Habitat Dome 4
            </p>
          </div>
        </MarsBillboardStage>
      </div>
    </div>
  );
}
