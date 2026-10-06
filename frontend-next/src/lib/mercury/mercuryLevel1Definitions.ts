import * as Blockly from 'blockly';
import { javascriptGenerator, Order } from 'blockly/javascript';

export interface MercuryLevel1Validation {
  // Tile states
  isLilyWatered: boolean; // Centerpiece star flower fully revived (has both fertilize & water, vents open)
  starFlowerHasWater: boolean;
  starFlowerHasFertilizer: boolean;
  isVentsOpened: boolean;
  isVentsOpen: boolean;
  wateredShrubIndices: number[]; // 0 to 4 (5 shrubs fertilized)
  isAllShrubsWatered: boolean;   // shrubs fertilized
  wateredFlowerIndices: number[]; // 0 to 4 (5 companion flowers watered)
  isAllFlowersWatered: boolean;   // companion flowers watered

  // Code & validation flags
  hasBlocks: boolean;
  hasLilyBlock: boolean;
  hasVentBlock: boolean;
  hasShrubBlock: boolean;
  hasFlowerBlock: boolean;
  usedQuerySelectorTrap: boolean;
  usedBroadNukeSelector: boolean;
  broadSelectorTarget?: string;
  hasEmptyTargetError: boolean;
  hasMissingActionError: boolean;
  hasTypoOrCaseError: boolean;
  typoErrorMessage?: string;
  hasArraySelectorDirectActionError: boolean;
  arraySelectorErrorMessage?: string;
  hasMisplacedBlockError: boolean;
  misplacedBlockErrorMessage?: string;

  // Star flower state flags
  isStarFlowerFertilizeFail: boolean; // vents closed when fertilizing
  isStarFlowerNeedsWater: boolean;
  isStarFlowerNeedsFertilizer: boolean;

  isVentWateredWrong: boolean;
  isStarFlowerOpenedWrong: boolean;

  // Generated JS Code
  jsCode: string;

  // Objective booleans
  objective1Vents: boolean;       // Goal 1: Cool down the greenhouse
  objective2Plants: boolean;      // Goal 2: Fertilize bushes and water flowers
  objective3StarFlower: boolean;  // Goal 3: Fertilize and water the centerpiece flower

  // Backward-compat aliases
  objective1Lily: boolean;
  objective2Vents: boolean;
  objective3Shrubs: boolean;
  isAllCompleted: boolean;

  // Diagnostic logs
  diagnosticLogs: Array<{
    type: 'info' | 'success' | 'warn' | 'error';
    message: string;
    timestamp: number;
  }>;
}

export const INITIAL_MERCURY_LEVEL_1_VALIDATION: MercuryLevel1Validation = {
  isLilyWatered: false,
  starFlowerHasWater: false,
  starFlowerHasFertilizer: false,
  isVentsOpened: false,
  isVentsOpen: false,
  wateredShrubIndices: [],
  isAllShrubsWatered: false,
  wateredFlowerIndices: [],
  isAllFlowersWatered: false,
  hasBlocks: false,
  hasLilyBlock: false,
  hasVentBlock: false,
  hasShrubBlock: false,
  hasFlowerBlock: false,
  usedQuerySelectorTrap: false,
  usedBroadNukeSelector: false,
  hasEmptyTargetError: false,
  hasMissingActionError: false,
  hasTypoOrCaseError: false,
  hasArraySelectorDirectActionError: false,
  hasMisplacedBlockError: false,
  isStarFlowerFertilizeFail: false,
  isStarFlowerNeedsWater: false,
  isStarFlowerNeedsFertilizer: false,
  isVentWateredWrong: false,
  isStarFlowerOpenedWrong: false,
  jsCode: '',
  objective1Vents: false,
  objective2Plants: false,
  objective3StarFlower: false,
  objective1Lily: false,
  objective2Vents: false,
  objective3Shrubs: false,
  isAllCompleted: false,
  diagnosticLogs: [
    {
      type: 'warn',
      message: 'Biodome life support is offline! Selectors disconnected.',
      timestamp: Date.now(),
    },
    {
      type: 'info',
      message: 'Drag Target and Action blocks into the workspace to restore the dome.',
      timestamp: Date.now() + 10,
    }
  ],
};

let blocksRegistered = false;

export function registerMercuryLevel1Blocks() {
  if (blocksRegistered) return;
  blocksRegistered = true;

  // =========================================================================
  // =========================================================================
  // Block 1: Target ID (#) - Singular element (getElementById)
  // Container puzzle block with "do:" cutout.
  // =========================================================================
  Blockly.Blocks['mercury1_target_id'] = {
    init: function () {
      this.appendDummyInput('HEADER')
        .appendField('Target ID (#)')
        .appendField(
          new Blockly.FieldDropdown([
            ['star-flower', 'star-flower'],
            ['shrub', 'shrub'],
            ['flower', 'flower'],
            ['vent', 'vent'],
          ]),
          'TARGET_NAME'
        );
      this.setPreviousStatement(false);
      this.setNextStatement(true, null);
      this.setColour('#2563EB'); // Blue
      this.setTooltip('Finds one specific item by its name (#id). Snap an action block below!');
      this.setHelpUrl('');
    },
  };

  javascriptGenerator.forBlock['mercury1_target_id'] = function (block: any) {
    const rawName: string = (block.getFieldValue('TARGET_NAME') || '').trim();
    const cleanRaw = rawName.replace(/^['"`]|['"`]$/g, '').replace(/;+$/, '').trim();
    const cleanId = cleanRaw.replace(/^#/, '').trim();
    const branch = block.getInput('DO') ? javascriptGenerator.statementToCode(block, 'DO').trim() : '';

    if (!branch) return `const el = document.getElementById('${cleanId}');\n`;
    return `const el = document.getElementById('${cleanId}');\nif (el) {\n  ${branch.replace(/\n/g, '\n  ')}\n}\n`;
  };

  // =========================================================================
  // Block 2: Target Class (.) - Array of elements (querySelectorAll)
  // Container puzzle block with "do:" cutout.
  // =========================================================================
  Blockly.Blocks['mercury1_target_class'] = {
    init: function () {
      this.appendDummyInput('HEADER')
        .appendField('Target Class (.)')
        .appendField(
          new Blockly.FieldDropdown([
            ['shrub', 'shrub'],
            ['flower', 'flower'],
            ['star-flower', 'star-flower'],
            ['vent', 'vent'],
          ]),
          'TARGET_NAME'
        );
      this.appendStatementInput('DO')
        .appendField('do:');
      this.setPreviousStatement(false);
      this.setNextStatement(true, null);
      this.setColour('#D97706'); // Yellow
      this.setTooltip('Finds a group of matching items (.class). Put a [ For each item ] loop inside!');
      this.setHelpUrl('');
    },
  };

  javascriptGenerator.forBlock['mercury1_target_class'] = function (block: any) {
    const rawName: string = (block.getFieldValue('TARGET_NAME') || '').trim();
    const cleanRaw = rawName.replace(/^['"`]|['"`]$/g, '').replace(/;+$/, '').trim();
    const cleanClass = cleanRaw.startsWith('.') ? cleanRaw.trim() : `.${cleanRaw.trim()}`;
    const innerTarget = block.getInputTargetBlock ? block.getInputTargetBlock('DO') : null;
    let branch = '';
    if (innerTarget) {
      if (innerTarget.type === 'mercury1_loop_foreach') {
        branch = javascriptGenerator.statementToCode(innerTarget, 'DO').trim();
      } else {
        branch = javascriptGenerator.statementToCode(block, 'DO').trim();
      }
    }
    if (!branch) return `const items = document.querySelectorAll('${cleanClass}');\n`;
    const actionCode = branch.replace(/\bel\b/g, 'item');
    return `document.querySelectorAll('${cleanClass}').forEach(item => {\n  ${actionCode.replace(/\n/g, '\n  ')}\n});\n`;
  };

  // =========================================================================
  // Block 3: Target Tag (< >) - Array of elements (getElementsByTagName)
  // Container block with a "do:" cutout.
  // =========================================================================
  Blockly.Blocks['mercury1_target_tag'] = {
    init: function () {
      this.appendDummyInput('HEADER')
        .appendField('Target Tag (< >)')
        .appendField(
          new Blockly.FieldDropdown([
            ['vent', 'vent'],
            ['shrub', 'shrub'],
            ['flower', 'flower'],
            ['star-flower', 'star-flower'],
          ]),
          'TARGET_NAME'
        );
      this.appendStatementInput('DO')
        .appendField('do:');
      this.setPreviousStatement(false);
      this.setNextStatement(false);
      this.setColour('#DC2626'); // Red
      this.setTooltip('Finds all items of this kind (<tag>). Snap an action block inside!');
      this.setHelpUrl('');
    },
  };

  javascriptGenerator.forBlock['mercury1_target_tag'] = function (block: any) {
    const rawName: string = (block.getFieldValue('TARGET_NAME') || '').trim();
    const cleanRaw = rawName.replace(/^['"`]|['"`]$/g, '').replace(/;+$/, '').trim();
    const cleanTag = cleanRaw.replace(/^<|>$/g, '').trim().toLowerCase();
    const innerTarget = block.getInputTargetBlock ? block.getInputTargetBlock('DO') : null;
    let branch = '';
    if (innerTarget) {
      if (innerTarget.type === 'mercury1_loop_foreach') {
        branch = javascriptGenerator.statementToCode(innerTarget, 'DO').trim();
      } else {
        branch = javascriptGenerator.statementToCode(block, 'DO').trim();
      }
    }
    if (!branch) return `const items = document.querySelectorAll('${cleanTag}');\n`;
    const actionCode = branch.replace(/\bel\b/g, 'item');
    return `document.querySelectorAll('${cleanTag}').forEach(item => {\n  ${actionCode.replace(/\n/g, '\n  ')}\n});\n`;
  };

  // =========================================================================
  // Block 4: [ For Each ] Loop Block (querySelectorAll array iterator)
  // Shaped like a C-clamp with a "do:" cutout. Bottom is flat (no nextStatement).
  // =========================================================================
  Blockly.Blocks['mercury1_loop_foreach'] = {
    init: function () {
      this.appendDummyInput('HEADER')
        .appendField('For each item');
      this.appendStatementInput('DO')
        .appendField('do:');
      this.setPreviousStatement(true, null);
      this.setNextStatement(false);
      this.setColour('#7C3AED');
      this.setTooltip('Does the action inside for every item in your group, one by one.');
      this.setHelpUrl('');
    },
  };

  javascriptGenerator.forBlock['mercury1_loop_foreach'] = function (block: any) {
    const branch = javascriptGenerator.statementToCode(block, 'DO').trim();
    if (!branch) return `items.forEach(item => {\n  // Action\n});\n`;
    const actionCode = branch.replace(/\bel\b/g, 'item');
    return `items.forEach(item => {\n  ${actionCode.replace(/\n/g, '\n  ')}\n});\n`;
  };

  // =========================================================================
  // Unified Dynamic Target Block (Two side-by-side dropdowns)
  // [ Target ] [ Selector Type: ID / Class / Tag ] [ Object: shrub / flower / vent ]
  // Morphs: Linear for ID, C-clamp container with do: for Class / Tag
  // =========================================================================
  Blockly.Blocks['mercury1_target'] = {
    init: function () {
      this.appendDummyInput('HEADER')
        .appendField('Target')
        .appendField(
          new Blockly.FieldDropdown([
            ['Select Type...', ''],
            ['ID (#)', 'ID'],
            ['Class (.)', 'CLASS'],
            ['Tag (< >)', 'TAG'],
          ]),
          'SELECTOR_TYPE'
        )
        .appendField(
          new Blockly.FieldDropdown([
            ['Select Target...', ''],
            ['star-flower', 'star-flower'],
            ['shrub', 'shrub'],
            ['flower', 'flower'],
            ['vent', 'vent'],
          ]),
          'TARGET_NAME'
        );
      this.setPreviousStatement(false); // Top of target is NOT connectable
      this.setNextStatement(true, null);
      this.setColour('#475569'); // Slate Gray for unselected placeholder
      this.setTooltip('Picks how to search for items in the biodome: by ID (#), by class (.), or by tag (<>).');
      this.setHelpUrl('');
    },
    onchange: function (e: any) {
      if (!this.workspace) return;
      if (
        e.type === Blockly.Events.BLOCK_CHANGE &&
        e.blockId === this.id &&
        e.name === 'SELECTOR_TYPE'
      ) {
        this.updateShape_();
      }
    },
    updateShape_: function () {
      const selectorType: string = this.getFieldValue('SELECTOR_TYPE') || '';
      const isLoop = selectorType === 'CLASS' || selectorType === 'TAG';
      const doInput = this.getInput('DO');

      if (isLoop) {
        if (!doInput) {
          this.appendStatementInput('DO')
            .appendField('do:');
        }
        // Disconnect next connection before removing nextStatement to prevent Blockly error
        if (this.nextConnection && this.nextConnection.isConnected()) {
          const nextBlock = this.nextConnection.targetBlock();
          this.nextConnection.disconnect();
          const targetDoInput = this.getInput('DO');
          if (nextBlock && targetDoInput && targetDoInput.connection && !targetDoInput.connection.isConnected() && nextBlock.previousConnection) {
            try {
              targetDoInput.connection.connect(nextBlock.previousConnection);
            } catch (_) {}
          }
        }
        this.setNextStatement(false);
      } else {
        if (doInput) {
          const innerBlock = doInput.connection ? doInput.connection.targetBlock() : null;
          if (doInput.connection && doInput.connection.isConnected()) {
            doInput.connection.disconnect();
          }
          this.removeInput('DO', true);
          this.setNextStatement(true, null);
          if (innerBlock && this.nextConnection && !this.nextConnection.isConnected() && innerBlock.previousConnection) {
            try {
              this.nextConnection.connect(innerBlock.previousConnection);
            } catch (_) {}
          }
        } else {
          this.setNextStatement(true, null);
        }
      }

      this.setPreviousStatement(false); // Top of target is never connectable

      if (selectorType === 'ID') {
        this.setColour('#2563EB'); // Blue
        this.setTooltip('Finds one specific item by its name (#id). Snap an action block below!');
      } else if (selectorType === 'CLASS') {
        this.setColour('#D97706'); // Yellow
        this.setTooltip('Finds a group of matching items (.class). Put a [ For each item ] loop inside!');
      } else if (selectorType === 'TAG') {
        this.setColour('#DC2626'); // Red
        this.setTooltip('Finds all items of this kind (<tag>). Snap an action block inside!');
      } else {
        this.setColour('#475569'); // Slate Gray
        this.setTooltip('Picks how to search for items in the biodome: by ID (#), by class (.), or by tag (<>).');
      }

      if (this.rendered) this.render();
    },
    mutationToDom: function () {
      const container = Blockly.utils.xml.createElement('mutation');
      const selectorType = this.getFieldValue('SELECTOR_TYPE') || '';
      container.setAttribute('selector_type', selectorType);
      return container;
    },
    domToMutation: function (xmlElement: Element) {
      const selectorType = xmlElement.getAttribute('selector_type') || '';
      const isLoop = selectorType === 'CLASS' || selectorType === 'TAG';
      if (isLoop) {
        if (!this.getInput('DO')) {
          this.appendStatementInput('DO').appendField('do:');
        }
        if (this.nextConnection && this.nextConnection.isConnected()) {
          this.nextConnection.disconnect();
        }
        this.setNextStatement(false);
      } else {
        const doInput = this.getInput('DO');
        if (doInput) {
          if (doInput.connection && doInput.connection.isConnected()) {
            doInput.connection.disconnect();
          }
          this.removeInput('DO', true);
        }
        this.setNextStatement(true, null);
      }
      this.setPreviousStatement(false);
      if (selectorType === 'ID') {
        this.setColour('#2563EB'); // Blue
        this.setTooltip('Finds one specific item by its name (#id). Snap an action block below!');
      } else if (selectorType === 'CLASS') {
        this.setColour('#D97706'); // Yellow
        this.setTooltip('Finds a group of matching items (.class). Put a [ For each item ] loop inside!');
      } else if (selectorType === 'TAG') {
        this.setColour('#DC2626'); // Red
        this.setTooltip('Finds all items of this kind (<tag>). Snap an action block inside!');
      } else {
        this.setColour('#475569'); // Slate Gray
        this.setTooltip('Picks how to search for items in the biodome: by ID (#), by class (.), or by tag (<>).');
      }
    },
  };

  javascriptGenerator.forBlock['mercury1_target'] = function (block: any) {
    const selectorType: string = block.getFieldValue('SELECTOR_TYPE') || '';
    const rawName: string = (block.getFieldValue('TARGET_NAME') || '').trim();
    const cleanRaw = rawName.replace(/^['"`]|['"`]$/g, '').replace(/;+$/, '').trim();

    if (!selectorType || !rawName) {
      return '// Incomplete Target block\n';
    }

    if (selectorType === 'ID') {
      const cleanId = cleanRaw.replace(/^#/, '').trim();
      const nextBlock = block.getNextBlock ? block.getNextBlock() : null;
      let branch = '';
      let curr = nextBlock;
      while (curr && curr.type && curr.type.startsWith('mercury1_action_')) {
        const rawCode = javascriptGenerator.blockToCode(curr);
        const actionStr = Array.isArray(rawCode) ? rawCode[0] : (rawCode || '');
        branch += actionStr;
        curr = curr.getNextBlock ? curr.getNextBlock() : null;
      }
      if (!branch) return `const el = document.getElementById('${cleanId}');\n`;
      return `const el = document.getElementById('${cleanId}');\nif (el) {\n  ${branch.trim().replace(/\n/g, '\n  ')}\n}\n`;
    } else if (selectorType === 'CLASS') {
      const cleanClass = cleanRaw.startsWith('.') ? cleanRaw.trim() : `.${cleanRaw.trim()}`;
      const innerTarget = block.getInputTargetBlock ? block.getInputTargetBlock('DO') : null;
      let branch = '';
      if (innerTarget) {
        if (innerTarget.type === 'mercury1_loop_foreach') {
          branch = javascriptGenerator.statementToCode(innerTarget, 'DO').trim();
        } else {
          branch = javascriptGenerator.statementToCode(block, 'DO').trim();
        }
      }
      if (!branch) return `const items = document.querySelectorAll('${cleanClass}');\n`;
      const actionCode = branch.replace(/\bel\b/g, 'item');
      return `document.querySelectorAll('${cleanClass}').forEach(item => {\n  ${actionCode.replace(/\n/g, '\n  ')}\n});\n`;
    } else {
      const cleanTag = cleanRaw.replace(/^<|>$/g, '').trim().toLowerCase();
      const innerTarget = block.getInputTargetBlock ? block.getInputTargetBlock('DO') : null;
      let branch = '';
      if (innerTarget) {
        if (innerTarget.type === 'mercury1_loop_foreach') {
          branch = javascriptGenerator.statementToCode(innerTarget, 'DO').trim();
        } else {
          branch = javascriptGenerator.statementToCode(block, 'DO').trim();
        }
      }
      if (!branch) return `const items = document.querySelectorAll('${cleanTag}');\n`;
      const actionCode = branch.replace(/\bel\b/g, 'item');
      return `document.querySelectorAll('${cleanTag}').forEach(item => {\n  ${actionCode.replace(/\n/g, '\n  ')}\n});\n`;
    }
  };

  // =========================================================================
  // Action Blocks: Can snap to right of Target ID OR inside For Each loop
  // =========================================================================
  Blockly.Blocks['mercury1_action_fertilize'] = {
    init: function () {
      this.appendDummyInput().appendField("Fertilize");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#10B981");
      this.setTooltip("Feeds plant food to make the plant healthy and strong!");
      this.setHelpUrl("");
    }
  };
  javascriptGenerator.forBlock['mercury1_action_fertilize'] = function () {
    return `el.className = 'fertilized';\n`;
  };

  Blockly.Blocks['mercury1_action_water'] = {
    init: function () {
      this.appendDummyInput().appendField("Water");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#0EA5E9");
      this.setTooltip("Waters the thirsty plant with fresh water!");
      this.setHelpUrl("");
    }
  };
  javascriptGenerator.forBlock['mercury1_action_water'] = function () {
    return `el.className = 'hydrated';\n`;
  };

  Blockly.Blocks['mercury1_action_open'] = {
    init: function () {
      this.appendDummyInput().appendField("Turn On");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour("#6366F1");
      this.setTooltip("Turns on the fan or air machine!");
      this.setHelpUrl("");
    }
  };
  javascriptGenerator.forBlock['mercury1_action_open'] = function () {
    return `el.className = 'open';\n`;
  };
}

export function getMercuryLevel1Toolbox() {
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Selectors',
        colour: '#0284C7',
        contents: [
          { kind: 'block', type: 'mercury1_target' },
        ],
      },
      {
        kind: 'category',
        name: 'Loops',
        colour: '#7C3AED',
        contents: [
          { kind: 'block', type: 'mercury1_loop_foreach' },
        ],
      },
      {
        kind: 'category',
        name: 'Actions',
        colour: '#10B981',
        contents: [
          { kind: 'block', type: 'mercury1_action_fertilize' },
          { kind: 'block', type: 'mercury1_action_water' },
          { kind: 'block', type: 'mercury1_action_open' },
        ],
      },
    ],
  };
}

/**
 * Parses the workspace blocks for Mercury Level 1 and evaluates execution logic.
 * Instructions.md Rule 1: Tag + "vent" → isVentsOpen = true
 * Instructions.md Rule 2: ID + "star-flower" → check isVentsOpen, fail or win
 * Strict Match Enforcement: any mistype fails.
 */
export function parseMercuryLevel1Workspace(workspace: Blockly.WorkspaceSvg | null): MercuryLevel1Validation {
  const result: MercuryLevel1Validation = {
    ...INITIAL_MERCURY_LEVEL_1_VALIDATION,
    wateredShrubIndices: [],
    wateredFlowerIndices: [],
    diagnosticLogs: [],
  };

  if (!workspace) return result;

  const topBlocks = workspace.getTopBlocks(true);
  result.hasBlocks = topBlocks.length > 0;
  if (!result.hasBlocks) {
    result.diagnosticLogs.push({
      type: 'info',
      message: 'Workspace is empty! Drag a Target block and an Action block to get started.',
      timestamp: Date.now(),
    });
    return result;
  }

  try {
    result.jsCode = javascriptGenerator.workspaceToCode(workspace);
  } catch (e) {
    result.jsCode = '// Error generating code';
  }

  const allBlocks = workspace.getAllBlocks(false);

  // -------------------------------------------------------------------------
  // Pass 0: Audit Block Hierarchy & Misplaced Blocks
  // -------------------------------------------------------------------------
  for (const block of allBlocks) {
    // Audit 1: Target ID block checks
    const selectorType = block.type === 'mercury1_target' ? (block.getFieldValue('SELECTOR_TYPE') || '') : '';
    const isIdBlock = block.type === 'mercury1_target_id' || selectorType === 'ID';
    if (isIdBlock) {
      const parent = block.getParent();
      const innerBlock = block.getInputTargetBlock ? block.getInputTargetBlock('DO') : null;

      // Case 1A: For Each loop placed INSIDE Target ID cutout
      if (innerBlock && innerBlock.type === 'mercury1_loop_foreach') {
        result.hasMisplacedBlockError = true;
        result.misplacedBlockErrorMessage = "IDs only target 1 item! Snap your action directly below it without a loop.";
        result.diagnosticLogs.push({ type: 'error', message: result.misplacedBlockErrorMessage, timestamp: Date.now() });
        return result;
      }

      // Case 1B: Target ID placed inside another container's cutout
      if (parent && parent.getInputTargetBlock && parent.getInputTargetBlock('DO') === block) {
        result.hasMisplacedBlockError = true;
        result.misplacedBlockErrorMessage = "Target ID belongs on its own. Snap your action directly below it.";
        result.diagnosticLogs.push({ type: 'error', message: result.misplacedBlockErrorMessage, timestamp: Date.now() });
        return result;
      }
    }

    // Audit 2: Target Block nested inside another Target Block or Loop
    if (block.type && block.type.startsWith('mercury1_target')) {
      const parent = block.getParent();
      if (parent && parent.getInputTargetBlock && parent.getInputTargetBlock('DO') === block && parent.type.startsWith('mercury1_target')) {
        result.hasMisplacedBlockError = true;
        result.misplacedBlockErrorMessage = "Keep Target blocks separate. Don't put a Target inside another Target.";
        result.diagnosticLogs.push({ type: 'error', message: result.misplacedBlockErrorMessage, timestamp: Date.now() });
        return result;
      }
      if (parent && parent.type === 'mercury1_loop_foreach') {
        result.hasMisplacedBlockError = true;
        result.misplacedBlockErrorMessage = "Only action blocks belong inside loops. Move your Target block outside.";
        result.diagnosticLogs.push({ type: 'error', message: result.misplacedBlockErrorMessage, timestamp: Date.now() });
        return result;
      }
    }

    // Audit 3: For Each loop checks
    if (block.type === 'mercury1_loop_foreach') {
      const prev = block.getPreviousBlock();
      const parent = block.getParent();

      // Case 3A: For Each loop placed BELOW a Target block (connected to bottom notch, not inside DO)
      const isUnderneath = prev && prev.getNextBlock && prev.getNextBlock() === block;
      if (isUnderneath) {
        const isTargetBlock = prev.type === 'mercury1_target_id' || prev.type === 'mercury1_target_class' || prev.type === 'mercury1_target_tag' || prev.type === 'mercury1_target';
        if (isTargetBlock) {
          const prevSel = prev.type === 'mercury1_target' ? (prev.getFieldValue('SELECTOR_TYPE') || '') : '';
          const isPrevId = prev.type === 'mercury1_target_id' || prevSel === 'ID';
          if (isPrevId) {
            result.hasMisplacedBlockError = true;
            result.misplacedBlockErrorMessage = "IDs only target 1 item! Change the dropdown to Class (.) or Tag (< >) to loop through multiple items.";
            result.diagnosticLogs.push({ type: 'error', message: result.misplacedBlockErrorMessage, timestamp: Date.now() });
            return result;
          } else if (prevSel === 'CLASS' || prevSel === 'TAG' || prev.type === 'mercury1_target_class' || prev.type === 'mercury1_target_tag') {
            result.hasMisplacedBlockError = true;
            result.misplacedBlockErrorMessage = "Snap your loop INSIDE the Target block's cutout, not below it.";
            result.diagnosticLogs.push({ type: 'error', message: result.misplacedBlockErrorMessage, timestamp: Date.now() });
            return result;
          } else {
            result.hasMisplacedBlockError = true;
            result.misplacedBlockErrorMessage = "Choose Class (.) or Tag (< >) in your Target block to loop through items.";
            result.diagnosticLogs.push({ type: 'error', message: result.misplacedBlockErrorMessage, timestamp: Date.now() });
            return result;
          }
        }
      }

      // Case 3B: Nested For Each loops
      if (parent && parent.type === 'mercury1_loop_foreach') {
        result.hasMisplacedBlockError = true;
        result.misplacedBlockErrorMessage = "You only need 1 loop! Snap an action block inside.";
        result.diagnosticLogs.push({ type: 'error', message: result.misplacedBlockErrorMessage, timestamp: Date.now() });
        return result;
      }

      // Case 3C: For Each loop floating alone without a valid Target container
      // (Informative log only - do NOT halt execution if player has other valid blocks)
      const isInsideValidTarget = parent && (
        parent.type === 'mercury1_target_class' || 
        parent.type === 'mercury1_target_tag' ||
        (parent.type === 'mercury1_target' && (parent.getFieldValue('SELECTOR_TYPE') === 'CLASS' || parent.getFieldValue('SELECTOR_TYPE') === 'TAG'))
      ) && parent.getInputTargetBlock && parent.getInputTargetBlock('DO') === block;

      if (!isUnderneath && !isInsideValidTarget) {
        result.diagnosticLogs.push({
          type: 'info',
          message: "Place your loop inside a Target Class (.) or Target Tag (< >) container.",
          timestamp: Date.now(),
        });
      }

      // Case 3D: Empty For Each loop
      const loopAction = block.getInputTargetBlock('DO');
      if (isInsideValidTarget && !loopAction) {
        result.hasMissingActionError = true;
        result.diagnosticLogs.push({ type: 'warn', message: 'Your loop is empty! Put an action block inside.', timestamp: Date.now() });
      }
    }

    // Audit 4: Action block placement checks
    if (block.type && block.type.startsWith('mercury1_action_')) {
      const parent = block.getParent();
      const prev = block.getPreviousBlock();

      // Floating alone (scratchpad block - inform rather than aborting)
      if (!parent && !prev) {
        result.diagnosticLogs.push({
          type: 'info',
          message: "Snap action blocks inside a Target container to execute them.",
          timestamp: Date.now(),
        });
      }

      // Snapped underneath a container Target block instead of inside its cutout
      const isUnderneath = prev && prev.getNextBlock && prev.getNextBlock() === block;
      const isContainerTarget = isUnderneath && (
        prev.type === 'mercury1_target_class' || 
        prev.type === 'mercury1_target_tag' ||
        (prev.type === 'mercury1_target' && prev.getFieldValue('SELECTOR_TYPE') !== 'ID')
      );
      if (isContainerTarget) {
        result.hasMisplacedBlockError = true;
        result.misplacedBlockErrorMessage = "Snap your action block INSIDE the container cutout, not below it.";
        result.diagnosticLogs.push({ type: 'error', message: result.misplacedBlockErrorMessage, timestamp: Date.now() });
        return result;
      }
    }
  }

  // Helper function to extract actions from a statement or chain
  const getActionChain = (startBlock: any): string[] => {
    const actions: string[] = [];
    let curr = startBlock;
    while (curr && curr.type && curr.type.startsWith('mercury1_action_')) {
      actions.push(curr.type);
      curr = curr.getNextBlock ? curr.getNextBlock() : null;
    }
    return actions;
  };

  // Pass 1: Pre-scan vent state before evaluating flower dependency
  allBlocks.forEach(block => {
    let cleanTag = '';
    let actions: string[] = [];

    const isTagBlock = block.type === 'mercury1_target_tag' || (block.type === 'mercury1_target' && (block.getFieldValue('SELECTOR_TYPE') || '') === 'TAG');
    if (isTagBlock) {
      const rawName: string = (block.getFieldValue('TARGET_NAME') || '').trim();
      cleanTag = rawName.replace(/^['"`]|['"`]$/g, '').replace(/;+$/, '').replace(/^<|>$/g, '').trim().toLowerCase();
      const innerBlock = block.getInputTargetBlock ? block.getInputTargetBlock('DO') : null;
      const nextBlock = block.getNextBlock ? block.getNextBlock() : null;
      const loopBlock = (innerBlock && innerBlock.type === 'mercury1_loop_foreach')
        ? innerBlock
        : (nextBlock && nextBlock.type === 'mercury1_loop_foreach' ? nextBlock : null);
      if (loopBlock) {
        actions = getActionChain(loopBlock.getInputTargetBlock('DO'));
      } else if (innerBlock && innerBlock.type && innerBlock.type.startsWith('mercury1_action_')) {
        actions = getActionChain(innerBlock);
      }
    }

    if (
      cleanTag === 'vent' &&
      actions.includes('mercury1_action_open') &&
      !actions.includes('mercury1_action_water')
    ) {
      result.isVentsOpened = true;
      result.isVentsOpen = true;
      result.hasVentBlock = true;
      result.objective1Vents = true;
      result.objective2Vents = true;
    }
  });

  // Pass 2: Full evaluation with resolved environmental dependencies
  allBlocks.forEach(block => {
    // Check for incomplete Target blocks with placeholder values
    if (block.type === 'mercury1_target') {
      const selType = (block.getFieldValue('SELECTOR_TYPE') || '').trim();
      const targName = (block.getFieldValue('TARGET_NAME') || '').trim();
      if (!selType) {
        result.hasEmptyTargetError = true;
        result.diagnosticLogs.push({
          type: 'error',
          message: 'Please choose a selector type (ID, Class, or Tag) from the dropdown!',
          timestamp: Date.now(),
        });
        return;
      }
      if (!targName) {
        result.hasEmptyTargetError = true;
        result.diagnosticLogs.push({
          type: 'error',
          message: 'Please choose a target object from the dropdown!',
          timestamp: Date.now(),
        });
        return;
      }
    }

    // -----------------------------------------------------------------------
    // A. TARGET ID BLOCK (mercury1_target_id or legacy mercury1_target with ID)
    // -----------------------------------------------------------------------
    if (block.type === 'mercury1_target_id' || (block.type === 'mercury1_target' && block.getFieldValue('SELECTOR_TYPE') === 'ID')) {
      const rawName: string = (block.getFieldValue('TARGET_NAME') || '').trim();
      const cleanRaw = rawName.replace(/^['"`]|['"`]$/g, '').replace(/;+$/, '').trim();
      const cleanId = cleanRaw.replace(/^#/, '').trim();

      // Retrieve action from container DO cutout (or legacy ACTION socket, or directly snapped below)
      let actionBlock = (block.getInputTargetBlock && (block.getInputTargetBlock('DO') || block.getInputTargetBlock('ACTION'))) || null;
      if (!actionBlock) {
        const next = block.getNextBlock ? block.getNextBlock() : null;
        if (next && next.type && next.type.startsWith('mercury1_action_')) {
          actionBlock = next;
        }
      }

      const actions = getActionChain(actionBlock);

      // Empty target name
      if (!cleanRaw) {
        result.hasEmptyTargetError = true;
        result.diagnosticLogs.push({
          type: 'error',
          message: 'Choose a target from the dropdown!',
          timestamp: Date.now(),
        });
        return;
      }

      // JS syntax typed
      if (cleanRaw.includes('document.') || cleanRaw.includes('getElementById') || cleanRaw.includes('querySelector')) {
        result.hasTypoOrCaseError = true;
        result.typoErrorMessage = 'Pick an item from the dropdown, not code!';
        result.diagnosticLogs.push({
          type: 'error',
          message: result.typoErrorMessage,
          timestamp: Date.now(),
        });
        return;
      }

      // Missing action block
      if (actions.length === 0) {
        result.hasMissingActionError = true;
        result.diagnosticLogs.push({
          type: 'warn',
          message: 'Snap an action block directly below Target ID.',
          timestamp: Date.now(),
        });
        return;
      }

      // Broad nuke selector guard
      const broadMatches = ['div', '*', 'body', 'html', 'all'];
      if (broadMatches.includes(cleanRaw.toLowerCase())) {
        result.usedBroadNukeSelector = true;
        result.broadSelectorTarget = cleanRaw;
        result.diagnosticLogs.push({
          type: 'error',
          message: 'Target is too broad! Pick a specific element.',
          timestamp: Date.now(),
        });
        return;
      }

      // 1. Star Flower ID (#star-flower)
      if (cleanId === 'star-flower') {
        result.hasLilyBlock = true;

        if (actions.includes('mercury1_action_open')) {
          result.isStarFlowerOpenedWrong = true;
          result.diagnosticLogs.push({
            type: 'warn',
            message: 'The Star Flower needs fertilizer and water, not a power switch!',
            timestamp: Date.now(),
          });
          return;
        }

        const hasFertilize = actions.includes('mercury1_action_fertilize');
        const hasWater = actions.includes('mercury1_action_water');

        if (hasFertilize || hasWater) {
          if (!result.isVentsOpened) {
            result.isStarFlowerFertilizeFail = true;
            result.diagnosticLogs.push({
              type: 'warn',
              message: 'The greenhouse is too hot to tend to the Star Flower! Turn on the vents first.',
              timestamp: Date.now(),
            });
            return;
          }

          if (hasFertilize) {
            result.starFlowerHasFertilizer = true;
          }
          if (hasWater) {
            result.starFlowerHasWater = true;
          }

          if (result.starFlowerHasFertilizer && result.starFlowerHasWater) {
            result.isLilyWatered = true;
            result.objective3StarFlower = true;
            result.objective1Lily = true;
            result.isStarFlowerNeedsWater = false;
            result.isStarFlowerNeedsFertilizer = false;
            result.diagnosticLogs.push({
              type: 'success',
              message: 'The Star Flower is fertilized and watered, blooming with radiant life!',
              timestamp: Date.now(),
            });
          } else if (result.starFlowerHasFertilizer && !result.starFlowerHasWater) {
            result.isStarFlowerNeedsWater = true;
            result.objective3StarFlower = false;
            result.objective1Lily = false;
            result.isLilyWatered = false;
            result.diagnosticLogs.push({
              type: 'info',
              message: 'The Star Flower received fertilizer, but it also needs water to fully bloom!',
              timestamp: Date.now(),
            });
          } else if (!result.starFlowerHasFertilizer && result.starFlowerHasWater) {
            result.isStarFlowerNeedsFertilizer = true;
            result.objective3StarFlower = false;
            result.objective1Lily = false;
            result.isLilyWatered = false;
            result.diagnosticLogs.push({
              type: 'info',
              message: 'The Star Flower received water, but it also needs fertilizer to fully bloom!',
              timestamp: Date.now(),
            });
          }
        }
      }
      // 2. Shelf Flowers as IDs (#flower-1 to #flower-5) - legacy support
      else if (/^flower-[1-5]$/i.test(cleanId)) {
        result.hasFlowerBlock = true;
        const flowerIdx = parseInt(cleanId.replace(/^flower-/i, '')) - 1;

        if (actions.includes('mercury1_action_open')) {
          result.diagnosticLogs.push({
            type: 'warn',
            message: `Flowers need water, not a power switch!`,
            timestamp: Date.now(),
          });
          return;
        }

        if (actions.includes('mercury1_action_fertilize')) {
          result.diagnosticLogs.push({
            type: 'info',
            message: `Flowers need Water, not fertilizer!`,
            timestamp: Date.now(),
          });
          return;
        }

        if (actions.includes('mercury1_action_water')) {
          if (!result.wateredFlowerIndices.includes(flowerIdx)) {
            result.wateredFlowerIndices.push(flowerIdx);
          }
          if (result.wateredFlowerIndices.length === 5) {
            result.isAllFlowersWatered = true;
          }
          result.diagnosticLogs.push({
            type: 'success',
            message: `Flower #${flowerIdx + 1} is watered and healthy!`,
            timestamp: Date.now(),
          });
        }
      }
      // 3. Category Errors on ID block
      else if (cleanId.toLowerCase() === 'flower') {
        result.hasTypoOrCaseError = true;
        result.typoErrorMessage = "Flowers are a group! Use Class (.) flower.";
        result.diagnosticLogs.push({
          type: 'error',
          message: result.typoErrorMessage,
          timestamp: Date.now(),
        });
      }
      else if (
        cleanId.toLowerCase() === 'shrub' ||
        cleanId.toLowerCase() === 'potted-shrub'
      ) {
        result.hasTypoOrCaseError = true;
        result.typoErrorMessage = "Shrubs are a group! Use Class (.) shrub.";
        result.diagnosticLogs.push({
          type: 'error',
          message: result.typoErrorMessage,
          timestamp: Date.now(),
        });
      } else if (cleanId.toLowerCase() === 'vent') {
        result.hasTypoOrCaseError = true;
        result.typoErrorMessage = "Vents use Tag (< >) vent, not an ID.";
        result.diagnosticLogs.push({
          type: 'error',
          message: result.typoErrorMessage,
          timestamp: Date.now(),
        });
      } else {
        result.hasTypoOrCaseError = true;
        if (cleanRaw.startsWith('.')) {
          result.typoErrorMessage = "That's a Class, not an ID!";
        } else if (cleanRaw.startsWith('<')) {
          result.typoErrorMessage = "That's a Tag, not an ID!";
        } else {
          result.typoErrorMessage = `Target not found! Choose from the dropdown.`;
        }
        result.diagnosticLogs.push({
          type: 'error',
          message: result.typoErrorMessage,
          timestamp: Date.now(),
        });
      }
    }

    // -----------------------------------------------------------------------
    // B. TARGET CLASS BLOCK (mercury1_target_class or legacy mercury1_target with CLASS)
    // -----------------------------------------------------------------------
    else if (block.type === 'mercury1_target_class' || (block.type === 'mercury1_target' && block.getFieldValue('SELECTOR_TYPE') === 'CLASS')) {
      const rawName: string = (block.getFieldValue('TARGET_NAME') || '').trim();
      const cleanRaw = rawName.replace(/^['"`]|['"`]$/g, '').replace(/;+$/, '').trim();
      const cleanClass = cleanRaw.replace(/^\./, '').trim().toLowerCase();

      // Retrieve actions from container DO cutout (direct action OR nested for-each loop) or snapped below
      const innerTarget = block.getInputTargetBlock ? block.getInputTargetBlock('DO') : null;
      const nextBlock = block.getNextBlock ? block.getNextBlock() : null;

      let actions: string[] = [];
      if (innerTarget) {
        if (innerTarget.type === 'mercury1_loop_foreach') {
          actions = getActionChain(innerTarget.getInputTargetBlock('DO'));
        } else if (innerTarget.type && innerTarget.type.startsWith('mercury1_action_')) {
          actions = getActionChain(innerTarget);
        }
      } else if (nextBlock && nextBlock.type && nextBlock.type.startsWith('mercury1_action_')) {
        actions = getActionChain(nextBlock);
      }

      // Empty target name
      if (!cleanRaw) {
        result.hasEmptyTargetError = true;
        result.diagnosticLogs.push({
          type: 'error',
          message: 'Choose a target from the dropdown!',
          timestamp: Date.now(),
        });
        return;
      }

      if (actions.length === 0) {
        result.hasMissingActionError = true;
        result.diagnosticLogs.push({
          type: 'warn',
          message: 'Snap an action block inside the Target Class container.',
          timestamp: Date.now(),
        });
        return;
      }

      if (cleanClass === 'shrub' || cleanClass === 'potted-shrub' || cleanClass === 'dry-shrub') {
        result.hasShrubBlock = true;

        if (actions.includes('mercury1_action_open')) {
          result.diagnosticLogs.push({
            type: 'warn',
            message: `Shrubs need Fertilizer, not a power switch!`,
            timestamp: Date.now(),
          });
          return;
        }

        if (actions.includes('mercury1_action_water')) {
          result.diagnosticLogs.push({
            type: 'info',
            message: `Shrubs need Fertilizer to grow, not water!`,
            timestamp: Date.now(),
          });
          return;
        }

        if (actions.includes('mercury1_action_fertilize')) {
          result.wateredShrubIndices = [0, 1, 2, 3, 4];
          result.isAllShrubsWatered = true;
          result.diagnosticLogs.push({
            type: 'success',
            message: `All the shrubs are fertilized and healthy!`,
            timestamp: Date.now(),
          });
        }
      } else if (cleanClass === 'flower' || cleanClass === 'potted-flower' || cleanClass === 'blooming-flower') {
        result.hasFlowerBlock = true;

        if (actions.includes('mercury1_action_open')) {
          result.diagnosticLogs.push({
            type: 'warn',
            message: `Flowers need Water, not a power switch!`,
            timestamp: Date.now(),
          });
          return;
        }

        if (actions.includes('mercury1_action_fertilize')) {
          result.diagnosticLogs.push({
            type: 'info',
            message: `Flowers need Water to bloom!`,
            timestamp: Date.now(),
          });
          return;
        }

        if (actions.includes('mercury1_action_water')) {
          result.wateredFlowerIndices = [0, 1, 2, 3, 4];
          result.isAllFlowersWatered = true;
          result.diagnosticLogs.push({
            type: 'success',
            message: `All the shelf flowers are watered and blooming!`,
            timestamp: Date.now(),
          });
        }
      } else if (cleanClass === 'star-flower') {
        result.hasTypoOrCaseError = true;
        result.typoErrorMessage = "The Star Flower is unique! Use Target ID (#) star-flower.";
        result.diagnosticLogs.push({
          type: 'error',
          message: result.typoErrorMessage,
          timestamp: Date.now(),
        });
      } else if (cleanClass === 'vent') {
        result.hasTypoOrCaseError = true;
        result.typoErrorMessage = "Vents use Tag (< >) vent, not a Class.";
        result.diagnosticLogs.push({
          type: 'error',
          message: result.typoErrorMessage,
          timestamp: Date.now(),
        });
      } else {
        result.hasTypoOrCaseError = true;
        if (cleanRaw.startsWith('#')) {
          result.typoErrorMessage = "That's an ID (#), not a Class! Use Target ID (#).";
        } else if (cleanRaw.startsWith('<')) {
          result.typoErrorMessage = "Vents use Tag (< >) vent, not a Class.";
        } else {
          result.typoErrorMessage = `Class not found! Choose from the dropdown.`;
        }
        result.diagnosticLogs.push({
          type: 'error',
          message: result.typoErrorMessage,
          timestamp: Date.now(),
        });
      }
    }

    // -----------------------------------------------------------------------
    // C. TARGET TAG BLOCK (mercury1_target_tag or legacy mercury1_target with TAG)
    // -----------------------------------------------------------------------
    else if (block.type === 'mercury1_target_tag' || (block.type === 'mercury1_target' && block.getFieldValue('SELECTOR_TYPE') === 'TAG')) {
      const rawName: string = (block.getFieldValue('TARGET_NAME') || '').trim();
      const cleanRaw = rawName.replace(/^['"`]|['"`]$/g, '').replace(/;+$/, '').trim();
      const cleanTag = cleanRaw.replace(/^<|>$/g, '').trim().toLowerCase();

      // Retrieve actions from container DO cutout (direct action OR nested for-each loop) or snapped below
      const innerTarget = block.getInputTargetBlock ? block.getInputTargetBlock('DO') : null;
      const nextBlock = block.getNextBlock ? block.getNextBlock() : null;

      let actions: string[] = [];
      if (innerTarget) {
        if (innerTarget.type === 'mercury1_loop_foreach') {
          actions = getActionChain(innerTarget.getInputTargetBlock('DO'));
        } else if (innerTarget.type && innerTarget.type.startsWith('mercury1_action_')) {
          actions = getActionChain(innerTarget);
        }
      } else if (nextBlock && nextBlock.type && nextBlock.type.startsWith('mercury1_action_')) {
        actions = getActionChain(nextBlock);
      }

      // Empty target name
      if (!cleanRaw) {
        result.hasEmptyTargetError = true;
        result.diagnosticLogs.push({
          type: 'error',
          message: 'Choose a target from the dropdown!',
          timestamp: Date.now(),
        });
        return;
      }

      if (actions.length === 0) {
        result.hasMissingActionError = true;
        result.diagnosticLogs.push({
          type: 'warn',
          message: 'Snap an action block inside the Target Tag container.',
          timestamp: Date.now(),
        });
        return;
      }

      if (cleanTag === 'vent') {
        result.hasVentBlock = true;

        if (actions.includes('mercury1_action_water')) {
          result.isVentWateredWrong = true;
          result.isVentsOpened = false;
          result.isVentsOpen = false;
          result.objective1Vents = false;
          result.objective2Vents = false;
          result.diagnosticLogs.push({
            type: 'warn',
            message: `Don't pour water into fans! Use Turn On.`,
            timestamp: Date.now(),
          });
        } else if (actions.includes('mercury1_action_fertilize')) {
          result.isVentsOpened = false;
          result.isVentsOpen = false;
          result.objective1Vents = false;
          result.objective2Vents = false;
          result.diagnosticLogs.push({
            type: 'warn',
            message: `Fans need electricity, not fertilizer! Use Turn On.`,
            timestamp: Date.now(),
          });
        } else if (actions.includes('mercury1_action_open')) {
          result.isVentsOpened = true;
          result.isVentsOpen = true;
          result.objective1Vents = true;
          result.objective2Vents = true;
          result.diagnosticLogs.push({
            type: 'success',
            message: `The ventilation fans are running and cooling the dome!`,
            timestamp: Date.now(),
          });
        }
      } else if (cleanTag === 'star-flower') {
        result.hasTypoOrCaseError = true;
        result.typoErrorMessage = "The Star Flower is unique! Use Target ID (#) star-flower.";
        result.diagnosticLogs.push({
          type: 'error',
          message: result.typoErrorMessage,
          timestamp: Date.now(),
        });
      } else if (
        cleanTag === 'shrub' ||
        cleanTag === 'potted-shrub' ||
        cleanTag === 'flower' ||
        cleanTag === 'potted-flower' ||
        cleanTag === 'blooming-flower'
      ) {
        result.hasTypoOrCaseError = true;
        result.typoErrorMessage = "Plants use Class (.shrub or .flower), not a Tag.";
        result.diagnosticLogs.push({
          type: 'error',
          message: result.typoErrorMessage,
          timestamp: Date.now(),
        });
      } else {
        result.hasTypoOrCaseError = true;
        if (cleanRaw.startsWith('#')) {
          result.typoErrorMessage = "That's an ID (#), not a Tag! Use Target ID (#).";
        } else if (cleanRaw.startsWith('.')) {
          result.typoErrorMessage = "Plants use Class (.shrub or .flower), not a Tag.";
        } else {
          result.typoErrorMessage = `Tag not found! Choose from the dropdown.`;
        }
        result.diagnosticLogs.push({
          type: 'error',
          message: result.typoErrorMessage,
          timestamp: Date.now(),
        });
      }
    }
  });

  // Check composite goal 2: Both shrubs fertilized AND companion flowers watered
  if (result.isAllShrubsWatered && (result.isAllFlowersWatered || result.wateredFlowerIndices.length >= 5)) {
    result.objective2Plants = true;
    result.objective3Shrubs = true;
  }

  // Check composite goal 3: Centerpiece Star Flower fertilized AND watered
  if (result.starFlowerHasFertilizer && result.starFlowerHasWater && result.isVentsOpened) {
    result.isLilyWatered = true;
    result.objective3StarFlower = true;
    result.objective1Lily = true;
  } else {
    result.objective3StarFlower = false;
    result.objective1Lily = false;
    result.isLilyWatered = false;
  }

  // Level Clear: When all 3 objectives are met:
  // 1. Vents cooling the greenhouse
  // 2. Shrubs fertilized & companion flowers watered
  // 3. Centerpiece Star Flower fertilized and watered
  const isWin =
    result.objective1Vents &&
    result.isAllShrubsWatered &&
    (result.isAllFlowersWatered || result.wateredFlowerIndices.length >= 5) &&
    result.objective3StarFlower &&
    !result.usedBroadNukeSelector &&
    !result.usedQuerySelectorTrap;

  if (isWin) {
    result.isLilyWatered = true; // Displays healthy Star Flower form
    result.objective3StarFlower = true;
    result.objective1Lily = true;
    result.isAllCompleted = true;
    result.diagnosticLogs.push({
      type: 'success',
      message: 'BIODOME RESTORED: All systems active! The Star Flower is blooming with radiant life!',
      timestamp: Date.now() + 50,
    });
  }

  return result;
}
