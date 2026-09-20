import { XP_REWARDS } from './xpEconomy';

export const MAX_LEVEL = 10;
export const TOTAL_MAX_XP = 5000;

/**
 * Exact Level 10 Cumulative XP Threshold Array:
 * - Level 2: 200 XP (Instant level up upon Account Creation + Verification)
 * - Level 3: 500 XP
 * - Level 4: 900 XP
 * - Level 5: 1,400 XP
 * - Level 6: 2,000 XP
 * - Level 7: 2,700 XP
 * - Level 8: 3,400 XP
 * - Level 9: 4,200 XP
 * - Level 10 (MAX): 5,000 XP
 */
export interface LevelThreshold {
  level: number;
  xpRequired: number; // XP needed within this step to reach the next level
  cumulativeXp: number; // Total cumulative XP threshold required to reach next level
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, xpRequired: 200, cumulativeXp: 200 },
  { level: 2, xpRequired: 300, cumulativeXp: 500 },
  { level: 3, xpRequired: 400, cumulativeXp: 900 },
  { level: 4, xpRequired: 500, cumulativeXp: 1400 },
  { level: 5, xpRequired: 600, cumulativeXp: 2000 },
  { level: 6, xpRequired: 700, cumulativeXp: 2700 },
  { level: 7, xpRequired: 700, cumulativeXp: 3400 },
  { level: 8, xpRequired: 800, cumulativeXp: 4200 },
  { level: 9, xpRequired: 800, cumulativeXp: 5000 },
  { level: 10, xpRequired: 0, cumulativeXp: 5000 },
];

/**
 * Calculates the player's level from cumulative XP.
 * Hard capped at Level 10.
 */
export function calculateLevel(xp: number): number {
  if (xp >= TOTAL_MAX_XP) return MAX_LEVEL;

  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp < threshold.cumulativeXp) {
      return threshold.level;
    }
  }
  return MAX_LEVEL;
}

/**
 * Returns progress percentage (0 - 100) toward the next level.
 * If playerLevel === 10, returns 100%.
 */
export function getProgressToNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  
  if (currentLevel >= MAX_LEVEL) return 100;

  const currentLevelIndex = currentLevel - 1;
  const currentThreshold = LEVEL_THRESHOLDS[currentLevelIndex];
  
  const baseXp = currentLevel === 1 ? 0 : LEVEL_THRESHOLDS[currentLevelIndex - 1].cumulativeXp;
  const xpGainedInLevel = Math.max(0, xp - baseXp);
  const xpRequiredForLevel = currentThreshold.xpRequired;

  if (xpRequiredForLevel <= 0) return 100;

  const progress = Math.min(100, Math.max(0, (xpGainedInLevel / xpRequiredForLevel) * 100));
  return progress;
}

export interface XPDetails {
  level: number;
  progress: number;
  currentXp: number;
  levelCurrentXp: number;
  levelRequiredXp: number;
  baseXp: number;
  nextThreshold: number | "MAX";
  xpToNextLevel: number | "MAX";
  isMaxLevel: boolean;
}

/**
 * Returns comprehensive leveling and progression metrics for a given XP value.
 */
export function getXPDetails(xp: number): XPDetails {
  const level = calculateLevel(xp);
  const isMaxLevel = level >= MAX_LEVEL;
  const progress = getProgressToNextLevel(xp);

  if (isMaxLevel) {
    return {
      level: MAX_LEVEL,
      progress: 100,
      currentXp: xp,
      levelCurrentXp: 800,
      levelRequiredXp: 800,
      baseXp: 4200,
      nextThreshold: "MAX",
      xpToNextLevel: "MAX",
      isMaxLevel: true,
    };
  }

  const currentLevelIndex = level - 1;
  const currentThreshold = LEVEL_THRESHOLDS[currentLevelIndex];
  const baseXp = level === 1 ? 0 : LEVEL_THRESHOLDS[currentLevelIndex - 1].cumulativeXp;
  const levelRequiredXp = currentThreshold.xpRequired;
  const levelCurrentXp = Math.max(0, Math.min(levelRequiredXp, xp - baseXp));
  const nextCumulative = currentThreshold.cumulativeXp;
  const xpRemaining = Math.max(0, nextCumulative - xp);

  return {
    level,
    progress,
    currentXp: xp,
    levelCurrentXp,
    levelRequiredXp,
    baseXp,
    nextThreshold: nextCumulative,
    xpToNextLevel: xpRemaining,
    isMaxLevel: false,
  };
}

export { XP_REWARDS };
