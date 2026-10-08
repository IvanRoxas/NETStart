"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';

interface MusicToggleButtonProps {
  className?: string;
  variant?: 'circle' | 'rounded';
  size?: 'sm' | 'md' | 'lg';
}

export default function MusicToggleButton({
  className = '',
  variant = 'circle',
  size = 'md',
}: MusicToggleButtonProps) {
  const { isMuted, toggleMute, setMuted, volume, setVolume, isPlaying } = useMusic();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const railRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMouseInsideRef = useRef(false);

  const sizeClasses =
    size === 'sm'
      ? 'p-2'
      : size === 'lg'
      ? 'p-3'
      : 'p-2.5';

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;
  const shapeClass = variant === 'rounded' ? 'rounded-xl' : 'rounded-full';

  const handleMouseEnter = () => {
    isMouseInsideRef.current = true;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    isMouseInsideRef.current = false;
    if (isDragging) return;
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isMouseInsideRef.current) {
        setIsHovered(false);
      }
    }, 250);
  };

  const updateVolumeFromClientY = useCallback(
    (clientY: number) => {
      if (!railRef.current) return;
      const rect = railRef.current.getBoundingClientRect();
      if (rect.height === 0) return;
      const ratio = (rect.bottom - clientY) / rect.height;
      const clamped = Math.min(1, Math.max(0, ratio));

      if (isMuted && clamped > 0) {
        setMuted(false);
      }
      setVolume(clamped);
    },
    [isMuted, setMuted, setVolume]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    updateVolumeFromClientY(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length > 0) {
      setIsDragging(true);
      updateVolumeFromClientY(e.touches[0].clientY);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateVolumeFromClientY(e.clientY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (!isMouseInsideRef.current) {
        setIsHovered(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateVolumeFromClientY(e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      if (!isMouseInsideRef.current) {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, updateVolumeFromClientY]);

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted && volume === 0) {
      setVolume(0.35);
    }
    toggleMute();
  };

  const displayMuted = mounted ? isMuted : false;
  const displayPlaying = mounted ? isPlaying : false;
  const effectiveVolume = displayMuted ? 0 : volume;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${
        isHovered || isDragging ? 'z-[9999]' : 'z-20'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleToggleClick}
        suppressHydrationWarning
        className={`relative ${shapeClass} ${sizeClasses} bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0 shadow-sm group ${className}`}
        title={displayMuted ? "Unmute Music (Hover for Volume)" : "Mute Music (Hover for Volume)"}
        aria-label={displayMuted ? "Unmute Music" : "Mute Music"}
      >
        {displayMuted ? (
          <VolumeX
            size={iconSize}
            className="text-rose-400/80 group-hover:text-rose-300 transition-colors"
          />
        ) : (
          <div className="relative flex items-center justify-center">
            <Volume2
              size={iconSize}
              className="text-emerald-400/90 group-hover:text-emerald-300 transition-colors"
            />
            {displayPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            )}
          </div>
        )}
      </button>

      {/* Floating Vertical Volume Slider Popup on Hover */}
      {(isHovered || isDragging) && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[9999] animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-[#180a2b]/95 backdrop-blur-md border border-white/15 rounded-2xl p-2.5 shadow-2xl shadow-purple-950/80 flex flex-col items-center gap-2 w-12 select-none">
            {/* Percentage Readout */}
            <span
              className={`text-[10px] font-mono font-bold leading-none ${
                isMuted
                  ? 'text-rose-400 font-sans tracking-wide text-[9px]'
                  : 'text-white/80'
              }`}
            >
              {isMuted ? 'MUTED' : `${Math.round(volume * 100)}%`}
            </span>

            {/* Vertical Track Hit Area */}
            <div
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="relative w-7 h-28 flex items-center justify-center cursor-pointer py-2 group/slider"
            >
              {/* Rail */}
              <div
                ref={railRef}
                className="relative w-1.5 h-24 bg-white/15 rounded-full"
              >
                {/* Active Volume Fill */}
                <div
                  className={`absolute bottom-0 left-0 right-0 rounded-full transition-[height] duration-75 ${
                    isMuted
                      ? 'bg-white/20'
                      : 'bg-gradient-to-t from-[#ff7e1d] to-[#ffa34d]'
                  }`}
                  style={{ height: `${effectiveVolume * 100}%` }}
                />

                {/* Draggable Circle Thumb */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-[0_0_8px_rgba(255,145,45,0.8)] cursor-grab active:cursor-grabbing hover:scale-125 transition-transform duration-75 ${
                    isMuted
                      ? 'bg-rose-100 border-2 border-rose-400'
                      : 'bg-white border-2 border-[#ff912d]'
                  }`}
                  style={{
                    bottom: `calc(${effectiveVolume * 100}% - 8px)`,
                  }}
                />
              </div>
            </div>

            {/* Quick Mute / Unmute Button at bottom of slider */}
            <button
              type="button"
              onClick={handleToggleClick}
              className="text-white/50 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 active:scale-90 cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={13} className="text-rose-400" />
              ) : (
                <Volume2 size={13} className="text-emerald-400" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
