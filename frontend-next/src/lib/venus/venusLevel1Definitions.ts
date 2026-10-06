import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export interface TargetStyleData {
  present: boolean;
  color?: string | null;
  borderWidth?: number | null;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | null;
  borderColor?: string | null;
  fontFamily?: string | null;
  fontSize?: number | null;
  textColor?: string | null;
  textContent?: string | null;
}

export const createDefaultTargetStyle = (): TargetStyleData => ({
  present: false,
  color: null,
  borderWidth: null,
  borderStyle: null,
  borderColor: null,
  fontFamily: null,
  fontSize: null,
  textColor: null,
  textContent: null,
});

export interface VenusLevel1Validation {
  // Furniture presence in sandbox
  hasComputer: boolean;
  hasChair: boolean;
  hasDesk: boolean;
  hasPlant: boolean;
  hasCabinet: boolean;
  hasBall?: boolean;
  hasCarpet: boolean;
  hasCaption: boolean;
  hasWalls: boolean;
  hasFloor: boolean;
  hasWindow?: boolean;

  // Styled booleans
  isComputerStyled: boolean;
  isChairStyled: boolean;
  isDeskStyled: boolean;
  isWallsStyled?: boolean;
  isFloorStyled?: boolean;
  isWindowStyled?: boolean;
  isPlantStyled?: boolean;
  isCabinetStyled?: boolean;
  isBallStyled?: boolean;
  isCarpetStyled?: boolean;
  isCaptionStyled?: boolean;

  computerValid: boolean;
  chairValid: boolean;
  deskValid: boolean;
  wallsValid?: boolean;
  floorValid?: boolean;
  windowValid?: boolean;
  plantValid?: boolean;
  cabinetValid?: boolean;
  ballValid?: boolean;
  carpetValid?: boolean;
  captionValid?: boolean;

  // Direct color helpers
  computerColor: string | null;
  chairColor: string | null;
  deskColor: string | null;
  wallsColor?: string | null;
  floorColor?: string | null;
  windowColor?: string | null;
  plantColor?: string | null;
  cabinetColor?: string | null;
  ballColor?: string | null;
  carpetColor?: string | null;
  captionColor?: string | null;
  captionText?: string;

  // Creative Minigame Goal Helpers
  totalStyled: number;
  hasAnyBorder: boolean;
  typographyMismatches?: string[];

  // Complete style data per target
  styles: Record<string, TargetStyleData>;

  isAllStyled: boolean;
  failErrorMessage?: string;
  hasBlocks: boolean;
}

export const VENUS_PRESET_COLORS: { name: string; hex: string }[] = [
  { name: 'Pastel Orange (Brand)', hex: '#FFB347' },
  { name: 'Neon Green', hex: '#00FF66' },
  { name: 'Electric Cyan', hex: '#00F0FF' },
  { name: 'Hot Pink', hex: '#FF007F' },
  { name: 'Cyber Yellow', hex: '#FFE600' },
  { name: 'Neon Purple', hex: '#A855F7' },
  { name: 'Vivid Orange', hex: '#F97316' },
  { name: 'Crimson Red', hex: '#EF4444' },
  { name: 'Cosmic Blue', hex: '#3B82F6' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Custom Blockly Field featuring a circular color wheel swatch with hover glow,
 * real-time native OS color picker (<input type="color">), spectrum slider, and space preset palette dropdown.
 */
export class FieldColorWheel extends Blockly.Field<string> {
  public static activeSector: string | null = null;
  public static sectorPalettes: Record<
    string,
    {
      sectorId: string;
      sectorName: string;
      themeTitle: string;
      themeDescription: string;
      accentColor: string;
      colors: { name: string; hex: string; target?: string; description: string }[];
    }
  > | null = null;

  private swatchElement_: SVGElement | null = null;
  private hexTextElement_: SVGElement | null = null;
  private arrowElement_: SVGElement | null = null;
  private pillRect_: SVGElement | null = null;

  constructor(value: string = '#00FF66', validator?: any) {
    super(value, validator);
    this.SERIALIZABLE = true;
  }

  static fromJson(options: any) {
    return new FieldColorWheel(options['colour'] || options['color'] || '#00FF66');
  }

  protected initView(): void {
    if (!this.fieldGroup_) return;

    // Background pill container
    this.pillRect_ = Blockly.utils.dom.createSvgElement(
      'rect',
      {
        rx: 6,
        ry: 6,
        x: 0,
        y: 0,
        height: 24,
        width: 110,
        fill: '#0f172a',
        stroke: '#38bdf8',
        'stroke-width': '1.5',
        'stroke-opacity': '0.7',
        class: 'venus-color-pill',
        style: 'cursor: pointer;',
      },
      this.fieldGroup_
    );

    // Color Swatch Circle (Clean circular swatch with crisp white border)
    this.swatchElement_ = Blockly.utils.dom.createSvgElement(
      'circle',
      {
        cx: 14,
        cy: 12,
        r: 7.5,
        fill: this.getValue() || '#00FF66',
        stroke: '#ffffff',
        'stroke-width': '1.5',
        class: 'venus-color-swatch',
        style: 'cursor: pointer; transition: all 0.15s ease;',
      },
      this.fieldGroup_
    );

    // Monospace Hex Code Text
    this.hexTextElement_ = Blockly.utils.dom.createSvgElement(
      'text',
      {
        x: 28,
        y: 16,
        fill: '#f8fafc',
        'font-family': 'monospace',
        'font-size': '11px',
        'font-weight': 'bold',
        class: 'venus-hex-text',
        style: 'cursor: pointer;',
      },
      this.fieldGroup_
    );
    if (this.hexTextElement_) {
      this.hexTextElement_.textContent = (this.getValue() || '#00FF66').toUpperCase();
    }

    // Dropdown Arrow
    this.arrowElement_ = Blockly.utils.dom.createSvgElement(
      'polygon',
      {
        points: '96,10 102,10 99,15',
        fill: '#94a3b8',
        style: 'cursor: pointer;',
      },
      this.fieldGroup_
    );

    this.size_ = new Blockly.utils.Size(110, 24);

    // Hover effect on the field group
    this.fieldGroup_.addEventListener('mouseenter', () => {
      if (this.pillRect_) {
        this.pillRect_.setAttribute('stroke', '#00f0ff');
        this.pillRect_.setAttribute('stroke-opacity', '1');
        this.pillRect_.style.filter = 'drop-shadow(0 0 6px rgba(0, 240, 255, 0.7))';
      }
      if (this.swatchElement_) {
        this.swatchElement_.style.filter = 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.9))';
      }
    });

    this.fieldGroup_.addEventListener('mouseleave', () => {
      if (this.pillRect_) {
        this.pillRect_.setAttribute('stroke', '#38bdf8');
        this.pillRect_.setAttribute('stroke-opacity', '0.7');
        this.pillRect_.style.filter = 'none';
      }
      if (this.swatchElement_) {
        this.swatchElement_.style.filter = 'none';
      }
    });
  }

  protected render_(): void {
    const val = (this.getValue() || '#00FF66').toUpperCase();
    if (this.swatchElement_) {
      this.swatchElement_.setAttribute('fill', val);
    }
    if (this.hexTextElement_) {
      this.hexTextElement_.textContent = val;
    }
  }

  protected showEditor_(): void {
    const div = Blockly.DropDownDiv.getContentDiv();
    div.innerHTML = '';
    div.className = 'venus-color-dropdown-menu';
    div.style.backgroundColor = '#0b0f19';
    div.style.color = '#f8fafc';
    div.style.padding = '12px';
    div.style.borderRadius = '12px';
    div.style.border = '1px solid rgba(56, 189, 248, 0.4)';
    div.style.boxShadow = '0 12px 30px -5px rgba(0, 0, 0, 0.9), 0 0 15px rgba(56, 189, 248, 0.3)';
    div.style.width = '220px';
    div.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    const currentVal = (this.getValue() || '#00FF66').toUpperCase();

    // 1. Presets Header
    const presetsLabel = document.createElement('div');
    presetsLabel.textContent = 'RECOMMENDED';
    presetsLabel.style.fontSize = '9px';
    presetsLabel.style.fontWeight = 'bold';
    presetsLabel.style.letterSpacing = '0.08em';
    presetsLabel.style.color = '#94a3b8';
    presetsLabel.style.marginBottom = '8px';
    div.appendChild(presetsLabel);

    // 2. Grid of Preset Swatches (5 columns x 2 rows)
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    grid.style.gap = '8px';
    grid.style.marginBottom = '12px';

    const activeSectorKey = FieldColorWheel.activeSector;
    const colorList = (activeSectorKey && FieldColorWheel.sectorPalettes?.[activeSectorKey])
      ? FieldColorWheel.sectorPalettes[activeSectorKey].colors
      : VENUS_PRESET_COLORS;

    colorList.forEach((preset: any) => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.title = `${preset.name} (${preset.hex})${preset.target ? ' • Best for ' + preset.target : ''}`;
      swatch.style.width = '32px';
      swatch.style.height = '32px';
      swatch.style.borderRadius = '50%';
      swatch.style.backgroundColor = preset.hex;
      swatch.style.border = currentVal === preset.hex.toUpperCase() ? '2.5px solid #ffffff' : '1.5px solid rgba(255,255,255,0.2)';
      swatch.style.boxShadow = currentVal === preset.hex.toUpperCase() ? `0 0 10px ${preset.hex}` : 'none';
      swatch.style.cursor = 'pointer';
      swatch.style.transition = 'all 0.15s ease';

      swatch.onmouseenter = () => {
        swatch.style.transform = 'scale(1.12)';
        swatch.style.boxShadow = `0 0 10px ${preset.hex}`;
      };
      swatch.onmouseleave = () => {
        swatch.style.transform = 'scale(1)';
        swatch.style.boxShadow = currentVal === preset.hex.toUpperCase() ? `0 0 10px ${preset.hex}` : 'none';
      };

      swatch.onclick = () => {
        this.applyColorChange(preset.hex);
        Blockly.DropDownDiv.hideWithoutAnimation();
      };

      grid.appendChild(swatch);
    });
    div.appendChild(grid);

    // 3. Custom Header
    const customLabel = document.createElement('div');
    customLabel.textContent = 'CUSTOM';
    customLabel.style.fontSize = '9px';
    customLabel.style.fontWeight = 'bold';
    customLabel.style.letterSpacing = '0.08em';
    customLabel.style.color = '#94a3b8';
    customLabel.style.marginBottom = '6px';
    div.appendChild(customLabel);

    // 4. Custom Color Row: [ Dot ] [ #HEX Input ] [ 🎨 Wheel ]
    const customRow = document.createElement('div');
    customRow.style.display = 'flex';
    customRow.style.alignItems = 'center';
    customRow.style.gap = '8px';
    customRow.style.padding = '4px 6px';
    customRow.style.background = 'rgba(15, 23, 42, 0.9)';
    customRow.style.borderRadius = '8px';
    customRow.style.border = '1px solid rgba(56, 189, 248, 0.3)';

    // Clickable live swatch dot
    const previewDot = document.createElement('div');
    previewDot.style.width = '20px';
    previewDot.style.height = '20px';
    previewDot.style.borderRadius = '50%';
    previewDot.style.backgroundColor = currentVal;
    previewDot.style.border = '1.5px solid #ffffff';
    previewDot.style.flexShrink = '0';
    previewDot.style.cursor = 'pointer';
    previewDot.title = 'Open Color Wheel';

    // Hex text input
    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.maxLength = 7;
    hexInput.value = currentVal;
    hexInput.style.flex = '1';
    hexInput.style.minWidth = '0';
    hexInput.style.background = 'transparent';
    hexInput.style.border = 'none';
    hexInput.style.color = '#f8fafc';
    hexInput.style.fontFamily = 'monospace';
    hexInput.style.fontSize = '12px';
    hexInput.style.fontWeight = 'bold';
    hexInput.style.outline = 'none';

    // Wheel button container with overlaid native color input
    const wheelBtnContainer = document.createElement('div');
    wheelBtnContainer.style.position = 'relative';
    wheelBtnContainer.style.display = 'inline-flex';
    wheelBtnContainer.style.alignItems = 'center';
    wheelBtnContainer.style.overflow = 'hidden';
    wheelBtnContainer.style.borderRadius = '6px';

    const wheelBtnVisual = document.createElement('div');
    wheelBtnVisual.innerHTML = '🎨 Wheel';
    wheelBtnVisual.style.display = 'flex';
    wheelBtnVisual.style.alignItems = 'center';
    wheelBtnVisual.style.gap = '4px';
    wheelBtnVisual.style.padding = '4px 8px';
    wheelBtnVisual.style.fontSize = '11px';
    wheelBtnVisual.style.fontWeight = 'bold';
    wheelBtnVisual.style.color = '#38bdf8';
    wheelBtnVisual.style.background = 'rgba(56, 189, 248, 0.15)';
    wheelBtnVisual.style.border = '1px solid rgba(56, 189, 248, 0.4)';
    wheelBtnVisual.style.borderRadius = '6px';
    wheelBtnVisual.style.cursor = 'pointer';
    wheelBtnVisual.style.pointerEvents = 'none';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = currentVal;
    colorInput.style.position = 'absolute';
    colorInput.style.top = '0';
    colorInput.style.left = '0';
    colorInput.style.width = '100%';
    colorInput.style.height = '100%';
    colorInput.style.opacity = '0';
    colorInput.style.cursor = 'pointer';
    colorInput.style.zIndex = '10';

    colorInput.onmouseenter = () => {
      wheelBtnVisual.style.background = 'rgba(56, 189, 248, 0.3)';
    };
    colorInput.onmouseleave = () => {
      wheelBtnVisual.style.background = 'rgba(56, 189, 248, 0.15)';
    };

    colorInput.oninput = (e) => {
      const col = (e.target as HTMLInputElement).value.toUpperCase();
      this.applyColorChange(col);
      hexInput.value = col;
      previewDot.style.backgroundColor = col;
    };

    colorInput.onchange = (e) => {
      const col = (e.target as HTMLInputElement).value.toUpperCase();
      this.applyColorChange(col);
    };

    wheelBtnContainer.appendChild(wheelBtnVisual);
    wheelBtnContainer.appendChild(colorInput);

    hexInput.oninput = () => {
      let val = hexInput.value.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        previewDot.style.backgroundColor = val;
        colorInput.value = val;
        this.applyColorChange(val.toUpperCase());
      }
    };

    // Clicking preview dot also triggers the colorInput
    previewDot.onclick = () => {
      colorInput.click();
    };

    customRow.appendChild(previewDot);
    customRow.appendChild(hexInput);
    customRow.appendChild(wheelBtnContainer);
    div.appendChild(customRow);

    Blockly.DropDownDiv.showPositionedByField(this, () => {});
  }

  public triggerNativeColorPicker(): void {
    this.showEditor_();
  }

  private applyColorChange(newColor: string): void {
    const oldColor = this.value_;
    this.setValue(newColor);
    this.render_();
    const block = this.getSourceBlock();
    if (block && block.workspace) {
      Blockly.Events.fire(
        new Blockly.Events.BlockChange(block, 'field', this.name || 'COLOR', oldColor, newColor)
      );
    }
  }
}

try {
  Blockly.fieldRegistry.register('field_venus_colorwheel', FieldColorWheel);
} catch (err) {
  // Already registered
}

export const VENUS_ALL_FURNITURE_BLOCKS = [
  { kind: 'block', type: 'venus_target_computer' },
  { kind: 'block', type: 'venus_target_chair' },
  { kind: 'block', type: 'venus_target_desk' },
  { kind: 'block', type: 'venus_target_plant' },
  { kind: 'block', type: 'venus_target_cabinet' },
  { kind: 'block', type: 'venus_target_carpet' },
  { kind: 'block', type: 'venus_target_caption' },
  { kind: 'block', type: 'venus_target_walls' },
  { kind: 'block', type: 'venus_target_floor' },
  { kind: 'block', type: 'venus_target_window' },
];

export function getVenusLevel1Toolbox(usedTypes: Set<string> | string[] = []) {
  const usedSet = usedTypes instanceof Set ? usedTypes : new Set(usedTypes);
  if (usedSet.has('venus_target_ball')) {
    usedSet.add('venus_target_carpet');
  }
  const availableFurniture = VENUS_ALL_FURNITURE_BLOCKS.filter(item => !usedSet.has(item.type));

  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Furniture',
        colour: '#8B5CF6',
        contents: availableFurniture,
      },
      {
        kind: 'category',
        name: 'Colors',
        colour: '#06B6D4',
        contents: [
          { kind: 'block', type: 'venus_style_bgcolor' },
        ],
      },
      {
        kind: 'category',
        name: 'Borders',
        colour: '#F59E0B',
        contents: [
          { kind: 'block', type: 'venus_style_border' },
        ],
      },
      {
        kind: 'category',
        name: 'Typography',
        colour: '#10B981',
        contents: [
          { kind: 'block', type: 'venus_style_text' },
          { kind: 'block', type: 'venus_style_color' },
          { kind: 'block', type: 'venus_style_fontfamily' },
          { kind: 'block', type: 'venus_style_fontsize' },
        ],
      },
    ],
  };
}

export const VENUS_LEVEL_1_TOOLBOX = getVenusLevel1Toolbox();

let venusLevel1Registered = false;

// Helper to generate clean CSS for furniture, ignoring invalid typography properties on non-text elements
function generateFurnitureCss(selector: string, block: Blockly.Block): string {
  const styles = (javascriptGenerator as any).statementToCode(block, 'STYLES');
  if (!styles || !styles.trim()) return '';
  // Non-caption furniture only accepts visual properties (background-color, border)
  const cleanStyles = styles
    .split('\n')
    .filter((line: string) => {
      const trimmed = line.trim();
      return (
        trimmed &&
        !trimmed.startsWith('font-') &&
        !trimmed.startsWith('/* content:') &&
        !trimmed.startsWith('color:')
      );
    })
    .join('\n');
  if (!cleanStyles.trim()) return '';
  return `${selector} {\n${cleanStyles}\n}\n\n`;
}

export function registerVenusLevel1Blocks() {
  if (venusLevel1Registered) return;
  venusLevel1Registered = true;

  // Helper to remove Duplicate from context menu on single-instance furniture blocks
  function disableBlockDuplication(block: any) {
    block.customContextMenu = function (options: any[]) {
      const dupIdx = options.findIndex((opt: any) => opt.text && /duplicate/i.test(opt.text));
      if (dupIdx !== -1) {
        options.splice(dupIdx, 1);
      }
    };
  }

  // 1. [ Furniture: #computer ]
  Blockly.Blocks['venus_target_computer'] = {
    init: function () {
      this.appendDummyInput().appendField('Furniture: #computer');
      this.appendStatementInput('STYLES').setCheck('VenusStyle');
      this.setPreviousStatement(true, 'VenusTarget');
      this.setNextStatement(true, 'VenusTarget');
      this.setColour('#8B5CF6');
      this.setTooltip('Styles the lab computer. Snap color and border blocks inside!');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus_target_computer'] = function (block: Blockly.Block) {
    return generateFurnitureCss('#computer', block);
  };

  // 2. [ Furniture: #chair ]
  Blockly.Blocks['venus_target_chair'] = {
    init: function () {
      this.appendDummyInput().appendField('Furniture: #chair');
      this.appendStatementInput('STYLES').setCheck('VenusStyle');
      this.setPreviousStatement(true, 'VenusTarget');
      this.setNextStatement(true, 'VenusTarget');
      this.setColour('#6366F1');
      this.setTooltip('Styles the lab chair. Snap color and border blocks inside!');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus_target_chair'] = function (block: Blockly.Block) {
    return generateFurnitureCss('#chair', block);
  };

  // 3. [ Furniture: #desk ]
  Blockly.Blocks['venus_target_desk'] = {
    init: function () {
      this.appendDummyInput().appendField('Furniture: #desk');
      this.appendStatementInput('STYLES').setCheck('VenusStyle');
      this.setPreviousStatement(true, 'VenusTarget');
      this.setNextStatement(true, 'VenusTarget');
      this.setColour('#EC4899');
      this.setTooltip('Styles the computer desk. Snap color and border blocks inside!');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus_target_desk'] = function (block: Blockly.Block) {
    return generateFurnitureCss('#desk', block);
  };

  // 4. [ Furniture: #plant ]
  Blockly.Blocks['venus_target_plant'] = {
    init: function () {
      this.appendDummyInput().appendField('Furniture: #plant');
      this.appendStatementInput('STYLES').setCheck('VenusStyle');
      this.setPreviousStatement(true, 'VenusTarget');
      this.setNextStatement(true, 'VenusTarget');
      this.setColour('#10B981');
      this.setTooltip('Styles the potted plant. Snap color and border blocks inside!');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus_target_plant'] = function (block: Blockly.Block) {
    return generateFurnitureCss('#plant', block);
  };

  // 5. [ Furniture: #cabinet ]
  Blockly.Blocks['venus_target_cabinet'] = {
    init: function () {
      this.appendDummyInput().appendField('Furniture: #cabinet');
      this.appendStatementInput('STYLES').setCheck('VenusStyle');
      this.setPreviousStatement(true, 'VenusTarget');
      this.setNextStatement(true, 'VenusTarget');
      this.setColour('#F59E0B');
      this.setTooltip('Styles the storage locker. Snap color and border blocks inside!');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus_target_cabinet'] = function (block: Blockly.Block) {
    return generateFurnitureCss('#cabinet', block);
  };

  // 6. [ Furniture: #carpet ]
  Blockly.Blocks['venus_target_carpet'] = {
    init: function () {
      this.appendDummyInput().appendField('Furniture: #carpet');
      this.appendStatementInput('STYLES').setCheck('VenusStyle');
      this.setPreviousStatement(true, 'VenusTarget');
      this.setNextStatement(true, 'VenusTarget');
      this.setColour('#EF4444');
      this.setTooltip('Styles the floor rug. Snap color and border blocks inside!');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus_target_carpet'] = function (block: Blockly.Block) {
    return generateFurnitureCss('#carpet', block);
  };

  // Backwards compatibility alias for #ball
  Blockly.Blocks['venus_target_ball'] = {
    init: function () {
      this.appendDummyInput().appendField('Furniture: #carpet');
      this.appendStatementInput('STYLES').setCheck('VenusStyle');
      this.setPreviousStatement(true, 'VenusTarget');
      this.setNextStatement(true, 'VenusTarget');
      this.setColour('#EF4444');
      this.setTooltip('Styles the floor rug. Snap color and border blocks inside!');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus_target_ball'] = function (block: Blockly.Block) {
    return generateFurnitureCss('#carpet', block);
  };

  // 7. [ Furniture: #caption ]
  Blockly.Blocks['venus_target_caption'] = {
    init: function () {
      this.appendDummyInput().appendField('Furniture: #caption');
      this.appendStatementInput('STYLES').setCheck('VenusStyle');
      this.setPreviousStatement(true, 'VenusTarget');
      this.setNextStatement(true, 'VenusTarget');
      this.setColour('#A855F7');
      this.setTooltip('Styles the lab sign at the top. Snap text and color blocks inside!');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus_target_caption'] = function (block: Blockly.Block) {
    const styles = (javascriptGenerator as any).statementToCode(block, 'STYLES');
    if (!styles.trim()) return '';
    return `#caption {\n${styles}}\n\n`;
  };

  // 8. [ Furniture: #walls ]
  Blockly.Blocks['venus_target_walls'] = {
    init: function () {
      this.appendDummyInput().appendField('Furniture: #walls');
      this.appendStatementInput('STYLES').setCheck('VenusStyle');
      this.setPreviousStatement(true, 'VenusTarget');
      this.setNextStatement(true, 'VenusTarget');
      this.setColour('#3B82F6');
      this.setTooltip('Styles the walls of the lab. Snap color blocks inside!');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus_target_walls'] = function (block: Blockly.Block) {
    return generateFurnitureCss('#walls', block);
  };

  // 9. [ Furniture: #floor ]
  Blockly.Blocks['venus_target_floor'] = {
    init: function () {
      this.appendDummyInput().appendField('Furniture: #floor');
      this.appendStatementInput('STYLES').setCheck('VenusStyle');
      this.setPreviousStatement(true, 'VenusTarget');
      this.setNextStatement(true, 'VenusTarget');
      this.setColour('#10B981');
      this.setTooltip('Styles the floor of the lab. Snap color blocks inside!');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus_target_floor'] = function (block: Blockly.Block) {
    return generateFurnitureCss('#floor', block);
  };

  // 10. [ Furniture: #window ]
  Blockly.Blocks['venus_target_window'] = {
    init: function () {
      this.appendDummyInput().appendField('Furniture: #window');
      this.appendStatementInput('STYLES').setCheck('VenusStyle');
      this.setPreviousStatement(true, 'VenusTarget');
      this.setNextStatement(true, 'VenusTarget');
      this.setColour('#06B6D4');
      this.setTooltip('Styles the space observatory window. Snap color blocks inside!');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus_target_window'] = function (block: Blockly.Block) {
    return generateFurnitureCss('#window', block);
  };

  // --- STYLE MODIFIERS ---

  // [ Color: (Color Wheel/Presets) ]
  Blockly.Blocks['venus_style_bgcolor'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Color:')
        .appendField(new FieldColorWheel('#00FF66'), 'COLOR');
      this.setPreviousStatement(true, 'VenusStyle');
      this.setNextStatement(true, 'VenusStyle');
      this.setColour('#06B6D4');
      this.setTooltip('Paints this item with your chosen color.');
    },
  };
  (javascriptGenerator as any).forBlock['venus_style_bgcolor'] = function (block: Blockly.Block) {
    const color = block.getFieldValue('COLOR') || '#00FF66';
    return `  background-color: ${color};\n`;
  };

  function checkTypographyParent(block: Blockly.Block) {
    if ((block as any).isInFlyout) return;
    const root = block.getRootBlock();
    if (!root || root === block) {
      block.setWarningText(null);
      return;
    }
    if (root.type.startsWith('venus_target_') && root.type !== 'venus_target_caption') {
      block.setWarningText("Text & typography blocks only apply to 'Furniture: #caption'! Non-caption furniture uses 'Color' or 'Set Border Edge'.");
    } else {
      block.setWarningText(null);
    }
  }

  // [ Set Text Color (Caption): (Color Wheel) ]
  Blockly.Blocks['venus_style_color'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Set Text Color (Caption):')
        .appendField(new FieldColorWheel('#FFFFFF'), 'COLOR');
      this.setPreviousStatement(true, 'VenusStyle');
      this.setNextStatement(true, 'VenusStyle');
      this.setColour('#10B981');
      this.setTooltip('Paints the letters on the sign with this color.');
      this.setOnChange(function (this: any) {
        checkTypographyParent(this);
      });
    },
  };
  (javascriptGenerator as any).forBlock['venus_style_color'] = function (block: Blockly.Block) {
    const color = block.getFieldValue('COLOR') || '#FFFFFF';
    return `  color: ${color};\n`;
  };

  // [ Set Border Edge: (Thickness) (Style) (Color Wheel) ]
  Blockly.Blocks['venus_style_border'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Set Border Edge:')
        .appendField(new Blockly.FieldNumber(2, 1, 12, 1), 'THICKNESS')
        .appendField('px')
        .appendField(new Blockly.FieldDropdown([
          ['solid', 'solid'],
          ['dashed', 'dashed'],
          ['dotted', 'dotted']
        ]), 'STYLE')
        .appendField(new FieldColorWheel('#00F0FF'), 'COLOR');
      this.setPreviousStatement(true, 'VenusStyle');
      this.setNextStatement(true, 'VenusStyle');
      this.setColour('#F59E0B');
      this.setTooltip('Adds a solid, dashed, or dotted outline frame.');
    },
  };
  (javascriptGenerator as any).forBlock['venus_style_border'] = function (block: Blockly.Block) {
    const thickness = block.getFieldValue('THICKNESS') || '2';
    const style = block.getFieldValue('STYLE') || 'solid';
    const color = block.getFieldValue('COLOR') || '#00F0FF';
    return `  border: ${thickness}px ${style} ${color};\n`;
  };

  // [ Change Font Family: (Dropdown) ]
  Blockly.Blocks['venus_style_fontfamily'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Change Font Family:')
        .appendField(new Blockly.FieldDropdown([
          ['Monospace (Code)', 'monospace'],
          ['Sans-Serif (Modern)', 'sans-serif'],
          ['Serif (Classic)', 'serif']
        ]), 'FONT_FAMILY');
      this.setPreviousStatement(true, 'VenusStyle');
      this.setNextStatement(true, 'VenusStyle');
      this.setColour('#10B981');
      this.setTooltip('Changes how the letters look (font lettering style).');
      this.setOnChange(function (this: any) {
        checkTypographyParent(this);
      });
    },
  };
  (javascriptGenerator as any).forBlock['venus_style_fontfamily'] = function (block: Blockly.Block) {
    const family = block.getFieldValue('FONT_FAMILY') || 'monospace';
    return `  font-family: ${family};\n`;
  };

  // [ Set Font Size: (Stepper) px ]
  Blockly.Blocks['venus_style_fontsize'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Set Font Size:')
        .appendField(new Blockly.FieldNumber(16, 10, 32, 1), 'FONT_SIZE')
        .appendField('px');
      this.setPreviousStatement(true, 'VenusStyle');
      this.setNextStatement(true, 'VenusStyle');
      this.setColour('#10B981');
      this.setTooltip('Makes the text letters bigger or smaller.');
      this.setOnChange(function (this: any) {
        checkTypographyParent(this);
      });
    },
  };
  (javascriptGenerator as any).forBlock['venus_style_fontsize'] = function (block: Blockly.Block) {
    const size = block.getFieldValue('FONT_SIZE') || '16';
    return `  font-size: ${size}px;\n`;
  };

  // [ Set Caption Text: (FieldTextInput) ]
  Blockly.Blocks['venus_style_text'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Set Caption Text:')
        .appendField(new Blockly.FieldTextInput("PROFESSOR SPECTRUM'S LAB"), 'TEXT');
      this.setPreviousStatement(true, 'VenusStyle');
      this.setNextStatement(true, 'VenusStyle');
      this.setColour('#10B981');
      this.setTooltip('Types your own custom words on the lab sign.');
      this.setOnChange(function (this: any) {
        checkTypographyParent(this);
      });
    },
  };
  (javascriptGenerator as any).forBlock['venus_style_text'] = function (block: Blockly.Block) {
    const text = block.getFieldValue('TEXT') || "PROFESSOR SPECTRUM'S LAB";
    return `  /* content: "${text}" */\n`;
  };
}

export function parseVenusLevel1Workspace(workspace: Blockly.Workspace): {
  validation: VenusLevel1Validation;
  cssCode: string;
} {
  registerVenusLevel1Blocks();
  const allBlocks = workspace.getAllBlocks(false);

  const targetKeys = ['computer', 'chair', 'desk', 'plant', 'cabinet', 'carpet', 'ball', 'caption', 'walls', 'floor', 'window'];
  const styles: Record<string, TargetStyleData> = {};
  targetKeys.forEach(k => {
    styles[k] = { present: false, color: null, borderWidth: null, borderStyle: null, borderColor: null, fontFamily: null, fontSize: null, textColor: null };
  });

  const typographyMismatches: string[] = [];

  for (const block of allBlocks) {
    const type = block.type;
    const match = type.match(/^venus_target_(.+)$/);
    if (match && styles[match[1]]) {
      const key = match[1];
      styles[key].present = true;

      let child = block.getInputTargetBlock('STYLES');
      while (child) {
        if (child.type === 'venus_style_bgcolor') {
          styles[key].color = child.getFieldValue('COLOR') || '#00FF66';
        } else if (child.type === 'venus_style_border') {
          styles[key].borderWidth = Number(child.getFieldValue('THICKNESS')) || 2;
          styles[key].borderStyle = (child.getFieldValue('STYLE') as any) || 'solid';
          styles[key].borderColor = child.getFieldValue('COLOR') || '#00F0FF';
        } else if (child.type === 'venus_style_fontfamily') {
          if (key === 'caption') {
            styles[key].fontFamily = child.getFieldValue('FONT_FAMILY') || 'monospace';
          } else {
            typographyMismatches.push(key);
          }
        } else if (child.type === 'venus_style_fontsize') {
          if (key === 'caption') {
            styles[key].fontSize = Number(child.getFieldValue('FONT_SIZE')) || 16;
          } else {
            typographyMismatches.push(key);
          }
        } else if (child.type === 'venus_style_color') {
          if (key === 'caption') {
            styles[key].textColor = child.getFieldValue('COLOR') || '#FFFFFF';
          } else {
            typographyMismatches.push(key);
          }
        } else if (child.type === 'venus_style_text') {
          if (key === 'caption') {
            styles[key].textContent = child.getFieldValue('TEXT') || "PROFESSOR SPECTRUM'S LAB";
          } else {
            typographyMismatches.push(key);
          }
        }
        child = child.getNextBlock();
      }
    }
  }

  // Sync ball alias with carpet if ball was used
  if (styles.ball?.present && !styles.carpet?.present) {
    styles.carpet = { ...styles.ball };
  }

  const uniqueTypographyMismatches = Array.from(new Set(typographyMismatches));

  const isComputerStyled = Boolean(styles.computer.present && (styles.computer.color || styles.computer.borderWidth));
  const isChairStyled = Boolean(styles.chair.present && (styles.chair.color || styles.chair.borderWidth));
  const isDeskStyled = Boolean(styles.desk.present && (styles.desk.color || styles.desk.borderWidth));
  const isPlantStyled = Boolean(styles.plant.present && (styles.plant.color || styles.plant.borderWidth));
  const isCabinetStyled = Boolean(styles.cabinet.present && (styles.cabinet.color || styles.cabinet.borderWidth));
  const isCarpetStyled = Boolean(
    (styles.carpet?.present || styles.ball?.present) &&
    (styles.carpet?.color || styles.carpet?.borderWidth || styles.ball?.color || styles.ball?.borderWidth)
  );
  const isBallStyled = isCarpetStyled;
  const isWallsStyled = Boolean(styles.walls.present && (styles.walls.color || styles.walls.borderWidth));
  const isFloorStyled = Boolean(styles.floor.present && (styles.floor.color || styles.floor.borderWidth));
  const isWindowStyled = Boolean(styles.window.present && (styles.window.color || styles.window.borderWidth));
  const isCaptionStyled = Boolean(
    styles.caption.present && (
      styles.caption.color ||
      styles.caption.borderWidth ||
      styles.caption.fontFamily ||
      styles.caption.fontSize ||
      styles.caption.textColor ||
      styles.caption.textContent
    )
  );

  const hasAnyBorder = Object.values(styles).some(s => s.present && Boolean(s.borderWidth));

  // Win condition: User has styled at least 3 items in their lab
  const totalStyled = [
    isComputerStyled,
    isChairStyled,
    isDeskStyled,
    isPlantStyled,
    isCabinetStyled,
    isCarpetStyled,
    isCaptionStyled,
    isWallsStyled,
    isFloorStyled,
    isWindowStyled
  ].filter(Boolean).length;

  const isAllStyled =
    totalStyled >= 3 &&
    hasAnyBorder &&
    isCaptionStyled &&
    uniqueTypographyMismatches.length === 0;

  let failErrorMessage: string | undefined;
  if (allBlocks.length === 0) {
    failErrorMessage = 'Workspace is empty! Drag Furniture blocks from the toolbox into your workspace.';
  } else if (uniqueTypographyMismatches.length > 0) {
    const badTarget = uniqueTypographyMismatches[0];
    failErrorMessage = `Furniture #${badTarget} cannot display text! Move typography blocks into #caption, or use 'Color' and 'Set Border Edge' for furniture.`;
  } else if (totalStyled === 0) {
    failErrorMessage = 'Snap style blocks (Colors or Borders) inside your Furniture blocks!';
  } else if (totalStyled < 3) {
    failErrorMessage = `Great progress! Decorate at least 3 furniture items to restore the lab (${totalStyled}/3 styled).`;
  } else if (!hasAnyBorder) {
    failErrorMessage = 'Almost there! Add a styled border edge to at least one furniture item.';
  } else if (!isCaptionStyled) {
    failErrorMessage = "Almost there! Add and customize the #caption banner to title Professor Spectrum's lab.";
  }

  // Deterministic CSS code generator from parsed workspace blocks and styles
  const cssBlocks: string[] = [];
  const processedSelectors = new Set<string>();

  for (const block of allBlocks) {
    const match = block.type.match(/^venus_target_(.+)$/);
    if (match) {
      const key = match[1];
      const selector = key === 'ball' ? '#carpet' : `#${key}`;
      if (processedSelectors.has(selector)) continue;
      processedSelectors.add(selector);

      const st = styles[key];
      if (!st) continue;

      const lines: string[] = [];
      if (st.color) {
        lines.push(`  background-color: ${st.color};`);
      }
      if (st.borderWidth) {
        lines.push(`  border: ${st.borderWidth}px ${st.borderStyle || 'solid'} ${st.borderColor || '#00F0FF'};`);
      }
      if (key === 'caption') {
        if (st.textColor) lines.push(`  color: ${st.textColor};`);
        if (st.fontFamily) lines.push(`  font-family: ${st.fontFamily};`);
        if (st.fontSize) lines.push(`  font-size: ${st.fontSize}px;`);
        if (st.textContent) lines.push(`  /* text: "${st.textContent}" */`);
      }

      if (lines.length > 0) {
        cssBlocks.push(`${selector} {\n${lines.join('\n')}\n}`);
      } else {
        cssBlocks.push(`${selector} {\n  /* default unstyled */\n}`);
      }
    }
  }

  const cssCode = cssBlocks.join('\n\n');

  return {
    validation: {
      hasComputer: styles.computer.present,
      hasChair: styles.chair.present,
      hasDesk: styles.desk.present,
      hasPlant: styles.plant.present,
      hasCabinet: styles.cabinet.present,
      hasBall: Boolean(styles.ball?.present || styles.carpet?.present),
      hasCarpet: Boolean(styles.carpet?.present || styles.ball?.present),
      hasCaption: styles.caption.present,
      hasWalls: styles.walls.present,
      hasFloor: styles.floor.present,
      hasWindow: styles.window.present,

      isComputerStyled,
      isChairStyled,
      isDeskStyled,
      isPlantStyled,
      isCabinetStyled,
      isBallStyled,
      isCarpetStyled,
      isCaptionStyled,
      isWallsStyled,
      isFloorStyled,
      isWindowStyled,

      computerValid: isComputerStyled,
      chairValid: isChairStyled,
      deskValid: isDeskStyled,
      plantValid: isPlantStyled,
      cabinetValid: isCabinetStyled,
      ballValid: isBallStyled,
      carpetValid: isCarpetStyled,
      captionValid: isCaptionStyled,
      wallsValid: isWallsStyled,
      floorValid: isFloorStyled,
      windowValid: isWindowStyled,

      computerColor: styles.computer.color ?? null,
      chairColor: styles.chair.color ?? null,
      deskColor: styles.desk.color ?? null,
      plantColor: styles.plant.color ?? null,
      cabinetColor: styles.cabinet.color ?? null,
      ballColor: styles.ball?.color ?? styles.carpet?.color ?? null,
      carpetColor: styles.carpet?.color ?? styles.ball?.color ?? null,
      captionColor: styles.caption.color ?? null,
      captionText: styles.caption?.textContent || "PROFESSOR SPECTRUM'S LAB",
      wallsColor: styles.walls.color ?? null,
      floorColor: styles.floor.color ?? null,
      windowColor: styles.window.color ?? null,

      totalStyled,
      hasAnyBorder,
      typographyMismatches: uniqueTypographyMismatches,

      styles,

      isAllStyled,
      failErrorMessage,
      hasBlocks: allBlocks.length > 0,
    },
    cssCode: cssCode.trim(),
  };
}

export const INITIAL_VENUS_LEVEL_1_VALIDATION: VenusLevel1Validation = {
  hasComputer: false,
  hasChair: false,
  hasDesk: false,
  hasPlant: false,
  hasCabinet: false,
  hasBall: false,
  hasCarpet: false,
  hasCaption: false,
  hasWalls: false,
  hasFloor: false,
  hasWindow: false,

  isComputerStyled: false,
  isChairStyled: false,
  isDeskStyled: false,
  isPlantStyled: false,
  isCabinetStyled: false,
  isBallStyled: false,
  isCarpetStyled: false,
  isCaptionStyled: false,
  isWallsStyled: false,
  isFloorStyled: false,
  isWindowStyled: false,

  computerValid: false,
  chairValid: false,
  deskValid: false,
  plantValid: false,
  cabinetValid: false,
  ballValid: false,
  carpetValid: false,
  captionValid: false,
  wallsValid: false,
  floorValid: false,
  windowValid: false,

  computerColor: null,
  chairColor: null,
  deskColor: null,
  plantColor: null,
  cabinetColor: null,
  ballColor: null,
  carpetColor: null,
  captionColor: null,
  captionText: "PROFESSOR SPECTRUM'S LAB",
  wallsColor: null,
  floorColor: null,
  windowColor: null,

  totalStyled: 0,
  hasAnyBorder: false,
  typographyMismatches: [],

  styles: {
    computer: createDefaultTargetStyle(),
    chair: createDefaultTargetStyle(),
    desk: createDefaultTargetStyle(),
    plant: createDefaultTargetStyle(),
    cabinet: createDefaultTargetStyle(),
    carpet: createDefaultTargetStyle(),
    ball: createDefaultTargetStyle(),
    caption: createDefaultTargetStyle(),
    walls: createDefaultTargetStyle(),
    floor: createDefaultTargetStyle(),
    window: createDefaultTargetStyle(),
  },

  isAllStyled: false,
  hasBlocks: false,
};

