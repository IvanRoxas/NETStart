import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { FieldColorWheel, registerVenusLevel1Blocks } from './venusLevel1Definitions';
export { FieldColorWheel };

export type Venus3SectorId = 'alpha' | 'beta' | 'gamma';
export type Venus3TabId = 'main' | 'alpha' | 'beta' | 'gamma';

export interface Venus3TabInfo {
  id: Venus3TabId;
  label: string;
  filename: string;
  sectorId?: Venus3SectorId;
}

export const VENUS_3_TABS: Venus3TabInfo[] = [
  { id: 'main', label: 'Main', filename: 'index.html' },
  { id: 'alpha', label: 'Sector 1', filename: 'alpha.css', sectorId: 'alpha' },
  { id: 'beta', label: 'Sector 2', filename: 'beta.css', sectorId: 'beta' },
  { id: 'gamma', label: 'Sector 3', filename: 'gamma.css', sectorId: 'gamma' },
];

export interface Venus3SectorInfo {
  id: Venus3SectorId;
  name: string;
  tag: string;
  subheading: string;
  desc: string;
  colorTheme: string; // Tailwind/HEX theme
  badgeColor: string;
}

export const VENUS_3_SECTORS: Record<Venus3SectorId, Venus3SectorInfo> = {
  alpha: {
    id: 'alpha',
    name: 'Sector 1',
    tag: 'Skies of Venus',
    subheading: 'Clouds and Airships',
    desc: 'Format and color the skies, clouds, airships, and mountain towers in the upper atmosphere of Venus.',
    colorTheme: '#f59e0b', // Amber / Sulfuric Gold
    badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-950/60',
  },
  beta: {
    id: 'beta',
    name: 'Sector 2',
    tag: 'Crystal Caves',
    subheading: 'Subterranean Plants',
    desc: 'Format and color the cavern walls, stalactites, faceted crystal gems, underground river, and alien flora.',
    colorTheme: '#a855f7', // Purple / Violet
    badgeColor: 'text-purple-400 border-purple-500/40 bg-purple-950/60',
  },
  gamma: {
    id: 'gamma',
    name: 'Sector 3',
    tag: 'Lush Desert Oases',
    subheading: 'Venusian Oasis Basin',
    desc: 'Format and color the desert mountains, stepped plateaus, impact craters, rock formations, and oasis vegetation.',
    colorTheme: '#e11d48', // Rose / Scorched Crimson
    badgeColor: 'text-rose-400 border-rose-500/40 bg-rose-950/60',
  },
};

export interface Venus3ParsedStyles {
  alpha?: Record<string, string>;
  beta?: Record<string, string>;
  gamma?: Record<string, string>;
  linkedStylesheets?: string[];
}

export const INITIAL_VENUS_3_PARSED_STYLES: Venus3ParsedStyles = {
  alpha: {},
  beta: {},
  gamma: {},
  linkedStylesheets: [],
};

export interface VenusLevel3Validation {
  activeSector: Venus3SectorId;
  solvedSectors: Record<Venus3SectorId, boolean>;
  allSolved: boolean;
  failErrorMessage?: string;
}

export const INITIAL_VENUS_LEVEL_3_VALIDATION: VenusLevel3Validation = {
  activeSector: 'alpha',
  solvedSectors: {
    alpha: false,
    beta: false,
    gamma: false,
  },
  allSolved: false,
};

export interface VenusPaletteColor {
  name: string;
  hex: string;
  target?: string;
  description: string;
}

export interface VenusSectorPalette {
  sectorId: Venus3TabId;
  sectorName: string;
  themeTitle: string;
  themeDescription: string;
  accentColor: string;
  colors: VenusPaletteColor[];
}

export const VENUS_SECTOR_PALETTES: Record<Venus3TabId, VenusSectorPalette> = {
  alpha: {
    sectorId: 'alpha',
    sectorName: 'Sector 1 (Alpha)',
    themeTitle: 'Skies of Venus & Aerostat Station',
    themeDescription: 'Dense sulfuric acid cloud decks, solar golden rays, high-altitude atmospheric twilight, and lightweight aerostats.',
    accentColor: '#F59E0B',
    colors: [
      { name: 'Sulfuric Amber', hex: '#F59E0B', target: '#clouds', description: 'Billowing sulfuric acid cloud cover' },
      { name: 'Atmospheric Mauve', hex: '#55244E', target: '#sky', description: 'High-altitude Venusian twilight sky' },
      { name: 'Solar Corona Gold', hex: '#FBBF24', target: '#clouds', description: 'Filtered solar rays catching cloud tops' },
      { name: 'Observatory Dome', hex: '#FACC15', target: '#tower-roof', description: 'Reflective cupola on the relay tower' },
      { name: 'Relay Spire Steel', hex: '#64748B', target: '#tower', description: 'Atmospheric transmission tower superstructure' },
      { name: 'Copper Alloy', hex: '#B45309', target: '#tower', description: 'Corrosion-resistant copper/brass fittings' },
      { name: 'Aerostat Orange', hex: '#EA580C', target: '#airships', description: 'High-visibility heat-shielded dirigible envelope' },
      { name: 'Dirigible Titanium', hex: '#E2E8F0', target: '#airships', description: 'Lightweight reflective dirigible hull' },
      { name: 'Sulfur Vapor Cream', hex: '#FEF3C7', target: '#clouds', description: 'Upper altitude diffuse sulfuric haze' },
      { name: 'Carbon Aerogel', hex: '#334155', target: '#airships', description: 'Dark lightweight dirigible gondola & rudders' },
    ],
  },
  beta: {
    sectorId: 'beta',
    sectorName: 'Sector 2 (Beta)',
    themeTitle: 'Cavern of Whispers & Subterranean Hollows',
    themeDescription: 'Deep volcanic basalt caverns, luminescent crystalline geodes, glowing mineral rivers, and alien phosphor flora.',
    accentColor: '#A855F7',
    colors: [
      { name: 'Basalt Cavern Wall', hex: '#200F38', target: '#cave-walls', description: 'Dark igneous volcanic rock strata' },
      { name: 'Stalactite Strata', hex: '#4A237D', target: '#stalactites, #stalagmites', description: 'Mineral-banded ceiling & floor rock formations' },
      { name: 'Deep Amethyst', hex: '#9333EA', target: '#stalactites, #stalagmites', description: 'Rich purple subterranean mineral strata' },
      { name: 'Bioluminescent Cyan', hex: '#06B6D4', target: '#river', description: 'Thermal mineral-rich subterranean river' },
      { name: 'Subterranean Azure', hex: '#0284C7', target: '#river', description: 'Deep luminous underground water currents' },
      { name: 'Luminescent Rose Geode', hex: '#EC4899', target: '#crystal-gems', description: 'Vibrant glowing octagonal mineral crystal' },
      { name: 'Crystal Violet', hex: '#A855F7', target: '#crystal-gems', description: 'Deep glowing crystalline gem cluster' },
      { name: 'Phosphor Flora Green', hex: '#10B981', target: '#plants', description: 'Bioluminescent mushrooms and cavern fern fronds' },
      { name: 'Glowing Spore Mint', hex: '#34D399', target: '#plants', description: 'Luminous fungal droplets & spores' },
      { name: 'Specular Quartz Glint', hex: '#F8FAFC', target: '#crystal-gems', description: 'Crisp specular crystal facet highlights' },
    ],
  },
  gamma: {
    sectorId: 'gamma',
    sectorName: 'Sector 3 (Gamma)',
    themeTitle: 'Desert Plains & Volcanic Impact Basins',
    themeDescription: 'Scorched iron oxide terrain, distant volcanic basalt peaks, stepped canyon plateaus, scattered impact craters, and hardy desert vegetation.',
    accentColor: '#E11D48',
    colors: [
      { name: 'Scorched Twilight Sky', hex: '#F43F5E', target: '#sky', description: 'Incandescent Venusian surface sunset' },
      { name: 'Volcanic Basalt Ridge', hex: '#581E2B', target: '#mountains, #plateaus', description: 'Distant rolling volcanic basalt ranges' },
      { name: 'Stepped Plateau Rust', hex: '#752834', target: '#mountains, #plateaus', description: 'Tiered canyon stone cliffs catching sunlight' },
      { name: 'Terracotta Plateau', hex: '#B45309', target: '#mountains, #plateaus', description: 'Iron-rich desert plateaus and mesas' },
      { name: 'Standing Hoodoo Hematite', hex: '#8C303F', target: '#rock-formations', description: 'Wind-carved standing stone and desert pillars' },
      { name: 'Crater Basin Ash', hex: '#38141D', target: '#craters', description: 'Shadowed volcanic impact basin depression' },
      { name: 'Impact Ejecta Rim', hex: '#632535', target: '#craters', description: 'Raised rim and ejecta debris around crater walls' },
      { name: 'Deep Basin Obsidian', hex: '#1C0A0E', target: '#craters', description: 'Deep floor shadow of primary crater' },
      { name: 'Venusian Succulent Green', hex: '#059669', target: '#oasis-vegetation', description: 'High-pressure adapted desert fronds & succulents' },
      { name: 'Scorched Dune Sand', hex: '#D97706', target: '#mountains, #plateaus', description: 'Golden-orange windblown mineral sand' },
    ],
  },
  main: {
    sectorId: 'main',
    sectorName: 'AstroLink Core',
    themeTitle: 'Orbital AstroLink Hub',
    themeDescription: 'Orbital transmission relay station linking all three Venusian sectors into one central network.',
    accentColor: '#38BDF8',
    colors: [
      { name: 'Venus Atmosphere Core', hex: '#AB421F', target: '#hub-background', description: 'Underlying orange-red planetary atmosphere' },
      { name: 'Orbital Transmission Cyan', hex: '#38BDF8', target: '#tower', description: 'High-altitude laser transmission spire' },
      { name: 'Solar Array Gold', hex: '#F59E0B', target: '#tower', description: 'Photovoltaic station solar collectors' },
      { name: 'Station Alloy Steel', hex: '#64748B', target: '#tower', description: 'Primary orbital station structural frame' },
      { name: 'Thermal Radiator Copper', hex: '#E07A5F', target: '#hub-background', description: 'Heat radiation dissipation panels' },
      { name: 'Hub Optical Violet', hex: '#8B5CF6', target: '#tower', description: 'Central AstroLink optical routing core' },
      { name: 'Telemetry Emerald', hex: '#10B981', target: '#tower', description: 'Active signal lock telemetry status' },
      { name: 'Warning Beacon Coral', hex: '#F43F5E', target: '#tower', description: 'Orbital navigation warning strobe' },
      { name: 'Station Solar White', hex: '#F8FAFC', target: '#tower', description: 'Reflective anti-radiation thermal plating' },
      { name: 'Venus Orbit Void', hex: '#0F172A', target: '#hub-background', description: 'Deep space vacuum backdrop' },
    ],
  },
};

let venus3BlocksRegistered = false;

export function registerVenusLevel3Blocks() {
  registerVenusLevel1Blocks();
  FieldColorWheel.sectorPalettes = VENUS_SECTOR_PALETTES;
  if (venus3BlocksRegistered) return;
  venus3BlocksRegistered = true;

  // ===========================================================================
  // 1. HTML HEAD & LINK BLOCKS (for main / index.html)
  // ===========================================================================
  Blockly.Blocks['venus3_html_head'] = {
    init: function () {
      this.appendDummyInput().appendField('Page Header');
      this.appendStatementInput('CONTENT').setCheck('Venus3HtmlLink');
      this.setColour('#F59E0B');
      this.setTooltip('The page header area. Put your stylesheet connection inside!');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus3_html_head'] = function (block: Blockly.Block) {
    const content = (javascriptGenerator as any).statementToCode(block, 'CONTENT') || '';
    return `<head>\n${content}</head>\n\n`;
  };

  Blockly.Blocks['venus3_html_link'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Connect:')
        .appendField(
          new Blockly.FieldDropdown([
            ['alpha.css', 'alpha.css'],
            ['beta.css', 'beta.css'],
            ['gamma.css', 'gamma.css'],
          ]),
          'HREF'
        );
      this.setPreviousStatement(true, 'Venus3HtmlLink');
      this.setNextStatement(true, 'Venus3HtmlLink');
      this.setColour('#3B82F6');
      this.setTooltip('Plugs in your style file so colors appear on the station.');
    },
  };
  (javascriptGenerator as any).forBlock['venus3_html_link'] = function (block: Blockly.Block) {
    const href = block.getFieldValue('HREF') || 'alpha.css';
    return `  <link rel="stylesheet" href="${href}">\n`;
  };

  // ===========================================================================
  // INLINE CSS BLOCKS (for main / index.html elements)
  // ===========================================================================
  Blockly.Blocks['venus3_inline_tower'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Tower Color:')
        .appendField(new FieldColorWheel('#38BDF8'), 'COLOR');
      this.setPreviousStatement(true, 'Venus3Inline');
      this.setNextStatement(true, 'Venus3Inline');
      this.setColour('#8B5CF6');
      this.setTooltip('Paints the AstroLink transmission tower with this color.');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus3_inline_tower'] = function (block: Blockly.Block) {
    const color = block.getFieldValue('COLOR') || '#38BDF8';
    return `<div id="astrolink-tower" style="background-color: ${color};"></div>\n`;
  };

  Blockly.Blocks['venus3_inline_background'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Background Color:')
        .appendField(new FieldColorWheel('#AB421F'), 'COLOR');
      this.setPreviousStatement(true, 'Venus3Inline');
      this.setNextStatement(true, 'Venus3Inline');
      this.setColour('#EC4899');
      this.setTooltip('Paints the station background with this color.');
      disableBlockDuplication(this);
    },
  };
  (javascriptGenerator as any).forBlock['venus3_inline_background'] = function (block: Blockly.Block) {
    const color = block.getFieldValue('COLOR') || '#AB421F';
    return `<div id="hub-background" style="background-color: ${color};"></div>\n`;
  };

  // Helper to remove Duplicate from context menu on single-instance selector blocks (matches Venus Level 1)
  function disableBlockDuplication(block: any) {
    block.customContextMenu = function (options: any[]) {
      const dupIdx = options.findIndex((opt: any) => opt.text && /duplicate/i.test(opt.text));
      if (dupIdx !== -1) {
        options.splice(dupIdx, 1);
      }
    };
  }

  // ===========================================================================
  // 2. STYLING BLOCKS: Color & Border (Matches Venus Level 1 mechanics)
  // ===========================================================================
  Blockly.Blocks['venus3_style_fill'] = {
    init: function () {
      const activeSector = FieldColorWheel.activeSector;
      const defaultColor = activeSector === 'alpha'
        ? '#F59E0B' // Sulfuric Amber (Sector 1 Skies)
        : activeSector === 'beta'
        ? '#EC4899' // Luminescent Rose Geode (Sector 2 Cavern)
        : activeSector === 'gamma'
        ? '#B45309' // Terracotta Plateau (Sector 3 Desert)
        : '#38BDF8'; // Orbital Transmission Cyan (AstroLink)
      this.appendDummyInput()
        .appendField('Color:')
        .appendField(new FieldColorWheel(defaultColor), 'COLOR');
      this.setPreviousStatement(true, ['Venus3Style', 'VenusStyle']);
      this.setNextStatement(true, ['Venus3Style', 'VenusStyle']);
      this.setColour('#06B6D4');
      this.setTooltip('Paints this part with your chosen color from the color wheel.');
    },
  };
  (javascriptGenerator as any).forBlock['venus3_style_fill'] = function (block: Blockly.Block) {
    const color = block.getFieldValue('COLOR') || '#38BDF8';
    return `  fill: ${color};\n`;
  };

  // Compatibility generator for venus_style_bgcolor in Venus Level 3
  (javascriptGenerator as any).forBlock['venus_style_bgcolor'] = function (block: Blockly.Block) {
    const color = block.getFieldValue('COLOR') || '#00FF66';
    return `  fill: ${color};\n`;
  };

  // [ Set Border Edge: (Thickness) px (Style) (Color Wheel) ]
  Blockly.Blocks['venus3_style_border'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Set Border Edge:')
        .appendField(new Blockly.FieldNumber(2, 1, 16, 1), 'THICKNESS')
        .appendField('px')
        .appendField(
          new Blockly.FieldDropdown([
            ['solid', 'solid'],
            ['dashed', 'dashed'],
            ['dotted', 'dotted'],
          ]),
          'STYLE'
        )
        .appendField(new FieldColorWheel('#F59E0B'), 'COLOR');
      this.setPreviousStatement(true, ['Venus3Style', 'VenusStyle']);
      this.setNextStatement(true, ['Venus3Style', 'VenusStyle']);
      this.setColour('#F59E0B');
      this.setTooltip('Adds a solid, dashed, or dotted outline frame.');
    },
  };
  (javascriptGenerator as any).forBlock['venus3_style_border'] = function (block: Blockly.Block) {
    const thickness = block.getFieldValue('THICKNESS') || '2';
    const style = block.getFieldValue('STYLE') || 'solid';
    const color = block.getFieldValue('COLOR') || '#F59E0B';
    return `  border: ${thickness}px ${style} ${color};\n`;
  };
  (javascriptGenerator as any).forBlock['venus_style_border'] = (javascriptGenerator as any).forBlock['venus3_style_border'];

  // ===========================================================================
  // 3. SECTOR 1 SELECTORS (alpha.css) - Skies of Venus & Aerostat Station
  // ===========================================================================
  const sector1Targets = [
    { type: 'venus3_target_sky', selector: '#sky', label: '#sky', color: '#55244E', tip: 'Colors the sky of Venus.' },
    { type: 'venus3_target_clouds', selector: '#clouds', label: '#clouds', color: '#F59E0B', tip: 'Colors the clouds in the sky.' },
    { type: 'venus3_target_tower', selector: '#tower', label: '#tower', color: '#64748B', tip: 'Colors the communications tower.' },
    { type: 'venus3_target_tower_roof', selector: '#tower-roof', label: '#tower-roof', color: '#FACC15', tip: 'Colors the top dome of the tower.' },
    { type: 'venus3_target_airships', selector: '#airships', label: '#airships', color: '#EA580C', tip: 'Colors the flying airships.' },
  ];

  sector1Targets.forEach(({ type, selector, label, color, tip }) => {
    Blockly.Blocks[type] = {
      init: function () {
        this.appendDummyInput().appendField(`Selector: ${label}`);
        this.appendStatementInput('STYLES').setCheck(['Venus3Style', 'VenusStyle']);
        this.setPreviousStatement(true, 'Venus3Target');
        this.setNextStatement(true, 'Venus3Target');
        this.setColour(color);
        this.setTooltip(tip);
        disableBlockDuplication(this);
      },
    };
    (javascriptGenerator as any).forBlock[type] = function (block: Blockly.Block) {
      const styles = (javascriptGenerator as any).statementToCode(block, 'STYLES') || '';
      return `${selector} {\n${styles}}\n\n`;
    };
  });

  // ===========================================================================
  // 4. SECTOR 2 SELECTORS (beta.css) - Cavern of Whispers & Subterranean Venus
  // ===========================================================================
  const sector2Targets = [
    { type: 'venus3_target_cave_walls', selector: '#cave-walls', label: '#cave-walls', color: '#8B5CF6', tip: 'Colors the cave rock walls.' },
    { type: 'venus3_target_stalactites', selector: '#stalactites', label: '#stalactites', color: '#A855F7', tip: 'Colors the hanging ceiling rocks (stalactites).' },
    { type: 'venus3_target_stalagmites', selector: '#stalagmites', label: '#stalagmites', color: '#C084FC', tip: 'Colors the rising floor rocks (stalagmites).' },
    { type: 'venus3_target_rock_formations_beta', selector: '#stalactites, #stalagmites', label: '#stalactites, #stalagmites', color: '#9333EA', tip: 'Colors both the hanging and ground cave rocks.' },
    { type: 'venus3_target_river', selector: '#river', label: '#river', color: '#06B6D4', tip: 'Colors the underground cave river.' },
    { type: 'venus3_target_crystal_gems', selector: '#crystal-gems', label: '#crystal-gems', color: '#EC4899', tip: 'Colors the glowing crystal gems.' },
    { type: 'venus3_target_plants', selector: '#plants', label: '#plants', color: '#10B981', tip: 'Colors the cave mushrooms and plants.' },
  ];

  sector2Targets.forEach(({ type, selector, label, color, tip }) => {
    Blockly.Blocks[type] = {
      init: function () {
        this.appendDummyInput().appendField(`Selector: ${label}`);
        this.appendStatementInput('STYLES').setCheck(['Venus3Style', 'VenusStyle']);
        this.setPreviousStatement(true, 'Venus3Target');
        this.setNextStatement(true, 'Venus3Target');
        this.setColour(color);
        this.setTooltip(tip);
        disableBlockDuplication(this);
      },
    };
    (javascriptGenerator as any).forBlock[type] = function (block: Blockly.Block) {
      const styles = (javascriptGenerator as any).statementToCode(block, 'STYLES') || '';
      return `${selector} {\n${styles}}\n\n`;
    };
  });

  // ===========================================================================
  // 5. SECTOR 3 SELECTORS (gamma.css) - Scorched Dunes & Desert Oasis
  // ===========================================================================
  const sector3Targets = [
    { type: 'venus3_target_desert_sky', selector: '#sky', label: '#sky', color: '#F43F5E', tip: 'Colors the desert sunset sky.' },
    { type: 'venus3_target_desert_mountains', selector: '#mountains', label: '#mountains', color: '#581E2B', tip: 'Colors the volcanic desert mountains.' },
    { type: 'venus3_target_plateaus', selector: '#plateaus', label: '#plateaus', color: '#752834', tip: 'Colors the flat desert plateaus.' },
    { type: 'venus3_target_terrain_gamma', selector: '#mountains, #plateaus', label: '#mountains, #plateaus', color: '#B45309', tip: 'Colors the mountains and plateaus together.' },
    { type: 'venus3_target_rock_formations', selector: '#rock-formations', label: '#rock-formations', color: '#8C303F', tip: 'Colors the standing desert rocks.' },
    { type: 'venus3_target_craters', selector: '#craters', label: '#craters', color: '#38141D', tip: 'Colors the impact craters on the ground.' },
    { type: 'venus3_target_pond', selector: '#pond', label: '#pond', color: '#0284C7', tip: 'Colors the desert water pond.' },
    { type: 'venus3_target_oasis_vegetation', selector: '#oasis-vegetation', label: '#oasis-vegetation', color: '#059669', tip: 'Colors the desert palm trees and plants.' },
  ];

  sector3Targets.forEach(({ type, selector, label, color, tip }) => {
    Blockly.Blocks[type] = {
      init: function () {
        this.appendDummyInput().appendField(`Selector: ${label}`);
        this.appendStatementInput('STYLES').setCheck(['Venus3Style', 'VenusStyle']);
        this.setPreviousStatement(true, 'Venus3Target');
        this.setNextStatement(true, 'Venus3Target');
        this.setColour(color);
        this.setTooltip(tip);
        disableBlockDuplication(this);
      },
    };
    (javascriptGenerator as any).forBlock[type] = function (block: Blockly.Block) {
      const styles = (javascriptGenerator as any).statementToCode(block, 'STYLES') || '';
      return `${selector} {\n${styles}}\n\n`;
    };
  });
}

export const VENUS_3_SECTOR_1_BLOCKS = [
  { kind: 'block', type: 'venus3_target_sky' },
  { kind: 'block', type: 'venus3_target_clouds' },
  { kind: 'block', type: 'venus3_target_tower' },
  { kind: 'block', type: 'venus3_target_tower_roof' },
  { kind: 'block', type: 'venus3_target_airships' },
];

export const VENUS_3_SECTOR_2_BLOCKS = [
  { kind: 'block', type: 'venus3_target_cave_walls' },
  { kind: 'block', type: 'venus3_target_rock_formations_beta' },
  { kind: 'block', type: 'venus3_target_river' },
  { kind: 'block', type: 'venus3_target_crystal_gems' },
  { kind: 'block', type: 'venus3_target_plants' },
];

export const VENUS_3_SECTOR_3_BLOCKS = [
  { kind: 'block', type: 'venus3_target_desert_sky' },
  { kind: 'block', type: 'venus3_target_terrain_gamma' },
  { kind: 'block', type: 'venus3_target_rock_formations' },
  { kind: 'block', type: 'venus3_target_craters' },
  { kind: 'block', type: 'venus3_target_oasis_vegetation' },
];

export const VENUS_3_ALLOWED_BLOCKS_BY_TAB: Record<Venus3TabId, Set<string>> = {
  main: new Set([
    'venus3_html_head',
    'venus3_html_link',
    'venus3_inline_tower',
    'venus3_inline_background',
  ]),
  alpha: new Set([
    'venus3_target_sky',
    'venus3_target_clouds',
    'venus3_target_tower',
    'venus3_target_tower_roof',
    'venus3_target_airships',
    'venus3_style_fill',
    'venus_style_bgcolor',
    'venus3_style_border',
    'venus_style_border',
  ]),
  beta: new Set([
    'venus3_target_cave_walls',
    'venus3_target_stalactites',
    'venus3_target_stalagmites',
    'venus3_target_rock_formations_beta',
    'venus3_target_river',
    'venus3_target_crystal_gems',
    'venus3_target_plants',
    'venus3_style_fill',
    'venus_style_bgcolor',
    'venus3_style_border',
    'venus_style_border',
  ]),
  gamma: new Set([
    'venus3_target_desert_sky',
    'venus3_target_desert_mountains',
    'venus3_target_plateaus',
    'venus3_target_terrain_gamma',
    'venus3_target_rock_formations',
    'venus3_target_craters',
    'venus3_target_pond',
    'venus3_target_oasis_vegetation',
    'venus3_style_fill',
    'venus_style_bgcolor',
    'venus3_style_border',
    'venus_style_border',
  ]),
};

export function isBlockAllowedInTab(blockType: string, tabId: Venus3TabId): boolean {
  const allowed = VENUS_3_ALLOWED_BLOCKS_BY_TAB[tabId];
  return allowed ? allowed.has(blockType) : false;
}

/**
 * Returns dynamic category toolbox for the selected tab in Venus Level 3.
 * Filters out already-used selector blocks on the workspace (matching Venus Level 1 mechanics).
 * All categories use distinct vibrant colors.
 */
export function getVenusLevel3Toolbox(tabId: Venus3TabId = 'main', usedTypes: Set<string> | string[] = []) {
  registerVenusLevel3Blocks();
  const usedSet = usedTypes instanceof Set ? usedTypes : new Set(usedTypes);

  if (tabId === 'main') {
    const networkBlocks: any[] = [];
    if (!usedSet.has('venus3_html_head')) {
      networkBlocks.push({ kind: 'block', type: 'venus3_html_head' });
    }
    networkBlocks.push({ kind: 'block', type: 'venus3_html_link' });

    const astrolinkBlocks: any[] = [];
    if (!usedSet.has('venus3_inline_tower')) {
      astrolinkBlocks.push({ kind: 'block', type: 'venus3_inline_tower' });
    }
    if (!usedSet.has('venus3_inline_background')) {
      astrolinkBlocks.push({ kind: 'block', type: 'venus3_inline_background' });
    }

    return {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Network',
          colour: '#F59E0B',
          contents: networkBlocks,
        },
        {
          kind: 'category',
          name: 'Astrolink',
          colour: '#8B5CF6',
          contents: astrolinkBlocks,
        },
      ],
    };
  }

  if (tabId === 'alpha') {
    const available = VENUS_3_SECTOR_1_BLOCKS.filter(b => !usedSet.has(b.type));
    return {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Sector 1 Targets',
          colour: '#F59E0B', // Amber (Sulfuric Skies)
          contents: available,
        },
        {
          kind: 'category',
          name: 'Colors',
          colour: '#EC4899', // Hot Pink (Distinct from Amber)
          contents: [{ kind: 'block', type: 'venus3_style_fill' }],
        },
        {
          kind: 'category',
          name: 'Borders',
          colour: '#F59E0B', // Amber
          contents: [{ kind: 'block', type: 'venus3_style_border' }],
        },
      ],
    };
  }

  if (tabId === 'beta') {
    const available = VENUS_3_SECTOR_2_BLOCKS.filter(b => !usedSet.has(b.type));
    return {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Sector 2 Targets',
          colour: '#A855F7', // Purple (Crystalline Caverns)
          contents: available,
        },
        {
          kind: 'category',
          name: 'Colors',
          colour: '#06B6D4', // Cyan / Turquoise (Distinct from Purple)
          contents: [{ kind: 'block', type: 'venus3_style_fill' }],
        },
        {
          kind: 'category',
          name: 'Borders',
          colour: '#F59E0B', // Amber
          contents: [{ kind: 'block', type: 'venus3_style_border' }],
        },
      ],
    };
  }

  // gamma (Sector 3)
  const available = VENUS_3_SECTOR_3_BLOCKS.filter(b => !usedSet.has(b.type));
  return {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Sector 3 Targets',
        colour: '#E11D48', // Scorched Crimson (Desert Dunes)
        contents: available,
      },
      {
        kind: 'category',
        name: 'Colors',
        colour: '#06B6D4', // Cyan / Turquoise (Distinct from Crimson)
        contents: [{ kind: 'block', type: 'venus3_style_fill' }],
      },
      {
        kind: 'category',
        name: 'Borders',
        colour: '#F59E0B', // Amber
        contents: [{ kind: 'block', type: 'venus3_style_border' }],
      },
    ],
  };
}

/**
 * Parses the current active workspace into styles and code.
 */
export function parseVenusLevel3Workspace(
  workspace: Blockly.Workspace,
  tabId: Venus3TabId
): {
  code: string;
  styles: Record<string, string>;
  linkedStylesheets: string[];
  inlineStyles: {
    tower?: string;
    background?: string;
  };
  hasValidBlocks: boolean;
} {
  registerVenusLevel3Blocks();
  const allBlocks = workspace.getAllBlocks(false);
  const styles: Record<string, string> = {};
  const linkedStylesheets: string[] = [];
  let inlineTowerColor: string | undefined = undefined;
  let inlineBgColor: string | undefined = undefined;

  for (const block of allBlocks) {
    if (!isBlockAllowedInTab(block.type, tabId)) continue;
    if (block.type === 'venus3_inline_tower') {
      inlineTowerColor = block.getFieldValue('COLOR') || '#38BDF8';
    }
    if (block.type === 'venus3_inline_background') {
      inlineBgColor = block.getFieldValue('COLOR') || '#AB421F';
    }
  }

  const targetMapping: Record<string, string> = {
    venus3_target_sky: '#sky',
    venus3_target_mountains: '#mountains',
    venus3_target_tower: '#tower',
    venus3_target_tower_roof: '#tower-roof',
    venus3_target_clouds: '#clouds',
    venus3_target_airships: '#airships',
    venus3_target_cave_walls: '#cave-walls',
    venus3_target_stalactites: '#stalactites',
    venus3_target_stalagmites: '#stalagmites',
    venus3_target_rock_formations_beta: '#stalactites, #stalagmites',
    venus3_target_river: '#river',
    venus3_target_crystal_gems: '#crystal-gems',
    venus3_target_plants: '#plants',
    venus3_target_desert_sky: '#sky',
    venus3_target_desert_mountains: '#mountains',
    venus3_target_plateaus: '#plateaus',
    venus3_target_terrain_gamma: '#mountains, #plateaus',
    venus3_target_rock_formations: '#rock-formations',
    venus3_target_craters: '#craters',
    venus3_target_pond: '#pond',
    venus3_target_oasis_vegetation: '#oasis-vegetation',
  };

  const headBlocks = allBlocks.filter((b) => b.type === 'venus3_html_head' && isBlockAllowedInTab(b.type, tabId));
  for (const headBlock of headBlocks) {
    let child = headBlock.getInputTargetBlock('CONTENT');
    while (child) {
      if (child.type === 'venus3_html_link' && isBlockAllowedInTab(child.type, tabId)) {
        const href = child.getFieldValue('HREF');
        if (href && !linkedStylesheets.includes(href)) {
          linkedStylesheets.push(href);
        }
      }
      child = child.getNextBlock();
    }
  }

  for (const block of allBlocks) {
    if (!isBlockAllowedInTab(block.type, tabId)) continue;
    const selector = targetMapping[block.type];
    if (selector) {
      let child = block.getInputTargetBlock('STYLES');
      while (child) {
        if (child.type === 'venus3_style_fill' || child.type === 'venus_style_bgcolor') {
          const color = child.getFieldValue('COLOR');
          if (color) {
            styles[selector] = color;
          }
        } else if (child.type === 'venus3_style_border' || child.type === 'venus_style_border') {
          const thickness = Number(child.getFieldValue('THICKNESS')) || 2;
          const style = child.getFieldValue('STYLE') || 'solid';
          const color = child.getFieldValue('COLOR') || '#F59E0B';
          styles[`${selector}__border`] = JSON.stringify({ thickness, style, color });
        }
        child = child.getNextBlock();
      }
    }
  }

  // Generate code string
  javascriptGenerator.init(workspace);
  const topBlocks = workspace.getTopBlocks(true);
  let code = '';
  topBlocks.forEach((tb) => {
    if (!isBlockAllowedInTab(tb.type, tabId)) return;
    const blockCode = (javascriptGenerator as any).blockToCode(tb);
    if (typeof blockCode === 'string') {
      code += blockCode;
    } else if (Array.isArray(blockCode)) {
      code += blockCode[0] || '';
    }
  });

  return {
    code: code.trim() || '/* No code generated */',
    styles,
    linkedStylesheets,
    inlineStyles: {
      tower: inlineTowerColor,
      background: inlineBgColor,
    },
    hasValidBlocks:
      Object.keys(styles).length > 0 ||
      linkedStylesheets.length > 0 ||
      Boolean(inlineTowerColor || inlineBgColor),
  };
}
