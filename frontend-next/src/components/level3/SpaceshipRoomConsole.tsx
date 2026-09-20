"use client";

import React from 'react';
import {
  Wind,
  Shield,
  Flame,
  Rocket,
  Zap,
  Lock,
  Unlock,
  Sliders,
  Sparkles,
  Droplets,
  Check,
} from 'lucide-react';

export interface SpaceshipRoomConsoleProps {
  currentSection: number; // 0 = Oxygen, 1 = Shields, 2 = Engine, 3 = Cockpit
  isOxygenFixed: boolean;
  isShieldFixed: boolean;
  isEngineFixed: boolean;
  shipPower: number;
  activeAction?: string;
  isLaunching?: boolean;
  shieldCount?: number;
  oxygenPercent?: number;
  hasBlueFuel?: boolean;
  hasGreenFuel?: boolean;
  doorsClosed?: boolean;
}

export default function SpaceshipRoomConsole({
  currentSection,
  isOxygenFixed,
  isShieldFixed,
  isEngineFixed,
  shipPower,
  activeAction = 'none',
  isLaunching = false,
  shieldCount = 0,
  oxygenPercent = 0,
  hasBlueFuel = false,
  hasGreenFuel = false,
  doorsClosed = false,
}: SpaceshipRoomConsoleProps) {
  const isOxygenDone = isOxygenFixed || oxygenPercent === 100;
  const isShieldDone = isShieldFixed || shieldCount >= 4;
  const isEngineDone = isEngineFixed || (hasBlueFuel && hasGreenFuel);
  const isCockpitDone = isOxygenDone && isShieldDone && isEngineDone && shipPower === 100;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#0c0418] rounded-2xl border border-purple-900/50 shadow-2xl overflow-hidden relative select-none">
      {/* Background Starfield & Subtle Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-black/60 pointer-events-none" />

      {/* Main Interactive Visual Canvas */}
      <div className="w-full h-full flex-1 flex flex-col items-center justify-center relative z-10">

        {/* =================================================================== */}
        {/* ROOM 1: OXYGEN PIPELINE (Pure Visual Sequence: Door -> Valve -> Pump) */}
        {/* =================================================================== */}
        {currentSection === 0 && (
          <div className="w-full max-w-lg flex flex-col items-center justify-center gap-6">
            
            {/* The Main Pipeline Pipe */}
            <div className="w-full relative flex items-center justify-center">
              {/* Pipe Body */}
              <div className="w-full h-16 bg-slate-900/90 rounded-2xl border-2 border-slate-700 p-2 relative flex items-center justify-between shadow-inner overflow-hidden">
                {/* Animated Cyan Oxygen Stream */}
                <div
                  className={`absolute left-0 top-1.5 bottom-1.5 bg-gradient-to-r from-cyan-600 via-cyan-400 to-sky-300 rounded-xl transition-all duration-700 shadow-[0_0_20px_rgba(6,182,212,0.7)] ${
                    isOxygenDone ? 'w-full animate-pulse' :
                    doorsClosed ? 'w-2/3' : 'w-1/6'
                  }`}
                  style={{ opacity: doorsClosed || isOxygenDone ? 1 : 0.2 }}
                />

                {/* 3 Large Shape Buttons / Valves */}
                <div className="w-full relative z-10 flex items-center justify-around">
                  
                  {/* Step 1: Door Lock */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                        doorsClosed || isOxygenDone
                          ? 'bg-emerald-500 border-emerald-300 text-black shadow-[0_0_15px_#10b981]'
                          : 'bg-rose-950/80 border-rose-600 text-rose-300'
                      }`}
                    >
                      {doorsClosed || isOxygenDone ? (
                        <Unlock className="w-6 h-6 stroke-[2.5]" />
                      ) : (
                        <Lock className="w-6 h-6 stroke-[2.5]" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-300">
                      {doorsClosed || isOxygenDone ? "Door Unlocked" : "Door Locked"}
                    </span>
                  </div>

                  {/* Step 2: Valve Dial */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                        doorsClosed || isOxygenDone
                          ? 'bg-emerald-500 border-emerald-300 text-black shadow-[0_0_15px_#10b981]'
                          : 'bg-rose-950/80 border-rose-600 text-rose-300'
                      }`}
                    >
                      <Sliders className={`w-6 h-6 stroke-[2.5] ${isOxygenDone ? 'rotate-90 transition-transform duration-500' : ''}`} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-300">
                      {doorsClosed || isOxygenDone ? "Valve Open" : "Valve Closed"}
                    </span>
                  </div>

                  {/* Step 3: Air Pump Fan */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                        isOxygenDone
                          ? 'bg-cyan-400 border-cyan-200 text-black shadow-[0_0_20px_#22d3ee]'
                          : 'bg-rose-950/80 border-rose-600 text-rose-300'
                      }`}
                    >
                      <Wind className={`w-6 h-6 stroke-[2.5] ${isOxygenDone ? 'animate-spin' : ''}`} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-300">
                      {isOxygenDone ? "Air Pumping" : "Pump Off"}
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* Clean Oxygen Tank Fill Visual */}
            <div className={`w-full max-w-xs p-4 rounded-2xl border-2 flex items-center justify-between transition-all duration-500 ${
              isOxygenDone
                ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isOxygenDone ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d4]' : 'bg-slate-900 text-slate-600'}`}>
                  <Droplets className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Oxygen Tank</div>
                  <div className="text-[11px] font-mono text-cyan-400">
                    {isOxygenDone ? "Full & Pressurized" : "Filling Required"}
                  </div>
                </div>
              </div>
              <span className="text-2xl font-mono font-black text-cyan-300">
                {isOxygenDone ? 100 : oxygenPercent}%
              </span>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* ROOM 2: SHIELD GENERATOR (Pure Visual 4-Quadrant Forcefield)       */}
        {/* =================================================================== */}
        {currentSection === 1 && (
          <div className="w-full flex flex-col items-center justify-center gap-6">
            
            {/* Visual Spaceship with 4 Surrounding Shield Quadrants */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              
              {/* Full Shield Bubble Glow (when complete) */}
              <div
                className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${
                  isShieldDone
                    ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_45px_rgba(6,182,212,0.5)] animate-pulse scale-105'
                    : 'border-slate-800/40 bg-slate-950/20'
                }`}
              />

              {/* Center Spaceship */}
              <div className={`relative z-20 w-24 h-24 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${
                isShieldDone
                  ? 'bg-purple-900 border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.5)]'
                  : 'bg-slate-900 border-purple-800 text-purple-400'
              }`}>
                <Rocket className="w-12 h-12 rotate-45" />
              </div>

              {/* Quadrant 1: Top Arc */}
              <div
                className={`absolute top-2 left-1/2 -translate-x-1/2 w-28 h-9 rounded-t-2xl border-2 flex items-center justify-center gap-1.5 transition-all duration-300 ${
                  shieldCount >= 1 || isShieldDone
                    ? 'bg-cyan-400 border-cyan-200 text-black shadow-[0_0_20px_#06b6d4]'
                    : 'bg-slate-950/80 border-slate-800 text-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>

              {/* Quadrant 2: Right Arc */}
              <div
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-28 rounded-r-2xl border-2 flex items-center justify-center gap-1.5 transition-all duration-300 ${
                  shieldCount >= 2 || isShieldDone
                    ? 'bg-cyan-400 border-cyan-200 text-black shadow-[0_0_20px_#06b6d4]'
                    : 'bg-slate-950/80 border-slate-800 text-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>

              {/* Quadrant 3: Bottom Arc */}
              <div
                className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-9 rounded-b-2xl border-2 flex items-center justify-center gap-1.5 transition-all duration-300 ${
                  shieldCount >= 3 || isShieldDone
                    ? 'bg-cyan-400 border-cyan-200 text-black shadow-[0_0_20px_#06b6d4]'
                    : 'bg-slate-950/80 border-slate-800 text-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>

              {/* Quadrant 4: Left Arc */}
              <div
                className={`absolute left-2 top-1/2 -translate-y-1/2 w-9 h-28 rounded-l-2xl border-2 flex items-center justify-center gap-1.5 transition-all duration-300 ${
                  shieldCount >= 4 || isShieldDone
                    ? 'bg-cyan-400 border-cyan-200 text-black shadow-[0_0_20px_#06b6d4]'
                    : 'bg-slate-950/80 border-slate-800 text-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>

            </div>

            {/* Clean 4-Cell Indicator Bar */}
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4].map((cell) => {
                const isCharged = (shieldCount >= cell) || isShieldDone;
                return (
                  <div
                    key={cell}
                    className={`w-10 h-3 rounded-full border transition-all duration-300 ${
                      isCharged
                        ? 'bg-cyan-400 border-cyan-200 shadow-[0_0_10px_#06b6d4]'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  />
                );
              })}
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* ROOM 3: ENGINE ROOM (Pure Visual Fuel Canisters & Thruster)        */}
        {/* =================================================================== */}
        {currentSection === 2 && (
          <div className="w-full max-w-md flex flex-col items-center justify-center gap-6">
            
            {/* Dual Fuel Canisters */}
            <div className="w-full grid grid-cols-2 gap-4">
              
              {/* Blue Fuel Capsule */}
              <div className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2.5 transition-all duration-500 ${
                hasBlueFuel || isEngineDone
                  ? 'bg-blue-950/60 border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.4)]'
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  hasBlueFuel || isEngineDone ? 'bg-blue-500 text-white shadow-[0_0_15px_#3b82f6]' : 'bg-slate-900 text-slate-600'
                }`}>
                  <Droplets className="w-6 h-6 fill-current" />
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">Blue Fuel</div>
                <span className={`text-[10px] font-mono font-bold ${hasBlueFuel || isEngineDone ? 'text-blue-400' : 'text-slate-600'}`}>
                  {hasBlueFuel || isEngineDone ? "Loaded" : "Empty"}
                </span>
              </div>

              {/* Green Fuel Capsule */}
              <div className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2.5 transition-all duration-500 ${
                hasGreenFuel || isEngineDone
                  ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  hasGreenFuel || isEngineDone ? 'bg-emerald-500 text-white shadow-[0_0_15px_#10b981]' : 'bg-slate-900 text-slate-600'
                }`}>
                  <Sparkles className="w-6 h-6 fill-current" />
                </div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">Green Fuel</div>
                <span className={`text-[10px] font-mono font-bold ${hasGreenFuel || isEngineDone ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {hasGreenFuel || isEngineDone ? "Loaded" : "Empty"}
                </span>
              </div>

            </div>

            {/* Glowing Rocket Engine / Thruster Flame */}
            <div className={`w-full p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all duration-500 ${
              isEngineDone
                ? 'bg-orange-950/60 border-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.5)]'
                : 'bg-slate-950/60 border-slate-800'
            }`}>
              <Flame className={`w-8 h-8 ${isEngineDone ? 'text-orange-400 fill-orange-400 animate-bounce' : 'text-slate-700'}`} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {isEngineDone ? "Engine Ignited!" : "Thruster Standby"}
                </span>
                <span className={`text-[10px] font-mono ${isEngineDone ? 'text-orange-400' : 'text-slate-600'}`}>
                  {isEngineDone ? "Ready for Launch" : "Needs Blue & Green Fuel"}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* ROOM 4: THE COCKPIT (Ship Power Battery + 3 System Modules)         */}
        {/* =================================================================== */}
        {currentSection === 3 && (
          <div className="w-full max-w-md flex flex-col items-center justify-center gap-5">
            
            {/* Battery Power Gauge */}
            <div className="w-full bg-slate-950/80 border-2 border-yellow-500/50 rounded-2xl p-3.5 shadow-lg flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-current" />
                  Ship Power
                </span>
                <span className={`font-mono text-sm font-black ${shipPower === 100 ? 'text-yellow-300 animate-pulse' : 'text-slate-500'}`}>
                  {shipPower}%
                </span>
              </div>

              {/* Clean Battery Bar */}
              <div className="w-full h-6 bg-black/80 rounded-xl p-1 border border-yellow-600/30 flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((seg) => {
                  const isFilled = shipPower >= seg * 10;
                  return (
                    <div
                      key={seg}
                      className={`flex-1 h-full rounded-sm transition-all duration-300 ${
                        isFilled
                          ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]'
                          : 'bg-slate-900/40'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* 3 Large System Activation Pods */}
            <div className="w-full grid grid-cols-3 gap-3">
              
              {/* 1. Oxygen Module */}
              <div className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all duration-500 ${
                isOxygenDone
                  ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 opacity-50'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isOxygenDone ? 'bg-cyan-400 text-black shadow-[0_0_10px_#06b6d4]' : 'bg-slate-900 text-slate-600'
                }`}>
                  <Wind className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-white">Oxygen</span>
              </div>

              {/* 2. Shield Module */}
              <div className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all duration-500 ${
                isShieldDone
                  ? 'bg-purple-950/50 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 opacity-50'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isShieldDone ? 'bg-purple-500 text-white shadow-[0_0_10px_#a855f7]' : 'bg-slate-900 text-slate-600'
                }`}>
                  <Shield className="w-5 h-5 fill-current" />
                </div>
                <span className="text-[11px] font-bold text-white">Shields</span>
              </div>

              {/* 3. Thruster Module */}
              <div className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all duration-500 ${
                isEngineDone
                  ? 'bg-orange-950/50 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 opacity-50'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isEngineDone ? 'bg-orange-500 text-black shadow-[0_0_10px_#f97316]' : 'bg-slate-900 text-slate-600'
                }`}>
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <span className="text-[11px] font-bold text-white">Thrusters</span>
              </div>

            </div>

            {/* Launchpad Rocket Graphic */}
            <div className={`w-full p-4 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all duration-500 ${
              isLaunching
                ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_30px_#10b981] animate-bounce'
                : isCockpitDone
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                : 'bg-slate-950/60 text-slate-500 border-slate-800'
            }`}>
              <Rocket className={`w-6 h-6 ${isLaunching ? 'animate-spin' : isCockpitDone ? 'text-yellow-400' : ''}`} />
              <span className="text-xs font-mono font-black uppercase tracking-wider">
                {isLaunching
                  ? "Liftoff Engaged!"
                  : isCockpitDone
                  ? "Systems Ready for Launch"
                  : "All Systems Needed for Launch"}
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

