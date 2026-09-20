"use client";

import { useState, useCallback } from 'react';

export type DebrisType = 'fuel' | 'oxygen' | 'junk' | 'asteroid';
export type TurretActionType = 'store' | 'repulse' | 'vaporize' | 'none';

export interface DebrisItem {
  id: number;
  type: DebrisType;
  label: string;
  color: string;
  icon: 'package' | 'zap' | 'trash' | 'circle';
}

export interface TractorInventory {
  fuel: number;
  oxygen: number;
  junkDestroyed: number;
  asteroidsRepulsed: number;
}

export interface SectionDebrisConfig {
  sectionIndex: number;
  title: string;
  desc: string;
  tip: string;
  debrisList: DebrisItem[];
  requiredInventory?: Partial<TractorInventory>;
  blockLimit?: number;
}

/**
 * Creates static and deterministic debris queues for each section of Level 2
 */
export function getSectionDebrisList(sectionIndex: number): DebrisItem[] {
  if (sectionIndex === 0) {
    // Section 1: Introduction to Tractor Beam - 4 Fuel items
    return [
      { id: 1, type: 'fuel', label: 'Fuel Pod', color: '#3B82F6', icon: 'package' },
      { id: 2, type: 'fuel', label: 'Fuel Pod', color: '#3B82F6', icon: 'package' },
      { id: 3, type: 'fuel', label: 'Fuel Pod', color: '#3B82F6', icon: 'package' },
      { id: 4, type: 'fuel', label: 'Fuel Pod', color: '#3B82F6', icon: 'package' },
    ];
  }

  if (sectionIndex === 1) {
    // Section 2: Binary Classifier - Fuel vs Junk (6 items)
    return [
      { id: 1, type: 'fuel', label: 'Fuel Pod', color: '#3B82F6', icon: 'package' },
      { id: 2, type: 'junk', label: 'Space Scrap', color: '#9CA3AF', icon: 'trash' },
      { id: 3, type: 'fuel', label: 'Fuel Pod', color: '#3B82F6', icon: 'package' },
      { id: 4, type: 'junk', label: 'Space Scrap', color: '#9CA3AF', icon: 'trash' },
      { id: 5, type: 'fuel', label: 'Fuel Pod', color: '#3B82F6', icon: 'package' },
      { id: 6, type: 'junk', label: 'Space Scrap', color: '#9CA3AF', icon: 'trash' },
    ];
  }

  if (sectionIndex === 2) {
    // Section 3: Tri-Classifier - Fuel, Oxygen, and Junk (6 items)
    return [
      { id: 1, type: 'fuel', label: 'Fuel Pod', color: '#3B82F6', icon: 'package' },
      { id: 2, type: 'oxygen', label: 'O2 Tank', color: '#06B6D4', icon: 'zap' },
      { id: 3, type: 'junk', label: 'Space Scrap', color: '#9CA3AF', icon: 'trash' },
      { id: 4, type: 'fuel', label: 'Fuel Pod', color: '#3B82F6', icon: 'package' },
      { id: 5, type: 'junk', label: 'Space Scrap', color: '#9CA3AF', icon: 'trash' },
      { id: 6, type: 'oxygen', label: 'O2 Tank', color: '#06B6D4', icon: 'zap' },
    ];
  }

  // Section 4: Complex Hazard Classification - Fuel, Oxygen, Junk, Asteroid (8 items)
  return [
    { id: 1, type: 'fuel', label: 'Fuel Pod', color: '#3B82F6', icon: 'package' },
    { id: 2, type: 'asteroid', label: 'Heavy Asteroid', color: '#F59E0B', icon: 'circle' },
    { id: 3, type: 'oxygen', label: 'O2 Tank', color: '#06B6D4', icon: 'zap' },
    { id: 4, type: 'junk', label: 'Space Scrap', color: '#9CA3AF', icon: 'trash' },
    { id: 5, type: 'asteroid', label: 'Heavy Asteroid', color: '#F59E0B', icon: 'circle' },
    { id: 6, type: 'fuel', label: 'Fuel Pod', color: '#3B82F6', icon: 'package' },
    { id: 7, type: 'junk', label: 'Space Scrap', color: '#9CA3AF', icon: 'trash' },
    { id: 8, type: 'oxygen', label: 'O2 Tank', color: '#06B6D4', icon: 'zap' },
  ];
}

/**
 * Validates victory conditions for Level 2 tractor beam simulation
 */
export function validateTractorVictory(
  sectionIndex: number,
  inventory: TractorInventory,
  errorsCount: number
): boolean {
  if (errorsCount > 0) return false;

  if (sectionIndex === 0) {
    // Collect all 4 fuel
    return inventory.fuel >= 4;
  }

  if (sectionIndex === 1) {
    // Collect 3 fuel, vaporize 3 junk
    return inventory.fuel >= 3 && inventory.junkDestroyed >= 3;
  }

  if (sectionIndex === 2) {
    // Collect 2 fuel, 2 oxygen, vaporize 2 junk
    return inventory.fuel >= 2 && inventory.oxygen >= 2 && inventory.junkDestroyed >= 2;
  }

  if (sectionIndex === 3) {
    // Collect 2 fuel, 2 oxygen, vaporize 2 junk, repulse 2 asteroids
    return (
      inventory.fuel >= 2 &&
      inventory.oxygen >= 2 &&
      inventory.junkDestroyed >= 2 &&
      inventory.asteroidsRepulsed >= 2
    );
  }

  return false;
}

/**
 * Modular React hook for managing the Zero-G Tractor Beam engine
 */
export function useTractorBeamEngine(initialSection = 0) {
  const [sectionIndex, setSectionIndex] = useState(initialSection);
  const [debrisQueue, setDebrisQueue] = useState<DebrisItem[]>(() => getSectionDebrisList(initialSection));
  const [activeDebrisIndex, setActiveDebrisIndex] = useState<number>(0);
  const [inventory, setInventory] = useState<TractorInventory>({
    fuel: 0,
    oxygen: 0,
    junkDestroyed: 0,
    asteroidsRepulsed: 0,
  });
  const [activeBeam, setActiveBeam] = useState<TurretActionType>('none');
  const [turretDamaged, setTurretDamaged] = useState(false);
  const [errorsCount, setErrorsCount] = useState(0);

  const resetEngine = useCallback((sec = sectionIndex) => {
    setSectionIndex(sec);
    setDebrisQueue(getSectionDebrisList(sec));
    setActiveDebrisIndex(0);
    setInventory({ fuel: 0, oxygen: 0, junkDestroyed: 0, asteroidsRepulsed: 0 });
    setActiveBeam('none');
    setTurretDamaged(false);
    setErrorsCount(0);
  }, [sectionIndex]);

  const processAction = useCallback(
    (action: TurretActionType, currentItem: DebrisItem): { success: boolean; message: string } => {
      setActiveBeam(action);

      // Validate action against item type
      let isCorrect = false;
      let errorMsg = '';

      if (currentItem.type === 'fuel') {
        if (action === 'store') {
          isCorrect = true;
          setInventory(prev => ({ ...prev, fuel: prev.fuel + 1 }));
        } else if (action === 'vaporize') {
          errorMsg = 'Warning: You destroyed valuable Fuel!';
        } else if (action === 'repulse') {
          errorMsg = 'Warning: You pushed away needed Fuel!';
        }
      } else if (currentItem.type === 'oxygen') {
        if (action === 'store') {
          isCorrect = true;
          setInventory(prev => ({ ...prev, oxygen: prev.oxygen + 1 }));
        } else if (action === 'vaporize') {
          errorMsg = 'Warning: You vaporized valuable Oxygen!';
        } else if (action === 'repulse') {
          errorMsg = 'Warning: You repulsed needed Oxygen!';
        }
      } else if (currentItem.type === 'junk') {
        if (action === 'vaporize') {
          isCorrect = true;
          setInventory(prev => ({ ...prev, junkDestroyed: prev.junkDestroyed + 1 }));
        } else if (action === 'store') {
          errorMsg = 'Warning: Cannot pack hazardous Space Junk!';
        } else if (action === 'repulse') {
          errorMsg = 'Scrap must be vaporized, not deflected!';
        }
      } else if (currentItem.type === 'asteroid') {
        if (action === 'repulse') {
          isCorrect = true;
          setInventory(prev => ({ ...prev, asteroidsRepulsed: prev.asteroidsRepulsed + 1 }));
        } else if (action === 'store') {
          errorMsg = 'Danger: Asteroid is too dense to store!';
        } else if (action === 'vaporize') {
          errorMsg = 'Laser deflected by heavy iron asteroid! Use Repulsor!';
        }
      }

      if (!isCorrect) {
        setTurretDamaged(true);
        setErrorsCount(prev => prev + 1);
        return { success: false, message: errorMsg || 'Incorrect action for this debris.' };
      }

      return { success: true, message: 'Correctly sorted!' };
    },
    []
  );

  return {
    sectionIndex,
    debrisQueue,
    activeDebrisIndex,
    setActiveDebrisIndex,
    inventory,
    activeBeam,
    setActiveBeam,
    turretDamaged,
    setTurretDamaged,
    errorsCount,
    resetEngine,
    processAction,
  };
}
