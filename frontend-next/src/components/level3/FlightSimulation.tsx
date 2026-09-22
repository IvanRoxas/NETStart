"use client";

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import {
  Flame,
  Wind,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  Radio,
  MessageSquare,
  Play
} from 'lucide-react';

export type FlightEvent = 'NONE' | 'FUEL_LOW' | 'SMALL_ASTEROID' | 'OXYGEN_LOW' | 'BIG_ASTEROID' | 'FRIENDLY_UFO' | 'SUPPLY_POD';
export type FlightAction =
  | 'NONE'
  | 'REFILL_FUEL'
  | 'FIRE_LASERS'
  | 'PUMP_OXYGEN'
  | 'ACTIVATE_SHIELD'
  | 'GREET_UFO'
  | 'GREET_UFO_FULL_PROTOCOL'
  | 'GREET_UFO_NO_STOP'
  | 'GREET_UFO_NO_LAUNCH'
  | 'STOP'
  | 'LAUNCH'
  | 'FIRE_TRACTOR_BEAM';

export interface FlightSimulationRef {
  startSimulation: (evaluatorFn: (state: FlightSimulationState) => Promise<FlightAction>) => void;
  triggerLaunchFailure: (reason: string) => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
}

export interface FlightSimulationState {
  fuel: number;
  oxygen: number;
  currentLane: number;
  activeEvent: FlightEvent;
  eventLane: number | null;
  timeRemaining: number;
  isSmallAsteroid: boolean;
  isBigAsteroid: boolean;
  isFuelLow: boolean;
  isOxygenLow: boolean;
  isFriendlyUFO: boolean;
  isSupplyPod: boolean;
}

interface FlightSimulationProps {
  destinationPlanet?: string;
  onComplete?: (success: boolean, stats: { survivedTime: number; fuelRefills: number; oxygenPumps: number; lasersFired: number; shieldsActivated: number; suppliesRetrieved?: number; errorReason?: string }) => void;
  onEventTrigger?: (event: FlightEvent, state: FlightSimulationState) => void;
  isExternalRunning?: boolean;
}

const TOTAL_LANES = 5;
const SIMULATION_DURATION = 90; // 90 seconds total (1 min 30s)

// Web Audio API Sound Effects for Lasers & Explosions
const playLaserSound = () => {
  if (typeof window === 'undefined' || localStorage.getItem('setting_sounds') === 'false') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) { }
};

const playExplosionSound = () => {
  if (typeof window === 'undefined' || localStorage.getItem('setting_sounds') === 'false') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const bufferSize = Math.floor(ctx.sampleRate * 0.45);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.42);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (e) { }
};

export const FlightSimulation = forwardRef<FlightSimulationRef, FlightSimulationProps>(({
  destinationPlanet = "/assets/planets/celestial/Mars.svg",
  onComplete,
  onEventTrigger,
  isExternalRunning = false
}, ref) => {
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SIMULATION_DURATION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [failReason, setFailReason] = useState<string>('');
  const [failCategory, setFailCategory] = useState<string>('');
  const [showFailModal, setShowFailModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Ship position (Lane index 0 to 4)
  const [shipLane, setShipLane] = useState(2); // Starts in center lane

  // Gauges
  const [fuel, setFuel] = useState(100);
  const [oxygen, setOxygen] = useState(100);

  // Active Emergency / Hazard / Event
  const [activeEvent, setActiveEvent] = useState<FlightEvent>('NONE');
  const [eventLane, setEventLane] = useState<number | null>(null);
  const [warningActive, setWarningActive] = useState(false);
  const [isAsteroidActive, setIsAsteroidActive] = useState(false);
  const [isUfoActive, setIsUfoActive] = useState(false);
  const [smallAsteroids, setSmallAsteroids] = useState<{ id: number; dx: number; dy: number; scale: number; rot: number }[]>([
    { id: 0, dx: 0, dy: -10, scale: 1.0, rot: 15 },
    { id: 1, dx: -90, dy: 10, scale: 1.0, rot: 45 },
    { id: 2, dx: -180, dy: -8, scale: 1.0, rot: 120 }
  ]);

  // Visual FX States
  const [isFiringLasers, setIsFiringLasers] = useState(false);
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [isGreetingActive, setIsGreetingActive] = useState(false);
  const [isUfoGreetingBack, setIsUfoGreetingBack] = useState(false);
  const [ufoDeparting, setUfoDeparting] = useState(false);
  const [ufoDeflected, setUfoDeflected] = useState(false);
  const [isShipStopped, setIsShipStopped] = useState(false);
  const [shipSpeechText, setShipSpeechText] = useState<string | null>(null);
  const [ufoSpeechText, setUfoSpeechText] = useState<string | null>(null);
  const [isRefueling, setIsRefueling] = useState(false);
  const [isOxygenPumping, setIsOxygenPumping] = useState(false);
  const [asteroidDestroyed, setAsteroidDestroyed] = useState(false);
  const [destroyedAsteroidIds, setDestroyedAsteroidIds] = useState<number[]>([]);
  const [explosionRight, setExplosionRight] = useState('42%');
  const [isShipHit, setIsShipHit] = useState(false);

  // Background Parallax RAF controller
  const bgOffsetRef = useRef(0);
  const bgElementRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Destination Planet Arrival State (Occurs near t <= 6.5s)
  const [isApproachingPlanet, setIsApproachingPlanet] = useState(false);
  const [isShipDocked, setIsShipDocked] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    fuelRefills: 0,
    oxygenPumps: 0,
    lasersFired: 0,
    shieldsActivated: 0,
    suppliesRetrieved: 0,
    eventsResolved: 0
  });

  // Action log feed
  const [eventLogs, setEventLogs] = useState<{ id: string; text: string; type: 'info' | 'warn' | 'success' | 'danger' }[]>([
    { id: '1', text: 'Auto-pilot systems engaged. 90-second flight sequence initialized.', type: 'info' }
  ]);

  // Evaluator function provided by Blockly code runner
  const codeEvaluatorRef = useRef<((state: FlightSimulationState) => Promise<FlightAction>) | null>(null);

  // Timers, locks & loop refs
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const laneSwitchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const eventSpawnerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const asteroidTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const refuelingLockRef = useRef(false);
  const oxygenLockRef = useRef(false);
  const ufoConvoIndexRef = useRef(0);
  const smallAsteroidsRef = useRef<{ id: number; dx: number; dy: number; scale: number; rot: number }[]>([
    { id: 0, dx: 0, dy: -10, scale: 1.0, rot: 15 },
    { id: 1, dx: -90, dy: 10, scale: 1.0, rot: 45 },
    { id: 2, dx: -180, dy: -8, scale: 1.0, rot: 120 }
  ]);

  const stateRef = useRef<{
    fuel: number;
    oxygen: number;
    shipLane: number;
    activeEvent: FlightEvent;
    eventLane: number | null;
    timeRemaining: number;
    isGameOver: boolean;
    isVictory: boolean;
    isPlaying: boolean;
    isShipStopped: boolean;
  }>({
    fuel: 100,
    oxygen: 100,
    shipLane: 2,
    activeEvent: 'NONE',
    eventLane: null,
    timeRemaining: SIMULATION_DURATION,
    isGameOver: false,
    isVictory: false,
    isPlaying: false,
    isShipStopped: false
  });

  // Keep stateRef synchronized
  useEffect(() => {
    stateRef.current = {
      fuel,
      oxygen,
      shipLane,
      activeEvent,
      eventLane,
      timeRemaining,
      isGameOver,
      isVictory,
      isPlaying,
      isShipStopped
    };
  }, [fuel, oxygen, shipLane, activeEvent, eventLane, timeRemaining, isGameOver, isVictory, isPlaying, isShipStopped]);

  // Synchronize RAF Background Parallax Loop
  useEffect(() => {
    const animateBg = (now: number) => {
      if (lastTimeRef.current !== null) {
        const dt = Math.min(0.1, (now - lastTimeRef.current) / 1000);
        if (stateRef.current.isPlaying && !stateRef.current.isGameOver && !stateRef.current.isVictory && !isShipDocked && !isShipStopped) {
          bgOffsetRef.current = (bgOffsetRef.current - 180 * dt) % 2000;
          if (bgElementRef.current) {
            bgElementRef.current.style.backgroundPosition = `${bgOffsetRef.current}px 0`;
          }
        }
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(animateBg);
    };

    rafRef.current = requestAnimationFrame(animateBg);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isShipDocked, isShipStopped]);

  const addLog = useCallback((text: string, type: 'info' | 'warn' | 'success' | 'danger' = 'info') => {
    setEventLogs(prev => [
      { id: `${Date.now()}-${Math.random()}`, text, type },
      ...prev.slice(0, 7)
    ]);
  }, []);

  // Reset simulation to initial pristine state
  const resetSimulation = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (laneSwitchTimerRef.current) clearInterval(laneSwitchTimerRef.current);
    if (eventSpawnerTimerRef.current) clearTimeout(eventSpawnerTimerRef.current);

    asteroidTimeoutsRef.current.forEach(t => clearTimeout(t));
    asteroidTimeoutsRef.current = [];

    refuelingLockRef.current = false;
    oxygenLockRef.current = false;

    setIsPlaying(false);
    setIsLaunching(false);
    setTimeRemaining(SIMULATION_DURATION);
    setIsGameOver(false);
    setIsVictory(false);
    setShowFailModal(false);
    setFailReason('');
    setFailCategory('');
    setShipLane(2);
    setFuel(100);
    setOxygen(100);
    setActiveEvent('NONE');
    setEventLane(null);
    setWarningActive(false);
    setUfoDeflected(false);
    setIsShipStopped(false);
    setIsAsteroidActive(false);
    setIsUfoActive(false);
    setUfoDeparting(false);
    setIsFiringLasers(false);
    setIsShieldActive(false);
    setIsGreetingActive(false);
    setIsUfoGreetingBack(false);
    setIsShipStopped(false);
    setShipSpeechText(null);
    setUfoSpeechText(null);
    setIsRefueling(false);
    setIsOxygenPumping(false);
    ufoConvoIndexRef.current = 0;
    const initialCluster = [
      { id: 0, dx: 0, dy: -10, scale: 1.0, rot: 15 },
      { id: 1, dx: -90, dy: 10, scale: 1.0, rot: 45 },
      { id: 2, dx: -180, dy: -8, scale: 1.0, rot: 120 }
    ];
    setSmallAsteroids(initialCluster);
    smallAsteroidsRef.current = initialCluster;
    setAsteroidDestroyed(false);
    setDestroyedAsteroidIds([]);
    setIsShipHit(false);
    setIsApproachingPlanet(false);
    setIsShipDocked(false);
    setStats({
      fuelRefills: 0,
      oxygenPumps: 0,
      lasersFired: 0,
      shieldsActivated: 0,
      suppliesRetrieved: 0,
      eventsResolved: 0
    });
    setEventLogs([
      { id: '1', text: 'System on standby. Press RUN CODE to launch simulation.', type: 'info' }
    ]);
  }, []);

  // Trigger launch failure when Launch Rocket block is missing (stands still for 3s first)
  const triggerLaunchFailure = useCallback((reason: string) => {
    resetSimulation();
    setIsPlaying(true);
    setIsShipStopped(true);
    addLog('ENGINES IDLE: Standing by on flight deck...', 'info');

    setTimeout(() => {
      if (stateRef.current.isGameOver || stateRef.current.isVictory) return;
      setIsGameOver(true);
      setIsPlaying(false);
      const msg = reason || "You forgot to launch the rocket!";
      setFailReason(msg);
      setFailCategory('Engines Offline');
      addLog(`[ENGINES OFFLINE] ${msg}`, 'danger');
      setShowFailModal(true);

      if (onComplete) {
        setTimeout(() => {
          onComplete(false, {
            survivedTime: 0,
            fuelRefills: 0,
            oxygenPumps: 0,
            lasersFired: 0,
            shieldsActivated: 0,
            suppliesRetrieved: 0,
            errorReason: msg
          });
        }, 0);
      }
    }, 3000);
  }, [addLog, onComplete, resetSimulation]);

  // End simulation with failure
  const handleFail = useCallback((category: string, reason: string) => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (laneSwitchTimerRef.current) clearInterval(laneSwitchTimerRef.current);
    if (eventSpawnerTimerRef.current) clearTimeout(eventSpawnerTimerRef.current);

    setIsGameOver(true);
    setIsPlaying(false);
    const isDestructive = category !== 'Engines Offline' && category !== 'Ship Moving';
    setIsShipHit(isDestructive);
    setIsAsteroidActive(false);
    setIsUfoActive(false);
    setWarningActive(false);
    setFailCategory(category);
    setFailReason(reason);
    addLog(`[FAIL - ${category.toUpperCase()}] ${reason}`, 'danger');

    setTimeout(() => {
      setShowFailModal(true);
    }, 1200);

    if (onComplete) {
      setTimeout(() => {
        onComplete(false, {
          survivedTime: SIMULATION_DURATION - stateRef.current.timeRemaining,
          fuelRefills: stats.fuelRefills,
          oxygenPumps: stats.oxygenPumps,
          lasersFired: stats.lasersFired,
          shieldsActivated: stats.shieldsActivated,
          suppliesRetrieved: stats.suppliesRetrieved,
          errorReason: `[${category}] ${reason}`
        });
      }, 0);
    }
  }, [addLog, onComplete, stats]);

  // End simulation with victory
  const handleVictory = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (laneSwitchTimerRef.current) clearInterval(laneSwitchTimerRef.current);
    if (eventSpawnerTimerRef.current) clearTimeout(eventSpawnerTimerRef.current);

    setIsVictory(true);
    setIsPlaying(false);
    setActiveEvent('NONE');
    setWarningActive(false);
    setIsAsteroidActive(false);
    setIsUfoActive(false);
    setIsShipDocked(true);
    addLog('FLIGHT PROTOCOL COMPLETE: 90-second flight simulation passed! Safely docked at destination planet.', 'success');

    if (onComplete) {
      setTimeout(() => {
        onComplete(true, {
          survivedTime: SIMULATION_DURATION,
          fuelRefills: stats.fuelRefills,
          oxygenPumps: stats.oxygenPumps,
          lasersFired: stats.lasersFired,
          shieldsActivated: stats.shieldsActivated,
          suppliesRetrieved: stats.suppliesRetrieved
        });
      }, 0);
    }
  }, [addLog, onComplete, stats]);

  // Process an active event or check for spam / unprompted actions
  const resolveEvent = useCallback(async (eventToProcess: FlightEvent, targetLane: number | null) => {
    if (!codeEvaluatorRef.current) {
      handleFail('Ignored Condition', 'No executable logic script connected to the flight computer.');
      return;
    }

    const isUfoEvent = eventToProcess === 'FRIENDLY_UFO' || eventToProcess === 'SUPPLY_POD';

    const currentState: FlightSimulationState = {
      fuel: stateRef.current.fuel,
      oxygen: stateRef.current.oxygen,
      currentLane: stateRef.current.shipLane,
      activeEvent: eventToProcess,
      eventLane: targetLane,
      timeRemaining: stateRef.current.timeRemaining,
      isSmallAsteroid: eventToProcess === 'SMALL_ASTEROID',
      isBigAsteroid: eventToProcess === 'BIG_ASTEROID',
      isFriendlyUFO: isUfoEvent,
      isSupplyPod: isUfoEvent,
      isFuelLow: eventToProcess === 'FUEL_LOW' || stateRef.current.fuel < 20,
      isOxygenLow: eventToProcess === 'OXYGEN_LOW' || stateRef.current.oxygen < 20
    };

    if (onEventTrigger) {
      onEventTrigger(eventToProcess, currentState);
    }

    let chosenAction: FlightAction = 'NONE';
    try {
      chosenAction = await codeEvaluatorRef.current(currentState);
    } catch (e: any) {
      if (e?.message === 'SIMULATION_CANCELLED') {
        return;
      }
      handleFail('Script Error', `Code Execution Error: ${e?.message || 'Uncaught error in script'}`);
      return;
    }

    // =========================================================================
    // STRICT EDGE CASE & EXPLOIT PREVENTIONS
    // =========================================================================

    // 1. Check for Premature / Spam / "Catch-All Else" Exploits
    if (eventToProcess === 'NONE') {
      if (chosenAction === 'FIRE_LASERS') {
        handleFail('Wasted Resources', 'Fired lasers with no asteroid in sight! Weapons discharged prematurely.');
        return;
      }
      if (chosenAction === 'ACTIVATE_SHIELD') {
        handleFail('Catch-All Else Exploit', 'Activated defensive shields without a threat present! Overloaded ship power grid.');
        return;
      }
      if (chosenAction === 'GREET_UFO' || chosenAction === 'GREET_UFO_FULL_PROTOCOL' || chosenAction === 'FIRE_TRACTOR_BEAM') {
        handleFail('Wasted Resources', 'Transmitted deep space greetings into empty space! Comms frequency flooded.');
        return;
      }
      if (chosenAction === 'REFILL_FUEL') {
        handleFail('Wasted Resources', 'Attempted to Refill Fuel while fuel tank is full (Fuel > 20%).');
        return;
      }
      if (chosenAction === 'PUMP_OXYGEN') {
        handleFail('Wasted Resources', 'Attempted to Pump Oxygen while oxygen level is nominal (Oxygen > 20%).');
        return;
      }
      return;
    }

    // 2. Strict Scenario Mapping Evaluation
    switch (eventToProcess) {
      case 'FUEL_LOW':
        if (chosenAction === 'REFILL_FUEL') {
          setIsRefueling(true);
          setFuel(100);
          setStats(s => ({ ...s, fuelRefills: s.fuelRefills + 1, eventsResolved: s.eventsResolved + 1 }));
          addLog('Executed Refill Fuel: Fuel restored to 100%.', 'success');
          setTimeout(() => setIsRefueling(false), 1400);
        } else if (chosenAction === 'PUMP_OXYGEN') {
          handleFail('Wrong Action', 'Fuel is low! Execute Refill Fuel instead.');
          return;
        } else if (chosenAction === 'FIRE_LASERS' || chosenAction === 'ACTIVATE_SHIELD' || chosenAction === 'GREET_UFO') {
          handleFail('Wrong Action', 'Fuel emergency active! Execute Refill Fuel.');
          return;
        } else {
          handleFail('Out of Fuel', 'Fuel dropped below 20%! Add a Refill Fuel block.');
          return;
        }
        break;

      case 'OXYGEN_LOW':
        if (chosenAction === 'PUMP_OXYGEN') {
          setIsOxygenPumping(true);
          setOxygen(100);
          setStats(s => ({ ...s, oxygenPumps: s.oxygenPumps + 1, eventsResolved: s.eventsResolved + 1 }));
          addLog('Executed Pump Oxygen: Oxygen restored to 100%.', 'success');
          setTimeout(() => setIsOxygenPumping(false), 1400);
        } else if (chosenAction === 'REFILL_FUEL') {
          handleFail('Wrong Action', 'Oxygen is low! Execute Pump Oxygen instead.');
          return;
        } else if (chosenAction === 'FIRE_LASERS' || chosenAction === 'ACTIVATE_SHIELD' || chosenAction === 'GREET_UFO') {
          handleFail('Wrong Action', 'Oxygen emergency active! Execute Pump Oxygen.');
          return;
        } else {
          handleFail('Out of Oxygen', 'Oxygen dropped below 20%! Add a Pump Oxygen block.');
          return;
        }
        break;

      case 'SMALL_ASTEROID':
        if (chosenAction === 'FIRE_LASERS') {
          playLaserSound();
          setIsFiringLasers(true);
          
          // Staggered individual explosion sequence for each small asteroid in place
          const currentCluster = smallAsteroidsRef.current;
          currentCluster.forEach((ast, idx) => {
            const timeoutId = setTimeout(() => {
              if (stateRef.current.isGameOver) return;
              playExplosionSound();
              setDestroyedAsteroidIds(prev => (prev.includes(ast.id) ? prev : [...prev, ast.id]));
            }, 60 + idx * 90);
            asteroidTimeoutsRef.current.push(timeoutId);
          });

          const laserOffTimeout = setTimeout(() => {
            setIsFiringLasers(false);
          }, 500);
          asteroidTimeoutsRef.current.push(laserOffTimeout);

          setStats(s => ({ ...s, lasersFired: s.lasersFired + 1, eventsResolved: s.eventsResolved + 1 }));
          addLog('Executed Fire Lasers: Small asteroids destroyed in flight!', 'success');
          
          const cleanupTimeout = setTimeout(() => {
            setIsAsteroidActive(false);
            setDestroyedAsteroidIds([]);
            setActiveEvent('NONE');
            stateRef.current.activeEvent = 'NONE';
            setEventLane(null);
            stateRef.current.eventLane = null;
          }, 1450);
          asteroidTimeoutsRef.current.push(cleanupTimeout);
        } else if (chosenAction === 'ACTIVATE_SHIELD') {
          setIsShieldActive(true);
          
          const shieldTimeout = setTimeout(() => {
            playExplosionSound();
            setDestroyedAsteroidIds(smallAsteroidsRef.current.map(a => a.id));
          }, 450);
          asteroidTimeoutsRef.current.push(shieldTimeout);

          setStats(s => ({ ...s, shieldsActivated: s.shieldsActivated + 1, eventsResolved: s.eventsResolved + 1 }));
          addLog('Executed Activate Shield: Small asteroids deflected!', 'success');
          
          const cleanupTimeout = setTimeout(() => {
            setIsShieldActive(false);
            setIsAsteroidActive(false);
            setDestroyedAsteroidIds([]);
            setActiveEvent('NONE');
            stateRef.current.activeEvent = 'NONE';
            setEventLane(null);
            stateRef.current.eventLane = null;
          }, 1450);
          asteroidTimeoutsRef.current.push(cleanupTimeout);
        } else if (chosenAction === 'REFILL_FUEL' || chosenAction === 'PUMP_OXYGEN' || chosenAction === 'GREET_UFO') {
          // Allow asteroids to continue hurtling until they collide with the starship
          addLog('DEFENSE FAILED: Incompatible block executed while asteroids are approaching!', 'danger');
          setTimeout(() => {
            if (stateRef.current.isGameOver || stateRef.current.isVictory) return;
            playExplosionSound();
            setIsShipHit(true);
            setIsAsteroidActive(false);
            handleFail('Wrong Action', 'Small Asteroids collided with starship! Use Fire Lasers or Activate Shield.');
          }, 650);
          return;
        } else {
          // If no matching block was executed, asteroid continues hurtling into ship
          setTimeout(() => {
            if (stateRef.current.isGameOver || stateRef.current.isVictory) return;
            playExplosionSound();
            setIsShipHit(true);
            setIsAsteroidActive(false);
            handleFail('Asteroid Impact', 'Small Asteroids crashed into the starship! Add a Fire Lasers or Activate Shield block.');
          }, 650);
          return;
        }
        break;

      case 'BIG_ASTEROID':
        if (chosenAction === 'ACTIVATE_SHIELD') {
          setIsShieldActive(true);
          setExplosionRight('68%');
          setTimeout(() => {
            playExplosionSound();
            setAsteroidDestroyed(true);
            setIsAsteroidActive(false);
          }, 450);
          setStats(s => ({ ...s, shieldsActivated: s.shieldsActivated + 1, eventsResolved: s.eventsResolved + 1 }));
          addLog('Executed Activate Shield: Massive asteroid deflected!', 'success');
          setTimeout(() => {
            setIsShieldActive(false);
            setAsteroidDestroyed(false);
            setActiveEvent('NONE');
            stateRef.current.activeEvent = 'NONE';
            setEventLane(null);
            stateRef.current.eventLane = null;
          }, 1400);
        } else if (chosenAction === 'FIRE_LASERS') {
          playLaserSound();
          setIsFiringLasers(true);
          addLog('DEFENSE FAILED: Lasers ineffective against massive asteroid!', 'danger');
          setTimeout(() => {
            setIsFiringLasers(false);
            playExplosionSound();
            setIsShipHit(true);
            setIsAsteroidActive(false);
            handleFail('Laser Ineffective', 'Lasers bounced off! Massive Asteroid crushed the starship. Use Activate Shield.');
          }, 600);
          return;
        } else if (chosenAction === 'REFILL_FUEL' || chosenAction === 'PUMP_OXYGEN' || chosenAction === 'GREET_UFO') {
          addLog('DEFENSE FAILED: Wrong block executed during massive asteroid approach!', 'danger');
          setTimeout(() => {
            if (stateRef.current.isGameOver || stateRef.current.isVictory) return;
            playExplosionSound();
            setIsShipHit(true);
            setIsAsteroidActive(false);
            handleFail('Wrong Action', 'Massive Asteroid crushed the starship! Use Activate Shield.');
          }, 600);
          return;
        } else {
          addLog('WARNING: No shield activated! Massive asteroid incoming!', 'danger');
          setTimeout(() => {
            if (stateRef.current.isGameOver || stateRef.current.isVictory) return;
            playExplosionSound();
            setIsShipHit(true);
            setIsAsteroidActive(false);
            handleFail('Asteroid Collision', 'Massive Asteroid crushed the starship! Add an Activate Shield block.');
          }, 600);
          return;
        }
        break;

      case 'FRIENDLY_UFO':
      case 'SUPPLY_POD':
        if (chosenAction === 'GREET_UFO_FULL_PROTOCOL') {
          // Full Protocol: Stop rocket, exchange greetings & supplies, then re-launch thrusters
          setIsShipStopped(true);
          setIsUfoGreetingBack(true);
          setStats(s => ({ ...s, suppliesRetrieved: (s.suppliesRetrieved || 0) + 1, eventsResolved: s.eventsResolved + 1 }));

          const convoList = [
            {
              ship: '"Greetings traveler! Starship standing by."',
              ufo: '"Hello Earthling! Cosmic supplies for you!"',
              farewell: '"Supplies loaded! Safe travels!"'
            },
            {
              ship: '"Nice weather we\'re having today!"',
              ufo: '"Earthling, we\'re in space! There is no weather here!"',
              farewell: '"Enjoy the vacuum of space! Bye!"'
            },
            {
              ship: '"Starship to unknown vessel, do you copy?"',
              ufo: '"e0w pH0wz! d2 na M3 how r u pH0ws hehe xDxD"',
              farewell: '"bYe bYe pHowZ! iNgAt kUysZ! >:D<"'
            }
          ];
          const convoIdx = ufoConvoIndexRef.current % convoList.length;
          ufoConvoIndexRef.current += 1;
          const activeConvo = convoList[convoIdx];

          // 1. Rocket speaks first (0s - 2.4s)
          setShipSpeechText(activeConvo.ship);
          setUfoSpeechText(null);
          addLog(`COMMUNICATION: Rocket transmitted: ${activeConvo.ship}`, 'info');

          // 2. UFO replies (2.4s - 5.2s)
          setTimeout(() => {
            if (stateRef.current.isGameOver) return;
            setShipSpeechText(null);
            setUfoSpeechText(activeConvo.ufo);
            setFuel(prev => Math.min(100, prev + 25));
            setOxygen(prev => Math.min(100, prev + 25));
            addLog(`COMMUNICATION: UFO responded: ${activeConvo.ufo}`, 'success');

            // 3. UFO says farewell, starship re-launches and resumes flight (5.2s - 7.2s)
            setTimeout(() => {
              if (stateRef.current.isGameOver) return;
              setUfoSpeechText(activeConvo.farewell);

              setTimeout(() => {
                if (stateRef.current.isGameOver) return;
                setUfoSpeechText(null);
                setShipSpeechText(null);
                setUfoDeparting(true); // Smoothly zoom away into deep space
                setIsShipStopped(false);
                setIsLaunching(true); // Re-launch thruster flare
                addLog('THRUSTERS RE-IGNITED: Flight resumed towards destination!', 'success');

                setTimeout(() => {
                  setIsLaunching(false);
                  setIsUfoGreetingBack(false);
                  setUfoDeparting(false);
                  setIsUfoActive(false);
                  setActiveEvent('NONE');
                  setEventLane(null);
                }, 1000);
              }, 2000);
            }, 2800);
          }, 2400);
        } else if (chosenAction === 'GREET_UFO_NO_STOP' || chosenAction === 'GREET_UFO') {
          // Greeted without Stop Rocket block: rocket simply moves past the UFO (no game over)
          addLog('UFO ENCOUNTER: Starship did not stop; rocket moved safely past the UFO.', 'info');
          setUfoDeparting(true);
          setTimeout(() => {
            setUfoDeparting(false);
            setIsUfoActive(false);
            setActiveEvent('NONE');
            setEventLane(null);
          }, 1500);
        } else if (chosenAction === 'GREET_UFO_NO_LAUNCH') {
          // Stopped and greeted UFO, but forgot Launch Rocket afterwards: stand still for 3s then notify
          setIsShipStopped(true);
          setIsUfoGreetingBack(true);
          setStats(s => ({ ...s, suppliesRetrieved: (s.suppliesRetrieved || 0) + 1, eventsResolved: s.eventsResolved + 1 }));

          const convoList = [
            {
              ship: '"Greetings traveler! Starship standing by."',
              ufo: '"Hello Earthling! Cosmic supplies for you!"',
              farewell: '"Supplies loaded! Safe travels!"'
            },
            {
              ship: '"Nice weather we\'re having today!"',
              ufo: '"Earthling, we\'re in space! There is no weather here!"',
              farewell: '"Enjoy the vacuum of space! Bye!"'
            },
            {
              ship: '"Starship to unknown vessel, do you copy?"',
              ufo: '"e0w pH0wz! jEjEmOn aLieN hErE.. sUpP kUysZ? xDxD"',
              farewell: '"bYe bYe pHowZ! iNgAt kUysZ! >:D<"'
            }
          ];
          const convoIdx = ufoConvoIndexRef.current % convoList.length;
          ufoConvoIndexRef.current += 1;
          const activeConvo = convoList[convoIdx];

          // 1. Rocket speaks first (0s - 2.4s)
          setShipSpeechText(activeConvo.ship);
          setUfoSpeechText(null);
          addLog(`COMMUNICATION: Rocket transmitted: ${activeConvo.ship}`, 'info');

          // 2. UFO replies (2.4s - 5.2s)
          setTimeout(() => {
            if (stateRef.current.isGameOver) return;
            setShipSpeechText(null);
            setUfoSpeechText(activeConvo.ufo);
            setFuel(prev => Math.min(100, prev + 25));
            setOxygen(prev => Math.min(100, prev + 25));

            // 3. UFO farewell (5.2s - 7.2s)
            setTimeout(() => {
              if (stateRef.current.isGameOver) return;
              setUfoSpeechText(activeConvo.farewell);

              setTimeout(() => {
                if (stateRef.current.isGameOver) return;
                setUfoSpeechText(null);
                setUfoDeparting(true);

                setTimeout(() => {
                  setIsUfoGreetingBack(false);
                  setUfoDeparting(false);
                  setIsUfoActive(false);
                  setActiveEvent('NONE');
                  setEventLane(null);
                  addLog('ENGINES IDLE: Standing still in deep space...', 'warn');

                  // Stand still for 3 seconds before notifying
                  setTimeout(() => {
                    if (stateRef.current.isGameOver || stateRef.current.isVictory) return;
                    handleFail('Engines Offline', 'You stopped and greeted the UFO, but forgot to launch the spaceship afterward!');
                  }, 3000);
                }, 1000);
              }, 2000);
            }, 2800);
          }, 2400);
        } else if (chosenAction === 'STOP') {
          // Stop Rocket only (halts ship for 2 seconds)
          setIsShipStopped(true);
          setShipSpeechText('"Starship stopped! Standing by..."');
          addLog('Executed Stop Rocket: Starship halted, but no Greet UFO block was executed.', 'warn');
          setTimeout(() => {
            setShipSpeechText(null);
            setIsShipStopped(false);
            setUfoDeparting(true);
            setTimeout(() => {
              setUfoDeparting(false);
              setIsUfoActive(false);
              setActiveEvent('NONE');
              setEventLane(null);
            }, 1000);
          }, 2000);
        } else if (chosenAction === 'FIRE_LASERS') {
          // Friendly Fire: Lasers vaporize UFO with full sound and explosion VFX
          playLaserSound();
          setIsFiringLasers(true);
          setExplosionRight('25%');
          setTimeout(() => {
            playExplosionSound();
            setAsteroidDestroyed(true);
            setIsUfoActive(false);
          }, 100);
          addLog('Executed Fire Lasers: Friendly UFO was vaporized by laser fire! (Supply cargo lost)', 'warn');
          setTimeout(() => {
            setIsFiringLasers(false);
            setAsteroidDestroyed(false);
            setActiveEvent('NONE');
            setEventLane(null);
          }, 1200);
        } else if (chosenAction === 'ACTIVATE_SHIELD') {
          // Shield deflects UFO away safely, bouncing it off screen
          setIsShieldActive(true);
          setUfoDeflected(true);
          addLog('Executed Activate Shield: Defensive shield bounced the UFO off into deep space!', 'info');
          setTimeout(() => {
            setIsShieldActive(false);
            setUfoDeflected(false);
            setIsUfoActive(false);
            setActiveEvent('NONE');
            setEventLane(null);
          }, 1200);
        } else {
          // Unhandled: Friendly UFO continues flying steadily across the screen into deep space
          addLog('UFO ENCOUNTER: Friendly UFO drifted safely past into deep space.', 'info');
          setTimeout(() => {
            setIsUfoActive(false);
            setActiveEvent('NONE');
            setEventLane(null);
          }, 2000);
        }
        break;

      default:
        break;
    }
  }, [addLog, handleFail, onEventTrigger]);

  // Spawn an asteroid hazard event with strict warning -> disappearance -> emergence sequence
  const spawnAsteroidEvent = useCallback((type: 'SMALL_ASTEROID' | 'BIG_ASTEROID') => {
    if (stateRef.current.timeRemaining <= 6.5 || stateRef.current.isGameOver || stateRef.current.isVictory) return;

    setShipSpeechText(null);
    setUfoSpeechText(null);

    let targetLane = 2;
    if (type === 'SMALL_ASTEROID') {
      targetLane = 1 + Math.floor(Math.random() * 3); // Strictly Lanes 2, 3, or 4 (indices 1, 2, 3)
      setShipLane(targetLane);
      stateRef.current.shipLane = targetLane;
      stateRef.current.activeEvent = 'SMALL_ASTEROID';
      stateRef.current.eventLane = targetLane;

      // Cluster count ranging from 1 to 5 asteroids
      const count = Math.floor(Math.random() * 5) + 1; // 1, 2, 3, 4, or 5

      // Scatter asteroids naturally in various positions along the lane without overlapping
      const scatterOffsets = [
        { baseDx: 0, baseDy: -10 },
        { baseDx: -75, baseDy: 12 },
        { baseDx: -150, baseDy: -8 },
        { baseDx: -225, baseDy: 12 },
        { baseDx: -300, baseDy: 0 },
      ];

      const cluster = Array.from({ length: count }, (_, i) => {
        const offset = scatterOffsets[i % scatterOffsets.length];
        const dx = offset.baseDx - (Math.random() * 8);
        const dy = offset.baseDy + (Math.random() - 0.5) * 4;
        const scale = 1.0;
        const rot = Math.floor(Math.random() * 360);
        return {
          id: i,
          dx,
          dy,
          scale,
          rot
        };
      });

      setSmallAsteroids(cluster);
      smallAsteroidsRef.current = cluster;
      addLog(`RADAR WARNING: ${count === 1 ? 'Small Asteroid' : `Cluster of ${count} Small Asteroids`} detected in Lane ${targetLane + 1}!`, 'warn');
    } else {
      // Big Asteroid: scattered across active flight lanes (Lanes 2, 3, or 4)
      targetLane = 1 + Math.floor(Math.random() * 3);
      setShipLane(targetLane);
      stateRef.current.shipLane = targetLane;
      stateRef.current.activeEvent = 'BIG_ASTEROID';
      stateRef.current.eventLane = targetLane;
      addLog(`RADAR CRITICAL: Massive Asteroid approaching Lane ${targetLane + 1}!`, 'danger');
    }

    setActiveEvent(type);
    setEventLane(targetLane);
    setWarningActive(true);
    setIsAsteroidActive(false);
    setIsUfoActive(false);
    setAsteroidDestroyed(false);
    setDestroyedAsteroidIds([]);

    // STEP 1: Warning displays for 1.2s, then DISAPPEARS
    setTimeout(() => {
      if (stateRef.current.isGameOver || !stateRef.current.isPlaying) return;
      setWarningActive(false); // <--- WARNING DISAPPEARS
      setIsAsteroidActive(true); // <--- ASTEROIDS EMERGE AND FLY ACROSS

      // STEP 2: Trigger code evaluation & defense when asteroid is midway in flight
      setTimeout(() => {
        if (stateRef.current.isGameOver || !stateRef.current.isPlaying) return;
        resolveEvent(type, targetLane);
      }, 550);
    }, 1200);

  }, [addLog, resolveEvent]);

  // Spawn friendly UFO encounter event (UFO strictly in Lanes 2-4)
  const spawnUfoEvent = useCallback(() => {
    if (stateRef.current.timeRemaining <= 6.5 || stateRef.current.isGameOver || stateRef.current.isVictory) return;

    setShipSpeechText(null);
    setUfoSpeechText(null);

    // UFO strictly appears in Lanes 2-4 (indices 1, 2, 3)
    let targetLane = 1 + Math.floor(Math.random() * 3);
    setShipLane(targetLane);
    stateRef.current.shipLane = targetLane;
    stateRef.current.activeEvent = 'FRIENDLY_UFO';
    stateRef.current.eventLane = targetLane;

    addLog(`RADAR BEACON: Friendly UFO detected in Lane ${targetLane + 1}!`, 'info');

    setActiveEvent('FRIENDLY_UFO');
    setEventLane(targetLane);
    setWarningActive(true);
    setIsAsteroidActive(false);
    setIsUfoActive(true);
    setIsUfoGreetingBack(false);
    setUfoDeparting(false);
    setUfoDeflected(false);

    // STEP 1: Beacon indicator flashes for 1.2s, then fades as UFO approaches
    setTimeout(() => {
      if (stateRef.current.isGameOver || !stateRef.current.isPlaying) return;
      setWarningActive(false);
    }, 1200);

    // STEP 2: Trigger code evaluation when UFO reaches encounter range (at 1.3s)
    setTimeout(() => {
      if (stateRef.current.isGameOver || !stateRef.current.isPlaying) return;
      resolveEvent('FRIENDLY_UFO', targetLane);
    }, 1300);

  }, [addLog, resolveEvent]);

  // Start the 90-second flight simulation
  const startSimulation = useCallback((evaluatorFn: (state: FlightSimulationState) => Promise<FlightAction>) => {
    resetSimulation();
    codeEvaluatorRef.current = evaluatorFn;
    setIsPlaying(true);
    setIsLaunching(true);
    setTimeout(() => setIsLaunching(false), 1600);
    addLog('ENGINES IGNITED: Launch Rocket engaged! Ship deployed into active flight corridor.', 'success');

    refuelingLockRef.current = false;
    oxygenLockRef.current = false;

    // 1. Master Game Clock (ticks every 200ms)
    gameLoopRef.current = setInterval(() => {
      if (stateRef.current.isGameOver || stateRef.current.isVictory) return;

      // Update countdown clock (pauses only during mid-flight UFO greeting interaction, never during planet arrival / docking)
      const isUfoGreetingInteraction =
        (stateRef.current.activeEvent === 'FRIENDLY_UFO' || stateRef.current.activeEvent === 'SUPPLY_POD') &&
        stateRef.current.isShipStopped;

      if (!isUfoGreetingInteraction) {
        setTimeRemaining(prev => {
          // Destination planet approach begins at remaining time <= 6.5s
          if (prev <= 6.5 && !stateRef.current.isGameOver && !stateRef.current.isVictory) {
            setIsApproachingPlanet(true);
            setShipLane(2); // Center ship for orbital entry
          }

          // Rocket reaches super close proximity and halts/docks in front of the planet at t <= 1.8s
          if (prev <= 1.8 && !stateRef.current.isGameOver && !stateRef.current.isVictory) {
            setIsShipDocked(true);
            setIsShipStopped(true);
          }

          // Completion screen triggers ONLY after the rocket has arrived and docked super near the planet
          if (prev <= 0.2) {
            setTimeout(() => handleVictory(), 500);
            return 0;
          }
          return Math.max(0, parseFloat((prev - 0.2).toFixed(1)));
        });
      }

      // Gradual Fuel Depletion (only during active flight, pauses during UFO interaction or final planet arrival)
      const isNominalFlight = !isUfoGreetingInteraction && stateRef.current.timeRemaining > 6.5;

      setFuel(prevFuel => {
        if (stateRef.current.isGameOver || stateRef.current.isVictory || !isNominalFlight) return prevFuel;
        const next = Math.max(0, prevFuel - 1.067);

        // Trigger fuel case evaluation when fuel reaches < 20%
        if (next < 20 && !refuelingLockRef.current) {
          refuelingLockRef.current = true;
          addLog('SENSOR ALERT: Fuel dropped below 20%! Executing fuel emergency routine...', 'warn');
          setTimeout(() => {
            resolveEvent('FUEL_LOW', null).finally(() => {
              setTimeout(() => {
                refuelingLockRef.current = false;
              }, 2500);
            });
          }, 0);
        }

        if (next <= 0) {
          setTimeout(() => {
            handleFail('Meters Depleted', 'Fuel reached 0%. Ship suffered complete engine blackout.');
          }, 0);
        }
        return next;
      });

      // Gradual Oxygen Depletion (only during active flight, pauses during UFO interaction or final planet arrival)
      setOxygen(prevOxygen => {
        if (stateRef.current.isGameOver || stateRef.current.isVictory || !isNominalFlight) return prevOxygen;
        const next = Math.max(0, prevOxygen - 0.534);

        // Trigger oxygen case evaluation when oxygen reaches < 20%
        if (next < 20 && !oxygenLockRef.current) {
          oxygenLockRef.current = true;
          addLog('SENSOR ALERT: Oxygen dropped below 20%! Executing life support routine...', 'warn');
          setTimeout(() => {
            resolveEvent('OXYGEN_LOW', null).finally(() => {
              setTimeout(() => {
                oxygenLockRef.current = false;
              }, 2500);
            });
          }, 0);
        }

        if (next <= 0) {
          setTimeout(() => {
            handleFail('Meters Depleted', 'Oxygen reached 0%. Life support failed.');
          }, 0);
        }
        return next;
      });

    }, 200);

    // 2. Automated Lane Switching every 3 seconds (Only when nominal, freezes during hazards or docking)
    laneSwitchTimerRef.current = setInterval(() => {
      if (
        stateRef.current.activeEvent !== 'NONE' ||
        stateRef.current.isGameOver ||
        stateRef.current.isVictory ||
        stateRef.current.timeRemaining <= 6.5 ||
        refuelingLockRef.current ||
        oxygenLockRef.current
      ) {
        return;
      }

      setShipLane(prevLane => {
        if (stateRef.current.activeEvent !== 'NONE') return prevLane;
        let nextLane = Math.floor(Math.random() * TOTAL_LANES);
        if (nextLane === prevLane) {
          nextLane = (prevLane + 1) % TOTAL_LANES;
        }
        stateRef.current.shipLane = nextLane;
        return nextLane;
      });
    }, 3000);

    // 3. Events Schedule: Scattered throughout the 90-second flight sequence
    // Guarantees all scenarios appear (Small Asteroids, Big Asteroids, and exactly 3 Friendly UFOs in order)
    const flightEventsSchedule: { timeMs: number; kind: 'SMALL_ASTEROID' | 'BIG_ASTEROID' | 'FRIENDLY_UFO' }[] = [
      { timeMs: 4000, kind: 'SMALL_ASTEROID' },
      { timeMs: 10000, kind: 'FRIENDLY_UFO' },   // Encounter #1: Cosmic Supplies
      { timeMs: 21000, kind: 'BIG_ASTEROID' },
      { timeMs: 29000, kind: 'SMALL_ASTEROID' },
      { timeMs: 38000, kind: 'FRIENDLY_UFO' },   // Encounter #2: Weather in Space
      { timeMs: 49000, kind: 'BIG_ASTEROID' },
      { timeMs: 57000, kind: 'SMALL_ASTEROID' },
      { timeMs: 66000, kind: 'FRIENDLY_UFO' },   // Encounter #3: Jejemon Alien
      { timeMs: 76000, kind: 'BIG_ASTEROID' },
      { timeMs: 81000, kind: 'SMALL_ASTEROID' },
    ];

    asteroidTimeoutsRef.current.forEach(t => clearTimeout(t));
    asteroidTimeoutsRef.current = [];

    flightEventsSchedule.forEach(item => {
      const t = setTimeout(() => {
        if (!stateRef.current.isGameOver && !stateRef.current.isVictory && stateRef.current.activeEvent === 'NONE') {
          if (item.kind === 'FRIENDLY_UFO') {
            spawnUfoEvent();
          } else {
            spawnAsteroidEvent(item.kind);
          }
        }
      }, item.timeMs);
      asteroidTimeoutsRef.current.push(t);
    });

  }, [addLog, handleFail, handleVictory, resetSimulation, resolveEvent, spawnAsteroidEvent, spawnUfoEvent]);

  // Expose imperative handle for external caller
  useImperativeHandle(ref, () => ({
    startSimulation,
    triggerLaunchFailure,
    stopSimulation: resetSimulation,
    resetSimulation
  }), [startSimulation, triggerLaunchFailure, resetSimulation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (laneSwitchTimerRef.current) clearInterval(laneSwitchTimerRef.current);
      if (eventSpawnerTimerRef.current) clearTimeout(eventSpawnerTimerRef.current);
      asteroidTimeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-0 bg-[#090214] rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl flex flex-col font-sans select-none">

      {/* ========================================================================= */}
      {/* TOP DASHBOARD / HUD HEADER                                                */}
      {/* ========================================================================= */}
      <div className="relative z-40 bg-[#130728]/95 backdrop-blur-md px-4 sm:px-6 py-2.5 border-b border-white/10 flex items-center justify-between gap-4 shrink-0 shadow-lg min-h-[52px]">

        {/* Left: Instructions Dropdown Guide for Players */}
        <div className="relative">
          <button
            onClick={() => setShowInstructions(prev => !prev)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/60 text-purple-100 hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.35)] active:scale-95 cursor-pointer ring-1 ring-purple-400/30"
            title="Flight Defense Instructions"
          >
            <HelpCircle size={15} className="text-purple-300" />
            <span>Instructions</span>
            {showInstructions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showInstructions && (
            <div className="absolute top-11 left-0 z-[60] w-[min(28rem,calc(100vw-3rem))] max-h-[75vh] sm:max-h-[380px] overflow-y-auto bg-[#160a2c]/98 border-2 border-purple-500/50 rounded-xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 text-left scrollbar-thin scrollbar-thumb-purple-500/40">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-amber-400">
                  How to Play
                </span>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2 text-[11px] font-sans text-gray-200 leading-normal">
                <p className="font-semibold text-purple-300">
                  Survive the flight to reach the destination planet:
                </p>

                <ul className="space-y-1.5 pl-0.5">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">1.</span>
                    <span><strong className="text-emerald-300">Launch:</strong> Use <strong className="text-emerald-300">Launch Rocket</strong> to start your flight.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">2.</span>
                    <span><strong className="text-blue-300">Cases:</strong> Use <strong className="text-blue-300">Case</strong> blocks to tell your ship what to do when different situations happen.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">3.</span>
                    <span><strong className="text-amber-300">Resources:</strong> Refill your Fuel and Oxygen before they drop to 0%.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">4.</span>
                    <span><strong className="text-rose-300">Asteroids:</strong> Defend against incoming small asteroid swarms and massive asteroids.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 font-bold">5.</span>
                    <span><strong className="text-pink-300">Friendly UFOs:</strong> When a friendly UFO appears, remember to stop first, say hello, and launch your rocket again to keep flying!</span>
                  </li>
                </ul>

                <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-purple-300/80 italic">
                  Tip: Connect the right actions inside your cases to keep your ship safe and reach the planet!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Draining Fuel & Oxygen Gauges */}
        <div className="flex items-center gap-4 sm:gap-8 flex-1 max-w-md justify-end">

          {/* Fuel Gauge */}
          <div className="flex-1 max-w-[160px]">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
              <span className={`flex items-center gap-1 uppercase tracking-wider ${
                fuel < 20
                  ? 'text-rose-400 animate-pulse font-bold'
                  : fuel < 50
                    ? 'text-amber-300 animate-slow-flicker'
                    : 'text-amber-400'
              }`}>
                <Flame size={13} className="fill-current" /> Fuel
              </span>
              <span className={`${fuel < 20 ? 'text-rose-400 animate-pulse font-black' : fuel < 50 ? 'text-amber-300 animate-slow-flicker font-bold' : 'text-gray-200'}`}>
                {Math.round(fuel)}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-black/70 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-300 ${fuel < 20
                    ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse'
                    : fuel < 50
                      ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-slow-flicker'
                      : 'bg-gradient-to-r from-amber-400 to-yellow-400 shadow-[0_0_8px_#fbbf24]'
                  }`}
                style={{ width: `${fuel}%` }}
              />
            </div>
          </div>

          {/* Oxygen Gauge */}
          <div className="flex-1 max-w-[160px]">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
              <span className={`flex items-center gap-1 uppercase tracking-wider ${
                oxygen < 20
                  ? 'text-rose-400 animate-pulse font-bold'
                  : oxygen < 50
                    ? 'text-cyan-300 animate-slow-flicker'
                    : 'text-cyan-400'
              }`}>
                <Wind size={13} /> Oxygen
              </span>
              <span className={`${oxygen < 20 ? 'text-rose-400 animate-pulse font-black' : oxygen < 50 ? 'text-cyan-300 animate-slow-flicker font-bold' : 'text-gray-200'}`}>
                {Math.round(oxygen)}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-black/70 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className={`h-full rounded-full transition-all duration-300 ${oxygen < 20
                    ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-pulse'
                    : oxygen < 50
                      ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4] animate-slow-flicker'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_8px_#38bdf8]'
                  }`}
                style={{ width: `${oxygen}%` }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5-LANE CONTINUOUS PARALLAX AUTO-RUNNER PLAYFIELD                          */}
      {/* ========================================================================= */}
      <div className="relative flex-1 w-full overflow-hidden flex flex-col">

        {/* Continuous Looping Panoramic Background using Landing Page BG.png */}
        <div
          ref={bgElementRef}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: "url('/assets/global/ui/Landing Page BG.png')",
            backgroundSize: 'auto 100%',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: '0px 0',
            opacity: 0.85
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 z-0 pointer-events-none" />

        {/* 5 Horizontal Lanes Grid (Seamless space, warning badge disappears when entity emerges) */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {[0, 1, 2, 3, 4].map(laneIdx => {
            const isHazardInThisLane = warningActive && (
              (activeEvent === 'BIG_ASTEROID' && eventLane === laneIdx) ||
              (activeEvent === 'SMALL_ASTEROID' && eventLane === laneIdx)
            );
            const isUfoInThisLane = warningActive && (
              (activeEvent === 'FRIENDLY_UFO' || activeEvent === 'SUPPLY_POD') && eventLane === laneIdx
            );

            return (
              <div
                key={laneIdx}
                className="relative flex-1 w-full flex items-center justify-end px-6 pointer-events-none"
              >
                {/* Right Telegraph Warning Indicator for Asteroids */}
                {isHazardInThisLane && (
                  <div className="absolute right-4 sm:right-6 flex items-center gap-2 animate-pulse z-20">
                    <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-rose-600/95 border-2 border-rose-300 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_35px_#f43f5e]">
                      <AlertTriangle size={20} className="text-amber-300 shrink-0" />
                      <span>{activeEvent === 'BIG_ASTEROID' ? 'WARNING: MASSIVE ASTEROID !' : 'WARNING: INCOMING !'}</span>
                    </div>
                  </div>
                )}

                {/* Right Telegraph Beacon Indicator for Friendly UFO */}
                {isUfoInThisLane && (
                  <div className="absolute right-4 sm:right-6 flex items-center gap-2 animate-pulse z-20">
                    <div className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-emerald-600/95 border-2 border-emerald-300 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_35px_#10b981]">
                      <Radio size={20} className="text-emerald-200 shrink-0 animate-pulse" />
                      <span>FRIENDLY UFO ENCOUNTER !</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ======================================================================= */}
        {/* DESTINATION PLANET (Smooth approach on the right, NO spinning/fading)   */}
        {/* ======================================================================= */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 z-15 transition-[right] duration-[3500ms] ease-out pointer-events-none flex items-center justify-center opacity-100 ${isApproachingPlanet ? 'right-2 sm:right-6 md:right-10' : '-right-[550px]'
            }`}
        >
          <div className="relative flex items-center justify-center">
            {/* Atmospheric Glow Ring */}
            <div className="absolute -inset-10 rounded-full bg-radial from-orange-500/25 via-amber-500/10 to-transparent blur-2xl animate-pulse" />

            {/* Destination Planet Image (Static, NO spinning) */}
            <img
              src={destinationPlanet}
              alt="Destination Planet"
              className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 object-contain drop-shadow-[0_0_50px_rgba(249,115,22,0.85)]"
            />

            {/* Orbit Entry Beacon */}
            {isApproachingPlanet && (
              <div className="absolute -top-10 px-4 py-1.5 rounded-full bg-emerald-600/95 border-2 border-emerald-300 text-white font-mono font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_#10b981] whitespace-nowrap">
                {isShipDocked ? 'Orbit Reached - Docked!' : 'Entering Planet Orbit...'}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* SPACESHIP ACTOR (Glides super close to planet upon arrival)             */}
        {/* ======================================================================= */}
        <div
          className={`absolute z-20 transition-all ${isApproachingPlanet ? 'duration-[3000ms] ease-out' : 'duration-700 ease-out'
            } flex items-center ${isShipDocked
              ? 'left-[54%] sm:left-[60%] md:left-[64%]'
              : isApproachingPlanet
                ? 'left-[46%] sm:left-[52%] md:left-[56%]'
                : 'left-[8%] sm:left-[12%]'
            }`}
          style={{
            top: `${(shipLane * 20) + 10}%`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="relative group flex items-center justify-center">

            {/* Thruster Flame Effects (Fully extinguished when ship is docked, stopped, or destroyed) */}
            <div className={`absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 w-8 h-4 bg-gradient-to-l from-orange-400 via-yellow-300 to-transparent rounded-full blur-xs pointer-events-none transition-opacity duration-300 ${isShipDocked || isShipStopped || isShipHit || (isGameOver && !isVictory) ? 'opacity-0' : isPlaying ? 'animate-pulse' : 'opacity-40'
              }`} />
            <div className={`absolute -left-5 sm:-left-6 top-1/2 -translate-y-1/2 w-6 h-2 bg-gradient-to-l from-cyan-400 to-transparent rounded-full blur-xs pointer-events-none transition-opacity duration-300 ${isShipDocked || isShipStopped || isShipHit || (isGameOver && !isVictory) ? 'opacity-0' : ''
              }`} />

            {/* Launch Rocket Engine Ignition Flare FX */}
            {isLaunching && !isShipHit && (
              <div className="absolute -left-10 sm:-left-12 top-1/2 -translate-y-1/2 w-16 h-8 bg-gradient-to-l from-emerald-400 via-amber-400 to-transparent rounded-full blur-sm animate-pulse pointer-events-none z-30" />
            )}

            {/* Spaceship Body Graphic */}
            <div className={`relative transition-all duration-150 ${isShipHit ? 'opacity-0 scale-50' : 'opacity-100 scale-100'} ${isLaunching ? 'scale-110 duration-300' : ''}`}>
              <img
                src="/assets/planets/00_moon/level_1/Spaceship Section 3.svg"
                alt="Player Spaceship"
                className="w-18 h-18 sm:w-22 sm:h-22 object-contain drop-shadow-[0_0_18px_rgba(255,145,45,0.75)]"
              />
            </div>

            {/* Destruction Explosion Animation (Only for destructive collisions/blackouts) */}
            {isShipHit && (
              <div className="absolute -inset-10 z-40 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-75">
                <img
                  src="/assets/planets/00_moon/environment/Explosion.svg"
                  alt="Explosion"
                  className="w-36 h-36 sm:w-44 sm:h-44 object-contain animate-single-explosion opacity-100 drop-shadow-[0_0_35px_rgba(239,68,68,0.95)]"
                />
              </div>
            )}

            {/* Laser Beam FX (When Fire_Lasers() executes) */}
            {isFiringLasers && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 w-[800px] h-6 z-30 pointer-events-none flex items-center">
                <div className="w-full h-4 bg-gradient-to-r from-red-500 via-rose-300 to-transparent rounded-full shadow-[0_0_25px_#ef4444] animate-pulse" />
                <div className="absolute inset-x-0 h-2 top-2 bg-white rounded-full blur-[0.5px]" />
              </div>
            )}

            {/* Rocket Speech Bubble (Simulated Conversation - positioned to never clip off-screen) */}
            {shipSpeechText && (
              <div className={`absolute ${shipLane === 0 ? 'top-full mt-2' : '-top-9 sm:-top-10'} left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-200`}>
                <div className="relative px-3 py-1.5 rounded-xl bg-[#1d0b36]/95 border border-pink-400 text-pink-100 font-sans text-[9px] sm:text-[10px] font-semibold shadow-[0_0_15px_rgba(236,72,153,0.75)] min-w-[190px] max-w-[270px] sm:max-w-[320px] text-center leading-snug break-words">
                  <span>{shipSpeechText}</span>
                  {/* Chat bubble pointer tail */}
                  <div className={`absolute ${shipLane === 0 ? '-top-1.5 border-b-[5px] border-b-pink-400 border-t-0' : '-bottom-1.5 border-t-[5px] border-t-pink-400 border-b-0'} left-1/2 -translate-x-1/2 w-0 h-0 border-x-[4px] border-x-transparent`} />
                </div>
              </div>
            )}

            {/* Blue Energy Shield Bubble FX (When Activate_Shield() executes) */}
            {isShieldActive && (
              <div className="absolute -inset-6 sm:-inset-10 rounded-full border-4 border-cyan-400 bg-cyan-500/30 backdrop-blur-[1px] shadow-[0_0_45px_rgba(6,182,212,0.95)] ring-4 ring-cyan-300/70 animate-pulse z-30 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full rounded-full border-2 border-sky-300/60 animate-spin duration-1000" />
                <div className="absolute inset-1 rounded-full bg-radial from-cyan-400/30 to-transparent" />
              </div>
            )}

            {/* Refuel Golden Vapor FX */}
            {isRefueling && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-amber-500 text-black font-mono font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_#f59e0b] animate-bounce z-30 whitespace-nowrap">
                +100% FUEL
              </div>
            )}

            {/* Oxygen Pressurization FX */}
            {isOxygenPumping && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-cyan-500 text-black font-mono font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_#06b6d4] animate-bounce z-30 whitespace-nowrap">
                +100% OXYGEN
              </div>
            )}

          </div>
        </div>

        {/* ======================================================================= */}
        {/* FRIENDLY UFO (UFO.svg with Glowing Emerald Aura & Dialog Bubble)         */}
        {/* ======================================================================= */}
        {eventLane !== null && (activeEvent === 'FRIENDLY_UFO' || activeEvent === 'SUPPLY_POD') && isUfoActive && (
          <div
            className={`absolute z-20 pointer-events-none ${ufoDeflected
                ? 'animate-ufo-deflect'
                : ufoDeparting
                  ? 'transition-all duration-1000 ease-in -translate-x-[600px] -translate-y-24 opacity-0 scale-50'
                  : isUfoGreetingBack
                    ? 'scale-105'
                    : 'animate-flyby-ufo'
              }`}
            style={{
              top: `${(eventLane * 20) + 10}%`,
              ...(isUfoGreetingBack || ufoDeparting ? { right: '25%' } : {}),
              transform: ufoDeparting ? undefined : 'translateY(-50%)'
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* Friendly Green Signal Aura Ring */}
              <div className="absolute -inset-4 rounded-full bg-emerald-400/25 blur-md animate-ping" />

              <img
                src="/assets/planets/00_moon/level_1/UFO.svg"
                alt="Friendly UFO"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_25px_rgba(34,197,94,0.95)] animate-bob"
              />

              {/* UFO Speech Bubble (Simulated Conversation - positioned to never clip off-screen) */}
              {ufoSpeechText ? (
                <div className={`absolute ${eventLane === 0 ? 'top-full mt-2' : '-top-9 sm:-top-10'} left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-200`}>
                  <div className="relative px-3 py-1.5 rounded-xl bg-[#092419]/95 border border-emerald-400 text-emerald-100 font-sans text-[9px] sm:text-[10px] font-semibold shadow-[0_0_15px_rgba(16,185,129,0.75)] min-w-[190px] max-w-[270px] sm:max-w-[320px] text-center leading-snug break-words">
                    <span>{ufoSpeechText}</span>
                    {/* Chat bubble pointer tail */}
                    <div className={`absolute ${eventLane === 0 ? '-top-1.5 border-b-[5px] border-b-emerald-400 border-t-0' : '-bottom-1.5 border-t-[5px] border-t-emerald-400 border-b-0'} left-1/2 -translate-x-1/2 w-0 h-0 border-x-[4px] border-x-transparent`} />
                  </div>
                </div>
              ) : (
                <div className={`absolute ${eventLane === 0 ? 'top-full mt-2' : '-top-5'} left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400 text-emerald-300 font-mono font-bold text-[8px] uppercase tracking-wider shadow-[0_0_8px_#10b981] whitespace-nowrap`}>
                  Friendly UFO
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* INCOMING ASTEROIDS (Meteor Small.svg & Meteor Big.svg)                   */}
        {/* ======================================================================= */}
        {/* Scenario B: Small Asteroid Attack (Cluster of 1-5 asteroids with per-meteor explosion VFX) */}
        {eventLane !== null && activeEvent === 'SMALL_ASTEROID' && isAsteroidActive && (
          <div
            className="absolute z-20 animate-hurl-asteroid pointer-events-none"
            style={{
              top: `${(eventLane * 20) + 10}%`,
              transform: 'translateY(-50%)'
            }}
          >
            <div className="relative flex items-center">
              {smallAsteroids.map((ast) => {
                const isDestroyed = destroyedAsteroidIds.includes(ast.id);
                return (
                  <div
                    key={ast.id}
                    className="absolute"
                    style={{
                      right: `${ast.dx}px`,
                      top: `${ast.dy}px`,
                      transform: `scale(${ast.scale}) rotate(${ast.rot}deg)`
                    }}
                  >
                    <div className="relative flex items-center justify-center">
                      {isDestroyed ? (
                        <img
                          key={`exp-${ast.id}`}
                          src="/assets/planets/00_moon/environment/Explosion.svg"
                          alt="Destroyed Asteroid"
                          className="w-28 h-28 sm:w-36 sm:h-36 object-contain animate-single-explosion drop-shadow-[0_0_35px_rgba(251,191,36,0.95)] pointer-events-none"
                        />
                      ) : (
                        <img
                          key={`meteor-${ast.id}`}
                          src="/assets/planets/00_moon/environment/Meteor Small.svg"
                          alt="Small Asteroid"
                          className="w-18 h-18 sm:w-22 sm:h-22 object-contain drop-shadow-[0_0_20px_rgba(249,115,22,0.95)] animate-spin-steady"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scenario D: Massive Asteroid Attack (Scattered across flight lanes) */}
        {activeEvent === 'BIG_ASTEROID' && isAsteroidActive && !asteroidDestroyed && (
          <div
            className="absolute z-20 animate-hurl-asteroid-slow pointer-events-none"
            style={{
              top: `${((eventLane ?? 2) * 20) + 10}%`,
              transform: 'translateY(-50%)'
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* Enhanced Multi-Layered Blazing Atmospheric Plasma Wake / Fiery Trail */}
              <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-64 h-32 bg-gradient-to-r from-rose-600/90 via-orange-500/70 to-transparent rounded-full blur-xl animate-pulse pointer-events-none" />
              <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-48 h-20 bg-gradient-to-r from-amber-400 via-rose-500 to-transparent rounded-full blur-md opacity-90 pointer-events-none" />
              <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-36 h-10 bg-gradient-to-r from-yellow-200 via-amber-400 to-transparent rounded-full blur-xs opacity-95 pointer-events-none" />

              <img
                src="/assets/planets/00_moon/environment/Meteor Big.svg"
                alt="Massive Asteroid"
                className="w-48 h-48 sm:w-60 sm:h-60 object-contain drop-shadow-[0_0_50px_rgba(244,63,94,0.95)] animate-spin-steady-slow relative z-10"
              />
            </div>
          </div>
        )}

        {/* Massive Asteroid Explosion / Deflection FX when destroyed in flight */}
        {asteroidDestroyed && activeEvent === 'BIG_ASTEROID' && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              top: `${((eventLane ?? 2) * 20) + 10}%`,
              transform: 'translateY(-50%)',
              right: explosionRight
            }}
          >
            <div className="relative flex items-center justify-center">
              <img
                src="/assets/planets/00_moon/environment/Explosion.svg"
                alt="Asteroid Destroyed"
                className="w-48 h-48 sm:w-60 sm:h-60 object-contain animate-single-explosion drop-shadow-[0_0_35px_rgba(251,191,36,0.95)]"
              />
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* STANDBY PROMPT: "Run Simulation to Start" (Fading in & out pulse)       */}
        {/* ======================================================================= */}
        {!isPlaying && !isGameOver && !isVictory && (
          <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 z-25 pointer-events-none flex items-center justify-center gap-3.5 px-8 sm:px-10 py-3 sm:py-3.5 rounded-full bg-[#160a2c]/95 border-2 border-purple-400/60 text-purple-100 font-mono text-sm sm:text-base font-black uppercase tracking-widest shadow-[0_0_35px_rgba(168,85,247,0.55)] backdrop-blur-md animate-pulse whitespace-nowrap w-max min-w-[320px] sm:min-w-[380px]">
            <Play size={20} className="fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] shrink-0" />
            <span className="text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.7)] whitespace-nowrap">Run Simulation to Start</span>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* SIMULATION PASSED (VICTORY MODAL OVERLAY)                                 */}
      {/* ========================================================================= */}
      {isVictory && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)] mb-3">
            <CheckCircle2 size={42} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-emerald-400 uppercase tracking-wider mb-2">
            Simulation Passed!
          </h2>
          <p className="text-sm sm:text-base text-gray-200 max-w-md mb-6 leading-relaxed font-medium">
            All flight hazards safely resolved. Starship arrived smoothly at the destination planet!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full max-w-xl">
            <div className="bg-[#130728] border border-white/15 p-3 rounded-xl flex flex-col items-center shadow-lg">
              <span className="text-gray-300 text-xs uppercase tracking-wider font-bold">Survive Time</span>
              <span className="text-emerald-400 font-mono font-black text-lg sm:text-xl">90.0s</span>
            </div>
            <div className="bg-[#130728] border border-white/15 p-3 rounded-xl flex flex-col items-center shadow-lg">
              <span className="text-gray-300 text-xs uppercase tracking-wider font-bold">Fuel Refills</span>
              <span className="text-amber-400 font-mono font-black text-lg sm:text-xl">{stats.fuelRefills}</span>
            </div>
            <div className="bg-[#130728] border border-white/15 p-3 rounded-xl flex flex-col items-center shadow-lg">
              <span className="text-gray-300 text-xs uppercase tracking-wider font-bold">Oxygen Pumps</span>
              <span className="text-cyan-400 font-mono font-black text-lg sm:text-xl">{stats.oxygenPumps}</span>
            </div>
            <div className="bg-[#130728] border border-white/15 p-3 rounded-xl flex flex-col items-center shadow-lg">
              <span className="text-gray-300 text-xs uppercase tracking-wider font-bold">Asteroids Deflected</span>
              <span className="text-purple-400 font-mono font-black text-lg sm:text-xl">{stats.lasersFired + stats.shieldsActivated}</span>
            </div>
            <div className="bg-[#130728] border border-white/15 p-3 rounded-xl flex flex-col items-center shadow-lg">
              <span className="text-gray-300 text-xs uppercase tracking-wider font-bold">UFOs Greeted</span>
              <span className="text-emerald-400 font-mono font-black text-lg sm:text-xl">{stats.suppliesRetrieved}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SIMULATION FAILED (GAME OVER MODAL OVERLAY)                               */}
      {/* ========================================================================= */}
      {showFailModal && isGameOver && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.5)] mb-3 animate-bounce">
            <XCircle size={36} />
          </div>
          <h2 className="text-2xl font-display font-black text-rose-400 uppercase tracking-wider mb-2">
            Simulation Failed
          </h2>
          <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl px-4 py-3 max-w-sm text-xs text-rose-200 font-mono leading-relaxed text-center shadow-lg">
            {failReason}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes panoramaScroll {
          0% {
            background-position: 0% 0;
          }
          100% {
            background-position: -2000px 0;
          }
        }
        .panorama-bg {
          animation: panoramaScroll 10s linear infinite !important;
        }
        .panorama-bg-paused {
          animation-play-state: paused !important;
        }
      `}</style>

      <style jsx>{`
        @keyframes hurlAsteroid {
          0% {
            right: -15%;
          }
          100% {
            right: 78%;
          }
        }
        @keyframes hurlAsteroidSlow {
          0% {
            right: -20%;
          }
          100% {
            right: 78%;
          }
        }
        @keyframes bob {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes spinSteady {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spinSteadySlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
        .animate-hurl-asteroid {
          animation: hurlAsteroid 1.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-hurl-asteroid-slow {
          animation: hurlAsteroidSlow 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes flybyUfo {
          0% {
            right: -150px;
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          50% {
            right: 25%;
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            right: calc(100% + 150px);
            opacity: 0;
          }
        }
        .animate-flyby-ufo {
          animation: flybyUfo 4.0s linear forwards;
        }
        @keyframes ufoDeflect {
          0% {
            right: 25%;
            transform: translateY(-50%) scale(1) rotate(0deg);
            opacity: 1;
          }
          30% {
            right: 32%;
            transform: translateY(-80%) scale(1.15) rotate(-25deg);
            opacity: 1;
          }
          100% {
            right: -250px;
            transform: translateY(-300px) scale(0.2) rotate(240deg);
            opacity: 0;
          }
        }
        .animate-ufo-deflect {
          animation: ufoDeflect 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes singleExplosion {
          0% {
            transform: scale(0.9);
            opacity: 1;
          }
          35% {
            transform: scale(1.5);
            opacity: 1;
          }
          75% {
            transform: scale(1.85);
            opacity: 0.75;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        .animate-single-explosion {
          animation: singleExplosion 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-bob {
          animation: bob 2s ease-in-out infinite;
        }
        .animate-spin-steady {
          animation: spinSteady 3s linear infinite;
        }
        .animate-spin-steady-slow {
          animation: spinSteadySlow 16s linear infinite;
        }
        @keyframes slowFlicker {
          0%, 100% {
            opacity: 1;
            filter: brightness(1);
          }
          50% {
            opacity: 0.35;
            filter: brightness(0.65);
          }
        }
        .animate-slow-flicker {
          animation: slowFlicker 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

FlightSimulation.displayName = "FlightSimulation";
export default FlightSimulation;
