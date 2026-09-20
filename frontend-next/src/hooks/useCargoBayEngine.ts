"use client";

import { useState, useCallback } from 'react';

export type GridEntityType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface InventoryState {
  fuel: number;
  oxygen: number;
}

export interface EntitySummary {
  fuelCount: number;
  oxygenCount: number;
  junkCount: number;
  itemPositions: { x: number; y: number; type: 'fuel' | 'oxygen' | 'junk' }[];
}

/**
 * Parses any matrix and returns detailed entity coordinates and totals.
 * Useful for automated QA testing and game state synchronization.
 */
export function parseMatrixEntities(maze: number[][]): EntitySummary {
  let fuelCount = 0;
  let oxygenCount = 0;
  let junkCount = 0;
  const itemPositions: { x: number; y: number; type: 'fuel' | 'oxygen' | 'junk' }[] = [];

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < (maze[y]?.length ?? 0); x++) {
      const tile = maze[y][x];
      if (tile === 5) {
        fuelCount++;
        itemPositions.push({ x, y, type: 'fuel' });
      } else if (tile === 6) {
        oxygenCount++;
        itemPositions.push({ x, y, type: 'oxygen' });
      } else if (tile === 7) {
        junkCount++;
        itemPositions.push({ x, y, type: 'junk' });
      }
    }
  }

  return { fuelCount, oxygenCount, junkCount, itemPositions };
}

/**
 * Generates Section 1 matrix: 1x6 straight line of Fuel (5) crates.
 * Dimensions: 8x3 with playable corridor at row 1 from x=1 to x=6.
 */
export function generateSection1Matrix(): number[][] {
  return [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 5, 5, 5, 5, 5, 5, 0], // 6 fuel crates on tiles (1,1) through (6,1)
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];
}

/**
 * Generates Section 2 matrix: 1x8 straight conveyor line randomly populated with Fuel (5) or Junk (7).
 * Dimensions: 10x3 with playable conveyor at row 1 from x=1 to x=8.
 */
export function generateSection2Matrix(): number[][] {
  // Ensure at least 3 fuel and 2 junk spawn for engaging sorting
  const items: number[] = [];
  for (let i = 0; i < 8; i++) {
    // 55% Fuel, 45% Junk
    items.push(Math.random() < 0.55 ? 5 : 7);
  }
  // Guarantee at least 2 of each
  if (!items.includes(5)) items[0] = 5;
  if (!items.includes(7)) items[1] = 7;

  return [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, items[0], items[1], items[2], items[3], items[4], items[5], items[6], items[7], 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
}

/**
 * Generates Section 3 matrix: Capital "T" Junction map.
 * Spawn 1 random probe item (Fuel 5 or Oxygen 6) directly in front of start at (3,2).
 * Left arm has 2 Fuel (5) crates at (1,1), (2,1).
 * Right arm has 2 Oxygen (6) tanks at (4,1), (5,1).
 */
export function generateSection3Matrix(forcedItem?: 5 | 6): { maze: number[][]; probeItem: 5 | 6 } {
  const probeItem: 5 | 6 = forcedItem ?? (Math.random() < 0.5 ? 5 : 6);

  // Capital T: Stem at col 3 (from row 3 up to row 1), Arms from col 1 to col 5 at row 1.
  // Start is at (3, 3) facing North.
  // Probe item is at (3, 2).
  // Left arm (cols 1, 2) has Fuel crates (5).
  // Right arm (cols 4, 5) has Oxygen tanks (6).
  const maze = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 5, 5, 1, 6, 6, 0], // Left arm: Fuel (5), Junction: (3,1), Right arm: Oxygen (6)
    [0, 0, 0, probeItem, 0, 0, 0], // Probe item at (3,2)
    [0, 0, 0, 3, 0, 0, 0], // Start at (3,3)
    [0, 0, 0, 0, 0, 0, 0],
  ];

  return { maze, probeItem };
}

/**
 * Generates Section 4 matrix: 9x9 open warehouse room with 3 Fuel (5) and 3 Oxygen (6) scattered.
 */
export function generateSection4Matrix(): number[][] {
  const size = 9;
  const maze: number[][] = Array(size).fill(0).map(() => Array(size).fill(1));

  // Outer border as void
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (y === 0 || y === size - 1 || x === 0 || x === size - 1) {
        maze[y][x] = 0;
      }
    }
  }

  // Start position at (1,1)
  maze[1][1] = 3;

  // Available candidate coordinates (excluding start at 1,1)
  const candidateCoords: [number, number][] = [];
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (!(x === 1 && y === 1)) {
        candidateCoords.push([x, y]);
      }
    }
  }

  // Shuffle candidates
  for (let i = candidateCoords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidateCoords[i], candidateCoords[j]] = [candidateCoords[j], candidateCoords[i]];
  }

  // Place 3 Fuel (5)
  for (let i = 0; i < 3; i++) {
    const [fx, fy] = candidateCoords[i];
    maze[fy][fx] = 5;
  }

  // Place 3 Oxygen (6)
  for (let i = 3; i < 6; i++) {
    const [ox, oy] = candidateCoords[i];
    maze[oy][ox] = 6;
  }

  return maze;
}

/**
 * Validates victory conditions for Level 2 sections.
 */
export function validateSectionVictory(
  sectionIndex: number,
  inventory: InventoryState,
  maze: number[][],
  probeItem?: 5 | 6
): boolean {
  if (sectionIndex === 0) {
    // Section 1: All 6 Fuel crates collected
    return inventory.fuel >= 6;
  }

  if (sectionIndex === 1) {
    // Section 2: All items on the path processed (no 5 or 7 remaining) and gathered at least all fuel
    const { fuelCount, junkCount } = parseMatrixEntities(maze);
    return fuelCount === 0 && junkCount === 0 && inventory.fuel > 0;
  }

  if (sectionIndex === 2) {
    // Section 3: If probe item was Fuel, player gathered 2 Fuel from left arm; if Oxygen, gathered 2 Oxygen from right arm
    if (probeItem === 5) {
      return inventory.fuel >= 2;
    } else if (probeItem === 6) {
      return inventory.oxygen >= 2;
    }
    return (inventory.fuel >= 2 && probeItem === 5) || (inventory.oxygen >= 2 && probeItem === 6);
  }

  if (sectionIndex === 3) {
    // Section 4: Exactly 3 Fuel and 3 Oxygen collected
    return inventory.fuel >= 3 && inventory.oxygen >= 3;
  }

  return false;
}

/**
 * Testable, modular React hook for managing Cargo Bay inventory & simulation interactions.
 */
export function useCargoBayEngine(initialSectionIndex = 0) {
  const [inventory, setInventory] = useState<InventoryState>({ fuel: 0, oxygen: 0 });
  const [sectionIndex, setSectionIndex] = useState(initialSectionIndex);
  const [currentMaze, setCurrentMaze] = useState<number[][]>(() => generateSection1Matrix());
  const [probeItem, setProbeItem] = useState<5 | 6>(5);

  const resetInventory = useCallback(() => {
    setInventory({ fuel: 0, oxygen: 0 });
  }, []);

  const regenerateSectionMatrix = useCallback((idx: number) => {
    setSectionIndex(idx);
    resetInventory();
    if (idx === 0) {
      setCurrentMaze(generateSection1Matrix());
    } else if (idx === 1) {
      setCurrentMaze(generateSection2Matrix());
    } else if (idx === 2) {
      const { maze, probeItem: generatedProbe } = generateSection3Matrix();
      setCurrentMaze(maze);
      setProbeItem(generatedProbe);
    } else if (idx === 3) {
      setCurrentMaze(generateSection4Matrix());
    }
  }, [resetInventory]);

  const handlePickUp = useCallback((x: number, y: number): { success: boolean; itemType: 'fuel' | 'oxygen' | null; error?: string } => {
    const tile = currentMaze[y]?.[x];
    if (tile === 5) {
      // Fuel collected
      setInventory(prev => ({ ...prev, fuel: prev.fuel + 1 }));
      setCurrentMaze(prev => {
        const next = prev.map(row => [...row]);
        next[y][x] = 1; // turn back to standard floor
        return next;
      });
      return { success: true, itemType: 'fuel' };
    } else if (tile === 6) {
      // Oxygen collected
      setInventory(prev => ({ ...prev, oxygen: prev.oxygen + 1 }));
      setCurrentMaze(prev => {
        const next = prev.map(row => [...row]);
        next[y][x] = 1;
        return next;
      });
      return { success: true, itemType: 'oxygen' };
    } else if (tile === 7) {
      return { success: false, itemType: null, error: "Warning: Cannot pack Junk!" };
    } else {
      return { success: false, itemType: null, error: "Error: Nothing to interact with here." };
    }
  }, [currentMaze]);

  const handleTrash = useCallback((x: number, y: number): { success: boolean; error?: string } => {
    const tile = currentMaze[y]?.[x];
    if (tile === 7) {
      // Junk successfully discarded
      setCurrentMaze(prev => {
        const next = prev.map(row => [...row]);
        next[y][x] = 1; // turn back to floor
        return next;
      });
      return { success: true };
    } else if (tile === 5 || tile === 6) {
      return { success: false, error: "Warning: Cannot trash resources!" };
    } else {
      return { success: false, error: "Error: Nothing to interact with here." };
    }
  }, [currentMaze]);

  const handleScan = useCallback((x: number, y: number): 'Fuel' | 'Oxygen' | 'Junk' | 'None' => {
    const tile = currentMaze[y]?.[x];
    if (tile === 5) return 'Fuel';
    if (tile === 6) return 'Oxygen';
    if (tile === 7) return 'Junk';
    return 'None';
  }, [currentMaze]);

  const checkVictory = useCallback(() => {
    return validateSectionVictory(sectionIndex, inventory, currentMaze, probeItem);
  }, [sectionIndex, inventory, currentMaze, probeItem]);

  return {
    inventory,
    setInventory,
    resetInventory,
    sectionIndex,
    currentMaze,
    setCurrentMaze,
    probeItem,
    regenerateSectionMatrix,
    handlePickUp,
    handleTrash,
    handleScan,
    checkVictory,
  };
}
