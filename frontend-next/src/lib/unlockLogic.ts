import { mapMissionIdToPlanet } from "./missionMapper";

interface MissionProgressRow {
  missionId: string;
  status: string;
}

const VALID_PLANETS = new Set(["MOON", "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"]);
export const DEFAULT_PATH_ORDER = ["MOON", "MARS", "VENUS", "MERCURY", "JUPITER", "SATURN", "EARTH"];
const WEB_ORDER = ["MARS", "VENUS", "MERCURY"];
const LOGIC_DEFAULT = ["JUPITER", "SATURN", "EARTH"];

export function normalizePathOrder(order?: string[] | null): string[] {
  if (!order || !Array.isArray(order) || order.length === 0) {
    return [...DEFAULT_PATH_ORDER];
  }

  // 1. Uppercase, dedupe, drop unknown ids
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const raw of order) {
    if (typeof raw !== 'string') continue;
    const upper = raw.trim().toUpperCase();
    if (VALID_PLANETS.has(upper) && !seen.has(upper)) {
      seen.add(upper);
      cleaned.push(upper);
    }
  }

  if (cleaned.length === 0) {
    return [...DEFAULT_PATH_ORDER];
  }

  // 2. Separate Moon (Moon is always first)
  const nonMoon = cleaned.filter(p => p !== "MOON");

  // 3. Find where the earliest web planet appeared
  const firstWebIndex = nonMoon.findIndex(p => WEB_ORDER.includes(p));

  // 4. Logic planets keep their relative order, append missing logic planets
  const logicInOrder = nonMoon.filter(p => LOGIC_DEFAULT.includes(p));
  for (const lp of LOGIC_DEFAULT) {
    if (!logicInOrder.includes(lp)) {
      logicInOrder.push(lp);
    }
  }

  // 5. Assemble sequence: MARS, VENUS, MERCURY contiguous placed where earliest web planet appeared
  let finalNonMoon: string[];
  if (firstWebIndex === -1) {
    finalNonMoon = [...logicInOrder, ...WEB_ORDER];
  } else {
    const logicBefore = nonMoon.slice(0, firstWebIndex).filter(p => LOGIC_DEFAULT.includes(p));
    const logicAfter = logicInOrder.filter(p => !logicBefore.includes(p));
    finalNonMoon = [...logicBefore, ...WEB_ORDER, ...logicAfter];
  }

  return ["MOON", ...finalNonMoon];
}

export function computeUnlockStatus(
  pathOrder: string[] | null | undefined,
  userMissions: MissionProgressRow[]
) {
  const activePathOrder = normalizePathOrder(pathOrder);

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

export function resolveNextPlanet(order: string[] | null | undefined, currentPlanetId: string): string | null {
  const activePathOrder = normalizePathOrder(order);
  const cur = currentPlanetId.trim().toUpperCase();
  const currentIndex = activePathOrder.findIndex(p => p === cur);
  if (currentIndex !== -1 && currentIndex + 1 < activePathOrder.length) {
    return activePathOrder[currentIndex + 1].toLowerCase();
  }
  return null;
}

