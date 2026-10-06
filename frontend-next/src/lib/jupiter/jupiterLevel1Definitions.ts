import * as Blockly from 'blockly';
import { javascriptGenerator, Order } from 'blockly/javascript';

export type JupiterDataType = 'String' | 'int' | 'boolean';

export interface JupiterVariable {
  id: string;
  varType: JupiterDataType | null;
  varName: string;
  rawValue: string | number | boolean | null;
  valueKind: 'text' | 'number' | 'boolean' | 'string_boolean_trap' | null;
}

export interface JupiterPhysicalLock {
  id: number;
  label: string;
  dataType: JupiterDataType;
  expectedValue: string | number | boolean;
  status: 'locked' | 'injecting' | 'unlocked' | 'failed';
  displayValue: string;
  errorReason?: string;
  disengaged: boolean;
}

export interface JupiterAction {
  id: string;
  type: 'enter_code' | 'unlock_doors';
  varName?: string;
  targetLock?: 'string_lock' | 'int_pinpad' | 'boolean_breaker';
}

export interface JupiterLevel1Validation {
  variables: JupiterVariable[];
  actions: JupiterAction[];
  hasUnlockAction: boolean;
  locks: JupiterPhysicalLock[];
  javaCode: string;
  objective1String: boolean;   // String password = "JupiterSecurity"
  objective2Int: boolean;      // int pin = 1234
  objective3Boolean: boolean;  // boolean override = true
  isAllUnlocked: boolean;
  hasErrors: boolean;
  missingNameError?: string;
  duplicateNameError?: string;
  typeMismatchError?: string;
  stringBooleanTrapError?: string;
  generalError?: string;
}

export const INITIAL_JUPITER_LEVEL_1_VALIDATION: JupiterLevel1Validation = {
  variables: [],
  actions: [],
  hasUnlockAction: false,
  locks: [
    {
      id: 0,
      label: 'STRING LOCK',
      dataType: 'String',
      expectedValue: 'JupiterSecurity',
      status: 'locked',
      displayValue: '',
      disengaged: false,
    },
    {
      id: 1,
      label: 'PIN LOCK',
      dataType: 'int',
      expectedValue: 1234,
      status: 'locked',
      displayValue: '',
      disengaged: false,
    },
    {
      id: 2,
      label: 'BOOLEAN LOCK',
      dataType: 'boolean',
      expectedValue: true,
      status: 'locked',
      displayValue: '',
      disengaged: false,
    },
  ],
  javaCode: '',
  objective1String: false,
  objective2Int: false,
  objective3Boolean: false,
  isAllUnlocked: false,
  hasErrors: false,
};

let blocksRegistered = false;

export function registerJupiterLevel1Blocks() {
  if (blocksRegistered) return;
  blocksRegistered = true;

  // =========================================================================
  // Block 1: Variable Wrapper Block (Linear Declaration - Option A 1-Line)
  // [ create ] [ Type Slot ] [ Name Dropdown ▾ ] [ = ] [ Value Slot ]
  // =========================================================================
  Blockly.Blocks['jupiter_variable_declare'] = {
    init: function () {
      this.appendValueInput('TYPE')
        .setCheck('JupiterType')
        .appendField('create');

      this.appendDummyInput('NAME_INPUT')
        .appendField(
          new Blockly.FieldDropdown([
            ['(choose name)', ''],
            ['password', 'password'],
            ['pin', 'pin'],
            ['override', 'override'],
          ]),
          'VAR_NAME'
        )
        .appendField('=');

      this.appendValueInput('VALUE')
        .setCheck('JupiterValue');

      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#8B5CF6'); // Vibrant Violet
      this.setTooltip('Creates a variable to store words, numbers, or true/false.');
      this.setHelpUrl('');
    },
    onchange: function (event: any) {
      if (!this.workspace || this.workspace.isDragging()) return;

      const typeBlock = this.getInputTargetBlock('TYPE');
      const valBlock = this.getInputTargetBlock('VALUE');

      if (typeBlock && valBlock) {
        const declaredType = ((typeBlock as any).typeValue || typeBlock.type || '').toString();
        const valueKind = valBlock.type;

        let isMismatch = false;
        let errorMsg = '';

        const isIntType = declaredType.includes('int') || declaredType === 'int';
        const isStringType = declaredType.includes('string') || declaredType.includes('String') || declaredType === 'String';
        const isBoolType = declaredType.includes('bool') || declaredType === 'boolean';

        if (isIntType && valueKind === 'jupiter_val_text') {
          isMismatch = true;
          errorMsg = "Oops! An 'int' box is only for numbers. Try using a 'String' box for words!";
        } else if (isStringType && (valueKind === 'jupiter_val_number' || valueKind === 'jupiter_val_boolean')) {
          isMismatch = true;
          errorMsg = "Oops! A 'String' box is for words. Put text in quotation marks here!";
        } else if (isBoolType && valueKind === 'jupiter_val_text') {
          isMismatch = true;
          errorMsg = 'Careful! The text word "true" isn\'t the same as a true/false switch. Use the boolean toggle block!';
        } else if (isBoolType && valueKind === 'jupiter_val_number') {
          isMismatch = true;
          errorMsg = "Oops! A 'boolean' box is only for true or false switches, not numbers!";
        } else if (isIntType && valueKind === 'jupiter_val_boolean') {
          isMismatch = true;
          errorMsg = "Oops! An 'int' box is for whole numbers, not true/false switches!";
        }

        if (isMismatch) {
          try {
            valBlock.unplug(true);
          } catch (e) {}

          if (typeof window !== 'undefined' && (window as any).__onJupiterTypeMismatch) {
            (window as any).__onJupiterTypeMismatch(errorMsg);
          }
        }
      }
    },
  };

  javascriptGenerator.forBlock['jupiter_variable_declare'] = function (block: any) {
    const typeCode = javascriptGenerator.valueToCode(block, 'TYPE', Order.ATOMIC) || 'Object';
    const varName = (block.getFieldValue('VAR_NAME') || 'unnamed').trim();
    const valCode = javascriptGenerator.valueToCode(block, 'VALUE', Order.ATOMIC) || 'null';
    return `${typeCode} ${varName} = ${valCode};\n`;
  };

  // =========================================================================
  // Block 2: Enter Code Action Block
  // enter [variable ▾] into [lock ▾]
  // =========================================================================
  Blockly.Blocks['jupiter_action_enter_code'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('enter')
        .appendField(
          new Blockly.FieldDropdown([
            ['(choose variable)', ''],
            ['password', 'password'],
            ['pin', 'pin'],
            ['override', 'override'],
          ]),
          'VAR_NAME'
        )
        .appendField('into')
        .appendField(
          new Blockly.FieldDropdown([
            ['String Lock', 'string_lock'],
            ['PIN Lock', 'int_pinpad'],
            ['Boolean Lock', 'boolean_breaker'],
          ]),
          'TARGET_LOCK'
        );
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EC4899'); // Vibrant Pink
      this.setTooltip('Sends your saved code or number into a matching lock.');
      this.setHelpUrl('');
    },
  };
  javascriptGenerator.forBlock['jupiter_action_enter_code'] = function (block: any) {
    const varName = block.getFieldValue('VAR_NAME') || '';
    const targetLock = block.getFieldValue('TARGET_LOCK') || '';
    if (targetLock === 'string_lock') {
      return `OpticalScanner.enterCode(${varName || 'null'});\n`;
    } else if (targetLock === 'int_pinpad') {
      return `Pinpad.enterPin(${varName || '0'});\n`;
    } else if (targetLock === 'boolean_breaker') {
      return `Breaker.setOverride(${varName || 'false'});\n`;
    }
    return '';
  };

  // =========================================================================
  // Block 3: Unlock Doors Action Block
  // unlock airlock doors
  // =========================================================================
  Blockly.Blocks['jupiter_action_unlock_doors'] = {
    init: function () {
      this.appendDummyInput().appendField('unlock airlock doors');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#F43F5E'); // Vibrant Rose
      this.setTooltip('Opens the airlock doors once all 3 locks are disengaged!');
      this.setHelpUrl('');
    },
  };
  javascriptGenerator.forBlock['jupiter_action_unlock_doors'] = function () {
    return 'Airlock.unlockDoors();\n';
  };

  // =========================================================================
  // Type Blocks (Box Types / Data Types)
  // =========================================================================
  Blockly.Blocks['jupiter_type_string'] = {
    init: function () {
      this.appendDummyInput().appendField('String');
      (this as any).typeValue = 'String';
      this.setOutput(true, 'JupiterType');
      this.setColour('#2563EB'); // Vibrant Royal Blue
      this.setTooltip('Text type: holds words and letters in quotation marks.');
    },
  };
  javascriptGenerator.forBlock['jupiter_type_string'] = function () {
    return ['String', Order.ATOMIC];
  };

  Blockly.Blocks['jupiter_type_int'] = {
    init: function () {
      this.appendDummyInput().appendField('int');
      (this as any).typeValue = 'int';
      this.setOutput(true, 'JupiterType');
      this.setColour('#10B981'); // Vibrant Emerald Green
      this.setTooltip('Number type: holds whole numbers without decimal points.');
    },
  };
  javascriptGenerator.forBlock['jupiter_type_int'] = function () {
    return ['int', Order.ATOMIC];
  };

  Blockly.Blocks['jupiter_type_boolean'] = {
    init: function () {
      this.appendDummyInput().appendField('boolean');
      (this as any).typeValue = 'boolean';
      this.setOutput(true, 'JupiterType');
      this.setColour('#F59E0B'); // Vibrant Amber Gold
      this.setTooltip('Switch type: holds a simple true or false value.');
    },
  };
  javascriptGenerator.forBlock['jupiter_type_boolean'] = function () {
    return ['boolean', Order.ATOMIC];
  };

  // =========================================================================
  // Value Blocks (Passwords / Data Values)
  // =========================================================================
  Blockly.Blocks['jupiter_val_text'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('"')
        .appendField(new Blockly.FieldTextInput(''), 'TEXT_VAL')
        .appendField('"');
      this.setOutput(true, 'JupiterValue');
      this.setColour('#D946EF'); // Vibrant Fuchsia/Pink
      this.setTooltip('Type your words or letters inside quotation marks.');
    },
  };
  javascriptGenerator.forBlock['jupiter_val_text'] = function (block: any) {
    const raw = block.getFieldValue('TEXT_VAL') || '';
    return [`"${raw}"`, Order.ATOMIC];
  };

  Blockly.Blocks['jupiter_val_number'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('0'), 'NUM_VAL');
      this.setOutput(true, 'JupiterValue');
      this.setColour('#06B6D4'); // Vibrant Cyan/Teal
      this.setTooltip('Type a whole number here (like 1234).');
    },
  };
  javascriptGenerator.forBlock['jupiter_val_number'] = function (block: any) {
    const raw = (block.getFieldValue('NUM_VAL') || '0').replace(/,/g, '');
    return [raw, Order.ATOMIC];
  };

  Blockly.Blocks['jupiter_val_boolean'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(
          new Blockly.FieldDropdown([
            ['false', 'false'],
            ['true', 'true'],
          ]),
          'BOOL_VAL'
        );
      this.setOutput(true, 'JupiterValue');
      this.setColour('#EA580C'); // Vibrant Orange/Coral
      this.setTooltip('Choose a true (on) or false (off) switch.');
    },
  };
  javascriptGenerator.forBlock['jupiter_val_boolean'] = function (block: any) {
    const boolVal = block.getFieldValue('BOOL_VAL') === 'true' ? 'true' : 'false';
    return [boolVal, Order.ATOMIC];
  };
}

// =============================================================================
// TOOLBOX DEFINITION
// =============================================================================
export function getJupiterLevel1Toolbox() {
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Types',
        colour: '#2563EB',
        contents: [
          { kind: 'block', type: 'jupiter_type_string' },
          { kind: 'block', type: 'jupiter_type_int' },
          { kind: 'block', type: 'jupiter_type_boolean' },
        ],
      },
      {
        kind: 'category',
        name: 'Variables',
        colour: '#8B5CF6',
        contents: [
          { kind: 'block', type: 'jupiter_variable_declare' },
        ],
      },
      {
        kind: 'category',
        name: 'Values',
        colour: '#10B981',
        contents: [
          { kind: 'block', type: 'jupiter_val_text' },
          { kind: 'block', type: 'jupiter_val_number' },
          { kind: 'block', type: 'jupiter_val_boolean' },
        ],
      },
      {
        kind: 'category',
        name: 'Actions',
        colour: '#EC4899',
        contents: [
          { kind: 'block', type: 'jupiter_action_enter_code' },
          { kind: 'block', type: 'jupiter_action_unlock_doors' },
        ],
      },
    ],
  };
}

// =============================================================================
// DEFAULT WORKSPACE SKELETON (INITIALLY EMPTY)
// =============================================================================
export function getJupiterLevel1DefaultWorkspaceXml(): string {
  return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
}

// =============================================================================
// PARSE WORKSPACE LOGIC
// =============================================================================
export function parseJupiterLevel1Workspace(workspace: Blockly.WorkspaceSvg | null): JupiterLevel1Validation {
  if (!workspace) return INITIAL_JUPITER_LEVEL_1_VALIDATION;

  const allBlocks = workspace.getAllBlocks(false);
  const declareBlocks = allBlocks.filter(b => b.type === 'jupiter_variable_declare');
  const actionBlocks = allBlocks.filter(
    b => b.type === 'jupiter_action_enter_code' || b.type === 'jupiter_action_unlock_doors'
  );

  const variables: JupiterVariable[] = [];
  const linesOfCode: string[] = [];

  let missingNameError: string | undefined;
  let duplicateNameError: string | undefined;
  let stringBooleanTrapError: string | undefined;
  let typeMismatchError: string | undefined;

  const seenNames = new Set<string>();

  for (const block of declareBlocks) {
    let rawName = (block.getFieldValue('VAR_NAME') || '').trim();

    if (rawName === '(choose name)' || rawName === '(select name)') {
      rawName = '';
    }

    const typeBlock = block.getInputTargetBlock('TYPE');
    const valBlock = block.getInputTargetBlock('VALUE');

    let varType: JupiterDataType | null = null;
    if (typeBlock) {
      if (typeBlock.type === 'jupiter_type_string') varType = 'String';
      else if (typeBlock.type === 'jupiter_type_int') varType = 'int';
      else if (typeBlock.type === 'jupiter_type_boolean') varType = 'boolean';
    }

    let rawValue: string | number | boolean | null = null;
    let valueKind: JupiterVariable['valueKind'] = null;

    if (valBlock) {
      if (valBlock.type === 'jupiter_val_text') {
        const txt = valBlock.getFieldValue('TEXT_VAL') || '';
        rawValue = txt;
        valueKind = 'text';

        // Check String-as-Boolean trap (instructions.md line 113)
        if (txt.trim().toLowerCase() === 'true' || txt.trim().toLowerCase() === 'false') {
          stringBooleanTrapError = 'Careful! The text word "' + txt.trim() + '" isn\'t the same as a true/false switch. Use the boolean toggle block!';
        }
      } else if (valBlock.type === 'jupiter_val_number') {
        const numStr = (valBlock.getFieldValue('NUM_VAL') || '0').toString().replace(/,/g, '').trim();
        const parsed = parseInt(numStr, 10);
        rawValue = isNaN(parsed) ? 0 : parsed;
        valueKind = 'number';
      } else if (valBlock.type === 'jupiter_val_boolean') {
        const boolStr = valBlock.getFieldValue('BOOL_VAL');
        rawValue = boolStr === 'true';
        valueKind = 'boolean';
      }
    }

    // Name validations
    if (typeBlock && valBlock && !rawName) {
      missingNameError = "Don't forget to name your boxes so the computer knows what to call them!";
    }

    if (rawName) {
      const lower = rawName.toLowerCase();
      if (seenNames.has(lower)) {
        duplicateNameError = "Every box needs its own unique name! You can't have two boxes called the same thing.";
      }
      seenNames.add(lower);
    }

    // Code generation line
    if (varType && rawName && valBlock) {
      let formattedVal = '';
      if (valueKind === 'text') formattedVal = `"${rawValue}"`;
      else if (valueKind === 'number') formattedVal = `${rawValue}`;
      else if (valueKind === 'boolean') formattedVal = `${rawValue}`;
      linesOfCode.push(`${varType} ${rawName} = ${formattedVal};`);
    } else if (varType && rawName) {
      linesOfCode.push(`${varType} ${rawName};`);
    }

    variables.push({
      id: block.id,
      varType,
      varName: rawName,
      rawValue,
      valueKind,
    });
  }

  // Parse Action Blocks
  const actions: JupiterAction[] = [];
  let hasUnlockAction = false;

  for (const block of actionBlocks) {
    if (block.type === 'jupiter_action_enter_code') {
      const rawVar = (block.getFieldValue('VAR_NAME') || '').trim();
      const varName = rawVar === '(choose variable)' ? '' : rawVar;
      const targetLock = block.getFieldValue('TARGET_LOCK') as JupiterAction['targetLock'];
      actions.push({
        id: block.id,
        type: 'enter_code',
        varName,
        targetLock,
      });
    } else if (block.type === 'jupiter_action_unlock_doors') {
      hasUnlockAction = true;
      actions.push({
        id: block.id,
        type: 'unlock_doors',
      });
    }
  }

  // Evaluate against the 3 required locks based on the programmed actions
  let stringFound = false;
  let stringValue = '';
  let stringStatus: JupiterPhysicalLock['status'] = 'locked';
  let stringError: string | undefined;

  let intFound = false;
  let intValue = '';
  let intStatus: JupiterPhysicalLock['status'] = 'locked';
  let intError: string | undefined;

  let boolFound = false;
  let boolValue = '';
  let boolStatus: JupiterPhysicalLock['status'] = 'locked';
  let boolError: string | undefined;

  // Process actions targeting locks
  for (const act of actions) {
    if (act.type === 'enter_code') {
      const matchingVar = variables.find(
        v => v.varName && act.varName && v.varName.toLowerCase() === act.varName.toLowerCase()
      );

      if (act.targetLock === 'string_lock') {
        if (!matchingVar) {
          stringStatus = 'failed';
          stringError = `Variable '${act.varName || 'unassigned'}' was not declared.`;
        } else if (matchingVar.varType !== 'String') {
          stringStatus = 'failed';
          stringError = `Type Mismatch: String Lock expects a String variable, but received ${matchingVar.varType}.`;
        } else {
          stringValue = String(matchingVar.rawValue || '');
          if (matchingVar.rawValue === 'JupiterSecurity') {
            stringFound = true;
            stringStatus = 'unlocked';
          } else {
            stringStatus = 'failed';
            stringError = 'Access denied: Incorrect String password.';
          }
        }
      }

      if (act.targetLock === 'int_pinpad') {
        if (!matchingVar) {
          intStatus = 'failed';
          intError = `Variable '${act.varName || 'unassigned'}' was not declared.`;
        } else if (matchingVar.varType !== 'int') {
          intStatus = 'failed';
          intError = `Type Mismatch: PIN Lock expects an int variable, but received ${matchingVar.varType}.`;
        } else {
          intValue = String(matchingVar.rawValue ?? '');
          if (matchingVar.rawValue === 1234) {
            intFound = true;
            intStatus = 'unlocked';
          } else {
            intStatus = 'failed';
            intError = 'Access denied: Incorrect int PIN.';
          }
        }
      }

      if (act.targetLock === 'boolean_breaker') {
        if (!matchingVar) {
          boolStatus = 'failed';
          boolError = `Variable '${act.varName || 'unassigned'}' was not declared.`;
        } else if (matchingVar.varType !== 'boolean') {
          boolStatus = 'failed';
          boolError = `Type Mismatch: Boolean Lock expects a boolean variable, but received ${matchingVar.varType}.`;
        } else {
          boolValue = String(matchingVar.rawValue);
          if (matchingVar.rawValue === true) {
            boolFound = true;
            boolStatus = 'unlocked';
          } else {
            boolStatus = 'failed';
            boolError = 'Access denied: Boolean switch must be true.';
          }
        }
      }
    }
  }

  const isAllUnlocked = stringFound && intFound && boolFound && !missingNameError && !duplicateNameError && hasUnlockAction;

  const locks: JupiterPhysicalLock[] = [
    {
      id: 0,
      label: 'STRING LOCK',
      dataType: 'String',
      expectedValue: 'JupiterSecurity',
      status: stringStatus,
      displayValue: stringValue,
      errorReason: stringError,
      disengaged: stringFound,
    },
    {
      id: 1,
      label: 'PIN LOCK',
      dataType: 'int',
      expectedValue: 1234,
      status: intStatus,
      displayValue: intValue,
      errorReason: intError,
      disengaged: intFound,
    },
    {
      id: 2,
      label: 'BOOLEAN LOCK',
      dataType: 'boolean',
      expectedValue: true,
      status: boolStatus,
      displayValue: boolValue,
      errorReason: boolError,
      disengaged: boolFound,
    },
  ];

  // Compose Full Java Program
  const javaLines: string[] = [
    'public class AirlockControl {',
    '    public static void main(String[] args) {',
  ];

  if (linesOfCode.length > 0) {
    for (const line of linesOfCode) {
      javaLines.push(`        ${line}`);
    }
  }

  const actionLines: string[] = [];
  for (const act of actions) {
    if (act.type === 'enter_code') {
      const v = act.varName || 'code';
      if (act.targetLock === 'string_lock') {
        actionLines.push(`OpticalScanner.enterCode(${v});`);
      } else if (act.targetLock === 'int_pinpad') {
        actionLines.push(`Pinpad.enterPin(${v});`);
      } else if (act.targetLock === 'boolean_breaker') {
        actionLines.push(`Breaker.setOverride(${v});`);
      }
    } else if (act.type === 'unlock_doors') {
      actionLines.push('Airlock.unlockDoors();');
    }
  }

  if (linesOfCode.length > 0 && actionLines.length > 0) {
    javaLines.push('');
  }

  if (actionLines.length > 0) {
    for (const actLine of actionLines) {
      javaLines.push(`        ${actLine}`);
    }
  }

  javaLines.push('    }');
  javaLines.push('}');
  const javaCode = javaLines.join('\n');

  const hasErrors = !!(missingNameError || duplicateNameError || stringBooleanTrapError || typeMismatchError);

  let generalError: string | undefined;
  if (missingNameError) generalError = missingNameError;
  else if (duplicateNameError) generalError = duplicateNameError;
  else if (stringBooleanTrapError) generalError = stringBooleanTrapError;
  else if (stringError) generalError = stringError;
  else if (intError) generalError = intError;
  else if (boolError) generalError = boolError;

  return {
    variables,
    actions,
    hasUnlockAction,
    locks,
    javaCode,
    objective1String: stringFound,
    objective2Int: intFound,
    objective3Boolean: boolFound,
    isAllUnlocked,
    hasErrors,
    missingNameError,
    duplicateNameError,
    typeMismatchError,
    stringBooleanTrapError,
    generalError,
  };
}
