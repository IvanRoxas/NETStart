"use client";

import React from 'react';
import {
  Shield,
  Flame,
  Wind,
  Rocket,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export interface StarshipProtocolConsoleProps {
  currentSection: number; // 1 = Maintenance Deck, 2 = Power Reactor, 3 = Hyperdrive Warp
  hazardStep?: number; // 0 to 4
  hazardState?: {
    asteroidShielded: boolean;
    fuelRefueled: boolean;
    oxygenPumped: boolean;
    status: 'idle' | 'running' | 'success' | 'failed';
    failReason?: string;
  };
  reactorState?: {
    allocatedOxygen: number;
    allocatedShields: number;
    allocatedThrusters: number;
    remainingPower: number;
    isBalanced: boolean;
  };
  warpState?: {
    boostActive: boolean;
    shieldsActive: boolean;
    warpActive: boolean;
    isWarping: boolean;
  };
}

export default function StarshipProtocolConsole({
  currentSection,
  hazardStep = 0,
  hazardState = {
    asteroidShielded: false,
    fuelRefueled: false,
    oxygenPumped: false,
    status: 'idle',
  },
  reactorState = {
    allocatedOxygen: 0,
    allocatedShields: 0,
    allocatedThrusters: 0,
    remainingPower: 100,
    isBalanced: false,
  },
  warpState = {
    boostActive: false,
    shieldsActive: false,
    warpActive: false,
    isWarping: false,
  },
}: StarshipProtocolConsoleProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#0a0316] rounded-2xl border border-purple-900/50 shadow-2xl overflow-hidden relative select-none">
      {/* Background Starfield & Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#9333ea_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-black/70 pointer-events-none" />

      {/* Main Simulation Viewports */}
      <div className="w-full h-full flex-1 flex flex-col items-center justify-center relative z-10">
        
        {/* =================================================================== */}
        {/* SECTION 2 (Index 1): MAINTENANCE FLIGHT DECK (Event Reaction)       */}
        {/* =================================================================== */}
        {currentSection === 1 && (
          <div className="w-full max-w-lg flex flex-col items-center justify-center gap-6">
            
            {/* Space Flight Track Viewport */}
            <div className="w-full h-44 bg-slate-950/90 rounded-2xl border-2 border-purple-800/60 p-4 relative flex flex-col justify-between overflow-hidden shadow-inner">
              
              {/* Moving Space Stars / Hazard Track */}
              <div className="w-full flex items-center justify-between px-3 relative z-10">
                {[
                  { label: "1. Launch", icon: Rocket, active: hazardStep >= 0 },
                  { label: "2. Asteroid", icon: AlertTriangle, color: 'rose', active: hazardStep >= 1, done: hazardState.asteroidShielded },
                  { label: "3. Fuel Low", icon: Flame, color: 'orange', active: hazardStep >= 2, done: hazardState.fuelRefueled },
                  { label: "4. Oxygen Low", icon: Wind, color: 'cyan', active: hazardStep >= 3, done: hazardState.oxygenPumped },
                  { label: "5. Safe Gate", icon: CheckCircle2, color: 'emerald', active: hazardStep >= 4, done: hazardState.status === 'success' },
                ].map((node, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      hazardStep === idx
                        ? 'bg-purple-600 border-purple-300 text-white shadow-[0_0_12px_#a855f7] scale-110'
                        : node.done
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : node.active
                        ? 'bg-slate-800 border-slate-600 text-slate-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-600'
                    }`}>
                      <node.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-400">{node.label}</span>
                  </div>
                ))}
              </div>

              {/* Central Spaceship Flight Lane */}
              <div className="relative w-full h-16 flex items-center justify-center">
                {/* Ship Avatar with Shields */}
                <div className={`relative transition-all duration-500 flex items-center justify-center ${
                  hazardState.asteroidShielded
                    ? 'p-2 rounded-full border-2 border-purple-400 bg-purple-500/20 shadow-[0_0_25px_#a855f7] animate-pulse'
                    : ''
                }`}>
                  <Rocket className="w-10 h-10 rotate-90 text-purple-300 drop-shadow-[0_0_8px_currentColor]" />
                </div>
              </div>

              {/* Hazard Status Banner */}
              <div className="w-full flex items-center justify-between text-xs font-mono px-2">
                <span className="text-slate-400">Flight Status:</span>
                <span className={`font-bold ${
                  hazardState.status === 'success' ? 'text-emerald-400' :
                  hazardState.status === 'failed' ? (hazardState.failReason || "ALERT UNRESOLVED") :
                  hazardState.status === 'running' ? 'text-purple-300 animate-pulse' : 'text-slate-400'
                }`}>
                  {hazardState.status === 'success' ? "SECTOR CLEARED SAFELY!" :
                   hazardState.status === 'failed' ? (hazardState.failReason || "ALERT UNRESOLVED") :
                   hazardState.status === 'running' ? `NAVIGATING STEP ${hazardStep + 1} OF 5...` :
                   "READY TO CRUISE"}
                </span>
              </div>
            </div>

            {/* 3 Active Ship Subsystem Badges */}
            <div className="w-full grid grid-cols-3 gap-3">
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                hazardState.asteroidShielded
                  ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}>
                <Shield className="w-4 h-4 text-purple-400" />
                <div className="text-[10px] font-mono">
                  <div className="font-bold">SHIELDS</div>
                  <div>{hazardState.asteroidShielded ? "ONLINE" : "STANDBY"}</div>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                hazardState.fuelRefueled
                  ? 'bg-orange-950/60 border-orange-400 text-orange-200 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}>
                <Flame className="w-4 h-4 text-orange-400" />
                <div className="text-[10px] font-mono">
                  <div className="font-bold">PROPULSION</div>
                  <div>{hazardState.fuelRefueled ? "REFUELED" : "STANDBY"}</div>
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                hazardState.oxygenPumped
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}>
                <Wind className="w-4 h-4 text-cyan-400" />
                <div className="text-[10px] font-mono">
                  <div className="font-bold">OXYGEN</div>
                  <div>{hazardState.oxygenPumped ? "PRESSURIZED" : "STANDBY"}</div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* SECTION 3 (Index 2): POWER REACTOR (Variable Power Distribution)    */}
        {/* =================================================================== */}
        {currentSection === 2 && (
          <div className="w-full max-w-md flex flex-col items-center justify-center gap-5">
            
            {/* Main Battery Power Gauge */}
            <div className="w-full bg-slate-950/90 border-2 border-yellow-500/60 rounded-2xl p-4 shadow-lg flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-yellow-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-current" />
                  Reactor Core Power
                </span>
                <span className={`text-sm font-black ${
                  reactorState.isBalanced ? 'text-emerald-400 animate-pulse' :
                  reactorState.remainingPower < 0 ? 'text-rose-400' : 'text-yellow-300'
                }`}>
                  Remaining: {reactorState.remainingPower} / 100
                </span>
              </div>

              {/* Segmented Power Meter Bar */}
              <div className="w-full h-6 bg-black/80 rounded-xl p-1 border border-yellow-600/30 flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((seg) => {
                  const isUsed = (100 - reactorState.remainingPower) >= seg * 10;
                  return (
                    <div
                      key={seg}
                      className={`flex-1 h-full rounded-sm transition-all duration-300 ${
                        isUsed
                          ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]'
                          : 'bg-slate-900/40'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* 3 System Distribution Channels */}
            <div className="w-full grid grid-cols-3 gap-3">
              
              {/* Oxygen Life Support */}
              <div className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all ${
                reactorState.allocatedOxygen >= 30
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  reactorState.allocatedOxygen >= 30 ? 'bg-cyan-500 text-black shadow-[0_0_10px_#06b6d4]' : 'bg-slate-900 text-slate-600'
                }`}>
                  <Wind className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-mono">
                  <div className="font-bold text-white uppercase">Oxygen</div>
                  <div className="text-cyan-400 font-bold">{reactorState.allocatedOxygen} Units</div>
                </div>
              </div>

              {/* Shield Defense */}
              <div className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all ${
                reactorState.allocatedShields >= 30
                  ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  reactorState.allocatedShields >= 30 ? 'bg-purple-500 text-white shadow-[0_0_10px_#a855f7]' : 'bg-slate-900 text-slate-600'
                }`}>
                  <Shield className="w-5 h-5 fill-current" />
                </div>
                <div className="text-[10px] font-mono">
                  <div className="font-bold text-white uppercase">Shields</div>
                  <div className="text-purple-400 font-bold">{reactorState.allocatedShields} Units</div>
                </div>
              </div>

              {/* Propulsion Thrusters */}
              <div className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all ${
                reactorState.allocatedThrusters >= 40
                  ? 'bg-orange-950/60 border-orange-400 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  reactorState.allocatedThrusters >= 40 ? 'bg-orange-500 text-black shadow-[0_0_10px_#f97316]' : 'bg-slate-950 text-slate-600'
                }`}>
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <div className="text-[10px] font-mono">
                  <div className="font-bold text-white uppercase">Thrusters</div>
                  <div className="text-orange-400 font-bold">{reactorState.allocatedThrusters} Units</div>
                </div>
              </div>

            </div>

            {/* Balance Status Indicator */}
            <div className={`w-full p-3 rounded-xl border flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all ${
              reactorState.isBalanced
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}>
              <Sparkles className="w-4 h-4" />
              <span>
                {reactorState.isBalanced
                  ? "POWER BALANCED // 100% DISTRIBUTED"
                  : "ALLOCATE 100 POWER UNITS ACROSS SYSTEMS"}
              </span>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* SECTION 4 (Index 3): HYPERDRIVE WARP JUMP (Function Invocations)     */}
        {/* =================================================================== */}
        {currentSection === 3 && (
          <div className="w-full max-w-md flex flex-col items-center justify-center gap-6">
            
            {/* Cockpit Runway Viewport */}
            <div className="w-full h-44 bg-slate-950/90 rounded-2xl border-2 border-purple-800/60 p-4 relative flex flex-col items-center justify-center overflow-hidden shadow-2xl">
              {/* Warp Tunnel Trail Effect */}
              {warpState.isWarping && (
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/30 to-yellow-500/20 animate-pulse pointer-events-none" />
              )}

              {/* Spaceship with Glowing Thruster / Warp Jump Animation */}
              <div className={`relative transition-all duration-700 flex flex-col items-center ${
                warpState.isWarping ? 'scale-125 -translate-y-4 shadow-[0_0_50px_#38bdf8]' : ''
              }`}>
                <Rocket className={`w-14 h-14 rotate-45 transition-colors ${
                  warpState.warpActive ? 'text-yellow-400 drop-shadow-[0_0_20px_#facc15]' :
                  warpState.shieldsActive ? 'text-purple-300 drop-shadow-[0_0_15px_#a855f7]' :
                  warpState.boostActive ? 'text-cyan-300 drop-shadow-[0_0_10px_#06b6d4]' : 'text-slate-500'
                }`} />
                {warpState.boostActive && (
                  <Flame className="w-8 h-8 text-orange-400 fill-orange-400 animate-bounce -mt-2" />
                )}
              </div>
            </div>

            {/* 3 Function Execution Pods */}
            <div className="w-full grid grid-cols-3 gap-3">
              
              <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                warpState.boostActive
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}>
                <Rocket className="w-5 h-5 text-cyan-400" />
                <span className="text-[10px] font-mono font-bold">1. Boost Systems</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                warpState.shieldsActive
                  ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}>
                <Shield className="w-5 h-5 text-purple-400 fill-current" />
                <span className="text-[10px] font-mono font-bold">2. Evasive Shields</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                warpState.warpActive
                  ? 'bg-orange-950/60 border-orange-400 text-orange-200 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}>
                <Flame className="w-5 h-5 text-orange-400 fill-current animate-pulse" />
                <span className="text-[10px] font-mono font-bold">3. Engage Warp</span>
              </div>

            </div>

            {/* Warp Status Banner */}
            <div className={`w-full p-3 rounded-xl border flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all ${
              warpState.isWarping
                ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_30px_#10b981] animate-bounce'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <Sparkles className="w-4 h-4" />
              <span>
                {warpState.isWarping
                  ? "HYPERDRIVE ENGAGED // WARPING TO NEXT SYSTEM!"
                  : "EXECUTE AUTOMATED FLIGHT ROUTINES"}
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
