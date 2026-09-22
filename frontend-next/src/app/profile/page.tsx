"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { VT323 } from 'next/font/google';
import TopHeader from '@/components/TopHeader';
import { allBadges } from '@/lib/badgesData';
import { getXPDetails } from '@/lib/leveling';
import { getUnlockedAchievements } from '@/app/actions/achievements';
import SpaceLoader from '@/components/SpaceLoader';
import PassportStatsCard from '@/components/PassportStatsCard';
import ImageCropModal from '@/components/ImageCropModal';
import DailyTaskTracker from '@/components/DailyTaskTracker';
import { getUserStorageItem } from '@/lib/userStorage';

const vt323 = VT323({ weight: '400', subsets: ['latin'] });

const DAILY_LEVEL_POOL = [
  {
    title: "Weave Trap",
    tag: "Syntax",
    desc: "Watch out for red bomb traps! Steer your space rover around the danger and take the safe road to reach the finish line.",
    icon: "/assets/global/daily/weave-trap.svg",
  },
  {
    title: "Lane Changer",
    tag: "Syntax",
    desc: "Switch lanes to avoid road blocks! Pick the best turns and drive your rover safely all the way to the goal.",
    icon: "/assets/global/daily/lane-changer.svg",
  },
  {
    title: "Hazard Labyrinth",
    tag: "Syntax",
    desc: "Find your way out of the space maze! Use repeat loops and look out for walls to reach the golden star.",
    icon: "/assets/global/daily/hazard-labyrinth.svg",
  },
  {
    title: "Master Sorting Gauntlet",
    tag: "Syntax",
    desc: "The robot belt is rolling fast! Sort 25 space items into Food, Fuel, Cargo, and Trash boxes without any mistakes.",
    icon: "/assets/global/daily/sorting-gauntlet.svg",
  },
  {
    title: "Fuel Synthesis Protocol",
    tag: "Syntax",
    desc: "Make fuel for the rocket ship! Add drops, turn up the heat, and mix it well until the fuel turns orange.",
    icon: "/assets/global/daily/fuel-synthesis.svg",
  },
];

const getMissionDetails = (missionId: string, customMission?: any) => {
  const allMissions: Record<string, { title: string; desc: string; module: string; icon: string }> = {
    // The Moon (Tutorial)
    "moon-1": { title: "Level 1: Stellar Beginnings", desc: "Welcome to NETStart! Team up with your trusty assistant, Nova, to learn how to guide your rover safely to the goal.", module: "The Moon", icon: "/assets/planets/00_moon/environment/MainMoon.svg" },
    "moon-2": { title: "Level 2: Resource Classification", desc: "Nova needs your help packing the ship! Use your new sensors and repeat blocks to scan the assembly line. Figure out what's fuel and what's junk so we can get flying!", module: "The Moon", icon: "/assets/planets/00_moon/environment/MainMoon.svg" },
    "moon-3": { title: "Level 3: The Starship Protocol", desc: "Get the starship ready for launch! Guide air through the vents with If/Else, mix rocket fuel with loops, and survive the automated flight simulation.", module: "The Moon", icon: "/assets/planets/00_moon/environment/MainMoon.svg" },
    "1": { title: "Level 1: Stellar Beginnings", desc: "Welcome to NETStart! Team up with your trusty assistant, Nova, to learn how to guide your rover safely to the goal.", module: "The Moon", icon: "/assets/planets/00_moon/environment/MainMoon.svg" },
    "2": { title: "Level 2: Resource Classification", desc: "Nova needs your help packing the ship! Use your new sensors and repeat blocks to scan the assembly line. Figure out what's fuel and what's junk so we can get flying!", module: "The Moon", icon: "/assets/planets/00_moon/environment/MainMoon.svg" },
    "3": { title: "Level 3: The Starship Protocol", desc: "Get the starship ready for launch! Guide air through the vents with If/Else, mix rocket fuel with loops, and survive the automated flight simulation.", module: "The Moon", icon: "/assets/planets/00_moon/environment/MainMoon.svg" },
    "level-1": { title: "Level 1: Stellar Beginnings", desc: "Welcome to NETStart! Team up with your trusty assistant, Nova, to learn how to guide your rover safely to the goal.", module: "The Moon", icon: "/assets/planets/00_moon/environment/MainMoon.svg" },
    "level-2": { title: "Level 2: Resource Classification", desc: "Nova needs your help packing the ship! Use your new sensors and repeat blocks to scan the assembly line. Figure out what's fuel and what's junk so we can get flying!", module: "The Moon", icon: "/assets/planets/00_moon/environment/MainMoon.svg" },
    "level-3": { title: "Level 3: The Starship Protocol", desc: "Get the starship ready for launch! Guide air through the vents with If/Else, mix rocket fuel with loops, and survive the automated flight simulation.", module: "The Moon", icon: "/assets/planets/00_moon/environment/MainMoon.svg" },

    // Mars (HTML)
    "mars-1": { title: "Level 1: The Blank Billboard", desc: "Mark's giant space sign is completely broken! Snap your blocks together to fix the big, bold letters, and pack all the text neatly into a single box so everyone on Mars can read it.", module: "Mars (HTML)", icon: "/assets/planets/celestial/Mars.svg" },
    "mars-2": { title: "Level 2: Picture Perfect!", desc: "Emma and Penny's screens are stuck on default placeholder images! Read the clues and pick the correct pictures from your toolbox to fix them.", module: "Mars (HTML)", icon: "/assets/planets/celestial/Mars.svg" },
    "mars-3": { title: "Level 3: The Big Space Message!", desc: "The AstroLink is turned on, but Earth and Venus don't recognize us! Put all your HTML blocks together to build a friendly message that proves who we are so they will answer our call.", module: "Mars (HTML)", icon: "/assets/planets/celestial/Mars.svg" },
    "html-1": { title: "Level 1: The Blank Billboard", desc: "Mark's giant space sign is completely broken! Snap your blocks together to fix the big, bold letters, and pack all the text neatly into a single box so everyone on Mars can read it.", module: "Mars (HTML)", icon: "/assets/planets/celestial/Mars.svg" },
    "html-2": { title: "Level 2: Picture Perfect!", desc: "Emma and Penny's screens are stuck on default placeholder images! Read the clues and pick the correct pictures from your toolbox to fix them.", module: "Mars (HTML)", icon: "/assets/planets/celestial/Mars.svg" },
    "html-3": { title: "Level 3: The Big Space Message!", desc: "The AstroLink is turned on, but Earth and Venus don't recognize us! Put all your HTML blocks together to build a friendly message that proves who we are so they will answer our call.", module: "Mars (HTML)", icon: "/assets/planets/celestial/Mars.svg" },

    // Venus (CSS)
    "venus-1": { title: "Venus Level 1: Thermal Selectors & Cascades", desc: "Master targeting classes, ids, pseudo-selectors, and the CSS cascade tree.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "venus-2": { title: "Venus Level 2: Box Model Atmospheric Shields", desc: "Style border widths, margins, padding constraints, and display blocks.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "venus-3": { title: "Venus Level 3: Flexbox Gas Flow Alignment", desc: "Master flex-direction, justify-content, align-items, and responsive layouts.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "css-1": { title: "Venus Level 1: Thermal Selectors & Cascades", desc: "Master targeting classes, ids, pseudo-selectors, and the CSS cascade tree.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "css-2": { title: "Venus Level 2: Box Model Atmospheric Shields", desc: "Style border widths, margins, padding constraints, and display blocks.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "css-3": { title: "Venus Level 3: Flexbox Gas Flow Alignment", desc: "Master flex-direction, justify-content, align-items, and responsive layouts.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },

    // Mercury (JavaScript)
    "mercury-1": { title: "Mercury Level 1: Variable Orbital Bindings", desc: "Learn variables, let, const, primitive types, and math routines under solar radiation.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "mercury-2": { title: "Mercury Level 2: Solar Flare Branching Logic", desc: "Master branching structures (if-else), switch cases, and logic loops.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "mercury-3": { title: "Mercury Level 3: Velocity Function Expressions", desc: "Implement reusable function expressions, closures, and orbital scoping.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "javascript-1": { title: "Mercury Level 1: Variable Orbital Bindings", desc: "Learn variables, let, const, primitive types, and math routines under solar radiation.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "javascript-2": { title: "Mercury Level 2: Solar Flare Branching Logic", desc: "Master branching structures (if-else), switch cases, and logic loops.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "javascript-3": { title: "Mercury Level 3: Velocity Function Expressions", desc: "Implement reusable function expressions, closures, and orbital scoping.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "js-1": { title: "Mercury Level 1: Variable Orbital Bindings", desc: "Learn variables, let, const, primitive types, and math routines under solar radiation.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "js-2": { title: "Mercury Level 2: Solar Flare Branching Logic", desc: "Master branching structures (if-else), switch cases, and logic loops.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "js-3": { title: "Mercury Level 3: Velocity Function Expressions", desc: "Implement reusable function expressions, closures, and orbital scoping.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },

    // Jupiter (Java)
    "jupiter-1": { title: "Jupiter Level 1: Class & Object Blueprints", desc: "Design object-oriented classes, instance constructors, and blueprint definitions.", module: "Jupiter (Java)", icon: "/assets/planets/celestial/Jupiter.svg" },
    "jupiter-2": { title: "Jupiter Level 2: Inheritance & Planetary Subclasses", desc: "Implement superclass inheritance, method overriding, and polymorphic behaviors.", module: "Jupiter (Java)", icon: "/assets/planets/celestial/Jupiter.svg" },
    "jupiter-3": { title: "Jupiter Level 3: Encapsulation & Atmospheric Modifiers", desc: "Protect telemetry state using access modifiers (private, protected, public) and getters/setters.", module: "Jupiter (Java)", icon: "/assets/planets/celestial/Jupiter.svg" },
    "java-1": { title: "Jupiter Level 1: Class & Object Blueprints", desc: "Design object-oriented classes, instance constructors, and blueprint definitions.", module: "Jupiter (Java)", icon: "/assets/planets/celestial/Jupiter.svg" },
    "java-2": { title: "Jupiter Level 2: Inheritance & Planetary Subclasses", desc: "Implement superclass inheritance, method overriding, and polymorphic behaviors.", module: "Jupiter (Java)", icon: "/assets/planets/celestial/Jupiter.svg" },
    "java-3": { title: "Jupiter Level 3: Encapsulation & Atmospheric Modifiers", desc: "Protect telemetry state using access modifiers (private, protected, public) and getters/setters.", module: "Jupiter (Java)", icon: "/assets/planets/celestial/Jupiter.svg" },

    // Saturn (C++)
    "saturn-1": { title: "Saturn Level 1: Ring Pointers & References", desc: "Master direct memory addresses, pointer arithmetic, and reference passing.", module: "Saturn (C++)", icon: "/assets/planets/celestial/Saturn.svg" },
    "saturn-2": { title: "Saturn Level 2: Dynamic Ring Memory Allocation", desc: "Manage heap memory allocations using new/delete and prevent zero-g memory leaks.", module: "Saturn (C++)", icon: "/assets/planets/celestial/Saturn.svg" },
    "saturn-3": { title: "Saturn Level 3: Structural Vectors & Ring Buffers", desc: "Build high-speed data structures and contiguous ring buffers using C++ STL vectors.", module: "Saturn (C++)", icon: "/assets/planets/celestial/Saturn.svg" },
    "cpp-1": { title: "Saturn Level 1: Ring Pointers & References", desc: "Master direct memory addresses, pointer arithmetic, and reference passing.", module: "Saturn (C++)", icon: "/assets/planets/celestial/Saturn.svg" },
    "cpp-2": { title: "Saturn Level 2: Dynamic Ring Memory Allocation", desc: "Manage heap memory allocations using new/delete and prevent zero-g memory leaks.", module: "Saturn (C++)", icon: "/assets/planets/celestial/Saturn.svg" },
    "cpp-3": { title: "Saturn Level 3: Structural Vectors & Ring Buffers", desc: "Build high-speed data structures and contiguous ring buffers using C++ STL vectors.", module: "Saturn (C++)", icon: "/assets/planets/celestial/Saturn.svg" },

    // Earth (Python)
    "earth-1": { title: "Earth Level 1: Telemetry Data Structures", desc: "Master Python lists, dictionaries, tuples, sets, and data slicing at Headquarters.", module: "Earth (Python)", icon: "/assets/planets/celestial/Earth.svg" },
    "earth-2": { title: "Earth Level 2: Satellite Pipeline Loops & Comprehensions", desc: "Process real-time telemetry streams using list comprehensions and iterative generators.", module: "Earth (Python)", icon: "/assets/planets/celestial/Earth.svg" },
    "earth-3": { title: "Earth Level 3: Mission Log File Automation", desc: "Automate reading and writing mission logs using Python context managers (with open).", module: "Earth (Python)", icon: "/assets/planets/celestial/Earth.svg" },
    "python-1": { title: "Earth Level 1: Telemetry Data Structures", desc: "Master Python lists, dictionaries, tuples, sets, and data slicing at Headquarters.", module: "Earth (Python)", icon: "/assets/planets/celestial/Earth.svg" },
    "python-2": { title: "Earth Level 2: Satellite Pipeline Loops & Comprehensions", desc: "Process real-time telemetry streams using list comprehensions and iterative generators.", module: "Earth (Python)", icon: "/assets/planets/celestial/Earth.svg" },
    "python-3": { title: "Earth Level 3: Mission Log File Automation", desc: "Automate reading and writing mission logs using Python context managers (with open).", module: "Earth (Python)", icon: "/assets/planets/celestial/Earth.svg" },
  };

  const key = (missionId || "").toLowerCase();

  // If customMission has a non-generic title and desc, prioritize it
  if (customMission?.title && customMission.title !== "Daily Mission Level" && customMission.title !== "Daily Level" && !customMission.title.startsWith("Mission ")) {
    return {
      title: customMission.title,
      desc: customMission.desc || (allMissions[key]?.desc ?? "Complete objectives and guide your rover or starship safely through the mission challenges."),
      module: customMission.module || allMissions[key]?.module || (key.startsWith("daily") ? "Daily Challenge" : "Space Mission"),
      icon: customMission.icon || allMissions[key]?.icon || (key.startsWith("daily") ? "/assets/global/daily/weave-trap.svg" : "/assets/planets/00_moon/environment/MainMoon.svg")
    };
  }

  // Daily level calculation using deterministic date hash
  if (key.startsWith("daily") || key.includes("daily")) {
    if (key === 'daily-1' || key === 'daily-weave-trap' || key.includes('weave')) {
      return { ...DAILY_LEVEL_POOL[0], module: "Daily Challenge" };
    }
    if (key === 'daily-2' || key === 'daily-lane-changer' || key.includes('lane')) {
      return { ...DAILY_LEVEL_POOL[1], module: "Daily Challenge" };
    }
    if (key === 'daily-3' || key === 'daily-hazard-labyrinth' || key.includes('hazard') || key.includes('labyrinth')) {
      return { ...DAILY_LEVEL_POOL[2], module: "Daily Challenge" };
    }
    if (key === 'daily-4' || key === 'daily-conveyor-gauntlet' || key.includes('conveyor') || key.includes('gauntlet')) {
      return { ...DAILY_LEVEL_POOL[3], module: "Daily Challenge" };
    }
    if (key === 'daily-5' || key === 'daily-fuel-synthesis' || key.includes('fuel-synth') || key.includes('synthesis')) {
      return { ...DAILY_LEVEL_POOL[4], module: "Daily Challenge" };
    }

    const dateMatch = key.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    let seed = 0;
    if (dateMatch) {
      const y = parseInt(dateMatch[1], 10);
      const mo = parseInt(dateMatch[2], 10);
      const d = parseInt(dateMatch[3], 10);
      seed = (y * 372) + (mo * 31) + d;
    } else {
      const now = new Date();
      seed = (now.getFullYear() * 372) + ((now.getMonth() + 1) * 31) + now.getDate();
    }
    const poolItem = DAILY_LEVEL_POOL[Math.abs(seed) % DAILY_LEVEL_POOL.length];
    return {
      title: poolItem.title,
      desc: poolItem.desc,
      module: "Daily Challenge",
      icon: poolItem.icon
    };
  }

  return allMissions[key] || {
    title: key.startsWith('moon') ? `The Moon: Level ${key.split('-')[1] || '1'}` : `Mission ${missionId}`,
    desc: "Complete objectives and guide your rover or starship safely through the mission challenges.",
    module: key.startsWith('moon') ? "The Moon" : key.startsWith('mars') ? "Mars (HTML)" : key.startsWith('venus') ? "Venus (CSS)" : key.startsWith('mercury') ? "Mercury (JavaScript)" : key.startsWith('jupiter') ? "Jupiter (Java)" : key.startsWith('saturn') ? "Saturn (C++)" : key.startsWith('earth') ? "Earth (Python)" : "Space Mission",
    icon: key.startsWith('moon') ? "/assets/planets/00_moon/environment/MainMoon.svg" : key.startsWith('mars') ? "/assets/planets/celestial/Mars.svg" : key.startsWith('venus') ? "/assets/planets/celestial/Venus.svg" : key.startsWith('mercury') ? "/assets/planets/celestial/Mercury.svg" : key.startsWith('jupiter') ? "/assets/planets/celestial/Jupiter.svg" : key.startsWith('saturn') ? "/assets/planets/celestial/Saturn.svg" : key.startsWith('earth') ? "/assets/planets/celestial/Earth.svg" : "/assets/planets/00_moon/environment/MainMoon.svg"
  };
};

const getRelativeTimeString = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // State
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbAchievements, setDbAchievements] = useState<any[]>([]);
  const [ongoingMissions, setOngoingMissions] = useState<any[]>([]);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ displayName: '', status: '', bio: '' });
  const [activeTitle, setActiveTitle] = useState('Novice Explorer');
  const [saving, setSaving] = useState(false);

  // Badges & Modal State
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [unlockedDates, setUnlockedDates] = useState<Record<string, string>>({});

  const [statsTab, setStatsTab] = useState<'overview' | 'progress'>('overview');
  const [xp, setXp] = useState(0);

  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImageSrc(reader.result?.toString() || '');
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCropSave = async (base64String: string) => {
    setProfile((prev: any) => ({ ...prev, image: base64String }));
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String })
      });
      if (!res.ok) {
        console.error('Failed to save avatar');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Compute earned & unlocked titles based on progression, achievements, and level
  const availableTitles = useMemo(() => {
    const userLvl = getXPDetails(xp).level;
    const unlockedBadges = dbAchievements.filter(a => unlockedDates[a.triggerCode?.toUpperCase()] || unlockedDates[a.id]);
    const triggerCodes = new Set(unlockedBadges.map(a => a.triggerCode?.toUpperCase()));

    const titles = new Set<string>();

    // Starter titles
    titles.add("Novice Explorer");
    titles.add("Space Cadet");

    // Level Progression Titles (Unlocked as player levels up)
    if (userLvl >= 2) titles.add("Astro Trainee");
    if (userLvl >= 3) titles.add("Cosmic Navigator");
    if (userLvl >= 4) titles.add("Orbital Specialist");
    if (userLvl >= 5 || triggerCodes.has("B_REACH_LVL5")) titles.add("Solar Pioneer");
    if (userLvl >= 6) titles.add("Quantum Coder");
    if (userLvl >= 7) titles.add("Galactic Engineer");
    if (userLvl >= 8) titles.add("Starship Commander");
    if (userLvl >= 9) titles.add("Deep Space Voyager");
    if (userLvl >= 10 || triggerCodes.has("B_REACH_LVL10")) titles.add("Grand Celestial Architect");

    // Achievement & Milestone Titles
    if (profile?.isVerified || triggerCodes.has("B_VERIFY_ACCOUNT")) titles.add("Certified Astronaut");
    if (profile?.hasTakenAptitudeTest || triggerCodes.has("B_APTITUDE_TEST")) titles.add("Logic Prodigy");
    if (triggerCodes.has("B_FIRST_MISSION")) titles.add("Mission Specialist");
    if (triggerCodes.has("B_FIRST_PLANET")) titles.add("Planetary Pioneer");
    if (triggerCodes.has("B_BUY_REWARD")) titles.add("Cosmic Collector");
    if (triggerCodes.has("B_CHANGE_PFP") || triggerCodes.has("B_CHANGE_BG")) titles.add("Starship Decorator");

    // Always preserve currently assigned title
    if (profile?.activeTitle) titles.add(profile.activeTitle);
    if (profile?.title) titles.add(profile.title);
    if (activeTitle) titles.add(activeTitle);

    return Array.from(titles);
  }, [xp, dbAchievements, unlockedDates, profile, activeTitle]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user) {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/profile?t=${Date.now()}`);
      const data = await res.json();

      const achievementsRes = await getUnlockedAchievements();

      if (res.ok) {
        setProfile(data.user);
        setXp(data.user.xp || 0);
        setCompletedMissionIds(data.completedMissionIds || []);
        let ongoing = data.missionProgress || [];
        const userId = data.user.id;
        if (typeof window !== 'undefined' && userId) {
          try {
            const rawSaved = getUserStorageItem('active_saved_level', userId);
            const rawActive = getUserStorageItem('active_level', userId);
            let savedObj: any = null;
            let activeObj: any = null;
            if (rawSaved) {
              try {
                const parsed = JSON.parse(rawSaved);
                if (parsed.missionId) {
                  savedObj = {
                    id: 'active-session',
                    missionId: parsed.missionId,
                    title: parsed.title,
                    desc: parsed.desc,
                    sectionIndex: parsed.sectionIndex,
                    startedAt: parsed.timestamp ? new Date(parsed.timestamp).toISOString() : new Date().toISOString(),
                    timeVal: parsed.timestamp ? Number(parsed.timestamp) : 0
                  };
                }
              } catch (e) { }
            }
            if (rawActive) {
              try {
                const parsed = JSON.parse(rawActive);
                if (parsed.missionId) {
                  const t = parsed.startedAt ? new Date(parsed.startedAt).getTime() : 0;
                  activeObj = {
                    id: 'active-session',
                    missionId: parsed.missionId,
                    title: parsed.title,
                    desc: parsed.desc,
                    module: parsed.module,
                    icon: parsed.icon,
                    startedAt: parsed.startedAt || new Date().toISOString(),
                    timeVal: t
                  };
                }
              } catch (e) { }
            }

            let activeFromLocal: any = null;
            if (savedObj && activeObj) {
              activeFromLocal = (savedObj.timeVal >= activeObj.timeVal) ? savedObj : activeObj;
            } else {
              activeFromLocal = savedObj || activeObj;
            }

            if (activeFromLocal) {
              ongoing = [activeFromLocal];
            }
          } catch (e) {
            console.warn("Could not parse active level from user storage:", e);
          }
        }
        setOngoingMissions(ongoing);
        setFormData({
          displayName: data.user.displayName || data.user.name || '',
          status: data.user.status || '',
          bio: data.user.bio || ''
        });
        setActiveTitle(data.user.activeTitle || data.user.title || 'Novice Explorer');
      }
      if (achievementsRes.success) {
        setDbAchievements(achievementsRes.allDbAchievements || []);
        const datesMap: Record<string, string> = {};
        achievementsRes.userAchievementsDetails?.forEach((ua: any) => {
          if (ua.triggerCode) datesMap[ua.triggerCode.toUpperCase()] = ua.unlockedAt;
          if (ua.achievementId) datesMap[ua.achievementId] = ua.unlockedAt;
        });
        setUnlockedDates(datesMap);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleBadge = async (badgeId: string) => {
    if (!profile) return;
    const showcased = profile.showcasedBadges || [];
    const isAdding = !showcased.includes(badgeId);
    if (isAdding && showcased.length >= 6) {
      showToast('Showcase Full! Remove a badge first.');
      return;
    }

    const newBadges = isAdding
      ? [...showcased, badgeId]
      : showcased.filter((id: string) => id !== badgeId);

    setProfile((prev: any) => ({ ...prev, showcasedBadges: newBadges }));
    showToast(isAdding ? 'Added to Showcase!' : 'Removed from Showcase!');

    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showcasedBadges: newBadges })
      });
    } catch (e) {
      console.error(e);
    }
  };



  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: formData.displayName.trim(),
          bio: formData.bio,
          activeTitle: activeTitle
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setProfile(data.user);
        setIsEditing(false);
        showToast('Profile updated successfully!');
        await update({
          displayName: data.user?.displayName,
          activeTitle: data.user?.activeTitle
        });
      } else {
        showToast(data.error || 'Failed to update profile');
      }
    } catch (e: any) {
      console.error(e);
      showToast('Network error updating profile');
    } finally {
      setSaving(false);
    }
  };


  if (loading || status === 'loading') {
    return (
      <main className="flex-1 flex flex-col z-10 w-full h-full overflow-hidden bg-[#270d3c]">
        <TopHeader title="Profile" />
        <div className="flex-1 flex items-center justify-center p-6">
          <SpaceLoader text="loading..." />
        </div>
      </main>
    );
  }

  const joinedDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'UNKNOWN';

  return (
    <main className="flex-1 flex flex-col z-10 w-full h-full overflow-hidden bg-[#270d3c]">
      <DailyTaskTracker taskIds={["task-achieve-2"]} />
      <TopHeader title="Profile" />
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 pr-10 lg:pr-16 no-scrollbar @container">

        <div className="max-w-7xl mx-auto w-full flex flex-col gap-10">

          {/* TOP ROW: Identification Card (Left) & Level + Achievements (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.75fr_1fr] gap-10 items-stretch">

            {/* IDENTIFICATION CARD */}
            <div className="relative group/id-card flex flex-col h-full">
              {/* Shaded background depth layer */}
              <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/id-card:translate-x-3 group-hover/id-card:translate-y-3" />

              <div className="relative z-10 border-2 border-[#ff912d] rounded-3xl p-6 @2xl:p-8 overflow-hidden bg-[#361d57] shadow-xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between">
                {/* Background Watermark Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] opacity-5 pointer-events-none z-0">
                  <Image src="/assets/global/badges/NETStartIcon.png" alt="NETStart Badge" fill className="object-contain" />
                </div>

                <div className="relative z-10 flex flex-col gap-6 h-full justify-between">
                  {/* Card Header: Title on Left, Edit Controls on Right */}
                  <div className="flex justify-between items-center pb-2 border-b border-[#ff912d]/30 shrink-0">
                    <h2 className={`${vt323.className} font-bold text-[#ff912d] text-2xl tracking-[0.2em] uppercase`}>
                      Identification Card
                    </h2>

                    {!isEditing ? (
                      <button
                        onClick={() => {
                          setFormData({
                            displayName: profile?.displayName || profile?.name || '',
                            status: profile?.status || '',
                            bio: profile?.bio || ''
                          });
                          setActiveTitle(profile?.activeTitle || profile?.title || 'Novice Explorer');
                          setIsEditing(true);
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold py-1.5 px-5 text-sm rounded-full cursor-pointer transition-all border border-white/10 flex items-center gap-2 active:scale-95 whitespace-nowrap shadow-sm hover:border-[#ff912d]/50"
                      >
                        <svg className="w-4 h-4 text-[#ff912d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({ displayName: profile?.displayName || profile?.name || '', status: profile?.status || '', bio: profile?.bio || '' });
                            setActiveTitle(profile?.activeTitle || profile?.title || 'Novice Explorer');
                          }}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-1.5 px-4 text-xs rounded-full cursor-pointer transition-colors border border-red-500/30 active:scale-95 whitespace-nowrap"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateProfile}
                          disabled={saving}
                          className="bg-[#ff912d] hover:bg-[#ff912d]/80 text-black font-bold py-1.5 px-5 text-xs rounded-full cursor-pointer transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Two-Column Dossier Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] @2xl:grid-cols-[280px_1fr] gap-6 items-stretch flex-1">
                    {/* Zone 1: The Identity Panel (Left Column) */}
                    <div className="flex flex-col items-center justify-center text-center p-5 sm:p-6 bg-black/30 border border-[#ff912d]/25 rounded-2xl relative shadow-inner h-full">
                      {/* Avatar with Circular Frame and Glowing Border */}
                      <div 
                        onClick={() => isEditing && fileInputRef.current?.click()}
                        className={`w-36 h-36 sm:w-40 sm:h-40 @2xl:w-44 @2xl:h-44 rounded-full border-4 border-[#ff912d] shadow-[0_0_25px_rgba(255,145,45,0.4)] relative overflow-hidden flex items-center justify-center bg-[#1e0a2d] group/avatar shrink-0 ${isEditing ? 'cursor-pointer' : ''}`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden">
                          {profile?.image ? (
                            <Image
                              src={profile.image === '/assets/planets/celestial/Planet 1.svg' ? '/assets/global/badges/Profile.svg' : profile.image}
                              alt="Avatar"
                              fill
                              className="object-cover rounded-full"
                            />
                          ) : (
                            <Image
                              src="/assets/global/badges/Profile.svg"
                              alt="Avatar"
                              fill
                              className="object-cover rounded-full"
                            />
                          )}
                        </div>

                        {isEditing && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white/90 opacity-0 group-hover/avatar:opacity-100 transition-opacity z-10">
                            <svg className="w-6 h-6 mb-1 text-[#ff912d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                          </div>
                        )}
                      </div>

                      {/* Display Name */}
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                          className="text-xl font-black text-white text-center bg-transparent border-b-2 border-[#ff912d]/60 focus:border-[#ff912d] outline-none w-full max-w-[220px] mt-3 px-1 py-0.5 tracking-wide focus:bg-white/[0.05] rounded-t transition-all"
                          placeholder="Explorer Name"
                        />
                      ) : (
                        <h3 className="text-xl font-black text-white tracking-wide mt-3 truncate max-w-full drop-shadow-md">
                          {profile?.displayName || profile?.name || 'Explorer'}
                        </h3>
                      )}

                      {/* Earned Rank / Title Badge */}
                      {isEditing ? (
                        <div className="mt-2.5 relative inline-flex items-center">
                          <div className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-[#1e0a2d] border border-[#ff912d] text-[#ff912d] shadow-[0_0_14px_rgba(255,145,45,0.35)] relative cursor-pointer hover:border-[#ff912d]/80 transition-all">
                            <svg className="w-3.5 h-3.5 text-[#ff912d] shrink-0 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                            <select
                              value={activeTitle}
                              onChange={e => setActiveTitle(e.target.value)}
                              className="bg-transparent text-xs font-bold uppercase tracking-wider text-[#ff912d] outline-none cursor-pointer pr-5 appearance-none text-center max-w-[200px] truncate"
                            >
                              {availableTitles.map(t => (
                                <option key={t} value={t} className="bg-[#1e0a2d] text-white py-1">
                                  {t}
                                </option>
                              ))}
                            </select>
                            <svg className="w-3 h-3 text-[#ff912d] pointer-events-none absolute right-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ff912d]/15 border border-[#ff912d]/50 text-[#ff912d] shadow-[0_0_12px_rgba(255,145,45,0.25)]">
                          <svg className="w-3.5 h-3.5 text-[#ff912d] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                          <span className="font-bold text-xs uppercase tracking-widest truncate">
                            {profile?.activeTitle || profile?.title || 'Novice Explorer'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Zone 2: The Data Terminal (Right Column) */}
                    <div className="flex-1 flex flex-col gap-2.5 h-full">
                      {/* Username and Joined Date */}
                      <div className="px-1 shrink-0 flex flex-col gap-1.5">
                        <span className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-normal drop-shadow-md">
                          @{profile?.name || profile?.username || 'explorer'}
                        </span>
                        <p className="text-xs text-white/40 tracking-wider">
                          Joined on <span className="text-white/70 font-semibold">{joinedDate}</span>
                        </p>
                      </div>

                      {/* About Me Container (Expands to fill remaining height) */}
                      <div className="flex-1 flex flex-col gap-2.5 bg-black/35 border border-[#ff912d]/30 rounded-2xl p-4 shadow-inner backdrop-blur-sm relative overflow-hidden">
                        {/* Section Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-2 shrink-0">
                          <span className={`${vt323.className} font-bold text-[#ff912d] text-lg sm:text-xl tracking-[0.15em] uppercase`}>
                            About Me
                          </span>
                        </div>

                        {/* Bio Content Screen */}
                        <div className="flex-1 flex flex-col min-h-0">
                          {isEditing ? (
                            <textarea
                              value={formData.bio}
                              onChange={e => setFormData({ ...formData, bio: e.target.value })}
                              className="flex-1 w-full min-h-[110px] bg-white/[0.06] hover:bg-white/[0.08] focus:bg-white/[0.1] text-white font-medium p-3 rounded-xl border border-[#ff912d]/50 focus:border-[#ff912d] focus:ring-1 focus:ring-[#ff912d] outline-none shadow-inner resize-none text-xs sm:text-sm leading-relaxed"
                              placeholder="Tell us about yourself..."
                            />
                          ) : (
                            <div className="flex-1 w-full min-h-[110px] bg-[#1e0a2d]/40 text-white/90 text-xs sm:text-sm font-medium leading-relaxed p-3.5 rounded-xl border border-white/5 shadow-inner overflow-y-auto whitespace-pre-wrap">
                              {profile?.bio || 'An aspiring NETStart explorer traversing the cosmic web constellations.'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT TOP GROUP: Level & XP Bar + Achievements */}
            <div className="flex flex-col gap-6 h-full justify-between min-w-0">
              {/* Level Text & XP Bar */}
              <div className="flex items-center gap-4 shrink-0">
                {/* Dynamic SVG Level Badge */}
                <div className="relative w-16 h-16 shrink-0 z-10 flex items-center justify-center rounded-full bg-[#1e0a2d]">
                  <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#361d57" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="46" fill="none" stroke="#ff912d" strokeWidth="8"
                      strokeDasharray="289" strokeDashoffset={289 - (289 * Math.max(2, getXPDetails(xp).progress)) / 100}
                      strokeLinecap="round" className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="w-12 h-12 bg-[#1e0a2d] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#1e0a2d] z-10 relative shadow-inner">
                    <span className={`${vt323.className} text-[#ff912d] text-3xl font-bold mt-1`}>{getXPDetails(xp).level}</span>
                  </div>
                </div>

                {/* Level Text & XP Bar */}
                <div className="flex flex-col flex-1 gap-2">
                  <div className="flex justify-between items-end">
                    <h3 className="text-white text-lg font-bold uppercase tracking-wider">Level {getXPDetails(xp).level}</h3>
                    <span className="text-[#ff912d] text-xs font-bold uppercase">
                      {getXPDetails(xp).isMaxLevel
                        ? `${xp.toLocaleString()} XP (Level 10 - MAX)`
                        : `${getXPDetails(xp).levelCurrentXp} / ${getXPDetails(xp).levelRequiredXp} XP (Level ${getXPDetails(xp).level + 1})`}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-orange-600 to-[#ff912d] rounded-full relative transition-all duration-1000 ease-out"
                      style={{ width: `${Math.max(2, getXPDetails(xp).progress)}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progressStripes_2s_linear_infinite]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACHIEVEMENTS CARD */}
              <div className="relative group/ach-card flex-1 flex flex-col h-full">
                {/* Shaded background depth layer */}
                <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/ach-card:translate-x-3 group-hover/ach-card:translate-y-3" />

                <div className="relative z-10 flex flex-col flex-1 justify-between gap-4 bg-[#361d57] border-2 border-[#ff912d]/50 p-6 rounded-3xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 shadow-xl h-full">
                  <div className="flex justify-between items-center border border-[#ff912d]/50 p-3 bg-[#361d57]/60 rounded-xl shrink-0">
                    <div className="w-24 shrink-0"></div>
                    <h2 className={`${vt323.className} font-bold text-[#ff912d] text-2xl tracking-[0.2em] uppercase text-center flex-1`}>Achievements</h2>
                    <div className="w-24 shrink-0 flex justify-end"></div>
                  </div>

                  <div className="border border-[#ff912d]/30 bg-black/20 rounded-xl p-5 relative flex-1 flex flex-col justify-between gap-4 shadow-inner">
                    <div className="grid grid-cols-3 place-items-center gap-4 sm:gap-5 max-w-[280px] mx-auto my-auto">
                      {Array.from({ length: 6 }).map((_, i) => {
                        const badgeId = profile?.showcasedBadges?.[i];
                        const baseBadge = badgeId ? allBadges.find(b => b.id === badgeId) : null;
                        const triggerCode = badgeId ? badgeId.toUpperCase() : '';
                        const dbData = badgeId ? dbAchievements.find(a => a.triggerCode === triggerCode || a.id === badgeId) : null;

                        if (baseBadge || dbData) {
                          const badge = {
                            id: badgeId,
                            name: dbData?.name || baseBadge?.name || 'Achievement',
                            description: dbData?.description || baseBadge?.description || '',
                            xpReward: dbData?.xpReward || baseBadge?.xpReward || 100,
                            gearsReward: dbData?.gearsReward || 0,
                            icon: dbData?.iconUrl || baseBadge?.icon || '🏆',
                            image: dbData?.iconUrl || baseBadge?.image,
                          };

                          return (
                            <div
                              key={i}
                              onClick={() => setSelectedBadge({ ...badge, isUnlocked: true, unlockedAt: unlockedDates[triggerCode] || unlockedDates[badgeId!] })}
                              className="group relative w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-2 border-[#ff912d]/60 shadow-[0_0_12px_rgba(255,145,45,0.25)] rounded-full flex items-center justify-center cursor-pointer hover:border-[#ff912d] hover:bg-[#ff912d]/20 transition-all hover:shadow-[0_0_20px_rgba(255,145,45,0.5)] overflow-visible"
                            >
                              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                                {badge.image ? (
                                  <img src={badge.image} alt={badge.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  <span className="text-[#ff912d] font-bold text-2xl">{badge.icon}</span>
                                )}
                              </div>
                              <div className="absolute bottom-[110%] left-1/2 -translate-x-1/2 hidden group-hover:block w-max max-w-[220px] bg-black/90 text-white text-xs p-3 rounded-lg border border-[#ff912d]/50 z-[9999] text-center shadow-2xl pointer-events-none">
                                <strong className="block text-[#ff912d] text-sm mb-1 uppercase tracking-wider">"{badge.name}"</strong>
                                <span className="text-white/70 block mt-1">{badge.description || "Achievement unlocked! You've mastered this skill in the NETStart galaxy."}</span>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={i} className="w-16 h-16 border-2 border-white/10 border-dashed rounded-full flex items-center justify-center bg-white/5 opacity-50 cursor-not-allowed">
                            <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12"></path></svg>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-center shrink-0">
                      <Link href="/achievements" className="text-white/50 hover:text-[#ff912d] text-xs uppercase tracking-widest transition-colors font-bold flex items-center gap-2">
                        View All Badges
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: Profile Statistics (Left) & Ongoing Missions (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.75fr_1fr] gap-10 items-stretch">
            {/* PASSPORT STATISTICS CARD */}
            <div className="relative group/stats-card flex flex-col h-full">
              <PassportStatsCard profile={profile} completedMissionIds={completedMissionIds} />
            </div>

            {/* ONGOING MISSIONS */}
            <div className="relative group/ongoing-card flex flex-col h-full min-w-0">
              {/* Shaded background depth layer */}
              <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/ongoing-card:translate-x-3 group-hover/ongoing-card:translate-y-3" />

              <div className="relative z-10 flex flex-col flex-1 h-full justify-between gap-4 bg-[#361d57] border-2 border-[#ff912d]/50 p-6 rounded-3xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 shadow-xl">
                {/* Title Box */}
                <div className="border border-[#ff912d]/50 p-3 bg-[#361d57]/60 text-center rounded-xl shrink-0">
                  <h2 className={`${vt323.className} font-bold text-[#ff912d] text-2xl tracking-[0.2em] uppercase`}>Ongoing Missions</h2>
                </div>

                <div className="flex flex-col flex-1 justify-between gap-4">
                  {ongoingMissions.length === 0 ? (
                    <div className="relative group/m-card flex flex-col flex-1 h-full">
                      <div className="absolute inset-0 bg-[#090311]/75 rounded-xl translate-x-2 translate-y-2 z-0" />
                      <div className="relative z-10 border-2 border-dashed border-[#ff912d]/30 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-4 bg-black/20 min-h-[168px] flex-1 h-full">
                        <p className="text-gray-400 text-sm font-semibold">No ongoing missions found.</p>
                        <Link href="/modules" className="px-6 py-2.5 bg-[#ff912d] hover:bg-[#ff912d]/80 text-black font-bold rounded-lg text-xs transition-all active:scale-95 shadow-md">
                          View Mission Map
                        </Link>
                      </div>
                    </div>
                  ) : (
                    ongoingMissions.slice(0, 1).map((mission) => {
                      const details = getMissionDetails(mission.missionId, mission);
                      const timeStr = getRelativeTimeString(mission.startedAt);
                      const resumeHref = mission.missionId.startsWith('daily')
                        ? `/sandbox?mode=daily&missionId=${mission.missionId}`
                        : `/sandbox?missionId=${mission.missionId}`;

                      return (
                        <div key={mission.id} className="relative group/m-card flex flex-col flex-1 h-full">
                          {/* Shaded background depth layer */}
                          <div className="absolute inset-0 bg-[#090311]/75 rounded-xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/m-card:translate-x-3 group-hover/m-card:translate-y-3" />

                          <div className="relative z-10 border-2 border-[#ff912d]/50 rounded-xl overflow-hidden shadow-xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between bg-black/40 min-h-[168px] flex-1 h-full">
                            <div className="flex-1 min-h-[5rem] bg-black relative border-b border-[#ff912d]/30 overflow-hidden flex items-center justify-center w-full">
                              <Image src="/assets/global/ui/login-bg-hq.jpg" alt="Mission Background" fill className="object-cover opacity-50 group-hover/m-card:opacity-70 transition-opacity duration-700 group-hover/m-card:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                            </div>

                            <div className="p-4 flex flex-col gap-2 shrink-0 bg-black/40">
                              <div className="flex justify-between items-center w-full">
                                <h3 className="text-white font-bold text-sm leading-tight truncate mr-2">{details.title}</h3>
                                <span className="text-[#ff912d] text-[10px] uppercase font-bold tracking-widest bg-[#ff912d]/10 px-2 py-1 rounded border border-[#ff912d]/20 shrink-0">{timeStr}</span>
                              </div>

                              <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-2">
                                {details.desc}
                              </p>

                              <div className="flex justify-between items-center pt-3 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                  <div className="w-6.5 h-6.5 rounded-full bg-[#1e0a2d] border border-white/20 flex items-center justify-center">
                                    <Image src={details.icon} alt="Icon" width={14} height={14} />
                                  </div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{details.module}</span>
                                </div>
                                <Link href={resumeHref} className="bg-[#ff912d] text-black font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-[#ff912d]/80 transition-all cursor-pointer shadow-sm active:scale-95 text-center">
                                  Resume
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        imageSrc={cropImageSrc}
        aspect={1}
        title="Crop your Avatar"
        onSave={handleCropSave}
      />

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e0a2d] border border-[#ff912d]/50 rounded-2xl p-8 max-w-2xl w-full relative flex flex-col md:flex-row gap-8 items-center text-center md:text-left shadow-[0_0_40px_rgba(255,145,45,0.2)]">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            {/* Badge Icon */}
            <div className="w-32 h-32 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-2 border-[#ff912d]/50 flex items-center justify-center shadow-lg overflow-hidden p-2">
              {selectedBadge.image ? (
                <img src={selectedBadge.image} alt={selectedBadge.name} className="w-28 h-28 object-contain" />
              ) : (
                <span className="text-[#ff912d] font-bold text-5xl">{selectedBadge.icon}</span>
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 items-center md:items-start w-full">
              {/* Badge Name */}
              <h3 className={`${vt323.className} text-[#ff912d] text-4xl mb-2 tracking-wider`}>"{selectedBadge.name}"</h3>

              <div className="flex items-center gap-3 mb-3 flex-wrap justify-center md:justify-start">
                <div className="bg-[#270d3c] border border-[#ff912d]/50 text-[#ff912d] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  +{selectedBadge.xpReward || 100} EXP
                </div>
                {selectedBadge.gearsReward > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-900 text-purple-200 text-xs font-bold border border-purple-700">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    +{selectedBadge.gearsReward} GEARS
                  </div>
                )}
                {selectedBadge.unlockedAt && (
                  <div className="bg-black/40 border border-white/10 text-white/60 text-xs px-3 py-1 rounded-full">
                    Unlocked: {new Date(selectedBadge.unlockedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-white/60 text-sm mb-6 max-w-md">
                {selectedBadge.description || "Achievement unlocked! You've mastered this skill in the NETStart galaxy."}
              </p>

              {/* Action Button */}
              <button
                onClick={() => {
                  handleToggleBadge(selectedBadge.id);
                  setSelectedBadge(null);
                }}
                disabled={!profile?.showcasedBadges?.includes(selectedBadge.id) && (profile?.showcasedBadges?.length || 0) >= 6}
                className={`font-bold py-3 px-8 rounded-full w-full md:w-auto transition-colors cursor-pointer active:scale-95 ${profile?.showcasedBadges?.includes(selectedBadge.id)
                  ? 'bg-[#ff912d] hover:bg-[#ff912d]/80 text-black'
                  : (profile?.showcasedBadges?.length || 0) >= 6
                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-[#ff912d] hover:bg-[#ff912d]/80 text-black'
                  }`}
              >
                {profile?.showcasedBadges?.includes(selectedBadge.id)
                  ? 'Remove from Showcase'
                  : (profile?.showcasedBadges?.length || 0) >= 6
                    ? 'Showcase Full'
                    : 'Add to Showcase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#361d57] border-2 border-[#ff912d] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff912d] animate-pulse" />
          <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
