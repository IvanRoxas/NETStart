"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Radio, CheckCircle2, Monitor } from "lucide-react";
import type { VenusLevel2Validation } from "@/lib/venus/venusLevel2Definitions";

interface AppliedRules {
  display: string;
  justifyContent: string;
  alignItems: string;
  hasContainer: boolean;
  hasDisplay?: boolean;
  hasJustify?: boolean;
  hasAlign?: boolean;
}

const DEFAULT_RULES_BY_PANEL: Record<1 | 2 | 3 | 4 | 5, AppliedRules> = {
  1: { display: "none", justifyContent: "flex-start", alignItems: "flex-start", hasContainer: false, hasDisplay: false, hasJustify: false, hasAlign: false },
  2: { display: "none", justifyContent: "flex-start", alignItems: "flex-start", hasContainer: false, hasDisplay: false, hasJustify: false, hasAlign: false },
  3: { display: "none", justifyContent: "flex-start", alignItems: "flex-start", hasContainer: false, hasDisplay: false, hasJustify: false, hasAlign: false },
  4: { display: "none", justifyContent: "flex-start", alignItems: "flex-start", hasContainer: false, hasDisplay: false, hasJustify: false, hasAlign: false },
  5: { display: "none", justifyContent: "flex-start", alignItems: "flex-start", hasContainer: false, hasDisplay: false, hasJustify: false, hasAlign: false },
};

interface VenusLevel2LabProps {
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
  onPanelSolved?: (panelIndex: number) => void;
  isRunning?: boolean;
  validation?: VenusLevel2Validation;
  activePanel?: 1 | 2 | 3 | 4 | 5;
  setActivePanel?: (panelNum: 1 | 2 | 3 | 4 | 5) => void;
  solvedPanels?: { 1: boolean; 2: boolean; 3: boolean; 4: boolean; 5: boolean };
}

export default function VenusLevel2Lab({
  onSimulationComplete,
  onPanelSolved,
  isRunning = false,
  validation,
  activePanel: activePanelProp,
  setActivePanel: setActivePanelProp,
  solvedPanels: solvedPanelsProp,
}: VenusLevel2LabProps) {
  // Navigation Console State (5 Panels)
  const [localActivePanel, setLocalActivePanel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const activePanel = (activePanelProp ?? localActivePanel) as 1 | 2 | 3 | 4 | 5;

  const [localSolvedPanels, setLocalSolvedPanels] = useState<{
    1: boolean;
    2: boolean;
    3: boolean;
    4: boolean;
    5: boolean;
  }>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });
  const solvedPanels = solvedPanelsProp ?? localSolvedPanels;

  // Floating text visibility (dismissed upon first user interaction)
  const [hasInteracted, setHasInteracted] = useState(false);

  // Current Applied CSS Rules per Panel
  const [panelRules, setPanelRules] = useState<Record<1 | 2 | 3 | 4 | 5, AppliedRules>>({
    1: { ...DEFAULT_RULES_BY_PANEL[1] },
    2: { ...DEFAULT_RULES_BY_PANEL[2] },
    3: { ...DEFAULT_RULES_BY_PANEL[3] },
    4: { ...DEFAULT_RULES_BY_PANEL[4] },
    5: { ...DEFAULT_RULES_BY_PANEL[5] },
  });

  // Simulation & Scanning States
  const [isSimulating, setIsSimulating] = useState(false);
  const [scanProgress, setScanProgress] = useState(0); // 0 to 100
  const [scanResult, setScanResult] = useState<"idle" | "success" | "fail">("idle");
  const [allPoweredUp, setAllPoweredUp] = useState(false);

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const victoryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentRules = panelRules[activePanel];
  const isCurrentSolved = solvedPanels[activePanel];

  useEffect(() => {
    const all5 = ([1, 2, 3, 4, 5] as const).every((num) => Boolean(solvedPanels[num]));
    if (all5) {
      setAllPoweredUp(true);
    }
  }, [solvedPanels]);

  // Synchronize CSS rules from Blockly workspace if blocks exist
  useEffect(() => {
    if (!validation) return;
    const p1 = validation.panel1;
    const p2 = validation.panel2;
    const p3 = validation.panel3;
    const p4 = validation.panel4;
    const p5 = validation.panel5;

    // Dismiss floating instruction if user added blocks
    if (p1.hasContainer || p2.hasContainer || p3.hasContainer || p4.hasContainer || p5.hasContainer) {
      setHasInteracted(true);
    }

    setPanelRules({
      1: {
        display: p1.hasContainer ? p1.display : "none",
        justifyContent: p1.hasContainer ? p1.justifyContent : "flex-start",
        alignItems: p1.hasContainer ? p1.alignItems : "flex-start",
        hasContainer: p1.hasContainer,
        hasDisplay: Boolean(p1.hasDisplay),
        hasJustify: Boolean(p1.hasJustify),
        hasAlign: Boolean(p1.hasAlign),
      },
      2: {
        display: p2.hasContainer ? p2.display : "none",
        justifyContent: p2.hasContainer ? p2.justifyContent : "flex-start",
        alignItems: p2.hasContainer ? p2.alignItems : "flex-start",
        hasContainer: p2.hasContainer,
        hasDisplay: Boolean(p2.hasDisplay),
        hasJustify: Boolean(p2.hasJustify),
        hasAlign: Boolean(p2.hasAlign),
      },
      3: {
        display: p3.hasContainer ? p3.display : "none",
        justifyContent: p3.hasContainer ? p3.justifyContent : "flex-start",
        alignItems: p3.hasContainer ? p3.alignItems : "flex-start",
        hasContainer: p3.hasContainer,
        hasDisplay: Boolean(p3.hasDisplay),
        hasJustify: Boolean(p3.hasJustify),
        hasAlign: Boolean(p3.hasAlign),
      },
      4: {
        display: p4.hasContainer ? p4.display : "none",
        justifyContent: p4.hasContainer ? p4.justifyContent : "flex-start",
        alignItems: p4.hasContainer ? p4.alignItems : "flex-start",
        hasContainer: p4.hasContainer,
        hasDisplay: Boolean(p4.hasDisplay),
        hasJustify: Boolean(p4.hasJustify),
        hasAlign: Boolean(p4.hasAlign),
      },
      5: {
        display: p5.hasContainer ? p5.display : "none",
        justifyContent: p5.hasContainer ? p5.justifyContent : "flex-start",
        alignItems: p5.hasContainer ? p5.alignItems : "flex-start",
        hasContainer: p5.hasContainer,
        hasDisplay: Boolean(p5.hasDisplay),
        hasJustify: Boolean(p5.hasJustify),
        hasAlign: Boolean(p5.hasAlign),
      },
    });
  }, [validation]);

  const solvedPanelsRef = useRef(solvedPanels);
  useEffect(() => {
    solvedPanelsRef.current = solvedPanels;
  }, [solvedPanels]);

  const [isSweeping, setIsSweeping] = useState(false);
  const isSweepingRef = useRef(false);
  const nextPanelTimerRef = useRef<NodeJS.Timeout | null>(null);

  const validationRef = useRef(validation);
  useEffect(() => {
    validationRef.current = validation;
  }, [validation]);

  const panelRulesRef = useRef(panelRules);
  useEffect(() => {
    panelRulesRef.current = panelRules;
  }, [panelRules]);

  const failedRulesSnapshotRef = useRef<string | null>(null);
  const runSweepOnPanelRef = useRef<(pNum: 1 | 2 | 3 | 4 | 5) => void>(() => {});

  // Switch panels (locked during simulation)
  const handleSelectPanel = (panelNum: 1 | 2 | 3 | 4 | 5) => {
    if (isSimulating || isRunning || isSweepingRef.current) return; // Prevent switching while simulation runs
    setHasInteracted(true);
    if (setActivePanelProp) {
      setActivePanelProp(panelNum);
    } else {
      setLocalActivePanel(panelNum);
    }
    setScanResult("idle");
    failedRulesSnapshotRef.current = null;
    setIsSimulating(false);
  };

  // Helper to check if a specific panel passes validation
  const checkPanelValid = useCallback((panelNum: 1 | 2 | 3 | 4 | 5) => {
    // If this panel was already marked solved, it always remains valid
    if (solvedPanelsRef.current[panelNum]) return true;

    const val = validationRef.current;
    if (val) {
      if (panelNum === 1) return Boolean(val.panel1?.isValid);
      if (panelNum === 2) return Boolean(val.panel2?.isValid);
      if (panelNum === 3) return Boolean(val.panel3?.isValid);
      if (panelNum === 4) return Boolean(val.panel4?.isValid);
      if (panelNum === 5) return Boolean(val.panel5?.isValid);
    }
    const rules = panelRulesRef.current[panelNum];
    if (!rules || !rules.hasContainer) return false;
    if (panelNum === 1) {
      return Boolean(rules.hasContainer && rules.hasDisplay && rules.display === "block" && rules.hasJustify && rules.justifyContent === "center");
    }
    if (panelNum === 2) {
      return Boolean(rules.hasContainer && rules.hasDisplay && rules.display === "flex" && rules.hasJustify && rules.justifyContent === "space-evenly" && rules.hasAlign && rules.alignItems === "flex-start");
    }
    if (panelNum === 3) {
      return Boolean(rules.hasContainer && rules.hasDisplay && rules.display === "flex" && rules.hasJustify && rules.justifyContent === "center" && rules.hasAlign && rules.alignItems === "center");
    }
    if (panelNum === 4) {
      return Boolean(rules.hasContainer && rules.hasDisplay && rules.display === "block" && rules.hasJustify && rules.justifyContent === "flex-end");
    }
    if (panelNum === 5) {
      return Boolean(rules.hasContainer && rules.hasDisplay && rules.display === "flex" && rules.hasJustify && rules.justifyContent === "space-evenly" && rules.hasAlign && rules.alignItems === "flex-end");
    }
    return false;
  }, []);

  // Main Multi-Panel Sweep Routine - Sweeps through the entire 5 panels sequentially
  const runSweepOnPanel = useCallback((pNum: 1 | 2 | 3 | 4 | 5) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (nextPanelTimerRef.current) clearTimeout(nextPanelTimerRef.current);

    if (setActivePanelProp) setActivePanelProp(pNum);
    else setLocalActivePanel(pNum);

    // Reset laser state and position to 0% (left side)
    setIsSimulating(false);
    setScanProgress(0);
    setScanResult("idle");
    startTimeRef.current = null;

    const sweepDuration = 1200;

    const step = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const p = Math.min(100, (elapsed / sweepDuration) * 100);
      setScanProgress(p);

      if (p < 100) {
        animRef.current = requestAnimationFrame(step);
      } else {
        const passed = checkPanelValid(pNum);

        if (!passed) {
          setScanResult("fail");
          setIsSimulating(false);
          isSweepingRef.current = false;
          setIsSweeping(false);
          failedRulesSnapshotRef.current = JSON.stringify(panelRulesRef.current[pNum]);
          onSimulationComplete?.(false, `Panel ${pNum} layout is incorrect. Check your Format and Alignment blocks!`);
          return;
        }

        // Current panel passed calibration!
        setScanResult("success");
        solvedPanelsRef.current[pNum] = true;
        setLocalSolvedPanels((prev) => ({ ...prev, [pNum]: true }));
        onPanelSolved?.(pNum);

        // Check if all 5 panels are solved now
        const all5Solved = ([1, 2, 3, 4, 5] as const).every(
          (num) => Boolean(solvedPanelsRef.current[num])
        );

        if (all5Solved) {
          setIsSimulating(false);
          isSweepingRef.current = false;
          setIsSweeping(false);
          setScanResult("success");
          setAllPoweredUp(true);
          // Stay on the current panel (e.g. Panel 5) and trigger level completion!
          victoryTimerRef.current = setTimeout(() => {
            onSimulationComplete?.(true);
          }, 800);
          return;
        }

        // Advance to next sequential panel if available
        if (pNum < 5) {
          const nextP = (pNum + 1) as 1 | 2 | 3 | 4 | 5;
          nextPanelTimerRef.current = setTimeout(() => {
            setIsSimulating(false);
            setScanProgress(0);
            if (solvedPanelsRef.current[nextP]) {
              // If next panel was already calibrated, continue sweeping
              runSweepOnPanelRef.current(nextP);
            } else {
              // Pause sweep and switch view to next panel for user to configure
              isSweepingRef.current = false;
              setIsSweeping(false);
              if (setActivePanelProp) setActivePanelProp(nextP);
              else setLocalActivePanel(nextP);
            }
          }, 750);
        } else {
          // Reached panel 5 but some earlier panel was missing
          setIsSimulating(false);
          isSweepingRef.current = false;
          setIsSweeping(false);
          const firstUnsolved = ([1, 2, 3, 4, 5] as const).find(
            (num) => !solvedPanelsRef.current[num]
          ) || 5;
          if (setActivePanelProp) setActivePanelProp(firstUnsolved);
          else setLocalActivePanel(firstUnsolved);
          setScanResult("fail");
          failedRulesSnapshotRef.current = JSON.stringify(panelRulesRef.current[firstUnsolved]);
          onSimulationComplete?.(false, "One or more panel layouts are incorrect.");
        }
      }
    };

    // Cleanly start laser beam on next paint frame so it always starts from 0% on the left side
    nextPanelTimerRef.current = setTimeout(() => {
      setIsSimulating(true);
      animRef.current = requestAnimationFrame(step);
    }, 100);
  }, [checkPanelValid, onPanelSolved, onSimulationComplete, setActivePanelProp]);

  useEffect(() => {
    runSweepOnPanelRef.current = runSweepOnPanel;
  }, [runSweepOnPanel]);

  // Synchronize with external isRunning prop from BlocklyMaze bottom bar
  useEffect(() => {
    if (isRunning && !isSweepingRef.current) {
      isSweepingRef.current = true;
      setIsSweeping(true);
      setHasInteracted(true);
      setScanResult("idle");
      failedRulesSnapshotRef.current = null;
      // Start sweeping from the panel currently open in the viewer!
      runSweepOnPanel(activePanel);
    } else if (!isRunning) {
      if (isSweepingRef.current) {
        // User manually stopped/reset the simulation while it was sweeping
        isSweepingRef.current = false;
        setIsSweeping(false);
        setIsSimulating(false);
        if (animRef.current) cancelAnimationFrame(animRef.current);
        if (nextPanelTimerRef.current) clearTimeout(nextPanelTimerRef.current);
        setScanResult("idle");
      }
    }
  }, [isRunning, runSweepOnPanel, activePanel]);

  // Clear failure state when user actually changes workspace blocks for the active panel
  useEffect(() => {
    if (scanResult === "fail" && failedRulesSnapshotRef.current) {
      const currentSnap = JSON.stringify(panelRules[activePanel]);
      if (currentSnap !== failedRulesSnapshotRef.current) {
        setScanResult("idle");
        failedRulesSnapshotRef.current = null;
      }
    }
  }, [panelRules, activePanel, scanResult]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (nextPanelTimerRef.current) clearTimeout(nextPanelTimerRef.current);
      if (victoryTimerRef.current) clearTimeout(victoryTimerRef.current);
    };
  }, []);

  const coreNames = ["Alpha", "Beta", "Gamma"];

  // Helper for computing active layout combination string displayed in top right of simulation screen
  const getStatusCssString = () => {
    if (!currentRules.hasContainer || currentRules.display === "none") {
      return "Uncalibrated";
    }

    const parts: string[] = [];

    // 1. Format (Side-by-Side vs Stacked)
    if (currentRules.hasDisplay) {
      if (currentRules.display === "block") {
        parts.push("Stacked");
      } else if (currentRules.display === "flex") {
        parts.push("Side-by-Side");
      }
    }

    // 2. Horizontal (Left to Right spacing)
    if (currentRules.hasJustify) {
      if (currentRules.justifyContent === "space-evenly") {
        parts.push("Spread Evenly");
      } else if (currentRules.justifyContent === "center") {
        parts.push("Center");
      } else if (currentRules.justifyContent === "flex-end") {
        parts.push("Align Right");
      } else if (currentRules.justifyContent === "flex-start") {
        parts.push("Align Left");
      }
    }

    // 3. Vertical (Up & Down position)
    if (currentRules.hasAlign) {
      if (currentRules.alignItems === "center") {
        parts.push("Center");
      } else if (currentRules.alignItems === "flex-start") {
        parts.push("Top");
      } else if (currentRules.alignItems === "flex-end") {
        parts.push("Bottom");
      }
    }

    const combination = parts.join(" • ");

    if (scanResult === "fail") {
      return combination ? `Incorrect • ${combination}` : "Incorrect Layout";
    }

    return combination || "Uncalibrated";
  };

  return (
    <div
      onClick={() => setHasInteracted(true)}
      className="relative w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 bg-[#070b14] text-slate-100 select-none overflow-hidden font-sans"
    >
      {/* Floating & Flickering Keyframes */}
      <style jsx>{`
        @keyframes subtleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes slowFlicker {
          0%, 100% {
            opacity: 0.95;
          }
          45% {
            opacity: 0.85;
          }
          50% {
            opacity: 0.4;
          }
          55% {
            opacity: 0.9;
          }
          85% {
            opacity: 0.65;
          }
        }
        .hover-float-flicker {
          animation: subtleFloat 3s ease-in-out infinite, slowFlicker 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* Background Ambience Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 1. THE MAIN VIEWPORT (THE GIANT SCREEN) */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-3xl flex-1 flex flex-col items-center justify-center min-h-0 my-auto">
        <div
          className={`relative w-full h-full max-h-[420px] rounded-3xl p-4 sm:p-6 flex flex-col justify-between overflow-hidden transition-all duration-500 border ${
            allPoweredUp || isCurrentSolved
              ? "bg-gradient-to-b from-[#061522] via-[#04101a] to-[#040a12] border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.35)]"
              : scanResult === "fail"
              ? "bg-gradient-to-b from-[#2e0813] via-[#1a040b] to-[#0c0205] border-rose-500 shadow-[0_0_55px_rgba(244,63,94,0.7)] ring-4 ring-rose-500/50"
              : "bg-[#09090b] border-zinc-700/80 shadow-2xl"
          }`}
          style={{
            filter:
              allPoweredUp || isCurrentSolved
                ? "none"
                : scanResult === "fail"
                ? "none"
                : "grayscale(100%) contrast(115%) brightness(95%)",
          }}
        >
          {/* Subtle Viewport Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(rgba(14, 165, 233, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.08) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Floating Flickering Instructions (Disappears once user interacts with simulation) */}
          {!hasInteracted && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none p-4">
              <div className="hover-float-flicker px-6 py-3.5 rounded-2xl bg-black/90 border border-white/30 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.85)] flex flex-col items-center gap-1.5 text-center transition-all">
                <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-zinc-100 uppercase">
                  Assemble layout blocks in workspace
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Click or drag blocks to begin
                </span>
              </div>
            </div>
          )}

          {/* Alarming Red Flash Overlay when calibration fails */}
          {scanResult === "fail" && (
            <div className="absolute inset-0 z-30 pointer-events-none bg-rose-600/25 border-4 border-rose-500/80 rounded-3xl animate-pulse" />
          )}

          {/* Viewport Top Bar */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-zinc-800 text-xs font-mono relative z-20">
            {/* Top Left: Active Target */}
            <div
              className={`flex items-center gap-1.5 font-bold font-mono transition-colors duration-500 ${
                isCurrentSolved ? "text-cyan-300" : scanResult === "fail" ? "text-rose-300" : "text-zinc-400"
              }`}
            >
              <Monitor size={14} className={isCurrentSolved ? "text-cyan-400" : scanResult === "fail" ? "text-rose-400" : "text-zinc-400"} />
              <span>#panel-{activePanel}</span>
            </div>

            {/* Top Right: Status Indicator */}
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-mono font-medium ${scanResult === "fail" ? "text-rose-300 font-bold" : "text-zinc-300"}`}>
                {getStatusCssString()}
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                  isCurrentSolved
                    ? "bg-emerald-400 shadow-[0_0_10px_#34d399]"
                    : isSimulating
                    ? "bg-white animate-ping"
                    : scanResult === "fail"
                    ? "bg-rose-500 shadow-[0_0_10px_#f43f5e] animate-ping"
                    : currentRules.hasContainer && currentRules.display !== "none"
                    ? "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]"
                    : "bg-zinc-600"
                }`}
              />
            </div>
          </div>

          {/* Core Simulation Field where Signal Cores Live */}
          <div className="relative flex-1 w-full rounded-2xl bg-black/60 border border-zinc-800/80 p-4 sm:p-6 overflow-hidden">
            {/* Scanlines Effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 2px)",
              }}
            />

            {/* Shared Playfield Stage - Blueprint & Cores share 100% identical coordinate bounds */}
            <div className="relative w-full h-full">
              {/* Faint Dotted Blueprint Outlines in Target Coordinates for each of the 5 Panels */}
              {!allPoweredUp && (
                <div
                  className={`absolute inset-0 pointer-events-none flex transition-all duration-500 ${
                    activePanel === 1
                      ? "flex-col items-center justify-center gap-3.5"
                      : activePanel === 4
                      ? "flex-col items-end justify-center gap-3.5 pr-6 sm:pr-10"
                      : activePanel === 2
                      ? "flex-row justify-evenly items-start"
                      : activePanel === 3
                      ? "flex-row justify-center items-center gap-4"
                      : "flex-row justify-evenly items-end pb-8"
                  }`}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-dotted flex items-center justify-center font-mono text-[10px] font-bold transition-all duration-500 ${
                        isCurrentSolved
                          ? "border-cyan-400/50 bg-cyan-950/20 text-cyan-300"
                          : "border-zinc-600 bg-zinc-900/30 text-zinc-500"
                      }`}
                    >
                      {coreNames[i]}
                    </div>
                  ))}
                </div>
              )}

              {/* The 3 Signal Cores Styled with Applied CSS */}
              <div
                className={`absolute inset-0 flex transition-all duration-500 ease-out ${
                  scanResult === "fail" ? "animate-[shake_0.4s_ease-in-out]" : ""
                } ${
                  isCurrentSolved
                    ? activePanel === 1
                      ? "flex-col items-center justify-center gap-3.5"
                      : activePanel === 4
                      ? "flex-col items-end justify-center gap-3.5 pr-6 sm:pr-10"
                      : activePanel === 2
                      ? "flex-row justify-evenly items-start"
                      : activePanel === 3
                      ? "flex-row justify-center items-center gap-4"
                      : "flex-row justify-evenly items-end pb-8"
                    : !currentRules.hasContainer || !currentRules.hasDisplay || currentRules.display === "none"
                    ? "flex-row items-start justify-start gap-2 pt-2 pl-2"
                    : currentRules.display === "block"
                    ? `flex-col gap-3.5 ${
                        currentRules.hasJustify && currentRules.justifyContent === "center"
                          ? "items-center"
                          : currentRules.hasJustify && currentRules.justifyContent === "flex-end"
                          ? "items-end pr-6 sm:pr-10"
                          : "items-start pl-6 sm:pl-10"
                      } ${
                        currentRules.alignItems === "flex-start" && currentRules.hasAlign
                          ? "justify-start pt-4"
                          : currentRules.alignItems === "flex-end" && currentRules.hasAlign
                          ? "justify-end pb-4"
                          : "justify-center"
                      }`
                    : "flex-row"
                }`}
                style={
                  !isCurrentSolved && currentRules.hasContainer && currentRules.hasDisplay && currentRules.display === "flex"
                    ? {
                        justifyContent: currentRules.hasJustify ? currentRules.justifyContent : "flex-start",
                        alignItems: currentRules.hasAlign ? currentRules.alignItems : "flex-start",
                        paddingBottom: activePanel === 5 ? "32px" : "0px",
                        gap:
                          currentRules.hasJustify && currentRules.justifyContent === "space-evenly"
                            ? "0px"
                            : "16px",
                      }
                    : undefined
                }
              >
                {coreNames.map((name) => (
                  <div
                    key={name}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center p-1 font-mono transition-all duration-500 shrink-0 ${
                      isCurrentSolved
                        ? "bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/50 border border-cyan-200"
                        : scanResult === "fail"
                        ? "bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-lg shadow-rose-500/50 border border-rose-300"
                        : "bg-gradient-to-tr from-zinc-300 to-zinc-100 text-zinc-950 shadow-md shadow-white/10 border border-white"
                    }`}
                  >
                    <Radio size={14} className="mb-0.5 opacity-90" />
                    <span className="text-[11px] font-bold uppercase tracking-tight">{name}</span>
                  </div>
                ))}
              </div>

              {/* Scanning Laser Beam */}
              {isSimulating && (
                <div
                  className="absolute top-0 bottom-0 pointer-events-none z-20 flex flex-col items-center"
                  style={{
                    left: `${scanProgress}%`,
                  }}
                >
                  <div
                    className={`w-1.5 h-full shadow-[0_0_15px_3px] ${
                      scanResult === "fail"
                        ? "bg-rose-400 shadow-rose-500"
                        : scanResult === "success"
                        ? "bg-emerald-400 shadow-emerald-500"
                        : "bg-cyan-300 shadow-cyan-400"
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Widget at the bottom-right of the black screen indicating Panel Stable */}
            {isCurrentSolved && (
              <div className="absolute bottom-2.5 right-3 z-30 pointer-events-none flex items-center">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-300 font-mono text-[11px] font-semibold tracking-wide backdrop-blur-md">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Panel Stable</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse shrink-0" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THE NAVIGATION CONSOLE (SUBLEVEL SELECTOR - 5 PANELS) */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-3xl px-2 sm:px-3.5 py-2 rounded-full bg-zinc-950/95 border border-zinc-800 shadow-xl flex items-center justify-center mt-3 overflow-hidden">
        <div className="w-full flex items-center justify-between sm:justify-center gap-1 sm:gap-2.5">
          {([1, 2, 3, 4, 5] as const).map((num) => {
            const isPanelDone = solvedPanels[num];
            const isActive = activePanel === num;
            const isLocked = isSimulating || isRunning || isSweeping;

            return (
              <button
                key={num}
                disabled={isLocked}
                onClick={() => handleSelectPanel(num)}
                className={`flex-1 sm:flex-initial min-w-0 max-w-[120px] px-2 sm:px-3.5 py-1.5 rounded-full font-mono text-[11px] sm:text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  isLocked
                    ? "cursor-not-allowed opacity-40"
                    : "cursor-pointer"
                } ${
                  // If solved: glow in vibrant emerald / cyan
                  isPanelDone
                    ? isActive
                      ? "bg-cyan-500 text-zinc-950 shadow-[0_0_16px_rgba(6,182,212,0.6)] border border-cyan-300"
                      : "bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-emerald-900/60"
                    // If NOT solved: pure black and white (monochrome)
                    : isActive
                    ? "bg-zinc-100 text-zinc-950 border border-white shadow-[0_0_14px_rgba(255,255,255,0.35)]"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-700/80 hover:text-zinc-200 hover:border-zinc-500"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 transition-all duration-300 ${
                    isPanelDone
                      ? isActive
                        ? "bg-emerald-900 shadow-[0_0_6px_#34d399]"
                        : "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                      : isActive
                      ? "bg-zinc-950"
                      : "bg-zinc-600"
                  }`}
                />
                <span className="truncate">Panel {num}</span>
                {isPanelDone && <CheckCircle2 size={12} className="text-emerald-300 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
