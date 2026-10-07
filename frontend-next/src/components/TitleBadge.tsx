"use client";

import React from 'react';
import { getTitleDefinition, TitleDefinition } from '@/lib/titlesData';

interface TitleBadgeProps {
  title?: string | null;
  size?: 'sm' | 'md' | 'lg';
  showGlyph?: boolean;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export default function TitleBadge({
  title,
  size = 'md',
  showGlyph = true,
  className = '',
  onClick,
  interactive = false,
}: TitleBadgeProps) {
  const def: TitleDefinition = getTitleDefinition(title);

  // Size styling maps
  const sizeStyles = {
    sm: 'text-[11px] sm:text-xs py-1 px-2.5 tracking-wider gap-1.5 whitespace-nowrap',
    md: 'text-xs sm:text-[13px] py-1.5 px-3.5 tracking-wider gap-1.5 whitespace-nowrap',
    lg: 'text-xs sm:text-sm py-1.5 px-4 tracking-wide gap-2 font-bold shadow-md whitespace-nowrap',
  }[size];

  // Specific bespoke renderer for each unique title
  switch (def.id) {
    // 1. Novice Explorer: Classic NETStart Amber Orbit Pill (Default Design)
    case 'title-novice-explorer':
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-bold uppercase transition-all duration-300 select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          {/* Classic NETStart Default Pill Frame */}
          <div className="absolute inset-0 bg-[#ff912d]/15 border border-[#ff912d]/50 rounded-full shadow-[0_0_12px_rgba(255,145,45,0.25)]" />

          {/* Content */}
          {showGlyph && (
            <svg className="relative z-10 w-3.5 h-3.5 text-[#ff912d] shrink-0 drop-shadow-[0_0_6px_rgba(255,145,45,0.6)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          )}
          <span className="relative z-10 text-[#ff912d] font-bold tracking-wider drop-shadow-sm">
            {def.name}
          </span>
        </div>
      );

    // 2. Logic Prodigy: Quantum Matrix HUD Brackets
    case 'title-logic-prodigy':
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-mono font-black uppercase transition-all duration-300 select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          {/* Cyber Terminal Frame */}
          <div className="absolute inset-0 bg-black/90 border border-emerald-400/70 rounded-md shadow-[0_0_16px_rgba(16,185,129,0.45)] backdrop-blur-md" />
          {/* Scanline & Bracket Accents */}
          <div className="absolute left-0 inset-y-0 w-1 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
          <div className="absolute right-0 inset-y-0 w-1 bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

          {/* Dynamic Edge Elements: Cyber HUD Corner Brackets & Notches */}
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400 pointer-events-none shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400 pointer-events-none shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400 pointer-events-none shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400 pointer-events-none shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,1)] pointer-events-none" />
          <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,1)] pointer-events-none" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-[0_0_6px_rgba(52,211,153,1)] animate-ping pointer-events-none" />

          {/* Content */}
          <span className="relative z-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)] text-[0.8em]">
            [//
          </span>
          {showGlyph && (
            <span className="relative z-10 text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
              {def.glyph}
            </span>
          )}
          <span className="relative z-10 text-emerald-300 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]">
            {def.name}
          </span>
          <span className="relative z-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)] text-[0.8em]">
            //]
          </span>
        </div>
      );

    // 3. Lunar Pioneer: Silver Moonstone & Lunar Crater Notches (The Moon)
    case 'title-lunar-pioneer':
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-bold uppercase transition-all duration-300 select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          {/* Pale Moonstone Crystal Frame */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-[#0f172a] to-slate-950/95 border-2 border-slate-300/80 rounded-xl shadow-[0_0_16px_rgba(203,213,225,0.4)] backdrop-blur-md" />
          <div className="absolute inset-x-2 inset-y-0.5 border-t border-b border-slate-400/20 pointer-events-none" />

          {/* Dynamic Edge Elements: Silver Crater Studs & Orbit Runner Bars */}
          <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-slate-200 border border-slate-400 shadow-[0_0_6px_rgba(255,255,255,0.8)] pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-slate-200 border border-slate-400 shadow-[0_0_6px_rgba(255,255,255,0.8)] pointer-events-none" />
          <span className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-slate-200 border border-slate-400 shadow-[0_0_6px_rgba(255,255,255,0.8)] pointer-events-none" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-slate-200 border border-slate-400 shadow-[0_0_6px_rgba(255,255,255,0.8)] pointer-events-none" />
          <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-slate-200 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)] pointer-events-none" />
          <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-slate-200 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)] pointer-events-none" />
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-1.5 bg-slate-300 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.7)] pointer-events-none" />
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 bg-slate-300 rounded-full shadow-[0_0_6px_rgba(255,255,255,0.7)] pointer-events-none" />

          {/* Content */}
          <span className="relative z-10 text-slate-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
            {showGlyph && def.glyph}
          </span>
          <span className="relative z-10 text-slate-100 font-sans tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
            {def.name}
          </span>
          {showGlyph && (
            <span className="relative z-10 text-slate-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">
              {def.glyph}
            </span>
          )}
        </div>
      );

    // 4. Planetary Pioneer: Martian Magma & Crimson Ember (Mars)
    case 'title-planetary-pioneer':
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-black uppercase transition-all duration-300 select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          {/* Volcanic Beveled Crest */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-950 via-[#1f090d] to-red-950 border-2 border-rose-500/70 rounded-xl shadow-[0_0_18px_rgba(244,63,94,0.45)] backdrop-blur-md" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/30 via-transparent to-rose-500/30 rounded-xl blur-sm -z-10" />

          {/* Dynamic Edge Elements: Heavy Armor Corner Clips & Magma Studs */}
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-rose-400 rounded-tl-sm shadow-[0_0_8px_rgba(244,63,94,0.8)] pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-rose-400 rounded-tr-sm shadow-[0_0_8px_rgba(244,63,94,0.8)] pointer-events-none" />
          <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-rose-400 rounded-bl-sm shadow-[0_0_8px_rgba(244,63,94,0.8)] pointer-events-none" />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-rose-400 rounded-br-sm shadow-[0_0_8px_rgba(244,63,94,0.8)] pointer-events-none" />
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-amber-400 border border-rose-600 shadow-[0_0_8px_rgba(251,191,36,1)] pointer-events-none" />
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-amber-400 border border-rose-600 shadow-[0_0_8px_rgba(251,191,36,1)] pointer-events-none" />
          <span className="absolute -top-[2px] left-1/3 -translate-x-1/2 w-3 h-[2px] bg-rose-400 rounded-full shadow-[0_0_6px_rgba(244,63,94,1)] pointer-events-none" />
          <span className="absolute -top-[2px] right-1/3 translate-x-1/2 w-3 h-[2px] bg-rose-400 rounded-full shadow-[0_0_6px_rgba(244,63,94,1)] pointer-events-none" />
          <span className="absolute -bottom-[2px] left-1/3 -translate-x-1/2 w-3 h-[2px] bg-rose-400 rounded-full shadow-[0_0_6px_rgba(244,63,94,1)] pointer-events-none" />
          <span className="absolute -bottom-[2px] right-1/3 translate-x-1/2 w-3 h-[2px] bg-rose-400 rounded-full shadow-[0_0_6px_rgba(244,63,94,1)] pointer-events-none" />

          {/* Content */}
          <span className="relative z-10 text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]">
            {showGlyph && def.glyph}
          </span>
          <span className="relative z-10 bg-gradient-to-r from-rose-200 via-amber-200 to-rose-200 bg-clip-text text-transparent font-sans tracking-wide drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
            {def.name}
          </span>
          {showGlyph && (
            <span className="relative z-10 text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]">
              {def.glyph}
            </span>
          )}
        </div>
      );

    // 5. Venusian Voyager: Golden Thermal Aura & Volcanic Clouds (Venus)
    case 'title-venusian-voyager':
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-black uppercase transition-all duration-300 select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          {/* Sulfuric Thermal Atmosphere Frame */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#290d05] via-[#1a0803] to-[#290d05] border-2 border-orange-400/80 rounded-xl shadow-[0_0_18px_rgba(249,115,22,0.45)] backdrop-blur-md" />
          <div className="absolute inset-x-2 inset-y-1 border border-amber-500/20 rounded-lg pointer-events-none" />

          {/* Dynamic Edge Elements: Thermal Corner Clips & Solar Heat Bars */}
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-orange-400 rounded-tl-sm shadow-[0_0_8px_rgba(249,115,22,0.8)] pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-orange-400 rounded-tr-sm shadow-[0_0_8px_rgba(249,115,22,0.8)] pointer-events-none" />
          <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-orange-400 rounded-bl-sm shadow-[0_0_8px_rgba(249,115,22,0.8)] pointer-events-none" />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-orange-400 rounded-br-sm shadow-[0_0_8px_rgba(249,115,22,0.8)] pointer-events-none" />
          <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-amber-300 rounded-full shadow-[0_0_8px_rgba(251,191,36,1)] pointer-events-none" />
          <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-amber-300 rounded-full shadow-[0_0_8px_rgba(251,191,36,1)] pointer-events-none" />
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-orange-400 border border-amber-300 shadow-[0_0_6px_rgba(249,115,22,1)] pointer-events-none" />
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-orange-400 border border-amber-300 shadow-[0_0_6px_rgba(249,115,22,1)] pointer-events-none" />

          {/* Content */}
          <span className="relative z-10 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.9)]">
            {showGlyph && def.glyph}
          </span>
          <span className="relative z-10 bg-gradient-to-r from-amber-200 via-orange-100 to-amber-200 bg-clip-text text-transparent font-sans tracking-wide drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">
            {def.name}
          </span>
          {showGlyph && (
            <span className="relative z-10 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.9)]">
              {def.glyph}
            </span>
          )}
        </div>
      );

    // 6. Mercurian Scout: Swift Solar Speed Brackets & Molten Bronze (Mercury)
    case 'title-mercurian-scout':
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-mono font-bold uppercase transition-all duration-300 select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          {/* Molten Bronze Solar Shield Frame */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1c120c] via-[#0f0906] to-[#1c120c] border-2 border-amber-500/80 rounded-lg shadow-[0_0_16px_rgba(217,119,6,0.45)] backdrop-blur-md" />

          {/* Dynamic Edge Elements: Swift Chevrons & Tachyon Speed Bars */}
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400 pointer-events-none shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400 pointer-events-none shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400 pointer-events-none shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400 pointer-events-none shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
          <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-3.5 h-[2px] bg-amber-400 rounded-full shadow-[0_0_6px_rgba(245,158,11,1)] pointer-events-none" />
          <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-3.5 h-[2px] bg-amber-400 rounded-full shadow-[0_0_6px_rgba(245,158,11,1)] pointer-events-none" />
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-2 bg-amber-400 rounded-sm shadow-[0_0_6px_rgba(245,158,11,1)] pointer-events-none" />
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-2 bg-amber-400 rounded-sm shadow-[0_0_6px_rgba(245,158,11,1)] pointer-events-none" />

          {/* Content */}
          <span className="relative z-10 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]">
            {showGlyph && def.glyph}
          </span>
          <span className="relative z-10 text-amber-200 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
            {def.name}
          </span>
          {showGlyph && (
            <span className="relative z-10 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]">
              {def.glyph}
            </span>
          )}
        </div>
      );

    // 7. Jovian Sovereign: Great Red Spot Storm Vortex (Jupiter)
    case 'title-jovian-sovereign':
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-black uppercase transition-all duration-300 select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          {/* Great Red Spot Storm Vortex Frame */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2a0e14] via-[#120722] to-[#2a0e14] border-2 border-rose-400/80 rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.55)] backdrop-blur-md" />
          <div className="absolute inset-x-2 inset-y-1 border border-rose-300/20 rounded-xl pointer-events-none" />

          {/* Dynamic Edge Elements: Storm Vortex Nodes & Electromagnetic Rails */}
          <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-rose-400 border border-amber-300 shadow-[0_0_8px_rgba(244,63,94,1)] pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400 border border-amber-300 shadow-[0_0_8px_rgba(244,63,94,1)] pointer-events-none" />
          <span className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-rose-400 border border-amber-300 shadow-[0_0_8px_rgba(244,63,94,1)] pointer-events-none" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-rose-400 border border-amber-300 shadow-[0_0_8px_rgba(244,63,94,1)] pointer-events-none" />
          <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 rounded-full shadow-[0_0_8px_rgba(244,63,94,1)] pointer-events-none" />
          <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 rounded-full shadow-[0_0_8px_rgba(244,63,94,1)] pointer-events-none" />
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-rose-400 border border-amber-300 shadow-[0_0_6px_rgba(244,63,94,1)] pointer-events-none" />
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-rose-400 border border-amber-300 shadow-[0_0_6px_rgba(244,63,94,1)] pointer-events-none" />

          {/* Content */}
          <span className="relative z-10 text-rose-300 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse">
            {showGlyph && def.glyph}
          </span>
          <span className="relative z-10 bg-gradient-to-r from-rose-200 via-amber-100 to-rose-200 bg-clip-text text-transparent font-sans tracking-wide drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]">
            {def.name}
          </span>
          {showGlyph && (
            <span className="relative z-10 text-rose-300 drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-pulse">
              {def.glyph}
            </span>
          )}
        </div>
      );

    // 8. Void Architect: Deep Void Amethyst & Lightning (Saturn)
    case 'title-void-architect':
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-extrabold uppercase transition-all duration-300 select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          {/* Faceted Prismatic Dark Diamond Silhouette */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-950/95 via-indigo-950 to-purple-950/95 border-2 border-purple-400/80 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.55)] backdrop-blur-md" />
          <div className="absolute inset-x-2 inset-y-0.5 border-t border-b border-purple-300/30 pointer-events-none" />

          {/* Dynamic Edge Elements: Prismatic Corner Facets & Rift Bars */}
          <span className="absolute -top-1 -left-1 w-2 h-2 rotate-45 bg-purple-300 border border-purple-500 shadow-[0_0_8px_rgba(192,132,252,1)] pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rotate-45 bg-purple-300 border border-purple-500 shadow-[0_0_8px_rgba(192,132,252,1)] pointer-events-none" />
          <span className="absolute -bottom-1 -left-1 w-2 h-2 rotate-45 bg-purple-300 border border-purple-500 shadow-[0_0_8px_rgba(192,132,252,1)] pointer-events-none" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 rotate-45 bg-purple-300 border border-purple-500 shadow-[0_0_8px_rgba(192,132,252,1)] pointer-events-none" />
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-[3px] h-3 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,1)] pointer-events-none" />
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-[3px] h-3 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,1)] pointer-events-none" />
          <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-fuchsia-300 rounded-full shadow-[0_0_6px_rgba(232,121,249,1)] pointer-events-none" />
          <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-fuchsia-300 rounded-full shadow-[0_0_6px_rgba(232,121,249,1)] pointer-events-none" />

          {/* Content */}
          <span className="relative z-10 text-purple-300 drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]">
            {showGlyph && def.glyph}
          </span>
          <span className="relative z-10 bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-200 bg-clip-text text-transparent font-sans tracking-wide drop-shadow-[0_0_10px_rgba(192,132,252,0.7)]">
            {def.name}
          </span>
          {showGlyph && (
            <span className="relative z-10 text-purple-300 drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]">
              {def.glyph}
            </span>
          )}
        </div>
      );

    // 9. Terran Maestro: Emerald Biosphere & Azure Latitude (Earth)
    case 'title-terran-maestro':
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-black uppercase transition-all duration-300 select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          {/* Curved Oceanic Latitude Frame */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-teal-950 to-blue-950 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_22px_rgba(16,185,129,0.5)] backdrop-blur-md" />
          <div className="absolute inset-x-2 inset-y-1 border border-teal-300/20 rounded-xl pointer-events-none" />

          {/* Dynamic Edge Elements: Orbital Satellite Corner Nodes & Coordinate Ticks */}
          <span className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-emerald-400 border border-teal-200 shadow-[0_0_8px_rgba(52,211,153,1)] pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-teal-200 shadow-[0_0_8px_rgba(52,211,153,1)] pointer-events-none" />
          <span className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-teal-400 border border-blue-200 shadow-[0_0_8px_rgba(45,212,191,1)] pointer-events-none" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-teal-400 border border-blue-200 shadow-[0_0_8px_rgba(45,212,191,1)] pointer-events-none" />
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[2px] h-2 bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,1)] pointer-events-none" />
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[2px] h-2 bg-teal-300 shadow-[0_0_6px_rgba(45,212,191,1)] pointer-events-none" />
          <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-[2px] bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,1)] pointer-events-none" />
          <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-[2px] bg-teal-300 shadow-[0_0_6px_rgba(45,212,191,1)] pointer-events-none" />

          {/* Content */}
          <span className="relative z-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.9)]">
            {showGlyph && def.glyph}
          </span>
          <span className="relative z-10 bg-gradient-to-r from-emerald-200 via-teal-100 to-cyan-200 bg-clip-text text-transparent font-sans tracking-wide drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
            {def.name}
          </span>
          {showGlyph && (
            <span className="relative z-10 text-teal-300 drop-shadow-[0_0_10px_rgba(45,212,191,0.9)]">
              {def.glyph}
            </span>
          )}
        </div>
      );

    // 10. Grand Celestial Master: Mythic 24K Celestial Sovereign (All Planets / Level 10)
    case 'title-grand-celestial-master':
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-black uppercase transition-all duration-300 select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          {/* 24K Sovereign Halo with Winged Accents */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950 via-[#2a1a04] to-amber-950 border-2 border-yellow-400 rounded-xl shadow-[0_0_26px_rgba(250,204,21,0.7)] backdrop-blur-md" />
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/30 via-amber-400/50 to-yellow-500/30 rounded-xl blur-[4px] -z-10 animate-pulse" />
          <div className="absolute inset-x-1.5 inset-y-0.5 border border-yellow-300/40 rounded-lg pointer-events-none" />

          {/* Dynamic Edge Elements: Ornate Golden Crown Brackets, Spikes & Pips */}
          <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-yellow-300 rounded-tl-sm shadow-[0_0_10px_rgba(250,204,21,1)] pointer-events-none" />
          <span className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-yellow-300 rounded-tr-sm shadow-[0_0_10px_rgba(250,204,21,1)] pointer-events-none" />
          <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-yellow-300 rounded-bl-sm shadow-[0_0_10px_rgba(250,204,21,1)] pointer-events-none" />
          <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-yellow-300 rounded-br-sm shadow-[0_0_10px_rgba(250,204,21,1)] pointer-events-none" />
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,1)] select-none pointer-events-none">▲</span>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,1)] select-none pointer-events-none">▼</span>
          <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-2 rotate-45 bg-yellow-300 border border-amber-600 shadow-[0_0_10px_rgba(250,204,21,1)] pointer-events-none" />
          <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-2 rotate-45 bg-yellow-300 border border-amber-600 shadow-[0_0_10px_rgba(250,204,21,1)] pointer-events-none" />

          {/* Left / Right Crown Flairs */}
          <span className="absolute -top-1.5 -left-1 text-[11px] select-none filter drop-shadow-[0_0_6px_rgba(250,204,21,0.9)] pointer-events-none">
            ★
          </span>
          <span className="absolute -top-1.5 -right-1 text-[11px] select-none filter drop-shadow-[0_0_6px_rgba(250,204,21,0.9)] pointer-events-none">
            ★
          </span>

          {/* Content */}
          <span className="relative z-10 text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,1)] text-[1.05em]">
            {showGlyph && def.glyph}
          </span>
          <span className="relative z-10 bg-gradient-to-r from-yellow-100 via-amber-200 to-yellow-100 bg-clip-text text-transparent font-sans tracking-wide drop-shadow-[0_0_12px_rgba(234,179,8,0.9)]">
            {def.name}
          </span>
          {showGlyph && (
            <span className="relative z-10 text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,1)] text-[1.05em]">
              {def.glyph}
            </span>
          )}
        </div>
      );

    // 11. Daily Vanguard: Solar Flare Corona & Amber Sunburst
    case 'title-daily-vanguard':
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-black uppercase transition-all duration-300 select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          {/* Solar Corona Crest */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950 via-orange-950 to-amber-950 border-2 border-amber-400/90 rounded-full shadow-[0_0_22px_rgba(251,191,36,0.6)] backdrop-blur-md" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400/40 via-orange-500/40 to-amber-400/40 rounded-full blur-[3px] -z-10" />

          {/* Dynamic Edge Elements: Cardinal Solar Pips & Corona Radiants */}
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-amber-300 border border-orange-500 shadow-[0_0_10px_rgba(251,191,36,1)] pointer-events-none" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-amber-300 border border-orange-500 shadow-[0_0_10px_rgba(251,191,36,1)] pointer-events-none" />
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-amber-300 border border-orange-500 shadow-[0_0_10px_rgba(251,191,36,1)] pointer-events-none" />
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-amber-300 border border-orange-500 shadow-[0_0_10px_rgba(251,191,36,1)] pointer-events-none" />
          <span className="absolute -top-0.5 left-1/4 w-2 h-1 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.9)] pointer-events-none" />
          <span className="absolute -top-0.5 right-1/4 w-2 h-1 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.9)] pointer-events-none" />
          <span className="absolute -bottom-0.5 left-1/4 w-2 h-1 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.9)] pointer-events-none" />
          <span className="absolute -bottom-0.5 right-1/4 w-2 h-1 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.9)] pointer-events-none" />

          {/* Content */}
          <span className="relative z-10 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-spin-slow">
            {showGlyph && def.glyph}
          </span>
          <span className="relative z-10 text-amber-200 font-sans tracking-wide drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
            {def.name}
          </span>
          {showGlyph && (
            <span className="relative z-10 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-spin-slow">
              {def.glyph}
            </span>
          )}
        </div>
      );

    // 12. Cosmic Stylist: Prismatic Iridescent Hologram
    case 'title-cosmic-stylist':
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-extrabold uppercase transition-all duration-300 select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          {/* Holographic Chroma Shift Glass */}
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-950/80 via-purple-950/80 to-cyan-950/80 border-2 border-fuchsia-400/70 rounded-xl shadow-[0_0_20px_rgba(232,121,249,0.4)] backdrop-blur-md" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-pink-400/10 to-transparent rounded-xl pointer-events-none" />

          {/* Dynamic Edge Elements: Prismatic Brackets & Spectral Pills */}
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400 rounded-tl shadow-[0_0_8px_rgba(6,182,212,0.9)] pointer-events-none" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-pink-400 rounded-tr shadow-[0_0_8px_rgba(244,114,182,0.9)] pointer-events-none" />
          <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-pink-400 rounded-bl shadow-[0_0_8px_rgba(244,114,182,0.9)] pointer-events-none" />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400 rounded-br shadow-[0_0_8px_rgba(6,182,212,0.9)] pointer-events-none" />
          <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-gradient-to-r from-cyan-400 via-white to-pink-400 rounded-full shadow-[0_0_6px_rgba(232,121,249,1)] pointer-events-none" />
          <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-gradient-to-r from-pink-400 via-white to-cyan-400 rounded-full shadow-[0_0_6px_rgba(232,121,249,1)] pointer-events-none" />
          <span className="absolute top-1/2 -left-1 -translate-y-1/2 w-[2px] h-2.5 bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,1)] pointer-events-none" />
          <span className="absolute top-1/2 -right-1 -translate-y-1/2 w-[2px] h-2.5 bg-pink-400 shadow-[0_0_6px_rgba(244,114,182,1)] pointer-events-none" />

          {/* Content */}
          <span className="relative z-10 text-pink-300 drop-shadow-[0_0_10px_rgba(244,114,182,0.9)]">
            {showGlyph && def.glyph}
          </span>
          <span className="relative z-10 bg-gradient-to-r from-pink-200 via-cyan-200 to-fuchsia-200 bg-clip-text text-transparent font-sans tracking-wide drop-shadow-[0_0_8px_rgba(232,121,249,0.7)]">
            {def.name}
          </span>
          {showGlyph && (
            <span className="relative z-10 text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.9)]">
              {def.glyph}
            </span>
          )}
        </div>
      );

    // Default Fallback
    default:
      return (
        <div
          onClick={onClick}
          className={`relative inline-flex items-center font-bold uppercase transition-all select-none ${sizeStyles} ${
            interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
          } ${className}`}
        >
          <div className="absolute inset-0 bg-[#ff912d]/15 border border-[#ff912d]/50 rounded-full shadow-[0_0_12px_rgba(255,145,45,0.25)]" />
          {showGlyph && (
            <svg className="relative z-10 w-3.5 h-3.5 text-[#ff912d] shrink-0 drop-shadow-[0_0_6px_rgba(255,145,45,0.6)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          )}
          <span className="relative z-10 text-[#ff912d] font-bold tracking-wider drop-shadow-sm">{def.name}</span>
        </div>
      );
  }
}
