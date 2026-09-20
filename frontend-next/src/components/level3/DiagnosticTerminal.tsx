"use client";

import React from 'react';
import { DiagnosticNode } from '@/lib/level3/terminalNodes';
import { Zap, AlertTriangle, Flag, Shield, Activity, Radio, Cpu, Power } from 'lucide-react';

export interface DiagnosticTerminalProps {
  nodes: DiagnosticNode[];
  reticleIndex: number;
  engineCharge: number;
  errorFlash?: boolean;
  className?: string;
}

export default function DiagnosticTerminal({
  nodes,
  reticleIndex,
  engineCharge,
  errorFlash = false,
  className = '',
}: DiagnosticTerminalProps) {
  const currentNode = nodes[reticleIndex] || nodes[0];

  return (
    <div className={`w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 bg-[#0a0314] rounded-2xl border-2 ${
      errorFlash ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'border-purple-900/60 shadow-[0_0_25px_rgba(147,51,234,0.15)]'
    } overflow-hidden relative select-none transition-colors duration-300 ${className}`}>
      {/* Background Cyber Grid Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#9333ea_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-black/60 pointer-events-none" />

      {/* Top Console Bar */}
      <div className="w-full flex items-center justify-between z-10 border-b border-purple-900/40 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-purple-950/80 border border-purple-700/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <Cpu className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono font-black tracking-widest text-purple-300 flex items-center gap-2">
              <span>DIAGNOSTIC TERMINAL</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[10px] font-mono text-slate-400">DATA STREAM BUS // NODE EVALUATION</div>
          </div>
        </div>

        {/* Telemetry Chips */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700 text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>BUS FREQ: <strong className="text-cyan-400">4.8 GHz</strong></span>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700 text-slate-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>NODES: <strong className="text-white">{nodes.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Center Main Stage: The Stationary Data Stream Track */}
      <div className="w-full flex-1 flex flex-col justify-center items-center my-4 z-10 overflow-x-auto py-6">
        <div className="relative flex items-center justify-center gap-4 sm:gap-6 px-8 min-w-max">
          {/* Circuit Connection Bus Rail */}
          <div className="absolute left-6 right-6 h-1.5 bg-gradient-to-r from-purple-900 via-cyan-900 to-purple-900 rounded-full border border-purple-700/40 shadow-[0_0_10px_rgba(6,182,212,0.3)] -z-0" />

          {nodes.map((node, index) => {
            const isTargeted = index === reticleIndex;
            const isExtracted = node.isExtracted;
            const isStart = node.type === 'Start';
            const isIgnition = node.type === 'Ignition';
            const isTrap = node.color === 'Red' || node.state === 'Trap' || node.state === 'Blinking';

            let podBorder = 'border-purple-800/60 shadow-[0_0_8px_rgba(147,51,234,0.2)]';
            let podBg = 'bg-slate-900/90';
            let glowColor = 'text-slate-400';

            if (isStart) {
              podBorder = 'border-yellow-500/70 shadow-[0_0_15px_rgba(234,179,8,0.3)]';
              podBg = 'bg-yellow-950/40';
              glowColor = 'text-yellow-400';
            } else if (isIgnition) {
              podBorder = 'border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
              podBg = 'bg-emerald-950/40';
              glowColor = 'text-emerald-400';
            } else if (isExtracted) {
              podBorder = 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
              podBg = 'bg-emerald-950/60';
              glowColor = 'text-emerald-400';
            } else if (node.color === 'Blue') {
              podBorder = 'border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.4)]';
              podBg = 'bg-cyan-950/50';
              glowColor = 'text-cyan-400';
            } else if (node.color === 'Green') {
              podBorder = 'border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
              podBg = 'bg-emerald-950/50';
              glowColor = 'text-emerald-400';
            } else if (node.color === 'Red') {
              podBorder = 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
              podBg = 'bg-red-950/50';
              glowColor = 'text-red-400';
            }

            return (
              <div
                key={node.id}
                className={`relative flex flex-col items-center justify-center w-20 sm:w-24 h-28 sm:h-32 rounded-xl border-2 ${podBorder} ${podBg} transition-all duration-300 z-10 ${
                  isTargeted ? 'scale-110 shadow-[0_0_25px_rgba(6,182,212,0.7)]' : 'opacity-85'
                }`}
              >
                {/* Active Scanner Reticle Frame Overlay */}
                {isTargeted && (
                  <div className="absolute -inset-2.5 rounded-2xl border-2 border-cyan-400 border-dashed animate-pulse pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.8)]">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-950 font-mono font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                      SCANNER
                    </div>
                  </div>
                )}

                {/* Node Top Label */}
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {node.label || `NODE 0${index}`}
                </span>

                {/* Node Icon */}
                <div className="my-1.5">
                  {isStart ? (
                    <Power className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_#facc15]" />
                  ) : isIgnition ? (
                    <Flag className="w-6 h-6 text-emerald-400 fill-emerald-400 drop-shadow-[0_0_8px_#10b981] animate-bounce" />
                  ) : isExtracted ? (
                    <Shield className="w-6 h-6 text-emerald-400 fill-emerald-500/40 drop-shadow-[0_0_8px_#10b981]" />
                  ) : isTrap ? (
                    <AlertTriangle className="w-6 h-6 text-red-400 drop-shadow-[0_0_8px_#ef4444] animate-pulse" />
                  ) : (
                    <Zap className={`w-6 h-6 ${glowColor} drop-shadow-[0_0_8px_currentColor]`} />
                  )}
                </div>

                {/* Node Property Badges */}
                <div className="flex flex-col items-center gap-0.5 mt-1">
                  <span className={`text-[9px] font-mono font-black uppercase ${
                    isExtracted ? 'text-emerald-400' : isTrap ? 'text-red-400' : glowColor
                  }`}>
                    {isExtracted ? 'EXTRACTED' : node.color || (isStart ? 'ONLINE' : 'GOAL')}
                  </span>
                  {node.state && !isExtracted && (
                    <span className="text-[8px] font-mono text-slate-400 uppercase tracking-tighter">
                      [{node.state}]
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Real-Time Diagnostic Telemetry Readout */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 z-10 border-t border-purple-900/40 pt-3 text-xs font-mono">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase">Target Index</span>
          <span className="text-sm font-bold text-cyan-400">
            {reticleIndex + 1} / {nodes.length} [{currentNode?.label || 'READY'}]
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase">Detected Color</span>
          <span className={`text-sm font-bold ${
            currentNode?.color === 'Blue' ? 'text-cyan-400' : currentNode?.color === 'Green' ? 'text-emerald-400' : currentNode?.color === 'Red' ? 'text-red-400' : 'text-slate-400'
          }`}>
            {currentNode?.color || 'None'}
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase">Detected State</span>
          <span className={`text-sm font-bold ${
            currentNode?.isExtracted ? 'text-emerald-400' : currentNode?.state === 'Stable' ? 'text-emerald-400' : currentNode?.state === 'Blinking' || currentNode?.state === 'Trap' ? 'text-red-400' : 'text-slate-400'
          }`}>
            {currentNode?.isExtracted ? 'Depleted / Extracted' : currentNode?.state || 'Normal'}
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase">Engine Calibration</span>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-yellow-400 transition-all duration-300 shadow-[0_0_8px_#facc15]"
                style={{ width: `${Math.min(100, Math.max(0, engineCharge))}%` }}
              />
            </div>
            <span className="text-xs font-bold text-yellow-400">{engineCharge}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
