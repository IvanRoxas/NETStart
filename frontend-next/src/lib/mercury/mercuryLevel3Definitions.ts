import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { LevelSection } from '@/components/BlocklyMaze';
import { FieldColorWheel } from '@/lib/venus/venusLevel1Definitions';

// =============================================================================
// TYPES & INTERFACES (Mercury Level 3: Full-Stack AstroLink Comms Relay)
// =============================================================================

export type Mercury3TabId = 'html' | 'css' | 'js';

export interface Mercury3TabInfo {
  id: Mercury3TabId;
  label: string;
  sublabel: string;
  themeColor: string;
}

export const MERCURY_3_TABS: Mercury3TabInfo[] = [
  { id: 'html', label: 'HTML', sublabel: 'Structure', themeColor: '#E44D26' },
  { id: 'css', label: 'CSS', sublabel: 'Style', themeColor: '#1572B6' },
  { id: 'js', label: 'JS', sublabel: 'Logic', themeColor: '#F7DF1E' },
];

export interface Mercury3WorkspaceStates {
  html: string;
  css: string;
  js: string;
}

export const INITIAL_MERCURY_3_WORKSPACES: Mercury3WorkspaceStates = {
  html: '',
  css: '',
  js: '',
};

export type PlanetTarget = 'Mars' | 'Venus' | 'Jupiter' | 'Saturn' | 'Earth';

export const MERCURY_3_TARGET_PLANETS: PlanetTarget[] = [
  'Mars',
  'Venus',
  'Jupiter',
  'Saturn',
  'Earth',
];

export interface Mercury3AuditStatus {
  hasMainForm: boolean;
  hasMessageInput: boolean;
  hasPlanetDropdown: boolean;
  hasSubmitBtn: boolean;
  hasFlexLayout: boolean;
  hasCenteredLayout: boolean;
  hasPastelOrangeBtn: boolean;
  hasClickListener: boolean;
  hasTransmitBlock: boolean;
  canRunSimulation: boolean;
  lockoutReason?: string;
  htmlValid: boolean;
  cssValid: boolean;
  jsValid: boolean;
  htmlStructureValid: boolean;
  cssStylingValid: boolean;
  jsLogicValid: boolean;
}

export const INITIAL_MERCURY_3_AUDIT: Mercury3AuditStatus = {
  hasMainForm: false,
  hasMessageInput: false,
  hasPlanetDropdown: false,
  hasSubmitBtn: false,
  hasFlexLayout: false,
  hasCenteredLayout: false,
  hasPastelOrangeBtn: false,
  hasClickListener: false,
  hasTransmitBlock: false,
  canRunSimulation: false,
  lockoutReason: 'Build your HTML form structure to begin.',
  htmlValid: false,
  cssValid: false,
  jsValid: false,
  htmlStructureValid: false,
  cssStylingValid: false,
  jsLogicValid: false,
};

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

let isMercury3BlocksRegistered = false;

export function registerMercuryLevel3Blocks() {
  if (isMercury3BlocksRegistered) return;
  isMercury3BlocksRegistered = true;

  // ---------------------------------------------------------------------------
  // 1. HTML TAB BLOCKS (Warm & Vibrant Palette)
  // ---------------------------------------------------------------------------

  // Link Stylesheet Block (Connects HTML to CSS)
  Blockly.Blocks['html_link_stylesheet'] = {
    init: function () {
      this.appendDummyInput().appendField('Attach Stylesheet');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#E11D48');
      this.setTooltip('Applies your styling from the CSS tab.');
    },
  };

  javascriptGenerator.forBlock['html_link_stylesheet'] = function () {
    return `<link rel="stylesheet" href="style.css">\n`;
  };

  // Link Script Block (Connects HTML to JS)
  Blockly.Blocks['html_link_script'] = {
    init: function () {
      this.appendDummyInput().appendField('Attach Logic Script');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#BE123C');
      this.setTooltip('Connects your interactive code from the JS tab.');
    },
  };

  javascriptGenerator.forBlock['html_link_script'] = function () {
    return `<script src="logic.js"></script>\n`;
  };

  // Main Screen Box Wrapper
  Blockly.Blocks['html_form_container'] = {
    init: function () {
      this.appendDummyInput().appendField('Main Screen Box');
      this.appendStatementInput('CONTENT').setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#C2410C');
      this.setTooltip('The main container box that holds your terminal elements.');
    },
  };

  javascriptGenerator.forBlock['html_form_container'] = function (block: any) {
    const content = javascriptGenerator.statementToCode(block, 'CONTENT') || '';
    return `<div id="mainForm">\n${content}</div>\n`;
  };

  // Title Block
  Blockly.Blocks['html_title_block'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Main Title:')
        .appendField(new Blockly.FieldTextInput('AstroLink Comms'), 'TITLE_TEXT');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#F59E0B');
      this.setTooltip('A large header title for the terminal.');
    },
  };

  javascriptGenerator.forBlock['html_title_block'] = function (block: any) {
    const text = block.getFieldValue('TITLE_TEXT') || 'AstroLink Comms';
    return `<h1 id="title">${text}</h1>\n`;
  };

  // Subtitle Block
  Blockly.Blocks['html_subtitle_block'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Subtitle:')
        .appendField(new Blockly.FieldTextInput('Quantum Relay Terminal'), 'SUBTITLE_TEXT');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#D97706');
      this.setTooltip('A smaller descriptive subtitle.');
    },
  };

  javascriptGenerator.forBlock['html_subtitle_block'] = function (block: any) {
    const text = block.getFieldValue('SUBTITLE_TEXT') || 'Quantum Relay Terminal';
    return `<p id="subtitle">${text}</p>\n`;
  };


  // Dropdown Menu Container (User drags choices inside)
  Blockly.Blocks['html_dropdown_block'] = {
    init: function () {
      this.appendDummyInput().appendField('Choice Menu');
      this.appendStatementInput('OPTIONS').setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EA580C');
      this.setTooltip('A dropdown menu where you can drag and drop planet choices inside.');
    },
  };

  javascriptGenerator.forBlock['html_dropdown_block'] = function (block: any) {
    const options = javascriptGenerator.statementToCode(block, 'OPTIONS') || '';
    return `<select id="planetDropdown">\n${options}</select>\n`;
  };

  // Dropdown Option Item
  Blockly.Blocks['html_dropdown_option'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Menu Item:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Mars', 'Mars'],
            ['Venus', 'Venus'],
            ['Jupiter', 'Jupiter'],
            ['Saturn', 'Saturn'],
            ['Earth', 'Earth'],
          ]),
          'CHOICE'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EAB308');
      this.setTooltip('A selectable planet choice to drag inside your Choice Menu.');
    },
  };

  javascriptGenerator.forBlock['html_dropdown_option'] = function (block: any) {
    let curr = block.getParent();
    let insideDropdown = false;
    while (curr) {
      if (curr.type === 'html_dropdown_block') {
        insideDropdown = true;
        break;
      }
      curr = curr.getParent();
    }
    if (!insideDropdown) return '';
    const choice = block.getFieldValue('CHOICE') || 'Mars';
    return `  <option value="${choice}">${choice}</option>\n`;
  };

  // Message Box Block
  Blockly.Blocks['html_message_box'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Text Input Area:')
        .appendField(new Blockly.FieldTextInput('Signal check...'), 'PLACEHOLDER');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#10B981');
      this.setTooltip('The area where you type your transmission message.');
    },
  };

  javascriptGenerator.forBlock['html_message_box'] = function (block: any) {
    const placeholder = block.getFieldValue('PLACEHOLDER') || 'Signal check...';
    return `<textarea id="messageInput" placeholder="${placeholder}"></textarea>\n`;
  };

  // Send Button Block
  Blockly.Blocks['html_send_button'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Send Button:')
        .appendField(new Blockly.FieldTextInput('Transmit'), 'BTN_LABEL');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#059669');
      this.setTooltip('The button clicked to send your message.');
    },
  };

  javascriptGenerator.forBlock['html_send_button'] = function (block: any) {
    const label = block.getFieldValue('BTN_LABEL') || 'Transmit';
    return `<button id="submitBtn">${label}</button>\n`;
  };

  // Clear Button Block
  Blockly.Blocks['html_clear_button'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Reset Button:')
        .appendField(new Blockly.FieldTextInput('Clear'), 'BTN_LABEL');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#84CC16');
      this.setTooltip('A button to erase the text in the message box.');
    },
  };

  javascriptGenerator.forBlock['html_clear_button'] = function (block: any) {
    const label = block.getFieldValue('BTN_LABEL') || 'Clear';
    return `<button id="clearBtn" type="button">${label}</button>\n`;
  };

  // ---------------------------------------------------------------------------
  // 2. CSS TAB BLOCKS (Cool Palette: Blue, Violet, Cyan, Teal)
  // ---------------------------------------------------------------------------

  // CSS Selector Wrapper
  Blockly.Blocks['css_selector_wrapper'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Link Styles to:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Main Screen Box', '#mainForm'],
            ['Send Button', '#submitBtn'],
            ['Reset Button', '#clearBtn'],
            ['Choice Menu', '#planetDropdown'],
            ['Text Input Area', '#messageInput'],
            ['Main Title', '#title'],
            ['Full Page', 'body'],
          ]),
          'SELECTOR'
        );
      this.appendStatementInput('RULES').setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#2563EB');
      this.setTooltip('Links styling rules to a specific element from your HTML structure.');
    },
  };

  javascriptGenerator.forBlock['css_selector_wrapper'] = function (block: any) {
    const selector = block.getFieldValue('SELECTOR') || '#mainForm';
    const rules = javascriptGenerator.statementToCode(block, 'RULES') || '';
    return `${selector} {\n${rules}}\n`;
  };

  // Individual Flexbox Layout Blocks (Modular)
  Blockly.Blocks['css_flex_direction'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Arrange Direction:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Vertical (Stacked)', 'column'],
            ['Horizontal (Side by Side)', 'row'],
          ]),
          'DIRECTION'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#7C3AED');
      this.setTooltip('Sets whether elements stack vertically or sit side-by-side.');
    },
  };

  javascriptGenerator.forBlock['css_flex_direction'] = function (block: any) {
    const direction = block.getFieldValue('DIRECTION') || 'column';
    return `  display: flex;\n  flex-direction: ${direction};\n`;
  };

  Blockly.Blocks['css_flex_align'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Align Items:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Center', 'center'],
            ['Start', 'flex-start'],
            ['Stretch', 'stretch'],
          ]),
          'ALIGN'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#8B5CF6');
      this.setTooltip('Aligns items horizontally or vertically across the axis.');
    },
  };

  javascriptGenerator.forBlock['css_flex_align'] = function (block: any) {
    const align = block.getFieldValue('ALIGN') || 'center';
    return `  align-items: ${align};\n`;
  };

  Blockly.Blocks['css_flex_justify'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Spread Items:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Center', 'center'],
            ['Start', 'flex-start'],
            ['Space Out', 'space-between'],
          ]),
          'JUSTIFY'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#A855F7');
      this.setTooltip('Distributes items along the main direction axis.');
    },
  };

  javascriptGenerator.forBlock['css_flex_justify'] = function (block: any) {
    const justify = block.getFieldValue('JUSTIFY') || 'center';
    return `  justify-content: ${justify};\n`;
  };

  Blockly.Blocks['css_flex_gap'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Item Spacing:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Small (8px)', '8px'],
            ['Medium (12px)', '12px'],
            ['Large (16px)', '16px'],
            ['None (0px)', '0px'],
          ]),
          'GAP'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#C084FC');
      this.setTooltip('Sets the spacing gap between nested items.');
    },
  };

  javascriptGenerator.forBlock['css_flex_gap'] = function (block: any) {
    const gap = block.getFieldValue('GAP') || '8px';
    return `  gap: ${gap};\n`;
  };

  // Stacked Flexbox Layout Block (Simplified to 2 intuitive options)
  Blockly.Blocks['css_flex_container'] = {
    init: function () {
      this.appendDummyInput().appendField('Arrange Layout:');
      this.appendDummyInput()
        .appendField('Direction:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Vertical (Stacked)', 'column'],
            ['Horizontal (Side by Side)', 'row'],
          ]),
          'DIRECTION'
        );
      this.appendDummyInput()
        .appendField('Align:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Center', 'center'],
            ['Start', 'flex-start'],
            ['End', 'flex-end'],
          ]),
          'ALIGN'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#6D28D9');
      this.setTooltip('Arranges elements neatly with direction and alignment.');
    },
  };

  javascriptGenerator.forBlock['css_flex_container'] = function (block: any) {
    const direction = block.getFieldValue('DIRECTION') || 'column';
    const align = block.getFieldValue('ALIGN') || 'center';
    return `  display: flex;\n  flex-direction: ${direction};\n  align-items: ${align};\n  gap: 8px;\n`;
  };

  // Color Picker Block with Venus-style Interactive Color Wheel & Visual Swatch
  Blockly.Blocks['css_color_picker'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Color:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Background', 'background-color'],
            ['Text', 'color'],
            ['Border', 'border'],
          ]),
          'PROP'
        )
        .appendField('=')
        .appendField(new FieldColorWheel('#FFB347'), 'COLOR');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#EC4899');
      this.setTooltip('Click the circular swatch to open the color wheel, spectrum slider, and space palette!');
    },
  };

  javascriptGenerator.forBlock['css_color_picker'] = function (block: any) {
    const prop = block.getFieldValue('PROP') || 'background-color';
    const color = block.getFieldValue('COLOR') || '#FFB347';
    if (prop === 'border') {
      return `  border: 1px solid ${color};\n`;
    }
    return `  ${prop}: ${color};\n`;
  };

  // Typography Block
  Blockly.Blocks['css_typography_block'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Text Font:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Typewriter', 'monospace'],
            ['Modern Sans', 'sans-serif'],
          ]),
          'FONT'
        )
        .appendField('Size:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Medium (14px)', '14px'],
            ['Large (16px)', '16px'],
            ['Extra Large (20px)', '20px'],
            ['Huge (24px)', '24px'],
          ]),
          'SIZE'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#06B6D4');
      this.setTooltip('Changes the text appearance and size.');
    },
  };

  javascriptGenerator.forBlock['css_typography_block'] = function (block: any) {
    const font = block.getFieldValue('FONT') || 'monospace';
    const size = block.getFieldValue('SIZE') || '14px';
    return `  font-family: ${font};\n  font-size: ${size};\n`;
  };

  // Box Model Block
  Blockly.Blocks['css_box_model_block'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Inside Spacing:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Small (8px)', '8px'],
            ['Medium (12px)', '12px'],
            ['Large (16px)', '16px'],
          ]),
          'PADDING'
        )
        .appendField('Corners:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Slight (4px)', '4px'],
            ['Rounded (8px)', '8px'],
            ['Very Rounded (12px)', '12px'],
            ['Pill (20px)', '20px'],
          ]),
          'RADIUS'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0284C7');
      this.setTooltip('Adds spacing inside the element and rounds its corners.');
    },
  };

  javascriptGenerator.forBlock['css_box_model_block'] = function (block: any) {
    const padding = block.getFieldValue('PADDING') || '12px';
    const radius = block.getFieldValue('RADIUS') || '8px';
    return `  padding: ${padding};\n  border-radius: ${radius};\n`;
  };

  // Glassmorphic Border Block with interactive Color Wheel & glowing shadow
  Blockly.Blocks['css_glass_border'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Border Glow:')
        .appendField(new FieldColorWheel('#FFB347'), 'GLOW_COLOR');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#DB2777');
      this.setTooltip('Click the circular swatch to pick any color for your glowing border!');
    },
  };

  javascriptGenerator.forBlock['css_glass_border'] = function (block: any) {
    const color = block.getFieldValue('GLOW_COLOR') || block.getFieldValue('BORDER_VAL') || '#FFB347';
    if (typeof color === 'string' && color.includes('border:')) {
      return `  ${color}\n`;
    }
    return `  border: 1px solid ${color};\n  box-shadow: 0 0 15px ${color}66;\n`;
  };

  // ---------------------------------------------------------------------------
  // 3. JAVASCRIPT TAB BLOCKS (Logic Palette: Teal, Coral, Violet, Indigo)
  // ---------------------------------------------------------------------------

  // Find Element on Screen
  Blockly.Blocks['js_get_element'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Find on Screen:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Send Button', 'submitBtn'],
            ['Reset Button', 'clearBtn'],
            ['Choice Menu', 'planetDropdown'],
            ['Text Input Area', 'messageInput'],
            ['Main Title', 'title'],
          ]),
          'ELEMENT_ID'
        );
      this.setOutput(true, null);
      this.setColour('#14B8A6');
      this.setTooltip('Finds an element on the screen.');
    },
  };

  javascriptGenerator.forBlock['js_get_element'] = function (block: any) {
    const id = block.getFieldValue('ELEMENT_ID') || 'submitBtn';
    return [`document.getElementById('${id}')`, (javascriptGenerator as any).ORDER_FUNCTION_CALL || (javascriptGenerator as any).ORDER_ATOMIC || 0];
  };

  // Variable Declaration
  Blockly.Blocks['js_variable_declaration'] = {
    init: function () {
      this.appendValueInput('VALUE')
        .appendField('Remember as')
        .appendField(
          new Blockly.FieldDropdown([
            ['Send Button', 'sendButton'],
            ['Reset Button', 'clearButton'],
            ['Choice Menu', 'planetSelect'],
            ['Text Input Area', 'messageBox'],
          ]),
          'VAR_NAME'
        )
        .appendField('=');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0F766E');
      this.setTooltip('Stores the element so your code can use it later.');
    },
  };

  javascriptGenerator.forBlock['js_variable_declaration'] = function (block: any) {
    const name = block.getFieldValue('VAR_NAME') || 'sendButton';
    const value = javascriptGenerator.valueToCode(block, 'VALUE', 0) || 'null';
    return `let ${name} = ${value};\n`;
  };

  // Event Listener Block
  Blockly.Blocks['js_add_event_listener'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('When')
        .appendField(
          new Blockly.FieldDropdown([
            ['Send Button', 'submitBtn'],
            ['Reset Button', 'clearBtn'],
          ]),
          'TARGET_BTN'
        )
        .appendField('is Clicked do:');
      this.appendStatementInput('HANDLER').setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#F97316');
      this.setTooltip('Runs instructions when a button is clicked.');
    },
  };

  javascriptGenerator.forBlock['js_add_event_listener'] = function (block: any) {
    const btnId = block.getFieldValue('TARGET_BTN') || 'submitBtn';
    const handler = javascriptGenerator.statementToCode(block, 'HANDLER') || '';
    return `var btn_${btnId} = document.getElementById('${btnId}');\nif (btn_${btnId}) {\n  btn_${btnId}.addEventListener('click', function () {\n${handler}  });\n}\n`;
  };

  // Beam Signal Action Block (Requires Destination and Message sockets)
  Blockly.Blocks['js_beam_signal'] = {
    init: function () {
      this.appendValueInput('DESTINATION')
        .setCheck(['PlanetDestination', 'String'])
        .appendField('Beam Signal to Planet:');
      this.appendValueInput('PAYLOAD')
        .setCheck(['MessagePayload', 'String'])
        .appendField('with Message:');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#6366F1');
      this.setTooltip('Transmits your message out across the AstroLink network to the specified planet.');
    },
  };

  javascriptGenerator.forBlock['js_beam_signal'] = function (block: any) {
    const dest = javascriptGenerator.valueToCode(block, 'DESTINATION', 0) || '""';
    const msg = javascriptGenerator.valueToCode(block, 'PAYLOAD', 0) || '""';
    return `transmitAstroLink(${dest}, ${msg});\n`;
  };

  // Get Selected Planet Block
  Blockly.Blocks['js_get_planet'] = {
    init: function () {
      this.appendDummyInput().appendField('Get Selected Planet from: Choice Menu');
      this.setOutput(true, 'PlanetDestination');
      this.setColour('#0EA5E9');
      this.setTooltip('Reads which planet destination is currently selected in your dropdown menu.');
    },
  };

  javascriptGenerator.forBlock['js_get_planet'] = function () {
    return [
      `(document.getElementById('planetDropdown') ? document.getElementById('planetDropdown').value : '')`,
      (javascriptGenerator as any).ORDER_ATOMIC || 0,
    ];
  };

  // Get Typed Text Block
  Blockly.Blocks['js_get_message'] = {
    init: function () {
      this.appendDummyInput().appendField('Get Typed Text from: Text Input Area');
      this.setOutput(true, 'MessagePayload');
      this.setColour('#14B8A6');
      this.setTooltip('Reads the message text typed into the text input area.');
    },
  };

  javascriptGenerator.forBlock['js_get_message'] = function () {
    return [
      `(document.getElementById('messageInput') ? document.getElementById('messageInput').value : '')`,
      (javascriptGenerator as any).ORDER_ATOMIC || 0,
    ];
  };

  // Clear Message Action Block
  Blockly.Blocks['js_clear_message'] = {
    init: function () {
      this.appendDummyInput().appendField('Clear Text inside: Text Input Area');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#A855F7');
      this.setTooltip('Clears out whatever text is inside the message area.');
    },
  };

  javascriptGenerator.forBlock['js_clear_message'] = function () {
    return `var inputEl = document.getElementById('messageInput');\nif (inputEl) inputEl.value = '';\n`;
  };

  // ---------------------------------------------------------------------------
  // LEGACY BLOCKS (hidden from toolboxes; kept so older saved workspaces load)
  // ---------------------------------------------------------------------------
  const legacyIdMap: Record<string, string> = {
    sendButton: 'submitBtn', clearButton: 'clearBtn', planetSelect: 'planetDropdown', messageBox: 'messageInput',
  };
  const legacyValueExpr = (key: string) => {
    const id = legacyIdMap[key] || key || 'planetDropdown';
    return `(document.getElementById('${id}') ? document.getElementById('${id}').value : '')`;
  };

  Blockly.Blocks['html_image_embed'] = {
    init: function () {
      this.appendDummyInput().appendField('Picture Icon (removed)');
      this.appendDummyInput().appendField(new Blockly.FieldTextInput(''), 'ICON_SRC').setVisible(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#64748B');
      this.setTooltip('This block is no longer used. You can delete it.');
    },
  };
  javascriptGenerator.forBlock['html_image_embed'] = function () { return ''; };

  Blockly.Blocks['js_transmit_auto'] = {
    init: function () {
      this.appendDummyInput().appendField('Transmit message to chosen planet');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#6366F1');
    },
  };
  javascriptGenerator.forBlock['js_transmit_auto'] = function () {
    return `transmitAstroLink(${legacyValueExpr('planetDropdown')}, ${legacyValueExpr('messageInput')});\n`;
  };

  Blockly.Blocks['js_transmit_function'] = {
    init: function () {
      this.appendValueInput('DESTINATION').appendField('Transmit to:');
      this.appendValueInput('PAYLOAD').appendField('Message:');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#3B82F6');
    },
  };
  javascriptGenerator.forBlock['js_transmit_function'] = function (block: any) {
    const dest = javascriptGenerator.valueToCode(block, 'DESTINATION', 0) || '""';
    const msg = javascriptGenerator.valueToCode(block, 'PAYLOAD', 0) || '""';
    return `transmitAstroLink(${dest}, ${msg});\n`;
  };

  Blockly.Blocks['js_get_value'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Read text from:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Choice Menu', 'planetSelect'],
            ['Text Input Area', 'messageBox'],
            ['Send Button', 'sendButton'],
          ]),
          'TARGET_VAR'
        );
      this.setOutput(true, null);
      this.setColour('#9333EA');
    },
  };
  javascriptGenerator.forBlock['js_get_value'] = function (block: any) {
    return [legacyValueExpr(block.getFieldValue('TARGET_VAR')), (javascriptGenerator as any).ORDER_ATOMIC || 0];
  };

  Blockly.Blocks['js_clear_input'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Erase text in:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Text Input Area', 'messageBox'],
            ['Choice Menu', 'planetSelect'],
          ]),
          'TARGET_VAR'
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4F46E5');
    },
  };
  javascriptGenerator.forBlock['js_clear_input'] = function (block: any) {
    const id = legacyIdMap[block.getFieldValue('TARGET_VAR')] || 'messageInput';
    return `var legacyClear = document.getElementById('${id}');\nif (legacyClear) legacyClear.value = '';\n`;
  };
}

// =============================================================================
// TOOLBOX CONFIGURATIONS (Tab Specific - Concise Categories & Bright Colors)
// =============================================================================

export function getMercury3HtmlToolbox(): string {
  return `
<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox-html" style="display: none">
  <category name="Setup" colour="#E11D48">
    <block type="html_link_stylesheet"></block>
    <block type="html_link_script"></block>
  </category>
  <category name="Structure" colour="#C2410C">
    <block type="html_form_container"></block>
  </category>
  <category name="Text" colour="#F59E0B">
    <block type="html_title_block"></block>
    <block type="html_subtitle_block"></block>
  </category>
  <category name="Inputs" colour="#0EA5E9">
    <block type="html_dropdown_block"></block>
    <block type="html_dropdown_option"></block>
    <block type="html_message_box"></block>
  </category>
  <category name="Buttons" colour="#10B981">
    <block type="html_send_button"></block>
    <block type="html_clear_button"></block>
  </category>
</xml>
  `.trim();
}

export function getMercury3CssToolbox(): string {
  return `
<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox-css" style="display: none">
  <category name="Target" colour="#2563EB">
    <block type="css_selector_wrapper"></block>
  </category>
  <category name="Layout" colour="#7C3AED">
    <block type="css_flex_container"></block>
    <block type="css_flex_direction"></block>
    <block type="css_flex_align"></block>
    <block type="css_flex_gap"></block>
  </category>
  <category name="Color" colour="#EC4899">
    <block type="css_color_picker"></block>
    <block type="css_glass_border"></block>
  </category>
  <category name="Size" colour="#0284C7">
    <block type="css_typography_block"></block>
    <block type="css_box_model_block"></block>
  </category>
</xml>
  `.trim();
}

export function getMercury3JsToolbox(): string {
  return `
<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox-js" style="display: none">
  <category name="Events" colour="#F97316">
    <block type="js_add_event_listener"></block>
  </category>
  <category name="Actions" colour="#6366F1">
    <block type="js_beam_signal"></block>
    <block type="js_clear_message"></block>
  </category>
  <category name="Data" colour="#0EA5E9">
    <block type="js_get_planet"></block>
    <block type="js_get_message"></block>
  </category>
</xml>
  `.trim();
}



// =============================================================================
// COMPILATION & FILTERING HELPERS
// =============================================================================

export function compileMercury3Html(workspace: Blockly.Workspace): string {
  try {
    return javascriptGenerator.workspaceToCode(workspace);
  } catch {
    return '';
  }
}

export function compileMercury3Css(workspace: Blockly.Workspace): string {
  try {
    return javascriptGenerator.workspaceToCode(workspace);
  } catch {
    return '';
  }
}

export function compileMercury3Js(workspace: Blockly.Workspace): string {
  try {
    return javascriptGenerator.workspaceToCode(workspace);
  } catch {
    return '';
  }
}

export function isMercury3BlockAllowedInTab(blockType: string, tab: Mercury3TabId): boolean {
  if (tab === 'html') {
    return blockType.startsWith('html_');
  }
  if (tab === 'css') {
    return blockType.startsWith('css_');
  }
  if (tab === 'js') {
    return blockType.startsWith('js_');
  }
  return false;
}

// =============================================================================
// AUDITING & VALIDATION
// =============================================================================

export function auditMercury3Workspace(
  htmlCode: string,
  cssCode: string,
  jsCode: string
): Mercury3AuditStatus {
  const normHtml = htmlCode || '';
  const normCss = (cssCode || '').toLowerCase();
  const normJs = jsCode || '';

  const hasMainForm = normHtml.includes('id="mainForm"') || normHtml.includes("id='mainForm'");
  const hasMessageInput = normHtml.includes('id="messageInput"') || normHtml.includes("id='messageInput'");
  const hasPlanetDropdown = normHtml.includes('id="planetDropdown"') || normHtml.includes("id='planetDropdown'");
  const hasSubmitBtn = normHtml.includes('id="submitBtn"') || normHtml.includes("id='submitBtn'");

  // Count distinct styled HTML assets in CSS
  const targetSelectors = [
    '#mainForm',
    '#submitBtn',
    '#clearBtn',
    '#planetDropdown',
    '#messageInput',
    '#title',
    '#subtitle',
    'body',
    'button',
    'textarea',
    'select'
  ];
  const styledAssets = new Set<string>();
  targetSelectors.forEach(sel => {
    const escaped = sel.replace('#', '\\#');
    const regex = new RegExp(`${escaped}\\s*\\{([^\\}]+)\\}`, 'i');
    const match = normCss.match(regex);
    if (match && match[1].trim().length > 0) {
      styledAssets.add(sel);
    }
  });
  const hasAtLeast3StyledAssets = styledAssets.size >= 3;

  const hasAllFivePlanets =
    normHtml.includes('value="Mars"') &&
    normHtml.includes('value="Venus"') &&
    normHtml.includes('value="Jupiter"') &&
    normHtml.includes('value="Saturn"') &&
    normHtml.includes('value="Earth"');

  const hasStylesheet = normHtml.includes('rel="stylesheet"') || normHtml.includes("rel='stylesheet'") || normHtml.includes('style.css');
  const hasScript = normHtml.includes('<script') || normHtml.includes('logic.js');

  const hasClickListener = normJs.includes("addEventListener('click'") || normJs.includes('addEventListener("click"');
  const hasTransmitBlock = normJs.includes('transmitAstroLink(');

  let canRunSimulation = true;
  let lockoutReason: string | undefined = undefined;

  if (!hasStylesheet) {
    canRunSimulation = false;
    lockoutReason = 'Snap "Attach Stylesheet" at the top of the HTML tab to link your CSS styling.';
  } else if (!hasScript) {
    canRunSimulation = false;
    lockoutReason = 'Snap "Attach Logic Script" at the top of the HTML tab to link your JavaScript.';
  } else if (!hasMessageInput || !hasPlanetDropdown || !hasSubmitBtn) {
    canRunSimulation = false;
    lockoutReason = 'Snap the essential terminal blocks into place: Choice Menu, Text Input Area, and Send Button.';
  } else if (!hasAllFivePlanets) {
    canRunSimulation = false;
    lockoutReason = 'Drag all 5 planet destination choices (Mars, Venus, Jupiter, Saturn, Earth) inside the Choice Menu.';
  } else if (!hasAtLeast3StyledAssets) {
    canRunSimulation = false;
    lockoutReason = 'Color and style at least 3 HTML assets in the CSS tab (e.g. buttons, menu, text area, card).';
  } else if (!hasClickListener || !hasTransmitBlock) {
    canRunSimulation = false;
    lockoutReason = 'Wire the Send Button click event to transmitAstroLink in the JS tab.';
  }

  const htmlValid = hasStylesheet && hasScript && hasMessageInput && hasPlanetDropdown && hasSubmitBtn && hasAllFivePlanets;
  const cssValid = hasAtLeast3StyledAssets;
  const jsValid = hasClickListener && hasTransmitBlock;

  return {
    hasMainForm,
    hasMessageInput,
    hasPlanetDropdown,
    hasSubmitBtn,
    hasFlexLayout: true,
    hasCenteredLayout: true,
    hasPastelOrangeBtn: true,
    hasClickListener,
    hasTransmitBlock,
    canRunSimulation,
    lockoutReason,
    htmlValid,
    cssValid,
    jsValid,
    htmlStructureValid: htmlValid,
    cssStylingValid: cssValid,
    jsLogicValid: jsValid,
  };
}

// =============================================================================
// MISSION SECTION CONFIGURATION
// =============================================================================

export const MERCURY_3_SECTIONS: LevelSection[] = [
  {
    sectionIndex: 0,
    name: 'The Missing Interface',
    subtag: 'FULL-STACK WEB DEV',
    desc: 'The electromagnetic surge wiped Mercury\'s front-end software! Combine your web dev blocks to rebuild the AstroLink communication relay from scratch.',
    tip: 'Snap HTML blocks into place, style at least 3 assets in the CSS tab, then wire the Send button in JavaScript.',
    initialState: { x: 0, y: 0, direction: 0 },
    maze: [[1]],
    objectives: [
      {
        id: 1,
        text: 'Build the terminal: snap title, planet menu, text box, and buttons into place',
        completed: false,
      },
      {
        id: 2,
        text: 'Style the terminal: color and style at least 3 HTML assets',
        completed: false,
      },
      {
        id: 3,
        text: 'Restore comms: transmit messages to all 5 planetary relay stations',
        completed: false,
      },
    ],
  },
];
