import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { LevelSection } from '@/components/BlocklyMaze';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Saturn2CaseMappings {
  ice: number | null; // 1, 2, 3, 4
  rock: number | null; // 1, 2, 3, 4
  metal: number | null; // 1, 2, 3, 4 (Minerals)
  crystal?: number | null; // 1, 2, 3, 4 (Crystals)
  shieldActivated: boolean;
  ufoGreeted?: boolean;
  iceAction?: 'ORBIT_1' | 'ORBIT_2' | 'ORBIT_3' | 'ORBIT_4' | 'ACTIVATE_SHIELD' | null;
  rockAction?: 'ORBIT_1' | 'ORBIT_2' | 'ORBIT_3' | 'ORBIT_4' | 'ACTIVATE_SHIELD' | null;
  metalAction?: 'ORBIT_1' | 'ORBIT_2' | 'ORBIT_3' | 'ORBIT_4' | 'ACTIVATE_SHIELD' | null;
  crystalAction?: 'ORBIT_1' | 'ORBIT_2' | 'ORBIT_3' | 'ORBIT_4' | 'ACTIVATE_SHIELD' | null;
  asteroidAction?: 'ORBIT_1' | 'ORBIT_2' | 'ORBIT_3' | 'ORBIT_4' | 'ACTIVATE_SHIELD' | null;
}

export interface Saturn2SwitchConfig {
  melter: string | null;
  crusher: string | null;
  magnet: string | null;
}

export interface Saturn2ValidationResult {
  hasStart: boolean;
  hasEnd: boolean;
  hasShield: boolean;
  hasGreetUfo?: boolean;
  hasRouteProto?: boolean;
  hasShieldProto?: boolean;
  caseMappings: Saturn2CaseMappings;
  // Legacy compatibility fields
  hasForLoop: boolean;
  hasSwitch: boolean;
  switchConfig: Saturn2SwitchConfig;
  allSlotsFilled: boolean;
  hasDuplicates: boolean;
  duplicateMaterial?: string;
  isAllCorrect: boolean;
  cppCode: string;
  validationError?: string;
}

export const INITIAL_SATURN_2_VALIDATION: Saturn2ValidationResult = {
  hasStart: false,
  hasEnd: false,
  hasShield: false,
  hasGreetUfo: false,
  hasRouteProto: false,
  hasShieldProto: false,
  caseMappings: { ice: null, rock: null, metal: null, crystal: null, shieldActivated: false, ufoGreeted: false },
  hasForLoop: false,
  hasSwitch: false,
  switchConfig: { melter: null, crusher: null, magnet: null },
  allSlotsFilled: false,
  hasDuplicates: false,
  isAllCorrect: false,
  cppCode: '',
};

// =============================================================================
// CUSTOM BLOCK DEFINITIONS (Section 3 of Moon Level 3 Format & C++)
// =============================================================================

export function registerSaturnLevel2Blocks() {
  if (typeof window === 'undefined') return;

  // 1. START PROGRAM (C++ int main)
  Blockly.Blocks['saturn2_start'] = {
    init: function () {
      this.appendDummyInput().appendField('Start');
      this.setPreviousStatement(false);
      this.setNextStatement(true, null);
      this.setColour('#EF4444'); // Red event cap
      this.setTooltip('Starts the C++ program (int main() {)');
    },
  };

  javascriptGenerator.forBlock['saturn2_start'] = function () {
    return 'int main() {\n';
  };

  // 2. END PROGRAM (C++ return 0)
  Blockly.Blocks['saturn2_end'] = {
    init: function () {
      this.appendDummyInput().appendField('End');
      this.setPreviousStatement(true, null);
      this.setNextStatement(false);
      this.setColour('#EF4444'); // Red event shoe
      this.setTooltip('Ends the C++ program successfully (return 0; })');
    },
  };

  javascriptGenerator.forBlock['saturn2_end'] = function () {
    return '    return 0;\n}\n';
  };

  // 2b. FUNCTION PROTOTYPES (Functions Category - Placed before main)
  Blockly.Blocks['saturn2_func_route_orbit'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Declare Function: Route to Orbit');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#8B5CF6'); // Purple for Functions
      this.setTooltip('Declares the routeToOrbit function prototype before main() in C++ (void routeToOrbit(int orbitNumber);)');
    },
  };

  javascriptGenerator.forBlock['saturn2_func_route_orbit'] = function () {
    return 'void routeToOrbit(int orbitNumber);\n';
  };

  Blockly.Blocks['saturn2_func_activate_shield'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Declare Function: Activate Shield');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#8B5CF6'); // Purple for Functions
      this.setTooltip('Declares the activateShield function prototype before main() in C++ (void activateShield();)');
    },
  };

  javascriptGenerator.forBlock['saturn2_func_activate_shield'] = function () {
    return 'void activateShield();\n';
  };

  // 3. CASE BLOCK (Matching Section 3 of Moon Level 3)
  Blockly.Blocks['saturn2_case'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Case')
        .appendField(
          new Blockly.FieldDropdown([
            ['Mineral Debris', 'MINERAL'],
            ['Big Asteroid', 'BIG_ASTEROID'],
            ['Ice Debris', 'ICE'],
            ['Crystal Debris', 'CRYSTAL'],
            ['Rock Debris', 'ROCK'],
          ]),
          'TARGET'
        );
      this.appendStatementInput('DO').setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#3B82F6'); // Blue for Case situation handlers
      this.setTooltip('Choose what to do when this space object or hazard is detected.');
    },
  };

  javascriptGenerator.forBlock['saturn2_case'] = function (block: Blockly.Block) {
    const target = block.getFieldValue('TARGET');
    const branch = javascriptGenerator.statementToCode(block, 'DO') || '';
    return `    case ObjectType::${target}:\n${branch}        break;\n`;
  };

  // 4. ACTION: ROUTE TO ORBIT (DROPDOWN)
  Blockly.Blocks['saturn2_route_orbit'] = {
    init: function () {
      const dropdown = new Blockly.FieldDropdown(() => [
        ['Orbit 1', '1'],
        ['Orbit 2', '2'],
        ['Orbit 3', '3'],
        ['Orbit 4', '4'],
      ]);
      (dropdown as any).prefixField = null;
      (dropdown as any).suffixField = null;

      this.appendDummyInput()
        .appendField('Route to')
        .appendField(dropdown, 'ORBIT');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EC4899'); // Pink action block
      this.setTooltip('Guide the debris into the selected orbit ring.');
    },
  };

  javascriptGenerator.forBlock['saturn2_route_orbit'] = function (block: Blockly.Block) {
    const orbit = block.getFieldValue('ORBIT') || '1';
    return `        routeToOrbit(${orbit});\n`;
  };

  // Legacy compatibility aliases
  Blockly.Blocks['action_route_orbit'] = Blockly.Blocks['saturn2_route_orbit'];
  javascriptGenerator.forBlock['action_route_orbit'] = javascriptGenerator.forBlock['saturn2_route_orbit'];

  // Legacy individual orbit blocks for backward compatibility with saved workspaces
  Blockly.Blocks['saturn2_route_orbit_1'] = {
    init: function () {
      this.appendDummyInput().appendField('Route to Orbit 1');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EC4899');
      this.setTooltip('Guide the debris into Orbit 1.');
    },
  };
  javascriptGenerator.forBlock['saturn2_route_orbit_1'] = function () {
    return '        routeToOrbit(1);\n';
  };

  Blockly.Blocks['saturn2_route_orbit_2'] = {
    init: function () {
      this.appendDummyInput().appendField('Route to Orbit 2');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EC4899');
      this.setTooltip('Guide the debris into Orbit 2.');
    },
  };
  javascriptGenerator.forBlock['saturn2_route_orbit_2'] = function () {
    return '        routeToOrbit(2);\n';
  };

  Blockly.Blocks['saturn2_route_orbit_3'] = {
    init: function () {
      this.appendDummyInput().appendField('Route to Orbit 3');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EC4899');
      this.setTooltip('Guide the debris into Orbit 3.');
    },
  };
  javascriptGenerator.forBlock['saturn2_route_orbit_3'] = function () {
    return '        routeToOrbit(3);\n';
  };

  Blockly.Blocks['saturn2_route_orbit_4'] = {
    init: function () {
      this.appendDummyInput().appendField('Route to Orbit 4');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EC4899');
      this.setTooltip('Guide into Orbit 4 (Reserved ring).');
    },
  };
  javascriptGenerator.forBlock['saturn2_route_orbit_4'] = function () {
    return '        routeToOrbit(4);\n';
  };

  // 8. ACTION: ACTIVATE SHIELD (Matching Moon Level 3 Section 3)
  Blockly.Blocks['saturn2_activate_shield'] = {
    init: function () {
      this.appendDummyInput().appendField('Activate Shield');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EC4899');
      this.setTooltip('Activate the starship energy shield to deflect incoming massive asteroids!');
    },
  };

  javascriptGenerator.forBlock['saturn2_activate_shield'] = function () {
    return '        activateShield();\n';
  };

  // Legacy compatibility aliases
  Blockly.Blocks['saturn2_enable_shield'] = Blockly.Blocks['saturn2_activate_shield'];
  javascriptGenerator.forBlock['saturn2_enable_shield'] = javascriptGenerator.forBlock['saturn2_activate_shield'];
  Blockly.Blocks['saturn2_greet_ufo'] = Blockly.Blocks['saturn2_activate_shield'];
  javascriptGenerator.forBlock['saturn2_greet_ufo'] = javascriptGenerator.forBlock['saturn2_activate_shield'];

  // ===========================================================================
  // LEGACY BLOCKS FOR BACKWARD COMPATIBILITY
  // ===========================================================================
  Blockly.Blocks['saturn2_for_loop'] = {
    init: function () {
      this.appendDummyInput().appendField('repeat for each debris in queue');
      this.appendStatementInput('DO').setCheck('Statement').appendField('do');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2563EB');
    },
  };
  javascriptGenerator.forBlock['saturn2_for_loop'] = function (block: Blockly.Block) {
    const branch = javascriptGenerator.statementToCode(block, 'DO') || '';
    return `for (size_t i = 0; i < ringDebris.size(); ++i) {\n${branch}}\n`;
  };

  Blockly.Blocks['saturn2_switch'] = {
    init: function () {
      this.appendDummyInput().appendField('sort debris by material:');
      this.appendValueInput('MELTER').setCheck('material_pill').appendField('  if material is').appendField('➔ route to Orbit 1:');
      this.appendValueInput('CRUSHER').setCheck('material_pill').appendField('  if material is').appendField('➔ route to Orbit 2:');
      this.appendValueInput('MAGNET').setCheck('material_pill').appendField('  if material is').appendField('➔ route to Orbit 3:');
      this.setPreviousStatement(true, 'Statement');
      this.setNextStatement(true, 'Statement');
      this.setColour('#7C3AED');
    },
  };
  javascriptGenerator.forBlock['saturn2_switch'] = function () {
    return '';
  };

  Blockly.Blocks['material_pill_ice'] = {
    init: function () {
      this.appendDummyInput().appendField('Ice');
      this.setOutput(true, 'material_pill');
      this.setColour('#0284C7');
    },
  };
  javascriptGenerator.forBlock['material_pill_ice'] = () => ['"Ice"', 0];

  Blockly.Blocks['material_pill_rock'] = {
    init: function () {
      this.appendDummyInput().appendField('Rock');
      this.setOutput(true, 'material_pill');
      this.setColour('#D97706');
    },
  };
  javascriptGenerator.forBlock['material_pill_rock'] = () => ['"Rock"', 0];

  Blockly.Blocks['material_pill_metal'] = {
    init: function () {
      this.appendDummyInput().appendField('Metal');
      this.setOutput(true, 'material_pill');
      this.setColour('#64748B');
    },
  };
  javascriptGenerator.forBlock['material_pill_metal'] = () => ['"Metal"', 0];
}

// Auto-register blocks immediately on load/HMR in browser environment
if (typeof window !== 'undefined') {
  try {
    registerSaturnLevel2Blocks();
  } catch (e) {
    // ignore
  }
}

// =============================================================================
// WORKSPACE PARSER & AUDITOR
// =============================================================================

export function parseSaturnLevel2Workspace(
  ws: Blockly.WorkspaceSvg | null
): Saturn2ValidationResult {
  if (!ws) return INITIAL_SATURN_2_VALIDATION;

  const allBlocks = ws.getAllBlocks(false);

  // Check Start & End blocks (strict C++ level rule)
  const startBlock = allBlocks.find((b) => b.type === 'saturn2_start' || b.type === 'event_start');
  const hasStart = Boolean(startBlock);
  const hasEnd = allBlocks.some((b) => b.type === 'saturn2_end' || b.type === 'event_end');

  // Prioritize blocks connected to Start if available to prevent stray disconnected blocks from overriding
  const connectedBlocks = startBlock ? startBlock.getDescendants(false) : [];

  // Case situation handlers (Section 3 format)
  const rawCaseBlocks = allBlocks.filter((b) => b.type === 'saturn2_case' || b.type === 'case_emergency');
  // Sort so connected case blocks are evaluated first
  const caseBlocks = [...rawCaseBlocks].sort((a, b) => {
    const aConnected = connectedBlocks.includes(a);
    const bConnected = connectedBlocks.includes(b);
    if (aConnected && !bConnected) return -1;
    if (!aConnected && bConnected) return 1;
    return 0;
  });

  const caseMappings: Saturn2CaseMappings = {
    ice: null,
    rock: null,
    metal: null,
    crystal: null,
    shieldActivated: false,
    ufoGreeted: false,
  };

  const getActionFromBranch = (firstBlock: Blockly.Block | null): 'ORBIT_1' | 'ORBIT_2' | 'ORBIT_3' | 'ORBIT_4' | 'ACTIVATE_SHIELD' | null => {
    let curr = firstBlock;
    while (curr) {
      if (curr.type === 'saturn2_route_orbit' || curr.type === 'action_route_orbit') {
        const orbit = curr.getFieldValue('ORBIT') || '1';
        if (orbit === '1') return 'ORBIT_1';
        if (orbit === '2') return 'ORBIT_2';
        if (orbit === '3') return 'ORBIT_3';
        if (orbit === '4') return 'ORBIT_4';
      }
      if (curr.type === 'saturn2_route_orbit_1' || curr.type === 'action_route_orbit_1') return 'ORBIT_1';
      if (curr.type === 'saturn2_route_orbit_2' || curr.type === 'action_route_orbit_2') return 'ORBIT_2';
      if (curr.type === 'saturn2_route_orbit_3' || curr.type === 'action_route_orbit_3') return 'ORBIT_3';
      if (curr.type === 'saturn2_route_orbit_4' || curr.type === 'action_route_orbit_4') return 'ORBIT_4';
      if (curr.type === 'saturn2_activate_shield' || curr.type === 'saturn2_enable_shield' || curr.type === 'action_activate_shield' || curr.type === 'saturn2_greet_ufo') return 'ACTIVATE_SHIELD';
      curr = curr.getNextBlock();
    }
    return null;
  };

  const targetSeenCount: Record<string, number> = {};
  let duplicateTargetName: string | null = null;
  let emptyCaseTargetName: string | null = null;

  for (const cb of caseBlocks) {
    const target = cb.getFieldValue('TARGET') || cb.getFieldValue('EMERGENCY');
    const branch = cb.getInputTargetBlock('DO');
    const action = getActionFromBranch(branch);

    if (target) {
      targetSeenCount[target] = (targetSeenCount[target] || 0) + 1;
      if (targetSeenCount[target] > 1 && !duplicateTargetName) {
        duplicateTargetName = target === 'BIG_ASTEROID' ? 'Big Asteroid' : target;
      }
    }

    if (!branch && !emptyCaseTargetName && target) {
      emptyCaseTargetName = target === 'BIG_ASTEROID' ? 'Big Asteroid' : target;
    }

    if (target === 'ICE') {
      if (caseMappings.iceAction === undefined) {
        caseMappings.iceAction = action;
        if (action === 'ORBIT_1') caseMappings.ice = 1;
        else if (action === 'ORBIT_2') caseMappings.ice = 2;
        else if (action === 'ORBIT_3') caseMappings.ice = 3;
        else if (action === 'ORBIT_4') caseMappings.ice = 4;
      }
    } else if (target === 'ROCK') {
      if (caseMappings.rockAction === undefined) {
        caseMappings.rockAction = action;
        if (action === 'ORBIT_1') caseMappings.rock = 1;
        else if (action === 'ORBIT_2') caseMappings.rock = 2;
        else if (action === 'ORBIT_3') caseMappings.rock = 3;
        else if (action === 'ORBIT_4') caseMappings.rock = 4;
      }
    } else if (target === 'MINERAL' || target === 'METAL') {
      if (caseMappings.metalAction === undefined) {
        caseMappings.metalAction = action;
        if (action === 'ORBIT_1') caseMappings.metal = 1;
        else if (action === 'ORBIT_2') caseMappings.metal = 2;
        else if (action === 'ORBIT_3') caseMappings.metal = 3;
        else if (action === 'ORBIT_4') caseMappings.metal = 4;
      }
    } else if (target === 'CRYSTAL') {
      if (caseMappings.crystalAction === undefined) {
        caseMappings.crystalAction = action;
        if (action === 'ORBIT_1') caseMappings.crystal = 1;
        else if (action === 'ORBIT_2') caseMappings.crystal = 2;
        else if (action === 'ORBIT_3') caseMappings.crystal = 3;
        else if (action === 'ORBIT_4') caseMappings.crystal = 4;
      }
    } else if (target === 'BIG_ASTEROID' || target === 'ASTEROID' || target === 'FRIENDLY_UFO') {
      if (caseMappings.asteroidAction === undefined) {
        caseMappings.asteroidAction = action;
        if (action === 'ACTIVATE_SHIELD') {
          caseMappings.shieldActivated = true;
          caseMappings.ufoGreeted = true;
        }
      }
    }
  }

  // Also support legacy Switch format for backward compatibility
  const forLoopBlock = allBlocks.find((b) => b.type === 'saturn2_for_loop');
  const switchBlock = allBlocks.find((b) => b.type === 'saturn2_switch');
  const hasForLoop = !!forLoopBlock || hasStart;
  const hasSwitch = !!switchBlock || caseBlocks.length > 0;

  const legacyConfig: Saturn2SwitchConfig = {
    melter: null,
    crusher: null,
    magnet: null,
  };

  if (switchBlock) {
    const melterBlock = switchBlock.getInputTargetBlock('MELTER');
    const crusherBlock = switchBlock.getInputTargetBlock('CRUSHER');
    const magnetBlock = switchBlock.getInputTargetBlock('MAGNET');
    const getPill = (b: Blockly.Block | null) => {
      if (!b) return null;
      if (b.type === 'material_pill_ice') return 'Ice';
      if (b.type === 'material_pill_rock') return 'Rock';
      if (b.type === 'material_pill_metal') return 'Metal';
      return null;
    };
    legacyConfig.melter = getPill(melterBlock);
    legacyConfig.crusher = getPill(crusherBlock);
    legacyConfig.magnet = getPill(magnetBlock);

    if (legacyConfig.melter === 'Ice') caseMappings.ice = 1;
    if (legacyConfig.crusher === 'Rock') caseMappings.rock = 2;
    if (legacyConfig.magnet === 'Metal') caseMappings.metal = 3;
  } else {
    // Map new case config back to legacy for simulation engine compatibility
    if (caseMappings.ice === 1) legacyConfig.melter = 'Ice';
    if (caseMappings.rock === 2) legacyConfig.crusher = 'Rock';
    if (caseMappings.metal === 3) legacyConfig.magnet = 'Metal';
  }

  // Check whether all required cases are configured
  const hasIceCase = caseMappings.ice !== null;
  const hasRockCase = caseMappings.rock !== null;
  const hasMetalCase = caseMappings.metal !== null;
  const hasCrystalCase = caseMappings.crystal !== null;
  const allSlotsFilled = hasIceCase && hasRockCase && hasMetalCase && hasCrystalCase;

  // Check for duplicate lane assignments across materials
  const assignedLanes = [caseMappings.ice, caseMappings.rock, caseMappings.metal, caseMappings.crystal].filter(Boolean) as number[];
  const uniqueLanes = new Set(assignedLanes);
  const hasDuplicates = assignedLanes.length !== uniqueLanes.size;

  // Check function prototypes
  const hasRouteProto = allBlocks.some((b) => b.type === 'saturn2_func_route_orbit');
  const hasShieldProto = allBlocks.some((b) => b.type === 'saturn2_func_activate_shield');

  // Correctness rule:
  // 1. Has Start and End
  // 2. Ice -> Orbit 1
  // 3. Rock -> Orbit 2
  // 4. Mineral -> Orbit 3
  // 5. Crystal -> Orbit 4
  // 6. Big Asteroid -> Activate Shield
  const hasShield = Boolean(caseMappings.asteroidAction === 'ACTIVATE_SHIELD' || caseMappings.shieldActivated || caseMappings.ufoGreeted);
  const isAllCorrect =
    hasStart &&
    hasEnd &&
    hasRouteProto &&
    hasShieldProto &&
    caseMappings.ice === 1 &&
    caseMappings.rock === 2 &&
    caseMappings.metal === 3 &&
    caseMappings.crystal === 4 &&
    hasShield;

  // Check for misconfigured shield on debris
  const debrisWithShield =
    caseMappings.iceAction === 'ACTIVATE_SHIELD'
      ? 'Ice'
      : caseMappings.rockAction === 'ACTIVATE_SHIELD'
      ? 'Rock'
      : caseMappings.metalAction === 'ACTIVATE_SHIELD'
      ? 'Mineral'
      : caseMappings.crystalAction === 'ACTIVATE_SHIELD'
      ? 'Crystal'
      : null;

  // Check if asteroid was misrouted to an orbit ring
  const asteroidRoutedToOrbit =
    caseMappings.asteroidAction && caseMappings.asteroidAction !== 'ACTIVATE_SHIELD';

  // Friendly validation error messages (no overly dense technical jargon)
  let validationError: string | undefined;
  if (!hasStart) {
    validationError = "PROGRAM NOTICE: Every program needs a 'Start' block to run.";
  } else if (!hasRouteProto && !hasShieldProto) {
    validationError = "MISSING FUNCTIONS: Please add the 'Declare Function' blocks.";
  } else if (!hasRouteProto) {
    validationError = "MISSING FUNCTION: Please add 'Declare Function: Route to Orbit'.";
  } else if (!hasShieldProto) {
    validationError = "MISSING FUNCTION: Please add 'Declare Function: Activate Shield'.";
  } else if (emptyCaseTargetName) {
    validationError = `EMPTY CASE BLOCK: The 'Case ${emptyCaseTargetName}' block has no action inside. Connect an action block.`;
  } else if (duplicateTargetName) {
    validationError = `DUPLICATE CASE: Found multiple Case blocks for ${duplicateTargetName}. In C++, each case in a switch statement must be unique.`;
  } else if (asteroidRoutedToOrbit) {
    validationError = "HAZARD ROUTING ERROR: Massive asteroids cannot be placed into planetary orbits! Use 'Activate Shield' to deflect them.";
  } else if (debrisWithShield) {
    validationError = `SHIELD MISCONFIGURED: 'Activate Shield' is assigned to ${debrisWithShield} Debris! Shields vaporize debris instead of sorting them. Route debris to an orbit, and only shield against Big Asteroids.`;
  } else if (!allSlotsFilled) {
    validationError = "CASE ALERT: Make sure you have Case blocks for each space debris item (Ice, Rock, Mineral, Crystal).";
  } else if (hasDuplicates) {
    validationError = "ORBIT OVERLAP: Two different materials are routed into the same orbit.";
  } else if (!hasShield) {
    validationError = "DEFENSE ALERT: No energy shield configured for incoming Massive Asteroids. Add a 'Case Big Asteroid' with 'Activate Shield'.";
  } else if (!hasEnd) {
    validationError = "PROGRAM NOTICE: Every C++ program must conclude with an 'End' block (return 0; }).";
  }

  const protoLines: string[] = [];
  if (hasRouteProto) {
    protoLines.push('void routeToOrbit(int orbitNumber);');
  }
  if (hasShieldProto) {
    protoLines.push('void activateShield();');
  }

  const cppCode = [
    '#include <iostream>',
    '#include <string>',
    ...(protoLines.length > 0 ? ['', '// Saturn Ring Debris & Hazard Defense', ...protoLines] : []),
    '',
    'int main() {',
    '    // Listen for incoming space objects & hazards',
    '    switch (detectedObject) {',
    `        case ObjectType::ICE:`,
    caseMappings.iceAction === 'ACTIVATE_SHIELD'
      ? '            activateShield();'
      : caseMappings.ice !== null
      ? `            routeToOrbit(${caseMappings.ice});`
      : '            // Add Route to Orbit block',
    '            break;',
    `        case ObjectType::ROCK:`,
    caseMappings.rockAction === 'ACTIVATE_SHIELD'
      ? '            activateShield();'
      : caseMappings.rock !== null
      ? `            routeToOrbit(${caseMappings.rock});`
      : '            // Add Route to Orbit block',
    '            break;',
    `        case ObjectType::MINERAL:`,
    caseMappings.metalAction === 'ACTIVATE_SHIELD'
      ? '            activateShield();'
      : caseMappings.metal !== null
      ? `            routeToOrbit(${caseMappings.metal});`
      : '            // Add Route to Orbit block',
    '            break;',
    `        case ObjectType::CRYSTAL:`,
    caseMappings.crystalAction === 'ACTIVATE_SHIELD'
      ? '            activateShield();'
      : caseMappings.crystal !== null
      ? `            routeToOrbit(${caseMappings.crystal});`
      : '            // Add Route to Orbit block',
    '            break;',
    `        case ObjectType::BIG_ASTEROID:`,
    caseMappings.asteroidAction === 'ACTIVATE_SHIELD'
      ? '            activateShield();'
      : caseMappings.asteroidAction
      ? `            routeToOrbit(${caseMappings.asteroidAction.replace('ORBIT_', '')}); // Error: cannot orbit asteroid!`
      : '            // Defend starship with shield',
    '            break;',
    '        default:',
    '            break;',
    '    }',
    '    return 0;',
    '}',
  ].join('\n');

  return {
    hasStart,
    hasEnd,
    hasShield,
    hasRouteProto,
    hasShieldProto,
    hasGreetUfo: hasShield,
    caseMappings,
    hasForLoop,
    hasSwitch,
    switchConfig: legacyConfig,
    allSlotsFilled,
    hasDuplicates,
    isAllCorrect,
    cppCode,
    validationError,
  };
}

// =============================================================================
// TOOLBOX DEFINITIONS (Matching Section 3 of Moon Level 3 format)
// =============================================================================

export function getSaturnLevel2Toolbox() {
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Events',
        colour: '#EF4444',
        contents: [
          { kind: 'block', type: 'saturn2_start' },
          { kind: 'block', type: 'saturn2_end' },
        ],
      },
      {
        kind: 'category',
        name: 'Functions',
        colour: '#8B5CF6',
        contents: [
          { kind: 'block', type: 'saturn2_func_route_orbit' },
          { kind: 'block', type: 'saturn2_func_activate_shield' },
        ],
      },
      {
        kind: 'category',
        name: 'Cases',
        colour: '#3B82F6',
        contents: [
          { kind: 'block', type: 'saturn2_case' },
        ],
      },
      {
        kind: 'category',
        name: 'Actions',
        colour: '#EC4899',
        contents: [
          { kind: 'block', type: 'saturn2_route_orbit' },
          { kind: 'block', type: 'saturn2_activate_shield' },
        ],
      },
    ],
  };
}

// Default clean workspace startup XML (Start -> Case Ice -> Orbit 1 -> End)
export function getSaturnLevel2DefaultWorkspaceXml(): string {
  return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
}

// =============================================================================
// OBJECTIVES & SECTIONS
// =============================================================================

export const SATURN_2_OBJECTIVES = [
  { id: 1, text: 'Initialize C++ Program with Start and End', completed: false, isClaimed: false },
  { id: 2, text: 'Activate Energy Shield against big asteroids', completed: false, isClaimed: false },
  { id: 3, text: 'Restore orbital ring balance', completed: false, isClaimed: false },
];

export const SATURN_2_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: 'Jumpstarting the Rings',
    subtag: 'Cases & Hazard Defense',
    desc: "Saturn's rings are jammed with wandering space items! Program your spaceship with Start, End, and Case responses to route debris to the right orbits and activate energy shields against incoming massive asteroids.",
    tip: "Check the Ring Placements guide in the top right and configure each Case block accordingly.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: SATURN_2_OBJECTIVES,
  },
];
