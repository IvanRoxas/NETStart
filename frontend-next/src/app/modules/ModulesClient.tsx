"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, Rocket, Award, Settings, Zap, Brain, X } from 'lucide-react';
import PlanetNode from '@/components/PlanetNode';

import { getUserStorageItem, setUserStorageItem, removeUserStorageItem } from '@/lib/userStorage';

interface LiveStats {
  level: number;
  progress: number;
  nextThreshold?: number | string;
  xp: number;
  gears: number;
  isMaxLevel?: boolean;
  levelCurrentXp?: number;
  levelRequiredXp?: number;
}

interface CompletedMission {
  missionId: string;
}

interface ModulesClientProps {
  userId?: string;
  isVerified: boolean;
  hasTakenAptitudeTest?: boolean;
  liveStats: LiveStats;
  completedMissions: CompletedMission[];
}

// Constellation path segments connecting all 7 planets
const pathSegments = [
  { from: 0, to: 1, x1: 26, y1: 14, x2: 74, y2: 26 },
  { from: 1, to: 2, x1: 74, y1: 26, x2: 25, y2: 38 },
  { from: 2, to: 3, x1: 25, y1: 38, x2: 75, y2: 50 },
  { from: 3, to: 4, x1: 75, y1: 50, x2: 24, y2: 62 },
  { from: 4, to: 5, x1: 24, y1: 62, x2: 76, y2: 74 },
  { from: 5, to: 6, x1: 76, y1: 74, x2: 26, y2: 86 },
];

export default function ModulesClient({ userId, isVerified, hasTakenAptitudeTest = false, liveStats, completedMissions }: ModulesClientProps) {
  const [activePlanetId, setActivePlanetId] = useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const fromCutscene = searchParams ? searchParams.get('fromCutscene') === 'true' : false;
  const [revealOverlay, setRevealOverlay] = useState(fromCutscene);
  const [fadeOverlay, setFadeOverlay] = useState(false);

  useEffect(() => {
    if (fromCutscene) {
      const fadeTimer = setTimeout(() => setFadeOverlay(true), 800);
      const removeTimer = setTimeout(() => setRevealOverlay(false), 4000);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [fromCutscene]);


  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    if (!userId) return;
    try {
      const rawSave = getUserStorageItem('active_saved_level', userId) || getUserStorageItem('active_level', userId);
      if (rawSave) {
        const parsed = JSON.parse(rawSave);
        if (parsed.missionId) {
          const id = parsed.missionId.toLowerCase();
          if (id.startsWith('moon')) setActivePlanetId('moon');
          else if (id.startsWith('mars') || id.startsWith('html')) setActivePlanetId('mars');
          else if (id.startsWith('venus') || id.startsWith('css')) setActivePlanetId('venus');
          else if (id.startsWith('mercury') || id.startsWith('javascript') || id.startsWith('js')) setActivePlanetId('mercury');
          else if (id.startsWith('jupiter') || id.startsWith('java')) setActivePlanetId('jupiter');
          else if (id.startsWith('saturn') || id.startsWith('cpp')) setActivePlanetId('saturn');
          else if (id.startsWith('earth') || id.startsWith('python')) setActivePlanetId('earth');
        }
      }
    } catch (e) {
      console.warn("Could not retrieve active mission ID in ModulesClient:", e);
    }
  }, [userId]);

  // Container logic for blurring unverified/untested users
  const containerClass = `absolute inset-0 w-full h-full transition-all duration-500 overflow-x-hidden overflow-y-visible ${
    (!isVerified || !hasTakenAptitudeTest) ? 'blur-sm pointer-events-none opacity-40' : ''
  }`;

  // Winding learning path configuration for 7 Solar System Planets with balanced wide spacing
  const pathNodes = [
    { 
      id: "moon", 
      name: "The Moon", 
      subtitle: "Syntax, Basics", 
      description: "Welcome to NETStart! Learn the ropes and pack your gear to kick off an educational solar system adventure.",
      top: "14%", 
      left: "26%", 
      sizeClass: "w-40 h-40 sm:w-48 sm:h-48", 
      src: "/assets/planets/00_moon/environment/MainMoon.svg", 
      imgScale: 0.85, 
      rotationSpeed: 30, 
      reverse: true, 
      totalMissions: 3,
      languageBadge: { label: "Tutorial", color: "#ff912d" }
    },
    { 
      id: "mars", 
      name: "Mars", 
      subtitle: "Structure, Hyperlinks", 
      description: "The giant space signs have all gone completely blank! Team up with the locals to fix this planet.",
      top: "26%", 
      left: "74%", 
      sizeClass: "w-56 h-56 sm:w-64 sm:h-64", 
      src: "/assets/planets/celestial/Mars.svg", 
      imgScale: 0.86, 
      rotationSpeed: 20, 
      reverse: false, 
      totalMissions: 3,
      languageBadge: { iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg", label: "HTML5", color: "#E44D26" }
    },
    { 
      id: "venus", 
      name: "Venus", 
      subtitle: "Styling, Layout", 
      description: "Welcome to a world with absolutely no color! Grab your gear and help Professor Spectrum solve this black-and-white mystery.",
      top: "38%", 
      left: "25%", 
      sizeClass: "w-56 h-56 sm:w-64 sm:h-64", 
      src: "/assets/planets/celestial/Venus.svg", 
      imgScale: 0.86, 
      rotationSpeed: 25, 
      reverse: true, 
      totalMissions: 3,
      languageBadge: { iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg", label: "CSS", color: "#1572B6" }
    },
    { 
      id: "mercury", 
      name: "Mercury", 
      subtitle: "DOM, Events", 
      description: "Emergency at the biggest space supply center! Jump into action to save Professor Dominic's wilting plants and quiet delivery bays.",
      top: "50%", 
      left: "75%", 
      sizeClass: "w-48 h-48 sm:w-56 sm:h-56", 
      src: "/assets/planets/celestial/Mercury.svg", 
      imgScale: 0.86, 
      rotationSpeed: 35, 
      reverse: false, 
      totalMissions: 3,
      languageBadge: { iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg", label: "JavaScript", color: "#F7DF1E" }
    },
    { 
      id: "jupiter", 
      name: "Jupiter", 
      subtitle: "Exceptions, Classes", 
      description: "Access Denied! A giant space station has locked its heavy doors. Can you crack the code to slip past the grumpy security computer?",
      top: "62%", 
      left: "24%", 
      sizeClass: "w-76 h-76 sm:w-92 sm:h-92", 
      src: "/assets/planets/celestial/Jupiter.svg", 
      imgScale: 0.90, 
      rotationSpeed: 45, 
      reverse: false, 
      totalMissions: 3,
      languageBadge: { iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg", label: "Java", color: "#ED8B00", bgWhite: true }
    },
    { 
      id: "saturn", 
      name: "Saturn", 
      subtitle: "Loops, Pointers", 
      description: "Look up... why aren't the giant hoops spinning? Visit the famous ringworld and help an exhausted engineer figure out why everything froze.",
      top: "74%", 
      left: "76%", 
      sizeClass: "w-68 h-68 sm:w-80 sm:h-80", 
      src: "/assets/planets/celestial/Saturn.svg", 
      imgScale: 0.88, 
      rotationSpeed: 22, 
      reverse: true, 
      totalMissions: 3,
      languageBadge: { iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg", label: "C++", color: "#00599C" }
    },
    { 
      id: "earth", 
      name: "Earth (HQ)", 
      subtitle: "Dictionaries, Modules", 
      description: "The main computer at Headquarters is acting super silly by mixing up its words and numbers! Put on your detective hat to clean up this digital mess.",
      top: "86%", 
      left: "26%", 
      sizeClass: "w-56 h-56 sm:w-64 sm:h-64", 
      src: "/assets/planets/celestial/Earth.svg", 
      imgScale: 0.86, 
      rotationSpeed: 30, 
      reverse: false, 
      totalMissions: 3,
      languageBadge: { iconUrl: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg", label: "Python", color: "#22c55e", iconBg: "rgba(34, 197, 94, 0.22)" }
    }
  ];

  // Combine server completed missions with user-scoped storage
  const allCompletedMissions = useMemo(() => {
    const list: { missionId: string }[] = completedMissions.filter(m => !m.missionId.startsWith('daily-'));
    if (typeof window !== 'undefined' && userId) {
      try {
        const localList: string[] = JSON.parse(getUserStorageItem('completed_missions', userId) || '[]');
        localList.forEach(id => {
          if (!id.startsWith('daily-') && !list.some(m => m.missionId.toLowerCase() === id.toLowerCase())) {
            list.push({ missionId: id });
          }
        });
      } catch (e) {}
    }
    return list;
  }, [completedMissions, userId]);

  // Map user completed count per module
  const getCompletedMissionsCount = (moduleId: string) => {
    return allCompletedMissions.filter(m => {
      const id = m.missionId.toLowerCase();
      if (moduleId === 'moon') return id.startsWith('moon');
      if (moduleId === 'mars') return id.startsWith('mars') || id.startsWith('html');
      if (moduleId === 'venus') return id.startsWith('venus') || id.startsWith('css');
      if (moduleId === 'mercury') return id.startsWith('mercury') || id.startsWith('javascript') || id.startsWith('js');
      if (moduleId === 'jupiter') return id.startsWith('jupiter') || id.startsWith('java');
      if (moduleId === 'saturn') return id.startsWith('saturn') || id.startsWith('cpp');
      if (moduleId === 'earth') return id.startsWith('earth') || id.startsWith('python');
      return id.startsWith(moduleId.toLowerCase());
    }).length;
  };

  // Determine path completion indicators (3 levels per planet)
  const moonCompleted = getCompletedMissionsCount("moon") >= 3;
  const marsCompleted = getCompletedMissionsCount("mars") >= 3;
  const venusCompleted = getCompletedMissionsCount("venus") >= 3;
  const mercuryCompleted = getCompletedMissionsCount("mercury") >= 3;
  const jupiterCompleted = getCompletedMissionsCount("jupiter") >= 3;
  const saturnCompleted = getCompletedMissionsCount("saturn") >= 3;

  // Real unlocked index based on server completed missions
  let realUnlockedIndex = 0;
  if (saturnCompleted) realUnlockedIndex = 6;
  else if (jupiterCompleted) realUnlockedIndex = 5;
  else if (mercuryCompleted) realUnlockedIndex = 4;
  else if (venusCompleted) realUnlockedIndex = 3;
  else if (marsCompleted) realUnlockedIndex = 2;
  else if (moonCompleted) realUnlockedIndex = 1;
  else realUnlockedIndex = 0;

  // Travel animation state
  const [animState, setAnimState] = useState<{
    isAnimating: boolean;
    fromIndex: number;
    toIndex: number;
    progress: number;
    unlockedIndex: number;
  }>({
    isAnimating: false,
    fromIndex: 0,
    toIndex: 0,
    progress: 0,
    unlockedIndex: realUnlockedIndex,
  });

  // Sliding Planet Unlock Notification State
  const [unlockToast, setUnlockToast] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: string;
  } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate flight vector rotation angle in degrees
  const calculateFlightAngle = (x1: number, y1: number, x2: number, y2: number) => {
    const heightMultiplier = 2.4; // Screen aspect ratio factor for 370vh canvas
    const dx = x2 - x1;
    const dy = (y2 - y1) * heightMultiplier;
    const rad = Math.atan2(dy, dx);
    return (rad * 180) / Math.PI + 90; // +90 because rocket SVG tip points UP
  };

  // Start the one-time unskippable travel transition
  const startTravelAnimation = (fromIdx: number, toIdx: number) => {
    setAnimState({
      isAnimating: true,
      fromIndex: fromIdx,
      toIndex: toIdx,
      progress: 0,
      unlockedIndex: fromIdx, // Target planet remains locked during flight
    });

    const startTime = performance.now();
    const duration = 3400; // 3.4s cinematic flight

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(1, elapsed / duration);

      // Smooth cubic-bezier in-out easing
      const eased = rawProgress < 0.5
        ? 4 * rawProgress * rawProgress * rawProgress
        : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

      setAnimState(prev => ({
        ...prev,
        progress: eased,
      }));

      // Smooth scroll following the rocket in the container
      const fromTopPercent = parseFloat(pathNodes[fromIdx].top);
      const toTopPercent = parseFloat(pathNodes[toIdx].top);
      const currentTopPercent = fromTopPercent + (toTopPercent - fromTopPercent) * eased;

      const scrollContainer = document.getElementById('modules-scroll-container');
      if (scrollContainer) {
        const containerHeight = scrollContainer.scrollHeight;
        const targetScrollY = (currentTopPercent / 100) * containerHeight - (scrollContainer.clientHeight * 0.60);
        scrollContainer.scrollTo({
          top: Math.max(0, targetScrollY),
          behavior: 'auto'
        });
      }

      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Arrival and planet unlock!
        setAnimState({
          isAnimating: false,
          fromIndex: toIdx,
          toIndex: toIdx,
          progress: 1,
          unlockedIndex: toIdx,
        });

        try {
          if (userId) {
            setUserStorageItem('last_animated_planet_idx', toIdx.toString(), userId);
            setUserStorageItem('last_animated_planet', pathNodes[toIdx].id, userId);
          }
        } catch (e) {}

        // Trigger clean sliding toast notification upon arrival
        const targetNode = pathNodes[toIdx];
        if (targetNode) {
          setUnlockToast({
            visible: true,
            title: `${targetNode.name} Unlocked!`,
            message: 'New missions are now available.',
            icon: targetNode.src,
          });

          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          toastTimerRef.current = setTimeout(() => {
            setUnlockToast(prev => prev ? { ...prev, visible: false } : null);
          }, 5000);
        }
      }
    };

    requestAnimationFrame(animate);
  };

  // Smoothly travel camera focus to the current unlocked planet on page arrival
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Determine target index: active ongoing planet or currently unlocked planet
    const targetIdx = activePlanetId
      ? Math.max(0, pathNodes.findIndex(n => n.id === activePlanetId))
      : realUnlockedIndex;

    const targetNode = pathNodes[targetIdx] || pathNodes[0];

    // Wait a brief tick for DOM and canvas layout to mount, then center the camera lower on the planet
    const timer = setTimeout(() => {
      const scrollContainer = document.getElementById('modules-scroll-container');
      const planetEl = document.getElementById(`planet-node-${targetNode.id}`);

      if (scrollContainer && planetEl) {
        const elRect = planetEl.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        // Position planet center at ~60% down the viewport
        const targetScrollTop = scrollContainer.scrollTop + (elRect.top - containerRect.top) - (containerRect.height * 0.60) + (elRect.height / 2);
        
        scrollContainer.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [realUnlockedIndex, activePlanetId]);

  // Detect if an unlock animation needs to play (plays strictly once upon completing a planet)
  useEffect(() => {
    if (!userId) return;
    try {
      const storedIdxStr = getUserStorageItem('last_animated_planet_idx', userId);
      const unlockPending = getUserStorageItem('planet_unlock_pending', userId) === 'true';

      // If no unlock is pending from completing a planet's missions, do not animate
      if (!unlockPending) {
        setUserStorageItem('last_animated_planet_idx', realUnlockedIndex.toString(), userId);
        setAnimState(prev => ({ ...prev, unlockedIndex: realUnlockedIndex }));
        return;
      }

      // If an unlock IS pending, clear the flag immediately so it never plays again
      removeUserStorageItem('planet_unlock_pending', userId);

      let fromIdx = 0;
      if (storedIdxStr !== null) {
        const storedIdx = parseInt(storedIdxStr, 10);
        if (!isNaN(storedIdx) && storedIdx < realUnlockedIndex) {
          fromIdx = storedIdx;
        } else {
          fromIdx = Math.max(0, realUnlockedIndex - 1);
        }
      } else {
        fromIdx = Math.max(0, realUnlockedIndex - 1);
      }

      const timer = setTimeout(() => {
        startTravelAnimation(fromIdx, realUnlockedIndex);
      }, 600);
      return () => clearTimeout(timer);
    } catch (e) {
      console.warn("Error reading progression animation state:", e);
    }
  }, [realUnlockedIndex, userId]);

  const getStatusForModule = (id: string) => {
    const nodeIndex = pathNodes.findIndex(n => n.id === id);
    if (nodeIndex === -1) return 'LOCKED';

    if (nodeIndex < animState.unlockedIndex) return 'COMPLETED';
    if (nodeIndex === animState.unlockedIndex) return 'CURRENT';
    return 'LOCKED';
  };

  const totalCurriculumMissions = pathNodes.reduce((acc, n) => acc + n.totalMissions, 0);
  const completedCurriculumCount = pathNodes.reduce((sum, node) => sum + getCompletedMissionsCount(node.id), 0);

  // Active track node
  const currentTrackNode = pathNodes[animState.unlockedIndex] || pathNodes[0];

  return (
    <div ref={containerRef} className="relative w-full h-[370vh] min-h-[370vh] pb-96 mb-20 px-4">
      {/* Reveal Overlay (Only shown when coming from cutscene) */}
      {revealOverlay && (
        <div 
          className={`fixed inset-0 bg-black z-[9999] pointer-events-none transition-opacity duration-[3000ms] ease-in-out ${
            fadeOverlay ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      
      {/* Top Floating Pill-Shaped Telemetry Bar */}
      <div className="sticky top-4 z-40 w-full max-w-[98%] sm:max-w-[96%] mx-auto my-3 bg-[#130927]/95 backdrop-blur-xl border border-[#ff912d]/40 rounded-full px-6 sm:px-8 py-3 shadow-[0_0_35px_rgba(0,0,0,0.7),0_0_20px_rgba(255,145,45,0.25)] flex flex-wrap items-center justify-between gap-4 transition-all">
        
        {/* Left: Current Active Unlocked Node Info */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-full bg-[#ff912d]/15 border border-[#ff912d]/40 text-[#ff912d] shadow-[0_0_12px_rgba(255,145,45,0.35)]">
            <Rocket size={20} />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-mono font-black text-[#ff912d] uppercase tracking-wider">
              [MISSION TRACK]
            </div>
            <div className="text-sm sm:text-base font-black text-white font-display uppercase tracking-wide">
              {currentTrackNode.name} {currentTrackNode.subtitle ? `• ${currentTrackNode.subtitle}` : ''}
            </div>
          </div>
        </div>

        {/* Center/Right: Telemetry Metrics Chips (EXP Threshold Bar, Gears, Missions) */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Level & EXP Threshold Progress Bar Pill */}
          <div className="flex items-center gap-3.5 bg-black/60 border border-white/15 px-4 py-1.5 rounded-full shadow-inner">
            <div className="flex items-center gap-2.5 text-amber-400 font-mono font-extrabold text-sm sm:text-[15px] shrink-0 pl-1">
              <Zap size={16} className="fill-amber-400" />
              <span>LVL {liveStats.level}</span>
            </div>

            {/* EXP Threshold Visual Progress Fill */}
            <div className="flex flex-col gap-1 w-28 sm:w-36">
              <div className="flex justify-between items-center text-xs font-mono text-gray-300 font-bold leading-none">
                <span className="text-amber-400 font-black">
                  {liveStats.isMaxLevel ? `${liveStats.xp} XP` : `${(liveStats as any).levelCurrentXp ?? 0} XP`}
                </span>
                <span className="text-gray-400 font-medium">
                  {liveStats.isMaxLevel ? "MAX" : `${(liveStats as any).levelRequiredXp ?? 500} XP`}
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-[#ff912d] to-amber-300 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,145,45,0.7)]"
                  style={{ width: `${Math.min(100, Math.max(0, liveStats.progress))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Gears Currency Badge Pill */}
          <div className="flex items-center gap-2 bg-[#ff912d]/15 border border-[#ff912d]/40 px-4 py-1.5 rounded-full shadow-[0_0_12px_rgba(255,145,45,0.15)]">
            <Settings size={17} className="text-[#ff912d]" />
            <span className="font-mono text-sm sm:text-[15px] text-[#ff912d] font-extrabold tracking-wide">
              {liveStats.gears} GEARS
            </span>
          </div>

          {/* Completed Missions Counter Badge Pill */}
          <div className="flex items-center gap-2 bg-purple-500/15 border border-purple-500/40 px-4 py-1.5 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <Award size={17} className="text-purple-400" />
            <span className="font-mono text-sm sm:text-[15px] text-purple-300 font-extrabold tracking-wide">
              {completedCurriculumCount} / {totalCurriculumMissions} MISSIONS
            </span>
          </div>

        </div>

      </div>

      {/* Sliding Planet Unlock Notification Toast */}
      <div 
        className={`fixed top-24 right-6 z-50 max-w-sm w-full transition-all duration-500 ease-out transform ${
          unlockToast?.visible 
            ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto' 
            : '-translate-y-10 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="bg-[#1a082c]/95 backdrop-blur-xl border border-[#ff912d]/50 rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.6),0_0_25px_rgba(255,145,45,0.25)] flex items-center gap-3.5 relative overflow-hidden">
          {/* Ambient top glow accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff912d] to-transparent opacity-80" />
          
          {unlockToast?.icon ? (
            <img 
              src={unlockToast.icon} 
              alt={unlockToast.title} 
              className="w-11 h-11 object-contain drop-shadow-[0_0_10px_rgba(255,145,45,0.5)] shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#ff912d]/20 border border-[#ff912d]/40 flex items-center justify-center shrink-0">
              <Rocket size={20} className="text-[#ff912d]" />
            </div>
          )}

          <div className="flex flex-col flex-1 min-w-0 pr-2">
            <span className="font-display font-black text-white text-sm uppercase tracking-wider truncate">
              {unlockToast?.title}
            </span>
            <span className="font-sans text-xs text-gray-300 font-medium truncate">
              {unlockToast?.message}
            </span>
          </div>

          <button
            onClick={() => setUnlockToast(prev => prev ? { ...prev, visible: false } : null)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Background Mission Orbit Canvas */}
      <div className={containerClass}>
        
        {/* Ambient Space Starfield Background Image & Nebula Layer */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-45 bg-cover bg-center" 
          style={{ backgroundImage: "url('/assets/global/ui/Landing Page BG.png')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#180729]/60 via-transparent to-[#180729]/80 pointer-events-none z-0" />

        {/* Constellation Orbit Lines SVG Connecting All 7 Planets */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          {pathSegments.map((seg, idx) => {
            const isFullyLit = idx < animState.unlockedIndex;
            const isActivelyAnimating = animState.isAnimating && idx === animState.fromIndex;

            if (isFullyLit) {
              // Permanently lit solid glowing path for all traversed segments
              return (
                <g key={`seg-${idx}`}>
                  {/* Outer glow stroke */}
                  <line
                    x1={`${seg.x1}%`}
                    y1={`${seg.y1}%`}
                    x2={`${seg.x2}%`}
                    y2={`${seg.y2}%`}
                    stroke="rgba(255, 145, 45, 0.4)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="blur-xs"
                  />
                  {/* Inner solid neon stroke */}
                  <line
                    x1={`${seg.x1}%`}
                    y1={`${seg.y1}%`}
                    x2={`${seg.x2}%`}
                    y2={`${seg.y2}%`}
                    stroke="#ff912d"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </g>
              );
            }

            if (isActivelyAnimating) {
              // Active segment: dashed background + progressive neon path drawn behind rocket
              const curX = seg.x1 + (seg.x2 - seg.x1) * animState.progress;
              const curY = seg.y1 + (seg.y2 - seg.y1) * animState.progress;

              return (
                <g key={`seg-${idx}`}>
                  {/* Background dashed line */}
                  <line
                    x1={`${seg.x1}%`}
                    y1={`${seg.y1}%`}
                    x2={`${seg.x2}%`}
                    y2={`${seg.y2}%`}
                    stroke="rgba(255, 145, 45, 0.45)"
                    strokeWidth="3"
                    strokeDasharray="8 8"
                  />
                  {/* Progressive glowing trail lighting up behind the rocket */}
                  <line
                    x1={`${seg.x1}%`}
                    y1={`${seg.y1}%`}
                    x2={`${curX}%`}
                    y2={`${curY}%`}
                    stroke="rgba(255, 145, 45, 0.5)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="blur-xs"
                  />
                  <line
                    x1={`${seg.x1}%`}
                    y1={`${seg.y1}%`}
                    x2={`${curX}%`}
                    y2={`${curY}%`}
                    stroke="#ff912d"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </g>
              );
            }

            // Inactive future dashed line
            return (
              <line
                key={`seg-${idx}`}
                x1={`${seg.x1}%`}
                y1={`${seg.y1}%`}
                x2={`${seg.x2}%`}
                y2={`${seg.y2}%`}
                stroke="rgba(255, 145, 45, 0.45)"
                strokeWidth="3"
                strokeDasharray="8 8"
              />
            );
          })}
        </svg>

        {/* Traveling Checkpoint Rocket during transition animation */}
        {animState.isAnimating && (() => {
          const fromNode = pathNodes[animState.fromIndex];
          const toNode = pathNodes[animState.toIndex];
          const x1 = parseFloat(fromNode.left);
          const y1 = parseFloat(fromNode.top);
          const x2 = parseFloat(toNode.left);
          const y2 = parseFloat(toNode.top);

          const curX = x1 + (x2 - x1) * animState.progress;
          const curY = y1 + (y2 - y1) * animState.progress;

          const flightAngle = calculateFlightAngle(x1, y1, x2, y2);

          // Rotate dynamically to flight angle during travel and return upright on arrival
          let rot = 0;
          if (animState.progress < 0.12) {
            rot = (animState.progress / 0.12) * flightAngle;
          } else if (animState.progress > 0.88) {
            rot = flightAngle * (1 - (animState.progress - 0.88) / 0.12);
          } else {
            rot = flightAngle;
          }

          return (
            <div
              className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{
                left: `${curX}%`,
                top: `${curY}%`,
              }}
            >
              <div
                style={{
                  transform: `rotate(${rot}deg)`,
                }}
                className="relative flex flex-col items-center"
              >
                {/* Thruster Flame VFX */}
                {animState.progress > 0.04 && animState.progress < 0.96 && (
                  <div className="absolute -bottom-8 w-6 h-16 bg-gradient-to-t from-transparent via-orange-500 to-amber-300 rounded-full blur-xs animate-pulse opacity-95" />
                )}

                <img
                  src="/assets/global/ui/Checkpoint.svg?v=rocket-v3"
                  alt="Traveling Checkpoint Rocket"
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_25px_rgba(255,145,45,0.95)] drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
                />
              </div>
            </div>
          );
        })()}

        {/* Render Planet Nodes dynamically */}
        {pathNodes.map((node) => {
          const completedCount = getCompletedMissionsCount(node.id);
          const status = getStatusForModule(node.id);
          const isCheckpointPlanet = !animState.isAnimating && node.id === pathNodes[animState.unlockedIndex]?.id;
          
          return (
            <PlanetNode 
              key={node.id}
              id={node.id} 
              name={node.name} 
              subtitle={node.subtitle}
              description={node.description}
              top={node.top} 
              left={node.left} 
              sizeClass={node.sizeClass} 
              src={node.src} 
              imgScale={node.imgScale} 
              rotationSpeed={node.rotationSpeed} 
              reverse={node.reverse} 
              status={status}
              completedCount={completedCount}
              totalCount={node.totalMissions}
              languageBadge={node.languageBadge}
              hasCheckpoint={isCheckpointPlanet}
            />
          );
        })}

      </div>

      {/* Condition 1: Email Verification Gate Modal */}
      {!isVerified && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e0a2d]/90 backdrop-blur-xl border border-[#ff912d]/30 p-8 sm:p-10 rounded-3xl max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-[#ff912d]/10 rounded-full flex items-center justify-center border border-[#ff912d]/20">
              <Lock className="w-10 h-10 text-[#ff912d]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Access Locked</h2>
              <p className="text-gray-300 text-sm">
                You must verify your email address to embark on missions and access learning modules.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="mt-2 w-full py-3.5 bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Rocket size={18} />
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Condition 2: Aptitude Diagnostic Required Gate Modal */}
      {isVerified && !hasTakenAptitudeTest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-[#1e0a2d]/95 backdrop-blur-xl border-2 border-[#ff912d]/60 p-8 sm:p-12 rounded-3xl max-w-xl sm:max-w-2xl w-full text-center shadow-[0_0_50px_rgba(255,145,45,0.35)] flex flex-col items-center gap-6 relative overflow-hidden">
            
            <div className="w-20 h-20 bg-[#ff912d]/15 rounded-full flex items-center justify-center border-2 border-[#ff912d]/40 shadow-[0_0_25px_rgba(255,145,45,0.4)] animate-pulse">
              <Brain className="w-10 h-10 text-[#ff912d]" />
            </div>

            <div className="space-y-3 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#ff912d]/10 border border-[#ff912d]/30 text-[#ff912d] font-mono text-xs font-bold uppercase tracking-wider">
                Diagnostic Pending
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-wider">
                Aptitude Diagnostic Required
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Complete your initial Aptitude Diagnostic to calibrate your skill baseline and unlock the mission sectors.
              </p>
            </div>

            <Link
              href="/aptitude-test?openModal=true"
              className="mt-2 w-full max-w-md py-4 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,145,45,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Brain size={18} />
              Take Assessment Now
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
