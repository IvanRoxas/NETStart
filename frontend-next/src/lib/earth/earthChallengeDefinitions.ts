/**
 * Earth Challenge: Ledger Cipher Recovery (Separate Instance)
 * Standalone Python string operations challenge with harder, multi-character/multi-token phrases.
 * Completely independent of the main Earth Level 1 campaign progression.
 */
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import type { LevelSection } from '@/components/BlocklyMaze';
import type {
  Earth1OpType,
  Earth1Operation,
  Earth1SectionSpec,
  Earth1WorkspaceState,
  Earth1ValidationResult,
  Earth1StepResult,
} from '@/lib/earth/earthLevel1Definitions';
import { compareOutputs, formatOutputDisplay } from '@/lib/earth/earthLevel1Definitions';

// =============================================================================
// CHALLENGE SECTION SPECIFICATIONS
// =============================================================================

export const EARTH_CHALLENGE_SECTION_SPECS: Earth1SectionSpec[] = [
  {
    sectionIndex: 0,
    name: 'Orbital Docking Protocol',
    subtag: 'Challenge 1 of 3: The Multi-Target Swap',
    corruptedData: '~#ORB1T4L/DOCK1NG!&',
    targetOutput: ['ORBITAL', 'DOCKING'],
    tools: ['slice', 'replace', 'split'],
    referenceCode: 'data[2:17].replace("1","I").replace("4","A").split("/")',
    primaryHint: "Count the index positions from 0 to laser-cut the outer junk (~# and !&). Notice '1' appears in both words—one swap fixes both!",
    secondaryHint: "Slice from 2 to 17, swap: 1→I and 4→A, then split at '/' to separate ORBITAL and DOCKING.",
  },
  {
    sectionIndex: 1,
    name: 'Quantum Telemetry Beacon',
    subtag: 'Challenge 2 of 3: Quadruple Cipher Overhaul',
    corruptedData: '^$QU4N7UM:CR3D17S%*',
    targetOutput: ['QUANTUM', 'CREDITS'],
    tools: ['slice', 'replace', 'split'],
    referenceCode: 'data[2:17].replace("4","A").replace("7","T").replace("3","E").replace("1","I").split(":")',
    primaryHint: "Laser-cut the corrupted telemetry between 2 and 17, swap all numeric ciphers (4, 7, 3, 1), and explode the ':' delimiter.",
    secondaryHint: "Slice [2:17], swap: 4→A, 7→T, 3→E, 1→I, and explode ':' to restore ['QUANTUM', 'CREDITS'].",
  },
  {
    sectionIndex: 2,
    name: 'Cosmic Vector Flight',
    subtag: 'Challenge 3 of 3: Triple Token Synthesis',
    corruptedData: '<@C0SM1C-V3CT0R-FL1GHT>!',
    targetOutput: ['COSMIC', 'VECTOR', 'FLIGHT'],
    tools: ['slice', 'replace', 'split'],
    referenceCode: 'data[2:22].replace("0","O").replace("1","I").replace("3","E").split("-")',
    primaryHint: "Cut away <@ and >!, swap 0→O, 1→I, 3→E across all words, and explode the '-' delimiter to produce three clean navigation tokens!",
    secondaryHint: "Slice [2:22], swap: 0→O, 1→I, 3→E, and split at '-' to restore ['COSMIC', 'VECTOR', 'FLIGHT'].",
  },
];

export const EARTH_CHALLENGE_MAX_CHARS = 30;

// =============================================================================
// BLOCKLY BLOCKS REGISTRATION (ISOLATED INSTANCE)
// =============================================================================

let challengeBlocksRegistered = false;

export function registerEarthChallengeBlocks() {
  if (challengeBlocksRegistered) return;
  challengeBlocksRegistered = true;

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

  // 1. Data (Challenge Anchor Block)
  Blockly.Blocks['earth_challenge_data'] = {
    init: function () {
      this.appendDummyInput().appendField('Load Challenge Data');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#8B5CF6'); // Vibrant Purple
      this.setTooltip('Loads corrupted challenge telemetry: data = "..."');
    },
  };
  javascriptGenerator.forBlock['earth_challenge_data'] = function (block: any) {
    const sectionIndex =
      (typeof window !== 'undefined' && typeof (window as any).__NETSTART_CURRENT_SECTION__ === 'number')
        ? (window as any).__NETSTART_CURRENT_SECTION__
        : (block?.workspace?.currentSectionIndex ?? 0);
    const spec = EARTH_CHALLENGE_SECTION_SPECS[sectionIndex] || EARTH_CHALLENGE_SECTION_SPECS[0];
    return 'data = ' + JSON.stringify(spec.corruptedData) + '\n';
  };

  // 2. Cut / Slice Block
  Blockly.Blocks['earth_challenge_slice'] = {
    init: function () {
      const currentSectionIndex =
        (typeof window !== 'undefined' && typeof (window as any).__NETSTART_CURRENT_SECTION__ === 'number')
          ? (window as any).__NETSTART_CURRENT_SECTION__
          : 0;
      const currentSpec = EARTH_CHALLENGE_SECTION_SPECS[currentSectionIndex] || EARTH_CHALLENGE_SECTION_SPECS[0];
      const charCount = currentSpec.corruptedData.length;

      const startField = new Blockly.FieldNumber(0, 0, EARTH_CHALLENGE_MAX_CHARS, 1);
      startField.setValidator(function (this: any, val: string | number) {
        triggerBlockChange(this.sourceBlock_, 'START', val);
        return val;
      });
      const stopField = new Blockly.FieldNumber(charCount, 0, EARTH_CHALLENGE_MAX_CHARS, 1);
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
      this.setTooltip('Cuts characters between start (inclusive) and stop (exclusive): data = data[start:stop]');
    },
  };
  javascriptGenerator.forBlock['earth_challenge_slice'] = function (block: Blockly.Block) {
    const start = Math.max(0, Number(block.getFieldValue('START')) || 0);
    const stop = Math.max(0, Number(block.getFieldValue('STOP')) || 0);
    return `data = data[${start}:${stop}]\n`;
  };

  // 3. Replace Block
  Blockly.Blocks['earth_challenge_replace'] = {
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
      this.setTooltip('Replaces matching cipher characters: data = data.replace("old", "new")');
    },
  };
  javascriptGenerator.forBlock['earth_challenge_replace'] = function (block: Blockly.Block) {
    const oldStr = String(block.getFieldValue('OLD') ?? '').trim().toUpperCase();
    const newStr = String(block.getFieldValue('NEW') ?? '').trim().toUpperCase();
    return `data = data.replace(${JSON.stringify(oldStr)}, ${JSON.stringify(newStr)})\n`;
  };

  // 4. Split Block
  Blockly.Blocks['earth_challenge_split'] = {
    init: function () {
      const delimField = new Blockly.FieldTextInput('');
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
  javascriptGenerator.forBlock['earth_challenge_split'] = function (block: Blockly.Block) {
    const delim = String(block.getFieldValue('DELIM') ?? '').trim();
    return `data = data.split(${JSON.stringify(delim)})\n`;
  };

  // 5. Print Block
  Blockly.Blocks['earth_challenge_print'] = {
    init: function () {
      this.appendDummyInput().appendField('Print Data');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#3B82F6'); // Ocean Blue
      this.setTooltip('Prints the cleaned text to the console: print(data)');
    },
  };
  javascriptGenerator.forBlock['earth_challenge_print'] = function () {
    return 'print(data)\n';
  };
}

// =============================================================================
// TOOLBOX GENERATOR
// =============================================================================

export function getEarthChallengeToolbox(sectionIndex: number = 0) {
  registerEarthChallengeBlocks();

  const spec = EARTH_CHALLENGE_SECTION_SPECS[sectionIndex] || EARTH_CHALLENGE_SECTION_SPECS[0];
  const charCount = spec.corruptedData.length;

  const contents: any[] = [
    {
      kind: 'category',
      name: 'Data',
      colour: '#8B5CF6',
      contents: [
        { kind: 'block', type: 'earth_challenge_data' },
        { kind: 'block', type: 'earth_challenge_print' },
      ],
    },
  ];

  const toolsCategoryContents: any[] = [];

  // Cut (Slice) - Placeholders are 0 and the number of characters in that section
  if (spec.tools.includes('slice')) {
    toolsCategoryContents.push({
      kind: 'block',
      type: 'earth_challenge_slice',
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
      type: 'earth_challenge_replace',
      fields: {
        OLD: '',
        NEW: '',
      },
    });
  }

  // Split - Blank placeholder for challenge level
  if (spec.tools.includes('split')) {
    toolsCategoryContents.push({
      kind: 'block',
      type: 'earth_challenge_split',
      fields: {
        DELIM: '',
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

export function parseEarthChallengeWorkspace(
  workspace: Blockly.WorkspaceSvg | null,
  sectionIndex: number = 0
): { state: Earth1WorkspaceState; validation: Earth1ValidationResult } {
  const spec = EARTH_CHALLENGE_SECTION_SPECS[sectionIndex] || EARTH_CHALLENGE_SECTION_SPECS[0];

  const initialWorkspace: Earth1WorkspaceState = {
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

  const initialValidation: Earth1ValidationResult = {
    isValid: false,
    isCorrect: false,
    errorType: null,
    errorMessage: null,
    novaMessage: null,
    operations: [],
    stepResults: [],
    finalOutput: '',
    targetOutput: spec.targetOutput,
    isMatch: false,
    pythonCode: '',
  };

  if (!workspace) {
    return {
      state: initialWorkspace,
      validation: initialValidation,
    };
  }

  const allBlocks = workspace.getAllBlocks(false);
  const startBlock = allBlocks.find((b) => b.type === 'earth_main_start' || b.type === 'earth_challenge_start');
  const hasStart = Boolean(startBlock);
  const endBlock = allBlocks.find((b) => b.type === 'earth_main_end' || b.type === 'earth_challenge_end');
  const hasEnd = Boolean(endBlock);
  const dataBlock = allBlocks.find((b) => b.type === 'earth_challenge_data' || b.type === 'earth_python_data');
  const hasData = Boolean(dataBlock);
  const printBlock = allBlocks.find((b) => b.type === 'earth_challenge_print' || b.type === 'earth_python_print');
  const hasPrint = Boolean(printBlock);

  // Extract all tools present anywhere in workspace for real-time visual simulation
  const allToolsInWorkspace: Earth1Operation[] = [];
  allBlocks.forEach((b) => {
    if (b.type === 'earth_challenge_slice' || b.type === 'earth_python_slice') {
      allToolsInWorkspace.push({
        type: 'slice',
        start: Number(b.getFieldValue('START')) || 0,
        stop: Number(b.getFieldValue('STOP')) || 0,
        raw: `[${b.getFieldValue('START')}:${b.getFieldValue('STOP')}]`,
      });
    } else if (b.type === 'earth_challenge_replace' || b.type === 'earth_python_replace') {
      const oldStr = String(b.getFieldValue('OLD') ?? '').toUpperCase();
      const newStr = String(b.getFieldValue('NEW') ?? '').toUpperCase();
      allToolsInWorkspace.push({
        type: 'replace',
        oldStr,
        newStr,
        raw: `.replace("${oldStr}", "${newStr}")`,
      });
    } else if (b.type === 'earth_challenge_split' || b.type === 'earth_python_split') {
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
    if (currBlock?.type === 'earth_challenge_data' || currBlock?.type === 'earth_python_data') {
      currBlock = currBlock.getNextBlock();
    }
  }

  while (currBlock) {
    if (currBlock.type === 'earth_challenge_slice' || currBlock.type === 'earth_python_slice') {
      if (hasPrintInChain) isOperationAfterPrint = true;
      const start = Math.max(0, Number(currBlock.getFieldValue('START')) || 0);
      const stop = Math.max(0, Number(currBlock.getFieldValue('STOP')) || 0);
      operations.push({
        type: 'slice',
        start,
        stop,
        raw: `[${start}:${stop}]`,
      });
    } else if (currBlock.type === 'earth_challenge_replace' || currBlock.type === 'earth_python_replace') {
      if (hasPrintInChain) isOperationAfterPrint = true;
      const oldStr = String(currBlock.getFieldValue('OLD') ?? '').trim().toUpperCase();
      const newStr = String(currBlock.getFieldValue('NEW') ?? '').trim().toUpperCase();
      operations.push({
        type: 'replace',
        oldStr,
        newStr,
        raw: `.replace("${oldStr}", "${newStr}")`,
      });
    } else if (currBlock.type === 'earth_challenge_split' || currBlock.type === 'earth_python_split') {
      if (hasPrintInChain) isOperationAfterPrint = true;
      const delimiter = String(currBlock.getFieldValue('DELIM') ?? '').trim();
      operations.push({
        type: 'split',
        delimiter,
        raw: `.split("${delimiter}")`,
      });
    } else if (currBlock.type === 'earth_challenge_print' || currBlock.type === 'earth_python_print') {
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
  let pythonCode = '# Ledger Cipher Recovery Program\n';
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
    pythonCode += '# Snap "Load Challenge Data" to initialize\n';
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
          error: 'Order Error: Laser Cut must be used before Split! Cut boundary symbols before splitting text into a list.',
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
          error: 'Swap before you Split! Fix the cipher digits into real letters first, then split into clean tokens.',
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
            error: 'Your Split block is empty! Type the symbol you want to explode into "Split at".',
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
          error: 'Your tokens are already separated! You only need one "Split at" block at the end.',
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
    errorMessage = 'Workspace is empty! Drag out "Load Challenge Data" to start.';
    novaMessage = 'Drag out "Load Challenge Data" to start.';
  } else if (!hasData) {
    errorType = 'NO_DATA';
    errorMessage = 'Attach your blocks under "Load Challenge Data".';
    novaMessage = 'Attach blocks under "Load Challenge Data".';
  } else if (operations.length === 0) {
    errorType = 'NO_OPERATIONS';
    errorMessage = 'Snap a tool block under "Load Challenge Data" to clean the cipher.';
    novaMessage = 'Add a tool block under "Load Challenge Data".';
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
// CODE GENERATION HELPER
// =============================================================================

export function generateEarthChallengePythonCode(state?: Earth1WorkspaceState, sectionIndex: number = 0): string {
  const spec = EARTH_CHALLENGE_SECTION_SPECS[sectionIndex] || EARTH_CHALLENGE_SECTION_SPECS[0];
  let pythonCode = '# Ledger Cipher Recovery Program\n';
  if (!state?.hasData) {
    return pythonCode + '# Snap "Load Challenge Data" to initialize\n';
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

// =============================================================================
// SECTIONS CONFIGURATION FOR BLOCKLY MAZE
// =============================================================================

export const EARTH_CHALLENGE_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: 'Orbital Docking Protocol',
    subtag: 'Challenge 1 of 3: The Multi-Target Swap',
    desc: 'Encrypted docking packet ~#ORB1T4L/DOCK1NG!& is locked in static. Laser cut the outer punctuation, replace the leet digits, and explode the delimiter to clear the docking channel.',
    tip: "Hint: Laser slice from 2 to 17, swap 1→I and 4→A, then split at '/' to extract clean tokens.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: 'Restore Channel 1: ORBITAL DOCKING', completed: false, isClaimed: false },
      { id: 2, text: 'Restore Channel 2: QUANTUM CREDITS', completed: false, isClaimed: false },
      { id: 3, text: 'Restore Channel 3: COSMIC VECTOR FLIGHT', completed: false, isClaimed: false },
    ],
  },
  {
    sectionIndex: 1,
    name: 'Quantum Telemetry Beacon',
    subtag: 'Challenge 2 of 3: Quadruple Cipher Overhaul',
    desc: 'Deep-space sensor packet ^$QU4N7UM:CR3D17S%* is scrambled by cosmic rays. Slice away noise bytes, calibrate four cipher characters, and split at the colon delimiter.',
    tip: "Hint: Laser cut from 2 to 17, swap 4→A, 7→T, 3→E, 1→I, and explode the delimiter at ':'.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: 'Restore Channel 1: ORBITAL DOCKING', completed: false, isClaimed: false },
      { id: 2, text: 'Restore Channel 2: QUANTUM CREDITS', completed: false, isClaimed: false },
      { id: 3, text: 'Restore Channel 3: COSMIC VECTOR FLIGHT', completed: false, isClaimed: false },
    ],
  },
  {
    sectionIndex: 2,
    name: 'Cosmic Vector Flight',
    subtag: 'Challenge 3 of 3: Triple Token Synthesis',
    desc: 'Final flight telemetry override: <@C0SM1C-V3CT0R-FL1GHT>! needs full recovery. Slice the boundary tags, repair the warped digits across all three words, and explode hyphen delimiters.',
    tip: "Hint: Laser cut [2:22], swap 0→O, 1→I, 3→E, and split at '-' to restore all three navigation tokens.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: 'Restore Channel 1: ORBITAL DOCKING', completed: false, isClaimed: false },
      { id: 2, text: 'Restore Channel 2: QUANTUM CREDITS', completed: false, isClaimed: false },
      { id: 3, text: 'Restore Channel 3: COSMIC VECTOR FLIGHT', completed: false, isClaimed: false },
    ],
  },
];
