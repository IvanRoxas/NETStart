import { mapMissionIdToPlanet } from "./missionMapper";

interface MissionProgressRow {
  missionId: string;
  status: string;
}

export function computeUnlockStatus(
  pathOrder: string[],
  userMissions: MissionProgressRow[]
) {
  // 1. Identify all planets with any progress (started or completed)
  const startedPlanets = new Set<string>();
  userMissions.forEach(m => {
    const p = mapMissionIdToPlanet(m.missionId);
    if (p && p !== 'moon') {
      startedPlanets.add(p);
    }
  });

  // 2. Count COMPLETED missions per planet
  const completedCounts: Record<string, number> = {};
  let finalCompleted = new Set<string>();

  userMissions.forEach(m => {
    if (m.status === 'COMPLETED') {
      const p = mapMissionIdToPlanet(m.missionId);
      if (p) {
        completedCounts[p] = (completedCounts[p] || 0) + 1;
        const mid = m.missionId.toLowerCase();
        if (mid === `${p}-3` || mid === `html-3-${p}` || mid === `css-3-${p}`) {
          finalCompleted.add(p);
        }
      }
    }
  });

  const isPlanetCompleted = (planetId: string) => {
    const p = planetId.toLowerCase();
    return (completedCounts[p] || 0) >= 3 || finalCompleted.has(p);
  };

  // 3. Find sequential unlocked index
  let sequentialUnlockedIndex = 0;
  for (let i = 0; i < pathOrder.length; i++) {
    if (isPlanetCompleted(pathOrder[i])) {
      sequentialUnlockedIndex = Math.min(pathOrder.length - 1, i + 1);
    } else {
      break;
    }
  }

  // 4. Return the status for each planet
  const statuses = pathOrder.map((planetId, index) => {
    const p = planetId.toLowerCase();
    
    if (isPlanetCompleted(p)) return 'COMPLETED';
    
    if (index === sequentialUnlockedIndex) return 'CURRENT';

    if (startedPlanets.has(p)) return 'CURRENT';

    if (index < sequentialUnlockedIndex) return 'COMPLETED';

    return 'LOCKED';
  });

  return {
    statuses,
    sequentialUnlockedIndex,
    startedPlanets: Array.from(startedPlanets),
    completedCounts
  };
}
