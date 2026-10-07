/**
 * Unified Level & Mission Preview Image Mapping based on Story Cutscenes
 * Each level card across all 7 planetary systems is assigned its own distinct,
 * thematic cutscene background image.
 */

export const MISSION_PREVIEW_IMAGES: Record<string, string> = {
  // 1. The Moon (Tutorial)
  // Level 1: Lunar surface training grounds with Oberion & Nova
  "moon-1": "/scenes/backgrounds/bg_001.png",
  "tutorial-1": "/scenes/backgrounds/bg_001.png",
  // Level 2: Equipment loading bay / packing the rover supplies
  "moon-2": "/scenes/backgrounds/bg_002.png",
  "tutorial-2": "/scenes/backgrounds/bg_002.png",
  // Level 3: Starship flight cockpit & engine systems reboot
  "moon-3": "/scenes/backgrounds/bg_007.png",
  "tutorial-3": "/scenes/backgrounds/bg_007.png",

  // 2. Mars (HTML)
  // Level 1: Martian colony towers & billboards with Director Mark
  "mars-1": "/scenes/backgrounds/bg_006.png",
  "mars-1-part2": "/scenes/backgrounds/bg_006.png",
  "html-1": "/scenes/backgrounds/bg_006.png",
  // Level 2: Living cabin screens & placeholder boxes with Emma & Penny
  "mars-2": "/scenes/backgrounds/bg_002.png",
  "html-2": "/scenes/backgrounds/bg_002.png",
  // Level 3: Transmission console / live inter-planetary communications deck
  "mars-3": "/scenes/backgrounds/bg_009.png",
  "html-3": "/scenes/backgrounds/bg_009.png",

  // 3. Venus (CSS)
  // Level 1: Professor Spectrum's Color Laboratory (Monochromatic Black & White before styling)
  "venus-1": "/scenes/backgrounds/venus_bg_004_bw.png",
  "css-1": "/scenes/backgrounds/venus_bg_004_bw.png",
  // Level 2: Maintenance room prototype alignment & AstroLink machinery
  "venus-2": "/scenes/backgrounds/venus_bg_005.png",
  "css-2": "/scenes/backgrounds/venus_bg_005.png",
  // Level 3: Restored AstroLink color horizon overriding the dead zones
  "venus-3": "/scenes/backgrounds/venus_bg_007.png",
  "css-3": "/scenes/backgrounds/venus_bg_007.png",

  // 4. Mercury (JavaScript)
  // Level 1: Professor Dominic's Biodome life support & flora
  "mercury-1": "/scenes/backgrounds/mercury_bg_002.png",
  "js-1": "/scenes/backgrounds/mercury_bg_002.png",
  "js-1-mercury": "/scenes/backgrounds/mercury_bg_002.png",
  "javascript-1": "/scenes/backgrounds/mercury_bg_002.png",
  // Level 2: Factory conveyor belt manufacturing tracks
  "mercury-2": "/scenes/backgrounds/mercury_bg_003.png",
  "js-2": "/scenes/backgrounds/mercury_bg_003.png",
  "js-2-mercury": "/scenes/backgrounds/mercury_bg_003.png",
  "javascript-2": "/scenes/backgrounds/mercury_bg_003.png",
  // Level 3: Multi-monitor communication relay interface restored
  "mercury-3": "/scenes/backgrounds/mercury_bg_004.png",
  "js-3": "/scenes/backgrounds/mercury_bg_004.png",
  "js-3-mercury": "/scenes/backgrounds/mercury_bg_004.png",
  "javascript-3": "/scenes/backgrounds/mercury_bg_004.png",

  // 5. Jupiter (Java)
  // Level 1: Blast Gate 4 / Airlock perimeter security barrier
  "jupiter-1": "/scenes/backgrounds/jupiter_bg_002.png",
  "java-1": "/scenes/backgrounds/jupiter_bg_002.png",
  // Level 2: Cloud Grid archive server room with Technician Io
  "jupiter-2": "/scenes/backgrounds/jupiter_bg_003.png",
  "java-2": "/scenes/backgrounds/jupiter_bg_003.png",
  // Level 3: AI Core lockdown vault terminal
  "jupiter-3": "/scenes/backgrounds/jupiter_bg_004.png",
  "java-3": "/scenes/backgrounds/jupiter_bg_004.png",

  // 6. Saturn (C++)
  // Level 1: Station control panel diagnostics with Engineer Titan
  "saturn-1": "/scenes/backgrounds/saturn_bg_002.png",
  "cpp-1": "/scenes/backgrounds/saturn_bg_002.png",
  // Level 2: Observation deck overlooking the jammed ring plane
  "saturn-2": "/scenes/backgrounds/saturn_bg_003.png",
  "cpp-2": "/scenes/backgrounds/saturn_bg_003.png",
  // Level 3: Mainframe core processing bay / memory leak containment
  "saturn-3": "/scenes/backgrounds/saturn_bg_004.png",
  "cpp-3": "/scenes/backgrounds/saturn_bg_004.png",

  // 7. Earth (Python)
  // Level 1: NETStart HQ exterior arrival / Central Ledger landing pad
  "earth-1": "/scenes/backgrounds/earth_bg_001.jpg",
  "python-1": "/scenes/backgrounds/earth_bg_001.jpg",
  "earth": "/scenes/backgrounds/earth_bg_001.jpg",
  // Level 2: Main NETStart control room with Director Atlas & static screens
  "earth-2": "/scenes/backgrounds/earth_bg_002.jpg",
  "python-2": "/scenes/backgrounds/earth_bg_002.jpg",
  // Level 3: The Architect's Chamber / Row Zero Master Reboot
  "earth-3": "/scenes/backgrounds/earth_bg_003.jpg",
  "python-3": "/scenes/backgrounds/earth_bg_003.jpg",

  // Special / Prologue / Epilogue
  "prologue": "/scenes/backgrounds/bg_001.png",
  "epilogue": "/scenes/backgrounds/epilogue_bg_001.jpg",
};

export const PLANET_DEFAULT_PREVIEWS: Record<string, string[]> = {
  moon: [
    "/scenes/backgrounds/bg_001.png",
    "/scenes/backgrounds/bg_002.png",
    "/scenes/backgrounds/bg_007.png",
  ],
  mars: [
    "/scenes/backgrounds/bg_006.png",
    "/scenes/backgrounds/bg_002.png",
    "/scenes/backgrounds/bg_009.png",
  ],
  venus: [
    "/scenes/backgrounds/venus_bg_004_bw.png",
    "/scenes/backgrounds/venus_bg_005.png",
    "/scenes/backgrounds/venus_bg_007.png",
  ],
  mercury: [
    "/scenes/backgrounds/mercury_bg_002.png",
    "/scenes/backgrounds/mercury_bg_003.png",
    "/scenes/backgrounds/mercury_bg_004.png",
  ],
  jupiter: [
    "/scenes/backgrounds/jupiter_bg_002.png",
    "/scenes/backgrounds/jupiter_bg_003.png",
    "/scenes/backgrounds/jupiter_bg_004.png",
  ],
  saturn: [
    "/scenes/backgrounds/saturn_bg_002.png",
    "/scenes/backgrounds/saturn_bg_003.png",
    "/scenes/backgrounds/saturn_bg_004.png",
  ],
  earth: [
    "/scenes/backgrounds/earth_bg_001.jpg",
    "/scenes/backgrounds/earth_bg_002.jpg",
    "/scenes/backgrounds/earth_bg_003.jpg",
  ],
};

// Aliases for planetary track names
PLANET_DEFAULT_PREVIEWS["html"] = PLANET_DEFAULT_PREVIEWS["mars"];
PLANET_DEFAULT_PREVIEWS["css"] = PLANET_DEFAULT_PREVIEWS["venus"];
PLANET_DEFAULT_PREVIEWS["js"] = PLANET_DEFAULT_PREVIEWS["mercury"];
PLANET_DEFAULT_PREVIEWS["javascript"] = PLANET_DEFAULT_PREVIEWS["mercury"];
PLANET_DEFAULT_PREVIEWS["java"] = PLANET_DEFAULT_PREVIEWS["jupiter"];
PLANET_DEFAULT_PREVIEWS["cpp"] = PLANET_DEFAULT_PREVIEWS["saturn"];
PLANET_DEFAULT_PREVIEWS["python"] = PLANET_DEFAULT_PREVIEWS["earth"];
PLANET_DEFAULT_PREVIEWS["tutorial"] = PLANET_DEFAULT_PREVIEWS["moon"];

/**
 * Returns the exact cutscene background image URL for a given mission.
 * For Venus Level 1, displays the black-and-white laboratory before completion,
 * and restores vibrant color once the cadet has completed the level!
 */
export function getMissionPreviewImage(
  missionId?: string, 
  moduleId?: string, 
  index?: number, 
  _isCompleted?: boolean
): string {
  if (missionId) {
    const cleanId = missionId.toLowerCase().trim();
    if (cleanId === 'venus-1' || cleanId === 'css-1') {
      return "/scenes/backgrounds/venus_bg_004_bw.png";
    }
    if (MISSION_PREVIEW_IMAGES[cleanId]) {
      return MISSION_PREVIEW_IMAGES[cleanId];
    }
  }

  const cleanModule = moduleId ? moduleId.toLowerCase().trim() : undefined;
  if (cleanModule && PLANET_DEFAULT_PREVIEWS[cleanModule]) {
    const arr = PLANET_DEFAULT_PREVIEWS[cleanModule];
    if (index !== undefined && index >= 0) {
      if ((cleanModule === 'venus' || cleanModule === 'css') && index === 0) {
        return "/scenes/backgrounds/venus_bg_004_bw.png";
      }
      return arr[Math.min(index, arr.length - 1)];
    }
  }

  // Fallback pattern if index is available
  if (index !== undefined) {
    if (index === 0) return "/scenes/backgrounds/bg_001.png";
    if (index === 1) return "/scenes/backgrounds/bg_002.png";
    return "/scenes/backgrounds/bg_007.png";
  }

  return "/scenes/backgrounds/bg_001.png";
}

/**
 * Match mission aliases across legacy, full-name, and abbreviated formats.
 * Ensures ongoing mission sessions seamlessly sync with cards.
 */
export function matchMissionAliases(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const aL = a.toLowerCase().trim();
  const bL = b.toLowerCase().trim();
  if (aL === bL) return true;

  // Moon / Tutorial
  if ((aL === 'moon-1' || aL === 'tutorial-1') && (bL === 'moon-1' || bL === 'tutorial-1')) return true;
  if ((aL === 'moon-2' || aL === 'tutorial-2') && (bL === 'moon-2' || bL === 'tutorial-2')) return true;
  if ((aL === 'moon-3' || aL === 'tutorial-3') && (bL === 'moon-3' || bL === 'tutorial-3')) return true;

  // Mars / HTML
  if ((aL === 'mars-1' || aL === 'html-1' || aL === 'mars-1-part2') && (bL === 'mars-1' || bL === 'html-1' || bL === 'mars-1-part2')) return true;
  if ((aL === 'mars-2' || aL === 'html-2') && (bL === 'mars-2' || bL === 'html-2')) return true;
  if ((aL === 'mars-3' || aL === 'html-3') && (bL === 'mars-3' || bL === 'html-3')) return true;

  // Venus / CSS
  if ((aL === 'venus-1' || aL === 'css-1') && (bL === 'venus-1' || bL === 'css-1')) return true;
  if ((aL === 'venus-2' || aL === 'css-2') && (bL === 'venus-2' || bL === 'css-2')) return true;
  if ((aL === 'venus-3' || aL === 'css-3') && (bL === 'venus-3' || bL === 'css-3')) return true;

  // Mercury / JavaScript
  const isMerc1 = (v: string) => v === 'mercury-1' || v === 'js-1' || v === 'js-1-mercury' || v === 'javascript-1';
  if (isMerc1(aL) && isMerc1(bL)) return true;

  const isMerc2 = (v: string) => v === 'mercury-2' || v === 'js-2' || v === 'js-2-mercury' || v === 'javascript-2';
  if (isMerc2(aL) && isMerc2(bL)) return true;

  const isMerc3 = (v: string) => v === 'mercury-3' || v === 'js-3' || v === 'js-3-mercury' || v === 'javascript-3';
  if (isMerc3(aL) && isMerc3(bL)) return true;

  // Jupiter / Java
  if ((aL === 'jupiter-1' || aL === 'java-1') && (bL === 'jupiter-1' || bL === 'java-1')) return true;
  if ((aL === 'jupiter-2' || aL === 'java-2') && (bL === 'jupiter-2' || bL === 'java-2')) return true;
  if ((aL === 'jupiter-3' || aL === 'java-3') && (bL === 'jupiter-3' || bL === 'java-3')) return true;

  // Saturn / C++
  if ((aL === 'saturn-1' || aL === 'cpp-1') && (bL === 'saturn-1' || bL === 'cpp-1')) return true;
  if ((aL === 'saturn-2' || aL === 'cpp-2') && (bL === 'saturn-2' || bL === 'cpp-2')) return true;
  if ((aL === 'saturn-3' || aL === 'cpp-3') && (bL === 'saturn-3' || bL === 'cpp-3')) return true;

  // Earth / Python
  if ((aL === 'earth-1' || aL === 'python-1' || aL === 'earth') && (bL === 'earth-1' || bL === 'python-1' || bL === 'earth')) return true;
  if ((aL === 'earth-2' || aL === 'python-2') && (bL === 'earth-2' || bL === 'python-2')) return true;
  if ((aL === 'earth-3' || aL === 'python-3') && (bL === 'earth-3' || bL === 'python-3')) return true;

  return false;
}
