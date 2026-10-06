'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  EARTH_1_SECTION_SPECS,
  EARTH_1_MAX_CHARS,
  type Earth1ReplaceOp,
  type Earth1ValidationResult,
  type Earth1WorkspaceState,
  formatOutputDisplay,
} from '@/lib/earth/earthLevel1Definitions';

export interface ActiveCrane {
  id: string;
  colIdx: number;
  oldChar: string;
  newChar: string;
  carrying?: string | null;
}

interface EarthLevel1LabProps {
  sectionIndex: number;
  validation: Earth1ValidationResult;
  workspaceState: Earth1WorkspaceState;
  isRunning: boolean;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
  onAdvanceSection?: () => void;
}

interface TileItem {
  id: string;
  char: string;
  isCorrupted: boolean;
  isReplaced?: boolean;
  isArmed?: boolean;
  isExploding?: boolean;
  isExploded?: boolean;
  isCutGlowing?: boolean;
  isCutOff?: boolean;
  beingCarriedUp?: boolean;
}

export default function EarthLevel1Lab({
  sectionIndex,
  validation,
  workspaceState,
  isRunning,
  onSimulationComplete,
}: EarthLevel1LabProps) {
  const spec = EARTH_1_SECTION_SPECS[sectionIndex] || EARTH_1_SECTION_SPECS[0];

  // Visual Tiles State on the Lab Table
  const [tiles, setTiles] = useState<TileItem[]>([]);
  const [splitChunks, setSplitChunks] = useState<string[] | null>(null);

  // Phrase Formation & Match Verification State
  const [formedPhrase, setFormedPhrase] = useState<string | null>(null);
  const [isMatchTesting, setIsMatchTesting] = useState<boolean>(false);
  const [isMatchSuccess, setIsMatchSuccess] = useState<boolean | null>(null);

  // Laser Playback State
  const [laserFired, setLaserFired] = useState<boolean>(false);
  const [laserCharging, setLaserCharging] = useState<boolean>(false);
  const [playbackLaserPos, setPlaybackLaserPos] = useState<{ start: number; stop: number } | null>(null);

  // Crane Playback State (supports simultaneous multi-crane operations)
  const [simCranes, setSimCranes] = useState<ActiveCrane[]>([]);
  const [craneLowered, setCraneLowered] = useState<boolean>(false);
  const [craneOffScreen, setCraneOffScreen] = useState<boolean>(false);

  // Explosion Table Rumble State
  const [isCounterRumbling, setIsCounterRumbling] = useState<boolean>(false);

  // Nova Hover Assistant Chat Bubble State
  const [isNovaHovered, setIsNovaHovered] = useState<boolean>(false);

  // Responsive, comfortable block dimensions (no thin/squished tiles)
  const initialLen = spec.corruptedData.length;
  const tileWidth = initialLen <= 11 ? 32 : initialLen <= 14 ? 26 : 23;

  // Geometry references to anchor lasers & crane permanently to the ceiling rail
  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const wordStripRef = useRef<HTMLDivElement>(null);
  const [laserGeometry, setLaserGeometry] = useState<{
    railLeft: number;
    railRight: number;
    laser1X: number;
    laser2X: number;
    wordLeft: number;
    wordWidth: number;
    beamHeight: number;
    isReady: boolean;
  }>({
    railLeft: 30,
    railRight: 770,
    laser1X: 30,
    laser2X: 770,
    wordLeft: 0,
    wordWidth: 0,
    beamHeight: 280,
    isReady: false,
  });

  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      try {
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
        }
      } catch (e) { }
    };
  }, []);

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTone = (freq: number, type: OscillatorType, duration: number, gainVal: number = 0.15) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch { }
  };

  const playLaserHum = () => playTone(180, 'sawtooth', 0.4, 0.1);
  const playLaserBlast = () => playTone(540, 'square', 0.35, 0.25);
  const playCraneClank = () => playTone(300, 'triangle', 0.25, 0.18);

  const playExplosion = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(140, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.55);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(220, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.55);
      osc2.stop(ctx.currentTime + 0.55);
    } catch { }
  };

  const playFormingSwoosh = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch { }
  };

  const playSuccessChime = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'sine', 0.35, 0.2), idx * 100);
      });
    } catch { }
  };

  const playBuzzer = () => playTone(140, 'sawtooth', 0.45, 0.22);

  // Initialize/Reset tiles whenever corruptedData or sectionIndex changes
  const resetTiles = () => {
    const raw = spec.corruptedData;
    const initialTiles: TileItem[] = raw.split('').map((ch, idx) => ({
      id: `tile-${idx}-${ch}`,
      char: ch,
      isCorrupted: true,
      isReplaced: false,
      isArmed: false,
      isExploding: false,
      isExploded: false,
      isCutGlowing: false,
      isCutOff: false,
      beingCarriedUp: false,
    }));
    setTiles(initialTiles);
    setSplitChunks(null);
    setFormedPhrase(null);
    setIsMatchTesting(false);
    setIsMatchSuccess(null);
    setLaserFired(false);
    setLaserCharging(false);
    setPlaybackLaserPos(null);
    setSimCranes([]);
    setCraneLowered(false);
    setCraneOffScreen(false);
    setIsCounterRumbling(false);
  };

  useEffect(() => {
    resetTiles();
  }, [spec.corruptedData, sectionIndex]);

  // Real-Time Tool Positions from Workspace (strictly from connected operations attached to Load Data)
  const connectedOps = (workspaceState.hasData && workspaceState.operations) ? workspaceState.operations : [];
  const realTimeSliceOp = connectedOps.find((op) => op.type === 'slice');
  const realTimeSplitOp = connectedOps.find((op) => op.type === 'split');

  // Count active visible columns
  const visibleTiles = tiles.filter((t) => !t.isCutOff);
  const totalCols = Math.max(1, visibleTiles.length);
  const currentText =
    formedPhrase ||
    (splitChunks ? splitChunks.join(' ') : visibleTiles.map((t) => t.char).join('')) ||
    spec.corruptedData;

  // Active laser cut boundaries
  // During simulation: ONLY use playbackLaserPos (controlled by the execution queue).
  // When idle: show realTimeSliceOp preview if connected to Load Data.
  // When not actively slicing: returns null (lasers park at opposite ends of the ceiling rod).
  const activeLaserPos = useMemo(() => {
    if (playbackLaserPos) return playbackLaserPos;
    if (!isRunning && realTimeSliceOp && workspaceState.hasData) {
      return {
        start: Math.max(0, Math.min(realTimeSliceOp.start, totalCols)),
        stop: Math.max(0, Math.min(realTimeSliceOp.stop, totalCols)),
      };
    }
    return null;
  }, [playbackLaserPos, isRunning, realTimeSliceOp?.start, realTimeSliceOp?.stop, totalCols, workspaceState.hasData]);

  const isLaserTargeting = activeLaserPos !== null;

  // Real-time matching cranes for replace operations connected to Load Data (all appear simultaneously)
  const realTimeCranes = useMemo<ActiveCrane[]>(() => {
    if (isRunning || !workspaceState.hasData) return [];
    const replaceOps = connectedOps.filter(
      (op): op is Earth1ReplaceOp => op.type === 'replace'
    );
    if (replaceOps.length === 0) return [];

    const cranes: ActiveCrane[] = [];
    const handledCols = new Set<number>();

    for (const op of replaceOps) {
      if (!op.oldStr) continue;
      tiles.forEach((t, idx) => {
        if (!t.isCutOff && t.char === op.oldStr && !handledCols.has(idx)) {
          // If a slice block appears before this replace op in the connected chain, ignore tiles outside the cut boundaries
          const sliceIdx = connectedOps.findIndex((o) => o.type === 'slice');
          const isSliceBefore = sliceIdx !== -1 && sliceIdx < connectedOps.indexOf(op);
          if (isSliceBefore && realTimeSliceOp) {
            const start = Math.max(0, realTimeSliceOp.start);
            const stop = Math.min(tiles.length, realTimeSliceOp.stop);
            if (idx < start || idx >= stop) return;
          }

          handledCols.add(idx);
          cranes.push({
            id: `realtime-crane-${idx}-${op.oldStr}-${op.newStr}`,
            colIdx: idx,
            oldChar: op.oldStr,
            newChar: op.newStr,
            carrying: op.newStr,
          });
        }
      });
    }

    return cranes;
  }, [isRunning, workspaceState.hasData, connectedOps, tiles, realTimeSliceOp]);

  const activeCranes = isRunning ? simCranes : realTimeCranes;

  // Compute exact horizontal coordinates relative to containerRef so lasers/crane are permanently anchored at top
  const updateGeometry = useCallback(() => {
    if (!containerRef.current || !wordStripRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const wRect = wordStripRef.current.getBoundingClientRect();

    let rLeft = 32;
    let rRight = Math.round(cRect.width - 32);
    if (railRef.current) {
      const rRect = railRef.current.getBoundingClientRect();
      rLeft = Math.round(rRect.left - cRect.left + 20);
      rRight = Math.round(rRect.right - cRect.left - 20);
    }

    const wordLeft = Math.round(wRect.left - cRect.left);
    const wordWidth = Math.round(wRect.width);
    // Ceiling rail sits at top: 10px. Laser nozzle assembly is ~36px tall.
    // Beam must reach THROUGH the blocks to their bottom edge.
    const beamH = Math.max(60, Math.round(wRect.bottom - cRect.top - 44));

    const cols = Math.max(1, totalCols);

    let x1 = rLeft;
    let x2 = rRight;

    if (activeLaserPos) {
      const startCol = activeLaserPos.start;
      const stopCol = activeLaserPos.stop;
      x1 = Math.round(wordLeft + (startCol / cols) * wordWidth);
      x2 = Math.round(wordLeft + (stopCol / cols) * wordWidth);
    }

    // Bail out if geometry hasn't changed to avoid unnecessary re-renders
    setLaserGeometry((prev) => {
      if (
        prev.isReady &&
        prev.railLeft === rLeft &&
        prev.railRight === rRight &&
        prev.laser1X === x1 &&
        prev.laser2X === x2 &&
        prev.wordLeft === wordLeft &&
        prev.wordWidth === wordWidth &&
        prev.beamHeight === beamH
      ) {
        return prev;
      }
      return {
        railLeft: rLeft,
        railRight: rRight,
        laser1X: x1,
        laser2X: x2,
        wordLeft,
        wordWidth,
        beamHeight: beamH,
        isReady: true,
      };
    });
  }, [totalCols, activeLaserPos]);

  useEffect(() => {
    updateGeometry();

    const ro = new ResizeObserver(() => {
      updateGeometry();
    });
    if (containerRef.current) ro.observe(containerRef.current);
    if (wordStripRef.current) ro.observe(wordStripRef.current);
    if (railRef.current) ro.observe(railRef.current);

    window.addEventListener('resize', updateGeometry);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateGeometry);
    };
  }, [updateGeometry, tiles.length, splitChunks, formedPhrase, isRunning]);

  // Main Animation Orchestrator when isRunning triggers
  useEffect(() => {
    if (!isRunning) {
      resetTiles();
      return;
    }

    if (!validation.isValid && validation.errorType === 'EMPTY') {
      onSimulationComplete?.(false, validation.errorMessage || 'Workspace is empty.');
      return;
    }

    if (validation.errorType === 'NO_DATA') {
      playBuzzer();
      onSimulationComplete?.(false, validation.errorMessage || 'Attach your blocks under "Load Data".');
      return;
    }

    if (validation.errorType === 'NO_OPERATIONS') {
      playBuzzer();
      onSimulationComplete?.(false, validation.errorMessage || 'Snap a tool block under "Load Data".');
      return;
    }

    if (validation.errorType === 'ORDER_ERROR') {
      playBuzzer();
      onSimulationComplete?.(false, validation.errorMessage || 'Check block order.');
      return;
    }

    if (validation.errorType === 'RUNTIME_ERROR') {
      playBuzzer();
      onSimulationComplete?.(false, validation.errorMessage || 'Check your block values.');
      return;
    }

    let isCancelled = false;

    const runExecutionQueue = async () => {
      resetTiles();
      let currentTileList: TileItem[] = spec.corruptedData.split('').map((ch, idx) => ({
        id: `t-${idx}-${ch}`,
        char: ch,
        isCorrupted: true,
      }));

      // Local tracking variable for split chunks (React state is stale in async closures)
      let localSplitChunks: string[] | null = null;

      await delay(500);
      if (isCancelled) return;

      const ops = validation.operations;

      for (let i = 0; i < ops.length; i++) {
        if (isCancelled) return;
        const op = ops[i];

        // ---------------------------------------------------------------------
        // TOOL 1: SLICING = RED LASERS
        // ---------------------------------------------------------------------
        if (op.type === 'slice') {
          const totalLen = currentTileList.length;
          if (op.start >= op.stop) {
            setPlaybackLaserPos({ start: Math.min(op.start, totalLen), stop: Math.min(op.stop, totalLen) });
            playLaserHum();
            await delay(400);
            if (isCancelled) return;
            currentTileList = [];
            setTiles([]);
            setPlaybackLaserPos(null);
            await delay(400);
          } else {
            const clampedStart = Math.max(0, Math.min(op.start, totalLen));
            const clampedStop = Math.max(clampedStart, Math.min(op.stop, totalLen));
            setPlaybackLaserPos({ start: clampedStart, stop: clampedStop });
            playLaserHum();
            await delay(700);
            if (isCancelled) return;

            setLaserCharging(true);
            await delay(450);
            if (isCancelled) return;

            setLaserCharging(false);
            setLaserFired(true);
            playLaserBlast();

            // Phase 1: Mark cut-off areas RED and GLOWING!
            const markedGlowing = currentTileList.map((t, idx) => {
              const isCut = idx < clampedStart || idx >= clampedStop;
              return {
                ...t,
                isCutGlowing: isCut,
              };
            });
            setTiles(markedGlowing);
            await delay(700);
            if (isCancelled) return;

            // Phase 2: Cut-off areas shrink/collapse with constant tile width
            const disappearing = markedGlowing.map((t) => ({
              ...t,
              isCutOff: t.isCutGlowing,
            }));
            setTiles(disappearing);
            await delay(450);
            if (isCancelled) return;

            setLaserFired(false);
            const survivors = disappearing.filter((t) => !t.isCutOff);
            currentTileList = survivors.map((t) => ({ ...t, isCutGlowing: false }));
            setTiles([...currentTileList]);
            setPlaybackLaserPos(null);
            await delay(450);
          }
        }

        // ---------------------------------------------------------------------
        // TOOL 2: REPLACING = SIMULTANEOUS CRANES (ALL REPLACEMENTS AT ONCE)
        // ---------------------------------------------------------------------
        else if (op.type === 'replace') {
          // Batch all consecutive replace operations so they execute all at once in parallel
          const replaceBatch: Earth1ReplaceOp[] = [op as Earth1ReplaceOp];
          while (i + 1 < ops.length && ops[i + 1].type === 'replace') {
            replaceBatch.push(ops[i + 1] as Earth1ReplaceOp);
            i++;
          }

          // Match each operation in the batch against the current survivor tiles
          const batchCranes: ActiveCrane[] = [];
          const matchedCols = new Set<number>();

          for (const repOp of replaceBatch) {
            const oldTarget = repOp.oldStr ? repOp.oldStr.toUpperCase() : '';
            const newTarget = repOp.newStr ? repOp.newStr.toUpperCase() : '';
            if (!oldTarget) continue;
            currentTileList.forEach((t, idx) => {
              if (!t.isCutOff && (t.char === oldTarget || t.char.toUpperCase() === oldTarget) && !matchedCols.has(idx)) {
                matchedCols.add(idx);
                batchCranes.push({
                  id: `sim-crane-${idx}-${oldTarget}-${newTarget}`,
                  colIdx: idx,
                  oldChar: oldTarget,
                  newChar: newTarget,
                  carrying: null,
                });
              }
            });
          }

          if (batchCranes.length > 0) {
            if (isCancelled) return;

            // Step 1: All cranes position above matching columns simultaneously
            setSimCranes(batchCranes);
            setCraneLowered(false);
            setCraneOffScreen(false);
            playCraneClank();
            await delay(500);
            if (isCancelled) return;

            // Step 2: All cranes lower simultaneously
            setCraneLowered(true);
            playCraneClank();
            await delay(450);
            if (isCancelled) return;

            // Step 3: All cranes grab old letters simultaneously and hoist off-screen
            setSimCranes(batchCranes.map((c) => ({ ...c, carrying: c.oldChar })));
            setCraneLowered(false);
            setCraneOffScreen(true);
            batchCranes.forEach((c) => {
              currentTileList[c.colIdx] = {
                ...currentTileList[c.colIdx],
                beingCarriedUp: true,
              };
            });
            setTiles([...currentTileList]);
            playCraneClank();
            await delay(700);
            if (isCancelled) return;

            // Step 4: All cranes swap off-screen to replacement letters and descend simultaneously
            setCraneOffScreen(false);
            setSimCranes(batchCranes.map((c) => ({ ...c, carrying: c.newChar })));
            setCraneLowered(true);
            playCraneClank();
            await delay(500);
            if (isCancelled) return;

            // Step 5: Place replacement letters into tiles simultaneously
            batchCranes.forEach((c) => {
              currentTileList[c.colIdx] = {
                ...currentTileList[c.colIdx],
                char: c.newChar,
                isCorrupted: false,
                isReplaced: true,
                beingCarriedUp: false,
              };
            });
            setTiles([...currentTileList]);
            setSimCranes(batchCranes.map((c) => ({ ...c, carrying: null })));
            setCraneLowered(false);
            await delay(400);
            if (isCancelled) return;

            // Step 6: Retract all cranes simultaneously
            setSimCranes([]);
            await delay(350);
          }
        }

        // ---------------------------------------------------------------------
        // TOOL 3: SPLITTING = CHARACTERS EXPLODE WITH VISCERAL BLAST EFFECT
        // ---------------------------------------------------------------------
        else if (op.type === 'split') {
          const hasDelim = currentTileList.some((t) => t.char === op.delimiter);

          if (hasDelim) {
            // Step 1: Arm delimiter with pulsing warning
            const armed = currentTileList.map((t) => ({
              ...t,
              isArmed: t.char === op.delimiter,
            }));
            setTiles(armed);
            await delay(500);
            if (isCancelled) return;

            // Step 2: Detonation shockwave, fireball, sparks & countertop rumble
            playExplosion();
            setIsCounterRumbling(true);
            const exploding = currentTileList.map((t) => ({
              ...t,
              isArmed: false,
              isExploding: t.char === op.delimiter,
            }));
            setTiles(exploding);
            await delay(650);
            if (isCancelled) return;

            setIsCounterRumbling(false);

            // Step 3: Delimiter vanishes completely
            const exploded = currentTileList.map((t) => ({
              ...t,
              isExploding: false,
              isExploded: t.char === op.delimiter,
            }));
            setTiles(exploded);
            await delay(250);
            if (isCancelled) return;

            // Step 4: Chunks cleanly separate across countertop
            const fullStr = currentTileList.map((t) => t.char).join('');
            const chunks = fullStr.split(op.delimiter);
            localSplitChunks = chunks;
            setSplitChunks(chunks);
            await delay(600);
          } else {
            const fullStr = currentTileList.map((t) => t.char).join('');
            const chunks = op.delimiter ? fullStr.split(op.delimiter) : [fullStr];
            localSplitChunks = chunks;
            setSplitChunks(chunks);
            await delay(400);
          }
        }
      }

      // -----------------------------------------------------------------------
      // STEP 4: FORM TOGETHER INTO A PHRASE & VERIFY MATCH WITH BOTTOM SIGN
      // -----------------------------------------------------------------------
      await delay(400);
      if (isCancelled) return;

      // Build the final phrase from local tracking (NOT React state, which is stale in closures)
      let finalPhraseStr: string;
      if (localSplitChunks) {
        finalPhraseStr = localSplitChunks.join(' ');
      } else {
        finalPhraseStr = currentTileList.map((t) => t.char).join('');
      }

      // Step 4: Verification & Output Gate
      if (!workspaceState.hasPrint) {
        // Without Print Data block, data is processed in memory but never printed (do NOT show formedPhrase badge)
        setIsMatchTesting(true);
        setIsMatchSuccess(false);
        playBuzzer();
        await delay(1200);
        if (isCancelled) return;
        onSimulationComplete?.(
          false,
          'Don\'t forget to print! Snap "Print Data" at the bottom.'
        );
        return;
      }

      // Step 4A: Print Data attached -> Blocks form together into the unified printed phrase badge
      playFormingSwoosh();
      setFormedPhrase(finalPhraseStr);
      await delay(1000);
      if (isCancelled) return;

      // Step 4B: Verification scan comparing with bottom sign counter
      setIsMatchTesting(true);
      await delay(2000);
      if (isCancelled) return;

      if (validation.isMatch) {
        setIsMatchSuccess(true);
        playSuccessChime();
        await delay(1200);
        if (isCancelled) return;
        onSimulationComplete?.(true);
      } else {
        setIsMatchSuccess(false);
        playBuzzer();
        await delay(1200);
        if (isCancelled) return;
        onSimulationComplete?.(
          false,
          `Expected "${formatOutputDisplay(spec.targetOutput)}", but got "${finalPhraseStr}".`
        );
      }
    };

    runExecutionQueue();

    return () => {
      isCancelled = true;
    };
  }, [isRunning, sectionIndex, validation]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col justify-end items-center bg-[#070b14] text-slate-100 select-none overflow-hidden relative font-mono"
    >
      <style>{`
        @keyframes laserSlowBlink {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.95;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px) translateY(1px); }
          40% { transform: translateX(3px) translateY(-1px); }
          60% { transform: translateX(-2px) translateY(1px); }
          80% { transform: translateX(2px) translateY(-1px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. BACKGROUND: COCKPIT OBSERVATORY, DISTINGUISHABLE WALLS & FLOOR         */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 flex justify-center items-start pointer-events-none z-0 overflow-hidden">
        <svg
          viewBox="0 0 800 360"
          className="w-full h-full"
          preserveAspectRatio="xMidYMin slice"
        >
          <defs>
            {/* Deep Space Viewport */}
            <radialGradient id="labCosmos" cx="50%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="60%" stopColor="#050811" />
              <stop offset="100%" stopColor="#020408" />
            </radialGradient>

            {/* Distinguishable Sci-Fi Floor Deck Gradient */}
            <linearGradient id="floorDeckGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="25%" stopColor="#141e2e" />
              <stop offset="60%" stopColor="#0d1522" />
              <stop offset="100%" stopColor="#070c16" />
            </linearGradient>

            {/* Left Bulkhead Wall Gradient */}
            <linearGradient id="bulkheadWallLeft" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="65%" stopColor="#151f30" />
              <stop offset="100%" stopColor="#0e1624" />
            </linearGradient>

            {/* Right Bulkhead Wall Gradient */}
            <linearGradient id="bulkheadWallRight" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="65%" stopColor="#151f30" />
              <stop offset="100%" stopColor="#0e1624" />
            </linearGradient>

            {/* Glass Glare */}
            <linearGradient id="glassGlare" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.12" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.03" />
              <stop offset="70%" stopColor="#64748b" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
            </linearGradient>

            {/* Steel Mullions */}
            <linearGradient id="steelBeam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Deep Space Background */}
          <rect width="800" height="240" fill="url(#labCosmos)" />

          {/* Stars */}
          <g>
            {[
              [60, 60, 1.2], [110, 100, 1.8], [170, 50, 2.2], [140, 150, 1], [190, 200, 1.3],
              [250, 80, 1.5], [290, 130, 2], [270, 190, 1.1], [320, 60, 1.3], [350, 110, 1.8],
              [420, 70, 2], [460, 130, 1.4], [440, 190, 1.2], [500, 85, 1.7], [530, 140, 1.3],
              [580, 65, 2.2], [620, 120, 1.5], [660, 170, 1.3], [700, 85, 1.6], [740, 130, 1.8],
              [210, 120, 0.8], [380, 160, 1.2], [480, 160, 1], [640, 60, 1.4], [80, 190, 1.5],
              [360, 35, 2], [430, 40, 1.6], [520, 45, 1.8], [150, 35, 1.3], [670, 45, 1.5],
            ].map(([cx, cy, r], sIdx) => (
              <circle
                key={`star-${sIdx}`}
                cx={cx}
                cy={cy}
                r={r}
                fill={sIdx % 4 === 0 ? '#38bdf8' : '#ffffff'}
                opacity={0.65 + (sIdx % 4) * 0.1}
              />
            ))}
          </g>

          {/* 4-SECTIONED TRAPEZOIDAL CURVED OBSERVATORY WINDOW */}
          <path d="M 110 32 L 245 28 L 210 240 L 35 240 Z" fill="url(#glassGlare)" stroke="#0f172a" strokeWidth="3" />
          <path d="M 260 27 L 392 23 L 388 240 L 225 240 Z" fill="url(#glassGlare)" stroke="#0f172a" strokeWidth="3" />
          <path d="M 408 23 L 540 27 L 575 240 L 412 240 Z" fill="url(#glassGlare)" stroke="#0f172a" strokeWidth="3" />
          <path d="M 555 28 L 690 32 L 765 240 L 590 240 Z" fill="url(#glassGlare)" stroke="#0f172a" strokeWidth="3" />

          {/* 3 HEAVY STEEL MULLIONS */}
          <path d="M 245 28 L 260 27 L 225 240 L 210 240 Z" fill="url(#steelBeam)" stroke="#475569" strokeWidth="1.5" />
          <path d="M 392 23 L 408 23 L 412 240 L 388 240 Z" fill="url(#steelBeam)" stroke="#475569" strokeWidth="1.5" />
          <path d="M 540 27 L 555 28 L 590 240 L 575 240 Z" fill="url(#steelBeam)" stroke="#475569" strokeWidth="1.5" />

          {/* TOP CURVED STEEL ARCH */}
          <path d="M 20 245 L 105 28 Q 400 8 695 28 L 780 245" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
          <path d="M 20 245 L 105 28 Q 400 8 695 28 L 780 245" fill="none" stroke="#475569" strokeWidth="2" />

          {/* INDUSTRIAL CABLES & WIRE BUNDLES */}
          <path d="M 90 28 Q 170 70 250 28" fill="none" stroke="#0e1726" strokeWidth="4" />
          <path d="M 90 28 Q 170 70 250 28" fill="none" stroke="#1e293b" strokeWidth="2.5" />
          <path d="M 85 30 Q 165 76 255 30" fill="none" stroke="#334155" strokeWidth="1.5" />

          <path d="M 390 24 Q 455 60 545 28" fill="none" stroke="#0e1726" strokeWidth="3" />
          <path d="M 390 24 Q 455 60 545 28" fill="none" stroke="#334155" strokeWidth="1.5" />

          <path d="M 550 28 Q 620 75 700 32" fill="none" stroke="#0e1726" strokeWidth="3.5" />
          <path d="M 550 28 Q 620 75 700 32" fill="none" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.7" />

          <path d="M 30 240 Q 90 265 150 248" fill="none" stroke="#0e1726" strokeWidth="3" />
          <path d="M 30 240 Q 90 265 150 248" fill="none" stroke="#1e293b" strokeWidth="1.5" />
          <path d="M 650 240 Q 590 268 530 252" fill="none" stroke="#0e1726" strokeWidth="3" />
          <path d="M 650 240 Q 590 268 530 252" fill="none" stroke="#1e293b" strokeWidth="1.5" />

          {/* SOLID SCI-FI BULKHEAD WALLS */}
          <path d="M 0 0 L 105 28 L 20 240 L 0 240 Z" fill="url(#bulkheadWallLeft)" stroke="#334155" strokeWidth="2" />
          <line x1="8" y1="50" x2="80" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="5" y1="125" x2="50" y2="125" stroke="#334155" strokeWidth="1" />
          <line x1="0" y1="185" x2="30" y2="185" stroke="#334155" strokeWidth="1" />

          <path d="M 800 0 L 695 28 L 780 240 L 800 240 Z" fill="url(#bulkheadWallRight)" stroke="#334155" strokeWidth="2" />
          <line x1="720" y1="50" x2="792" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />
          <line x1="750" y1="125" x2="795" y2="125" stroke="#334155" strokeWidth="1" />
          <line x1="770" y1="185" x2="800" y2="185" stroke="#334155" strokeWidth="1" />

          {/* LABORATORY FLOOR DECK */}
          <rect x="0" y="240" width="800" height="120" fill="url(#floorDeckGrad)" />
          <line x1="0" y1="240" x2="800" y2="240" stroke="#38bdf8" strokeOpacity="0.45" strokeWidth="2" />
          <line x1="0" y1="242" x2="800" y2="242" stroke="#1e293b" strokeWidth="2" />

          {/* Perspective Deck Seams */}
          <line x1="160" y1="240" x2="60" y2="360" stroke="#25354d" strokeWidth="1.5" />
          <line x1="290" y1="240" x2="230" y2="360" stroke="#25354d" strokeWidth="1.5" />
          <line x1="510" y1="240" x2="570" y2="360" stroke="#25354d" strokeWidth="1.5" />
          <line x1="640" y1="240" x2="740" y2="360" stroke="#25354d" strokeWidth="1.5" />

          <line x1="0" y1="275" x2="800" y2="275" stroke="#1c283c" strokeWidth="1" />
          <line x1="0" y1="315" x2="800" y2="315" stroke="#162030" strokeWidth="1" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 2. FLAT MINIMALIST BACKGROUND MONITORS (SOLID, NO DEPTH, NO TRANSPARENCY)  */}
      {/* ========================================================================= */}
      {/* Flat Background Monitor - Left */}
      <div className="absolute top-12 left-10 sm:left-16 flex flex-col items-center pointer-events-none z-5">
        <div className="w-18 sm:w-21 h-14 sm:h-16 rounded bg-[#1e293b] border border-slate-600 p-1.5 flex flex-col justify-between">
          <div className="flex justify-center gap-1 w-full">
            <div className="w-3 h-0.5 bg-slate-700 rounded-full" />
            <div className="w-3 h-0.5 bg-slate-700 rounded-full" />
          </div>
          <div className="w-full flex-1 rounded-xs bg-[#030712] border border-slate-700 my-1" />
          <div className="w-full flex justify-between items-center px-0.5">
            <div className="w-2.5 h-0.5 bg-slate-600 rounded-full" />
            <div className="w-1 h-1 rounded-full bg-slate-500" />
          </div>
        </div>
        <svg className="w-10 h-12 overflow-visible pointer-events-none">
          <path d="M 10 0 L 10 35 Q 10 45 2 45" fill="none" stroke="#1e293b" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Flat Background Monitor - Right */}
      <div className="absolute top-12 right-10 sm:right-16 flex flex-col items-center pointer-events-none z-5">
        <div className="w-18 sm:w-21 h-14 sm:h-16 rounded bg-[#1e293b] border border-slate-600 p-1.5 flex flex-col justify-between">
          <div className="flex justify-center gap-1 w-full">
            <div className="w-3 h-0.5 bg-slate-700 rounded-full" />
            <div className="w-3 h-0.5 bg-slate-700 rounded-full" />
          </div>
          <div className="w-full flex-1 rounded-xs bg-[#030712] border border-slate-700 my-1" />
          <div className="w-full flex justify-between items-center px-0.5">
            <div className="w-1 h-1 rounded-full bg-slate-500" />
            <div className="w-2.5 h-0.5 bg-slate-600 rounded-full" />
          </div>
        </div>
        <svg className="w-10 h-12 overflow-visible pointer-events-none">
          <path d="M 10 0 L 10 35 Q 10 45 18 45" fill="none" stroke="#1e293b" strokeWidth="1.5" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 3. CEILING INDUSTRIAL RAIL (SPANS ACROSS CEILING HORIZONTALLY)             */}
      {/* ========================================================================= */}
      <div
        ref={railRef}
        className="absolute top-2 inset-x-4 sm:inset-x-8 h-2.5 rounded bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 shadow-md border-b border-slate-600 z-20 pointer-events-none flex items-center justify-between px-3"
      >
        <div className="w-2 h-1 bg-slate-500 rounded-full" />
        <div className="w-32 h-0.5 bg-slate-600 rounded-full" />
        <div className="w-2 h-1 bg-slate-500 rounded-full" />
      </div>

      {/* ========================================================================= */}
      {/* 4. OVERHEAD SLICING LASERS: PERMANENTLY ANCHORED AT CEILING RAIL          */}
      {/* They sit at opposite ends of the rod when idle or after completing cuts   */}
      {/* ========================================================================= */}
      {laserGeometry.isReady && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {/* Start Laser Cutter Assembly */}
          <div
            className="absolute transition-all duration-500 ease-in-out pointer-events-none z-30 flex flex-col items-center"
            style={{
              left: `${laserGeometry.laser1X}px`,
              top: '10px',
              transform: 'translateX(-50%)',
            }}
          >
            {/* Sleek Sci-Fi Industrial Gantry Laser Cutter Assembly */}
            <div className="flex flex-col items-center shrink-0">
              {/* Dual Bearing Rail Clamps */}
              <div className="w-9 h-1.5 bg-slate-900 border-t border-x border-slate-600 rounded-t flex justify-between px-1 items-center shadow-xs">
                <div className="w-1.5 h-1 bg-slate-400 rounded-xs" />
                <div className="w-1.5 h-1 bg-slate-400 rounded-xs" />
              </div>
              {/* Titanium Main Chassis with Heat Sink Ribs */}
              <div className="w-8 h-4.5 bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-slate-600 rounded-xs flex items-center justify-between px-1 shadow-md relative">
                {/* Heat Sink Vents */}
                <div className="flex flex-col gap-0.5">
                  <div className="w-2.5 h-0.5 bg-amber-500/70 rounded-full" />
                  <div className="w-2 h-0.5 bg-amber-500/50 rounded-full" />
                </div>
                {/* Status Diode */}
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    laserFired
                      ? 'bg-white shadow-[0_0_10px_#ffffff,0_0_18px_#ef4444]'
                      : laserCharging
                      ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping'
                      : 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                  }`}
                />
              </div>
              {/* Tapered Optics Collimator Nozzle */}
              <div className="w-4 h-2 bg-gradient-to-b from-slate-700 to-slate-900 border-x border-slate-600 flex items-center justify-center [clip-path:polygon(0_0,100%_0,80%_100%,20%_100%)] shadow-inner" />
              {/* Ruby Focusing Lens Emitter */}
              <div
                className={`w-2.5 h-1.5 rounded-full transition-all ${
                  laserFired
                    ? 'bg-white shadow-[0_0_14px_#ffffff,0_0_24px_#ef4444] scale-125'
                    : laserCharging
                    ? 'bg-red-500 shadow-[0_0_10px_#ef4444] scale-110'
                    : 'bg-red-600 shadow-[0_0_6px_#ef4444]'
                }`}
              />
            </div>

            {/* ACTIVELY TARGETING: Blinking Dashes targeting guide line */}
            {!laserFired && isLaserTargeting && (
              <>
                <div
                  className="w-0 border-l-2 border-dashed border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-all pointer-events-none"
                  style={{
                    height: `${laserGeometry.beamHeight}px`,
                    animation: 'laserSlowBlink 2.2s ease-in-out infinite',
                  }}
                />
                {/* Targeting crosshair blip on the block seam */}
                <div
                  className="w-2.5 h-2.5 rounded-full -mt-1 shrink-0 border border-dashed border-red-400 bg-red-500/30 shadow-[0_0_8px_#ef4444]"
                  style={{
                    animation: 'laserSlowBlink 2.2s ease-in-out infinite',
                  }}
                />
              </>
            )}

            {/* ACTIVE SIMULATION: Intense solid red cutting line shooting from top down through seam */}
            {laserFired && (
              <>
                <div
                  className="w-1 sm:w-1.5 bg-white shadow-[0_0_12px_#ef4444,0_0_24px_#dc2626,0_0_40px_#b91c1c] animate-pulse transition-all pointer-events-none"
                  style={{
                    height: `${laserGeometry.beamHeight}px`,
                  }}
                />
                {/* Focal Slicing Spark on the Letter Dividing Seam */}
                <div className="w-4 h-4 rounded-full -mt-2 shrink-0 bg-white shadow-[0_0_16px_#ffffff,0_0_30px_#ef4444] scale-150 animate-ping" />
              </>
            )}
          </div>

          {/* Stop Laser Cutter Assembly */}
          <div
            className="absolute transition-all duration-500 ease-in-out pointer-events-none z-30 flex flex-col items-center"
            style={{
              left: `${laserGeometry.laser2X}px`,
              top: '10px',
              transform: 'translateX(-50%)',
            }}
          >
            {/* Sleek Sci-Fi Industrial Gantry Laser Cutter Assembly */}
            <div className="flex flex-col items-center shrink-0">
              {/* Dual Bearing Rail Clamps */}
              <div className="w-9 h-1.5 bg-slate-900 border-t border-x border-slate-600 rounded-t flex justify-between px-1 items-center shadow-xs">
                <div className="w-1.5 h-1 bg-slate-400 rounded-xs" />
                <div className="w-1.5 h-1 bg-slate-400 rounded-xs" />
              </div>
              {/* Titanium Main Chassis with Heat Sink Ribs */}
              <div className="w-8 h-4.5 bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-slate-600 rounded-xs flex items-center justify-between px-1 shadow-md relative">
                {/* Heat Sink Vents */}
                <div className="flex flex-col gap-0.5">
                  <div className="w-2.5 h-0.5 bg-amber-500/70 rounded-full" />
                  <div className="w-2 h-0.5 bg-amber-500/50 rounded-full" />
                </div>
                {/* Status Diode */}
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    laserFired
                      ? 'bg-white shadow-[0_0_10px_#ffffff,0_0_18px_#ef4444]'
                      : laserCharging
                      ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-ping'
                      : 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                  }`}
                />
              </div>
              {/* Tapered Optics Collimator Nozzle */}
              <div className="w-4 h-2 bg-gradient-to-b from-slate-700 to-slate-900 border-x border-slate-600 flex items-center justify-center [clip-path:polygon(0_0,100%_0,80%_100%,20%_100%)] shadow-inner" />
              {/* Ruby Focusing Lens Emitter */}
              <div
                className={`w-2.5 h-1.5 rounded-full transition-all ${
                  laserFired
                    ? 'bg-white shadow-[0_0_14px_#ffffff,0_0_24px_#ef4444] scale-125'
                    : laserCharging
                    ? 'bg-red-500 shadow-[0_0_10px_#ef4444] scale-110'
                    : 'bg-red-600 shadow-[0_0_6px_#ef4444]'
                }`}
              />
            </div>

            {/* ACTIVELY TARGETING: Blinking Dashes targeting guide line */}
            {!laserFired && isLaserTargeting && (
              <>
                <div
                  className="w-0 border-l-2 border-dashed border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-all pointer-events-none"
                  style={{
                    height: `${laserGeometry.beamHeight}px`,
                    animation: 'laserSlowBlink 2.2s ease-in-out infinite',
                  }}
                />
                {/* Targeting crosshair blip on the block seam */}
                <div
                  className="w-2.5 h-2.5 rounded-full -mt-1 shrink-0 border border-dashed border-red-400 bg-red-500/30 shadow-[0_0_8px_#ef4444]"
                  style={{
                    animation: 'laserSlowBlink 2.2s ease-in-out infinite',
                  }}
                />
              </>
            )}

            {/* ACTIVE SIMULATION: Intense solid red cutting line shooting from top down through seam */}
            {laserFired && (
              <>
                <div
                  className="w-1 sm:w-1.5 bg-white shadow-[0_0_12px_#ef4444,0_0_24px_#dc2626,0_0_40px_#b91c1c] animate-pulse transition-all pointer-events-none"
                  style={{
                    height: `${laserGeometry.beamHeight}px`,
                  }}
                />
                {/* Focal Slicing Spark on the Letter Dividing Seam */}
                <div className="w-4 h-4 rounded-full -mt-2 shrink-0 bg-white shadow-[0_0_16px_#ffffff,0_0_30px_#ef4444] scale-150 animate-ping" />
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. OVERHEAD FACTORY HOIST CRANES: PERMANENTLY ANCHORED AT CEILING RAIL    */}
      {/* Handles all matching character replacements simultaneously               */}
      {/* ========================================================================= */}
      {activeCranes.length > 0 && laserGeometry.isReady && !formedPhrase && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {activeCranes.map((crane) => {
            const cols = Math.max(1, totalCols);
            const cX = Math.round(
              laserGeometry.wordLeft + ((crane.colIdx + 0.5) / cols) * laserGeometry.wordWidth
            );
            return (
              <div
                key={crane.id}
                title={`Replace "${crane.oldChar}" with "${crane.newChar}"`}
                className={`absolute transition-all duration-500 pointer-events-none z-30 flex flex-col items-center ${
                  craneOffScreen ? '-translate-y-24' : ''
                }`}
                style={{
                  left: `${cX}px`,
                  top: '10px',
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Crane Trolley Housing on the ceiling rail */}
                <div className="w-8 h-5 rounded bg-[#1e293b] border-2 border-amber-500 flex items-center justify-center shadow-md shrink-0">
                  <div className="w-3 h-2 bg-amber-400 rounded-xs" />
                </div>
                {/* Hoist Cable lowering from ceiling down to table */}
                <div
                  className="w-1 bg-slate-400 transition-all duration-300"
                  style={{
                    height: craneLowered ? `${laserGeometry.beamHeight + 14}px` : '12px',
                  }}
                />
                {/* Catch Claw */}
                <div className="w-7 h-4 bg-amber-600 border border-amber-300 rounded-sm flex items-center justify-center shadow shrink-0">
                  {crane.carrying ? (
                    <span className="text-[10px] font-black text-amber-300 bg-slate-900 px-1 rounded border border-amber-400 shadow leading-tight select-none">
                      {crane.carrying === ' ' ? '␣' : crane.carrying}
                    </span>
                  ) : (
                    <div className="w-3 h-1 bg-amber-200 rounded-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MAIN LAB VIEWPORT STAGE & 3D COUNTER                                    */}
      {/* ========================================================================= */}
      <div className="w-full flex flex-col justify-end items-center relative pointer-events-none pb-3 sm:pb-4">
        {/* NOVA: MIDGROUND BEHIND THE COUNTER (Z-10) WITH HOVER CHAT BUBBLE (ELEVATED TO Z-50 ABOVE LASERS Z-30) */}
        <div
          onMouseEnter={() => setIsNovaHovered(true)}
          onMouseLeave={() => setIsNovaHovered(false)}
          className="relative -mb-5 sm:-mb-6 md:-mb-7 flex flex-col items-center pointer-events-auto cursor-pointer group"
        >
          {/* NOVA CHAT BUBBLE */}
          {isNovaHovered && (
            <div className="absolute bottom-[98%] left-1/2 -translate-x-1/2 z-50 pointer-events-none w-max max-w-[280px] sm:max-w-[340px] px-3.5 py-2 rounded-xl bg-[#0b1329]/95 border-2 border-cyan-400 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_15px_rgba(6,182,212,0.4)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 text-center">
              {!workspaceState.hasData && !isRunning ? (
                <p className="text-xs sm:text-sm font-display font-bold text-amber-300">
                  &quot;Attach &apos;Load Data&apos; block to load the corrupted stream!&quot;
                </p>
              ) : (
                <p className="text-xs sm:text-sm font-display font-bold text-cyan-200">
                  <span className="text-amber-300 font-black">{currentText.length} characters</span>: <span className="text-white font-display font-black bg-black/60 px-2 py-0.5 rounded border border-white/20 tracking-wider">&quot;{currentText}&quot;</span>
                </p>
              )}
              {/* Bubble Pointer Tail */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-cyan-400" />
            </div>
          )}

          <img
            src="/assets/global/npcs/Nova Idle.svg"
            alt="Nova"
            className="relative z-10 w-30 h-30 sm:w-34 sm:h-34 md:w-38 md:h-38 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)] group-hover:drop-shadow-[0_0_25px_rgba(6,182,212,0.85)] transition-all duration-300 select-none"
          />
        </div>

        {/* 3D LABORATORY TESTING COUNTER STRUCTURE */}
        <div
          className={`w-full max-w-[375px] sm:max-w-[415px] flex flex-col items-center relative z-20 pointer-events-auto transition-transform duration-300 ${
            isCounterRumbling ? 'animate-[shake_0.4s_ease-in-out]' : ''
          }`}
        >
          {/* A. WHITE/PLATINUM COUNTERTOP SLAB */}
          <div
            className="w-full rounded-t-lg px-2.5 sm:px-3 pt-2.5 pb-2 flex flex-col items-center relative z-20 shadow-[0_8px_25px_rgba(0,0,0,0.6)] border-t-2 border-x-2 border-slate-300"
            style={{
              background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 60%, #cbd5e1 100%)',
            }}
          >
            {/* Beveled Rim highlight */}
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mb-1.5 opacity-90" />

            {/* ===================================================================== */}
            {/* WORD STRIP STAGE (ROBUST, COMFORTABLE BLOCKS OR FORMED PHRASE)        */}
            {/* Near end of simulation, remaining characters form together into phrase*/}
            {/* ===================================================================== */}
            <div className="relative w-full max-w-[330px] sm:max-w-[370px] py-0.5 flex justify-center items-center">
              {formedPhrase ? (
                /* FORMED UNIFIED PHRASE BADGE: REMAINING BLOCKS FUSE INTO ONE PHRASE */
                <div
                  ref={wordStripRef}
                  className={`px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center font-mono font-black tracking-widest text-sm sm:text-base md:text-lg transition-all duration-500 relative overflow-hidden shadow-lg select-none ${
                    isMatchSuccess === true
                      ? 'bg-emerald-950/95 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_30px_#10b981]'
                      : isMatchSuccess === false
                      ? 'bg-red-950/95 border-2 border-red-500 text-red-300 shadow-[0_0_20px_#ef4444]'
                      : 'bg-gradient-to-r from-slate-900 via-[#0d1e34] to-slate-900 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_25px_rgba(56,189,248,0.5)] scale-105'
                  }`}
                >
                  {/* Energy Shimmer Sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none -translate-x-full animate-[shimmer_1.6s_infinite]" />
                  <span className="relative z-10 drop-shadow-md">
                    {formedPhrase}
                  </span>
                </div>
              ) : !splitChunks ? (
                !workspaceState.hasData && !isRunning ? (
                  <div className="flex justify-center items-center w-full py-1">
                    <div
                      ref={wordStripRef}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 border-dashed border-purple-400 bg-[#0f172a] shadow-lg select-none transition-all duration-300"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
                      <span className="font-mono font-black tracking-wider text-xs sm:text-sm text-purple-200">AWAITING DATA</span>
                      <span className="text-xs font-sans font-bold text-slate-300 hidden sm:inline">— Attach &quot;Load Data&quot;</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center w-full py-0.5 animate-in fade-in zoom-in-95 duration-300">
                    <div
                      ref={wordStripRef}
                      className={`inline-flex items-center justify-center rounded bg-[#0f172a] border border-slate-500 shadow-inner overflow-hidden relative z-10 transition-all duration-300 ${
                        isCounterRumbling ? 'animate-[shake_0.4s_ease-in-out]' : ''
                      }`}
                    >
                      {tiles.map((tile) => {
                      const isDelimArmed =
                        tile.isArmed ||
                        (!isRunning &&
                          realTimeSplitOp &&
                          (tile.char === realTimeSplitOp.delimiter ||
                            (realTimeSplitOp.delimiter.trim() !== '' &&
                              tile.char === realTimeSplitOp.delimiter.trim())));

                      // Cut-off tiles collapse smoothly to 0 width without altering surviving tile widths
                      if (tile.isCutOff) {
                        return (
                          <div
                            key={tile.id}
                            style={{ width: 0 }}
                            className="h-8.5 sm:h-9.5 md:h-10 opacity-0 overflow-hidden transition-all duration-300 pointer-events-none"
                          />
                        );
                      }

                      return (
                        <div
                          key={tile.id}
                          style={{ width: `${tileWidth}px`, fontFamily: 'var(--font-display), var(--font-sans), system-ui, sans-serif' }}
                          className={`h-8.5 sm:h-9.5 md:h-10 shrink-0 border-r border-slate-700/80 last:border-r-0 flex items-center justify-center font-display font-black text-xs sm:text-sm md:text-base select-none transition-all duration-300 relative ${
                            tile.beingCarriedUp
                              ? 'opacity-0 scale-50'
                              : tile.isCutGlowing
                              ? 'bg-red-600 text-white font-black shadow-[0_0_20px_#ef4444,inset_0_0_10px_#ffffff] border border-red-300 animate-pulse scale-95 z-20'
                              : tile.isExploding
                              ? 'bg-amber-600 text-white z-30'
                              : tile.isExploded
                              ? 'bg-black/60 border border-dashed border-cyan-500/50 text-transparent'
                              : isDelimArmed
                              ? 'bg-red-600/90 text-white font-black shadow-[0_0_20px_#ef4444,inset_0_0_10px_#ffffff] border-2 border-red-400 animate-pulse scale-95 z-20 rounded'
                              : tile.isReplaced
                              ? 'bg-[#064e3b] text-emerald-300'
                              : tile.isCorrupted
                              ? 'bg-[#1e293b] text-amber-400'
                              : 'bg-[#1e293b] text-white'
                          }`}
                        >
                          {tile.isExploding ? (
                            <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                              {/* Fiery Shockwave Ring expanding outward */}
                              <div className="absolute inset-0 m-auto w-12 h-12 rounded-full border-4 border-amber-400 bg-orange-600/50 shadow-[0_0_25px_#f97316] animate-ping z-30 pointer-events-none" />
                              {/* Central Blinding Fireball Core */}
                              <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-white shadow-[0_0_20px_#ffffff,0_0_35px_#f59e0b,0_0_50px_#ef4444] animate-pulse z-40 scale-125 pointer-events-none" />
                              {/* 8 Flying Ember Sparks */}
                              <div className="absolute -top-3 -left-3 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#f59e0b] animate-ping" />
                              <div className="absolute -top-3 -right-3 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#f59e0b] animate-ping" />
                              <div className="absolute -bottom-3 -left-3 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#f59e0b] animate-ping" />
                              <div className="absolute -bottom-3 -right-3 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#f59e0b] animate-ping" />
                              <div className="absolute -top-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-ping" />
                              <div className="absolute -bottom-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-ping" />
                              <div className="absolute -left-4 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] animate-ping" />
                              <div className="absolute -right-4 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] animate-ping" />
                            </div>
                          ) : tile.isExploded ? (
                            <div className="w-[80%] h-[75%] rounded border border-dashed border-cyan-500/40 bg-cyan-950/20 flex items-center justify-center pointer-events-none" title="Split Gap">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-pulse" />
                            </div>
                          ) : (
                            tile.char === ' ' ? '␣' : tile.char
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
              ) : (
                /* SPLIT RESULT: DELIMITER EXPLODED, LEAVING A CLEAN GAP BLOCK WHERE THE CHARACTER WAS */
                <div className="flex justify-center items-center w-full py-0.5">
                  <div
                    ref={wordStripRef}
                    className="inline-flex items-center justify-center rounded bg-[#0f172a] border border-slate-500 shadow-inner overflow-hidden relative z-10"
                  >
                    {splitChunks.map((chunk, cIdx) => (
                      <React.Fragment key={`chunk-group-${cIdx}`}>
                        {cIdx > 0 && (
                          /* The gap block where the former delimiter character was */
                          <div
                            style={{ width: `${tileWidth}px` }}
                            className="h-8.5 sm:h-9.5 md:h-10 shrink-0 border-r border-slate-700/80 bg-black/60 flex items-center justify-center relative overflow-hidden"
                            title="Split Gap (Delimiter exploded)"
                          >
                            {/* Empty gap slot with faint dotted boundary showing the block remains */}
                            <div className="w-[80%] h-[75%] rounded border border-dashed border-cyan-500/40 bg-cyan-950/20 flex items-center justify-center pointer-events-none">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/40 animate-pulse" />
                            </div>
                          </div>
                        )}
                        {chunk.split('').map((ch, chIdx) => (
                          <div
                            key={`ch-${cIdx}-${chIdx}`}
                            style={{ width: `${tileWidth}px`, fontFamily: 'var(--font-display), var(--font-sans), system-ui, sans-serif' }}
                            className="h-8.5 sm:h-9.5 md:h-10 shrink-0 border-r border-slate-700/80 last:border-r-0 bg-[#1e293b] text-amber-400 font-display font-black text-xs sm:text-sm md:text-base flex items-center justify-center"
                          >
                            {ch === ' ' ? '␣' : ch}
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* B. 3D FRONT LIP / BEVELED CHAMFER */}
          <div className="w-full h-3 sm:h-3.5 bg-gradient-to-b from-[#94a3b8] via-[#64748b] to-[#334155] border-b border-slate-600 shadow-md relative z-20" />

          {/* C. TALLER LABORATORY PEDESTAL TABLE BASE */}
          <div className="w-[82%] bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#050811] border-x-2 border-b-2 border-slate-600/90 pt-2.5 pb-4 sm:pb-5 px-3 flex flex-col items-center justify-between shadow-2xl relative z-10 min-h-[90px] sm:min-h-[110px]">
            {/* Overhang Shadow cast by wider countertop */}
            <div className="absolute top-0 inset-x-0 h-3 bg-black/60 pointer-events-none" />

            {/* THE SIGN BELOW THE COUNTER (TARGET PHRASE AND LIVE MATCH STATUS) */}
            <div
              className={`w-full max-w-[240px] sm:max-w-[275px] py-1.5 px-3 rounded flex flex-col items-center justify-center mt-1 transition-all duration-500 border-2 ${
                isMatchSuccess === true
                  ? 'bg-emerald-950/90 border-emerald-400 shadow-[0_0_25px_#10b981]'
                  : isMatchSuccess === false
                  ? 'bg-red-950/90 border-red-500 shadow-[0_0_20px_#ef4444]'
                  : 'bg-[#030712] border-emerald-400/90 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {isMatchSuccess === true && (
                  <span className="text-emerald-400 text-xs font-black animate-bounce">✓</span>
                )}
                {isMatchSuccess === false && (
                  <span className="text-red-400 text-xs font-black animate-pulse">✗</span>
                )}
                <span
                  className={`text-xs sm:text-sm md:text-base font-black tracking-widest text-center ${
                    isMatchSuccess === true
                      ? 'text-emerald-300 drop-shadow-[0_0_8px_#34d399]'
                      : isMatchSuccess === false
                      ? 'text-red-400'
                      : 'text-emerald-300'
                  }`}
                >
                  {formatOutputDisplay(spec.targetOutput)}
                </span>
              </div>
              {isMatchTesting && (
                <span
                  className={`text-[9px] font-bold tracking-wider mt-0.5 ${
                    isMatchSuccess === true
                      ? 'text-emerald-400'
                      : isMatchSuccess === false
                      ? 'text-red-400'
                      : 'text-cyan-400'
                  }`}
                >
                  {isMatchSuccess === true
                    ? 'TARGET MATCH CONFIRMED'
                    : isMatchSuccess === false
                    ? 'TARGET MISMATCH'
                    : 'VERIFYING PHRASE MATCH...'}
                </span>
              )}
            </div>

            {/* Bottom Pedestal Workstation Grill Details */}
            <div className="flex gap-2 items-center mt-2 opacity-50">
              <div className="w-7 sm:w-10 h-1 bg-slate-600 rounded-full" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <div className="w-7 sm:w-10 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
