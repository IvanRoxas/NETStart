"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  X,
  Sparkles,
} from 'lucide-react';
import type { JupiterLevel1Validation, JupiterPhysicalLock } from '@/lib/jupiter/jupiterLevel1Definitions';

interface JupiterLevel1SimulationProps {
  validation: JupiterLevel1Validation;
  isRunning: boolean;
  failCount: number;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
}

// Procedural audio synthesizer using Web Audio API
class JupiterAudioFX {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playKeypadClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  playDeadboltClank() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playDoorOpenHiss() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.7);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.8);
    } catch (e) {}
  }

  playSuccessChime() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.12, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.4);
      });
    } catch (e) {}
  }

  playErrorBuzz() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }
}

export default function JupiterLevel1Simulation({
  validation,
  isRunning,
  failCount,
  onSimulationComplete,
}: JupiterLevel1SimulationProps) {
  const soundFx = useRef(new JupiterAudioFX());

  const [activeProjectionIndex, setActiveProjectionIndex] = useState<number | null>(null);
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [isClipboardOpen, setIsClipboardOpen] = useState(false);

  // Local physical lock state tracking
  const [locks, setLocks] = useState<JupiterPhysicalLock[]>(validation.locks);

  // Real-time typed values inside digital lock displays
  const [typedValues, setTypedValues] = useState<{
    stringVal: string;
    intVal: string;
    boolVal: string;
  }>({
    stringVal: validation.locks[0].displayValue || '',
    intVal: validation.locks[1].displayValue || '',
    boolVal: validation.locks[2].displayValue || 'FALSE',
  });

  // Track previous validation string to detect actual workspace edits by the student
  const prevValidationRef = useRef<string>('');
  const validationKey = useMemo(() => {
    return JSON.stringify({
      vars: validation.variables.map(v => `${v.varType}_${v.varName}_${v.rawValue}`),
      actions: validation.actions.map(a => `${a.type}_${a.varName}_${a.targetLock}`),
    });
  }, [validation]);

  // Keep locks dormant initially, but DO NOT wipe them when a simulation run ends with failures or partial success!
  // Only reset to dormant if the student modifies their blocks on canvas after a run.
  useEffect(() => {
    if (!isRunning) {
      if (prevValidationRef.current !== '' && prevValidationRef.current !== validationKey) {
        setIsDoorOpen(false);
        setLocks([
          {
            id: 0,
            label: 'STRING LOCK',
            dataType: 'String',
            expectedValue: 'JupiterSecurity',
            status: 'locked',
            displayValue: '',
            disengaged: false,
          },
          {
            id: 1,
            label: 'PIN LOCK',
            dataType: 'int',
            expectedValue: 1234,
            status: 'locked',
            displayValue: '',
            disengaged: false,
          },
          {
            id: 2,
            label: 'BOOLEAN LOCK',
            dataType: 'boolean',
            expectedValue: true,
            status: 'locked',
            displayValue: '',
            disengaged: false,
          },
        ]);
        setTypedValues({
          stringVal: '',
          intVal: '',
          boolVal: 'FALSE',
        });
        setActiveProjectionIndex(null);
      }
      prevValidationRef.current = validationKey;
    }
  }, [validationKey, isRunning]);

  // Handle simulation execution run: EXECUTES THE STUDENT'S PROGRAMMED ACTIONS SEQUENTIALLY
  useEffect(() => {
    if (!isRunning) return;

    let isCancelled = false;

    const runSequence = async () => {
      setIsDoorOpen(false);
      // Pre-simulation syntax checks
      if (validation.missingNameError) {
        soundFx.current.playErrorBuzz();
        onSimulationComplete?.(false, validation.missingNameError);
        return;
      }
      if (validation.duplicateNameError) {
        soundFx.current.playErrorBuzz();
        onSimulationComplete?.(false, validation.duplicateNameError);
        return;
      }
      if (validation.stringBooleanTrapError) {
        soundFx.current.playErrorBuzz();
        onSimulationComplete?.(false, validation.stringBooleanTrapError);
        return;
      }

      // Check if student provided action blocks
      const actions = validation.actions || [];
      if (actions.length === 0) {
        soundFx.current.playErrorBuzz();
        onSimulationComplete?.(
          false,
          "Your program declared variables, but you haven't added action blocks to transmit codes into the locks! Add 'enter [variable] into [lock]'."
        );
        return;
      }

      // Reset displayed values to empty before action execution
      setTypedValues({
        stringVal: '',
        intVal: '',
        boolVal: 'FALSE',
      });

      let stringDisengaged = false;
      let intDisengaged = false;
      let boolDisengaged = false;
      let doorOpened = false;

      for (const act of actions) {
        if (isCancelled) return;

        if (act.type === 'enter_code') {
          if (!act.varName) {
            soundFx.current.playErrorBuzz();
            onSimulationComplete?.(false, "Action Error: Please choose a variable to enter into the lock!");
            return;
          }

          const targetVar = validation.variables.find(
            v => v.varName && v.varName.toLowerCase() === act.varName?.toLowerCase()
          );

          if (!targetVar) {
            soundFx.current.playErrorBuzz();
            onSimulationComplete?.(false, `Variable Error: Variable "${act.varName}" was not declared!`);
            return;
          }

          if (act.targetLock === 'string_lock') {
            setActiveProjectionIndex(0);
            if (targetVar.varType !== 'String') {
              soundFx.current.playErrorBuzz();
              setLocks(prev => [{ ...prev[0], status: 'failed' }, prev[1], prev[2]]);
              onSimulationComplete?.(false, `Type Error: The String Lock cannot accept variable "${targetVar.varName}" of type ${targetVar.varType}!`);
              return;
            }

            const targetStr = String(targetVar.rawValue || '');
            let currentStr = '';
            for (let i = 0; i < targetStr.length; i++) {
              if (isCancelled) return;
              currentStr += targetStr[i];
              setTypedValues(prev => ({ ...prev, stringVal: currentStr }));
              soundFx.current.playKeypadClick();
              await new Promise(r => setTimeout(r, 65));
            }
            await new Promise(r => setTimeout(r, 200));

            const matched = targetStr === 'JupiterSecurity';
            stringDisengaged = matched;
            setLocks(prev => [
              {
                ...prev[0],
                status: matched ? 'unlocked' : 'failed',
                displayValue: currentStr || 'EMPTY',
                disengaged: matched,
              },
              prev[1],
              prev[2],
            ]);
            if (matched) soundFx.current.playDeadboltClank();
            else soundFx.current.playErrorBuzz();
            await new Promise(r => setTimeout(r, 500));
            if (isCancelled) return;
          } else if (act.targetLock === 'int_pinpad') {
            setActiveProjectionIndex(1);
            if (targetVar.varType !== 'int') {
              soundFx.current.playErrorBuzz();
              setLocks(prev => [prev[0], { ...prev[1], status: 'failed' }, prev[2]]);
              onSimulationComplete?.(false, `Type Error: The PIN Lock cannot accept variable "${targetVar.varName}" of type ${targetVar.varType}!`);
              return;
            }

            const targetInt = String(targetVar.rawValue ?? '');
            let currentInt = '';
            for (let i = 0; i < targetInt.length; i++) {
              if (isCancelled) return;
              currentInt += targetInt[i];
              setTypedValues(prev => ({ ...prev, intVal: currentInt }));
              soundFx.current.playKeypadClick();
              await new Promise(r => setTimeout(r, 75));
            }
            await new Promise(r => setTimeout(r, 200));

            const matched = targetVar.rawValue === 1234;
            intDisengaged = matched;
            setLocks(prev => [
              prev[0],
              {
                ...prev[1],
                status: matched ? 'unlocked' : 'failed',
                displayValue: currentInt || '----',
                disengaged: matched,
              },
              prev[2],
            ]);
            if (matched) soundFx.current.playDeadboltClank();
            else soundFx.current.playErrorBuzz();
            await new Promise(r => setTimeout(r, 500));
            if (isCancelled) return;
          } else if (act.targetLock === 'boolean_breaker') {
            setActiveProjectionIndex(2);
            if (targetVar.varType !== 'boolean') {
              soundFx.current.playErrorBuzz();
              setLocks(prev => [prev[0], prev[1], { ...prev[2], status: 'failed' }]);
              onSimulationComplete?.(false, `Type Error: The Boolean Lock cannot accept variable "${targetVar.varName}" of type ${targetVar.varType}!`);
              return;
            }

            const targetBool = targetVar.rawValue ? 'TRUE' : 'FALSE';
            soundFx.current.playKeypadClick();
            setTypedValues(prev => ({ ...prev, boolVal: targetBool }));
            await new Promise(r => setTimeout(r, 250));

            const matched = targetVar.rawValue === true;
            boolDisengaged = matched;
            setLocks(prev => [
              prev[0],
              prev[1],
              {
                ...prev[2],
                status: matched ? 'unlocked' : 'failed',
                displayValue: targetBool,
                disengaged: matched,
              },
            ]);
            if (matched) soundFx.current.playDeadboltClank();
            else soundFx.current.playErrorBuzz();
            await new Promise(r => setTimeout(r, 500));
            if (isCancelled) return;
          }
        } else if (act.type === 'unlock_doors') {
          setActiveProjectionIndex(null);
          await new Promise(r => setTimeout(r, 500));
          if (isCancelled) return;

          if (stringDisengaged && intDisengaged && boolDisengaged) {
            doorOpened = true;
            setIsDoorOpen(true);
            soundFx.current.playDoorOpenHiss();
            setTimeout(() => {
              soundFx.current.playSuccessChime();
            }, 500);

            setTimeout(() => {
              if (!isCancelled) {
                onSimulationComplete?.(true);
              }
            }, 1200);
            return;
          } else {
            soundFx.current.playErrorBuzz();
            let failMsg = "Access Denied: Cannot unlock airlock! One or more security locks are still engaged.";
            if (!stringDisengaged) failMsg = "Access Denied: String Lock was not properly disengaged.";
            else if (!intDisengaged) failMsg = "Access Denied: PIN Lock was not properly disengaged.";
            else if (!boolDisengaged) failMsg = "Access Denied: Boolean Lock was not properly disengaged.";
            onSimulationComplete?.(false, failMsg);
            return;
          }
        }
      }

      setActiveProjectionIndex(null);

      if (!doorOpened) {
        soundFx.current.playErrorBuzz();
        onSimulationComplete?.(
          false,
          "Codes were entered, but your program never commanded the airlock to unlock! Add the 'unlock airlock doors' block at the end."
        );
      }
    };

    runSequence();

    return () => {
      isCancelled = true;
    };
  }, [isRunning, validation, onSimulationComplete]);

  const isUnlocked = isDoorOpen;

  return (
    <div className="w-full h-full flex flex-col bg-[#0f051c] relative overflow-hidden select-none">
      {/* ===================================================================== */}
      {/* 1. CEILING SIREN BEACON (MOUNTED TO CEILING AT THE VERY TOP)          */}
      {/* ===================================================================== */}
      <div className="absolute top-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
        {/* Metallic Ceiling Header Strip */}
        <div className="w-full h-2 bg-[#1b0a2e] border-b border-purple-500/30" />

        {/* Ceiling Siren Dome */}
        <div className="w-12 h-6 bg-gradient-to-b from-black/60 via-[#250d3d] to-transparent rounded-b-2xl border-b-2 border-x border-white/20 flex items-center justify-center shadow-lg relative overflow-hidden">
          <span
            className={`w-5 h-4 rounded-full transition-all duration-300 ${
              isUnlocked
                ? 'bg-emerald-400 shadow-[0_0_24px_#22c55e]'
                : 'bg-red-500 shadow-[0_0_24px_#ef4444] animate-pulse'
            }`}
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. FORWARD-SHINING AMBIENT LIGHT OVERLAY (DOWN FROM CEILING)          */}
      {/* ===================================================================== */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 pointer-events-none z-30 ${
          isUnlocked
            ? 'opacity-100 bg-[radial-gradient(ellipse_80%_65%_at_50%_0%,_rgba(34,197,94,0.3)_0%,_rgba(34,197,94,0.06)_50%,_transparent_80%)]'
            : 'opacity-100 bg-[radial-gradient(ellipse_80%_65%_at_50%_0%,_rgba(239,68,68,0.28)_0%,_rgba(239,68,68,0.05)_50%,_transparent_80%)]'
        }`}
      />

      {/* ===================================================================== */}
      {/* 3. ARCHITECTURAL ROOM: WALL, RECESSED DOOR OPENING, AND GROUND FLOOR  */}
      {/* ===================================================================== */}
      <div className="flex-1 w-full flex flex-col relative min-h-0">
        {/* UPPER WALL SECTION: Frames the door opening */}
        <div className="flex-1 w-full relative flex items-end justify-center bg-gradient-to-b from-[#18072e] via-[#120524] to-[#0e041b] overflow-hidden">
          {/* Subtle architectural wall pillars on sides */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            <div className="w-16 sm:w-28 h-full bg-[#15062a] border-r border-purple-900/40" />
            <div className="w-16 sm:w-28 h-full bg-[#15062a] border-l border-purple-900/40" />
          </div>

          {/* CENTERED BLAST DOOR ASSEMBLY (DEAD-CENTER IN THE SIMULATION ROOM) */}
          <div className="relative flex items-end justify-center h-[92%] w-[72%] sm:w-[76%] max-w-[480px] sm:max-w-[520px] z-30">
            {/* THE RECESSED ARCHWAY DOOR OPENING: Anchored directly to the ground deck! */}
            <div className="w-full h-full relative flex flex-col rounded-t-3xl overflow-hidden border-t-4 border-x-4 border-[#35135f] bg-[#090214] shadow-2xl">
              {/* MOVING TEXT MARQUEE TICKER (Top of door) */}
              <div className="h-7 bg-[#140626] border-b-2 border-purple-900/50 flex items-center overflow-hidden relative shrink-0">
                {isUnlocked ? (
                  <div className="w-full flex items-center justify-center gap-1.5 text-emerald-400 font-mono font-bold text-xs tracking-wider uppercase drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
                    <CheckCircle2 size={13} />
                    <span>ACCESS GRANTED // AIRLOCK OPEN</span>
                  </div>
                ) : (
                  <div className="flex whitespace-nowrap animate-marquee">
                    <span className="text-red-500 font-mono font-bold text-xs tracking-widest uppercase drop-shadow-[0_0_8px_rgba(239,68,68,0.9)] px-4">
                      ACCESS DENIED // ACCESS DENIED // ACCESS DENIED // ACCESS DENIED // ACCESS DENIED
                    </span>
                    <span className="text-red-500 font-mono font-bold text-xs tracking-widest uppercase drop-shadow-[0_0_8px_rgba(239,68,68,0.9)] px-4">
                      ACCESS DENIED // ACCESS DENIED // ACCESS DENIED // ACCESS DENIED // ACCESS DENIED
                    </span>
                  </div>
                )}
              </div>

              {/* AIRLOCK DOOR CONTAINER: Doors slide behind wall pockets and sit on floor */}
              <div className="flex-1 relative flex overflow-hidden bg-[#070110]">
                {/* Deep Interior Corridor Revealed When Doors Slide Apart */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#18062f] via-[#0d031a] to-[#05010a] flex flex-col items-center justify-center">
                  <div className="w-36 h-48 border-2 border-emerald-400/40 rounded-2xl flex items-center justify-center bg-[#110521] shadow-[0_0_30px_rgba(34,197,94,0.25)]">
                    <div className="text-center p-2">
                      <Sparkles size={24} className="text-emerald-400 mx-auto mb-1 animate-pulse" />
                      <div className="font-mono font-bold text-xs text-white uppercase tracking-wider">
                        CLEARED
                      </div>
                    </div>
                  </div>
                </div>

                {/* LEFT SLIDING BLAST DOOR (DISTINCT PANEL SLIDING LEFT) */}
                <div
                  style={{
                    transform: isDoorOpen ? 'translateX(-100%)' : 'translateX(0%)',
                    transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className="w-1/2 h-full bg-gradient-to-r from-[#2f3542] via-[#3d4554] to-[#252a35] border-r-2 border-black/90 shadow-[inset_-4px_0_8px_rgba(0,0,0,0.7)] flex flex-col justify-between items-center p-2.5 relative z-10 select-none"
                >
                  {/* Center Seam Interlocking Lip on Left Panel */}
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#141821] border-l border-white/10 shadow-[-2px_0_4px_rgba(0,0,0,0.7)] pointer-events-none" />

                  {/* Top Hazard Bumper (distinct panel endcap) */}
                  <div className="h-3 w-[95%] self-start bg-[repeating-linear-gradient(45deg,#eab308_0,#eab308_6px,#1e293b_6px,#1e293b_12px)] rounded-md opacity-85 shadow-sm border border-black/40" />

                  {/* Inset Heavy Blast Panel Plate (no pill window, distinct mechanical geometry) */}
                  <div className="w-[92%] flex-1 my-2 rounded-lg bg-[#20252f] border border-black/60 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex flex-col justify-between items-center p-3 relative overflow-hidden">
                    {/* Subtle industrial surface bevel highlight */}
                    <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
                    
                    {/* Embossed horizontal structural panel ribs */}
                    <div className="w-full flex flex-col gap-3 my-auto opacity-70">
                      <div className="w-full h-1 bg-black/50 border-b border-white/10 rounded-full" />
                      <div className="w-4/5 h-1 bg-black/50 border-b border-white/10 rounded-full" />
                      <div className="w-full h-1 bg-black/50 border-b border-white/10 rounded-full" />
                    </div>
                  </div>

                  {/* Bottom Hazard Bumper (distinct panel endcap) */}
                  <div className="h-3 w-[95%] self-start bg-[repeating-linear-gradient(45deg,#eab308_0,#eab308_6px,#1e293b_6px,#1e293b_12px)] rounded-md opacity-85 shadow-sm border border-black/40" />
                </div>

                {/* RIGHT SLIDING BLAST DOOR (DISTINCT PANEL SLIDING RIGHT) */}
                <div
                  style={{
                    transform: isDoorOpen ? 'translateX(100%)' : 'translateX(0%)',
                    transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className="w-1/2 h-full bg-gradient-to-l from-[#2f3542] via-[#3d4554] to-[#252a35] border-l border-white/20 shadow-[inset_4px_0_8px_rgba(0,0,0,0.6)] flex flex-col justify-between items-center p-2.5 relative z-10 select-none"
                >
                  {/* Center Seam Interlocking Seal on Right Panel */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#181d26] border-r border-black/80 shadow-[2px_0_4px_rgba(0,0,0,0.5)] pointer-events-none" />

                  {/* Top Hazard Bumper (distinct panel endcap) */}
                  <div className="h-3 w-[95%] self-end bg-[repeating-linear-gradient(-45deg,#eab308_0,#eab308_6px,#1e293b_6px,#1e293b_12px)] rounded-md opacity-85 shadow-sm border border-black/40" />

                  {/* Inset Heavy Blast Panel Plate (no pill window, distinct mechanical geometry) */}
                  <div className="w-[92%] flex-1 my-2 rounded-lg bg-[#20252f] border border-black/60 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex flex-col justify-between items-center p-3 relative overflow-hidden">
                    {/* Subtle industrial surface bevel highlight */}
                    <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
                    
                    {/* Embossed horizontal structural panel ribs */}
                    <div className="w-full flex flex-col gap-3 my-auto opacity-70">
                      <div className="w-full h-1 bg-black/50 border-b border-white/10 rounded-full" />
                      <div className="w-4/5 ml-auto h-1 bg-black/50 border-b border-white/10 rounded-full" />
                      <div className="w-full h-1 bg-black/50 border-b border-white/10 rounded-full" />
                    </div>
                  </div>

                  {/* Bottom Hazard Bumper (distinct panel endcap) */}
                  <div className="h-3 w-[95%] self-end bg-[repeating-linear-gradient(-45deg,#eab308_0,#eab308_6px,#1e293b_6px,#1e293b_12px)] rounded-md opacity-85 shadow-sm border border-black/40" />
                </div>
              </div>
            </div>

            {/* METALLIC DIGITAL LOCKS RIG (STRADDLING BETWEEN THE EDGE OF THE DOOR AND INSIDE IT) */}
            <div className="absolute right-[-20px] sm:right-[-24px] bottom-11 sm:bottom-13 flex flex-col gap-2 z-40 select-none pointer-events-auto">

              {/* 1. LOCK: STRING (METALLIC FINISH) */}
              <div
                style={{
                  transform: locks[0].disengaged ? 'translateX(22px)' : 'translateX(0px)',
                  transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className={`w-[84px] sm:w-[90px] p-1.5 rounded-md border-t border-l border-b-2 border-r-2 transition-all duration-300 relative shadow-xl flex flex-col gap-0.5 ${
                  locks[0].disengaged
                    ? 'bg-gradient-to-b from-[#1c382e] via-[#0f2920] to-[#0a1e17] border-t-emerald-300/80 border-l-emerald-300/60 border-b-black border-r-black ring-1 ring-emerald-400/70 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                    : locks[0].status === 'failed'
                    ? 'bg-gradient-to-b from-[#401923] via-[#2b0e15] to-[#1c080d] border-t-rose-400/80 border-l-rose-400/60 border-b-black border-r-black ring-1 ring-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                    : activeProjectionIndex === 0
                    ? 'bg-gradient-to-b from-[#382b52] via-[#241a38] to-[#150d24] border-t-purple-300/80 border-l-purple-300/60 border-b-black border-r-black ring-1 ring-purple-400/70 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                    : 'bg-gradient-to-b from-[#3d4654] via-[#28303d] to-[#1b212b] border-t-slate-300/70 border-l-slate-300/50 border-b-black border-r-black hover:border-t-slate-200'
                }`}
              >
                {/* 4 Precision Metallic Corner Screws */}
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-700 shadow-inner" />
                <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-700 shadow-inner" />
                <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-700 shadow-inner" />
                <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-700 shadow-inner" />

                {/* Deadbolt Plunger that locks directly into the door frame */}
                <div
                  className={`absolute -left-2.5 top-1/2 -translate-y-1/2 h-2.5 rounded-l-sm border-y border-l transition-all duration-500 ${
                    locks[0].disengaged
                      ? 'w-1 -left-1 bg-emerald-500 border-emerald-300 shadow-[0_0_6px_#10b981]'
                      : 'w-3 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 border-slate-600 shadow-[0_1px_3px_rgba(0,0,0,0.6)]'
                  }`}
                  title={locks[0].disengaged ? "Deadbolt Disengaged" : "Deadbolt Locked Into Door Frame"}
                />

                <div className="flex items-center justify-between pl-1 pr-0.5">
                  <span className="font-mono font-black text-[7.5px] sm:text-[8px] text-slate-200 uppercase tracking-tight drop-shadow-sm truncate">
                    STRING LOCK
                  </span>
                  {/* Recessed Metallic LED Bezel */}
                  <div className="w-2.5 h-2.5 shrink-0 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-500/80 p-0.5 shadow-inner flex items-center justify-center">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        locks[0].disengaged
                          ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                          : locks[0].status === 'failed'
                          ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                          : activeProjectionIndex === 0
                          ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse'
                          : 'bg-red-500 shadow-[0_0_4px_#ef4444]'
                      }`}
                    />
                  </div>
                </div>
                {/* Recessed Dark Glass LCD Screen */}
                <div className="h-4 px-1 rounded bg-[#070b10] border border-slate-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center overflow-hidden">
                  <span className="font-mono text-[7px] sm:text-[7.5px] font-semibold tracking-tight text-purple-300 drop-shadow-[0_0_4px_rgba(192,132,252,0.8)] truncate">
                    {typedValues.stringVal || 'LOCKED'}
                  </span>
                </div>
              </div>

              {/* 2. LOCK: INT PIN (METALLIC FINISH) */}
              <div
                style={{
                  transform: locks[1].disengaged ? 'translateX(22px)' : 'translateX(0px)',
                  transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className={`w-[84px] sm:w-[90px] p-1.5 rounded-md border-t border-l border-b-2 border-r-2 transition-all duration-300 relative shadow-xl flex flex-col gap-0.5 ${
                  locks[1].disengaged
                    ? 'bg-gradient-to-b from-[#1c382e] via-[#0f2920] to-[#0a1e17] border-t-emerald-300/80 border-l-emerald-300/60 border-b-black border-r-black ring-1 ring-emerald-400/70 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                    : locks[1].status === 'failed'
                    ? 'bg-gradient-to-b from-[#401923] via-[#2b0e15] to-[#1c080d] border-t-rose-400/80 border-l-rose-400/60 border-b-black border-r-black ring-1 ring-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                    : activeProjectionIndex === 1
                    ? 'bg-gradient-to-b from-[#382b52] via-[#241a38] to-[#150d24] border-t-purple-300/80 border-l-purple-300/60 border-b-black border-r-black ring-1 ring-purple-400/70 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                    : 'bg-gradient-to-b from-[#3d4654] via-[#28303d] to-[#1b212b] border-t-slate-300/70 border-l-slate-300/50 border-b-black border-r-black hover:border-t-slate-200'
                }`}
              >
                {/* 4 Precision Metallic Corner Screws */}
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-700 shadow-inner" />
                <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-700 shadow-inner" />
                <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-700 shadow-inner" />
                <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-700 shadow-inner" />

                {/* Deadbolt Plunger that locks directly into the door frame */}
                <div
                  className={`absolute -left-2.5 top-1/2 -translate-y-1/2 h-2.5 rounded-l-sm border-y border-l transition-all duration-500 ${
                    locks[1].disengaged
                      ? 'w-1 -left-1 bg-emerald-500 border-emerald-300 shadow-[0_0_6px_#10b981]'
                      : 'w-3 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 border-slate-600 shadow-[0_1px_3px_rgba(0,0,0,0.6)]'
                  }`}
                  title={locks[1].disengaged ? "Deadbolt Disengaged" : "Deadbolt Locked Into Door Frame"}
                />

                <div className="flex items-center justify-between pl-1 pr-0.5">
                  <span className="font-mono font-black text-[7.5px] sm:text-[8px] text-slate-200 uppercase tracking-tight drop-shadow-sm truncate">
                    PIN LOCK
                  </span>
                  {/* Recessed Metallic LED Bezel */}
                  <div className="w-2.5 h-2.5 shrink-0 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-500/80 p-0.5 shadow-inner flex items-center justify-center">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        locks[1].disengaged
                          ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                          : locks[1].status === 'failed'
                          ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                          : activeProjectionIndex === 1
                          ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse'
                          : 'bg-red-500 shadow-[0_0_4px_#ef4444]'
                      }`}
                    />
                  </div>
                </div>
                {/* Recessed Dark Glass LCD Screen */}
                <div className="h-4 px-1 rounded bg-[#070b10] border border-slate-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center overflow-hidden">
                  <span className="font-mono text-[9px] sm:text-[9.5px] font-semibold text-emerald-300 drop-shadow-[0_0_4px_rgba(52,211,153,0.8)] truncate">
                    {typedValues.intVal ? `PIN: ${typedValues.intVal}` : 'PIN: ----'}
                  </span>
                </div>
              </div>

              {/* 3. LOCK: BOOLEAN (METALLIC FINISH) */}
              <div
                style={{
                  transform: locks[2].disengaged ? 'translateX(22px)' : 'translateX(0px)',
                  transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className={`w-[84px] sm:w-[90px] p-1.5 rounded-md border-t border-l border-b-2 border-r-2 transition-all duration-300 relative shadow-xl flex flex-col gap-0.5 ${
                  locks[2].disengaged
                    ? 'bg-gradient-to-b from-[#1c382e] via-[#0f2920] to-[#0a1e17] border-t-emerald-300/80 border-l-emerald-300/60 border-b-black border-r-black ring-1 ring-emerald-400/70 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                    : locks[2].status === 'failed'
                    ? 'bg-gradient-to-b from-[#401923] via-[#2b0e15] to-[#1c080d] border-t-rose-400/80 border-l-rose-400/60 border-b-black border-r-black ring-1 ring-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                    : activeProjectionIndex === 2
                    ? 'bg-gradient-to-b from-[#382b52] via-[#241a38] to-[#150d24] border-t-purple-300/80 border-l-purple-300/60 border-b-black border-r-black ring-1 ring-purple-400/70 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                    : 'bg-gradient-to-b from-[#3d4654] via-[#28303d] to-[#1b212b] border-t-slate-300/70 border-l-slate-300/50 border-b-black border-r-black hover:border-t-slate-200'
                }`}
              >
                {/* 4 Precision Metallic Corner Screws */}
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-700 shadow-inner" />
                <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-700 shadow-inner" />
                <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-700 shadow-inner" />
                <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-700 shadow-inner" />

                {/* Deadbolt Plunger that locks directly into the door frame */}
                <div
                  className={`absolute -left-2.5 top-1/2 -translate-y-1/2 h-2.5 rounded-l-sm border-y border-l transition-all duration-500 ${
                    locks[2].disengaged
                      ? 'w-1 -left-1 bg-emerald-500 border-emerald-300 shadow-[0_0_6px_#10b981]'
                      : 'w-3 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-400 border-slate-600 shadow-[0_1px_3px_rgba(0,0,0,0.6)]'
                  }`}
                  title={locks[2].disengaged ? "Deadbolt Disengaged" : "Deadbolt Locked Into Door Frame"}
                />

                <div className="flex items-center justify-between pl-1 pr-0.5">
                  <span className="font-mono font-black text-[7.5px] sm:text-[8px] text-slate-200 uppercase tracking-tight drop-shadow-sm truncate">
                    BOOLEAN LOCK
                  </span>
                  {/* Recessed Metallic LED Bezel */}
                  <div className="w-2.5 h-2.5 shrink-0 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-500/80 p-0.5 shadow-inner flex items-center justify-center">
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        locks[2].disengaged
                          ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                          : locks[2].status === 'failed'
                          ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                          : activeProjectionIndex === 2
                          ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse'
                          : 'bg-red-500 shadow-[0_0_4px_#ef4444]'
                      }`}
                    />
                  </div>
                </div>
                {/* Recessed Dark Glass LCD Screen */}
                <div className="h-4 px-1 rounded bg-[#070b10] border border-slate-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center overflow-hidden">
                  <span className="font-mono text-[9px] sm:text-[9.5px] font-semibold text-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)] truncate">
                    {typedValues.boolVal || 'FALSE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GROUND FLOOR PLANE: Darker rich sci-fi purple, solidly anchors the door frame */}
        <div className="h-20 sm:h-24 w-full bg-gradient-to-t from-[#160628] via-[#110420] to-[#0c0317] border-t-2 border-[#3f1366] relative z-20 shadow-inner">
          {/* Subtle perspective floor lines */}
          <div className="w-full h-full flex justify-center items-start pt-2 gap-24 opacity-25 pointer-events-none">
            <div className="w-0.5 h-full bg-purple-500/40" />
            <div className="w-0.5 h-full bg-purple-500/40" />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. ACTUAL CLIPBOARD                                                   */}
      {/* ===================================================================== */}
      <div className="absolute bottom-4 left-4 z-40">
        <button
          onClick={() => setIsClipboardOpen(prev => !prev)}
          className={`px-3 py-2 rounded-xl border transition-all cursor-pointer shadow-lg flex items-center gap-2 ${
            failCount >= 3
              ? 'bg-amber-500 text-black border-amber-300 ring-2 ring-amber-300 animate-pulse'
              : isClipboardOpen
              ? 'bg-[#ff912d] text-black border-[#ffc107]'
              : 'bg-[#150a24] hover:bg-[#200f38] text-amber-300 border-amber-500/40 hover:border-amber-400'
          }`}
          title="View Security Codes"
        >
          <ClipboardList size={18} />
          <span className="font-display font-bold text-xs uppercase tracking-wider hidden sm:inline">
            Security Codes
          </span>
        </button>

        {/* Real Physical Clipboard Pop-up */}
        {isClipboardOpen && (
          <div className="absolute bottom-14 left-0 w-72 sm:w-80 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Wooden Clipboard Backing */}
            <div className="bg-[#3e2412] border-4 border-[#251509] rounded-2xl shadow-2xl p-3 relative pt-5">
              {/* Metallic Silver Spring Clip at Top Center */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 border border-gray-500 rounded-b-md shadow-md flex items-center justify-center">
                <div className="w-12 h-1.5 bg-gray-600 rounded-full opacity-60" />
              </div>

              {/* Close Button (Prominent, High-Contrast Visibility) */}
              <button
                onClick={() => setIsClipboardOpen(false)}
                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/70 hover:bg-rose-600 border border-white/40 hover:border-rose-400 text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer z-20 group"
                title="Close"
                aria-label="Close Security Codes"
              >
                <X size={16} className="text-white group-hover:scale-110 transition-transform stroke-[2.5]" />
              </button>

              {/* Paper Sheet Clipped to Board */}
              <div className="bg-[#fbf7ee] text-[#1e293b] rounded-lg p-3.5 shadow-inner border border-[#e5dcd0] font-mono">
                {/* Paper Header: "Security Codes" and "Please insert into correct lock." */}
                <div className="border-b-2 border-[#1e293b]/20 pb-2 mb-3 text-center">
                  <div className="text-[12px] font-black tracking-widest text-[#1e293b] uppercase">
                    Security Codes
                  </div>
                  <div className="text-[9px] font-bold text-gray-500 tracking-wide mt-0.5">
                    Please insert into correct lock.
                  </div>
                </div>

                {/* Direct Credentials */}
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between p-1.5 bg-[#f0eae0] rounded border border-[#dfd5c5]">
                    <span className="font-bold text-gray-600 text-[11px]">PASSWORD:</span>
                    <span className="font-black text-[#1e1b4b] bg-white px-2 py-0.5 rounded border border-gray-300">
                      &quot;JupiterSecurity&quot;
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 bg-[#f0eae0] rounded border border-[#dfd5c5]">
                    <span className="font-bold text-gray-600 text-[11px]">PIN:</span>
                    <span className="font-black text-[#064e3b] bg-white px-2 py-0.5 rounded border border-gray-300">
                      1234
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-1.5 bg-[#f0eae0] rounded border border-[#dfd5c5]">
                    <span className="font-bold text-gray-600 text-[11px]">BOOLEAN:</span>
                    <span className="font-black text-[#78350f] bg-white px-2 py-0.5 rounded border border-gray-300">
                      true
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
