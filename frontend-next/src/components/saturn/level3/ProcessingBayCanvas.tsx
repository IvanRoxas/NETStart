"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import DiagnosticTerminal from './DiagnosticTerminal';
import CorruptedTerminalModal from './CorruptedTerminalModal';
import {
  PointerId,
  Saturn3Scenario,
} from '@/lib/saturn/saturnLevel3Definitions';
import { Zap, Shield } from 'lucide-react';

interface ProcessingBayCanvasProps {
  currentHeap: number; // 0 to 4
  sensorAllocated: number; // 0 to 4
  debrisAllocated: number; // 0 to 4
  shieldAllocated: number; // 0 to 4
  activeArm: PointerId | null;
  armAction: 'idle' | 'allocating' | 'running' | 'deallocating' | 'crashed';
  activeTask: 'RUN_SENSORS' | 'RUN_DEBRIS' | 'RUN_SHIELDS' | null;
  tripInfo: {
    tripIndex: number;
    totalTrips: number;
    subStep: number;
    targetSlot: number;
  } | null;
  scenario: Saturn3Scenario;
  terminalReadStatus: Record<1 | 2 | 3, boolean>;
  activeTerminalModal: 1 | 2 | 3 | null;
  onOpenTerminal: (id: 1 | 2 | 3) => void;
  onCloseTerminal: () => void;
  isSimulating: boolean;
  threshold?: number;
  completedTasks?: {
    sensors: boolean;
    debris: boolean;
    shields: boolean;
  };
}

export default function ProcessingBayCanvas({
  currentHeap,
  sensorAllocated,
  debrisAllocated,
  shieldAllocated = 0,
  activeArm,
  armAction,
  activeTask,
  tripInfo,
  scenario,
  terminalReadStatus,
  activeTerminalModal,
  onOpenTerminal,
  onCloseTerminal,
  isSimulating,
  threshold = 75,
  completedTasks,
}: ProcessingBayCanvasProps) {
  const isSuccess = scenario === 'SUCCESS';
  const isOverloadCrash = scenario === 'OUT_OF_MEMORY';
  const isBreakerTrip = scenario === 'BREAKER_TRIP';
  const isCrashed =
    isOverloadCrash ||
    isBreakerTrip ||
    scenario === 'NULL_POINTER_DEREFERENCE' ||
    scenario === 'MEMORY_LEAK' ||
    scenario === 'UNDECLARED_POINTER' ||
    scenario === 'MISSING_START' ||
    scenario === 'MISSING_END';

  const hasCoresInMainframe = sensorAllocated > 0 || debrisAllocated > 0 || shieldAllocated > 0;
  const isMachineRunning =
    !isBreakerTrip &&
    !isOverloadCrash &&
    (hasCoresInMainframe || activeTask !== null || armAction === 'running') &&
    isSimulating;

  const isMemoryLeak = scenario === 'MEMORY_LEAK';

  // Live RAM pressure: climbs gradually over time (8.5 seconds to reach 100%) when machine has cores and is running
  const [displayPressure, setDisplayPressure] = useState<number>(0);
  const lastTimeRef = useRef<number | null>(null);

  // Reset pressure when idle and no cores in mainframe
  useEffect(() => {
    if (!isSimulating && !hasCoresInMainframe && scenario === 'IDLE') {
      setDisplayPressure(0);
    }
  }, [isSimulating, hasCoresInMainframe, scenario]);

  useEffect(() => {
    let animId: number;

    const update = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const dt = Math.min(100, Math.max(0, timestamp - lastTimeRef.current));
      lastTimeRef.current = timestamp;

      setDisplayPressure((prev) => {
        // If breaker tripped, machine loses all power immediately
        if (isBreakerTrip) {
          return 0;
        }

        // If overload crash / exploded, lock at 100%
        if (isOverloadCrash) {
          return 100;
        }

        // If machine has cores in mainframe: gradual pressure increase (8.5 seconds to 100%)
        if (hasCoresInMainframe) {
          const targetCap = threshold >= 100 || isCrashed ? 100 : threshold;
          if (prev < targetCap) {
            const next = prev + (dt / 8500) * 100;
            return Math.min(targetCap, next);
          }
          if (prev > targetCap) {
            return targetCap;
          }
          return prev;
        }

        // If cores were deallocated back to rack, pressure drains smoothly down to 0% over ~1.8s
        if (!hasCoresInMainframe) {
          if (prev <= 0) return 0;
          return Math.max(0, prev - (dt / 1800) * 100);
        }

        return prev;
      });

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(animId);
      lastTimeRef.current = null;
    };
  }, [hasCoresInMainframe, isSimulating, isBreakerTrip, isOverloadCrash, isCrashed, threshold]);

  // DOM Refs for dynamic, screen-accurate crane positioning without changing machine layout
  const stageRef = useRef<HTMLDivElement>(null);
  const heapRef = useRef<HTMLDivElement>(null);
  const mainframeRef = useRef<HTMLDivElement>(null);
  const heapSocketRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mainframeSlotRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Exact coordinates measured dynamically from the rendered DOM positions
  const [coords, setCoords] = useState<{
    heapSocketsX: number[];
    mainframeSlotsX: number[];
    dropDropHeight: number;
    transitHeight: number;
    idleHeight: number;
  }>({
    heapSocketsX: [50, 80, 110, 140],
    mainframeSlotsX: [250, 280, 310, 340],
    dropDropHeight: 155,
    transitHeight: 40,
    idleHeight: 20,
  });

  useEffect(() => {
    const measurePositions = () => {
      if (!stageRef.current) return;
      const stageRect = stageRef.current.getBoundingClientRect();

      const measuredHeapX: number[] = [];
      for (let i = 0; i < 4; i++) {
        const el = heapSocketRefs.current[i];
        if (el) {
          const r = el.getBoundingClientRect();
          measuredHeapX.push(r.left - stageRect.left + r.width / 2);
        } else {
          measuredHeapX.push(50 + i * 28);
        }
      }

      const measuredMainframeX: number[] = [];
      for (let i = 0; i < 4; i++) {
        const el = mainframeSlotRefs.current[i];
        if (el) {
          const r = el.getBoundingClientRect();
          measuredMainframeX.push(r.left - stageRect.left + r.width / 2);
        } else {
          measuredMainframeX.push(250 + i * 32);
        }
      }

      let dropDropHeight = 155;
      if (heapSocketRefs.current[0]) {
        const r = heapSocketRefs.current[0].getBoundingClientRect();
        const centerY = r.top - stageRect.top + r.height / 2;
        dropDropHeight = Math.max(85, centerY - 25);
      }

      setCoords({
        heapSocketsX: measuredHeapX,
        mainframeSlotsX: measuredMainframeX,
        dropDropHeight,
        transitHeight: 40,
        idleHeight: 20,
      });
    };

    measurePositions();
    const handleResize = () => measurePositions();
    window.addEventListener('resize', handleResize);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && stageRef.current) {
      ro = new ResizeObserver(() => {
        measurePositions();
      });
      ro.observe(stageRef.current);
    }

    const timeout = setTimeout(measurePositions, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  // Determine active task state for universal Mainframe slot bank
  const activeTaskType =
    activeTask === 'RUN_SHIELDS' || shieldAllocated > 0
      ? 'SHIELDS'
      : activeTask === 'RUN_DEBRIS' || debrisAllocated > 0
      ? 'DEBRIS'
      : activeTask === 'RUN_SENSORS' || sensorAllocated > 0
      ? 'SENSORS'
      : null;

  const slotsOccupied =
    activeTaskType === 'SHIELDS'
      ? shieldAllocated
      : activeTaskType === 'DEBRIS'
      ? debrisAllocated
      : activeTaskType === 'SENSORS'
      ? sensorAllocated
      : 0;

  // Kinematic calculations for each of the 3 cranes
  const getCraneKinematics = (ptr: PointerId, defaultX: number) => {
    const isActive = activeArm === ptr;
    const hasTrip = isActive && tripInfo !== null;

    if (!hasTrip) {
      return {
        left: `${defaultX}px`,
        drop: coords.idleHeight,
        isHoldingBattery: false,
        jawAngle: 24,
        isActive: false,
      };
    }

    const { subStep, targetSlot } = tripInfo;
    const safeSlot = Math.max(0, Math.min(3, targetSlot));
    const heapX = coords.heapSocketsX[safeSlot] ?? defaultX;
    const slotX = coords.mainframeSlotsX[safeSlot] ?? defaultX;

    let posX = defaultX;
    let drop = coords.idleHeight;
    let isHoldingBattery = false;
    let jawAngle = 24;

    if (armAction === 'allocating') {
      if (subStep === 1) {
        // Plunge down to Heap socket
        posX = heapX;
        drop = coords.dropDropHeight;
        isHoldingBattery = false;
        jawAngle = 4;
      } else if (subStep === 2) {
        // Clamp and hoist core up into transit
        posX = heapX;
        drop = coords.transitHeight;
        isHoldingBattery = true;
        jawAngle = 4;
      } else if (subStep === 3) {
        // Gliding across and plunging down into Mainframe slot
        posX = slotX;
        drop = coords.dropDropHeight;
        isHoldingBattery = true;
        jawAngle = 4;
      } else if (subStep === 4) {
        // Deposited into Mainframe slot, jaws releasing
        posX = slotX;
        drop = coords.dropDropHeight;
        isHoldingBattery = false;
        jawAngle = 24;
      }
    } else if (armAction === 'deallocating') {
      if (subStep === 3) {
        // Plunge down into Mainframe slot to retrieve core
        posX = slotX;
        drop = coords.dropDropHeight;
        isHoldingBattery = false;
        jawAngle = 4;
      } else if (subStep === 2) {
        // Hoist core up out of slot into transit
        posX = slotX;
        drop = coords.transitHeight;
        isHoldingBattery = true;
        jawAngle = 4;
      } else if (subStep === 1) {
        // Gliding back to Heap socket and plunging down
        posX = heapX;
        drop = coords.dropDropHeight;
        isHoldingBattery = true;
        jawAngle = 4;
      } else if (subStep === 0) {
        // Deposited into Heap socket, jaws releasing
        posX = heapX;
        drop = coords.dropDropHeight;
        isHoldingBattery = false;
        jawAngle = 24;
      }
    }

    return {
      left: `${posX}px`,
      drop,
      isHoldingBattery,
      jawAngle,
      isActive: true,
    };
  };

  const sensorCrane = getCraneKinematics('sensorPtr', coords.heapSocketsX[0] - 15);
  const shieldCrane = getCraneKinematics(
    'shieldPtr',
    (coords.heapSocketsX[3] + coords.mainframeSlotsX[0]) / 2
  );
  const debrisCrane = getCraneKinematics('debrisPtr', coords.mainframeSlotsX[3] + 15);

  // Turbine fan speed: spins rapidly while machine is running, stops when cores are taken out, machine is idle, or breaker trips
  const fanSpeedClass = isSuccess
    ? 'animate-spin [animation-duration:5s]'
    : isBreakerTrip
    ? ''
    : isOverloadCrash
    ? 'animate-spin [animation-duration:0.12s]'
    : isMachineRunning
    ? 'animate-spin [animation-duration:0.22s]'
    : '';

  // Space stars for background observation window
  const stars = useMemo(() => {
    const list = [];
    for (let i = 0; i < 48; i++) {
      const x = (i * 19.3) % 94 + 3;
      const y = (i * 29.7) % 88 + 6;
      const size = i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.8 : 1.2;
      const opacity = 0.45 + (i % 7) * 0.08;
      const delay = (i * 0.28) % 3.5;
      list.push({ id: i, x, y, size, opacity, delay });
    }
    return list;
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Space Mono', 'Courier New', Courier, monospace",
      }}
      className={`relative w-full h-full bg-[#0c121e] overflow-hidden select-none transition-all duration-700 flex flex-col justify-between border-4 ${
        isCrashed
          ? 'border-rose-950 shadow-[inset_0_0_80px_rgba(244,63,94,0.35)]'
          : isSuccess
          ? 'border-emerald-950 shadow-[inset_0_0_80px_rgba(16,185,129,0.3)]'
          : 'border-[#1b273b] shadow-[inset_0_0_80px_rgba(15,23,42,0.6)]'
      }`}
    >
      <style jsx>{`
        @keyframes machineSoftBounce {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          20% {
            transform: translateY(-2.5px) scale(1.003, 0.997);
          }
          40% {
            transform: translateY(0.5px) scale(0.998, 1.002);
          }
          60% {
            transform: translateY(-1.5px) scale(1.002, 0.998);
          }
          80% {
            transform: translateY(0px) scale(1);
          }
        }
        @keyframes heatHaze {
          0%, 100% {
            transform: translateY(0) scaleY(1);
            filter: drop-shadow(0 0 8px rgba(244, 63, 94, 0.5));
          }
          50% {
            transform: translateY(-2px) scaleY(1.02);
            filter: drop-shadow(0 0 16px rgba(244, 63, 94, 0.9));
          }
        }
        @keyframes batteryGlow {
          0%, 100% {
            filter: drop-shadow(0 0 8px #ffb366) drop-shadow(0 0 18px rgba(255, 140, 26, 0.85));
          }
          50% {
            filter: drop-shadow(0 0 14px #ffd9b3) drop-shadow(0 0 28px rgba(255, 140, 26, 1));
          }
        }
        @keyframes shieldEnergyWave {
          0%, 100% {
            opacity: 0.65;
            box-shadow: 0 0 22px rgba(16, 185, 129, 0.4), inset 0 0 18px rgba(16, 185, 129, 0.2);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.8), inset 0 0 30px rgba(16, 185, 129, 0.4);
          }
        }
        @keyframes starTwinkle {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.85);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. BRIGHTENED BACKGROUND: OBSERVATION WINDOW & ILLUMINATED BULKHEADS      */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        {/* Overhead Fluorescent Industrial Lighting Bars */}
        <div className="absolute top-0 left-1/4 w-48 h-1 bg-cyan-300 shadow-[0_0_18px_#38bdf8] rounded-full opacity-90" />
        <div className="absolute top-0 right-1/4 w-48 h-1 bg-cyan-300 shadow-[0_0_18px_#38bdf8] rounded-full opacity-90" />
        {/* Ambient Downward Lighting Glow Cone */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-cyan-400/[0.12] via-cyan-500/[0.04] to-transparent pointer-events-none" />

        {/* Illuminated Bulkhead Structural Wall */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#101828] via-[#0d1422] to-[#090e18]" />

        {/* Upper Clerestory Observation Glass Window */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[92%] max-w-3xl h-[135px] rounded-lg border-2 border-[#22334d] bg-[#070d1c] shadow-[0_0_30px_rgba(14,165,233,0.15)] overflow-hidden">
          {/* Deep Space Cosmic Gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#050a18] via-[#0a1228] to-[#120d26]" />

          {/* Celestial Nebula Dust Clouds */}
          <div className="absolute top-1 right-8 w-56 h-24 rounded-full bg-purple-600/25 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1 left-8 w-60 h-20 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

          {/* Curved Planetary Horizon / Ring Rim */}
          <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 800 135" preserveAspectRatio="none">
            <defs>
              <linearGradient id="saturnRingGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                <stop offset="40%" stopColor="#c084fc" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <path d="M -50 150 Q 400 55 850 150" fill="none" stroke="url(#saturnRingGrad)" strokeWidth="5" />
            <path d="M -50 145 Q 400 60 850 145" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
          </svg>

          {/* Twinkling Space Stars */}
          <div className="absolute inset-0 w-full h-full">
            {stars.map(star => (
              <div
                key={`star-${star.id}`}
                style={{
                  top: `${star.y}%`,
                  left: `${star.x}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  animation: `starTwinkle ${2.4 + (star.id % 3) * 0.7}s ease-in-out infinite`,
                  animationDelay: `${star.delay}s`,
                }}
                className={`absolute rounded-full ${
                  star.id % 4 === 0
                    ? 'bg-cyan-200 shadow-[0_0_6px_#67e8f9]'
                    : star.id % 6 === 0
                    ? 'bg-amber-100 shadow-[0_0_5px_#fde68a]'
                    : 'bg-white shadow-[0_0_4px_#fff]'
                }`}
              />
            ))}
          </div>

          {/* Window Dividing Struts (Mullions) */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            <div className="h-full w-2 bg-gradient-to-r from-[#141e2e] via-[#22334a] to-[#141e2e] border-r border-black/60 shadow ml-[33%]" />
            <div className="h-full w-2 bg-gradient-to-r from-[#141e2e] via-[#22334a] to-[#141e2e] border-l border-black/60 shadow mr-[33%]" />
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-gradient-to-b from-[#141e2e] via-[#22334a] to-[#141e2e] border-y border-black/60" />

          {/* Glass Reflection Highlight */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-cyan-400/[0.06] pointer-events-none" />
        </div>

        {/* Lower Reinforced Steel Bulkhead Wall */}
        <div className="absolute top-[150px] left-0 w-full h-[180px] bg-gradient-to-b from-[#141d2c] to-[#0c1320] border-t-2 border-[#202e44]">
          {/* Vertical Structural Steel Girder Columns & Rivets */}
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={`wall-rib-${i}`}
              style={{ left: `${(i + 1) * 10}%` }}
              className="absolute top-0 bottom-0 w-1 bg-black/40 border-r border-white/[0.08]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gray-600 -ml-0.5 mt-3 shadow" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-600 -ml-0.5 mt-14 shadow" />
            </div>
          ))}
        </div>

        {/* Heavy Industrial Floor Deck Catwalk Plate */}
        <div className="absolute bottom-0 left-0 w-full h-28 bg-[#0e1524] border-t-2 border-[#263750] shadow-[inset_0_10px_25px_rgba(0,0,0,0.7)]">
          <div className="w-full h-full opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OVERHEAD TELEMETRY HUD HEADER                                          */}
      {/* ========================================================================= */}
      <div className="w-full h-9 px-3 sm:px-4 flex items-center justify-between border-b border-[#1c2a40] bg-[#090f1a]/95 z-20 shrink-0 text-[10px] tracking-wider uppercase backdrop-blur-md relative gap-2">
        {/* Left: Section Tag */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#22d3ee]" />
          <span className="text-gray-300 font-mono text-[9px] font-bold hidden md:inline">CORE PROCESSING BAY</span>
        </div>

        {/* Right: Live RAM Pressure Gauge with Dynamic Threshold & Warning Siren Beacon */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0b1220] border border-[#23354d] shadow-inner">
            <div className="flex items-center gap-1.5 font-mono text-[9px]">
              <span className="text-gray-400 font-bold">RAM PRESSURE:</span>
              <span
                className={`font-mono font-extrabold ${
                  displayPressure >= threshold
                    ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-pulse'
                    : displayPressure >= threshold * 0.7
                    ? 'text-amber-400'
                    : displayPressure > 0
                    ? 'text-cyan-300'
                    : 'text-emerald-400'
                }`}
              >
                {Math.round(displayPressure)}%
              </span>
            </div>

            {/* 0% - 100% Progress Bar with DYNAMIC Threshold Marker */}
            <div className="w-24 sm:w-36 h-2 rounded-full bg-black/80 border border-gray-700/80 relative overflow-hidden flex items-center shadow-inner">
              <div
                style={{ width: `${Math.min(100, Math.max(0, displayPressure))}%` }}
                className={`h-full ${
                  displayPressure >= threshold
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 shadow-[0_0_10px_#f43f5e] animate-pulse'
                    : displayPressure >= threshold * 0.7
                    ? 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 shadow-[0_0_8px_#f59e0b]'
                    : 'bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_6px_#10b981]'
                }`}
              />
              {/* Dynamic Threshold Needle Marker (updates based on if block) */}
              <div
                style={{ left: `${Math.min(99, Math.max(1, threshold))}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 shadow-[0_0_6px_#f59e0b] transition-all duration-500 ease-out"
                title={`${threshold}% Critical Threshold`}
              />
            </div>

            {/* Dynamic Warning Siren Beacon: glows and pulses based on fill level against threshold */}
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all duration-300 ${
                isCrashed
                  ? 'bg-rose-950/90 border-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.9)] animate-pulse'
                  : displayPressure >= threshold
                  ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.8)] animate-pulse'
                  : displayPressure >= threshold * 0.7
                  ? 'bg-amber-950/60 border-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                  : 'bg-emerald-950/40 border-emerald-500/40 shadow-[0_0_6px_rgba(16,185,129,0.3)]'
              }`}
              title={`Warning Siren: ${Math.round(displayPressure)}% / ${threshold}% Threshold`}
            >
              {/* Rotating / Pulsing Industrial Siren Beacon SVG */}
              <div className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
                <div
                  className={`absolute inset-0 rounded-full transition-all ${
                    isCrashed || displayPressure >= threshold
                      ? 'bg-rose-500/40 animate-ping'
                      : displayPressure >= threshold * 0.7
                      ? 'bg-amber-500/30 animate-pulse'
                      : 'bg-emerald-500/15'
                  }`}
                />
                <svg
                  viewBox="0 0 24 24"
                  className={`w-3.5 h-3.5 relative z-10 transition-all ${
                    isCrashed || displayPressure >= threshold
                      ? 'text-rose-400 drop-shadow-[0_0_6px_#f43f5e] animate-bounce'
                      : displayPressure >= threshold * 0.7
                      ? 'text-amber-300 drop-shadow-[0_0_4px_#f59e0b]'
                      : 'text-emerald-400 drop-shadow-[0_0_3px_#10b981]'
                  }`}
                  fill="currentColor"
                >
                  <path d="M4 19h16v2H4z" fill="currentColor" opacity="0.8" />
                  <path d="M6 18c0-3.3 2.7-6 6-6s6 2.7 6 6H6z" fill="currentColor" />
                  <circle cx="12" cy="11" r="2.5" fill="#fff" opacity="0.9" />
                  {(isCrashed || displayPressure >= threshold * 0.7) && (
                    <path d="M12 2v3M5 5l2 2M19 5l-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  )}
                </svg>
              </div>

              {/* Status Code Text */}
              <span
                className={`text-[8px] font-mono font-extrabold hidden sm:inline ${
                  isCrashed
                    ? 'text-rose-300 tracking-wider'
                    : displayPressure >= threshold
                    ? 'text-rose-300 tracking-wider'
                    : displayPressure >= threshold * 0.7
                    ? 'text-amber-300 tracking-wider'
                    : 'text-emerald-300 tracking-wider'
                }`}
              >
                {isBreakerTrip
                  ? 'OFFLINE'
                  : isCrashed
                  ? 'OVERLOAD'
                  : displayPressure >= threshold
                  ? 'ALARM'
                  : displayPressure >= threshold * 0.7
                  ? 'CAUTION'
                  : 'STANDBY'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                isSuccess
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : isBreakerTrip
                  ? 'bg-red-600 shadow-[0_0_8px_#dc2626] animate-pulse'
                  : isCrashed
                  ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-ping'
                  : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CENTER ENGINE ROOM: GROUNDED AT FLOOR, DYNAMICALLY RESPONSIVE           */}
      {/* ========================================================================= */}
      <div
        ref={stageRef}
        className="relative w-full flex-1 flex items-end justify-between px-3 sm:px-6 pb-2.5 z-10 min-h-[295px]"
      >
        {/* Overhead Crane Rail Track */}
        <div className="absolute top-2 left-3 right-3 h-2.5 bg-[#131d2e] border-y border-[#263750] shadow flex items-center justify-between px-2 z-15 pointer-events-none">
          <div className="w-full h-0.5 bg-gradient-to-r from-cyan-400/40 via-emerald-400/40 to-purple-400/40" />
        </div>

        {/* Dynamic Inter-Machine Conduit Cable Trunk */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-12 opacity-80">
          <path
            d={`M 155 235 Q ${(160 + (coords.mainframeSlotsX[0] || 250)) / 2} 265 ${Math.max(180, (coords.mainframeSlotsX[0] || 250) - 25)} 235`}
            fill="none"
            stroke="#0a101a"
            strokeWidth="7"
          />
          <path
            d={`M 155 235 Q ${(160 + (coords.mainframeSlotsX[0] || 250)) / 2} 265 ${Math.max(180, (coords.mainframeSlotsX[0] || 250) - 25)} 235`}
            fill="none"
            stroke="#2a3b54"
            strokeWidth="3.5"
          />
          <path
            d={`M 155 235 Q ${(160 + (coords.mainframeSlotsX[0] || 250)) / 2} 265 ${Math.max(180, (coords.mainframeSlotsX[0] || 250) - 25)} 235`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.2"
            strokeDasharray="4 5"
            className="animate-pulse"
          />
        </svg>

        {/* ======================================================================= */}
        {/* 3A. THE MEMORY HEAP: ANCHORED LEFT (w-[160px])                           */}
        {/* ======================================================================= */}
        <div className="relative flex flex-col items-center shrink-0 z-15">
          {/* Main Heap Rack Chassis */}
          <div
            ref={heapRef}
            className="w-[160px] bg-gradient-to-b from-[#1b263a] to-[#101726] border-2 border-[#334665] shadow-[0_12px_32px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.15)] p-2 relative flex flex-col items-center rounded-xs"
          >
            {/* Corner Armor Plates with Exposed Hex Bolts */}
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-gradient-to-br from-gray-400 to-gray-700 border border-black rounded-xs shadow flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-black/80" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-bl from-gray-400 to-gray-700 border border-black rounded-xs shadow flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-black/80" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-gradient-to-tr from-gray-400 to-gray-700 border border-black rounded-xs shadow flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-black/80" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-gradient-to-tl from-gray-400 to-gray-700 border border-black rounded-xs shadow flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-black/80" />
            </div>

            {/* Top Busbar Collector Bar */}
            <div className="w-full h-1.5 bg-[#0f1726] border-b border-[#2d3e5a] flex items-center justify-between px-2 mb-1">
              <div className="w-2 h-0.5 bg-amber-400 rounded-full" />
              <div className="w-10 h-0.5 bg-cyan-400/60 rounded-full" />
              <div className="w-2 h-0.5 bg-amber-400 rounded-full" />
            </div>

            {/* 4 Vertical Battery Cradle Sockets */}
            <div className="grid grid-cols-4 gap-1.5 w-full p-1 bg-[#080d17] border border-[#22334a] shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)]">
              {Array.from({ length: 4 }).map((_, idx) => {
                // Determine whether this specific heap socket has a core in it:
                // Cores are grabbed from left to right (0, then 1, 2, 3)
                let isPresentInHeap = idx >= (4 - currentHeap);

                if (tripInfo && activeArm) {
                  if (armAction === 'allocating') {
                    if (tripInfo.targetSlot === idx) {
                      // While crane is plunging to clamp (subStep 1), battery is still in socket
                      // Once clamped and hoisted (subStep >= 2), battery is in crane's claws
                      isPresentInHeap = tripInfo.subStep === 1;
                    }
                  } else if (armAction === 'deallocating') {
                    if (tripInfo.targetSlot === idx) {
                      // When returning, core stays in claws until deposited (subStep 0)
                      isPresentInHeap = tripInfo.subStep === 0;
                    }
                  }
                }

                return (
                  <div
                    key={`heap-cradle-${idx}`}
                    ref={el => {
                      heapSocketRefs.current[idx] = el;
                    }}
                    className={`h-14 border flex flex-col items-center justify-between py-1 relative transition-all duration-300 ${
                      isPresentInHeap
                        ? 'border-amber-500/70 bg-amber-950/30 shadow-[inset_0_0_10px_rgba(245,158,11,0.3)]'
                        : 'border-dashed border-gray-700/80 bg-[#050810]'
                    }`}
                  >
                    {/* Top Gold Contact Terminal */}
                    <div className="w-3 h-0.5 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 border-x border-black shadow" />

                    {/* Physical Battery Canister */}
                    {isPresentInHeap ? (
                      <div
                        style={{ animation: 'batteryGlow 3s ease-in-out infinite' }}
                        className="w-3.5 h-9 rounded-full bg-gradient-to-b from-[#ffe8cc] via-[#ffa94d] to-[#ff8c1a] border border-amber-100 flex flex-col items-center justify-between py-0.5 cursor-default relative shadow-[0_0_12px_rgba(255,140,26,0.85)]"
                      >
                        <div className="w-1.5 h-0.5 rounded-full bg-white shadow-[0_0_3px_#fff]" />
                        <div className="w-0.5 h-3.5 rounded-full bg-white shadow-[0_0_4px_#fff]" />
                        <div className="w-1.5 h-0.5 rounded-full bg-white shadow-[0_0_3px_#fff]" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1">
                        <div className="w-2.5 h-5 border-x border-amber-500/40 opacity-40 flex flex-col justify-around py-0.5">
                          <div className="w-full h-px bg-amber-500/60" />
                        </div>
                      </div>
                    )}

                    {/* Bottom Grounding Terminal */}
                    <div className="w-3 h-0.5 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 border-x border-black shadow" />
                  </div>
                );
              })}
            </div>

            {/* Baseplate with LED Status Rails */}
            <div className="w-full pt-1.5 mt-0.5 border-t border-[#263750] flex items-center justify-between px-1">
              <div className="flex gap-1">
                <div className={`w-1.5 h-1.5 rounded-xs ${currentHeap >= 1 ? 'bg-amber-400 shadow-[0_0_4px_#f59e0b]' : 'bg-gray-800'}`} />
                <div className={`w-1.5 h-1.5 rounded-xs ${currentHeap >= 2 ? 'bg-amber-400 shadow-[0_0_4px_#f59e0b]' : 'bg-gray-800'}`} />
                <div className={`w-1.5 h-1.5 rounded-xs ${currentHeap >= 3 ? 'bg-amber-400 shadow-[0_0_4px_#f59e0b]' : 'bg-gray-800'}`} />
                <div className={`w-1.5 h-1.5 rounded-xs ${currentHeap >= 4 ? 'bg-amber-400 shadow-[0_0_4px_#f59e0b]' : 'bg-gray-800'}`} />
              </div>
              <div className="flex items-center gap-1">
                <Zap size={10} className="text-amber-400" />
                <span className="text-[10px] font-bold text-amber-300 tracking-wider font-mono">
                  [RAM]
                </span>
              </div>
            </div>
          </div>

          {/* PHYSICAL SUPPORT: Heavy Wall Gantry Truss Bolted Directly to the Floor Deck */}
          <div className="w-full flex items-center justify-between px-2.5 mt-0 pointer-events-none">
            {/* Left Diagonal Steel Wall Gantry Arm */}
            <svg width="34" height="38" className="overflow-visible">
              <path d="M 5 0 L 5 34 L 24 34" fill="none" stroke="#1d2a3d" strokeWidth="4.5" />
              <path d="M 5 0 L 24 34" fill="none" stroke="#334665" strokeWidth="2.5" />
              <circle cx="5" cy="2" r="2" fill="#000" />
              <circle cx="22" cy="32" r="2" fill="#000" />
            </svg>

            {/* Heavy Ribbed Floor Power Conduit Trunk */}
            <div className="w-5 h-10 bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 border-x border-black shadow flex flex-col justify-around py-0.5">
              <div className="w-full h-0.5 bg-amber-400 shadow-[0_0_3px_#f59e0b]" />
              <div className="w-full h-0.5 bg-black" />
              <div className="w-full h-0.5 bg-amber-400 shadow-[0_0_3px_#f59e0b]" />
            </div>

            {/* Right Diagonal Steel Wall Gantry Arm */}
            <svg width="34" height="38" className="overflow-visible">
              <path d="M 29 0 L 29 34 L 10 34" fill="none" stroke="#1d2a3d" strokeWidth="4.5" />
              <path d="M 29 0 L 10 34" fill="none" stroke="#334665" strokeWidth="2.5" />
              <circle cx="29" cy="2" r="2" fill="#000" />
              <circle cx="12" cy="32" r="2" fill="#000" />
            </svg>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 3B. THE MAIN MACHINERY: DYNAMICALLY RESPONSIVE & ADAPTS TO SCREEN WIDTH */}
        {/* ======================================================================= */}
        <div className="relative flex flex-col items-center flex-1 max-w-[500px] min-w-[270px] z-15 ml-3 sm:ml-5">
          {/* Mainframe Industrial Chassis */}
          <div
            ref={mainframeRef}
            style={{
              animation: isBreakerTrip
                ? undefined
                : isOverloadCrash
                ? 'heatHaze 1.2s ease-in-out infinite'
                : isMachineRunning
                ? 'machineSoftBounce 0.4s ease-in-out infinite'
                : undefined,
            }}
            className={`w-full bg-gradient-to-b from-[#1b273d] via-[#121c2e] to-[#0d1422] border-2 transition-all duration-300 shadow-[0_14px_38px_rgba(0,0,0,0.9),inset_0_1px_3px_rgba(255,255,255,0.15)] p-2.5 sm:p-3 flex flex-col items-center relative rounded-xs ${
              isSuccess
                ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                : isBreakerTrip
                ? 'border-[#1e293b] shadow-none'
                : isOverloadCrash
                ? 'border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.6)]'
                : isMemoryLeak
                ? 'border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                : isCrashed
                ? 'border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.6)]'
                : isMachineRunning
                ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                : 'border-[#334665]'
            }`}
          >
            {/* Deflector Shield Forcefield Barrier (when shields active) */}
            {(activeTask === 'RUN_SHIELDS' || shieldAllocated > 0) && (
              <div
                style={{ animation: 'shieldEnergyWave 2.5s ease-in-out infinite' }}
                className="absolute -inset-2.5 rounded-lg border-2 border-emerald-400 bg-emerald-500/10 pointer-events-none z-20 flex flex-col items-center justify-between p-1.5"
              >
                <div className="px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-[9px] font-mono font-bold tracking-wider uppercase shadow-[0_0_10px_#10b981] flex items-center gap-1.5">
                  <Shield size={11} className="text-emerald-400 animate-pulse" />
                  DEFLECTOR SHIELDS: ONLINE
                </div>
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
              </div>
            )}

            {/* Top Mainframe RAM Pressure Gauge Track: Gradual increase from no bar to threshold */}
            <div className="w-full flex items-center gap-1.5 px-1 -mt-0.5 mb-2">
              <div className="w-2 h-3 bg-[#2a3a52] border border-black shrink-0 rounded-xs shadow" />
              <div
                className="flex-1 h-2.5 bg-[#070b14] border border-[#23354d] rounded-full relative overflow-hidden flex items-center shadow-inner"
                title={`Mainframe RAM Pressure: ${Math.round(displayPressure)}% / ${threshold}% Threshold`}
              >
                {/* Gradual RAM Pressure Fill Bar: starts from 0% (no bar) and climbs smoothly */}
                <div
                  style={{ width: `${Math.min(100, Math.max(0, displayPressure))}%` }}
                  className={`h-full ${
                    displayPressure >= threshold
                      ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-500 shadow-[0_0_10px_#f43f5e]'
                      : displayPressure >= threshold * 0.7
                      ? 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 shadow-[0_0_8px_#f59e0b]'
                      : 'bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_6px_#06b6d4]'
                  }`}
                />
                {/* Dynamic Threshold Needle Line Marker */}
                <div
                  style={{ left: `${Math.min(99, Math.max(1, threshold))}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 shadow-[0_0_6px_#f59e0b] transition-all duration-500 ease-out"
                />
                {/* Dynamic Threshold Cyan Indicator Node */}
                <div
                  style={{ left: `calc(${Math.min(99, Math.max(1, threshold))}% - 3px)` }}
                  className="absolute -top-0.5 w-2 h-2 rounded-full bg-cyan-300 border border-black z-20 shadow-[0_0_6px_#22d3ee] transition-all duration-500 ease-out"
                  title={`Threshold Marker: ${threshold}%`}
                />
              </div>
              <div className="w-2 h-3 bg-[#2a3a52] border border-black shrink-0 rounded-xs shadow" />
            </div>

            {/* Industrial Hardware Strip: Pressure Dial, 3 Segmented Power Ladders, Status LEDs */}
            <div className="w-full flex items-center justify-between border-b border-[#283952] pb-2 mb-2 px-1">
              {/* Circular Analog Pressure Dial */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#080e1c] border-2 border-amber-500/80 shadow-inner relative flex items-center justify-center shrink-0">
                  <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center">
                    <div
                      style={{
                        transform: isBreakerTrip
                          ? 'rotate(-45deg)'
                          : isCrashed
                          ? 'rotate(110deg)'
                          : `rotate(${-45 + (displayPressure / 100) * 160}deg)`,
                      }}
                      className="w-2.5 h-0.5 bg-red-400 origin-left shadow"
                    />
                  </div>
                </div>

                {/* 3 Task Power Ladders: Sensors, Debris, Shields - all uniform 4 slots tall */}
                <div className="flex items-center gap-2 bg-black/85 px-2.5 py-1 rounded-xs border border-[#263750]">
                  {/* Sensors: 4 slots total (needs 2) */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="w-3 h-1.5 rounded-xs bg-gray-900 border border-gray-800/60" />
                      <div className="w-3 h-1.5 rounded-xs bg-gray-900 border border-gray-800/60" />
                      <div className={`w-3 h-1.5 rounded-xs transition-colors ${!isBreakerTrip && sensorAllocated >= 2 ? 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]' : 'bg-gray-800'}`} />
                      <div className={`w-3 h-1.5 rounded-xs transition-colors ${!isBreakerTrip && sensorAllocated >= 1 ? 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]' : 'bg-gray-800'}`} />
                    </div>
                    <span className="text-[9px] text-cyan-400 font-mono font-extrabold leading-none mt-0.5">SNS</span>
                  </div>

                  <div className="w-px h-8 bg-[#263750]" />

                  {/* Debris: 4 slots total (needs 3) */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="w-3 h-1.5 rounded-xs bg-gray-900 border border-gray-800/60" />
                      <div className={`w-3 h-1.5 rounded-xs transition-colors ${!isBreakerTrip && debrisAllocated >= 3 ? 'bg-purple-400 shadow-[0_0_5px_#c084fc]' : 'bg-gray-800'}`} />
                      <div className={`w-3 h-1.5 rounded-xs transition-colors ${!isBreakerTrip && debrisAllocated >= 2 ? 'bg-purple-400 shadow-[0_0_5px_#c084fc]' : 'bg-gray-800'}`} />
                      <div className={`w-3 h-1.5 rounded-xs transition-colors ${!isBreakerTrip && debrisAllocated >= 1 ? 'bg-purple-400 shadow-[0_0_5px_#c084fc]' : 'bg-gray-800'}`} />
                    </div>
                    <span className="text-[9px] text-purple-400 font-mono font-extrabold leading-none mt-0.5">DBR</span>
                  </div>

                  <div className="w-px h-8 bg-[#263750]" />

                  {/* Shields: 4 slots total (needs 2) */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="w-3 h-1.5 rounded-xs bg-gray-900 border border-gray-800/60" />
                      <div className="w-3 h-1.5 rounded-xs bg-gray-900 border border-gray-800/60" />
                      <div className={`w-3 h-1.5 rounded-xs transition-colors ${!isBreakerTrip && shieldAllocated >= 2 ? 'bg-emerald-400 shadow-[0_0_5px_#34d399]' : 'bg-gray-800'}`} />
                      <div className={`w-3 h-1.5 rounded-xs transition-colors ${!isBreakerTrip && shieldAllocated >= 1 ? 'bg-emerald-400 shadow-[0_0_5px_#34d399]' : 'bg-gray-800'}`} />
                    </div>
                    <span className="text-[9px] text-emerald-400 font-mono font-extrabold leading-none mt-0.5">SHD</span>
                  </div>
                </div>
              </div>

              {/* Status Indicator Array & Breaker Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isBreakerTrip ? 'bg-gray-800' : 'bg-cyan-400 shadow-[0_0_5px_#22d3ee]'}`} />
                  <div className={`w-2 h-2 rounded-full ${isBreakerTrip ? 'bg-gray-800' : 'bg-purple-400 shadow-[0_0_5px_#c084fc]'}`} />
                  <div className={`w-2 h-2 rounded-full ${isBreakerTrip ? 'bg-gray-800' : 'bg-emerald-400 shadow-[0_0_5px_#34d399]'}`} />
                  <div
                    className={`w-3 h-3 rounded-full ml-1 ${
                      isSuccess
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                        : isBreakerTrip
                        ? 'bg-red-600 shadow-[0_0_8px_#dc2626] animate-pulse'
                        : isCrashed
                        ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-ping'
                        : isMachineRunning
                        ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse'
                        : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                    }`}
                  />
                </div>
                <div
                  className={`w-3.5 h-5 bg-[#0b101c] border rounded-xs flex flex-col items-center justify-between p-0.5 shadow transition-all duration-300 ${
                    isBreakerTrip ? 'border-red-500 shadow-[0_0_8px_#ef4444]' : 'border-gray-500'
                  }`}
                  title={isBreakerTrip ? 'Breaker Tripped: OFF' : 'Breaker: ON'}
                >
                  <div
                    className={`w-2 h-2 rounded-xs transition-all duration-300 ${
                      isBreakerTrip ? 'translate-y-2 bg-red-600 shadow-[0_0_4px_#dc2626]' : 'bg-amber-400 shadow-[0_0_3px_#f59e0b]'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Machinery Section: Left Turbine + Universal Docking Bay + Right Turbine */}
            <div className="w-full flex items-center justify-between gap-2 sm:gap-3">
              {/* Left Nacelle Turbine (Sensors) */}
              <div className="relative flex flex-col items-center shrink-0">
                <div
                  className={`relative w-13 sm:w-15 h-13 sm:h-15 rounded-full border-2 border-[#334665] bg-[#060a12] flex items-center justify-center overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.85)] ${
                    isOverloadCrash
                      ? 'shadow-[0_0_18px_#ef4444]'
                      : isSuccess
                      ? 'shadow-[0_0_14px_#10b981]'
                      : ''
                  }`}
                >
                  {/* Internal Induction Coils */}
                  <div
                    className={`absolute inset-0.5 rounded-full transition-all duration-300 ${
                      isBreakerTrip
                        ? 'bg-black/80'
                        : isOverloadCrash
                        ? 'bg-gradient-to-r from-red-600/60 to-amber-500/60 animate-pulse'
                        : isMachineRunning
                        ? 'bg-cyan-500/30 shadow-[inset_0_0_15px_#22d3ee] animate-pulse'
                        : sensorAllocated > 0
                        ? 'bg-cyan-900/40'
                        : 'bg-black/50'
                    }`}
                  />

                  {/* Turbine Blades */}
                  <svg
                    viewBox="0 0 100 100"
                    style={{
                      animation: isBreakerTrip
                        ? 'none'
                        : isOverloadCrash
                        ? 'spin 0.12s linear infinite'
                        : isSuccess
                        ? 'spin 4s linear infinite'
                        : isMachineRunning
                        ? 'spin 0.22s linear infinite'
                        : 'none',
                    }}
                    className={`w-10 sm:w-11 h-10 sm:h-11 ${
                      isSuccess ? 'text-gray-200' : isOverloadCrash ? 'text-red-400' : 'text-gray-300'
                    }`}
                  >
                    <circle cx="50" cy="50" r="14" fill="#1b2536" stroke="#000" strokeWidth="2" />
                    {Array.from({ length: 8 }).map((_, i) => (
                      <path
                        key={`blade-l-${i}`}
                        d="M 50 50 L 44 10 A 40 40 0 0 1 56 10 Z"
                        fill="currentColor"
                        transform={`rotate(${i * 45} 50 50)`}
                      />
                    ))}
                    <circle cx="50" cy="50" r="6" fill="#94a3b8" stroke="#000" />
                  </svg>

                  {/* Protective Wire Grille */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50">
                    <div className="w-full h-px bg-black" />
                    <div className="h-full w-px bg-black" />
                    <div className="w-8 h-8 rounded-full border border-black" />
                  </div>
                </div>

                <div className="absolute -top-0.5 w-1.5 h-1.5 rounded-full bg-gray-400 border border-black shadow" />
                <div className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-gray-400 border border-black shadow" />
              </div>

              {/* Central Recessed Core Docking Bay (Dynamically Stretches and Centers) */}
              <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-3 py-2 bg-[#080e1a] border-2 border-[#202e44] shadow-[inset_0_2px_10px_rgba(0,0,0,0.9)] rounded-xs min-w-0">
                {/* 4 Universal Channels (0, 1, 2, 3) */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 w-full">
                  {Array.from({ length: 4 }).map((_, slotIdx) => {
                    const isLoaded = slotIdx < slotsOccupied;

                    const borderClass = isLoaded
                      ? activeTaskType === 'SHIELDS'
                        ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_12px_rgba(16,185,129,0.7)]'
                        : activeTaskType === 'DEBRIS'
                        ? 'border-purple-400 bg-purple-950/40 shadow-[0_0_12px_rgba(192,132,252,0.7)]'
                        : 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(34,211,238,0.7)]'
                      : 'border-dashed border-gray-600/80 bg-[#050810]';

                    return (
                      <div
                        key={`mf-dock-slot-${slotIdx}`}
                        ref={el => {
                          mainframeSlotRefs.current[slotIdx] = el;
                        }}
                        className={`w-5 sm:w-6 h-13 sm:h-14 border flex flex-col items-center justify-between py-1 transition-all duration-300 ${borderClass}`}
                      >
                        <div className="w-3.5 h-0.5 bg-gray-500" />
                        {isLoaded ? (
                          <div
                            style={{ animation: 'batteryGlow 2.5s ease-in-out infinite' }}
                            className="w-4 h-10 rounded-full bg-gradient-to-b from-[#ffe8cc] via-[#ffa94d] to-[#ff8c1a] border border-white flex flex-col items-center justify-between py-0.5 shadow-[0_0_12px_#ff912d]"
                          >
                            <div className="w-2 h-0.5 rounded-full bg-white shadow-[0_0_2px_#fff]" />
                            <div className="w-0.5 h-3.5 rounded-full bg-white shadow-[0_0_3px_#fff]" />
                            <div className="w-2 h-0.5 rounded-full bg-white shadow-[0_0_2px_#fff]" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center flex-1">
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-gray-400">
                              CH{slotIdx}
                            </span>
                          </div>
                        )}
                        <div className="w-3.5 h-0.5 bg-gray-500" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Nacelle Turbine (Debris) */}
              <div className="relative flex flex-col items-center shrink-0">
                <div
                  className={`relative w-13 sm:w-15 h-13 sm:h-15 rounded-full border-2 border-[#334665] bg-[#060a12] flex items-center justify-center overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.85)] ${
                    isOverloadCrash
                      ? 'shadow-[0_0_18px_#ef4444]'
                      : isSuccess
                      ? 'shadow-[0_0_14px_#10b981]'
                      : ''
                  }`}
                >
                  <div
                    className={`absolute inset-0.5 rounded-full transition-all duration-300 ${
                      isBreakerTrip
                        ? 'bg-black/80'
                        : isOverloadCrash
                        ? 'bg-gradient-to-r from-red-600/60 to-amber-500/60 animate-pulse'
                        : isMachineRunning
                        ? 'bg-purple-500/30 shadow-[inset_0_0_15px_#c084fc] animate-pulse'
                        : debrisAllocated > 0
                        ? 'bg-purple-900/40'
                        : 'bg-black/50'
                    }`}
                  />
                  <svg
                    viewBox="0 0 100 100"
                    style={{
                      animation: isBreakerTrip
                        ? 'none'
                        : isOverloadCrash
                        ? 'spin 0.12s linear infinite'
                        : isSuccess
                        ? 'spin 4s linear infinite'
                        : isMachineRunning
                        ? 'spin 0.22s linear infinite'
                        : 'none',
                    }}
                    className={`w-10 sm:w-11 h-10 sm:h-11 ${
                      isSuccess ? 'text-gray-200' : isOverloadCrash ? 'text-red-400' : 'text-gray-300'
                    }`}
                  >
                    <circle cx="50" cy="50" r="14" fill="#1b2536" stroke="#000" strokeWidth="2" />
                    {Array.from({ length: 8 }).map((_, i) => (
                      <path
                        key={`blade-r-${i}`}
                        d="M 50 50 L 44 10 A 40 40 0 0 1 56 10 Z"
                        fill="currentColor"
                        transform={`rotate(${i * 45} 50 50)`}
                      />
                    ))}
                    <circle cx="50" cy="50" r="6" fill="#94a3b8" stroke="#000" />
                  </svg>
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-50">
                    <div className="w-full h-px bg-black" />
                    <div className="h-full w-px bg-black" />
                    <div className="w-8 h-8 rounded-full border border-black" />
                  </div>
                </div>

                <div className="absolute -top-0.5 w-1.5 h-1.5 rounded-full bg-gray-400 border border-black shadow" />
                <div className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-gray-400 border border-black shadow" />
              </div>
            </div>

            {/* OVERLOAD EXPLOSION FX ON THE MAINFRAME */}
            {isOverloadCrash && (
              <div className="absolute inset-0 pointer-events-none z-40 overflow-visible flex items-center justify-center">
                {/* Fiery Shockwave Blast Ring */}
                <div className="absolute w-56 h-40 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-300 blur-md scale-125 animate-ping opacity-90" />
                {/* Fireball Core */}
                <div className="absolute w-44 h-32 rounded-2xl bg-radial from-white via-yellow-400 to-red-600 blur-sm animate-pulse shadow-[0_0_60px_#ef4444]" />
                {/* Billowing Black Smoke Clouds */}
                <div className="absolute -top-14 w-48 h-28 bg-gradient-to-t from-gray-950 via-gray-900/90 to-transparent rounded-full blur-xl animate-pulse" />
                {/* Radiating Explosion Sparks */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {Array.from({ length: 8 }).map((_, sparkIdx) => (
                    <div
                      key={`spark-mf-${sparkIdx}`}
                      style={{
                        transform: `rotate(${sparkIdx * 45}deg) translateY(-55px)`,
                      }}
                      className="absolute w-1.5 h-6 bg-yellow-200 shadow-[0_0_10px_#fde047] rounded-full animate-ping"
                    />
                  ))}
                </div>
                {/* Overload Alert Badge */}
                <div className="absolute -top-5 px-3 py-0.5 rounded bg-red-950/95 border-2 border-red-500 text-red-100 font-mono text-[9px] font-extrabold uppercase shadow-[0_0_20px_#ef4444] animate-bounce">
                  OVERLOAD EXPLOSION
                </div>
              </div>
            )}

          </div>

          {/* PHYSICAL SUPPORT: Dual Heavy Industrial Shock-Absorbing Stanchions */}
          <div className="w-full flex items-center justify-around px-6 sm:px-12 mt-0 pointer-events-none">
            {/* Left Hydraulic Machine Leg */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-3.5 bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 border-x border-black shadow" />
              <div className="w-3.5 h-5 bg-gradient-to-r from-gray-200 via-white to-gray-200 border-x border-gray-500 shadow-sm" />
              <div className="w-12 h-2.5 bg-gradient-to-t from-black to-gray-700 border border-black shadow flex items-center justify-between px-1">
                <div className="w-1 h-1 rounded-full bg-black border border-gray-400" />
                <div className="w-1 h-1 rounded-full bg-black border border-gray-400" />
              </div>
            </div>

            {/* Central Cable Conduit Drop (Wired into the floor deck) */}
            <div className="w-5 h-10 bg-gradient-to-b from-[#22334a] to-black border-x border-black flex flex-col justify-around py-0.5">
              <div className="w-full h-0.5 bg-cyan-400 shadow-[0_0_3px_#22d3ee]" />
              <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_3px_#34d399]" />
              <div className="w-full h-0.5 bg-purple-400 shadow-[0_0_3px_#c084fc]" />
            </div>

            {/* Right Hydraulic Machine Leg */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-3.5 bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 border-x border-black shadow" />
              <div className="w-3.5 h-5 bg-gradient-to-r from-gray-200 via-white to-gray-200 border-x border-gray-500 shadow-sm" />
              <div className="w-12 h-2.5 bg-gradient-to-t from-black to-gray-700 border border-black shadow flex items-center justify-between px-1">
                <div className="w-1 h-1 rounded-full bg-black border border-gray-400" />
                <div className="w-1 h-1 rounded-full bg-black border border-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 4. THREE OVERHEAD ROBOTIC CRANES (ONE-BY-ONE DYNAMIC TRANSPORT)         */}
        {/* ======================================================================= */}

        {/* 4A. SENSORS CRANE (*sensorPtr - Cyan) */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: sensorCrane.left,
            transform: 'translateX(-50%)',
            transition: 'left 0.42s cubic-bezier(0.25, 1, 0.5, 1)',
            zIndex: sensorCrane.isActive ? 28 : 23,
          }}
          className="flex flex-col items-center pointer-events-none"
        >
          {/* Overhead Trolley Carriage */}
          <div className="w-10 h-3 bg-[#162234] border border-cyan-400 flex items-center justify-between px-1 shadow">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_3px_#22d3ee]" />
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_3px_#22d3ee]" />
          </div>

          {/* Telescopic Piston Rod */}
          <div
            style={{
              height: `${sensorCrane.drop}px`,
              transition: 'height 0.30s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
            className="flex flex-col items-center"
          >
            <div className="w-3 h-8 bg-gray-700 border-x border-cyan-500 shadow" />
            <div className="w-1.5 flex-1 bg-gradient-to-r from-gray-300 via-white to-gray-300 border-x border-gray-500 shadow-sm" />
          </div>

          {/* Articulated Clamping Gripper */}
          <div className="relative flex flex-col items-center">
            {/* Wrist Gimbal */}
            <div className="w-8 h-2.5 bg-gray-700 border border-cyan-400 flex items-center justify-center">
              <div className="w-3 h-0.5 bg-cyan-300 rounded-full" />
            </div>

            {/* Pincer Jaws & Gripped Core */}
            <div className="relative w-10 h-8 flex items-center justify-center">
              {/* Left Pincer */}
              <div
                style={{
                  transform: `rotate(-${sensorCrane.jawAngle}deg)`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.18s ease-out',
                }}
                className="absolute left-0 top-0 w-2 h-7 bg-[#202e44] border border-cyan-400 rounded-b-xs shadow"
              />

              {/* Physical Battery Held SNUGLY Inside Clamp */}
              {sensorCrane.isHoldingBattery && (
                <div
                  style={{ animation: 'batteryGlow 1.5s ease-in-out infinite' }}
                  className="w-3.5 h-8.5 rounded-full bg-gradient-to-b from-[#ffe8cc] via-[#ffa94d] to-[#ff8c1a] border border-white shadow-[0_0_14px_#ff912d] flex flex-col items-center justify-between py-0.5 z-20"
                >
                  <div className="w-1.5 h-0.5 rounded-full bg-white shadow-[0_0_3px_#fff]" />
                  <div className="w-0.5 h-3 rounded-full bg-white shadow-[0_0_4px_#fff]" />
                  <div className="w-1.5 h-0.5 rounded-full bg-white shadow-[0_0_3px_#fff]" />
                </div>
              )}

              {/* Right Pincer */}
              <div
                style={{
                  transform: `rotate(${sensorCrane.jawAngle}deg)`,
                  transformOrigin: 'top right',
                  transition: 'transform 0.18s ease-out',
                }}
                className="absolute right-0 top-0 w-2 h-7 bg-[#202e44] border border-cyan-400 rounded-b-xs shadow"
              />
            </div>
          </div>
        </div>

        {/* 4B. SHIELDS CRANE (*shieldPtr - Emerald) */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: shieldCrane.left,
            transform: 'translateX(-50%)',
            transition: 'left 0.42s cubic-bezier(0.25, 1, 0.5, 1)',
            zIndex: shieldCrane.isActive ? 28 : 24,
          }}
          className="flex flex-col items-center pointer-events-none"
        >
          {/* Overhead Trolley Carriage */}
          <div className="w-10 h-3 bg-[#142820] border border-emerald-400 flex items-center justify-between px-1 shadow">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_3px_#34d399]" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_3px_#34d399]" />
          </div>

          {/* Telescopic Piston Rod */}
          <div
            style={{
              height: `${shieldCrane.drop}px`,
              transition: 'height 0.30s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
            className="flex flex-col items-center"
          >
            <div className="w-3 h-8 bg-gray-700 border-x border-emerald-500 shadow" />
            <div className="w-1.5 flex-1 bg-gradient-to-r from-gray-300 via-white to-gray-300 border-x border-gray-500 shadow-sm" />
          </div>

          {/* Articulated Clamping Gripper */}
          <div className="relative flex flex-col items-center">
            {/* Wrist Gimbal */}
            <div className="w-8 h-2.5 bg-gray-700 border border-emerald-400 flex items-center justify-center">
              <div className="w-3 h-0.5 bg-emerald-300 rounded-full" />
            </div>

            {/* Pincer Jaws & Gripped Core */}
            <div className="relative w-10 h-8 flex items-center justify-center">
              {/* Left Pincer */}
              <div
                style={{
                  transform: `rotate(-${shieldCrane.jawAngle}deg)`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.18s ease-out',
                }}
                className="absolute left-0 top-0 w-2 h-7 bg-[#152e24] border border-emerald-400 rounded-b-xs shadow"
              />

              {/* Physical Battery Held SNUGLY Inside Clamp */}
              {shieldCrane.isHoldingBattery && (
                <div
                  style={{ animation: 'batteryGlow 1.5s ease-in-out infinite' }}
                  className="w-3.5 h-8.5 rounded-full bg-gradient-to-b from-[#ffe8cc] via-[#ffa94d] to-[#ff8c1a] border border-white shadow-[0_0_14px_#ff912d] flex flex-col items-center justify-between py-0.5 z-20"
                >
                  <div className="w-1.5 h-0.5 rounded-full bg-white shadow-[0_0_3px_#fff]" />
                  <div className="w-0.5 h-3 rounded-full bg-white shadow-[0_0_4px_#fff]" />
                  <div className="w-1.5 h-0.5 rounded-full bg-white shadow-[0_0_3px_#fff]" />
                </div>
              )}

              {/* Right Pincer */}
              <div
                style={{
                  transform: `rotate(${shieldCrane.jawAngle}deg)`,
                  transformOrigin: 'top right',
                  transition: 'transform 0.18s ease-out',
                }}
                className="absolute right-0 top-0 w-2 h-7 bg-[#152e24] border border-emerald-400 rounded-b-xs shadow"
              />
            </div>
          </div>
        </div>

        {/* 4C. DEBRIS CRANE (*debrisPtr - Purple) */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: debrisCrane.left,
            transform: 'translateX(-50%)',
            transition: 'left 0.42s cubic-bezier(0.25, 1, 0.5, 1)',
            zIndex: debrisCrane.isActive ? 28 : 23,
          }}
          className="flex flex-col items-center pointer-events-none"
        >
          {/* Overhead Trolley Carriage */}
          <div className="w-10 h-3 bg-[#221634] border border-purple-400 flex items-center justify-between px-1 shadow">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse shadow-[0_0_3px_#c084fc]" />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse shadow-[0_0_3px_#c084fc]" />
          </div>

          {/* Telescopic Piston Rod */}
          <div
            style={{
              height: `${debrisCrane.drop}px`,
              transition: 'height 0.30s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
            className="flex flex-col items-center"
          >
            <div className="w-3 h-8 bg-gray-700 border-x border-purple-500 shadow" />
            <div className="w-1.5 flex-1 bg-gradient-to-r from-gray-300 via-white to-gray-300 border-x border-gray-500 shadow-sm" />
          </div>

          {/* Articulated Clamping Gripper */}
          <div className="relative flex flex-col items-center">
            {/* Wrist Gimbal */}
            <div className="w-8 h-2.5 bg-gray-700 border border-purple-400 flex items-center justify-center">
              <div className="w-3 h-0.5 bg-purple-300 rounded-full" />
            </div>

            {/* Pincer Jaws & Gripped Core */}
            <div className="relative w-10 h-8 flex items-center justify-center">
              {/* Left Pincer */}
              <div
                style={{
                  transform: `rotate(-${debrisCrane.jawAngle}deg)`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.18s ease-out',
                }}
                className="absolute left-0 top-0 w-2 h-7 bg-[#221634] border border-purple-400 rounded-b-xs shadow"
              />

              {/* Physical Battery Held SNUGLY Inside Clamp */}
              {debrisCrane.isHoldingBattery && (
                <div
                  style={{ animation: 'batteryGlow 1.5s ease-in-out infinite' }}
                  className="w-3.5 h-8.5 rounded-full bg-gradient-to-b from-[#ffe8cc] via-[#ffa94d] to-[#ff8c1a] border border-white shadow-[0_0_14px_#ff912d] flex flex-col items-center justify-between py-0.5 z-20"
                >
                  <div className="w-1.5 h-0.5 rounded-full bg-white shadow-[0_0_3px_#fff]" />
                  <div className="w-0.5 h-3 rounded-full bg-white shadow-[0_0_4px_#fff]" />
                  <div className="w-1.5 h-0.5 rounded-full bg-white shadow-[0_0_3px_#fff]" />
                </div>
              )}

              {/* Right Pincer */}
              <div
                style={{
                  transform: `rotate(${debrisCrane.jawAngle}deg)`,
                  transformOrigin: 'top right',
                  transition: 'transform 0.18s ease-out',
                }}
                className="absolute right-0 top-0 w-2 h-7 bg-[#221634] border border-purple-400 rounded-b-xs shadow"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FLOOR STAGE: 3 CLUE TERMINALS                                          */}
      {/* ========================================================================= */}
      <div className="w-full flex flex-col items-center pb-4 -mt-3 z-20">
        <div className="relative w-full h-10">
          <DiagnosticTerminal
            id={1}
            label="Sensors"
            isRead={Boolean(terminalReadStatus[1])}
            isCompleted={Boolean(completedTasks?.sensors)}
            xPercent={18}
            yPercent={15}
            onClick={isSimulating ? () => {} : onOpenTerminal}
          />
          <DiagnosticTerminal
            id={2}
            label="Debris"
            isRead={Boolean(terminalReadStatus[2])}
            isCompleted={Boolean(completedTasks?.debris)}
            xPercent={50}
            yPercent={15}
            onClick={isSimulating ? () => {} : onOpenTerminal}
          />
          <DiagnosticTerminal
            id={3}
            label="Shields"
            isRead={Boolean(terminalReadStatus[3])}
            isCompleted={Boolean(completedTasks?.shields)}
            xPercent={82}
            yPercent={15}
            onClick={isSimulating ? () => {} : onOpenTerminal}
          />
        </div>
      </div>

      {/* Corrupted Clue Terminal Modal */}
      {activeTerminalModal && (
        <CorruptedTerminalModal
          id={activeTerminalModal}
          onClose={onCloseTerminal}
        />
      )}
    </div>
  );
}
