"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Check, Rocket } from 'lucide-react';

interface LanguageBadge {
  iconUrl?: string; // CDN URL for the language SVG icon (optional — omit to use Rocket fallback)
  label: string;
  color: string; // hex or rgba for the glow/accent
  bgWhite?: boolean; // optional explicit semi-transparent white background for icon container
  iconBg?: string; // custom background override for icon container
}

interface PlanetNodeProps {
  id: string;
  name: string;
  subtitle?: string;
  tags?: string[];
  description?: string;
  top: string;
  left: string;
  sizeClass: string; // e.g., 'w-48 h-48'
  src: string;
  repeatCount?: number;
  imgScale?: number;
  rotationSpeed?: number;
  reverse?: boolean;
  status?: 'COMPLETED' | 'CURRENT' | 'LOCKED';
  completedCount?: number;
  totalCount?: number;
  languageBadge?: LanguageBadge;
  hasCheckpoint?: boolean;
  tooltipSide?: 'left' | 'right';
}

export default function PlanetNode({
  id,
  name,
  subtitle,
  tags,
  description,
  top,
  left,
  sizeClass,
  src,
  repeatCount = 15,
  imgScale = 0.85,
  rotationSpeed = 25,
  reverse = false,
  status = 'LOCKED',
  completedCount = 0,
  totalCount = 5,
  languageBadge,
  hasCheckpoint = false,
  tooltipSide
}: PlanetNodeProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [iconImgError, setIconImgError] = useState(false);

  // Determine if tooltip should appear on the left or right of the planet
  // If planet is on the right half (left > 50%), show tooltip on left; otherwise right
  const side = tooltipSide || (parseFloat(left) > 50 ? 'left' : 'right');
  const tooltipPositionClass = side === 'left'
    ? 'right-full top-1/2 -translate-y-1/2 pr-5'
    : 'left-full top-1/2 -translate-y-1/2 pl-5';

  const isWhiteIconBg = Boolean(
    languageBadge?.bgWhite || 
    languageBadge?.label.toLowerCase() === 'java'
  );

  // Build combined list of badge tags (Language Tag + Concept Topic Tags)
  const allTags = [
    ...(languageBadge?.label ? [languageBadge.label] : []),
    ...(tags && tags.length > 0
      ? tags
      : subtitle
        ? subtitle.split(',').map(s => s.trim()).filter(Boolean)
        : [])
  ];

  // Uppercase the name in JS so the browser calculates widths based on capital letters
  const upperName = name.toUpperCase();

  // Dynamically calculate repeat count to fit the 289px circumference without overlaps
  const fontSize = 11.5; // SVG units
  const charWidth = fontSize * 0.45; // Average uppercase character width along SVG path
  const itemWidth = (upperName.length + 4) * charWidth; // upperName + "  •  "
  const calculatedRepeat = Math.max(2, Math.floor(289.03 / itemWidth));
  const actualRepeat = repeatCount === 15 ? calculatedRepeat : repeatCount;

  // Build a repeating string for the text path with double spaces and a trailing separator
  const repeatingLabel = Array(actualRepeat).fill(upperName).join('  •  ') + '  •';

  // State-specific visual class configuration
  const isLocked = status === 'LOCKED';
  const isCompleted = status === 'COMPLETED';
  const isCurrent = status === 'CURRENT';

  // Apply state classes
  const planetFilterClass = isLocked
    ? 'grayscale opacity-100 transition-all duration-300'
    : 'transition-all duration-300';

  const shadowGlowClass = isCompleted
    ? 'drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]'
    : isCurrent
      ? 'drop-shadow-[0_0_25px_rgba(255,145,45,0.35)]'
      : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]';

  // Overlay checkmark/lock badges
  const renderStatusBadge = () => {
    if (isCompleted) {
      return (
        <div className="absolute top-2 right-2 z-30 w-9 h-9 rounded-full bg-emerald-500 border-[2.5px] border-white flex items-center justify-center shadow-lg shadow-emerald-500/30 pointer-events-none">
          <Check size={18} strokeWidth={3} className="text-white" />
        </div>
      );
    }
    return null;
  };

  const renderCenteredStatus = () => {
    if (isLocked) {
      return (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/70 shadow-lg">
            <Lock size={16} />
          </div>
        </div>
      );
    }
    return null;
  };


  return (
    <div
      className={`absolute group transition-transform duration-300 ${sizeClass} ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      style={{
        top,
        left,
        transform: 'translate(-50%, -50%)' // Center at given coordinates
      }}
      onClick={() => {
        if (!isLocked) setIsFocused(prev => !prev);
      }}
    >
      {/* Radar Ring pulse animation for CURRENT node */}
      {isCurrent && (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[95%] h-[95%] bg-[#ff912d]/10 rounded-full animate-ping pointer-events-none" />
          <div className="absolute w-[115%] h-[115%] border border-[#ff912d]/20 rounded-full animate-pulse pointer-events-none" />
        </div>
      )}

      {/* Checkpoint Rocket sitting upright on the active planet with hover tooltip */}
      {hasCheckpoint && (
        <div className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 z-40 group/rocket pointer-events-auto flex flex-col items-center">
          {/* Hover Tooltip */}
          <div className="absolute bottom-full mb-2 opacity-0 group-hover/rocket:opacity-100 transition-all duration-200 pointer-events-none transform -translate-y-1 group-hover/rocket:translate-y-0 z-50">
            <div className="bg-[#1a082c]/95 backdrop-blur-md border border-[#ff912d]/60 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(255,145,45,0.4),0_4px_12px_rgba(0,0,0,0.7)] whitespace-nowrap flex items-center gap-1.5">
              <Rocket size={11} className="text-[#ff912d]" />
              <span>Current Mission</span>
            </div>
          </div>
          <div className="relative animate-bounce duration-1000 cursor-pointer">
            <img 
              src="/Checkpoint.svg?v=rocket-v3" 
              alt="Current Mission Checkpoint" 
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_20px_rgba(255,145,45,0.85)] drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] hover:scale-105 transition-transform duration-200" 
            />
          </div>
        </div>
      )}

      {/* Solid background mask to prevent flight path dashed lines from showing through */}
      <div className="absolute w-[70%] h-[70%] bg-[#130927] rounded-full z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* The Status Badges */}
      {renderStatusBadge()}
      {renderCenteredStatus()}

      {/* The Planet Graphic Wrapper */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none group-hover:scale-105 transition-transform duration-300">
        <img
          src={src}
          alt={name}
          className={`w-full h-full object-contain ${planetFilterClass} ${shadowGlowClass}`}
          style={{ transform: `scale(${imgScale})` }}
        />
      </div>

      {/* Rotating SVG Text (Disabled rotation for locked nodes) */}
      <svg
        className={`absolute inset-0 z-20 w-full h-full overflow-visible pointer-events-none ${isLocked ? 'opacity-25' : ''
          }`}
        viewBox="0 0 100 100"
        style={{
          animation: isLocked ? 'none' : `spin ${rotationSpeed}s linear infinite ${reverse ? 'reverse' : 'normal'}`
        }}
      >
        <defs>
          <path
            id={`orbit-path-${id}`}
            d="M 50, 50 m -46, 0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0"
            fill="none"
            stroke="none"
          />
        </defs>
        <text className="text-[11.5px] font-extrabold uppercase fill-white/90 pointer-events-none">
          <textPath href={`#orbit-path-${id}`} startOffset="0%" textLength="289.03" lengthAdjust="spacing">
            {repeatingLabel}
          </textPath>
        </text>
      </svg>


      {/* Floating Hover & Focus Tooltip Info (Frosted Glass select page tooltip) positioned on left or right */}
      <div
        className={`absolute z-50 w-96 sm:w-[410px] ${tooltipPositionClass} transition-all duration-200 ${isFocused
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-[#1a082c]/95 backdrop-blur-xl border border-[#ff912d]/30 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(255,145,45,0.2)]">
          
          {/* Header: Language Icon + Planet Name, Tags & Description — left aligned */}
          <div className="flex items-start gap-4">
            {/* Language Icon */}
            {languageBadge && (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5"
                style={{
                  background: languageBadge.iconBg || (isWhiteIconBg ? 'rgba(255, 255, 255, 0.18)' : `color-mix(in srgb, ${languageBadge.color} 18%, #1a082c)`),
                  borderColor: isWhiteIconBg ? 'rgba(255, 255, 255, 0.35)' : `color-mix(in srgb, ${languageBadge.color} 45%, transparent)`,
                  boxShadow: isWhiteIconBg ? '0 0 16px rgba(255, 255, 255, 0.2)' : `0 0 16px color-mix(in srgb, ${languageBadge.color} 30%, transparent)`,
                }}
              >
                {languageBadge.iconUrl && !iconImgError ? (
                  <img
                    src={languageBadge.iconUrl}
                    alt={languageBadge.label}
                    width={36}
                    height={36}
                    className="w-9 h-9 object-contain"
                    onError={() => setIconImgError(true)}
                    style={{ filter: isWhiteIconBg ? 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' : 'drop-shadow(0 0 5px rgba(255,255,255,0.25))' }}
                  />
                ) : (
                  <Rocket
                    size={28}
                    style={{ color: isWhiteIconBg ? '#ffffff' : languageBadge.color, filter: 'drop-shadow(0 0 8px currentColor)' }}
                  />
                )}
              </div>
            )}

            {/* Planet Name, Tag Pills Row & Description */}
            <div className="flex flex-col items-start leading-snug min-w-0 flex-1">
              <span className="text-white font-black tracking-widest uppercase text-lg font-display leading-tight">
                {name}
              </span>
              
              {/* Tag Pills Row (All tags rendered as colored badges) */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {allTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-black uppercase tracking-wider font-mono px-2.5 py-0.5 rounded-md"
                      style={{
                        color: languageBadge?.color || '#ff912d',
                        background: `color-mix(in srgb, ${languageBadge?.color || '#ff912d'} 15%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${languageBadge?.color || '#ff912d'} 40%, transparent)`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description Paragraph (Larger & clearer typography) */}
              {description && (
                <p className="text-white/90 text-sm font-medium mt-2.5 leading-snug">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-white/10 my-4" />

          {/* Progress & Action Row */}
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex flex-col items-start leading-none">
              <span className="text-white font-bold text-base font-mono">{completedCount}/{totalCount}</span>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">Missions</span>
            </div>

            {isLocked ? (
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Lock size={11} /> Locked
              </span>
            ) : (
              <Link
                href={`/modules/${id}`}
                className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-1.5 transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer ${isCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-300/80 shadow-[0_4px_14px_rgba(0,0,0,0.3),0_0_12px_rgba(16,185,129,0.35)]'
                    : 'bg-[#ff912d] hover:bg-orange-400 text-black shadow-[0_0_15px_rgba(255,145,45,0.4)]'
                  }`}
              >
                <Rocket size={13} className="animate-pulse" /> {isCompleted ? 'Replay' : 'Enter Orbit'}
              </Link>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
