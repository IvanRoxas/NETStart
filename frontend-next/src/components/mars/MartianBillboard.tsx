"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ParsedHtmlElement, MarsValidationResult } from '@/lib/mars/htmlBlocklyDefinitions';

interface MartianBillboardProps {
  parsedElements: ParsedHtmlElement[];
  validation: MarsValidationResult;
  sectionIndex: number; // 0 = Section 1 (Hierarchy), 1 = Section 2 (Grouping)
  campaignId?: string;
  isRunning?: boolean;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
}

export default function MartianBillboard({
  parsedElements,
  validation,
  sectionIndex,
  campaignId = 'welcome',
  isRunning = false,
  onSimulationComplete
}: MartianBillboardProps) {
  const isSection2 = sectionIndex === 1;
  const isInsideDiv = validation.allNestedInDiv || validation.isInsideDiv;

  // Active theme: strictly follows user's chosen theme from the Theme dropdown
  const activeTheme = (campaignId || 'welcome') as
    | 'welcome'
    | 'pizza'
    | 'storm'
    | 'shuttle'
    | 'arcade';

  const [animPhase, setAnimPhase] = useState<'idle' | 'running'>('idle');
  const [isSuccessResult, setIsSuccessResult] = useState<boolean>(false);
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);

  const animTimeoutRef = useRef<NodeJS.Timeout[]>([]);
  const screenScrollRef = useRef<HTMLDivElement | null>(null);
  const isUserInteracting = useRef<boolean>(false);
  const scrollAnimRef = useRef<number | null>(null);

  const clearTimeouts = () => {
    animTimeoutRef.current.forEach(t => clearTimeout(t));
    animTimeoutRef.current = [];
  };

  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  // Billboard screen auto-scrolling during simulation when content overflows
  useEffect(() => {
    if (isRunning && animPhase === 'running') {
      isUserInteracting.current = false;
      const el = screenScrollRef.current;
      if (!el) return;

      el.scrollTop = 0;
      let startTime: number | null = null;
      const cycleDuration = 7000; // 7s continuous gentle cycle (down -> pause -> up -> pause)

      const animateScroll = (time: number) => {
        if (!screenScrollRef.current || isUserInteracting.current) return;
        const currentEl = screenScrollRef.current;
        const maxScroll = currentEl.scrollHeight - currentEl.clientHeight;

        if (maxScroll > 4) {
          if (!startTime) startTime = time;
          const elapsed = (time - startTime) % cycleDuration;
          const progress = elapsed / cycleDuration;

          let targetScroll = 0;
          if (progress < 0.4) {
            // Scroll down smoothly (0% to 40% of cycle)
            const p = progress / 0.4;
            const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
            targetScroll = ease * maxScroll;
          } else if (progress < 0.5) {
            // Pause at bottom (40% to 50% of cycle)
            targetScroll = maxScroll;
          } else if (progress < 0.9) {
            // Scroll up smoothly (50% to 90% of cycle)
            const p = (progress - 0.5) / 0.4;
            const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
            targetScroll = (1 - ease) * maxScroll;
          } else {
            // Pause at top (90% to 100% of cycle)
            targetScroll = 0;
          }

          currentEl.scrollTop = targetScroll;
        }

        scrollAnimRef.current = requestAnimationFrame(animateScroll);
      };

      scrollAnimRef.current = requestAnimationFrame(animateScroll);

      return () => {
        if (scrollAnimRef.current) {
          cancelAnimationFrame(scrollAnimRef.current);
          scrollAnimRef.current = null;
        }
      };
    } else {
      if (scrollAnimRef.current) {
        cancelAnimationFrame(scrollAnimRef.current);
        scrollAnimRef.current = null;
      }
      if (screenScrollRef.current) {
        screenScrollRef.current.scrollTop = 0;
      }
    }
  }, [isRunning, animPhase]);

  // Compute crowd emoji reactions and simulation rating modal
  useEffect(() => {
    if (isRunning) {
      clearTimeouts();
      setShowRatingModal(false);

      const isPass = validation.matchedCount >= 3;
      setIsSuccessResult(isPass);
      setAnimPhase('running');

      const t1 = setTimeout(() => {
        setAnimPhase('idle');
        setShowRatingModal(true);
      }, 18800);

      animTimeoutRef.current = [t1];
    } else {
      clearTimeouts();
      setAnimPhase('idle');
    }
  }, [isRunning, validation]);

  // Helper to safely render inner HTML with supported tags (b, u, mark, del)
  const renderFormattedText = (rawText?: string) => {
    if (!rawText) return null;
    // 1. Strip any tags other than b, u, mark, del
    // 2. Strip any attributes from allowed tags (e.g. <b onclick="..."> -> <b>)
    const sanitized = rawText
      .replace(/<(?!\/?(b|u|mark|del)\b)[^>]*>/gi, '')
      .replace(/<(b|u|mark|del)[^>]*>/gi, '<$1>');
    return <span dangerouslySetInnerHTML={{ __html: sanitized }} />;
  };

  // Render element with appropriate size, style and theme typography
  const renderElement = (el: ParsedHtmlElement, key: number) => {
    if (el.tag === 'div') {
      let divContainerStyle = 'bg-amber-500/10 border-2 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.3)] rounded-2xl';
      if (activeTheme === 'pizza') divContainerStyle = 'bg-red-950/40 border-2 border-yellow-400/70 shadow-[0_0_25px_rgba(250,204,21,0.35)] rounded-2xl';
      if (activeTheme === 'storm') divContainerStyle = 'bg-red-950/60 border-2 border-red-500/70 shadow-[0_0_25px_rgba(239,68,68,0.4)] rounded-lg';
      if (activeTheme === 'shuttle') divContainerStyle = 'bg-cyan-950/40 border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.35)] rounded-xl';
      if (activeTheme === 'arcade') divContainerStyle = 'bg-purple-950/50 border-2 border-fuchsia-400/70 shadow-[0_0_25px_rgba(217,70,239,0.4)] rounded-2xl';

      return (
        <div
          key={key}
          className={`w-full flex flex-col items-center justify-center p-3 sm:p-4 transition-all duration-500 gap-2 backdrop-blur-sm ${divContainerStyle}`}
        >
          {el.children && el.children.length > 0 ? (
            el.children.map((child, cIdx) => renderElement(child, cIdx))
          ) : (
            <span className="text-xs font-mono text-gray-400/80 italic py-1">Empty Container Box</span>
          )}
        </div>
      );
    }

    if (el.tag === 'h1') {
      const formatted = renderFormattedText(el.content);
      if (!formatted) return null;

      let h1Style = 'text-amber-400 drop-shadow-[0_0_22px_rgba(251,191,36,0.9)]';
      if (activeTheme === 'pizza') h1Style = 'text-yellow-300 drop-shadow-[0_0_25px_rgba(250,204,21,1)] tracking-wider font-black';
      if (activeTheme === 'storm') h1Style = 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,1)] tracking-widest font-black animate-pulse';
      if (activeTheme === 'shuttle') h1Style = 'text-cyan-300 drop-shadow-[0_0_25px_rgba(34,211,238,0.95)] tracking-widest';
      if (activeTheme === 'arcade') h1Style = 'text-fuchsia-400 drop-shadow-[0_0_25px_rgba(232,121,249,1)] tracking-wider italic';

      return (
        <h1
          key={key}
          className={`text-2xl sm:text-3xl md:text-4xl font-black uppercase font-display text-center leading-tight transition-all duration-500 ${h1Style}`}
        >
          {formatted}
        </h1>
      );
    }

    if (el.tag === 'h3') {
      const formatted = renderFormattedText(el.content);
      if (!formatted) return null;

      let h3Style = 'text-amber-200 drop-shadow-[0_0_12px_rgba(253,230,138,0.8)]';
      if (activeTheme === 'pizza') h3Style = 'text-orange-200 drop-shadow-[0_0_14px_rgba(254,215,170,0.9)] font-bold';
      if (activeTheme === 'storm') h3Style = 'text-amber-300 drop-shadow-[0_0_16px_rgba(252,211,77,0.85)]';
      if (activeTheme === 'shuttle') h3Style = 'text-sky-200 drop-shadow-[0_0_14px_rgba(186,230,253,0.8)]';
      if (activeTheme === 'arcade') h3Style = 'text-cyan-300 drop-shadow-[0_0_16px_rgba(103,232,249,0.9)]';

      return (
        <h3
          key={key}
          className={`text-base sm:text-lg md:text-xl font-bold tracking-wide text-center leading-snug transition-all duration-500 ${h3Style}`}
        >
          {formatted}
        </h3>
      );
    }

    if (el.tag === 'p') {
      const formatted = renderFormattedText(el.content);
      if (!formatted) return null;

      let pStyle = 'text-amber-50 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]';
      if (activeTheme === 'pizza') pStyle = 'text-orange-100 drop-shadow-[0_0_8px_rgba(255,237,213,0.7)] font-medium';
      if (activeTheme === 'storm') pStyle = 'text-gray-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] font-semibold';
      if (activeTheme === 'shuttle') pStyle = 'text-slate-100 drop-shadow-[0_0_8px_rgba(241,245,249,0.6)]';
      if (activeTheme === 'arcade') pStyle = 'text-purple-100 drop-shadow-[0_0_10px_rgba(243,232,255,0.7)]';

      return (
        <p
          key={key}
          className={`text-xs sm:text-sm font-medium text-center leading-relaxed transition-all duration-500 ${pStyle}`}
        >
          {formatted}
        </p>
      );
    }

    if (el.tag === 'hr') {
      let hrStyle = 'border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.6)]';
      if (activeTheme === 'pizza') hrStyle = 'border-yellow-400/70 shadow-[0_0_12px_rgba(250,204,21,0.8)]';
      if (activeTheme === 'storm') hrStyle = 'border-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.8)]';
      if (activeTheme === 'shuttle') hrStyle = 'border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.7)]';
      if (activeTheme === 'arcade') hrStyle = 'border-fuchsia-400/70 shadow-[0_0_12px_rgba(217,70,239,0.8)]';

      return (
        <hr
          key={key}
          className={`w-full my-2 border-t-2 ${hrStyle} transition-all duration-500`}
        />
      );
    }

    if (el.tag === 'br') {
      return <div key={key} className="w-full h-2 my-0.5" />;
    }

    return null;
  };

  const lampPositions = activeTheme === 'storm' ? [25, 75] : [20, 50, 80];
  const isSimulationActive = isRunning && animPhase === 'running';

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0d0211] flex flex-col items-center justify-end px-3 pt-8 pb-1 select-none transition-colors duration-700">
      
      {/* Global CSS for Smooth Continuous Traversal Across the 20s Simulation Canvas */}
      <style>{`
        /* Pedestrian Walk: Left to Right across 7.8s */
        @keyframes walkLeftToRight {
          0% { transform: translateX(-120px); }
          28% { transform: translateX(180px); }
          45% { transform: translateX(260px); }
          62% { transform: translateX(360px); }
          82% { transform: translateX(500px); }
          100% { transform: translateX(650px); }
        }

        /* Pedestrian Walk: Right to Left across 7.8s */
        @keyframes walkRightToLeft {
          0% { transform: translateX(140px); }
          28% { transform: translateX(-160px); }
          45% { transform: translateX(-260px); }
          62% { transform: translateX(-360px); }
          82% { transform: translateX(-480px); }
          100% { transform: translateX(-650px); }
        }

        /* Tourist Dune Walk: Left to Right across 8.2s */
        @keyframes touristWalkLeftToRight {
          0% { transform: translateX(-140px); }
          30% { transform: translateX(160px); }
          48% { transform: translateX(250px); }
          65% { transform: translateX(380px); }
          100% { transform: translateX(580px); }
        }

        /* Tourist Dune Walk: Right to Left across 8.2s */
        @keyframes touristWalkRightToLeft {
          0% { transform: translateX(140px); }
          30% { transform: translateX(-160px); }
          48% { transform: translateX(-250px); }
          65% { transform: translateX(-380px); }
          100% { transform: translateX(-580px); }
        }

        /* Drone Sky Flight: Left to Right across 7.5s */
        @keyframes droneFlight {
          0% { transform: translate(-140px, -40px); }
          25% { transform: translate(120px, -10px); }
          45% { transform: translate(240px, -20px); }
          70% { transform: translate(380px, -5px); }
          100% { transform: translate(580px, -30px); }
        }

        /* Rover Roll: Right to Left across 7.0s */
        @keyframes roverRollRightToLeft {
          0% { transform: translateX(140px); }
          25% { transform: translateX(-140px); }
          50% { transform: translateX(-260px); }
          75% { transform: translateX(-420px); }
          100% { transform: translateX(-600px); }
        }

        /* Rover Roll: Left to Right across 7.0s */
        @keyframes roverRollLeftToRight {
          0% { transform: translateX(-140px); }
          25% { transform: translateX(140px); }
          50% { transform: translateX(260px); }
          75% { transform: translateX(420px); }
          100% { transform: translateX(600px); }
        }

        /* Relaxed Natural Walking Bobs */
        @keyframes characterWalkStep {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(2deg); }
          75% { transform: translateY(-3px) rotate(-2deg); }
        }
        @keyframes droneFloatBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes roverRollBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }

        /* Single Emoji Reaction Bubble: Visible during billboard inspection window (~30% to 62%) */
        @keyframes seeBillboardReaction {
          0%, 30% { opacity: 0; transform: scale(0) translateY(10px); }
          36% { opacity: 1; transform: scale(1.15) translateY(-3px); }
          42% { opacity: 1; transform: scale(1) translateY(0px); }
          58% { opacity: 1; transform: scale(1) translateY(0px); }
          65%, 100% { opacity: 0; transform: scale(0.5) translateY(-8px); }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. DYNAMIC THEMED BACKGROUND SCENERY */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {activeTheme === 'pizza' && (
          <div className="absolute inset-0 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-b from-[#28040b] via-[#450916] to-[#691420]" />
            <div className="absolute bottom-20 left-10 w-24 h-36 bg-gradient-to-t from-yellow-500/25 via-orange-500/15 to-transparent blur-xl" />
            <div className="absolute bottom-20 right-14 w-28 h-40 bg-gradient-to-t from-red-500/30 via-yellow-400/15 to-transparent blur-xl" />
            <svg className="absolute bottom-0 left-0 right-0 w-full h-36 sm:h-48 text-[#2e050e] fill-current opacity-95" viewBox="0 0 1200 400" preserveAspectRatio="none">
              <path d="M0,400 L0,200 Q150,130 300,190 T600,120 T900,180 T1200,110 L1200,400 Z" />
            </svg>
            <svg className="absolute bottom-0 left-0 right-0 w-full h-22 sm:h-30 text-[#54121d] fill-current" viewBox="0 0 1200 200" preserveAspectRatio="none">
              <path d="M0,200 L0,90 Q320,170 680,100 T1200,80 L1200,200 Z" />
            </svg>
          </div>
        )}

        {activeTheme === 'storm' && (
          <div className="absolute inset-0 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-b from-[#260707] via-[#481208] to-[#631e07]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/35 via-red-800/20 to-transparent animate-pulse" />
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-red-950/60 via-amber-900/30 to-transparent blur-sm" />
            <div className="absolute top-16 left-12 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444] animate-ping" />
            <div className="absolute top-20 right-20 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_15px_#ef4444] animate-ping" />
            <svg className="absolute bottom-0 left-0 right-0 w-full h-36 sm:h-48 text-[#220404] fill-current opacity-95" viewBox="0 0 1200 400" preserveAspectRatio="none">
              <path d="M0,400 L0,240 L130,160 L310,250 L480,120 L660,220 L840,90 L1020,190 L1200,150 L1200,400 Z" />
            </svg>
            <svg className="absolute bottom-0 left-0 right-0 w-full h-20 sm:h-28 text-[#541707] fill-current" viewBox="0 0 1200 200" preserveAspectRatio="none">
              <path d="M0,200 L0,70 Q400,140 800,80 T1200,60 L1200,200 Z" />
            </svg>
          </div>
        )}

        {activeTheme === 'shuttle' && (
          <div className="absolute inset-0 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-b from-[#030919] via-[#091535] to-[#15234d]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-300/20 via-transparent to-transparent" />
            <div className="absolute bottom-16 left-0 right-0 flex justify-around px-8 opacity-70">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] animate-pulse" />
            </div>
            <svg className="absolute bottom-0 left-0 right-0 w-full h-32 sm:h-44 text-[#060e24] fill-current opacity-95" viewBox="0 0 1200 400" preserveAspectRatio="none">
              <path d="M0,400 L0,220 L200,180 L400,220 L600,160 L800,210 L1000,170 L1200,200 L1200,400 Z" />
            </svg>
            <svg className="absolute bottom-0 left-0 right-0 w-full h-18 sm:h-24 text-[#16254a] fill-current" viewBox="0 0 1200 150" preserveAspectRatio="none">
              <path d="M0,150 L0,60 Q350,110 750,70 T1200,60 L1200,150 Z" />
            </svg>
          </div>
        )}

        {activeTheme === 'arcade' && (
          <div className="absolute inset-0 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-b from-[#160028] via-[#30004a] to-[#48054a]" />
            <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-t from-fuchsia-600 via-pink-500 to-amber-300 shadow-[0_0_60px_rgba(217,70,239,0.75),0_0_90px_rgba(251,191,36,0.35)] opacity-90 overflow-hidden pointer-events-none" />
            <div 
              className="absolute bottom-0 left-0 right-0 h-44 opacity-25"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(232, 121, 249, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(232, 121, 249, 0.4) 1px, transparent 1px)',
                backgroundSize: '24px 16px',
                transform: 'perspective(200px) rotateX(45deg)'
              }}
            />
            <svg className="absolute bottom-0 left-0 right-0 w-full h-36 sm:h-48 text-[#1a002e] fill-current opacity-95" viewBox="0 0 1200 400" preserveAspectRatio="none">
              <path d="M0,400 L0,210 L150,150 L300,210 L480,120 L650,200 L820,110 L1000,190 L1200,140 L1200,400 Z" />
            </svg>
            <svg className="absolute bottom-0 left-0 right-0 w-full h-20 sm:h-26 text-[#3c0545] fill-current" viewBox="0 0 1200 200" preserveAspectRatio="none">
              <path d="M0,200 L0,75 Q350,140 700,85 T1200,75 L1200,200 Z" />
            </svg>
          </div>
        )}

        {activeTheme === 'welcome' && (
          <div className="absolute inset-0 transition-opacity duration-700 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0e041c] via-[#210933] to-[#3b0f34]" />
            <div className="absolute inset-0 opacity-70 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-rose-500/10 to-transparent" />
            
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-10 w-64 h-32 bg-indigo-500/15 rounded-full blur-2xl" />
              <div className="absolute top-10 right-16 w-56 h-28 bg-rose-500/15 rounded-full blur-2xl" />
              <div className="absolute top-5 left-12 w-1 h-1 rounded-full bg-white shadow-[0_0_4px_#fff] animate-pulse" />
              <div className="absolute top-12 left-28 w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_#fde68a] animate-pulse [animation-delay:400ms]" />
              <div className="absolute top-8 left-52 w-1 h-1 rounded-full bg-cyan-200 shadow-[0_0_4px_#a5f3fc]" />
              <div className="absolute top-4 left-2/3 w-1.5 h-1.5 rounded-full bg-indigo-200 shadow-[0_0_6px_#c7d2fe] animate-pulse [animation-delay:700ms]" />
              <div className="absolute top-6 right-20 w-1.5 h-1.5 rounded-full bg-pink-200 shadow-[0_0_6px_#fbcfe8] animate-pulse [animation-delay:1200ms]" />
            </div>

            <div className="absolute top-3 left-6 sm:left-12 pointer-events-none opacity-90">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <div 
                  className="absolute w-24 sm:w-28 h-5 sm:h-6 rounded-full border-2 border-indigo-300/40 opacity-70 -rotate-15 pointer-events-none"
                  style={{ boxShadow: '0 0 10px rgba(165, 180, 252, 0.3)' }}
                />
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-300 via-purple-500 to-slate-900 shadow-[0_0_18px_rgba(147,51,234,0.4)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/30" />
                  <div className="absolute top-3 inset-x-0 h-1 bg-indigo-200/30 -rotate-12" />
                  <div className="absolute top-6 inset-x-0 h-1.5 bg-purple-300/20 -rotate-12" />
                  <div className="absolute top-9 inset-x-0 h-1 bg-pink-300/25 -rotate-12" />
                </div>
                <div 
                  className="absolute w-24 sm:w-28 h-5 sm:h-6 rounded-full border-t-2 border-x-2 border-indigo-200/90 -rotate-15 pointer-events-none"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(199, 210, 254, 0.8))' }}
                />
              </div>
            </div>

            <div className="absolute top-4 right-8 sm:right-16 pointer-events-none opacity-85">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-200 via-rose-400 to-amber-950 shadow-[0_0_16px_rgba(251,191,36,0.45)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-amber-100/40" />
                <div className="absolute top-2 left-2.5 w-2 h-2 rounded-full bg-rose-900/40 border border-amber-300/20" />
                <div className="absolute bottom-2.5 right-3 w-3 h-3 rounded-full bg-rose-950/50 border border-amber-300/20" />
              </div>
            </div>

            <svg className="absolute bottom-0 left-0 right-0 w-full h-36 sm:h-48 text-[#1a0422] fill-current opacity-90" viewBox="0 0 1200 400" preserveAspectRatio="none">
              <path d="M0,400 L0,220 L160,160 L320,230 L500,130 L680,210 L860,110 L1040,180 L1200,140 L1200,400 Z" />
            </svg>
            <svg className="absolute bottom-0 left-0 right-0 w-full h-22 sm:h-30 text-[#300a26] fill-current opacity-95" viewBox="0 0 1200 250" preserveAspectRatio="none">
              <path d="M0,250 L0,110 Q300,190 650,110 T1200,120 L1200,250 Z" />
            </svg>
            <svg className="absolute bottom-0 left-0 right-0 w-full h-14 sm:h-18 text-[#4a1232] fill-current" viewBox="0 0 1200 150" preserveAspectRatio="none">
              <path d="M0,150 L0,50 Q400,110 800,60 T1200,70 L1200,150 Z" />
            </svg>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN BILLBOARD ASSEMBLY (Frame & Screen) */}
      {/* ========================================================================= */}
      <div className="w-full relative z-10 flex flex-col items-center justify-end max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mt-auto mb-1.5 sm:mb-2 shrink-0">
        
        <div className="w-full relative flex flex-col items-center">
          
          {/* THEMED BILLBOARD FRAMES */}
          {activeTheme === 'pizza' && (
            <div className="w-full bg-gradient-to-b from-[#350711] via-[#260309] to-[#3a0612] p-2 sm:p-2.5 rounded-2xl border-3 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5),0_12px_28px_rgba(0,0,0,0.9)] flex flex-col relative overflow-visible">
              {/* Pizza Mascot Sign on Top Left */}
              <div className="absolute -top-7 -left-5 sm:-top-10 sm:-left-7 md:-top-12 md:-left-9 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 z-40 drop-shadow-[0_6px_20px_rgba(0,0,0,0.95)] select-none pointer-events-none -rotate-6">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_16px_rgba(245,158,11,0.75)]">
                  <defs>
                    <radialGradient id="pizzaCrustGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="65%" stopColor="#d97706" />
                      <stop offset="85%" stopColor="#b45309" />
                      <stop offset="100%" stopColor="#78350f" />
                    </radialGradient>
                    <radialGradient id="pizzaCheeseGrad" cx="48%" cy="46%" r="50%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="30%" stopColor="#facc15" />
                      <stop offset="75%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </radialGradient>
                    <radialGradient id="pepGrad" cx="35%" cy="35%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="55%" stopColor="#dc2626" />
                      <stop offset="85%" stopColor="#991b1b" />
                      <stop offset="100%" stopColor="#450a0a" />
                    </radialGradient>
                  </defs>

                  {/* 1. Outer Brown Crust */}
                  <circle cx="50" cy="50" r="47" fill="url(#pizzaCrustGrad)" stroke="#5c2607" strokeWidth="2.5" />
                  <circle cx="50" cy="50" r="41.5" fill="none" stroke="#92400e" strokeWidth="1" strokeDasharray="4,2" opacity="0.6" />

                  {/* 2. Yellow Core (Cheese & Sauce) */}
                  <circle cx="50" cy="50" r="38.5" fill="url(#pizzaCheeseGrad)" stroke="#c2410c" strokeWidth="1.2" />

                  {/* 3. Divided into 8 sides (8 Slices Radial Cut Lines) */}
                  <g stroke="#9a3412" strokeWidth="1.4" strokeLinecap="round" opacity="0.9">
                    {/* Vertical & Horizontal Slices */}
                    <line x1="50" y1="11.5" x2="50" y2="88.5" />
                    <line x1="11.5" y1="50" x2="88.5" y2="50" />
                    {/* Diagonal Slices (45 deg & 135 deg) */}
                    <line x1="22.8" y1="22.8" x2="77.2" y2="77.2" />
                    <line x1="22.8" y1="77.2" x2="77.2" y2="22.8" />
                  </g>

                  {/* Melted Cheese Seams */}
                  <g stroke="#fef9c3" strokeWidth="0.6" strokeLinecap="round" opacity="0.6">
                    <line x1="50.6" y1="13" x2="50.6" y2="87" />
                    <line x1="13" y1="50.6" x2="87" y2="50.6" />
                    <line x1="23.2" y1="23" x2="77.6" y2="77.4" />
                    <line x1="23.2" y1="77" x2="77.6" y2="22.6" />
                  </g>

                  {/* 4. Pepperoni Dots - Natural, Asymmetrical & Artisan Scatter */}
                  <g>
                    {/* Natural scattered pepperoni dots with varied sizes (2.6px - 3.6px) */}
                    <circle cx="46" cy="22" r="3.1" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="45" cy="21" r="0.8" fill="#fca5a5" opacity="0.8" />

                    <circle cx="56" cy="25" r="2.7" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="55.2" cy="24.2" r="0.7" fill="#fca5a5" opacity="0.8" />

                    <circle cx="69" cy="30" r="3.4" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="68" cy="29" r="0.8" fill="#fca5a5" opacity="0.8" />

                    <circle cx="36" cy="26" r="3.0" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="35" cy="25" r="0.7" fill="#fca5a5" opacity="0.8" />

                    <circle cx="26" cy="37" r="3.3" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="25" cy="36" r="0.8" fill="#fca5a5" opacity="0.8" />

                    <circle cx="77" cy="42" r="2.9" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="76.2" cy="41.2" r="0.7" fill="#fca5a5" opacity="0.8" />

                    <circle cx="74" cy="56" r="3.5" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="73" cy="55" r="0.8" fill="#fca5a5" opacity="0.8" />

                    <circle cx="63" cy="46" r="3.2" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="62" cy="45" r="0.8" fill="#fca5a5" opacity="0.8" />

                    <circle cx="48" cy="38" r="3.5" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="47" cy="37" r="0.8" fill="#fca5a5" opacity="0.8" />

                    <circle cx="37" cy="47" r="2.8" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="36.2" cy="46.2" r="0.7" fill="#fca5a5" opacity="0.8" />

                    <circle cx="23" cy="52" r="3.1" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="22" cy="51" r="0.8" fill="#fca5a5" opacity="0.8" />

                    <circle cx="29" cy="65" r="3.4" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="28" cy="64" r="0.8" fill="#fca5a5" opacity="0.8" />

                    <circle cx="42" cy="56" r="3.6" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="41" cy="55" r="0.9" fill="#fca5a5" opacity="0.8" />

                    <circle cx="56" cy="60" r="2.9" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="55.2" cy="59.2" r="0.7" fill="#fca5a5" opacity="0.8" />

                    <circle cx="68" cy="69" r="3.2" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="67" cy="68" r="0.8" fill="#fca5a5" opacity="0.8" />

                    <circle cx="51" cy="74" r="3.5" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="50" cy="73" r="0.8" fill="#fca5a5" opacity="0.8" />

                    <circle cx="38" cy="73" r="2.7" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="37.2" cy="72.2" r="0.7" fill="#fca5a5" opacity="0.8" />

                    <circle cx="59" cy="71" r="3.0" fill="url(#pepGrad)" stroke="#450a0a" strokeWidth="0.7" />
                    <circle cx="58" cy="70" r="0.8" fill="#fca5a5" opacity="0.8" />
                  </g>

                  {/* Herbs & Basil Flecks */}
                  <g fill="#15803d" opacity="0.85">
                    <circle cx="49" cy="31" r="0.8" />
                    <circle cx="62" cy="27" r="0.8" />
                    <circle cx="70" cy="43" r="0.9" />
                    <circle cx="69" cy="59" r="0.8" />
                    <circle cx="59" cy="67" r="0.9" />
                    <circle cx="41" cy="70" r="0.8" />
                    <circle cx="31" cy="58" r="0.9" />
                    <circle cx="31" cy="43" r="0.8" />
                    <circle cx="39" cy="27" r="0.8" />
                    <circle cx="50" cy="64" r="0.9" />
                    <circle cx="44" cy="46" r="0.7" />
                    <circle cx="54" cy="48" r="0.7" />
                  </g>
                </svg>
              </div>

              <div className="w-full flex items-center justify-center py-0.5 -mt-0.5 mb-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 rounded-full border border-yellow-300 shadow-sm pl-10 sm:pl-14 md:pl-16 pr-3">
                <span className="font-display font-black text-[10px] sm:text-xs tracking-widest text-yellow-100 uppercase">
                  OLYMPUS PIZZA &bull; FAST DELIVERY
                </span>
              </div>
              <div className="w-full bg-[#140206] border-2 border-orange-500 rounded-xl p-0.5 relative overflow-hidden">
                <div 
                  ref={screenScrollRef}
                  onWheel={() => { isUserInteracting.current = true; }}
                  onTouchStart={() => { isUserInteracting.current = true; }}
                  onPointerDown={() => { isUserInteracting.current = true; }}
                  className="w-full h-[160px] sm:h-[185px] md:h-[200px] bg-[#0c0104] p-2.5 sm:p-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10 flex flex-col justify-start"
                >
                  <div className="min-h-full my-auto flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 transition-all duration-500 w-full py-1">
                    {parsedElements.map((el, idx) => renderElement(el, idx))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTheme === 'storm' && (
            <div className="w-full bg-[#1c0808] p-2 sm:p-2.5 rounded-lg border-3 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5),0_12px_28px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
              <div className="w-full h-2 bg-[repeating-linear-gradient(-45deg,#eab308,#eab308_8px,#000_8px,#000_16px)] rounded-t-sm mb-1 border-b border-black" />
              <div className="w-full bg-[#0d0202] border border-amber-600 rounded-md p-0.5 relative overflow-hidden">
                <div 
                  ref={screenScrollRef}
                  onWheel={() => { isUserInteracting.current = true; }}
                  onTouchStart={() => { isUserInteracting.current = true; }}
                  onPointerDown={() => { isUserInteracting.current = true; }}
                  className="w-full h-[160px] sm:h-[185px] md:h-[200px] bg-[#070101] p-2.5 sm:p-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10 flex flex-col justify-start"
                >
                  <div className="min-h-full my-auto flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 transition-all duration-500 w-full py-1">
                    {parsedElements.map((el, idx) => renderElement(el, idx))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTheme === 'shuttle' && (
            <div className="w-full bg-[#07132a] p-2 sm:p-2.5 rounded-xl border-2 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.35),0_12px_28px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
              <div className="w-full flex items-center justify-between px-2 py-0.5 mb-1 text-[9px] sm:text-[10px] font-mono text-cyan-300 bg-cyan-950/60 rounded border border-cyan-800/60">
                <span className="font-bold tracking-widest uppercase">SPACEPORT TERMINAL 4</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-ping" />
              </div>
              <div className="w-full bg-[#030914] border border-cyan-600/80 rounded-lg p-0.5 relative overflow-hidden">
                <div 
                  ref={screenScrollRef}
                  onWheel={() => { isUserInteracting.current = true; }}
                  onTouchStart={() => { isUserInteracting.current = true; }}
                  onPointerDown={() => { isUserInteracting.current = true; }}
                  className="w-full h-[160px] sm:h-[185px] md:h-[200px] bg-[#02060e] p-2.5 sm:p-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10 flex flex-col justify-start font-mono"
                >
                  <div className="min-h-full my-auto flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 transition-all duration-500 w-full py-1">
                    {parsedElements.map((el, idx) => renderElement(el, idx))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTheme === 'arcade' && (
            <div className="w-full bg-gradient-to-b from-[#2a0048] via-[#1a002d] to-[#25003f] p-2 sm:p-2.5 rounded-2xl border-3 border-fuchsia-500 shadow-[0_0_35px_rgba(217,70,239,0.6),0_12px_28px_rgba(0,0,0,0.9)] flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 border border-cyan-400 rounded-2xl pointer-events-none opacity-40" />
              
              {/* Graphical Retro Arcade Top Marquee (Purely Visual: Pixel Invaders, LED dots & Neon Glow) */}
              <div className="w-full flex items-center justify-between px-2.5 py-0.5 mb-1 bg-gradient-to-r from-purple-950 via-fuchsia-900 to-purple-950 rounded-lg border border-fuchsia-400/80 shadow-[0_0_15px_rgba(217,70,239,0.4)] relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-cyan-300 drop-shadow-[0_0_8px_#22d3ee]">👾</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-ping" />
                </div>
                
                {/* Visual Pixel LED Light Bar */}
                <div className="flex items-center gap-1 opacity-90">
                  <div className="w-2 h-1 rounded-sm bg-fuchsia-400 shadow-[0_0_6px_#e879f9]" />
                  <div className="w-2 h-1 rounded-sm bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                  <div className="w-2 h-1 rounded-sm bg-yellow-400 shadow-[0_0_6px_#facc15]" />
                  <div className="w-2 h-1 rounded-sm bg-fuchsia-400 shadow-[0_0_6px_#e879f9]" />
                  <div className="w-2 h-1 rounded-sm bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_6px_#fde047] animate-pulse" />
                  <span className="text-xs text-yellow-300 drop-shadow-[0_0_8px_#fde047]">⭐</span>
                </div>
              </div>

              {/* Main CRT Screen Container */}
              <div className="w-full bg-[#120021] border-2 border-fuchsia-400 rounded-xl p-0.5 relative overflow-hidden shadow-inner">
                {/* CRT Scanline Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none z-20 opacity-30" />
                
                {/* 4 Corner Pixel Accents */}
                <div className="absolute top-1 left-1.5 text-[9px] font-mono text-cyan-400 pointer-events-none z-20 font-black opacity-75">◤</div>
                <div className="absolute top-1 right-1.5 text-[9px] font-mono text-cyan-400 pointer-events-none z-20 font-black opacity-75">◥</div>
                <div className="absolute bottom-1 left-1.5 text-[9px] font-mono text-cyan-400 pointer-events-none z-20 font-black opacity-75">◣</div>
                <div className="absolute bottom-1 right-1.5 text-[9px] font-mono text-cyan-400 pointer-events-none z-20 font-black opacity-75">◢</div>

                <div 
                  ref={screenScrollRef}
                  onWheel={() => { isUserInteracting.current = true; }}
                  onTouchStart={() => { isUserInteracting.current = true; }}
                  onPointerDown={() => { isUserInteracting.current = true; }}
                  className="w-full h-[160px] sm:h-[185px] md:h-[200px] bg-[#090011] p-2.5 sm:p-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10 flex flex-col justify-start"
                >
                  <div className="min-h-full my-auto flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 transition-all duration-500 w-full py-1">
                    {parsedElements.map((el, idx) => renderElement(el, idx))}
                  </div>
                </div>
              </div>

              {/* Bottom Visual Arcade Control Bezel (Physical Mini-Joystick, Metal Coin Slot & Colored Buttons) */}
              <div className="w-full flex items-center justify-between px-2.5 py-1 mt-1 bg-gradient-to-r from-[#140024] via-[#2c004d] to-[#140024] rounded-lg border border-fuchsia-500/60 shadow-md relative z-10">
                {/* Mini Joystick Graphic */}
                <div className="flex items-center gap-1">
                  <div className="relative w-3.5 h-3.5 rounded-full bg-slate-900 border border-fuchsia-400/60 flex items-center justify-center shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-red-600 border border-red-300 shadow-[0_0_6px_#ef4444]" />
                  </div>
                  <div className="w-2.5 h-1 bg-slate-800 rounded-full border border-gray-600" />
                </div>

                {/* Coin Slot Slit Graphic */}
                <div className="px-2 py-0.5 rounded bg-slate-950 border border-amber-400/60 flex items-center gap-1 shadow-[0_0_8px_rgba(250,204,21,0.25)]">
                  <div className="w-0.5 h-2.5 bg-amber-400 rounded-sm shadow-[0_0_4px_#facc15]" />
                  <span className="text-[9px]">🪙</span>
                </div>

                {/* 4 Arcade Colored Action Buttons */}
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-200 shadow-[0_0_5px_#facc15]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-200 shadow-[0_0_5px_#ef4444]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-cyan-200 shadow-[0_0_5px_#22d3ee]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-green-200 shadow-[0_0_5px_#22c55e]" />
                </div>
              </div>

            </div>
          )}

          {activeTheme === 'welcome' && (
            <div className="w-full bg-gradient-to-b from-[#2d0d38] via-[#1a0624] to-[#250830] p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border-2 sm:border-3 border-amber-400/90 shadow-[0_0_30px_rgba(251,191,36,0.35),0_12px_28px_rgba(0,0,0,0.85)] flex flex-col relative overflow-hidden">
              <div className="w-full flex items-center justify-center px-2 py-0.5 mb-1 bg-amber-400/15 rounded-lg border border-amber-400/40 text-amber-200">
                <span className="text-[10px] sm:text-[11px] font-display font-black tracking-widest uppercase text-center">
                  MARS COLONY 1-2FA4B
                </span>
              </div>
              <div className="w-full bg-[#100318] border border-amber-500/50 rounded-xl sm:rounded-2xl p-0.5 relative overflow-hidden">
                <div 
                  ref={screenScrollRef}
                  onWheel={() => { isUserInteracting.current = true; }}
                  onTouchStart={() => { isUserInteracting.current = true; }}
                  onPointerDown={() => { isUserInteracting.current = true; }}
                  className="w-full h-[160px] sm:h-[185px] md:h-[200px] bg-[#0c0213] p-2.5 sm:p-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10 flex flex-col justify-start"
                >
                  <div className="min-h-full my-auto flex flex-col items-center justify-center text-center gap-1.5 sm:gap-2 transition-all duration-500 w-full py-1">
                    {parsedElements.map((el, idx) => renderElement(el, idx))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UNIFIED FORWARD LIGHTING LAYER */}
          <div className="absolute inset-x-0 -top-4 sm:-top-5 bottom-0 pointer-events-none z-30 overflow-visible">
            {lampPositions.map((posPercent, i) => (
              <div
                key={i}
                className="absolute top-0 flex flex-col items-center -translate-x-1/2 pointer-events-none"
                style={{ left: `${posPercent}%` }}
              >
                {activeTheme === 'pizza' && (
                  <div className="flex flex-col items-center relative z-20">
                    <div className="w-2 h-2.5 bg-gradient-to-t from-red-600 to-yellow-400 rounded-t-full shadow-md" />
                    <div className="w-12 sm:w-14 h-3.5 bg-gradient-to-b from-red-600 via-amber-500 to-yellow-400 border border-yellow-200 rounded-t-xl flex items-end justify-center pb-0.5 shadow-[0_0_16px_rgba(250,204,21,1)]">
                      <div className="w-10 sm:w-12 h-1 bg-yellow-100 rounded-full blur-[0.5px] shadow-[0_0_12px_rgba(254,240,138,1)]" />
                    </div>
                  </div>
                )}
                {activeTheme === 'storm' && (
                  <div className="flex flex-col items-center relative z-20">
                    <div className="w-2 h-2 bg-gray-800 border-x border-gray-600" />
                    <div className="w-12 sm:w-14 h-3.5 bg-gradient-to-b from-red-600 via-amber-500 to-red-700 border border-amber-300 rounded-t-lg flex items-end justify-center pb-0.5 shadow-[0_0_18px_rgba(239,68,68,1)] animate-pulse">
                      <div className="w-10 sm:w-12 h-1 bg-yellow-100 rounded-full blur-[0.5px] shadow-[0_0_12px_rgba(253,224,71,1)]" />
                    </div>
                  </div>
                )}
                {activeTheme === 'shuttle' && (
                  <div className="flex flex-col items-center relative z-20">
                    <div className="w-1.5 h-2 bg-gradient-to-b from-cyan-800 to-gray-900" />
                    <div className="w-11 sm:w-13 h-3 bg-gradient-to-b from-gray-700 via-cyan-900 to-slate-900 border border-cyan-400 rounded-t-md flex items-end justify-center pb-0.5 shadow-[0_0_14px_rgba(34,211,238,0.9)]">
                      <div className="w-9 sm:w-11 h-1 bg-white rounded-full blur-[0.5px] shadow-[0_0_8px_rgba(103,232,249,1)]" />
                    </div>
                  </div>
                )}
                {activeTheme === 'arcade' && (
                  <div className="flex flex-col items-center relative z-20">
                    <div className="w-1.5 h-2 bg-fuchsia-600" />
                    <div className="w-11 sm:w-13 h-3.5 bg-gradient-to-b from-fuchsia-500 via-purple-600 to-cyan-400 border border-fuchsia-300 rounded-full flex items-center justify-center shadow-[0_0_16px_rgba(217,70,239,1)]">
                      <div className="w-9 sm:w-11 h-1 bg-white rounded-full blur-[0.5px] shadow-[0_0_10px_#fff]" />
                    </div>
                  </div>
                )}
                {activeTheme === 'welcome' && (
                  <div className="flex flex-col items-center relative z-20">
                    <div className="w-1.5 h-2 bg-gradient-to-b from-amber-500 to-amber-700 rounded-t-md" />
                    <div className="w-12 sm:w-14 h-3 bg-gradient-to-b from-amber-400 via-amber-600 to-amber-700 border border-amber-300 rounded-t-lg flex items-end justify-center pb-0.5 shadow-[0_0_14px_rgba(251,191,36,0.8)]">
                      <div className="w-10 sm:w-12 h-1 bg-amber-100 rounded-full blur-[0.5px] shadow-[0_0_10px_rgba(254,240,138,1)]" />
                    </div>
                  </div>
                )}

                {/* 2. LIGHT CONE */}
                {activeTheme === 'pizza' && (
                  <div className="w-28 sm:w-36 h-44 sm:h-52 [clip-path:polygon(42%_0%,58%_0%,100%_100%,0%_100%)] bg-gradient-to-b from-yellow-300/45 via-orange-400/15 to-transparent blur-[1px] -mt-1 mix-blend-screen pointer-events-none" />
                )}
                {activeTheme === 'storm' && (
                  <div className="w-30 sm:w-40 h-46 sm:h-54 [clip-path:polygon(40%_0%,60%_0%,100%_100%,0%_100%)] bg-gradient-to-b from-amber-300/45 via-red-500/20 to-transparent blur-[1px] -mt-1 mix-blend-screen pointer-events-none" />
                )}
                {activeTheme === 'shuttle' && (
                  <div className="w-26 sm:w-34 h-44 sm:h-52 [clip-path:polygon(42%_0%,58%_0%,100%_100%,0%_100%)] bg-gradient-to-b from-cyan-200/35 via-cyan-400/15 to-transparent blur-[1px] -mt-1 mix-blend-screen pointer-events-none" />
                )}
                {activeTheme === 'arcade' && (
                  <div className="w-26 sm:w-34 h-44 sm:h-52 [clip-path:polygon(42%_0%,58%_0%,100%_100%,0%_100%)] bg-gradient-to-b from-fuchsia-300/40 via-cyan-400/20 to-transparent blur-[1px] -mt-1 mix-blend-screen pointer-events-none" />
                )}
                {activeTheme === 'welcome' && (
                  <div className="w-26 sm:w-34 h-44 sm:h-52 [clip-path:polygon(42%_0%,58%_0%,100%_100%,0%_100%)] bg-gradient-to-b from-amber-200/35 via-amber-300/10 to-transparent blur-[1px] -mt-1 mix-blend-screen pointer-events-none" />
                )}
              </div>
            ))}
          </div>

          {/* CATWALK */}
          <div className="w-[96%] h-2.5 sm:h-3 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-x border-b border-gray-600 shadow-md flex items-center justify-between px-3 relative z-10">
            <div className="flex gap-4 sm:gap-6 w-full justify-around opacity-40">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-0.5 h-1.5 bg-gray-300" />
              ))}
            </div>
          </div>

        </div>

        {/* 3. THEMED SUPPORT PILLARS */}
        <div className="w-[78%] sm:w-[70%] flex justify-between relative pointer-events-none -mt-0.5 z-0">
          {activeTheme === 'pizza' ? (
            <div className="w-4.5 sm:w-6 h-9 sm:h-12 bg-gradient-to-r from-yellow-500 via-red-600 to-yellow-600 rounded-b-lg border-x-2 border-yellow-300 shadow-xl flex flex-col justify-around py-0.5 relative">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-200 mx-auto" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-200 mx-auto" />
              <div className="absolute -bottom-1 -left-1 -right-1 h-2 bg-red-950 rounded-sm border border-yellow-500/50" />
            </div>
          ) : activeTheme === 'welcome' ? (
            <div className="w-4.5 sm:w-6 h-9 sm:h-12 bg-gradient-to-r from-amber-600 via-amber-800 to-amber-950 border-x border-amber-400/60 shadow-xl flex flex-col justify-between py-0.5 relative">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-300 mx-auto" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-300 mx-auto" />
              <div className="absolute -bottom-1 -left-1 -right-1 h-2 bg-[#330c25] rounded-sm border border-amber-400/50 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
            </div>
          ) : (
            <div className="w-4 sm:w-5 h-9 sm:h-12 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-950 border-x border-gray-600 shadow-xl flex flex-col justify-between py-0.5 relative">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mx-auto" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mx-auto" />
              <div className="absolute inset-y-0 -left-1.5 w-1 flex flex-col justify-around">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-2 h-0.5 bg-amber-600/80" />
                ))}
              </div>
              <div className="absolute -bottom-1 -left-1 -right-1 h-2 bg-gradient-to-t from-[#2a0e16] to-gray-700 rounded-sm border border-gray-600/50" />
            </div>
          )}

          <div className="flex-1 flex items-center justify-center relative h-9 sm:h-12 px-2 opacity-60">
            <svg className="w-full h-full text-gray-600" viewBox="0 0 200 60" preserveAspectRatio="none">
              <line x1="0" y1="5" x2="200" y2="55" stroke="currentColor" strokeWidth="2" />
              <line x1="0" y1="55" x2="200" y2="5" stroke="currentColor" strokeWidth="2" />
              <line x1="0" y1="30" x2="200" y2="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
              <circle cx="100" cy="30" r="4" fill="#374151" stroke="#4b5563" strokeWidth="1" />
            </svg>
          </div>

          {activeTheme === 'pizza' ? (
            <div className="w-4.5 sm:w-6 h-9 sm:h-12 bg-gradient-to-r from-yellow-500 via-red-600 to-yellow-600 rounded-b-lg border-x-2 border-yellow-300 shadow-xl flex flex-col justify-around py-0.5 relative">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-200 mx-auto" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-200 mx-auto" />
              <div className="absolute -bottom-1 -left-1 -right-1 h-2 bg-red-950 rounded-sm border border-yellow-500/50" />
            </div>
          ) : activeTheme === 'welcome' ? (
            <div className="w-4.5 sm:w-6 h-9 sm:h-12 bg-gradient-to-r from-amber-600 via-amber-800 to-amber-950 border-x border-amber-400/60 shadow-xl flex flex-col justify-between py-0.5 relative">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-300 mx-auto" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-300 mx-auto" />
              <div className="absolute -bottom-1 -left-1 -right-1 h-2 bg-[#330c25] rounded-sm border border-amber-400/50 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
            </div>
          ) : (
            <div className="w-4 sm:w-5 h-9 sm:h-12 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-950 border-x border-gray-600 shadow-xl flex flex-col justify-between py-0.5 relative">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mx-auto" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 mx-auto" />
              <div className="absolute -bottom-1 -left-1 -right-1 h-2 bg-gradient-to-t from-[#2a0e16] to-gray-700 rounded-sm border border-gray-600/50" />
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. ANIMATED MARTIAN CROWD: STAGGERED CONTINUOUS 20S SEQUENCE               */}
      {/* ========================================================================= */}
      {isSimulationActive && (() => {
        // Reusable Astro-Kid Asset
        const renderAstroKid = (
          direction: 'ltr' | 'rtl',
          delay: number,
          emoji: string,
          key: string | number,
          colorVariant: 'orange' | 'cyan' | 'lime' = 'orange'
        ) => {
          const accentColor = colorVariant === 'cyan' ? '#06b6d4' : colorVariant === 'lime' ? '#84cc16' : '#ea580c';
          const glowBorder = isSuccessResult 
            ? 'border-emerald-400 text-emerald-100 bg-emerald-950/95 shadow-[0_0_12px_#34d399]' 
            : 'border-amber-400 text-amber-100 bg-amber-950/95 shadow-[0_0_12px_#fbbf24]';
          const tailBg = isSuccessResult ? 'bg-emerald-950 border-emerald-400' : 'bg-amber-950 border-amber-400';
          const animName = direction === 'ltr' ? 'walkLeftToRight' : 'walkRightToLeft';
          const positionClass = direction === 'ltr' ? 'left-0' : 'right-0';

          return (
            <div
              key={key}
              className={`absolute bottom-1 sm:bottom-2 ${positionClass} flex flex-col items-center origin-bottom z-40 pointer-events-none`}
              style={{ animation: `${animName} 7.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${delay}s both` }}
            >
              {/* Single Emoji Reaction Bubble during inspection */}
              <div
                className="absolute -top-13 sm:-top-15 flex flex-col items-center z-50 pointer-events-none"
                style={{ animation: `seeBillboardReaction 7.8s ease-out ${delay}s both` }}
              >
                <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 flex items-center justify-center text-xl sm:text-2xl shadow-xl ${glowBorder}`}>
                  <span>{emoji}</span>
                </div>
                <div className={`w-2 h-2 -mt-1 rotate-45 border-r-2 border-b-2 ${tailBg}`} />
              </div>

              {/* Walking Bob */}
              <div className="w-16 sm:w-20 h-22 sm:h-28 relative" style={{ animation: 'characterWalkStep 0.6s infinite' }}>
                <svg viewBox="0 0 54 74" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
                  <ellipse cx="27" cy="71" rx="20" ry="3" fill="#000" opacity="0.6" />
                  <rect x="9" y="28" width="7" height="22" rx="2.5" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                  <circle cx="12.5" cy="48" r="2" fill={accentColor} className="animate-pulse" />

                  <rect x="18" y="50" width="7" height="18" rx="3.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
                  <rect x="29" y="50" width="7" height="18" rx="3.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
                  <path d="M17,63 L25,63 L26,69 L15,69 Z" fill={accentColor} />
                  <path d="M28,63 L36,63 L37,69 L26,69 Z" fill={accentColor} />

                  <rect x="15" y="26" width="24" height="28" rx="7" fill="#f1f5f9" stroke="#334155" strokeWidth="1.8" />
                  <rect x="20" y="31" width="14" height="10" rx="2.5" fill="#0f172a" />
                  <circle cx="23.5" cy="36" r="2" fill={isSuccessResult ? '#10b981' : '#38bdf8'} className="animate-pulse" />
                  <circle cx="30.5" cy="36" r="2" fill={!isSuccessResult ? '#ef4444' : '#f59e0b'} />

                  <path d="M15,31 L10,43 L15,44 L18,33 Z" fill="#f1f5f9" stroke="#334155" strokeWidth="1.2" />
                  <path d="M39,31 L44,43 L39,44 L36,33 Z" fill="#f1f5f9" stroke="#334155" strokeWidth="1.2" />
                  <circle cx="12" cy="44" r="3" fill={accentColor} />
                  <circle cx="42" cy="44" r="3" fill={accentColor} />

                  <circle cx="27" cy="17" r="15" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
                  <ellipse cx="27" cy="17" rx="11" ry="10" fill="#090d16" stroke={accentColor} strokeWidth="1.8" />

                  {isSuccessResult ? (
                    <g stroke="#34d399" strokeWidth="2" strokeLinecap="round" fill="none">
                      <path d="M21,18 Q23.5,14 26,18" />
                      <path d="M28,18 Q30.5,14 33,18" />
                      <path d="M24,22 Q27,24.5 30,22" stroke="#fbbf24" strokeWidth="1.5" />
                    </g>
                  ) : (
                    <g fill="#fbbf24">
                      <circle cx="22" cy="17" r="1.6" />
                      <circle cx="31" cy="16" r="2" />
                      <path d="M24,22 L29,21" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" />
                    </g>
                  )}

                  <path d="M19,12 Q25,9.5 33,12" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" fill="none" />
                  <line x1="27" y1="2" x2="27" y2="0" stroke="#94a3b8" strokeWidth="1.8" />
                  <circle cx="27" cy="0" r="2" fill="#f43f5e" className="animate-pulse" />
                </svg>
              </div>
            </div>
          );
        };

        // Reusable Tech Colonist Asset
        const renderTechColonist = (
          direction: 'ltr' | 'rtl',
          delay: number,
          emoji: string,
          key: string | number,
          colorVariant: 'cyan' | 'purple' | 'amber' = 'cyan'
        ) => {
          const accentColor = colorVariant === 'purple' ? '#a855f7' : colorVariant === 'amber' ? '#f59e0b' : '#0891b2';
          const visorBorder = colorVariant === 'purple' ? '#c084fc' : colorVariant === 'amber' ? '#fbbf24' : '#14b8a6';
          const glowBorder = isSuccessResult 
            ? 'border-cyan-400 text-cyan-100 bg-cyan-950/95 shadow-[0_0_12px_#22d3ee]' 
            : 'border-amber-400 text-amber-100 bg-amber-950/95 shadow-[0_0_12px_#fbbf24]';
          const tailBg = isSuccessResult ? 'bg-cyan-950 border-cyan-400' : 'bg-amber-950 border-amber-400';
          const animName = direction === 'ltr' ? 'walkLeftToRight' : 'walkRightToLeft';
          const positionClass = direction === 'ltr' ? 'left-0' : 'right-0';

          return (
            <div
              key={key}
              className={`absolute bottom-1 sm:bottom-2 ${positionClass} flex flex-col items-center origin-bottom z-40 pointer-events-none`}
              style={{ animation: `${animName} 7.8s cubic-bezier(0.25, 0.8, 0.25, 1) ${delay}s both` }}
            >
              <div
                className="absolute -top-13 sm:-top-15 flex flex-col items-center z-50 pointer-events-none"
                style={{ animation: `seeBillboardReaction 7.8s ease-out ${delay}s both` }}
              >
                <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 flex items-center justify-center text-xl sm:text-2xl shadow-xl ${glowBorder}`}>
                  <span>{emoji}</span>
                </div>
                <div className={`w-2 h-2 -mt-1 rotate-45 border-r-2 border-b-2 ${tailBg}`} />
              </div>

              <div className="w-16 sm:w-20 h-22 sm:h-28 relative" style={{ animation: 'characterWalkStep 0.6s infinite' }}>
                <svg viewBox="0 0 54 74" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
                  <ellipse cx="27" cy="71" rx="20" ry="3" fill="#000" opacity="0.6" />
                  
                  {/* Oxygen Pack */}
                  <rect x="9" y="28" width="7" height="22" rx="2.5" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="12.5" cy="48" r="2" fill={accentColor} className="animate-pulse" />

                  {/* Legs and Boots */}
                  <rect x="18" y="48" width="7" height="20" rx="3.5" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
                  <rect x="29" y="48" width="7" height="20" rx="3.5" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
                  <path d="M17,62 L25,62 L26,69 L15,69 Z" fill={accentColor} />
                  <path d="M28,62 L36,62 L37,69 L26,69 Z" fill={accentColor} />

                  {/* Body Torso */}
                  <rect x="15" y="26" width="24" height="28" rx="7" fill="#cbd5e1" stroke="#334155" strokeWidth="1.8" />
                  <rect x="14" y="35" width="16" height="12" rx="2" fill="#0f172a" stroke={accentColor} strokeWidth="1.2" />
                  <rect x="16.5" y="37.5" width="11" height="7" fill={accentColor} opacity="0.75" className="animate-pulse" />

                  {/* Arms & Hands */}
                  <path d="M15,31 L10,43 L15,44 L18,33 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
                  <path d="M39,31 L44,43 L39,44 L36,33 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
                  <circle cx="12" cy="44" r="3" fill={accentColor} />
                  <circle cx="42" cy="44" r="3" fill={accentColor} />

                  {/* Helmet & Visor */}
                  <circle cx="27" cy="17" r="15" fill="#cbd5e1" stroke="#334155" strokeWidth="1.8" />
                  <ellipse cx="27" cy="17" rx="11" ry="10" fill="#042f2e" stroke={visorBorder} strokeWidth="1.8" />

                  {isSuccessResult ? (
                    <g fill="#2dd4bf">
                      <circle cx="23" cy="17" r="2.5" />
                      <circle cx="31" cy="17" r="2.5" />
                    </g>
                  ) : (
                    <g fill="#fbbf24">
                      <circle cx="22" cy="16" r="1.8" />
                      <line x1="28" y1="17" x2="32" y2="17" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
                    </g>
                  )}

                  <path d="M19,12 Q25,9.5 33,12" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" fill="none" />
                </svg>
              </div>
            </div>
          );
        };

        // Reusable Space Tourist Asset
        const renderTourist = (
          direction: 'ltr' | 'rtl',
          delay: number,
          emoji: string,
          key: string | number,
          colorVariant: 'purple' | 'rose' = 'purple'
        ) => {
          const accentColor = colorVariant === 'rose' ? '#e11d48' : '#8b5cf6';
          const visorBorder = colorVariant === 'rose' ? '#fb7185' : '#a78bfa';
          const glowBorder = isSuccessResult 
            ? 'border-purple-400 text-purple-100 bg-purple-950/95 shadow-[0_0_10px_#a855f7]' 
            : 'border-amber-400 text-amber-100 bg-amber-950/95 shadow-[0_0_10px_#fbbf24]';
          const tailBg = isSuccessResult ? 'bg-purple-950 border-purple-400' : 'bg-amber-950 border-amber-400';
          const animName = direction === 'ltr' ? 'touristWalkLeftToRight' : 'touristWalkRightToLeft';
          const positionClass = direction === 'ltr' ? 'left-0' : 'right-0';

          return (
            <div
              key={key}
              className={`absolute bottom-2 sm:bottom-3 ${positionClass} flex flex-col items-center origin-bottom z-35 pointer-events-none`}
              style={{ animation: `${animName} 8.2s cubic-bezier(0.25, 0.8, 0.25, 1) ${delay}s both` }}
            >
              <div
                className="absolute -top-12 sm:-top-14 flex flex-col items-center z-50 pointer-events-none"
                style={{ animation: `seeBillboardReaction 8.2s ease-out ${delay}s both` }}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center text-lg sm:text-xl shadow-xl ${glowBorder}`}>
                  <span>{emoji}</span>
                </div>
                <div className={`w-2 h-2 -mt-1 rotate-45 border-r-2 border-b-2 ${tailBg}`} />
              </div>

              <div className="w-14 sm:w-18 h-20 sm:h-26 relative" style={{ animation: 'characterWalkStep 0.65s infinite' }}>
                <svg viewBox="0 0 50 70" className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)]">
                  <ellipse cx="25" cy="67" rx="17" ry="2.5" fill="#000" opacity="0.5" />
                  
                  {/* Backpack */}
                  <rect x="8" y="26" width="6" height="20" rx="2.5" fill="#312e81" stroke="#1e1b4b" strokeWidth="1" />
                  <circle cx="11" cy="44" r="1.8" fill={accentColor} />

                  {/* Legs & Boots */}
                  <rect x="16" y="46" width="6.5" height="19" rx="3" fill="#e0e7ff" stroke="#334155" strokeWidth="1.2" />
                  <rect x="27.5" y="46" width="6.5" height="19" rx="3" fill="#e0e7ff" stroke="#334155" strokeWidth="1.2" />
                  <path d="M15,60 L23,60 L24,66 L13,66 Z" fill={accentColor} />
                  <path d="M26.5,60 L34.5,60 L35.5,66 L24.5,66 Z" fill={accentColor} />

                  {/* Body Torso */}
                  <rect x="14" y="24" width="22" height="26" rx="6" fill="#ede9fe" stroke="#4338ca" strokeWidth="1.5" />
                  <circle cx="25" cy="34" r="3.5" fill={accentColor} opacity="0.8" />

                  {/* Arms & Gloves */}
                  <path d="M14,28 L10,38 L14,39 L16,30 Z" fill="#ede9fe" stroke="#4338ca" strokeWidth="1" />
                  <path d="M36,28 L40,38 L36,39 L33,30 Z" fill="#ede9fe" stroke="#4338ca" strokeWidth="1" />
                  <circle cx="11" cy="39" r="2.5" fill={accentColor} />
                  <circle cx="39" cy="39" r="2.5" fill={accentColor} />

                  {/* Helmet & Visor */}
                  <circle cx="25" cy="15" r="14" fill="#f5f3ff" stroke="#4338ca" strokeWidth="1.5" />
                  <ellipse cx="25" cy="15" rx="10" ry="9" fill="#1e1b4b" stroke={visorBorder} strokeWidth="1.5" />
                  <g fill="#c084fc">
                    <circle cx="21" cy="15" r="1.5" />
                    <circle cx="29" cy="15" r="1.5" />
                    <path d="M22,19 Q25,21 28,19" stroke="#c084fc" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  </g>
                  <path d="M18,10 Q23,8 29,10" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" fill="none" />
                </svg>
              </div>
            </div>
          );
        };

        // Reusable Robo-Buddy Drone Asset
        const renderDrone = (delay: number, key: string | number) => {
          return (
            <div
              key={key}
              className="absolute bottom-20 sm:bottom-24 left-0 flex flex-col items-center pointer-events-none z-50"
              style={{ animation: `droneFlight 7.5s cubic-bezier(0.25, 0.8, 0.25, 1) ${delay}s both` }}
            >
              <div className="w-12 sm:w-14 h-12 sm:h-14 relative" style={{ animation: 'droneFloatBob 1.2s infinite ease-in-out' }}>
                <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)]">
                  <circle cx="22" cy="22" r="15" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="22" cy="22" r="11" fill="#1e293b" />
                  {isSuccessResult ? (
                    <g fill="#22d3ee">
                      <polygon points="17,19 18.5,22 21,22 19,23.5 19.5,26 17,24.5 14.5,26 15,23.5 13,22 15.5,22" />
                      <polygon points="27,19 28.5,22 31,22 29,23.5 29.5,26 27,24.5 24.5,26 25,23.5 23,22 25.5,22" />
                    </g>
                  ) : (
                    <g stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                      <line x1="15" y1="19" x2="20" y2="24" />
                      <line x1="20" y1="19" x2="15" y2="24" />
                      <line x1="24" y1="19" x2="29" y2="24" />
                      <line x1="29" y1="19" x2="24" y2="24" />
                    </g>
                  )}
                  <path d="M7,19 L2,22 L7,25 Z" fill="#0284c7" />
                  <path d="M37,19 L42,22 L37,25 Z" fill="#0284c7" />
                  <circle cx="22" cy="5" r="2.5" fill={!isSuccessResult ? '#ef4444' : '#22d3ee'} className="animate-pulse" />
                  <line x1="22" y1="7" x2="22" y2="5" stroke="#64748b" strokeWidth="2" />
                  <ellipse cx="22" cy="37" rx="4" ry="2" fill="#38bdf8" className="animate-pulse" />
                </svg>
              </div>
            </div>
          );
        };

        // Reusable Cyber Rover Asset
        const renderRover = (direction: 'ltr' | 'rtl', delay: number, key: string | number) => {
          const animName = direction === 'ltr' ? 'roverRollLeftToRight' : 'roverRollRightToLeft';
          const positionClass = direction === 'ltr' ? 'left-0' : 'right-0';

          return (
            <div
              key={key}
              className={`absolute bottom-1 sm:bottom-2 ${positionClass} flex flex-col items-center origin-bottom z-35 pointer-events-none`}
              style={{ animation: `${animName} 7.0s cubic-bezier(0.25, 0.8, 0.25, 1) ${delay}s both` }}
            >
              <div className="w-14 sm:w-16 h-12 sm:h-14 relative" style={{ animation: 'roverRollBounce 0.35s infinite' }}>
                <svg viewBox="0 0 46 38" className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
                  <ellipse cx="23" cy="35" rx="16" ry="2" fill="#000" opacity="0.5" />
                  <circle cx="12" cy="30" r="5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  <circle cx="34" cy="30" r="5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  <circle cx="12" cy="30" r="2" fill="#f59e0b" />
                  <circle cx="34" cy="30" r="2" fill="#f59e0b" />

                  <rect x="8" y="16" width="30" height="12" rx="4" fill="#334155" stroke="#f59e0b" strokeWidth="1.5" />
                  <rect x="14" y="19" width="18" height="6" rx="2" fill="#0f172a" />
                  <circle cx="23" cy="22" r="2" fill={isSuccessResult ? '#10b981' : '#f59e0b'} className="animate-pulse" />
                  <line x1="28" y1="16" x2="33" y2="8" stroke="#94a3b8" strokeWidth="1.5" />
                  <circle cx="33" cy="8" r="2" fill="#38bdf8" className="animate-pulse" />
                </svg>
              </div>
            </div>
          );
        };

        // Select crowd reaction emojis according to validation.matchedCount
        let ak1Emoji = '❓';
        let tc1Emoji = '🤔';
        let tour1Emoji = '❓';
        let ak2Emoji = '🤔';
        let tc2Emoji = '❓';
        let tour2Emoji = '🤔';
        let ak3Emoji = '❓';
        let tc3Emoji = '🤔';

        if (validation.matchedCount === 3) {
          ak1Emoji = '🤩';
          tc1Emoji = '💡';
          tour1Emoji = '✨';
          ak2Emoji = '🤩';
          tc2Emoji = '💡';
          tour2Emoji = '🎉';
          ak3Emoji = '👏';
          tc3Emoji = '✨';
        } else if (validation.matchedCount === 2) {
          ak1Emoji = '💡';
          tc1Emoji = '🤔';
          tour1Emoji = '❓';
          ak2Emoji = '✨';
          tc2Emoji = '❓';
          tour2Emoji = '🤔';
          ak3Emoji = '💡';
          tc3Emoji = '❓';
        }

        return (
          <div className="w-full absolute inset-0 z-40 pointer-events-none flex items-end justify-center overflow-hidden">
            {/* Wave 1: 0.0s - 8.5s */}
            {renderAstroKid('ltr', 0.0, ak1Emoji, 'ak-1', 'orange')}
            {renderRover('rtl', 1.5, 'rov-1')}

            {/* Wave 2: 3.5s - 12.0s */}
            {renderTechColonist('rtl', 3.5, tc1Emoji, 'tc-1', 'cyan')}
            {renderTourist('ltr', 5.5, tour1Emoji, 'tour-1', 'purple')}

            {/* Wave 3: 7.5s - 15.5s */}
            {renderDrone(7.5, 'drn-1')}
            {renderAstroKid('rtl', 9.0, ak2Emoji, 'ak-2', 'cyan')}

            {/* Wave 4: 11.0s - 18.5s */}
            {renderTechColonist('ltr', 11.0, tc2Emoji, 'tc-2', 'purple')}
            {renderRover('ltr', 12.2, 'rov-2')}

            {/* Wave 5: 13.5s - 20.0s */}
            {renderTourist('rtl', 13.5, tour2Emoji, 'tour-2', 'rose')}
            {renderAstroKid('ltr', 15.0, ak3Emoji, 'ak-3', 'lime')}
            {renderTechColonist('rtl', 16.2, tc3Emoji, 'tc-3', 'amber')}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 5. COLONY DIRECTOR PERFORMANCE REVIEW MODAL                               */}
      {/* ========================================================================= */}
      {showRatingModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-auto animate-in fade-in zoom-in-95 duration-300">
          <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#1e0a2d] via-[#13041f] to-[#0c0214] border-2 border-fuchsia-500/60 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_0_40px_rgba(217,70,239,0.35)] flex flex-col items-center text-center gap-3">
            
            {/* Top Badge */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/50 shadow-sm">
                COLONY BROADCAST REVIEW
              </span>
            </div>

            {/* Unified Director Vance Card with Square Portrait, Name & Speech Bubble (Left Aligned) */}
            <div className="flex items-start gap-3 sm:gap-4 w-full bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-3.5 text-left">
              {/* Square Character Portrait */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-900 border-2 border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.4)] p-1 flex items-center justify-center shrink-0 relative overflow-hidden mt-0.5">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  {/* Collar / Suit */}
                  <path d="M6,46 Q24,36 42,46 L42,48 L6,48 Z" fill="#312e81" stroke="#4338ca" strokeWidth="1.5" />
                  <polygon points="24,38 20,48 28,48" fill="#fbbf24" />
                  {/* Head / Face */}
                  <circle cx="24" cy="22" r="14" fill="#fed7aa" stroke="#334155" strokeWidth="1.5" />
                  {/* Hair */}
                  <path d="M12,18 Q24,8 36,18 Q36,12 24,10 Q12,12 12,18 Z" fill="#475569" />
                  {/* Eyes & Smile */}
                  {validation.ratingScore >= 3 ? (
                    <g fill="#0f172a">
                      <circle cx="19" cy="21" r="1.8" />
                      <circle cx="29" cy="21" r="1.8" />
                      <path d="M20,26 Q24,30 28,26" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                    </g>
                  ) : (
                    <g fill="#0f172a">
                      <circle cx="19" cy="21" r="1.8" />
                      <circle cx="29" cy="21" r="1.8" />
                      <line x1="20" y1="27" x2="28" y2="27" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
                    </g>
                  )}
                  {/* Headset & Mic */}
                  <path d="M10,20 Q24,6 38,20" stroke="#06b6d4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <rect x="8" y="18" width="4" height="8" rx="2" fill="#0891b2" />
                  <rect x="36" y="18" width="4" height="8" rx="2" fill="#0891b2" />
                  <path d="M38,24 L32,29" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="31" cy="29.5" r="2" fill="#22d3ee" className="animate-pulse" />
                </svg>
              </div>

              {/* Name and Director's Comment unified inside container (Left Aligned) */}
              <div className="flex-1 flex flex-col items-start text-left gap-1">
                <span className="font-display font-black text-sm sm:text-base text-white leading-tight">
                  Director Vance
                </span>
                <p className="text-xs sm:text-sm text-purple-100/90 leading-snug italic text-left">
                  &ldquo;{validation.ratingRemarks}&rdquo;
                </p>
              </div>
            </div>

            {/* 5-Star Rating Visual */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl sm:text-3xl transition-transform duration-300 ${
                      star <= validation.ratingScore
                        ? 'text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)] scale-110'
                        : 'text-gray-600 opacity-40 scale-90'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className={`text-xs font-mono font-bold tracking-widest uppercase ${
                validation.ratingScore >= 3 ? 'text-yellow-300' : 'text-amber-400'
              }`}>
                {validation.ratingScore} / 5 Broadcast Rating
              </span>
            </div>

            {/* Single Proceed Button */}
            <div className="w-full mt-1">
              <button
                type="button"
                onClick={() => {
                  setShowRatingModal(false);
                  if (validation.ratingScore >= 3) {
                    if (onSimulationComplete) onSimulationComplete(true);
                  } else {
                    if (onSimulationComplete) onSimulationComplete(false, validation.ratingRemarks);
                  }
                }}
                className={`w-full px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg ${
                  validation.ratingScore >= 3
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-slate-200 border border-slate-600'
                }`}
              >
                Proceed
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
