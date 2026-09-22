import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

// Safe registration flag to avoid duplicate registrations
let isRegistered = false;

if (typeof window !== 'undefined') {
  const getElemByIdFallback = function (this: Element | DocumentFragment | SVGElement, id: string) {
    try {
      if (this.querySelector) {
        const found = this.querySelector(`[id="${id}"]`);
        if (found) return found;
      }
    } catch (e) {}
    return document.getElementById(id);
  };

  if (typeof Element !== 'undefined' && !(Element.prototype as any).getElementById) {
    (Element.prototype as any).getElementById = getElemByIdFallback;
  }
  if (typeof DocumentFragment !== 'undefined' && !(DocumentFragment.prototype as any).getElementById) {
    (DocumentFragment.prototype as any).getElementById = getElemByIdFallback;
  }
  if (typeof SVGElement !== 'undefined' && !(SVGElement.prototype as any).getElementById) {
    (SVGElement.prototype as any).getElementById = getElemByIdFallback;
  }
}

export interface MarsCampaignPreset {
  id: 'welcome' | 'pizza' | 'storm' | 'shuttle' | 'arcade';
  name: string;
  title: string;
  subtitle: string;
  body: string;
}

export const MARS_CAMPAIGN_PRESETS: MarsCampaignPreset[] = [
  {
    id: 'welcome',
    name: 'Colony Welcome',
    title: 'WELCOME TO MARS',
    subtitle: 'Habitat Dome 4 - Open 24/7',
    body: 'Visit our habitat dome and stay hydrated.'
  },
  {
    id: 'pizza',
    name: 'Pizza Delivery Ad',
    title: 'OLYMPUS PIZZA',
    subtitle: 'Hot slices fresh from the oven!',
    body: 'Fast delivery to every habitat dome.'
  },
  {
    id: 'storm',
    name: 'Dust Storm Warning',
    title: 'DUST STORM ALERT',
    subtitle: 'High winds approaching Sector 7',
    body: 'Take shelter inside the nearest dome.'
  },
  {
    id: 'shuttle',
    name: 'Shuttle Flight Board',
    title: 'EARTH SHUTTLE 404',
    subtitle: 'Now boarding Gate 3 - Spaceport',
    body: 'Landed safely. Pick up bags at Airlock 2.'
  },
  {
    id: 'arcade',
    name: 'Arcade Game Night',
    title: 'GALAXY ARCADE',
    subtitle: 'High scores, pixel games & prizes!',
    body: 'Play retro pixel games all night long.'
  }
];

let currentActivePresetId: 'welcome' | 'pizza' | 'storm' | 'shuttle' | 'arcade' = 'welcome';

export function setActiveMarsCampaign(presetId: string) {
  if (['welcome', 'pizza', 'storm', 'shuttle', 'arcade'].includes(presetId)) {
    currentActivePresetId = presetId as any;
  }
}

export function getActiveMarsCampaign(): MarsCampaignPreset {
  return MARS_CAMPAIGN_PRESETS.find(p => p.id === currentActivePresetId) || MARS_CAMPAIGN_PRESETS[0];
}

export function registerHtmlBlocks() {
  if (isRegistered || typeof window === 'undefined') return;
  isRegistered = true;

  // Title Options Dropdown with obvious theme badges & blank placeholder first
  const titleOptions: [string, string][] = [
    ['Select Title...', ''],
    ['🪐 Colony: "WELCOME TO MARS"', 'WELCOME TO MARS'],
    ['🍕 Pizza: "OLYMPUS PIZZA"', 'OLYMPUS PIZZA'],
    ['⚠️ Storm: "DUST STORM ALERT"', 'DUST STORM ALERT'],
    ['🚀 Shuttle: "EARTH SHUTTLE 404"', 'EARTH SHUTTLE 404'],
    ['👾 Arcade: "GALAXY ARCADE"', 'GALAXY ARCADE']
  ];

  // Subtitle Options Dropdown with obvious theme badges & blank placeholder first
  const subtitleOptions: [string, string][] = [
    ['Select Subtitle...', ''],
    ['🪐 Colony: "Habitat Dome 4 - Open 24/7"', 'Habitat Dome 4 - Open 24/7'],
    ['🍕 Pizza: "Hot slices fresh from the oven!"', 'Hot slices fresh from the oven!'],
    ['⚠️ Storm: "High winds approaching Sector 7"', 'High winds approaching Sector 7'],
    ['🚀 Shuttle: "Now boarding Gate 3 - Spaceport"', 'Now boarding Gate 3 - Spaceport'],
    ['👾 Arcade: "High scores, pixel games & prizes!"', 'High scores, pixel games & prizes!']
  ];

  // Body Options Dropdown with obvious theme badges & blank placeholder first
  const bodyOptions: [string, string][] = [
    ['Select Text...', ''],
    ['🪐 Colony: "Visit our habitat dome and stay hydrated."', 'Visit our habitat dome and stay hydrated.'],
    ['🍕 Pizza: "Fast delivery to every habitat dome."', 'Fast delivery to every habitat dome.'],
    ['⚠️ Storm: "Take shelter inside the nearest dome."', 'Take shelter inside the nearest dome.'],
    ['🚀 Shuttle: "Landed safely. Pick up bags at Airlock 2."', 'Landed safely. Pick up bags at Airlock 2.'],
    ['👾 Arcade: "Play retro pixel games all night long."', 'Play retro pixel games all night long.']
  ];

  // =========================================================================
  // 1. CONTENT BLOCKS (Dropdown Presets + Custom Text)
  // =========================================================================

  Blockly.Blocks['html_text_welcome'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(titleOptions), 'TITLE_VALUE');
      this.setOutput(true, 'String');
      this.setColour('#059669'); // Emerald
      this.setTooltip('Choose a big title for your billboard.');
    }
  };

  (javascriptGenerator as any).forBlock['html_text_welcome'] = function (block: any) {
    const val = block.getFieldValue('TITLE_VALUE') || '';
    return [val, (javascriptGenerator as any).ORDER_ATOMIC];
  };

  Blockly.Blocks['html_text_subtitle'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(subtitleOptions), 'SUBTITLE_VALUE');
      this.setOutput(true, 'String');
      this.setColour('#059669'); // Emerald
      this.setTooltip('Choose a subtitle for your billboard.');
    }
  };

  (javascriptGenerator as any).forBlock['html_text_subtitle'] = function (block: any) {
    const val = block.getFieldValue('SUBTITLE_VALUE') || '';
    return [val, (javascriptGenerator as any).ORDER_ATOMIC];
  };

  Blockly.Blocks['html_text_body'] = {
    init: function () {
      this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(bodyOptions), 'BODY_VALUE');
      this.setOutput(true, 'String');
      this.setColour('#059669'); // Emerald
      this.setTooltip('Choose description text for your billboard.');
    }
  };

  (javascriptGenerator as any).forBlock['html_text_body'] = function (block: any) {
    const val = block.getFieldValue('BODY_VALUE') || '';
    return [val, (javascriptGenerator as any).ORDER_ATOMIC];
  };

  // Generic custom text input block
  Blockly.Blocks['html_custom_text'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Custom Text:')
        .appendField(new Blockly.FieldTextInput('Custom billboard text'), 'TEXT');
      this.setOutput(true, 'String');
      this.setColour('#059669');
      this.setTooltip('Type your own words for your billboard.');
    }
  };

  (javascriptGenerator as any).forBlock['html_custom_text'] = function (block: any) {
    const text = block.getFieldValue('TEXT') || '';
    return [text, (javascriptGenerator as any).ORDER_ATOMIC];
  };

  // =========================================================================
  // 2. STRUCTURE & LAYOUT BLOCKS (Large Title {BLANK})
  // =========================================================================

  // Large Title (<h1>)
  Blockly.Blocks['html_h1'] = {
    init: function () {
      this.appendValueInput('CONTENT')
        .setCheck('String')
        .appendField('Large Title');
      this.setInputsInline(true);
      this.setPreviousStatement(true, 'HTML_ELEMENT');
      this.setNextStatement(true, 'HTML_ELEMENT');
      this.setColour('#E44D26'); // HTML Orange-Red
      this.setTooltip('Makes your title super big and bold.');
    }
  };

  (javascriptGenerator as any).forBlock['html_h1'] = function (block: any) {
    const content = (javascriptGenerator as any).valueToCode(block, 'CONTENT', (javascriptGenerator as any).ORDER_ATOMIC) || '';
    return `<h1>${content}</h1>\n`;
  };

  // Subtitle (<h3>)
  Blockly.Blocks['html_h3'] = {
    init: function () {
      this.appendValueInput('CONTENT')
        .setCheck('String')
        .appendField('Subtitle');
      this.setInputsInline(true);
      this.setPreviousStatement(true, 'HTML_ELEMENT');
      this.setNextStatement(true, 'HTML_ELEMENT');
      this.setColour('#F97316'); // Orange
      this.setTooltip('Makes a medium-sized subtitle.');
    }
  };

  (javascriptGenerator as any).forBlock['html_h3'] = function (block: any) {
    const content = (javascriptGenerator as any).valueToCode(block, 'CONTENT', (javascriptGenerator as any).ORDER_ATOMIC) || '';
    return `<h3>${content}</h3>\n`;
  };

  // Paragraph Text (<p>)
  Blockly.Blocks['html_p'] = {
    init: function () {
      this.appendValueInput('CONTENT')
        .setCheck('String')
        .appendField('Paragraph Text');
      this.setInputsInline(true);
      this.setPreviousStatement(true, 'HTML_ELEMENT');
      this.setNextStatement(true, 'HTML_ELEMENT');
      this.setColour('#0284C7'); // Sky Blue
      this.setTooltip('Adds normal reading text to your billboard.');
    }
  };

  (javascriptGenerator as any).forBlock['html_p'] = function (block: any) {
    const content = (javascriptGenerator as any).valueToCode(block, 'CONTENT', (javascriptGenerator as any).ORDER_ATOMIC) || '';
    return `<p>${content}</p>\n`;
  };

  // Divider Line (<hr>)
  Blockly.Blocks['html_hr'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Divider Line');
      this.setPreviousStatement(true, 'HTML_ELEMENT');
      this.setNextStatement(true, 'HTML_ELEMENT');
      this.setColour('#F59E0B'); // Amber
      this.setTooltip('Draws a glowing divider line across the billboard.');
    }
  };

  (javascriptGenerator as any).forBlock['html_hr'] = function () {
    return `<hr>\n`;
  };

  // New Line (<br>)
  Blockly.Blocks['html_br'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('New Line');
      this.setPreviousStatement(true, 'HTML_ELEMENT');
      this.setNextStatement(true, 'HTML_ELEMENT');
      this.setColour('#06B6D4'); // Cyan
      this.setTooltip('Jumps down to the next line.');
    }
  };

  (javascriptGenerator as any).forBlock['html_br'] = function () {
    return `<br>\n`;
  };

  // Container Box (<div>)
  Blockly.Blocks['html_div'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Container Box');
      this.appendStatementInput('CHILDREN')
        .setCheck('HTML_ELEMENT');
      this.setPreviousStatement(true, 'HTML_ELEMENT');
      this.setNextStatement(true, 'HTML_ELEMENT');
      this.setColour('#8B5CF6'); // Purple
      this.setTooltip('A box to group your billboard blocks together.');
    }
  };

  (javascriptGenerator as any).forBlock['html_div'] = function (block: any) {
    const children = (javascriptGenerator as any).statementToCode(block, 'CHILDREN') || '';
    return `<div>\n${children}</div>\n`;
  };

  // =========================================================================
  // 3. CREATIVE KIT WRAPPER BLOCKS (Modifier {BLANK})
  // =========================================================================

  // Bold (<b>)
  Blockly.Blocks['html_bold'] = {
    init: function () {
      this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('Bold');
      this.setInputsInline(true);
      this.setOutput(true, 'String');
      this.setColour('#E11D48'); // Rose
      this.setTooltip('Makes your text extra thick and bold.');
    }
  };

  (javascriptGenerator as any).forBlock['html_bold'] = function (block: any) {
    const inner = (javascriptGenerator as any).valueToCode(block, 'TEXT', (javascriptGenerator as any).ORDER_ATOMIC) || '';
    return [`<b>${inner}</b>`, (javascriptGenerator as any).ORDER_ATOMIC];
  };

  // Underline (<u>)
  Blockly.Blocks['html_underline'] = {
    init: function () {
      this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('Underline');
      this.setInputsInline(true);
      this.setOutput(true, 'String');
      this.setColour('#10B981'); // Emerald
      this.setTooltip('Draws a line under your words.');
    }
  };

  (javascriptGenerator as any).forBlock['html_underline'] = function (block: any) {
    const inner = (javascriptGenerator as any).valueToCode(block, 'TEXT', (javascriptGenerator as any).ORDER_ATOMIC) || '';
    return [`<u>${inner}</u>`, (javascriptGenerator as any).ORDER_ATOMIC];
  };

  // Highlight (<mark>)
  Blockly.Blocks['html_mark'] = {
    init: function () {
      this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('Highlight');
      this.setInputsInline(true);
      this.setOutput(true, 'String');
      this.setColour('#CA8A04'); // Yellow
      this.setTooltip('Highlights your words with bright yellow marker.');
    }
  };

  (javascriptGenerator as any).forBlock['html_mark'] = function (block: any) {
    const inner = (javascriptGenerator as any).valueToCode(block, 'TEXT', (javascriptGenerator as any).ORDER_ATOMIC) || '';
    return [`<mark>${inner}</mark>`, (javascriptGenerator as any).ORDER_ATOMIC];
  };

  // Cross Out (<del>)
  Blockly.Blocks['html_cross_out'] = {
    init: function () {
      this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('Cross Out');
      this.setInputsInline(true);
      this.setOutput(true, 'String');
      this.setColour('#EC4899'); // Pink
      this.setTooltip('Draws a line through your words to cross them out.');
    }
  };

  (javascriptGenerator as any).forBlock['html_cross_out'] = function (block: any) {
    const inner = (javascriptGenerator as any).valueToCode(block, 'TEXT', (javascriptGenerator as any).ORDER_ATOMIC) || '';
    return [`<del>${inner}</del>`, (javascriptGenerator as any).ORDER_ATOMIC];
  };
}

/**
 * Parses the workspace blocks into structured HTML elements for live preview & validation.
 */
export interface ParsedHtmlElement {
  tag: 'h1' | 'h3' | 'p' | 'div' | 'hr' | 'br' | 'unknown';
  content?: string;
  isNestedInDiv?: boolean;
  children?: ParsedHtmlElement[];
}

export interface MarsValidationResult {
  isValid: boolean;
  isInsideDiv: boolean;
  h1Content: string | null;
  h3Content: string | null;
  pContent: string | null;
  hasWelcomeInH1: boolean;
  hasTitleInH1: boolean;
  hasSubtitleInH3: boolean;
  hasBodyInP: boolean;
  hasModifier: boolean;
  hasDividerOrBreak: boolean;
  allNestedInDiv: boolean;
  detectedCampaignId?: 'welcome' | 'pizza' | 'storm' | 'shuttle' | 'arcade';
  errorMessage?: string;
  matchedCount: number; // 0, 1, 2, or 3 matching the chosen campaign theme
  modifierCount: number; // count of connected styling modifiers
  ratingScore: number; // 0 to 5 stars
  ratingRemarks: string;
}

export function parseWorkspaceHtml(workspace: Blockly.WorkspaceSvg | null): {
  elements: ParsedHtmlElement[];
  validation: MarsValidationResult;
  renderedHtml: string;
} {
  const result: ParsedHtmlElement[] = [];
  const validation: MarsValidationResult = {
    isValid: false,
    isInsideDiv: false,
    h1Content: null,
    h3Content: null,
    pContent: null,
    hasWelcomeInH1: false,
    hasTitleInH1: false,
    hasSubtitleInH3: false,
    hasBodyInP: false,
    hasModifier: false,
    hasDividerOrBreak: false,
    allNestedInDiv: false,
    detectedCampaignId: currentActivePresetId,
    matchedCount: 0,
    modifierCount: 0,
    ratingScore: 0,
    ratingRemarks: 'Assemble words that match your campaign theme!'
  };

  if (!workspace) {
    return { elements: result, validation, renderedHtml: '' };
  }

  let connectedModifierCount = 0;
  let hasConnectedDividerOrBreak = false;

  function extractValueText(block: Blockly.Block | null): string {
    if (!block) return '';
    const type = block.type;
    if (type === 'html_text_welcome') {
      return block.getFieldValue('TITLE_VALUE') || '';
    }
    if (type === 'html_text_subtitle') {
      return block.getFieldValue('SUBTITLE_VALUE') || '';
    }
    if (type === 'html_text_body') {
      return block.getFieldValue('BODY_VALUE') || '';
    }
    if (type === 'html_custom_text') {
      const raw = (block.getFieldValue('TEXT') || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      // Escape HTML entities to prevent XSS / raw script injection
      return raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    if (type === 'html_bold') {
      const child = block.getInputTargetBlock('TEXT');
      const inner = extractValueText(child);
      if (inner.replace(/<[^>]*>/g, '').trim().length > 0) {
        connectedModifierCount++;
      }
      return `<b>${inner}</b>`;
    }
    if (type === 'html_underline') {
      const child = block.getInputTargetBlock('TEXT');
      const inner = extractValueText(child);
      if (inner.replace(/<[^>]*>/g, '').trim().length > 0) {
        connectedModifierCount++;
      }
      return `<u>${inner}</u>`;
    }
    if (type === 'html_mark') {
      const child = block.getInputTargetBlock('TEXT');
      const inner = extractValueText(child);
      if (inner.replace(/<[^>]*>/g, '').trim().length > 0) {
        connectedModifierCount++;
      }
      return `<mark>${inner}</mark>`;
    }
    if (type === 'html_cross_out') {
      const child = block.getInputTargetBlock('TEXT');
      const inner = extractValueText(child);
      if (inner.replace(/<[^>]*>/g, '').trim().length > 0) {
        connectedModifierCount++;
      }
      return `<del>${inner}</del>`;
    }
    return '';
  }

  function processBlockList(topBlock: Blockly.Block | null, isInsideDiv = false): ParsedHtmlElement[] {
    const list: ParsedHtmlElement[] = [];
    let current: Blockly.Block | null = topBlock;

    while (current) {
      if (current.type === 'html_div') {
        const childTop = current.getInputTargetBlock('CHILDREN');
        const children = processBlockList(childTop, true);
        list.push({
          tag: 'div',
          isNestedInDiv: false,
          children
        });
        validation.isInsideDiv = true;
      } else if (current.type === 'html_h1') {
        const inputBlock = current.getInputTargetBlock('CONTENT');
        const text = extractValueText(inputBlock);
        list.push({ tag: 'h1', content: text, isNestedInDiv: isInsideDiv });
        validation.h1Content = text;
        const visible = text.replace(/<[^>]*>/g, '').trim();
        if (visible.length > 0) {
          validation.hasWelcomeInH1 = true;
          validation.hasTitleInH1 = true;
        }
      } else if (current.type === 'html_h3') {
        const inputBlock = current.getInputTargetBlock('CONTENT');
        const text = extractValueText(inputBlock);
        list.push({ tag: 'h3', content: text, isNestedInDiv: isInsideDiv });
        validation.h3Content = text;
        const visible = text.replace(/<[^>]*>/g, '').trim();
        if (visible.length > 0) {
          validation.hasSubtitleInH3 = true;
        }
      } else if (current.type === 'html_p') {
        const inputBlock = current.getInputTargetBlock('CONTENT');
        const text = extractValueText(inputBlock);
        list.push({ tag: 'p', content: text, isNestedInDiv: isInsideDiv });
        validation.pContent = text;
        const visible = text.replace(/<[^>]*>/g, '').trim();
        if (visible.length > 0) {
          validation.hasBodyInP = true;
        }
      } else if (current.type === 'html_hr') {
        connectedModifierCount++;
        hasConnectedDividerOrBreak = true;
        list.push({ tag: 'hr', isNestedInDiv: isInsideDiv });
      } else if (current.type === 'html_br') {
        connectedModifierCount++;
        hasConnectedDividerOrBreak = true;
        list.push({ tag: 'br', isNestedInDiv: isInsideDiv });
      }

      current = current.getNextBlock();
    }

    return list;
  }

  // Iterate over all top-level blocks in workspace
  const topBlocks = workspace.getTopBlocks(true);
  for (const block of topBlocks) {
    if (block.type.startsWith('html_')) {
      const parsed = processBlockList(block, false);
      result.push(...parsed);
    }
  }

  validation.hasModifier = connectedModifierCount > 0;
  validation.modifierCount = connectedModifierCount;
  validation.hasDividerOrBreak = hasConnectedDividerOrBreak;

  // Check if all 3 text elements are nested inside a div
  const divElement = result.find(el => el.tag === 'div');
  if (divElement && divElement.children) {
    const hasH1 = divElement.children.some(c => c.tag === 'h1' && (c.content || '').replace(/<[^>]*>/g, '').trim() !== '');
    const hasH3 = divElement.children.some(c => c.tag === 'h3' && (c.content || '').replace(/<[^>]*>/g, '').trim() !== '');
    const hasP = divElement.children.some(c => c.tag === 'p' && (c.content || '').replace(/<[^>]*>/g, '').trim() !== '');
    if (hasH1 && hasH3 && hasP) {
      validation.allNestedInDiv = true;
    }
  }

  // Flatten all parsed elements to detect hierarchy and duplicates
  function flattenElements(els: ParsedHtmlElement[]): ParsedHtmlElement[] {
    const flat: ParsedHtmlElement[] = [];
    for (const el of els) {
      flat.push(el);
      if (el.children) {
        flat.push(...flattenElements(el.children));
      }
    }
    return flat;
  }

  const allElements = flattenElements(result);
  const h1Elements = allElements.filter(el => el.tag === 'h1');
  const h3Elements = allElements.filter(el => el.tag === 'h3');
  const pElements = allElements.filter(el => el.tag === 'p');

  // Exact Theme-Matching and Diagnostics
  const activePreset = MARS_CAMPAIGN_PRESETS.find(p => p.id === currentActivePresetId) || MARS_CAMPAIGN_PRESETS[0];
  const targetTitle = activePreset.title.toLowerCase();
  const targetSubtitle = activePreset.subtitle.toLowerCase();
  const targetBody = activePreset.body.toLowerCase();

  const getVisibleText = (str?: string | null) => (str || '').replace(/<[^>]*>/g, '').trim().toLowerCase();

  // Check if at least one matching instance of each core role exists
  const hasMatchingTitle = h1Elements.some(el => getVisibleText(el.content) === targetTitle);
  const hasMatchingSubtitle = h3Elements.some(el => getVisibleText(el.content) === targetSubtitle);
  const hasMatchingBody = pElements.some(el => getVisibleText(el.content) === targetBody);

  // Check if any element contains blank, off-theme, or mismatched category text
  const allSubtitles = MARS_CAMPAIGN_PRESETS.map(p => p.subtitle.toLowerCase());
  const allBodies = MARS_CAMPAIGN_PRESETS.map(p => p.body.toLowerCase());
  const allTitles = MARS_CAMPAIGN_PRESETS.map(p => p.title.toLowerCase());

  let hasBlankElement = false;
  let hasOffThemeElement = false;
  let hasWrongCategoryElement = false;

  for (const el of allElements) {
    if (el.tag === 'h1' || el.tag === 'h3' || el.tag === 'p') {
      const vis = getVisibleText(el.content);
      if (vis.length === 0) {
        hasBlankElement = true;
      } else if (el.tag === 'h1') {
        if (vis !== targetTitle) {
          if (allSubtitles.includes(vis) || allBodies.includes(vis)) {
            hasWrongCategoryElement = true;
          } else {
            hasOffThemeElement = true;
          }
        }
      } else if (el.tag === 'h3') {
        if (vis !== targetSubtitle) {
          if (allTitles.includes(vis) || allBodies.includes(vis)) {
            hasWrongCategoryElement = true;
          } else {
            hasOffThemeElement = true;
          }
        }
      } else if (el.tag === 'p') {
        if (vis !== targetBody) {
          if (allTitles.includes(vis) || allSubtitles.includes(vis)) {
            hasWrongCategoryElement = true;
          } else {
            hasOffThemeElement = true;
          }
        }
      }
    }
  }

  let matched = 0;
  if (hasMatchingTitle) matched++;
  if (hasMatchingSubtitle) matched++;
  if (hasMatchingBody) matched++;
  validation.matchedCount = matched;

  // Director Vance Feedback & Rating Evaluation
  if (allElements.length === 0) {
    validation.ratingScore = 0;
    validation.ratingRemarks = "Your billboard is empty! Connect Title, Subtitle, and Text blocks to start.";
  } else if (hasBlankElement) {
    validation.ratingScore = 0;
    validation.ratingRemarks = "Some of your blocks are still blank! Select your text from the dropdowns.";
  } else if (matched === 0) {
    validation.ratingScore = 0;
    if (hasWrongCategoryElement) {
      validation.ratingRemarks = "None of your blocks match the theme! Match Title with Large Title, Subtitle with Subtitle, and Text with Paragraph.";
    } else {
      validation.ratingRemarks = "None of your words match the chosen theme. Pick words that fit your campaign!";
    }
  } else if (matched === 1) {
    validation.ratingScore = 1;
    if (hasWrongCategoryElement) {
      validation.ratingRemarks = "One of your blocks has the wrong text type! Match Title with Large Title, Subtitle with Subtitle, and Text with Paragraph.";
    } else {
      validation.ratingRemarks = "Only 1 line matches the theme. Pick words that fit your campaign!";
    }
  } else if (matched === 2) {
    validation.ratingScore = 2;
    if (hasWrongCategoryElement) {
      validation.ratingRemarks = "One of your blocks has the wrong text type! Match Title with Large Title, Subtitle with Subtitle, and Text with Paragraph.";
    } else {
      validation.ratingRemarks = "Almost there! 1 of your lines doesn't match the chosen theme.";
    }
  } else if (matched === 3) {
    if (connectedModifierCount >= 2) {
      validation.ratingScore = 5;
      validation.ratingRemarks = "Awesome job! Your message matches the theme and your design looks great!";
    } else if (connectedModifierCount === 1) {
      validation.ratingScore = 4;
      validation.ratingRemarks = "Looking good! Add 1 more styling touch to get a perfect score!";
    } else {
      validation.ratingScore = 3;
      validation.ratingRemarks = "Good message! Try adding some styling like bold or highlights next time.";
    }
  } else {
    validation.ratingScore = 0;
    validation.ratingRemarks = "Make sure your Title, Subtitle, and Text match your campaign!";
  }

  // Generate clean rendered HTML preview
  function renderElements(elements: ParsedHtmlElement[], indent = 0): string {
    const pad = '  '.repeat(indent);
    return elements.map(el => {
      if (el.tag === 'div') {
        const inner = el.children && el.children.length > 0 
          ? '\n' + renderElements(el.children, indent + 1) + '\n' + pad 
          : '';
        return `${pad}<div>${inner}</div>`;
      }
      if (el.tag === 'hr') {
        return `${pad}<hr>`;
      }
      if (el.tag === 'br') {
        return `${pad}<br>`;
      }
      return `${pad}<${el.tag}>${el.content || ''}</${el.tag}>`;
    }).join('\n');
  }

  const renderedHtml = renderElements(result);

  return {
    elements: result,
    validation,
    renderedHtml
  };
}
