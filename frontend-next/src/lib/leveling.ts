export const LEVEL_THRESHOLDS = [
  { level: 1, nextLevelAt: 200 },
  { level: 2, nextLevelAt: 500 },
  { level: 3, nextLevelAt: 900 },
  { level: 4, nextLevelAt: 1400 },
  { level: 5, nextLevelAt: 2000 },
  { level: 6, nextLevelAt: 2700 },
  { level: 7, nextLevelAt: 3500 },
  { level: 8, nextLevelAt: 4400 },
  { level: 9, nextLevelAt: 5400 },
  { level: 10, nextLevelAt: 999999 },
];

export function calculateLevel(xp: number) {
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp < threshold.nextLevelAt) {
      return threshold.level;
    }
  }
  return 10;
}

export function getProgressToNextLevel(xp: number) {
  const currentLevel = calculateLevel(xp);
  
  if (currentLevel >= 10) return 100;

  const currentThresholdIndex = currentLevel - 1;
  const nextThreshold = LEVEL_THRESHOLDS[currentThresholdIndex].nextLevelAt;
  
  const progress = Math.min(100, Math.max(0, (xp / nextThreshold) * 100));
  
  return progress;
}

export function getXPDetails(xp: number) {
  const level = calculateLevel(xp);
  const progress = getProgressToNextLevel(xp);
  const currentThresholdIndex = level - 1;
  const nextThreshold = level < 10 ? LEVEL_THRESHOLDS[currentThresholdIndex].nextLevelAt : xp;
  return { level, progress, nextThreshold };
}
