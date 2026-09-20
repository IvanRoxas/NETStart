"use client";

import React, { useState, useRef } from 'react';
import { VT323 } from 'next/font/google';
import HexagonStatsWeb from './HexagonStatsWeb';
import { toPng } from 'html-to-image';

const vt323 = VT323({ weight: '400', subsets: ['latin'] });

interface PassportStatsCardProps {
  profile: any;
  completedMissionIds: string[];
}

export default function PassportStatsCard({ profile, completedMissionIds }: PassportStatsCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    const card = cardRef.current;
    if (card) {
      setIsDownloading(true);
      try {
        const dataUrl = await toPng(card, {
          quality: 1.0,
          pixelRatio: 2, // High resolution
        });
        
        const link = document.createElement('a');
        link.download = 'passport-stats.png';
        link.href = dataUrl;
        link.click();
      } finally {
        setIsDownloading(false);
      }
    }
  };

  // Count completed missions per track
  const htmlCompleted = completedMissionIds.filter(id => id.startsWith('html-')).length;
  const cssCompleted = completedMissionIds.filter(id => id.startsWith('css-')).length;
  const jsCompleted = completedMissionIds.filter(id => id.startsWith('javascript-')).length;
  
  // Total Web Dev = HTML (5) + CSS (5) + JS (5) = 15
  const webDevCompleted = htmlCompleted + cssCompleted + jsCompleted;
  const webDevTotal = 15;
  const webDevPercent = Math.round((webDevCompleted / webDevTotal) * 100);

  // Other tracks are not implemented yet, so 0%
  const pythonPercent = 0;
  const javaPercent = 0;
  const cppPercent = 0;

  // Radar chart data mapping
  // Map 0-5 levels to 0-100 score per subject
  const radarData = [
    { subject: 'HTML', A: (htmlCompleted / 5) * 100, fullMark: 100 },
    { subject: 'CSS', A: (cssCompleted / 5) * 100, fullMark: 100 },
    { subject: 'JS', A: (jsCompleted / 5) * 100, fullMark: 100 },
    { subject: 'PYTHON', A: pythonPercent, fullMark: 100 },
    { subject: 'JAVA', A: javaPercent, fullMark: 100 },
    { subject: 'C++', A: cppPercent, fullMark: 100 },
  ];

  const joinedDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) 
    : 'UNKNOWN';

  const planets = [
    { id: 'html', src: '/Mars-HTML.svg', completed: htmlCompleted === 5 },
    { id: 'css', src: '/Venus-CSS.svg', completed: cssCompleted === 5 },
    { id: 'js', src: '/Mercury-JavaScript.svg', completed: jsCompleted === 5 },
    { id: 'python', src: '/Earth-Python.svg', completed: false },
    { id: 'java', src: '/Jupiter-Java.svg', completed: false },
    { id: 'cpp', src: '/Saturn-C++.svg', completed: false },
  ];

  const renderCard = (hideDetails: boolean, isModal: boolean) => (
    <div 
      className={`relative z-10 w-full h-full flex flex-col rounded-3xl overflow-hidden bg-[#1e0a2d] bg-[length:100%_100%] bg-center border-2 border-[#ff912d] ${!isModal ? 'shadow-2xl transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 cursor-pointer' : ''}`}
      style={{ backgroundImage: "url('/PASSPORT DESIGN.webp')" }}
      onClick={!isModal ? () => setIsZoomed(true) : undefined}
      ref={isModal ? cardRef : undefined}
    >
      <div className={`p-4 lg:p-6 flex-1 flex flex-col justify-between relative z-10 bg-black/10`}>
        
        {/* Top Section */}
        <div className={`flex gap-3 lg:gap-4 ${hideDetails ? 'items-center mt-2 lg:mt-4' : ''}`}>
          
          {/* Left: Avatar Box (Empty placeholder with glowing border) */}
          <div className={`w-[90px] h-[110px] lg:w-[120px] lg:h-[150px] shrink-0 border-2 border-[#ff912d] shadow-[0_0_15px_rgba(255,145,45,0.4)] rounded-xl bg-black/40 backdrop-blur-sm relative flex items-center justify-center ${!hideDetails ? 'mt-10 lg:mt-14 ml-2' : ''}`}>
            <span className="text-[#ff912d]/40 font-mono text-[10px] lg:text-xs uppercase text-center px-2">
              [Avatar System Coming Soon]
            </span>
          </div>
          
          {/* Middle: Details & Proficiency Bars */}
          <div className={`flex-1 flex flex-col pt-1 min-w-0 justify-center ${!hideDetails ? 'mt-2 lg:mt-4' : ''}`}>
            
            {/* User Details */}
            {!hideDetails && (
              <div className="flex flex-col gap-1 lg:gap-2">
                <div className="min-w-0">
                  <div className="text-[#ff912d] font-sans font-semibold text-[9px] lg:text-[10px] tracking-widest uppercase mb-0.5 drop-shadow-md">Display Name</div>
                  <div className="text-white font-bold text-base lg:text-xl uppercase tracking-wider leading-none drop-shadow-md truncate">
                    {profile?.displayName || profile?.name || 'Explorer'}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[#ff912d] font-sans font-semibold text-[9px] lg:text-[10px] tracking-widest uppercase mb-0.5 drop-shadow-md">Title</div>
                  <div className="text-white font-bold text-sm lg:text-lg uppercase tracking-wider leading-none drop-shadow-md truncate">
                    {profile?.title || 'Novice Explorer'}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[#ff912d] font-sans font-semibold text-[9px] lg:text-[10px] tracking-widest uppercase mb-0.5 drop-shadow-md">Joined Date</div>
                  <div className="text-white font-bold text-sm lg:text-lg tracking-wider leading-none drop-shadow-md truncate">
                    {joinedDate}
                  </div>
                </div>
              </div>
            )}

            {/* Proficiency Bars */}
            <div className={`flex flex-col gap-2.5 ${!hideDetails ? 'mt-6' : ''}`}>
              <div className="text-[#ff912d] font-sans font-semibold text-[10px] tracking-widest uppercase mb-1 drop-shadow-md">Concept Proficiency</div>
              
              {/* Web Dev Bar (10 segments) */}
              <div className="flex items-center gap-2">
                <div className="w-[70px] text-white/90 font-mono text-xs tracking-wider uppercase drop-shadow-md">Web-Dev</div>
                <div className="text-white/50 text-xs mr-2 drop-shadow-md">:</div>
                <div className="flex-1 flex h-[14px] gap-1 border border-[#ff912d]/60 p-0.5 bg-black/40 rounded-sm">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${i < (webDevPercent / 10) ? 'bg-[#00ffcc] shadow-[0_0_5px_rgba(0,255,204,0.6)]' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>

              {/* Python Bar */}
              <div className="flex items-center gap-2">
                <div className="w-[70px] text-white/90 font-mono text-xs tracking-wider uppercase drop-shadow-md">Python</div>
                <div className="text-white/50 text-xs mr-2 drop-shadow-md">:</div>
                <div className="flex-1 flex h-[14px] gap-1 border border-[#ff912d]/60 p-0.5 bg-black/40 rounded-sm">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${i < (pythonPercent / 10) ? 'bg-[#ff00ff] shadow-[0_0_5px_rgba(255,0,255,0.6)]' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>

              {/* Java Bar */}
              <div className="flex items-center gap-2">
                <div className="w-[70px] text-white/90 font-mono text-xs tracking-wider uppercase drop-shadow-md">Java</div>
                <div className="text-white/50 text-xs mr-2 drop-shadow-md">:</div>
                <div className="flex-1 flex h-[14px] gap-1 border border-[#ff912d]/60 p-0.5 bg-black/40 rounded-sm">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${i < (javaPercent / 10) ? 'bg-[#00ffff] shadow-[0_0_5px_rgba(0,255,255,0.6)]' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>

              {/* C++ Bar */}
              <div className="flex items-center gap-2">
                <div className="w-[70px] text-white/90 font-mono text-xs tracking-wider uppercase drop-shadow-md">C++</div>
                <div className="text-white/50 text-xs mr-2 drop-shadow-md">:</div>
                <div className="flex-1 flex h-[14px] gap-1 border border-[#ff912d]/60 p-0.5 bg-black/40 rounded-sm">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${i < (cppPercent / 10) ? 'bg-[#ff0000] shadow-[0_0_5px_rgba(255,0,0,0.6)]' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Hexagon Web */}
          <div className="w-[110px] h-[110px] lg:w-[160px] lg:h-[160px] shrink-0 flex items-center justify-center">
            <HexagonStatsWeb data={radarData} />
          </div>
          
        </div>

        {/* Bottom Section: Planet Journey Progression */}
        <div className="mt-4 lg:mt-6 mb-4 lg:mb-8">
          <div className="flex items-center justify-between overflow-hidden">
            <div className="text-white/60 font-sans font-bold text-[10px] lg:text-[12px] tracking-[0.2em] whitespace-nowrap overflow-hidden text-ellipsis flex-1 pr-4 drop-shadow-md">
              {'<<<<< JOURNEY << PROGRESS <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<'}
            </div>
          </div>
          
          <div className="relative mt-6 lg:mt-7 px-4 flex justify-between items-center h-10">
            {/* The connecting dotted line */}
            <div className="absolute top-1/2 left-8 right-8 h-[3px] -translate-y-1/2 z-0 border-b-[3px] border-dotted border-[#ff912d]/50" />
            
            {planets.map((planet, index) => (
              <div key={planet.id} className="relative z-10 flex flex-col items-center group">
                <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-full flex items-center justify-center transition-all ${planet.completed ? 'drop-shadow-[0_0_10px_rgba(0,255,100,0.8)]' : 'opacity-80 grayscale'}`}>
                  <img src={planet.src} alt={planet.id} className="w-9 h-9 lg:w-11 lg:h-11 object-contain hover:scale-110 transition-transform cursor-pointer" title={`Planet ${planet.id.toUpperCase()}`} />
                </div>
                {/* Status Indicator overlay */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1e0a2d] flex items-center justify-center ${planet.completed ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-[#ff912d]/50'}`}>
                  {planet.completed ? (
                     <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-white/70" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );

  return (
    <>
      <div className="relative group/passport-card flex flex-col w-full h-full min-h-[380px] lg:min-h-0 lg:aspect-[16/9]">
        {/* Background depth layer */}
        <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/passport-card:translate-x-3 group-hover/passport-card:translate-y-3" />
        
        {renderCard(true, false)}
      </div>

      {/* Modal Overlay */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          {/* Stop propagation so clicking the card itself doesn't close the modal */}
          <div 
            className="relative w-full max-w-4xl aspect-[16/9]" 
            onClick={(e) => e.stopPropagation()}
          >
            {renderCard(false, true)}
          </div>
          
          <div className="mt-8 flex gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }} 
              className="px-6 py-2 bg-[#ff912d] text-black font-bold uppercase tracking-widest rounded-lg hover:bg-white transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download PNG
            </button>
            <button 
              onClick={() => setIsZoomed(false)} 
              className="px-6 py-2 bg-white/10 text-white font-bold uppercase tracking-widest rounded-lg hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

