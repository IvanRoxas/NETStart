import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export type Venus2PanelId = 'panel-1' | 'panel-2' | 'panel-3' | 'panel-4' | 'panel-5';

export interface Venus2PanelStyle {
  target: Venus2PanelId;
  display: 'flex' | 'block' | 'none';
  justifyContent: 'flex-start' | 'center' | 'space-evenly' | 'flex-end';
  alignItems: 'flex-start' | 'center' | 'flex-end';
  hasContainer: boolean;
  hasDisplay?: boolean;
  hasJustify?: boolean;
  hasAlign?: boolean;
}

export interface VenusLevel2Validation {
  panel1: Venus2PanelStyle & { isValid: boolean };
  panel2: Venus2PanelStyle & { isValid: boolean };
  panel3: Venus2PanelStyle & { isValid: boolean };
  panel4: Venus2PanelStyle & { isValid: boolean };
  panel5: Venus2PanelStyle & { isValid: boolean };
  activePanel: number;
  currentPanelValid: boolean;
  failErrorMessage?: string;
  allSolved: boolean;
}

export const INITIAL_VENUS_LEVEL_2_VALIDATION: VenusLevel2Validation = {
  panel1: {
    target: 'panel-1',
    display: 'none',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    hasContainer: false,
    hasDisplay: false,
    hasJustify: false,
    hasAlign: false,
    isValid: false,
  },
  panel2: {
    target: 'panel-2',
    display: 'none',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    hasContainer: false,
    hasDisplay: false,
    hasJustify: false,
    hasAlign: false,
    isValid: false,
  },
  panel3: {
    target: 'panel-3',
    display: 'none',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    hasContainer: false,
    hasDisplay: false,
    hasJustify: false,
    hasAlign: false,
    isValid: false,
  },
  panel4: {
    target: 'panel-4',
    display: 'none',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    hasContainer: false,
    hasDisplay: false,
    hasJustify: false,
    hasAlign: false,
    isValid: false,
  },
  panel5: {
    target: 'panel-5',
    display: 'none',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    hasContainer: false,
    hasDisplay: false,
    hasJustify: false,
    hasAlign: false,
    isValid: false,
  },
  activePanel: 1,
  currentPanelValid: false,
  allSolved: false,
};

let blocksRegistered = false;

export function registerVenusLevel2Blocks() {
  if (blocksRegistered) return;
  blocksRegistered = true;

  // 1. Container Wrapper Block: Target Screen #panel-1 through #panel-5
  Blockly.Blocks['venus2_target_panel'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Target Screen:')
        .appendField(
          new Blockly.FieldDropdown([
            ['#panel-1', 'panel-1'],
            ['#panel-2', 'panel-2'],
            ['#panel-3', 'panel-3'],
            ['#panel-4', 'panel-4'],
            ['#panel-5', 'panel-5'],
          ]),
          'PANEL_ID'
        );
      this.appendStatementInput('STYLES')
        .setCheck('Venus2Style');
      this.setColour('#8B5CF6'); // Purple container
      this.setTooltip('The control panel box. Snap layout blocks inside!');
    },
  };

  (javascriptGenerator as any).forBlock['venus2_target_panel'] = function (block: Blockly.Block) {
    const panelId = block.getFieldValue('PANEL_ID') || 'panel-1';
    let code = `#${panelId} {\n`;
    let child = block.getInputTargetBlock('STYLES');
    while (child) {
      if (child.type === 'venus2_style_display') {
        const displayVal = child.getFieldValue('DISPLAY') || 'flex';
        code += `  display: ${displayVal};\n`;
      } else if (child.type === 'venus2_style_justify') {
        const justifyVal = child.getFieldValue('JUSTIFY') || 'flex-start';
        code += `  justify-content: ${justifyVal};\n`;
      } else if (child.type === 'venus2_style_align') {
        const alignVal = child.getFieldValue('ALIGN') || 'flex-start';
        code += `  align-items: ${alignVal};\n`;
      }
      child = child.getNextBlock();
    }
    code += `}\n\n`;
    return code;
  };

  // 2. [ Format: Side-by-Side | Stacked ]
  Blockly.Blocks['venus2_style_display'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Format:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Side-by-Side', 'flex'],
            ['Stacked', 'block'],
          ]),
          'DISPLAY'
        );
      this.setPreviousStatement(true, 'Venus2Style');
      this.setNextStatement(true, 'Venus2Style');
      this.setColour('#06B6D4'); // Cyan
      this.setTooltip('Choose Side-by-Side for a row, or Stacked for a column.');
    },
  };

  (javascriptGenerator as any).forBlock['venus2_style_display'] = function (block: Blockly.Block) {
    const val = block.getFieldValue('DISPLAY') || 'flex';
    return `  display: ${val};\n`;
  };

  // 3. [ Horizontal: Spread Evenly | Center | Align Left | Align Right ]
  Blockly.Blocks['venus2_style_justify'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Horizontal:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Spread Evenly', 'space-evenly'],
            ['Center', 'center'],
            ['Align Left', 'flex-start'],
            ['Align Right', 'flex-end'],
          ]),
          'JUSTIFY'
        );
      this.setPreviousStatement(true, 'Venus2Style');
      this.setNextStatement(true, 'Venus2Style');
      this.setColour('#3B82F6'); // Blue
      this.setTooltip('Moves items left, center, right, or spaces them out evenly.');
    },
  };

  (javascriptGenerator as any).forBlock['venus2_style_justify'] = function (block: Blockly.Block) {
    const val = block.getFieldValue('JUSTIFY') || 'flex-start';
    return `  justify-content: ${val};\n`;
  };

  // 4. [ Vertical: Top | Center | Bottom ]
  Blockly.Blocks['venus2_style_align'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Vertical:')
        .appendField(
          new Blockly.FieldDropdown([
            ['Top', 'flex-start'],
            ['Center', 'center'],
            ['Bottom', 'flex-end'],
          ]),
          'ALIGN'
        );
      this.setPreviousStatement(true, 'Venus2Style');
      this.setNextStatement(true, 'Venus2Style');
      this.setColour('#10B981'); // Emerald
      this.setTooltip('Moves items to the top, center, or bottom.');
    },
  };

  (javascriptGenerator as any).forBlock['venus2_style_align'] = function (block: Blockly.Block) {
    const val = block.getFieldValue('ALIGN') || 'flex-start';
    return `  align-items: ${val};\n`;
  };
}

export function getVenusLevel2Toolbox(activePanel: number = 1) {
  const safePanel = Math.min(5, Math.max(1, activePanel));
  const panelKey = `panel-${safePanel}` as Venus2PanelId;

  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Target',
        colour: '#8B5CF6',
        contents: [
          {
            kind: 'block',
            type: 'venus2_target_panel',
            fields: {
              PANEL_ID: panelKey,
            },
          },
        ],
      },
      {
        kind: 'category',
        name: 'Layout',
        colour: '#06B6D4',
        contents: [
          {
            kind: 'block',
            type: 'venus2_style_display',
            fields: {
              DISPLAY: 'flex',
            },
          },
        ],
      },
      {
        kind: 'category',
        name: 'Horizontal',
        colour: '#3B82F6',
        contents: [
          {
            kind: 'block',
            type: 'venus2_style_justify',
            fields: {
              JUSTIFY: 'flex-start',
            },
          },
        ],
      },
      {
        kind: 'category',
        name: 'Vertical',
        colour: '#10B981',
        contents: [
          {
            kind: 'block',
            type: 'venus2_style_align',
            fields: {
              ALIGN: 'flex-start',
            },
          },
        ],
      },
    ],
  };
}

export const VENUS_LEVEL_2_CANONICAL_CSS: Record<Venus2PanelId, string> = {
  'panel-1': `#panel-1 {\n  display: block;\n  justify-content: center;\n}`,
  'panel-2': `#panel-2 {\n  display: flex;\n  justify-content: space-evenly;\n  align-items: flex-start;\n}`,
  'panel-3': `#panel-3 {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}`,
  'panel-4': `#panel-4 {\n  display: block;\n  justify-content: flex-end;\n}`,
  'panel-5': `#panel-5 {\n  display: flex;\n  justify-content: space-evenly;\n  align-items: flex-end;\n}`,
};

export function generateVenusLevel2FullCss(
  workspace?: Blockly.Workspace | null,
  activePanel: number = 1,
  solvedPanels: { 1: boolean; 2: boolean; 3: boolean; 4: boolean; 5: boolean } = { 1: false, 2: false, 3: false, 4: false, 5: false }
): string {
  const parsedMap: Partial<Record<Venus2PanelId, string>> = {};
  if (workspace) {
    const topBlocks = workspace.getTopBlocks(false);
    for (const block of topBlocks) {
      if (block.type === 'venus2_target_panel') {
        const panelId = (block.getFieldValue('PANEL_ID') || 'panel-1') as Venus2PanelId;
        let child = block.getInputTargetBlock('STYLES');
        const lines: string[] = [];
        while (child) {
          if (child.type === 'venus2_style_display') {
            lines.push(`  display: ${child.getFieldValue('DISPLAY') || 'flex'};`);
          } else if (child.type === 'venus2_style_justify') {
            lines.push(`  justify-content: ${child.getFieldValue('JUSTIFY') || 'flex-start'};`);
          } else if (child.type === 'venus2_style_align') {
            lines.push(`  align-items: ${child.getFieldValue('ALIGN') || 'flex-start'};`);
          }
          child = child.getNextBlock();
        }
        if (lines.length > 0) {
          parsedMap[panelId] = `#${panelId} {\n${lines.join('\n')}\n}`;
        }
      }
    }
  }

  const allSolved = Boolean(solvedPanels[1] && solvedPanels[2] && solvedPanels[3] && solvedPanels[4] && solvedPanels[5]);

  if (allSolved) {
    const panelIds: Venus2PanelId[] = ['panel-1', 'panel-2', 'panel-3', 'panel-4', 'panel-5'];
    return panelIds.map(pid => parsedMap[pid] || VENUS_LEVEL_2_CANONICAL_CSS[pid]).join('\n\n');
  }

  const userBlocksCss = Object.values(parsedMap);
  if (userBlocksCss.length > 0) {
    return userBlocksCss.join('\n\n');
  }

  const solvedBlocks: string[] = [];
  ([1, 2, 3, 4, 5] as const).forEach(num => {
    if (solvedPanels[num]) {
      const pid = `panel-${num}` as Venus2PanelId;
      solvedBlocks.push(VENUS_LEVEL_2_CANONICAL_CSS[pid]);
    }
  });

  if (solvedBlocks.length > 0) {
    return solvedBlocks.join('\n\n');
  }

  const currentPid = `panel-${Math.min(5, Math.max(1, activePanel))}` as Venus2PanelId;
  return VENUS_LEVEL_2_CANONICAL_CSS[currentPid];
}

export function parseVenusLevel2Workspace(
  workspace: Blockly.Workspace,
  activePanel: number = 1,
  solvedPanels: { 1: boolean; 2: boolean; 3: boolean; 4: boolean; 5: boolean } = { 1: false, 2: false, 3: false, 4: false, 5: false }
): {
  validation: VenusLevel2Validation;
  cssCode: string;
} {
  registerVenusLevel2Blocks();

  const panelsData: Record<Venus2PanelId, Venus2PanelStyle> = {
    'panel-1': {
      target: 'panel-1',
      display: 'none',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      hasContainer: false,
      hasJustify: false,
      hasAlign: false,
    },
    'panel-2': {
      target: 'panel-2',
      display: 'none',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      hasContainer: false,
      hasJustify: false,
      hasAlign: false,
    },
    'panel-3': {
      target: 'panel-3',
      display: 'none',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      hasContainer: false,
      hasJustify: false,
      hasAlign: false,
    },
    'panel-4': {
      target: 'panel-4',
      display: 'none',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      hasContainer: false,
      hasJustify: false,
      hasAlign: false,
    },
    'panel-5': {
      target: 'panel-5',
      display: 'none',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      hasContainer: false,
      hasJustify: false,
      hasAlign: false,
    },
  };

  const topBlocks = workspace.getTopBlocks(false);
  let generatedCss = '';

  for (const block of topBlocks) {
    if (block.type === 'venus2_target_panel') {
      const panelId = (block.getFieldValue('PANEL_ID') || 'panel-1') as Venus2PanelId;
      if (panelsData[panelId]) {
        let child = block.getInputTargetBlock('STYLES');
        // If this panel already has valid configured styles, do not overwrite with an empty duplicate block
        if (!child && panelsData[panelId].hasContainer && panelsData[panelId].display !== 'none') {
          continue;
        }

        panelsData[panelId].hasContainer = true;
        let hasDisplay = false;
        let hasJustify = false;
        let hasAlign = false;
        let blockCss = `#${panelId} {\n`;

        while (child) {
          if (child.type === 'venus2_style_display') {
            hasDisplay = true;
            const d = child.getFieldValue('DISPLAY') as 'flex' | 'block';
            panelsData[panelId].display = d;
            blockCss += `  display: ${d};\n`;
          } else if (child.type === 'venus2_style_justify') {
            hasJustify = true;
            const j = child.getFieldValue('JUSTIFY') as 'flex-start' | 'center' | 'space-evenly' | 'flex-end';
            panelsData[panelId].justifyContent = j;
            blockCss += `  justify-content: ${j};\n`;
          } else if (child.type === 'venus2_style_align') {
            hasAlign = true;
            const a = child.getFieldValue('ALIGN') as 'flex-start' | 'center' | 'flex-end';
            panelsData[panelId].alignItems = a;
            blockCss += `  align-items: ${a};\n`;
          }
          child = child.getNextBlock();
        }

        panelsData[panelId].hasDisplay = hasDisplay;
        panelsData[panelId].hasJustify = hasJustify;
        panelsData[panelId].hasAlign = hasAlign;

        blockCss += `}\n\n`;
        generatedCss += blockCss;
      }
    }
  }

  // 5 Panels Solutions (Every panel requires specific combined blocks):
  // Panel 1: Centered Vertical Stack (block + justify-content: center)
  const panel1Valid =
    panelsData['panel-1'].hasContainer &&
    Boolean(panelsData['panel-1'].hasDisplay) &&
    panelsData['panel-1'].display === 'block' &&
    Boolean(panelsData['panel-1'].hasJustify) &&
    panelsData['panel-1'].justifyContent === 'center';

  // Panel 2: Top Spread (flex + space-evenly + flex-start) -> 4 blocks total
  const panel2Valid =
    panelsData['panel-2'].hasContainer &&
    Boolean(panelsData['panel-2'].hasDisplay) &&
    panelsData['panel-2'].display === 'flex' &&
    Boolean(panelsData['panel-2'].hasJustify) &&
    panelsData['panel-2'].justifyContent === 'space-evenly' &&
    Boolean(panelsData['panel-2'].hasAlign) &&
    panelsData['panel-2'].alignItems === 'flex-start';

  // Panel 3: Dead Center (flex + center + center) -> 4 blocks total
  const panel3Valid =
    panelsData['panel-3'].hasContainer &&
    Boolean(panelsData['panel-3'].hasDisplay) &&
    panelsData['panel-3'].display === 'flex' &&
    Boolean(panelsData['panel-3'].hasJustify) &&
    panelsData['panel-3'].justifyContent === 'center' &&
    Boolean(panelsData['panel-3'].hasAlign) &&
    panelsData['panel-3'].alignItems === 'center';

  // Panel 4: Right Vertical Stack (block + Align Right)
  const panel4Valid =
    panelsData['panel-4'].hasContainer &&
    Boolean(panelsData['panel-4'].hasDisplay) &&
    panelsData['panel-4'].display === 'block' &&
    Boolean(panelsData['panel-4'].hasJustify) &&
    panelsData['panel-4'].justifyContent === 'flex-end';

  // Panel 5: Bottom Spread (flex + Spread Evenly + Bottom) -> 4 blocks total
  const panel5Valid =
    panelsData['panel-5'].hasContainer &&
    Boolean(panelsData['panel-5'].hasDisplay) &&
    panelsData['panel-5'].display === 'flex' &&
    Boolean(panelsData['panel-5'].hasJustify) &&
    panelsData['panel-5'].justifyContent === 'space-evenly' &&
    Boolean(panelsData['panel-5'].hasAlign) &&
    panelsData['panel-5'].alignItems === 'flex-end';

  // Validation based on active panel without spoonfeeding solutions
  let currentPanelValid = false;
  let failErrorMessage: string | undefined;

  const currentPanelId = `panel-${Math.min(5, Math.max(1, activePanel))}` as Venus2PanelId;
  const currentData = panelsData[currentPanelId];

  if (solvedPanels[activePanel as 1 | 2 | 3 | 4 | 5]) {
    currentPanelValid = true;
  } else if (!currentData.hasContainer) {
    currentPanelValid = false;
  } else if (activePanel === 1) {
    currentPanelValid = panel1Valid;
  } else if (activePanel === 2) {
    currentPanelValid = panel2Valid;
  } else if (activePanel === 3) {
    currentPanelValid = panel3Valid;
  } else if (activePanel === 4) {
    currentPanelValid = panel4Valid;
  } else if (activePanel === 5) {
    currentPanelValid = panel5Valid;
  }

  const allSolved =
    (panel1Valid || solvedPanels[1]) &&
    (panel2Valid || solvedPanels[2]) &&
    (panel3Valid || solvedPanels[3]) &&
    (panel4Valid || solvedPanels[4]) &&
    (panel5Valid || solvedPanels[5]);

  let finalCss = generatedCss.trim();
  if (allSolved) {
    finalCss = generateVenusLevel2FullCss(workspace, activePanel, { 1: true, 2: true, 3: true, 4: true, 5: true });
  } else if (!finalCss) {
    finalCss = generateVenusLevel2FullCss(workspace, activePanel, solvedPanels);
  }

  return {
    validation: {
      panel1: { ...panelsData['panel-1'], isValid: panel1Valid || solvedPanels[1] },
      panel2: { ...panelsData['panel-2'], isValid: panel2Valid || solvedPanels[2] },
      panel3: { ...panelsData['panel-3'], isValid: panel3Valid || solvedPanels[3] },
      panel4: { ...panelsData['panel-4'], isValid: panel4Valid || solvedPanels[4] },
      panel5: { ...panelsData['panel-5'], isValid: panel5Valid || solvedPanels[5] },
      activePanel,
      currentPanelValid,
      failErrorMessage,
      allSolved,
    },
    cssCode: finalCss,
  };
}
