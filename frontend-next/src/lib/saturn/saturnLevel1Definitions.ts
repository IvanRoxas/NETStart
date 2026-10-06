/**
 * Saturn Level 1: CIN and COUT
 * C++ Stream Architecture translated into intuitive puzzle blocks
 * All puzzle blocks in the toolbox are required to build the multi-type terminal.
 */

import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

export interface SaturnWorkspaceState {
  hasStart: boolean;
  hasStringStorage: boolean;
  hasIntStorage: boolean;
  hasBoolStorage: boolean;
  hasLoop: boolean;
  hasCin: boolean;
  hasCout: boolean;
  hasEnd: boolean;
  isComplete: boolean;
  isCinInLoop?: boolean;
  isCoutInLoop?: boolean;
  isCinBeforeCout?: boolean;
  areStorageBlocksBeforeLoop?: boolean;
  isEndAfterLoop?: boolean;
  // Backward compatibility
  hasStorage?: boolean;
  storageType?: string;
  hasVar?: boolean;
}

export const INITIAL_SATURN_WORKSPACE: SaturnWorkspaceState = {
  hasStart: false,
  hasStringStorage: false,
  hasIntStorage: false,
  hasBoolStorage: false,
  hasLoop: false,
  hasCin: false,
  hasCout: false,
  hasEnd: false,
  isComplete: false,
  hasStorage: false,
  storageType: 'string',
  hasVar: false,
};

export type SaturnErrorType =
  | 'EMPTY'
  | 'MISSING_START'
  | 'MISSING_STORAGE'
  | 'MISSING_STRING_STORAGE'
  | 'MISSING_INT_STORAGE'
  | 'MISSING_BOOL_STORAGE'
  | 'MISSING_LOOP'
  | 'MISSING_CIN'
  | 'MISSING_COUT'
  | 'MISSING_END'
  | 'CIN_OUTSIDE_LOOP'
  | 'COUT_OUTSIDE_LOOP'
  | 'STREAM_ORDER_INVALID'
  | 'STORAGE_AFTER_LOOP'
  | 'END_BEFORE_LOOP'
  | 'DISCONNECTED_BLOCKS'
  | null;

export interface SaturnValidationResult {
  isValid: boolean;
  errorType: SaturnErrorType;
  errorMessage?: string;
  novaMessage?: string;
  hasStart: boolean;
  hasStringStorage: boolean;
  hasIntStorage: boolean;
  hasBoolStorage: boolean;
  hasLoop: boolean;
  hasCin: boolean;
  hasCout: boolean;
  hasEnd: boolean;
  hasFullPipeline: boolean;
  isCorrectType: boolean;
  cppCode?: string;
  hasStorage?: boolean;
  hasVar?: boolean;
}

export const SATURN_LEVEL_1_WAVES: Record<number, { name: string; dataType: string; sensorDataLabel: string }> = {
  1: { name: 'Cockpit Terminal', dataType: 'multitype', sensorDataLabel: 'I/O STREAMS' },
};

export const INITIAL_SATURN_LEVEL_1_VALIDATION: SaturnValidationResult = {
  isValid: false,
  errorType: null,
  hasStart: false,
  hasStringStorage: false,
  hasIntStorage: false,
  hasBoolStorage: false,
  hasLoop: false,
  hasCin: false,
  hasCout: false,
  hasEnd: false,
  hasFullPipeline: false,
  isCorrectType: true,
  cppCode: '',
};

// =============================================================================
// CHALLENGE DATA: TEXT, NUMBERS, & OPINION QUESTIONS
// =============================================================================

export interface WordBankItem {
  word: string;
  reaction: string;
}

export const SATURN_TEXT_BANK: WordBankItem[] = [
  { word: 'SATURN', reaction: 'Approaching Saturn!' },
  { word: 'REBOOT', reaction: 'Station rebooted!' },
  { word: 'SIGNAL', reaction: 'Signal received!' },
  { word: 'ORBIT', reaction: 'Entering orbit!' },
  { word: 'ENERGY', reaction: 'Power restored!' },
  { word: 'CORE', reaction: 'Reactor active!' },
  { word: 'PLASMA', reaction: 'Plasma glowing!' },
  { word: 'THRUST', reaction: 'Rockets fired!' },
  { word: 'SYSTEM', reaction: 'All systems working!' },
  { word: 'SHIELD', reaction: 'Shields raised!' },
  { word: 'RADAR', reaction: 'Scanning space!' },
  { word: 'LASER', reaction: 'Laser beam fired!' },
  { word: 'ROCKET', reaction: 'Engine boosters active!' },
  { word: 'GRAVITY', reaction: 'Stabilizing gravity drive!' },
  { word: 'BEACON', reaction: 'Navigation beacon locked!' },
  { word: 'GALAXY', reaction: 'Starlight path mapped!' },
  { word: 'COMET', reaction: 'Comet tail tracked!' },
  { word: 'NEBULA', reaction: 'Gas cloud sampled!' },
  { word: 'ASTEROID', reaction: 'Deflector grid engaged!' },
  { word: 'TITAN', reaction: 'Moon Titan in sight!' },
];

export interface SaturnMathQuestion {
  display: string;
  answer: string;
  reaction: string;
}

export const SATURN_MATH_BANK: SaturnMathQuestion[] = [
  { display: '8 + 4 = ?', answer: '12', reaction: 'Sensor calibrated: 12 MHz!' },
  { display: '5 x 6 = ?', answer: '30', reaction: 'Sensor calibrated: 30 GHz!' },
  { display: '50 - 8 = ?', answer: '42', reaction: 'Sensor calibrated: 42 kPa!' },
  { display: '20 x 5 = ?', answer: '100', reaction: 'Sensor calibrated: 100 kW!' },
  { display: '9 x 7 = ?', answer: '63', reaction: 'Sensor calibrated: 63 rad!' },
  { display: '100 / 4 = ?', answer: '25', reaction: 'Sensor calibrated: 25 LUX!' },
  { display: '8 x 8 = ?', answer: '64', reaction: 'Sensor calibrated: 64 PSI!' },
  { display: '45 + 54 = ?', answer: '99', reaction: 'Sensor calibrated: 99 rpm!' },
  { display: '14 + 16 = ?', answer: '30', reaction: 'Sensor calibrated: 30 dB!' },
  { display: '12 x 4 = ?', answer: '48', reaction: 'Sensor calibrated: 48 mA!' },
  { display: '70 - 25 = ?', answer: '45', reaction: 'Sensor calibrated: 45 Volts!' },
  { display: '6 x 6 = ?', answer: '36', reaction: 'Sensor calibrated: 36 deg!' },
  { display: '90 / 2 = ?', answer: '45', reaction: 'Sensor calibrated: 45 Hz!' },
  { display: '15 + 35 = ?', answer: '50', reaction: 'Sensor calibrated: 50 Amps!' },
  { display: '11 x 7 = ?', answer: '77', reaction: 'Sensor calibrated: 77 bar!' },
  { display: '200 - 80 = ?', answer: '120', reaction: 'Sensor calibrated: 120 Kelvin!' },
  { display: '3 x 25 = ?', answer: '75', reaction: 'Sensor calibrated: 75 m/s!' },
  { display: '60 / 3 = ?', answer: '20', reaction: 'Sensor calibrated: 20 ohms!' },
  { display: '18 + 22 = ?', answer: '40', reaction: 'Sensor calibrated: 40 Tesla!' },
  { display: '9 x 9 = ?', answer: '81', reaction: 'Sensor calibrated: 81 lumens!' },
];

export const SATURN_NUMBER_BANK = SATURN_MATH_BANK.map((m) => m.answer);

export interface SaturnBoolQuestion {
  question: string;
  answer: boolean;
  reaction: string;
  trueResponse?: string;
  falseResponse?: string;
}

export type OpinionQuestion = SaturnBoolQuestion;

export const SATURN_QUESTIONS: SaturnBoolQuestion[] = [
  {
    question: 'Is the Sun a star?',
    answer: true,
    reaction: 'Correct! The Sun is our nearest star.',
    trueResponse: 'Correct! The Sun is our nearest star.',
    falseResponse: 'The Sun is indeed a star!',
  },
  {
    question: 'Does the Earth orbit around the Moon?',
    answer: false,
    reaction: 'Correct! The Moon orbits the Earth, not vice versa.',
    trueResponse: 'The Moon actually orbits the Earth!',
    falseResponse: 'Correct! The Moon orbits the Earth.',
  },
  {
    question: 'Is Saturn famous for its giant rings?',
    answer: true,
    reaction: 'Correct! Saturn has majestic rings of ice and rock.',
    trueResponse: 'Correct! Saturn has majestic rings.',
    falseResponse: 'Saturn is famous for its rings!',
  },
  {
    question: 'Is Mars known as the Red Planet?',
    answer: true,
    reaction: 'Correct! Iron oxide gives Mars its reddish color.',
    trueResponse: 'Correct! Mars is the Red Planet.',
    falseResponse: 'Mars is definitely the Red Planet!',
  },
  {
    question: 'Is the Moon larger than the Earth?',
    answer: false,
    reaction: 'Correct! Earth is about four times wider than the Moon.',
    trueResponse: 'Earth is actually much larger than the Moon!',
    falseResponse: 'Correct! Earth is much bigger than the Moon.',
  },
  {
    question: 'Can astronauts breathe in space without a helmet?',
    answer: false,
    reaction: 'Correct! Space is a vacuum with no breathable air.',
    trueResponse: 'Space has no air—helmets are required!',
    falseResponse: 'Correct! Space has no breathable air.',
  },
  {
    question: 'Is Jupiter the largest planet in our solar system?',
    answer: true,
    reaction: 'Correct! Jupiter is the biggest gas giant.',
    trueResponse: 'Correct! Jupiter is the biggest planet.',
    falseResponse: 'Jupiter is indeed the largest planet!',
  },
  {
    question: 'Does Saturn have only one moon?',
    answer: false,
    reaction: 'Correct! Saturn has more than 140 known moons.',
    trueResponse: 'Saturn has over 140 known moons!',
    falseResponse: 'Correct! Saturn has dozens of moons.',
  },
  {
    question: 'Is Earth the third planet from the Sun?',
    answer: true,
    reaction: 'Correct! Mercury, Venus, Earth.',
    trueResponse: 'Correct! Earth is third from the Sun.',
    falseResponse: 'Earth is the third planet!',
  },
  {
    question: 'Is outer space completely silent?',
    answer: true,
    reaction: 'Correct! Sound cannot travel through empty space.',
    trueResponse: 'Correct! There is no sound in a vacuum.',
    falseResponse: 'Sound cannot travel without air in space!',
  },
  {
    question: 'Is Venus hotter than Mars?',
    answer: true,
    reaction: 'Correct! Venus has a thick super-hot atmosphere.',
    trueResponse: 'Correct! Venus is extremely hot.',
    falseResponse: 'Venus is much hotter than cold Mars!',
  },
  {
    question: 'Is the daytime sky on the Moon blue like Earth?',
    answer: false,
    reaction: 'Correct! With no atmosphere, the Moon sky is black.',
    trueResponse: 'The Moon sky is always black!',
    falseResponse: 'Correct! The Moon sky is black day and night.',
  },
  {
    question: 'Does a comet have a glowing tail near the Sun?',
    answer: true,
    reaction: 'Correct! Solar heat vaporizes ice into a glowing tail.',
    trueResponse: 'Correct! Comets have glowing tails.',
    falseResponse: 'Comets do develop glowing tails near the Sun!',
  },
  {
    question: 'Is Pluto officially classified as a dwarf planet?',
    answer: true,
    reaction: 'Correct! Pluto was reclassified as a dwarf planet.',
    trueResponse: 'Correct! Pluto is a dwarf planet.',
    falseResponse: 'Pluto is classified as a dwarf planet!',
  },
  {
    question: 'Does gravity keep planets orbiting around the Sun?',
    answer: true,
    reaction: 'Correct! Gravity holds planets in stable orbits.',
    trueResponse: 'Correct! Solar gravity holds orbits.',
    falseResponse: 'Solar gravity is what keeps planets in orbit!',
  },
  {
    question: 'Is Neptune closer to the Sun than Earth is?',
    answer: false,
    reaction: 'Correct! Neptune is the eighth and farthest planet.',
    trueResponse: 'Neptune is much farther away than Earth!',
    falseResponse: 'Correct! Neptune is far out in the solar system.',
  },
];

// Combined bank for backward compatibility
export const SATURN_WORD_BANK: WordBankItem[] = SATURN_TEXT_BANK;

// =============================================================================
// BLOCKLY BLOCKS REGISTRATION
// =============================================================================

let blocksRegistered = false;

export function registerSaturnLevel1Blocks() {
  if (blocksRegistered) return;
  blocksRegistered = true;

  // ---------------------------------------------------------------------------
  // 1. Start Program
  // ---------------------------------------------------------------------------
  Blockly.Blocks['saturn_main_start'] = {
    init: function () {
      this.appendDummyInput().appendField('Start Program');
      this.setNextStatement(true, null);
      this.setColour('#EF4444'); // Vibrant Red
      this.setTooltip('Starts the C++ program: int main() {');
    },
  };
  javascriptGenerator.forBlock['saturn_main_start'] = function () {
    return 'int main() {\n';
  };

  // ---------------------------------------------------------------------------
  // 2. Create Storage Blocks (Text, Number, Choice) - Distinct Shades
  // ---------------------------------------------------------------------------
  Blockly.Blocks['saturn_create_string'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Create Text Storage (string textWord)')
        .appendField(';');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#9333EA'); // Vibrant Purple
      this.setTooltip('Declare text storage for incoming words: string textWord;');
    },
  };
  javascriptGenerator.forBlock['saturn_create_string'] = function () {
    return '    string textWord;\n';
  };

  Blockly.Blocks['saturn_create_int'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Create Number Storage (int sensorNum)')
        .appendField(';');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0284C7'); // Vivid Sky Blue
      this.setTooltip('Declare number storage for sensor readings: int sensorNum;');
    },
  };
  javascriptGenerator.forBlock['saturn_create_int'] = function () {
    return '    int sensorNum;\n';
  };

  Blockly.Blocks['saturn_create_bool'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Create Choice Storage (bool userChoice)')
        .appendField(';');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EAB308'); // Bright Golden Yellow
      this.setTooltip('Declare choice storage for yes/no responses: bool userChoice;');
    },
  };
  javascriptGenerator.forBlock['saturn_create_bool'] = function () {
    return '    bool userChoice;\n';
  };

  // Backward-compatibility aliases
  Blockly.Blocks['saturn_create_storage'] = Blockly.Blocks['saturn_create_string'];
  javascriptGenerator.forBlock['saturn_create_storage'] = javascriptGenerator.forBlock['saturn_create_string'];

  Blockly.Blocks['saturn_declare_string'] = Blockly.Blocks['saturn_create_string'];
  javascriptGenerator.forBlock['saturn_declare_string'] = javascriptGenerator.forBlock['saturn_create_string'];

  // ---------------------------------------------------------------------------
  // 5. Loop: Repeat While Receiving Input
  // ---------------------------------------------------------------------------
  Blockly.Blocks['saturn_stream_loop'] = {
    init: function () {
      this.appendDummyInput().appendField('Repeat While Receiving Input');
      this.appendStatementInput('DO').setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0891B2'); // Cyan / Deep Teal
      this.setTooltip('Keeps reading while the user sends inputs: while (cin >> input) { ... }');
    },
  };
  javascriptGenerator.forBlock['saturn_stream_loop'] = function (block: Blockly.Block) {
    const branch = javascriptGenerator.statementToCode(block, 'DO') || '';
    return `    while (cin >> textWord) {\n${branch}    }\n`;
  };

  // ---------------------------------------------------------------------------
  // 6. Input Stream: Read Keyboard (cin >>)
  // ---------------------------------------------------------------------------
  Blockly.Blocks['saturn_read_cin'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Read Keyboard (cin >>)')
        .appendField(';');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#16A34A'); // Kelly Green
      this.setTooltip('Read keyboard input into storage: cin >> input;');
    },
  };
  javascriptGenerator.forBlock['saturn_read_cin'] = function () {
    return '    cin >> textWord;\n';
  };

  // ---------------------------------------------------------------------------
  // 7. Output Stream: Print Screen (cout <<)
  // ---------------------------------------------------------------------------
  Blockly.Blocks['saturn_print_cout'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Print Screen (cout <<)')
        .appendField(';');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EA580C'); // Vibrant Orange
      this.setTooltip('Display the data on the screen: cout << output << endl;');
    },
  };
  javascriptGenerator.forBlock['saturn_print_cout'] = function () {
    return '    cout << textWord << endl;\n';
  };

  // ---------------------------------------------------------------------------
  // 8. End Program
  // ---------------------------------------------------------------------------
  Blockly.Blocks['saturn_main_end'] = {
    init: function () {
      this.appendDummyInput().appendField('End Program');
      this.setPreviousStatement(true, null);
      this.setColour('#EF4444'); // Vibrant Red (matching Start Program)
      this.setTooltip('End program execution successfully: return 0; }');
    },
  };
  javascriptGenerator.forBlock['saturn_main_end'] = function () {
    return '    return 0;\n}\n';
  };

  // Extra aliases
  Blockly.Blocks['saturn_cin_word'] = Blockly.Blocks['saturn_read_cin'];
  Blockly.Blocks['saturn_cout_word'] = Blockly.Blocks['saturn_print_cout'];
}

// =============================================================================
// TOOLBOX DEFINITIONS (All 8 blocks required)
// =============================================================================

export function getSaturnLevel1Toolbox() {
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Program',
        colour: '#EF4444',
        contents: [
          { kind: 'block', type: 'saturn_main_start' },
          { kind: 'block', type: 'saturn_main_end' },
        ],
      },
      {
        kind: 'category',
        name: 'Storage',
        colour: '#9333EA',
        contents: [
          { kind: 'block', type: 'saturn_create_string' },
          { kind: 'block', type: 'saturn_create_int' },
          { kind: 'block', type: 'saturn_create_bool' },
        ],
      },
      {
        kind: 'category',
        name: 'Streams',
        colour: '#16A34A',
        contents: [
          { kind: 'block', type: 'saturn_stream_loop' },
          { kind: 'block', type: 'saturn_read_cin' },
          { kind: 'block', type: 'saturn_print_cout' },
        ],
      },
    ],
  };
}

export function getSaturnLevel1DefaultWorkspaceXml(): string {
  return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
}

// =============================================================================
// WORKSPACE PARSER & VALIDATION (Ensures ALL toolbox blocks are used!)
// =============================================================================

export function parseSaturnLevel1Workspace(
  workspace: Blockly.WorkspaceSvg | null,
  _currentWave?: number
): { state: SaturnWorkspaceState; validation: SaturnValidationResult } {
  if (!workspace) {
    return {
      state: INITIAL_SATURN_WORKSPACE,
      validation: INITIAL_SATURN_LEVEL_1_VALIDATION,
    };
  }

  const allBlocks = workspace.getAllBlocks(false);

  const startBlock = allBlocks.find((b) => b.type === 'saturn_main_start');

  const stringStorageBlock = allBlocks.find(
    (b) => b.type === 'saturn_create_string' || b.type === 'saturn_declare_string'
  );
  const intStorageBlock = allBlocks.find((b) => b.type === 'saturn_create_int');
  const boolStorageBlock = allBlocks.find((b) => b.type === 'saturn_create_bool');
  const genericStorageBlock = allBlocks.find((b) => b.type === 'saturn_create_storage');

  const storageBlocks = allBlocks.filter(
    (b) =>
      b.type === 'saturn_create_string' ||
      b.type === 'saturn_create_int' ||
      b.type === 'saturn_create_bool' ||
      b.type === 'saturn_create_storage' ||
      b.type === 'saturn_declare_string'
  );

  const loopBlock = allBlocks.find((b) => b.type === 'saturn_stream_loop');

  const cinBlock = allBlocks.find(
    (b) =>
      b.type === 'saturn_read_cin' ||
      b.type === 'saturn_cin_word' ||
      b.type === 'saturn_cin'
  );

  const coutBlock = allBlocks.find(
    (b) =>
      b.type === 'saturn_print_cout' ||
      b.type === 'saturn_cout_word' ||
      b.type === 'saturn_cout'
  );

  const endBlock = allBlocks.find((b) => b.type === 'saturn_main_end');

  // Build the set of blocks reachable via connected chain from startBlock.
  function buildConnectedSet(start: Blockly.Block | null): Set<Blockly.Block> {
    const visited = new Set<Blockly.Block>();
    const stack: Array<Blockly.Block | null | undefined> = [start];
    while (stack.length > 0) {
      const block = stack.pop();
      if (!block || visited.has(block)) continue;
      visited.add(block);
      for (const input of block.inputList) {
        stack.push(input.connection?.targetBlock());
      }
      stack.push(block.getNextBlock());
    }
    return visited;
  }

  // Check if a target block is inside loop's DO statement input
  function isInsideLoopDo(loop: Blockly.Block | null | undefined, target: Blockly.Block | null | undefined): boolean {
    if (!loop || !target) return false;
    let curr = loop.getInputTargetBlock('DO');
    while (curr) {
      if (curr === target) return true;
      for (const input of curr.inputList) {
        const nested = input.connection?.targetBlock();
        if (nested && isInsideLoopDo(curr, target)) return true;
      }
      curr = curr.getNextBlock();
    }
    return false;
  }

  // Check if blockA appears before blockB in the loop DO branch
  function isBeforeInLoop(loop: Blockly.Block | null | undefined, blockA: Blockly.Block | null | undefined, blockB: Blockly.Block | null | undefined): boolean {
    if (!loop || !blockA || !blockB) return false;
    let curr: Blockly.Block | null = loop.getInputTargetBlock('DO');
    let seenA = false;
    while (curr) {
      if (curr === blockA) seenA = true;
      if (curr === blockB) return seenA;
      curr = curr.getNextBlock();
    }
    return false;
  }

  // Check if target appears in the main next-chain between start and stopBlock
  function appearsInChainBefore(start: Blockly.Block | null | undefined, target: Blockly.Block | null | undefined, stopBlock: Blockly.Block | null | undefined): boolean {
    if (!start || !target || !stopBlock) return false;
    let curr: Blockly.Block | null = start;
    while (curr && curr !== stopBlock) {
      if (curr === target) return true;
      curr = curr.getNextBlock();
    }
    return false;
  }

  const connectedSet = buildConnectedSet(startBlock ?? null);

  const hasStart = Boolean(startBlock);
  const hasStringStorage = (!!stringStorageBlock && connectedSet.has(stringStorageBlock)) || (!!genericStorageBlock && connectedSet.has(genericStorageBlock));
  const hasIntStorage = (!!intStorageBlock && connectedSet.has(intStorageBlock)) || (!!genericStorageBlock && connectedSet.has(genericStorageBlock));
  const hasBoolStorage = (!!boolStorageBlock && connectedSet.has(boolStorageBlock)) || (!!genericStorageBlock && connectedSet.has(genericStorageBlock));

  const hasAllStorage = hasStringStorage && hasIntStorage && hasBoolStorage;
  const hasStorage = hasAllStorage || (storageBlocks.length > 0 && storageBlocks.some((b) => connectedSet.has(b)));

  const hasLoop = !!loopBlock && connectedSet.has(loopBlock);
  const hasCin = !!cinBlock && connectedSet.has(cinBlock);
  const hasCout = !!coutBlock && connectedSet.has(coutBlock);
  const hasEnd = !!endBlock && connectedSet.has(endBlock);

  // Structural checks:
  const isCinInLoop = !cinBlock || !loopBlock ? false : isInsideLoopDo(loopBlock, cinBlock);
  const isCoutInLoop = !coutBlock || !loopBlock ? false : isInsideLoopDo(loopBlock, coutBlock);
  const isCinBeforeCout = isCinInLoop && isCoutInLoop && isBeforeInLoop(loopBlock, cinBlock, coutBlock);
  const areStorageBlocksBeforeLoop =
    !loopBlock
      ? false
      : storageBlocks.length === 0 ||
        storageBlocks.every(
          (b) => !connectedSet.has(b) || appearsInChainBefore(startBlock, b, loopBlock)
        );
  const isEndAfterLoop = !loopBlock || !endBlock ? false : appearsInChainBefore(startBlock, loopBlock, endBlock);

  // ALL components must be used and connected in valid order!
  const isComplete =
    hasStart &&
    hasAllStorage &&
    hasLoop &&
    hasCin &&
    hasCout &&
    hasEnd &&
    isCinInLoop &&
    isCoutInLoop &&
    isCinBeforeCout &&
    areStorageBlocksBeforeLoop &&
    isEndAfterLoop;

  const state: SaturnWorkspaceState = {
    hasStart,
    hasStringStorage,
    hasIntStorage,
    hasBoolStorage,
    hasLoop,
    hasCin,
    hasCout,
    hasEnd,
    isComplete,
    isCinInLoop,
    isCoutInLoop,
    isCinBeforeCout,
    areStorageBlocksBeforeLoop,
    isEndAfterLoop,
    hasStorage,
    storageType: 'multitype',
    hasVar: hasStorage,
  };

  const validation = validateSaturnLevel1(state);
  validation.cppCode = generateSaturnCppCode(state);

  return { state, validation };
}

export function validateSaturnLevel1(
  workspace: SaturnWorkspaceState
): SaturnValidationResult {
  const {
    hasStart,
    hasStorage,
    hasStringStorage,
    hasIntStorage,
    hasBoolStorage,
    hasLoop,
    hasCin,
    hasCout,
    hasEnd,
    isCinInLoop,
    isCoutInLoop,
    isCinBeforeCout,
    areStorageBlocksBeforeLoop,
    isEndAfterLoop,
  } = workspace;

  if (
    !hasStart &&
    !hasStorage &&
    !hasStringStorage &&
    !hasIntStorage &&
    !hasBoolStorage &&
    !hasLoop &&
    !hasCin &&
    !hasCout &&
    !hasEnd
  ) {
    return {
      isValid: false,
      errorType: 'EMPTY',
      errorMessage: 'Workspace is empty. Build your cockpit program using the toolbox blocks.',
      novaMessage: 'Workspace is empty. Build your cockpit program using the toolbox blocks.',
      hasStart,
      hasStorage,
      hasStringStorage,
      hasIntStorage,
      hasBoolStorage,
      hasLoop,
      hasCin,
      hasCout,
      hasEnd,
      hasFullPipeline: false,
      isCorrectType: true,
    };
  }

  if (!hasStart) {
    return {
      isValid: false,
      errorType: 'MISSING_START',
      errorMessage: 'Missing Start: Attach Start Program at the top.',
      novaMessage: 'Attach the Start Program block at the top.',
      hasStart,
      hasStorage,
      hasStringStorage,
      hasIntStorage,
      hasBoolStorage,
      hasLoop,
      hasCin,
      hasCout,
      hasEnd,
      hasFullPipeline: false,
      isCorrectType: true,
    };
  }

  if (!hasStringStorage || !hasIntStorage || !hasBoolStorage) {
    const missing: string[] = [];
    if (!hasStringStorage) missing.push('Text Storage (string)');
    if (!hasIntStorage) missing.push('Number Storage (int)');
    if (!hasBoolStorage) missing.push('Choice Storage (bool)');
    return {
      isValid: false,
      errorType: 'MISSING_STORAGE',
      errorMessage: `Missing Memory Boxes: Add ${missing.join(', ')} before the Repeat loop.`,
      novaMessage: 'Add memory boxes for words, numbers, and yes/no choices before the loop.',
      hasStart,
      hasStorage: false,
      hasStringStorage,
      hasIntStorage,
      hasBoolStorage,
      hasLoop,
      hasCin,
      hasCout,
      hasEnd,
      hasFullPipeline: false,
      isCorrectType: true,
    };
  }

  if (!hasLoop) {
    return {
      isValid: false,
      errorType: 'MISSING_LOOP',
      errorMessage: 'Missing Loop: Add Repeat While Receiving Input and connect it in the chain.',
      novaMessage: 'Add Repeat While Receiving Input to handle continuous telemetry.',
      hasStart,
      hasStringStorage,
      hasIntStorage,
      hasBoolStorage,
      hasLoop,
      hasCin,
      hasCout,
      hasEnd,
      hasFullPipeline: false,
      isCorrectType: true,
    };
  }

  if (!hasCin) {
    return {
      isValid: false,
      errorType: 'MISSING_CIN',
      errorMessage: 'Missing Input: Add Read Keyboard (cin >>).',
      novaMessage: 'Add Read Keyboard (cin >>) so the program can receive inputs.',
      hasStart,
      hasStringStorage,
      hasIntStorage,
      hasBoolStorage,
      hasLoop,
      hasCin,
      hasCout,
      hasEnd,
      hasFullPipeline: false,
      isCorrectType: true,
    };
  }

  if (!hasCout) {
    return {
      isValid: false,
      errorType: 'MISSING_COUT',
      errorMessage: 'Missing Output: Add Print Screen (cout <<).',
      novaMessage: 'Add Print Screen (cout <<) to transmit responses.',
      hasStart,
      hasStringStorage,
      hasIntStorage,
      hasBoolStorage,
      hasLoop,
      hasCin,
      hasCout,
      hasEnd,
      hasFullPipeline: false,
      isCorrectType: true,
    };
  }

  if (!hasEnd) {
    return {
      isValid: false,
      errorType: 'MISSING_END',
      errorMessage: 'Missing End: Attach End Program at the bottom.',
      novaMessage: 'Attach End Program at the bottom to complete your code.',
      hasStart,
      hasStringStorage,
      hasIntStorage,
      hasBoolStorage,
      hasLoop,
      hasCin,
      hasCout,
      hasEnd,
      hasFullPipeline: false,
      isCorrectType: true,
    };
  }

  // Structural validations:
  if (areStorageBlocksBeforeLoop === false) {
    return {
      isValid: false,
      errorType: 'STORAGE_AFTER_LOOP',
      errorMessage: 'Storage Before Loop: Place your memory boxes before the Repeat loop.',
      novaMessage: 'In C++, variables must be declared before they are used in the loop.',
      hasStart,
      hasStringStorage,
      hasIntStorage,
      hasBoolStorage,
      hasLoop,
      hasCin,
      hasCout,
      hasEnd,
      hasFullPipeline: false,
      isCorrectType: true,
    };
  }

  if (isCinInLoop === false) {
    return {
      isValid: false,
      errorType: 'CIN_OUTSIDE_LOOP',
      errorMessage: 'Place Read Keyboard (cin >>) inside the Repeat While Receiving Input loop.',
      novaMessage: 'Snap Read Keyboard (cin >>) inside the loop.',
      hasStart,
      hasStringStorage,
      hasIntStorage,
      hasBoolStorage,
      hasLoop,
      hasCin,
      hasCout,
      hasEnd,
      hasFullPipeline: false,
      isCorrectType: true,
    };
  }

  if (isCoutInLoop === false) {
    return {
      isValid: false,
      errorType: 'COUT_OUTSIDE_LOOP',
      errorMessage: 'Place Print Screen (cout <<) inside the Repeat While Receiving Input loop.',
      novaMessage: 'Snap Print Screen (cout <<) inside the loop.',
      hasStart,
      hasStringStorage,
      hasIntStorage,
      hasBoolStorage,
      hasLoop,
      hasCin,
      hasCout,
      hasEnd,
      hasFullPipeline: false,
      isCorrectType: true,
    };
  }

  if (isCinBeforeCout === false) {
    return {
      isValid: false,
      errorType: 'STREAM_ORDER_INVALID',
      errorMessage: 'Input before Output: Connect Read Keyboard (cin >>) before Print Screen (cout <<) inside the loop.',
      novaMessage: 'Read the input before printing the response.',
      hasStart,
      hasStringStorage,
      hasIntStorage,
      hasBoolStorage,
      hasLoop,
      hasCin,
      hasCout,
      hasEnd,
      hasFullPipeline: false,
      isCorrectType: true,
    };
  }

  if (isEndAfterLoop === false) {
    return {
      isValid: false,
      errorType: 'END_BEFORE_LOOP',
      errorMessage: 'End Program must be attached at the bottom after the loop.',
      novaMessage: 'Move End Program to the very bottom.',
      hasStart,
      hasStringStorage,
      hasIntStorage,
      hasBoolStorage,
      hasLoop,
      hasCin,
      hasCout,
      hasEnd,
      hasFullPipeline: false,
      isCorrectType: true,
    };
  }

  return {
    isValid: true,
    errorType: null,
    hasStart,
    hasStringStorage,
    hasIntStorage,
    hasBoolStorage,
    hasLoop,
    hasCin,
    hasCout,
    hasEnd,
    hasFullPipeline: workspace.isComplete,
    isCorrectType: true,
    novaMessage: 'All blocks configured. Click Run Simulation to begin.',
  };
}

export function generateSaturnCppCode(
  workspace?: SaturnWorkspaceState,
  _currentWave?: number
): string {
  const declarations: string[] = [];
  if (workspace?.hasStringStorage || !workspace) {
    declarations.push('    string textWord;');
  }
  if (workspace?.hasIntStorage || !workspace) {
    declarations.push('    int sensorNum;');
  }
  if (workspace?.hasBoolStorage || !workspace) {
    declarations.push('    bool userChoice;');
  }
  if (declarations.length === 0) {
    declarations.push('    string textWord;\n    int sensorNum;\n    bool userChoice;');
  }

  return `#include <iostream>
#include <string>
using namespace std;

int main() {
${declarations.join('\n')}

    while (cin >> textWord) {
        cout << textWord << endl;
    }

    return 0;
}`;
}
