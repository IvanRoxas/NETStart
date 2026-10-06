import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { LevelSection } from '@/components/BlocklyMaze';

// =============================================================================
// TYPES & INTERFACES (Jupiter Level 2: The Blueprint Grid & Try/Catch Failsafes)
// =============================================================================

export type ExceptionType = 'NULL_POINTER' | 'NUMBER_FORMAT' | 'OUT_OF_BOUNDS' | 'ARITHMETIC' | 'CLASS_CAST' | 'GENERAL_EXCEPTION';
export type ActionType = 'QUARANTINE' | 'OVERLOAD' | 'RECALIBRATE' | 'CLAMP' | 'FILTER';

export type Jupiter2Wave = 1 | 2 | 3;

export interface TurretLogicItem {
  id: string;
  exceptionType: string;
  rawException: ExceptionType;
  action: string;
  rawAction: ActionType;
  allActions?: ActionType[];
  gridIndex: number;
  isGeneralist?: boolean;
}

export type DataBlockType = 'clean' | 'null_pointer' | 'number_format' | 'out_of_bounds' | 'arithmetic' | 'class_cast';

export interface DataBlockEntity {
  id: number;
  type: DataBlockType;
  label: string;
  x: number;
  y: number;
  progress: number; // 0 to 100%
  status: 'moving' | 'caught' | 'quarantined' | 'exploding' | 'recalibrating' | 'recalibrated' | 'scored' | 'crashed' | 'derailed';
  activeTurretId?: string;
  speed: number;
  subTypeInfo?: string;
  isDerailed?: boolean;
  branch?: 1 | 2;
  hp: number;
  maxHp: number;
  hitFlash?: boolean;
  isIncomingBomb?: boolean;
}

export interface Jupiter2ValidationResult {
  hasTry: boolean;
  hasCatch: boolean;
  allCatchValid: boolean;
  hasFinally?: boolean;
  hasThrowTrap?: boolean;
  hasStartStream?: boolean;
  turretLogic: TurretLogicItem[];
  javaCode: string;
  validationError?: string;
  syntaxError?: string;
}

export const INITIAL_JUPITER_2_VALIDATION: Jupiter2ValidationResult = {
  hasTry: false,
  hasCatch: false,
  allCatchValid: false,
  hasFinally: false,
  hasThrowTrap: false,
  hasStartStream: false,
  turretLogic: [],
  javaCode: '',
};

// =============================================================================
// WAVE CONFIGURATIONS (10 for Wave 1, 20 for Wave 2, 30 for Wave 3)
// =============================================================================

export interface WaveBlockConfig {
  id: number;
  type: DataBlockType;
  label: string;
  delay: number;
}

export const JUPITER2_WAVE_CONFIGS: Record<Jupiter2Wave, WaveBlockConfig[]> = {
  // Wave 1: 20 Blocks (2 Error Types: NullPointer & Arithmetic, plus Clean Data)
  1: [
    { id: 1, type: 'clean', label: 'USER_AUTH', delay: 400 },
    { id: 2, type: 'null_pointer', label: 'NULL_SESSION', delay: 1700 },
    { id: 3, type: 'arithmetic', label: 'ZERO_DIVIDE', delay: 3000 },
    { id: 4, type: 'clean', label: 'CONFIG_PING', delay: 4300 },
    { id: 5, type: 'null_pointer', label: 'VOID_OBJECT', delay: 5600 },
    { id: 6, type: 'arithmetic', label: 'DIV_ZERO_VORTEX', delay: 6900 },
    { id: 7, type: 'clean', label: 'TELEMETRY_LOG', delay: 8200 },
    { id: 8, type: 'null_pointer', label: 'DANGLING_REF', delay: 9500 },
    { id: 9, type: 'arithmetic', label: 'MODULO_ZERO', delay: 10800 },
    { id: 10, type: 'clean', label: 'PACKET_HEADER', delay: 12100 },
    { id: 11, type: 'null_pointer', label: 'NULL_HANDLER', delay: 13400 },
    { id: 12, type: 'arithmetic', label: 'RECIPROCAL_FAIL', delay: 14700 },
    { id: 13, type: 'clean', label: 'PAYLOAD_SYNC', delay: 16000 },
    { id: 14, type: 'null_pointer', label: 'UNSET_POINTER', delay: 17300 },
    { id: 15, type: 'arithmetic', label: 'ZERO_FACTOR', delay: 18600 },
    { id: 16, type: 'clean', label: 'CACHE_VERIFY', delay: 19900 },
    { id: 17, type: 'null_pointer', label: 'NIL_POINTER', delay: 21200 },
    { id: 18, type: 'arithmetic', label: 'SINGULARITY_LOOP', delay: 22500 },
    { id: 19, type: 'null_pointer', label: 'EMPTY_REF', delay: 23800 },
    { id: 20, type: 'clean', label: 'WAVE1_FINAL_SYNC', delay: 25100 },
  ],
  // Wave 2: 30 Blocks (Covers Missing Value, Invalid Number, and Wrong Data Type, plus Clean Data)
  2: [
    { id: 1, type: 'clean', label: 'STREAM_INIT', delay: 400 },
    { id: 2, type: 'null_pointer', label: 'NULL_SPRINT', delay: 1550 },
    { id: 3, type: 'number_format', label: 'CORRUPT_INT', delay: 2700 },
    { id: 4, type: 'class_cast', label: 'CAST_BREACH', delay: 3850 },
    { id: 5, type: 'clean', label: 'PACKET_HEADER', delay: 5000 },
    { id: 6, type: 'number_format', label: 'PARSE_FAIL', delay: 6150 },
    { id: 7, type: 'null_pointer', label: 'VOID_HANDLE', delay: 7300 },
    { id: 8, type: 'class_cast', label: 'POLY_MORPH', delay: 8450 },
    { id: 9, type: 'clean', label: 'SESSION_TICKET', delay: 9600 },
    { id: 10, type: 'number_format', label: 'STRING_NAN', delay: 10750 },
    { id: 11, type: 'null_pointer', label: 'DANGLING_PTR', delay: 11900 },
    { id: 12, type: 'class_cast', label: 'TYPE_CHAMELEON', delay: 13050 },
    { id: 13, type: 'clean', label: 'STATE_CHECK', delay: 14200 },
    { id: 14, type: 'number_format', label: 'BAD_HEX', delay: 15350 },
    { id: 15, type: 'null_pointer', label: 'UNMAPPED_OBJ', delay: 16500 },
    { id: 16, type: 'class_cast', label: 'ILLEGAL_DOWNCAST', delay: 17650 },
    { id: 17, type: 'clean', label: 'ROUTER_FRAME', delay: 18800 },
    { id: 18, type: 'number_format', label: 'ILLEGAL_RADIX', delay: 19950 },
    { id: 19, type: 'null_pointer', label: 'NULL_STREAM', delay: 21100 },
    { id: 20, type: 'class_cast', label: 'GENERIC_CAST_FAIL', delay: 22250 },
    { id: 21, type: 'clean', label: 'LOG_CONFIRM', delay: 23400 },
    { id: 22, type: 'number_format', label: 'PARSE_FLOAT_ERR', delay: 24550 },
    { id: 23, type: 'null_pointer', label: 'ORPHAN_HANDLE', delay: 25700 },
    { id: 24, type: 'class_cast', label: 'OBJ_TO_INT_CAST', delay: 26850 },
    { id: 25, type: 'clean', label: 'AUTH_TOKEN', delay: 28000 },
    { id: 26, type: 'number_format', label: 'INVALID_LITERAL', delay: 29150 },
    { id: 27, type: 'null_pointer', label: 'NULL_CALLBACK', delay: 30300 },
    { id: 28, type: 'class_cast', label: 'INCOMPATIBLE_TYPE', delay: 31450 },
    { id: 29, type: 'number_format', label: 'MALFORMED_LONG', delay: 32600 },
    { id: 30, type: 'clean', label: 'WAVE2_FINAL_SYNC', delay: 33750 },
  ],
  // Wave 3: 40 Blocks (Covers Out of Bounds, Wrong Data Type, and Divide by Zero, plus Clean Data)
  3: [
    { id: 1, type: 'clean', label: 'AUTH_STREAM', delay: 400 },
    { id: 2, type: 'arithmetic', label: 'DIV_ZERO_STORM', delay: 1450 },
    { id: 3, type: 'out_of_bounds', label: 'HEAP_SPIKE', delay: 2500 },
    { id: 4, type: 'class_cast', label: 'CAST_BREACH', delay: 3550 },
    { id: 5, type: 'arithmetic', label: 'DIV_BY_ZERO_VORTEX', delay: 4600 },
    { id: 6, type: 'clean', label: 'STATUS_SYNC', delay: 5650 },
    { id: 7, type: 'out_of_bounds', label: 'STACK_OVERFLOW', delay: 6700 },
    { id: 8, type: 'class_cast', label: 'POLY_MORPH', delay: 7750 },
    { id: 9, type: 'arithmetic', label: 'SINGULARITY_CORE', delay: 8800 },
    { id: 10, type: 'out_of_bounds', label: 'ARRAY_OVERRUN', delay: 9850 },
    { id: 11, type: 'clean', label: 'METRIC_PING', delay: 10900 },
    { id: 12, type: 'class_cast', label: 'TYPE_CHAMELEON', delay: 11950 },
    { id: 13, type: 'arithmetic', label: 'MOD_BY_ZERO', delay: 13000 },
    { id: 14, type: 'out_of_bounds', label: 'NEGATIVE_INDEX', delay: 14050 },
    { id: 15, type: 'class_cast', label: 'ILLEGAL_DOWNCAST', delay: 15100 },
    { id: 16, type: 'clean', label: 'HEALTH_CHECK', delay: 16150 },
    { id: 17, type: 'arithmetic', label: 'INFINITE_FRACTION', delay: 17200 },
    { id: 18, type: 'out_of_bounds', label: 'CAPACITY_MAX', delay: 18250 },
    { id: 19, type: 'class_cast', label: 'GENERIC_CAST_FAIL', delay: 19300 },
    { id: 20, type: 'arithmetic', label: 'DIV_COLLAPSE', delay: 20350 },
    { id: 21, type: 'clean', label: 'GATEWAY_READY', delay: 21400 },
    { id: 22, type: 'out_of_bounds', label: 'POINTER_PAST_END', delay: 22450 },
    { id: 23, type: 'class_cast', label: 'OBJ_TO_INT_CAST', delay: 23500 },
    { id: 24, type: 'arithmetic', label: 'MATH_DOMAIN_ERR', delay: 24550 },
    { id: 25, type: 'out_of_bounds', label: 'LENGTH_MISMATCH', delay: 25600 },
    { id: 26, type: 'clean', label: 'SESSION_FRAME', delay: 26650 },
    { id: 27, type: 'class_cast', label: 'INCOMPATIBLE_TYPE', delay: 27700 },
    { id: 28, type: 'arithmetic', label: 'ZERO_SURGE_APEX', delay: 28750 },
    { id: 29, type: 'out_of_bounds', label: 'INDEX_OVERFLOW', delay: 29800 },
    { id: 30, type: 'class_cast', label: 'POLY_MORPH_STORM', delay: 30850 },
    { id: 31, type: 'clean', label: 'REDUNDANCY_CHECK', delay: 31900 },
    { id: 32, type: 'arithmetic', label: 'SINGULARITY_CORE_2', delay: 32950 },
    { id: 33, type: 'out_of_bounds', label: 'BUFFER_BREACH', delay: 34000 },
    { id: 34, type: 'class_cast', label: 'FINAL_CAST_ASSAULT', delay: 35050 },
    { id: 35, type: 'out_of_bounds', label: 'STACK_BOUNDS', delay: 36100 },
    { id: 36, type: 'clean', label: 'SECURITY_HASH', delay: 37150 },
    { id: 37, type: 'arithmetic', label: 'ZERO_APEX_FINAL', delay: 38200 },
    { id: 38, type: 'class_cast', label: 'TYPE_CONVERGE', delay: 39250 },
    { id: 39, type: 'out_of_bounds', label: 'ULTIMATE_OVERRUN', delay: 40300 },
    { id: 40, type: 'clean', label: 'CORE_VALIDATE_FINAL', delay: 41350 },
  ],
};

// =============================================================================
// CUSTOM BLOCK DEFINITIONS (The Blueprint Grid)
// =============================================================================

let blocksRegistered = false;

export function registerJupiterLevel2Blocks() {
  if (typeof window === 'undefined') return;
  if (blocksRegistered) return;
  blocksRegistered = true;

  // 0. Start Data Stream Block
  Blockly.Blocks['java_start_data_stream'] = {
    init: function () {
      this.jsonInit({
        type: 'java_start_data_stream',
        message0: 'Start Data Stream',
        previousStatement: null,
        nextStatement: null,
        colour: '#10b981',
        tooltip: 'Launches incoming data packets from the Data Port into the defense grid.',
      });
    },
  };

  javascriptGenerator.forBlock['java_start_data_stream'] = function () {
    return 'startDataStream();\n';
  };

  // 1. The Try Wrapper (Safe Execution Guard)
  Blockly.Blocks['java_try_wrapper'] = {
    init: function () {
      this.appendStatementInput('TRY_BODY')
        .appendField('Try Running:');
      this.appendStatementInput('CATCH_STACK')
        .appendField('unless:');
      this.setColour('#3b82f6');
      this.setTooltip('Wrap code in try to catch errors before they crash the program.');
    },
  };

  javascriptGenerator.forBlock['java_try_wrapper'] = function (block: any) {
    const tryBody = javascriptGenerator.statementToCode(block, 'TRY_BODY') || '    startDataStream();\n';
    const catchStack = javascriptGenerator.statementToCode(block, 'CATCH_STACK');
    return `try {\n${tryBody}}${catchStack}`;
  };

  const ALL_EXCEPTION_OPTIONS: [string, string][] = [
    ['Missing Value', 'NULL_POINTER'],
    ['Divide by Zero', 'ARITHMETIC'],
    ['Invalid Number', 'NUMBER_FORMAT'],
    ['Out of Bounds', 'OUT_OF_BOUNDS'],
    ['Wrong Data Type', 'CLASS_CAST'],
  ];

  const ALL_ACTION_OPTIONS: [string, string][] = [
    ['Quarantine with Wall', 'QUARANTINE'],
    ['Purge with Bomber', 'OVERLOAD'],
    ['Recalibrate with Gun Turret', 'RECALIBRATE'],
    ['Clamp with Buffer Clamp', 'CLAMP'],
    ['Filter with Type Filter', 'FILTER'],
  ];

  // 2. The Catch Block: When [error] occurs: (All 5 options available from the get-go)
  Blockly.Blocks['java_catch_block'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('When')
        .appendField(new Blockly.FieldDropdown(ALL_EXCEPTION_OPTIONS), 'EXCEPTION_TYPE')
        .appendField('occurs:');
      this.appendStatementInput('DO');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#6366f1');
      this.setTooltip('When the selected error occurs, execute the defense action inside.');
    },
  };

  // Wave specific catch aliases with all 5 options available
  Blockly.Blocks['java_catch_wave1'] = Blockly.Blocks['java_catch_block'];
  Blockly.Blocks['java_catch_wave2'] = Blockly.Blocks['java_catch_block'];
  Blockly.Blocks['java_catch_wave3'] = Blockly.Blocks['java_catch_block'];

  const catchBlockGenerator = function (block: any) {
    const rawException = block.getFieldValue('EXCEPTION_TYPE') || 'NULL_POINTER';
    const exceptionMap: Record<string, string> = {
      NULL_POINTER: 'NullPointerException',
      NUMBER_FORMAT: 'NumberFormatException',
      OUT_OF_BOUNDS: 'ArrayIndexOutOfBoundsException',
      ARITHMETIC: 'ArithmeticException',
      CLASS_CAST: 'ClassCastException',
      GENERAL_EXCEPTION: 'Exception',
    };
    const exceptionName = exceptionMap[rawException] || 'Exception';

    const branch = javascriptGenerator.statementToCode(block, 'DO') || '';
    const cleanBranch = branch.trim() ? branch : '    // missing action\n';

    return ` catch (${exceptionName} e) {\n${cleanBranch}}`;
  };

  javascriptGenerator.forBlock['java_catch_block'] = catchBlockGenerator;
  javascriptGenerator.forBlock['java_catch_wave1'] = catchBlockGenerator;
  javascriptGenerator.forBlock['java_catch_wave2'] = catchBlockGenerator;
  javascriptGenerator.forBlock['java_catch_wave3'] = catchBlockGenerator;

  // 3. The Action Blocks: Action-based defense commands (All 5 options available)
  Blockly.Blocks['java_action_pill'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(ALL_ACTION_OPTIONS), 'ACTION_COMMAND');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#ff912d');
      this.setTooltip('Deploys the defensive counter unit to resolve the detected error.');
    },
  };

  // Wave specific action aliases with all 5 options available
  Blockly.Blocks['java_action_wave1'] = Blockly.Blocks['java_action_pill'];
  Blockly.Blocks['java_action_wave2'] = Blockly.Blocks['java_action_pill'];
  Blockly.Blocks['java_action_wave3'] = Blockly.Blocks['java_action_pill'];

  const actionBlockGenerator = function (block: any) {
    const cmd = block.getFieldValue('ACTION_COMMAND') || 'QUARANTINE';
    const cmdMap: Record<string, string> = {
      QUARANTINE: 'quarantine(e)',
      OVERLOAD: 'purge(e)',
      RECALIBRATE: 'recalibrate(e)',
      CLAMP: 'clamp(e)',
      FILTER: 'filter(e)',
    };
    const code = cmdMap[cmd] || 'quarantine(e)';
    return `    ${code};\n`;
  };

  javascriptGenerator.forBlock['java_action_pill'] = actionBlockGenerator;
  javascriptGenerator.forBlock['java_action_wave1'] = actionBlockGenerator;
  javascriptGenerator.forBlock['java_action_wave2'] = actionBlockGenerator;
  javascriptGenerator.forBlock['java_action_wave3'] = actionBlockGenerator;

  // 4. The Finally Block: Default: Accept Data
  Blockly.Blocks['java_finally_block'] = {
    init: function () {
      this.jsonInit({
        type: 'java_finally_block',
        message0: 'Default: Accept Data',
        previousStatement: null,
        nextStatement: null,
        colour: '#ff912d',
        tooltip: 'The default handler runs to ensure clean data is safely accepted into the server core.',
      });
    },
  };

  javascriptGenerator.forBlock['java_finally_block'] = function () {
    return ` finally {\n    acceptCleanData();\n}`;
  };

  // 5. The Throw Custom Exception Block: Trigger Security Breach Trap
  Blockly.Blocks['java_throw_block'] = {
    init: function () {
      this.jsonInit({
        type: 'java_throw_block',
        message0: 'Trigger Security Breach Trap',
        previousStatement: null,
        nextStatement: null,
        colour: '#ef4444',
        tooltip: 'Throws an exception to trip an emergency trap on the grid.',
      });
    },
  };

  javascriptGenerator.forBlock['java_throw_block'] = function () {
    return `    throw new SecurityBreachException();\n`;
  };
}

// =============================================================================
// WAVE-SPECIFIC TOOLBOX CONFIGURATIONS (No Emojis)
// =============================================================================

export function getJupiterLevel2Toolbox(wave: Jupiter2Wave = 1): Blockly.utils.toolbox.ToolboxDefinition {
  const errorRulesContents: any[] = [
    {
      kind: 'block',
      type: 'java_catch_block',
    },
  ];

  if (wave === 3) {
    errorRulesContents.push({
      kind: 'block',
      type: 'java_throw_block',
    });
  }

  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Data Stream',
        colour: '#10B981',
        contents: [
          {
            kind: 'block',
            type: 'java_try_wrapper',
          },
          {
            kind: 'block',
            type: 'java_start_data_stream',
          },
        ],
      },
      {
        kind: 'category',
        name: 'Error Rules',
        colour: '#3B82F6',
        contents: errorRulesContents,
      },
      {
        kind: 'category',
        name: 'Actions',
        colour: '#F59E0B',
        contents: [
          {
            kind: 'block',
            type: 'java_action_pill',
          },
          {
            kind: 'block',
            type: 'java_finally_block',
          },
        ],
      },
    ],
  };
}

// =============================================================================
// DEFAULT WORKSPACE (Try Wrapper Anchor with Clean Data Stream)
// =============================================================================

export function getJupiterLevel2DefaultWorkspaceXml(): string {
  return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>';
}

// =============================================================================
// WORKSPACE PARSER & VALIDATOR
// =============================================================================

export function parseJupiterLevel2Workspace(workspace: Blockly.Workspace): Jupiter2ValidationResult {
  const allBlocks = workspace.getAllBlocks(false);
  const tryBlock = allBlocks.find(b => b.type === 'java_try_wrapper');

  const turretLogic: TurretLogicItem[] = [];
  let allCatchValid = true;
  let syntaxError: string | undefined = undefined;

  const rawExceptionToLabel: Record<string, string> = {
    NULL_POINTER: 'NullPointerException',
    NUMBER_FORMAT: 'NumberFormatException',
    OUT_OF_BOUNDS: 'ArrayIndexOutOfBoundsException',
    ARITHMETIC: 'ArithmeticException',
    CLASS_CAST: 'ClassCastException',
    GENERAL_EXCEPTION: 'Exception',
  };

  const rawActionToLabel: Record<string, string> = {
    QUARANTINE: 'quarantine(e)',
    OVERLOAD: 'purge(e)',
    RECALIBRATE: 'recalibrate(e)',
    CLAMP: 'clamp(e)',
    FILTER: 'filter(e)',
  };

  // 1. Verify Start Data Stream is properly snapped inside TRY_BODY
  let hasStartStream = false;
  if (tryBlock) {
    let curr = tryBlock.getInputTargetBlock('TRY_BODY');
    while (curr) {
      if (curr.type === 'java_start_data_stream') {
        hasStartStream = true;
        break;
      }
      curr = curr.getNextBlock();
    }
  }
  const floatingStartStream = allBlocks.some(b => b.type === 'java_start_data_stream') && !hasStartStream;
  if (floatingStartStream && !syntaxError) {
    syntaxError = "Snap the 'Start Data Stream' block inside the 'Try Running:' block.";
  }

  // 2. Check Finally Block (Default: Accept Data) attached to tryBlock
  const finallyBlock = allBlocks.find(b => b.type === 'java_finally_block');
  const hasFinally = Boolean(finallyBlock && tryBlock && (finallyBlock.getRootBlock() === tryBlock));
  const floatingFinally = Boolean(finallyBlock && (!tryBlock || finallyBlock.getRootBlock() !== tryBlock));
  if (floatingFinally && !syntaxError) {
    syntaxError = "Snap the 'Default: Accept Data' block inside the 'Try Running:' block, or delete it.";
  }

  // 3. Check Throw Trap Block
  const throwTrapBlock = allBlocks.find(b => b.type === 'java_throw_block');
  const hasThrowTrap = Boolean(throwTrapBlock && tryBlock && (throwTrapBlock.getRootBlock() === tryBlock));

  // 4a. Check if any catch block was accidentally snapped inside TRY_BODY
  let tryBodyCatch = false;
  if (tryBlock) {
    let curr = tryBlock.getInputTargetBlock('TRY_BODY');
    while (curr) {
      if (curr.type.startsWith('java_catch')) {
        tryBodyCatch = true;
        break;
      }
      curr = curr.getNextBlock();
    }
  }
  if (tryBodyCatch && !syntaxError) {
    syntaxError = "Catch rules cannot be placed inside 'Try Running:'. Snap them into the 'unless:' slot.";
    allCatchValid = false;
  }

  // 4b. Find all catch blocks and ensure they are snapped into CATCH_STACK (unless:)
  const allCatchBlocks = allBlocks.filter(
    b => b.type === 'java_catch_block' || b.type === 'java_catch_wave1' || b.type === 'java_catch_wave2' || b.type === 'java_catch_wave3'
  );

  let attachedCatchBlocks: Blockly.Block[] = [];
  if (tryBlock) {
    let curr = tryBlock.getInputTargetBlock('CATCH_STACK');
    while (curr) {
      if (curr.type.startsWith('java_catch')) {
        attachedCatchBlocks.push(curr);
      }
      curr = curr.getNextBlock();
    }
  }

  const floatingCatches = allCatchBlocks.filter(b => !attachedCatchBlocks.includes(b));
  if (floatingCatches.length > 0 && !syntaxError) {
    syntaxError = "Unattached rule: Snap all 'When [error] occurs:' blocks into the 'unless:' slot of the 'Try Running:' block, or delete unused blocks.";
    allCatchValid = false;
  }

  // 5. Check for floating action blocks not slotted into any catch block (supports chained actions)
  const allActionPills = allBlocks.filter(b => b.type.startsWith('java_action'));
  const attachedActions = new Set<Blockly.Block>();
  attachedCatchBlocks.forEach(cb => {
    let act = cb.getInputTargetBlock('DO') || cb.getInputTargetBlock('ACTION_PILL');
    while (act) {
      attachedActions.add(act);
      act = act.getNextBlock();
    }
  });
  const floatingActions = allActionPills.filter(ab => !attachedActions.has(ab));
  if (floatingActions.length > 0 && !syntaxError) {
    syntaxError = "Unattached action: Snap action blocks inside a 'When [error] occurs:' rule, or delete unused blocks.";
    allCatchValid = false;
  }

  // 6. Check for duplicate exception handlers & build active turretLogic from attached rules only
  const seenExceptions = new Set<string>();
  let catchCount = 0;

  attachedCatchBlocks.forEach(b => {
    catchCount++;
    const rawException = (b.getFieldValue('EXCEPTION_TYPE') || 'NULL_POINTER') as ExceptionType;
    const actionBlock = b.getInputTargetBlock('DO') || b.getInputTargetBlock('ACTION_PILL');

    if (seenExceptions.has(rawException)) {
      allCatchValid = false;
      if (!syntaxError) {
        syntaxError = `Duplicate rule: ${rawExceptionToLabel[rawException] || rawException} is already handled. Remove the duplicate block.`;
      }
    }
    seenExceptions.add(rawException);

    if (!actionBlock) {
      allCatchValid = false;
      if (!syntaxError) {
        syntaxError = 'Rule block missing action inside.';
      }
    } else {
      const allRuleActions: ActionType[] = [];
      let currAct: Blockly.Block | null = actionBlock;
      while (currAct) {
        const actVal = (currAct.getFieldValue('ACTION_COMMAND') || 'QUARANTINE') as ActionType;
        allRuleActions.push(actVal);
        currAct = currAct.getNextBlock();
      }
      const rawAction = allRuleActions[0] || 'QUARANTINE';
      const gridIndex = catchCount - 1;

      turretLogic.push({
        id: `turret_${catchCount}`,
        exceptionType: rawExceptionToLabel[rawException] || 'NullPointerException',
        rawException,
        action: rawActionToLabel[rawAction] || 'quarantine(e)',
        rawAction,
        allActions: allRuleActions,
        gridIndex: Math.min(5, Math.max(0, isNaN(gridIndex) ? 0 : gridIndex)),
        isGeneralist: rawException === 'GENERAL_EXCEPTION',
      });
    }
  });

  // Construct formatted Java code
  let javaCode = `public class CloudGridArchive {\n    public static void main(String[] args) {\n        try {\n            startDataStream();\n`;
  if (hasThrowTrap) {
    javaCode += `            throw new SecurityBreachException();\n`;
  }
  javaCode += `        }`;
  if (turretLogic.length > 0) {
    turretLogic.forEach(t => {
      const acts = t.allActions && t.allActions.length > 0 ? t.allActions : [t.rawAction];
      const actLines = acts.map(act => {
        const actFunc =
          act === 'QUARANTINE'
            ? 'quarantine(e);'
            : act === 'OVERLOAD'
              ? 'purge(e);'
              : act === 'RECALIBRATE'
                ? 'recalibrate(e);'
                : act === 'CLAMP'
                  ? 'clamp(e);'
                  : 'filter(e);';
        return `            ${actFunc}`;
      }).join('\n');
      javaCode += ` catch (${t.exceptionType} e) {\n${actLines}\n        }`;
    });
  } else if (catchCount > 0) {
    javaCode += ` catch (Exception e) {\n            // Action slot incomplete\n        }`;
  }

  if (hasFinally) {
    javaCode += ` finally {\n            acceptCleanData();\n        }`;
  }

  javaCode += `\n    }\n}`;

  return {
    hasTry: Boolean(tryBlock),
    hasCatch: catchCount > 0,
    allCatchValid: catchCount > 0 && allCatchValid && !syntaxError,
    hasFinally,
    hasThrowTrap,
    hasStartStream,
    turretLogic,
    javaCode,
    syntaxError,
    validationError: catchCount === 0 ? 'Configure error rules and actions to defend the server grid.' : syntaxError,
  };
}

// =============================================================================
// LEVEL SECTIONS CONFIGURATION (Part 7: Level Select Card UI & Metadata)
// =============================================================================

export const JUPITER_2_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: "Try and Catch This!",
    subtag: "TRY/CATCH",
    desc: "Rescue Technician Io by building a Try/Catch safety net to intercept corrupted data blocks before they reach the server core across 3 progressive waves!",
    tip: "Hint: Snap 'Start Data Stream' inside 'Try Running:', then add 'When [error] occurs:' rules to counter each wave's threats.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: "Survive and Repel Wave 1", completed: false, isClaimed: false },
      { id: 2, text: "Survive and Repel Wave 2", completed: false, isClaimed: false },
      { id: 3, text: "Survive and Repel Wave 3", completed: false, isClaimed: false },
    ],
  },
];
