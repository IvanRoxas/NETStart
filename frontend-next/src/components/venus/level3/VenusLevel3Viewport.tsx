"use client";

import React, { useState } from 'react';
import {
  Venus3ParsedStyles,
  Venus3SectorId,
  Venus3TabId,
  VenusLevel3Validation,
} from '@/lib/venus/venusLevel3Definitions';

export type Venus3ScanResult = 'pass' | 'fail' | null;

interface VenusLevel3ViewportProps {
  validation?: VenusLevel3Validation;
  activeSector: Venus3TabId;
  onSelectSector: (sector: Venus3TabId) => void;
  solvedSectors: Record<Venus3SectorId, boolean>;
  isRunning?: boolean;
  sectorStyles?: Venus3ParsedStyles;
  linkedStylesheets?: string[];
  failedSectors?: Venus3SectorId[];
  inlineStyles?: { tower?: string; background?: string };
  scanPhase?: Venus3SectorId | 'done' | null;
  scanResults?: Record<Venus3SectorId, Venus3ScanResult>;
}

/**
 * Creates an SVG path for an annular sector (pie slice with an inner cutout radius).
 */
function createAnnularSectorPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startRad = toRad(startAngleDeg);
  const endRad = toRad(endAngleDeg);

  const x1 = cx + rOuter * Math.cos(startRad);
  const y1 = cy + rOuter * Math.sin(startRad);
  const x2 = cx + rOuter * Math.cos(endRad);
  const y2 = cy + rOuter * Math.sin(endRad);

  const x3 = cx + rInner * Math.cos(endRad);
  const y3 = cy + rInner * Math.sin(endRad);
  const x4 = cx + rInner * Math.cos(startRad);
  const y4 = cy + rInner * Math.sin(startRad);

  const angleDiff = (endAngleDeg - startAngleDeg + 360) % 360;
  const largeArcFlag = angleDiff > 180 ? 1 : 0;

  return [
    `M ${x1.toFixed(3)} ${y1.toFixed(3)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`,
    `L ${x3.toFixed(3)} ${y3.toFixed(3)}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x4.toFixed(3)} ${y4.toFixed(3)}`,
    'Z',
  ].join(' ');
}

export interface SvgBorderProps {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

function getBorderProps(
  borderJson?: string,
  fallbackStroke?: string,
  fallbackWidth?: number,
  fallbackDash?: string
): SvgBorderProps {
  if (borderJson) {
    try {
      const parsed = JSON.parse(borderJson);
      if (parsed && typeof parsed.thickness === 'number') {
        return {
          stroke: parsed.color || '#F59E0B',
          strokeWidth: parsed.thickness,
          strokeDasharray:
            parsed.style === 'dashed' ? '8 6' : parsed.style === 'dotted' ? '3 4' : undefined,
        };
      }
    } catch (e) {}
  }
  return {
    stroke: fallbackStroke,
    strokeWidth: fallbackWidth,
    strokeDasharray: fallbackDash,
  };
}

export default function VenusLevel3Viewport({
  activeSector,
  onSelectSector,
  solvedSectors,
  isRunning = false,
  sectorStyles,
  linkedStylesheets = [],
  failedSectors = [],
  inlineStyles = {},
  scanPhase = null,
  scanResults = { alpha: null, beta: null, gamma: null },
}: VenusLevel3ViewportProps) {
  const isScanning = scanPhase !== null;
  const [hoveredSector, setHoveredSector] = useState<Venus3TabId | null>(null);

  const isPieOverview = activeSector === 'main';

  const hasInlineBg = Boolean(inlineStyles?.background);
  const hasInlineTower = Boolean(inlineStyles?.tower);
  const hubBgColor = inlineStyles?.background || '#ab421f';
  const hubTowerColor = inlineStyles?.tower || '#38bdf8';

  // Dynamic Group Shading Palette Extracted from Player CSS
  const alphaStyles = sectorStyles?.alpha || {};
  const betaStyles = sectorStyles?.beta || {};
  const gammaStyles = sectorStyles?.gamma || {};

  // Sector 1: Clouds and Airships in the Skies of Venus
  const s1SkyBase = alphaStyles['#sky'] || '#55244e';
  const s1TowerBase = alphaStyles['#tower'] || '#64748b';
  const s1RoofBase = alphaStyles['#tower-roof'] || '#facc15';
  const s1CloudsBase = alphaStyles['#clouds'] || '#f59e0b';
  const s1AirshipsBase = alphaStyles['#airships'] || '#f8fafc';

  // Sector 2: Crystal Caves and Subterranean Plants
  const s2CaveWallsBase = betaStyles['#cave-walls'] || '#200f38';
  const s2RockFormationsBase = betaStyles['#stalactites, #stalagmites'] || betaStyles['#stalactites'] || betaStyles['#stalagmites'] || '#4a237d';
  const s2StalactitesBase = s2RockFormationsBase;
  const s2StalagmitesBase = s2RockFormationsBase;
  const s2RiverBase = betaStyles['#river'] || '#0284c7';
  const s2GemsBase = betaStyles['#crystal-gems'] || '#a855f7';
  const s2PlantsBase = betaStyles['#plants'] || '#10b981';

  // Sector 3: Desert Plains and Impact Basins in Venus
  const s3SkyBase = gammaStyles['#sky'] || gammaStyles['rect'] || '#250e18';
  const s3TerrainBase = gammaStyles['#mountains, #plateaus'] || gammaStyles['#mountains'] || gammaStyles['#plateaus'] || '#581e2b';
  const s3MountainsBase = s3TerrainBase;
  const s3PlateausBase = s3TerrainBase;
  const s3RocksBase = gammaStyles['#rock-formations'] || '#8c303f';
  const s3CratersBase = gammaStyles['#craters'] || '#38141d';
  const s3VegBase = gammaStyles['#oasis-vegetation'] || '#059669';

  // Grouped multi-selector color indicators
  const isS2RockFormationsColored = Boolean(solvedSectors.beta || betaStyles['#stalactites, #stalagmites'] || betaStyles['#stalactites'] || betaStyles['#stalagmites']);
  const isS2StalactitesColored = isS2RockFormationsColored;
  const isS2StalagmitesColored = isS2RockFormationsColored;
  const isS3TerrainColored = Boolean(solvedSectors.gamma || gammaStyles['#mountains, #plateaus'] || gammaStyles['#mountains'] || gammaStyles['#plateaus']);
  const isS3MountainsColored = isS3TerrainColored;
  const isS3PlateausColored = isS3TerrainColored;

  const linked = linkedStylesheets || sectorStyles?.linkedStylesheets || [];
  const isAlphaLinked = linked.includes('alpha.css');
  const isBetaLinked = linked.includes('beta.css');
  const isGammaLinked = linked.includes('gamma.css');

  const hasAlphaStyles = Object.keys(alphaStyles).length > 0;
  const hasBetaStyles = Object.keys(betaStyles).length > 0;
  const hasGammaStyles = Object.keys(gammaStyles).length > 0;

  // A dead zone is restored if solved OR both styled and linked into the AstroLink!
  const isAlphaRestored = Boolean(solvedSectors.alpha || (hasAlphaStyles && isAlphaLinked));
  const isBetaRestored = Boolean(solvedSectors.beta || (hasBetaStyles && isBetaLinked));
  const isGammaRestored = Boolean(solvedSectors.gamma || (hasGammaStyles && isGammaLinked));

  // In overview pie: only show color if restored into AstroLink (or solved in progression).
  // In individual sector zoomed view: show color if styles exist (CSS prototype editing).
  const isAlphaColored = isPieOverview ? isAlphaRestored : (hasAlphaStyles || solvedSectors.alpha);
  const isBetaColored = isPieOverview ? isBetaRestored : (hasBetaStyles || solvedSectors.beta);
  const isGammaColored = isPieOverview ? isGammaRestored : (hasGammaStyles || solvedSectors.gamma);

  const isAllRestored = isAlphaRestored && isBetaRestored && isGammaRestored;

  const isAlphaFailed = Boolean(failedSectors?.includes('alpha'));
  const isBetaFailed = Boolean(failedSectors?.includes('beta'));
  const isGammaFailed = Boolean(failedSectors?.includes('gamma'));

  // Pie geometry
  const cx = 250;
  const cy = 250;
  const rOuter = 248;
  const rInner = 50;

  const sectorGeometry: Record<
    Venus3SectorId,
    { startAngle: number; endAngle: number }
  > = {
    alpha: { startAngle: 150, endAngle: 270 },
    beta: { startAngle: 270, endAngle: 390 },
    gamma: { startAngle: 30, endAngle: 150 },
  };

  const alphaPath = createAnnularSectorPath(cx, cy, rInner, rOuter, sectorGeometry.alpha.startAngle, sectorGeometry.alpha.endAngle);
  const betaPath = createAnnularSectorPath(cx, cy, rInner, rOuter, sectorGeometry.beta.startAngle, sectorGeometry.beta.endAngle);
  const gammaPath = createAnnularSectorPath(cx, cy, rInner, rOuter, sectorGeometry.gamma.startAngle, sectorGeometry.gamma.endAngle);

  // Geometric centers for hover badges on pie slices
  const badgePositions = {
    alpha: { x: 120, y: 170 },
    beta: { x: 380, y: 170 },
    gamma: { x: 250, y: 405 },
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center select-none font-sans bg-[#0c0617]">
      {/* Scan animation keyframes */}
      <style>{`
        @keyframes scanPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes scanSweep {
          0%, 100% { opacity: 0.3; stroke-dashoffset: 0; }
          50% { opacity: 0.8; stroke-dashoffset: 12; }
        }
      `}</style>
      {/* ===================================================================== */}
      {/* 1. OVERVIEW: THE 3-WAY RADIAL PIE CHART VIEW                          */}
      {/* ===================================================================== */}
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center p-0 overflow-hidden"
        style={{
          opacity: isPieOverview ? 1 : 0,
          transform: isPieOverview ? 'scale(1.15)' : 'scale(1.22)',
          pointerEvents: isPieOverview ? 'auto' : 'none',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
        }}
      >
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full max-w-full max-h-full 2xl:max-w-[960px] 2xl:max-h-[960px] aspect-square object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] transition-transform duration-300"
        >
          <defs>
            {/* Sector Clip Paths */}
            <clipPath id="clip-alpha">
              <path d={alphaPath} />
            </clipPath>
            <clipPath id="clip-beta">
              <path d={betaPath} />
            </clipPath>
            <clipPath id="clip-gamma">
              <path d={gammaPath} />
            </clipPath>

            {/* Central AstroLink Hub Desert Clip */}
            <clipPath id="clip-hub-desert">
              <circle cx={cx} cy={cy} r={rInner} />
            </clipPath>

            {/* Gradients for AstroLink Tower */}
            <linearGradient id="tSkyBlue" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <radialGradient id="tOrb" cx="42%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>
            <linearGradient id="tGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>

            {/* Hub Desert Grayscale / Monochrome Gradient for unstyled dead zone */}
            <linearGradient id="hubSkyMono" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="60%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#3f3f46" />
            </linearGradient>

            {/* Hub Desert Gradient */}
            <linearGradient id="hubSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2c140d" />
              <stop offset="60%" stopColor="#4f2012" />
              <stop offset="100%" stopColor="#783119" />
            </linearGradient>

            {/* Sector 1 Pie Sky Gradient */}
            <linearGradient id="alphaPieSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s1SkyBase} />
              <stop offset="100%" stopColor={s1SkyBase} style={{ filter: 'brightness(0.7)' }} />
            </linearGradient>

            {/* Sector 2 Pie Cavern Gradient */}
            <linearGradient id="betaPieCavern" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={s2CaveWallsBase} style={{ filter: 'brightness(0.6)' }} />
              <stop offset="100%" stopColor={s2CaveWallsBase} />
            </linearGradient>

            {/* Sector 3 Pie Desert Sky Gradient */}
            <linearGradient id="gammaPieSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s3SkyBase} />
              <stop offset="100%" stopColor={s3SkyBase} style={{ filter: 'brightness(0.7)' }} />
            </linearGradient>

            {/* Red Alert Glow Filter for Incomplete / Unrestored Dead Zones */}
            <filter id="redAlertGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Green Glow Filter for Passed Sectors */}
            <filter id="greenScanGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Red Glow Filter for Failed Sectors */}
            <filter id="redScanGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* =================================================================== */}
          {/* SECTOR 1 (Upper-Left: Skies of Venus - Zone Alpha)                  */}
          {/* =================================================================== */}
          <g
            className={isScanning || isRunning ? 'cursor-default' : 'cursor-pointer'}
            onClick={() => !isScanning && !isRunning && onSelectSector('alpha')}
            onMouseEnter={() => !isScanning && !isRunning && setHoveredSector('alpha')}
            onMouseLeave={() => setHoveredSector(null)}
          >
            <g clipPath="url(#clip-alpha)">
              <g
                style={{
                  filter: `${isAlphaColored ? '' : 'grayscale(100%) '}${
                    hoveredSector === 'alpha' ? 'blur(3px) brightness(0.7)' : 'brightness(0.92)'
                  }`,
                  transition: 'filter 0.3s ease',
                }}
              >
                {/* Sky covering the full upper-left sector */}
                <rect x="0" y="0" width="260" height="390" fill={isAlphaColored ? 'url(#alphaPieSky)' : '#111827'} />
                {/* Distant Cloud Deck 1 (billowy upper cloud ridge) */}
                <path
                  d="M 0,210 Q 70,155 140,180 Q 200,150 255,175 L 255,390 L 0,390 Z"
                  fill={isAlphaColored ? (alphaStyles['#clouds'] || '#fef08a') : '#cbd5e1'}
                  opacity="0.85"
                />

                {/* Mid Cloud Deck 2 (billowy mid cloud bank) */}
                <path
                  d="M 0,260 Q 80,210 155,230 Q 210,200 255,230 L 255,390 L 0,390 Z"
                  fill={isAlphaColored ? (alphaStyles['#clouds'] || '#fcd34d') : '#9ca3af'}
                  opacity="0.9"
                />

                {/* Observatory Tower on mountain crest */}
                <g transform="translate(85, 195)">
                  <rect x="-3" y="-18" width="6" height="20" rx="1.5" fill={isAlphaColored && alphaStyles['#tower'] ? s1TowerBase : '#64748b'} />
                  <path d="M -7,-18 Q 0,-28 7,-18 Z" fill={isAlphaColored && alphaStyles['#tower-roof'] ? s1RoofBase : '#facc15'} />
                  <circle cx="0" cy="-28" r="2" fill="#38bdf8" />
                </g>

                {/* Billowing Upper Clouds filling upper space */}
                <path
                  d="M 110,45 Q 135,20 170,28 Q 205,15 230,40 Q 220,70 170,72 Q 120,68 110,45 Z"
                  fill={isAlphaColored && alphaStyles['#clouds'] ? s1CloudsBase : '#fef08a'}
                  opacity="0.85"
                />
                <path
                  d="M 25,85 Q 45,62 75,68 Q 105,52 130,72 Q 110,98 50,102 Q 25,102 25,85 Z"
                  fill={isAlphaColored && alphaStyles['#clouds'] ? s1CloudsBase : '#fcd34d'}
                  opacity="0.9"
                />

                {/* Lower Atmospheric Cloud Blanket covering bottom valley */}
                <path
                  d="M 0,310 Q 75,265 145,290 Q 205,265 255,295 L 255,390 L 0,390 Z"
                  fill={isAlphaColored && alphaStyles['#clouds'] ? s1CloudsBase : '#f59e0b'}
                  opacity="0.85"
                />

                {/* Airships spread across the sector space */}
                {/* 1. Flagship Cruiser Blimp (Main focus in open mid-sky) */}
                <g transform="translate(140, 140) scale(0.68)">
                  <ellipse cx="0" cy="0" rx="44" ry="16" fill={isAlphaColored && alphaStyles['#airships'] ? s1AirshipsBase : '#f8fafc'} stroke="#64748b" strokeWidth="1.5" />
                  <path d="M -36,0 Q 0,5 36,0" fill="none" stroke={isAlphaColored ? '#f97316' : '#4b5563'} strokeWidth="3" />
                  <path d="M -35,-4 Q -48,-14 -40,-2 Z" fill={isAlphaColored && alphaStyles['#airships'] ? s1AirshipsBase : '#e2e8f0'} />
                  <path d="M -35,4 Q -48,14 -40,2 Z" fill={isAlphaColored && alphaStyles['#airships'] ? s1AirshipsBase : '#e2e8f0'} />
                  <rect x="-18" y="14" width="36" height="8" rx="3.5" fill={isAlphaColored ? '#0284c7' : '#374151'} />
                  <circle cx="-9" cy="18" r="1.5" fill="#fef08a" />
                  <circle cx="0" cy="18" r="1.5" fill="#fef08a" />
                  <circle cx="9" cy="18" r="1.5" fill="#fef08a" />
                </g>

                {/* 2. High-Altitude Scout Blimp */}
                <g transform="translate(195, 65) scale(0.42)">
                  <ellipse cx="0" cy="0" rx="32" ry="12" fill={isAlphaColored && alphaStyles['#airships'] ? s1AirshipsBase : '#e2e8f0'} stroke="#64748b" strokeWidth="1.2" />
                  <path d="M -26,0 Q 0,4 26,0" fill="none" stroke={isAlphaColored ? '#38bdf8' : '#4b5563'} strokeWidth="2.5" />
                  <rect x="-12" y="10" width="24" height="6" rx="2.5" fill={isAlphaColored ? '#f59e0b' : '#374151'} />
                </g>

                {/* 3. Lower Valley Patrol Blimp */}
                <g transform="translate(85, 275) scale(0.48)">
                  <ellipse cx="0" cy="0" rx="32" ry="12" fill={isAlphaColored && alphaStyles['#airships'] ? s1AirshipsBase : '#f8fafc'} stroke="#64748b" strokeWidth="1.2" />
                  <path d="M -26,0 Q 0,4 26,0" fill="none" stroke={isAlphaColored ? '#38bdf8' : '#4b5563'} strokeWidth="2.5" />
                  <rect x="-12" y="10" width="24" height="6" rx="2.5" fill={isAlphaColored ? '#0284c7' : '#374151'} />
                </g>
              </g>

              {/* Tint overlay on hover */}
              <rect
                x="0"
                y="0"
                width="500"
                height="500"
                fill="rgba(10, 6, 22, 0.45)"
                style={{
                  opacity: hoveredSector === 'alpha' ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                }}
              />
            </g>

            {/* Wedge Border Highlight / Red Alert Strobe */}
            <path
              d={alphaPath}
              fill={isAlphaFailed ? 'rgba(239, 68, 68, 0.35)' : 'transparent'}
              stroke={
                isAlphaFailed
                  ? '#ef4444'
                  : activeSector === 'alpha'
                    ? '#38bdf8'
                    : hoveredSector === 'alpha'
                      ? 'rgba(56, 189, 248, 0.7)'
                      : 'rgba(255, 255, 255, 0.2)'
              }
              strokeWidth={isAlphaFailed ? 4 : activeSector === 'alpha' ? 3.5 : 1.5}
              strokeDasharray={isAlphaFailed ? '8 4' : undefined}
              className={isAlphaFailed ? 'animate-pulse' : undefined}
            />

            {/* Scan Glow Overlay for Sector Alpha */}
            {isScanning && scanResults.alpha !== null && (
              <path
                d={alphaPath}
                fill={scanResults.alpha === 'pass' ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)'}
                stroke={scanResults.alpha === 'pass' ? '#22c55e' : '#ef4444'}
                strokeWidth={4}
                filter={scanResults.alpha === 'pass' ? 'url(#greenScanGlow)' : 'url(#redScanGlow)'}
                style={{
                  animation: 'scanPulse 1s ease-in-out infinite',
                  pointerEvents: 'none',
                }}
              />
            )}
            {isScanning && scanPhase === 'alpha' && scanResults.alpha === null && (
              <path
                d={alphaPath}
                fill="rgba(250, 204, 21, 0.15)"
                stroke="#facc15"
                strokeWidth={3}
                strokeDasharray="6 3"
                style={{
                  animation: 'scanSweep 0.6s ease-in-out infinite',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Sector 1 Title & Subtitle Badge Overlay */}
            <g
              style={{
                opacity: hoveredSector === 'alpha' ? 1 : 0,
                transform: hoveredSector === 'alpha' ? 'scale(1)' : 'scale(0.85)',
                transformOrigin: `${badgePositions.alpha.x}px ${badgePositions.alpha.y}px`,
                transition:
                  hoveredSector === 'alpha'
                    ? 'opacity 0.22s ease 0.08s, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1) 0.08s'
                    : 'opacity 0.1s ease 0s, transform 0.1s ease 0s',
                pointerEvents: 'none',
              }}
            >
              <rect
                x={badgePositions.alpha.x - 54}
                y={badgePositions.alpha.y - 24}
                width="108"
                height="48"
                rx="12"
                fill="rgba(14, 8, 26, 0.95)"
                stroke={activeSector === 'alpha' ? '#38bdf8' : 'rgba(56, 189, 248, 0.6)'}
                strokeWidth="1.5"
                filter="drop-shadow(0 4px 14px rgba(0,0,0,0.7))"
              />
              <text
                x={badgePositions.alpha.x}
                y={badgePositions.alpha.y - 4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="13"
                fontWeight="800"
                letterSpacing="0.03em"
              >
                Sector 1
              </text>
              <text
                x={badgePositions.alpha.x}
                y={badgePositions.alpha.y + 14}
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="10"
                fontWeight="600"
                letterSpacing="0.06em"
              >
                Zone Alpha
              </text>
            </g>
          </g>

          {/* =================================================================== */}
          {/* SECTOR 2 (Upper-Right: Crystal Caves - Zone Beta)                   */}
          {/* =================================================================== */}
          <g
            className={isScanning || isRunning ? 'cursor-default' : 'cursor-pointer'}
            onClick={() => !isScanning && !isRunning && onSelectSector('beta')}
            onMouseEnter={() => !isScanning && !isRunning && setHoveredSector('beta')}
            onMouseLeave={() => setHoveredSector(null)}
          >
            <g clipPath="url(#clip-beta)">
              <g
                style={{
                  filter: `${isBetaColored ? '' : 'grayscale(100%) '}${
                    hoveredSector === 'beta' ? 'blur(3px) brightness(0.7)' : 'brightness(0.92)'
                  }`,
                  transition: 'filter 0.3s ease',
                }}
              >
                {/* Cavern Background Depth covering full upper-right sector */}
                <rect x="245" y="0" width="260" height="390" fill={isBetaColored ? 'url(#betaPieCavern)' : '#111827'} />

                {/* Curved Natural Cave Arch Ceiling & Outer Perimeter Wall */}
                <path
                  d="M 245,0 L 500,0 L 500,380 L 450,380 Q 490,260 450,160 Q 400,70 245,50 Z"
                  fill={solvedSectors.beta ? '#200e38' : '#1f2937'}
                />

                {/* Thick Stalactites cascading from upper ceiling curve */}
                <path
                  d="M 265,0 C 275,45 285,90 288,135 C 295,90 305,45 315,0 Z"
                  fill={isBetaColored && (betaStyles['#stalactites'] || betaStyles['#stalactites, #stalagmites']) ? s2StalactitesBase : '#3c1d66'}
                />
                <path
                  d="M 276,0 C 282,40 286,85 288,135 C 292,85 298,40 304,0 Z"
                  fill={isBetaColored && (betaStyles['#stalactites'] || betaStyles['#stalactites, #stalagmites']) ? s2StalactitesBase : '#4a237d'}
                />

                <path
                  d="M 325,0 C 335,55 348,115 352,165 C 360,115 375,55 385,0 Z"
                  fill={isBetaColored && (betaStyles['#stalactites'] || betaStyles['#stalactites, #stalagmites']) ? s2StalactitesBase : '#4a237d'}
                />
                <path
                  d="M 338,0 C 344,50 350,110 352,165 C 356,110 365,50 372,0 Z"
                  fill={isBetaColored && (betaStyles['#stalactites'] || betaStyles['#stalactites, #stalagmites']) ? s2StalactitesBase : '#5b2b99'}
                />

                <path
                  d="M 395,20 C 405,65 415,115 418,150 C 425,115 435,65 445,20 Z"
                  fill={isBetaColored && (betaStyles['#stalactites'] || betaStyles['#stalactites, #stalagmites']) ? s2StalactitesBase : '#3c1d66'}
                />
                <path
                  d="M 450,60 C 460,95 466,135 468,165 C 475,135 482,95 490,60 Z"
                  fill={isBetaColored && (betaStyles['#stalactites'] || betaStyles['#stalactites, #stalagmites']) ? s2StalactitesBase : '#52288a'}
                />

                {/* Cavern Floor Terraces & Rock Shelves covering lower half of wedge */}
                <path
                  d="M 245,210 Q 320,175 390,200 Q 450,180 500,225 L 500,390 L 245,390 Z"
                  fill={isBetaColored && betaStyles['#cave-walls'] ? s2CaveWallsBase : '#190a2c'}
                />
                <path
                  d="M 245,260 Q 330,230 410,255 Q 460,240 500,280 L 500,390 L 245,390 Z"
                  fill={isBetaColored && betaStyles['#cave-walls'] ? s2CaveWallsBase : '#25103e'}
                />

                {/* Thick Stalagmites rising up from cavern shelves */}
                <path
                  d="M 280,225 C 290,175 295,145 298,125 C 302,145 308,175 318,225 Z"
                  fill={isBetaColored && (betaStyles['#stalagmites'] || betaStyles['#stalactites, #stalagmites']) ? s2StalagmitesBase : '#36195c'}
                />
                <path
                  d="M 380,215 C 390,165 395,135 398,115 C 402,135 408,165 418,215 Z"
                  fill={isBetaColored && (betaStyles['#stalagmites'] || betaStyles['#stalactites, #stalagmites']) ? s2StalagmitesBase : '#48217a'}
                />
                <path
                  d="M 445,235 C 452,190 456,160 460,145 C 464,160 470,190 478,235 Z"
                  fill={isBetaColored && (betaStyles['#stalagmites'] || betaStyles['#stalactites, #stalagmites']) ? s2StalagmitesBase : '#36195c'}
                />

                {/* Smooth Winding Underground River */}
                <path
                  d="M 245,255 Q 330,220 400,255 Q 465,285 505,255"
                  fill="none"
                  stroke={isBetaColored && betaStyles['#river'] ? s2RiverBase : '#0284c7'}
                  strokeWidth="11"
                  strokeLinecap="round"
                />

                {/* Blocky Octagonal Glowing Crystal Gems (Embedded in rock terrain, strictly varying sizes) */}
                <g id="overview-crystal-gems">
                  {/* Overview Gem 1 (x=315, y=208): Large Monolith (Width: 12, Height: 28) */}
                  <g transform="translate(315, 208)">
                    <ellipse cx="6" cy="2" rx="8" ry="2.5" fill="#08020f" opacity="0.9" />
                    <polygon
                      points="2,3 0,-2 0,-20 3,-28 9,-28 12,-20 12,-2 10,3"
                      fill={isBetaColored && betaStyles['#crystal-gems'] ? s2GemsBase : '#a855f7'}
                    />
                    <polygon points="3,-28 9,-28 8,-23 4,-23" fill="#ffffff" opacity="0.85" />
                    <line x1="3" y1="-28" x2="9" y2="-28" stroke="#ffffff" strokeWidth="0.8" />
                    {/* Rock Collar */}
                    <polygon points="-2,4 1,-1 5,2 9,-1 14,4" fill={isBetaColored && betaStyles['#cave-walls'] ? s2CaveWallsBase : '#221133'} />
                  </g>

                  {/* Overview Gem 2 (x=345, y=214): Medium-Large Crystal (Width: 10, Height: 20) */}
                  <g transform="translate(345, 214) rotate(-6)">
                    <ellipse cx="5" cy="2" rx="7" ry="2" fill="#08020f" opacity="0.9" />
                    <polygon
                      points="1,2 0,-2 0,-14 2,-20 8,-20 10,-14 10,-2 9,2"
                      fill={isBetaColored && betaStyles['#crystal-gems'] ? s2GemsBase : '#c084fc'}
                    />
                    <polygon points="2,-20 8,-20 7,-16 3,-16" fill="#ffffff" opacity="0.85" />
                    {/* Rock Collar */}
                    <polygon points="-2,3 1,0 4,2 7,-1 12,3" fill={isBetaColored && betaStyles['#cave-walls'] ? s2CaveWallsBase : '#221133'} />
                  </g>

                  {/* Overview Gem 3 (x=370, y=222): Small Faceted Block (Width: 7, Height: 14) */}
                  <g transform="translate(370, 222) rotate(8)">
                    <ellipse cx="3.5" cy="1.5" rx="5" ry="1.8" fill="#08020f" opacity="0.9" />
                    <polygon
                      points="1,2 0,-1 0,-9 2,-14 5,-14 7,-9 7,-1 6,2"
                      fill={isBetaColored && betaStyles['#crystal-gems'] ? s2GemsBase : '#e879f9'}
                    />
                    <polygon points="2,-14 5,-14 4.5,-11.5 2.5,-11.5" fill="#ffffff" opacity="0.8" />
                    {/* Rock Collar */}
                    <polygon points="-1,2 1,0 4,1.5 6,-0.5 8,2" fill={isBetaColored && betaStyles['#cave-walls'] ? s2CaveWallsBase : '#221133'} />
                  </g>

                  {/* Overview Gem 4 (x=428, y=230): Tall Slanted Column (Width: 10, Height: 24) */}
                  <g transform="translate(428, 230) rotate(-8)">
                    <ellipse cx="5" cy="2" rx="7" ry="2" fill="#08020f" opacity="0.9" />
                    <polygon
                      points="1,3 0,-2 0,-17 2,-24 8,-24 10,-17 10,-2 9,3"
                      fill={isBetaColored && betaStyles['#crystal-gems'] ? s2GemsBase : '#06b6d4'}
                    />
                    <polygon points="2,-24 8,-24 7,-19 3,-19" fill="#ffffff" opacity="0.85" />
                    <line x1="2" y1="-24" x2="8" y2="-24" stroke="#ffffff" strokeWidth="0.8" />
                    {/* Rock Collar */}
                    <polygon points="-2,3 1,0 5,2 8,-1 12,3" fill={isBetaColored && betaStyles['#cave-walls'] ? s2CaveWallsBase : '#221133'} />
                  </g>

                  {/* Overview Gem 5 (x=462, y=240): Petite Nascent Bud (Width: 5, Height: 10) */}
                  <g transform="translate(462, 240) rotate(5)">
                    <ellipse cx="2.5" cy="1" rx="4" ry="1.5" fill="#08020f" opacity="0.9" />
                    <polygon
                      points="1,1.5 0,-1 0,-7 1.5,-10 3.5,-10 5,-7 5,-1 4,1.5"
                      fill={isBetaColored && betaStyles['#crystal-gems'] ? s2GemsBase : '#38bdf8'}
                    />
                    <polygon points="1.5,-10 3.5,-10 3,-8 2,-8" fill="#ffffff" opacity="0.8" />
                    {/* Rock Collar */}
                    <polygon points="-1,2 1,0 3,1 5,-0.5 6,2" fill={isBetaColored && betaStyles['#cave-walls'] ? s2CaveWallsBase : '#221133'} />
                  </g>
                </g>

                {/* Subterranean Flora & Alien Bioluminescent Fungi */}
                <g transform="translate(295, 212)">
                  <path d="M 4,0 Q 2,-16 0,-24" stroke={isBetaColored && betaStyles['#plants'] ? s2PlantsBase : '#10b981'} strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M -9,-24 Q 0,-35 9,-24 Z" fill={isBetaColored && betaStyles['#plants'] ? s2PlantsBase : '#34d399'} />
                  <circle cx="0" cy="-28" r="1.5" fill="#ffffff" />
                </g>
                <g transform="translate(355, 222)">
                  <path d="M 0,0 Q 2,-12 6,-18" stroke={isBetaColored && betaStyles['#plants'] ? s2PlantsBase : '#10b981'} strokeWidth="2" strokeLinecap="round" />
                  <ellipse cx="6" cy="-18" rx="4" ry="6" fill={isBetaColored && betaStyles['#plants'] ? s2PlantsBase : '#6ee7b7'} />
                </g>
                <g transform="translate(415, 208)">
                  <path d="M 0,0 Q 8,-14 4,-26" stroke={isBetaColored && betaStyles['#plants'] ? s2PlantsBase : '#22c55e'} strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="4" cy="-26" r="4.5" fill={isBetaColored && betaStyles['#plants'] ? s2PlantsBase : '#a3e635'} />
                </g>
                <g transform="translate(460, 230)">
                  <path d="M 0,0 Q -4,-12 -2,-20" stroke={isBetaColored && betaStyles['#plants'] ? s2PlantsBase : '#10b981'} strokeWidth="2" strokeLinecap="round" />
                  <circle cx="-2" cy="-20" r="3.5" fill={isBetaColored && betaStyles['#plants'] ? s2PlantsBase : '#34d399'} />
                </g>
              </g>

              {/* Tint overlay on hover */}
              <rect
                x="0"
                y="0"
                width="500"
                height="500"
                fill="rgba(10, 6, 22, 0.45)"
                style={{
                  opacity: hoveredSector === 'beta' ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                }}
              />
            </g>

            {/* Wedge Border Highlight / Red Alert Strobe */}
            <path
              d={betaPath}
              fill={isBetaFailed ? 'rgba(239, 68, 68, 0.35)' : 'transparent'}
              stroke={
                isBetaFailed
                  ? '#ef4444'
                  : activeSector === 'beta'
                    ? '#c084fc'
                    : hoveredSector === 'beta'
                      ? 'rgba(192, 132, 252, 0.7)'
                      : 'rgba(255, 255, 255, 0.2)'
              }
              strokeWidth={isBetaFailed ? 4 : activeSector === 'beta' ? 3.5 : 1.5}
              strokeDasharray={isBetaFailed ? '8 4' : undefined}
              className={isBetaFailed ? 'animate-pulse' : undefined}
            />

            {/* Scan Glow Overlay for Sector Beta */}
            {isScanning && scanResults.beta !== null && (
              <path
                d={betaPath}
                fill={scanResults.beta === 'pass' ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)'}
                stroke={scanResults.beta === 'pass' ? '#22c55e' : '#ef4444'}
                strokeWidth={4}
                filter={scanResults.beta === 'pass' ? 'url(#greenScanGlow)' : 'url(#redScanGlow)'}
                style={{
                  animation: 'scanPulse 1s ease-in-out infinite',
                  pointerEvents: 'none',
                }}
              />
            )}
            {isScanning && scanPhase === 'beta' && scanResults.beta === null && (
              <path
                d={betaPath}
                fill="rgba(250, 204, 21, 0.15)"
                stroke="#facc15"
                strokeWidth={3}
                strokeDasharray="6 3"
                style={{
                  animation: 'scanSweep 0.6s ease-in-out infinite',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Sector 2 Title & Subtitle Badge Overlay */}
            <g
              style={{
                opacity: hoveredSector === 'beta' ? 1 : 0,
                transform: hoveredSector === 'beta' ? 'scale(1)' : 'scale(0.85)',
                transformOrigin: `${badgePositions.beta.x}px ${badgePositions.beta.y}px`,
                transition:
                  hoveredSector === 'beta'
                    ? 'opacity 0.22s ease 0.08s, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1) 0.08s'
                    : 'opacity 0.1s ease 0s, transform 0.1s ease 0s',
                pointerEvents: 'none',
              }}
            >
              <rect
                x={badgePositions.beta.x - 54}
                y={badgePositions.beta.y - 24}
                width="108"
                height="48"
                rx="12"
                fill="rgba(14, 8, 26, 0.95)"
                stroke={activeSector === 'beta' ? '#c084fc' : 'rgba(192, 132, 252, 0.6)'}
                strokeWidth="1.5"
                filter="drop-shadow(0 4px 14px rgba(0,0,0,0.7))"
              />
              <text
                x={badgePositions.beta.x}
                y={badgePositions.beta.y - 4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="13"
                fontWeight="800"
                letterSpacing="0.03em"
              >
                Sector 2
              </text>
              <text
                x={badgePositions.beta.x}
                y={badgePositions.beta.y + 14}
                textAnchor="middle"
                fill="#c084fc"
                fontSize="10"
                fontWeight="600"
                letterSpacing="0.06em"
              >
                Zone Beta
              </text>
            </g>
          </g>

          {/* =================================================================== */}
          {/* SECTOR 3 (Bottom: Lush Desert Oases - Zone Gamma)                   */}
          {/* =================================================================== */}
          <g
            className={isScanning || isRunning ? 'cursor-default' : 'cursor-pointer'}
            onClick={() => !isScanning && !isRunning && onSelectSector('gamma')}
            onMouseEnter={() => !isScanning && !isRunning && setHoveredSector('gamma')}
            onMouseLeave={() => setHoveredSector(null)}
          >
            <g clipPath="url(#clip-gamma)">
              <g
                style={{
                  filter: `${isGammaColored ? '' : 'grayscale(100%) '}${
                    hoveredSector === 'gamma' ? 'blur(3px) brightness(0.7)' : 'brightness(0.92)'
                  }`,
                  transition: 'filter 0.3s ease',
                }}
              >
                {/* Desert Twilight Sky (#sky) covering full bottom sector */}
                <rect id="sky" x="0" y="270" width="500" height="230" fill={isGammaColored ? 'url(#gammaPieSky)' : '#111827'} />

                {/* Sweeping Desert Mountains across upper section of wedge (#mountains, #plateaus) */}
                <g id="mountains" {...getBorderProps(gammaStyles['#mountains, #plateaus__border'] || gammaStyles['#mountains__border'])}>
                  <path
                    d="M 20,345 Q 130,290 250,315 Q 370,285 480,345 L 480,500 L 20,500 Z"
                    fill={isS3TerrainColored ? s3MountainsBase : (solvedSectors.gamma ? '#451a24' : '#1f2937')}
                    style={{ filter: isS3TerrainColored ? 'brightness(0.75)' : undefined }}
                  />
                  <path
                    d="M 20,375 Q 140,325 250,350 Q 360,320 480,375 L 480,500 L 20,500 Z"
                    fill={isS3TerrainColored ? s3MountainsBase : (solvedSectors.gamma ? '#5a222e' : '#374151')}
                    style={{ filter: isS3TerrainColored ? 'brightness(0.9)' : undefined }}
                  />
                </g>

                {/* Stepped Flat-Topped Plateaus & Mesas in the distance (#mountains, #plateaus) */}
                <g id="plateaus" {...getBorderProps(gammaStyles['#mountains, #plateaus__border'] || gammaStyles['#plateaus__border'])}>
                  {/* Left Stepped Plateau Mesa */}
                  <path
                    d="M 35,395 Q 65,340 100,340 L 160,340 Q 190,340 210,395 Z"
                    fill={isS3TerrainColored ? s3PlateausBase : (solvedSectors.gamma ? '#752834' : '#4b5563')}
                  />
                  <ellipse
                    cx="130"
                    cy="340"
                    rx="30"
                    ry="3.5"
                    fill={isS3TerrainColored ? s3PlateausBase : '#6b7280'}
                    style={{ filter: isS3TerrainColored ? 'brightness(1.2)' : undefined }}
                  />
                  {/* Right Stepped Plateau Mesa */}
                  <path
                    d="M 310,395 Q 335,345 365,345 L 415,345 Q 445,345 465,395 Z"
                    fill={isS3TerrainColored ? s3PlateausBase : (solvedSectors.gamma ? '#752834' : '#4b5563')}
                  />
                  <ellipse
                    cx="390"
                    cy="345"
                    rx="25"
                    ry="3.5"
                    fill={isS3TerrainColored ? s3PlateausBase : '#6b7280'}
                    style={{ filter: isS3TerrainColored ? 'brightness(1.2)' : undefined }}
                  />
                </g>

                {/* Right Wing Feature: Natural Sandstone Arch */}
                <path
                  d="M 330,420 Q 345,355 365,355 Q 385,355 400,420 Q 380,380 365,380 Q 350,380 330,420 Z"
                  fill={isGammaColored && gammaStyles['#rock-formations'] ? s3RocksBase : '#7c2d37'}
                />

                {/* Hoodoo Standing Rock Pillar on right wing */}
                <path
                  d="M 425,415 Q 432,360 436,360 Q 440,360 448,415 Z"
                  fill={isGammaColored && gammaStyles['#rock-formations'] ? s3RocksBase : '#8c303f'}
                />

                {/* 3 Scattered Impact Craters of varying sizes (#craters) */}
                <g id="craters" {...getBorderProps(gammaStyles['#craters__border'])}>
                  {/* Crater 1: Large Center-Main Impact Basin */}
                  <path
                    d="M 185,425 Q 255,400 325,425 Q 300,462 255,464 Q 210,462 185,425 Z"
                    fill={isGammaColored && gammaStyles['#craters'] ? s3CratersBase : '#2c0e15'}
                  />
                  <path
                    d="M 195,427 Q 255,406 315,427 Q 295,456 255,458 Q 215,456 195,427 Z"
                    fill={isGammaColored && gammaStyles['#craters'] ? s3CratersBase : '#1c0a0e'}
                    style={{ filter: isGammaColored && gammaStyles['#craters'] ? 'brightness(0.68)' : undefined }}
                  />
                  {/* Crater 2: Medium Left Impact Basin */}
                  <path
                    d="M 90,442 Q 130,426 170,442 Q 158,465 130,466 Q 102,465 90,442 Z"
                    fill={isGammaColored && gammaStyles['#craters'] ? s3CratersBase : '#2c0e15'}
                  />
                  <path
                    d="M 98,443 Q 130,430 162,443 Q 152,461 130,462 Q 108,461 98,443 Z"
                    fill={isGammaColored && gammaStyles['#craters'] ? s3CratersBase : '#1c0a0e'}
                    style={{ filter: isGammaColored && gammaStyles['#craters'] ? 'brightness(0.68)' : undefined }}
                  />
                  {/* Crater 3: Small Right Impact Basin */}
                  <path
                    d="M 345,448 Q 372,437 398,448 Q 390,464 372,465 Q 354,464 345,448 Z"
                    fill={isGammaColored && gammaStyles['#craters'] ? s3CratersBase : '#2c0e15'}
                  />
                  <path
                    d="M 350,449 Q 372,440 393,449 Q 387,461 372,462 Q 357,461 350,449 Z"
                    fill={isGammaColored && gammaStyles['#craters'] ? s3CratersBase : '#1c0a0e'}
                    style={{ filter: isGammaColored && gammaStyles['#craters'] ? 'brightness(0.68)' : undefined }}
                  />
                </g>

                {/* Weathered Desert Boulders & Stepping Stones (#rock-formations) */}
                <ellipse cx="180" cy="434" rx="4" ry="2" fill={isGammaColored && gammaStyles['#rock-formations'] ? s3RocksBase : '#7c2d37'} />
                <ellipse cx="225" cy="458" rx="5" ry="2.5" fill={isGammaColored && gammaStyles['#rock-formations'] ? s3RocksBase : '#7c2d37'} />
                <ellipse cx="275" cy="459" rx="5" ry="2.5" fill={isGammaColored && gammaStyles['#rock-formations'] ? s3RocksBase : '#5a222e'} />
                <ellipse cx="320" cy="434" rx="4" ry="2" fill={isGammaColored && gammaStyles['#rock-formations'] ? s3RocksBase : '#7c2d37'} />

                {/* Scattered Shrubbery & Desert Flora across Sector 3 wedge (#oasis-vegetation) */}
                <g id="oasis-vegetation" {...getBorderProps(gammaStyles['#oasis-vegetation__border'])}>
                  <ellipse cx="65" cy="410" rx="6" ry="3" fill={isGammaColored && gammaStyles['#oasis-vegetation'] ? s3VegBase : '#059669'} />
                  <ellipse cx="85" cy="455" rx="5" ry="2.5" fill={isGammaColored && gammaStyles['#oasis-vegetation'] ? s3VegBase : '#10b981'} />
                  <ellipse cx="172" cy="438" rx="6" ry="3" fill={isGammaColored && gammaStyles['#oasis-vegetation'] ? s3VegBase : '#059669'} />
                  <ellipse cx="180" cy="465" rx="5" ry="2.5" fill={isGammaColored && gammaStyles['#oasis-vegetation'] ? s3VegBase : '#047857'} />

                  {/* Desert Palms cresting crater rims */}
                  <g transform="translate(178, 418)">
                    <path d="M 0,0 Q -8,-14 -14,-18" stroke={isGammaColored ? '#78350f' : '#4b5563'} strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M -14,-18 Q -24,-20 -28,-15 Q -20,-15 -14,-18" fill={isGammaColored && gammaStyles['#oasis-vegetation'] ? s3VegBase : '#059669'} />
                    <path d="M 0,0 Q 2,-16 6,-20" stroke={isGammaColored ? '#92400e' : '#4b5563'} strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 6,-20 Q 14,-24 18,-18 Q 12,-17 6,-20" fill={isGammaColored && gammaStyles['#oasis-vegetation'] ? s3VegBase : '#34d399'} />
                  </g>
                  <g transform="translate(328, 418)">
                    <path d="M 0,0 Q 8,-14 14,-18" stroke={isGammaColored ? '#78350f' : '#4b5563'} strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M 14,-18 Q 24,-20 28,-15 Q 20,-15 14,-18" fill={isGammaColored && gammaStyles['#oasis-vegetation'] ? s3VegBase : '#059669'} />
                    <path d="M 0,0 Q -2,-16 -6,-20" stroke={isGammaColored ? '#92400e' : '#4b5563'} strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M -6,-20 Q -14,-24 -18,-18 Q -12,-17 -6,-20" fill={isGammaColored && gammaStyles['#oasis-vegetation'] ? s3VegBase : '#34d399'} />
                  </g>

                  <ellipse cx="330" cy="460" rx="5" ry="2.5" fill={isGammaColored && gammaStyles['#oasis-vegetation'] ? s3VegBase : '#059669'} />
                  <ellipse cx="405" cy="445" rx="6" ry="3" fill={isGammaColored && gammaStyles['#oasis-vegetation'] ? s3VegBase : '#10b981'} />
                  <ellipse cx="445" cy="435" rx="6" ry="3" fill={isGammaColored && gammaStyles['#oasis-vegetation'] ? s3VegBase : '#047857'} />
                </g>

                {/* Soft Desert Sand Dunes along bottom outer boundary */}
                <path
                  d="M 30,445 Q 140,415 250,440 Q 360,415 470,445 L 470,500 L 30,500 Z"
                  fill={isS3TerrainColored ? s3MountainsBase : '#6b2737'}
                  style={{ filter: isS3TerrainColored ? 'brightness(0.85)' : undefined }}
                />
                <path
                  d="M 30,470 Q 150,445 250,465 Q 350,445 470,470 L 470,500 L 30,500 Z"
                  fill={isS3TerrainColored ? s3MountainsBase : '#853244'}
                  style={{ filter: isS3TerrainColored ? 'brightness(1.15)' : undefined }}
                />
              </g>

              {/* Tint overlay on hover */}
              <rect
                x="0"
                y="0"
                width="500"
                height="500"
                fill="rgba(10, 6, 22, 0.45)"
                style={{
                  opacity: hoveredSector === 'gamma' ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                }}
              />
            </g>

            {/* Wedge Border Highlight / Red Alert Strobe */}
            <path
              d={gammaPath}
              fill={isGammaFailed ? 'rgba(239, 68, 68, 0.35)' : 'transparent'}
              stroke={
                isGammaFailed
                  ? '#ef4444'
                  : activeSector === 'gamma'
                    ? '#34d399'
                    : hoveredSector === 'gamma'
                      ? 'rgba(52, 211, 153, 0.7)'
                      : 'rgba(255, 255, 255, 0.2)'
              }
              strokeWidth={isGammaFailed ? 4 : activeSector === 'gamma' ? 3.5 : 1.5}
              strokeDasharray={isGammaFailed ? '8 4' : undefined}
              className={isGammaFailed ? 'animate-pulse' : undefined}
            />

            {/* Scan Glow Overlay for Sector Gamma */}
            {isScanning && scanResults.gamma !== null && (
              <path
                d={gammaPath}
                fill={scanResults.gamma === 'pass' ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)'}
                stroke={scanResults.gamma === 'pass' ? '#22c55e' : '#ef4444'}
                strokeWidth={4}
                filter={scanResults.gamma === 'pass' ? 'url(#greenScanGlow)' : 'url(#redScanGlow)'}
                style={{
                  animation: 'scanPulse 1s ease-in-out infinite',
                  pointerEvents: 'none',
                }}
              />
            )}
            {isScanning && scanPhase === 'gamma' && scanResults.gamma === null && (
              <path
                d={gammaPath}
                fill="rgba(250, 204, 21, 0.15)"
                stroke="#facc15"
                strokeWidth={3}
                strokeDasharray="6 3"
                style={{
                  animation: 'scanSweep 0.6s ease-in-out infinite',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* Sector 3 Title & Subtitle Badge Overlay */}
            <g
              style={{
                opacity: hoveredSector === 'gamma' ? 1 : 0,
                transform: hoveredSector === 'gamma' ? 'scale(1)' : 'scale(0.85)',
                transformOrigin: `${badgePositions.gamma.x}px ${badgePositions.gamma.y}px`,
                transition:
                  hoveredSector === 'gamma'
                    ? 'opacity 0.22s ease 0.08s, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1) 0.08s'
                    : 'opacity 0.1s ease 0s, transform 0.1s ease 0s',
                pointerEvents: 'none',
              }}
            >
              <rect
                x={badgePositions.gamma.x - 54}
                y={badgePositions.gamma.y - 24}
                width="108"
                height="48"
                rx="12"
                fill="rgba(14, 8, 26, 0.95)"
                stroke={activeSector === 'gamma' ? '#34d399' : 'rgba(52, 211, 153, 0.6)'}
                strokeWidth="1.5"
                filter="drop-shadow(0 4px 14px rgba(0,0,0,0.7))"
              />
              <text
                x={badgePositions.gamma.x}
                y={badgePositions.gamma.y - 4}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="13"
                fontWeight="800"
                letterSpacing="0.03em"
              >
                Sector 3
              </text>
              <text
                x={badgePositions.gamma.x}
                y={badgePositions.gamma.y + 14}
                textAnchor="middle"
                fill="#34d399"
                fontSize="10"
                fontWeight="600"
                letterSpacing="0.06em"
              >
                Zone Gamma
              </text>
            </g>
          </g>

          {/* Outer Boundary Wheel Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={rOuter}
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
          />

          {/* =================================================================== */}
          {/* CENTER HUB: ASTROLINK TOWER WITH MINIMALIST VENUS DESERT HORIZON    */}
          {/* =================================================================== */}
          <g
            className={isScanning || isRunning ? 'cursor-default' : 'cursor-pointer'}
            onClick={() => !isScanning && !isRunning && onSelectSector('main')}
            onMouseEnter={() => !isScanning && !isRunning && setHoveredSector('main')}
            onMouseLeave={() => setHoveredSector(null)}
          >
            {/* Minimalist Venus Desert Landscape Window behind Tower */}
            <g
              clipPath="url(#clip-hub-desert)"
              style={{
                filter: hasInlineBg ? 'none' : 'grayscale(100%) contrast(1.05)',
                transition: 'filter 0.5s ease',
              }}
            >
              <rect
                x={cx - 70}
                y={cy - 70}
                width="140"
                height="140"
                fill={hasInlineBg ? hubBgColor : 'url(#hubSkyMono)'}
              />

              {/* Desert Dune Ridge 1 */}
              <path
                d={`M ${cx - 70},${cy + 5} Q ${cx - 30},${cy - 12} ${cx + 15},${cy} Q ${cx + 45},${cy - 8} ${cx + 70},${cy + 6} L ${cx + 70},${cy + 70} L ${cx - 70},${cy + 70} Z`}
                fill={hasInlineBg ? hubBgColor : '#27272a'}
                style={{ filter: hasInlineBg ? 'brightness(0.85)' : undefined }}
              />
              {/* Desert Dune Ridge 2 */}
              <path
                d={`M ${cx - 70},${cy + 18} Q ${cx - 20},${cy + 6} ${cx + 25},${cy + 16} L ${cx + 70},${cy + 22} L ${cx + 70},${cy + 70} L ${cx - 70},${cy + 70} Z`}
                fill={hasInlineBg ? hubBgColor : '#3f3f46'}
                style={{ filter: hasInlineBg ? 'brightness(1.15)' : undefined }}
              />
              {/* Rocky Ground where tower stands */}
              <path
                d={`M ${cx - 70},${cy + 30} Q ${cx},${cy + 24} ${cx + 70},${cy + 32} L ${cx + 70},${cy + 70} L ${cx - 70},${cy + 70} Z`}
                fill={hasInlineBg ? hubBgColor : '#18181b'}
                style={{ filter: hasInlineBg ? 'brightness(0.55)' : undefined }}
              />
            </g>

            {/* Central Platform Ring Border */}
            <circle
              cx={cx}
              cy={cy}
              r={rInner}
              fill="none"
              stroke={
                isAllRestored || (hasInlineTower && hasInlineBg)
                  ? '#facc15'
                  : activeSector === 'main'
                    ? 'rgba(250, 204, 21, 0.75)'
                    : 'rgba(156, 163, 175, 0.45)'
              }
              strokeWidth={isAllRestored || activeSector === 'main' ? 3.5 : 2}
            />

            {/* Scaled AstroLink Tower in Center */}
            <g
              transform={`translate(${cx}, ${cy}) scale(0.21) translate(-60, -182)`}
              style={{
                filter: isAllRestored || hasInlineTower ? 'none' : 'grayscale(100%) opacity(0.65)',
                transition: 'filter 0.5s ease, opacity 0.5s ease',
              }}
            >
              <line x1="60" y1="6" x2="60" y2="28" stroke="url(#tGold)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="60" cy="6" r="4.5" fill={hasInlineTower ? hubTowerColor : '#38bdf8'} />
              <ellipse cx="60" cy="28" rx="12" ry="4" fill="url(#tGold)" />

              <circle cx="60" cy="62" r="34" fill={hasInlineTower ? hubTowerColor : 'url(#tOrb)'} stroke="url(#tGold)" strokeWidth="2.5" />
              <ellipse cx="60" cy="62" rx="44" ry="11" fill="none" stroke="url(#tGold)" strokeWidth="3" transform="rotate(-14 60 62)" />
              <circle cx="18" cy="72" r="3" fill={hasInlineTower ? hubTowerColor : '#38bdf8'} stroke="#ca8a04" strokeWidth="1" />
              <circle cx="102" cy="52" r="3" fill={hasInlineTower ? hubTowerColor : '#38bdf8'} stroke="#ca8a04" strokeWidth="1" />

              <rect x="52" y="96" width="16" height="34" rx="3" fill={hasInlineTower ? hubTowerColor : 'url(#tSkyBlue)'} stroke="url(#tGold)" strokeWidth="1.5" />
              <ellipse cx="60" cy="130" rx="18" ry="6" fill="url(#tGold)" />
              <rect x="53" y="130" width="14" height="66" rx="3" fill={hasInlineTower ? hubTowerColor : 'url(#tSkyBlue)'} stroke="url(#tGold)" strokeWidth="1.5" />
              <ellipse cx="60" cy="196" rx="20" ry="6" fill="url(#tGold)" />
              <rect x="53" y="196" width="14" height="66" rx="3" fill={hasInlineTower ? hubTowerColor : 'url(#tSkyBlue)'} stroke="url(#tGold)" strokeWidth="1.5" />
              <ellipse cx="60" cy="262" rx="22" ry="7" fill="url(#tGold)" />

              <path d="M 38,262 L 14,352 L 28,352 L 48,262 Z" fill={hasInlineTower ? hubTowerColor : 'url(#tSkyBlue)'} stroke="url(#tGold)" strokeWidth="1.5" />
              <path d="M 82,262 L 106,352 L 92,352 L 72,262 Z" fill={hasInlineTower ? hubTowerColor : 'url(#tSkyBlue)'} stroke="url(#tGold)" strokeWidth="1.5" />
              <rect x="56" y="286" width="8" height="68" rx="2" fill={hasInlineTower ? hubTowerColor : 'url(#tSkyBlue)'} stroke="url(#tGold)" strokeWidth="1.5" />
              <rect x="6" y="352" width="108" height="6" rx="2" fill="url(#tGold)" />
            </g>

            {/* Central Hub Hover Status Badge */}
            <g
              style={{
                opacity: hoveredSector === 'main' ? 1 : 0,
                transform: hoveredSector === 'main' ? 'scale(1)' : 'scale(0.85)',
                transformOrigin: '250px 250px',
                transition:
                  hoveredSector === 'main'
                    ? 'opacity 0.22s ease 0.08s, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1) 0.08s'
                    : 'opacity 0.1s ease 0s, transform 0.1s ease 0s',
                pointerEvents: 'none',
              }}
            >
              <rect
                x={250 - 64}
                y={250 - 24}
                width="128"
                height="48"
                rx="12"
                fill="rgba(14, 8, 26, 0.95)"
                stroke={hasInlineTower && hasInlineBg ? '#facc15' : 'rgba(250, 204, 21, 0.6)'}
                strokeWidth="1.5"
                filter="drop-shadow(0 4px 14px rgba(0,0,0,0.7))"
              />
              <text
                x="250"
                y="246"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="12"
                fontWeight="800"
                letterSpacing="0.03em"
              >
                AstroLink Hub
              </text>
              <text
                x="250"
                y="264"
                textAnchor="middle"
                fill={hasInlineTower && hasInlineBg ? '#34d399' : '#facc15'}
                fontSize="9.5"
                fontWeight="600"
                letterSpacing="0.04em"
              >
                {hasInlineTower && hasInlineBg ? 'Online • Styled' : 'Main • Inline CSS'}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* ===================================================================== */}
      {/* 2. CHOSEN SCENERY ZOOMED-IN VIEW (WITH BACK BUTTON)                   */}
      {/* ===================================================================== */}
      {!isPieOverview && (
        <div
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-0 z-20 bg-[#0a0514]"
          style={{
            animation: 'fadeIn 0.35s ease',
          }}
        >
          {/* Top Navigation Bar: Back Button & Active Scenery Header */}
          <div className="absolute top-3 left-4 z-30 flex items-center gap-3">
            <button
              type="button"
              disabled={isScanning || isRunning}
              onClick={() => !isScanning && !isRunning && onSelectSector('main')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#180d28]/90 hover:bg-[#281345] border border-white/20 text-xs font-semibold text-gray-200 hover:text-white shadow-xl backdrop-blur-md transition-all ${
                isScanning || isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } group`}
            >
              <span className="text-yellow-400 group-hover:-translate-x-1 transition-transform font-bold">←</span>
              <span>Back to Overview</span>
            </button>

            {/* Current Chosen Scenery Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs font-medium text-gray-200 backdrop-blur-md shadow-lg">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  solvedSectors[activeSector]
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    : 'bg-yellow-400 shadow-[0_0_8px_#facc15]'
                }`}
              />
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                {activeSector === 'alpha' && (
                  <>
                    <span>Sector 1</span>
                    <span className="text-gray-500 font-normal">|</span>
                    <span className="text-sky-400 font-medium">Zone Alpha</span>
                  </>
                )}
                {activeSector === 'beta' && (
                  <>
                    <span>Sector 2</span>
                    <span className="text-gray-500 font-normal">|</span>
                    <span className="text-purple-400 font-medium">Zone Beta</span>
                  </>
                )}
                {activeSector === 'gamma' && (
                  <>
                    <span>Sector 3</span>
                    <span className="text-gray-500 font-normal">|</span>
                    <span className="text-emerald-400 font-medium">Zone Gamma</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Detailed Full-View Minimalist Landscape Scenery */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            {/* ------------------------------------------------------------- */}
            {/* SCENERY 1: CLOUDS & AIRSHIPS IN THE SKIES OF VENUS (ALPHA)    */}
            {/* ------------------------------------------------------------- */}
            {activeSector === 'alpha' && (
              <svg
                viewBox="0 0 800 600"
                className="w-full h-full object-cover"
                style={{
                  filter: isAlphaColored ? 'none' : 'grayscale(100%) brightness(0.88)',
                  transition: 'filter 0.5s ease',
                }}
              >
                <defs>
                  <linearGradient id="scenery1DynamicSky" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={s1SkyBase} />
                    <stop offset="100%" stopColor={s1SkyBase} style={{ filter: 'brightness(0.8)' }} />
                  </linearGradient>
                </defs>

                {/* Sky (#sky) - Horizon uses base fill, upper atmospheric gradient at brightness(0.8) */}
                <rect
                  id="sky"
                  width="800"
                  height="600"
                  fill={solvedSectors.alpha || alphaStyles['#sky'] ? 'url(#scenery1DynamicSky)' : '#111827'}
                  {...getBorderProps(alphaStyles['#sky__border'])}
                />

                {/* Layered Billowing Clouds (#clouds) - Dynamic Shading */}
                <g id="clouds" {...getBorderProps(alphaStyles['#clouds__border'])}>
                  {/* High-altitude cloud puffs: brightness(1.3) with opacity(0.85) */}
                  <path
                    d="M 60,85 Q 75,68 95,74 Q 115,60 135,74 Q 150,65 165,80 Q 140,95 60,85 Z"
                    fill={solvedSectors.alpha || alphaStyles['#clouds'] ? s1CloudsBase : '#cbd5e1'}
                    style={{
                      filter: solvedSectors.alpha || alphaStyles['#clouds'] ? 'brightness(1.3)' : undefined,
                      opacity: 0.85,
                    }}
                  />
                  <path
                    d="M 440,75 Q 455,62 472,67 Q 490,56 508,67 Q 520,60 535,72 Q 500,85 440,75 Z"
                    fill={solvedSectors.alpha || alphaStyles['#clouds'] ? s1CloudsBase : '#cbd5e1'}
                    style={{
                      filter: solvedSectors.alpha || alphaStyles['#clouds'] ? 'brightness(1.3)' : undefined,
                      opacity: 0.85,
                    }}
                  />

                  {/* Mid-elevation cumulus cloud: brightness(1.1) */}
                  <path
                    d="M 40,120 Q 75,90 115,100 Q 155,80 195,95 Q 225,85 255,108 Q 275,130 245,145 Q 195,155 120,150 Q 40,150 40,120 Z"
                    fill={solvedSectors.alpha || alphaStyles['#clouds'] ? s1CloudsBase : '#9ca3af'}
                    style={{
                      filter: solvedSectors.alpha || alphaStyles['#clouds'] ? 'brightness(1.1)' : undefined,
                      opacity: 0.9,
                    }}
                  />

                  {/* Midground Billowing Cloud Bank 1 (formerly mountain bumps): brightness(1.15) and opacity(0.85) */}
                  <path
                    d="M 0,380 Q 90,290 190,320 Q 300,260 420,310 Q 560,240 680,310 Q 750,280 800,320 L 800,600 L 0,600 Z"
                    fill={solvedSectors.alpha || alphaStyles['#clouds'] ? s1CloudsBase : '#cbd5e1'}
                    style={{
                      filter: solvedSectors.alpha || alphaStyles['#clouds'] ? 'brightness(1.15)' : undefined,
                      opacity: 0.85,
                    }}
                  />

                  {/* Midground Billowing Cloud Bank 2 (formerly mountain bumps): brightness(1.05) */}
                  <path
                    d="M 0,430 Q 140,340 280,380 Q 430,310 570,370 Q 690,330 800,380 L 800,600 L 0,600 Z"
                    fill={solvedSectors.alpha || alphaStyles['#clouds'] ? s1CloudsBase : '#9ca3af'}
                    style={{
                      filter: solvedSectors.alpha || alphaStyles['#clouds'] ? 'brightness(1.05)' : undefined,
                    }}
                  />

                  {/* Grand Lower Cloud Blanket: Base fill */}
                  <path
                    d="M -30,480 Q 120,410 280,450 Q 450,390 620,440 Q 740,410 830,460 L 830,600 L -30,600 Z"
                    fill={solvedSectors.alpha || alphaStyles['#clouds'] ? s1CloudsBase : '#4b5563'}
                    opacity="0.92"
                  />
                  <path
                    d="M -30,530 Q 180,470 380,510 Q 580,460 830,520 L 830,600 L -30,600 Z"
                    fill={solvedSectors.alpha || alphaStyles['#clouds'] ? s1CloudsBase : '#374151'}
                    style={{ filter: solvedSectors.alpha || alphaStyles['#clouds'] ? 'brightness(0.9)' : undefined }}
                  />
                </g>

                {/* Observatory Relay Tower (#tower) & Domed Roof (#tower-roof) */}
                <g id="tower" transform="translate(560, 310)" {...getBorderProps(alphaStyles['#tower__border'])}>
                  {/* Foundation buttress in cloud banks (darker stroke or brightness(0.5)) */}
                  <path
                    d="M -22,70 Q 0,55 22,70 L 16,0 L -16,0 Z"
                    fill={solvedSectors.alpha || alphaStyles['#tower'] ? s1TowerBase : '#374151'}
                    style={{ filter: solvedSectors.alpha || alphaStyles['#tower'] ? 'brightness(0.5)' : undefined }}
                  />
                  {/* Main tower shaft */}
                  <rect
                    x="-10"
                    y="-80"
                    width="20"
                    height="80"
                    rx="3"
                    fill={solvedSectors.alpha || alphaStyles['#tower'] ? s1TowerBase : '#4b5563'}
                  />
                  {/* Vertical signal line (darker stroke / brightness(0.5)) */}
                  <line
                    x1="0"
                    y1="-75"
                    x2="0"
                    y2="-5"
                    stroke={solvedSectors.alpha || alphaStyles['#tower'] ? s1TowerBase : '#38bdf8'}
                    strokeWidth="2.5"
                    style={{ filter: solvedSectors.alpha || alphaStyles['#tower'] ? 'brightness(0.5)' : undefined }}
                  />
                  {/* Circular Observation Gallery (sun-facing edge gets brightness(1.2)) */}
                  <rect
                    x="-24"
                    y="-95"
                    width="48"
                    height="15"
                    rx="6"
                    fill={solvedSectors.alpha || alphaStyles['#tower'] ? s1TowerBase : '#374151'}
                    style={{ filter: solvedSectors.alpha || alphaStyles['#tower'] ? 'brightness(1.2)' : undefined }}
                  />
                  <ellipse cx="0" cy="-95" rx="20" ry="4" fill="#38bdf8" opacity="0.6" />
                  {/* Domed Roof (#tower-roof) - Base fill on dome, sharp brightness(1.8) on peak */}
                  <path
                    id="tower-roof"
                    d="M -24,-95 Q 0,-135 24,-95 Z"
                    fill={solvedSectors.alpha || alphaStyles['#tower-roof'] ? s1RoofBase : '#9ca3af'}
                    {...getBorderProps(alphaStyles['#tower-roof__border'], solvedSectors.alpha || alphaStyles['#tower-roof'] ? s1RoofBase : '#ca8a04', 2)}
                  />
                  <circle
                    cx="0"
                    cy="-136"
                    r="4.5"
                    fill={solvedSectors.alpha || alphaStyles['#tower-roof'] ? s1RoofBase : '#38bdf8'}
                    style={{ filter: solvedSectors.alpha || alphaStyles['#tower-roof'] ? 'brightness(1.8)' : undefined }}
                  />
                  <line x1="0" y1="-136" x2="0" y2="-152" stroke="#facc15" strokeWidth="2" />
                </g>

                {/* Detailed Streamlined Airships / Blimps (#airships) - Dynamic Shading */}
                <g id="airships" {...getBorderProps(alphaStyles['#airships__border'])}>
                  {/* 1. Flagship Dirigible (Center-Left) */}
                  <g transform="translate(290, 250) scale(0.88)">
                    {/* Elliptical aerodynamic gasbag hull (Base fill) */}
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="125"
                      ry="46"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#d1d5db'}
                      stroke="#64748b"
                      strokeWidth="2.5"
                    />
                    {/* Streamline mid-stripe (peaks at brightness(1.5)) */}
                    <path
                      d="M -105,0 Q 0,14 105,0"
                      fill="none"
                      stroke={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#4b5563'}
                      strokeWidth="6"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(1.5)' : undefined }}
                    />
                    {/* Upper decorative pinstripe (peaks at brightness(1.5)) */}
                    <path
                      d="M -85,-18 Q 0,-8 85,-18"
                      fill="none"
                      stroke={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#6b7280'}
                      strokeWidth="3"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(1.5)' : undefined }}
                    />
                    {/* Curved aerodynamic tail stabilizer fins (brightness(0.7)) */}
                    <path
                      d="M -105,-12 Q -150,-45 -120,-8 Z"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#9ca3af'}
                      stroke="#64748b"
                      strokeWidth="2"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.7)' : undefined }}
                    />
                    <path
                      d="M -105,12 Q -150,45 -120,8 Z"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#9ca3af'}
                      stroke="#64748b"
                      strokeWidth="2"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.7)' : undefined }}
                    />
                    {/* Rudder trim */}
                    <path
                      d="M -115,-4 Q -155,0 -115,4 Z"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#6b7280'}
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.6)' : undefined }}
                    />

                    {/* Underslung curved gondola cabin */}
                    <rect
                      x="-55"
                      y="40"
                      width="110"
                      height="24"
                      rx="8"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#374151'}
                      stroke="#0369a1"
                      strokeWidth="2"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.85)' : undefined }}
                    />
                    {/* Illuminated rounded portholes */}
                    <circle cx="-32" cy="52" r="5" fill="#fef08a" />
                    <circle cx="-12" cy="52" r="5" fill="#fef08a" />
                    <circle cx="8" cy="52" r="5" fill="#fef08a" />
                    <circle cx="28" cy="52" r="5" fill="#fef08a" />
                    {/* Twin engine nacelles on curved pylons (drop to brightness(0.4)) */}
                    <ellipse
                      cx="-40"
                      cy="36"
                      rx="14"
                      ry="5"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#475569'}
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.4)' : undefined }}
                    />
                    <ellipse
                      cx="40"
                      cy="36"
                      rx="14"
                      ry="5"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#475569'}
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.4)' : undefined }}
                    />
                  </g>

                  {/* 2. Secondary Cruiser Blimp */}
                  <g transform="translate(650, 115) scale(0.55)">
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="110"
                      ry="40"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#9ca3af'}
                      stroke="#64748b"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M -90,0 Q 0,12 90,0"
                      fill="none"
                      stroke={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#4b5563'}
                      strokeWidth="5"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(1.5)' : undefined }}
                    />
                    <path
                      d="M -95,-10 Q -135,-38 -110,-6 Z"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#6b7280'}
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.7)' : undefined }}
                    />
                    <path
                      d="M -95,10 Q -135,38 -110,6 Z"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#6b7280'}
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.7)' : undefined }}
                    />
                    <rect
                      x="-45"
                      y="34"
                      width="90"
                      height="20"
                      rx="7"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#374151'}
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.85)' : undefined }}
                    />
                    <circle cx="-20" cy="44" r="4" fill="#fef08a" />
                    <circle cx="0" cy="44" r="4" fill="#fef08a" />
                    <circle cx="20" cy="44" r="4" fill="#fef08a" />
                  </g>

                  {/* 3. Distant Scout Blimp */}
                  <g transform="translate(145, 80) scale(0.36)">
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="90"
                      ry="32"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#6b7280'}
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                    <path
                      d="M -75,0 Q 0,8 75,0"
                      fill="none"
                      stroke={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#4b5563'}
                      strokeWidth="4"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(1.5)' : undefined }}
                    />
                    <path
                      d="M -80,-8 Q -115,-28 -95,-4 Z"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#4b5563'}
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.7)' : undefined }}
                    />
                    <path
                      d="M -80,8 Q -115,28 -95,4 Z"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#4b5563'}
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.7)' : undefined }}
                    />
                    <rect
                      x="-35"
                      y="28"
                      width="70"
                      height="15"
                      rx="5"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#374151'}
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.85)' : undefined }}
                    />
                  </g>

                  {/* 4. Bottom Valley Cargo Cruiser */}
                  <g transform="translate(560, 430) scale(0.72)">
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="115"
                      ry="42"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#d1d5db'}
                      stroke="#64748b"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M -95,0 Q 0,12 95,0"
                      fill="none"
                      stroke={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#4b5563'}
                      strokeWidth="5.5"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(1.5)' : undefined }}
                    />
                    <path
                      d="M -80,-16 Q 0,-6 80,-16"
                      fill="none"
                      stroke={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#6b7280'}
                      strokeWidth="2.5"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(1.5)' : undefined }}
                    />
                    <path
                      d="M -98,-10 Q -140,-40 -112,-6 Z"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#9ca3af'}
                      stroke="#64748b"
                      strokeWidth="2"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.7)' : undefined }}
                    />
                    <path
                      d="M -98,10 Q -140,40 -112,6 Z"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#9ca3af'}
                      stroke="#64748b"
                      strokeWidth="2"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.7)' : undefined }}
                    />
                    <rect
                      x="-50"
                      y="36"
                      width="100"
                      height="22"
                      rx="7"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#374151'}
                      stroke="#0369a1"
                      strokeWidth="1.5"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.85)' : undefined }}
                    />
                    <circle cx="-30" cy="47" r="4.5" fill="#fef08a" />
                    <circle cx="-10" cy="47" r="4.5" fill="#fef08a" />
                    <circle cx="10" cy="47" r="4.5" fill="#fef08a" />
                    <circle cx="30" cy="47" r="4.5" fill="#fef08a" />
                  </g>

                  {/* 5. Bottom Low-Altitude Skimmer */}
                  <g transform="translate(180, 465) scale(0.50)">
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="100"
                      ry="36"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#9ca3af'}
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                    <path
                      d="M -80,0 Q 0,10 80,0"
                      fill="none"
                      stroke={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#4b5563'}
                      strokeWidth="4.5"
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(1.5)' : undefined }}
                    />
                    <path
                      d="M -85,-8 Q -120,-30 -100,-4 Z"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#6b7280'}
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.7)' : undefined }}
                    />
                    <path
                      d="M -85,8 Q -120,30 -100,4 Z"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#6b7280'}
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.7)' : undefined }}
                    />
                    <rect
                      x="-40"
                      y="30"
                      width="80"
                      height="18"
                      rx="6"
                      fill={solvedSectors.alpha || alphaStyles['#airships'] ? s1AirshipsBase : '#374151'}
                      style={{ filter: solvedSectors.alpha || alphaStyles['#airships'] ? 'brightness(0.85)' : undefined }}
                    />
                    <circle cx="-16" cy="39" r="3.5" fill="#fef08a" />
                    <circle cx="0" cy="39" r="3.5" fill="#fef08a" />
                    <circle cx="16" cy="39" r="3.5" fill="#fef08a" />
                  </g>
                </g>
              </svg>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SCENERY 2: CRYSTAL CAVES & SUBTERRANEAN PLANTS (BETA)         */}
            {/* ------------------------------------------------------------- */}
            {activeSector === 'beta' && (
              <svg
                viewBox="0 0 800 600"
                className="w-full h-full object-cover"
                style={{
                  filter: isBetaColored ? 'none' : 'grayscale(100%) brightness(0.88)',
                  transition: 'filter 0.5s ease',
                }}
              >
                {/* Deep Cavern Background Depth */}
                <rect width="800" height="600" fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#111827'} style={{ filter: 'brightness(0.5)' }} />

                {/* Curved Organic Cave Walls & Arching Ceiling (#cave-walls) - Dynamic Shading */}
                <g id="cave-walls" {...getBorderProps(betaStyles['#cave-walls__border'])}>
                  {/* Left natural curved cavern wall (base fill establishes midtone) */}
                  <path
                    d="M 0,0 L 280,0 Q 210,120 180,240 Q 140,360 80,460 L 0,480 Z"
                    fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#1f2937'}
                  />
                  {/* Right natural curved cavern wall (base fill) */}
                  <path
                    d="M 800,0 L 520,0 Q 590,120 620,240 Q 660,360 720,460 L 800,480 Z"
                    fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#1f2937'}
                  />
                  {/* Deep ceiling arch / crevices (drop to brightness(0.15)) */}
                  <path
                    d="M 220,0 Q 400,95 580,0 Z"
                    fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#0f172a'}
                    style={{ filter: solvedSectors.beta || betaStyles['#cave-walls'] ? 'brightness(0.15)' : undefined }}
                  />
                </g>

                {/* Thick Naturally Tapered Stalactites (#stalactites) - Dynamic Shading */}
                <g id="stalactites" {...getBorderProps(betaStyles['#stalactites__border'] || betaStyles['#stalactites, #stalagmites__border'])}>
                  {/* Stalactite 1 */}
                  <path
                    d="M 120,0 C 130,60 145,120 160,190 C 170,120 185,60 200,0 Z"
                    fill={isS2StalactitesColored ? s2StalactitesBase : '#374151'}
                  />
                  <path
                    d="M 140,0 C 145,50 155,100 160,190 C 165,110 175,60 185,0 Z"
                    fill={isS2StalactitesColored ? s2StalactitesBase : '#4b5563'}
                    style={{ filter: isS2StalactitesColored ? 'brightness(1.4)' : undefined }}
                  />

                  {/* Stalactite 2 (Mid-Left Heavy Formation) */}
                  <path
                    d="M 230,0 C 245,75 265,150 280,240 C 295,150 315,75 330,0 Z"
                    fill={isS2StalactitesColored ? s2StalactitesBase : '#4b5563'}
                    style={{ filter: isS2StalactitesColored ? 'brightness(0.4)' : undefined }}
                  />
                  <path
                    d="M 255,0 C 265,65 275,130 280,240 C 285,140 298,75 310,0 Z"
                    fill={isS2StalactitesColored ? s2StalactitesBase : '#6b7280'}
                    style={{ filter: isS2StalactitesColored ? 'brightness(1.4)' : undefined }}
                  />

                  {/* Stalactite 3 (Center) */}
                  <path
                    d="M 370,0 C 380,55 390,110 400,175 C 410,110 425,55 440,0 Z"
                    fill={isS2StalactitesColored ? s2StalactitesBase : '#374151'}
                  />

                  {/* Stalactite 4 (Mid-Right Prominent Formation) */}
                  <path
                    d="M 470,0 C 485,75 505,155 520,230 C 535,155 555,75 570,0 Z"
                    fill={isS2StalactitesColored ? s2StalactitesBase : '#6b7280'}
                    style={{ filter: isS2StalactitesColored ? 'brightness(0.4)' : undefined }}
                  />
                  <path
                    d="M 495,0 C 505,70 515,140 520,230 C 525,140 540,75 550,0 Z"
                    fill={isS2StalactitesColored ? s2StalactitesBase : '#9ca3af'}
                    style={{ filter: isS2StalactitesColored ? 'brightness(1.4)' : undefined }}
                  />

                  {/* Stalactite 5 (Right-Center) */}
                  <path
                    d="M 600,0 C 610,60 625,120 635,185 C 645,120 660,60 670,0 Z"
                    fill={isS2StalactitesColored ? s2StalactitesBase : '#374151'}
                  />
                </g>

                {/* Thick Cavern Stalagmites (#stalagmites) - Dynamic Shading */}
                <g id="stalagmites" {...getBorderProps(betaStyles['#stalagmites__border'] || betaStyles['#stalactites, #stalagmites__border'])}>
                  {/* Stalagmite 1 (Left floor) */}
                  <path
                    d="M 60,450 C 80,380 95,310 105,250 C 115,310 135,380 155,450 Z"
                    fill={isS2StalagmitesColored ? s2StalagmitesBase : '#374151'}
                    style={{ filter: isS2StalagmitesColored ? 'brightness(0.4)' : undefined }}
                  />
                  <path
                    d="M 85,450 C 95,370 100,310 105,250 C 110,320 120,380 130,450 Z"
                    fill={isS2StalagmitesColored ? s2StalagmitesBase : '#4b5563'}
                    style={{ filter: isS2StalagmitesColored ? 'brightness(1.4)' : undefined }}
                  />

                  {/* Stalagmite 2 (Mid-Left) */}
                  <path
                    d="M 230,440 C 245,370 260,310 270,255 C 280,310 295,370 310,440 Z"
                    fill={isS2StalagmitesColored ? s2StalagmitesBase : '#374151'}
                    style={{ filter: isS2StalagmitesColored ? 'brightness(0.4)' : undefined }}
                  />
                  <path
                    d="M 250,440 C 260,360 265,310 270,255 C 275,315 285,370 295,440 Z"
                    fill={isS2StalagmitesColored ? s2StalagmitesBase : '#4b5563'}
                    style={{ filter: isS2StalagmitesColored ? 'brightness(1.4)' : undefined }}
                  />

                  {/* Stalagmite 3 (Mid-Right near river) */}
                  <path
                    d="M 460,460 C 475,390 488,330 495,275 C 502,330 515,390 530,460 Z"
                    fill={isS2StalagmitesColored ? s2StalagmitesBase : '#374151'}
                    style={{ filter: isS2StalagmitesColored ? 'brightness(0.4)' : undefined }}
                  />
                  <path
                    d="M 478,460 C 488,380 492,330 495,275 C 498,335 508,390 518,460 Z"
                    fill={isS2StalagmitesColored ? s2StalagmitesBase : '#4b5563'}
                    style={{ filter: isS2StalagmitesColored ? 'brightness(1.4)' : undefined }}
                  />

                  {/* Stalagmite 4 (Right floor) */}
                  <path
                    d="M 640,445 C 655,375 670,310 680,250 C 690,310 705,375 720,445 Z"
                    fill={isS2StalagmitesColored ? s2StalagmitesBase : '#374151'}
                    style={{ filter: isS2StalagmitesColored ? 'brightness(0.4)' : undefined }}
                  />
                  <path
                    d="M 660,445 C 670,365 675,310 680,250 C 685,315 695,375 705,445 Z"
                    fill={isS2StalagmitesColored ? s2StalagmitesBase : '#4b5563'}
                    style={{ filter: isS2StalagmitesColored ? 'brightness(1.4)' : undefined }}
                  />
                </g>

                {/* Cavern Terraced Floor with Soft Rock Ledges */}
                <path
                  d="M 0,440 Q 220,400 420,430 Q 620,400 800,440 L 800,600 L 0,600 Z"
                  fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#1f2937'}
                  style={{ filter: 'brightness(0.7)' }}
                />

                {/* Smooth Continuous Underground River (#river) - Deep water applies brightness(0.6), shoreline ripples brightness(1.3) */}
                <g id="river" {...getBorderProps(betaStyles['#river__border'])}>
                  <path
                    d="M -20,475 Q 220,430 420,475 Q 620,520 820,475 L 820,560 Q 620,605 420,560 Q 220,515 -20,555 Z"
                    fill={solvedSectors.beta || betaStyles['#river'] ? s2RiverBase : '#374151'}
                    style={{ filter: solvedSectors.beta || betaStyles['#river'] ? 'brightness(0.6)' : undefined }}
                  />
                  {/* Shoreline ripple reflection */}
                  <path
                    d="M -20,477 Q 220,432 420,477 Q 620,522 820,477"
                    fill="none"
                    stroke={solvedSectors.beta || betaStyles['#river'] ? s2RiverBase : '#64748b'}
                    strokeWidth="3.5"
                    style={{ filter: solvedSectors.beta || betaStyles['#river'] ? 'brightness(1.3)' : undefined }}
                  />
                </g>

                {/* Cavern Foreground Floor Bank */}
                <path
                  d="M -20,555 Q 220,515 420,555 Q 620,600 820,555 L 820,600 L -20,600 Z"
                  fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#111827'}
                  style={{ filter: 'brightness(0.6)' }}
                />

                {/* Blocky Octagonal Faceted Crystal Gems (#crystal-gems) - Embedded in ground strata, spread across cavern, each with strictly unique size */}
                <g id="crystal-gems" {...getBorderProps(betaStyles['#crystal-gems__border'])}>
                  {/* Gem 1 (x=75, y=438): Medium-Tall Slanted Octagonal Column (Width: 28, Height: 50) */}
                  <g transform="translate(75, 438) rotate(8)">
                    {/* Rock Bed Crevice Shadow */}
                    <ellipse cx="0" cy="5" rx="18" ry="5" fill="#08020f" opacity="0.95" />
                    {/* Glowing Crystal Body Embedded Below Ground Line */}
                    <g
                      style={{
                        filter: solvedSectors.beta || betaStyles['#crystal-gems']
                          ? 'brightness(1.8) drop-shadow(0 0 10px currentColor)'
                          : undefined,
                      }}
                    >
                      <polygon
                        points="-12,8 -14,2 -14,-40 -8,-50 8,-50 14,-40 14,2 12,8"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#4b5563'}
                      />
                      <polygon
                        points="-14,2 -14,-40 -8,-50 -4,-44 -4,6"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#374151'}
                        style={{ filter: 'brightness(0.7)' }}
                      />
                      <polygon
                        points="-4,6 -4,-44 6,-44 6,6"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#6b7280'}
                      />
                      <polygon
                        points="6,6 6,-44 8,-50 14,-40 14,2"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#9ca3af'}
                        style={{ filter: 'brightness(1.25)' }}
                      />
                      <polygon points="-8,-50 8,-50 6,-44 -4,-44" fill="#ffffff" opacity="0.85" />
                      <line x1="-8" y1="-50" x2="8" y2="-50" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                    </g>
                    {/* Overlapping Jagged Bedrock Collar Embedding Gem in Ground */}
                    <polygon
                      points="-18,10 -15,1 -8,6 -1,-2 7,4 16,-1 18,10"
                      fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#1f2937'}
                      style={{ filter: 'brightness(0.7)' }}
                    />
                  </g>

                  {/* Gem 2 (x=185, y=432): Giant Monolithic Octagonal Geode (Width: 48, Height: 92) - Majestic Central Crystal */}
                  <g transform="translate(185, 432)">
                    {/* Rock Bed Crevice Shadow */}
                    <ellipse cx="0" cy="8" rx="30" ry="7" fill="#08020f" opacity="0.95" />
                    {/* Glowing Crystal Body */}
                    <g
                      style={{
                        filter: solvedSectors.beta || betaStyles['#crystal-gems']
                          ? 'brightness(1.8) drop-shadow(0 0 16px currentColor)'
                          : undefined,
                      }}
                    >
                      <polygon
                        points="-20,12 -24,2 -24,-76 -12,-92 12,-92 24,-76 24,2 20,12"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#4b5563'}
                      />
                      <polygon
                        points="-24,2 -24,-76 -12,-92 -6,-82 -6,10"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#374151'}
                        style={{ filter: 'brightness(0.68)' }}
                      />
                      <polygon
                        points="-6,10 -6,-82 10,-82 10,10"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#6b7280'}
                      />
                      <polygon
                        points="10,10 10,-82 12,-92 24,-76 24,2"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#9ca3af'}
                        style={{ filter: 'brightness(1.3)' }}
                      />
                      <polygon points="-12,-92 12,-92 10,-82 -6,-82" fill="#ffffff" opacity="0.9" />
                      <line x1="-12" y1="-92" x2="12" y2="-92" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                      <polygon points="-4,-78 2,-78 0,-68 -6,-68" fill="#ffffff" opacity="0.4" />
                    </g>
                    {/* Overlapping Jagged Bedrock Collar */}
                    <polygon
                      points="-28,12 -25,2 -18,7 -10,-4 0,5 12,-6 22,3 27,12"
                      fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#1f2937'}
                      style={{ filter: 'brightness(0.7)' }}
                    />
                  </g>

                  {/* Gem 3 (x=295, y=422): Tall Prismatic Octagonal Column (Width: 34, Height: 64) */}
                  <g transform="translate(295, 422) rotate(-5)">
                    {/* Rock Bed Crevice Shadow */}
                    <ellipse cx="0" cy="6" rx="22" ry="5" fill="#08020f" opacity="0.95" />
                    {/* Glowing Crystal Body */}
                    <g
                      style={{
                        filter: solvedSectors.beta || betaStyles['#crystal-gems']
                          ? 'brightness(1.8) drop-shadow(0 0 12px currentColor)'
                          : undefined,
                      }}
                    >
                      <polygon
                        points="-14,10 -17,2 -17,-52 -8,-64 8,-64 17,-52 17,2 14,10"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#4b5563'}
                      />
                      <polygon
                        points="-17,2 -17,-52 -8,-64 -4,-57 -4,8"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#374151'}
                        style={{ filter: 'brightness(0.7)' }}
                      />
                      <polygon
                        points="-4,8 -4,-57 7,-57 7,8"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#6b7280'}
                      />
                      <polygon
                        points="7,8 7,-57 8,-64 17,-52 17,2"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#9ca3af'}
                        style={{ filter: 'brightness(1.25)' }}
                      />
                      <polygon points="-8,-64 8,-64 7,-57 -4,-57" fill="#ffffff" opacity="0.85" />
                      <line x1="-8" y1="-64" x2="8" y2="-64" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    </g>
                    {/* Overlapping Jagged Bedrock Collar */}
                    <polygon
                      points="-20,10 -17,1 -11,7 -3,-2 6,6 14,-3 19,10"
                      fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#1f2937'}
                      style={{ filter: 'brightness(0.7)' }}
                    />
                  </g>

                  {/* Gem 4 (x=435, y=455): Chunky Riverbank Octagonal Block (Width: 30, Height: 42) */}
                  <g transform="translate(435, 455)">
                    {/* Rock Bed Crevice Shadow */}
                    <ellipse cx="0" cy="5" rx="19" ry="5" fill="#08020f" opacity="0.95" />
                    {/* Glowing Crystal Body */}
                    <g
                      style={{
                        filter: solvedSectors.beta || betaStyles['#crystal-gems']
                          ? 'brightness(1.8) drop-shadow(0 0 10px currentColor)'
                          : undefined,
                      }}
                    >
                      <polygon
                        points="-12,8 -15,1 -15,-32 -7,-42 7,-42 15,-32 15,1 12,8"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#4b5563'}
                      />
                      <polygon
                        points="-15,1 -15,-32 -7,-42 -3,-36 -3,6"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#374151'}
                        style={{ filter: 'brightness(0.72)' }}
                      />
                      <polygon
                        points="-3,6 -3,-36 6,-36 6,6"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#6b7280'}
                      />
                      <polygon
                        points="6,6 6,-36 7,-42 15,-32 15,1"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#9ca3af'}
                        style={{ filter: 'brightness(1.28)' }}
                      />
                      <polygon points="-7,-42 7,-42 6,-36 -3,-36" fill="#ffffff" opacity="0.85" />
                      <line x1="-7" y1="-42" x2="7" y2="-42" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                    </g>
                    {/* Overlapping Jagged Bedrock Collar */}
                    <polygon
                      points="-18,8 -15,0 -9,5 -1,-3 7,4 14,-1 17,8"
                      fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#1f2937'}
                      style={{ filter: 'brightness(0.7)' }}
                    />
                  </g>

                  {/* Gem 5 (x=540, y=420): Broad Faceted Octagonal Geode (Width: 40, Height: 56) */}
                  <g transform="translate(540, 420)">
                    {/* Rock Bed Crevice Shadow */}
                    <ellipse cx="0" cy="7" rx="25" ry="6" fill="#08020f" opacity="0.95" />
                    {/* Glowing Crystal Body */}
                    <g
                      style={{
                        filter: solvedSectors.beta || betaStyles['#crystal-gems']
                          ? 'brightness(1.8) drop-shadow(0 0 14px currentColor)'
                          : undefined,
                      }}
                    >
                      <polygon
                        points="-17,10 -20,2 -20,-44 -10,-56 10,-56 20,-44 20,2 17,10"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#4b5563'}
                      />
                      <polygon
                        points="-20,2 -20,-44 -10,-56 -5,-48 -5,8"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#374151'}
                        style={{ filter: 'brightness(0.7)' }}
                      />
                      <polygon
                        points="-5,8 -5,-48 8,-48 8,8"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#6b7280'}
                      />
                      <polygon
                        points="8,8 8,-48 10,-56 20,-44 20,2"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#9ca3af'}
                        style={{ filter: 'brightness(1.3)' }}
                      />
                      <polygon points="-10,-56 10,-56 8,-48 -5,-48" fill="#ffffff" opacity="0.9" />
                      <line x1="-10" y1="-56" x2="10" y2="-56" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                    </g>
                    {/* Overlapping Jagged Bedrock Collar */}
                    <polygon
                      points="-24,10 -20,1 -13,6 -4,-4 5,5 15,-5 23,2 25,10"
                      fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#1f2937'}
                      style={{ filter: 'brightness(0.7)' }}
                    />
                  </g>

                  {/* Gem 6 (x=640, y=424): Slender Tilted Gem Shard (Width: 22, Height: 36) */}
                  <g transform="translate(640, 424) rotate(-9)">
                    {/* Rock Bed Crevice Shadow */}
                    <ellipse cx="0" cy="4" rx="14" ry="4" fill="#08020f" opacity="0.95" />
                    {/* Glowing Crystal Body */}
                    <g
                      style={{
                        filter: solvedSectors.beta || betaStyles['#crystal-gems']
                          ? 'brightness(1.8) drop-shadow(0 0 9px currentColor)'
                          : undefined,
                      }}
                    >
                      <polygon
                        points="-9,6 -11,1 -11,-28 -5,-36 5,-36 11,-28 11,1 9,6"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#4b5563'}
                      />
                      <polygon
                        points="-11,1 -11,-28 -5,-36 -2,-30 -2,4"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#374151'}
                        style={{ filter: 'brightness(0.7)' }}
                      />
                      <polygon
                        points="-2,4 -2,-30 4,-30 4,4"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#6b7280'}
                      />
                      <polygon
                        points="4,4 4,-30 5,-36 11,-28 11,1"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#9ca3af'}
                        style={{ filter: 'brightness(1.25)' }}
                      />
                      <polygon points="-5,-36 5,-36 4,-30 -2,-30" fill="#ffffff" opacity="0.85" />
                      <line x1="-5" y1="-36" x2="5" y2="-36" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                    </g>
                    {/* Overlapping Jagged Bedrock Collar */}
                    <polygon
                      points="-14,6 -11,0 -6,4 0,-2 6,3 11,-1 14,6"
                      fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#1f2937'}
                      style={{ filter: 'brightness(0.7)' }}
                    />
                  </g>

                  {/* Gem 7 (x=735, y=438): Petite Nascent Octagonal Gem Bud (Width: 15, Height: 22) */}
                  <g transform="translate(735, 438) rotate(6)">
                    {/* Rock Bed Crevice Shadow */}
                    <ellipse cx="0" cy="3" rx="10" ry="3" fill="#08020f" opacity="0.95" />
                    {/* Glowing Crystal Body */}
                    <g
                      style={{
                        filter: solvedSectors.beta || betaStyles['#crystal-gems']
                          ? 'brightness(1.8) drop-shadow(0 0 8px currentColor)'
                          : undefined,
                      }}
                    >
                      <polygon
                        points="-6,4 -7,0 -7,-17 -3,-22 3,-22 7,-17 7,0 6,4"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#4b5563'}
                      />
                      <polygon
                        points="-7,0 -7,-17 -3,-22 -1,-18 -1,3"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#374151'}
                        style={{ filter: 'brightness(0.7)' }}
                      />
                      <polygon
                        points="-1,3 -1,-18 2,-18 2,3"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#6b7280'}
                      />
                      <polygon
                        points="2,3 2,-18 3,-22 7,-17 7,0"
                        fill={solvedSectors.beta || betaStyles['#crystal-gems'] ? s2GemsBase : '#9ca3af'}
                        style={{ filter: 'brightness(1.25)' }}
                      />
                      <polygon points="-3,-22 3,-22 2,-18 -1,-18" fill="#ffffff" opacity="0.85" />
                      <line x1="-3" y1="-22" x2="3" y2="-22" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                    </g>
                    {/* Overlapping Jagged Bedrock Collar */}
                    <polygon
                      points="-9,4 -7,0 -3,3 0,-1 4,2 7,-1 9,4"
                      fill={solvedSectors.beta || betaStyles['#cave-walls'] ? s2CaveWallsBase : '#1f2937'}
                      style={{ filter: 'brightness(0.7)' }}
                    />
                  </g>
                </g>

                {/* Subterranean Bioluminescent Plants & Cavern Flora (#plants) - Stalks with darker stroke, spore pods & droplets at brightness(1.6) */}
                <g id="plants" {...getBorderProps(betaStyles['#plants__border'])}>
                  {/* Left Alien Giant Mushroom with Curved Cap */}
                  <g transform="translate(100, 430)">
                    <path
                      d="M 12,0 Q 8,-35 4,-55"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#6b7280'}
                      strokeWidth="5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <path
                      d="M -16,-55 Q 4,-85 24,-55 Z"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#9ca3af'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6) drop-shadow(0 0 8px currentColor)' : undefined }}
                    />
                    <circle cx="4" cy="-68" r="3.5" fill="#ffffff" />
                    <circle cx="-6" cy="-60" r="2.5" fill="#ffffff" />
                    <circle cx="14" cy="-60" r="2.5" fill="#ffffff" />
                  </g>

                  {/* Left Mid-Ledge Mushroom Duo */}
                  <g transform="translate(142, 435)">
                    <path
                      d="M 0,0 Q 2,-20 8,-35"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#6b7280'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <path
                      d="M -6,-35 Q 8,-52 22,-35 Z"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#9ca3af'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                    <circle cx="8" cy="-42" r="2" fill="#ffffff" />
                    <path
                      d="M -12,0 Q -10,-12 -8,-22"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#6b7280'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <path
                      d="M -18,-22 Q -8,-32 2,-22 Z"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#cbd5e1'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                  </g>

                  {/* Mid-Cavern Bioluminescent Fern Fronds */}
                  <g transform="translate(340, 425)">
                    <path
                      d="M 0,0 Q -10,-20 -25,-32"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#6b7280'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <path
                      d="M 0,0 Q 0,-25 4,-40"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#4b5563'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <path
                      d="M 0,0 Q 12,-18 24,-28"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#6b7280'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <ellipse
                      cx="-25"
                      cy="-32"
                      rx="4"
                      ry="7"
                      transform="rotate(-35 -25 -32)"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#9ca3af'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                    <ellipse
                      cx="4"
                      cy="-40"
                      rx="4"
                      ry="7"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#cbd5e1'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                    <ellipse
                      cx="24"
                      cy="-28"
                      rx="4"
                      ry="7"
                      transform="rotate(35 24 -28)"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#9ca3af'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                  </g>

                  {/* Right Mid-Ledge Twin Glowing Spore Pods */}
                  <g transform="translate(605, 430)">
                    <path
                      d="M 0,0 Q -6,-25 -2,-45"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#4b5563'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <circle
                      cx="-2"
                      cy="-45"
                      r="7"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#cbd5e1'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6) drop-shadow(0 0 6px currentColor)' : undefined }}
                    />
                    <circle cx="-2" cy="-45" r="3.5" fill="#ffffff" />
                    <path
                      d="M 12,0 Q 16,-18 22,-30"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#6b7280'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <circle
                      cx="22"
                      cy="-30"
                      r="5"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#9ca3af'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                  </g>

                  {/* Right Glowing Spore Vine Tendrils */}
                  <g transform="translate(680, 410)">
                    <path
                      d="M 0,0 Q 25,-35 18,-70 Q 10,-105 0,-115"
                      fill="none"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#4b5563'}
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <circle
                      cx="0"
                      cy="-115"
                      r="8"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#cbd5e1'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6) drop-shadow(0 0 8px currentColor)' : undefined }}
                    />
                    <circle
                      cx="14"
                      cy="-70"
                      r="6"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#9ca3af'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                    <circle
                      cx="8"
                      cy="-35"
                      r="4.5"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#6b7280'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                  </g>

                  {/* Far Right Curled Spore Tendril */}
                  <g transform="translate(745, 435)">
                    <path
                      d="M 0,0 Q 15,-20 10,-45 Q 5,-60 -5,-62 Q -15,-60 -12,-48 Q -8,-40 0,-44"
                      fill="none"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#4b5563'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <circle
                      cx="-5"
                      cy="-62"
                      r="5"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#cbd5e1'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                    <circle
                      cx="8"
                      cy="-25"
                      r="4"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#9ca3af'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                  </g>

                  {/* Left Foreground Bioluminescent Flora */}
                  <g transform="translate(160, 565)">
                    <path
                      d="M 0,0 Q -8,-18 0,-34"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#6b7280'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <circle
                      cx="0"
                      cy="-34"
                      r="6"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#9ca3af'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                    <circle cx="0" cy="-34" r="2.5" fill="#ffffff" />
                    <path
                      d="M -12,0 Q -18,-12 -22,-20"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#4b5563'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <circle
                      cx="-22"
                      cy="-20"
                      r="4"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#cbd5e1'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                  </g>

                  {/* Right Foreground Glowing Frond */}
                  <g transform="translate(650, 570)">
                    <path
                      d="M 0,0 Q 8,-16 20,-28"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#4b5563'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <path
                      d="M 0,0 Q -5,-18 -4,-32"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#6b7280'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <ellipse
                      cx="20"
                      cy="-28"
                      rx="4"
                      ry="6"
                      transform="rotate(30 20 -28)"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#cbd5e1'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                    <ellipse
                      cx="-4"
                      cy="-32"
                      rx="4"
                      ry="6"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#9ca3af'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                  </g>

                  {/* Hanging Luminous Ceiling Vines */}
                  <g transform="translate(260, 95)">
                    <path
                      d="M 0,0 Q 8,25 4,50 Q 0,75 8,95"
                      fill="none"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#4b5563'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <circle
                      cx="4"
                      cy="50"
                      r="3.5"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#cbd5e1'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                    <circle
                      cx="8"
                      cy="95"
                      r="4.5"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#9ca3af'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                  </g>
                  <g transform="translate(530, 85)">
                    <path
                      d="M 0,0 Q -8,30 -2,60 Q 4,85 -4,110"
                      fill="none"
                      stroke={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#4b5563'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(0.7)' : undefined }}
                    />
                    <circle
                      cx="-2"
                      cy="60"
                      r="3.5"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#cbd5e1'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                    <circle
                      cx="-4"
                      cy="110"
                      r="4.5"
                      fill={solvedSectors.beta || betaStyles['#plants'] ? s2PlantsBase : '#9ca3af'}
                      style={{ filter: solvedSectors.beta || betaStyles['#plants'] ? 'brightness(1.6)' : undefined }}
                    />
                  </g>
                </g>
              </svg>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SCENERY 3: LUSH DESERT OASES IN VENUS (GAMMA)                 */}
            {/* ------------------------------------------------------------- */}
            {activeSector === 'gamma' && (
              <svg
                viewBox="0 0 800 600"
                className="w-full h-full object-cover"
                style={{
                  filter: isGammaColored ? 'none' : 'grayscale(100%) brightness(0.88)',
                  transition: 'filter 0.5s ease',
                }}
              >
                <defs>
                  <linearGradient id="scenery3DynamicSky" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor={s3SkyBase} />
                    <stop offset="100%" stopColor={s3SkyBase} style={{ filter: 'brightness(0.7)' }} />
                  </linearGradient>
                </defs>

                {/* Desert Twilight Sky (#sky) - Smooth gradient across backdrop */}
                <rect
                  id="sky"
                  width="800"
                  height="600"
                  fill={solvedSectors.gamma || gammaStyles['#sky'] || gammaStyles['rect'] ? 'url(#scenery3DynamicSky)' : '#111827'}
                  {...getBorderProps(gammaStyles['#sky__border'])}
                />

                {/* Unified Distant Mountains & Stepped Plateaus (#mountains, #plateaus) */}
                <g id="mountains" {...getBorderProps(gammaStyles['#mountains, #plateaus__border'] || gammaStyles['#mountains__border'])}>
                  {/* Farthest Volcanic Mountain Silhouette - Sharp peaks against twilight sky */}
                  <path
                    d="M 0,315 Q 70,220 150,250 Q 230,195 320,250 Q 420,175 520,240 Q 640,185 730,225 Q 770,205 800,235 L 800,600 L 0,600 Z"
                    fill={isS3TerrainColored ? s3MountainsBase : '#1f2937'}
                    style={{ opacity: 0.55 }}
                  />
                  <path
                    d="M 0,355 Q 160,265 340,315 Q 520,235 680,295 Q 750,265 800,305 L 800,600 L 0,600 Z"
                    fill={isS3TerrainColored ? s3MountainsBase : '#374151'}
                    style={{ opacity: 0.65 }}
                  />
                </g>

                {/* Distant Stepped Plateaus & Mesas with Flat Summit Rims (#mountains, #plateaus) */}
                <g id="plateaus" {...getBorderProps(gammaStyles['#mountains, #plateaus__border'] || gammaStyles['#plateaus__border'])}>
                  {/* Distant Left Plateau Mesa: Flat-topped with stepped canyon terrace */}
                  <path
                    d="M 45,340 L 80,248 L 200,248 L 235,340 Z"
                    fill={isS3TerrainColored ? s3PlateausBase : '#4b5563'}
                  />
                  {/* Flat summit rim ellipse catching light */}
                  <ellipse
                    cx="140"
                    cy="248"
                    rx="60"
                    ry="6.5"
                    fill={isS3TerrainColored ? s3PlateausBase : '#6b7280'}
                    style={{ filter: isS3TerrainColored ? 'brightness(1.25)' : undefined }}
                  />
                  {/* Mid-height stepped terrace ledge */}
                  <path
                    d="M 35,350 L 65,295 L 215,295 L 245,350 Z"
                    fill={isS3TerrainColored ? s3PlateausBase : '#374151'}
                    style={{ filter: isS3TerrainColored ? 'brightness(0.92)' : undefined }}
                  />
                  <ellipse
                    cx="140"
                    cy="295"
                    rx="75"
                    ry="7"
                    fill={isS3TerrainColored ? s3PlateausBase : '#4b5563'}
                    style={{ filter: isS3TerrainColored ? 'brightness(1.15)' : undefined }}
                  />

                  {/* Grand Distant Center-Right Plateau Mesa: Towering table mountain */}
                  <path
                    d="M 360,340 L 410,232 L 570,232 L 620,340 Z"
                    fill={isS3TerrainColored ? s3PlateausBase : '#4b5563'}
                  />
                  {/* Table-top flat summit rim */}
                  <ellipse
                    cx="490"
                    cy="232"
                    rx="80"
                    ry="7.5"
                    fill={isS3TerrainColored ? s3PlateausBase : '#6b7280'}
                    style={{ filter: isS3TerrainColored ? 'brightness(1.25)' : undefined }}
                  />
                  {/* Lower stepped cliff strata */}
                  <path
                    d="M 345,350 L 385,282 L 595,282 L 635,350 Z"
                    fill={isS3TerrainColored ? s3PlateausBase : '#374151'}
                    style={{ filter: isS3TerrainColored ? 'brightness(0.9)' : undefined }}
                  />
                  <ellipse
                    cx="490"
                    cy="282"
                    rx="105"
                    ry="8.5"
                    fill={isS3TerrainColored ? s3PlateausBase : '#4b5563'}
                    style={{ filter: isS3TerrainColored ? 'brightness(1.15)' : undefined }}
                  />

                  {/* Far-Right Stepped Butte / Plateau */}
                  <path
                    d="M 660,345 L 695,268 L 775,268 L 805,345 Z"
                    fill={isS3TerrainColored ? s3PlateausBase : '#4b5563'}
                  />
                  <ellipse
                    cx="735"
                    cy="268"
                    rx="40"
                    ry="5"
                    fill={isS3TerrainColored ? s3PlateausBase : '#6b7280'}
                    style={{ filter: isS3TerrainColored ? 'brightness(1.25)' : undefined }}
                  />

                  {/* Midground Rolling Desert Bedrock Dunes & Terraces */}
                  <path
                    d="M 0,380 Q 200,340 400,365 Q 600,340 800,380 L 800,600 L 0,600 Z"
                    fill={isS3TerrainColored ? s3TerrainBase : '#374151'}
                    style={{ filter: isS3TerrainColored ? 'brightness(0.85)' : undefined }}
                  />
                  <path
                    d="M 0,420 Q 220,385 430,410 Q 640,385 800,425 L 800,600 L 0,600 Z"
                    fill={isS3TerrainColored ? s3TerrainBase : '#4b5563'}
                    style={{ filter: isS3TerrainColored ? 'brightness(0.95)' : undefined }}
                  />
                </g>

                {/* Monolithic Rock Formations & Pebbles (#rock-formations) */}
                <g id="rock-formations" {...getBorderProps(gammaStyles['#rock-formations__border'])}>
                  {/* Smooth Standing Hoodoo Pillar */}
                  <path
                    d="M 638,430 Q 648,340 655,340 Q 662,340 672,430 Z"
                    fill={solvedSectors.gamma || gammaStyles['#rock-formations'] ? s3RocksBase : '#4b5563'}
                  />

                  {/* Left Oasis Boulder */}
                  <path
                    d="M 72,475 Q 82,450 96,450 Q 110,450 116,475 Z"
                    fill={solvedSectors.gamma || gammaStyles['#rock-formations'] ? s3RocksBase : '#4b5563'}
                  />
                  <ellipse
                    cx="96"
                    cy="453"
                    rx="7"
                    ry="2.5"
                    fill={solvedSectors.gamma || gammaStyles['#rock-formations'] ? s3RocksBase : '#6b7280'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#rock-formations'] ? 'brightness(1.15)' : undefined }}
                  />

                  {/* Terrace Boulder between Crater 2 & Crater 1 */}
                  <path
                    d="M 260,490 Q 270,465 285,465 Q 300,465 306,490 Z"
                    fill={solvedSectors.gamma || gammaStyles['#rock-formations'] ? s3RocksBase : '#4b5563'}
                  />
                  <ellipse
                    cx="285"
                    cy="468"
                    rx="8"
                    ry="2.5"
                    fill={solvedSectors.gamma || gammaStyles['#rock-formations'] ? s3RocksBase : '#6b7280'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#rock-formations'] ? 'brightness(1.15)' : undefined }}
                  />

                  {/* Right Plateau Foot Boulder */}
                  <path
                    d="M 585,482 Q 594,458 607,458 Q 620,458 626,482 Z"
                    fill={solvedSectors.gamma || gammaStyles['#rock-formations'] ? s3RocksBase : '#4b5563'}
                  />
                  <ellipse
                    cx="607"
                    cy="461"
                    rx="7"
                    ry="2.5"
                    fill={solvedSectors.gamma || gammaStyles['#rock-formations'] ? s3RocksBase : '#6b7280'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#rock-formations'] ? 'brightness(1.15)' : undefined }}
                  />

                  {/* Scattered Desert Stepping Stones & Mineral Pebbles */}
                  <ellipse
                    cx="335"
                    cy="524"
                    rx="7"
                    ry="3.5"
                    fill={solvedSectors.gamma || gammaStyles['#rock-formations'] ? s3RocksBase : '#4b5563'}
                  />
                  <ellipse
                    cx="485"
                    cy="528"
                    rx="8"
                    ry="4"
                    fill={solvedSectors.gamma || gammaStyles['#rock-formations'] ? s3RocksBase : '#374151'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#rock-formations'] ? 'brightness(0.6)' : undefined }}
                  />
                  <ellipse
                    cx="535"
                    cy="516"
                    rx="7"
                    ry="3.5"
                    fill={solvedSectors.gamma || gammaStyles['#rock-formations'] ? s3RocksBase : '#4b5563'}
                  />
                  <ellipse
                    cx="630"
                    cy="524"
                    rx="6"
                    ry="3"
                    fill={solvedSectors.gamma || gammaStyles['#rock-formations'] ? s3RocksBase : '#374151'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#rock-formations'] ? 'brightness(0.6)' : undefined }}
                  />
                </g>

                {/* 3 Impact Craters Scattered Over Main Ground with Varying Sizes (#craters) */}
                <g id="craters" {...getBorderProps(gammaStyles['#craters__border'])}>
                  {/* Crater 1 (Large Impact Basin - Central/Mid-Right, ~280px wide) */}
                  <path
                    d="M 290,470 Q 430,432 570,470 Q 520,535 430,535 Q 340,535 290,470 Z"
                    fill={solvedSectors.gamma || gammaStyles['#craters'] ? s3CratersBase : '#1f2937'}
                  />
                  {/* Sunward raised ejecta rim highlight */}
                  <path
                    d="M 300,468 Q 430,436 560,468 Q 430,444 300,468 Z"
                    fill={solvedSectors.gamma || gammaStyles['#craters'] ? s3CratersBase : '#374151'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#craters'] ? 'brightness(1.18)' : undefined }}
                  />
                  {/* Deep shadowed basin depression */}
                  <path
                    d="M 320,474 Q 430,450 540,474 Q 498,518 430,518 Q 362,518 320,474 Z"
                    fill={solvedSectors.gamma || gammaStyles['#craters'] ? s3CratersBase : '#111827'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#craters'] ? 'brightness(0.68)' : undefined }}
                  />
                  {/* Deepest central crater floor shadow */}
                  <ellipse
                    cx="430"
                    cy="488"
                    rx="80"
                    ry="18"
                    fill={solvedSectors.gamma || gammaStyles['#craters'] ? s3CratersBase : '#0b0f19'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#craters'] ? 'brightness(0.45)' : undefined }}
                  />

                  {/* Crater 2 (Medium Secondary Crater - Left Ground, ~155px wide) */}
                  <path
                    d="M 98,465 Q 175,442 252,465 Q 225,504 175,504 Q 125,504 98,465 Z"
                    fill={solvedSectors.gamma || gammaStyles['#craters'] ? s3CratersBase : '#1f2937'}
                  />
                  {/* Crater 2 rim highlight */}
                  <path
                    d="M 106,464 Q 175,445 244,464 Q 175,450 106,464 Z"
                    fill={solvedSectors.gamma || gammaStyles['#craters'] ? s3CratersBase : '#374151'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#craters'] ? 'brightness(1.15)' : undefined }}
                  />
                  {/* Crater 2 inner depression shadow */}
                  <path
                    d="M 115,467 Q 175,452 235,467 Q 215,496 175,496 Q 135,496 115,467 Z"
                    fill={solvedSectors.gamma || gammaStyles['#craters'] ? s3CratersBase : '#111827'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#craters'] ? 'brightness(0.68)' : undefined }}
                  />
                  {/* Crater 2 floor shadow */}
                  <ellipse
                    cx="175"
                    cy="476"
                    rx="42"
                    ry="10"
                    fill={solvedSectors.gamma || gammaStyles['#craters'] ? s3CratersBase : '#0b0f19'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#craters'] ? 'brightness(0.48)' : undefined }}
                  />

                  {/* Crater 3 (Small Ancient Crater - Right Ground, ~95px wide) */}
                  <path
                    d="M 632,498 Q 680,482 728,498 Q 712,522 680,522 Q 648,522 632,498 Z"
                    fill={solvedSectors.gamma || gammaStyles['#craters'] ? s3CratersBase : '#1f2937'}
                  />
                  {/* Crater 3 rim highlight */}
                  <path
                    d="M 638,497 Q 680,484 722,497 Q 680,488 638,497 Z"
                    fill={solvedSectors.gamma || gammaStyles['#craters'] ? s3CratersBase : '#374151'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#craters'] ? 'brightness(1.15)' : undefined }}
                  />
                  {/* Crater 3 inner depression shadow */}
                  <path
                    d="M 644,499 Q 680,488 716,499 Q 704,516 680,516 Q 656,516 644,499 Z"
                    fill={solvedSectors.gamma || gammaStyles['#craters'] ? s3CratersBase : '#111827'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#craters'] ? 'brightness(0.68)' : undefined }}
                  />
                  {/* Crater 3 floor shadow */}
                  <ellipse
                    cx="680"
                    cy="503"
                    rx="24"
                    ry="6"
                    fill={solvedSectors.gamma || gammaStyles['#craters'] ? s3CratersBase : '#0b0f19'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#craters'] ? 'brightness(0.48)' : undefined }}
                  />
                </g>

                {/* Scattered Desert Flora & Shrubbery across the ground (#oasis-vegetation) */}
                <g id="oasis-vegetation" {...getBorderProps(gammaStyles['#oasis-vegetation__border'])}>
                  {/* 1. Far Left Dune Bush */}
                  <path
                    d="M 85,445 Q 95,426 110,426 Q 125,426 135,445 Z"
                    fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#4b5563'}
                  />
                  <path
                    d="M 95,445 Q 102,434 110,434 Q 118,434 125,445 Z"
                    fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#6b7280'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(1.15)' : undefined }}
                  />

                  {/* 2. Left Crater Rim Palm Cluster (cresting Crater 2 rim) */}
                  <g transform="translate(235, 455)">
                    <path
                      d="M 0,0 Q -12,-26 -24,-42"
                      stroke={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#4b5563'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(0.4)' : undefined }}
                    />
                    <path
                      d="M 0,0 Q 2,-30 10,-46"
                      stroke={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#4b5563'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(0.4)' : undefined }}
                    />
                    <path
                      d="M -24,-42 Q -42,-46 -50,-35 Q -36,-35 -24,-42"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#6b7280'}
                    />
                    <path
                      d="M -24,-42 Q -30,-58 -18,-60 Q -18,-46 -24,-42"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#9ca3af'}
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(1.15)' : undefined }}
                    />
                    <path
                      d="M 10,-46 Q 4,-64 20,-62 Q 17,-50 10,-46"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#cbd5e1'}
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(1.2)' : undefined }}
                    />
                    <path
                      d="M 10,-46 Q 28,-54 36,-42 Q 24,-40 10,-46"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#9ca3af'}
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(1.15)' : undefined }}
                    />
                  </g>

                  {/* 3. Spiky Terrace Succulent (between Crater 2 & Crater 1) */}
                  <g transform="translate(290, 482)">
                    <path
                      d="M -9,0 Q -5,-12 0,-14 Q 5,-12 9,0 Z"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#4b5563'}
                    />
                    <path
                      d="M -4,0 Q -2,-8 0,-9 Q 2,-8 4,0 Z"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#9ca3af'}
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(1.2)' : undefined }}
                    />
                  </g>

                  {/* 4. Midground Terrace Reeds */}
                  <path
                    d="M 360,442 Q 365,428 370,428 Q 375,428 380,442 Z"
                    fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#4b5563'}
                  />

                  {/* 5. Tall Oasis Palm Cluster on North-East Rim of Large Crater */}
                  <g transform="translate(545, 458)">
                    <path
                      d="M 0,0 Q 14,-28 28,-46"
                      stroke={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#4b5563'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(0.4)' : undefined }}
                    />
                    <path
                      d="M 0,0 Q 0,-34 -7,-50"
                      stroke={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#4b5563'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(0.4)' : undefined }}
                    />
                    <path
                      d="M 28,-46 Q 46,-50 54,-38 Q 40,-38 28,-46"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#6b7280'}
                    />
                    <path
                      d="M 28,-46 Q 34,-62 22,-64 Q 22,-50 28,-46"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#9ca3af'}
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(1.15)' : undefined }}
                    />
                    <path
                      d="M -7,-50 Q 0,-68 -16,-66 Q -13,-54 -7,-50"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#cbd5e1'}
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(1.2)' : undefined }}
                    />
                    <path
                      d="M -7,-50 Q -26,-58 -34,-46 Q -22,-44 -7,-50"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#9ca3af'}
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(1.15)' : undefined }}
                    />
                  </g>

                  {/* 6. Midground Scrub near Hoodoo Base */}
                  <path
                    d="M 605,446 Q 615,428 628,428 Q 640,428 650,446 Z"
                    fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#4b5563'}
                  />
                  <path
                    d="M 614,446 Q 621,436 628,436 Q 635,436 642,446 Z"
                    fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#6b7280'}
                    style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(1.15)' : undefined }}
                  />

                  {/* 7. Hardy Succulent near Small Crater 3 */}
                  <g transform="translate(642, 492)">
                    <path
                      d="M -9,0 Q -5,-12 0,-14 Q 5,-12 9,0 Z"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#4b5563'}
                    />
                    <path
                      d="M -4,0 Q -2,-8 0,-9 Q 2,-8 4,0 Z"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#9ca3af'}
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(1.2)' : undefined }}
                    />
                  </g>

                  {/* 8. Far Right Ridge Scrub */}
                  <path
                    d="M 735,482 Q 743,466 754,466 Q 765,466 774,482 Z"
                    fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#4b5563'}
                  />

                  {/* 9. Foreground Desert Succulents */}
                  <g transform="translate(340, 545)">
                    <path
                      d="M -10,0 Q -6,-12 0,-14 Q 6,-12 10,0 Z"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#4b5563'}
                    />
                    <path
                      d="M -5,0 Q -3,-8 0,-9 Q 3,-8 5,0 Z"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#9ca3af'}
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(1.2)' : undefined }}
                    />
                  </g>
                  <g transform="translate(560, 545)">
                    <path
                      d="M -10,0 Q -6,-12 0,-14 Q 6,-12 10,0 Z"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#4b5563'}
                    />
                    <path
                      d="M -5,0 Q -3,-8 0,-9 Q 3,-8 5,0 Z"
                      fill={solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? s3VegBase : '#9ca3af'}
                      style={{ filter: solvedSectors.gamma || gammaStyles['#oasis-vegetation'] ? 'brightness(1.2)' : undefined }}
                    />
                  </g>
                </g>
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
