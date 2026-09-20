import { LevelThreeState } from '@/hooks/useLevelThreeState';

/**
 * Level 3 ("The Launch Sequence") Custom Blockly JSON Definitions
 */
export const LEVEL_3_BLOCKLY_JSON_DEFINITIONS = [
  // --- 1. OXYGEN ROOM BLOCKS (Sequence Review: #06B6D4) ---
  {
    type: "unlock_door",
    message0: "Unlock Door",
    previousStatement: null,
    nextStatement: null,
    colour: "#06B6D4",
    tooltip: "Unlocks the airlock safety door.",
    helpUrl: "",
  },
  {
    type: "open_valve",
    message0: "Open Valve",
    previousStatement: null,
    nextStatement: null,
    colour: "#06B6D4",
    tooltip: "Opens the oxygen pressure equalization valve.",
    helpUrl: "",
  },
  {
    type: "pump_air",
    message0: "Pump Air",
    previousStatement: null,
    nextStatement: null,
    colour: "#06B6D4",
    tooltip: "Fills the life support chamber with fresh oxygen.",
    helpUrl: "",
  },

  // Backwards compatibility aliases
  {
    type: "close_doors",
    message0: "Unlock Door",
    previousStatement: null,
    nextStatement: null,
    colour: "#06B6D4",
    tooltip: "Unlocks the airlock safety door.",
    helpUrl: "",
  },

  // --- 2. SHIELD ROOM BLOCKS (Loops Review: #8B5CF6) ---
  {
    type: "charge_cell",
    message0: "Charge Cell",
    previousStatement: null,
    nextStatement: null,
    colour: "#8B5CF6",
    tooltip: "Charges one shield capacitor cell.",
    helpUrl: "",
  },
  {
    type: "charge_battery",
    message0: "Charge Cell",
    previousStatement: null,
    nextStatement: null,
    colour: "#8B5CF6",
    tooltip: "Charges one shield capacitor cell.",
    helpUrl: "",
  },

  // --- 3. ENGINE ROOM BLOCKS (Conditionals Review: #F97316 / #38BDF8) ---
  {
    type: "check_fuel_type",
    message0: "Fuel is %1",
    args0: [
      {
        type: "field_dropdown",
        name: "TYPE",
        options: [
          ["Blue Cryo", "blue_cryo"],
          ["Green Catalyst", "green_catalyst"],
        ],
      },
    ],
    output: "Boolean",
    colour: "#38BDF8",
    tooltip: "Checks the fuel tank type.",
    helpUrl: "",
  },
  {
    type: "add_cryo",
    message0: "Add Cryo Fuel",
    previousStatement: null,
    nextStatement: null,
    colour: "#F97316",
    tooltip: "Injects cryogenic blue fuel into the reactor.",
    helpUrl: "",
  },
  {
    type: "add_catalyst",
    message0: "Add Catalyst",
    previousStatement: null,
    nextStatement: null,
    colour: "#F97316",
    tooltip: "Injects green catalyst fuel into the reactor.",
    helpUrl: "",
  },
  {
    type: "mix_blue_fuel",
    message0: "Add Cryo Fuel",
    previousStatement: null,
    nextStatement: null,
    colour: "#F97316",
    tooltip: "Injects cryogenic blue fuel into the reactor.",
    helpUrl: "",
  },
  {
    type: "mix_green_fuel",
    message0: "Add Catalyst",
    previousStatement: null,
    nextStatement: null,
    colour: "#F97316",
    tooltip: "Injects green catalyst fuel into the reactor.",
    helpUrl: "",
  },

  // --- 4. COCKPIT (TAB 4) VARIABLE & FUNCTION REWARD BLOCKS ---
  {
    type: "set_ship_power",
    message0: "Set Ship Power to %1",
    args0: [
      {
        type: "field_number",
        name: "POWER",
        value: 0,
        min: 0,
        max: 100,
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: "#EAB308",
    tooltip: "Sets the ship's power variable (must be 100 to launch).",
    helpUrl: "",
  },
  {
    type: "func_oxygen",
    message0: "Turn On Oxygen",
    previousStatement: null,
    nextStatement: null,
    colour: "#06B6D4",
    tooltip: "Runs your Oxygen Room function (Unlock Door -> Open Valve -> Pump Air).",
    helpUrl: "",
  },
  {
    type: "func_shields",
    message0: "Turn On Shields",
    previousStatement: null,
    nextStatement: null,
    colour: "#8B5CF6",
    tooltip: "Runs your Shield Room function (Repeat 4 times: Charge Cell).",
    helpUrl: "",
  },
  {
    type: "func_thrusters",
    message0: "Turn On Thrusters",
    previousStatement: null,
    nextStatement: null,
    colour: "#F97316",
    tooltip: "Runs your Engine Room function (Add Cryo Fuel & Catalyst).",
    helpUrl: "",
  },
];

// --- TOOLBOX DEFINITIONS FOR TABS 1, 2, 3 ---

export const toolboxOxygen = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Oxygen Controls',
      colour: '#06B6D4',
      contents: [
        { kind: 'block', type: 'unlock_door' },
        { kind: 'block', type: 'open_valve' },
        { kind: 'block', type: 'pump_air' },
      ],
    },
  ],
};

export const toolboxShields = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Shield Controls',
      colour: '#8B5CF6',
      contents: [
        { kind: 'block', type: 'charge_cell' },
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
                fields: { NUM: 4 },
              },
            },
          },
        },
      ],
    },
  ],
};

export const toolboxEngine = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Logic',
      colour: '#38BDF8',
      contents: [
        { kind: 'block', type: 'controls_ifelse' },
        { kind: 'block', type: 'check_fuel_type' },
      ],
    },
    {
      kind: 'category',
      name: 'Engine Controls',
      colour: '#F97316',
      contents: [
        { kind: 'block', type: 'add_cryo' },
        { kind: 'block', type: 'add_catalyst' },
      ],
    },
  ],
};

/**
 * Dynamically generates the toolbox for Tab 4 (The Cockpit) based on user progress
 */
export function generateCockpitToolbox(state: {
  isOxygenFixed: boolean;
  isShieldFixed: boolean;
  isEngineFixed: boolean;
}) {
  const mySystemsBlocks: any[] = [];

  if (state.isOxygenFixed) {
    mySystemsBlocks.push({ kind: 'block', type: 'func_oxygen' });
  }
  if (state.isShieldFixed) {
    mySystemsBlocks.push({ kind: 'block', type: 'func_shields' });
  }
  if (state.isEngineFixed) {
    mySystemsBlocks.push({ kind: 'block', type: 'func_thrusters' });
  }

  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Variables',
        colour: '#EAB308',
        contents: [
          { kind: 'block', type: 'set_ship_power' },
          { kind: 'block', type: 'math_number' },
        ],
      },
      {
        kind: 'category',
        name: 'My Systems',
        colour: '#3B82F6',
        contents: mySystemsBlocks.length > 0 ? mySystemsBlocks : [],
      },
    ],
  };
}
