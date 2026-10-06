"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Zap, Settings, X, AlertTriangle } from 'lucide-react';
import { isDemoModeActive } from '@/lib/demoMode';

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
  tag?: string;
  subtitle?: string;
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
import { getUserStorageItem, setUserStorageItem, removeUserStorageItem } from '@/lib/userStorage';

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
  const router = useRouter();
  const [activeMissionModal, setActiveMissionModal] = React.useState<Mission | null>(null);
  const [savedMissionId, setSavedMissionId] = React.useState<string | null>(null);
  const [existingSaveInfo, setExistingSaveInfo] = React.useState<{ title: string; sectionIndex: number; missionId: string } | null>(null);
  const [pendingMission, setPendingMission] = React.useState<Mission | null>(null);
  const [showOverrideModal, setShowOverrideModal] = React.useState(false);
  const displayLangName = MODULE_DISPLAY_NAMES[moduleId] || moduleId.toUpperCase();

  const matchMissionAliases = (a?: string, b?: string): boolean => {
    if (!a || !b) return false;
    const aL = a.toLowerCase();
    const bL = b.toLowerCase();
    if (aL === bL) return true;
    if ((aL === 'saturn-3' || aL === 'cpp-3') && (bL === 'saturn-3' || bL === 'cpp-3')) return true;
    if ((aL === 'saturn-2' || aL === 'cpp-2') && (bL === 'saturn-2' || bL === 'cpp-2')) return true;
    if ((aL === 'saturn-1' || aL === 'cpp-1') && (bL === 'saturn-1' || bL === 'cpp-1')) return true;
    if ((aL === 'jupiter-3' || aL === 'java-3') && (bL === 'jupiter-3' || bL === 'java-3')) return true;
    if ((aL === 'jupiter-2' || aL === 'java-2') && (bL === 'jupiter-2' || bL === 'java-2')) return true;
    if ((aL === 'jupiter-1' || aL === 'java-1') && (bL === 'jupiter-1' || bL === 'java-1')) return true;
    if ((aL === 'mercury-1' || aL === 'js-1-mercury') && (bL === 'mercury-1' || bL === 'js-1-mercury')) return true;
    if ((aL === 'mercury-2' || aL === 'js-2-mercury') && (bL === 'mercury-2' || bL === 'js-2-mercury')) return true;
    if ((aL === 'mercury-3' || aL === 'js-3-mercury' || aL === 'javascript-3' || aL === 'js-3') && (bL === 'mercury-3' || bL === 'js-3-mercury' || bL === 'javascript-3' || bL === 'js-3')) return true;
    if ((aL === 'earth-1' || aL === 'python-1' || aL === 'earth') && (bL === 'earth-1' || bL === 'python-1' || bL === 'earth')) return true;
    if ((aL === 'earth-2' || aL === 'python-2') && (bL === 'earth-2' || bL === 'python-2')) return true;
    if ((aL === 'earth-3' || aL === 'python-3') && (bL === 'earth-3' || bL === 'python-3')) return true;
    return false;
  };

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

  const launchLevel = (mission: Mission) => {
    const isCompleted = completedMissions.some(m => m.missionId.toLowerCase() === mission.id.toLowerCase());
    const hasActiveProgress = Boolean(savedMissionId && matchMissionAliases(savedMissionId, mission.id));
    const isReplay = !hasActiveProgress && isCompleted;

    if (isReplay && userId) {
      try {
        removeUserStorageItem('active_saved_level', userId);
        removeUserStorageItem(`completed_sections_${mission.id}`, userId);
        removeUserStorageItem(`completed_goals_${mission.id}`, userId);
        for (let s = 0; s < 10; s++) {
          removeUserStorageItem(`saved_workspace_${mission.id}_${s}`, userId);
          removeUserStorageItem(`saved_workspace_${mission.id.toLowerCase()}_${s}`, userId);
        }
        if (mission.id.toLowerCase() === 'mercury-2' || mission.id.toLowerCase() === 'js-2-mercury') {
          removeUserStorageItem('saved_workspace_mercury-2_0', userId);
          removeUserStorageItem('saved_workspace_js-2-mercury_0', userId);
        }
        if (mission.id.toLowerCase() === 'mercury-3' || mission.id.toLowerCase() === 'js-3-mercury') {
          removeUserStorageItem('saved_workspace_mercury-3_0', userId);
          removeUserStorageItem('saved_workspace_js-3-mercury_0', userId);
          removeUserStorageItem('mercury3_tab_mercury-3_html', userId);
          removeUserStorageItem('mercury3_tab_mercury-3_css', userId);
          removeUserStorageItem('mercury3_tab_mercury-3_js', userId);
          removeUserStorageItem('mercury3_active_tab_mercury-3', userId);
        }
        if (mission.id.toLowerCase() === 'jupiter-1' || mission.id.toLowerCase() === 'java-1') {
          removeUserStorageItem('saved_workspace_jupiter-1_0', userId);
          removeUserStorageItem('saved_workspace_java-1_0', userId);
        }
        if (mission.id.toLowerCase() === 'jupiter-2' || mission.id.toLowerCase() === 'java-2') {
          const j2Aliases = [mission.id, 'jupiter-2', 'java-2'];
          j2Aliases.forEach(id => {
            removeUserStorageItem(`jupiter2_wave_${id}_1`, userId);
            removeUserStorageItem(`jupiter2_wave_${id}_2`, userId);
            removeUserStorageItem(`jupiter2_wave_${id}_3`, userId);
            removeUserStorageItem(`jupiter2_active_wave_${id}`, userId);
            removeUserStorageItem(`jupiter2_wave1_complete_${id}`, userId);
            removeUserStorageItem(`jupiter2_wave2_complete_${id}`, userId);
            removeUserStorageItem(`saved_workspace_${id}_0`, userId);
          });
        }
        if (mission.id.toLowerCase() === 'jupiter-3' || mission.id.toLowerCase() === 'java-3') {
          removeUserStorageItem('saved_workspace_jupiter-3_0', userId);
          removeUserStorageItem('saved_workspace_java-3_0', userId);
        }
        if (mission.id.toLowerCase() === 'saturn-2' || mission.id.toLowerCase() === 'cpp-2') {
          removeUserStorageItem('saved_workspace_saturn-2_0', userId);
          removeUserStorageItem('saved_workspace_cpp-2_0', userId);
        }
        if (mission.id.toLowerCase() === 'saturn-3' || mission.id.toLowerCase() === 'cpp-3') {
          removeUserStorageItem('saved_workspace_saturn-3_0', userId);
          removeUserStorageItem('saved_workspace_cpp-3_0', userId);
        }
        if (mission.id.toLowerCase() === 'earth-1' || mission.id.toLowerCase() === 'python-1' || mission.id.toLowerCase() === 'earth') {
          for (let s = 0; s < 5; s++) {
            removeUserStorageItem(`saved_workspace_earth-1_${s}`, userId);
            removeUserStorageItem(`saved_workspace_python-1_${s}`, userId);
            removeUserStorageItem(`saved_workspace_earth_${s}`, userId);
          }
        }
        if (mission.id.toLowerCase() === 'earth-2' || mission.id.toLowerCase() === 'python-2') {
          const earth2Aliases = [mission.id, 'earth-2', 'python-2'];
          earth2Aliases.forEach(id => {
            removeUserStorageItem(`earth2_tab_${id}_tab1`, userId);
            removeUserStorageItem(`earth2_tab_${id}_tab2`, userId);
            removeUserStorageItem(`earth2_tab1_complete_${id}`, userId);
            removeUserStorageItem(`earth2_active_tab_${id}`, userId);
            removeUserStorageItem(`saved_workspace_${id}_0`, userId);
          });
        }
        if (mission.id.toLowerCase() === 'earth-3' || mission.id.toLowerCase() === 'python-3') {
          for (let s = 0; s < 5; s++) {
            removeUserStorageItem(`saved_workspace_earth-3_${s}`, userId);
            removeUserStorageItem(`saved_workspace_python-3_${s}`, userId);
          }
        }
        if (mission.id.toLowerCase() === 'venus-3' || mission.id.toLowerCase() === 'css-3-venus') {
          removeUserStorageItem('venus3_solved_sectors', userId);
          removeUserStorageItem('venus3_active_tab', userId);
          removeUserStorageItem(`venus3_active_tab_${mission.id}`, userId);
          removeUserStorageItem(`venus3_styles_${mission.id}`, userId);
          removeUserStorageItem(`venus3_tab_${mission.id}_main`, userId);
          removeUserStorageItem(`venus3_tab_${mission.id}_alpha`, userId);
          removeUserStorageItem(`venus3_tab_${mission.id}_beta`, userId);
          removeUserStorageItem(`venus3_tab_${mission.id}_gamma`, userId);
        }
      } catch (e) { }
    } else if (!hasActiveProgress && userId) {
      // Starting fresh without an active save: wipe any leftover workspace saves from previous sessions
      try {
        for (let s = 0; s < 10; s++) {
          removeUserStorageItem(`saved_workspace_${mission.id}_${s}`, userId);
          removeUserStorageItem(`saved_workspace_${mission.id.toLowerCase()}_${s}`, userId);
        }
        if (mission.id.toLowerCase() === 'mercury-1' || mission.id.toLowerCase() === 'js-1-mercury') {
          removeUserStorageItem('saved_workspace_mercury-1_0', userId);
          removeUserStorageItem('saved_workspace_js-1-mercury_0', userId);
        }
        if (mission.id.toLowerCase() === 'mercury-2' || mission.id.toLowerCase() === 'js-2-mercury') {
          removeUserStorageItem('saved_workspace_mercury-2_0', userId);
          removeUserStorageItem('saved_workspace_js-2-mercury_0', userId);
        }
        if (mission.id.toLowerCase() === 'mercury-3' || mission.id.toLowerCase() === 'js-3-mercury' || mission.id.toLowerCase() === 'javascript-3' || mission.id.toLowerCase() === 'js-3') {
          removeUserStorageItem('saved_workspace_mercury-3_0', userId);
          removeUserStorageItem('saved_workspace_js-3-mercury_0', userId);
          removeUserStorageItem('mercury3_tab_mercury-3_html', userId);
          removeUserStorageItem('mercury3_tab_mercury-3_css', userId);
          removeUserStorageItem('mercury3_tab_mercury-3_js', userId);
          removeUserStorageItem('mercury3_active_tab_mercury-3', userId);
        }
        if (mission.id.toLowerCase() === 'jupiter-1' || mission.id.toLowerCase() === 'java-1') {
          removeUserStorageItem('saved_workspace_jupiter-1_0', userId);
          removeUserStorageItem('saved_workspace_java-1_0', userId);
        }
        if (mission.id.toLowerCase() === 'jupiter-2' || mission.id.toLowerCase() === 'java-2') {
          const j2Aliases = [mission.id, 'jupiter-2', 'java-2'];
          j2Aliases.forEach(id => {
            removeUserStorageItem(`jupiter2_wave_${id}_1`, userId);
            removeUserStorageItem(`jupiter2_wave_${id}_2`, userId);
            removeUserStorageItem(`jupiter2_wave_${id}_3`, userId);
            removeUserStorageItem(`jupiter2_active_wave_${id}`, userId);
            removeUserStorageItem(`jupiter2_wave1_complete_${id}`, userId);
            removeUserStorageItem(`jupiter2_wave2_complete_${id}`, userId);
            removeUserStorageItem(`saved_workspace_${id}_0`, userId);
          });
        }
        if (mission.id.toLowerCase() === 'jupiter-3' || mission.id.toLowerCase() === 'java-3') {
          removeUserStorageItem('saved_workspace_jupiter-3_0', userId);
          removeUserStorageItem('saved_workspace_java-3_0', userId);
        }
        if (mission.id.toLowerCase() === 'saturn-2' || mission.id.toLowerCase() === 'cpp-2') {
          removeUserStorageItem('saved_workspace_saturn-2_0', userId);
          removeUserStorageItem('saved_workspace_cpp-2_0', userId);
        }
        if (mission.id.toLowerCase() === 'saturn-3' || mission.id.toLowerCase() === 'cpp-3') {
          removeUserStorageItem('saved_workspace_saturn-3_0', userId);
          removeUserStorageItem('saved_workspace_cpp-3_0', userId);
        }
        if (mission.id.toLowerCase() === 'earth-1' || mission.id.toLowerCase() === 'python-1' || mission.id.toLowerCase() === 'earth') {
          for (let s = 0; s < 5; s++) {
            removeUserStorageItem(`saved_workspace_earth-1_${s}`, userId);
            removeUserStorageItem(`saved_workspace_python-1_${s}`, userId);
            removeUserStorageItem(`saved_workspace_earth_${s}`, userId);
          }
        }
        if (mission.id.toLowerCase() === 'earth-2' || mission.id.toLowerCase() === 'python-2') {
          const earth2Aliases = [mission.id, 'earth-2', 'python-2'];
          earth2Aliases.forEach(id => {
            removeUserStorageItem(`earth2_tab_${id}_tab1`, userId);
            removeUserStorageItem(`earth2_tab_${id}_tab2`, userId);
            removeUserStorageItem(`earth2_tab1_complete_${id}`, userId);
            removeUserStorageItem(`earth2_active_tab_${id}`, userId);
            removeUserStorageItem(`saved_workspace_${id}_0`, userId);
          });
        }
        if (mission.id.toLowerCase() === 'earth-3' || mission.id.toLowerCase() === 'python-3') {
          for (let s = 0; s < 5; s++) {
            removeUserStorageItem(`saved_workspace_earth-3_${s}`, userId);
            removeUserStorageItem(`saved_workspace_python-3_${s}`, userId);
          }
        }
        removeUserStorageItem(`completed_sections_${mission.id}`, userId);
        removeUserStorageItem(`completed_sections_${mission.id.toLowerCase()}`, userId);
        if (!isCompleted) {
          removeUserStorageItem(`completed_goals_${mission.id}`, userId);
          removeUserStorageItem(`completed_goals_${mission.id.toLowerCase()}`, userId);
        }
      } catch (e) { }
    }

    try {
      if (userId) {
        setUserStorageItem('active_level', JSON.stringify({
          missionId: mission.id,
          title: mission.title,
          module: displayLangName,
          icon: PLANET_IMAGES[moduleId] || "/assets/planets/celestial/Planet 1.svg",
          desc: mission.desc,
          tag: 'Mission',
          startedAt: new Date().toISOString()
        }), userId);
      }
    } catch (e) { }

    router.push(`/sandbox?missionId=${mission.id}${isReplay ? '&mode=replay' : ''}`);
  };

  const handleStartMission = (mission: Mission) => {
    try {
      if (userId) {
        const rawSave = getUserStorageItem('active_saved_level', userId);
        if (rawSave) {
          const parsed = JSON.parse(rawSave);
          if (parsed.missionId && !matchMissionAliases(parsed.missionId, mission.id)) {
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
      }
    } catch (e) {
      console.warn("Error checking existing save:", e);
    }

    launchLevel(mission);
  };

  const handleConfirmOverride = () => {
    if (!pendingMission) return;
    try {
      if (userId) {
        removeUserStorageItem('active_saved_level', userId);
        removeUserStorageItem('active_level', userId);

        if (existingSaveInfo?.missionId) {
          const oldId = existingSaveInfo.missionId;
          const oldIdLower = oldId.toLowerCase();
          removeUserStorageItem(`completed_sections_${oldId}`, userId);
          removeUserStorageItem(`completed_goals_${oldId}`, userId);
          removeUserStorageItem(`completed_sections_${oldIdLower}`, userId);
          removeUserStorageItem(`completed_goals_${oldIdLower}`, userId);
          for (let s = 0; s < 10; s++) {
            removeUserStorageItem(`saved_workspace_${oldId}_${s}`, userId);
            removeUserStorageItem(`saved_workspace_${oldIdLower}_${s}`, userId);
          }
          if (oldIdLower === 'mercury-1' || oldIdLower === 'js-1-mercury') {
            removeUserStorageItem('saved_workspace_mercury-1_0', userId);
            removeUserStorageItem('saved_workspace_js-1-mercury_0', userId);
          }
          if (oldIdLower === 'mercury-2' || oldIdLower === 'js-2-mercury') {
            removeUserStorageItem('saved_workspace_mercury-2_0', userId);
            removeUserStorageItem('saved_workspace_js-2-mercury_0', userId);
          }
          if (oldIdLower === 'mercury-3' || oldIdLower === 'js-3-mercury') {
            removeUserStorageItem('saved_workspace_mercury-3_0', userId);
            removeUserStorageItem('saved_workspace_js-3-mercury_0', userId);
            removeUserStorageItem('mercury3_tab_mercury-3_html', userId);
            removeUserStorageItem('mercury3_tab_mercury-3_css', userId);
            removeUserStorageItem('mercury3_tab_mercury-3_js', userId);
            removeUserStorageItem('mercury3_active_tab_mercury-3', userId);
          }
          if (oldIdLower === 'jupiter-1' || oldIdLower === 'java-1') {
            removeUserStorageItem('saved_workspace_jupiter-1_0', userId);
            removeUserStorageItem('saved_workspace_java-1_0', userId);
          }
          if (oldIdLower === 'jupiter-2' || oldIdLower === 'java-2') {
            const j2Aliases = [oldId, oldIdLower, 'jupiter-2', 'java-2'];
            j2Aliases.forEach(id => {
              removeUserStorageItem(`jupiter2_wave_${id}_1`, userId);
              removeUserStorageItem(`jupiter2_wave_${id}_2`, userId);
              removeUserStorageItem(`jupiter2_wave_${id}_3`, userId);
              removeUserStorageItem(`jupiter2_active_wave_${id}`, userId);
              removeUserStorageItem(`jupiter2_wave1_complete_${id}`, userId);
              removeUserStorageItem(`jupiter2_wave2_complete_${id}`, userId);
              removeUserStorageItem(`saved_workspace_${id}_0`, userId);
            });
          }
          if (oldIdLower === 'jupiter-3' || oldIdLower === 'java-3') {
            removeUserStorageItem('saved_workspace_jupiter-3_0', userId);
            removeUserStorageItem('saved_workspace_java-3_0', userId);
          }
          if (oldIdLower === 'saturn-2' || oldIdLower === 'cpp-2') {
            removeUserStorageItem('saved_workspace_saturn-2_0', userId);
            removeUserStorageItem('saved_workspace_cpp-2_0', userId);
          }
          if (oldIdLower === 'saturn-3' || oldIdLower === 'cpp-3') {
            removeUserStorageItem('saved_workspace_saturn-3_0', userId);
            removeUserStorageItem('saved_workspace_cpp-3_0', userId);
          }
          if (oldIdLower === 'earth-1' || oldIdLower === 'python-1' || oldIdLower === 'earth') {
            for (let s = 0; s < 5; s++) {
              removeUserStorageItem(`saved_workspace_earth-1_${s}`, userId);
              removeUserStorageItem(`saved_workspace_python-1_${s}`, userId);
              removeUserStorageItem(`saved_workspace_earth_${s}`, userId);
            }
          }
          if (oldIdLower === 'earth-2' || oldIdLower === 'python-2') {
            const earth2Aliases = [oldId, oldIdLower, 'earth-2', 'python-2'];
            earth2Aliases.forEach(id => {
              removeUserStorageItem(`earth2_tab_${id}_tab1`, userId);
              removeUserStorageItem(`earth2_tab_${id}_tab2`, userId);
              removeUserStorageItem(`earth2_tab1_complete_${id}`, userId);
              removeUserStorageItem(`earth2_active_tab_${id}`, userId);
              removeUserStorageItem(`saved_workspace_${id}_0`, userId);
            });
          }
          if (oldIdLower === 'earth-3' || oldIdLower === 'python-3') {
            for (let s = 0; s < 5; s++) {
              removeUserStorageItem(`saved_workspace_earth-3_${s}`, userId);
              removeUserStorageItem(`saved_workspace_python-3_${s}`, userId);
            }
          }
        }

        const isEarth2Existing = existingSaveInfo && (existingSaveInfo.missionId.toLowerCase() === 'earth-2' || existingSaveInfo.missionId.toLowerCase() === 'python-2');
        const isEarth2Pending = pendingMission.id.toLowerCase() === 'earth-2' || pendingMission.id.toLowerCase() === 'python-2';

        if (isEarth2Existing || isEarth2Pending) {
          const e2Ids = [
            ...(isEarth2Existing && existingSaveInfo ? [existingSaveInfo.missionId] : []),
            ...(isEarth2Pending ? [pendingMission.id] : []),
            'earth-2',
            'python-2'
          ];
          e2Ids.forEach(id => {
            removeUserStorageItem(`earth2_tab_${id}_tab1`, userId);
            removeUserStorageItem(`earth2_tab_${id}_tab2`, userId);
            removeUserStorageItem(`earth2_tab1_complete_${id}`, userId);
            removeUserStorageItem(`earth2_active_tab_${id}`, userId);
            removeUserStorageItem(`saved_workspace_${id}_0`, userId);
          });
        }

        const isVenus3Existing = existingSaveInfo && (existingSaveInfo.missionId.toLowerCase() === 'venus-3' || existingSaveInfo.missionId.toLowerCase() === 'css-3-venus');
        const isVenus3Pending = pendingMission.id.toLowerCase() === 'venus-3' || pendingMission.id.toLowerCase() === 'css-3-venus';

        if (isVenus3Existing || isVenus3Pending) {
          const v3Id = isVenus3Existing ? existingSaveInfo.missionId : pendingMission.id;
          removeUserStorageItem('venus3_solved_sectors', userId);
          removeUserStorageItem('venus3_active_tab', userId);
          removeUserStorageItem(`venus3_active_tab_${v3Id}`, userId);
          removeUserStorageItem(`venus3_styles_${v3Id}`, userId);
          removeUserStorageItem(`venus3_tab_${v3Id}_main`, userId);
          removeUserStorageItem(`venus3_tab_${v3Id}_alpha`, userId);
          removeUserStorageItem(`venus3_tab_${v3Id}_beta`, userId);
          removeUserStorageItem(`venus3_tab_${v3Id}_gamma`, userId);
        }
      }
      setSavedMissionId(pendingMission.id.toLowerCase());
    } catch (e) {
      console.warn(e);
    }
    setShowOverrideModal(false);
    launchLevel(pendingMission);
  };

  const handleClose = (e: React.MouseEvent) => {
    if (onClose) {
      e.preventDefault();
      onClose();
    }
  };

  // Immersive locked overlay view
  if (isLocked && !isDemoModeActive()) {
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
            const hasActiveProgress = Boolean(savedMissionId && matchMissionAliases(savedMissionId, mission.id));

            // Progression Lock Check: Level i is unlocked if level i-1 is completed (Level 1 is always unlocked), demo mode is on, or it has active progress
            const isUnlocked = isDemoModeActive() || hasActiveProgress || index === 0 || completedMissions.some(m => m.missionId.toLowerCase() === missions[index - 1].id.toLowerCase());

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
                    {mission.subtitle && (
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#ff912d] font-bold">
                        {mission.subtitle}
                      </div>
                    )}
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
                            : hasActiveProgress
                              ? 'bg-[#8c2e0b] hover:bg-[#a3360d] text-white border-2 border-[#ffd1a9]/90 shadow-[0_4px_12px_rgba(0,0,0,0.3),0_0_12px_rgba(234,88,12,0.35)]'
                              : isCompleted
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-300/90 shadow-[0_4px_12px_rgba(0,0,0,0.3),0_0_12px_rgba(16,185,129,0.35)]'
                                : 'bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white shadow-md shadow-[#ff912d]/10'
                          }`}
                      >
                        {!isUnlocked ? 'Locked' : hasActiveProgress ? 'Resume' : isCompleted ? 'Replay' : 'Enter Lab'}
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
                className={`w-16 h-16 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(255,145,45,0.4)] animate-pulse ${
                  (moduleId === 'venus' || moduleId === 'css') && !missions.every(m => completedMissions.some(cm => cm.missionId.toLowerCase() === m.id.toLowerCase())) ? 'grayscale' : ''
                }`} 
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
              {(() => {
                const isCompleted = completedMissions.some(m => m.missionId.toLowerCase() === activeMissionModal.id.toLowerCase());
                const hasActiveProgress = Boolean(savedMissionId && matchMissionAliases(savedMissionId, activeMissionModal.id));
                const isResume = hasActiveProgress;
                const isReplay = !hasActiveProgress && isCompleted;

                return (
                  <button
                    onClick={() => handleStartMission(activeMissionModal)}
                    className={`flex-1 py-3.5 font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all hover:scale-105 active:scale-95 text-center cursor-pointer ${
                      isResume || isReplay
                        ? 'bg-[#8c2e0b] hover:bg-[#a3360d] text-white border-2 border-[#ffd1a9]/90 shadow-[0_4px_16px_rgba(0,0,0,0.3),0_0_14px_rgba(234,88,12,0.4)]'
                        : 'bg-[#ff912d] hover:bg-orange-400 text-black shadow-[0_0_20px_rgba(255,145,45,0.4)]'
                    }`}
                  >
                    {isResume ? 'Resume Mission' : isReplay ? 'Replay Mission' : 'Start Mission'}
                  </button>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* Save Override Confirmation Modal */}
      {showOverrideModal && existingSaveInfo && pendingMission && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
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
