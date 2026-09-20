export type GridTileType = 'PATH' | 'HAZARD' | 'START' | 'IGNITION' | 'NODE' | 'TERMINAL' | 'VOID';

export interface DashboardNodeProperty {
  color: 'Blue' | 'Red' | 'Green';
  state: 'Stable' | 'Blinking';
}

/**
 * Phase 1: The Matrix Entity Dictionary
 * Strict mapping of grid integers:
 * 0: VOID (Walls / Empty space)
 * 1: PATH (Drivable tile)
 * 2: HAZARD (Corrupted circuitry; fail state)
 * 3: START (Rover spawn point)
 * 8: IGNITION (Final goal tile)
 */
export const GRID_ENTITIES: Record<number, GridTileType> = {
  0: 'VOID',
  1: 'PATH',
  2: 'HAZARD',
  3: 'START',
  8: 'IGNITION',
};

/**
 * Phase 2: The Dual-Property Node Registry
 * Any integer 10 and above is treated as a Dashboard Node.
 */
export const nodeRegistry: Record<number, DashboardNodeProperty> = {
  10: { color: 'Blue', state: 'Stable' },
  11: { color: 'Red', state: 'Blinking' },
  12: { color: 'Green', state: 'Stable' },
  13: { color: 'Blue', state: 'Blinking' },
  14: { color: 'Green', state: 'Blinking' },
};

/**
 * Section 3 Mission Control Terminals
 */
export const terminalRegistry: Record<number, { id: string; label: string }> = {
  21: { id: 'hard_nav', label: 'Maze Navigation Terminal' },
  22: { id: 'hard_sort', label: 'Fast Power Sorter Terminal' },
  23: { id: 'hard_logic', label: 'Master Logic Terminal' },
};

export function parseTile(tileCode: number): {
  type: GridTileType;
  node?: DashboardNodeProperty;
  terminal?: { id: string; label: string };
} {
  if (nodeRegistry[tileCode]) {
    return { type: 'NODE', node: nodeRegistry[tileCode] };
  }
  if (terminalRegistry[tileCode]) {
    return { type: 'TERMINAL', terminal: terminalRegistry[tileCode] };
  }
  return { type: GRID_ENTITIES[tileCode] || 'VOID' };
}
