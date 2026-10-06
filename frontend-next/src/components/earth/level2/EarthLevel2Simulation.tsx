'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  Check,
  AlertTriangle,
  Lock,
  Terminal,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  HelpCircle,
  Globe,
} from 'lucide-react';
import {
  EARTH_2_PLANETS,
  type PlanetProfileSpec,
  type Earth2Section1Validation,
  type Earth2Section2Validation,
} from '@/lib/earth/earthLevel2Definitions';

interface EarthLevel2SimulationProps {
  sectionIndex?: number; // 0 for Section 1 (Scanner), 1 for Section 2 (Archive)
  activeTab?: 'tab1' | 'tab2';
  tab1Validation?: Earth2Section1Validation;
  tab2Validation?: Earth2Section2Validation;
  section1Validation?: Earth2Section1Validation;
  section2Validation?: Earth2Section2Validation;
  isRunning?: boolean;
  resetKey?: number;
  onSimulationComplete?: (success: boolean, message?: string) => void;
  onAdvanceSection?: () => void;
  onSelectPlanet?: (planetName: string) => void;
  onSelectFolder?: (folderName: string) => void;
}

function WorkspaceHint() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-2.5 left-2.5 z-30 flex items-center group">
      {/* Trigger Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Workspace tip"
        title="Workspace tip"
        className="w-7 h-7 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-cyan-100 flex items-center justify-center shadow-lg transition-all cursor-help shrink-0"
      >
        <HelpCircle size={15} />
      </button>

      {/* Tooltip Popover (Beside the Icon to the right, wider layout) */}
      <div
        className={`absolute left-9 bottom-0 w-[min(380px,calc(100vw-60px))] px-3.5 py-2.5 rounded-xl bg-[#0b1324]/95 border border-cyan-500/40 shadow-[0_4px_25px_rgba(0,0,0,0.7)] backdrop-blur-md transition-all duration-200 z-40 ${
          isOpen
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-1 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold shrink-0 text-xs">
            Tip:
          </span>
          <p className="text-[11px] font-sans text-slate-200 leading-snug">
            Workspace crowded? Right-click any block and select <span className="text-cyan-300 font-semibold font-mono">"Collapse Block"</span> to minimize it.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EarthLevel2Simulation({
  sectionIndex = 0,
  activeTab = 'tab1',
  tab1Validation,
  tab2Validation,
  section1Validation,
  section2Validation,
  isRunning = false,
  resetKey,
  onSimulationComplete,
  onAdvanceSection,
  onSelectPlanet,
  onSelectFolder,
}: EarthLevel2SimulationProps) {
  const isSection1 = activeTab === 'tab1';
  const s1Val = section1Validation || tab1Validation;
  const s2Val = section2Validation || tab2Validation;

  // Active planet viewed on monitor
  const [selectedPlanetName, setSelectedPlanetName] = useState<string>('Mercury');

  // Track scanning animation states
  const [isSequentialScanning, setIsSequentialScanning] = useState<boolean>(false);
  const [scanningPlanetIdx, setScanningPlanetIdx] = useState<number | null>(null);
  const [scanBeamProgress, setScanBeamProgress] = useState<number>(0);
  // Only populated during simulation scan
  const [verifiedPlanets, setVerifiedPlanets] = useState<Record<string, boolean>>({});

  // Cancellation and timer tracking refs for clean simulation reset
  const isCancelledRef = useRef<boolean>(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllScanTimers = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
  };

  // Handle resetKey from parent (Reset Button / Stop Simulation)
  useEffect(() => {
    if (resetKey === undefined || resetKey === 0) return;
    isCancelledRef.current = true;
    clearAllScanTimers();
    clearAllOrbitTimers();
    setIsSequentialScanning(false);
    setScanningPlanetIdx(null);
    setScanBeamProgress(0);
    setVerifiedPlanets({});
    setSelectedPlanetName('Mercury');
    setEvaluatingOrbitIdx(null);
    setOrbitValidationResults({});
  }, [resetKey]);

  // Reset verification results whenever workspace blocks are modified outside simulation
  useEffect(() => {
    if (!isRunning && !isSequentialScanning) {
      setVerifiedPlanets({});
    }
  }, [s1Val?.planetResults, isRunning, isSequentialScanning]);

  // Audio synthesizer via Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null);
  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playSweep = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.35);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  };

  const playChime = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.15, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.3);
    });
  };

  const playBuzz = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  };

  // ---------------------------------------------------------------------------
  // SECTION 1: SEQUENTIAL SCANNER RUNTIME
  // Only scans planets that have blocks placed in the workspace
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isRunning || !isSection1) {
      isCancelledRef.current = true;
      clearAllScanTimers();
      if (!isRunning) {
        setIsSequentialScanning(false);
        setScanningPlanetIdx(null);
        setScanBeamProgress(0);
      }
      return;
    }

    isCancelledRef.current = false;
    clearAllScanTimers();

    // Build list of planets that actually have blocks in the workspace
    const planetsToScan = EARTH_2_PLANETS.filter((p) => {
      const res = s1Val?.planetResults?.[p.name];
      return res?.hasBlock;
    });

    if (planetsToScan.length === 0) {
      onSimulationComplete?.(false, 'No planet blocks found! Drag out a Planet dictionary block first.');
      return;
    }

    setIsSequentialScanning(true);
    let pIdx = 0;
    const newVerifiedMap: Record<string, boolean> = {};
    let firstFailedPlanet: string | null = null;

    const scanSinglePlanet = (index: number) => {
      if (isCancelledRef.current) return;

      if (index >= planetsToScan.length) {
        // Complete full scan sequence
        setIsSequentialScanning(false);
        setScanningPlanetIdx(null);
        setScanBeamProgress(0);

        const totalPassed = Object.values(newVerifiedMap).filter(Boolean).length;
        if (totalPassed === EARTH_2_PLANETS.length) {
          playChime();
          onSimulationComplete?.(
            true,
            `All ${EARTH_2_PLANETS.length} planet profiles verified! You can proceed to Section 2.`
          );
        } else {
          if (firstFailedPlanet) {
            setSelectedPlanetName(firstFailedPlanet);
          }
          const missing = EARTH_2_PLANETS.length - planetsToScan.length;
          const failMsg = missing > 0
            ? `Scanned ${planetsToScan.length} of ${EARTH_2_PLANETS.length} planets (${missing} missing blocks). ${totalPassed} verified.`
            : `Scan complete: ${totalPassed} / ${EARTH_2_PLANETS.length} verified. Check the highlighted card!`;
          onSimulationComplete?.(false, failMsg);
        }
        return;
      }

      const planet = planetsToScan[index];
      const globalIdx = EARTH_2_PLANETS.findIndex((p) => p.name === planet.name);
      setSelectedPlanetName(planet.name);
      setScanningPlanetIdx(globalIdx);
      setScanBeamProgress(0);
      playSweep();

      // Animate laser sweep down the card (slower, more satisfying)
      const startTime = Date.now();
      const sweepDuration = 800; // ms — slow enough to feel like a real scan

      scanIntervalRef.current = setInterval(() => {
        if (isCancelledRef.current) {
          clearAllScanTimers();
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, Math.floor((elapsed / sweepDuration) * 100));
        setScanBeamProgress(progress);

        if (elapsed >= sweepDuration) {
          if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
          }

          if (isCancelledRef.current) return;

          // Evaluate this planet's result from current workspace validation
          const res = s1Val?.planetResults?.[planet.name];
          const isPassed = !!res?.isValidated;

          if (isPassed) {
            newVerifiedMap[planet.name] = true;
            setVerifiedPlanets({ ...newVerifiedMap });
            playChime();
          } else {
            newVerifiedMap[planet.name] = false;
            setVerifiedPlanets({ ...newVerifiedMap });
            playBuzz();
            if (!firstFailedPlanet) {
              firstFailedPlanet = planet.name;
            }
          }

          // Pause between planets for breathing room
          scanTimeoutRef.current = setTimeout(() => {
            if (isCancelledRef.current) return;
            pIdx++;
            scanSinglePlanet(pIdx);
          }, 600);
        }
      }, 25);
    };

    scanSinglePlanet(0);

    return () => {
      isCancelledRef.current = true;
      clearAllScanTimers();
    };
  }, [isRunning, isSection1]);


  const activeSpec =
    EARTH_2_PLANETS.find(
      (p) => p.name.toLowerCase() === selectedPlanetName.toLowerCase()
    ) || EARTH_2_PLANETS[0];

  const currentResult = s1Val?.planetResults?.[activeSpec.name];
  const isCurrentVerified = verifiedPlanets[activeSpec.name] === true;
  const isCurrentFailed = verifiedPlanets[activeSpec.name] === false;
  const hasBeenScanned = verifiedPlanets[activeSpec.name] !== undefined;
  const isBeingScanned = scanningPlanetIdx !== null && EARTH_2_PLANETS[scanningPlanetIdx]?.name === activeSpec.name;

  // Manual folder switch (only allowed when NOT running / sequential scanning)
  // Folders are locked until a block for that planet exists in the workspace
  const handleSelectPlanet = (planet: PlanetProfileSpec) => {
    if (isSequentialScanning) return; // Prevent switching during scan animation
    setSelectedPlanetName(planet.name);
    onSelectFolder?.(planet.name);
  };

  // Determine which planets have blocks placed in the workspace
  const planetsWithBlocks = new Set<string>();
  if (s1Val?.planetResults) {
    Object.entries(s1Val.planetResults).forEach(([name, result]) => {
      if (result.hasBlock) {
        planetsWithBlocks.add(name);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // TAB 2: PLANETARY ORBITS MINIGAME STATE & RUNTIME
  // ---------------------------------------------------------------------------
  const [evaluatingOrbitIdx, setEvaluatingOrbitIdx] = useState<number | null>(null);
  const [orbitValidationResults, setOrbitValidationResults] = useState<Record<number, boolean>>({});
  const orbitTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllOrbitTimers = () => {
    orbitTimersRef.current.forEach((t) => clearTimeout(t));
    orbitTimersRef.current = [];
  };

  const EXPECTED_ORBITS = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn'];

  const s2ValRef = useRef(s2Val);
  s2ValRef.current = s2Val;

  // Handle Tab 2 simulation run: validate orbits 1 by 1 with 1-second interval as planets rotate
  useEffect(() => {
    if (isSection1 || !isRunning) {
      clearAllOrbitTimers();
      setEvaluatingOrbitIdx(null);
      if (!isRunning) {
        setOrbitValidationResults({});
      }
      return;
    }

    isCancelledRef.current = false;
    clearAllOrbitTimers();
    setOrbitValidationResults({});
    setEvaluatingOrbitIdx(null);

    // Snapshot orbits at the exact moment simulation starts running
    const currentOrbits = [...(s2ValRef.current?.orbits || [])];
    const checkResults: Record<number, boolean> = {};

    EXPECTED_ORBITS.forEach((expectedPlanet, orbitIdx) => {
      // Step 1: Scan phase (sonar sweep & cyan highlight)
      const scanTimer = setTimeout(() => {
        if (isCancelledRef.current) return;
        setEvaluatingOrbitIdx(orbitIdx);
        playSweep();
      }, orbitIdx * 1000);
      orbitTimersRef.current.push(scanTimer);

      // Step 2: Validate phase at +700ms (turns green or red, chime/buzz)
      const evalTimer = setTimeout(() => {
        if (isCancelledRef.current) return;
        const placed = currentOrbits[orbitIdx];
        const isMatch = !!placed && placed.toLowerCase() === expectedPlanet.toLowerCase();
        checkResults[orbitIdx] = isMatch;
        setOrbitValidationResults((prev) => ({ ...prev, [orbitIdx]: isMatch }));

        if (isMatch) {
          playChime();
        } else {
          playBuzz();
        }

        // Final check after 6th orbit
        if (orbitIdx === EXPECTED_ORBITS.length - 1) {
          const finalTimer = setTimeout(() => {
            if (isCancelledRef.current) return;
            setEvaluatingOrbitIdx(null);

            const allCorrect = EXPECTED_ORBITS.every((_, idx) => checkResults[idx] === true);
            if (allCorrect) {
              playChime();
              onSimulationComplete?.(
                true,
                'All 6 planetary orbits aligned and verified in the solar system!'
              );
            } else {
              onSimulationComplete?.(
                false,
                'Orbit alignment failed. Check the orbits highlighted in red and arrange in order: Mercury, Venus, Earth, Mars, Jupiter, Saturn.'
              );
            }
          }, 800);
          orbitTimersRef.current.push(finalTimer);
        }
      }, orbitIdx * 1000 + 700);
      orbitTimersRef.current.push(evalTimer);
    });

    return () => {
      isCancelledRef.current = true;
      clearAllOrbitTimers();
    };
  }, [isRunning, isSection1]);

  // ---------------------------------------------------------------------------
  // RENDER: SECTION 1 (PLANETARY DOSSIER & SCANNER)
  // ---------------------------------------------------------------------------
  if (isSection1) {
    const totalVerifiedCount = Object.values(verifiedPlanets).filter(Boolean).length;
    const isAllSection1Done = totalVerifiedCount === EARTH_2_PLANETS.length;

    return (
      <div className="w-full h-full flex flex-col bg-[#070b14] text-slate-100 select-none overflow-hidden relative font-mono">
        {/* Subtle Radar Background Grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Clean Top Header Bar */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-[#0b101b] border-b border-cyan-500/20 z-10">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-cyan-400" />
            <span className="text-xs font-bold text-slate-300 tracking-wider font-mono">
              PLANET PROFILES
            </span>
          </div>

          {/* Progress Status Dots */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              {EARTH_2_PLANETS.map((p) => {
                const isDone = !!verifiedPlanets[p.name];
                return (
                  <div
                    key={p.id}
                    title={`${p.name}: ${isDone ? 'Verified' : 'Pending'}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      isDone
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                        : 'bg-slate-700/80 border border-white/10'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {totalVerifiedCount} / {EARTH_2_PLANETS.length} Verified
            </span>
          </div>
        </div>

        {/* Center: Authentic Employee ID / Planetary Dossier Profile Card */}
        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 sm:p-4 overflow-y-auto scrollbar-none">
          <div
            className={`w-full max-w-[360px] rounded-2xl border-2 shadow-2xl relative flex flex-col overflow-hidden transition-colors duration-200 my-auto ${
              isCurrentVerified
                ? 'bg-[#0a1824] border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.3)]'
                : isCurrentFailed
                ? 'bg-[#180a0f] border-red-500/80 shadow-[0_0_35px_rgba(239,68,68,0.3)]'
                : isBeingScanned
                ? 'bg-[#0f172a] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]'
                : 'bg-[#0b1222]'
            }`}
            style={
              !isCurrentVerified && !isCurrentFailed && !isBeingScanned
                ? {
                    borderColor: `${activeSpec.color}90`,
                    boxShadow: `0 0 30px ${activeSpec.color}25`,
                  }
                : undefined
            }
          >
            {/* Laser Scanner Sweep Beam */}
            {isBeingScanned && (
              <div
                className="absolute left-0 right-0 h-1 bg-cyan-300 shadow-[0_0_15px_#22d3ee,0_0_30px_#22d3ee] pointer-events-none z-30 transition-all duration-75"
                style={{ top: `${scanBeamProgress}%` }}
              >
                <div className="w-full h-10 -translate-y-5 bg-gradient-to-b from-cyan-400/25 to-transparent" />
              </div>
            )}

            {/* Top ID Card Lanyard Hole & Chip Bar */}
            <div
              className="px-3.5 pt-2 pb-1.5 flex items-center justify-between border-b transition-colors duration-200 shrink-0"
              style={{
                borderColor: `${activeSpec.color}35`,
                backgroundColor: `${activeSpec.color}12`,
              }}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold" style={{ color: activeSpec.color }}>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: activeSpec.color,
                    boxShadow: `0 0 6px ${activeSpec.color}`,
                  }}
                />
                <span>{activeSpec.sector}</span>
              </div>

              {/* Status Stamp Badge */}
              <div
                className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 transition-all ${
                  isCurrentVerified
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-sm'
                    : isCurrentFailed
                    ? 'bg-red-950/80 border-red-500 text-red-300'
                    : 'bg-black/50 border-white/10 text-gray-400'
                }`}
              >
                {isCurrentVerified ? (
                  <>
                    <ShieldCheck size={11} className="text-emerald-400" />
                    <span>VERIFIED</span>
                  </>
                ) : isCurrentFailed ? (
                  <span>NOT VERIFIED</span>
                ) : (
                  <span>UNVERIFIED</span>
                )}
              </div>
            </div>

            {/* Card Upper: Big Planet SVG Avatar & Title */}
            <div className="px-3.5 py-2.5 flex items-center gap-3 bg-gradient-to-b from-white/5 to-transparent">
              {/* Actual High-Res Celestial Planet SVG Icon */}
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/40 border-2 p-2 flex items-center justify-center shrink-0 shadow-inner relative group transition-all duration-300"
                style={{
                  borderColor: `${activeSpec.color}70`,
                  boxShadow: `0 0 16px ${activeSpec.color}25`,
                }}
              >
                <img
                  src={activeSpec.iconUrl}
                  alt={activeSpec.name}
                  className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.4)] transition-transform duration-300"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider font-mono">
                  Planetary Record
                </span>
                <h2 className="text-lg font-black text-white tracking-wider font-mono uppercase leading-tight">
                  {activeSpec.name}
                </h2>
                <span
                  className="text-[11px] font-sans font-medium transition-colors duration-300"
                  style={{ color: activeSpec.color }}
                >
                  {activeSpec.badge}
                </span>
                <p className="text-[10px] sm:text-[11px] text-slate-300 font-sans mt-0.5 leading-snug">
                  {activeSpec.description}
                </p>
              </div>
            </div>

            {/* Card Middle: Structured Dossier Data Fields */}
            <div className="px-3.5 py-2 flex flex-col gap-1.5">
              {/* Field 1: Type */}
              <div className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-black/40 border border-white/10 text-xs">
                <span className="text-[11px] font-bold text-gray-400 font-mono">"type"</span>
                <span
                  className={`font-bold font-mono px-2 py-0.5 rounded text-xs border ${
                    !currentResult?.inputType
                      ? 'text-gray-500 italic border-transparent'
                      : hasBeenScanned
                      ? currentResult.isTypeCorrect
                        ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/30'
                        : 'text-red-300 bg-red-950/80 border-red-500/30'
                      : 'text-cyan-300 bg-cyan-950/40 border-cyan-800/40'
                  }`}
                >
                  {currentResult?.inputType ? `"${currentResult.inputType}"` : '— Empty —'}
                </span>
              </div>

              {/* Field 2: Features */}
              <div className="flex items-center justify-between p-1.5 px-2.5 rounded-lg bg-black/40 border border-white/10 text-xs">
                <span className="text-[11px] font-bold text-gray-400 font-mono">"features"</span>
                <span
                  className={`font-bold font-mono px-2 py-0.5 rounded text-xs border ${
                    !currentResult?.inputFeatures && !currentResult?.inputKnownFor
                      ? 'text-gray-500 italic border-transparent'
                      : hasBeenScanned
                      ? currentResult.isFeaturesCorrect || currentResult.isKnownForCorrect
                        ? 'text-emerald-300 bg-emerald-950/80 border-emerald-500/30'
                        : 'text-red-300 bg-red-950/80 border-red-500/30'
                      : 'text-cyan-300 bg-cyan-950/40 border-cyan-800/40'
                  }`}
                >
                  {(currentResult?.inputFeatures || currentResult?.inputKnownFor)
                    ? `"${currentResult.inputFeatures || currentResult.inputKnownFor}"`
                    : '— Empty —'}
                </span>
              </div>
            </div>
          </div>

          {/* Workspace Hint (Bottom Left of Simulation, strictly hidden while running/scanning) */}
          {!(isRunning || isSequentialScanning) && <WorkspaceHint />}
        </div>

        {/* Planet Folders at Bottom (Locked During Sequential Scanning) */}
        <div className="shrink-0 p-3 bg-[#0b101b] border-t border-cyan-500/20 z-10 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              Planet Folders:
            </span>
            <span className="text-[10px] text-gray-500 font-sans">
              {isSequentialScanning
                ? 'Scanning in progress... Please wait.'
                : `(Place a planet block to unlock its folder)`}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1 sm:gap-1.5 w-full">
            {EARTH_2_PLANETS.map((planet) => {
              const isSelected = selectedPlanetName.toLowerCase() === planet.name.toLowerCase();
              const isDone = verifiedPlanets[planet.name] === true;
              const isFailed = verifiedPlanets[planet.name] === false;
              const hasBlock = planetsWithBlocks.has(planet.name);
              const isLocked = !hasBlock && !isDone;

              return (
                <button
                  key={planet.id}
                  type="button"
                  disabled={isSequentialScanning || isLocked}
                  onClick={() => handleSelectPlanet(planet)}
                  title={isLocked ? `Locked — Place a "${planet.name}" dictionary block to unlock` : planet.name}
                  className={`w-full min-w-0 flex items-center justify-center gap-1 px-1 sm:px-1.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all border font-mono ${
                    isLocked
                      ? 'opacity-40 cursor-not-allowed border-white/5 bg-black/30 text-gray-600'
                      : isSequentialScanning
                      ? 'opacity-60 cursor-not-allowed border-white/5 bg-black/20 text-gray-500'
                      : isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)] cursor-pointer'
                      : isDone
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 cursor-pointer'
                      : isFailed
                      ? 'bg-red-950/60 border-red-500/40 text-red-300 cursor-pointer'
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-gray-200 hover:bg-white/5 cursor-pointer'
                  }`}
                >
                  {isLocked ? (
                    <Lock size={11} className="text-gray-600 shrink-0" />
                  ) : (
                    <Folder
                      size={12}
                      className={`shrink-0 ${
                        isDone
                          ? 'text-emerald-400 fill-emerald-400/20'
                          : isFailed
                          ? 'text-red-400 fill-red-400/20'
                          : 'text-gray-400'
                      }`}
                    />
                  )}
                  <span className="truncate">{planet.name}</span>
                  {isDone && <Check size={11} className="text-emerald-400 stroke-[3] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: TAB 2 (PLANETARY ORBITS MINIGAME - PYTHON LISTS)
  // ---------------------------------------------------------------------------
  const ORBIT_CONFIGS = [
    { num: 1, expected: 'Mercury', diameter: 110, bodySize: 20, ringWidth: 20, spinSpeed: 10, baseAngle: 45, color: '#94A3B8' },
    { num: 2, expected: 'Venus', diameter: 170, bodySize: 28, ringWidth: 28, spinSpeed: 14, baseAngle: 130, color: '#EC4899' },
    { num: 3, expected: 'Earth', diameter: 230, bodySize: 30, ringWidth: 30, spinSpeed: 18, baseAngle: 215, color: '#06B6D4' },
    { num: 4, expected: 'Mars', diameter: 290, bodySize: 24, ringWidth: 24, spinSpeed: 22, baseAngle: 300, color: '#EF4444' },
    { num: 5, expected: 'Jupiter', diameter: 360, bodySize: 48, ringWidth: 48, spinSpeed: 26, baseAngle: 25, color: '#F59E0B' },
    { num: 6, expected: 'Saturn', diameter: 440, bodySize: 38, ringWidth: 62, spinSpeed: 30, baseAngle: 170, color: '#EAB308' },
  ];

  const liveCorrectCount = EXPECTED_ORBITS.filter((exp, idx) => s2Val?.orbits?.[idx]?.toLowerCase() === exp.toLowerCase()).length;
  const totalAlignedCount = isRunning ? Object.values(orbitValidationResults).filter(Boolean).length : liveCorrectCount;

  return (
    <div className="w-full h-full flex flex-col bg-[#02040a] text-slate-100 select-none overflow-hidden relative font-mono">
      {/* Global CSS Keyframes for synchronized orbit revolving and upright counter-rotation */}
      <style>{`
        @keyframes orbitSpinCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbitSpinCCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      `}</style>
      {/* Deep Space Background: Layered Cosmic Starfield & Nebulae */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#020409]">
        {/* Colorful Space Nebulae */}
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-purple-900/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full bg-blue-900/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        {/* Scattered Space Stars */}
        <svg className="w-full h-full absolute inset-0 opacity-85" xmlns="http://www.w3.org/2000/svg">
          {[
            [10, 15, 1, 0.6], [24, 7, 1.5, 0.9], [38, 20, 1, 0.4], [58, 10, 2, 0.95], [76, 17, 1, 0.6], [88, 6, 1.5, 0.8],
            [6, 42, 1, 0.5], [20, 52, 2, 0.85], [14, 72, 1, 0.5], [26, 86, 1.5, 0.8], [34, 94, 1, 0.4],
            [92, 40, 1.5, 0.8], [84, 60, 1, 0.5], [74, 76, 2, 0.95], [89, 84, 1, 0.7], [66, 90, 1.5, 0.8],
            [4, 86, 1, 0.5], [46, 7, 1.5, 0.8], [50, 92, 1, 0.6], [80, 33, 1, 0.5], [16, 30, 1.5, 0.7],
            [68, 46, 1, 0.4], [28, 66, 1, 0.5], [82, 50, 1.5, 0.8], [94, 20, 1, 0.6], [2, 26, 1.5, 0.8],
            [43, 83, 1, 0.5], [60, 80, 1.5, 0.9], [8, 60, 1, 0.6], [92, 66, 1, 0.5], [36, 40, 1, 0.3],
            [63, 28, 1.5, 0.8], [70, 14, 1, 0.7], [26, 36, 1, 0.4], [56, 63, 1, 0.5], [80, 88, 1.5, 0.7],
          ].map(([x, y, r, o], i) => (
            <circle key={`star-${i}`} cx={`${x}%`} cy={`${y}%`} r={r} fill="#ffffff" opacity={o} />
          ))}
          {/* Subtle Twinkle Glints */}
          {[
            [14, 18, '#67e8f9'], [84, 14, '#fde047'], [11, 78, '#c084fc'], [86, 73, '#60a5fa']
          ].map(([x, y, col], i) => (
            <g key={`glint-${i}`} transform={`translate(${(x as number) * 4.5}, ${(y as number) * 4.5})`} opacity="0.85">
              <circle cx="0" cy="0" r="1.5" fill={col as string} />
              <line x1="-5" y1="0" x2="5" y2="0" stroke={col as string} strokeWidth="0.5" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke={col as string} strokeWidth="0.5" />
            </g>
          ))}
        </svg>
      </div>

      {/* Clean Top Header Bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-[#030712]/90 border-b border-white/10 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Globe size={15} className="text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 tracking-wider">
            ORBITS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono transition-colors ${
              totalAlignedCount === 6
                ? 'bg-emerald-950/80 border border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                : 'bg-black/60 border border-white/10 text-slate-300'
            }`}
          >
            {totalAlignedCount} / 6 Aligned
          </span>
        </div>
      </div>

      {/* Center: Solar System Canvas with Concentric Orbits & Center Sun */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-3 overflow-hidden">
        <div className="relative w-[450px] h-[450px] sm:w-[470px] sm:h-[470px] flex items-center justify-center">
          {/* Central Sun: 64px, Luminous Solid Star (no emoji dot, no pulsing opacity) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center pointer-events-none select-none">
            <div
              className="w-16 h-16 rounded-full border-2 border-amber-100/90 relative flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #fffbeb 15%, #fde047 35%, #f59e0b 65%, #ea580c 85%, #c2410c 100%)',
                boxShadow: '0 0 25px #f59e0b, 0 0 50px rgba(245, 158, 11, 0.6), 0 0 85px rgba(234, 88, 12, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.6)',
              }}
            >
              <div className="w-10 h-10 rounded-full bg-white/20 blur-sm pointer-events-none" />
            </div>
            <span className="text-[9px] font-black uppercase text-amber-300 tracking-widest mt-1 drop-shadow-[0_0_8px_#f59e0b] font-mono">
              SUN
            </span>
          </div>

          {/* 6 Concentric Orbit Rings */}
          {ORBIT_CONFIGS.map((cfg, idx) => {
            const placedPlanetName = s2Val?.orbits?.[idx] || null;
            const placedSpec = placedPlanetName
              ? EARTH_2_PLANETS.find((p) => p.name.toLowerCase() === placedPlanetName.toLowerCase())
              : null;

            const isEvaluated = orbitValidationResults[idx] !== undefined;
            const isCorrect = orbitValidationResults[idx] === true;
            const isWrong = orbitValidationResults[idx] === false;
            const isEvaluating = evaluatingOrbitIdx === idx;

            return (
              <div
                key={cfg.num}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-300 ${
                  isCorrect
                    ? 'border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8),inset_0_0_12px_rgba(52,211,153,0.2)] bg-emerald-500/5'
                    : isWrong
                    ? 'border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8),inset_0_0_12px_rgba(239,68,68,0.2)] bg-red-500/10'
                    : isEvaluating
                    ? 'border-2 border-cyan-300 shadow-[0_0_22px_#22d3ee,inset_0_0_12px_rgba(34,211,238,0.3)] animate-pulse'
                    : 'border border-white/15'
                }`}
                style={{
                  width: `${cfg.diameter}px`,
                  height: `${cfg.diameter}px`,
                  zIndex: 10 - idx,
                }}
              >
                {/* Orbit Index Label on Left Ring Edge */}
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 font-mono select-none px-1 py-0.5 rounded bg-black/50">
                  {cfg.num}
                </div>

                {/* Static Orientation Wrapper for base angle */}
                <div
                  className="w-full h-full relative"
                  style={{
                    transform: `rotate(${cfg.baseAngle}deg)`,
                  }}
                >
                  {/* Revolving Orbit Plane (Spins clockwise when isRunning is true) */}
                  <div
                    className="w-full h-full relative"
                    style={{
                      animation: isRunning ? `orbitSpinCW ${cfg.spinSpeed}s linear infinite` : undefined,
                    }}
                  >
                    {/* Planet Item Mounted on Orbit Perimeter (Stationary counter-angle) */}
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center group cursor-default"
                      style={{
                        transform: `rotate(-${cfg.baseAngle}deg)`,
                      }}
                    >
                      {/* Counter-Spin Wrapper: perfectly counter-rotates counter-clockwise so tags/icons remain 100% horizontal */}
                      <div
                        style={{
                          animation: isRunning ? `orbitSpinCCW ${cfg.spinSpeed}s linear infinite` : undefined,
                        }}
                        className="flex flex-col items-center relative"
                      >
                        {placedPlanetName ? (
                          <div className="flex flex-col items-center relative">
                            {/* Hovering Planet Name Tag: Always horizontal & readable */}
                            <div
                              className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide whitespace-nowrap shadow-xl pointer-events-none border transition-all duration-200 z-30 ${
                                isCorrect
                                  ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                                  : isWrong
                                  ? 'bg-red-950/95 border-red-500 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                                  : 'bg-[#070e1c]/95 border-white/25 text-white shadow-[0_2px_10px_rgba(0,0,0,0.8)]'
                              }`}
                            >
                              {placedPlanetName}
                            </div>

                        {/* Planet Celestial Sphere / Icon */}
                        {(() => {
                          const PLANET_NATURAL_DIMS: Record<string, { w: number; h: number }> = {
                            mercury: { w: 20, h: 20 },
                            venus: { w: 28, h: 28 },
                            earth: { w: 30, h: 30 },
                            mars: { w: 24, h: 24 },
                            jupiter: { w: 48, h: 48 },
                            saturn: { w: 62, h: 38 },
                          };
                          const pDims = placedPlanetName && PLANET_NATURAL_DIMS[placedPlanetName.toLowerCase()]
                            ? PLANET_NATURAL_DIMS[placedPlanetName.toLowerCase()]
                            : { w: cfg.ringWidth, h: cfg.bodySize };
                          return (
                            <div
                              className={`rounded-full flex items-center justify-center relative shadow-lg transition-transform ${
                                isCorrect
                                  ? 'ring-2 ring-emerald-400 shadow-[0_0_16px_#34d399]'
                                  : isWrong
                                  ? 'ring-2 ring-red-500 shadow-[0_0_16px_#ef4444]'
                                  : 'shadow-md'
                              }`}
                              style={{
                                width: `${pDims.w}px`,
                                height: `${pDims.h}px`,
                                filter: !isCorrect && !isWrong && placedSpec ? `drop-shadow(0 0 6px ${placedSpec.color}70)` : undefined,
                              }}
                            >
                              {placedSpec?.iconUrl ? (
                                <img
                                  src={placedSpec.iconUrl}
                                  alt={placedPlanetName}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div
                                  className="w-full h-full rounded-full flex items-center justify-center font-bold text-white text-xs"
                                  style={{ backgroundColor: placedSpec?.color || '#38bdf8' }}
                                >
                                  {placedPlanetName[0]}
                                </div>
                              )}

                              {/* Verification Icon Badge */}
                              {isCorrect && (
                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow">
                                  <Check size={10} className="stroke-[3]" />
                                </div>
                              )}
                              {isWrong && (
                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center text-white shadow">
                                  <AlertTriangle size={10} className="stroke-[3]" />
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      /* Empty Orbit Slot Indicator: clear, distinct 28px dashed circle with legible number */
                      <div className="w-7 h-7 rounded-full border border-dashed border-cyan-400/40 bg-cyan-950/40 flex items-center justify-center text-xs font-bold font-mono text-cyan-200/90 shadow-[0_0_12px_rgba(6,182,212,0.25)] select-none">
                        {cfg.num}
                      </div>
                    )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
