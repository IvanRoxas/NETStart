"use client";

import React, { useEffect, useState, useRef } from 'react';
import type { VenusLevel1Validation, TargetStyleData } from '@/lib/venus/venusLevel1Definitions';

interface VenusLevel1LabProps {
  validation: VenusLevel1Validation;
  isRunning: boolean;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
}

/**
 * Computes luminance-adaptive ring colors and bevel shadow so carpet details
 * remain sharp, distinct, and high-contrast regardless of what color is applied.
 */
function getCarpetDetailColors(colorStr: string | null | undefined) {
  let r = 51, g = 65, b = 85; // default #334155
  if (colorStr) {
    const s = colorStr.trim().toLowerCase();
    if (s.startsWith('#')) {
      const hex = s.slice(1);
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16) || 0;
        g = parseInt(hex[1] + hex[1], 16) || 0;
        b = parseInt(hex[2] + hex[2], 16) || 0;
      } else if (hex.length >= 6) {
        r = parseInt(hex.slice(0, 2), 16) || 0;
        g = parseInt(hex.slice(2, 4), 16) || 0;
        b = parseInt(hex.slice(4, 6), 16) || 0;
      }
    } else if (s.startsWith('rgb')) {
      const match = s.match(/\d+/g);
      if (match && match.length >= 3) {
        r = parseInt(match[0], 10) || 0;
        g = parseInt(match[1], 10) || 0;
        b = parseInt(match[2], 10) || 0;
      }
    } else if (s.startsWith('hsl')) {
      const match = s.match(/[\d.]+/g);
      if (match && match.length >= 3) {
        const h = parseFloat(match[0]);
        const sat = parseFloat(match[1]) / 100;
        const lig = parseFloat(match[2]) / 100;
        const a = sat * Math.min(lig, 1 - lig);
        const f = (n: number) => {
          const k = (n + h / 30) % 12;
          const color = lig - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          return Math.round(255 * color);
        };
        r = f(0);
        g = f(8);
        b = f(4);
      }
    } else {
      const named: Record<string, [number, number, number]> = {
        white: [255, 255, 255],
        black: [0, 0, 0],
        red: [239, 68, 68],
        green: [34, 197, 94],
        blue: [59, 130, 246],
        yellow: [234, 179, 8],
        cyan: [6, 182, 212],
        magenta: [217, 70, 239],
        orange: [249, 115, 22],
        purple: [168, 85, 247],
        pink: [236, 72, 153],
        gray: [100, 116, 139],
        grey: [100, 116, 139],
      };
      if (named[s]) {
        [r, g, b] = named[s];
      }
    }
  }

  // Relative perceived luminance (photometric weights)
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  const isLight = luminance > 135;

  return {
    isLight,
    ringStroke: isLight ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
    shadowStroke: isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.6)',
    medallionFill: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    accentDot: isLight ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.65)',
  };
}


export default function VenusLevel1Lab({
  validation,
  isRunning,
  onSimulationComplete,
}: VenusLevel1LabProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isBeamWarning, setIsBeamWarning] = useState(false);
  const [roomRestored, setRoomRestored] = useState(false);

  // Confirmed aura when scanner verifies each object
  const [confirmedItems, setConfirmedItems] = useState<Record<string, boolean>>({});

  // Warning pulse outline when scanner passes uncolored target
  const [warningItems, setWarningItems] = useState<Record<string, boolean>>({});

  // Hover state for interactive tooltips
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);

  // User inline caption editing
  const [inlineCaption, setInlineCaption] = useState<string | null>(null);
  const [isEditingCaption, setIsEditingCaption] = useState(false);

  const animFrameRef = useRef<number | null>(null);
  const checkedRef = useRef<Record<string, boolean>>({});

  // Reset simulation state when not running
  useEffect(() => {
    if (!isRunning) {
      setIsScanning(false);
      setScanProgress(0);
      setIsBeamWarning(false);
      setRoomRestored(false);
      setConfirmedItems({});
      setWarningItems({});
      checkedRef.current = {};
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  }, [isRunning]);

  // Trigger Scanning Sweep Animation when isRunning becomes true
  useEffect(() => {
    if (!isRunning) return;

    setIsScanning(true);
    setScanProgress(0);
    setIsBeamWarning(false);
    setConfirmedItems({});
    setWarningItems({});
    checkedRef.current = {};

    const duration = 2200; // 2.2 second smooth sweep across the room
    const startTime = performance.now();

    const animateSweep = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const percent = progress * 100;
      setScanProgress(percent);

      // Check items that are present in the sandbox as the beam passes:
      // Cabinet: ~10%
      if (percent >= 10 && validation.hasCabinet && !checkedRef.current.cabinet) {
        checkedRef.current.cabinet = true;
        if (validation.cabinetValid) {
          setConfirmedItems((prev) => ({ ...prev, cabinet: true }));
        } else {
          setWarningItems((prev) => ({ ...prev, cabinet: true }));
          setIsBeamWarning(true);
          setTimeout(() => setIsBeamWarning(false), 300);
        }
      }

      // Window: ~18%
      if (percent >= 18 && validation.hasWindow && !checkedRef.current.window) {
        checkedRef.current.window = true;
        if (validation.windowValid) {
          setConfirmedItems((prev) => ({ ...prev, window: true }));
        } else {
          setWarningItems((prev) => ({ ...prev, window: true }));
          setIsBeamWarning(true);
          setTimeout(() => setIsBeamWarning(false), 300);
        }
      }

      // Plant: ~24%
      if (percent >= 24 && validation.hasPlant && !checkedRef.current.plant) {
        checkedRef.current.plant = true;
        if (validation.plantValid) {
          setConfirmedItems((prev) => ({ ...prev, plant: true }));
        } else {
          setWarningItems((prev) => ({ ...prev, plant: true }));
          setIsBeamWarning(true);
          setTimeout(() => setIsBeamWarning(false), 300);
        }
      }

      // Carpet: ~34%
      if (percent >= 34 && (validation.hasCarpet || validation.hasBall) && !checkedRef.current.carpet) {
        checkedRef.current.carpet = true;
        if (validation.carpetValid || validation.ballValid) {
          setConfirmedItems((prev) => ({ ...prev, carpet: true, ball: true }));
        } else {
          setWarningItems((prev) => ({ ...prev, carpet: true, ball: true }));
          setIsBeamWarning(true);
          setTimeout(() => setIsBeamWarning(false), 300);
        }
      }

      // Office Chair: ~44%
      if (percent >= 40 && validation.hasChair && !checkedRef.current.chair) {
        checkedRef.current.chair = true;
        if (validation.chairValid) {
          setConfirmedItems((prev) => ({ ...prev, chair: true }));
        } else {
          setWarningItems((prev) => ({ ...prev, chair: true }));
          setIsBeamWarning(true);
          setTimeout(() => setIsBeamWarning(false), 300);
        }
      }

      // Caption Banner: ~52%
      if (percent >= 52 && validation.hasCaption && !checkedRef.current.caption) {
        checkedRef.current.caption = true;
        if (validation.captionValid) {
          setConfirmedItems((prev) => ({ ...prev, caption: true }));
        } else {
          setWarningItems((prev) => ({ ...prev, caption: true }));
          setIsBeamWarning(true);
          setTimeout(() => setIsBeamWarning(false), 300);
        }
      }

      // Main Computer: ~68%
      if (percent >= 64 && validation.hasComputer && !checkedRef.current.computer) {
        checkedRef.current.computer = true;
        if (validation.computerValid) {
          setConfirmedItems((prev) => ({ ...prev, computer: true }));
        } else {
          setWarningItems((prev) => ({ ...prev, computer: true }));
          setIsBeamWarning(true);
          setTimeout(() => setIsBeamWarning(false), 300);
        }
      }

      // Work Desk: ~76%
      if (percent >= 76 && validation.hasDesk && !checkedRef.current.desk) {
        checkedRef.current.desk = true;
        if (validation.deskValid) {
          setConfirmedItems((prev) => ({ ...prev, desk: true }));
        } else {
          setWarningItems((prev) => ({ ...prev, desk: true }));
          setIsBeamWarning(true);
          setTimeout(() => setIsBeamWarning(false), 300);
        }
      }

      // Walls: ~86%
      if (percent >= 86 && validation.hasWalls && !checkedRef.current.walls) {
        checkedRef.current.walls = true;
        if (validation.wallsValid) {
          setConfirmedItems((prev) => ({ ...prev, walls: true }));
        } else {
          setWarningItems((prev) => ({ ...prev, walls: true }));
          setIsBeamWarning(true);
          setTimeout(() => setIsBeamWarning(false), 300);
        }
      }

      // Floor: ~92%
      if (percent >= 92 && validation.hasFloor && !checkedRef.current.floor) {
        checkedRef.current.floor = true;
        if (validation.floorValid) {
          setConfirmedItems((prev) => ({ ...prev, floor: true }));
        } else {
          setWarningItems((prev) => ({ ...prev, floor: true }));
          setIsBeamWarning(true);
          setTimeout(() => setIsBeamWarning(false), 300);
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateSweep);
      } else {
        // Scan completed
        setIsScanning(false);
        if (validation.isAllStyled) {
          // Win condition: celebratory glow and sound
          setRoomRestored(true);
          setTimeout(() => {
            onSimulationComplete?.(true);
          }, 1500);
        } else {
          // Soft fail
          onSimulationComplete?.(
            false,
            validation.failErrorMessage || 'Some lab items are still missing styles!'
          );
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animateSweep);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, validation, onSimulationComplete]);

  // REAL-TIME ACTIVE COLORS & STYLES (No global grayscale filter, colors render immediately!)
  const styles = validation.styles || {};
  const computerColor = validation.computerColor || '#475569';
  const chairColor = validation.chairColor || '#334155';
  const deskColor = validation.deskColor || '#1e293b';
  const hasPlantColor = Boolean(validation.plantColor);
  const plantColor = validation.plantColor || '#2d3748';
  const cabinetColor = validation.cabinetColor || '#1e293b';
  const carpetColor = validation.carpetColor || validation.ballColor || '#334155';
  const carpetDetail = getCarpetDetailColors(carpetColor);
  const captionColor = validation.captionColor || '#0f172a';
  const wallsColor = validation.wallsColor || null;
  const floorColor = validation.floorColor || null;
  const windowColor = validation.windowColor || null;
  const currentCaption =
    inlineCaption ??
    (styles.caption?.textContent || validation.captionText || "PROFESSOR SPECTRUM'S LAB");

  // Helper to apply user border styles (thickness, style, color)
  const getBorderProps = (targetKey: string, fallbackColor: string, fallbackWidth: number = 1.5) => {
    const data = styles[targetKey];
    if (warningItems[targetKey]) {
      return { stroke: '#facc15', strokeWidth: 3, strokeDasharray: undefined };
    }
    if (confirmedItems[targetKey]) {
      return { stroke: '#22c55e', strokeWidth: 3, strokeDasharray: undefined };
    }
    if (hoveredTarget === targetKey) {
      return { stroke: '#ffffff', strokeWidth: 3, strokeDasharray: undefined };
    }
    if (data && data.borderWidth) {
      return {
        stroke: data.borderColor || '#00F0FF',
        strokeWidth: data.borderWidth,
        strokeDasharray:
          data.borderStyle === 'dashed' ? '6 4' : data.borderStyle === 'dotted' ? '2 3' : undefined,
      };
    }
    return {
      stroke: fallbackColor,
      strokeWidth: fallbackWidth,
      strokeDasharray: undefined,
    };
  };

  const getHoverStatus = () => {
    if (!hoveredTarget) return '';
    const st = styles[hoveredTarget];
    if (!st || !st.present) return `(Not in sandbox)`;
    const parts: string[] = [];
    if (st.color) parts.push(st.color);
    if (st.borderWidth) parts.push(`${st.borderWidth}px ${st.borderStyle || 'solid'} ${st.borderColor || ''}`);
    if (st.fontFamily) parts.push(st.fontFamily);
    if (st.fontSize) parts.push(`${st.fontSize}px`);
    return parts.length > 0 ? parts.join(' • ') : 'Unstyled Monochrome';
  };

  const hasAnyFurniture =
    validation.hasComputer ||
    validation.hasChair ||
    validation.hasDesk ||
    validation.hasPlant ||
    validation.hasCabinet ||
    validation.hasCarpet ||
    validation.hasBall ||
    validation.hasCaption;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[#09090b] select-none font-sans">
      {/* 2D Laboratory Vector Scene - Clean real-time rendering */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-all duration-1000 ease-in-out"
        style={{
          filter: roomRestored ? 'drop-shadow(0 0 35px rgba(56, 189, 248, 0.45))' : 'none',
        }}
      >
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Pure Monochromatic Wall & Floor Gradients (Default state before student colors them) */}
            <linearGradient id="labWall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="65%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#121215" />
            </linearGradient>

            <linearGradient id="labFloor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#141417" />
              <stop offset="25%" stopColor="#0f0f12" />
              <stop offset="100%" stopColor="#08080a" />
            </linearGradient>

            {/* Clean Monochromatic Window Glass (Default before styling) */}
            <linearGradient id="labWindowGlass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#27272a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#111113" stopOpacity="0.75" />
            </linearGradient>

            {/* Glowing warning filter for soft fail */}
            <filter id="warnGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#facc15" floodOpacity="0.9" />
            </filter>

            {/* Success confirmed flare */}
            <filter id="confirmGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#22c55e" floodOpacity="0.9" />
            </filter>

            {/* Hover highlight filter - Clean Monochromatic White Glow */}
            <filter id="hoverGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ffffff" floodOpacity="0.95" />
            </filter>
          </defs>

          {/* 1. Laboratory Room Architecture */}
          {/* Back Wall - Paintable with #walls */}
          <rect
            x="0"
            y="0"
            width="1000"
            height="420"
            fill={wallsColor || "url(#labWall)"}
            className="transition-colors duration-300 cursor-pointer"
            onMouseEnter={() => setHoveredTarget('walls')}
            onMouseLeave={() => setHoveredTarget(null)}
          />

          {/* Lab Floor with Tile Perspectives - Paintable with #floor */}
          <rect
            x="0"
            y="420"
            width="1000"
            height="230"
            fill={floorColor || "url(#labFloor)"}
            className="transition-colors duration-300 cursor-pointer"
            onMouseEnter={() => setHoveredTarget('floor')}
            onMouseLeave={() => setHoveredTarget(null)}
          />
          <line x1="0" y1="420" x2="1000" y2="420" stroke="#3f3f46" strokeOpacity="0.6" strokeWidth="1.5" />
          <line x1="120" y1="420" x2="0" y2="650" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1.2" />
          <line x1="320" y1="420" x2="180" y2="650" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1.2" />
          <line x1="500" y1="420" x2="500" y2="650" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1.2" />
          <line x1="680" y1="420" x2="820" y2="650" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1.2" />
          <line x1="880" y1="420" x2="1000" y2="650" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1.2" />
          <line x1="0" y1="520" x2="1000" y2="520" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />

          {/* Clean Observatory Window - Stylable with #window */}
          <g
            id="window"
            filter={
              warningItems.window
                ? 'url(#warnGlow)'
                : confirmedItems.window
                ? 'url(#confirmGlow)'
                : hoveredTarget === 'window'
                ? 'url(#hoverGlow)'
                : undefined
            }
            className="cursor-pointer transition-all duration-300"
            onMouseEnter={() => setHoveredTarget('window')}
            onMouseLeave={() => setHoveredTarget(null)}
          >
            <rect
              x="180"
              y="60"
              width="640"
              height="135"
              rx="16"
              fill="#121215"
              {...getBorderProps('window', '#3f3f46', 1.8)}
              className="transition-colors duration-300"
            />
            <rect
              x="188"
              y="68"
              width="624"
              height="119"
              rx="12"
              fill={windowColor || "url(#labWindowGlass)"}
              className="transition-colors duration-300"
            />
            <line x1="500" y1="68" x2="500" y2="187" stroke="#3f3f46" strokeWidth="1.5" />
          </g>

          {/* Empty room guidance when no furniture has been dragged yet */}
          {!hasAnyFurniture && (
            <g className="pointer-events-none">
              <rect
                x="180"
                y="248"
                width="640"
                height="62"
                rx="16"
                fill="#18181b"
                fillOpacity="0.94"
                stroke="#71717a"
                strokeWidth="1.8"
                strokeDasharray="7 7"
              />
              <text
                x="500"
                y="287"
                fill="#f4f4f5"
                fontSize="22"
                fontWeight="800"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                + Help Professor Spectrum decorate his lab!
              </text>
            </g>
          )}

          {/* ========================================================================= */}
          {/* TARGET: CABINET (#cabinet) - Left wall lab locker                          */}
          {/* ========================================================================= */}
          {validation.hasCabinet && (
            <g
              id="cabinet"
              filter={
                warningItems.cabinet
                  ? 'url(#warnGlow)'
                  : confirmedItems.cabinet
                  ? 'url(#confirmGlow)'
                  : hoveredTarget === 'cabinet'
                  ? 'url(#hoverGlow)'
                  : undefined
              }
              className={`transition-all duration-300 cursor-pointer ${warningItems.cabinet ? 'animate-pulse' : ''}`}
              onMouseEnter={() => setHoveredTarget('cabinet')}
              onMouseLeave={() => setHoveredTarget(null)}
            >
              {/* Cabinet Outer Body - Wider and positioned more to the right */}
              <rect
                x="85"
                y="190"
                width="165"
                height="235"
                rx="6"
                fill={cabinetColor}
                {...getBorderProps('cabinet', '#475569', 1.5)}
                className="transition-colors duration-300"
              />
              {/* Top Glass Display Chamber */}
              <rect x="93" y="200" width="149" height="105" rx="4" fill="#090d16" fillOpacity="0.75" stroke="#334155" strokeWidth="1" />
              <line x1="93" y1="235" x2="242" y2="235" stroke="#334155" strokeWidth="1.5" />
              <line x1="93" y1="270" x2="242" y2="270" stroke="#334155" strokeWidth="1.5" />
              {/* Research specimen vials & equipment - 100% Monochrome Initially */}
              <rect x="105" y="245" width="9" height="20" rx="2" fill="#cbd5e1" opacity="0.6" />
              <rect x="122" y="248" width="9" height="17" rx="2" fill="#94a3b8" opacity="0.6" />
              <rect x="139" y="245" width="9" height="20" rx="2" fill="#64748b" opacity="0.6" />
              <rect x="175" y="215" width="16" height="16" rx="2" fill="#e2e8f0" opacity="0.5" />
              <rect x="200" y="212" width="28" height="19" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              {/* Bottom Storage Drawers */}
              <rect x="93" y="315" width="149" height="48" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <line x1="145" y1="339" x2="190" y2="339" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="93" y="368" width="149" height="48" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <line x1="145" y1="392" x2="190" y2="392" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* TARGET: POTTED BUSH PLANT (#plant) - Floor left                            */}
          {/* ========================================================================= */}
          {validation.hasPlant && (
            <g
              id="plant"
              filter={
                warningItems.plant
                  ? 'url(#warnGlow)'
                  : confirmedItems.plant
                  ? 'url(#confirmGlow)'
                  : hoveredTarget === 'plant'
                  ? 'url(#hoverGlow)'
                  : undefined
              }
              className={`transition-all duration-300 cursor-pointer ${warningItems.plant ? 'animate-pulse' : ''}`}
              onMouseEnter={() => setHoveredTarget('plant')}
              onMouseLeave={() => setHoveredTarget(null)}
            >
              {/* Pot Base Floor Shadow */}
              <ellipse cx="290" cy="528" rx="28" ry="6" fill="#000000" fillOpacity="0.5" />

              {/* Bush Foliage - Monochrome grayscale initially, bursts into vibrant layered color when colored */}
              {/* Layer 1: Rear/Base foliage */}
              <ellipse
                cx="290"
                cy="430"
                rx="36"
                ry="28"
                fill={hasPlantColor ? plantColor : '#1e293b'}
                className="transition-colors duration-300"
              />
              {hasPlantColor && <ellipse cx="290" cy="430" rx="36" ry="28" fill="#000000" fillOpacity="0.25" />}

              {/* Layer 2 & 3: Left & Right mid foliage */}
              <ellipse
                cx="270"
                cy="415"
                rx="26"
                ry="24"
                fill={hasPlantColor ? plantColor : '#334155'}
                className="transition-colors duration-300"
              />
              {hasPlantColor && <ellipse cx="270" cy="415" rx="26" ry="24" fill="#000000" fillOpacity="0.12" />}

              <ellipse
                cx="310"
                cy="415"
                rx="26"
                ry="24"
                fill={hasPlantColor ? plantColor : '#334155'}
                className="transition-colors duration-300"
              />
              {hasPlantColor && <ellipse cx="310" cy="415" rx="26" ry="24" fill="#000000" fillOpacity="0.12" />}

              {/* Layer 4: Main upper canopy */}
              <ellipse
                cx="290"
                cy="395"
                rx="28"
                ry="24"
                fill={hasPlantColor ? plantColor : '#475569'}
                className="transition-colors duration-300"
              />

              {/* Layer 5 & 6: Top sunlit highlights */}
              <ellipse
                cx="285"
                cy="385"
                rx="16"
                ry="14"
                fill={hasPlantColor ? plantColor : '#64748b'}
                className="transition-colors duration-300"
              />
              {hasPlantColor && <ellipse cx="285" cy="385" rx="16" ry="14" fill="#ffffff" fillOpacity="0.2" />}

              <ellipse
                cx="302"
                cy="390"
                rx="14"
                ry="12"
                fill={hasPlantColor ? plantColor : '#94a3b8'}
                className="transition-colors duration-300"
              />
              {hasPlantColor && <ellipse cx="302" cy="390" rx="14" ry="12" fill="#ffffff" fillOpacity="0.32" />}

              {/* Ceramic Pot - Black and white neutral ceramic regardless of plantColor */}
              <polygon
                points="268,460 312,460 305,524 275,524"
                fill="#27272a"
                {...getBorderProps('plant', '#52525b', 1.5)}
                className="transition-colors duration-300"
              />
              {/* Pot cylindrical 3D shading (subtle left shadow & right highlight) */}
              <polygon points="268,460 284,460 281,524 275,524" fill="#000000" fillOpacity="0.22" />
              <polygon points="302,460 312,460 305,524 298,524" fill="#ffffff" fillOpacity="0.08" />

              {/* Pot Rim & Soil */}
              <ellipse cx="290" cy="460" rx="23" ry="5" fill="#3f3f46" stroke="#71717a" strokeWidth="1" />
              <ellipse cx="290" cy="460" rx="20" ry="4" fill="#18181b" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* TARGET: CARPET (#carpet) - Big Circular Ring Carpet                      */}
          {/* ========================================================================= */}
          {(validation.hasCarpet || validation.hasBall) && (
            <g
              id="carpet"
              filter={
                warningItems.carpet || warningItems.ball
                  ? 'url(#warnGlow)'
                  : confirmedItems.carpet || confirmedItems.ball
                  ? 'url(#confirmGlow)'
                  : hoveredTarget === 'carpet' || hoveredTarget === 'ball'
                  ? 'url(#hoverGlow)'
                  : undefined
              }
              className={`transition-all duration-300 cursor-pointer ${
                warningItems.carpet || warningItems.ball ? 'animate-pulse' : ''
              }`}
              onMouseEnter={() => setHoveredTarget('carpet')}
              onMouseLeave={() => setHoveredTarget(null)}
            >
              {/* Soft Ambient Floor Drop-Shadow under large circular rug */}
              <ellipse cx="500" cy="558" rx="288" ry="76" fill="#000000" fillOpacity="0.5" />

              {/* 1. Main Outer Circular Carpet Body (Takes User Color & User Border) */}
              <ellipse
                cx="500"
                cy="555"
                rx="280"
                ry="74"
                fill={carpetColor}
                {...getBorderProps(
                  styles.carpet?.present ? 'carpet' : 'ball',
                  '#475569',
                  2
                )}
                className="transition-colors duration-300"
              />

              {/* 2. Outer Inset Ring (Dual-layer for bevel depth and high contrast) */}
              <ellipse
                cx="500"
                cy="556"
                rx="228"
                ry="60.5"
                fill="none"
                stroke={carpetDetail.shadowStroke}
                strokeWidth="2.5"
                className="transition-colors duration-300"
              />
              <ellipse
                cx="500"
                cy="555"
                rx="228"
                ry="60.5"
                fill="none"
                stroke={carpetDetail.ringStroke}
                strokeWidth="2"
                className="transition-colors duration-300"
              />

              {/* 3. Center Medallion (Framed circular centerpiece with subtle tint) */}
              <ellipse
                cx="500"
                cy="556"
                rx="72"
                ry="19"
                fill="none"
                stroke={carpetDetail.shadowStroke}
                strokeWidth="2.5"
                className="transition-colors duration-300"
              />
              <ellipse
                cx="500"
                cy="555"
                rx="72"
                ry="19"
                fill={carpetDetail.medallionFill}
                stroke={carpetDetail.ringStroke}
                strokeWidth="2"
                className="transition-colors duration-300"
              />

              {/* 4. Center Core Accent */}
              <ellipse
                cx="500"
                cy="555"
                rx="20"
                ry="5.5"
                fill={carpetDetail.accentDot}
                className="transition-colors duration-300"
              />
            </g>
          )}

          {/* ========================================================================= */}
          {/* TARGET 3: WORK DESK (#desk) - Only visible when hasDesk                   */}
          {/* ========================================================================= */}
          {validation.hasDesk && (
            <g
              id="desk"
              filter={
                warningItems.desk
                  ? 'url(#warnGlow)'
                  : confirmedItems.desk
                  ? 'url(#confirmGlow)'
                  : hoveredTarget === 'desk'
                  ? 'url(#hoverGlow)'
                  : undefined
              }
              className={`transition-all duration-300 cursor-pointer ${warningItems.desk ? 'animate-pulse' : ''}`}
              onMouseEnter={() => setHoveredTarget('desk')}
              onMouseLeave={() => setHoveredTarget(null)}
            >
              {/* Table Surface */}
              <polygon
                points="560,400 920,400 950,440 540,440"
                fill={deskColor}
                {...getBorderProps('desk', '#64748b', 1.5)}
                className="transition-colors duration-300"
              />
              {/* Desk Front Panel / Drawers */}
              <rect
                x="540"
                y="440"
                width="410"
                height="80"
                fill={deskColor}
                {...getBorderProps('desk', '#64748b', 1.5)}
                className="transition-colors duration-300"
              />
              {/* Drawer handles */}
              <rect x="760" y="460" width="160" height="25" rx="3" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
              <line x1="820" y1="472" x2="860" y2="472" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
              <rect x="760" y="490" width="160" height="25" rx="3" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
              <line x1="820" y1="502" x2="860" y2="502" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />

              {/* Floor Contact Shadows under Desk Legs */}
              <ellipse cx="567" cy="591" rx="13" ry="3.5" fill="#000000" fillOpacity="0.45" />
              <ellipse cx="927" cy="591" rx="13" ry="3.5" fill="#000000" fillOpacity="0.45" />

              {/* Table Legs with Lineart */}
              <rect
                x="560"
                y="520"
                width="14"
                height="67"
                rx="1"
                fill="#334155"
                {...getBorderProps('desk', '#64748b', 1.5)}
                className="transition-colors duration-300"
              />
              <line x1="563" y1="522" x2="563" y2="585" stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.4" />
              {/* Left Foot Cap */}
              <rect
                x="557"
                y="586"
                width="20"
                height="5"
                rx="2"
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="1.5"
              />

              <rect
                x="920"
                y="520"
                width="14"
                height="67"
                rx="1"
                fill="#334155"
                {...getBorderProps('desk', '#64748b', 1.5)}
                className="transition-colors duration-300"
              />
              <line x1="923" y1="522" x2="923" y2="585" stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.4" />
              {/* Right Foot Cap */}
              <rect
                x="917"
                y="586"
                width="20"
                height="5"
                rx="2"
                fill="#1e293b"
                stroke="#64748b"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* ========================================================================= */}
          {/* TARGET 1: MAIN COMPUTER (#computer) - Mounted on Desk Surface             */}
          {/* ========================================================================= */}
          {validation.hasComputer && (
            <g
              id="computer"
              filter={
                warningItems.computer
                  ? 'url(#warnGlow)'
                  : confirmedItems.computer
                  ? 'url(#confirmGlow)'
                  : hoveredTarget === 'computer'
                  ? 'url(#hoverGlow)'
                  : undefined
              }
              className={`transition-all duration-300 cursor-pointer ${warningItems.computer ? 'animate-pulse' : ''}`}
              onMouseEnter={() => setHoveredTarget('computer')}
              onMouseLeave={() => setHoveredTarget(null)}
            >
              {/* Tabletop contact shadows */}
              <ellipse cx="670" cy="415" rx="32" ry="4" fill="#000000" fillOpacity="0.45" />
              <ellipse cx="822" cy="415" rx="44" ry="4" fill="#000000" fillOpacity="0.45" />

              {/* --- 1. MONITOR --- */}
              {/* Stand Base & Stem */}
              <rect x="662" y="375" width="16" height="38" fill="#64748b" />
              <ellipse cx="670" cy="413" rx="28" ry="6" fill="#334155" />

              {/* Monitor Outer Casing */}
              <rect
                x="585"
                y="250"
                width="170"
                height="125"
                rx="8"
                fill={computerColor}
                {...getBorderProps('computer', '#94a3b8', 1.5)}
                className="transition-colors duration-300"
              />
              {/* Screen Glass */}
              <rect x="595" y="258" width="150" height="100" rx="5" fill="#090d16" stroke="#334155" strokeWidth="1" />
              {/* Screen Display - 100% Monochrome Initially */}
              <text x="608" y="278" fill="#e2e8f0" fontSize="10" fontFamily="monospace" fontWeight="bold">VENUS OS</text>
              <text x="608" y="295" fill="#94a3b8" fontSize="9" fontFamily="monospace">&gt; CSS Engine: Active</text>
              <text x="608" y="312" fill={validation.isComputerStyled ? (validation.computerColor || '#e2e8f0') : '#64748b'} fontSize="9" fontFamily="monospace">
                {validation.isComputerStyled ? `&gt; ${validation.computerColor}` : '&gt; Monochrome...'}
              </text>
              <line x1="608" y1="324" x2="732" y2="324" stroke="#334155" strokeWidth="1" />
              <circle cx="670" cy="368" r="2.5" fill={validation.isComputerStyled ? (validation.computerColor || '#ffffff') : '#475569'} />

              {/* Keyboard & Mouse on Desk */}
              <rect x="605" y="418" width="85" height="12" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <ellipse cx="715" cy="424" rx="6" ry="9" fill="#1e293b" stroke="#475569" strokeWidth="1" />

              {/* --- 2. PC TOWER UNIT --- */}
              <rect x="788" y="412" width="14" height="4" rx="1" fill="#1e293b" />
              <rect x="842" y="412" width="14" height="4" rx="1" fill="#1e293b" />
              <rect
                x="780"
                y="260"
                width="84"
                height="153"
                rx="6"
                fill={computerColor}
                {...getBorderProps('computer', '#94a3b8', 1.5)}
                className="transition-colors duration-300"
              />
              <rect x="786" y="266" width="72" height="141" rx="4" fill="#090d16" stroke="#334155" strokeWidth="1" />
              <circle cx="822" cy="282" r="5" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
              <circle cx="822" cy="282" r="2.5" fill={validation.isComputerStyled ? (validation.computerColor || '#ffffff') : '#475569'} />
              <rect x="806" y="296" width="10" height="3" fill="#64748b" />
              <rect x="828" y="296" width="10" height="3" fill="#64748b" />
              <line x1="796" y1="325" x2="848" y2="325" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="796" y1="345" x2="848" y2="345" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="796" y1="365" x2="848" y2="365" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="796" y1="385" x2="848" y2="385" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* TARGET 2: OFFICE CHAIR (#chair) - Only visible when hasChair              */}
          {/* ========================================================================= */}
          {validation.hasChair && (
            <g
              id="chair"
              filter={
                warningItems.chair
                  ? 'url(#warnGlow)'
                  : confirmedItems.chair
                  ? 'url(#confirmGlow)'
                  : hoveredTarget === 'chair'
                  ? 'url(#hoverGlow)'
                  : undefined
              }
              className={`transition-all duration-300 cursor-pointer ${warningItems.chair ? 'animate-pulse' : ''}`}
              onMouseEnter={() => setHoveredTarget('chair')}
              onMouseLeave={() => setHoveredTarget(null)}
            >
              {/* Chair Base */}
              <ellipse cx="440" cy="580" rx="36" ry="8" fill="#0f172a" />
              <line x1="440" y1="530" x2="440" y2="580" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
              <circle cx="410" cy="582" r="4" fill="#334155" />
              <circle cx="440" cy="585" r="4" fill="#334155" />
              <circle cx="470" cy="582" r="4" fill="#334155" />

              {/* Cushion */}
              <rect
                x="380"
                y="495"
                width="120"
                height="35"
                rx="10"
                fill={chairColor}
                {...getBorderProps('chair', '#64748b', 1.5)}
                className="transition-colors duration-300"
              />

              {/* Backrest */}
              <rect
                x="395"
                y="370"
                width="90"
                height="115"
                rx="14"
                fill={chairColor}
                {...getBorderProps('chair', '#64748b', 1.5)}
                className="transition-colors duration-300"
              />

              {/* Armrests */}
              <path d="M 375,445 L 375,490 L 390,490" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 505,445 L 505,490 L 490,490" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* TARGET: STYLABLE CAPTION BANNER (#caption)                                */}
          {/* Showcases Typography (font-family, font-size, color) & borders!          */}
          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* TARGET: CAPTION BANNER (#caption) - Overhead top marquee banner (Editable) */}
          {/* ========================================================================= */}
          {validation.hasCaption && (
            <g
              id="caption"
              filter={
                warningItems.caption
                  ? 'url(#warnGlow)'
                  : confirmedItems.caption
                  ? 'url(#confirmGlow)'
                  : hoveredTarget === 'caption'
                  ? 'url(#hoverGlow)'
                  : undefined
              }
              className={`transition-all duration-300 cursor-pointer ${warningItems.caption ? 'animate-pulse' : ''}`}
              onMouseEnter={() => setHoveredTarget('caption')}
              onMouseLeave={() => setHoveredTarget(null)}
              onClick={() => setIsEditingCaption(true)}
            >
              {/* Banner Background */}
              <rect
                x="260"
                y="10"
                width="480"
                height="40"
                rx="10"
                fill={captionColor}
                {...getBorderProps('caption', '#a855f7', 1.5)}
                className="transition-all duration-300"
              />
              {/* Banner Typography Text */}
              <text
                x="500"
                y={35 + ((styles.caption?.fontSize || 16) - 16) * 0.3}
                fill={styles.caption?.textColor || '#ffffff'}
                fontFamily={styles.caption?.fontFamily || 'monospace'}
                fontSize={styles.caption?.fontSize || 16}
                fontWeight="bold"
                letterSpacing="0.04em"
                textAnchor="middle"
                className="transition-all duration-300"
              >
                {currentCaption}
              </text>
            </g>
          )}
        </svg>

        {/* Inline Caption Editor Modal / Popup */}
        {isEditingCaption && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-zinc-900/95 border border-white/40 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md">
            <input
              type="text"
              value={inlineCaption ?? currentCaption}
              onChange={(e) => setInlineCaption(e.target.value)}
              className="bg-zinc-800 text-white font-bold font-mono text-xs px-3 py-1.5 rounded-lg border border-zinc-700 focus:outline-none focus:border-white w-64"
              placeholder="Enter caption..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingCaption(false);
              }}
            />
            <button
              onClick={() => setIsEditingCaption(false)}
              className="px-3 py-1.5 bg-white text-zinc-900 font-bold text-xs rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* 2. Sweeping Scanner Beam Line */}
        {isScanning && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30"
            style={{
              left: `${scanProgress}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {/* Glowing laser line */}
            <div
              className={`w-1.5 h-full transition-colors duration-150 ${
                isBeamWarning
                  ? 'bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-500 shadow-[0_0_28px_#f59e0b]'
                  : 'bg-gradient-to-b from-cyan-300 via-teal-200 to-cyan-400 shadow-[0_0_24px_#38bdf8]'
              }`}
            />
            {/* Sweep trail glow */}
            <div
              className={`absolute top-0 bottom-0 right-0 w-16 pointer-events-none transition-colors duration-150 ${
                isBeamWarning
                  ? 'bg-gradient-to-r from-transparent to-amber-500/25'
                  : 'bg-gradient-to-r from-transparent to-cyan-400/20'
              }`}
            />
          </div>
        )}
      </div>

      {/* Hover Information Tooltip - Monochromatic White/Black High Contrast */}
      {hoveredTarget && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-lg bg-zinc-900/95 border border-white/50 backdrop-blur-md shadow-2xl flex items-center gap-2 pointer-events-none animate-fadeIn">
          <span className="text-xs font-mono font-bold text-white">
            #{hoveredTarget}
          </span>
          <span className="text-xs font-mono text-zinc-300">
            {getHoverStatus()}
          </span>
        </div>
      )}
    </div>
  );
}
