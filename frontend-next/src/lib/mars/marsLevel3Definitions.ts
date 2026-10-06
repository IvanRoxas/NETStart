import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export interface MarsLevel3Validation {
  hasForm: boolean;
  hasDropdown: boolean;
  hasMercuryOption: boolean;
  hasVenusOption: boolean;
  hasInput: boolean;
  hasButton: boolean;
  hasTitle: boolean;
  formTitle: string;
  options: ('mercury' | 'venus')[];
  inputCount: number;
  buttonCount: number;
  canDeploy: boolean;
  isAssemblyValid: boolean;
  failErrorCode: string | null;
  failErrorMessage: string | null;
  deployErrorMessage?: string | null;
  completedObjectives: [boolean, boolean, boolean];
}

export interface MarsLevel3WorkspaceState {
  hasForm: boolean;
  hasDropdown: boolean;
  hasMercuryOption: boolean;
  hasVenusOption: boolean;
  hasInput: boolean;
  hasButton: boolean;
  hasTitle: boolean;
  formTitle: string;
  options: ('mercury' | 'venus')[];
  inputCount: number;
  buttonCount: number;
  floatingBlocks: string[];
  hasErrors: boolean;
}

export function registerMarsLevel3Blocks() {
  if (typeof window === 'undefined') return;

  // 1. [ Form Container ]: Parent Block with Title on second line
  Blockly.Blocks['mars_form_container'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Form Container');
      this.appendDummyInput()
        .appendField('Title:')
        .appendField(
          new Blockly.FieldTextInput(''),
          'TITLE'
        );
      this.appendStatementInput('CONTENT')
        .setCheck('MarsFormControl');
      this.appendDummyInput()
        .appendField('End Form');
      this.setColour('#8B5CF6'); // Purple
      this.setTooltip('A form box to hold your space message and buttons.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['mars_form_container'] = function (block: any) {
    const rawTitle = block.getFieldValue('TITLE');
    const title = (rawTitle !== null && rawTitle !== undefined) ? rawTitle.trim() : '';
    const titleLine = title ? `  <h2>${title}</h2>\n` : '';
    const children = (javascriptGenerator as any).statementToCode(block, 'CONTENT') || '';
    return `<form>\n${titleLine}${children}</form>\n`;
  };

  // 2. [ Dropdown Menu ]: Generic Parent Dropdown (<select>)
  Blockly.Blocks['mars_dropdown'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Dropdown Menu');
      this.appendStatementInput('OPTIONS')
        .setCheck('MarsOption');
      this.appendDummyInput()
        .appendField('End Dropdown');
      this.setPreviousStatement(true, 'MarsFormControl');
      this.setNextStatement(true, 'MarsFormControl');
      this.setColour('#F59E0B'); // Warm Amber
      this.setTooltip('A dropdown menu. Snap planet choices inside!');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['mars_dropdown'] = function (block: any) {
    let optionsCode = '';
    let opt = block.getInputTargetBlock('OPTIONS');
    while (opt) {
      if (opt.type === 'mars_option_mercury' || opt.type === 'html_option_mercury') {
        optionsCode += '    <option value="mercury">Mercury</option>\n';
      } else if (opt.type === 'mars_option_venus' || opt.type === 'html_option_venus') {
        optionsCode += '    <option value="venus">Venus</option>\n';
      }
      opt = opt.getNextBlock();
    }
    return `  <select name="planet">\n${optionsCode}  </select>\n`;
  };

  // 3. [ Option: Mercury ]: Option Child (<option>)
  Blockly.Blocks['mars_option_mercury'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Option: Mercury');
      this.setPreviousStatement(true, 'MarsOption');
      this.setNextStatement(true, 'MarsOption');
      this.setColour('#D97706'); // Deep Gold
      this.setTooltip('Adds Mercury as a choice in the dropdown menu.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['mars_option_mercury'] = function () {
    return '    <option value="mercury">Mercury</option>\n';
  };

  // 4. [ Option: Venus ]: Option Child (<option>)
  Blockly.Blocks['mars_option_venus'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Option: Venus');
      this.setPreviousStatement(true, 'MarsOption');
      this.setNextStatement(true, 'MarsOption');
      this.setColour('#D97706'); // Deep Gold
      this.setTooltip('Adds Venus as a choice in the dropdown menu.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['mars_option_venus'] = function () {
    return '    <option value="venus">Venus</option>\n';
  };

  // 5. [ Message Input ]: Clean Message Field
  Blockly.Blocks['mars_text_input'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Message Input');
      this.setPreviousStatement(true, 'MarsFormControl');
      this.setNextStatement(true, 'MarsFormControl');
      this.setColour('#0EA5E9'); // Sky Blue
      this.setTooltip('A text box where space travelers can type a message.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['mars_text_input'] = function () {
    return '  <input type="text" maxLength="25" />\n';
  };

  // 6. [ Send Button ]: Send Signal
  Blockly.Blocks['mars_button'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Send Button');
      this.setPreviousStatement(true, 'MarsFormControl');
      this.setNextStatement(true, 'MarsFormControl');
      this.setColour('#10B981'); // Emerald Green
      this.setTooltip('A button that sends your message into space!');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['mars_button'] = function () {
    return '  <button type="submit">Send</button>\n';
  };

  // Compatibility aliases
  Blockly.Blocks['html_form_custom'] = Blockly.Blocks['mars_form_container'];
  (javascriptGenerator as any).forBlock['html_form_custom'] = (javascriptGenerator as any).forBlock['mars_form_container'];
  Blockly.Blocks['html_form_l3'] = Blockly.Blocks['mars_form_container'];
  (javascriptGenerator as any).forBlock['html_form_l3'] = (javascriptGenerator as any).forBlock['mars_form_container'];

  Blockly.Blocks['html_input_custom'] = Blockly.Blocks['mars_text_input'];
  (javascriptGenerator as any).forBlock['html_input_custom'] = (javascriptGenerator as any).forBlock['mars_text_input'];
  Blockly.Blocks['html_input_l3'] = Blockly.Blocks['mars_text_input'];
  (javascriptGenerator as any).forBlock['html_input_l3'] = (javascriptGenerator as any).forBlock['mars_text_input'];

  Blockly.Blocks['html_select_l3'] = Blockly.Blocks['mars_dropdown'];
  (javascriptGenerator as any).forBlock['html_select_l3'] = (javascriptGenerator as any).forBlock['mars_dropdown'];

  Blockly.Blocks['html_option_mercury'] = Blockly.Blocks['mars_option_mercury'];
  (javascriptGenerator as any).forBlock['html_option_mercury'] = (javascriptGenerator as any).forBlock['mars_option_mercury'];
  Blockly.Blocks['html_option_venus'] = Blockly.Blocks['mars_option_venus'];
  (javascriptGenerator as any).forBlock['html_option_venus'] = (javascriptGenerator as any).forBlock['mars_option_venus'];

  Blockly.Blocks['html_button_custom'] = Blockly.Blocks['mars_button'];
  (javascriptGenerator as any).forBlock['html_button_custom'] = (javascriptGenerator as any).forBlock['mars_button'];
  Blockly.Blocks['html_button_l3'] = Blockly.Blocks['mars_button'];
  (javascriptGenerator as any).forBlock['html_button_l3'] = (javascriptGenerator as any).forBlock['mars_button'];
}

export const MARS_LEVEL_3_TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Form',
      colour: '#8B5CF6',
      contents: [
        {
          kind: 'block',
          type: 'mars_form_container',
          fields: {
            TITLE: '',
          },
        },
      ],
    },
    {
      kind: 'category',
      name: 'Options',
      colour: '#F59E0B',
      contents: [
        { kind: 'block', type: 'mars_dropdown' },
        { kind: 'block', type: 'mars_option_mercury' },
        { kind: 'block', type: 'mars_option_venus' },
      ],
    },
    {
      kind: 'category',
      name: 'Input',
      colour: '#0EA5E9',
      contents: [
        { kind: 'block', type: 'mars_text_input' },
        { kind: 'block', type: 'mars_button' },
      ],
    },
  ],
};

export const MARS_LEVEL_3_STARTER_XML = `
<xml xmlns="https://developers.google.com/blockly/xml"></xml>
`.trim();

export function parseMarsLevel3Workspace(ws: Blockly.WorkspaceSvg): {
  state: MarsLevel3WorkspaceState;
  validation: MarsLevel3Validation;
  htmlCode: string;
} {
  const topBlocks = ws.getTopBlocks(true);
  const formBlocks = topBlocks.filter(
    (b) => b.type === 'mars_form_container' || b.type === 'html_form_custom' || b.type === 'html_form_l3'
  );

  const hasForm = formBlocks.length === 1;
  const rawFormTitle = formBlocks[0]?.getFieldValue('TITLE');
  const formTitle = (rawFormTitle !== null && rawFormTitle !== undefined) ? rawFormTitle.trim() : '';
  const floatingBlocks: string[] = [];

  topBlocks.forEach((top) => {
    if (top !== formBlocks[0]) {
      let curr: Blockly.Block | null = top;
      while (curr) {
        floatingBlocks.push(curr.id);
        curr = curr.getNextBlock();
      }
    }
  });

  let hasDropdown = false;
  let dropdownCount = 0;
  let hasMercuryOption = false;
  let hasVenusOption = false;
  let hasInput = false;
  let hasButton = false;
  let hasMisplacedDropdownChildren = false;
  let hasMisplacedFormChildren = false;
  const options: ('mercury' | 'venus')[] = [];
  let inputCount = 0;
  let buttonCount = 0;

  if (formBlocks.length > 0) {
    let inner: Blockly.Block | null = formBlocks[0].getInputTargetBlock('CONTENT');
    while (inner) {
      const t = inner.type;
      if (t === 'mars_dropdown' || t === 'html_select_l3') {
        hasDropdown = true;
        dropdownCount++;
        let opt: Blockly.Block | null = inner.getInputTargetBlock('OPTIONS');
        while (opt) {
          if (opt.type === 'mars_option_mercury' || opt.type === 'html_option_mercury') {
            hasMercuryOption = true;
            if (!options.includes('mercury')) options.push('mercury');
          } else if (opt.type === 'mars_option_venus' || opt.type === 'html_option_venus') {
            hasVenusOption = true;
            if (!options.includes('venus')) options.push('venus');
          } else {
            // Illegal block placed inside a Dropdown Menu (e.g. text input or button)
            hasMisplacedDropdownChildren = true;
          }
          opt = opt.getNextBlock();
        }
      } else if (t === 'mars_text_input' || t === 'html_input_custom' || t === 'html_input_l3') {
        hasInput = true;
        inputCount++;
      } else if (t === 'mars_button' || t === 'html_button_custom' || t === 'html_button_l3') {
        hasButton = true;
        buttonCount++;
      } else if (t === 'mars_option_mercury' || t === 'mars_option_venus' || t === 'html_option_mercury' || t === 'html_option_venus') {
        // Option block placed directly inside the form container
        hasMisplacedFormChildren = true;
      }
      inner = inner.getNextBlock();
    }
  }

  // Deployment requirement: core form structure must be present
  // Unincluded options do not block deployment into the simulation, but will be unavailable in the dropdown.
  const canDeploy =
    hasForm &&
    formBlocks.length === 1 &&
    hasDropdown &&
    dropdownCount === 1 &&
    hasInput &&
    hasButton &&
    !hasMisplacedDropdownChildren &&
    !hasMisplacedFormChildren;

  let failErrorCode: string | null = null;
  let deployErrorMessage: string | null = null;

  if (formBlocks.length === 0) {
    failErrorCode = 'NO_FORM';
    deployErrorMessage = 'Missing a Form Container! Wrap your elements inside a Form Container.';
  } else if (formBlocks.length > 1) {
    failErrorCode = 'TOO_MANY_FORMS';
    deployErrorMessage = 'Use exactly one Form Container!';
  } else if (hasMisplacedDropdownChildren) {
    failErrorCode = 'INVALID_DROPDOWN_CHILD';
    deployErrorMessage = 'Only Option blocks can go inside a Dropdown Menu! Move your Message Input and Button outside the Dropdown.';
  } else if (hasMisplacedFormChildren) {
    failErrorCode = 'OPTION_OUTSIDE_DROPDOWN';
    deployErrorMessage = 'Option blocks must be placed inside a Dropdown Menu, not directly in the Form Container!';
  } else if (!hasDropdown) {
    failErrorCode = 'MISSING_DROPDOWN';
    deployErrorMessage = 'Missing a Dropdown Menu!';
  } else if (dropdownCount > 1) {
    failErrorCode = 'TOO_MANY_DROPDOWNS';
    deployErrorMessage = 'Use only one Dropdown Menu for choosing target planets!';
  } else if (!hasInput) {
    failErrorCode = 'MISSING_INPUT';
    deployErrorMessage = 'Missing a Message Input!';
  } else if (!hasButton) {
    failErrorCode = 'MISSING_BUTTON';
    deployErrorMessage = 'Missing a Send Button!';
  }

  // Full win assembly requires both options to ping both planets
  const isAssemblyValid = canDeploy && hasMercuryOption && hasVenusOption;

  let failErrorMessage: string | null = deployErrorMessage;
  if (!failErrorMessage) {
    if (!hasMercuryOption && !hasVenusOption) {
      failErrorCode = 'MISSING_ALL_OPTIONS';
      failErrorMessage = 'Snap Option: Mercury and Option: Venus inside your Dropdown Menu to ping both planets!';
    } else if (!hasMercuryOption) {
      failErrorCode = 'MISSING_MERCURY_OPTION';
      failErrorMessage = 'Missing Option: Mercury inside your Dropdown Menu!';
    } else if (!hasVenusOption) {
      failErrorCode = 'MISSING_VENUS_OPTION';
      failErrorMessage = 'Missing Option: Venus inside your Dropdown Menu!';
    }
  }

  let htmlCode = '';
  try {
    htmlCode = (javascriptGenerator as any).workspaceToCode(ws) || '';
  } catch {
    htmlCode = '';
  }

  return {
    state: {
      hasForm,
      hasDropdown,
      hasMercuryOption,
      hasVenusOption,
      hasInput,
      hasButton,
      hasTitle: formTitle.length > 0,
      formTitle,
      options,
      inputCount,
      buttonCount,
      floatingBlocks,
      hasErrors: failErrorCode !== null,
    },
    validation: {
      hasForm,
      hasDropdown,
      hasMercuryOption,
      hasVenusOption,
      hasInput,
      hasButton,
      hasTitle: formTitle.length > 0,
      formTitle,
      options,
      inputCount,
      buttonCount,
      canDeploy,
      isAssemblyValid,
      failErrorCode,
      failErrorMessage,
      deployErrorMessage,
      completedObjectives: [formTitle.length > 0, false, false],
    },
    htmlCode,
  };
}
