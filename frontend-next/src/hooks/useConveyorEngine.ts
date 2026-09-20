"use client";

import { useState, useCallback } from 'react';

export type ConveyorItemType = 'cargo' | 'trash' | 'fuel' | 'food';

export interface ConveyorItem {
  id: number;
  type: ConveyorItemType;
  label: string;
  color: string;
  icon: 'package' | 'trash' | 'zap' | 'apple';
}

export interface ConveyorInventory {
  cargo: number;
  trash: number;
  fuel: number;
  food: number;
  errors: number;
}

export interface SectionConveyorConfig {
  sectionIndex: number;
  title: string;
  desc: string;
  tip: string;
  queueLength: number;
  items: ConveyorItem[];
}

/**
 * Returns deterministic conveyor queues with strict lengths:
 * Section 1: Exactly 10 items (100% Cargo)
 * Section 2: Exactly 15 items (Mix of Cargo, Trash)
 * Section 3: Exactly 20 items (Mix of Cargo, Trash, Fuel)
 * Section 4: Exactly 25 items (Mix of Cargo, Trash, Fuel, Food)
 */
export function getSectionConveyorQueue(sectionIndex: number): ConveyorItem[] {
  if (sectionIndex === 0) {
    // Section 1: Exactly 10 items (100% Cargo to master Repeat Loop + Pack Cargo)
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      type: 'cargo' as ConveyorItemType,
      label: 'Cargo Crate',
      color: '#3B82F6',
      icon: 'package' as const,
    }));
  }

  if (sectionIndex === 1) {
    // Section 2: Exactly 15 items (Binary mix of Cargo & Trash)
    // 8 Cargo, 7 Trash
    const types: ConveyorItemType[] = [
      'cargo', 'trash', 'cargo', 'cargo', 'trash', 
      'trash', 'cargo', 'trash', 'cargo', 'cargo', 
      'trash', 'cargo', 'trash', 'cargo', 'trash'
    ];
    return types.map((type, i) => ({
      id: i + 1,
      type,
      label: type === 'cargo' ? 'Cargo Crate' : 'Space Junk',
      color: type === 'cargo' ? '#3B82F6' : '#EF4444',
      icon: type === 'cargo' ? ('package' as const) : ('trash' as const),
    }));
  }

  if (sectionIndex === 2) {
    // Section 3: Exactly 20 items (Tri-mix of Cargo, Trash, Fuel)
    // 7 Cargo, 7 Trash, 6 Fuel = 20 items
    const types: ConveyorItemType[] = [
      'cargo', 'trash', 'fuel', 'cargo', 'trash',
      'fuel', 'cargo', 'trash', 'fuel', 'cargo',
      'trash', 'fuel', 'cargo', 'trash', 'fuel',
      'cargo', 'trash', 'fuel', 'cargo', 'trash'
    ];
    return types.map((type, i) => ({
      id: i + 1,
      type,
      label: type === 'cargo' ? 'Cargo Crate' : type === 'trash' ? 'Space Junk' : 'Fuel Cell',
      color: type === 'cargo' ? '#3B82F6' : type === 'trash' ? '#EF4444' : '#F59E0B',
      icon: type === 'cargo' ? ('package' as const) : type === 'trash' ? ('trash' as const) : ('zap' as const),
    }));
  }

  // Section 4: Exactly 25 items (Full stream of Cargo, Trash, Fuel, Food)
  // 7 Cargo, 6 Trash, 6 Fuel, 6 Food = 25 items
  const types: ConveyorItemType[] = [
    'cargo', 'trash', 'fuel', 'food', 'cargo',
    'trash', 'fuel', 'food', 'cargo', 'trash',
    'fuel', 'food', 'cargo', 'trash', 'fuel',
    'food', 'cargo', 'trash', 'fuel', 'food',
    'cargo', 'food', 'cargo', 'trash', 'fuel'
  ];
  return types.map((type, i) => ({
    id: i + 1,
    type,
    label: type === 'cargo' ? 'Cargo Crate' : type === 'trash' ? 'Space Junk' : type === 'fuel' ? 'Fuel Cell' : 'Food Ration',
    color: type === 'cargo' ? '#3B82F6' : type === 'trash' ? '#EF4444' : type === 'fuel' ? '#F59E0B' : '#10B981',
    icon: type === 'cargo' ? ('package' as const) : type === 'trash' ? ('trash' as const) : type === 'fuel' ? ('zap' as const) : ('apple' as const),
  }));
}

/**
 * Validates victory conditions for a conveyor section
 */
export function validateConveyorVictory(
  sectionIndex: number,
  inventory: ConveyorInventory,
  remainingQueueLength: number
): { success: boolean; message: string } {
  if (remainingQueueLength > 0) {
    return {
      success: false,
      message: `There are still ${remainingQueueLength} item(s) left on the conveyor belt.`
    };
  }

  if (inventory.errors > 0) {
    return {
      success: false,
      message: `Sorting completed with ${inventory.errors} error(s). Review your conditions.`
    };
  }

  if (sectionIndex === 0) {
    if (inventory.cargo >= 10) {
      return { success: true, message: "Calibration complete! All 10 Cargo crates successfully packed." };
    }
    return { success: false, message: "You need to pack all 10 Cargo crates." };
  }

  if (sectionIndex === 1) {
    if (inventory.cargo === 8 && inventory.trash === 7) {
      return { success: true, message: "Classification complete! 8 Cargo packed, 7 Trash discarded." };
    }
    return { success: false, message: "Incorrect item distribution in cargo." };
  }

  if (sectionIndex === 2) {
    if (inventory.cargo === 7 && inventory.trash === 7 && inventory.fuel === 6) {
      return { success: true, message: "Tri-resource classification complete! Cargo, Trash, and Fuel routed." };
    }
    return { success: false, message: "All resources must be correctly routed." };
  }

  if (sectionIndex === 3) {
    if (inventory.cargo === 7 && inventory.trash === 6 && inventory.fuel === 6 && inventory.food === 6) {
      return { success: true, message: "Master sorting complete! All 25 items correctly classified across all 4 zones." };
    }
    return { success: false, message: "All 25 items must be correctly classified." };
  }

  return { success: true, message: "Section Cleared!" };
}

/**
 * Modular React hook for Conveyor Belt state management & testing
 */
export function useConveyorEngine(initialSectionIndex = 0) {
  const [sectionIndex, setSectionIndex] = useState(initialSectionIndex);
  const [queue, setQueue] = useState<ConveyorItem[]>(() => getSectionConveyorQueue(initialSectionIndex));
  const [inventory, setInventory] = useState<ConveyorInventory>({
    cargo: 0,
    trash: 0,
    fuel: 0,
    food: 0,
    errors: 0,
  });
  const [currentItem, setCurrentItem] = useState<ConveyorItem | null>(() => queue[0] || null);

  const resetSection = useCallback((secIndex: number) => {
    setSectionIndex(secIndex);
    const newQueue = getSectionConveyorQueue(secIndex);
    setQueue(newQueue);
    setCurrentItem(newQueue[0] || null);
    setInventory({
      cargo: 0,
      trash: 0,
      fuel: 0,
      food: 0,
      errors: 0,
    });
  }, []);

  return {
    sectionIndex,
    queue,
    inventory,
    currentItem,
    resetSection,
    validateVictory: () => validateConveyorVictory(sectionIndex, inventory, queue.length),
  };
}
