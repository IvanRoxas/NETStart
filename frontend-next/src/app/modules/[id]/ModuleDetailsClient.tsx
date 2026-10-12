"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Lock, Rocket, Zap, HelpCircle, AlertTriangle, X, Play, RotateCcw, Film } from 'lucide-react';

import { getUserStorageItem, setUserStorageItem, removeUserStorageItem } from '@/lib/userStorage';
import DemoToggle from '@/components/DemoToggle';
import { useDemoMode } from '@/lib/demoMode';
import StoryArchiveModal from '@/components/StoryArchiveModal';
import MusicToggleButton from '@/components/MusicToggleButton';
import { normalizeModuleToCategory } from '@/lib/storyArchive';
import { getMissionPreviewImage, matchMissionAliases } from '@/lib/missionPreviewImages';

interface Mission {
  id: string;
  title: string;
  desc: string;
  tag?: string;
  subtitle?: string;
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
    id?: string | null;
    name?: string | null;
    image?: string | null;
  };
  initialDemoMode?: boolean;
  isLocked?: boolean;
  canUseDemoMode?: boolean;
}

const getMissionHint = (missionId: string) => {
  const hints: Record<string, string> = {
    "moon-1": "Hint: Connect different puzzle blocks in order to guide your rover safely to the goal!",
    "moon-2": "Hint: Use Repeat loops and Scan sensors to sort the cargo!",
    "moon-3": "Hint: Check each system carefully to prepare the starship for departure.",
    "html-1": "Hint: Structure your billboard clearly so visitors can easily read your message.",
    "html-2": "Hint: Make sure your form elements are organized so users can input information.",
    "html-3": "Hint: Arrange your rows and columns neatly so data is easy to follow.",
    "html-4": "Hint: Group related content together to give your page clear structure.",
    "html-5": "Hint: Check your media settings to ensure videos and audio play as intended.",
    "mars-1": "Hint: Pick a consistent theme and style your billboard to catch the colony's eye.",
    "mars-2": "Hint: Look closely at each clue to find the image that matches best.",
    "mars-3": "Hint: Group your elements together so your message can be sent smoothly.",
    "mars-4": "Hint: Ensure your media players are configured to display properly.",
    "mars-5": "Hint: Double check your links to make sure they connect to the right stations.",
    "venus-1": "Hint: Use colors and borders to make each piece of equipment stand out.",
    "venus-2": "Hint: Check the blueprints carefully to align each screen layout.",
    "venus-3": "Hint: Bring color back to each dead zone and connect them to the main system.",
    "venus-4": "Hint: Divide your layout evenly so content fits within the display.",
    "venus-5": "Hint: Add smooth transitions to bring your interface elements to life.",
    "mercury-1": "Hint: Inspect the plants in the dome to see what each one needs to thrive.",
    "mercury-2": "Hint: Watch the crates on the belt and guide each one to its destination.",
    "mercury-3": "Hint: Help Nova and Professor Dominic rebuild the AstroLink by stacking your HTML and CSS blocks for the design, and then snap a JavaScript event block onto your send button to make it work!",
    "mercury-4": "Hint: Filter your data stream to focus only on the values you need.",
    "mercury-5": "Hint: Set up responses to user actions so the station reacts to clicks.",
    "jupiter-1": "Hint: Need the passwords? Click the clipboard in the bottom-left corner!",
    "jupiter-2": "Hint: Wrap the scanner in a 'try' block, then stack 'catch' turrets to target specific errors like NullPointerException.",
    "jupiter-3": "Hint: A blueprint is just a plan! After you build your 'class UserProfile' and hide your data using 'private', don't forget to actually print your badge by placing the 'new' block at the bottom of your workspace!",
    "jupiter-4": "Hint: Define a common contract that different probes can follow.",
    "jupiter-5": "Hint: Handle unexpected errors gracefully to keep operations running.",
    "saturn-1": "Hint: Assemble all the blocks in the toolbox to build a complete terminal program, then score 1,000 points!",
    "saturn-2": "Hint: Use your Switch block to match each material to its correct machine—send 'Ice' to the Melter, 'Rock' to the Crusher, and 'Metal' to the Magnet!",
    "cpp-2": "Hint: Use your Switch block to match each material to its correct machine—send 'Ice' to the Melter, 'Rock' to the Crusher, and 'Metal' to the Magnet!",
    "saturn-3": "Hint: A pointer is just a robotic arm! Use 'new' to grab a core from the rack, and 'delete' to drop it safely into the recycling chute when you are done.",
    "cpp-3": "Hint: A pointer is just a robotic arm! Use 'new' to grab a core from the rack, and 'delete' to drop it safely into the recycling chute when you are done.",
    "saturn-4": "Hint: Define how custom objects interact when combined together.",
    "saturn-5": "Hint: Write flexible logic that works across different types of data.",
    "earth-1": "Hint: To rescue the clean data, count the invisible spaces between the scrambled letters starting at 0 to program your laser's start and stop points.",
    "earth-2": "Hint: Map scrambled data into dictionary categories in Tab 1, then append them to the Master Archive in Tab 2.",
    "python-2": "Hint: Map scrambled data into dictionary categories in Tab 1, then append them to the Master Archive in Tab 2.",
    "earth-3": "Hint: Place your import blocks at the very top of the workspace, then nest your planetary function calls inside a master function block to lock the connections into place.",
    "python-3": "Hint: Place your import blocks at the very top of the workspace, then nest your planetary function calls inside a master function block to lock the connections into place.",
    "earth-4": "Hint: Use mathematical operations to calculate precise orbital paths.",
    "earth-5": "Hint: Connect to Mission Control to fetch updated satellite positions."
  };
  return hints[missionId.toLowerCase()] || "Hint: Complete this level to earn 150 XP and unlock rewards!";
};

const MODULE_PLANET_ICON: Record<string, string> = {
  moon: '/assets/planets/00_moon/environment/MainMoon.svg',
  mars: '/assets/planets/celestial/Mars.svg',
  html: '/assets/planets/celestial/Mars.svg',
  venus: '/assets/planets/celestial/Venus.svg',
  css: '/assets/planets/celestial/Venus.svg',
  mercury: '/assets/planets/celestial/Mercury.svg',
  javascript: '/assets/planets/celestial/Mercury.svg',
  js: '/assets/planets/celestial/Mercury.svg',
  jupiter: '/assets/planets/celestial/Jupiter.svg',
  java: '/assets/planets/celestial/Jupiter.svg',
  saturn: '/assets/planets/celestial/Saturn.svg',
  cpp: '/assets/planets/celestial/Saturn.svg',
  earth: '/assets/planets/celestial/Earth.svg',
  python: '/assets/planets/celestial/Earth.svg',
};

export default function ModuleDetailsClient({
  moduleId,
  missions,
  meta,
  completedMissions,
  sessionUser,
  initialDemoMode = false,
  isLocked = false,
  canUseDemoMode = false,
}: ModuleDetailsClientProps) {
  const router = useRouter();
  const userId = sessionUser?.id;
  const { isDemoMode: hookDemoMode } = useDemoMode();
  const isDemoMode = canUseDemoMode && (hookDemoMode || initialDemoMode);
  const [pendingMission, setPendingMission] = useState<Mission | null>(null);
  const [existingSaveInfo, setExistingSaveInfo] = useState<{ title: string; sectionIndex: number; missionId: string } | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [savedMissionId, setSavedMissionId] = useState<string | null>(null);
  const [showStoryArchive, setShowStoryArchive] = useState(false);
  // Server completion set is authoritative
  const serverCompletedSet = useMemo(() => new Set(completedMissions.map(m => m.missionId.toLowerCase())), [completedMissions]);

  useEffect(() => {
    let activeId: string | null = null;
    if (userId) {
      try {
        const rawSave = getUserStorageItem('active_saved_level', userId) || getUserStorageItem('active_level', userId);
        if (rawSave) {
          const parsed = JSON.parse(rawSave);
          if (parsed.missionId) {
            activeId = parsed.missionId.toLowerCase();
          }
        }
      } catch (e) {
        console.warn("Could not retrieve active mission ID:", e);
      }

      // Synchronize localStorage with server completed missions without wiping local completions
      try {
        const cached: string[] = JSON.parse(getUserStorageItem('completed_missions', userId) || '[]');
        completedMissions.forEach(m => {
          if (!cached.some(c => c.toLowerCase() === m.missionId.toLowerCase())) {
            cached.push(m.missionId);
          }
        });
        setUserStorageItem('completed_missions', JSON.stringify(cached), userId);
      } catch (e) {}
    }

    setSavedMissionId(activeId);
  }, [completedMissions, missions, serverCompletedSet, userId, isDemoMode]);

  // Combined completed IDs including local cache
  const allCompletedIds = useMemo(() => {
    const combined = new Set(completedMissions.map(m => m.missionId.toLowerCase()));
    try {
      if (userId) {
        const cached: string[] = JSON.parse(getUserStorageItem('completed_missions', userId) || '[]');
        cached.forEach(id => combined.add(id.toLowerCase()));
      }
    } catch (e) {}
    return combined;
  }, [completedMissions, userId]);

  const planetIcon = MODULE_PLANET_ICON[moduleId.toLowerCase()] || '/assets/planets/00_moon/environment/MainMoon.svg';

  const getCompletedCount = (modId: string) => {
    return missions.filter(mission =>
      allCompletedIds.has(mission.id.toLowerCase())
    ).length;
  };

  const completedCount = getCompletedCount(moduleId);
  const progressPct = missions.length > 0 ? Math.round((completedCount / missions.length) * 100) : 0;

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

    // Direct launch
    launchLevel(mission);
  };

  const launchLevel = (mission: Mission) => {
    const hasActiveProgress = Boolean(savedMissionId && matchMissionAliases(savedMissionId, mission.id));
    const isCompleted = allCompletedIds.has(mission.id.toLowerCase());
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
        if (mission.id.toLowerCase() === 'mercury-3' || mission.id.toLowerCase() === 'js-3-mercury' || mission.id.toLowerCase() === 'javascript-3' || mission.id.toLowerCase() === 'js-3') {
          const m3Aliases = [mission.id, 'mercury-3', 'js-3-mercury', 'javascript-3', 'js-3'];
          m3Aliases.forEach(id => {
            removeUserStorageItem(`saved_workspace_${id}_0`, userId);
            removeUserStorageItem(`mercury3_tab_${id}_html`, userId);
            removeUserStorageItem(`mercury3_tab_${id}_css`, userId);
            removeUserStorageItem(`mercury3_tab_${id}_js`, userId);
            removeUserStorageItem(`mercury3_active_tab_${id}`, userId);
          });
          removeUserStorageItem('mercury3_active_tab', userId);
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
          const m3Aliases = [mission.id, 'mercury-3', 'js-3-mercury', 'javascript-3', 'js-3'];
          m3Aliases.forEach(id => {
            removeUserStorageItem(`saved_workspace_${id}_0`, userId);
            removeUserStorageItem(`mercury3_tab_${id}_html`, userId);
            removeUserStorageItem(`mercury3_tab_${id}_css`, userId);
            removeUserStorageItem(`mercury3_tab_${id}_js`, userId);
            removeUserStorageItem(`mercury3_active_tab_${id}`, userId);
          });
          removeUserStorageItem('mercury3_active_tab', userId);
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
          module: meta.title,
          icon: planetIcon,
          desc: mission.desc,
          tag: mission.tag || 'Basic Syntax',
          startedAt: new Date().toISOString()
        }), userId);
      }
    } catch (e) {
      console.warn("Could not save active level metadata:", e);
    }

    const skipCutscene = !isCompleted && hasActiveProgress;
    router.push(`/sandbox?missionId=${mission.id}${isReplay ? '&mode=replay' : ''}&skipCutscene=${skipCutscene}`);
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
          if (oldIdLower === 'mercury-3' || oldIdLower === 'js-3-mercury' || oldIdLower === 'javascript-3' || oldIdLower === 'js-3') {
            const m3Aliases = [oldId, oldIdLower, 'mercury-3', 'js-3-mercury', 'javascript-3', 'js-3'];
            m3Aliases.forEach(id => {
              removeUserStorageItem(`saved_workspace_${id}_0`, userId);
              removeUserStorageItem(`mercury3_tab_${id}_html`, userId);
              removeUserStorageItem(`mercury3_tab_${id}_css`, userId);
              removeUserStorageItem(`mercury3_tab_${id}_js`, userId);
              removeUserStorageItem(`mercury3_active_tab_${id}`, userId);
            });
            removeUserStorageItem('mercury3_active_tab', userId);
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

        const isMercury3Existing = existingSaveInfo && (
          existingSaveInfo.missionId.toLowerCase() === 'mercury-3' ||
          existingSaveInfo.missionId.toLowerCase() === 'js-3-mercury' ||
          existingSaveInfo.missionId.toLowerCase() === 'javascript-3' ||
          existingSaveInfo.missionId.toLowerCase() === 'js-3'
        );
        const isMercury3Pending = (
          pendingMission.id.toLowerCase() === 'mercury-3' ||
          pendingMission.id.toLowerCase() === 'js-3-mercury' ||
          pendingMission.id.toLowerCase() === 'javascript-3' ||
          pendingMission.id.toLowerCase() === 'js-3'
        );

        if (isMercury3Existing || isMercury3Pending) {
          const m3Ids = [
            ...(isMercury3Existing && existingSaveInfo ? [existingSaveInfo.missionId] : []),
            ...(isMercury3Pending ? [pendingMission.id] : []),
            'mercury-3',
            'js-3-mercury',
            'javascript-3',
            'js-3',
          ];
          m3Ids.forEach(id => {
            removeUserStorageItem(`mercury3_tab_${id}_html`, userId);
            removeUserStorageItem(`mercury3_tab_${id}_css`, userId);
            removeUserStorageItem(`mercury3_tab_${id}_js`, userId);
            removeUserStorageItem(`mercury3_active_tab_${id}`, userId);
            removeUserStorageItem(`saved_workspace_${id}_0`, userId);
          });
          removeUserStorageItem('mercury3_active_tab', userId);
        }

        const isEarth3Existing = existingSaveInfo && (existingSaveInfo.missionId.toLowerCase() === 'earth-3' || existingSaveInfo.missionId.toLowerCase() === 'python-3');
        const isEarth3Pending = pendingMission.id.toLowerCase() === 'earth-3' || pendingMission.id.toLowerCase() === 'python-3';

        if (isEarth3Existing || isEarth3Pending) {
          const e3Ids = [
            ...(isEarth3Existing && existingSaveInfo ? [existingSaveInfo.missionId] : []),
            ...(isEarth3Pending ? [pendingMission.id] : []),
            'earth-3',
            'python-3',
          ];
          e3Ids.forEach(id => {
            removeUserStorageItem(`saved_workspace_${id}_0`, userId);
          });
        }
      }
      setSavedMissionId(pendingMission.id.toLowerCase());
    } catch (e) {
      console.warn(e);
    }
    setShowOverrideModal(false);
    launchLevel(pendingMission);
    setPendingMission(null);
  };

  const isCompactRow = missions.length <= 3;
  const hasActiveModuleSave = Boolean(savedMissionId && missions.some(m => matchMissionAliases(savedMissionId, m.id)));

  if (isLocked && !isDemoMode && !hasActiveModuleSave) {
    return (
      <div className="min-h-screen w-full bg-[#1e0a2d] flex items-center justify-center relative overflow-hidden px-6">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: "url('/assets/global/ui/Landing Page BG.png')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.3 }} />
        <div className="absolute inset-0 bg-black/60 z-0" />
        
        <div className="bg-[#1e0a2d]/90 backdrop-blur-xl border border-[#ff912d]/30 p-10 rounded-3xl max-w-md w-full text-center shadow-2xl relative z-10 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-[#ff912d]/10 rounded-full flex items-center justify-center border border-[#ff912d]/20 text-[#ff912d]">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Module Locked</h2>
            <p className="text-gray-400">
              You must complete all prior modules along the constellation flight path before entering this system orbit.
            </p>
          </div>

          <Link
            href="/modules"
            className="mt-4 px-8 py-4 bg-gradient-to-r from-[#ff912d] to-[#ff5722] hover:from-[#ff5722] hover:to-[#ff912d] text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Return to Mission Map
          </Link>
        </div>

        {/* Floating Demo Mode Toggle Button (bottom-left corner) */}
        {canUseDemoMode && (
          <div className="fixed bottom-6 left-24 z-50">
            <DemoToggle canUseDemoMode={canUseDemoMode} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#130927] text-white flex flex-col relative overflow-y-auto overflow-x-hidden pb-12">
      {/* Background image elements */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none" 
        style={{ 
          backgroundImage: "url('/assets/global/ui/Landing Page BG.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          opacity: 0.15 
        }} 
      />
      <div className="fixed inset-0 bg-black/50 z-0" />

      {/* Main layout frame */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 py-12 flex-grow flex flex-col gap-10">
        
        {/* Navigation / Header Area */}
        <div className="relative z-30 flex items-center justify-between mt-2 w-full">
          {/* Back Button (Yellow Circle on Left) */}
          <Link 
            href="/modules"
            className="w-12 h-12 rounded-full bg-yellow-400 text-black hover:bg-yellow-500 transition-all flex items-center justify-center shadow-lg hover:scale-105 shrink-0 group z-10"
          >
            <ArrowLeft size={22} className="stroke-[2.5]" />
          </Link>
          
          {/* Welcome Title Centered */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-black text-white uppercase tracking-wider text-center px-4 flex-1">
            Welcome to {meta.title}
          </h1>

          {/* Right Header Actions: Music Toggle & Story Archive */}
          <div className="flex items-center gap-3 shrink-0 z-30">
            <MusicToggleButton 
              variant="circle" 
              size="md" 
              className="!w-12 !h-12 !p-0 bg-white/5 border-white/10 hover:bg-white/10" 
            />
            <button
              type="button"
              onClick={() => setShowStoryArchive(true)}
              className="w-12 h-12 rounded-full bg-[#ff912d]/15 hover:bg-[#ff912d] text-[#ff912d] hover:text-[#110524] border border-[#ff912d]/40 hover:border-[#ff912d] shadow-lg transition-all flex items-center justify-center cursor-pointer active:scale-95 shrink-0"
              title={`${meta?.title || "Story"} Archives`}
              aria-label={`${meta?.title || "Story"} Archives`}
            >
              <Film size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Expanding Level Cards Container */}
        <div className={`flex flex-col ${isCompactRow ? 'md:flex-row' : 'lg:flex-row'} gap-6 mt-4 items-stretch w-full transition-all duration-500`}>
          {missions.map((mission, index) => {
            const isCompleted = allCompletedIds.has(mission.id.toLowerCase());
            
            // Find the index of the first uncompleted mission
            const firstUncompletedIndex = missions.findIndex(m => !allCompletedIds.has(m.id.toLowerCase()));
            
            // Is this level currently saved / active in progress? (Supports both first-time and replay in-progress sessions)
            const hasActiveProgress = Boolean(savedMissionId && matchMissionAliases(savedMissionId, mission.id));

            // If completed, or it is the first uncompleted mission, or has active progress, or demo mode is on: it is unlocked/colored.
            const isUnlocked = isDemoMode || hasActiveProgress || index <= (firstUncompletedIndex === -1 ? missions.length : firstUncompletedIndex);
            
            // Current active card: matches the saved in-progress level, or falls back to first uncompleted level if no active save exists
            const isCurrentActive = savedMissionId 
              ? hasActiveProgress 
              : (!isCompleted && index === firstUncompletedIndex);

            const imageUrl = getMissionPreviewImage(mission.id, moduleId, index, isCompleted);
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
                  <div className="relative aspect-[2.6/1] sm:aspect-[2.8/1] w-full overflow-hidden bg-black/40 shrink-0">
                    <img 
                      src={imageUrl} 
                      alt={mission.title} 
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isHovered ? 'scale-105' : ''
                      } ${isUnlocked ? '' : 'grayscale opacity-40'}`}
                    />
                    
                    {/* Active mission subtle ambient gradient overlay */}
                    {hasActiveProgress && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-amber-500/20 pointer-events-none ring-1 ring-inset ring-amber-400/50" />
                    )}
                    
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
                      {mission.subtitle && (
                        <div className="text-[10px] font-mono uppercase tracking-wider text-black/80 font-bold -mb-1">
                          {mission.subtitle}
                        </div>
                      )}
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
                      <button
                        onClick={() => handleStartMission(mission)}
                        className={`font-sans font-black text-[11px] uppercase tracking-widest py-2.5 px-5 rounded-xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer text-center w-32 ${
                          hasActiveProgress
                            ? 'bg-[#8c2e0b] hover:bg-[#a3360d] text-white border-2 border-[#ffd1a9]/90 shadow-[0_4px_14px_rgba(0,0,0,0.3),0_0_12px_rgba(234,88,12,0.35)]'
                            : isCompleted
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-300/90 shadow-[0_4px_14px_rgba(0,0,0,0.3),0_0_12px_rgba(16,185,129,0.35)]'
                            : 'bg-[#130927] hover:bg-[#1e0a2d] text-white border-2 border-white/30 hover:border-white/60 shadow-md'
                        }`}
                      >
                        {hasActiveProgress ? (
                          <>
                            <Play size={11} className="fill-white stroke-white" /> Resume
                          </>
                        ) : isCompleted ? (
                          <>
                            <RotateCcw size={11} className="stroke-[2.5]" /> Replay
                          </>
                        ) : (
                          <>
                            <Rocket size={11} className="stroke-[2]" /> Start
                          </>
                        )}
                      </button>
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

      {/* Floating Demo Mode Toggle Button (bottom-left corner) */}
      {canUseDemoMode && (
        <div className="fixed bottom-6 left-24 z-50">
          <DemoToggle canUseDemoMode={canUseDemoMode} />
        </div>
      )}

      {/* Story Archives Modal (Scoped to this planet) */}
      <StoryArchiveModal
        isOpen={showStoryArchive}
        onClose={() => setShowStoryArchive(false)}
        userId={sessionUser?.id || undefined}
        hasTakenAptitudeTest={true}
        completedMissions={completedMissions}
        isDemoMode={isDemoMode}
        username={sessionUser?.name || "Operator"}
        scopedCategory={normalizeModuleToCategory(moduleId)}
        sectorTitle={meta?.title}
      />

    </div>
  );
}
