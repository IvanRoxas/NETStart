"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Package, Check, RefreshCw, Zap, Sprout, Wrench, CheckCircle2, XCircle } from 'lucide-react';
import type { MercuryLevel2Validation, CargoCategory, CargoItemEntity } from '@/lib/mercury/mercuryLevel2Definitions';
import { generateConveyor20Items } from '@/lib/mercury/mercuryLevel2Definitions';

interface MercuryLevel2ConveyorProps {
  validation: MercuryLevel2Validation;
  isRunning: boolean;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
  onResetSimulation?: () => void;
  onItemSorted?: (count: number) => void;
}

export default function MercuryLevel2Conveyor({
  validation,
  isRunning,
  onSimulationComplete,
  onResetSimulation,
  onItemSorted,
}: MercuryLevel2ConveyorProps) {
  // 20 items state
  const [cargoList, setCargoList] = useState<CargoItemEntity[]>(() => generateConveyor20Items());
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [cargoSorted, setCargoSorted] = useState<number>(0);

  // Conveyor Belt position state:
  // beltSlot is which crate index is centered in the X-Ray scanner archway (at 30%).
  // Starts at -1 when idle, so crate 0 is queued outside at 30 + 14 = 44%.
  const [beltSlot, setBeltSlot] = useState<number>(-1);
  const [isFeederBeltRolling, setIsFeederBeltRolling] = useState<boolean>(false);

  // Scanned item state
  const [currentItem, setCurrentItem] = useState<CargoCategory | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Robotic Claw States: idle, moving, grabbing
  const [clawState, setClawState] = useState<'idle' | 'moving' | 'grabbing'>('idle');
  const [clawPos, setClawPos] = useState<{ x: number; y: number }>({ x: 90, y: 30 });
  const [clawCarryingItem, setClawCarryingItem] = useState<CargoItemEntity | null>(null);

  // Vertical belts item traveling state
  const [activeBeltRunning, setActiveBeltRunning] = useState<CargoCategory | null>(null);
  const [travelingItem, setTravelingItem] = useState<{
    item: CargoItemEntity;
    belt: CargoCategory;
    progress: number;
  } | null>(null);

  // Chute entrance validation state (flashes success check or error alert at opening)
  const [chuteValidation, setChuteValidation] = useState<{
    belt: CargoCategory;
    status: 'success' | 'error';
  } | null>(null);

  // Error & Failure states
  const [errorBelt, setErrorBelt] = useState<CargoCategory | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Warehouse Success Lighting
  const [isSuccessLighting, setIsSuccessLighting] = useState<boolean>(false);

  // Execution timers tracker
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const clearAllTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  const validationRef = useRef(validation);
  useEffect(() => {
    validationRef.current = validation;
  }, [validation]);

  const onSimulationCompleteRef = useRef(onSimulationComplete);
  useEffect(() => {
    onSimulationCompleteRef.current = onSimulationComplete;
  }, [onSimulationComplete]);

  const onItemSortedRef = useRef(onItemSorted);
  useEffect(() => {
    onItemSortedRef.current = onItemSorted;
  }, [onItemSorted]);

  const handleReset = useCallback(() => {
    clearAllTimers();
    setCargoList(generateConveyor20Items());
    setActiveItemIndex(0);
    setBeltSlot(-1);
    setIsFeederBeltRolling(false);
    setActiveBeltRunning(null);
    setChuteValidation(null);
    setCargoSorted(0);
    setCurrentItem(null);
    setIsScanning(false);
    setClawState('idle');
    setClawPos({ x: 90, y: 30 });
    setClawCarryingItem(null);
    setTravelingItem(null);
    setErrorBelt(null);
    setErrorMessage(null);
    setIsSuccessLighting(false);
    if (onResetSimulation) onResetSimulation();
  }, [onResetSimulation]);

  // Destination X coordinates for the 3 vertical belts (matching sign centers exactly)
  // Equipment belt center: left-[18%] + width 16% / 2 = 26%
  // Organics belt center: left-[42%] + 16% / 2 = 50%
  // Energy belt center: left-[66%] + 16% / 2 = 74%
  const BELT_X_COORDS: Record<string, number> = {
    Equipment: 26,
    Gears: 26,
    Organics: 50,
    Energy: 74,
  };

  const PICKUP_X = 30; // Position of X-Ray archway center on bottom feeder belt

  // Process a single item step
  const processItemStep = useCallback((itemIndex: number) => {
    const currentVal = validationRef.current;
    const maxIterations = currentVal.loopTimes > 0 ? currentVal.loopTimes : 20;

    // Check if loop finished before all 20 crates were sorted
    if (itemIndex >= maxIterations && itemIndex < 20) {
      setErrorMessage(`The conveyor stopped early! Your loop only ran ${maxIterations} time${maxIterations === 1 ? '' : 's'}, leaving ${20 - maxIterations} crates unsorted. Change Repeat to 20 times!`);
      if (onSimulationCompleteRef.current) {
        onSimulationCompleteRef.current(false, `The loop only ran ${maxIterations} times! Set Repeat to 20.`);
      }
      return;
    }

    if (itemIndex >= cargoList.length) {
      // All 20 items successfully sorted!
      setIsSuccessLighting(true);
      setClawState('idle');
      setClawPos({ x: 90, y: 30 });
      if (onSimulationCompleteRef.current) {
        onSimulationCompleteRef.current(true);
      }
      return;
    }

    const item = cargoList[itemIndex];

    // EDGE CASE: Empty loop / no logic
    if (currentVal.hasEmptyLoopError || (!currentVal.hasLogicBlock && !currentVal.hasActionBlock)) {
      const tFail = setTimeout(() => {
        setErrorMessage("The claw doesn't have any instructions! Give it some rules to follow.");
        if (onSimulationCompleteRef.current) {
          onSimulationCompleteRef.current(false, "No instructions inside loop!");
        }
      }, 1200);
      timersRef.current.push(tFail);
      return;
    }

    // Step 0: Turn on bottom conveyor belt and roll incoming crate smoothly into the scanner archway
    setIsFeederBeltRolling(true);
    setBeltSlot(itemIndex);

    const tArrival = setTimeout(() => {
      setIsFeederBeltRolling(false);

      // Step 1: Item enters X-Ray Scanner Archway & scans
      setIsScanning(true);
      setCurrentItem(item.type);

      const tScanEnd = setTimeout(() => {
        setIsScanning(false);

        // Step 2: Claw moves over item and extends downward to grab
        setClawPos({ x: PICKUP_X, y: 76 });
        setClawState('moving');

        const tClawGrab = setTimeout(() => {
          setClawState('grabbing');
          setClawCarryingItem(item);

          // Step 3: Claw lifts item back up to rail height
          const tClawLift = setTimeout(() => {
            setClawPos({ x: PICKUP_X, y: 22 });

            // Step 4: Evaluate player's code logic against currentItem
            const targetCategory = item.type === 'Gears' ? 'Equipment' : item.type;
            const rawRoutedBelt = currentVal.routingTable[targetCategory] || currentVal.routingTable[item.type];

            const tClawTransport = setTimeout(() => {
              if (!rawRoutedBelt) {
                setErrorMessage(`The claw picked up an ${targetCategory} crate but didn't know where to send it! Check your If/Else rules.`);
                if (onSimulationCompleteRef.current) {
                  onSimulationCompleteRef.current(false, `No rule defined for ${targetCategory} crates!`);
                }
                return;
              }

              const targetBelt = (rawRoutedBelt === 'Gears' ? 'Equipment' : rawRoutedBelt) as CargoCategory;
              const targetX = BELT_X_COORDS[targetBelt] || 26;
              setClawPos({ x: targetX, y: 22 });
              setClawState('moving');

              // Drop onto vertical belt
              const tClawDrop = setTimeout(() => {
                setClawPos({ x: targetX, y: 56 });

                const tRelease = setTimeout(() => {
                  setClawState('idle');
                  setClawCarryingItem(null);

                  // Retract claw back to idle standby position
                  setClawPos({ x: 90, y: 30 });

                  // Start vertical belt scrolling animation and spawn traveling item
                  setActiveBeltRunning(targetBelt);
                  setTravelingItem({ item, belt: targetBelt, progress: 0 });

                  // Trigger upward travel animation towards top chute
                  const tTravelStart = setTimeout(() => {
                    setTravelingItem({ item, belt: targetBelt, progress: 1 });
                  }, 40);
                  timersRef.current.push(tTravelStart);

                  // Item reaches the top chute opening
                  const tArrivalAtChute = setTimeout(() => {
                    setActiveBeltRunning(null);

                    // Check Win vs Fail for this item
                    const isCorrect = targetBelt === targetCategory;

                    if (!isCorrect) {
                      // WRONG CHUTE: Flash alarm red on chute opening
                      setChuteValidation({ belt: targetBelt, status: 'error' });
                      setErrorBelt(targetBelt);

                      const tFailPrompt = setTimeout(() => {
                        setErrorMessage(`Oops! An ${targetCategory} crate was routed to the ${targetBelt} chute! Check your If/Else conditions.`);
                        if (onSimulationCompleteRef.current) {
                          onSimulationCompleteRef.current(false, `${targetCategory} was routed to ${targetBelt}!`);
                        }
                      }, 400);
                      timersRef.current.push(tFailPrompt);
                      return;
                    }

                    // CORRECT CHUTE: Flash glowing emerald checkmark on chute opening
                    setChuteValidation({ belt: targetBelt, status: 'success' });

                    const tSuccessChute = setTimeout(() => {
                      setChuteValidation(null);
                      setTravelingItem(null);
                      setCargoSorted(prev => {
                        const newCount = prev + 1;
                        if (onItemSortedRef.current) onItemSortedRef.current(newCount);
                        return newCount;
                      });

                      setActiveItemIndex(prev => prev + 1);
                      setCurrentItem(null);
                      processItemStep(itemIndex + 1);
                    }, 500);
                    timersRef.current.push(tSuccessChute);

                  }, 850);
                  timersRef.current.push(tArrivalAtChute);

                }, 400);
                timersRef.current.push(tRelease);

              }, 500);
              timersRef.current.push(tClawDrop);

            }, 500);
            timersRef.current.push(tClawTransport);

          }, 450);
          timersRef.current.push(tClawLift);

        }, 500);
        timersRef.current.push(tClawGrab);

      }, 550);
      timersRef.current.push(tScanEnd);

    }, 800);
    timersRef.current.push(tArrival);

  }, [cargoList]);

  // Main simulation trigger
  useEffect(() => {
    if (!isRunning) {
      clearAllTimers();
      setClawState('idle');
      setClawPos({ x: 90, y: 30 });
      setClawCarryingItem(null);
      setTravelingItem(null);
      setIsScanning(false);
      setIsFeederBeltRolling(false);
      setActiveBeltRunning(null);
      setChuteValidation(null);
      setBeltSlot(-1);
      setActiveItemIndex(0);
      setCurrentItem(null);
      setCargoSorted(0);
      setErrorBelt(null);
      setErrorMessage(null);
      setIsSuccessLighting(false);
      return;
    }

    // Reset before running
    clearAllTimers();
    setCargoSorted(0);
    setActiveItemIndex(0);
    setCurrentItem(null);
    setBeltSlot(-1);
    setIsFeederBeltRolling(false);
    setActiveBeltRunning(null);
    setChuteValidation(null);
    setErrorBelt(null);
    setErrorMessage(null);
    setIsSuccessLighting(false);

    // Start loop execution
    processItemStep(0);

    return () => clearAllTimers();
  }, [isRunning, processItemStep]);

  return (
    <div className={`flex-1 w-full h-full min-h-0 relative flex flex-col overflow-hidden select-none transition-colors duration-1000 ${
      isSuccessLighting
        ? 'bg-gradient-to-b from-[#062419] via-[#0b3826] to-[#041a12]'
        : 'bg-gradient-to-b from-[#090b14] via-[#101424] to-[#060810]'
    }`}>
      
      {/* ------------------------------------------------------------- */}
      {/* TOP HUD: Cargo Counter                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute top-2 left-3 z-30 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-2xl shadow-xl backdrop-blur-md">
          <Package size={16} className="text-amber-400" />
          <span className="font-display font-black text-sm text-amber-400 tabular-nums">
            {cargoSorted} <span className="text-slate-500 font-mono text-xs font-normal">/ 20</span>
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2D SIMULATION CANVAS                                           */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        
        {/* Layer 1: Factory Background & Atmospheric Lighting */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          {/* Warehouse wall panels */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]" />
          
          {/* Ceiling structural girder beam */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 border-b-2 border-slate-700 flex items-center justify-around px-8 shadow-lg">
            <div className="w-12 h-2 bg-slate-800 border border-slate-600 rounded-xs" />
            <div className="w-12 h-2 bg-slate-800 border border-slate-600 rounded-xs" />
            <div className="w-12 h-2 bg-slate-800 border border-slate-600 rounded-xs" />
            <div className="w-12 h-2 bg-slate-800 border border-slate-600 rounded-xs" />
          </div>

          {/* Yellow Hazard Warning Stripes at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-2.5 bg-[repeating-linear-gradient(45deg,#eab308,#eab308_8px,#1e293b_8px,#1e293b_16px)] border-t border-amber-600" />
        </div>

        {/* Layer 2: Conveyor Belts & Chute Bases */}
        <div className="absolute inset-0 z-[2] pointer-events-none">
          
          {/* ───────────────────────────────────────────────────── */}
          {/* 3 Sorting Belts (vertical, angled perspective)        */}
          {/* Belt centers: 26%, 50%, 74% — matching sign centers   */}
          {/* ───────────────────────────────────────────────────── */}

          {/* Belt 1: EQUIPMENT (Left, centered at 26%) */}
          <div className={`absolute top-[17%] left-[18%] w-[16%] h-[52%] transition-all duration-300 rounded-t-lg overflow-hidden border-x-2 border-slate-700 ${
            errorBelt === 'Equipment' || errorBelt === 'Gears'
              ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,1)] animate-pulse bg-red-950/40'
              : 'bg-slate-900/80'
          }`}>
            <div
              style={{
                background: 'repeating-linear-gradient(0deg,#1e293b,#1e293b 10px,#0f172a 10px,#0f172a 20px)',
                backgroundSize: '100% 20px',
                animation: (activeBeltRunning === 'Equipment' || activeBeltRunning === 'Gears') ? 'conveyorBeltUp 0.45s linear infinite' : 'none',
              }}
              className="w-full h-full opacity-90"
            />
            <div className="absolute inset-y-0 left-0 w-1.5 bg-sky-600/40 border-r border-sky-400/50" />
            <div className="absolute inset-y-0 right-0 w-1.5 bg-sky-600/40 border-l border-sky-400/50" />
          </div>

          {/* Belt 2: ORGANICS (Center, centered at 50%) */}
          <div className={`absolute top-[17%] left-[42%] w-[16%] h-[52%] transition-all duration-300 rounded-t-lg overflow-hidden border-x-2 border-slate-700 ${
            errorBelt === 'Organics'
              ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,1)] animate-pulse bg-red-950/40'
              : 'bg-slate-900/80'
          }`}>
            <div
              style={{
                background: 'repeating-linear-gradient(0deg,#1e293b,#1e293b 10px,#0f172a 10px,#0f172a 20px)',
                backgroundSize: '100% 20px',
                animation: activeBeltRunning === 'Organics' ? 'conveyorBeltUp 0.45s linear infinite' : 'none',
              }}
              className="w-full h-full opacity-90"
            />
            <div className="absolute inset-y-0 left-0 w-1.5 bg-emerald-600/40 border-r border-emerald-400/50" />
            <div className="absolute inset-y-0 right-0 w-1.5 bg-emerald-600/40 border-l border-emerald-400/50" />
          </div>

          {/* Belt 3: ENERGY (Right, centered at 74%) */}
          <div className={`absolute top-[17%] left-[66%] w-[16%] h-[52%] transition-all duration-300 rounded-t-lg overflow-hidden border-x-2 border-slate-700 ${
            errorBelt === 'Energy'
              ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,1)] animate-pulse bg-red-950/40'
              : 'bg-slate-900/80'
          }`}>
            <div
              style={{
                background: 'repeating-linear-gradient(0deg,#1e293b,#1e293b 10px,#0f172a 10px,#0f172a 20px)',
                backgroundSize: '100% 20px',
                animation: activeBeltRunning === 'Energy' ? 'conveyorBeltUp 0.45s linear infinite' : 'none',
              }}
              className="w-full h-full opacity-90"
            />
            <div className="absolute inset-y-0 left-0 w-1.5 bg-yellow-600/40 border-r border-yellow-400/50" />
            <div className="absolute inset-y-0 right-0 w-1.5 bg-yellow-600/40 border-l border-yellow-400/50" />
          </div>

          {/* ───────────────────────────────────────────────────── */}
          {/* Chutes + Signs — centered exactly above each belt    */}
          {/* ───────────────────────────────────────────────────── */}

          {/* Chute 1: EQUIPMENT — centered at left: 26% */}
          <div className="absolute top-[7%] left-[26%] -translate-x-1/2 flex flex-col items-center z-10">
            {/* Hanging Industrial Sign */}
            <div className={`px-2.5 py-1 bg-sky-950/95 border-2 rounded-lg flex items-center gap-1.5 mb-1 transition-all duration-300 ${
              chuteValidation?.belt === 'Equipment' || chuteValidation?.belt === 'Gears'
                ? chuteValidation.status === 'success'
                  ? 'border-emerald-400 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.8)] scale-105'
                  : 'border-red-500 text-red-300 shadow-[0_0_16px_rgba(239,68,68,0.8)] animate-bounce'
                : 'border-sky-400 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
            }`}>
              <Wrench size={13} className={
                chuteValidation?.belt === 'Equipment' || chuteValidation?.belt === 'Gears'
                  ? chuteValidation.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                  : 'text-sky-400'
              } />
              <span className="font-display font-black text-[11px] tracking-wider">EQUIPMENT</span>
            </div>
            {/* Chute Opening with Dynamic Validation Glow */}
            <div className={`w-16 sm:w-20 h-10 rounded-lg flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
              chuteValidation?.belt === 'Equipment' || chuteValidation?.belt === 'Gears'
                ? chuteValidation.status === 'success'
                  ? 'bg-emerald-950/90 border-4 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,1)] ring-4 ring-emerald-400/50 scale-105'
                  : 'bg-red-950/90 border-4 border-red-500 shadow-[0_0_35px_rgba(239,68,68,1)] ring-4 ring-red-500/50 animate-pulse'
                : errorBelt === 'Equipment' || errorBelt === 'Gears'
                ? 'bg-red-950 border-4 border-red-500 shadow-[0_0_26px_rgba(239,68,68,1)] animate-pulse'
                : 'bg-slate-950 border-4 border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.6)]'
            }`}>
              {(chuteValidation?.belt === 'Equipment' || chuteValidation?.belt === 'Gears') ? (
                chuteValidation.status === 'success' ? (
                  <CheckCircle2 size={18} className="text-emerald-400 animate-in zoom-in-75 duration-200 drop-shadow-[0_0_8px_#34d399]" />
                ) : (
                  <XCircle size={18} className="text-red-400 animate-in zoom-in-75 duration-200 drop-shadow-[0_0_8px_#ef4444]" />
                )
              ) : (
                <div className="w-10 sm:w-14 h-5 bg-black rounded border border-slate-700 shadow-inner" />
              )}
            </div>
          </div>

          {/* Chute 2: ORGANICS — centered at left: 50% */}
          <div className="absolute top-[7%] left-[50%] -translate-x-1/2 flex flex-col items-center z-10">
            {/* Hanging Industrial Sign */}
            <div className={`px-2.5 py-1 bg-emerald-950/95 border-2 rounded-lg flex items-center gap-1.5 mb-1 transition-all duration-300 ${
              chuteValidation?.belt === 'Organics'
                ? chuteValidation.status === 'success'
                  ? 'border-emerald-400 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.8)] scale-105'
                  : 'border-red-500 text-red-300 shadow-[0_0_16px_rgba(239,68,68,0.8)] animate-bounce'
                : 'border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
            }`}>
              <Sprout size={13} className={
                chuteValidation?.belt === 'Organics'
                  ? chuteValidation.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                  : 'text-emerald-400'
              } />
              <span className="font-display font-black text-[11px] tracking-wider">ORGANICS</span>
            </div>
            {/* Chute Opening with Dynamic Validation Glow */}
            <div className={`w-16 sm:w-20 h-10 rounded-lg flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
              chuteValidation?.belt === 'Organics'
                ? chuteValidation.status === 'success'
                  ? 'bg-emerald-950/90 border-4 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,1)] ring-4 ring-emerald-400/50 scale-105'
                  : 'bg-red-950/90 border-4 border-red-500 shadow-[0_0_35px_rgba(239,68,68,1)] ring-4 ring-red-500/50 animate-pulse'
                : errorBelt === 'Organics'
                ? 'bg-red-950 border-4 border-red-500 shadow-[0_0_26px_rgba(239,68,68,1)] animate-pulse'
                : 'bg-slate-950 border-4 border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.6)]'
            }`}>
              {chuteValidation?.belt === 'Organics' ? (
                chuteValidation.status === 'success' ? (
                  <CheckCircle2 size={18} className="text-emerald-400 animate-in zoom-in-75 duration-200 drop-shadow-[0_0_8px_#34d399]" />
                ) : (
                  <XCircle size={18} className="text-red-400 animate-in zoom-in-75 duration-200 drop-shadow-[0_0_8px_#ef4444]" />
                )
              ) : (
                <div className="w-10 sm:w-14 h-5 bg-black rounded border border-slate-700 shadow-inner" />
              )}
            </div>
          </div>

          {/* Chute 3: ENERGY — centered at left: 74% */}
          <div className="absolute top-[7%] left-[74%] -translate-x-1/2 flex flex-col items-center z-10">
            {/* Hanging Industrial Sign */}
            <div className={`px-2.5 py-1 bg-amber-950/95 border-2 rounded-lg flex items-center gap-1.5 mb-1 transition-all duration-300 ${
              chuteValidation?.belt === 'Energy'
                ? chuteValidation.status === 'success'
                  ? 'border-emerald-400 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.8)] scale-105'
                  : 'border-red-500 text-red-300 shadow-[0_0_16px_rgba(239,68,68,0.8)] animate-bounce'
                : 'border-yellow-400 text-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.5)]'
            }`}>
              <Zap size={13} className={
                chuteValidation?.belt === 'Energy'
                  ? chuteValidation.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                  : 'text-yellow-400'
              } />
              <span className="font-display font-black text-[11px] tracking-wider">ENERGY</span>
            </div>
            {/* Chute Opening with Dynamic Validation Glow */}
            <div className={`w-16 sm:w-20 h-10 rounded-lg flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
              chuteValidation?.belt === 'Energy'
                ? chuteValidation.status === 'success'
                  ? 'bg-emerald-950/90 border-4 border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,1)] ring-4 ring-emerald-400/50 scale-105'
                  : 'bg-red-950/90 border-4 border-red-500 shadow-[0_0_35px_rgba(239,68,68,1)] ring-4 ring-red-500/50 animate-pulse'
                : errorBelt === 'Energy'
                ? 'bg-red-950 border-4 border-red-500 shadow-[0_0_26px_rgba(239,68,68,1)] animate-pulse'
                : 'bg-slate-950 border-4 border-yellow-400 shadow-[0_0_16px_rgba(250,204,21,0.6)]'
            }`}>
              {chuteValidation?.belt === 'Energy' ? (
                chuteValidation.status === 'success' ? (
                  <CheckCircle2 size={18} className="text-emerald-400 animate-in zoom-in-75 duration-200 drop-shadow-[0_0_8px_#34d399]" />
                ) : (
                  <XCircle size={18} className="text-red-400 animate-in zoom-in-75 duration-200 drop-shadow-[0_0_8px_#ef4444]" />
                )
              ) : (
                <div className="w-10 sm:w-14 h-5 bg-black rounded border border-slate-700 shadow-inner" />
              )}
            </div>
          </div>

          {/* Horizontal Feeder Belt (Bottom) */}
          <div className="absolute bottom-[3%] left-0 right-0 h-14 bg-slate-900 border-y-4 border-slate-700 shadow-2xl flex items-center overflow-hidden">
            {/* Animated Tiling Tread Texture */}
            <div className={`w-[200%] h-full flex bg-[repeating-linear-gradient(90deg,#0f172a,#0f172a_14px,#1e293b_14px,#1e293b_28px)] ${
              isFeederBeltRolling ? 'animate-[marquee_0.8s_linear_infinite]' : ''
            }`} />
            {/* Safety Rollers */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500/70" />
          </div>
        </div>

        {/* Layer 3: Cargo Items Moving on Belts */}
        <div className="absolute inset-0 z-[3] pointer-events-none">
          {/* Waiting boxes rolling in on bottom feeder belt from right */}
          {cargoList.map((item, idx) => {
            if (idx < activeItemIndex) return null; // Already sorted
            if (idx === activeItemIndex && (clawCarryingItem || travelingItem || chuteValidation)) return null; // In transit or being validated in chute

            // Position on bottom feeder belt (centered with transform: translateX(-50%))
            const SPACING = 14;
            const xPos = PICKUP_X + (idx - beltSlot) * SPACING;

            // Revealed strictly during active running when scanner beam fires on activeItemIndex
            const isRevealed = isRunning && idx === activeItemIndex && currentItem !== null;

            return (
              <div
                key={`cargo-${item.id}`}
                style={{
                  left: `${xPos}%`,
                  transform: 'translateX(-50%)',
                  bottom: '4.2%',
                  transition: isRunning ? 'left 0.8s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
                }}
                className={`absolute flex flex-col items-center justify-end transition-opacity duration-300 ${
                  xPos > 105 ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                {isRevealed ? (
                  /* Revealed item — borderless, large SVG asset with a simple sleek category tag above */
                  <div className="flex flex-col items-center justify-end animate-in zoom-in-95 duration-200">
                    <div className={`px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9.5px] font-mono font-bold tracking-wider uppercase mb-1 shadow-md border ${
                      item.type === 'Equipment' || item.type === 'Gears'
                        ? 'bg-sky-500/25 text-sky-300 border-sky-400/60 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                        : item.type === 'Organics'
                        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/60 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                        : 'bg-amber-500/25 text-yellow-300 border-yellow-400/60 shadow-[0_0_12px_rgba(250,204,21,0.4)]'
                    }`}>
                      {item.type === 'Gears' ? 'EQUIPMENT' : item.type.toUpperCase()}
                    </div>
                    <img
                      src={item.iconPath}
                      alt={item.label}
                      className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.8)] filter"
                    />
                  </div>
                ) : (
                  /* Unknown crate — sleek industrial container with ? */
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-slate-600 bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 absolute top-1 left-1" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 absolute top-1 right-1" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 absolute bottom-1 left-1" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500 absolute bottom-1 right-1" />
                    <div className="w-6 h-6 rounded-lg bg-slate-950/80 border border-slate-700/80 flex items-center justify-center">
                      <span className="text-sm font-black text-slate-400">?</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Item traveling up vertical sorter belt into chute */}
          {travelingItem && (
            <div
              style={{
                left: `${BELT_X_COORDS[travelingItem.belt] || 26}%`,
                top: travelingItem.progress === 1 ? '16%' : '58%',
                transform: travelingItem.progress === 1 ? 'translate(-50%, -50%) scale(0.35)' : 'translate(-50%, -50%) scale(1)',
                opacity: travelingItem.progress === 1 ? 0 : 1,
                transition: 'top 0.85s cubic-bezier(0.25, 1, 0.5, 1), transform 0.85s ease, opacity 0.85s ease',
              }}
              className="absolute flex flex-col items-center justify-center pointer-events-none z-[3]"
            >
              <div className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold tracking-wider uppercase mb-0.5 shadow-md border ${
                travelingItem.item.type === 'Equipment' || travelingItem.item.type === 'Gears'
                  ? 'bg-sky-500/25 text-sky-300 border-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                  : travelingItem.item.type === 'Organics'
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/60 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                  : 'bg-amber-500/25 text-yellow-300 border-yellow-400/60 shadow-[0_0_10px_rgba(250,204,21,0.4)]'
              }`}>
                {travelingItem.item.type === 'Gears' ? 'EQUIPMENT' : travelingItem.item.type.toUpperCase()}
              </div>
              <img
                src={travelingItem.item.iconPath}
                alt={travelingItem.item.type}
                className="w-13 h-13 sm:w-15 sm:h-15 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.8)]"
              />
            </div>
          )}
        </div>

        {/* Layer 4: Robotic Claw */}
        <div className="absolute inset-0 z-[4] pointer-events-none">
          {/* Top Rail Suspension Trolley */}
          <div
            style={{
              left: `${clawPos.x}%`,
              transform: 'translateX(-50%)',
              transition: 'left 0.5s ease-in-out',
            }}
            className="absolute top-2 w-20 h-7 bg-slate-700 border-2 border-slate-500 rounded-lg shadow-lg flex items-center justify-center gap-1.5"
          >
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>

          {/* Telescoping Piston Rod */}
          <div
            style={{
              left: `${clawPos.x}%`,
              top: '2.25rem',
              height: `${clawPos.y}%`,
              transform: 'translateX(-50%)',
              transition: 'left 0.5s ease-in-out, height 0.4s ease-in-out',
            }}
            className="absolute w-4 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-x border-slate-500 shadow-md"
          />

          {/* Mechanical Claw Head & Pincers */}
          <div
            style={{
              left: `${clawPos.x}%`,
              top: `calc(${clawPos.y}% + 2.25rem)`,
              transform: 'translate(-50%, -100%)',
              transition: 'left 0.5s ease-in-out, top 0.4s ease-in-out',
            }}
            className="absolute flex flex-col items-center"
          >
            {/* Claw Collar */}
            <div className="w-20 h-5 bg-slate-800 border-2 border-slate-500 rounded-t-md shadow-md flex items-center justify-around px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>

            {/* Left & Right Robotic Pincer Fingers */}
            <div className="w-22 flex items-center justify-between px-1">
              <div className={`w-5 h-11 bg-gradient-to-b from-slate-600 to-slate-700 border border-slate-500 rounded-bl-xl shadow-md transition-transform duration-300 ${
                clawState === 'grabbing' ? 'rotate-15 translate-x-2' : '-rotate-15'
              }`} />
              <div className={`w-5 h-11 bg-gradient-to-b from-slate-600 to-slate-700 border border-slate-500 rounded-br-xl shadow-md transition-transform duration-300 ${
                clawState === 'grabbing' ? '-rotate-15 -translate-x-2' : 'rotate-15'
              }`} />
            </div>

            {/* Cargo item held in claw during transport */}
            {clawCarryingItem && (
              <div className="absolute top-5 flex flex-col items-center animate-in zoom-in-95 pointer-events-none">
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold tracking-wider uppercase mb-0.5 shadow-md border ${
                  clawCarryingItem.type === 'Equipment' || clawCarryingItem.type === 'Gears'
                    ? 'bg-sky-500/25 text-sky-300 border-sky-400/60 shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                    : clawCarryingItem.type === 'Organics'
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/60 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                    : 'bg-amber-500/25 text-yellow-300 border-yellow-400/60 shadow-[0_0_10px_rgba(250,204,21,0.4)]'
                }`}>
                  {clawCarryingItem.type === 'Gears' ? 'EQUIPMENT' : clawCarryingItem.type.toUpperCase()}
                </div>
                <img
                  src={clawCarryingItem.iconPath}
                  alt={clawCarryingItem.label}
                  className="w-13 h-13 sm:w-15 sm:h-15 object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.8)]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Layer 5: X-Ray Archway & Scan Laser */}
        <div className="absolute inset-0 z-[5] pointer-events-none">
          
          {/* Glowing Sci-Fi X-Ray Archway over feeder belt */}
          <div
            style={{
              left: `${PICKUP_X}%`,
              bottom: '3%',
              transform: 'translateX(-50%)',
            }}
            className="absolute w-24 sm:w-28 h-32 border-t-8 border-x-8 border-cyan-400/90 rounded-t-3xl shadow-[0_0_20px_rgba(34,211,238,0.7)] flex flex-col items-center justify-between"
          >
            {/* Top Scanner Emitter Node */}
            <div className="w-10 h-2.5 bg-cyan-300 rounded-b-md shadow-md flex items-center justify-center">
              <div className="w-1.5 h-1 bg-white rounded-full animate-ping" />
            </div>

            {/* Scan Beam Flash */}
            {isScanning && (
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/40 via-white/50 to-transparent animate-pulse rounded-t-2xl flex items-center justify-center">
                <div className="w-full h-0.5 bg-cyan-200 shadow-[0_0_15px_#22d3ee] animate-bounce" />
              </div>
            )}

            {/* Left & Right Scanner Emitters */}
            <div className="w-full flex justify-between px-1">
              <div className="w-1.5 h-3.5 bg-cyan-400 rounded-r-sm" />
              <div className="w-1.5 h-3.5 bg-cyan-400 rounded-l-sm" />
            </div>
          </div>

          {/* Simulation Win Overlay Banner */}
          {isSuccessLighting && (
            <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/40 backdrop-blur-xs">
              <div className="bg-emerald-950/95 border-2 border-emerald-400 px-8 py-5 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.7)] flex flex-col items-center gap-2 animate-bounce">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                  <Check size={28} strokeWidth={3} />
                </div>
                <div className="font-display font-black text-2xl sm:text-3xl text-emerald-300 uppercase tracking-widest text-center">
                  TRACKS UN-JAMMED!
                </div>
                <div className="text-xs font-mono text-emerald-200 uppercase tracking-wider">
                  All 20 Cargo Items Successfully Sorted
                </div>
              </div>
            </div>
          )}

          {/* Educational Failure Pop-up from Professor Dominic */}
          {errorMessage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
              <div className="bg-slate-950 border-2 border-red-500 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.6)] flex flex-col items-center text-center gap-4 animate-in zoom-in-95">
                {/* Professor Dominic Avatar */}
                <div className="w-14 h-14 rounded-full border-2 border-red-400 overflow-hidden bg-indigo-950 shadow-md">
                  <img
                    src="/assets/mercury/professor_dominic.svg"
                    alt="Professor Dominic"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                    Professor Dominic
                  </div>
                  <div className="text-sm sm:text-base font-medium text-white leading-relaxed">
                    {errorMessage}
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer pointer-events-auto"
                >
                  <RefreshCw size={13} />
                  Try Again
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
