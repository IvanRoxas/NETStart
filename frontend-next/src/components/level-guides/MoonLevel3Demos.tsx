"use client";

import React from 'react';
import {
  Play,
  CheckCircle2,
  Wind,
  Fan,
  Target,
  AlertTriangle,
  Flame,
  FlaskConical,
  RotateCw,
  Repeat,
  Shield,
  Zap,
  Radio,
  Rocket,
  Package
} from 'lucide-react';

/**
 * Clean SVG Cursor Pointer (Strictly Zero Emojis)
 */
function CursorPointer({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="white"
      stroke="#120420"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={`drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] pointer-events-none ${className}`}
    >
      <path d="M5.5 3.5l11 7-5.5 1.5-3 5.5-2.5-14z" />
    </svg>
  );
}

/**
 * Section 1 Toolbox Sidebar (Air Vent / Movement)
 */
function WorkspaceSidebarAirVent() {
  return (
    <div className="flex flex-col gap-1.5 w-16 shrink-0 py-1 select-none font-mono">
      <div className="text-[8px] font-bold uppercase text-red-400 bg-red-950/40 border-l-2 border-red-500 px-1.5 py-0.5 rounded-r">
        Events
      </div>
      <div className="text-[8px] font-bold uppercase text-amber-400 bg-amber-950/40 border-l-2 border-amber-500 px-1.5 py-0.5 rounded-r">
        Movement
      </div>
      <div className="text-[8px] font-bold uppercase text-orange-400 bg-orange-950/40 border-l-2 border-orange-500 px-1.5 py-0.5 rounded-r">
        Loops
      </div>
    </div>
  );
}

/**
 * 7x7 Air Vent Grid Component matching OxygenMaze.tsx
 */
function AirVentGridDisplay({
  windPos = { x: 0, y: 3 },
  showExplosion = false,
  fanHazardActive = false,
  cabinActive = false,
  customAirflowPath = [] as { x: number; y: number }[],
}: {
  windPos?: { x: number; y: number };
  showExplosion?: boolean;
  fanHazardActive?: boolean;
  cabinActive?: boolean;
  customAirflowPath?: { x: number; y: number }[];
}) {
  // 7x7 Air Vent Grid from OxygenMaze.tsx
  const grid = [
    [0, 0, 1, 0, 1, 0, 0], // Row 0
    [1, 1, 1, 1, 1, 1, 1], // Row 1 (Open Street)
    [1, 0, 1, 0, 1, 0, 3], // Row 2 (Fan at (6,2))
    [1, 1, 1, 3, 1, 1, 4], // Row 3 (Start (0,3), Fan (3,3), Goal (6,3))
    [1, 0, 1, 0, 1, 0, 1], // Row 4
    [1, 1, 1, 1, 3, 1, 1], // Row 5 (Fan at (4,5))
    [0, 0, 1, 0, 1, 0, 0], // Row 6
  ];

  return (
    <div
      className="grid gap-[2px] p-2 bg-[#090314] rounded-xl border border-purple-900/60 shadow-2xl relative overflow-hidden"
      style={{
        gridTemplateColumns: 'repeat(7, 1fr)',
        gridTemplateRows: 'repeat(7, 1fr)',
        width: '168px',
        height: '168px',
      }}
    >
      {grid.map((row, y) =>
        row.map((cellType, x) => {
          const isWindHere = windPos.x === x && windPos.y === y;
          const isTrail = customAirflowPath.some(p => p.x === x && p.y === y);

          // 0 = Dark Wall Bulkhead
          if (cellType === 0) {
            return (
              <div
                key={`c-${x}-${y}`}
                className="w-full h-full bg-[#05010a] border border-purple-950/70 rounded-sm"
              />
            );
          }

          // 3 = Broken Fan (Red Hazard)
          if (cellType === 3) {
            const isTargetFan = x === 3 && y === 3;
            return (
              <div
                key={`c-${x}-${y}`}
                className={`w-full h-full rounded-sm flex flex-col items-center justify-center relative transition-all duration-300 ${isTargetFan && fanHazardActive
                  ? 'border border-rose-400 bg-rose-600/60 shadow-[0_0_12px_#f43f5e]'
                  : 'border border-rose-500/70 bg-rose-950/40 shadow-inner'
                  }`}
              >
                <Fan
                  size={12}
                  className={`text-rose-400 ${isTargetFan && fanHazardActive ? 'animate-spin' : ''}`}
                />
                <span className="text-[5px] font-mono font-black text-rose-300 leading-none">
                  FAN
                </span>

                {isTargetFan && showExplosion && (
                  <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-rose-500/80 animate-ping absolute" />
                    <div className="w-7 h-7 rounded-full bg-amber-400/90 shadow-[0_0_15px_#f59e0b] animate-pulse absolute" />
                    <span className="text-[7px] font-black text-white font-mono z-40 drop-shadow">
                      BOOM!
                    </span>
                  </div>
                )}
              </div>
            );
          }

          // 4 = Cabin Goal (Green)
          if (cellType === 4) {
            return (
              <div
                key={`c-${x}-${y}`}
                className={`w-full h-full rounded-sm flex flex-col items-center justify-center relative transition-all duration-300 ${cabinActive
                  ? 'border border-emerald-400 bg-emerald-500/40 shadow-[0_0_15px_#10b981]'
                  : 'border border-emerald-500/70 bg-emerald-950/40 shadow-inner'
                  }`}
              >
                <Target size={12} className="text-emerald-400 animate-pulse" />
                <span className="text-[5px] font-mono font-black text-emerald-300 leading-none">
                  CABIN
                </span>
                {isWindHere && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <Wind size={14} className="text-emerald-200 drop-shadow-[0_0_8px_#10b981]" />
                  </div>
                )}
              </div>
            );
          }

          // 1 = Pathway
          return (
            <div
              key={`c-${x}-${y}`}
              className={`w-full h-full rounded-sm border flex items-center justify-center relative transition-all duration-200 ${isTrail
                ? 'border-cyan-400/80 bg-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                : 'border-cyan-500/30 bg-[#150a28]'
                }`}
            >
              {isWindHere && !showExplosion && (
                <div className="z-20">
                  <Wind size={13} className="text-cyan-300 drop-shadow-[0_0_8px_#06b6d4]" />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// =============================================================================
// SET 1: SECTION 1 (AIR VENT / OXYGEN MAZE)
// =============================================================================

/**
 * Slide 1.1: Blocks place will affect movement protocol
 */
export function MoonLevel3Sec1Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        @keyframes dragVentMoveBlock {
          0%, 15% { transform: translate(-55px, 25px); opacity: 0.7; }
          32%, 85% { transform: translate(0px, 0px); opacity: 1; }
          95%, 100% { transform: translate(-55px, 25px); opacity: 0.7; }
        }
        @keyframes cursorVentMove {
          0%, 15% { transform: translate(-55px, 25px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          40%, 85% { transform: translate(15px, 15px); opacity: 0; }
          95%, 100% { transform: translate(-55px, 25px); opacity: 1; }
        }
        @keyframes windAdvanceStep1 {
          0%, 34% { transform: translate(0, 0); }
          44%, 60% { transform: translate(22px, 0); }
          70%, 90% { transform: translate(44px, 0); }
          96%, 100% { transform: translate(0, 0); }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider">BLOCKS</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-3 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <WorkspaceSidebarAirVent />

          <div className="flex flex-col w-[150px] relative z-20">
            {/* Start */}
            <div className="h-6 bg-[#ef4444] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center gap-1.5 shadow border-t border-x border-red-300/40">
              <Play size={8} fill="white" />
              <span>Start</span>
            </div>

            {/* Move Forward 1 */}
            <div className="h-5 bg-[#eab308] text-white text-[8.5px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Move Forward</span>
              <span className="text-[7px] font-mono bg-black/30 px-1 py-0.2 rounded">1 tile</span>
            </div>

            {/* Move Forward 2 (Snapping) */}
            <div
              className="relative h-5 bg-[#eab308] text-white text-[8.5px] font-bold px-2 rounded-b flex items-center justify-between border-t border-black/20 shadow"
              style={{ animation: 'dragVentMoveBlock 4.5s ease-in-out infinite' }}
            >
              <span>Move Forward</span>
              <span className="text-[7px] font-mono bg-black/30 px-1 py-0.2 rounded">1 tile</span>

              <div
                className="absolute -right-1 -top-1 z-30"
                style={{ animation: 'cursorVentMove 4.5s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative justify-between p-2.5 overflow-hidden">
        <div className="h-6 px-2.5 bg-[#170529] border border-white/10 rounded-md flex items-center justify-between shrink-0 mb-1 z-30">
          <span className="text-[9.5px] font-black tracking-wider uppercase font-mono text-purple-200">AIRFLOW VENT</span>
          <span className="text-[8.5px] font-mono text-[#00f5d4] font-bold">READY</span>
        </div>

        <div className="flex-1 flex items-center justify-center relative w-full my-auto">
          <div className="relative">
            <AirVentGridDisplay windPos={{ x: -1, y: -1 }} />
            {/* Airflow sprite starts at (0,3) */}
            <div
              className="absolute top-[74px] left-[4px] w-[22px] h-[22px] pointer-events-none z-30 flex items-center justify-center"
              style={{ animation: 'windAdvanceStep1 4.5s ease-in-out infinite' }}
            >
              <Wind size={15} className="text-cyan-300 drop-shadow-[0_0_10px_#06b6d4]" />
            </div>
          </div>
        </div>

        <div className="text-center py-0.5 z-20">
          <span className="text-[8.5px] font-mono text-purple-300/70">
            Movement blocks dictate oxygen airflow through the vent pipes
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1.2: Avoid Red Fan Hazards (Explosion Scenario Demonstrated)
 */
export function MoonLevel3Sec1Step2Demo() {
  return (
    <div className="relative w-full h-full flex flex-col rounded-xl border border-rose-500/30 bg-[#0e041a] overflow-hidden select-none p-3 justify-between">
      <style>{`
        /* Wind moves right directly into the red broken fan at (3,3) */
        @keyframes windHitHazard {
          0%, 20% { transform: translate(0, 0); opacity: 1; }
          35% { transform: translate(24px, 0); opacity: 1; }
          50% { transform: translate(48px, 0); opacity: 1; }
          65% { transform: translate(72px, 0); opacity: 1; }
          /* Explodes at fan */
          70%, 90% { transform: translate(72px, 0); opacity: 0; }
          96%, 100% { transform: translate(0, 0); opacity: 1; }
        }

        /* Explosion burst animation */
        @keyframes fanExplodeBurst {
          0%, 68% { opacity: 0; transform: scale(0.4); }
          72% { opacity: 1; transform: scale(1.6); }
          82% { opacity: 1; transform: scale(1.8); }
          88%, 100% { opacity: 0; transform: scale(0.4); }
        }

        /* Screen shake on explosion */
        @keyframes ventScreenShake {
          0%, 68% { transform: translate(0, 0); }
          70% { transform: translate(-4px, 2px); }
          74% { transform: translate(4px, -2px); }
          78% { transform: translate(-2px, 1px); }
          82%, 100% { transform: translate(0, 0); }
        }
      `}</style>

      {/* Top Header Bar */}
      <div className="h-7 px-3 bg-[#170529] border border-rose-500/30 rounded-lg flex items-center justify-between shrink-0 mb-1 z-30">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-rose-400 animate-pulse" />
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-rose-300">
            HAZARD SIMULATION: RED BROKEN FANS
          </span>
        </div>
        <span className="text-[8.5px] font-mono text-rose-400 font-bold bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 rounded animate-pulse">
          TOUCHING RED = EXPLOSION
        </span>
      </div>

      {/* Centered Explosion Hazard Demonstration */}
      <div
        className="flex-1 flex items-center justify-center relative w-full my-auto"
        style={{ animation: 'ventScreenShake 5s ease-in-out infinite' }}
      >
        <div className="relative p-2.5 bg-[#08020f]/80 rounded-xl border border-white/10 shadow-2xl">
          <AirVentGridDisplay windPos={{ x: -1, y: -1 }} fanHazardActive={true} />

          {/* Moving wind hitting hazard */}
          <div
            className="absolute top-[84px] left-[14px] w-[22px] h-[22px] pointer-events-none z-30 flex items-center justify-center"
            style={{ animation: 'windHitHazard 5s ease-in-out infinite' }}
          >
            <Wind size={15} className="text-cyan-300 drop-shadow-[0_0_10px_#06b6d4]" />
          </div>

          {/* Explosion FX over Fan at (3,3) */}
          <div
            className="absolute top-[80px] left-[84px] w-[26px] h-[26px] flex items-center justify-center pointer-events-none z-40"
            style={{ animation: 'fanExplodeBurst 5s ease-in-out infinite' }}
          >
            <div className="w-16 h-16 rounded-full bg-rose-500/80 shadow-[0_0_30px_#f43f5e] animate-ping absolute" />
            <div className="w-10 h-10 rounded-full bg-amber-400 shadow-[0_0_20px_#f59e0b] absolute" />
            <span className="text-[9px] font-black text-black font-mono z-50">
              BOOM!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1.3: Reach Cabin Goal & Snap 'End' Block
 */
export function MoonLevel3Sec1Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        @keyframes dragEndAirVent {
          0%, 15% { transform: translate(-55px, 20px); opacity: 0.7; }
          32%, 85% { transform: translate(0px, 0px); opacity: 1; }
          95%, 100% { transform: translate(-55px, 20px); opacity: 0.7; }
        }
        @keyframes cursorEndAirVent {
          0%, 15% { transform: translate(-55px, 20px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          40%, 85% { transform: translate(15px, 15px); opacity: 0; }
          95%, 100% { transform: translate(-55px, 20px); opacity: 1; }
        }
        @keyframes popCabinVictory {
          0%, 38% { transform: scale(0.6); opacity: 0; pointer-events: none; }
          45%, 88% { transform: scale(1); opacity: 1; pointer-events: auto; }
          94%, 100% { transform: scale(0.6); opacity: 0; pointer-events: none; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider">BLOCKS</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-3 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <WorkspaceSidebarAirVent />

          <div className="flex flex-col w-[150px] relative z-20">
            <div className="h-5.5 bg-[#ef4444] text-white text-[9px] font-bold px-2 rounded-t flex items-center gap-1.5 shadow border-t border-x border-red-300/40">
              <Play size={8} fill="white" />
              <span>Start</span>
            </div>

            <div className="h-4.5 bg-[#eab308] text-white text-[8px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Bypass Fan Path...</span>
            </div>

            {/* End Block Snapping */}
            <div
              className="relative h-5.5 bg-[#dc2626] text-white text-[9px] font-black px-2 rounded-b flex items-center gap-1.5 shadow-xl border-t border-black/20"
              style={{ animation: 'dragEndAirVent 4.5s ease-in-out infinite' }}
            >
              <span className="w-1.5 h-1.5 rounded-sm bg-white" />
              <span>End</span>

              <div
                className="absolute -right-1 -top-1 z-30"
                style={{ animation: 'cursorEndAirVent 4.5s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Cabin Goal Success */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative justify-between p-2.5 overflow-hidden">
        <div className="h-6 px-2.5 bg-[#170529] border border-white/10 rounded-md flex items-center justify-between shrink-0 mb-1 z-30">
          <span className="text-[9.5px] font-black tracking-wider uppercase font-mono text-purple-200">CABIN REACHED</span>
          <span className="text-[8.5px] font-mono text-emerald-400 font-bold">SUCCESS</span>
        </div>

        <div className="flex-1 flex items-center justify-center relative w-full my-auto">
          <div className="relative">
            <AirVentGridDisplay windPos={{ x: 6, y: 3 }} cabinActive={true} />
          </div>
        </div>

        {/* Victory Popup */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-3 select-none pointer-events-none z-40"
          style={{ animation: 'popCabinVictory 4.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite' }}
        >
          <div className="flex flex-col items-center gap-2 bg-[#0e041a]/95 backdrop-blur-sm border border-emerald-500/60 rounded-2xl px-6 py-3.5 shadow-[0_0_28px_rgba(16,185,129,0.45)]">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)]">
              <CheckCircle2 size={26} strokeWidth={2.5} />
            </div>
            <span className="font-mono font-black text-sm text-emerald-400 tracking-wider">
              CABIN VENTILATED
            </span>
            <span className="text-[10px] text-gray-300 text-center max-w-[170px] leading-tight">
              Oxygen successfully routed safely through the vents!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SET 2: SECTION 2 (FUEL SYNTHESIS / CHEMICAL MIXING)
// Uses the EXACT SVG assets and layout from FuelSynthesis.tsx
// =============================================================================

const STICKER_STYLE: React.CSSProperties = {
  filter: 'drop-shadow(1.5px 0 0 #fff) drop-shadow(-1.5px 0 0 #fff) drop-shadow(0 1.5px 0 #fff) drop-shadow(0 -1.5px 0 #fff)'
};

/**
 * Common Fuel Lab Room Frame with the 4 Real Stations & Center Vat
 */
function FuelLabRoomDisplay({
  activeStation = 'NONE',
  liquidColor = 'Grey',
  isHeating = false,
  isMixing = false,
  novaNode = 'CENTER',
  batchSuccess = false,
  customCenterOverlay
}: {
  activeStation?: 'NONE' | 'SOLUTION' | 'MIX' | 'HEAT' | 'TANK';
  liquidColor?: 'Grey' | 'Blue' | 'Orange';
  isHeating?: boolean;
  isMixing?: boolean;
  novaNode?: 'CENTER' | 'SOLUTION' | 'MIX' | 'HEAT' | 'TANK';
  batchSuccess?: boolean;
  customCenterOverlay?: React.ReactNode;
}) {
  const getLiquidGradient = () => {
    switch (liquidColor) {
      case 'Orange':
        return 'from-amber-500 via-orange-500 to-yellow-400 shadow-[0_0_25px_rgba(249,115,22,0.85)]';
      case 'Blue':
        return 'from-blue-600 via-cyan-500 to-sky-400 shadow-[0_0_25px_rgba(6,182,212,0.85)]';
      case 'Grey':
      default:
        return 'from-slate-700 via-gray-600 to-zinc-500 shadow-[0_0_12px_rgba(100,116,139,0.4)]';
    }
  };

  const getNovaPos = () => {
    switch (novaNode) {
      case 'SOLUTION':
        return { left: '22%', top: '22%' };
      case 'MIX':
        return { left: '78%', top: '22%' };
      case 'HEAT':
        return { left: '22%', top: '78%' };
      case 'TANK':
        return { left: '78%', top: '78%' };
      case 'CENTER':
      default:
        return { left: '50%', top: '64%' };
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#1a082e] p-2.5 overflow-hidden">
      {/* Top Header Bar matching actual game */}
      <div className="h-6 px-2.5 bg-[#130728]/95 border border-white/10 rounded-md flex items-center justify-between shrink-0 z-30">
        <span className="text-[9px] font-mono font-bold text-purple-200 uppercase tracking-wider">
          FUEL SYNTHESIS LAB
        </span>
        <div className="flex items-center gap-1.5 font-mono text-[8px]">
          <span className="text-purple-300 font-bold uppercase">BATCHES:</span>
          <div className="flex gap-1">
            <span className={`w-4 h-4 rounded border flex items-center justify-center font-bold text-[8px] ${batchSuccess ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_6px_#10b981]' : 'bg-amber-500/25 border-amber-400 text-amber-300'}`}>
              1
            </span>
            <span className="w-4 h-4 rounded border border-white/10 bg-black/40 text-gray-500 flex items-center justify-center font-bold text-[8px]">
              2
            </span>
            <span className="w-4 h-4 rounded border border-white/10 bg-black/40 text-gray-500 flex items-center justify-center font-bold text-[8px]">
              3
            </span>
          </div>
        </div>
      </div>

      {/* Main Lab Arena with 4 Real Stations & Vat */}
      <div className="relative flex-1 w-full flex flex-col justify-between items-center py-1">
        {/* TOP ROW: Add Solution (Left) & Mix Solution (Right) */}
        <div className="w-full flex items-center justify-between px-3">
          {/* Top Left: Add Solution */}
          <div className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${activeStation === 'SOLUTION' ? 'scale-115 drop-shadow-[0_0_12px_rgba(6,182,212,0.95)]' : 'opacity-85'}`}>
            <img
              src="/assets/global/ui/Solution.svg"
              alt="Add Solution"
              className="w-10 h-10 object-contain"
              style={STICKER_STYLE}
            />
            <span className="font-mono text-[7.5px] font-bold text-white tracking-tight">Add Solution</span>
          </div>

          {/* Top Right: Mix Solution */}
          <div className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${activeStation === 'MIX' ? 'scale-115 drop-shadow-[0_0_12px_rgba(168,85,247,0.95)]' : 'opacity-85'}`}>
            <img
              src="/assets/global/npcs/Nova Mixing.svg"
              alt="Mix Solution"
              className="w-10 h-10 object-contain"
              style={STICKER_STYLE}
            />
            <span className="font-mono text-[7.5px] font-bold text-white tracking-tight">Mix Solution</span>
          </div>
        </div>

        {/* CENTER: Vat Metal Chamber */}
        <div className="relative flex flex-col items-center justify-center my-auto">
          {customCenterOverlay}

          {/* Vat Container */}
          <div className={`relative w-24 h-20 rounded-xl bg-black/80 border-2 p-1 flex flex-col items-center justify-end z-10 transition-all duration-300 ${activeStation === 'SOLUTION' || activeStation === 'MIX' ? 'border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.8)]' : 'border-slate-600'}`}>
            {/* Stirring Rod */}
            {isMixing && (
              <div
                className="absolute -top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none origin-top"
                style={{ animation: 'stirRod 0.5s ease-in-out infinite' }}
              >
                <div className="w-1.5 h-16 bg-gradient-to-r from-slate-300 via-white to-slate-400 rounded-full border border-slate-300 shadow flex flex-col items-center justify-end">
                  <div className="w-3.5 h-2 bg-slate-400 rounded-sm" />
                </div>
              </div>
            )}

            {/* Liquid Level */}
            <div className={`w-full h-12 rounded-lg bg-gradient-to-t transition-all duration-500 flex items-center justify-center relative z-20 overflow-hidden ${getLiquidGradient()}`}>
              {/* Bubbles when heated */}
              {isHeating && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70 absolute bottom-1 left-2 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-white/70 absolute bottom-1 left-6 animate-ping" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/70 absolute bottom-1 right-3 animate-bounce" />
                </div>
              )}
              <span className="text-[8.5px] font-mono font-black uppercase text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] z-20 tracking-wider">
                Fuel
              </span>
            </div>

            {/* Heating Coils */}
            <div className={`w-full h-2 bg-slate-900 border-t flex items-center justify-around px-1.5 z-20 transition-all ${isHeating ? 'border-orange-500 shadow-[0_0_8px_#f97316]' : 'border-white/20'}`}>
              <div className={`w-3 h-1 rounded-full ${isHeating ? 'bg-orange-500 shadow-[0_0_6px_#f97316] animate-pulse' : 'bg-slate-700'}`} />
              <div className={`w-3 h-1 rounded-full ${isHeating ? 'bg-orange-500 shadow-[0_0_6px_#f97316] animate-pulse' : 'bg-slate-700'}`} />
              <div className={`w-3 h-1 rounded-full ${isHeating ? 'bg-orange-500 shadow-[0_0_6px_#f97316] animate-pulse' : 'bg-slate-700'}`} />
            </div>
          </div>

          {/* Pulsing Orange Heat Aura below chamber */}
          {isHeating && (
            <div className="w-28 h-4 rounded-full bg-gradient-to-r from-orange-500/80 via-amber-400/90 to-orange-500/80 blur-[3px] -mt-1 z-0 animate-pulse" />
          )}
        </div>

        {/* BOTTOM ROW: Increase Heat (Left) & Fuel Spaceship (Right) */}
        <div className="w-full flex items-center justify-between px-3">
          {/* Bottom Left: Increase Heat */}
          <div className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${activeStation === 'HEAT' ? 'scale-115 drop-shadow-[0_0_12px_rgba(249,115,22,0.95)]' : 'opacity-85'}`}>
            <img
              src="/assets/planets/00_moon/environment/Heat.svg"
              alt="Increase Heat"
              className="w-10 h-10 object-contain"
              style={STICKER_STYLE}
            />
            <span className="font-mono text-[7.5px] font-bold text-white tracking-tight">Increase Heat</span>
          </div>

          {/* Bottom Right: Fuel Spaceship */}
          <div className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${activeStation === 'TANK' ? 'scale-115 drop-shadow-[0_0_12px_rgba(16,185,129,0.95)]' : 'opacity-85'}`}>
            <img
              src="/assets/global/ui/Checkpoint.svg"
              alt="Fuel Spaceship"
              className="w-10 h-10 object-contain"
              style={STICKER_STYLE}
            />
            <span className="font-mono text-[7.5px] font-bold text-white tracking-tight">Fuel Spaceship</span>
          </div>
        </div>

        {/* Real Nova Operator Avatar */}
        <div
          className="absolute z-30 pointer-events-none transition-all duration-700 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={getNovaPos()}
        >
          <img
            src="/assets/global/npcs/Nova Idle.svg"
            alt="Nova"
            className="w-9 h-9 object-contain"
            style={STICKER_STYLE}
          />
          <span className="text-[6.5px] font-mono font-bold text-purple-200 bg-black/80 px-1 rounded border border-purple-400/40">
            Nova
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2.1: Start the Process
 * Add Solution, Increase Heat, repeat 5 times [Mix Solution]
 */
export function MoonLevel3Sec2Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        @keyframes stirRod {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          50% { transform: translateX(calc(-50% + 5px)) rotate(12deg); }
        }
      `}</style>

      {/* LEFT PANE: Starting Sequence Blocks */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-purple-300/70 uppercase tracking-wider">BLOCKS</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-col gap-1 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          {/* Start Block */}
          <div className="h-5.5 bg-[#ef4444] text-white text-[9px] font-bold px-2 rounded-t flex items-center gap-1.5 shadow border-t border-x border-red-300/40 w-[155px]">
            <Play size={8} fill="white" />
            <span>Start</span>
          </div>

          {/* Add Solution (#06B6D4) */}
          <div className="h-5 bg-[#06b6d4] text-white text-[8px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow w-[155px]">
            <span>Add Solution</span>
            <span className="text-[7px] font-mono bg-black/30 px-1 py-0.2 rounded">Vat</span>
          </div>

          {/* Increase Heat (#F97316) */}
          <div className="h-5 bg-[#f97316] text-white text-[8px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow w-[155px]">
            <span>Increase Heat</span>
            <span className="text-[7px] font-mono bg-black/30 px-1 py-0.2 rounded">Burner</span>
          </div>

          {/* Repeat 5 Times Loop (#8B5CF6) */}
          <div className="bg-[#8b5cf6] text-white text-[8px] font-bold p-1 rounded-b shadow border-t border-black/20 flex flex-col gap-0.5 w-[155px]">
            <div className="flex items-center gap-1 px-1">
              <Repeat size={9} />
              <span>repeat 5 times</span>
            </div>
            <div className="ml-2 pl-1.5 border-l-2 border-purple-300/60 py-0.5">
              {/* Mix Solution (#A855F7) */}
              <div className="h-4.5 bg-[#a855f7] text-white text-[7.5px] font-bold px-1.5 rounded flex items-center justify-between">
                <span>Mix Solution</span>
                <span className="text-[6.5px] font-mono bg-black/30 px-1 py-0.2 rounded">Stir</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-1 z-20 border-t border-white/5 bg-[#120524]">
          <span className="text-[8px] font-mono text-purple-300/80">
            Order: Add Solution → Increase Heat → Repeat 5 [Mix]
          </span>
        </div>
      </div>

      {/* RIGHT PANE: Real Fuel Synthesis Simulation */}
      <div className="w-1/2 h-full">
        <FuelLabRoomDisplay
          activeStation="MIX"
          liquidColor="Grey"
          isHeating={true}
          isMixing={true}
          novaNode="MIX"
        />
      </div>
    </div>
  );
}

/**
 * Slide 2.2: What to Do If Mixture Turns Blue
 * if Color is Blue -> Increase Heat + Mix Solution
 */
export function MoonLevel3Sec2Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        @keyframes stirRod {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          50% { transform: translateX(calc(-50% + 5px)) rotate(12deg); }
        }
      `}</style>

      {/* LEFT PANE: Conditional Logic */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-blue-400 uppercase tracking-wider">IF CONDITION</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          {/* If Block (#3B82F6) */}
          <div className="bg-[#3b82f6] text-white text-[8px] font-bold p-1.5 rounded shadow flex flex-col gap-1 w-[165px]">
            <div className="flex items-center gap-1.5 px-0.5">
              <span>if</span>
              <div className="bg-[#06b6d4] text-[7.5px] px-1.5 py-0.5 rounded text-white font-mono flex items-center gap-1">
                <span>Color is</span>
                <span className="bg-[#1d4ed8] px-1 rounded text-[7px] text-blue-200 font-bold">Blue</span>
              </div>
            </div>
            {/* Inside If */}
            <div className="ml-2 pl-1.5 border-l-2 border-blue-200/60 flex flex-col gap-1 py-0.5">
              <div className="h-4.5 bg-[#f97316] text-white text-[7.5px] font-bold px-1.5 rounded flex items-center justify-between">
                <span>Increase Heat</span>
                <span className="text-[6.5px] font-mono bg-black/30 px-1 py-0.2 rounded">+Burner</span>
              </div>
              <div className="h-4.5 bg-[#a855f7] text-white text-[7.5px] font-bold px-1.5 rounded flex items-center justify-between">
                <span>Mix Solution</span>
                <span className="text-[6.5px] font-mono bg-black/30 px-1 py-0.2 rounded">Stir</span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/40 text-[7.5px] text-blue-200 leading-relaxed font-sans">
            Blue fuel is unrefined! When detected, applying heat and mixing refines it into stabilized <strong className="text-amber-400">Orange</strong> fuel.
          </div>
        </div>

        <div className="text-center py-1 z-20 border-t border-white/5 bg-[#120524]">
          <span className="text-[8px] font-mono text-cyan-300">
            Blue Fuel → Increase Heat & Mix → Turns Orange
          </span>
        </div>
      </div>

      {/* RIGHT PANE: Liquid Refining in Lab */}
      <div className="w-1/2 h-full">
        <FuelLabRoomDisplay
          activeStation="HEAT"
          liquidColor="Orange"
          isHeating={true}
          isMixing={false}
          novaNode="HEAT"
        />
      </div>
    </div>
  );
}

/**
 * Slide 2.3: Transfer to Spaceship Tank & Finish
 * Put into Fuel Tank / Fuel Spaceship + snap End block across all 3 batches
 */
export function MoonLevel3Sec2Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        @keyframes dragEndTank {
          0%, 15% { transform: translate(-30px, 20px); opacity: 0.7; }
          32%, 85% { transform: translate(0px, 0px); opacity: 1; }
          95%, 100% { transform: translate(-30px, 20px); opacity: 0.7; }
        }
        @keyframes cursorEndTank {
          0%, 15% { transform: translate(-30px, 20px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          40%, 85% { transform: translate(15px, 15px); opacity: 0; }
          95%, 100% { transform: translate(-30px, 20px); opacity: 1; }
        }
      `}</style>

      {/* LEFT PANE: Full Batch Sequence with End block */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">FUEL TANK</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-col gap-1.5 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          {/* Fuel Spaceship Action (#10B981) */}
          <div className="h-5.5 bg-[#10b981] text-white text-[8.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-emerald-300/40 w-[155px]">
            <span>Fuel Spaceship</span>
            <span className="text-[7px] font-mono bg-black/30 px-1 py-0.2 rounded">Pump</span>
          </div>

          {/* End Block Snapping */}
          <div
            className="relative h-5.5 bg-[#ef4444] text-white text-[9px] font-black px-2 rounded-b flex items-center gap-1.5 shadow-xl border-t border-black/20 w-[155px]"
            style={{ animation: 'dragEndTank 4.5s ease-in-out infinite' }}
          >
            <span className="w-1.5 h-1.5 rounded-sm bg-white" />
            <span>End</span>

            <div
              className="absolute -right-1 -top-1 z-30"
              style={{ animation: 'cursorEndTank 4.5s ease-in-out infinite' }}
            >
              <CursorPointer />
            </div>
          </div>

          <div className="mt-auto p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-[7.5px] text-emerald-200 leading-relaxed font-sans">
            Repeat for all 3 batches. Once stabilized orange, route to the spaceship tank and snap the <strong className="text-white">End</strong> block!
          </div>
        </div>

        <div className="text-center py-1 z-20 border-t border-white/5 bg-[#120524]">
          <span className="text-[8px] font-mono text-emerald-400">
            Fuel Spaceship → Complete All 3 Batches → Snap End
          </span>
        </div>
      </div>

      {/* RIGHT PANE: Real Fuel Spaceship Station with Checkmark */}
      <div className="w-1/2 h-full">
        <FuelLabRoomDisplay
          activeStation="TANK"
          liquidColor="Orange"
          isHeating={false}
          isMixing={false}
          novaNode="TANK"
          batchSuccess={true}
          customCenterOverlay={
            <div className="absolute -top-7 z-30 px-2 py-0.5 rounded-full bg-emerald-500 text-black font-mono font-black text-[7.5px] uppercase tracking-wider shadow-[0_0_12px_#10b981] animate-bounce">
              BATCH COMPLETE!
            </div>
          }
        />
      </div>
    </div>
  );
}

// =============================================================================
// SET 3: SECTION 3 (FLIGHT SIMULATION - 5 SCENARIOS)
// Faithfully matching FlightSimulation.tsx with real SVG assets:
// Spaceship Section 3.svg, Meteor Small.svg, Meteor Big.svg, UFO.svg, Explosion.svg, Mars.svg
// =============================================================================

interface FlightLaneDisplayProps {
  scenario: 'SMALL_ASTEROID' | 'BIG_ASTEROID' | 'FRIENDLY_UFO' | 'RESOURCES' | 'MARS_ARRIVAL';
  radarTitle: string;
  laneAlertBadge?: React.ReactNode;
  footerNote: string;
}

function FlightLaneDisplay({
  scenario,
  radarTitle,
  laneAlertBadge,
  footerNote,
}: FlightLaneDisplayProps) {
  return (
    <div className="w-full h-full flex flex-col bg-[#0b0314] relative justify-between p-2 sm:p-2.5 overflow-hidden select-none border-l border-white/10">
      <style>{`
        @keyframes laserBeamShot {
          0%, 24% { opacity: 0; width: 0px; }
          28%, 46% { opacity: 1; width: 110px; }
          50%, 100% { opacity: 0; width: 110px; }
        }
        @keyframes smallMeteorFlight {
          0% { transform: translateX(80px) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          42% { transform: translateX(-15px) rotate(-160deg); opacity: 1; }
          45%, 100% { transform: translateX(-15px) rotate(-160deg); opacity: 0; }
        }
        @keyframes meteorExplosion {
          0%, 42% { transform: scale(0.2); opacity: 0; }
          46% { transform: scale(1.25); opacity: 1; }
          58% { transform: scale(1.4); opacity: 0.85; }
          68%, 100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes bigMeteorFlight {
          0% { transform: translateX(95px) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          38% { transform: translateX(0px) rotate(-75deg); opacity: 1; }
          48% { transform: translate(45px, -30px) rotate(-30deg); opacity: 0.8; }
          62%, 100% { transform: translate(90px, -55px) rotate(15deg); opacity: 0; }
        }
        @keyframes shieldDeflectPulse {
          0%, 25% { transform: scale(0.7); opacity: 0; }
          30% { transform: scale(1.05); opacity: 0.7; }
          38%, 46% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 16px #22d3ee); }
          58% { transform: scale(1); opacity: 0.6; }
          72%, 100% { transform: scale(0.7); opacity: 0; }
        }
        @keyframes ufoFlightIn {
          0% { transform: translateX(85px); opacity: 0; }
          22%, 75% { transform: translateX(0px); opacity: 1; }
          88%, 100% { transform: translate(-80px, -30px) scale(0.6); opacity: 0; }
        }
        @keyframes ufoSpeechFloat {
          0%, 22% { opacity: 0; transform: translateY(4px) scale(0.9); }
          26%, 58% { opacity: 1; transform: translateY(0px) scale(1); }
          64%, 100% { opacity: 0; transform: translateY(-4px) scale(0.9); }
        }
        @keyframes shipSpeechFloat {
          0%, 46% { opacity: 0; transform: translateY(4px) scale(0.9); }
          50%, 78% { opacity: 1; transform: translateY(0px) scale(1); }
          82%, 100% { opacity: 0; transform: translateY(-4px) scale(0.9); }
        }
        @keyframes fuelRefillGauge {
          0%, 25% { width: 18%; background-color: #ef4444; }
          35%, 100% { width: 100%; background-color: #f59e0b; }
        }
        @keyframes oxygenRefillGauge {
          0%, 55% { width: 100%; background-color: #06b6d4; }
          60%, 75% { width: 16%; background-color: #ef4444; }
          85%, 100% { width: 100%; background-color: #06b6d4; }
        }
        @keyframes fuelPopVapor {
          0%, 25% { opacity: 0; transform: translateY(4px) scale(0.7); }
          30%, 48% { opacity: 1; transform: translateY(-8px) scale(1); }
          54%, 100% { opacity: 0; transform: translateY(-14px) scale(0.8); }
        }
        @keyframes oxygenPopVapor {
          0%, 65% { opacity: 0; transform: translateY(4px) scale(0.7); }
          70%, 88% { opacity: 1; transform: translateY(-8px) scale(1); }
          94%, 100% { opacity: 0; transform: translateY(-14px) scale(0.8); }
        }
        @keyframes marsGlideIn {
          0% { transform: translateX(65px); opacity: 0.5; }
          35%, 100% { transform: translateX(0px); opacity: 1; }
        }
        @keyframes shipDockGlide {
          0% { transform: translateX(0px); }
          45%, 100% { transform: translateX(50px); }
        }
        @keyframes beaconDockPop {
          0%, 40% { opacity: 0; transform: translateY(5px) scale(0.85); }
          48%, 100% { opacity: 1; transform: translateY(0px) scale(1); }
        }
      `}</style>

      {/* Top Cockpit HUD with Radar Title and Resource Gauges */}
      <div className="h-6 px-2.5 bg-[#170529] border border-white/10 rounded-md flex items-center justify-between shrink-0 mb-1 z-30">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-ping" />
          <span className="text-[9px] font-black tracking-wider uppercase font-mono text-purple-200">
            {radarTitle}
          </span>
        </div>

        {/* Right Resource Gauges */}
        <div className="flex items-center gap-2">
          {/* Fuel */}
          <div className="flex items-center gap-1">
            <Flame size={10} className="text-amber-400 fill-amber-400" />
            <div className="w-10 sm:w-12 h-1.5 bg-black/70 rounded-full overflow-hidden border border-white/10 p-0.2">
              <div
                className={`h-full rounded-full ${
                  scenario === 'RESOURCES'
                    ? ''
                    : 'w-full bg-gradient-to-r from-amber-400 to-yellow-400 shadow-[0_0_6px_#f59e0b]'
                }`}
                style={
                  scenario === 'RESOURCES'
                    ? { animation: 'fuelRefillGauge 6s ease-in-out infinite' }
                    : undefined
                }
              />
            </div>
            <span className="text-[7.5px] font-mono font-bold text-amber-300">
              {scenario === 'RESOURCES' ? 'REF' : '100%'}
            </span>
          </div>

          {/* Oxygen */}
          <div className="flex items-center gap-1">
            <Wind size={10} className="text-cyan-400" />
            <div className="w-10 sm:w-12 h-1.5 bg-black/70 rounded-full overflow-hidden border border-white/10 p-0.2">
              <div
                className={`h-full rounded-full ${
                  scenario === 'RESOURCES'
                    ? ''
                    : 'w-full bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_6px_#06b6d4]'
                }`}
                style={
                  scenario === 'RESOURCES'
                    ? { animation: 'oxygenRefillGauge 6s ease-in-out infinite' }
                    : undefined
                }
              />
            </div>
            <span className="text-[7.5px] font-mono font-bold text-cyan-300">
              {scenario === 'RESOURCES' ? 'O2' : '100%'}
            </span>
          </div>
        </div>
      </div>

      {/* 5-Lane Playfield */}
      <div className="flex-1 relative w-full flex flex-col justify-between overflow-hidden rounded-md border border-white/5 bg-[#080210]">
        {/* Stars Background */}
        <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:14px_14px] opacity-20 pointer-events-none" />

        {/* 5 Horizontal Lanes Dotted Dividers */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-1">
          <div className="w-full border-b border-dashed border-white/5" />
          <div className="w-full border-b border-dashed border-white/5" />
          <div className="w-full border-b border-dashed border-white/5" />
          <div className="w-full border-b border-dashed border-white/5" />
        </div>

        {/* Right Lane Alert Badge */}
        {laneAlertBadge && (
          <div className="absolute top-2 right-2 z-30">
            {laneAlertBadge}
          </div>
        )}

        {/* Active Scenario Elements */}
        <div className="relative w-full h-full flex items-center px-4">
          {/* PLAYER SPACESHIP (Lane 2 - Center) */}
          <div
            className="absolute left-4 z-20 flex items-center"
            style={
              scenario === 'MARS_ARRIVAL'
                ? { animation: 'shipDockGlide 6s ease-out infinite' }
                : undefined
            }
          >
            <div className="relative flex items-center justify-center">
              {/* Thruster Flames */}
              <div className="absolute -left-2.5 w-5 h-2.5 bg-gradient-to-l from-orange-400 via-yellow-300 to-transparent rounded-full blur-[0.5px] animate-pulse" />
              <div className="absolute -left-4 w-4 h-1.5 bg-gradient-to-l from-cyan-400 to-transparent rounded-full blur-[0.5px]" />

              {/* Spaceship SVG */}
              <img
                src="/assets/planets/00_moon/level_1/Spaceship Section 3.svg"
                alt="Starship"
                className="w-13 h-13 object-contain drop-shadow-[0_0_12px_rgba(255,145,45,0.8)]"
              />

              {/* Laser Beam FX (Scenario 1) */}
              {scenario === 'SMALL_ASTEROID' && (
                <div
                  className="absolute left-full top-1/2 -translate-y-1/2 h-3.5 z-30 pointer-events-none flex items-center"
                  style={{ animation: 'laserBeamShot 4.5s ease-out infinite' }}
                >
                  <div className="w-full h-2.5 bg-gradient-to-r from-red-500 via-rose-300 to-transparent rounded-full shadow-[0_0_16px_#ef4444]" />
                  <div className="absolute inset-x-0 h-1 top-1 bg-white rounded-full blur-[0.3px]" />
                </div>
              )}

              {/* Energy Shield FX (Scenario 2) */}
              {scenario === 'BIG_ASTEROID' && (
                <div
                  className="absolute -inset-2.5 rounded-full border-2 border-cyan-300 bg-cyan-500/25 shadow-[0_0_24px_rgba(6,182,212,0.95)] z-30 pointer-events-none flex items-center justify-center"
                  style={{ animation: 'shieldDeflectPulse 4.5s ease-out infinite' }}
                >
                  <div className="w-full h-full rounded-full border border-sky-200/60 animate-spin" />
                </div>
              )}

              {/* Ship Dialogue Bubble (Scenario 3) */}
              {scenario === 'FRIENDLY_UFO' && (
                <div
                  className="absolute -top-7 left-1/2 -translate-x-1/2 z-40 pointer-events-none whitespace-nowrap"
                  style={{ animation: 'shipSpeechFloat 5s ease-in-out infinite' }}
                >
                  <div className="px-2 py-0.5 rounded-lg bg-[#1d0b36]/95 border border-pink-400 text-pink-200 text-[8px] font-semibold shadow-[0_0_10px_rgba(236,72,153,0.7)]">
                    Hello friend! Resuming warp flight.
                  </div>
                </div>
              )}

              {/* +100% FUEL Pop Vapor (Scenario 4) */}
              {scenario === 'RESOURCES' && (
                <div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-black font-mono font-black text-[7.5px] uppercase tracking-wider shadow-[0_0_12px_#f59e0b] z-30 whitespace-nowrap pointer-events-none"
                  style={{ animation: 'fuelPopVapor 6s ease-in-out infinite' }}
                >
                  +100% FUEL
                </div>
              )}

              {/* +100% OXYGEN Pop Vapor (Scenario 4) */}
              {scenario === 'RESOURCES' && (
                <div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-cyan-500 text-black font-mono font-black text-[7.5px] uppercase tracking-wider shadow-[0_0_12px_#06b6d4] z-30 whitespace-nowrap pointer-events-none"
                  style={{ animation: 'oxygenPopVapor 6s ease-in-out infinite' }}
                >
                  +100% OXYGEN
                </div>
              )}
            </div>
          </div>

          {/* SCENARIO 1: Small Asteroid + Explosion */}
          {scenario === 'SMALL_ASTEROID' && (
            <div className="absolute right-10 z-20 flex items-center justify-center">
              {/* Incoming Meteor Small */}
              <div style={{ animation: 'smallMeteorFlight 4.5s ease-out infinite' }}>
                <img
                  src="/assets/planets/00_moon/environment/Meteor Small.svg"
                  alt="Small Asteroid"
                  className="w-10 h-10 object-contain drop-shadow-[0_0_14px_rgba(249,115,22,0.9)]"
                />
              </div>

              {/* Explosion */}
              <div
                className="absolute z-30 pointer-events-none"
                style={{ animation: 'meteorExplosion 4.5s ease-out infinite' }}
              >
                <img
                  src="/assets/planets/00_moon/environment/Explosion.svg"
                  alt="Explosion"
                  className="w-18 h-18 object-contain drop-shadow-[0_0_24px_rgba(239,68,68,0.95)]"
                />
              </div>
            </div>
          )}

          {/* SCENARIO 2: Big Asteroid with Blazing Plasma Wake */}
          {scenario === 'BIG_ASTEROID' && (
            <div className="absolute right-8 z-20 flex items-center justify-center">
              <div
                className="relative flex items-center"
                style={{ animation: 'bigMeteorFlight 4.5s ease-out infinite' }}
              >
                {/* Blazing Fiery Wake */}
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-28 h-14 bg-gradient-to-r from-rose-600/80 via-orange-500/60 to-transparent rounded-full blur-md pointer-events-none" />

                <img
                  src="/assets/planets/00_moon/environment/Meteor Big.svg"
                  alt="Big Asteroid"
                  className="w-14 h-14 object-contain drop-shadow-[0_0_25px_rgba(244,63,94,0.95)] relative z-10"
                />
              </div>
            </div>
          )}

          {/* SCENARIO 3: Friendly UFO with Emerald Aura & Speech Bubble */}
          {scenario === 'FRIENDLY_UFO' && (
            <div
              className="absolute right-8 z-20 flex items-center justify-center"
              style={{ animation: 'ufoFlightIn 5s ease-in-out infinite' }}
            >
              <div className="relative flex items-center justify-center">
                {/* Emerald Signal Aura */}
                <div className="absolute -inset-2 rounded-full bg-emerald-400/25 blur-sm animate-ping" />

                <img
                  src="/assets/planets/00_moon/level_1/UFO.svg"
                  alt="Friendly UFO"
                  className="w-13 h-13 object-contain drop-shadow-[0_0_18px_rgba(34,197,94,0.95)] animate-bounce"
                />

                {/* UFO Speech Bubble */}
                <div
                  className="absolute -top-7 left-1/2 -translate-x-1/2 z-40 pointer-events-none whitespace-nowrap"
                  style={{ animation: 'ufoSpeechFloat 5s ease-in-out infinite' }}
                >
                  <div className="px-2 py-0.5 rounded-lg bg-[#092419]/95 border border-emerald-400 text-emerald-200 text-[8px] font-semibold shadow-[0_0_10px_rgba(16,185,129,0.7)]">
                    Peaceful greetings, Starship Nova!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCENARIO 5: Mars Destination Orbit Docking */}
          {scenario === 'MARS_ARRIVAL' && (
            <div
              className="absolute right-2 z-15 flex items-center justify-center"
              style={{ animation: 'marsGlideIn 6s ease-out infinite' }}
            >
              <div className="relative flex items-center justify-center">
                {/* Atmospheric Glow Ring */}
                <div className="absolute -inset-6 rounded-full bg-radial from-orange-500/25 to-transparent blur-xl animate-pulse" />

                <img
                  src="/assets/planets/celestial/Mars.svg"
                  alt="Mars Destination"
                  className="w-22 h-22 object-contain drop-shadow-[0_0_30px_rgba(249,115,22,0.85)]"
                />

                {/* Orbit Docked Beacon */}
                <div
                  className="absolute -top-7 px-2.5 py-0.5 rounded-full bg-emerald-600/95 border border-emerald-300 text-white font-mono font-black text-[7.5px] uppercase tracking-wider shadow-[0_0_14px_#10b981] whitespace-nowrap pointer-events-none"
                  style={{ animation: 'beaconDockPop 6s ease-out infinite' }}
                >
                  Orbit Reached - Docked!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Simulation Note */}
      <div className="text-center py-1 shrink-0 z-20">
        <span className="text-[8.5px] font-mono text-purple-200">
          {footerNote}
        </span>
      </div>
    </div>
  );
}

/**
 * Slide 3.1: Small Asteroid -> Fire Lasers
 */
export function MoonLevel3Sec3Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      {/* LEFT PANE: Case Small Asteroid -> Fire Lasers */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-blue-400 uppercase tracking-wider">
            CASE BLOCK
          </span>
        </div>

        <div
          className="flex-1 p-3 flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          {/* Authentic Blockly Case Block */}
          <div className="flex flex-col w-[170px]">
            {/* Case Header */}
            <div className="h-6 bg-[#3B82F6] text-white text-[8.5px] font-bold px-2 rounded-t-lg flex items-center justify-between shadow border-t border-x border-blue-400/50">
              <span>Case</span>
              <span className="bg-[#1E40AF] px-1.5 py-0.5 rounded font-mono text-[7.5px] text-white border border-blue-300/40">
                Small Asteroid
              </span>
            </div>

            {/* Statement Indentation Slot */}
            <div className="bg-[#3B82F6] pl-2.5 pr-1 py-1 rounded-b-lg border-b border-x border-blue-400/50 shadow">
              <div className="h-5 bg-[#EC4899] text-white text-[8px] font-bold px-2 rounded flex items-center justify-between shadow border border-pink-400/60">
                <span>Fire Lasers</span>
                <span className="text-[7px] font-mono bg-black/30 px-1 rounded">Twin Beams</span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-blue-950/40 border border-blue-500/40 text-[8px] text-blue-200 leading-tight">
            Small asteroids threaten ship integrity! Connect <span className="font-bold text-pink-300">Fire Lasers</span> inside the <span className="font-bold text-blue-300">Case Small Asteroid</span> block.
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Flight Lane Display */}
      <div className="w-1/2 h-full">
        <FlightLaneDisplay
          scenario="SMALL_ASTEROID"
          radarTitle="RADAR: SMALL ASTEROID"
          laneAlertBadge={
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600/95 border border-rose-300 text-white font-mono font-black text-[8px] uppercase tracking-wider shadow-[0_0_16px_#f43f5e] animate-pulse">
              <AlertTriangle size={12} className="text-amber-300 shrink-0" />
              <span>WARNING: INCOMING !</span>
            </div>
          }
          footerNote="Fire lasers to vaporize incoming small asteroids immediately"
        />
      </div>
    </div>
  );
}

/**
 * Slide 3.2: Big Asteroid -> Activate Shield
 */
export function MoonLevel3Sec3Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      {/* LEFT PANE: Case Big Asteroid -> Activate Shield */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-blue-400 uppercase tracking-wider">
            CASE BLOCK
          </span>
        </div>

        <div
          className="flex-1 p-3 flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          {/* Authentic Blockly Case Block */}
          <div className="flex flex-col w-[170px]">
            {/* Case Header */}
            <div className="h-6 bg-[#3B82F6] text-white text-[8.5px] font-bold px-2 rounded-t-lg flex items-center justify-between shadow border-t border-x border-blue-400/50">
              <span>Case</span>
              <span className="bg-[#1E40AF] px-1.5 py-0.5 rounded font-mono text-[7.5px] text-white border border-blue-300/40">
                Big Asteroid
              </span>
            </div>

            {/* Statement Indentation Slot */}
            <div className="bg-[#3B82F6] pl-2.5 pr-1 py-1 rounded-b-lg border-b border-x border-blue-400/50 shadow">
              <div className="h-5 bg-[#EC4899] text-white text-[8px] font-bold px-2 rounded flex items-center justify-between shadow border border-pink-400/60">
                <span>Activate Shield</span>
                <span className="text-[7px] font-mono bg-black/30 px-1 rounded">Deflect</span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-blue-950/40 border border-blue-500/40 text-[8px] text-blue-200 leading-tight">
            Massive asteroids are too dense for lasers! Raise the <span className="font-bold text-pink-300">Activate Shield</span> to deflect the impact safely.
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Flight Lane Display */}
      <div className="w-1/2 h-full">
        <FlightLaneDisplay
          scenario="BIG_ASTEROID"
          radarTitle="RADAR: MASSIVE ASTEROID"
          laneAlertBadge={
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600/95 border border-rose-300 text-white font-mono font-black text-[8px] uppercase tracking-wider shadow-[0_0_16px_#f43f5e] animate-pulse">
              <AlertTriangle size={12} className="text-amber-300 shrink-0" />
              <span>WARNING: MASSIVE ASTEROID !</span>
            </div>
          }
          footerNote="Activate energy shield to deflect kinetic asteroid impacts"
        />
      </div>
    </div>
  );
}

/**
 * Slide 3.3: Friendly UFO -> Greet Protocol
 */
export function MoonLevel3Sec3Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      {/* LEFT PANE: Case Friendly UFO -> Stop -> Greet -> Launch */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
            COMMS SEQUENCE
          </span>
        </div>

        <div
          className="flex-1 p-3 flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          {/* Authentic Blockly Case Block with 3 stacked actions */}
          <div className="flex flex-col w-[170px]">
            {/* Case Header */}
            <div className="h-6 bg-[#3B82F6] text-white text-[8.5px] font-bold px-2 rounded-t-lg flex items-center justify-between shadow border-t border-x border-blue-400/50">
              <span>Case</span>
              <span className="bg-[#1E40AF] px-1.5 py-0.5 rounded font-mono text-[7.5px] text-white border border-blue-300/40">
                Friendly UFO
              </span>
            </div>

            {/* Statement Indentation Slot with 3 chained actions */}
            <div className="bg-[#3B82F6] pl-2.5 pr-1 py-1 rounded-b-lg border-b border-x border-blue-400/50 shadow flex flex-col gap-0.5">
              <div className="h-4.5 bg-[#EC4899] text-white text-[7.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-pink-400/60">
                <span>Stop Rocket</span>
                <span className="text-[6.5px] font-mono bg-black/30 px-1 rounded">Halt</span>
              </div>
              <div className="h-4.5 bg-[#EC4899] text-white text-[7.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-pink-400/60">
                <span>Greet UFO</span>
                <span className="text-[6.5px] font-mono bg-black/30 px-1 rounded">Signal</span>
              </div>
              <div className="h-4.5 bg-[#EC4899] text-white text-[7.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-pink-400/60">
                <span>Launch Rocket</span>
                <span className="text-[6.5px] font-mono bg-black/30 px-1 rounded">Resume</span>
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-[8px] text-emerald-200 leading-tight">
            Peaceful contact! <span className="font-bold text-pink-300">Stop Rocket</span> first, broadcast <span className="font-bold text-pink-300">Greet UFO</span>, then <span className="font-bold text-pink-300">Launch Rocket</span> again to continue!
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Flight Lane Display */}
      <div className="w-1/2 h-full">
        <FlightLaneDisplay
          scenario="FRIENDLY_UFO"
          radarTitle="RADAR: ALIEN ENCOUNTER"
          laneAlertBadge={
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/95 border border-emerald-300 text-white font-mono font-black text-[8px] uppercase tracking-wider shadow-[0_0_16px_#10b981] animate-pulse">
              <Radio size={12} className="text-emerald-200 shrink-0 animate-pulse" />
              <span>FRIENDLY UFO ENCOUNTER !</span>
            </div>
          }
          footerNote="Stop to exchange friendly greetings before resuming warp flight"
        />
      </div>
    </div>
  );
}

/**
 * Slide 3.4: Resource Replenishment -> Refill Fuel & Pump Oxygen
 */
export function MoonLevel3Sec3Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      {/* LEFT PANE: Case Fuel < 20% & Oxygen < 20% */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-amber-400 uppercase tracking-wider">
            LIFE SUPPORT
          </span>
        </div>

        <div
          className="flex-1 p-3 flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          {/* Two Case Blocks: Fuel & Oxygen */}
          <div className="flex flex-col gap-1.5 w-[170px]">
            {/* Case Fuel < 20% */}
            <div className="flex flex-col">
              <div className="h-5 bg-[#3B82F6] text-white text-[8px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-blue-400/50">
                <span>Case</span>
                <span className="bg-[#1E40AF] px-1 py-0.2 rounded font-mono text-[7px] text-white">
                  Fuel &lt; 20%
                </span>
              </div>
              <div className="bg-[#3B82F6] pl-2.5 pr-1 py-0.5 rounded-b border-b border-x border-blue-400/50 shadow">
                <div className="h-4.5 bg-[#EC4899] text-white text-[7.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-pink-400/60">
                  <span>Refill Fuel Cells</span>
                  <span className="text-[6.5px] font-mono bg-black/30 px-1 rounded">+100%</span>
                </div>
              </div>
            </div>

            {/* Case Oxygen < 20% */}
            <div className="flex flex-col">
              <div className="h-5 bg-[#3B82F6] text-white text-[8px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-blue-400/50">
                <span>Case</span>
                <span className="bg-[#1E40AF] px-1 py-0.2 rounded font-mono text-[7px] text-white">
                  Oxygen &lt; 20%
                </span>
              </div>
              <div className="bg-[#3B82F6] pl-2.5 pr-1 py-0.5 rounded-b border-b border-x border-blue-400/50 shadow">
                <div className="h-4.5 bg-[#EC4899] text-white text-[7.5px] font-bold px-2 rounded flex items-center justify-between shadow border border-pink-400/60">
                  <span>Pump Oxygen</span>
                  <span className="text-[6.5px] font-mono bg-black/30 px-1 rounded">+100%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-amber-950/40 border border-amber-500/40 text-[8px] text-amber-200 leading-tight">
            Never let Fuel or Oxygen drop to 0%! Refill with <span className="font-bold text-pink-300">Refill Fuel Cells</span> and <span className="font-bold text-pink-300">Pump Oxygen</span> immediately.
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Flight Lane Display */}
      <div className="w-1/2 h-full">
        <FlightLaneDisplay
          scenario="RESOURCES"
          radarTitle="LIFE SUPPORT GAUGES"
          laneAlertBadge={
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600/95 border border-amber-300 text-white font-mono font-black text-[8px] uppercase tracking-wider shadow-[0_0_16px_#f59e0b] animate-pulse">
              <Zap size={12} className="text-yellow-200 shrink-0" />
              <span>REFILL ACTIVE</span>
            </div>
          }
          footerNote="Replenish draining fuel and oxygen reserves before they deplete"
        />
      </div>
    </div>
  );
}

/**
 * Slide 3.5: Master Flight Protocol & Snap 'End' Block
 */
export function MoonLevel3Sec3Step5Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none">
      <style>{`
        @keyframes dragEndFlightFinal {
          0%, 15% { transform: translate(-45px, 15px); opacity: 0.7; }
          32%, 85% { transform: translate(0px, 0px); opacity: 1; }
          95%, 100% { transform: translate(-45px, 15px); opacity: 0.7; }
        }
        @keyframes cursorEndFlightFinal {
          0%, 15% { transform: translate(-45px, 15px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          40%, 85% { transform: translate(12px, 12px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 15px); opacity: 1; }
        }
      `}</style>

      {/* LEFT PANE: Full Protocol Snapping End */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
          <span className="text-[8.5px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
            COMPLETE PROGRAM
          </span>
        </div>

        <div
          className="flex-1 p-3 flex flex-col justify-between relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          {/* Full Protocol Stack */}
          <div className="flex flex-col gap-1 w-[165px]">
            {/* Start Block */}
            <div className="h-5 bg-[#EF4444] text-white text-[8.5px] font-bold px-2 rounded-t flex items-center gap-1 shadow">
              <Play size={8} fill="white" />
              <span>Start</span>
            </div>

            {/* Launch Rocket */}
            <div className="h-4.5 bg-[#EC4899] text-white text-[7.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Launch Rocket</span>
              <span className="text-[6.5px] font-mono bg-black/30 px-1 rounded">Ignite</span>
            </div>

            {/* All 5 Case Handlers Summary */}
            <div className="h-5 bg-[#3B82F6] text-white text-[7.5px] font-bold px-2 flex items-center justify-between shadow border-t border-black/20">
              <span>Case Handlers (All 5 Events)...</span>
            </div>

            {/* Snapping End Block */}
            <div
              className="relative h-5.5 bg-[#EF4444] text-white text-[9px] font-black px-2 rounded-b flex items-center gap-1.5 shadow-xl border-t border-black/20"
              style={{ animation: 'dragEndFlightFinal 4.5s ease-in-out infinite' }}
            >
              <span className="w-1.5 h-1.5 rounded-sm bg-white" />
              <span>End</span>

              <div
                className="absolute -right-1 -top-1 z-30"
                style={{ animation: 'cursorEndFlightFinal 4.5s ease-in-out infinite' }}
              >
                <CursorPointer />
              </div>
            </div>
          </div>

          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-[8px] text-emerald-200 leading-tight">
            Connect the <span className="font-bold text-red-400">End</span> block to complete the starship flight protocol and guide your ship safely to Mars!
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Flight Lane Display - Mars Docking */}
      <div className="w-1/2 h-full">
        <FlightLaneDisplay
          scenario="MARS_ARRIVAL"
          radarTitle="DESTINATION: MARS"
          laneAlertBadge={
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600/95 border border-emerald-300 text-white font-mono font-black text-[8px] uppercase tracking-wider shadow-[0_0_16px_#10b981] animate-pulse">
              <CheckCircle2 size={12} className="text-emerald-200 shrink-0" />
              <span>MISSION ACCOMPLISHED</span>
            </div>
          }
          footerNote="Dock starship into Mars orbit to clear Moon Level 3"
        />
      </div>
    </div>
  );
}
