"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PartyPopper, AlertCircle, CheckCircle2, XCircle, X } from 'lucide-react';
import type { MarsLevel3Validation } from '@/lib/mars/marsLevel3Definitions';

interface SimulationConsoleProps {
  validation: MarsLevel3Validation;
  isRunning: boolean;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
}

export default function SimulationConsole({
  validation,
  isRunning,
  onSimulationComplete,
}: SimulationConsoleProps) {
  const [beamActive, setBeamActive] = useState(false);
  const [earthConnected, setEarthConnected] = useState(false);
  const [venusConnected, setVenusConnected] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [scanResult, setScanResult] = useState<{
    show: boolean;
    errorCode: number | null;
    errorMessage: string;
    hasContainer: boolean;
    hasHeading: boolean;
    hasSeal: boolean;
    hasLinks: boolean;
  } | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const animTimeouts = useRef<NodeJS.Timeout[]>([]);

  const playBeamSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(520, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.9);
    } catch {}
  };

  const playVictorySound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.28, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.62);
      });
    } catch {}
  };

  const clearAllTimeouts = () => {
    animTimeouts.current.forEach((t) => clearTimeout(t));
    animTimeouts.current = [];
  };

  useEffect(() => {
    if (isRunning) {
      clearAllTimeouts();
      setScanResult(null);
      setShowCelebration(false);
      setEarthConnected(false);
      setVenusConnected(false);
      setBeamActive(true);
      playBeamSound();

      const t1 = setTimeout(() => { if (validation.hasEarthLink) setEarthConnected(true); }, 1200);
      const t2 = setTimeout(() => { if (validation.hasVenusLink) setVenusConnected(true); }, 2200);
      const tFinal = setTimeout(() => {
        setBeamActive(false);
        const isSuccess = validation.isGoldenPath;
        if (isSuccess) {
          playVictorySound();
          setShowCelebration(true);
        } else {
          setScanResult({
            show: true,
            errorCode: validation.failErrorCode,
            errorMessage: validation.failErrorMessage || 'Transmission incomplete. Check your blocks and try again.',
            hasContainer: validation.hasContainer,
            hasHeading: validation.hasHeading,
            hasSeal: validation.hasValidSeal,
            hasLinks: validation.hasEarthLink && validation.hasVenusLink && !validation.hasDecoys,
          });
        }
        if (onSimulationComplete) onSimulationComplete(isSuccess);
      }, 3400);

      animTimeouts.current.push(t1, t2, tFinal);
    } else {
      clearAllTimeouts();
      setBeamActive(false);
      setShowCelebration(false);
    }
    return () => clearAllTimeouts();
  }, [isRunning, validation]);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col select-none cursor-default font-sans">

      {/* SKY */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#02010a] via-[#0c0520] to-[#1a0907]" />

      {/* STARS */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(1px 1px at 10% 10%, #fff, transparent),
          radial-gradient(1.5px 1.5px at 22% 18%, #a5f3fc, transparent),
          radial-gradient(1px 1px at 38% 8%, #fde047, transparent),
          radial-gradient(1px 1px at 55% 14%, #e9d5ff, transparent),
          radial-gradient(1.5px 1.5px at 68% 6%, #fff, transparent),
          radial-gradient(1px 1px at 80% 20%, #f472b6, transparent),
          radial-gradient(1px 1px at 90% 12%, #fff, transparent),
          radial-gradient(2px 2px at 15% 30%, #fff, transparent),
          radial-gradient(1px 1px at 48% 25%, #a5f3fc, transparent),
          radial-gradient(1px 1px at 78% 32%, #fde047, transparent)
        `,
      }} />

      {/* VENUS — left, upper sky */}
      <div
        className="absolute z-10"
        style={{ left: '5%', top: '8%' }}
      >
        <div className={`relative transition-all duration-700 ${venusConnected ? 'drop-shadow-[0_0_24px_rgba(253,224,71,0.8)]' : ''}`}>
          <img src="/assets/planets/celestial/Venus.svg" alt="Venus" className="w-20 h-20 sm:w-28 sm:h-28 object-contain" />
          {/* Mini tower on top of Venus */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center">
            <div className={`w-[1.5px] h-4 bg-slate-300 transition-all ${venusConnected ? 'shadow-[0_0_4px_#fde047]' : ''}`} />
            <div className={`w-3 h-1 rounded-t-full border -mt-px ${venusConnected ? 'border-amber-300 bg-amber-100' : 'border-slate-400 bg-slate-500'}`} />
          </div>
          {venusConnected && (
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-amber-300 whitespace-nowrap">ONLINE ✓</div>
          )}
        </div>
      </div>

      {/* MERCURY — right, upper sky */}
      <div
        className="absolute z-10"
        style={{ right: '5%', top: '10%' }}
      >
        <div className={`relative transition-all duration-700 ${earthConnected ? 'drop-shadow-[0_0_24px_rgba(148,163,184,0.8)]' : ''}`}>
          <img src="/assets/planets/celestial/Mercury.svg" alt="Mercury" className="w-16 h-16 sm:w-24 sm:h-24 object-contain" />
          {/* Mini tower on top of Mercury */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center">
            <div className={`w-[1.5px] h-3.5 bg-slate-300 transition-all ${earthConnected ? 'shadow-[0_0_4px_#94a3b8]' : ''}`} />
            <div className={`w-2.5 h-1 rounded-t-full border -mt-px ${earthConnected ? 'border-slate-300 bg-slate-200' : 'border-slate-400 bg-slate-500'}`} />
          </div>
          {earthConnected && (
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-slate-300 whitespace-nowrap">ONLINE ✓</div>
          )}
        </div>
      </div>

      {/* MARS TERRAIN */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{ height: '38%' }}>
        <svg viewBox="0 0 800 180" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9a3412" />
              <stop offset="100%" stopColor="#450a03" />
            </linearGradient>
            <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c2d0a" />
              <stop offset="100%" stopColor="#1c0805" />
            </linearGradient>
          </defs>
          <path d="M0,75 Q120,30 240,68 Q350,108 460,45 Q560,0 660,55 Q740,100 800,52 L800,180 L0,180 Z" fill="url(#hill1)" opacity="0.6" />
          <path d="M0,110 Q100,78 200,105 Q310,132 400,85 Q500,48 600,100 Q700,142 800,95 L800,180 L0,180 Z" fill="url(#hill2)" />
        </svg>
      </div>

      {/* ASTROLINK SCEPTER */}
      <div className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center" style={{ bottom: '5%' }}>

        {/* Upward beam from orb */}
        {beamActive && (
          <div className="absolute pointer-events-none" style={{ bottom: '86%', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '280px' }}>
            <div className="w-full h-full bg-gradient-to-t from-cyan-300 via-sky-200/40 to-transparent animate-pulse" style={{ boxShadow: '0 0 22px #7dd3fc, 0 0 60px #0ea5e9' }} />
          </div>
        )}
        {beamActive && (
          <>
            <div className="absolute pointer-events-none rounded-full border-2 border-sky-300/60 animate-ping"
              style={{ width: 100, height: 100, bottom: '82%', left: '50%', transform: 'translateX(-50%)', animationDuration: '1s' }} />
            <div className="absolute pointer-events-none rounded-full border border-sky-200/30 animate-ping"
              style={{ width: 170, height: 170, bottom: '78%', left: '50%', transform: 'translateX(-50%)', animationDuration: '1.6s' }} />
          </>
        )}

        {/* Scepter SVG — base at very bottom of viewBox */}
        <svg
          viewBox="0 0 100 360"
          className="w-20 sm:w-24 md:w-28"
          style={{
            filter: beamActive
              ? 'drop-shadow(0 0 22px #7dd3fc) drop-shadow(0 0 55px #0ea5e9)'
              : 'drop-shadow(0 6px 24px rgba(0,0,0,0.9))',
            transition: 'filter 0.4s',
          }}
        >
          <defs>
            {/* Chrome orb */}
            <radialGradient id="chromeOrb" cx="38%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="25%" stopColor="#e2e8f0" />
              <stop offset="60%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#1e293b" />
            </radialGradient>
            {/* Orb glow when active */}
            <radialGradient id="orbActiveGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
            {/* Chrome shaft */}
            <linearGradient id="chromShaft" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="30%" stopColor="#94a3b8" />
              <stop offset="50%" stopColor="#f1f5f9" />
              <stop offset="70%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            {/* Chrome collar */}
            <linearGradient id="chromCollar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="40%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            {/* Chrome base */}
            <linearGradient id="chromBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          {/* ORB GLOW HALO (active only) */}
          {beamActive && (
            <circle cx="50" cy="52" r="46" fill="url(#orbActiveGlow)" />
          )}

          {/* ORB BODY */}
          <circle cx="50" cy="52" r="38"
            fill="url(#chromeOrb)"
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {/* Orb highlight (top-left shine) */}
          <ellipse cx="37" cy="37" rx="13" ry="9" fill="white" opacity="0.35" transform="rotate(-25 37 37)" />

          {/* Orb equator ring */}
          <ellipse cx="50" cy="52" rx="38" ry="10"
            fill="none"
            stroke={beamActive ? '#7dd3fc' : '#64748b'}
            strokeWidth="1.2"
            opacity="0.6"
            style={{ transition: 'stroke 0.4s' }}
          />

          {/* Orb bottom reflection */}
          <ellipse cx="58" cy="72" rx="12" ry="5" fill="#e2e8f0" opacity="0.15" />

          {/* Beacon at very top of orb */}
          <circle cx="50" cy="16" r="4.5" fill={beamActive ? '#7dd3fc' : '#dc2626'} style={{ transition: 'fill 0.3s' }}>
            {beamActive && <animate attributeName="opacity" values="1;0.1;1" dur="0.55s" repeatCount="indefinite" />}
          </circle>

          {/* Neck connector */}
          <rect x="44" y="88" width="12" height="10" rx="4" fill="url(#chromShaft)" />

          {/* Wide upper collar */}
          <rect x="28" y="96" width="44" height="10" rx="5" fill="url(#chromCollar)" />
          <rect x="32" y="104" width="36" height="4" rx="2" fill="#334155" opacity="0.5" />

          {/* Main shaft */}
          <rect x="42" y="108" width="16" height="170" rx="4" fill="url(#chromShaft)" />
          {/* Shaft center highlight line */}
          <rect x="49" y="110" width="3" height="166" rx="1.5" fill="white" opacity="0.12" />

          {/* Mid collar 1 */}
          <rect x="30" y="158" width="40" height="9" rx="4.5" fill="url(#chromCollar)" />
          {beamActive && <rect x="30" y="158" width="40" height="9" rx="4.5" fill="#7dd3fc" opacity="0.2" />}

          {/* Mid collar 2 */}
          <rect x="30" y="210" width="40" height="9" rx="4.5" fill="url(#chromCollar)" />
          {beamActive && <rect x="30" y="210" width="40" height="9" rx="4.5" fill="#7dd3fc" opacity="0.2" />}

          {/* Lower collar */}
          <rect x="26" y="262" width="48" height="10" rx="5" fill="url(#chromCollar)" />

          {/* Wide base disc */}
          <rect x="16" y="270" width="68" height="12" rx="6" fill="url(#chromBase)" stroke="#94a3b8" strokeWidth="1" />

          {/* Base arms (spread to ground) */}
          <line x1="22" y1="280" x2="4" y2="354" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
          <line x1="78" y1="280" x2="96" y2="354" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
          <line x1="30" y1="280" x2="18" y2="354" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <line x1="70" y1="280" x2="82" y2="354" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

          {/* Ground foot bar — at exact bottom */}
          <rect x="2" y="350" width="96" height="8" rx="4" fill="url(#chromBase)" stroke="#94a3b8" strokeWidth="1" />
        </svg>
      </div>


      {/* SCAN MODAL */}
      {scanResult && scanResult.show && (
        <div
          onClick={() => setScanResult(null)}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-gradient-to-b from-[#1c1033] to-[#0a0416] border-2 border-purple-500/40 rounded-3xl p-5 shadow-[0_0_50px_rgba(168,85,247,0.3)] text-center relative flex flex-col items-center"
          >
            <button onClick={() => setScanResult(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer">
              <X size={18} />
            </button>
            <AlertCircle size={28} className="text-amber-400 mb-2" />
            <h3 className="font-display font-black text-base text-white uppercase tracking-wider mb-1">Transmission Failed</h3>
            <div className="my-2 px-3 py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 w-full">
              <p className="text-xs text-rose-200 leading-snug">{scanResult.errorMessage}</p>
            </div>
            <div className="w-full grid grid-cols-4 gap-1.5 my-2">
              {[
                { label: '<div>', ok: scanResult.hasContainer },
                { label: '<h1>', ok: scanResult.hasHeading },
                { label: 'Seal', ok: scanResult.hasSeal },
                { label: '<a>', ok: scanResult.hasLinks },
              ].map(({ label, ok }) => (
                <div key={label} className={`flex flex-col items-center py-2 px-1 rounded-xl border ${ok ? 'bg-emerald-950/40 border-emerald-500/60' : 'bg-rose-950/40 border-rose-500/50'}`}>
                  <span className="text-[10px] font-mono font-bold mb-0.5">{label}</span>
                  {ok ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-rose-400" />}
                </div>
              ))}
            </div>
            <button
              onClick={() => setScanResult(null)}
              className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide transition-all cursor-pointer mt-1"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* VICTORY MODAL */}
      {showCelebration && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-[#180d28] to-[#0a0414] border-2 border-emerald-400 rounded-3xl p-6 shadow-[0_0_60px_rgba(34,197,94,0.4)] text-center">
            <PartyPopper size={36} className="text-emerald-300 mx-auto mb-3" />
            <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-1">AstroLink Back Online!</h3>
            <p className="text-sm text-emerald-200 mb-4">Venus and Mercury received our transmission loud and clear!</p>
            <div className="grid grid-cols-3 gap-2 bg-[#0d071b] border border-emerald-500/30 rounded-2xl p-3 mb-4">
              {[
                { emoji: '👩‍🚀', name: 'Emma G.', role: 'Marketing Lead' },
                { emoji: '👧‍🚀', name: 'Penny G.', role: 'Junior Cadet' },
                { emoji: '🤖', name: 'Oberion', role: 'Director' },
              ].map(({ emoji, name, role }, i) => (
                <div key={name} className={`flex flex-col items-center ${i === 1 ? 'border-x border-white/10 px-1' : ''}`}>
                  <span className="text-2xl">{emoji}</span>
                  <span className="font-bold text-[11px] text-white mt-1">{name}</span>
                  <span className="text-[9px] text-emerald-400">{role}</span>
                </div>
              ))}
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 size={14} />
              HTML Module Complete — 3 / 3 Levels Cleared
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
