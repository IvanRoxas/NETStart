"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  CheckCircle2,
  Cpu,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import {
  Earth3PlanetId,
  Earth3AuditStatus,
  EARTH_3_PLANET_NODES,
} from '@/lib/earth/earthLevel3Definitions';

export interface EarthLevel3SimulationProps {
  audit: Earth3AuditStatus;
  isRunning: boolean;
  pythonCode: string;
  onSimulationComplete: () => void;
  onStopRunning?: () => void;
  onResetSimulation?: () => void;
}

export default function EarthLevel3Simulation({
  audit,
  isRunning,
  pythonCode,
  onSimulationComplete,
}: EarthLevel3SimulationProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Instructions dropdown state
  const [showInstructions, setShowInstructions] = useState(false);
  const instructionsRef = useRef<HTMLDivElement>(null);

  // Animation phase states
  // 'idle' | 'connecting' | 'synchronized' | 'completed'
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'synchronized' | 'completed'>('idle');
  const [connectedLines, setConnectedLines] = useState<Earth3PlanetId[]>([]);
  const [targetingPlanet, setTargetingPlanet] = useState<Earth3PlanetId | null>(null);
  const [allNodesGreen, setAllNodesGreen] = useState(false);
  const [activeStepText, setActiveStepText] = useState('MAIN MAINFRAME // STANDBY');

  // Dismiss instructions on click outside or escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (instructionsRef.current && !instructionsRef.current.contains(e.target as Node)) {
        setShowInstructions(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowInstructions(false);
      }
    }
    if (showInstructions) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showInstructions]);

  // Web Audio Synthesizer for Ambience & SFX
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // Connection Beam Sound
  const playBeamSound = useCallback((index: number) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      const baseFreqs = [220, 277.18, 329.63, 440, 554.37];
      const freq = baseFreqs[index % baseFreqs.length] || 330;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.35);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }, [getAudioContext]);

  // Climax Simultaneous Harmonic Chord
  const playClimaxChord = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Radiant major chord (C4, E4, G4, C5, E5)
      [261.63, 329.63, 392.00, 523.25, 659.25].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      });
    } catch {}
  }, [getAudioContext]);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Stable Callback Refs to prevent animation re-triggering mid-simulation
  const onSimulationCompleteRef = useRef(onSimulationComplete);
  onSimulationCompleteRef.current = onSimulationComplete;
  const playBeamSoundRef = useRef(playBeamSound);
  playBeamSoundRef.current = playBeamSound;
  const playClimaxChordRef = useRef(playClimaxChord);
  playClimaxChordRef.current = playClimaxChord;
  const prevIsRunningRef = useRef(false);

  // Animation Runner: Strictly triggers only once per isRunning activation
  useEffect(() => {
    if (!isRunning) {
      prevIsRunningRef.current = false;
      setPhase('idle');
      setConnectedLines([]);
      setTargetingPlanet(null);
      setAllNodesGreen(false);
      setActiveStepText('ASTROLINK // STANDBY');
      return;
    }

    if (!audit.canRunSimulation) return;
    if (prevIsRunningRef.current) return; // Already running, do NOT re-trigger or restart!
    prevIsRunningRef.current = true;

    setPhase('connecting');
    setConnectedLines([]);
    setTargetingPlanet(null);
    setAllNodesGreen(false);

    // Sequence through the 5 planets in audit.callOrder
    const order = audit.callOrder.length === 5
      ? [...audit.callOrder]
      : (['mars', 'venus', 'mercury', 'jupiter', 'saturn'] as Earth3PlanetId[]);

    const timeouts: NodeJS.Timeout[] = [];

    // Step 0: Central Earth node turns active
    setActiveStepText('INITIALIZING ASTROLINK REBOOT...');

    // Timing with deliberate dramatic pauses:
    // Initial Earth core charge: 1000ms
    // Per planet:
    // - 600ms targeting lock pause (Earth aims at target planet)
    // - Strike & Connect: Beam locks, sound plays, custom themed connection burst ignites!
    // - 1600ms hold & admire pause (Status: LINKED: [PLANET])
    // Total cycle per planet: 2200ms
    const initialDelay = 1000;
    const targetChargeDuration = 600;
    const planetCycle = 2200;

    order.forEach((planetId, idx) => {
      const node = EARTH_3_PLANET_NODES.find(n => n.id === planetId);
      const cycleStart = initialDelay + idx * planetCycle;

      // 1. Aiming / Targeting Pause: Earth targets the planet before connecting
      const tAim = setTimeout(() => {
        setTargetingPlanet(planetId);
        setActiveStepText(`ASTROLINK TARGETING: ${node?.name.toUpperCase()}...`);
      }, cycleStart);
      timeouts.push(tAim);

      // 2. Connection Strike: Beam fires and connects to the planet
      const tConnect = setTimeout(() => {
        setTargetingPlanet(null);
        playBeamSoundRef.current(idx);
        setConnectedLines(prev => {
          if (prev.includes(planetId)) return prev;
          return [...prev, planetId];
        });
        setActiveStepText(`ASTROLINK LINKED: ${node?.name.toUpperCase()} [${node?.repairDesc.toUpperCase()}]`);
      }, cycleStart + targetChargeDuration);
      timeouts.push(tConnect);
    });

    // Final Climax: All lines connected, hold, then celebrate all online!
    const climaxTime = initialDelay + order.length * planetCycle + 600;
    const tClimax = setTimeout(() => {
      setTargetingPlanet(null);
      playClimaxChordRef.current();
      setAllNodesGreen(true);
      setPhase('synchronized');
      setActiveStepText('ASTROLINK SYNCHRONIZED // ALL PLANETS ONLINE');
    }, climaxTime);
    timeouts.push(tClimax);

    // Auto-trigger completion after celebratory synchrony
    const tAuto = setTimeout(() => {
      onSimulationCompleteRef.current();
    }, climaxTime + 3000);
    timeouts.push(tAuto);

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [isRunning, audit.canRunSimulation]);

  // Layout Dimensions for Radial Map (Center at (500, 500), Radius 355, ViewBox 1000x1000)
  // Perfectly aligned to the exact middle
  const mapCenter = { x: 500, y: 500 };
  const radius = 355;

  const nodePositions = useMemo(() => {
    const map: Record<Earth3PlanetId, { x: number; y: number }> = {
      mars: { x: 0, y: 0 },
      venus: { x: 0, y: 0 },
      mercury: { x: 0, y: 0 },
      jupiter: { x: 0, y: 0 },
      saturn: { x: 0, y: 0 },
    };

    EARTH_3_PLANET_NODES.forEach(planet => {
      const rad = (planet.angleDeg * Math.PI) / 180;
      map[planet.id] = {
        x: Math.round(mapCenter.x + radius * Math.cos(rad)),
        y: Math.round(mapCenter.y + radius * Math.sin(rad)),
      };
    });

    return map;
  }, [mapCenter.x, mapCenter.y, radius]);

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#0b0316] text-purple-100 select-none overflow-hidden relative">
      {/* Official NETStart Space Background covering entire simulation screen */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none bg-cover bg-center bg-no-repeat z-0"
        style={{ 
          backgroundImage: "url('/assets/global/ui/Landing Page BG.png')",
        }}
      />
      <div className="absolute inset-0 w-full h-full pointer-events-none bg-[#0a0216]/50 z-0 backdrop-blur-[0.5px]" />

      {/* Top Header Bar: Clean & Minimalist */}
      <div className="shrink-0 px-3 sm:px-4 py-2 bg-[#140626]/90 border-b border-purple-800/40 flex items-center justify-between shadow-lg backdrop-blur-sm relative z-30">
        {/* Left: Enhanced Instructions Dropdown with Highlights & Larger Font */}
        <div ref={instructionsRef} className="relative">
          <button
            type="button"
            onClick={() => setShowInstructions(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 hover:border-purple-400 text-purple-200 hover:text-white font-mono text-xs sm:text-sm font-bold transition-all shadow-[0_0_14px_rgba(168,85,247,0.35)] active:scale-95 cursor-pointer backdrop-blur-md"
            title="View Mission Instructions & Hints"
          >
            <HelpCircle size={15} className="text-purple-300" />
            <span>Instructions</span>
            {showInstructions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showInstructions && (
            <div className="absolute top-11 left-0 z-50 w-[350px] sm:w-[410px] max-w-[calc(100vw-2.5rem)] bg-[#100424]/98 border border-purple-500/50 rounded-xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 text-left normal-case">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-purple-800/40 pb-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <HelpCircle size={15} className="text-amber-400" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                    Master Reboot Guide
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInstructions(false)}
                  className="text-purple-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Step-by-Step Hints: Bubbly, Concise, and Friendly */}
              <div className="space-y-2.5 text-xs sm:text-[13px] text-purple-100 font-sans leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-indigo-400/30">
                    1
                  </span>
                  <span>
                    <strong className="text-indigo-300 font-bold">Connect:</strong> Snap all 5 <span className="text-indigo-300 font-bold">Link to Astrolink</span> blocks at the top!
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-emerald-400/30">
                    2
                  </span>
                  <span>
                    <strong className="text-emerald-300 font-bold">Sequence:</strong> Pop in the <span className="text-emerald-300 font-bold">Master Reboot Program</span> block right below them!
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-amber-400/30">
                    3
                  </span>
                  <span>
                    <strong className="text-amber-300 font-bold">Repairs:</strong> Nest all 5 <span className="text-amber-300 font-bold">Restore System</span> blocks inside the program!
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-cyan-400/30">
                    4
                  </span>
                  <span>
                    <strong className="text-cyan-300 font-bold">Launch:</strong> Snap the <span className="text-cyan-300 font-bold">Power Up Astrolink</span> block at the bottom to fire it up!
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300/60 hidden sm:inline">STATUS:</span>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-all ${
              phase === 'synchronized'
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : phase === 'connecting'
                ? 'bg-purple-950/80 border-purple-400 text-purple-200 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                : 'bg-[#180a2c]/80 border-purple-900/50 text-purple-400/60'
            }`}
          >
            {phase === 'synchronized'
              ? 'SYNCHRONIZED'
              : phase === 'connecting'
              ? 'SYNCHRONIZING'
              : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Main Terminal Screen Area */}
      <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-between p-1 sm:p-2 relative overflow-hidden z-10">
        {/* SVG Radial Map Canvas - Centered in the Exact Middle (Radius 355, ViewBox 1000x1000) */}
        <div className="flex-1 min-h-0 w-full flex items-center justify-center relative">
          <div className="w-full h-full max-w-[940px] max-h-full aspect-square flex items-center justify-center relative">
            <svg viewBox="0 0 1000 1000" className="w-full h-full drop-shadow-2xl overflow-visible">
              <defs>
                {/* Official AstroLink Golden Structure Gradient */}
                <linearGradient id="astroGold" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#92400e" />
                  <stop offset="25%" stopColor="#d97706" />
                  <stop offset="55%" stopColor="#facc15" />
                  <stop offset="85%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
                {/* Official AstroLink Satin Blue Core Orb */}
                <radialGradient id="astroOrb" cx="42%" cy="38%" r="62%">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="85%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#075985" />
                </radialGradient>
                {/* Venus Chromatic Prismatic Aurora Gradient */}
                <linearGradient id="venusPrism" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EC4899" stopOpacity="0.95" />
                  <stop offset="25%" stopColor="#F43F5E" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#A855F7" stopOpacity="0.9" />
                  <stop offset="75%" stopColor="#06B6D4" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
                </linearGradient>
                {/* Mars Structural Hologram Gradient */}
                <linearGradient id="marsHolo" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="50%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
                {/* Mercury Logic Cyber Gradient */}
                <linearGradient id="mercuryCyber" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
                {/* Jupiter Data Matrix Gradient */}
                <linearGradient id="jupiterMatrix" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE047" />
                  <stop offset="50%" stopColor="#EAB308" />
                  <stop offset="100%" stopColor="#CA8A04" />
                </linearGradient>
                {/* Saturn Celestial Astrolabe Gradient */}
                <linearGradient id="saturnAstrolabe" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="40%" stopColor="#FACC15" />
                  <stop offset="75%" stopColor="#EAB308" />
                  <stop offset="100%" stopColor="#CA8A04" />
                </linearGradient>
                {/* Anti-Gravity Repulsor Glow Gradient for Gas Giant Star Base */}
                <linearGradient id="repulsorGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#0284C7" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0369A1" stopOpacity="0" />
                </linearGradient>
                {/* Star Base Platform Armor Hull Gradient */}
                <linearGradient id="starBaseHull" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2e1a47" />
                  <stop offset="50%" stopColor="#190933" />
                  <stop offset="100%" stopColor="#0f0521" />
                </linearGradient>
              </defs>

              {/* High-Visibility Cosmic Orbital Guide Ring (Expanded Radius) */}
              <circle
                cx={mapCenter.x}
                cy={mapCenter.y}
                r={radius}
                fill="none"
                stroke={allNodesGreen ? '#10B981' : '#c084fc'}
                strokeWidth={allNodesGreen ? '4' : '2.8'}
                strokeDasharray={allNodesGreen ? 'none' : '8 10'}
                opacity={allNodesGreen ? 0.95 : 0.85}
                filter={allNodesGreen ? 'drop-shadow(0 0 16px #10B981)' : 'drop-shadow(0 0 12px rgba(192, 132, 252, 0.8))'}
                className={allNodesGreen ? 'animate-pulse' : ''}
              />
              {/* Outer Orbit Guide Track Ring */}
              <circle
                cx={mapCenter.x}
                cy={mapCenter.y}
                r={radius + 24}
                fill="none"
                stroke={allNodesGreen ? '#10B981' : '#a855f7'}
                strokeWidth="1.2"
                strokeDasharray="4 12"
                opacity={allNodesGreen ? 0.6 : 0.35}
              />
              {/* Inner Orbit Guide Track Ring */}
              <circle
                cx={mapCenter.x}
                cy={mapCenter.y}
                r={radius - 24}
                fill="none"
                stroke={allNodesGreen ? '#10B981' : '#a855f7'}
                strokeWidth="1.2"
                strokeDasharray="4 12"
                opacity={allNodesGreen ? 0.6 : 0.35}
              />

              {/* Synchronized Climax: 5-Pointed Planetary Astrolink Pentagram Harmonic */}
              {allNodesGreen && (
                <polygon
                  points={`${nodePositions.mars.x},${nodePositions.mars.y} ${nodePositions.mercury.x},${nodePositions.mercury.y} ${nodePositions.saturn.x},${nodePositions.saturn.y} ${nodePositions.venus.x},${nodePositions.venus.y} ${nodePositions.jupiter.x},${nodePositions.jupiter.y}`}
                  fill="rgba(16, 185, 129, 0.05)"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeDasharray="6 8"
                  opacity="0.85"
                  filter="drop-shadow(0 0 14px rgba(16,185,129,0.8))"
                >
                  <animate attributeName="opacity" values="0.45; 0.95; 0.45" dur="2.4s" repeatCount="indefinite" />
                </polygon>
              )}

              {/* Connecting Vector Lines from Earth to Planets with Dynamic Animation */}
              {EARTH_3_PLANET_NODES.map(planet => {
                const pos = nodePositions[planet.id];
                const isConnected = connectedLines.includes(planet.id);

                return (
                  <g key={`line-${planet.id}`}>
                    {/* Base offline line (dormant subtle cosmic line) */}
                    <line
                      x1={mapCenter.x}
                      y1={mapCenter.y}
                      x2={pos.x}
                      y2={pos.y}
                      stroke="#2e1a47"
                      strokeWidth="1.5"
                      strokeDasharray="4 6"
                      opacity="0.35"
                    />

                    {/* Targeting Laser Pointer & Lock-on Aiming Beam (Pre-connection charge) */}
                    {targetingPlanet === planet.id && (
                      <g>
                        <line
                          x1={mapCenter.x}
                          y1={mapCenter.y}
                          x2={pos.x}
                          y2={pos.y}
                          stroke={planet.color}
                          strokeWidth="2.5"
                          strokeDasharray="8 5"
                          opacity="0.95"
                          filter={`drop-shadow(0 0 10px ${planet.color})`}
                        />
                        <circle r="3.5" fill="#FFFFFF">
                          <animateMotion
                            path={`M ${mapCenter.x} ${mapCenter.y} L ${pos.x} ${pos.y}`}
                            dur="0.35s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* Lock-On Rotating Crosshair Bracket */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="78"
                          fill="none"
                          stroke={planet.color}
                          strokeWidth="1.8"
                          strokeDasharray="14 18"
                          opacity="0.95"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from={`0 ${pos.x} ${pos.y}`}
                            to={`360 ${pos.x} ${pos.y}`}
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <text
                          x={pos.x}
                          y={pos.y - 82}
                          textAnchor="middle"
                          fill={planet.color}
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          letterSpacing="1.5"
                          filter={`drop-shadow(0 0 6px ${planet.color})`}
                        >
                          [ TARGETING ]
                        </text>
                      </g>
                    )}

                    {/* Active energized line with laser glow & traveling energy particle */}
                    {isConnected && (
                      <g>
                        {/* Outer Glow Laser Beam */}
                        <line
                          x1={mapCenter.x}
                          y1={mapCenter.y}
                          x2={pos.x}
                          y2={pos.y}
                          stroke={allNodesGreen ? '#10B981' : planet.color}
                          strokeWidth={allNodesGreen ? '7' : '5'}
                          opacity={allNodesGreen ? 0.5 : 0.4}
                          strokeLinecap="round"
                          filter={`drop-shadow(0 0 10px ${allNodesGreen ? '#10B981' : planet.color})`}
                        />
                        {/* Inner Core Bright Beam */}
                        <line
                          x1={mapCenter.x}
                          y1={mapCenter.y}
                          x2={pos.x}
                          y2={pos.y}
                          stroke={allNodesGreen ? '#6EE7B7' : '#FFFFFF'}
                          strokeWidth={allNodesGreen ? '3' : '2.2'}
                          strokeLinecap="round"
                        />
                        {/* High-Frequency Data Pulses Transmitting along Vector */}
                        <circle r="4" fill="#FFFFFF" filter={`drop-shadow(0 0 8px ${allNodesGreen ? '#10B981' : planet.color})`}>
                          <animateMotion
                            path={`M ${mapCenter.x} ${mapCenter.y} L ${pos.x} ${pos.y}`}
                            dur="1.2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {allNodesGreen && (
                          <circle r="3" fill="#A7F3D0">
                            <animateMotion
                              path={`M ${pos.x} ${pos.y} L ${mapCenter.x} ${mapCenter.y}`}
                              dur="1s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Central Earth Node (No Harsh Border - Pure Floating Celestial Body) */}
              <g className="cursor-default">
                {/* Outer Radiant Pulse Aura (Scaled Up) */}
                {(allNodesGreen || isRunning) && (
                  <>
                    <circle
                      cx={mapCenter.x}
                      cy={mapCenter.y}
                      r="132"
                      fill={allNodesGreen ? 'rgba(16,185,129,0.22)' : 'rgba(168,85,247,0.2)'}
                      className="animate-pulse"
                    />
                    {/* Global Sweeping Radar Calibration Ring */}
                    <circle
                      cx={mapCenter.x}
                      cy={mapCenter.y}
                      r="188"
                      fill="none"
                      stroke={allNodesGreen ? '#10B981' : '#c084fc'}
                      strokeWidth="1.5"
                      strokeDasharray="6 10"
                      opacity="0.45"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 ${mapCenter.x} ${mapCenter.y}`}
                        to={`360 ${mapCenter.x} ${mapCenter.y}`}
                        dur="10s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}

                {/* Soft Ambient Core Halo */}
                <circle
                  cx={mapCenter.x}
                  cy={mapCenter.y}
                  r="106"
                  fill={allNodesGreen ? '#064E3B' : isRunning ? '#3b0764' : 'transparent'}
                  opacity={allNodesGreen || isRunning ? 0.35 : 0}
                  className="transition-all duration-500"
                />

                {/* Solid Opaque Disc behind Earth so stars/lines never show through */}
                <circle
                  cx={mapCenter.x}
                  cy={mapCenter.y}
                  r="88"
                  fill="#0c071e"
                />

                {/* Real Earth Celestial SVG Image (Scaled Up to 200x200 & 100% Opaque) */}
                <image
                  href="/assets/planets/celestial/Earth.svg"
                  x={mapCenter.x - 100}
                  y={mapCenter.y - 100}
                  width="200"
                  height="200"
                  preserveAspectRatio="xMidYMid meet"
                  className="transition-all duration-500"
                  style={{
                    filter: allNodesGreen
                      ? 'drop-shadow(0 0 28px rgba(16,185,129,0.95))'
                      : isRunning
                      ? 'drop-shadow(0 0 24px rgba(192,132,252,0.85))'
                      : 'grayscale(100%) brightness(0.65) contrast(0.95)',
                    opacity: 1,
                  }}
                />

                {/* Master AstroLink Central Tower on Earth (Tippy Top, Centered Horizontally & Scaled Up) */}
                <g transform={`translate(${mapCenter.x}, ${mapCenter.y - 98}) scale(1.65)`} className="transition-all duration-500">
                  {/* Tripod Anchor Legs */}
                  <path d="M -7,16 L 0,0 L 7,16" fill="none" stroke="url(#astroGold)" strokeWidth="1.5" />
                  {/* Central Pylon Shaft */}
                  <line x1="0" y1="0" x2="0" y2="-15" stroke="url(#astroGold)" strokeWidth="2" />
                  {/* Central Blue Satin Communicator Orb */}
                  <circle cx="0" cy="-8" r="5" fill="url(#astroOrb)" stroke="url(#astroGold)" strokeWidth="1" />
                  {/* Angled Golden Planetary Ring around Orb */}
                  <ellipse cx="0" cy="-8" rx="8.5" ry="3" fill="none" stroke="url(#astroGold)" strokeWidth="1.2" transform="rotate(-15 0 -8)" />
                  {/* Top Antenna Mast */}
                  <line x1="0" y1="-13" x2="0" y2="-23" stroke="url(#astroGold)" strokeWidth="1.5" />
                  {/* Mast Collar */}
                  <ellipse cx="0" cy="-15" rx="3.5" ry="1.2" fill="url(#astroGold)" />
                  {/* Beacon Tip */}
                  <circle
                    cx="0"
                    cy="-23"
                    r={allNodesGreen ? '3.5' : isRunning ? '3' : '2.5'}
                    fill={allNodesGreen ? '#10B981' : isRunning ? '#c084fc' : '#eab308'}
                    filter={allNodesGreen || isRunning ? 'drop-shadow(0 0 8px #c084fc)' : undefined}
                  />
                  {/* Radio Waves emitted from Earth Hub */}
                  {(allNodesGreen || isRunning) && (
                    <circle cx="0" cy="-23" r="4" fill="none" stroke={allNodesGreen ? '#10B981' : '#c084fc'} strokeWidth="1.5">
                      <animate attributeName="r" values="4; 20" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9; 0" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>

                {/* Earth HQ Subtext */}
                <text
                  x={mapCenter.x}
                  y={mapCenter.y + 118}
                  textAnchor="middle"
                  fill={allNodesGreen ? '#A7F3D0' : isRunning ? '#F3E8FF' : '#8c84a8'}
                  fontSize="15"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  EARTH
                </text>
                <text
                  x={mapCenter.x}
                  y={mapCenter.y + 138}
                  textAnchor="middle"
                  fill={allNodesGreen ? '#6EE7B7' : isRunning ? '#D8B4FE' : '#686082'}
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  ASTROLINK HQ
                </text>
              </g>

              {/* Outer Planetary Nodes (Expanded Individual Circles & Exaggerated Custom Themed Effects) */}
              {EARTH_3_PLANET_NODES.map((planet, idx) => {
                const pos = nodePositions[planet.id];
                const isGreen = allNodesGreen;
                const isConnected = connectedLines.includes(planet.id);
                const isLatestActive =
                  connectedLines.length > 0 &&
                  connectedLines[connectedLines.length - 1] === planet.id &&
                  !isGreen;

                // Saturn has wide celestial rings, give it wider proportions
                const isSaturn = planet.id === 'saturn';
                const isGasGiant = planet.id === 'jupiter' || planet.id === 'saturn';
                const planetWidth = isSaturn ? 210 : 152;
                const planetHeight = isSaturn ? 210 : 152;

                return (
                  <g key={`node-${planet.id}`}>
                    {/* ========================================================= */}
                    {/* LAYER 1: EXPANDED CIRCLES & PULSE AURAS AROUND PLANET     */}
                    {/* ========================================================= */}

                    {/* 1. Permanent Outer Planetary Orbit Perimeter Ring (Expanded Boundary) */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSaturn ? 105 : 96}
                      fill="none"
                      stroke={isGreen ? '#10B981' : isConnected ? planet.color : '#6b21a8'}
                      strokeWidth={isGreen || isConnected ? '2' : '1.4'}
                      strokeDasharray="6 8"
                      opacity={isGreen ? 0.95 : isConnected ? 0.8 : 0.45}
                      filter={isGreen || isConnected ? `drop-shadow(0 0 10px ${isGreen ? '#10B981' : planet.color})` : undefined}
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from={`0 ${pos.x} ${pos.y}`}
                        to={`360 ${pos.x} ${pos.y}`}
                        dur="24s"
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* 2. Soft Expanded Diffuse Ambient Halo */}
                    {isGreen ? (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="106"
                        fill="#10B981"
                        fillOpacity="0.25"
                        className="animate-pulse"
                      />
                    ) : isConnected ? (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="98"
                        fill={planet.color}
                        fillOpacity="0.22"
                        className="animate-pulse"
                      />
                    ) : null}

                    {/* 3. Primary Expanded Sequential Radar Pulse Ring (Reaches r=142) */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="72"
                      fill="none"
                      stroke={isGreen ? '#10B981' : isConnected ? planet.color : '#a855f7'}
                      strokeWidth={isGreen || isConnected ? '3' : '2'}
                      opacity="0"
                    >
                      <animate
                        attributeName="r"
                        values="72; 142"
                        dur="2.8s"
                        begin={`${idx * 0.5}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0; 0.95; 0.45; 0"
                        dur="2.8s"
                        begin={`${idx * 0.5}s`}
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* 4. Secondary Trailing Expanded Ripple Wave (Offset by 0.45s) */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="72"
                      fill="none"
                      stroke={isGreen ? '#34D399' : isConnected ? planet.color : '#c084fc'}
                      strokeWidth={isGreen || isConnected ? '2' : '1.2'}
                      opacity="0"
                    >
                      <animate
                        attributeName="r"
                        values="72; 142"
                        dur="2.8s"
                        begin={`${idx * 0.5 + 0.45}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0; 0.7; 0.25; 0"
                        dur="2.8s"
                        begin={`${idx * 0.5 + 0.45}s`}
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* ========================================================= */}
                    {/* LAYER 2: PLANET CELESTIAL BODY & OPAQUE BACKING          */}
                    {/* ========================================================= */}
                    {/* Solid Opaque Disc behind Planet so stars/lines never show through */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSaturn ? 64 : 74}
                      fill="#0c071e"
                    />

                    {/* Real Planet Celestial SVG Image (Scaled Up to 152x152 / 210x210) */}
                    <image
                      href={planet.iconUrl}
                      x={pos.x - planetWidth / 2}
                      y={pos.y - planetHeight / 2}
                      width={planetWidth}
                      height={planetHeight}
                      preserveAspectRatio="xMidYMid meet"
                      className="transition-all duration-500"
                      style={{
                        filter: isGreen
                          ? 'drop-shadow(0 0 24px #10B981)'
                          : isConnected
                          ? `drop-shadow(0 0 24px ${planet.color})`
                          : 'grayscale(100%) brightness(0.65) contrast(0.95)',
                        opacity: 1,
                      }}
                    />

                    {/* ========================================================= */}
                    {/* LAYER 3: FOREGROUND EXAGGERATED THEMED EFFECTS            */}
                    {/* ========================================================= */}

                    {/* --- A. ACTIVE CONNECTION STRIKE & SHOCKWAVE BURSTS --- */}
                    {isLatestActive && (
                      <g className="pointer-events-none">
                        {/* 1. MARS: Structural Blueprint Scaffolding Frame Burst */}
                        {planet.id === 'mars' && (
                          <g>
                            {/* Expanding 3D Isometric Hologram Wireframe Frame */}
                            <rect
                              x={pos.x - 75}
                              y={pos.y - 75}
                              width="150"
                              height="150"
                              fill="none"
                              stroke="url(#marsHolo)"
                              strokeWidth="3.5"
                              strokeDasharray="12 8"
                            >
                              <animate attributeName="width" values="80; 195" dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="height" values="80; 195" dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="x" values={`${pos.x - 40}; ${pos.x - 97.5}`} dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="y" values={`${pos.y - 40}; ${pos.y - 97.5}`} dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                            </rect>
                            {/* Heavy 4 Corner Calipers ⌜ ⌝ ⌞ ⌟ */}
                            <path
                              d={`M ${pos.x - 100},${pos.y - 72} L ${pos.x - 100},${pos.y - 100} L ${pos.x - 72},${pos.y - 100} M ${pos.x + 72},${pos.y - 100} L ${pos.x + 100},${pos.y - 100} L ${pos.x + 100},${pos.y - 72} M ${pos.x - 100},${pos.y + 72} L ${pos.x - 100},${pos.y + 100} L ${pos.x - 72},${pos.y + 100} M ${pos.x + 72},${pos.y + 100} L ${pos.x + 100},${pos.y + 100} L ${pos.x + 100},${pos.y + 72}`}
                              fill="none"
                              stroke="#EF4444"
                              strokeWidth="3.5"
                              filter="drop-shadow(0 0 10px #EF4444)"
                            />
                            {/* Dual Vertical & Horizontal Laser Scanlines */}
                            <line
                              x1={pos.x - 85}
                              y1={pos.y - 85}
                              x2={pos.x + 85}
                              y2={pos.y - 85}
                              stroke="#F87171"
                              strokeWidth="3"
                              opacity="0.95"
                              filter="drop-shadow(0 0 12px #EF4444)"
                            >
                              <animate attributeName="y1" values={`${pos.y - 85}; ${pos.y + 85}; ${pos.y - 85}`} dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="y2" values={`${pos.y - 85}; ${pos.y + 85}; ${pos.y - 85}`} dur="1.2s" repeatCount="indefinite" />
                            </line>
                            <line
                              x1={pos.x - 85}
                              y1={pos.y - 85}
                              x2={pos.x - 85}
                              y2={pos.y + 85}
                              stroke="#FCA5A5"
                              strokeWidth="2"
                              opacity="0.8"
                            >
                              <animate attributeName="x1" values={`${pos.x - 85}; ${pos.x + 85}; ${pos.x - 85}`} dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="x2" values={`${pos.x - 85}; ${pos.x + 85}; ${pos.x - 85}`} dur="1.2s" repeatCount="indefinite" />
                            </line>
                            {/* Hexagonal Shockwave */}
                            <circle cx={pos.x} cy={pos.y} r="70" fill="none" stroke="#EF4444" strokeWidth="4">
                              <animate attributeName="r" values="70; 155" dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                            </circle>
                          </g>
                        )}

                        {/* 2. VENUS: Chromatic Prism Aurora Blast */}
                        {planet.id === 'venus' && (
                          <g>
                            {/* 16-Point Spectral Light Bloom Rays */}
                            {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg, i) => (
                              <line
                                key={i}
                                x1={pos.x}
                                y1={pos.y}
                                x2={pos.x + 145 * Math.cos((deg * Math.PI) / 180)}
                                y2={pos.y + 145 * Math.sin((deg * Math.PI) / 180)}
                                stroke={['#EC4899', '#A855F7', '#06B6D4', '#F43F5E'][i % 4]}
                                strokeWidth={i % 2 === 0 ? '3.5' : '2'}
                                opacity="0.95"
                                filter="drop-shadow(0 0 12px rgba(236,72,153,0.95))"
                              >
                                <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                              </line>
                            ))}
                            {/* Expanding Chromatic Prismatic Shockwave Rings */}
                            <circle cx={pos.x} cy={pos.y} r="70" fill="none" stroke="#EC4899" strokeWidth="4.5">
                              <animate attributeName="r" values="70; 155" dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                            </circle>
                            <circle cx={pos.x} cy={pos.y} r="65" fill="none" stroke="#A855F7" strokeWidth="3.5">
                              <animate attributeName="r" values="65; 145" dur="1.2s" begin="0.2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" begin="0.2s" repeatCount="indefinite" />
                            </circle>
                            <circle cx={pos.x} cy={pos.y} r="60" fill="none" stroke="#06B6D4" strokeWidth="3">
                              <animate attributeName="r" values="60; 135" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
                            </circle>
                          </g>
                        )}

                        {/* 3. MERCURY: Digital Binary Logic Shockwave */}
                        {planet.id === 'mercury' && (
                          <g>
                            {/* 12 Branching Circuit PCB Traces Bursting Out */}
                            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
                              const rad = (deg * Math.PI) / 180;
                              const xMid = pos.x + 65 * Math.cos(rad);
                              const yMid = pos.y + 65 * Math.sin(rad);
                              const xEnd = pos.x + 125 * Math.cos(rad);
                              const yEnd = pos.y + 125 * Math.sin(rad);
                              return (
                                <g key={i}>
                                  <line x1={xMid} y1={yMid} x2={xEnd} y2={yEnd} stroke="#F59E0B" strokeWidth="3.2" opacity="0.95" filter="drop-shadow(0 0 10px #F59E0B)">
                                    <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                                  </line>
                                  <circle cx={xEnd} cy={yEnd} r="4.5" fill="#38BDF8" filter="drop-shadow(0 0 10px #38BDF8)" />
                                </g>
                              );
                            })}
                            {/* Expanding Logic Diamond Gate */}
                            <rect
                              x={pos.x - 65}
                              y={pos.y - 65}
                              width="130"
                              height="130"
                              fill="none"
                              stroke="#F59E0B"
                              strokeWidth="3.8"
                              transform={`rotate(45 ${pos.x} ${pos.y})`}
                            >
                              <animate attributeName="width" values="70; 175" dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="height" values="70; 175" dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="x" values={`${pos.x - 35}; ${pos.x - 87.5}`} dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="y" values={`${pos.y - 35}; ${pos.y - 87.5}`} dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                            </rect>
                            <circle cx={pos.x} cy={pos.y} r="70" fill="none" stroke="#F59E0B" strokeWidth="4">
                              <animate attributeName="r" values="70; 155" dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                            </circle>
                          </g>
                        )}

                        {/* 4. JUPITER: Syntax Container Bracket Waves & Star Base Thruster Flare */}
                        {planet.id === 'jupiter' && (
                          <g>
                            {/* Star Base Repulsor Thruster Plume Surge */}
                            <ellipse cx={pos.x} cy={pos.y - 62} rx="30" ry="10" fill="#38BDF8" opacity="0.9" filter="drop-shadow(0 0 16px #38BDF8)">
                              <animate attributeName="rx" values="30; 65" dur="0.8s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.9; 0" dur="0.8s" repeatCount="indefinite" />
                            </ellipse>
                            {/* Massive Expanding Data Brackets [ ] */}
                            <text x={pos.x - 95} y={pos.y + 16} fill="#EAB308" fontSize="54" fontFamily="monospace" fontWeight="bold" filter="drop-shadow(0 0 14px #EAB308)">
                              [
                              <animate attributeName="x" values={`${pos.x - 65}; ${pos.x - 135}`} dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                            </text>
                            <text x={pos.x + 70} y={pos.y + 16} fill="#EAB308" fontSize="54" fontFamily="monospace" fontWeight="bold" filter="drop-shadow(0 0 14px #EAB308)">
                              ]
                              <animate attributeName="x" values={`${pos.x + 40}; ${pos.x + 110}`} dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                            </text>
                            <circle cx={pos.x} cy={pos.y} r="70" fill="none" stroke="#EAB308" strokeWidth="4">
                              <animate attributeName="r" values="70; 155" dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                            </circle>
                          </g>
                        )}

                        {/* 5. SATURN: Mathematical Astrolabe Resonance & Operator Shockwave */}
                        {planet.id === 'saturn' && (
                          <g>
                            {/* Inclined Astrolabe Harmonic Ellipses along Saturn's Ring Plane */}
                            <ellipse
                              cx={pos.x}
                              cy={pos.y}
                              rx="105"
                              ry="42"
                              fill="none"
                              stroke="#FACC15"
                              strokeWidth="4.5"
                              transform={`rotate(-14 ${pos.x} ${pos.y})`}
                            >
                              <animate attributeName="rx" values="90; 175" dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="ry" values="36; 70" dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                            </ellipse>
                            {/* Operator Wave Shockwave */}
                            <text x={pos.x - 110} y={pos.y + 6} fill="#FACC15" fontSize="34" fontFamily="monospace" fontWeight="bold" filter="drop-shadow(0 0 10px #CA8A04)">
                              &radic;
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                            </text>
                            <text x={pos.x + 95} y={pos.y + 6} fill="#FACC15" fontSize="34" fontFamily="monospace" fontWeight="bold" filter="drop-shadow(0 0 10px #CA8A04)">
                              &sum;
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                            </text>
                            <circle cx={pos.x} cy={pos.y} r="70" fill="none" stroke="#FACC15" strokeWidth="4">
                              <animate attributeName="r" values="70; 155" dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="1; 0" dur="1.2s" repeatCount="indefinite" />
                            </circle>
                          </g>
                        )}
                      </g>
                    )}

                    {/* --- B. PERSISTENT THEMED CURRICULUM EFFECTS (Rendered ON TOP of Planet) --- */}

                    {/* 1. MARS: STRUCTURE & ARCHITECTURE (Isometric Blueprint Hologram & Semantic DOM Nodes) */}
                    {planet.id === 'mars' && (isConnected || isGreen) && (
                      <g className="transition-all duration-500 pointer-events-none">
                        {/* Rotating Outer Hexagonal Blueprint Cage */}
                        <polygon
                          points={`${pos.x},${pos.y - 94} ${pos.x + 82},${pos.y - 47} ${pos.x + 82},${pos.y + 47} ${pos.x},${pos.y + 94} ${pos.x - 82},${pos.y + 47} ${pos.x - 82},${pos.y - 47}`}
                          fill="none"
                          stroke={isGreen ? '#10B981' : '#EF4444'}
                          strokeWidth="2.5"
                          strokeDasharray="8 6"
                          opacity="0.95"
                          filter={isGreen ? 'drop-shadow(0 0 12px #10B981)' : 'drop-shadow(0 0 12px #EF4444)'}
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from={`0 ${pos.x} ${pos.y}`}
                            to={`360 ${pos.x} ${pos.y}`}
                            dur="24s"
                            repeatCount="indefinite"
                          />
                        </polygon>
                        {/* Counter-rotating Inner Structural Compass Ring with Calibration Ticks */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="86"
                          fill="none"
                          stroke={isGreen ? '#34D399' : '#F87171'}
                          strokeWidth="1.5"
                          strokeDasharray="4 12"
                          opacity="0.85"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from={`360 ${pos.x} ${pos.y}`}
                            to={`0 ${pos.x} ${pos.y}`}
                            dur="16s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* 6 Structural Vertex Nodes */}
                        {[[-82, -47], [82, -47], [0, -94], [0, 94], [-82, 47], [82, 47]].map(([dx, dy], i) => (
                          <circle key={i} cx={pos.x + dx} cy={pos.y + dy} r="4.5" fill={isGreen ? '#10B981' : '#EF4444'} filter={isGreen ? 'drop-shadow(0 0 6px #10B981)' : 'drop-shadow(0 0 6px #EF4444)'}>
                            <animate attributeName="r" values="3.5; 5.5; 3.5" dur="1.8s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                          </circle>
                        ))}
                        {/* Floating Semantic HTML Structure Badges */}
                        <g transform={`translate(${pos.x - 104}, ${pos.y - 62})`}>
                          <rect x="0" y="0" width="54" height="22" rx="5" fill="#180404" stroke={isGreen ? '#10B981' : '#EF4444'} strokeWidth="1.4" opacity="0.95" />
                          <text x="27" y="15" textAnchor="middle" fill={isGreen ? '#6EE7B7' : '#FCA5A5'} fontSize="11" fontFamily="monospace" fontWeight="bold">&lt;grid&gt;</text>
                        </g>
                        <g transform={`translate(${pos.x + 52}, ${pos.y + 44})`}>
                          <rect x="0" y="0" width="52" height="22" rx="5" fill="#180404" stroke={isGreen ? '#10B981' : '#EF4444'} strokeWidth="1.4" opacity="0.95" />
                          <text x="26" y="15" textAnchor="middle" fill={isGreen ? '#6EE7B7' : '#FCA5A5'} fontSize="11" fontFamily="monospace" fontWeight="bold">&lt;dom&gt;</text>
                        </g>
                        <g transform={`translate(${pos.x + 50}, ${pos.y - 60})`}>
                          <rect x="0" y="0" width="54" height="20" rx="4" fill="#180404" stroke={isGreen ? '#10B981' : '#F87171'} strokeWidth="1.2" opacity="0.9" />
                          <text x="27" y="14" textAnchor="middle" fill={isGreen ? '#6EE7B7' : '#FECACA'} fontSize="10" fontFamily="monospace" fontWeight="bold">&lt;flex&gt;</text>
                        </g>
                      </g>
                    )}

                    {/* 2. VENUS: COLORS & STYLING (Prismatic Chromatic Aurora Ribbons & Floating CSS Tokens) */}
                    {planet.id === 'venus' && (isConnected || isGreen) && (
                      <g className="transition-all duration-500 pointer-events-none">
                        {/* Outer Counter-Rotating Prismatic Aurora Ribbon */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="92"
                          fill="none"
                          stroke="url(#venusPrism)"
                          strokeWidth="4.5"
                          strokeDasharray="22 10 6 10"
                          filter="drop-shadow(0 0 16px rgba(236,72,153,0.95))"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from={`0 ${pos.x} ${pos.y}`}
                            to={`360 ${pos.x} ${pos.y}`}
                            dur="10s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* Middle Prismatic Glow Track */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="104"
                          fill="none"
                          stroke="#06B6D4"
                          strokeWidth="1.8"
                          strokeDasharray="6 12"
                          opacity="0.85"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from={`360 ${pos.x} ${pos.y}`}
                            to={`0 ${pos.x} ${pos.y}`}
                            dur="14s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* Floating CSS Color Swatches / Token Badges */}
                        <g transform={`translate(${pos.x - 105}, ${pos.y - 56})`}>
                          <rect x="0" y="0" width="56" height="22" rx="5" fill="#1b031c" stroke="#EC4899" strokeWidth="1.4" opacity="0.95" />
                          <circle cx="10" cy="11" r="5" fill="#EC4899" filter="drop-shadow(0 0 4px #EC4899)" />
                          <text x="32" y="15" textAnchor="middle" fill="#F472B6" fontSize="10.5" fontFamily="monospace" fontWeight="bold">#ec48</text>
                        </g>
                        <g transform={`translate(${pos.x + 52}, ${pos.y + 44})`}>
                          <rect x="0" y="0" width="56" height="22" rx="5" fill="#041820" stroke="#06B6D4" strokeWidth="1.4" opacity="0.95" />
                          <circle cx="10" cy="11" r="5" fill="#06B6D4" filter="drop-shadow(0 0 4px #06B6D4)" />
                          <text x="32" y="15" textAnchor="middle" fill="#67E8F9" fontSize="10.5" fontFamily="monospace" fontWeight="bold">hsl()</text>
                        </g>
                        <g transform={`translate(${pos.x + 50}, ${pos.y - 62})`}>
                          <rect x="0" y="0" width="54" height="20" rx="4" fill="#1b031c" stroke="#A855F7" strokeWidth="1.2" opacity="0.95" />
                          <text x="27" y="14" textAnchor="middle" fill="#D8B4FE" fontSize="9.5" fontFamily="monospace" fontWeight="bold">blur()</text>
                        </g>
                        {/* Twinkling Prismatic Stardust Stars */}
                        {[[-72, 60], [68, -64], [0, 102], [-65, -60], [70, 60]].map(([dx, dy], i) => (
                          <text
                            key={i}
                            x={pos.x + dx}
                            y={pos.y + dy}
                            fill={i % 2 === 0 ? '#F472B6' : '#67E8F9'}
                            fontSize="16"
                            filter="drop-shadow(0 0 10px #EC4899)"
                          >
                            ✦
                            <animate attributeName="opacity" values="0.3; 1; 0.3" dur="1.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                          </text>
                        ))}
                      </g>
                    )}

                    {/* 3. MERCURY: LOGIC & CONDITIONS (Cybernetic Circuit Traces & Logic Gate Nodes) */}
                    {planet.id === 'mercury' && (isConnected || isGreen) && (
                      <g className="transition-all duration-500 pointer-events-none">
                        {/* Surrounding Circuit Conduit Ring with Travelling Electric Pulses */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="92"
                          fill="none"
                          stroke={isGreen ? '#10B981' : '#F59E0B'}
                          strokeWidth="2.8"
                          strokeDasharray="20 14 10 14"
                          filter={isGreen ? 'drop-shadow(0 0 12px #10B981)' : 'drop-shadow(0 0 12px #F59E0B)'}
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            values="0; 100"
                            dur="3.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        {/* 8 PCB Solder Pad Terminals with Capacitors */}
                        {[[0, -92], [65, -65], [92, 0], [65, 65], [0, 92], [-65, 65], [-92, 0], [-65, -65]].map(([dx, dy], i) => (
                          <g key={i}>
                            <circle cx={pos.x + dx} cy={pos.y + dy} r="4.5" fill="#180a2c" stroke={isGreen ? '#10B981' : '#F59E0B'} strokeWidth="1.6" />
                            <circle cx={pos.x + dx} cy={pos.y + dy} r="2.5" fill={isGreen ? '#34D399' : i % 2 === 0 ? '#38BDF8' : '#FCD34D'} />
                          </g>
                        ))}
                        {/* Floating Logic Condition Badges */}
                        <g transform={`translate(${pos.x - 104}, ${pos.y - 58})`}>
                          <rect x="0" y="0" width="56" height="22" rx="5" fill="#180c02" stroke={isGreen ? '#10B981' : '#F59E0B'} strokeWidth="1.4" opacity="0.95" />
                          <text x="28" y="15" textAnchor="middle" fill={isGreen ? '#6EE7B7' : '#FCD34D'} fontSize="11" fontFamily="monospace" fontWeight="bold">IF (x)</text>
                        </g>
                        <g transform={`translate(${pos.x + 52}, ${pos.y + 44})`}>
                          <rect x="0" y="0" width="56" height="22" rx="5" fill="#031622" stroke="#38BDF8" strokeWidth="1.4" opacity="0.95" />
                          <text x="28" y="15" textAnchor="middle" fill="#7DD3FC" fontSize="11" fontFamily="monospace" fontWeight="bold">TRUE</text>
                        </g>
                        <g transform={`translate(${pos.x + 50}, ${pos.y - 62})`}>
                          <rect x="0" y="0" width="52" height="20" rx="4" fill="#180c02" stroke={isGreen ? '#10B981' : '#F59E0B'} strokeWidth="1.2" opacity="0.9" />
                          <text x="26" y="14" textAnchor="middle" fill={isGreen ? '#6EE7B7' : '#FBBF24'} fontSize="9.5" fontFamily="monospace" fontWeight="bold">AND/OR</text>
                        </g>
                        {/* Floating Binary Bits Stream */}
                        <text x={pos.x - 72} y={pos.y + 64} fill={isGreen ? '#10B981' : '#F59E0B'} fontSize="15" fontFamily="monospace" fontWeight="bold" opacity="0.95">
                          1
                          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" repeatCount="indefinite" />
                        </text>
                        <text x={pos.x + 64} y={pos.y - 48} fill={isGreen ? '#10B981' : '#38BDF8'} fontSize="15" fontFamily="monospace" fontWeight="bold" opacity="0.95">
                          0
                          <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
                        </text>
                        <text x={pos.x - 72} y={pos.y - 20} fill={isGreen ? '#10B981' : '#34D399'} fontSize="13" fontFamily="monospace" fontWeight="bold" opacity="0.9">
                          1
                          <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" />
                        </text>
                      </g>
                    )}

                    {/* 4. JUPITER: DATA TYPES & CONTAINERS (Magnetic Containment Orbit & Floating Data Tokens) */}
                    {planet.id === 'jupiter' && (isConnected || isGreen) && (
                      <g className="transition-all duration-500 pointer-events-none">
                        {/* Dual Quantum Magnetic Containment Ellipses */}
                        <ellipse
                          cx={pos.x}
                          cy={pos.y}
                          rx="102"
                          ry="50"
                          fill="none"
                          stroke={isGreen ? '#10B981' : '#EAB308'}
                          strokeWidth="2.8"
                          strokeDasharray="14 10"
                          transform={`rotate(15 ${pos.x} ${pos.y})`}
                          filter={isGreen ? 'drop-shadow(0 0 12px #10B981)' : 'drop-shadow(0 0 12px #EAB308)'}
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from={`15 ${pos.x} ${pos.y}`}
                            to={`375 ${pos.x} ${pos.y}`}
                            dur="18s"
                            repeatCount="indefinite"
                          />
                        </ellipse>
                        <ellipse
                          cx={pos.x}
                          cy={pos.y}
                          rx="50"
                          ry="102"
                          fill="none"
                          stroke={isGreen ? '#34D399' : '#FDE047'}
                          strokeWidth="1.6"
                          strokeDasharray="8 14"
                          opacity="0.8"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from={`360 ${pos.x} ${pos.y}`}
                            to={`0 ${pos.x} ${pos.y}`}
                            dur="24s"
                            repeatCount="indefinite"
                          />
                        </ellipse>
                        {/* Floating Structured Data Capsules */}
                        <g transform={`translate(${pos.x - 108}, ${pos.y - 56})`}>
                          <rect x="0" y="0" width="58" height="22" rx="5" fill="#191302" stroke={isGreen ? '#10B981' : '#EAB308'} strokeWidth="1.4" opacity="0.95" />
                          <text x="29" y="15" textAnchor="middle" fill={isGreen ? '#6EE7B7' : '#FDE047'} fontSize="11" fontFamily="monospace" fontWeight="bold">[list]</text>
                        </g>
                        <g transform={`translate(${pos.x + 52}, ${pos.y + 40})`}>
                          <rect x="0" y="0" width="58" height="22" rx="5" fill="#191302" stroke={isGreen ? '#10B981' : '#EAB308'} strokeWidth="1.4" opacity="0.95" />
                          <text x="29" y="15" textAnchor="middle" fill={isGreen ? '#6EE7B7' : '#FDE047'} fontSize="11" fontFamily="monospace" fontWeight="bold">&#123;dict&#125;</text>
                        </g>
                        <g transform={`translate(${pos.x + 54}, ${pos.y - 62})`}>
                          <rect x="0" y="0" width="52" height="20" rx="4" fill="#191302" stroke={isGreen ? '#10B981' : '#FACC15'} strokeWidth="1.2" opacity="0.9" />
                          <text x="26" y="14" textAnchor="middle" fill={isGreen ? '#6EE7B7' : '#FEF08A'} fontSize="10" fontFamily="monospace" fontWeight="bold">&quot;str&quot;</text>
                        </g>
                      </g>
                    )}

                    {/* 5. SATURN: MATH & OPERATORS (Celestial Astrolabe Rings & Floating Math Formulas) */}
                    {planet.id === 'saturn' && (isConnected || isGreen) && (
                      <g className="transition-all duration-500 pointer-events-none">
                        {/* Dual Inclined Golden Celestial Astrolabe Rings matching Saturn's Ring Pitch (-14 deg) */}
                        <ellipse
                          cx={pos.x}
                          cy={pos.y}
                          rx="115"
                          ry="44"
                          fill="none"
                          stroke={isGreen ? '#10B981' : '#FACC15'}
                          strokeWidth="2.8"
                          strokeDasharray="18 9 6 9"
                          transform={`rotate(-14 ${pos.x} ${pos.y})`}
                          filter={isGreen ? 'drop-shadow(0 0 12px #10B981)' : 'drop-shadow(0 0 12px #CA8A04)'}
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            values="0; 80"
                            dur="4.5s"
                            repeatCount="indefinite"
                          />
                        </ellipse>
                        <ellipse
                          cx={pos.x}
                          cy={pos.y}
                          rx="125"
                          ry="48"
                          fill="none"
                          stroke={isGreen ? '#34D399' : '#FEF08A'}
                          strokeWidth="1.4"
                          strokeDasharray="4 12"
                          transform={`rotate(-14 ${pos.x} ${pos.y})`}
                          opacity="0.75"
                        />
                        {/* Floating Mathematical Tokens along Ring Plane */}
                        <g transform={`translate(${pos.x - 114}, ${pos.y - 28})`}>
                          <rect x="0" y="0" width="48" height="22" rx="5" fill="#1c1402" stroke={isGreen ? '#10B981' : '#FACC15'} strokeWidth="1.4" opacity="0.95" />
                          <text x="24" y="15" textAnchor="middle" fill={isGreen ? '#6EE7B7' : '#FDE047'} fontSize="11" fontFamily="monospace" fontWeight="bold">&sum;(x)</text>
                        </g>
                        <g transform={`translate(${pos.x + 72}, ${pos.y + 20})`}>
                          <rect x="0" y="0" width="46" height="22" rx="5" fill="#1c1402" stroke={isGreen ? '#10B981' : '#FACC15'} strokeWidth="1.4" opacity="0.95" />
                          <text x="23" y="15" textAnchor="middle" fill={isGreen ? '#6EE7B7' : '#FDE047'} fontSize="11" fontFamily="monospace" fontWeight="bold">&pi;&middot;r&sup2;</text>
                        </g>
                        {/* Additional Floating Math Operators */}
                        <text x={pos.x + 72} y={pos.y - 48} fill={isGreen ? '#10B981' : '#FDE047'} fontSize="18" fontFamily="monospace" fontWeight="bold" filter="drop-shadow(0 0 8px #CA8A04)">
                          &times;
                        </text>
                        <text x={pos.x - 78} y={pos.y + 54} fill={isGreen ? '#10B981' : '#FDE047'} fontSize="18" fontFamily="monospace" fontWeight="bold" filter="drop-shadow(0 0 8px #CA8A04)">
                          &divide;
                        </text>
                        <text x={pos.x - 4} y={pos.y - 74} fill={isGreen ? '#10B981' : '#FDE047'} fontSize="13" fontFamily="monospace" fontWeight="bold" filter="drop-shadow(0 0 8px #CA8A04)">
                          mod%
                        </text>
                        {/* Twinkling Golden Stardust */}
                        {[[-98, 8], [96, -14], [-40, -60], [40, 60]].map(([dx, dy], i) => (
                          <text key={i} x={pos.x + dx} y={pos.y + dy} fill="#FDE047" fontSize="14" filter="drop-shadow(0 0 6px #FACC15)">
                            ★
                            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
                          </text>
                        ))}
                      </g>
                    )}

                    {/* ========================================================= */}
                    {/* LAYER 4: PLANET ASTROLINK TOWER (On Tippy-Top)            */}
                    {/* ========================================================= */}
                    {isGasGiant ? (
                      /* Levitating Star Base Platform with Echoing Underside Hovers */
                      <g transform={`translate(${pos.x}, ${isSaturn ? pos.y - 68 : pos.y - 74}) scale(1.45)`} className="transition-all duration-500">
                        {/* Levitating Ambient Hover Bob */}
                        <g>
                          <animateTransform
                            attributeName="transform"
                            type="translate"
                            values="0 0; 0 -2.5; 0 0"
                            dur="2.8s"
                            repeatCount="indefinite"
                          />

                          {/* Echoing Hover Waves Radiating Downward to Gas Clouds */}
                          <g>
                            {/* Wave 1 */}
                            <ellipse cx="0" cy="4" rx="9" ry="2.5" fill="none" stroke="#38BDF8" strokeWidth="1.3">
                              <animate attributeName="rx" values="9; 22" dur="1.4s" repeatCount="indefinite" />
                              <animate attributeName="ry" values="2.5; 6" dur="1.4s" repeatCount="indefinite" />
                              <animate attributeName="cy" values="4; 16" dur="1.4s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.9; 0" dur="1.4s" repeatCount="indefinite" />
                            </ellipse>
                            {/* Wave 2 (Echoing offset by 0.7s) */}
                            <ellipse cx="0" cy="4" rx="9" ry="2.5" fill="none" stroke="#06B6D4" strokeWidth="1.1">
                              <animate attributeName="rx" values="9; 22" dur="1.4s" begin="0.7s" repeatCount="indefinite" />
                              <animate attributeName="ry" values="2.5; 6" dur="1.4s" begin="0.7s" repeatCount="indefinite" />
                              <animate attributeName="cy" values="4; 16" dur="1.4s" begin="0.7s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.9; 0" dur="1.4s" begin="0.7s" repeatCount="indefinite" />
                            </ellipse>
                            {/* Ion Thrust Cone Glow */}
                            <polygon points="-12,3 0,11 12,3 0,1" fill="url(#repulsorGlow)" />
                          </g>

                          {/* Star Base Platform Hull / Orbital Chassis */}
                          <path
                            d="M -18,2 L -12,-3 L 12,-3 L 18,2 L 11,5 L -11,5 Z"
                            fill="url(#starBaseHull)"
                            stroke="url(#astroGold)"
                            strokeWidth="1.2"
                            filter="drop-shadow(0 2px 6px rgba(0,0,0,0.85))"
                          />
                          {/* Inner Star Base Magnetic Landing Pad */}
                          <ellipse cx="0" cy="1" rx="8" ry="2.2" fill="#241344" stroke="#38BDF8" strokeWidth="0.8" />
                          {/* Perimeter Star Base Guidance Beacons */}
                          <circle cx="-16" cy="2" r="1.3" fill="#38BDF8" filter="drop-shadow(0 0 3px #38BDF8)" />
                          <circle cx="16" cy="2" r="1.3" fill="#38BDF8" filter="drop-shadow(0 0 3px #38BDF8)" />

                          {/* Mounted Astrolink Tower on Star Base */}
                          <path d="M -5,1 L 0,-8 L 5,1" fill="none" stroke="url(#astroGold)" strokeWidth="1.2" />
                          <line x1="0" y1="-8" x2="0" y2="-17" stroke="url(#astroGold)" strokeWidth="1.5" />
                          <circle cx="0" cy="-12" r="3.8" fill="url(#astroOrb)" stroke="url(#astroGold)" strokeWidth="0.8" />
                          <ellipse cx="0" cy="-12" rx="6.5" ry="2.2" fill="none" stroke="url(#astroGold)" strokeWidth="0.9" transform="rotate(-15 0 -12)" />
                          <line x1="0" y1="-16" x2="0" y2="-23" stroke="url(#astroGold)" strokeWidth="1.2" />
                          <ellipse cx="0" cy="-17" rx="2.5" ry="1" fill="url(#astroGold)" />
                          <circle
                            cx="0"
                            cy="-23"
                            r={isConnected || isGreen ? '2.5' : '1.8'}
                            fill={isGreen ? '#10B981' : isConnected ? planet.color : '#eab308'}
                            filter={isConnected || isGreen ? `drop-shadow(0 0 6px ${isGreen ? '#10B981' : planet.color})` : undefined}
                          />
                          {(isConnected || isGreen) && (
                            <circle
                              cx="0"
                              cy="-23"
                              r="3"
                              fill="none"
                              stroke={isGreen ? '#10B981' : planet.color}
                              strokeWidth="1.2"
                            >
                              <animate attributeName="r" values="3; 14" dur="1.2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.9; 0" dur="1.2s" repeatCount="indefinite" />
                            </circle>
                          )}
                        </g>
                      </g>
                    ) : (
                      /* Rocky Planets (Mars, Venus, Mercury): Rooted directly onto celestial ground */
                      <g transform={`translate(${pos.x}, ${pos.y - 74}) scale(1.45)`} className="transition-all duration-500">
                        {/* Tripod Anchor Struts */}
                        <path d="M -5,12 L 0,0 L 5,12" fill="none" stroke="url(#astroGold)" strokeWidth="1.2" />
                        {/* Pylon Column */}
                        <line x1="0" y1="0" x2="0" y2="-10" stroke="url(#astroGold)" strokeWidth="1.5" />
                        {/* Central Blue Satin Communicator Orb */}
                        <circle cx="0" cy="-5" r="3.8" fill="url(#astroOrb)" stroke="url(#astroGold)" strokeWidth="0.8" />
                        {/* Angled Golden Planetary Ring around Orb */}
                        <ellipse cx="0" cy="-5" rx="6.5" ry="2.2" fill="none" stroke="url(#astroGold)" strokeWidth="0.9" transform="rotate(-15 0 -5)" />
                        {/* Antenna Spire */}
                        <line x1="0" y1="-9" x2="0" y2="-16" stroke="url(#astroGold)" strokeWidth="1.2" />
                        {/* Antenna Collar */}
                        <ellipse cx="0" cy="-10" rx="2.5" ry="1" fill="url(#astroGold)" />
                        {/* Transmitter Beacon Tip */}
                        <circle
                          cx="0"
                          cy="-16"
                          r={isConnected || isGreen ? '2.5' : '1.8'}
                          fill={isGreen ? '#10B981' : isConnected ? planet.color : '#eab308'}
                          filter={isConnected || isGreen ? `drop-shadow(0 0 6px ${isGreen ? '#10B981' : planet.color})` : undefined}
                        />
                        {/* Broadcasting Signal Wave Arcs */}
                        {(isConnected || isGreen) && (
                          <circle
                            cx="0"
                            cy="-16"
                            r="3"
                            fill="none"
                            stroke={isGreen ? '#10B981' : planet.color}
                            strokeWidth="1.2"
                          >
                            <animate attributeName="r" values="3; 14" dur="1.2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.9; 0" dur="1.2s" repeatCount="indefinite" />
                          </circle>
                        )}
                      </g>
                    )}

                    {/* ========================================================= */}
                    {/* LAYER 5: PLANET LABELS                                    */}
                    {/* ========================================================= */}
                    {/* Planet Name */}
                    <text
                      x={pos.x}
                      y={pos.y + 94}
                      textAnchor="middle"
                      fill={
                        isGreen
                          ? '#A7F3D0'
                          : isConnected
                          ? '#FFFFFF'
                          : '#8c84a8'
                      }
                      fontSize="14.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {planet.name.toUpperCase()}
                    </text>

                    {/* Subtext Function Category */}
                    <text
                      x={pos.x}
                      y={pos.y + 112}
                      textAnchor="middle"
                      fill={
                        isGreen
                          ? '#34D399'
                          : isConnected
                          ? planet.color
                          : '#686082'
                      }
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {planet.repairDesc}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Live Status Feedback Ticker */}
        <div className="w-full max-w-[500px] shrink-0 mt-1 px-3 py-2 bg-[#140626]/90 border border-purple-800/40 rounded-lg flex items-center justify-between text-xs font-mono shadow-inner backdrop-blur-sm">
          <div className="flex items-center gap-2 truncate">
            <Cpu size={14} className={allNodesGreen ? 'text-emerald-400' : 'text-purple-400'} />
            <span
              className={`truncate text-[11px] font-semibold ${
                allNodesGreen ? 'text-emerald-300' : 'text-purple-200'
              }`}
            >
              {activeStepText}
            </span>
          </div>
          <span className="text-[10px] text-purple-300/70 shrink-0 font-medium ml-2">
            {connectedLines.length} / 5 LINKED
          </span>
        </div>

        {/* Climax Button: INITIALIZE SYSTEM RECORD */}
        {phase === 'synchronized' && (
          <div className="mt-2.5 w-full max-w-[500px] shrink-0 animate-in fade-in zoom-in-95 duration-300">
            <button
              type="button"
              onClick={onSimulationComplete}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400"
            >
              <CheckCircle2 size={16} />
              <span>INITIALIZE SYSTEM RECORD</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
