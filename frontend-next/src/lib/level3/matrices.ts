export interface LevelThreeMatrixConfig {
  sectionId: number | string;
  name: string;
  subtag: string;
  desc: string;
  tip: string;
  matrix: number[][];
  startPos: { x: number; y: number; direction: number };
  maxBlocks?: number;
}

// Section 1: The AND Gate (1x7 corridor)
export const SECTION_1_MATRIX: LevelThreeMatrixConfig = {
  sectionId: 1,
  name: "Section 1: The AND Gate",
  subtag: "Section 1 of 5",
  desc: "Scan the dashboard nodes! Use the AND block to take power only when a node is BOTH Blue AND Stable. Watch out for red traps!",
  tip: "Hint: Use If (scan node color == 'Blue' AND scan node state == 'Stable') -> extract power.",
  matrix: [
    [3, 1, 10, 1, 11, 1, 8],
  ],
  startPos: { x: 0, y: 0, direction: 1 }, // (0,0) facing East
  maxBlocks: 6,
};

// Section 2: The NOT Gate (3x5 zig-zag)
export const SECTION_2_MATRIX: LevelThreeMatrixConfig = {
  sectionId: 2,
  name: "Section 2: The NOT Gate",
  subtag: "Section 2 of 5",
  desc: "Drive along the zigzag path. Use the NOT block to skip any Red trap nodes and take power from the Green nodes!",
  tip: "Hint: Use If NOT (scan node color == 'Red') -> extract power.",
  matrix: [
    [3, 1, 11, 0, 0],
    [0, 1, 12, 1, 0],
    [0, 0, 11, 1, 8],
  ],
  startPos: { x: 0, y: 0, direction: 1 },
  maxBlocks: 8,
};

// Section 3: The Mission Control Hub (7x7 interactive level selector)
export const SECTION_3_MATRIX: LevelThreeMatrixConfig = {
  sectionId: 3,
  name: "Section 3: Mission Control Hub",
  subtag: "Section 3 of 5",
  desc: "Drive to the terminal pads to choose your final challenge levels. Once you pick, drive back to the center tile and lock in your choices!",
  tip: "Hint: Pick at least one challenge terminal, then return to the middle tile [3, 3] to lock in.",
  matrix: [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 21, 1, 1, 1, 22, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 3, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 23, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  startPos: { x: 3, y: 3, direction: 0 }, // Center [3,3]
  maxBlocks: 14,
};

// --- HARDCORE MATRICES (Section 4 & 5) ---

// Option A: hard_nav (10x10 maze grid with hazards)
export const OPTION_A_HARD_NAV: LevelThreeMatrixConfig = {
  sectionId: 'hard_nav',
  name: "Bonus Challenge A: Hazard Maze",
  subtag: "Maze Navigation",
  desc: "Drive through the maze without touching red hazard tiles to reach the ignition goal!",
  tip: "Hint: Use repeat loops to drive cleanly through each turn.",
  matrix: [
    [3, 1, 1, 2, 1, 1, 1, 2, 1, 1],
    [0, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [1, 1, 1, 1, 1, 2, 1, 1, 1, 1],
    [1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    [1, 1, 10, 1, 1, 1, 1, 10, 1, 1],
    [2, 2, 2, 2, 2, 2, 1, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 2, 1, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 1, 2],
    [1, 1, 1, 12, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 1, 8],
  ],
  startPos: { x: 0, y: 0, direction: 1 },
  maxBlocks: 10,
};

// Option B: hard_sort (1x15 straight line stream of nodes)
export const OPTION_B_HARD_SORT: LevelThreeMatrixConfig = {
  sectionId: 'hard_sort',
  name: "Bonus Challenge B: Fast Power Sorter",
  subtag: "Sorting Challenge",
  desc: "Drive along the line of nodes. Use 'repeat until engine charged' and check node colors to reach 100% power without hitting traps!",
  tip: "Hint: Use repeat until engine charged, and only take power from safe nodes.",
  matrix: [
    [3, 10, 11, 10, 11, 13, 10, 11, 10, 14, 12, 11, 10, 1, 8],
  ],
  startPos: { x: 0, y: 0, direction: 1 },
  maxBlocks: 8,
};

// Option C: hard_logic (8x8 open grid packed with all 5 types of Dashboard Nodes)
export const OPTION_C_HARD_LOGIC: LevelThreeMatrixConfig = {
  sectionId: 'hard_logic',
  name: "Bonus Challenge C: Master Logic Test",
  subtag: "Logic Challenge",
  desc: "An open area filled with energy nodes! Combine AND, OR, and NOT blocks to collect safe power, reach 100%, and ignite the engine.",
  tip: "Hint: Take power if (Blue AND Stable) OR (Green AND Stable).",
  matrix: [
    [3, 1, 10, 1, 11, 1, 13, 1],
    [1, 14, 1, 12, 1, 11, 1, 10],
    [10, 1, 13, 1, 10, 1, 12, 1],
    [1, 11, 1, 14, 1, 13, 1, 11],
    [12, 1, 10, 1, 12, 1, 10, 1],
    [1, 13, 1, 11, 1, 14, 1, 12],
    [10, 1, 12, 1, 10, 1, 11, 1],
    [1, 11, 1, 13, 1, 10, 8],
  ],
  startPos: { x: 0, y: 0, direction: 1 },
  maxBlocks: 16,
};

export function getLevelThreeSectionConfig(activeSection: number, missionQueue: string[]): LevelThreeMatrixConfig {
  if (activeSection === 1) return SECTION_1_MATRIX;
  if (activeSection === 2) return SECTION_2_MATRIX;
  if (activeSection === 3) return SECTION_3_MATRIX;

  // Section 4 & 5: Hardcore Router evaluation
  const currentModule = missionQueue[0];
  if (currentModule === 'hard_nav') return OPTION_A_HARD_NAV;
  if (currentModule === 'hard_sort') return OPTION_B_HARD_SORT;
  if (currentModule === 'hard_logic') return OPTION_C_HARD_LOGIC;

  // Default fallback if queue is initialized or empty
  return OPTION_A_HARD_NAV;
}
