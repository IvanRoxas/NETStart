import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import type { LevelSection } from '@/components/BlocklyMaze';

// =============================================================================
// TYPES & CONSTANTS (Earth Level 3: The Master Reboot)
// =============================================================================

export type Earth3PlanetId = 'mars' | 'venus' | 'mercury' | 'jupiter' | 'saturn';

export interface Earth3PlanetNode {
  id: Earth3PlanetId;
  name: string;
  moduleName: string;
  functionCall: string;
  repairDesc: string;
  angleDeg: number; // Position in circular formation (0 to 360)
  color: string;
  iconUrl: string;
}

export const EARTH_3_PLANET_NODES: Earth3PlanetNode[] = [
  {
    id: 'mars',
    name: 'Mars',
    moduleName: 'mars',
    functionCall: 'mars.load_structure()',
    repairDesc: 'Structure',
    angleDeg: -90, // Top
    color: '#EF4444',
    iconUrl: '/assets/planets/celestial/Mars.svg',
  },
  {
    id: 'venus',
    name: 'Venus',
    moduleName: 'venus',
    functionCall: 'venus.load_colors()',
    repairDesc: 'Colors',
    angleDeg: -18, // Top-right
    color: '#EC4899',
    iconUrl: '/assets/planets/celestial/Venus.svg',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    moduleName: 'mercury',
    functionCall: 'mercury.load_logic()',
    repairDesc: 'Logic',
    angleDeg: 54, // Bottom-right
    color: '#F59E0B',
    iconUrl: '/assets/planets/celestial/Mercury.svg',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    moduleName: 'jupiter',
    functionCall: 'jupiter.load_data_types()',
    repairDesc: 'Data Types',
    angleDeg: 126, // Bottom-left
    color: '#EAB308',
    iconUrl: '/assets/planets/celestial/Jupiter.svg',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    moduleName: 'saturn',
    functionCall: 'saturn.load_math()',
    repairDesc: 'Math',
    angleDeg: 198, // Top-left
    color: '#CA8A04',
    iconUrl: '/assets/planets/celestial/Saturn.svg',
  },
];

export interface Earth3AuditStatus {
  hasAllImports: boolean;
  missingImports: string[];
  importedModules: string[];
  hasMasterRebootFunc: boolean;
  hasAllModuleCalls: boolean;
  missingCalls: string[];
  executedCalls: string[];
  callsInsideFunction: boolean;
  callsOutsideFunction: boolean;
  hasSystemSynchronize: boolean;
  orderValid: boolean;
  callOrder: Earth3PlanetId[];
  canRunSimulation: boolean;
  errorType?: 'NAME_ERROR' | 'SCOPE_ERROR' | 'MISSING_TRIGGER' | 'EMPTY_WORKSPACE' | 'SYNTAX_ERROR';
  errorMessage?: string;
  isWinState: boolean;
  completedObjectives: boolean[];
}

export const INITIAL_EARTH_3_AUDIT: Earth3AuditStatus = {
  hasAllImports: false,
  missingImports: ['mars', 'venus', 'mercury', 'jupiter', 'saturn'],
  importedModules: [],
  hasMasterRebootFunc: false,
  hasAllModuleCalls: false,
  missingCalls: [
    'mars.load_structure()',
    'venus.load_colors()',
    'mercury.load_logic()',
    'jupiter.load_data_types()',
    'saturn.load_math()',
  ],
  executedCalls: [],
  callsInsideFunction: false,
  callsOutsideFunction: false,
  hasSystemSynchronize: false,
  orderValid: false,
  callOrder: [],
  canRunSimulation: false,
  errorType: 'EMPTY_WORKSPACE',
  errorMessage: 'Place your import blocks at the top of the workspace.',
  isWinState: false,
  completedObjectives: [false, false, false],
};

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

let isEarth3BlocksRegistered = false;

export function registerEarthLevel3Blocks() {
  if (isEarth3BlocksRegistered) return;
  isEarth3BlocksRegistered = true;

  // 1. Module Import Block
  Blockly.Blocks['py_import_module'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Link to Astrolink:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Mars (HTML)', 'mars'],
            ['Venus (CSS)', 'venus'],
            ['Mercury (JavaScript)', 'mercury'],
            ['Jupiter (Java)', 'jupiter'],
            ['Saturn (C++)', 'saturn'],
          ]),
          'MODULE'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#6366F1'); // Indigo
      this.setTooltip('Links a planetary system into your Astrolink network.');
    },
  };

  javascriptGenerator.forBlock['py_import_module'] = function (block: any) {
    const module = block.getFieldValue('MODULE') || 'mars';
    return `import ${module}\n`;
  };

  // 2. Function Definition Block (The Wrapper)
  Blockly.Blocks['py_def_func'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Master Reboot Program:')
        .appendField('do');
      this.appendStatementInput('BODY').setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#10B981'); // Emerald
      this.setTooltip('Creates the master program that runs all your planetary restorations together.');
    },
  };

  javascriptGenerator.forBlock['py_def_func'] = function (block: any) {
    const body = javascriptGenerator.statementToCode(block, 'BODY') || '    pass\n';
    return `def master_reboot():\n${body}`;
  };

  // 3. Module Execution Block
  Blockly.Blocks['py_module_execute'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Restore System:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Mars: Rebuild Structure', 'mars.load_structure()'],
            ['Venus: Restore Colors', 'venus.load_colors()'],
            ['Mercury: Activate Logic', 'mercury.load_logic()'],
            ['Jupiter: Check Data Types', 'jupiter.load_data_types()'],
            ['Saturn: Compute Math', 'saturn.load_math()'],
          ]),
          'METHOD'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#F59E0B'); // Amber
      this.setTooltip('Restores and powers on the repaired subsystem for this planet.');
    },
  };

  javascriptGenerator.forBlock['py_module_execute'] = function (block: any) {
    const method = block.getFieldValue('METHOD') || 'mars.load_structure()';
    return `${method}\n`;
  };

  // 4. System Synchronization Block (Trigger)
  Blockly.Blocks['py_system_synchronize'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Power Up Astrolink');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#06B6D4'); // Cyan
      this.setTooltip('Transmits your reboot program to the mainframe and brings all five planets online across the Astrolink at once!');
    },
  };

  javascriptGenerator.forBlock['py_system_synchronize'] = function () {
    return `system.synchronize(master_reboot)\n`;
  };
}

// =============================================================================
// TOOLBOX DEFINITION
// =============================================================================

export function getEarthLevel3Toolbox(): string {
  return `
<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox-earth-3" style="display: none">
  <category name="Connect" colour="#6366F1">
    <block type="py_import_module">
      <field name="MODULE">mars</field>
    </block>
    <block type="py_import_module">
      <field name="MODULE">venus</field>
    </block>
    <block type="py_import_module">
      <field name="MODULE">mercury</field>
    </block>
    <block type="py_import_module">
      <field name="MODULE">jupiter</field>
    </block>
    <block type="py_import_module">
      <field name="MODULE">saturn</field>
    </block>
  </category>
  <category name="Sequence" colour="#10B981">
    <block type="py_def_func"></block>
  </category>
  <category name="Repairs" colour="#F59E0B">
    <block type="py_module_execute">
      <field name="METHOD">mars.load_structure()</field>
    </block>
    <block type="py_module_execute">
      <field name="METHOD">venus.load_colors()</field>
    </block>
    <block type="py_module_execute">
      <field name="METHOD">mercury.load_logic()</field>
    </block>
    <block type="py_module_execute">
      <field name="METHOD">jupiter.load_data_types()</field>
    </block>
    <block type="py_module_execute">
      <field name="METHOD">saturn.load_math()</field>
    </block>
  </category>
  <category name="Launch" colour="#06B6D4">
    <block type="py_system_synchronize"></block>
  </category>
</xml>
  `.trim();
}

// =============================================================================
// AUDITING & VALIDATION
// =============================================================================

export function auditEarth3Workspace(
  workspace: Blockly.Workspace | null,
  pythonCode: string
): Earth3AuditStatus {
  const normCode = pythonCode || '';
  const allPlanets: Earth3PlanetId[] = ['mars', 'venus', 'mercury', 'jupiter', 'saturn'];

  // Check top-level imports present in code (no leading whitespace to enforce top-level)
  const importedModules = allPlanets.filter(p => {
    const regex = new RegExp(`^import\\s+${p}\\b`, 'm');
    return regex.test(normCode);
  });
  const missingImports = allPlanets.filter(p => !importedModules.includes(p));
  const hasAllImports = missingImports.length === 0;

  // Check function declaration
  const hasMasterRebootFunc = /^def\s+master_reboot\s*\(\s*\)\s*:/m.test(normCode);

  // Check system synchronize trigger
  const hasSystemSynchronize = /system\.synchronize\s*\(\s*master_reboot\s*\)/m.test(normCode);

  // Parse blocks directly from workspace to accurately check nesting & scope
  let callsInsideFunction: string[] = [];
  let callsOutsideFunction: string[] = [];
  const callOrder: Earth3PlanetId[] = [];
  let syncInsideFunction = false;
  let importsInsideFunction = false;
  let defFuncCount = 0;
  let syncBlockCount = 0;

  if (workspace) {
    const allBlocks = workspace.getAllBlocks(false);
    // Ignore disabled blocks (e.g. right-clicked -> Disable Block)
    const enabledBlocks = allBlocks.filter(b => b.isEnabled());

    for (const b of enabledBlocks) {
      if (b.type === 'py_def_func') {
        defFuncCount++;
      } else if (b.type === 'py_system_synchronize') {
        syncBlockCount++;
        // Check if ancestor is py_def_func (Recursion vulnerability)
        let ancestor = b.getParent();
        while (ancestor) {
          if (ancestor.type === 'py_def_func') {
            syncInsideFunction = true;
            break;
          }
          ancestor = ancestor.getParent();
        }
      } else if (b.type === 'py_import_module') {
        // Check if ancestor is py_def_func (Imports must be top-level)
        let ancestor = b.getParent();
        while (ancestor) {
          if (ancestor.type === 'py_def_func') {
            importsInsideFunction = true;
            break;
          }
          ancestor = ancestor.getParent();
        }
      } else if (b.type === 'py_module_execute') {
        const method = b.getFieldValue('METHOD') || '';
        // Check if ancestor is py_def_func
        let ancestor = b.getParent();
        let isInside = false;
        while (ancestor) {
          if (ancestor.type === 'py_def_func') {
            isInside = true;
            break;
          }
          ancestor = ancestor.getParent();
        }

        if (isInside) {
          callsInsideFunction.push(method);
        } else {
          callsOutsideFunction.push(method);
        }
      }
    }

    // Determine execution order from inside def master_reboot
    const funcBlock = enabledBlocks.find(b => b.type === 'py_def_func');
    if (funcBlock) {
      let currentChild = funcBlock.getInputTargetBlock('BODY');
      while (currentChild) {
        if (currentChild.isEnabled() && currentChild.type === 'py_module_execute') {
          const method = currentChild.getFieldValue('METHOD') || '';
          for (const p of allPlanets) {
            if (method.startsWith(p)) {
              if (!callOrder.includes(p)) {
                callOrder.push(p);
              }
              break;
            }
          }
        }
        currentChild = currentChild.getNextBlock();
      }
    }
  } else {
    // Fallback regex parsing on pythonCode if workspace not available
    for (const p of allPlanets) {
      if (normCode.includes(`${p}.load_`)) {
        callsInsideFunction.push(`${p}.load_`);
        callOrder.push(p);
      }
    }
  }

  const executedCalls = callsInsideFunction;
  const missingCalls = allPlanets
    .map(p => {
      const node = EARTH_3_PLANET_NODES.find(n => n.id === p);
      return node ? node.functionCall : `${p}.load_...()`;
    })
    .filter(call => !executedCalls.some(c => call.startsWith(c.split('(')[0])));
  const hasAllModuleCalls = missingCalls.length === 0;

  // Validation rules
  let canRunSimulation = true;
  let errorType: Earth3AuditStatus['errorType'] = undefined;
  let errorMessage: string | undefined = undefined;

  // 1. Empty workspace
  if (!normCode.trim()) {
    canRunSimulation = false;
    errorType = 'EMPTY_WORKSPACE';
    errorMessage = 'Your workspace is empty. Place import blocks to begin.';
  }
  // 2. Multiple function definitions
  else if (defFuncCount > 1) {
    canRunSimulation = false;
    errorType = 'SCOPE_ERROR';
    errorMessage = 'Multiple function definitions detected. Keep only one master_reboot() function block.';
  }
  // 3. Multiple synchronization triggers
  else if (syncBlockCount > 1) {
    canRunSimulation = false;
    errorType = 'SCOPE_ERROR';
    errorMessage = 'Multiple Astrolink triggers detected. Place a single Power Up Astrolink block at the end.';
  }
  // 4. Imports nested inside function
  else if (importsInsideFunction) {
    canRunSimulation = false;
    errorType = 'SCOPE_ERROR';
    errorMessage = "Scope Error: Place your 'Link to Astrolink' import blocks at the top of your workspace, outside master_reboot().";
  }
  // 5. System synchronize nested inside function (Recursion error)
  else if (syncInsideFunction) {
    canRunSimulation = false;
    errorType = 'SCOPE_ERROR';
    errorMessage = "Recursion Warning: Place the 'Power Up Astrolink' block at the bottom outside the function, not inside master_reboot().";
  }
  // 6. System synchronize called before master_reboot definition (NameError)
  else if (
    normCode.indexOf('system.synchronize') !== -1 &&
    normCode.indexOf('def master_reboot') !== -1 &&
    normCode.indexOf('system.synchronize') < normCode.indexOf('def master_reboot')
  ) {
    canRunSimulation = false;
    errorType = 'NAME_ERROR';
    errorMessage = "NameError: name 'master_reboot' is not defined. You must define master_reboot() before calling system.synchronize(master_reboot).";
  }
  // 7. Scope Violation: Calls placed outside master_reboot
  else if (callsOutsideFunction.length > 0) {
    canRunSimulation = false;
    errorType = 'SCOPE_ERROR';
    errorMessage = 'Structure Error: The system requires a single, unified function. Nest your module calls inside the master_reboot function.';
  }
  // 8. NameError: Call made for a module that is not imported
  else {
    const unimportedExecuted = executedCalls.find(call => {
      const mod = call.split('.')[0] as Earth3PlanetId;
      return allPlanets.includes(mod) && !importedModules.includes(mod);
    });

    if (unimportedExecuted) {
      const modName = unimportedExecuted.split('.')[0];
      canRunSimulation = false;
      errorType = 'NAME_ERROR';
      errorMessage = `NameError: name '${modName}' is not defined. You must import the module before accessing its functions.`;
    }
    // 9. Missing Function
    else if (!hasMasterRebootFunc) {
      canRunSimulation = false;
      errorType = 'SCOPE_ERROR';
      errorMessage = 'Define the master_reboot() function and nest your planetary repair calls inside it.';
    }
    // 10. Empty function body
    else if (callsInsideFunction.length === 0) {
      canRunSimulation = false;
      errorType = 'SCOPE_ERROR';
      errorMessage = 'master_reboot() is empty. Connect all 5 planetary repair blocks inside it.';
    }
    // 11. Missing some imports or calls
    else if (!hasAllImports) {
      canRunSimulation = false;
      errorType = 'NAME_ERROR';
      errorMessage = `Missing imports: add import ${missingImports.join(', ')} at the top.`;
    }
    else if (!hasAllModuleCalls) {
      canRunSimulation = false;
      errorType = 'SCOPE_ERROR';
      errorMessage = `Missing repair calls: nest all 5 planetary calls inside master_reboot().`;
    }
    // 12. Missing Trigger
    else if (!hasSystemSynchronize) {
      canRunSimulation = false;
      errorType = 'MISSING_TRIGGER';
      errorMessage = 'Function defined, but never called. The system is waiting for you to synchronize the execution with system.synchronize(master_reboot).';
    }
  }

  // Objective Tracking:
  // Objective 1: Import all 5 modules at top
  const obj1 = hasAllImports && !importsInsideFunction;
  // Objective 2: Define master_reboot and nest all 5 repairs
  const obj2 = hasMasterRebootFunc && hasAllModuleCalls && callsOutsideFunction.length === 0 && !importsInsideFunction && !syncInsideFunction;
  // Objective 3: Synchronize and run simulation successfully
  const obj3 = canRunSimulation && hasSystemSynchronize;

  const isWinState = obj1 && obj2 && obj3;

  return {
    hasAllImports,
    missingImports,
    importedModules,
    hasMasterRebootFunc,
    hasAllModuleCalls,
    missingCalls,
    executedCalls,
    callsInsideFunction: callsInsideFunction.length > 0,
    callsOutsideFunction: callsOutsideFunction.length > 0,
    hasSystemSynchronize,
    orderValid: callOrder.length === 5,
    callOrder,
    canRunSimulation,
    errorType,
    errorMessage,
    isWinState,
    completedObjectives: [obj1, obj2, obj3],
  };
}

// =============================================================================
// LEVEL SECTIONS CONFIGURATION
// =============================================================================

export const EARTH_3_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: 'The Master Reboot',
    subtag: 'PYTHON MODULES & FUNCTIONS',
    desc: "The Architect has one final program to bring together every repair you've made across the solar system, but he needs your help to run it. Use Python functions and modules to unify the Astrolink and bring all planetary systems online at once!",
    tip: 'Place your import blocks at the top, nest your planetary function calls inside master_reboot(), then attach system.synchronize() at the bottom to power up the Astrolink.',
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      {
        id: 1,
        text: 'Connect all 5 planetary systems at the top using connect blocks',
        completed: false,
      },
      {
        id: 2,
        text: 'Define the master reboot sequence and nest all 5 repairs inside',
        completed: false,
      },
      {
        id: 3,
        text: 'Complete the level',
        completed: false,
      },
    ],
  },
];
