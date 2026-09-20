"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { javascriptGenerator } from 'blockly/javascript';
import '@/lib/customblocks';
import { generatePlainEnglishPseudocode } from '@/lib/customblocks';
import PlainEnglishCodeViewer from '@/components/PlainEnglishCodeViewer';
import { useNavigationGuard } from '@/context/NavigationGuardContext';
import { 
  Play, 
  RotateCcw, 
  Rocket, 
  Zap, 
  Radio, 
  CheckCircle2, 
  Circle, 
  Check, 
  ChevronDown, 
  ChevronRight,
  Flame,
  Settings,
  Target,
  Sparkles,
  Menu,
  Crosshair,
  Plus,
  Minus,
  Trash2,
  BoxSelect,
  Copy,
  ClipboardPaste,
  Layers,
  Flag,
  Pause,
  AlertTriangle,
  AlertCircle, 
  Bomb, 
  Lock,
  X,
  LogOut,
  Square,
  Package,
  Shield,
  Scan,
  HelpCircle,
  Apple,
  ChevronLeft
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useProgression } from '@/context/ProgressionContext';
import { XP_REWARDS } from '@/lib/leveling';
import {
  getSectionConveyorQueue,
  validateConveyorVictory,
  type ConveyorItem,
  type ConveyorInventory,
  type ConveyorItemType
} from '@/hooks/useConveyorEngine';
import StarshipProtocolConsole from '@/components/level3/StarshipProtocolConsole';
import OxygenMaze from '@/components/level3/OxygenMaze';
import FlightSimulation, { FlightSimulationRef, FlightSimulationState, FlightAction } from '@/components/level3/FlightSimulation';
import FuelSynthesis, { FuelSynthesisRef, FuelSimulationMethods } from '@/components/level3/FuelSynthesis';

Blockly.setLocale(En as any);

export interface LevelSection {
  sectionIndex: number;
  name: string;
  subtag: string;
  desc: string;
  tip: string;
  initialState: { x: number; y: number; direction: number };
  maze: number[][];
  objectives: { id: number; text: string; completed: boolean; isClaimed?: boolean }[];
}

// 4 Sections for Level 1 (Moon: Level 1 - Level 1: Stellar Beginnings)
// Tile Legend: 0 = Invisible/Unplayable Void, 1 = Playable Tile, 2 = Bomb, 3 = Start, 4 = Goal
export const LEVEL_1_SECTIONS: LevelSection[] = [
  // Section 1: Intro corridor teaching basic linear sequencing
  {
    sectionIndex: 0,
    name: "Section 1",
    subtag: "Section 1 of 4",
    desc: "Welcome to NETStart! Team up with your trusty assistant, Nova, to learn how to guide your rover safely to the goal.",
    tip: "Hint: Stack your movement blocks between the Start and End blocks, then click Run Code!",
    initialState: { x: 1, y: 1, direction: 1 }, // Start at (1,1) facing East
    maze: [
      [0, 0, 0, 0, 0, 0],
      [0, 3, 1, 1, 1, 0], // Start at (1,1) -> (2,1) -> (3,1) -> (4,1)
      [0, 0, 0, 0, 1, 0], // (4,2)
      [0, 0, 0, 0, 4, 0], // Goal beacon at (4,3)
      [0, 0, 0, 0, 0, 0],
    ],
    objectives: [
      { id: 1, text: "Use both the Start and End blocks", completed: false, isClaimed: false },
      { id: 2, text: "Run your first code", completed: false, isClaimed: false },
      { id: 3, text: "Reach the Goal", completed: false, isClaimed: false }
    ]
  },
  // Section 2: Stepped path teaching sequential turning and multi-step navigation
  {
    sectionIndex: 1,
    name: "Section 2",
    subtag: "Section 2 of 4",
    desc: "Practice directional navigation by guiding the rover across the stepped lunar pathway.",
    tip: "Hint: Plan each movement step-by-step to follow the clear pathway to the goal.",
    initialState: { x: 1, y: 1, direction: 1 }, // Start at (1,1) facing East
    maze: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 3, 1, 1, 0, 0, 0], // Start (1,1) -> (2,1) -> (3,1)
      [0, 0, 0, 1, 0, 0, 0], // Down to (3,2)
      [0, 0, 0, 1, 1, 4, 0], // East to (4,3) -> Goal (5,3)
      [0, 0, 0, 0, 0, 0, 0],
    ],
    objectives: [
      { id: 1, text: "Use both the Start and End blocks", completed: false, isClaimed: false },
      { id: 2, text: "Use 5 or more movement blocks", completed: false, isClaimed: false },
      { id: 3, text: "Reach the Goal", completed: false, isClaimed: false }
    ]
  },
  // Section 3: Winding switchback ridge requiring multiple direction changes
  {
    sectionIndex: 2,
    name: "Section 3",
    subtag: "Section 3 of 4",
    desc: "Navigate the switchback ridge by combining three different movement directions.",
    tip: "Hint: You will need to move Right, Down, and Left to stay on track!",
    initialState: { x: 1, y: 1, direction: 1 }, // Start at (1,1) facing East
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 1, 1, 1, 1, 0, 0], // Start (1,1) -> (5,1)
      [0, 0, 0, 0, 0, 1, 0, 0], // (5,2)
      [0, 0, 1, 1, 1, 1, 0, 0], // (5,3) <- (2,3)
      [0, 0, 1, 0, 0, 0, 0, 0], // (2,4)
      [0, 0, 1, 1, 1, 4, 0, 0], // (2,5) -> Goal (5,5)
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    objectives: [
      { id: 1, text: "Use both the Start and End blocks", completed: false, isClaimed: false },
      { id: 2, text: "Use 3 different movement directions", completed: false, isClaimed: false },
      { id: 3, text: "Reach the Goal", completed: false, isClaimed: false }
    ]
  },
  // Section 4: Complex multi-directional maze path
  {
    sectionIndex: 3,
    name: "Section 4",
    subtag: "Section 4 of 4",
    desc: "Master linear navigation by guiding the rover through a complex full-grid path utilizing all four directions.",
    tip: "Hint: Plan your complete route from start to finish using Up, Down, Left, and Right blocks.",
    initialState: { x: 1, y: 1, direction: 1 }, // Start at (1,1) facing East
    maze: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 1, 1, 0, 0, 0, 0], // Start (1,1) East -> (3,1)
      [0, 0, 0, 1, 1, 1, 0, 0], // (3,2) -> (5,2)
      [0, 4, 0, 0, 0, 1, 1, 0], // Goal at (1,3) | (5,3) -> (6,3)
      [0, 1, 1, 1, 0, 0, 1, 0], // (1,4) <- (2,4) <- (3,4) | (6,4)
      [0, 0, 0, 1, 1, 1, 1, 0], // (3,5) <- (4,5) <- (5,5) <- (6,5)
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    objectives: [
      { id: 1, text: "Use both the Start and End blocks", completed: false, isClaimed: false },
      { id: 2, text: "Use all 4 movement directions", completed: false, isClaimed: false },
      { id: 3, text: "Reach the Goal", completed: false, isClaimed: false }
    ]
  }
];

// 3 Sections for Level 3 (Moon: Level 3 - Level 3: The Starship Protocol)
export const LEVEL_3_SECTIONS: LevelSection[] = [
  // Section 1: Air Vent (7x7 Cross Layout)
  {
    sectionIndex: 0,
    name: "Air Vent",
    subtag: "Section 1 of 3",
    desc: "Guide the air flow through the cross ventilation system to the cabin! Avoid the broken fans and reach the Cabin Goal.",
    tip: "Hint: Evade the broken fans by using If/Else with 'is hazard ahead' or weaving through the cross corridors.",
    initialState: { x: 0, y: 3, direction: 1 }, // Start at (0,3) facing East
    maze: [
      [0, 0, 1, 0, 1, 0, 0], // Row 1 (Wall at Col 4)
      [1, 1, 1, 1, 1, 1, 1], // Row 2 (Full Open Street)
      [1, 0, 1, 0, 1, 0, 3], // Row 3 (Fan 3 directly above Goal)
      [1, 1, 1, 3, 1, 1, 4], // Row 4 (Start (0,3), Fan 1 (3,3), Goal (6,3))
      [1, 0, 1, 0, 1, 0, 1], // Row 5
      [1, 1, 1, 1, 3, 1, 1], // Row 6 (Fan 2 (4,5))
      [0, 0, 1, 0, 1, 0, 0], // Row 7
    ],
    objectives: [
      { id: 1, text: "Use both Start and End blocks", completed: false, isClaimed: false },
      { id: 2, text: "Use a loop block or an if/else block", completed: false, isClaimed: false },
      { id: 3, text: "Reach the Cabin goal", completed: false, isClaimed: false }
    ]
  },
  // Section 2: Fuel Synthesis (Nested Loops & Colors)
  {
    sectionIndex: 1,
    name: "Fuel Synthesis",
    subtag: "Section 2 of 3",
    desc: "Synthesize 3 batches of fuel. Activate each batch with Heat and Solution, refine Blue and Green fuel to Orange, and store in the fuel tank.",
    tip: "Hint: Repeat 3 times: Activate with Heat and Solution first, check the fuel color, refine to Orange, and store.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Use both Start and End blocks", completed: false, isClaimed: false },
      { id: 2, text: "Refine blue fuel and green fuel", completed: false, isClaimed: false },
      { id: 3, text: "Store all 3 batches in the fuel tank", completed: false, isClaimed: false }
    ]
  },
  // Section 3: Flight Simulation (Emergency Reactions & Friendly UFOs)
  {
    sectionIndex: 2,
    name: "Flight Simulation",
    subtag: "Section 3 of 3",
    desc: "Keep the spaceship safe for 60 seconds! Program event responses with Cases and greet friendly UFOs.",
    tip: "Hint: Match each event: Fuel < 20% -> Refill Fuel; Oxygen < 20% -> Pump Oxygen; Small Asteroid -> Fire Lasers; Big Asteroid -> Activate Shield; Friendly UFO -> Greet UFO.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Destroy all small asteroids with lasers", completed: false, isClaimed: false },
      { id: 2, text: "Greet all friendly UFOs", completed: false, isClaimed: false },
      { id: 3, text: "Survive the 60-second flight", completed: false, isClaimed: false }
    ]
  }
];

// 4 Sections for Level 2 (Moon: Level 2 - Level 2: Resource Classification - Conveyor Belt Sorting)
export const LEVEL_2_SECTIONS: LevelSection[] = [
  // Section 1: Exactly 10 items (100% Cargo - Intro to Loops, Mandatory Scanning & Packing)
  {
    sectionIndex: 0,
    name: "Section 1",
    subtag: "Section 1 of 4",
    desc: "Learn the conveyor workflow: Use a repeat loop to scan and pack 10 Cargo containers into the cargo bay.",
    tip: "Tip: Place 'Scan Current Item' and 'Pack Cargo' inside a 'Repeat 10 times' loop.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Use both Start and End blocks", completed: false, isClaimed: false },
      { id: 2, text: "Use Repeat and Scan blocks", completed: false, isClaimed: false },
      { id: 3, text: "Scan and Pack all 10 Cargo Containers", completed: false, isClaimed: false }
    ]
  },
  // Section 2: Exactly 15 items (Binary Classifier: Cargo vs Trash)
  {
    sectionIndex: 1,
    name: "Section 2",
    subtag: "Section 2 of 4",
    desc: "Sort 15 items: Pack Cargo into the cargo bay and discard Space Junk into the trash chute.",
    tip: "Tip: Scan current item. If it is Cargo, pack it; otherwise discard it into the trash chute.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Use an If / Else block", completed: false, isClaimed: false },
      { id: 2, text: "Discard all Space Junk", completed: false, isClaimed: false },
      { id: 3, text: "Pack all Cargo Containers", completed: false, isClaimed: false }
    ]
  },
  // Section 3: Exactly 20 items (Tri-Classifier: Cargo, Trash, Fuel)
  {
    sectionIndex: 2,
    name: "Section 3",
    subtag: "Section 3 of 4",
    desc: "Sort 20 items: Route Fuel to the Fuel Bay, Cargo to the Cargo Bay, and discard Space Junk.",
    tip: "Tip: Scan the item, check if it is Fuel, Cargo, or Trash, and route each item to its designated bay.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Route all Fuel to Fuel Bay", completed: false, isClaimed: false },
      { id: 2, text: "Pack all Cargo Containers", completed: false, isClaimed: false },
      { id: 3, text: "Discard all Space Junk", completed: false, isClaimed: false }
    ]
  },
  // Section 4: Exactly 25 items (Quad-Classifier Master Sorting Gauntlet)
  {
    sectionIndex: 3,
    name: "Section 4",
    subtag: "Section 4 of 4",
    desc: "Sort all 25 items on the conveyor: Cargo, Trash, Fuel, and Food without errors.",
    tip: "Tip: Repeat 25 times to scan and route all four item types to their designated bays.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Route all Fuel & Food", completed: false, isClaimed: false },
      { id: 2, text: "Pack Cargo & Discard Trash", completed: false, isClaimed: false },
      { id: 3, text: "Sort all 25 items with 0 errors", completed: false, isClaimed: false }
    ]
  }
];

// Standalone Daily Challenge Levels (Rotating Daily Challenge Pool)
export const DAILY_CHALLENGE_WEAVE_TRAP: LevelSection = {
  sectionIndex: 0,
  name: "Weave Trap",
  subtag: "Daily Challenge Mission",
  desc: "Hazard alert! Watch out for red bomb traps and weave through safe paths to reach the extraction goal.",
  tip: "Hint: Evade the red hazard bombs by weaving across loop paths or taking the bottom rail.",
  initialState: { x: 0, y: 3, direction: 1 }, // Start at (0,3) facing East
  maze: [
    [0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 2, 1, 1], // Top rail: Bomb blocks the right side bypass
    [1, 0, 1, 0, 1, 0, 1], // Hollow cores
    [3, 1, 2, 1, 1, 1, 4], // Equator: Start at (0,3), Bomb at (2,3), Goal at (6,3)
    [1, 0, 1, 0, 1, 0, 1], // Hollow cores
    [1, 1, 1, 1, 1, 1, 1], // Bottom rail: Safe bypass route
    [0, 0, 0, 0, 0, 0, 0],
  ],
  objectives: [
    { id: 1, text: "Use both the Start and End blocks", completed: false, isClaimed: false },
    { id: 2, text: "Avoid the bombs", completed: false, isClaimed: false },
    { id: 3, text: "Reach the Goal", completed: false, isClaimed: false }
  ]
};

export const DAILY_CHALLENGE_LANE_CHANGER: LevelSection = {
  sectionIndex: 0,
  name: "Lane Changer",
  subtag: "Daily Challenge Mission",
  desc: "The ultimate daily test! Navigate the grid intersections and avoid the bombs to reach the extraction goal.",
  tip: "Hint: Navigate around the centerpiece blocks and avoid the bombs at [3][2], [3][6], and [5][4].",
  initialState: { x: 3, y: 0, direction: 2 }, // Start at top border (3,0) facing South
  maze: [
    [0, 0, 1, 3, 1, 0, 0], // Row 0: Start at (3,0)
    [0, 0, 1, 0, 1, 0, 0], // Row 1: Sides of the Top Block
    [1, 1, 1, 1, 1, 1, 1], // Row 2: Top horizontal street crossing
    [1, 0, 2, 0, 1, 0, 2], // Row 3: Bombs at [3][2] (Inner Left) and [3][6] (Outer Right)
    [1, 1, 1, 1, 1, 1, 1], // Row 4: Bottom horizontal street crossing
    [0, 0, 1, 0, 2, 0, 0], // Row 5: Bomb at [5][4] (Inner Right). Path [5][2] is SAFE.
    [0, 0, 1, 4, 1, 0, 0]  // Row 6: Goal at (3,6)
  ],
  objectives: [
    { id: 1, text: "Use a condition block", completed: false, isClaimed: false },
    { id: 2, text: "Avoid the bombs", completed: false, isClaimed: false },
    { id: 3, text: "Reach the Goal", completed: false, isClaimed: false }
  ]
};

export const DAILY_CHALLENGE_HAZARD_LABYRINTH: LevelSection = {
  sectionIndex: 0,
  name: "Hazard Labyrinth",
  subtag: "Daily Challenge Mission",
  desc: "Navigate the complex 7x7 orbital labyrinth! Evade hazard sectors and utilize loops or sensory logic to reach the extraction port.",
  tip: "Hint: Use repeat loops and sensory condition checks to bypass hazardous blocks and navigate through the maze.",
  initialState: { x: 0, y: 3, direction: 1 }, // Start at (0,3) facing East
  maze: [
    [0, 0, 1, 2, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 2, 1],
    [3, 1, 1, 1, 1, 1, 4],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 1, 2, 1, 1, 1, 1],
    [0, 0, 1, 0, 1, 0, 0],
  ],
  objectives: [
    { id: 1, text: "Use both Start and End blocks", completed: false, isClaimed: false },
    { id: 2, text: "Avoid all hazard zones", completed: false, isClaimed: false },
    { id: 3, text: "Reach the Goal", completed: false, isClaimed: false }
  ]
};

export const DAILY_CHALLENGE_POOL: LevelSection[] = [
  DAILY_CHALLENGE_WEAVE_TRAP,
  DAILY_CHALLENGE_LANE_CHANGER,
  DAILY_CHALLENGE_HAZARD_LABYRINTH
];

export const getDailyChallengeSection = (missionId: string): LevelSection => {
  const m = (missionId || '').toLowerCase();
  if (m === 'daily-1' || m === 'daily-weave-trap' || m.includes('weave')) {
    return DAILY_CHALLENGE_WEAVE_TRAP;
  }
  if (m === 'daily-2' || m === 'daily-lane-changer' || m.includes('lane')) {
    return DAILY_CHALLENGE_LANE_CHANGER;
  }
  if (m === 'daily-3' || m === 'daily-hazard-labyrinth' || m.includes('hazard') || m.includes('labyrinth')) {
    return DAILY_CHALLENGE_HAZARD_LABYRINTH;
  }

  // Deterministic daily date hash for daily rotation
  const dateMatch = m.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
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

  const idx = Math.abs(seed) % DAILY_CHALLENGE_POOL.length;
  return DAILY_CHALLENGE_POOL[idx];
};

export const DAILY_CHALLENGE_SECTIONS: LevelSection[] = [DAILY_CHALLENGE_WEAVE_TRAP];


// Pure Low-Friction Level 1 Toolbox (Strictly Events & Absolute Directional Movement)
export const tutorialToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Events',
      colour: '#EF4444',
      contents: [
        { kind: 'block', type: 'event_start' },
        { kind: 'block', type: 'event_end' },
      ],
    },
    {
      kind: 'category',
      name: 'Movement',
      colour: '#EAB308',
      contents: [
        { kind: 'block', type: 'move_up' },
        { kind: 'block', type: 'move_down' },
        { kind: 'block', type: 'move_left' },
        { kind: 'block', type: 'move_right' },
      ],
    },
  ],
};

// Progressive Conveyor Belt Toolbox for Level 2 across Sections 1 to 4
export const getConveyorToolboxForSection = (sectionIndex: number) => {
  const eventsCategory = {
    kind: 'category',
    name: 'Events',
    colour: '#EF4444',
    contents: [
      { kind: 'block', type: 'event_start' },
      { kind: 'block', type: 'event_end' },
    ],
  };

  if (sectionIndex === 0) {
    // Section 1: Intro to Loops, Mandatory Scanning, Keywords, Conditions & Send to [Area]
    return {
      kind: 'categoryToolbox',
      contents: [
        eventsCategory,
        {
          kind: 'category',
          name: 'Actions',
          colour: '#3B82F6',
          contents: [
            { kind: 'block', type: 'scan_current_item' },
            { kind: 'block', type: 'send_to_area' },
          ],
        },
        {
          kind: 'category',
          name: 'Keywords',
          colour: '#06B6D4',
          contents: [
            { kind: 'block', type: 'item_cargo' },
            { kind: 'block', type: 'item_trash' },
          ],
        },
        {
          kind: 'category',
          name: 'Conditions',
          colour: '#8B5CF6',
          contents: [
            { kind: 'block', type: 'if_scan_is' },
            { kind: 'block', type: 'if_scan_else' },
          ],
        },
        {
          kind: 'category',
          name: 'Loops',
          colour: '#F97316',
          contents: [
            {
              kind: 'block',
              type: 'repeat_x_times',
              inputs: {
                TIMES: {
                  shadow: {
                    type: 'math_number',
                    fields: {
                      NUM: 10,
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    };
  }

  if (sectionIndex === 1) {
    // Section 2: Binary Classifier (Cargo vs Trash)
    return {
      kind: 'categoryToolbox',
      contents: [
        eventsCategory,
        {
          kind: 'category',
          name: 'Actions',
          colour: '#3B82F6',
          contents: [
            { kind: 'block', type: 'scan_current_item' },
            { kind: 'block', type: 'send_to_area' },
          ],
        },
        {
          kind: 'category',
          name: 'Keywords',
          colour: '#06B6D4',
          contents: [
            { kind: 'block', type: 'item_cargo' },
            { kind: 'block', type: 'item_trash' },
          ],
        },
        {
          kind: 'category',
          name: 'Conditions',
          colour: '#8B5CF6',
          contents: [
            { kind: 'block', type: 'if_scan_is' },
            { kind: 'block', type: 'if_scan_else' },
          ],
        },
        {
          kind: 'category',
          name: 'Loops',
          colour: '#F97316',
          contents: [
            {
              kind: 'block',
              type: 'repeat_x_times',
              inputs: {
                TIMES: {
                  shadow: {
                    type: 'math_number',
                    fields: {
                      NUM: 15,
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    };
  }

  if (sectionIndex === 2) {
    // Section 3: Tri-Classifier (Cargo, Trash, Fuel)
    return {
      kind: 'categoryToolbox',
      contents: [
        eventsCategory,
        {
          kind: 'category',
          name: 'Actions',
          colour: '#3B82F6',
          contents: [
            { kind: 'block', type: 'scan_current_item' },
            { kind: 'block', type: 'send_to_area' },
          ],
        },
        {
          kind: 'category',
          name: 'Keywords',
          colour: '#06B6D4',
          contents: [
            { kind: 'block', type: 'item_cargo' },
            { kind: 'block', type: 'item_trash' },
            { kind: 'block', type: 'item_fuel' },
          ],
        },
        {
          kind: 'category',
          name: 'Conditions',
          colour: '#8B5CF6',
          contents: [
            { kind: 'block', type: 'if_scan_is' },
            { kind: 'block', type: 'if_scan_else' },
          ],
        },
        {
          kind: 'category',
          name: 'Loops',
          colour: '#F97316',
          contents: [
            {
              kind: 'block',
              type: 'repeat_x_times',
              inputs: {
                TIMES: {
                  shadow: {
                    type: 'math_number',
                    fields: {
                      NUM: 20,
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    };
  }

  // Section 4: Quad-Classifier (Cargo, Trash, Fuel, Food)
  return {
    kind: 'categoryToolbox',
    contents: [
      eventsCategory,
      {
        kind: 'category',
        name: 'Actions',
        colour: '#3B82F6',
        contents: [
          { kind: 'block', type: 'scan_current_item' },
          { kind: 'block', type: 'send_to_area' },
        ],
      },
      {
        kind: 'category',
        name: 'Keywords',
        colour: '#06B6D4',
        contents: [
          { kind: 'block', type: 'item_cargo' },
          { kind: 'block', type: 'item_trash' },
          { kind: 'block', type: 'item_fuel' },
          { kind: 'block', type: 'item_food' },
        ],
      },
      {
        kind: 'category',
        name: 'Conditions',
        colour: '#8B5CF6',
        contents: [
          { kind: 'block', type: 'if_scan_is' },
          { kind: 'block', type: 'if_scan_else' },
        ],
      },
      {
        kind: 'category',
        name: 'Loops',
        colour: '#F97316',
        contents: [
          {
            kind: 'block',
            type: 'repeat_x_times',
            inputs: {
              TIMES: {
                shadow: {
                  type: 'math_number',
                  fields: {
                    NUM: 25,
                  },
                },
              },
            },
          },
        ],
      },
    ],
  };
};

export const conveyorToolbox = getConveyorToolboxForSection(0);

// Full Clean Advanced Toolbox for Level 3 & Daily Challenges (Events, Movement, Loops, Conditions)
export const advancedToolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Events',
      colour: '#EF4444',
      contents: [
        { kind: 'block', type: 'event_start' },
        { kind: 'block', type: 'event_end' },
      ],
    },
    {
      kind: 'category',
      name: 'Movement',
      colour: '#EAB308',
      contents: [
        { kind: 'block', type: 'move_up' },
        { kind: 'block', type: 'move_down' },
        { kind: 'block', type: 'move_left' },
        { kind: 'block', type: 'move_right' },
      ],
    },
    {
      kind: 'category',
      name: 'Loops',
      colour: '#A855F7',
      contents: [
        { kind: 'block', type: 'repeat_until_goal' },
        {
          kind: 'block',
          type: 'repeat_x_times',
          inputs: {
            TIMES: {
              shadow: {
                type: 'math_number',
                fields: {
                  NUM: 10,
                },
              },
            },
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Logic & Conditions',
      colour: '#38BDF8',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'controls_ifelse' },
      ],
    },
  ],
};

export const getSectionsForMission = (missionId: string): LevelSection[] => {
  const m = (missionId || '').toLowerCase();
  if (m.startsWith('daily') || m.includes('daily')) {
    return [getDailyChallengeSection(missionId)];
  }
  if (m === 'moon-2' || m === 'html-2') {
    return LEVEL_2_SECTIONS;
  }
  if (m === 'moon-3' || m === 'html-3') {
    return LEVEL_3_SECTIONS;
  }
  return LEVEL_1_SECTIONS;
};

export const getLevelThreeToolboxForSection = (sectionIndex: number) => {
  const eventsCategory = {
    kind: 'category',
    name: 'Events',
    colour: '#EF4444',
    contents: [
      { kind: 'block', type: 'event_start' },
      { kind: 'block', type: 'event_end' },
    ],
  };

  const movementCategory = {
    kind: 'category',
    name: 'Movement',
    colour: '#EAB308',
    contents: [
      { kind: 'block', type: 'move_forward' },
      { kind: 'block', type: 'move_up' },
      { kind: 'block', type: 'move_down' },
      { kind: 'block', type: 'move_left' },
      { kind: 'block', type: 'move_right' },
      { kind: 'block', type: 'turn_left' },
      { kind: 'block', type: 'turn_right' },
    ],
  };

  const numbersCategory = {
    kind: 'category',
    name: 'Numbers',
    colour: '#22C55E',
    contents: [
      { kind: 'block', type: 'math_number' },
    ],
  };

  if (sectionIndex === 0) {
    // Section 1: Air Vent (Use the same advanced toolbox as Challenge Level)
    return advancedToolbox;
  }

  if (sectionIndex === 1) {
    // Section 2: Fuel Synthesis (Events, Loops, Conditionals, Colors, Actions)
    return {
      kind: 'categoryToolbox',
      contents: [
        eventsCategory,
        {
          kind: 'category',
          name: 'Actions',
          colour: '#EC4899',
          contents: [
            { kind: 'block', type: 'action_increase_heat' },
            { kind: 'block', type: 'action_add_solution' },
            { kind: 'block', type: 'action_mix' },
            { kind: 'block', type: 'action_put_fuel_tank' },
          ],
        },
        {
          kind: 'category',
          name: 'Loops',
          colour: '#8B5CF6',
          contents: [
            {
              kind: 'block',
              type: 'repeat_x_times',
              inputs: {
                TIMES: {
                  shadow: {
                    type: 'math_number',
                    fields: { NUM: 3 },
                  },
                },
              },
            },
            { kind: 'block', type: 'repeat_simple' },
          ],
        },
        {
          kind: 'category',
          name: 'Conditionals',
          colour: '#3B82F6',
          contents: [
            { kind: 'block', type: 'controls_if' },
            { kind: 'block', type: 'controls_ifelse' },
            { kind: 'block', type: 'color_is' },
          ],
        },
        {
          kind: 'category',
          name: 'Colors',
          colour: '#06B6D4',
          contents: [
            { kind: 'block', type: 'color_orange' },
            { kind: 'block', type: 'color_blue' },
            { kind: 'block', type: 'color_green' },
          ],
        },
      ],
    };
  }

  if (sectionIndex === 2) {
    // Section 3: Flight Simulation (Cases + Actions)
    return {
      kind: 'categoryToolbox',
      contents: [
        eventsCategory,
        {
          kind: 'category',
          name: 'Cases',
          colour: '#3B82F6',
          contents: [
            { kind: 'block', type: 'case_emergency' },
          ],
        },
        {
          kind: 'category',
          name: 'Actions',
          colour: '#EC4899',
          contents: [
            { kind: 'block', type: 'action_launch_rocket' },
            { kind: 'block', type: 'action_stop_rocket' },
            { kind: 'block', type: 'action_refill_fuel_cells' },
            { kind: 'block', type: 'action_pump_oxygen' },
            { kind: 'block', type: 'action_fire_lasers' },
            { kind: 'block', type: 'action_activate_shield' },
            { kind: 'block', type: 'action_greet_ufo' },
          ],
        },
      ],
    };
  }

  // Section 4: Hyperdrive Warp Jump (Events + Autopilot Routines)
  return {
    kind: 'categoryToolbox',
    contents: [
      eventsCategory,
      {
        kind: 'category',
        name: 'Autopilot Routines',
        colour: '#A855F7',
        contents: [
          { kind: 'block', type: 'func_boost_systems' },
          { kind: 'block', type: 'func_evasive_shields' },
          { kind: 'block', type: 'func_warp_jump' },
        ],
      },
    ],
  };
};

export const getToolboxForMission = (missionId: string, sectionIndex = 0) => {
  const m = (missionId || '').toLowerCase();
  if (m.startsWith('daily') || m.includes('daily')) {
    return advancedToolbox;
  }
  if (m === 'moon-2' || m === 'html-2') {
    return getConveyorToolboxForSection(sectionIndex);
  }
  if (m === 'moon-3' || m === 'html-3') {
    return getLevelThreeToolboxForSection(sectionIndex);
  }
  return tutorialToolbox;
};

function getBlocksInOrder(ws: Blockly.WorkspaceSvg): string[] {
  const ids: string[] = [];
  const topBlocks = ws.getTopBlocks(true);
  function traverse(b: Blockly.Block | null) {
    if (!b) return;
    ids.push(b.id);
    const statementInputs = b.inputList.filter(i => {
      const statementType = (Blockly.inputs && (Blockly.inputs as any).inputTypes) 
        ? (Blockly.inputs as any).inputTypes.STATEMENT 
        : (Blockly as any).inputTypes?.STATEMENT ?? 3;
      return i.type === statementType;
    });
    for (const input of statementInputs) {
      if (input.connection && input.connection.targetBlock()) {
        traverse(input.connection.targetBlock());
      }
    }
    traverse(b.getNextBlock());
  }
  for (const tb of topBlocks) {
    traverse(tb);
  }
  return ids;
}

const getPlanetIconForMission = (mId: string) => {
  const id = (mId || '').toLowerCase();
  if (id.startsWith('moon') || id.startsWith('html-1') || id.startsWith('html-2') || id.startsWith('html-3')) return '/MainMoon.svg';
  if (id.startsWith('mars') || id.startsWith('html')) return '/Planets/Mars.svg';
  if (id.startsWith('venus') || id.startsWith('css')) return '/Planets/Venus.svg';
  if (id.startsWith('mercury') || id.startsWith('javascript') || id.startsWith('js')) return '/Planets/Mercury.svg';
  if (id.startsWith('jupiter') || id.startsWith('java')) return '/Planets/Jupiter.svg';
  if (id.startsWith('saturn') || id.startsWith('cpp')) return '/Planets/Saturn.svg';
  if (id.startsWith('earth') || id.startsWith('python')) return '/Planets/Earth.svg';
  return '/MainMoon.svg';
};

const getMissionDescForMission = (mId: string, isDaily: boolean) => {
  const id = (mId || '').toLowerCase();
  const descMap: Record<string, string> = {
    'moon-1': "Welcome to NETStart! Team up with your trusty assistant, Nova, to learn how to guide your rover safely to the goal.",
    'moon-2': "Nova needs your help packing the ship! Use your new sensors and repeat blocks to scan the assembly line. Figure out what's fuel and what's junk so we can get flying!",
    'moon-3': "Get the starship ready for launch! Guide air through the vents with If/Else, mix rocket fuel with loops, and survive the automated flight simulation.",
    'html-1': "Welcome to NETStart! Team up with your trusty assistant, Nova, to learn how to guide your rover safely to the goal.",
    'html-2': "Nova needs your help packing the ship! Use your new sensors and repeat blocks to scan the assembly line. Figure out what's fuel and what's junk so we can get flying!",
    'html-3': "Get the starship ready for launch! Guide air through the vents with If/Else, mix rocket fuel with loops, and survive the automated flight simulation.",
    'mars-1': "Construct semantic habitat components using header, main, section, and article tags.",
    'mars-2': "Build input fields, select elements, textareas, and master telemetry form attributes.",
    'mars-3': "Master the structure of rows, headers, cells, and embed framing details.",
    'venus-1': "Master targeting classes, ids, properties, and the cascade tree.",
    'mercury-1': "Learn variables, let, const, primitive types, and math routines.",
  };
  return descMap[id] || (isDaily ? "Today's practice level exercise completed in the sandbox." : "Complete objectives and guide your rover or starship safely through the mission challenges.");
};

const getMissionModuleForMission = (mId: string, isDaily: boolean) => {
  const id = (mId || '').toLowerCase();
  if (id.startsWith('moon') || id.startsWith('html-1') || id.startsWith('html-2') || id.startsWith('html-3')) return 'The Moon';
  if (id.startsWith('mars') || id.startsWith('html')) return 'Mars (HTML)';
  if (id.startsWith('venus') || id.startsWith('css')) return 'Venus (CSS)';
  if (id.startsWith('mercury') || id.startsWith('javascript') || id.startsWith('js')) return 'Mercury (JavaScript)';
  if (id.startsWith('jupiter') || id.startsWith('java')) return 'Jupiter (Java)';
  if (id.startsWith('saturn') || id.startsWith('cpp')) return 'Saturn (C++)';
  if (id.startsWith('earth') || id.startsWith('python')) return 'Earth (Python)';
  return isDaily ? 'Daily Level' : 'The Moon';
};

export default function BlocklyMaze() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams.get('missionId') || 'moon-1';
  const isLevel2 = (missionId || '').toLowerCase() === 'moon-2' || (missionId || '').toLowerCase() === 'html-2';
  const isLevel3 = (missionId || '').toLowerCase() === 'moon-3' || (missionId || '').toLowerCase() === 'html-3';
  const currentMissionSections = getSectionsForMission(missionId);
  const planetIcon = getPlanetIconForMission(missionId);

  const missionTitleMap: Record<string, string> = {
    'moon-1': "Level 1: Stellar Beginnings",
    'moon-2': "Level 2: Resource Classification",
    'moon-3': "Level 3: The Starship Protocol",
    'html-1': "Level 1: Stellar Beginnings",
    'html-2': "Level 2: Resource Classification",
    'html-3': "Level 3: The Starship Protocol",
    'mars-1': "Mars Level 1: Semantic Habitat Tags",
    'mars-2': "Mars Level 2: Environmental Forms & Telemetry",
    'mars-3': "Mars Level 3: Mineral Data Tables",
    'venus-1': "Venus Level 1: Thermal Selectors & Cascades",
    'mercury-1': "Mercury Level 1: Variable Orbital Bindings",
  };

  const [currentSection, setCurrentSection] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('mode') === 'replay') return 0;
      const targetMid = (urlParams.get('missionId') || 'moon-1').toLowerCase();
      const completedList: number[] = JSON.parse(localStorage.getItem(`netstart_completed_sections_${targetMid}`) || '[]');
      
      const rawSave = localStorage.getItem('netstart_active_saved_level');
      if (rawSave) {
        const parsed = JSON.parse(rawSave);
        if (parsed.missionId && parsed.missionId.toLowerCase() === targetMid) {
          if (typeof parsed.sectionIndex === 'number' && parsed.sectionIndex >= 0) {
            // Verify that this section is actually unlocked
            let isUnlocked = true;
            for (let s = 0; s < parsed.sectionIndex; s++) {
              if (!completedList.includes(s)) {
                isUnlocked = false;
                break;
              }
            }
            if (isUnlocked) {
              return parsed.sectionIndex;
            }
          }
        }
      }
      if (completedList.length > 0) {
        const sections = getSectionsForMission(targetMid);
        for (let i = 0; i < sections.length; i++) {
          if (!completedList.includes(i)) return i;
        }
      }
    } catch (e) {}
    return 0;
  });
  const activeSection = currentMissionSections[currentSection] || currentMissionSections[0];

  const isDaily = (missionId || '').toLowerCase().startsWith('daily') || (missionId || '').toLowerCase().includes('daily');

  const displayTitle = missionTitleMap[missionId] || (isDaily
    ? `Daily Challenge: ${activeSection?.name || 'Advanced Navigation'}`
    : missionId && !missionId.startsWith('moon') && !missionId.startsWith('html')
    ? missionId.replace(/^daily-level-/, 'Daily ').replace(/^daily/, 'Daily Level ').replace(/-/g, ' ').toUpperCase()
    : "Level 1: Stellar Beginnings");

  const levelSubtitle = isDaily
    ? "Daily Challenge Mission"
    : missionId && missionId.startsWith('moon')
    ? `Moon: Level ${missionId.split('-')[1] || '1'}`
    : missionId 
    ? missionId.toUpperCase().replace('-', ': Level ') 
    : "Moon: Level 1";

  const { data: session } = useSession();
  const user = session?.user as any;
  const { currentXp, addXp, removeXp, playerLevel } = useProgression();

  const { setIsInLevel, registerSaveHandler, unregisterSaveHandler, requestNavigation } = useNavigationGuard();

  interface InventoryState {
    fuel: number;
    oxygen: number;
  }
  const [inventory, setInventory] = useState<InventoryState>({ fuel: 0, oxygen: 0 });

  // Level 2 Conveyor Belt States
  const [conveyorQueue, setConveyorQueue] = useState<ConveyorItem[]>(() => getSectionConveyorQueue(0));
  const [conveyorInventory, setConveyorInventory] = useState<ConveyorInventory>({
    cargo: 0,
    trash: 0,
    fuel: 0,
    food: 0,
    errors: 0,
  });
  const [activeAction, setActiveAction] = useState<'pack_cargo' | 'discard_trash' | 'route_fuel' | 'route_food' | 'pack' | 'discard' | 'scan' | 'none'>('none');
  const [isBeltAdvancing, setIsBeltAdvancing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isCurrentItemScanned, setIsCurrentItemScanned] = useState(false);
  const [animatingItem, setAnimatingItem] = useState<{
    item: ConveyorItem;
    destination: 'cargo' | 'trash' | 'fuel' | 'food';
    isFlying: boolean;
  } | null>(null);

  const [activeGrid, setActiveGrid] = useState<number[][]>(activeSection.maze);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorToastMessage, setErrorToastMessage] = useState('');
  const errorToastTimer = useRef<NodeJS.Timeout | null>(null);

  // Level 2 Target Resource Manifest
  const levelManifest = useMemo(() => {
    if (!isLevel2) return { cargo: 0, trash: 0, fuel: 0, food: 0, total: 0 };
    const initialItems = getSectionConveyorQueue(currentSection);
    const cargo = initialItems.filter(i => i.type === 'cargo').length;
    const trash = initialItems.filter(i => i.type === 'trash').length;
    const fuel = initialItems.filter(i => i.type === 'fuel').length;
    const food = initialItems.filter(i => i.type === 'food').length;
    return { cargo, trash, fuel, food, total: initialItems.length };
  }, [isLevel2, currentSection]);

  // Level 3 Starship Protocol States
  const [level3HazardStep, setLevel3HazardStep] = useState<number>(0);
  const [level3HazardState, setLevel3HazardState] = useState<{
    asteroidShielded: boolean;
    fuelRefueled: boolean;
    oxygenPumped: boolean;
    status: 'idle' | 'running' | 'success' | 'failed';
    failReason?: string;
  }>({
    asteroidShielded: false,
    fuelRefueled: false,
    oxygenPumped: false,
    status: 'idle',
  });

  const [level3ReactorState, setLevel3ReactorState] = useState<{
    allocatedOxygen: number;
    allocatedShields: number;
    allocatedThrusters: number;
    remainingPower: number;
    isBalanced: boolean;
  }>({
    allocatedOxygen: 0,
    allocatedShields: 0,
    allocatedThrusters: 0,
    remainingPower: 100,
    isBalanced: false,
  });

  const [level3WarpState, setLevel3WarpState] = useState<{
    boostActive: boolean;
    shieldsActive: boolean;
    warpActive: boolean;
    isWarping: boolean;
  }>({
    boostActive: false,
    shieldsActive: false,
    warpActive: false,
    isWarping: false,
  });

  const [charState, setCharState] = useState(activeSection.initialState);
  const [isRunning, setIsRunning] = useState(false);
  const [isBumping, setIsBumping] = useState(false);
  const [tookDamage, setTookDamage] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'blocks' | 'syntax'>('blocks');
  const [plainEnglishCode, setPlainEnglishCode] = useState('');
  const [jsCode, setJsCode] = useState('');

  // Drag-to-Select & Copy/Paste States
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [clipboardXml, setClipboardXml] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isDragging: boolean;
  } | null>(null);
  const [showClipboardToast, setShowClipboardToast] = useState(false);
  const [clipboardToastMessage, setClipboardToastMessage] = useState('');
  const clipboardToastTimer = useRef<NodeJS.Timeout | null>(null);
  const flightSimRef = useRef<FlightSimulationRef | null>(null);
  const fuelSynthRef = useRef<FuelSynthesisRef | null>(null);

  const showToast = useCallback((msg: string) => {
    setClipboardToastMessage(msg);
    setShowClipboardToast(true);
    if (clipboardToastTimer.current) clearTimeout(clipboardToastTimer.current);
    clipboardToastTimer.current = setTimeout(() => setShowClipboardToast(false), 3500);
  }, []);

  // Hydrate Level 2 & Level 3 State & Toolbox on section change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__NETSTART_CURRENT_SECTION__ = currentSection;
    }
    if (isLevel2) {
      setConveyorQueue(getSectionConveyorQueue(currentSection));
      setConveyorInventory({ cargo: 0, trash: 0, fuel: 0, food: 0, errors: 0 });
      setActiveAction('none');
      setIsBeltAdvancing(false);
      setIsScanning(false);
      setIsCurrentItemScanned(false);
      setAnimatingItem(null);
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = currentSection;
        workspace.current.updateToolbox(getToolboxForMission(missionId, currentSection));
      }
    } else if (isLevel3) {
      if (currentSection === 0) {
        setActiveGrid(activeSection.maze.map(r => [...r]));
        setCharState({ ...activeSection.initialState });
      }
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = currentSection;
        workspace.current.updateToolbox(getToolboxForMission(missionId, currentSection));
      }
    } else {
      setActiveGrid(activeSection.maze);
    }
  }, [currentSection, isLevel2, isLevel3, activeSection, missionId]);

  // Replay Mode and Claimed Objectives Tracking
  const [isReplayMode, setIsReplayMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const isReplayParam = new URLSearchParams(window.location.search).get('mode') === 'replay';
      const completedList: number[] = JSON.parse(localStorage.getItem(`netstart_completed_sections_${missionId}`) || '[]');
      return isReplayParam || completedList.length >= currentMissionSections.length;
    } catch {
      return false;
    }
  });
  const [claimedDirectives, setClaimedDirectives] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('netstart_claimed_directives') || '[]');
    } catch {
      return [];
    }
  });
  const [objectives, setObjectives] = useState(() => {
    if (typeof window === 'undefined') return activeSection.objectives.map(o => ({ ...o, completed: false }));
    try {
      const claimedList: string[] = JSON.parse(localStorage.getItem('netstart_claimed_directives') || '[]');
      const completedGoalsList: string[] = JSON.parse(localStorage.getItem(`netstart_completed_goals_${missionId}`) || '[]');
      const savedCompletedSections: number[] = JSON.parse(localStorage.getItem(`netstart_completed_sections_${missionId}`) || '[]');
      const isSecDone = savedCompletedSections.includes(currentSection);

      return activeSection.objectives.map(obj => {
        const key = `${missionId}_sec${currentSection}_goal${obj.id}`;
        const isClaimed = claimedList.includes(key);
        const isGoalDone = isSecDone || isClaimed || completedGoalsList.includes(key);
        return {
          ...obj,
          completed: isGoalDone,
          isClaimed: isClaimed || isGoalDone,
        };
      });
    } catch {
      return activeSection.objectives.map(o => ({ ...o, completed: false }));
    }
  });
  const [recentlyCompletedId, setRecentlyCompletedId] = useState<number | null>(null);
  const [buttonPulse, setButtonPulse] = useState(false);

  // Section Progression Locking State (Route Guards)
  const [completedSections, setCompletedSections] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(`netstart_completed_sections_${missionId}`) || '[]');
    } catch {
      return [];
    }
  });

  // Re-sync completedSections if missionId changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(`netstart_completed_sections_${missionId}`);
      if (saved) {
        setCompletedSections(JSON.parse(saved));
      }
    } catch (e) {}
  }, [missionId]);

  const recordSectionCompleted = useCallback((secIdx: number) => {
    setCompletedSections(prev => {
      if (!prev.includes(secIdx)) {
        const updated = [...prev, secIdx];
        try {
          localStorage.setItem(`netstart_completed_sections_${missionId}`, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      }
      return prev;
    });

    // Automatically update saved level to point to the next uncompleted section
    if (secIdx < currentMissionSections.length - 1) {
      try {
        let completedGoals: string[] = [];
        try {
          completedGoals = JSON.parse(localStorage.getItem(`netstart_completed_goals_${missionId}`) || '[]');
        } catch (e) {}
        const nextXml = localStorage.getItem(`netstart_saved_workspace_${missionId}_${secIdx + 1}`) || '';
        const saveState = {
          missionId,
          sectionIndex: secIdx + 1,
          xmlText: nextXml,
          title: displayTitle,
          completedGoals,
          timestamp: Date.now()
        };
        localStorage.setItem('netstart_active_saved_level', JSON.stringify(saveState));
        localStorage.setItem('netstart_active_level', JSON.stringify({
          missionId,
          title: displayTitle,
          module: getMissionModuleForMission(missionId, isDaily),
          icon: planetIcon,
          desc: getMissionDescForMission(missionId, isDaily),
          startedAt: new Date().toISOString()
        }));
      } catch (e) {}
    }
  }, [missionId, displayTitle, currentMissionSections.length, isDaily, planetIcon]);

  const isSectionLocked = useCallback((secIdx: number) => {
    if (secIdx === 0) return false;
    return !completedSections.includes(secIdx - 1);
  }, [completedSections]);

  const [failCoords, setFailCoords] = useState<{ x: number; y: number } | null>(null);

  // Safety / Toast State
  const [showOverloadToast, setShowOverloadToast] = useState(false);
  const [showStartToast, setShowStartToast] = useState(false);
  const [showEndToast, setShowEndToast] = useState(false);
  const [isWarningPulse, setIsWarningPulse] = useState(false);
  const [isStartError, setIsStartError] = useState(false);
  const [showBlockedToast, setShowBlockedToast] = useState(false);
  const blockedToastTimer = useRef<NodeJS.Timeout | null>(null);
  const overloadToastTimer = useRef<NodeJS.Timeout | null>(null);
  const startToastTimer = useRef<NodeJS.Timeout | null>(null);
  const endToastTimer = useRef<NodeJS.Timeout | null>(null);
  const bombDamageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Rewards State
  const [rewards, setRewards] = useState<{ xpEarned: number; gearsEarned: number } | null>(null);
  const [apiSaving, setApiSaving] = useState(false);

  // 2-Pane Resizer Split State (Percentage - balanced 58% Blockly, 42% Simulation)
  const [splitPercent, setSplitPercent] = useState<number>(58);
  const isDragging = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const execState = useRef({ ...activeSection.initialState });
  const hitWall = useRef(false);
  const isGoal = useRef(false);
  const steppedOnBomb = useRef(false);
  const blockQueueRef = useRef<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const executionIdRef = useRef<number>(0);
  const hasHydratedSavedSection = useRef<boolean>(false);

  // Check replay mode and restore saved state
  useEffect(() => {
    try {
      let targetSec = currentSection;
      let hasExplicitSave = false;
      const isReplayParam = searchParams.get('mode') === 'replay';
      const completedList: number[] = JSON.parse(localStorage.getItem(`netstart_completed_sections_${missionId}`) || '[]');
      const isLevelFullyDone = completedList.length >= currentMissionSections.length;

      // If NOT an explicit replay and NOT already completed level, restore saved section
      if (!isReplayParam && !isLevelFullyDone) {
        const rawSave = localStorage.getItem('netstart_active_saved_level');
        if (rawSave) {
          const parsed = JSON.parse(rawSave);
          if (parsed.missionId && parsed.missionId.toLowerCase() === missionId.toLowerCase()) {
            if (typeof parsed.sectionIndex === 'number' && parsed.sectionIndex >= 0 && parsed.sectionIndex < currentMissionSections.length) {
              // Ensure the saved section is actually unlocked
              let isUnlocked = true;
              for (let s = 0; s < parsed.sectionIndex; s++) {
                if (!completedList.includes(s)) {
                  isUnlocked = false;
                  break;
                }
              }
              if (isUnlocked) {
                targetSec = parsed.sectionIndex;
                hasExplicitSave = true;
              }
            }
          }
        }

        // If the saved target section is already completed or locked, advance to the first uncompleted section
        if (!hasExplicitSave || completedList.includes(targetSec)) {
          for (let i = 0; i < currentMissionSections.length; i++) {
            if (!completedList.includes(i)) {
              targetSec = i;
              break;
            }
          }
        }
      } else if (isReplayParam) {
        // Replay Mode: Always begin at Section 1 (index 0)
        targetSec = 0;
      }

      setCurrentSection(targetSec);
      const targetSectionObj = currentMissionSections[targetSec] || currentMissionSections[0];
      setCharState(targetSectionObj.initialState);
      execState.current = { ...targetSectionObj.initialState };

      // Sync claimed directives
      const claimedList = JSON.parse(localStorage.getItem('netstart_claimed_directives') || '[]');
      setClaimedDirectives(claimedList);
      if (isLevelFullyDone || isReplayParam) {
        setIsReplayMode(true);
      }
      hasHydratedSavedSection.current = true;
    } catch (e) {
      console.warn("Could not parse saved level state:", e);
      hasHydratedSavedSection.current = true;
    }
  }, [missionId, searchParams]);

  // Immediately synchronize active ongoing mission in localStorage and backend database
  useEffect(() => {
    if (!hasHydratedSavedSection.current) return;
    try {
      // Inform backend that this mission is active/in progress
      fetch('/api/missions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId }),
      }).catch(() => {});

      let completedGoals: string[] = [];
      try {
        completedGoals = JSON.parse(localStorage.getItem(`netstart_completed_goals_${missionId}`) || '[]');
      } catch (e) {}

      const saveState = {
        missionId,
        sectionIndex: currentSection,
        xmlText: localStorage.getItem(`netstart_saved_workspace_${missionId}_${currentSection}`) || '',
        title: displayTitle,
        completedGoals,
        timestamp: Date.now()
      };
      localStorage.setItem('netstart_active_saved_level', JSON.stringify(saveState));
      localStorage.setItem('netstart_active_level', JSON.stringify({
        missionId,
        title: displayTitle,
        module: getMissionModuleForMission(missionId, isDaily),
        icon: planetIcon,
        desc: getMissionDescForMission(missionId, isDaily),
        startedAt: new Date().toISOString()
      }));
    } catch (e) {
      console.warn("Could not sync active level session:", e);
    }
  }, [missionId, currentSection, displayTitle, isDaily, planetIcon]);

  // Load objectives with isClaimed resolution (preserving completion for finished sections)
  useEffect(() => {
    try {
      const claimedList: string[] = JSON.parse(localStorage.getItem('netstart_claimed_directives') || '[]');
      setClaimedDirectives(claimedList);
      const completedGoalsList: string[] = JSON.parse(localStorage.getItem(`netstart_completed_goals_${missionId}`) || '[]');
      const savedCompletedSections: number[] = JSON.parse(localStorage.getItem(`netstart_completed_sections_${missionId}`) || '[]');
      const isSecDone = savedCompletedSections.includes(currentSection);

      const updated = activeSection.objectives.map(obj => {
        const key = `${missionId}_sec${currentSection}_goal${obj.id}`;
        const isClaimed = claimedList.includes(key);
        const isGoalDone = isSecDone || isClaimed || completedGoalsList.includes(key);
        return {
          ...obj,
          completed: isGoalDone,
          isClaimed: isClaimed || isGoalDone,
        };
      });
      setObjectives(updated);
    } catch (e) {
      setObjectives(activeSection.objectives.map(o => ({ ...o, completed: false, isClaimed: false })));
    }
  }, [currentSection, activeSection, missionId]);

  // Save handler for NavigationGuard and level exit
  const saveLevelWorkspace = useCallback(async () => {
    if (workspace.current) {
      try {
        const xml = Blockly.Xml.workspaceToDom(workspace.current);
        const xmlText = Blockly.Xml.domToText(xml);
        
        let completedGoals: string[] = [];
        try {
          completedGoals = JSON.parse(localStorage.getItem(`netstart_completed_goals_${missionId}`) || '[]');
        } catch (e) {}

        const saveState = {
          missionId,
          sectionIndex: currentSection,
          xmlText,
          title: displayTitle,
          completedGoals,
          timestamp: Date.now()
        };
        localStorage.setItem(`netstart_saved_workspace_${missionId}_${currentSection}`, xmlText);
        localStorage.setItem('netstart_active_saved_level', JSON.stringify(saveState));
        localStorage.setItem('netstart_active_level', JSON.stringify({
          missionId,
          title: displayTitle,
          module: getMissionModuleForMission(missionId, isDaily),
          icon: planetIcon,
          desc: getMissionDescForMission(missionId, isDaily),
          startedAt: new Date().toISOString()
        }));
      } catch (e) {
        console.warn("Could not save workspace to localStorage:", e);
      }
    }
  }, [missionId, currentSection, displayTitle, isDaily, planetIcon]);

  useEffect(() => {
    setIsInLevel(true);
    registerSaveHandler(saveLevelWorkspace);

    return () => {
      setIsInLevel(false);
      unregisterSaveHandler();
      if (overloadToastTimer.current) clearTimeout(overloadToastTimer.current);
      if (startToastTimer.current) clearTimeout(startToastTimer.current);
      if (endToastTimer.current) clearTimeout(endToastTimer.current);
      if (blockedToastTimer.current) clearTimeout(blockedToastTimer.current);
      if (bombDamageTimerRef.current) clearTimeout(bombDamageTimerRef.current);
      executionIdRef.current++;
    };
  }, [setIsInLevel, registerSaveHandler, unregisterSaveHandler, saveLevelWorkspace]);

  // Lock background scroll when any full-screen modal is open
  useEffect(() => {
    if (showPopup || showRestartConfirm || isPaused) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPopup, showRestartConfirm, isPaused]);

  // Click outside listener for Objectives Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsObjectivesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Split resizer drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    if (!containerRect.width || containerRect.width <= 0) return;
    const newLeftWidth = e.clientX - containerRect.left;
    const rawPercent = (newLeftWidth / containerRect.width) * 100;
    if (!isFinite(rawPercent)) return;
    const clamped = Math.min(Math.max(rawPercent, 25), 75);
    setSplitPercent(clamped);

    if (workspace.current) {
      Blockly.svgResize(workspace.current);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    if (workspace.current) {
      Blockly.svgResize(workspace.current);
    }
  }, [handleMouseMove]);

  // Helper to ensure the workspace always resets with the mandatory Start block
  const resetWorkspaceToDefaultStart = useCallback((ws: Blockly.WorkspaceSvg) => {
    try {
      ws.clear();
      const xmlText = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" id="start_block" x="40" y="40" deletable="true" movable="true"></block></xml>';
      const dom = Blockly.utils.xml.textToDom(xmlText);
      Blockly.Xml.domToWorkspace(dom, ws);
      Blockly.svgResize(ws);
    } catch (e) {
      console.warn("Could not create default Start block:", e);
    }
  }, []);

  // Copy selected block stack to clipboard
  const handleCopy = useCallback(() => {
    if (!workspace.current) return;
    const ws = workspace.current;
    if (ws.isFlyout) return;

    // Check if multi-selected blocks exist
    const multiselected = ws.getAllBlocks(false).filter(b => {
      const svg = b.getSvgRoot();
      return svg && svg.classList.contains('blockly-block-multiselected');
    });

    let selected: Blockly.BlockSvg | null = null;
    if (multiselected.length > 0) {
      for (const b of multiselected) {
        const p = b.getParent();
        if (!p || !multiselected.includes(p)) {
          selected = b;
          break;
        }
      }
    }
    if (!selected) {
      selected = (Blockly.common?.getSelected ? Blockly.common.getSelected() : (Blockly as any).selected) as Blockly.BlockSvg | null;
    }

    if (!selected) {
      showToast("No block selected to copy! Click or drag-select a block first.");
      return;
    }

    try {
      const xmlDom = Blockly.Xml.blockToDom(selected, true);
      const xmlText = Blockly.Xml.domToText(xmlDom);
      setClipboardXml(xmlText);
      const blockName = selected.type.replace(/_/g, ' ').toUpperCase();
      showToast(`Copied [${blockName}] stack to clipboard!`);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [showToast]);

  // Paste copied block stack into workspace
  const handlePaste = useCallback(() => {
    if (!workspace.current) return;
    const clip = clipboardXmlRef.current || clipboardXml;
    if (!clip) {
      showToast("Clipboard is empty! Copy a block stack first.");
      return;
    }

    try {
      const ws = workspace.current;
      const dom = Blockly.utils.xml.textToDom(clip) as Element;

      // Clean all IDs recursively so Blockly creates brand new instances
      const stripIds = (el: Element) => {
        el.removeAttribute('id');
        for (let i = 0; i < el.children.length; i++) {
          stripIds(el.children[i]);
        }
      };
      stripIds(dom);

      const newBlock = Blockly.Xml.domToBlock(dom, ws) as Blockly.BlockSvg;
      if (newBlock) {
        const metrics = ws.getMetrics();
        const scale = ws.scale || 1;
        const targetX = metrics ? (metrics.viewLeft + metrics.viewWidth / 3) / scale : 80;
        const targetY = metrics ? (metrics.viewTop + metrics.viewHeight / 3) / scale : 80;
        const stagger = Math.floor(Math.random() * 30) - 15;

        newBlock.moveBy(targetX + stagger, targetY + stagger);
        newBlock.initSvg();
        newBlock.render();
        if (newBlock.select) newBlock.select();
        
        const blockName = newBlock.type.replace(/_/g, ' ').toUpperCase();
        showToast(`Pasted [${blockName}] stack into workspace!`);
      }
    } catch (err) {
      console.error("Paste failed:", err);
    }
  }, [clipboardXml, showToast]);

  // Duplicate currently selected block stack
  const handleDuplicate = useCallback(() => {
    if (!workspace.current) return;
    const ws = workspace.current;
    if (ws.isFlyout) return;
    let selected: Blockly.BlockSvg | null = (Blockly.common?.getSelected ? Blockly.common.getSelected() : (Blockly as any).selected) as Blockly.BlockSvg | null;

    if (!selected) {
      const topBlocks = ws.getTopBlocks(true) as Blockly.BlockSvg[];
      if (topBlocks.length > 0) {
        selected = topBlocks[0];
        if (selected && selected.select) selected.select();
      }
    }

    if (!selected) {
      showToast("Select a block or stack first to duplicate!");
      return;
    }

    if (selected.isInFlyout || selected.workspace?.isFlyout) {
      showToast("Blocks inside the toolbox cannot be duplicated directly! Drag into workspace first.");
      return;
    }

    try {
      const xmlDom = Blockly.Xml.blockToDom(selected, true) as Element;
      const stripIds = (el: Element) => {
        el.removeAttribute('id');
        for (let i = 0; i < el.children.length; i++) {
          stripIds(el.children[i]);
        }
      };
      stripIds(xmlDom);

      const origPos = selected.getRelativeToSurfaceXY();
      const newBlock = Blockly.Xml.domToBlock(xmlDom, ws) as Blockly.BlockSvg;
      if (newBlock) {
        newBlock.moveBy(origPos.x + 35, origPos.y + 35);
        newBlock.initSvg();
        newBlock.render();
        if (newBlock.select) newBlock.select();

        const blockName = newBlock.type.replace(/_/g, ' ').toUpperCase();
        showToast(`Duplicated [${blockName}] stack!`);
      }
    } catch (err) {
      console.error("Duplicate failed:", err);
    }
  }, [showToast]);

  const clipboardXmlRef = useRef<string | null>(null);
  useEffect(() => {
    clipboardXmlRef.current = clipboardXml;
  }, [clipboardXml]);

  // Configure custom right-click context menus for Blocks and Workspace
  const setupCustomContextMenu = useCallback(() => {
    try {
      const registry = Blockly.ContextMenuRegistry.registry;

      // Unregister all default & custom options to prevent duplicate entries
      const itemsToUnregister = [
        'undoWorkspace',
        'redoWorkspace',
        'cleanWorkspace',
        'collapseWorkspace',
        'expandWorkspace',
        'workspaceDelete',
        'workspaceUndo',
        'workspaceRedo',
        'blockDuplicate',
        'blockComment',
        'blockCollapseExpand',
        'blockDisable',
        'blockInline',
        'blockHelp',
        'blockDelete',
        'netstart_block_duplicate',
        'netstart_block_comment',
        'netstart_block_copy',
        'netstart_block_paste',
        'netstart_block_delete',
        'netstart_start_clear_children',
        'netstart_workspace_undo',
        'netstart_workspace_redo',
        'netstart_workspace_paste',
        'netstart_workspace_cleanup',
        'netstart_workspace_reset',
      ];

      itemsToUnregister.forEach((id) => {
        if (registry.getItem(id)) {
          registry.unregister(id);
        }
      });

      // Unregister default duplicate/conflicting shortcuts from Blockly's internal shortcut registry
      if (Blockly.ShortcutRegistry && Blockly.ShortcutRegistry.registry) {
        const sRegistry = Blockly.ShortcutRegistry.registry;
        ['copy', 'paste', 'duplicate', 'cut'].forEach((id) => {
          try {
            sRegistry.unregister(id);
            sRegistry.removeAllKeyMappings(id);
          } catch (e) {
            // Ignore if already removed
          }
        });
      }

      // --- BLOCK CONTEXT MENU ITEMS ---
      // 1. Block: Duplicate
      registry.register({
        displayText: 'Duplicate (Ctrl+D)',
        preconditionFn: (scope) => {
          if (!scope.block) return 'hidden';
          const block = scope.block as Blockly.BlockSvg;
          if (block.isInFlyout || block.workspace?.isFlyout) return 'hidden';
          return 'enabled';
        },
        callback: (scope) => {
          if (!scope.block) return;
          const block = scope.block as Blockly.BlockSvg;
          if (block.isInFlyout || block.workspace?.isFlyout) return;
          const ws = (block.workspace?.isFlyout ? workspace.current : block.workspace) || workspace.current;
          if (!ws || ws.isFlyout) return;
          try {
            const xmlDom = Blockly.Xml.blockToDom(block, true) as Element;
            const stripIds = (el: Element) => {
              el.removeAttribute('id');
              for (let i = 0; i < el.children.length; i++) {
                stripIds(el.children[i]);
              }
            };
            stripIds(xmlDom);
            const origPos = block.getRelativeToSurfaceXY();
            const newBlock = Blockly.Xml.domToBlock(xmlDom, ws) as Blockly.BlockSvg;
            if (newBlock) {
              newBlock.moveBy(origPos.x + 35, origPos.y + 35);
              newBlock.initSvg();
              newBlock.render();
              if (newBlock.select) newBlock.select();
              const blockName = newBlock.type.replace(/_/g, ' ').toUpperCase();
              showToast(`Duplicated [${blockName}]!`);
            }
          } catch (e) {
            console.error('Duplicate failed:', e);
          }
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        id: 'netstart_block_duplicate',
        weight: 1,
      });

      // 2. Block: Add / Remove Comment
      registry.register({
        displayText: (scope) => {
          const block = scope.block as any;
          if (block && typeof block.getCommentText === 'function' && block.getCommentText() !== null) {
            return 'Remove Comment';
          }
          return 'Add Comment';
        },
        preconditionFn: (scope) => {
          if (!scope.block) return 'hidden';
          const block = scope.block as Blockly.BlockSvg;
          if (block.isInFlyout || block.workspace?.isFlyout) return 'hidden';
          return 'enabled';
        },
        callback: (scope) => {
          if (!scope.block) return;
          const block = scope.block as any;
          if (block.isInFlyout || block.workspace?.isFlyout) return;
          try {
            if (typeof block.getCommentText === 'function' && block.getCommentText() !== null) {
              block.setCommentText(null);
              showToast('Removed comment');
            } else {
              block.setCommentText('');
              const icon = typeof block.getCommentIcon === 'function' ? block.getCommentIcon() : null;
              if (icon && typeof icon.setVisible === 'function') {
                icon.setVisible(true);
              }
              showToast('Added comment');
            }
          } catch (e) {
            console.error('Comment action failed:', e);
          }
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        id: 'netstart_block_comment',
        weight: 2,
      });

      // 3. Block: Copy
      registry.register({
        displayText: 'Copy (Ctrl+C)',
        preconditionFn: (scope) => {
          if (!scope.block) return 'hidden';
          const block = scope.block as Blockly.BlockSvg;
          if (block.isInFlyout || block.workspace?.isFlyout) return 'hidden';
          return 'enabled';
        },
        callback: (scope) => {
          if (!scope.block) return;
          const block = scope.block as Blockly.BlockSvg;
          if (block.isInFlyout || block.workspace?.isFlyout) return;
          try {
            const xmlDom = Blockly.Xml.blockToDom(block, true) as Element;
            const xmlText = Blockly.Xml.domToText(xmlDom);
            setClipboardXml(xmlText);
            const blockName = block.type.replace(/_/g, ' ').toUpperCase();
            showToast(`Copied [${blockName}]!`);
          } catch (e) {
            console.error('Copy failed:', e);
          }
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        id: 'netstart_block_copy',
        weight: 3,
      });

      // 4. Block: Paste
      registry.register({
        displayText: 'Paste (Ctrl+V)',
        preconditionFn: (scope) => {
          if (!scope.block) return 'hidden';
          const block = scope.block as Blockly.BlockSvg;
          if (block.isInFlyout || block.workspace?.isFlyout) return 'hidden';
          return clipboardXmlRef.current ? 'enabled' : 'disabled';
        },
        callback: (scope) => {
          const clip = clipboardXmlRef.current;
          if (!clip || !scope.block) return;
          const block = scope.block as Blockly.BlockSvg;
          if (block.isInFlyout || block.workspace?.isFlyout) return;
          const ws = (block.workspace?.isFlyout ? workspace.current : block.workspace) || workspace.current;
          if (!ws || ws.isFlyout) return;
          try {
            const dom = Blockly.utils.xml.textToDom(clip) as Element;
            const stripIds = (el: Element) => {
              el.removeAttribute('id');
              for (let i = 0; i < el.children.length; i++) {
                stripIds(el.children[i]);
              }
            };
            stripIds(dom);
            const newBlock = Blockly.Xml.domToBlock(dom, ws) as Blockly.BlockSvg;
            if (newBlock) {
              const origPos = scope.block.getRelativeToSurfaceXY();
              newBlock.moveBy(origPos.x + 35, origPos.y + 35);
              newBlock.initSvg();
              newBlock.render();
              if (newBlock.select) newBlock.select();
              const blockName = newBlock.type.replace(/_/g, ' ').toUpperCase();
              showToast(`Pasted [${blockName}]!`);
            }
          } catch (e) {
            console.error('Paste failed:', e);
          }
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        id: 'netstart_block_paste',
        weight: 4,
      });

      // 5. Block: Delete
      registry.register({
        displayText: 'Delete',
        preconditionFn: (scope) => {
          if (!scope.block) return 'hidden';
          const block = scope.block as Blockly.BlockSvg;
          if (block.isInFlyout || block.workspace?.isFlyout) return 'hidden';
          return 'enabled';
        },
        callback: (scope) => {
          if (scope.block) {
            const block = scope.block as Blockly.BlockSvg;
            if (block.isInFlyout || block.workspace?.isFlyout) return;
            const blockName = block.type.replace(/_/g, ' ').toUpperCase();
            block.dispose(true, true);
            showToast(`Deleted [${blockName}]`);
          }
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        id: 'netstart_block_delete',
        weight: 5,
      });

      // 6. Block: Clear Sequence (on Start block)
      registry.register({
        displayText: 'Clear Sequence',
        preconditionFn: (scope) => {
          if (!scope.block || scope.block.type !== 'event_start') return 'hidden';
          const block = scope.block as Blockly.BlockSvg;
          if (block.isInFlyout || block.workspace?.isFlyout) return 'hidden';
          return scope.block.getNextBlock() ? 'enabled' : 'disabled';
        },
        callback: (scope) => {
          if (scope.block && scope.block.type === 'event_start') {
            const block = scope.block as Blockly.BlockSvg;
            if (block.isInFlyout || block.workspace?.isFlyout) return;
            const next = scope.block.getNextBlock();
            if (next) {
              next.dispose(true, true);
              showToast('Cleared sequence attached to Start');
            }
          }
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        id: 'netstart_start_clear_children',
        weight: 6,
      });

      // --- WORKSPACE CONTEXT MENU ITEMS ---
      // 1. Workspace: Undo
      registry.register({
        displayText: 'Undo (Ctrl+Z)',
        preconditionFn: (scope) => {
          const ws = scope.workspace as any;
          if (!ws || ws.isFlyout) return 'hidden';
          const canUndo = typeof ws.hasUndoStack === 'function' ? ws.hasUndoStack() : (ws.undoStack_?.length > 0);
          return canUndo ? 'enabled' : 'disabled';
        },
        callback: (scope) => {
          if (scope.workspace && !(scope.workspace as any).isFlyout) {
            scope.workspace.undo(false);
          }
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'netstart_workspace_undo',
        weight: 1,
      });

      // 2. Workspace: Redo
      registry.register({
        displayText: 'Redo (Ctrl+Y)',
        preconditionFn: (scope) => {
          const ws = scope.workspace as any;
          if (!ws || ws.isFlyout) return 'hidden';
          const canRedo = typeof ws.hasRedoStack === 'function' ? ws.hasRedoStack() : (ws.redoStack_?.length > 0);
          return canRedo ? 'enabled' : 'disabled';
        },
        callback: (scope) => {
          if (scope.workspace && !(scope.workspace as any).isFlyout) {
            scope.workspace.undo(true);
          }
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'netstart_workspace_redo',
        weight: 2,
      });

      // 3. Workspace: Paste
      registry.register({
        displayText: 'Paste (Ctrl+V)',
        preconditionFn: (scope) => {
          const ws = scope.workspace as any;
          if (!ws || ws.isFlyout) return 'hidden';
          return clipboardXmlRef.current ? 'enabled' : 'disabled';
        },
        callback: (scope) => {
          const clip = clipboardXmlRef.current;
          if (!clip || !scope.workspace || (scope.workspace as any).isFlyout) return;
          const ws = scope.workspace as Blockly.WorkspaceSvg;
          try {
            const dom = Blockly.utils.xml.textToDom(clip) as Element;
            const stripIds = (el: Element) => {
              el.removeAttribute('id');
              for (let i = 0; i < el.children.length; i++) {
                stripIds(el.children[i]);
              }
            };
            stripIds(dom);
            const newBlock = Blockly.Xml.domToBlock(dom, ws) as Blockly.BlockSvg;
            if (newBlock) {
              const metrics = ws.getMetrics();
              const scale = ws.scale || 1;
              let targetX = 80;
              let targetY = 80;
              const event = (scope as any).currentEvent as MouseEvent | undefined;
              if (event) {
                const svg = ws.getParentSvg();
                if (svg) {
                  const pt = svg.createSVGPoint();
                  pt.x = event.clientX;
                  pt.y = event.clientY;
                  const canvas = ws.getCanvas();
                  const matrix = canvas.getScreenCTM()?.inverse();
                  if (matrix) {
                    const transformed = pt.matrixTransform(matrix);
                    targetX = transformed.x;
                    targetY = transformed.y;
                  }
                }
              } else if (metrics) {
                targetX = (metrics.viewLeft + metrics.viewWidth / 3) / scale;
                targetY = (metrics.viewTop + metrics.viewHeight / 3) / scale;
              }
              newBlock.moveBy(targetX, targetY);
              newBlock.initSvg();
              newBlock.render();
              if (newBlock.select) newBlock.select();
              const blockName = newBlock.type.replace(/_/g, ' ').toUpperCase();
              showToast(`Pasted [${blockName}]!`);
            }
          } catch (e) {
            console.error('Paste failed:', e);
          }
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'netstart_workspace_paste',
        weight: 3,
      });

      // 4. Workspace: Clean up
      registry.register({
        displayText: 'Clean up (C)',
        preconditionFn: (scope) => {
          if (!scope.workspace || (scope.workspace as any).isFlyout) return 'hidden';
          return scope.workspace.getTopBlocks(false).length > 1 ? 'enabled' : 'disabled';
        },
        callback: (scope) => {
          if (scope.workspace && !(scope.workspace as any).isFlyout) {
            scope.workspace.cleanUp();
          }
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'netstart_workspace_cleanup',
        weight: 4,
      });

      // 5. Workspace: Reset Workspace
      registry.register({
        displayText: 'Reset Workspace',
        preconditionFn: (scope) => {
          if (!scope.workspace || (scope.workspace as any).isFlyout) return 'hidden';
          return 'enabled';
        },
        callback: (scope) => {
          if (scope.workspace && !(scope.workspace as any).isFlyout) {
            resetWorkspaceToDefaultStart(scope.workspace as Blockly.WorkspaceSvg);
            showToast('Deleted all blocks');
          }
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.WORKSPACE,
        id: 'netstart_workspace_reset',
        weight: 5,
      });
    } catch (err) {
      console.warn('ContextMenu registry setup warning:', err);
    }
  }, [showToast, resetWorkspaceToDefaultStart]);

  // Global Keyboard Shortcuts for Copy, Paste, Duplicate & Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handlePaste();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        handleDuplicate();
      } else if (e.key === 'Escape') {
        if (isSelectMode) {
          setIsSelectMode(false);
          setSelectionBox(null);
          showToast("Exited Drag & Select Mode");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleCopy, handlePaste, handleDuplicate, isSelectMode, showToast]);

  // XP Guardrail: Only awards XP if !objective.isClaimed
  const awardDirectiveXp = useCallback((goalId: number) => {
    const key = `${missionId}_sec${currentSection}_goal${goalId}`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(localStorage.getItem('netstart_claimed_directives') || '[]');
    } catch (e) {}

    if (claimedList.includes(key)) {
      return false; // Explicitly bypass XP payout
    }

    addXp(XP_REWARDS.CAMPAIGN_GOAL, `Directive ${goalId}`);
    claimedList.push(key);
    try {
      localStorage.setItem('netstart_claimed_directives', JSON.stringify(claimedList));
    } catch (e) {}
    return true;
  }, [addXp, missionId, currentSection]);

  const markObjectiveComplete = useCallback((id: number) => {
    let shouldAward = false;
    const goalKey = `${missionId}_sec${currentSection}_goal${id}`;

    // Immediately persist completion to localStorage
    try {
      const completedGoals: string[] = JSON.parse(localStorage.getItem(`netstart_completed_goals_${missionId}`) || '[]');
      if (!completedGoals.includes(goalKey)) {
        completedGoals.push(goalKey);
        localStorage.setItem(`netstart_completed_goals_${missionId}`, JSON.stringify(completedGoals));
      }
    } catch (e) {}

    setObjectives(prev => {
      const target = prev.find(o => o.id === id);
      if (target && !target.completed) {
        if (!target.isClaimed) {
          shouldAward = true;
        }
        return prev.map(o => o.id === id ? { ...o, completed: true } : o);
      }
      return prev;
    });

    setRecentlyCompletedId(id);
    setButtonPulse(true);
    setTimeout(() => setRecentlyCompletedId(null), 1200);
    setTimeout(() => setButtonPulse(false), 2000);

    if (shouldAward) {
      awardDirectiveXp(id);
    }
  }, [awardDirectiveXp, missionId, currentSection]);

  const triggerMissionCompletion = async (codeSnippet: string) => {
    if (!missionId) return;
    setApiSaving(true);
    try {
      const res = await fetch('/api/missions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId,
          codeSnippet,
          attempts: 1,
          timeSpentSeconds: 60,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRewards({
          xpEarned: data.xpEarned || 150,
          gearsEarned: data.gearsEarned || 20,
        });
        try {
          localStorage.removeItem('netstart_active_saved_level');
        } catch (e) {}

        // Persist completed missionId to localStorage so ModulesClient detects
        // planet unlock immediately and plays the travel animation
        try {
          const key = 'netstart_completed_missions';
          const existing: string[] = JSON.parse(localStorage.getItem(key) || '[]');
          if (missionId && !existing.includes(missionId)) {
            existing.push(missionId);
            localStorage.setItem(key, JSON.stringify(existing));
          }

          // Signal ModulesClient to play the travel animation when the user arrives.
          // We preserve the current "from" index so the animation starts from the right planet.
          // ModulesClient will detect storedIdx < realUnlockedIndex and fire startTravelAnimation.
          const currentAnimIdx = localStorage.getItem('netstart_last_animated_planet_idx');
          localStorage.setItem('netstart_planet_unlock_pending', 'true');
          // Only clear if there is an existing value to preserve the from-index logic
          if (currentAnimIdx !== null) {
            // Keep it as-is; ModulesClient compares it to the new realUnlockedIndex
          } else {
            // No stored index yet — default to 0 as from
            localStorage.setItem('netstart_last_animated_planet_idx', '0');
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error("Failed to submit mission completion:", err);
    } finally {
      setApiSaving(false);
    }
  };

  // Inject Blockly
  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      // Helper to cleanly extract and unplug unselected downstream blocks so they are not moved with the drag
      const isolateChildBlock = (child: any) => {
        if (!child || child.isShadow() || child.isInsertionMarker()) return;
        try {
          const pos = child.getRelativeToSurfaceXY();
          child.unplug(false);
          child.moveTo(pos);
          child.render();
        } catch (err) {
          console.warn("Could not isolate child block:", err);
        }
      };

      const prepareMultiSelectDrag = (block: any) => {
        if (!block || typeof block.getSvgRoot !== 'function') return;
        const isMulti = block.getSvgRoot()?.classList.contains('blockly-block-multiselected');
        if (!isMulti) return;
        const ws = block.workspace as Blockly.WorkspaceSvg;
        if (!ws) return;

        const multiselected = ws.getAllBlocks(false).filter(b => {
          const svg = b.getSvgRoot();
          return svg && svg.classList.contains('blockly-block-multiselected');
        });
        const multiselectedIds = new Set(multiselected.map(b => b.id));

        multiselected.forEach(b => {
          // If parent is not in multi-selection, unplug b from parent so it moves independently
          const parent = b.getParent ? b.getParent() : null;
          if (parent && !multiselectedIds.has(parent.id)) {
            b.unplug(false);
          }
          // If nextConnection target is not in multi-selection, isolate it so it stays stationary
          if (b.nextConnection && b.nextConnection.isConnected()) {
            const target = b.nextConnection.targetBlock();
            if (target && !multiselectedIds.has(target.id)) {
              isolateChildBlock(target);
            }
          }
          // If statement input targets are not in multi-selection, isolate them
          if (b.inputList) {
            b.inputList.forEach((input: any) => {
              if (input.connection && input.connection.isConnected()) {
                const target = input.connection.targetBlock();
                if (target && !target.isShadow() && !multiselectedIds.has(target.id)) {
                  isolateChildBlock(target);
                }
              }
            });
          }
        });
      };

      // Ensure Gesture starts drag from the topmost block of the selected group
      if (Blockly.Gesture && !(Blockly.Gesture as any).__netstart_multiselect_patched__) {
        (Blockly.Gesture as any).__netstart_multiselect_patched__ = true;
        
        const origSetStartBlock = Blockly.Gesture.prototype.setStartBlock;
        Blockly.Gesture.prototype.setStartBlock = function(block: Blockly.BlockSvg) {
          let target = block;
          if (target && typeof target.getSvgRoot === 'function' && target.getSvgRoot()?.classList.contains('blockly-block-multiselected')) {
            // Climb up only as long as the parent is ALSO in the multi-selected group
            while (
              target.getParent && 
              target.getParent() && 
              target.getParent()?.getSvgRoot()?.classList.contains('blockly-block-multiselected')
            ) {
              target = target.getParent() as Blockly.BlockSvg;
            }
          }
          origSetStartBlock.call(this, target);
        };
      }

      // Hook BlockSvg.prototype.startDrag for Blockly 13
      if (Blockly.BlockSvg && !(Blockly.BlockSvg.prototype as any).__netstart_drag_patched__) {
        (Blockly.BlockSvg.prototype as any).__netstart_drag_patched__ = true;
        const origBlockSvgStartDrag = Blockly.BlockSvg.prototype.startDrag;
        Blockly.BlockSvg.prototype.startDrag = function(e?: any) {
          prepareMultiSelectDrag(this);
          return origBlockSvgStartDrag.call(this, e);
        };
      }

      // Hook BlockDragStrategy if available
      const BlockDragStrategyClass = (Blockly as any).dragging?.BlockDragStrategy;
      if (BlockDragStrategyClass && !BlockDragStrategyClass.prototype.__netstart_strat_patched__) {
        BlockDragStrategyClass.prototype.__netstart_strat_patched__ = true;
        const origStratStartDrag = BlockDragStrategyClass.prototype.startDrag;
        BlockDragStrategyClass.prototype.startDrag = function(e?: any) {
          prepareMultiSelectDrag(this.block || (this as any).getTargetBlock?.());
          return origStratStartDrag.call(this, e);
        };
      }

      const netStartTheme = Blockly.Theme.defineTheme('netstart_space', {
        name: 'netstart_space',
        base: Blockly.Themes.Classic,
        blockStyles: {
          movement_blocks: { colourPrimary: '#EAB308', colourSecondary: '#CA8A04', colourTertiary: '#A16207' },
          number_blocks: { colourPrimary: '#22C55E', colourSecondary: '#16A34A', colourTertiary: '#15803D' },
          loop_blocks: { colourPrimary: '#A855F7', colourSecondary: '#9333EA', colourTertiary: '#7E22CE' },
          condition_blocks: { colourPrimary: '#38BDF8', colourSecondary: '#0284C7', colourTertiary: '#0369A1' },
          keyword_blocks: { colourPrimary: '#F97316', colourSecondary: '#EA580C', colourTertiary: '#C2410C' },
          event_blocks: { colourPrimary: '#EF4444', colourSecondary: '#DC2626', colourTertiary: '#991B1B' },
        },
        categoryStyles: {},
        componentStyles: {
          workspaceBackgroundColour: '#130927',
          toolboxBackgroundColour: 'rgba(26, 8, 44, 0.95)',
          toolboxForegroundColour: '#FFFFFF',
          flyoutBackgroundColour: '#18082c',
          flyoutForegroundColour: '#e2e8f0',
          flyoutOpacity: 0.95,
          insertionMarkerColour: '#ff912d',
          insertionMarkerOpacity: 0.5,
          scrollbarOpacity: 0,
          cursorColour: '#ff912d',
        }
      });

      const ws = Blockly.inject(blocklyDiv.current, {
        toolbox: getToolboxForMission(missionId, currentSection),
        comments: true,
        scrollbars: true,
        move: {
          scrollbars: {
            horizontal: true,
            vertical: true,
          },
          drag: true,
          wheel: true,
        },
        trashcan: false,
        theme: netStartTheme,
        grid: {
          spacing: 24,
          length: 3,
          colour: 'rgba(255, 255, 255, 0.04)',
          snap: true,
        },
        zoom: {
          controls: false,
          wheel: true,
          startScale: 1.0,
          maxScale: 2.0,
          minScale: 0.5,
          scaleSpeed: 1.1,
        },
      });

      (ws as any).currentSectionIndex = currentSection;
      if (typeof window !== 'undefined') {
        (window as any).__NETSTART_CURRENT_SECTION__ = currentSection;
      }
      workspace.current = ws;

      const origIsDeleteArea = (ws as any).isDeleteArea ? (ws as any).isDeleteArea.bind(ws) : () => false;
      (ws as any).isDeleteArea = function(e: any) {
        if (origIsDeleteArea(e)) return true;
        if (!e) return false;
        
        // 1. Check if cursor is over the left toolbox category sidebar
        const toolboxDiv = blocklyDiv.current?.querySelector('.blocklyToolboxDiv');
        if (toolboxDiv) {
          const tRect = toolboxDiv.getBoundingClientRect();
          if (
            e.clientX >= tRect.left &&
            e.clientX <= tRect.right &&
            e.clientY >= tRect.top &&
            e.clientY <= tRect.bottom
          ) {
            return true;
          }
        }

        // 2. Check if cursor is over the bottom-right trash button
        const trashBtn = blocklyDiv.current?.parentElement?.querySelector('button[aria-label="Delete Selected Blocks or Reset Workspace"]');
        if (trashBtn) {
          const trRect = trashBtn.getBoundingClientRect();
          if (
            e.clientX >= trRect.left - 20 &&
            e.clientX <= trRect.right + 20 &&
            e.clientY >= trRect.top - 20 &&
            e.clientY <= trRect.bottom + 20
          ) {
            return true;
          }
        }

        return false;
      };

      resetWorkspaceToDefaultStart(ws);
      setupCustomContextMenu();

      const updateCodeLive = () => {
        if (!workspace.current) return;
        try {
          clearAllBlockHighlights(workspace.current);
          const code = javascriptGenerator.workspaceToCode(workspace.current);
          setJsCode(code);
          const english = generatePlainEnglishPseudocode(workspace.current);
          setPlainEnglishCode(english);
        } catch (e) {
          console.warn("Live code generation warning:", e);
        }
      };

      const onWorkspaceChange = (e: any) => {
        if (e && e.type === Blockly.Events.SELECTED) {
          const selectedId = e.newElementId;
          if (!selectedId && workspace.current) {
            const blocks = workspace.current.getAllBlocks(false);
            blocks.forEach(b => {
              const svg = b.getSvgRoot();
              if (svg) svg.classList.remove('blockly-block-multiselected');
            });
          }
        }
        if (e && (e.type === Blockly.Events.BLOCK_DELETE || e.type === (Blockly.Events as any).DELETE)) {
          if (workspace.current) {
            const multiselected = workspace.current.getAllBlocks(false).filter(b => {
              const svg = b.getSvgRoot();
              return svg && svg.classList.contains('blockly-block-multiselected');
            });
            multiselected.forEach(b => {
              if (b.type !== 'event_start' && b.isDeletable()) {
                b.dispose(true);
              }
            });
          }
        }
        updateCodeLive();
      };

      ws.addChangeListener(onWorkspaceChange);
      updateCodeLive();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const activeEl = document.activeElement;
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            return;
          }
          if (workspace.current) {
            const multiselected = workspace.current.getAllBlocks(false).filter(b => {
              const svg = b.getSvgRoot();
              return svg && svg.classList.contains('blockly-block-multiselected');
            });
            if (multiselected.length > 0) {
              e.preventDefault();
              let count = 0;
              multiselected.forEach(b => {
                if (b.type !== 'event_start' && b.isDeletable()) {
                  b.dispose(true);
                  count++;
                }
              });
              if (count > 0) {
                showToast(`Deleted ${count} block${count > 1 ? 's' : ''}`);
              }
            }
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      // Left-clicking on empty workspace background clears multi-selection
      const handleBgClick = (e: Event) => {
        if (workspace.current) {
          const blocks = workspace.current.getAllBlocks(false);
          blocks.forEach(b => {
            const svg = b.getSvgRoot();
            if (svg) svg.classList.remove('blockly-block-multiselected');
          });
          const sel = Blockly.common?.getSelected ? (Blockly.common.getSelected() as any) : null;
          if (sel && typeof sel.unselect === 'function') {
            sel.unselect();
          }
          setShowClipboardToast(false);
        }
      };

      const svgBg = (ws as any).svgBackground_;
      if (svgBg) {
        svgBg.addEventListener('pointerdown', handleBgClick);
        svgBg.addEventListener('mousedown', handleBgClick);
      }

      const handleResize = () => {
        if (workspace.current) Blockly.svgResize(workspace.current);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        if (svgBg) {
          svgBg.removeEventListener('pointerdown', handleBgClick);
          svgBg.removeEventListener('mousedown', handleBgClick);
        }
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', handleResize);
        if (workspace.current) {
          workspace.current.dispose();
          workspace.current = null;
        }
      };
    }
  }, [missionId, currentSection, resetWorkspaceToDefaultStart, setupCustomContextMenu, showToast]);

  // Block highlighting & error visual indicators
  const clearAllBlockHighlights = useCallback((ws: Blockly.WorkspaceSvg | null) => {
    if (!ws) return;
    try {
      ws.highlightBlock(null);
      const blocks = ws.getAllBlocks(false);
      blocks.forEach(b => {
        const svg = b.getSvgRoot();
        if (svg) {
          svg.classList.remove('blockly-block-error');
          svg.classList.remove('blockly-block-warning');
        }
      });
    } catch (e) {}
  }, []);

  const markBlockError = useCallback((ws: Blockly.WorkspaceSvg | null, blockId: string | null) => {
    if (!ws || !blockId) return;
    try {
      const block = ws.getBlockById(blockId);
      if (block) {
        const svg = block.getSvgRoot();
        if (svg) {
          svg.classList.remove('blockly-block-warning');
          svg.classList.add('blockly-block-error');
        }
      }
    } catch (e) {}
  }, []);

  const markDisconnectedBlocks = useCallback((ws: Blockly.WorkspaceSvg | null, startBlock?: Blockly.BlockSvg | null) => {
    if (!ws) return;
    try {
      const topBlocks = ws.getTopBlocks(false);
      const activeStart = startBlock ?? topBlocks.find(b => b.type === 'event_start');
      const connectedBlockIds = new Set<string>();
      if (activeStart) {
        const descendants = activeStart.getDescendants(false);
        for (const d of descendants) {
          connectedBlockIds.add(d.id);
        }
      }

      const allBlocks = ws.getAllBlocks(false);
      for (const block of allBlocks) {
        if (!connectedBlockIds.has(block.id)) {
          const svg = block.getSvgRoot();
          if (svg && !svg.classList.contains('blockly-block-error')) {
            svg.classList.add('blockly-block-warning');
          }
        }
      }
    } catch (e) {}
  }, []);

  const loadSection = (sectionIndex: number) => {
    if (sectionIndex > 0 && isSectionLocked(sectionIndex)) {
      return;
    }
    executionIdRef.current++;
    if (bombDamageTimerRef.current) {
      clearTimeout(bombDamageTimerRef.current);
      bombDamageTimerRef.current = null;
    }
    if (errorToastTimer.current) {
      clearTimeout(errorToastTimer.current);
      errorToastTimer.current = null;
    }
    if (workspace.current) {
      clearAllBlockHighlights(workspace.current);
    }
    setCurrentSection(sectionIndex);
    setShowErrorToast(false);

    if (isLevel2) {
      setConveyorQueue(getSectionConveyorQueue(sectionIndex));
      setConveyorInventory({ cargo: 0, trash: 0, fuel: 0, food: 0, errors: 0 });
      setActiveAction('none');
      setIsBeltAdvancing(false);
      setIsScanning(false);
      setIsCurrentItemScanned(false);
      setAnimatingItem(null);
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = sectionIndex;
        workspace.current.updateToolbox(getToolboxForMission(missionId, sectionIndex));
      }
    } else if (isLevel3) {
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = sectionIndex;
        workspace.current.updateToolbox(getToolboxForMission(missionId, sectionIndex));
      }
    } else {
      const targetSection = currentMissionSections[sectionIndex] || currentMissionSections[0];
      setActiveGrid(targetSection.maze);
    }

    // Save target sectionIndex in active save level
    try {
      let completedGoals: string[] = [];
      try {
        completedGoals = JSON.parse(localStorage.getItem(`netstart_completed_goals_${missionId}`) || '[]');
      } catch (e) {}
      const saveState = {
        missionId,
        sectionIndex,
        xmlText: '',
        title: displayTitle,
        completedGoals,
        timestamp: Date.now()
      };
      localStorage.setItem('netstart_active_saved_level', JSON.stringify(saveState));
    } catch (e) {}

    const targetSection = currentMissionSections[sectionIndex] || currentMissionSections[0];
    setCharState(targetSection.initialState);
    execState.current = { ...targetSection.initialState };
    hitWall.current = false;
    isGoal.current = false;
    steppedOnBomb.current = false;
    setTookDamage(false);
    setIsRunning(false);
    setIsBumping(false);
    setIsWarningPulse(false);
    setIsStartError(false);
    setShowStartToast(false);
    setShowEndToast(false);
    setShowOverloadToast(false);
    setShowPopup(false);
    setJsCode('');
    setPlainEnglishCode('');
    if (workspace.current) {
      resetWorkspaceToDefaultStart(workspace.current);
    }
  };

  const restartEntireLevel = useCallback(() => {
    executionIdRef.current++;
    if (bombDamageTimerRef.current) {
      clearTimeout(bombDamageTimerRef.current);
      bombDamageTimerRef.current = null;
    }

    // 1. Revert any XP gained during this mission session
    try {
      const claimedList: string[] = JSON.parse(localStorage.getItem('netstart_claimed_directives') || '[]');
      const missionClaimed = claimedList.filter(k => k.startsWith(`${missionId}_`));
      if (missionClaimed.length > 0) {
        const xpToDeduct = missionClaimed.reduce((total, key) => {
          if (key.includes('_bonus')) return total + XP_REWARDS.SECTION_COMPLETION_BONUS;
          return total + XP_REWARDS.CAMPAIGN_GOAL;
        }, 0);
        removeXp(xpToDeduct);

        const remainingClaimed = claimedList.filter(k => !k.startsWith(`${missionId}_`));
        localStorage.setItem('netstart_claimed_directives', JSON.stringify(remainingClaimed));
        setClaimedDirectives(remainingClaimed);
      }
    } catch (e) {
      console.warn("Failed to reset session XP:", e);
    }

    // 2. Unconditionally clear section completion & storage for this mission
    setCompletedSections([]);
    setIsReplayMode(false);
    try {
      localStorage.removeItem(`netstart_completed_sections_${missionId}`);
      localStorage.removeItem(`netstart_completed_goals_${missionId}`);
      localStorage.removeItem('netstart_active_saved_level');
      for (let i = 0; i < currentMissionSections.length; i++) {
        localStorage.removeItem(`netstart_saved_workspace_${missionId}_${i}`);
      }
    } catch (e) {}

    // 3. Reset to Section 1 (index 0)
    setCurrentSection(0);
    if (isLevel2) {
      setConveyorQueue(getSectionConveyorQueue(0));
      setConveyorInventory({ cargo: 0, trash: 0, fuel: 0, food: 0, errors: 0 });
      setActiveAction('none');
      setIsBeltAdvancing(false);
      setIsScanning(false);
      setIsCurrentItemScanned(false);
      setAnimatingItem(null);
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = 0;
        workspace.current.updateToolbox(getToolboxForMission(missionId, 0));
      }
    } else if (isLevel3) {
      setLevel3HazardStep(0);
      setLevel3HazardState({ asteroidShielded: false, fuelRefueled: false, oxygenPumped: false, status: 'idle' });
      if (fuelSynthRef.current) {
        fuelSynthRef.current.resetSimulation();
      }
      if (flightSimRef.current) {
        flightSimRef.current.resetSimulation();
      }
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = 0;
        workspace.current.updateToolbox(getToolboxForMission(missionId, 0));
      }
    }

    const firstSection = currentMissionSections[0];
    setActiveGrid(firstSection.maze);
    setCharState(firstSection.initialState);
    execState.current = { ...firstSection.initialState };
    hitWall.current = false;
    isGoal.current = false;
    steppedOnBomb.current = false;
    setTookDamage(false);
    setIsRunning(false);
    setIsBumping(false);
    setIsWarningPulse(false);
    setIsStartError(false);
    setShowStartToast(false);
    setShowEndToast(false);
    setShowOverloadToast(false);
    setShowPopup(false);
    setJsCode('');
    setPlainEnglishCode('');

    // Restore objective state for Section 1: all start completely uncompleted & unreached
    setObjectives(firstSection.objectives.map(o => ({
      ...o,
      completed: false,
      isClaimed: false,
    })));

    if (workspace.current) {
      resetWorkspaceToDefaultStart(workspace.current);
      workspace.current.highlightBlock(null);
    }

    setIsPaused(false);
  }, [missionId, removeXp, resetWorkspaceToDefaultStart, isLevel2, isLevel3, currentMissionSections]);

  const resetGame = () => {
    executionIdRef.current++;
    if (bombDamageTimerRef.current) {
      clearTimeout(bombDamageTimerRef.current);
      bombDamageTimerRef.current = null;
    }
    if (errorToastTimer.current) {
      clearTimeout(errorToastTimer.current);
      errorToastTimer.current = null;
    }
    if (workspace.current) workspace.current.highlightBlock(null);
    setCharState(activeSection.initialState);
    execState.current = { ...activeSection.initialState };
    hitWall.current = false;
    isGoal.current = false;
    steppedOnBomb.current = false;
    setTookDamage(false);
    setIsRunning(false);
    setIsBumping(false);
    setIsWarningPulse(false);
    setIsStartError(false);
    setShowStartToast(false);
    setShowEndToast(false);
    setShowOverloadToast(false);
    setShowErrorToast(false);
    setShowPopup(false);
    const isSecDoneOnReset = completedSections.includes(currentSection);
    setObjectives(prev => prev.map(o => ({ ...o, completed: isSecDoneOnReset || o.isClaimed || false })));

    if (isLevel2) {
      setConveyorQueue(getSectionConveyorQueue(currentSection));
      setConveyorInventory({ cargo: 0, trash: 0, fuel: 0, food: 0, errors: 0 });
      setActiveAction('none');
      setIsBeltAdvancing(false);
      setIsScanning(false);
      setIsCurrentItemScanned(false);
      setAnimatingItem(null);
    } else if (isLevel3) {
      if (currentSection === 1) {
        setLevel3HazardStep(0);
        setLevel3HazardState({ asteroidShielded: false, fuelRefueled: false, oxygenPumped: false, status: 'idle' });
        if (fuelSynthRef.current) {
          fuelSynthRef.current.resetSimulation();
        }
      } else if (currentSection === 2) {
        if (flightSimRef.current) {
          flightSimRef.current.resetSimulation();
        }
      } else if (currentSection === 3) {
        setLevel3WarpState({ boostActive: false, shieldsActive: false, warpActive: false, isWarping: false });
      }
      setActiveGrid(activeSection.maze);
    } else {
      setActiveGrid(activeSection.maze);
    }
  };

  const runCode = async () => {
    if (isRunning) {
      resetGame();
      return;
    }

    executionIdRef.current++;
    const thisExecId = executionIdRef.current;

    // Reset state and evaluate objectives fresh for this execution run (preserving already completed sections)
    const isSecDoneOnRun = completedSections.includes(currentSection);
    setObjectives(prev => prev.map(o => ({ ...o, completed: isSecDoneOnRun || o.isClaimed || false })));
    const startState = activeSection.initialState;
    setCharState(startState);
    execState.current = { ...startState };
    hitWall.current = false;
    isGoal.current = false;
    steppedOnBomb.current = false;
    setTookDamage(false);
    setIsBumping(false);
    setIsWarningPulse(false);
    setIsStartError(false);
    setShowStartToast(false);
    setShowEndToast(false);
    setShowOverloadToast(false);

    if (!workspace.current) {
      return;
    }

    // =========================================================================
    // LEVEL 2 CONVEYOR BELT SORTING SIMULATION HANDLER
    // =========================================================================
    if (isLevel2) {
      clearAllBlockHighlights(workspace.current);
      const topBlocks = workspace.current.getTopBlocks(true);
      const startBlock = topBlocks.find(b => b.type === 'event_start');

      if (!startBlock) {
        markDisconnectedBlocks(workspace.current, null);
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        if (startToastTimer.current) clearTimeout(startToastTimer.current);
        setShowStartToast(true);
        startToastTimer.current = setTimeout(() => setShowStartToast(false), 5000);
        return;
      }

      markDisconnectedBlocks(workspace.current, startBlock);
      const connectedBlocks = startBlock.getDescendants(false);
      const hasEndBlock = connectedBlocks.some(b => b.type === 'event_end');

      setIsRunning(true);
      let runtimeQueue = [...getSectionConveyorQueue(currentSection)];
      setConveyorQueue(runtimeQueue);
      setConveyorInventory({ cargo: 0, trash: 0, fuel: 0, food: 0, errors: 0 });
      setActiveAction('none');
      setIsBeltAdvancing(false);
      setIsScanning(false);
      setIsCurrentItemScanned(false);
      setAnimatingItem(null);

      const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace.current));
      if (currentSection === 0 && hasEndBlock) {
        markObjectiveComplete(1);
      }
      if (currentSection === 0 && xml.includes('repeat_x_times') && (xml.includes('scan_current_item') || xml.includes('scan_item'))) {
        markObjectiveComplete(2);
      }
      if (currentSection === 1 && (xml.includes('if_') || xml.includes('if_scan_else') || xml.includes('if_scan_is'))) {
        markObjectiveComplete(1);
      }

      javascriptGenerator.init(workspace.current);
      const firstExecutableBlock = startBlock.getNextBlock();
      javascriptGenerator.STATEMENT_PREFIX = '';
      const rawGeneratedCode = firstExecutableBlock ? (javascriptGenerator.blockToCode(firstExecutableBlock) as string) : '';
      const code = typeof rawGeneratedCode === 'string' ? rawGeneratedCode : Array.isArray(rawGeneratedCode) ? (rawGeneratedCode as any)[0] : '';
      setJsCode(code);
      const english = generatePlainEnglishPseudocode(workspace.current);
      setPlainEnglishCode(english);

      javascriptGenerator.STATEMENT_PREFIX = 'await highlightBlock(%1);\n';
      const instrumentedRawCode = firstExecutableBlock ? (javascriptGenerator.blockToCode(firstExecutableBlock) as string) : '';
      const instrumentedCode = typeof instrumentedRawCode === 'string' ? instrumentedRawCode : Array.isArray(instrumentedRawCode) ? (instrumentedRawCode as any)[0] : '';
      javascriptGenerator.STATEMENT_PREFIX = '';

      let currentExecutingBlockId: string | null = null;
      const highlightBlock = async (id: string | null) => {
        checkCancelled();
        currentExecutingBlockId = id;
        if (workspace.current) {
          workspace.current.highlightBlock(id);
        }
      };

      const runtimeInventory: ConveyorInventory = {
        cargo: 0,
        trash: 0,
        fuel: 0,
        food: 0,
        errors: 0,
      };

      const checkCancelled = () => {
        if (thisExecId !== executionIdRef.current) {
          throw new Error("SIMULATION_CANCELLED");
        }
      };

      const delay = async (ms: number) => {
        const start = Date.now();
        while (Date.now() - start < ms) {
          checkCancelled();
          await new Promise(res => setTimeout(res, 25));
        }
        checkCancelled();
      };

      let stepCount = 0;
      const MAX_STEPS = 250;

      const checkGameStatus = async () => {
        checkCancelled();
        stepCount++;
        if (stepCount >= MAX_STEPS) {
          if (currentExecutingBlockId && workspace.current) {
            markBlockError(workspace.current, currentExecutingBlockId);
          }
          if (overloadToastTimer.current) clearTimeout(overloadToastTimer.current);
          setShowOverloadToast(true);
          overloadToastTimer.current = setTimeout(() => setShowOverloadToast(false), 4500);
          throw new Error("System Overload");
        }

        // Loophole protection: If a loop cycle ends and the scanned item was not routed anywhere
        if (runtimeItemScanned && runtimeQueue.length > 0) {
          if (currentExecutingBlockId && workspace.current) {
            markBlockError(workspace.current, currentExecutingBlockId);
          }
          const item = runtimeQueue[0];
          setErrorToastMessage(`Wait a second! Current item is ${item.label}, but it has nowhere to go!`);
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
          setTookDamage(true);
          setTimeout(() => setTookDamage(false), 800);
          throw new Error("UNHANDLED_ITEM_LEFT_ON_BELT");
        }

        await delay(10);
      };

      let runtimeItemScanned = false;
      setIsCurrentItemScanned(false);

      const scanCurrentItem = async () => {
        checkCancelled();
        if (runtimeQueue.length === 0) {
          if (currentExecutingBlockId && workspace.current) {
            markBlockError(workspace.current, currentExecutingBlockId);
          }
          setErrorToastMessage("Conveyor belt is empty! No item to scan.");
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
          await delay(300);
          return 'none';
        }

        // Redundant scan inside the same cycle: gracefully return identified item without fatal crash
        if (runtimeItemScanned) {
          setActiveAction('scan');
          setIsScanning(true);
          await delay(250);
          checkCancelled();
          setIsScanning(false);
          setActiveAction('none');
          return runtimeQueue[0]?.type || 'none';
        }

        setActiveAction('scan');
        setIsScanning(true);
        await delay(650);
        checkCancelled();
        runtimeItemScanned = true;
        setIsCurrentItemScanned(true);
        setIsScanning(false);
        setActiveAction('none');
        // Allow player ample time (850ms) to clearly register and read the revealed item
        await delay(850);
        return runtimeQueue[0]?.type || 'none';
      };

      const getCurrentItemType = async () => {
        checkCancelled();
        if (runtimeQueue.length === 0) return 'none';
        if (!runtimeItemScanned) {
          if (currentExecutingBlockId && workspace.current) {
            markBlockError(workspace.current, currentExecutingBlockId);
          }
          // Loophole prevention: Attempting to check condition on unscanned item
          setErrorToastMessage("Unknown Item: Scan Current Item first to identify its type!");
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
          await delay(200);
          return 'unscanned';
        }
        return runtimeQueue[0]?.type || 'none';
      };

      // Strict item routing execution with damage flash, toast and immediate loop halt on violation
      const routeItem = async (
        actionKey: 'pack_cargo' | 'discard_trash' | 'route_fuel' | 'route_food',
        destination: 'cargo' | 'trash' | 'fuel' | 'food',
        allowedType: ConveyorItemType,
        destinationName: string
      ) => {
        checkCancelled();
        if (runtimeQueue.length === 0) {
          if (currentExecutingBlockId && workspace.current) {
            markBlockError(workspace.current, currentExecutingBlockId);
          }
          setErrorToastMessage(`Conveyor belt is empty! No item to route.`);
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
          await delay(300);
          return;
        }

        const item = runtimeQueue[0];

        // Safety enforcement: Sorting without scanning in ANY section is prohibited
        if (!runtimeItemScanned) {
          if (currentExecutingBlockId && workspace.current) {
            markBlockError(workspace.current, currentExecutingBlockId);
          }
          runtimeInventory.errors++;
          setConveyorInventory({ ...runtimeInventory });
          setErrorToastMessage("Safety Violation: You must scan the item before routing it!");
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
          setTookDamage(true);
          setTimeout(() => setTookDamage(false), 800);
          throw new Error("UNSCANNED_ROUTING");
        }

        setActiveAction(actionKey);
        // Phase 2: Clone item at runtimeQueue[0] into independent animatingItem state
        setAnimatingItem({ item: { ...item }, destination, isFlying: false });
        await delay(30);
        checkCancelled();

        // Trigger fly-away CSS animation and simultaneous belt advance
        setAnimatingItem({ item: { ...item }, destination, isFlying: true });
        setIsBeltAdvancing(true);

        // Phase 3: Wait exact duration of CSS animation (600ms)
        await delay(600);
        checkCancelled();

        // Phase 3: Asynchronously shift queue and reset animation state
        runtimeQueue = runtimeQueue.slice(1);
        setConveyorQueue([...runtimeQueue]);
        runtimeItemScanned = false;
        setIsCurrentItemScanned(false);
        setIsBeltAdvancing(false);
        setAnimatingItem(null);

        if (item.type !== allowedType) {
          if (currentExecutingBlockId && workspace.current) {
            markBlockError(workspace.current, currentExecutingBlockId);
          }
          runtimeInventory.errors++;
          setConveyorInventory({ ...runtimeInventory });
          setErrorToastMessage(`Error: ${item.label} sent to ${destinationName}!`);
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
          setTookDamage(true);
          setTimeout(() => setTookDamage(false), 800);
          throw new Error(`MISROUTED_ITEM: ${item.label} to ${destinationName}`);
        } else {
          runtimeInventory[allowedType]++;
          setConveyorInventory({ ...runtimeInventory });
        }

        await delay(160);
        setActiveAction('none');
        await delay(60);
      };

      const packCargo = async () => routeItem('pack_cargo', 'cargo', 'cargo', 'Cargo Bay');
      const discardTrash = async () => routeItem('discard_trash', 'trash', 'trash', 'Trash');
      const routeFuel = async () => routeItem('route_fuel', 'fuel', 'fuel', 'Rocket Ship');
      const routeFood = async () => routeItem('route_food', 'food', 'food', 'Cafeteria');
      // Aliases
      const packItem = packCargo;
      const discardItem = discardTrash;

      try {
        if (instrumentedCode && instrumentedCode.trim()) {
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          const executeFn = new AsyncFunction(
            'packCargo',
            'discardTrash',
            'routeFuel',
            'routeFood',
            'packItem',
            'discardItem',
            'scanCurrentItem',
            'getCurrentItemType',
            'checkGameStatus',
            'highlightBlock',
            instrumentedCode
          );
          await executeFn(
            packCargo,
            discardTrash,
            routeFuel,
            routeFood,
            packItem,
            discardItem,
            scanCurrentItem,
            getCurrentItemType,
            checkGameStatus,
            highlightBlock
          );
        }

        const result = validateConveyorVictory(currentSection, runtimeInventory, runtimeQueue.length);
        if (result.success) {
          if (hasEndBlock) {
            recordSectionCompleted(currentSection);
            markObjectiveComplete(3);

            if (currentSection === 0) {
              if (hasEndBlock) markObjectiveComplete(1);
              if (xml.includes('repeat_x_times') && (xml.includes('scan_current_item') || xml.includes('scan_item'))) markObjectiveComplete(2);
              if (runtimeInventory.cargo >= 10) markObjectiveComplete(3);
            } else if (currentSection === 1) {
              if (xml.includes('if_') || xml.includes('if_scan_else') || xml.includes('if_scan_is')) markObjectiveComplete(1);
              if (runtimeInventory.trash >= 7) markObjectiveComplete(2);
              if (runtimeInventory.cargo >= 8) markObjectiveComplete(3);
            } else if (currentSection === 2) {
              if (runtimeInventory.fuel >= 6) markObjectiveComplete(1);
              if (runtimeInventory.cargo >= 7) markObjectiveComplete(2);
              if (runtimeInventory.trash >= 7) markObjectiveComplete(3);
            } else if (currentSection === 3) {
              if (runtimeInventory.fuel >= 6 && runtimeInventory.food >= 6) markObjectiveComplete(1);
              if (runtimeInventory.cargo >= 7 && runtimeInventory.trash >= 6) markObjectiveComplete(2);
              markObjectiveComplete(3);
            }

            setShowPopup(true);

            const bonusKey = `${missionId}_sec${currentSection}_bonus`;
            let claimedList: string[] = [];
            try {
              claimedList = JSON.parse(localStorage.getItem('netstart_claimed_directives') || '[]');
            } catch (e) {}

            if (!isReplayMode && !claimedList.includes(bonusKey)) {
              addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, `Section ${currentSection + 1} Cleared`);
              claimedList.push(bonusKey);
              try {
                localStorage.setItem('netstart_claimed_directives', JSON.stringify(claimedList));
              } catch (e) {}
            }

            if (currentSection === currentMissionSections.length - 1) {
              // Write completion to localStorage IMMEDIATELY (before API responds)
              // so ModuleDetailsClient shows Replay and ModulesClient triggers the animation
              try {
                // Clear the active save so the card shows Replay not Resume
                localStorage.removeItem('netstart_active_saved_level');
                localStorage.removeItem('netstart_active_level');

                // Add to completed missions list for instant ModulesClient detection
                if (missionId) {
                  const compKey = 'netstart_completed_missions';
                  const existing: string[] = JSON.parse(localStorage.getItem(compKey) || '[]');
                  if (!existing.includes(missionId)) {
                    existing.push(missionId);
                    localStorage.setItem(compKey, JSON.stringify(existing));
                  }
                  // Preserve the current from-index so animation starts at right planet
                  if (!localStorage.getItem('netstart_last_animated_planet_idx')) {
                    localStorage.setItem('netstart_last_animated_planet_idx', '0');
                  }
                  localStorage.setItem('netstart_planet_unlock_pending', 'true');
                }
              } catch (e) {}

              triggerMissionCompletion(code);
            }
          } else {
            setIsWarningPulse(true);
            if (endToastTimer.current) clearTimeout(endToastTimer.current);
            setShowEndToast(true);
            endToastTimer.current = setTimeout(() => setShowEndToast(false), 5500);
          }
        } else {
          setErrorToastMessage(result.message);
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
        }
      } catch (e: any) {
        if (currentExecutingBlockId && workspace.current && e?.message !== 'SIMULATION_CANCELLED') {
          markBlockError(workspace.current, currentExecutingBlockId);
        }
        if (
          e?.message !== 'SIMULATION_CANCELLED' &&
          e?.message !== 'System Overload' &&
          !e?.message?.startsWith('MISROUTED_ITEM') &&
          e?.message !== 'UNSCANNED_ROUTING' &&
          e?.message !== 'UNHANDLED_ITEM_LEFT_ON_BELT' &&
          e?.message !== 'UNHANDLED_ITEM_RESCAN'
        ) {
          console.error("Conveyor simulation error:", e);
        }
      } finally {
        setIsRunning(false);
        setActiveAction('none');
      }
      return;
    }    // =========================================================================
    // LEVEL 3: THE STARSHIP PROTOCOL (SECTIONS 2, 3, 4 SIMULATION HANDLER)
    // =========================================================================
    if (isLevel3 && currentSection >= 1) {
      clearAllBlockHighlights(workspace.current);
      const topBlocks = workspace.current.getTopBlocks(true);
      const startBlock = topBlocks.find(b => b.type === 'event_start');

      if (!startBlock) {
        markDisconnectedBlocks(workspace.current, null);
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        if (startToastTimer.current) clearTimeout(startToastTimer.current);
        setShowStartToast(true);
        startToastTimer.current = setTimeout(() => setShowStartToast(false), 5000);
        return;
      }

      markDisconnectedBlocks(workspace.current, startBlock);
      const connectedBlocks = startBlock.getDescendants(false);
      const hasEndBlock = connectedBlocks.some(b => b.type === 'event_end');

      setIsRunning(true);

      if (hasEndBlock) {
        markObjectiveComplete(1);
      }

      javascriptGenerator.init(workspace.current);
      const firstExecutableBlock = startBlock.getNextBlock();
      javascriptGenerator.STATEMENT_PREFIX = '';
      const rawGeneratedCode = firstExecutableBlock ? (javascriptGenerator.blockToCode(firstExecutableBlock) as string) : '';
      const code = typeof rawGeneratedCode === 'string' ? rawGeneratedCode : Array.isArray(rawGeneratedCode) ? (rawGeneratedCode as any)[0] : '';
      setJsCode(code);

      const english = generatePlainEnglishPseudocode(workspace.current);
      setPlainEnglishCode(english);

      if (!code || code.trim() === '') {
        setIsRunning(false);
        return;
      }

      javascriptGenerator.STATEMENT_PREFIX = 'await highlightBlock(%1);\n';
      const instrumentedRawCode = firstExecutableBlock ? (javascriptGenerator.blockToCode(firstExecutableBlock) as string) : '';
      const instrumentedCode = typeof instrumentedRawCode === 'string' ? instrumentedRawCode : Array.isArray(instrumentedRawCode) ? (instrumentedRawCode as any)[0] : '';
      javascriptGenerator.STATEMENT_PREFIX = '';

      let currentExecutingBlockId: string | null = null;
      const highlightBlock = async (id: string | null) => {
        checkCancelled();
        currentExecutingBlockId = id;
        if (workspace.current) {
          workspace.current.highlightBlock(id);
        }
      };

      const checkCancelled = () => {
        if (thisExecId !== executionIdRef.current) {
          throw new Error("SIMULATION_CANCELLED");
        }
      };

      const delay = async (ms: number) => {
        const start = Date.now();
        while (Date.now() - start < ms) {
          checkCancelled();
          await new Promise(res => setTimeout(res, 25));
        }
        checkCancelled();
      };

      let isSectionCompleted = false;

      // Section 2: Fuel Synthesis (Nested Loops & Shifting Color Logic)
      if (currentSection === 1) {
        if (!fuelSynthRef.current) {
          setIsRunning(false);
          return;
        }

        if (hasEndBlock) {
          markObjectiveComplete(1);
        }
        const xml = workspace.current ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace.current)) : '';
        if ((xml.includes('color_blue') || xml.includes('action_increase_heat')) && (xml.includes('color_green') || xml.includes('action_mix'))) {
          markObjectiveComplete(2);
        }

        const evaluatorFn = async (methods: FuelSimulationMethods) => {
          checkCancelled();

          const Increase_Heat = async () => {
            checkCancelled();
            await methods.Increase_Heat();
          };

          const Add_Solution = async () => {
            checkCancelled();
            await methods.Add_Solution();
          };

          const Mix = async () => {
            checkCancelled();
            await methods.Mix();
          };

          const Put_Into_Fuel_Tank = async () => {
            checkCancelled();
            await methods.Put_Into_Fuel_Tank();
          };

          const isColor = (c: string) => methods.isColor(c as any);
          const isNotColor = (c: string) => methods.isNotColor(c as any);
          const checkStatus = async () => {
            checkCancelled();
            await methods.checkStatus();
          };

          try {
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const executeFn = new AsyncFunction(
              'Increase_Heat',
              'Add_Solution',
              'Mix',
              'Put_Into_Fuel_Tank',
              'Fuel_Spaceship',
              'isColor',
              'isNotColor',
              'checkStatus',
              'checkGameStatus',
              'highlightBlock',
              instrumentedCode
            );

            await executeFn(
              Increase_Heat,
              Add_Solution,
              Mix,
              Put_Into_Fuel_Tank,
              Put_Into_Fuel_Tank,
              isColor,
              isNotColor,
              checkStatus,
              checkStatus,
              highlightBlock
            );
          } catch (e: any) {
            if (currentExecutingBlockId && workspace.current && e?.message !== 'SIMULATION_CANCELLED') {
              markBlockError(workspace.current, currentExecutingBlockId);
            }
            throw e;
          }
        };

        fuelSynthRef.current.startSimulation(evaluatorFn);
        return;
      }

      // Section 3: The Flight Simulation (60-Second Auto-Runner with Conditionals)
      if (currentSection === 2) {
        if (!flightSimRef.current) {
          setIsRunning(false);
          return;
        }

        // Check if student added the Launch Rocket block
        const allBlocks = workspace.current ? workspace.current.getAllBlocks(false) : [];
        const hasLaunchBlock = allBlocks.some(b => b.type === 'action_launch_rocket');

        if (!hasLaunchBlock) {
          setIsRunning(true);
          flightSimRef.current.triggerLaunchFailure("You forgot to launch the rocket!");
          return;
        }

        // Create evaluator function called on each emergency trigger tick
        const evaluatorFn = async (simState: FlightSimulationState): Promise<FlightAction> => {
          checkCancelled();
          let chosenAction: FlightAction = 'NONE';
          const actionsExecuted: string[] = [];

          // Helper condition checkers and event getters passed to player's compiled script
          const isFuelLow = () => simState.isFuelLow;
          const isSmallAsteroid = () => simState.isSmallAsteroid;
          const isOxygenLow = () => simState.isOxygenLow;
          const isBigAsteroid = () => simState.isBigAsteroid;
          const isFriendlyUFO = () => simState.isFriendlyUFO;
          const isSupplyPod = () => simState.isFriendlyUFO;
          const getCurrentEmergency = () => {
            if (simState.activeEvent && simState.activeEvent !== 'NONE') return simState.activeEvent;
            if (simState.isFuelLow) return 'FUEL_LOW';
            if (simState.isOxygenLow) return 'OXYGEN_LOW';
            if (simState.isSmallAsteroid) return 'SMALL_ASTEROID';
            if (simState.isBigAsteroid) return 'BIG_ASTEROID';
            if (simState.isFriendlyUFO) return 'FRIENDLY_UFO';
            return 'NONE';
          };

          // Helper action executors
          const Launch_Rocket = async () => {
            actionsExecuted.push('LAUNCH');
            if (chosenAction === 'NONE') chosenAction = 'LAUNCH';
          };
          const Stop_Rocket = async () => {
            actionsExecuted.push('STOP');
            if (chosenAction === 'NONE') chosenAction = 'STOP';
          };
          const Refill_Fuel_Cells = async () => {
            chosenAction = 'REFILL_FUEL';
            actionsExecuted.push('REFILL_FUEL');
          };
          const Fire_Lasers = async () => {
            chosenAction = 'FIRE_LASERS';
            actionsExecuted.push('FIRE_LASERS');
            if (simState.isSmallAsteroid || simState.activeEvent === 'SMALL_ASTEROID') {
              markObjectiveComplete(1);
            }
          };
          const Pump_Oxygen = async () => {
            chosenAction = 'PUMP_OXYGEN';
            actionsExecuted.push('PUMP_OXYGEN');
          };
          const Activate_Shield = async () => {
            chosenAction = 'ACTIVATE_SHIELD';
            actionsExecuted.push('ACTIVATE_SHIELD');
          };
          const Greet_UFO = async () => {
            chosenAction = 'GREET_UFO';
            actionsExecuted.push('GREET_UFO');
            markObjectiveComplete(2);
          };
          const Fire_Tractor_Beam = Greet_UFO;

          try {
            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
            const executeFn = new AsyncFunction(
              'isFuelLow',
              'isSmallAsteroid',
              'isOxygenLow',
              'isBigAsteroid',
              'isFriendlyUFO',
              'isSupplyPod',
              'getCurrentEmergency',
              'Launch_Rocket',
              'Stop_Rocket',
              'Refill_Fuel_Cells',
              'Fire_Lasers',
              'Pump_Oxygen',
              'Activate_Shield',
              'Greet_UFO',
              'Fire_Tractor_Beam',
              'highlightBlock',
              instrumentedCode
            );

            await executeFn(
              isFuelLow,
              isSmallAsteroid,
              isOxygenLow,
              isBigAsteroid,
              isFriendlyUFO,
              isSupplyPod,
              getCurrentEmergency,
              Launch_Rocket,
              Stop_Rocket,
              Refill_Fuel_Cells,
              Fire_Lasers,
              Pump_Oxygen,
              Activate_Shield,
              Greet_UFO,
              Fire_Tractor_Beam,
              highlightBlock
            );
          } catch (e: any) {
            if (currentExecutingBlockId && workspace.current && e?.message !== 'SIMULATION_CANCELLED') {
              markBlockError(workspace.current, currentExecutingBlockId);
            }
            throw e;
          }

          const currentEvt = simState.activeEvent;

          // Event-aware action resolution: prioritize the appropriate response for the active emergency/event
          if (currentEvt === 'FUEL_LOW' || simState.isFuelLow) {
            if (actionsExecuted.includes('REFILL_FUEL')) return 'REFILL_FUEL';
            if (actionsExecuted.includes('PUMP_OXYGEN')) return 'PUMP_OXYGEN';
            if (actionsExecuted.includes('FIRE_LASERS')) return 'FIRE_LASERS';
            if (actionsExecuted.includes('ACTIVATE_SHIELD')) return 'ACTIVATE_SHIELD';
            if (actionsExecuted.includes('GREET_UFO')) return 'GREET_UFO';
            if (actionsExecuted.includes('STOP')) return 'STOP';
            return chosenAction;
          }

          if (currentEvt === 'OXYGEN_LOW' || simState.isOxygenLow) {
            if (actionsExecuted.includes('PUMP_OXYGEN')) return 'PUMP_OXYGEN';
            if (actionsExecuted.includes('REFILL_FUEL')) return 'REFILL_FUEL';
            if (actionsExecuted.includes('FIRE_LASERS')) return 'FIRE_LASERS';
            if (actionsExecuted.includes('ACTIVATE_SHIELD')) return 'ACTIVATE_SHIELD';
            if (actionsExecuted.includes('GREET_UFO')) return 'GREET_UFO';
            if (actionsExecuted.includes('STOP')) return 'STOP';
            return chosenAction;
          }

          if (currentEvt === 'SMALL_ASTEROID') {
            if (actionsExecuted.includes('FIRE_LASERS')) return 'FIRE_LASERS';
            if (actionsExecuted.includes('ACTIVATE_SHIELD')) return 'ACTIVATE_SHIELD';
            if (actionsExecuted.includes('REFILL_FUEL')) return 'REFILL_FUEL';
            if (actionsExecuted.includes('PUMP_OXYGEN')) return 'PUMP_OXYGEN';
            if (actionsExecuted.includes('GREET_UFO')) return 'GREET_UFO';
            if (actionsExecuted.includes('STOP')) return 'STOP';
            return chosenAction;
          }

          if (currentEvt === 'BIG_ASTEROID') {
            if (actionsExecuted.includes('ACTIVATE_SHIELD')) return 'ACTIVATE_SHIELD';
            if (actionsExecuted.includes('FIRE_LASERS')) return 'FIRE_LASERS';
            if (actionsExecuted.includes('REFILL_FUEL')) return 'REFILL_FUEL';
            if (actionsExecuted.includes('PUMP_OXYGEN')) return 'PUMP_OXYGEN';
            if (actionsExecuted.includes('GREET_UFO')) return 'GREET_UFO';
            if (actionsExecuted.includes('STOP')) return 'STOP';
            return chosenAction;
          }

          if (currentEvt === 'FRIENDLY_UFO' || currentEvt === 'SUPPLY_POD') {
            const greetIndex = actionsExecuted.lastIndexOf('GREET_UFO');
            const stopIndex = actionsExecuted.lastIndexOf('STOP');
            const launchIndex = actionsExecuted.lastIndexOf('LAUNCH');

            const hasGreet = greetIndex !== -1;
            const hasStopBeforeGreet = stopIndex !== -1 && (greetIndex === -1 || stopIndex < greetIndex);
            const hasLaunchAfterGreet = launchIndex !== -1 && greetIndex !== -1 && launchIndex > greetIndex;

            if (hasGreet && hasStopBeforeGreet && hasLaunchAfterGreet) {
              return 'GREET_UFO_FULL_PROTOCOL';
            }
            if (hasGreet && hasStopBeforeGreet && !hasLaunchAfterGreet) {
              return 'GREET_UFO_NO_LAUNCH';
            }
            if (hasGreet && !hasStopBeforeGreet) {
              return 'GREET_UFO_NO_STOP';
            }
            if (stopIndex !== -1 && !hasGreet) {
              return 'STOP';
            }
            if (actionsExecuted.includes('FIRE_LASERS')) return 'FIRE_LASERS';
            if (actionsExecuted.includes('ACTIVATE_SHIELD')) return 'ACTIVATE_SHIELD';
            if (actionsExecuted.includes('REFILL_FUEL')) return 'REFILL_FUEL';
            if (actionsExecuted.includes('PUMP_OXYGEN')) return 'PUMP_OXYGEN';
            return chosenAction;
          }

          // Fallback when activeEvent is unhandled by specific case
          if (actionsExecuted.includes('GREET_UFO')) {
            const greetIndex = actionsExecuted.lastIndexOf('GREET_UFO');
            const stopIndex = actionsExecuted.lastIndexOf('STOP');
            const launchIndex = actionsExecuted.lastIndexOf('LAUNCH');

            const hasStopBeforeGreet = stopIndex !== -1 && (greetIndex === -1 || stopIndex < greetIndex);
            const hasLaunchAfterGreet = launchIndex !== -1 && greetIndex !== -1 && launchIndex > greetIndex;

            if (hasStopBeforeGreet && hasLaunchAfterGreet) {
              return 'GREET_UFO_FULL_PROTOCOL';
            }
            if (hasStopBeforeGreet && !hasLaunchAfterGreet) {
              return 'GREET_UFO_NO_LAUNCH';
            }
            return 'GREET_UFO_NO_STOP';
          }
          if (actionsExecuted.includes('STOP')) {
            return 'STOP';
          }
          if (actionsExecuted.includes('REFILL_FUEL')) return 'REFILL_FUEL';
          if (actionsExecuted.includes('PUMP_OXYGEN')) return 'PUMP_OXYGEN';
          if (actionsExecuted.includes('FIRE_LASERS')) return 'FIRE_LASERS';
          if (actionsExecuted.includes('ACTIVATE_SHIELD')) return 'ACTIVATE_SHIELD';

          return chosenAction;
        };

        // Start the automated 60s flight simulation
        setIsRunning(true);
        flightSimRef.current.startSimulation(evaluatorFn);
        return;
      }

      // Section 4: Hyperdrive Warp Jump Simulation
      if (currentSection === 3) {
        let bActive = false;
        let sActive = false;
        let wActive = false;

        const funcBoostSystems = async () => {
          checkCancelled();
          bActive = true;
          setLevel3WarpState(prev => ({ ...prev, boostActive: true }));
          markObjectiveComplete(1);
          await delay(400);
        };

        const funcEvasiveShields = async () => {
          checkCancelled();
          sActive = true;
          setLevel3WarpState(prev => ({ ...prev, shieldsActive: true }));
          markObjectiveComplete(1);
          await delay(400);
        };

        const funcWarpJump = async () => {
          checkCancelled();
          wActive = true;
          setLevel3WarpState(prev => ({ ...prev, warpActive: true }));
          markObjectiveComplete(1);
          await delay(400);
        };

        try {
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          const executeFn = new AsyncFunction(
            'funcBoostSystems',
            'funcEvasiveShields',
            'funcWarpJump',
            'highlightBlock',
            instrumentedCode
          );

          await executeFn(funcBoostSystems, funcEvasiveShields, funcWarpJump, highlightBlock);

          if (bActive && sActive && wActive) {
            setLevel3WarpState(prev => ({ ...prev, isWarping: true }));
            markObjectiveComplete(2);
            markObjectiveComplete(3);
            isSectionCompleted = true;
            await delay(1200);
          } else {
            setErrorToastMessage("Launch Protocol Incomplete: Call all 3 subroutines (Boost, Shields, Warp Jump)!");
            setShowErrorToast(true);
            if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
            errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
          }
        } catch (e: any) {
          if (currentExecutingBlockId && workspace.current && e?.message !== 'SIMULATION_CANCELLED') {
            markBlockError(workspace.current, currentExecutingBlockId);
          }
        }
      }

      if (isSectionCompleted) {
        if (hasEndBlock) {
          recordSectionCompleted(currentSection);
          setShowPopup(true);

          const bonusKey = `${missionId}_sec${currentSection}_bonus`;
          let claimedList: string[] = [];
          try {
            claimedList = JSON.parse(localStorage.getItem('netstart_claimed_directives') || '[]');
          } catch (e) {}

          if (!claimedList.includes(bonusKey)) {
            addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, `Section ${currentSection + 1} Cleared`);
            claimedList.push(bonusKey);
            try {
              localStorage.setItem('netstart_claimed_directives', JSON.stringify(claimedList));
            } catch (e) {}
          }

          if (currentSection === currentMissionSections.length - 1) {
            // Write completion to localStorage IMMEDIATELY so UI updates before API responds
            try {
              localStorage.removeItem('netstart_active_saved_level');
              localStorage.removeItem('netstart_active_level');
              if (missionId) {
                const compKey = 'netstart_completed_missions';
                const existing: string[] = JSON.parse(localStorage.getItem(compKey) || '[]');
                if (!existing.includes(missionId)) { existing.push(missionId); localStorage.setItem(compKey, JSON.stringify(existing)); }
                if (!localStorage.getItem('netstart_last_animated_planet_idx')) localStorage.setItem('netstart_last_animated_planet_idx', '0');
                localStorage.setItem('netstart_planet_unlock_pending', 'true');
              }
            } catch (e) {}
            triggerMissionCompletion(code);
          }
        } else {
          setIsWarningPulse(true);
          if (endToastTimer.current) clearTimeout(endToastTimer.current);
          setShowEndToast(true);
          endToastTimer.current = setTimeout(() => setShowEndToast(false), 5500);
        }
      }

      setIsRunning(false);
      return;
    }

    // =========================================================================
    // LEVEL 1 & LEVEL 3 (SECTION 3 HUB) & DAILY 2D ROVER MAZE SIMULATION HANDLER
    // =========================================================================
    clearAllBlockHighlights(workspace.current);
    // Phase 2: Missing "Start" Consequence
    const topBlocks = workspace.current.getTopBlocks(true);
    const startBlock = topBlocks.find(b => b.type === 'event_start');

    if (!startBlock) {
      // Missing Start block at top: simulation MUST NOT run.
      markDisconnectedBlocks(workspace.current, null);
      setIsBumping(true);
      setIsStartError(true);
      setTimeout(() => {
        setIsBumping(false);
        setIsStartError(false);
      }, 800);

      if (startToastTimer.current) clearTimeout(startToastTimer.current);
      setShowStartToast(true);
      startToastTimer.current = setTimeout(() => setShowStartToast(false), 5000);
      return;
    }

    markDisconnectedBlocks(workspace.current, startBlock);
    // Check if End block is attached in the sequence descending from startBlock
    const connectedBlocks = startBlock.getDescendants(false);
    const hasEndBlock = connectedBlocks.some(b => b.type === 'event_end');

    setIsRunning(true);

    // Snapshot block count at execution start
    const initialBlockCount = workspace.current.getAllBlocks(false).length;
    blockQueueRef.current = getBlocksInOrder(workspace.current);

    if (isDaily) {
      const xml = workspace.current ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace.current)) : '';
      if (hasEndBlock) {
        markObjectiveComplete(1); // "Use both the Start and End blocks" or "Use both Start and End blocks"
      }
      if (xml.includes('if_path_is') || xml.includes('controls_if') || xml.includes('controls_ifelse') || xml.includes('logic_and') || xml.includes('logic_or')) {
        markObjectiveComplete(1); // For Lane Changer: "Use a condition block"
      }
      markObjectiveComplete(2); // "Avoid the bombs" / "Avoid all hazard zones"
    } else if (isLevel3) {
      // Level 3 Directives
      if (currentSection === 0) {
        if (hasEndBlock) {
          markObjectiveComplete(1); // "Use both Start and End blocks"
        }
        const xml = workspace.current ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace.current)) : '';
        if (xml.includes('repeat_x_times') || xml.includes('repeat_simple') || xml.includes('repeat_until_goal') || xml.includes('controls_if') || xml.includes('controls_ifelse')) {
          markObjectiveComplete(2); // "Use a loop block or an if/else block"
        }
      }
      if (currentSection === 1) {
        if (hasEndBlock) {
          markObjectiveComplete(1); // "Use both Start and End blocks"
        }
        const xml = workspace.current ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace.current)) : '';
        if ((xml.includes('color_blue') || xml.includes('action_increase_heat')) && (xml.includes('color_green') || xml.includes('action_mix'))) {
          markObjectiveComplete(2); // "Refine blue fuel and green fuel"
        }
      }
      if (currentSection === 2) {
        const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace.current));
        if (xml.includes('repeat_until_goal') || xml.includes('repeat_x_times') || xml.includes('repeat_simple')) {
          markObjectiveComplete(1); // "Use a loop block"
        }
      }
      if (currentSection === 3) {
        const xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace.current));
        if (xml.includes('if_path_is') || xml.includes('logic_and') || xml.includes('logic_or')) {
          markObjectiveComplete(1); // "Use a condition block"
        }
      }
    } else {
      // Level 1 Directives
      const xml = workspace.current ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace.current)) : '';
      const uniqueDirections = new Set([
        xml.includes('move_up') && 'up',
        xml.includes('move_down') && 'down',
        xml.includes('move_left') && 'left',
        xml.includes('move_right') && 'right'
      ].filter(Boolean));

      if (currentSection === 0) {
        markObjectiveComplete(2); // "Run your first code"
        if (hasEndBlock) {
          markObjectiveComplete(1);
        }
      }
      if (currentSection === 1) {
        if (hasEndBlock) {
          markObjectiveComplete(1);
        }
        if (initialBlockCount >= 5) {
          markObjectiveComplete(2); // "Use 5 or more movement blocks"
        }
      }
      if (currentSection === 2) {
        if (hasEndBlock) {
          markObjectiveComplete(1);
        }
        if (uniqueDirections.size >= 3) {
          markObjectiveComplete(2); // "Use 3 different movement directions"
        }
      }
      if (currentSection === 3) {
        if (hasEndBlock) {
          markObjectiveComplete(1);
        }
        if (uniqueDirections.size >= 4) {
          markObjectiveComplete(2); // "Use all 4 movement directions"
        }
      }
    }

    // Exploit 5 Patch: Strictly compile only connected statements descending from event_start
    javascriptGenerator.init(workspace.current);
    const firstExecutableBlock = startBlock.getNextBlock();
    javascriptGenerator.STATEMENT_PREFIX = '';
    const rawGeneratedCode = firstExecutableBlock ? (javascriptGenerator.blockToCode(firstExecutableBlock) as string) : '';
    const code = typeof rawGeneratedCode === 'string' ? rawGeneratedCode : Array.isArray(rawGeneratedCode) ? (rawGeneratedCode as any)[0] : '';
    setJsCode(code);

    const english = generatePlainEnglishPseudocode(workspace.current);
    setPlainEnglishCode(english);

    if (!code || code.trim() === '') {
      setIsRunning(false);
      return;
    }

    javascriptGenerator.STATEMENT_PREFIX = 'await highlightBlock(%1);\n';
    const instrumentedRawCode = firstExecutableBlock ? (javascriptGenerator.blockToCode(firstExecutableBlock) as string) : '';
    const instrumentedCode = typeof instrumentedRawCode === 'string' ? instrumentedRawCode : Array.isArray(instrumentedRawCode) ? (instrumentedRawCode as any)[0] : '';
    javascriptGenerator.STATEMENT_PREFIX = '';

    let currentExecutingBlockId: string | null = null;
    const highlightBlock = async (id: string | null) => {
      checkCancelled();
      currentExecutingBlockId = id;
      if (workspace.current) {
        workspace.current.highlightBlock(id);
      }
    };

    const maze = activeSection.maze.map(r => [...r]);
    const runtimeInventory: InventoryState = { fuel: 0, oxygen: 0 };

    const checkCancelled = () => {
      if (thisExecId !== executionIdRef.current) {
        throw new Error("SIMULATION_CANCELLED");
      }
    };

    const delay = async (ms: number) => {
      const start = Date.now();
      while (Date.now() - start < ms) {
        checkCancelled();
        await new Promise(res => setTimeout(res, 25));
      }
      checkCancelled();
    };

    let stepCount = 0;
    let consecutiveWallBumps = 0;
    let consecutiveRotations = 0;
    const MAX_STEPS = 60; // Strict Infinite Loop Safety Net

    const checkGameStatus = async () => {
      checkCancelled();
      stepCount++;
      if (stepCount >= MAX_STEPS || consecutiveWallBumps >= 4 || consecutiveRotations >= 8) {
        if (currentExecutingBlockId && workspace.current) {
          markBlockError(workspace.current, currentExecutingBlockId);
        }
        if (overloadToastTimer.current) clearTimeout(overloadToastTimer.current);
        setShowOverloadToast(true);
        overloadToastTimer.current = setTimeout(() => setShowOverloadToast(false), 4500);
        throw new Error("System Overload");
      }
      await delay(10);
    };

    const moveToCoord = async (targetX: number, targetY: number, newDir: number) => {
      checkCancelled();
      if (isGoal.current) return;
      stepCount++;
      if (stepCount >= MAX_STEPS) {
        if (currentExecutingBlockId && workspace.current) {
          markBlockError(workspace.current, currentExecutingBlockId);
        }
        if (overloadToastTimer.current) clearTimeout(overloadToastTimer.current);
        setShowOverloadToast(true);
        overloadToastTimer.current = setTimeout(() => setShowOverloadToast(false), 4500);
        throw new Error("System Overload");
      }

      execState.current.direction = newDir;

      // Strict Boundary & Out of Bounds Check: prevents escaping the grid perimeter
      const isOutOfBounds = 
        targetY < 0 || 
        targetY >= maze.length || 
        targetX < 0 || 
        targetX >= (maze[targetY]?.length ?? 0);

      if (isOutOfBounds) {
        // Wall bump against grid boundary
        consecutiveWallBumps++;
        if (consecutiveWallBumps >= 4) {
          if (currentExecutingBlockId && workspace.current) {
            markBlockError(workspace.current, currentExecutingBlockId);
          }
          if (overloadToastTimer.current) clearTimeout(overloadToastTimer.current);
          setShowOverloadToast(true);
          overloadToastTimer.current = setTimeout(() => setShowOverloadToast(false), 4500);
          throw new Error("System Overload");
        }
        setIsBumping(true);
        setCharState({ ...execState.current });
        await delay(300);
        setIsBumping(false);
        return;
      }

      // Check Level 3 Section 0 Hazard (Broken Fan: 3)
      if (isLevel3 && currentSection === 0 && maze[targetY][targetX] === 3) {
        if (currentExecutingBlockId && workspace.current) {
          markBlockError(workspace.current, currentExecutingBlockId);
        }
        setFailCoords({ x: targetX, y: targetY });
        setErrorToastMessage("Airflow destroyed by broken fan!");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
        setTookDamage(true);
        setIsRunning(false);
        if (bombDamageTimerRef.current) clearTimeout(bombDamageTimerRef.current);
        bombDamageTimerRef.current = setTimeout(() => {
          if (thisExecId === executionIdRef.current) {
            setTookDamage(false);
            setFailCoords(null);
            setCharState(activeSection.initialState);
            execState.current = { ...activeSection.initialState };
            setActiveGrid(activeSection.maze.map(r => [...r]));
          }
        }, 1500);
        throw new Error("AIRFLOW_DESTROYED");
      }

      // Check Bomb Obstacle (tile 2)
      if (maze[targetY][targetX] === 2 && !(isLevel3 && currentSection === 0)) {
        if (currentExecutingBlockId && workspace.current) {
          markBlockError(workspace.current, currentExecutingBlockId);
        }
        steppedOnBomb.current = true;
        execState.current.x = targetX;
        execState.current.y = targetY;
        setCharState({ ...execState.current });
        setTookDamage(true);
        setIsRunning(false);

        // Exploit 2 Patch: Use cancelable ref to prevent orphaned recovery timer desync
        if (bombDamageTimerRef.current) clearTimeout(bombDamageTimerRef.current);
        bombDamageTimerRef.current = setTimeout(() => {
          if (thisExecId === executionIdRef.current) {
            setTookDamage(false);
            setCharState(activeSection.initialState);
            execState.current = { ...activeSection.initialState };
          }
        }, 1500);

        throw new Error("BOMB_EXPLODED");
      }

      // Check Void / Invisible tile (tile 0)
      const isVoid = maze[targetY][targetX] === 0;

      if (!isVoid) {
        consecutiveWallBumps = 0;
        consecutiveRotations = 0; // Reset rotation spin counter on forward movement

        if (isLevel3 && currentSection === 0) {
          // Mutate previous cell to 5 (cyan oxygen trail)
          if (maze[execState.current.y][execState.current.x] !== 4) {
            maze[execState.current.y][execState.current.x] = 5;
            setActiveGrid(maze.map(r => [...r]));
          }
        }

        // Open playable cell: move rover smoothly
        execState.current.x = targetX;
        execState.current.y = targetY;
        setCharState({ ...execState.current });

        // Goal reached check (tile 4)
        if (maze[targetY][targetX] === 4) {
          isGoal.current = true;
          if (hasEndBlock) {
            recordSectionCompleted(currentSection);
            markObjectiveComplete(3);
          }
        }
        await delay(400);
      } else {
        // Soft Collision on void boundary: Rover shakes in place, wastes step, moves on
        consecutiveWallBumps++;
        if (consecutiveWallBumps >= 4) {
          if (currentExecutingBlockId && workspace.current) {
            markBlockError(workspace.current, currentExecutingBlockId);
          }
          if (overloadToastTimer.current) clearTimeout(overloadToastTimer.current);
          setShowOverloadToast(true);
          overloadToastTimer.current = setTimeout(() => setShowOverloadToast(false), 4500);
          throw new Error("System Overload");
        }
        setIsBumping(true);
        setCharState({ ...execState.current });
        await delay(300);
        setIsBumping(false);
      }
    };

    const moveForward = async () => {
      checkCancelled();
      if (isGoal.current) return;
      const dir = execState.current.direction;
      let nextX = execState.current.x;
      let nextY = execState.current.y;
      if (dir === 0) nextY -= 1;
      else if (dir === 1) nextX += 1;
      else if (dir === 2) nextY += 1;
      else if (dir === 3) nextX -= 1;
      await moveToCoord(nextX, nextY, dir);
    };

    const moveBackward = async () => {
      checkCancelled();
      if (isGoal.current) return;
      const dir = execState.current.direction;
      let nextX = execState.current.x;
      let nextY = execState.current.y;
      // Move in the opposite direction without changing the facing direction
      if (dir === 0) nextY += 1;
      else if (dir === 1) nextX -= 1;
      else if (dir === 2) nextY += 1;
      else if (dir === 3) nextX += 1;
      await moveToCoord(nextX, nextY, dir);
    };

    const moveUp = async () => {
      checkCancelled();
      if (isGoal.current) return;
      await moveToCoord(execState.current.x, execState.current.y - 1, 0);
    };

    const moveDown = async () => {
      checkCancelled();
      if (isGoal.current) return;
      await moveToCoord(execState.current.x, execState.current.y + 1, 2);
    };

    const moveLeft = async () => {
      checkCancelled();
      if (isGoal.current) return;
      await moveToCoord(execState.current.x - 1, execState.current.y, 3);
    };

    const moveRight = async () => {
      checkCancelled();
      if (isGoal.current) return;
      await moveToCoord(execState.current.x + 1, execState.current.y, 1);
    };

    const turnLeft = async () => {
      checkCancelled();
      if (isGoal.current) return;
      stepCount++;
      consecutiveRotations++;
      if (consecutiveRotations >= 8) {
        if (currentExecutingBlockId && workspace.current) {
          markBlockError(workspace.current, currentExecutingBlockId);
        }
        if (overloadToastTimer.current) clearTimeout(overloadToastTimer.current);
        setShowOverloadToast(true);
        overloadToastTimer.current = setTimeout(() => setShowOverloadToast(false), 4500);
        throw new Error("System Overload");
      }
      // Turn 90 deg counter-clockwise
      execState.current.direction = (execState.current.direction + 3) % 4;
      setCharState({ ...execState.current });
      await delay(450);
    };

    const turnRight = async () => {
      checkCancelled();
      if (isGoal.current) return;
      stepCount++;
      consecutiveRotations++;
      if (consecutiveRotations >= 8) {
        if (currentExecutingBlockId && workspace.current) {
          markBlockError(workspace.current, currentExecutingBlockId);
        }
        if (overloadToastTimer.current) clearTimeout(overloadToastTimer.current);
        setShowOverloadToast(true);
        overloadToastTimer.current = setTimeout(() => setShowOverloadToast(false), 4500);
        throw new Error("System Overload");
      }
      // Turn 90 deg clockwise
      execState.current.direction = (execState.current.direction + 1) % 4;
      setCharState({ ...execState.current });
      await delay(450);
    };

    // Level 2 Inventory Sensor and Actions
    const pickupItem = async () => {
      checkCancelled();
      const cx = execState.current.x;
      const cy = execState.current.y;
      const tile = maze[cy]?.[cx];

      if (tile === 5) {
        // Fuel collected
        runtimeInventory.fuel++;
        setInventory({ ...runtimeInventory });
        maze[cy][cx] = 1;
        setActiveGrid(maze.map(r => [...r]));
        await delay(350);
      } else if (tile === 6) {
        // Oxygen collected
        runtimeInventory.oxygen++;
        setInventory({ ...runtimeInventory });
        maze[cy][cx] = 1;
        setActiveGrid(maze.map(r => [...r]));
        await delay(350);
      } else if (tile === 7) {
        // Junk picked up: halt and trigger specific error toast
        if (currentExecutingBlockId && workspace.current) {
          markBlockError(workspace.current, currentExecutingBlockId);
        }
        setErrorToastMessage("Warning: Cannot pack Junk!");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
        setTookDamage(true);
        if (bombDamageTimerRef.current) clearTimeout(bombDamageTimerRef.current);
        bombDamageTimerRef.current = setTimeout(() => {
          if (thisExecId === executionIdRef.current) {
            setTookDamage(false);
            setCharState(activeSection.initialState);
            execState.current = { ...activeSection.initialState };
          }
        }, 1500);
        throw new Error("CANNOT_PACK_JUNK");
      } else {
        // Empty tile interaction error
        if (currentExecutingBlockId && workspace.current) {
          markBlockError(workspace.current, currentExecutingBlockId);
        }
        setErrorToastMessage("Error: Nothing to interact with here.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
        setTookDamage(true);
        if (bombDamageTimerRef.current) clearTimeout(bombDamageTimerRef.current);
        bombDamageTimerRef.current = setTimeout(() => {
          if (thisExecId === executionIdRef.current) {
            setTookDamage(false);
            setCharState(activeSection.initialState);
            execState.current = { ...activeSection.initialState };
          }
        }, 1500);
        throw new Error("EMPTY_INTERACTION");
      }
    };

    const trashItem = async () => {
      checkCancelled();
      const cx = execState.current.x;
      const cy = execState.current.y;
      const tile = maze[cy]?.[cx];

      if (tile === 7) {
        // Junk successfully discarded
        maze[cy][cx] = 1;
        setActiveGrid(maze.map(r => [...r]));
        await delay(350);
      } else if (tile === 5 || tile === 6) {
        if (currentExecutingBlockId && workspace.current) {
          markBlockError(workspace.current, currentExecutingBlockId);
        }
        setErrorToastMessage("Warning: Cannot trash resources!");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
        setTookDamage(true);
        if (bombDamageTimerRef.current) clearTimeout(bombDamageTimerRef.current);
        bombDamageTimerRef.current = setTimeout(() => {
          if (thisExecId === executionIdRef.current) {
            setTookDamage(false);
            setCharState(activeSection.initialState);
            execState.current = { ...activeSection.initialState };
          }
        }, 1500);
        throw new Error("CANNOT_TRASH_RESOURCES");
      } else {
        if (currentExecutingBlockId && workspace.current) {
          markBlockError(workspace.current, currentExecutingBlockId);
        }
        setErrorToastMessage("Error: Nothing to interact with here.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
        setTookDamage(true);
        if (bombDamageTimerRef.current) clearTimeout(bombDamageTimerRef.current);
        bombDamageTimerRef.current = setTimeout(() => {
          if (thisExecId === executionIdRef.current) {
            setTookDamage(false);
            setCharState(activeSection.initialState);
            execState.current = { ...activeSection.initialState };
          }
        }, 1500);
        throw new Error("EMPTY_INTERACTION");
      }
    };

    const scanItem = () => {
      checkCancelled();
      const cx = execState.current.x;
      const cy = execState.current.y;
      const tile = maze[cy]?.[cx];
      if (tile === 5) return 'Fuel';
      if (tile === 6) return 'Oxygen';
      if (tile === 7) return 'Junk';
      return 'None';
    };

    // Helper: evaluates if (x, y) is a walkable playable cell within boundaries
    const isWalkableTile = (x: number, y: number) => {
      if (y < 0 || y >= maze.length || x < 0 || x >= (maze[y]?.length ?? 0)) return false;
      const cell = maze[y][x];
      if (isLevel3 && currentSection === 0) {
        return cell !== 0 && cell !== 3;
      }
      return cell !== 0 && cell !== 2;
    };

    const isPathAhead = () => {
      let nextX = execState.current.x;
      let nextY = execState.current.y;
      const dir = execState.current.direction;
      if (dir === 0) nextY -= 1;
      else if (dir === 1) nextX += 1;
      else if (dir === 2) nextY += 1;
      else if (dir === 3) nextX -= 1;
      return isWalkableTile(nextX, nextY);
    };

    const isPathLeft = () => {
      let nextX = execState.current.x;
      let nextY = execState.current.y;
      const leftDir = (execState.current.direction + 3) % 4;
      if (leftDir === 0) nextY -= 1;
      else if (leftDir === 1) nextX += 1;
      else if (leftDir === 2) nextY += 1;
      else if (leftDir === 3) nextX -= 1;
      return isWalkableTile(nextX, nextY);
    };

    const isPathRight = () => {
      let nextX = execState.current.x;
      let nextY = execState.current.y;
      const rightDir = (execState.current.direction + 1) % 4;
      if (rightDir === 0) nextY -= 1;
      else if (rightDir === 1) nextX += 1;
      else if (rightDir === 2) nextY += 1;
      else if (rightDir === 3) nextX -= 1;
      return isWalkableTile(nextX, nextY);
    };

    const isAtGoal = () => {
      return isGoal.current;
    };

    const getRelativeTile = (offset: number) => {
      const dir = (execState.current.direction + offset) % 4;
      let targetX = execState.current.x;
      let targetY = execState.current.y;
      if (dir === 0) targetY -= 1;
      else if (dir === 1) targetX += 1;
      else if (dir === 2) targetY += 1;
      else if (dir === 3) targetX -= 1;
      if (targetY < 0 || targetY >= maze.length || targetX < 0 || targetX >= (maze[targetY]?.length ?? 0)) {
        return { tile: 0, x: targetX, y: targetY };
      }
      return { tile: maze[targetY][targetX], x: targetX, y: targetY };
    };

    const isHazardAhead = () => {
      const t = getRelativeTile(0).tile;
      if (isLevel3 && currentSection === 0) {
        return t === 3;
      }
      return t === 2;
    };
    const isHazardLeft = () => {
      const t = getRelativeTile(3).tile;
      if (isLevel3 && currentSection === 0) {
        return t === 3;
      }
      return t === 2;
    };
    const isHazardRight = () => {
      const t = getRelativeTile(1).tile;
      if (isLevel3 && currentSection === 0) {
        return t === 3;
      }
      return t === 2;
    };

    const isPathClearForward = () => {
      const t = getRelativeTile(0).tile;
      if (isLevel3 && currentSection === 0) {
        return t === 1 || t === 2 || t === 4 || t === 5;
      }
      return t === 1 || t === 4;
    };
    const isPathClearLeft = () => {
      const t = getRelativeTile(3).tile;
      if (isLevel3 && currentSection === 0) {
        return t === 1 || t === 2 || t === 4 || t === 5;
      }
      return t === 1 || t === 4;
    };
    const isPathClearRight = () => {
      const t = getRelativeTile(1).tile;
      if (isLevel3 && currentSection === 0) {
        return t === 1 || t === 2 || t === 4 || t === 5;
      }
      return t === 1 || t === 4;
    };
    const isPathBlockedForward = () => !isPathClearForward();
    const isPathBlockedLeft = () => !isPathClearLeft();
    const isPathBlockedRight = () => !isPathClearRight();

    const isAtDeadEnd = () => {
      return !isPathClearForward() && !isPathClearLeft() && !isPathClearRight();
    };

    const queueOverride = async () => {
      checkCancelled();
      await delay(200);
    };

    const lockSelection = async () => {
      checkCancelled();
      await delay(200);
    };

    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const executeFn = new AsyncFunction(
        'moveForward', 
        'moveBackward',
        'moveUp', 
        'moveDown', 
        'moveLeft', 
        'moveRight', 
        'turnLeft', 
        'turnRight', 
        'isPathAhead', 
        'isPathLeft', 
        'isPathRight', 
        'isHazardAhead',
        'isHazardLeft',
        'isHazardRight',
        'isPathClearForward',
        'isPathBlockedForward',
        'isPathClearLeft',
        'isPathBlockedLeft',
        'isPathClearRight',
        'isPathBlockedRight',
        'isAtDeadEnd',
        'isAtGoal', 
        'scanItem',
        'pickupItem',
        'trashItem',
        'queueOverride',
        'lockSelection',
        'checkGameStatus', 
        'highlightBlock',
        instrumentedCode
      );
      
      await executeFn(
        moveForward, 
        moveBackward, 
        moveUp, 
        moveDown, 
        moveLeft, 
        moveRight, 
        turnLeft, 
        turnRight, 
        isPathAhead, 
        isPathLeft, 
        isPathRight, 
        isHazardAhead,
        isHazardLeft,
        isHazardRight,
        isPathClearForward,
        isPathBlockedForward,
        isPathClearLeft,
        isPathBlockedLeft,
        isPathClearRight,
        isPathBlockedRight,
        isAtDeadEnd,
        isAtGoal, 
        scanItem, 
        pickupItem, 
        trashItem, 
        queueOverride, 
        lockSelection,
        checkGameStatus,
        highlightBlock
      );
      
      // Standard Maze Win Check
      const reachedGoal = isGoal.current || (maze[execState.current.y] && maze[execState.current.y][execState.current.x] === 4);
        
        if (reachedGoal) {
          if (hasEndBlock) {
            recordSectionCompleted(currentSection);
            markObjectiveComplete(3);

            if (isLevel3) {
              if (currentSection === 2 && !steppedOnBomb.current) {
                markObjectiveComplete(2);
              }
              if (currentSection === 3 && !steppedOnBomb.current) {
                markObjectiveComplete(2);
              }
            }

            setShowPopup(true);

            const bonusKey = `${missionId}_sec${currentSection}_bonus`;
            let claimedList: string[] = [];
            try {
              claimedList = JSON.parse(localStorage.getItem('netstart_claimed_directives') || '[]');
            } catch (e) {}

            if (!claimedList.includes(bonusKey)) {
              addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, `Section ${currentSection + 1} Cleared`);
              claimedList.push(bonusKey);
              try {
                localStorage.setItem('netstart_claimed_directives', JSON.stringify(claimedList));
              } catch (e) {}
            }

            if (currentSection === currentMissionSections.length - 1) {
              // Write completion to localStorage IMMEDIATELY so UI updates before API responds
              try {
                localStorage.removeItem('netstart_active_saved_level');
                localStorage.removeItem('netstart_active_level');
                if (missionId) {
                  const compKey = 'netstart_completed_missions';
                  const existing: string[] = JSON.parse(localStorage.getItem(compKey) || '[]');
                  if (!existing.includes(missionId)) { existing.push(missionId); localStorage.setItem(compKey, JSON.stringify(existing)); }
                  if (!localStorage.getItem('netstart_last_animated_planet_idx')) localStorage.setItem('netstart_last_animated_planet_idx', '0');
                  localStorage.setItem('netstart_planet_unlock_pending', 'true');
                }
              } catch (e) {}
              triggerMissionCompletion(code);
            }
          } else {
            setIsWarningPulse(true);
            if (endToastTimer.current) clearTimeout(endToastTimer.current);
            setShowEndToast(true);
            endToastTimer.current = setTimeout(() => setShowEndToast(false), 5500);
          }
        }
      } catch (e: any) {
      if (currentExecutingBlockId && workspace.current && e?.message !== 'SIMULATION_CANCELLED') {
        markBlockError(workspace.current, currentExecutingBlockId);
      }
      if (
        e.message !== "System Overload" && 
        e.message !== "BOMB_EXPLODED" && 
        e.message !== "SIMULATION_CANCELLED" &&
        e.message !== "CANNOT_PACK_JUNK" &&
        e.message !== "CANNOT_TRASH_RESOURCES" &&
        e.message !== "EMPTY_INTERACTION"
      ) {
        console.warn("Simulation run ended:", e.message);
      }
    } finally {
      if (thisExecId === executionIdRef.current) {
        setIsRunning(false);
      }
    }
  };

  const isSectionBonusClaimed = claimedDirectives.includes(`${missionId}_sec${currentSection}_bonus`);
  const allLevelGoalsClaimed = currentMissionSections.every(sec => 
    sec.objectives.every(obj => claimedDirectives.includes(`${missionId}_sec${sec.sectionIndex}_goal${obj.id}`)) &&
    claimedDirectives.includes(`${missionId}_sec${sec.sectionIndex}_bonus`)
  );

  const isLevelCompleted = isReplayMode || completedSections.length >= currentMissionSections.length;
  const totalCount = objectives.length;
  const rawCompletedCount = objectives.filter(o => o.completed).length;
  const completedCount = isLevelCompleted ? totalCount : rawCompletedCount;
  const currentSectionXp = (completedCount * XP_REWARDS.CAMPAIGN_GOAL) + (showPopup || isLevelCompleted ? XP_REWARDS.SECTION_COMPLETION_BONUS : 0);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d0418] text-white overflow-hidden select-none font-sans min-h-0">
      
      {/* ========================================================================= */}
      {/* GLOBAL TOP NAVIGATION HEADER (Sections Moved to the Left) */}
      {/* ========================================================================= */}
      <header className="h-16 pl-3.5 sm:pl-4 pr-6 bg-[#160628] border-b border-white/10 flex items-center justify-between shadow-lg z-[1000] shrink-0 relative">
        {/* Left: Pause Button, Planet Icon, Level Title & 4-Section Stepper */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Three-line Pause Screen Button (Positioned more to the left) */}
          <button
            onClick={() => setIsPaused(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-[#ff912d]/20 border border-white/10 hover:border-[#ff912d]/40 text-gray-300 hover:text-[#ff912d] transition-all flex items-center justify-center active:scale-95 cursor-pointer shadow-md shrink-0"
            title="Leave Game"
          >
            <Menu size={18} />
          </button>

          {/* Planet / Moon Icon with Level Title & Section */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <img 
              src={planetIcon} 
              alt="Planet Icon" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_8px_rgba(255,145,45,0.4)] shrink-0" 
            />
            <div className="shrink-0">
              <h1 className="font-display font-black text-sm sm:text-base text-white tracking-wide uppercase leading-tight">
                {displayTitle}
              </h1>
              <p className="text-[10px] font-mono text-gray-400 leading-tight mt-0.5">Section {currentSection + 1} of {currentMissionSections.length}</p>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10 hidden lg:block" />

          {/* 4-Section Stepper Tracker with Prerequisite Route Locking */}
          <div className="hidden md:flex items-center gap-2 bg-[#10031e] border border-white/10 px-3 py-1.5 rounded-full shadow-inner">
            {currentMissionSections.map((sec, idx) => {
              const isPast = completedSections.includes(idx);
              const isCur = idx === currentSection;
              const isLocked = isSectionLocked(idx);

              return (
                <button
                  key={sec.sectionIndex}
                  disabled={isLocked}
                  onClick={isLocked ? undefined : () => loadSection(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all ${
                    isLocked
                      ? 'opacity-40 cursor-not-allowed bg-white/5 text-gray-500 border border-white/5'
                      : isCur 
                      ? 'bg-[#ff912d]/15 text-[#ff912d] border border-[#ff912d]/35 shadow-[0_0_8px_rgba(255,145,45,0.3)] cursor-pointer' 
                      : isPast 
                      ? isLevelCompleted
                        ? 'bg-purple-950/20 text-purple-300/60 border border-purple-500/20 hover:bg-purple-900/30 hover:text-purple-200/80 cursor-pointer'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer hover:bg-emerald-500/30' 
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  {isLocked ? (
                    <Lock size={12} className="shrink-0 text-gray-500" />
                  ) : isPast ? (
                    <Check size={12} className={`stroke-[2.5] ${isCur ? 'text-[#ff912d]' : isLevelCompleted ? 'text-purple-400/50' : 'text-emerald-400'}`} />
                  ) : null}
                  <span>{`Section ${idx + 1}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Mission Goals Dropdown & AI Assist Button */}
        <div className="flex items-center gap-3">
          {/* Mission Goals Dropdown with Integrated Goal Rewards (+20 XP) */}
          <div className="relative z-[1001]" ref={dropdownRef}>
            <button
              onClick={() => setIsObjectivesOpen(prev => !prev)}
              className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-xl border transition-all cursor-pointer text-xs sm:text-sm font-mono font-bold shadow-md ${
                buttonPulse 
                  ? 'bg-[#ff912d]/30 border-[#ff912d] text-[#ff912d] animate-pulse shadow-[0_0_20px_rgba(255,145,45,0.7)]' 
                  : isObjectivesOpen 
                    ? 'bg-[#1a082c] border-[#ff912d] text-white' 
                    : 'bg-white/5 hover:bg-white/10 border-white/15 text-gray-200 hover:text-white'
              }`}
              aria-expanded={isObjectivesOpen}
            >
              <Target size={16} className="text-[#ff912d] shrink-0" />
              <span className="font-display uppercase tracking-wider">Mission Goals</span>
              
              {/* Progress Badge */}
              <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold ${
                isLevelCompleted
                  ? 'bg-purple-950/30 text-purple-300/70 border border-purple-500/25'
                  : completedCount === totalCount && totalCount > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/30'
              }`}>
                {completedCount}/{totalCount}
              </span>

              <ChevronDown 
                size={15} 
                className={`transition-transform duration-200 text-gray-400 ${isObjectivesOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Glassmorphism Objectives Dropdown Panel */}
            {isObjectivesOpen && (
              <div className="absolute top-full right-0 mt-2 w-88 sm:w-[420px] bg-[#1a082c]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-2xl z-[1002] animate-in fade-in zoom-in-95 duration-150">
                <div className="bg-[#150724]/90 border border-white/10 rounded-xl p-3.5 mb-3 shadow-inner">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff912d] shadow-[0_0_6px_#ff912d] shrink-0" />
                      <span className="text-xs sm:text-sm font-mono font-bold text-[#ff912d] uppercase tracking-wider truncate">
                        {displayTitle}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-gray-400 font-semibold whitespace-nowrap shrink-0">{activeSection.subtag}</span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans mb-3">
                    {activeSection.desc}
                  </p>

                  {/* Goal Rewards (+50 XP / +20 XP) Box with Replay / Claimed State */}
                  <div className={`rounded-lg p-2.5 flex items-center justify-between relative group/bonus transition-all ${
                    isLevelCompleted
                      ? 'bg-purple-950/20 border border-purple-500/20 opacity-70 cursor-default'
                      : (completedSections.includes(currentSection) || (completedCount === totalCount && totalCount > 0))
                      ? 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'bg-[#0e0419] border border-white/10'
                  }`}>
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">Goal Rewards</span>
                    <span className={`flex items-center gap-1 text-xs sm:text-sm font-mono font-bold ${
                      isLevelCompleted
                        ? 'text-purple-400/40 line-through'
                        : (completedSections.includes(currentSection) || (completedCount === totalCount && totalCount > 0))
                        ? 'text-emerald-400'
                        : 'text-yellow-400'
                    }`}>
                      <Zap size={14} className={
                        isLevelCompleted 
                          ? "text-purple-400/40" 
                          : (completedSections.includes(currentSection) || (completedCount === totalCount && totalCount > 0))
                          ? "fill-emerald-400 text-emerald-400"
                          : "fill-yellow-400 text-yellow-400"
                      } />
                      <span>+{XP_REWARDS.SECTION_COMPLETION_BONUS} XP</span>
                      {isLevelCompleted ? (
                        <span className="text-[10px] font-mono font-bold text-purple-400/50 uppercase ml-1 no-underline">Claimed</span>
                      ) : (completedSections.includes(currentSection) || (completedCount === totalCount && totalCount > 0)) ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-900/50 border border-emerald-500/40 px-1.5 py-0.5 rounded uppercase ml-1">Claimed</span>
                      ) : null}
                    </span>

                    {/* Tooltip on hover if replay claimed - anchored outside text flow */}
                    {isLevelCompleted && (
                      <div className="absolute -top-11 left-1/2 -translate-x-1/2 hidden group-hover/bonus:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#120520]/95 border border-purple-500/40 text-xs text-purple-200 font-sans shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-md whitespace-nowrap z-[100] pointer-events-none">
                        <Sparkles size={13} className="text-amber-400 shrink-0" />
                        <span>
                          {allLevelGoalsClaimed 
                            ? "You already claimed the rewards for this level" 
                            : "You already claimed the completion bonus for this section"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Objectives List with 3-State System */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase tracking-wider font-bold px-1">
                    <span>{currentMissionSections.length > 1 ? `Section ${currentSection + 1} Objectives` : 'Objectives'}</span>
                    <span>{completedCount}/{totalCount} Completed</span>
                  </div>

                  {objectives.map((obj) => {
                    const isRecentlyCompleted = recentlyCompletedId === obj.id;
                    const isSecDone = completedSections.includes(currentSection);

                    // CASE 1: ALREADY COMPLETED LEVEL (REPLAY) -> MUTED PURPLE & CROSSED OUT
                    if (isLevelCompleted) {
                      return (
                        <div 
                          key={obj.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-purple-500/20 bg-purple-950/20 opacity-70 transition-all duration-300"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <CheckCircle2 size={16} className="shrink-0 text-purple-400/50" />
                            <span className="text-xs sm:text-sm font-sans text-purple-300/60 line-through truncate">
                              {obj.text}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-xs font-mono line-through text-purple-400/40 bg-transparent border-none px-1.5 py-0.5">
                              +{XP_REWARDS.CAMPAIGN_GOAL} XP
                            </span>
                            <span className="text-[10px] font-mono font-bold text-purple-400/50 uppercase">
                              Claimed
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // CASE 2: IN-PROGRESS LEVEL -> ACCOMPLISHED OBJECTIVES TURN VIBRANT GREEN
                    if (obj.completed) {
                      return (
                        <div 
                          key={obj.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] transition-all duration-300 ${
                            isRecentlyCompleted ? 'animate-pulse ring-1 ring-emerald-400' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <CheckCircle2 size={16} className="shrink-0 text-emerald-400 drop-shadow-[0_0_6px_#10b981]" />
                            <span className="text-xs sm:text-sm font-medium text-emerald-300 font-sans truncate">
                              {obj.text}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-900/40 border border-emerald-500/50 px-2 py-1 rounded shadow-[0_0_8px_rgba(52,211,153,0.4)] shrink-0">
                            +{XP_REWARDS.CAMPAIGN_GOAL} XP
                          </span>
                        </div>
                      );
                    }

                    // CASE 3: IN-PROGRESS LEVEL -> INCOMPLETE OBJECTIVES (OPEN CIRCLES)
                    return (
                      <div 
                        key={obj.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border bg-black/20 border-white/5 text-gray-300 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <Circle size={16} className="text-gray-500 shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-300 font-sans truncate">
                            {obj.text}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-gray-400 bg-gray-800/50 px-2 py-1 rounded shrink-0">
                          +{XP_REWARDS.CAMPAIGN_GOAL} XP
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* AI Assist Button */}
          <button 
            className="p-2.5 bg-purple-900/50 hover:bg-purple-600/60 border border-purple-500/50 rounded-xl transition-all group cursor-pointer shadow-lg active:scale-95 flex items-center justify-center"
            title="Gemini AI Assist - Offline"
            aria-label="Gemini AI Assist - Offline"
          >
            <Sparkles className="w-5 h-5 text-purple-200 group-hover:text-white transition-colors" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2-PANE ADJUSTABLE RESIZABLE LAYOUT (100% Height Fill) */}
      {/* ========================================================================= */}
      <div 
        ref={containerRef}
        className="flex-1 flex flex-row min-h-0 w-full overflow-hidden relative"
      >
        {/* LEFT PANE: Blockly Workspace / Syntax View */}
        <div 
          className="h-full flex flex-col min-w-[300px] relative bg-[#130927]"
          style={{ width: `${splitPercent}%` }}
        >
          {/* Top Control Ribbon */}
          <div className="h-12 px-4 bg-[#1a082c] border-b border-white/10 flex items-center justify-start shrink-0 z-10">
            {/* View Toggle */}
            <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('blocks')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'blocks'
                    ? 'bg-[#ff912d] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Visual Layout
              </button>
              <button
                onClick={() => setViewMode('syntax')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'syntax'
                    ? 'bg-[#ff912d] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Context
              </button>
            </div>
          </div>

          {/* Blockly SVG Canvas View */}
          <div 
            className={`flex-1 min-h-0 w-full relative ${viewMode === 'blocks' ? 'block' : 'hidden'}`}
          >
            <div ref={blocklyDiv} className="w-full h-full" />

            {/* Drag & Select Overlay Layer */}
            {isSelectMode && (
              <div 
                className="absolute inset-0 z-10 cursor-crosshair select-none"
                onMouseDown={(e) => {
                  if (e.button !== 0) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  setSelectionBox({
                    startX: x,
                    startY: y,
                    currentX: x,
                    currentY: y,
                    isDragging: true,
                  });
                }}
                onMouseMove={(e) => {
                  if (!selectionBox?.isDragging) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setSelectionBox(prev => prev ? {
                    ...prev,
                    currentX: e.clientX - rect.left,
                    currentY: e.clientY - rect.top,
                  } : null);
                }}
                onMouseUp={(e) => {
                  if (!selectionBox?.isDragging || !workspace.current) {
                    setSelectionBox(null);
                    setIsSelectMode(false);
                    return;
                  }
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x1 = Math.min(selectionBox.startX, selectionBox.currentX);
                  const x2 = Math.max(selectionBox.startX, selectionBox.currentX);
                  const y1 = Math.min(selectionBox.startY, selectionBox.currentY);
                  const y2 = Math.max(selectionBox.startY, selectionBox.currentY);

                  const dragDistance = Math.hypot(x2 - x1, y2 - y1);
                  const selScreenLeft = rect.left + x1;
                  const selScreenRight = rect.left + x2;
                  const selScreenTop = rect.top + y1;
                  const selScreenBottom = rect.top + y2;

                  setSelectionBox(null);
                  setIsSelectMode(false); // Automatically toggle off drag select mode so user can freely drag/move the selected blocks

                  const ws = workspace.current;
                  const allBlocks = ws.getAllBlocks(false) as Blockly.BlockSvg[];
                  const matchingBlocksSet = new Set<Blockly.BlockSvg>();

                  // Clear any previous multi-select highlights
                  allBlocks.forEach(b => {
                    const svg = b.getSvgRoot();
                    if (svg) svg.classList.remove('blockly-block-multiselected');
                  });

                  if (dragDistance <= 5) {
                    // Precise Single-Point Click Selection
                    const elements = document.elementsFromPoint(e.clientX, e.clientY);
                    for (const el of elements) {
                      const blockG = el.closest('.blocklyDraggable') as SVGGElement | null;
                      if (blockG) {
                        const clickedBlock = allBlocks.find(b => b.getSvgRoot() === blockG && !b.isShadow() && !b.isInsertionMarker());
                        if (clickedBlock) {
                          matchingBlocksSet.add(clickedBlock);
                          break;
                        }
                      }
                    }
                  } else {
                    // Drag Selection Box: Evaluate top-level user blocks (excluding internal shadow value blocks)
                    for (const b of allBlocks) {
                      if (b.isShadow() || b.isInsertionMarker()) continue;
                      const svg = b.getSvgRoot();
                      if (!svg) continue;
                      
                      const directPath = svg.querySelector(':scope > path.blocklyPath') || svg.querySelector('path.blocklyPath');
                      const pRect = directPath ? directPath.getBoundingClientRect() : svg.getBoundingClientRect();

                      // Calculate rectangular intersection
                      const interLeft = Math.max(selScreenLeft, pRect.left);
                      const interRight = Math.min(selScreenRight, pRect.right);
                      const interTop = Math.max(selScreenTop, pRect.top);
                      const interBottom = Math.min(selScreenBottom, pRect.bottom);

                      if (interRight > interLeft && interBottom > interTop) {
                        const interWidth = interRight - interLeft;
                        const interHeight = interBottom - interTop;
                        // Require at least 12px height and 20px width of overlap to avoid grazing adjacent blocks
                        if (interHeight >= 12 && interWidth >= 20) {
                          matchingBlocksSet.add(b);
                        }
                      }
                    }
                  }

                  const matchingBlocks = Array.from(matchingBlocksSet);

                  if (matchingBlocks.length > 0) {
                    // Highlight the explicitly selected user blocks
                    matchingBlocks.forEach(b => {
                      const svg = b.getSvgRoot();
                      if (svg) svg.classList.add('blockly-block-multiselected');
                    });

                    // Clear native single-selection so it does not conflict with multi-selection glow
                    const sel = Blockly.common?.getSelected ? (Blockly.common.getSelected() as any) : null;
                    if (sel && typeof sel.unselect === 'function') {
                      sel.unselect();
                    }

                    showToast(`Selected ${matchingBlocks.length} block${matchingBlocks.length > 1 ? 's' : ''}`);
                  } else {
                    // Left clicked or boxed empty space: clear everything!
                    const sel = Blockly.common?.getSelected ? (Blockly.common.getSelected() as any) : null;
                    if (sel && typeof sel.unselect === 'function') {
                      sel.unselect();
                    }
                    setShowClipboardToast(false);
                  }
                }}
              >
                {/* Visual Drag Selection Box */}
                {selectionBox?.isDragging && (
                  <div 
                    className="absolute border-2 border-yellow-400 bg-yellow-400/20 backdrop-blur-[1px] rounded-md pointer-events-none shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-none"
                    style={{
                      left: Math.min(selectionBox.startX, selectionBox.currentX),
                      top: Math.min(selectionBox.startY, selectionBox.currentY),
                      width: Math.abs(selectionBox.currentX - selectionBox.startX),
                      height: Math.abs(selectionBox.currentY - selectionBox.startY),
                    }}
                  />
                )}
              </div>
            )}

            {/* Custom Floating Toast Notification */}
            {showClipboardToast && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 bg-[#1e0a2d]/95 border border-[#ff912d]/60 text-white rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
                <Sparkles size={16} className="text-[#ff912d] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold">{clipboardToastMessage}</span>
                <button
                  onClick={() => setShowClipboardToast(false)}
                  className="p-1 text-gray-400 hover:text-white rounded transition-colors ml-1 shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Workspace Utility Controls (Bottom Right Floating Palette) */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-2.5">
              {/* Drag & Select Mode Toggle */}
              <button
                onClick={() => {
                  setIsSelectMode(prev => !prev);
                  setSelectionBox(null);
                  if (!isSelectMode) {
                    showToast("Drag & Select Active: Drag mouse across blocks to select a stack.");
                  }
                }}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95 ${
                  isSelectMode
                    ? 'bg-yellow-500/30 text-yellow-300 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                    : 'bg-[#1e0a2d]/90 hover:bg-white/10 border-white/15 text-gray-300 hover:text-white'
                }`}
                title={isSelectMode ? "Drag & Select Mode Active (Click to Exit)" : "Drag & Select Blocks"}
                aria-label="Drag and Select Blocks"
              >
                <BoxSelect size={18} />
              </button>

              {/* Reset View & Center */}
              <button
                onClick={() => {
                  if (workspace.current) {
                    const ws = workspace.current;
                    ws.setScale(1.0);
                    ws.scrollCenter();
                  }
                }}
                className="w-10 h-10 rounded-xl bg-[#1e0a2d]/90 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
                title="Reset View & Center"
                aria-label="Reset View & Center"
              >
                <Crosshair size={18} />
              </button>

              {/* Conjoined Zoom In & Zoom Out */}
              <div className="flex flex-col rounded-xl bg-[#1e0a2d]/90 border border-white/15 shadow-xl backdrop-blur-md overflow-hidden">
                <button
                  onClick={() => {
                    if (workspace.current) {
                      workspace.current.zoomCenter(1);
                    }
                  }}
                  className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-95"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <Plus size={18} />
                </button>
                <div className="w-full h-px bg-white/15" />
                <button
                  onClick={() => {
                    if (workspace.current) {
                      workspace.current.zoomCenter(-1);
                    }
                  }}
                  className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-95"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <Minus size={18} />
                </button>
              </div>

              {/* Clear / Reset Workspace or Delete Selected */}
              <button
                onClick={() => {
                  if (workspace.current) {
                    const multiselected = workspace.current.getAllBlocks(false).filter(b => {
                      const svg = b.getSvgRoot();
                      return svg && svg.classList.contains('blockly-block-multiselected');
                    });
                    const selected = Blockly.common?.getSelected ? (Blockly.common.getSelected() as any) : null;
                    
                    if (multiselected.length > 0) {
                      let count = 0;
                      multiselected.forEach(b => {
                        if (b.type !== 'event_start' && b.isDeletable()) {
                          b.dispose(true);
                          count++;
                        }
                      });
                      showToast(`Deleted ${count} selected block${count > 1 ? 's' : ''}`);
                    } else if (selected && typeof selected.dispose === 'function' && selected.type !== 'event_start' && selected.isDeletable()) {
                      selected.dispose(true);
                      showToast("Deleted selected block");
                    } else {
                      resetWorkspaceToDefaultStart(workspace.current);
                      setJsCode('');
                      setPlainEnglishCode('');
                      showToast("Reset workspace blocks");
                    }
                  }
                }}
                className="w-10 h-10 rounded-xl bg-[#1e0a2d]/90 hover:bg-red-500/20 border border-white/15 hover:border-red-500/40 text-gray-400 hover:text-red-400 flex items-center justify-center transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
                title="Delete Selected Blocks or Reset Workspace"
                aria-label="Delete Selected Blocks or Reset Workspace"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Context / Plain English Explanation View */}
          {viewMode === 'syntax' && (
            <div className="flex-1 min-h-0 w-full overflow-hidden bg-[#0e031a]">
              <PlainEnglishCodeViewer code={plainEnglishCode || jsCode} />
            </div>
          )}
        </div>

        {/* DRAGGABLE RESIZER HANDLE */}
        <div 
          onMouseDown={handleMouseDown}
          className="w-2.5 hover:w-3 bg-[#1e0a2d] hover:bg-[#ff912d] cursor-col-resize flex items-center justify-center transition-all z-20 shrink-0 border-x border-white/5 group shadow-xl"
          title="Drag to resize split panes"
        >
          <div className="w-1 h-8 rounded-full bg-white/20 group-hover:bg-black transition-colors" />
        </div>

        {/* RIGHT PANE: Grid Canvas Simulation View */}
        <div 
          className="h-full flex flex-col min-w-[300px] relative bg-[#0e0419] overflow-hidden"
          style={{ width: `${100 - splitPercent}%` }}
        >
          {/* Header Banner */}
          <div className="h-12 px-4 bg-[#160628] border-b border-white/10 flex items-center justify-start shrink-0">
            <div className="flex items-center gap-2.5">
              <Radio size={16} className="text-[#ff912d] animate-pulse" />
              <span className="font-mono text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                SIMULATION
              </span>
            </div>
          </div>

          {/* Viewport: 2D Conveyor Belt Sorting (Level 2) or 2D Matrix Grid (Level 1 & 3) */}
          {isLevel2 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden relative bg-[#0c0419] select-none">
              {/* Clean Dark Space Backdrop */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(88,28,135,0.15),_transparent_70%)]" />
              </div>

              {/* Top Minimal HUD: Level Target Manifest */}
              <div className="w-full flex items-start justify-start gap-3 z-20 shrink-0">
                {/* Section Level Manifest (Item icons alongside amounts, Total Items below) */}
                <div className="flex flex-col gap-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-mono shadow-md backdrop-blur-sm">
                  <div className="flex items-center gap-2.5 text-xs">
                    {levelManifest.cargo > 0 && (
                      <div className="flex items-center gap-1.5 text-blue-300" title="Total Cargo in Level">
                        <Package size={13} className="text-blue-400" />
                        <span className="font-bold text-white">{levelManifest.cargo}</span>
                      </div>
                    )}
                    {levelManifest.trash > 0 && (
                      <>
                        {levelManifest.cargo > 0 && <span className="text-white/20">|</span>}
                        <div className="flex items-center gap-1.5 text-rose-300" title="Total Space Junk in Level">
                          <Trash2 size={13} className="text-rose-400" />
                          <span className="font-bold text-white">{levelManifest.trash}</span>
                        </div>
                      </>
                    )}
                    {levelManifest.fuel > 0 && (
                      <>
                        <span className="text-white/20">|</span>
                        <div className="flex items-center gap-1.5 text-amber-300" title="Total Fuel in Level">
                          <Zap size={13} className="text-amber-400 fill-amber-400" />
                          <span className="font-bold text-white">{levelManifest.fuel}</span>
                        </div>
                      </>
                    )}
                    {levelManifest.food > 0 && (
                      <>
                        <span className="text-white/20">|</span>
                        <div className="flex items-center gap-1.5 text-emerald-300" title="Total Food in Level">
                          <Apple size={13} className="text-emerald-400" />
                          <span className="font-bold text-white">{levelManifest.food}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    Total Items: <span className="font-bold text-purple-300">{levelManifest.total}</span>
                  </div>
                </div>
              </div>

              {/* Simulation Workspace Wrapper */}
              <div className="w-full max-w-[620px] flex-1 flex flex-col items-center justify-center my-auto relative z-10">
                {/* Top Drop Zones (Cargo [Blue] in all sections, Fuel [Yellow] added in Section 3 & 4) */}
                <div className="z-20 mb-6 sm:mb-8 flex items-center justify-center gap-4 sm:gap-6 self-center mx-auto">
                  {/* Cargo Zone (Blue) */}
                  <div className={`w-40 sm:w-48 h-16 sm:h-18 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center gap-2.5 relative overflow-hidden select-none ${
                    activeAction === 'pack_cargo' || activeAction === 'pack'
                      ? 'bg-blue-500/25 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.6)] scale-105'
                      : 'bg-blue-950/20 border-blue-500/40 hover:border-blue-500/60'
                  }`}>
                    <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-blue-400/60" />
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-blue-400/60" />
                    <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-blue-400/60" />
                    <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-blue-400/60" />

                    <Package className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 ${activeAction === 'pack_cargo' || activeAction === 'pack' ? 'text-blue-300 animate-bounce' : 'text-blue-400'}`} />
                    <span className="font-mono font-black text-lg sm:text-xl tracking-wider uppercase text-blue-400 drop-shadow-sm">
                      CARGO BAY
                    </span>
                  </div>

                  {/* Rocket Ship Zone (Yellow) - Added in Section 3 & Section 4 */}
                  {currentSection >= 2 && (
                    <div className={`w-40 sm:w-48 h-16 sm:h-18 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center gap-2.5 relative overflow-hidden select-none ${
                      activeAction === 'route_fuel'
                        ? 'bg-amber-500/25 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)] scale-105'
                        : 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60'
                    }`}>
                      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-amber-400/60" />
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-amber-400/60" />
                      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-amber-400/60" />
                      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-amber-400/60" />

                      <Zap className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 ${activeAction === 'route_fuel' ? 'text-amber-300 animate-bounce' : 'text-amber-400 fill-amber-400'}`} />
                      <span className="font-mono font-black text-lg sm:text-xl tracking-wider uppercase text-amber-400 drop-shadow-sm">
                        FUEL BAY
                      </span>
                    </div>
                  )}
                </div>

                {/* Central Conveyor Track */}
                <div className="relative w-full h-32 sm:h-36 bg-[#130722] border-y-2 border-purple-500/40 rounded-xl flex items-center justify-center px-6 overflow-visible shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_4px_25px_rgba(168,85,247,0.15)]">
                  {/* Embedded Keyframes for Idle Float, Rolling Treads & Laser Scan */}
                  <style>{`
                    @keyframes idleConveyorBob {
                      0%, 100% { transform: translateY(0px); }
                      50% { transform: translateY(-6px); }
                    }
                    @keyframes rollingTreads {
                      0% { background-position: 0px 0; }
                      100% { background-position: -22px 0; }
                    }
                    @keyframes scanLaserSweep {
                      0% { top: 0%; opacity: 0.9; }
                      50% { top: 85%; opacity: 1; }
                      100% { top: 0%; opacity: 0.9; }
                    }
                    @keyframes scanPulseGlow {
                      0%, 100% { box-shadow: 0 0 10px rgba(6, 182, 212, 0.4), inset 0 0 8px rgba(6, 182, 212, 0.2); }
                      50% { box-shadow: 0 0 25px rgba(6, 182, 212, 0.9), inset 0 0 16px rgba(6, 182, 212, 0.5); }
                    }
                    .animate-idle-float {
                      animation: idleConveyorBob 2.5s ease-in-out infinite;
                    }
                    .animate-treads-running {
                      animation: rollingTreads 0.7s linear infinite;
                    }
                    .animate-treads-advancing {
                      animation: rollingTreads 0.25s linear infinite;
                    }
                    .animate-scan-glow {
                      animation: scanPulseGlow 0.8s ease-in-out infinite;
                    }
                  `}</style>

                  {/* Conveyor Tread Roller Lines */}
                  <div 
                    className={`absolute inset-x-0 inset-y-1.5 opacity-25 pointer-events-none overflow-hidden rounded-lg ${
                      isBeltAdvancing ? 'animate-treads-advancing' : isRunning ? 'animate-treads-running' : ''
                    }`}
                    style={{
                      backgroundImage: `repeating-linear-gradient(90deg, #c084fc 0, #c084fc 6px, transparent 6px, transparent 22px)`,
                      backgroundSize: '22px 100%'
                    }}
                  />

                  {/* Top & Bottom Industrial Hazard Rail Accents */}
                  <div 
                    className="absolute top-0 inset-x-0 h-1 opacity-70 pointer-events-none rounded-t-xl"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, #eab308, #eab308 6px, #18181b 6px, #18181b 12px)`
                    }}
                  />
                  <div 
                    className="absolute bottom-0 inset-x-0 h-1 opacity-70 pointer-events-none rounded-b-xl"
                    style={{
                      backgroundImage: `repeating-linear-gradient(45deg, #eab308, #eab308 6px, #18181b 6px, #18181b 12px)`
                    }}
                  />

                  {/* End Roller Caps */}
                  <div className="absolute left-1 inset-y-2 w-2 rounded-sm bg-purple-900/60 border border-purple-500/30 pointer-events-none" />
                  <div className="absolute right-1 inset-y-2 w-2 rounded-sm bg-purple-900/60 border border-purple-500/30 pointer-events-none" />

                  {/* Items Lined Up On Belt */}
                  {conveyorQueue.length > 0 ? (
                    <div className="relative z-20 flex items-center justify-center gap-3 sm:gap-4 w-full py-2 overflow-visible">
                      {/* Current / Front Item in Scanner Center */}
                      <div className="relative flex flex-col items-center shrink-0 w-15 sm:w-16">
                        {/* Scanner Reticle Frame Over Front Item */}
                        <div className={`absolute -inset-2.5 rounded-xl border pointer-events-none transition-all duration-300 overflow-hidden ${
                          isScanning || activeAction === 'scan' ? 'border-cyan-400 shadow-[0_0_20px_#06b6d4] bg-cyan-500/20 animate-scan-glow' :
                          activeAction === 'pack_cargo' || activeAction === 'pack' ? 'border-blue-400 shadow-[0_0_15px_#3b82f6]' :
                          activeAction === 'discard_trash' || activeAction === 'discard' ? 'border-rose-400 shadow-[0_0_15px_#f43f5e]' :
                          activeAction === 'route_fuel' ? 'border-amber-400 shadow-[0_0_15px_#f59e0b]' :
                          activeAction === 'route_food' ? 'border-emerald-400 shadow-[0_0_15px_#10b981]' :
                          'border-cyan-400/40 bg-cyan-950/20'
                        }`}>
                          {/* Corner Brackets */}
                          <div className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400" />
                          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400" />
                          <div className="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400" />
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400" />

                          {/* Laser Scanline Beam when Scanning */}
                          {(isScanning || activeAction === 'scan') && (
                            <div 
                              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_12px_#22d3ee] pointer-events-none z-20"
                              style={{
                                animation: 'scanLaserSweep 0.5s ease-in-out infinite'
                              }}
                            />
                          )}
                        </div>

                        {/* Floating Scanning Badge */}
                        {(isScanning || activeAction === 'scan') && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-400 text-cyan-300 text-[8px] font-mono font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.8)] whitespace-nowrap animate-pulse z-30 flex items-center gap-1">
                            <Scan size={10} className="text-cyan-400 animate-spin" />
                            <span>SCANNING...</span>
                          </div>
                        )}

                        {/* Floating Identified Confirmation Badge (Sections 2..4 after scanning) */}
                        {isCurrentItemScanned && currentSection > 0 && !animatingItem && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-[8px] font-mono font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.8)] whitespace-nowrap animate-pulse z-30 flex items-center gap-1">
                            <Sparkles size={10} className="text-emerald-400" />
                            <span>IDENTIFIED</span>
                          </div>
                        )}

                        {/* Phase 2: Independent Floating Animating Item Overlay (Overlaps Scanner Node) */}
                        {animatingItem && (
                          <div 
                            key={`animating-${animatingItem.item.id}`}
                            className={`absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none transition-all duration-600 ease-out ${
                              animatingItem.isFlying
                                ? animatingItem.destination === 'cargo'
                                  ? currentSection >= 2
                                    ? '-translate-y-28 scale-75 opacity-0'
                                    : 'translate-x-24 -translate-y-28 scale-75 opacity-0'
                                  : animatingItem.destination === 'fuel'
                                  ? 'translate-x-44 -translate-y-28 scale-75 opacity-0'
                                  : animatingItem.destination === 'trash'
                                  ? currentSection === 3
                                    ? 'translate-y-28 scale-75 opacity-0'
                                    : 'translate-x-24 translate-y-28 scale-75 opacity-0'
                                  : 'translate-x-44 translate-y-28 scale-75 opacity-0' // cafeteria / food
                                : 'translate-x-0 translate-y-0 scale-100 opacity-100'
                            }`}
                          >
                            <div 
                              className={`w-15 h-15 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center shadow-2xl border-2 relative overflow-hidden ${
                                animatingItem.item.type === 'cargo'
                                  ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-200 text-white shadow-[0_0_20px_rgba(37,99,235,0.9)]'
                                  : animatingItem.item.type === 'trash'
                                  ? 'bg-gradient-to-br from-rose-700 via-rose-800 to-zinc-900 border-rose-300 text-white shadow-[0_0_18px_rgba(244,63,94,0.9)]'
                                  : animatingItem.item.type === 'fuel'
                                  ? 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-200 text-white shadow-[0_0_20px_rgba(217,119,6,0.9)]'
                                  : 'bg-gradient-to-br from-emerald-500 to-emerald-700 border-emerald-200 text-white shadow-[0_0_20px_rgba(16,185,129,0.9)]'
                              }`}
                            >
                              {animatingItem.item.type === 'cargo' && <Package className="w-7 h-7 sm:w-8 sm:h-8 text-blue-100 drop-shadow-md" />}
                              {animatingItem.item.type === 'trash' && <Trash2 className="w-7 h-7 sm:w-8 sm:h-8 text-rose-100 drop-shadow-md" />}
                              {animatingItem.item.type === 'fuel' && <Rocket className="w-7 h-7 sm:w-8 sm:h-8 text-amber-100 drop-shadow-md" />}
                              {animatingItem.item.type === 'food' && <Apple className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-100 drop-shadow-md" />}
                              <span className="text-[9px] font-mono font-bold text-white uppercase mt-0.5 tracking-wider">
                                {animatingItem.item.type}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Phase 1: Front Item Card with Unique Key Stability */}
                        <div 
                          key={`conveyor-front-${conveyorQueue[0]?.id}`}
                          className={`w-15 h-15 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-300 z-10 relative overflow-hidden ${
                            animatingItem ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
                          } ${
                            !isRunning && !animatingItem ? 'animate-idle-float' : ''
                          } ${
                            !isCurrentItemScanned
                              ? 'bg-[#1a0b2e] border-2 border-purple-400/50 text-purple-300 shadow-[0_0_14px_rgba(168,85,247,0.35)]'
                              : conveyorQueue[0].type === 'cargo' 
                              ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-blue-300 text-white shadow-[0_0_18px_rgba(37,99,235,0.85)]' 
                              : conveyorQueue[0].type === 'trash' 
                              ? 'bg-gradient-to-br from-rose-700 via-rose-800 to-zinc-900 border-2 border-rose-300 text-white shadow-[0_0_16px_rgba(244,63,94,0.85)]' 
                              : conveyorQueue[0].type === 'fuel' 
                              ? 'bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-300 text-white shadow-[0_0_18px_rgba(217,119,6,0.85)]' 
                              : 'bg-gradient-to-br from-emerald-500 to-emerald-700 border-2 border-emerald-300 text-white shadow-[0_0_18px_rgba(16,185,129,0.85)]'
                          }`}
                        >
                          {!isCurrentItemScanned ? (
                            <>
                              <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 text-purple-300 animate-pulse" />
                              <span className="text-[9px] font-mono font-bold text-purple-300 uppercase mt-0.5 tracking-wider">UNKNOWN</span>
                            </>
                          ) : conveyorQueue[0].type === 'cargo' ? (
                            <>
                              <Package className="w-7 h-7 sm:w-8 sm:h-8 text-blue-100 drop-shadow" />
                              <span className="text-[9px] font-mono font-bold text-white uppercase mt-0.5 tracking-wider">CARGO</span>
                            </>
                          ) : conveyorQueue[0].type === 'trash' ? (
                            <>
                              <Trash2 className="w-7 h-7 sm:w-8 sm:h-8 text-rose-100 drop-shadow" />
                              <span className="text-[9px] font-mono font-bold text-rose-100 uppercase mt-0.5 tracking-wider">TRASH</span>
                            </>
                          ) : conveyorQueue[0].type === 'fuel' ? (
                            <>
                              <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-amber-100 fill-amber-300 drop-shadow" />
                              <span className="text-[9px] font-mono font-bold text-white uppercase mt-0.5 tracking-wider">FUEL</span>
                            </>
                          ) : (
                            <>
                              <Apple className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-100 drop-shadow" />
                              <span className="text-[9px] font-mono font-bold text-white uppercase mt-0.5 tracking-wider">FOOD</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Queue Items Sliding Track */}
                      <div 
                        className="flex items-center gap-2.5 sm:gap-3 overflow-visible py-2"
                        style={{
                          transform: isBeltAdvancing ? 'translateX(-64px)' : 'translateX(0px)',
                          transition: isBeltAdvancing ? 'transform 600ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
                        }}
                      >
                        {conveyorQueue.slice(1, 5).map((item, idx) => (
                          <div 
                            key={`conveyor-queue-${item.id}`} 
                            style={{ animationDelay: `${(idx + 1) * 200}ms` }}
                            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-lg flex flex-col items-center justify-center shrink-0 border-2 ${
                              !isRunning ? 'animate-idle-float' : ''
                            } bg-[#18092c]/90 border-purple-500/40 text-purple-300/80 shadow-[0_0_8px_rgba(168,85,247,0.2)]`}
                          >
                            <HelpCircle size={17} className="text-purple-300/70" />
                            <span className="text-[8px] font-mono font-bold text-purple-300/80 uppercase mt-0.5 tracking-wider">
                              UNKNOWN
                            </span>
                          </div>
                        ))}

                        {/* Incoming item fading and sliding into the rightmost visible queue slot */}
                        {isBeltAdvancing && conveyorQueue[5] && (
                          <div 
                            key={`conveyor-incoming-${conveyorQueue[5].id}`}
                            className="w-12 h-12 sm:w-13 sm:h-13 rounded-lg flex flex-col items-center justify-center shrink-0 border-2 bg-[#18092c]/90 border-purple-500/40 text-purple-300/80 shadow-[0_0_8px_rgba(168,85,247,0.2)] transition-all duration-500 opacity-100 scale-100"
                          >
                            <HelpCircle size={17} className="text-purple-300/70" />
                            <span className="text-[8px] font-mono font-bold text-purple-300/80 uppercase mt-0.5 tracking-wider">
                              UNKNOWN
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Fixed Stationary +N Overflow Badge (Only active when items exceed visible 5 slots) */}
                      {conveyorQueue.length > 5 && (
                        <div className="flex items-center shrink-0 ml-1">
                          <div className="px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold shrink-0 shadow-md flex items-center gap-1.5 bg-purple-950/90 border-purple-400/50 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                            <ChevronLeft size={12} className={`text-purple-400 shrink-0 ${isBeltAdvancing ? 'animate-ping' : 'animate-pulse'}`} />
                            <span>+{conveyorQueue.length - 5}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Prominent "ALL CLEAR" Sign */
                    <div className="z-20 flex flex-col items-center justify-center px-6 py-3 rounded-2xl bg-emerald-950/90 border-2 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.6)] animate-pulse mx-auto">
                      <div className="flex items-center gap-2 text-emerald-300 font-mono text-sm sm:text-base font-black tracking-wider uppercase">
                        <CheckCircle2 size={22} className="text-emerald-400" />
                        <span>ALL CLEAR!</span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-mono text-emerald-200/90 mt-0.5 font-semibold">
                        All items unloaded & sorted
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Drop Zones (Trash [Red] added in Section 2, Food [Green] added in Section 4) */}
                {currentSection >= 1 && (
                  <div className="z-20 mt-6 sm:mt-8 flex items-center justify-center gap-4 sm:gap-6 self-center mx-auto">
                    {/* Trash Zone (Red) */}
                    <div className={`w-40 sm:w-48 h-16 sm:h-18 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center gap-2.5 relative overflow-hidden select-none ${
                      activeAction === 'discard_trash' || activeAction === 'discard'
                        ? 'bg-rose-500/25 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.6)] scale-105'
                        : 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/60'
                    }`}>
                      <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-rose-400/60" />
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-rose-400/60" />
                      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-rose-400/60" />
                      <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-rose-400/60" />

                      <Trash2 className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 ${activeAction === 'discard_trash' || activeAction === 'discard' ? 'text-rose-300 animate-bounce' : 'text-rose-400'}`} />
                      <span className="font-mono font-black text-xl sm:text-2xl tracking-wider uppercase text-rose-400 drop-shadow-sm">
                        TRASH
                      </span>
                    </div>

                    {/* Food Zone (Green) - Added in Section 4 */}
                    {currentSection >= 3 && (
                      <div className={`w-40 sm:w-48 h-16 sm:h-18 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center gap-2.5 relative overflow-hidden select-none ${
                        activeAction === 'route_food'
                          ? 'bg-emerald-500/25 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.6)] scale-105'
                          : 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/60'
                      }`}>
                        <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-emerald-400/60" />
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-emerald-400/60" />
                        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-emerald-400/60" />
                        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-emerald-400/60" />

                        <Apple className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 ${activeAction === 'route_food' ? 'text-emerald-300 animate-bounce' : 'text-emerald-400'}`} />
                        <span className="font-mono font-black text-lg sm:text-xl tracking-wider uppercase text-emerald-400 drop-shadow-sm">
                          CAFETERIA
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Stored Cargo / Items Tally (Bottom-Left of Simulation) */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono shadow-md backdrop-blur-sm pointer-events-none">
                <div className="flex items-center gap-1.5 text-blue-300" title="Cargo Packed">
                  <Package size={13} className="text-blue-400" />
                  <span className="font-bold text-white">{conveyorInventory.cargo}</span>
                </div>
                {currentSection >= 1 && (
                  <>
                    <span className="text-white/20">|</span>
                    <div className="flex items-center gap-1.5 text-rose-300" title="Trash Discarded">
                      <Trash2 size={13} className="text-rose-400" />
                      <span className="font-bold text-white">{conveyorInventory.trash}</span>
                    </div>
                  </>
                )}
                {currentSection >= 2 && (
                  <>
                    <span className="text-white/20">|</span>
                    <div className="flex items-center gap-1.5 text-amber-300" title="Fuel Routed">
                      <Zap size={13} className="text-amber-400 fill-amber-400" />
                      <span className="font-bold text-white">{conveyorInventory.fuel}</span>
                    </div>
                  </>
                )}
                {currentSection >= 3 && (
                  <>
                    <span className="text-white/20">|</span>
                    <div className="flex items-center gap-1.5 text-emerald-300" title="Food Routed">
                      <Apple size={13} className="text-emerald-400" />
                      <span className="font-bold text-white">{conveyorInventory.food}</span>
                    </div>
                  </>
                )}
                {conveyorInventory.errors > 0 && (
                  <>
                    <span className="text-white/20">|</span>
                    <div className="flex items-center gap-1 text-rose-400 font-bold" title="Errors">
                      <AlertTriangle size={13} />
                      <span>{conveyorInventory.errors}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : isLevel3 && currentSection === 0 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex items-center justify-center p-1 sm:p-2 overflow-hidden relative">
              <OxygenMaze
                grid={activeGrid}
                playerState={charState}
                isBumping={isBumping}
                isFailed={tookDamage || isStartError}
                isSuccess={isGoal.current}
                failCoords={failCoords}
              />
            </div>
          ) : isLevel3 && currentSection === 1 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center p-1 sm:p-2 overflow-hidden relative">
              <FuelSynthesis
                ref={fuelSynthRef}
                isExternalRunning={isRunning}
                onComplete={(success, stats) => {
                  setIsRunning(false);
                  if (success) {
                    const topBlocks = workspace.current ? workspace.current.getTopBlocks(true) : [];
                    const startBlock = topBlocks.find(b => b.type === 'event_start');
                    const connectedBlocks = startBlock ? startBlock.getDescendants(false) : [];
                    const hasEndBlock = connectedBlocks.some(b => b.type === 'event_end');

                    if (hasEndBlock) {
                      recordSectionCompleted(currentSection);
                      markObjectiveComplete(1);
                      markObjectiveComplete(2);
                      markObjectiveComplete(3);
                      isGoal.current = true;
                      setShowPopup(true);

                      const bonusKey = `${missionId}_sec${currentSection}_bonus`;
                      let claimedList: string[] = [];
                      try {
                        claimedList = JSON.parse(localStorage.getItem('netstart_claimed_directives') || '[]');
                      } catch (e) {}

                      if (!isReplayMode && !claimedList.includes(bonusKey)) {
                        addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, `Section ${currentSection + 1} Cleared`);
                        claimedList.push(bonusKey);
                        try {
                          localStorage.setItem('netstart_claimed_directives', JSON.stringify(claimedList));
                        } catch (e) {}
                      }

                      if (currentSection === currentMissionSections.length - 1) {
                        try {
                          localStorage.removeItem('netstart_active_saved_level');
                          localStorage.removeItem('netstart_active_level');
                          if (missionId) {
                            const compKey = 'netstart_completed_missions';
                            const existing: string[] = JSON.parse(localStorage.getItem(compKey) || '[]');
                            if (!existing.includes(missionId)) {
                              existing.push(missionId);
                              localStorage.setItem(compKey, JSON.stringify(existing));
                            }
                            if (!localStorage.getItem('netstart_last_animated_planet_idx')) {
                              localStorage.setItem('netstart_last_animated_planet_idx', '0');
                            }
                            localStorage.setItem('netstart_planet_unlock_pending', 'true');
                          }
                        } catch (e) {}
                        const code = workspace.current ? javascriptGenerator.workspaceToCode(workspace.current) : '';
                        triggerMissionCompletion(code);
                      }
                    } else {
                      setIsWarningPulse(true);
                      if (endToastTimer.current) clearTimeout(endToastTimer.current);
                      setShowEndToast(true);
                      endToastTimer.current = setTimeout(() => setShowEndToast(false), 5500);
                    }
                  } else {
                    setErrorToastMessage(stats.errorReason || 'Fuel synthesis chamber explosion.');
                    setShowErrorToast(true);
                    if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
                    errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
                  }
                }}
              />
            </div>
          ) : isLevel3 && currentSection === 2 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center p-1 sm:p-2 overflow-hidden relative">
              <FlightSimulation
                ref={flightSimRef}
                destinationPlanet="/Planets/Mars.svg"
                isExternalRunning={isRunning}
                onComplete={(success, stats) => {
                  setIsRunning(false);
                  if (success) {
                    const topBlocks = workspace.current ? workspace.current.getTopBlocks(true) : [];
                    const startBlock = topBlocks.find(b => b.type === 'event_start');
                    const connectedBlocks = startBlock ? startBlock.getDescendants(false) : [];
                    const hasEndBlock = connectedBlocks.some(b => b.type === 'event_end');

                    if (hasEndBlock) {
                      recordSectionCompleted(currentSection);
                      if (stats.lasersFired > 0) {
                        markObjectiveComplete(1);
                      }
                      if ((stats.suppliesRetrieved || 0) > 0) {
                        markObjectiveComplete(2);
                      }
                      markObjectiveComplete(3);
                      isGoal.current = true;
                      setShowPopup(true);

                      const bonusKey = `${missionId}_sec${currentSection}_bonus`;
                      let claimedList: string[] = [];
                      try {
                        claimedList = JSON.parse(localStorage.getItem('netstart_claimed_directives') || '[]');
                      } catch (e) {}

                      if (!isReplayMode && !claimedList.includes(bonusKey)) {
                        addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, `Section ${currentSection + 1} Cleared`);
                        claimedList.push(bonusKey);
                        try {
                          localStorage.setItem('netstart_claimed_directives', JSON.stringify(claimedList));
                        } catch (e) {}
                      }

                      if (currentSection === currentMissionSections.length - 1) {
                        try {
                          localStorage.removeItem('netstart_active_saved_level');
                          localStorage.removeItem('netstart_active_level');
                          if (missionId) {
                            const compKey = 'netstart_completed_missions';
                            const existing: string[] = JSON.parse(localStorage.getItem(compKey) || '[]');
                            if (!existing.includes(missionId)) {
                              existing.push(missionId);
                              localStorage.setItem(compKey, JSON.stringify(existing));
                            }
                            if (!localStorage.getItem('netstart_last_animated_planet_idx')) {
                              localStorage.setItem('netstart_last_animated_planet_idx', '0');
                            }
                            localStorage.setItem('netstart_planet_unlock_pending', 'true');
                          }
                        } catch (e) {}
                        const code = workspace.current ? javascriptGenerator.workspaceToCode(workspace.current) : '';
                        triggerMissionCompletion(code);
                      }
                    } else {
                      setIsWarningPulse(true);
                      if (endToastTimer.current) clearTimeout(endToastTimer.current);
                      setShowEndToast(true);
                      endToastTimer.current = setTimeout(() => setShowEndToast(false), 5500);
                    }
                  } else {
                    setErrorToastMessage(stats.errorReason || 'Flight simulation failed.');
                    setShowErrorToast(true);
                    if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
                    errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 4500);
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
              <div 
                className="relative bg-[#1e0a2d] border-[3px] border-[#361d57] rounded-2xl overflow-hidden shadow-2xl shrink-0"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(${activeGrid[0]?.length || 8}, minmax(0, 1fr))`, 
                  gridTemplateRows: `repeat(${activeGrid.length || 8}, minmax(0, 1fr))`, 
                  gap: '3px',
                  padding: '6px',
                  backgroundColor: '#150524',
                  aspectRatio: `${activeGrid[0]?.length || 8} / ${activeGrid.length || 8}`,
                  width: '100%',
                  maxWidth: `min(100%, ${(activeGrid[0]?.length || 8) * 48 + ((activeGrid[0]?.length || 8) - 1) * 3 + 12}px)`,
                  maxHeight: `min(100%, ${(activeGrid.length || 8) * 48 + ((activeGrid.length || 8) - 1) * 3 + 12}px)`,
                }}
              >
                {activeGrid.map((row, y) => (
                  row.map((cell, x) => {
                    // Phase 1: 0 = Faint Wireframe Blueprint Void Tile
                    if (cell === 0) {
                      return (
                        <div 
                          key={`${x}-${y}`} 
                          className="w-full h-full border border-white/5 bg-transparent pointer-events-none rounded-md aspect-square"
                          style={{ 
                            gridColumn: `${x + 1} / span 1`,
                            gridRow: `${y + 1} / span 1`,
                          }} 
                        />
                      );
                    }

                    // Phase 2: Elevated Playable Track Styles
                    let cellColor = '#2D1B4E'; // 1 = Deep purple elevated path
                    let borderStyle = 'border border-purple-500/30 shadow-[inset_0_0_8px_rgba(168,85,247,0.2)]';

                    if (cell === 2) {
                      cellColor = 'rgba(127, 29, 29, 0.55)'; // 2 = Bomb Obstacle
                      borderStyle = 'border border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.35),inset_0_0_8px_rgba(239,68,68,0.2)]';
                    } else if (cell === 3) {
                      cellColor = 'rgba(113, 63, 18, 0.55)'; // 3 = Start (Yellow theme)
                      borderStyle = 'border border-yellow-500/60 shadow-[0_0_8px_rgba(234,179,8,0.3),inset_0_0_8px_rgba(234,179,8,0.2)]';
                    } else if (cell === 4 || cell === 8) {
                      cellColor = 'rgba(6, 78, 59, 0.55)'; // 4/8 = Goal / Ignition (Green theme)
                      borderStyle = 'border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.35),inset_0_0_8px_rgba(16,185,129,0.2)]';
                    } else if (cell === 5) {
                      cellColor = 'rgba(30, 58, 138, 0.65)'; // 5 = Fuel crate (Blue theme)
                      borderStyle = 'border border-blue-500/70 shadow-[0_0_10px_rgba(59,130,246,0.4),inset_0_0_8px_rgba(59,130,246,0.25)]';
                    } else if (cell === 6) {
                      cellColor = 'rgba(8, 51, 68, 0.65)'; // 6 = Oxygen tank (Cyan theme)
                      borderStyle = 'border border-cyan-400/70 shadow-[0_0_10px_rgba(6,182,212,0.4),inset_0_0_8px_rgba(6,182,212,0.25)]';
                    } else if (cell === 7) {
                      cellColor = 'rgba(55, 65, 81, 0.65)'; // 7 = Junk scrap (Gray theme)
                      borderStyle = 'border border-gray-400/50 shadow-[0_0_8px_rgba(156,163,175,0.3),inset_0_0_6px_rgba(156,163,175,0.2)]';
                    } else if (cell === 10 || cell === 13) {
                      cellColor = 'rgba(30, 58, 138, 0.7)'; // 10/13 = Blue Node
                      borderStyle = 'border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]';
                    } else if (cell === 11) {
                      cellColor = 'rgba(153, 27, 27, 0.7)'; // 11 = Red Blinking Trap
                      borderStyle = 'border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse';
                    } else if (cell === 12 || cell === 14) {
                      cellColor = 'rgba(6, 95, 70, 0.7)'; // 12/14 = Green Node
                      borderStyle = 'border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
                    } else if (cell >= 21 && cell <= 23) {
                      cellColor = 'rgba(88, 28, 135, 0.8)'; // 21..23 = Terminals
                      borderStyle = 'border border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]';
                    }

                    return (
                      <div 
                        key={`${x}-${y}`} 
                        className={`relative rounded-md flex items-center justify-center aspect-square ${borderStyle}`}
                        style={{ 
                          backgroundColor: cellColor,
                          gridColumn: `${x + 1} / span 1`,
                          gridRow: `${y + 1} / span 1`,
                        }} 
                      >
                        {/* 2 = Bomb obstacle */}
                        {cell === 2 && (
                          <div className="w-full h-full flex flex-col items-center justify-center p-[6%] animate-pulse">
                            <Bomb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 fill-red-400/30 drop-shadow-[0_0_5px_#ef4444]" />
                            <span className="text-[5.5px] sm:text-[6.5px] font-mono font-black text-red-400 uppercase tracking-widest leading-none mt-0.5">
                              BOMB
                            </span>
                          </div>
                        )}

                        {/* 4 or 8 = Goal beacon / Ignition */}
                        {(cell === 4 || cell === 8) && (
                          <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
                            <div className="relative flex items-center justify-center">
                              <div className="absolute w-4 h-4 rounded-full bg-emerald-500/30 animate-ping" />
                              <Flag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 fill-emerald-400 drop-shadow-[0_0_6px_#10b981]" />
                            </div>
                            <span className="text-[6px] sm:text-[7.5px] font-mono font-black text-emerald-400 uppercase tracking-widest leading-none">
                              {cell === 8 ? 'IGNITION' : 'GOAL'}
                            </span>
                          </div>
                        )}

                        {/* 3 = Start cell: Yellow theme + "Start" text */}
                        {cell === 3 && (
                          <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15]" />
                            <span className="text-[6px] sm:text-[7.5px] font-mono font-black text-yellow-400 uppercase tracking-widest leading-none">
                              START
                            </span>
                          </div>
                        )}

                        {/* 10 / 13 = Blue Dashboard Nodes */}
                        {(cell === 10 || cell === 13) && (
                          <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
                            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 fill-cyan-400/40 drop-shadow-[0_0_8px_#06b6d4]" />
                            <span className="text-[5px] sm:text-[6.5px] font-mono font-black text-cyan-300 uppercase tracking-widest leading-none">
                              {cell === 10 ? 'BLUE' : 'BLINK'}
                            </span>
                          </div>
                        )}

                        {/* 11 = Red Blinking Trap Node */}
                        {cell === 11 && (
                          <div className="flex flex-col items-center justify-center w-full h-full gap-0.5 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 drop-shadow-[0_0_8px_#ef4444]" />
                            <span className="text-[5px] sm:text-[6.5px] font-mono font-black text-red-400 uppercase tracking-widest leading-none">
                              TRAP
                            </span>
                          </div>
                        )}

                        {/* 12 / 14 = Green Dashboard Nodes */}
                        {(cell === 12 || cell === 14) && (
                          <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
                            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 fill-emerald-400/40 drop-shadow-[0_0_8px_#10b981]" />
                            <span className="text-[5px] sm:text-[6.5px] font-mono font-black text-emerald-300 uppercase tracking-widest leading-none">
                              {cell === 12 ? 'GREEN' : 'BLINK'}
                            </span>
                          </div>
                        )}

                        {/* 21..23 = Terminals */}
                        {cell >= 21 && cell <= 23 && (
                          <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
                            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300 drop-shadow-[0_0_8px_#c084fc]" />
                            <span className="text-[5px] sm:text-[6.5px] font-mono font-black text-purple-200 uppercase tracking-widest leading-none">
                              {cell === 21 ? 'TERM A' : cell === 22 ? 'TERM B' : 'TERM C'}
                            </span>
                          </div>
                        )}

                        {/* 5 = Fuel crate (Blue) */}
                        {cell === 5 && (
                          <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
                            <div className="relative flex items-center justify-center">
                              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 fill-blue-500/30 drop-shadow-[0_0_6px_#3b82f6]" />
                            </div>
                            <span className="text-[5.5px] sm:text-[7px] font-mono font-black text-blue-300 uppercase tracking-widest leading-none">
                              FUEL
                            </span>
                          </div>
                        )}

                        {/* 6 = Oxygen tank (Cyan) */}
                        {cell === 6 && (
                          <div className="flex flex-col items-center justify-center w-full h-full gap-0.5">
                            <div className="relative flex items-center justify-center">
                              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 fill-cyan-400/30 drop-shadow-[0_0_6px_#06b6d4]" />
                            </div>
                            <span className="text-[5.5px] sm:text-[7px] font-mono font-black text-cyan-300 uppercase tracking-widest leading-none">
                              OXYGEN
                            </span>
                          </div>
                        )}

                        {/* 7 = Junk scrap (Gray) */}
                        {cell === 7 && (
                          <div className="flex flex-col items-center justify-center w-full h-full gap-0.5 opacity-80">
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 drop-shadow-[0_0_4px_#9ca3af]" />
                            <span className="text-[5.5px] sm:text-[7px] font-mono font-bold text-gray-300 uppercase tracking-widest leading-none">
                              JUNK
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ))}

                {/* Directional Rover Probe (with Soft-Collision Bump & Consequence animation) */}
                <div 
                  className={`z-10 flex items-center justify-center pointer-events-none transition-all duration-400 ease-in-out ${
                    isBumping ? 'animate-rover-bump' : ''
                  } ${isStartError ? 'ring-2 ring-red-500 rounded-full shadow-[0_0_20px_#ef4444]' : ''} ${
                    isWarningPulse ? 'ring-4 ring-yellow-400 rounded-full animate-pulse shadow-[0_0_25px_#facc15]' : ''
                  }`}
                  style={{
                    gridColumn: `${charState.x + 1} / span 1`,
                    gridRow: `${charState.y + 1} / span 1`,
                  }}
                >
                  <div 
                    className="w-[78%] h-[78%] flex items-center justify-center transition-transform duration-400 ease-in-out drop-shadow-[0_0_10px_rgba(255,145,45,0.85)]"
                    style={{ transform: `rotate(${charState.direction * 90}deg)` }}
                  >
                    <svg viewBox="0 0 40 40" className="w-full h-full">
                      <polygon points="20,9 32,16 32,30 20,37 8,30 8,16"
                               fill="#ff912d" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
                      <polygon points="20,1 27,12 13,12"
                               fill="#fbbf24" stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
                      <circle cx="20" cy="7.5" r="2.5" fill="white" />
                      <rect x="1" y="19" width="7" height="8" rx="1.5"
                            fill="#3b82f6" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                      <rect x="32" y="19" width="7" height="8" rx="1.5"
                            fill="#3b82f6" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
                      <circle cx="20" cy="24" r="5"
                              fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                      <circle cx="20" cy="24" r="2.5" fill="rgba(120,210,255,0.75)" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simulation Status / Notification Banners (Above Control Bar) */}
          {showErrorToast && (
            <div className="mx-4 mb-3 p-3.5 bg-[#1e0a2d] border border-red-500/60 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200 shrink-0">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="text-red-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black text-red-300 font-sans leading-tight">
                    {isLevel3
                      ? currentSection === 2
                        ? "Flight Simulation Alert"
                        : currentSection === 1
                        ? "Fuel Synthesis Alert"
                        : "Life Support Alert"
                      : isLevel2
                      ? "Cargo Bay Alert"
                      : "Navigation Alert"}
                  </p>
                  <p className="text-xs text-gray-300 font-sans mt-0.5 leading-snug">
                    {errorToastMessage}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowErrorToast(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Simulation Status / Notification Banners (Above Control Bar) */}
          {showEndToast && (
            <div className="mx-4 mb-3 p-4 bg-[#1e0a2d] border border-amber-500/60 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3.5 animate-in slide-in-from-bottom-2 duration-200 shrink-0">
              <div className="flex items-center gap-3.5">
                <AlertCircle size={28} className="text-yellow-400 shrink-0" />
                <div className="text-left">
                  <p className="text-base sm:text-lg font-black text-yellow-400 font-sans leading-tight">Wait a second!</p>
                  <p className="text-sm text-gray-200 font-sans mt-1 leading-snug">
                    {isLevel2
                      ? "You sorted all items, but forgot to attach the End block to complete your sequence."
                      : "You reached the goal, but forgot to end the sequence."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEndToast(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {showStartToast && (
            <div className="mx-4 mb-3 p-3.5 bg-[#1e0a2d] border border-yellow-500/60 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200 shrink-0">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} className="text-yellow-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black text-yellow-300 font-sans leading-tight">Start Block Required</p>
                  <p className="text-xs text-gray-300 font-sans mt-0.5 leading-snug">
                    Attach a Start block at the beginning of your sequence to initialize simulation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStartToast(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {showOverloadToast && (
            <div className="mx-4 mb-3 p-3.5 bg-[#1e0a2d] border border-amber-500/60 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200 shrink-0">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="text-amber-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black text-amber-300 font-sans leading-tight">System Overload</p>
                  <p className="text-xs text-gray-300 font-sans mt-0.5 leading-snug">
                    The sequence ran too long. Try optimizing your logic with loops.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOverloadToast(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Control Bar */}
          <div className="p-4 bg-[#140624] border-t border-white/10 flex items-center justify-start gap-3 shrink-0">
            <button
              onClick={runCode}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer ${
                isRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 hover:scale-105 animate-pulse'
                  : 'bg-gradient-to-r from-[#ff912d] to-amber-500 hover:from-amber-500 hover:to-[#ff912d] text-black shadow-[#ff912d]/25 hover:scale-105'
              }`}
            >
              {isRunning ? (
                <>
                  <Square size={16} className="fill-current text-white" />
                  <span>Stop Simulation</span>
                </>
              ) : (
                <>
                  <Play size={16} className="fill-black" />
                  <span>Run Simulation</span>
                </>
              )}
            </button>

            <button
              onClick={resetGame}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-md"
              title="Reset Rover Position"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Bomb / Safety Damage Flash Overlay */}
      {tookDamage && (
        <div className="fixed inset-0 bg-red-500/40 z-[9990] animate-pulse pointer-events-none" />
      )}

      {/* Victory / Section Cleared Modal */}
      {/* Victory / Section Cleared Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#19082a] border border-[#ff912d]/40 rounded-[28px] p-6 sm:p-7 max-w-4xl w-full shadow-2xl relative flex flex-col gap-5 text-center">
            
            {/* Top Header Bar */}
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3.5 text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ff912d]/15 border border-[#ff912d]/30 text-[#ff912d] flex items-center justify-center shadow-inner shrink-0">
                  <Rocket size={24} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <Sparkles size={11} className="text-amber-400" /> Great job!
                  </div>
                  <h2 className="text-lg sm:text-2xl font-display font-black text-white uppercase tracking-wide leading-tight">
                    {currentSection < currentMissionSections.length - 1
                      ? `Section ${currentSection + 1} Cleared!`
                      : `${displayTitle} Cleared!`}
                  </h2>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-gray-400 hidden sm:inline-block whitespace-nowrap">
                Section {currentSection + 1} of {currentMissionSections.length}
              </span>
            </div>

            {/* 2-Section Split Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left items-stretch">
              
              {/* Left Column: Directives Breakdown & Total XP */}
              <div className="flex flex-col gap-3.5 justify-between">
                {/* Individual Section Goals Breakdown */}
                <div className="bg-[#120520]/90 border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5 shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                      Goal Directives
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-emerald-400">
                      {completedCount}/{totalCount} Achieved
                    </span>
                  </div>

                  {/* 3 Section Goals with Checkmarks and XP values */}
                  <div className="flex flex-col gap-2">
                    {objectives.map((obj) => (
                      <div key={obj.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {obj.completed ? (
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                          ) : (
                            <Circle size={16} className="text-gray-500 shrink-0" />
                          )}
                          <span className={`text-xs font-sans truncate ${obj.completed ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
                            {obj.text}
                          </span>
                        </div>
                        <span className={`text-xs font-mono font-bold shrink-0 whitespace-nowrap ${obj.completed ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {obj.completed ? `+${XP_REWARDS.CAMPAIGN_GOAL} XP` : '+0 XP'}
                        </span>
                      </div>
                    ))}

                    {/* Section Clear Bonus Item */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Zap size={16} className="text-amber-400 shrink-0" />
                        <span className="text-xs font-sans text-gray-200 font-medium truncate">
                          Section Clear Bonus
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400 shrink-0 whitespace-nowrap">
                        +{XP_REWARDS.SECTION_COMPLETION_BONUS} XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dedicated Purple Tab for Mission Gears Reward (Final Section) */}
                {currentSection === currentMissionSections.length - 1 && (
                  <div className="bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-purple-950/60 border border-purple-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0 shadow-inner">
                        <Settings size={16} className="text-purple-300" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-widest whitespace-nowrap">
                          Mission Gear Reward
                        </span>
                        <span className="text-xs text-gray-400 font-sans whitespace-nowrap">Campaign Bonus</span>
                      </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-display font-black text-purple-300 tracking-tight drop-shadow-[0_0_12px_rgba(192,132,252,0.6)] flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                      <span>+20 Gears</span>
                    </div>
                  </div>
                )}

                {/* Glowing Large Total XP Display */}
                <div className="bg-gradient-to-r from-emerald-950/60 via-emerald-900/40 to-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_24px_rgba(16,185,129,0.2)]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest whitespace-nowrap">
                      Total Earned XP
                    </span>
                    <span className="text-xs text-gray-400 font-sans whitespace-nowrap">Progression Reward</span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400 tracking-tight drop-shadow-[0_0_16px_rgba(52,211,153,0.7)] animate-pulse flex items-center gap-1.5 whitespace-nowrap">
                    <Zap size={22} className="fill-emerald-400 text-emerald-400 shrink-0" />
                    <span>+{currentSectionXp} XP</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Code Explanation & Next Actions */}
              <div className="flex flex-col gap-3.5 justify-between">
                {/* Code Explanation View */}
                <div className="bg-black/60 rounded-2xl border border-white/10 p-4 flex flex-col gap-2 h-full min-h-[160px] shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                      Code Explanation & Sequence
                    </span>
                    <span className="text-[10px] font-mono text-[#ff912d] bg-[#ff912d]/10 px-2 py-0.5 rounded-md border border-[#ff912d]/20">
                      Logic
                    </span>
                  </div>
                  <div className="overflow-auto max-h-[150px] font-mono text-xs text-[#ff912d] leading-relaxed pr-1">
                    <pre className="whitespace-pre-wrap"><code>{plainEnglishCode || jsCode}</code></pre>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  {currentSection < currentMissionSections.length - 1 ? (
                    <button 
                      onClick={() => {
                        loadSection(currentSection + 1);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff912d] to-amber-500 hover:from-amber-500 hover:to-[#ff912d] text-black font-sans font-black py-3.5 px-5 rounded-xl shadow-lg shadow-[#ff912d]/20 active:scale-95 transition-all cursor-pointer text-xs uppercase tracking-wider"
                    >
                      Next Section <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setShowPopup(false);
                        router.push('/modules');
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff912d] to-amber-500 hover:from-amber-500 hover:to-[#ff912d] text-black font-sans font-black py-3.5 px-5 rounded-xl shadow-lg shadow-[#ff912d]/20 active:scale-95 transition-all cursor-pointer text-xs uppercase tracking-wider"
                    >
                      Continue to Missions Page <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}



      {/* Game Pause Modal (Three-Line Button) */}
      {isPaused && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a0f28] border border-purple-500/20 rounded-[28px] p-6 sm:p-8 max-w-sm w-full shadow-2xl relative flex flex-col gap-6 text-center">
            {/* Golden Squircle Pause Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#452b06] border border-yellow-500/40 text-yellow-400 flex items-center justify-center mx-auto shadow-inner">
              <Pause size={28} className="fill-yellow-400 stroke-yellow-400" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-wider">
                GAME PAUSED
              </h3>
              <p className="text-xs sm:text-sm font-sans font-bold text-[#ff912d] tracking-wider uppercase">
                {levelSubtitle}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#ff912d] hover:bg-orange-400 text-black font-sans font-black text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Play size={16} className="fill-black stroke-black" />
                RESUME
              </button>

              <button
                onClick={() => setShowRestartConfirm(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#24133b] hover:bg-[#2e194c] border border-purple-500/30 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                RESTART
              </button>

              <button
                onClick={() => {
                  setIsPaused(false);
                  requestNavigation('/modules');
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#24133b] hover:bg-[#2e194c] border border-purple-500/30 text-white font-sans font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                EXIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restart Level Confirmation Modal (No Icon, Save & Exit Styling) */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#1a082c]/95 border-2 border-[#ff912d]/50 rounded-[32px] p-8 sm:p-10 max-w-lg w-full shadow-[0_0_60px_rgba(255,145,45,0.25)] flex flex-col items-center text-center relative overflow-hidden">
            {/* Top Close Button */}
            <button
              onClick={() => setShowRestartConfirm(false)}
              className="absolute top-5 right-5 text-white/50 hover:text-white transition-all p-2 rounded-full hover:bg-white/10 cursor-pointer"
              title="Cancel"
            >
              <X size={20} />
            </button>

            {/* Title & Body (No Icon) */}
            <h3 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-wider mb-3">
              LEVEL RESTART
            </h3>
            <p className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed mb-8">
              Restarting will reset your progress. Do you wish to proceed?
            </p>

            {/* Actions */}
            <div className="w-full flex items-center gap-4">
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="flex-1 py-3.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRestartConfirm(false);
                  restartEntireLevel();
                }}
                className="flex-1 py-3.5 px-5 rounded-xl bg-[#ff912d] hover:bg-orange-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#ff912d]/25 active:scale-95 cursor-pointer flex items-center justify-center"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
