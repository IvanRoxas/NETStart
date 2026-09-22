"use client";

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { 
  Flame, 
  FlaskConical, 
  RotateCw, 
  PackageCheck, 
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

export type FuelColor = 'Grey' | 'Orange' | 'Blue' | 'Green';
export type FuelAction = 'NONE' | 'INCREASE_HEAT' | 'ADD_SOLUTION' | 'MIX' | 'PUT_INTO_FUEL_TANK';

export interface FuelSynthesisRef {
  startSimulation: (evaluatorFn: (methods: FuelSimulationMethods) => Promise<void>) => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
}

export interface FuelSimulationMethods {
  Increase_Heat: () => Promise<void>;
  Add_Solution: () => Promise<void>;
  Mix: () => Promise<void>;
  Put_Into_Fuel_Tank: () => Promise<void>;
  getColor: () => FuelColor;
  isColor: (color: FuelColor) => boolean;
  isNotColor: (color: FuelColor) => boolean;
  checkStatus: () => Promise<void>;
}

interface FuelSynthesisProps {
  onComplete?: (success: boolean, stats: { batchesCompleted: number; errorReason?: string }) => void;
  isExternalRunning?: boolean;
}

const TOTAL_BATCHES = 3;

export const FuelSynthesis = forwardRef<FuelSynthesisRef, FuelSynthesisProps>(({
  onComplete,
  isExternalRunning = false
}, ref) => {
  // Batch progress: 0 to 3
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [batchHistory, setBatchHistory] = useState<('PENDING' | 'SUCCESS' | 'FAILED')[]>([
    'PENDING', 'PENDING', 'PENDING'
  ]);

  // Instructions dropdown state
  const [showInstructions, setShowInstructions] = useState(false);

  // Chamber Liquid State
  const [currentColor, setCurrentColor] = useState<FuelColor>('Grey');
  const [isHeatedOnce, setIsHeatedOnce] = useState(false);
  const [solutionAdded, setSolutionAdded] = useState(false);
  const [isBlueHeated, setIsBlueHeated] = useState(false);
  const [isBlueSolutionAdded, setIsBlueSolutionAdded] = useState(false);
  const [greenMixCount, setGreenMixCount] = useState(0);

  // Nova Character Position & Animation
  // Nodes: 'CENTER' | 'HEAT' | 'SOLUTION' | 'MIX' | 'TANK'
  const [novaNode, setNovaNode] = useState<'CENTER' | 'HEAT' | 'SOLUTION' | 'MIX' | 'TANK'>('CENTER');
  const [isNovaRunning, setIsNovaRunning] = useState(false);
  const [isNovaAction, setIsNovaAction] = useState(false);

  // Visual FX States
  const [isExploding, setIsExploding] = useState(false);
  const [isSuccessVapor, setIsSuccessVapor] = useState(false);
  const [activeStationGlow, setActiveStationGlow] = useState<string | null>(null);
  const [isPouringSolution, setIsPouringSolution] = useState(false);

  // Game End States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [failReason, setFailReason] = useState<string>('');

  // Logs feed
  const [logs, setLogs] = useState<{ id: string; text: string; type: 'info' | 'warn' | 'success' | 'danger' }[]>([
    { id: '1', text: 'Chamber ready. Total 3 fuel batches queued. Load script to begin.', type: 'info' }
  ]);

  // Refs for tracking execution state across async calls
  const stateRef = useRef({
    currentBatch: 0,
    currentColor: 'Grey' as FuelColor,
    isHeatedOnce: false,
    solutionAdded: false,
    blueHeated: false,
    blueSolutionAdded: false,
    greenMixCount: 0,
    isGameOver: false,
    isVictory: false,
    isPlaying: false
  });

  // Sync ref
  useEffect(() => {
    stateRef.current.currentBatch = currentBatchIndex;
    stateRef.current.currentColor = currentColor;
    stateRef.current.isHeatedOnce = isHeatedOnce;
    stateRef.current.solutionAdded = solutionAdded;
    stateRef.current.blueHeated = isBlueHeated;
    stateRef.current.blueSolutionAdded = isBlueSolutionAdded;
    stateRef.current.greenMixCount = greenMixCount;
    stateRef.current.isGameOver = isGameOver;
    stateRef.current.isVictory = isVictory;
    stateRef.current.isPlaying = isPlaying;
  }, [currentBatchIndex, currentColor, isHeatedOnce, solutionAdded, isBlueHeated, isBlueSolutionAdded, greenMixCount, isGameOver, isVictory, isPlaying]);

  const addLog = useCallback((text: string, type: 'info' | 'warn' | 'success' | 'danger' = 'info') => {
    setLogs(prev => [
      { id: `${Date.now()}-${Math.random()}`, text, type },
      ...prev.slice(0, 6)
    ]);
  }, []);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Reset to pristine state
  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(false);
    setIsVictory(false);
    setIsExploding(false);
    setIsSuccessVapor(false);
    setIsPouringSolution(false);
    setFailReason('');
    setCurrentBatchIndex(0);
    setBatchHistory(['PENDING', 'PENDING', 'PENDING']);
    setCurrentColor('Grey');
    setIsHeatedOnce(false);
    setSolutionAdded(false);
    setIsBlueHeated(false);
    setIsBlueSolutionAdded(false);
    setGreenMixCount(0);
    setNovaNode('CENTER');
    setIsNovaRunning(false);
    setIsNovaAction(false);
    setActiveStationGlow(null);
    stateRef.current = {
      currentBatch: 0,
      currentColor: 'Grey',
      isHeatedOnce: false,
      solutionAdded: false,
      blueHeated: false,
      blueSolutionAdded: false,
      greenMixCount: 0,
      isGameOver: false,
      isVictory: false,
      isPlaying: false
    };
    setLogs([
      { id: '1', text: 'Chamber reset. Ready for 3-batch fuel synthesis loop.', type: 'info' }
    ]);
  }, []);

  // Trigger Chamber Explosion on Logic Failure
  const triggerExplosion = useCallback((reason: string) => {
    setIsExploding(true);
    setIsGameOver(true);
    setIsPlaying(false);
    setFailReason(reason);
    stateRef.current.isGameOver = true;
    stateRef.current.isPlaying = false;
    addLog(`CHAMBER EXPLOSION: ${reason}`, 'danger');

    // Update batch history for current batch
    setBatchHistory(prev => {
      const next = [...prev];
      if (stateRef.current.currentBatch < TOTAL_BATCHES) {
        next[stateRef.current.currentBatch] = 'FAILED';
      }
      return next;
    });

    if (onComplete) {
      onComplete(false, {
        batchesCompleted: stateRef.current.currentBatch,
        errorReason: reason
      });
    }
  }, [addLog, onComplete]);

  // Complete a batch and advance to next
  const completeCurrentBatch = useCallback(() => {
    const nextBatch = stateRef.current.currentBatch + 1;
    stateRef.current.currentBatch = nextBatch;
    setIsSuccessVapor(true);
    setTimeout(() => setIsSuccessVapor(false), 1200);

    setBatchHistory(prev => {
      const next = [...prev];
      next[nextBatch - 1] = 'SUCCESS';
      return next;
    });

    if (nextBatch >= TOTAL_BATCHES) {
      // VICTORY!
      setIsVictory(true);
      setIsPlaying(false);
      stateRef.current.isVictory = true;
      stateRef.current.isPlaying = false;
      addLog('SYNTHESIS COMPLETE: All 3 fuel batches processed flawlessly into fuel tanks!', 'success');
      if (onComplete) {
        onComplete(true, { batchesCompleted: 3 });
      }
    } else {
      // Advance to next grey batch
      setCurrentBatchIndex(nextBatch);
      setCurrentColor('Grey');
      setIsHeatedOnce(false);
      setSolutionAdded(false);
      setIsBlueHeated(false);
      setIsBlueSolutionAdded(false);
      setGreenMixCount(0);
      stateRef.current.currentColor = 'Grey';
      stateRef.current.isHeatedOnce = false;
      stateRef.current.solutionAdded = false;
      stateRef.current.blueHeated = false;
      stateRef.current.blueSolutionAdded = false;
      stateRef.current.greenMixCount = 0;
      addLog(`Batch ${nextBatch + 1} of ${TOTAL_BATCHES} loaded into mixing chamber (Grey).`, 'info');
    }
  }, [addLog, onComplete]);

  const BATCH_COLORS: FuelColor[] = ['Blue', 'Green', 'Orange'];

  // Move Nova character to node and perform action with smooth visible speed
  const performNovaAction = async (targetNode: 'CENTER' | 'HEAT' | 'SOLUTION' | 'MIX' | 'TANK', stationName: string, durationMs: number = 400) => {
    if (stateRef.current.isGameOver) return;
    setIsNovaRunning(true);
    setNovaNode(targetNode);
    // Smooth transit time so player can clearly watch Nova run across the floor to the node
    await delay(750);
    if (stateRef.current.isGameOver) return;
    // Arrived at destination station -> switch to Idle and perform station action
    setIsNovaRunning(false);
    setActiveStationGlow(stationName);
    setIsNovaAction(true);
    await delay(durationMs);
    setIsNovaAction(false);
    await delay(120);
    setActiveStationGlow(null);
  };

  // Node 1: Increase_Heat()
  const executeIncreaseHeat = async () => {
    if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");
    if (stateRef.current.isVictory) return;
    await performNovaAction('HEAT', 'HEAT', 500);
    if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");

    const col = stateRef.current.currentColor;

    if (col === 'Grey') {
      setIsHeatedOnce(true);
      stateRef.current.isHeatedOnce = true;

      if (stateRef.current.solutionAdded) {
        addLog('Heated fuel mixture (Step 2). Ready to Mix 5 times!', 'info');
      } else {
        addLog('Heated vat. Remember to Add Solution before mixing!', 'info');
      }
      await delay(400);
      return;
    }

    if (col === 'Green') {
      triggerExplosion('Oops! Heating Green fuel caused it to explode. Green fuel needs Add Solution to turn Orange!');
      throw new Error("SIMULATION_FAILED");
    }
    if (col === 'Orange') {
      triggerExplosion('Oops! Orange fuel is already done! Heating it again made it boil over.');
      throw new Error("SIMULATION_FAILED");
    }
  };

  // Node 2: Add_Solution()
  const executeAddSolution = async () => {
    if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");
    if (stateRef.current.isVictory) return;

    // Step 1: Nova runs to Solution station to pick up chemical solution
    await performNovaAction('SOLUTION', 'SOLUTION', 400);
    if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");

    // Step 2: Nova runs to central fuel container to pour solution into vat
    await performNovaAction('CENTER', 'VAT', 400);
    if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");

    // Dynamic pouring flask and cascading chemical stream animation over vat
    setIsPouringSolution(true);
    await delay(1200);
    setIsPouringSolution(false);
    if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");

    const col = stateRef.current.currentColor;

    // 1. Initial Step 1 for raw Grey fuel
    if (col === 'Grey') {
      setSolutionAdded(true);
      stateRef.current.solutionAdded = true;
      if (stateRef.current.isHeatedOnce) {
        addLog('Chemical Solution added (Step 1) to heated vat. Ready to Mix 5 times!', 'info');
      } else {
        addLog('Chemical Solution added to vat (Step 1). Next: Increase Heat!', 'info');
      }
      await delay(400);
      return;
    }

    // 2. 50/50 Green Fuel -> Add Solution turns it to Perfect Orange!
    if (col === 'Green') {
      setCurrentColor('Orange');
      stateRef.current.currentColor = 'Orange';
      addLog('Added Solution to Green fuel -> Refined to Perfect Orange!', 'success');
      await delay(400);
      return;
    }

    // 3. Orange fuel does not need more solution
    if (col === 'Orange') {
      triggerExplosion('Oops! Orange fuel is already refined. Put it into the fuel tank!');
      throw new Error("SIMULATION_FAILED");
    }
  };

  // Node 3: Mix()
  const executeMix = async () => {
    if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");
    if (stateRef.current.isVictory) return;
    // Mixing animation duration
    await performNovaAction('MIX', 'MIX', 900);
    if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");

    const col = stateRef.current.currentColor;

    // Grey fuel must have solution and heat before mixing
    if (col === 'Grey') {
      if (!stateRef.current.solutionAdded || !stateRef.current.isHeatedOnce) {
        triggerExplosion('Oops! You must Add Solution (Step 1) and Increase Heat (Step 2) before mixing.');
        throw new Error("SIMULATION_FAILED");
      }

      const nextCount = stateRef.current.greenMixCount + 1;
      setGreenMixCount(nextCount);
      stateRef.current.greenMixCount = nextCount;

      if (nextCount < 5) {
        addLog(`Mixing fuel mixture (${nextCount}/5)...`, 'info');
      } else if (nextCount === 5) {
        // Deterministic 50/50 distribution across 3 batches: Batch 0 = Green, Batch 1 = Orange, Batch 2 = Green
        const resultColor: FuelColor = (stateRef.current.currentBatch % 2 === 0) ? 'Green' : 'Orange';
        setCurrentColor(resultColor);
        stateRef.current.currentColor = resultColor;
        if (resultColor === 'Green') {
          addLog('Mix 5/5 complete! Fuel turned Green. Add Solution to turn it Orange!', 'warn');
        } else {
          addLog('Mix 5/5 complete! Fuel turned Perfect Orange! Ready for spaceship.', 'success');
        }
      } else {
        triggerExplosion('Oops! Fuel only needs to be mixed 5 times.');
        throw new Error("SIMULATION_FAILED");
      }
      await delay(400);
      return;
    }

    if (col === 'Green') {
      triggerExplosion('Oops! Mixing is finished. Add Solution to turn Green fuel Orange!');
      throw new Error("SIMULATION_FAILED");
    }

    if (col === 'Orange') {
      triggerExplosion('Oops! Orange fuel is already done. Put it into the fuel tank!');
      throw new Error("SIMULATION_FAILED");
    }
  };

  // Node 4: Put_Into_Fuel_Tank()
  const executePutIntoFuelTank = async () => {
    if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");
    if (stateRef.current.isVictory) return;

    // Step 1: Nova runs to central fuel container to retrieve fuel
    await performNovaAction('CENTER', 'VAT', 400);
    if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");

    const col = stateRef.current.currentColor;

    if (col === 'Green') {
      triggerExplosion('Oops! Green fuel is not finished yet. Add Solution to turn it Orange before fueling!');
      throw new Error("SIMULATION_FAILED");
    }

    if (col !== 'Orange') {
      triggerExplosion('Oops! Fuel is not finished synthesizing. Follow all 5 steps: Add Solution, Heat, Mix 5x, check Green -> Add Solution, then Fuel!');
      throw new Error("SIMULATION_FAILED");
    }

    // Step 2: Nova carries completed fuel and loads it into spaceship fuel tank
    await performNovaAction('TANK', 'TANK', 500);
    if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");

    // Success: Orange fuel safely packed
    addLog(`Batch ${stateRef.current.currentBatch + 1} packed into Fuel Spaceship!`, 'success');
    completeCurrentBatch();
    await delay(500);
  };

  // Start simulation with Blockly script runner
  const startSimulation = useCallback(async (evaluatorFn: (methods: FuelSimulationMethods) => Promise<void>) => {
    resetSimulation();
    setIsPlaying(true);
    stateRef.current.isPlaying = true;
    addLog('Automated fuel synthesis loop started. Processing 3 batches...', 'info');

    let safetyTickCount = 0;

    const methods: FuelSimulationMethods = {
      Increase_Heat: async () => {
        if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");
        safetyTickCount = 0;
        await executeIncreaseHeat();
      },
      Add_Solution: async () => {
        if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");
        safetyTickCount = 0;
        await executeAddSolution();
      },
      Mix: async () => {
        if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");
        safetyTickCount = 0;
        await executeMix();
      },
      Put_Into_Fuel_Tank: async () => {
        if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");
        safetyTickCount = 0;
        await executePutIntoFuelTank();
      },
      getColor: () => stateRef.current.currentColor,
      isColor: (c: FuelColor) => stateRef.current.currentColor.toLowerCase() === c.toLowerCase(),
      isNotColor: (c: FuelColor) => stateRef.current.currentColor.toLowerCase() !== c.toLowerCase(),
      checkStatus: async () => {
        if (stateRef.current.isGameOver) throw new Error("SIMULATION_FAILED");
        safetyTickCount++;
        if (safetyTickCount > 150) {
          triggerExplosion('Loop took too long without taking actions! Check your condition.');
          throw new Error("SIMULATION_FAILED");
        }
        await delay(50);
      }
    };

    try {
      await evaluatorFn(methods);
      
      // Final check: did player process all 3 batches?
      await delay(600);
      if (!stateRef.current.isGameOver && !stateRef.current.isVictory) {
        triggerExplosion('Not done yet! You must fuel all 3 batches. Make your loop repeat 3 times.');
      }
    } catch (e: any) {
      if (e?.message === 'SIMULATION_CANCELLED') {
        // Clean simulation stop requested by user - do not trigger explosion
        return;
      }
      if (e?.message !== 'SIMULATION_FAILED' && !stateRef.current.isGameOver) {
        triggerExplosion(`Error: ${e?.message || 'Script stopped unexpectedly'}`);
      }
    }
  }, [addLog, completeCurrentBatch, executeAddSolution, executeIncreaseHeat, executeMix, executePutIntoFuelTank, resetSimulation, triggerExplosion]);

  useImperativeHandle(ref, () => ({
    startSimulation,
    stopSimulation: resetSimulation,
    resetSimulation
  }), [startSimulation, resetSimulation]);

  // Color gradient map for chamber liquid
  const getColorGradient = (c: FuelColor) => {
    switch (c) {
      case 'Orange':
        return 'from-amber-500 via-orange-500 to-yellow-400 shadow-[0_0_40px_rgba(249,115,22,0.85)]';
      case 'Blue':
        return 'from-blue-600 via-cyan-500 to-sky-400 shadow-[0_0_40px_rgba(6,182,212,0.85)]';
      case 'Green':
        return 'from-emerald-600 via-green-500 to-lime-400 shadow-[0_0_40px_rgba(16,185,129,0.85)]';
      case 'Grey':
      default:
        return 'from-slate-700 via-gray-600 to-zinc-500 shadow-[0_0_15px_rgba(100,116,139,0.4)]';
    }
  };

  // Calculate exact center coordinates of each station node for smooth continuous 2D movement
  const getNovaCoordinates = (node: 'CENTER' | 'HEAT' | 'SOLUTION' | 'MIX' | 'TANK') => {
    switch (node) {
      case 'SOLUTION':
        return { left: '16%', top: '15%' };
      case 'MIX':
        return { left: '84%', top: '15%' };
      case 'HEAT':
        return { left: '16%', top: '85%' };
      case 'TANK':
        return { left: '84%', top: '85%' };
      case 'CENTER':
      default:
        return { left: '50%', top: '65%' };
    }
  };

  // Sticker outline style for SVGs (thin white outline)
  const stickerStyle: React.CSSProperties = {
    filter: 'drop-shadow(1.5px 0 0 #fff) drop-shadow(-1.5px 0 0 #fff) drop-shadow(0 1.5px 0 #fff) drop-shadow(0 -1.5px 0 #fff)'
  };

  return (
    <div className="relative w-full h-full min-h-0 bg-[#1a082e] rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl flex flex-col font-sans select-none">
      
      {/* Dynamic Keyframes for Bubbles, Heat Aura & Stirring Rod */}
      <style>{`
        @keyframes riseBubble {
          0% {
            transform: translateY(100%) scale(0.4);
            opacity: 0;
          }
          20% {
            opacity: 0.85;
          }
          75% {
            opacity: 0.75;
          }
          100% {
            transform: translateY(-75px) scale(1.15);
            opacity: 0;
          }
        }
        @keyframes stirRod {
          0% {
            transform: translateX(-50%) rotate(0deg);
          }
          25% {
            transform: translateX(calc(-50% + 9px)) rotate(10deg);
          }
          50% {
            transform: translateX(calc(-50% - 9px)) rotate(-10deg);
          }
          75% {
            transform: translateX(calc(-50% + 6px)) rotate(6deg);
          }
          100% {
            transform: translateX(-50%) rotate(0deg);
          }
        }
        @keyframes heatAuraPulse {
          0%, 100% {
            transform: scaleX(0.92) scaleY(0.85);
            opacity: 0.65;
            filter: blur(10px) brightness(1);
          }
          50% {
            transform: scaleX(1.15) scaleY(1.25);
            opacity: 1;
            filter: blur(14px) brightness(1.35);
          }
        }
        @keyframes heatWaveRise {
          0% {
            transform: translateY(4px) scaleX(0.85);
            opacity: 0.2;
          }
          50% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(-8px) scaleX(1.1);
            opacity: 0;
          }
        }
        @keyframes pourFlaskTilt {
          0% {
            transform: translateY(-8px) rotate(0deg) scale(0.85);
            opacity: 0;
          }
          15% {
            transform: translateY(0) rotate(-55deg) scale(1);
            opacity: 1;
          }
          30% {
            transform: translateY(0) rotate(-65deg) scale(1.04);
            opacity: 1;
          }
          45% {
            transform: translateY(0) rotate(-58deg) scale(1);
            opacity: 1;
          }
          60% {
            transform: translateY(0) rotate(-66deg) scale(1.04);
            opacity: 1;
          }
          80% {
            transform: translateY(0) rotate(-55deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-10px) rotate(0deg) scale(0.85);
            opacity: 0;
          }
        }
        .bubble-anim {
          position: absolute;
          bottom: -4px;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.25));
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
          animation: riseBubble 1.4s ease-in infinite;
          pointer-events: none;
        }
      `}</style>

      {/* ========================================================================= */}
      {/* TOP HEADER: INSTRUCTIONS DROPDOWN (LEFT) & BATCH PROGRESS (RIGHT)        */}
      {/* ========================================================================= */}
      <div className="relative z-40 bg-[#130728]/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between shrink-0 shadow-lg min-h-[52px]">
        
        {/* Instructions Dropdown Guide for Players */}
        <div className="relative">
          <button
            onClick={() => setShowInstructions(prev => !prev)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/60 text-purple-100 hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.35)] active:scale-95 cursor-pointer ring-1 ring-purple-400/30"
            title="How to Play"
          >
            <HelpCircle size={15} className="text-purple-300" />
            <span>Instructions</span>
            {showInstructions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showInstructions && (
            <div className="absolute top-11 left-0 z-50 w-[min(26rem,calc(100vw-2rem))] max-h-[70vh] sm:max-h-[380px] overflow-y-auto bg-[#160a2c]/98 border-2 border-purple-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-amber-400">
                  How to Make Fuel
                </span>
                <button 
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2 text-[11px] font-sans text-gray-200 leading-relaxed">
                <p className="font-semibold text-purple-300">
                  Make 3 batches of <span className="text-orange-400 font-bold">Orange Fuel</span> for the spaceship:
                </p>

                <ul className="space-y-1.5 pl-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">1.</span>
                    <span><strong className="text-cyan-300">Add Solution</strong> into the vat.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">2.</span>
                    <span><strong className="text-orange-300">Increase Heat</strong> to activate the mixture.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">3.</span>
                    <span><strong className="text-purple-300">Mix Solution</strong> 5 times (use a Repeat 5 times loop).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">4.</span>
                    <span>If the fuel turns <strong className="text-emerald-400">Green</strong>, use <strong className="text-cyan-300">Add Solution</strong> to refine it into <strong className="text-orange-400">Orange</strong>.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">5.</span>
                    <span>Once the fuel is <strong className="text-orange-400">Orange</strong>, use <strong className="text-emerald-300">Put into Fuel Tank</strong> to fuel the spaceship.</span>
                  </li>
                </ul>

                <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-purple-300/80 italic">
                  Tip: Repeat your code 3 times to finish all 3 fuel batches.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3-Batch Progress Tracker (Centered Vertically in Header, Aligned Right) */}
        <div className="flex items-center gap-2.5 my-auto">
          <span className="text-[11px] uppercase font-mono font-bold tracking-widest text-purple-300/90 leading-none">
            BATCHES ({Math.min(currentBatchIndex + 1, TOTAL_BATCHES)}/{TOTAL_BATCHES}):
          </span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(idx => {
              const status = batchHistory[idx];
              const isCurrent = idx === currentBatchIndex && isPlaying;

              return (
                <div 
                  key={idx}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center font-mono font-black text-[11px] transition-all duration-300 ${
                    status === 'SUCCESS'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_#10b981]'
                      : status === 'FAILED'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_10px_#f43f5e]'
                      : isCurrent
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 animate-pulse ring-1 ring-amber-400'
                      : 'bg-black/40 border-white/10 text-gray-500'
                  }`}
                >
                  {status === 'SUCCESS' ? <CheckCircle2 size={14} /> : idx + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE MAIN LABORATORY ROOM & 4 INTERACTIVE NODES                            */}
      {/* ========================================================================= */}
      <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center p-2 sm:p-4 bg-[#1a082e]">
        
        {/* Dark Purple Simulation Background */}
        <div className="absolute inset-0 bg-[#1a082e] z-0 pointer-events-none" />

        {/* 2-Row + Center Chamber Formation Container */}
        <div className="relative z-10 w-full max-w-xl h-full flex flex-col justify-between items-center py-1 sm:py-2">
          
          {/* TOP ROW: Add Solution (Left) & Mix Solution (Right) - Frameless Large Icons */}
          <div className="w-full flex items-center justify-between px-6 sm:px-12 pt-1">
            {/* Top Left: Add Solution */}
            <div className="flex flex-col items-center justify-center gap-1 transition-transform duration-300">
              <img 
                src="/assets/global/ui/Solution.svg" 
                alt="Add Solution" 
                className={`w-16 h-16 sm:w-20 sm:h-20 object-contain transition-all duration-300 ${
                  activeStationGlow === 'SOLUTION' ? 'scale-125 drop-shadow-[0_0_24px_rgba(6,182,212,0.95)]' : 'hover:scale-105'
                }`} 
                style={stickerStyle} 
              />
              <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide text-center">Add Solution</span>
            </div>

            {/* Top Right: Mix Solution */}
            <div className="flex flex-col items-center justify-center gap-1 transition-transform duration-300">
              <img 
                src="/assets/global/npcs/Nova Mixing.svg" 
                alt="Mix Solution" 
                className={`w-16 h-16 sm:w-20 sm:h-20 object-contain transition-all duration-700 ${
                  activeStationGlow === 'MIX' ? 'scale-125 animate-pulse drop-shadow-[0_0_24px_rgba(168,85,247,0.95)]' : 'hover:scale-105'
                }`} 
                style={stickerStyle} 
              />
              <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide text-center">Mix Solution</span>
            </div>
          </div>

          {/* CENTER: MIXING CHAMBER VAT & NOVA BELOW IT */}
          <div className="relative flex flex-col items-center justify-center my-auto">
            
            {/* Vat & Base Plate Wrapper with Pulsing Heat Aura Below */}
            <div className={`relative flex flex-col items-center transition-all duration-150 ease-out ${
              isExploding ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
            }`}>
              
              {/* Vat Metal Frame Container (Taller & Sleeker) */}
              <div className={`relative w-32 sm:w-36 h-26 sm:h-30 rounded-2xl bg-black/80 border-2 p-1.5 shadow-2xl flex flex-col items-center justify-end z-10 transition-all duration-300 ${
                activeStationGlow === 'VAT' 
                  ? 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.85)] scale-105 ring-2 ring-cyan-400/50' 
                  : 'border-slate-600'
              }`}>
                
                {/* Long Metallic Stirring Rod (Above the black container interior, dipping into the fuel) */}
                {(activeStationGlow === 'MIX' || (novaNode === 'MIX' && isNovaAction)) && (
                  <div 
                    className="absolute -top-7 sm:-top-8 left-1/2 z-10 pointer-events-none origin-top"
                    style={{ animation: 'stirRod 0.5s ease-in-out infinite' }}
                  >
                    {/* Upper Handle & Long Metallic Rod */}
                    <div className="w-2.5 sm:w-3 h-24 sm:h-28 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-full border border-slate-300 shadow-[0_0_10px_rgba(255,255,255,0.7)] flex flex-col items-center justify-between pb-1">
                      {/* Grip notches */}
                      <div className="w-full flex flex-col items-center gap-1 pt-1.5">
                        <div className="w-2 h-0.5 bg-slate-600 rounded-full opacity-70" />
                        <div className="w-2 h-0.5 bg-slate-600 rounded-full opacity-70" />
                        <div className="w-2 h-0.5 bg-slate-600 rounded-full opacity-70" />
                      </div>
                      {/* Stirring paddle blade at bottom */}
                      <div className="w-5 h-3.5 bg-gradient-to-b from-slate-300 to-slate-600 rounded-md border border-slate-200 shadow-sm" />
                    </div>
                  </div>
                )}

                {/* Solution Pouring Flask Animation */}
                {isPouringSolution && (
                  <div className="absolute -top-12 sm:-top-14 left-1/2 -translate-x-1/2 z-40 pointer-events-none flex flex-col items-center">
                    {/* Tilted & Wobbling Chemical Flask */}
                    <div 
                      className="relative origin-bottom-right"
                      style={{ animation: 'pourFlaskTilt 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}
                    >
                      <img 
                        src="/assets/global/ui/Solution.svg" 
                        alt="Pouring Solution" 
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_0_18px_rgba(6,182,212,0.95)]"
                        style={stickerStyle} 
                      />
                    </div>
                  </div>
                )}

                {/* Dynamic Colored Liquid Level */}
                <div 
                  className={`w-full h-18 sm:h-22 rounded-xl bg-gradient-to-t transition-all duration-700 flex items-center justify-center relative z-20 overflow-hidden ${
                    getColorGradient(currentColor)
                  }`}
                >
                  {/* Rising Bubbles Effect when Heat is Triggered */}
                  {(isHeatedOnce || activeStationGlow === 'HEAT') && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                      <div className="bubble-anim" style={{ left: '12%', width: '8px', height: '8px', animationDuration: '1.2s', animationDelay: '0s' }} />
                      <div className="bubble-anim" style={{ left: '30%', width: '11px', height: '11px', animationDuration: '1.5s', animationDelay: '0.3s' }} />
                      <div className="bubble-anim" style={{ left: '50%', width: '7px', height: '7px', animationDuration: '1.1s', animationDelay: '0.7s' }} />
                      <div className="bubble-anim" style={{ left: '68%', width: '10px', height: '10px', animationDuration: '1.4s', animationDelay: '0.2s' }} />
                      <div className="bubble-anim" style={{ left: '84%', width: '6px', height: '6px', animationDuration: '1.0s', animationDelay: '0.5s' }} />
                      <div className="bubble-anim" style={{ left: '42%', width: '9px', height: '9px', animationDuration: '1.3s', animationDelay: '0.9s' }} />
                    </div>
                  )}

                  <span className="text-[11px] sm:text-xs font-mono font-black uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-20 tracking-wider">
                    Fuel
                  </span>
                </div>

                {/* Bottom Heating Element Coils (Grow larger and glow brightly when Heat is Triggered) */}
                <div className={`w-full transition-all duration-500 bg-slate-900 border-t flex items-center justify-around px-2 shrink-0 z-20 ${
                  isHeatedOnce 
                    ? 'h-3.5 sm:h-4 border-orange-500/60 shadow-[0_0_12px_rgba(249,115,22,0.6)]' 
                    : 'h-2.5 border-white/20'
                }`}>
                  <div className={`transition-all duration-500 rounded-full ${
                    isHeatedOnce 
                      ? 'w-4 sm:w-5 h-2 sm:h-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 shadow-[0_0_12px_#f97316] animate-pulse' 
                      : 'w-2.5 h-1 bg-slate-700'
                  }`} />
                  <div className={`transition-all duration-500 rounded-full ${
                    isHeatedOnce 
                      ? 'w-4 sm:w-5 h-2 sm:h-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 shadow-[0_0_12px_#f97316] animate-pulse' 
                      : 'w-2.5 h-1 bg-slate-700'
                  }`} />
                  <div className={`transition-all duration-500 rounded-full ${
                    isHeatedOnce 
                      ? 'w-4 sm:w-5 h-2 sm:h-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 shadow-[0_0_12px_#f97316] animate-pulse' 
                      : 'w-2.5 h-1 bg-slate-700'
                  }`} />
                  <div className={`transition-all duration-500 rounded-full ${
                    isHeatedOnce 
                      ? 'w-4 sm:w-5 h-2 sm:h-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 shadow-[0_0_12px_#f97316] animate-pulse' 
                      : 'w-2.5 h-1 bg-slate-700'
                  }`} />
                </div>

              </div>

              {/* Chamber Base Plate */}
              <div className={`w-34 sm:w-38 h-2 transition-all duration-500 border-t rounded-b-lg shadow-lg relative z-10 ${
                isHeatedOnce ? 'bg-orange-950 border-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.8)]' : 'bg-slate-800 border-slate-600'
              }`} />

              {/* Unique Pulsing Orange Heat Aura below the fuel chamber */}
              <div className={`absolute -bottom-4 sm:-bottom-5 left-1/2 -translate-x-1/2 transition-all duration-700 pointer-events-none z-0 flex flex-col items-center justify-center ${
                isHeatedOnce ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}>
                {/* Outer expanding orange thermal halo */}
                <div 
                  className={`w-36 sm:w-44 h-8 sm:h-10 rounded-full bg-radial from-orange-500/90 via-amber-500/60 to-transparent blur-md ${
                    activeStationGlow === 'HEAT' ? 'scale-125 brightness-150 animate-ping' : ''
                  }`} 
                  style={{ animation: 'heatAuraPulse 1.6s ease-in-out infinite' }}
                />
                {/* Core concentrated heat beam */}
                <div className="w-24 sm:w-28 h-2 rounded-full bg-gradient-to-r from-orange-600 via-amber-300 to-orange-600 shadow-[0_0_16px_#f97316] -mt-4 blur-[1px] animate-pulse" />
              </div>

            </div>

            {/* Failure Alert FX with Explosion.svg (No text box) */}
            {isExploding && (
              <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-75">
                <img 
                  src="/assets/planets/00_moon/environment/Explosion.svg" 
                  alt="Explosion" 
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain animate-ping opacity-100 drop-shadow-[0_0_35px_rgba(239,68,68,0.95)]"
                  style={stickerStyle}
                />
              </div>
            )}

            {/* Success Vapor FX */}
            {isSuccessVapor && (
              <div className="absolute -top-10 z-30 flex items-center justify-center pointer-events-none animate-bounce">
                <div className="px-3 py-1 rounded-full bg-emerald-500 text-black font-mono font-black text-xs uppercase tracking-widest shadow-[0_0_20px_#10b981]">
                  ✨ COMPLETE!
                </div>
              </div>
            )}

          </div>

          {/* BOTTOM ROW: Increase Heat (Left) & Fuel Spaceship (Right) - Frameless Large Icons */}
          <div className="w-full flex items-center justify-between px-6 sm:px-12 mb-1 sm:mb-2">
            
            {/* Bottom Left: Increase Heat */}
            <div className="flex flex-col items-center justify-center gap-1 transition-transform duration-300">
              <img 
                src="/assets/planets/00_moon/environment/Heat.svg" 
                alt="Increase Heat" 
                className={`w-16 h-16 sm:w-20 sm:h-20 object-contain transition-all duration-300 ${
                  activeStationGlow === 'HEAT' ? 'scale-125 animate-bounce drop-shadow-[0_0_24px_rgba(249,115,22,0.95)]' : 'hover:scale-105'
                }`} 
                style={stickerStyle} 
              />
              <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide text-center">Increase Heat</span>
            </div>

            {/* Bottom Right: Fuel Spaceship */}
            <div className="flex flex-col items-center justify-center gap-1 transition-transform duration-300">
              <img 
                src="/assets/global/ui/Checkpoint.svg" 
                alt="Fuel Spaceship" 
                className={`w-16 h-16 sm:w-20 sm:h-20 object-contain transition-all duration-300 ${
                  activeStationGlow === 'TANK' ? 'scale-125 drop-shadow-[0_0_24px_rgba(16,185,129,0.95)]' : 'hover:scale-105'
                }`} 
                style={stickerStyle} 
              />
              <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide text-center leading-tight">Fuel Spaceship</span>
            </div>

          </div>

          {/* Nova Operator Avatar (Smooth continuous 2D movement between nodes) */}
          <div 
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none ${
              novaNode === 'MIX' && isNovaAction ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
            }`}
            style={{
              left: getNovaCoordinates(novaNode).left,
              top: getNovaCoordinates(novaNode).top,
              transition: 'left 750ms cubic-bezier(0.25, 1, 0.5, 1), top 750ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms ease, transform 300ms ease'
            }}
          >
            <div className="relative">
              <img 
                src={
                  isNovaRunning
                    ? '/assets/global/npcs/Nova Running.svg'
                    : '/assets/global/npcs/Nova Idle.svg'
                } 
                alt="Nova Operator"
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
                style={stickerStyle}
                onError={(e) => {
                  e.currentTarget.src = '/assets/global/team/kath.jpg';
                }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-200 uppercase tracking-wider mt-0.5 bg-black/80 px-2 py-0.5 rounded border border-purple-400/40 shadow-sm">
              Nova
            </span>
          </div>

        </div>

      </div>

    </div>
  );
});

FuelSynthesis.displayName = "FuelSynthesis";
export default FuelSynthesis;
