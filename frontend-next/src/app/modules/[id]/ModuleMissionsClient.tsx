"use client";

import React from 'react';
import Link from 'next/link';
import { Lock, Zap, Settings, X } from 'lucide-react';

const PLANET_IMAGES: Record<string, string> = {
  moon: "/assets/planets/00_moon/environment/MainMoon.svg",
  mars: "/assets/planets/celestial/Mars.svg",
  venus: "/assets/planets/celestial/Venus.svg",
  mercury: "/assets/planets/celestial/Mercury.svg",
  jupiter: "/assets/planets/celestial/Jupiter.svg",
  saturn: "/assets/planets/celestial/Saturn.svg",
  earth: "/assets/planets/celestial/Earth.svg",
  html: "/assets/planets/celestial/Mars.svg",
  css: "/assets/planets/celestial/Venus.svg",
  javascript: "/assets/planets/celestial/Mercury.svg",
  js: "/assets/planets/celestial/Mercury.svg",
  java: "/assets/planets/celestial/Jupiter.svg",
  cpp: "/assets/planets/celestial/Saturn.svg",
  python: "/assets/planets/celestial/Earth.svg",
  react: "/assets/planets/celestial/Earth.svg",
  node: "/assets/planets/celestial/Jupiter.svg",
};

const MODULE_DISPLAY_NAMES: Record<string, string> = {
  moon: "The Moon",
  mars: "Mars",
  venus: "Venus",
  mercury: "Mercury",
  jupiter: "Jupiter",
  saturn: "Saturn",
  earth: "Earth",
  html: "Mars",
  css: "Venus",
  javascript: "Mercury",
  js: "Mercury",
  java: "Jupiter",
  cpp: "Saturn",
  python: "Earth",
  react: "React",
  node: "Node.js",
};

const LEVEL_ILLUSTRATIONS = [
  "/assets/planets/00_moon/level_1/Spaceship.svg",
  "/assets/planets/00_moon/level_1/UFO.svg",
  "/assets/planets/celestial/Planet 1.svg",
  "/assets/planets/00_moon/environment/Meteor.svg",
  "/assets/planets/celestial/Planet 5.svg",
  "/assets/planets/celestial/Planet 6.svg",
  "/assets/planets/celestial/Planet 8.svg",
  "/assets/planets/00_moon/environment/Debris.svg",
  "/assets/planets/celestial/Planet 3.svg",
  "/assets/planets/celestial/Planet 2.svg",
];

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
  onClose?: () => void;
}

import { useSession } from 'next-auth/react';
import { getUserStorageItem } from '@/lib/userStorage';

export default function ModuleMissionsClient({
  moduleId,
  missions,
  meta,
  completedMissions,
  isLocked,
  onClose
}: ModuleMissionsClientProps) {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const [activeMissionModal, setActiveMissionModal] = React.useState<Mission | null>(null);
  const [savedMissionId, setSavedMissionId] = React.useState<string | null>(null);
  const displayLangName = MODULE_DISPLAY_NAMES[moduleId] || moduleId.toUpperCase();

  React.useEffect(() => {
    if (!userId) return;
    try {
      const raw = getUserStorageItem('active_saved_level', userId);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.missionId) {
          setSavedMissionId(parsed.missionId.toLowerCase());
        }
      }
    } catch (e) {}
  }, [userId]);

  const handleClose = (e: React.MouseEvent) => {
    if (onClose) {
      e.preventDefault();
      onClose();
    }
  };

  // Immersive locked overlay view
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1a082c]/75 backdrop-blur-md p-6">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white hover:border-[#ff912d]/50 hover:shadow-[0_0_15px_rgba(255,145,45,0.2)] transition-all p-2.5 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 z-[110] shadow-lg active:scale-95 flex items-center justify-center"
          title="Close"
        >
          <X size={20} />
        </button>

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
            onClick={handleClose}
            className="mt-2 px-8 py-4 bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white font-extrabold text-sm rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            Return to Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1a082c]/75 backdrop-blur-md p-6 overflow-hidden">

      {/* Sleek top-right close button (X) */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white hover:border-[#ff912d]/50 hover:shadow-[0_0_15px_rgba(255,145,45,0.2)] transition-all p-2.5 bg-black/40 hover:bg-black/60 rounded-full border border-white/10 z-[110] shadow-lg active:scale-95 flex items-center justify-center"
        title="Return to Map"
      >
        <X size={20} />
      </button>

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
              <div
                key={mission.id}
                onClick={() => {
                  if (isUnlocked) {
                    setActiveMissionModal(mission);
                  }
                }}
                className={`bg-[#1a082c] border border-white/10 rounded-xl overflow-hidden hover:border-[#ff912d]/50 transition-all duration-300 group flex flex-col shadow-xl ${!isUnlocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:-translate-y-1'
                  }`}
              >
                {/* Top Visual Area (Starry backdrop with themed space illustrations) */}
                <div className="relative w-full h-36 bg-gradient-to-b from-[#1a082c]/80 to-[#130927]/90 overflow-hidden flex items-center justify-center border-b border-white/5 flex-shrink-0">
                  {/* Stars overlay */}
                  <img
                    src="/assets/global/ui/Landing Page BG.png"
                    alt="Stars"
                    className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Space Illustration Graphic */}
                  <img
                    src={LEVEL_ILLUSTRATIONS[index % LEVEL_ILLUSTRATIONS.length]}
                    alt="Illustration"
                    className={`w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] ${!isUnlocked ? 'grayscale opacity-20' : 'animate-pulse group-hover:scale-110 transition-all duration-500'
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
                <div className="bg-[#130927] p-5 flex flex-col flex-1 text-left justify-between min-h-[190px]">
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-base sm:text-lg leading-snug flex items-center justify-between gap-3 h-12 line-clamp-2 overflow-hidden">
                      <span className="line-clamp-2">{mission.title.replace(/^[a-zA-Z]+\s+Level\s+\d+:\s*/, '')}</span>
                      {isCompleted && (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-md border border-emerald-500/20 whitespace-nowrap shrink-0">
                          Complete
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed h-10 line-clamp-2 overflow-hidden">
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
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all select-none ${!isUnlocked
                            ? 'bg-white/5 text-gray-500 border border-white/5'
                            : isCompleted
                              ? 'bg-[#8c2e0b] hover:bg-[#a3360d] text-white border-2 border-[#ffd1a9]/90 shadow-[0_4px_12px_rgba(0,0,0,0.3),0_0_12px_rgba(234,88,12,0.35)]'
                              : 'bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white shadow-md shadow-[#ff912d]/10'
                          }`}
                      >
                        {!isUnlocked ? 'Locked' : isCompleted ? 'Replay' : 'Enter Lab'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Mission Briefing Intro Modal Overlay */}
      {activeMissionModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
          <div className="bg-[#1e0a2d]/95 border-2 border-[#ff912d]/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_0_50px_rgba(255,145,45,0.35)] relative overflow-hidden flex flex-col gap-6 text-center">
            
            {/* Top Close Button */}
            <button
              onClick={() => setActiveMissionModal(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/10"
            >
              <X size={20} />
            </button>

            {/* Header Badge & Title */}
            <div className="space-y-2">
              <span className="bg-[#ff912d]/15 text-[#ff912d] border border-[#ff912d]/40 font-mono text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                [ MISSION BRIEFING ]
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-tight">
                {activeMissionModal.title}
              </h3>
              <p className="text-[#ff912d] text-xs font-mono font-bold uppercase tracking-wider">
                {displayLangName} Orbit System
              </p>
            </div>

            {/* Mission Illustration & Description */}
            <div className="bg-[#130927] border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-3 relative overflow-hidden">
              <img 
                src="/assets/global/ui/Landing Page BG.png" 
                alt="Space" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" 
              />
              <img 
                src={PLANET_IMAGES[moduleId] || "/assets/planets/celestial/Planet 1.svg"} 
                alt="Planet" 
                className="w-16 h-16 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,145,45,0.4)] animate-pulse" 
              />
              <p className="text-gray-300 text-sm font-medium leading-relaxed relative z-10">
                {activeMissionModal.desc}
              </p>
            </div>

            {/* Rewards Chip Row */}
            <div className="flex items-center justify-center gap-3">
              <span className="bg-amber-400/15 text-amber-400 border border-amber-400/30 px-4 py-1.5 rounded-xl font-mono text-xs font-black flex items-center gap-1.5">
                <Zap size={14} className="fill-amber-400" /> +100 XP
              </span>
              <span className="bg-purple-500/15 text-purple-300 border border-purple-500/30 px-4 py-1.5 rounded-xl font-mono text-xs font-black flex items-center gap-1.5">
                <Settings size={14} className="text-purple-400" /> +20 GEARS
              </span>
            </div>

            {/* Modal Actions: Launch Mission vs Cancel */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setActiveMissionModal(null)}
                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <Link
                href={`/sandbox?missionId=${activeMissionModal.id}${savedMissionId === activeMissionModal.id.toLowerCase() ? '' : completedMissions.some(m => m.missionId.toLowerCase() === activeMissionModal.id.toLowerCase()) ? '&mode=replay' : ''}`}
                className={`flex-1 py-3.5 font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 text-center cursor-pointer ${
                  savedMissionId === activeMissionModal.id.toLowerCase()
                    ? 'bg-[#8c2e0b] hover:bg-[#a3360d] text-white border-2 border-[#ffd1a9]/90 shadow-[0_4px_16px_rgba(0,0,0,0.3),0_0_14px_rgba(234,88,12,0.4)]'
                    : completedMissions.some(m => m.missionId.toLowerCase() === activeMissionModal.id.toLowerCase())
                    ? 'bg-[#8c2e0b] hover:bg-[#a3360d] text-white border-2 border-[#ffd1a9]/90 shadow-[0_4px_16px_rgba(0,0,0,0.3),0_0_14px_rgba(234,88,12,0.4)]'
                    : 'bg-[#ff912d] hover:bg-orange-400 text-black shadow-[0_0_20px_rgba(255,145,45,0.4)]'
                }`}
              >
                {savedMissionId === activeMissionModal.id.toLowerCase() ? 'Resume Mission' : completedMissions.some(m => m.missionId.toLowerCase() === activeMissionModal.id.toLowerCase()) ? 'Replay Mission' : 'Start Mission'}
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
