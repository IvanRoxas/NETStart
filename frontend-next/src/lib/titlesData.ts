export type TitleRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
export type TitleCategory = 'STARTER' | 'DIAGNOSTIC' | 'EXPEDITION' | 'DAILY' | 'COSMETIC' | 'MASTERY';

export interface TitleDefinition {
  id: string;
  name: string;
  description: string;
  unlockRequirement: string;
  rarity: TitleRarity;
  category: TitleCategory;
  glyph: string;
}

export const TITLES_LIST: TitleDefinition[] = [
  // 1. Starter
  {
    id: 'title-novice-explorer',
    name: 'Novice Explorer',
    description: 'Cadet who took their first steps into the NETStart constellation.',
    unlockRequirement: 'Granted to all cadets upon academy registration.',
    rarity: 'COMMON',
    category: 'STARTER',
    glyph: '✦',
  },
  // 2. Diagnostic
  {
    id: 'title-logic-prodigy',
    name: 'Logic Analyst',
    description: 'Demonstrated analytical computational thinking in the diagnostic assessment.',
    unlockRequirement: 'Complete the Diagnostic Aptitude Assessment.',
    rarity: 'UNCOMMON',
    category: 'DIAGNOSTIC',
    glyph: '❖',
  },
  // 3. Moon Campaign (Tutorial & Syntax)
  {
    id: 'title-lunar-pioneer',
    name: 'Syntax Scout',
    description: 'Mastered coding syntax and foundations on the Moon.',
    unlockRequirement: 'Clear the Moon planetary campaign.',
    rarity: 'RARE',
    category: 'EXPEDITION',
    glyph: '☾',
  },
  // 4. Mars Campaign (HTML5)
  {
    id: 'title-planetary-pioneer',
    name: 'Web Builder',
    description: 'Mastered HTML structure and hyperlinks across Mars.',
    unlockRequirement: 'Clear the Mars planetary campaign.',
    rarity: 'RARE',
    category: 'EXPEDITION',
    glyph: '☄',
  },
  // 5. Venus Campaign (CSS)
  {
    id: 'title-venusian-voyager',
    name: 'Style Artist',
    description: 'Mastered CSS styling, colors, and layout design on Venus.',
    unlockRequirement: 'Clear the Venus planetary campaign.',
    rarity: 'RARE',
    category: 'EXPEDITION',
    glyph: '♨',
  },
  // 6. Mercury Campaign (JavaScript)
  {
    id: 'title-mercurian-scout',
    name: 'Script Runner',
    description: 'Mastered JavaScript events and dynamic interactivity on Mercury.',
    unlockRequirement: 'Clear the Mercury planetary campaign.',
    rarity: 'RARE',
    category: 'EXPEDITION',
    glyph: '⚡',
  },
  // 7. Jupiter Campaign (Java)
  {
    id: 'title-jovian-sovereign',
    name: 'Java Titan',
    description: 'Mastered Java classes, OOP, and exception handling on Jupiter.',
    unlockRequirement: 'Clear the Jupiter planetary campaign.',
    rarity: 'EPIC',
    category: 'EXPEDITION',
    glyph: '🌪',
  },
  // 8. Saturn Campaign (C++)
  {
    id: 'title-void-architect',
    name: 'System Pilot',
    description: 'Mastered C++ pointers, memory, and performance loops on Saturn.',
    unlockRequirement: 'Clear the Saturn planetary campaign.',
    rarity: 'EPIC',
    category: 'EXPEDITION',
    glyph: '◆',
  },
  // 9. Earth Campaign (Python)
  {
    id: 'title-terran-maestro',
    name: 'Python Master',
    description: 'Mastered Python algorithms and data structures on Earth.',
    unlockRequirement: 'Clear the Earth planetary campaign.',
    rarity: 'LEGENDARY',
    category: 'EXPEDITION',
    glyph: '◈',
  },
  // 10. All 7 Planets / Max Level 10 (Full Stack Mastery)
  {
    id: 'title-grand-celestial-master',
    name: 'Full Stack Master',
    description: 'The pinnacle rank: conquered all programming languages in the constellation.',
    unlockRequirement: 'Reach Level 10 or complete all 7 planetary constellations.',
    rarity: 'MYTHIC',
    category: 'MASTERY',
    glyph: '👑',
  },
  // 11. Daily Gauntlet
  {
    id: 'title-daily-vanguard',
    name: 'Daily Solver',
    description: 'Consistently solved daily orbital programming challenges.',
    unlockRequirement: 'Complete at least 1 Daily Challenge Level.',
    rarity: 'RARE',
    category: 'DAILY',
    glyph: '☼',
  },
  // 12. Cosmetics & Customization
  {
    id: 'title-cosmic-stylist',
    name: 'Cosmic Collector',
    description: 'Personalized cadet gear with custom themes, borders, and cosmetics.',
    unlockRequirement: 'Purchase any cosmetic item or equip a custom profile background.',
    rarity: 'RARE',
    category: 'COSMETIC',
    glyph: '✧',
  },
];

// Mapping of planet ID to awarded title ID
export const PLANET_TITLE_MAP: Record<string, string> = {
  moon: 'title-lunar-pioneer',
  mars: 'title-planetary-pioneer',
  venus: 'title-venusian-voyager',
  mercury: 'title-mercurian-scout',
  jupiter: 'title-jovian-sovereign',
  saturn: 'title-void-architect',
  earth: 'title-terran-maestro',
};

// Helper to look up a title definition by name or ID (case-insensitive)
export function getTitleDefinition(titleOrId?: string | null): TitleDefinition {
  if (!titleOrId) return TITLES_LIST[0];
  const query = titleOrId.trim().toLowerCase();

  const found = TITLES_LIST.find(
    (t) => t.id.toLowerCase() === query || t.name.toLowerCase() === query
  );

  if (found) return found;

  // Graceful legacy mappings for older or approximate title strings
  if (query.includes('lunar') || query.includes('moon') || query.includes('syntax')) return getTitleDefinition('title-lunar-pioneer');
  if (query.includes('venus') || query.includes('style') || query.includes('artist')) return getTitleDefinition('title-venusian-voyager');
  if (query.includes('mercury') || query.includes('script') || query.includes('runner')) return getTitleDefinition('title-mercurian-scout');
  if (query.includes('jovian') || query.includes('jupiter') || query.includes('java') || query.includes('titan')) return getTitleDefinition('title-jovian-sovereign');
  if (query.includes('logic') || query.includes('analyst') || query.includes('prodigy')) return getTitleDefinition('title-logic-prodigy');
  if (query.includes('pioneer') || query.includes('mars') || query.includes('web') || query.includes('builder')) return getTitleDefinition('title-planetary-pioneer');
  if (query.includes('void') || query.includes('saturn') || query.includes('system') || query.includes('pilot')) return getTitleDefinition('title-void-architect');
  if (query.includes('vanguard') || query.includes('solver') || query.includes('daily')) return getTitleDefinition('title-daily-vanguard');
  if (query.includes('stylist') || query.includes('collector') || query.includes('cosmic')) return getTitleDefinition('title-cosmic-stylist');
  if (query.includes('terran') || query.includes('earth') || query.includes('python')) return getTitleDefinition('title-terran-maestro');
  if (query.includes('master') || query.includes('celestial') || query.includes('grand') || query.includes('full stack')) return getTitleDefinition('title-grand-celestial-master');

  // Fallback to Novice Explorer
  return TITLES_LIST[0];
}

export interface UserProgressionContext {
  level: number;
  xp: number;
  isVerified?: boolean;
  hasTakenAptitudeTest?: boolean;
  unlockedTriggerCodes: Set<string>;
  dailyCompletedDatesCount?: number;
  inventoryCount?: number;
}

// Evaluate unlock status for all titles
export function evaluateTitleUnlocks(ctx: UserProgressionContext): Record<string, boolean> {
  const result: Record<string, boolean> = {};

  // 1. Novice Explorer: Always unlocked
  result['title-novice-explorer'] = true;

  // 2. Logic Prodigy: Aptitude test completed
  result['title-logic-prodigy'] = !!(
    ctx.hasTakenAptitudeTest ||
    ctx.unlockedTriggerCodes.has('B_APTITUDE_TEST')
  );

  // 3. Moon: Lunar Pioneer
  result['title-lunar-pioneer'] = !!(
    ctx.unlockedTriggerCodes.has('B_COMPLETE_MOON')
  );

  // 4. Mars: Planetary Pioneer
  result['title-planetary-pioneer'] = !!(
    ctx.unlockedTriggerCodes.has('B_COMPLETE_MARS')
  );

  // 5. Venus: Venusian Voyager
  result['title-venusian-voyager'] = !!(
    ctx.unlockedTriggerCodes.has('B_COMPLETE_VENUS')
  );

  // 6. Mercury: Mercurian Scout
  result['title-mercurian-scout'] = !!(
    ctx.unlockedTriggerCodes.has('B_COMPLETE_MERCURY')
  );

  // 7. Jupiter: Jovian Sovereign
  result['title-jovian-sovereign'] = !!(
    ctx.unlockedTriggerCodes.has('B_COMPLETE_JUPITER')
  );

  // 8. Saturn: Void Architect
  result['title-void-architect'] = !!(
    ctx.unlockedTriggerCodes.has('B_COMPLETE_SATURN')
  );

  // 9. Earth: Terran Maestro
  result['title-terran-maestro'] = !!(
    ctx.unlockedTriggerCodes.has('B_COMPLETE_EARTH')
  );

  // 10. Grand Celestial Master: Max Level 10 or All Planets completed
  result['title-grand-celestial-master'] = !!(
    ctx.level >= 10 ||
    ctx.unlockedTriggerCodes.has('B_REACH_LVL10') ||
    ctx.unlockedTriggerCodes.has('B_COMPLETE_ALL_PLANETS')
  );

  // 11. Daily Vanguard: At least 1 daily challenge completed
  result['title-daily-vanguard'] = !!(
    (ctx.dailyCompletedDatesCount && ctx.dailyCompletedDatesCount > 0) ||
    ctx.unlockedTriggerCodes.has('B_FIRST_MISSION')
  );

  // 12. Cosmic Stylist: Shop purchase or background equipped
  result['title-cosmic-stylist'] = !!(
    ctx.unlockedTriggerCodes.has('B_BUY_REWARD') ||
    ctx.unlockedTriggerCodes.has('B_CHANGE_BG') ||
    (ctx.inventoryCount && ctx.inventoryCount > 1)
  );

  return result;
}
