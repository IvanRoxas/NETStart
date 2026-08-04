"use client";

import React from 'react';
import Link from 'next/link';
import { Lock, Zap, Settings, X } from 'lucide-react';

const PLANET_IMAGES: Record<string, string> = {
  html: "/Planet 7.svg",
  css: "/Planet 4.svg",
  javascript: "/Planet 2.svg",
  react: "/Planet 1.svg",
  node: "/Planet 3.svg",
};

const MODULE_DISPLAY_NAMES: Record<string, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "Javascript",
  react: "React",
  node: "Node.js",
};

interface Mission {
  id: string;
  title: string;
  desc: string;
}

interface CompletedMission {
  missionId: string;
}

interface ModuleMissionsClientProps {
  moduleId: string;
  missions: Mission[];
  meta: {
    title: string;
    category: string;
    desc: string;
  };
  completedMissions: CompletedMission[];
  isLocked: boolean;
}

export default function ModuleMissionsClient({
  moduleId,
  missions,
  meta,
  completedMissions,
  isLocked
}: ModuleMissionsClientProps) {
  const displayLangName = MODULE_DISPLAY_NAMES[moduleId] || moduleId.toUpperCase();

  // Immersive locked overlay view
  if (isLocked) {
    return (
      <div className="relative min-h-screen w-full bg-[#130927] overflow-x-hidden overflow-y-auto">
        {/* Starfield backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 blur-[1px]" style={{ backgroundImage: "url('/Landing Page BG.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-black/60 z-0" />

        {/* Full-screen Overlay architecture */}
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-6">
          <Link 
            href="/modules"
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors p-2 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 z-[110] shadow-lg"
            title="Close"
          >
            <X size={20} />
          </Link>

          <div className="bg-[#1a082c]/95 border border-[#ff912d]/30 p-10 rounded-3xl max-w-md w-full text-center shadow-2xl relative z-10 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#ff912d]/10 rounded-full flex items-center justify-center border border-[#ff912d]/20 text-[#ff912d]">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white uppercase tracking-wider">Module Locked</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                You must complete all prior modules along the constellation flight path before entering this system orbit.
              </p>
            </div>

            <Link
              href="/modules"
              className="mt-2 px-8 py-4 bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white font-extrabold text-sm rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
              Return to Map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#130927] overflow-x-hidden overflow-y-auto">
      {/* Starfield backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 blur-[1px]" style={{ backgroundImage: "url('/Landing Page BG.png')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Immersive Level Browse Fullscreen Overlay */}
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-6 overflow-hidden">
        
        {/* Sleek top-right close button (X) */}
        <Link 
          href="/modules"
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors p-2.5 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 z-[110] shadow-lg transition-transform active:scale-95"
          title="Return to Map"
        >
          <X size={20} />
        </Link>

        {/* Outer overlay container */}
        <div className="relative z-10 max-w-5xl w-full flex flex-col items-center gap-4 max-h-[90vh]">
          
          {/* Header Title with Orbiter Status */}
          <div className="text-center mb-4">
            <h2 className="text-3xl font-display font-black text-white tracking-widest uppercase">
              ORBITING: <span className="text-[#ff912d]">{moduleId.toUpperCase()}</span>
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-lg mx-auto">
              Select an unlocked module mission to begin deploying custom Blockly code elements.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full overflow-y-auto pr-2 custom-scrollbar p-1 pb-8">
            {missions.map((mission, index) => {
              const isCompleted = completedMissions.some(m => m.missionId.toLowerCase() === mission.id.toLowerCase());
              
              // Progression Lock Check: Level i is unlocked if level i-1 is completed (Level 1 is always unlocked)
              const isUnlocked = index === 0 || completedMissions.some(m => m.missionId.toLowerCase() === missions[index - 1].id.toLowerCase());

              return (
                <Link
                  key={mission.id}
                  href={`/sandbox?missionId=${mission.id}`}
                  onClick={(e) => { if (!isUnlocked) e.preventDefault(); }}
                  className={`bg-[#1a082c] border border-white/10 rounded-xl overflow-hidden hover:border-[#ff912d]/50 transition-all duration-300 group flex flex-col shadow-xl ${
                    !isUnlocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:-translate-y-1'
                  }`}
                >
                  {/* Top Visual Area (Starry backdrop with themed planet image) */}
                  <div className="relative w-full h-32 bg-black/40 overflow-hidden flex items-center justify-center border-b border-white/5 flex-shrink-0">
                    {/* Stars overlay */}
                    <img 
                      src="/Landing Page BG.png" 
                      alt="Stars" 
                      className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-110 transition-transform duration-500" 
                    />
                    
                    {/* Planet Graphic */}
                    <img 
                      src={PLANET_IMAGES[moduleId] || "/Planet 2.svg"} 
                      alt="Planet" 
                      className={`w-14 h-14 object-contain ${
                        !isUnlocked ? 'grayscale opacity-25' : 'animate-spin-slow group-hover:scale-105 transition-all duration-300'
                      }`}
                    />

                    {/* Top-Left Badges */}
                    <div className="absolute top-3 left-3 flex items-center z-10">
                      <span className="bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        {displayLangName}
                      </span>
                      <span className="bg-purple-900/40 text-purple-300 border border-purple-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase ml-2 tracking-wider">
                        Medium
                      </span>
                    </div>

                    {/* Grayscale/Locked overlays with center lock icon */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex items-center justify-center z-20">
                        <div className="w-9 h-9 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white/70 shadow-lg">
                          <Lock size={14} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Text Area (bg-[#130927] p-5) */}
                  <div className="bg-[#130927] p-5 flex flex-col flex-1 text-left justify-between min-h-[170px]">
                    <div className="space-y-1">
                      <h3 className="text-white font-bold text-base leading-tight flex items-center justify-between gap-3">
                        <span>{mission.title.replace(/^[a-zA-Z]+\s+Level\s+\d+:\s*/, '')}</span>
                        {isCompleted && (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-md border border-emerald-500/20 whitespace-nowrap">
                            Complete
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed mt-1">
                        {mission.desc}
                      </p>
                    </div>

                    <div>
                      <div className="w-full h-px bg-white/5 my-3" />
                      <div className="flex items-center justify-between">
                        {/* Game styled rewards icons */}
                        <div className="flex flex-col gap-1 text-[11px] font-mono font-black text-left">
                          <div className="flex items-center gap-1.5 text-[#b259ff]">
                            <Zap className="w-3.5 h-3.5 text-yellow-400" />
                            <span>+100</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Settings className="w-3.5 h-3.5 text-purple-400" />
                            <span>+20</span>
                          </div>
                        </div>

                        {/* CTA button state */}
                        <span 
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all select-none ${
                            !isUnlocked 
                              ? 'bg-white/5 text-gray-500 border border-white/5' 
                              : isCompleted 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white shadow-md shadow-[#ff912d]/10'
                          }`}
                        >
                          {!isUnlocked ? 'Locked' : isCompleted ? 'Revisit' : 'Enter Lab'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </div>

    </div>
  );
}
