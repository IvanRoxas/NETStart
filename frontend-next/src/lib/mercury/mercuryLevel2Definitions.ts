import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export type CargoCategory = 'Equipment' | 'Organics' | 'Energy' | 'Gears';

export interface CargoItemEntity {
  id: number;
  type: CargoCategory;
  variant: 1 | 2 | 3;
  label: string;
  iconPath: string;
}

export interface LogicBranch {
  type: 'if' | 'elseif' | 'else';
  condition?: CargoCategory;
  routeTo?: CargoCategory;
}

export interface MercuryLevel2Validation {
  hasBlocks: boolean;
  hasLoopBlock: boolean;
  loopTimes: number; // Inserted amount in Repeat [ N ] times
  hasVariableBlock: boolean; // student declared and used let cargo = X-Ray.scan()
  hasLogicBlock: boolean;
  hasActionBlock: boolean;

  // Specific error flags per specs
  hasEmptyLoopError: boolean;
  emptyLoopErrorMessage?: string;
  hasEmptyBranchError: boolean;
  emptyBranchErrorMessage?: string;
  hasEmptyConditionError: boolean;
  emptyConditionErrorMessage?: string;
  hasMisplacedBlockError: boolean;
  misplacedBlockErrorMessage?: string;
  hasLoopCountError: boolean;
  loopCountErrorMessage?: string;
  hasLogicOrderError: boolean;
  logicOrderErrorMessage?: string;

  // Parsed routing rules for evaluation
  branches: LogicBranch[];
  routingTable: {
    Equipment?: CargoCategory;
    Organics?: CargoCategory;
    Energy?: CargoCategory;
    Gears?: CargoCategory;
  };

  // Evaluation outcome
  isFullyCorrect: boolean;

  // Generated JS Code for Code Syntax tab
  jsCode: string;

  // Objectives
  objective1Loop: boolean;     // "Set the loop to Repeat 20 times."
  objective2Variable: boolean; // "Save the X-Ray scan to a Variable."
  objective3Logic: boolean;    // "Build an If/Else If/Else rule."
  objective4AllSorted: boolean;// "Sort all 20 cargo crates."
  isAllCompleted: boolean;
}

export const INITIAL_MERCURY_LEVEL_2_VALIDATION: MercuryLevel2Validation = {
  hasBlocks: false,
  hasLoopBlock: false,
  loopTimes: 1,
  hasVariableBlock: false,
  hasLogicBlock: false,
  hasActionBlock: false,
  hasEmptyLoopError: false,
  hasEmptyBranchError: false,
  hasEmptyConditionError: false,
  hasMisplacedBlockError: false,
  hasLoopCountError: false,
  hasLogicOrderError: false,
  branches: [],
  routingTable: {},
  isFullyCorrect: false,
  jsCode: '',
  objective1Loop: false,
  objective2Variable: false,
  objective3Logic: false,
  objective4AllSorted: false,
  isAllCompleted: false,
};

// Generates the deterministic 20 items distributed across the 3 categories, cycling 1-3 for each
export function generateConveyor20Items(): CargoItemEntity[] {
  const sequence: CargoCategory[] = [
    'Equipment', 'Organics', 'Energy', 'Equipment', 'Energy',
    'Organics', 'Organics', 'Equipment', 'Energy', 'Equipment',
    'Organics', 'Energy', 'Organics', 'Equipment', 'Equipment',
    'Energy', 'Organics', 'Energy', 'Equipment', 'Organics',
  ];

  const counts: Record<string, number> = { Equipment: 0, Organics: 0, Energy: 0 };

  return sequence.map((rawType, index) => {
    const type: CargoCategory = rawType === 'Gears' ? 'Equipment' : rawType;
    counts[type] = (counts[type] || 0) + 1;
    const variant = (((counts[type] - 1) % 3) + 1) as 1 | 2 | 3;
    return {
      id: index + 1,
      type,
      variant,
      label: `${type} Crate #${index + 1}`,
      iconPath: `/assets/mercury/level2/${type}${variant}.svg`,
    };
  });
}

let blocksRegistered = false;

export function registerMercuryLevel2Blocks() {
  if (blocksRegistered) return;
  blocksRegistered = true;

  // =========================================================================
  // 1. LOOP BLOCK: [ Repeat [ 1 ] times ] — Events/Loops category
  //    Student inserts the number of times (e.g. 20)
  // =========================================================================
  Blockly.Blocks['mercury2_loop_repeat20'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Repeat')
        .appendField(new Blockly.FieldNumber(1, 1, 100), 'TIMES')
        .appendField('times');
      this.appendStatementInput('DO')
        .setCheck(null);
      this.setColour('#7C3AED');
      this.setTooltip('Repeats the steps inside for each crate on the conveyor belt.');
    },
  };

  javascriptGenerator.forBlock['mercury2_loop_repeat20'] = function (block: any) {
    const rawTimes = block.getFieldValue('TIMES');
    const times = rawTimes !== null && rawTimes !== undefined && rawTimes !== '' ? Number(rawTimes) : 20;
    const branch = block.getInput('DO') ? javascriptGenerator.statementToCode(block, 'DO') : '';
    const inner = branch || '  // Add your scanner and routing rules here!\n';
    return `// 1. Loop through each of the ${times} crates arriving on the conveyor belt\nfor (let i = 0; i < ${times}; i++) {\n${inner}}\n`;
  };

  // =========================================================================
  // 2. VARIABLE BLOCK: [ Read the X-Ray Scanner ] — Variables category
  // =========================================================================
  Blockly.Blocks['mercury2_scan_var'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Read the X-Ray Scanner');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0891B2');
      this.setTooltip('X-rays the crate on the belt to see what item is inside.');
    },
  };

  javascriptGenerator.forBlock['mercury2_scan_var'] = function (_block: any) {
    return `  // 2. Scan the crate and store its material in the 'cargo' variable\n  let cargo = scanner.read();\n`;
  };

  // =========================================================================
  // 3. VARIABLE REPORTER BLOCK: [ Scan Result ] — Variables category
  // =========================================================================
  Blockly.Blocks['mercury2_cargo_var'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Scan Result');
      this.setOutput(true, 'String');
      this.setColour('#0891B2');
      this.setTooltip('The item found by the scanner. Snap this into an [ If ] check!');
    },
  };

  javascriptGenerator.forBlock['mercury2_cargo_var'] = function (_block: any) {
    return ['cargo', 0];
  };

  // =========================================================================
  // 4. IF CHECK BLOCK: [ If [VALUE] reads [Dropdown] ] — Logic category
  // =========================================================================
  Blockly.Blocks['mercury2_if_check'] = {
    init: function () {
      this.appendValueInput('VALUE')
        .setCheck('String')
        .appendField('If');
      this.appendDummyInput()
        .appendField('reads')
        .appendField(
          new Blockly.FieldDropdown([
            ['Equipment', 'Equipment'],
            ['Organics', 'Organics'],
            ['Energy', 'Energy'],
          ]),
          'CONDITION'
        );
      this.appendStatementInput('DO')
        .setCheck(null);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2563EB');
      this.setTooltip('Checks what is inside the crate. If it matches, runs the actions inside!');
    },
  };

  javascriptGenerator.forBlock['mercury2_if_check'] = function (block: any) {
    const valueCode = javascriptGenerator.valueToCode(block, 'VALUE', 0);
    const varName = valueCode || '/* missing Scan Result */';
    const condition = block.getFieldValue('CONDITION') || 'Equipment';
    const branch = block.getInput('DO') ? javascriptGenerator.statementToCode(block, 'DO') : '';
    const inner = branch || '    // Missing action: Snap a "Send crate to" block here!\n';
    return `  // 3. Check if the scanned crate contains ${condition}\n  if (${varName} === "${condition}") {\n${inner}  }\n`;
  };

  // =========================================================================
  // 5. ELSE IF CHECK BLOCK: [ Or if [VALUE] reads [Dropdown] ] — Logic
  // =========================================================================
  Blockly.Blocks['mercury2_elseif_check'] = {
    init: function () {
      this.appendValueInput('VALUE')
        .setCheck('String')
        .appendField('Or if');
      this.appendDummyInput()
        .appendField('reads')
        .appendField(
          new Blockly.FieldDropdown([
            ['Organics', 'Organics'],
            ['Equipment', 'Equipment'],
            ['Energy', 'Energy'],
          ]),
          'CONDITION'
        );
      this.appendStatementInput('DO')
        .setCheck(null);
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0284C7');
      this.setTooltip('Checks another item type if the first check did not match.');
    },
  };

  javascriptGenerator.forBlock['mercury2_elseif_check'] = function (block: any) {
    const valueCode = javascriptGenerator.valueToCode(block, 'VALUE', 0);
    const varName = valueCode || '/* missing Scan Result */';
    const condition = block.getFieldValue('CONDITION') || 'Organics';
    const branch = block.getInput('DO') ? javascriptGenerator.statementToCode(block, 'DO') : '';
    const inner = branch || '    // Missing action: Snap a "Send crate to" block here!\n';
    return `  // Or check if the crate contains ${condition}\n  else if (${varName} === "${condition}") {\n${inner}  }\n`;
  };

  // =========================================================================
  // 6. ELSE BLOCK — Logic category
  // =========================================================================
  Blockly.Blocks['mercury2_else'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Otherwise');
      this.appendStatementInput('DO')
        .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#D97706');
      this.setTooltip('Runs if none of your checks above matched.');
    },
  };

  javascriptGenerator.forBlock['mercury2_else'] = function (block: any) {
    const branch = block.getInput('DO') ? javascriptGenerator.statementToCode(block, 'DO') : '';
    const inner = branch || '    // Missing action: Snap a "Send crate to" block here!\n';
    return `  // Fallback: If none of the conditions matched, route all remaining crates here\n  else {\n${inner}  }\n`;
  };

  // =========================================================================
  // 7. ROUTE ACTION BLOCK: [ Send crate to: ... ] — Actions category
  // =========================================================================
  Blockly.Blocks['mercury2_route_to'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Send crate to')
        .appendField(
          new Blockly.FieldDropdown([
            ['Equipment Belt', 'Equipment'],
            ['Organics Belt', 'Organics'],
            ['Energy Belt', 'Energy'],
          ]),
          'DESTINATION'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#10B981');
      this.setTooltip('Tells the claw which belt to deliver the crate to.');
    },
  };

  javascriptGenerator.forBlock['mercury2_route_to'] = function (block: any) {
    const dest = block.getFieldValue('DESTINATION') || 'Equipment';
    return `    routeToBelt("${dest}"); // Claw delivers crate to ${dest} belt\n`;
  };
}

// =========================================================================
// Categorized Toolbox — 4 sidebar tabs
// =========================================================================
export function getMercuryLevel2Toolbox() {
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Events / Loops',
        colour: '#7C3AED',
        contents: [
          { kind: 'block', type: 'mercury2_loop_repeat20' },
        ],
      },
      {
        kind: 'category',
        name: 'Variables',
        colour: '#0891B2',
        contents: [
          { kind: 'block', type: 'mercury2_scan_var' },
          { kind: 'block', type: 'mercury2_cargo_var' },
        ],
      },
      {
        kind: 'category',
        name: 'Logic',
        colour: '#2563EB',
        contents: [
          { kind: 'block', type: 'mercury2_if_check' },
          { kind: 'block', type: 'mercury2_elseif_check' },
          { kind: 'block', type: 'mercury2_else' },
        ],
      },
      {
        kind: 'category',
        name: 'Actions',
        colour: '#10B981',
        contents: [
          { kind: 'block', type: 'mercury2_route_to' },
        ],
      },
    ],
  };
}

// =========================================================================
// Workspace Parser & Validator
// =========================================================================
export function parseMercuryLevel2Workspace(workspace: Blockly.WorkspaceSvg | null): MercuryLevel2Validation {
  const result: MercuryLevel2Validation = {
    ...INITIAL_MERCURY_LEVEL_2_VALIDATION,
    branches: [],
    routingTable: {},
  };

  if (!workspace) return result;

  const allBlocks = workspace.getAllBlocks(false);
  result.hasBlocks = allBlocks.length > 0;
  if (!result.hasBlocks) return result;

  // ── Objective 1: Loop block present & times value ─────────────────────────
  const loopBlock = allBlocks.find(b => b.type === 'mercury2_loop_repeat20');
  result.hasLoopBlock = !!loopBlock;
  const rawTimes = loopBlock ? loopBlock.getFieldValue('TIMES') : null;
  const loopTimes = rawTimes !== null && rawTimes !== undefined && rawTimes !== '' ? Number(rawTimes) : 0;
  result.loopTimes = loopTimes;

  if (loopBlock) {
    if (isNaN(loopTimes) || loopTimes <= 0) {
      result.hasLoopCountError = true;
      result.loopCountErrorMessage = "Set the loop to repeat at least 1 time (there are 20 crates waiting on the belt)!";
    }
  }
  result.objective1Loop = !!loopBlock && loopTimes === 20;

  // ── Misplaced blocks check ───────────────────────────────────────────────
  const topBlocks = workspace.getTopBlocks(true);
  const blocksOutsideLoop = topBlocks.filter(b => b.type !== 'mercury2_loop_repeat20');
  if (blocksOutsideLoop.length > 0 && loopBlock) {
    result.hasMisplacedBlockError = true;
    const hasLooseVar = blocksOutsideLoop.some(b => b.type === 'mercury2_cargo_var');
    if (hasLooseVar) {
      result.misplacedBlockErrorMessage = "You have an unattached 'Scan Result' block! Drag it into the empty slot of an If block.";
    } else {
      result.misplacedBlockErrorMessage = "All blocks must be placed inside the Repeat loop!";
    }
  }

  if (loopBlock) {
    const firstInnerBlock = loopBlock.getInputTargetBlock('DO');
    if (!firstInnerBlock) {
      result.hasEmptyLoopError = true;
      result.emptyLoopErrorMessage = "The claw doesn't have any instructions! Give it some rules to follow.";
    } else {
      // ── Traverse inner blocks ──────────────────────────────────────────
      let curr: Blockly.Block | null = firstInnerBlock;
      const branches: LogicBranch[] = [];
      let hasScanVar = false;
      let hasUsedVarInSlot = false;
      let hasSeenIf = false;
      let hasSeenElse = false;

      while (curr) {
        // Objective 2: variable declaration block
        if (curr.type === 'mercury2_scan_var') {
          hasScanVar = true;
        }

        // Logic branches (new modular blocks)
        if (
          curr.type === 'mercury2_if_check' ||
          curr.type === 'mercury2_elseif_check' ||
          curr.type === 'mercury2_else'
        ) {
          result.hasLogicBlock = true;
          const branchType: 'if' | 'elseif' | 'else' =
            curr.type === 'mercury2_if_check'
              ? 'if'
              : curr.type === 'mercury2_elseif_check'
              ? 'elseif'
              : 'else';

          if (hasSeenElse) {
            result.hasLogicOrderError = true;
            result.logicOrderErrorMessage = branchType === 'else'
              ? "You can only have one 'Otherwise' block at the end of your rules!"
              : "The 'Otherwise' block must be the last rule in your chain! Remove any blocks placed after it.";
          }

          if (branchType === 'if') {
            hasSeenIf = true;
          } else if (!hasSeenIf) {
            result.hasLogicOrderError = true;
            result.logicOrderErrorMessage = branchType === 'elseif'
              ? "An 'Or if' block must come after an 'If' block!"
              : "An 'Otherwise' block must come after an 'If' block!";
          }

          if (branchType === 'else') {
            hasSeenElse = true;
          }

          // Check the value slot — did they plug in the cargo var?
          if (branchType !== 'else') {
            const valTarget = curr.getInputTargetBlock('VALUE');
            const hasVarInSlot = valTarget?.type === 'mercury2_cargo_var';
            if (hasVarInSlot) {
              hasUsedVarInSlot = true;
            } else {
              result.hasEmptyConditionError = true;
              result.emptyConditionErrorMessage = branchType === 'if'
                ? "Your If block is missing its condition! Drag 'Scan Result' into the empty slot."
                : "Your 'Or if' block is missing its condition! Drag 'Scan Result' into the empty slot.";
            }
          }

          const condition =
            branchType === 'else'
              ? undefined
              : (curr.getFieldValue('CONDITION') as CargoCategory);

          const actionBlock = curr.getInputTargetBlock('DO');
          let routeTo: CargoCategory | undefined = undefined;

          if (actionBlock && actionBlock.type === 'mercury2_route_to') {
            result.hasActionBlock = true;
            routeTo = actionBlock.getFieldValue('DESTINATION') as CargoCategory;
          } else {
            result.hasEmptyBranchError = true;
            result.emptyBranchErrorMessage = `An If/Else block is empty — snap a 'Send crate to' block inside it.`;
          }

          branches.push({ type: branchType, condition, routeTo });
        } else if (curr.type === 'mercury2_route_to') {
          // Action placed directly inside loop without If/Else
          result.hasActionBlock = true;
          const routeTo = curr.getFieldValue('DESTINATION') as CargoCategory;
          branches.push({ type: 'else', routeTo });
        }

        curr = curr.getNextBlock();
      }

      result.branches = branches;

      // ── Objective 2: variable declared AND used in an if/else slot ──────
      result.hasVariableBlock = hasScanVar && hasUsedVarInSlot;
      result.objective2Variable = result.hasVariableBlock;

      // ── Objective 3: if/else chain with ≥2 branches and no order/empty error ─
      result.objective3Logic = branches.length >= 2 && result.hasLogicBlock && !result.hasLogicOrderError && !result.hasEmptyConditionError;

      // ── Build routing table ──────────────────────────────────────────────
      const routingTable: { Equipment?: CargoCategory; Organics?: CargoCategory; Energy?: CargoCategory; Gears?: CargoCategory } = {};
      const categories: CargoCategory[] = ['Equipment', 'Organics', 'Energy'];

      for (const cat of categories) {
        let routed: CargoCategory | undefined;

        for (const branch of branches) {
          const bCond = branch.condition === 'Gears' ? 'Equipment' : branch.condition;
          const bRoute = branch.routeTo === 'Gears' ? 'Equipment' : branch.routeTo;
          if (bCond === cat && bRoute) {
            routed = bRoute;
            break;
          }
        }

        if (!routed) {
          const elseBranch = branches.find(b => b.type === 'else');
          if (elseBranch?.routeTo) {
            routed = elseBranch.routeTo === 'Gears' ? 'Equipment' : elseBranch.routeTo;
          }
        }

        routingTable[cat] = routed;
      }

      // Backward-compatibility alias
      routingTable['Gears'] = routingTable['Equipment'];
      result.routingTable = routingTable;

      // ── Objective 3 (simulation): all 3 categories correctly routed & level passed ─────
      result.isFullyCorrect =
        result.loopTimes === 20 &&
        !result.hasLoopCountError &&
        result.objective2Variable &&
        result.objective3Logic &&
        !result.hasEmptyBranchError &&
        !result.hasEmptyConditionError &&
        !result.hasLogicOrderError &&
        !result.hasMisplacedBlockError &&
        (routingTable['Equipment'] === 'Equipment' || routingTable['Gears'] === 'Equipment') &&
        routingTable['Organics'] === 'Organics' &&
        routingTable['Energy'] === 'Energy';
      result.objective4AllSorted = result.isFullyCorrect;
      result.isAllCompleted =
        result.objective2Variable &&
        result.objective3Logic &&
        result.objective4AllSorted;
    }
  }

  // ── Generate JS code for Code Syntax tab ─────────────────────────────────
  try {
    let rawJs = '';
    if (loopBlock) {
      rawJs = javascriptGenerator.blockToCode(loopBlock) as string;
    } else {
      rawJs = javascriptGenerator.workspaceToCode(workspace);
    }
    result.jsCode = rawJs.trim() || '/* No code generated */';
  } catch (_e) {
    result.jsCode = '/* Syntax compilation pending... */';
  }

  return result;
}
