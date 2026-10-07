import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { LevelSection } from '@/components/BlocklyMaze';

// =============================================================================
// TYPES & INTERFACES (Saturn Level 3: Pointers & Memory Management)
// =============================================================================

export type PointerId = 'sensorPtr' | 'debrisPtr' | 'shieldPtr';
export type TaskId = 'RUN_SENSORS' | 'RUN_DEBRIS' | 'RUN_SHIELDS';

export type StepActionType =
  | 'START'
  | 'DECLARE'
  | 'ALLOCATE'
  | 'RUN_TASK'
  | 'DEALLOCATE'
  | 'IF_GUARD_START'
  | 'IF_GUARD_END'
  | 'END';

export interface MemoryStepAction {
  type: StepActionType;
  pointer?: PointerId;
  cores?: number;
  task?: TaskId;
  threshold?: number;
  blockId?: string;
  /** Set when the block still has a placeholder value (no subsystem / amount / threshold chosen). */
  invalid?: string;
}

export interface Saturn3WorkspacePayload {
  steps: MemoryStepAction[];
  rawCppCode: string;
  declaredPointers: Set<PointerId>;
  hasStart: boolean;
  hasEnd: boolean;
  threshold: number;
}

export type Saturn3Scenario =
  | 'IDLE'
  | 'SUCCESS'
  | 'MISSING_START'
  | 'MISSING_END'
  | 'OUT_OF_MEMORY'
  | 'NULL_POINTER_DEREFERENCE'
  | 'MEMORY_LEAK'
  | 'UNDECLARED_POINTER'
  | 'INCOMPLETE_TASKS'
  | 'BREAKER_TRIP';

export interface Saturn3AuditResult {
  success: boolean;
  scenario: Saturn3Scenario;
  message: string;
  failedStepIndex?: number;
  steps: MemoryStepAction[];
  finalHeap: number;
  sensorsExecuted: boolean;
  debrisExecuted: boolean;
  shieldsExecuted: boolean;
  threshold: number;
}

export const INITIAL_SATURN_3_PAYLOAD: Saturn3WorkspacePayload = {
  steps: [],
  rawCppCode: '',
  declaredPointers: new Set(),
  hasStart: false,
  hasEnd: false,
  threshold: 75,
};

// =============================================================================
// AUDITING ENGINE (Sequential Interpretation of Memory Allocations)
// =============================================================================

export function auditMemorySequence(payload: Saturn3WorkspacePayload): Saturn3AuditResult {
  const rawSteps = payload.steps || [];
  const threshold = payload.threshold || 75;
  let currentHeap = 4;
  let sensorAllocated = 0;
  let debrisAllocated = 0;
  let shieldAllocated = 0;
  let sensorsExecuted = false;
  let debrisExecuted = false;
  let shieldsExecuted = false;
  const declared = new Set<PointerId>();
  const executedSteps: MemoryStepAction[] = [];

  if (rawSteps.length === 0) {
    return {
      success: false,
      scenario: 'INCOMPLETE_TASKS',
      message: 'Workspace is empty! Drag blocks from the toolbox to build your program.',
      steps: [],
      finalHeap: 4,
      sensorsExecuted: false,
      debrisExecuted: false,
      shieldsExecuted: false,
      threshold,
    };
  }

  // Check 1: Start Block Requirement
  if (!payload.hasStart) {
    return {
      success: false,
      scenario: 'MISSING_START',
      message: 'Missing Start block! Connect your code to the Start block to begin execution.',
      steps: [],
      finalHeap: 4,
      sensorsExecuted: false,
      debrisExecuted: false,
      shieldsExecuted: false,
      threshold,
    };
  }

  let skipIfDepth = 0;

  for (let i = 0; i < rawSteps.length; i++) {
    const step = rawSteps[i];

    // Dynamic If Guard evaluation:
    // If the RAM pressure is below the condition threshold, the statements inside the guard are skipped.
    if (step.type === 'IF_GUARD_START') {
      if (step.invalid && skipIfDepth === 0) {
        executedSteps.push(step);
        return {
          success: false,
          scenario: 'INCOMPLETE_TASKS',
          message: step.invalid,
          failedStepIndex: executedSteps.length - 1,
          steps: executedSteps,
          finalHeap: currentHeap,
          sensorsExecuted,
          debrisExecuted,
          shieldsExecuted,
          threshold,
        };
      }
      if (skipIfDepth > 0) {
        skipIfDepth++;
        continue;
      }
      const currentPressure = Math.round(((4 - currentHeap) / 4) * 100);
      const guardThreshold = step.threshold ?? threshold;
      if (currentPressure < guardThreshold) {
        // Condition (ramPressure >= guardThreshold) is FALSE, skip blocks inside
        skipIfDepth = 1;
      }
      continue;
    }

    if (step.type === 'IF_GUARD_END') {
      if (skipIfDepth > 0) {
        skipIfDepth--;
      }
      continue;
    }

    if (skipIfDepth > 0) {
      // Step skipped because enclosing if condition was false
      continue;
    }

    executedSteps.push(step);
    const stepIdxInExecuted = executedSteps.length - 1;

    if (step.invalid) {
      return {
        success: false,
        scenario: 'INCOMPLETE_TASKS',
        message: step.invalid,
        failedStepIndex: stepIdxInExecuted,
        steps: executedSteps,
        finalHeap: currentHeap,
        sensorsExecuted,
        debrisExecuted,
        shieldsExecuted,
        threshold,
      };
    }

    if (step.type === 'START') {
      continue;
    }

    if (step.type === 'END') {
      // In C++, return 0 terminates execution; statements following End are unreachable
      break;
    }

    if (step.type === 'DECLARE') {
      if (step.pointer) {
        declared.add(step.pointer);
      }
      const followingGuard = rawSteps.slice(i + 1, i + 8).find(s => s.type === 'IF_GUARD_START');
      const requiredPressure = step.pointer === 'shieldPtr' ? 50 : step.pointer === 'debrisPtr' ? 75 : 50;
      step.threshold = followingGuard?.threshold ?? requiredPressure;
    } else if (step.type === 'ALLOCATE') {
      const ptr = step.pointer;
      const amount = step.cores || 0;

      if (!ptr) {
        return {
          success: false,
          scenario: 'UNDECLARED_POINTER',
          message: 'No arm specified! Ready the arm before allocating cores.',
          failedStepIndex: stepIdxInExecuted,
          steps: executedSteps,
          finalHeap: currentHeap,
          sensorsExecuted,
          debrisExecuted,
          shieldsExecuted,
          threshold,
        };
      }

      // Pointer MUST be declared before memory allocation
      if (!declared.has(ptr)) {
        return {
          success: false,
          scenario: 'UNDECLARED_POINTER',
          message: `Ready Arm required! Ready 'Task* ${ptr}' before allocating cores.`,
          failedStepIndex: stepIdxInExecuted,
          steps: executedSteps,
          finalHeap: currentHeap,
          sensorsExecuted,
          debrisExecuted,
          shieldsExecuted,
          threshold,
        };
      }

      // Pointer Overwrite Leak: Cannot checkout memory to a pointer that already holds active cores
      if (
        (ptr === 'sensorPtr' && sensorAllocated > 0) ||
        (ptr === 'debrisPtr' && debrisAllocated > 0) ||
        (ptr === 'shieldPtr' && shieldAllocated > 0)
      ) {
        return {
          success: false,
          scenario: 'OUT_OF_MEMORY',
          message: `Arm busy! Return cores from '${ptr}' before allocating new ones.`,
          failedStepIndex: stepIdxInExecuted,
          steps: executedSteps,
          finalHeap: currentHeap,
          sensorsExecuted,
          debrisExecuted,
          shieldsExecuted,
          threshold,
        };
      }

      // Check for Breaker Trip & Overheat Explosion against required task pressure
      const requiredPressure = amount * 25;
      const followingGuard = rawSteps.slice(i + 1, i + 8).find(s => s.type === 'IF_GUARD_START');
      const activeThreshold = followingGuard?.threshold ?? (rawSteps.some(s => s.type === 'IF_GUARD_START') ? threshold : null);
      step.threshold = followingGuard?.threshold ?? requiredPressure;

      if (activeThreshold !== null && activeThreshold < requiredPressure) {
        return {
          success: false,
          scenario: 'BREAKER_TRIP',
          message: 'Threshold too low. Breaker tripped.',
          failedStepIndex: stepIdxInExecuted,
          steps: executedSteps,
          finalHeap: currentHeap,
          sensorsExecuted,
          debrisExecuted,
          shieldsExecuted,
          threshold: activeThreshold,
        };
      }

      if (activeThreshold !== null && activeThreshold > requiredPressure) {
        return {
          success: false,
          scenario: 'OUT_OF_MEMORY',
          message: 'Threshold too high! Mainframe overheated and exploded.',
          failedStepIndex: stepIdxInExecuted,
          steps: executedSteps,
          finalHeap: currentHeap,
          sensorsExecuted,
          debrisExecuted,
          shieldsExecuted,
          threshold: activeThreshold,
        };
      }

      // Over-Allocation Crash (Out of Memory / Empty Heap Rack)
      if (amount > currentHeap) {
        return {
          success: false,
          scenario: 'OUT_OF_MEMORY',
          message: 'No cores left. Return previous cores with \'delete\'.',
          failedStepIndex: stepIdxInExecuted,
          steps: executedSteps,
          finalHeap: currentHeap,
          sensorsExecuted,
          debrisExecuted,
          shieldsExecuted,
          threshold,
        };
      }

      currentHeap -= amount;
      if (ptr === 'sensorPtr') sensorAllocated = amount;
      if (ptr === 'debrisPtr') debrisAllocated = amount;
      if (ptr === 'shieldPtr') shieldAllocated = amount;
    } else if (step.type === 'RUN_TASK') {
      const task = step.task;
      const requiredPressure = task === 'RUN_SHIELDS' ? 50 : task === 'RUN_DEBRIS' ? 75 : 50;
      const followingGuard = rawSteps.slice(i + 1, i + 8).find(s => s.type === 'IF_GUARD_START');
      step.threshold = followingGuard?.threshold ?? requiredPressure;

      if (task === 'RUN_SENSORS') {
        if (sensorAllocated !== 2) {
          return {
            success: false,
            scenario: 'NULL_POINTER_DEREFERENCE',
            message: sensorAllocated === 0
              ? 'Sensors need 2 cores! Allocate 2 cores before running.'
              : `Sensors need exactly 2 cores, but received ${sensorAllocated}.`,
            failedStepIndex: stepIdxInExecuted,
            steps: executedSteps,
            finalHeap: currentHeap,
            sensorsExecuted,
            debrisExecuted,
            shieldsExecuted,
            threshold,
          };
        }
        sensorsExecuted = true;
      } else if (task === 'RUN_DEBRIS') {
        // Enforce sequence: Sensors must run before Debris
        if (!sensorsExecuted) {
          return {
            success: false,
            scenario: 'INCOMPLETE_TASKS',
            message: 'Run Sensors before Debris.',
            failedStepIndex: stepIdxInExecuted,
            steps: executedSteps,
            finalHeap: currentHeap,
            sensorsExecuted,
            debrisExecuted,
            shieldsExecuted,
            threshold,
          };
        }
        if (debrisAllocated !== 3) {
          return {
            success: false,
            scenario: 'NULL_POINTER_DEREFERENCE',
            message: debrisAllocated === 0
              ? 'Debris needs 3 cores! Allocate 3 cores before running.'
              : `Debris needs exactly 3 cores, but received ${debrisAllocated}.`,
            failedStepIndex: stepIdxInExecuted,
            steps: executedSteps,
            finalHeap: currentHeap,
            sensorsExecuted,
            debrisExecuted,
            shieldsExecuted,
            threshold,
          };
        }
        debrisExecuted = true;
      } else if (task === 'RUN_SHIELDS') {
        // Enforce sequence: Sensors & Debris must run before Shields
        if (!sensorsExecuted || !debrisExecuted) {
          return {
            success: false,
            scenario: 'INCOMPLETE_TASKS',
            message: 'Run Sensors and Debris before Shields.',
            failedStepIndex: stepIdxInExecuted,
            steps: executedSteps,
            finalHeap: currentHeap,
            sensorsExecuted,
            debrisExecuted,
            shieldsExecuted,
            threshold,
          };
        }
        if (shieldAllocated !== 2) {
          return {
            success: false,
            scenario: 'NULL_POINTER_DEREFERENCE',
            message: shieldAllocated === 0
              ? 'Shields need 2 cores! Allocate 2 cores before running.'
              : `Shields need exactly 2 cores, but received ${shieldAllocated}.`,
            failedStepIndex: stepIdxInExecuted,
            steps: executedSteps,
            finalHeap: currentHeap,
            sensorsExecuted,
            debrisExecuted,
            shieldsExecuted,
            threshold,
          };
        }
        shieldsExecuted = true;
      }
    } else if (step.type === 'DEALLOCATE') {
      const ptr = step.pointer;
      const allocatedAmount = ptr === 'sensorPtr' ? sensorAllocated : ptr === 'debrisPtr' ? debrisAllocated : shieldAllocated;

      // Double-free / Empty pointer release detection
      if (allocatedAmount === 0) {
        return {
          success: false,
          scenario: 'NULL_POINTER_DEREFERENCE',
          message: `No cores attached! Grab cores before returning them.`,
          failedStepIndex: stepIdxInExecuted,
          steps: executedSteps,
          finalHeap: currentHeap,
          sensorsExecuted,
          debrisExecuted,
          shieldsExecuted,
          threshold,
        };
      }

      // Order Verification: Subsystem must run before cores can be returned with delete
      if (ptr === 'sensorPtr' && !sensorsExecuted) {
        return {
          success: false,
          scenario: 'INCOMPLETE_TASKS',
          message: "Sensors was never run! Execute 'runSensors()' while cores are loaded before returning them.",
          failedStepIndex: stepIdxInExecuted,
          steps: executedSteps,
          finalHeap: currentHeap,
          sensorsExecuted,
          debrisExecuted,
          shieldsExecuted,
          threshold,
        };
      }
      if (ptr === 'debrisPtr' && !debrisExecuted) {
        return {
          success: false,
          scenario: 'INCOMPLETE_TASKS',
          message: "Debris was never run! Execute 'runDebris()' while cores are loaded before returning them.",
          failedStepIndex: stepIdxInExecuted,
          steps: executedSteps,
          finalHeap: currentHeap,
          sensorsExecuted,
          debrisExecuted,
          shieldsExecuted,
          threshold,
        };
      }
      if (ptr === 'shieldPtr' && !shieldsExecuted) {
        return {
          success: false,
          scenario: 'INCOMPLETE_TASKS',
          message: "Shields was never run! Execute 'runShields()' while cores are loaded before returning them.",
          failedStepIndex: stepIdxInExecuted,
          steps: executedSteps,
          finalHeap: currentHeap,
          sensorsExecuted,
          debrisExecuted,
          shieldsExecuted,
          threshold,
        };
      }

      if (ptr === 'sensorPtr') {
        currentHeap += sensorAllocated;
        sensorAllocated = 0;
      } else if (ptr === 'debrisPtr') {
        currentHeap += debrisAllocated;
        debrisAllocated = 0;
      } else if (ptr === 'shieldPtr') {
        currentHeap += shieldAllocated;
        shieldAllocated = 0;
      }
      if (currentHeap > 4) currentHeap = 4;
    }
  }



  // Check 4: Incomplete Tasks (All 3 Tasks Required)
  if (!sensorsExecuted || !debrisExecuted || !shieldsExecuted) {
    if (sensorAllocated > 0 && !sensorsExecuted) {
      return {
        success: false,
        scenario: 'INCOMPLETE_TASKS',
        message: "Sensors cores are loaded, but the subsystem was never run! The correct order is: Ready Arm -> Grab Core -> Run Subsystem.",
        steps: executedSteps,
        finalHeap: currentHeap,
        sensorsExecuted,
        debrisExecuted,
        shieldsExecuted,
        threshold,
      };
    }
    if (debrisAllocated > 0 && !debrisExecuted) {
      return {
        success: false,
        scenario: 'INCOMPLETE_TASKS',
        message: "Debris cores are loaded, but the subsystem was never run! The correct order is: Ready Arm -> Grab Core -> Run Subsystem.",
        steps: executedSteps,
        finalHeap: currentHeap,
        sensorsExecuted,
        debrisExecuted,
        shieldsExecuted,
        threshold,
      };
    }
    if (shieldAllocated > 0 && !shieldsExecuted) {
      return {
        success: false,
        scenario: 'INCOMPLETE_TASKS',
        message: "Shields cores are loaded, but the subsystem was never run! The correct order is: Ready Arm -> Grab Core -> Run Subsystem.",
        steps: executedSteps,
        finalHeap: currentHeap,
        sensorsExecuted,
        debrisExecuted,
        shieldsExecuted,
        threshold,
      };
    }
    let progressMsg = 'Run Sensors, Debris, and Shields in sequence: Ready Arm -> Grab Core -> Run Subsystem.';
    if (sensorsExecuted && debrisExecuted && !shieldsExecuted) {
      progressMsg = 'Sensors & Debris complete! Ready Arm, Grab 2 cores, and Run Shields.';
    } else if (sensorsExecuted && !debrisExecuted && !shieldsExecuted) {
      progressMsg = 'Sensors complete! Ready Arm, Grab 3 cores, and Run Debris.';
    }
    return {
      success: false,
      scenario: 'INCOMPLETE_TASKS',
      message: progressMsg,
      steps: executedSteps,
      finalHeap: currentHeap,
      sensorsExecuted,
      debrisExecuted,
      shieldsExecuted,
      threshold,
    };
  }

  // Check 5: Memory Leak (All 4 Cores Must Be Returned to Heap Rack)
  if (currentHeap < 4 || sensorAllocated > 0 || debrisAllocated > 0 || shieldAllocated > 0) {
    const leakedPtr = shieldAllocated > 0 ? 'shieldPtr' : debrisAllocated > 0 ? 'debrisPtr' : 'sensorPtr';
    return {
      success: false,
      scenario: 'MEMORY_LEAK',
      message: `Memory leak! Return cores from '${leakedPtr}' with delete before ending program.`,
      steps: executedSteps,
      finalHeap: currentHeap,
      sensorsExecuted,
      debrisExecuted,
      shieldsExecuted,
      threshold,
    };
  }

  // Perfect Sequence (Success)
  return {
    success: true,
    scenario: 'SUCCESS',
    message: 'Station Safe! All tasks completed and cores returned.',
    steps: executedSteps,
    finalHeap: currentHeap,
    sensorsExecuted: true,
    debrisExecuted: true,
    shieldsExecuted: true,
    threshold,
  };
}

// =============================================================================
// CUSTOM BLOCK REGISTRATION
// =============================================================================

let isSaturn3BlocksRegistered = false;

export function registerSaturnLevel3Blocks() {
  if (isSaturn3BlocksRegistered) return;
  isSaturn3BlocksRegistered = true;

  // 1. START PROGRAM (int main)
  Blockly.Blocks['saturn3_start'] = {
    init: function () {
      this.appendDummyInput().appendField('Start');
      this.setPreviousStatement(false);
      this.setNextStatement(true, null);
      this.setColour('#EF4444'); // Red cap matching Saturn 1 & 2
      this.setTooltip('Starts the C++ program (int main() {)');
    },
  };

  javascriptGenerator.forBlock['saturn3_start'] = function () {
    return 'int main() {\n';
  };

  // 2. END PROGRAM (return 0;)
  Blockly.Blocks['saturn3_end'] = {
    init: function () {
      this.appendDummyInput().appendField('End');
      this.setPreviousStatement(true, null);
      this.setNextStatement(false);
      this.setColour('#EF4444'); // Red shoe matching Saturn 1 & 2
      this.setTooltip('Ends the C++ program successfully (return 0; })');
    },
  };

  javascriptGenerator.forBlock['saturn3_end'] = function () {
    return '    return 0;\n}\n';
  };

  // 3. SENSORS TASK BLOCKS
  Blockly.Blocks['saturn3_sensors_grab'] = {
    init: function () {
      this.appendDummyInput().appendField('Grab Cores (Sensors)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#06B6D4'); // Cyan for Sensors
      this.setTooltip('Allocates energy cores from the rack for the Sensors task (Task* sensorPtr = new Core(...);)');
    },
  };

  javascriptGenerator.forBlock['saturn3_sensors_grab'] = function () {
    return '    Task* sensorPtr = new Core(2);\n';
  };

  Blockly.Blocks['saturn3_sensors_run'] = {
    init: function () {
      this.appendDummyInput().appendField('Run Sensors');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0EA5E9'); // Sky blue
      this.setTooltip('Runs the sensor scanner subroutine (runSensors();)');
    },
  };

  javascriptGenerator.forBlock['saturn3_sensors_run'] = function () {
    return '    runSensors();\n';
  };

  Blockly.Blocks['saturn3_sensors_release'] = {
    init: function () {
      this.appendDummyInput().appendField('Release Cores (Sensors)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#F59E0B'); // Amber for releasing
      this.setTooltip('Returns the cores back to the rack (delete sensorPtr;). Prevents memory leaks!');
    },
  };

  javascriptGenerator.forBlock['saturn3_sensors_release'] = function () {
    return '    delete sensorPtr;\n';
  };

  // 4. DEBRIS TASK BLOCKS
  Blockly.Blocks['saturn3_debris_grab'] = {
    init: function () {
      this.appendDummyInput().appendField('Grab Cores (Debris)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#8B5CF6'); // Purple for Debris
      this.setTooltip('Allocates energy cores from the rack for the Debris task (Task* debrisPtr = new Core(...);)');
    },
  };

  javascriptGenerator.forBlock['saturn3_debris_grab'] = function () {
    return '    Task* debrisPtr = new Core(3);\n';
  };

  Blockly.Blocks['saturn3_debris_run'] = {
    init: function () {
      this.appendDummyInput().appendField('Run Debris');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#6366F1'); // Indigo
      this.setTooltip('Runs the debris pulverizer subroutine (runDebris();)');
    },
  };

  javascriptGenerator.forBlock['saturn3_debris_run'] = function () {
    return '    runDebris();\n';
  };

  Blockly.Blocks['saturn3_debris_release'] = {
    init: function () {
      this.appendDummyInput().appendField('Release Cores (Debris)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#F59E0B'); // Amber for releasing
      this.setTooltip('Returns the cores back to the rack (delete debrisPtr;). Prevents memory leaks!');
    },
  };

  javascriptGenerator.forBlock['saturn3_debris_release'] = function () {
    return '    delete debrisPtr;\n';
  };

  // 5. SHIELDS TASK BLOCKS
  Blockly.Blocks['saturn3_shields_grab'] = {
    init: function () {
      this.appendDummyInput().appendField('Grab Cores (Shields)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#10B981'); // Emerald for Shields
      this.setTooltip('Allocates energy cores from the rack for the defense shields (Task* shieldPtr = new Core(...);)');
    },
  };

  javascriptGenerator.forBlock['saturn3_shields_grab'] = function () {
    return '    Task* shieldPtr = new Core(2);\n';
  };

  Blockly.Blocks['saturn3_shields_run'] = {
    init: function () {
      this.appendDummyInput().appendField('Run Shields');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#059669'); // Dark Emerald
      this.setTooltip('Activates the station deflector shield subroutine (runShields();)');
    },
  };

  javascriptGenerator.forBlock['saturn3_shields_run'] = function () {
    return '    runShields();\n';
  };

  Blockly.Blocks['saturn3_shields_release'] = {
    init: function () {
      this.appendDummyInput().appendField('Release Cores (Shields)');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#F59E0B'); // Amber for releasing
      this.setTooltip('Returns the cores back to the rack (delete shieldPtr;). Prevents memory leaks!');
    },
  };

  javascriptGenerator.forBlock['saturn3_shields_release'] = function () {
    return '    delete shieldPtr;\n';
  };

  // 6. MODULAR PHYSICAL ACTION BLOCKS (Plain English for Beginners - Zero Code Syntax)
  // First option is a placeholder so toolbox blocks never reveal the answer.
  const POINTER_OPTIONS: [string, string][] = [
    ['Select...', 'NONE'],
    ['Sensors', 'SENSOR'],
    ['Debris', 'DEBRIS'],
    ['Shields', 'SHIELD'],
  ];

  const TASK_OPTIONS: [string, string][] = [
    ['Select...', 'NONE'],
    ['Sensors', 'RUN_SENSORS'],
    ['Debris', 'RUN_DEBRIS'],
    ['Shields', 'RUN_SHIELDS'],
  ];

  // 6.1 Ready Arm (Pointer Declaration)
  const registerPointerDeclareBlock = (blockType: string) => {
    Blockly.Blocks[blockType] = {
      init: function () {
        this.appendDummyInput()
          .appendField('Ready Arm for')
          .appendField(new Blockly.FieldDropdown(POINTER_OPTIONS), 'POINTER_NAME');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#6366F1');
        this.setTooltip('Prepares the robotic arm for this subsystem.');
      },
    };

    javascriptGenerator.forBlock[blockType] = function (block: any) {
      const rawPtr = block.getFieldValue('POINTER_NAME');
      const ptrName = rawPtr === 'SHIELD' ? 'shieldPtr' : rawPtr === 'DEBRIS' ? 'debrisPtr' : rawPtr === 'SENSOR' ? 'sensorPtr' : '???';
      return `    Task* ${ptrName} = nullptr;\n`;
    };
  };

  registerPointerDeclareBlock('cpp_pointer_declare');
  registerPointerDeclareBlock('saturn3_arm_ready');

  // 6.2 Grab Cores (Memory Allocation / new)
  const registerMemoryNewBlock = (blockType: string) => {
    Blockly.Blocks[blockType] = {
      init: function () {
        this.appendDummyInput()
          .appendField('Grab')
          .appendField(new Blockly.FieldNumber(0, 0, 4, 1), 'CORE_AMOUNT')
          .appendField('Cores for')
          .appendField(new Blockly.FieldDropdown(POINTER_OPTIONS), 'POINTER_NAME');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#10B981');
        this.setTooltip("Takes energy cores from the rack for the subsystem.");
      },
    };

    javascriptGenerator.forBlock[blockType] = function (block: any) {
      const rawPtr = block.getFieldValue('POINTER_NAME');
      const ptrName = rawPtr === 'SHIELD' ? 'shieldPtr' : rawPtr === 'DEBRIS' ? 'debrisPtr' : rawPtr === 'SENSOR' ? 'sensorPtr' : '???';
      const amount = Number(block.getFieldValue('CORE_AMOUNT')) || 0;
      return `    ${ptrName} = new Core(${amount});\n`;
    };
  };

  registerMemoryNewBlock('cpp_memory_new');
  registerMemoryNewBlock('saturn3_grab_cores');

  // 6.3 Run Subsystem (Task Execution)
  const registerRunTaskBlock = (blockType: string) => {
    Blockly.Blocks[blockType] = {
      init: function () {
        this.appendDummyInput()
          .appendField('Run Subsystem:')
          .appendField(new Blockly.FieldDropdown(TASK_OPTIONS), 'TASK_NAME');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#8B5CF6');
        this.setTooltip("Powers and runs the subsystem with its attached cores.");
      },
    };

    javascriptGenerator.forBlock[blockType] = function (block: any) {
      const task = block.getFieldValue('TASK_NAME');
      const fnName = task === 'RUN_SHIELDS' ? 'runShields' : task === 'RUN_DEBRIS' ? 'runDebris' : task === 'RUN_SENSORS' ? 'runSensors' : '???';
      return `    ${fnName}();\n`;
    };
  };

  registerRunTaskBlock('cpp_run_task');
  registerRunTaskBlock('saturn3_run_task');

  // 6.4 Return Cores (Memory Deallocation / delete)
  const registerMemoryDeleteBlock = (blockType: string) => {
    Blockly.Blocks[blockType] = {
      init: function () {
        this.appendDummyInput()
          .appendField('Return Cores for')
          .appendField(new Blockly.FieldDropdown(POINTER_OPTIONS), 'POINTER_NAME');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#F97316');
        this.setTooltip('Returns the energy cores back to the rack so other tasks can use them.');
      },
    };

    javascriptGenerator.forBlock[blockType] = function (block: any) {
      const rawPtr = block.getFieldValue('POINTER_NAME');
      const ptrName = rawPtr === 'SHIELD' ? 'shieldPtr' : rawPtr === 'DEBRIS' ? 'debrisPtr' : rawPtr === 'SENSOR' ? 'sensorPtr' : '???';
      return `    delete ${ptrName};\n`;
    };
  };

  registerMemoryDeleteBlock('cpp_memory_delete');
  registerMemoryDeleteBlock('saturn3_release_cores');

  // 6.5 Conditional Guard (If Memory Condition Then)
  const registerIfBlock = (blockType: string) => {
    Blockly.Blocks[blockType] = {
      init: function () {
        const dropdown = new Blockly.FieldDropdown(
          [
            ['RAM Pressure >= ...', 'NONE'],
            ['RAM Pressure >= 25%', 'PRESSURE_25'],
            ['RAM Pressure >= 50%', 'PRESSURE_50'],
            ['RAM Pressure >= 75%', 'PRESSURE_75'],
            ['RAM Pressure >= 100%', 'PRESSURE_100'],
          ],
          function (this: any, newValue: string) {
            if (newValue === 'NONE') return newValue;
            let tVal = 75;
            if (newValue === 'PRESSURE_25') tVal = 25;
            else if (newValue === 'PRESSURE_50') tVal = 50;
            else if (newValue === 'PRESSURE_75') tVal = 75;
            else if (newValue === 'PRESSURE_100') tVal = 100;
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('saturn3-threshold-changed', {
                  detail: { threshold: tVal },
                })
              );
            }
            return newValue;
          }
        );
        this.appendDummyInput()
          .appendField('if')
          .appendField(dropdown, 'CONDITION')
          .appendField('then');
        this.appendStatementInput('DO');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour('#3B82F6');
        this.setTooltip('If the RAM pressure threshold is reached, run the guard actions inside.');
      },
    };

    javascriptGenerator.forBlock[blockType] = function (block: any) {
      const condition = block.getFieldValue('CONDITION') || 'NONE';
      let thresholdVal: number | string = '???';
      if (condition === 'PRESSURE_25') thresholdVal = 25;
      else if (condition === 'PRESSURE_50') thresholdVal = 50;
      else if (condition === 'PRESSURE_75') thresholdVal = 75;
      else if (condition === 'PRESSURE_100') thresholdVal = 100;

      const branchDo = javascriptGenerator.statementToCode(block, 'DO') || '';
      return `    if (ramPressure >= ${thresholdVal}) {\n${branchDo}    }\n`;
    };
  };

  registerIfBlock('cpp_if_guard');
  registerIfBlock('cpp_if_else');
  registerIfBlock('saturn3_if_else');
}

// =============================================================================
// WORKSPACE PARSER (Linear & Branching Chain Extraction)
// =============================================================================

/** Maps a dropdown value to a pointer id; returns undefined for the 'NONE' placeholder. */
function toPointerId(raw: string): PointerId | undefined {
  if (raw === 'SHIELD') return 'shieldPtr';
  if (raw === 'DEBRIS') return 'debrisPtr';
  if (raw === 'SENSOR') return 'sensorPtr';
  return undefined;
}

export function parseSaturnLevel3Workspace(ws: Blockly.Workspace): Saturn3WorkspacePayload {
  if (!ws) return INITIAL_SATURN_3_PAYLOAD;

  const topBlocks = ws.getTopBlocks(true);
  const allBlocks = ws.getAllBlocks(false);
  const steps: MemoryStepAction[] = [];
  const declaredPointers = new Set<PointerId>();
  let hasStart = false;
  let hasEnd = false;

  const processBlockChain = (root: Blockly.Block | null) => {
    let curBlock: Blockly.Block | null = root;
    while (curBlock) {
      if (curBlock.type === 'saturn3_start') {
        hasStart = true;
        steps.push({
          type: 'START',
          blockId: curBlock.id,
        });
      } else if (curBlock.type === 'saturn3_end') {
        hasEnd = true;
        steps.push({
          type: 'END',
          blockId: curBlock.id,
        });
      } else if (curBlock.type === 'saturn3_sensors_grab') {
        declaredPointers.add('sensorPtr');
        steps.push({
          type: 'DECLARE',
          pointer: 'sensorPtr',
          blockId: curBlock.id,
        });
        steps.push({
          type: 'ALLOCATE',
          pointer: 'sensorPtr',
          cores: 2,
          blockId: curBlock.id,
        });
      } else if (curBlock.type === 'saturn3_sensors_run') {
        steps.push({
          type: 'RUN_TASK',
          task: 'RUN_SENSORS',
          blockId: curBlock.id,
        });
      } else if (curBlock.type === 'saturn3_sensors_release') {
        steps.push({
          type: 'DEALLOCATE',
          pointer: 'sensorPtr',
          blockId: curBlock.id,
        });
      } else if (curBlock.type === 'saturn3_debris_grab') {
        declaredPointers.add('debrisPtr');
        steps.push({
          type: 'DECLARE',
          pointer: 'debrisPtr',
          blockId: curBlock.id,
        });
        steps.push({
          type: 'ALLOCATE',
          pointer: 'debrisPtr',
          cores: 3,
          blockId: curBlock.id,
        });
      } else if (curBlock.type === 'saturn3_debris_run') {
        steps.push({
          type: 'RUN_TASK',
          task: 'RUN_DEBRIS',
          blockId: curBlock.id,
        });
      } else if (curBlock.type === 'saturn3_debris_release') {
        steps.push({
          type: 'DEALLOCATE',
          pointer: 'debrisPtr',
          blockId: curBlock.id,
        });
      } else if (curBlock.type === 'saturn3_shields_grab') {
        declaredPointers.add('shieldPtr');
        steps.push({
          type: 'DECLARE',
          pointer: 'shieldPtr',
          blockId: curBlock.id,
        });
        steps.push({
          type: 'ALLOCATE',
          pointer: 'shieldPtr',
          cores: 2,
          blockId: curBlock.id,
        });
      } else if (curBlock.type === 'saturn3_shields_run') {
        steps.push({
          type: 'RUN_TASK',
          task: 'RUN_SHIELDS',
          blockId: curBlock.id,
        });
      } else if (curBlock.type === 'saturn3_shields_release') {
        steps.push({
          type: 'DEALLOCATE',
          pointer: 'shieldPtr',
          blockId: curBlock.id,
        });
      } else if (curBlock.type === 'saturn3_arm_ready' || curBlock.type === 'cpp_pointer_declare') {
        const ptr = toPointerId(curBlock.getFieldValue('POINTER_NAME'));
        if (ptr) declaredPointers.add(ptr);
        steps.push({
          type: 'DECLARE',
          pointer: ptr,
          blockId: curBlock.id,
          invalid: ptr ? undefined : "Pick a subsystem in the 'Ready Arm for' block.",
        });
      } else if (curBlock.type === 'saturn3_grab_cores' || curBlock.type === 'cpp_memory_new') {
        const ptr = toPointerId(curBlock.getFieldValue('POINTER_NAME'));
        const cores = Number(curBlock.getFieldValue('CORE_AMOUNT')) || 0;
        steps.push({
          type: 'ALLOCATE',
          pointer: ptr,
          cores,
          blockId: curBlock.id,
          invalid: !ptr
            ? "Pick a subsystem in the 'Grab Cores' block."
            : cores <= 0
              ? "Set how many cores to grab in the 'Grab Cores' block."
              : undefined,
        });
      } else if (curBlock.type === 'saturn3_run_task' || curBlock.type === 'cpp_run_task') {
        const rawTask = curBlock.getFieldValue('TASK_NAME');
        const task: TaskId | undefined =
          rawTask === 'RUN_SHIELDS' ? 'RUN_SHIELDS' : rawTask === 'RUN_DEBRIS' ? 'RUN_DEBRIS' : rawTask === 'RUN_SENSORS' ? 'RUN_SENSORS' : undefined;
        steps.push({
          type: 'RUN_TASK',
          task,
          blockId: curBlock.id,
          invalid: task ? undefined : "Pick a subsystem in the 'Run Subsystem' block.",
        });
      } else if (curBlock.type === 'saturn3_release_cores' || curBlock.type === 'cpp_memory_delete') {
        const ptr = toPointerId(curBlock.getFieldValue('POINTER_NAME'));
        steps.push({
          type: 'DEALLOCATE',
          pointer: ptr,
          blockId: curBlock.id,
          invalid: ptr ? undefined : "Pick a subsystem in the 'Return Cores' block.",
        });
      } else if (curBlock.type === 'cpp_if_guard' || curBlock.type === 'cpp_if_else' || curBlock.type === 'saturn3_if_else') {
        const cond = curBlock.getFieldValue('CONDITION') || 'NONE';
        let condThreshold: number | undefined;
        if (cond === 'PRESSURE_25') condThreshold = 25;
        else if (cond === 'PRESSURE_50') condThreshold = 50;
        else if (cond === 'PRESSURE_75') condThreshold = 75;
        else if (cond === 'PRESSURE_100') condThreshold = 100;

        steps.push({
          type: 'IF_GUARD_START',
          threshold: condThreshold,
          blockId: curBlock.id,
          invalid: condThreshold === undefined ? "Pick a RAM pressure threshold in the 'if' block." : undefined,
        });

        const doBlock = curBlock.getInputTargetBlock('DO');
        if (doBlock) {
          processBlockChain(doBlock);
        }

        steps.push({
          type: 'IF_GUARD_END',
          blockId: curBlock.id,
        });
      }
      curBlock = curBlock.getNextBlock();
    }
  };

  // Walk primary sequential chain starting from Start block; prioritize Start chain to ignore stray blocks
  const startBlock = allBlocks.find(b => b.type === 'saturn3_start');
  if (startBlock) {
    hasStart = true;
    processBlockChain(startBlock);
  } else {
    topBlocks.forEach(rootBlock => {
      processBlockChain(rootBlock);
    });
  }

  // Check if End block is attached in the Start chain
  if (startBlock) {
    const connectedBlocks = startBlock.getDescendants(false);
    hasEnd = connectedBlocks.some(b => b.type === 'saturn3_end');
  } else {
    hasEnd = allBlocks.some(b => b.type === 'saturn3_end');
  }

  // Extract configured threshold dynamically from if block
  let threshold = 75;
  const guardStep = steps.find(s => s.type === 'IF_GUARD_START');
  if (guardStep && guardStep.threshold !== undefined) {
    threshold = guardStep.threshold;
  } else {
    const guardBlock = allBlocks.find(
      b => b.type === 'cpp_if_guard' || b.type === 'cpp_if_else' || b.type === 'saturn3_if_else'
    );
    if (guardBlock) {
      const cond = String(guardBlock.getFieldValue('CONDITION') || '');
      if (cond.includes('25')) threshold = 25;
      else if (cond.includes('50')) threshold = 50;
      else if (cond.includes('75')) threshold = 75;
      else if (cond.includes('100')) threshold = 100;
    } else {
      const firstAlloc = steps.find(s => s.type === 'ALLOCATE');
      if (firstAlloc) {
        threshold = firstAlloc.pointer === 'shieldPtr' ? 50 : firstAlloc.pointer === 'debrisPtr' ? 75 : 50;
      }
    }
  }

  let rawCppCode = '';
  try {
    rawCppCode = javascriptGenerator.workspaceToCode(ws);
  } catch (e) {
    console.warn('C++ generation error in Saturn 3:', e);
  }

  return {
    steps,
    rawCppCode,
    declaredPointers,
    hasStart,
    hasEnd,
    threshold,
  };
}

// =============================================================================
// STARTER XML & TOOLBOX
// =============================================================================

export const SATURN_LEVEL_3_STARTER_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
</xml>
`.trim();

export function getSaturnLevel3Toolbox(): string {
  return `
<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox" style="display: none">
  <category name="Event" colour="#EF4444">
    <block type="saturn3_start"></block>
    <block type="saturn3_end"></block>
  </category>
  <category name="Subsystems" colour="#8B5CF6">
    <block type="cpp_pointer_declare"></block>
    <block type="cpp_run_task"></block>
  </category>
  <category name="Memory" colour="#10B981">
    <block type="cpp_memory_new"></block>
    <block type="cpp_memory_delete"></block>
  </category>
  <category name="Logic" colour="#3B82F6">
    <block type="cpp_if_guard"></block>
  </category>
</xml>
  `.trim();
}

// =============================================================================
// MISSION SECTIONS CONFIG
// =============================================================================

export const SATURN_3_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: 'A Leak in the System!',
    subtag: 'POINTERS & HEAP RECYCLING',
    desc:
      "The station needs more energy than the rack holds at once! Check each terminal to see how many cores each subsystem needs, grab cores with new, and use delete to return them before the next subsystem runs.",
    tip: "A pointer arm holds cores for a task. Use 'new' to grab cores and 'delete' to return them to the rack so the next task has enough power.",
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      { id: 1, text: 'Check all 3 terminals for power requirements', completed: false },
      { id: 2, text: 'Power and run Sensors, Debris, and Shields', completed: false },
      { id: 3, text: 'Return all 4 cores to prevent leaks', completed: false },
    ],
  },
];

