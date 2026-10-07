import introScenes from '@/data/introduction_scenes.json';
import moonScenes from '@/data/moon.json';
import marsScenes from '@/data/mars.json';
import venusScenes from '@/data/venus.json';
import mercuryScenes from '@/data/mercury.json';
import jupiterScenes from '@/data/jupiter.json';
import saturnScenes from '@/data/saturn.json';
import earthScenes from '@/data/earth.json';
import epilogueScenes from '@/data/epilogue.json';
import storySummaries from '@/data/story_summaries.json';

export type StoryCategory = 
  | "all"
  | "prologue"
  | "moon"
  | "mars"
  | "venus"
  | "mercury"
  | "jupiter"
  | "saturn"
  | "earth"
  | "epilogue";

export function normalizeModuleToCategory(moduleId?: string): StoryCategory | null {
  if (!moduleId) return null;
  const m = moduleId.toLowerCase().trim();
  if (m === "moon") return "moon";
  if (m === "mars" || m === "html") return "mars";
  if (m === "venus" || m === "css") return "venus";
  if (m === "mercury" || m === "javascript" || m === "js") return "mercury";
  if (m === "jupiter" || m === "java") return "jupiter";
  if (m === "saturn" || m === "cpp") return "saturn";
  if (m === "earth" || m === "python") return "earth";
  if (m === "prologue") return "prologue";
  if (m === "epilogue") return "epilogue";
  return null;
}

export interface StoryArchiveEntry {
  id: string;
  category: StoryCategory;
  categoryTitle: string;
  levelNumber?: number;
  title: string;
  subtitle: string;
  thumbnail: string;
  cast: string[];
  summary: string;
  requiredMissionId: string | null;
  requiredDescription: string;
  planetBadge?: string;
  getScenes: (isPythonLast?: boolean) => any[];
}

function extractMissionScenes(allScenes: any[], targetMissionId: string): any[] {
  let targetIndex = -1;
  for (let i = 0; i < allScenes.length; i++) {
    const s = allScenes[i];
    if (s.type === 'mission' && (s.mission === targetMissionId || s.id === targetMissionId)) {
      targetIndex = i;
      break;
    }
  }
  if (targetIndex === -1) return [];

  let startIndex = 0;
  for (let i = targetIndex - 1; i >= 0; i--) {
    if (allScenes[i].type === 'mission') {
      startIndex = i + 1;
      break;
    }
  }

  return allScenes.slice(startIndex, targetIndex);
}

export const STORY_CATEGORIES: { id: StoryCategory; label: string }[] = [
  { id: "all", label: "All Sectors" },
  { id: "prologue", label: "Prologue" },
  { id: "moon", label: "The Moon" },
  { id: "mars", label: "Mars" },
  { id: "venus", label: "Venus" },
  { id: "mercury", label: "Mercury" },
  { id: "jupiter", label: "Jupiter" },
  { id: "saturn", label: "Saturn" },
  { id: "earth", label: "Earth" },
  { id: "epilogue", label: "Epilogue" },
];

export const STORY_ARCHIVE_ENTRIES: StoryArchiveEntry[] = [
  // 0. PROLOGUE
  {
    id: "prologue",
    category: "prologue",
    categoryTitle: "Prologue: Origin",
    title: "Dawn of the AstroLink",
    subtitle: "The Solar Crisis & Emergency Call",
    thumbnail: "/scenes/backgrounds/bg_001.png",
    cast: ["Narrator", "The Architect", "System", "Higher Head", "Oberion"],
    summary: storySummaries.skip_summary,
    requiredMissionId: null,
    requiredDescription: "Complete the Aptitude Diagnostic",
    planetBadge: "/assets/global/badges/Profile.svg",
    getScenes: () => introScenes,
  },

  // 1. THE MOON
  {
    id: "moon-1",
    category: "moon",
    categoryTitle: "The Moon",
    levelNumber: 1,
    title: "Level 1: Stellar Beginnings",
    subtitle: "Syntax & Basic Directives",
    thumbnail: "/scenes/backgrounds/bg_001.png",
    cast: ["Narrator", "Oberion", "Nova"],
    summary: (storySummaries.moon as any)["1"],
    requiredMissionId: "moon-1",
    requiredDescription: "Complete Moon - Level 1",
    planetBadge: "/assets/planets/00_moon/environment/MainMoon.svg",
    getScenes: () => extractMissionScenes(moonScenes, "moon-1"),
  },
  {
    id: "moon-2",
    category: "moon",
    categoryTitle: "The Moon",
    levelNumber: 2,
    title: "Level 2: Resource Classification",
    subtitle: "Loops & Assembly Logic",
    thumbnail: "/scenes/backgrounds/bg_002.png",
    cast: ["Narrator", "Operator", "Nova"],
    summary: (storySummaries.moon as any)["2"],
    requiredMissionId: "moon-2",
    requiredDescription: "Complete Moon - Level 2",
    planetBadge: "/assets/planets/00_moon/environment/MainMoon.svg",
    getScenes: () => extractMissionScenes(moonScenes, "moon-2"),
  },
  {
    id: "moon-3",
    category: "moon",
    categoryTitle: "The Moon",
    levelNumber: 3,
    title: "Level 3: The Starship Protocol",
    subtitle: "Conditionals & Flight Ready",
    thumbnail: "/scenes/backgrounds/bg_007.png",
    cast: ["Operator", "Narrator", "Nova", "System"],
    summary: (storySummaries.moon as any)["3"],
    requiredMissionId: "moon-3",
    requiredDescription: "Complete Moon - Level 3",
    planetBadge: "/assets/planets/00_moon/environment/MainMoon.svg",
    getScenes: () => extractMissionScenes(moonScenes, "moon-3"),
  },

  // 2. MARS
  {
    id: "mars-1",
    category: "mars",
    categoryTitle: "Mars Sector",
    levelNumber: 1,
    title: "Level 1: The Blank Billboard",
    subtitle: "HTML & Text Hierarchy",
    thumbnail: "/scenes/backgrounds/bg_006.png",
    cast: ["Narrator", "Operator and Nova", "Mark", "Nova"],
    summary: (storySummaries.mars as any)["1"],
    requiredMissionId: "mars-1",
    requiredDescription: "Complete Mars - Level 1",
    planetBadge: "/Mars-HTML.svg",
    getScenes: () => extractMissionScenes(marsScenes, "mars-1"),
  },
  {
    id: "mars-2",
    category: "mars",
    categoryTitle: "Mars Sector",
    levelNumber: 2,
    title: "Level 2: Picture Perfect",
    subtitle: "Images & Captions",
    thumbnail: "/scenes/backgrounds/bg_002.png",
    cast: ["Narrator", "Mark", "Emma G", "Penny G", "Nova"],
    summary: (storySummaries.mars as any)["2"],
    requiredMissionId: "mars-2",
    requiredDescription: "Complete Mars - Level 2",
    planetBadge: "/Mars-HTML.svg",
    getScenes: () => extractMissionScenes(marsScenes, "mars-2"),
  },
  {
    id: "mars-3",
    category: "mars",
    categoryTitle: "Mars Sector",
    levelNumber: 3,
    title: "Level 3: The Big Space Message",
    subtitle: "Forms & Interactive Elements",
    thumbnail: "/scenes/backgrounds/bg_009.png",
    cast: ["Penny G", "Emma G and Penny G", "Operator", "Nova"],
    summary: (storySummaries.mars as any)["3"],
    requiredMissionId: "mars-3",
    requiredDescription: "Complete Mars - Level 3",
    planetBadge: "/Mars-HTML.svg",
    getScenes: () => extractMissionScenes(marsScenes, "mars-3"),
  },

  // 3. VENUS
  {
    id: "venus-1",
    category: "venus",
    categoryTitle: "Venus Sector",
    levelNumber: 1,
    title: "Level 1: Color It In",
    subtitle: "CSS & Visual Styling",
    thumbnail: "/scenes/backgrounds/venus_bg_004_bw.png",
    cast: ["Narrator", "Nova", "Operator", "Professor Spectrum"],
    summary: (storySummaries.venus as any)["1"],
    requiredMissionId: "venus-1",
    requiredDescription: "Complete Venus - Level 1",
    planetBadge: "/Venus-CSS.svg",
    getScenes: () => extractMissionScenes(venusScenes, "venus-1"),
  },
  {
    id: "venus-2",
    category: "venus",
    categoryTitle: "Venus Sector",
    levelNumber: 2,
    title: "Level 2: Formatting the Prototype",
    subtitle: "Layout & Alignment",
    thumbnail: "/scenes/backgrounds/venus_bg_005.png",
    cast: ["Professor Spectrum", "Operator", "Narrator"],
    summary: (storySummaries.venus as any)["2"],
    requiredMissionId: "venus-2",
    requiredDescription: "Complete Venus - Level 2",
    planetBadge: "/Venus-CSS.svg",
    getScenes: () => extractMissionScenes(venusScenes, "venus-2"),
  },
  {
    id: "venus-3",
    category: "venus",
    categoryTitle: "Venus Sector",
    levelNumber: 3,
    title: "Level 3: Restoring the Dead Zones",
    subtitle: "CSS Linking & Amplification",
    thumbnail: "/scenes/backgrounds/venus_bg_007.png",
    cast: ["Narrator", "Professor Hue", "Professor Spectrum", "Operator"],
    summary: (storySummaries.venus as any)["3"],
    requiredMissionId: "venus-3",
    requiredDescription: "Complete Venus - Level 3",
    planetBadge: "/Venus-CSS.svg",
    getScenes: () => extractMissionScenes(venusScenes, "venus-3"),
  },

  // 4. MERCURY
  {
    id: "mercury-1",
    category: "mercury",
    categoryTitle: "Mercury Sector",
    levelNumber: 1,
    title: "Level 1: Saving the Biodome",
    subtitle: "JavaScript & DOM Selection",
    thumbnail: "/scenes/backgrounds/mercury_bg_002.png",
    cast: ["Narrator", "Nova", "Operator", "Professor Dominic"],
    summary: (storySummaries.mercury as any)["1"],
    requiredMissionId: "mercury-1",
    requiredDescription: "Complete Mercury - Level 1",
    planetBadge: "/Mercury-JavaScript.svg",
    getScenes: () => extractMissionScenes(mercuryScenes, "mercury-1"),
  },
  {
    id: "mercury-2",
    category: "mercury",
    categoryTitle: "Mercury Sector",
    levelNumber: 2,
    title: "Level 2: The Conveyor Belt",
    subtitle: "Functions & Event Handlers",
    thumbnail: "/scenes/backgrounds/mercury_bg_003.png",
    cast: ["Professor Dominic", "Narrator"],
    summary: (storySummaries.mercury as any)["2"],
    requiredMissionId: "mercury-2",
    requiredDescription: "Complete Mercury - Level 2",
    planetBadge: "/Mercury-JavaScript.svg",
    getScenes: () => extractMissionScenes(mercuryScenes, "mercury-2"),
  },
  {
    id: "mercury-3",
    category: "mercury",
    categoryTitle: "Mercury Sector",
    levelNumber: 3,
    title: "Level 3: The Missing Interface",
    subtitle: "Interactive Web Development",
    thumbnail: "/scenes/backgrounds/mercury_bg_004.png",
    cast: ["Narrator", "Professor Dominic", "Nova", "Operator"],
    summary: (storySummaries.mercury as any)["3"],
    requiredMissionId: "mercury-3",
    requiredDescription: "Complete Mercury - Level 3",
    planetBadge: "/Mercury-JavaScript.svg",
    getScenes: () => extractMissionScenes(mercuryScenes, "mercury-3"),
  },

  // 5. JUPITER
  {
    id: "jupiter-1",
    category: "jupiter",
    categoryTitle: "Jupiter Sector",
    levelNumber: 1,
    title: "Level 1: The Barrier Gate",
    subtitle: "Java & Security Protocols",
    thumbnail: "/scenes/backgrounds/jupiter_bg_002.jpg",
    cast: ["Narrator", "Operator", "Nova", "System"],
    summary: (storySummaries.jupiter as any)["1"],
    requiredMissionId: "jupiter-1",
    requiredDescription: "Complete Jupiter - Level 1",
    planetBadge: "/Jupiter-Java.svg",
    getScenes: () => extractMissionScenes(jupiterScenes, "jupiter-1"),
  },
  {
    id: "jupiter-2",
    category: "jupiter",
    categoryTitle: "Jupiter Sector",
    levelNumber: 2,
    title: "Level 2: Grid Chamber Quarantine",
    subtitle: "Exception Handling & Safety",
    thumbnail: "/scenes/backgrounds/jupiter_bg_003.jpg",
    cast: ["Narrator", "Technician Io", "Operator"],
    summary: (storySummaries.jupiter as any)["2"],
    requiredMissionId: "jupiter-2",
    requiredDescription: "Complete Jupiter - Level 2",
    planetBadge: "/Jupiter-Java.svg",
    getScenes: () => extractMissionScenes(jupiterScenes, "jupiter-2"),
  },
  {
    id: "jupiter-3",
    category: "jupiter",
    categoryTitle: "Jupiter Sector",
    levelNumber: 3,
    title: "Level 3: Blueprint Authorization",
    subtitle: "OOP Classes & Security Tokens",
    thumbnail: "/scenes/backgrounds/jupiter_bg_004.jpg",
    cast: ["Narrator", "The Core (Angry)", "Operator", "Nova"],
    summary: (storySummaries.jupiter as any)["3"],
    requiredMissionId: "jupiter-3",
    requiredDescription: "Complete Jupiter - Level 3",
    planetBadge: "/Jupiter-Java.svg",
    getScenes: () => extractMissionScenes(jupiterScenes, "jupiter-3"),
  },

  // 6. SATURN
  {
    id: "saturn-1",
    category: "saturn",
    categoryTitle: "Saturn Sector",
    levelNumber: 1,
    title: "Level 1: The Motionless Ringworld",
    subtitle: "C++ & Low-Level Control",
    thumbnail: "/scenes/backgrounds/saturn_bg_002.jpg",
    cast: ["Narrator", "Nova", "Operator", "Engineer Titan"],
    summary: (storySummaries.saturn as any)["1"],
    requiredMissionId: "saturn-1",
    requiredDescription: "Complete Saturn - Level 1",
    planetBadge: "/Saturn-C++.svg",
    getScenes: () => extractMissionScenes(saturnScenes, "saturn-1"),
  },
  {
    id: "saturn-2",
    category: "saturn",
    categoryTitle: "Saturn Sector",
    levelNumber: 2,
    title: "Level 2: The Debris Router",
    subtitle: "Switch Matching & Sorting",
    thumbnail: "/scenes/backgrounds/saturn_bg_003.jpg",
    cast: ["Narrator", "Engineer Titan", "Operator", "Nova"],
    summary: (storySummaries.saturn as any)["2"],
    requiredMissionId: "saturn-2",
    requiredDescription: "Complete Saturn - Level 2",
    planetBadge: "/Saturn-C++.svg",
    getScenes: () => extractMissionScenes(saturnScenes, "saturn-2"),
  },
  {
    id: "saturn-3",
    category: "saturn",
    categoryTitle: "Saturn Sector",
    levelNumber: 3,
    title: "Level 3: Core Memory Leak",
    subtitle: "Pointers & Memory Cleanup",
    thumbnail: "/scenes/backgrounds/saturn_bg_004.jpg",
    cast: ["Narrator", "Engineer Titan", "Operator", "Nova"],
    summary: (storySummaries.saturn as any)["3"],
    requiredMissionId: "saturn-3",
    requiredDescription: "Complete Saturn - Level 3",
    planetBadge: "/Saturn-C++.svg",
    getScenes: () => extractMissionScenes(saturnScenes, "saturn-3"),
  },

  // 7. EARTH
  {
    id: "earth-1",
    category: "earth",
    categoryTitle: "Earth Headquarters",
    levelNumber: 1,
    title: "Level 1: The Dark Master Ledger",
    subtitle: "Python & String Slicing",
    thumbnail: "/scenes/backgrounds/earth_bg_001.jpg",
    cast: ["Narrator", "Oberion", "Operator", "Director Atlas"],
    summary: ((storySummaries.earth_last as any)["1"] || (storySummaries.earth_not_last as any)["1"]),
    requiredMissionId: "earth-1",
    requiredDescription: "Complete Earth - Level 1",
    planetBadge: "/Earth-Python.svg",
    getScenes: (isPythonLast = false) => {
      const filtered = (earthScenes as any[]).filter(s => {
        if (!s.when) return true;
        if (s.when === 'pythonLast') return isPythonLast;
        if (s.when === '!pythonLast') return !isPythonLast;
        return true;
      });
      return extractMissionScenes(filtered, "earth-1");
    },
  },
  {
    id: "earth-2",
    category: "earth",
    categoryTitle: "Earth Headquarters",
    levelNumber: 2,
    title: "Level 2: The Structured Archive",
    subtitle: "Python Dictionaries & Records",
    thumbnail: "/scenes/backgrounds/earth_bg_002.jpg",
    cast: ["Director Atlas", "Operator", "Oberion", "Narrator"],
    summary: ((storySummaries.earth_last as any)["2"] || (storySummaries.earth_not_last as any)["2"]),
    requiredMissionId: "earth-2",
    requiredDescription: "Complete Earth - Level 2",
    planetBadge: "/Earth-Python.svg",
    getScenes: (isPythonLast = false) => {
      const filtered = (earthScenes as any[]).filter(s => {
        if (!s.when) return true;
        if (s.when === 'pythonLast') return isPythonLast;
        if (s.when === '!pythonLast') return !isPythonLast;
        return true;
      });
      return extractMissionScenes(filtered, "earth-2");
    },
  },
  {
    id: "earth-3",
    category: "earth",
    categoryTitle: "Earth Headquarters",
    levelNumber: 3,
    title: "Level 3: Row Zero & The Architect",
    subtitle: "AstroLink Core Restoration",
    thumbnail: "/scenes/backgrounds/earth_bg_003.jpg",
    cast: ["The Architect", "Director Atlas", "Nova", "Operator"],
    summary: ((storySummaries.earth_last as any)["3"] || (storySummaries.earth_not_last as any)["3"]),
    requiredMissionId: "earth-3",
    requiredDescription: "Complete Earth - Level 3",
    planetBadge: "/Earth-Python.svg",
    getScenes: (isPythonLast = false) => {
      const filtered = (earthScenes as any[]).filter(s => {
        if (!s.when) return true;
        if (s.when === 'pythonLast') return isPythonLast;
        if (s.when === '!pythonLast') return !isPythonLast;
        return true;
      });
      return extractMissionScenes(filtered, "earth-3");
    },
  },

  // 8. EPILOGUE
  {
    id: "epilogue",
    category: "epilogue",
    categoryTitle: "Epilogue: Finale",
    title: "Across the Stars",
    subtitle: "Uniting the Solar System",
    thumbnail: "/scenes/backgrounds/epilogue_bg_001.jpg",
    cast: ["The Core (Good)", "Nova", "Operator", "Narrator"],
    summary: "With the AstroLink restored and the solar storm calmed, all six inner and giant worlds hum in cosmic harmony. The Chief Astronaut and Nova gaze across the reunited system, as the journey reaches its celebratory climax.",
    requiredMissionId: "earth-3",
    requiredDescription: "Complete Earth - Level 3 (Story Finale)",
    planetBadge: "/assets/planets/celestial/Sun.svg",
    getScenes: () => epilogueScenes,
  },
];

export function isStoryEntryUnlocked({
  entry,
  completedMissionIds,
  hasTakenAptitudeTest,
  isDemoMode,
}: {
  entry: StoryArchiveEntry;
  completedMissionIds: Set<string>;
  hasTakenAptitudeTest: boolean;
  isDemoMode: boolean;
}): boolean {
  if (isDemoMode) return true;

  if (entry.id === "prologue") {
    return hasTakenAptitudeTest || completedMissionIds.size > 0;
  }

  if (entry.requiredMissionId) {
    const target = entry.requiredMissionId.toLowerCase();
    return (
      completedMissionIds.has(target) ||
      (target === "mars-1" && completedMissionIds.has("html-1")) ||
      (target === "mars-2" && completedMissionIds.has("html-2")) ||
      (target === "mars-3" && completedMissionIds.has("html-3")) ||
      (target === "venus-1" && completedMissionIds.has("css-1")) ||
      (target === "venus-2" && completedMissionIds.has("css-2")) ||
      (target === "venus-3" && completedMissionIds.has("css-3")) ||
      (target === "mercury-1" && (completedMissionIds.has("js-1") || completedMissionIds.has("javascript-1"))) ||
      (target === "mercury-2" && (completedMissionIds.has("js-2") || completedMissionIds.has("javascript-2"))) ||
      (target === "mercury-3" && (completedMissionIds.has("js-3") || completedMissionIds.has("javascript-3"))) ||
      (target === "jupiter-1" && completedMissionIds.has("java-1")) ||
      (target === "jupiter-2" && completedMissionIds.has("java-2")) ||
      (target === "jupiter-3" && completedMissionIds.has("java-3")) ||
      (target === "saturn-1" && completedMissionIds.has("cpp-1")) ||
      (target === "saturn-2" && completedMissionIds.has("cpp-2")) ||
      (target === "saturn-3" && completedMissionIds.has("cpp-3")) ||
      (target === "earth-1" && completedMissionIds.has("python-1")) ||
      (target === "earth-2" && completedMissionIds.has("python-2")) ||
      (target === "earth-3" && completedMissionIds.has("python-3")) ||
      (target === "epilogue" && (completedMissionIds.has("earth-3") || completedMissionIds.has("python-3") || completedMissionIds.has("epilogue")))
    );
  }

  return false;
}
