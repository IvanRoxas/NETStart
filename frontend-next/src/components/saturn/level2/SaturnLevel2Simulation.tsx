'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Saturn2ValidationResult } from '@/lib/saturn/saturnLevel2Definitions';
import { AlertTriangle, CheckCircle2, ShieldAlert, Cpu, ArrowRight, Zap, Flame, Cog, Sparkles, ChevronDown, ChevronUp, HelpCircle, X, ShieldCheck } from 'lucide-react';

export interface SaturnLevel2SimulationProps {
  validation: Saturn2ValidationResult;
  isRunning: boolean;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
  onShieldDeflected?: () => void;
  onUfoGreeted?: () => void;
  resetKey?: number;
}

type AnimationPhase = 'IDLE' | 'FLIGHT' | 'JAMMED' | 'COLLIDED' | 'RESTORED' | 'MEMORY_PANIC';

export interface ActiveDebris {
  id: string;
  material: 'Ice' | 'Rock' | 'Mineral' | 'Crystal' | 'Metal';
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  startX: number;
  startY: number;
  destX: number;
  destY: number;
  targetLane: 1 | 2 | 3 | 4 | null;
  state: 'approaching' | 'routing' | 'colliding';
  routeProgress: number; // 0 to 1
  speed: number;
  hasCase: boolean;
}

export interface SettledDebris {
  id: string;
  material: 'Ice' | 'Rock' | 'Mineral' | 'Crystal' | 'Metal';
  slotIndex: number; // 0 to 7 (8 slots max per orbit)
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
  shape?: 'circle' | 'spark' | 'smoke';
}

interface SpawnScheduleItem {
  time: number; // second offset within 60s
  type: 'DEBRIS' | 'ASTEROID' | 'UFO';
  material?: 'Ice' | 'Rock' | 'Mineral' | 'Crystal' | 'Metal';
  startX?: number;
}

// 32 fixed spawn timestamps across the 60s flight window
const DEBRIS_SPAWN_TIMESTAMPS: number[] = [
  1.0, 1.8, 3.2, 4.0, 5.4, 6.0, 7.8, 9.0, 10.8,
  // 12.5s -> ASTEROID HAZARD
  14.2, 14.8, 16.8, 18.0, 19.8, 20.4, 22.2, 24.0, 24.6, 26.8, 28.2, 30.2,
  // 32.0s -> ASTEROID HAZARD
  34.0, 34.6, 36.8, 38.2, 39.8, 40.4, 42.5, 44.0, 45.5, 47.0, 48.5,
];

// Generates a randomized debris schedule for each flight simulation run.
// Guarantees exactly 8 Ice, 8 Rock, 8 Mineral, and 8 Crystal (32 total),
// perfectly distributed across the 4 rings with randomized order of arrival & varied drop lanes.
export function generateRandomizedSchedule(): SpawnScheduleItem[] {
  const materials: ('Ice' | 'Rock' | 'Mineral' | 'Crystal')[] = [
    ...Array(8).fill('Ice'),
    ...Array(8).fill('Rock'),
    ...Array(8).fill('Mineral'),
    ...Array(8).fill('Crystal'),
  ];

  // Fisher-Yates shuffle to randomize debris arrival order
  for (let i = materials.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [materials[i], materials[j]] = [materials[j], materials[i]];
  }

  // Generate diverse, organic drop lanes (startX: 11% to 28%)
  const items: SpawnScheduleItem[] = DEBRIS_SPAWN_TIMESTAMPS.map((time, idx) => ({
    time,
    type: 'DEBRIS' as const,
    material: materials[idx],
    startX: Math.round(11 + Math.random() * 17),
  }));

  // Add the 2 critical asteroid hazard challenges
  items.push({ time: 12.5, type: 'ASTEROID' });
  items.push({ time: 32.0, type: 'ASTEROID' });

  // Chronologically order all spawn events
  items.sort((a, b) => a.time - b.time);
  return items;
}

// Helper to calculate exact coordinates for the 8 slots along each orbit ring arc
// Tailored per radius so all 8 slots cover the entire visible arc of each orbit
export function getOrbitSlotPosition(orbit: 1 | 2 | 3 | 4, slotIndex: number): { x: number; y: number } {
  const radiusMap: Record<1 | 2 | 3 | 4, number> = {
    1: 760,
    2: 630,
    3: 500,
    4: 370,
  };
  const R = radiusMap[orbit];
  const centerX = 1200;
  const centerY = 300;

  // Max angle offset tailored to radius so all 8 debris slots cover the entire visible arc of each orbit
  const maxOffsets: Record<1 | 2 | 3 | 4, number> = {
    1: 0.35,
    2: 0.43,
    3: 0.55,
    4: 0.78,
  };
  const maxO = maxOffsets[orbit];
  // 8 evenly distributed slots spanning from top to bottom (-maxO to +maxO), with 4 above and 4 below the center ORBIT label
  const slotSteps = [-1.0, -0.72, -0.45, -0.18, 0.18, 0.45, 0.72, 1.0];
  const offset = slotSteps[Math.min(slotIndex, 7)] * maxO;
  const theta = Math.PI + offset;
  const svgX = centerX + R * Math.cos(theta);
  const svgY = centerY + R * Math.sin(theta);
  return {
    x: (svgX / 1000) * 100,
    y: (svgY / 600) * 100,
  };
}

export default function SaturnLevel2Simulation({
  validation,
  isRunning,
  onSimulationComplete,
  onShieldDeflected,
  onUfoGreeted,
  resetKey,
}: SaturnLevel2SimulationProps) {
  // Core Auto-Scroller & Real-Time Flight States
  const [phase, setPhase] = useState<AnimationPhase>('IDLE');
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [activeDebrisList, setActiveDebrisList] = useState<ActiveDebris[]>([]);
  const activeDebrisListRef = useRef<ActiveDebris[]>([]);
  const [settledDebris, setSettledDebris] = useState<Record<1 | 2 | 3 | 4, SettledDebris[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
  });
  const settledDebrisRef = useRef<Record<1 | 2 | 3 | 4, SettledDebris[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
  });
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdCounterRef = useRef<number>(0);

  // Starship Collision & Explosion State
  const [isShipExploding, setIsShipExploding] = useState<boolean>(false);
  const [isLaserScanning, setIsLaserScanning] = useState<boolean>(false);

  // Lane Highlight States (Orbits 1-4)
  const [laneStatus, setLaneStatus] = useState<{
    lane1: 'idle' | 'active' | 'success' | 'jammed';
    lane2: 'idle' | 'active' | 'success' | 'jammed';
    lane3: 'idle' | 'active' | 'success' | 'jammed';
    lane4: 'idle' | 'active' | 'success' | 'jammed';
  }>({
    lane1: 'idle',
    lane2: 'idle',
    lane3: 'idle',
    lane4: 'idle',
  });

  // Massive Asteroid Hazard & Starship Energy Shield States
  const [isAsteroidWarning, setIsAsteroidWarning] = useState<boolean>(false);
  const [isAsteroidActive, setIsAsteroidActive] = useState<boolean>(false);
  const isAsteroidActiveRef = useRef<boolean>(false);
  const [asteroidY, setAsteroidY] = useState<number>(-18);
  const asteroidYRef = useRef<number>(-18);
  const [isAsteroidDestroyed, setIsAsteroidDestroyed] = useState<boolean>(false);
  const isAsteroidDestroyedRef = useRef<boolean>(false);
  const [isShieldActive, setIsShieldActive] = useState<boolean>(false);
  const isShieldActiveRef = useRef<boolean>(false);
  const hasDestroyedDebrisRef = useRef<boolean>(false);
  const destroyedDebrisCountRef = useRef<number>(0);

  // Victory & Transition States
  const [showRestoredBanner, setShowRestoredBanner] = useState<boolean>(false);
  const [isViewportSmall, setIsViewportSmall] = useState<boolean>(false);

  // Instructions Dropdown States
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const instructionsRef = useRef<HTMLDivElement>(null);

  // Click outside listener for Instructions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (instructionsRef.current && !instructionsRef.current.contains(e.target as Node)) {
        setShowInstructions(false);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('mousedown', handleClickOutside);
      return () => window.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  // Viewport constraint detector
  useEffect(() => {
    const checkViewport = () => {
      if (typeof window !== 'undefined') {
        setIsViewportSmall(window.innerWidth < 1024);
      }
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Canvas and Orb Anchor refs for exact ray emitter alignment
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const orbAnchorRef = useRef<HTMLDivElement>(null);
  const [orbCoords, setOrbCoords] = useState<{ x: number; y: number }>({ x: 17.5, y: 76 });

  const updateOrbCoords = useCallback(() => {
    if (orbAnchorRef.current && canvasContainerRef.current) {
      const oRect = orbAnchorRef.current.getBoundingClientRect();
      const cRect = canvasContainerRef.current.getBoundingClientRect();
      if (cRect.width > 0 && cRect.height > 0) {
        const x = ((oRect.left + oRect.width / 2 - cRect.left) / cRect.width) * 100;
        const y = ((oRect.top + oRect.height / 2 - cRect.top) / cRect.height) * 100;
        setOrbCoords({ x, y });
      }
    }
  }, []);

  // Update orb coords on mount and window resize
  useEffect(() => {
    updateOrbCoords();
    const handleResize = () => updateOrbCoords();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateOrbCoords]);

  // Refs for tracking simulation loop and lifecycle
  const scheduleRef = useRef<SpawnScheduleItem[]>(generateRandomizedSchedule());
  const elapsedRef = useRef<number>(0);
  const flightStartTimeRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(0);
  const spawnedScheduleIndicesRef = useRef<Set<number>>(new Set());
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const isCancelledRef = useRef<boolean>(false);

  const clearAllTimers = () => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    timeoutRefs.current.forEach((t) => clearTimeout(t));
    timeoutRefs.current = [];
  };

  // Web Audio API Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastTractorSoundTimeRef = useRef<number>(0);

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Audio: Laser Scan Chirp
  const playLaserScanChirp = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1900, now + 0.15);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  };

  // Audio: Tractor Beam Drone (Throttled for concurrent instances)
  const playTractorBeamDrone = () => {
    const nowMs = Date.now();
    if (nowMs - lastTractorSoundTimeRef.current < 250) return;
    lastTractorSoundTimeRef.current = nowMs;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.4);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  };

  // Audio: Ice Crystallization Chime
  const playMelterHiss = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [659.25, 1046.50].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + idx * 0.05 + 0.25);
      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.25);
    });
  };

  // Audio: Crusher Stone Crunch (Rock)
  const playCrusherCrunch = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  };

  // Audio: Magnet Electrical Harmonic Tone (Minerals)
  const playMagnetZap = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [620, 840, 1120].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.11, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.18);
    });
  };

  // Audio: Error Metallic Alert Clang
  const playJamClangBuzz = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const clang = ctx.createOscillator();
    const cGain = ctx.createGain();
    clang.type = 'triangle';
    clang.frequency.setValueAtTime(350, now);
    clang.frequency.exponentialRampToValueAtTime(140, now + 0.3);
    cGain.gain.setValueAtTime(0.25, now);
    cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    clang.connect(cGain);
    cGain.connect(ctx.destination);
    clang.start(now);
    clang.stop(now + 0.3);

    const buzz = ctx.createOscillator();
    const bGain = ctx.createGain();
    buzz.type = 'triangle';
    buzz.frequency.setValueAtTime(180, now + 0.1);
    bGain.gain.setValueAtTime(0.2, now + 0.1);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    buzz.connect(bGain);
    bGain.connect(ctx.destination);
    buzz.start(now + 0.1);
    buzz.stop(now + 0.45);
  };

  // Audio: Low-Frequency Punchy Starship Crash
  const playExplosionSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.45);
      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.48);
    } catch (e) { }
  };

  // Audio: Shield Deflection & Resonant Energy Barrier Ricochet
  const playShieldDeflectSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [440, 880, 1320, 1760].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.35);
      gain.gain.setValueAtTime(0.2 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    });
  };

  // Audio: False Victory Orchestral Chord
  const playFalseVictoryChord = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.4);
    });
  };

  // Audio: Crystal Chime
  const playCrystalChime = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.14, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.3);
    });
  };

  // Helper: Spawn particles
  const spawnParticles = (x: number, y: number, color: string, count = 16, shape: 'circle' | 'spark' | 'smoke' = 'circle') => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      particleIdCounterRef.current += 1;
      newParticles.push({
        id: `p-${particleIdCounterRef.current}-${Math.random().toString(36).substring(2, 6)}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: shape === 'spark' ? Math.random() * 4 + 3 : Math.random() * 5 + 3,
        opacity: 1,
        shape,
      });
    }
    setParticles((prev) => [...prev.slice(-40), ...newParticles]);
  };

  // Update particles loop with static interval to prevent teardown churn
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => {
        if (prev.length === 0) return prev;
        return prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.4,
            y: p.y + p.vy * 0.4,
            opacity: p.opacity - 0.045,
            size: Math.max(0, p.size - 0.2),
          }))
          .filter((p) => p.opacity > 0);
      });
    }, 25);
    return () => clearInterval(interval);
  }, []);

  // Handle Level Reset / Abort (Immediate Synchronous Reset)
  useEffect(() => {
    if (resetKey === undefined || resetKey === 0) return;
    isCancelledRef.current = true;
    clearAllTimers();
    scheduleRef.current = generateRandomizedSchedule();
    setPhase('IDLE');
    setTimeRemaining(60);
    elapsedRef.current = 0;
    spawnedScheduleIndicesRef.current.clear();
    activeDebrisListRef.current = [];
    setActiveDebrisList([]);
    settledDebrisRef.current = { 1: [], 2: [], 3: [], 4: [] };
    setSettledDebris({ 1: [], 2: [], 3: [], 4: [] });
    setParticles([]);
    setIsShipExploding(false);
    setIsLaserScanning(false);
    setIsAsteroidWarning(false);
    setIsAsteroidActive(false);
    isAsteroidActiveRef.current = false;
    setAsteroidY(-18);
    asteroidYRef.current = -18;
    setIsAsteroidDestroyed(false);
    isAsteroidDestroyedRef.current = false;
    setIsShieldActive(false);
    isShieldActiveRef.current = false;
    hasDestroyedDebrisRef.current = false;
    destroyedDebrisCountRef.current = 0;
    setShowRestoredBanner(false);
    setShowInstructions(false);
    setLaneStatus({ lane1: 'idle', lane2: 'idle', lane3: 'idle', lane4: 'idle' });
  }, [resetKey]);

  // Destination chute coordinates for the 4 orbits:
  const orbitDestCoords: Record<1 | 2 | 3 | 4, { x: number; y: number }> = {
    1: { x: 48, y: 22 },
    2: { x: 59, y: 46 },
    3: { x: 72, y: 70 },
    4: { x: 84, y: 82 },
  };

  // Spawn a debris item at the upper left
  const spawnDebris = (material: 'Ice' | 'Rock' | 'Mineral' | 'Crystal' | 'Metal', startX: number) => {
    if (isCancelledRef.current) return;
    const newDebris: ActiveDebris = {
      id: `debris-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      material,
      x: startX,
      y: -6,
      startX,
      startY: -6,
      destX: 48,
      destY: 22,
      targetLane: null,
      state: 'approaching',
      routeProgress: 0,
      speed: 13.5, // % per second
      hasCase: true,
    };
    activeDebrisListRef.current = [...activeDebrisListRef.current, newDebris];
    setActiveDebrisList(activeDebrisListRef.current);
  };

  // Settle a debris into its orbit ring (max 8 per ring)
  const handleDebrisSettled = (debris: ActiveDebris) => {
    if (isCancelledRef.current || !debris.targetLane) return;
    const targetLane = debris.targetLane;
    const dest = orbitDestCoords[targetLane];

    const isCorrectRouting =
      (targetLane === 1 && debris.material === 'Ice') ||
      (targetLane === 2 && debris.material === 'Rock') ||
      (targetLane === 3 && (debris.material === 'Mineral' || (debris.material as string) === 'Metal')) ||
      (targetLane === 4 && debris.material === 'Crystal');

    if (isCorrectRouting) {
      setLaneStatus((prev) => ({ ...prev, [`lane${targetLane}`]: 'success' }));

      // VFX & SFX Payoff
      if (debris.material === 'Ice') {
        playMelterHiss();
        spawnParticles(dest.x, dest.y, '#E0F2FE', 16, 'smoke');
      } else if (debris.material === 'Rock') {
        playCrusherCrunch();
        spawnParticles(dest.x, dest.y, '#92400E', 18, 'circle');
      } else if (debris.material === 'Mineral' || (debris.material as string) === 'Metal') {
        playMagnetZap();
        spawnParticles(dest.x, dest.y, '#38BDF8', 18, 'spark');
      } else if (debris.material === 'Crystal') {
        playCrystalChime();
        spawnParticles(dest.x, dest.y, '#C084FC', 18, 'spark');
      }

      // Add to settled debris list along ring (max 8 slots) with strict deduplication
      setSettledDebris((prev) => {
        const currentList = prev[targetLane];
        if (currentList.some((item) => item.id === debris.id)) {
          return prev;
        }
        if (currentList.length < 8) {
          const updated = {
            ...prev,
            [targetLane]: [
              ...currentList,
              {
                id: debris.id,
                material: debris.material,
                slotIndex: currentList.length,
              },
            ],
          };
          settledDebrisRef.current = updated;
          return updated;
        }
        return prev;
      });

      // Clear success glow after 600ms
      setTimeout(() => {
        if (!isCancelledRef.current) {
          setLaneStatus((prev) => ({ ...prev, [`lane${targetLane}`]: 'idle' }));
        }
      }, 600);
    } else {
      // Misrouted debris causes system jam!
      clearAllTimers();
      setPhase('JAMMED');
      setLaneStatus((prev) => ({ ...prev, [`lane${targetLane}`]: 'jammed' }));
      playJamClangBuzz();
      spawnParticles(dest.x, dest.y, '#EF4444', 24, 'spark');

      const errorMsg = `CRITICAL JAM: Material '${debris.material}' misrouted to Orbit ${targetLane}. Check the Ring Placements guide to route correctly.`;
      onSimulationComplete?.(false, errorMsg);
    }
  };

  // Spaceship collision handler: starship explodes when unhandled debris crashes into it!
  const handleShipCollision = (debris: ActiveDebris) => {
    isCancelledRef.current = true;
    clearAllTimers();
    setPhase('COLLIDED');
    setIsShipExploding(true);
    activeDebrisListRef.current = [];
    setActiveDebrisList([]);

    // Sound & Explosion Particles
    playExplosionSound();
    spawnParticles(18, 70, '#ef4444', 35, 'spark');
    spawnParticles(18, 70, '#f97316', 25, 'circle');
    spawnParticles(18, 70, '#fbbf24', 20, 'spark');

    const tFail = setTimeout(() => {
      onSimulationComplete?.(
        false,
        `COLLISION DETECTED: Starship struck by unrouted ${debris.material} Debris! Add a 'Case ${debris.material} Debris' block to safely route it before impact.`
      );
    }, 1200);
    timeoutRefs.current.push(tFail);
  };

  // Massive Asteroid Hazard Trigger
  const triggerAsteroidHazard = () => {
    if (isCancelledRef.current) return;
    setIsAsteroidWarning(true);
    playLaserScanChirp();

    // After 1.2s warning telegraph, asteroid begins atmospheric descent
    const tSpawn = setTimeout(() => {
      if (isCancelledRef.current) return;
      setIsAsteroidWarning(false);
      setIsAsteroidActive(true);
      isAsteroidActiveRef.current = true;
      setIsAsteroidDestroyed(false);
      isAsteroidDestroyedRef.current = false;
      asteroidYRef.current = -18;
      setAsteroidY(-18);
    }, 1200);
    timeoutRefs.current.push(tSpawn);
  };

  // Asteroid strike collision handler
  const handleAsteroidShipCollision = () => {
    isCancelledRef.current = true;
    clearAllTimers();
    setPhase('COLLIDED');
    setIsShipExploding(true);
    activeDebrisListRef.current = [];
    setActiveDebrisList([]);

    playExplosionSound();
    spawnParticles(18, 70, '#ef4444', 38, 'spark');
    spawnParticles(18, 70, '#f97316', 30, 'circle');
    spawnParticles(18, 70, '#fbbf24', 25, 'spark');

    const tFail = setTimeout(() => {
      onSimulationComplete?.(
        false,
        "CRITICAL IMPACT: Massive Asteroid destroyed the Starship! Add a 'Case Big Asteroid' and 'Activate Shield' block to protect your vessel."
      );
    }, 1200);
    timeoutRefs.current.push(tFail);
  };

  // ---------------------------------------------------------------------------
  // VICTORY SEQUENCE & LEVEL 3 MEMORY LEAK TRANSITION
  // ---------------------------------------------------------------------------
  const triggerVictorySequence = () => {
    setPhase('RESTORED');
    setShowRestoredBanner(true);
    playFalseVictoryChord();

    // Clean, natural victory completion without intrusive warning dialogues
    const tWin = setTimeout(() => {
      if (isCancelledRef.current) return;
      onSimulationComplete?.(true);
    }, 2200);
    timeoutRefs.current.push(tWin);
  };

  // ---------------------------------------------------------------------------
  // MAIN 60-SECOND REAL-TIME ENGINE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isRunning) {
      isCancelledRef.current = true;
      clearAllTimers();
      if (phase !== 'RESTORED' && phase !== 'MEMORY_PANIC') {
        setPhase('IDLE');
        setActiveDebrisList([]);
        setIsLaserScanning(false);
        setIsShipExploding(false);
        setIsAsteroidWarning(false);
        setIsAsteroidActive(false);
        isAsteroidActiveRef.current = false;
        setIsAsteroidDestroyed(false);
        isAsteroidDestroyedRef.current = false;
        setIsShieldActive(false);
        isShieldActiveRef.current = false;
        setLaneStatus({ lane1: 'idle', lane2: 'idle', lane3: 'idle', lane4: 'idle' });
      }
      return;
    }

    // Require Start block to execute simulation
    if (!validation.hasStart) {
      onSimulationComplete?.(false, "PROGRAM NOTICE: Every program needs a 'Start' block to run.");
      return;
    }

    if (!validation.hasRouteProto && !validation.hasShieldProto) {
      onSimulationComplete?.(false, "MISSING FUNCTIONS: Please add the 'Declare Function' blocks.");
      return;
    }

    if (!validation.hasRouteProto) {
      onSimulationComplete?.(false, "MISSING FUNCTION: Please add 'Declare Function: Route to Orbit'.");
      return;
    }

    if (!validation.hasShieldProto) {
      onSimulationComplete?.(false, "MISSING FUNCTION: Please add 'Declare Function: Activate Shield'.");
      return;
    }

    isCancelledRef.current = false;
    clearAllTimers();
    scheduleRef.current = generateRandomizedSchedule();
    setPhase('FLIGHT');
    setTimeRemaining(60);
    elapsedRef.current = 0;
    flightStartTimeRef.current = Date.now();
    lastTickTimeRef.current = Date.now();
    spawnedScheduleIndicesRef.current.clear();
    setActiveDebrisList([]);
    settledDebrisRef.current = { 1: [], 2: [], 3: [], 4: [] };
    setSettledDebris({ 1: [], 2: [], 3: [], 4: [] });
    setIsShipExploding(false);
    setIsAsteroidWarning(false);
    setIsAsteroidActive(false);
    isAsteroidActiveRef.current = false;
    setIsAsteroidDestroyed(false);
    isAsteroidDestroyedRef.current = false;
    setIsShieldActive(false);
    isShieldActiveRef.current = false;
    hasDestroyedDebrisRef.current = false;
    destroyedDebrisCountRef.current = 0;
    setLaneStatus({ lane1: 'idle', lane2: 'idle', lane3: 'idle', lane4: 'idle' });

    // High-frequency 40ms simulation tick
    loopIntervalRef.current = setInterval(() => {
      if (isCancelledRef.current) return;
      const now = Date.now();
      const trueElapsed = (now - flightStartTimeRef.current) / 1000;
      elapsedRef.current = trueElapsed;
      const currentElapsed = trueElapsed;
      const remaining = Math.max(0, Math.ceil(60 - currentElapsed));
      setTimeRemaining(remaining);

      const dtMs = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;
      const dt = Math.min(dtMs / 1000, 0.1); // clamp delta time for smooth collision physics

      // Check if flight has completed successfully (at 60s, or once all debris has settled and all hazards passed)
      const allDebrisSpawned = spawnedScheduleIndicesRef.current.size >= scheduleRef.current.length;
      const allDebrisSettled = activeDebrisListRef.current.length === 0;
      const isCompleteEarly = allDebrisSpawned && allDebrisSettled && currentElapsed >= 50.0;

      if (currentElapsed >= 60.0 || isCompleteEarly) {
        clearAllTimers();
        activeDebrisListRef.current = [];
        setActiveDebrisList([]);

        // Audit if any debris was destroyed by energy shield
        if (hasDestroyedDebrisRef.current || destroyedDebrisCountRef.current > 0) {
          setPhase('JAMMED');
          playJamClangBuzz();
          onSimulationComplete?.(
            false,
            `ORBIT INCOMPLETE: ${destroyedDebrisCountRef.current} orbital debris ${
              destroyedDebrisCountRef.current === 1 ? 'was' : 'were'
            } vaporized by the Energy Shield! The shield blocked the debris, but destroyed materials required to complete Saturn's rings. Route debris into orbits instead of shielding them!`
          );
          return;
        }

        // Check if all 4 orbits have settled items
        const isOrbitComplete =
          settledDebrisRef.current[1].length > 0 &&
          settledDebrisRef.current[2].length > 0 &&
          settledDebrisRef.current[3].length > 0 &&
          settledDebrisRef.current[4].length > 0;

        if (!isOrbitComplete) {
          setPhase('JAMMED');
          playJamClangBuzz();
          onSimulationComplete?.(
            false,
            "ORBIT INCOMPLETE: Not all orbital rings received their designated debris materials. Review your Case blocks and route all materials."
          );
          return;
        }

        triggerVictorySequence();
        return;
      }

      // Check spawn schedule for items due
      scheduleRef.current.forEach((item, idx) => {
        if (!spawnedScheduleIndicesRef.current.has(idx) && currentElapsed >= item.time) {
          spawnedScheduleIndicesRef.current.add(idx);
          if (item.type === 'ASTEROID' || item.type === 'UFO') {
            triggerAsteroidHazard();
          } else if (item.type === 'DEBRIS' && item.material) {
            spawnDebris(item.material, item.startX || 18);
          }
        }
      });

      // Update massive asteroid physics if active
      if (isAsteroidActiveRef.current && !isAsteroidDestroyedRef.current) {
        const nextAstY = asteroidYRef.current + 30 * dt;
        asteroidYRef.current = nextAstY;
        setAsteroidY(nextAstY);

        const hasShieldProtection = Boolean(
          validation.hasShield ||
          validation.caseMappings.asteroidAction === 'ACTIVATE_SHIELD' ||
          validation.caseMappings.shieldActivated ||
          validation.hasGreetUfo ||
          validation.caseMappings.ufoGreeted
        );

        if (hasShieldProtection) {
          // Deploy Energy Shield when asteroid reaches mid-flight
          if (nextAstY >= 34 && !isShieldActiveRef.current) {
            isShieldActiveRef.current = true;
            setIsShieldActive(true);
          }

          // Deflect and explode asteroid at shield boundary
          if (nextAstY >= 52) {
            isAsteroidDestroyedRef.current = true;
            setIsAsteroidDestroyed(true);
            playShieldDeflectSound();
            spawnParticles(18, 52, '#38bdf8', 26, 'spark');
            spawnParticles(18, 52, '#ffffff', 20, 'spark');
            spawnParticles(18, 52, '#f59e0b', 16, 'circle');
            onShieldDeflected?.();
            onUfoGreeted?.();

            const tShieldDown = setTimeout(() => {
              if (!isCancelledRef.current) {
                isShieldActiveRef.current = false;
                setIsShieldActive(false);
                isAsteroidActiveRef.current = false;
                setIsAsteroidActive(false);
                isAsteroidDestroyedRef.current = false;
                setIsAsteroidDestroyed(false);
              }
            }, 750);
            timeoutRefs.current.push(tShieldDown);
          }
        } else {
          // No Shield programmed: Asteroid strikes starship directly!
          if (nextAstY >= 65) {
            isAsteroidActiveRef.current = false;
            setIsAsteroidActive(false);
            handleAsteroidShipCollision();
            return;
          }
        }
      }

      // Update all actively moving debris outside setState updater to prevent double-invocation side effects
      const currentList = activeDebrisListRef.current;
      const nextList: ActiveDebris[] = [];
      const settledThisTick: ActiveDebris[] = [];
      let collisionThisTick: ActiveDebris | null = null;

      for (const debris of currentList) {
        if (debris.state === 'approaching') {
          const nextY = debris.y + debris.speed * dt;

          // Scanning/Tractor Beam acquisition threshold at y >= 34%
          if (nextY >= 34) {
            // Check if this material is programmed to ACTIVATE_SHIELD
            const debrisAction =
              debris.material === 'Ice' ? validation.caseMappings.iceAction :
              debris.material === 'Rock' ? validation.caseMappings.rockAction :
              (debris.material === 'Mineral' || (debris.material as string) === 'Metal') ? validation.caseMappings.metalAction :
              validation.caseMappings.crystalAction;

            const isShieldProgrammed = debrisAction === 'ACTIVATE_SHIELD';

            let targetLane: 1 | 2 | 3 | 4 | null = null;
            if (debris.material === 'Ice') targetLane = validation.caseMappings.ice as 1 | 2 | 3 | 4 | null;
            else if (debris.material === 'Rock') targetLane = validation.caseMappings.rock as 1 | 2 | 3 | 4 | null;
            else if (debris.material === 'Mineral' || (debris.material as string) === 'Metal') targetLane = validation.caseMappings.metal as 1 | 2 | 3 | 4 | null;
            else if (debris.material === 'Crystal') targetLane = (validation.caseMappings.crystal || 4) as 1 | 2 | 3 | 4 | null;

            if (isShieldProgrammed) {
              // Shield programmed for this debris: Starship activates Energy Shield!
              if (!isShieldActiveRef.current) {
                isShieldActiveRef.current = true;
                setIsShieldActive(true);
              }

              // Debris strikes the shield at boundary y >= 52%: Vaporize and destroy it!
              if (nextY >= 52) {
                playShieldDeflectSound();
                spawnParticles(debris.x, 52, '#38bdf8', 22, 'circle');
                spawnParticles(debris.x, 52, '#ffffff', 16, 'circle');
                spawnParticles(debris.x, 52, '#f59e0b', 14, 'circle');
                hasDestroyedDebrisRef.current = true;
                destroyedDebrisCountRef.current += 1;

                const tShieldDown = setTimeout(() => {
                  if (!isCancelledRef.current && !isAsteroidActiveRef.current) {
                    isShieldActiveRef.current = false;
                    setIsShieldActive(false);
                  }
                }, 600);
                timeoutRefs.current.push(tShieldDown);

                // Vaporized by shield: do not add to nextList (destroyed!)
                continue;
              } else {
                nextList.push({
                  ...debris,
                  y: nextY,
                  destX: 18,
                  destY: 52,
                });
              }
            } else if (targetLane) {
              // MATCHING CASE FOUND: Tractor Beam captures debris!
              playTractorBeamDrone();
              setIsLaserScanning(true);
              setTimeout(() => setIsLaserScanning(false), 300);

              // Target exact orbit slot position directly so the tractor beam guides it without jumping
              const currentLaneSettled = settledDebrisRef.current[targetLane].length;
              const alreadyRoutingCount = nextList.filter(
                (d) => d.state === 'routing' && d.targetLane === targetLane
              ).length;
              const targetSlotIndex = Math.min(currentLaneSettled + alreadyRoutingCount, 7);
              const dest = getOrbitSlotPosition(targetLane, targetSlotIndex);

              nextList.push({
                ...debris,
                y: nextY,
                state: 'routing',
                hasCase: true,
                targetLane,
                destX: dest.x,
                destY: dest.y,
                startX: debris.x,
                startY: nextY,
                routeProgress: 0,
              });

              // Set designated ring lane to active
              setLaneStatus((ls) => ({ ...ls, [`lane${targetLane}`]: 'active' }));
            } else {
              // NO MATCHING CASE: Spaceship cannot route debris!
              nextList.push({
                ...debris,
                y: nextY,
                state: 'colliding',
                hasCase: false,
                destX: 18,
                destY: 72,
              });
            }
          } else {
            nextList.push({ ...debris, y: nextY });
          }
        } else if (debris.state === 'routing') {
          // Smoothly glide towards destination orbit slot over ~1.1 seconds
          const nextProgress = debris.routeProgress + dt / 1.1;

          if (nextProgress >= 1) {
            // Debris safely reached its orbit slot!
            settledThisTick.push(debris);
          } else {
            // Cubic ease-out interpolation
            const t = nextProgress;
            const ease = 1 - Math.pow(1 - t, 3);
            const curX = debris.startX + (debris.destX - debris.startX) * ease;
            const curY = debris.startY + (debris.destY - debris.startY) * ease;

            nextList.push({
              ...debris,
              x: curX,
              y: curY,
              routeProgress: nextProgress,
            });
          }
        } else if (debris.state === 'colliding') {
          // If the energy shield is actively deployed, unrouted debris is vaporized at the shield boundary!
          if (isShieldActiveRef.current && debris.y >= 50) {
            playShieldDeflectSound();
            spawnParticles(debris.x, 52, '#38bdf8', 22, 'circle');
            spawnParticles(debris.x, 52, '#ffffff', 16, 'circle');
            spawnParticles(debris.x, 52, '#f59e0b', 14, 'circle');
            hasDestroyedDebrisRef.current = true;
            destroyedDebrisCountRef.current += 1;
            // Shield absorbed and vaporized the debris! Prevent ship explosion, but orbit is incomplete
            continue;
          }

          // Unrouted debris accelerates straight into the starship at (18%, 70%)
          const nextY = debris.y + debris.speed * 1.6 * dt;
          const nextX = debris.x + (18 - debris.x) * (dt * 1.8);

          // Ship collision threshold at y >= 67%
          if (nextY >= 67) {
            collisionThisTick = debris;
            break; // Stop processing further debris
          } else {
            nextList.push({
              ...debris,
              x: nextX,
              y: nextY,
            });
          }
        }
      }

      activeDebrisListRef.current = nextList;
      setActiveDebrisList(nextList);

      if (nextList.some((d) => d.state === 'routing')) {
        updateOrbCoords();
      }

      for (const settled of settledThisTick) {
        handleDebrisSettled(settled);
      }

      if (collisionThisTick) {
        activeDebrisListRef.current = [];
        setActiveDebrisList([]);
        handleShipCollision(collisionThisTick);
        return;
      }
    }, 40);

    return () => {
      isCancelledRef.current = true;
      clearAllTimers();
    };
  }, [isRunning, validation]);

  return (
    <div className="w-full h-full flex flex-col bg-[#05060e] relative overflow-hidden select-none font-sans">
      {/* Viewport Warning Overlay (< 1024px) */}
      {isViewportSmall && (
        <div className="absolute inset-0 z-50 bg-[#070b19]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white border-2 border-amber-500/50">
          <ShieldAlert size={48} className="text-amber-400 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold tracking-wide mb-2 uppercase">Desktop Viewport Required</h3>
          <p className="text-sm text-gray-300 max-w-sm">
            NETStart Terminal Requires a Desktop Interface (min 1024px). Please expand your window or use a larger device.
          </p>
        </div>
      )}

      {/* Top Telemetry Bar */}
      <div className="w-full h-11 px-3 sm:px-4 border-b border-white/10 bg-[#090d1f]/90 flex items-center justify-between z-30 shrink-0 relative">
        {/* Left: Instructions & Ring Placements Dropdown */}
        <div ref={instructionsRef}>
          <button
            type="button"
            onClick={() => setShowInstructions((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-400/50 hover:border-cyan-300 text-cyan-200 hover:text-white font-mono text-xs sm:text-sm font-bold transition-all shadow-[0_0_14px_rgba(6,182,212,0.35)] active:scale-95 cursor-pointer backdrop-blur-md"
            title="View Ring Placements & Instructions"
          >
            <HelpCircle size={15} className="text-cyan-300" />
            <span>Instructions</span>
            {showInstructions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showInstructions && (
            <div className="absolute top-12 left-3 z-50 w-[440px] max-w-[calc(100%-1.5rem)] max-h-[calc(100vh-8rem)] overflow-y-auto bg-[#090d1f]/98 border border-cyan-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 text-left">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3.5">
                <span className="font-mono text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <HelpCircle size={16} /> Instructions & Mission Guide
                </span>
                <button
                  type="button"
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Numbered Instructions */}
              <div className="space-y-3.5 text-xs sm:text-sm text-gray-200 font-sans">
                <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed text-gray-300">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500/20 text-red-300 font-bold text-xs font-mono border border-red-500/40 shrink-0 mt-0.5">
                      1
                    </span>
                    <span className="break-words">
                      Start your program with <strong className="text-emerald-400 font-bold">Start</strong> and conclude with <strong className="text-rose-400 font-bold">End</strong>.
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center bg-yellow-500/20 text-yellow-300 font-bold text-xs font-mono border border-yellow-500/40 shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="break-words">
                      Add <strong className="text-yellow-300 font-bold">Case (Material)</strong> blocks and assign each material to its designated orbit ring.
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center bg-cyan-500/20 text-cyan-300 font-bold text-xs font-mono border border-cyan-500/40 shrink-0 mt-0.5">
                      3
                    </span>
                    <span className="break-words">
                      When a massive asteroid threatens the ship, use <strong className="text-pink-300 font-bold">Activate Shield</strong> to deflect it.
                    </span>
                  </div>
                </div>

                {/* Ring Placements Cheat Sheet */}
                <div className="pt-3 border-t border-white/10">
                  <span className="font-mono text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
                    Designated Ring Placements
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between min-w-0">
                      <span className="flex items-center gap-1.5 font-mono text-xs text-cyan-300 font-bold shrink-0">
                        <img src="/assets/orbits/orbit1_ice.png" alt="Ice" className="w-4 h-4 object-contain shrink-0" /> Orbit 1
                      </span>
                      <span className="text-xs text-gray-200 font-medium shrink-0 ml-1">Ice</span>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between min-w-0">
                      <span className="flex items-center gap-1.5 font-mono text-xs text-amber-300 font-bold shrink-0">
                        <img src="/assets/orbits/orbit2_rocks.png" alt="Rock" className="w-4 h-4 object-contain shrink-0" /> Orbit 2
                      </span>
                      <span className="text-xs text-gray-200 font-medium shrink-0 ml-1">Rocks</span>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between min-w-0">
                      <span className="flex items-center gap-1.5 font-mono text-xs text-sky-300 font-bold shrink-0">
                        <img src="/assets/orbits/orbit3_minerals.png" alt="Minerals" className="w-4 h-4 object-contain shrink-0" /> Orbit 3
                      </span>
                      <span className="text-xs text-gray-200 font-medium shrink-0 ml-1">Minerals</span>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between min-w-0">
                      <span className="flex items-center gap-1.5 font-mono text-xs text-purple-300 font-bold shrink-0">
                        <img src="/assets/orbits/orbit4_crystals.png" alt="Crystals" className="w-4 h-4 object-contain shrink-0" /> Orbit 4
                      </span>
                      <span className="text-xs text-gray-200 font-medium shrink-0 ml-1">Crystals</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Real-time 60-second Flight Timer & Telemetry Progress */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {isRunning && phase === 'FLIGHT' && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-black/50 border border-white/10 shadow-inner">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Flight Time:</span>
              <span className="text-cyan-300 font-bold tabular-nums">
                {String(Math.floor((60 - timeRemaining) / 60)).padStart(2, '0')}:{String(Math.floor((60 - timeRemaining) % 60)).padStart(2, '0')} / 01:00
              </span>
              {/* Mini flight progress bar */}
              <div className="w-16 sm:w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${((60 - timeRemaining) / 60) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic 2D Auto-Scroller Canvas */}
      <div ref={canvasContainerRef} className="flex-1 w-full h-full relative overflow-hidden transition-all duration-300">
        {/* Continuous Starry Sky Background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 15px 25px, #ffffff, transparent),
              radial-gradient(2px 2px at 85px 120px, #a5b4fc, transparent),
              radial-gradient(1px 1px at 160px 40px, #ffffff, transparent),
              radial-gradient(1.5px 1.5px at 240px 180px, #38bdf8, transparent),
              radial-gradient(2px 2px at 320px 80px, #ffffff, transparent),
              radial-gradient(1px 1px at 450px 220px, #e2e8f0, transparent)
            `,
            backgroundSize: '500px 300px',
            animation: phase === 'JAMMED' || phase === 'COLLIDED' ? 'none' : isRunning ? 'saturnStarsDown 3s linear infinite' : 'saturnStarsDown 12s linear infinite',
          }}
        />

        {/* Ambient Ring Nebula Backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(ellipse_at_80%_50%,_rgba(234,179,8,0.25),_transparent_70%)]" />

        {/* The Player Entity (Lower-Left Quadrant, Upright Rocket Stance Facing Up) */}
        <div className="absolute left-[18%] -translate-x-1/2 bottom-10 z-20 flex flex-col items-center">
          {isShipExploding ? (
            <div className="relative w-40 h-40 flex items-center justify-center pointer-events-none rounded-full overflow-visible">
              {/* Screen Red Flash */}
              <div className="fixed inset-0 bg-red-600/30 pointer-events-none z-50 animate-ping" />
              {/* Spherical Shockwave & Round Radial Glow (Zero Square Outlines) */}
              <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,_rgba(251,191,36,0.9)_0%,_rgba(239,68,68,0.5)_45%,_transparent_72%)] blur-xl animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-amber-400 bg-red-500/20 animate-ping" />
              {/* Moon Explosion SVG with circular radial mask preventing any rectangular edge emission */}
              <img
                src="/assets/planets/00_moon/environment/Explosion.svg"
                alt="Starship Explosion"
                className="w-36 h-36 object-contain animate-single-explosion rounded-full [mask-image:radial-gradient(circle,black_75%,transparent_100%)]"
              />
            </div>
          ) : (
            <div
              className={`relative w-24 h-24 select-none pointer-events-none transition-transform duration-300 ${
                phase === 'JAMMED'
                  ? 'transform -rotate-12 translate-y-2'
                  : 'animate-[shipHoverUpright_2.5s_ease-in-out_infinite_alternate]'
              }`}
            >
              <img
                src="/assets/planets/00_moon/level_1/Spaceship Section 3.svg"
                alt="Player Spaceship"
                className="w-full h-full object-contain -rotate-90 drop-shadow-[0_0_22px_rgba(56,189,248,0.55)]"
              />

              {/* Rocket Nose Tip Anchor & Glowing Blue Orb (Only visible when tractor beam actively routes debris) */}
              <div
                ref={orbAnchorRef}
                className="absolute -top-1.5 left-[43.5%] -translate-x-1/2 w-4 h-4 z-25 flex items-center justify-center pointer-events-none"
              >
                {activeDebrisList.some((d) => d.state === 'routing') && (
                  <div className="relative w-full h-full flex items-center justify-center animate-in fade-in zoom-in-75 duration-200">
                    {/* Outer Cyan Atmosphere Halo */}
                    <div className="absolute w-8 h-8 rounded-full bg-cyan-400/50 blur-md animate-pulse" />
                    {/* Radiant Sphere */}
                    <div className="relative w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-300 to-white border border-cyan-100 shadow-[0_0_16px_#38bdf8,0_0_30px_#06b6d4]" />
                    {/* Bright Central Singularity Core */}
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                  </div>
                )}
              </div>

              {/* Blue Energy Shield Bubble FX (from Moon Level 3 Section 3) */}
              {isShieldActive && (
                <div className="absolute -inset-6 sm:-inset-8 rounded-full border-4 border-cyan-400 bg-cyan-500/30 backdrop-blur-[1px] shadow-[0_0_45px_rgba(6,182,212,0.95)] ring-4 ring-cyan-300/70 animate-pulse z-30 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-full rounded-full border-2 border-sky-300/60 animate-spin duration-1000" />
                  <div className="absolute inset-1 rounded-full bg-radial from-cyan-400/30 to-transparent" />
                </div>
              )}

              {/* Thruster exhaust below rocket (propulsion upwards) */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-8 bg-gradient-to-b from-cyan-400 via-amber-400 to-transparent rounded-full blur-xs pointer-events-none animate-pulse" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-12 bg-gradient-to-b from-orange-500/50 to-transparent rounded-full blur-sm pointer-events-none animate-pulse" />
            </div>
          )}
        </div>

        {/* MULTIPLE CONCURRENT TRACTOR BEAMS (Clean, Solid, Sleek Volumetric Conduits - Zero Dash Clutter) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-23">
          <defs>
            <filter id="tractorGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="tractorGlowIntense" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {activeDebrisList
            .filter((d) => d.state === 'routing')
            .map((d) => {
              const beamColor =
                d.targetLane === 1
                  ? '#38bdf8' // Orbit 1 (Ice) - Sky Blue
                  : d.targetLane === 2
                  ? '#f59e0b' // Orbit 2 (Rock) - Amber Gold
                  : d.targetLane === 3
                  ? '#06b6d4' // Orbit 3 (Mineral) - Electric Cyan
                  : '#c084fc'; // Orbit 4 (Crystal) - Cosmic Purple

              // Coordinates: Ship nose orb emitter to Debris (d.x%, d.y%)
              const x0 = orbCoords.x;
              const y0 = orbCoords.y;
              const x1 = d.x;
              const y1 = d.y;
              const dx = x1 - x0;
              const dy = y1 - y0;
              const dist = Math.hypot(dx, dy) || 1;
              const nx = -dy / dist;
              const ny = dx / dist;

              // Volumetric cone: expands from 0.8% width at ship nose to 2.8% at target debris
              const w0 = 0.8;
              const w1 = 2.8;
              const p1x = (x0 - nx * w0).toFixed(2);
              const p1y = (y0 - ny * w0).toFixed(2);
              const p2x = (x1 - nx * w1).toFixed(2);
              const p2y = (y1 - ny * w1).toFixed(2);
              const p3x = (x1 + nx * w1).toFixed(2);
              const p3y = (y1 + ny * w1).toFixed(2);
              const p4x = (x0 + nx * w0).toFixed(2);
              const p4y = (y0 + ny * w0).toFixed(2);

              // Smoothly fade out as debris docks into orbit slot (progress 0.8 -> 1.0)
              const beamOpacity = d.routeProgress > 0.8 ? Math.max(0, (1 - d.routeProgress) / 0.2) : 1;
              const safeId = d.id.replace(/[^a-zA-Z0-9_-]/g, '');

              return (
                <g key={`tractor-${safeId}`} opacity={beamOpacity} className="transition-opacity duration-150">
                  <defs>
                    <linearGradient id={`grad-cone-${safeId}`} x1={`${x0}%`} y1={`${y0}%`} x2={`${x1}%`} y2={`${y1}%`} gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor={beamColor} stopOpacity="0.5" />
                      <stop offset="45%" stopColor={beamColor} stopOpacity="0.2" />
                      <stop offset="90%" stopColor="#ffffff" stopOpacity="0.3" />
                      <stop offset="100%" stopColor={beamColor} stopOpacity="0.5" />
                    </linearGradient>
                  </defs>

                  {/* 1. Volumetric Energy Cone (Luminous expanding trapezoid) */}
                  <polygon
                    points={`${p1x}%,${p1y}% ${p2x}%,${p2y}% ${p3x}%,${p3y}% ${p4x}%,${p4y}%`}
                    fill={`url(#grad-cone-${safeId})`}
                    filter="url(#tractorGlow)"
                  />

                  {/* 2. Soft Outer Ambient Field Conduit */}
                  <line
                    x1={`${x0}%`}
                    y1={`${y0}%`}
                    x2={`${x1}%`}
                    y2={`${y1}%`}
                    stroke={beamColor}
                    strokeWidth="14"
                    strokeOpacity="0.18"
                    filter="url(#tractorGlowIntense)"
                  />

                  {/* 3. Solid Vibrant Core Energy Beam */}
                  <line
                    x1={`${x0}%`}
                    y1={`${y0}%`}
                    x2={`${x1}%`}
                    y2={`${y1}%`}
                    stroke={beamColor}
                    strokeWidth="4"
                    strokeOpacity="0.7"
                  />

                  {/* 4. Concentrated Laser Core Spine */}
                  <line
                    x1={`${x0}%`}
                    y1={`${y0}%`}
                    x2={`${x1}%`}
                    y2={`${y1}%`}
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeOpacity="0.95"
                  />

                  {/* 5. Emitter Flare at Rocket Nose */}
                  <circle cx={`${x0}%`} cy={`${y0}%`} r="8" fill={beamColor} opacity="0.6" filter="url(#tractorGlow)" />
                  <circle cx={`${x0}%`} cy={`${y0}%`} r="4" fill="#ffffff" opacity="0.95" />

                  {/* 6. Clean Solid Stasis Capture Halo (Zero Dash Clutter) */}
                  <circle
                    cx={`${x1}%`}
                    cy={`${y1}%`}
                    r="24"
                    fill={beamColor}
                    fillOpacity="0.1"
                    stroke={beamColor}
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />
                  <circle
                    cx={`${x1}%`}
                    cy={`${y1}%`}
                    r="18"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1"
                    strokeOpacity="0.5"
                  />
                </g>
              );
            })}
        </svg>

        {/* Concentric Planetary Rings with Curved Text Labels (Right Side - Zero Dash Clutter) */}
        <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-700 ${
          phase === 'RESTORED' || phase === 'MEMORY_PANIC' ? 'opacity-30' : 'opacity-100'
        }`}>
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 600"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="melterRingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
                <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="crusherRingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#78716c" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#e2e8f0" stopOpacity="1" />
                <stop offset="100%" stopColor="#57534e" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="magnetRingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="orbit4RingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#e879f9" stopOpacity="1" />
                <stop offset="100%" stopColor="#9333ea" stopOpacity="0.9" />
              </linearGradient>

              {/* Curved text arc paths centered in the middle of each ring (y: 650 up to -50) */}
              <path id="orbit1TextArc" d="M 525 650 A 760 760 0 0 1 525 -50" fill="none" />
              <path id="orbit2TextArc" d="M 676 650 A 630 630 0 0 1 676 -50" fill="none" />
              <path id="orbit3TextArc" d="M 843 650 A 500 500 0 0 1 843 -50" fill="none" />
              <path id="orbit4TextArc" d="M 1080 650 A 370 370 0 0 1 1080 -50" fill="none" />
            </defs>

            {/* RING 4: CRYSTALS (RADIUS 370) */}
            {(laneStatus.lane4 === 'active' || laneStatus.lane4 === 'success') && (
              <path
                d="M 1080 -50 A 370 370 0 0 0 1080 650"
                fill="none"
                stroke="#c084fc"
                strokeWidth="18"
                strokeOpacity="0.25"
                className="transition-all duration-300"
              />
            )}
            <path
              d="M 1080 -50 A 370 370 0 0 0 1080 650"
              fill="none"
              stroke={
                laneStatus.lane4 === 'active' || laneStatus.lane4 === 'success'
                  ? 'url(#orbit4RingGrad)'
                  : laneStatus.lane4 === 'jammed'
                  ? '#ef4444'
                  : 'rgba(255, 255, 255, 0.45)'
              }
              strokeWidth={laneStatus.lane4 === 'active' ? '4.5' : laneStatus.lane4 === 'success' ? '4.5' : '2'}
              className="transition-all duration-300"
              style={{
                filter:
                  laneStatus.lane4 === 'active'
                    ? 'drop-shadow(0 0 10px #c084fc)'
                    : laneStatus.lane4 === 'success'
                    ? 'drop-shadow(0 0 10px #34d399)'
                    : 'none',
              }}
            />

            {/* Orbit 4 Curved Center Text Label */}
            <text
              fill={laneStatus.lane4 === 'active' || laneStatus.lane4 === 'success' ? '#c084fc' : 'rgba(255, 255, 255, 0.9)'}
              fontSize="22"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              fontWeight="900"
              letterSpacing="4"
              className="transition-all duration-300 pointer-events-none select-none"
              style={{
                filter: laneStatus.lane4 === 'active' ? 'drop-shadow(0 0 14px #c084fc)' : 'drop-shadow(0 0 8px rgba(0,0,0,0.95))',
              }}
            >
              <textPath href="#orbit4TextArc" startOffset="50%" textAnchor="middle">
                ORBIT 4
              </textPath>
            </text>

            {/* RING 3: THE MAGNET (RADIUS 500) */}
            {(laneStatus.lane3 === 'active' || laneStatus.lane3 === 'success') && (
              <path
                d="M 843 -50 A 500 500 0 0 0 843 650"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="18"
                strokeOpacity="0.25"
                className="transition-all duration-300"
              />
            )}
            <path
              d="M 843 -50 A 500 500 0 0 0 843 650"
              fill="none"
              stroke={
                laneStatus.lane3 === 'active' || laneStatus.lane3 === 'success'
                  ? 'url(#magnetRingGrad)'
                  : laneStatus.lane3 === 'jammed'
                  ? '#ef4444'
                  : 'rgba(255, 255, 255, 0.45)'
              }
              strokeWidth={laneStatus.lane3 === 'active' ? '4.5' : laneStatus.lane3 === 'success' ? '4.5' : '2'}
              className="transition-all duration-300"
              style={{
                filter:
                  laneStatus.lane3 === 'active'
                    ? 'drop-shadow(0 0 10px #38bdf8)'
                    : laneStatus.lane3 === 'success'
                    ? 'drop-shadow(0 0 10px #34d399)'
                    : 'none',
              }}
            />

            {/* Orbit 3 Curved Center Text Label */}
            <text
              fill={laneStatus.lane3 === 'active' || laneStatus.lane3 === 'success' ? '#38bdf8' : 'rgba(255, 255, 255, 0.9)'}
              fontSize="22"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              fontWeight="900"
              letterSpacing="4"
              className="transition-all duration-300 pointer-events-none select-none"
              style={{
                filter: laneStatus.lane3 === 'active' ? 'drop-shadow(0 0 14px #38bdf8)' : 'drop-shadow(0 0 8px rgba(0,0,0,0.95))',
              }}
            >
              <textPath href="#orbit3TextArc" startOffset="50%" textAnchor="middle">
                ORBIT 3
              </textPath>
            </text>

            {/* RING 2: THE CRUSHER (RADIUS 630) */}
            {(laneStatus.lane2 === 'active' || laneStatus.lane2 === 'success') && (
              <path
                d="M 676 -50 A 630 630 0 0 0 676 650"
                fill="none"
                stroke="#d6d3d1"
                strokeWidth="18"
                strokeOpacity="0.25"
                className="transition-all duration-300"
              />
            )}
            <path
              d="M 676 -50 A 630 630 0 0 0 676 650"
              fill="none"
              stroke={
                laneStatus.lane2 === 'active' || laneStatus.lane2 === 'success'
                  ? 'url(#crusherRingGrad)'
                  : laneStatus.lane2 === 'jammed'
                  ? '#ef4444'
                  : 'rgba(255, 255, 255, 0.45)'
              }
              strokeWidth={laneStatus.lane2 === 'active' ? '4.5' : laneStatus.lane2 === 'success' ? '4.5' : '2'}
              className="transition-all duration-300"
              style={{
                filter:
                  laneStatus.lane2 === 'active'
                    ? 'drop-shadow(0 0 10px #d6d3d1)'
                    : laneStatus.lane2 === 'success'
                    ? 'drop-shadow(0 0 10px #34d399)'
                    : 'none',
              }}
            />

            {/* Orbit 2 Curved Center Text Label */}
            <text
              fill={laneStatus.lane2 === 'active' || laneStatus.lane2 === 'success' ? '#f59e0b' : 'rgba(255, 255, 255, 0.9)'}
              fontSize="22"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              fontWeight="900"
              letterSpacing="4"
              className="transition-all duration-300 pointer-events-none select-none"
              style={{
                filter: laneStatus.lane2 === 'active' ? 'drop-shadow(0 0 14px #f59e0b)' : 'drop-shadow(0 0 8px rgba(0,0,0,0.95))',
              }}
            >
              <textPath href="#orbit2TextArc" startOffset="50%" textAnchor="middle">
                ORBIT 2
              </textPath>
            </text>

            {/* RING 1: THE MELTER (RADIUS 760) */}
            {(laneStatus.lane1 === 'active' || laneStatus.lane1 === 'success') && (
              <path
                d="M 525 -50 A 760 760 0 0 0 525 650"
                fill="none"
                stroke="#ef4444"
                strokeWidth="18"
                strokeOpacity="0.25"
                className="transition-all duration-300"
              />
            )}
            <path
              d="M 525 -50 A 760 760 0 0 0 525 650"
              fill="none"
              stroke={
                laneStatus.lane1 === 'active' || laneStatus.lane1 === 'success'
                  ? 'url(#melterRingGrad)'
                  : laneStatus.lane1 === 'jammed'
                  ? '#ef4444'
                  : 'rgba(255, 255, 255, 0.45)'
              }
              strokeWidth={laneStatus.lane1 === 'active' ? '4.5' : laneStatus.lane1 === 'success' ? '4.5' : '2'}
              className="transition-all duration-300"
              style={{
                filter:
                  laneStatus.lane1 === 'active'
                    ? 'drop-shadow(0 0 10px #ef4444)'
                    : laneStatus.lane1 === 'success'
                    ? 'drop-shadow(0 0 10px #34d399)'
                    : 'none',
              }}
            />

            {/* Orbit 1 Curved Center Text Label */}
            <text
              fill={laneStatus.lane1 === 'active' || laneStatus.lane1 === 'success' ? '#ef4444' : 'rgba(255, 255, 255, 0.9)'}
              fontSize="22"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              fontWeight="900"
              letterSpacing="4"
              className="transition-all duration-300 pointer-events-none select-none"
              style={{
                filter: laneStatus.lane1 === 'active' ? 'drop-shadow(0 0 14px #ef4444)' : 'drop-shadow(0 0 8px rgba(0,0,0,0.95))',
              }}
            >
              <textPath href="#orbit1TextArc" startOffset="50%" textAnchor="middle">
                ORBIT 1
              </textPath>
            </text>
          </svg>
        </div>

        {/* SETTLED DEBRIS STATIONED ALONG THE ORBIT RINGS (Max 8 per Orbit) */}
        {([1, 2, 3, 4] as const).map((lane) => {
          const items = settledDebris[lane];
          return items.map((item, idx) => {
            const pos = getOrbitSlotPosition(lane, idx);
            return (
              <div
                key={`settled-${lane}-${item.id}-${idx}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-25 transition-all duration-300"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                }}
                title={`Orbit ${lane} Slot ${idx + 1}/8: ${item.material}`}
              >
                {item.material === 'Ice' && (
                  <img
                    src="/assets/orbits/orbit1_ice.png"
                    alt="Ice"
                    className="w-12 h-12 md:w-14 md:h-14 object-contain opacity-100 drop-shadow-[0_0_14px_rgba(56,189,248,0.95)] select-none animate-[spin_12s_linear_infinite]"
                  />
                )}
                {item.material === 'Rock' && (
                  <img
                    src="/assets/orbits/orbit2_rocks.png"
                    alt="Rocks"
                    className="w-12 h-12 md:w-14 md:h-14 object-contain opacity-100 drop-shadow-[0_0_14px_rgba(245,158,11,0.95)] select-none animate-[spin_14s_linear_infinite]"
                  />
                )}
                {(item.material === 'Mineral' || item.material === 'Metal') && (
                  <img
                    src="/assets/orbits/orbit3_minerals.png"
                    alt="Minerals"
                    className="w-12 h-12 md:w-14 md:h-14 object-contain opacity-100 drop-shadow-[0_0_14px_rgba(6,182,212,0.95)] select-none animate-[spin_10s_linear_infinite]"
                  />
                )}
                {item.material === 'Crystal' && (
                  <img
                    src="/assets/orbits/orbit4_crystals.png"
                    alt="Crystals"
                    className="w-12 h-12 md:w-14 md:h-14 object-contain opacity-100 drop-shadow-[0_0_14px_rgba(192,132,252,0.95)] select-none animate-[spin_16s_linear_infinite]"
                  />
                )}
              </div>
            );
          });
        })}

        {/* ACTIVELY MOVING DEBRIS (Allows multiple instances simultaneously) */}
        {activeDebrisList.map((debris) => (
          <div
            key={debris.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-75"
            style={{
              left: `${debris.x}%`,
              top: `${debris.y}%`,
            }}
          >
            {debris.state === 'colliding' && (
              <div className="absolute -inset-3 rounded-full border-2 border-red-500 bg-red-500/20 animate-ping pointer-events-none" />
            )}

            {debris.material === 'Ice' && (
              <img
                src="/assets/orbits/orbit1_ice.png"
                alt="Ice Debris"
                className="w-10 h-10 object-contain drop-shadow-[0_0_14px_rgba(56,189,248,0.85)]"
              />
            )}

            {debris.material === 'Rock' && (
              <img
                src="/assets/orbits/orbit2_rocks.png"
                alt="Rock Debris"
                className="w-10 h-10 object-contain drop-shadow-[0_0_14px_rgba(245,158,11,0.85)]"
              />
            )}

            {(debris.material === 'Mineral' || debris.material === 'Metal') && (
              <img
                src="/assets/orbits/orbit3_minerals.png"
                alt="Mineral Debris"
                className="w-10 h-10 object-contain drop-shadow-[0_0_14px_rgba(6,182,212,0.85)]"
              />
            )}

            {debris.material === 'Crystal' && (
              <img
                src="/assets/orbits/orbit4_crystals.png"
                alt="Crystal Debris"
                className="w-10 h-10 object-contain drop-shadow-[0_0_14px_rgba(192,132,252,0.85)]"
              />
            )}
          </div>
        ))}

        {/* Asteroid Warning Telegraph Badge (from Moon Level 3 Section 3) */}
        {isAsteroidWarning && (
          <div className="absolute left-[18%] top-[14%] -translate-x-1/2 z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-rose-600/95 border-2 border-rose-300 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_35px_#f43f5e] animate-pulse whitespace-nowrap">
              <AlertTriangle size={20} className="text-amber-300 shrink-0" />
              <span>WARNING: MASSIVE ASTEROID !</span>
            </div>
          </div>
        )}

        {/* Incoming Massive Asteroid with Fiery Wake (from Moon Level 3 Section 3) */}
        {isAsteroidActive && !isAsteroidDestroyed && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-none"
            style={{
              left: '18%',
              top: `${asteroidY}%`,
            }}
          >
            <div className="relative flex flex-col items-center justify-center">
              {/* Upward Blazing Atmospheric Plasma Wake / Fiery Trail */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-28 h-48 bg-gradient-to-t from-rose-600/90 via-orange-500/70 to-transparent rounded-full blur-xl animate-pulse pointer-events-none" />
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-16 h-36 bg-gradient-to-t from-amber-400 via-rose-500 to-transparent rounded-full blur-md opacity-90 pointer-events-none" />
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-24 bg-gradient-to-t from-yellow-200 via-amber-400 to-transparent rounded-full blur-xs opacity-95 pointer-events-none" />

              <img
                src="/assets/planets/00_moon/environment/Meteor Big.svg"
                alt="Massive Asteroid"
                className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-[0_0_40px_rgba(244,63,94,0.95)] animate-[spin_10s_linear_infinite] relative z-10"
              />
            </div>
          </div>
        )}

        {/* Asteroid Deflection / Explosion FX (from Moon Level 3 Section 3) */}
        {isAsteroidDestroyed && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-35 pointer-events-none"
            style={{
              left: '18%',
              top: '52%',
            }}
          >
            <div className="relative w-44 h-44 flex items-center justify-center rounded-full overflow-visible">
              {/* Round Spherical Blast Wave (Eliminates all square outline artifacts) */}
              <div className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,_rgba(251,191,36,0.9)_0%,_rgba(244,63,94,0.5)_45%,_transparent_72%)] blur-xl animate-ping" />
              <img
                src="/assets/planets/00_moon/environment/Explosion.svg"
                alt="Asteroid Deflected"
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain animate-single-explosion rounded-full [mask-image:radial-gradient(circle,black_75%,transparent_100%)]"
              />
            </div>
          </div>
        )}

        {/* Dynamic Pure CSS Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 ${
              p.shape === 'smoke' ? 'rounded-full blur-[2px]' : p.shape === 'spark' ? 'rounded-none rotate-45' : 'rounded-full'
            }`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}

        {/* False Victory Banner */}
        {showRestoredBanner && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center p-6 rounded-2xl bg-[#09221a]/95 border-2 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.5)] animate-in fade-in zoom-in-95 duration-500">
            <CheckCircle2 size={44} className="text-emerald-400 mb-2" />
            <h2 className="text-2xl font-black font-mono text-white tracking-widest uppercase">
              SYSTEM RESTORED
            </h2>
            <p className="text-xs font-mono text-emerald-200 mt-1">
              Saturn Rings Balanced & Stabilized
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes saturnStarsDown {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 0 300px;
          }
        }
        @keyframes shipHoverUpright {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-8px);
          }
        }
        @keyframes singleExplosion {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          20% {
            transform: scale(1.2);
            opacity: 1;
          }
          60% {
            transform: scale(1.05);
            opacity: 0.95;
          }
          100% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
        .animate-single-explosion {
          animation: singleExplosion 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
