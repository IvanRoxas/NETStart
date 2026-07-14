import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';

// Define the custom blocks
Blockly.Blocks['move_forward'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Move Forward");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("Moves the character forward one space.");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['turn_left'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Turn Left");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Turns the character left.");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['turn_right'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Turn Right");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Turns the character right.");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['repeat_until_goal'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Repeat Until Goal");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("Repeat the enclosed blocks until the goal is reached.");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['if_path_ahead'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("If Path Ahead");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Do something only if there is a clear path ahead.");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['repeat_x_times'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Repeat")
        .appendField(new Blockly.FieldNumber(3, 1, 100, 1), "TIMES")
        .appendField("times");
    this.appendStatementInput("DO")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip("Repeat the enclosed blocks a specific number of times.");
    this.setHelpUrl("");
  }
};

// Define the JavaScript generators for the custom blocks
javascriptGenerator.forBlock['move_forward'] = function(block) {
  return 'await moveForward();\n';
};

javascriptGenerator.forBlock['turn_left'] = function(block) {
  return 'await turnLeft();\n';
};

javascriptGenerator.forBlock['turn_right'] = function(block) {
  return 'await turnRight();\n';
};

javascriptGenerator.forBlock['repeat_until_goal'] = function(block) {
  var branch = javascriptGenerator.statementToCode(block, 'DO');
  return 'while (!isAtGoal()) {\n' + branch + '\n  await checkGameStatus();\n}\n';
};

javascriptGenerator.forBlock['repeat_x_times'] = function(block) {
  var repeats = Number(block.getFieldValue('TIMES'));
  var branch = javascriptGenerator.statementToCode(block, 'DO');
  return 'for (let i = 0; i < ' + repeats + '; i++) {\n' + branch + '\n  await checkGameStatus();\n}\n';
};

javascriptGenerator.forBlock['if_path_ahead'] = function(block) {
  var branch = javascriptGenerator.statementToCode(block, 'DO');
  return 'if (isPathAhead()) {\n' + branch + '\n}\n';
};
