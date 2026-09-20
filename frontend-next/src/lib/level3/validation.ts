import * as Blockly from 'blockly';

export interface ValidationResult {
  success: boolean;
  message: string;
  room?: 'oxygen' | 'shields' | 'engine' | 'cockpit';
}

/**
 * Validates mini-puzzles for Tabs 1 (Oxygen), 2 (Shields), and 3 (Engine)
 */
export function validateMiniPuzzle(
  workspace: Blockly.WorkspaceSvg | null,
  activeTab: number
): ValidationResult {
  if (!workspace) {
    return { success: false, message: "Workspace not loaded." };
  }

  const topBlocks = workspace.getTopBlocks(true);
  if (topBlocks.length === 0) {
    return { success: false, message: "Snap your code blocks together first!" };
  }

  // Find the first actionable block (either under event_start or top block)
  const getFirstActionBlock = () => {
    const startBlock = topBlocks.find((b) => b.type === 'event_start');
    if (startBlock) {
      return startBlock.getNextBlock();
    }
    return topBlocks[0];
  };

  const firstBlock = getFirstActionBlock();
  if (!firstBlock) {
    return { success: false, message: "Snap your action blocks to begin testing!" };
  }

  // --- TAB 1: OXYGEN ROOM (Sequence Review) ---
  // Must contain: unlock_door -> open_valve -> pump_air
  if (activeTab === 1) {
    if (firstBlock.type !== 'unlock_door' && firstBlock.type !== 'close_doors') {
      return {
        success: false,
        message: "Step 1 needed: Unlock the door first to access the room!",
      };
    }

    const secondBlock = firstBlock.getNextBlock();
    if (!secondBlock || secondBlock.type !== 'open_valve') {
      return {
        success: false,
        message: "Step 2 needed: Connect 'Open Valve' directly after 'Unlock Door'!",
      };
    }

    const thirdBlock = secondBlock.getNextBlock();
    if (!thirdBlock || thirdBlock.type !== 'pump_air') {
      return {
        success: false,
        message: "Step 3 needed: Connect 'Pump Air' directly after 'Open Valve'!",
      };
    }

    return {
      success: true,
      message: "Success! Oxygen function unlocked in the Cockpit.",
      room: 'oxygen',
    };
  }

  // --- TAB 2: SHIELD ROOM (Loops Review) ---
  // Must contain a repeat block set to 4, with charge_cell inside
  if (activeTab === 2) {
    const allBlocks = workspace.getAllBlocks(false);
    const loopBlock = allBlocks.find(
      (b) =>
        b.type === 'controls_repeat' ||
        b.type === 'controls_repeat_ext' ||
        b.type === 'repeat_x_times'
    );

    if (!loopBlock) {
      return {
        success: false,
        message: "Use a Repeat loop to charge all 4 shield cells efficiently!",
      };
    }

    // Check repeat count (field or TIMES input)
    let times = 0;
    const timesField = loopBlock.getFieldValue('TIMES');
    if (timesField !== null && timesField !== undefined) {
      times = Number(timesField);
    } else {
      const timesInputBlock = loopBlock.getInputTargetBlock('TIMES');
      if (timesInputBlock && timesInputBlock.getFieldValue('NUM')) {
        times = Number(timesInputBlock.getFieldValue('NUM'));
      }
    }

    if (times !== 4) {
      return {
        success: false,
        message: `Your loop is set to repeat ${times} time(s). Set it to exactly 4 times!`,
      };
    }

    // Check nested statement block
    const nested =
      loopBlock.getInputTargetBlock('DO') ||
      loopBlock.getInputTargetBlock('STACK');

    if (!nested || (nested.type !== 'charge_cell' && nested.type !== 'charge_battery')) {
      return {
        success: false,
        message: "Place the 'Charge Cell' block inside the Repeat 4 times loop!",
      };
    }

    return {
      success: true,
      message: "Success! Shield function unlocked in the Cockpit.",
      room: 'shields',
    };
  }

  // --- TAB 3: ENGINE ROOM (Conditionals Review) ---
  // Must contain an If/Else block checking fuel type, with add_cryo and add_catalyst in DO / ELSE branches
  if (activeTab === 3) {
    const allBlocks = workspace.getAllBlocks(false);
    const ifElseBlock = allBlocks.find(
      (b) =>
        b.type === 'controls_ifelse' ||
        b.type === 'controls_if' ||
        b.type === 'if_scan_else'
    );

    if (!ifElseBlock) {
      return {
        success: false,
        message: "Use an If / Else conditional block to sort the fuel types!",
      };
    }

    // Check condition block
    const conditionBlock =
      ifElseBlock.getInputTargetBlock('IF0') ||
      ifElseBlock.getInputTargetBlock('CONDITION');

    if (!conditionBlock || conditionBlock.type !== 'check_fuel_type') {
      return {
        success: false,
        message: "Snap 'Fuel is [Blue Cryo]' into the If condition slot!",
      };
    }

    const fuelType = conditionBlock.getFieldValue('TYPE') || 'blue_cryo';

    // Check DO branch and ELSE branch
    const doBranch =
      ifElseBlock.getInputTargetBlock('DO0') ||
      ifElseBlock.getInputTargetBlock('DO');
    const elseBranch =
      ifElseBlock.getInputTargetBlock('ELSE');

    if (!doBranch || !elseBranch) {
      return {
        success: false,
        message: "Both the 'do' and 'else' branches must have fuel actions connected!",
      };
    }

    const isCryoFirst = fuelType === 'blue_cryo';
    const expectedDoType = isCryoFirst ? 'add_cryo' : 'add_catalyst';
    const expectedElseType = isCryoFirst ? 'add_catalyst' : 'add_cryo';

    const validDo = doBranch.type === expectedDoType || (isCryoFirst && doBranch.type === 'mix_blue_fuel') || (!isCryoFirst && doBranch.type === 'mix_green_fuel');
    const validElse = elseBranch.type === expectedElseType || (isCryoFirst && elseBranch.type === 'mix_green_fuel') || (!isCryoFirst && elseBranch.type === 'mix_blue_fuel');

    if (!validDo || !validElse) {
      return {
        success: false,
        message: isCryoFirst
          ? "If Fuel is Blue Cryo, do 'Add Cryo Fuel', else do 'Add Catalyst'!"
          : "If Fuel is Green Catalyst, do 'Add Catalyst', else do 'Add Cryo Fuel'!",
      };
    }

    return {
      success: true,
      message: "Success! Thruster function unlocked in the Cockpit.",
      room: 'engine',
    };
  }

  return { success: false, message: "Invalid room selection." };
}

/**
 * Validates the Cockpit launch sequence in Tab 4
 * Expected sequence:
 * 1. set_ship_power (POWER === 100) or variables_set (Ship_Power = 100)
 * 2. func_oxygen
 * 3. func_shields
 * 4. func_thrusters
 */
export function validateLaunchSequence(
  workspace: Blockly.WorkspaceSvg | null
): ValidationResult {
  if (!workspace) {
    return { success: false, message: "Workspace not loaded." };
  }

  const topBlocks = workspace.getTopBlocks(true);
  if (topBlocks.length === 0) {
    return {
      success: false,
      message: "Stack your launch sequence blocks in the workspace!",
    };
  }

  // Find the first actionable block
  let firstBlock: Blockly.Block | null = topBlocks.find((b) => b.type === 'event_start') || null;
  if (firstBlock) {
    firstBlock = firstBlock.getNextBlock();
  } else {
    firstBlock = topBlocks[0] || null;
  }

  if (!firstBlock) {
    return {
      success: false,
      message: "Connect your launch sequence blocks under the Start block!",
    };
  }

  // 1. Variable check: Set Ship Power to 100
  let isPowerSet = false;
  if (firstBlock.type === 'set_ship_power') {
    const powerVal = Number(firstBlock.getFieldValue('POWER') || 0);
    if (powerVal === 100) {
      isPowerSet = true;
    } else {
      return {
        success: false,
        message: `Ship power is set to ${powerVal}%. It must be set to 100% for liftoff!`,
      };
    }
  } else if (firstBlock.type === 'variables_set') {
    const valBlock = firstBlock.getInputTargetBlock('VALUE');
    const val = valBlock ? Number(valBlock.getFieldValue('NUM') || 0) : 0;
    if (val === 100) {
      isPowerSet = true;
    } else {
      return {
        success: false,
        message: `Ship power is set to ${val}%. It must be set to 100% for liftoff!`,
      };
    }
  }

  if (!isPowerSet) {
    return {
      success: false,
      message: "Step 1: Set Ship Power variable to 100 before activating systems!",
    };
  }

  // 2. Turn On Oxygen
  const secondBlock = firstBlock.getNextBlock();
  if (!secondBlock || secondBlock.type !== 'func_oxygen') {
    return {
      success: false,
      message: "Step 2: Connect 'Turn On Oxygen' directly under your power block!",
    };
  }

  // 3. Turn On Shields
  const thirdBlock = secondBlock.getNextBlock();
  if (!thirdBlock || thirdBlock.type !== 'func_shields') {
    return {
      success: false,
      message: "Step 3: Connect 'Turn On Shields' directly under 'Turn On Oxygen'!",
    };
  }

  // 4. Turn On Thrusters
  const fourthBlock = thirdBlock.getNextBlock();
  if (!fourthBlock || fourthBlock.type !== 'func_thrusters') {
    return {
      success: false,
      message: "Step 4: Connect 'Turn On Thrusters' to ignite the main engines!",
    };
  }

  return {
    success: true,
    message: "All systems green! Liftoff sequence engaged.",
    room: 'cockpit',
  };
}
