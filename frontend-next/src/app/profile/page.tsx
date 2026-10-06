"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { VT323 } from 'next/font/google';
import TopHeader from '@/components/TopHeader';
import { Check, X, ChevronDown } from 'lucide-react';
import { allBadges } from '@/lib/badgesData';
import { getXPDetails } from '@/lib/leveling';
import { getUnlockedAchievements } from '@/app/actions/achievements';
import SpaceLoader from '@/components/SpaceLoader';
import DailyTaskTracker from '@/components/DailyTaskTracker';
import { getUserStorageItem } from '@/lib/userStorage';
import { getUserInventory } from '@/app/actions/shop';
import { getBorderScale } from '@/lib/shopCatalog';

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

const normalizeMissionKey = (rawId: string): string => {
  const k = (rawId || "").toLowerCase().trim();
  if (k === 'moon-1' || k === '1' || k === 'level-1' || k === 'html-1') return 'moon-1';
  if (k === 'moon-2' || k === '2' || k === 'level-2' || k === 'html-2') return 'moon-2';
  if (k === 'moon-3' || k === '3' || k === 'level-3' || k === 'html-3') return 'moon-3';
  if (k.includes('mars')) {
    if (k.includes('1')) return 'mars-1';
    if (k.includes('2')) return 'mars-2';
    if (k.includes('3')) return 'mars-3';
  }
  if (k.includes('venus') || k.includes('css')) {
    if (k.includes('1')) return 'venus-1';
    if (k.includes('2')) return 'venus-2';
    if (k.includes('3')) return 'venus-3';
  }
  if (k.includes('mercury') || k.includes('js') || k.includes('javascript')) {
    if (k.includes('1')) return 'mercury-1';
    if (k.includes('2')) return 'mercury-2';
    if (k.includes('3')) return 'mercury-3';
  }
  if (k.includes('jupiter') || k.includes('java')) {
    if (k.includes('1')) return 'jupiter-1';
    if (k.includes('2')) return 'jupiter-2';
    if (k.includes('3')) return 'jupiter-3';
  }
  if (k.includes('saturn') || k.includes('cpp')) {
    if (k.includes('1')) return 'saturn-1';
    if (k.includes('2')) return 'saturn-2';
    if (k.includes('3')) return 'saturn-3';
  }
  if (k.includes('earth') || k.includes('python')) {
    if (k.includes('1')) return 'earth-1';
    if (k.includes('2')) return 'earth-2';
    if (k.includes('3')) return 'earth-3';
  }
  return k;
};

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
    "html-1-mars": { title: "Level 1: The Blank Billboard", desc: "Mark's giant space sign is completely broken! Snap your blocks together to fix the big, bold letters, and pack all the text neatly into a single box so everyone on Mars can read it.", module: "Mars (HTML)", icon: "/assets/planets/celestial/Mars.svg" },
    "html-2-mars": { title: "Level 2: Picture Perfect!", desc: "Emma and Penny's screens are stuck on default placeholder images! Read the clues and pick the correct pictures from your toolbox to fix them.", module: "Mars (HTML)", icon: "/assets/planets/celestial/Mars.svg" },
    "html-3-mars": { title: "Level 3: The Big Space Message!", desc: "The AstroLink is turned on, but Earth and Venus don't recognize us! Put all your HTML blocks together to build a friendly message that proves who we are so they will answer our call.", module: "Mars (HTML)", icon: "/assets/planets/celestial/Mars.svg" },

    // Venus (CSS)
    "venus-1": { title: "Level 1: Color It In", desc: "Professor Spectrum's lab lost all its colors. Drop in some furniture, splash your favorite colors and borders, and style the banner to make the room feel lively again.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "venus-2": { title: "Level 2: Formatting the Prototype", desc: "We have the pieces, but the layout is a mess! We must align them properly so the structure holds before we can plug it into the planet's main machinery.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "venus-3": { title: "Level 3: Restoring the Dead Zones", desc: "The AstroLink is powered on, but parts of the planet are still stuck in black and white. We need to link our new CSS prototype to the main HTML network to fix these dead zones and bring the color back.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "css-1": { title: "Level 1: Color It In", desc: "Professor Spectrum's lab lost all its colors. Drop in some furniture, splash your favorite colors and borders, and style the banner to make the room feel lively again.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "css-2": { title: "Level 2: Formatting the Prototype", desc: "We have the pieces, but the layout is a mess! We must align them properly so the structure holds before we can plug it into the planet's main machinery.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "css-3": { title: "Level 3: Restoring the Dead Zones", desc: "The AstroLink is powered on, but parts of the planet are still stuck in black and white. We need to link our new CSS prototype to the main HTML network to fix these dead zones and bring the color back.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "css-1-venus": { title: "Level 1: Color It In", desc: "Professor Spectrum's lab lost all its colors. Drop in some furniture, splash your favorite colors and borders, and style the banner to make the room feel lively again.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "css-2-venus": { title: "Level 2: Formatting the Prototype", desc: "We have the pieces, but the layout is a mess! We must align them properly so the structure holds before we can plug it into the planet's main machinery.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },
    "css-3-venus": { title: "Level 3: Restoring the Dead Zones", desc: "The AstroLink is powered on, but parts of the planet are still stuck in black and white. We need to link our new CSS prototype to the main HTML network to fix these dead zones and bring the color back.", module: "Venus (CSS)", icon: "/assets/planets/celestial/Venus.svg" },

    // Mercury (JavaScript)
    "mercury-1": { title: "Level 1: Saving the Biodome", desc: "Professor Dominic's plants are drying up after the solar storm! Fix the life support system and bring the garden back to life.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "mercury-2": { title: "Level 2: The Conveyor Belt", desc: "The storm melted the logic boards on the factory's main conveyor belt! Help the Professor un-jam the tracks by teaching the machine how to make choices!", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "mercury-3": { title: "Level 3: The Missing Interface", desc: "The electromagnetic surge completely wiped out Mercury's front-end software! Combine your web dev blocks to rebuild the main communication relay from scratch and bring the system back online!", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "javascript-1": { title: "Level 1: Saving the Biodome", desc: "Professor Dominic's plants are drying up after the solar storm! Fix the life support system and bring the garden back to life.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "javascript-2": { title: "Level 2: The Conveyor Belt", desc: "The storm melted the logic boards on the factory's main conveyor belt! Help the Professor un-jam the tracks by teaching the machine how to make choices!", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "javascript-3": { title: "Level 3: The Missing Interface", desc: "The electromagnetic surge completely wiped out Mercury's front-end software! Combine your web dev blocks to rebuild the main communication relay from scratch and bring the system back online!", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "js-1": { title: "Level 1: Saving the Biodome", desc: "Professor Dominic's plants are drying up after the solar storm! Fix the life support system and bring the garden back to life.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "js-2": { title: "Level 2: The Conveyor Belt", desc: "The storm melted the logic boards on the factory's main conveyor belt! Help the Professor un-jam the tracks by teaching the machine how to make choices!", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "js-3": { title: "Level 3: The Missing Interface", desc: "The electromagnetic surge completely wiped out Mercury's front-end software! Combine your web dev blocks to rebuild the main communication relay from scratch and bring the system back online!", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "js-1-mercury": { title: "Level 1: Saving the Biodome", desc: "Professor Dominic's plants are drying up after the solar storm! Fix the life support system and bring the garden back to life.", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "js-2-mercury": { title: "Level 2: The Conveyor Belt", desc: "The storm melted the logic boards on the factory's main conveyor belt! Help the Professor un-jam the tracks by teaching the machine how to make choices!", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },
    "js-3-mercury": { title: "Level 3: The Missing Interface", desc: "The electromagnetic surge completely wiped out Mercury's front-end software! Combine your web dev blocks to rebuild the main communication relay from scratch and bring the system back online!", module: "Mercury (JavaScript)", icon: "/assets/planets/celestial/Mercury.svg" },

    // Jupiter (Java)
    "jupiter-1": { title: "Level 1: Unlock the Gate", desc: "The Jupiter space station thinks you are an intruder and locked the blast doors! Teach the system exactly what kind of data you are sending to unlock the heavy security gates.", module: "Jupiter (Java)", icon: "/assets/planets/celestial/Jupiter.svg" },
    "jupiter-2": { title: "Level 2: Try and Catch This!", desc: "Rescue Technician Io by building a Try/Catch safety net to intercept corrupted data blocks before they reach the server core!", module: "Jupiter (Java)", icon: "/assets/planets/celestial/Jupiter.svg" },
    "jupiter-3": { title: "Level 3: The AI Core Lockdown", desc: "The Main Vault is on strict lockdown! The AI Core won't let anyone through. Can you build a custom ID blueprint and forge an object to sneak past the security scanner?", module: "Jupiter (Java)", icon: "/assets/planets/celestial/Jupiter.svg" },
    "java-1": { title: "Level 1: Unlock the Gate", desc: "The Jupiter space station thinks you are an intruder and locked the blast doors! Teach the system exactly what kind of data you are sending to unlock the heavy security gates.", module: "Jupiter (Java)", icon: "/assets/planets/celestial/Jupiter.svg" },
    "java-2": { title: "Level 2: Try and Catch This!", desc: "Rescue Technician Io by building a Try/Catch safety net to intercept corrupted data blocks before they reach the server core!", module: "Jupiter (Java)", icon: "/assets/planets/celestial/Jupiter.svg" },
    "java-3": { title: "Level 3: The AI Core Lockdown", desc: "The Main Vault is on strict lockdown! The AI Core won't let anyone through. Can you build a custom ID blueprint and forge an object to sneak past the security scanner?", module: "Jupiter (Java)", icon: "/assets/planets/celestial/Jupiter.svg" },

    // Saturn (C++)
    "saturn-1": { title: "Saturn Level 1: Surprise Diagnostics", desc: "The station's sensors are scrambling data! Build the correct pipeline to catch the data, calculate the power, and route it to the main grid.", module: "Saturn (C++)", icon: "/assets/planets/celestial/Saturn.svg" },
    "saturn-2": { title: "Level 2: Jumpstarting the Rings", desc: "Saturn's rings are completely jammed with floating space debris! Use your ship's tractor beam to automatically sort the ice, rock, and metal into the correct disposal chutes so the rings can spin again.", module: "Saturn (C++)", icon: "/assets/planets/celestial/Saturn.svg" },
    "saturn-3": { title: "Level 3: A Leak in the System!", desc: "Oh no, Engineer Titan's mainframe is hogging all the energy cores and refusing to give them back! Whatever you take, you MUST return before the station goes boom!", module: "Saturn (C++)", icon: "/assets/planets/celestial/Saturn.svg" },
    "cpp-1": { title: "Saturn Level 1: Surprise Diagnostics", desc: "The station's sensors are scrambling data! Build the correct pipeline to catch the data, calculate the power, and route it to the main grid.", module: "Saturn (C++)", icon: "/assets/planets/celestial/Saturn.svg" },
    "cpp-2": { title: "Level 2: Jumpstarting the Rings", desc: "Saturn's rings are completely jammed with floating space debris! Use your ship's tractor beam to automatically sort the ice, rock, and metal into the correct disposal chutes so the rings can spin again.", module: "Saturn (C++)", icon: "/assets/planets/celestial/Saturn.svg" },
    "cpp-3": { title: "Level 3: A Leak in the System!", desc: "Oh no, Engineer Titan's mainframe is hogging all the energy cores and refusing to give them back! Whatever you take, you MUST return before the station goes boom!", module: "Saturn (C++)", icon: "/assets/planets/celestial/Saturn.svg" },

    // Earth (Python)
    "earth-1": { title: "Level 1: Fix the Master Ledger!", desc: "The Master Ledger is scrambled! Use Python slicing and string tools to cut away the junk and restore each entry.", module: "Earth (Python)", icon: "/assets/planets/celestial/Earth.svg" },
    "earth-2": { title: "Level 2: The Planetary Archive", desc: "A solar storm scrambled the Master Ledger! Sort the loose data into digital folders to reconnect the solar system.", module: "Earth (Python)", icon: "/assets/planets/celestial/Earth.svg" },
    "earth-3": { title: "Level 3: The Master Reboot", desc: "The Architect has one final program to bring together every repair you've made across the solar system, but he needs your help to run it. Use Python functions and modules to unify the network and bring the solar system online at once!", module: "Earth (Python)", icon: "/assets/planets/celestial/Earth.svg" },
    "python-1": { title: "Level 1: Fix the Master Ledger!", desc: "The Master Ledger is scrambled! Use Python slicing and string tools to cut away the junk and restore each entry.", module: "Earth (Python)", icon: "/assets/planets/celestial/Earth.svg" },
    "python-2": { title: "Level 2: The Planetary Archive", desc: "A solar storm scrambled the Master Ledger! Sort the loose data into digital folders to reconnect the solar system.", module: "Earth (Python)", icon: "/assets/planets/celestial/Earth.svg" },
    "python-3": { title: "Level 3: The Master Reboot", desc: "The Architect has one final program to bring together every repair you've made across the solar system, but he needs your help to run it. Use Python functions and modules to unify the network and bring the solar system online at once!", module: "Earth (Python)", icon: "/assets/planets/celestial/Earth.svg" },
  };

  const key = (missionId || "").toLowerCase();
  const normKey = normalizeMissionKey(key);
  const canon = allMissions[normKey] || allMissions[key];

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

  // Canon always takes precedence for known campaign missions so descriptions stay synchronized!
  if (canon) {
    return {
      title: canon.title,
      desc: canon.desc,
      module: canon.module,
      icon: canon.icon,
    };
  }

  // Fallback to customMission if provided
  if (customMission?.title && customMission.title !== "Daily Mission Level" && customMission.title !== "Daily Level" && !customMission.title.startsWith("Mission ")) {
    return {
      title: customMission.title,
      desc: customMission.desc || "Complete objectives and guide your rover or starship safely through the mission challenges.",
      module: customMission.module || "Space Mission",
      icon: customMission.icon || "/assets/planets/00_moon/environment/MainMoon.svg"
    };
  }

  return {
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
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);

  // Profile Customization & Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('Novice Explorer');
  const [selectedIcon, setSelectedIcon] = useState('/assets/global/badges/Profile.svg');
  const [selectedBanner, setSelectedBanner] = useState('');
  const [selectedBorder, setSelectedBorder] = useState('');
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);
  const [previewBorder, setPreviewBorder] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [activeCategory, setActiveCategory] = useState<'background' | 'icons' | 'borders'>('background');
  const [userInventory, setUserInventory] = useState<any[]>([]);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Badges & Modal State
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [fullPreviewBg, setFullPreviewBg] = useState<{ id: string; title: string; imageUrl: string; description?: string } | null>(null);
  const [fullPreviewBorder, setFullPreviewBorder] = useState<{ id: string; title: string; imageUrl: string; description?: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [unlockedDates, setUnlockedDates] = useState<Record<string, string>>({});

  const [statsTab, setStatsTab] = useState<'overview' | 'progress'>('overview');
  const [xp, setXp] = useState(0);

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
    if (selectedTitle) titles.add(selectedTitle);

    return Array.from(titles);
  }, [xp, dbAchievements, unlockedDates, profile, selectedTitle]);

  // Memoize valid showcased badges without phantom holes or missing badges
  const validShowcasedBadges = useMemo(() => {
    const rawList: string[] = profile?.showcasedBadges || [];
    const valid: Array<{
      id: string;
      name: string;
      description: string;
      xpReward: number;
      gearsReward: number;
      icon: string;
      image?: string;
      triggerCode?: string;
    }> = [];

    rawList.forEach((badgeId) => {
      if (!badgeId) return;
      const normalizedId = String(badgeId).toLowerCase().trim();
      const triggerCode = String(badgeId).toUpperCase().trim();
      const baseBadge = allBadges.find(b => b.id.toLowerCase() === normalizedId || b.id.toUpperCase() === triggerCode);
      const dbData = dbAchievements.find(a =>
        (a.triggerCode && a.triggerCode.toUpperCase() === triggerCode) ||
        (a.id && a.id.toLowerCase() === normalizedId) ||
        (a.id && a.id === badgeId)
      );

      if (baseBadge || dbData) {
        valid.push({
          id: badgeId,
          name: dbData?.name || baseBadge?.name || 'Achievement',
          description: dbData?.description || baseBadge?.description || '',
          xpReward: dbData?.xpReward || baseBadge?.xpReward || 100,
          gearsReward: dbData?.gearsReward || 0,
          icon: dbData?.iconUrl || baseBadge?.icon || '🏆',
          image: dbData?.iconUrl || baseBadge?.image,
          triggerCode: triggerCode,
        });
      }
    });

    return valid;
  }, [profile?.showcasedBadges, dbAchievements]);

  const ownedBackgrounds = useMemo(() => {
    const list: { id: string; title: string; imageUrl: string; description?: string }[] = [
      {
        id: 'default-cosmic',
        title: 'Default Cosmic',
        imageUrl: '',
        description: 'Default deep purple space theme',
      }
    ];

    const addedUrls = new Set<string>(['']);

    userInventory.forEach((inv: any) => {
      const item = inv.shopItem;
      if (item && (item.type === 'BACKGROUND' || item.subCategory === 'Background')) {
        if (item.imageUrl && !addedUrls.has(item.imageUrl)) {
          addedUrls.add(item.imageUrl);
          list.push({
            id: item.id || inv.id,
            title: item.title || 'Cosmic Background',
            imageUrl: item.imageUrl,
            description: item.description,
          });
        }
      }
    });

    if (profile?.banner && !addedUrls.has(profile.banner)) {
      list.push({
        id: 'current-banner',
        title: 'Current Background',
        imageUrl: profile.banner,
        description: 'Your equipped background',
      });
    }

    return list;
  }, [userInventory, profile?.banner]);

  const ownedIcons = useMemo(() => {
    const list: { id: string; title: string; imageUrl: string }[] = [
      {
        id: 'default-cadet',
        title: 'Default Cadet',
        imageUrl: '/assets/global/badges/Profile.svg',
      }
    ];

    const addedUrls = new Set<string>(['/assets/global/badges/Profile.svg']);

    userInventory.forEach((inv: any) => {
      const item = inv.shopItem;
      if (item && (item.type === 'ICON' || item.subCategory === 'Icons')) {
        if (item.imageUrl && !addedUrls.has(item.imageUrl)) {
          addedUrls.add(item.imageUrl);
          list.push({
            id: item.id || inv.id,
            title: item.title || 'Profile Icon',
            imageUrl: item.imageUrl,
          });
        }
      }
    });

    if (profile?.image && !addedUrls.has(profile.image) && profile.image !== '/assets/planets/celestial/Planet 1.svg') {
      list.push({
        id: 'current-avatar',
        title: 'Current Icon',
        imageUrl: profile.image,
      });
    }

    return list;
  }, [userInventory, profile?.image]);

  const ownedBorders = useMemo(() => {
    const list: { id: string; title: string; imageUrl: string; description?: string }[] = [
      {
        id: 'default-border',
        title: 'Default Orange',
        imageUrl: '',
        description: 'The standard glowing solar border',
      }
    ];

    const addedUrls = new Set<string>(['']);

    userInventory.forEach((inv: any) => {
      const item = inv.shopItem;
      if (item && (item.type === 'BORDER' || item.subCategory === 'Borders')) {
        if (item.imageUrl && !addedUrls.has(item.imageUrl)) {
          addedUrls.add(item.imageUrl);
          list.push({
            id: item.id || inv.id,
            title: item.title || 'Profile Border',
            imageUrl: item.imageUrl,
            description: item.description,
          });
        }
      }
    });

    if (profile?.border && !addedUrls.has(profile.border)) {
      list.push({
        id: 'current-border',
        title: 'Current Border',
        imageUrl: profile.border,
        description: 'Your equipped border',
      });
    }

    return list;
  }, [userInventory, profile?.border]);

  const hasUnsavedChanges = useMemo(() => {
    if (!isEditing) return false;
    const currentTitle = profile?.activeTitle || profile?.title || (session?.user as any)?.activeTitle || 'Novice Explorer';
    const currentDisplayName = profile?.displayName || profile?.name || session?.user?.displayName || session?.user?.name || '';
    const currentBio = profile?.bio || '';
    const currentIcon = (profile?.image && profile.image !== '/assets/planets/celestial/Planet 1.svg')
      ? profile.image
      : (session?.user?.image && session.user.image !== '/assets/planets/celestial/Planet 1.svg')
        ? session.user.image
        : '/assets/global/badges/Profile.svg';
    const currentBanner = profile?.banner || '';
    const currentBorder = profile?.border || (session?.user as any)?.border || '';

    return (
      editDisplayName !== currentDisplayName ||
      editBio !== currentBio ||
      selectedTitle !== currentTitle ||
      selectedIcon !== currentIcon ||
      selectedBanner !== currentBanner ||
      selectedBorder !== currentBorder ||
      (previewBanner !== null && previewBanner !== currentBanner) ||
      (previewBorder !== null && previewBorder !== currentBorder)
    );
  }, [isEditing, editDisplayName, editBio, selectedTitle, selectedIcon, selectedBanner, selectedBorder, previewBanner, previewBorder, profile, session]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (session?.user) {
      fetchProfile();
    }
  }, [status, session, router]);

  const fetchProfile = async (retryCount = 0) => {
    try {
      // 1. Fetch primary profile data
      const res = await fetch(`/api/profile?t=${Date.now()}`);
      if (!res.ok) {
        if (retryCount < 2) {
          setTimeout(() => fetchProfile(retryCount + 1), 600);
          return;
        }
        throw new Error(`Profile fetch returned status ${res.status}`);
      }
      const data = await res.json();

      if (data?.user) {
        setProfile(data.user);
        setXp(data.user.xp || 0);
        if (data.stats) {
          setStats(data.stats);
        }
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
        setSelectedTitle(data.user.activeTitle || data.user.title || (session?.user as any)?.activeTitle || 'Novice Explorer');
        setSelectedIcon(
          (data.user.image && data.user.image !== '/assets/planets/celestial/Planet 1.svg')
            ? data.user.image
            : (session?.user?.image && session.user.image !== '/assets/planets/celestial/Planet 1.svg')
              ? session.user.image
              : '/assets/global/badges/Profile.svg'
        );
        setSelectedBanner(data.user.banner || '');
        setSelectedBorder(data.user.border || (session?.user as any)?.border || '');
        setEditDisplayName(data.user.displayName || data.user.name || session?.user?.displayName || session?.user?.name || '');
        setEditBio(data.user.bio || '');
      }

      // 2. Fetch auxiliary data concurrently without risking primary profile loading
      Promise.allSettled([
        getUnlockedAchievements(),
        getUserInventory(),
      ]).then(([achResult, invResult]) => {
        if (achResult.status === 'fulfilled' && achResult.value?.success) {
          const achievementsRes = achResult.value;
          setDbAchievements(achievementsRes.allDbAchievements || []);
          const datesMap: Record<string, string> = {};
          achievementsRes.userAchievementsDetails?.forEach((ua: any) => {
            if (ua.triggerCode) datesMap[ua.triggerCode.toUpperCase()] = ua.unlockedAt;
            if (ua.achievementId) datesMap[ua.achievementId] = ua.unlockedAt;
          });
          setUnlockedDates(datesMap);
        }
        if (invResult.status === 'fulfilled' && invResult.value?.success && invResult.value.inventory) {
          setUserInventory(invResult.value.inventory);
        }
      }).catch(err => {
        console.warn("Non-fatal error fetching auxiliary profile info:", err);
      });

    } catch (e) {
      console.error("Error fetching profile:", e);
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

  const handleOpenEditSidebar = () => {
    const currentTitle = profile?.activeTitle || profile?.title || (session?.user as any)?.activeTitle || 'Novice Explorer';
    const currentIcon = (profile?.image && profile.image !== '/assets/planets/celestial/Planet 1.svg')
      ? profile.image
      : (session?.user?.image && session.user.image !== '/assets/planets/celestial/Planet 1.svg')
        ? session.user.image
        : '/assets/global/badges/Profile.svg';
    const currentBanner = profile?.banner || '';
    const currentBorder = profile?.border || (session?.user as any)?.border || '';

    setSelectedTitle(currentTitle);
    setSelectedIcon(currentIcon);
    setSelectedBanner(currentBanner);
    setSelectedBorder(currentBorder);
    setPreviewBanner(null);
    setPreviewIcon(null);
    setPreviewBorder(null);
    setEditDisplayName(profile?.displayName || profile?.name || session?.user?.displayName || session?.user?.name || '');
    setEditBio(profile?.bio || '');
    setIsEditing(true);
  };

  const handleCloseSidebar = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
    } else {
      handleDiscardCustomization();
    }
  };

  const handleDiscardCustomization = () => {
    const currentTitle = profile?.activeTitle || profile?.title || (session?.user as any)?.activeTitle || 'Novice Explorer';
    const currentIcon = (profile?.image && profile.image !== '/assets/planets/celestial/Planet 1.svg')
      ? profile.image
      : (session?.user?.image && session.user.image !== '/assets/planets/celestial/Planet 1.svg')
        ? session.user.image
        : '/assets/global/badges/Profile.svg';
    const currentBanner = profile?.banner || '';
    const currentBorder = profile?.border || (session?.user as any)?.border || '';

    setSelectedTitle(currentTitle);
    setSelectedIcon(currentIcon);
    setSelectedBanner(currentBanner);
    setSelectedBorder(currentBorder);
    setPreviewBanner(null);
    setPreviewIcon(null);
    setPreviewBorder(null);
    setEditDisplayName(profile?.displayName || profile?.name || session?.user?.displayName || session?.user?.name || '');
    setEditBio(profile?.bio || '');
    setIsEditing(false);
    setShowUnsavedModal(false);
  };

  const handleSaveCustomization = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: editDisplayName.trim(),
          bio: editBio.trim(),
          activeTitle: selectedTitle,
          image: selectedIcon,
          banner: selectedBanner,
          border: selectedBorder,
        })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setProfile(data.user);
        setEditBio(data.user.bio || '');
        setPreviewBanner(null);
        setPreviewIcon(null);
        setPreviewBorder(null);
        setIsEditing(false);
        setShowUnsavedModal(false);
        showToast('Profile updated successfully!');
        await update({
          displayName: data.user?.displayName,
          image: data.user?.image,
          activeTitle: data.user?.activeTitle,
          border: data.user?.border
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

  const userCreatedAt = profile?.createdAt || (session?.user as any)?.createdAt;
  const joinedDate = userCreatedAt ? new Date(userCreatedAt).toLocaleDateString() : 'Recently';
  const activeBg = previewBanner !== null ? previewBanner : profile?.banner;

  return (
    <main className="relative flex-1 flex flex-col z-10 w-full h-full overflow-hidden bg-[#270d3c]">
      {/* Background override layer */}
      {activeBg && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <Image
            src={activeBg}
            alt="Profile Background"
            fill
            className="object-cover object-center opacity-90 brightness-95 scale-100 transition-all duration-300"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/50" />
        </div>
      )}

      {/* Interactivity Blocking Backdrop while editing */}
      {isEditing && (
        <div
          className="fixed inset-0 z-40 bg-black/5 cursor-pointer"
          onClick={() => {
            if (hasUnsavedChanges) {
              setShowUnsavedModal(true);
            } else {
              handleDiscardCustomization();
            }
          }}
          title="Click outside to cancel or save profile edits"
        />
      )}

      <DailyTaskTracker taskIds={["task-achieve-2"]} />
      <TopHeader title="Profile" />
      <div className={`flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 pr-10 lg:pr-16 no-scrollbar @container relative z-10 ${isEditing ? 'pointer-events-none select-none' : ''}`}>

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

                    <button
                      onClick={handleOpenEditSidebar}
                      className="bg-white/10 hover:bg-white/20 text-white font-bold py-1.5 px-5 text-sm rounded-full cursor-pointer transition-all border border-white/10 flex items-center gap-2 active:scale-95 whitespace-nowrap shadow-sm hover:border-[#ff912d]/50"
                    >
                      <svg className="w-4 h-4 text-[#ff912d]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      Edit Profile
                    </button>
                  </div>

                  {/* Two-Column Dossier Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] @2xl:grid-cols-[280px_1fr] gap-6 items-stretch flex-1">
                    {/* Zone 1: The Identity Panel (Left Column) */}
                    <div className="flex flex-col items-center justify-center text-center p-5 sm:p-6 bg-black/30 border border-[#ff912d]/25 rounded-2xl relative shadow-inner h-full">
                      {/* Avatar with Circular Frame and Custom or Default Glowing Border */}
                      {(() => {
                        const activeBorderUrl = (isEditing && previewBorder !== null)
                          ? previewBorder
                          : (isEditing ? selectedBorder : (profile?.border || (session?.user as any)?.border));
                        const isCustomBorder = Boolean(activeBorderUrl && activeBorderUrl !== 'default');
                        const avatarImg = (isEditing && previewIcon)
                          ? previewIcon
                          : (profile?.image && profile.image !== '/assets/planets/celestial/Planet 1.svg')
                            ? profile.image
                            : (session?.user?.image && session.user.image !== '/assets/planets/celestial/Planet 1.svg')
                              ? session.user.image
                              : '/assets/global/badges/Profile.svg';

                        return (
                          <>
                            <div className="relative w-32 h-32 sm:w-36 sm:h-36 @2xl:w-40 @2xl:h-40 mt-1 flex items-center justify-center shrink-0 group/avatar">
                              {/* Inner Circular Avatar */}
                              <div className={`w-full h-full rounded-full relative overflow-hidden flex items-center justify-center bg-[#1e0a2d] ${isCustomBorder
                                  ? ''
                                  : 'border-4 border-[#ff912d] shadow-[0_0_25px_rgba(255,145,45,0.4)]'
                                }`}>
                                <Image
                                  src={avatarImg}
                                  alt="Avatar"
                                  fill
                                  className="object-cover rounded-full"
                                />
                              </div>

                              {/* Custom Border Overlay */}
                              {isCustomBorder && (
                                <div 
                                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center"
                                  style={{ width: getBorderScale(activeBorderUrl), height: getBorderScale(activeBorderUrl) }}
                                >
                                  <img
                                    src={activeBorderUrl}
                                    alt="Profile Border"
                                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_0_12px_rgba(0,0,0,0.6)]"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Display Name */}
                            <h3 className={`text-xl font-black text-white tracking-wide truncate max-w-full drop-shadow-md ${
                              isCustomBorder ? 'mt-7 sm:mt-9' : 'mt-3 sm:mt-4'
                            }`}>
                              {`"${((isEditing && editDisplayName) ? editDisplayName : (profile?.displayName || profile?.name || session?.user?.displayName || session?.user?.name || 'Explorer')).replace(/^["“”']+|["“”']+$/g, '')}"`}
                            </h3>

                            {/* Earned Rank / Title Badge */}
                            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#ff912d]/15 border border-[#ff912d]/50 text-[#ff912d] shadow-[0_0_12px_rgba(255,145,45,0.25)]">
                              <svg className="w-3.5 h-3.5 text-[#ff912d] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                              </svg>
                              <span className="font-bold text-xs uppercase tracking-widest truncate">
                                {(isEditing && selectedTitle) ? selectedTitle : (profile?.activeTitle || profile?.title || (session?.user as any)?.activeTitle || 'Novice Explorer')}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Zone 2: The Data Terminal (Right Column) */}
                    <div className="flex-1 flex flex-col gap-2.5 h-full">
                      {/* Username and Joined Date */}
                      <div className="px-1 shrink-0 flex flex-col gap-1.5">
                        <span className="text-2xl sm:text-3xl font-bold text-white font-sans tracking-normal drop-shadow-md">
                          @{profile?.name || profile?.username || session?.user?.name || (session?.user?.email ? session.user.email.split('@')[0] : 'explorer')}
                        </span>
                        <p className="text-xs text-white/40 tracking-wider">
                          Joined on <span className="text-white/70 font-semibold">{joinedDate}</span>
                        </p>
                      </div>

                      {/* About Me Container (Expands to fill remaining height) */}
                      <div className="flex-1 flex flex-col gap-3 bg-black/35 border border-[#ff912d]/30 rounded-2xl p-5 sm:p-6 shadow-inner relative overflow-hidden min-h-[165px] sm:min-h-[190px]">
                        {/* Section Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 shrink-0">
                          <span className={`${vt323.className} font-bold text-[#ff912d] text-xl sm:text-2xl tracking-[0.15em] uppercase`}>
                            About Me
                          </span>
                          {isEditing && (
                            <span className="text-[10px] text-[#ff912d] font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff912d] animate-pulse" />
                              Editing
                            </span>
                          )}
                        </div>

                        {/* Bio Content Screen */}
                        <div className="flex-1 flex flex-col min-h-0">
                          {isEditing ? (
                            <div className="flex-1 flex flex-col relative">
                              <textarea
                                value={editBio}
                                maxLength={250}
                                onChange={(e) => setEditBio(e.target.value)}
                                placeholder="Describe Yourself!"
                                className="flex-1 w-full min-h-[120px] sm:min-h-[140px] bg-[#1e0a2d]/70 text-white text-sm sm:text-base font-medium leading-relaxed p-4 rounded-xl border border-[#ff912d]/60 focus:border-[#ff912d] outline-none shadow-inner resize-none transition-all placeholder:text-white/30"
                              />
                              <span className="absolute bottom-2.5 right-3 text-[10px] text-white/40 font-mono pointer-events-none">
                                {editBio.length}/250
                              </span>
                            </div>
                          ) : (
                            <div
                              className="flex-1 w-full min-h-[120px] sm:min-h-[140px] bg-[#1e0a2d]/40 text-white/90 text-sm sm:text-base font-medium leading-relaxed p-4 rounded-xl border border-white/5 shadow-inner overflow-y-auto whitespace-pre-wrap"
                            >
                              {profile?.bio || 'Describe Yourself!'}
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
                        const badge = validShowcasedBadges[i];

                        if (badge) {
                          return (
                            <div
                              key={badge.id || i}
                              onClick={() => setSelectedBadge({ ...badge, isUnlocked: true, unlockedAt: unlockedDates[badge.triggerCode || ''] || unlockedDates[badge.id] })}
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
            {/* PROFILE STATISTICS */}
            <div className="relative group/stats-card flex flex-col h-full">
              {/* Shaded background depth layer */}
              <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/stats-card:translate-x-3 group-hover/stats-card:translate-y-3" />

              <div className="relative z-10 flex flex-col flex-1 gap-4 bg-[#361d57] border-2 border-[#ff912d]/50 p-6 rounded-3xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 shadow-xl justify-between h-full">
                {/* Title Box */}
                <div className="border border-[#ff912d]/50 p-3 bg-[#361d57]/60 text-center rounded-xl shrink-0">
                  <h2 className={`${vt323.className} font-bold text-[#ff912d] text-2xl tracking-[0.2em] uppercase`}>Profile Statistics</h2>
                </div>

                {/* Tabs and Content */}
                <div className="flex flex-col flex-1 justify-between gap-4">
                  <div className="flex border border-[#ff912d]/50 border-b-0 bg-[#361d57]/60 rounded-t-xl px-2 pt-2 gap-2 shrink-0">
                    <button
                      onClick={() => setStatsTab('overview')}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-colors ${statsTab === 'overview' ? 'bg-black/30 text-[#ff912d] border-t border-x border-[#ff912d]/50' : 'text-white/50 hover:bg-black/10 hover:text-white/80'}`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setStatsTab('progress')}
                      className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-colors ${statsTab === 'progress' ? 'bg-black/30 text-[#ff912d] border-t border-x border-[#ff912d]/50' : 'text-white/50 hover:bg-black/10 hover:text-white/80'}`}
                    >
                      Progress
                    </button>
                  </div>
                  <div className="border-x border-b border-[#ff912d]/50 bg-black/30 rounded-b-xl p-6 flex flex-col gap-6 justify-center shadow-inner min-h-[160px] flex-1">
                    {statsTab === 'overview' ? (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-[#361d57]/40 border border-[#ff912d]/30 rounded-xl p-6 text-center shadow-inner flex flex-col items-center justify-center">
                          <span className={`${vt323.className} text-[#ff912d] text-5xl mb-2 drop-shadow-md`}>
                            {stats?.perfectModulesCount ?? 0}
                          </span>
                          <span className="text-white/60 text-xs font-bold uppercase tracking-widest text-center">Modules Completed</span>
                        </div>
                        <div className="bg-[#361d57]/40 border border-[#ff912d]/30 rounded-xl p-6 text-center shadow-inner flex flex-col items-center justify-center">
                          <span className={`${vt323.className} text-[#ffb703] text-5xl mb-2 drop-shadow-md`}>
                            {stats?.planetsExploredCount ?? 0}
                          </span>
                          <span className="text-white/60 text-xs font-bold uppercase tracking-widest text-center">Planets Explored</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="bg-[#361d57]/30 border border-white/5 rounded-lg p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-end">
                            <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Frontend Track</span>
                            <span className="text-[#ff912d] text-xs font-bold">{stats?.frontendTrackPercent ?? 0}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                            <div className="h-full bg-[#ff912d] rounded-full transition-all duration-700" style={{ width: `${stats?.frontendTrackPercent ?? 0}%` }}></div>
                          </div>
                        </div>

                        <div className="bg-[#361d57]/30 border border-white/5 rounded-lg p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-end">
                            <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Backend Track</span>
                            <span className="text-[#9b4dff] text-xs font-bold">{stats?.backendTrackPercent ?? 0}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                            <div className="h-full bg-[#9b4dff] rounded-full transition-all duration-700" style={{ width: `${stats?.backendTrackPercent ?? 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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

                              {/* Mission Description with expandable full view */}
                              <div className="flex flex-col gap-1 mb-2">
                                <p
                                  title={details.desc}
                                  className={`text-white/80 text-xs leading-relaxed transition-all ${
                                    expandedMissionId === mission.id
                                      ? 'max-h-40 overflow-y-auto pr-1 select-text bg-black/40 p-2.5 rounded-xl border border-white/10 shadow-inner'
                                      : 'line-clamp-2'
                                  }`}
                                >
                                  {details.desc}
                                </p>
                                {details.desc && details.desc.length > 70 && (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedMissionId(expandedMissionId === mission.id ? null : mission.id)}
                                    className="text-[#ff912d] hover:text-[#ffa34d] text-[11px] font-bold self-start inline-flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>{expandedMissionId === mission.id ? 'Show less' : 'Read full brief'}</span>
                                    <ChevronDown size={12} className={`transition-transform duration-200 ${expandedMissionId === mission.id ? 'rotate-180' : ''}`} />
                                  </button>
                                )}
                              </div>

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

      {/* RIGHT CUSTOMIZATION SIDEBAR */}
      {isEditing && (
        <aside
          className="fixed top-0 right-0 h-full w-[360px] sm:w-[420px] z-50 bg-[#1e0a2d] border-l-2 border-[#ff912d] shadow-2xl flex flex-col animate-drawer-slide-in"
          role="dialog"
          aria-label="Customize Profile"
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#ff912d]/30 bg-[#270d3c]/90 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff912d] animate-pulse" />
              <h2 className={`${vt323.className} text-[#ff912d] text-2xl font-bold uppercase tracking-wider`}>
                Edit Profile
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCloseSidebar}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 no-scrollbar">
            {/* 1. Display Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#ff912d] flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#ff912d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Display Name
              </label>
              <input
                type="text"
                value={editDisplayName}
                maxLength={30}
                onChange={(e) => setEditDisplayName(e.target.value)}
                placeholder="Enter display name"
                className="w-full bg-[#270d3c] border border-[#ff912d]/50 text-white rounded-xl py-3 px-3.5 text-sm sm:text-base font-semibold focus:border-[#ff912d] outline-none transition-colors placeholder:text-white/30"
              />
            </div>

            {/* 2. About Me / Bio Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#ff912d] flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#ff912d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  About Me
                </label>
                <span className="text-xs text-white/40 font-mono">
                  {editBio.length}/250
                </span>
              </div>
              <textarea
                value={editBio}
                maxLength={250}
                rows={3}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Describe Yourself!"
                className="w-full bg-[#270d3c] border border-[#ff912d]/50 text-white rounded-xl p-3.5 text-sm sm:text-base font-medium focus:border-[#ff912d] outline-none transition-colors resize-none leading-relaxed placeholder:text-white/30"
              />
            </div>

            {/* 3. Title Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#ff912d] flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#ff912d]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                Title
              </label>
              <div className="relative">
                <select
                  value={selectedTitle}
                  onChange={(e) => setSelectedTitle(e.target.value)}
                  className="w-full bg-[#270d3c] border border-[#ff912d]/50 text-white rounded-xl py-3 pl-3.5 pr-10 text-sm sm:text-base font-semibold uppercase tracking-wider focus:border-[#ff912d] outline-none appearance-none cursor-pointer"
                >
                  {availableTitles.map(t => (
                    <option key={t} value={t} className="bg-[#1e0a2d] text-white py-2 text-sm sm:text-base">
                      {t}
                    </option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-[#ff912d] pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* 3. Category Tabs */}
            <div className="flex flex-col gap-3">
              <div className="flex border border-[#ff912d]/40 rounded-xl overflow-hidden bg-[#270d3c]/80 p-1">
                <button
                  type="button"
                  onClick={() => setActiveCategory('background')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeCategory === 'background'
                      ? 'bg-[#ff912d] text-black shadow-md'
                      : 'text-white/70 hover:text-white'
                    }`}
                >
                  Background
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('icons')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeCategory === 'icons'
                      ? 'bg-[#ff912d] text-black shadow-md'
                      : 'text-white/70 hover:text-white'
                    }`}
                >
                  Profile Icons
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('borders')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${activeCategory === 'borders'
                      ? 'bg-[#ff912d] text-black shadow-md'
                      : 'text-white/70 hover:text-white'
                    }`}
                >
                  Borders
                </button>
              </div>

              {/* Items Grid: 2 items per row */}
              {activeCategory === 'background' ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {ownedBackgrounds.map((item) => {
                    const isSelected = selectedBanner === item.imageUrl;
                    const isPreviewing = previewBanner !== null ? previewBanner === item.imageUrl : isSelected;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedBanner(item.imageUrl);
                          setPreviewBanner(item.imageUrl);
                        }}
                        className={`relative group flex flex-col rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-[#270d3c] ${isSelected
                            ? 'border-[#ff912d] shadow-[0_0_15px_rgba(255,145,45,0.4)]'
                            : isPreviewing
                              ? 'border-[#ff912d]/60 shadow-[0_0_10px_rgba(255,145,45,0.2)]'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                      >
                        {/* Checkmark when selected */}
                        {isSelected && (
                          <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-[#ff912d] border-2 border-white flex items-center justify-center shadow-lg">
                            <Check className="w-3.5 h-3.5 text-black font-extrabold stroke-[3]" />
                          </div>
                        )}

                        {/* Preview Modal Button on Top Right */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFullPreviewBg(item);
                          }}
                          className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/80 hover:bg-[#ff912d] text-white hover:text-black border border-white/20 transition-all shadow cursor-pointer active:scale-95"
                          title="Open full background preview"
                        >
                          Preview
                        </button>

                        {/* Thumbnail */}
                        <div className="relative w-full h-24 bg-black/50 overflow-hidden">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#180728] via-[#270d3c] to-[#361d57] text-white/70 p-2 text-center">
                              <span className="text-[11px] font-bold tracking-wider uppercase text-[#ff912d]">Default Purple</span>
                            </div>
                          )}
                        </div>

                        {/* Title & Status */}
                        <div className="p-2.5 flex items-center justify-between bg-black/40 border-t border-white/5">
                          <span className="text-xs font-bold text-white truncate max-w-[100px]">{item.title}</span>
                          {isSelected ? (
                            <span className="text-[#ff912d] font-bold text-[10px] uppercase tracking-wider">Equipped</span>
                          ) : isPreviewing ? (
                            <span className="text-yellow-300 font-semibold text-[10px]">Active</span>
                          ) : (
                            <span className="text-white/40 text-[10px]">Equip</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : activeCategory === 'icons' ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {ownedIcons.map((item) => {
                    const isSelected = selectedIcon === item.imageUrl;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedIcon(item.imageUrl);
                          setPreviewIcon(item.imageUrl);
                        }}
                        className={`relative group flex flex-col items-center p-3.5 rounded-2xl border-2 cursor-pointer transition-all bg-[#270d3c] ${isSelected
                            ? 'border-[#ff912d] shadow-[0_0_18px_rgba(255,145,45,0.4)] bg-[#361d57]'
                            : 'border-white/10 hover:border-white/30 hover:bg-[#361d57]/50'
                          }`}
                      >
                        {/* Checkmark when selected */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-[#ff912d] border-2 border-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 text-black font-extrabold stroke-[3]" />
                          </div>
                        )}

                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#ff912d]/60 mb-2 bg-[#1e0a2d] shadow-inner">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover rounded-full"
                          />
                        </div>
                        <span className="text-xs font-bold text-white text-center truncate max-w-full">
                          {item.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {ownedBorders.map((item) => {
                    const isSelected = selectedBorder === item.imageUrl;
                    const isPreviewing = previewBorder !== null ? previewBorder === item.imageUrl : isSelected;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedBorder(item.imageUrl);
                          setPreviewBorder(item.imageUrl);
                        }}
                        className={`relative group flex flex-col rounded-xl overflow-hidden border-2 cursor-pointer transition-all bg-[#270d3c] ${isSelected
                            ? 'border-[#ff912d] shadow-[0_0_15px_rgba(255,145,45,0.4)]'
                            : isPreviewing
                              ? 'border-[#ff912d]/60 shadow-[0_0_10px_rgba(255,145,45,0.2)]'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                      >
                        {/* Checkmark when selected */}
                        {isSelected && (
                          <div className="absolute top-2 left-2 z-20 w-6 h-6 rounded-full bg-[#ff912d] border-2 border-white flex items-center justify-center shadow-lg">
                            <Check className="w-3.5 h-3.5 text-black font-extrabold stroke-[3]" />
                          </div>
                        )}

                        {/* Preview Modal Button on Top Right */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFullPreviewBorder(item);
                          }}
                          className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/80 hover:bg-[#ff912d] text-white hover:text-black border border-white/20 transition-all shadow cursor-pointer active:scale-95"
                          title="Open full border preview"
                        >
                          Preview
                        </button>

                        {/* Thumbnail showcasing border framing avatar */}
                        <div className="relative w-full h-24 bg-black/50 overflow-hidden flex items-center justify-center p-2">
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            {/* Inner mini avatar */}
                            <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-[#1e0a2d]">
                              <img
                                src={
                                  previewIcon || (profile?.image && profile.image !== '/assets/planets/celestial/Planet 1.svg' ? profile.image : '/assets/global/badges/Profile.svg')
                                }
                                alt="Avatar"
                                className="w-full h-full object-cover rounded-full"
                              />
                            </div>
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain pointer-events-none drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
                                style={{ width: getBorderScale(item.imageUrl || item.title), height: getBorderScale(item.imageUrl || item.title) }}
                              />
                            ) : (
                              <div className="absolute inset-0 rounded-full border-2 border-[#ff912d] shadow-[0_0_8px_rgba(255,145,45,0.4)] pointer-events-none" />
                            )}
                          </div>
                        </div>

                        {/* Title & Status */}
                        <div className="p-2.5 flex items-center justify-between bg-black/40 border-t border-white/5">
                          <span className="text-xs font-bold text-white truncate max-w-[100px]">{item.title}</span>
                          {isSelected ? (
                            <span className="text-[#ff912d] font-bold text-[10px] uppercase tracking-wider">Equipped</span>
                          ) : isPreviewing ? (
                            <span className="text-yellow-300 font-semibold text-[10px]">Active</span>
                          ) : (
                            <span className="text-white/40 text-[10px]">Equip</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Action Footer */}
          <div className="p-4 border-t border-[#ff912d]/30 bg-[#270d3c]/95 flex flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveCustomization}
              disabled={saving}
              className="w-full py-2.5 bg-[#ff912d] hover:bg-[#ff912d]/80 text-black font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleCloseSidebar}
              disabled={saving}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-bold uppercase tracking-wider rounded-xl transition-all text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </aside>
      )}

      {/* FULL BACKGROUND PREVIEW MODAL */}
      {fullPreviewBg && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-[#1e0a2d] border-2 border-[#ff912d] rounded-3xl p-5 sm:p-7 max-w-3xl w-full shadow-2xl flex flex-col gap-5 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#ff912d]/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#ff912d] animate-pulse" />
                <h3 className={`${vt323.className} text-[#ff912d] text-2xl sm:text-3xl font-bold uppercase tracking-wider`}>
                  {fullPreviewBg.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFullPreviewBg(null)}
                className="text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                title="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Full Image Display Container */}
            <div className="relative w-full h-[45vh] sm:h-[55vh] rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-inner flex items-center justify-center">
              {fullPreviewBg.imageUrl ? (
                <Image
                  src={fullPreviewBg.imageUrl}
                  alt={fullPreviewBg.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#180728] via-[#270d3c] to-[#361d57] text-white p-6 text-center">
                  <h4 className="text-xl font-bold text-[#ff912d] uppercase tracking-widest mb-2">Default Cosmic Theme</h4>
                  <p className="text-sm text-white/70 max-w-md">The signature deep purple nebula background of the NETStart star system.</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFullPreviewBg(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider rounded-xl transition-all text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedBanner(fullPreviewBg.imageUrl);
                  setPreviewBanner(fullPreviewBg.imageUrl);
                  setFullPreviewBg(null);
                  showToast(`Applied ${fullPreviewBg.title}!`);
                }}
                className="px-6 py-2.5 bg-[#ff912d] hover:bg-[#ff912d]/80 text-black font-bold uppercase tracking-wider rounded-xl transition-all shadow-md text-xs cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Equip Background
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL BORDER PREVIEW MODAL */}
      {fullPreviewBorder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative bg-[#1e0a2d] border-2 border-[#ff912d] rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl flex flex-col gap-5 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#ff912d]/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#ff912d] animate-pulse" />
                <h3 className={`${vt323.className} text-[#ff912d] text-2xl sm:text-3xl font-bold uppercase tracking-wider`}>
                  {fullPreviewBorder.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFullPreviewBorder(null)}
                className="text-white/60 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                title="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Display Container */}
            <div className="relative w-full py-8 rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-inner flex flex-col items-center justify-center gap-4">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden flex items-center justify-center bg-[#1e0a2d] border border-white/10 shadow-xl">
                  <img
                    src={previewIcon || (profile?.image && profile.image !== '/assets/planets/celestial/Planet 1.svg' ? profile.image : '/assets/global/badges/Profile.svg')}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                {fullPreviewBorder.imageUrl ? (
                  <img
                    src={fullPreviewBorder.imageUrl}
                    alt={fullPreviewBorder.title}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain pointer-events-none drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                    style={{ width: getBorderScale(fullPreviewBorder.imageUrl || fullPreviewBorder.title), height: getBorderScale(fullPreviewBorder.imageUrl || fullPreviewBorder.title) }}
                  />
                ) : (
                  <div className="absolute inset-0 rounded-full border-4 border-[#ff912d] shadow-[0_0_25px_rgba(255,145,45,0.4)] pointer-events-none" />
                )}
              </div>
              <p className="text-xs text-white/70 text-center px-4">
                {fullPreviewBorder.description || 'Custom profile border frame.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFullPreviewBorder(null)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider rounded-xl transition-all text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedBorder(fullPreviewBorder.imageUrl);
                  setPreviewBorder(fullPreviewBorder.imageUrl);
                  setFullPreviewBorder(null);
                  showToast(`Equipped ${fullPreviewBorder.title}!`);
                }}
                className="px-6 py-2.5 bg-[#ff912d] hover:bg-[#ff912d]/80 text-black font-bold uppercase tracking-wider rounded-xl transition-all shadow-md text-xs cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Equip Border
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNSAVED CHANGES MODAL */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative bg-[#1e0a2d] border-2 border-[#ff912d] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#ff912d]/20 border-2 border-[#ff912d] flex items-center justify-center mx-auto text-[#ff912d] shadow-[0_0_15px_rgba(255,145,45,0.3)]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className={`${vt323.className} text-[#ff912d] text-3xl font-bold uppercase tracking-wider`}>
              Unsaved Customization
            </h3>

            <p className="text-white/80 text-sm leading-relaxed">
              You have unsaved changes to your profile. Would you like to save your edits before leaving?
            </p>

            <div className="flex flex-col gap-2.5 mt-2">
              <button
                type="button"
                onClick={handleSaveCustomization}
                disabled={saving}
                className="w-full py-3 bg-[#ff912d] hover:bg-[#ff912d]/80 text-black font-bold uppercase tracking-wider rounded-xl transition-all shadow-md text-xs cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleDiscardCustomization}
                className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold uppercase tracking-wider rounded-xl transition-all text-xs cursor-pointer active:scale-95"
              >
                Discard & Exit
              </button>
              <button
                type="button"
                onClick={() => setShowUnsavedModal(false)}
                className="text-white/50 hover:text-white text-xs underline py-1 cursor-pointer transition-colors"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] bg-[#361d57] border-2 border-[#ff912d] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff912d] animate-pulse" />
          <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
