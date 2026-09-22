"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  MARS_PROMOTIONS,
  MARS_LEVEL_2_TARGETS,
  type MarsLevel2Validation,
} from '@/lib/mars/marsLevel2Definitions';
import {
  Sun,
  Droplet,
  Plane,
  Pizza,
  Wind,
  Sparkles,
  PartyPopper,
  Check,
  X,
  ZoomIn,
  AlertCircle,
} from 'lucide-react';

interface MarsImageBillboardsProps {
  validation: MarsLevel2Validation;
  isRunning: boolean;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
}

export default function MarsImageBillboards({
  validation,
  isRunning,
  onSimulationComplete,
}: MarsImageBillboardsProps) {
  const [zoomedFrameIndex, setZoomedFrameIndex] = useState<number | null>(null);
  const [currentScanningIndex, setCurrentScanningIndex] = useState<number | null>(null);
  const [frameStatuses, setFrameStatuses] = useState<('idle' | 'scanning' | 'passed' | 'failed')[]>([
    'idle',
    'idle',
    'idle',
    'idle',
    'idle',
  ]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [scanResult, setScanResult] = useState<{
    show: boolean;
    passes: number;
    total: number;
    frameResults: boolean[];
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const billboardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animTimeouts = useRef<NodeJS.Timeout[]>([]);

  const playBuzzerSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(75, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // Audio fallback
    }
  };

  const playPassChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // 3-tone harmonic chime arpeggio: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz)
      const frequencies = [523.25, 659.25, 783.99];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.001, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.22, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.39);
      });
    } catch {
      // Audio fallback
    }
  };

  const playVictoryFanfare = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const fanfareNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      fanfareNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);

        gain.gain.setValueAtTime(0.001, now + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.28, now + idx * 0.11 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.56);
      });
    } catch {
      // Audio fallback
    }
  };

  const clearAllTimeouts = () => {
    animTimeouts.current.forEach((t) => clearTimeout(t));
    animTimeouts.current = [];
  };

  const scrollBillboardIntoView = (index: number) => {
    const el = billboardRefs.current[index];
    if (el && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const elLeft = el.offsetLeft;
      const elWidth = el.offsetWidth;
      const containerWidth = container.clientWidth;
      const targetScrollLeft = elLeft - (containerWidth / 2) + (elWidth / 2);

      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth',
      });
    }
  };

  // Convert mouse wheel inside simulation container into horizontal scrolling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // If user is scrolling vertically with wheel, map it to horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      } else if (Math.abs(e.deltaX) > 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaX;
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // Continuous Camera Panning & Scanning Runtime Execution
  useEffect(() => {
    if (isRunning) {
      clearAllTimeouts();
      setZoomedFrameIndex(null);
      setShowCelebration(false);
      setFrameStatuses(['idle', 'idle', 'idle', 'idle', 'idle']);

      const totalBillboards = 5;
      const stepDuration = 2200; // Time per billboard pan + scan

      for (let i = 0; i < totalBillboards; i++) {
        // 1. Pan camera to billboard i and begin yellow scanning
        const tScan = setTimeout(() => {
          setCurrentScanningIndex(i);
          scrollBillboardIntoView(i);

          setFrameStatuses((prev) => {
            const next = [...prev];
            next[i] = 'scanning';
            return next;
          });
        }, i * stepDuration);

        // 2. Evaluate billboard i after scanning window
        const tEval = setTimeout(() => {
          const assigned = validation.assignedImages[i];
          const isCorrect = assigned === MARS_LEVEL_2_TARGETS[i];

          if (isCorrect) {
            playPassChime();
            setFrameStatuses((prev) => {
              const next = [...prev];
              next[i] = 'passed';
              return next;
            });
          } else {
            playBuzzerSound();
            setFrameStatuses((prev) => {
              const next = [...prev];
              next[i] = 'failed';
              return next;
            });
          }
        }, i * stepDuration + 1300);

        animTimeouts.current.push(tScan, tEval);
      }

      // Final completion evaluation at the end of the sequence
      const tFinal = setTimeout(() => {
        setCurrentScanningIndex(null);
        const frameResults = validation.assignedImages.map((src, idx) => src === MARS_LEVEL_2_TARGETS[idx]);
        const passes = frameResults.filter(Boolean).length;
        const isSuccess = passes === 5 && !validation.hasErrors;

        if (isSuccess) {
          playVictoryFanfare();
          setShowCelebration(true);
        } else {
          setScanResult({
            show: true,
            passes,
            total: totalBillboards,
            frameResults,
          });
        }
        if (onSimulationComplete) {
          onSimulationComplete(isSuccess);
        }
      }, totalBillboards * stepDuration + 800);

      animTimeouts.current.push(tFinal);
    } else {
      clearAllTimeouts();
      setCurrentScanningIndex(null);
      setFrameStatuses(['idle', 'idle', 'idle', 'idle', 'idle']);
      setShowCelebration(false);
    }

    return () => clearAllTimeouts();
  }, [isRunning, validation]);

  const handleBillboardClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (isRunning) return;
    if (zoomedFrameIndex === index) {
      setZoomedFrameIndex(null);
    } else {
      setZoomedFrameIndex(index);
      scrollBillboardIntoView(index);
    }
  };

  const handleContainerBackgroundClick = () => {
    if (isRunning) return;
    if (zoomedFrameIndex !== null) {
      setZoomedFrameIndex(null);
    }
  };

  const getFilterCss = (filterName?: string): string => {
    switch (filterName) {
      case 'glow':
        return 'drop-shadow(0 0 12px #f59e0b) drop-shadow(0 0 24px #f59e0b) brightness(1.2)';
      case 'sunset':
        return 'sepia(0.85) hue-rotate(-25deg) saturate(1.6) contrast(1.15)';
      case 'hologram':
        return 'hue-rotate(170deg) saturate(2.5) brightness(1.25) drop-shadow(0 0 10px #06b6d4)';
      case 'vivid':
        return 'saturate(3.2) contrast(1.3) brightness(1.1)';
      case 'nightvision':
        return 'hue-rotate(95deg) saturate(2.8) brightness(1.3) contrast(1.25) drop-shadow(0 0 10px #22c55e)';
      case 'retro':
        return 'grayscale(1) contrast(1.4) brightness(0.95)';
      case 'matrix':
        return 'sepia(1) hue-rotate(85deg) saturate(4) brightness(0.95) contrast(1.25)';
      case 'synthwave':
        return 'hue-rotate(270deg) saturate(3) contrast(1.3) brightness(1.15) drop-shadow(0 0 10px #ec4899)';
      case 'warm':
        return 'sepia(0.4) saturate(2) brightness(1.12)';
      case 'cool':
        return 'hue-rotate(190deg) saturate(1.8) brightness(1.1)';
      case 'invert':
        return 'invert(1) hue-rotate(180deg)';
      default:
        return 'none';
    }
  };

  const getFrameBorderClass = (frameStyle?: string): string => {
    switch (frameStyle) {
      case 'cyber':
        return 'border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.9)] ring-2 ring-cyan-400/80';
      case 'gold':
        return 'border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.9)] ring-2 ring-amber-400/80';
      case 'plasma':
        return 'border-purple-400 shadow-[0_0_25px_rgba(192,132,252,0.9)] ring-2 ring-purple-400/80';
      case 'laser':
        return 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.9)] ring-2 ring-rose-500/80';
      case 'emerald':
        return 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.9)] ring-2 ring-emerald-400/80';
      case 'rainbow':
        return 'border-fuchsia-400 shadow-[0_0_25px_rgba(232,121,249,0.9)] ring-2 ring-amber-300/80';
      default:
        return '';
    }
  };

  const getBorderShapeClass = (borderStyle?: string): string => {
    switch (borderStyle) {
      case 'rounded-soft':
        return 'rounded-2xl';
      case 'rounded-pill':
        return 'rounded-full scale-90';
      case 'polaroid':
        return 'p-1.5 bg-white shadow-2xl';
      case 'vignette':
        return 'shadow-[inset_0_0_25px_rgba(0,0,0,0.95)]';
      default:
        return '';
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun size={34} className="text-amber-300 animate-pulse drop-shadow-md" />;
      case 'droplet':
        return <Droplet size={34} className="text-sky-300 animate-bounce drop-shadow-md" />;
      case 'plane':
        return <Plane size={34} className="text-purple-300 drop-shadow-md" />;
      case 'pizza':
        return <Pizza size={34} className="text-red-300 drop-shadow-md" />;
      case 'wind':
        return <Wind size={34} className="text-emerald-300 drop-shadow-md" />;
      default:
        return <Sparkles size={34} className="text-yellow-300 drop-shadow-md" />;
    }
  };

  return (
    <div
      onClick={handleContainerBackgroundClick}
      className="w-full h-full relative overflow-hidden bg-[#070314] flex flex-col select-none cursor-default"
    >
      {/* FLOATING HOVERING TEXT WITH DEPTH (Hides when zoomed in or running) */}
      {!isRunning && zoomedFrameIndex === null && (
        <div className="absolute top-8 sm:top-12 inset-x-0 z-30 flex justify-center pointer-events-none px-4">
          <span
            className="text-white text-base sm:text-lg font-bold tracking-wider uppercase font-display select-none"
            style={{
              animation: 'floatTextHover 4.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
              willChange: 'transform',
              textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 6px 14px rgba(0,0,0,0.8), 0 12px 28px rgba(0,0,0,0.7)',
            }}
          >
            Match the images with their billboards!
          </span>
        </div>
      )}

      {/* PANORAMIC MARTIAN CANYON & BILLBOARDS HORIZONTAL SCROLL CONTAINER */}
      <div
        ref={scrollContainerRef}
        onClick={handleContainerBackgroundClick}
        className="flex-1 w-full h-full relative overflow-x-auto overflow-y-hidden flex items-end pb-3 mars-billboards-scrollbar"
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        {/* 1. VIBRANT COSMIC SPACE SKY BACKDROP (Deep space, glittering stars, celestial nebulas) */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030108] via-[#0b051e] to-[#200722] pointer-events-none min-w-[1550px] w-full" />

        {/* Twinkling Space Stars Canvas Pattern */}
        <div
          className="absolute inset-0 pointer-events-none min-w-[1550px] w-full opacity-90"
          style={{
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 30px 20px, #ffffff, transparent),
              radial-gradient(1px 1px at 90px 60px, #a5f3fc, transparent),
              radial-gradient(2.5px 2.5px at 170px 35px, #fde047, transparent),
              radial-gradient(1.5px 1.5px at 280px 85px, #e9d5ff, transparent),
              radial-gradient(1px 1px at 390px 25px, #ffffff, transparent),
              radial-gradient(2px 2px at 510px 70px, #fbcfe8, transparent),
              radial-gradient(1.5px 1.5px at 640px 30px, #ffffff, transparent),
              radial-gradient(1px 1px at 760px 65px, #a7f3d0, transparent),
              radial-gradient(3px 3px at 890px 25px, #fef08a, transparent),
              radial-gradient(1.5px 1.5px at 1020px 80px, #ffffff, transparent),
              radial-gradient(1px 1px at 1160px 35px, #bae6fd, transparent),
              radial-gradient(2.5px 2.5px at 1290px 60px, #f5d0fe, transparent),
              radial-gradient(1.5px 1.5px at 1420px 25px, #ffffff, transparent),
              radial-gradient(1px 1px at 1510px 75px, #99f6e4, transparent)
            `,
            backgroundSize: '1550px 100%',
          }}
        />

        {/* Multi-layered Glowing Cosmic Nebulas */}
        <div className="absolute top-2 left-1/5 w-96 h-52 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1 right-1/4 w-92 h-44 bg-pink-500/18 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-4 left-3/5 w-84 h-40 bg-cyan-500/16 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-2 left-2/3 w-68 h-36 bg-amber-500/14 rounded-full blur-2xl pointer-events-none" />

        {/* 2. MAJESTIC TOWERING MARTIAN CANYONS, LAYERED PLATEAUS & MESA LANDSCAPE */}
        <svg
          className="absolute inset-0 min-w-[1550px] w-full h-full pointer-events-none"
          viewBox="0 0 1550 700"
          preserveAspectRatio="none"
        >
          {/* Layer 1: Distant Canyon Rim & Stratified Mesas */}
          <path
            d="M0,700 L0,320 
               L90,320 L110,230 L310,230 L330,320 
               L420,320 L450,170 L720,170 L750,320 
               L840,320 L870,210 L1080,210 L1110,320 
               L1200,320 L1230,160 L1460,160 L1490,320 
               L1550,320 L1550,700 Z"
            fill="#150622"
            opacity="0.85"
          />

          {/* Distant Mesa Horizontal Sedimentary Strata Lines */}
          <line x1="110" y1="260" x2="310" y2="260" stroke="#331048" strokeWidth="3" opacity="0.8" />
          <line x1="450" y1="210" x2="720" y2="210" stroke="#331048" strokeWidth="3.5" opacity="0.8" />
          <line x1="450" y1="250" x2="720" y2="250" stroke="#331048" strokeWidth="3" opacity="0.7" />
          <line x1="870" y1="245" x2="1080" y2="245" stroke="#331048" strokeWidth="3" opacity="0.8" />
          <line x1="1230" y1="205" x2="1460" y2="205" stroke="#331048" strokeWidth="3.5" opacity="0.8" />
          <line x1="1230" y1="245" x2="1460" y2="245" stroke="#331048" strokeWidth="3" opacity="0.7" />

          {/* Layer 2: Midground Towering Stepped Martian Plateaus & Canyon Walls (Rich Reddish/Terracotta Shading) */}

          {/* Plateau 1 (Behind Billboard 1 - Massive Terraced Mesa, 480px tall) */}
          <path
            d="M50,700 L50,450 
               L70,360 L240,360 L260,450 
               L270,300 L410,300 L430,470 
               L450,700 Z"
            fill="url(#canyonMesaGrad1)"
          />
          {/* Strata Bands for Plateau 1 */}
          <line x1="70" y1="390" x2="240" y2="390" stroke="#ff8c69" strokeWidth="3.5" opacity="0.85" />
          <line x1="70" y1="420" x2="240" y2="420" stroke="#cc4458" strokeWidth="3" opacity="0.8" />
          <line x1="270" y1="340" x2="410" y2="340" stroke="#ffaa85" strokeWidth="4" opacity="0.9" />
          <line x1="270" y1="380" x2="410" y2="380" stroke="#cc4458" strokeWidth="3.5" opacity="0.85" />
          <line x1="270" y1="420" x2="410" y2="420" stroke="#ff8c69" strokeWidth="3" opacity="0.8" />

          {/* Plateau 2 (Behind Billboard 2 & 3 - Gigantic Colossal Canyon Wall & Stepped Buttes, 580px tall) */}
          <path
            d="M480,700 L480,480 
               L510,260 L780,260 L810,480 
               L830,210 L980,210 L1010,480 
               L1040,700 Z"
            fill="url(#canyonMesaGrad2)"
          />
          {/* Strata Bands for Plateau 2 */}
          <line x1="510" y1="300" x2="780" y2="300" stroke="#ff9e7d" strokeWidth="4.5" opacity="0.9" />
          <line x1="510" y1="350" x2="780" y2="350" stroke="#cc4458" strokeWidth="3.5" opacity="0.85" />
          <line x1="510" y1="400" x2="780" y2="400" stroke="#ffaa85" strokeWidth="4" opacity="0.9" />
          <line x1="510" y1="445" x2="780" y2="445" stroke="#cc4458" strokeWidth="3.5" opacity="0.8" />
          <line x1="830" y1="260" x2="980" y2="260" stroke="#ffaa85" strokeWidth="4.5" opacity="0.9" />
          <line x1="830" y1="310" x2="980" y2="310" stroke="#cc4458" strokeWidth="4" opacity="0.85" />
          <line x1="830" y1="370" x2="980" y2="370" stroke="#ff9e7d" strokeWidth="3.5" opacity="0.9" />
          <line x1="830" y1="430" x2="980" y2="430" stroke="#cc4458" strokeWidth="3" opacity="0.8" />

          {/* Plateau 3 (Behind Billboard 4 & 5 - Grand Martian Fortress Plateau & Canyon Chasm, 560px tall) */}
          <path
            d="M1060,700 L1060,490 
               L1090,280 L1280,280 L1310,480 
               L1330,230 L1520,230 L1545,490 
               L1550,700 Z"
            fill="url(#canyonMesaGrad1)"
          />
          {/* Strata Bands for Plateau 3 */}
          <line x1="1090" y1="325" x2="1280" y2="325" stroke="#ffaa85" strokeWidth="4" opacity="0.9" />
          <line x1="1090" y1="375" x2="1280" y2="375" stroke="#cc4458" strokeWidth="3.5" opacity="0.85" />
          <line x1="1090" y1="430" x2="1280" y2="430" stroke="#ff9e7d" strokeWidth="3" opacity="0.85" />
          <line x1="1330" y1="280" x2="1520" y2="280" stroke="#ffaa85" strokeWidth="4.5" opacity="0.95" />
          <line x1="1330" y1="330" x2="1520" y2="330" stroke="#cc4458" strokeWidth="4" opacity="0.85" />
          <line x1="1330" y1="390" x2="1520" y2="390" stroke="#ff9e7d" strokeWidth="3.5" opacity="0.9" />
          <line x1="1330" y1="445" x2="1520" y2="445" stroke="#cc4458" strokeWidth="3" opacity="0.8" />

          {/* Foreground Canyon Rim Wall */}
          <path
            d="M0,700 L0,530 L200,530 L340,500 L480,500 L620,540 L760,540 L890,490 L1040,490 L1180,530 L1320,530
               L1440,500 L1550,500 L1550,700 Z"
            fill="#380d2d"
            opacity="0.95"
          />

          <defs>
            <linearGradient id="canyonMesaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f58064" />
              <stop offset="25%" stopColor="#d13f63" />
              <stop offset="60%" stopColor="#7a1a3e" />
              <stop offset="100%" stopColor="#250418" />
            </linearGradient>
            <linearGradient id="canyonMesaGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff9f7a" />
              <stop offset="20%" stopColor="#ff7a59" />
              <stop offset="55%" stopColor="#aa2b52" />
              <stop offset="100%" stopColor="#300820" />
            </linearGradient>
          </defs>
        </svg>

        {/* 3. 5 HIGH-CONTRAST SOLID INDUSTRIAL METAL BILLBOARDS */}
        <div className="relative z-10 flex items-end gap-10 sm:gap-14 px-8 sm:px-12 min-w-max pb-2.5">
          {MARS_PROMOTIONS.map((promo, idx) => {
            const status = frameStatuses[idx];
            const assignedSrc = validation.assignedImages[idx];
            const custom = validation.customizations?.[idx] || {};
            const matchingPromo = MARS_PROMOTIONS.find((p) => p.filename === assignedSrc);
            const isScanningThis = currentScanningIndex === idx;
            const isThisZoomed = zoomedFrameIndex === idx;

            return (
              <div
                key={promo.id}
                ref={(el) => {
                  billboardRefs.current[idx] = el;
                }}
                onClick={(e) => handleBillboardClick(e, idx)}
                className={`flex flex-col items-center cursor-pointer transition-all duration-500 ease-out origin-bottom ${
                  isThisZoomed
                    ? 'scale-115 sm:scale-125 z-20 -translate-y-2'
                    : 'hover:-translate-y-1'
                }`}
                style={{
                  width: isThisZoomed ? '280px' : '240px',
                }}
              >
                {/* 1. TOP STAINLESS STEEL GOOSENECK FLOODLIGHTS */}
                <div className="w-full flex items-center justify-around px-5 mb-0.5 relative z-10">
                  <div className="flex flex-col items-center">
                    <div className="w-3.5 h-2 bg-gradient-to-b from-slate-300 to-slate-500 rounded-t-sm border border-slate-400 shadow" />
                    <div className={`w-3 h-1.5 rounded-b-sm ${status === 'scanning' ? 'bg-yellow-300 shadow-[0_0_12px_#fde047]' : 'bg-amber-100 shadow-[0_0_6px_#fef08a]'}`} />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-3.5 h-2 bg-gradient-to-b from-slate-300 to-slate-500 rounded-t-sm border border-slate-400 shadow" />
                    <div className={`w-3 h-1.5 rounded-b-sm ${status === 'scanning' ? 'bg-yellow-300 shadow-[0_0_12px_#fde047]' : 'bg-amber-100 shadow-[0_0_6px_#fef08a]'}`} />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-3.5 h-2 bg-gradient-to-b from-slate-300 to-slate-500 rounded-t-sm border border-slate-400 shadow" />
                    <div className={`w-3 h-1.5 rounded-b-sm ${status === 'scanning' ? 'bg-yellow-300 shadow-[0_0_12px_#fde047]' : 'bg-amber-100 shadow-[0_0_6px_#fef08a]'}`} />
                  </div>
                </div>

                {/* 2. SOLID BRUSHED METAL INDUSTRIAL BILLBOARD FRAME (100% NON-TRANSPARENT SOLID) */}
                <div
                  className={`w-full rounded-2xl p-2.5 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 border-4 ${
                    isScanningThis && status === 'scanning'
                      ? 'border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.95),inset_0_0_15px_rgba(250,204,21,0.25)]'
                      : isScanningThis && status === 'passed'
                      ? 'border-emerald-400 shadow-[0_0_35px_rgba(34,197,94,0.95),inset_0_0_15px_rgba(34,197,94,0.25)]'
                      : isScanningThis && status === 'failed'
                      ? 'border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.95),inset_0_0_15px_rgba(239,68,68,0.25)]'
                      : isThisZoomed
                      ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] ring-2 ring-amber-400/60'
                      : `border-slate-300/90 hover:border-white shadow-[0_10px_25px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.4)] ${getFrameBorderClass(custom.frameStyle)}`
                  }`}
                  style={{
                    height: isThisZoomed ? '175px' : '145px',
                    backgroundColor:
                      isScanningThis && status === 'scanning'
                        ? '#141824'
                        : isScanningThis && status === 'passed'
                        ? '#0d2218'
                        : isScanningThis && status === 'failed'
                        ? '#250e14'
                        : isThisZoomed
                        ? '#161a28'
                        : '#111522',
                    opacity: 1,
                  }}
                >
                  {/* Metallic Corner Rivets */}
                  <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-600 shadow-sm" />
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-600 shadow-sm" />
                  <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-600 shadow-sm" />
                  <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-600 shadow-sm" />

                  {/* Billboard Header ID Plaque */}
                  <div
                    className="absolute top-1.5 left-4 flex items-center gap-1.5 z-10 px-2 py-0.5 rounded border shadow-sm"
                    style={{
                      backgroundColor: '#030712',
                      borderColor: `${['#8B5CF6', '#0284C7', '#0D9488', '#D97706', '#E11D48'][idx]}60`,
                      opacity: 1,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: ['#8B5CF6', '#0284C7', '#0D9488', '#D97706', '#E11D48'][idx],
                        boxShadow: `0 0 6px ${['#8B5CF6', '#0284C7', '#0D9488', '#D97706', '#E11D48'][idx]}`,
                      }}
                    />
                    <span className="text-[9px] font-mono font-black text-slate-200 uppercase tracking-widest">
                      BILLBOARD {idx + 1}
                    </span>
                  </div>

                  {/* 3. MATTE CHARCOAL SCREEN DISPLAY AREA (SOLID 100% OPAQUE) */}
                  <div
                    className="w-full h-full rounded-xl flex flex-col items-center justify-center relative overflow-hidden border border-slate-700/80 shadow-inner"
                    style={{ backgroundColor: '#07090e', opacity: 1 }}
                  >
                    {assignedSrc ? (
                      /* Assigned Image Covers the Full Billboard Screen */
                      <div className="w-full h-full relative overflow-hidden flex items-center justify-center group/screen">
                        <div className={`w-full h-full relative overflow-hidden flex items-center justify-center ${getBorderShapeClass(custom.borderStyle)}`}>
                          <img
                            src={`/assets/planets/01_mars/level_2/solutions/${assignedSrc}`}
                            alt={assignedSrc}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/screen:scale-105"
                            style={{ filter: getFilterCss(custom.filter) }}
                          />
                        </div>

                        {/* Custom Caption Overlay */}
                        {(custom.caption || custom.headline) && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 pt-5 text-center z-10">
                            <span className="font-display font-black text-[11px] text-amber-300 uppercase tracking-wide drop-shadow truncate block">
                              {custom.caption || custom.headline}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : isThisZoomed ? (
                      /* Zoomed-in Revealed Clue Screen ONLY when no image is attached */
                      <div
                        className="w-full h-full rounded-lg border border-amber-400/60 flex flex-col items-center justify-center text-center p-3 overflow-hidden"
                        style={{ backgroundColor: '#0a0c12', opacity: 1 }}
                      >
                        <div className="flex items-center gap-1.5 text-amber-300 mb-1">
                          <span className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase text-amber-300 drop-shadow">
                            Hint:
                          </span>
                        </div>
                        <span className="text-xs sm:text-[13px] font-sans text-slate-100 leading-snug font-semibold px-2">
                          &ldquo;{promo.tagline}&rdquo;
                        </span>
                      </div>
                    ) : (
                      /* Default Screen (Clean No image yet over Blank Screen) */
                      <div
                        className="w-full h-full rounded-lg border border-slate-800 flex flex-col items-center justify-center text-center p-2.5"
                        style={{ backgroundColor: '#090b10', opacity: 1 }}
                      >
                        <span className="font-mono text-xs sm:text-sm text-slate-300 font-bold tracking-wide">
                          No image yet.
                        </span>
                        <span className="text-[9px] font-sans text-amber-300/80 mt-1 flex items-center gap-1">
                          <ZoomIn size={10} />
                          <span>Click to Zoom</span>
                        </span>
                      </div>
                    )}

                    {/* Active Scan Confirmation (Big Animated Checkmark - Clears on next billboard) */}
                    {isScanningThis && status === 'passed' && (
                      <div className="absolute inset-0 bg-emerald-950/75 backdrop-blur-xs flex flex-col items-center justify-center z-30 animate-in zoom-in-75 duration-200">
                        <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_30px_#22c55e] border-2 border-white">
                          <Check size={34} strokeWidth={3.5} />
                        </div>
                      </div>
                    )}

                    {/* Active Scan Deny (Big Animated X Mark - Clears on next billboard) */}
                    {isScanningThis && status === 'failed' && (
                      <div className="absolute inset-0 bg-red-950/75 backdrop-blur-xs flex flex-col items-center justify-center z-30 animate-in zoom-in-75 duration-200">
                        <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_30px_#ef4444] border-2 border-white">
                          <X size={34} strokeWidth={3.5} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. GALVANIZED STEEL CATWALK / WALKWAY GRILLE */}
                <div
                  className="w-[94%] h-2.5 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 border-x border-b border-slate-400 flex items-center justify-around px-2 shadow-md"
                >
                  <div className="w-1 h-full bg-slate-900/60" />
                  <div className="w-1 h-full bg-slate-900/60" />
                  <div className="w-1 h-full bg-slate-900/60" />
                  <div className="w-1 h-full bg-slate-900/60" />
                  <div className="w-1 h-full bg-slate-900/60" />
                </div>

                {/* 5. GALVANIZED STEEL TRUSS / LATTICE SCAFFOLDING LEGS */}
                <div className="w-full flex items-start justify-between px-6 -mt-0.5">
                  {/* Left Scaffolding Leg */}
                  <div className="flex flex-col items-center">
                    <div className="w-3.5 h-11 bg-gradient-to-b from-slate-400 via-slate-500 to-zinc-700 border-x border-slate-300 relative shadow">
                      <div className="absolute inset-x-0 top-2.5 h-0.5 bg-slate-200" />
                      <div className="absolute inset-x-0 top-6.5 h-0.5 bg-slate-200" />
                    </div>
                    {/* Heavy Steel Footing Plate with Bolting Anchors */}
                    <div className="w-8 h-2.5 bg-gradient-to-b from-slate-600 to-zinc-800 rounded-sm border border-slate-400 shadow-md -mt-0.5" />
                  </div>

                  {/* Right Scaffolding Leg */}
                  <div className="flex flex-col items-center">
                    <div className="w-3.5 h-11 bg-gradient-to-b from-slate-400 via-slate-500 to-zinc-700 border-x border-slate-300 relative shadow">
                      <div className="absolute inset-x-0 top-2.5 h-0.5 bg-slate-200" />
                      <div className="absolute inset-x-0 top-6.5 h-0.5 bg-slate-200" />
                    </div>
                    {/* Heavy Steel Footing Plate with Bolting Anchors */}
                    <div className="w-8 h-2.5 bg-gradient-to-b from-slate-600 to-zinc-800 rounded-sm border border-slate-400 shadow-md -mt-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded Styles for Bottom Martian Scrollbar and Floating Hover Animation */}
      <style>{`
        @keyframes floatTextHover {
          0% {
            transform: translate3d(0, 0px, 0);
          }
          50% {
            transform: translate3d(0, -8px, 0);
          }
          100% {
            transform: translate3d(0, 0px, 0);
          }
        }
        .mars-billboards-scrollbar::-webkit-scrollbar {
          height: 9px;
        }
        .mars-billboards-scrollbar::-webkit-scrollbar-track {
          background: #090414;
          border-top: 1px solid rgba(148, 163, 184, 0.2);
        }
        .mars-billboards-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
          border: 1px solid rgba(203, 213, 225, 0.4);
        }
        .mars-billboards-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #06b6d4;
        }
      `}</style>

      {/* VICTORY CELEBRATION (Emma G. & Penny G. appear) */}
      {showCelebration && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-gradient-to-b from-[#180d28] to-[#0a0414] border-3 border-emerald-400 rounded-3xl p-6 shadow-[0_0_50px_rgba(34,197,94,0.4)] text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
              <PartyPopper size={32} />
            </div>

            <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-1">
              All Billboards Restored!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200 font-sans mb-4">
              Emma G. &amp; Penny G. are celebrating! Every image link is perfectly configured.
            </p>

            <div className="flex items-center justify-center gap-4 bg-[#0d071b] border border-emerald-500/30 rounded-2xl p-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👩‍🚀</span>
                <span className="font-display font-bold text-xs text-white">Emma G.</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-2xl">👧‍🚀</span>
                <span className="font-display font-bold text-xs text-white">Penny G.</span>
              </div>
            </div>

            <div className="text-xs font-mono text-emerald-400 font-bold">
              ✓ 5 / 5 Images Linked Correctly
            </div>
          </div>
        </div>
      )}
      {/* DIAGNOSTIC SCAN RESULTS MODAL (Inside Simulation Window) */}
      {scanResult && scanResult.show && (
        <div
          onClick={() => setScanResult(null)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-gradient-to-b from-[#1c1033] via-[#120824] to-[#0a0416] border-2 border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(168,85,247,0.35)] text-center relative overflow-hidden flex flex-col items-center"
          >
            {/* Close Button */}
            <button
              onClick={() => setScanResult(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Report"
            >
              <X size={18} />
            </button>

            {/* Diagnostic Icon */}
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center mb-2.5 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <AlertCircle size={26} className="text-amber-400" />
            </div>

            <h3 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wider mb-1">
              Scan Diagnostic Report
            </h3>

            {/* Main Score Display */}
            <div className="my-2.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 w-full">
              <span className="font-display font-black text-xl sm:text-2xl text-amber-300 tracking-wide">
                You got {scanResult.passes}/5 correct
              </span>
            </div>

            {/* 5 Billboard Individual Results Breakdown */}
            <div className="w-full grid grid-cols-5 gap-1.5 my-3">
              {scanResult.frameResults.map((isCorrect, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-slate-300 mb-0.5">
                    B{idx + 1}
                  </span>
                  {isCorrect ? (
                    <Check size={16} strokeWidth={3} className="text-emerald-400" />
                  ) : (
                    <X size={16} strokeWidth={3} className="text-rose-400" />
                  )}
                </div>
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={() => setScanResult(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm font-sans tracking-wide shadow-lg shadow-purple-600/30 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>Proceed</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
