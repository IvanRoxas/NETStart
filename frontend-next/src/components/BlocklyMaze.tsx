"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { javascriptGenerator } from 'blockly/javascript';
import '@/lib/customblocks';
import { patchBlocklyFocus } from '@/lib/patchBlocklyFocus';
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
  ChevronUp,
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
  ChevronLeft,
  Undo2,
  Minimize2,
  Maximize2,
  Droplets,
  Code2,
  Terminal,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useProgression } from '@/context/ProgressionContext';
import { getUserStorageItem, setUserStorageItem, removeUserStorageItem } from '@/lib/userStorage';
import { XP_REWARDS } from '@/lib/leveling';
import { isDemoModeActive } from '@/lib/demoMode';
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
import {
  registerHtmlBlocks,
  parseWorkspaceHtml,
  MARS_CAMPAIGN_PRESETS,
  setActiveMarsCampaign,
  getActiveMarsCampaign,
  type MarsCampaignPreset,
  type ParsedHtmlElement,
  type MarsValidationResult
} from '@/lib/mars/htmlBlocklyDefinitions';
import MartianBillboard from '@/components/mars/MartianBillboard';
import MarsSyntaxTab from '@/components/mars/MarsSyntaxTab';
import MarkDialogueModal from '@/components/mars/MarkDialogueModal';
import {
  registerMarsLevel2Blocks,
  parseMarsLevel2Workspace,
  getMarsLevel2Toolbox,
  MARS_LEVEL_2_DEFAULT_STARTER_XML,
  type MarsLevel2Validation,
  type ParsedImageContainer,
} from '@/lib/mars/marsLevel2Definitions';
import MarsImageBillboards from '@/components/mars/MarsImageBillboards';
import {
  registerMarsLevel3Blocks,
  parseMarsLevel3Workspace,
  MARS_LEVEL_3_TOOLBOX,
  MARS_LEVEL_3_STARTER_XML,
  type MarsLevel3Validation,
} from '@/lib/mars/marsLevel3Definitions';
import MarsLevel3 from '@/components/mars/level3/MarsLevel3';
import {
  registerVenusLevel1Blocks,
  parseVenusLevel1Workspace,
  VENUS_LEVEL_1_TOOLBOX,
  getVenusLevel1Toolbox,
  INITIAL_VENUS_LEVEL_1_VALIDATION,
  type VenusLevel1Validation,
} from '@/lib/venus/venusLevel1Definitions';
import VenusLevel1Lab from '@/components/venus/level1/VenusLevel1Lab';
import {
  registerVenusLevel2Blocks,
  getVenusLevel2Toolbox,
  parseVenusLevel2Workspace,
  generateVenusLevel2FullCss,
  INITIAL_VENUS_LEVEL_2_VALIDATION,
  type VenusLevel2Validation,
} from '@/lib/venus/venusLevel2Definitions';
import VenusLevel2Lab from '@/components/venus/level2/VenusLevel2Lab';
import VenusLevel3 from '@/components/venus/level3/VenusLevel3';
import {
  type Venus3SectorId,
  type Venus3TabId,
  type Venus3ParsedStyles,
  VENUS_3_TABS,
  VENUS_SECTOR_PALETTES,
  FieldColorWheel,
  registerVenusLevel3Blocks,
  getVenusLevel3Toolbox,
  parseVenusLevel3Workspace,
  isBlockAllowedInTab,
} from '@/lib/venus/venusLevel3Definitions';
import SyntaxViewer, { getSyntaxExplanation, type SyntaxExplanation } from '@/components/SyntaxViewer';
import {
  registerMercuryLevel1Blocks,
  getMercuryLevel1Toolbox,
  parseMercuryLevel1Workspace,
  INITIAL_MERCURY_LEVEL_1_VALIDATION,
  type MercuryLevel1Validation,
} from '@/lib/mercury/mercuryLevel1Definitions';
import MercuryLevel1Biodome from '@/components/mercury/level1/MercuryLevel1Biodome';
import {
  registerMercuryLevel2Blocks,
  getMercuryLevel2Toolbox,
  parseMercuryLevel2Workspace,
  INITIAL_MERCURY_LEVEL_2_VALIDATION,
  type MercuryLevel2Validation,
} from '@/lib/mercury/mercuryLevel2Definitions';
import MercuryLevel2Conveyor from '@/components/mercury/level2/MercuryLevel2Conveyor';
import {
  registerJupiterLevel1Blocks,
  getJupiterLevel1Toolbox,
  getJupiterLevel1DefaultWorkspaceXml,
  parseJupiterLevel1Workspace,
  INITIAL_JUPITER_LEVEL_1_VALIDATION,
  type JupiterLevel1Validation,
} from '@/lib/jupiter/jupiterLevel1Definitions';
import JupiterLevel1Simulation from '@/components/jupiter/level1/JupiterLevel1Simulation';
import {
  registerJupiterLevel2Blocks,
  getJupiterLevel2Toolbox,
  parseJupiterLevel2Workspace,
  INITIAL_JUPITER_2_VALIDATION,
  type Jupiter2ValidationResult,
  type Jupiter2Wave,
  JUPITER_2_SECTIONS,
} from '@/lib/jupiter/jupiterLevel2Definitions';
import JupiterLevel2Simulation from '@/components/jupiter/level2/JupiterLevel2Simulation';
import {
  registerJupiterLevel3Blocks,
  getJupiterLevel3Toolbox,
  parseJupiterLevel3Workspace,
  INITIAL_PLAYER_BLUEPRINT,
  JUPITER_LEVEL_3_STARTER_XML,
  JUPITER_3_SECTIONS,
  type PlayerBlueprint,
} from '@/lib/jupiter/jupiterLevel3Definitions';
import JupiterLevel3Simulation from '@/components/jupiter/level3/JupiterLevel3Simulation';
import {
  registerSaturnLevel1Blocks,
  getSaturnLevel1Toolbox,
  getSaturnLevel1DefaultWorkspaceXml,
  parseSaturnLevel1Workspace,
  INITIAL_SATURN_LEVEL_1_VALIDATION,
  INITIAL_SATURN_WORKSPACE,
  type SaturnValidationResult,
  type SaturnWorkspaceState,
  generateSaturnCppCode,
  SATURN_LEVEL_1_WAVES,
} from '@/lib/saturn/saturnLevel1Definitions';
import SaturnLevel1Simulation from '@/components/saturn/level1/SaturnLevel1Simulation';
import {
  registerSaturnLevel2Blocks,
  getSaturnLevel2Toolbox,
  getSaturnLevel2DefaultWorkspaceXml,
  parseSaturnLevel2Workspace,
  INITIAL_SATURN_2_VALIDATION,
  type Saturn2ValidationResult,
  SATURN_2_SECTIONS,
} from '@/lib/saturn/saturnLevel2Definitions';
import SaturnLevel2Simulation from '@/components/saturn/level2/SaturnLevel2Simulation';
import {
  registerSaturnLevel3Blocks,
  getSaturnLevel3Toolbox,
  parseSaturnLevel3Workspace,
  SATURN_LEVEL_3_STARTER_XML,
  SATURN_3_SECTIONS,
  INITIAL_SATURN_3_PAYLOAD,
  type Saturn3WorkspacePayload,
} from '@/lib/saturn/saturnLevel3Definitions';
import SaturnLevel3Simulation from '@/components/saturn/level3/SaturnLevel3Simulation';
import {
  registerEarthLevel1Blocks,
  getEarthLevel1Toolbox,
  parseEarthLevel1Workspace,
  INITIAL_EARTH_1_VALIDATION,
  INITIAL_EARTH_1_WORKSPACE,
  type Earth1ValidationResult,
  type Earth1WorkspaceState,
  generateEarthPythonCode,
  EARTH_1_SECTIONS,
  getEarthLevel1DefaultWorkspaceXml,
} from '@/lib/earth/earthLevel1Definitions';
import EarthLevel1Lab from '@/components/earth/level1/EarthLevel1Lab';
import {
  registerEarthLevel2Blocks,
  parseEarth2Tab1Workspace,
  parseEarth2Tab2Workspace,
  parseEarth2Section1Workspace,
  parseEarth2Section2Workspace,
  getEarthLevel2Toolbox,
  EARTH_2_SECTIONS,
  INITIAL_EARTH_2_TAB1_VALIDATION,
  INITIAL_EARTH_2_TAB2_VALIDATION,
  type Earth2Tab1Validation,
  type Earth2Tab2Validation,
} from '@/lib/earth/earthLevel2Definitions';
import EarthLevel2Simulation from '@/components/earth/level2/EarthLevel2Simulation';
import {
  registerEarthLevel3Blocks,
  getEarthLevel3Toolbox,
  auditEarth3Workspace,
  EARTH_3_SECTIONS,
  INITIAL_EARTH_3_AUDIT,
  type Earth3AuditStatus,
} from '@/lib/earth/earthLevel3Definitions';
import EarthLevel3Simulation from '@/components/earth/level3/EarthLevel3Simulation';
import {
  registerMercuryLevel3Blocks,
  getMercury3HtmlToolbox,
  getMercury3CssToolbox,
  getMercury3JsToolbox,
  compileMercury3Html,
  compileMercury3Css,
  compileMercury3Js,
  isMercury3BlockAllowedInTab,
  auditMercury3Workspace,
  MERCURY_3_SECTIONS,
  MERCURY_3_TABS,
  type Mercury3TabId,
  type Mercury3WorkspaceStates,
  type Mercury3AuditStatus,
  INITIAL_MERCURY_3_WORKSPACES,
  INITIAL_MERCURY_3_AUDIT,
} from '@/lib/mercury/mercuryLevel3Definitions';
import MercuryLevel3Simulation from '@/components/mercury/level3/MercuryLevel3Simulation';


// Defensive Polyfill for Blockly connection previewer & insertion marker highlighting on detached SVG roots
if (typeof window !== 'undefined') {
  const getElemByIdFallback = function (this: Element | DocumentFragment | SVGElement, id: string) {
    try {
      if (this.querySelector) {
        const found = this.querySelector(`[id="${id}"]`);
        if (found) return found;
      }
    } catch (e) { }
    return document.getElementById(id);
  };

  if (typeof Element !== 'undefined' && !(Element.prototype as any).getElementById) {
    (Element.prototype as any).getElementById = getElemByIdFallback;
  }
  if (typeof DocumentFragment !== 'undefined' && !(DocumentFragment.prototype as any).getElementById) {
    (DocumentFragment.prototype as any).getElementById = getElemByIdFallback;
  }
  if (typeof SVGElement !== 'undefined' && !(SVGElement.prototype as any).getElementById) {
    (SVGElement.prototype as any).getElementById = getElemByIdFallback;
  }
}

Blockly.setLocale(En as any);
registerHtmlBlocks();
registerVenusLevel1Blocks();
registerVenusLevel2Blocks();
registerMercuryLevel3Blocks();

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

// 3 Sections for Level 1 (Moon: Level 1 - Level 1: Stellar Beginnings)
// Tile Legend: 0 = Invisible/Unplayable Void, 1 = Playable Tile, 2 = Bomb, 3 = Start, 4 = Goal
export const LEVEL_1_SECTIONS: LevelSection[] = [
  // Section 1: Intro corridor teaching basic linear sequencing
  {
    sectionIndex: 0,
    name: "Section 1",
    subtag: "Section 1 of 3",
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
    subtag: "Section 2 of 3",
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
    subtag: "Section 3 of 3",
    desc: "Navigate the switchback ridge by combining three different movement directions.",
    tip: "Hint: You will need to move Right, Down, and Left to stay on track!",
    initialState: { x: 2, y: 1, direction: 1 }, // Start at (2,1) facing East
    maze: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 1, 1, 0, 0], // Start (2,1) -> (3,1) -> (4,1) (2 Right)
      [0, 0, 0, 0, 1, 0, 0], // Down to (4,2) (1 Down)
      [0, 0, 1, 1, 1, 0, 0], // Down to (4,3) -> Left to (3,3) -> Left to (2,3) (1 Down, 2 Left)
      [0, 0, 1, 0, 0, 0, 0], // Down to (2,4) (1 Down)
      [0, 0, 1, 1, 4, 0, 0], // Down to (2,5) -> Right to (3,5) -> Goal (4,5) (1 Down, 2 Right)
      [0, 0, 0, 0, 0, 0, 0],
    ],
    objectives: [
      { id: 1, text: "Use both the Start and End blocks", completed: false, isClaimed: false },
      { id: 2, text: "Use 3 different movement directions", completed: false, isClaimed: false },
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
    tip: "Hint: Steer clear of the broken fans to keep air flowing to the cabin.",
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
  // Section 2: Fuel Synthesis (5-Step Chemical Synthesis Protocol)
  {
    sectionIndex: 1,
    name: "Fuel Synthesis",
    subtag: "Section 2 of 3",
    desc: "Synthesize 3 batches of fuel: Add solution, increase heat, mix 5 times, refine green fuel to orange, and fuel the spaceship.",
    tip: "Hint: Follow the synthesis steps carefully to prepare each batch of fuel.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Use both Start and End blocks", completed: false, isClaimed: false },
      { id: 2, text: "Use If condition to check if color is green", completed: false, isClaimed: false },
      { id: 3, text: "Synthesize and fuel all 3 batches", completed: false, isClaimed: false }
    ]
  },
  // Section 3: Flight Simulation (Emergency Reactions & Friendly UFOs)
  {
    sectionIndex: 2,
    name: "Flight Simulation",
    subtag: "Section 3 of 3",
    desc: "Keep the spaceship safe for 60 seconds! Program event responses with Cases and greet friendly UFOs.",
    tip: "Hint: Keep an eye on incoming alerts and react quickly to any hazard.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Destroy all small asteroids with lasers", completed: false, isClaimed: false },
      { id: 2, text: "Greet all friendly UFOs", completed: false, isClaimed: false },
      { id: 3, text: "Survive the 60-second flight", completed: false, isClaimed: false }
    ]
  }
];

// Unified Single Section for Mars Level 1 (Mars: Level 1 - The Blank Billboard)
export const MARS_1_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: "The Blank Billboard",
    subtag: "Level 1: Text & Structure",
    desc: "Help Director Mark build a fun space billboard for the colony. Pick a theme, add your title and text, and style your words to get a 5-star review.",
    tip: "Hint: Pick a theme and style your billboard to catch the colony's eye.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Assemble Title, Subtitle, and Text matching your theme", completed: false, isClaimed: false },
      { id: 2, text: "Style your billboard with Creative Kit modifiers", completed: false, isClaimed: false },
      { id: 3, text: "Score a perfect 5/5 rating from Director Mark", completed: false, isClaimed: false }
    ]
  }
];

// Unified Single Section for Mars Level 2 (Mars: Level 2 - Picture Perfect)
export const MARS_2_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: "Picture Perfect",
    subtag: "Level 2: Images & Captions",
    desc: "Emma and Penny's screens show boring placeholder boxes. Read the little clues, find the matching pictures from your toolbox, and link them up to brighten their day.",
    tip: "Hint: Read the billboard clues to find the picture that matches best.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Add custom Captions to at least 2 billboards", completed: false, isClaimed: false },
      { id: 2, text: "Place images inside all 5 billboard containers", completed: false, isClaimed: false },
      { id: 3, text: "Correctly link all 5 billboard image sources (src)", completed: false, isClaimed: false }
    ]
  }
];

// Unified Single Section for Mars Level 3 (Mars: Level 3 - The Transmission Dashboard)
export const MARS_3_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: "The Transmission Form",
    subtag: "Level 3: Forms & Inputs",
    desc: "Say hello to your space neighbors. Assemble text boxes and buttons to build a friendly message form and reach out to Mercury and Venus.",
    tip: "Hint: Organize your form so neighbors can easily read and send messages.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Give your form design a title.", completed: false, isClaimed: false },
      { id: 2, text: "Open and read an incoming transmission from space.", completed: false, isClaimed: false },
      { id: 3, text: "Send a message to both Mercury and Venus.", completed: false, isClaimed: false }
    ]
  }
];

// Unified Single Section for Venus Level 1 (Level 1: Color It In)
export const VENUS_1_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: "Color It In",
    subtag: "Level 1: Basic CSS & Colors",
    desc: "Professor Spectrum's lab lost all its colors. Drop in some furniture, splash your favorite colors and borders, and style the banner to make the room feel lively again.",
    tip: "Hint: Use colors and borders to make each piece of equipment stand out.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Spawn & style at least 3 lab items", completed: false, isClaimed: false },
      { id: 2, text: "Apply custom border styling to any item", completed: false, isClaimed: false },
      { id: 3, text: "Add and customize the #caption banner", completed: false, isClaimed: false }
    ]
  }
];

// Unified Single Section for Venus Level 2 (Level 2: Formatting the Prototype)
export const VENUS_2_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: "Formatting the Prototype",
    subtag: "Level 2: Layout & Alignment",
    desc: "We have the pieces, but the layout is a mess! We must align them properly so the structure holds before we can plug it into the planet's main machinery.",
    tip: "Hint: Check the blueprints to see how each screen should be aligned.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Use Target Screen and Format blocks", completed: false, isClaimed: false },
      { id: 2, text: "Use Horizontal and Vertical blocks", completed: false, isClaimed: false },
      { id: 3, text: "Calibrate all 5 prototype screens", completed: false, isClaimed: false }
    ]
  }
];

// Unified Single Section for Venus Level 3 (Level 3: Restoring the Dead Zones)
export const VENUS_3_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: "Restoring the Dead Zones",
    subtag: "Level 3: CSS Linking & Astrolink",
    desc: "Restore color to all 3 planetary dead zones (Alpha, Beta, Gamma) and connect their stylesheets to the central AstroLink network.",
    tip: "Hint: Bring color back to each sector and link them to the main system.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Restore the Skies of Venus in alpha.css", completed: false, isClaimed: false },
      { id: 2, text: "Restore the Subterranean Cavern in beta.css", completed: false, isClaimed: false },
      { id: 3, text: "Restore the Scorched Desert & Craters in gamma.css", completed: false, isClaimed: false }
    ]
  }
];

// Unified Single Section for Mercury Level 1 (Level 1: Saving the Biodome)
export const MERCURY_1_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: "Saving the Biodome",
    subtag: "FINDING ELEMENTS",
    desc: "The solar storm overheated the greenhouse! Use the scanner to inspect items and code solutions to revive the dome.",
    tip: "Hint: Inspect the plants in the dome to see what each one needs to thrive.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Cool down the greenhouse", completed: false, isClaimed: false },
      { id: 2, text: "Fertilize the shrubs and water the flowers", completed: false, isClaimed: false },
      { id: 3, text: "Fertilize and water the Star Flower", completed: false, isClaimed: false }
    ]
  }
];

// Unified Single Section for Mercury Level 2 (Level 2: The Conveyor Belt)
export const MERCURY_2_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: "The Conveyor Belt",
    subtag: "FUNCTIONS & EVENTS",
    desc: "The storm melted the logic boards on the factory's main conveyor belt! Help the Professor un-jam the tracks by teaching the machine how to make choices!",
    tip: "Hint: Watch the crates on the belt and guide each one to its destination.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Save the X-Ray scan to a Variable.", completed: false, isClaimed: false },
      { id: 2, text: "Build an If / Else If / Else rule.", completed: false, isClaimed: false },
      { id: 3, text: "Sort all 20 cargo crates.", completed: false, isClaimed: false }
    ]
  }
];

// Unified Single Section for Jupiter Level 1 (Level 1: Unlock the Gate)
export const JUPITER_1_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: "Unlock the Gate",
    subtag: "DATA TYPES & VARIABLES",
    desc: "The station blast doors are locked. Create the variables with matching types and values to open the gate.",
    tip: "",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Declare variables for the security locks.", completed: false, isClaimed: false },
      { id: 2, text: "Program the actions to enter codes into the locks.", completed: false, isClaimed: false },
      { id: 3, text: "Unlock the airlock blast doors.", completed: false, isClaimed: false }
    ]
  }
];

// Unified Single Section for Saturn Level 1 (Level 1: Surprise Diagnostics)
export const SATURN_1_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: "CIN and COUT",
    subtag: "Section 1 of 3",
    desc: "Welcome to the space station cockpit! Assemble your C++ terminal program using the available blocks, then run the simulation and complete the 45-second data challenge!",
    tip: "Tip: Connect all required blocks from the toolbox to build a complete program, then test your terminal and score at least 1,000 points to pass!",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Assemble the cockpit program structure", completed: false, isClaimed: false },
      { id: 2, text: "Connect all required data storage and stream blocks", completed: false, isClaimed: false },
      { id: 3, text: "Score 1,500 points in the terminal challenge", completed: false, isClaimed: false }
    ]
  }
];

// 3 Sections for Level 2 (Moon: Level 2 - Level 2: Resource Classification - Conveyor Belt Sorting)
export const LEVEL_2_SECTIONS: LevelSection[] = [
  // Section 1: Exactly 10 items (100% Cargo - Intro to Loops, Mandatory Scanning & Packing)
  {
    sectionIndex: 0,
    name: "Section 1",
    subtag: "Section 1 of 3",
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
    subtag: "Section 2 of 3",
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
    subtag: "Section 3 of 3",
    desc: "Sort 20 items: Route Fuel to the Fuel Bay, Cargo to the Cargo Bay, and discard Space Junk.",
    tip: "Tip: Scan the item, check if it is Fuel, Cargo, or Trash, and route each item to its designated bay.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Route all Fuel to Fuel Bay", completed: false, isClaimed: false },
      { id: 2, text: "Pack all Cargo Containers", completed: false, isClaimed: false },
      { id: 3, text: "Discard all Space Junk", completed: false, isClaimed: false }
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

// Reworked from Moon Level 2 Section 4: Standalone 25-item master sorting challenge
export const DAILY_CHALLENGE_CONVEYOR_GAUNTLET: LevelSection = {
  sectionIndex: 0,
  name: "Master Sorting Gauntlet",
  subtag: "Daily Challenge Mission",
  desc: "Sort all 25 items on the conveyor: Cargo, Trash, Fuel, and Food without errors.",
  tip: "Tip: Repeat 25 times to scan and route all four item types to their designated bays.",
  initialState: { x: 0, y: 0, direction: 0 },
  maze: [[1]],
  objectives: [
    { id: 1, text: "Route all Fuel & Food", completed: false, isClaimed: false },
    { id: 2, text: "Pack Cargo & Discard Trash", completed: false, isClaimed: false },
    { id: 3, text: "Sort all 25 items with 0 errors", completed: false, isClaimed: false }
  ]
};

// Standalone Fuel Synthesis challenge
export const DAILY_CHALLENGE_FUEL_SYNTHESIS: LevelSection = {
  sectionIndex: 0,
  name: "Fuel Synthesis Protocol",
  subtag: "Daily Challenge Mission",
  desc: "Synthesize 3 batches of fuel for the lunar fleet: Add solution, increase heat, mix 5 times, refine green fuel to orange, and fuel the spaceship.",
  tip: "Hint: Follow the synthesis steps carefully to prepare each batch of fuel.",
  initialState: { x: 0, y: 0, direction: 0 },
  maze: [[1]],
  objectives: [
    { id: 1, text: "Use both Start and End blocks", completed: false, isClaimed: false },
    { id: 2, text: "Use If condition to check if color is green", completed: false, isClaimed: false },
    { id: 3, text: "Synthesize and fuel all 3 batches", completed: false, isClaimed: false }
  ]
};

export const DAILY_CHALLENGE_POOL: LevelSection[] = [
  DAILY_CHALLENGE_WEAVE_TRAP,
  DAILY_CHALLENGE_LANE_CHANGER,
  DAILY_CHALLENGE_HAZARD_LABYRINTH,
  DAILY_CHALLENGE_CONVEYOR_GAUNTLET,
  DAILY_CHALLENGE_FUEL_SYNTHESIS
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
  if (m === 'daily-4' || m === 'daily-conveyor-gauntlet' || m.includes('conveyor') || m.includes('gauntlet')) {
    return DAILY_CHALLENGE_CONVEYOR_GAUNTLET;
  }
  if (m === 'daily-5' || m === 'daily-fuel-synthesis' || m.includes('fuel-synth') || m.includes('synthesis')) {
    return DAILY_CHALLENGE_FUEL_SYNTHESIS;
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
        { kind: 'block', type: 'action_move' },
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
                      NUM: 1,
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
                      NUM: 1,
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
                      NUM: 1,
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
                    NUM: 1,
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
        { kind: 'block', type: 'action_move_forward' },
        { kind: 'block', type: 'turn_left' },
        { kind: 'block', type: 'turn_right' },
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
                  NUM: 1,
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

export const getMars1ToolboxForSection = (sectionIndex: number = 0, themeId: string = 'welcome') => {
  const contentCategory = {
    kind: 'category',
    name: 'Content',
    colour: '#059669',
    contents: [
      {
        kind: 'block',
        type: 'html_text_welcome',
      },
      {
        kind: 'block',
        type: 'html_text_subtitle',
      },
      {
        kind: 'block',
        type: 'html_text_body',
      },
    ],
  };

  const structureCategory = {
    kind: 'category',
    name: 'Structure',
    colour: '#E44D26',
    contents: [
      { kind: 'block', type: 'html_h1' },
      { kind: 'block', type: 'html_h3' },
      { kind: 'block', type: 'html_p' },
      { kind: 'block', type: 'html_div' },
      { kind: 'block', type: 'html_hr' },
      { kind: 'block', type: 'html_br' },
    ],
  };

  const creativeKitCategory = {
    kind: 'category',
    name: 'Creative Kit',
    colour: '#A855F7',
    contents: [
      { kind: 'block', type: 'html_bold' },
      { kind: 'block', type: 'html_underline' },
      { kind: 'block', type: 'html_mark' },
      { kind: 'block', type: 'html_cross_out' },
    ],
  };

  return {
    kind: 'categoryToolbox',
    contents: [
      contentCategory,
      structureCategory,
      creativeKitCategory,
    ],
  };
};

export const getSectionsForMission = (missionId: string): LevelSection[] => {
  const m = (missionId || '').toLowerCase();
  if (m.startsWith('daily') || m.includes('daily')) {
    return [getDailyChallengeSection(missionId)];
  }
  if (m === 'mars-1' || m === 'html-1-mars') {
    return MARS_1_SECTIONS;
  }
  if (m === 'mars-2') {
    return MARS_2_SECTIONS;
  }
  if (m === 'mars-3' || m === 'html-3-mars') {
    return MARS_3_SECTIONS;
  }
  if (m === 'venus-1' || m === 'css-1-venus' || m === 'venus') {
    return VENUS_1_SECTIONS;
  }
  if (m === 'venus-2' || m === 'css-2-venus') {
    return VENUS_2_SECTIONS;
  }
  if (m === 'venus-3' || m === 'css-3-venus') {
    return VENUS_3_SECTIONS;
  }
  if (m === 'mercury-1' || m === 'js-1-mercury' || m === 'mercury' || m === 'javascript-1') {
    return MERCURY_1_SECTIONS;
  }
  if (m === 'mercury-2' || m === 'js-2-mercury') {
    return MERCURY_2_SECTIONS;
  }
  if (m === 'mercury-3' || m === 'js-3-mercury' || m === 'javascript-3' || m === 'js-3') {
    return MERCURY_3_SECTIONS;
  }
  if (m === 'jupiter-1' || m === 'java-1') {
    return JUPITER_1_SECTIONS;
  }
  if (m === 'jupiter-2' || m === 'java-2') {
    return JUPITER_2_SECTIONS;
  }
  if (m === 'jupiter-3' || m === 'java-3') {
    return JUPITER_3_SECTIONS;
  }
  if (m === 'saturn-1' || m === 'cpp-1') {
    return SATURN_1_SECTIONS;
  }
  if (m === 'saturn-2' || m === 'cpp-2') {
    return SATURN_2_SECTIONS;
  }
  if (m === 'saturn-3' || m === 'cpp-3') {
    return SATURN_3_SECTIONS;
  }
  if (m === 'earth-1' || m === 'python-1' || m === 'earth') {
    return EARTH_1_SECTIONS;
  }
  if (m === 'earth-2' || m === 'python-2') {
    return EARTH_2_SECTIONS;
  }
  if (m === 'earth-3' || m === 'python-3') {
    return EARTH_3_SECTIONS;
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
      { kind: 'block', type: 'action_move_forward' },
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
                    fields: { NUM: 1 },
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

export const getToolboxForMission = (
  missionId: string,
  sectionIndex = 0,
  themeId = 'welcome',
  earth2Tab: 'tab1' | 'tab2' = 'tab1',
  jupiter2Wave: Jupiter2Wave = 1
) => {
  const m = (missionId || '').toLowerCase();
  if (m.startsWith('daily') || m.includes('daily')) {
    const dSec = getDailyChallengeSection(missionId);
    if (dSec.name === 'Master Sorting Gauntlet') {
      return getConveyorToolboxForSection(3);
    }
    if (dSec.name === 'Fuel Synthesis Protocol') {
      return getLevelThreeToolboxForSection(1);
    }
    return advancedToolbox;
  }
  if (m === 'mars-1' || m === 'html-1-mars') {
    return getMars1ToolboxForSection(sectionIndex, themeId);
  }
  if (m === 'mars-2') {
    return getMarsLevel2Toolbox();
  }
  if (m === 'mars-3' || m === 'html-3-mars') {
    return MARS_LEVEL_3_TOOLBOX;
  }
  if (m === 'venus-1' || m === 'css-1-venus' || m === 'venus') {
    return VENUS_LEVEL_1_TOOLBOX;
  }
  if (m === 'venus-2' || m === 'css-2-venus') {
    return getVenusLevel2Toolbox(1);
  }
  if (m === 'venus-3' || m === 'css-3-venus') {
    let savedTab: any = 'main';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        savedTab = window.localStorage.getItem('netstart_venus3_active_tab') || 'main';
      }
    } catch { }
    return getVenusLevel3Toolbox(savedTab);
  }
  if (m === 'mercury-1' || m === 'js-1-mercury' || m === 'mercury' || m === 'javascript-1') {
    return getMercuryLevel1Toolbox();
  }
  if (m === 'mercury-2' || m === 'js-2-mercury') {
    return getMercuryLevel2Toolbox();
  }
  if (m === 'mercury-3' || m === 'js-3-mercury' || m === 'javascript-3' || m === 'js-3') {
    registerMercuryLevel3Blocks();
    let savedTab: any = 'html';
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        savedTab = window.localStorage.getItem(`netstart_mercury3_active_tab_${missionId}`) || window.localStorage.getItem('netstart_mercury3_active_tab') || 'html';
      }
    } catch { }
    if (savedTab === 'css') return getMercury3CssToolbox();
    if (savedTab === 'js') return getMercury3JsToolbox();
    return getMercury3HtmlToolbox();
  }
  if (m === 'jupiter-1' || m === 'java-1') {
    return getJupiterLevel1Toolbox();
  }
  if (m === 'jupiter-2' || m === 'java-2') {
    registerJupiterLevel2Blocks();
    return getJupiterLevel2Toolbox(jupiter2Wave);
  }
  if (m === 'jupiter-3' || m === 'java-3') {
    registerJupiterLevel3Blocks();
    return getJupiterLevel3Toolbox();
  }
  if (m === 'saturn-1' || m === 'cpp-1') {
    return getSaturnLevel1Toolbox();
  }
  if (m === 'saturn-2' || m === 'cpp-2') {
    registerSaturnLevel2Blocks();
    return getSaturnLevel2Toolbox();
  }
  if (m === 'saturn-3' || m === 'cpp-3') {
    registerSaturnLevel3Blocks();
    return getSaturnLevel3Toolbox();
  }
  if (m === 'earth-1' || m === 'python-1' || m === 'earth') {
    return getEarthLevel1Toolbox(sectionIndex);
  }
  if (m === 'earth-2' || m === 'python-2') {
    return getEarthLevel2Toolbox(earth2Tab);
  }
  if (m === 'earth-3' || m === 'python-3') {
    registerEarthLevel3Blocks();
    return getEarthLevel3Toolbox();
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
  if (id.startsWith('daily') || id.includes('daily')) return '/assets/global/daily/daily-star-ball.svg';
  if (id.startsWith('moon') || id.startsWith('html-1') || id.startsWith('html-2') || id.startsWith('html-3')) return '/assets/planets/00_moon/environment/MainMoon.svg';
  if (id.startsWith('mars') || id.startsWith('html')) return '/assets/planets/celestial/Mars.svg';
  if (id.startsWith('venus') || id.startsWith('css')) return '/assets/planets/celestial/Venus.svg';
  if (id.startsWith('mercury') || id.startsWith('javascript') || id.startsWith('js')) return '/assets/planets/celestial/Mercury.svg';
  if (id.startsWith('jupiter') || id.startsWith('java')) return '/assets/planets/celestial/Jupiter.svg';
  if (id.startsWith('saturn') || id.startsWith('cpp')) return '/assets/planets/celestial/Saturn.svg';
  if (id.startsWith('earth') || id.startsWith('python')) return '/assets/planets/celestial/Earth.svg';
  return '/assets/planets/00_moon/environment/MainMoon.svg';
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
    'mars-1': "Help Director Mark build a fun space billboard for the colony. Pick a theme, add your title and text, and style your words to get a 5-star review.",
    'mars-2': "Emma and Penny's screens show boring placeholder boxes. Read the little clues, find the matching pictures from your toolbox, and link them up to brighten their day.",
    'mars-3': "Say hello to your space neighbors. Assemble text boxes and buttons to build a friendly message form and reach out to Mercury and Venus.",
    'venus-1': "Professor Spectrum's lab lost all its colors. Drop in some furniture, splash your favorite colors and borders, and style the banner to make the room feel lively again.",
    'venus-2': "We have the pieces, but the layout is a mess! We must align them properly so the structure holds before we can plug it into the planet's main machinery.",
    'venus-3': "The AstroLink is powered on, but parts of the planet are still stuck in black and white. We need to link our new CSS prototype to the main HTML network to fix these dead zones and bring the color back.",
    'mercury-1': "Professor Dominic's plants are drying up after the solar storm! Fix the life support system and bring the garden back to life.",
    'js-1-mercury': "Professor Dominic's plants are drying up after the solar storm! Fix the life support system and bring the garden back to life.",
    'javascript-1': "Professor Dominic's plants are drying up after the solar storm! Fix the life support system and bring the garden back to life.",
    'js-1': "Professor Dominic's plants are drying up after the solar storm! Fix the life support system and bring the garden back to life.",
    'mercury-2': "The storm melted the logic boards on the factory's main conveyor belt! Help the Professor un-jam the tracks by teaching the machine how to make choices!",
    'js-2-mercury': "The storm melted the logic boards on the factory's main conveyor belt! Help the Professor un-jam the tracks by teaching the machine how to make choices!",
    'javascript-2': "The storm melted the logic boards on the factory's main conveyor belt! Help the Professor un-jam the tracks by teaching the machine how to make choices!",
    'js-2': "The storm melted the logic boards on the factory's main conveyor belt! Help the Professor un-jam the tracks by teaching the machine how to make choices!",
    'mercury-3': "The electromagnetic surge completely wiped out Mercury's front-end software! Combine your web dev blocks to rebuild the main communication relay from scratch and bring the system back online!",
    'js-3-mercury': "The electromagnetic surge completely wiped out Mercury's front-end software! Combine your web dev blocks to rebuild the main communication relay from scratch and bring the system back online!",
    'javascript-3': "The electromagnetic surge completely wiped out Mercury's front-end software! Combine your web dev blocks to rebuild the main communication relay from scratch and bring the system back online!",
    'js-3': "The electromagnetic surge completely wiped out Mercury's front-end software! Combine your web dev blocks to rebuild the main communication relay from scratch and bring the system back online!",
    'jupiter-1': "The Jupiter space station thinks you are an intruder and locked the blast doors!  Teach the system exactly what kind of data you are sending to unlock the heavy security gates.",
    'java-1': "The Jupiter space station thinks you are an intruder and locked the blast doors!  Teach the system exactly what kind of data you are sending to unlock the heavy security gates.",
    'jupiter-2': "Rescue Technician Io by building a Try/Catch safety net to intercept corrupted data blocks before they reach the server core!",
    'java-2': "Rescue Technician Io by building a Try/Catch safety net to intercept corrupted data blocks before they reach the server core!",
    'jupiter-3': "The Main Vault is on strict lockdown! The AI Core won't let anyone through. Can you build a custom ID blueprint and forge an object to sneak past the security scanner?",
    'java-3': "The Main Vault is on strict lockdown! The AI Core won't let anyone through. Can you build a custom ID blueprint and forge an object to sneak past the security scanner?",
    'saturn-1': "The station's sensors are scrambling data! Build the correct pipeline to catch the data, calculate the power, and route it to the main grid.",
    'cpp-1': "The station's sensors are scrambling data! Build the correct pipeline to catch the data, calculate the power, and route it to the main grid.",
    'saturn-2': "Saturn's rings are completely jammed with floating space debris! Use your ship's tractor beam to automatically sort the ice, rock, and metal into the correct disposal chutes so the rings can spin again.",
    'cpp-2': "Saturn's rings are completely jammed with floating space debris! Use your ship's tractor beam to automatically sort the ice, rock, and metal into the correct disposal chutes so the rings can spin again.",
    'saturn-3': "Oh no, Engineer Titan's mainframe is hogging all the energy cores and refusing to give them back! Whatever you take, you MUST return before the station goes boom!",
    'cpp-3': "Oh no, Engineer Titan's mainframe is hogging all the energy cores and refusing to give them back! Whatever you take, you MUST return before the station goes boom!",
    'earth-1': "The Master Ledger is scrambled! Use Python slicing and string tools to cut away the junk and restore each entry.",
    'python-1': "The Master Ledger is scrambled! Use Python slicing and string tools to cut away the junk and restore each entry.",
    'earth-2': "A solar storm scrambled the Master Ledger! Sort the loose data into digital folders to reconnect the solar system.",
    'python-2': "A solar storm scrambled the Master Ledger! Sort the loose data into digital folders to reconnect the solar system.",
    'earth-3': "The Architect has one final program to bring together every repair you've made across the solar system, but he needs your help to run it. Use Python functions and modules to unify the network and bring the solar system online at once!",
    'python-3': "The Architect has one final program to bring together every repair you've made across the solar system, but he needs your help to run it. Use Python functions and modules to unify the network and bring the solar system online at once!",
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

const getMissionPlanetSlug = (mId: string, isDaily: boolean) => {
  const id = (mId || '').toLowerCase();
  if (id.startsWith('moon') || id.startsWith('html-1') || id.startsWith('html-2') || id.startsWith('html-3')) return 'moon';
  if (id.startsWith('mars') || id.startsWith('html')) return 'mars';
  if (id.startsWith('venus') || id.startsWith('css')) return 'venus';
  if (id.startsWith('mercury') || id.startsWith('javascript') || id.startsWith('js')) return 'mercury';
  if (id.startsWith('jupiter') || id.startsWith('java')) return 'jupiter';
  if (id.startsWith('saturn') || id.startsWith('cpp')) return 'saturn';
  if (id.startsWith('earth') || id.startsWith('python')) return 'earth';
  return isDaily ? 'moon' : 'moon';
};

export default function BlocklyMaze() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams.get('missionId') || 'moon-1';
  const isDaily = (missionId || '').toLowerCase().startsWith('daily') || (missionId || '').toLowerCase().includes('daily');
  const dailySection = isDaily ? getDailyChallengeSection(missionId) : null;
  const isMarsLevel1 = (missionId || '').toLowerCase() === 'mars-1' || (missionId || '').toLowerCase() === 'html-1-mars';
  const isMarsLevel2 = (missionId || '').toLowerCase() === 'mars-2';
  const isMarsLevel3 = (missionId || '').toLowerCase() === 'mars-3' || (missionId || '').toLowerCase() === 'html-3-mars';
  const isVenusLevel1 = (missionId || '').toLowerCase() === 'venus-1' || (missionId || '').toLowerCase() === 'css-1-venus' || (missionId || '').toLowerCase() === 'venus';
  const isVenusLevel2 = (missionId || '').toLowerCase() === 'venus-2' || (missionId || '').toLowerCase() === 'css-2-venus';
  const isVenusLevel3 = (missionId || '').toLowerCase() === 'venus-3' || (missionId || '').toLowerCase() === 'css-3-venus';
  const isMercuryLevel1 = (missionId || '').toLowerCase() === 'mercury-1' || (missionId || '').toLowerCase() === 'js-1-mercury' || (missionId || '').toLowerCase() === 'mercury' || (missionId || '').toLowerCase() === 'javascript-1';
  const isMercuryLevel2 = (missionId || '').toLowerCase() === 'mercury-2' || (missionId || '').toLowerCase() === 'js-2-mercury';
  const isMercuryLevel3 = (missionId || '').toLowerCase() === 'mercury-3' || (missionId || '').toLowerCase() === 'js-3-mercury' || (missionId || '').toLowerCase() === 'javascript-3' || (missionId || '').toLowerCase() === 'js-3';
  const isJupiterLevel1 = (missionId || '').toLowerCase() === 'jupiter-1' || (missionId || '').toLowerCase() === 'java-1';
  const isJupiterLevel2 = (missionId || '').toLowerCase() === 'jupiter-2' || (missionId || '').toLowerCase() === 'java-2';
  const isJupiterLevel3 = (missionId || '').toLowerCase() === 'jupiter-3' || (missionId || '').toLowerCase() === 'java-3';
  const isSaturnLevel1 = (missionId || '').toLowerCase() === 'saturn-1' || (missionId || '').toLowerCase() === 'cpp-1';
  const isSaturnLevel2 = (missionId || '').toLowerCase() === 'saturn-2' || (missionId || '').toLowerCase() === 'cpp-2';
  const isSaturnLevel3 = (missionId || '').toLowerCase() === 'saturn-3' || (missionId || '').toLowerCase() === 'cpp-3';
  const isEarthLevel1 = (missionId || '').toLowerCase() === 'earth-1' || (missionId || '').toLowerCase() === 'python-1' || (missionId || '').toLowerCase() === 'earth';
  const isEarthLevel2 = (missionId || '').toLowerCase() === 'earth-2' || (missionId || '').toLowerCase() === 'python-2';
  const isEarthLevel3 = (missionId || '').toLowerCase() === 'earth-3' || (missionId || '').toLowerCase() === 'python-3';
  const isLevel2 = (missionId || '').toLowerCase() === 'moon-2' || (missionId || '').toLowerCase() === 'html-2' || (dailySection?.name === 'Master Sorting Gauntlet');
  const isLevel3 = (missionId || '').toLowerCase() === 'moon-3' || (missionId || '').toLowerCase() === 'html-3' || (dailySection?.name === 'Fuel Synthesis Protocol');
  const currentMissionSections = useMemo(() => getSectionsForMission(missionId), [missionId]);
  const planetIcon = getPlanetIconForMission(missionId);

  const missionTitleMap: Record<string, string> = {
    'moon-1': "Level 1: Stellar Beginnings",
    'moon-2': "Level 2: Resource Classification",
    'moon-3': "Level 3: The Starship Protocol",
    'html-1': "Level 1: Stellar Beginnings",
    'html-2': "Level 2: Resource Classification",
    'html-3': "Level 3: The Starship Protocol",
    'mars-1': "Level 1: The Blank Billboard",
    'mars-2': "Level 2: Picture Perfect",
    'mars-3': "Level 3: The Big Space Message",
    'venus-1': "Level 1: Color It In",
    'venus-2': "Level 2: Formatting the Prototype",
    'venus-3': "Level 3: Restoring the Dead Zones",
    'mercury-1': "Level 1: Saving the Biodome",
    'mercury-2': "Level 2: The Conveyor Belt",
    'mercury-3': "Level 3: The Missing Interface",
    'js-3-mercury': "Level 3: The Missing Interface",
    'javascript-3': "Level 3: The Missing Interface",
    'js-3': "Level 3: The Missing Interface",
    'jupiter-1': "Level 1: Unlock the Gate",
    'java-1': "Level 1: Unlock the Gate",
    'jupiter-2': "Level 2: Try and Catch This!",
    'java-2': "Level 2: Try and Catch This!",
    'jupiter-3': "Level 3: The AI Core Lockdown",
    'java-3': "Level 3: The AI Core Lockdown",
    'saturn-1': "Level 1: Surprise Diagnostics",
    'cpp-1': "Level 1: Surprise Diagnostics",
    'saturn-2': "Level 2: Jumpstarting the Rings",
    'cpp-2': "Level 2: Jumpstarting the Rings",
    'saturn-3': "Level 3: A Leak in the System!",
    'cpp-3': "Level 3: A Leak in the System!",
    'earth-1': "Level 1: Fix the Master Ledger!",
    'python-1': "Level 1: Fix the Master Ledger!",
    'earth-2': "Level 2: The Planetary Archive",
    'python-2': "Level 2: The Planetary Archive",
    'earth-3': "Level 3: The Master Reboot",
    'python-3': "Level 3: The Master Reboot",
  };

  // Venus Level 1 CSS State
  const [venus1Validation, setVenus1Validation] = useState<VenusLevel1Validation>(INITIAL_VENUS_LEVEL_1_VALIDATION);
  const lastVenusFurnitureKeyRef = useRef<string>('');
  const venusToolboxTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mars Level 2 Billboard State
  const lastMarsBillboardKeyRef = useRef<string>('');
  const mars2ToolboxTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Earth Level 2 State
  const [earth2ActiveTab, setEarth2ActiveTab] = useState<'tab1' | 'tab2'>('tab1');
  const earth2ActiveTabRef = useRef<'tab1' | 'tab2'>('tab1');
  earth2ActiveTabRef.current = earth2ActiveTab;
  const [simulationResetKey, setSimulationResetKey] = useState<number>(0);
  const [isEarth2Tab1Complete, setIsEarth2Tab1Complete] = useState<boolean>(false);
  const [earth2Tab1Validation, setEarth2Tab1Validation] = useState<Earth2Tab1Validation>(INITIAL_EARTH_2_TAB1_VALIDATION);
  const [earth2Tab2Validation, setEarth2Tab2Validation] = useState<Earth2Tab2Validation>(INITIAL_EARTH_2_TAB2_VALIDATION);
  const earth2WorkspaceStates = useRef<{ tab1: string; tab2: string }>({ tab1: '', tab2: '' });
  const lastEarth2ToolboxKeyRef = useRef<string>('');
  const earth2ToolboxTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mercury Level 2 Conveyor Belt State
  const [mercury2Validation, setMercury2Validation] = useState<MercuryLevel2Validation>(INITIAL_MERCURY_LEVEL_2_VALIDATION);

  // Jupiter Level 1 Airlock State
  const [jupiter1Validation, setJupiter1Validation] = useState<JupiterLevel1Validation>(INITIAL_JUPITER_LEVEL_1_VALIDATION);
  const [jupiter1FailCount, setJupiter1FailCount] = useState<number>(0);

  // Jupiter Level 2 Try/Catch Safety Net State
  const [jupiter2ActiveWave, setJupiter2ActiveWave] = useState<Jupiter2Wave>(1);
  const jupiter2ActiveWaveRef = useRef<Jupiter2Wave>(1);
  jupiter2ActiveWaveRef.current = jupiter2ActiveWave;
  const [isJupiter2Wave1Complete, setIsJupiter2Wave1Complete] = useState<boolean>(false);
  const [isJupiter2Wave2Complete, setIsJupiter2Wave2Complete] = useState<boolean>(false);
  const [jupiter2Validation, setJupiter2Validation] = useState<Jupiter2ValidationResult>(INITIAL_JUPITER_2_VALIDATION);
  const [jupiter2ResetKey, setJupiter2ResetKey] = useState<number>(0);
  const jupiter2WorkspaceStates = useRef<{ 1: string; 2: string; 3: string }>({ 1: '', 2: '', 3: '' });

  // Jupiter Level 3 AI Core Lockdown State
  const [jupiter3Blueprint, setJupiter3Blueprint] = useState<PlayerBlueprint>(INITIAL_PLAYER_BLUEPRINT);
  const [jupiter3ResetKey, setJupiter3ResetKey] = useState<number>(0);

  // Saturn Level 1 Data Bus State
  const [saturnWave, setSaturnWave] = useState<1 | 2 | 3>(1);
  const [saturnWorkspaceState, setSaturnWorkspaceState] = useState<SaturnWorkspaceState>(INITIAL_SATURN_WORKSPACE);
  const [saturn1Validation, setSaturn1Validation] = useState<SaturnValidationResult>(INITIAL_SATURN_LEVEL_1_VALIDATION);
  const [saturn1FailCount, setSaturn1FailCount] = useState<number>(0);
  const [saturnIsWon, setSaturnIsWon] = useState<boolean>(false);
  const prevSaturnLocksRef = useRef<number>(0);

  // Saturn Level 2 Flow Control & Switch Routing State
  const [saturn2Validation, setSaturn2Validation] = useState<Saturn2ValidationResult>(INITIAL_SATURN_2_VALIDATION);
  const [saturn2ResetKey, setSaturn2ResetKey] = useState<number>(0);
  const [saturn2UfoGreeted, setSaturn2UfoGreeted] = useState<boolean>(false);
  const [saturn2ShieldActivated, setSaturn2ShieldActivated] = useState<boolean>(false);

  // Saturn Level 3 Pointers & Memory Management State
  const [saturn3Payload, setSaturn3Payload] = useState<Saturn3WorkspacePayload>(INITIAL_SATURN_3_PAYLOAD);
  const [saturn3ResetKey, setSaturn3ResetKey] = useState<number>(0);

  // Earth Level 1 Python Master Ledger State
  const [earthWorkspaceState, setEarthWorkspaceState] = useState<Earth1WorkspaceState>(INITIAL_EARTH_1_WORKSPACE);
  const [earth1Validation, setEarth1Validation] = useState<Earth1ValidationResult>(INITIAL_EARTH_1_VALIDATION);

  // Earth Level 3 State
  const [earth3Audit, setEarth3Audit] = useState<Earth3AuditStatus>(INITIAL_EARTH_3_AUDIT);
  const [earth3Code, setEarth3Code] = useState<string>('');
  const [earth3ResetKey, setEarth3ResetKey] = useState<number>(0);

  // Venus Level 2 CSS Flexbox State
  const [venus2ActivePanel, setVenus2ActivePanel] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    try {
      const saved = Number(getNetstartItem('netstart_venus2_active_panel') || 1);
      return saved >= 1 && saved <= 5 ? saved : 1;
    } catch {
      return 1;
    }
  });
  const [venus2SolvedPanels, setVenus2SolvedPanels] = useState<{ 1: boolean; 2: boolean; 3: boolean; 4: boolean; 5: boolean }>(() => {
    if (typeof window === 'undefined') return { 1: false, 2: false, 3: false, 4: false, 5: false };
    try {
      const completedMissions: string[] = JSON.parse(getNetstartItem('netstart_completed_missions') || '[]');
      if (completedMissions.includes('venus-2') || completedMissions.includes('css-2-venus')) {
        return { 1: true, 2: true, 3: true, 4: true, 5: true };
      }
      const saved = JSON.parse(getNetstartItem('netstart_venus2_solved_panels') || '{}');
      return {
        1: Boolean(saved[1]),
        2: Boolean(saved[2]),
        3: Boolean(saved[3]),
        4: Boolean(saved[4]),
        5: Boolean(saved[5]),
      };
    } catch {
      return { 1: false, 2: false, 3: false, 4: false, 5: false };
    }
  });
  const [venus2Validation, setVenus2Validation] = useState<VenusLevel2Validation>(INITIAL_VENUS_LEVEL_2_VALIDATION);

  const isRestoringWorkspaceRef = useRef<boolean>(false);

  // Venus Level 3 State (4-Tab Instance Management)
  const [venus3ActiveTab, setVenus3ActiveTab] = useState<Venus3TabId>('main');
  const venus3WorkspaceStates = useRef<Record<Venus3TabId, any>>({
    main: null,
    alpha: null,
    beta: null,
    gamma: null,
  });
  const [venus3SectorStyles, setVenus3SectorStyles] = useState<Venus3ParsedStyles>({});
  const venus3StylesRef = useRef<Venus3ParsedStyles>({});
  const [venus3LinkedStylesheets, setVenus3LinkedStylesheets] = useState<string[]>([]);
  const [venus3InlineStyles, setVenus3InlineStyles] = useState<{ tower?: string; background?: string }>({});
  const venus3InlineStylesRef = useRef<{ tower?: string; background?: string }>({});
  const [venus3FailedSectors, setVenus3FailedSectors] = useState<Venus3SectorId[]>([]);
  const venus3FailedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [venus3ScanPhase, setVenus3ScanPhase] = useState<Venus3SectorId | 'done' | null>(null);
  const [venus3ScanResults, setVenus3ScanResults] = useState<Record<Venus3SectorId, 'pass' | 'fail' | null>>({ alpha: null, beta: null, gamma: null });
  const venus3ScanTimerRef = useRef<NodeJS.Timeout | null>(null);
  const venus3ScanTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const lastVenus3ToolboxKeyRef = useRef<string>('');
  const venus3ToolboxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [venus3SolvedSectors, setVenus3SolvedSectors] = useState<Record<Venus3SectorId, boolean>>(() => {
    if (typeof window === 'undefined') return { alpha: false, beta: false, gamma: false };
    try {
      const completedMissions: string[] = JSON.parse(getNetstartItem('netstart_completed_missions') || '[]');
      if (completedMissions.includes('venus-3') || completedMissions.includes('css-3-venus')) {
        return { alpha: true, beta: true, gamma: true };
      }
      const saved = JSON.parse(getNetstartItem('netstart_venus3_solved_sectors') || '{}');
      return {
        alpha: Boolean(saved.alpha),
        beta: Boolean(saved.beta),
        gamma: Boolean(saved.gamma),
      };
    } catch {
      return { alpha: false, beta: false, gamma: false };
    }
  });

  // Mercury Level 1 Biodome DOM State
  const [mercury1Validation, setMercury1Validation] = useState<MercuryLevel1Validation>(INITIAL_MERCURY_LEVEL_1_VALIDATION);

  // Mercury Level 3 State (3-Tab HTML / CSS / JS Full-Stack Comms)
  const [mercury3ActiveTab, setMercury3ActiveTab] = useState<Mercury3TabId>('html');
  const mercury3ActiveTabRef = useRef<Mercury3TabId>('html');
  mercury3ActiveTabRef.current = mercury3ActiveTab;
  const mercury3WorkspaceStates = useRef<Mercury3WorkspaceStates>({ html: '', css: '', js: '' });
  const [mercury3HtmlCode, setMercury3HtmlCode] = useState('');
  const [mercury3CssCode, setMercury3CssCode] = useState('');
  const [mercury3JsCode, setMercury3JsCode] = useState('');
  const mercury3HtmlCodeRef = useRef<string>('');
  const mercury3CssCodeRef = useRef<string>('');
  const mercury3JsCodeRef = useRef<string>('');
  const [mercury3Audit, setMercury3Audit] = useState<Mercury3AuditStatus>(INITIAL_MERCURY_3_AUDIT);
  const [mercury3SimulationActive, setMercury3SimulationActive] = useState<boolean>(false);
  const [mercury3ResetKey, setMercury3ResetKey] = useState<number>(0);
  const [showMercury3Hint, setShowMercury3Hint] = useState<boolean>(false);

  // Mars Level 1 HTML AST & NPC Dialogue State
  const [marsParsedElements, setMarsParsedElements] = useState<ParsedHtmlElement[]>([]);
  const [marsValidation, setMarsValidation] = useState<MarsValidationResult>({
    isValid: false,
    isInsideDiv: false,
    h1Content: null,
    h3Content: null,
    pContent: null,
    hasWelcomeInH1: false,
    hasTitleInH1: false,
    hasSubtitleInH3: false,
    hasBodyInP: false,
    hasModifier: false,
    hasDividerOrBreak: false,
    allNestedInDiv: false,
    matchedCount: 0,
    modifierCount: 0,
    ratingScore: 0,
    ratingRemarks: 'Assemble words that match your campaign theme!'
  });
  const [markDialogue, setMarkDialogue] = useState<{ isOpen: boolean; message: string; title?: string }>({
    isOpen: false,
    message: '',
    title: 'Mark the Martian'
  });
  const [activeMarsCampaignId, setActiveMarsCampaignId] = useState<string>('welcome');

  // Mars Level 2 Image Billboard State
  const [mars2Validation, setMars2Validation] = useState<MarsLevel2Validation>({
    totalContainers: 0,
    totalImages: 0,
    matchedCount: 0,
    isAllMatched: false,
    assignedImages: [null, null, null, null, null],
    customizations: [{}, {}, {}, {}, {}],
  });

  // Mars Level 3 Transmission Dashboard State
  const [mars3Validation, setMars3Validation] = useState<MarsLevel3Validation>({
    hasForm: false,
    hasDropdown: false,
    hasMercuryOption: false,
    hasVenusOption: false,
    hasInput: false,
    hasButton: false,
    hasTitle: false,
    formTitle: '',
    options: [],
    inputCount: 0,
    buttonCount: 0,
    canDeploy: false,
    isAssemblyValid: false,
    failErrorCode: null,
    failErrorMessage: null,
    completedObjectives: [false, false, false],
  });
  const [mars3Phase, setMars3Phase] = useState<'assembly' | 'sandbox'>('assembly');
  const [mars3MercuryPinged, setMars3MercuryPinged] = useState(false);
  const [mars3VenusPinged, setMars3VenusPinged] = useState(false);
  const [mars3StatusOpened, setMars3StatusOpened] = useState(false);

  const handleMarsCampaignChange = (campaignId: string) => {
    setActiveMarsCampaign(campaignId);
    setActiveMarsCampaignId(campaignId);
    if (workspace.current) {
      workspace.current.updateToolbox(getMars1ToolboxForSection(currentSection, campaignId));
      try {
        const code = javascriptGenerator.workspaceToCode(workspace.current);
        setJsCode(code);
        setPlainEnglishCode(code);
        const parseRes = parseWorkspaceHtml(workspace.current);
        parseRes.validation.detectedCampaignId = campaignId as any;
        setMarsParsedElements(parseRes.elements);
        setMarsValidation(parseRes.validation);
      } catch (e) { }
    }
  };

  const [currentSection, setCurrentSection] = useState<number>(0);
  const activeSection = currentMissionSections[currentSection] || currentMissionSections[0];

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
  const userId = user?.id as string | undefined;

  const getNetstartItem = useCallback((k: string): string | null => {
    if (!userId) return null;
    return getUserStorageItem(k.replace(/^netstart_/, ''), userId);
  }, [userId]);

  const setNetstartItem = useCallback((k: string, v: string): void => {
    if (!userId) return;
    if (isDemoModeActive()) {
      if (
        k.includes('completed_missions') ||
        k.includes('planet_unlock_pending') ||
        k.includes('claimed_directives')
      ) {
        return;
      }
    }
    setUserStorageItem(k.replace(/^netstart_/, ''), v, userId);
  }, [userId]);

  const removeNetstartItem = useCallback((k: string): void => {
    if (!userId) return;
    removeUserStorageItem(k.replace(/^netstart_/, ''), userId);
  }, [userId]);

  const handleVenus3TabChange = useCallback((newTab: Venus3TabId) => {
    if (newTab === venus3ActiveTab) return;
    if (workspace.current) {
      try {
        const dom = Blockly.Xml.workspaceToDom(workspace.current);
        const xmlText = Blockly.Xml.domToText(dom);
        venus3WorkspaceStates.current[venus3ActiveTab] = xmlText;
        setNetstartItem(`netstart_venus3_tab_${missionId}_${venus3ActiveTab}`, xmlText);

        const curParse = parseVenusLevel3Workspace(workspace.current, venus3ActiveTab);
        if (venus3ActiveTab !== 'main') {
          venus3StylesRef.current[venus3ActiveTab] = curParse.styles;
          setVenus3SectorStyles({ ...venus3StylesRef.current });
        } else {
          setVenus3LinkedStylesheets(curParse.linkedStylesheets);
          if (curParse.inlineStyles) {
            setVenus3InlineStyles(curParse.inlineStyles);
            venus3InlineStylesRef.current = curParse.inlineStyles;
          }
        }
        setNetstartItem(`netstart_venus3_styles_${missionId}`, JSON.stringify(venus3StylesRef.current));
      } catch (e) {
        console.warn("Could not save Venus 3 tab before switch:", e);
      }

      FieldColorWheel.activeSector = newTab;
      setVenus3ActiveTab(newTab);
      setVenus3FailedSectors([]);
      setClipboardXml(null);
      clipboardXmlRef.current = null;
      try {
        if ((Blockly as any).clipboard?.set) {
          (Blockly as any).clipboard.set(null);
        }
        if ((Blockly as any).clipboardXml_) {
          (Blockly as any).clipboardXml_ = null;
        }
      } catch (e) { }
      try {
        setNetstartItem(`netstart_venus3_active_tab_${missionId}`, newTab);
        setNetstartItem('netstart_venus3_active_tab', newTab);

        const saveState = {
          missionId,
          sectionIndex: currentSection,
          xmlText: venus3WorkspaceStates.current[newTab] || getNetstartItem(`netstart_venus3_tab_${missionId}_${newTab}`) || '',
          title: displayTitle,
          completedGoals: [],
          timestamp: Date.now()
        };
        setNetstartItem('netstart_active_saved_level', JSON.stringify(saveState));
      } catch (e) { }

      isRestoringWorkspaceRef.current = true;
      try {
        if (Blockly.Events?.disable) {
          Blockly.Events.disable();
        }

        workspace.current.clear();
        if (typeof (workspace.current as any).clearUndo === 'function') {
          (workspace.current as any).clearUndo();
        }

        let saved = venus3WorkspaceStates.current[newTab] || getNetstartItem(`netstart_venus3_tab_${missionId}_${newTab}`);
        if (
          saved &&
          typeof saved === 'string' &&
          saved.trim() &&
          !saved.includes('<xml xmlns="https://developers.google.com/blockly/xml"></xml>') &&
          !saved.includes('<xml xmlns="https://developers.google.com/blockly/xml"/>')
        ) {
          saved = saved
            .replace(/<block[^>]*type="event_start"[^>]*>[\s\S]*?<\/block>/gi, '')
            .replace(/<block[^>]*type="event_start"[^>]*\/>/gi, '');
          const dom = Blockly.utils.xml.textToDom(saved);
          Blockly.Xml.domToWorkspace(dom, workspace.current);
        } else if (newTab === 'main') {
          // Provide default <head> starter container for index.html
          const defaultMainXml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="venus3_html_head" x="50" y="50"></block></xml>';
          const dom = Blockly.utils.xml.textToDom(defaultMainXml);
          Blockly.Xml.domToWorkspace(dom, workspace.current);
        }

        const allBlocks = workspace.current.getAllBlocks(false);
        const foreignBlocks: Blockly.Block[] = [];
        for (const b of allBlocks) {
          if (!isBlockAllowedInTab(b.type, newTab)) {
            foreignBlocks.push(b);
          }
        }
        if (foreignBlocks.length > 0) {
          foreignBlocks.forEach(fb => fb.dispose(false));
        }

        const validBlocks = workspace.current.getAllBlocks(false);
        const seenTypes = new Set<string>();
        if (newTab === 'main') {
          for (const b of validBlocks) {
            if (b.type === 'venus3_inline_tower' || b.type === 'venus3_inline_background' || b.type === 'venus3_html_head') {
              seenTypes.add(b.type);
            }
          }
        } else {
          for (const b of validBlocks) {
            if (b.type && b.type.startsWith('venus3_target_')) {
              seenTypes.add(b.type);
            }
          }
        }
        try {
          workspace.current.updateToolbox(getVenusLevel3Toolbox(newTab, seenTypes));
        } catch (e) { }

        const newParse = parseVenusLevel3Workspace(workspace.current, newTab);
        if (newTab !== 'main') {
          venus3StylesRef.current[newTab] = newParse.styles;
          setVenus3SectorStyles({ ...venus3StylesRef.current });
          setNetstartItem(`netstart_venus3_styles_${missionId}`, JSON.stringify(venus3StylesRef.current));
        } else {
          setVenus3LinkedStylesheets(newParse.linkedStylesheets);
          if (newParse.inlineStyles) {
            setVenus3InlineStyles(newParse.inlineStyles);
            venus3InlineStylesRef.current = newParse.inlineStyles;
          }
        }
        setPlainEnglishCode(newParse.code);
        setJsCode(newParse.code);

        // Synchronize objectives state on tab switch
        const isSecDone = completedSections.includes(currentSection);
        if (!isSecDone) {
          const linked = newTab === 'main' ? newParse.linkedStylesheets : venus3LinkedStylesheets;
          const currInline = newTab === 'main' && newParse.inlineStyles ? newParse.inlineStyles : venus3InlineStylesRef.current;
          const alphaHasStyles = Boolean(venus3StylesRef.current.alpha && Object.keys(venus3StylesRef.current.alpha).length >= 1);
          const betaHasStyles = Boolean(venus3StylesRef.current.beta && Object.keys(venus3StylesRef.current.beta).length >= 1);
          const gammaHasStyles = Boolean(venus3StylesRef.current.gamma && Object.keys(venus3StylesRef.current.gamma).length >= 1);

          const obj1Met = Boolean(alphaHasStyles);
          const obj2Met = Boolean(betaHasStyles);
          const obj3Met = Boolean(gammaHasStyles);

          setObjectives(prev => prev.map(obj => {
            if (obj.isClaimed || isReplayMode) return obj;
            if (obj.id === 1) return { ...obj, completed: obj1Met };
            if (obj.id === 2) return { ...obj, completed: obj2Met };
            if (obj.id === 3) return { ...obj, completed: obj3Met };
            return obj;
          }));
        }
      } catch (e) {
        console.warn("Could not restore Venus 3 tab after switch:", e);
      } finally {
        if (Blockly.Events?.enable) {
          Blockly.Events.enable();
        }
        setTimeout(() => {
          isRestoringWorkspaceRef.current = false;
        }, 150);
      }
    } else {
      setVenus3ActiveTab(newTab);
    }
  }, [venus3ActiveTab, missionId, getNetstartItem, setNetstartItem]);

  const handleMercury3TabChange = useCallback((newTab: Mercury3TabId) => {
    if (newTab === mercury3ActiveTabRef.current) return;
    if (workspace.current) {
      try {
        const dom = Blockly.Xml.workspaceToDom(workspace.current);
        const xmlText = Blockly.Xml.domToText(dom);
        const currentActive = mercury3ActiveTabRef.current;
        mercury3WorkspaceStates.current[currentActive] = xmlText;
        setNetstartItem(`netstart_mercury3_tab_${missionId}_${currentActive}`, xmlText);

        if (currentActive === 'html') {
          const code = compileMercury3Html(workspace.current);
          mercury3HtmlCodeRef.current = code;
          setMercury3HtmlCode(code);
        } else if (currentActive === 'css') {
          const code = compileMercury3Css(workspace.current);
          mercury3CssCodeRef.current = code;
          setMercury3CssCode(code);
        } else if (currentActive === 'js') {
          const code = compileMercury3Js(workspace.current);
          mercury3JsCodeRef.current = code;
          setMercury3JsCode(code);
        }
      } catch (e) {
        console.warn("Could not save Mercury 3 tab before switch:", e);
      }

      setMercury3ActiveTab(newTab);
      mercury3ActiveTabRef.current = newTab;
      setClipboardXml(null);
      clipboardXmlRef.current = null;
      try {
        if ((Blockly as any).clipboard?.set) {
          (Blockly as any).clipboard.set(null);
        }
        if ((Blockly as any).clipboardXml_) {
          (Blockly as any).clipboardXml_ = null;
        }
      } catch (e) { }

      try {
        setNetstartItem(`netstart_mercury3_active_tab_${missionId}`, newTab);
        setNetstartItem('netstart_mercury3_active_tab', newTab);

        const saveState = {
          missionId,
          sectionIndex: currentSection,
          xmlText: mercury3WorkspaceStates.current[newTab] || getNetstartItem(`netstart_mercury3_tab_${missionId}_${newTab}`) || '',
          title: displayTitle,
          completedGoals: [],
          timestamp: Date.now()
        };
        setNetstartItem('netstart_active_saved_level', JSON.stringify(saveState));
      } catch (e) { }

      isRestoringWorkspaceRef.current = true;
      try {
        if (Blockly.Events?.disable) {
          Blockly.Events.disable();
        }

        workspace.current.clear();
        if (typeof (workspace.current as any).clearUndo === 'function') {
          (workspace.current as any).clearUndo();
        }

        let saved = mercury3WorkspaceStates.current[newTab] || getNetstartItem(`netstart_mercury3_tab_${missionId}_${newTab}`);
        if (
          saved &&
          typeof saved === 'string' &&
          saved.trim() &&
          !saved.includes('<xml xmlns="https://developers.google.com/blockly/xml"></xml>') &&
          !saved.includes('<xml xmlns="https://developers.google.com/blockly/xml"/>')
        ) {
          saved = saved
            .replace(/<block[^>]*type="event_start"[^>]*>[\s\S]*?<\/block>/gi, '')
            .replace(/<block[^>]*type="event_start"[^>]*\/>/gi, '');
          const dom = Blockly.utils.xml.textToDom(saved);
          Blockly.Xml.domToWorkspace(dom, workspace.current);
        }

        const allBlocks = workspace.current.getAllBlocks(false);
        const foreignBlocks: Blockly.Block[] = [];
        for (const b of allBlocks) {
          if (!isMercury3BlockAllowedInTab(b.type, newTab)) {
            foreignBlocks.push(b);
          }
        }
        if (foreignBlocks.length > 0) {
          foreignBlocks.forEach(fb => fb.dispose(false));
        }

        if (newTab === 'html') {
          workspace.current.updateToolbox(getMercury3HtmlToolbox());
        } else if (newTab === 'css') {
          workspace.current.updateToolbox(getMercury3CssToolbox());
        } else {
          workspace.current.updateToolbox(getMercury3JsToolbox());
        }

        let tabCode = '';
        if (newTab === 'html') {
          tabCode = compileMercury3Html(workspace.current);
          mercury3HtmlCodeRef.current = tabCode;
          setMercury3HtmlCode(tabCode);
        } else if (newTab === 'css') {
          tabCode = compileMercury3Css(workspace.current);
          mercury3CssCodeRef.current = tabCode;
          setMercury3CssCode(tabCode);
        } else if (newTab === 'js') {
          tabCode = compileMercury3Js(workspace.current);
          mercury3JsCodeRef.current = tabCode;
          setMercury3JsCode(tabCode);
        }
        setPlainEnglishCode(tabCode);
        setJsCode(tabCode);

        const curHtml = newTab === 'html' ? tabCode : mercury3HtmlCodeRef.current;
        const curCss = newTab === 'css' ? tabCode : mercury3CssCodeRef.current;
        const curJs = newTab === 'js' ? tabCode : mercury3JsCodeRef.current;
        const audit = auditMercury3Workspace(curHtml, curCss, curJs);
        setMercury3Audit(audit);

        const isSecDone = completedSections.includes(currentSection);
        if (!isSecDone) {
          setObjectives(prev => prev.map(obj => {
            if (obj.isClaimed || isReplayMode) return obj;
            if (obj.id === 1) return { ...obj, completed: audit.htmlStructureValid };
            if (obj.id === 2) return { ...obj, completed: audit.cssStylingValid };
            return obj;
          }));
        }
      } catch (e) {
        console.warn("Could not restore Mercury 3 tab after switch:", e);
      } finally {
        if (Blockly.Events?.enable) {
          Blockly.Events.enable();
        }
        setTimeout(() => {
          isRestoringWorkspaceRef.current = false;
        }, 150);
      }
    } else {
      setMercury3ActiveTab(newTab);
      mercury3ActiveTabRef.current = newTab;
    }
  }, [missionId, currentSection, displayTitle, getNetstartItem, setNetstartItem, mercury3HtmlCode, mercury3CssCode, mercury3JsCode]);

  // Hydrate all Mercury Level 3 tabs (HTML, CSS, JS) on mount/init
  useEffect(() => {
    if (!isMercuryLevel3) return;
    try {
      try {
        removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
        removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
      } catch (e) { }

      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const isReplayParam = urlParams?.get('mode') === 'replay';
      const rawSave = getNetstartItem('netstart_active_saved_level');
      let savedMissionMatches = false;
      if (rawSave) {
        try {
          const parsed = JSON.parse(rawSave);
          if (parsed.missionId && parsed.missionId.toLowerCase() === missionId.toLowerCase()) {
            savedMissionMatches = true;
          }
        } catch (e) { }
      }

      if (isReplayParam || !savedMissionMatches) {
        mercury3WorkspaceStates.current = { html: '', css: '', js: '' };
        setMercury3ActiveTab('html');
        mercury3ActiveTabRef.current = 'html';
        setMercury3HtmlCode('');
        setMercury3CssCode('');
        setMercury3JsCode('');
        setMercury3Audit(INITIAL_MERCURY_3_AUDIT);
        try {
          removeNetstartItem('netstart_mercury3_active_tab');
          removeNetstartItem(`netstart_mercury3_active_tab_${missionId}`);
          removeNetstartItem(`netstart_mercury3_tab_${missionId}_html`);
          removeNetstartItem(`netstart_mercury3_tab_${missionId}_css`);
          removeNetstartItem(`netstart_mercury3_tab_${missionId}_js`);
        } catch (e) { }
        return;
      }

      const savedTab = (getNetstartItem(`netstart_mercury3_active_tab_${missionId}`) || getNetstartItem('netstart_mercury3_active_tab')) as Mercury3TabId;
      if (savedTab && (savedTab === 'html' || savedTab === 'css' || savedTab === 'js')) {
        setMercury3ActiveTab(savedTab);
        mercury3ActiveTabRef.current = savedTab;
      } else {
        setMercury3ActiveTab('html');
        mercury3ActiveTabRef.current = 'html';
      }

      const allTabs: Mercury3TabId[] = ['html', 'css', 'js'];
      let compiledHtml = '';
      let compiledCss = '';
      let compiledJs = '';

      for (const t of allTabs) {
        let savedXml = getNetstartItem(`netstart_mercury3_tab_${missionId}_${t}`);
        if (
          savedXml &&
          typeof savedXml === 'string' &&
          savedXml.trim() &&
          !savedXml.includes('<xml xmlns="https://developers.google.com/blockly/xml"></xml>') &&
          !savedXml.includes('<xml xmlns="https://developers.google.com/blockly/xml"/>')
        ) {
          savedXml = savedXml
            .replace(/<block[^>]*type="event_start"[^>]*>[\s\S]*?<\/block>/gi, '')
            .replace(/<block[^>]*type="event_start"[^>]*\/>/gi, '');
          setNetstartItem(`netstart_mercury3_tab_${missionId}_${t}`, savedXml);
          mercury3WorkspaceStates.current[t] = savedXml;

          try {
            const tempWs = new Blockly.Workspace();
            const dom = Blockly.utils.xml.textToDom(savedXml);
            Blockly.Xml.domToWorkspace(dom, tempWs);
            if (t === 'html') {
              compiledHtml = compileMercury3Html(tempWs);
              mercury3HtmlCodeRef.current = compiledHtml;
              setMercury3HtmlCode(compiledHtml);
            } else if (t === 'css') {
              compiledCss = compileMercury3Css(tempWs);
              mercury3CssCodeRef.current = compiledCss;
              setMercury3CssCode(compiledCss);
            } else if (t === 'js') {
              compiledJs = compileMercury3Js(tempWs);
              mercury3JsCodeRef.current = compiledJs;
              setMercury3JsCode(compiledJs);
            }
            tempWs.dispose();
          } catch (e) { }
        }
      }

      const audit = auditMercury3Workspace(compiledHtml, compiledCss, compiledJs);
      setMercury3Audit(audit);

      setObjectives(prev => prev.map(obj => {
        if (obj.isClaimed || isReplayMode) return obj;
        if (obj.id === 1) return { ...obj, completed: audit.htmlStructureValid };
        if (obj.id === 2) return { ...obj, completed: audit.cssStylingValid };
        return obj;
      }));
    } catch (e) {
      console.warn("Could not hydrate Mercury Level 3 tabs:", e);
    }
  }, [isMercuryLevel3, missionId, currentSection, getNetstartItem, setNetstartItem, removeNetstartItem]);

  // Hydrate all Venus Level 3 sector tabs, active tab, and styles on mount/init
  useEffect(() => {
    if (!isVenusLevel3) return;
    try {
      // Clear generic maze workspace saves to ensure Start block is never restored
      try {
        removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
        removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
      } catch (e) { }

      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const isReplayParam = urlParams?.get('mode') === 'replay';
      const rawSave = getNetstartItem('netstart_active_saved_level');
      let savedMissionMatches = false;
      if (rawSave) {
        try {
          const parsed = JSON.parse(rawSave);
          if (parsed.missionId && parsed.missionId.toLowerCase() === missionId.toLowerCase()) {
            savedMissionMatches = true;
          }
        } catch (e) { }
      }

      if (isReplayParam || !savedMissionMatches) {
        // Fresh entry, save override, or replay: clear all cached Venus 3 sector states
        venus3WorkspaceStates.current = { main: '', alpha: '', beta: '', gamma: '' };
        venus3StylesRef.current = {};
        setVenus3SectorStyles({});
        setVenus3SolvedSectors({ alpha: false, beta: false, gamma: false });
        setVenus3ActiveTab('main');
        setVenus3LinkedStylesheets([]);
        setVenus3InlineStyles({});
        venus3InlineStylesRef.current = {};
        try {
          removeNetstartItem('netstart_venus3_solved_sectors');
          removeNetstartItem('netstart_venus3_active_tab');
          removeNetstartItem(`netstart_venus3_active_tab_${missionId}`);
          removeNetstartItem(`netstart_venus3_styles_${missionId}`);
          removeNetstartItem(`netstart_venus3_tab_${missionId}_main`);
          removeNetstartItem(`netstart_venus3_tab_${missionId}_alpha`);
          removeNetstartItem(`netstart_venus3_tab_${missionId}_beta`);
          removeNetstartItem(`netstart_venus3_tab_${missionId}_gamma`);
        } catch (e) { }
        return;
      }

      // 0. Restore saved active tab
      const savedTab = (getNetstartItem(`netstart_venus3_active_tab_${missionId}`) || getNetstartItem('netstart_venus3_active_tab')) as Venus3TabId;
      if (savedTab && (savedTab === 'main' || savedTab === 'alpha' || savedTab === 'beta' || savedTab === 'gamma')) {
        FieldColorWheel.activeSector = savedTab;
        setVenus3ActiveTab(savedTab);
      } else {
        FieldColorWheel.activeSector = 'main';
      }

      // 1. Restore cached styles
      const cachedStylesRaw = getNetstartItem(`netstart_venus3_styles_${missionId}`);
      if (cachedStylesRaw) {
        try {
          const parsed = JSON.parse(cachedStylesRaw);
          if (parsed && typeof parsed === 'object') {
            venus3StylesRef.current = { ...venus3StylesRef.current, ...parsed };
            setVenus3SectorStyles({ ...venus3StylesRef.current });
          }
        } catch (e) { }
      }

      // 2. Load saved XML for all tabs and compute styles if not present
      const allTabs: Venus3TabId[] = ['main', 'alpha', 'beta', 'gamma'];
      let stylesUpdated = false;

      for (const t of allTabs) {
        let savedXml = getNetstartItem(`netstart_venus3_tab_${missionId}_${t}`);
        if (
          savedXml &&
          typeof savedXml === 'string' &&
          savedXml.trim() &&
          !savedXml.includes('<xml xmlns="https://developers.google.com/blockly/xml"></xml>') &&
          !savedXml.includes('<xml xmlns="https://developers.google.com/blockly/xml"/>')
        ) {
          savedXml = savedXml
            .replace(/<block[^>]*type="event_start"[^>]*>[\s\S]*?<\/block>/gi, '')
            .replace(/<block[^>]*type="event_start"[^>]*\/>/gi, '');
          setNetstartItem(`netstart_venus3_tab_${missionId}_${t}`, savedXml);
          venus3WorkspaceStates.current[t] = savedXml;
          if (t !== 'main' && (!venus3StylesRef.current[t] || Object.keys(venus3StylesRef.current[t] || {}).length === 0)) {
            try {
              const tempWs = new Blockly.Workspace();
              const dom = Blockly.utils.xml.textToDom(savedXml);
              Blockly.Xml.domToWorkspace(dom, tempWs);
              const parseRes = parseVenusLevel3Workspace(tempWs, t);
              if (parseRes.styles && Object.keys(parseRes.styles).length > 0) {
                venus3StylesRef.current[t] = parseRes.styles;
                stylesUpdated = true;
              }
              tempWs.dispose();
            } catch (e) { }
          } else if (t === 'main') {
            try {
              const tempWs = new Blockly.Workspace();
              const dom = Blockly.utils.xml.textToDom(savedXml);
              Blockly.Xml.domToWorkspace(dom, tempWs);
              const parseRes = parseVenusLevel3Workspace(tempWs, 'main');
              setVenus3LinkedStylesheets(parseRes.linkedStylesheets);
              if (parseRes.inlineStyles) {
                setVenus3InlineStyles(parseRes.inlineStyles);
                venus3InlineStylesRef.current = parseRes.inlineStyles;
              }
              tempWs.dispose();
            } catch (e) { }
          }
        }
      }

      if (stylesUpdated) {
        setVenus3SectorStyles({ ...venus3StylesRef.current });
        setNetstartItem(`netstart_venus3_styles_${missionId}`, JSON.stringify(venus3StylesRef.current));
      }
    } catch (e) {
      console.warn("Could not hydrate Venus Level 3 sectors:", e);
    }
  }, [isVenusLevel3, missionId, currentSection, getNetstartItem, setNetstartItem, removeNetstartItem]);
  const { currentXp, addXp: _rawAddXp, removeXp, playerLevel } = useProgression();
  const addXp = useCallback((amount: number, sourceLabel?: string) => {
    if (isDemoModeActive()) return;
    _rawAddXp(amount, sourceLabel);
  }, [_rawAddXp]);

  const { setIsInLevel, registerSaveHandler, unregisterSaveHandler, requestNavigation } = useNavigationGuard();

  interface InventoryState {
    fuel: number;
    oxygen: number;
  }
  const [inventory, setInventory] = useState<InventoryState>({ fuel: 0, oxygen: 0 });

  // Level 2 Conveyor Belt States
  const [conveyorQueue, setConveyorQueue] = useState<ConveyorItem[]>(() => {
    if (dailySection?.name === 'Master Sorting Gauntlet') {
      return getSectionConveyorQueue(3);
    }
    return getSectionConveyorQueue(0);
  });
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__onJupiterTypeMismatch = (msg: string) => {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);
        setErrorToastMessage(msg);
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__onJupiterTypeMismatch;
      }
    };
  }, []);

  // Level 2 Target Resource Manifest
  const levelManifest = useMemo(() => {
    if (!isLevel2) return { cargo: 0, trash: 0, fuel: 0, food: 0, total: 0 };
    const initialItems = (dailySection?.name === 'Master Sorting Gauntlet')
      ? getSectionConveyorQueue(3)
      : getSectionConveyorQueue(currentSection);
    const cargo = initialItems.filter(i => i.type === 'cargo').length;
    const trash = initialItems.filter(i => i.type === 'trash').length;
    const fuel = initialItems.filter(i => i.type === 'fuel').length;
    const food = initialItems.filter(i => i.type === 'food').length;
    return { cargo, trash, fuel, food, total: initialItems.length };
  }, [isLevel2, currentSection, dailySection?.name]);

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
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'blocks' | 'syntax'>('blocks');
  const [plainEnglishCode, setPlainEnglishCode] = useState('');
  const [jsCode, setJsCode] = useState('');

  // Copy/Paste & Clipboard States
  const [clipboardXml, setClipboardXml] = useState<string | null>(null);
  const [showClipboardToast, setShowClipboardToast] = useState(false);
  const [clipboardToastMessage, setClipboardToastMessage] = useState('');
  const [toastUndoAction, setToastUndoAction] = useState<(() => void) | null>(null);
  const clipboardToastTimer = useRef<NodeJS.Timeout | null>(null);
  const flightSimRef = useRef<FlightSimulationRef | null>(null);
  const fuelSynthRef = useRef<FuelSynthesisRef | null>(null);

  const showToast = useCallback((msg: string, options?: { onUndo?: () => void; duration?: number }) => {
    setClipboardToastMessage(msg);
    setToastUndoAction(options?.onUndo ? () => options.onUndo! : null);
    setShowClipboardToast(true);
    if (clipboardToastTimer.current) clearTimeout(clipboardToastTimer.current);
    const duration = options?.duration ?? (options?.onUndo ? 7000 : 4000);
    clipboardToastTimer.current = setTimeout(() => {
      setShowClipboardToast(false);
      setToastUndoAction(null);
    }, duration);
  }, []);

  // Hydrate Level 2, Level 3, and Mars Level 1 State & Toolbox on section change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__NETSTART_CURRENT_SECTION__ = currentSection;
      (window as any).__NETSTART_DAILY_SECTION_NAME__ = dailySection?.name;
      (window as any).__NETSTART_MISSION_ID__ = missionId;
    }
    if (isMarsLevel1 || isMarsLevel2 || isMarsLevel3 || isVenusLevel1 || isEarthLevel1 || isEarthLevel2 || isEarthLevel3 || isJupiterLevel2 || isJupiterLevel3) {
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = currentSection;
        (workspace.current as any).dailySectionName = dailySection?.name;
        (workspace.current as any).missionId = missionId;
        workspace.current.updateToolbox(getToolboxForMission(missionId, currentSection, 'welcome', earth2ActiveTabRef.current, jupiter2ActiveWaveRef.current));
      }
    } else if (isLevel2) {
      if (dailySection?.name === 'Master Sorting Gauntlet') {
        setConveyorQueue(getSectionConveyorQueue(3));
      } else {
        setConveyorQueue(getSectionConveyorQueue(currentSection));
      }
      setConveyorInventory({ cargo: 0, trash: 0, fuel: 0, food: 0, errors: 0 });
      setActiveAction('none');
      setIsBeltAdvancing(false);
      setIsScanning(false);
      setIsCurrentItemScanned(false);
      setAnimatingItem(null);
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = currentSection;
        (workspace.current as any).dailySectionName = dailySection?.name;
        (workspace.current as any).missionId = missionId;
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
  }, [currentSection, isMarsLevel1, isLevel2, isLevel3, isVenusLevel1, isEarthLevel3, activeSection, missionId]);

  // Replay Mode and Claimed Objectives Tracking
  const [isReplayMode, setIsReplayMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const isReplayParam = new URLSearchParams(window.location.search).get('mode') === 'replay';
      const completedMissions: string[] = JSON.parse(getNetstartItem('netstart_completed_missions') || '[]');
      const isMissionDone = completedMissions.some((m: string) => m.toLowerCase() === missionId.toLowerCase());
      const completedList: number[] = JSON.parse(getNetstartItem(`netstart_completed_sections_${missionId}`) || '[]');
      return isReplayParam || isMissionDone || completedList.length >= currentMissionSections.length;
    } catch {
      return false;
    }
  });
  const [claimedDirectives, setClaimedDirectives] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch {
      return [];
    }
  });
  const [objectives, setObjectives] = useState(() => {
    if (typeof window === 'undefined') return activeSection.objectives.map(o => ({ ...o, completed: false, isClaimed: false }));
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isReplayParam = urlParams.get('mode') === 'replay';
      const rawSave = getNetstartItem('netstart_active_saved_level');
      let savedMissionMatches = false;
      if (rawSave) {
        try {
          const parsed = JSON.parse(rawSave);
          if (parsed.missionId && parsed.missionId.toLowerCase() === missionId.toLowerCase()) {
            savedMissionMatches = true;
          }
        } catch (e) { }
      }

      const completedMissions: string[] = JSON.parse(getNetstartItem('netstart_completed_missions') || '[]');
      const isMissionDone = completedMissions.some((m: string) => m.toLowerCase() === missionId.toLowerCase());
      const claimedList: string[] = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
      const completedGoals: string[] = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
      const compSections: number[] = JSON.parse(getNetstartItem(`netstart_completed_sections_${missionId}`) || '[]');
      const isSecDone = compSections.includes(currentSection);

      // If replaying or level was already completed, all objectives are 3/3 Achieved and Claimed!
      if (isReplayParam || isMissionDone) {
        return activeSection.objectives.map(obj => ({
          ...obj,
          completed: true,
          isClaimed: true,
        }));
      }

      // If starting fresh without an active in-progress saved session:
      if (!savedMissionMatches) {
        return activeSection.objectives.map(o => ({
          ...o,
          completed: false,
          isClaimed: false,
        }));
      }

      return activeSection.objectives.map(obj => {
        if (isEarthLevel1) {
          const matchingSection = obj.id - 1;
          const unifiedKey = `${missionId}_sec${matchingSection}_goal${obj.id}`;
          const isClaimedAny = claimedList.includes(unifiedKey);
          const isCompletedAny = compSections.includes(matchingSection) || completedGoals.includes(unifiedKey);
          return { ...obj, completed: isCompletedAny, isClaimed: isClaimedAny };
        }
        if (isEarthLevel2 || isEarthLevel3) {
          const unifiedKey = `${missionId}_sec0_goal${obj.id}`;
          const isClaimedAny = claimedList.includes(unifiedKey);
          const isCompletedAny = completedGoals.includes(unifiedKey);
          return { ...obj, completed: isCompletedAny, isClaimed: isClaimedAny };
        }
        const key = `${missionId}_sec${currentSection}_goal${obj.id}`;
        const isClaimed = claimedList.includes(key);
        const isCompleted = isSecDone || completedGoals.includes(key);
        return {
          ...obj,
          completed: isCompleted,
          isClaimed: isClaimed,
        };
      });
    } catch {
      return activeSection.objectives.map(o => ({ ...o, completed: false, isClaimed: false }));
    }
  });
  const [recentlyCompletedId, setRecentlyCompletedId] = useState<number | null>(null);
  const [buttonPulse, setButtonPulse] = useState(false);

  // Section Progression Locking State (Route Guards)
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  // Re-sync completedSections if missionId or userId changes
  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isReplayParam = urlParams.get('mode') === 'replay';
      const rawSave = getNetstartItem('netstart_active_saved_level');
      let savedMissionMatches = false;
      let savedSecIndex = 0;
      if (rawSave) {
        try {
          const parsed = JSON.parse(rawSave);
          if (parsed.missionId && parsed.missionId.toLowerCase() === missionId.toLowerCase()) {
            savedMissionMatches = true;
            if (typeof parsed.sectionIndex === 'number' && parsed.sectionIndex >= 0) {
              savedSecIndex = parsed.sectionIndex;
            }
          }
        } catch (e) { }
      }

      const savedCompletedSections: number[] = JSON.parse(getNetstartItem(`netstart_completed_sections_${missionId}`) || '[]');

      if (isReplayParam || !savedMissionMatches) {
        // Replaying or starting fresh without an active in-progress saved session:
        // Always start fresh at Section 1 with 0 completed sections. Sections 2+ remain locked!
        setCompletedSections([]);
        try {
          removeNetstartItem(`netstart_completed_sections_${missionId}`);
        } catch (e) { }
      } else if (savedCompletedSections.length > 0) {
        setCompletedSections(savedCompletedSections);
      } else if (savedSecIndex > 0) {
        const prior = [];
        for (let i = 0; i < savedSecIndex; i++) prior.push(i);
        setCompletedSections(prior);
      } else {
        setCompletedSections([]);
      }
    } catch (e) { }
  }, [missionId, userId, getNetstartItem, removeNetstartItem]);

  const recordSectionCompleted = useCallback((secIdx: number) => {
    setCompletedSections(prev => {
      if (!prev.includes(secIdx)) {
        const updated = [...prev, secIdx];
        try {
          setNetstartItem(`netstart_completed_sections_${missionId}`, JSON.stringify(updated));
        } catch (e) { }
        return updated;
      }
      return prev;
    });

    // Automatically update saved level to point to the next uncompleted section
    if (secIdx < currentMissionSections.length - 1) {
      try {
        let completedGoals: string[] = [];
        try {
          completedGoals = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
        } catch (e) { }
        const nextXml = getNetstartItem(`netstart_saved_workspace_${missionId}_${secIdx + 1}`) || '';
        const saveState = {
          missionId,
          sectionIndex: secIdx + 1,
          xmlText: nextXml,
          title: displayTitle,
          completedGoals,
          timestamp: Date.now()
        };
        setNetstartItem('netstart_active_saved_level', JSON.stringify(saveState));
        setNetstartItem('netstart_active_level', JSON.stringify({
          missionId,
          title: displayTitle,
          module: getMissionModuleForMission(missionId, isDaily),
          icon: planetIcon,
          desc: getMissionDescForMission(missionId, isDaily),
          startedAt: new Date().toISOString()
        }));
      } catch (e) { }
    }
  }, [missionId, displayTitle, currentMissionSections.length, isDaily, planetIcon, userId, getNetstartItem, setNetstartItem]);

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
  const [completionTab, setCompletionTab] = useState<'code' | 'syntax'>('code');
  const [selectedCompletionLine, setSelectedCompletionLine] = useState<string | null>(null);

  // 2-Pane Split Layout (Percentage - balanced 58% Blockly, 42% Simulation)
  const [splitPercent, setSplitPercent] = useState<number>(58);
  const isDragging = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    if (!containerRect.width || containerRect.width <= 0) return;
    const newLeftWidth = e.clientX - containerRect.left;
    const rawPercent = (newLeftWidth / containerRect.width) * 100;
    if (!isFinite(rawPercent)) return;
    const clamped = Math.min(Math.max(rawPercent, 20), 80);
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || !containerRef.current || !e.touches[0]) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    if (!containerRect.width || containerRect.width <= 0) return;
    const newLeftWidth = e.touches[0].clientX - containerRect.left;
    const rawPercent = (newLeftWidth / containerRect.width) * 100;
    if (!isFinite(rawPercent)) return;
    const clamped = Math.min(Math.max(rawPercent, 20), 80);
    setSplitPercent(clamped);

    if (workspace.current) {
      Blockly.svgResize(workspace.current);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    if (workspace.current) {
      Blockly.svgResize(workspace.current);
    }
  }, [handleTouchMove]);

  const handleTouchStart = useCallback(() => {
    isDragging.current = true;
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null);
  const execState = useRef({ ...activeSection.initialState });
  const hitWall = useRef(false);
  const isGoal = useRef(false);
  const steppedOnBomb = useRef(false);
  const blockQueueRef = useRef<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const instructionsDropdownRef = useRef<HTMLDivElement>(null);
  const executionIdRef = useRef<number>(0);
  const hasHydratedSavedSection = useRef<string | null>(null);

  // Nova AI Hint State & Telemetry Integration
  const [aiHint, setAiHint] = useState<{
    show: boolean;
    text: string;
    hintId?: string | null;
    isLoading: boolean;
  }>({
    show: false,
    text: '',
    hintId: null,
    isLoading: false,
  });
  const lastAiEvaluateRequestTime = useRef<number>(0);

  const requestAiHintEvaluation = useCallback(async (failureReason: string) => {
    const now = Date.now();
    // 3-second client-side cooldown check
    if (now - lastAiEvaluateRequestTime.current < 3000) {
      return;
    }
    lastAiEvaluateRequestTime.current = now;

    setAiHint({
      show: true,
      text: 'Nova is analyzing your code telemetry to formulate guidance...',
      hintId: null,
      isLoading: true,
    });

    try {
      const currentPlainCode = plainEnglishCode || (workspace.current ? generatePlainEnglishPseudocode(workspace.current) : '');
      let currentJs = jsCode;
      if (!currentJs && workspace.current) {
        try {
          const startBlock = workspace.current.getBlocksByType('event_start', false)[0];
          const firstExec = startBlock?.getNextBlock();
          if (firstExec) {
            currentJs = javascriptGenerator.blockToCode(firstExec) as string;
          }
        } catch (e) {}
      }

      const res = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId: missionId || 'moon-1',
          currentSection: currentSection + 1,
          plainEnglishCode: currentPlainCode || '',
          generatedJs: currentJs || '',
          errorMessage: failureReason,
          simulationState: {
            steppedOnBomb: steppedOnBomb.current,
            section: currentSection,
          },
          previousErrorTypes: [],
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        console.warn('[AI_EVALUATE_RESPONSE_STATUS]', res.status, errJson);
        setAiHint(prev => ({
          ...prev,
          isLoading: false,
          text: 'Nova suggests reviewing the mission directives on the left panel to verify your next move.',
        }));
        return;
      }

      const data = await res.json();
      if (data?.hint_text) {
        setAiHint({
          show: true,
          isLoading: false,
          text: data.hint_text,
          hintId: data.hint_id,
        });
      }
    } catch (err) {
      console.warn('[AI_EVALUATE_EXCEPTION]', err);
      // AI failure must never break the UI
      setAiHint(prev => ({
        ...prev,
        isLoading: false,
        text: 'Nova suggests reviewing the mission directives on the left panel to verify your next move.',
      }));
    }
  }, [currentSection, jsCode, missionId, plainEnglishCode]);

  useEffect(() => {
    if (showErrorToast && errorToastMessage) {
      requestAiHintEvaluation(errorToastMessage);
    }
  }, [showErrorToast, errorToastMessage, requestAiHintEvaluation]);

  useEffect(() => {
    if (isRunning) {
      setAiHint(prev => ({ ...prev, show: false }));
    }
  }, [isRunning]);

  // Check replay mode and restore saved state once userId is ready
  useEffect(() => {
    if (!userId || hasHydratedSavedSection.current === `${userId}_${missionId}`) return;
    try {
      let targetSec = 0;
      const isReplayParam = searchParams.get('mode') === 'replay';
      const rawSave = getNetstartItem('netstart_active_saved_level');
      let savedMissionMatches = false;
      let savedSecIndex = 0;

      if (rawSave) {
        try {
          const parsed = JSON.parse(rawSave);
          if (parsed.missionId) {
            const pId = parsed.missionId.toLowerCase();
            const curId = missionId.toLowerCase();
            const isMatch = pId === curId ||
              ((pId === 'saturn-3' || pId === 'cpp-3') && (curId === 'saturn-3' || curId === 'cpp-3')) ||
              ((pId === 'saturn-2' || pId === 'cpp-2') && (curId === 'saturn-2' || curId === 'cpp-2')) ||
              ((pId === 'saturn-1' || pId === 'cpp-1') && (curId === 'saturn-1' || curId === 'cpp-1')) ||
              ((pId === 'jupiter-3' || pId === 'java-3') && (curId === 'jupiter-3' || curId === 'java-3')) ||
              ((pId === 'jupiter-2' || pId === 'java-2') && (curId === 'jupiter-2' || curId === 'java-2')) ||
              ((pId === 'jupiter-1' || pId === 'java-1') && (curId === 'jupiter-1' || curId === 'java-1')) ||
              ((pId === 'mercury-1' || pId === 'js-1-mercury') && (curId === 'mercury-1' || curId === 'js-1-mercury')) ||
              ((pId === 'mercury-2' || pId === 'js-2-mercury') && (curId === 'mercury-2' || curId === 'js-2-mercury')) ||
              ((pId === 'earth-1' || pId === 'python-1' || pId === 'earth') && (curId === 'earth-1' || curId === 'python-1' || curId === 'earth')) ||
              ((pId === 'earth-2' || pId === 'python-2') && (curId === 'earth-2' || curId === 'python-2')) ||
              ((pId === 'earth-3' || pId === 'python-3') && (curId === 'earth-3' || curId === 'python-3'));
            if (isMatch) {
              savedMissionMatches = true;
              if (typeof parsed.sectionIndex === 'number' && parsed.sectionIndex >= 0 && parsed.sectionIndex < currentMissionSections.length) {
                savedSecIndex = parsed.sectionIndex;
              }
            }
          }
        } catch (e) { }
      }

      const completedMissions: string[] = JSON.parse(getNetstartItem('netstart_completed_missions') || '[]');
      const isMissionDone = completedMissions.some((m: string) => m.toLowerCase() === missionId.toLowerCase());

      if (isReplayParam) {
        // Explicit Replay: Always begin at Section 1 (index 0)
        targetSec = 0;
        setCompletedSections([]);
        setObjectives(currentMissionSections[0].objectives.map(o => ({
          ...o,
          completed: true,
          isClaimed: true,
        })));
        try {
          removeNetstartItem(`netstart_completed_sections_${missionId}`);
          for (let s = 0; s < currentMissionSections.length; s++) {
            removeNetstartItem(`netstart_saved_workspace_${missionId}_${s}`);
          }
          if (isMercuryLevel1) {
            removeNetstartItem('netstart_saved_workspace_mercury-1_0');
            removeNetstartItem('netstart_saved_workspace_js-1-mercury_0');
            removeNetstartItem('netstart_saved_workspace_mercury_0');
          }
          if (isMercuryLevel2) {
            removeNetstartItem('netstart_saved_workspace_mercury-2_0');
            removeNetstartItem('netstart_saved_workspace_js-2-mercury_0');
          }
          if (isJupiterLevel1) {
            removeNetstartItem('netstart_saved_workspace_jupiter-1_0');
            removeNetstartItem('netstart_saved_workspace_java-1_0');
          }
          if (isSaturnLevel1) {
            removeNetstartItem('netstart_saved_workspace_saturn-1_0');
            removeNetstartItem('netstart_saved_workspace_cpp-1_0');
          }
          if (isSaturnLevel2) {
            removeNetstartItem('netstart_saved_workspace_saturn-2_0');
            removeNetstartItem('netstart_saved_workspace_cpp-2_0');
            removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
          }
          if (isEarthLevel1) {
            const earthAliases = [missionId, 'earth-1', 'python-1', 'earth'].filter(Boolean);
            earthAliases.forEach(id => {
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
              removeNetstartItem(`netstart_saved_workspace_${id}_1`);
              removeNetstartItem(`netstart_saved_workspace_${id}_2`);
            });
          }
          if (isEarthLevel2) {
            const earth2Aliases = [missionId, 'earth-2', 'python-2'].filter(Boolean);
            earth2Aliases.forEach(id => {
              removeNetstartItem(`netstart_earth2_tab_${id}_tab1`);
              removeNetstartItem(`netstart_earth2_tab_${id}_tab2`);
              removeNetstartItem(`netstart_earth2_active_tab_${id}`);
              removeNetstartItem(`netstart_earth2_tab1_complete_${id}`);
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
            });
            setIsEarth2Tab1Complete(false);
            setEarth2ActiveTab('tab1');
            earth2ActiveTabRef.current = 'tab1';
            earth2WorkspaceStates.current = { tab1: '', tab2: '' };
            setEarth2Tab1Validation(INITIAL_EARTH_2_TAB1_VALIDATION);
            setEarth2Tab2Validation(INITIAL_EARTH_2_TAB2_VALIDATION);
            lastEarth2ToolboxKeyRef.current = '';
          }
          if (isJupiterLevel2) {
            const jupiter2Aliases = [missionId, 'jupiter-2', 'java-2'].filter(Boolean);
            jupiter2Aliases.forEach(id => {
              removeNetstartItem(`netstart_jupiter2_wave_${id}_1`);
              removeNetstartItem(`netstart_jupiter2_wave_${id}_2`);
              removeNetstartItem(`netstart_jupiter2_wave_${id}_3`);
              removeNetstartItem(`netstart_jupiter2_active_wave_${id}`);
              removeNetstartItem(`netstart_jupiter2_wave1_complete_${id}`);
              removeNetstartItem(`netstart_jupiter2_wave2_complete_${id}`);
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
            });
            removeNetstartItem('netstart_jupiter2_wave1_complete');
            removeNetstartItem('netstart_jupiter2_wave2_complete');
            removeNetstartItem('netstart_jupiter2_active_wave');
            setIsJupiter2Wave1Complete(false);
            setIsJupiter2Wave2Complete(false);
            setJupiter2ActiveWave(1);
            jupiter2ActiveWaveRef.current = 1;
            jupiter2WorkspaceStates.current = { 1: '', 2: '', 3: '' };
            setJupiter2Validation(INITIAL_JUPITER_2_VALIDATION);
          }
          if (isJupiterLevel3) {
            const jupiter3Aliases = [missionId, 'jupiter-3', 'java-3'].filter(Boolean);
            jupiter3Aliases.forEach(id => {
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
            });
            setJupiter3Blueprint(INITIAL_PLAYER_BLUEPRINT);
            setJupiter3ResetKey(prev => prev + 1);
          }
          if (isSaturnLevel3) {
            const saturn3Aliases = [missionId, 'saturn-3', 'cpp-3'].filter(Boolean);
            saturn3Aliases.forEach(id => {
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
            });
            setSaturn3Payload(INITIAL_SATURN_3_PAYLOAD);
            setSaturn3ResetKey(prev => prev + 1);
          }
          if (isEarthLevel3) {
            const earth3Aliases = [missionId, 'earth-3', 'python-3'].filter(Boolean);
            earth3Aliases.forEach(id => {
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
            });
            setEarth3Audit(INITIAL_EARTH_3_AUDIT);
            setEarth3Code('');
            setEarth3ResetKey(prev => prev + 1);
          }
        } catch (e) { }
        if (isVenusLevel3) {
          setVenus3SolvedSectors({ alpha: false, beta: false, gamma: false });
          setVenus3ActiveTab('main');
          setVenus3SectorStyles({});
          venus3StylesRef.current = {};
          venus3WorkspaceStates.current = { main: '', alpha: '', beta: '', gamma: '' };
          setVenus3LinkedStylesheets([]);
          setVenus3InlineStyles({});
          venus3InlineStylesRef.current = {};
          try {
            removeNetstartItem('netstart_venus3_solved_sectors');
            removeNetstartItem('netstart_venus3_active_tab');
            removeNetstartItem(`netstart_venus3_active_tab_${missionId}`);
            removeNetstartItem(`netstart_venus3_styles_${missionId}`);
            removeNetstartItem(`netstart_venus3_tab_${missionId}_main`);
            removeNetstartItem(`netstart_venus3_tab_${missionId}_alpha`);
            removeNetstartItem(`netstart_venus3_tab_${missionId}_beta`);
            removeNetstartItem(`netstart_venus3_tab_${missionId}_gamma`);
          } catch (e) { }
        }
        if (isMercuryLevel3) {
          mercury3WorkspaceStates.current = { html: '', css: '', js: '' };
          setMercury3ActiveTab('html');
          mercury3ActiveTabRef.current = 'html';
          setMercury3HtmlCode('');
          setMercury3CssCode('');
          setMercury3JsCode('');
          setMercury3Audit(INITIAL_MERCURY_3_AUDIT);
          try {
            removeNetstartItem('netstart_mercury3_active_tab');
            removeNetstartItem(`netstart_mercury3_active_tab_${missionId}`);
            removeNetstartItem(`netstart_mercury3_tab_${missionId}_html`);
            removeNetstartItem(`netstart_mercury3_tab_${missionId}_css`);
            removeNetstartItem(`netstart_mercury3_tab_${missionId}_js`);
          } catch (e) { }
        }
        if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('mode');
          window.history.replaceState({}, '', cleanUrl.toString());
        }
      } else if (savedMissionMatches) {
        // Resuming active saved session: restore saved section and prior completed sections
        targetSec = savedSecIndex;
        const priorCompleted = [];
        for (let i = 0; i < targetSec; i++) {
          priorCompleted.push(i);
        }
        setCompletedSections(priorCompleted);
      } else {
        // Fresh entry without active save (save override or new start): always begin at Section 1 (index 0)
        targetSec = 0;
        setCompletedSections([]);
        setObjectives(currentMissionSections[0].objectives.map(o => ({
          ...o,
          completed: isMissionDone || isReplayMode,
          isClaimed: isMissionDone || isReplayMode,
        })));
        try {
          removeNetstartItem(`netstart_completed_sections_${missionId}`);
          if (!isMissionDone && !isReplayMode) {
            removeNetstartItem(`netstart_completed_goals_${missionId}`);
          }
          for (let s = 0; s < currentMissionSections.length; s++) {
            removeNetstartItem(`netstart_saved_workspace_${missionId}_${s}`);
          }
          if (isMercuryLevel1) {
            removeNetstartItem('netstart_saved_workspace_mercury-1_0');
            removeNetstartItem('netstart_saved_workspace_js-1-mercury_0');
            removeNetstartItem('netstart_saved_workspace_mercury_0');
          }
          if (isMercuryLevel2) {
            removeNetstartItem('netstart_saved_workspace_mercury-2_0');
            removeNetstartItem('netstart_saved_workspace_js-2-mercury_0');
          }
          if (isMercuryLevel3) {
            removeNetstartItem('netstart_saved_workspace_mercury-3_0');
            removeNetstartItem('netstart_saved_workspace_js-3-mercury_0');
            removeNetstartItem('netstart_saved_workspace_javascript-3_0');
            removeNetstartItem('netstart_saved_workspace_js-3_0');
          }
          if (isJupiterLevel1) {
            removeNetstartItem('netstart_saved_workspace_jupiter-1_0');
            removeNetstartItem('netstart_saved_workspace_java-1_0');
          }
          if (isSaturnLevel1) {
            removeNetstartItem('netstart_saved_workspace_saturn-1_0');
            removeNetstartItem('netstart_saved_workspace_cpp-1_0');
          }
          if (isSaturnLevel2) {
            removeNetstartItem('netstart_saved_workspace_saturn-2_0');
            removeNetstartItem('netstart_saved_workspace_cpp-2_0');
            removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
          }
          if (isSaturnLevel3) {
            const saturn3Aliases = [missionId, 'saturn-3', 'cpp-3'].filter(Boolean);
            saturn3Aliases.forEach(id => {
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
            });
            setSaturn3Payload(INITIAL_SATURN_3_PAYLOAD);
            setSaturn3ResetKey(prev => prev + 1);
          }
          if (isEarthLevel1) {
            const earthAliases = [missionId, 'earth-1', 'python-1', 'earth'].filter(Boolean);
            earthAliases.forEach(id => {
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
              removeNetstartItem(`netstart_saved_workspace_${id}_1`);
              removeNetstartItem(`netstart_saved_workspace_${id}_2`);
            });
          }
          if (isEarthLevel2) {
            const earth2Aliases = [missionId, 'earth-2', 'python-2'].filter(Boolean);
            earth2Aliases.forEach(id => {
              removeNetstartItem(`netstart_earth2_tab_${id}_tab1`);
              removeNetstartItem(`netstart_earth2_tab_${id}_tab2`);
              removeNetstartItem(`netstart_earth2_active_tab_${id}`);
              removeNetstartItem(`netstart_earth2_tab1_complete_${id}`);
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
            });
            setIsEarth2Tab1Complete(false);
            setEarth2ActiveTab('tab1');
            earth2ActiveTabRef.current = 'tab1';
            earth2WorkspaceStates.current = { tab1: '', tab2: '' };
            setEarth2Tab1Validation(INITIAL_EARTH_2_TAB1_VALIDATION);
            setEarth2Tab2Validation(INITIAL_EARTH_2_TAB2_VALIDATION);
            lastEarth2ToolboxKeyRef.current = '';
          }
          if (isJupiterLevel2) {
            const jupiter2Aliases = [missionId, 'jupiter-2', 'java-2'].filter(Boolean);
            jupiter2Aliases.forEach(id => {
              removeNetstartItem(`netstart_jupiter2_wave_${id}_1`);
              removeNetstartItem(`netstart_jupiter2_wave_${id}_2`);
              removeNetstartItem(`netstart_jupiter2_wave_${id}_3`);
              removeNetstartItem(`netstart_jupiter2_active_wave_${id}`);
              removeNetstartItem(`netstart_jupiter2_wave1_complete_${id}`);
              removeNetstartItem(`netstart_jupiter2_wave2_complete_${id}`);
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
            });
            removeNetstartItem('netstart_jupiter2_wave1_complete');
            removeNetstartItem('netstart_jupiter2_wave2_complete');
            removeNetstartItem('netstart_jupiter2_active_wave');
            setIsJupiter2Wave1Complete(false);
            setIsJupiter2Wave2Complete(false);
            setJupiter2ActiveWave(1);
            jupiter2ActiveWaveRef.current = 1;
            jupiter2WorkspaceStates.current = { 1: '', 2: '', 3: '' };
            setJupiter2Validation(INITIAL_JUPITER_2_VALIDATION);
          }
          if (isJupiterLevel3) {
            const jupiter3Aliases = [missionId, 'jupiter-3', 'java-3'].filter(Boolean);
            jupiter3Aliases.forEach(id => {
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
            });
            setJupiter3Blueprint(INITIAL_PLAYER_BLUEPRINT);
            setJupiter3ResetKey(prev => prev + 1);
          }
          if (isSaturnLevel3) {
            const saturn3Aliases = [missionId, 'saturn-3', 'cpp-3'].filter(Boolean);
            saturn3Aliases.forEach(id => {
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
            });
            setSaturn3Payload(INITIAL_SATURN_3_PAYLOAD);
            setSaturn3ResetKey(prev => prev + 1);
          }
          if (isEarthLevel3) {
            const earth3Aliases = [missionId, 'earth-3', 'python-3'].filter(Boolean);
            earth3Aliases.forEach(id => {
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
            });
            setEarth3Audit(INITIAL_EARTH_3_AUDIT);
            setEarth3Code('');
            setEarth3ResetKey(prev => prev + 1);
          }
        } catch (e) { }
        if (isVenusLevel3) {
          setVenus3SolvedSectors({ alpha: false, beta: false, gamma: false });
          setVenus3ActiveTab('main');
          setVenus3SectorStyles({});
          venus3StylesRef.current = {};
          venus3WorkspaceStates.current = { main: '', alpha: '', beta: '', gamma: '' };
          setVenus3LinkedStylesheets([]);
          setVenus3InlineStyles({});
          venus3InlineStylesRef.current = {};
          try {
            removeNetstartItem('netstart_venus3_solved_sectors');
            removeNetstartItem('netstart_venus3_active_tab');
            removeNetstartItem(`netstart_venus3_active_tab_${missionId}`);
            removeNetstartItem(`netstart_venus3_styles_${missionId}`);
            removeNetstartItem(`netstart_venus3_tab_${missionId}_main`);
            removeNetstartItem(`netstart_venus3_tab_${missionId}_alpha`);
            removeNetstartItem(`netstart_venus3_tab_${missionId}_beta`);
            removeNetstartItem(`netstart_venus3_tab_${missionId}_gamma`);
          } catch (e) { }
        }
        if (isMercuryLevel3) {
          mercury3WorkspaceStates.current = { html: '', css: '', js: '' };
          setMercury3ActiveTab('html');
          mercury3ActiveTabRef.current = 'html';
          setMercury3HtmlCode('');
          setMercury3CssCode('');
          setMercury3JsCode('');
          setMercury3Audit(INITIAL_MERCURY_3_AUDIT);
          try {
            removeNetstartItem('netstart_mercury3_active_tab');
            removeNetstartItem(`netstart_mercury3_active_tab_${missionId}`);
            removeNetstartItem(`netstart_mercury3_tab_${missionId}_html`);
            removeNetstartItem(`netstart_mercury3_tab_${missionId}_css`);
            removeNetstartItem(`netstart_mercury3_tab_${missionId}_js`);
          } catch (e) { }
        }
      }

      setCurrentSection(targetSec);
      const targetSectionObj = currentMissionSections[targetSec] || currentMissionSections[0];
      setCharState(targetSectionObj.initialState);
      execState.current = { ...targetSectionObj.initialState };

      // Sync claimed directives
      const claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
      setClaimedDirectives(claimedList);
      hasHydratedSavedSection.current = `${userId}_${missionId}`;
    } catch (e) {
      console.warn("Could not parse saved level state:", e);
      hasHydratedSavedSection.current = `${userId}_${missionId}`;
    }
  }, [missionId, searchParams, userId, getNetstartItem, removeNetstartItem, currentMissionSections, isVenusLevel3, isMercuryLevel3, isEarthLevel3]);

  // Immediately synchronize active ongoing mission in localStorage and backend database
  useEffect(() => {
    if (!userId || !hasHydratedSavedSection.current) return;
    try {
      // Inform backend that this mission is active/in progress
      if (!isDemoModeActive()) {
        fetch('/api/missions/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ missionId }),
        }).catch(() => { });
      }

      let completedGoals: string[] = [];
      try {
        completedGoals = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
      } catch (e) { }

      const saveState = {
        missionId,
        sectionIndex: currentSection,
        xmlText: isMercuryLevel3
          ? (mercury3WorkspaceStates.current[mercury3ActiveTabRef.current] || getNetstartItem(`netstart_mercury3_tab_${missionId}_${mercury3ActiveTabRef.current}`) || '')
          : isVenusLevel3
            ? (venus3WorkspaceStates.current[venus3ActiveTab] || getNetstartItem(`netstart_venus3_tab_${missionId}_${venus3ActiveTab}`) || '')
          : isEarthLevel2
            ? (earth2WorkspaceStates.current[earth2ActiveTabRef.current] || getNetstartItem(`netstart_earth2_tab_${missionId}_${earth2ActiveTabRef.current}`) || '')
            : isJupiterLevel2
              ? (jupiter2WorkspaceStates.current[jupiter2ActiveWaveRef.current] || getNetstartItem(`netstart_jupiter2_wave_${missionId}_${jupiter2ActiveWaveRef.current}`) || '')
              : (getNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`) || ''),
        title: displayTitle,
        completedGoals,
        timestamp: Date.now()
      };
      setNetstartItem('netstart_active_saved_level', JSON.stringify(saveState));
      setNetstartItem('netstart_active_level', JSON.stringify({
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
  }, [missionId, currentSection, displayTitle, isDaily, planetIcon, userId, getNetstartItem, setNetstartItem]);

  // Load objectives with isClaimed resolution (evaluates fresh for active session)
  useEffect(() => {
    try {
      const claimedList: string[] = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
      const completedGoals: string[] = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
      const compSections: number[] = JSON.parse(getNetstartItem(`netstart_completed_sections_${missionId}`) || '[]');
      const completedMissions: string[] = JSON.parse(getNetstartItem('netstart_completed_missions') || '[]');
      const isMissionDone = completedMissions.some((m: string) => m.toLowerCase() === missionId.toLowerCase());
      const isSecDone = compSections.includes(currentSection);

      setClaimedDirectives(claimedList);

      if (isEarthLevel2) {
        const isTab1Done = !isReplayMode && (isMissionDone || completedGoals.includes(`${missionId}_sec0_goal1`) || completedGoals.includes(`${missionId}_goal_1`) || getNetstartItem(`netstart_earth2_tab1_complete_${missionId}`) === 'true');
        setIsEarth2Tab1Complete(Boolean(isTab1Done));
        const savedTab = getNetstartItem(`netstart_earth2_active_tab_${missionId}`);
        const effectiveTab = (savedTab === 'tab2' && isTab1Done) ? 'tab2' : 'tab1';
        earth2ActiveTabRef.current = effectiveTab;
        setEarth2ActiveTab(effectiveTab);
      } else if (isJupiterLevel2) {
        const isWave1Done = !isReplayMode && (isMissionDone || completedGoals.includes(`${missionId}_sec0_goal1`) || getNetstartItem(`netstart_jupiter2_wave1_complete_${missionId}`) === 'true' || getNetstartItem('netstart_jupiter2_wave1_complete') === 'true');
        const isWave2Done = !isReplayMode && (isMissionDone || completedGoals.includes(`${missionId}_sec0_goal2`) || getNetstartItem(`netstart_jupiter2_wave2_complete_${missionId}`) === 'true' || getNetstartItem('netstart_jupiter2_wave2_complete') === 'true');
        setIsJupiter2Wave1Complete(Boolean(isWave1Done));
        setIsJupiter2Wave2Complete(Boolean(isWave2Done));
        const savedWave = Number(getNetstartItem(`netstart_jupiter2_active_wave_${missionId}`) || getNetstartItem('netstart_jupiter2_active_wave'));
        let effectiveWave: Jupiter2Wave = 1;
        if (savedWave === 3 && (isWave2Done || isMissionDone)) effectiveWave = 3;
        else if (savedWave === 2 && (isWave1Done || isMissionDone)) effectiveWave = 2;
        jupiter2ActiveWaveRef.current = effectiveWave;
        setJupiter2ActiveWave(effectiveWave);
        jupiter2WorkspaceStates.current[1] = getNetstartItem(`netstart_jupiter2_wave_${missionId}_1`) || '';
        jupiter2WorkspaceStates.current[2] = getNetstartItem(`netstart_jupiter2_wave_${missionId}_2`) || '';
        jupiter2WorkspaceStates.current[3] = getNetstartItem(`netstart_jupiter2_wave_${missionId}_3`) || '';
      }

      const updated = activeSection.objectives.map(obj => {
        if (isEarthLevel1) {
          const secIdx = obj.id - 1; // goal 1 -> sec 0, goal 2 -> sec 1, goal 3 -> sec 2
          const key = `${missionId}_goal_${obj.id}`;
          const isClaimed = isReplayMode || isMissionDone || claimedList.includes(key);
          const isCompleted = isReplayMode || isMissionDone || compSections.includes(secIdx) || completedGoals.includes(key);
          return {
            ...obj,
            completed: isCompleted,
            isClaimed: isClaimed,
          };
        }

        const key = `${missionId}_sec${currentSection}_goal${obj.id}`;
        const isClaimed = isReplayMode || isMissionDone || claimedList.includes(key);
        let isCompleted = isReplayMode || isMissionDone || isSecDone || completedGoals.includes(key);
        if (isJupiterLevel2) {
          if (obj.id === 1 && (isMissionDone || getNetstartItem(`netstart_jupiter2_wave1_complete_${missionId}`) === 'true')) isCompleted = true;
          if (obj.id === 2 && (isMissionDone || getNetstartItem(`netstart_jupiter2_wave2_complete_${missionId}`) === 'true')) isCompleted = true;
          if (obj.id === 3 && (isMissionDone || isSecDone)) isCompleted = true;
        }
        return {
          ...obj,
          completed: isCompleted,
          isClaimed: isClaimed,
        };
      });
      setObjectives(updated);
    } catch (e) {
      setObjectives(activeSection.objectives.map(o => ({ ...o, completed: isReplayMode, isClaimed: isReplayMode })));
    }
  }, [currentSection, activeSection, missionId, getNetstartItem, isReplayMode, isEarthLevel1, isJupiterLevel2]);

  // Save handler for NavigationGuard and level exit
  const saveLevelWorkspace = useCallback(async () => {
    if (workspace.current && userId) {
      try {
        const xml = Blockly.Xml.workspaceToDom(workspace.current);
        const xmlText = Blockly.Xml.domToText(xml);

        let completedGoals: string[] = [];
        try {
          completedGoals = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
        } catch (e) { }

        const saveState = {
          missionId,
          sectionIndex: currentSection,
          xmlText,
          title: displayTitle,
          completedGoals,
          timestamp: Date.now()
        };
        if (isEarthLevel2) {
          const tabKey = earth2ActiveTabRef.current;
          earth2WorkspaceStates.current[tabKey] = xmlText;
          setNetstartItem(`netstart_earth2_tab_${missionId}_${tabKey}`, xmlText);
          setNetstartItem(`netstart_earth2_active_tab_${missionId}`, tabKey);
        } else if (isJupiterLevel2) {
          const waveKey = jupiter2ActiveWaveRef.current;
          jupiter2WorkspaceStates.current[waveKey] = xmlText;
          setNetstartItem(`netstart_jupiter2_wave_${missionId}_${waveKey}`, xmlText);
          setNetstartItem(`netstart_jupiter2_active_wave_${missionId}`, String(waveKey));
        } else if (!isVenusLevel3 && !isMercuryLevel3) {
          setNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`, xmlText);
          if (isJupiterLevel3) {
            setNetstartItem('netstart_saved_workspace_jupiter-3_0', xmlText);
            setNetstartItem('netstart_saved_workspace_java-3_0', xmlText);
          }
          if (isSaturnLevel3) {
            setNetstartItem('netstart_saved_workspace_saturn-3_0', xmlText);
            setNetstartItem('netstart_saved_workspace_cpp-3_0', xmlText);
          }
          if (isEarthLevel3) {
            setNetstartItem('netstart_saved_workspace_earth-3_0', xmlText);
            setNetstartItem('netstart_saved_workspace_python-3_0', xmlText);
          }
        }
        if (isVenusLevel3) {
          setNetstartItem(`netstart_venus3_tab_${missionId}_${venus3ActiveTab}`, xmlText);
          setNetstartItem(`netstart_venus3_styles_${missionId}`, JSON.stringify(venus3StylesRef.current));
          setNetstartItem(`netstart_venus3_active_tab_${missionId}`, venus3ActiveTab);
          venus3WorkspaceStates.current[venus3ActiveTab] = xmlText;
        }
        if (isMercuryLevel3) {
          const activeTab = mercury3ActiveTabRef.current;
          setNetstartItem(`netstart_mercury3_tab_${missionId}_${activeTab}`, xmlText);
          setNetstartItem(`netstart_mercury3_active_tab_${missionId}`, activeTab);
          mercury3WorkspaceStates.current[activeTab] = xmlText;
        }
        setNetstartItem('netstart_active_saved_level', JSON.stringify(saveState));
        setNetstartItem('netstart_active_level', JSON.stringify({
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
  }, [missionId, currentSection, displayTitle, isDaily, planetIcon, userId, getNetstartItem, setNetstartItem]);

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

  // Click outside listener for Objectives & Instructions Dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsObjectivesOpen(false);
      }
      if (instructionsDropdownRef.current && !instructionsDropdownRef.current.contains(event.target as Node)) {
        setIsInstructionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // Helper to ensure the workspace restores saved workspace XML or resets with default Start block
  const resetWorkspaceToDefaultStart = useCallback((ws: Blockly.WorkspaceSvg, forceDefault = false, sectionOverride?: number) => {
    const activeSec = typeof sectionOverride === 'number' ? sectionOverride : currentSection;
    try {
      isRestoringWorkspaceRef.current = true;
      ws.clear();
      if (isMarsLevel2) {
        lastMarsBillboardKeyRef.current = '__RESET__';
      }

      if (forceDefault) {
        try {
          removeNetstartItem(`netstart_saved_workspace_${missionId}_${activeSec}`);
          if (isMercuryLevel3) {
            removeNetstartItem(`netstart_mercury3_tab_${missionId}_${mercury3ActiveTabRef.current}`);
            if (mercury3WorkspaceStates.current) {
              mercury3WorkspaceStates.current[mercury3ActiveTabRef.current] = '';
            }
          }
          if (isVenusLevel3) {
            removeNetstartItem(`netstart_venus3_tab_${missionId}_${venus3ActiveTab}`);
            if (venus3WorkspaceStates.current) {
              venus3WorkspaceStates.current[venus3ActiveTab] = '';
            }
            if (venus3ActiveTab === 'main') {
              setVenus3LinkedStylesheets([]);
              setVenus3InlineStyles({});
              venus3InlineStylesRef.current = {};
            } else {
              delete venus3StylesRef.current[venus3ActiveTab];
              setVenus3SectorStyles({ ...venus3StylesRef.current });
              setNetstartItem(`netstart_venus3_styles_${missionId}`, JSON.stringify(venus3StylesRef.current));
            }
          }
          if (isJupiterLevel3) {
            const jupiter3Aliases = [missionId, 'jupiter-3', 'java-3'].filter(Boolean);
            jupiter3Aliases.forEach(id => {
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
              removeNetstartItem(`netstart_completed_goals_${id}`);
            });
            setJupiter3Blueprint(INITIAL_PLAYER_BLUEPRINT);
            setJupiter3ResetKey(prev => prev + 1);
          }
          if (isSaturnLevel3) {
            const saturn3Aliases = [missionId, 'saturn-3', 'cpp-3'].filter(Boolean);
            saturn3Aliases.forEach(id => {
              removeNetstartItem(`netstart_saved_workspace_${id}_0`);
              removeNetstartItem(`netstart_completed_goals_${id}`);
            });
            setSaturn3Payload(INITIAL_SATURN_3_PAYLOAD);
            setSaturn3ResetKey(prev => prev + 1);
          }
        } catch (e) { }
      }

      let savedXml = !forceDefault ? (
        isMercuryLevel3
          ? (mercury3WorkspaceStates.current[mercury3ActiveTabRef.current] || getNetstartItem(`netstart_mercury3_tab_${missionId}_${mercury3ActiveTabRef.current}`) || '')
          : isVenusLevel3
          ? (venus3WorkspaceStates.current[venus3ActiveTab] || getNetstartItem(`netstart_venus3_tab_${missionId}_${venus3ActiveTab}`) || '')
          : isEarthLevel2
            ? (earth2WorkspaceStates.current[earth2ActiveTabRef.current] || getNetstartItem(`netstart_earth2_tab_${missionId}_${earth2ActiveTabRef.current}`) || '')
            : isJupiterLevel2
              ? (jupiter2WorkspaceStates.current[jupiter2ActiveWaveRef.current] || getNetstartItem(`netstart_jupiter2_wave_${missionId}_${jupiter2ActiveWaveRef.current}`) || '')
              : isSaturnLevel3
                ? (getNetstartItem(`netstart_saved_workspace_${missionId}_${activeSec}`) || getNetstartItem('netstart_saved_workspace_saturn-3_0') || getNetstartItem('netstart_saved_workspace_cpp-3_0') || '')
                : isEarthLevel3
                  ? (getNetstartItem(`netstart_saved_workspace_${missionId}_${activeSec}`) || getNetstartItem('netstart_saved_workspace_earth-3_0') || getNetstartItem('netstart_saved_workspace_python-3_0') || '')
                  : (getNetstartItem(`netstart_saved_workspace_${missionId}_${activeSec}`) || '')
      ) : '';

      if (isEarthLevel2 && savedXml) {
        if (earth2ActiveTabRef.current === 'tab1' && savedXml.includes('earth2_solar_system_list')) {
          setNetstartItem(`netstart_earth2_tab_${missionId}_tab2`, savedXml);
          earth2WorkspaceStates.current['tab2'] = savedXml;
          savedXml = earth2WorkspaceStates.current['tab1'] || '';
          removeNetstartItem(`netstart_earth2_tab_${missionId}_tab1`);
        } else if (earth2ActiveTabRef.current === 'tab2' && (savedXml.includes('earth2_planet_dict') || savedXml.includes('earth2_val_desc'))) {
          setNetstartItem(`netstart_earth2_tab_${missionId}_tab1`, savedXml);
          earth2WorkspaceStates.current['tab1'] = savedXml;
          savedXml = earth2WorkspaceStates.current['tab2'] || '';
          removeNetstartItem(`netstart_earth2_tab_${missionId}_tab2`);
        }
      }

      if (isEarthLevel2 && forceDefault) {
        earth2WorkspaceStates.current = { tab1: '', tab2: '' };
        lastEarth2ToolboxKeyRef.current = '';
        try {
          const earth2Aliases = [missionId, 'earth-2', 'python-2'].filter(Boolean);
          earth2Aliases.forEach(id => {
            removeNetstartItem(`netstart_earth2_tab_${id}_tab1`);
            removeNetstartItem(`netstart_earth2_tab_${id}_tab2`);
            removeNetstartItem(`netstart_earth2_active_tab_${id}`);
            removeNetstartItem(`netstart_earth2_tab1_complete_${id}`);
            removeNetstartItem(`netstart_saved_workspace_${id}_0`);
          });
        } catch (e) { }
      }

      if (isJupiterLevel2 && forceDefault) {
        jupiter2WorkspaceStates.current = { 1: '', 2: '', 3: '' };
        try {
          const jupiter2Aliases = [missionId, 'jupiter-2', 'java-2'].filter(Boolean);
          jupiter2Aliases.forEach(id => {
            removeNetstartItem(`netstart_jupiter2_wave_${id}_1`);
            removeNetstartItem(`netstart_jupiter2_wave_${id}_2`);
            removeNetstartItem(`netstart_jupiter2_wave_${id}_3`);
            removeNetstartItem(`netstart_jupiter2_active_wave_${id}`);
            removeNetstartItem(`netstart_jupiter2_wave1_complete_${id}`);
            removeNetstartItem(`netstart_jupiter2_wave2_complete_${id}`);
          });
        } catch (e) { }
      }

      if ((isVenusLevel3 || isMercuryLevel1 || isMercuryLevel2 || isMercuryLevel3 || isJupiterLevel1 || isJupiterLevel2 || isJupiterLevel3 || isSaturnLevel1 || isSaturnLevel2 || isSaturnLevel3 || isEarthLevel1 || isEarthLevel2 || isEarthLevel3) && savedXml) {
        savedXml = savedXml
          .replace(/<block[^>]*type="event_start"[^>]*>[\s\S]*?<\/block>/gi, '')
          .replace(/<block[^>]*type="event_start"[^>]*\/>/gi, '');
      }

      if (isSaturnLevel1 && savedXml) {
        // Discard old legacy placeholder blocks so workspace starts completely clean with dotted grid
        if (
          savedXml.includes('saturn_row_setup') ||
          savedXml.includes('saturn_declare') ||
          savedXml.includes('saturn_row_catch') ||
          savedXml.includes('saturn_row_blast')
        ) {
          savedXml = '';
        }
      }

      if (isEarthLevel1 && savedXml) {
        // Discard legacy auto-generated standalone earth_data_block if no operations are attached
        if (
          savedXml.includes('id="earth_data_block"') &&
          !savedXml.includes('earth_python_slice') &&
          !savedXml.includes('earth_python_replace') &&
          !savedXml.includes('earth_python_split') &&
          !savedXml.includes('earth_python_print') &&
          !savedXml.includes('<next>')
        ) {
          savedXml = '';
        }
      }

      let loaded = false;
      if (
        savedXml &&
        savedXml.trim() &&
        savedXml !== '<xml xmlns="https://developers.google.com/blockly/xml"></xml>' &&
        savedXml !== '<xml xmlns="https://developers.google.com/blockly/xml"/>'
      ) {
        try {
          const dom = Blockly.utils.xml.textToDom(savedXml);
          Blockly.Xml.domToWorkspace(dom, ws);
          Blockly.svgResize(ws);
          loaded = true;
        } catch (xmlErr) {
          console.warn("Could not load saved workspace XML, falling back to default:", xmlErr);
        }
      }

      if (!loaded) {
        if (isVenusLevel3 && venus3ActiveTab === 'main') {
          const defaultMainXml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="venus3_html_head" x="50" y="50"></block></xml>';
          const dom = Blockly.utils.xml.textToDom(defaultMainXml);
          Blockly.Xml.domToWorkspace(dom, ws);
          Blockly.svgResize(ws);
        } else if (isSaturnLevel1) {
          const dom = Blockly.utils.xml.textToDom(getSaturnLevel1DefaultWorkspaceXml());
          Blockly.Xml.domToWorkspace(dom, ws);
          Blockly.svgResize(ws);
        } else if (isSaturnLevel2) {
          const dom = Blockly.utils.xml.textToDom(getSaturnLevel2DefaultWorkspaceXml());
          Blockly.Xml.domToWorkspace(dom, ws);
          Blockly.svgResize(ws);
        } else if (isSaturnLevel3) {
          try {
            const dom = Blockly.utils.xml.textToDom(SATURN_LEVEL_3_STARTER_XML);
            Blockly.Xml.domToWorkspace(dom, ws);
            Blockly.svgResize(ws);
            loaded = true;
          } catch (e) {}
        } else if (isEarthLevel2 && earth2ActiveTabRef.current === 'tab2') {
          const defaultTab2Xml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="earth2_solar_system_list" x="50" y="50" deletable="false"></block></xml>';
          try {
            const dom = Blockly.utils.xml.textToDom(defaultTab2Xml);
            Blockly.Xml.domToWorkspace(dom, ws);
            Blockly.svgResize(ws);
            loaded = true;
          } catch (e) {}
        } else if (isJupiterLevel3) {
          try {
            const dom = Blockly.utils.xml.textToDom(JUPITER_LEVEL_3_STARTER_XML);
            Blockly.Xml.domToWorkspace(dom, ws);
            Blockly.svgResize(ws);
            loaded = true;
          } catch (e) {}
        } else if (isEarthLevel1 || isEarthLevel2 || isEarthLevel3 || isMarsLevel1 || isMarsLevel2 || isMarsLevel3 || isVenusLevel1 || isVenusLevel2 || isVenusLevel3 || isMercuryLevel1 || isMercuryLevel2 || isMercuryLevel3 || isJupiterLevel1 || isJupiterLevel2) {
          Blockly.svgResize(ws);
        } else {
          const xmlText = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="event_start" id="start_block" x="40" y="40" deletable="true" movable="true"></block></xml>';
          const dom = Blockly.utils.xml.textToDom(xmlText);
          Blockly.Xml.domToWorkspace(dom, ws);
          Blockly.svgResize(ws);
        }
      }

      if (isVenusLevel1 || isVenusLevel2 || isMercuryLevel1 || isMercuryLevel2 || isMercuryLevel3 || isJupiterLevel1 || isJupiterLevel2 || isJupiterLevel3 || isSaturnLevel1 || isSaturnLevel2 || isSaturnLevel3 || isEarthLevel1 || isEarthLevel2 || isEarthLevel3) {
        ws.getAllBlocks(false).forEach(b => {
          if (b.type === 'event_start') {
            b.dispose(true);
          }
        });
      }

      // Code generator & syntax updates
      if (isMarsLevel1) {
        const parseRes = parseWorkspaceHtml(ws);
        setMarsParsedElements(parseRes.elements);
        setMarsValidation(parseRes.validation);
        const code = javascriptGenerator.workspaceToCode(ws);
        setPlainEnglishCode(code);
        setJsCode(code);
      } else if (isMarsLevel2) {
        const parseRes = parseMarsLevel2Workspace(ws);
        setMars2Validation(parseRes.validation);
        setPlainEnglishCode(parseRes.htmlCode);
        setJsCode(parseRes.htmlCode);

        const isSecDone = completedSections.includes(activeSec);
        if (!isSecDone) {
          const captionCount = parseRes.validation.customizations?.filter(c => c.caption || c.headline)?.length || 0;
          const allPopulated = parseRes.validation.totalContainers === 5 && parseRes.validation.assignedImages?.every(img => img !== null) && !parseRes.validation.hasErrors;
          const obj1Met = captionCount >= 2;
          const obj2Met = allPopulated;
          const obj3Met = !!parseRes.validation.isAllMatched;

          setObjectives(prev => prev.map(obj => {
            if (obj.id === 1) return { ...obj, completed: obj1Met };
            if (obj.id === 2) return { ...obj, completed: obj2Met };
            if (obj.id === 3) return { ...obj, completed: obj3Met };
            return obj;
          }));
        }
      } else if (isMarsLevel3) {
        const parseRes = parseMarsLevel3Workspace(ws);
        setMars3Validation(parseRes.validation);
        setPlainEnglishCode(parseRes.htmlCode);
        setJsCode(parseRes.htmlCode);

        const isSecDone = completedSections.includes(activeSec);
        if (!isSecDone) {
          const obj1Met = !!parseRes.validation.hasTitle;
          const obj2Met = mars3StatusOpened;
          const obj3Met = mars3MercuryPinged && mars3VenusPinged;

          setObjectives(prev => prev.map(obj => {
            if (obj.id === 1) return { ...obj, completed: obj1Met };
            if (obj.id === 2) return { ...obj, completed: obj2Met };
            if (obj.id === 3) return { ...obj, completed: obj3Met };
            return obj;
          }));
        }
      } else if (isVenusLevel1) {
        const parseRes = parseVenusLevel1Workspace(ws);
        setVenus1Validation(parseRes.validation);
        setPlainEnglishCode(parseRes.cssCode);
        setJsCode(parseRes.cssCode);

        const isSecDone = completedSections.includes(activeSec);
        if (!isSecDone) {
          const obj1Met = parseRes.validation.totalStyled >= 3;
          const obj2Met = !!parseRes.validation.hasAnyBorder;
          const obj3Met = !!parseRes.validation.captionValid;

          setObjectives(prev => prev.map(obj => {
            if (obj.id === 1) return { ...obj, completed: obj1Met };
            if (obj.id === 2) return { ...obj, completed: obj2Met };
            if (obj.id === 3) return { ...obj, completed: obj3Met };
            return obj;
          }));
        }
      } else if (isVenusLevel2) {
        const parseRes = parseVenusLevel2Workspace(ws, venus2ActivePanel, venus2SolvedPanels);
        setVenus2Validation(parseRes.validation);
        setPlainEnglishCode(parseRes.cssCode);
        setJsCode(parseRes.cssCode);

        const isSecDone = completedSections.includes(activeSec);
        if (!isSecDone) {
          const allBlocks = ws.getAllBlocks(false);
          const hasTarget = allBlocks.some(b => b.type === 'venus2_target_panel');
          const hasFormat = allBlocks.some(b => b.type === 'venus2_style_display');
          const hasHorizontal = allBlocks.some(b => b.type === 'venus2_style_justify');
          const hasVertical = allBlocks.some(b => b.type === 'venus2_style_align');
          const allPanelsDone = venus2SolvedPanels[1] && venus2SolvedPanels[2] && venus2SolvedPanels[3] && venus2SolvedPanels[4] && venus2SolvedPanels[5];

          const obj1Met = hasTarget && hasFormat;
          const obj2Met = hasHorizontal && hasVertical;
          const obj3Met = allPanelsDone || parseRes.validation.allSolved;

          setObjectives(prev => prev.map(obj => {
            if (obj.completed || obj.isClaimed) return obj;
            if (obj.id === 1) return { ...obj, completed: obj1Met };
            if (obj.id === 2) return { ...obj, completed: obj2Met };
            if (obj.id === 3) return { ...obj, completed: obj3Met };
            return obj;
          }));
        }
      } else if (isVenusLevel3) {
        const parseRes = parseVenusLevel3Workspace(ws, venus3ActiveTab);
        if (venus3ActiveTab !== 'main') {
          venus3StylesRef.current[venus3ActiveTab] = parseRes.styles;
          setVenus3SectorStyles({ ...venus3StylesRef.current });
        } else {
          setVenus3LinkedStylesheets(parseRes.linkedStylesheets);
          if (parseRes.inlineStyles) {
            setVenus3InlineStyles(parseRes.inlineStyles);
            venus3InlineStylesRef.current = parseRes.inlineStyles;
          }
        }
        setPlainEnglishCode(parseRes.code);
        setJsCode(parseRes.code);

        const isSecDone = completedSections.includes(activeSec);
        if (!isSecDone) {
          const linked = venus3ActiveTab === 'main' ? parseRes.linkedStylesheets : venus3LinkedStylesheets;
          const currInline = venus3ActiveTab === 'main' && parseRes.inlineStyles ? parseRes.inlineStyles : venus3InlineStylesRef.current;
          const alphaHasStyles = (venus3StylesRef.current.alpha && Object.keys(venus3StylesRef.current.alpha).length >= 1) || (venus3ActiveTab === 'alpha' && Object.keys(parseRes.styles).length >= 1);
          const betaHasStyles = (venus3StylesRef.current.beta && Object.keys(venus3StylesRef.current.beta).length >= 1) || (venus3ActiveTab === 'beta' && Object.keys(parseRes.styles).length >= 1);
          const gammaHasStyles = (venus3StylesRef.current.gamma && Object.keys(venus3StylesRef.current.gamma).length >= 1) || (venus3ActiveTab === 'gamma' && Object.keys(parseRes.styles).length >= 1);

          const obj1Met = Boolean(alphaHasStyles);
          const obj2Met = Boolean(betaHasStyles);
          const obj3Met = Boolean(gammaHasStyles);

          setObjectives(prev => prev.map(obj => {
            if (obj.isClaimed || isReplayMode) return obj;
            if (obj.id === 1) return { ...obj, completed: obj1Met };
            if (obj.id === 2) return { ...obj, completed: obj2Met };
            if (obj.id === 3) return { ...obj, completed: obj3Met };
            return obj;
          }));
        }

        const allBlocks = ws.getAllBlocks(false);
        const foreignBlocks: Blockly.Block[] = [];
        for (const b of allBlocks) {
          if (!isBlockAllowedInTab(b.type, venus3ActiveTab)) {
            foreignBlocks.push(b);
          }
        }
        if (foreignBlocks.length > 0) {
          foreignBlocks.forEach(fb => fb.dispose(false));
        }

        const validBlocks = ws.getAllBlocks(false);
        const seenTypes = new Set<string>();
        if (venus3ActiveTab === 'main') {
          for (const b of validBlocks) {
            if (b.type === 'venus3_inline_tower' || b.type === 'venus3_inline_background' || b.type === 'venus3_html_head') {
              seenTypes.add(b.type);
            }
          }
        } else {
          for (const b of validBlocks) {
            if (b.type && b.type.startsWith('venus3_target_')) {
              seenTypes.add(b.type);
            }
          }
        }
        try {
          ws.updateToolbox(getVenusLevel3Toolbox(venus3ActiveTab, seenTypes));
        } catch (e) { }
      } else if (isMercuryLevel1) {
        const parseRes = parseMercuryLevel1Workspace(ws);
        setPlainEnglishCode(parseRes.jsCode);
        setJsCode(parseRes.jsCode);
        setMercury1Validation(INITIAL_MERCURY_LEVEL_1_VALIDATION);
      } else if (isMercuryLevel2) {
        const parseRes = parseMercuryLevel2Workspace(ws);
        setPlainEnglishCode(parseRes.jsCode);
        setJsCode(parseRes.jsCode);
        setMercury2Validation(INITIAL_MERCURY_LEVEL_2_VALIDATION);
      } else if (isJupiterLevel1) {
        const parseRes = parseJupiterLevel1Workspace(ws);
        setPlainEnglishCode(parseRes.javaCode);
        setJsCode(parseRes.javaCode);
        setJupiter1Validation(INITIAL_JUPITER_LEVEL_1_VALIDATION);
      } else if (isJupiterLevel2) {
        const pVal = parseJupiterLevel2Workspace(ws);
        setJupiter2Validation(pVal);
        setPlainEnglishCode(pVal.javaCode);
        setJsCode(pVal.javaCode);

        const isSecDone = completedSections.includes(currentSection);
        if (!isSecDone) {
          setObjectives(prev => prev.map(obj => {
            if (obj.isClaimed || isReplayMode) return obj;
            if (obj.id === 1) return { ...obj, completed: isJupiter2Wave1Complete };
            if (obj.id === 2) return { ...obj, completed: isJupiter2Wave2Complete };
            if (obj.id === 3) return { ...obj, completed: isSecDone };
            return obj;
          }));
        }
      } else if (isJupiterLevel3) {
        const pVal = parseJupiterLevel3Workspace(ws);
        setPlainEnglishCode(pVal.rawJavaCode);
        setJsCode(pVal.rawJavaCode);
        setJupiter3Blueprint(pVal);

        const isSecDone = completedSections.includes(activeSec);
        const adminCls = pVal.classes['AdminProfile'];
        const techCls = pVal.classes['TechProfile'];
        const secCls = pVal.classes['SecurityProfile'];
        const visitorCls = pVal.classes['VisitorProfile'];

        const areAllProfilesConfigured = Boolean(
          adminCls && (adminCls.clearanceLevel || adminCls.hasPrivateClearance) && adminCls.role && (adminCls.methods?.length || 0) > 0 &&
          techCls && (techCls.clearanceLevel || techCls.hasPrivateClearance) && techCls.role && (techCls.methods?.length || 0) > 0 &&
          secCls && (secCls.clearanceLevel || secCls.hasPrivateClearance) && secCls.role && (secCls.methods?.length || 0) > 0 &&
          visitorCls && (visitorCls.clearanceLevel || visitorCls.hasPrivateClearance) && visitorCls.role && (visitorCls.methods?.length || 0) > 0
        );

        if (!isSecDone) {
          setObjectives(prev => prev.map(obj => {
            if (obj.isClaimed || isReplayMode) return obj;
            if (obj.id === 2) return { ...obj, completed: areAllProfilesConfigured };
            if (obj.id === 3) return { ...obj, completed: isSecDone };
            return obj;
          }));
        }
      } else if (isSaturnLevel1) {
        const { state: pState, validation: pVal } = parseSaturnLevel1Workspace(ws, saturnWave);
        const code = pVal.cppCode || generateSaturnCppCode(pState, saturnWave);
        setPlainEnglishCode(code);
        setJsCode(code);
        setSaturnWorkspaceState(pState);
        setSaturn1Validation(pVal);

        const isSecDone = completedSections.includes(currentSection);
        if (!isSecDone) {
          setObjectives(prev => prev.map(obj => {
            if (obj.isClaimed || isReplayMode) return obj;
            if (obj.id === 1) return { ...obj, completed: Boolean(pVal.hasStart && pVal.hasEnd) };
            if (obj.id === 2) return { ...obj, completed: Boolean(pVal.hasStringStorage && pVal.hasIntStorage && pVal.hasBoolStorage && pVal.hasLoop && pVal.hasCin && pVal.hasCout) };
            if (obj.id === 3) return { ...obj, completed: saturnIsWon || isSecDone };
            return obj;
          }));
        }
      } else if (isSaturnLevel2) {
        const pVal = parseSaturnLevel2Workspace(ws);
        setSaturn2Validation(pVal);
        setPlainEnglishCode(pVal.cppCode);
        setJsCode(pVal.cppCode);

        const isSecDone = completedSections.includes(currentSection);
        if (!isSecDone) {
          setObjectives(prev => prev.map(obj => {
            if (obj.isClaimed || isReplayMode) return obj;
            if (obj.id === 1) return { ...obj, completed: Boolean(pVal.hasStart && pVal.hasEnd) };
            if (obj.id === 2) return { ...obj, completed: Boolean(pVal.hasShield || pVal.hasGreetUfo || saturn2ShieldActivated || saturn2UfoGreeted) };
            if (obj.id === 3) return { ...obj, completed: isSecDone };
            return obj;
          }));
        }
      } else if (isSaturnLevel3) {
        const pVal = parseSaturnLevel3Workspace(ws);
        setSaturn3Payload(pVal);
        setPlainEnglishCode(pVal.rawCppCode);
        setJsCode(pVal.rawCppCode);

        const isSecDone = completedSections.includes(currentSection);
        const hasAllPointers = pVal.declaredPointers.has('sensorPtr') && pVal.declaredPointers.has('debrisPtr') && pVal.declaredPointers.has('shieldPtr');
        const hasAllAllocations = 
          pVal.steps.some(s => s.type === 'ALLOCATE' && s.pointer === 'sensorPtr') &&
          pVal.steps.some(s => s.type === 'ALLOCATE' && s.pointer === 'debrisPtr') &&
          pVal.steps.some(s => s.type === 'ALLOCATE' && s.pointer === 'shieldPtr');
        const hasAllRuns = 
          pVal.steps.some(s => s.type === 'RUN_TASK' && s.task === 'RUN_SENSORS') &&
          pVal.steps.some(s => s.type === 'RUN_TASK' && s.task === 'RUN_DEBRIS') &&
          pVal.steps.some(s => s.type === 'RUN_TASK' && s.task === 'RUN_SHIELDS');

        if (!isSecDone) {
          setObjectives(prev => prev.map(obj => {
            if (obj.isClaimed || isReplayMode) return obj;
            if (obj.id === 2) return { ...obj, completed: Boolean((hasAllPointers && hasAllAllocations) || (hasAllAllocations && hasAllRuns)) };
            if (obj.id === 3) return { ...obj, completed: isSecDone };
            return obj;
          }));
        }
      } else if (isEarthLevel1) {
        const { state: pState, validation: pVal } = parseEarthLevel1Workspace(ws, currentSection);
        const code = pVal.pythonCode || generateEarthPythonCode(pState, currentSection);
        setPlainEnglishCode(code);
        setJsCode(code);
        setEarthWorkspaceState(pState);
        setEarth1Validation(pVal);

        setObjectives(prev => prev.map(obj => {
          const secIdx = obj.id - 1;
          const isDone = completedSections.includes(secIdx) || obj.isClaimed || isReplayMode;
          return { ...obj, completed: isDone };
        }));
      } else if (isEarthLevel2) {
        if (earth2ActiveTab === 'tab1') {
          const pVal = parseEarth2Tab1Workspace(ws);
          setEarth2Tab1Validation(pVal);
          setPlainEnglishCode(pVal.pythonCode);
          setJsCode(pVal.pythonCode);
        } else {
          const pVal = parseEarth2Tab2Workspace(ws);
          setEarth2Tab2Validation(pVal);
          setPlainEnglishCode(pVal.pythonCode);
          setJsCode(pVal.pythonCode);
        }
      } else if (isEarthLevel3) {
        const pyCode = javascriptGenerator.workspaceToCode(ws);
        const audit = auditEarth3Workspace(ws, pyCode);
        setEarth3Audit(audit);
        setEarth3Code(pyCode);
        setPlainEnglishCode(pyCode);
        setJsCode(pyCode);

        const isSecDone = completedSections.includes(activeSec);
        if (!isSecDone) {
          setObjectives(prev => prev.map(obj => {
            if (obj.isClaimed || isReplayMode) return obj;
            if (obj.id === 1) return { ...obj, completed: audit.completedObjectives[0] };
            if (obj.id === 2) return { ...obj, completed: audit.completedObjectives[1] };
            if (obj.id === 3) return { ...obj, completed: isSecDone };
            return obj;
          }));
        }
      } else {
        const code = javascriptGenerator.workspaceToCode(ws);
        setJsCode(code);
        const english = generatePlainEnglishPseudocode(ws);
        setPlainEnglishCode(english);
      }
    } catch (e) {
      console.warn("Could not reset workspace:", e);
    } finally {
      isRestoringWorkspaceRef.current = false;
    }
  }, [isMarsLevel1, isMarsLevel2, isMarsLevel3, isVenusLevel1, isVenusLevel2, isVenusLevel3, isMercuryLevel1, isMercuryLevel2, isJupiterLevel1, isJupiterLevel2, isJupiterLevel3, isJupiter2Wave1Complete, isJupiter2Wave2Complete, isSaturnLevel1, isSaturnLevel2, isSaturnLevel3, isEarthLevel1, isEarthLevel2, isEarthLevel3, isReplayMode, saturnWave, venus2ActivePanel, venus2SolvedPanels, venus3ActiveTab, venus3SolvedSectors, currentSection, missionId, userId, completedSections, getNetstartItem, removeNetstartItem]);

  const hasRestoredWorkspace = useRef<string | null>(null);

  // Re-hydrate workspace blocks once userId and section hydration complete (only once per section)
  useEffect(() => {
    const key = `${userId}_${missionId}_${currentSection}`;
    if (workspace.current && userId && hasHydratedSavedSection.current && hasRestoredWorkspace.current !== key) {
      hasRestoredWorkspace.current = key;
      resetWorkspaceToDefaultStart(workspace.current);
    }
  }, [userId, missionId, currentSection, resetWorkspaceToDefaultStart]);

  // Helper to serialize ONLY the specific block without any connected blocks below it (<next>) or nested inside it (<statement>)
  const serializeSingleBlockToXml = useCallback((block: Blockly.BlockSvg): string | null => {
    try {
      const xmlDom = Blockly.Xml.blockToDom(block, true) as Element;
      // Strip any blocks below it (<next>) and nested statement blocks (<statement>)
      for (let i = xmlDom.children.length - 1; i >= 0; i--) {
        const child = xmlDom.children[i];
        const tag = child.tagName.toLowerCase();
        if (tag === 'next' || tag === 'statement') {
          xmlDom.removeChild(child);
        }
      }
      const stripIds = (el: Element) => {
        el.removeAttribute('id');
        for (let i = 0; i < el.children.length; i++) {
          stripIds(el.children[i]);
        }
      };
      stripIds(xmlDom);
      return Blockly.Xml.domToText(xmlDom);
    } catch (err) {
      console.error("serializeSingleBlockToXml failed:", err);
      return null;
    }
  }, []);

  // Copy currently selected block ONLY (never copying blocks below it)
  const handleCopy = useCallback(() => {
    if (!workspace.current) return;
    const ws = workspace.current;
    if (ws.isFlyout) return;

    let selected: Blockly.BlockSvg | null = (Blockly.common?.getSelected ? Blockly.common.getSelected() : (Blockly as any).selected) as Blockly.BlockSvg | null;
    if (!selected) {
      const topBlocks = ws.getTopBlocks(true) as Blockly.BlockSvg[];
      if (topBlocks.length > 0) {
        selected = topBlocks[0];
      }
    }

    if (!selected) {
      showToast("No block selected to copy! Click a block first.");
      return;
    }

    const xmlText = serializeSingleBlockToXml(selected);
    if (xmlText) {
      setClipboardXml(xmlText);
      const blockName = selected.type.replace(/_/g, ' ').toUpperCase();
      showToast(`Copied [${blockName}] block`);
    }
  }, [serializeSingleBlockToXml]);

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

      if (isVenusLevel3) {
        const blockTypes: string[] = [];
        const findTypes = (el: Element) => {
          const t = el.getAttribute('type');
          if (t) blockTypes.push(t);
          for (let i = 0; i < el.children.length; i++) {
            findTypes(el.children[i]);
          }
        };
        findTypes(dom);
        const foreignType = blockTypes.find(t => !isBlockAllowedInTab(t, venus3ActiveTab));
        if (foreignType) {
          const tabName = venus3ActiveTab === 'main' ? 'index.html' : `${venus3ActiveTab}.css`;
          showToast(`Cannot paste blocks from another sector into ${tabName}! Each sector has its own target selectors.`, { duration: 4000 });
          return;
        }
      }

      // Clean all IDs recursively so Blockly creates brand new instances
      const stripIds = (el: Element) => {
        el.removeAttribute('id');
        for (let i = 0; i < el.children.length; i++) {
          stripIds(el.children[i]);
        }
      };
      stripIds(dom);

      // Defensively strip any <next> and <statement> so it NEVER pastes blocks below
      for (let i = dom.children.length - 1; i >= 0; i--) {
        const child = dom.children[i];
        const tag = child.tagName.toLowerCase();
        if (tag === 'next' || tag === 'statement') {
          dom.removeChild(child);
        }
      }

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
      }
    } catch (err) {
      console.error("Paste failed:", err);
    }
  }, [clipboardXml]);

  // Duplicate currently selected block ONLY (never duplicating blocks below it)
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
      showToast("Select a block first to duplicate!");
      return;
    }

    if (selected.isInFlyout || selected.workspace?.isFlyout) {
      showToast("Blocks inside the toolbox cannot be duplicated directly! Place into workspace first.");
      return;
    }

    const xmlText = serializeSingleBlockToXml(selected);
    if (!xmlText) return;

    try {
      const dom = Blockly.utils.xml.textToDom(xmlText) as Element;
      const origPos = selected.getRelativeToSurfaceXY();
      const newBlock = Blockly.Xml.domToBlock(dom, ws) as Blockly.BlockSvg;
      if (newBlock) {
        newBlock.moveBy(origPos.x + 35, origPos.y + 35);
        newBlock.initSvg();
        newBlock.render();
        if (newBlock.select) newBlock.select();
        const blockName = selected.type.replace(/_/g, ' ').toUpperCase();
        showToast(`Duplicated [${blockName}] block`);
      }
    } catch (err) {
      console.error("Duplicate failed:", err);
    }
  }, [serializeSingleBlockToXml]);

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
        'netstart_block_collapse_expand',
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
          const xmlText = serializeSingleBlockToXml(block);
          if (!xmlText) return;
          try {
            const dom = Blockly.utils.xml.textToDom(xmlText) as Element;
            const origPos = block.getRelativeToSurfaceXY();
            const newBlock = Blockly.Xml.domToBlock(dom, ws) as Blockly.BlockSvg;
            if (newBlock) {
              newBlock.moveBy(origPos.x + 35, origPos.y + 35);
              newBlock.initSvg();
              newBlock.render();
              if (newBlock.select) newBlock.select();
              const blockName = block.type.replace(/_/g, ' ').toUpperCase();
              showToast(`Duplicated [${blockName}] block`);
            }
          } catch (e) {
            console.error('Duplicate failed:', e);
          }
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        id: 'netstart_block_duplicate',
        weight: 1,
      });

      // 1b. Block: Minimize / Expand Block (per-block toggle)
      registry.register({
        displayText: (scope) => {
          const block = scope.block as Blockly.BlockSvg;
          if (block && typeof block.isCollapsed === 'function' && block.isCollapsed()) {
            return 'Expand Block';
          }
          return 'Minimize Block';
        },
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
          block.setCollapsed(!block.isCollapsed());
        },
        scopeType: Blockly.ContextMenuRegistry.ScopeType.BLOCK,
        id: 'netstart_block_collapse_expand',
        weight: 1.5,
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
          const xmlText = serializeSingleBlockToXml(block);
          if (xmlText) {
            setClipboardXml(xmlText);
            const blockName = block.type.replace(/_/g, ' ').toUpperCase();
            showToast(`Copied [${blockName}] block`);
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
            for (let i = dom.children.length - 1; i >= 0; i--) {
              const child = dom.children[i];
              const tag = child.tagName.toLowerCase();
              if (tag === 'next' || tag === 'statement') {
                dom.removeChild(child);
              }
            }
            const newBlock = Blockly.Xml.domToBlock(dom, ws) as Blockly.BlockSvg;
            if (newBlock) {
              const origPos = scope.block.getRelativeToSurfaceXY();
              newBlock.moveBy(origPos.x + 35, origPos.y + 35);
              newBlock.initSvg();
              newBlock.render();
              if (newBlock.select) newBlock.select();
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
            showToast(`Deleted [${blockName}]`, {
              onUndo: () => {
                if (workspace.current) workspace.current.undo(false);
              },
              duration: 7000,
            });
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
            for (let i = dom.children.length - 1; i >= 0; i--) {
              const child = dom.children[i];
              const tag = child.tagName.toLowerCase();
              if (tag === 'next' || tag === 'statement') {
                dom.removeChild(child);
              }
            }
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
            try {
              removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
            } catch (e) { }
            resetWorkspaceToDefaultStart(scope.workspace as Blockly.WorkspaceSvg, true);
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

  // Global Keyboard Shortcuts for Copy, Paste, and Duplicate
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
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleCopy, handlePaste, handleDuplicate]);

  // XP Guardrail: Only awards XP if !objective.isClaimed
  const awardDirectiveXp = useCallback((goalId: number) => {
    if (isDemoModeActive()) return false;
    const key = isEarthLevel1
      ? `${missionId}_goal_${goalId}`
      : `${missionId}_sec${currentSection}_goal${goalId}`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (claimedList.includes(key)) {
      return false; // Explicitly bypass XP payout
    }

    addXp(XP_REWARDS.CAMPAIGN_GOAL, `Directive ${goalId}`);
    claimedList.push(key);
    try {
      setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
    } catch (e) { }
    return true;
  }, [addXp, missionId, currentSection, getNetstartItem, setNetstartItem, userId, isEarthLevel1]);

  const markObjectiveComplete = useCallback((id: number) => {
    let shouldAward = false;
    const goalKey = isEarthLevel1
      ? `${missionId}_goal_${id}`
      : `${missionId}_sec${currentSection}_goal${id}`;

    // Immediately persist completion to localStorage
    try {
      const completedGoals: string[] = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
      if (!completedGoals.includes(goalKey)) {
        completedGoals.push(goalKey);
        setNetstartItem(`netstart_completed_goals_${missionId}`, JSON.stringify(completedGoals));
      }
    } catch (e) { }

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
  }, [awardDirectiveXp, missionId, currentSection, getNetstartItem, setNetstartItem, userId, isEarthLevel1]);

  const triggerMissionCompletion = async (codeSnippet: string) => {
    if (!missionId) return;
    if (isDemoModeActive()) {
      setRewards({
        xpEarned: 0,
        gearsEarned: 0,
      });
      return;
    }
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
        if (data.completedDailyTasks && Array.isArray(data.completedDailyTasks)) {
          data.completedDailyTasks.forEach((task: any) => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('daily_task_completed', { detail: task }));
            }
          });
        }
        try {
          removeNetstartItem('netstart_active_saved_level');
          removeNetstartItem(`netstart_completed_sections_${missionId}`);
          removeNetstartItem(`netstart_completed_goals_${missionId}`);
        } catch (e) { }


        // Persist completed missionId to localStorage so ModulesClient detects
        // planet unlock immediately and plays the travel animation
        try {
          const key = 'netstart_completed_missions';
          const existing: string[] = JSON.parse(getNetstartItem(key) || '[]');
          if (missionId && !existing.includes(missionId)) {
            existing.push(missionId);
            setNetstartItem(key, JSON.stringify(existing));
          }

          // Signal ModulesClient to play the travel animation when the user arrives.
          // We preserve the current "from" index so the animation starts from the right planet.
          // ModulesClient will detect storedIdx < realUnlockedIndex and fire startTravelAnimation.
          const currentAnimIdx = getNetstartItem('netstart_last_animated_planet_idx');
          setNetstartItem('netstart_planet_unlock_pending', 'true');
          // Only clear if there is an existing value to preserve the from-index logic
          if (currentAnimIdx !== null) {
            // Keep it as-is; ModulesClient compares it to the new realUnlockedIndex
          } else {
            // No stored index yet — default to 0 as from
            setNetstartItem('netstart_last_animated_planet_idx', '0');
          }
        } catch (e) { }
      }
    } catch (err) {
      console.error("Failed to submit mission completion:", err);
    } finally {
      setApiSaving(false);
    }
  };

  const handleMars1Success = useCallback((htmlCode: string) => {
    let parseRes = marsValidation;
    if (workspace.current) {
      parseRes = parseWorkspaceHtml(workspace.current).validation;
    }
    if (parseRes.matchedCount === 3) markObjectiveComplete(1);
    if (parseRes.hasModifier) markObjectiveComplete(2);
    if (parseRes.ratingScore === 5) markObjectiveComplete(3);
    recordSectionCompleted(0);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec0_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!isReplayMode && !claimedList.includes(bonusKey)) {
      addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Level 1 Cleared");
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      removeNetstartItem('netstart_active_level');
      removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
      if (!isDemoModeActive() && missionId) {
        const compKey = 'netstart_completed_missions';
        const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
        if (!existing.includes(missionId)) {
          existing.push(missionId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
        if (!getNetstartItem('netstart_last_animated_planet_idx')) {
          setNetstartItem('netstart_last_animated_planet_idx', '1');
        }
        setNetstartItem('netstart_planet_unlock_pending', 'true');
      }
    } catch (e) { }
    triggerMissionCompletion(htmlCode);
  }, [marsValidation.hasModifier, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection]);

  const handleMars2Success = useCallback((htmlCode: string) => {
    let parseRes = mars2Validation;
    if (workspace.current) {
      parseRes = parseMarsLevel2Workspace(workspace.current).validation;
    }
    const captionCount = parseRes.customizations?.filter(c => c.caption || c.headline)?.length || 0;
    if (captionCount >= 2) markObjectiveComplete(1);
    const allContainersPopulated = parseRes.totalContainers === 5 && parseRes.assignedImages?.every(img => img !== null) && !parseRes.hasErrors;
    if (allContainersPopulated) markObjectiveComplete(2);
    if (parseRes.isAllMatched) markObjectiveComplete(3);
    recordSectionCompleted(0);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec0_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!isReplayMode && !claimedList.includes(bonusKey)) {
      addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Level 2 Cleared");
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      removeNetstartItem('netstart_active_level');
      removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
      if (!isDemoModeActive() && missionId) {
        const compKey = 'netstart_completed_missions';
        const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
        if (!existing.includes(missionId)) {
          existing.push(missionId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
        if (!getNetstartItem('netstart_last_animated_planet_idx')) {
          setNetstartItem('netstart_last_animated_planet_idx', '1');
        }
        setNetstartItem('netstart_planet_unlock_pending', 'true');
      }
    } catch (e) { }
    triggerMissionCompletion(htmlCode);
  }, [mars2Validation, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection]);

  const handleMars2SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      let code = '';
      if (workspace.current) {
        code = javascriptGenerator.workspaceToCode(workspace.current);
      }
      handleMars2Success(code);
    } else if (failureReason) {
      setErrorToastMessage(failureReason);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [handleMars2Success]);

  const handleMars3PlanetPinged = useCallback((planet: 'mercury' | 'venus') => {
    if (planet === 'mercury') {
      setMars3MercuryPinged(true);
    } else if (planet === 'venus') {
      setMars3VenusPinged(true);
    }
  }, []);

  const handleMars3StatusOpened = useCallback((_planet: 'mercury' | 'venus') => {
    setMars3StatusOpened(true);
    markObjectiveComplete(2);
  }, [markObjectiveComplete]);

  useEffect(() => {
    if (isMarsLevel3) {
      if (mars3Validation.hasTitle) {
        markObjectiveComplete(1);
      }
      if (mars3StatusOpened) {
        markObjectiveComplete(2);
      }
      if (mars3MercuryPinged && mars3VenusPinged) {
        markObjectiveComplete(3);
      }
    }
  }, [isMarsLevel3, mars3Validation.hasTitle, mars3StatusOpened, mars3MercuryPinged, mars3VenusPinged, markObjectiveComplete]);

  const handleMars3Success = useCallback((htmlCode: string) => {
    markObjectiveComplete(1);
    markObjectiveComplete(2);
    markObjectiveComplete(3);
    recordSectionCompleted(0);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec0_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!isReplayMode && !claimedList.includes(bonusKey)) {
      addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Level 3 Cleared");
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      removeNetstartItem('netstart_active_level');
      removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
      if (!isDemoModeActive() && missionId) {
        const compKey = 'netstart_completed_missions';
        const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
        if (!existing.includes(missionId)) {
          existing.push(missionId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
        if (!getNetstartItem('netstart_last_animated_planet_idx')) {
          setNetstartItem('netstart_last_animated_planet_idx', '1');
        }
        setNetstartItem('netstart_planet_unlock_pending', 'true');
      }
    } catch (e) { }
    triggerMissionCompletion(htmlCode);
  }, [markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection]);

  const handleMars3SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    if (success) {
      setIsRunning(false);
      let code = '';
      if (workspace.current) {
        code = javascriptGenerator.workspaceToCode(workspace.current);
      }
      handleMars3Success(code);
    } else if (failureReason) {
      setErrorToastMessage(failureReason);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [handleMars3Success]);

  const handleVenus1Success = useCallback((cssCode: string) => {
    let parseRes = venus1Validation;
    let finalCode = cssCode;
    if (workspace.current) {
      const parsed = parseVenusLevel1Workspace(workspace.current);
      parseRes = parsed.validation;
      if (!finalCode) finalCode = parsed.cssCode;
    }
    setPlainEnglishCode(finalCode);
    setJsCode(finalCode);
    if (parseRes.totalStyled >= 3) markObjectiveComplete(1);
    if (parseRes.hasAnyBorder) markObjectiveComplete(2);
    if (parseRes.captionValid) markObjectiveComplete(3);
    recordSectionCompleted(0);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec0_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!isReplayMode && !claimedList.includes(bonusKey)) {
      addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Level 1 Cleared");
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      removeNetstartItem('netstart_active_level');
      removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
      if (!isDemoModeActive() && missionId) {
        const compKey = 'netstart_completed_missions';
        const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
        if (!existing.includes(missionId)) {
          existing.push(missionId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
      }
    } catch (e) { }
    triggerMissionCompletion(finalCode);
  }, [venus1Validation, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection]);

  const handleVenus1SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      let code = '';
      if (workspace.current) {
        code = parseVenusLevel1Workspace(workspace.current).cssCode;
      }
      setPlainEnglishCode(code);
      setJsCode(code);
      handleVenus1Success(code);
    } else if (failureReason) {
      setErrorToastMessage(failureReason);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [handleVenus1Success]);

  const handleMercury1Success = useCallback((finalCode: string) => {
    const parseRes = workspace.current ? parseMercuryLevel1Workspace(workspace.current) : mercury1Validation;
    setPlainEnglishCode(finalCode);
    setJsCode(finalCode);
    if (parseRes.objective1Vents || parseRes.isVentsOpened) markObjectiveComplete(1);
    if (parseRes.isAllShrubsWatered && (parseRes.isAllFlowersWatered || (parseRes.wateredFlowerIndices && parseRes.wateredFlowerIndices.length >= 5))) markObjectiveComplete(2);
    if (parseRes.objective3StarFlower || parseRes.isLilyWatered) markObjectiveComplete(3);
    recordSectionCompleted(0);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec0_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!isReplayMode && !claimedList.includes(bonusKey)) {
      addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Mercury Level 1 Cleared");
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      removeNetstartItem('netstart_active_level');
      removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
      if (!isDemoModeActive() && missionId) {
        const compKey = 'netstart_completed_missions';
        const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
        if (!existing.includes(missionId)) {
          existing.push(missionId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
      }
    } catch (e) { }
    triggerMissionCompletion(finalCode);
  }, [mercury1Validation, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection]);

  const handleMercury1SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      let code = '';
      if (workspace.current) {
        code = parseMercuryLevel1Workspace(workspace.current).jsCode;
      }
      setPlainEnglishCode(code);
      setJsCode(code);
      handleMercury1Success(code);
    } else if (failureReason) {
      setErrorToastMessage(failureReason);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [handleMercury1Success]);

  const handleMercury2Success = useCallback((finalCode: string) => {
    const parseRes = workspace.current ? parseMercuryLevel2Workspace(workspace.current) : mercury2Validation;
    setPlainEnglishCode(finalCode);
    setJsCode(finalCode);
    if (parseRes.objective2Variable) markObjectiveComplete(1);
    if (parseRes.objective3Logic) markObjectiveComplete(2);
    markObjectiveComplete(3);
    recordSectionCompleted(0);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec0_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!isReplayMode && !claimedList.includes(bonusKey)) {
      addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Mercury Level 2 Cleared");
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      removeNetstartItem('netstart_active_level');
      removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
      if (!isDemoModeActive() && missionId) {
        const compKey = 'netstart_completed_missions';
        const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
        if (!existing.includes(missionId)) {
          existing.push(missionId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
      }
    } catch (e) { }
    triggerMissionCompletion(finalCode);
  }, [mercury2Validation, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection]);

  const handleMercury2SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      let code = '';
      if (workspace.current) {
        code = parseMercuryLevel2Workspace(workspace.current).jsCode;
      }
      setPlainEnglishCode(code);
      setJsCode(code);
      handleMercury2Success(code);
    } else if (failureReason) {
      setErrorToastMessage(failureReason);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [handleMercury2Success]);

  const handleMercury3Success = useCallback((finalCode: string) => {
    setPlainEnglishCode(finalCode);
    setJsCode(finalCode);
    markObjectiveComplete(1);
    markObjectiveComplete(2);
    markObjectiveComplete(3);
    recordSectionCompleted(0);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec0_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!isReplayMode && !claimedList.includes(bonusKey)) {
      addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Mercury Level 3 Cleared");
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      removeNetstartItem('netstart_active_level');
      removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
      removeNetstartItem(`netstart_mercury3_tab_${missionId}_html`);
      removeNetstartItem(`netstart_mercury3_tab_${missionId}_css`);
      removeNetstartItem(`netstart_mercury3_tab_${missionId}_js`);
      removeNetstartItem(`netstart_mercury3_active_tab_${missionId}`);
      removeNetstartItem('netstart_mercury3_active_tab');

      if (!isDemoModeActive() && missionId) {
        const compKey = 'netstart_completed_missions';
        const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
        if (!existing.includes(missionId)) {
          existing.push(missionId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
        const canonicalId = 'mercury-3';
        if (!existing.includes(canonicalId)) {
          existing.push(canonicalId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
      }
    } catch (e) { }
    triggerMissionCompletion(finalCode);
  }, [markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection, getNetstartItem, setNetstartItem, removeNetstartItem]);

  const handleMercury3SimulationComplete = useCallback((success: boolean = true, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      const finalCode = `/* HTML */\n${mercury3HtmlCode}\n\n/* CSS */\n${mercury3CssCode}\n\n/* JavaScript */\n${mercury3JsCode}`;
      handleMercury3Success(finalCode);
    } else if (failureReason) {
      setErrorToastMessage(failureReason);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [mercury3HtmlCode, mercury3CssCode, mercury3JsCode, handleMercury3Success]);

  const handleMercury3Reset = useCallback(() => {
    setIsRunning(false);
    setMercury3SimulationActive(false);
    mercury3WorkspaceStates.current = { html: '', css: '', js: '' };
    setMercury3ActiveTab('html');
    mercury3ActiveTabRef.current = 'html';
    setMercury3HtmlCode('');
    setMercury3CssCode('');
    setMercury3JsCode('');
    mercury3HtmlCodeRef.current = '';
    mercury3CssCodeRef.current = '';
    mercury3JsCodeRef.current = '';
    setMercury3Audit(INITIAL_MERCURY_3_AUDIT);
    setMercury3ResetKey(prev => prev + 1);
    try {
      const mercury3Aliases = [missionId, 'mercury-3', 'js-3-mercury', 'javascript-3', 'js-3'].filter(Boolean);
      mercury3Aliases.forEach(id => {
        removeNetstartItem(`netstart_mercury3_tab_${id}_html`);
        removeNetstartItem(`netstart_mercury3_tab_${id}_css`);
        removeNetstartItem(`netstart_mercury3_tab_${id}_js`);
        removeNetstartItem(`netstart_mercury3_active_tab_${id}`);
        removeNetstartItem(`netstart_saved_workspace_${id}_0`);
      });
      removeNetstartItem('netstart_mercury3_active_tab');
    } catch (e) { }
    if (workspace.current) {
      workspace.current.clear();
      if (typeof (workspace.current as any).clearUndo === 'function') {
        (workspace.current as any).clearUndo();
      }
      workspace.current.updateToolbox(getMercury3HtmlToolbox());
      Blockly.svgResize(workspace.current);
    }
  }, [missionId, removeNetstartItem]);

  const handleJupiter1Success = useCallback((finalCode: string) => {
    let codeToUse = finalCode;
    const emptyJava = 'public class AirlockControl {\n    public static void main(String[] args) {\n    }\n}';
    if (!codeToUse || codeToUse.trim() === emptyJava.trim() || !codeToUse.includes('=')) {
      if (jupiter1Validation?.javaCode && jupiter1Validation.javaCode.includes('=')) {
        codeToUse = jupiter1Validation.javaCode;
      } else {
        codeToUse = `public class AirlockControl {\n    public static void main(String[] args) {\n        String password = "JupiterSecurity";\n        int pin = 1234;\n        boolean override = true;\n\n        OpticalScanner.enterCode(password);\n        Pinpad.enterPin(pin);\n        Breaker.setOverride(override);\n        Airlock.unlockDoors();\n    }\n}`;
      }
    }
    setPlainEnglishCode(codeToUse);
    setJsCode(codeToUse);
    markObjectiveComplete(1);
    markObjectiveComplete(2);
    markObjectiveComplete(3);
    recordSectionCompleted(0);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec0_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!isReplayMode && !isDemoModeActive() && !claimedList.includes(bonusKey)) {
      addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Jupiter Level 1 Cleared");
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      removeNetstartItem('netstart_active_level');
      removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
      if (!isDemoModeActive() && missionId) {
        const compKey = 'netstart_completed_missions';
        const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
        if (!existing.includes(missionId)) {
          existing.push(missionId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
      }
    } catch (e) { }
    triggerMissionCompletion(codeToUse);
  }, [jupiter1Validation, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection]);

  const handleJupiter1SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      let code = '';
      if (workspace.current) {
        const parsed = parseJupiterLevel1Workspace(workspace.current);
        if (parsed.javaCode && parsed.javaCode.includes('=')) {
          code = parsed.javaCode;
        }
      }
      if (!code && jupiter1Validation?.javaCode && jupiter1Validation.javaCode.includes('=')) {
        code = jupiter1Validation.javaCode;
      }
      if (!code && plainEnglishCode && plainEnglishCode.includes('=')) {
        code = plainEnglishCode;
      }
      if (!code) {
        code = `public class AirlockControl {\n    public static void main(String[] args) {\n        String password = "JupiterSecurity";\n        int pin = 1234;\n        boolean override = true;\n\n        OpticalScanner.enterCode(password);\n        Pinpad.enterPin(pin);\n        Breaker.setOverride(override);\n        Airlock.unlockDoors();\n    }\n}`;
      }
      setPlainEnglishCode(code);
      setJsCode(code);
      handleJupiter1Success(code);
    } else if (failureReason) {
      setJupiter1FailCount(prev => prev + 1);
      setErrorToastMessage(failureReason);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [handleJupiter1Success, jupiter1Validation, plainEnglishCode]);

  const handleJupiter2Success = useCallback((finalCode: string) => {
    let codeToUse = finalCode || jupiter2Validation.javaCode;
    if (!codeToUse) {
      codeToUse = `public class CloudGridArchive {\n    public static void main(String[] args) {\n        try {\n            scanDataStream();\n        } catch (NullPointerException e) {\n            quarantine();\n        } catch (NumberFormatException e) {\n            recalibrate();\n        } catch (ArrayIndexOutOfBoundsException e) {\n            recalibrate();\n        } catch (ArithmeticException e) {\n            recalibrate();\n        }\n    }\n}`;
    }
    setPlainEnglishCode(codeToUse);
    setJsCode(codeToUse);
    markObjectiveComplete(1);
    markObjectiveComplete(2);
    markObjectiveComplete(3);
    recordSectionCompleted(0);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec0_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!isReplayMode && !isDemoModeActive() && !claimedList.includes(bonusKey)) {
      addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Jupiter Level 2 Cleared");
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      removeNetstartItem('netstart_active_level');
      removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
      const jupiter2Aliases = [missionId, 'jupiter-2', 'java-2'].filter(Boolean);
      jupiter2Aliases.forEach(id => {
        removeNetstartItem(`netstart_jupiter2_wave1_complete_${id}`);
        removeNetstartItem(`netstart_jupiter2_wave2_complete_${id}`);
        removeNetstartItem(`netstart_jupiter2_active_wave_${id}`);
        removeNetstartItem(`netstart_jupiter2_wave_${id}_1`);
        removeNetstartItem(`netstart_jupiter2_wave_${id}_2`);
        removeNetstartItem(`netstart_jupiter2_wave_${id}_3`);
      });
      removeNetstartItem('netstart_jupiter2_wave1_complete');
      removeNetstartItem('netstart_jupiter2_wave2_complete');
      removeNetstartItem('netstart_jupiter2_active_wave');
      if (!isDemoModeActive() && missionId) {
        const compKey = 'netstart_completed_missions';
        const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
        if (!existing.includes(missionId)) {
          existing.push(missionId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
      }
    } catch (e) { }
    triggerMissionCompletion(codeToUse);
  }, [jupiter2Validation, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection, getNetstartItem, setNetstartItem, removeNetstartItem]);

  const handleJupiter2WaveChange = useCallback((newWave: Jupiter2Wave) => {
    if (newWave === jupiter2ActiveWave) return;

    if (workspace.current) {
      try {
        const xmlDom = Blockly.Xml.workspaceToDom(workspace.current);
        const xmlText = Blockly.Xml.domToText(xmlDom);
        jupiter2WorkspaceStates.current[jupiter2ActiveWave] = xmlText;
        setNetstartItem(`netstart_jupiter2_wave_${missionId}_${jupiter2ActiveWave}`, xmlText);
        setNetstartItem(`netstart_jupiter2_active_wave_${missionId}`, String(newWave));
        setNetstartItem('netstart_jupiter2_active_wave', String(newWave));

        const saveState = {
          missionId,
          sectionIndex: currentSection,
          xmlText: jupiter2WorkspaceStates.current[newWave] || getNetstartItem(`netstart_jupiter2_wave_${missionId}_${newWave}`) || xmlText,
          title: displayTitle,
          completedGoals: [],
          timestamp: Date.now()
        };
        setNetstartItem('netstart_active_saved_level', JSON.stringify(saveState));
      } catch (e) {
        console.warn("Could not save jupiter2 workspace wave state:", e);
      }
    }

    jupiter2ActiveWaveRef.current = newWave;
    setJupiter2ActiveWave(newWave);

    if (workspace.current) {
      isRestoringWorkspaceRef.current = true;
      workspace.current.clear();
      let savedXml =
        jupiter2WorkspaceStates.current[newWave] ||
        getNetstartItem(`netstart_jupiter2_wave_${missionId}_${newWave}`) ||
        '';

      // If new wave workspace is empty, carry forward blocks from the previous wave
      if (
        (!savedXml ||
          !savedXml.trim() ||
          savedXml === '<xml xmlns="https://developers.google.com/blockly/xml"></xml>' ||
          savedXml === '<xml xmlns="https://developers.google.com/blockly/xml"/>') &&
        newWave > 1
      ) {
        const prevWave = (newWave - 1) as Jupiter2Wave;
        savedXml =
          jupiter2WorkspaceStates.current[prevWave] ||
          getNetstartItem(`netstart_jupiter2_wave_${missionId}_${prevWave}`) ||
          '';
      }

      if (
        savedXml &&
        savedXml.trim() &&
        savedXml !== '<xml xmlns="https://developers.google.com/blockly/xml"></xml>' &&
        savedXml !== '<xml xmlns="https://developers.google.com/blockly/xml"/>'
      ) {
        try {
          const dom = Blockly.utils.xml.textToDom(savedXml);
          Blockly.Xml.domToWorkspace(dom, workspace.current);
        } catch (e) {
          console.warn("Error restoring jupiter2 wave xml:", e);
        }
      }

      workspace.current.updateToolbox(
        getToolboxForMission(missionId, currentSection, 'welcome', earth2ActiveTabRef.current, newWave)
      );
      Blockly.svgResize(workspace.current);
      isRestoringWorkspaceRef.current = false;

      const pVal = parseJupiterLevel2Workspace(workspace.current);
      setJupiter2Validation(pVal);
      setPlainEnglishCode(pVal.javaCode);
      setJsCode(pVal.javaCode);
    }
  }, [jupiter2ActiveWave, missionId, currentSection, displayTitle, getNetstartItem, setNetstartItem]);

  const handleJupiter2SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      let code = '';
      if (workspace.current) {
        const parsed = parseJupiterLevel2Workspace(workspace.current);
        if (parsed.javaCode && parsed.javaCode.includes('try')) {
          code = parsed.javaCode;
        }
      }
      if (!code && jupiter2Validation?.javaCode && jupiter2Validation.javaCode.includes('try')) {
        code = jupiter2Validation.javaCode;
      }
      if (!code && plainEnglishCode && plainEnglishCode.includes('try')) {
        code = plainEnglishCode;
      }
      if (!code) {
        code = `public class CloudGridArchive {\n    public static void main(String[] args) {\n        try {\n            scanDataStream();\n        } catch (NullPointerException e) {\n            quarantine();\n        } catch (NumberFormatException e) {\n            recalibrate();\n        } catch (ArrayIndexOutOfBoundsException e) {\n            recalibrate();\n        } catch (ArithmeticException e) {\n            recalibrate();\n        }\n    }\n}`;
      }
      setPlainEnglishCode(code);
      setJsCode(code);

      if (jupiter2ActiveWave === 1) {
        setIsJupiter2Wave1Complete(true);
        markObjectiveComplete(1);
        try {
          setNetstartItem(`netstart_jupiter2_wave1_complete_${missionId}`, 'true');
          setNetstartItem('netstart_jupiter2_wave1_complete', 'true');
        } catch (e) {}

        const bonusKey = `${missionId}_sec0_wave1_bonus`;
        let claimedList: string[] = [];
        try {
          claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
        } catch (e) {}

        if (!claimedList.includes(bonusKey) && !isReplayMode) {
          addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Wave 1 Cleared: NullPointer and Arithmetic Repelled");
          claimedList.push(bonusKey);
          try {
            setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
          } catch (e) {}
        }

        showToast("Wave 1 Cleared! NullPointer and Arithmetic threats neutralized. Unlocking Wave 2...");
        setTimeout(() => {
          handleJupiter2WaveChange(2);
        }, 1200);
      } else if (jupiter2ActiveWave === 2) {
        setIsJupiter2Wave2Complete(true);
        markObjectiveComplete(2);
        try {
          setNetstartItem(`netstart_jupiter2_wave2_complete_${missionId}`, 'true');
          setNetstartItem('netstart_jupiter2_wave2_complete', 'true');
        } catch (e) {}

        const bonusKey = `${missionId}_sec0_wave2_bonus`;
        let claimedList: string[] = [];
        try {
          claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
        } catch (e) {}

        if (!claimedList.includes(bonusKey) && !isReplayMode) {
          addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Wave 2 Cleared: NullPointer, NumberFormat and ClassCast Repelled");
          claimedList.push(bonusKey);
          try {
            setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
          } catch (e) {}
        }

        showToast("Wave 2 Cleared! NullPointer, NumberFormat and ClassCast threats neutralized. Unlocking Wave 3...");
        setTimeout(() => {
          handleJupiter2WaveChange(3);
        }, 1200);
      } else {
        markObjectiveComplete(3);
        showToast("Wave 3 Cleared! Core protected and Technician Io rescued!");
        handleJupiter2Success(code);
      }
    } else if (failureReason) {
      setErrorToastMessage(failureReason);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [handleJupiter2Success, jupiter2Validation, plainEnglishCode, jupiter2ActiveWave, missionId, isReplayMode, addXp, getNetstartItem, setNetstartItem, markObjectiveComplete, showToast, handleJupiter2WaveChange]);

  const handleJupiter3SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      let code = '';
      if (workspace.current) {
        const parsed = parseJupiterLevel3Workspace(workspace.current);
        if (parsed.rawJavaCode) {
          code = parsed.rawJavaCode;
        }
      }
      if (!code && jupiter3Blueprint?.rawJavaCode) {
        code = jupiter3Blueprint.rawJavaCode;
      }
      if (!code && plainEnglishCode) {
        code = plainEnglishCode;
      }
      if (!code) {
        code = `public class AdminProfile {\n    private int clearanceLevel = 4;\n    public String role = "Admin";\n\n    public void unlockDoors() {\n    }\n    public void soundAlarm() {\n    }\n}\n\nAdminProfile adminProfile = new AdminProfile();`;
      }
      setPlainEnglishCode(code);
      setJsCode(code);
      markObjectiveComplete(1);
      markObjectiveComplete(2);
      markObjectiveComplete(3);
      recordSectionCompleted(0);
      setShowPopup(true);

      const bonusKey = `${missionId}_sec0_bonus`;
      let claimedList: string[] = [];
      try {
        claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
      } catch (e) { }

      if (!isReplayMode && !isDemoModeActive() && !claimedList.includes(bonusKey)) {
        addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Jupiter Level 3 Cleared");
        claimedList.push(bonusKey);
        try {
          setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
        } catch (e) { }
      }

      try {
        removeNetstartItem('netstart_active_saved_level');
        removeNetstartItem('netstart_active_level');
        removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
        removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
        if (!isDemoModeActive() && missionId) {
          const compKey = 'netstart_completed_missions';
          const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
          if (!existing.includes(missionId)) {
            existing.push(missionId);
            setNetstartItem(compKey, JSON.stringify(existing));
          }
        }
      } catch (e) { }

      triggerMissionCompletion(code);
    }
  }, [jupiter3Blueprint, plainEnglishCode, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection, getNetstartItem, setNetstartItem, removeNetstartItem]);

  const handleJupiter3Reset = useCallback(() => {
    setIsRunning(false);
    setJupiter3Blueprint(INITIAL_PLAYER_BLUEPRINT);
    setJupiter3ResetKey(prev => prev + 1);
    try {
      const jupiter3Aliases = [missionId, 'jupiter-3', 'java-3'].filter(Boolean);
      jupiter3Aliases.forEach(id => {
        removeNetstartItem(`netstart_saved_workspace_${id}_0`);
      });
    } catch (e) { }
    if (workspace.current) {
      workspace.current.clear();
      if (typeof (workspace.current as any).clearUndo === 'function') {
        (workspace.current as any).clearUndo();
      }
      try {
        const dom = Blockly.utils.xml.textToDom(JUPITER_LEVEL_3_STARTER_XML);
        Blockly.Xml.domToWorkspace(dom, workspace.current);
      } catch (e) { }
      workspace.current.updateToolbox(getJupiterLevel3Toolbox());
      Blockly.svgResize(workspace.current);
    }
  }, [missionId, getNetstartItem, removeNetstartItem]);

  const handleSaturn1Success = useCallback((finalCode: string) => {
    let codeToUse = finalCode || generateSaturnCppCode(saturnWorkspaceState, 3);
    setPlainEnglishCode(codeToUse);
    setJsCode(codeToUse);
    markObjectiveComplete(1);
    markObjectiveComplete(2);
    markObjectiveComplete(3);
    recordSectionCompleted(0);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec0_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!isReplayMode && !isDemoModeActive() && !claimedList.includes(bonusKey)) {
      addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Saturn Level 1 Cleared");
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      removeNetstartItem('netstart_active_level');
      removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
      if (!isDemoModeActive() && missionId) {
        const compKey = 'netstart_completed_missions';
        const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
        if (!existing.includes(missionId)) {
          existing.push(missionId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
      }
    } catch (e) { }
    triggerMissionCompletion(codeToUse);
  }, [saturnWorkspaceState, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection]);

  const handleSaturn1SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      // Single Run Success!
      setSaturnIsWon(true);
      markObjectiveComplete(1);
      markObjectiveComplete(2);
      markObjectiveComplete(3);
      const cpp = saturn1Validation.cppCode || generateSaturnCppCode(saturnWorkspaceState);
      handleSaturn1Success(cpp);
    } else if (failureReason) {
      setSaturn1FailCount(prev => prev + 1);
      setErrorToastMessage(failureReason);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [saturnWave, saturn1Validation, saturnWorkspaceState, markObjectiveComplete, handleSaturn1Success]);

  const handleSaturn2Success = useCallback((finalCode: string) => {
    let codeToUse = finalCode || saturn2Validation.cppCode;
    if ((!codeToUse || codeToUse === '/* No code generated */') && workspace.current) {
      const v = parseSaturnLevel2Workspace(workspace.current);
      if (v.cppCode) codeToUse = v.cppCode;
    }
    setPlainEnglishCode(codeToUse);
    setJsCode(codeToUse);
    markObjectiveComplete(1);
    markObjectiveComplete(2);
    markObjectiveComplete(3);
    recordSectionCompleted(0);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec0_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!isReplayMode && !isDemoModeActive() && !claimedList.includes(bonusKey)) {
      addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Saturn Level 2 Cleared");
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      removeNetstartItem('netstart_active_level');
      const saturn2Aliases = [missionId, 'saturn-2', 'cpp-2'].filter(Boolean);
      saturn2Aliases.forEach(id => {
        removeNetstartItem(`netstart_saved_workspace_${id}_0`);
      });
      if (!isDemoModeActive() && missionId) {
        const compKey = 'netstart_completed_missions';
        const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
        if (!existing.includes(missionId)) {
          existing.push(missionId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
      }
    } catch (e) { }
    triggerMissionCompletion(codeToUse);
  }, [saturn2Validation, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion]);

  const handleSaturn2SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      let currentVal = saturn2Validation;
      if (workspace.current) {
        currentVal = parseSaturnLevel2Workspace(workspace.current);
        setSaturn2Validation(currentVal);
      }
      const topBlocks = workspace.current ? workspace.current.getTopBlocks(true) : [];
      const startBlock = topBlocks.find(b => b.type === 'saturn2_start' || b.type === 'event_start');
      const connectedBlocks = startBlock ? startBlock.getDescendants(false) : [];
      const hasEndBlock = connectedBlocks.some(b => b.type === 'saturn2_end' || b.type === 'event_end') || currentVal.hasEnd;

      if (hasEndBlock) {
        handleSaturn2Success(currentVal.cppCode);
      } else {
        setIsWarningPulse(true);
        if (endToastTimer.current) clearTimeout(endToastTimer.current);
        setShowEndToast(true);
        endToastTimer.current = setTimeout(() => setShowEndToast(false), 5500);
      }
    } else if (failureReason) {
      setErrorToastMessage(failureReason);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [saturn2Validation, handleSaturn2Success]);

  const handleSaturn3SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      // Require an End block connected to the Start chain (same rule as Moon / Saturn Level 2)
      const topBlocks = workspace.current ? workspace.current.getTopBlocks(true) : [];
      const startBlock = topBlocks.find(b => b.type === 'saturn3_start' || b.type === 'event_start');
      const connectedBlocks = startBlock ? startBlock.getDescendants(false) : [];
      const hasEndBlock = connectedBlocks.some(b => b.type === 'saturn3_end' || b.type === 'event_end');
      if (!hasEndBlock) {
        setIsWarningPulse(true);
        if (endToastTimer.current) clearTimeout(endToastTimer.current);
        setShowEndToast(true);
        endToastTimer.current = setTimeout(() => setShowEndToast(false), 5500);
        return;
      }

      let code = '';
      if (workspace.current) {
        const parsed = parseSaturnLevel3Workspace(workspace.current);
        if (parsed.rawCppCode) {
          code = parsed.rawCppCode;
        }
      }
      if (!code && saturn3Payload?.rawCppCode) {
        code = saturn3Payload.rawCppCode;
      }
      if (!code && plainEnglishCode) {
        code = plainEnglishCode;
      }
      if (!code) {
        code = `int main() {\n    Task* sensorPtr = nullptr;\n    Task* debrisPtr = nullptr;\n    sensorPtr = new Core(2);\n    runSensors();\n    delete sensorPtr;\n    debrisPtr = new Core(3);\n    runDebris();\n    delete debrisPtr;\n    return 0;\n}`;
      }
      setPlainEnglishCode(code);
      setJsCode(code);
      markObjectiveComplete(1);
      markObjectiveComplete(2);
      markObjectiveComplete(3);
      recordSectionCompleted(0);
      setShowPopup(true);

      const bonusKey = `${missionId}_sec0_bonus`;
      let claimedList: string[] = [];
      try {
        claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
      } catch (e) { }

      if (!isReplayMode && !isDemoModeActive() && !claimedList.includes(bonusKey)) {
        addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Saturn Level 3 Cleared");
        claimedList.push(bonusKey);
        try {
          setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
        } catch (e) { }
      }

      try {
        removeNetstartItem('netstart_active_saved_level');
        removeNetstartItem('netstart_active_level');
        removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
        removeNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`);
        if (!isDemoModeActive() && missionId) {
          const compKey = 'netstart_completed_missions';
          const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
          if (!existing.includes(missionId)) {
            existing.push(missionId);
            setNetstartItem(compKey, JSON.stringify(existing));
          }
        }
      } catch (e) { }

      triggerMissionCompletion(code);
    }
  }, [saturn3Payload, plainEnglishCode, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection, getNetstartItem, setNetstartItem, removeNetstartItem]);

  const handleSaturn3Reset = useCallback(() => {
    setIsRunning(false);
    setSaturn3Payload(INITIAL_SATURN_3_PAYLOAD);
    setSaturn3ResetKey(prev => prev + 1);
    try {
      const saturn3Aliases = [missionId, 'saturn-3', 'cpp-3'].filter(Boolean);
      saturn3Aliases.forEach(id => {
        removeNetstartItem(`netstart_saved_workspace_${id}_0`);
      });
    } catch (e) { }
    if (workspace.current) {
      workspace.current.clear();
      if (typeof (workspace.current as any).clearUndo === 'function') {
        (workspace.current as any).clearUndo();
      }
      try {
        const dom = Blockly.utils.xml.textToDom(SATURN_LEVEL_3_STARTER_XML);
        Blockly.Xml.domToWorkspace(dom, workspace.current);
      } catch (e) { }
      workspace.current.updateToolbox(getSaturnLevel3Toolbox());
      Blockly.svgResize(workspace.current);
    }
  }, [missionId, getNetstartItem, removeNetstartItem]);

  const handleEarth1Success = useCallback((finalCode: string) => {
    let codeToUse = finalCode || generateEarthPythonCode(earthWorkspaceState, currentSection);
    setPlainEnglishCode(codeToUse);
    setJsCode(codeToUse);
    // Earth Level 1: Restore matching ledger entry (sec 0 -> Entry 1, sec 1 -> Entry 2, sec 2 -> Entry 3)
    const earthGoalId = currentSection + 1;
    markObjectiveComplete(earthGoalId);
    recordSectionCompleted(currentSection);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec${currentSection}_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!isReplayMode && !isDemoModeActive() && !claimedList.includes(bonusKey)) {
      addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, `Earth Section ${currentSection + 1} Cleared`);
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    if (currentSection === 2) {
      try {
        removeNetstartItem('netstart_active_saved_level');
        removeNetstartItem('netstart_active_level');
        const earthAliases = [missionId, 'earth-1', 'python-1', 'earth'].filter(Boolean);
        earthAliases.forEach(id => {
          removeNetstartItem(`netstart_saved_workspace_${id}_0`);
          removeNetstartItem(`netstart_saved_workspace_${id}_1`);
          removeNetstartItem(`netstart_saved_workspace_${id}_2`);
        });
        if (!isDemoModeActive() && missionId) {
          const compKey = 'netstart_completed_missions';
          const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
          if (!existing.includes(missionId)) {
            existing.push(missionId);
            setNetstartItem(compKey, JSON.stringify(existing));
          }
        }
      } catch (e) { }
      triggerMissionCompletion(codeToUse);
    }
  }, [earthWorkspaceState, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion, currentSection]);

  const handleEarth1SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      const py = earth1Validation.pythonCode || generateEarthPythonCode(earthWorkspaceState, currentSection);
      handleEarth1Success(py);
    } else if (failureReason) {
      setErrorToastMessage(failureReason);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [earth1Validation, earthWorkspaceState, currentSection, markObjectiveComplete, handleEarth1Success]);

  const handleEarth2SimulationComplete = useCallback((success: boolean, message?: string) => {
    setIsRunning(false);
    if (success) {
      if (earth2ActiveTab === 'tab1') {
        setIsEarth2Tab1Complete(true);
        markObjectiveComplete(1);
        try {
          setNetstartItem(`netstart_earth2_tab1_complete_${missionId}`, 'true');
        } catch (e) { }

        const bonusKey = `${missionId}_sec0_tab1_bonus`;
        let claimedList: string[] = [];
        try {
          claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
        } catch (e) { }

        if (!claimedList.includes(bonusKey) && !isReplayMode) {
          addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Tab 1: Planet Profiles Verified");
          claimedList.push(bonusKey);
          try {
            setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
          } catch (e) { }
        }

        showToast("All 6 planet profile dictionaries verified! Tab 2 (Planetary Orbits) is now unlocked.");
      } else if (earth2ActiveTab === 'tab2') {
        markObjectiveComplete(2);
        markObjectiveComplete(3);
        const py = earth2Tab2Validation.pythonCode || (workspace.current ? parseEarth2Tab2Workspace(workspace.current).pythonCode : '');
        setPlainEnglishCode(py);
        setJsCode(py);
        recordSectionCompleted(0);
        setShowPopup(true);
        try {
          removeNetstartItem('netstart_active_saved_level');
          removeNetstartItem('netstart_active_level');
          const earthAliases = [missionId, 'earth-2', 'python-2'].filter(Boolean);
          earthAliases.forEach(id => {
            removeNetstartItem(`netstart_earth2_tab_${id}_tab1`);
            removeNetstartItem(`netstart_earth2_tab_${id}_tab2`);
            removeNetstartItem(`netstart_earth2_tab1_complete_${id}`);
            removeNetstartItem(`netstart_earth2_active_tab_${id}`);
          });
          if (!isDemoModeActive() && missionId) {
            const compKey = 'netstart_completed_missions';
            const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
            if (!existing.includes(missionId)) {
              existing.push(missionId);
              setNetstartItem(compKey, JSON.stringify(existing));
            }
          }
        } catch (e) { }
        triggerMissionCompletion(py);

        const bonusKey = `${missionId}_sec0_bonus`;
        let claimedList: string[] = [];
        try {
          claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
        } catch (e) { }

        if (!claimedList.includes(bonusKey) && !isReplayMode) {
          addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Level 2: The Planetary Archive Completed");
          claimedList.push(bonusKey);
          try {
            setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
          } catch (e) { }
        }
      }
    } else if (message) {
      setErrorToastMessage(message);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [earth2ActiveTab, earth2Tab1Validation, earth2Tab2Validation, missionId, markObjectiveComplete, recordSectionCompleted, setShowPopup, isDemoModeActive, triggerMissionCompletion, addXp, setNetstartItem, removeNetstartItem, getNetstartItem, showToast, isReplayMode]);

  const handleEarth3SimulationComplete = useCallback(() => {
    setIsRunning(false);
    markObjectiveComplete(1);
    markObjectiveComplete(2);
    markObjectiveComplete(3);
    recordSectionCompleted(0);
    setShowPopup(true);

    const bonusKey = `${missionId}_sec0_bonus`;
    let claimedList: string[] = [];
    try {
      claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
    } catch (e) { }

    if (!claimedList.includes(bonusKey) && !isReplayMode) {
      addXp(500, "Level 3: The Master Reboot Completed");
      claimedList.push(bonusKey);
      try {
        setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      removeNetstartItem('netstart_active_level');
      const earth3Aliases = [missionId, 'earth-3', 'python-3'].filter(Boolean);
      earth3Aliases.forEach(id => {
        removeNetstartItem(`netstart_saved_workspace_${id}_0`);
      });
      if (!isDemoModeActive() && missionId) {
        const compKey = 'netstart_completed_missions';
        const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
        if (!existing.includes(missionId)) {
          existing.push(missionId);
          setNetstartItem(compKey, JSON.stringify(existing));
        }
      }
      setNetstartItem('netstart_is_game_completed', 'true');
    } catch (e) { }

    const finalCode = earth3Code || (workspace.current ? javascriptGenerator.workspaceToCode(workspace.current) : '');
    triggerMissionCompletion(finalCode);
  }, [earth3Code, missionId, markObjectiveComplete, recordSectionCompleted, setShowPopup, isDemoModeActive, triggerMissionCompletion, addXp, setNetstartItem, removeNetstartItem, getNetstartItem, isReplayMode]);

  const handleEarth3Reset = useCallback(() => {
    setIsRunning(false);
    setEarth3ResetKey(prev => prev + 1);
    setEarth3Audit(INITIAL_EARTH_3_AUDIT);
    setEarth3Code('');
    try {
      const earth3Aliases = [missionId, 'earth-3', 'python-3'].filter(Boolean);
      earth3Aliases.forEach(id => {
        removeNetstartItem(`netstart_saved_workspace_${id}_0`);
      });
    } catch (e) { }
    if (workspace.current) {
      workspace.current.clear();
      if (typeof (workspace.current as any).clearUndo === 'function') {
        (workspace.current as any).clearUndo();
      }
      workspace.current.updateToolbox(getEarthLevel3Toolbox());
      Blockly.svgResize(workspace.current);
    }
  }, [missionId, removeNetstartItem]);

  const handleEarth2TabChange = useCallback((newTab: 'tab1' | 'tab2') => {
    if (newTab === earth2ActiveTab) return;

    if (workspace.current) {
      try {
        const xmlDom = Blockly.Xml.workspaceToDom(workspace.current);
        const xmlText = Blockly.Xml.domToText(xmlDom);
        earth2WorkspaceStates.current[earth2ActiveTab] = xmlText;
        setNetstartItem(`netstart_earth2_tab_${missionId}_${earth2ActiveTab}`, xmlText);
        setNetstartItem(`netstart_earth2_active_tab_${missionId}`, newTab);

        const saveState = {
          missionId,
          sectionIndex: currentSection,
          xmlText: earth2WorkspaceStates.current[newTab] || getNetstartItem(`netstart_earth2_tab_${missionId}_${newTab}`) || xmlText,
          title: displayTitle,
          completedGoals: [],
          timestamp: Date.now()
        };
        setNetstartItem('netstart_active_saved_level', JSON.stringify(saveState));
      } catch (e) {
        console.warn("Could not save earth2 workspace tab state:", e);
      }
    }

    earth2ActiveTabRef.current = newTab;
    setEarth2ActiveTab(newTab);
    lastEarth2ToolboxKeyRef.current = '';

    if (workspace.current) {
      isRestoringWorkspaceRef.current = true;
      workspace.current.clear();
      let savedXml =
        earth2WorkspaceStates.current[newTab] ||
        getNetstartItem(`netstart_earth2_tab_${missionId}_${newTab}`) ||
        '';

      if (savedXml) {
        if (newTab === 'tab1' && savedXml.includes('earth2_solar_system_list')) {
          setNetstartItem(`netstart_earth2_tab_${missionId}_tab2`, savedXml);
          earth2WorkspaceStates.current['tab2'] = savedXml;
          savedXml = earth2WorkspaceStates.current['tab1'] || '';
          removeNetstartItem(`netstart_earth2_tab_${missionId}_tab1`);
        } else if (newTab === 'tab2' && (savedXml.includes('earth2_planet_dict') || savedXml.includes('earth2_val_desc'))) {
          setNetstartItem(`netstart_earth2_tab_${missionId}_tab1`, savedXml);
          earth2WorkspaceStates.current['tab1'] = savedXml;
          savedXml = earth2WorkspaceStates.current['tab2'] || '';
          removeNetstartItem(`netstart_earth2_tab_${missionId}_tab2`);
        }
      }

      if (
        savedXml &&
        savedXml.trim() &&
        savedXml !== '<xml xmlns="https://developers.google.com/blockly/xml"></xml>' &&
        savedXml !== '<xml xmlns="https://developers.google.com/blockly/xml"/>'
      ) {
        try {
          const dom = Blockly.utils.xml.textToDom(savedXml);
          Blockly.Xml.domToWorkspace(dom, workspace.current);
        } catch (e) {
          console.warn("Failed to restore earth2 tab workspace:", e);
        }
      } else if (newTab === 'tab2') {
        const defaultTab2Xml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="earth2_solar_system_list" x="50" y="50" deletable="false"></block></xml>';
        try {
          const dom = Blockly.utils.xml.textToDom(defaultTab2Xml);
          Blockly.Xml.domToWorkspace(dom, workspace.current);
        } catch (e) {}
      }
      isRestoringWorkspaceRef.current = false;
      const allBlocks = workspace.current.getAllBlocks(false);
      const seenTypes = new Set<string>();
      if (newTab === 'tab1') {
        for (const b of allBlocks) {
          if (b.type && b.type.startsWith('earth2_val_') && b.type !== 'earth2_val_rocky' && b.type !== 'earth2_val_gas_giant') {
            seenTypes.add(b.type);
          }
        }
        lastEarth2ToolboxKeyRef.current = 'tab1_' + Array.from(seenTypes).sort().join(',');
        workspace.current.updateToolbox(getEarthLevel2Toolbox('tab1', seenTypes));
      } else {
        for (const b of allBlocks) {
          if (b.type && (b.type.startsWith('earth2_var_') || b.type === 'earth2_solar_system_list')) {
            seenTypes.add(b.type);
          }
        }
        lastEarth2ToolboxKeyRef.current = 'tab2_' + Array.from(seenTypes).sort().join(',');
        workspace.current.updateToolbox(getEarthLevel2Toolbox('tab2', seenTypes));
      }

      if (newTab === 'tab1') {
        const val = parseEarth2Tab1Workspace(workspace.current);
        setEarth2Tab1Validation(val);
        setPlainEnglishCode(val.pythonCode);
        setJsCode(val.pythonCode);
      } else {
        const val = parseEarth2Tab2Workspace(workspace.current);
        setEarth2Tab2Validation(val);
        setPlainEnglishCode(val.pythonCode);
        setJsCode(val.pythonCode);
      }
    }
  }, [earth2ActiveTab, isEarth2Tab1Complete, missionId, getNetstartItem, setNetstartItem, showToast]);

  const handleVenus2PanelSolved = useCallback((panelNum: number) => {
    setVenus2SolvedPanels(prev => {
      const next = { ...prev, [panelNum]: true };
      try {
        setNetstartItem('netstart_venus2_solved_panels', JSON.stringify(next));
      } catch (e) { }
      if (workspace.current) {
        const blocks = workspace.current.getAllBlocks(false);
        if (blocks.some(b => b.type === 'venus2_target_panel') && blocks.some(b => b.type === 'venus2_style_display')) {
          markObjectiveComplete(1);
        }
        if (blocks.some(b => b.type === 'venus2_style_justify') && blocks.some(b => b.type === 'venus2_style_align')) {
          markObjectiveComplete(2);
        }
      }
      if (next[1] && next[2] && next[3] && next[4] && next[5]) {
        markObjectiveComplete(3);
      }
      return next;
    });
  }, [markObjectiveComplete, setNetstartItem]);

  const handleVenus2SimulationComplete = useCallback((success: boolean, failureReason?: string) => {
    setIsRunning(false);
    if (success) {
      const allSolvedMap = { 1: true, 2: true, 3: true, 4: true, 5: true };
      setVenus2SolvedPanels(allSolvedMap);
      try {
        setNetstartItem('netstart_venus2_solved_panels', JSON.stringify(allSolvedMap));
      } catch (e) { }
      const code = generateVenusLevel2FullCss(workspace.current, venus2ActivePanel, allSolvedMap);
      setPlainEnglishCode(code);
      setJsCode(code);
      markObjectiveComplete(1);
      markObjectiveComplete(2);
      markObjectiveComplete(3);
      recordSectionCompleted(0);
      setShowPopup(true);

      const bonusKey = `${missionId}_sec0_bonus`;
      let claimedList: string[] = [];
      try {
        claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
      } catch (e) { }

      if (!isReplayMode && !claimedList.includes(bonusKey)) {
        addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Level 2 Cleared");
        claimedList.push(bonusKey);
        try {
          setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
        } catch (e) { }
      }

      try {
        removeNetstartItem('netstart_active_saved_level');
        removeNetstartItem('netstart_active_level');
        removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
        if (!isDemoModeActive() && missionId) {
          const compKey = 'netstart_completed_missions';
          const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
          if (!existing.includes(missionId)) {
            existing.push(missionId);
            setNetstartItem(compKey, JSON.stringify(existing));
          }
        }
      } catch (e) { }
      triggerMissionCompletion(code);
    } else if (failureReason) {
      setErrorToastMessage(failureReason);
      setShowErrorToast(true);
      if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
      errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
    }
  }, [plainEnglishCode, jsCode, venus2ActivePanel, venus2SolvedPanels, markObjectiveComplete, recordSectionCompleted, setShowPopup, missionId, isReplayMode, addXp, triggerMissionCompletion]);

  const resetWorkspaceRef = useRef(resetWorkspaceToDefaultStart);
  resetWorkspaceRef.current = resetWorkspaceToDefaultStart;

  const setupContextMenuRef = useRef(setupCustomContextMenu);
  setupContextMenuRef.current = setupCustomContextMenu;

  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  const currentSectionRef = useRef(currentSection);
  currentSectionRef.current = currentSection;

  const completedSectionsRef = useRef(completedSections);
  completedSectionsRef.current = completedSections;

  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const displayTitleRef = useRef(displayTitle);
  displayTitleRef.current = displayTitle;

  const planetIconRef = useRef(planetIcon);
  planetIconRef.current = planetIcon;

  const isDailyRef = useRef(isDaily);
  isDailyRef.current = isDaily;

  // Inject Blockly
  useEffect(() => {
    if (blocklyDiv.current && !workspace.current) {
      patchBlocklyFocus();

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

      registerHtmlBlocks();
      registerMarsLevel2Blocks();
      registerMarsLevel3Blocks();
      registerVenusLevel1Blocks();
      registerVenusLevel2Blocks();
      registerVenusLevel3Blocks();
      registerMercuryLevel1Blocks();
      registerMercuryLevel2Blocks();
      registerJupiterLevel1Blocks();
      registerJupiterLevel2Blocks();
      registerSaturnLevel1Blocks();
      registerSaturnLevel2Blocks();
      registerEarthLevel1Blocks();
      registerEarthLevel2Blocks();
      registerEarthLevel3Blocks();

      const ws = Blockly.inject(blocklyDiv.current, {
        toolbox: getToolboxForMission(missionId, currentSectionRef.current, 'welcome', earth2ActiveTabRef.current),
        collapse: true,
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

      (ws as any).currentSectionIndex = currentSectionRef.current;
      (ws as any).dailySectionName = dailySection?.name;
      (ws as any).missionId = missionId;
      if (typeof window !== 'undefined') {
        (window as any).__NETSTART_CURRENT_SECTION__ = currentSectionRef.current;
        (window as any).__NETSTART_DAILY_SECTION_NAME__ = dailySection?.name;
        (window as any).__NETSTART_MISSION_ID__ = missionId;
      }
      workspace.current = ws;

      const origIsDeleteArea = (ws as any).isDeleteArea ? (ws as any).isDeleteArea.bind(ws) : () => false;
      (ws as any).isDeleteArea = function (e: any) {
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

      resetWorkspaceRef.current(ws);
      setupContextMenuRef.current();

      const updateCodeLive = () => {
        if (!workspace.current || isRestoringWorkspaceRef.current) return;
        try {
          clearAllBlockHighlights(workspace.current);
          let code = '';
          try {
            code = javascriptGenerator.workspaceToCode(workspace.current);
            setJsCode(code);
          } catch (e) { }
          if (isMarsLevel1) {
            setPlainEnglishCode(code);
            const parseRes = parseWorkspaceHtml(workspace.current);
            setMarsParsedElements(parseRes.elements);
            setMarsValidation(parseRes.validation);

            // Live objective checks for Mars Level 1
            if (parseRes.validation.matchedCount === 3) {
              markObjectiveComplete(1);
            }
            if (parseRes.validation.hasModifier) {
              markObjectiveComplete(2);
            }
            if (parseRes.validation.ratingScore === 5) {
              markObjectiveComplete(3);
            }
          } else if (isMarsLevel2) {
            const parseRes = parseMarsLevel2Workspace(workspace.current);
            setPlainEnglishCode(parseRes.htmlCode);
            setJsCode(parseRes.htmlCode);
            setMars2Validation(parseRes.validation);
            const isSecDone = completedSectionsRef.current.includes(currentSectionRef.current);
            const captionCount = parseRes.validation.customizations?.filter(c => c.caption || c.headline)?.length || 0;
            const allContainersPopulated = parseRes.validation.totalContainers === 5 && parseRes.validation.assignedImages?.every(img => img !== null) && !parseRes.validation.hasErrors;
            const obj1Met = captionCount >= 2;
            const obj2Met = allContainersPopulated;
            const obj3Met = !!parseRes.validation.isAllMatched;

            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.id === 1) return { ...obj, completed: obj1Met };
                if (obj.id === 2) return { ...obj, completed: obj2Met };
                if (obj.id === 3) return { ...obj, completed: obj3Met };
                return obj;
              }));

              const goalKey1 = `${missionId}_sec${currentSectionRef.current}_goal1`;
              const goalKey2 = `${missionId}_sec${currentSectionRef.current}_goal2`;
              const goalKey3 = `${missionId}_sec${currentSectionRef.current}_goal3`;

              try {
                let completedGoals: string[] = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
                if (obj1Met) {
                  if (!completedGoals.includes(goalKey1)) completedGoals.push(goalKey1);
                } else {
                  completedGoals = completedGoals.filter(k => k !== goalKey1);
                }
                if (obj2Met) {
                  if (!completedGoals.includes(goalKey2)) completedGoals.push(goalKey2);
                } else {
                  completedGoals = completedGoals.filter(k => k !== goalKey2);
                }
                if (obj3Met) {
                  if (!completedGoals.includes(goalKey3)) completedGoals.push(goalKey3);
                } else {
                  completedGoals = completedGoals.filter(k => k !== goalKey3);
                }
                setNetstartItem(`netstart_completed_goals_${missionId}`, JSON.stringify(completedGoals));
              } catch (e) { }
            }
          } else if (isMarsLevel3) {
            const parseRes = parseMarsLevel3Workspace(workspace.current);
            setPlainEnglishCode(parseRes.htmlCode);
            setJsCode(parseRes.htmlCode);
            setMars3Validation(parseRes.validation);
            const isSecDone = completedSectionsRef.current.includes(currentSectionRef.current);
            const obj1Met = !!parseRes.validation.hasTitle;
            const obj2Met = mars3StatusOpened;
            const obj3Met = mars3MercuryPinged && mars3VenusPinged;

            if (!parseRes.validation.canDeploy && mars3Phase === 'sandbox') {
              setMars3Phase('assembly');
              setIsRunning(false);
            }

            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.id === 1) return { ...obj, completed: obj1Met };
                if (obj.id === 2) return { ...obj, completed: obj2Met };
                if (obj.id === 3) return { ...obj, completed: obj3Met };
                return obj;
              }));

              const goalKey1 = `${missionId}_sec${currentSectionRef.current}_goal1`;
              const goalKey2 = `${missionId}_sec${currentSectionRef.current}_goal2`;
              const goalKey3 = `${missionId}_sec${currentSectionRef.current}_goal3`;

              try {
                let completedGoals: string[] = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
                if (obj1Met) {
                  if (!completedGoals.includes(goalKey1)) completedGoals.push(goalKey1);
                } else {
                  completedGoals = completedGoals.filter(k => k !== goalKey1);
                }
                if (obj2Met) {
                  if (!completedGoals.includes(goalKey2)) completedGoals.push(goalKey2);
                } else {
                  completedGoals = completedGoals.filter(k => k !== goalKey2);
                }
                if (obj3Met) {
                  if (!completedGoals.includes(goalKey3)) completedGoals.push(goalKey3);
                } else {
                  completedGoals = completedGoals.filter(k => k !== goalKey3);
                }
                setNetstartItem(`netstart_completed_goals_${missionId}`, JSON.stringify(completedGoals));
              } catch (e) { }
            }
          } else if (isVenusLevel1) {
            const parseRes = parseVenusLevel1Workspace(workspace.current);
            setPlainEnglishCode(parseRes.cssCode);
            setJsCode(parseRes.cssCode);
            setVenus1Validation(parseRes.validation);
            const isSecDone = completedSections.includes(currentSection);
            const obj1Met = parseRes.validation.totalStyled >= 3;
            const obj2Met = !!parseRes.validation.hasAnyBorder;
            const obj3Met = !!parseRes.validation.captionValid;

            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.id === 1) return { ...obj, completed: obj1Met };
                if (obj.id === 2) return { ...obj, completed: obj2Met };
                if (obj.id === 3) return { ...obj, completed: obj3Met };
                return obj;
              }));

              const goalKey1 = `${missionId}_sec${currentSection}_goal1`;
              const goalKey2 = `${missionId}_sec${currentSection}_goal2`;
              const goalKey3 = `${missionId}_sec${currentSection}_goal3`;

              try {
                let completedGoals: string[] = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
                if (obj1Met) {
                  if (!completedGoals.includes(goalKey1)) completedGoals.push(goalKey1);
                } else {
                  completedGoals = completedGoals.filter(k => k !== goalKey1);
                }
                if (obj2Met) {
                  if (!completedGoals.includes(goalKey2)) completedGoals.push(goalKey2);
                } else {
                  completedGoals = completedGoals.filter(k => k !== goalKey2);
                }
                if (obj3Met) {
                  if (!completedGoals.includes(goalKey3)) completedGoals.push(goalKey3);
                } else {
                  completedGoals = completedGoals.filter(k => k !== goalKey3);
                }
                setNetstartItem(`netstart_completed_goals_${missionId}`, JSON.stringify(completedGoals));
              } catch (e) { }
            }
          } else if (isVenusLevel2) {
            const parseRes = parseVenusLevel2Workspace(workspace.current, venus2ActivePanel, venus2SolvedPanels);
            setPlainEnglishCode(parseRes.cssCode);
            setJsCode(parseRes.cssCode);
            setVenus2Validation(parseRes.validation);
            const isSecDone = completedSections.includes(currentSection);
            const allBlocks = workspace.current.getAllBlocks(false);
            const hasTarget = allBlocks.some(b => b.type === 'venus2_target_panel');
            const hasFormat = allBlocks.some(b => b.type === 'venus2_style_display');
            const hasHorizontal = allBlocks.some(b => b.type === 'venus2_style_justify');
            const hasVertical = allBlocks.some(b => b.type === 'venus2_style_align');
            const allPanelsDone = venus2SolvedPanels[1] && venus2SolvedPanels[2] && venus2SolvedPanels[3] && venus2SolvedPanels[4] && venus2SolvedPanels[5];

            const obj1Met = hasTarget && hasFormat;
            const obj2Met = hasHorizontal && hasVertical;
            const obj3Met = allPanelsDone || parseRes.validation.allSolved;

            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.completed || obj.isClaimed) return obj;
                if (obj.id === 1) return { ...obj, completed: obj1Met };
                if (obj.id === 2) return { ...obj, completed: obj2Met };
                if (obj.id === 3) return { ...obj, completed: obj3Met };
                return obj;
              }));

              const goalKey1 = `${missionId}_sec${currentSection}_goal1`;
              const goalKey2 = `${missionId}_sec${currentSection}_goal2`;
              const goalKey3 = `${missionId}_sec${currentSection}_goal3`;

              try {
                let completedGoals: string[] = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
                let modified = false;
                if (obj1Met && !completedGoals.includes(goalKey1)) {
                  completedGoals.push(goalKey1);
                  modified = true;
                }
                if (obj2Met && !completedGoals.includes(goalKey2)) {
                  completedGoals.push(goalKey2);
                  modified = true;
                }
                if (obj3Met && !completedGoals.includes(goalKey3)) {
                  completedGoals.push(goalKey3);
                  modified = true;
                }
                if (modified) {
                  setNetstartItem(`netstart_completed_goals_${missionId}`, JSON.stringify(completedGoals));
                }
              } catch (e) { }
            }
          } else if (isVenusLevel3) {
            const parseRes = parseVenusLevel3Workspace(workspace.current, venus3ActiveTab);
            setPlainEnglishCode(parseRes.code);
            setJsCode(parseRes.code);
            if (venus3ActiveTab !== 'main') {
              venus3StylesRef.current[venus3ActiveTab] = parseRes.styles;
              setVenus3SectorStyles({ ...venus3StylesRef.current });
            } else {
              setVenus3LinkedStylesheets(parseRes.linkedStylesheets);
              if (parseRes.inlineStyles) {
                setVenus3InlineStyles(parseRes.inlineStyles);
                venus3InlineStylesRef.current = parseRes.inlineStyles;
              }
            }
            const isSecDone = completedSections.includes(currentSection);
            const linked = venus3ActiveTab === 'main' ? parseRes.linkedStylesheets : venus3LinkedStylesheets;
            const currInline = venus3ActiveTab === 'main' && parseRes.inlineStyles ? parseRes.inlineStyles : venus3InlineStylesRef.current;
            const alphaHasStyles = (venus3StylesRef.current.alpha && Object.keys(venus3StylesRef.current.alpha).length >= 1) || (venus3ActiveTab === 'alpha' && Object.keys(parseRes.styles).length >= 1);
            const betaHasStyles = (venus3StylesRef.current.beta && Object.keys(venus3StylesRef.current.beta).length >= 1) || (venus3ActiveTab === 'beta' && Object.keys(parseRes.styles).length >= 1);
            const gammaHasStyles = (venus3StylesRef.current.gamma && Object.keys(venus3StylesRef.current.gamma).length >= 1) || (venus3ActiveTab === 'gamma' && Object.keys(parseRes.styles).length >= 1);

            const obj1Met = Boolean(alphaHasStyles);
            const obj2Met = Boolean(betaHasStyles);
            const obj3Met = Boolean(gammaHasStyles);

            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.isClaimed || isReplayMode) return obj;
                if (obj.id === 1) return { ...obj, completed: obj1Met };
                if (obj.id === 2) return { ...obj, completed: obj2Met };
                if (obj.id === 3) return { ...obj, completed: obj3Met };
                return obj;
              }));
            }
          } else if (isMercuryLevel1) {
            const parseRes = parseMercuryLevel1Workspace(workspace.current);
            setPlainEnglishCode(parseRes.jsCode);
            setJsCode(parseRes.jsCode);

            // Keep visual diorama in pre-simulation state while dragging blocks; only update code & logs
            if (!isRunning) {
              setMercury1Validation({
                ...INITIAL_MERCURY_LEVEL_1_VALIDATION,
                jsCode: parseRes.jsCode,
                diagnosticLogs: parseRes.diagnosticLogs,
              });
            } else {
              setMercury1Validation(parseRes);
            }

            const isSecDone = completedSections.includes(currentSection);
            if (!isSecDone && isRunning) {
              setObjectives(prev => prev.map(obj => {
                if (obj.isClaimed || isReplayMode) return obj;
                if (obj.id === 1) return { ...obj, completed: parseRes.objective1Vents || parseRes.isVentsOpened };
                if (obj.id === 2) return { ...obj, completed: parseRes.isAllShrubsWatered && (parseRes.isAllFlowersWatered || (parseRes.wateredFlowerIndices && parseRes.wateredFlowerIndices.length >= 5)) };
                if (obj.id === 3) return { ...obj, completed: parseRes.objective3StarFlower || parseRes.isLilyWatered };
                return obj;
              }));
            }
          } else if (isMercuryLevel2) {
            const parseRes = parseMercuryLevel2Workspace(workspace.current);
            setPlainEnglishCode(parseRes.jsCode);
            setJsCode(parseRes.jsCode);
            setMercury2Validation(parseRes);

            const isSecDone = completedSections.includes(currentSection);
            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.isClaimed || isReplayMode) return obj;
                if (obj.id === 1) return { ...obj, completed: parseRes.objective2Variable };
                if (obj.id === 2) return { ...obj, completed: parseRes.objective3Logic };
                if (obj.id === 3) return { ...obj, completed: isSecDone };
                return obj;
              }));
            }
          } else if (isJupiterLevel1) {
            const parseRes = parseJupiterLevel1Workspace(workspace.current);
            setPlainEnglishCode(parseRes.javaCode);
            setJsCode(parseRes.javaCode);
            setJupiter1Validation(parseRes);

            const isSecDone = completedSections.includes(currentSection);
            const hasVariables = parseRes.variables.some(v => v.varType && v.varName && v.rawValue !== null);
            const hasActions = parseRes.actions.some(a => (a.type === 'enter_code' && a.varName) || a.type === 'unlock_doors');

            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.isClaimed || isReplayMode) return obj;
                if (obj.id === 1) return { ...obj, completed: hasVariables };
                if (obj.id === 2) return { ...obj, completed: hasActions };
                if (obj.id === 3) return { ...obj, completed: isSecDone };
                return obj;
              }));
            }
          } else if (isJupiterLevel2) {
            const pVal = parseJupiterLevel2Workspace(workspace.current);
            setPlainEnglishCode(pVal.javaCode);
            setJsCode(pVal.javaCode);
            setJupiter2Validation(pVal);

            const isSecDone = completedSections.includes(currentSection);
            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.isClaimed || isReplayMode) return obj;
                if (obj.id === 1) return { ...obj, completed: isJupiter2Wave1Complete };
                if (obj.id === 2) return { ...obj, completed: isJupiter2Wave2Complete };
                if (obj.id === 3) return { ...obj, completed: isSecDone };
                return obj;
              }));
            }
          } else if (isJupiterLevel3) {
            const pVal = parseJupiterLevel3Workspace(workspace.current);
            setPlainEnglishCode(pVal.rawJavaCode);
            setJsCode(pVal.rawJavaCode);
            setJupiter3Blueprint(pVal);

            const isSecDone = completedSections.includes(currentSection);
            const adminCls = pVal.classes['AdminProfile'];
            const techCls = pVal.classes['TechProfile'];
            const secCls = pVal.classes['SecurityProfile'];
            const visitorCls = pVal.classes['VisitorProfile'];

            const areAllProfilesConfigured = Boolean(
              adminCls && (adminCls.clearanceLevel || adminCls.hasPrivateClearance) && adminCls.role && (adminCls.methods?.length || 0) > 0 &&
              techCls && (techCls.clearanceLevel || techCls.hasPrivateClearance) && techCls.role && (techCls.methods?.length || 0) > 0 &&
              secCls && (secCls.clearanceLevel || secCls.hasPrivateClearance) && secCls.role && (secCls.methods?.length || 0) > 0 &&
              visitorCls && (visitorCls.clearanceLevel || visitorCls.hasPrivateClearance) && visitorCls.role && (visitorCls.methods?.length || 0) > 0
            );

            const hasAllBadges = pVal.instantiations.includes('AdminProfile') &&
              pVal.instantiations.includes('TechProfile') &&
              pVal.instantiations.includes('SecurityProfile') &&
              pVal.instantiations.includes('VisitorProfile');

            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.isClaimed || isReplayMode) return obj;
                if (obj.id === 2) return { ...obj, completed: areAllProfilesConfigured };
                if (obj.id === 3) return { ...obj, completed: isSecDone };
                return obj;
              }));
            }
          } else if (isSaturnLevel1) {
            const { state: pState, validation: pVal } = parseSaturnLevel1Workspace(workspace.current, saturnWave);
            const code = pVal.cppCode || generateSaturnCppCode(pState, saturnWave);
            setPlainEnglishCode(code);
            setJsCode(code);
            setSaturnWorkspaceState(pState);
            setSaturn1Validation(pVal);

            const isSecDone = completedSections.includes(currentSection);
            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.isClaimed || isReplayMode) return obj;
                if (obj.id === 1) return { ...obj, completed: pVal.hasStart && pVal.hasEnd };
                if (obj.id === 2) return { ...obj, completed: pVal.hasStringStorage && pVal.hasIntStorage && pVal.hasBoolStorage && pVal.hasLoop && pVal.hasCin && pVal.hasCout };
                if (obj.id === 3) return { ...obj, completed: saturnIsWon || isSecDone };
                return obj;
              }));
            }
          } else if (isSaturnLevel2) {
            const pVal = parseSaturnLevel2Workspace(workspace.current);
            setSaturn2Validation(pVal);
            setPlainEnglishCode(pVal.cppCode);
            setJsCode(pVal.cppCode);

            const isSecDone = completedSections.includes(currentSection);
            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.isClaimed || isReplayMode) return obj;
                if (obj.id === 1) return { ...obj, completed: Boolean(pVal.hasForLoop && pVal.hasSwitch) };
                if (obj.id === 2) return { ...obj, completed: Boolean(pVal.allSlotsFilled && !pVal.hasDuplicates) };
                if (obj.id === 3) return { ...obj, completed: isSecDone };
                return obj;
              }));
            }
          } else if (isSaturnLevel3) {
            const pVal = parseSaturnLevel3Workspace(workspace.current);
            setSaturn3Payload(pVal);
            setPlainEnglishCode(pVal.rawCppCode);
            setJsCode(pVal.rawCppCode);

            const isSecDone = completedSections.includes(currentSection);
            const hasAllPointers = pVal.declaredPointers.has('sensorPtr') && pVal.declaredPointers.has('debrisPtr') && pVal.declaredPointers.has('shieldPtr');
            const hasAllAllocations = 
              pVal.steps.some(s => s.type === 'ALLOCATE' && s.pointer === 'sensorPtr') &&
              pVal.steps.some(s => s.type === 'ALLOCATE' && s.pointer === 'debrisPtr') &&
              pVal.steps.some(s => s.type === 'ALLOCATE' && s.pointer === 'shieldPtr');
            const hasAllRuns = 
              pVal.steps.some(s => s.type === 'RUN_TASK' && s.task === 'RUN_SENSORS') &&
              pVal.steps.some(s => s.type === 'RUN_TASK' && s.task === 'RUN_DEBRIS') &&
              pVal.steps.some(s => s.type === 'RUN_TASK' && s.task === 'RUN_SHIELDS');

            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.isClaimed || isReplayMode) return obj;
                if (obj.id === 2) return { ...obj, completed: Boolean((hasAllPointers && hasAllAllocations) || (hasAllAllocations && hasAllRuns)) };
                if (obj.id === 3) return { ...obj, completed: isSecDone };
                return obj;
              }));
            }
          } else if (isEarthLevel1) {
            const activeSec = (workspace.current as any)?.currentSectionIndex ?? currentSection;
            const { state: pState, validation: pVal } = parseEarthLevel1Workspace(workspace.current, activeSec);
            const code = pVal.pythonCode || generateEarthPythonCode(pState, activeSec);
            setPlainEnglishCode(code);
            setJsCode(code);
            setEarthWorkspaceState(pState);
            setEarth1Validation(pVal);

            const isSecDone = completedSections.includes(currentSection);
            setObjectives(prev => prev.map(obj => {
              const secIdx = obj.id - 1;
              const isDone = completedSections.includes(secIdx) || obj.isClaimed || isReplayMode;
              if (secIdx === currentSection) {
                return { ...obj, completed: isDone };
              }
              return { ...obj, completed: isDone };
            }));
          } else if (isEarthLevel2) {
            if (earth2ActiveTabRef.current === 'tab1') {
              const pVal = parseEarth2Tab1Workspace(workspace.current);
              setEarth2Tab1Validation(pVal);
              setPlainEnglishCode(pVal.pythonCode);
              setJsCode(pVal.pythonCode);
              // Note: Objective 1 is verified strictly upon running simulation
            } else {
              const pVal = parseEarth2Tab2Workspace(workspace.current);
              setEarth2Tab2Validation(pVal);
              setPlainEnglishCode(pVal.pythonCode);
              setJsCode(pVal.pythonCode);
              if (pVal.allCorrect) {
                markObjectiveComplete(2);
              }
            }
          } else if (isEarthLevel3) {
            const pyCode = javascriptGenerator.workspaceToCode(workspace.current);
            setEarth3Code(pyCode);
            setPlainEnglishCode(pyCode);
            setJsCode(pyCode);

            const audit = auditEarth3Workspace(workspace.current, pyCode);
            setEarth3Audit(audit);

            const isSecDone = completedSections.includes(currentSection);
            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.isClaimed || isReplayMode) return obj;
                if (obj.id === 1) return { ...obj, completed: audit.completedObjectives[0] };
                if (obj.id === 2) return { ...obj, completed: audit.completedObjectives[1] };
                if (obj.id === 3) return { ...obj, completed: isSecDone };
                return obj;
              }));
            }
          } else if (isMercuryLevel3) {
            const activeTab = mercury3ActiveTabRef.current;
            let currentTabCode = '';
            if (activeTab === 'html') {
              currentTabCode = compileMercury3Html(workspace.current);
              mercury3HtmlCodeRef.current = currentTabCode;
              setMercury3HtmlCode(currentTabCode);
            } else if (activeTab === 'css') {
              currentTabCode = compileMercury3Css(workspace.current);
              mercury3CssCodeRef.current = currentTabCode;
              setMercury3CssCode(currentTabCode);
            } else if (activeTab === 'js') {
              currentTabCode = compileMercury3Js(workspace.current);
              mercury3JsCodeRef.current = currentTabCode;
              setMercury3JsCode(currentTabCode);
            }
            setPlainEnglishCode(currentTabCode);
            setJsCode(currentTabCode);

            const curHtml = activeTab === 'html' ? currentTabCode : (mercury3HtmlCodeRef.current || mercury3HtmlCode);
            const curCss = activeTab === 'css' ? currentTabCode : (mercury3CssCodeRef.current || mercury3CssCode);
            const curJs = activeTab === 'js' ? currentTabCode : (mercury3JsCodeRef.current || mercury3JsCode);
            const audit = auditMercury3Workspace(curHtml, curCss, curJs);
            setMercury3Audit(audit);

            const isSecDone = completedSections.includes(currentSection);
            if (!isSecDone) {
              setObjectives(prev => prev.map(obj => {
                if (obj.isClaimed || isReplayMode) return obj;
                if (obj.id === 1) return { ...obj, completed: audit.htmlStructureValid };
                if (obj.id === 2) return { ...obj, completed: audit.cssStylingValid };
                return obj;
              }));
            }
          } else {
            const english = generatePlainEnglishPseudocode(workspace.current);
            setPlainEnglishCode(english);
          }

          // Auto-save workspace XML state (blocks, coordinates, field options) to localStorage
          try {
            const xmlDom = Blockly.Xml.workspaceToDom(workspace.current);
            const xmlText = Blockly.Xml.domToText(xmlDom);
            const blockCount = workspace.current.getAllBlocks(false).length;
            if (
              userIdRef.current &&
              hasHydratedSavedSection.current &&
              !isRestoringWorkspaceRef.current &&
              blockCount > 0 &&
              xmlText &&
              xmlText !== '<xml xmlns="https://developers.google.com/blockly/xml"></xml>' &&
              xmlText !== '<xml xmlns="https://developers.google.com/blockly/xml"/>'
            ) {
              if (isEarthLevel2) {
                const tabKey = earth2ActiveTabRef.current;
                earth2WorkspaceStates.current[tabKey] = xmlText;
                setNetstartItem(`netstart_earth2_tab_${missionId}_${tabKey}`, xmlText);
              } else if (isMercuryLevel3) {
                const tabKey = mercury3ActiveTabRef.current;
                mercury3WorkspaceStates.current[tabKey] = xmlText;
                setNetstartItem(`netstart_mercury3_tab_${missionId}_${tabKey}`, xmlText);
              } else if (isJupiterLevel2) {
                const waveKey = jupiter2ActiveWaveRef.current;
                jupiter2WorkspaceStates.current[waveKey] = xmlText;
                setNetstartItem(`netstart_jupiter2_wave_${missionId}_${waveKey}`, xmlText);
                setNetstartItem(`netstart_jupiter2_active_wave_${missionId}`, String(waveKey));
                setNetstartItem('netstart_jupiter2_active_wave', String(waveKey));
              } else if (!isVenusLevel3 && !isMercuryLevel3) {
                setNetstartItem(`netstart_saved_workspace_${missionId}_${currentSectionRef.current}`, xmlText);
                if (isJupiterLevel3) {
                  setNetstartItem('netstart_saved_workspace_jupiter-3_0', xmlText);
                  setNetstartItem('netstart_saved_workspace_java-3_0', xmlText);
                }
                if (isSaturnLevel3) {
                  setNetstartItem('netstart_saved_workspace_saturn-3_0', xmlText);
                  setNetstartItem('netstart_saved_workspace_cpp-3_0', xmlText);
                }
                if (isEarthLevel3) {
                  setNetstartItem('netstart_saved_workspace_earth-3_0', xmlText);
                  setNetstartItem('netstart_saved_workspace_python-3_0', xmlText);
                }
              }
              if (isVenusLevel3) {
                setNetstartItem(`netstart_venus3_tab_${missionId}_${venus3ActiveTab}`, xmlText);
                setNetstartItem(`netstart_venus3_styles_${missionId}`, JSON.stringify(venus3StylesRef.current));
                venus3WorkspaceStates.current[venus3ActiveTab] = xmlText;
              }
              if (isMercuryLevel3) {
                setNetstartItem(`netstart_mercury3_tab_${missionId}_${mercury3ActiveTab}`, xmlText);
                mercury3WorkspaceStates.current[mercury3ActiveTab] = xmlText;
              }
              let completedGoals: string[] = [];
              try {
                completedGoals = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
              } catch (e) { }

              const saveState = {
                missionId,
                sectionIndex: currentSectionRef.current,
                xmlText,
                title: displayTitleRef.current,
                completedGoals,
                timestamp: Date.now()
              };
              setNetstartItem('netstart_active_saved_level', JSON.stringify(saveState));
              setNetstartItem('netstart_active_level', JSON.stringify({
                missionId,
                title: displayTitleRef.current,
                module: getMissionModuleForMission(missionId, isDailyRef.current),
                icon: planetIconRef.current,
                desc: getMissionDescForMission(missionId, isDailyRef.current),
                startedAt: new Date().toISOString()
              }));
            } else if (
              userId &&
              hasHydratedSavedSection.current &&
              !isRestoringWorkspaceRef.current &&
              (blockCount === 0 || !xmlText || xmlText === '<xml xmlns="https://developers.google.com/blockly/xml"></xml>' || xmlText === '<xml xmlns="https://developers.google.com/blockly/xml"/>')
            ) {
              if (isJupiterLevel2) {
                const waveKey = jupiter2ActiveWaveRef.current;
                jupiter2WorkspaceStates.current[waveKey] = '';
                removeNetstartItem(`netstart_jupiter2_wave_${missionId}_${waveKey}`);
              }
              if (isMercuryLevel3) {
                const activeTab = mercury3ActiveTabRef.current;
                mercury3WorkspaceStates.current[activeTab] = '';
                removeNetstartItem(`netstart_mercury3_tab_${missionId}_${activeTab}`);
              }
            }
          } catch (saveErr) {
            console.warn("Could not auto-save workspace state:", saveErr);
          }
        } catch (e) {
          console.warn("Live code generation warning:", e);
        }
      };

      // VENUS LEVEL 1 ONLY: Synchronize toolbox furniture blocks with sandbox
      const syncVenusLevel1Toolbox = (targetWs: Blockly.WorkspaceSvg) => {
        if (!isVenusLevel1) return;
        if (venusToolboxTimeoutRef.current) {
          clearTimeout(venusToolboxTimeoutRef.current);
        }
        venusToolboxTimeoutRef.current = setTimeout(() => {
          if (!workspace.current || workspace.current !== targetWs) return;
          if ((targetWs as any).isDragging?.()) return;

          const allBlocks = targetWs.getAllBlocks(false);
          const seenTypes = new Set<string>();
          const duplicateBlocks: any[] = [];

          for (const b of allBlocks) {
            if (b.type && b.type.startsWith('venus_target_')) {
              if (seenTypes.has(b.type)) {
                duplicateBlocks.push(b);
              } else {
                seenTypes.add(b.type);
              }
            }
          }

          if (duplicateBlocks.length > 0) {
            duplicateBlocks.forEach(dup => dup.dispose(false));
            showToast("Only one of each furniture item is allowed in the room!", { duration: 3000 });
          }

          const currentKey = Array.from(seenTypes).sort().join(',');
          if (currentKey !== lastVenusFurnitureKeyRef.current) {
            lastVenusFurnitureKeyRef.current = currentKey;
            targetWs.updateToolbox(getVenusLevel1Toolbox(seenTypes));
          }
        }, 80);
      };

      // VENUS LEVEL 3 ONLY: Synchronize toolbox selector blocks with sector workspace
      const syncVenusLevel3Toolbox = (targetWs: Blockly.WorkspaceSvg) => {
        if (!isVenusLevel3) return;
        if (venus3ToolboxTimeoutRef.current) {
          clearTimeout(venus3ToolboxTimeoutRef.current);
        }
        venus3ToolboxTimeoutRef.current = setTimeout(() => {
          if (!workspace.current || workspace.current !== targetWs) return;
          if ((targetWs as any).isDragging?.()) return;

          const allBlocks = targetWs.getAllBlocks(false);
          const invalidBlocks: Blockly.Block[] = [];
          for (const b of allBlocks) {
            if (!isBlockAllowedInTab(b.type, venus3ActiveTab)) {
              invalidBlocks.push(b);
            }
          }

          if (invalidBlocks.length > 0) {
            invalidBlocks.forEach(inv => {
              try { inv.dispose(false); } catch (e) { }
            });
            const tabName = venus3ActiveTab === 'main' ? 'index.html' : `${venus3ActiveTab}.css`;
            showToast(`Those blocks belong to another sector and cannot be used in ${tabName}!`, { duration: 4000 });
          }

          const validBlocks = targetWs.getAllBlocks(false);
          const seenTypes = new Set<string>();
          const duplicateBlocks: any[] = [];

          if (venus3ActiveTab === 'main') {
            for (const b of validBlocks) {
              if (b.type === 'venus3_inline_tower' || b.type === 'venus3_inline_background' || b.type === 'venus3_html_head') {
                if (seenTypes.has(b.type)) {
                  duplicateBlocks.push(b);
                } else {
                  seenTypes.add(b.type);
                }
              }
            }

            if (duplicateBlocks.length > 0) {
              duplicateBlocks.forEach(dup => dup.dispose(false));
              showToast("Only one of each Astrolink and Header block is allowed on the main page!", { duration: 3000 });
            }
          } else {
            for (const b of validBlocks) {
              if (b.type && b.type.startsWith('venus3_target_')) {
                if (seenTypes.has(b.type)) {
                  duplicateBlocks.push(b);
                } else {
                  seenTypes.add(b.type);
                }
              }
            }

            if (duplicateBlocks.length > 0) {
              duplicateBlocks.forEach(dup => dup.dispose(false));
              showToast("Only one of each selector block is allowed in this sector!", { duration: 3000 });
            }
          }

          const currentKey = `${venus3ActiveTab}:${Array.from(seenTypes).sort().join(',')}`;
          if (currentKey !== lastVenus3ToolboxKeyRef.current) {
            lastVenus3ToolboxKeyRef.current = currentKey;
            targetWs.updateToolbox(getVenusLevel3Toolbox(venus3ActiveTab, seenTypes));
          }
        }, 80);
      };

      // MARS LEVEL 2 ONLY: Synchronize toolbox billboard blocks with workspace
      const syncMarsLevel2Toolbox = (targetWs: Blockly.WorkspaceSvg) => {
        if (!isMarsLevel2) return;
        if (mars2ToolboxTimeoutRef.current) {
          clearTimeout(mars2ToolboxTimeoutRef.current);
        }
        mars2ToolboxTimeoutRef.current = setTimeout(() => {
          if (!workspace.current || workspace.current !== targetWs) return;
          if ((targetWs as any).isDragging?.()) return;

          const allBlocks = targetWs.getAllBlocks(false);
          const seenTypes = new Set<string>();
          const duplicateBlocks: any[] = [];

          for (const b of allBlocks) {
            if (b.type && b.type.startsWith('html_billboard_')) {
              if (seenTypes.has(b.type)) {
                duplicateBlocks.push(b);
              } else {
                seenTypes.add(b.type);
              }
            }
          }

          if (duplicateBlocks.length > 0) {
            duplicateBlocks.forEach(dup => dup.dispose(false));
            showToast("Only one of each billboard container is allowed!", { duration: 3000 });
          }

          const currentKey = Array.from(seenTypes).sort().join(',');
          if (currentKey !== lastMarsBillboardKeyRef.current) {
            lastMarsBillboardKeyRef.current = currentKey;
            targetWs.updateToolbox(getMarsLevel2Toolbox(seenTypes));
          }
        }, 80);
      };

      // EARTH LEVEL 2 ONLY: Synchronize toolbox single-use blocks (profiles, features, and planet items) with workspace
      const syncEarthLevel2Toolbox = (targetWs: Blockly.WorkspaceSvg) => {
        if (!isEarthLevel2 || currentSection !== 0) return;
        if (earth2ToolboxTimeoutRef.current) {
          clearTimeout(earth2ToolboxTimeoutRef.current);
        }
        earth2ToolboxTimeoutRef.current = setTimeout(() => {
          if (!workspace.current || workspace.current !== targetWs) return;
          if ((targetWs as any).isDragging?.()) return;

          const activeTab = earth2ActiveTabRef.current;
          const allBlocks = targetWs.getAllBlocks(false);
          const seenTypes = new Set<string>();

          if (activeTab === 'tab1') {
            for (const b of allBlocks) {
              if (
                b.type &&
                b.type.startsWith('earth2_val_') &&
                b.type !== 'earth2_val_rocky' &&
                b.type !== 'earth2_val_gas_giant'
              ) {
                seenTypes.add(b.type);
              }
            }
            const currentKey = 'tab1_' + Array.from(seenTypes).sort().join(',');
            if (currentKey !== lastEarth2ToolboxKeyRef.current) {
              lastEarth2ToolboxKeyRef.current = currentKey;
              targetWs.updateToolbox(getEarthLevel2Toolbox('tab1', seenTypes));
            }
          } else if (activeTab === 'tab2') {
            for (const b of allBlocks) {
              if (b.type && (b.type.startsWith('earth2_var_') || b.type === 'earth2_solar_system_list')) {
                seenTypes.add(b.type);
              }
            }
            const currentKey = 'tab2_' + Array.from(seenTypes).sort().join(',');
            if (currentKey !== lastEarth2ToolboxKeyRef.current) {
              lastEarth2ToolboxKeyRef.current = currentKey;
              targetWs.updateToolbox(getEarthLevel2Toolbox('tab2', seenTypes));
            }
          }
        }, 80);
      };

      const onWorkspaceChange = (e: any) => {
        if (!isRestoringWorkspaceRef.current && e && (e.type === Blockly.Events.BLOCK_DELETE || e.type === (Blockly.Events as any).DELETE)) {
          if (e && !(e as any).isUiEvent && ((e as any).blockId || (e as any).ids)) {
            showToastRef.current("Block deleted", {
              onUndo: () => {
                if (workspace.current) workspace.current.undo(false);
              },
              duration: 7000,
            });
          }
        }
        updateCodeLive();

        if (isVenusLevel1) {
          syncVenusLevel1Toolbox(ws);
        } else if (isVenusLevel3) {
          syncVenusLevel3Toolbox(ws);
        } else if (isMarsLevel2) {
          syncMarsLevel2Toolbox(ws);
        } else if (isEarthLevel2) {
          syncEarthLevel2Toolbox(ws);
        }
      };

      ws.addChangeListener(onWorkspaceChange);
      updateCodeLive();

      if (isVenusLevel1) {
        syncVenusLevel1Toolbox(ws);
      } else if (isVenusLevel3) {
        syncVenusLevel3Toolbox(ws);
      } else if (isMarsLevel2) {
        syncMarsLevel2Toolbox(ws);
      } else if (isEarthLevel2) {
        syncEarthLevel2Toolbox(ws);
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const activeEl = document.activeElement;
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            return;
          }
          if (workspace.current) {
            const selected = Blockly.getSelected();
            if (selected && typeof (selected as any).dispose === 'function' && (selected as any).type !== 'event_start' && (selected as any).isDeletable?.()) {
              (selected as any).dispose(true);
              showToastRef.current("Block deleted", {
                onUndo: () => {
                  if (workspace.current) workspace.current.undo(false);
                },
                duration: 7000,
              });
            }
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      // Left-clicking on empty workspace background unselects active block
      const handleBgClick = () => {
        if (workspace.current) {
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
        if (venusToolboxTimeoutRef.current) {
          clearTimeout(venusToolboxTimeoutRef.current);
        }
        if (venus3ToolboxTimeoutRef.current) {
          clearTimeout(venus3ToolboxTimeoutRef.current);
        }
        if (mars2ToolboxTimeoutRef.current) {
          clearTimeout(mars2ToolboxTimeoutRef.current);
        }
        if (workspace.current) {
          try {
            workspace.current.dispose();
          } catch (e) {
            console.warn("Workspace disposal warning:", e);
          }
          workspace.current = null;
        }
        if (blocklyDiv.current) {
          blocklyDiv.current.innerHTML = '';
        }
      };
    }
  }, [missionId]);

  // Sync Venus Level 2 toolbox with activePanel changes
  useEffect(() => {
    if (isVenusLevel2 && workspace.current) {
      try {
        workspace.current.updateToolbox(getVenusLevel2Toolbox(venus2ActivePanel));
        workspace.current.getAllBlocks(false).forEach(b => {
          if (b.type === 'event_start') {
            b.dispose(true);
          }
        });
        const parseRes = parseVenusLevel2Workspace(workspace.current, venus2ActivePanel, venus2SolvedPanels);
        setVenus2Validation(parseRes.validation);
        setPlainEnglishCode(parseRes.cssCode);
        setJsCode(parseRes.cssCode);
      } catch (e) { }
    }
  }, [isVenusLevel2, venus2ActivePanel, venus2SolvedPanels]);

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
    } catch (e) { }
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
    } catch (e) { }
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
    } catch (e) { }
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
      // Auto-save the previous section workspace before leaving it
      if (userId && hasHydratedSavedSection.current && !isRestoringWorkspaceRef.current) {
        try {
          const xmlDom = Blockly.Xml.workspaceToDom(workspace.current);
          const xmlText = Blockly.Xml.domToText(xmlDom);
          const blockCount = workspace.current.getAllBlocks(false).length;
          if (
            blockCount > 0 &&
            xmlText &&
            xmlText !== '<xml xmlns="https://developers.google.com/blockly/xml"></xml>' &&
            xmlText !== '<xml xmlns="https://developers.google.com/blockly/xml"/>'
          ) {
            if (isEarthLevel2) {
              const tabKey = earth2ActiveTabRef.current;
              earth2WorkspaceStates.current[tabKey] = xmlText;
              setNetstartItem(`netstart_earth2_tab_${missionId}_${tabKey}`, xmlText);
            } else {
              setNetstartItem(`netstart_saved_workspace_${missionId}_${currentSection}`, xmlText);
            }
          }
        } catch (e) { }
      }
    }
    setCurrentSection(sectionIndex);
    if (typeof window !== 'undefined') {
      (window as any).__NETSTART_CURRENT_SECTION__ = sectionIndex;
    }
    setShowErrorToast(false);

    if (isMarsLevel1) {
      // Mars 1 specific setup if any
    } else if (isLevel2) {
      setConveyorQueue(getSectionConveyorQueue(sectionIndex));
      setConveyorInventory({ cargo: 0, trash: 0, fuel: 0, food: 0, errors: 0 });
      setActiveAction('none');
      setIsBeltAdvancing(false);
      setIsScanning(false);
      setIsCurrentItemScanned(false);
      setAnimatingItem(null);
    } else if (isLevel3) {
      // Level 3 specific setup
    } else {
      const targetSection = currentMissionSections[sectionIndex] || currentMissionSections[0];
      setActiveGrid(targetSection.maze);
    }

    // Save target sectionIndex in active save level
    try {
      let completedGoals: string[] = [];
      try {
        completedGoals = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
      } catch (e) { }
      const targetSavedXml = getNetstartItem(`netstart_saved_workspace_${missionId}_${sectionIndex}`) || '';
      const saveState = {
        missionId,
        sectionIndex,
        xmlText: targetSavedXml,
        title: displayTitle,
        completedGoals,
        timestamp: Date.now()
      };
      setNetstartItem('netstart_active_saved_level', JSON.stringify(saveState));
    } catch (e) { }

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
    if (isEarthLevel2) {
      const targetTab = sectionIndex === 0 ? 'tab1' : 'tab2';
      setEarth2ActiveTab(targetTab);
    }
    if (workspace.current) {
      (workspace.current as any).currentSectionIndex = sectionIndex;
      workspace.current.updateToolbox(getToolboxForMission(missionId, sectionIndex));
      hasRestoredWorkspace.current = `${userId}_${missionId}_${sectionIndex}`;
      resetWorkspaceToDefaultStart(workspace.current, false, sectionIndex);
    }
  };

  const restartEntireLevel = useCallback(() => {
    executionIdRef.current++;
    if (bombDamageTimerRef.current) {
      clearTimeout(bombDamageTimerRef.current);
      bombDamageTimerRef.current = null;
    }

    let isAlreadyCompletedMission = false;
    try {
      const completedMissions: string[] = JSON.parse(getNetstartItem('netstart_completed_missions') || '[]');
      isAlreadyCompletedMission = completedMissions.includes(missionId);
    } catch (e) { }

    // 1. Only revert XP and clear progress if the level was NOT already completed previously
    if (!isAlreadyCompletedMission) {
      try {
        const claimedList: string[] = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
        const missionClaimed = claimedList.filter(k => k.startsWith(`${missionId}_`));
        if (missionClaimed.length > 0) {
          const xpToDeduct = missionClaimed.reduce((total, key) => {
            if (key.includes('_bonus')) return total + XP_REWARDS.SECTION_COMPLETION_BONUS;
            return total + XP_REWARDS.CAMPAIGN_GOAL;
          }, 0);
          removeXp(xpToDeduct);

          const remainingClaimed = claimedList.filter(k => !k.startsWith(`${missionId}_`));
          setNetstartItem('netstart_claimed_directives', JSON.stringify(remainingClaimed));
          setClaimedDirectives(remainingClaimed);
        }
      } catch (e) {
        console.warn("Failed to reset session XP:", e);
      }

      setCompletedSections([]);
      setIsReplayMode(false);
      try {
        removeNetstartItem(`netstart_completed_sections_${missionId}`);
        removeNetstartItem(`netstart_completed_goals_${missionId}`);
      } catch (e) { }
    }

    try {
      removeNetstartItem('netstart_active_saved_level');
      for (let i = 0; i < currentMissionSections.length; i++) {
        removeNetstartItem(`netstart_saved_workspace_${missionId}_${i}`);
      }
      if (isEarthLevel2) {
        const earth2Aliases = [missionId, 'earth-2', 'python-2'].filter(Boolean);
        earth2Aliases.forEach(id => {
          removeNetstartItem(`netstart_earth2_tab_${id}_tab1`);
          removeNetstartItem(`netstart_earth2_tab_${id}_tab2`);
          removeNetstartItem(`netstart_earth2_active_tab_${id}`);
          removeNetstartItem(`netstart_earth2_tab1_complete_${id}`);
          removeNetstartItem(`netstart_saved_workspace_${id}_0`);
          removeNetstartItem(`netstart_completed_goals_${id}`);
        });
      }
      if (isJupiterLevel2) {
        const jupiter2Aliases = [missionId, 'jupiter-2', 'java-2'].filter(Boolean);
        jupiter2Aliases.forEach(id => {
          removeNetstartItem(`netstart_jupiter2_wave_${id}_1`);
          removeNetstartItem(`netstart_jupiter2_wave_${id}_2`);
          removeNetstartItem(`netstart_jupiter2_wave_${id}_3`);
          removeNetstartItem(`netstart_jupiter2_active_wave_${id}`);
          removeNetstartItem(`netstart_jupiter2_wave1_complete_${id}`);
          removeNetstartItem(`netstart_jupiter2_wave2_complete_${id}`);
          removeNetstartItem(`netstart_saved_workspace_${id}_0`);
          removeNetstartItem(`netstart_completed_goals_${id}`);
        });
        removeNetstartItem('netstart_jupiter2_wave1_complete');
        removeNetstartItem('netstart_jupiter2_wave2_complete');
        removeNetstartItem('netstart_jupiter2_active_wave');
      }
      if (isJupiterLevel3) {
        const jupiter3Aliases = [missionId, 'jupiter-3', 'java-3'].filter(Boolean);
        jupiter3Aliases.forEach(id => {
          removeNetstartItem(`netstart_saved_workspace_${id}_0`);
          removeNetstartItem(`netstart_completed_goals_${id}`);
        });
      }
      if (isSaturnLevel3) {
        const saturn3Aliases = [missionId, 'saturn-3', 'cpp-3'].filter(Boolean);
        saturn3Aliases.forEach(id => {
          removeNetstartItem(`netstart_saved_workspace_${id}_0`);
          removeNetstartItem(`netstart_completed_goals_${id}`);
        });
      }
    } catch (e) { }

    // 3. Reset to Section 1 (index 0)
    setCurrentSection(0);
    if (isEarthLevel2) {
      setIsRunning(false);
      setIsEarth2Tab1Complete(false);
      setEarth2ActiveTab('tab1');
      earth2ActiveTabRef.current = 'tab1';
      earth2WorkspaceStates.current = { tab1: '', tab2: '' };
      setEarth2Tab1Validation(INITIAL_EARTH_2_TAB1_VALIDATION);
      setEarth2Tab2Validation(INITIAL_EARTH_2_TAB2_VALIDATION);
      lastEarth2ToolboxKeyRef.current = '';
      setSimulationResetKey(prev => prev + 1);
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = 0;
        workspace.current.clear();
        if (typeof (workspace.current as any).clearUndo === 'function') {
          (workspace.current as any).clearUndo();
        }
        workspace.current.updateToolbox(getEarthLevel2Toolbox('tab1'));
        resetWorkspaceToDefaultStart(workspace.current, true);
      }
    } else if (isJupiterLevel2) {
      setIsRunning(false);
      setIsJupiter2Wave1Complete(false);
      setIsJupiter2Wave2Complete(false);
      setJupiter2ActiveWave(1);
      jupiter2ActiveWaveRef.current = 1;
      setJupiter2Validation(INITIAL_JUPITER_2_VALIDATION);
      jupiter2WorkspaceStates.current = { 1: '', 2: '', 3: '' };
      setJupiter2ResetKey(prev => prev + 1);
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = 0;
        workspace.current.clear();
        if (typeof (workspace.current as any).clearUndo === 'function') {
          (workspace.current as any).clearUndo();
        }
        workspace.current.updateToolbox(getJupiterLevel2Toolbox(1));
        Blockly.svgResize(workspace.current);
      }
    } else if (isJupiterLevel3) {
      handleJupiter3Reset();
    } else if (isSaturnLevel3) {
      handleSaturn3Reset();
    } else if (isMercuryLevel3) {
      handleMercury3Reset();
    } else if (isEarthLevel3) {
      handleEarth3Reset();
    } else if (isMarsLevel1 || isMarsLevel2 || isMarsLevel3 || isVenusLevel1 || isVenusLevel2 || isVenusLevel3 || isMercuryLevel1 || isMercuryLevel2) {
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = 0;
        workspace.current.updateToolbox(getToolboxForMission(missionId, 0));
        resetWorkspaceToDefaultStart(workspace.current);
      }
    } else if (isLevel2) {
      if (dailySection?.name === 'Master Sorting Gauntlet') {
        setConveyorQueue(getSectionConveyorQueue(3));
      } else {
        setConveyorQueue(getSectionConveyorQueue(0));
      }
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
      setLevel3ReactorState({ allocatedOxygen: 0, allocatedShields: 0, allocatedThrusters: 0, remainingPower: 100, isBalanced: false });
      setLevel3WarpState({ boostActive: false, shieldsActive: false, warpActive: false, isWarping: false });
      if (fuelSynthRef.current) {
        fuelSynthRef.current.resetSimulation();
      }
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = 0;
        workspace.current.updateToolbox(getToolboxForMission(missionId, 0));
        resetWorkspaceToDefaultStart(workspace.current);
      }
    } else {
      setActiveGrid(currentMissionSections[0]?.maze || [[1]]);
      setCharState({ ...(currentMissionSections[0]?.initialState || { x: 0, y: 0, direction: 0 }) });
      if (workspace.current) {
        (workspace.current as any).currentSectionIndex = 0;
        workspace.current.updateToolbox(getToolboxForMission(missionId, 0));
        resetWorkspaceToDefaultStart(workspace.current);
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

    // Restore objective state for Section 1
    setObjectives(firstSection.objectives.map(o => ({
      ...o,
      completed: isAlreadyCompletedMission || isReplayMode,
      isClaimed: isAlreadyCompletedMission || isReplayMode,
    })));

    if (workspace.current) {
      resetWorkspaceToDefaultStart(workspace.current);
      workspace.current.highlightBlock(null);
    }

    if (isVenusLevel2) {
      setVenus2SolvedPanels({ 1: false, 2: false, 3: false, 4: false, 5: false });
      setVenus2ActivePanel(1);
      setVenus2Validation(INITIAL_VENUS_LEVEL_2_VALIDATION);
    }

    if (isVenusLevel3) {
      setVenus3SolvedSectors({ alpha: false, beta: false, gamma: false });
      setVenus3ActiveTab('main');
      setVenus3SectorStyles({});
      venus3StylesRef.current = {};
      venus3WorkspaceStates.current = { main: '', alpha: '', beta: '', gamma: '' };
      setVenus3LinkedStylesheets([]);
      setVenus3InlineStyles({});
      venus3InlineStylesRef.current = {};
      try {
        removeNetstartItem('netstart_venus3_solved_sectors');
        removeNetstartItem('netstart_venus3_active_tab');
        removeNetstartItem(`netstart_venus3_active_tab_${missionId}`);
        removeNetstartItem(`netstart_venus3_styles_${missionId}`);
        removeNetstartItem(`netstart_venus3_tab_${missionId}_main`);
        removeNetstartItem(`netstart_venus3_tab_${missionId}_alpha`);
        removeNetstartItem(`netstart_venus3_tab_${missionId}_beta`);
        removeNetstartItem(`netstart_venus3_tab_${missionId}_gamma`);
      } catch (e) { }
    }

    if (isMercuryLevel1) {
      setIsRunning(false);
      setMercury1Validation(INITIAL_MERCURY_LEVEL_1_VALIDATION);
      try {
        removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      } catch (e) { }
    }

    if (isMercuryLevel2) {
      setIsRunning(false);
      setMercury2Validation(INITIAL_MERCURY_LEVEL_2_VALIDATION);
      try {
        removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      } catch (e) { }
    }

    if (isJupiterLevel1) {
      setIsRunning(false);
      setJupiter1Validation(INITIAL_JUPITER_LEVEL_1_VALIDATION);
      try {
        removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      } catch (e) { }
    }

    if (isJupiterLevel2) {
      setIsRunning(false);
      setIsJupiter2Wave1Complete(false);
      setIsJupiter2Wave2Complete(false);
      setJupiter2ActiveWave(1);
      jupiter2ActiveWaveRef.current = 1;
      setJupiter2Validation(INITIAL_JUPITER_2_VALIDATION);
      jupiter2WorkspaceStates.current = { 1: '', 2: '', 3: '' };
      setJupiter2ResetKey(prev => prev + 1);
      try {
        const jupiter2Aliases = [missionId, 'jupiter-2', 'java-2'].filter(Boolean);
        jupiter2Aliases.forEach(id => {
          removeNetstartItem(`netstart_saved_workspace_${id}_0`);
          removeNetstartItem(`netstart_jupiter2_wave_${id}_1`);
          removeNetstartItem(`netstart_jupiter2_wave_${id}_2`);
          removeNetstartItem(`netstart_jupiter2_wave_${id}_3`);
          removeNetstartItem(`netstart_jupiter2_active_wave_${id}`);
          removeNetstartItem(`netstart_jupiter2_wave1_complete_${id}`);
          removeNetstartItem(`netstart_jupiter2_wave2_complete_${id}`);
        });
        removeNetstartItem('netstart_jupiter2_wave1_complete');
        removeNetstartItem('netstart_jupiter2_wave2_complete');
        removeNetstartItem('netstart_jupiter2_active_wave');
      } catch (e) { }
      if (workspace.current) {
        workspace.current.clear();
        if (typeof (workspace.current as any).clearUndo === 'function') {
          (workspace.current as any).clearUndo();
        }
        workspace.current.updateToolbox(getJupiterLevel2Toolbox(1));
        Blockly.svgResize(workspace.current);
      }
    }

    if (isJupiterLevel3) {
      handleJupiter3Reset();
    }

    if (isSaturnLevel3) {
      handleSaturn3Reset();
    }

    if (isMercuryLevel3) {
      handleMercury3Reset();
    }

    if (isSaturnLevel1) {
      setIsRunning(false);
      setSaturn1Validation(INITIAL_SATURN_LEVEL_1_VALIDATION);
      setSaturnWorkspaceState(INITIAL_SATURN_WORKSPACE);
      setSaturnIsWon(false);
      try {
        removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
      } catch (e) { }
    }

    if (isSaturnLevel2) {
      setIsRunning(false);
      setSaturn2Validation(INITIAL_SATURN_2_VALIDATION);
      setSaturn2UfoGreeted(false);
      setSaturn2ShieldActivated(false);
      setSaturn2ResetKey(prev => prev + 1);
      try {
        const saturn2Aliases = [missionId, 'saturn-2', 'cpp-2'].filter(Boolean);
        saturn2Aliases.forEach(id => {
          removeNetstartItem(`netstart_saved_workspace_${id}_0`);
        });
      } catch (e) { }
      if (workspace.current) {
        workspace.current.clear();
        if (typeof (workspace.current as any).clearUndo === 'function') {
          (workspace.current as any).clearUndo();
        }
      }
    }

    if (isEarthLevel1) {
      setIsRunning(false);
      setEarth1Validation(INITIAL_EARTH_1_VALIDATION);
      setEarthWorkspaceState(INITIAL_EARTH_1_WORKSPACE);
      const earthAliases = [missionId, 'earth-1', 'python-1', 'earth'].filter(Boolean);
      try {
        earthAliases.forEach(id => {
          removeNetstartItem(`netstart_saved_workspace_${id}_0`);
          removeNetstartItem(`netstart_saved_workspace_${id}_1`);
          removeNetstartItem(`netstart_saved_workspace_${id}_2`);
          removeNetstartItem(`netstart_completed_goals_${id}`);
        });
      } catch (e) { }
    }

    if (isEarthLevel2) {
      setIsRunning(false);
      setIsEarth2Tab1Complete(false);
      setEarth2ActiveTab('tab1');
      earth2ActiveTabRef.current = 'tab1';
      setEarth2Tab1Validation(INITIAL_EARTH_2_TAB1_VALIDATION);
      setEarth2Tab2Validation(INITIAL_EARTH_2_TAB2_VALIDATION);
      earth2WorkspaceStates.current = { tab1: '', tab2: '' };
      lastEarth2ToolboxKeyRef.current = '';
      setSimulationResetKey(prev => prev + 1);
      const earth2Aliases = [missionId, 'earth-2', 'python-2'].filter(Boolean);
      try {
        earth2Aliases.forEach(id => {
          removeNetstartItem(`netstart_earth2_tab_${id}_tab1`);
          removeNetstartItem(`netstart_earth2_tab_${id}_tab2`);
          removeNetstartItem(`netstart_earth2_active_tab_${id}`);
          removeNetstartItem(`netstart_earth2_tab1_complete_${id}`);
          removeNetstartItem(`netstart_saved_workspace_${id}_0`);
          removeNetstartItem(`netstart_completed_goals_${id}`);
        });
      } catch (e) { }
      if (workspace.current) {
        workspace.current.clear();
        if (typeof (workspace.current as any).clearUndo === 'function') {
          (workspace.current as any).clearUndo();
        }
        workspace.current.updateToolbox(getEarthLevel2Toolbox('tab1'));
      }
    }

    setIsPaused(false);
  }, [missionId, isMarsLevel1, isVenusLevel1, isVenusLevel2, isVenusLevel3, isMercuryLevel1, isMercuryLevel2, isMercuryLevel3, isJupiterLevel1, isSaturnLevel1, isEarthLevel1, isEarthLevel2, removeXp, resetWorkspaceToDefaultStart, isLevel2, isLevel3, currentMissionSections, dailySection?.name, handleMercury3Reset]);

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
    setSimulationResetKey(prev => prev + 1);
    setIsBumping(false);
    setIsWarningPulse(false);
    setIsStartError(false);
    setShowStartToast(false);
    setShowEndToast(false);
    setShowOverloadToast(false);
    setShowErrorToast(false);
    setShowPopup(false);
    try {
      const completedGoals: string[] = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
      const compSections: number[] = JSON.parse(getNetstartItem(`netstart_completed_sections_${missionId}`) || '[]');
      const completedMissions: string[] = JSON.parse(getNetstartItem('netstart_completed_missions') || '[]');
      const isMissionDone = completedMissions.some((m: string) => m.toLowerCase() === missionId.toLowerCase());
      const isSecDone = compSections.includes(currentSection);
      setObjectives(prev => prev.map(o => {
        const goalKey = `${missionId}_sec${currentSection}_goal${o.id}`;
        if (isReplayMode || isMissionDone || completedGoals.includes(goalKey) || isSecDone) {
          return { ...o, completed: true };
        }
        if (isSaturnLevel1 && workspace.current) {
          const { validation: pVal } = parseSaturnLevel1Workspace(workspace.current, saturnWave);
          if (o.id === 1) return { ...o, completed: Boolean(pVal.hasStart && pVal.hasEnd) };
          if (o.id === 2) return { ...o, completed: Boolean(pVal.hasStringStorage && pVal.hasIntStorage && pVal.hasBoolStorage && pVal.hasLoop && pVal.hasCin && pVal.hasCout) };
          if (o.id === 3) return { ...o, completed: saturnIsWon };
        }
        if (isSaturnLevel2 && workspace.current) {
          const pVal = parseSaturnLevel2Workspace(workspace.current);
          if (o.id === 1) return { ...o, completed: Boolean(pVal.hasStart && pVal.hasEnd) };
          if (o.id === 2) return { ...o, completed: Boolean(pVal.hasShield || pVal.hasGreetUfo || saturn2ShieldActivated || saturn2UfoGreeted) };
          if (o.id === 3) return { ...o, completed: isSecDone };
        }
        if (isEarthLevel1 && workspace.current) {
          const { state: pState, validation: pVal } = parseEarthLevel1Workspace(workspace.current, currentSection);
          if (o.id === 1) return { ...o, completed: Boolean(pState.hasSlice) };
          if (o.id === 2) return { ...o, completed: Boolean(pState.hasReplace || pState.hasSplit) };
          if (o.id === 3) return { ...o, completed: Boolean(pVal.isCorrect) };
        }
        if (isEarthLevel2) {
          const uKey = `${missionId}_sec0_goal${o.id}`;
          const isDone = isReplayMode || isMissionDone || completedGoals.includes(uKey);
          if (o.id === 1) return { ...o, completed: isDone || isEarth2Tab1Complete };
          if (o.id === 2) return { ...o, completed: isDone || earth2Tab2Validation.allCorrect };
          if (o.id === 3) return { ...o, completed: isDone || earth2Tab2Validation.allCorrect };
          return { ...o, completed: isDone };
        }
        return { ...o, completed: false };
      }));
    } catch {
      setObjectives(prev => prev.map(o => ({ ...o, completed: isReplayMode })));
    }

    if (isVenusLevel2) {
      setIsRunning(false);
    } else if (isVenusLevel3) {
      setIsRunning(false);
      setVenus3ScanPhase(null);
      setVenus3ScanResults({ alpha: null, beta: null, gamma: null });
      setVenus3FailedSectors([]);
      venus3ScanTimeoutsRef.current.forEach(t => clearTimeout(t));
      venus3ScanTimeoutsRef.current = [];
      if (venus3ScanTimerRef.current) {
        clearTimeout(venus3ScanTimerRef.current);
        venus3ScanTimerRef.current = null;
      }
      if (venus3FailedTimerRef.current) {
        clearTimeout(venus3FailedTimerRef.current);
        venus3FailedTimerRef.current = null;
      }
    } else if (isMarsLevel1 || isVenusLevel1) {
      // In Mars Level 1 and Venus Level 1, resetGame stops running simulation and resets view state while preserving workspace blocks
      setIsRunning(false);
    } else if (isMercuryLevel1) {
      setIsRunning(false);
      setMercury1Validation(INITIAL_MERCURY_LEVEL_1_VALIDATION);
    } else if (isMercuryLevel2) {
      setIsRunning(false);
      setMercury2Validation(INITIAL_MERCURY_LEVEL_2_VALIDATION);
    } else if (isMercuryLevel3) {
      setIsRunning(false);
      setMercury3SimulationActive(false);
      setMercury3ResetKey(prev => prev + 1);
    } else if (isJupiterLevel1) {
      setIsRunning(false);
      setJupiter1Validation(INITIAL_JUPITER_LEVEL_1_VALIDATION);
    } else if (isJupiterLevel2) {
      setIsRunning(false);
      // Preserve workspace blocks & turret assignments! Re-parse current blocks without clearing.
      if (workspace.current) {
        const pVal = parseJupiterLevel2Workspace(workspace.current);
        setJupiter2Validation(pVal);
      } else {
        setJupiter2Validation(INITIAL_JUPITER_2_VALIDATION);
      }
      setJupiter2ResetKey(prev => prev + 1);
    } else if (isJupiterLevel3) {
      setIsRunning(false);
      setJupiter3ResetKey(prev => prev + 1);
    } else if (isSaturnLevel1) {
      setIsRunning(false);
      setSaturnWave(1);
      setSaturnIsWon(false);
      prevSaturnLocksRef.current = 0;
      // Preserve workspace blocks! Re-parse current blocks without clearing workspace.
      if (workspace.current) {
        const { state, validation } = parseSaturnLevel1Workspace(workspace.current, 1);
        setSaturnWorkspaceState(state);
        setSaturn1Validation(validation);
      }
    } else if (isSaturnLevel2) {
      setIsRunning(false);
      setSaturn2ResetKey(prev => prev + 1);
    } else if (isSaturnLevel3) {
      setIsRunning(false);
      setSaturn3ResetKey(prev => prev + 1);
      setSaturn2UfoGreeted(false);
      setSaturn2ShieldActivated(false);
      if (workspace.current) {
        const pVal = parseSaturnLevel2Workspace(workspace.current);
        setSaturn2Validation(pVal);
      }
    } else if (isEarthLevel1) {
      setIsRunning(false);
      if (workspace.current) {
        const { state, validation } = parseEarthLevel1Workspace(workspace.current, currentSection);
        setEarthWorkspaceState(state);
        setEarth1Validation(validation);
      }
    } else if (isEarthLevel2) {
      setIsRunning(false);
      if (workspace.current) {
        if (currentSection === 0) {
          const pVal = parseEarth2Section1Workspace(workspace.current);
          setEarth2Tab1Validation(pVal);
        } else {
          const pVal = parseEarth2Section2Workspace(workspace.current);
          setEarth2Tab2Validation(pVal);
        }
      }
    } else if (isMarsLevel3) {
      setIsRunning(false);
      setMars3Phase('assembly');
      setMars3MercuryPinged(false);
      setMars3VenusPinged(false);
    } else if (isLevel2) {
      if (dailySection?.name === 'Master Sorting Gauntlet') {
        setConveyorQueue(getSectionConveyorQueue(3));
      } else {
        setConveyorQueue(getSectionConveyorQueue(currentSection));
      }
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

    // Reset state and evaluate objectives fresh for this execution run (preserving already achieved milestones)
    try {
      const completedGoals: string[] = JSON.parse(getNetstartItem(`netstart_completed_goals_${missionId}`) || '[]');
      const compSections: number[] = JSON.parse(getNetstartItem(`netstart_completed_sections_${missionId}`) || '[]');
      const completedMissions: string[] = JSON.parse(getNetstartItem('netstart_completed_missions') || '[]');
      const isMissionDone = completedMissions.some((m: string) => m.toLowerCase() === missionId.toLowerCase());
      const isSecDone = compSections.includes(currentSection);
      setObjectives(prev => prev.map(o => {
        const goalKey = `${missionId}_sec${currentSection}_goal${o.id}`;
        if (isReplayMode || isMissionDone || completedGoals.includes(goalKey) || isSecDone) {
          return { ...o, completed: true };
        }
        if (isJupiterLevel2 && workspace.current) {
          const pVal = parseJupiterLevel2Workspace(workspace.current);
          if (o.id === 1) return { ...o, completed: Boolean(pVal.hasTry && pVal.hasCatch) };
          if (o.id === 2) return { ...o, completed: Boolean(pVal.allCatchValid && pVal.turretLogic.length > 0) };
          if (o.id === 3) return { ...o, completed: isSecDone };
        }
        if (isJupiterLevel3 && workspace.current) {
          const pVal = parseJupiterLevel3Workspace(workspace.current);
          const adminCls = pVal.classes['AdminProfile'];
          const techCls = pVal.classes['TechProfile'];
          const secCls = pVal.classes['SecurityProfile'];
          const visitorCls = pVal.classes['VisitorProfile'];

          const areAllProfilesConfigured = Boolean(
            adminCls && (adminCls.clearanceLevel || adminCls.hasPrivateClearance) && adminCls.role && (adminCls.methods?.length || 0) > 0 &&
            techCls && (techCls.clearanceLevel || techCls.hasPrivateClearance) && techCls.role && (techCls.methods?.length || 0) > 0 &&
            secCls && (secCls.clearanceLevel || secCls.hasPrivateClearance) && secCls.role && (secCls.methods?.length || 0) > 0 &&
            visitorCls && (visitorCls.clearanceLevel || visitorCls.hasPrivateClearance) && visitorCls.role && (visitorCls.methods?.length || 0) > 0
          );

          const hasAllBadges = pVal.instantiations.includes('AdminProfile') &&
            pVal.instantiations.includes('TechProfile') &&
            pVal.instantiations.includes('SecurityProfile') &&
            pVal.instantiations.includes('VisitorProfile');
          if (o.id === 2) return { ...o, completed: areAllProfilesConfigured };
          if (o.id === 3) return { ...o, completed: isSecDone };
        }
        if (isSaturnLevel1 && workspace.current) {
          const { validation: pVal } = parseSaturnLevel1Workspace(workspace.current, saturnWave);
          if (o.id === 1) return { ...o, completed: Boolean(pVal.hasStart && pVal.hasEnd) };
          if (o.id === 2) return { ...o, completed: Boolean(pVal.hasStringStorage && pVal.hasIntStorage && pVal.hasBoolStorage && pVal.hasLoop && pVal.hasCin && pVal.hasCout) };
          if (o.id === 3) return { ...o, completed: saturnIsWon };
        }
        if (isSaturnLevel2 && workspace.current) {
          const pVal = parseSaturnLevel2Workspace(workspace.current);
          if (o.id === 1) return { ...o, completed: Boolean(pVal.hasStart && pVal.hasEnd) };
          if (o.id === 2) return { ...o, completed: Boolean(pVal.hasShield || pVal.hasGreetUfo || saturn2ShieldActivated || saturn2UfoGreeted) };
          if (o.id === 3) return { ...o, completed: isSecDone };
        }
        if (isSaturnLevel3 && workspace.current) {
          const pVal = parseSaturnLevel3Workspace(workspace.current);
          const hasAllPointers = pVal.declaredPointers.has('sensorPtr') && pVal.declaredPointers.has('debrisPtr') && pVal.declaredPointers.has('shieldPtr');
          const hasAllAllocations = 
            pVal.steps.some(s => s.type === 'ALLOCATE' && s.pointer === 'sensorPtr') &&
            pVal.steps.some(s => s.type === 'ALLOCATE' && s.pointer === 'debrisPtr') &&
            pVal.steps.some(s => s.type === 'ALLOCATE' && s.pointer === 'shieldPtr');
          const hasAllRuns = 
            pVal.steps.some(s => s.type === 'RUN_TASK' && s.task === 'RUN_SENSORS') &&
            pVal.steps.some(s => s.type === 'RUN_TASK' && s.task === 'RUN_DEBRIS') &&
            pVal.steps.some(s => s.type === 'RUN_TASK' && s.task === 'RUN_SHIELDS');
          if (o.id === 2) return { ...o, completed: Boolean((hasAllPointers && hasAllAllocations) || (hasAllAllocations && hasAllRuns)) };
          if (o.id === 3) return { ...o, completed: isSecDone };
        }
        if (isEarthLevel1 && workspace.current) {
          const secIdx = o.id - 1;
          const isDone = compSections.includes(secIdx) || completedGoals.includes(`${missionId}_goal_${o.id}`);
          if (secIdx === currentSection) {
            return { ...o, completed: isDone };
          }
          return { ...o, completed: isDone };
        }
        if (isEarthLevel2) {
          const uKey = `${missionId}_sec0_goal${o.id}`;
          const isDone = isReplayMode || isMissionDone || completedGoals.includes(uKey);
          if (o.id === 1) return { ...o, completed: isDone || isEarth2Tab1Complete };
          if (o.id === 2) return { ...o, completed: isDone || earth2Tab2Validation.allCorrect };
          if (o.id === 3) return { ...o, completed: isDone || earth2Tab2Validation.allCorrect };
          return { ...o, completed: isDone };
        }
        return { ...o, completed: false };
      }));
    } catch {
      setObjectives(prev => prev.map(o => ({ ...o, completed: isReplayMode })));
    }
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
    // MARS LEVEL 1: THE BLANK BILLBOARD SIMULATION HANDLER
    // =========================================================================
    if (isMarsLevel1) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);
      const parseRes = parseWorkspaceHtml(workspace.current);
      const validation = parseRes.validation;

      // Check if sandbox has content blocks placed
      const hasContentBlocks = allBlocks.some(b => b.type === 'html_h1' || b.type === 'html_h3' || b.type === 'html_p');
      if (allBlocks.length === 0 || !hasContentBlocks) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage("Your billboard is empty! Place Title, Subtitle, and Text blocks into the sandbox to start building.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      setIsRunning(true);
      setMarsParsedElements(parseRes.elements);
      setMarsValidation(validation);

      // Objective checks for Mars Level 1
      if (validation.matchedCount === 3) {
        markObjectiveComplete(1);
      }
      if (validation.hasModifier) {
        markObjectiveComplete(2);
      }
      if (validation.ratingScore === 5) {
        markObjectiveComplete(3);
      }

      const htmlCode = javascriptGenerator.workspaceToCode(workspace.current);
      setJsCode(htmlCode);
      setPlainEnglishCode(htmlCode);

      // Reset isRunning after the 20-second cutscene finishes so the user can easily re-run.
      setTimeout(() => {
        setIsRunning(false);
      }, 20000);
      return;
    }

    // =========================================================================
    // MARS LEVEL 2: FIX IMAGES BILLBOARD SIMULATION HANDLER
    // =========================================================================
    if (isMarsLevel2) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);
      const parseRes = parseMarsLevel2Workspace(workspace.current);
      const validation = parseRes.validation;

      const hasContainers = allBlocks.some(b => b.type.startsWith('html_billboard') || b.type === 'html_div');
      const hasImgs = allBlocks.some(b => b.type === 'html_img');
      if (allBlocks.length === 0 || (!hasContainers && !hasImgs)) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage("Your workspace is empty! Connect <img> blocks inside Billboard containers to populate billboard images.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      setIsRunning(true);
      setMars2Validation(validation);

      const captionCount = validation.customizations?.filter(c => c.caption || c.headline)?.length || 0;
      if (captionCount >= 2) {
        markObjectiveComplete(1);
      }
      const allContainersPopulated = validation.totalContainers === 5 && validation.assignedImages?.every(img => img !== null) && !validation.hasErrors;
      if (allContainersPopulated) {
        markObjectiveComplete(2);
      }
      if (validation.isAllMatched) {
        markObjectiveComplete(3);
      }

      const htmlCode = javascriptGenerator.workspaceToCode(workspace.current);
      setJsCode(htmlCode);
      setPlainEnglishCode(htmlCode);
      return;
    }

    // =========================================================================
    // MARS LEVEL 3: THE TRANSMISSION DASHBOARD (FORMS) SIMULATION HANDLER
    // =========================================================================
    if (isMarsLevel3) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);
      const parseRes = parseMarsLevel3Workspace(workspace.current);
      const validation = parseRes.validation;

      // Phase 2 & 3: If in Sandbox, button proceeds when objectives completed
      if (mars3Phase === 'sandbox') {
        if (mars3MercuryPinged && mars3VenusPinged && mars3StatusOpened && mars3Validation.hasTitle) {
          const htmlCode = workspace.current ? javascriptGenerator.workspaceToCode(workspace.current) : '';
          handleMars3Success(htmlCode);
        } else if (!mars3Validation.hasTitle) {
          setErrorToastMessage("Give your form design a title first!");
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        } else if (!mars3StatusOpened) {
          setErrorToastMessage("Open and read an incoming transmission from space before proceeding!");
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        } else if (!mars3Validation.hasMercuryOption) {
          setErrorToastMessage("Option: Mercury was not included in your Dropdown Menu! Return to your workspace and add Option: Mercury to reach Mercury.");
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        } else if (!mars3Validation.hasVenusOption) {
          setErrorToastMessage("Option: Venus was not included in your Dropdown Menu! Return to your workspace and add Option: Venus to reach Venus.");
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        } else {
          setErrorToastMessage("Send a message to both Mercury and Venus before proceeding!");
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        }
        return;
      }

      // Phase 1: Validate Form Assembly
      if (allBlocks.length === 0) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage("Your workspace is empty! Wrap your Dropdown Menu with planet options, Message Input, and Send Button inside the Form Container.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (!validation.canDeploy) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(validation.deployErrorMessage || "Make sure your Form Container holds a Dropdown Menu, Message Input, and Send Button!");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      setIsRunning(true);
      setMars3Validation(validation);
      if (validation.hasTitle) {
        markObjectiveComplete(1);
      }

      const htmlCode = javascriptGenerator.workspaceToCode(workspace.current);
      setJsCode(htmlCode);
      setPlainEnglishCode(htmlCode);
      return;
    }

    // =========================================================================
    // VENUS LEVEL 1: THE MONOCHROMATIC PROTOTYPE (CSS SELECTORS & COLORS)
    // =========================================================================
    if (isVenusLevel1) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);
      const parseRes = parseVenusLevel1Workspace(workspace.current);
      const validation = parseRes.validation;

      if (allBlocks.length === 0) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage("Your workspace is empty! Choose Furniture blocks from the toolbox and style them with Colors, Borders, or Typography.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      setIsRunning(true);
      setVenus1Validation(validation);
      setPlainEnglishCode(parseRes.cssCode);
      setJsCode(parseRes.cssCode);

      if (validation.totalStyled >= 3) markObjectiveComplete(1);
      if (validation.hasAnyBorder) markObjectiveComplete(2);
      if (validation.captionValid) markObjectiveComplete(3);

      return;
    }

    // =========================================================================
    // VENUS LEVEL 2: FORMATTING THE PROTOTYPE (FLEXBOX LAYOUT & ALIGNMENT)
    // =========================================================================
    if (isVenusLevel2) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);
      const parseRes = parseVenusLevel2Workspace(workspace.current, venus2ActivePanel, venus2SolvedPanels);
      const validation = parseRes.validation;

      if (allBlocks.length === 0) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(`Please add layout blocks inside your Target Screen container for #panel-${venus2ActivePanel || 1}.`);
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      setIsRunning(true);
      setVenus2Validation(validation);
      setPlainEnglishCode(parseRes.cssCode);
      setJsCode(parseRes.cssCode);

      const hasTarget = allBlocks.some(b => b.type === 'venus2_target_panel');
      const hasFormat = allBlocks.some(b => b.type === 'venus2_style_display');
      const hasHorizontal = allBlocks.some(b => b.type === 'venus2_style_justify');
      const hasVertical = allBlocks.some(b => b.type === 'venus2_style_align');
      const allPanelsDone = [1, 2, 3, 4, 5].every(k => venus2SolvedPanels[k as 1 | 2 | 3 | 4 | 5]);

      if (hasTarget && hasFormat) markObjectiveComplete(1);
      if (hasHorizontal && hasVertical) markObjectiveComplete(2);
      if (allPanelsDone || validation.allSolved) markObjectiveComplete(3);

      return;
    }

    // =========================================================================
    // VENUS LEVEL 3: RESTORING THE DEAD ZONES (DYNAMIC GROUP SHADING & CSS LINKING)
    // =========================================================================
    if (isVenusLevel3) {
      clearAllBlockHighlights(workspace.current);
      const parseRes = parseVenusLevel3Workspace(workspace.current, venus3ActiveTab);

      if (venus3ActiveTab !== 'main') {
        venus3StylesRef.current[venus3ActiveTab] = parseRes.styles;
        setVenus3SectorStyles({ ...venus3StylesRef.current });
      } else {
        setVenus3LinkedStylesheets(parseRes.linkedStylesheets);
        if (parseRes.inlineStyles) {
          setVenus3InlineStyles(parseRes.inlineStyles);
          venus3InlineStylesRef.current = parseRes.inlineStyles;
        }
      }

      setPlainEnglishCode(parseRes.code);
      setJsCode(parseRes.code);

      // Return to overview pie so the player can watch the sectors scan
      if (venus3ActiveTab !== 'main') {
        handleVenus3TabChange('main');
      }

      venus3ScanTimeoutsRef.current.forEach(t => clearTimeout(t));
      venus3ScanTimeoutsRef.current = [];
      if (venus3ScanTimerRef.current) {
        clearTimeout(venus3ScanTimerRef.current);
        venus3ScanTimerRef.current = null;
      }
      if (venus3FailedTimerRef.current) {
        clearTimeout(venus3FailedTimerRef.current);
        venus3FailedTimerRef.current = null;
      }

      setVenus3FailedSectors([]);
      setIsRunning(true);

      const alphaHasStyles = (venus3StylesRef.current.alpha && Object.keys(venus3StylesRef.current.alpha).length >= 1) || (venus3ActiveTab === 'alpha' && Object.keys(parseRes.styles).length >= 1);
      const betaHasStyles = (venus3StylesRef.current.beta && Object.keys(venus3StylesRef.current.beta).length >= 1) || (venus3ActiveTab === 'beta' && Object.keys(parseRes.styles).length >= 1);
      const gammaHasStyles = (venus3StylesRef.current.gamma && Object.keys(venus3StylesRef.current.gamma).length >= 1) || (venus3ActiveTab === 'gamma' && Object.keys(parseRes.styles).length >= 1);

      const alphaPass = Boolean(alphaHasStyles);
      const betaPass = Boolean(betaHasStyles);
      const gammaPass = Boolean(gammaHasStyles);

      const linked = venus3ActiveTab === 'main' ? parseRes.linkedStylesheets : venus3LinkedStylesheets;
      const currInline = venus3ActiveTab === 'main' && parseRes.inlineStyles ? parseRes.inlineStyles : venus3InlineStylesRef.current;
      const hasInlineTower = Boolean(currInline?.tower);
      const hasInlineBg = Boolean(currInline?.background);

      // Animation Step 0 (0ms): Sector 1 begins scanning
      setVenus3ScanPhase('alpha');
      setVenus3ScanResults({ alpha: null, beta: null, gamma: null });

      // Animation Step 1 (650ms): Sector 1 lights up pass/fail; Sector 2 begins scanning
      const t1 = setTimeout(() => {
        if (thisExecId !== executionIdRef.current) return;
        setVenus3ScanResults(prev => ({ ...prev, alpha: alphaPass ? 'pass' : 'fail' }));
        setVenus3ScanPhase('beta');
      }, 650);
      venus3ScanTimeoutsRef.current.push(t1);

      // Animation Step 2 (1300ms): Sector 2 lights up pass/fail; Sector 3 begins scanning
      const t2 = setTimeout(() => {
        if (thisExecId !== executionIdRef.current) return;
        setVenus3ScanResults(prev => ({ ...prev, beta: betaPass ? 'pass' : 'fail' }));
        setVenus3ScanPhase('gamma');
      }, 1300);
      venus3ScanTimeoutsRef.current.push(t2);

      // Animation Step 3 (1950ms): Sector 3 lights up pass/fail; scanning finishes
      const t3 = setTimeout(() => {
        if (thisExecId !== executionIdRef.current) return;
        setVenus3ScanResults(prev => ({ ...prev, gamma: gammaPass ? 'pass' : 'fail' }));
        setVenus3ScanPhase('done');
      }, 1950);
      venus3ScanTimeoutsRef.current.push(t3);

      // Animation Step 4 (2600ms): Comprehensive evaluation and player guidance
      const t4 = setTimeout(() => {
        if (thisExecId !== executionIdRef.current) return;

        // 1. Check if any individual sectors are missing colors
        if (!alphaPass || !betaPass || !gammaPass) {
          const missing: Venus3SectorId[] = [];
          if (!alphaPass) missing.push('alpha');
          if (!betaPass) missing.push('beta');
          if (!gammaPass) missing.push('gamma');
          setVenus3FailedSectors(missing);
          setIsRunning(false);
          setIsBumping(true);
          setIsStartError(true);
          setTimeout(() => {
            setIsBumping(false);
            setIsStartError(false);
          }, 800);

          if (venus3FailedTimerRef.current) clearTimeout(venus3FailedTimerRef.current);
          venus3FailedTimerRef.current = setTimeout(() => {
            setVenus3FailedSectors([]);
          }, 4500);

          const names = missing.map(s => s === 'alpha' ? 'Sector 1' : s === 'beta' ? 'Sector 2' : 'Sector 3').join(', ');
          setErrorToastMessage(`${names} ${missing.length > 1 ? 'are' : 'is'} missing colors! Open ${missing.length > 1 ? 'those tabs' : 'that tab'} to add styling.`);
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
          return;
        }

        // 2. Check if central AstroLink Hub inline styles are set
        if (!hasInlineTower || !hasInlineBg) {
          setIsRunning(false);
          setIsBumping(true);
          setIsStartError(true);
          setTimeout(() => {
            setIsBumping(false);
            setIsStartError(false);
          }, 800);

          const missingHub: string[] = [];
          if (!hasInlineTower) missingHub.push('Tower Color');
          if (!hasInlineBg) missingHub.push('Background Color');

          setErrorToastMessage(`All 3 sectors are colored! Now add the ${missingHub.join(' and ')} block in the Main tab (Astrolink category) to power the central hub.`);
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
          return;
        }

        // 3. Check if all 3 stylesheets are connected inside Page Header
        const unlinkedSectors: Venus3SectorId[] = [];
        if (!linked.includes('alpha.css')) unlinkedSectors.push('alpha');
        if (!linked.includes('beta.css')) unlinkedSectors.push('beta');
        if (!linked.includes('gamma.css')) unlinkedSectors.push('gamma');

        if (unlinkedSectors.length > 0) {
          setVenus3FailedSectors(unlinkedSectors);
          setIsRunning(false);
          setIsBumping(true);
          setIsStartError(true);
          setTimeout(() => {
            setIsBumping(false);
            setIsStartError(false);
          }, 800);

          if (venus3FailedTimerRef.current) clearTimeout(venus3FailedTimerRef.current);
          venus3FailedTimerRef.current = setTimeout(() => {
            setVenus3FailedSectors([]);
          }, 4500);

          const files = unlinkedSectors.map(s => `${s}.css`).join(', ');
          setErrorToastMessage(`Almost there! Connect ${files} inside the Page Header on the Main tab to establish the planetary uplink.`);
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
          return;
        }

        // Planetary Uplink Complete!
        setVenus3FailedSectors([]);
        const nextSolved = {
          alpha: true,
          beta: true,
          gamma: true,
        };
        setVenus3SolvedSectors(nextSolved);
        try {
          setNetstartItem('netstart_venus3_solved_sectors', JSON.stringify(nextSolved));
        } catch (e) { }

        markObjectiveComplete(1);
        markObjectiveComplete(2);
        markObjectiveComplete(3);

        const tVictory = setTimeout(() => {
          if (thisExecId !== executionIdRef.current) return;
          setIsRunning(false);
          recordSectionCompleted(0);
          setShowPopup(true);

          const bonusKey = `${missionId}_sec0_bonus`;
          let claimedList: string[] = [];
          try {
            claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
          } catch (e) { }

          if (!isReplayMode && !claimedList.includes(bonusKey)) {
            addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, "Level 3 Cleared");
            claimedList.push(bonusKey);
            try {
              setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
            } catch (e) { }
          }

          try {
            removeNetstartItem('netstart_active_saved_level');
            removeNetstartItem('netstart_active_level');
            removeNetstartItem(`netstart_saved_workspace_${missionId}_0`);
            if (!isDemoModeActive() && missionId) {
              const compKey = 'netstart_completed_missions';
              const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
              if (!existing.includes(missionId)) {
                existing.push(missionId);
                setNetstartItem(compKey, JSON.stringify(existing));
              }
            }
          } catch (e) { }
          let fullSolutionCode = parseRes.code;
          try {
            const htmlParts: string[] = [];
            if (currInline?.tower) htmlParts.push(`  <div id="astrolink-tower" style="background-color: ${currInline.tower};"></div>`);
            if (currInline?.background) htmlParts.push(`  <div id="hub-background" style="background-color: ${currInline.background};"></div>`);
            const linksCode = linked.map(f => `  <link rel="stylesheet" href="${f}">`).join('\n');
            const headCode = `<head>\n${linksCode}\n</head>`;
            const bodyCode = `<body>\n${htmlParts.join('\n')}\n</body>`;
            fullSolutionCode = `<!-- index.html -->\n<!DOCTYPE html>\n<html>\n${headCode}\n${bodyCode}\n</html>`;
          } catch (e) { }
          triggerMissionCompletion(fullSolutionCode);
        }, 1000);
        venus3ScanTimeoutsRef.current.push(tVictory);
      }, 2600);
      venus3ScanTimeoutsRef.current.push(t4);

      return;
    }

    // =========================================================================
    // MERCURY LEVEL 1: SAVING THE BIODOME (DOM SELECTORS & JAVASCRIPT)
    // =========================================================================
    if (isMercuryLevel1) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);
      const validation = parseMercuryLevel1Workspace(workspace.current);

      if (allBlocks.length === 0) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage("Your workspace is empty! Add Target and Action blocks to start.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      const hasAnyValidActions =
        validation.isVentsOpened ||
        validation.isLilyWatered ||
        validation.starFlowerHasWater ||
        validation.starFlowerHasFertilizer ||
        validation.wateredShrubIndices.length > 0 ||
        validation.wateredFlowerIndices.length > 0;

      // Misplaced or Inverted Block Hierarchy (e.g. Target ID below Loop)
      if (validation.hasMisplacedBlockError) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(
          validation.misplacedBlockErrorMessage ||
          "Check your blocks! Snap actions inside the container cutout."
        );
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        if (!hasAnyValidActions) return;
      }

      // Scenario B: The "Nuke" Selector (Targeting Everything / 'div')
      if (validation.usedBroadNukeSelector) {
        setIsBumping(true);
        setIsWarningPulse(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsWarningPulse(false);
        }, 800);

        setErrorToastMessage("Target is too broad! Pick a specific element.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        if (!hasAnyValidActions) return;
      } else if (validation.hasEmptyTargetError) {
        // Empty Target Input on an active block
        if (!hasAnyValidActions) {
          setIsBumping(true);
          setIsStartError(true);
          setTimeout(() => {
            setIsBumping(false);
            setIsStartError(false);
          }, 800);

          setErrorToastMessage("Choose both a selector type and target from the dropdowns.");
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
          return;
        }
      } else if (validation.hasMissingActionError && !hasAnyValidActions) {
        // Missing Action Block
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage("Your container is empty! Snap an action block inside.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      } else if (validation.hasTypoOrCaseError && !hasAnyValidActions) {
        // Category / Selector mismatch
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(validation.typoErrorMessage || "Choose a target from the dropdown.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      setIsRunning(true);
      setMercury1Validation(validation);
      setPlainEnglishCode(validation.jsCode);
      setJsCode(validation.jsCode);

      // Sequenced objective completions matching the step-by-step animation sequence
      if (validation.objective1Vents || validation.isVentsOpened) {
        setTimeout(() => {
          if (thisExecId !== executionIdRef.current) return;
          markObjectiveComplete(1);
        }, 250);
      }

      if (validation.isAllShrubsWatered && (validation.isAllFlowersWatered || (validation.wateredFlowerIndices && validation.wateredFlowerIndices.length >= 5))) {
        setTimeout(() => {
          if (thisExecId !== executionIdRef.current) return;
          markObjectiveComplete(2);
        }, 2750);
      }

      let stepTime = 150;
      if (validation.isVentsOpened) {
        stepTime += 850;
      }
      const hasShrubActions = validation.isAllShrubsWatered || (validation.wateredShrubIndices && validation.wateredShrubIndices.length > 0);
      if (hasShrubActions) {
        const count = validation.isAllShrubsWatered ? 5 : validation.wateredShrubIndices.length;
        stepTime += count * 160 + 400;
      }
      const hasFlowerActions = validation.isAllFlowersWatered || (validation.wateredFlowerIndices && validation.wateredFlowerIndices.length > 0);
      if (hasFlowerActions) {
        const count = validation.isAllFlowersWatered ? 5 : validation.wateredFlowerIndices.length;
        stepTime += count * 160 + 750;
      }

      const starFlowerDelay = stepTime;

      if (validation.objective3StarFlower || validation.isLilyWatered) {
        setTimeout(() => {
          if (thisExecId !== executionIdRef.current) return;
          markObjectiveComplete(3);
        }, starFlowerDelay);
      } else if (validation.isStarFlowerNeedsWater) {
        setTimeout(() => {
          if (thisExecId !== executionIdRef.current) return;
          setErrorToastMessage("The Star Flower received fertilizer, but it also needs water to fully bloom!");
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5500);
        }, starFlowerDelay);
      } else if (validation.isStarFlowerNeedsFertilizer) {
        setTimeout(() => {
          if (thisExecId !== executionIdRef.current) return;
          setErrorToastMessage("The Star Flower received water, but it also needs fertilizer to fully bloom!");
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5500);
        }, starFlowerDelay);
      } else if (validation.isStarFlowerFertilizeFail) {
        setTimeout(() => {
          if (thisExecId !== executionIdRef.current) return;
          setErrorToastMessage("The greenhouse is too hot to tend to the Star Flower! Turn on the vents first.");
          setShowErrorToast(true);
          if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
          errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5500);
        }, starFlowerDelay);
      }

      // Auto-stop simulation after full sequence completes if incomplete
      if (!validation.isAllCompleted) {
        const autoStopDelay = starFlowerDelay + 2500;
        setTimeout(() => {
          if (thisExecId !== executionIdRef.current) return;
          setIsRunning(false);
        }, autoStopDelay);
      }

      return;
    }

    // =========================================================================
    // MERCURY LEVEL 2: THE CONVEYOR BELT (IF/ELSE & LOOPS)
    // =========================================================================
    if (isMercuryLevel2) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);
      const validation = parseMercuryLevel2Workspace(workspace.current);

      if (allBlocks.length === 0) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage("Your workspace is empty! Add a Loop, Variable, and If/Else blocks.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (!validation.hasLoopBlock) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage("Add a Repeat block from Events / Loops to process the crates!");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (validation.hasLoopCountError) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(validation.loopCountErrorMessage || "Enter how many times to repeat the loop!");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (validation.hasMisplacedBlockError) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(validation.misplacedBlockErrorMessage || "Place all logic blocks inside the Repeat loop!");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (validation.hasLogicOrderError) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(validation.logicOrderErrorMessage || "Check the order of your If / Else blocks!");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (validation.hasEmptyConditionError) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(validation.emptyConditionErrorMessage || "Drag 'Scan Result' into the empty slot of your If block!");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (validation.hasEmptyBranchError) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(validation.emptyBranchErrorMessage || "Don't leave logic blocks empty! Snap a 'Send crate to' block inside.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (!validation.hasVariableBlock) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage("The claw needs to scan each crate first! Add 'Read the X-Ray Scanner' inside the loop.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      setIsRunning(true);
      setMercury2Validation(validation);
      setPlainEnglishCode(validation.jsCode);
      setJsCode(validation.jsCode);

      if (validation.objective2Variable) {
        markObjectiveComplete(1);
      }
      if (validation.objective3Logic) {
        markObjectiveComplete(2);
      }

      return;
    }

    // =========================================================================
    // MERCURY LEVEL 3: THE MISSING INTERFACE (FULL-STACK COMMS BOSS LEVEL)
    // =========================================================================
    if (isMercuryLevel3) {
      clearAllBlockHighlights(workspace.current);

      const activeTab = mercury3ActiveTabRef.current;
      if (workspace.current) {
        const dom = Blockly.Xml.workspaceToDom(workspace.current);
        const xmlText = Blockly.Xml.domToText(dom);
        mercury3WorkspaceStates.current[activeTab] = xmlText;
        setNetstartItem(`netstart_mercury3_tab_${missionId}_${activeTab}`, xmlText);

        if (activeTab === 'html') {
          const code = compileMercury3Html(workspace.current);
          setMercury3HtmlCode(code);
        } else if (activeTab === 'css') {
          const code = compileMercury3Css(workspace.current);
          setMercury3CssCode(code);
        } else if (activeTab === 'js') {
          const code = compileMercury3Js(workspace.current);
          setMercury3JsCode(code);
        }
      }

      const curHtml = activeTab === 'html' && workspace.current ? compileMercury3Html(workspace.current) : mercury3HtmlCode;
      const curCss = activeTab === 'css' && workspace.current ? compileMercury3Css(workspace.current) : mercury3CssCode;
      const curJs = activeTab === 'js' && workspace.current ? compileMercury3Js(workspace.current) : mercury3JsCode;

      const audit = auditMercury3Workspace(curHtml, curCss, curJs);
      setMercury3Audit(audit);

      if (!audit.canRunSimulation) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(audit.lockoutReason || "Fix code requirements across all three tabs before running simulation.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      markObjectiveComplete(1);
      markObjectiveComplete(2);

      setIsRunning(true);
      return;
    }

    // =========================================================================
    // JUPITER LEVEL 1: UNLOCK THE GATE (STRONG TYPING & BLAST DOOR AIRLOCK)
    // =========================================================================
    if (isJupiterLevel1) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);
      const validation = parseJupiterLevel1Workspace(workspace.current);

      if (allBlocks.length === 0) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage("Your workspace is empty! Build variables to unlock the gate.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (validation.missingNameError) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(validation.missingNameError);
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (validation.duplicateNameError) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(validation.duplicateNameError);
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (validation.stringBooleanTrapError) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(validation.stringBooleanTrapError);
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      setJupiter1Validation(validation);
      setPlainEnglishCode(validation.javaCode);
      setJsCode(validation.javaCode);
      setIsRunning(true);
      return;
    }

    // =========================================================================
    // JUPITER LEVEL 2: THE TRY/CATCH SAFETY NET
    // =========================================================================
    if (isJupiterLevel2) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);
      const pVal = parseJupiterLevel2Workspace(workspace.current);
      setJupiter2Validation(pVal);
      setPlainEnglishCode(pVal.javaCode);
      setJsCode(pVal.javaCode);

      const isSecDone = completedSections.includes(currentSection);
      setObjectives(prev => prev.map(obj => {
        if (obj.isClaimed || isReplayMode || isSecDone) return { ...obj, completed: true };
        if (obj.id === 1) return { ...obj, completed: isJupiter2Wave1Complete };
        if (obj.id === 2) return { ...obj, completed: isJupiter2Wave2Complete };
        if (obj.id === 3) return { ...obj, completed: isSecDone };
        return obj;
      }));

      // Validation audit
      if (!pVal.hasTry) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);
        setErrorToastMessage("RADAR SCANNER MISSING: A 'Try Running:' wrapper block is required to scan incoming data.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (!pVal.hasStartStream) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);
        setErrorToastMessage("DATA STREAM INACTIVE: Snap the 'Start Data Stream' block inside the 'Try Running:' block to begin streaming data.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (!pVal.hasCatch || pVal.turretLogic.length === 0) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);
        if (pVal.syntaxError) {
          setErrorToastMessage(pVal.syntaxError);
        } else {
          setErrorToastMessage("DEFENSE GRID OFFLINE: Snap at least one 'When [error] occurs:' rule into the 'unless:' slot of the 'Try Running:' block to intercept threats.");
        }
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (!pVal.allCatchValid || pVal.syntaxError) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);
        setErrorToastMessage(pVal.syntaxError || "SYNTAX ERROR: Each 'When [error] occurs:' rule requires an action block inside it to resolve the threat.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      setIsRunning(true);
      return;
    }

    // =========================================================================
    // JUPITER LEVEL 3: THE AI CORE LOCKDOWN (JAVA CLASSES, OBJECTS & ENCAPSULATION)
    // =========================================================================
    if (isJupiterLevel3) {
      clearAllBlockHighlights(workspace.current);
      const parsedBlueprint = parseJupiterLevel3Workspace(workspace.current);
      setJupiter3Blueprint(parsedBlueprint);
      setPlainEnglishCode(parsedBlueprint.rawJavaCode);
      setJsCode(parsedBlueprint.rawJavaCode);
      setIsRunning(true);
      return;
    }

    // =========================================================================
    // SATURN LEVEL 1: SURPRISE DIAGNOSTICS (C++ STREAMS & DATA BUS PIPELINE)
    // =========================================================================
    if (isSaturnLevel1) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);
      const { state: pState, validation: pVal } = parseSaturnLevel1Workspace(workspace.current, saturnWave);
      setSaturnWorkspaceState(pState);
      setSaturn1Validation(pVal);
      const code = pVal.cppCode || generateSaturnCppCode(pState, saturnWave);
      setPlainEnglishCode(code);
      setJsCode(code);

      const isSecDone = completedSections.includes(currentSection);
      setObjectives(prev => prev.map(obj => {
        if (obj.isClaimed || isReplayMode || isSecDone) return { ...obj, completed: true };
        if (obj.id === 1) return { ...obj, completed: Boolean(pVal.hasStart && pVal.hasEnd) };
        if (obj.id === 2) return { ...obj, completed: Boolean(pVal.hasStringStorage && pVal.hasIntStorage && pVal.hasBoolStorage && pVal.hasLoop && pVal.hasCin && pVal.hasCout) };
        if (obj.id === 3) return { ...obj, completed: saturnIsWon || isSecDone };
        return obj;
      }));

      if (allBlocks.length === 0 || pVal.errorType === 'EMPTY') {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(pVal.novaMessage || "The pipeline is empty! Drag some blocks over to catch the data.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      setIsRunning(true);
      return;
    }

    // =========================================================================
    // SATURN LEVEL 2: JUMPSTARTING THE RINGS (SWITCH-CASES & DEBRIS ROUTING)
    // =========================================================================
    if (isSaturnLevel2) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);
      const pVal = parseSaturnLevel2Workspace(workspace.current);
      setSaturn2Validation(pVal);
      setPlainEnglishCode(pVal.cppCode);
      setJsCode(pVal.cppCode);

      const isSecDone = completedSections.includes(currentSection);
      setObjectives(prev => prev.map(obj => {
        if (obj.isClaimed || isReplayMode || isSecDone) return { ...obj, completed: true };
        if (obj.id === 1) return { ...obj, completed: Boolean(pVal.hasStart && pVal.hasEnd) };
        if (obj.id === 2) return { ...obj, completed: Boolean(pVal.hasShield || pVal.hasGreetUfo || saturn2ShieldActivated || saturn2UfoGreeted) };
        if (obj.id === 3) return { ...obj, completed: isSecDone };
        return obj;
      }));

      // Validation audit: requires Start and function declaration blocks to run simulation
      if (allBlocks.length === 0 || !pVal.hasStart || !pVal.hasRouteProto || !pVal.hasShieldProto) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);
        setErrorToastMessage(pVal.validationError || "PROGRAM NOTICE: Every program needs a 'Start' block to run.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      setIsRunning(true);
      return;
    }

    // =========================================================================
    // SATURN LEVEL 3: A LEAK IN THE SYSTEM (C++ POINTERS & DYNAMIC HEAP)
    // =========================================================================
    if (isSaturnLevel3) {
      clearAllBlockHighlights(workspace.current);
      const parsed = parseSaturnLevel3Workspace(workspace.current);
      setSaturn3Payload(parsed);
      setPlainEnglishCode(parsed.rawCppCode);
      setJsCode(parsed.rawCppCode);
      setIsRunning(true);
      return;
    }

    // =========================================================================
    // EARTH LEVEL 1: FIX THE MASTER LEDGER! (PYTHON STRING METHODS & SLICING)
    // =========================================================================
    if (isEarthLevel1) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);
      const { state: pState, validation: pVal } = parseEarthLevel1Workspace(workspace.current, currentSection);
      setEarthWorkspaceState(pState);
      setEarth1Validation(pVal);
      const code = pVal.pythonCode || generateEarthPythonCode(pState, currentSection);
      setPlainEnglishCode(code);
      setJsCode(code);

      setObjectives(prev => prev.map(obj => {
        const secIdx = obj.id - 1;
        const isDone = completedSections.includes(secIdx) || obj.isClaimed || isReplayMode;
        if (secIdx === currentSection) {
          return { ...obj, completed: isDone };
        }
        return { ...obj, completed: isDone };
      }));

      if (allBlocks.length === 0 || pVal.errorType === 'EMPTY') {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(pVal.errorMessage || "Workspace is empty! Drag out 'Load Data' to start.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      setIsRunning(true);
      return;
    }

    // =========================================================================
    // EARTH LEVEL 2: THE PLANETARY ARCHIVE (DICTIONARIES & NESTED LISTS)
    // =========================================================================
    if (isEarthLevel2) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current.getAllBlocks(false);

      if (allBlocks.length === 0) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(
          earth2ActiveTab === 'tab1'
            ? "Workspace is empty! Drag out 'Planet' dictionary blocks to profile the planets."
            : "Workspace is empty! Drag out the 'solar_system = [ ... ]' list block to arrange the orbits."
        );
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (earth2ActiveTab === 'tab1') {
        const pVal = parseEarth2Section1Workspace(workspace.current);
        setEarth2Tab1Validation(pVal);
        setPlainEnglishCode(pVal.pythonCode || '# Tab 1: Planet Profiles\n# Profiling planets...');
        setJsCode(pVal.pythonCode || '');
        setIsRunning(true);
        return;
      } else {
        const pVal = parseEarth2Tab2Workspace(workspace.current);
        setEarth2Tab2Validation(pVal);
        setPlainEnglishCode(pVal.pythonCode || '# Tab 2: Solar System Orbits\nsolar_system = []');
        setJsCode(pVal.pythonCode || '');
        setIsRunning(true);
        return;
      }
    }

    // =========================================================================
    // EARTH LEVEL 3: THE MASTER REBOOT (UNIFIED PYTHON MAIN REBOOT)
    // =========================================================================
    if (isEarthLevel3) {
      clearAllBlockHighlights(workspace.current);
      const allBlocks = workspace.current ? workspace.current.getAllBlocks(false) : [];

      if (allBlocks.length === 0) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage("Your workspace is empty! Place import blocks to begin.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      const pyCode = javascriptGenerator.workspaceToCode(workspace.current);
      setEarth3Code(pyCode);
      const audit = auditEarth3Workspace(workspace.current, pyCode);
      setEarth3Audit(audit);

      if (audit.errorType === 'SCOPE_ERROR') {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(audit.errorMessage || "Structure Error: Nest all module calls inside master_reboot().");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (audit.errorType === 'NAME_ERROR') {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(audit.errorMessage || "NameError: You must import the module before accessing its functions.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      if (audit.errorType === 'MISSING_TRIGGER') {
        showToast("Function defined, but never called. The system is waiting for you to synchronize the execution.", { duration: 5000 });
        return;
      }

      if (!audit.canRunSimulation) {
        setIsBumping(true);
        setIsStartError(true);
        setTimeout(() => {
          setIsBumping(false);
          setIsStartError(false);
        }, 800);

        setErrorToastMessage(audit.errorMessage || "Code requirements incomplete.");
        setShowErrorToast(true);
        if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
        errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 5000);
        return;
      }

      markObjectiveComplete(1);
      markObjectiveComplete(2);
      setIsRunning(true);
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
      let runtimeQueue = (dailySection?.name === 'Master Sorting Gauntlet')
        ? [...getSectionConveyorQueue(3)]
        : [...getSectionConveyorQueue(currentSection)];
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
          const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
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

        const isSortingGauntlet = dailySection?.name === 'Master Sorting Gauntlet';
        const effectiveSection = isSortingGauntlet ? 3 : currentSection;
        const result = validateConveyorVictory(effectiveSection, runtimeInventory, runtimeQueue.length);
        if (result.success) {
          if (hasEndBlock) {
            recordSectionCompleted(currentSection);
            markObjectiveComplete(3);

            if (isSortingGauntlet) {
              if (runtimeInventory.fuel >= 6 && runtimeInventory.food >= 6) markObjectiveComplete(1);
              if (runtimeInventory.cargo >= 7 && runtimeInventory.trash >= 6) markObjectiveComplete(2);
              if (runtimeInventory.errors === 0 && (runtimeInventory.cargo + runtimeInventory.trash + runtimeInventory.fuel + runtimeInventory.food === 25)) markObjectiveComplete(3);
            } else if (currentSection === 0) {
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
            }

            setShowPopup(true);

            const bonusKey = `${missionId}_sec${currentSection}_bonus`;
            let claimedList: string[] = [];
            try {
              claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
            } catch (e) { }

            if (!isReplayMode && !claimedList.includes(bonusKey)) {
              addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, `Section ${currentSection + 1} Cleared`);
              claimedList.push(bonusKey);
              try {
                setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
              } catch (e) { }
            }

            if (currentSection === currentMissionSections.length - 1) {
              // Write completion to localStorage IMMEDIATELY (before API responds)
              // so ModuleDetailsClient shows Replay and ModulesClient triggers the animation
              try {
                // Clear the active save so the card shows Replay not Resume
                removeNetstartItem('netstart_active_saved_level');
                removeNetstartItem('netstart_active_level');

                // Add to completed missions list for instant ModulesClient detection
                if (!isDemoModeActive() && missionId) {
                  const compKey = 'netstart_completed_missions';
                  const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
                  if (!existing.includes(missionId)) {
                    existing.push(missionId);
                    setNetstartItem(compKey, JSON.stringify(existing));
                  }
                  // Preserve the current from-index so animation starts at right planet
                  if (!getNetstartItem('netstart_last_animated_planet_idx')) {
                    setNetstartItem('netstart_last_animated_planet_idx', '0');
                  }
                  setNetstartItem('netstart_planet_unlock_pending', 'true');
                }
              } catch (e) { }

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

      // Section 2: Fuel Synthesis (5-Step Chemical Synthesis Protocol)
      if (currentSection === 1 || dailySection?.name === 'Fuel Synthesis Protocol') {
        if (!fuelSynthRef.current) {
          setIsRunning(false);
          return;
        }

        if (hasEndBlock) {
          markObjectiveComplete(1);
        }
        const xml = workspace.current ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace.current)) : '';
        if (xml.includes('controls_if') || xml.includes('color_green') || xml.includes('color_is') || xml.includes('action_add_solution')) {
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
            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
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
            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
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
          const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
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
            claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
          } catch (e) { }

          if (!claimedList.includes(bonusKey)) {
            addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, `Section ${currentSection + 1} Cleared`);
            claimedList.push(bonusKey);
            try {
              setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
            } catch (e) { }
          }

          if (currentSection === currentMissionSections.length - 1) {
            // Write completion to localStorage IMMEDIATELY so UI updates before API responds
            try {
              removeNetstartItem('netstart_active_saved_level');
              removeNetstartItem('netstart_active_level');
              if (!isDemoModeActive() && missionId) {
                const compKey = 'netstart_completed_missions';
                const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
                if (!existing.includes(missionId)) { existing.push(missionId); setNetstartItem(compKey, JSON.stringify(existing)); }
                if (!getNetstartItem('netstart_last_animated_planet_idx')) setNetstartItem('netstart_last_animated_planet_idx', '0');
                setNetstartItem('netstart_planet_unlock_pending', 'true');
              }
            } catch (e) { }
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
        (xml.includes('move_up') || (xml.includes('action_move') && xml.includes('UP'))) && 'up',
        (xml.includes('move_down') || (xml.includes('action_move') && xml.includes('DOWN'))) && 'down',
        (xml.includes('move_left') || (xml.includes('action_move') && xml.includes('LEFT'))) && 'left',
        (xml.includes('move_right') || (xml.includes('action_move') && xml.includes('RIGHT'))) && 'right',
        (xml.includes('move_forward') || (xml.includes('action_move') && xml.includes('FORWARD'))) && 'forward',
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
      const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;
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
            claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
          } catch (e) { }

          if (!claimedList.includes(bonusKey)) {
            addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, `Section ${currentSection + 1} Cleared`);
            claimedList.push(bonusKey);
            try {
              setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
            } catch (e) { }
          }

          if (currentSection === currentMissionSections.length - 1) {
            // Write completion to localStorage IMMEDIATELY so UI updates before API responds
            try {
              removeNetstartItem('netstart_active_saved_level');
              removeNetstartItem('netstart_active_level');
              if (!isDemoModeActive() && missionId) {
                const compKey = 'netstart_completed_missions';
                const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
                if (!existing.includes(missionId)) { existing.push(missionId); setNetstartItem(compKey, JSON.stringify(existing)); }
                if (!getNetstartItem('netstart_last_animated_planet_idx')) setNetstartItem('netstart_last_animated_planet_idx', '0');
                setNetstartItem('netstart_planet_unlock_pending', 'true');
              }
            } catch (e) { }
            triggerMissionCompletion(code);
          }
        } else {
          setIsWarningPulse(true);
          if (endToastTimer.current) clearTimeout(endToastTimer.current);
          setShowEndToast(true);
          endToastTimer.current = setTimeout(() => setShowEndToast(false), 5500);
        }
      } else {
        requestAiHintEvaluation("Rover completed instructions without reaching the target landing marker.");
      }
    } catch (e: any) {
      if (currentExecutingBlockId && workspace.current && e?.message !== 'SIMULATION_CANCELLED') {
        markBlockError(workspace.current, currentExecutingBlockId);
      }
      if (e?.message !== 'SIMULATION_CANCELLED') {
        requestAiHintEvaluation(e?.message || 'Execution error');
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

  const isLevelCompleted = completedSections.length >= currentMissionSections.length;
  const totalCount = objectives.length;
  const rawCompletedCount = objectives.filter(o => o.completed).length;
  const completedCount = rawCompletedCount;
  const currentSectionXp = isDemoModeActive() ? 0 : (completedCount * XP_REWARDS.CAMPAIGN_GOAL) + (showPopup ? XP_REWARDS.SECTION_COMPLETION_BONUS : 0);

  const completionModalCode = useMemo(() => {
    let raw = plainEnglishCode || jsCode;
    const emptyJava = 'public class AirlockControl {\n    public static void main(String[] args) {\n    }\n}';
    if (isJupiterLevel1) {
      if (!raw || raw.trim() === emptyJava.trim() || !raw.includes('=')) {
        if (workspace.current) {
          const parsed = parseJupiterLevel1Workspace(workspace.current);
          if (parsed.javaCode && parsed.javaCode.trim() !== emptyJava.trim() && parsed.javaCode.includes('=')) {
            raw = parsed.javaCode;
          }
        }
        if (!raw || raw.trim() === emptyJava.trim() || !raw.includes('=')) {
          if (jupiter1Validation?.javaCode && jupiter1Validation.javaCode.includes('=')) {
            raw = jupiter1Validation.javaCode;
          } else {
            raw = `public class AirlockControl {\n    public static void main(String[] args) {\n        String password = "JupiterSecurity";\n        int pin = 1234;\n        boolean override = true;\n\n        OpticalScanner.enterCode(password);\n        Pinpad.enterPin(pin);\n        Breaker.setOverride(override);\n        Airlock.unlockDoors();\n    }\n}`;
          }
        }
      }
    } else if (isMercuryLevel1) {
      if (!raw && workspace.current) raw = parseMercuryLevel1Workspace(workspace.current).jsCode;
    } else if (isMercuryLevel2) {
      if (!raw && workspace.current) raw = parseMercuryLevel2Workspace(workspace.current).jsCode;
    } else if (isMercuryLevel3) {
      raw = `/* HTML */\n${mercury3HtmlCode}\n\n/* CSS */\n${mercury3CssCode}\n\n/* JavaScript */\n${mercury3JsCode}`;
    } else if (isVenusLevel1) {
      if (!raw && workspace.current) raw = parseVenusLevel1Workspace(workspace.current).cssCode;
    } else if (isVenusLevel2) {
      if (!raw && workspace.current) raw = generateVenusLevel2FullCss(workspace.current, venus2ActivePanel, { 1: true, 2: true, 3: true, 4: true, 5: true });
    } else if (isVenusLevel3) {
      if (!raw && workspace.current) raw = parseVenusLevel3Workspace(workspace.current, venus3ActiveTab).code;
    } else if (isSaturnLevel1) {
      if (!raw || raw === '/* No code generated */') {
        if (workspace.current) {
          const { validation: v } = parseSaturnLevel1Workspace(workspace.current, saturnWave);
          if (v.cppCode) raw = v.cppCode;
        }
      }
      if (!raw || raw === '/* No code generated */') {
        raw = saturn1Validation?.cppCode || generateSaturnCppCode(saturnWorkspaceState, saturnWave);
      }
    } else if (isSaturnLevel2) {
      if (!raw || raw === '/* No code generated */') {
        if (workspace.current) {
          const v = parseSaturnLevel2Workspace(workspace.current);
          if (v.cppCode) raw = v.cppCode;
        }
      }
      if (!raw || raw === '/* No code generated */') {
        raw = saturn2Validation?.cppCode || '';
      }
    } else if (isJupiterLevel2) {
      if (workspace.current) {
        const parsed = parseJupiterLevel2Workspace(workspace.current);
        if (parsed.javaCode) raw = parsed.javaCode;
      }
      if (!raw) {
        raw = jupiter2Validation?.javaCode || '';
      }
    } else if (isEarthLevel1) {
      const livePython = earth1Validation?.pythonCode || (workspace.current ? parseEarthLevel1Workspace(workspace.current, currentSection).validation.pythonCode : '') || generateEarthPythonCode(earthWorkspaceState, currentSection);
      raw = livePython || '/* No code generated */';
    } else if (isEarthLevel2) {
      if (currentSection === 0) {
        raw = earth2Tab1Validation?.pythonCode || (workspace.current ? parseEarth2Section1Workspace(workspace.current).pythonCode : '') || '# Section 1: Planet Profiles';
      } else {
        raw = earth2Tab2Validation?.pythonCode || (workspace.current ? parseEarth2Section2Workspace(workspace.current).pythonCode : '') || '# Section 2: Master Archive';
      }
    } else if (isEarthLevel3) {
      raw = earth3Code || (workspace.current ? javascriptGenerator.workspaceToCode(workspace.current) : '');
    }
    return raw || '/* No code generated */';
  }, [plainEnglishCode, jsCode, isJupiterLevel1, isJupiterLevel2, jupiter2Validation, isSaturnLevel1, isSaturnLevel2, saturn2Validation, isEarthLevel1, isEarthLevel2, isEarthLevel3, earth3Code, currentSection, earthWorkspaceState, earth1Validation, earth2Tab1Validation, earth2Tab2Validation, saturnWave, saturnWorkspaceState, saturn1Validation, isMercuryLevel1, isMercuryLevel2, isMercuryLevel3, mercury3HtmlCode, mercury3CssCode, mercury3JsCode, isVenusLevel1, isVenusLevel2, isVenusLevel3, venus2ActivePanel, venus3ActiveTab, jupiter1Validation]);

  const syntaxExplanations = useMemo(() => {
    if (!completionModalCode || completionModalCode === '/* No code generated */') return [];
    const lines = completionModalCode.split('\n');
    const isHtml = isMarsLevel1 || isMarsLevel2 || isMarsLevel3 || (isVenusLevel3 && venus3ActiveTab === 'main') || (isMercuryLevel3 && mercury3ActiveTab === 'html');
    const isCss = isVenusLevel1 || isVenusLevel2 || (isVenusLevel3 && venus3ActiveTab !== 'main') || (isMercuryLevel3 && mercury3ActiveTab === 'css');
    const langMode = isSaturnLevel1 || isSaturnLevel2 || isSaturnLevel3 ? 'cpp' : isEarthLevel1 || isEarthLevel2 || isEarthLevel3 ? 'python' : isJupiterLevel1 || isJupiterLevel2 || isJupiterLevel3 ? 'java' : isMercuryLevel1 || isMercuryLevel2 || isMercuryLevel3 ? 'javascript' : undefined;

    const seen = new Set<string>();
    const list: Array<{ line: string; exp: SyntaxExplanation }> = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === '{' || trimmed === '}' || trimmed.startsWith('//')) continue;
      const exp = getSyntaxExplanation(trimmed, isHtml, isCss, langMode);
      if (!seen.has(exp.title)) {
        seen.add(exp.title);
        list.push({ line: trimmed, exp });
      }
    }
    return list;
  }, [completionModalCode, isMarsLevel1, isMarsLevel2, isMarsLevel3, isVenusLevel1, isVenusLevel2, isVenusLevel3, venus3ActiveTab, isSaturnLevel1, isSaturnLevel2, isEarthLevel1, isEarthLevel2, isEarthLevel3, isJupiterLevel1, isJupiterLevel2, isMercuryLevel1, isMercuryLevel2]);

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
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-[0_0_10px_rgba(255,145,45,0.45)] shrink-0"
            />
            <div className="shrink-0">
              <h1 className="font-display font-black text-sm sm:text-base text-white tracking-wide uppercase leading-tight">
                {displayTitle}
              </h1>
              {currentMissionSections.length > 1 && !isDaily ? (
                <p className="text-[10px] font-mono text-gray-400 leading-tight mt-0.5">Section {currentSection + 1} of {currentMissionSections.length}</p>
              ) : isDaily ? (
                <p className="text-[10px] font-mono text-gray-400 leading-tight mt-0.5">Daily Challenge</p>
              ) : (
                <p className="text-[10px] font-mono text-gray-400 leading-tight mt-0.5">{getMissionModuleForMission(missionId, isDaily)}</p>
              )}
            </div>
          </div>

          {currentMissionSections.length > 1 && !isDaily && (
            <>
              <div className="h-6 w-px bg-white/10 hidden lg:block" />

              {/* Multi-Section Stepper Tracker with Prerequisite Route Locking */}
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
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all ${isLocked
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
                      ) : isPast && !isCur ? (
                        <Check size={12} className="stroke-[2.5] text-emerald-400" />
                      ) : null}
                      <span>{`Section ${idx + 1}`}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Mission Goals Dropdown & AI Assist Button */}
        <div className="flex items-center gap-3">
          {/* Mission Goals Dropdown with Integrated Goal Rewards (+20 XP) */}
          <div className="relative z-[1001]" ref={dropdownRef}>
            <button
              onClick={() => setIsObjectivesOpen(prev => !prev)}
              className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-xl border transition-all cursor-pointer text-xs sm:text-sm font-mono font-bold shadow-md ${buttonPulse
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
                  completedCount === totalCount && totalCount > 0
                    ? isReplayMode
                      ? 'bg-purple-950/40 text-purple-300 border border-purple-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
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
                      (completedSections.includes(currentSection) || (completedCount === totalCount && totalCount > 0))
                        ? isReplayMode
                          ? 'bg-purple-950/20 border border-purple-500/20 text-purple-300/70'
                          : 'bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                        : 'bg-[#0e0419] border border-white/10'
                    }`}>
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">Goal Rewards</span>
                    <span className={`flex items-center gap-1 text-xs sm:text-sm font-mono font-bold ${
                        (completedSections.includes(currentSection) || (completedCount === totalCount && totalCount > 0))
                          ? isReplayMode ? 'text-purple-400/60' : 'text-emerald-400'
                          : isReplayMode ? 'text-purple-300/60' : 'text-yellow-400'
                      }`}>
                      <Zap size={14} className={
                        (completedSections.includes(currentSection) || (completedCount === totalCount && totalCount > 0))
                          ? isReplayMode ? 'text-purple-400/60' : 'fill-emerald-400 text-emerald-400'
                          : isReplayMode ? 'text-purple-400/60' : 'fill-yellow-400 text-yellow-400'
                      } />
                      <span>+{XP_REWARDS.SECTION_COMPLETION_BONUS} XP</span>
                      {(completedSections.includes(currentSection) || (completedCount === totalCount && totalCount > 0)) ? (
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ml-1 ${
                          isReplayMode ? 'text-purple-400/70 bg-purple-950/40 border border-purple-500/30' : 'text-emerald-400 bg-emerald-900/50 border border-emerald-500/40'
                        }`}>Claimed</span>
                      ) : null}
                    </span>
                  </div>
                </div>

                {/* Objectives List with 3-State System */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase tracking-wider font-bold px-1">
                    <span>{isEarthLevel1 ? 'Mission Objectives' : currentMissionSections.length > 1 ? `Section ${currentSection + 1} Objectives` : 'Objectives'}</span>
                    <span>{completedCount}/{totalCount} Completed</span>
                  </div>

                  {objectives.map((obj) => {
                    const isRecentlyCompleted = recentlyCompletedId === obj.id;
                    const isReplay = isReplayMode || isLevelCompleted || obj.isClaimed;

                    // ACCOMPLISHED OBJECTIVES: In Replay mode, render PURPLE; otherwise, VIBRANT GREEN
                    if (obj.completed) {
                      return (
                        <div
                          key={obj.id}
                          className={`flex items-start justify-between gap-2 p-2.5 rounded-xl border transition-all duration-300 ${
                            isReplay
                              ? 'bg-purple-950/20 border-purple-500/25 text-purple-300/70'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                          } ${isRecentlyCompleted ? 'animate-pulse ring-1 ring-emerald-400' : ''}`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <CheckCircle2
                              size={16}
                              className={`shrink-0 mt-0.5 ${
                                isReplay
                                  ? 'text-purple-400/60'
                                  : 'text-emerald-400 drop-shadow-[0_0_6px_#10b981]'
                              }`}
                            />
                            <span
                              className={`text-xs sm:text-sm font-sans leading-snug break-words ${
                                isReplay
                                  ? 'text-purple-200/50 font-normal line-through'
                                  : 'text-emerald-300 font-medium'
                              }`}
                            >
                              {obj.text}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-mono px-2 py-0.5 rounded shrink-0 mt-0.5 ${
                              isReplay
                                ? 'text-purple-300/60 bg-purple-950/40 border border-purple-500/30'
                                : 'text-emerald-400 bg-emerald-900/40 border border-emerald-500/50 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                            }`}
                          >
                            {isReplay ? 'Claimed' : `+${XP_REWARDS.CAMPAIGN_GOAL} XP`}
                          </span>
                        </div>
                      );
                    }

                    // INCOMPLETE OBJECTIVES (OPEN CIRCLES)
                    return (
                      <div
                        key={obj.id}
                        className="flex items-start justify-between gap-2 p-2.5 rounded-xl border border-white/5 bg-black/20 text-gray-300 transition-all duration-300"
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <Circle
                            size={16}
                            className="shrink-0 mt-0.5 text-gray-500"
                          />
                          <span className="text-xs sm:text-sm font-sans leading-snug break-words text-gray-200">
                            {obj.text}
                          </span>
                        </div>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded shrink-0 mt-0.5 ${
                          isReplay
                            ? 'text-purple-300/60 bg-purple-950/40 border border-purple-500/20'
                            : 'text-gray-400 bg-gray-800/50'
                        }`}>
                          {isReplay ? 'Claimed' : `+${XP_REWARDS.CAMPAIGN_GOAL} XP`}
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
      {/* 2-PANE ADJUSTABLE RESIZABLE LAYOUT (100% Height Fill) OR CUSTOM VIEW */}
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
          <div className="h-12 px-4 bg-[#1a082c] border-b border-white/10 flex items-center justify-between shrink-0 z-10">
            {/* Left side: View Toggle (Workspace / Code Syntax) */}
            <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('blocks')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'blocks'
                    ? 'bg-[#ff912d] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                Workspace
              </button>
              <button
                onClick={() => setViewMode('syntax')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'syntax'
                    ? 'bg-[#ff912d] text-black shadow-md'
                    : 'text-gray-400 hover:text-white'
                  }`}
              >
                Code Syntax
              </button>
            </div>

            {/* Right side: Mercury Level 3 or Venus Level 3 Workspace Tabs */}
            {isMercuryLevel3 ? (
              <div className="flex items-center gap-1.5 overflow-x-auto select-none">
                {([
                  { id: 'html', label: 'HTML (Structure)', valid: mercury3Audit.htmlValid },
                  { id: 'css', label: 'CSS (Style)', valid: mercury3Audit.cssValid },
                  { id: 'js', label: 'JS (Logic)', valid: mercury3Audit.jsValid }
                ] as const).map((tab) => {
                  const isActive = mercury3ActiveTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      disabled={isRunning}
                      onClick={() => !isRunning && handleMercury3TabChange(tab.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all border ${
                        isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        isActive
                          ? 'bg-purple-950/80 border-purple-500 text-purple-100 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                          : 'bg-[#0f0c18]/80 border-purple-900/40 text-purple-300/70 hover:text-purple-200 hover:bg-purple-950/40 hover:border-purple-800/60'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          tab.valid
                            ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                            : isActive
                            ? 'bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]'
                            : 'bg-purple-950 border border-purple-800/50'
                        }`}
                      />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : isVenusLevel3 ? (
              <div className="flex items-center gap-1.5 overflow-x-auto select-none">
                {VENUS_3_TABS.map((tab) => {
                  const isActive = venus3ActiveTab === tab.id;
                  const isSolved = tab.sectorId ? !!venus3SolvedSectors[tab.sectorId] : false;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      disabled={isRunning}
                      onClick={() => !isRunning && handleVenus3TabChange(tab.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        isActive
                          ? 'bg-[#250d44] border-yellow-400 text-white shadow-sm'
                          : 'bg-[#10061e]/70 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-[#1a0b33]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSolved
                            ? 'bg-emerald-400'
                            : isActive
                            ? 'bg-yellow-400'
                            : 'bg-gray-600'
                        }`}
                      />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : isEarthLevel2 ? (
              <div className="flex items-center gap-1.5 overflow-x-auto select-none">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => !isRunning && handleEarth2TabChange('tab1')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    earth2ActiveTab === 'tab1'
                      ? 'bg-[#1e1038] border-cyan-400 text-white shadow-sm'
                      : 'bg-[#0b101b]/70 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-[#151c2e]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isEarth2Tab1Complete ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                  />
                  <span>Profiles</span>
                </button>

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => {
                    if (isRunning) return;
                    if (!isEarth2Tab1Complete) {
                      showToast('Complete and verify all 6 planet profiles in Profiles to unlock Orbits!');
                      return;
                    }
                    handleEarth2TabChange('tab2');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    isRunning
                      ? 'opacity-50 cursor-not-allowed'
                      : !isEarth2Tab1Complete
                      ? 'opacity-60 cursor-not-allowed border-white/5 bg-black/40 text-gray-500'
                      : 'cursor-pointer'
                  } ${
                    earth2ActiveTab === 'tab2'
                      ? 'bg-[#1e1038] border-purple-400 text-white shadow-sm'
                      : !isEarth2Tab1Complete
                      ? 'border-white/5 bg-black/40 text-gray-500'
                      : 'bg-[#0b101b]/70 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-[#151c2e]'
                  }`}
                >
                  {!isEarth2Tab1Complete ? (
                    <Lock size={12} className="text-gray-500 shrink-0" />
                  ) : (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        earth2Tab2Validation.allCorrect ? 'bg-emerald-400' : 'bg-purple-400'
                      }`}
                    />
                  )}
                  <span>Orbits</span>
                </button>
              </div>
            ) : isJupiterLevel2 ? (
              <div className="flex items-center gap-1.5 overflow-x-auto select-none">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => !isRunning && handleJupiter2WaveChange(1)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all border ${
                    isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    jupiter2ActiveWave === 1
                      ? 'bg-[#ff8c42]/20 border-[#ff8c42] text-white shadow-[0_0_12px_rgba(255,140,66,0.3)]'
                      : 'bg-[#0b101b]/70 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-[#151c2e]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isJupiter2Wave1Complete || completedSections.includes(0) ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-[#ff8c42]'
                    }`}
                  />
                  <span>Wave 1</span>
                </button>

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => {
                    if (isRunning) return;
                    if (!isJupiter2Wave1Complete && !completedSections.includes(0) && !isReplayMode) {
                      showToast('Neutralize Wave 1 threats to unlock Wave 2!');
                      return;
                    }
                    handleJupiter2WaveChange(2);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all border ${
                    isRunning
                      ? 'opacity-50 cursor-not-allowed'
                      : !isJupiter2Wave1Complete && !completedSections.includes(0) && !isReplayMode
                      ? 'opacity-60 cursor-not-allowed border-white/5 bg-black/40 text-gray-500'
                      : 'cursor-pointer'
                  } ${
                    jupiter2ActiveWave === 2
                      ? 'bg-[#ff8c42]/20 border-[#ff8c42] text-white shadow-[0_0_12px_rgba(255,140,66,0.3)]'
                      : !isJupiter2Wave1Complete && !completedSections.includes(0) && !isReplayMode
                      ? 'border-white/5 bg-black/40 text-gray-500'
                      : 'bg-[#0b101b]/70 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-[#151c2e]'
                  }`}
                >
                  {!isJupiter2Wave1Complete && !completedSections.includes(0) && !isReplayMode ? (
                    <Lock size={12} className="text-gray-500 shrink-0" />
                  ) : (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isJupiter2Wave2Complete || completedSections.includes(0) ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-[#ff8c42]'
                      }`}
                    />
                  )}
                  <span>Wave 2</span>
                </button>

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => {
                    if (isRunning) return;
                    if (!isJupiter2Wave2Complete && !completedSections.includes(0) && !isReplayMode) {
                      showToast('Neutralize Wave 2 threats to unlock Wave 3!');
                      return;
                    }
                    handleJupiter2WaveChange(3);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all border ${
                    isRunning
                      ? 'opacity-50 cursor-not-allowed'
                      : !isJupiter2Wave2Complete && !completedSections.includes(0) && !isReplayMode
                      ? 'opacity-60 cursor-not-allowed border-white/5 bg-black/40 text-gray-500'
                      : 'cursor-pointer'
                  } ${
                    jupiter2ActiveWave === 3
                      ? 'bg-[#ff8c42]/20 border-[#ff8c42] text-white shadow-[0_0_12px_rgba(255,140,66,0.3)]'
                      : !isJupiter2Wave2Complete && !completedSections.includes(0) && !isReplayMode
                      ? 'border-white/5 bg-black/40 text-gray-500'
                      : 'bg-[#0b101b]/70 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-[#151c2e]'
                  }`}
                >
                  {!isJupiter2Wave2Complete && !completedSections.includes(0) && !isReplayMode ? (
                    <Lock size={12} className="text-gray-500 shrink-0" />
                  ) : (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        completedSections.includes(0) ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-[#ff8c42]'
                      }`}
                    />
                  )}
                  <span>Wave 3</span>
                </button>
              </div>
            ) : <div />}
          </div>

          {/* Blockly SVG Canvas View */}
          <div
            className={`flex-1 min-h-0 w-full relative ${viewMode === 'blocks' ? 'block' : 'hidden'}`}
          >
            <div ref={blocklyDiv} className="w-full h-full" />

            {/* Mercury Level 3 Step-by-Step Workspace Guide */}
            {isMercuryLevel3 && (
              <div className="absolute top-3 right-4 z-20 flex flex-col items-end">
                {/* Floating Guide Button */}
                <button
                  type="button"
                  onClick={() => setShowMercury3Hint(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-lg backdrop-blur-md transition-all cursor-pointer ${
                    showMercury3Hint
                      ? 'bg-amber-500/20 border-amber-500/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                      : 'bg-[#18092e]/90 border-purple-600/50 text-purple-200 hover:border-purple-400 hover:text-white'
                  }`}
                  title={showMercury3Hint ? "Close Step Guide" : "Open Step Guide"}
                >
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Guide</span>
                </button>

                {/* Step-by-Step Popover Card */}
                {showMercury3Hint && (
                  <div className="mt-2 w-80 sm:w-96 max-w-[calc(100vw-32px)] bg-[#16082b]/95 border border-purple-500/40 rounded-xl p-3 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 select-none">
                    <div className="flex items-center justify-between pb-1.5 border-b border-purple-800/50 mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-xs font-bold text-amber-300">
                          {mercury3ActiveTab === 'html' && 'HTML Structure Hint'}
                          {mercury3ActiveTab === 'css' && 'CSS Styling Hint'}
                          {mercury3ActiveTab === 'js' && 'JS Logic Hint'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMercury3Hint(false)}
                        className="text-purple-400 hover:text-purple-200 p-0.5 rounded cursor-pointer transition-colors"
                        title="Close Hint"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-purple-200/90 leading-relaxed">
                      {mercury3ActiveTab === 'html' && (
                        <p>Link your stylesheet and script, then snap your title, choice menu with planet options, text area, and buttons into place on the workspace.</p>
                      )}
                      {mercury3ActiveTab === 'css' && (
                        <p>Use selector blocks to color and style at least 3 HTML assets (such as buttons, choice menu, message input, or screen card).</p>
                      )}
                      {mercury3ActiveTab === 'js' && (
                        <p>Listen for a click on the Send button, then read the destination planet and message text to transmit the signal.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mercury Level 3 Simulation Workspace Lock Overlay */}
            {isMercuryLevel3 && isRunning && (
              <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-auto select-none">
                <div className="bg-[#120824]/95 border border-amber-500/40 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-2.5 text-xs text-amber-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Simulation Active: Test interface via AstroLink terminal</span>
                </div>
              </div>
            )}



            {/* Mars Level 1 Floating Theme Dropdown in Sandbox Canvas */}
            {isMarsLevel1 && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2.5 bg-[#17072c]/90 border border-[#ff912d]/60 hover:border-[#ff912d] rounded-2xl px-4 py-2 shadow-[0_4px_25px_rgba(0,0,0,0.6),0_0_20px_rgba(255,145,45,0.25)] backdrop-blur-md transition-all">
                <span className="text-xs sm:text-sm font-display font-black text-[#ff912d] uppercase tracking-wider shrink-0">
                  Theme:
                </span>
                <select
                  value={activeMarsCampaignId}
                  onChange={(e) => handleMarsCampaignChange(e.target.value)}
                  className="bg-[#0e031a] hover:bg-[#1a082c] border border-[#ff912d]/50 hover:border-[#ff912d] text-white font-bold rounded-xl px-3.5 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#ff912d] cursor-pointer shadow-inner transition-all"
                  title="Select Billboard Theme"
                  aria-label="Select Billboard Theme"
                >
                  {MARS_CAMPAIGN_PRESETS.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#180718] text-white py-2 font-medium">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Floating Toast Notification */}
            {showClipboardToast && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 bg-[#1e0a2d]/95 border border-[#ff912d]/60 text-white rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <Sparkles size={16} className="text-[#ff912d] shrink-0" />
                <span className="text-xs sm:text-sm font-semibold">{clipboardToastMessage}</span>
                {toastUndoAction && (
                  <button
                    onClick={() => {
                      toastUndoAction();
                      setShowClipboardToast(false);
                      setToastUndoAction(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-100 border border-amber-500/50 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm ml-1"
                  >
                    <Undo2 size={13} />
                    <span>Undo</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowClipboardToast(false);
                    setToastUndoAction(null);
                  }}
                  className="p-1 text-gray-400 hover:text-white rounded transition-colors ml-1 shrink-0 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Workspace Utility Controls (Bottom Right Floating Palette) */}
            <div className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-2.5">
              {/* Reset View & Center */}
              <button
                onClick={() => {
                  if (workspace.current) {
                    Blockly.svgResize(workspace.current);
                    workspace.current.scrollCenter();
                  }
                }}
                className="w-10 h-10 rounded-xl bg-[#1e0a2d]/90 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
                title="Center Workspace View"
                aria-label="Center Workspace View"
              >
                <Crosshair size={18} />
              </button>

              {/* Zoom In */}
              <button
                onClick={() => {
                  if (workspace.current) {
                    workspace.current.zoomCenter(1);
                  }
                }}
                className="w-10 h-10 rounded-xl bg-[#1e0a2d]/90 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
                title="Zoom In"
                aria-label="Zoom In"
              >
                <Plus size={18} />
              </button>

              {/* Zoom Out */}
              <button
                onClick={() => {
                  if (workspace.current) {
                    workspace.current.zoomCenter(-1);
                  }
                }}
                className="w-10 h-10 rounded-xl bg-[#1e0a2d]/90 hover:bg-white/10 border border-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <Minus size={18} />
              </button>

              {/* Delete Selected Block / Workspace */}
              <button
                onClick={() => {
                  if (workspace.current) {
                    const selected = Blockly.getSelected();
                    if (selected && typeof (selected as any).dispose === 'function' && (selected as any).type !== 'event_start' && (selected as any).isDeletable?.()) {
                      (selected as any).dispose(true);
                      showToast("Deleted selected block", {
                        onUndo: () => {
                          if (workspace.current) workspace.current.undo(false);
                        },
                        duration: 7000,
                      });
                    } else {
                      resetWorkspaceToDefaultStart(workspace.current, true);
                      setJsCode('');
                      setPlainEnglishCode('');
                      showToast("Reset workspace blocks", {
                        onUndo: () => {
                          if (workspace.current) workspace.current.undo(false);
                        },
                        duration: 7000,
                      });
                    }
                  }
                }}
                className="w-10 h-10 rounded-xl bg-[#1e0a2d]/90 hover:bg-red-500/20 border border-white/15 hover:border-red-500/40 text-gray-400 hover:text-red-400 flex items-center justify-center transition-all shadow-xl backdrop-blur-md cursor-pointer active:scale-95"
                title="Delete Selected Block or Reset Workspace"
                aria-label="Delete Selected Block or Reset Workspace"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          {/* Global Interactive Syntax & Code Inspector View */}
          {viewMode === 'syntax' && (
            <div className="flex-1 min-h-0 w-full overflow-hidden bg-[#0e031a]">
              {isMarsLevel1 || isMarsLevel2 || isMarsLevel3 ? (
                <MarsSyntaxTab code={plainEnglishCode || jsCode} />
              ) : isVenusLevel1 || isVenusLevel2 ? (
                <SyntaxViewer code={plainEnglishCode || jsCode || (isVenusLevel2 ? generateVenusLevel2FullCss(workspace.current, venus2ActivePanel, venus2SolvedPanels) : '')} mode="css" />
              ) : isVenusLevel3 ? (
                <SyntaxViewer
                  code={plainEnglishCode || jsCode || (workspace.current ? parseVenusLevel3Workspace(workspace.current, venus3ActiveTab).code : '')}
                  mode={venus3ActiveTab === 'main' ? 'html' : 'css'}
                />
              ) : isMercuryLevel1 ? (
                <SyntaxViewer
                  code={plainEnglishCode || jsCode || (workspace.current ? parseMercuryLevel1Workspace(workspace.current).jsCode : '')}
                  mode="javascript"
                />
              ) : isMercuryLevel2 ? (
                <SyntaxViewer
                  code={plainEnglishCode || jsCode || (workspace.current ? parseMercuryLevel2Workspace(workspace.current).jsCode : '')}
                  mode="javascript"
                />
              ) : isMercuryLevel3 ? (
                <SyntaxViewer
                  code={
                    mercury3ActiveTab === 'html'
                      ? (mercury3HtmlCode || (workspace.current ? compileMercury3Html(workspace.current) : ''))
                      : mercury3ActiveTab === 'css'
                      ? (mercury3CssCode || (workspace.current ? compileMercury3Css(workspace.current) : ''))
                      : (mercury3JsCode || (workspace.current ? compileMercury3Js(workspace.current) : ''))
                  }
                  mode={mercury3ActiveTab === 'html' ? 'html' : mercury3ActiveTab === 'css' ? 'css' : 'javascript'}
                />
              ) : isJupiterLevel1 || isJupiterLevel2 || isJupiterLevel3 ? (
                <SyntaxViewer
                  code={
                    isJupiterLevel3
                      ? (jupiter3Blueprint.rawJavaCode || (workspace.current ? parseJupiterLevel3Workspace(workspace.current).rawJavaCode : ''))
                      : isJupiterLevel2
                      ? (jupiter2Validation.javaCode || (workspace.current ? parseJupiterLevel2Workspace(workspace.current).javaCode : ''))
                      : (plainEnglishCode || jsCode || (workspace.current ? parseJupiterLevel1Workspace(workspace.current).javaCode : ''))
                  }
                  mode="java"
                />
              ) : isSaturnLevel1 || isSaturnLevel2 || isSaturnLevel3 ? (
                <SyntaxViewer
                  code={
                    isSaturnLevel3
                      ? (saturn3Payload.rawCppCode || (workspace.current ? parseSaturnLevel3Workspace(workspace.current).rawCppCode : ''))
                      : isSaturnLevel2
                      ? (saturn2Validation.cppCode || (workspace.current ? parseSaturnLevel2Workspace(workspace.current).cppCode : ''))
                      : (saturn1Validation.cppCode || generateSaturnCppCode(saturnWorkspaceState, saturnWave))
                  }
                  mode="cpp"
                />
              ) : isEarthLevel1 || isEarthLevel2 ? (
                <SyntaxViewer
                  code={
                    isEarthLevel2
                      ? (earth2ActiveTab === 'tab1' ? earth2Tab1Validation.pythonCode : earth2Tab2Validation.pythonCode)
                      : (earth1Validation.pythonCode || generateEarthPythonCode(earthWorkspaceState, currentSection))
                  }
                  mode="python"
                />
              ) : (
                <PlainEnglishCodeViewer code={plainEnglishCode || jsCode} />
              )}
            </div>
          )}
        </div>

        {/* DRAGGABLE RESIZER HANDLE */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="w-2.5 hover:w-3 bg-[#1e0a2d] hover:bg-[#ff912d] cursor-col-resize flex items-center justify-center transition-all z-30 shrink-0 border-x border-white/10 group shadow-xl select-none"
          title="Drag to resize split panes"
        >
          <div className="w-1 h-8 rounded-full bg-white/30 group-hover:bg-black transition-colors pointer-events-none" />
        </div>

        {/* RIGHT PANE: Grid Canvas Simulation View */}
        <div
          className="h-full flex flex-col min-w-[300px] relative bg-[#0e0419] overflow-hidden"
          style={{ width: `${100 - splitPercent}%` }}
        >
          {/* Header Banner */}
          <div className="min-h-[52px] h-13 sm:h-14 px-4 bg-[#160628] border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <Radio size={18} className="text-[#ff912d] animate-pulse" />
              <span className="font-mono text-sm sm:text-base font-black text-white uppercase tracking-wider">
                SIMULATION
              </span>
            </div>
            {isMarsLevel1 && (
              <div className="relative" ref={instructionsDropdownRef}>
                <button
                  onClick={() => setIsInstructionsOpen(prev => !prev)}
                  className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/60 text-purple-100 hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.35)] active:scale-95 cursor-pointer ring-1 ring-purple-400/30"
                  title="How to Build Billboard"
                >
                  <HelpCircle size={15} className="text-purple-300" />
                  <span>Instructions</span>
                  {isInstructionsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {isInstructionsOpen && (
                  <div className="absolute top-11 right-0 z-[60] w-[min(22rem,calc(100vw-3rem))] bg-[#160a2c]/98 border-2 border-purple-500/50 rounded-xl p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                      <span className="font-mono text-xs font-black uppercase tracking-wider text-amber-400">
                        HOW TO BUILD YOUR BILLBOARD
                      </span>
                      <button
                        onClick={() => setIsInstructionsOpen(false)}
                        className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="space-y-2.5 text-xs text-gray-200 leading-relaxed font-sans">
                      <p className="text-purple-300 font-semibold text-xs">
                        Creative tips for your billboard:
                      </p>

                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-400 font-mono font-bold shrink-0">•</span>
                          <span><strong>Hierarchy:</strong> Connect a <strong className="text-orange-400">Large Title</strong>, <strong className="text-amber-300">Subtitle</strong>, and <strong className="text-sky-300">Paragraph Text</strong> block.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-cyan-400 font-mono font-bold shrink-0">•</span>
                          <span><strong>Theme:</strong> Pick words that match your active <strong className="text-cyan-300">Theme</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 font-mono font-bold shrink-0">•</span>
                          <span><strong>Styling:</strong> Try wrapping words with <strong className="text-pink-400">Bold</strong>, <strong className="text-yellow-300">Highlight</strong>, or <strong className="text-cyan-300">Underline</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-emerald-400 font-mono font-bold shrink-0">•</span>
                          <span><strong>Broadcast:</strong> Click <strong className="text-emerald-400">Run Simulation</strong> to light up your sign!</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Viewport: Mars Billboard (Mars 1), Mars Image Billboards (Mars 2), 2D Conveyor Belt Sorting (Level 2), or 2D Matrix Grid (Level 1 & 3) */}
          {isMarsLevel1 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-end overflow-hidden relative">
              <MartianBillboard
                parsedElements={marsParsedElements}
                validation={marsValidation}
                sectionIndex={currentSection}
                campaignId={activeMarsCampaignId}
                isRunning={isRunning}
                onSimulationComplete={(success, failureReason) => {
                  if (success) {
                    const htmlCode = workspace.current ? javascriptGenerator.workspaceToCode(workspace.current) : '';
                    handleMars1Success(htmlCode);
                  } else {
                    setErrorToastMessage(failureReason || "Make sure your words match the chosen theme and try again!");
                    setShowErrorToast(true);
                    if (errorToastTimer.current) clearTimeout(errorToastTimer.current);
                    errorToastTimer.current = setTimeout(() => setShowErrorToast(false), 6500);
                  }
                }}
              />
            </div>
          ) : isMarsLevel2 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-end overflow-hidden relative">
              <MarsImageBillboards
                validation={mars2Validation}
                isRunning={isRunning}
                onSimulationComplete={handleMars2SimulationComplete}
              />
            </div>
          ) : isMarsLevel3 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
              <MarsLevel3
                validation={mars3Validation}
                isRunning={isRunning}
                phase={mars3Phase}
                setPhase={setMars3Phase}
                isMercuryPinged={mars3MercuryPinged}
                isVenusPinged={mars3VenusPinged}
                isStatusOpened={mars3StatusOpened}
                onPlanetPinged={handleMars3PlanetPinged}
                onPlanetStatusOpened={handleMars3StatusOpened}
                onSimulationComplete={handleMars3SimulationComplete}
              />
            </div>
          ) : isVenusLevel1 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
              <VenusLevel1Lab
                validation={venus1Validation}
                isRunning={isRunning}
                onSimulationComplete={handleVenus1SimulationComplete}
              />
            </div>
          ) : isVenusLevel2 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
              <VenusLevel2Lab
                isRunning={isRunning}
                validation={venus2Validation}
                activePanel={venus2ActivePanel as 1 | 2 | 3 | 4 | 5}
                setActivePanel={(p) => {
                  setVenus2ActivePanel(p);
                  try {
                    setNetstartItem('netstart_venus2_active_panel', String(p));
                  } catch (e) { }
                }}
                solvedPanels={venus2SolvedPanels}
                onPanelSolved={handleVenus2PanelSolved}
                onSimulationComplete={handleVenus2SimulationComplete}
              />
            </div>
          ) : isVenusLevel3 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
              <VenusLevel3
                activeSector={venus3ActiveTab}
                setActiveSector={handleVenus3TabChange}
                solvedSectors={venus3SolvedSectors}
                isRunning={isRunning}
                sectorStyles={venus3SectorStyles}
                linkedStylesheets={venus3LinkedStylesheets}
                failedSectors={venus3FailedSectors}
                inlineStyles={venus3InlineStyles}
                scanPhase={venus3ScanPhase}
                scanResults={venus3ScanResults}
              />
            </div>
          ) : isMercuryLevel1 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
              <MercuryLevel1Biodome
                validation={mercury1Validation}
                isRunning={isRunning}
                onSimulationComplete={handleMercury1SimulationComplete}
              />
            </div>
          ) : isMercuryLevel2 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
              <MercuryLevel2Conveyor
                validation={mercury2Validation}
                isRunning={isRunning}
                onSimulationComplete={handleMercury2SimulationComplete}
                onResetSimulation={() => setIsRunning(false)}
                onItemSorted={(count) => {
                  if (count >= 20) {
                    if (mercury2Validation.objective2Variable) markObjectiveComplete(1);
                    if (mercury2Validation.objective3Logic) markObjectiveComplete(2);
                    markObjectiveComplete(3);
                  }
                }}
              />
            </div>
          ) : isMercuryLevel3 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
              <MercuryLevel3Simulation
                key={mercury3ResetKey}
                htmlCode={mercury3HtmlCode}
                cssCode={mercury3CssCode}
                jsCode={mercury3JsCode}
                isRunning={isRunning}
                audit={mercury3Audit}
                onSimulationComplete={handleMercury3SimulationComplete}
                onResetSimulation={handleMercury3Reset}
                onStopRunning={() => setIsRunning(false)}
                onExitToModules={() => requestNavigation('/modules/mercury')}
              />
            </div>
          ) : isJupiterLevel1 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
              <JupiterLevel1Simulation
                validation={jupiter1Validation}
                isRunning={isRunning}
                failCount={jupiter1FailCount}
                onSimulationComplete={handleJupiter1SimulationComplete}
              />
            </div>
          ) : isJupiterLevel2 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
              <JupiterLevel2Simulation
                key={`${jupiter2ResetKey}_wave_${jupiter2ActiveWave}`}
                wave={jupiter2ActiveWave}
                validation={jupiter2Validation}
                isRunning={isRunning}
                onSimulationComplete={handleJupiter2SimulationComplete}
                onResetSimulation={() => setJupiter2ResetKey(prev => prev + 1)}
              />
            </div>
          ) : isJupiterLevel3 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-center overflow-hidden relative">
              <JupiterLevel3Simulation
                key={jupiter3ResetKey}
                blueprint={jupiter3Blueprint}
                isRunning={isRunning}
                onRunSimulation={runCode}
                onResetSimulation={handleJupiter3Reset}
                onStopRunning={() => setIsRunning(false)}
                onSimulationComplete={() => handleJupiter3SimulationComplete(true)}
                onClueRead={(allRead) => {
                  if (allRead) {
                    markObjectiveComplete(1);
                  }
                }}
                onExitToModules={() => requestNavigation('/modules/jupiter')}
              />
            </div>
          ) : isSaturnLevel1 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col overflow-hidden relative">
              <SaturnLevel1Simulation
                validation={saturn1Validation}
                workspaceState={saturnWorkspaceState}
                isRunning={isRunning}
                currentWave={saturnWave}
                failCount={saturn1FailCount}
                isWon={saturnIsWon}
                onSimulationComplete={handleSaturn1SimulationComplete}
              />
            </div>
          ) : isSaturnLevel2 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col overflow-hidden relative">
              <SaturnLevel2Simulation
                key={saturn2ResetKey}
                validation={saturn2Validation}
                isRunning={isRunning}
                onSimulationComplete={handleSaturn2SimulationComplete}
                onShieldDeflected={() => {
                  setSaturn2ShieldActivated(true);
                  setSaturn2UfoGreeted(true);
                }}
                onUfoGreeted={() => {
                  setSaturn2ShieldActivated(true);
                  setSaturn2UfoGreeted(true);
                }}
                resetKey={saturn2ResetKey}
              />
            </div>
          ) : isSaturnLevel3 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col overflow-hidden relative">
              <SaturnLevel3Simulation
                key={saturn3ResetKey}
                payload={saturn3Payload}
                isRunning={isRunning}
                onRunSimulation={runCode}
                onResetSimulation={handleSaturn3Reset}
                onStopRunning={() => setIsRunning(false)}
                onSimulationComplete={() => handleSaturn3SimulationComplete(true)}
                onTerminalRead={(allRead) => {
                  if (allRead) {
                    markObjectiveComplete(1);
                  }
                }}
                onExitToModules={() => requestNavigation('/modules/saturn')}
              />
            </div>
          ) : isEarthLevel1 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col overflow-hidden relative">
              <EarthLevel1Lab
                sectionIndex={currentSection}
                validation={earth1Validation}
                workspaceState={earthWorkspaceState}
                isRunning={isRunning}
                onSimulationComplete={handleEarth1SimulationComplete}
                onAdvanceSection={() => {
                  if (currentSection < 2) {
                    recordSectionCompleted(currentSection);
                    const nextSec = currentSection + 1;
                    const earthAliases = [missionId, 'earth-1', 'python-1', 'earth'].filter(Boolean);
                    earthAliases.forEach(id => {
                      removeNetstartItem(`netstart_saved_workspace_${id}_${nextSec}`);
                    });
                    loadSection(nextSec);
                    showToast("Sector restored! Moving to next ledger section.");
                  } else {
                    handleEarth1Success(earth1Validation.pythonCode);
                  }
                }}
              />
            </div>
          ) : isEarthLevel2 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col overflow-hidden relative">
              <EarthLevel2Simulation
                sectionIndex={0}
                activeTab={earth2ActiveTab}
                section1Validation={earth2Tab1Validation}
                section2Validation={earth2Tab2Validation}
                tab1Validation={earth2Tab1Validation}
                tab2Validation={earth2Tab2Validation}
                isRunning={isRunning}
                resetKey={simulationResetKey}
                onSimulationComplete={handleEarth2SimulationComplete}
                onSelectPlanet={undefined}
              />
            </div>
          ) : isEarthLevel3 ? (
            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col overflow-hidden relative">
              <EarthLevel3Simulation
                key={earth3ResetKey}
                audit={earth3Audit}
                isRunning={isRunning}
                pythonCode={earth3Code}
                onSimulationComplete={handleEarth3SimulationComplete}
                onStopRunning={() => setIsRunning(false)}
                onResetSimulation={handleEarth3Reset}
              />
            </div>
          ) : isLevel2 ? (

            <div className="flex-1 min-h-0 min-w-0 w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden relative bg-[#0c0419] select-none">
              {/* Clean Dark Space Backdrop */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(88,28,135,0.15),_transparent_70%)]" />
              </div>

              {/* Top Minimal HUD: Level Target Manifest & Live Sorted Counter */}
              <div className="w-full flex items-start justify-start gap-3 z-20 shrink-0">
                {/* Section Level Manifest (Live sorted items count starting from 0 up to total) */}
                <div className="flex flex-col gap-1 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 font-mono shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
                    {levelManifest.cargo > 0 && (
                      <div className="flex items-center gap-1.5 text-blue-300" title="Cargo Sorted">
                        <Package size={15} className="text-blue-400 shrink-0" />
                        <span className="font-extrabold text-white text-sm sm:text-base">{conveyorInventory.cargo}</span>
                      </div>
                    )}
                    {levelManifest.trash > 0 && (
                      <>
                        {levelManifest.cargo > 0 && <span className="text-white/30 font-bold">|</span>}
                        <div className="flex items-center gap-1.5 text-rose-300" title="Trash Discarded">
                          <Trash2 size={15} className="text-rose-400 shrink-0" />
                          <span className="font-extrabold text-white text-sm sm:text-base">{conveyorInventory.trash}</span>
                        </div>
                      </>
                    )}
                    {levelManifest.fuel > 0 && (
                      <>
                        <span className="text-white/30 font-bold">|</span>
                        <div className="flex items-center gap-1.5 text-amber-300" title="Fuel Routed">
                          <Zap size={15} className="text-amber-400 fill-amber-400 shrink-0" />
                          <span className="font-extrabold text-white text-sm sm:text-base">{conveyorInventory.fuel}</span>
                        </div>
                      </>
                    )}
                    {levelManifest.food > 0 && (
                      <>
                        <span className="text-white/30 font-bold">|</span>
                        <div className="flex items-center gap-1.5 text-emerald-300" title="Food Routed">
                          <Apple size={15} className="text-emerald-400 shrink-0" />
                          <span className="font-extrabold text-white text-sm sm:text-base">{conveyorInventory.food}</span>
                        </div>
                      </>
                    )}
                    {conveyorInventory.errors > 0 && (
                      <>
                        <span className="text-white/30 font-bold">|</span>
                        <div className="flex items-center gap-1 text-rose-400 font-bold" title="Errors">
                          <AlertTriangle size={15} className="shrink-0" />
                          <span className="font-extrabold text-rose-300 text-sm sm:text-base">{conveyorInventory.errors}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                    Total Items: <span className="font-bold text-purple-300 text-xs sm:text-sm">{levelManifest.total}</span>
                  </div>
                </div>
              </div>

              {/* Simulation Workspace Wrapper */}
              {(() => {
                const isSortingGauntlet = dailySection?.name === 'Master Sorting Gauntlet';
                const showFuelBay = isSortingGauntlet || currentSection >= 2;
                const showTrashZone = isSortingGauntlet || currentSection >= 1;
                const showFoodZone = isSortingGauntlet;

                return (
                  <div className="w-full max-w-[620px] flex-1 flex flex-col items-center justify-center my-auto relative z-10">
                    {/* Top Drop Zones (Cargo [Blue] in all sections, Fuel [Yellow] in Section 3 & Challenge Level) */}
                    <div className="z-20 mb-6 sm:mb-8 flex items-center justify-center gap-4 sm:gap-6 self-center mx-auto">
                      {/* Cargo Zone (Blue) */}
                      <div className={`w-40 sm:w-48 h-16 sm:h-18 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center gap-2.5 relative overflow-hidden select-none ${activeAction === 'pack_cargo' || activeAction === 'pack'
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

                      {/* Rocket Ship / Fuel Zone (Yellow) - Moon Sec 3 & Challenge Level */}
                      {showFuelBay && (
                        <div className={`w-40 sm:w-48 h-16 sm:h-18 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center gap-2.5 relative overflow-hidden select-none ${activeAction === 'route_fuel'
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
                        className={`absolute inset-x-0 inset-y-1.5 opacity-25 pointer-events-none overflow-hidden rounded-lg ${isBeltAdvancing ? 'animate-treads-advancing' : isRunning ? 'animate-treads-running' : ''
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
                            <div className={`absolute -inset-2.5 rounded-xl border pointer-events-none transition-all duration-300 overflow-hidden ${isScanning || activeAction === 'scan' ? 'border-cyan-400 shadow-[0_0_20px_#06b6d4] bg-cyan-500/20 animate-scan-glow' :
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

                            {/* Floating Identified Confirmation Badge (Sections 2..3 or challenge after scanning) */}
                            {isCurrentItemScanned && (currentSection > 0 || isSortingGauntlet) && !animatingItem && (
                              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-[8px] font-mono font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.8)] whitespace-nowrap animate-pulse z-30 flex items-center gap-1">
                                <Sparkles size={10} className="text-emerald-400" />
                                <span>IDENTIFIED</span>
                              </div>
                            )}

                            {/* Phase 2: Independent Floating Animating Item Overlay (Overlaps Scanner Node) */}
                            {animatingItem && (
                              <div
                                key={`animating-${animatingItem.item.id}`}
                                className={`absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none transition-all duration-600 ease-out ${animatingItem.isFlying
                                    ? animatingItem.destination === 'cargo'
                                      ? showFuelBay
                                        ? '-translate-y-28 scale-75 opacity-0'
                                        : 'translate-x-24 -translate-y-28 scale-75 opacity-0'
                                      : animatingItem.destination === 'fuel'
                                        ? 'translate-x-44 -translate-y-28 scale-75 opacity-0'
                                        : animatingItem.destination === 'trash'
                                          ? showFoodZone
                                            ? 'translate-y-28 scale-75 opacity-0'
                                            : 'translate-x-24 translate-y-28 scale-75 opacity-0'
                                          : 'translate-x-44 translate-y-28 scale-75 opacity-0' // cafeteria / food
                                    : 'translate-x-0 translate-y-0 scale-100 opacity-100'
                                  }`}
                              >
                                <div
                                  className={`w-15 h-15 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center shadow-2xl border-2 relative overflow-hidden ${animatingItem.item.type === 'cargo'
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
                              className={`w-15 h-15 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-300 z-10 relative overflow-hidden ${animatingItem ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
                                } ${!isRunning && !animatingItem ? 'animate-idle-float' : ''
                                } ${!isCurrentItemScanned
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
                                className={`w-12 h-12 sm:w-13 sm:h-13 rounded-lg flex flex-col items-center justify-center shrink-0 border-2 ${!isRunning ? 'animate-idle-float' : ''
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

                    {/* Bottom Drop Zones (Trash [Red] in Section 2..3 & Challenge, Cafeteria [Green] in Challenge Level) */}
                    {(showTrashZone || showFoodZone) && (
                      <div className="z-20 mt-6 sm:mt-8 flex items-center justify-center gap-4 sm:gap-6 self-center mx-auto">
                        {/* Trash Zone (Red) */}
                        {showTrashZone && (
                          <div className={`w-40 sm:w-48 h-16 sm:h-18 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center gap-2.5 relative overflow-hidden select-none ${activeAction === 'discard_trash' || activeAction === 'discard'
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
                        )}

                        {/* Cafeteria / Food Zone (Green) - Challenge Level */}
                        {showFoodZone && (
                          <div className={`w-40 sm:w-48 h-16 sm:h-18 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center gap-2.5 relative overflow-hidden select-none ${activeAction === 'route_food'
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
                );
              })()}
            </div>
          ) : isLevel3 && currentSection === 0 && dailySection?.name !== 'Fuel Synthesis Protocol' ? (
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
          ) : (isLevel3 && currentSection === 1) || dailySection?.name === 'Fuel Synthesis Protocol' ? (
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
                        claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
                      } catch (e) { }

                      if (!isReplayMode && !claimedList.includes(bonusKey)) {
                        addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, `Section ${currentSection + 1} Cleared`);
                        claimedList.push(bonusKey);
                        try {
                          setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
                        } catch (e) { }
                      }

                      if (currentSection === currentMissionSections.length - 1) {
                        try {
                          removeNetstartItem('netstart_active_saved_level');
                          removeNetstartItem('netstart_active_level');
                          if (!isDemoModeActive() && missionId) {
                            const compKey = 'netstart_completed_missions';
                            const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
                            if (!existing.includes(missionId)) {
                              existing.push(missionId);
                              setNetstartItem(compKey, JSON.stringify(existing));
                            }
                            if (!getNetstartItem('netstart_last_animated_planet_idx')) {
                              setNetstartItem('netstart_last_animated_planet_idx', '0');
                            }
                            setNetstartItem('netstart_planet_unlock_pending', 'true');
                          }
                        } catch (e) { }
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
                destinationPlanet="/assets/planets/celestial/Mars.svg"
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
                        claimedList = JSON.parse(getNetstartItem('netstart_claimed_directives') || '[]');
                      } catch (e) { }

                      if (!isReplayMode && !claimedList.includes(bonusKey)) {
                        addXp(XP_REWARDS.SECTION_COMPLETION_BONUS, `Section ${currentSection + 1} Cleared`);
                        claimedList.push(bonusKey);
                        try {
                          setNetstartItem('netstart_claimed_directives', JSON.stringify(claimedList));
                        } catch (e) { }
                      }

                      if (currentSection === currentMissionSections.length - 1) {
                        try {
                          removeNetstartItem('netstart_active_saved_level');
                          removeNetstartItem('netstart_active_level');
                          if (!isDemoModeActive() && missionId) {
                            const compKey = 'netstart_completed_missions';
                            const existing: string[] = JSON.parse(getNetstartItem(compKey) || '[]');
                            if (!existing.includes(missionId)) {
                              existing.push(missionId);
                              setNetstartItem(compKey, JSON.stringify(existing));
                            }
                            if (!getNetstartItem('netstart_last_animated_planet_idx')) {
                              setNetstartItem('netstart_last_animated_planet_idx', '0');
                            }
                            setNetstartItem('netstart_planet_unlock_pending', 'true');
                          }
                        } catch (e) { }
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
                  className={`z-10 flex items-center justify-center pointer-events-none transition-all duration-400 ease-in-out ${isBumping ? 'animate-rover-bump' : ''
                    } ${isStartError ? 'ring-2 ring-red-500 rounded-full shadow-[0_0_20px_#ef4444]' : ''} ${isWarningPulse ? 'ring-4 ring-yellow-400 rounded-full animate-pulse shadow-[0_0_25px_#facc15]' : ''
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
                    {isMarsLevel1
                      ? "Broadcast Alert"
                      : isLevel3
                        ? currentSection === 2
                          ? "Flight Alert"
                          : currentSection === 1
                            ? "Fuel Alert"
                            : "Life Support Alert"
                        : isLevel2
                          ? "Cargo Bay Alert"
                          : "Error Alert!"}
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

          {/* Nova AI Hint Panel (Supplements failure toasts) */}
          {aiHint.show && (
            <div className="mx-4 mb-3 p-3.5 bg-gradient-to-r from-[#0c1f38] to-[#12284c] border border-cyan-500/60 text-white rounded-2xl shadow-2xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200 shrink-0">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shrink-0 shadow-inner mt-0.5">
                  <Sparkles size={18} className="text-cyan-300" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm font-black text-cyan-300 font-sans leading-tight">
                      Nova AI Tactical Hint
                    </p>
                    {aiHint.isLoading && (
                      <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                        Analyzing telemetry...
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cyan-100/90 font-sans mt-1 leading-snug">
                    {aiHint.text}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiHint(prev => ({ ...prev, show: false }))}
                className="p-1.5 rounded-lg text-cyan-400/70 hover:text-white hover:bg-cyan-500/20 transition-colors shrink-0 cursor-pointer"
                title="Dismiss Hint"
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
                  <p className="text-base sm:text-lg font-black text-yellow-400 font-sans leading-tight">Almost there!</p>
                  <p className="text-sm text-gray-200 font-sans mt-1 leading-snug">
                    {isLevel2
                      ? "You sorted all items! Connect an End block to complete your code."
                      : isSaturnLevel2
                      ? "You cleared the ring jam! Connect an End block to complete your code."
                      : isSaturnLevel3
                      ? "All subsystems ran safely! Connect an End block to complete your code."
                      : "You reached the goal! Connect an End block to complete your code."}
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
                  <p className="text-xs sm:text-sm font-black text-yellow-300 font-sans leading-tight">Start Block Needed</p>
                  <p className="text-xs text-gray-300 font-sans mt-0.5 leading-snug">
                    Put a Start block at the top of your code to begin.
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
                  <p className="text-xs sm:text-sm font-black text-amber-300 font-sans leading-tight">Loop Limit Reached</p>
                  <p className="text-xs text-gray-300 font-sans mt-0.5 leading-snug">
                    Your code ran for too long. Check your repeat blocks!
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
            {isMarsLevel3 && mars3Validation.hasTitle && mars3StatusOpened && mars3MercuryPinged && mars3VenusPinged ? (
              <button
                onClick={runCode}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-display font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 bg-gradient-to-r from-[#ff912d] to-amber-500 hover:from-amber-500 hover:to-[#ff912d] text-black shadow-[#ff912d]/30 hover:scale-105 cursor-pointer animate-pulse"
              >
                <CheckCircle2 size={16} className="text-black" />
                <span>Complete Level</span>
              </button>
            ) : (
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
                    <span>{isMarsLevel3 ? 'Powering Terminal...' : 'Stop Simulation'}</span>
                  </>
                ) : (
                  <>
                    <Play size={16} className="fill-black" />
                    <span>Run Simulation</span>
                  </>
                )}
              </button>
            )}

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
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles size={11} className="text-amber-400" /> Great job!
                    </div>
                    {isDemoModeActive() && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        <span>Demo Mode Active • Sandbox Session</span>
                      </div>
                    )}
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
                    <span className={`text-[11px] sm:text-xs font-mono font-bold ${isReplayMode ? 'text-purple-300/70' : 'text-emerald-400'}`}>
                      {completedCount}/{totalCount} Achieved
                    </span>
                  </div>

                  {/* 3 Section Goals with Checkmarks and XP values */}
                  <div className="flex flex-col gap-2">
                    {objectives.map((obj) => (
                      <div key={obj.id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {obj.completed ? (
                            <CheckCircle2 size={16} className={`${isReplayMode ? 'text-purple-400/60' : 'text-emerald-400'} shrink-0`} />
                          ) : (
                            <Circle size={16} className={`${isReplayMode ? 'text-purple-400/40' : 'text-gray-500'} shrink-0`} />
                          )}
                          <span className={`text-xs font-sans truncate ${
                              obj.completed
                                ? isReplayMode
                                  ? 'text-purple-200/80 font-medium'
                                  : 'text-gray-200 font-medium'
                                : 'text-gray-400'
                            }`}>
                            {obj.text}
                          </span>
                        </div>
                        <span className={`text-xs font-mono font-bold shrink-0 whitespace-nowrap ${
                            obj.completed
                              ? isReplayMode
                                ? 'text-purple-300/80'
                                : 'text-emerald-400'
                              : 'text-gray-500'
                          }`}>
                          {obj.completed ? (isReplayMode ? 'Claimed' : `+${XP_REWARDS.CAMPAIGN_GOAL} XP`) : '+0 XP'}
                        </span>
                      </div>
                    ))}

                    {/* Section Clear Bonus Item */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Zap size={16} className={`${isReplayMode ? 'text-purple-400/60' : 'text-amber-400'} shrink-0`} />
                        <span className={`text-xs font-sans truncate ${isReplayMode ? 'text-purple-200/50 font-normal line-through' : 'text-gray-200 font-medium'
                          }`}>
                          Section Clear Bonus
                        </span>
                      </div>
                      <span className={`text-xs font-mono font-bold shrink-0 whitespace-nowrap ${isReplayMode ? 'text-purple-400/60 line-through' : 'text-amber-400'
                        }`}>
                        +{XP_REWARDS.SECTION_COMPLETION_BONUS} XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dedicated Tab for Mission Gears Reward (Final Section) */}
                {currentSection === currentMissionSections.length - 1 && (
                  <div className={`rounded-2xl p-3.5 flex items-center justify-between transition-all ${
                    isDemoModeActive()
                      ? 'bg-gradient-to-r from-cyan-950/40 via-cyan-900/20 to-cyan-950/40 border border-cyan-500/30 shadow-[0_0_16px_rgba(6,182,212,0.15)]'
                      : isReplayMode
                      ? 'bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-purple-950/40 border border-purple-500/25 opacity-80'
                      : 'bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-purple-950/60 border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                        isDemoModeActive()
                          ? 'bg-cyan-500/20 border border-cyan-400/30'
                          : 'bg-purple-500/20 border border-purple-400/30'
                      }`}>
                        <Settings size={16} className={isDemoModeActive() ? 'text-cyan-300' : isReplayMode ? 'text-purple-400/70' : 'text-purple-300'} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[11px] font-mono font-bold uppercase tracking-widest whitespace-nowrap ${
                          isDemoModeActive()
                            ? 'text-cyan-300'
                            : isReplayMode
                            ? 'text-purple-300/70 line-through'
                            : 'text-purple-300'
                          }`}>
                          Mission Gear Reward
                        </span>
                        <span className="text-xs text-gray-400 font-sans whitespace-nowrap">
                          {isDemoModeActive() ? 'Demo Mode (Unsaved)' : isReplayMode ? 'Already Claimed' : 'Campaign Bonus'}
                        </span>
                      </div>
                    </div>
                    <div className={`text-xl sm:text-2xl font-display font-black tracking-tight flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                      isDemoModeActive()
                        ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.35)]'
                        : isReplayMode
                        ? 'text-purple-300/70 line-through'
                        : 'text-purple-300 drop-shadow-[0_0_12px_rgba(192,132,252,0.6)]'
                      }`}>
                      <span>{isDemoModeActive() ? '+0 Gears (Demo)' : '+20 Gears'}</span>
                    </div>
                  </div>
                )}

                {/* Glowing Large Total XP Display */}
                <div className={`border rounded-2xl p-4 flex items-center justify-between transition-all ${isReplayMode
                    ? 'bg-gradient-to-r from-purple-950/40 via-purple-900/25 to-purple-950/40 border-purple-500/30 shadow-[0_0_16px_rgba(168,85,247,0.1)]'
                    : 'bg-gradient-to-r from-emerald-950/60 via-emerald-900/40 to-emerald-950/60 border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.2)]'
                  }`}>
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[11px] font-mono font-bold uppercase tracking-widest whitespace-nowrap ${isReplayMode ? 'text-purple-300/70' : 'text-emerald-400'
                      }`}>
                      Total Earned XP
                    </span>
                    <span className="text-xs text-gray-400 font-sans whitespace-nowrap">
                      {isDemoModeActive() ? 'Demo Mode (Unsaved)' : isReplayMode ? 'Replay Completion' : 'Progression Reward'}
                    </span>
                  </div>

                  <div className={`text-2xl sm:text-3xl font-display font-black tracking-tight flex items-center gap-1.5 whitespace-nowrap ${
                    isDemoModeActive()
                      ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.35)]'
                      : isReplayMode
                      ? 'text-purple-300/80 drop-shadow-[0_0_10px_rgba(192,132,252,0.35)]'
                      : 'text-emerald-400 drop-shadow-[0_0_16px_rgba(52,211,153,0.7)] animate-pulse'
                  }`}>
                    <Zap size={22} className={`shrink-0 ${
                      isDemoModeActive()
                        ? 'fill-cyan-400 text-cyan-400'
                        : isReplayMode
                        ? 'fill-purple-300/70 text-purple-300/70'
                        : 'fill-emerald-400 text-emerald-400'
                    }`} />
                    <span>{isDemoModeActive() ? '+0 XP (Demo)' : `+${currentSectionXp} XP`}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Code Explanation & Next Actions */}
              <div className="flex flex-col gap-3.5 justify-between">
                {/* Code Explanation & Syntax Viewer */}
                <div className="bg-black/60 rounded-2xl border border-white/10 p-3.5 sm:p-4 flex flex-col gap-2.5 h-full min-h-[190px] shadow-inner">
                  {/* Top Bar with Tabs and Language Tag */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setCompletionTab('code')}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                          completionTab === 'code'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        Code Sequence
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompletionTab('syntax')}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                          completionTab === 'syntax'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <span>Syntax Used</span>
                        {syntaxExplanations.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-400/25 text-amber-300 text-[10px] font-mono">
                            {syntaxExplanations.length}
                          </span>
                        )}
                      </button>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold border ${
                      isSaturnLevel1 || isSaturnLevel2 || isSaturnLevel3
                        ? 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
                        : isEarthLevel1 || isEarthLevel2
                        ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                        : isJupiterLevel1 || isJupiterLevel2 || isJupiterLevel3
                        ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                        : isMercuryLevel3
                        ? 'text-orange-400 bg-orange-400/10 border-orange-400/20'
                        : isMercuryLevel1 || isMercuryLevel2
                        ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                        : isVenusLevel1 || isVenusLevel2 || isVenusLevel3
                        ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                        : isMarsLevel1 || isMarsLevel2 || isMarsLevel3
                        ? 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20'
                        : 'text-[#ff912d] bg-[#ff912d]/10 border-[#ff912d]/20'
                    }`}>
                      {isSaturnLevel1 || isSaturnLevel2 || isSaturnLevel3 ? 'C++' : isEarthLevel1 || isEarthLevel2 ? 'Python' : isJupiterLevel1 || isJupiterLevel2 || isJupiterLevel3 ? 'Java' : isMercuryLevel3 ? 'Full-Stack' : isMercuryLevel1 || isMercuryLevel2 ? 'JavaScript' : isVenusLevel3 ? (venus3ActiveTab === 'main' ? 'HTML' : 'CSS') : isVenusLevel1 || isVenusLevel2 ? 'CSS' : isMarsLevel1 || isMarsLevel2 || isMarsLevel3 ? 'HTML' : 'Logic'}
                    </span>
                  </div>

                  {/* Body: Either Code View or Syntax Explanations List */}
                  {completionTab === 'code' ? (
                    <div className="flex flex-col gap-2 flex-1 min-h-0">
                      <div className={`overflow-auto max-h-[145px] font-mono text-xs leading-relaxed pr-1 rounded-lg bg-black/40 p-2.5 border border-white/5 ${
                        isSaturnLevel1 || isSaturnLevel2 || isSaturnLevel3 ? 'text-cyan-300' : isEarthLevel1 || isEarthLevel2 ? 'text-emerald-300' : isJupiterLevel1 || isJupiterLevel2 || isJupiterLevel3 ? 'text-amber-300' : isMercuryLevel3 ? 'text-orange-300' : isMercuryLevel1 || isMercuryLevel2 ? 'text-yellow-300' : isVenusLevel1 || isVenusLevel2 || isVenusLevel3 ? 'text-cyan-300' : isMarsLevel1 || isMarsLevel2 || isMarsLevel3 ? 'text-sky-300' : 'text-[#ff912d]'
                      }`}>
                        <div className="space-y-0.5">
                          {completionModalCode.split('\n').map((line, idx) => {
                            const trimmed = line.trim();
                            const isClickable = trimmed && trimmed !== '{' && trimmed !== '}' && !trimmed.startsWith('//');
                            const isSelected = selectedCompletionLine === trimmed;
                            return (
                              <div
                                key={idx}
                                onClick={() => {
                                  if (isClickable) {
                                    setSelectedCompletionLine(prev => prev === trimmed ? null : trimmed);
                                  }
                                }}
                                className={`flex items-start gap-2.5 px-2 py-0.5 rounded transition-all ${
                                  isSelected
                                    ? 'bg-amber-500/25 text-amber-200 border-l-2 border-amber-400 shadow-sm'
                                    : isClickable
                                    ? 'hover:bg-white/5 text-gray-200 cursor-pointer'
                                    : 'text-gray-400 cursor-default'
                                }`}
                              >
                                <span className="text-[10px] text-gray-500 select-none w-5 text-right shrink-0 pt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="whitespace-pre flex-1">
                                  {line}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Line Syntax Inspector Pill / Card */}
                      {selectedCompletionLine ? (() => {
                        const isHtml = isMarsLevel1 || isMarsLevel2 || isMarsLevel3 || (isVenusLevel3 && venus3ActiveTab === 'main') || (isMercuryLevel3 && mercury3ActiveTab === 'html');
                        const isCss = isVenusLevel1 || isVenusLevel2 || (isVenusLevel3 && venus3ActiveTab !== 'main') || (isMercuryLevel3 && mercury3ActiveTab === 'css');
                        const exp = getSyntaxExplanation(selectedCompletionLine, isHtml, isCss);
                        return (
                          <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col gap-1 text-xs animate-in fade-in slide-in-from-bottom-1 duration-150">
                            <div className="flex items-center justify-between">
                              <span className="font-display font-bold text-amber-300 flex items-center gap-1.5">
                                <Sparkles size={13} className="text-amber-400" />
                                {exp.title}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {exp.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-300 font-sans leading-normal">
                              {exp.description}
                            </p>
                            {exp.functionPurpose && (
                              <p className="text-[10px] text-gray-400 font-mono italic">
                                ↳ {exp.functionPurpose}
                              </p>
                            )}
                          </div>
                        );
                      })() : (
                        <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1.5 px-1 py-0.5">
                          <HelpCircle size={12} className="text-gray-400 shrink-0" />
                          <span>Click any line above to inspect its syntax or switch to "Syntax Used"</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Syntax Used Explanations List */
                    <div className="overflow-auto max-h-[190px] pr-1 space-y-2 custom-syntax-scroll">
                      {syntaxExplanations.length > 0 ? (
                        syntaxExplanations.map(({ exp }, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1 hover:border-amber-500/30 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-display font-bold text-xs text-amber-300 flex items-center gap-1.5">
                                <Code2 size={13} className="text-amber-400" />
                                {exp.title}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-gray-400 border border-white/10">
                                {exp.category}
                              </span>
                            </div>
                            <code className="text-[10px] font-mono text-emerald-300 bg-black/60 px-1.5 py-0.5 rounded border border-white/5 w-fit">
                              {exp.tagOrCommand}
                            </code>
                            <p className="text-[11px] text-gray-300 font-sans leading-normal mt-0.5">
                              {exp.description}
                            </p>
                            {exp.functionPurpose && (
                              <p className="text-[10px] text-gray-400 font-mono italic">
                                ↳ {exp.functionPurpose}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-gray-400 font-mono">
                          No syntax elements detected.
                        </div>
                      )}
                    </div>
                  )}
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
                        const returnPath = isDaily ? '/dashboard' : `/modules/${getMissionPlanetSlug(missionId, isDaily)}`;
                        router.push(returnPath);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#ff912d] to-amber-500 hover:from-amber-500 hover:to-[#ff912d] text-black font-sans font-black py-3.5 px-5 rounded-xl shadow-lg shadow-[#ff912d]/20 active:scale-95 transition-all cursor-pointer text-xs uppercase tracking-wider"
                    >
                      Continue <ChevronRight size={16} />
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
                  const returnPath = isDaily ? '/dashboard' : `/modules/${getMissionPlanetSlug(missionId, isDaily)}`;
                  requestNavigation(returnPath);
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

      {/* Mars NPC Mark Dialogue Popup */}
      <MarkDialogueModal
        isOpen={markDialogue.isOpen}
        title={markDialogue.title}
        message={markDialogue.message}
        onClose={() => setMarkDialogue(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
