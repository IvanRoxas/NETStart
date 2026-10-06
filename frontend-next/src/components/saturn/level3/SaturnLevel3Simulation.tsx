"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProcessingBayCanvas from './ProcessingBayCanvas';
import {
  Saturn3WorkspacePayload,
  Saturn3Scenario,
  PointerId,
  auditMemorySequence,
  Saturn3AuditResult,
} from '@/lib/saturn/saturnLevel3Definitions';
import { ShieldAlert, X, AlertTriangle, CheckCircle2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface SaturnLevel3SimulationProps {
  payload: Saturn3WorkspacePayload | null;
  isRunning: boolean;
  onRunSimulation: () => void;
  onResetSimulation: () => void;
  onSimulationComplete: () => void;
  onStopRunning?: () => void;
  onTerminalRead?: (allRead: boolean) => void;
  onExitToModules?: () => void;
}

export default function SaturnLevel3Simulation({
  payload,
  isRunning,
  onRunSimulation,
  onResetSimulation,
  onSimulationComplete,
  onStopRunning,
  onTerminalRead,
  onExitToModules,
}: SaturnLevel3SimulationProps) {
  // Main simulation state
  const [currentHeap, setCurrentHeap] = useState<number>(4);
  const [sensorAllocated, setSensorAllocated] = useState<number>(0);
  const [debrisAllocated, setDebrisAllocated] = useState<number>(0);
  const [shieldAllocated, setShieldAllocated] = useState<number>(0);
  const [activeArm, setActiveArm] = useState<PointerId | null>(null);
  const [armAction, setArmAction] = useState<'idle' | 'allocating' | 'running' | 'deallocating'>('idle');
  const [activeTask, setActiveTask] = useState<'RUN_SENSORS' | 'RUN_DEBRIS' | 'RUN_SHIELDS' | null>(null);
  const [scenario, setScenario] = useState<Saturn3Scenario>('IDLE');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time trip status for one-by-one core grabbing
  const [tripInfo, setTripInfo] = useState<{
    tripIndex: number;
    totalTrips: number;
    subStep: number;
    targetSlot: number;
  } | null>(null);

  // Terminals investigation state
  const [terminalReadStatus, setTerminalReadStatus] = useState<Record<1 | 2 | 3, boolean>>({
    1: false,
    2: false,
    3: false,
  });
  const [activeTerminalModal, setActiveTerminalModal] = useState<1 | 2 | 3 | null>(null);
  const [completedTasks, setCompletedTasks] = useState<{
    sensors: boolean;
    debris: boolean;
    shields: boolean;
  }>({
    sensors: false,
    debris: false,
    shields: false,
  });

  // Real-time threshold state synced from payload and Blockly dropdown events
  const [liveThreshold, setLiveThreshold] = useState<number>(payload?.threshold || 75);
  const liveThresholdRef = useRef<number>(payload?.threshold || 75);

  useEffect(() => {
    if (payload?.threshold) {
      setLiveThreshold(payload.threshold);
      liveThresholdRef.current = payload.threshold;
    }
  }, [payload?.threshold]);

  useEffect(() => {
    const handleThresholdChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ threshold: number }>;
      if (typeof customEvent.detail?.threshold === 'number') {
        setLiveThreshold(customEvent.detail.threshold);
        liveThresholdRef.current = customEvent.detail.threshold;
      }
    };
    window.addEventListener('saturn3-threshold-changed', handleThresholdChange);
    return () => {
      window.removeEventListener('saturn3-threshold-changed', handleThresholdChange);
    };
  }, []);

  // Instructions dropdown state
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const instructionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (instructionsRef.current && !instructionsRef.current.contains(e.target as Node)) {
        setShowInstructions(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowInstructions(false);
      }
    };
    if (showInstructions) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showInstructions]);

  // Refs for animation timers and audio context
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isExecutingRef = useRef<boolean>(false);
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  // Safe Web Audio API synthesizer
  const getAudioContext = useCallback(() => {
    try {
      if (!audioCtxRef.current && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const playHydraulicClackSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Hydraulic sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.18);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);

      // Magnetic clack
      const clack = ctx.createOscillator();
      const clackGain = ctx.createGain();
      clack.type = 'square';
      clack.frequency.setValueAtTime(800, now + 0.18);
      clack.frequency.exponentialRampToValueAtTime(200, now + 0.24);
      clackGain.gain.setValueAtTime(0.08, now + 0.18);
      clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      clack.connect(clackGain);
      clackGain.connect(ctx.destination);
      clack.start(now + 0.18);
      clack.stop(now + 0.24);
    } catch {}
  }, [getAudioContext]);

  const playEngineRevSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.linearRampToValueAtTime(240, now + 0.35);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }, [getAudioContext]);

  const playPneumaticDepositSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Pneumatic hiss
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);

      // Clean chime
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(880, now + 0.15);
      chimeGain.gain.setValueAtTime(0.07, now + 0.15);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chime.start(now + 0.15);
      chime.stop(now + 0.35);
    } catch {}
  }, [getAudioContext]);

  const playShortCircuitSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Harsh buzzer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.setValueAtTime(95, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }, [getAudioContext]);

  const playExplosionSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Heavy low frequency boom
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.8);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);

      // Noise explosion burst
      const bufferSize = Math.floor(ctx.sampleRate * 0.7);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.7);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.7);
    } catch {}
  }, [getAudioContext]);

  const playBreakerTripSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Heavy mechanical relay switch snap (square wave pitch drop)
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'square';
      snapOsc.frequency.setValueAtTime(1400, now);
      snapOsc.frequency.exponentialRampToValueAtTime(75, now + 0.08);
      snapGain.gain.setValueAtTime(0.25, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.09);

      // Low metallic breaker thud
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(160, now + 0.02);
      thudOsc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
      thudGain.gain.setValueAtTime(0.3, now + 0.02);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);
      thudOsc.start(now + 0.02);
      thudOsc.stop(now + 0.25);

      // Power down capacitor drain whine
      const whineOsc = ctx.createOscillator();
      const whineGain = ctx.createGain();
      whineOsc.type = 'sawtooth';
      whineOsc.frequency.setValueAtTime(700, now + 0.05);
      whineOsc.frequency.exponentialRampToValueAtTime(35, now + 0.7);
      whineGain.gain.setValueAtTime(0.08, now + 0.05);
      whineGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      whineOsc.connect(whineGain);
      whineGain.connect(ctx.destination);
      whineOsc.start(now + 0.05);
      whineOsc.stop(now + 0.7);
    } catch {}
  }, [getAudioContext]);

  const playSuccessChime = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.08, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.5);
      });
    } catch {}
  }, [getAudioContext]);

  const playShieldHumSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(640, now + 0.6);
      osc2.frequency.setValueAtTime(480, now);
      osc2.frequency.exponentialRampToValueAtTime(960, now + 0.6);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.7);
      osc2.stop(now + 0.7);
    } catch {}
  }, [getAudioContext]);

  // Clean up timers & AudioContext on unmount
  useEffect(() => {
    return () => {
      activeTimersRef.current.forEach(t => clearTimeout(t));
      activeTimersRef.current = [];
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Diagnostic terminal clicks
  const handleOpenTerminal = (id: 1 | 2 | 3) => {
    playPneumaticDepositSound();
    setTerminalReadStatus(prev => {
      if (prev[id]) return prev;
      return { ...prev, [id]: true };
    });
    setActiveTerminalModal(id);
  };

  const handleCloseTerminal = () => {
    setActiveTerminalModal(null);
  };

  // Notify parent when all 3 terminals are investigated
  useEffect(() => {
    if (onTerminalRead && Object.values(terminalReadStatus).every(Boolean)) {
      onTerminalRead(true);
    }
  }, [terminalReadStatus, onTerminalRead]);

  // Sequential Step-by-Step Simulation Execution (One-By-One Core Trips)
  const executeSimulation = useCallback(() => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    // Reset visual state for new run
    setActiveTerminalModal(null);
    setToastMessage(null);
    setScenario('IDLE');
    // Preserve completed tasks so terminals stay green as user progresses through tasks
    setCurrentHeap(4);
    setSensorAllocated(0);
    setDebrisAllocated(0);
    setShieldAllocated(0);
    setActiveArm(null);
    setArmAction('idle');
    setActiveTask(null);
    setTripInfo(null);

    const currentPayload = payloadRef.current || { steps: [], rawCppCode: '', declaredPointers: new Set(), hasStart: false, hasEnd: false, threshold: 75 };
    const effectivePayload: Saturn3WorkspacePayload = {
      ...currentPayload,
      threshold: liveThresholdRef.current ?? currentPayload.threshold ?? 75,
    };
    const audit: Saturn3AuditResult = auditMemorySequence(effectivePayload);
    const steps = audit.steps;

    if (audit.scenario === 'MISSING_START' || steps.length === 0) {
      setScenario(audit.scenario);
      setToastMessage(audit.message);
      playShortCircuitSound();
      onStopRunning?.();
      isExecutingRef.current = false;
      return;
    }

    // Set live threshold to the first task's threshold so the gauges align immediately
    const firstAlloc = steps.find(s => s.type === 'ALLOCATE');
    const firstGuard = currentPayload.steps?.find(s => s.type === 'IF_GUARD_START');
    const initialThreshold = firstGuard?.threshold ?? firstAlloc?.threshold ?? (
      firstAlloc?.pointer === 'shieldPtr' ? 50 : firstAlloc?.pointer === 'debrisPtr' ? 75 : 50
    );
    setLiveThreshold(initialThreshold);
    liveThresholdRef.current = initialThreshold;

    let delayAccumulator = 300;
    let simHeap = 4;
    let simSensor = 0;
    let simDebris = 0;
    let simShield = 0;
    const plannedAllocations: Record<string, number> = {
      sensorPtr: 0,
      debrisPtr: 0,
      shieldPtr: 0,
    };

    // Timing constants for crisp, natural robotic crane mechanics (1.0s per core trip)
    const TRIP_DURATION = 1000;
    const SUBSTEP_1_OFFSET = 0;
    const SUBSTEP_2_OFFSET = 300;
    const SUBSTEP_3_OFFSET = 600;
    const SUBSTEP_4_OFFSET = 880;

    steps.forEach((step, idx) => {
      const isFailedStep = audit.failedStepIndex === idx;

      // 1. ALLOCATE: Grab batteries ONE BY ONE
      if (step.type === 'ALLOCATE') {
        const ptr = step.pointer;
        const amount = step.cores || 1;
        if (ptr) {
          plannedAllocations[ptr] = (plannedAllocations[ptr] || 0) + amount;
        }

        // Dynamically transition threshold needle and indicator to this subsystem's threshold
        const targetSubsystemThreshold = step.threshold ?? (
          ptr === 'shieldPtr' ? 50 : ptr === 'debrisPtr' ? 75 : 50
        );
        const tThreshAlloc = setTimeout(() => {
          setLiveThreshold(targetSubsystemThreshold);
          liveThresholdRef.current = targetSubsystemThreshold;
        }, delayAccumulator);
        activeTimersRef.current.push(tThreshAlloc);

        if (isFailedStep && audit.scenario === 'BREAKER_TRIP') {
          // Transfer cores to the mainframe
          for (let c = 0; c < amount; c++) {
            const tripStart = delayAccumulator + c * TRIP_DURATION;
            const slotIdx = c;

            // Sub-step 1: Plunge to Heap socket to grab core
            const t1 = setTimeout(() => {
              setActiveArm(ptr || null);
              setArmAction('allocating');
              setTripInfo({
                tripIndex: c,
                totalTrips: amount,
                subStep: 1,
                targetSlot: slotIdx,
              });
              playHydraulicClackSound();
            }, tripStart + SUBSTEP_1_OFFSET);
            activeTimersRef.current.push(t1);

            // Sub-step 2: Clamp battery & hoist up (Heap decrements by 1)
            const t2 = setTimeout(() => {
              simHeap = Math.max(0, simHeap - 1);
              setCurrentHeap(simHeap);
              setTripInfo({
                tripIndex: c,
                totalTrips: amount,
                subStep: 2,
                targetSlot: slotIdx,
              });
            }, tripStart + SUBSTEP_2_OFFSET);
            activeTimersRef.current.push(t2);

            // Sub-step 3: Move across to Mainframe slot & plunge down
            const t3 = setTimeout(() => {
              setTripInfo({
                tripIndex: c,
                totalTrips: amount,
                subStep: 3,
                targetSlot: slotIdx,
              });
            }, tripStart + SUBSTEP_3_OFFSET);
            activeTimersRef.current.push(t3);

            // Sub-step 4: Deposit core into slot
            const t4 = setTimeout(() => {
              if (ptr === 'sensorPtr') {
                simSensor += 1;
                setSensorAllocated(simSensor);
              } else if (ptr === 'debrisPtr') {
                simDebris += 1;
                setDebrisAllocated(simDebris);
              } else if (ptr === 'shieldPtr') {
                simShield += 1;
                setShieldAllocated(simShield);
              }
              playPneumaticDepositSound();
              setTripInfo({
                tripIndex: c,
                totalTrips: amount,
                subStep: 4,
                targetSlot: slotIdx,
              });
            }, tripStart + SUBSTEP_4_OFFSET);
            activeTimersRef.current.push(t4);
          }

          const insertionDone = delayAccumulator + amount * TRIP_DURATION;
          // Retract crane and let machine start running
          const tRetract = setTimeout(() => {
            setTripInfo(null);
            setActiveArm(null);
            setArmAction('running');
            playEngineRevSound();
          }, insertionDone);
          activeTimersRef.current.push(tRetract);

          // As pressure climbs gradually, once it reaches threshold, trip the breaker!
          const breakerDelay = Math.max(1200, Math.round((audit.threshold / 100) * 8500));
          const tripEnd = insertionDone + breakerDelay;

          const tTrip = setTimeout(() => {
            setArmAction('idle');
            setScenario('BREAKER_TRIP');
            setToastMessage(audit.message);
            playBreakerTripSound();
            onStopRunning?.();
            isExecutingRef.current = false;
          }, tripEnd);
          activeTimersRef.current.push(tTrip);
          delayAccumulator = tripEnd;
          return;
        }

        if (isFailedStep && audit.scenario === 'OUT_OF_MEMORY') {
          const isOverheat =
            audit.message.includes('overheated') ||
            audit.threshold >= 100 ||
            audit.threshold > (amount * 25);

          if (isOverheat) {
            // Threshold set too high: Cores are loaded and machine runs until it overheats and explodes before reaching threshold!
            for (let c = 0; c < amount; c++) {
              const tripStart = delayAccumulator + c * TRIP_DURATION;
              const slotIdx = c;

              // Sub-step 1: Plunge to Heap socket to grab core
              const t1 = setTimeout(() => {
                setActiveArm(ptr || null);
                setArmAction('allocating');
                setTripInfo({
                  tripIndex: c,
                  totalTrips: amount,
                  subStep: 1,
                  targetSlot: slotIdx,
                });
                playHydraulicClackSound();
              }, tripStart + SUBSTEP_1_OFFSET);
              activeTimersRef.current.push(t1);

              // Sub-step 2: Clamp battery & hoist up (Heap decrements by 1)
              const t2 = setTimeout(() => {
                simHeap = Math.max(0, simHeap - 1);
                setCurrentHeap(simHeap);
                setTripInfo({
                  tripIndex: c,
                  totalTrips: amount,
                  subStep: 2,
                  targetSlot: slotIdx,
                });
              }, tripStart + SUBSTEP_2_OFFSET);
              activeTimersRef.current.push(t2);

              // Sub-step 3: Move across to Mainframe slot & plunge down
              const t3 = setTimeout(() => {
                setTripInfo({
                  tripIndex: c,
                  totalTrips: amount,
                  subStep: 3,
                  targetSlot: slotIdx,
                });
              }, tripStart + SUBSTEP_3_OFFSET);
              activeTimersRef.current.push(t3);

              // Sub-step 4: Deposit core into slot (Slot illuminates & pressure starts building)
              const t4 = setTimeout(() => {
                if (ptr === 'sensorPtr') {
                  simSensor += 1;
                  setSensorAllocated(simSensor);
                } else if (ptr === 'debrisPtr') {
                  simDebris += 1;
                  setDebrisAllocated(simDebris);
                } else if (ptr === 'shieldPtr') {
                  simShield += 1;
                  setShieldAllocated(simShield);
                }
                playPneumaticDepositSound();
                setTripInfo({
                  tripIndex: c,
                  totalTrips: amount,
                  subStep: 4,
                  targetSlot: slotIdx,
                });
              }, tripStart + SUBSTEP_4_OFFSET);
              activeTimersRef.current.push(t4);
            }

            const insertionDone = delayAccumulator + amount * TRIP_DURATION;
            // Retract crane and let machine run under heavy load
            const tRetract = setTimeout(() => {
              setTripInfo(null);
              setActiveArm(null);
              setArmAction('running');
              playEngineRevSound();
            }, insertionDone);
            activeTimersRef.current.push(tRetract);

            // Machine runs as RAM pressure climbs gradually, then overheats and explodes before reaching threshold!
            const requiredPressure = amount === 2 ? 50 : amount === 3 ? 75 : 100;
            const explodeThreshold = Math.min(95, requiredPressure + 12);
            const overheatDuration = Math.round((explodeThreshold / 100) * 8500);

            const tOverheatBoom = setTimeout(() => {
              setArmAction('idle');
              setScenario('OUT_OF_MEMORY');
              setToastMessage(audit.message);
              playExplosionSound();
              onStopRunning?.();
              isExecutingRef.current = false;
            }, insertionDone + overheatDuration);
            activeTimersRef.current.push(tOverheatBoom);
            delayAccumulator = insertionDone + overheatDuration;
            return;
          } else {
            // Over-allocation when Heap rack has insufficient cores
            const tArm = setTimeout(() => {
              setActiveArm(ptr || null);
              setArmAction('allocating');
              playHydraulicClackSound();
            }, delayAccumulator);
            activeTimersRef.current.push(tArm);

            const tBoom = setTimeout(() => {
              setScenario('OUT_OF_MEMORY');
              setToastMessage(audit.message);
              playShortCircuitSound();
              onStopRunning?.();
              isExecutingRef.current = false;
            }, delayAccumulator + 400);
            activeTimersRef.current.push(tBoom);
            delayAccumulator += 450;
            return;
          }
        }

        if (isFailedStep) {
          const tFail = setTimeout(() => {
            setActiveArm(ptr || null);
            setScenario(audit.scenario);
            setToastMessage(audit.message);
            setArmAction('idle');
            playShortCircuitSound();
            onStopRunning?.();
            isExecutingRef.current = false;
          }, delayAccumulator);
          activeTimersRef.current.push(tFail);
          return;
        }

        // Sequential one-by-one core grabbing trips
        for (let c = 0; c < amount; c++) {
          const tripStart = delayAccumulator + c * TRIP_DURATION;
          const slotIdx = c;

          // Sub-step 1: Plunge to Heap socket to grab core
          const t1 = setTimeout(() => {
            setActiveArm(ptr || null);
            setArmAction('allocating');
            setTripInfo({
              tripIndex: c,
              totalTrips: amount,
              subStep: 1,
              targetSlot: slotIdx,
            });
            playHydraulicClackSound();
          }, tripStart + SUBSTEP_1_OFFSET);
          activeTimersRef.current.push(t1);

          // Sub-step 2: Clamp battery & hoist up (Heap decrements by 1)
          const t2 = setTimeout(() => {
            simHeap = Math.max(0, simHeap - 1);
            setCurrentHeap(simHeap);
            setTripInfo({
              tripIndex: c,
              totalTrips: amount,
              subStep: 2,
              targetSlot: slotIdx,
            });
          }, tripStart + SUBSTEP_2_OFFSET);
          activeTimersRef.current.push(t2);

          // Sub-step 3: Move across to Mainframe slot & plunge down
          const t3 = setTimeout(() => {
            setTripInfo({
              tripIndex: c,
              totalTrips: amount,
              subStep: 3,
              targetSlot: slotIdx,
            });
          }, tripStart + SUBSTEP_3_OFFSET);
          activeTimersRef.current.push(t3);

          // Sub-step 4: Deposit core into slot (Slot illuminates)
          const t4 = setTimeout(() => {
            if (ptr === 'sensorPtr') {
              simSensor += 1;
              setSensorAllocated(simSensor);
            } else if (ptr === 'debrisPtr') {
              simDebris += 1;
              setDebrisAllocated(simDebris);
            } else if (ptr === 'shieldPtr') {
              simShield += 1;
              setShieldAllocated(simShield);
            }
            playPneumaticDepositSound();
            setTripInfo({
              tripIndex: c,
              totalTrips: amount,
              subStep: 4,
              targetSlot: slotIdx,
            });
          }, tripStart + SUBSTEP_4_OFFSET);
          activeTimersRef.current.push(t4);
        }

        // Reset tripInfo when all trips complete
        const tDone = setTimeout(() => {
          setTripInfo(null);
          setArmAction('running');
        }, delayAccumulator + amount * TRIP_DURATION);
        activeTimersRef.current.push(tDone);

        // If the very next step is deallocation (e.g. no RUN_TASK between them), allow the pressure to climb
        // to the core's level and let the machine run stably before extraction begins.
        const nextStep = steps[idx + 1];
        const nextIsDeallocate = nextStep && nextStep.type === 'DEALLOCATE';
        const dwellTime = nextIsDeallocate
          ? Math.round(((amount * 25) / 100) * 8500) + 500
          : 150;

        delayAccumulator += amount * TRIP_DURATION + dwellTime;
      }

      // 2. RUN TASK (runSensors / runDebris / runShields)
      else if (step.type === 'RUN_TASK') {
        const task = step.task;
        const targetPressure = task === 'RUN_SHIELDS' ? 50 : task === 'RUN_DEBRIS' ? 75 : 50;
        const taskThreshold = step.threshold ?? targetPressure;
        // RAM pressure climbs at (dt / 8500) * 100
        const climbTime = Math.round((targetPressure / 100) * 8500);
        // Prompt transition: once target threshold is reached, brief 500ms confirmation before deallocating
        const taskDuration = climbTime + 500;

        const tRun = setTimeout(() => {
          setActiveTask(task || null);
          setArmAction('running');
          setLiveThreshold(taskThreshold);
          liveThresholdRef.current = taskThreshold;
          if (task === 'RUN_SHIELDS') {
            playShieldHumSound();
          } else {
            playEngineRevSound();
          }

          if (isFailedStep) {
            setScenario(audit.scenario);
            setToastMessage(audit.message);
            playShortCircuitSound();
            onStopRunning?.();
            isExecutingRef.current = false;
            return;
          }
        }, delayAccumulator);
        activeTimersRef.current.push(tRun);
        delayAccumulator += taskDuration;
      }

      // 3. DEALLOCATE: Return batteries ONE BY ONE
      else if (step.type === 'DEALLOCATE') {
        const ptr = step.pointer;
        const count = step.cores || (ptr && plannedAllocations[ptr]) || (ptr === 'sensorPtr' ? 2 : ptr === 'debrisPtr' ? 3 : 2);
        if (ptr) {
          plannedAllocations[ptr] = 0;
        }

        if (isFailedStep) {
          const tFail = setTimeout(() => {
            setActiveArm(ptr || null);
            setArmAction('idle');
            setScenario(audit.scenario);
            setToastMessage(audit.message);
            playShortCircuitSound();
            onStopRunning?.();
            isExecutingRef.current = false;
          }, delayAccumulator);
          activeTimersRef.current.push(tFail);
          return;
        }

        // Sequential one-by-one core return trips
        for (let c = count - 1; c >= 0; c--) {
          const tripOffset = count - 1 - c;
          const tripStart = delayAccumulator + tripOffset * TRIP_DURATION;
          const slotIdx = c;

          // Sub-step 3: Plunge into Mainframe slot
          const t1 = setTimeout(() => {
            setActiveTask(null);
            setActiveArm(ptr || null);
            setArmAction('deallocating');
            setTripInfo({
              tripIndex: tripOffset,
              totalTrips: count,
              subStep: 3,
              targetSlot: slotIdx,
            });
            playPneumaticDepositSound();
          }, tripStart + SUBSTEP_1_OFFSET);
          activeTimersRef.current.push(t1);

          // Sub-step 2: Clamp & extract core from Mainframe slot
          const t2 = setTimeout(() => {
            if (ptr === 'sensorPtr') {
              simSensor = Math.max(0, simSensor - 1);
              setSensorAllocated(simSensor);
            } else if (ptr === 'debrisPtr') {
              simDebris = Math.max(0, simDebris - 1);
              setDebrisAllocated(simDebris);
            } else if (ptr === 'shieldPtr') {
              simShield = Math.max(0, simShield - 1);
              setShieldAllocated(simShield);
            }
            setTripInfo({
              tripIndex: tripOffset,
              totalTrips: count,
              subStep: 2,
              targetSlot: slotIdx,
            });
          }, tripStart + SUBSTEP_2_OFFSET);
          activeTimersRef.current.push(t2);

          // Sub-step 1: Move back across to Heap socket & plunge down
          const t3 = setTimeout(() => {
            setTripInfo({
              tripIndex: tripOffset,
              totalTrips: count,
              subStep: 1,
              targetSlot: slotIdx,
            });
          }, tripStart + SUBSTEP_3_OFFSET);
          activeTimersRef.current.push(t3);

          // Sub-step 0: Deposit core into Heap socket (Heap increments by 1)
          const t4 = setTimeout(() => {
            simHeap = Math.min(4, simHeap + 1);
            setCurrentHeap(simHeap);
            playHydraulicClackSound();
            setTripInfo({
              tripIndex: tripOffset,
              totalTrips: count,
              subStep: 0,
              targetSlot: slotIdx,
            });
          }, tripStart + SUBSTEP_4_OFFSET);
          activeTimersRef.current.push(t4);
        }

        // When all cores returned, mark that terminal as successfully completed (turns emerald green!)
        const deallocEndTime = delayAccumulator + count * TRIP_DURATION;
        const tDeallocDone = setTimeout(() => {
          if (ptr === 'sensorPtr') {
            setCompletedTasks(prev => ({ ...prev, sensors: true }));
          } else if (ptr === 'debrisPtr') {
            setCompletedTasks(prev => ({ ...prev, debris: true }));
          } else if (ptr === 'shieldPtr') {
            setCompletedTasks(prev => ({ ...prev, shields: true }));
          }
        }, deallocEndTime);
        activeTimersRef.current.push(tDeallocDone);

        const tDone = setTimeout(() => {
          setTripInfo(null);
          setActiveArm(null);
          setArmAction('idle');
        }, deallocEndTime);
        activeTimersRef.current.push(tDone);

        delayAccumulator += count * TRIP_DURATION + 100;
      }

      // 4. DECLARE
      else if (step.type === 'DECLARE') {
        const ptr = step.pointer;
        const targetThreshold = step.threshold ?? (
          ptr === 'shieldPtr' ? 50 : ptr === 'debrisPtr' ? 75 : 50
        );
        const tDec = setTimeout(() => {
          setActiveArm(ptr || null);
          setArmAction('idle');
          setLiveThreshold(targetThreshold);
          liveThresholdRef.current = targetThreshold;
        }, delayAccumulator);
        activeTimersRef.current.push(tDec);
        delayAccumulator += 300;
      }
    });

    // Final Audit Outcome
    const tEnd = setTimeout(() => {
      setActiveArm(null);
      setArmAction('idle');
      setActiveTask(null);
      setTripInfo(null);
      setScenario(audit.scenario);
      setCompletedTasks(prev => ({
        sensors: prev.sensors || audit.sensorsExecuted,
        debris: prev.debris || audit.debrisExecuted,
        shields: prev.shields || audit.shieldsExecuted,
      }));

      if (audit.success) {
        setScenario('SUCCESS');
        playSuccessChime();
        onStopRunning?.();
        const winTimer = setTimeout(() => {
          onSimulationComplete();
        }, 1100);
        activeTimersRef.current.push(winTimer);
      } else {
        setToastMessage(audit.message);
        if (audit.scenario === 'BREAKER_TRIP') {
          playBreakerTripSound();
        } else {
          playShortCircuitSound();
        }
        onStopRunning?.();
      }
      isExecutingRef.current = false;
    }, delayAccumulator + 300);

    activeTimersRef.current.push(tEnd);
  }, [
    playHydraulicClackSound,
    playEngineRevSound,
    playPneumaticDepositSound,
    playShortCircuitSound,
    playExplosionSound,
    playBreakerTripSound,
    playShieldHumSound,
    playSuccessChime,
    onSimulationComplete,
    onStopRunning,
  ]);

  // Synchronize when external Blockly bottom bar triggers isRunning
  useEffect(() => {
    if (isRunning) {
      executeSimulation();
    } else if (isExecutingRef.current) {
      activeTimersRef.current.forEach(t => clearTimeout(t));
      activeTimersRef.current = [];
      isExecutingRef.current = false;
      setActiveArm(null);
      setArmAction('idle');
      setActiveTask(null);
      setTripInfo(null);
      setScenario('IDLE');
    }
  }, [isRunning, executeSimulation]);

  // Reset Level
  const handleReset = () => {
    activeTimersRef.current.forEach(t => clearTimeout(t));
    activeTimersRef.current = [];
    isExecutingRef.current = false;
    setCurrentHeap(4);
    setSensorAllocated(0);
    setDebrisAllocated(0);
    setShieldAllocated(0);
    setActiveArm(null);
    setArmAction('idle');
    setActiveTask(null);
    setTripInfo(null);
    setScenario('IDLE');
    setToastMessage(null);
    setCompletedTasks({ sensors: false, debris: false, shields: false });
    setTerminalReadStatus({ 1: false, 2: false, 3: false });
    setActiveTerminalModal(null);
    const firstAlloc = (payload?.steps || []).find(s => s.type === 'ALLOCATE');
    const firstGuard = (payload?.steps || []).find(s => s.type === 'IF_GUARD_START');
    const initialThreshold = firstGuard?.threshold ?? (firstAlloc?.pointer === 'shieldPtr' ? 50 : firstAlloc?.pointer === 'debrisPtr' ? 75 : 50);
    setLiveThreshold(initialThreshold);
    liveThresholdRef.current = initialThreshold;
    onStopRunning?.();
    onResetSimulation();
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#070b14] text-white relative overflow-hidden select-none">
      {/* Top Telemetry / Instructions Tab Bar Above Simulation */}
      <div className="w-full h-11 px-3 sm:px-4 border-b border-white/10 bg-[#090d1f]/90 flex items-center justify-between z-30 shrink-0 relative">
        {/* Left: Instructions Dropdown */}
        <div ref={instructionsRef} className="relative">
          <button
            type="button"
            onClick={() => setShowInstructions((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-400/50 hover:border-cyan-300 text-cyan-200 hover:text-white font-mono text-xs sm:text-sm font-bold transition-all shadow-[0_0_14px_rgba(6,182,212,0.35)] active:scale-95 cursor-pointer backdrop-blur-md"
            title="View Mission Instructions"
          >
            <HelpCircle size={15} className="text-cyan-300" />
            <span>Instructions</span>
            {showInstructions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showInstructions && (
            <div className="absolute top-12 left-0 z-50 w-[340px] sm:w-[400px] max-w-[calc(100vw-2.5rem)] bg-[#0c1222]/98 border border-cyan-500/50 rounded-xl p-3 sm:p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 text-left normal-case">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2.5">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                  How to Play
                </span>
                <button
                  type="button"
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-2 text-xs text-gray-200 font-sans">
                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold text-[10px] font-mono border border-red-500/40 shrink-0 mt-0.5">
                    STEP 1
                  </span>
                  <span className="leading-snug">
                    Start with <strong className="text-red-400 font-bold">Start</strong> at the top, and conclude with <strong className="text-red-400 font-bold">End</strong> at the bottom.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] font-mono border border-amber-500/40 shrink-0 mt-0.5">
                    STEP 2
                  </span>
                  <span className="leading-snug">
                    Click the <strong className="text-amber-300 font-bold">3 Terminals</strong> around the room to discover each subsystem's core requirements.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] font-mono border border-purple-500/40 shrink-0 mt-0.5">
                    STEP 3
                  </span>
                  <span className="leading-snug">
                    For each task: <strong className="text-indigo-300 font-bold">Ready Arm</strong>, <strong className="text-emerald-300 font-bold">Grab Cores</strong>, <strong className="text-purple-300 font-bold">Run Subsystem</strong>, then <strong className="text-amber-300 font-bold">Return Cores</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px] font-mono border border-cyan-500/40 shrink-0 mt-0.5">
                    STEP 4
                  </span>
                  <span className="leading-snug">
                    Watch the <strong className="text-cyan-300 font-bold">RAM Pressure bar</strong> (0%-100%). Return cores before starting the next task so pressure stays under the <strong className="text-amber-300 font-bold">75% Leak Threshold</strong>!
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulation Viewport Canvas */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        <ProcessingBayCanvas
          currentHeap={currentHeap}
          sensorAllocated={sensorAllocated}
          debrisAllocated={debrisAllocated}
          shieldAllocated={shieldAllocated}
          activeArm={activeArm}
          armAction={armAction}
          activeTask={activeTask}
          tripInfo={tripInfo}
          scenario={scenario}
          terminalReadStatus={terminalReadStatus}
          activeTerminalModal={activeTerminalModal}
          onOpenTerminal={handleOpenTerminal}
          onCloseTerminal={handleCloseTerminal}
          isSimulating={isRunning}
          threshold={liveThreshold}
          completedTasks={completedTasks}
        />

        {/* Custom UI Error / Crash Toast Notification */}
        {toastMessage && (
          <div className="absolute top-3 right-3 z-50 max-w-sm w-auto animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-[#18090d]/95 border-2 border-rose-500 rounded-2xl px-3.5 py-2.5 shadow-[0_0_25px_rgba(244,63,94,0.4)] flex items-start gap-2.5 backdrop-blur-md">
              <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                <ShieldAlert size={16} />
              </div>
              <div className="flex-1 text-xs">
                <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-rose-400">
                  {scenario === 'BREAKER_TRIP'
                    ? 'Breaker Tripped'
                    : scenario === 'OUT_OF_MEMORY'
                    ? 'Out of Memory'
                    : scenario === 'NULL_POINTER_DEREFERENCE'
                    ? 'Missing Cores'
                    : scenario === 'MEMORY_LEAK'
                    ? 'Memory Leak'
                    : scenario === 'UNDECLARED_POINTER'
                    ? 'Ready Arm Required'
                    : scenario === 'INCOMPLETE_TASKS'
                    ? 'Tasks Incomplete'
                    : 'Code Review'}
                </div>
                <p className="text-rose-100 font-sans text-xs font-medium leading-snug mt-0.5">
                  {toastMessage}
                </p>
              </div>
              <button
                id="saturn3_toast_dismiss_btn"
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-gray-400 hover:text-white p-1 cursor-pointer shrink-0"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
