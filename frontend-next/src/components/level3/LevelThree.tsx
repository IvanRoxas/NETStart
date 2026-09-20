"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import '@/lib/customblocks';
import LevelThreeTabs from '@/components/level3/LevelThreeTabs';
import { useLevelThreeState } from '@/hooks/useLevelThreeState';
import {
  toolboxOxygen,
  toolboxShields,
  toolboxEngine,
  generateCockpitToolbox,
  LEVEL_3_BLOCKLY_JSON_DEFINITIONS,
} from '@/lib/level3/blocklyDefinitions';
import {
  validateMiniPuzzle,
  validateLaunchSequence,
  ValidationResult,
} from '@/lib/level3/validation';
import {
  Rocket,
  Play,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Zap,
  Wind,
  Shield,
  Flame,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProgression } from '@/context/ProgressionContext';
import { XP_REWARDS } from '@/lib/leveling';

Blockly.setLocale(En as any);

export default function LevelThree() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams.get('missionId') || 'moon-3';

  const { addXp } = useProgression();

  const {
    activeTab,
    setActiveTab,
    isOxygenFixed,
    setOxygenFixed,
    isShieldFixed,
    setShieldFixed,
    isEngineFixed,
    setEngineFixed,
    shipPower,
    setShipPower,
    resetState,
  } = useLevelThreeState();

  const blocklyRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  // Custom UI Notifications & Toast State (Compliance with AGENTS.md)
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({
    show: false,
    type: 'info',
    message: '',
  });

  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  }, []);

  // Initialize and update Blockly workspace based on activeTab
  useEffect(() => {
    if (!blocklyRef.current) return;

    // Define JSON blocks if not already present
    try {
      Blockly.defineBlocksWithJsonArray(LEVEL_3_BLOCKLY_JSON_DEFINITIONS);
    } catch (e) {
      // Blocks already defined
    }

    let toolboxConfig: any = toolboxOxygen;
    if (activeTab === 2) {
      toolboxConfig = toolboxShields;
    } else if (activeTab === 3) {
      toolboxConfig = toolboxEngine;
    } else if (activeTab === 4) {
      toolboxConfig = generateCockpitToolbox({
        isOxygenFixed,
        isShieldFixed,
        isEngineFixed,
      });
    }

    if (!workspaceRef.current) {
      workspaceRef.current = Blockly.inject(blocklyRef.current, {
        toolbox: toolboxConfig,
        grid: {
          spacing: 20,
          length: 2,
          colour: '#2a1a3e',
          snap: true,
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 0.9,
          maxScale: 2,
          minScale: 0.5,
          scaleSpeed: 1.2,
        },
        trashcan: true,
        sounds: false,
        renderer: 'zelos',
      });
    } else {
      workspaceRef.current.updateToolbox(toolboxConfig);
      workspaceRef.current.clear();
    }

    const handleResize = () => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab, isOxygenFixed, isShieldFixed, isEngineFixed]);

  // Clean up workspace on unmount
  useEffect(() => {
    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  // Handle Room Testing / Launch Validation
  const handleAction = () => {
    if (!workspaceRef.current) return;

    if (activeTab >= 1 && activeTab <= 3) {
      const result: ValidationResult = validateMiniPuzzle(workspaceRef.current, activeTab);

      if (result.success) {
        if (activeTab === 1) setOxygenFixed(true);
        if (activeTab === 2) setShieldFixed(true);
        if (activeTab === 3) setEngineFixed(true);

        showNotification(result.message, 'success');
        addXp(XP_REWARDS.SECTION_TOTAL_YIELD, `Fixed ${activeTab === 1 ? 'Oxygen' : activeTab === 2 ? 'Shields' : 'Engine'} System`);
      } else {
        showNotification(result.message, 'error');
      }
    } else if (activeTab === 4) {
      const result: ValidationResult = validateLaunchSequence(workspaceRef.current);

      if (result.success) {
        setIsLaunching(true);
        setShipPower(100);
        showNotification(result.message, 'success');

        setTimeout(() => {
          setIsLaunching(false);
          setIsVictory(true);
          addXp(XP_REWARDS.TOTAL_LEVEL_YIELD, "Level 3: The Launch Sequence Completed!");
        }, 1800);
      } else {
        showNotification(result.message, 'error');
      }
    }
  };

  const handleResetWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.clear();
      showNotification("Workspace cleared.", "info");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0314] text-slate-100 select-none overflow-hidden relative">
      {/* Header Bar */}
      <header className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-purple-900/40 shrink-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Rocket className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide">
                Level 3: The Launch Sequence
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-700/60 text-purple-300 font-bold uppercase">
                FUNCTIONS &amp; VARIABLES
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fix each spaceship room to create custom system blocks, then launch from the Cockpit!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/modules/moon')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Level</span>
          </button>
        </div>
      </header>

      {/* Top 4-Room Navigation Tabs */}
      <div className="px-4 pt-3 pb-1 z-10 shrink-0">
        <LevelThreeTabs
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          isOxygenFixed={isOxygenFixed}
          isShieldFixed={isShieldFixed}
          isEngineFixed={isEngineFixed}
        />
      </div>

      {/* Main Split Layout: Left Telemetry Stage + Right Blockly Workspace */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 min-w-0 p-3 sm:p-4 gap-3 z-10 overflow-hidden">
        {/* Left Side: Room Visual Stage & Mission Objective */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col justify-between p-4 rounded-2xl bg-slate-950/70 border border-purple-900/40 shadow-xl shrink-0 overflow-y-auto">
          <div>
            {/* Room Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/30">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-purple-300">
                {activeTab === 1
                  ? "ROOM 1 // OXYGEN"
                  : activeTab === 2
                  ? "ROOM 2 // SHIELDS"
                  : activeTab === 3
                  ? "ROOM 3 // ENGINE"
                  : "ROOM 4 // COCKPIT"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                TAB {activeTab} OF 4
              </span>
            </div>

            {/* Room Visual Telemetry Card */}
            <div className="my-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#9333ea_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

              {activeTab === 1 && (
                <>
                  <div className={`p-4 rounded-2xl mb-3 border ${
                    isOxygenFixed
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    <Wind className="w-10 h-10 animate-pulse" />
                  </div>
                  <div className="text-sm font-bold text-white">Oxygen Pressure System</div>
                  <div className="text-xs font-mono mt-1 text-cyan-400">
                    STATUS: {isOxygenFixed ? 'ONLINE (100% O2)' : 'OFFLINE (SEAL REQUIRED)'}
                  </div>
                </>
              )}

              {activeTab === 2 && (
                <>
                  <div className={`p-4 rounded-2xl mb-3 border ${
                    isShieldFixed
                      ? 'bg-purple-950/60 border-purple-400 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    <Shield className="w-10 h-10 animate-pulse" />
                  </div>
                  <div className="text-sm font-bold text-white">Shield Generator Matrix</div>
                  <div className="text-xs font-mono mt-1 text-purple-400">
                    STATUS: {isShieldFixed ? 'CHARGED (4/4 CELLS)' : 'DEPLETED (0/4 CELLS)'}
                  </div>
                </>
              )}

              {activeTab === 3 && (
                <>
                  <div className={`p-4 rounded-2xl mb-3 border ${
                    isEngineFixed
                      ? 'bg-orange-950/60 border-orange-400 text-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    <Flame className="w-10 h-10 animate-pulse" />
                  </div>
                  <div className="text-sm font-bold text-white">Cryogenic Reactor Chamber</div>
                  <div className="text-xs font-mono mt-1 text-orange-400">
                    STATUS: {isEngineFixed ? 'COMBUSTION READY' : 'NO FUEL MIXTURE'}
                  </div>
                </>
              )}

              {activeTab === 4 && (
                <>
                  <div className={`p-4 rounded-2xl mb-3 border ${
                    isOxygenFixed && isShieldFixed && isEngineFixed
                      ? 'bg-yellow-950/60 border-yellow-400 text-yellow-300 shadow-[0_0_25px_rgba(234,179,8,0.4)]'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    <Rocket className={`w-10 h-10 ${isLaunching ? 'animate-bounce' : ''}`} />
                  </div>
                  <div className="text-sm font-bold text-white">Flight Deck Console</div>
                  <div className="text-xs font-mono mt-1 text-yellow-400">
                    SHIP POWER: {shipPower}% // ALL SYSTEMS READY
                  </div>
                </>
              )}
            </div>

            {/* Room Instructions & High School Newbie Friendly Explanation */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs">
              <div className="font-bold text-purple-300 mb-1">
                {activeTab === 1
                  ? "Objective: Seal and Pressurize"
                  : activeTab === 2
                  ? "Objective: Charge 4 Battery Cells"
                  : activeTab === 3
                  ? "Objective: Mix Dual Fuel"
                  : "Final Exam: Assemble Launch Sequence"}
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {activeTab === 1 &&
                  "Snap 'Close Doors' then 'Pump Air' to build your Oxygen function block."}
                {activeTab === 2 &&
                  "Use a 'Repeat 4 times' loop with 'Charge Battery' inside to charge all cells."}
                {activeTab === 3 &&
                  "Snap 'Mix Blue Fuel' then 'Mix Green Fuel' to synthesize high-energy fuel."}
                {activeTab === 4 &&
                  "Set Ship Power to 100, then run Turn On Oxygen, Turn On Shields, and Turn On Thrusters in order!"}
              </p>
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center gap-2">
            <button
              onClick={handleAction}
              type="button"
              disabled={isLaunching}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                activeTab === 4
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{activeTab === 4 ? "Initiate Launch" : "Test Component"}</span>
            </button>

            <button
              onClick={handleResetWorkspace}
              title="Clear Workspace"
              type="button"
              className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Blockly Workspace */}
        <div className="flex-1 min-h-[350px] rounded-2xl bg-slate-950/80 border border-purple-900/50 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-purple-900/30 bg-slate-900/60 shrink-0">
            <span className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider">
              {activeTab === 4 ? "COCKPIT WORKSPACE // MAIN SEQUENCE" : "COMPONENT WORKSPACE // FUNCTION BUILDER"}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Drag blocks and click &quot;{activeTab === 4 ? 'Initiate Launch' : 'Test Component'}&quot;
            </span>
          </div>

          <div ref={blocklyRef} className="flex-1 w-full h-full relative" />
        </div>
      </div>

      {/* Custom Toast Notification (UI Notification Rule compliance) */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
              : toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
              : 'bg-slate-900/90 border-slate-700 text-slate-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Massive Liftoff Victory Modal */}
      {isVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1c0836] to-[#0b0314] border-2 border-yellow-500/70 shadow-[0_0_60px_rgba(234,179,8,0.4)] text-center relative overflow-hidden">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)]">
              <Rocket className="w-10 h-10 text-yellow-300 animate-bounce" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              LIFTOFF ACHIEVED
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              SUCCESS: LIFTOFF ACHIEVED!
            </h2>

            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Outstanding engineering! You mastered <strong>Variables</strong> to set ship power and connected your custom <strong>Functions</strong> to safely launch the rocket.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-slate-900/80 border border-purple-800/40 grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div>
                <div className="text-[10px] text-slate-400">OXYGEN</div>
                <div className="text-emerald-400 font-bold font-mono">100% OK</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">SHIELDS</div>
                <div className="text-purple-400 font-bold font-mono">4/4 OK</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">THRUSTERS</div>
                <div className="text-orange-400 font-bold font-mono">IGNITED</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => router.push('/modules')}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.5)] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Missions Page</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
