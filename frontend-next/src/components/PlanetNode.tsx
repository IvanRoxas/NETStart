import React from 'react';
import Link from 'next/link';
import { Lock, Check, Rocket } from 'lucide-react';

interface PlanetNodeProps {
  id: string;
  name: string;
  subtitle: string;
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
}

export default function PlanetNode({ 
  id, 
  name, 
  subtitle,
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
  totalCount = 5
}: PlanetNodeProps) {
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
    ? 'grayscale opacity-40 group-hover:opacity-50 transition-all duration-300' 
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
        <div className="absolute top-2 right-2 z-30 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Check size={12} className="text-white font-bold" />
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

  // Prevent click navigation if node is locked
  const handleLinkClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
    }
  };

  return (
    <Link 
      href={`/modules/${id}`}
      onClick={handleLinkClick}
      className={`absolute group transition-transform duration-300 ${sizeClass} ${
        isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'
      }`}
      style={{
        top,
        left,
        transform: 'translate(-50%, -50%)' // Center at given coordinates
      }}
    >
      {/* Radar Ring pulse animation for CURRENT node */}
      {isCurrent && (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <div className="absolute w-[95%] h-[95%] bg-[#ff912d]/10 rounded-full animate-ping pointer-events-none" />
          <div className="absolute w-[115%] h-[115%] border border-[#ff912d]/20 rounded-full animate-pulse pointer-events-none" />
        </div>
      )}

      {/* Solid background mask to prevent flight path dashed lines from showing through */}
      <div className="absolute w-[70%] h-[70%] bg-[#130927] rounded-full z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* The Status Badges */}
      {renderStatusBadge()}
      {renderCenteredStatus()}

      {/* The Planet Graphic Wrapper */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <img 
          src={src} 
          alt={name} 
          className={`w-full h-full object-contain ${planetFilterClass} ${shadowGlowClass}`}
          style={{ transform: `scale(${imgScale})` }}
        />
      </div>

      {/* Rotating SVG Text (Disabled rotation for locked nodes) */}
      <svg 
        className={`absolute inset-0 z-20 w-full h-full overflow-visible ${
          isLocked ? 'opacity-25' : ''
        }`}
        viewBox="0 0 100 100"
        style={{
          animation: isLocked ? 'none' : `spin ${rotationSpeed}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal'
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

      {/* Floating Hover Tooltip Info (Frosted Glass select page tooltip) */}
      <div className="absolute z-50 w-56 p-4 bg-[#1a082c]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 transform -translate-x-1/2 left-1/2 top-full mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <div className="flex flex-col items-center text-center">
          <span className="text-white font-black tracking-widest uppercase text-sm">{name}</span>
          <span className="text-gray-400 text-xs font-medium mt-1">{subtitle}</span>
        </div>
        
        <div className="w-full h-px bg-white/10 my-3" />
        
        {/* Progress & Action Row */}
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-start leading-none">
            <span className="text-white font-bold text-sm">{completedCount}/{totalCount}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Completed</span>
          </div>
          
          {isLocked ? (
            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
              <Lock size={10} /> Locked
            </span>
          ) : (
            <span className="bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/30 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
              <Rocket size={10} className="animate-pulse" /> {isCompleted ? 'Revisit' : 'Enter Orbit'}
            </span>
          )}
        </div>
      </div>

    </Link>
  );
}
