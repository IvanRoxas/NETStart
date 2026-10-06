import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import type { LevelSection } from '@/components/BlocklyMaze';

// =============================================================================
// PLANETARY PROFILES DATA (CHILD-FRIENDLY, ZERO NUMBERS, RICH DESCRIPTIONS)
// =============================================================================

export interface PlanetProfileSpec {
  id: string;
  name: string;
  color: string;
  type: 'Rocky' | 'Gas Giant';
  features: string[];
  avatarColor: string;
  badge: string;
  sector: string;
  iconUrl: string;
  description: string;
  shortDesc: string;
}

export const PLANET_BLOCK_COLORS: Record<string, string> = {
  Mercury: '#64748B',
  Venus: '#DB2777',
  Earth: '#0284C7',
  Mars: '#DC2626',
  Jupiter: '#D97706',
  Saturn: '#CA8A04',
};

export const EARTH_2_PLANETS: PlanetProfileSpec[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    color: '#94A3B8',
    type: 'Rocky',
    features: ['Hot and Cold Extremes', 'Temperature Extremes'],
    avatarColor: '#64748b',
    badge: 'The Swift Planet',
    sector: 'SEC // 01-HERMES',
    iconUrl: '/assets/planets/celestial/Mercury.svg',
    description:
      'A small, rocky world with craters, closest to the Sun.',
    shortDesc: 'Small, rocky world closest to the Sun',
  },
  {
    id: 'venus',
    name: 'Venus',
    color: '#EC4899',
    type: 'Rocky',
    features: ['Hot Temperatures', 'Heat'],
    avatarColor: '#db2777',
    badge: 'The Hot Planet',
    sector: 'SEC // 02-APHRODITE',
    iconUrl: '/assets/planets/celestial/Venus.svg',
    description:
      'A super hot rocky planet with thick, yellow clouds.',
    shortDesc: 'Hot rocky planet with thick clouds',
  },
  {
    id: 'earth',
    name: 'Earth',
    color: '#06B6D4',
    type: 'Rocky',
    features: ['Life and Water', 'Life', 'Water'],
    avatarColor: '#0284c7',
    badge: 'Our Home Planet',
    sector: 'SEC // 03-TERRA',
    iconUrl: '/assets/planets/celestial/Earth.svg',
    description:
      'A blue planet with oceans, land, and living things.',
    shortDesc: 'Blue planet with oceans and life',
  },
  {
    id: 'mars',
    name: 'Mars',
    color: '#EF4444',
    type: 'Rocky',
    features: ['Red Desert Landscapes', 'Red Desert'],
    avatarColor: '#dc2626',
    badge: 'The Red Planet',
    sector: 'SEC // 04-ARES',
    iconUrl: '/assets/planets/celestial/Mars.svg',
    description:
      'A cold, dusty red planet with rocks and large volcanoes.',
    shortDesc: 'Cold, dusty red planet with rocks',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    color: '#F59E0B',
    type: 'Gas Giant',
    features: ['Great Red Spot', 'Red Spot'],
    avatarColor: '#d97706',
    badge: 'Giant Planet',
    sector: 'SEC // 05-JOVE',
    iconUrl: '/assets/planets/celestial/Jupiter.svg',
    description:
      'A huge gas planet with a big storm called the Great Red Spot.',
    shortDesc: 'Huge gas planet with the Great Red Spot',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    color: '#EAB308',
    type: 'Gas Giant',
    features: ['Multiple Rings', 'Rings'],
    avatarColor: '#ca8a04',
    badge: 'The Ringed Planet',
    sector: 'SEC // 06-CRONUS',
    iconUrl: '/assets/planets/celestial/Saturn.svg',
    description:
      'A giant gas planet with wide, bright rings of ice and rock.',
    shortDesc: 'Giant gas planet with wide icy rings',
  },
];

// =============================================================================
// SECTION 1 PARSER & VALIDATION TYPES
// =============================================================================

export interface PlanetValidationResult {
  planetId: string;
  planetName: string;
  hasBlock: boolean;
  inputType: string;
  inputFeatures: string;
  inputKnownFor?: string;
  inputDescription?: string;
  isTypeCorrect: boolean;
  isFeaturesCorrect: boolean;
  isKnownForCorrect?: boolean;
  isDescriptionCorrect?: boolean;
  isValidated: boolean;
}

export interface Earth2Section1Validation {
  activePlanetId: string;
  activePlanetName: string;
  planetResults: Record<string, PlanetValidationResult>;
  validatedCount: number; // 0..6
  isAllComplete: boolean;
  pythonCode: string;
  errorMessage?: string;
  error?: string;
}

// =============================================================================
// TAB 2 PARSER & VALIDATION TYPES (PLANETARY ORBITS MINIGAME)
// =============================================================================

export interface OrbitValidationItem {
  orbitIndex: number; // 0 to 5
  orbitNumber: number; // 1 to 6
  expectedPlanet: string; // 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn'
  placedPlanet: string | null;
  isCorrect: boolean;
}

export interface Earth2Tab2Validation {
  orbits: (string | null)[];
  orbitItems: OrbitValidationItem[];
  correctCount: number;
  allCorrect: boolean;
  pythonCode: string;
  errorMessage?: string;
  appendedPlanets: string[];
  allAppended: boolean;
  isOrderCorrect: boolean;
  isComplete: boolean;
  error?: string;
}

export type Earth2Tab1Validation = Earth2Section1Validation;
export type Earth2Section2Validation = Earth2Tab2Validation;

// =============================================================================
// BLOCKLY BLOCK REGISTRATIONS (INTUITIVE, NO CODE SYNTAX, CLEAN PUZZLE PIECES)
// =============================================================================

let earth2BlocksRegistered = false;

export function registerEarthLevel2Blocks() {
  if (earth2BlocksRegistered || typeof window === 'undefined') return;

  // ---------------------------------------------------------------------------
  // SECTION 1: Planet Profile Builder Block (Compact, Sleek Puzzle Piece)
  // Dynamic color updating based on the planet chosen in the dropdown!
  // ---------------------------------------------------------------------------
  Blockly.Blocks['earth2_planet_dict'] = {
    init: function () {
      const planetDropdown = new Blockly.FieldDropdown(
        [
          ['Mercury', 'Mercury'],
          ['Venus', 'Venus'],
          ['Earth', 'Earth'],
          ['Mars', 'Mars'],
          ['Jupiter', 'Jupiter'],
          ['Saturn', 'Saturn'],
        ],
        function (this: Blockly.FieldDropdown, newValue: string) {
          const source = this.getSourceBlock();
          if (source && PLANET_BLOCK_COLORS[newValue]) {
            source.setColour(PLANET_BLOCK_COLORS[newValue]);
          }
          return newValue;
        }
      );

      this.appendDummyInput()
        .appendField('Planet:')
        .appendField(planetDropdown, 'PLANET');
      if (typeof this.appendEndRowInput === 'function') {
        this.appendEndRowInput();
      }

      this.appendValueInput('DESC_VAL')
        .setCheck(null)
        .appendField('Description:');
      if (typeof this.appendEndRowInput === 'function') {
        this.appendEndRowInput();
      }

      this.appendValueInput('TYPE_VAL')
        .setCheck(null)
        .appendField('Type:');
      if (typeof this.appendEndRowInput === 'function') {
        this.appendEndRowInput();
      }

      this.appendValueInput('FEATURES_VAL')
        .setCheck(null)
        .appendField('Features:');

      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(PLANET_BLOCK_COLORS['Mercury']); // Dynamic color defaults to Mercury
      this.setTooltip('Assemble a planet profile with its description, type, and features.');

      this.setOnChange(function (this: Blockly.Block) {
        const p = this.getFieldValue('PLANET');
        if (p && PLANET_BLOCK_COLORS[p] && this.getColour() !== PLANET_BLOCK_COLORS[p]) {
          this.setColour(PLANET_BLOCK_COLORS[p]);
        }
      });
    },
  };

  javascriptGenerator.forBlock['earth2_planet_dict'] = function (block: Blockly.Block) {
    const planet = block.getFieldValue('PLANET') || 'Earth';
    const descVal =
      (block.getInput('DESC_VAL') ? javascriptGenerator.valueToCode(block, 'DESC_VAL', 0) : '') ||
      (block.getInput('DESCRIPTION_VAL') ? javascriptGenerator.valueToCode(block, 'DESCRIPTION_VAL', 0) : '') ||
      '""';
    const typeVal =
      (block.getInput('TYPE_VAL') ? javascriptGenerator.valueToCode(block, 'TYPE_VAL', 0) : '') || '""';
    const featuresVal =
      (block.getInput('FEATURES_VAL') ? javascriptGenerator.valueToCode(block, 'FEATURES_VAL', 0) : '') ||
      (block.getInput('KNOWN_FOR_VAL') ? javascriptGenerator.valueToCode(block, 'KNOWN_FOR_VAL', 0) : '') ||
      '""';

    return `${planet} = {\n    "description": ${descVal},\n    "type": ${typeVal},\n    "features": ${featuresVal},\n}\n`;
  };

  Blockly.Blocks['earth2_create_dict'] = Blockly.Blocks['earth2_planet_dict'];
  javascriptGenerator.forBlock['earth2_create_dict'] = javascriptGenerator.forBlock['earth2_planet_dict'];

  // ---------------------------------------------------------------------------
  // SECTION 1 VALUE PILLS (Clean Puzzle Pieces, Zero Raw Quotes in UI)
  // ---------------------------------------------------------------------------

  // Planet Descriptions (Sky Blue) - Simplified, informative, non-verbose
  const DESC_PILLS = [
    {
      type: 'earth2_val_desc_mercury',
      label: 'Small, rocky world closest to the Sun',
      val: 'A small, rocky world with craters, closest to the Sun.',
      planet: 'Mercury',
    },
    {
      type: 'earth2_val_desc_venus',
      label: 'Hot rocky planet with thick clouds',
      val: 'A super hot rocky planet with thick, yellow clouds.',
      planet: 'Venus',
    },
    {
      type: 'earth2_val_desc_earth',
      label: 'Blue planet with oceans and life',
      val: 'A blue planet with oceans, land, and living things.',
      planet: 'Earth',
    },
    {
      type: 'earth2_val_desc_mars',
      label: 'Cold, dusty red planet with rocks',
      val: 'A cold, dusty red planet with rocks and large volcanoes.',
      planet: 'Mars',
    },
    {
      type: 'earth2_val_desc_jupiter',
      label: 'Huge gas planet with the Great Red Spot',
      val: 'A huge gas planet with a big storm called the Great Red Spot.',
      planet: 'Jupiter',
    },
    {
      type: 'earth2_val_desc_saturn',
      label: 'Giant gas planet with wide icy rings',
      val: 'A giant gas planet with wide, bright rings of ice and rock.',
      planet: 'Saturn',
    },
  ];

  DESC_PILLS.forEach((p) => {
    Blockly.Blocks[p.type] = {
      init: function () {
        this.appendDummyInput().appendField(p.label);
        this.setOutput(true, null);
        this.setColour('#0284C7'); // Sky Blue
        this.setTooltip(`Description for ${p.planet}`);
      },
    };

    javascriptGenerator.forBlock[p.type] = function () {
      return [`"${p.val}"`, 0];
    };
  });

  // Types: Rocky and Gas Giant ONLY (Emerald Green)
  const TYPE_PILLS = [
    { type: 'earth2_val_rocky', label: 'Rocky', val: 'Rocky' },
    { type: 'earth2_val_gas_giant', label: 'Gas Giant', val: 'Gas Giant' },
  ];

  TYPE_PILLS.forEach((p) => {
    Blockly.Blocks[p.type] = {
      init: function () {
        this.appendDummyInput().appendField(p.label);
        this.setOutput(true, null);
        this.setColour('#10B981'); // Emerald Green
        this.setTooltip(`Planet Type: ${p.label}`);
      },
    };

    javascriptGenerator.forBlock[p.type] = function () {
      return [`"${p.val}"`, 0];
    };
  });

  // Features (Amber / Gold)
  const FEATURE_PILLS = [
    { type: 'earth2_val_feat_hot_cold', label: 'Hot and Cold Extremes', val: 'Hot and Cold Extremes' },
    { type: 'earth2_val_feat_hot_temps', label: 'Hot Temperatures', val: 'Hot Temperatures' },
    { type: 'earth2_val_feat_life_water', label: 'Life and Water', val: 'Life and Water' },
    { type: 'earth2_val_feat_red_desert', label: 'Red Desert Landscapes', val: 'Red Desert Landscapes' },
    { type: 'earth2_val_feat_great_red_spot', label: 'Great Red Spot', val: 'Great Red Spot' },
    { type: 'earth2_val_feat_multiple_rings', label: 'Multiple Rings', val: 'Multiple Rings' },
  ];

  FEATURE_PILLS.forEach((p) => {
    Blockly.Blocks[p.type] = {
      init: function () {
        this.appendDummyInput().appendField(p.label);
        this.setOutput(true, null);
        this.setColour('#F59E0B'); // Amber
        this.setTooltip(`Features: ${p.label}`);
      },
    };

    javascriptGenerator.forBlock[p.type] = function () {
      return [`"${p.val}"`, 0];
    };
  });

  // ---------------------------------------------------------------------------
  // TAB 2: Planetary Orbit List Blocks (Arrange the Planets Minigame)
  // ---------------------------------------------------------------------------
  const PLANET_VARS = [
    { type: 'earth2_var_mercury', name: 'Mercury', label: 'Mercury', color: '#64748B', tooltip: 'Planet: Mercury' },
    { type: 'earth2_var_venus', name: 'Venus', label: 'Venus', color: '#D97706', tooltip: 'Planet: Venus' },
    { type: 'earth2_var_earth', name: 'Earth', label: 'Earth', color: '#0284C7', tooltip: 'Planet: Earth' },
    { type: 'earth2_var_mars', name: 'Mars', label: 'Mars', color: '#DC2626', tooltip: 'Planet: Mars' },
    { type: 'earth2_var_jupiter', name: 'Jupiter', label: 'Jupiter', color: '#EA580C', tooltip: 'Planet: Jupiter' },
    { type: 'earth2_var_saturn', name: 'Saturn', label: 'Saturn', color: '#CA8A04', tooltip: 'Planet: Saturn' },
  ];

  PLANET_VARS.forEach((f) => {
    Blockly.Blocks[f.type] = {
      init: function () {
        this.appendDummyInput().appendField(f.label);
        this.setOutput(true, null);
        this.setColour(f.color);
        this.setTooltip(f.tooltip);
      },
    };

    javascriptGenerator.forBlock[f.type] = function () {
      return [`"${f.name}"`, 0];
    };
  });

  // Dropdown planet selector block
  Blockly.Blocks['earth2_planet_item'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Planet:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Mercury', 'Mercury'],
            ['Venus', 'Venus'],
            ['Earth', 'Earth'],
            ['Mars', 'Mars'],
            ['Jupiter', 'Jupiter'],
            ['Saturn', 'Saturn'],
          ]),
          'PLANET'
        );
      this.setOutput(true, null);
      this.setColour('#38BDF8');
      this.setTooltip('A planet to place in the solar system orbit list.');
    },
  };

  javascriptGenerator.forBlock['earth2_planet_item'] = function (block: Blockly.Block) {
    const planet = block.getFieldValue('PLANET') || 'Mercury';
    return [`"${planet}"`, 0];
  };

  // Dedicated Python List block: solar_system = [ ... ]
  Blockly.Blocks['earth2_solar_system_list'] = {
    init: function () {
      this.appendDummyInput().appendField('solar_system = [');
      if (typeof this.appendEndRowInput === 'function') {
        this.appendEndRowInput();
      }

      this.appendValueInput('ORBIT_0').setCheck(null).appendField('  Orbit 1:');
      if (typeof this.appendEndRowInput === 'function') {
        this.appendEndRowInput();
      }

      this.appendValueInput('ORBIT_1').setCheck(null).appendField('  Orbit 2:');
      if (typeof this.appendEndRowInput === 'function') {
        this.appendEndRowInput();
      }

      this.appendValueInput('ORBIT_2').setCheck(null).appendField('  Orbit 3:');
      if (typeof this.appendEndRowInput === 'function') {
        this.appendEndRowInput();
      }

      this.appendValueInput('ORBIT_3').setCheck(null).appendField('  Orbit 4:');
      if (typeof this.appendEndRowInput === 'function') {
        this.appendEndRowInput();
      }

      this.appendValueInput('ORBIT_4').setCheck(null).appendField('  Orbit 5:');
      if (typeof this.appendEndRowInput === 'function') {
        this.appendEndRowInput();
      }

      this.appendValueInput('ORBIT_5').setCheck(null).appendField('  Orbit 6:');
      if (typeof this.appendEndRowInput === 'function') {
        this.appendEndRowInput();
      }

      this.appendDummyInput().appendField(']');
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#7C3AED'); // Deep Purple
      this.setTooltip('Arrange the 6 planets in orbital order from the Sun outward.');
    },
  };

  javascriptGenerator.forBlock['earth2_solar_system_list'] = function (block: Blockly.Block) {
    const o0 = (block.getInput('ORBIT_0') ? javascriptGenerator.valueToCode(block, 'ORBIT_0', 0) : '') || '""';
    const o1 = (block.getInput('ORBIT_1') ? javascriptGenerator.valueToCode(block, 'ORBIT_1', 0) : '') || '""';
    const o2 = (block.getInput('ORBIT_2') ? javascriptGenerator.valueToCode(block, 'ORBIT_2', 0) : '') || '""';
    const o3 = (block.getInput('ORBIT_3') ? javascriptGenerator.valueToCode(block, 'ORBIT_3', 0) : '') || '""';
    const o4 = (block.getInput('ORBIT_4') ? javascriptGenerator.valueToCode(block, 'ORBIT_4', 0) : '') || '""';
    const o5 = (block.getInput('ORBIT_5') ? javascriptGenerator.valueToCode(block, 'ORBIT_5', 0) : '') || '""';

    return `solar_system = [\n    ${o0},\n    ${o1},\n    ${o2},\n    ${o3},\n    ${o4},\n    ${o5},\n]\n`;
  };

  // Append block: solar_system.append(...)
  Blockly.Blocks['earth2_append_list'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('solar_system.append(')
        .appendField(
          new Blockly.FieldDropdown([
            ['Mercury', 'Mercury'],
            ['Venus', 'Venus'],
            ['Earth', 'Earth'],
            ['Mars', 'Mars'],
            ['Jupiter', 'Jupiter'],
            ['Saturn', 'Saturn'],
          ]),
          'ITEM'
        )
        .appendField(')');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#059669'); // Emerald
      this.setTooltip('Append a planet to the solar_system list in order.');
    },
  };

  javascriptGenerator.forBlock['earth2_append_list'] = function (block: Blockly.Block) {
    const item = block.getFieldValue('ITEM') || 'Mercury';
    return `solar_system.append("${item}")\n`;
  };

  earth2BlocksRegistered = true;
}

// =============================================================================
// TOOLBOX DEFINITIONS FOR SECTIONS (DYNAMIC SINGLE-USE FILTERING FOR DESCRIPTIONS & FEATURES)
// =============================================================================

export function getEarthLevel2Toolbox(
  sectionOrTab: number | string = 0,
  usedTypes: Set<string> | string[] | any = []
) {
  const isSection1 = sectionOrTab === 0 || sectionOrTab === 'tab1' || sectionOrTab === 'section1';
  const usedSet =
    usedTypes instanceof Set
      ? usedTypes
      : Array.isArray(usedTypes)
      ? new Set(usedTypes)
      : new Set<string>();

  if (isSection1) {
    const allDescriptions = [
      { kind: 'block', type: 'earth2_val_desc_mercury' },
      { kind: 'block', type: 'earth2_val_desc_venus' },
      { kind: 'block', type: 'earth2_val_desc_earth' },
      { kind: 'block', type: 'earth2_val_desc_mars' },
      { kind: 'block', type: 'earth2_val_desc_jupiter' },
      { kind: 'block', type: 'earth2_val_desc_saturn' },
    ];

    const allFeatures = [
      { kind: 'block', type: 'earth2_val_feat_hot_cold' },
      { kind: 'block', type: 'earth2_val_feat_hot_temps' },
      { kind: 'block', type: 'earth2_val_feat_life_water' },
      { kind: 'block', type: 'earth2_val_feat_red_desert' },
      { kind: 'block', type: 'earth2_val_feat_great_red_spot' },
      { kind: 'block', type: 'earth2_val_feat_multiple_rings' },
    ];

    return {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Profiles',
          colour: '#7C3AED',
          contents: [
            { kind: 'block', type: 'earth2_planet_dict' },
          ],
        },
        {
          kind: 'category',
          name: 'Descriptions',
          colour: '#0284C7',
          contents: allDescriptions.filter((b) => !usedSet.has(b.type)),
        },
        {
          kind: 'category',
          name: 'Types',
          colour: '#10B981',
          contents: [
            { kind: 'block', type: 'earth2_val_rocky' },
            { kind: 'block', type: 'earth2_val_gas_giant' },
          ],
        },
        {
          kind: 'category',
          name: 'Features',
          colour: '#F59E0B',
          contents: allFeatures.filter((b) => !usedSet.has(b.type)),
        },
      ],
    };
  }

  // TAB 2 TOOLBOX: Solar System List & Planet Blocks
  const allPlanets = [
    { kind: 'block', type: 'earth2_var_mercury' },
    { kind: 'block', type: 'earth2_var_venus' },
    { kind: 'block', type: 'earth2_var_earth' },
    { kind: 'block', type: 'earth2_var_mars' },
    { kind: 'block', type: 'earth2_var_jupiter' },
    { kind: 'block', type: 'earth2_var_saturn' },
  ];

  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'List',
        colour: '#7C3AED',
        contents: [
          { kind: 'block', type: 'earth2_solar_system_list' },
        ].filter((b) => !usedSet.has(b.type)),
      },
      {
        kind: 'category',
        name: 'Planets',
        colour: '#06B6D4',
        contents: allPlanets.filter((b) => !usedSet.has(b.type)),
      },
    ],
  };
}

// =============================================================================
// WORKSPACE PARSERS
// =============================================================================

function cleanStr(raw: string): string {
  if (!raw) return '';
  let str = raw.trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1);
  }
  return str.trim();
}

export function parseEarth2Section1Workspace(
  ws: Blockly.WorkspaceSvg | null,
  activeFocusPlanet?: string
): Earth2Section1Validation {
  const planetResults: Record<string, PlanetValidationResult> = {};

  EARTH_2_PLANETS.forEach((spec) => {
    planetResults[spec.name] = {
      planetId: spec.id,
      planetName: spec.name,
      hasBlock: false,
      inputType: '',
      inputFeatures: '',
      inputKnownFor: '',
      inputDescription: '',
      isTypeCorrect: false,
      isFeaturesCorrect: false,
      isKnownForCorrect: false,
      isDescriptionCorrect: false,
      isValidated: false,
    };
  });

  if (!ws) {
    return {
      activePlanetId: 'mercury',
      activePlanetName: 'Mercury',
      planetResults,
      validatedCount: 0,
      isAllComplete: false,
      pythonCode: '',
    };
  }

  const allBlocks = ws.getAllBlocks(false);
  const dictBlocks = allBlocks.filter(
    (b) => b.type === 'earth2_planet_dict' || b.type === 'earth2_create_dict'
  );

  dictBlocks.forEach((block) => {
    const planetName = block.getFieldValue('PLANET') || block.getFieldValue('FOLDER') || '';
    const spec = EARTH_2_PLANETS.find((p) => p.name.toLowerCase() === planetName.toLowerCase());
    if (!spec) return;

    let rawType = '';
    let rawFeatures = '';
    let rawDesc = '';

    try {
      if (block.getInput('TYPE_VAL')) {
        rawType = javascriptGenerator.valueToCode(block, 'TYPE_VAL', 0);
      }
    } catch (e) {}

    try {
      if (block.getInput('FEATURES_VAL')) {
        rawFeatures = javascriptGenerator.valueToCode(block, 'FEATURES_VAL', 0);
      } else if (block.getInput('KNOWN_FOR_VAL')) {
        rawFeatures = javascriptGenerator.valueToCode(block, 'KNOWN_FOR_VAL', 0);
      }
    } catch (e) {}

    try {
      if (block.getInput('DESC_VAL')) {
        rawDesc = javascriptGenerator.valueToCode(block, 'DESC_VAL', 0);
      } else if (block.getInput('DESCRIPTION_VAL')) {
        rawDesc = javascriptGenerator.valueToCode(block, 'DESCRIPTION_VAL', 0);
      }
    } catch (e) {}

    const inputType = cleanStr(rawType);
    const inputFeatures = cleanStr(rawFeatures);
    const inputDescription = cleanStr(rawDesc);

    const isTypeCorrect = inputType.toLowerCase() === spec.type.toLowerCase();
    const isFeaturesCorrect = spec.features.some(
      (feat) => feat.toLowerCase() === inputFeatures.toLowerCase() || inputFeatures.toLowerCase().includes(feat.toLowerCase())
    );
    const isDescriptionCorrect =
      inputDescription.length > 0 &&
      (inputDescription.toLowerCase() === spec.description.toLowerCase() ||
        inputDescription.toLowerCase() === spec.shortDesc.toLowerCase() ||
        spec.description.toLowerCase().includes(inputDescription.toLowerCase()) ||
        inputDescription.toLowerCase().includes(spec.shortDesc.toLowerCase()));

    const isValidated = isTypeCorrect && isFeaturesCorrect && isDescriptionCorrect;

    planetResults[spec.name] = {
      planetId: spec.id,
      planetName: spec.name,
      hasBlock: true,
      inputType,
      inputFeatures,
      inputKnownFor: inputFeatures,
      inputDescription,
      isTypeCorrect,
      isFeaturesCorrect,
      isKnownForCorrect: isFeaturesCorrect,
      isDescriptionCorrect,
      isValidated,
    };
  });

  const validatedCount = Object.values(planetResults).filter((r) => r.isValidated).length;
  const isAllComplete = validatedCount === EARTH_2_PLANETS.length;

  let activePlanetName = activeFocusPlanet || 'Mercury';
  if (!activeFocusPlanet && dictBlocks.length > 0) {
    activePlanetName = dictBlocks[0].getFieldValue('PLANET') || 'Mercury';
  }
  const activeSpec = EARTH_2_PLANETS.find((p) => p.name.toLowerCase() === activePlanetName.toLowerCase()) || EARTH_2_PLANETS[0];

  let pythonCode = '';
  try {
    pythonCode = javascriptGenerator.workspaceToCode(ws) || '';
  } catch (e) {}

  return {
    activePlanetId: activeSpec.id,
    activePlanetName: activeSpec.name,
    planetResults,
    validatedCount,
    isAllComplete,
    pythonCode,
    errorMessage: isAllComplete
      ? undefined
      : `Scan Incomplete: ${validatedCount} of ${EARTH_2_PLANETS.length} planets verified. Check each planet's type, features, and description!`,
  };
}

export function parseEarth2Tab1Workspace(ws: Blockly.WorkspaceSvg | null, activeFocusFolder?: string): any {
  return parseEarth2Section1Workspace(ws, activeFocusFolder);
}

// -----------------------------------------------------------------------------
// TAB 2: PARSE SOLAR SYSTEM LIST WORKSPACE (REAL-TIME ORBIT MAPPING)
// -----------------------------------------------------------------------------

export function parseEarth2Tab2Workspace(ws: Blockly.WorkspaceSvg | null): Earth2Tab2Validation {
  const EXPECTED_ORDER = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn'];

  if (!ws) {
    const emptyItems = EXPECTED_ORDER.map((exp, idx) => ({
      orbitIndex: idx,
      orbitNumber: idx + 1,
      expectedPlanet: exp,
      placedPlanet: null,
      isCorrect: false,
    }));
    return {
      orbits: [null, null, null, null, null, null],
      orbitItems: emptyItems,
      correctCount: 0,
      allCorrect: false,
      pythonCode: '',
      appendedPlanets: [],
      allAppended: false,
      isOrderCorrect: false,
      isComplete: false,
    };
  }

  const cleanStr = (val: string) =>
    (val || '').replace(/['"`]/g, '').trim();

  const allBlocks = ws.getAllBlocks(false);
  const listBlock = allBlocks.find((b) => b.type === 'earth2_solar_system_list');
  const appendBlocks = allBlocks.filter((b) => b.type === 'earth2_append_list');

  const orbits: (string | null)[] = [null, null, null, null, null, null];

  if (listBlock) {
    for (let i = 0; i < 6; i++) {
      try {
        const input = listBlock.getInput(`ORBIT_${i}`);
        if (input && input.connection && input.connection.targetBlock()) {
          const target = input.connection.targetBlock();
          let name = '';
          if (target) {
            if (target.type.startsWith('earth2_var_')) {
              const pKey = target.type.replace('earth2_var_', '');
              const found = EXPECTED_ORDER.find((p) => p.toLowerCase() === pKey.toLowerCase());
              if (found) name = found;
            } else if (target.getFieldValue('PLANET')) {
              name = target.getFieldValue('PLANET');
            } else {
              name = cleanStr(javascriptGenerator.valueToCode(listBlock, `ORBIT_${i}`, 0));
            }
          }
          if (name) {
            orbits[i] = name;
          }
        }
      } catch (e) {}
    }
  } else if (appendBlocks.length > 0) {
    appendBlocks.forEach((block, idx) => {
      if (idx < 6) {
        const item = block.getFieldValue('ITEM') || block.getFieldValue('ITEM_DROP');
        if (item) {
          orbits[idx] = cleanStr(item);
        }
      }
    });
  }

  const orbitItems: OrbitValidationItem[] = EXPECTED_ORDER.map((expected, idx) => {
    const placed = orbits[idx];
    const isCorrect = !!placed && placed.toLowerCase() === expected.toLowerCase();
    return {
      orbitIndex: idx,
      orbitNumber: idx + 1,
      expectedPlanet: expected,
      placedPlanet: placed,
      isCorrect,
    };
  });

  const correctCount = orbitItems.filter((item) => item.isCorrect).length;
  const allCorrect = correctCount === 6;

  let pythonCode = '';
  try {
    pythonCode = javascriptGenerator.workspaceToCode(ws) || '';
  } catch (e) {}
  if (!pythonCode && orbits.some(Boolean)) {
    const listStr = orbits.map((p) => (p ? `"${p}"` : '""')).join(', ');
    pythonCode = `solar_system = [${listStr}]`;
  }

  let errorMessage: string | undefined;
  if (!allCorrect) {
    const missingOrWrong = orbitItems.find((o) => !o.isCorrect);
    if (missingOrWrong) {
      if (!missingOrWrong.placedPlanet) {
        errorMessage = `Orbit ${missingOrWrong.orbitNumber} is empty! Place the planet that orbits at position ${missingOrWrong.orbitNumber}.`;
      } else {
        errorMessage = `Orbit ${missingOrWrong.orbitNumber} has ${missingOrWrong.placedPlanet}, but should be ${missingOrWrong.expectedPlanet}.`;
      }
    }
  }

  const placedPlanets = orbits.filter((p): p is string => !!p);

  return {
    orbits,
    orbitItems,
    correctCount,
    allCorrect,
    pythonCode,
    errorMessage: allCorrect ? undefined : errorMessage,
    appendedPlanets: placedPlanets,
    allAppended: placedPlanets.length === 6,
    isOrderCorrect: allCorrect,
    isComplete: allCorrect,
  };
}

export function parseEarth2Section2Workspace(ws: Blockly.WorkspaceSvg | null): any {
  return parseEarth2Tab2Workspace(ws);
}

// =============================================================================
// INITIAL VALIDATION STATES
// =============================================================================

export const INITIAL_EARTH_2_SECTION1_VALIDATION: Earth2Section1Validation = {
  activePlanetId: 'mercury',
  activePlanetName: 'Mercury',
  planetResults: {},
  validatedCount: 0,
  isAllComplete: false,
  pythonCode: '',
};

export const INITIAL_EARTH_2_TAB1_VALIDATION: any = INITIAL_EARTH_2_SECTION1_VALIDATION;

export const INITIAL_EARTH_2_TAB2_VALIDATION: Earth2Tab2Validation = {
  orbits: [null, null, null, null, null, null],
  orbitItems: [
    { orbitIndex: 0, orbitNumber: 1, expectedPlanet: 'Mercury', placedPlanet: null, isCorrect: false },
    { orbitIndex: 1, orbitNumber: 2, expectedPlanet: 'Venus', placedPlanet: null, isCorrect: false },
    { orbitIndex: 2, orbitNumber: 3, expectedPlanet: 'Earth', placedPlanet: null, isCorrect: false },
    { orbitIndex: 3, orbitNumber: 4, expectedPlanet: 'Mars', placedPlanet: null, isCorrect: false },
    { orbitIndex: 4, orbitNumber: 5, expectedPlanet: 'Jupiter', placedPlanet: null, isCorrect: false },
    { orbitIndex: 5, orbitNumber: 6, expectedPlanet: 'Saturn', placedPlanet: null, isCorrect: false },
  ],
  correctCount: 0,
  allCorrect: false,
  pythonCode: '',
  appendedPlanets: [],
  allAppended: false,
  isOrderCorrect: false,
  isComplete: false,
};

export const INITIAL_EARTH_2_SECTION2_VALIDATION = INITIAL_EARTH_2_TAB2_VALIDATION;

// =============================================================================
// UNIFIED 1-SECTION CONFIGURATION & OBJECTIVES
// =============================================================================

export const EARTH_2_UNIFIED_OBJECTIVES = [
  { id: 1, text: 'Verify all 6 planet profiles in Profiles', completed: false, isClaimed: false },
  { id: 2, text: 'Order all 6 planets in Orbits', completed: false, isClaimed: false },
  { id: 3, text: 'Run simulation to align all 6 orbits', completed: false, isClaimed: false },
];

export const EARTH_2_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: 'The Planetary Archive',
    subtag: 'Unified Mission: Profiles & Orbits',
    desc: 'Rebuild the scrambled dictionary profiles for all 6 planets in Profiles. Once all profiles are verified, unlock Orbits to arrange the solar system in correct orbital order around the Sun using Python lists!',
    tip: 'Hint: Verify all 6 planet profiles in Profiles to unlock Orbits. Then arrange Mercury through Saturn into the solar system list and run the orbital simulation!',
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: EARTH_2_UNIFIED_OBJECTIVES,
  },
];
