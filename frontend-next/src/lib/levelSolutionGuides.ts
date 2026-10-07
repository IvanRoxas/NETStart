/**
 * levelSolutionGuides.ts
 * Clean, structured solution definitions for NETStart levels.
 * Split into:
 * 1. Required Blocks (block visuals + concise 1-sentence purpose)
 * 2. Workspace Arrangement (visual stack assembly + customizable slot indicators)
 */

export type BlockCategory = 'event' | 'movement' | 'control' | 'sensor' | 'variable' | 'custom' | 'code';

export interface PuzzleBlockSpec {
  name: string;
  category: BlockCategory;
  color?: string;
  summary: string;
  isCustomizable?: boolean;
  customizableHint?: string;
}

export interface WorkspaceAssemblyNode {
  blockName: string;
  category: BlockCategory;
  indent: number; // 0 = root, 1 = nested in loop/if, 2 = double nested
  notes?: string;
  isCustomizable?: boolean;
  customizableChoice?: string;
}

export interface LevelSectionSolution {
  sectionIndex: number;
  title: string;
  subtitle?: string;
  requiredBlocks: PuzzleBlockSpec[];
  assembly: WorkspaceAssemblyNode[];
  summaryNote?: string;
}

export interface LevelSolutionGuide {
  missionId: string;
  title: string;
  planetName: string;
  categoryTag: string;
  sections: LevelSectionSolution[];
}

export const CATEGORY_COLORS: Record<BlockCategory, { bg: string; border: string; text: string }> = {
  event: { bg: '#dc2626', border: '#f87171', text: '#ffffff' }, // Red for Start / End
  movement: { bg: '#2563eb', border: '#60a5fa', text: '#ffffff' }, // Blue for Rover Motion
  control: { bg: '#7c3aed', border: '#a78bfa', text: '#ffffff' }, // Purple for Loops / Conditionals
  sensor: { bg: '#059669', border: '#34d399', text: '#ffffff' }, // Emerald for Scanners / Checks
  variable: { bg: '#ea580c', border: '#fb923c', text: '#ffffff' }, // Orange for Variables & Data
  custom: { bg: '#0891b2', border: '#22d3ee', text: '#ffffff' }, // Cyan for Web & Custom UI
  code: { bg: '#4f46e5', border: '#818cf8', text: '#ffffff' }, // Indigo for Functions & Classes
};

export const LEVEL_SOLUTION_GUIDES: Record<string, LevelSolutionGuide> = {
  // =========================================================================
  // THE MOON (BASICS)
  // =========================================================================
  "moon-1": {
    missionId: "moon-1",
    title: "Level 1: Stellar Beginnings",
    planetName: "The Moon",
    categoryTag: "Basic Syntax",
    sections: [
      {
        sectionIndex: 0,
        title: "Section 1: Straight Corridor",
        requiredBlocks: [
          { name: "Start", category: "event", summary: "Required entry point for your program." },
          { name: "Move Forward", category: "movement", summary: "Moves the rover 1 tile ahead." },
          { name: "Turn Right", category: "movement", summary: "Rotates the rover 90 degrees clockwise." },
          { name: "End", category: "event", summary: "Safely terminates execution." }
        ],
        assembly: [
          { blockName: "Start", category: "event", indent: 0 },
          { blockName: "Move Forward", category: "movement", indent: 0, notes: "1st step" },
          { blockName: "Move Forward", category: "movement", indent: 0, notes: "2nd step" },
          { blockName: "Move Forward", category: "movement", indent: 0, notes: "3rd step to corner" },
          { blockName: "Turn Right", category: "movement", indent: 0, notes: "Face South" },
          { blockName: "Move Forward", category: "movement", indent: 0, notes: "1st step down" },
          { blockName: "Move Forward", category: "movement", indent: 0, notes: "Reach goal beacon" },
          { blockName: "End", category: "event", indent: 0 }
        ]
      },
      {
        sectionIndex: 1,
        title: "Section 2: Stepped Ridge",
        requiredBlocks: [
          { name: "Start", category: "event", summary: "Required entry point." },
          { name: "Move Forward", category: "movement", summary: "Advances 1 tile forward." },
          { name: "Turn Right", category: "movement", summary: "Rotates right to descend." },
          { name: "Turn Left", category: "movement", summary: "Rotates left to re-align East." },
          { name: "End", category: "event", summary: "Closes the program." }
        ],
        assembly: [
          { blockName: "Start", category: "event", indent: 0 },
          { blockName: "Move Forward", category: "movement", indent: 0 },
          { blockName: "Move Forward", category: "movement", indent: 0 },
          { blockName: "Turn Right", category: "movement", indent: 0 },
          { blockName: "Move Forward", category: "movement", indent: 0 },
          { blockName: "Move Forward", category: "movement", indent: 0 },
          { blockName: "Turn Left", category: "movement", indent: 0 },
          { blockName: "Move Forward", category: "movement", indent: 0 },
          { blockName: "Move Forward", category: "movement", indent: 0, notes: "Reach goal" },
          { blockName: "End", category: "event", indent: 0 }
        ]
      },
      {
        sectionIndex: 2,
        title: "Section 3: Switchback Trail",
        requiredBlocks: [
          { name: "Start", category: "event", summary: "Required entry point." },
          { name: "Move Forward", category: "movement", summary: "Advances along the crater path." },
          { name: "Turn Right / Left", category: "movement", summary: "Navigates the canyon switchbacks." },
          { name: "End", category: "event", summary: "Closes the program." }
        ],
        assembly: [
          { blockName: "Start", category: "event", indent: 0 },
          { blockName: "Move Forward", category: "movement", indent: 0 },
          { blockName: "Turn Right", category: "movement", indent: 0 },
          { blockName: "Move Forward (x2)", category: "movement", indent: 0 },
          { blockName: "Turn Left", category: "movement", indent: 0 },
          { blockName: "Move Forward (x2)", category: "movement", indent: 0 },
          { blockName: "Turn Right", category: "movement", indent: 0 },
          { blockName: "Move Forward", category: "movement", indent: 0, notes: "Reach goal" },
          { blockName: "End", category: "event", indent: 0 }
        ]
      }
    ]
  },

  "moon-2": {
    missionId: "moon-2",
    title: "Level 2: Resource Classification",
    planetName: "The Moon",
    categoryTag: "Loops & Logic",
    sections: [
      {
        sectionIndex: 0,
        title: "Section 1: Cargo Packing Loop",
        requiredBlocks: [
          { name: "Start", category: "event", summary: "Begins program." },
          { name: "Repeat (10) times", category: "control", summary: "Repeats inner actions for all 10 cargo crates." },
          { name: "Scan Current Item", category: "sensor", summary: "Reads the conveyor belt item under the arm." },
          { name: "Pack Cargo", category: "movement", summary: "Transfers the scanned crate into the cargo bay." },
          { name: "End", category: "event", summary: "Finalizes execution." }
        ],
        assembly: [
          { blockName: "Start", category: "event", indent: 0 },
          { blockName: "Repeat (10) times", category: "control", indent: 0 },
          { blockName: "Scan Current Item", category: "sensor", indent: 1 },
          { blockName: "Pack Cargo", category: "movement", indent: 1 },
          { blockName: "End", category: "event", indent: 0 }
        ]
      },
      {
        sectionIndex: 1,
        title: "Section 2: Cargo vs. Trash",
        requiredBlocks: [
          { name: "Start", category: "event", summary: "Begins program." },
          { name: "Repeat (15) times", category: "control", summary: "Loops through all 15 conveyor items." },
          { name: "Scan Current Item", category: "sensor", summary: "Inspects incoming item." },
          { name: "If [Item is Cargo] / Else", category: "control", summary: "Routes item based on detected type." },
          { name: "Pack Cargo", category: "movement", summary: "Packs cargo when condition matches." },
          { name: "Discard Space Junk", category: "movement", summary: "Discards junk into the incinerator." },
          { name: "End", category: "event", summary: "Finalizes execution." }
        ],
        assembly: [
          { blockName: "Start", category: "event", indent: 0 },
          { blockName: "Repeat (15) times", category: "control", indent: 0 },
          { blockName: "Scan Current Item", category: "sensor", indent: 1 },
          { blockName: "If [Item is Cargo]", category: "control", indent: 1 },
          { blockName: "Pack Cargo", category: "movement", indent: 2 },
          { blockName: "Else", category: "control", indent: 1 },
          { blockName: "Discard Space Junk", category: "movement", indent: 2 },
          { blockName: "End", category: "event", indent: 0 }
        ]
      },
      {
        sectionIndex: 2,
        title: "Section 3: Tri-Classifier (Fuel, Cargo, Junk)",
        requiredBlocks: [
          { name: "Start", category: "event", summary: "Begins program." },
          { name: "Repeat (20) times", category: "control", summary: "Loops through all 20 items." },
          { name: "Scan Current Item", category: "sensor", summary: "Reads item type." },
          { name: "If [Fuel] / Else If [Cargo] / Else", category: "control", summary: "Three-way classification logic." },
          { name: "Route to Fuel Tank", category: "movement", summary: "Loads fuel containers." },
          { name: "Pack Cargo", category: "movement", summary: "Packs regular cargo." },
          { name: "Discard Space Junk", category: "movement", summary: "Discards waste." },
          { name: "End", category: "event", summary: "Finalizes execution." }
        ],
        assembly: [
          { blockName: "Start", category: "event", indent: 0 },
          { blockName: "Repeat (20) times", category: "control", indent: 0 },
          { blockName: "Scan Current Item", category: "sensor", indent: 1 },
          { blockName: "If [Item is Fuel]", category: "control", indent: 1 },
          { blockName: "Route to Fuel Tank", category: "movement", indent: 2 },
          { blockName: "Else If [Item is Cargo]", category: "control", indent: 1 },
          { blockName: "Pack Cargo", category: "movement", indent: 2 },
          { blockName: "Else", category: "control", indent: 1 },
          { blockName: "Discard Space Junk", category: "movement", indent: 2 },
          { blockName: "End", category: "event", indent: 0 }
        ]
      }
    ]
  },

  "moon-3": {
    missionId: "moon-3",
    title: "Level 3: The Starship Protocol",
    planetName: "The Moon",
    categoryTag: "Conditionals & Events",
    sections: [
      {
        sectionIndex: 0,
        title: "Section 1: Air Vent Cross",
        requiredBlocks: [
          { name: "Start", category: "event", summary: "Begins program." },
          { name: "Move Forward", category: "movement", summary: "Directs airflow along open vents." },
          { name: "Turn Left / Right", category: "movement", summary: "Navigates around broken fans at (3,3) & (4,5)." },
          { name: "End", category: "event", summary: "Reaches Cabin Goal at (6,3)." }
        ],
        assembly: [
          { blockName: "Start", category: "event", indent: 0 },
          { blockName: "Move Forward (x2)", category: "movement", indent: 0 },
          { blockName: "Turn Left", category: "movement", indent: 0, notes: "Bypass fan at (3,3)" },
          { blockName: "Move Forward (x3)", category: "movement", indent: 0 },
          { blockName: "Turn Right", category: "movement", indent: 0 },
          { blockName: "Move Forward (x4)", category: "movement", indent: 0 },
          { blockName: "Turn Right", category: "movement", indent: 0 },
          { blockName: "Move Forward", category: "movement", indent: 0, notes: "Reach Cabin Goal" },
          { blockName: "End", category: "event", indent: 0 }
        ]
      },
      {
        sectionIndex: 1,
        title: "Section 2: Fuel Synthesis",
        requiredBlocks: [
          { name: "Add Solution", category: "sensor", summary: "Pours chemical reagent." },
          { name: "Increase Heat", category: "movement", summary: "Raises temperature." },
          { name: "Repeat (5) times [Mix Solution]", category: "control", summary: "Mixes solution 5 times." },
          { name: "If [Fuel is Blue]", category: "control", summary: "Refinement check to turn blue fuel orange." },
          { name: "Put into Fuel Tank", category: "movement", summary: "Stores refined propellant." }
        ],
        assembly: [
          { blockName: "Add Solution", category: "sensor", indent: 0 },
          { blockName: "Increase Heat", category: "movement", indent: 0 },
          { blockName: "Repeat (5) times", category: "control", indent: 0 },
          { blockName: "Mix Solution", category: "sensor", indent: 1 },
          { blockName: "If [Fuel is Blue]", category: "control", indent: 0 },
          { blockName: "Increase Heat", category: "movement", indent: 1 },
          { blockName: "Mix Solution", category: "sensor", indent: 1 },
          { blockName: "Put into Fuel Tank", category: "movement", indent: 0, notes: "Repeat for 3 batches" }
        ]
      },
      {
        sectionIndex: 2,
        title: "Section 3: Flight Simulation",
        requiredBlocks: [
          { name: "Case [Small Asteroid]", category: "control", summary: "Triggers defense for small debris." },
          { name: "Fire Lasers", category: "movement", summary: "Destroys small asteroid." },
          { name: "Case [Large Asteroid]", category: "control", summary: "Engages heavy defense." },
          { name: "Shield Up", category: "movement", summary: "Blocks heavy impact." },
          { name: "Case [Friendly UFO]", category: "control", summary: "Encounters friendly visitor." },
          { name: "Greet UFO", category: "movement", summary: "Transmits friendly signal." }
        ],
        assembly: [
          { blockName: "Case [Small Asteroid]", category: "control", indent: 0 },
          { blockName: "Fire Lasers", category: "movement", indent: 1 },
          { blockName: "Case [Large Asteroid]", category: "control", indent: 0 },
          { blockName: "Shield Up", category: "movement", indent: 1 },
          { blockName: "Case [Friendly UFO]", category: "control", indent: 0 },
          { blockName: "Greet UFO", category: "movement", indent: 1 }
        ]
      }
    ]
  },

  // =========================================================================
  // MARS (HTML)
  // =========================================================================
  "mars-1": {
    missionId: "mars-1",
    title: "Level 1: The Blank Billboard",
    planetName: "Mars",
    categoryTag: "HTML Structure",
    sections: [
      {
        sectionIndex: 0,
        title: "Billboard Assembly",
        requiredBlocks: [
          { name: "Billboard Container", category: "custom", summary: "Root element for billboard structure." },
          {
            name: "Billboard Title (h1)",
            category: "custom",
            summary: "Primary headline for colony promotion.",
            isCustomizable: true,
            customizableHint: "Choose any theme (Tourism, Mining, Research) and title text you like."
          },
          {
            name: "Billboard Subtitle (h2)",
            category: "custom",
            summary: "Supporting subtitle.",
            isCustomizable: true,
            customizableHint: "Write any subtitle that matches your theme."
          },
          {
            name: "Billboard Text (p)",
            category: "custom",
            summary: "Descriptive body copy.",
            isCustomizable: true,
            customizableHint: "Write your custom colony advertisement."
          },
          {
            name: "Creative Style Modifiers",
            category: "custom",
            summary: "Colors, borders, and typography.",
            isCustomizable: true,
            customizableHint: "Pick any font colors or glowing border styling for Director Mark's 5-star review."
          }
        ],
        assembly: [
          { blockName: "Billboard Container", category: "custom", indent: 0 },
          {
            blockName: "Billboard Title (h1)",
            category: "custom",
            indent: 1,
            isCustomizable: true,
            customizableChoice: "✨ [Your Custom Title / Theme]"
          },
          {
            blockName: "Billboard Subtitle (h2)",
            category: "custom",
            indent: 1,
            isCustomizable: true,
            customizableChoice: "✨ [Your Custom Subtitle]"
          },
          {
            blockName: "Billboard Text (p)",
            category: "custom",
            indent: 1,
            isCustomizable: true,
            customizableChoice: "✨ [Your Custom Message Paragraph]"
          },
          {
            blockName: "Style Modifier (Color / Border)",
            category: "custom",
            indent: 1,
            isCustomizable: true,
            customizableChoice: "✨ [Your Color & Border Choices]"
          }
        ]
      }
    ]
  },

  "mars-2": {
    missionId: "mars-2",
    title: "Level 2: Picture Perfect",
    planetName: "Mars",
    categoryTag: "HTML Images & Captions",
    sections: [
      {
        sectionIndex: 0,
        title: "Image Linking & Captions",
        requiredBlocks: [
          { name: "Image: rover.jpg", category: "custom", summary: "Required image for Screen 1 (Mars Rover)." },
          { name: "Image: dome.jpg", category: "custom", summary: "Required image for Screen 2 (Dome Habitat)." },
          { name: "Image: solar.jpg", category: "custom", summary: "Required image for Screen 3 (Solar Array)." },
          { name: "Image: satellite.jpg", category: "custom", summary: "Required image for Screen 4 (Satellite Relay)." },
          {
            name: "Caption (figcaption)",
            category: "custom",
            summary: "Text caption explaining the image.",
            isCustomizable: true,
            customizableHint: "Write any description you like on at least 2 billboards."
          }
        ],
        assembly: [
          { blockName: "Screen 1 Container", category: "custom", indent: 0 },
          { blockName: "Image [src: rover.jpg]", category: "custom", indent: 1 },
          { blockName: "Screen 2 Container", category: "custom", indent: 0 },
          { blockName: "Image [src: dome.jpg]", category: "custom", indent: 1 },
          {
            blockName: "Caption (figcaption)",
            category: "custom",
            indent: 1,
            isCustomizable: true,
            customizableChoice: "✨ [Your Custom Caption Text]"
          },
          { blockName: "Screen 3 Container", category: "custom", indent: 0 },
          { blockName: "Image [src: solar.jpg]", category: "custom", indent: 1 },
          { blockName: "Screen 4 Container", category: "custom", indent: 0 },
          { blockName: "Image [src: satellite.jpg]", category: "custom", indent: 1 },
          {
            blockName: "Caption (figcaption)",
            category: "custom",
            indent: 1,
            isCustomizable: true,
            customizableChoice: "✨ [Your Custom Caption Text]"
          }
        ]
      }
    ]
  },

  "mars-3": {
    missionId: "mars-3",
    title: "Level 3: The Big Space Message",
    planetName: "Mars",
    categoryTag: "HTML Forms",
    sections: [
      {
        sectionIndex: 0,
        title: "Transmission Form",
        requiredBlocks: [
          { name: "<form>", category: "custom", summary: "Form container for input fields." },
          {
            name: "<label> + <input type='text'>",
            category: "custom",
            summary: "Text input for caller name.",
            isCustomizable: true,
            customizableHint: "Enter any caller name or callsign you prefer."
          },
          {
            name: "<textarea>",
            category: "custom",
            summary: "Multi-line text input for message body.",
            isCustomizable: true,
            customizableHint: "Write any greeting to space neighbors."
          },
          { name: "<button type='submit'>", category: "custom", summary: "Transmits signal to Mercury & Venus." }
        ],
        assembly: [
          { blockName: "<form>", category: "custom", indent: 0 },
          {
            blockName: "<label> Sender Name:",
            category: "custom",
            indent: 1
          },
          {
            blockName: "<input type='text'>",
            category: "custom",
            indent: 1,
            isCustomizable: true,
            customizableChoice: "✨ [Your Explorer Callsign]"
          },
          {
            blockName: "<textarea> Message:",
            category: "custom",
            indent: 1,
            isCustomizable: true,
            customizableChoice: "✨ [Your Custom Message]"
          },
          { blockName: "<button type='submit'> Broadcast Message", category: "custom", indent: 1 }
        ]
      }
    ]
  },

  // =========================================================================
  // VENUS (CSS)
  // =========================================================================
  "venus-1": {
    missionId: "venus-1",
    title: "Level 1: Color It In",
    planetName: "Venus",
    categoryTag: "CSS Styling",
    sections: [
      {
        sectionIndex: 0,
        title: "Lab Furniture & Styling",
        requiredBlocks: [
          {
            name: "Spawn Item (x3)",
            category: "custom",
            summary: "Adds apparatus to the room.",
            isCustomizable: true,
            customizableHint: "Pick ANY 3 lab furniture/items you like."
          },
          {
            name: "color / background-color",
            category: "custom",
            summary: "Applies CSS colors.",
            isCustomizable: true,
            customizableHint: "Choose any colors you like."
          },
          {
            name: "border / border-radius",
            category: "custom",
            summary: "Rounds borders on equipment.",
            isCustomizable: true,
            customizableHint: "Choose any border width or color."
          },
          { name: "style #caption banner", category: "custom", summary: "Styles the header banner." }
        ],
        assembly: [
          {
            blockName: "Spawn Item [Lab Equipment 1]",
            category: "custom",
            indent: 0,
            isCustomizable: true,
            customizableChoice: "✨ [Any Furniture Item]"
          },
          {
            blockName: "Style: background-color & color",
            category: "custom",
            indent: 1,
            isCustomizable: true,
            customizableChoice: "✨ [Your Favorite Colors]"
          },
          {
            blockName: "Spawn Item [Lab Equipment 2]",
            category: "custom",
            indent: 0,
            isCustomizable: true,
            customizableChoice: "✨ [Any Furniture Item]"
          },
          {
            blockName: "Style: border & border-radius",
            category: "custom",
            indent: 1,
            isCustomizable: true,
            customizableChoice: "✨ [Your Border Styles]"
          },
          {
            blockName: "Spawn Item [Lab Equipment 3]",
            category: "custom",
            indent: 0,
            isCustomizable: true,
            customizableChoice: "✨ [Any Furniture Item]"
          },
          { blockName: "Style #caption banner", category: "custom", indent: 0 }
        ]
      }
    ]
  },

  "venus-2": {
    missionId: "venus-2",
    title: "Level 2: Formatting the Prototype",
    planetName: "Venus",
    categoryTag: "Flexbox Layout",
    sections: [
      {
        sectionIndex: 0,
        title: "Align 5 Prototype Panels",
        requiredBlocks: [
          { name: "Target Screen [1..5]", category: "custom", summary: "Selects active prototype screen." },
          { name: "display: flex", category: "custom", summary: "Activates flexible box layout." },
          { name: "justify-content", category: "custom", summary: "Aligns sensors horizontally (center/space-between)." },
          { name: "align-items: center", category: "custom", summary: "Aligns sensors vertically." },
          { name: "gap: 16px", category: "custom", summary: "Sets spacing between sensors." }
        ],
        assembly: [
          { blockName: "Target Screen [1]", category: "custom", indent: 0 },
          { blockName: "display: flex", category: "custom", indent: 1 },
          { blockName: "justify-content: center", category: "custom", indent: 1 },
          { blockName: "align-items: center", category: "custom", indent: 1 },
          { blockName: "gap: 16px", category: "custom", indent: 1 },
          { blockName: "Target Screen [2..5]", category: "custom", indent: 0, notes: "Repeat calibration for all 5 screens" }
        ]
      }
    ]
  },

  "venus-3": {
    missionId: "venus-3",
    title: "Level 3: Restoring the Dead Zones",
    planetName: "Venus",
    categoryTag: "CSS Linking",
    sections: [
      {
        sectionIndex: 0,
        title: "Link 3 External Stylesheets",
        requiredBlocks: [
          { name: "<link rel='stylesheet'>", category: "custom", summary: "Links alpha.css, beta.css, gamma.css in HTML head." },
          { name: ".sector-alpha styling", category: "custom", summary: "Styles skies in alpha.css tab." },
          { name: ".sector-beta styling", category: "custom", summary: "Styles cavern in beta.css tab." },
          { name: ".sector-gamma styling", category: "custom", summary: "Styles desert in gamma.css tab." }
        ],
        assembly: [
          { blockName: "HTML Tab: <head>", category: "custom", indent: 0 },
          { blockName: "<link rel='stylesheet' href='alpha.css'>", category: "custom", indent: 1 },
          { blockName: "<link rel='stylesheet' href='beta.css'>", category: "custom", indent: 1 },
          { blockName: "<link rel='stylesheet' href='gamma.css'>", category: "custom", indent: 1 },
          { blockName: "alpha.css Tab: .sector-alpha { ... }", category: "custom", indent: 0 },
          { blockName: "beta.css Tab: .sector-beta { ... }", category: "custom", indent: 0 },
          { blockName: "gamma.css Tab: .sector-gamma { ... }", category: "custom", indent: 0 }
        ]
      }
    ]
  },

  // =========================================================================
  // MERCURY (JAVASCRIPT)
  // =========================================================================
  "mercury-1": {
    missionId: "mercury-1",
    title: "Level 1: Saving the Biodome",
    planetName: "Mercury",
    categoryTag: "DOM Manipulation",
    sections: [
      {
        sectionIndex: 0,
        title: "Biodome Life Support",
        requiredBlocks: [
          { name: "document.querySelector('#cooler')", category: "code", summary: "Targets greenhouse cooler element." },
          { name: "cooler.style.display = 'block'", category: "code", summary: "Activates cooling system." },
          { name: "document.querySelector('.sprinkler')", category: "code", summary: "Targets irrigation sprinklers." },
          { name: "fertilize(shrub) & water(flower)", category: "code", summary: "Waters flora & revives Star Flower." }
        ],
        assembly: [
          { blockName: "let cooler = document.querySelector('#cooler')", category: "code", indent: 0 },
          { blockName: "cooler.style.display = 'block'", category: "code", indent: 0 },
          { blockName: "let sprinkler = document.querySelector('.sprinkler')", category: "code", indent: 0 },
          { blockName: "sprinkler.classList.add('active')", category: "code", indent: 0 },
          { blockName: "fertilizeStarFlower()", category: "code", indent: 0 }
        ]
      }
    ]
  },

  "mercury-2": {
    missionId: "mercury-2",
    title: "Level 2: The Conveyor Belt",
    planetName: "Mercury",
    categoryTag: "Functions & Events",
    sections: [
      {
        sectionIndex: 0,
        title: "Intelligent Crate Router",
        requiredBlocks: [
          { name: "let crate = scanCrate()", category: "variable", summary: "Saves scanned crate type into a variable." },
          { name: "if (crate === 'Energy Core')", category: "control", summary: "Routes core crates to reactor." },
          { name: "else if (crate === 'Minerals')", category: "control", summary: "Routes mineral crates to smelter." },
          { name: "else", category: "control", summary: "Routes all other crates to warehouse." }
        ],
        assembly: [
          { blockName: "let crate = scanCrate()", category: "variable", indent: 0 },
          { blockName: "if (crate === 'Energy Core')", category: "control", indent: 0 },
          { blockName: "routeToReactor()", category: "movement", indent: 1 },
          { blockName: "else if (crate === 'Minerals')", category: "control", indent: 0 },
          { blockName: "routeToSmelter()", category: "movement", indent: 1 },
          { blockName: "else", category: "control", indent: 0 },
          { blockName: "routeToWarehouse()", category: "movement", indent: 1 }
        ]
      }
    ]
  },

  "mercury-3": {
    missionId: "mercury-3",
    title: "Level 3: The Missing Interface",
    planetName: "Mercury",
    categoryTag: "Fullstack Web",
    sections: [
      {
        sectionIndex: 0,
        title: "AstroLink Interface",
        requiredBlocks: [
          { name: "<button id='sendBtn'>", category: "custom", summary: "HTML button element." },
          { name: "#sendBtn:hover CSS", category: "custom", summary: "CSS hover glow effect." },
          { name: "sendBtn.addEventListener('click', ...)", category: "code", summary: "JS event listener triggering transmission." }
        ],
        assembly: [
          { blockName: "HTML Tab: <div class='screen'> + <button id='sendBtn'>", category: "custom", indent: 0 },
          { blockName: "CSS Tab: #sendBtn { background: #06b6d4; ... }", category: "custom", indent: 0 },
          { blockName: "JS Tab: let btn = document.querySelector('#sendBtn')", category: "code", indent: 0 },
          { blockName: "btn.addEventListener('click', () => { transmitSignal(); })", category: "code", indent: 1 }
        ]
      }
    ]
  },

  // =========================================================================
  // JUPITER (JAVA)
  // =========================================================================
  "jupiter-1": {
    missionId: "jupiter-1",
    title: "Level 1: Unlock the Gate",
    planetName: "Jupiter",
    categoryTag: "Java Variables",
    sections: [
      {
        sectionIndex: 0,
        title: "Blast Door Security Tokens",
        requiredBlocks: [
          { name: "String securityCode", category: "variable", summary: "Text token matching clipboard passkey." },
          { name: "int clearanceLevel = 5", category: "variable", summary: "Integer security clearance level." },
          { name: "boolean gateOverride = true", category: "variable", summary: "Boolean gate override flag." },
          { name: "unlockGates()", category: "code", summary: "Transmits verified tokens to blast doors." }
        ],
        assembly: [
          { blockName: "String securityCode = \"ORBIT-ALPHA\"", category: "variable", indent: 0 },
          { blockName: "int clearanceLevel = 5", category: "variable", indent: 0 },
          { blockName: "boolean gateOverride = true", category: "variable", indent: 0 },
          { blockName: "unlockGates(securityCode, clearanceLevel, gateOverride)", category: "code", indent: 0 }
        ]
      }
    ]
  },

  "jupiter-2": {
    missionId: "jupiter-2",
    title: "Level 2: Try and Catch This!",
    planetName: "Jupiter",
    categoryTag: "Try / Catch Waves",
    sections: [
      {
        sectionIndex: 0,
        title: "Wave 1: NullPointer & Arithmetic",
        requiredBlocks: [
          { name: "try { scanStream(); }", category: "control", summary: "Wraps scanner in protected execution block." },
          { name: "catch (NullPointerException e)", category: "control", summary: "Catches null pointer errors." },
          { name: "catch (ArithmeticException e)", category: "control", summary: "Catches division-by-zero errors." }
        ],
        assembly: [
          { blockName: "try", category: "control", indent: 0 },
          { blockName: "scanStream()", category: "sensor", indent: 1 },
          { blockName: "catch (NullPointerException e)", category: "control", indent: 0 },
          { blockName: "neutralizeThreat()", category: "movement", indent: 1 },
          { blockName: "catch (ArithmeticException e)", category: "control", indent: 0 },
          { blockName: "neutralizeThreat()", category: "movement", indent: 1 }
        ]
      },
      {
        sectionIndex: 1,
        title: "Wave 2: Format & Class Cast",
        requiredBlocks: [
          { name: "try { ... }", category: "control", summary: "Protects data intake stream." },
          { name: "catch (NumberFormatException e)", category: "control", summary: "Catches corrupt numbers." },
          { name: "catch (ClassCastException e)", category: "control", summary: "Catches mismatched objects." }
        ],
        assembly: [
          { blockName: "try", category: "control", indent: 0 },
          { blockName: "processPayload()", category: "sensor", indent: 1 },
          { blockName: "catch (NumberFormatException e)", category: "control", indent: 0 },
          { blockName: "catch (ClassCastException e)", category: "control", indent: 0 }
        ]
      },
      {
        sectionIndex: 2,
        title: "Wave 3: Boss Exception Stack",
        requiredBlocks: [
          { name: "try { ... }", category: "control", summary: "Protects core system." },
          { name: "catch (SpecificExceptions...)", category: "control", summary: "Catches specific errors." },
          { name: "catch (Exception e)", category: "control", summary: "Fallback catch for unexpected exceptions." }
        ],
        assembly: [
          { blockName: "try", category: "control", indent: 0 },
          { blockName: "scanServerCore()", category: "sensor", indent: 1 },
          { blockName: "catch (NullPointerException e)", category: "control", indent: 0 },
          { blockName: "catch (ArithmeticException e)", category: "control", indent: 0 },
          { blockName: "catch (NumberFormatException e)", category: "control", indent: 0 },
          { blockName: "catch (ClassCastException e)", category: "control", indent: 0 },
          { blockName: "catch (Exception e)", category: "control", indent: 0, notes: "Rescue Technician Io" }
        ]
      }
    ]
  },

  "jupiter-3": {
    missionId: "jupiter-3",
    title: "Level 3: The AI Core Lockdown",
    planetName: "Jupiter",
    categoryTag: "Classes & Objects",
    sections: [
      {
        sectionIndex: 0,
        title: "UserProfile Blueprint & Instance",
        requiredBlocks: [
          { name: "public class UserProfile", category: "code", summary: "Class blueprint." },
          { name: "private String badgeId & int accessLevel", category: "variable", summary: "Encapsulated private fields." },
          { name: "public UserProfile(String id, int level)", category: "code", summary: "Constructor." },
          { name: "new UserProfile(\"CHIEF-TECH-01\", 10)", category: "code", summary: "Instantiates passkey object." }
        ],
        assembly: [
          { blockName: "public class UserProfile {", category: "code", indent: 0 },
          { blockName: "private String badgeId;", category: "variable", indent: 1 },
          { blockName: "private int accessLevel;", category: "variable", indent: 1 },
          { blockName: "public UserProfile(String id, int level) { ... }", category: "code", indent: 1 },
          { blockName: "}", category: "code", indent: 0 },
          { blockName: "UserProfile user = new UserProfile(\"CHIEF-TECH-01\", 10);", category: "code", indent: 0 }
        ]
      }
    ]
  },

  // =========================================================================
  // SATURN (C++)
  // =========================================================================
  "saturn-1": {
    missionId: "saturn-1",
    title: "Level 1: Surprise Diagnostics",
    planetName: "Saturn",
    categoryTag: "C++ Streams",
    sections: [
      {
        sectionIndex: 0,
        title: "CIN and COUT Pipeline",
        requiredBlocks: [
          { name: "Start", category: "event", summary: "Begins cockpit program." },
          { name: "Declare string, int, bool storage", category: "variable", summary: "Stream buffers." },
          { name: "Loop [cin >> data -> cout << result]", category: "control", summary: "Reads stream before writing." },
          { name: "End", category: "event", summary: "Closes terminal." }
        ],
        assembly: [
          { blockName: "Start", category: "event", indent: 0 },
          { blockName: "Declare Storage (string, int, bool)", category: "variable", indent: 0 },
          { blockName: "Loop", category: "control", indent: 0 },
          { blockName: "cin >> sensorData", category: "sensor", indent: 1 },
          { blockName: "cout << processedResult", category: "movement", indent: 1 },
          { blockName: "End", category: "event", indent: 0 }
        ]
      }
    ]
  },

  "saturn-2": {
    missionId: "saturn-2",
    title: "Level 2: Jumpstarting the Rings",
    planetName: "Saturn",
    categoryTag: "Switch-Case",
    sections: [
      {
        sectionIndex: 0,
        title: "Debris Sorting Chutes",
        requiredBlocks: [
          { name: "switch (materialType)", category: "control", summary: "Branch condition." },
          { name: "case 'Ice': Melter; break;", category: "control", summary: "Melts ice chunks." },
          { name: "case 'Rock': Crusher; break;", category: "control", summary: "Crushes asteroids." },
          { name: "case 'Metal': Magnet; break;", category: "control", summary: "Attracts metal ore." }
        ],
        assembly: [
          { blockName: "let material = scanDebris()", category: "sensor", indent: 0 },
          { blockName: "switch (material) {", category: "control", indent: 0 },
          { blockName: "case 'Ice': routeToMelter(); break;", category: "movement", indent: 1 },
          { blockName: "case 'Rock': routeToCrusher(); break;", category: "movement", indent: 1 },
          { blockName: "case 'Metal': routeToMagnet(); break;", category: "movement", indent: 1 },
          { blockName: "default: routeToStorage();", category: "movement", indent: 1 },
          { blockName: "}", category: "control", indent: 0 }
        ]
      }
    ]
  },

  "saturn-3": {
    missionId: "saturn-3",
    title: "Level 3: A Leak in the System!",
    planetName: "Saturn",
    categoryTag: "Pointers & Memory",
    sections: [
      {
        sectionIndex: 0,
        title: "Pointer Allocation & Deallocation",
        requiredBlocks: [
          { name: "EnergyCore* core = new EnergyCore()", category: "code", summary: "Allocates heap memory." },
          { name: "core->transferEnergy()", category: "code", summary: "Routes power via pointer." },
          { name: "delete core; core = nullptr;", category: "code", summary: "Frees memory to prevent memory leak." }
        ],
        assembly: [
          { blockName: "EnergyCore* core = new EnergyCore();", category: "code", indent: 0 },
          { blockName: "core->transferEnergy();", category: "code", indent: 0 },
          { blockName: "delete core;", category: "code", indent: 0 },
          { blockName: "core = nullptr;", category: "code", indent: 0, notes: "Zero out dangling pointer" }
        ]
      }
    ]
  },

  // =========================================================================
  // EARTH (PYTHON)
  // =========================================================================
  "earth-1": {
    missionId: "earth-1",
    title: "Level 1: Fix the Master Ledger!",
    planetName: "Earth",
    categoryTag: "String Slicing",
    sections: [
      {
        sectionIndex: 0,
        title: "Sector 1: Telemetry Slicing",
        requiredBlocks: [
          { name: "String Slice [start:stop]", category: "code", summary: "Extracts substring between character offsets." },
          { name: "ledger_entry = data[4:12]", category: "variable", summary: "Stores cleaned text." }
        ],
        assembly: [
          { blockName: "clean_record = raw_data[start_index:end_index]", category: "code", indent: 0 },
          { blockName: "ledger.append(clean_record)", category: "variable", indent: 0 }
        ]
      },
      {
        sectionIndex: 1,
        title: "Sector 2: Station Identifiers",
        requiredBlocks: [
          { name: "String Slice [start:stop]", category: "code", summary: "Slices station identification code." }
        ],
        assembly: [
          { blockName: "station_id = raw_stream[prefix_end:suffix_start]", category: "code", indent: 0 }
        ]
      },
      {
        sectionIndex: 2,
        title: "Sector 3: Coordinate Stream",
        requiredBlocks: [
          { name: "String Slice [start:stop]", category: "code", summary: "Slices coordinates." }
        ],
        assembly: [
          { blockName: "coords = telemetry_packet[coord_start:coord_end]", category: "code", indent: 0 }
        ]
      },
      {
        sectionIndex: 3,
        title: "Sector 4: Master Checksum",
        requiredBlocks: [
          { name: "String Slice [-8:]", category: "code", summary: "Extracts checksum token." }
        ],
        assembly: [
          { blockName: "checksum = raw_buffer[token_start:token_end]", category: "code", indent: 0 }
        ]
      }
    ]
  },

  "earth-2": {
    missionId: "earth-2",
    title: "Level 2: The Planetary Archive",
    planetName: "Earth",
    categoryTag: "Dicts & Lists",
    sections: [
      {
        sectionIndex: 0,
        title: "Tab 1: 6 Planet Profile Dictionaries",
        requiredBlocks: [
          { name: "dict = { 'name': '...', 'status': '...' }", category: "variable", summary: "Creates dictionary object for each planet." }
        ],
        assembly: [
          { blockName: "moon_profile = { 'name': 'Moon', 'status': 'ONLINE' }", category: "variable", indent: 0 },
          { blockName: "mars_profile = { 'name': 'Mars', 'status': 'ONLINE' }", category: "variable", indent: 0 },
          { blockName: "Repeat for Venus, Mercury, Jupiter, Saturn", category: "variable", indent: 0 }
        ]
      },
      {
        sectionIndex: 1,
        title: "Tab 2: Master Archive Append",
        requiredBlocks: [
          { name: "master_archive.append(profile)", category: "code", summary: "Appends dictionary records to master list." }
        ],
        assembly: [
          { blockName: "master_archive = []", category: "variable", indent: 0 },
          { blockName: "master_archive.append(moon_profile)", category: "code", indent: 0 },
          { blockName: "master_archive.append(mars_profile)", category: "code", indent: 0 },
          { blockName: "syncMasterArchive()", category: "code", indent: 0 }
        ]
      }
    ]
  },

  "earth-3": {
    missionId: "earth-3",
    title: "Level 3: The Master Reboot",
    planetName: "Earth",
    categoryTag: "Modules & Functions",
    sections: [
      {
        sectionIndex: 0,
        title: "Planetary Network Reboot",
        requiredBlocks: [
          { name: "import moon, mars, venus, mercury, jupiter, saturn", category: "code", summary: "Imports planetary modules at the top." },
          { name: "def reboot_planetary_network():", category: "code", summary: "Defines master reboot function." },
          { name: "module.reboot()", category: "code", summary: "Calls each planet's reboot method." },
          { name: "reboot_planetary_network()", category: "code", summary: "Executes the master reboot function." }
        ],
        assembly: [
          { blockName: "import moon, mars, venus, mercury, jupiter, saturn", category: "code", indent: 0, notes: "Place at top" },
          { blockName: "def reboot_planetary_network():", category: "code", indent: 0 },
          { blockName: "moon.reboot()", category: "code", indent: 1 },
          { blockName: "mars.reboot()", category: "code", indent: 1 },
          { blockName: "venus.reboot()", category: "code", indent: 1 },
          { blockName: "mercury.reboot()", category: "code", indent: 1 },
          { blockName: "jupiter.reboot()", category: "code", indent: 1 },
          { blockName: "saturn.reboot()", category: "code", indent: 1 },
          { blockName: "reboot_planetary_network()", category: "code", indent: 0, notes: "Call function to execute" }
        ]
      }
    ]
  }
};

// Aliases
LEVEL_SOLUTION_GUIDES["html-1"] = LEVEL_SOLUTION_GUIDES["mars-1"];
LEVEL_SOLUTION_GUIDES["html-2"] = LEVEL_SOLUTION_GUIDES["mars-2"];
LEVEL_SOLUTION_GUIDES["html-3"] = LEVEL_SOLUTION_GUIDES["mars-3"];
LEVEL_SOLUTION_GUIDES["css-1"] = LEVEL_SOLUTION_GUIDES["venus-1"];
LEVEL_SOLUTION_GUIDES["css-2"] = LEVEL_SOLUTION_GUIDES["venus-2"];
LEVEL_SOLUTION_GUIDES["css-3"] = LEVEL_SOLUTION_GUIDES["venus-3"];
LEVEL_SOLUTION_GUIDES["js-1"] = LEVEL_SOLUTION_GUIDES["mercury-1"];
LEVEL_SOLUTION_GUIDES["js-2"] = LEVEL_SOLUTION_GUIDES["mercury-2"];
LEVEL_SOLUTION_GUIDES["js-3"] = LEVEL_SOLUTION_GUIDES["mercury-3"];
LEVEL_SOLUTION_GUIDES["javascript-1"] = LEVEL_SOLUTION_GUIDES["mercury-1"];
LEVEL_SOLUTION_GUIDES["javascript-2"] = LEVEL_SOLUTION_GUIDES["mercury-2"];
LEVEL_SOLUTION_GUIDES["javascript-3"] = LEVEL_SOLUTION_GUIDES["mercury-3"];
LEVEL_SOLUTION_GUIDES["java-1"] = LEVEL_SOLUTION_GUIDES["jupiter-1"];
LEVEL_SOLUTION_GUIDES["java-2"] = LEVEL_SOLUTION_GUIDES["jupiter-2"];
LEVEL_SOLUTION_GUIDES["java-3"] = LEVEL_SOLUTION_GUIDES["jupiter-3"];
LEVEL_SOLUTION_GUIDES["cpp-1"] = LEVEL_SOLUTION_GUIDES["saturn-1"];
LEVEL_SOLUTION_GUIDES["cpp-2"] = LEVEL_SOLUTION_GUIDES["saturn-2"];
LEVEL_SOLUTION_GUIDES["cpp-3"] = LEVEL_SOLUTION_GUIDES["saturn-3"];
LEVEL_SOLUTION_GUIDES["python-1"] = LEVEL_SOLUTION_GUIDES["earth-1"];
LEVEL_SOLUTION_GUIDES["python-2"] = LEVEL_SOLUTION_GUIDES["earth-2"];
LEVEL_SOLUTION_GUIDES["python-3"] = LEVEL_SOLUTION_GUIDES["earth-3"];

export function getSolutionGuideForMission(
  missionId: string,
  fallbackTitle = "Mission Simulation",
  fallbackPlanet = "Solar System"
): LevelSolutionGuide {
  const normalizedId = (missionId || "").trim().toLowerCase();
  if (LEVEL_SOLUTION_GUIDES[normalizedId]) {
    return LEVEL_SOLUTION_GUIDES[normalizedId];
  }

  return {
    missionId: normalizedId || "sandbox",
    title: fallbackTitle,
    planetName: fallbackPlanet,
    categoryTag: "Tactical Solution",
    sections: [
      {
        sectionIndex: 0,
        title: "Standard Mission Solution",
        requiredBlocks: [
          { name: "Start Block", category: "event", summary: "Required entry point." },
          { name: "Toolbox Directives", category: "control", summary: "Connect blocks matching your active goals." },
          { name: "End Block", category: "event", summary: "Finalizes execution." }
        ],
        assembly: [
          { blockName: "Start", category: "event", indent: 0 },
          { blockName: "Required Toolbox Blocks", category: "control", indent: 1 },
          { blockName: "End", category: "event", indent: 0 }
        ]
      }
    ]
  };
}
