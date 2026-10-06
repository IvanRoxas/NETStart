/**
 * Earth Level 1: Fix the Master Ledger!
 * Core Definitions, Beginner-Friendly Blockly Blocks, and Section Pipeline.
 */
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import type { LevelSection } from '@/components/BlocklyMaze';

// =============================================================================
// TYPES & DATA STRUCTURES
// =============================================================================

export type Earth1OpType = 'slice' | 'replace' | 'split';

export interface Earth1SliceOp {
  type: 'slice';
  start: number;
  stop: number;
  raw: string;
}

export interface Earth1ReplaceOp {
  type: 'replace';
  oldStr: string;
  newStr: string;
  raw: string;
}

export interface Earth1SplitOp {
  type: 'split';
  delimiter: string;
  raw: string;
}

export type Earth1Operation = Earth1SliceOp | Earth1ReplaceOp | Earth1SplitOp;

export interface Earth1SectionSpec {
  sectionIndex: number;
  name: string;
  subtag: string;
  corruptedData: string;
  targetOutput: string | string[];
  tools: Earth1OpType[];
  referenceCode: string;
  primaryHint: string;
  secondaryHint: string;
}

export const EARTH_1_SECTION_SPECS: Earth1SectionSpec[] = [
  {
    sectionIndex: 0,
    name: 'The Cut & Separate',
    subtag: 'Section 1 of 3: Slice & Split',
    corruptedData: '#@ASTRO_LINK*',
    targetOutput: ['ASTRO', 'LINK'],
    tools: ['slice', 'split'],
    referenceCode: 'data[2:12].split("_")',
    primaryHint: "Count the invisible spaces between the scrambled letters starting at 0 to program your laser's start and stop points.",
    secondaryHint: 'Slice from 2 to 12 to remove #@ and *, then split using "_" to get ASTRO LINK.',
  },
  {
    sectionIndex: 1,
    name: 'The Cut, Swap & Separate',
    subtag: 'Section 2 of 3: Slice, Replace & Split',
    corruptedData: '=#N3T_5T4RT[!@',
    targetOutput: ['NET', 'START'],
    tools: ['slice', 'replace', 'split'],
    referenceCode: 'data[2:11].replace("3","E").replace("5","S").replace("4","A").split("_")',
    primaryHint: 'Cut off the outer junk (=# and [!@) with laser slicing from 2 to 11, swap each number with the real letter, then split at "_" into clean words.',
    secondaryHint: 'Slice from 2 to 11, swap: 3→E, 5→S, 4→A, and finally split at "_".',
  },
  {
    sectionIndex: 2,
    name: 'The Master Overhaul',
    subtag: 'Section 3 of 3: The Full Pipeline',
    corruptedData: '!%SL4LUS=R3PORL#',
    targetOutput: ['STATUS', 'REPORT'],
    tools: ['slice', 'replace', 'split'],
    referenceCode: 'data[2:15].replace("L","T").replace("4","A").replace("3","E").split("=")',
    primaryHint: 'Remember that order matters: cut the boundary junk, swap the storm-warped characters, and split into clean ledger entries!',
    secondaryHint: 'Slice from 2 to 15, swap L→T, 4→A, 3→E, and finally split at "=".',
  },
];

// =============================================================================
// WORKSPACE STATE & VALIDATION INTERFACES
// =============================================================================

export interface Earth1WorkspaceState {
  hasStart: boolean;
  hasEnd: boolean;
  hasData: boolean;
  hasPrint?: boolean;
  operations: Earth1Operation[];
  allToolsInWorkspace: Earth1Operation[];
  rawCode: string;
  hasSlice: boolean;
  hasReplace: boolean;
  hasSplit: boolean;
  isReplaceAfterSplit: boolean;
}

export interface Earth1StepResult {
  stepIndex: number;
  op: Earth1Operation;
  before: string | string[];
  after: string | string[];
  description: string;
  error?: string;
}

export interface Earth1ValidationResult {
  isValid: boolean;
  isCorrect?: boolean;
  errorType: string | null;
  errorMessage: string | null;
  novaMessage: string | null;
  operations: Earth1Operation[];
  stepResults: Earth1StepResult[];
  finalOutput: string | string[];
  targetOutput: string | string[];
  isMatch: boolean;
  pythonCode: string;
}

export const INITIAL_EARTH_1_WORKSPACE: Earth1WorkspaceState = {
  hasStart: false,
  hasEnd: false,
  hasData: false,
  hasPrint: false,
  operations: [],
  allToolsInWorkspace: [],
  rawCode: '',
  hasSlice: false,
  hasReplace: false,
  hasSplit: false,
  isReplaceAfterSplit: false,
};

export const INITIAL_EARTH_1_VALIDATION: Earth1ValidationResult = {
  isValid: false,
  isCorrect: false,
  errorType: null,
  errorMessage: null,
  novaMessage: null,
  operations: [],
  stepResults: [],
  finalOutput: '',
  targetOutput: '',
  isMatch: false,
  pythonCode: '',
};

// =============================================================================
// BLOCKLY BLOCKS REGISTRATION
// =============================================================================

export const EARTH_1_MAX_CHARS = 25; // Ample boundary room for slicing and input flexibility

let earthBlocksRegistered = false;

export function registerEarthLevel1Blocks() {
  if (earthBlocksRegistered) return;
  earthBlocksRegistered = true;

  // ---------------------------------------------------------------------------
  // 0. Start Program & End Program Blocks
  // ---------------------------------------------------------------------------
  Blockly.Blocks['earth_main_start'] = {
    init: function () {
      this.appendDummyInput().appendField('Start Program');
      this.setNextStatement(true, null);
      this.setColour('#EF4444'); // Crimson Red
      this.setTooltip('Starts the Python text cleaning program');
    },
  };
  javascriptGenerator.forBlock['earth_main_start'] = function () {
    return '# --- Start Program ---\n';
  };

  Blockly.Blocks['earth_main_end'] = {
    init: function () {
      this.appendDummyInput().appendField('End Program');
      this.setPreviousStatement(true, null);
      this.setColour('#EF4444'); // Crimson Red
      this.setTooltip('Ends the Python text cleaning program');
    },
  };
  javascriptGenerator.forBlock['earth_main_end'] = function () {
    return '# --- End Program ---\n';
  };

  // ---------------------------------------------------------------------------
  // 1. Data (Anchor Block)
  // ---------------------------------------------------------------------------
  Blockly.Blocks['earth_python_data'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Load Data');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#8B5CF6'); // Vibrant Purple
      this.setTooltip('Loads data into variable: data = "..."');
    },
  };
  javascriptGenerator.forBlock['earth_python_data'] = function (block: any) {
    const sectionIndex =
      (typeof window !== 'undefined' && typeof (window as any).__NETSTART_CURRENT_SECTION__ === 'number')
        ? (window as any).__NETSTART_CURRENT_SECTION__
        : (block?.workspace?.currentSectionIndex ?? 0);
    const spec = EARTH_1_SECTION_SPECS[sectionIndex] || EARTH_1_SECTION_SPECS[0];
    return 'data = ' + JSON.stringify(spec.corruptedData) + '\n';
  };

  // Helper to trigger workspace changes immediately on keystroke while editing inputs
  const triggerBlockChange = (source: any, fieldName: string, val: any) => {
    if (source && source.workspace) {
      setTimeout(() => {
        if (source.workspace) {
          Blockly.Events.fire(
            new Blockly.Events.BlockChange(source, 'field', fieldName, null, val)
          );
        }
      }, 0);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. Cut / Slice Block
  // ---------------------------------------------------------------------------
  Blockly.Blocks['earth_python_slice'] = {
    init: function () {
      const currentSectionIndex =
        (typeof window !== 'undefined' && typeof (window as any).__NETSTART_CURRENT_SECTION__ === 'number')
          ? (window as any).__NETSTART_CURRENT_SECTION__
          : 0;
      const currentSpec = EARTH_1_SECTION_SPECS[currentSectionIndex] || EARTH_1_SECTION_SPECS[0];
      const charCount = currentSpec.corruptedData.length;

      const startField = new Blockly.FieldNumber(0, 0, EARTH_1_MAX_CHARS, 1);
      startField.setValidator(function (this: any, val: string | number) {
        triggerBlockChange(this.sourceBlock_, 'START', val);
        return val;
      });
      const stopField = new Blockly.FieldNumber(charCount, 0, EARTH_1_MAX_CHARS, 1);
      stopField.setValidator(function (this: any, val: string | number) {
        triggerBlockChange(this.sourceBlock_, 'STOP', val);
        return val;
      });

      this.appendDummyInput()
        .appendField('Cut from')
        .appendField(startField, 'START')
        .appendField('to')
        .appendField(stopField, 'STOP');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EF4444'); // Crimson Red
      this.setTooltip(`Cuts characters between start (inclusive) and stop (exclusive): data = data[start:stop]`);
    },
  };
  javascriptGenerator.forBlock['earth_python_slice'] = function (block: Blockly.Block) {
    const start = Math.max(0, Number(block.getFieldValue('START')) || 0);
    const stop = Math.max(0, Number(block.getFieldValue('STOP')) || 0);
    return `data = data[${start}:${stop}]\n`;
  };

  // ---------------------------------------------------------------------------
  // 3. Replace Block
  // ---------------------------------------------------------------------------
  Blockly.Blocks['earth_python_replace'] = {
    init: function () {
      const oldField = new Blockly.FieldTextInput('');
      oldField.setValidator(function (this: any, val: string) {
        const upper = typeof val === 'string' ? val.toUpperCase() : val;
        triggerBlockChange(this.sourceBlock_, 'OLD', upper);
        return upper;
      });
      const newField = new Blockly.FieldTextInput('');
      newField.setValidator(function (this: any, val: string) {
        const upper = typeof val === 'string' ? val.toUpperCase() : val;
        triggerBlockChange(this.sourceBlock_, 'NEW', upper);
        return upper;
      });

      this.appendDummyInput()
        .appendField('Replace')
        .appendField(oldField, 'OLD')
        .appendField('with')
        .appendField(newField, 'NEW');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#F59E0B'); // Warm Amber
      this.setTooltip('Replaces matching characters: data = data.replace("old", "new")');
    },
  };
  javascriptGenerator.forBlock['earth_python_replace'] = function (block: Blockly.Block) {
    const oldStr = String(block.getFieldValue('OLD') ?? '').trim().toUpperCase();
    const newStr = String(block.getFieldValue('NEW') ?? '').trim().toUpperCase();
    return `data = data.replace(${JSON.stringify(oldStr)}, ${JSON.stringify(newStr)})\n`;
  };

  // ---------------------------------------------------------------------------
  // 4. Split Block
  // ---------------------------------------------------------------------------
  Blockly.Blocks['earth_python_split'] = {
    init: function () {
      const currentSectionIndex =
        (typeof window !== 'undefined' && typeof (window as any).__NETSTART_CURRENT_SECTION__ === 'number')
          ? (window as any).__NETSTART_CURRENT_SECTION__
          : 0;
      // Section 1 (index 0) strictly defaults to '_'; subsequent sections default to ''
      const defaultDelim = currentSectionIndex === 0 ? '_' : '';

      const delimField = new Blockly.FieldTextInput(defaultDelim);
      delimField.setValidator(function (this: any, val: string) {
        triggerBlockChange(this.sourceBlock_, 'DELIM', val);
        return val;
      });

      this.appendDummyInput()
        .appendField('Split at')
        .appendField(delimField, 'DELIM');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#10B981'); // Emerald Green
      this.setTooltip('Splits text at delimiter and separates into clean words: data = data.split("delimiter")');
    },
  };
  javascriptGenerator.forBlock['earth_python_split'] = function (block: Blockly.Block) {
    const delim = String(block.getFieldValue('DELIM') ?? '').trim();
    return `data = data.split(${JSON.stringify(delim)})\n`;
  };

  // ---------------------------------------------------------------------------
  // 5. Print Block
  // ---------------------------------------------------------------------------
  Blockly.Blocks['earth_python_print'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Print Data');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#3B82F6'); // Ocean Blue
      this.setTooltip('Prints the cleaned text to the console / terminal screen: print(data)');
    },
  };
  javascriptGenerator.forBlock['earth_python_print'] = function () {
    return 'print(data)\n';
  };
}

export function getEarthLevel1DefaultWorkspaceXml(): string {
  return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
}

// =============================================================================
// TOOLBOX GENERATOR (Sequential per Section: Data & Tools)
// =============================================================================

export function getEarthLevel1Toolbox(sectionIndex: number = 0) {
  registerEarthLevel1Blocks();

  const spec = EARTH_1_SECTION_SPECS[sectionIndex] || EARTH_1_SECTION_SPECS[0];
  const charCount = spec.corruptedData.length;

  const contents: any[] = [
    {
      kind: 'category',
      name: 'Data',
      colour: '#8B5CF6',
      contents: [
        { kind: 'block', type: 'earth_python_data' },
        { kind: 'block', type: 'earth_python_print' },
      ],
    },
  ];

  const toolsCategoryContents: any[] = [];

  // Cut (Slice) - Placeholders are 0 and the number of characters in that section
  if (spec.tools.includes('slice')) {
    toolsCategoryContents.push({
      kind: 'block',
      type: 'earth_python_slice',
      fields: {
        START: 0,
        STOP: charCount,
      },
    });
  }

  // Replace - Blank placeholders
  if (spec.tools.includes('replace')) {
    toolsCategoryContents.push({
      kind: 'block',
      type: 'earth_python_replace',
      fields: {
        OLD: '',
        NEW: '',
      },
    });
  }

  // Split - Strictly only Section 1 (index 0) has '_' already filled up
  if (spec.tools.includes('split')) {
    toolsCategoryContents.push({
      kind: 'block',
      type: 'earth_python_split',
      fields: {
        DELIM: sectionIndex === 0 ? '_' : '',
      },
    });
  }

  contents.push({
    kind: 'category',
    name: 'Tools',
    colour: '#2563EB', // Royal Blue
    contents: toolsCategoryContents,
  });

  return {
    kind: 'categoryToolbox',
    contents,
  };
}

// =============================================================================
// WORKSPACE PARSER & SIMULATION ENGINE
// =============================================================================

export function parseEarthLevel1Workspace(
  workspace: Blockly.WorkspaceSvg | null,
  sectionIndex: number = 0
): { state: Earth1WorkspaceState; validation: Earth1ValidationResult } {
  const spec = EARTH_1_SECTION_SPECS[sectionIndex] || EARTH_1_SECTION_SPECS[0];

  if (!workspace) {
    return {
      state: INITIAL_EARTH_1_WORKSPACE,
      validation: {
        ...INITIAL_EARTH_1_VALIDATION,
        targetOutput: spec.targetOutput,
      },
    };
  }

  const allBlocks = workspace.getAllBlocks(false);
  const startBlock = allBlocks.find((b) => b.type === 'earth_main_start');
  const hasStart = Boolean(startBlock);
  const endBlock = allBlocks.find((b) => b.type === 'earth_main_end');
  const hasEnd = Boolean(endBlock);
  const dataBlock = allBlocks.find((b) => b.type === 'earth_python_data');
  const hasData = Boolean(dataBlock);
  const printBlock = allBlocks.find((b) => b.type === 'earth_python_print');
  const hasPrint = Boolean(printBlock);

  // Extract all tools present anywhere in workspace for real-time visual simulation
  const allToolsInWorkspace: Earth1Operation[] = [];
  allBlocks.forEach((b) => {
    if (b.type === 'earth_python_slice') {
      allToolsInWorkspace.push({
        type: 'slice',
        start: Number(b.getFieldValue('START')) || 0,
        stop: Number(b.getFieldValue('STOP')) || 0,
        raw: `[${b.getFieldValue('START')}:${b.getFieldValue('STOP')}]`,
      });
    } else if (b.type === 'earth_python_replace') {
      const oldStr = String(b.getFieldValue('OLD') ?? '').toUpperCase();
      const newStr = String(b.getFieldValue('NEW') ?? '').toUpperCase();
      allToolsInWorkspace.push({
        type: 'replace',
        oldStr,
        newStr,
        raw: `.replace("${oldStr}", "${newStr}")`,
      });
    } else if (b.type === 'earth_python_split') {
      allToolsInWorkspace.push({
        type: 'split',
        delimiter: String(b.getFieldValue('DELIM') ?? ''),
        raw: `.split("${b.getFieldValue('DELIM') ?? ''}")`,
      });
    }
  });

  // Traverse connected chain starting from dataBlock or startBlock
  const operations: Earth1Operation[] = [];
  let currBlock: Blockly.Block | null = null;
  let hasPrintInChain = false;
  let isOperationAfterPrint = false;

  if (dataBlock && dataBlock.getNextBlock()) {
    currBlock = dataBlock.getNextBlock();
  } else if (startBlock && startBlock.getNextBlock()) {
    currBlock = startBlock.getNextBlock();
    if (currBlock?.type === 'earth_python_data') {
      currBlock = currBlock.getNextBlock();
    }
  }

  while (currBlock) {
    if (currBlock.type === 'earth_python_slice') {
      if (hasPrintInChain) isOperationAfterPrint = true;
      const start = Math.max(0, Number(currBlock.getFieldValue('START')) || 0);
      const stop = Math.max(0, Number(currBlock.getFieldValue('STOP')) || 0);
      operations.push({
        type: 'slice',
        start,
        stop,
        raw: `[${start}:${stop}]`,
      });
    } else if (currBlock.type === 'earth_python_replace') {
      if (hasPrintInChain) isOperationAfterPrint = true;
      const oldStr = String(currBlock.getFieldValue('OLD') ?? '').trim().toUpperCase();
      const newStr = String(currBlock.getFieldValue('NEW') ?? '').trim().toUpperCase();
      operations.push({
        type: 'replace',
        oldStr,
        newStr,
        raw: `.replace("${oldStr}", "${newStr}")`,
      });
    } else if (currBlock.type === 'earth_python_split') {
      if (hasPrintInChain) isOperationAfterPrint = true;
      const delimiter = String(currBlock.getFieldValue('DELIM') ?? '').trim();
      operations.push({
        type: 'split',
        delimiter,
        raw: `.split("${delimiter}")`,
      });
    } else if (currBlock.type === 'earth_python_print') {
      hasPrintInChain = true;
    }
    currBlock = currBlock.getNextBlock();
  }

  const hasSlice = operations.some((o) => o.type === 'slice');
  const hasReplace = operations.some((o) => o.type === 'replace');
  const hasSplit = operations.some((o) => o.type === 'split');

  // Check operation sequence rules (Order Rules)
  let seenSplit = false;
  let isReplaceAfterSplit = false;
  let isSliceAfterSplit = false;
  let isMultipleSplits = false;
  for (const op of operations) {
    if (seenSplit) {
      if (op.type === 'slice') isSliceAfterSplit = true;
      if (op.type === 'replace') isReplaceAfterSplit = true;
      if (op.type === 'split') isMultipleSplits = true;
    }
    if (op.type === 'split') seenSplit = true;
  }

  // Generate clean Python code for the connected program
  let pythonCode = '# Earth Master Ledger Program\n';
  if (hasData) {
    pythonCode += 'data = ' + JSON.stringify(spec.corruptedData) + '\n';
    operations.forEach((op) => {
      if (op.type === 'slice') {
        pythonCode += `data = data[${op.start}:${op.stop}]\n`;
      } else if (op.type === 'replace') {
        pythonCode += `data = data.replace(${JSON.stringify(op.oldStr)}, ${JSON.stringify(op.newStr)})\n`;
      } else if (op.type === 'split') {
        pythonCode += `data = data.split(${JSON.stringify(op.delimiter)})\n`;
      }
    });
    if (hasPrintInChain) {
      pythonCode += 'print(data)\n';
    }
  } else {
    pythonCode += '# Snap "Load Data" to initialize\n';
  }

  const state: Earth1WorkspaceState = {
    hasStart,
    hasEnd,
    hasData,
    hasPrint: hasPrintInChain,
    operations,
    allToolsInWorkspace,
    rawCode: pythonCode,
    hasSlice,
    hasReplace,
    hasSplit,
    isReplaceAfterSplit,
  };

  // Step-by-step execution simulation
  const stepResults: Earth1StepResult[] = [];
  let currentVal: string | string[] = spec.corruptedData;

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const before = Array.isArray(currentVal) ? [...currentVal] : currentVal;

    if (op.type === 'slice') {
      if (typeof currentVal === 'string') {
        if (op.start >= op.stop) {
          currentVal = '';
          stepResults.push({
            stepIndex: i + 1,
            op,
            before,
            after: '',
            description: `Laser Cut [${op.start}:${op.stop}] -> "" (start >= stop)`,
          });
        } else {
          const clampedStart = Math.max(0, Math.min(op.start, currentVal.length));
          const clampedStop = Math.max(0, Math.min(op.stop, currentVal.length));
          currentVal = currentVal.slice(clampedStart, clampedStop);
          stepResults.push({
            stepIndex: i + 1,
            op,
            before,
            after: currentVal,
            description: `Laser Cut [${op.start}:${op.stop}] -> "${currentVal}"`,
          });
        }
      } else {
        stepResults.push({
          stepIndex: i + 1,
          op,
          before,
          after: currentVal,
          description: `Cannot slice a list directly. Laser Cut works on text strings.`,
          error: 'Order Error: Laser Cut must be used before Split! Cut boundary characters before splitting text into a list.',
        });
      }
    } else if (op.type === 'replace') {
      if (typeof currentVal === 'string') {
        if (op.oldStr === '') {
          stepResults.push({
            stepIndex: i + 1,
            op,
            before,
            after: currentVal,
            description: `Replace character cannot be empty!`,
            error: 'Your Replace block is empty! Tell Nova which letter to find and what letter to replace it with.',
          });
        } else {
          const replaced = currentVal.split(op.oldStr).join(op.newStr);
          currentVal = replaced;
          stepResults.push({
            stepIndex: i + 1,
            op,
            before,
            after: currentVal,
            description: `Crane Swap "${op.oldStr}" -> "${op.newStr}"`,
          });
        }
      } else {
        stepResults.push({
          stepIndex: i + 1,
          op,
          before,
          after: currentVal,
          description: `Cannot call .replace() on a list of words!`,
          error: 'Swap before you Split! Fix the warped numbers into real letters first, then split into clean words.',
        });
      }
    } else if (op.type === 'split') {
      if (typeof currentVal === 'string') {
        if (op.delimiter === '') {
          stepResults.push({
            stepIndex: i + 1,
            op,
            before,
            after: currentVal,
            description: `Split delimiter cannot be empty!`,
            error: 'Your Split block is empty! Type the symbol you want to explode (like "_") into "Split at".',
          });
        } else {
          currentVal = currentVal.split(op.delimiter);
          stepResults.push({
            stepIndex: i + 1,
            op,
            before,
            after: currentVal,
            description: `Explode & Split at "${op.delimiter}" -> [${(currentVal as string[]).map((s) => `"${s}"`).join(', ')}]`,
          });
        }
      } else {
        stepResults.push({
          stepIndex: i + 1,
          op,
          before,
          after: currentVal,
          description: `Already split into a list! Cannot split again.`,
          error: 'Your words are already separated! You only need one "Split at" block at the very end.',
        });
      }
    }
  }

  const finalOutput = currentVal;
  const isMatch = compareOutputs(finalOutput, spec.targetOutput);

  // Validation feedback
  let errorType: string | null = null;
  let errorMessage: string | null = null;
  let novaMessage: string | null = null;

  const runtimeErrorStep = stepResults.find((s) => Boolean(s.error));

  if (allBlocks.length === 0) {
    errorType = 'EMPTY';
    errorMessage = 'Workspace is empty! Drag out "Load Data" to start.';
    novaMessage = 'Drag out "Load Data" to start.';
  } else if (!hasData) {
    errorType = 'NO_DATA';
    errorMessage = 'Attach your blocks under "Load Data".';
    novaMessage = 'Attach blocks under "Load Data".';
  } else if (operations.length === 0) {
    errorType = 'NO_OPERATIONS';
    errorMessage = 'Snap a tool block under "Load Data" to clean the data.';
    novaMessage = 'Add a tool block under "Load Data".';
  } else if (isOperationAfterPrint) {
    errorType = 'ORDER_ERROR';
    errorMessage = 'Print Data must be at the very bottom of your program! Move "Print Data" to the end.';
    novaMessage = 'Put "Print Data" at the bottom!';
  } else if (isSliceAfterSplit) {
    errorType = 'ORDER_ERROR';
    errorMessage = 'Cut before you Split! Slice the text before splitting.';
    novaMessage = 'Cut before you Split!';
  } else if (isReplaceAfterSplit) {
    errorType = 'ORDER_ERROR';
    errorMessage = 'Replace before you Split! Swap letters before splitting.';
    novaMessage = 'Replace before you Split!';
  } else if (isMultipleSplits) {
    errorType = 'ORDER_ERROR';
    errorMessage = 'You only need one "Split at" block at the end.';
    novaMessage = 'Only one Split block is needed.';
  } else if (runtimeErrorStep) {
    errorType = 'RUNTIME_ERROR';
    errorMessage = runtimeErrorStep.error || 'Check your block values.';
    novaMessage = runtimeErrorStep.error || 'Check your block values.';
  } else if (!isMatch) {
    errorType = 'MISMATCH';
    errorMessage = `Expected "${formatOutputDisplay(spec.targetOutput)}", but got "${formatOutputDisplay(finalOutput)}".`;
    novaMessage = `Expected "${formatOutputDisplay(spec.targetOutput)}", got "${formatOutputDisplay(finalOutput)}".`;
  } else if (!hasPrintInChain) {
    errorType = 'NO_PRINT';
    errorMessage = 'Don\'t forget to print! Snap "Print Data" at the bottom.';
    novaMessage = 'Don\'t forget to print! Snap "Print Data" at the bottom.';
  }

  const hasOrderError = isSliceAfterSplit || isReplaceAfterSplit || isMultipleSplits || isOperationAfterPrint;
  const isValid = hasData && operations.length > 0 && !runtimeErrorStep && !hasOrderError && isMatch && hasPrintInChain && !isOperationAfterPrint;

  const validation: Earth1ValidationResult = {
    isValid,
    isCorrect: isValid,
    errorType,
    errorMessage,
    novaMessage,
    operations,
    stepResults,
    finalOutput,
    targetOutput: spec.targetOutput,
    isMatch,
    pythonCode,
  };

  return { state, validation };
}

// =============================================================================
// COMPARISON & HELPER UTILITIES
// =============================================================================

export function generateEarthPythonCode(state?: Earth1WorkspaceState, sectionIndex: number = 0): string {
  const spec = EARTH_1_SECTION_SPECS[sectionIndex] || EARTH_1_SECTION_SPECS[0];
  let pythonCode = '# Earth Master Ledger Program\n';
  if (!state?.hasData) {
    return pythonCode + '# Snap "Load Data" to initialize\n';
  }
  pythonCode += `data = ${JSON.stringify(spec.corruptedData)}\n`;
  const ops = state.operations || [];
  ops.forEach((op) => {
    if (op.type === 'slice') {
      pythonCode += `data = data[${op.start}:${op.stop}]\n`;
    } else if (op.type === 'replace') {
      pythonCode += `data = data.replace(${JSON.stringify(op.oldStr)}, ${JSON.stringify(op.newStr)})\n`;
    } else if (op.type === 'split') {
      pythonCode += `data = data.split(${JSON.stringify(op.delimiter)})\n`;
    }
  });
  if (state.hasPrint) {
    pythonCode += 'print(data)\n';
  }
  return pythonCode;
}

export function compareOutputs(a: string | string[], b: string | string[]): boolean {
  if (Array.isArray(b)) {
    // Target is a list: 'a' MUST be an array of matching length and tokens (cannot bypass with replace space)
    if (!Array.isArray(a)) return false;
    if (a.length !== b.length) return false;
    return a.every((item, idx) => String(item).trim().toUpperCase() === String(b[idx]).trim().toUpperCase());
  }
  // Target is a string: 'a' must be a string matching target
  if (Array.isArray(a)) return false;
  return String(a).trim().toUpperCase() === String(b).trim().toUpperCase();
}

export function formatOutputDisplay(val: string | string[]): string {
  if (Array.isArray(val)) {
    return val.join(' ');
  }
  return String(val);
}

// =============================================================================
// SECTIONS CONFIGURATION FOR BLOCKLY MAZE
// =============================================================================

export const EARTH_1_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: 'The Cut & Separate',
    subtag: 'Section 1 of 3: Slice & Split',
    desc: 'The Master Ledger entry #@ASTRO_LINK* is scrambled! Use your laser slice cutter to remove the junk symbols, then explode the delimiter to split clean words.',
    tip: "Hint: To rescue the clean data, count the invisible spaces between the scrambled letters starting at 0 to program your laser's start and stop points.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: 'Restore Ledger Entry 1: ASTRO LINK', completed: false, isClaimed: false },
      { id: 2, text: 'Restore Ledger Entry 2: NET START', completed: false, isClaimed: false },
      { id: 3, text: 'Restore Ledger Entry 3: STATUS REPORT', completed: false, isClaimed: false },
    ],
  },
  {
    sectionIndex: 1,
    name: 'The Cut, Swap & Separate',
    subtag: 'Section 2 of 3: Slice, Replace & Split',
    desc: 'Storm-warped characters are buried in =#N3T_5T4RT[!@! Slice off the outer boundary junk, swap in the true letters, and split into clean ledger words.',
    tip: 'Hint: Laser slice from 2 to 11 to cut the outer junk, swap numbers for clean letters, and explode the delimiter to split NET and START.',
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: 'Restore Ledger Entry 1: ASTRO LINK', completed: false, isClaimed: false },
      { id: 2, text: 'Restore Ledger Entry 2: NET START', completed: false, isClaimed: false },
      { id: 3, text: 'Restore Ledger Entry 3: STATUS REPORT', completed: false, isClaimed: false },
    ],
  },
  {
    sectionIndex: 2,
    name: 'The Master Overhaul',
    subtag: 'Section 3 of 3: The Full Pipeline',
    desc: 'Put the whole pipeline together! Slice off outer junk, swap warped numbers, and split the final status report for Director Atlas.',
    tip: 'Hint: Remember order matters! Fix the letters first before splitting the text into a list.',
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: 'Restore Ledger Entry 1: ASTRO LINK', completed: false, isClaimed: false },
      { id: 2, text: 'Restore Ledger Entry 2: NET START', completed: false, isClaimed: false },
      { id: 3, text: 'Restore Ledger Entry 3: STATUS REPORT', completed: false, isClaimed: false },
    ],
  },
];
