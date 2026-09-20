"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Lock, Rocket, Zap, HelpCircle, AlertTriangle, X, Play, RotateCcw } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  desc: string;
  tag?: string;
}

interface ModuleMeta {
  title: string;
  category: string;
  desc: string;
}

interface CompletedMission {
  missionId: string;
}

interface ModuleDetailsClientProps {
  moduleId: string;
  missions: Mission[];
  meta: ModuleMeta;
  completedMissions: CompletedMission[];
  sessionUser: {
    name?: string | null;
    image?: string | null;
  };
}

const getMissionHint = (missionId: string) => {
  const hints: Record<string, string> = {
    "moon-1": "Hint: Connect different puzzle blocks in order to guide your rover safely to the goal!",
    "moon-2": "Hint: Use Repeat loops and Scan sensors to sort the cargo!",
    "moon-3": "Hint: Navigate the vents, handle flight deck scenarios, balance reactor power to 100, and engage autopilot functions for warp jump!",
    "html-1": "Hint: Focus on correct nesting of basic tags like h1, p, and lists.",
    "html-2": "Hint: Remember to specify input type attributes and form label relations.",
    "html-3": "Hint: Use tr for rows, th for headers, and td for standard cells.",
    "html-4": "Hint: Use semantic tags (header, nav, main, section, footer) for document outline.",
    "html-5": "Hint: Configure src, width, height, and controls for video/audio embeds.",
    "mars-1": "Hint: Use semantic tags (header, nav, main, section, article, footer) to construct habitat layout.",
    "mars-2": "Hint: Pair form inputs with <label for=\"...\"> and include required submit triggers.",
    "mars-3": "Hint: Organize minerals using <table>, <thead>, <tbody>, <tr>, <th>, and <td>.",
    "mars-4": "Hint: Embed media using <video controls> and <audio autoplay loop> tags.",
    "mars-5": "Hint: Link telemetry stations with <a href=\"...\"> using relative paths.",
    "venus-1": "Hint: Master targeting classes (.thermal), IDs (#core), and attribute selectors.",
    "venus-2": "Hint: Remember padding stays inside borders while margin provides outer clearance.",
    "venus-3": "Hint: Use justify-content for main axis and align-items for cross axis alignment.",
    "venus-4": "Hint: Define column fractions using grid-template-columns: repeat(3, 1fr).",
    "venus-5": "Hint: Define @keyframes orbit { from { ... } to { ... } } and attach animation property.",
    "mercury-1": "Hint: Use let for mutable telemetry and const for physical constants.",
    "mercury-2": "Hint: Check radiation levels with if (flux > 100) and provide fallback else blocks.",
    "mercury-3": "Hint: Write pure function declarations that return calculated orbital velocities.",
    "mercury-4": "Hint: Chain .filter() to select craters and .map() to format their coordinates.",
    "mercury-5": "Hint: Attach event listeners with document.getElementById('flare').addEventListener('click', fn).",
    "jupiter-1": "Hint: Declare public class Rover with private fields and a public constructor.",
    "jupiter-2": "Hint: Use the 'extends' keyword to inherit base attributes and @Override methods.",
    "jupiter-3": "Hint: Encapsulate internal battery states with getCharge() and setCharge().",
    "jupiter-4": "Hint: Declare an interface TelemetryStream and implement it across gas probes.",
    "jupiter-5": "Hint: Wrap risky I/O in try { ... } catch (IOException e) { ... } and use List<Rover>.",
    "saturn-1": "Hint: Declare pointer int* ptr = &val and dereference with *ptr.",
    "saturn-2": "Hint: Allocate with new Probe() and always pair with delete probe to prevent leaks.",
    "saturn-3": "Hint: Use std::vector<RingParticle> and push_back() for dynamic buffers.",
    "saturn-4": "Hint: Overload operators using 'Vector3 operator+(const Vector3& other)'.",
    "saturn-5": "Hint: Define template<typename T> T computeTrajectory(T a, T b).",
    "earth-1": "Hint: Use Python dicts telemetry = {'lat': 0.0, 'lon': 0.0} and list operations.",
    "earth-2": "Hint: Use [p['altitude'] for p in probes if p['status'] == 'active'].",
    "earth-3": "Hint: Always use 'with open(\"flight.log\", \"r\") as f:' for safe file streams.",
    "earth-4": "Hint: Import numpy as np and use np.dot() and np.linalg.norm() for orbital vectors.",
    "earth-5": "Hint: Use requests.get() to fetch satellite ephemeris data from Mission Control APIs."
  };
  return hints[missionId.toLowerCase()] || "Hint: Complete this level to earn 150 XP and unlock rewards!";
};

const MODULE_PLANET_ICON: Record<string, string> = {
  moon: '/MainMoon.svg',
  mars: '/Planets/Mars.svg',
  html: '/Planets/Mars.svg',
  venus: '/Planets/Venus.svg',
  css: '/Planets/Venus.svg',
  mercury: '/Planets/Mercury.svg',
  javascript: '/Planets/Mercury.svg',
  js: '/Planets/Mercury.svg',
  jupiter: '/Planets/Jupiter.svg',
  java: '/Planets/Jupiter.svg',
  saturn: '/Planets/Saturn.svg',
  cpp: '/Planets/Saturn.svg',
  earth: '/Planets/Earth.svg',
  python: '/Planets/Earth.svg',
};

export default function ModuleDetailsClient({
  moduleId,
  missions,
  meta,
  completedMissions,
  sessionUser,
}: ModuleDetailsClientProps) {
  const router = useRouter();
  const [pendingMission, setPendingMission] = useState<Mission | null>(null);
  const [existingSaveInfo, setExistingSaveInfo] = useState<{ title: string; sectionIndex: number; missionId: string } | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [savedMissionId, setSavedMissionId] = useState<string | null>(null);
  const [localCompletedIds, setLocalCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    let activeId: string | null = null;
    try {
      const rawSave = localStorage.getItem('netstart_active_saved_level') || localStorage.getItem('netstart_active_level');
      if (rawSave) {
        const parsed = JSON.parse(rawSave);
        if (parsed.missionId) {
          activeId = parsed.missionId.toLowerCase();
        }
      }
    } catch (e) {
      console.warn("Could not retrieve active mission ID:", e);
    }

    // Also read locally-cached completions for instant UI feedback
    let cachedList: string[] = [];
    try {
      const cached: string[] = JSON.parse(localStorage.getItem('netstart_completed_missions') || '[]');
      cachedList = cached.map(id => id.toLowerCase());
      setLocalCompletedIds(cachedList);
    } catch (e) {}

    // If the active save is already completed, clear it from localStorage so it never lingers
    const completedSet = new Set([
      ...completedMissions.map(m => m.missionId.toLowerCase()),
      ...cachedList,
    ]);
    if (activeId && completedSet.has(activeId)) {
      try {
        localStorage.removeItem('netstart_active_saved_level');
        localStorage.removeItem('netstart_active_level');
      } catch (e) {}
      setSavedMissionId(null);
    } else {
      setSavedMissionId(activeId);
    }
  }, [completedMissions]);

  // Merge server completions with localStorage cache
  const allCompletedIds = new Set([
    ...completedMissions.map(m => m.missionId.toLowerCase()),
    ...localCompletedIds,
  ]);

  const planetIcon = MODULE_PLANET_ICON[moduleId.toLowerCase()] || '/MainMoon.svg';

  const getCompletedCount = (modId: string) => {
    return missions.filter(mission =>
      allCompletedIds.has(mission.id.toLowerCase())
    ).length;
  };

  const completedCount = getCompletedCount(moduleId);
  const progressPct = missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0;

  const handleStartMission = (mission: Mission, isRetry = false) => {
    try {
      const rawSave = localStorage.getItem('netstart_active_saved_level');
      if (rawSave) {
        const parsed = JSON.parse(rawSave);
        if (parsed.missionId && parsed.missionId.toLowerCase() !== mission.id.toLowerCase()) {
          setExistingSaveInfo({
            title: parsed.title || parsed.missionId,
            sectionIndex: parsed.sectionIndex || 0,
            missionId: parsed.missionId,
          });
          setPendingMission(mission);
          setShowOverrideModal(true);
          return;
        }
      }
    } catch (e) {
      console.warn("Error checking existing save:", e);
    }

    // Direct launch
    launchLevel(mission, isRetry);
  };

  const launchLevel = (mission: Mission, isRetry = false) => {
    try {
      // Set active mission info in localStorage for profile ongoing mission card
      localStorage.setItem('netstart_active_level', JSON.stringify({
        missionId: mission.id,
        title: mission.title,
        module: meta.title,
        icon: planetIcon,
        desc: mission.desc,
        tag: mission.tag || 'Basic Syntax',
        startedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.warn("Could not save active level metadata:", e);
    }

    const isSavedProgress = Boolean(savedMissionId && savedMissionId.toLowerCase() === mission.id.toLowerCase());
    const isReplay = !isSavedProgress && completedMissions.some(m => m.missionId.toLowerCase() === mission.id.toLowerCase());
    
    let skipCutscene = false;
    if (isRetry || isSavedProgress) {
      skipCutscene = true;
    }

    router.push(`/sandbox?missionId=${mission.id}${isReplay ? '&mode=replay' : ''}&skipCutscene=${skipCutscene}`);
  };

  const handleConfirmOverride = () => {
    if (!pendingMission) return;
    try {
      localStorage.removeItem('netstart_active_saved_level');
      setSavedMissionId(pendingMission.id.toLowerCase());
    } catch (e) {
      console.warn(e);
    }
    setShowOverrideModal(false);
    launchLevel(pendingMission);
  };

  const isCompactRow = missions.length <= 3;

  return (
    <div className="h-full w-full bg-[#130927] text-white flex flex-col relative overflow-y-auto overflow-x-hidden pb-12">
      {/* Background image elements */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none" 
        style={{ 
          backgroundImage: "url('/Landing Page BG.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          opacity: 0.15 
        }} 
      />
      <div className="fixed inset-0 bg-black/50 z-0" />

      {/* Main layout frame */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 py-12 flex-grow flex flex-col gap-10">
        
        {/* Navigation / Header Area */}
        <div className="relative flex items-center justify-center mt-2 w-full">
          {/* Back Button (Yellow Circle on Left) */}
          <Link 
            href="/modules"
            className="absolute left-0 w-12 h-12 rounded-full bg-yellow-400 text-black hover:bg-yellow-500 transition-all flex items-center justify-center shadow-lg hover:scale-105 shrink-0 group z-10"
          >
            <ArrowLeft size={22} className="stroke-[2.5]" />
          </Link>
          
          {/* Welcome Title Centered */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-black text-white uppercase tracking-wider text-center px-14">
            Welcome to {meta.title}
          </h1>
        </div>

        {/* Dynamic Expanding Level Cards Container */}
        <div className={`flex flex-col ${isCompactRow ? 'md:flex-row' : 'lg:flex-row'} gap-6 mt-4 items-stretch w-full transition-all duration-500`}>
          {missions.map((mission, index) => {
            const isCompleted = allCompletedIds.has(mission.id.toLowerCase());
            
            // Find the index of the first uncompleted mission
            const firstUncompletedIndex = missions.findIndex(m => !allCompletedIds.has(m.id.toLowerCase()));
            
            // If completed or it is the first uncompleted mission, it is unlocked/colored.
            const isUnlocked = index <= (firstUncompletedIndex === -1 ? missions.length : firstUncompletedIndex);
            
            // Is this level currently saved / active in progress? (Completed missions are never active in progress)
            const hasActiveProgress = !isCompleted && Boolean(savedMissionId && savedMissionId === mission.id.toLowerCase());
            
            // Current active card: matches the saved in-progress level, or falls back to first uncompleted level if no active save exists
            const isCurrentActive = savedMissionId 
              ? hasActiveProgress 
              : (!isCompleted && index === firstUncompletedIndex);

            const imageUrl = "/login-bg.jpg";
            const isHovered = hoveredCardId === mission.id;

            return (
              <div 
                key={mission.id} 
                onMouseEnter={() => setHoveredCardId(mission.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                onFocus={() => setHoveredCardId(mission.id)}
                onBlur={() => setHoveredCardId(null)}
                tabIndex={0}
                className="relative group/card flex flex-col flex-1 z-10 transition-all duration-300 ease-out outline-none"
              >
                {/* Shaded background depth layer */}
                <div className={`absolute inset-0 bg-[#090311]/75 rounded-3xl z-0 transition-all duration-300 ${
                  isHovered ? 'translate-x-2.5 translate-y-2.5' : 'translate-x-2 translate-y-2'
                }`} />

                {/* Actual Front Card */}
                <div 
                  className={`relative z-10 bg-[#1e0a2d]/45 backdrop-blur-md border rounded-3xl overflow-hidden flex flex-col h-full transition-all duration-300 shadow-xl ${
                    hasActiveProgress 
                      ? 'border-[#ff912d]/80 ring-2 ring-[#ff912d]/40 shadow-[0_0_25px_rgba(255,145,45,0.35)]' 
                      : isUnlocked && !isCompleted && index === firstUncompletedIndex
                      ? 'border-white/30 ring-1 ring-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                      : 'border-white/10'
                  } ${
                    isUnlocked ? '' : 'pointer-events-none opacity-50'
                  } ${isHovered ? 'shadow-[#ff912d]/15 shadow-xl -translate-x-0.5 -translate-y-0.5 ring-1 ring-[#ff912d]/30' : ''}`}
                >
                  {/* Visual progression details / Image Header */}
                  <div className="relative aspect-[2.6/1] sm:aspect-[2.8/1] w-full overflow-hidden bg-black/20 shrink-0">
                    <img 
                      src={imageUrl} 
                      alt={mission.title} 
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isHovered ? 'scale-102' : ''
                      } ${isUnlocked ? '' : 'grayscale opacity-40'}`}
                    />
                    
                    {/* Status Overlay Badges */}
                    {hasActiveProgress ? (
                      <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/25 flex items-center gap-1.5 shadow-lg shadow-amber-500/30 animate-pulse">
                        <Rocket size={11} className="stroke-[2.5]" /> Active
                      </div>
                    ) : isCompleted ? (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/25 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                        <Check size={11} className="stroke-[3]" /> Completed
                      </div>
                    ) : !isUnlocked ? (
                      <div className="absolute top-4 right-4 bg-black/70 text-gray-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/10 flex items-center gap-1.5 shadow-lg">
                        <Lock size={11} /> Locked
                      </div>
                    ) : (
                      <div className="absolute top-4 right-4 bg-[#130927] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20 flex items-center gap-1.5 shadow-lg shadow-black/40">
                        <Zap size={11} className="fill-white stroke-white" /> In Progress
                      </div>
                    )}
                    
                    {/* Index badge at bottom-left of image */}
                    <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md text-white font-display font-black text-sm px-3 py-1 rounded-lg border border-white/15">
                      LEVEL {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Solid Orange Content Block */}
                  <div className="bg-[#ff912d] p-5 flex-1 flex flex-col justify-between gap-3 transition-all duration-300">
                    <div className="space-y-2.5">
                      {/* Dark capsule badges */}
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <span className="bg-[#130927] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/5">
                          {mission.tag || meta.category.split(' ')[0]}
                        </span>
                        <span className="bg-[#130927] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/5 flex items-center gap-1">
                          <Zap size={9} className="text-yellow-400" /> +150 XP
                        </span>
                      </div>

                      {/* Title block */}
                      <h3 className={`text-white text-base sm:text-lg font-display font-black tracking-tight leading-snug transition-colors ${
                        isHovered ? 'underline' : ''
                      }`}>
                        {mission.title}
                      </h3>
                      
                      {/* Description synopsis block: dynamically expands so full synopsis is readable */}
                      <p className={`text-white/95 text-xs sm:text-[13px] font-medium leading-relaxed transition-all duration-300 ${
                        isHovered ? 'line-clamp-none' : 'line-clamp-2'
                      }`}>
                        {mission.desc}
                      </p>
                    </div>
                    
                    {/* Action/Enter Lab link inside card */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/15 shrink-0 mt-auto">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <>
                            <button
                              onClick={() => handleStartMission(mission, false)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-300/90 shadow-[0_4px_14px_rgba(0,0,0,0.3),0_0_12px_rgba(16,185,129,0.35)] font-sans font-black text-[10px] uppercase tracking-widest py-2.5 px-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center flex-1"
                            >
                              <RotateCcw size={11} className="stroke-[2.5]" /> Replay
                            </button>
                            <button
                              onClick={() => handleStartMission(mission, true)}
                              className="bg-sky-600 hover:bg-sky-500 text-white border-2 border-sky-300/90 shadow-[0_4px_14px_rgba(0,0,0,0.3),0_0_12px_rgba(14,165,233,0.35)] font-sans font-black text-[10px] uppercase tracking-widest py-2.5 px-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center flex-1"
                            >
                              <Rocket size={11} className="stroke-[2]" /> Retry
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleStartMission(mission, false)}
                            className={`font-sans font-black text-[11px] uppercase tracking-widest py-2.5 px-5 rounded-xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center w-32 ${
                              hasActiveProgress
                                ? 'bg-[#8c2e0b] hover:bg-[#a3360d] text-white border-2 border-[#ffd1a9]/90 shadow-[0_4px_14px_rgba(0,0,0,0.3),0_0_12px_rgba(234,88,12,0.35)]'
                                : 'bg-[#130927] hover:bg-[#1e0a2d] text-white border-2 border-white/30 hover:border-white/60 shadow-md'
                            }`}
                          >
                            {hasActiveProgress ? (
                              <>
                                <Play size={11} className="fill-white stroke-white" /> Resume
                              </>
                            ) : (
                              <>
                                <Rocket size={11} className="stroke-[2]" /> Start
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="relative group/tooltip">
                        <HelpCircle size={17} className="hover:text-white text-white/80 transition-colors cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-56 p-2.5 bg-[#130927] border border-white/10 rounded-xl text-[10px] text-gray-200 normal-case opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none shadow-2xl z-30 font-semibold leading-relaxed">
                          {getMissionHint(mission.id)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Progress Capsule with Planet/Moon Icon */}
        <div className="-mt-3 flex items-center justify-center">
          <div className="flex items-center gap-4 bg-[#1e0a2d]/90 border border-white/15 rounded-full px-7 py-3 backdrop-blur-xl shadow-2xl">
            <img 
              src={planetIcon} 
              alt={meta.title} 
              className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(255,145,45,0.5)] shrink-0" 
            />
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Progress</span>
            
            {/* Visual Progress Bar Track */}
            <div className="w-28 sm:w-44 h-3 bg-black/70 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-[#ff912d] to-yellow-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,145,45,0.7)]"
                style={{ width: `${Math.min(100, Math.max(progressPct > 0 ? 10 : 0, progressPct))}%` }}
              />
            </div>

            <span className="text-white font-mono font-black text-base sm:text-lg shrink-0">
              {progressPct}%
            </span>
          </div>
        </div>

      </div>

      {/* Save Override Confirmation Modal */}
      {showOverrideModal && existingSaveInfo && pendingMission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#1e0a2d] border border-[#ff912d]/40 rounded-[32px] p-7 sm:p-9 max-w-xl w-full shadow-[0_0_50px_rgba(255,145,45,0.15)] relative flex flex-col gap-6 text-left">
            <button
              onClick={() => setShowOverrideModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-full hover:bg-white/10"
              title="Close"
            >
              <X size={22} />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-wide">
                  Overwrite Save?
                </h3>
              </div>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-2xl p-5 text-sm sm:text-base text-gray-300 leading-relaxed font-sans">
              <p>
                Starting <strong className="text-white font-bold">{pendingMission.title}</strong> will replace your active progress in <strong className="text-[#ff912d] font-bold">{existingSaveInfo.title}</strong> (Section {existingSaveInfo.sectionIndex + 1}).
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="flex-1 py-3.5 sm:py-4 px-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer text-center active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOverride}
                className="flex-1 py-3.5 sm:py-4 px-5 rounded-xl bg-gradient-to-r from-[#ff912d] to-amber-500 hover:from-amber-500 hover:to-[#ff912d] text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#ff912d]/25 cursor-pointer text-center active:scale-95"
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
