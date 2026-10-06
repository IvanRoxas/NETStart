"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Check, AlertTriangle, ShieldAlert, Droplets, Wind } from 'lucide-react';
import type { MercuryLevel1Validation } from '@/lib/mercury/mercuryLevel1Definitions';

interface MercuryLevel1BiodomeProps {
  validation: MercuryLevel1Validation;
  isRunning: boolean;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
}

// Procedural audio synthesizer using Web Audio API
class BiodomeSoundFX {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // High-tech confirmation chime
  playSuccessChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {}
  }

  // Pneumatic hiss for vents opening
  playVentHiss() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.5);
    } catch (e) {}
  }

  // Water spritz for copper irrigation pipe
  playSprinklerSpritz() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  // Gentle foliage chime / rustle for shrub fertilization
  playFertilizerRustle() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  // Error buzz for trap / errors
  playErrorBuzz() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }
}

const soundFX = new BiodomeSoundFX();

// 5 Potted Shrubs positioned securely on the Left Wooden Rack
// Base anchors: Top shelf plank is at bottom: 44.5%, Bottom shelf plank is at bottom: 22.5%
const SHRUB_COORDINATES = [
  // Top Shelf (2 pots)
  { bottom: '44.5%', left: '19%', scale: 0.95 },
  { bottom: '44.5%', left: '31%', scale: 0.95 },
  // Bottom Shelf (3 pots)
  { bottom: '22.5%', left: '15%', scale: 1.05 },
  { bottom: '22.5%', left: '25%', scale: 1.05 },
  { bottom: '22.5%', left: '35%', scale: 1.05 },
];

// 5 Simple Potted Flowers positioned securely on the Right Wooden Rack (.potted-flower)
const FLOWER_COORDINATES = [
  // Top Shelf (2 simple flower pots: [0] in former star-flower position, [1] companion flower)
  { bottom: '44.5%', left: '69%', scale: 0.95 },
  { bottom: '44.5%', left: '81%', scale: 0.95 },
  // Bottom Shelf (3 simple companion flower pots)
  { bottom: '22.5%', left: '65%', scale: 1.05 },
  { bottom: '22.5%', left: '75%', scale: 1.05 },
  { bottom: '22.5%', left: '85%', scale: 1.05 },
];

// Centerpiece: Special Star-Flower (#star-flower) placed in the middle of the room in a bigger pot
const STAR_FLOWER_COORDINATE = {
  bottom: '12%',
  left: '50%',
};

// Top ceiling ventilation fans facing DOWNWARD into the dome
const VENT_COORDINATES = [
  { top: '15%', left: '25%' },
  { top: '11%', left: '50%' },
  { top: '15%', left: '75%' },
];

interface PlantStemAndPotProps {
  type: 'flower' | 'star_flower';
  isHealthy: boolean;
  className?: string;
}

function PlantStemAndPot({ type, isHealthy, className = '' }: PlantStemAndPotProps) {
  if (type === 'star_flower') {
    return (
      <svg
        viewBox="0 0 76 70"
        className={`w-20 h-18 sm:w-24 sm:h-22 transition-all duration-700 pointer-events-none ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isHealthy ? (
          <g className="transition-all duration-700">
            {/* Healthy Star-Flower Emerald Stem */}
            <path
              d="M 38 12 Q 38 28 38 46"
              stroke="#059669"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 37 14 Q 37 28 37 44"
              stroke="#34d399"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Healthy Lush Spreading Leaves */}
            {/* Top Left Leaf */}
            <path
              d="M 38 22 C 22 15, 10 19, 12 30 C 15 37, 28 32, 38 27 Z"
              fill="#10b981"
              stroke="#047857"
              strokeWidth="1.5"
            />
            <path
              d="M 38 26 Q 24 23 15 28"
              stroke="#6ee7b7"
              strokeWidth="1"
            />
            {/* Bottom Left Leaf */}
            <path
              d="M 38 33 C 18 31, 8 38, 11 46 C 14 50, 26 44, 38 37 Z"
              fill="#059669"
              stroke="#047857"
              strokeWidth="1.5"
            />
            {/* Top Right Leaf */}
            <path
              d="M 38 20 C 54 13, 66 17, 64 28 C 61 35, 48 30, 38 25 Z"
              fill="#34d399"
              stroke="#059669"
              strokeWidth="1.5"
            />
            <path
              d="M 38 24 Q 52 21 61 26"
              stroke="#a7f3d0"
              strokeWidth="1"
            />
            {/* Bottom Right Leaf */}
            <path
              d="M 38 31 C 58 29, 68 36, 65 44 C 62 48, 50 42, 38 35 Z"
              fill="#10b981"
              stroke="#047857"
              strokeWidth="1.5"
            />

            {/* Centerpiece Ornate Pot with Rich Moist Soil */}
            <ellipse cx="38" cy="46" rx="24" ry="5.5" fill="#1c1917" />
            <ellipse cx="38" cy="46" rx="21" ry="3.5" fill="#292524" />
            {/* Golden Sci-Fi Collar Rim */}
            <rect x="11" y="43" width="54" height="7" rx="3.5" fill="#d97706" stroke="#b45309" strokeWidth="1.5" />
            <rect x="13" y="44" width="50" height="2" rx="1" fill="#fde68a" opacity="0.6" />
            {/* Terracotta / Bronze Urn Body */}
            <path
              d="M 14 49 L 19 66 Q 38 69 57 66 L 62 49 Z"
              fill="#9a3412"
              stroke="#7c2d12"
              strokeWidth="1.5"
            />
            {/* Ornate Gold Emblem */}
            <circle cx="38" cy="58" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
            <circle cx="38" cy="58" r="2" fill="#fef08a" />
          </g>
        ) : (
          <g className="transition-all duration-700">
            {/* Wilted Star-Flower Stem (Drooping bend) */}
            <path
              d="M 35 12 Q 43 25 38 46"
              stroke="#78350f"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 34 14 Q 41 25 37 44"
              stroke="#a16207"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Drooping Shriveled Withered Leaves */}
            {/* Top Left Leaf (sagging down) */}
            <path
              d="M 38 24 C 25 25, 14 34, 16 44 C 20 46, 28 37, 38 31 Z"
              fill="#854d0e"
              stroke="#5a200d"
              strokeWidth="1.5"
            />
            {/* Bottom Left Leaf (touching rim) */}
            <path
              d="M 38 34 C 23 37, 13 46, 15 53 C 19 55, 29 45, 38 40 Z"
              fill="#713f12"
              stroke="#451a03"
              strokeWidth="1.5"
            />
            {/* Top Right Leaf (sagging down) */}
            <path
              d="M 38 22 C 51 24, 62 32, 59 42 C 55 45, 46 36, 38 29 Z"
              fill="#a16207"
              stroke="#713f12"
              strokeWidth="1.5"
            />
            {/* Bottom Right Leaf (touching rim) */}
            <path
              d="M 38 32 C 53 35, 63 44, 61 51 C 57 54, 47 44, 38 38 Z"
              fill="#854d0e"
              stroke="#5a200d"
              strokeWidth="1.5"
            />

            {/* Dry Centerpiece Pot */}
            <ellipse cx="38" cy="46" rx="24" ry="5.5" fill="#44403c" />
            <ellipse cx="38" cy="46" rx="20" ry="3" fill="#57534e" />
            {/* Muted Collar Rim */}
            <rect x="11" y="43" width="54" height="7" rx="3.5" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
            {/* Body */}
            <path
              d="M 14 49 L 19 66 Q 38 69 57 66 L 62 49 Z"
              fill="#78350f"
              stroke="#451a03"
              strokeWidth="1.5"
            />
            {/* Muted Emblem */}
            <circle cx="38" cy="58" r="4.5" fill="#a16207" stroke="#451a03" strokeWidth="1" />
          </g>
        )}
      </svg>
    );
  }

  // 'flower' (Simple companion potted flower on Right Rack)
  return (
    <svg
      viewBox="0 0 52 46"
      className={`w-14 h-12 sm:w-16 sm:h-14 transition-all duration-700 pointer-events-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isHealthy ? (
        <g className="transition-all duration-700">
          {/* Healthy Vertical Flower Stem */}
          <path d="M 26 10 L 26 30" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" />
          {/* Twin Fresh Upward Leaves */}
          <path
            d="M 26 18 C 17 15, 9 17, 11 23 C 13 27, 21 23, 26 21 Z"
            fill="#22c55e"
            stroke="#15803d"
            strokeWidth="1"
          />
          <path
            d="M 26 15 C 35 12, 43 14, 41 20 C 39 24, 31 20, 26 18 Z"
            fill="#4ade80"
            stroke="#16a34a"
            strokeWidth="1"
          />

          {/* Terracotta Pot with Moist Soil */}
          <ellipse cx="26" cy="30" rx="14" ry="3.5" fill="#292524" />
          <rect x="10" y="28" width="32" height="5" rx="2.5" fill="#ea580c" stroke="#9a3412" strokeWidth="1" />
          <path d="M 12 32 L 15 44 Q 26 46 37 44 L 40 32 Z" fill="#c2410c" stroke="#9a3412" strokeWidth="1" />
        </g>
      ) : (
        <g className="transition-all duration-700">
          {/* Drooping Wilted Flower Stem */}
          <path d="M 24 10 Q 29 18 26 30" stroke="#854d0e" strokeWidth="3" strokeLinecap="round" />
          {/* Drooping Leaves hanging down */}
          <path
            d="M 26 20 C 18 21, 12 26, 14 32 C 16 34, 22 28, 26 24 Z"
            fill="#a16207"
            stroke="#713f12"
            strokeWidth="1"
          />
          <path
            d="M 26 18 C 32 20, 38 25, 36 31 C 34 33, 29 26, 26 22 Z"
            fill="#854d0e"
            stroke="#713f12"
            strokeWidth="1"
          />

          {/* Dry Terracotta Pot */}
          <ellipse cx="26" cy="30" rx="14" ry="3.5" fill="#57534e" />
          <rect x="10" y="28" width="32" height="5" rx="2.5" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />
          <path d="M 12 32 L 15 44 Q 26 46 37 44 L 40 32 Z" fill="#7c2d12" stroke="#5a200d" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}

function ShrubPot({ isHealthy, className = '' }: { isHealthy: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 44 24"
      className={`w-12 h-6 sm:w-14 sm:h-7 pointer-events-none transition-all duration-500 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {isHealthy ? (
        <g>
          {/* Terracotta Shelf Pot with Moist Rich Soil */}
          <ellipse cx="22" cy="6" rx="14" ry="3.5" fill="#292524" />
          <rect x="6" y="4" width="32" height="4.5" rx="2" fill="#ea580c" stroke="#9a3412" strokeWidth="1" />
          <path d="M 8 8 L 11 20 Q 22 22 33 20 L 36 8 Z" fill="#c2410c" stroke="#9a3412" strokeWidth="1" />
        </g>
      ) : (
        <g>
          {/* Weathered Terracotta Shelf Pot with Dry Soil */}
          <ellipse cx="22" cy="6" rx="14" ry="3.5" fill="#57534e" />
          <rect x="6" y="4" width="32" height="4.5" rx="2" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />
          <path d="M 8 8 L 11 20 Q 22 22 33 20 L 36 8 Z" fill="#7c2d12" stroke="#5a200d" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}

// Magnifying glass cursor for Environment Scanner
const SCANNER_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2338bdf8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='10' cy='10' r='7'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='15' y2='15'%3E%3C/line%3E%3C/svg%3E") 10 10, crosshair`;

export default function MercuryLevel1Biodome({
  validation,
  isRunning,
  onSimulationComplete
}: MercuryLevel1BiodomeProps) {
  // Environment Scanner hover state
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);
  const [scannerPos, setScannerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dioramaRef = useRef<HTMLDivElement>(null);

  // Animation states
  const [sprayingWaterPipe, setSprayingWaterPipe] = useState(false);
  const [showDomRestoredBanner, setShowDomRestoredBanner] = useState(false);

  // Sequenced animation display states (play one by one!)
  const [animVentsOpened, setAnimVentsOpened] = useState(false);
  const [animWateredShrubIndices, setAnimWateredShrubIndices] = useState<number[]>([]);
  const [animWateredFlowerIndices, setAnimWateredFlowerIndices] = useState<number[]>([]);
  const [animLilyWatered, setAnimLilyWatered] = useState(false);
  const [animStarFlowerSpraying, setAnimStarFlowerSpraying] = useState(false);
  const [animStarFlowerBadge, setAnimStarFlowerBadge] = useState<string | null>(null);

  // Reference to clean up all pending animation timers if simulation is cancelled
  const animTimersRef = useRef<NodeJS.Timeout[]>([]);
  const clearAllAnimTimers = () => {
    animTimersRef.current.forEach(t => clearTimeout(t));
    animTimersRef.current = [];
  };

  // Track previous execution triggers to run audio cues & visual animations
  const prevRunningRef = useRef(false);

  useEffect(() => {
    if (!isRunning) {
      clearAllAnimTimers();
      setSprayingWaterPipe(false);
      setShowDomRestoredBanner(false);
      setAnimVentsOpened(false);
      setAnimWateredShrubIndices([]);
      setAnimWateredFlowerIndices([]);
      setAnimLilyWatered(false);
      setAnimStarFlowerSpraying(false);
      setAnimStarFlowerBadge(null);
      prevRunningRef.current = false;
      return;
    }

    if (isRunning && !prevRunningRef.current) {
      clearAllAnimTimers();
      setAnimVentsOpened(false);
      setAnimWateredShrubIndices([]);
      setAnimWateredFlowerIndices([]);
      setAnimLilyWatered(false);
      setAnimStarFlowerSpraying(false);
      setAnimStarFlowerBadge(null);
      setShowDomRestoredBanner(false);

      // 1. Broad selector "nuke" alert
      if (validation.usedBroadNukeSelector) {
        soundFX.playErrorBuzz();
        return;
      }

      let currentTime = 150;

      // STEP 1: Vents (<vent>) - Open and start blowing cool air
      if (validation.isVentsOpened) {
        const tVents = setTimeout(() => {
          soundFX.playVentHiss();
          setAnimVentsOpened(true);
        }, currentTime);
        animTimersRef.current.push(tVents);
        currentTime += 750;
      }

      if (validation.isVentWateredWrong) {
        const tWarn = setTimeout(() => {
          soundFX.playErrorBuzz();
        }, currentTime);
        animTimersRef.current.push(tWarn);
        currentTime += 400;
      }

      // STEP 2: Shrubs (.shrub) - Fertilize one by one
      const hasShrubActions =
        validation.isAllShrubsWatered ||
        (validation.wateredShrubIndices && validation.wateredShrubIndices.length > 0);

      if (hasShrubActions) {
        const targetShrubs = validation.isAllShrubsWatered
          ? [0, 1, 2, 3, 4]
          : validation.wateredShrubIndices;

        const tRustle = setTimeout(() => {
          soundFX.playFertilizerRustle();
        }, currentTime);
        animTimersRef.current.push(tRustle);

        targetShrubs.forEach((shrubIdx, i) => {
          const tShrub = setTimeout(() => {
            setAnimWateredShrubIndices(prev => Array.from(new Set([...prev, shrubIdx])));
          }, currentTime + i * 150);
          animTimersRef.current.push(tShrub);
        });

        currentTime += targetShrubs.length * 150 + 350;
      }

      // STEP 3: Shelf Flowers (.flower) - Spray water and bloom one by one
      const hasFlowerActions =
        validation.isAllFlowersWatered ||
        (validation.wateredFlowerIndices && validation.wateredFlowerIndices.length > 0);

      if (hasFlowerActions) {
        const targetFlowers = validation.isAllFlowersWatered
          ? [0, 1, 2, 3, 4]
          : validation.wateredFlowerIndices;

        const tSprayStart = setTimeout(() => {
          setSprayingWaterPipe(true);
          soundFX.playSprinklerSpritz();
        }, currentTime);
        animTimersRef.current.push(tSprayStart);

        targetFlowers.forEach((flowerIdx, i) => {
          const tFlower = setTimeout(() => {
            soundFX.playSprinklerSpritz();
            setAnimWateredFlowerIndices(prev => Array.from(new Set([...prev, flowerIdx])));
          }, currentTime + 180 + i * 160);
          animTimersRef.current.push(tFlower);
        });

        const flowerDuration = targetFlowers.length * 160 + 300;
        const tSprayEnd = setTimeout(() => {
          setSprayingWaterPipe(false);
        }, currentTime + flowerDuration);
        animTimersRef.current.push(tSprayEnd);

        currentTime += flowerDuration + 350;
      }

      if (validation.usedQuerySelectorTrap && !validation.isAllShrubsWatered) {
        const tTrap = setTimeout(() => {
          soundFX.playErrorBuzz();
        }, currentTime);
        animTimersRef.current.push(tTrap);
        currentTime += 400;
      }

      // STEP 4: Centerpiece Star Flower (#star-flower) - Plays strictly LAST!
      const hasStarFlowerAction =
        validation.isLilyWatered ||
        validation.objective3StarFlower ||
        validation.starFlowerHasFertilizer ||
        validation.starFlowerHasWater ||
        validation.isStarFlowerNeedsWater ||
        validation.isStarFlowerNeedsFertilizer ||
        validation.isStarFlowerFertilizeFail ||
        validation.isStarFlowerOpenedWrong;

      if (hasStarFlowerAction) {
        if (validation.isStarFlowerFertilizeFail || validation.isStarFlowerOpenedWrong) {
          const tStarFail = setTimeout(() => {
            soundFX.playErrorBuzz();
            setAnimStarFlowerBadge(validation.isStarFlowerOpenedWrong ? 'wrong_open' : 'too_hot');
          }, currentTime);
          animTimersRef.current.push(tStarFail);
          currentTime += 800;
        } else if (validation.isStarFlowerNeedsWater) {
          // Only fertilizer applied
          const tStarFertilize = setTimeout(() => {
            soundFX.playFertilizerRustle();
            setAnimStarFlowerBadge('needs_water');
          }, currentTime);
          animTimersRef.current.push(tStarFertilize);
          currentTime += 900;
        } else if (validation.isStarFlowerNeedsFertilizer) {
          // Only water applied
          const tStarWater = setTimeout(() => {
            soundFX.playSprinklerSpritz();
            setAnimStarFlowerSpraying(true);
            setAnimStarFlowerBadge('needs_fertilizer');
            setTimeout(() => setAnimStarFlowerSpraying(false), 700);
          }, currentTime);
          animTimersRef.current.push(tStarWater);
          currentTime += 900;
        } else if (validation.isLilyWatered || validation.objective3StarFlower) {
          // Both fertilizer and water applied: First spray water, then fertilize and full radiant bloom!
          const tStarSpray = setTimeout(() => {
            soundFX.playSprinklerSpritz();
            setAnimStarFlowerSpraying(true);
          }, currentTime);
          animTimersRef.current.push(tStarSpray);

          const tStarBloom = setTimeout(() => {
            setAnimStarFlowerSpraying(false);
            soundFX.playFertilizerRustle();
            setAnimLilyWatered(true);
            setAnimStarFlowerBadge('blooming');
          }, currentTime + 600);
          animTimersRef.current.push(tStarBloom);

          currentTime += 1600;
        }
      }

      // STEP 5: DOM Restored & Level Completion
      if (validation.isAllCompleted) {
        const tBanner = setTimeout(() => {
          soundFX.playSuccessChime();
          setShowDomRestoredBanner(true);
        }, currentTime);
        animTimersRef.current.push(tBanner);

        const tWin = setTimeout(() => {
          if (onSimulationComplete) {
            onSimulationComplete(true);
          }
        }, currentTime + 1400);
        animTimersRef.current.push(tWin);
      }
    }

    prevRunningRef.current = isRunning;
  }, [isRunning, validation, onSimulationComplete]);

  // Provide seamless DOM compatibility if player or script queries document.getElementsByTagName('vent')
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const originalGetElementsByTagName = document.getElementsByTagName.bind(document);
    document.getElementsByTagName = function (tagName: string) {
      if (tagName && tagName.toLowerCase() === 'vent') {
        return document.querySelectorAll('[data-tag="vent"]') as unknown as HTMLCollectionOf<Element>;
      }
      return originalGetElementsByTagName(tagName);
    };

    return () => {
      document.getElementsByTagName = originalGetElementsByTagName;
    };
  }, []);

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#080314] text-white overflow-hidden relative select-none">
      
      {/* Red Alert Flash overlay for Broad Selector 'div' */}
      {validation.usedBroadNukeSelector && (
        <div className="absolute inset-0 z-40 bg-red-600/30 pointer-events-none animate-pulse border-4 border-red-500 flex items-center justify-center">
          <div className="bg-red-950/95 border-2 border-red-500 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
            <ShieldAlert size={28} className="text-red-400 shrink-0" />
            <div>
              <div className="text-red-300 font-bold text-sm tracking-wide uppercase font-mono">SAFETY SHUTDOWN</div>
              <div className="text-white text-xs">Target &apos;div&apos; is too broad! Pick a specific id, class, or tag.</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Viewport Content Area: Full Greenhouse Stage */}
      <div className="flex-1 w-full h-full min-h-0 relative flex items-center justify-center overflow-hidden">
        
        {/* The Diorama Stage Container with Magnifying Glass cursor */}
        <div
          ref={dioramaRef}
          style={{ cursor: SCANNER_CURSOR }}
          onMouseMove={(e) => {
            if (dioramaRef.current) {
              const rect = dioramaRef.current.getBoundingClientRect();
              setScannerPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }
          }}
          onMouseLeave={() => setHoveredTarget(null)}
          className="relative w-full h-full overflow-hidden bg-gradient-to-b from-[#090217] via-[#120626] to-[#070110] flex items-center justify-center"
        >
          {/* Floating Tooltip following Magnifying Glass Cursor */}
          {hoveredTarget && (
            <div
              className="pointer-events-none absolute z-50 px-2.5 py-1 rounded-md bg-slate-950/95 border border-cyan-400 text-xs font-mono font-bold text-cyan-300 shadow-xl shadow-cyan-950/70 backdrop-blur-xs select-none"
              style={{
                left: `${scannerPos.x + 16}px`,
                top: `${scannerPos.y + 16}px`,
              }}
            >
              {hoveredTarget}
            </div>
          )}

          {/* --------------------------------------------------------- */}
          {/* 1. BASE LAYER: Dark Cosmic Background & Greenhouse Vector  */}
          {/* --------------------------------------------------------- */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 800 600">
            <defs>
              {/* Dark Cosmic Backdrop Outside Glass */}
              <linearGradient id="darkSpaceSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#04010a" />
                <stop offset="50%" stopColor="#0b031c" />
                <stop offset="100%" stopColor="#180738" />
              </linearGradient>

              {/* Soft Nebula Cosmic Glow */}
              <radialGradient id="nebulaGlow" cx="50%" cy="25%" r="65%">
                <stop offset="0%" stopColor="rgba(168, 85, 247, 0.25)" />
                <stop offset="50%" stopColor="rgba(99, 102, 241, 0.12)" />
                <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
              </radialGradient>

              {/* Arched Girder Steel Gradient */}
              <linearGradient id="girderSteel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Greenhouse Perimeter Wall Beam */}
              <linearGradient id="wallSteel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2e1065" />
                <stop offset="50%" stopColor="#1e1035" />
                <stop offset="100%" stopColor="#120626" />
              </linearGradient>

              {/* Wooden Shelf Gradient */}
              <linearGradient id="shelfWood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="50%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#451a03" />
              </linearGradient>

              {/* Greenhouse Wooden Floorboards */}
              <linearGradient id="greenhouseFloor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2c160c" />
                <stop offset="100%" stopColor="#150a05" />
              </linearGradient>
            </defs>

            {/* Dark Space Sky seen outside curved glass dome */}
            <rect x="0" y="0" width="800" height="360" fill="url(#darkSpaceSky)" />
            <rect x="0" y="0" width="800" height="360" fill="url(#nebulaGlow)" />

            {/* Twinkling Cosmic Stars in Space */}
            <circle cx="90" cy="50" r="1.5" fill="#FFFFFF" opacity="0.8" />
            <circle cx="160" cy="90" r="1.2" fill="#E9D5FF" opacity="0.7" />
            <circle cx="280" cy="40" r="2" fill="#FDE047" opacity="0.9" />
            <circle cx="390" cy="65" r="1" fill="#FFFFFF" opacity="0.6" />
            <circle cx="510" cy="35" r="1.5" fill="#FFFFFF" opacity="0.8" />
            <circle cx="630" cy="80" r="1.8" fill="#E9D5FF" opacity="0.75" />
            <circle cx="730" cy="45" r="1.2" fill="#FFFFFF" opacity="0.7" />

            {/* --------------------------------------------------------- */}
            {/* COHESIVE GREENHOUSE BIODOME ARCHITECTURAL FRAMEWORK       */}
            {/* --------------------------------------------------------- */}

            {/* Concentric Glass Vault Arches (Harmonious upward curvature) */}
            <path d="M -10 180 Q 400 130 810 180" stroke="#7e22ce" strokeWidth="2.5" fill="none" opacity="0.45" />
            <path d="M -10 280 Q 400 235 810 280" stroke="#9333ea" strokeWidth="2" fill="none" opacity="0.35" />

            {/* Continuous Vertical / Radial Dome Ribs (Connecting girder to perimeter wall) */}
            <line x1="60" y1="62" x2="50" y2="358" stroke="#7e22ce" strokeWidth="2.5" opacity="0.35" />
            <line x1="200" y1="46" x2="200" y2="358" stroke="#7e22ce" strokeWidth="3" opacity="0.45" />
            <line x1="400" y1="32" x2="400" y2="358" stroke="#7e22ce" strokeWidth="3.5" opacity="0.55" />
            <line x1="600" y1="46" x2="600" y2="358" stroke="#7e22ce" strokeWidth="3" opacity="0.45" />
            <line x1="740" y1="62" x2="750" y2="358" stroke="#7e22ce" strokeWidth="2.5" opacity="0.35" />

            {/* Subtle Node Rivets at Arch-Rib Intersections */}
            <circle cx="400" cy="130" r="3" fill="#c084fc" opacity="0.6" />
            <circle cx="200" cy="148" r="2.5" fill="#a855f7" opacity="0.5" />
            <circle cx="600" cy="148" r="2.5" fill="#a855f7" opacity="0.5" />
            <circle cx="400" cy="235" r="3" fill="#c084fc" opacity="0.5" />
            <circle cx="200" cy="250" r="2.5" fill="#a855f7" opacity="0.4" />
            <circle cx="600" cy="250" r="2.5" fill="#a855f7" opacity="0.4" />

            {/* Primary Vaulted Ceiling Girder (Heavy structural beam over dome) */}
            <path d="M -10 65 Q 400 15 810 65 L 810 82 Q 400 32 -10 82 Z" fill="url(#girderSteel)" stroke="#475569" strokeWidth="1.5" />
            <path d="M -10 65 Q 400 15 810 65" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.8" />
            <path d="M -10 82 Q 400 32 810 82" stroke="#1e293b" strokeWidth="2" fill="none" />

            {/* Structural Rivet Studs along the Primary Girder */}
            <circle cx="120" cy="62" r="1.5" fill="#cbd5e1" opacity="0.8" />
            <circle cx="280" cy="38" r="1.5" fill="#cbd5e1" opacity="0.8" />
            <circle cx="520" cy="38" r="1.5" fill="#cbd5e1" opacity="0.8" />
            <circle cx="680" cy="62" r="1.5" fill="#cbd5e1" opacity="0.8" />

            {/* Roof Ceiling Girder at the Tippy Top (y = 0) */}
            <rect x="0" y="0" width="800" height="8" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <line x1="0" y1="8" x2="800" y2="8" stroke="#475569" strokeWidth="1.5" />
            <circle cx="100" cy="4" r="1.5" fill="#94a3b8" />
            <circle cx="200" cy="4" r="2" fill="#94a3b8" />
            <circle cx="300" cy="4" r="1.5" fill="#94a3b8" />
            <circle cx="400" cy="4" r="2" fill="#94a3b8" />
            <circle cx="500" cy="4" r="1.5" fill="#94a3b8" />
            <circle cx="600" cy="4" r="2" fill="#94a3b8" />
            <circle cx="700" cy="4" r="1.5" fill="#94a3b8" />

            {/* Ceiling Suspension Columns extending from TIPPY TOP (y=0) down into each fan */}
            {/* Center Fan Suspension Column (x=400, from y=0 to y=44) */}
            <rect x="384" y="0" width="32" height="8" rx="1" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <line x1="392" y1="8" x2="392" y2="46" stroke="#64748b" strokeWidth="4" />
            <line x1="408" y1="8" x2="408" y2="46" stroke="#64748b" strokeWidth="4" />
            <line x1="390" y1="24" x2="410" y2="24" stroke="#475569" strokeWidth="2.5" />
            <rect x="378" y="42" width="44" height="7" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <circle cx="385" cy="45.5" r="1.5" fill="#38bdf8" />
            <circle cx="415" cy="45.5" r="1.5" fill="#38bdf8" />

            {/* Left Fan Suspension Column (x=200, from y=0 to y=68) */}
            <rect x="184" y="0" width="32" height="8" rx="1" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <line x1="192" y1="8" x2="192" y2="70" stroke="#64748b" strokeWidth="4" />
            <line x1="208" y1="8" x2="208" y2="70" stroke="#64748b" strokeWidth="4" />
            <line x1="190" y1="36" x2="210" y2="36" stroke="#475569" strokeWidth="2.5" />
            <rect x="178" y="66" width="44" height="7" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <circle cx="185" cy="69.5" r="1.5" fill="#38bdf8" />
            <circle cx="215" cy="69.5" r="1.5" fill="#38bdf8" />

            {/* Right Fan Suspension Column (x=600, from y=0 to y=68) */}
            <rect x="584" y="0" width="32" height="8" rx="1" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <line x1="592" y1="8" x2="592" y2="70" stroke="#64748b" strokeWidth="4" />
            <line x1="608" y1="8" x2="608" y2="70" stroke="#64748b" strokeWidth="4" />
            <line x1="590" y1="36" x2="610" y2="36" stroke="#475569" strokeWidth="2.5" />
            <rect x="578" y="66" width="44" height="7" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <circle cx="585" cy="69.5" r="1.5" fill="#38bdf8" />
            <circle cx="615" cy="69.5" r="1.5" fill="#38bdf8" />

            {/* Greenhouse Perimeter Wall Base (Transition between glass dome & floor) */}
            <rect x="0" y="358" width="800" height="22" fill="url(#wallSteel)" stroke="#3b1d6e" strokeWidth="1.5" />
            <line x1="0" y1="358" x2="800" y2="358" stroke="#a855f7" strokeWidth="2" opacity="0.6" />

            {/* Greenhouse Dark Wooden Floor */}
            <rect x="0" y="380" width="800" height="220" fill="url(#greenhouseFloor)" />
            {/* Floorboard planks */}
            <line x1="0" y1="435" x2="800" y2="435" stroke="#0f0703" strokeWidth="2.5" />
            <line x1="0" y1="495" x2="800" y2="495" stroke="#0f0703" strokeWidth="2.5" />
            <line x1="0" y1="555" x2="800" y2="555" stroke="#0f0703" strokeWidth="2.5" />
            <line x1="180" y1="380" x2="160" y2="600" stroke="#0f0703" strokeWidth="2" opacity="0.6" />
            <line x1="400" y1="380" x2="400" y2="600" stroke="#0f0703" strokeWidth="2" opacity="0.6" />
            <line x1="620" y1="380" x2="640" y2="600" stroke="#0f0703" strokeWidth="2" opacity="0.6" />

            {/* --------------------------------------------------------- */}
            {/* RACK 1 (LEFT): TIERED WOODEN SHRUB RACK                   */}
            {/* --------------------------------------------------------- */}
            {/* Left Rack A-frame posts */}
            <polygon points="85,300 97,300 75,490 63,490" fill="#5c2b09" stroke="#331404" strokeWidth="2" />
            <polygon points="315,300 327,300 339,490 327,490" fill="#5c2b09" stroke="#331404" strokeWidth="2" />
            {/* Top Tier Shelf Plank (y = 333, height 14) */}
            <rect x="105" y="333" width="200" height="14" rx="2" fill="url(#shelfWood)" stroke="#331404" strokeWidth="2" />
            {/* Bottom Tier Shelf Plank (y = 465, height 16) */}
            <rect x="75" y="465" width="260" height="16" rx="2" fill="url(#shelfWood)" stroke="#331404" strokeWidth="2" />
            {/* Cross-braces */}
            <line x1="91" y1="347" x2="327" y2="465" stroke="#5c2b09" strokeWidth="3.5" opacity="0.7" />
            <line x1="315" y1="347" x2="81" y2="465" stroke="#5c2b09" strokeWidth="3.5" opacity="0.7" />

            {/* --------------------------------------------------------- */}
            {/* RACK 2 (RIGHT): MATCHING TIERED WOODEN FLOWER RACK        */}
            {/* --------------------------------------------------------- */}
            {/* Right Rack A-frame posts */}
            <polygon points="485,300 497,300 475,490 463,490" fill="#5c2b09" stroke="#331404" strokeWidth="2" />
            <polygon points="715,300 727,300 739,490 727,490" fill="#5c2b09" stroke="#331404" strokeWidth="2" />
            {/* Top Tier Shelf Plank (y = 333, height 14) */}
            <rect x="505" y="333" width="200" height="14" rx="2" fill="url(#shelfWood)" stroke="#331404" strokeWidth="2" />
            {/* Bottom Tier Shelf Plank (y = 465, height 16) */}
            <rect x="475" y="465" width="260" height="16" rx="2" fill="url(#shelfWood)" stroke="#331404" strokeWidth="2" />
            {/* Cross-braces */}
            <line x1="491" y1="347" x2="727" y2="465" stroke="#5c2b09" strokeWidth="3.5" opacity="0.7" />
            <line x1="715" y1="347" x2="481" y2="465" stroke="#5c2b09" strokeWidth="3.5" opacity="0.7" />
          </svg>

          {/* --------------------------------------------------------- */}
          {/* WATER SPRAY PARTICLES FROM COPPER IRRIGATION PIPE         */}
          {/* --------------------------------------------------------- */}
          {sprayingWaterPipe && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* Water spray over Right Flower Rack */}
              {(validation.isAllFlowersWatered || validation.wateredFlowerIndices.length > 0) && (
                <div className="absolute top-[32%] left-[82%] -translate-x-1/2 flex flex-col items-center animate-pulse">
                  <div className="w-24 h-36 bg-gradient-to-b from-cyan-300/50 to-transparent blur-xs rounded-b-full flex items-center justify-center">
                    <Droplets size={22} className="text-cyan-200 animate-bounce" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dedicated Water Spray over Center Star Flower (plays strictly during Step 4!) */}
          {animStarFlowerSpraying && (
            <div className="absolute inset-0 pointer-events-none z-25">
              <div className="absolute top-[48%] left-[50%] -translate-x-1/2 flex flex-col items-center animate-pulse">
                <div className="w-28 h-40 bg-gradient-to-b from-cyan-300/60 to-transparent blur-xs rounded-b-full flex items-center justify-center">
                  <Droplets size={24} className="text-cyan-200 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {/* Glowing DOM RESTORED overlay banner - only shows during successful simulation run */}
          {showDomRestoredBanner && (
            <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="bg-emerald-950/90 border-2 border-emerald-400 px-8 py-5 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.6)] flex flex-col items-center gap-2 transform animate-bounce">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                  <Check size={28} strokeWidth={3} />
                </div>
                <div className="font-display font-black text-2xl sm:text-3xl text-emerald-300 uppercase tracking-widest text-center">
                  DOM RESTORED
                </div>
                <div className="text-xs font-mono text-emerald-200/90 uppercase tracking-wider">
                  Greenhouse Life Support Active
                </div>
              </div>
            </div>
          )}



          {/* --------------------------------------------------------- */}
          {/* 2. CEILING VENTILATION FANS: ATTACHED TO TIPPY TOP (<vent>) */}
          {/* --------------------------------------------------------- */}

          {/* Roof Ceiling Beam at the very tippy top of the simulation screen */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/80 z-15 pointer-events-none shadow-sm" />

          {VENT_COORDINATES.map((pos, idx) => (
            <React.Fragment key={`vent-group-${idx}`}>
              {/* Heavy Vertical Suspension Column extending to TIPPY TOP (top: 0) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: pos.left,
                  height: pos.top,
                  transform: 'translateX(-50%)',
                }}
                className="z-10 flex flex-col items-center pointer-events-none"
              >
                {/* Roof Ceiling Mount Flange at the tippy top */}
                <div className="w-10 sm:w-12 h-2.5 bg-slate-700 border-x border-b border-slate-500 rounded-b-xs shadow-md flex items-center justify-around px-1">
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                </div>
                {/* Heavy Dual Industrial Steel Drop Struts */}
                <div className="w-4 sm:w-5 flex-1 bg-slate-800 border-x-2 border-slate-600 flex justify-between px-0.5 relative shadow-inner">
                  <div className="w-0.5 h-full bg-slate-400/40" />
                  <div className="w-0.5 h-full bg-slate-400/40" />
                  {/* Mid-span cross reinforcement clamp */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-slate-600" />
                </div>
                {/* Lower Fan Collar Clamp with Rivets */}
                <div className="w-12 sm:w-14 h-2 bg-slate-700 border border-slate-500 rounded-t-xs flex items-center justify-around px-1 shadow-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                </div>
              </div>

              {/* Fan Housing Unit */}
              <div
                style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)', cursor: SCANNER_CURSOR }}
                className="absolute z-10 flex flex-col items-center cursor-pointer"
                onMouseEnter={() => setHoveredTarget('<vent>')}
                onMouseLeave={() => setHoveredTarget(null)}
              >
                <div className="relative flex items-center justify-center">
                  <div
                    data-tag="vent"
                    className={`vent block w-20 h-9 sm:w-24 sm:h-11 transition-all duration-500 ${
                      animVentsOpened ? 'open' : 'closed'
                    }`}
                  >
                    <img
                      src={
                        animVentsOpened
                          ? "/assets/mercury/level1/vent_open.svg?v=4"
                          : "/assets/mercury/level1/vent_closed.svg?v=4"
                      }
                      alt="Ceiling Vent"
                      className={`w-full h-full object-contain transition-all duration-500 ${
                        animVentsOpened ? 'drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]' : ''
                      }`}
                    />
                  </div>

                  {/* Downward air stream when open */}
                  {animVentsOpened && (
                    <div className="absolute -bottom-6 flex flex-col items-center pointer-events-none">
                      <Wind size={20} className="text-cyan-300/80 animate-bounce" />
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}

          {/* --------------------------------------------------------- */}
          {/* 3. RACK 1: 5 SHRUBS (.shrub)                              */}
          {/*    Directly anchored to shelf planks with stems & pots    */}
          {/* --------------------------------------------------------- */}
          {SHRUB_COORDINATES.map((pos, idx) => {
            const isFertilized = animWateredShrubIndices.includes(idx);
            return (
              <div
                key={`shrub-${idx}`}
                style={{
                  bottom: pos.bottom,
                  left: pos.left,
                  transform: 'translateX(-50%)',
                  transitionDelay: `${idx * 0.12}s`,
                  cursor: SCANNER_CURSOR,
                }}
                className={`absolute z-10 flex flex-col items-center cursor-pointer transition-all duration-500 shrub potted-shrub ${
                  isFertilized ? 'healthy' : ''
                }`}
                onMouseEnter={() => setHoveredTarget('.shrub')}
                onMouseLeave={() => setHoveredTarget(null)}
              >
                {/* Contact shadow on shelf plank */}
                <div className="absolute -bottom-1 w-12 h-2 bg-black/60 rounded-full blur-[1px] pointer-events-none" />

                <div className="relative flex flex-col items-center justify-center">
                  {isFertilized && (
                    <>
                      {/* Outer wide green aura ring */}
                      <div className="absolute top-0 w-20 h-20 bg-lime-400/20 rounded-full blur-md animate-pulse pointer-events-none" />
                      {/* Inner vivid green glow core */}
                      <div className="absolute top-1 w-14 h-14 bg-green-400/55 rounded-full blur-sm animate-pulse pointer-events-none" />
                      {/* Floating nutrient particle dots */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 rounded-full bg-green-300 animate-bounce" style={{ animationDelay: '120ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: '240ms' }} />
                      </div>
                    </>
                  )}
                  {/* Shrubhead / Bush SVG */}
                  <img
                    src={
                      isFertilized
                        ? "/assets/mercury/level1/potted_shrub_healthy.svg?v=7"
                        : "/assets/mercury/level1/potted_shrub_withered.svg?v=7"
                    }
                    alt="Shrub"
                    className={`w-12 h-12 sm:w-14 sm:h-14 object-contain transition-all duration-500 -mb-2 z-10 ${
                      isFertilized
                        ? 'scale-105 drop-shadow-[0_0_18px_rgba(132,204,22,1)]'
                        : 'opacity-85'
                    }`}
                  />
                  {/* Terracotta Shelf Pot */}
                  <ShrubPot isHealthy={isFertilized} />
                  {isFertilized && (
                    <div className="absolute top-0 w-2.5 h-2.5 rounded-full bg-lime-300 animate-ping" />
                  )}
                </div>
              </div>
            );
          })}

          {/* --------------------------------------------------------- */}
          {/* 4. RACK 2: 5 FLOWERS (#flower-1 to #flower-5) (Right Rack) */}
          {/*    Anchored directly to shelf planks                      */}
          {/* --------------------------------------------------------- */}
          {FLOWER_COORDINATES.map((pos, idx) => {
            const flowerId = `flower-${idx + 1}`;
            const isWatered = animWateredFlowerIndices.includes(idx);
            return (
              <div
                key={`flower-${idx}`}
                id={flowerId}
                data-id={flowerId}
                style={{
                  bottom: pos.bottom,
                  left: pos.left,
                  transform: 'translateX(-50%)',
                  transitionDelay: `${idx * 0.12}s`,
                  cursor: SCANNER_CURSOR,
                }}
                className={`absolute z-10 flex flex-col items-center cursor-pointer transition-all duration-700 flower potted-flower ${
                  isWatered ? 'healthy' : ''
                }`}
                onMouseEnter={() => setHoveredTarget('.flower')}
                onMouseLeave={() => setHoveredTarget(null)}
              >
                {/* Contact shadow on shelf plank */}
                <div className="absolute -bottom-1 w-12 h-2 bg-black/60 rounded-full blur-[1px] pointer-events-none" />

                <div className="relative flex flex-col items-center justify-center">
                  {/* Flowerhead SVG on top */}
                  <img
                    src={
                      isWatered
                        ? "/assets/mercury/level1/flower_healthy.svg?v=7"
                        : "/assets/mercury/level1/flower_withered.svg?v=7"
                    }
                    alt={`Flower ${idx + 1}`}
                    className={`w-12 h-12 sm:w-14 sm:h-14 object-contain transition-all duration-700 -mb-2.5 z-10 hover:scale-105 ${
                      isWatered ? 'scale-105 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]' : 'opacity-85'
                    }`}
                  />
                  {/* State-Dependent Stem with Leaves and Terracotta Pot */}
                  <PlantStemAndPot type="flower" isHealthy={isWatered} />
                </div>
              </div>
            );
          })}

          {/* --------------------------------------------------------- */}
          {/* 5. CENTERPIECE: STAR-FLOWER WITH BIGGER POT (#star-flower) */}
          {/*    Placed in the middle of the room in a prominent big pot */}
          {/* --------------------------------------------------------- */}

          <div
            id="star-flower"
            style={{
              bottom: STAR_FLOWER_COORDINATE.bottom,
              left: STAR_FLOWER_COORDINATE.left,
              transform: 'translateX(-50%)',
              cursor: SCANNER_CURSOR,
            }}
            className={`absolute z-15 flex flex-col items-center cursor-pointer transition-all duration-700 ${
              animLilyWatered ? 'healthy' : 'withered'
            } ${hoveredTarget === '#star-flower' ? 'filter drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]' : ''}`}
            onMouseEnter={() => setHoveredTarget('#star-flower')}
            onMouseLeave={() => setHoveredTarget(null)}
          >
            {/* Grounding contact shadow & round wooden floor base disc */}
            <div className="absolute -bottom-2 w-28 sm:w-32 h-4 bg-black/65 rounded-full blur-[2px] pointer-events-none" />
            <div className="absolute -bottom-1 w-24 sm:w-28 h-3 bg-amber-950/90 rounded-full border border-amber-800/80 shadow-md pointer-events-none" />

            <div className="relative flex flex-col items-center justify-center">
              {/* Floating Status Callout Badge above Star Flower (plays strictly when Star Flower animates!) */}
              {animStarFlowerBadge === 'needs_water' && (
                <div className="absolute -top-10 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/95 border border-amber-400 text-amber-200 text-[11px] font-bold shadow-xl shadow-amber-950/70 animate-bounce pointer-events-none whitespace-nowrap">
                  <span>💧</span>
                  <span>Needs Water to fully bloom!</span>
                </div>
              )}
              {animStarFlowerBadge === 'needs_fertilizer' && (
                <div className="absolute -top-10 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/95 border border-emerald-400 text-emerald-200 text-[11px] font-bold shadow-xl shadow-emerald-950/70 animate-bounce pointer-events-none whitespace-nowrap">
                  <span>🌱</span>
                  <span>Needs Fertilizer to fully bloom!</span>
                </div>
              )}
              {animStarFlowerBadge === 'too_hot' && (
                <div className="absolute -top-10 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/95 border border-rose-400 text-rose-200 text-[11px] font-bold shadow-xl shadow-rose-950/70 animate-bounce pointer-events-none whitespace-nowrap">
                  <span>⚠️</span>
                  <span>Too hot! Turn on vents first.</span>
                </div>
              )}
              {animStarFlowerBadge === 'wrong_open' && (
                <div className="absolute -top-10 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/95 border border-rose-400 text-rose-200 text-[11px] font-bold shadow-xl shadow-rose-950/70 animate-bounce pointer-events-none whitespace-nowrap">
                  <span>⚠️</span>
                  <span>Needs care, not a power switch!</span>
                </div>
              )}
              {(animStarFlowerBadge === 'blooming' || animLilyWatered) && (
                <div className="absolute -top-10 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-950/95 border border-yellow-400 text-yellow-200 text-[11px] font-black shadow-xl shadow-yellow-950/70 pointer-events-none whitespace-nowrap animate-pulse">
                  <span>✨</span>
                  <span>Radiant & Blooming!</span>
                </div>
              )}

              {animLilyWatered && (
                <div className="absolute -top-4 w-36 h-36 bg-yellow-400/40 rounded-full blur-xl animate-pulse pointer-events-none" />
              )}

              {/* Star-Flower head + stem wrapped together so bounce keeps them connected */}
              <div className={`flex flex-col items-center transition-all duration-700 ${animLilyWatered ? 'animate-bounce' : ''}`}>
                <img
                  src={
                    animLilyWatered
                      ? "/assets/mercury/level1/star_flower_healthy.svg?v=7"
                      : "/assets/mercury/level1/star_flower_withered.svg?v=7"
                  }
                  alt="Star-Flower"
                  className={`w-18 h-18 sm:w-22 sm:h-22 object-contain transition-all duration-700 -mb-3 z-10 ${
                    animLilyWatered
                      ? 'scale-115 drop-shadow-[0_0_36px_rgba(250,204,21,1)]'
                      : 'opacity-90 drop-shadow-md'
                  }`}
                />

                {/* State-Dependent Stately Stalk with Lush Leaves and Grand Centerpiece Pot */}
                <PlantStemAndPot
                  type="star_flower"
                  isHealthy={animLilyWatered}
                />
              </div>

              {animLilyWatered && (
                <>
                  <Sparkles size={28} className="absolute -top-4 -right-3 text-yellow-300 animate-spin" />
                  <Sparkles size={22} className="absolute -top-2 -left-3 text-amber-200 animate-ping" />
                </>
              )}
            </div>
          </div>

        </div>

      </div>



    </div>
  );
}
