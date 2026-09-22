import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export interface MarsLevel3ChildBlock {
  type: 'h1' | 'img' | 'a';
  text?: string;
  src?: string;
  href?: string;
  label?: string;
  id?: string;
}

export interface MarsLevel3WorkspaceState {
  isContainerPlaced: boolean;
  children: MarsLevel3ChildBlock[];
  floatingBlocks: string[];
  hasErrors: boolean;
}

export interface MarsLevel3Validation {
  hasContainer: boolean;
  hasHeading: boolean;
  headingText: string;
  hasValidSeal: boolean;
  imageSrc: string | null;
  hasEarthLink: boolean;
  hasVenusLink: boolean;
  linkedDestinations: string[];
  hasDecoys: boolean;
  isGoldenPath: boolean;
  failErrorCode: 1 | 2 | 3 | 4 | null;
  failErrorMessage: string | null;
  completedObjectives: boolean[];
}

export const MARS_L3_DESTINATIONS = [
  { label: 'earth_network.html (Earth Relay)', value: 'earth_network.html', target: 'earth' },
  { label: 'venus_network.html (Venus Uplink)', value: 'venus_network.html', target: 'venus' },
  { label: 'solar_flare.html (Radiation Decoy)', value: 'solar_flare.html', target: 'decoy' },
  { label: 'deep_space.html (Deep Space Void)', value: 'deep_space.html', target: 'decoy' },
  { label: 'asteroid_belt.html (Asteroid Field)', value: 'asteroid_belt.html', target: 'decoy' },
];

export const MARS_L3_IMAGES = [
  { label: '"mars_seal.png" (Official Seal)', value: 'mars_seal.png' },
  { label: '"dog.png"', value: 'dog.png' },
  { label: '"cat.png"', value: 'cat.png' },
  { label: '"octopus.png"', value: 'octopus.png' },
  { label: '"fish.png"', value: 'fish.png' },
  { label: '"butterfly.png"', value: 'butterfly.png' },
];

export function registerMarsLevel3Blocks() {
  if (typeof window === 'undefined') return;

  const MARS_L3_ITEM_TYPES = ['MARS_L3_ITEM'];

  // 1. Container Block <div>
  Blockly.Blocks['html_container_l3'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Container (<div>)');
      this.appendStatementInput('CONTENT')
        .setCheck(MARS_L3_ITEM_TYPES);
      this.setColour('#8B5CF6'); // Vibrant Purple
      this.setTooltip('Wrap all your message pieces safely inside this <div> container.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['html_container_l3'] = function (block: any) {
    const children = (javascriptGenerator as any).statementToCode(block, 'CONTENT') || '';
    return `<div>\n${children}</div>\n`;
  };

  // 2. Heading Block <h1>
  Blockly.Blocks['html_heading_l3'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Heading (<h1>)')
        .appendField(new Blockly.FieldTextInput('Mars Network'), 'TEXT')
        .appendField('</h1>');
      this.setPreviousStatement(true, MARS_L3_ITEM_TYPES);
      this.setNextStatement(true, MARS_L3_ITEM_TYPES);
      this.setColour('#EC4899'); // Fuchsia / Pink
      this.setTooltip('A large title heading to let Earth and Venus know who is calling.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['html_heading_l3'] = function (block: any) {
    const text = block.getFieldValue('TEXT') || 'Mars Network';
    return `  <h1>${text}</h1>\n`;
  };

  // 3. Image Block <img>
  Blockly.Blocks['html_image_l3'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Image (<img')
        .appendField('src =')
        .appendField(
          new Blockly.FieldDropdown(
            MARS_L3_IMAGES.map((img) => [img.label, img.value])
          ),
          'SRC'
        )
        .appendField('>)');
      this.setPreviousStatement(true, MARS_L3_ITEM_TYPES);
      this.setNextStatement(true, MARS_L3_ITEM_TYPES);
      this.setColour('#0EA5E9'); // Sky Blue
      this.setTooltip('Official Mars Seal graphic proving our friendly identity.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['html_image_l3'] = function (block: any) {
    const src = block.getFieldValue('SRC') || 'mars_seal.png';
    return `  <img src="${src}">\n`;
  };

  // 4. Link Block <a href="...">
  Blockly.Blocks['html_link_l3'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Link (<a')
        .appendField('href =')
        .appendField(
          new Blockly.FieldDropdown(
            MARS_L3_DESTINATIONS.map((d) => [d.label, d.value])
          ),
          'HREF'
        )
        .appendField('>')
        .appendField(new Blockly.FieldTextInput('Earth'), 'LABEL')
        .appendField('</a>');
      this.setPreviousStatement(true, MARS_L3_ITEM_TYPES);
      this.setNextStatement(true, MARS_L3_ITEM_TYPES);
      this.setColour('#10B981'); // Emerald Green
      this.setTooltip('Hyperlink connecting the AstroLink transmission beam to target network nodes.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['html_link_l3'] = function (block: any) {
    const href = block.getFieldValue('HREF') || 'earth_network.html';
    const label = block.getFieldValue('LABEL') || (href.includes('earth') ? 'Earth' : href.includes('venus') ? 'Venus' : 'Link');
    return `  <a href="${href}">${label}</a>\n`;
  };
}

export const MARS_LEVEL_3_TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Structure',
      colour: '#8B5CF6',
      contents: [
        { kind: 'block', type: 'html_container_l3' },
      ],
    },
    {
      kind: 'category',
      name: 'Text & Media',
      colour: '#EC4899',
      contents: [
        { kind: 'block', type: 'html_heading_l3' },
        { kind: 'block', type: 'html_image_l3' },
      ],
    },
    {
      kind: 'category',
      name: 'Hyperlinks',
      colour: '#10B981',
      contents: [
        { kind: 'block', type: 'html_link_l3' },
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
  const containerBlock = topBlocks.find((b) => b.type === 'html_container_l3');
  const isContainerPlaced = !!containerBlock;
  const children: MarsLevel3ChildBlock[] = [];
  const floatingBlocks: string[] = [];

  // Identify loose / floating blocks outside the container
  topBlocks.forEach((top) => {
    if (top.type !== 'html_container_l3') {
      let curr: Blockly.Block | null = top;
      while (curr) {
        floatingBlocks.push(curr.type);
        curr = curr.getNextBlock();
      }
    }
  });

  // Extract nested blocks inside container
  if (containerBlock) {
    let inner: Blockly.Block | null = containerBlock.getInputTargetBlock('CONTENT');
    while (inner) {
      if (inner.type === 'html_heading_l3') {
        const text = inner.getFieldValue('TEXT') || '';
        children.push({ type: 'h1', text, id: inner.id });
      } else if (inner.type === 'html_image_l3') {
        const src = inner.getFieldValue('SRC') || '';
        children.push({ type: 'img', src, id: inner.id });
      } else if (inner.type === 'html_link_l3') {
        const href = inner.getFieldValue('HREF') || '';
        const label = inner.getFieldValue('LABEL') || '';
        children.push({ type: 'a', href, label, id: inner.id });
      }
      inner = inner.getNextBlock();
    }
  }

  // Validation Logic Checks
  const hasContainer = isContainerPlaced;
  const headingChild = children.find((c) => c.type === 'h1');
  const hasHeading = !!headingChild && (headingChild.text || '').trim().length > 0;
  const headingText = headingChild?.text || '';

  const imageChild = children.find((c) => c.type === 'img');
  const imageSrc = imageChild?.src || null;
  const hasValidSeal = imageSrc === 'mars_seal.png';

  const linkChildren = children.filter((c) => c.type === 'a');
  const linkedDestinations = linkChildren.map((l) => l.href || '');
  const hasEarthLink = linkedDestinations.includes('earth_network.html');
  const hasVenusLink = linkedDestinations.includes('venus_network.html');
  const hasDecoys = linkedDestinations.some((href) =>
    ['solar_flare.html', 'deep_space.html', 'asteroid_belt.html'].includes(href)
  );

  let failErrorCode: 1 | 2 | 3 | 4 | null = null;
  let failErrorMessage: string | null = null;

  // Granular Fail-State Debugging Engine
  if (!hasContainer || (floatingBlocks.length > 0 && children.length === 0)) {
    failErrorCode = 1;
    failErrorMessage = 'Oh no! The pieces floated away! Put them all safely inside a Container.';
  } else if (!hasHeading) {
    failErrorCode = 2;
    failErrorMessage = "Who's calling? Add a Heading to tell them the message is from Mars!";
  } else if (!hasValidSeal) {
    failErrorCode = 3;
    failErrorMessage = "Wait, they don't believe it's us! Add the official Mars Seal image.";
  } else if (!hasEarthLink || !hasVenusLink || hasDecoys) {
    failErrorCode = 4;
    failErrorMessage = 'Where is the message going? Make sure you have Links targeting Earth and Venus!';
  }

  const isGoldenPath =
    hasContainer &&
    hasHeading &&
    hasValidSeal &&
    hasEarthLink &&
    hasVenusLink &&
    !hasDecoys &&
    floatingBlocks.length === 0;

  // Objective Checkpoints:
  // Objective 1: Enclose your message in a Container <div> structure
  const obj1Completed = hasContainer;
  // Objective 2: Include Heading <h1> and official Mars Seal <img>
  const obj2Completed = hasHeading && hasValidSeal;
  // Objective 3: Link live hyper-connections to Earth and Venus <a>
  const obj3Completed = hasEarthLink && hasVenusLink && !hasDecoys;

  let htmlCode = '';
  try {
    htmlCode = (javascriptGenerator as any).workspaceToCode(ws) || '';
  } catch {
    htmlCode = '';
  }

  return {
    state: {
      isContainerPlaced,
      children,
      floatingBlocks,
      hasErrors: failErrorCode !== null,
    },
    validation: {
      hasContainer,
      hasHeading,
      headingText,
      hasValidSeal,
      imageSrc,
      hasEarthLink,
      hasVenusLink,
      linkedDestinations,
      hasDecoys,
      isGoldenPath,
      failErrorCode,
      failErrorMessage,
      completedObjectives: [obj1Completed, obj2Completed, obj3Completed],
    },
    htmlCode,
  };
}
