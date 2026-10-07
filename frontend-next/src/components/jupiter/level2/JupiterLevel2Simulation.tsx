"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  Radio,
  Server,
  Trash2,
  Flame,
  Wrench,
  Terminal,
  Crosshair,
  Heart,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  ShieldAlert,
} from 'lucide-react';
import {
  Jupiter2ValidationResult,
  TurretLogicItem,
  DataBlockEntity,
  DataBlockType,
  ActionType,
  ExceptionType,
  Jupiter2Wave,
  JUPITER2_WAVE_CONFIGS,
} from '@/lib/jupiter/jupiterLevel2Definitions';

// =============================================================================
// PROCEDURAL AUDIO SYNTHESIZER (WEB AUDIO API)
// =============================================================================

class Jupiter2AudioFX {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playLaserShot() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) { }
  }

  playWallExplosion() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Punchy sub-bass impact layer (warm triangle waveform)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);

      // Crisp low-impact pop (smooth sine waveform)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(200, now);
      osc2.frequency.exponentialRampToValueAtTime(50, now + 0.12);
      gain2.gain.setValueAtTime(0.18, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.12);
    } catch (e) { }
  }

  playQuarantineClaw() {
    this.playWallExplosion();
  }

  playDetonation() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) { }
  }

  playMachineBurst() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) { }
  }

  playHydraulicPress() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(45, now + 0.35);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) { }
  }

  playEmpZap() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.15);
      osc.frequency.linearRampToValueAtTime(300, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) { }
  }

  playShieldAbsorb() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) { }
  }

  playScissorSnip() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // High-frequency metallic shear friction
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1400, now);
      osc1.frequency.exponentialRampToValueAtTime(320, now + 0.12);
      gain1.gain.setValueAtTime(0.28, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Low mechanical scissor snip click
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(520, now + 0.03);
      osc2.frequency.exponentialRampToValueAtTime(160, now + 0.14);
      gain2.gain.setValueAtTime(0.24, now + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.03);
      osc2.stop(now + 0.14);
    } catch (e) { }
  }

  playTrapDerail() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(750, now + 0.25);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) { }
  }

  playCrashAlarm() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.setValueAtTime(220, now + 0.15);
      osc.frequency.setValueAtTime(350, now + 0.3);
      osc.frequency.setValueAtTime(220, now + 0.45);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) { }
  }

  playDataRescued() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) { }
  }

  playVictoryFanfare() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.25, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    } catch (e) { }
  }
}

const audioFX = new Jupiter2AudioFX();

// =============================================================================
// STRICT RIGHT-ANGLED BLUEPRINT GRID TRACK & FIXED NODES
// =============================================================================

export interface PathWaypoint {
  x: number;
  y: number;
}

// Strict right-angled dual-branch cyber conduits converging at Center Base (50, 50)
// Branch 1 (Top Branch): Ingestion Port 1 (16, 18) -> Corner 1 (82, 18) -> Corner 2 (82, 50) -> Center Base (50, 50)
export const TOP_BRANCH_PATH: PathWaypoint[] = [
  { x: 16, y: 18 }, // Port 1 (Top Left)
  { x: 82, y: 18 }, // Corner 1 (Node 1 - Sector Alpha)
  { x: 82, y: 50 }, // Corner 2 (Node 2 - Sector Beta)
  { x: 50, y: 50 }, // Central Base Station
];

// Branch 2 (Bottom Branch): Ingestion Port 2 (84, 82) -> Corner 4 (18, 82) -> Corner 3 (18, 50) -> Center Base (50, 50)
export const BOTTOM_BRANCH_PATH: PathWaypoint[] = [
  { x: 84, y: 82 }, // Port 2 (Bottom Right)
  { x: 18, y: 82 }, // Corner 4 (Node 4 - Sector Delta)
  { x: 18, y: 50 }, // Corner 3 (Node 3 - Sector Gamma)
  { x: 50, y: 50 }, // Central Base Station
];

export const GRID_MAP_PATH: PathWaypoint[] = TOP_BRANCH_PATH;

// Detour quarantine loop when Scanner Node Trap is triggered
export const DETOUR_TRAP_PATH: PathWaypoint[] = [
  { x: 50, y: 50 },
  { x: 50, y: 34 },
  { x: 34, y: 34 },
  { x: 34, y: 50 },
];

// Smooth path interpolation along designated branch conduit (Branch 1 or 2)
export function getPointOnBranch(branch: 1 | 2, progress: number): { x: number; y: number } {
  const path = branch === 2 ? BOTTOM_BRANCH_PATH : TOP_BRANCH_PATH;
  const p = Math.max(0, Math.min(100, progress)) / 100;
  let totalLen = 0;
  const segLengths: number[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i + 1].x - path[i].x;
    const dy = path[i + 1].y - path[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segLengths.push(len);
    totalLen += len;
  }

  let targetDist = p * totalLen;
  for (let i = 0; i < segLengths.length; i++) {
    if (targetDist <= segLengths[i] || i === segLengths.length - 1) {
      const segT = segLengths[i] === 0 ? 0 : targetDist / segLengths[i];
      const p1 = path[i];
      const p2 = path[i + 1];
      return {
        x: p1.x + (p2.x - p1.x) * segT,
        y: p1.y + (p2.y - p1.y) * segT,
      };
    }
    targetDist -= segLengths[i];
  }
  return path[path.length - 1];
}

export function getPointOnGridPath(progress: number): { x: number; y: number } {
  return getPointOnBranch(1, progress);
}

// Wave Defense Nodes pre-set and linked with the errors of each wave
// 2 defense nodes on either end: Node 1 & 2 on Top Branch, Node 3 & 4 on Bottom Branch
export interface WaveDefenseNode {
  nodeId: number;
  label: string;
  gridIndex: number;
  branch: 1 | 2;
  x: number;
  y: number;
  cornerProgress: number;
  coverageStart: number;
  coverageEnd: number;
  linkedError: ExceptionType;
  friendlyErrorName: string;
  correctCounter: ActionType;
}

export const WAVE_PRESET_NODES: Record<Jupiter2Wave, WaveDefenseNode[]> = {
  1: [
    {
      nodeId: 1,
      label: 'Sector Alpha',
      gridIndex: 0,
      branch: 1,
      x: 82,
      y: 18,
      cornerProgress: 50.8,
      coverageStart: 38,
      coverageEnd: 62,
      linkedError: 'NULL_POINTER',
      friendlyErrorName: 'Missing Value',
      correctCounter: 'QUARANTINE',
    },
    {
      nodeId: 2,
      label: 'Sector Beta',
      gridIndex: 1,
      branch: 1,
      x: 82,
      y: 50,
      cornerProgress: 75.4,
      coverageStart: 62,
      coverageEnd: 88,
      linkedError: 'ARITHMETIC',
      friendlyErrorName: 'Divide by Zero',
      correctCounter: 'OVERLOAD',
    },
    {
      nodeId: 3,
      label: 'Sector Gamma',
      gridIndex: 2,
      branch: 2,
      x: 18,
      y: 50,
      cornerProgress: 75.4,
      coverageStart: 62,
      coverageEnd: 88,
      linkedError: 'ARITHMETIC',
      friendlyErrorName: 'Divide by Zero',
      correctCounter: 'OVERLOAD',
    },
    {
      nodeId: 4,
      label: 'Sector Delta',
      gridIndex: 3,
      branch: 2,
      x: 18,
      y: 82,
      cornerProgress: 50.8,
      coverageStart: 38,
      coverageEnd: 62,
      linkedError: 'NULL_POINTER',
      friendlyErrorName: 'Missing Value',
      correctCounter: 'QUARANTINE',
    },
  ],
  // Wave 2: 3 Nodes on each branch (Covers Missing Value, Invalid Number, Wrong Data Type)
  2: [
    {
      nodeId: 1,
      label: 'Sector Alpha',
      gridIndex: 0,
      branch: 1,
      x: 50,
      y: 18,
      cornerProgress: 26.2,
      coverageStart: 15,
      coverageEnd: 38,
      linkedError: 'NULL_POINTER',
      friendlyErrorName: 'Missing Value',
      correctCounter: 'QUARANTINE',
    },
    {
      nodeId: 2,
      label: 'Sector Beta',
      gridIndex: 1,
      branch: 1,
      x: 82,
      y: 18,
      cornerProgress: 50.8,
      coverageStart: 38,
      coverageEnd: 62,
      linkedError: 'NUMBER_FORMAT',
      friendlyErrorName: 'Invalid Number',
      correctCounter: 'RECALIBRATE',
    },
    {
      nodeId: 3,
      label: 'Sector Gamma',
      gridIndex: 2,
      branch: 1,
      x: 82,
      y: 50,
      cornerProgress: 75.4,
      coverageStart: 62,
      coverageEnd: 88,
      linkedError: 'CLASS_CAST',
      friendlyErrorName: 'Wrong Data Type',
      correctCounter: 'FILTER',
    },
    {
      nodeId: 4,
      label: 'Sector Delta',
      gridIndex: 3,
      branch: 2,
      x: 50,
      y: 82,
      cornerProgress: 26.2,
      coverageStart: 15,
      coverageEnd: 38,
      linkedError: 'NULL_POINTER',
      friendlyErrorName: 'Missing Value',
      correctCounter: 'QUARANTINE',
    },
    {
      nodeId: 5,
      label: 'Sector Epsilon',
      gridIndex: 4,
      branch: 2,
      x: 18,
      y: 82,
      cornerProgress: 50.8,
      coverageStart: 38,
      coverageEnd: 62,
      linkedError: 'NUMBER_FORMAT',
      friendlyErrorName: 'Invalid Number',
      correctCounter: 'RECALIBRATE',
    },
    {
      nodeId: 6,
      label: 'Sector Zeta',
      gridIndex: 5,
      branch: 2,
      x: 18,
      y: 50,
      cornerProgress: 75.4,
      coverageStart: 62,
      coverageEnd: 88,
      linkedError: 'CLASS_CAST',
      friendlyErrorName: 'Wrong Data Type',
      correctCounter: 'FILTER',
    },
  ],
  // Wave 3: 3 Nodes on each branch (Covers Buffer Clamp, Type Filter, Bomber)
  3: [
    {
      nodeId: 1,
      label: 'Sector Alpha',
      gridIndex: 0,
      branch: 1,
      x: 50,
      y: 18,
      cornerProgress: 26.2,
      coverageStart: 15,
      coverageEnd: 38,
      linkedError: 'OUT_OF_BOUNDS',
      friendlyErrorName: 'Out of Bounds',
      correctCounter: 'CLAMP',
    },
    {
      nodeId: 2,
      label: 'Sector Beta',
      gridIndex: 1,
      branch: 1,
      x: 82,
      y: 18,
      cornerProgress: 50.8,
      coverageStart: 38,
      coverageEnd: 62,
      linkedError: 'CLASS_CAST',
      friendlyErrorName: 'Wrong Data Type',
      correctCounter: 'FILTER',
    },
    {
      nodeId: 3,
      label: 'Sector Gamma',
      gridIndex: 2,
      branch: 1,
      x: 82,
      y: 50,
      cornerProgress: 75.4,
      coverageStart: 62,
      coverageEnd: 88,
      linkedError: 'ARITHMETIC',
      friendlyErrorName: 'Divide by Zero',
      correctCounter: 'OVERLOAD',
    },
    {
      nodeId: 4,
      label: 'Sector Delta',
      gridIndex: 3,
      branch: 2,
      x: 50,
      y: 82,
      cornerProgress: 26.2,
      coverageStart: 15,
      coverageEnd: 38,
      linkedError: 'OUT_OF_BOUNDS',
      friendlyErrorName: 'Out of Bounds',
      correctCounter: 'CLAMP',
    },
    {
      nodeId: 5,
      label: 'Sector Epsilon',
      gridIndex: 4,
      branch: 2,
      x: 18,
      y: 82,
      cornerProgress: 50.8,
      coverageStart: 38,
      coverageEnd: 62,
      linkedError: 'CLASS_CAST',
      friendlyErrorName: 'Wrong Data Type',
      correctCounter: 'FILTER',
    },
    {
      nodeId: 6,
      label: 'Sector Zeta',
      gridIndex: 5,
      branch: 2,
      x: 18,
      y: 50,
      cornerProgress: 75.4,
      coverageStart: 62,
      coverageEnd: 88,
      linkedError: 'ARITHMETIC',
      friendlyErrorName: 'Divide by Zero',
      correctCounter: 'OVERLOAD',
    },
  ],
};

interface ActiveProjectile {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  action: ActionType;
}

interface JupiterLevel2SimulationProps {
  validation: Jupiter2ValidationResult;
  isRunning: boolean;
  wave?: Jupiter2Wave;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
  resetKey?: number;
  onResetSimulation?: () => void;
  onSaveAndExit?: () => void;
}

interface ErrorManifestItem {
  friendlyName: string;
  realName: string;
  type: string;
  counter: string;
  actionPill: string;
  color: string;
}

const renderThreatVisualMini = (type: string) => {
  switch (type) {
    case 'NullPointerException':
      return (
        <div className="w-8 h-8 shrink-0 rounded-lg border-2 border-dashed border-red-500 bg-gradient-to-b from-[#2a0408] via-black to-[#150003] shadow-[0_0_12px_rgba(239,68,68,0.9)] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] mb-0.5" />
          <span className="font-mono text-[7px] font-black text-red-100 leading-none">NULL</span>
        </div>
      );
    case 'ArithmeticException':
      return (
        <div className="w-8 h-8 shrink-0 rounded-full border-2 border-fuchsia-400 bg-gradient-to-tr from-purple-950 via-black to-fuchsia-950 shadow-[0_0_12px_rgba(192,132,252,0.85)] flex items-center justify-center relative">
          <div className="w-3.5 h-3.5 rounded-full bg-black border border-purple-300 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-300" />
          </div>
        </div>
      );
    case 'NumberFormatException':
      return (
        <div className="w-9 h-9 shrink-0 relative flex items-center justify-center">
          {/* Corrupted 7-Segment LED Digit with Fractured Glitch Maw & Red Decimals */}
          <svg className="w-9 h-9 drop-shadow-[0_0_12px_rgba(245,158,11,0.95)]" viewBox="0 0 36 36" fill="none">
            {/* Dark Hex/Octagonal Digital Bezel */}
            <path
              d="M11 2 L25 2 L33 10 L33 26 L25 34 L11 34 L3 26 L3 10 Z"
              fill="#100500"
              stroke="#f59e0b"
              strokeWidth="1.2"
            />
            {/* Fractured 7-Segment Amber LED Bars forming an evil corrupted '8' */}
            <polygon points="12,5 24,5 22,7.5 14,7.5" fill="#f59e0b" opacity="0.9" />
            <polygon points="6,11 8.5,13 8.5,17 6,18" fill="#f59e0b" opacity="0.85" />
            <polygon points="30,11 30,18 27.5,17 27.5,13" fill="#ef4444" opacity="0.95" />
            <polygon points="9,18 13,16.5 23,16.5 27,18 22,19.5 14,19.5" fill="#ef4444" />
            <polygon points="6,19 8.5,20 8.5,24 6,26" fill="#f59e0b" opacity="0.85" />
            <polygon points="30,19 30,26 27.5,24 27.5,20" fill="#f59e0b" opacity="0.9" />
            <polygon points="12,31 14,28.5 22,28.5 24,31" fill="#f59e0b" opacity="0.9" />
            {/* Corrupted Non-Numeric 'NaN' / Character Runes bleeding in center */}
            <text x="18" y="15" textAnchor="middle" fill="#fef08a" fontSize="6.5" fontFamily="monospace" fontWeight="900">#N</text>
            <text x="18" y="27" textAnchor="middle" fill="#f87171" fontSize="6" fontFamily="monospace" fontWeight="900">!a</text>
            {/* Evil Glowing Decimal Point LED Eyes */}
            <circle cx="28.5" cy="29.5" r="1.5" fill="#ef4444" />
            <circle cx="7.5" cy="7.5" r="1.2" fill="#ef4444" />
          </svg>
        </div>
      );
    case 'ArrayIndexOutOfBoundsException':
      return (
        <div className="w-9 h-9 shrink-0 relative flex items-center justify-center">
          {/* Array Brackets [ 0 | 1 | 2 ] with Forward Breach Spike Piercing Past Boundary */}
          <svg className="w-9 h-9 drop-shadow-[0_0_12px_rgba(6,182,212,0.95)]" viewBox="0 0 36 36" fill="none">
            {/* Left Bracket: '[' (Solid Cyber Containment) */}
            <path
              d="M10 6 L4 6 L4 30 L10 30"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeLinecap="square"
            />
            {/* Segmented Array Memory Cells */}
            <line x1="10" y1="12" x2="10" y2="24" stroke="#0e7490" strokeWidth="1" strokeDasharray="2 1" />
            <line x1="16" y1="12" x2="16" y2="24" stroke="#0e7490" strokeWidth="1" strokeDasharray="2 1" />
            <line x1="22" y1="12" x2="22" y2="24" stroke="#0e7490" strokeWidth="1" strokeDasharray="2 1" />
            <text x="7" y="20" fill="#38bdf8" fontSize="6.5" fontFamily="monospace" fontWeight="bold">0</text>
            <text x="13" y="20" fill="#38bdf8" fontSize="6.5" fontFamily="monospace" fontWeight="bold">1</text>
            <text x="19" y="20" fill="#38bdf8" fontSize="6.5" fontFamily="monospace" fontWeight="bold">2</text>
            {/* Shattered Right Bracket: ']' with fracture lines */}
            <path
              d="M26 6 L32 6 L31 13"
              stroke="#ef4444"
              strokeWidth="1.8"
            />
            <path
              d="M31 23 L32 30 L26 30"
              stroke="#ef4444"
              strokeWidth="1.8"
            />
            {/* Aggressive Forward Breach Spike (i >> MAX) Piercing Beyond the Bracket */}
            <path
              d="M20 18 L26 14 L35 18 L26 22 Z"
              fill="#ef4444"
              stroke="#fca5a5"
              strokeWidth="1"
            />
            <line x1="33" y1="13" x2="36" y2="10" stroke="#f87171" strokeWidth="1.2" />
            <line x1="33" y1="23" x2="36" y2="26" stroke="#f87171" strokeWidth="1.2" />
            <line x1="22" y1="18" x2="32" y2="18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'ClassCastException':
      return (
        <div className="w-9 h-9 shrink-0 relative flex items-center justify-center">
          {/* Incompatible Type Clash: Generic < > Brackets & Conflicting Shapes */}
          <svg className="w-9 h-9 drop-shadow-[0_0_12px_rgba(168,85,247,0.95)]" viewBox="0 0 36 36" fill="none">
            {/* Generic Type Angle Brackets: '<' and '>' */}
            <path
              d="M8 9 L2 18 L8 27"
              stroke="#c084fc"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28 9 L34 18 L28 27"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Incompatible Type 1: Sharp Violet Diamond */}
            <polygon
              points="18,6 25,18 18,22 11,18"
              fill="#4c1d95"
              stroke="#a855f7"
              strokeWidth="1.2"
            />
            {/* Incompatible Type 2: Acid-Cyan Circular Matrix violently intersecting */}
            <circle
              cx="18"
              cy="20"
              r="7"
              fill="#083344"
              stroke="#06b6d4"
              strokeWidth="1.2"
              strokeDasharray="3 1.5"
            />
            {/* Violent Type Mismatch Clash / Chromatic Tear */}
            <path
              d="M15 15 L21 21 M21 15 L15 21"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M13 18 L17 19 L19 17 L23 18"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 shrink-0 rounded-lg border border-red-400 bg-red-950/80 flex items-center justify-center">
          <AlertTriangle size={12} className="text-red-400" />
        </div>
      );
  }
};

const WAVE_ERROR_MANIFEST: Record<
  Jupiter2Wave,
  {
    title: string;
    threats: ErrorManifestItem[];
  }
> = {
  1: {
    title: "Wave 1: Threats",
    threats: [
      {
        friendlyName: "Missing Value",
        realName: "NullPointerException",
        type: "NullPointerException",
        counter: "The Wall",
        actionPill: "Quarantine with Wall",
        color: "text-red-400",
      },
      {
        friendlyName: "Divide by Zero",
        realName: "ArithmeticException",
        type: "ArithmeticException",
        counter: "The Bomber",
        actionPill: "Purge with Bomber",
        color: "text-purple-300",
      },
    ],
  },
  2: {
    title: "Wave 2: Threats",
    threats: [
      {
        friendlyName: "Missing Value",
        realName: "NullPointerException",
        type: "NullPointerException",
        counter: "The Wall",
        actionPill: "Quarantine with Wall",
        color: "text-red-400",
      },
      {
        friendlyName: "Invalid Number",
        realName: "NumberFormatException",
        type: "NumberFormatException",
        counter: "The Gun Turret",
        actionPill: "Recalibrate with Gun Turret",
        color: "text-yellow-300",
      },
      {
        friendlyName: "Wrong Data Type",
        realName: "ClassCastException",
        type: "ClassCastException",
        counter: "Type Filter",
        actionPill: "Filter with Type Filter",
        color: "text-violet-300",
      },
    ],
  },
  3: {
    title: "Wave 3: Threats",
    threats: [
      {
        friendlyName: "Out of Bounds",
        realName: "ArrayIndexOutOfBoundsException",
        type: "ArrayIndexOutOfBoundsException",
        counter: "Buffer Clamp",
        actionPill: "Clamp with Buffer Clamp",
        color: "text-cyan-300",
      },
      {
        friendlyName: "Wrong Data Type",
        realName: "ClassCastException",
        type: "ClassCastException",
        counter: "Type Filter",
        actionPill: "Filter with Type Filter",
        color: "text-violet-300",
      },
      {
        friendlyName: "Divide by Zero",
        realName: "ArithmeticException",
        type: "ArithmeticException",
        counter: "The Bomber",
        actionPill: "Purge with Bomber",
        color: "text-purple-300",
      },
    ],
  },
};

const getInitialEntitySpeed = (type: DataBlockType): number => {
  switch (type) {
    case 'null_pointer':
      return 0.68; // Phantom Sprinter (high speed)
    case 'arithmetic':
      return 0.50; // Heavy vortex mass
    case 'number_format':
      return 0.54; // Glitchy erratic frequency
    case 'out_of_bounds':
      return 0.38; // Heavy armored juggernaut
    case 'class_cast':
      return 0.46; // Polymorphic Chameleon
    case 'clean':
    default:
      return 0.50; // Standard clean data velocity
  }
};

const getInitialEntityHp = (_type: DataBlockType): number => 1;

export default function JupiterLevel2Simulation({
  validation,
  isRunning,
  wave = 1,
  onSimulationComplete,
  resetKey = 0,
  onResetSimulation,
}: JupiterLevel2SimulationProps) {
  // Core State
  const [entities, setEntities] = useState<DataBlockEntity[]>([]);
  const [coreHp, setCoreHp] = useState<number>(3);
  const coreHpRef = useRef<number>(3);
  const [serverStatus, setServerStatus] = useState<'ONLINE' | 'CRASHED'>('ONLINE');
  const [crashReason, setCrashReason] = useState<string | null>(null);
  const [crashExceptionName, setCrashExceptionName] = useState<string>('');
  const [coreExplosion, setCoreExplosion] = useState<boolean>(false);
  const [dataRescued, setDataRescued] = useState<number>(0);
  const [threatsNeutralized, setThreatsNeutralized] = useState<number>(0);
  const [collateralLost, setCollateralLost] = useState<number>(0);
  const [showIoDialog, setShowIoDialog] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [screenFlash, setScreenFlash] = useState<boolean>(false);
  const [finallyShieldActive, setFinallyShieldActive] = useState<boolean>(false);
  const [shieldCharge, setShieldCharge] = useState<number>(3);
  const shieldChargeRef = useRef<number>(3);
  const [shieldPulse, setShieldPulse] = useState<boolean>(false);

  // Turret Node Durability and Destruction State (Supports up to 6 nodes across branches)
  const [nodeDurability, setNodeDurability] = useState<Record<number, number>>({ 1: 100, 2: 100, 3: 100, 4: 100, 5: 100, 6: 100 });
  const [nodeDestroyed, setNodeDestroyed] = useState<Record<number, boolean>>({});
  const nodeDurabilityRef = useRef<Record<number, number>>({ 1: 100, 2: 100, 3: 100, 4: 100, 5: 100, 6: 100 });
  const nodeDestroyedRef = useRef<Record<number, boolean>>({});

  // Persistent Turret Aiming Angles (Turrets stay aimed where they last fired, never snapping back)
  const defaultAimAngles: Record<number, number> = useMemo(() => ({
    1: 180, // Branch 1 run 1
    2: 225, // Branch 1 corner 1
    3: 270, // Branch 1 corner 2
    4: 0,   // Branch 2 run 1
    5: 45,  // Branch 2 corner 1
    6: 90,  // Branch 2 corner 2
  }), []);
  const [turretAngles, setTurretAngles] = useState<Record<number, number>>({
    1: 180, 2: 225, 3: 270, 4: 0, 5: 45, 6: 90,
  });
  const turretAnglesRef = useRef<Record<number, number>>({
    1: 180, 2: 225, 3: 270, 4: 0, 5: 45, 6: 90,
  });

  // Errors Dropdown State (Scoped strictly to current wave)
  const [isErrorsDropdownOpen, setIsErrorsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsErrorsDropdownOpen(false);
      }
    };
    if (isErrorsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isErrorsDropdownOpen]);

  const remainingDataCount = useMemo(() => {
    return entities.filter(e => e.status !== 'scored' && e.status !== 'quarantined' && e.status !== 'crashed').length;
  }, [entities]);

  // Active Projectiles & Turret Combat Cooldowns
  const [activeProjectiles, setActiveProjectiles] = useState<ActiveProjectile[]>([]);
  const turretCooldownsRef = useRef<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
  const turretZapCooldownsRef = useRef<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });

  const triggerProjectile = useCallback((fromX: number, fromY: number, toX: number, toY: number, color: string, action: ActionType) => {
    const id = `${Date.now()}-${Math.random()}`;
    const p: ActiveProjectile = {
      id,
      fromX,
      fromY,
      toX,
      toY,
      color,
      action,
    };
    setActiveProjectiles(prev => [...prev.slice(-6), p]);
    setTimeout(() => {
      setActiveProjectiles(prev => prev.filter(item => item.id !== id));
    }, 280);
  }, []);

  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasFinishedRef = useRef<boolean>(false);
  const isRunningRef = useRef<boolean>(isRunning);
  isRunningRef.current = isRunning;

  // Active Timeout Tracker to prevent leaks and ghost updates after simulation stop/reset
  const activeTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const safeTimeout = useCallback((fn: () => void, delay: number) => {
    const t = setTimeout(() => {
      activeTimeoutsRef.current = activeTimeoutsRef.current.filter(item => item !== t);
      fn();
    }, delay);
    activeTimeoutsRef.current.push(t);
    return t;
  }, []);

  const clearAllActiveTimeouts = useCallback(() => {
    activeTimeoutsRef.current.forEach(t => clearTimeout(t));
    activeTimeoutsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearAllActiveTimeouts();
    };
  }, [clearAllActiveTimeouts]);

  // Track SVG Path definitions for dual cyber branches converging at Center Base
  const topTrackPathD = useMemo(() => {
    return TOP_BRANCH_PATH.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, []);

  const bottomTrackPathD = useMemo(() => {
    return BOTTOM_BRANCH_PATH.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, []);

  const trackPathD = useMemo(() => {
    return `${topTrackPathD} ${bottomTrackPathD}`;
  }, [topTrackPathD, bottomTrackPathD]);

  // Station the defense nodes pre-set and linked with the wave's errors
  const mountedTurrets = useMemo(() => {
    const list = validation.turretLogic || [];
    const presets = WAVE_PRESET_NODES[wave] || WAVE_PRESET_NODES[1];

    const branch1Nodes = presets.filter(n => n.branch === 1);
    const branch2Nodes = presets.filter(n => n.branch === 2);

    const assignForBranch = (nodes: WaveDefenseNode[]) => {
      const assigned: Array<{
        node: WaveDefenseNode;
        turret: TurretLogicItem | null;
        assignedAction: ActionType | null;
        isCorrect: boolean;
      }> = [];

      const usedRuleIds = new Set<string>();

      // Pass 1: Exact matches (rule.rawException === node.linkedError)
      for (const node of nodes) {
        const exactRule = list.find(r => !usedRuleIds.has(r.id) && r.rawException === node.linkedError);
        if (exactRule) {
          usedRuleIds.add(exactRule.id);
          const isCorrect = exactRule.rawAction === node.correctCounter;
          assigned.push({
            node,
            turret: exactRule,
            assignedAction: exactRule.rawAction,
            isCorrect,
          });
        } else {
          assigned.push({
            node,
            turret: null,
            assignedAction: null,
            isCorrect: false,
          });
        }
      }

      // Pass 2: Generalist (isGeneralist: rawException === 'GENERAL_EXCEPTION')
      const generalistRule = list.find(r => r.isGeneralist);
      if (generalistRule) {
        for (let i = 0; i < assigned.length; i++) {
          if (!assigned[i].assignedAction) {
            assigned[i] = {
              node: assigned[i].node,
              turret: generalistRule,
              assignedAction: generalistRule.rawAction,
              isCorrect: generalistRule.rawAction === assigned[i].node.correctCounter,
            };
          }
        }
      }

      // Sockets for errors the player did not write a rule for remain empty and dormant (will not fire).
      return assigned;
    };

    const b1Assigned = assignForBranch(branch1Nodes);
    const b2Assigned = assignForBranch(branch2Nodes);

    return [...b1Assigned, ...b2Assigned].sort((a, b) => a.node.nodeId - b.node.nodeId);
  }, [validation.turretLogic, wave]);

  // Compute excess rules declared by player beyond physical sector capacity
  const standbyRules = useMemo(() => {
    const list = validation.turretLogic || [];
    const mountedRuleIds = new Set(mountedTurrets.map(m => m.turret?.id).filter(Boolean));
    return list.filter(r => !mountedRuleIds.has(r.id));
  }, [validation.turretLogic, mountedTurrets]);

  // Reset simulation state
  const resetSimulation = useCallback(() => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
    clearAllActiveTimeouts();
    hasFinishedRef.current = false;
    coreHpRef.current = 3;
    setCoreHp(3);
    setServerStatus('ONLINE');
    setCrashReason(null);
    setCrashExceptionName('');
    setCoreExplosion(false);
    setDataRescued(0);
    setThreatsNeutralized(0);
    setCollateralLost(0);
    setShowIoDialog(false);
    setWarningMessage(null);
    setScreenFlash(false);
    shieldChargeRef.current = 3;
    setShieldCharge(3);
    setFinallyShieldActive(Boolean(validation.hasFinally));
    setActiveProjectiles([]);

    nodeDurabilityRef.current = { 1: 100, 2: 100, 3: 100, 4: 100, 5: 100, 6: 100 };
    nodeDestroyedRef.current = {};
    setNodeDurability({ 1: 100, 2: 100, 3: 100, 4: 100, 5: 100, 6: 100 });
    setNodeDestroyed({});

    turretCooldownsRef.current = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    turretZapCooldownsRef.current = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    turretAnglesRef.current = { ...defaultAimAngles };
    setTurretAngles({ ...defaultAimAngles });

    const waveBlocks = JUPITER2_WAVE_CONFIGS[wave] || JUPITER2_WAVE_CONFIGS[1];
    const initialEntities: DataBlockEntity[] = waveBlocks.map((cfg, i) => {
      const maxHp = getInitialEntityHp(cfg.type);
      const branch: 1 | 2 = (i % 2 === 0 ? 1 : 2);
      const startPos = branch === 2 ? BOTTOM_BRANCH_PATH[0] : TOP_BRANCH_PATH[0];
      return {
        id: cfg.id,
        type: cfg.type,
        label: cfg.label,
        branch,
        x: startPos.x,
        y: startPos.y,
        progress: -(cfg.delay / 500) * 2.2,
        status: 'moving' as const,
        speed: getInitialEntitySpeed(cfg.type),
        hp: maxHp,
        maxHp: maxHp,
        hitFlash: false,
      };
    });

    setEntities(initialEntities);
  }, [validation.hasFinally, validation.turretLogic, wave, defaultAimAngles, clearAllActiveTimeouts]);

  // Sync with resetKey
  useEffect(() => {
    resetSimulation();
  }, [resetKey, resetSimulation]);

  // Auto-dismiss KERNEL PANIC only when user actually edits or updates workspace blocks
  const prevValidationRef = useRef(validation);
  useEffect(() => {
    if (prevValidationRef.current !== validation) {
      prevValidationRef.current = validation;
      if (serverStatus === 'CRASHED') {
        setServerStatus('ONLINE');
        setCrashReason(null);
        setCrashExceptionName('');
      }
    }
  }, [validation, serverStatus]);

  // Handle Level Restart
  const handleRestartLevel = () => {
    setServerStatus('ONLINE');
    setCrashReason(null);
    setCrashExceptionName('');
    resetSimulation();
    if (onResetSimulation) {
      onResetSimulation();
    }
  };

  // Main Simulation Loop
  useEffect(() => {
    if (!isRunning) {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
      return;
    }

    resetSimulation();

    const interval = setInterval(() => {
      // 1. Decrement Cooldowns (all 6 potential turret nodes)
      for (const k of [1, 2, 3, 4, 5, 6]) {
        turretCooldownsRef.current[k] = Math.max(0, (turretCooldownsRef.current[k] || 0) - 50);
        turretZapCooldownsRef.current[k] = Math.max(0, (turretZapCooldownsRef.current[k] || 0) - 50);
      }

      setEntities(prevEntities => {
        if (hasFinishedRef.current) return prevEntities;

        let hpDamage = 0;
        let crashMsg = '';
        let excName = '';
        let newlyRescued = 0;
        let newlyNeutralized = 0;

        const targetExceptions: Record<DataBlockType, string> = {
          clean: '',
          null_pointer: 'NULL_POINTER',
          number_format: 'NUMBER_FORMAT',
          out_of_bounds: 'OUT_OF_BOUNDS',
          arithmetic: 'ARITHMETIC',
          class_cast: 'CLASS_CAST',
        };

        const typeNames: Record<DataBlockType, string> = {
          clean: 'CleanData',
          null_pointer: 'NullPointerException',
          number_format: 'NumberFormatException',
          out_of_bounds: 'ArrayIndexOutOfBoundsException',
          arithmetic: 'ArithmeticException',
          class_cast: 'ClassCastException',
        };

        const TYPE_CORRECT_ACTION: Partial<Record<DataBlockType, ActionType>> = {
          null_pointer: 'QUARANTINE',
          arithmetic: 'OVERLOAD',
          number_format: 'RECALIBRATE',
          out_of_bounds: 'CLAMP',
          class_cast: 'FILTER',
        };

        // Find active Walls
        const activeWalls = mountedTurrets.filter(
          item => item.assignedAction === 'QUARANTINE'
        );

        // Step 1: Advance entities along their branch and enforce physical wall barrier
        const movedEntities: DataBlockEntity[] = prevEntities.map((ent): DataBlockEntity => {
          if (ent.status === 'scored' || ent.status === 'quarantined' || ent.status === 'crashed' || ent.status === 'exploding') {
            return ent;
          }

          const entBranch = ent.branch || 1;

          let nextProgress = ent.progress + ent.speed;

          // Check Scanner Node Grid Trap
          if (validation.hasThrowTrap && !ent.isDerailed && ent.type !== 'clean' && nextProgress >= 48 && ent.progress < 54) {
            audioFX.playTrapDerail();
            newlyNeutralized++;
            const trapPos = getPointOnBranch(entBranch, 50);
            return {
              ...ent,
              progress: 50,
              x: trapPos.x,
              y: trapPos.y,
              status: 'quarantined' as const,
              isDerailed: true,
              speed: 0,
            };
          }

          // Physical Wall Barricade: Cleanly prevents matching corrupted errors on same branch from advancing past corner
          if (ent.type !== 'clean' && ent.status === 'moving' && nextProgress > 0) {
            const reqException = targetExceptions[ent.type];
            for (const wallItem of activeWalls) {
              if (wallItem.node.branch !== entBranch) continue;
              const matchesAssigned = wallItem.node.linkedError === reqException;
              if (matchesAssigned) {
                // Collide only when physically reaching / touching the wall at the corner
                if (nextProgress >= wallItem.node.cornerProgress) {
                  const impactPos = getPointOnBranch(entBranch, wallItem.node.cornerProgress);

                  if (wallItem.isCorrect) {
                    // Blocked on physical collision with the wall barrier (no explosion)
                    audioFX.playWallExplosion();
                    triggerProjectile(wallItem.node.x, wallItem.node.y, impactPos.x, impactPos.y, '#38bdf8', 'QUARANTINE');
                    newlyNeutralized++;

                    return {
                      ...ent,
                      progress: wallItem.node.cornerProgress,
                      x: impactPos.x,
                      y: impactPos.y,
                      status: 'quarantined' as const,
                      hitFlash: false,
                    };
                  }
                }
              }
            }
          }

          const pos = getPointOnBranch(entBranch, nextProgress);

          // Check The Shield (finally) Failsafe before reaching center core (progress >= 92%)
          if (validation.hasFinally && shieldChargeRef.current > 0 && nextProgress >= 92 && ent.type !== 'clean' && ent.status === 'moving') {
            audioFX.playShieldAbsorb();
            shieldChargeRef.current = Math.max(0, shieldChargeRef.current - 1);
            const rem = shieldChargeRef.current;
            setShieldCharge(rem);
            newlyNeutralized++;
            setShieldPulse(true);
            safeTimeout(() => setShieldPulse(false), 900);
            return {
              ...ent,
              progress: 94,
              status: 'quarantined' as const,
            };
          }

          // Check if reached Main Server Core in the center (progress >= 96%)
          if (nextProgress >= 96) {
            if (ent.type === 'clean' || ent.status === 'recalibrated') {
              newlyRescued++;
              audioFX.playDataRescued();
              return {
                ...ent,
                progress: 100,
                x: 50,
                y: 50,
                status: 'scored' as const,
              };
            } else {
              hpDamage++;
              excName = typeNames[ent.type] || 'Exception';
              crashMsg = `FATAL UNCAUGHT EXCEPTION: ${excName} breached Server Core!`;
              audioFX.playCrashAlarm();
              return {
                ...ent,
                progress: 100,
                x: 50,
                y: 50,
                status: 'crashed' as const,
              };
            }
          }

          return {
            ...ent,
            progress: nextProgress,
            x: pos.x,
            y: pos.y,
            hitFlash: false,
          };
        });

        // Step 2: Instant Turret Defense Interceptions (Key & Lock Tower Defense)
        const updated = movedEntities.map(ent => ({ ...ent }));

        for (const item of mountedTurrets) {
          const nId = item.node.nodeId;
          if (!item.assignedAction) continue;

          const isGun = item.assignedAction === 'RECALIBRATE';
          const isBomb = item.assignedAction === 'OVERLOAD';
          const isWall = item.assignedAction === 'QUARANTINE';
          const isClamp = item.assignedAction === 'CLAMP';
          const isFilter = item.assignedAction === 'FILTER';

          // Wall is a stationary physical barricade handled on collision in Step 1
          if (isWall) continue;

          const rangeRadius = isBomb ? 44 : isGun ? 42 : isClamp ? 20 : 44;

          // Find foremost error within range or sector coverage matching this node's linked threat and branch
          // Note: CLAMP is a melee turret; it triggers when the threat passes in close proximity alongside the node
          const candidate = updated.find(
            e => e.status === 'moving' && !e.isIncomingBomb && e.type !== 'clean' && e.progress > 0 &&
              (e.branch || 1) === item.node.branch &&
              (targetExceptions[e.type] === item.node.linkedError || item.turret?.isGeneralist) &&
              (isClamp
                ? (Math.hypot(e.x - item.node.x, e.y - item.node.y) <= 26 || Math.abs(e.progress - item.node.cornerProgress) <= 14)
                : (Math.hypot(e.x - item.node.x, e.y - item.node.y) <= rangeRadius ||
                   (e.progress >= (item.node.coverageStart - 2) && e.progress <= (item.node.coverageEnd + 14))))
          );

          if (candidate) {
            const canTriggerVisual = (turretCooldownsRef.current[nId] || 0) <= 0;
            if (canTriggerVisual) {
              turretCooldownsRef.current[nId] = isGun ? 260 : isBomb ? 400 : isClamp ? 320 : 300;
            }

            // Persist aim angle toward this target so the turret holds its heading after firing
            const aimAngle = Math.atan2(candidate.y - item.node.y, candidate.x - item.node.x) * (180 / Math.PI) + 90;
            turretAnglesRef.current = { ...turretAnglesRef.current, [nId]: aimAngle };
            setTurretAngles(turretAnglesRef.current);

            if (item.isCorrect) {
              // Correct counter: neutralized or recalibrated!
              if (isGun) {
                if (canTriggerVisual) {
                  audioFX.playLaserShot();
                  triggerProjectile(item.node.x, item.node.y, candidate.x, candidate.y, '#38bdf8', 'RECALIBRATE');
                }
                candidate.status = 'recalibrated';
                candidate.speed = 0.55;
                candidate.hitFlash = true;
              } else if (isBomb) {
                if (canTriggerVisual) {
                  triggerProjectile(item.node.x, item.node.y, candidate.x, candidate.y, '#ef4444', 'OVERLOAD');
                }
                const targetId = candidate.id;
                candidate.isIncomingBomb = true;
                candidate.speed = 0.04; // Lock target in blast zone during flight

                // Shell detonates upon impact with void after travel time (260ms)
                safeTimeout(() => {
                  audioFX.playDetonation();
                  setThreatsNeutralized(prev => prev + 1);
                  setEntities(prev => prev.map(e => {
                    if (e.id === targetId && e.status !== 'quarantined' && e.status !== 'scored' && e.status !== 'crashed') {
                      return {
                        ...e,
                        status: 'exploding' as const,
                        hitFlash: true,
                        speed: 0,
                      };
                    }
                    return e;
                  }));

                  // Full animation cycle with singleExplosion (650ms), then transition to quarantined
                  safeTimeout(() => {
                    setEntities(prev => prev.map(e => e.id === targetId ? { ...e, status: 'quarantined' as const } : e));
                  }, 650);
                }, 260);
              } else if (isClamp) {
                if (canTriggerVisual) {
                  audioFX.playScissorSnip();
                  triggerProjectile(item.node.x, item.node.y, candidate.x, candidate.y, '#06b6d4', 'CLAMP');
                }
                candidate.status = 'quarantined';
                candidate.speed = 0;
                candidate.hitFlash = true;
                newlyNeutralized++;
              } else if (isFilter) {
                if (canTriggerVisual) {
                  audioFX.playLaserShot();
                  triggerProjectile(item.node.x, item.node.y, candidate.x, candidate.y, '#a855f7', 'FILTER');
                }
                candidate.status = 'quarantined';
                candidate.speed = 0;
                candidate.hitFlash = true;
                newlyNeutralized++;
              }
            } else {
              // Incorrect counter: fires but ineffective; threat continues untouched to Core
              candidate.hitFlash = true;
              if (canTriggerVisual) {
                if (isGun) {
                  audioFX.playLaserShot();
                  triggerProjectile(item.node.x, item.node.y, candidate.x, candidate.y, '#38bdf8', 'RECALIBRATE');
                } else if (isBomb) {
                  triggerProjectile(item.node.x, item.node.y, candidate.x, candidate.y, '#ef4444', 'OVERLOAD');
                  safeTimeout(() => {
                    audioFX.playDetonation();
                  }, 260);
                } else if (isClamp) {
                  audioFX.playScissorSnip();
                  triggerProjectile(item.node.x, item.node.y, candidate.x, candidate.y, '#06b6d4', 'CLAMP');
                } else if (isFilter) {
                  audioFX.playLaserShot();
                  triggerProjectile(item.node.x, item.node.y, candidate.x, candidate.y, '#a855f7', 'FILTER');
                }
              }
            }
          }
        }

        // Sync node durability state to React for animations
        setNodeDurability({ ...nodeDurabilityRef.current });
        setNodeDestroyed({ ...nodeDestroyedRef.current });

        if (newlyNeutralized > 0) {
          setThreatsNeutralized(prev => prev + newlyNeutralized);
        }

        if (newlyRescued > 0) {
          setDataRescued(prev => prev + newlyRescued);
        }

        // Apply breach damage to Server Core Integrity (3 Lives)
        if (hpDamage > 0) {
          setCoreExplosion(true);
          safeTimeout(() => setCoreExplosion(false), 900);
          coreHpRef.current = Math.max(0, coreHpRef.current - hpDamage);
          const nextHp = coreHpRef.current;
          setCoreHp(nextHp);

          if (nextHp <= 0 && !hasFinishedRef.current) {
            hasFinishedRef.current = true;
            clearInterval(interval);
            simulationTimerRef.current = null;
            setServerStatus('CRASHED');
            setCrashReason(crashMsg || 'Server Core breached! Core integrity depleted.');
            setCrashExceptionName(excName);
            setScreenFlash(true);
            safeTimeout(() => setScreenFlash(false), 800);
            safeTimeout(() => {
              if (onSimulationComplete) {
                onSimulationComplete(false, crashMsg || 'Base health depleted to 0 HP! The wave has failed.');
              }
            }, 0);
            return updated;
          }
        }

        // Check if entire wave has cleared (scoring, quarantined, or crashed)
        const allDone = updated.every(e =>
          e.status === 'scored' ||
          e.status === 'quarantined' ||
          e.status === 'crashed'
        );

        if (allDone && updated.length > 0 && !hasFinishedRef.current) {
          hasFinishedRef.current = true;
          clearInterval(interval);
          simulationTimerRef.current = null;
          if (coreHpRef.current <= 0) {
            setServerStatus('CRASHED');
            setCrashReason(crashMsg || 'Server Core breached! Core integrity depleted.');
            setCrashExceptionName(excName);
            safeTimeout(() => {
              if (onSimulationComplete) {
                onSimulationComplete(false, 'Base health depleted to 0 HP! The wave has failed.');
              }
            }, 0);
          } else {
            audioFX.playVictoryFanfare();
            if (wave === 3) {
              safeTimeout(() => {
                if (onSimulationComplete) {
                  onSimulationComplete(true);
                }
              }, 400);
            } else {
              setShowIoDialog(true);
            }
          }
        }

        return updated;
      });
    }, 50);

    simulationTimerRef.current = interval;

    return () => {
      clearInterval(interval);
    };
  }, [isRunning, mountedTurrets, onSimulationComplete, resetSimulation, triggerProjectile, validation.hasFinally, validation.hasThrowTrap, wave]);

  const handleIoProceed = () => {
    setShowIoDialog(false);
    if (onSimulationComplete) {
      onSimulationComplete(true);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#070e22] select-none overflow-hidden font-sans border-l border-white/10">
      {/* Screen Flash on Core Crash */}
      {screenFlash && (
        <div className="absolute inset-0 bg-red-600/40 z-50 pointer-events-none animate-pulse transition-opacity duration-300" />
      )}

      {/* Blueprint Grid Background Pattern inspired by earlier navigation levels */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.12) 0%, transparent 75%), linear-gradient(to right, rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.08) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
        }}
      />

      {/* ========================================================================= */}
      {/* TOP HUD HEADER: STATS & STREAMLINED MISSION INTEL */}
      {/* ========================================================================= */}
      <div className="relative z-40 flex items-center justify-between px-5 py-2.5 bg-[#09152b]/95 backdrop-blur-md border-b border-[#ff912d]/30 shadow-lg shrink-0">
        {/* Left: Errors Dropdown, Turrets Counter & Defensive Augments */}
        <div className="flex items-center gap-3">
          {/* Errors Dropdown Button & Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsErrorsDropdownOpen(prev => !prev)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all border cursor-pointer select-none ${isErrorsDropdownOpen
                ? 'bg-[#ff912d]/25 border-[#ff912d] text-white shadow-[0_0_12px_rgba(255,145,45,0.4)]'
                : 'bg-[#0b162c] border-[#ff912d]/40 text-amber-200 hover:text-white hover:bg-[#ff912d]/20 hover:border-[#ff912d]'
                }`}
            >
              <AlertTriangle size={13} className="text-[#ff912d]" />
              <span>Error Guide</span>
              {isErrorsDropdownOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {/* Dropdown Panel (Scoped specifically to active wave) */}
            {isErrorsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 z-50 w-96 sm:w-[420px] max-w-[90vw] bg-[#0a1226]/95 backdrop-blur-md border border-[#ff912d]/60 rounded-2xl shadow-[0_16px_45px_rgba(0,0,0,0.9)] p-3.5 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                {/* Header with Title and Close button */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-[#ff912d]" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      {WAVE_ERROR_MANIFEST[wave].title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsErrorsDropdownOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Specific Wave Threats List */}
                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                  {WAVE_ERROR_MANIFEST[wave].threats.map((threat, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {renderThreatVisualMini(threat.type)}
                        <div className="flex flex-col min-w-0">
                          <span className={`font-mono text-xs font-bold leading-tight ${threat.color}`}>
                            {threat.friendlyName}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400 font-normal leading-tight mt-0.5 whitespace-nowrap">
                            ({threat.realName})
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <span className="text-[10px] font-mono font-bold text-amber-200 bg-[#ff912d]/20 px-2.5 py-1 rounded-lg border border-[#ff912d]/40 whitespace-nowrap">
                          Solution: {threat.counter}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* Trap Status Badge */}
          {validation.hasThrowTrap && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-red-300 bg-red-950/60 px-2.5 py-1 rounded-full border border-red-500/40">
              <Zap size={11} className="text-red-400" />
              <span>Grid Trap Active</span>
            </div>
          )}
        </div>

        {/* Right: Remaining Data Counter (Counts DOWN as data resolves) */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-400/40 shadow-sm"
            title="Remaining Data Blocks"
          >
            <Layers size={14} className="text-cyan-400" />
            <span className="font-mono text-sm font-black text-white">{remainingDataCount}</span>
          </div>
        </div>
      </div>



      {/* ========================================================================= */}
      {/* 2D TOWER DEFENSE BLUEPRINT GRID CANVAS */}
      {/* ========================================================================= */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* SVG REVERSED S-SHAPE BLUEPRINT GRID TRACK */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blueprintTrackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#0284c7" />
              <stop offset="75%" stopColor="#ff912d" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <filter id="trackFilter">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Physical Track Road Bed (Dark Cyber Conduit) */}
          <path
            d={trackPathD}
            fill="none"
            stroke="#081427"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Subtle Outer Conduit Rail Accent */}
          <path
            d={trackPathD}
            fill="none"
            stroke="#132a4a"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Clean Glowing Blueprint Core Line */}
          <path
            d={trackPathD}
            fill="none"
            stroke="url(#blueprintTrackGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#trackFilter)"
          />

          {/* Subtle Pastel Orange Center Tracer */}
          <path
            d={trackPathD}
            fill="none"
            stroke="#ff912d"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.85"
          />

          {/* Turret Range Field Circles (Gun Turrets: 34%, Bomber: 38%, Clamp: 36%, Filter: 36%) */}
          {mountedTurrets.map(({ node, turret }) => {
            if (!turret) return null;

            const isGun = turret.rawAction === 'RECALIBRATE';
            const isBomb = turret.rawAction === 'OVERLOAD';
            const isClamp = turret.rawAction === 'CLAMP';
            const isFilter = turret.rawAction === 'FILTER';
            if (!isGun && !isBomb && !isClamp && !isFilter) return null;

            const radius = isBomb ? 38 : isGun ? 34 : isClamp ? 20 : 36;
            const strokeColor = isBomb ? '#ef4444' : isGun ? '#38bdf8' : isClamp ? '#06b6d4' : '#a855f7';
            const fillColor = isBomb
              ? 'rgba(239, 68, 68, 0.05)'
              : isGun
              ? 'rgba(56, 189, 248, 0.05)'
              : isClamp
              ? 'rgba(6, 182, 212, 0.05)'
              : 'rgba(168, 85, 247, 0.05)';
            const hasActiveShot = activeProjectiles.some(p => Math.hypot(p.fromX - node.x, p.fromY - node.y) < 1);

            return (
              <g key={`range-circle-${node.nodeId}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={hasActiveShot ? (isBomb ? 'rgba(239, 68, 68, 0.12)' : isGun ? 'rgba(56, 189, 248, 0.12)' : isClamp ? 'rgba(6, 182, 212, 0.12)' : 'rgba(168, 85, 247, 0.12)') : fillColor}
                  stroke={strokeColor}
                  strokeWidth={hasActiveShot ? "0.9" : "0.5"}
                  strokeDasharray="2.5 2.5"
                  strokeOpacity={hasActiveShot ? "0.85" : "0.35"}
                />
              </g>
            );
          })}

          {/* Active Turret Fire Projectiles & Visuals */}
          {activeProjectiles.map(p => (
            <g key={p.id}>
              {/* ARCHETYPE 1: THE WALL (QUARANTINE) - High-Power Energy Anchor Tether */}
              {p.action === 'QUARANTINE' && (
                <g>
                  {/* Heavy glowing power conduit beam from Wall Turret to track barricade */}
                  <line
                    x1={p.fromX}
                    y1={p.fromY}
                    x2={p.toX}
                    y2={p.toY}
                    stroke="#38bdf8"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeOpacity="0.8"
                    filter="url(#trackFilter)"
                  />
                  <line
                    x1={p.fromX}
                    y1={p.fromY}
                    x2={p.toX}
                    y2={p.toY}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                  {/* Anchor coupling emitter at turret */}
                  <circle cx={p.fromX} cy={p.fromY} r="2.8" fill="#38bdf8" className="animate-ping" />
                </g>
              )}

              {/* ARCHETYPE 2: THE BOMBER (OVERLOAD) - Heavy Artillery Mortar Shell */}
              {p.action === 'OVERLOAD' && (
                <g>
                  <line
                    x1={p.fromX}
                    y1={p.fromY}
                    x2={p.toX}
                    y2={p.toY}
                    stroke="#ef4444"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    strokeOpacity="0.6"
                  />
                  <circle r="2" fill="#ef4444" stroke="#ffffff" strokeWidth="0.6">
                    <animate attributeName="cx" from={p.fromX} to={p.toX} dur="0.28s" repeatCount="indefinite" />
                    <animate attributeName="cy" from={p.fromY} to={p.toY} dur="0.28s" repeatCount="indefinite" />
                  </circle>
                  <circle
                    cx={p.toX}
                    cy={p.toY}
                    r="4.5"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="1.2"
                    className="animate-ping"
                  />
                </g>
              )}

              {/* ARCHETYPE 3: THE GUN TURRET (RECALIBRATE) - High-Speed Kinetic Plasma Pellets */}
              {p.action === 'RECALIBRATE' && (
                <g>
                  {/* Muzzle Flash at Gun Barrel */}
                  <circle
                    cx={p.fromX}
                    cy={p.fromY}
                    r="2.5"
                    fill="#ff912d"
                    className="animate-ping"
                  />
                  {/* Set-Distance Laser Range Sightline */}
                  <line
                    x1={p.fromX}
                    y1={p.fromY}
                    x2={p.toX}
                    y2={p.toY}
                    stroke="#ff912d"
                    strokeWidth="0.6"
                    strokeDasharray="1.5 3"
                    strokeOpacity="0.35"
                  />
                  {/* Rapid Traveling Bullet Pellet 1 */}
                  <circle r="1.3" fill="#ffffff" stroke="#ff912d" strokeWidth="0.6">
                    <animate attributeName="cx" from={p.fromX} to={p.toX} dur="0.22s" repeatCount="indefinite" />
                    <animate attributeName="cy" from={p.fromY} to={p.toY} dur="0.22s" repeatCount="indefinite" />
                  </circle>
                  {/* Rapid Traveling Bullet Pellet 2 (Delayed Burst) */}
                  <circle r="1.1" fill="#ff912d">
                    <animate attributeName="cx" from={p.fromX} to={p.toX} dur="0.22s" begin="0.07s" repeatCount="indefinite" />
                    <animate attributeName="cy" from={p.fromY} to={p.toY} dur="0.22s" begin="0.07s" repeatCount="indefinite" />
                  </circle>
                  {/* Rapid Traveling Bullet Pellet 3 (Delayed Burst) */}
                  <circle r="0.9" fill="#fed7aa">
                    <animate attributeName="cx" from={p.fromX} to={p.toX} dur="0.22s" begin="0.14s" repeatCount="indefinite" />
                    <animate attributeName="cy" from={p.fromY} to={p.toY} dur="0.22s" begin="0.14s" repeatCount="indefinite" />
                  </circle>
                  {/* Kinetic Impact Sparks on Target Block */}
                  <circle
                    cx={p.toX}
                    cy={p.toY}
                    r="2.2"
                    fill="#ff912d"
                    className="animate-ping"
                  />
                </g>
              )}

              {/* ARCHETYPE 4: THE BUFFER CLAMP (CLAMP) - Melee Scissor Guillotine Snip */}
              {p.action === 'CLAMP' && (
                <g>
                  {/* Heavy Mechanical Arm Extends Directly to Threat */}
                  <line
                    x1={p.fromX}
                    y1={p.fromY}
                    x2={p.toX}
                    y2={p.toY}
                    stroke="#0891b2"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeOpacity="0.9"
                  />
                  <line
                    x1={p.fromX}
                    y1={p.fromY}
                    x2={p.toX}
                    y2={p.toY}
                    stroke="#a5f3fc"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  {/* Scissor Shear Blade 1: Diagonal Slash */}
                  <line
                    x1={p.toX - 4.5}
                    y1={p.toY - 4.5}
                    x2={p.toX + 4.5}
                    y2={p.toY + 4.5}
                    stroke="#06b6d4"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    filter="url(#trackFilter)"
                  />
                  <line
                    x1={p.toX - 4.5}
                    y1={p.toY - 4.5}
                    x2={p.toX + 4.5}
                    y2={p.toY + 4.5}
                    stroke="#ffffff"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  {/* Scissor Shear Blade 2: Crossing Diagonal Slash (X-Snip) */}
                  <line
                    x1={p.toX - 4.5}
                    y1={p.toY + 4.5}
                    x2={p.toX + 4.5}
                    y2={p.toY - 4.5}
                    stroke="#06b6d4"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    filter="url(#trackFilter)"
                  />
                  <line
                    x1={p.toX - 4.5}
                    y1={p.toY + 4.5}
                    x2={p.toX + 4.5}
                    y2={p.toY - 4.5}
                    stroke="#ffffff"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  {/* Scissor Pivot Rivet & Severed Debris / Sparks */}
                  <circle
                    cx={p.toX}
                    cy={p.toY}
                    r="3.6"
                    fill="#ffffff"
                    stroke="#22d3ee"
                    strokeWidth="1"
                    className="animate-ping"
                  />
                  <circle
                    cx={p.toX}
                    cy={p.toY}
                    r="1.8"
                    fill="#0891b2"
                  />
                </g>
              )}

              {/* ARCHETYPE 5: THE TYPE FILTER (FILTER) - Prismatic Holographic Scanner Fan */}
              {p.action === 'FILTER' && (
                <g>
                  {/* Prismatic Violet/Purple Laser Array */}
                  <line
                    x1={p.fromX}
                    y1={p.fromY}
                    x2={p.toX}
                    y2={p.toY}
                    stroke="#a855f7"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeOpacity="0.85"
                  />
                  <line
                    x1={p.fromX}
                    y1={p.fromY}
                    x2={p.toX}
                    y2={p.toY}
                    stroke="#e879f9"
                    strokeWidth="1"
                    className="animate-pulse"
                  />
                  {/* Chromatic Traveling Particle */}
                  <circle r="2" fill="#f0abfc" stroke="#a855f7" strokeWidth="0.5">
                    <animate attributeName="cx" from={p.fromX} to={p.toX} dur="0.2s" repeatCount="indefinite" />
                    <animate attributeName="cy" from={p.fromY} to={p.toY} dur="0.2s" repeatCount="indefinite" />
                  </circle>
                  {/* Holographic Scan Aperture at Target */}
                  <circle
                    cx={p.toX}
                    cy={p.toY}
                    r="3.8"
                    fill="none"
                    stroke="#c084fc"
                    strokeWidth="1.2"
                    className="animate-ping"
                  />
                  <circle
                    cx={p.toX}
                    cy={p.toY}
                    r="2"
                    fill="#f0abfc"
                    className="animate-ping"
                  />
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* ========================================================================= */}
        {/* PHYSICAL QUARANTINE WALL BARRICADE (SLAMS DOWN ON TRACK IN FRONT OF ENEMY) */}
        {/* ========================================================================= */}
        {activeProjectiles.filter(p => p.action === 'QUARANTINE').map(p => (
          <div
            key={`wall-barricade-${p.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-35 pointer-events-none flex flex-col items-center animate-in zoom-in-75 duration-150"
            style={{ left: `${p.toX}%`, top: `${p.toY}%` }}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-8 rounded-lg bg-[#031526]/95 border-2 border-cyan-400 shadow-[0_0_24px_rgba(56,189,248,0.95),inset_0_0_12px_rgba(56,189,248,0.5)] flex flex-col items-center justify-center p-1 backdrop-blur-md">
                <div className="flex items-center gap-1 mb-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
                  <div className="w-6 h-1 rounded bg-cyan-400 shadow-[0_0_6px_#38bdf8]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
                </div>
                <div className="flex items-center gap-1 text-[8px] font-mono font-black text-cyan-200 tracking-wider">
                  <Shield size={10} className="text-cyan-300" />
                  <span>BLOCKED</span>
                </div>
              </div>
              <div className="absolute -inset-2 rounded-xl border border-cyan-400/60 border-dashed animate-pulse pointer-events-none" />
            </div>
            <span className="text-[7px] font-mono font-black text-cyan-300 bg-black/95 px-1.5 py-0.5 rounded border border-cyan-500/50 mt-1 whitespace-nowrap shadow-md">
              WALL FORCEFIELD ACTIVE
            </span>
          </div>
        ))}

        {/* ========================================================================= */}
        {/* SPAWN POINT: DATA PORT 1 (TOP LEFT) */}
        {/* ========================================================================= */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-25"
          style={{ left: `${TOP_BRANCH_PATH[0].x}%`, top: `${TOP_BRANCH_PATH[0].y}%` }}
        >
          <span className="text-[8px] font-mono font-black uppercase text-yellow-400 tracking-wider mb-1">
            DATA PORT 1
          </span>
          <div className="relative w-12 h-12 rounded-2xl bg-[#1c1602] border-2 border-yellow-400 shadow-[0_0_22px_rgba(250,204,21,0.55)] flex items-center justify-center">
            <Radio size={20} className="text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="absolute -inset-1 rounded-2xl border border-yellow-400/40 border-dashed animate-pulse pointer-events-none" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SPAWN POINT: DATA PORT 2 (BOTTOM RIGHT) */}
        {/* ========================================================================= */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-25"
          style={{ left: `${BOTTOM_BRANCH_PATH[0].x}%`, top: `${BOTTOM_BRANCH_PATH[0].y}%` }}
        >
          <span className="text-[8px] font-mono font-black uppercase text-yellow-400 tracking-wider mb-1">
            DATA PORT 2
          </span>
          <div className="relative w-12 h-12 rounded-2xl bg-[#1c1602] border-2 border-yellow-400 shadow-[0_0_22px_rgba(250,204,21,0.55)] flex items-center justify-center">
            <Radio size={20} className="text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="absolute -inset-1 rounded-2xl border border-yellow-400/40 border-dashed animate-pulse pointer-events-none" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SCANNER NODE TRAP (DEPLOYED VIA throw new SecurityBreachException) */}
        {/* ========================================================================= */}
        {validation.hasThrowTrap && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-15 flex flex-col items-center pointer-events-none"
            style={{ left: '50%', top: '34%' }}
          >
            <div className="w-8 h-8 rounded-xl bg-red-950/80 border-2 border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.6)] flex items-center justify-center animate-pulse">
              <Zap size={14} className="text-red-400" />
            </div>
            <span className="text-[7px] font-mono font-black uppercase text-red-400 bg-black/85 px-1 py-0.5 rounded border border-red-500/40 mt-0.5">
              TRAP ACTIVE
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* GOAL: MAIN SERVER CORE IN THE MIDDLE WITH GREEN BUBBLE AURA (50%, 50%) */}
        {/* ========================================================================= */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-15"
          style={{ left: '50%', top: '50%' }}
        >
          {/* GREEN BUBBLE AURA */}
          <div className="relative flex items-center justify-center">
            {/* Outer Pulsating Emerald Bubble Shield */}
            <div
              className={`absolute rounded-full transition-all duration-500 pointer-events-none ${validation.hasFinally
                ? 'w-44 h-44 border-2 border-emerald-400/80 bg-emerald-500/15 shadow-[0_0_45px_rgba(16,185,129,0.5),inset_0_0_25px_rgba(16,185,129,0.3)] animate-pulse'
                : 'w-36 h-36 border border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                }`}
            />

            {/* Inner Rotating Orbital Dashed Ring */}
            <div
              className={`absolute rounded-full border border-dashed pointer-events-none ${validation.hasFinally
                ? 'w-32 h-32 border-emerald-300/50 animate-spin'
                : 'w-28 h-28 border-emerald-500/20'
                }`}
              style={{ animationDuration: '14s' }}
            />

            {/* Shield Ping Pulse when Finally is active */}
            {validation.hasFinally && (
              <div className="absolute w-24 h-24 rounded-full bg-emerald-400/15 animate-ping pointer-events-none" />
            )}

            {/* Green Breaking Pulse when Shield Absorbs a Breached Block */}
            {shieldPulse && (
              <div className="absolute w-44 h-44 rounded-full border-4 border-emerald-400/90 bg-emerald-500/25 animate-ping pointer-events-none shadow-[0_0_35px_#10b981] z-30" />
            )}

            {/* Visible Core Integrity & Finally Receiver Status HUD */}
            <div className="absolute -top-14 w-28 flex flex-col gap-0.5 items-center bg-black/90 px-2 py-1 rounded-lg border border-white/15 shadow-xl backdrop-blur-sm z-20">
              <div className="flex items-center justify-between w-full text-[9px] font-mono font-black">
                <span className="flex items-center gap-1 text-red-400">
                  <Heart size={10} className="fill-red-500 stroke-red-500" /> Core:
                </span>
                <span className={coreHp > 1 ? 'text-emerald-400' : 'text-red-400'}>
                  {coreHp}/3
                </span>
              </div>
              {/* 3 Segmented Integrity Pips */}
              <div className="grid grid-cols-3 gap-1 w-full h-1.5 mt-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs transition-all duration-300 ${i < coreHp
                      ? coreHp > 1
                        ? 'bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.9)]'
                        : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.9)]'
                      : 'bg-gray-800'
                      }`}
                  />
                ))}
              </div>
              <div className="mt-0.5 text-[7px] font-mono font-bold tracking-tight">
                {validation.hasFinally ? (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <Shield size={8} /> OPEN
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-0.5">
                    <ShieldAlert size={8} /> LOCKED
                  </span>
                )}
              </div>
            </div>

            {/* Central Server Core Hardware Unit */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shadow-2xl relative z-10 ${coreHp > 0
                ? 'bg-emerald-950/95 border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.6)]'
                : 'bg-red-950/95 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.8)] animate-bounce'
                }`}
            >
              <Server size={26} className={coreHp > 0 ? 'text-emerald-300' : 'text-red-400'} />

              {/* Core Breach Explosion Burst when Damaged */}
              {coreExplosion && (
                <div className="absolute inset-0 -m-8 pointer-events-none flex items-center justify-center animate-in zoom-in-50 duration-200 z-30">
                  <div className="w-28 h-28 rounded-full border-2 border-red-500 bg-red-600/30 animate-ping shadow-[0_0_40px_#ef4444]" />
                  <div className="absolute w-16 h-16 rounded-full bg-orange-500/50 blur-xs animate-pulse" />
                  <span className="absolute -top-7 text-[8px] font-mono font-black text-red-300 bg-black/95 px-2 py-0.5 rounded border border-red-500 shadow-xl whitespace-nowrap">
                    CORE BREACH // -1 INTEGRITY
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4 TURRET NODES: THE WALL, THE BOMBER, & THE GUN TURRET (Grid[0..3]) */}
        {/* ========================================================================= */}
        {mountedTurrets.map(({ node, turret, assignedAction, isCorrect }, idx) => {
          const durability = nodeDurability[node.nodeId] ?? 100;
          const isDestroyed = false;
          const isInteracting = activeProjectiles.some(p => Math.hypot(p.fromX - node.x, p.fromY - node.y) < 1);

          const isWall = assignedAction === 'QUARANTINE';
          const isBomber = assignedAction === 'OVERLOAD';
          const isGunTurret = assignedAction === 'RECALIBRATE';
          const isClamp = assignedAction === 'CLAMP';
          const isFilter = assignedAction === 'FILTER';
          const hasAssigned = assignedAction !== null;

          return (
            <div
              key={`preset-defense-node-${node.nodeId}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center transition-all duration-300 ${isInteracting ? 'scale-110' : 'hover:scale-105'
                }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {/* Range Radar Indicator Ring on Active Interception */}
              {isInteracting && !isDestroyed && (
                <div className="absolute w-24 h-24 rounded-full border border-dashed border-[#ff912d]/60 bg-[#ff912d]/5 animate-ping pointer-events-none" />
              )}

              {/* STATE 1: DESTROYED / WALL-BREAK / BREACH SIMULATION */}
              {/* ============================================================= */}
              {isDestroyed && (
                <div className="relative flex flex-col items-center">
                  {/* Expanding Breach Shockwave Aura */}
                  <div className="absolute -inset-4 bg-red-600/30 blur-md rounded-full animate-ping pointer-events-none" />
                  <div className="absolute -inset-2 bg-orange-600/25 blur-xs rounded-full animate-pulse pointer-events-none" />

                  {/* DESTROYED WALL BARRICADE (SHATTERED STEEL & CONCRETE SLABS) */}
                  {(isWall || (!hasAssigned && node.correctCounter === 'QUARANTINE')) && (
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <div className="absolute inset-1 rounded-xl bg-red-950/80 border-2 border-red-500 shadow-[0_0_22px_rgba(239,68,68,0.7)]" />
                      {/* Left Wall Chunk: Shattered & Tilted Outward */}
                      <div className="absolute w-6 h-5 rounded-xs bg-[#7c2d12] border border-red-400 shadow-xl -translate-x-3.5 -rotate-28 flex items-center justify-around px-0.5">
                        <div className="w-1 h-3 bg-neutral-900 rounded-xs" />
                        <div className="w-1 h-3 bg-neutral-900 rounded-xs" />
                      </div>
                      {/* Right Wall Chunk: Shattered & Tilted Outward */}
                      <div className="absolute w-6 h-5 rounded-xs bg-[#7c2d12] border border-red-400 shadow-xl translate-x-3.5 rotate-32 flex items-center justify-around px-0.5">
                        <div className="w-1 h-3 bg-neutral-900 rounded-xs" />
                        <div className="w-1 h-3 bg-neutral-900 rounded-xs" />
                      </div>
                      {/* Severed Hydraulic Piston Arm Snapped in Half with Electrical Arcs */}
                      <div className="absolute w-2 h-2 rounded-full bg-amber-300 animate-ping shadow-[0_0_12px_#fbbf24]" />
                      <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-200 animate-ping delay-150 shadow-[0_0_8px_#38bdf8]" />
                      {/* Black Smoke Plume */}
                      <div className="absolute -top-2 w-7 h-7 rounded-full bg-slate-900/85 blur-xs animate-pulse" />
                    </div>
                  )}

                  {/* DESTROYED BOMBER (SCORCHED ARTILLERY CRATER & DETONATED POD) */}
                  {isBomber && (
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <div className="absolute inset-1 rounded-full bg-neutral-950 border-2 border-red-600 shadow-[0_0_22px_rgba(239,68,68,0.75)]" />
                      {/* Blown-off Severed Cannon Barrel */}
                      <div className="absolute w-3 h-5 rounded-t-md bg-neutral-900 border border-red-500 rotate-60 translate-x-3 translate-y-1 shadow-lg" />
                      {/* Fire Embers & Smoke */}
                      <div className="w-4 h-4 rounded-full bg-red-700/60 blur-xs animate-pulse" />
                      <div className="absolute w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                      <div className="absolute -top-2 w-7 h-7 rounded-full bg-slate-900/85 blur-xs animate-pulse" />
                    </div>
                  )}

                  {/* DESTROYED GUN TURRET (SEVERED DUAL BARRELS & CRACKED MANTLET) */}
                  {isGunTurret && (
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <div className="absolute inset-1 rounded-full bg-neutral-950 border-2 border-red-600 shadow-[0_0_22px_rgba(239,68,68,0.75)]" />
                      {/* Bent and Snapped Dual Autocannon Barrels */}
                      <div className="absolute -top-2 -left-1 w-1.5 h-4 bg-slate-600 -rotate-45 rounded-xs" />
                      <div className="absolute -top-1 right-0 w-1.5 h-3 bg-slate-600 rotate-60 rounded-xs" />
                      {/* Damaged Optical Sensor Sparks */}
                      <div className="w-5 h-5 rounded-lg bg-neutral-900 border border-red-500 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      </div>
                      <div className="absolute -top-2 w-7 h-7 rounded-full bg-slate-900/85 blur-xs animate-pulse" />
                    </div>
                  )}

                  {/* DESTROYED BUFFER CLAMP (TWISTED PINCERS & SEVERED STASIS CORE) */}
                  {isClamp && (
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <div className="absolute inset-1 rounded-xl bg-cyan-950/80 border-2 border-red-500 shadow-[0_0_22px_rgba(239,68,68,0.75)]" />
                      <div className="absolute w-2.5 h-4 rounded-l-md bg-neutral-900 border border-cyan-400 rotate-30 -translate-x-3 shadow-md" />
                      <div className="absolute w-2.5 h-4 rounded-r-md bg-neutral-900 border border-cyan-400 -rotate-45 translate-x-3 shadow-md" />
                      <div className="w-3 h-3 rounded-full bg-cyan-400/40 animate-ping" />
                      <div className="absolute -top-2 w-7 h-7 rounded-full bg-slate-900/85 blur-xs animate-pulse" />
                    </div>
                  )}

                  {/* DESTROYED TYPE FILTER (SHATTERED PRISM & SMOKING SENSOR DISH) */}
                  {isFilter && (
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <div className="absolute inset-1 rounded-xl bg-purple-950/80 border-2 border-red-500 shadow-[0_0_22px_rgba(239,68,68,0.75)]" />
                      <div className="w-4 h-4 rotate-45 bg-purple-900/90 border border-purple-400/70 shadow-md animate-pulse" />
                      <div className="absolute w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping" />
                      <div className="absolute -top-2 w-7 h-7 rounded-full bg-slate-900/85 blur-xs animate-pulse" />
                    </div>
                  )}

                  {/* FALLBACK FOR UNASSIGNED CRASHED SOCKET */}
                  {!isWall && !isBomber && !isGunTurret && !isClamp && !isFilter && node.correctCounter !== 'QUARANTINE' && (
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-red-500/80 bg-red-950/40 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                        <AlertTriangle size={16} className="text-red-400 animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================= */}
              {/* STATE 2: ACTIVE OPERATIONAL TURRET ARCHETYPES */}
              {/* ============================================================= */}
              {!isDestroyed && hasAssigned && (
                <>
                  {/* ARCHETYPE 1: THE WALL (Action: Quarantine) */}
                  {isWall && (
                    <div
                      className={`relative w-12 h-12 rounded-xl p-1 flex flex-col items-center justify-center border-2 transition-all duration-300 shadow-xl bg-[#1c0f06] ${isInteracting
                        ? 'border-[#ff912d] shadow-[0_0_25px_rgba(255,145,45,0.85)] scale-105'
                        : 'border-[#ff912d]/70 shadow-[0_0_14px_rgba(255,145,45,0.3)]'
                        }`}
                    >
                      {/* Heavy Barricade Gate with Hydraulic Pusher Claw */}
                      <div className="w-8 h-4 rounded-sm bg-[#ff912d] border border-amber-200 flex items-center justify-between px-1 shadow-md">
                        <div className="w-1.5 h-3 bg-[#7c2d12] rounded-xs" />
                        <div className="w-1.5 h-3 bg-[#7c2d12] rounded-xs" />
                        <div className="w-1.5 h-3 bg-[#7c2d12] rounded-xs" />
                      </div>
                      {/* Mechanical Pusher Arm */}
                      <div
                        className={`mt-1 h-1.5 bg-amber-300 rounded-full transition-all duration-200 shadow-sm ${isInteracting ? 'w-9 bg-amber-200' : 'w-6'
                          }`}
                      />
                    </div>
                  )}

                  {/* ARCHETYPE 2: THE BOMBER (Action: Overload - Heavy Artillery Mortar Turret) */}
                  {isBomber && (() => {
                    const aimingAngle = turretAngles[node.nodeId] ?? defaultAimAngles[node.nodeId] ?? 180;

                    return (
                      <div
                        className={`relative w-15 h-15 flex items-center justify-center transition-all duration-300 ${
                          isInteracting ? 'scale-105' : ''
                        }`}
                      >
                        {/* 2. Rotating Heavy Artillery Turret Housing & Cannon */}
                        <div
                          className="relative w-12 h-12 flex items-center justify-center transition-transform duration-150 ease-out z-10"
                          style={{ transform: `rotate(${aimingAngle}deg)` }}
                        >
                          {/* Extended Heavy-Bore Artillery Cannon Barrel */}
                          <div
                            className={`absolute -top-4 flex flex-col items-center pointer-events-none transition-transform duration-100 ${
                              isInteracting ? 'translate-y-1' : ''
                            }`}
                          >
                            {/* Muzzle Flash on Firing */}
                            {isInteracting && (
                              <div className="w-4 h-4 -mb-2 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 shadow-[0_0_16px_#f97316] animate-ping z-30" />
                            )}

                            {/* Heavy Muzzle Brake with Blast Vents */}
                            <div className="w-4 h-2.5 rounded-t-xs bg-gradient-to-b from-stone-400 via-stone-600 to-stone-800 border-x border-t border-stone-900 shadow-md flex items-center justify-between px-0.5">
                              <div className="w-0.5 h-1.5 bg-black rounded-xs" />
                              <div className="w-1.5 h-1.5 rounded-xs bg-[#450a0a] border border-red-500/60" />
                              <div className="w-0.5 h-1.5 bg-black rounded-xs" />
                            </div>

                            {/* Main Cannon Barrel Tube */}
                            <div className="w-2.5 h-5 bg-gradient-to-b from-stone-500 via-stone-700 to-stone-900 border-x border-stone-950 shadow-inner flex flex-col items-center justify-around py-0.5">
                              <div className="w-full h-0.5 bg-stone-900/70" />
                              <div className="w-full h-0.5 bg-stone-900/70" />
                            </div>

                            {/* Reinforced Barrel Mantlet Collar */}
                            <div className="w-4 h-2 rounded-sm bg-gradient-to-b from-stone-700 to-stone-900 border border-stone-600 shadow-sm" />
                          </div>

                          {/* Armored Artillery Carriage & Turret Hull */}
                          <div className="relative w-8.5 h-8.5 rounded-xl bg-gradient-to-b from-[#3b0f0b] via-[#240806] to-[#120302] border-2 border-red-500 shadow-lg flex items-center justify-center z-20">
                            {/* Left Hydraulic Elevation Strut */}
                            <div className="absolute -left-2 top-1.5 w-1.5 h-5 rounded-xs bg-stone-800 border border-stone-600 flex flex-col justify-between py-0.5 shadow-md">
                              <div className="w-full h-0.5 bg-red-500/60" />
                              <div className="w-full h-0.5 bg-red-500/60" />
                            </div>

                            {/* Right Heavy Ammo Loading Drum */}
                            <div className="absolute -right-2 top-1.5 w-2 h-5 rounded-sm bg-gradient-to-b from-stone-700 via-stone-800 to-stone-950 border border-amber-600/70 flex flex-col items-center justify-center shadow-md">
                              <div className="w-1 h-3 rounded-xs bg-amber-500/80 shadow-[0_0_4px_#f59e0b]" />
                            </div>

                            {/* Turret Top Armor Plate with Targeting Visor */}
                            <div className="w-5 h-5 rounded-lg bg-stone-900 border border-red-400/80 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                              {/* Optical Targeting Rangefinder Lens */}
                              <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-300 shadow-[0_0_8px_#ef4444] animate-pulse flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-white" />
                              </div>
                              {/* Ventilation Slits */}
                              <div className="mt-0.5 w-3 h-0.5 bg-neutral-950 rounded-xs" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ARCHETYPE 3: THE GUN TURRET (Action: Recalibrate - Twin Kinetic Autocannon Sentry) */}
                  {isGunTurret && (() => {
                    const aimingAngle = turretAngles[node.nodeId] ?? defaultAimAngles[node.nodeId] ?? 180;

                    return (
                      <div
                        className={`relative w-15 h-15 flex items-center justify-center transition-all duration-300 ${
                          isInteracting ? 'scale-105' : ''
                        }`}
                      >
                        {/* 2. Rotating Sentry Turret Pod with Twin Autocannons */}
                        <div
                          className="relative w-12 h-12 flex items-center justify-center transition-transform duration-100 ease-out z-10"
                          style={{ transform: `rotate(${aimingAngle}deg)` }}
                        >
                          {/* Twin Kinetic Autocannon Barrels */}
                          <div
                            className={`absolute -top-4 flex items-center justify-center gap-1.5 pointer-events-none transition-transform duration-75 ${
                              isInteracting ? 'translate-y-0.5' : ''
                            }`}
                          >
                            {/* Left Autocannon Barrel */}
                            <div className="flex flex-col items-center">
                              {isInteracting && (
                                <div className="w-3 h-3 -mb-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_#38bdf8] animate-ping z-30" />
                              )}
                              {/* Flash Suppressor Tip */}
                              <div className={`w-1.5 h-1.5 rounded-t-xs ${isInteracting ? 'bg-cyan-200 shadow-[0_0_6px_#38bdf8]' : 'bg-slate-300'}`} />
                              {/* Ribbed Barrel Sleeve */}
                              <div className="w-1 h-5 bg-gradient-to-b from-slate-300 via-slate-500 to-slate-800 border-x border-slate-950 flex flex-col justify-between py-0.5 shadow-sm">
                                <div className="w-full h-0.5 bg-slate-900" />
                                <div className="w-full h-0.5 bg-slate-900" />
                              </div>
                              {/* Barrel Mantlet Mount */}
                              <div className="w-2 h-1 bg-slate-700 rounded-xs border border-slate-900" />
                            </div>

                            {/* Right Autocannon Barrel */}
                            <div className="flex flex-col items-center">
                              {isInteracting && (
                                <div className="w-3 h-3 -mb-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_#38bdf8] animate-ping delay-75 z-30" />
                              )}
                              {/* Flash Suppressor Tip */}
                              <div className={`w-1.5 h-1.5 rounded-t-xs ${isInteracting ? 'bg-cyan-200 shadow-[0_0_6px_#38bdf8]' : 'bg-slate-300'}`} />
                              {/* Ribbed Barrel Sleeve */}
                              <div className="w-1 h-5 bg-gradient-to-b from-slate-300 via-slate-500 to-slate-800 border-x border-slate-950 flex flex-col justify-between py-0.5 shadow-sm">
                                <div className="w-full h-0.5 bg-slate-900" />
                                <div className="w-full h-0.5 bg-slate-900" />
                              </div>
                              {/* Barrel Mantlet Mount */}
                              <div className="w-2 h-1 bg-slate-700 rounded-xs border border-slate-900" />
                            </div>
                          </div>

                          {/* Armored Turret Body with Dual Side Ammo Pods */}
                          <div className="relative w-8.5 h-8.5 rounded-xl bg-gradient-to-b from-[#132d47] via-[#0b1c2e] to-[#040c17] border-2 border-cyan-400 shadow-lg flex items-center justify-center z-20">
                            {/* Left Magazine Drum */}
                            <div className="absolute -left-2 top-1.5 w-1.5 h-5 rounded-xs bg-slate-800 border border-cyan-500/70 shadow-md flex items-center justify-center">
                              <div className="w-0.5 h-3 bg-cyan-400/80 rounded-full" />
                            </div>

                            {/* Right Magazine Drum */}
                            <div className="absolute -right-2 top-1.5 w-1.5 h-5 rounded-xs bg-slate-800 border border-cyan-500/70 shadow-md flex items-center justify-center">
                              <div className="w-0.5 h-3 bg-cyan-400/80 rounded-full" />
                            </div>

                            {/* Center Targeting Visor Array */}
                            <div className="w-5 h-5 rounded-lg bg-slate-950 border border-cyan-400/90 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                              {/* Optical Visor Bar */}
                              <div className="w-3.5 h-1.5 rounded-xs bg-cyan-950 border border-cyan-400 flex items-center justify-around px-0.5">
                                <div
                                  className={`w-1 h-1 rounded-full ${
                                    isInteracting ? 'bg-cyan-200 shadow-[0_0_6px_#38bdf8] animate-ping' : 'bg-emerald-400 shadow-[0_0_4px_#34d399]'
                                  }`}
                                />
                                <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_3px_#38bdf8]" />
                              </div>
                              {/* Heat Vents */}
                              <div className="mt-0.5 w-3 h-0.5 bg-neutral-900 rounded-xs" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ARCHETYPE 4: THE BUFFER CLAMP (Action: Clamp - Melee Scissor Shear Turret) */}
                  {isClamp && (() => {
                    const aimingAngle = turretAngles[node.nodeId] ?? defaultAimAngles[node.nodeId] ?? 180;

                    return (
                      <div
                        className={`relative w-15 h-15 flex items-center justify-center transition-all duration-300 ${
                          isInteracting ? 'scale-105' : ''
                        }`}
                      >
                        <div
                          className="relative w-12 h-12 flex items-center justify-center transition-transform duration-100 ease-out z-10"
                          style={{ transform: `rotate(${aimingAngle}deg)` }}
                        >
                          {/* Dual High-Frequency Scissor Blades */}
                          <div
                            className={`absolute -top-5 flex items-center justify-center pointer-events-none transition-transform duration-100 ${
                              isInteracting ? 'translate-y-1' : ''
                            }`}
                          >
                            {/* Left Scissor Blade (Beveled Cutting Edge) */}
                            <div
                              className={`w-2.5 h-6.5 rounded-tr-md rounded-bl-xs bg-gradient-to-b from-cyan-100 via-cyan-400 to-slate-900 border border-cyan-200 shadow-md origin-bottom-right transition-transform duration-100 ${
                                isInteracting ? 'rotate-16 translate-x-1.5 shadow-[0_0_12px_#22d3ee]' : '-rotate-24 -translate-x-1'
                              }`}
                            />

                            {/* Scissor Pivot Rivet & Energy Core */}
                            <div className="relative z-30 w-3.5 h-3.5 -mx-1.5 -mb-2 rounded-full bg-slate-900 border-2 border-cyan-300 flex items-center justify-center shadow-md">
                              <div
                                className={`w-1.5 h-1.5 rounded-full bg-cyan-300 ${
                                  isInteracting ? 'animate-ping shadow-[0_0_10px_#22d3ee]' : ''
                                }`}
                              />
                            </div>

                            {/* Right Scissor Blade (Crossing Shear Edge) */}
                            <div
                              className={`w-2.5 h-6.5 rounded-tl-md rounded-br-xs bg-gradient-to-b from-cyan-100 via-cyan-400 to-slate-900 border border-cyan-200 shadow-md origin-bottom-left transition-transform duration-100 ${
                                isInteracting ? '-rotate-16 -translate-x-1.5 shadow-[0_0_12px_#22d3ee]' : 'rotate-24 translate-x-1'
                              }`}
                            />
                          </div>

                          {/* Armored Scissor Mount & Hydraulic Base Pylon Body */}
                          <div className="relative w-8.5 h-8.5 rounded-xl bg-gradient-to-b from-[#0e2a3b] via-[#061824] to-[#020b12] border-2 border-cyan-400 shadow-lg flex items-center justify-center z-20">
                            {/* Hydraulic Servo Piston Housings on flanks */}
                            <div className="absolute -left-1 w-1.5 h-4 rounded-xs bg-cyan-700/80 border border-cyan-400" />
                            <div className="absolute -right-1 w-1.5 h-4 rounded-xs bg-cyan-700/80 border border-cyan-400" />
                            {/* Center Energy Well */}
                            <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-300 flex items-center justify-center shadow-inner">
                              <div className={`w-2.5 h-2.5 rounded-full bg-cyan-400 ${isInteracting ? 'animate-ping shadow-[0_0_10px_#22d3ee]' : 'shadow-[0_0_6px_#06b6d4]'}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ARCHETYPE 5: THE TYPE FILTER (Action: Filter - Holographic Prism Scanner Turret) */}
                  {isFilter && (() => {
                    const aimingAngle = turretAngles[node.nodeId] ?? defaultAimAngles[node.nodeId] ?? 180;

                    return (
                      <div
                        className={`relative w-15 h-15 flex items-center justify-center transition-all duration-300 ${
                          isInteracting ? 'scale-105' : ''
                        }`}
                      >
                        <div
                          className="relative w-12 h-12 flex items-center justify-center transition-transform duration-100 ease-out z-10"
                          style={{ transform: `rotate(${aimingAngle}deg)` }}
                        >
                          {/* Faceted Prism Lens / Scanner Ring */}
                          <div
                            className={`absolute -top-3.5 flex flex-col items-center pointer-events-none transition-transform duration-100 ${
                              isInteracting ? 'translate-y-0.5' : ''
                            }`}
                          >
                            {isInteracting && (
                              <div className="w-4 h-4 -mb-2 rounded-full bg-fuchsia-300 shadow-[0_0_16px_#c084fc] animate-ping z-30" />
                            )}
                            {/* Hexagonal Prism Lens Array */}
                            <div className="w-5 h-3 rounded-t-lg bg-gradient-to-b from-purple-300 via-purple-600 to-indigo-900 border border-purple-200 shadow-md flex items-center justify-around px-0.5">
                              <div className="w-1 h-1.5 bg-fuchsia-300 rounded-full animate-pulse" />
                              <div className="w-1 h-1.5 bg-cyan-300 rounded-full animate-ping" />
                              <div className="w-1 h-1.5 bg-fuchsia-300 rounded-full animate-pulse" />
                            </div>
                          </div>

                          {/* Armored Prismatic Tower Body */}
                          <div className="relative w-8.5 h-8.5 rounded-xl bg-gradient-to-b from-[#2b0b3b] via-[#1b0526] to-[#0c0212] border-2 border-purple-400 shadow-lg flex items-center justify-center z-20">
                            {/* Center Optical Filter Prism */}
                            <div className="w-5 h-5 rounded-lg bg-purple-950 border border-purple-300/80 rotate-45 flex items-center justify-center shadow-inner overflow-hidden">
                              <div className={`w-2.5 h-2.5 bg-gradient-to-tr from-fuchsia-400 to-cyan-300 ${isInteracting ? 'animate-spin shadow-[0_0_10px_#e879f9]' : 'shadow-[0_0_6px_#c084fc]'}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {/* ============================================================= */}
              {/* STATE 3: PRE-SET CYBER DEFENSE SOCKET (Awaiting User Rule) */}
              {/* ============================================================= */}
              {!isDestroyed && !hasAssigned && (
                <div className="relative w-11 h-11 rounded-full border-2 border-dashed border-cyan-400/70 bg-[#09182a]/80 flex items-center justify-center shadow-[0_0_16px_rgba(6,182,212,0.35)]">
                  <div className="w-3.5 h-3.5 rounded-full bg-cyan-400/30 animate-ping" />
                  <div className="absolute w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
                  {/* Crosshair reticle accents */}
                  <div className="absolute -top-1 w-1 h-2 bg-cyan-400/60" />
                  <div className="absolute -bottom-1 w-1 h-2 bg-cyan-400/60" />
                  <div className="absolute -left-1 w-2 h-1 bg-cyan-400/60" />
                  <div className="absolute -right-1 w-2 h-1 bg-cyan-400/60" />
                </div>
              )}

              {/* ============================================================= */}
              {/* BOTTOM: LAYOUT INFO LABELS (NO SPOILER HINTS) */}
              {/* ============================================================= */}
              <div className="mt-1 flex flex-col items-center gap-0.5 pointer-events-none">
                {/* Destroyed Alert Badge OR Operational Action Badge */}
                {isDestroyed ? (
                  <span className="text-[7.5px] font-mono font-black uppercase text-red-100 bg-red-900/95 px-2 py-0.5 rounded-full border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] animate-pulse flex items-center gap-1 whitespace-nowrap">
                    <AlertTriangle size={9} className="text-red-300" />
                    {isWall ? 'WALL BREACHED' : 'TURRET DESTROYED'}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}

        {/* ========================================================================= */}
        {/* MARCHING ENEMY DATA BLOCKS (CLEAN & CORRUPTED QUEUE) */}
        {/* ========================================================================= */}
        {entities.map(entity => {
          if (!isRunning || entity.progress <= 0 || entity.status === 'quarantined' || entity.status === 'scored' || entity.status === 'crashed') return null;

          const isClean = entity.type === 'clean';
          const isRecalibrated = entity.status === 'recalibrated';

          return (
            <div
              key={entity.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-transform duration-100 ${entity.hitFlash ? 'brightness-150 scale-105' : ''
                }`}
              style={{ left: `${entity.x}%`, top: `${entity.y}%` }}
            >
              {/* Explosion Detonation Burst Visual on Impact (e.g. Void hit by Bomber or Data hit by Wall) */}
              {entity.status === 'exploding' ? (
                <div className="relative flex items-center justify-center pointer-events-none z-50">
                  <img
                    src="/assets/planets/00_moon/environment/Explosion.svg"
                    alt="Explosion"
                    className="w-36 h-36 object-contain animate-single-explosion drop-shadow-[0_0_35px_rgba(255,100,20,1)] pointer-events-none select-none"
                  />
                </div>
              ) : (
                <>
                  {/* CLEAN / RECALIBRATED DATA BLOCK */}
                  {(isClean || isRecalibrated) && (
                    <div className="relative group">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 border-2 border-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.7)] flex items-center justify-center backdrop-blur-sm">
                        <Shield size={18} className="text-emerald-300 animate-pulse" />
                      </div>
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono font-black text-emerald-300 bg-black/90 px-1.5 py-0.5 rounded whitespace-nowrap border border-emerald-500/40 tracking-wider">
                        {isRecalibrated ? 'RESCUED' : 'CLEAN'}
                      </span>
                    </div>
                  )}

                  {/* CORRUPTED 1: HOLOGRAPHIC PHANTOM VOID (NullPointerException) - STRIKING GLOWING RED PALETTE */}
                  {!isClean && !isRecalibrated && entity.type === 'null_pointer' && (
                    <div className="relative group">
                      {/* Striking Glowing Red Aura */}
                      <div className="absolute -inset-2 rounded-2xl bg-red-600/50 blur-md animate-pulse pointer-events-none" />
                      <div className="absolute -inset-1 rounded-xl border border-red-500/60 animate-ping opacity-75 pointer-events-none" />
                      <div className="w-11 h-11 rounded-xl border-2 border-dashed border-red-500 bg-gradient-to-b from-[#350408] via-[#100003] to-black shadow-[0_0_32px_rgba(239,68,68,1),0_0_14px_rgba(255,0,0,0.8),inset_0_0_12px_rgba(239,68,68,0.7)] flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-[2.5px] bg-red-400 shadow-[0_0_10px_#ff0033] animate-pulse" />
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ff0033] animate-ping mb-0.5" />
                        <span className="font-mono text-[10px] font-black text-red-100 drop-shadow-[0_0_8px_rgba(239,68,68,1)] tracking-wider leading-none">NULL</span>
                        <span className="text-[7px] font-mono font-black text-red-400 drop-shadow-[0_0_5px_#ff0033] tracking-tighter leading-none mt-0.5">[0x00]</span>
                      </div>
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-mono font-black text-red-200 bg-black/95 px-1.5 py-0.5 rounded whitespace-nowrap border border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.9)]">
                        NULL_VOID
                      </span>
                    </div>
                  )}

                  {/* CORRUPTED 2: RADIOACTIVE HAZARD CORRUPTION (NumberFormatException) - CORRUPTED 7-SEGMENT LED DIGIT */}
                  {!isClean && !isRecalibrated && entity.type === 'number_format' && (
                    <div className="relative group flex items-center justify-center">
                      <div className="absolute -inset-3 bg-amber-500/40 blur-lg animate-pulse pointer-events-none" />
                      <div className="relative w-12 h-12 flex items-center justify-center animate-pulse">
                        <svg className="w-12 h-12 drop-shadow-[0_0_16px_rgba(245,158,11,1)]" viewBox="0 0 36 36" fill="none">
                          <path
                            d="M11 2 L25 2 L33 10 L33 26 L25 34 L11 34 L3 26 L3 10 Z"
                            fill="#100500"
                            stroke="#f59e0b"
                            strokeWidth="1.3"
                          />
                          <polygon points="12,5 24,5 22,7.5 14,7.5" fill="#f59e0b" opacity="0.9" />
                          <polygon points="6,11 8.5,13 8.5,17 6,18" fill="#f59e0b" opacity="0.85" />
                          <polygon points="30,11 30,18 27.5,17 27.5,13" fill="#ef4444" opacity="0.95" />
                          <polygon points="9,18 13,16.5 23,16.5 27,18 22,19.5 14,19.5" fill="#ef4444" />
                          <polygon points="6,19 8.5,20 8.5,24 6,26" fill="#f59e0b" opacity="0.85" />
                          <polygon points="30,19 30,26 27.5,24 27.5,20" fill="#f59e0b" opacity="0.9" />
                          <polygon points="12,31 14,28.5 22,28.5 24,31" fill="#f59e0b" opacity="0.9" />
                          <text x="18" y="15" textAnchor="middle" fill="#fef08a" fontSize="6.5" fontFamily="monospace" fontWeight="900">#N</text>
                          <text x="18" y="27" textAnchor="middle" fill="#f87171" fontSize="6" fontFamily="monospace" fontWeight="900">!a</text>
                          <circle cx="28.5" cy="29.5" r="1.5" fill="#ef4444" />
                          <circle cx="7.5" cy="7.5" r="1.2" fill="#ef4444" />
                        </svg>
                      </div>
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-mono font-black text-amber-200 bg-black/95 px-1.5 py-0.5 rounded whitespace-nowrap border border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                        CORRUPT_NAN
                      </span>
                    </div>
                  )}

                  {/* CORRUPTED 3: ARRAY INDEX OUT OF BOUNDS (ArrayIndexOutOfBoundsException) - ARRAY BRACKET BREACH */}
                  {!isClean && !isRecalibrated && entity.type === 'out_of_bounds' && (
                    <div className="relative group flex items-center justify-center">
                      <div className="absolute -inset-3 bg-cyan-500/40 blur-lg animate-pulse pointer-events-none" />
                      <div className="relative w-13 h-13 flex items-center justify-center">
                        <svg className="w-13 h-13 drop-shadow-[0_0_18px_rgba(6,182,212,1)]" viewBox="0 0 36 36" fill="none">
                          <path
                            d="M10 6 L4 6 L4 30 L10 30"
                            stroke="#22d3ee"
                            strokeWidth="2.2"
                            strokeLinecap="square"
                          />
                          <line x1="10" y1="12" x2="10" y2="24" stroke="#0e7490" strokeWidth="1.2" strokeDasharray="2 1" />
                          <line x1="16" y1="12" x2="16" y2="24" stroke="#0e7490" strokeWidth="1.2" strokeDasharray="2 1" />
                          <line x1="22" y1="12" x2="22" y2="24" stroke="#0e7490" strokeWidth="1.2" strokeDasharray="2 1" />
                          <text x="7" y="20" fill="#38bdf8" fontSize="6.5" fontFamily="monospace" fontWeight="bold">0</text>
                          <text x="13" y="20" fill="#38bdf8" fontSize="6.5" fontFamily="monospace" fontWeight="bold">1</text>
                          <text x="19" y="20" fill="#38bdf8" fontSize="6.5" fontFamily="monospace" fontWeight="bold">2</text>
                          <path
                            d="M26 6 L32 6 L31 13"
                            stroke="#ef4444"
                            strokeWidth="2"
                          />
                          <path
                            d="M31 23 L32 30 L26 30"
                            stroke="#ef4444"
                            strokeWidth="2"
                          />
                          <path
                            d="M20 18 L26 14 L35 18 L26 22 Z"
                            fill="#ef4444"
                            stroke="#fca5a5"
                            strokeWidth="1.2"
                          />
                          <line x1="33" y1="13" x2="36" y2="10" stroke="#f87171" strokeWidth="1.4" />
                          <line x1="33" y1="23" x2="36" y2="26" stroke="#f87171" strokeWidth="1.4" />
                          <line x1="22" y1="18" x2="32" y2="18" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-mono font-black text-cyan-200 bg-black/95 px-1.5 py-0.5 rounded whitespace-nowrap border border-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                        BUFFER_BREACH
                      </span>
                    </div>
                  )}

                  {/* CORRUPTED 4: ABYSSAL ZERO-DIVISION SINGULARITY (ArithmeticException) - THE VOID */}
                  {!isClean && !isRecalibrated && entity.type === 'arithmetic' && (
                    <div className="relative group">
                      <div className="absolute -inset-2 rounded-full border border-purple-500/70 shadow-[0_0_30px_rgba(168,85,247,0.95)] animate-spin pointer-events-none" style={{ animationDuration: '3s' }} />
                      <div className="w-12 h-12 rounded-full border-2 border-fuchsia-400 bg-gradient-to-tr from-purple-950 via-black to-fuchsia-950 shadow-[0_0_30px_rgba(192,132,252,1)] flex items-center justify-center animate-spin relative" style={{ animationDuration: '2s' }}>
                        <div className="w-5 h-5 rounded-full bg-black border-2 border-purple-300 shadow-[inset_0_0_10px_#c084fc] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-fuchsia-300 shadow-[0_0_6px_#f5d0fe] animate-ping" />
                        </div>
                      </div>
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-mono font-black text-purple-200 bg-black/95 px-1.5 py-0.5 rounded whitespace-nowrap border border-fuchsia-400/80 shadow-[0_0_10px_rgba(168,85,247,0.7)]">
                        DIV/0 VOID
                      </span>
                    </div>
                  )}

                  {/* CORRUPTED 5: POLYMORPHIC CHAMELEON (ClassCastException) - INCOMPATIBLE TYPE CLASH */}
                  {!isClean && !isRecalibrated && entity.type === 'class_cast' && (
                    <div className="relative group flex items-center justify-center">
                      <div className="absolute -inset-3 bg-purple-600/40 blur-lg animate-pulse pointer-events-none" />
                      <div className="relative w-13 h-13 flex items-center justify-center">
                        <svg className="w-13 h-13 drop-shadow-[0_0_20px_rgba(168,85,247,1)]" viewBox="0 0 36 36" fill="none">
                          <path
                            d="M8 9 L2 18 L8 27"
                            stroke="#c084fc"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M28 9 L34 18 L28 27"
                            stroke="#22d3ee"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <polygon
                            points="18,6 25,18 18,22 11,18"
                            fill="#4c1d95"
                            stroke="#a855f7"
                            strokeWidth="1.4"
                          />
                          <circle
                            cx="18"
                            cy="20"
                            r="7"
                            fill="#083344"
                            stroke="#06b6d4"
                            strokeWidth="1.4"
                            strokeDasharray="3 1.5"
                          />
                          <path
                            d="M15 15 L21 21 M21 15 L15 21"
                            stroke="#f43f5e"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                          />
                          <path
                            d="M13 18 L17 19 L19 17 L23 18"
                            stroke="#ffffff"
                            strokeWidth="1.4"
                          />
                        </svg>
                      </div>
                      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-mono font-black text-fuchsia-200 bg-black/95 px-1.5 py-0.5 rounded whitespace-nowrap border border-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.8)]">
                        POLYMORPH
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* ========================================================================= */}
        {/* KERNEL PANIC FATAL TERMINAL OVERLAY */}
        {/* ========================================================================= */}
        {serverStatus === 'CRASHED' && (
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md z-40 flex items-center justify-center p-6 animate-fadeIn cursor-pointer"
            onClick={() => {
              setServerStatus('ONLINE');
              setCrashReason(null);
            }}
          >
            <div
              className="w-full max-w-md bg-[#0a0505] border-2 border-red-500/80 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.5)] flex flex-col gap-4 text-left cursor-default relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setServerStatus('ONLINE');
                  setCrashReason(null);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 hover:text-white hover:bg-red-900/60 transition-all cursor-pointer"
                title="Dismiss Terminal Overlay"
              >
                <X size={16} />
              </button>

              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-red-500/30 pr-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="font-mono text-xs font-black uppercase tracking-widest text-red-400">
                    KERNEL PANIC // TERMINAL
                  </span>
                </div>
                <Terminal size={16} className="text-red-400" />
              </div>

              {/* Concise Error Log */}
              <div className="bg-black/80 p-3 rounded-xl border border-red-500/30 font-mono text-xs text-red-200 space-y-1.5">
                <div className="text-red-400 font-black tracking-wide">
                  SERVER CRASH // UNCAUGHT EXCEPTION
                </div>
                <div className="text-gray-300 text-sm">
                  Breached By: <span className="text-red-300 font-black">{crashExceptionName || 'Unhandled Error'}</span>
                </div>
                {crashReason && (
                  <div className="text-xs text-red-400/90 font-mono">
                    {crashReason}
                  </div>
                )}
              </div>

              {/* Concise Tip */}
              <div className="p-2.5 bg-red-950/30 rounded-xl border border-red-500/20 text-xs text-gray-300">
                <span className="text-amber-300 font-bold">Tip:</span> Snap a rule for{' '}
                <span className="font-bold text-white">{crashExceptionName || 'this threat'}</span> into the &apos;unless:&apos; slot with the appropriate action.
              </div>

              {/* Button: Retry */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    setServerStatus('ONLINE');
                    setCrashReason(null);
                    setCrashExceptionName('');
                    resetSimulation();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* NARRATIVE VICTORY MODAL: TECHNICIAN IO DIALOGUE (WAVES 1 & 2 ONLY) */}
        {/* ========================================================================= */}
        {showIoDialog && wave !== 3 && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-40 flex items-center justify-center p-6 animate-fadeIn">
            <div className="w-full max-w-md bg-gradient-to-b from-[#0b1a34] to-[#060c18] border-2 border-cyan-400/60 rounded-3xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.4)] flex flex-col gap-4 text-left">
              {/* Speaker Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950 border-2 border-cyan-400 p-0.5 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                  <img
                    src="/scenes/characters/TECH_IO.png"
                    alt="Technician Io"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-400/30">
                    {wave === 1 ? 'WAVE 1 SECURED' : 'WAVE 2 SECURED'}
                  </span>
                  <h3 className="text-xl font-display font-black text-white mt-1">
                    Technician Io
                  </h3>
                  <p className="text-xs text-gray-400">Chief Systems Engineer, Cloud Grid</p>
                </div>
              </div>

              {/* Dialogue Transcript */}
              <div className="bg-black/50 p-4 rounded-2xl border border-white/10 text-xs text-gray-200 leading-relaxed space-y-2">
                {wave === 1 && (
                  <>
                    <p>
                      "Great job! Wave 1 secured with {coreHp}/3 Core Integrity remaining."
                    </p>
                    <p className="text-amber-300 font-medium">
                      "Get ready, the next wave is incoming!"
                    </p>
                  </>
                )}
                {wave === 2 && (
                  <>
                    <p>
                      "Awesome work! Wave 2 secured with {coreHp}/3 Core Integrity remaining."
                    </p>
                    <p className="text-amber-300 font-medium">
                      "Prepare your defenses for the final wave!"
                    </p>
                  </>
                )}
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-cyan-950/40 border border-cyan-500/30 p-2.5 rounded-xl">
                  <div className="text-[10px] font-bold uppercase text-cyan-400">Total Blocks</div>
                  <div className="font-mono text-lg font-black text-white">{entities.length} Blocks</div>
                </div>
                <div className="bg-[#ff912d]/15 border border-[#ff912d]/40 p-2.5 rounded-xl">
                  <div className="text-[10px] font-bold uppercase text-[#ff912d]">Core Integrity</div>
                  <div className="font-mono text-lg font-black text-white">{coreHp}/3 Lives</div>
                </div>
              </div>

              {/* Proceed Action Button */}
              <button
                onClick={handleIoProceed}
                className="w-full py-4 bg-gradient-to-r from-[#ff912d] to-cyan-500 hover:from-[#ff8114] hover:to-cyan-400 active:scale-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{wave === 1 ? 'Proceed to Wave 2' : 'Proceed to Wave 3'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes singleExplosion {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          20% {
            transform: scale(1.25);
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
          animation: singleExplosion 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
