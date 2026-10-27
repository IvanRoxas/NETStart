import { normalizePathOrder, computeUnlockStatus, resolveNextPlanet } from '../src/lib/unlockLogic';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

console.log('--- Testing Mission Complete & Path Order Dynamic Resolution ---\n');

// 1. Test normalizePathOrder with Jupiter-first path
const rawJupiterFirst = ['MOON', 'JUPITER', 'MARS', 'VENUS', 'MERCURY', 'SATURN', 'EARTH'];
const normalized = normalizePathOrder(rawJupiterFirst);
assert(
  JSON.stringify(normalized) === JSON.stringify(rawJupiterFirst),
  `Normalized Jupiter-first order matches input: ${normalized.join(' -> ')}`
);

// 2. Test resolveNextPlanet in Jupiter-first order
assert(
  resolveNextPlanet(rawJupiterFirst, 'moon') === 'jupiter',
  'After Moon, next unlocked planet is JUPITER (not Mars)'
);
assert(
  resolveNextPlanet(rawJupiterFirst, 'jupiter') === 'mars',
  'After Jupiter, next unlocked planet is MARS'
);
assert(
  resolveNextPlanet(rawJupiterFirst, 'mars') === 'venus',
  'After Mars, next unlocked planet is VENUS'
);
assert(
  resolveNextPlanet(rawJupiterFirst, 'venus') === 'mercury',
  'After Venus, next unlocked planet is MERCURY'
);
assert(
  resolveNextPlanet(rawJupiterFirst, 'mercury') === 'saturn',
  'After Mercury, next unlocked planet is SATURN'
);
assert(
  resolveNextPlanet(rawJupiterFirst, 'saturn') === 'earth',
  'After Saturn, next unlocked planet is EARTH'
);
assert(
  resolveNextPlanet(rawJupiterFirst, 'earth') === null,
  'After Earth, next planet is null (end of constellation)'
);

// 3. Test resolveNextPlanet fallback with null/empty pathOrder
assert(
  resolveNextPlanet(null, 'moon') === 'mars',
  'Null pathOrder defaults to Moon -> Mars'
);
assert(
  resolveNextPlanet(undefined, 'mercury') === 'jupiter',
  'Null pathOrder defaults to Mercury -> Jupiter'
);
assert(
  resolveNextPlanet([], 'jupiter') === 'saturn',
  'Empty pathOrder defaults to Jupiter -> Saturn'
);

// 4. Test unlock indicators for Jupiter-first order
const step0Missions: { missionId: string; status: string }[] = [];
const step0Status = computeUnlockStatus(rawJupiterFirst, step0Missions);
assert(step0Status.statuses[0] === 'CURRENT', 'Step 0: Moon is CURRENT');
assert(step0Status.statuses[1] === 'LOCKED', 'Step 0: Jupiter is LOCKED');
assert(step0Status.statuses[2] === 'LOCKED', 'Step 0: Mars is LOCKED');

const step1Missions = [
  { missionId: 'moon-1', status: 'COMPLETED' },
  { missionId: 'moon-2', status: 'COMPLETED' },
  { missionId: 'moon-3', status: 'COMPLETED' },
];
const step1Status = computeUnlockStatus(rawJupiterFirst, step1Missions);
assert(step1Status.statuses[0] === 'COMPLETED', 'Step 1: Moon is COMPLETED');
assert(step1Status.statuses[1] === 'CURRENT', 'Step 1: Jupiter is CURRENT');
assert(step1Status.statuses[2] === 'LOCKED', 'Step 1: Mars is still LOCKED');

const step2Missions = [
  ...step1Missions,
  { missionId: 'jupiter-1', status: 'COMPLETED' },
  { missionId: 'jupiter-2', status: 'COMPLETED' },
  { missionId: 'jupiter-3', status: 'COMPLETED' },
];
const step2Status = computeUnlockStatus(rawJupiterFirst, step2Missions);
assert(step2Status.statuses[0] === 'COMPLETED', 'Step 2: Moon is COMPLETED');
assert(step2Status.statuses[1] === 'COMPLETED', 'Step 2: Jupiter is COMPLETED');
assert(step2Status.statuses[2] === 'CURRENT', 'Step 2: Mars is now CURRENT');

console.log('\nAll Jupiter-first order tests PASSED successfully!');
