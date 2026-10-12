import { mapMissionIdToPlanet } from "./missionMapper";

interface MissionProgressRow {
  missionId: string;
  status: string;
}

export function computeUnlockStatus(
  pathOrder: string[],
  userMissions: MissionProgressRow[]
) {
  // Fall back to main's fixed sequence if pathOrder is null, undefined, or empty
  const activePathOrder = (!pathOrder || pathOrder.length === 0)
    ? ["MOON", "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"]
    : pathOrder;

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
  for (let i = 0; i < activePathOrder.length; i++) {
    if (isPlanetCompleted(activePathOrder[i])) {
      sequentialUnlockedIndex = Math.min(activePathOrder.length - 1, i + 1);
    } else {
      break;
    }
  }

  // 4. Return the status for each planet, enforcing Web Lock:
  // Moon must be completed for Mars; Mars for Venus; Venus for Mercury
  const moonDone = isPlanetCompleted('moon');
  const marsDone = isPlanetCompleted('mars');
  const venusDone = isPlanetCompleted('venus');

  const statuses = activePathOrder.map((planetId, index) => {
    const p = planetId.toLowerCase();
    
    if (isPlanetCompleted(p)) return 'COMPLETED';
    
    // Strict web lock enforcement
    if (p === 'mars' && !moonDone) return 'LOCKED';
    if (p === 'venus' && (!moonDone || !marsDone)) return 'LOCKED';
    if (p === 'mercury' && (!moonDone || !marsDone || !venusDone)) return 'LOCKED';

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
