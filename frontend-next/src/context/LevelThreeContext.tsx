"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export interface LevelThreeState {
  engineCharge: number;
  activeSection: number;
  missionQueue: string[];
  levelXP: number;
  isRunning: boolean;
  isLevelComplete: boolean;
  dispatchSectionClear: () => void;
  setEngineCharge: React.Dispatch<React.SetStateAction<number>>;
  setActiveSection: React.Dispatch<React.SetStateAction<number>>;
  setMissionQueue: React.Dispatch<React.SetStateAction<string[]>>;
  setLevelXP: React.Dispatch<React.SetStateAction<number>>;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  popMissionQueue: () => void;
  completeLevel: () => void;
  resetLevelThreeState: () => void;
}

const LevelThreeContext = createContext<LevelThreeState | null>(null);

export function LevelThreeProvider({ children }: { children: React.ReactNode }) {
  // Phase 1: Level 3 State variables
  const [engineCharge, setEngineCharge] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<number>(1);
  const [missionQueue, setMissionQueue] = useState<string[]>([]);
  const [levelXP, setLevelXP] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isLevelComplete, setIsLevelComplete] = useState<boolean>(false);

  // Phase 2: Reward Dispatcher Hook
  const dispatchSectionClear = useCallback(() => {
    setLevelXP((prev) => prev + 100);
    setActiveSection((prev) => Math.min(5, prev + 1));
    setEngineCharge(0);
  }, []);

  // Adaptive Loop for Section 4 & 5 Hardcore Router
  const popMissionQueue = useCallback(() => {
    setMissionQueue((prev) => {
      const remaining = prev.slice(1);
      if (remaining.length === 0) {
        setIsLevelComplete(true);
        setLevelXP((xp) => xp + 150); // Final mission reward
      }
      return remaining;
    });
    setEngineCharge(0);
  }, []);

  const completeLevel = useCallback(() => {
    setIsLevelComplete(true);
  }, []);

  const resetLevelThreeState = useCallback(() => {
    setEngineCharge(0);
    setActiveSection(1);
    setMissionQueue([]);
    setLevelXP(0);
    setIsRunning(false);
    setIsLevelComplete(false);
  }, []);

  const value = useMemo<LevelThreeState>(
    () => ({
      engineCharge,
      activeSection,
      missionQueue,
      levelXP,
      isRunning,
      isLevelComplete,
      dispatchSectionClear,
      setEngineCharge,
      setActiveSection,
      setMissionQueue,
      setLevelXP,
      setIsRunning,
      popMissionQueue,
      completeLevel,
      resetLevelThreeState,
    }),
    [
      engineCharge,
      activeSection,
      missionQueue,
      levelXP,
      isRunning,
      isLevelComplete,
      dispatchSectionClear,
      popMissionQueue,
      completeLevel,
      resetLevelThreeState,
    ]
  );

  return (
    <LevelThreeContext.Provider value={value}>
      {children}
    </LevelThreeContext.Provider>
  );
}

export function useLevelThreeState(): LevelThreeState {
  const context = useContext(LevelThreeContext);
  if (!context) {
    throw new Error('useLevelThreeState must be used within a LevelThreeProvider');
  }
  return context;
}
