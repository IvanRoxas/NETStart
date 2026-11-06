"use client";

import React from 'react';
import { ZoomIn, Check } from 'lucide-react';

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

function Mars2ToolboxSidebar({ activeCategory = "billboards" }: { activeCategory?: "billboards" | "images" | "captions" }) {
  return (
    <div className="flex flex-col gap-1.5 w-18 shrink-0 py-1.5 select-none font-mono">
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
          activeCategory === "billboards"
            ? "text-purple-300 bg-purple-950/80 border-purple-400"
            : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
        }`}
      >
        Boards
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
          activeCategory === "images"
            ? "text-sky-300 bg-sky-950/80 border-sky-400"
            : "text-sky-400/60 bg-sky-950/30 border-sky-500/30"
        }`}
      >
        Images
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
          activeCategory === "captions"
            ? "text-emerald-300 bg-emerald-950/80 border-emerald-400"
            : "text-emerald-400/60 bg-emerald-950/30 border-emerald-500/30"
        }`}
      >
        Captions
      </div>
    </div>
  );
}

/**
 * Authentic Martian Canyon & Stilted Billboard Stage replicating MarsImageBillboards.tsx
 */
function MarsCanyonBillboardStage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden bg-[#070314] select-none p-2">
      {/* 1. Deep Space Cosmic Sky & Nebula */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030108] via-[#0b051e] to-[#200722] pointer-events-none" />
      <div className="absolute top-2 left-1/4 w-44 h-20 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-4 right-1/4 w-36 h-18 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Scattered Starfield */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" xmlns="http://www.w3.org/2000/svg">
        {[
          [20, 15], [45, 25], [75, 12], [88, 30], [12, 45], [60, 50], [80, 65], [30, 70], [92, 18], [15, 80]
        ].map(([x, y], i) => (
          <circle key={i} cx={`${x}%`} cy={`${y}%`} r={i % 3 === 0 ? 1.5 : 1} fill="#ffffff" opacity={0.7} />
        ))}
      </svg>

      {/* 2. Layered Canyon Rim */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 300" preserveAspectRatio="none">
        <path
          d="M0,300 L0,160 L50,160 L65,120 L150,120 L165,160 L220,160 L235,100 L340,100 L355,160 L420,160 L435,110 L480,110 L500,160 L500,300 Z"
          fill="#1c072b"
          opacity="0.85"
        />
        <path
          d="M0,300 Q120,220 250,260 T500,240 L500,300 Z"
          fill="url(#m2CanyonSandGrad)"
        />
        <defs>
          <linearGradient id="m2CanyonSandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#831843" />
            <stop offset="40%" stopColor="#4c0519" />
            <stop offset="100%" stopColor="#1f0208" />
          </linearGradient>
        </defs>
      </svg>

      {/* 3. The Billboard Structure */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-end pb-1">
        {children}

        {/* Billboard Wooden/Alloy Support Stilts with Cross-Bracing */}
        <div className="relative w-[160px] h-8 flex justify-between pointer-events-none mt-1">
          <div className="w-2.5 h-full bg-[#57270b] border-x border-[#78350f] shadow-md" />
          <div className="w-2.5 h-full bg-[#57270b] border-x border-[#78350f] shadow-md" />
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 160 32">
            <line x1="10" y1="0" x2="150" y2="32" stroke="#78350f" strokeWidth="2" />
            <line x1="150" y1="0" x2="10" y2="32" stroke="#78350f" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1: Step 1 - Picture Perfect
 * Dynamic Animation:
 * - Simulation:
 *    1. Starts empty ("No image yet. Click to view hint").
 *    2. Cursor clicks on billboard screen -> reveals hint: "I wag my tail and love to bark."
 * - Workspace:
 *    3. With the clue known, cursor drags Image src = "dog.png" and snaps it into Billboard 1 Container!
 * - Simulation:
 *    4. The real dog image displays on the billboard with verified emerald frame and checkmark!
 */
export function MarsLevel2Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Phase 1: Simulation Click Cursor (0% - 28%) */
        @keyframes m2s1SimClickCursor {
          0%, 6% { transform: translate(140px, 120px); opacity: 0; }
          12%, 18% { transform: translate(85px, 45px); opacity: 1; }
          20%, 24% { transform: translate(85px, 45px) scale(0.85); opacity: 1; }
          28%, 100% { transform: translate(100px, 70px); opacity: 0; }
        }

        /* Screen state 1: Empty / Click to view hint (0% - 24%) */
        @keyframes m2s1EmptyScreen {
          0%, 22% { opacity: 1; transform: scale(1); }
          25%, 100% { opacity: 0; transform: scale(0.95); pointer-events: none; }
        }

        /* Screen state 2: Hint revealed after click (25% - 58%) */
        @keyframes m2s1HintScreen {
          0%, 24% { opacity: 0; transform: scale(0.95); }
          27%, 56% { opacity: 1; transform: scale(1); }
          59%, 100% { opacity: 0; transform: scale(0.95); pointer-events: none; }
        }

        /* Screen state 3: Dog image displays after block snap (60% - 92%) */
        @keyframes m2s1DogImageScreen {
          0%, 58% { opacity: 0; transform: scale(0.95); }
          62%, 92% { opacity: 1; transform: scale(1); }
          96%, 100% { opacity: 0; transform: scale(0.95); }
        }

        /* Phase 2: Workspace Drag Image Block (50% - 62%) */
        @keyframes m2s1DragDogBlock {
          0%, 48% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0;
          }
          52% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0.8;
          }
          62%, 92% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          96%, 100% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0;
          }
        }
        @keyframes m2s1WsCursorDrag {
          0%, 48% { transform: translate(-65px, 25px); opacity: 0; }
          52% { transform: translate(-65px, 25px); opacity: 1; }
          62% { transform: translate(0px, 0px); opacity: 1; }
          66%, 92% { transform: translate(25px, 20px); opacity: 0; }
          96%, 100% { transform: translate(-65px, 25px); opacity: 0; }
        }
        @keyframes m2s1SnapPulse {
          0%, 60% { filter: brightness(1); outline: none; }
          62% { filter: brightness(1.4); outline: 2px solid #0ea5e9; box-shadow: 0 0 16px rgba(14, 165, 233, 0.9); }
          70%, 92% { filter: brightness(1.05); outline: 1px solid rgba(14, 165, 233, 0.5); }
          96%, 100% { filter: brightness(1); outline: none; }
        }

        /* Billboard border verified glow */
        @keyframes m2s1BoardBorder {
          0%, 58% { border-color: rgba(245, 158, 11, 0.4); box-shadow: none; }
          62%, 92% { border-color: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
          96%, 100% { border-color: rgba(245, 158, 11, 0.4); box-shadow: none; }
        }

        /* Header status: HINT DISCOVERY -> DOG VERIFIED */
        @keyframes m2s1StatusHint {
          0%, 58% { opacity: 1; }
          62%, 92% { opacity: 0; }
          96%, 100% { opacity: 1; }
        }
        @keyframes m2s1StatusVerified {
          0%, 58% { opacity: 0; }
          62%, 92% { opacity: 1; }
          96%, 100% { opacity: 0; }
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
          <Mars2ToolboxSidebar activeCategory="images" />

          {/* Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Billboard 1 Container */}
            <div className="h-7 w-[195px] bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Billboard 1 Container</span>
            </div>

            {/* Dragged Image Block into blank trace slot */}
            <div className="relative ml-2 w-[187px] mt-0.5">
              <div className="h-7 rounded border border-dashed border-sky-500/40 bg-sky-950/10" />

              {/* Animated Dragged Dog Block */}
              <div
                className="absolute inset-0 h-7 bg-[#0ea5e9] text-white text-[9px] font-bold px-2 rounded flex items-center justify-between shadow border-t border-x border-sky-400/30 z-30"
                style={{
                  animation: 'm2s1DragDogBlock 7.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m2s1SnapPulse 7.5s ease-in-out infinite',
                }}
              >
                <span>Image src =</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-amber-300 font-mono">
                  &quot;dog.png&quot; ▾
                </span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm2s1WsCursorDrag 7.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Static Caption Block */}
            <div className="h-7 w-[187px] bg-[#10B981] text-white text-[9px] font-bold px-2 ml-2 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-emerald-400/20 mt-0.5">
              <span>Caption:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[7.5px] text-white font-sans truncate max-w-[105px]">
                I wag my tail...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Martian Billboard Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
              style={{ animation: 'm2s1StatusHint 7.5s ease-in-out infinite' }}
            >
              CLICK TO VIEW HINT
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black"
              style={{ animation: 'm2s1StatusVerified 7.5s ease-in-out infinite' }}
            >
              DOG MATCHED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MarsCanyonBillboardStage>
            {/* Billboard Display Screen */}
            <div
              className="relative w-[215px] sm:w-[230px] rounded-xl border-3 p-2 bg-[#0c0408] flex flex-col items-center transition-all shadow-xl"
              style={{ animation: 'm2s1BoardBorder 7.5s ease-in-out infinite' }}
            >
              {/* Top Metal Bar */}
              <div className="w-full flex items-center justify-between border-b border-amber-900/60 pb-1 mb-1.5 px-1">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" />
                  <span className="text-[8px] font-mono font-bold text-purple-200 uppercase tracking-wider">
                    BILLBOARD 1
                  </span>
                </div>
                <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-black/50 border border-purple-700/60 text-purple-300">
                  MARS HABITAT
                </span>
              </div>

              {/* Central Screen Area (Switches across 3 phases) */}
              <div className="w-full h-22 rounded-lg bg-[#07090e] border border-slate-700/80 relative overflow-hidden flex items-center justify-center">
                {/* 1. Empty Screen: Click to view hint */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-2"
                  style={{ animation: 'm2s1EmptyScreen 7.5s ease-in-out infinite' }}
                >
                  <span className="font-mono text-[11px] text-slate-300 font-bold">
                    No image yet.
                  </span>
                  <span className="text-[8px] font-sans text-amber-300/90 mt-1 flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                    <ZoomIn size={9} />
                    <span>Click to View Hint</span>
                  </span>
                </div>

                {/* 2. Hint Clue Screen (Revealed when clicked) */}
                <div
                  className="absolute inset-0 bg-[#0a0c12] border border-amber-400/60 rounded-lg flex flex-col items-center justify-center text-center p-2.5 z-10"
                  style={{ animation: 'm2s1HintScreen 7.5s ease-in-out infinite' }}
                >
                  <span className="font-mono text-[9px] font-black uppercase text-amber-400 tracking-wider">
                    Hint:
                  </span>
                  <span className="text-[10px] font-sans text-slate-100 font-semibold leading-tight px-1 mt-0.5">
                    &ldquo;I wag my tail and love to bark.&rdquo;
                  </span>
                </div>

                {/* 3. The Real Dog Image (Revealed when dog.png snaps in!) */}
                <div
                  className="absolute inset-0 w-full h-full z-20"
                  style={{ animation: 'm2s1DogImageScreen 7.5s ease-in-out infinite' }}
                >
                  <img
                    src="/assets/planets/01_mars/level_2/solutions/dog.png"
                    alt="Dog Billboard"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_10px_#10b981]">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>

                {/* Simulation Click Hand/Cursor */}
                <div
                  className="absolute pointer-events-none z-50"
                  style={{ animation: 'm2s1SimClickCursor 7.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>

              {/* Bottom Caption Plate */}
              <div className="w-full mt-1.5 px-2 py-1 rounded bg-[#2a1205] border border-amber-800/80 text-center shadow-inner">
                <p className="text-[8.5px] font-sans font-semibold text-amber-100 leading-tight">
                  &quot;I wag my tail and love to bark.&quot;
                </p>
              </div>
            </div>
          </MarsCanyonBillboardStage>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Step 2 - Add Billboard Containers
 * Dynamic Animation:
 * - Left: Billboard 1 Container block is dragged from toolbox and snapped into workspace
 * - Right: Stilted billboard frame rises up onto the Martian canyon upon snap!
 */
export function MarsLevel2Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Container Block */
        @keyframes m2s2DragContainer {
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
        @keyframes m2s2CursorDrag {
          0%, 12% { transform: translate(-65px, -15px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          38%, 85% { transform: translate(25px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-65px, -15px); opacity: 0; }
        }
        @keyframes m2s2SnapPulse {
          0%, 30% { filter: brightness(1); outline: none; }
          32% { filter: brightness(1.4); outline: 2px solid #8B5CF6; box-shadow: 0 0 16px rgba(139, 92, 246, 0.9); }
          40%, 85% { filter: brightness(1.05); outline: 1px solid rgba(139, 92, 246, 0.5); }
          92%, 100% { filter: brightness(1); outline: none; }
        }

        /* Simulation Stilted Frame Reveal */
        @keyframes m2s2EmptyCanyon {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m2s2FrameRises {
          0%, 30% { opacity: 0; transform: translateY(16px); }
          34%, 88% { opacity: 1; transform: translateY(0); }
          94%, 100% { opacity: 0; transform: translateY(16px); }
        }
        @keyframes m2s2StatusAwaiting {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m2s2StatusMounted {
          0%, 30% { opacity: 0; }
          34%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* LEFT PANE */}
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
          <Mars2ToolboxSidebar activeCategory="billboards" />

          {/* Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Blank trace slot for Container */}
            <div className="relative w-[195px]">
              <div className="h-7 rounded-t border border-dashed border-purple-500/40 bg-purple-950/10" />

              {/* Dragged Billboard 1 Container Block */}
              <div
                className="absolute inset-0 h-7 bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40 z-30"
                style={{
                  animation: 'm2s2DragContainer 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m2s2SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Billboard 1 Container</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm2s2CursorDrag 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Inner slot */}
            <div className="h-10 w-[187px] border border-dashed border-purple-500/30 bg-purple-950/5 ml-2 rounded-b" />
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
              style={{ animation: 'm2s2StatusAwaiting 6.5s ease-in-out infinite' }}
            >
              AWAITING CONTAINER
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.8)] font-black"
              style={{ animation: 'm2s2StatusMounted 6.5s ease-in-out infinite' }}
            >
              FRAME MOUNTED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MarsCanyonBillboardStage>
            {/* Mounted Billboard Frame (Rises upon snap) */}
            <div
              className="relative w-[215px] sm:w-[230px] rounded-xl border-3 border-purple-500/60 p-2 bg-[#0c0408] flex flex-col items-center transition-all shadow-xl"
              style={{ animation: 'm2s2FrameRises 6.5s ease-in-out infinite' }}
            >
              <div className="w-full flex items-center justify-between border-b border-purple-900/60 pb-1 mb-1.5 px-1">
                <span className="text-[8px] font-mono font-bold text-purple-200 uppercase tracking-wider">
                  BILLBOARD 1
                </span>
                <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-700/60 text-purple-300">
                  READY
                </span>
              </div>

              {/* Blank Screen awaiting image */}
              <div className="w-full h-22 rounded-lg bg-[#07090e] border border-dashed border-purple-500/30 flex items-center justify-center text-slate-400 font-mono text-[9px]">
                Screen Ready for Image
              </div>
            </div>
          </MarsCanyonBillboardStage>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Step 3 - Choose Habitat Images
 * Dynamic Animation:
 * - Left: Image src = "dog.png" block is dragged from Images category and snapped into the container
 * - Right: Dog image appears live on the billboard screen!
 */
export function MarsLevel2Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Image Block */
        @keyframes m2s3DragImg {
          0%, 12% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0.6;
          }
          32%, 85% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0.6;
          }
        }
        @keyframes m2s3CursorDrag {
          0%, 12% { transform: translate(-65px, 20px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          38%, 85% { transform: translate(25px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-65px, 20px); opacity: 0; }
        }
        @keyframes m2s3SnapPulse {
          0%, 30% { filter: brightness(1); outline: none; }
          32% { filter: brightness(1.4); outline: 2px solid #0ea5e9; box-shadow: 0 0 16px rgba(14, 165, 233, 0.9); }
          40%, 85% { filter: brightness(1.05); outline: 1px solid rgba(14, 165, 233, 0.5); }
          92%, 100% { filter: brightness(1); outline: none; }
        }

        /* Simulation Image Reveal */
        @keyframes m2s3ScreenBlank {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m2s3DogLive {
          0%, 30% { opacity: 0; transform: scale(0.94); }
          34%, 88% { opacity: 1; transform: scale(1); }
          94%, 100% { opacity: 0; transform: scale(0.94); }
        }
        @keyframes m2s3StatusEmpty {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m2s3StatusLoaded {
          0%, 30% { opacity: 0; }
          34%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* LEFT PANE */}
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
          <Mars2ToolboxSidebar activeCategory="images" />

          {/* Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            <div className="h-7 w-[195px] bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Billboard 1 Container</span>
            </div>

            {/* Dragged Image Block into blank trace slot */}
            <div className="relative ml-2 w-[187px] mt-0.5">
              <div className="h-7 rounded-b border border-dashed border-sky-500/40 bg-sky-950/10" />

              {/* Animated Dragged Dog Block */}
              <div
                className="absolute inset-0 h-7 bg-[#0ea5e9] text-white text-[9px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-sky-400/30 z-30"
                style={{
                  animation: 'm2s3DragImg 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m2s3SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Image src =</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-amber-300 font-mono">
                  &quot;dog.png&quot; ▾
                </span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm2s3CursorDrag 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
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
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
              style={{ animation: 'm2s3StatusEmpty 6.5s ease-in-out infinite' }}
            >
              EMPTY SCREEN
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.8)] font-black"
              style={{ animation: 'm2s3StatusLoaded 6.5s ease-in-out infinite' }}
            >
              IMAGE LOADED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MarsCanyonBillboardStage>
            <div className="relative w-[215px] sm:w-[230px] rounded-xl border-3 border-sky-500/60 p-2 bg-[#0c0408] flex flex-col items-center transition-all shadow-xl">
              <div className="w-full flex items-center justify-between border-b border-sky-900/60 pb-1 mb-1.5 px-1">
                <span className="text-[8px] font-mono font-bold text-sky-200 uppercase tracking-wider">
                  BILLBOARD 1
                </span>
                <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-950/80 border border-sky-700/60 text-sky-300">
                  dog.png
                </span>
              </div>

              {/* Central Screen Area */}
              <div className="w-full h-22 rounded-lg bg-[#07090e] border border-slate-700/80 relative overflow-hidden flex items-center justify-center">
                {/* BEFORE SNAP: Blank */}
                <div
                  className="absolute inset-0 flex items-center justify-center text-slate-400 font-mono text-[9px]"
                  style={{ animation: 'm2s3ScreenBlank 6.5s ease-in-out infinite' }}
                >
                  No image yet.
                </div>

                {/* AFTER SNAP: The Dog Image displays! */}
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{ animation: 'm2s3DogLive 6.5s ease-in-out infinite' }}
                >
                  <img
                    src="/assets/planets/01_mars/level_2/solutions/dog.png"
                    alt="Dog Billboard"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </MarsCanyonBillboardStage>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Step 4 - Add Habitat Captions
 * Dynamic Animation:
 * - Left: Caption block is dragged from Captions category and snapped below Image src
 * - Right: Wooden caption plate slides onto the billboard beneath the dog image!
 */
export function MarsLevel2Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Caption Block */
        @keyframes m2s4DragCaption {
          0%, 12% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0.6;
          }
          32%, 85% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0.6;
          }
        }
        @keyframes m2s4CursorDrag {
          0%, 12% { transform: translate(-65px, 20px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          38%, 85% { transform: translate(25px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-65px, 20px); opacity: 0; }
        }
        @keyframes m2s4SnapPulse {
          0%, 30% { filter: brightness(1); outline: none; }
          32% { filter: brightness(1.4); outline: 2px solid #10B981; box-shadow: 0 0 16px rgba(16, 185, 129, 0.9); }
          40%, 85% { filter: brightness(1.05); outline: 1px solid rgba(16, 185, 129, 0.5); }
          92%, 100% { filter: brightness(1); outline: none; }
        }

        /* Simulation Caption Plate Slide-in */
        @keyframes m2s4PlateMissing {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m2s4PlateSlideIn {
          0%, 30% { opacity: 0; transform: translateY(6px); }
          34%, 88% { opacity: 1; transform: translateY(0); }
          94%, 100% { opacity: 0; transform: translateY(6px); }
        }
        @keyframes m2s4StatusNoCap {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m2s4StatusComplete {
          0%, 30% { opacity: 0; }
          34%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* LEFT PANE */}
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
          <Mars2ToolboxSidebar activeCategory="captions" />

          {/* Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            <div className="h-7 w-[195px] bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Billboard 1 Container</span>
            </div>

            <div className="h-7 w-[187px] bg-[#0ea5e9] text-white text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Image src =</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-amber-300 font-mono">
                &quot;dog.png&quot; ▾
              </span>
            </div>

            {/* Dragged Caption Block into blank trace slot */}
            <div className="relative ml-2 w-[187px] mt-0.5">
              <div className="h-7 rounded-b border border-dashed border-emerald-500/40 bg-emerald-950/10" />

              {/* Animated Dragged Caption Block */}
              <div
                className="absolute inset-0 h-7 bg-[#10B981] text-white text-[9px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-emerald-400/30 z-30"
                style={{
                  animation: 'm2s4DragCaption 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m2s4SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Caption:</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-[7.5px] text-white font-sans truncate max-w-[105px]">
                  Definitely Not An Alien
                </span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm2s4CursorDrag 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
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
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
              style={{ animation: 'm2s4StatusNoCap 6.5s ease-in-out infinite' }}
            >
              IMAGE ONLY
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black"
              style={{ animation: 'm2s4StatusComplete 6.5s ease-in-out infinite' }}
            >
              CAPTION ATTACHED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <MarsCanyonBillboardStage>
            <div className="relative w-[215px] sm:w-[230px] rounded-xl border-3 border-emerald-500/70 p-2 bg-[#0c0408] flex flex-col items-center transition-all shadow-xl">
              <div className="w-full flex items-center justify-between border-b border-emerald-900/60 pb-1 mb-1.5 px-1">
                <span className="text-[8px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                  BILLBOARD 1
                </span>
                <span className="text-[7.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-300">
                  VERIFIED
                </span>
              </div>

              {/* Dog Image Screen */}
              <div className="w-full h-22 rounded-lg bg-[#07090e] border border-slate-700/80 relative overflow-hidden flex items-center justify-center">
                <img
                  src="/assets/planets/01_mars/level_2/solutions/dog.png"
                  alt="Dog Billboard"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* BEFORE SNAP: Blank caption trace */}
              <div
                className="w-full h-5 mt-1.5 rounded border border-dashed border-emerald-500/30 bg-emerald-950/10"
                style={{ animation: 'm2s4PlateMissing 6.5s ease-in-out infinite' }}
              />

              {/* AFTER SNAP: Wooden Caption Plate Slides in */}
              <div
                className="w-full mt-1.5 px-2 py-1 rounded bg-[#2a1205] border border-amber-800/80 text-center shadow-inner"
                style={{ animation: 'm2s4PlateSlideIn 6.5s ease-in-out infinite' }}
              >
                <p className="text-[8.5px] font-sans font-semibold text-amber-100 leading-tight">
                  &quot;Definitely Not An Alien&quot;
                </p>
              </div>
            </div>
          </MarsCanyonBillboardStage>
        </div>
      </div>
    </div>
  );
}
