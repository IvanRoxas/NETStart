"use client";

import React from 'react';

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

function Saturn2ToolboxSidebar({ activeCategory = "events" }: { activeCategory?: "events" | "functions" | "cases" | "actions" }) {
  return (
    <div className="flex flex-col gap-1.5 w-18 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "events"
          ? "text-red-300 bg-red-950/80 border-red-400"
          : "text-red-400/60 bg-red-950/30 border-red-500/30"
      }`}>
        Events
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "functions"
          ? "text-purple-300 bg-purple-950/80 border-purple-400"
          : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
      }`}>
        Functions
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "cases"
          ? "text-blue-300 bg-blue-950/80 border-blue-400"
          : "text-blue-400/60 bg-blue-950/30 border-blue-500/30"
      }`}>
        Cases
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${
        activeCategory === "actions"
          ? "text-pink-300 bg-pink-950/80 border-pink-400"
          : "text-pink-400/60 bg-pink-950/30 border-pink-500/30"
      }`}>
        Actions
      </div>
    </div>
  );
}

/**
 * 1-to-1 Authentic Simulation Stage from SaturnLevel2Simulation.tsx
 */
function Saturn2SimulationScene({
  isTractorBeamActive = false,
  targetOrbit = 1,
  isShieldActive = false,
  isAsteroidApproaching = false,
  showCheatSheet = false,
  statusLabel = "RINGS READY",
}: {
  isTractorBeamActive?: boolean;
  targetOrbit?: 1 | 2 | 3 | 4;
  isShieldActive?: boolean;
  isAsteroidApproaching?: boolean;
  showCheatSheet?: boolean;
  statusLabel?: string;
}) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#070312] select-none font-mono">
      {/* 1. Starry Sky Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-85"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 15px 25px, #ffffff, transparent),
            radial-gradient(2px 2px at 85px 120px, #a5b4fc, transparent),
            radial-gradient(1px 1px at 160px 40px, #ffffff, transparent),
            radial-gradient(1.5px 1.5px at 240px 180px, #38bdf8, transparent),
            radial-gradient(2px 2px at 320px 80px, #ffffff, transparent),
            radial-gradient(1px 1px at 450px 220px, #e2e8f0, transparent)
          `,
          backgroundSize: '300px 200px',
        }}
      />

      {/* 2. Ambient Ring Nebula Backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_85%_50%,_rgba(234,179,8,0.35),_transparent_75%)]" />

      {/* 3. The 4 Concentric Planetary Rings (Curved SVG on the right) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="s2MelterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="s2CrusherGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#d97706" stopOpacity="1" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="s2MagnetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#64748b" stopOpacity="1" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="s2Orbit4Grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
              <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.9" />
            </linearGradient>

            <path id="s2Orbit1Arc" d="M 525 650 A 760 760 0 0 1 525 -50" fill="none" />
            <path id="s2Orbit2Arc" d="M 676 650 A 630 630 0 0 1 676 -50" fill="none" />
            <path id="s2Orbit3Arc" d="M 843 650 A 500 500 0 0 1 843 -50" fill="none" />
            <path id="s2Orbit4Arc" d="M 1080 650 A 370 370 0 0 1 1080 -50" fill="none" />
          </defs>

          {/* Orbit 1 Ring (Ice) */}
          <path
            d="M 525 -50 A 760 760 0 0 0 525 650"
            fill="none"
            stroke={targetOrbit === 1 && isTractorBeamActive ? "url(#s2MelterGrad)" : "rgba(56, 189, 248, 0.4)"}
            strokeWidth={targetOrbit === 1 && isTractorBeamActive ? "6" : "2.5"}
            className="transition-all duration-300"
            style={{
              filter: targetOrbit === 1 && isTractorBeamActive ? "drop-shadow(0 0 12px #38bdf8)" : "none",
            }}
          />
          <text
            fill={targetOrbit === 1 && isTractorBeamActive ? "#38bdf8" : "rgba(255, 255, 255, 0.85)"}
            fontSize="26"
            fontFamily="monospace"
            fontWeight="900"
            letterSpacing="4"
          >
            <textPath href="#s2Orbit1Arc" startOffset="48%" textAnchor="middle">
              ORBIT 1
            </textPath>
          </text>

          {/* Orbit 2 Ring (Rock) */}
          <path
            d="M 676 -50 A 630 630 0 0 0 676 650"
            fill="none"
            stroke={targetOrbit === 2 && isTractorBeamActive ? "url(#s2CrusherGrad)" : "rgba(245, 158, 11, 0.35)"}
            strokeWidth={targetOrbit === 2 && isTractorBeamActive ? "6" : "2"}
            className="transition-all duration-300"
          />
          <text fill="rgba(255, 255, 255, 0.7)" fontSize="24" fontFamily="monospace" fontWeight="900" letterSpacing="4">
            <textPath href="#s2Orbit2Arc" startOffset="50%" textAnchor="middle">
              ORBIT 2
            </textPath>
          </text>

          {/* Orbit 3 Ring (Mineral) */}
          <path
            d="M 843 -50 A 500 500 0 0 0 843 650"
            fill="none"
            stroke="rgba(148, 163, 184, 0.3)"
            strokeWidth="2"
          />
          <text fill="rgba(255, 255, 255, 0.6)" fontSize="22" fontFamily="monospace" fontWeight="900" letterSpacing="4">
            <textPath href="#s2Orbit3Arc" startOffset="50%" textAnchor="middle">
              ORBIT 3
            </textPath>
          </text>

          {/* Orbit 4 Ring (Crystal) */}
          <path
            d="M 1080 -50 A 370 370 0 0 0 1080 650"
            fill="none"
            stroke="rgba(192, 132, 252, 0.3)"
            strokeWidth="2"
          />
          <text fill="rgba(255, 255, 255, 0.55)" fontSize="20" fontFamily="monospace" fontWeight="900" letterSpacing="4">
            <textPath href="#s2Orbit4Arc" startOffset="52%" textAnchor="middle">
              ORBIT 4
            </textPath>
          </text>

          {/* 4. Tractor Beam Conduit when actively routing */}
          {isTractorBeamActive && (
            <g className="animate-in fade-in duration-200">
              <line x1="22%" y1="70%" x2="48%" y2="32%" stroke="#38bdf8" strokeWidth="10" strokeOpacity="0.25" />
              <line x1="22%" y1="70%" x2="48%" y2="32%" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.9" />
              <circle cx="22%" cy="70%" r="6" fill="#38bdf8" filter="drop-shadow(0 0 8px #38bdf8)" />
              <circle cx="22%" cy="70%" r="3" fill="#ffffff" />
              <circle cx="48%" cy="32%" r="16" fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="1.5" />
            </g>
          )}
        </svg>
      </div>

      {/* 5. Floating Debris Chunks in Flight */}
      <div className="absolute inset-0 pointer-events-none z-15">
        {/* Ice Debris Chunk */}
        <div
          className={`absolute transition-all duration-700 flex flex-col items-center ${
            isTractorBeamActive
              ? "left-[46%] top-[28%] scale-110"
              : "left-[36%] top-[14%] animate-pulse"
          }`}
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-400 via-sky-300 to-white rotate-45 shadow-[0_0_12px_#38bdf8] flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white/80 rounded-xs" />
          </div>
          <span className="text-[7px] font-bold text-cyan-300 mt-1 bg-black/60 px-1 rounded border border-cyan-500/40">
            ICE
          </span>
        </div>

        {/* Hazard Asteroid */}
        {isAsteroidApproaching && (
          <div
            className={`absolute transition-all duration-700 flex flex-col items-center ${
              isShieldActive
                ? "left-[24%] bottom-[42%] scale-95 opacity-80"
                : "left-[22%] top-[12%] scale-110"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-700 via-red-500 to-amber-500 shadow-[0_0_20px_#ef4444] border-2 border-red-400 flex items-center justify-center">
              <div className="w-4 h-3 rounded-full bg-black/40 -ml-2 -mt-1" />
            </div>
            <span className="text-[7.5px] font-bold text-red-300 mt-1 bg-red-950/80 px-1.5 py-0.2 rounded border border-red-500/60 animate-pulse">
              BIG ASTEROID
            </span>
          </div>
        )}
      </div>

      {/* 6. Designated Orbit Placement Reference (Slide 4) */}
      {showCheatSheet && (
        <div className="absolute top-2 left-2 z-30 p-1.5 rounded-lg bg-black/85 border border-purple-500/40 shadow-xl flex flex-col gap-1 text-[7px]">
          <span className="font-bold text-purple-300 tracking-wider">DESIGNATED RINGS</span>
          <div className="grid grid-cols-2 gap-1 text-[6.5px]">
            <span className="text-cyan-300 bg-cyan-950/80 px-1 py-0.2 rounded border border-cyan-500/40">Orbit 1: Ice</span>
            <span className="text-amber-300 bg-amber-950/80 px-1 py-0.2 rounded border border-amber-500/40">Orbit 2: Rocks</span>
            <span className="text-slate-300 bg-slate-900/80 px-1 py-0.2 rounded border border-slate-500/40">Orbit 3: Minerals</span>
            <span className="text-purple-300 bg-purple-950/80 px-1 py-0.2 rounded border border-purple-500/40">Orbit 4: Crystals</span>
          </div>
        </div>
      )}

      {/* 7. The Player Starship Entity matching Spaceship Section 3.svg */}
      <div className="absolute left-[22%] -translate-x-1/2 bottom-3 z-25 flex flex-col items-center pointer-events-none">
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center">
          <img
            src="/assets/planets/00_moon/level_1/Spaceship Section 3.svg"
            alt="Player Spaceship"
            className="w-full h-full object-contain -rotate-90 drop-shadow-[0_0_16px_rgba(56,189,248,0.65)]"
          />

          {/* Glowing Nose Tip Orb Anchor */}
          <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-3 h-3 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#38bdf8] animate-pulse" />
          </div>

          {/* Energy Shield Bubble FX (Deflecting Asteroid) */}
          {isShieldActive && (
            <div className="absolute -inset-4 sm:-inset-5 rounded-full border-3 border-cyan-400 bg-cyan-500/25 backdrop-blur-[1px] shadow-[0_0_35px_rgba(6,182,212,0.95)] ring-2 ring-cyan-300/70 animate-pulse flex items-center justify-center">
              <div className="w-full h-full rounded-full border border-sky-300/60 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          )}

          {/* Thruster Flame Below Rocket */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-6 bg-gradient-to-b from-cyan-400 via-amber-400 to-transparent rounded-full blur-xs animate-pulse" />
        </div>
      </div>

      {/* 8. Bottom Status Readout Bar */}
      <div className="absolute bottom-1 right-2 z-30 px-2 py-0.5 rounded bg-black/75 border border-purple-500/30 text-[7.5px] text-cyan-300">
        {statusLabel}
      </div>
    </div>
  );
}

/**
 * Slide 1: Jumpstarting the Router (Start & Function Declarations)
 * Teaches: The program entry point and declaring the functions before main
 */
export function SaturnLevel2Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s2s1DragProto {
          0%, 14% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.03);
          }
          34% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          38%, 86% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }
        @keyframes s2s1CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s2s1SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #8b5cf6; box-shadow: 0 0 16px rgba(139,92,246,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s2s1TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s2s1StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s1StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s2s1SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s1SceneLive {
          0%, 36% { opacity: 0; pointer-events: none; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; pointer-events: none; }
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
          <Saturn2ToolboxSidebar activeCategory="functions" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program (Root block at the top) */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start</span>
            </div>

            {/* Function Prototype Slot: Blank dashed outline directly under Start */}
            <div className="relative w-full">
              <div
                className="h-6.5 border border-dashed border-purple-500/40 bg-purple-950/10"
                style={{ animation: 's2s1TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Prototype Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20 z-30"
                style={{
                  animation: 's2s1DragProto 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s2s1SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span className="truncate">Declare Function: Route to Orbit</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's2s1CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* End Program (Seals bottom) */}
            <div className="h-6.5 bg-[#EF4444] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation Stage */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[130px] shrink-0 h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 's2s1StatusStandby 7s ease-in-out infinite' }}
            >
              STANDBY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's2s1StatusLive 7s ease-in-out infinite' }}
            >
              ROUTER ONLINE
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 's2s1SceneStandby 7s ease-in-out infinite' }}>
            <Saturn2SimulationScene isTractorBeamActive={false} statusLabel="Awaiting prototypes..." />
          </div>
          <div className="absolute inset-0" style={{ animation: 's2s1SceneLive 7s ease-in-out infinite' }}>
            <Saturn2SimulationScene isTractorBeamActive={false} statusLabel="routeToOrbit() ready" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Pairing Cases with Actions (The Core Routing Mechanic)
 * Teaches: Dragging Route to Orbit into the mouth of Case [Ice Debris ▾], and how the tractor beam executes
 */
export function SaturnLevel2Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s2s2DragAction {
          0%, 14% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(-65px, 25px) scale(1.03);
          }
          34% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          38%, 86% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0;
          }
        }
        @keyframes s2s2CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s2s2SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #ec4899; box-shadow: 0 0 16px rgba(236,72,153,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s2s2TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s2s2StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s2StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s2s2SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s2SceneLive {
          0%, 36% { opacity: 0; pointer-events: none; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; pointer-events: none; }
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
          <Saturn2ToolboxSidebar activeCategory="actions" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6 bg-[#EF4444] text-white text-[9px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start</span>
            </div>

            {/* Declare Function */}
            <div className="h-6 bg-[#8B5CF6] text-white text-[8px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span className="truncate">Declare Function: Route to Orbit</span>
            </div>

            {/* Case Block Header */}
            <div className="h-6 bg-[#3B82F6] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Case</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-cyan-200 font-mono">Ice Debris ▾</span>
              <span>:</span>
            </div>

            {/* Action Slot inside Case Mouth: Blank dashed trace before snap */}
            <div className="relative w-[178px] ml-3">
              <div
                className="h-6 border border-dashed border-pink-500/40 bg-pink-950/10"
                style={{ animation: 's2s2TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Route Action Block */}
              <div
                className="absolute inset-0 h-6 bg-[#EC4899] text-white text-[8px] font-bold px-2 rounded flex items-center justify-between shadow border-l-2 border-pink-300 z-30"
                style={{
                  animation: 's2s2DragAction 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s2s2SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>Route to</span>
                <span className="bg-black/50 px-1 py-0.5 rounded text-white font-mono">Orbit 1 ▾</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's2s2CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* End Program */}
            <div className="h-6 bg-[#EF4444] text-white text-[9px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[130px] shrink-0 h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 's2s2StatusStandby 7s ease-in-out infinite' }}
            >
              SCANNING
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's2s2StatusLive 7s ease-in-out infinite' }}
            >
              TRACTOR BEAM ACTIVE
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 's2s2SceneStandby 7s ease-in-out infinite' }}>
            <Saturn2SimulationScene isTractorBeamActive={false} statusLabel="Ice detected: Awaiting action" />
          </div>
          <div className="absolute inset-0" style={{ animation: 's2s2SceneLive 7s ease-in-out infinite' }}>
            <Saturn2SimulationScene isTractorBeamActive={true} targetOrbit={1} statusLabel="routeToOrbit(1) -> Ring 1" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Handling Hazards (Why you need Activate Shield instead of Route)
 * Teaches: Big Asteroids will destroy rings and crash into the ship! Must use Activate Shield inside the Asteroid case
 */
export function SaturnLevel2Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s2s3DragShield {
          0%, 14% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.03);
          }
          34% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          38%, 86% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }
        @keyframes s2s3CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s2s3SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #ec4899; box-shadow: 0 0 16px rgba(236,72,153,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s2s3TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s2s3StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s3StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s2s3SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s3SceneLive {
          0%, 36% { opacity: 0; pointer-events: none; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; pointer-events: none; }
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
          <Saturn2ToolboxSidebar activeCategory="actions" />

          {/* Assembly Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-1">
            {/* Start Program */}
            <div className="h-6 bg-[#EF4444] text-white text-[9px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start</span>
            </div>

            {/* Declare Function */}
            <div className="h-6 bg-[#8B5CF6] text-white text-[8px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span className="truncate">Declare Function: Activate Shield</span>
            </div>

            {/* Case Big Asteroid */}
            <div className="h-6 bg-[#3B82F6] text-white text-[8.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Case</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-red-300 font-mono">Big Asteroid ▾</span>
              <span>:</span>
            </div>

            {/* Shield Action Slot inside Case: Blank dashed outline before snap */}
            <div className="relative w-[178px] ml-3">
              <div
                className="h-6 border border-dashed border-pink-500/40 bg-pink-950/10"
                style={{ animation: 's2s3TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Shield Block */}
              <div
                className="absolute inset-0 h-6 bg-[#EC4899] text-white text-[8px] font-bold px-2 rounded flex items-center justify-between shadow border-l-2 border-pink-300 z-30"
                style={{
                  animation: 's2s3DragShield 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s2s3SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>Activate Shield</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's2s3CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* End Program */}
            <div className="h-6 bg-[#EF4444] text-white text-[9px] font-bold px-2 rounded-b flex items-center shadow border-b border-x border-red-400/40 border-t border-black/20">
              <span>End</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[130px] shrink-0 h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.6)] whitespace-nowrap"
              style={{ animation: 's2s3StatusStandby 7s ease-in-out infinite' }}
            >
              COLLISION HAZARD
            </span>
            <span
              className="absolute right-0 text-[#38bdf8] drop-shadow-[0_0_6px_rgba(56,189,248,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's2s3StatusLive 7s ease-in-out infinite' }}
            >
              SHIELD DEFLECTED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 's2s3SceneStandby 7s ease-in-out infinite' }}>
            <Saturn2SimulationScene isTractorBeamActive={false} isAsteroidApproaching={true} isShieldActive={false} statusLabel="Asteroid impact imminent!" />
          </div>
          <div className="absolute inset-0" style={{ animation: 's2s3SceneLive 7s ease-in-out infinite' }}>
            <Saturn2SimulationScene isTractorBeamActive={false} isAsteroidApproaching={true} isShieldActive={true} statusLabel="activateShield() -> Asteroid deflected" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Assembling the Full Pipeline & Ring Reference
 * Teaches: Stacking all cases together and sealing with End to complete the 60-second flight
 */
export function SaturnLevel2Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes s2s4DragEnd {
          0%, 14% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.03);
          }
          34% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          38%, 86% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }
        @keyframes s2s4CursorMotion {
          0%, 10% { transform: translate(-80px, 35px); opacity: 0; }
          16% { transform: translate(-50px, 25px); opacity: 1; }
          20% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          34% { transform: translate(15px, 6px); opacity: 1; }
          38% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          42%, 48% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          54% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 35px); opacity: 0; }
        }
        @keyframes s2s4SnapPulse {
          0%, 35% { filter: brightness(1); }
          38%, 46% { filter: brightness(1.35); outline: 2px solid #ef4444; box-shadow: 0 0 16px rgba(239,68,68,0.9); }
          48%, 100% { filter: brightness(1); outline: none; }
        }
        @keyframes s2s4TraceSlot {
          0%, 34% { opacity: 1; }
          38%, 86% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes s2s4StatusStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s4StatusLive {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
        @keyframes s2s4SceneStandby {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes s2s4SceneLive {
          0%, 36% { opacity: 0; pointer-events: none; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; pointer-events: none; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2 flex flex-row gap-2 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Saturn2ToolboxSidebar activeCategory="events" />

          {/* Full Pipeline Stack */}
          <div className="flex flex-col w-[190px] sm:w-[200px] relative z-20 pt-0.5">
            {/* Start Program */}
            <div className="h-5.5 bg-[#EF4444] text-white text-[8.5px] font-bold px-2 rounded-t flex items-center shadow border-t border-x border-red-400/40">
              <span>Start</span>
            </div>

            {/* Prototypes */}
            <div className="h-5 bg-[#8B5CF6] text-white text-[7.5px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span className="truncate">Declare Function: Route to Orbit</span>
            </div>
            <div className="h-5 bg-[#8B5CF6] text-white text-[7.5px] font-bold px-2 flex items-center shadow border-t border-black/20">
              <span className="truncate">Declare Function: Activate Shield</span>
            </div>

            {/* Debris Cases */}
            <div className="h-5 bg-[#3B82F6] text-white text-[7.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Case Ice: Route to Orbit 1</span>
            </div>
            <div className="h-5 bg-[#3B82F6] text-white text-[7.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Case Rock: Route to Orbit 2</span>
            </div>
            <div className="h-5 bg-[#3B82F6] text-white text-[7.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Case Big Asteroid: Activate Shield</span>
            </div>

            {/* End Slot: Blank dashed outline before snap */}
            <div className="relative w-full">
              <div
                className="h-5.5 border border-dashed border-red-500/40 bg-red-950/10 rounded-b"
                style={{ animation: 's2s4TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged End Block */}
              <div
                className="absolute inset-0 h-5.5 bg-[#EF4444] text-white text-[8.5px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-red-400/40 border-t border-black/20 z-30"
                style={{
                  animation: 's2s4DragEnd 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, s2s4SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>End</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 's2s4CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
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
          <div className="relative flex items-center justify-end min-w-[130px] shrink-0 h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 's2s4StatusStandby 7s ease-in-out infinite' }}
            >
              ASSEMBLING
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black whitespace-nowrap"
              style={{ animation: 's2s4StatusLive 7s ease-in-out infinite' }}
            >
              RINGS STABILIZED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 's2s4SceneStandby 7s ease-in-out infinite' }}>
            <Saturn2SimulationScene isTractorBeamActive={false} showCheatSheet={true} statusLabel="Connect all cases & End" />
          </div>
          <div className="absolute inset-0" style={{ animation: 's2s4SceneLive 7s ease-in-out infinite' }}>
            <Saturn2SimulationScene isTractorBeamActive={true} targetOrbit={1} showCheatSheet={true} statusLabel="Full switch active: Rings safe!" />
          </div>
        </div>
      </div>
    </div>
  );
}
