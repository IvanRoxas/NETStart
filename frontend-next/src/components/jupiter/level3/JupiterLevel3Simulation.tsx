"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import VaultCanvas from './VaultCanvas';
import {
  PlayerBlueprint,
  auditBlueprint,
  AuditResult,
} from '@/lib/jupiter/jupiterLevel3Definitions';
import {
  ShieldAlert,
  X,
  Info,
} from 'lucide-react';

interface JupiterLevel3SimulationProps {
  blueprint: PlayerBlueprint | null;
  isRunning: boolean;
  onRunSimulation: () => void;
  onResetSimulation: () => void;
  onSimulationComplete: () => void;
  onStopRunning?: () => void;
  onClueRead?: (allRead: boolean) => void;
  onExitToModules?: () => void;
}

export default function JupiterLevel3Simulation({
  blueprint,
  isRunning,
  onRunSimulation,
  onResetSimulation,
  onSimulationComplete,
  onStopRunning,
  onClueRead,
  onExitToModules,
}: JupiterLevel3SimulationProps) {
  // Vault & Audit State
  const [vaultStatus, setVaultStatus] = useState<'LOCKED' | 'UNLOCKED'>('LOCKED');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'failed' | 'success'>('idle');
  const [failedSlot, setFailedSlot] = useState<1 | 2 | 3 | 4 | undefined>(undefined);
  const [activeScanSlot, setActiveScanSlot] = useState<1 | 2 | 3 | 4 | null>(null);
  const [clueStatus, setClueStatus] = useState<Record<1 | 2 | 3 | 4, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const [activeClue, setActiveClue] = useState<1 | 2 | 3 | 4 | null>(null);
  const [failCount, setFailCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Context Ref (Safe browser synthesized audio for event SFX only)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);
  const blueprintRef = useRef(blueprint);
  blueprintRef.current = blueprint;
  const scanStateRef = useRef(scanState);
  scanStateRef.current = scanState;
  const vaultStatusRef = useRef(vaultStatus);
  vaultStatusRef.current = vaultStatus;

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

  const playChirpSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch { }
  }, [getAudioContext]);

  const playTypingSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      for (let i = 0; i < 7; i++) {
        const time = now + 0.08 + i * 0.035;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 400, time);
        gain.gain.setValueAtTime(0.015, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.02);
      }
    } catch { }
  }, [getAudioContext]);

  const playScanSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch { }
  }, [getAudioContext]);

  const playBuzzerSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.setValueAtTime(120, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch { }
  }, [getAudioContext]);

  const playSuccessSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.5);
      });

      // Pneumatic locks release sound
      const rumbleOsc = ctx.createOscillator();
      const rumbleGain = ctx.createGain();
      rumbleOsc.type = 'sawtooth';
      rumbleOsc.frequency.setValueAtTime(80, ctx.currentTime + 0.5);
      rumbleOsc.frequency.linearRampToValueAtTime(35, ctx.currentTime + 1.8);
      rumbleGain.gain.setValueAtTime(0.05, ctx.currentTime + 0.5);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
      rumbleOsc.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);
      rumbleOsc.start(ctx.currentTime + 0.5);
      rumbleOsc.stop(ctx.currentTime + 1.8);
    } catch { }
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

  // Datapad interactions
  const handleOpenClue = (id: 1 | 2 | 3 | 4) => {
    playChirpSound();
    playTypingSound();
    setClueStatus(prev => {
      if (prev[id]) return prev;
      return { ...prev, [id]: true };
    });
    setActiveClue(id);
  };

  // Safely notify parent when all 4 clues have been collected
  useEffect(() => {
    if (onClueRead && Object.values(clueStatus).every(Boolean)) {
      onClueRead(true);
    }
  }, [clueStatus, onClueRead]);

  const handleCloseClue = () => {
    setActiveClue(null);
  };

  // Execution-Only Interrogation Trigger
  const startScan = useCallback((latestBlueprintParam?: PlayerBlueprint | null) => {
    if (
      scanStateRef.current === 'scanning' ||
      scanStateRef.current === 'success' ||
      vaultStatusRef.current === 'UNLOCKED'
    ) {
      return;
    }

    setActiveClue(null);
    setToastMessage(null);
    setFailedSlot(undefined);
    setScanState('scanning');
    setActiveScanSlot(1);
    playScanSound();

    const t2 = setTimeout(() => {
      setActiveScanSlot(2);
      playChirpSound();
    }, 1100);
    activeTimersRef.current.push(t2);

    const t3 = setTimeout(() => {
      setActiveScanSlot(3);
      playChirpSound();
    }, 2200);
    activeTimersRef.current.push(t3);

    const t4 = setTimeout(() => {
      setActiveScanSlot(4);
      playChirpSound();
    }, 3300);
    activeTimersRef.current.push(t4);

    const timerEnd = setTimeout(() => {
      setActiveScanSlot(null);
      const latestBlueprint = latestBlueprintParam || blueprintRef.current || {
        classes: {},
        instantiations: [],
        rawJavaCode: '',
      };

      const audit: AuditResult = auditBlueprint(latestBlueprint);

      if (audit.success) {
        setScanState('success');
        setFailedSlot(undefined);
        setVaultStatus('UNLOCKED');
        playSuccessSound();
        onStopRunning?.();
        const winTimer = setTimeout(() => {
          onSimulationComplete();
        }, 1200);
        activeTimersRef.current.push(winTimer);
      } else {
        setScanState('failed');
        setFailedSlot(audit.failedSlot);
        setVaultStatus('LOCKED');
        playBuzzerSound();
        setToastMessage(audit.message);
        const toastTimer = setTimeout(() => {
          setToastMessage(prev => (prev === audit.message ? null : prev));
        }, 6500);
        activeTimersRef.current.push(toastTimer);
        setFailCount(prev => prev + 1);
        onStopRunning?.();
      }
    }, 4400);

    activeTimersRef.current.push(timerEnd);
  }, [playScanSound, playChirpSound, playSuccessSound, playBuzzerSound, onSimulationComplete, onStopRunning]);

  // Synchronize when external Blockly bottom bar triggers isRunning
  useEffect(() => {
    if (isRunning) {
      startScan();
    } else if (scanStateRef.current === 'scanning') {
      // Abort ongoing scan immediately if stopped externally
      activeTimersRef.current.forEach(t => clearTimeout(t));
      activeTimersRef.current = [];
      setActiveScanSlot(null);
      setScanState('idle');
    }
  }, [isRunning, startScan]);

  // When workspace changes after a failed scan, reset to idle so approval requires a new scan
  useEffect(() => {
    if (scanState === 'failed') {
      setScanState('idle');
      setFailedSlot(undefined);
    }
  }, [blueprint, scanState]);

  // Reset Level
  const handleReset = () => {
    activeTimersRef.current.forEach(t => clearTimeout(t));
    activeTimersRef.current = [];
    setActiveScanSlot(null);
    setVaultStatus('LOCKED');
    setScanState('idle');
    setFailedSlot(undefined);
    setClueStatus({ 1: false, 2: false, 3: false, 4: false });
    setActiveClue(null);
    setFailCount(0);
    setToastMessage(null);
    onStopRunning?.();
    onResetSimulation();
  };

  // 4-Party Checks
  const admin = blueprint?.classes?.['AdminProfile'];
  const adminHasUnlock = Boolean(admin?.methods?.includes('UNLOCK_DOORS') || admin?.methods?.includes('OVERRIDE'));
  const adminHasAlarm = Boolean(admin?.methods?.includes('SOUND_ALARM') || admin?.methods?.includes('REBOOT'));
  const isCheck1Passed = Boolean(
    admin &&
    Boolean(admin.hasPrivateClearance || (admin.isPrivate && !admin.hasPublicLeak)) &&
    ((admin.clearanceLevel || 0) === 4 || (admin.clearanceLevel || 0) === 5) &&
    (admin.role === 'Admin' || (admin.role || '').toLowerCase() === 'admin') &&
    Boolean(admin.hasPublicRole || admin.role) &&
    adminHasUnlock &&
    adminHasAlarm
  );

  const tech = blueprint?.classes?.['TechProfile'];
  const techHasFix = Boolean(tech?.methods?.includes('FIX_ERRORS') || tech?.methods?.includes('DIAGNOSTICS'));
  const techHasHealth = Boolean(tech?.methods?.includes('CHECK_HEALTH') || tech?.methods?.includes('CALIBRATE'));
  const isCheck2Passed = Boolean(
    tech &&
    Boolean(tech.hasPrivateClearance || (tech.isPrivate && !tech.hasPublicLeak)) &&
    (tech.clearanceLevel || 0) === 3 &&
    (tech.role || '').trim().toLowerCase() === 'maintenance' &&
    Boolean(tech.hasPublicRole || tech.role) &&
    techHasFix &&
    techHasHealth
  );

  const sec = blueprint?.classes?.['SecurityProfile'];
  const secHasAlarm = Boolean(sec?.methods?.includes('SOUND_ALARM') || sec?.methods?.includes('OVERRIDE'));
  const secHasScan = Boolean(sec?.methods?.includes('SCAN_ROOM') || sec?.methods?.includes('SCAN_INTRUDERS'));
  const isCheck3Passed = Boolean(
    sec &&
    Boolean(sec.hasPrivateClearance || (sec.isPrivate && !sec.hasPublicLeak)) &&
    (sec.clearanceLevel || 0) === 2 &&
    (sec.role || '').trim().toLowerCase() === 'security' &&
    Boolean(sec.hasPublicRole || sec.role) &&
    ((secHasAlarm && secHasScan) || sec?.methods?.includes('SCAN_INTRUDERS'))
  );

  const visitor = blueprint?.classes?.['VisitorProfile'];
  const visitorHasTour = Boolean(visitor?.methods?.includes('TAKE_TOUR') || visitor?.methods?.includes('TOUR'));
  const isCheck4Passed = Boolean(
    visitor &&
    Boolean(visitor.hasPrivateClearance || (visitor.isPrivate && !visitor.hasPublicLeak)) &&
    (visitor.clearanceLevel || 0) === 1 &&
    (visitor.role || '').trim().toLowerCase() === 'visitor' &&
    Boolean(visitor.hasPublicRole || visitor.role) &&
    visitorHasTour
  );

  const displayChecksCount = vaultStatus === 'UNLOCKED'
    ? 4
    : scanState === 'failed'
    ? (isCheck1Passed && failedSlot !== 1 ? 1 : 0) +
      (isCheck2Passed && failedSlot !== 2 ? 1 : 0) +
      (isCheck3Passed && failedSlot !== 3 ? 1 : 0) +
      (isCheck4Passed && failedSlot !== 4 ? 1 : 0)
    : 0;

  return (
    <div className="w-full h-full flex flex-col bg-[#070b12] text-white relative overflow-hidden select-none">
      {/* Clean Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0b101b] border-b border-white/10 shrink-0 z-30">
        {/* Left: Simple Vault Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              vaultStatus === 'LOCKED'
                ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse'
                : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
            }`}
          />
          <span
            className={`text-xs font-mono font-bold tracking-wide ${
              vaultStatus === 'LOCKED' ? 'text-rose-300' : 'text-emerald-300'
            }`}
          >
            {vaultStatus === 'LOCKED' ? 'VAULT LOCKED' : 'VAULT UNLOCKED'}
          </span>
        </div>

        {/* Right: Checks Count */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-gray-400">
            Checks:{' '}
            <strong
              className={`font-bold ${
                displayChecksCount === 4 ? 'text-emerald-400' : 'text-[#ff912d]'
              }`}
            >
              {displayChecksCount}/4
            </strong>
          </span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        <VaultCanvas
          vaultStatus={vaultStatus}
          scanState={scanState}
          blueprint={blueprint}
          failedSlot={failedSlot}
          activeScanSlot={activeScanSlot}
          clueStatus={clueStatus}
          activeClue={activeClue}
          onOpenClue={handleOpenClue}
          onCloseClue={handleCloseClue}
        />

        {/* Custom UI Audit Failure Toast / Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 max-w-sm w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-[#180b12]/95 border border-rose-500/70 rounded-xl px-3.5 py-2.5 shadow-[0_0_25px_rgba(244,63,94,0.35)] flex items-center gap-2.5 backdrop-blur-md">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                <ShieldAlert size={16} />
              </div>
              <div className="flex-1 text-xs">
                <div className="text-[9px] uppercase font-mono font-bold tracking-wider text-rose-400">
                  Check Failed
                </div>
                <p className="text-rose-100 font-sans text-[11px] font-medium leading-snug">
                  {toastMessage}
                </p>
              </div>
              <button
                id="jupiter3_toast_dismiss_btn"
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
