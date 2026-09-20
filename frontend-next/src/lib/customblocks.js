import * as Blockly from 'blockly';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';

// ==========================================
// 1. MOVEMENT (YELLOW BLOCKS: #EAB308)
// ==========================================

Blockly.Blocks['move_up'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Move Up");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EAB308');
    this.setTooltip("Move up 1 space.");
  }
};

Blockly.Blocks['move_down'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Move Down");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EAB308');
    this.setTooltip("Move down 1 space.");
  }
};

Blockly.Blocks['move_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Move Left");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EAB308');
    this.setTooltip("Move left 1 space.");
  }
};

Blockly.Blocks['move_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Move Right");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EAB308');
    this.setTooltip("Move right 1 space.");
  }
};

Blockly.Blocks['move_forward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Move Forward");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EAB308');
    this.setTooltip("Move forward 1 space.");
  }
};

Blockly.Blocks['move_backward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Move Backward");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EAB308');
    this.setTooltip("Move backward 1 space.");
  }
};

Blockly.Blocks['action_move'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("move")
        .appendField(new Blockly.FieldDropdown([
          ["forward", "FORWARD"],
          ["backward", "BACKWARD"],
          ["up", "UP"],
          ["down", "DOWN"],
          ["left", "LEFT"],
          ["right", "RIGHT"]
        ]), "DIR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EAB308');
    this.setTooltip("Move 1 space in the selected direction.");
  }
};

Blockly.Blocks['action_turn'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("turn")
        .appendField(new Blockly.FieldDropdown([
          ["left", "LEFT"],
          ["right", "RIGHT"]
        ]), "DIR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EAB308');
    this.setTooltip("Turn left or right.");
  }
};

Blockly.Blocks['turn_direction'] = {
  init: function() {
    this.appendValueInput("DIRECTION")
        .setCheck(["Direction", "Condition", "String"])
        .appendField("Turn");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EAB308');
    this.setTooltip("Turn left or right.");
  }
};

Blockly.Blocks['turn_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Turn Left");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EAB308');
    this.setTooltip("Turn 90 degrees counter-clockwise (Left).");
  }
};

Blockly.Blocks['turn_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Turn Right");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EAB308');
    this.setTooltip("Turn 90 degrees clockwise (Right).");
  }
};



// ==========================================
// EVENT BLOCKS (Red: #EF4444)
// ==========================================

Blockly.Blocks['event_start'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Start");
    this.setPreviousStatement(false); // Cap block (nothing can snap above it)
    this.setNextStatement(true, null);
    this.setColour('#EF4444');
    this.setTooltip("Start of the program.");
  }
};

Blockly.Blocks['event_end'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("End");
    this.setPreviousStatement(true, null);
    this.setNextStatement(false); // Shoe block (nothing can snap below it)
    this.setColour('#EF4444');
    this.setTooltip("End of the program.");
  }
};

Blockly.Blocks['on_start'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("When Run");
    this.appendStatementInput('DO')
        .setCheck(null);
    this.setColour('#EF4444');
    this.setTooltip("Start of the program.");
  }
};

// ==========================================
// 2. NUMBERS (GREEN BLOCKS: #22C55E)
// ==========================================

Blockly.Blocks['math_number'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber(1, 1, 100, 1), "NUM");
    this.setOutput(true, "Number");
    this.setColour('#22C55E');
    this.setTooltip("A number value.");
  }
};

// ==========================================
// 3. LOOPS (LIGHT PURPLE BLOCKS: #A855F7)
// ==========================================

Blockly.Blocks['repeat_simple'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("repeat");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#8B5CF6');
    this.setTooltip("Repeat the action continuously.");
  }
};

Blockly.Blocks['repeat_until_goal'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("repeat until goal");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#8B5CF6');
    this.setTooltip("Repeat actions continuously until the goal is reached.");
  }
};

Blockly.Blocks['repeat_x_times'] = {
  init: function() {
    this.appendValueInput("TIMES")
        .setCheck("Number")
        .appendField("repeat");
    this.appendDummyInput()
        .appendField("times");
    this.setInputsInline(true);
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#F97316');
    this.setTooltip("Repeat a number of times.");
  }
};

// ==========================================
// 4. CONDITIONS (LIGHT BLUE BLOCKS: #38BDF8 / #3B82F6)
// ==========================================

Blockly.Blocks['controls_if'] = {
  init: function() {
    this.appendValueInput('IF0')
        .setCheck(['Boolean', 'Condition', 'String'])
        .appendField('if');
    this.appendStatementInput('DO0')
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip('If condition is true, execute the enclosed actions.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['controls_ifelse'] = {
  init: function() {
    this.appendValueInput('IF0')
        .setCheck(['Boolean', 'Condition', 'String'])
        .appendField('if');
    this.appendStatementInput('DO0')
        .setCheck(null);
    this.appendStatementInput('ELSE')
        .setCheck(null)
        .appendField('else');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip('If condition is true, execute the first block. Otherwise, execute the second block.');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['if_path_is'] = {
  init: function() {
    this.appendValueInput("CONDITION")
        .setCheck(["Condition", "Boolean", "String"])
        .appendField("if");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#38BDF8');
    this.setTooltip("Run if condition is true.");
  }
};

Blockly.Blocks['logic_and'] = {
  init: function() {
    this.appendValueInput("A")
        .setCheck(["Condition", "Boolean", "String"]);
    this.appendValueInput("B")
        .setCheck(["Condition", "Boolean", "String"])
        .appendField("and");
    this.setInputsInline(true);
    this.setOutput(true, "Condition");
    this.setColour('#38BDF8');
    this.setTooltip("Both conditions must be true.");
  }
};

Blockly.Blocks['logic_or'] = {
  init: function() {
    this.appendValueInput("A")
        .setCheck(["Condition", "Boolean", "String"]);
    this.appendValueInput("B")
        .setCheck(["Condition", "Boolean", "String"])
        .appendField("or");
    this.setInputsInline(true);
    this.setOutput(true, "Condition");
    this.setColour('#38BDF8');
    this.setTooltip("At least one condition must be true.");
  }
};

Blockly.Blocks['if_path_blocked'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("If the path is Blocked");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#38BDF8');
    this.setTooltip("Run if path is blocked.");
  }
};

Blockly.Blocks['if_path_ahead'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("If the path is Clear");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#38BDF8');
    this.setTooltip("Run if path ahead is clear.");
  }
};

Blockly.Blocks['is_hazard_ahead'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Hazard Ahead");
    this.setOutput(true, "Boolean");
    this.setColour('#10B981');
    this.setTooltip("Checks if there is a hazard directly ahead.");
  }
};

Blockly.Blocks['is_path_clear_forward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Path Clear Ahead");
    this.setOutput(true, "Boolean");
    this.setColour('#10B981');
    this.setTooltip("Checks if the path directly ahead is clear.");
  }
};

Blockly.Blocks['is_path_blocked_forward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Path Ahead is Blocked");
    this.setOutput(true, "Boolean");
    this.setColour('#10B981');
    this.setTooltip("Checks if the path directly ahead is blocked or a wall.");
  }
};

Blockly.Blocks['is_path_clear_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Path Clear Right");
    this.setOutput(true, "Boolean");
    this.setColour('#10B981');
    this.setTooltip("Checks if the relative right is an open path.");
  }
};

Blockly.Blocks['is_path_clear_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Path Clear Left");
    this.setOutput(true, "Boolean");
    this.setColour('#10B981');
    this.setTooltip("Checks if the relative left is an open path.");
  }
};

Blockly.Blocks['sensor_hazard_detected'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Hazard Detected")
        .appendField(new Blockly.FieldDropdown([
          ["Ahead", "AHEAD"],
          ["Left", "LEFT"],
          ["Right", "RIGHT"]
        ]), "DIR");
    this.setOutput(true, "Boolean");
    this.setColour('#10B981');
    this.setTooltip("Checks if a hazard is detected in the specified relative direction.");
  }
};

Blockly.Blocks['sensor_path_clear'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Path is Clear")
        .appendField(new Blockly.FieldDropdown([
          ["Ahead", "AHEAD"],
          ["Left", "LEFT"],
          ["Right", "RIGHT"]
        ]), "DIR");
    this.setOutput(true, "Boolean");
    this.setColour('#10B981');
    this.setTooltip("Checks if the path is open and clear in the specified relative direction.");
  }
};

Blockly.Blocks['sensor_at_dead_end'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("At Dead End");
    this.setOutput(true, "Boolean");
    this.setColour('#10B981');
    this.setTooltip("Checks if Ahead, Left, and Right are all blocked.");
  }
};



Blockly.Blocks['if_path_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("If path to left is Clear");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#38BDF8');
    this.setTooltip("Run if left is clear.");
  }
};

Blockly.Blocks['if_path_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("If path to right is Clear");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#38BDF8');
    this.setTooltip("Run if right is clear.");
  }
};

// ==========================================
// 5. KEYWORDS (ORANGE BLOCKS: #F97316)
// ==========================================

Blockly.Blocks['keyword_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Left");
    this.setOutput(true, ["Direction", "Condition", "String"]);
    this.setColour('#F97316');
    this.setTooltip("Left direction.");
  }
};

Blockly.Blocks['keyword_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Right");
    this.setOutput(true, ["Direction", "Condition", "String"]);
    this.setColour('#F97316');
    this.setTooltip("Right direction.");
  }
};

Blockly.Blocks['keyword_clear'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Clear");
    this.setOutput(true, "Condition");
    this.setColour('#F97316');
    this.setTooltip("Checks if path is clear.");
  }
};

Blockly.Blocks['keyword_blocked'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Blocked");
    this.setOutput(true, "Condition");
    this.setColour('#F97316');
    this.setTooltip("Checks if path is blocked.");
  }
};

Blockly.Blocks['keyword_goal'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Ignition Node");
    this.setOutput(true, ["String", "Condition"]);
    this.setColour('#06B6D4');
    this.setTooltip("Ignition goal node.");
  }
};

// ==========================================
// LEVEL 3: ENGINE CALIBRATION & DIAGNOSTIC TERMINAL BLOCKS
// ==========================================

Blockly.Blocks['scan_next_node'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("scan next node");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#06B6D4');
    this.setTooltip("Shifts the scanner reticle to the next diagnostic node in the data stream.");
  }
};

Blockly.Blocks['scan_node_color'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("scan node color");
    this.setOutput(true, "String");
    this.setColour('#06B6D4');
    this.setTooltip("Returns the color ('Blue', 'Red', 'Green') of the scanned node.");
  }
};

Blockly.Blocks['scan_node_state'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("scan node state");
    this.setOutput(true, "String");
    this.setColour('#06B6D4');
    this.setTooltip("Returns the state ('Stable', 'Blinking') of the scanned node.");
  }
};

Blockly.Blocks['extract_power'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("extract power");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Takes power from a safe energy node to charge your ship.");
  }
};

Blockly.Blocks['repeat_until_charged'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("repeat until engine charged");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#F97316');
    this.setTooltip("Keeps running until engine charge reaches 100%.");
  }
};

Blockly.Blocks['queue_override'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Queue Override Protocol");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Selects the challenge terminal your rover is standing on.");
  }
};

Blockly.Blocks['lock_selection'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Lock In Selection");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Confirms your selected challenges when standing on the middle tile.");
  }
};

// ==========================================
// 5. LEVEL 3: THE STARSHIP PROTOCOL BLOCKS
// ==========================================

// --- Section 2: Maintenance Deck Sensors & Actions ---
Blockly.Blocks['sensor_asteroid'] = {
  init: function() {
    this.appendDummyInput().appendField("Asteroid Ahead?");
    this.setOutput(true, "Boolean");
    this.setColour('#38BDF8');
    this.setTooltip("Checks if an asteroid hazard is detected ahead.");
  }
};

Blockly.Blocks['sensor_fuel_low'] = {
  init: function() {
    this.appendDummyInput().appendField("Fuel Low?");
    this.setOutput(true, "Boolean");
    this.setColour('#38BDF8');
    this.setTooltip("Checks if engine fuel is running low.");
  }
};

Blockly.Blocks['sensor_oxygen_low'] = {
  init: function() {
    this.appendDummyInput().appendField("Oxygen Low?");
    this.setOutput(true, "Boolean");
    this.setColour('#38BDF8');
    this.setTooltip("Checks if life support oxygen levels are low.");
  }
};

Blockly.Blocks['action_shield'] = {
  init: function() {
    this.appendDummyInput().appendField("Raise Shields");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#8B5CF6');
    this.setTooltip("Deploys the ship's defensive forcefield.");
  }
};

Blockly.Blocks['action_refuel'] = {
  init: function() {
    this.appendDummyInput().appendField("Refuel Engine");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#F97316');
    this.setTooltip("Injects backup fuel into the propulsion engine.");
  }
};

Blockly.Blocks['action_pump_oxygen'] = {
  init: function() {
    this.appendDummyInput().appendField("Pump Oxygen");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#06B6D4');
    this.setTooltip("Pumps reserve oxygen into the cabin.");
  }
};

// --- Section 3: Power Reactor Variable Allocation ---
Blockly.Blocks['allocate_oxygen'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Allocate")
        .appendField(new Blockly.FieldNumber(30, 0, 100), "POWER")
        .appendField("Power to Oxygen");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#06B6D4');
    this.setTooltip("Allocates power units to Life Support.");
  }
};

Blockly.Blocks['allocate_shields'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Allocate")
        .appendField(new Blockly.FieldNumber(30, 0, 100), "POWER")
        .appendField("Power to Shields");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#8B5CF6');
    this.setTooltip("Allocates power units to Shields.");
  }
};

Blockly.Blocks['allocate_thrusters'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Allocate")
        .appendField(new Blockly.FieldNumber(40, 0, 100), "POWER")
        .appendField("Power to Thrusters");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#F97316');
    this.setTooltip("Allocates power units to Thrusters.");
  }
};

// --- Section 4: Autopilot Function Blocks ---
Blockly.Blocks['func_boost_systems'] = {
  init: function() {
    this.appendDummyInput().appendField("Boost Systems()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#06B6D4');
    this.setTooltip("Calls the Boost Systems routine.");
  }
};

Blockly.Blocks['func_evasive_shields'] = {
  init: function() {
    this.appendDummyInput().appendField("Evasive Shields()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#8B5CF6');
    this.setTooltip("Calls the Evasive Shields defense routine.");
  }
};

Blockly.Blocks['func_warp_jump'] = {
  init: function() {
    this.appendDummyInput().appendField("Engage Warp Jump()");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#F97316');
    this.setTooltip("Calls the Hyperdrive Warp Jump routine.");
  }
};

// --- Legacy Level 3 Aliases for backwards compatibility ---
Blockly.Blocks['unlock_door'] = {
  init: function() {
    this.appendDummyInput().appendField("Unlock Door");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#06B6D4');
    this.setTooltip("Unlock the airlock safety doors.");
  }
};

Blockly.Blocks['open_valve'] = {
  init: function() {
    this.appendDummyInput().appendField("Open Valve");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#06B6D4');
    this.setTooltip("Open the oxygen equalization valve.");
  }
};

Blockly.Blocks['close_doors'] = {
  init: function() {
    this.appendDummyInput().appendField("Unlock Door");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#06B6D4');
    this.setTooltip("Unlock the airlock doors.");
  }
};

Blockly.Blocks['pump_air'] = {
  init: function() {
    this.appendDummyInput().appendField("Pump Air");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#06B6D4');
    this.setTooltip("Pump oxygen into the life support system.");
  }
};

Blockly.Blocks['charge_cell'] = {
  init: function() {
    this.appendDummyInput().appendField("Charge Cell");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#8B5CF6');
    this.setTooltip("Charge a shield capacitor cell.");
  }
};

Blockly.Blocks['charge_battery'] = {
  init: function() {
    this.appendDummyInput().appendField("Charge Cell");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#8B5CF6');
    this.setTooltip("Charge a shield capacitor cell.");
  }
};

Blockly.Blocks['check_fuel_type'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Fuel is")
        .appendField(new Blockly.FieldDropdown([
          ["Blue Cryo", "blue_cryo"],
          ["Green Catalyst", "green_catalyst"]
        ]), "TYPE");
    this.setOutput(true, "Boolean");
    this.setColour('#38BDF8');
    this.setTooltip("Checks the fuel tank type.");
  }
};

Blockly.Blocks['add_cryo'] = {
  init: function() {
    this.appendDummyInput().appendField("Add Cryo Fuel");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#F97316');
    this.setTooltip("Inject cryogenic blue fuel.");
  }
};

Blockly.Blocks['add_catalyst'] = {
  init: function() {
    this.appendDummyInput().appendField("Add Catalyst");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#F97316');
    this.setTooltip("Inject green catalyst fuel.");
  }
};

Blockly.Blocks['mix_blue_fuel'] = {
  init: function() {
    this.appendDummyInput().appendField("Add Cryo Fuel");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#F97316');
    this.setTooltip("Inject cryogenic blue fuel.");
  }
};

Blockly.Blocks['mix_green_fuel'] = {
  init: function() {
    this.appendDummyInput().appendField("Add Catalyst");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#F97316');
    this.setTooltip("Inject green catalyst fuel.");
  }
};

Blockly.Blocks['set_ship_power'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Set Ship Power to")
        .appendField(new Blockly.FieldNumber(0, 0, 100), "POWER");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EAB308');
    this.setTooltip("Set the ship power variable (must be 100).");
  }
};

Blockly.Blocks['func_oxygen'] = {
  init: function() {
    this.appendDummyInput().appendField("Turn On Oxygen");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#06B6D4');
    this.setTooltip("Turn on the oxygen system.");
  }
};

Blockly.Blocks['func_shields'] = {
  init: function() {
    this.appendDummyInput().appendField("Turn On Shields");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#8B5CF6');
    this.setTooltip("Turn on the shield defense system.");
  }
};

Blockly.Blocks['func_thrusters'] = {
  init: function() {
    this.appendDummyInput().appendField("Turn On Thrusters");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#F97316');
    this.setTooltip("Turn on the rocket thrusters.");
  }
};

// ==========================================
// 5.5. FLIGHT SIMULATION BLOCKS (Section 3: Auto-Runner Survival)
// ==========================================

Blockly.Blocks['trigger_fuel_low'] = {
  init: function() {
    this.appendDummyInput().appendField("Fuel < 20%");
    this.setOutput(true, ["Condition", "Boolean", "String"]);
    this.setColour('#06B6D4');
    this.setTooltip("Triggers when ship fuel drops below the critical 20% threshold.");
  }
};

Blockly.Blocks['trigger_small_asteroid'] = {
  init: function() {
    this.appendDummyInput().appendField("Small Asteroid Detected");
    this.setOutput(true, ["Condition", "Boolean", "String"]);
    this.setColour('#06B6D4');
    this.setTooltip("Triggers when a small asteroid warning appears in flight lane.");
  }
};

Blockly.Blocks['trigger_oxygen_low'] = {
  init: function() {
    this.appendDummyInput().appendField("Oxygen < 20%");
    this.setOutput(true, ["Condition", "Boolean", "String"]);
    this.setColour('#06B6D4');
    this.setTooltip("Triggers when life support oxygen drops below the critical 20% threshold.");
  }
};

Blockly.Blocks['trigger_big_asteroid'] = {
  init: function() {
    this.appendDummyInput().appendField("Big Asteroid Detected");
    this.setOutput(true, ["Condition", "Boolean", "String"]);
    this.setColour('#06B6D4');
    this.setTooltip("Triggers when a massive asteroid warning appears in flight lane.");
  }
};

Blockly.Blocks['action_launch_rocket'] = {
  init: function() {
    this.appendDummyInput().appendField("Launch Rocket");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#10B981');
    this.setTooltip("Ignites propulsion engines and launches the starship into active flight.");
  }
};

Blockly.Blocks['action_refill_fuel_cells'] = {
  init: function() {
    this.appendDummyInput().appendField("Refill Fuel");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EC4899');
    this.setTooltip("Executes fuel injection subroutine to restore fuel cells to 100%.");
  }
};

Blockly.Blocks['action_fire_lasers'] = {
  init: function() {
    this.appendDummyInput().appendField("Fire Lasers");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EC4899');
    this.setTooltip("Fires ship plasma cannons to vaporize small asteroids.");
  }
};

Blockly.Blocks['action_pump_oxygen'] = {
  init: function() {
    this.appendDummyInput().appendField("Pump Oxygen");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EC4899');
    this.setTooltip("Pressurizes life support tanks to restore oxygen to 100%.");
  }
};

Blockly.Blocks['action_activate_shield'] = {
  init: function() {
    this.appendDummyInput().appendField("Activate Shield");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EC4899');
    this.setTooltip("Deploys energy shield barrier to deflect massive asteroids.");
  }
};

Blockly.Blocks['action_stop_rocket'] = {
  init: function() {
    this.appendDummyInput().appendField("Stop Rocket");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#10B981');
    this.setTooltip("Cuts engine thrusters to bring the starship to a complete stop.");
  }
};

Blockly.Blocks['action_greet_ufo'] = {
  init: function() {
    this.appendDummyInput().appendField("Greet UFO");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EC4899');
    this.setTooltip("Transmits a friendly greeting signal to the passing UFO.");
  }
};

Blockly.Blocks['action_fire_tractor_beam'] = {
  init: function() {
    this.appendDummyInput().appendField("Greet UFO");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#EC4899');
    this.setTooltip("Transmits a friendly greeting signal to the passing UFO.");
  }
};

// Case Situation Handlers (Level 3 Section 3)
Blockly.Blocks['case_emergency'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Case")
        .appendField(new Blockly.FieldDropdown([
          ["Fuel < 20%", "FUEL_LOW"],
          ["Oxygen < 20%", "OXYGEN_LOW"],
          ["Small Asteroid", "SMALL_ASTEROID"],
          ["Big Asteroid", "BIG_ASTEROID"],
          ["Friendly UFO", "FRIENDLY_UFO"]
        ]), "EMERGENCY");
    this.appendStatementInput("DO").setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Runs the action when this flight situation occurs.");
  }
};

// ==========================================
// 5.6. FUEL SYNTHESIS BLOCKS (Section 2: Nested Loops & Color Logic)
// ==========================================

Blockly.Blocks['color_is'] = {
  init: function() {
    this.appendValueInput("COLOR")
        .setCheck(["Color", "Condition", "String"])
        .appendField("Color is");
    this.setOutput(true, ["Condition", "Boolean", "String"]);
    this.setColour('#06B6D4');
    this.setTooltip("Checks if the chamber liquid matches the input color.");
  }
};

Blockly.Blocks['color_orange'] = {
  init: function() {
    this.appendDummyInput().appendField("Orange");
    this.setOutput(true, ["Color", "Condition", "String"]);
    this.setColour('#F97316');
    this.setTooltip("Orange fuel color.");
  }
};

Blockly.Blocks['color_blue'] = {
  init: function() {
    this.appendDummyInput().appendField("Blue");
    this.setOutput(true, ["Color", "Condition", "String"]);
    this.setColour('#3B82F6');
    this.setTooltip("Blue fuel color.");
  }
};

Blockly.Blocks['color_green'] = {
  init: function() {
    this.appendDummyInput().appendField("Green");
    this.setOutput(true, ["Color", "Condition", "String"]);
    this.setColour('#10B981');
    this.setTooltip("Green fuel color.");
  }
};

Blockly.Blocks['color_purple'] = {
  init: function() {
    this.appendDummyInput().appendField("Purple");
    this.setOutput(true, ["Color", "Condition", "String"]);
    this.setColour('#A855F7');
    this.setTooltip("Purple fuel color.");
  }
};

Blockly.Blocks['color_is_orange'] = {
  init: function() {
    this.appendDummyInput().appendField("Color is Orange");
    this.setOutput(true, ["Condition", "Boolean", "String"]);
    this.setColour('#F97316');
    this.setTooltip("True if the chamber liquid is currently Orange.");
  }
};

Blockly.Blocks['color_is_blue'] = {
  init: function() {
    this.appendDummyInput().appendField("Color is Blue");
    this.setOutput(true, ["Condition", "Boolean", "String"]);
    this.setColour('#3B82F6');
    this.setTooltip("True if the chamber liquid is currently Blue (Cold Fuel).");
  }
};

Blockly.Blocks['color_is_green'] = {
  init: function() {
    this.appendDummyInput().appendField("Color is Green");
    this.setOutput(true, ["Condition", "Boolean", "String"]);
    this.setColour('#10B981');
    this.setTooltip("True if the chamber liquid is currently Green (Thick Fuel).");
  }
};

Blockly.Blocks['color_is_purple'] = {
  init: function() {
    this.appendDummyInput().appendField("Color is Purple");
    this.setOutput(true, ["Condition", "Boolean", "String"]);
    this.setColour('#A855F7');
    this.setTooltip("True if the chamber liquid is currently Purple (Unstable Fuel).");
  }
};

Blockly.Blocks['color_is_not_orange'] = {
  init: function() {
    this.appendDummyInput().appendField("Color is not Orange");
    this.setOutput(true, ["Condition", "Boolean", "String"]);
    this.setColour('#F97316');
    this.setTooltip("True as long as the chamber liquid has not reached Orange.");
  }
};

Blockly.Blocks['while_color_not_orange'] = {
  init: function() {
    this.appendDummyInput().appendField("repeat");
    this.appendStatementInput("DO").setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#8B5CF6');
    this.setTooltip("Repeat enclosed actions continuously.");
  }
};

Blockly.Blocks['action_increase_heat'] = {
  init: function() {
    this.appendDummyInput().appendField("Increase Heat");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#F97316');
    this.setTooltip("Activates heating coils to activate grey fuel or turn blue fuel orange.");
  }
};

Blockly.Blocks['action_add_solution'] = {
  init: function() {
    this.appendDummyInput().appendField("Add Solution");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#06B6D4');
    this.setTooltip("Adds chemical thinning solution to dissolve thick green fuel.");
  }
};

Blockly.Blocks['action_mix'] = {
  init: function() {
    this.appendDummyInput().appendField("Mix Solution");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#A855F7');
    this.setTooltip("Agitates the fuel chamber with mechanical mixing blades.");
  }
};

Blockly.Blocks['action_put_fuel_tank'] = {
  init: function() {
    this.appendDummyInput().appendField("Fuel Spaceship");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#10B981');
    this.setTooltip("Pumps finished Orange fuel to fuel the spaceship.");
  }
};

// ==========================================
// 6. CONVEYOR BELT SORTING BLOCKS (Level 2: Resource Classification)
// ==========================================

Blockly.Blocks['send_to_area'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Send to")
        .appendField(new Blockly.FieldDropdown(function() {
          const ws = this.getSourceBlock() && this.getSourceBlock().workspace;
          const secIndex = (ws && typeof ws.currentSectionIndex === 'number')
            ? ws.currentSectionIndex
            : (typeof window !== 'undefined' && typeof window.__NETSTART_CURRENT_SECTION__ === 'number')
            ? window.__NETSTART_CURRENT_SECTION__
            : 3;

          if (secIndex === 0) {
            return [
              ["Cargo Bay", "CARGO_BAY"]
            ];
          }
          if (secIndex === 1) {
            return [
              ["Cargo Bay", "CARGO_BAY"],
              ["Trash", "TRASH"]
            ];
          }
          if (secIndex === 2) {
            return [
              ["Cargo Bay", "CARGO_BAY"],
              ["Rocket Ship", "ROCKET_SHIP"],
              ["Trash", "TRASH"]
            ];
          }
          return [
            ["Cargo Bay", "CARGO_BAY"],
            ["Rocket Ship", "ROCKET_SHIP"],
            ["Trash", "TRASH"],
            ["Cafeteria", "CAFETERIA"]
          ];
        }), "DESTINATION");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Routes the current scanned item on the conveyor belt to the selected destination.");
  }
};

Blockly.Blocks['action_pack_cargo'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Pack Cargo");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Packs the item currently at the front of the conveyor belt into the Cargo Bay.");
  }
};

Blockly.Blocks['action_discard_trash'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Discard Trash");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Discards the item currently at the front of the conveyor belt into the Scrap Chute.");
  }
};

Blockly.Blocks['action_route_fuel'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Route to Fuel Bay");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Routes the fuel item at the front of the conveyor belt into the Fuel Bay.");
  }
};

Blockly.Blocks['action_route_food'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Route to Food Storage");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Routes the food item at the front of the conveyor belt into Food Storage.");
  }
};

Blockly.Blocks['action_pack_item'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Pack Cargo");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Packs the item currently at the front of the conveyor belt into the Cargo Bay.");
  }
};

Blockly.Blocks['action_discard_item'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Discard Trash");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Discards the item currently at the front of the conveyor belt into the scrap chute.");
  }
};

Blockly.Blocks['scan_current_item'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Scan Current Item");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Scans the item at the front of the conveyor belt to identify its type.");
  }
};

Blockly.Blocks['scan_item'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Scan Item");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Checks the current item at the front of the conveyor belt.");
  }
};

Blockly.Blocks['pickup_item'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Pack Cargo");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#3B82F6');
    this.setTooltip("Packs the front item into Cargo Bay.");
  }
};

Blockly.Blocks['trash_item'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Discard Trash");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#6B7280');
    this.setTooltip("Discards the front item into Scrap Chute.");
  }
};

Blockly.Blocks['item_cargo'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Cargo");
    this.setOutput(true, ["Item", "Condition", "String"]);
    this.setColour('#06B6D4');
    this.setTooltip("Cargo item.");
  }
};

Blockly.Blocks['item_trash'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Trash");
    this.setOutput(true, ["Item", "Condition", "String"]);
    this.setColour('#06B6D4');
    this.setTooltip("Trash item.");
  }
};

Blockly.Blocks['item_fuel'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Fuel");
    this.setOutput(true, ["Item", "Condition", "String"]);
    this.setColour('#06B6D4');
    this.setTooltip("Fuel item.");
  }
};

Blockly.Blocks['item_food'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Food");
    this.setOutput(true, ["Item", "Condition", "String"]);
    this.setColour('#06B6D4');
    this.setTooltip("Food ration item.");
  }
};

Blockly.Blocks['item_oxygen'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Cargo");
    this.setOutput(true, ["Item", "Condition", "String"]);
    this.setColour('#06B6D4');
    this.setTooltip("Cargo item.");
  }
};

Blockly.Blocks['item_junk'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Trash");
    this.setOutput(true, ["Item", "Condition", "String"]);
    this.setColour('#06B6D4');
    this.setTooltip("Trash scrap item.");
  }
};

Blockly.Blocks['item_none'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("None");
    this.setOutput(true, ["Item", "Condition", "String"]);
    this.setColour('#F97316');
    this.setTooltip("No item.");
  }
};

Blockly.Blocks['if_scan_is'] = {
  init: function() {
    this.appendValueInput("ITEM")
        .setCheck(["Item", "Condition", "String"])
        .appendField("If item is");
    this.appendStatementInput("DO")
        .setCheck(null)
        .appendField("then");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#8B5CF6');
    this.setTooltip("Runs the blocks inside if the scanned item matches the selected type.");
  }
};

Blockly.Blocks['if_scan_else'] = {
  init: function() {
    this.appendValueInput("ITEM")
        .setCheck(["Item", "Condition", "String"])
        .appendField("If item is");
    this.appendStatementInput("DO")
        .setCheck(null)
        .appendField("then");
    this.appendStatementInput("ELSE")
        .setCheck(null)
        .appendField("Otherwise");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#8B5CF6');
    this.setTooltip("Runs the 'then' block if the item matches, otherwise runs the 'otherwise' block.");
  }
};

// ==========================================
// JAVASCRIPT GENERATORS (Under the Hood Execution)
// ==========================================

javascriptGenerator.forBlock['event_start'] = function(block) {
  return '// Start\n';
};

javascriptGenerator.forBlock['event_end'] = function(block) {
  return '// End\n';
};

javascriptGenerator.forBlock['on_start'] = function(block) {
  return javascriptGenerator.statementToCode(block, 'DO');
};

javascriptGenerator.forBlock['move_up'] = function() {
  return 'await moveUp();\n';
};

javascriptGenerator.forBlock['move_down'] = function() {
  return 'await moveDown();\n';
};

javascriptGenerator.forBlock['move_left'] = function() {
  return 'await moveLeft();\n';
};

javascriptGenerator.forBlock['move_right'] = function() {
  return 'await moveRight();\n';
};

javascriptGenerator.forBlock['move_forward'] = function() {
  return 'await moveForward();\n';
};

javascriptGenerator.forBlock['move_backward'] = function() {
  return 'await moveBackward();\n';
};

javascriptGenerator.forBlock['turn_direction'] = function(block) {
  const dir = javascriptGenerator.valueToCode(block, 'DIRECTION', 0) || "'left'";
  return `if (String(${dir}).toLowerCase() === 'right') {\n  await turnRight();\n} else {\n  await turnLeft();\n}\n`;
};

javascriptGenerator.forBlock['action_move'] = function(block) {
  const dir = block.getFieldValue('DIR') || 'FORWARD';
  if (dir === 'BACKWARD') return 'await moveBackward();\n';
  if (dir === 'UP') return 'await moveUp();\n';
  if (dir === 'DOWN') return 'await moveDown();\n';
  if (dir === 'LEFT') return 'await moveLeft();\n';
  if (dir === 'RIGHT') return 'await moveRight();\n';
  return 'await moveForward();\n';
};

javascriptGenerator.forBlock['action_turn'] = function(block) {
  const dir = block.getFieldValue('DIR') || 'LEFT';
  return dir === 'RIGHT' ? 'await turnRight();\n' : 'await turnLeft();\n';
};

javascriptGenerator.forBlock['turn_left'] = function() {
  return 'await turnLeft();\n';
};

javascriptGenerator.forBlock['turn_right'] = function() {
  return 'await turnRight();\n';
};


javascriptGenerator.forBlock['math_number'] = function(block) {
  const code = Number(block.getFieldValue('NUM')) || 1;
  return [String(code), 0];
};

javascriptGenerator.forBlock['keyword_left'] = function() {
  return ["'left'", 0];
};

javascriptGenerator.forBlock['keyword_right'] = function() {
  return ["'right'", 0];
};

javascriptGenerator.forBlock['keyword_clear'] = function() {
  return ['isPathAhead()', 0];
};

javascriptGenerator.forBlock['keyword_blocked'] = function() {
  return ['!isPathAhead()', 0];
};

javascriptGenerator.forBlock['keyword_goal'] = function() {
  return ['isAtGoal()', 0];
};

javascriptGenerator.forBlock['logic_and'] = function(block) {
  const a = javascriptGenerator.valueToCode(block, 'A', 0) || 'true';
  const b = javascriptGenerator.valueToCode(block, 'B', 0) || 'true';
  // Silent paradox resolution: if Clear AND Blocked, resolve to false
  if ((a.includes('isPathAhead()') && b.includes('!isPathAhead()')) || (b.includes('isPathAhead()') && a.includes('!isPathAhead()'))) {
    return ['false', 0];
  }
  return [`(${a} && ${b})`, 0];
};

javascriptGenerator.forBlock['logic_or'] = function(block) {
  const a = javascriptGenerator.valueToCode(block, 'A', 0) || 'false';
  const b = javascriptGenerator.valueToCode(block, 'B', 0) || 'false';
  return [`(${a} || ${b})`, 0];
};

javascriptGenerator.forBlock['logic_not'] = function(block) {
  const bool = javascriptGenerator.valueToCode(block, 'BOOL', 0) || 'false';
  return [`!(${bool})`, 0];
};

javascriptGenerator.forBlock['is_hazard_ahead'] = function() {
  return ['isHazardAhead()', 0];
};

javascriptGenerator.forBlock['is_path_clear_forward'] = function() {
  return ['isPathClearForward()', 0];
};

javascriptGenerator.forBlock['is_path_blocked_forward'] = function() {
  return ['isPathBlockedForward()', 0];
};

javascriptGenerator.forBlock['is_path_clear_right'] = function() {
  return ['isPathClearRight()', 0];
};

javascriptGenerator.forBlock['is_path_clear_left'] = function() {
  return ['isPathClearLeft()', 0];
};

javascriptGenerator.forBlock['sensor_hazard_detected'] = function(block) {
  const dir = block.getFieldValue('DIR') || 'AHEAD';
  if (dir === 'LEFT') return ['isHazardLeft()', 0];
  if (dir === 'RIGHT') return ['isHazardRight()', 0];
  return ['isHazardAhead()', 0];
};

javascriptGenerator.forBlock['sensor_path_clear'] = function(block) {
  const dir = block.getFieldValue('DIR') || 'AHEAD';
  if (dir === 'LEFT') return ['isPathClearLeft()', 0];
  if (dir === 'RIGHT') return ['isPathClearRight()', 0];
  return ['isPathClearForward()', 0];
};

javascriptGenerator.forBlock['sensor_at_dead_end'] = function() {
  return ['isAtDeadEnd()', 0];
};



javascriptGenerator.forBlock['scan_next_node'] = function() {
  return 'await scanNextNode();\n';
};

javascriptGenerator.forBlock['scan_node_color'] = function() {
  return ['scanNodeColor()', 0];
};

javascriptGenerator.forBlock['scan_node_state'] = function() {
  return ['scanNodeState()', 0];
};

javascriptGenerator.forBlock['extract_power'] = function() {
  return 'await extractPower();\n';
};

javascriptGenerator.forBlock['repeat_until_charged'] = function(block) {
  const branch = javascriptGenerator.statementToCode(block, 'DO');
  return `while (!isEngineCharged()) {\n${branch}  await new Promise(r => setTimeout(r, 100));\n}\n`;
};

javascriptGenerator.forBlock['queue_override'] = function() {
  return 'await queueOverride();\n';
};

javascriptGenerator.forBlock['lock_selection'] = function() {
  return 'await lockSelection();\n';
};

// --- STARSHIP PROTOCOL GENERATORS ---
javascriptGenerator.forBlock['sensor_asteroid'] = function() {
  return ['isAsteroidAhead()', 0];
};

javascriptGenerator.forBlock['sensor_fuel_low'] = function() {
  return ['isFuelLow()', 0];
};

javascriptGenerator.forBlock['sensor_oxygen_low'] = function() {
  return ['isOxygenLow()', 0];
};

javascriptGenerator.forBlock['action_shield'] = function() {
  return 'await raiseShields();\n';
};

javascriptGenerator.forBlock['action_refuel'] = function() {
  return 'await refuelEngine();\n';
};

javascriptGenerator.forBlock['action_pump_oxygen'] = function() {
  return 'await pumpOxygen();\n';
};

javascriptGenerator.forBlock['allocate_oxygen'] = function(block) {
  const p = block.getFieldValue('POWER') || 30;
  return `await allocateOxygen(${p});\n`;
};

javascriptGenerator.forBlock['allocate_shields'] = function(block) {
  const p = block.getFieldValue('POWER') || 30;
  return `await allocateShields(${p});\n`;
};

javascriptGenerator.forBlock['allocate_thrusters'] = function(block) {
  const p = block.getFieldValue('POWER') || 40;
  return `await allocateThrusters(${p});\n`;
};

javascriptGenerator.forBlock['func_boost_systems'] = function() {
  return 'await funcBoostSystems();\n';
};

javascriptGenerator.forBlock['func_evasive_shields'] = function() {
  return 'await funcEvasiveShields();\n';
};

javascriptGenerator.forBlock['func_warp_jump'] = function() {
  return 'await funcWarpJump();\n';
};

// --- LAUNCH SEQUENCE GENERATORS (LEGACY) ---
javascriptGenerator.forBlock['unlock_door'] = function() {
  return 'await unlockDoor();\n';
};

javascriptGenerator.forBlock['open_valve'] = function() {
  return 'await openValve();\n';
};

javascriptGenerator.forBlock['close_doors'] = function() {
  return 'await unlockDoor();\n';
};

javascriptGenerator.forBlock['pump_air'] = function() {
  return 'await pumpAir();\n';
};

javascriptGenerator.forBlock['charge_cell'] = function() {
  return 'await chargeCell();\n';
};

javascriptGenerator.forBlock['charge_battery'] = function() {
  return 'await chargeCell();\n';
};

javascriptGenerator.forBlock['check_fuel_type'] = function(block) {
  const type = block.getFieldValue('TYPE') || 'blue_cryo';
  return [`checkFuelType() === '${type}'`, 0];
};

javascriptGenerator.forBlock['add_cryo'] = function() {
  return 'await addCryo();\n';
};

javascriptGenerator.forBlock['add_catalyst'] = function() {
  return 'await addCatalyst();\n';
};

javascriptGenerator.forBlock['mix_blue_fuel'] = function() {
  return 'await addCryo();\n';
};

javascriptGenerator.forBlock['mix_green_fuel'] = function() {
  return 'await addCatalyst();\n';
};

javascriptGenerator.forBlock['set_ship_power'] = function(block) {
  const power = block.getFieldValue('POWER') || 0;
  return `setShipPower(${power});\n`;
};

javascriptGenerator.forBlock['func_oxygen'] = function() {
  return 'await runOxygenSystem();\n';
};

javascriptGenerator.forBlock['func_shields'] = function() {
  return 'await runShieldSystem();\n';
};

javascriptGenerator.forBlock['func_thrusters'] = function() {
  return 'await runThrustersSystem();\n';
};

// Flight Simulation Triggers & Actions
javascriptGenerator.forBlock['trigger_fuel_low'] = function() {
  return ['isFuelLow()', javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['trigger_small_asteroid'] = function() {
  return ['isSmallAsteroid()', javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['trigger_oxygen_low'] = function() {
  return ['isOxygenLow()', javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['trigger_big_asteroid'] = function() {
  return ['isBigAsteroid()', javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['action_launch_rocket'] = function() {
  return 'await Launch_Rocket();\n';
};

javascriptGenerator.forBlock['action_refill_fuel_cells'] = function() {
  return 'await Refill_Fuel_Cells();\n';
};

javascriptGenerator.forBlock['action_fire_lasers'] = function() {
  return 'await Fire_Lasers();\n';
};

javascriptGenerator.forBlock['action_pump_oxygen'] = function() {
  return 'await Pump_Oxygen();\n';
};

javascriptGenerator.forBlock['action_activate_shield'] = function() {
  return 'await Activate_Shield();\n';
};

javascriptGenerator.forBlock['action_stop_rocket'] = function() {
  return 'await Stop_Rocket();\n';
};

javascriptGenerator.forBlock['action_greet_ufo'] = function() {
  return 'await Greet_UFO();\n';
};

javascriptGenerator.forBlock['action_fire_tractor_beam'] = function() {
  return 'await Greet_UFO();\n';
};

// Case JS Generator
javascriptGenerator.forBlock['case_emergency'] = function(block) {
  const emergencyType = block.getFieldValue('EMERGENCY') || 'FUEL_LOW';
  const branch = javascriptGenerator.statementToCode(block, 'DO') || '';
  return `if (getCurrentEmergency() === '${emergencyType}') {\n${branch}}\n`;
};

// Fuel Synthesis JS Generators
javascriptGenerator.forBlock['color_is'] = function(block) {
  const color = javascriptGenerator.valueToCode(block, 'COLOR', javascriptGenerator.ORDER_ATOMIC) || "'Orange'";
  return [`isColor(${color})`, javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['color_orange'] = function() {
  return ["'Orange'", javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['color_blue'] = function() {
  return ["'Blue'", javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['color_green'] = function() {
  return ["'Green'", javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['color_purple'] = function() {
  return ["'Purple'", javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['color_is_orange'] = function() {
  return ["isColor('Orange')", javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['color_is_blue'] = function() {
  return ["isColor('Blue')", javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['color_is_green'] = function() {
  return ["isColor('Green')", javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['color_is_purple'] = function() {
  return ["isColor('Purple')", javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['color_is_not_orange'] = function() {
  return ["isNotColor('Orange')", javascriptGenerator.ORDER_ATOMIC];
};

javascriptGenerator.forBlock['while_color_not_orange'] = function(block) {
  const branch = javascriptGenerator.statementToCode(block, 'DO');
  return `while (typeof isNotColor === 'function' ? isNotColor('Orange') : !isAtGoal()) {\n${branch}  await (typeof checkStatus === 'function' ? checkStatus() : typeof checkGameStatus === 'function' ? checkGameStatus() : new Promise(r => setTimeout(r, 20)));\n}\n`;
};

javascriptGenerator.forBlock['action_increase_heat'] = function() {
  return 'await Increase_Heat();\n';
};

javascriptGenerator.forBlock['action_add_solution'] = function() {
  return 'await Add_Solution();\n';
};

javascriptGenerator.forBlock['action_mix'] = function() {
  return 'await Mix();\n';
};

javascriptGenerator.forBlock['action_put_fuel_tank'] = function() {
  return 'await (typeof Fuel_Spaceship === "function" ? Fuel_Spaceship() : Put_Into_Fuel_Tank());\n';
};

javascriptGenerator.forBlock['controls_if'] = function(block) {
  const condition = javascriptGenerator.valueToCode(block, 'IF0', 0) || 'false';
  const branch = javascriptGenerator.statementToCode(block, 'DO0');
  return `if (${condition}) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['controls_ifelse'] = function(block) {
  const condition = javascriptGenerator.valueToCode(block, 'IF0', 0) || 'false';
  const branch = javascriptGenerator.statementToCode(block, 'DO0');
  const elseBranch = javascriptGenerator.statementToCode(block, 'ELSE');
  return `if (${condition}) {\n${branch}} else {\n${elseBranch}}\n`;
};

javascriptGenerator.forBlock['if_path_is'] = function(block) {
  const condition = javascriptGenerator.valueToCode(block, 'CONDITION', 0) || 'isPathAhead()';
  const branch = javascriptGenerator.statementToCode(block, 'DO');
  return `if (${condition}) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['if_path_blocked'] = function(block) {
  const branch = javascriptGenerator.statementToCode(block, 'DO');
  return `if (!isPathAhead()) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['if_path_ahead'] = function(block) {
  const branch = javascriptGenerator.statementToCode(block, 'DO');
  return `if (isPathAhead()) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['if_path_left'] = function(block) {
  const branch = javascriptGenerator.statementToCode(block, 'DO');
  return `if (isPathLeft()) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['if_path_right'] = function(block) {
  const branch = javascriptGenerator.statementToCode(block, 'DO');
  return `if (isPathRight()) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['repeat_simple'] = function(block) {
  const branch = javascriptGenerator.statementToCode(block, 'DO');
  return `while (typeof isNotColor === 'function' ? isNotColor('Orange') : !isAtGoal()) {\n${branch}  await (typeof checkStatus === 'function' ? checkStatus() : typeof checkGameStatus === 'function' ? checkGameStatus() : new Promise(r => setTimeout(r, 20)));\n}\n`;
};

javascriptGenerator.forBlock['repeat_until_goal'] = function(block) {
  const branch = javascriptGenerator.statementToCode(block, 'DO');
  return `while (!isAtGoal()) {\n${branch}  await checkGameStatus();\n}\n`;
};

javascriptGenerator.forBlock['repeat_x_times'] = function(block) {
  const repeats = javascriptGenerator.valueToCode(block, 'TIMES', 0) || '1';
  const branch = javascriptGenerator.statementToCode(block, 'DO');
  return `for (let i = 0; i < Math.max(1, Math.min(100, Math.floor(Number(${repeats}) || 1))); i++) {\n${branch}  await (typeof checkStatus === 'function' ? checkStatus() : typeof checkGameStatus === 'function' ? checkGameStatus() : new Promise(r => setTimeout(r, 20)));\n}\n`;
};

javascriptGenerator.forBlock['event_on_item_scanned'] = function(block) {
  const branch = javascriptGenerator.statementToCode(block, 'DO');
  return `// On Item Scanned\n${branch}`;
};

javascriptGenerator.forBlock['condition_item_is'] = function(block) {
  const type = block.getFieldValue('TYPE') || 'fuel';
  return [`scannedItem.type === '${type}'`, 0];
};

javascriptGenerator.forBlock['send_to_area'] = function(block) {
  const dest = block.getFieldValue('DESTINATION') || 'CARGO_BAY';
  if (dest === 'TRASH') return "await discardTrash();\n";
  if (dest === 'ROCKET_SHIP' || dest === 'FUEL') return "await routeFuel();\n";
  if (dest === 'CAFETERIA' || dest === 'FOOD') return "await routeFood();\n";
  return "await packCargo();\n";
};

javascriptGenerator.forBlock['action_pack_cargo'] = function() {
  return "await packCargo();\n";
};

javascriptGenerator.forBlock['action_discard_trash'] = function() {
  return "await discardTrash();\n";
};

javascriptGenerator.forBlock['action_route_fuel'] = function() {
  return "await routeFuel();\n";
};

javascriptGenerator.forBlock['action_route_food'] = function() {
  return "await routeFood();\n";
};

javascriptGenerator.forBlock['action_pack_item'] = function() {
  return "await packCargo();\n";
};

javascriptGenerator.forBlock['action_discard_item'] = function() {
  return "await discardTrash();\n";
};

javascriptGenerator.forBlock['scan_current_item'] = function() {
  return "await scanCurrentItem();\n";
};

javascriptGenerator.forBlock['scan_item'] = function() {
  return "await scanCurrentItem();\n";
};

javascriptGenerator.forBlock['pickup_item'] = function() {
  return "await packCargo();\n";
};

javascriptGenerator.forBlock['trash_item'] = function() {
  return "await discardTrash();\n";
};

javascriptGenerator.forBlock['item_cargo'] = function() {
  return ["'cargo'", 0];
};

javascriptGenerator.forBlock['item_trash'] = function() {
  return ["'trash'", 0];
};

javascriptGenerator.forBlock['item_fuel'] = function() {
  return ["'fuel'", 0];
};

javascriptGenerator.forBlock['item_food'] = function() {
  return ["'food'", 0];
};

javascriptGenerator.forBlock['item_oxygen'] = function() {
  return ["'cargo'", 0];
};

javascriptGenerator.forBlock['item_junk'] = function() {
  return ["'trash'", 0];
};

javascriptGenerator.forBlock['item_none'] = function() {
  return ["'none'", 0];
};

javascriptGenerator.forBlock['if_scan_is'] = function(block) {
  const item = javascriptGenerator.valueToCode(block, 'ITEM', 0) || "'cargo'";
  const branch = javascriptGenerator.statementToCode(block, 'DO');
  return `if ((await getCurrentItemType()) === ${item}) {\n${branch}}\n`;
};

javascriptGenerator.forBlock['if_scan_else'] = function(block) {
  const item = javascriptGenerator.valueToCode(block, 'ITEM', 0) || "'cargo'";
  const branchDo = javascriptGenerator.statementToCode(block, 'DO');
  const branchElse = javascriptGenerator.statementToCode(block, 'ELSE');
  return `if ((await getCurrentItemType()) === ${item}) {\n${branchDo}} else {\n${branchElse}}\n`;
};

// ==========================================
// PLAIN-ENGLISH PSEUDOCODE GENERATOR
// Zero parentheses, brackets, or underscores.
// Prefixes actions with "Action: ".
// Strictly enforces 2-space indentation.
// ==========================================

export function generatePlainEnglishPseudocode(workspace) {
  if (!workspace) return '';
  const topBlocks = workspace.getTopBlocks(true);
  if (!topBlocks || topBlocks.length === 0) return '';

  function indentText(text, spaces = 2) {
    if (!text) return '';
    const prefix = ' '.repeat(spaces);
    return text
      .split('\n')
      .map(line => line.trim() ? prefix + line : line)
      .join('\n');
  }

  function getKeywordText(block, inputName, defaultText = 'Goal') {
    const targetBlock = block.getInputTargetBlock(inputName);
    if (!targetBlock) return defaultText;
    if (targetBlock.type === 'keyword_left') return 'Left';
    if (targetBlock.type === 'keyword_right') return 'Right';
    if (targetBlock.type === 'keyword_goal') return 'Goal';
    if (targetBlock.type === 'keyword_clear') return 'Clear';
    if (targetBlock.type === 'keyword_blocked') return 'Blocked';
    if (targetBlock.type === 'item_cargo') return 'Cargo';
    if (targetBlock.type === 'item_trash') return 'Trash';
    if (targetBlock.type === 'item_fuel') return 'Fuel';
    if (targetBlock.type === 'item_food') return 'Food';
    if (targetBlock.type === 'item_oxygen') return 'Cargo';
    if (targetBlock.type === 'item_junk') return 'Trash';
    if (targetBlock.type === 'item_none') return 'None';
    if (targetBlock.type === 'logic_and') {
      const a = getKeywordText(targetBlock, 'A', 'Clear');
      const b = getKeywordText(targetBlock, 'B', 'Clear');
      return `${a} and ${b}`;
    }
    if (targetBlock.type === 'logic_or') {
      const a = getKeywordText(targetBlock, 'A', 'Clear');
      const b = getKeywordText(targetBlock, 'B', 'Clear');
      return `${a} or ${b}`;
    }
    return defaultText;
  }

  function getNumberText(block, inputName, defaultNum = '1') {
    const targetBlock = block.getInputTargetBlock(inputName);
    if (!targetBlock) return defaultNum;
    if (targetBlock.type === 'math_number') {
      return String(targetBlock.getFieldValue('NUM') || defaultNum);
    }
    return defaultNum;
  }

  function blockToEnglish(block) {
    if (!block) return '';
    let code = '';

    switch (block.type) {
      case 'event_start':
        code = 'Start of program.\n';
        break;

      case 'event_end':
        code = 'End of program.\n';
        break;

      case 'on_start': {
        const doBlock = block.getInputTargetBlock('DO');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `When Run:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      case 'move_up':
        code = 'Action: Move Up.\n';
        break;

      case 'move_down':
        code = 'Action: Move Down.\n';
        break;

      case 'move_left':
        code = 'Action: Move Left.\n';
        break;

      case 'move_right':
        code = 'Action: Move Right.\n';
        break;

      case 'move_forward':
        code = 'Action: Move Forward.\n';
        break;

      case 'move_backward':
        code = 'Action: Move Backward.\n';
        break;

      case 'action_move': {
        const d = block.getFieldValue('DIR') || 'FORWARD';
        const map = {
          FORWARD: 'Forward',
          BACKWARD: 'Backward',
          UP: 'Up',
          DOWN: 'Down',
          LEFT: 'Left',
          RIGHT: 'Right'
        };
        code = `Action: Move ${map[d] || 'Forward'}.\n`;
        break;
      }

      case 'action_turn': {
        const d = block.getFieldValue('DIR') || 'LEFT';
        const label = d === 'RIGHT' ? 'Right' : 'Left';
        code = `Action: Turn ${label}.\n`;
        break;
      }

      case 'turn_direction': {
        const dir = getKeywordText(block, 'DIRECTION', 'Left');
        code = `Action: Turn ${dir}.\n`;
        break;
      }

      case 'turn_left':
        code = 'Action: Turn Left (90°).\n';
        break;

      case 'turn_right':
        code = 'Action: Turn Right (90°).\n';
        break;

      case 'repeat_simple': {
        const doBlock = block.getInputTargetBlock('DO');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `Repeat Until Goal:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      case 'repeat_until_goal': {
        const doBlock = block.getInputTargetBlock('DO');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `Repeat until goal:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      case 'repeat_x_times': {
        const count = getNumberText(block, 'TIMES', '1');
        const doBlock = block.getInputTargetBlock('DO');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `Repeat ${count} times:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      case 'controls_if': {
        const condBlock = block.getInputTargetBlock('IF0');
        const cond = condBlock ? blockToEnglish(condBlock).trim() : 'Condition';
        const doBlock = block.getInputTargetBlock('DO0');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `If ${cond}, then:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      case 'controls_ifelse': {
        const condBlock = block.getInputTargetBlock('IF0');
        const cond = condBlock ? blockToEnglish(condBlock).trim() : 'Condition';
        const doBlock = block.getInputTargetBlock('DO0');
        const elseBlock = block.getInputTargetBlock('ELSE');
        const branchDo = doBlock ? blockToEnglish(doBlock) : '';
        const branchElse = elseBlock ? blockToEnglish(elseBlock) : '';
        const indentedDo = indentText(branchDo.trimEnd(), 2);
        const indentedElse = indentText(branchElse.trimEnd(), 2);
        code = `If ${cond}, then:\n${indentedDo ? indentedDo + '\n' : ''}Else:\n${indentedElse ? indentedElse + '\n' : ''}`;
        break;
      }

      case 'case_emergency': {
        const val = block.getFieldValue('EMERGENCY') || 'FUEL_LOW';
        const labels = {
          FUEL_LOW: 'Fuel < 20%',
          OXYGEN_LOW: 'Oxygen < 20%',
          SMALL_ASTEROID: 'Small Asteroid',
          BIG_ASTEROID: 'Big Asteroid',
          SUPPLY_POD: 'Supply Pod'
        };
        const doBlock = block.getInputTargetBlock('DO');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `Case ${labels[val] || val}:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      case 'action_fire_tractor_beam': {
        code = 'Fire Tractor Beam';
        break;
      }

      case 'if_path_is': {
        const cond = getKeywordText(block, 'CONDITION', 'Clear');
        const doBlock = block.getInputTargetBlock('DO');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `If the path is ${cond}, then:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      case 'is_hazard_ahead':
        code = 'Hazard Ahead';
        break;

      case 'is_path_clear_forward':
        code = 'Path Clear Ahead';
        break;

      case 'is_path_blocked_forward':
        code = 'Path Blocked Ahead';
        break;

      case 'is_path_clear_right':
        code = 'Path Clear Right';
        break;

      case 'is_path_clear_left':
        code = 'Path Clear Left';
        break;

      case 'sensor_hazard_detected': {
        const d = block.getFieldValue('DIR') || 'AHEAD';
        const label = d === 'LEFT' ? 'Left' : d === 'RIGHT' ? 'Right' : 'Ahead';
        code = `Hazard Detected [${label}]`;
        break;
      }

      case 'sensor_path_clear': {
        const d = block.getFieldValue('DIR') || 'AHEAD';
        const label = d === 'LEFT' ? 'Left' : d === 'RIGHT' ? 'Right' : 'Ahead';
        code = `Path is Clear [${label}]`;
        break;
      }

      case 'sensor_at_dead_end':
        code = 'At Dead End';
        break;



      case 'if_path_blocked': {
        const doBlock = block.getInputTargetBlock('DO');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `If the path is Blocked, then:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      case 'if_path_ahead': {
        const doBlock = block.getInputTargetBlock('DO');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `If the path is Clear, then:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      case 'if_path_left': {
        const doBlock = block.getInputTargetBlock('DO');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `If the path to the left is Clear, then:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      case 'if_path_right': {
        const doBlock = block.getInputTargetBlock('DO');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `If the path to the right is Clear, then:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      case 'send_to_area': {
        const dest = block.getFieldValue('DESTINATION') || 'CARGO_BAY';
        const labelMap = { 
          CARGO_BAY: 'Cargo Bay', 
          CARGO: 'Cargo Bay', 
          ROCKET_SHIP: 'Rocket Ship', 
          FUEL: 'Rocket Ship', 
          TRASH: 'Trash', 
          CAFETERIA: 'Cafeteria', 
          FOOD: 'Cafeteria' 
        };
        code = `Action: Send item to ${labelMap[dest] || 'Cargo Bay'}.\n`;
        break;
      }

      case 'action_pack_cargo':
        code = 'Action: Pack item into Cargo Bay.\n';
        break;

      case 'action_discard_trash':
        code = 'Action: Discard item into Scrap Chute.\n';
        break;

      case 'action_route_fuel':
        code = 'Action: Route item to Fuel Bay.\n';
        break;

      case 'action_route_food':
        code = 'Action: Route item to Food Storage.\n';
        break;

      case 'action_pack_item':
        code = 'Action: Pack item into Cargo Bay.\n';
        break;

      case 'action_discard_item':
        code = 'Action: Discard item into Scrap Chute.\n';
        break;

      case 'scan_current_item':
        code = 'Action: Scan current item.\n';
        break;

      case 'pickup_item':
        code = 'Action: Pack item into Cargo Bay.\n';
        break;

      case 'trash_item':
        code = 'Action: Discard item into Scrap Chute.\n';
        break;

      case 'if_scan_is': {
        const item = getKeywordText(block, 'ITEM', 'Cargo');
        const doBlock = block.getInputTargetBlock('DO');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `If the current item is ${item}, then:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      case 'if_scan_else': {
        const item = getKeywordText(block, 'ITEM', 'Cargo');
        const doBlock = block.getInputTargetBlock('DO');
        const elseBlock = block.getInputTargetBlock('ELSE');
        const branchDo = doBlock ? blockToEnglish(doBlock) : '';
        const branchElse = elseBlock ? blockToEnglish(elseBlock) : '';
        const indentedDo = indentText(branchDo.trimEnd(), 2);
        const indentedElse = indentText(branchElse.trimEnd(), 2);
        code = `If the current item is ${item}, then:\n${indentedDo ? indentedDo + '\n' : ''}Otherwise:\n${indentedElse ? indentedElse + '\n' : ''}`;
        break;
      }

      case 'scan_next_node':
        code = 'Action: Scan Next Node.\n';
        break;

      case 'extract_power':
        code = 'Action: Extract Power.\n';
        break;

      case 'queue_override':
        code = 'Action: Queue Override Protocol.\n';
        break;

      case 'lock_selection':
        code = 'Action: Lock In Selection.\n';
        break;

      case 'repeat_until_charged': {
        const doBlock = block.getInputTargetBlock('DO');
        const branchCode = doBlock ? blockToEnglish(doBlock) : '';
        const indented = indentText(branchCode.trimEnd(), 2);
        code = `Repeat until engine charged:\n${indented ? indented + '\n' : ''}`;
        break;
      }

      // Level 3 Starship Protocol Plain English Cases
      case 'sensor_asteroid':
        code = 'Sensor: Asteroid Ahead?';
        break;

      case 'sensor_fuel_low':
        code = 'Sensor: Fuel Low?';
        break;

      case 'sensor_oxygen_low':
        code = 'Sensor: Oxygen Low?';
        break;

      case 'action_shield':
        code = 'Action: Raise Defensive Shields.\n';
        break;

      case 'action_refuel':
        code = 'Action: Refuel Propulsion Engine.\n';
        break;

      case 'action_pump_oxygen':
        code = 'Action: Pump Cabin Oxygen.\n';
        break;

      case 'allocate_oxygen': {
        const p = block.getFieldValue('POWER') || '30';
        code = `Action: Allocate ${p} Power to Oxygen Life Support.\n`;
        break;
      }

      case 'allocate_shields': {
        const p = block.getFieldValue('POWER') || '30';
        code = `Action: Allocate ${p} Power to Defense Shields.\n`;
        break;
      }

      case 'allocate_thrusters': {
        const p = block.getFieldValue('POWER') || '40';
        code = `Action: Allocate ${p} Power to Main Thrusters.\n`;
        break;
      }

      case 'func_boost_systems':
        code = 'Call Function: Boost Systems().\n';
        break;

      case 'func_evasive_shields':
        code = 'Call Function: Evasive Shields().\n';
        break;

      case 'func_warp_jump':
        code = 'Call Function: Engage Warp Jump().\n';
        break;

      // Flight Simulation Triggers & Actions
      case 'trigger_fuel_low':
        code = 'Fuel < 20%';
        break;

      case 'trigger_small_asteroid':
        code = 'Small Asteroid Detected';
        break;

      case 'trigger_oxygen_low':
        code = 'Oxygen < 20%';
        break;

      case 'trigger_big_asteroid':
        code = 'Big Asteroid Detected';
        break;

      case 'action_launch_rocket':
        code = 'Action: Launch Rocket.\n';
        break;

      case 'action_refill_fuel_cells':
        code = 'Action: Refill Fuel.\n';
        break;

      case 'action_fire_lasers':
        code = 'Action: Fire Lasers.\n';
        break;

      case 'action_pump_oxygen':
        code = 'Action: Pump Oxygen.\n';
        break;

      case 'action_activate_shield':
        code = 'Action: Activate Shield.\n';
        break;

      case 'action_stop_rocket':
        code = 'Action: Stop Rocket.\n';
        break;

      case 'action_greet_ufo':
      case 'action_fire_tractor_beam':
        code = 'Action: Greet UFO.\n';
        break;

      // Fuel Synthesis Cases
      case 'color_is_orange':
        code = 'Color is Orange';
        break;

      case 'color_is_blue':
        code = 'Color is Blue';
        break;

      case 'color_is_green':
        code = 'Color is Green';
        break;

      case 'color_is_purple':
        code = 'Color is Purple';
        break;

      case 'color_is_not_orange':
        code = 'Color != Orange';
        break;

      case 'while_color_not_orange': {
        const body = block.getInputTargetBlock('DO') ? blockToEnglish(block.getInputTargetBlock('DO')) : '';
        code = `Repeat:\n${body.split('\n').map(l => l ? '  ' + l : '').join('\n')}\n`;
        break;
      }

      case 'action_increase_heat':
        code = 'Action: Increase_Heat().\n';
        break;

      case 'action_add_solution':
        code = 'Action: Add_Solution().\n';
        break;

      case 'action_mix':
        code = 'Action: Mix().\n';
        break;

      case 'action_put_fuel_tank':
        code = 'Action: Fuel Spaceship.\n';
        break;

      // Level 3 Launch Sequence Plain English Cases (Legacy)
      case 'unlock_door':
      case 'close_doors':
        code = 'Action: Unlock Airlock Safety Door.\n';
        break;

      case 'open_valve':
        code = 'Action: Open Oxygen Equalization Valve.\n';
        break;

      case 'pump_air':
        code = 'Action: Pump Oxygen into Life Support.\n';
        break;

      case 'charge_cell':
      case 'charge_battery':
        code = 'Action: Charge Shield Cell (+1 Cell).\n';
        break;

      case 'add_cryo':
      case 'mix_blue_fuel':
        code = 'Action: Add Blue Cryo Fuel to Reactor.\n';
        break;

      case 'add_catalyst':
      case 'mix_green_fuel':
        code = 'Action: Add Green Catalyst to Reactor.\n';
        break;

      case 'set_ship_power': {
        const p = block.getFieldValue('POWER') || '0';
        code = `Set Variable [Ship_Power] = ${p}%.\n`;
        break;
      }

      case 'func_oxygen':
        code = 'Call Function: Turn On Oxygen (Room 1 System).\n';
        break;

      case 'func_shields':
        code = 'Call Function: Turn On Shields (Room 2 System).\n';
        break;

      case 'func_thrusters':
        code = 'Call Function: Turn On Thrusters (Room 3 System).\n';
        break;

      default:
        break;
    }

    // Process next chained block
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
      code += blockToEnglish(nextBlock);
    }

    return code;
  }

  let fullPseudocode = '';
  topBlocks.forEach(tb => {
    const txt = blockToEnglish(tb);
    if (txt) fullPseudocode += txt;
  });

  return fullPseudocode.trimEnd();
}

// Register custom Blockly.Generator('PSEUDOCODE')
if (Blockly && Blockly.Generator) {
  try {
    const pseudocodeGenerator = new Blockly.Generator('PSEUDOCODE');
    pseudocodeGenerator.workspaceToCode = function(ws) {
      return generatePlainEnglishPseudocode(ws);
    };
    Blockly.pseudocodeGenerator = pseudocodeGenerator;
    Blockly.Pseudocode = pseudocodeGenerator;
  } catch (e) {
    // Gracefully handle existing instance
  }
}

