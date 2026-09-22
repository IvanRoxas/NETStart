import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';

export interface MarsPromotionItem {
  id: string;
  filename: string;
  name: string;
  hint: string;
  tagline: string;
  themeColor: string;
  bgColor: string;
  iconSvgName: string;
}

export const MARS_PROMOTIONS: MarsPromotionItem[] = [
  {
    id: 'promo-1',
    filename: 'dog.png',
    name: 'Dog',
    hint: 'Hint:',
    tagline: 'I wag my tail and love to bark.',
    themeColor: '#f59e0b',
    bgColor: 'from-amber-900/60 to-yellow-950/80',
    iconSvgName: 'dog',
  },
  {
    id: 'promo-2',
    filename: 'cat.png',
    name: 'Cat',
    hint: 'Hint:',
    tagline: 'I purr, meow, and love to nap.',
    themeColor: '#0ea5e9',
    bgColor: 'from-sky-900/60 to-cyan-950/80',
    iconSvgName: 'cat',
  },
  {
    id: 'promo-3',
    filename: 'octopus.png',
    name: 'Octopus',
    hint: 'Hint:',
    tagline: 'I live in the ocean and have eight arms.',
    themeColor: '#a855f7',
    bgColor: 'from-purple-900/60 to-indigo-950/80',
    iconSvgName: 'octopus',
  },
  {
    id: 'promo-4',
    filename: 'fish.png',
    name: 'Fish',
    hint: 'Hint:',
    tagline: 'I swim underwater and have shiny scales.',
    themeColor: '#ef4444',
    bgColor: 'from-red-900/60 to-orange-950/80',
    iconSvgName: 'fish',
  },
  {
    id: 'promo-5',
    filename: 'butterfly.png',
    name: 'Butterfly',
    hint: 'Hint:',
    tagline: 'I have colorful wings and flutter by.',
    themeColor: '#10b981',
    bgColor: 'from-emerald-900/60 to-teal-950/80',
    iconSvgName: 'butterfly',
  },
];

export interface BillboardCustomization {
  caption?: string;
  headline?: string;
  filter?: string; // 'none' | 'glow' | 'sunset' | 'hologram' | 'vivid' | 'nightvision' | 'retro' | 'matrix' | 'synthwave' | 'warm' | 'cool' | 'invert'
  frameStyle?: string; // 'default' | 'cyber' | 'gold' | 'plasma' | 'laser' | 'emerald' | 'rainbow'
  borderStyle?: string; // 'default' | 'rounded-soft' | 'rounded-pill' | 'polaroid' | 'vignette'
  animation?: string; // 'default' | 'pulse' | 'float' | 'breath'
  error?: string;
}

export interface ParsedImageContainer {
  containerId: string;
  billboardIndex: number;
  imageSrc: string | null;
  isValid: boolean;
  imageCount: number;
  customization?: BillboardCustomization;
}

export interface MarsLevel2Validation {
  totalContainers: number;
  totalImages: number;
  matchedCount: number;
  isAllMatched: boolean;
  assignedImages: (string | null)[];
  customizations: BillboardCustomization[];
  hasErrors?: boolean;
  errorMessages?: string[];
}

export function registerMarsLevel2Blocks() {
  if (typeof window === 'undefined') return;

  const MARS_ITEM_TYPES = [
    'MARS_IMAGE',
    'MARS_CAPTION',
    'MARS_HEADLINE',
    'MARS_FILTER',
    'MARS_FRAME',
    'MARS_BORDER',
    'MARS_ANIMATION',
  ];

  // 1. Billboard 1 through 5 Specific Container Blocks with Distinct Colors
  const billboardColors = [
    '#8B5CF6', // Billboard 1: Vibrant Purple
    '#0284C7', // Billboard 2: Sky Blue
    '#0D9488', // Billboard 3: Emerald / Teal
    '#D97706', // Billboard 4: Warm Amber
    '#E11D48', // Billboard 5: Rose / Crimson
  ];

  for (let i = 1; i <= 5; i++) {
    const blockType = `html_billboard_${i}`;
    const blockColor = billboardColors[i - 1];
    Blockly.Blocks[blockType] = {
      init: function () {
        this.appendDummyInput()
          .appendField(`Billboard ${i} Container`);
        this.appendStatementInput('CONTENT')
          .setCheck(MARS_ITEM_TYPES);
        this.setPreviousStatement(true, 'MARS_CONTAINER');
        this.setNextStatement(true, 'MARS_CONTAINER');
        this.setColour(blockColor);
        this.setTooltip(`Box for Billboard ${i} to hold your picture and text.`);
        this.setHelpUrl('');
      },
    };

    (javascriptGenerator as any).forBlock[blockType] = function (block: any) {
      const children = (javascriptGenerator as any).statementToCode(block, 'CONTENT') || '';
      return `<!-- Billboard ${i} -->\n<div class="billboard-container">\n${children}</div>\n`;
    };
  }

  // Remove deprecated generic html_billboard and html_badge blocks if present
  if (Blockly.Blocks['html_billboard']) {
    delete Blockly.Blocks['html_billboard'];
  }
  if (Blockly.Blocks['html_badge']) {
    delete Blockly.Blocks['html_badge'];
  }

  // 2. <img> Tag Block with clean dropdown options & Image Preview hover tab
  Blockly.Blocks['html_img'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Image')
        .appendField('src =')
        .appendField(
          new Blockly.FieldDropdown([
            ['"dog.png"', 'dog.png'],
            ['"cat.png"', 'cat.png'],
            ['"octopus.png"', 'octopus.png'],
            ['"fish.png"', 'fish.png'],
            ['"butterfly.png"', 'butterfly.png'],
          ]),
          'SRC'
        );
      this.setPreviousStatement(true, MARS_ITEM_TYPES);
      this.setNextStatement(true, MARS_ITEM_TYPES);
      this.setColour('#0ea5e9'); // Sky Blue for media & images
      
      const self = this;
      this.setTooltip(function () {
        const src = self.getFieldValue('SRC') || 'dog.png';
        return `📸[${src}]`;
      });
      this.setHelpUrl('');
    },
  };

  // Register Custom HTML Tooltip Renderer in Blockly for rich "Image Preview" tab
  if (typeof Blockly !== 'undefined' && (Blockly as any).Tooltip) {
    const renderImageTooltip = function (div: HTMLElement, element: any) {
      const tip = typeof element?.tooltip === 'function' ? element.tooltip() : element?.tooltip;
      if (typeof tip === 'string' && (tip.includes('.png') || tip.startsWith('📸'))) {
        const match = tip.match(/([a-zA-Z0-9_-]+\.png)/i);
        const filename = match ? match[1].toLowerCase() : 'dog.png';
        
        div.innerHTML = `
          <div class="image-preview-card" style="background: rgba(15, 23, 42, 0.96); backdrop-filter: blur(12px); border: 1.5px solid #38bdf8; border-radius: 12px; overflow: hidden; box-shadow: 0 16px 36px rgba(0,0,0,0.85); width: 140px; font-family: system-ui, sans-serif;">
            <div style="background: #1e293b; padding: 6px 10px; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">Preview</span>
              <span style="font-size: 9px; font-family: monospace; color: #94a3b8; font-weight: 700;">${filename}</span>
            </div>
            <div style="padding: 10px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <img src="/assets/planets/01_mars/level_2/solutions/${filename}" alt="${filename}" style="width: 100%; height: 85px; object-fit: cover; border-radius: 8px; display: block; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" />
              <span style="font-size: 11px; color: #38bdf8; font-weight: 700; font-family: monospace; text-align: center;">&lt;img src=&quot;${filename}&quot;&gt;</span>
            </div>
          </div>
        `;
        div.style.background = 'transparent';
        div.style.border = 'none';
        div.style.padding = '0';
        div.style.boxShadow = 'none';
      } else if (typeof tip === 'string' && tip.trim()) {
        div.innerText = tip;
        div.style.padding = '5px 9px';
        div.style.background = '#ffffc7';
        div.style.border = '1px solid #d4b106';
        div.style.borderRadius = '4px';
        div.style.color = '#111827';
        div.style.fontSize = '12px';
        div.style.fontWeight = '500';
        div.style.maxWidth = '260px';
        div.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        div.style.lineHeight = '1.35';
      }
    };

    if (typeof (Blockly as any).Tooltip.setCustomTooltip === 'function') {
      (Blockly as any).Tooltip.setCustomTooltip(renderImageTooltip);
    }
    (Blockly as any).Tooltip.customTooltip = renderImageTooltip;
  }

  (javascriptGenerator as any).forBlock['html_img'] = function (block: any) {
    const src = block.getFieldValue('SRC') || 'dog.png';
    return `<img src="${src}" alt="Billboard Graphic" />\n`;
  };

  // 3. Caption Block for Custom Billboard Text
  Blockly.Blocks['html_caption'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Caption')
        .appendField(
          new Blockly.FieldDropdown([
            ['"Definitely Not An Alien"', 'Definitely Not An Alien'],
            ['"Will Work For Space Snacks"', 'Will Work For Space Snacks'],
            ['"Professional Couch Potato"', 'Professional Couch Potato'],
            ['"I Have No Idea What I Am Doing"', 'I Have No Idea What I Am Doing'],
            ['"Certified 100% Chaos Gremlin"', 'Certified 100% Chaos Gremlin'],
            ['"Chief Executive Nap Officer"', 'Chief Executive Nap Officer'],
            ['"Brain Operating At 2%"', 'Brain Operating At 2%'],
            ['"Scientifically Proven To Be Cute"', 'Scientifically Proven To Be Cute'],
            ['"Please Do Not Push My Buttons"', 'Please Do Not Push My Buttons'],
            ['"Earths Most Wanted Treat Thief"', 'Earths Most Wanted Treat Thief'],
          ]),
          'TEXT'
        );
      this.setPreviousStatement(true, MARS_ITEM_TYPES);
      this.setNextStatement(true, MARS_ITEM_TYPES);
      this.setColour('#f59e0b'); // Amber for caption
      this.setTooltip('Adds a funny text caption to your billboard.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['html_caption'] = function (block: any) {
    const text = block.getFieldValue('TEXT') || 'Definitely Not An Alien';
    return `<figcaption class="billboard-caption">${text}</figcaption>\n`;
  };

  // Legacy alias for html_headline
  Blockly.Blocks['html_headline'] = Blockly.Blocks['html_caption'];
  (javascriptGenerator as any).forBlock['html_headline'] = (javascriptGenerator as any).forBlock['html_caption'];

  // 5. Image Filter Effect Block
  Blockly.Blocks['html_img_filter'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Filter Effect')
        .appendField(
          new Blockly.FieldDropdown([
            ['Amber Neon Glow', 'glow'],
            ['Martian Sunset Sepia', 'sunset'],
            ['Cyber Hologram Cyan', 'hologram'],
            ['Super Vivid Saturation', 'vivid'],
            ['Night Vision Emerald', 'nightvision'],
            ['Monochrome Noir', 'retro'],
            ['Matrix Digital Green', 'matrix'],
            ['Synthwave Neon Purple', 'synthwave'],
            ['Warm Sunlight', 'warm'],
            ['Cool Deep Blue', 'cool'],
            ['Invert / Negative', 'invert'],
          ]),
          'FILTER'
        );
      this.setPreviousStatement(true, MARS_ITEM_TYPES);
      this.setNextStatement(true, MARS_ITEM_TYPES);
      this.setColour('#ec4899'); // Pink for visual styling
      this.setTooltip('Adds a cool color glow effect to your picture.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['html_img_filter'] = function (block: any) {
    const filter = block.getFieldValue('FILTER') || 'glow';
    return `<!-- CSS Filter: ${filter} -->\n<style>.billboard-img { filter: var(--${filter}-effect); }</style>\n`;
  };

  // 6. Frame Border Styling Block
  Blockly.Blocks['html_frame_style'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Frame Style')
        .appendField(
          new Blockly.FieldDropdown([
            ['Cyber Neon Cyan', 'cyber'],
            ['Gold Metallic Deluxe', 'gold'],
            ['Quantum Plasma Purple', 'plasma'],
            ['Martian Laser Red', 'laser'],
            ['Emerald Forcefield', 'emerald'],
            ['Cosmic Rainbow Glow', 'rainbow'],
          ]),
          'FRAME'
        );
      this.setPreviousStatement(true, MARS_ITEM_TYPES);
      this.setNextStatement(true, MARS_ITEM_TYPES);
      this.setColour('#6366f1'); // Indigo for structure styling
      this.setTooltip('Changes the border frame style of your billboard.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['html_frame_style'] = function (block: any) {
    const frame = block.getFieldValue('FRAME') || 'cyber';
    return `<!-- Frame Style: ${frame} -->\n<div class="frame-${frame}">\n`;
  };

  // 7. Image Border Shape Block
  Blockly.Blocks['html_img_border'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Corner Shape')
        .appendField(
          new Blockly.FieldDropdown([
            ['Rounded Corners', 'rounded-soft'],
            ['Pill Stadium Shape', 'rounded-pill'],
            ['Polaroid Frame', 'polaroid'],
            ['Vignette Shadow', 'vignette'],
          ]),
          'BORDER'
        );
      this.setPreviousStatement(true, MARS_ITEM_TYPES);
      this.setNextStatement(true, MARS_ITEM_TYPES);
      this.setColour('#8b5cf6');
      this.setTooltip('Changes the corner shape of your picture.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['html_img_border'] = function (block: any) {
    const border = block.getFieldValue('BORDER') || 'rounded-soft';
    return `<!-- Corner Shape: ${border} -->\n`;
  };

  // 8. Image Animation Block
  Blockly.Blocks['html_img_animation'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Animation')
        .appendField(
          new Blockly.FieldDropdown([
            ['Gentle Pulse', 'pulse'],
            ['Floating Hover', 'float'],
            ['Slow Breathing Zoom', 'breath'],
          ]),
          'ANIMATION'
        );
      this.setPreviousStatement(true, MARS_ITEM_TYPES);
      this.setNextStatement(true, MARS_ITEM_TYPES);
      this.setColour('#14b8a6');
      this.setTooltip('Adds an animated motion effect to your picture.');
      this.setHelpUrl('');
    },
  };

  (javascriptGenerator as any).forBlock['html_img_animation'] = function (block: any) {
    const anim = block.getFieldValue('ANIMATION') || 'pulse';
    return `<!-- Animation: ${anim} -->\n`;
  };
}

// Initial Starter XML for Mars Level 2 (Blank starter for clean building)
export const MARS_LEVEL_2_DEFAULT_STARTER_XML = `
<xml xmlns="https://developers.google.com/blockly/xml"></xml>
`.trim();

// Target correct sequence of billboard images (Billboard 1 through 5)
export const MARS_LEVEL_2_TARGETS = [
  'dog.png',
  'cat.png',
  'octopus.png',
  'fish.png',
  'butterfly.png',
];

export function parseMarsLevel2Workspace(ws: Blockly.WorkspaceSvg): {
  containers: ParsedImageContainer[];
  validation: MarsLevel2Validation;
  htmlCode: string;
} {
  const topBlocks = ws.getTopBlocks(true);
  const containers: ParsedImageContainer[] = [];
  const assignedImages: (string | null)[] = [null, null, null, null, null];
  const customizations: BillboardCustomization[] = [{}, {}, {}, {}, {}];
  const errorMessages: string[] = [];

  function extractContainerDetails(block: Blockly.Block): {
    src: string | null;
    customization: BillboardCustomization;
    imageCount: number;
    hasMultipleImages: boolean;
  } {
    let src: string | null = null;
    let imageCount = 0;
    const customization: BillboardCustomization = {};

    let inner: Blockly.Block | null = block.getInputTargetBlock('CONTENT');
    while (inner) {
      if (inner.type === 'html_img') {
        imageCount++;
        // Capture the first image
        if (src === null) {
          src = inner.getFieldValue('SRC') || null;
        }
      } else if (inner.type === 'html_caption' || inner.type === 'html_headline') {
        if (!customization.caption) {
          customization.caption = inner.getFieldValue('TEXT') || undefined;
          customization.headline = customization.caption;
        }
      } else if (inner.type === 'html_img_filter') {
        if (!customization.filter) {
          customization.filter = inner.getFieldValue('FILTER') || undefined;
        }
      } else if (inner.type === 'html_frame_style') {
        if (!customization.frameStyle) {
          customization.frameStyle = inner.getFieldValue('FRAME') || undefined;
        }
      } else if (inner.type === 'html_img_border') {
        if (!customization.borderStyle) {
          customization.borderStyle = inner.getFieldValue('BORDER') || undefined;
        }
      } else if (inner.type === 'html_img_animation') {
        if (!customization.animation) {
          customization.animation = inner.getFieldValue('ANIMATION') || undefined;
        }
      }
      inner = inner.getNextBlock();
    }

    return {
      src,
      customization,
      imageCount,
      hasMultipleImages: imageCount > 1,
    };
  }

  // Track billboards to detect duplicates
  const seenBillboards = new Set<number>();
  const duplicateBillboards = new Set<number>();

  // 1. Look for explicitly numbered billboards (Billboard 1 through 5)
  topBlocks.forEach((topBlock) => {
    let current: Blockly.Block | null = topBlock;
    while (current) {
      const type = current.type;
      let matchedIndex: number | null = null;

      for (let i = 1; i <= 5; i++) {
        if (type === `html_billboard_${i}`) {
          matchedIndex = i - 1;
          break;
        }
      }

      if (matchedIndex !== null) {
        if (seenBillboards.has(matchedIndex)) {
          duplicateBillboards.add(matchedIndex + 1);
        }
        seenBillboards.add(matchedIndex);

        const { src, customization, imageCount } = extractContainerDetails(current);

        assignedImages[matchedIndex] = src;
        customizations[matchedIndex] = customization;
        containers.push({
          containerId: current.id,
          billboardIndex: matchedIndex,
          imageSrc: src,
          isValid: src !== null,
          imageCount,
          customization,
        });
      }

      current = current.getNextBlock();
    }
  });

  if (duplicateBillboards.size > 0) {
    errorMessages.push(
      `Duplicate Billboard ${Array.from(duplicateBillboards).join(', ')} Container found! Use only one container per billboard.`
    );
  }

  // Calculate matches against the 5 billboards
  let matchedCount = 0;
  for (let i = 0; i < MARS_LEVEL_2_TARGETS.length; i++) {
    if (assignedImages[i] === MARS_LEVEL_2_TARGETS[i]) {
      matchedCount++;
    }
  }

  const hasErrors = errorMessages.length > 0;
  const isAllMatched = matchedCount === 5 && !hasErrors;

  let htmlCode = '';
  try {
    htmlCode = (javascriptGenerator as any).workspaceToCode(ws) || '';
  } catch {
    htmlCode = '';
  }

  return {
    containers,
    validation: {
      totalContainers: containers.length,
      totalImages: assignedImages.filter((s) => s !== null).length,
      matchedCount,
      isAllMatched,
      assignedImages,
      customizations,
      hasErrors,
      errorMessages,
    },
    htmlCode,
  };
}

