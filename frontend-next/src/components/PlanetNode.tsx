import React from 'react';
import Link from 'next/link';

interface PlanetNodeProps {
  id: string;
  name: string;
  top: string;
  left: string;
  sizeClass: string; // e.g., 'w-48 h-48'
  src: string;
  repeatCount?: number;
  imgScale?: number;
  rotationSpeed?: number;
  reverse?: boolean;
}

export default function PlanetNode({ 
  id, 
  name, 
  top, 
  left, 
  sizeClass, 
  src, 
  repeatCount = 15, 
  imgScale = 0.85,
  rotationSpeed = 25,
  reverse = false
}: PlanetNodeProps) {
  // Uppercase the name in JS so the browser calculates widths based on capital letters
  const upperName = name.toUpperCase();

  // Dynamically calculate repeat count to fit the 289px circumference without overlaps
  const fontSize = 11.5; // SVG units
  const charWidth = fontSize * 0.45; // Average uppercase character width along SVG path
  const itemWidth = (upperName.length + 4) * charWidth; // upperName + "  •  "
  const calculatedRepeat = Math.max(2, Math.floor(289.03 / itemWidth));
  const actualRepeat = repeatCount === 15 ? calculatedRepeat : repeatCount;

  // Build a repeating string for the text path with clear double spaces and a trailing separator
  const repeatingLabel = Array(actualRepeat).fill(upperName).join('  •  ') + '  •';

  return (
    <Link 
      href={`/modules/${id}`}
      className={`absolute group cursor-pointer transition-transform duration-300 hover:scale-110 ${sizeClass}`}
      style={{
        top,
        left,
        transform: 'translate(-50%, -50%)' // Center at given coordinates
      }}
    >
      {/* The Planet Graphic Wrapper */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]" 
          style={{ transform: `scale(${imgScale})` }}
        />
      </div>

      {/* Rotating SVG Text */}
      <svg 
        className="absolute inset-0 z-20 w-full h-full overflow-visible"
        viewBox="0 0 100 100"
        style={{
          animation: `spin ${rotationSpeed}s linear infinite`,
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
        <text className="text-[11.5px] font-extrabold uppercase fill-white/95 pointer-events-none">
          <textPath href={`#orbit-path-${id}`} startOffset="0%" textLength="289.03" lengthAdjust="spacing">
            {repeatingLabel}
          </textPath>
        </text>
      </svg>
    </Link>
  );
}
