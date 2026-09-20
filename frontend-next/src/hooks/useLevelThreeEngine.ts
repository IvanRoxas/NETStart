"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLevelThreeState } from '@/context/LevelThreeContext';
import { parseTile } from '@/lib/level3/gridDictionary';
import { getLevelThreeSectionConfig, LevelThreeMatrixConfig } from '@/lib/level3/matrices';
import { getDiagnosticConfig, DiagnosticNode, DiagnosticSectionConfig } from '@/lib/level3/terminalNodes';

export interface RoverPosition {
  x: number;
  y: number;
  direction: number; // 0 = North, 1 = East, 2 = South, 3 = West
}

export function useLevelThreeEngine() {
  const {
    engineCharge,
    activeSection,
    missionQueue,
    levelXP,
    isRunning,
    isLevelComplete,
    dispatchSectionClear,
    popMissionQueue,
    completeLevel,
    setEngineCharge,
    setMissionQueue,
    setIsRunning,
  } = useLevelThreeState();

  const [activeConfig, setActiveConfig] = useState<LevelThreeMatrixConfig>(() =>
    getLevelThreeSectionConfig(1, [])
  );
  const [currentMatrix, setCurrentMatrix] = useState<number[][]>(() =>
    getLevelThreeSectionConfig(1, []).matrix.map(row => [...row])
  );
  const [roverPos, setRoverPos] = useState<RoverPosition>(() =>
    getLevelThreeSectionConfig(1, []).startPos
  );

  // Diagnostic Terminal State (Sections 1, 2, 4, 5)
  const [diagnosticConfig, setDiagnosticConfig] = useState<DiagnosticSectionConfig>(() =>
    getDiagnosticConfig(1)
  );
  const [diagnosticNodes, setDiagnosticNodes] = useState<DiagnosticNode[]>(() =>
    getDiagnosticConfig(1).nodes.map(n => ({ ...n }))
  );
  const [reticleIndex, setReticleIndex] = useState<number>(0);

  const [errorFlash, setErrorFlash] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToastMessage({ text, type });
    if (type === 'error') {
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 800);
    }
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Update active config and reset grid on section / hardcore queue change
  useEffect(() => {
    const config = getLevelThreeSectionConfig(activeSection, missionQueue);
    setActiveConfig(config);
    setCurrentMatrix(config.matrix.map(row => [...row]));
    setRoverPos({ ...config.startPos });

    // Diagnostic Terminal setup
    const diagId = activeSection <= 2 ? activeSection : missionQueue[0] || 1;
    const diagConfig = getDiagnosticConfig(diagId);
    setDiagnosticConfig(diagConfig);
    setDiagnosticNodes(diagConfig.nodes.map(n => ({ ...n })));
    setReticleIndex(0);

    setEngineCharge(0);
  }, [activeSection, missionQueue, setEngineCharge]);

  // Reset current matrix and diagnostic stream
  const resetMatrix = useCallback(() => {
    const config = getLevelThreeSectionConfig(activeSection, missionQueue);
    setCurrentMatrix(config.matrix.map(row => [...row]));
    setRoverPos({ ...config.startPos });

    const diagId = activeSection <= 2 ? activeSection : missionQueue[0] || 1;
    const diagConfig = getDiagnosticConfig(diagId);
    setDiagnosticConfig(diagConfig);
    setDiagnosticNodes(diagConfig.nodes.map(n => ({ ...n })));
    setReticleIndex(0);

    setEngineCharge(0);
  }, [activeSection, missionQueue, setEngineCharge]);

  // Action: scan_next_node (shifts reticle index forward)
  const scanNextNode = useCallback(() => {
    setReticleIndex(prev => Math.min(diagnosticNodes.length - 1, prev + 1));
  }, [diagnosticNodes.length]);

  // Diagnostic Scan Reporters
  const scanNodeColor = useCallback((): string => {
    const node = diagnosticNodes[reticleIndex];
    return node?.color || 'None';
  }, [diagnosticNodes, reticleIndex]);

  const scanNodeState = useCallback((): string => {
    const node = diagnosticNodes[reticleIndex];
    return node?.state || (node?.type === 'Start' ? 'Stable' : 'None');
  }, [diagnosticNodes, reticleIndex]);

  // Floor grid reporters for Section 3
  const scanCurrentNodeColor = useCallback((): string => {
    const tileCode = currentMatrix[roverPos.y]?.[roverPos.x];
    const parsed = parseTile(tileCode);
    return parsed.node?.color || 'None';
  }, [currentMatrix, roverPos]);

  const scanCurrentNodeState = useCallback((): string => {
    const tileCode = currentMatrix[roverPos.y]?.[roverPos.x];
    const parsed = parseTile(tileCode);
    return parsed.node?.state || 'None';
  }, [currentMatrix, roverPos]);

  // Action: extract_power for both Diagnostic Terminal and 2D Grid
  const executeExtractPower = useCallback((): boolean => {
    if (activeSection !== 3) {
      // Diagnostic Terminal extraction evaluation
      const node = diagnosticNodes[reticleIndex];
      if (!node) {
        showToast("No active node detected!", "error");
        return false;
      }

      if (node.isExtracted) {
        showToast("This node has already been extracted!", "error");
        return false;
      }

      const isSafe = (node.color === 'Blue' && node.state === 'Stable') || (node.color === 'Green' && node.state === 'Stable');

      if (isSafe) {
        // Mark node as extracted
        setDiagnosticNodes(prev => {
          const next = [...prev];
          next[reticleIndex] = { ...next[reticleIndex], isExtracted: true, state: 'Depleted' };
          return next;
        });

        // Add 50 charge (or 25 in hardcore)
        const increment = activeSection <= 2 ? 50 : 25;
        setEngineCharge(prev => Math.min(100, prev + increment));
        showToast("Power Extracted Successfully! +Charge", "success");
        return true;
      }

      if (node.color === 'Red' || node.state === 'Blinking' || node.state === 'Trap') {
        showToast("Oops! You cannot take power from an unstable trap node.", "error");
        return false;
      }

      showToast("Nothing to collect here! Node is empty or invalid.", "error");
      return false;
    }

    // Section 3 Grid tile extraction (if needed)
    const tileCode = currentMatrix[roverPos.y]?.[roverPos.x];
    if (tileCode === 10 || tileCode === 12) {
      setCurrentMatrix(prev => {
        const next = prev.map(row => [...row]);
        next[roverPos.y][roverPos.x] = 1;
        return next;
      });
      setEngineCharge(prev => Math.min(100, prev + 50));
      return true;
    }

    if (tileCode === 11 || tileCode === 13 || tileCode === 14) {
      showToast("Oops! You cannot take power from an unstable trap node.", "error");
      return false;
    }

    showToast("Nothing to collect here! This spot is empty or already used.", "error");
    return false;
  }, [activeSection, diagnosticNodes, reticleIndex, currentMatrix, roverPos, setEngineCharge, showToast]);

  // Action: queue_override for Section 3 Hub
  const executeQueueOverride = useCallback((): boolean => {
    const tileCode = currentMatrix[roverPos.y]?.[roverPos.x];
    const parsed = parseTile(tileCode);

    if (parsed.type !== 'TERMINAL' || !parsed.terminal) {
      showToast("Rover is not standing on a challenge terminal!", "error");
      return false;
    }

    const moduleId = parsed.terminal.id;

    setCurrentMatrix(prev => {
      const next = prev.map(row => [...row]);
      next[roverPos.y][roverPos.x] = 1;
      return next;
    });

    setMissionQueue(prev => {
      if (prev.includes(moduleId)) return prev;
      return [...prev, moduleId];
    });

    showToast(`Added ${parsed.terminal.label} to your mission queue!`, "success");
    return true;
  }, [currentMatrix, roverPos, setMissionQueue, showToast]);

  // Action: lock_selection for Section 3
  const executeLockSelection = useCallback((): boolean => {
    if (roverPos.x !== 3 || roverPos.y !== 3) {
      showToast("Drive back to the middle tile [3, 3] to lock in your choices!", "error");
      return false;
    }

    if (missionQueue.length === 0) {
      showToast("Please pick at least one challenge terminal before locking in!", "error");
      return false;
    }

    showToast("Missions locked in! Starting your challenges...", "success");
    dispatchSectionClear();
    return true;
  }, [roverPos, missionQueue, dispatchSectionClear, showToast]);

  // Victory check validator
  const checkVictoryCondition = useCallback((): boolean => {
    if (activeSection === 1 || activeSection === 2) {
      const currentNode = diagnosticNodes[reticleIndex];
      const isAtIgnition = currentNode?.type === 'Ignition' || reticleIndex >= diagnosticNodes.length - 1;
      if (engineCharge >= 100 && isAtIgnition) {
        showToast("Section Cleared! Engine calibration successful.", "success");
        dispatchSectionClear();
        return true;
      }
    }

    if (activeSection >= 4) {
      const currentNode = diagnosticNodes[reticleIndex];
      const isAtIgnition = currentNode?.type === 'Ignition' || reticleIndex >= diagnosticNodes.length - 1;
      if (engineCharge >= 100 && isAtIgnition) {
        showToast("Challenge Passed! Awesome job.", "success");
        popMissionQueue();
        return true;
      }
    }

    return false;
  }, [activeSection, diagnosticNodes, reticleIndex, engineCharge, dispatchSectionClear, popMissionQueue, showToast]);

  return {
    engineCharge,
    activeSection,
    missionQueue,
    levelXP,
    isRunning,
    isLevelComplete,
    activeConfig,
    currentMatrix,
    roverPos,
    diagnosticConfig,
    diagnosticNodes,
    reticleIndex,
    errorFlash,
    toastMessage,
    setRoverPos,
    setCurrentMatrix,
    setReticleIndex,
    setIsRunning,
    resetMatrix,
    scanNextNode,
    scanNodeColor,
    scanNodeState,
    scanCurrentNodeColor,
    scanCurrentNodeState,
    executeExtractPower,
    executeQueueOverride,
    executeLockSelection,
    checkVictoryCondition,
    showToast,
    dispatchSectionClear,
    popMissionQueue,
    completeLevel,
  };
}
