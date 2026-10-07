"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toPng } from 'html-to-image';
import { createPortal } from 'react-dom';
import { Lock, Maximize2, X, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import HexagonStatsWeb from './HexagonStatsWeb';
import AvatarDisplay, { AvatarLayers, DEFAULT_AVATAR_LAYERS } from './AvatarDisplay';
import { getUserStorageItem, setUserStorageItem } from '@/lib/userStorage';
import { triggerDailyTaskCompletion } from '@/lib/dailyTasks';

interface PassportStatsCardProps {
  profile: any;
  completedMissionIds: string[];
  avatarLayers?: AvatarLayers;
}

export default function PassportStatsCard({ profile, completedMissionIds, avatarLayers }: PassportStatsCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadToast, setDownloadToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const userId = profile?.id || (session?.user as any)?.id;
  const [layers, setLayers] = useState<AvatarLayers>(avatarLayers || DEFAULT_AVATAR_LAYERS);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!downloadToast) return;
    const timer = setTimeout(() => {
      setDownloadToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [downloadToast]);

  useEffect(() => {
    if (!isZoomed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  // Sync customized avatar layers on mount and listen to cross-component updates
  useEffect(() => {
    if (avatarLayers) {
      setLayers(avatarLayers);
      return;
    }

    if (typeof window !== 'undefined' && userId) {
      try {
        const cached = getUserStorageItem('avatar_layers', userId);
        if (cached) {
          setLayers(JSON.parse(cached));
        }
      } catch { }
    }

    let isMounted = true;
    async function fetchLayers() {
      try {
        const res = await fetch(`/api/avatar?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.layers) {
            setLayers(data.layers);
            if (typeof window !== 'undefined' && userId) {
              setUserStorageItem('avatar_layers', JSON.stringify(data.layers), userId);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch avatar layers:', err);
      }
    }

    fetchLayers();

    const handleAvatarUpdate = (e: any) => {
      if (e.detail) {
        setLayers(e.detail);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('netstart_avatar_updated', handleAvatarUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('netstart_avatar_updated', handleAvatarUpdate);
      }
    };
  }, [userId, avatarLayers]);

  // Helper to count unique completed levels (1, 2, 3) for each celestial body
  const getPlanetCompletedCount = (planetKey: string): number => {
    const levels = new Set<number>();
    completedMissionIds.forEach(rawId => {
      const id = (rawId || '').toLowerCase().trim();
      if (planetKey === 'moon') {
        if (id === 'moon-1' || id === '1' || id === 'level-1') levels.add(1);
        if (id === 'moon-2' || id === '2' || id === 'level-2') levels.add(2);
        if (id === 'moon-3' || id === '3' || id === 'level-3') levels.add(3);
      } else if (planetKey === 'mars') {
        if (id === 'mars-1' || id === 'html-1' || id === 'html-1-mars') levels.add(1);
        if (id === 'mars-2' || id === 'html-2' || id === 'html-2-mars') levels.add(2);
        if (id === 'mars-3' || id === 'html-3' || id === 'html-3-mars') levels.add(3);
      } else if (planetKey === 'venus') {
        if (id === 'venus-1' || id === 'css-1' || id === 'css-1-venus') levels.add(1);
        if (id === 'venus-2' || id === 'css-2' || id === 'css-2-venus') levels.add(2);
        if (id === 'venus-3' || id === 'css-3' || id === 'css-3-venus') levels.add(3);
      } else if (planetKey === 'mercury') {
        if (id === 'mercury-1' || id === 'js-1' || id === 'javascript-1' || id === 'js-1-mercury') levels.add(1);
        if (id === 'mercury-2' || id === 'js-2' || id === 'javascript-2' || id === 'js-2-mercury') levels.add(2);
        if (id === 'mercury-3' || id === 'js-3' || id === 'javascript-3' || id === 'js-3-mercury') levels.add(3);
      } else if (planetKey === 'jupiter') {
        if (id === 'jupiter-1' || id === 'java-1') levels.add(1);
        if (id === 'jupiter-2' || id === 'java-2') levels.add(2);
        if (id === 'jupiter-3' || id === 'java-3') levels.add(3);
      } else if (planetKey === 'saturn') {
        if (id === 'saturn-1' || id === 'cpp-1') levels.add(1);
        if (id === 'saturn-2' || id === 'cpp-2') levels.add(2);
        if (id === 'saturn-3' || id === 'cpp-3') levels.add(3);
      } else if (planetKey === 'earth') {
        if (id === 'earth-1' || id === 'python-1') levels.add(1);
        if (id === 'earth-2' || id === 'python-2') levels.add(2);
        if (id === 'earth-3' || id === 'python-3') levels.add(3);
      }
    });
    return levels.size;
  };

  const moonCompleted = getPlanetCompletedCount('moon');
  const marsCompleted = getPlanetCompletedCount('mars');
  const venusCompleted = getPlanetCompletedCount('venus');
  const mercuryCompleted = getPlanetCompletedCount('mercury');
  const jupiterCompleted = getPlanetCompletedCount('jupiter');
  const saturnCompleted = getPlanetCompletedCount('saturn');
  const earthCompleted = getPlanetCompletedCount('earth');

  // Aptitude & Cognitive Metrics Integration
  const hasAptitudeTest = Boolean(profile?.hasTakenAptitudeTest);
  const baseLogic = profile?.logicScore ?? 0;
  const basePattern = profile?.patternRecognitionScore ?? 0;
  const baseDecomp = profile?.taskDecompositionScore ?? 0;

  // Practical mission applied experience bonus (adds realistic progression as students explore)
  const missionBonus = Math.min(20, completedMissionIds.length * 2);

  // If test has been taken, use calibrated score + mission application bonus
  // If not taken yet, derive a provisional score based on mission completions
  const logicPercent = hasAptitudeTest
    ? Math.min(100, Math.max(0, baseLogic + Math.round(missionBonus * 0.4)))
    : Math.min(60, completedMissionIds.length * 4);

  const patternPercent = hasAptitudeTest
    ? Math.min(100, Math.max(0, basePattern + Math.round(missionBonus * 0.4)))
    : Math.min(60, completedMissionIds.length * 4);

  const decompPercent = hasAptitudeTest
    ? Math.min(100, Math.max(0, baseDecomp + Math.round(missionBonus * 0.4)))
    : Math.min(60, completedMissionIds.length * 4);

  const overallPercent = Math.min(100, Math.round((logicPercent + patternPercent + decompPercent) / 3));

  // Synthesized computational dimensions for the 6-axis cognitive radar web
  const algoPercent = Math.min(100, Math.round((logicPercent * 0.55) + (patternPercent * 0.45)));
  const syntaxPercent = Math.min(100, Math.round((decompPercent * 0.5) + (logicPercent * 0.5)));
  const analysisPercent = Math.min(100, Math.round((patternPercent * 0.55) + (decompPercent * 0.45)));

  // Radar chart data mapping (6 Cognitive & Computational Thinking axes)
  const radarData = [
    { subject: 'LOG', A: logicPercent, fullMark: 100 },
    { subject: 'PAT', A: patternPercent, fullMark: 100 },
    { subject: 'DEC', A: decompPercent, fullMark: 100 },
    { subject: 'ALG', A: algoPercent, fullMark: 100 },
    { subject: 'SYN', A: syntaxPercent, fullMark: 100 },
    { subject: 'ANA', A: analysisPercent, fullMark: 100 },
  ];

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : 'UNKNOWN';

  // 6 Celestial programming planets in student progression order
  const planets = [
    {
      id: 'mars',
      name: 'Mars',
      track: 'HTML',
      src: '/assets/planets/celestial/Mars.svg',
      completedCount: marsCompleted,
      isCompleted: marsCompleted >= 3,
      isUnlocked: true,
      badgeColor: '#E44D26',
    },
    {
      id: 'venus',
      name: 'Venus',
      track: 'CSS',
      src: '/assets/planets/celestial/Venus.svg',
      completedCount: venusCompleted,
      isCompleted: venusCompleted >= 3,
      isUnlocked: marsCompleted >= 3 || venusCompleted > 0,
      badgeColor: '#1572B6',
    },
    {
      id: 'mercury',
      name: 'Mercury',
      track: 'JavaScript',
      src: '/assets/planets/celestial/Mercury.svg',
      completedCount: mercuryCompleted,
      isCompleted: mercuryCompleted >= 3,
      isUnlocked: venusCompleted >= 3 || mercuryCompleted > 0,
      badgeColor: '#F7DF1E',
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      track: 'Java',
      src: '/assets/planets/celestial/Jupiter.svg',
      completedCount: jupiterCompleted,
      isCompleted: jupiterCompleted >= 3,
      isUnlocked: mercuryCompleted >= 3 || jupiterCompleted > 0,
      badgeColor: '#ED8B00',
    },
    {
      id: 'saturn',
      name: 'Saturn',
      track: 'C++',
      src: '/assets/planets/celestial/Saturn.svg',
      completedCount: saturnCompleted,
      isCompleted: saturnCompleted >= 3,
      isUnlocked: jupiterCompleted >= 3 || saturnCompleted > 0,
      badgeColor: '#00599C',
    },
    {
      id: 'earth',
      name: 'Earth',
      track: 'Python',
      src: '/assets/planets/celestial/Earth.svg',
      completedCount: earthCompleted,
      isCompleted: earthCompleted >= 3,
      isUnlocked: saturnCompleted >= 3 || earthCompleted > 0,
      badgeColor: '#4B8BBE',
    },
  ];

  const completedPlanetsCount = planets.filter(p => p.isCompleted).length;
  const totalCompletedMissions = marsCompleted + venusCompleted + mercuryCompleted + jupiterCompleted + saturnCompleted + earthCompleted;
  const activePlanetIndex = planets.findIndex(p => p.isUnlocked && !p.isCompleted);
  const activePlanet = activePlanetIndex !== -1 ? planets[activePlanetIndex] : null;

  const handleDownload = async () => {
    const card = cardRef.current;
    if (!card) return;

    setIsDownloading(true);
    try {
      let dataUrl: string;
      try {
        dataUrl = await toPng(card, {
          quality: 0.95,
          pixelRatio: 2,
          skipFonts: true,
          cacheBust: false,
        });
      } catch (firstErr) {
        console.warn('High-res render failed, retrying at standard resolution:', firstErr);
        dataUrl = await toPng(card, {
          quality: 0.95,
          pixelRatio: 1,
          skipFonts: true,
          cacheBust: false,
        });
      }

      const playerName = (profile?.displayName || profile?.name || 'explorer')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_');
      const link = document.createElement('a');
      link.download = `passport-stats-${playerName}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadToast({
        type: 'success',
        message: 'Passport statistics card saved successfully!',
      });
    } catch (err: any) {
      console.error('Failed to generate passport stats card image:', err);
      setDownloadToast({
        type: 'error',
        message: 'Failed to export image. Please try again.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const renderCard = (hideDetails: boolean, isModal: boolean) => (
    <div
      className={`relative z-10 w-full h-full flex flex-col rounded-3xl overflow-hidden bg-[#1e0a2d] bg-[length:100%_100%] bg-center border-2 border-[#ff912d] ${!isModal ? 'shadow-2xl transition-all duration-300' : ''}`}
      style={{ backgroundImage: "url('/PASSPORT%20DESIGN.webp')" }}
      ref={isModal ? cardRef : undefined}
    >
      {/* View / Enlarge Passport Action Button (Only on non-modal embedded card) */}
      {!isModal && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(true);
            triggerDailyTaskCompletion('task-achieve-1');
          }}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-30 p-2 sm:p-2.5 rounded-xl bg-black/70 hover:bg-[#ff912d] text-white/80 hover:text-black border border-[#ff912d]/50 shadow-lg hover:shadow-[0_0_15px_rgba(255,145,45,0.4)] transition-all duration-200 cursor-pointer active:scale-95 group/view-btn"
          title="View Passport & Stats"
          aria-label="View Passport & Stats"
        >
          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover/view-btn:scale-110" />
        </button>
      )}

      <div className="p-3 sm:p-3.5 lg:p-4 pb-2 sm:pb-2.5 lg:pb-3 flex-1 flex flex-col justify-between relative z-10 bg-black/15">

        {/* Top Section */}
        <div className="flex gap-2 sm:gap-2.5 lg:gap-3 items-center mt-2 sm:mt-2.5 lg:mt-3">

          {/* Left: Avatar Box showing student's customized avatar */}
          <div className="w-[108px] h-[138px] sm:w-[122px] sm:h-[152px] lg:w-[136px] lg:h-[166px] shrink-0 border-2 border-[#ff912d] shadow-[0_0_18px_rgba(255,145,45,0.45)] rounded-2xl bg-gradient-to-b from-[#240c3a]/95 via-[#130522]/95 to-[#080210] relative flex flex-col items-center justify-between overflow-hidden p-1.5">
            {/* Ambient cybernetic grid and radial spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,145,45,0.25),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none opacity-40" />

            {/* Futuristic HUD Corner Accents */}
            <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#ff912d]/70 pointer-events-none z-20" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#ff912d]/70 pointer-events-none z-20" />

            {/* Scaled Avatar Character Wrapper */}
            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-0.5">
              <AvatarDisplay
                layers={layers}
                className="w-full h-full"
                scale={1.20}
                showShadow={false}
                offsetYClass="translate-y-1.5 sm:translate-y-2"
              />
            </div>

            {/* Pilot Name Tag Footer */}
            <div className="w-full py-0.5 sm:py-1 bg-black/80 backdrop-blur-md rounded-lg text-center z-20 border border-[#ff912d]/30 shadow-md">
              <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-white uppercase tracking-wider block truncate px-1 drop-shadow">
                {profile?.displayName || profile?.name || 'EXPLORER'}
              </span>
            </div>
          </div>

          {/* Middle: Details & Proficiency Bars */}
          <div className={`shrink-0 flex flex-col pt-0.5 justify-center ${!hideDetails ? 'flex-1 min-w-0 mt-2 lg:mt-4' : ''}`}>

            {/* User Details (Modal view) */}
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

            {/* Cognitive Aptitude Bars */}
            <div className={`flex flex-col gap-2 sm:gap-2.5 ${!hideDetails ? 'mt-4 lg:mt-5' : ''} ${isModal ? 'max-w-[320px] sm:max-w-[360px] lg:max-w-[420px]' : ''}`}>
              <div className="text-[#ff912d] font-sans font-bold text-[9px] sm:text-[10px] tracking-widest uppercase mb-0.5 drop-shadow-md">
                Cognitive Aptitude
              </div>

              {/* Logic Bar */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-[88px] sm:w-[94px] lg:w-[96px] shrink-0 text-white/90 font-mono text-[9px] sm:text-[9.5px] lg:text-[10px] tracking-normal uppercase drop-shadow-md whitespace-nowrap">Logic</div>
                <div className="text-white/50 text-xs mr-0.5 drop-shadow-md">:</div>
                <div className="w-[120px] sm:w-[138px] lg:w-[150px] shrink-0 flex h-[13px] sm:h-[14px] gap-1 border border-[#ff912d]/60 p-0.5 bg-black/40 rounded-sm">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${i < (logicPercent / 10) ? 'bg-[#00ffcc] shadow-[0_0_5px_rgba(0,255,204,0.6)]' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>

              {/* Pattern Recognition Bar */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-[88px] sm:w-[94px] lg:w-[96px] shrink-0 text-white/90 font-mono text-[9px] sm:text-[9.5px] lg:text-[10px] tracking-normal uppercase drop-shadow-md whitespace-nowrap">Pattern</div>
                <div className="text-white/50 text-xs mr-0.5 drop-shadow-md">:</div>
                <div className="w-[120px] sm:w-[138px] lg:w-[150px] shrink-0 flex h-[13px] sm:h-[14px] gap-1 border border-[#ff912d]/60 p-0.5 bg-black/40 rounded-sm">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${i < (patternPercent / 10) ? 'bg-[#ff00ff] shadow-[0_0_5px_rgba(255,0,255,0.6)]' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>

              {/* Task Decomposition Bar */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-[88px] sm:w-[94px] lg:w-[96px] shrink-0 text-white/90 font-mono text-[9px] sm:text-[9.5px] lg:text-[10px] tracking-normal uppercase drop-shadow-md whitespace-nowrap">Decomposition</div>
                <div className="text-white/50 text-xs mr-0.5 drop-shadow-md">:</div>
                <div className="w-[120px] sm:w-[138px] lg:w-[150px] shrink-0 flex h-[13px] sm:h-[14px] gap-1 border border-[#ff912d]/60 p-0.5 bg-black/40 rounded-sm">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${i < (decompPercent / 10) ? 'bg-[#00ffff] shadow-[0_0_5px_rgba(0,255,255,0.6)]' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>

              {/* Overall Cognitive Readiness Bar */}
              <div className="flex items-center gap-1.5">
                <div className="w-[88px] sm:w-[94px] lg:w-[96px] shrink-0 text-white/90 font-mono text-[9px] sm:text-[9.5px] lg:text-[10px] tracking-normal uppercase drop-shadow-md whitespace-nowrap">Overall</div>
                <div className="text-white/50 text-xs mr-0.5 drop-shadow-md">:</div>
                <div className="w-[120px] sm:w-[138px] lg:w-[150px] shrink-0 flex h-[13px] sm:h-[14px] gap-1 border border-[#ff912d]/60 p-0.5 bg-black/40 rounded-sm">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${i < (overallPercent / 10) ? 'bg-[#ff912d] shadow-[0_0_5px_rgba(255,145,45,0.6)]' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Hexagon Web */}
          <div className={`ml-auto shrink-0 flex items-center justify-center ${isModal
              ? 'w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] lg:w-[360px] lg:h-[360px]'
              : 'w-[155px] h-[155px] sm:w-[175px] sm:h-[175px] lg:w-[195px] lg:h-[195px]'
            }`}>
            <HexagonStatsWeb data={radarData} outerRadius={isModal ? "75%" : "65%"} />
          </div>

        </div>

        {/* Bottom Section: Intuitive Planet Journey Progression */}
        <div className="mt-1.5 sm:mt-2 lg:mt-2.5 mb-1 sm:mb-1.5 lg:mb-2">

          {/* Flight Log Header */}
          <div className="flex items-center border-b border-[#ff912d]/25 pb-1 mb-2 sm:mb-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff912d] animate-ping" />
              <span className="text-[#ff912d] font-sans font-bold text-[9px] sm:text-[10px] lg:text-[11px] tracking-[0.2em] uppercase drop-shadow">
                EXPEDITION FLIGHT LOG
              </span>
            </div>
          </div>

          {/* Connected Celestial Progression Track */}
          <div className="relative px-2 sm:px-4 flex justify-between items-center min-h-[58px] sm:min-h-[64px]">

            {/* Background trajectory baseline */}
            <div className="absolute top-[18px] sm:top-[20px] lg:top-[24px] left-6 right-6 h-[2px] -translate-y-1/2 z-0 bg-white/10 rounded-full" />

            {/* Glowing active flight beam up to current active frontier */}
            <div
              className="absolute top-[18px] sm:top-[20px] lg:top-[24px] left-6 h-[2px] -translate-y-1/2 z-0 bg-gradient-to-r from-[#ff912d] via-[#00ffcc] to-[#ff912d] shadow-[0_0_8px_rgba(255,145,45,0.85)] transition-all duration-700 ease-out rounded-full"
              style={{
                width: completedPlanetsCount === planets.length
                  ? 'calc(100% - 48px)'
                  : activePlanetIndex > 0
                    ? `calc(${Math.min(96, (activePlanetIndex / (planets.length - 1)) * 100)}% - 24px)`
                    : '20px'
              }}
            />

            {planets.map((planet) => {
              const isCompleted = planet.isCompleted;
              const isActive = planet.id === activePlanet?.id;
              const isLocked = !planet.isUnlocked;

              return (
                <div key={planet.id} className="relative z-10 flex flex-col items-center group">

                  {/* Floating sector card tooltip on hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 whitespace-nowrap bg-black/95 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#ff912d]/50 shadow-2xl text-center">
                    <div className="text-[9px] font-bold text-white flex items-center gap-1 justify-center">
                      <span>{planet.name}</span>
                      <span className="text-[#ff912d]">({planet.track})</span>
                    </div>
                    <div className="text-[8px] font-mono text-white/70">
                      {isCompleted ? '✓ Cleared • 3/3 Missions' : isLocked ? 'Locked • Complete Previous Sector' : `${planet.completedCount}/3 Missions Completed`}
                    </div>
                  </div>

                  {/* Planet Celestial Node with Real SVG - Fully Opaque (non-transparent) */}
                  <div
                    className={`relative w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isCompleted
                        ? 'drop-shadow-[0_0_10px_rgba(0,255,180,0.8)]'
                        : isActive
                          ? 'scale-105 drop-shadow-[0_0_12px_rgba(255,145,45,0.7)] ring-2 ring-[#ff912d] ring-offset-2 ring-offset-[#1e0a2d]'
                          : 'grayscale contrast-90 brightness-75 group-hover:grayscale-0 group-hover:brightness-100'
                      }`}
                  >
                    {/* Subtle, non-exaggerated outer active beacon border for current planet */}
                    {isActive && (
                      <span className="absolute -inset-1 rounded-full border border-[#ff912d]/40 pointer-events-none" />
                    )}

                    <img
                      src={planet.src}
                      alt={planet.name}
                      className="w-full h-full object-contain pointer-events-none select-none opacity-100"
                    />

                    {/* Status Badge overlay at bottom-right corner of planet */}
                    {isCompleted ? (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-[#1e0a2d] flex items-center justify-center shadow-[0_0_8px_#10b981] z-20">
                        <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : isActive ? (
                      <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-[#ff912d] border border-white/40 flex items-center justify-center shadow-[0_0_6px_#ff912d] z-20 font-mono font-black text-[7px] sm:text-[7.5px] text-black">
                        {planet.completedCount}/3
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-black/80 border border-white/20 flex items-center justify-center z-20">
                        <Lock className="w-2 h-2 text-white/60" />
                      </div>
                    )}
                  </div>

                  {/* Planet Name & Tech Badge */}
                  <div className="flex flex-col items-center mt-0.5 min-w-0">
                    <span className={`font-sans font-bold text-[8px] sm:text-[9px] lg:text-[10px] tracking-wider uppercase truncate drop-shadow-md ${isCompleted ? 'text-white' : isActive ? 'text-[#ff912d]' : 'text-white/60'
                      }`}>
                      {planet.name}
                    </span>
                    <span className={`font-mono text-[6px] sm:text-[7px] lg:text-[7.5px] uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap leading-tight ${isCompleted
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                        : isActive
                          ? 'bg-[#ff912d]/25 text-[#ff912d] border border-[#ff912d]/50 font-bold'
                          : 'bg-black/40 text-white/50 border border-white/10'
                      }`}>
                      {planet.track}
                    </span>

                    {/* 3 Micro-Dots representing the 3 Missions */}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3].map(mIndex => (
                        <div
                          key={mIndex}
                          className={`w-1 h-1 rounded-full transition-all ${mIndex <= planet.completedCount
                              ? 'bg-[#ff912d] shadow-[0_0_4px_#ff912d]'
                              : 'bg-white/15'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
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

      {/* Modal Overlay rendered via Portal to prevent header/stacking context overlap */}
      {isZoomed && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          {/* Close button at top-right for convenience */}
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-50 border border-white/10"
            title="Close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Modal Card Content Container */}
          <div
            className="relative w-full max-w-4xl aspect-[16/9] max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            {renderCard(false, true)}
          </div>

          <div className="mt-6 sm:mt-8 flex gap-4 animate-in slide-in-from-bottom-4 duration-300 z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              disabled={isDownloading}
              className="px-6 py-2.5 bg-[#ff912d] hover:bg-[#ff912d]/90 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(255,145,45,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Generating...' : 'Download PNG'}
            </button>
            <button
              onClick={() => setIsZoomed(false)}
              className="px-6 py-2.5 bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/20 transition-all cursor-pointer active:scale-95 border border-white/10"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Custom UI Toast Notification (Success / Error) */}
      {mounted && downloadToast && createPortal(
        <div
          className="fixed bottom-6 right-6 z-[100000] flex items-center gap-3 px-5 py-3.5 rounded-2xl backdrop-blur-xl shadow-2xl border transition-all animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-md pointer-events-auto"
          style={{
            backgroundColor: downloadToast.type === 'success' ? 'rgba(5, 38, 24, 0.96)' : 'rgba(40, 10, 16, 0.96)',
            borderColor: downloadToast.type === 'success' ? 'rgba(16, 185, 129, 0.65)' : 'rgba(239, 68, 68, 0.65)',
            boxShadow: downloadToast.type === 'success' ? '0 10px 35px rgba(16, 185, 129, 0.3)' : '0 10px 35px rgba(239, 68, 68, 0.3)',
          }}
          role="status"
          aria-live="polite"
        >
          {downloadToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold text-white tracking-wide flex-1 leading-snug">
            {downloadToast.message}
          </span>
          <button
            onClick={() => setDownloadToast(null)}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

