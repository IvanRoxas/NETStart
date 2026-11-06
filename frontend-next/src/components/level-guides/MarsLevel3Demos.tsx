"use client";

import React from 'react';
import { Send, Check } from 'lucide-react';

/**
 * Large, Clear SVG Cursor Pointer (Strictly No Emojis)
 */
function CursorPointer({ className = "" }: { className?: string }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="white"
      stroke="#0f172a"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={`drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] pointer-events-none select-none ${className}`}
    >
      <path d="M5.5 3.5l11 7-5.5 1.5-3 5.5-2.5-14z" />
    </svg>
  );
}

function Mars3ToolboxSidebar({ activeCategory = "form" }: { activeCategory?: "form" | "options" | "input" }) {
  return (
    <div className="flex flex-col gap-1.5 w-18 shrink-0 py-1.5 select-none font-mono">
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "form"
            ? "text-purple-300 bg-purple-950/80 border-purple-400"
            : "text-purple-400/60 bg-purple-950/30 border-purple-500/30"
          }`}
      >
        Form
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "options"
            ? "text-amber-300 bg-amber-950/80 border-amber-400"
            : "text-amber-400/60 bg-amber-950/30 border-amber-500/30"
          }`}
      >
        Options
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs border-l-2 transition-all ${activeCategory === "input"
            ? "text-sky-300 bg-sky-950/80 border-sky-400"
            : "text-sky-400/60 bg-sky-950/30 border-sky-500/30"
          }`}
      >
        Input
      </div>
    </div>
  );
}

/**
 * Authentic Cosmic Space Radio Transmission Stage replicating SimulationConsole.tsx
 * Reduced text clutter: Clean celestial layout with Venus and Mercury.
 */
function MarsTransmissionSpaceScene({
  targetPlanet = "Venus",
  isTransmitting = false,
  isTargetLocked = false,
  isTowerOnline = true,
  packetText = "",
}: {
  targetPlanet?: "Venus" | "Mercury";
  isTransmitting?: boolean;
  isTargetLocked?: boolean;
  isTowerOnline?: boolean;
  packetText?: string;
}) {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-[#070314] select-none">
      {/* 1. Deep Space Cosmic Sky & Nebulae */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020008] via-[#0a041c] to-[#250819] pointer-events-none" />
      <div className="absolute top-1 left-1/4 w-44 h-24 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-4 right-1/4 w-40 h-20 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Twinkling Stars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-85" xmlns="http://www.w3.org/2000/svg">
        {[
          [15, 12], [35, 22], [55, 8], [82, 18], [92, 35], [10, 42], [28, 55], [70, 45], [88, 60]
        ].map(([x, y], i) => (
          <circle key={i} cx={`${x}%`} cy={`${y}%`} r={i % 2 === 0 ? 1.5 : 1} fill="#ffffff" opacity={0.75} />
        ))}
      </svg>

      {/* 2. Target Celestial Planets in Space */}
      <div className="relative z-10 w-full px-5 pt-3 flex justify-between items-start">
        {/* Venus (Top Left) */}
        <div
          className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${targetPlanet === 'Venus' && (isTargetLocked || isTransmitting)
              ? 'scale-110'
              : 'opacity-50'
            }`}
        >
          {/* Target Reticle Ring when targeted */}
          {(isTargetLocked || isTransmitting) && targetPlanet === 'Venus' && (
            <div className="absolute -inset-1.5 rounded-full border border-pink-400/80 animate-ping pointer-events-none" />
          )}

          <img
            src="/assets/planets/celestial/Venus.svg"
            alt="Venus"
            className={`w-11 h-11 object-contain transition-all duration-300 ${targetPlanet === 'Venus' && (isTargetLocked || isTransmitting)
                ? 'drop-shadow-[0_0_14px_#ec4899]'
                : ''
              }`}
          />
          <span className="text-[8px] font-mono font-bold text-pink-300 tracking-wider">
            VENUS
          </span>
        </div>

        {/* Mercury (Top Right) */}
        <div
          className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${targetPlanet === 'Mercury' && (isTargetLocked || isTransmitting)
              ? 'scale-110'
              : 'opacity-50'
            }`}
        >
          {(isTargetLocked || isTransmitting) && targetPlanet === 'Mercury' && (
            <div className="absolute -inset-1.5 rounded-full border border-sky-400/80 animate-ping pointer-events-none" />
          )}

          <img
            src="/assets/planets/celestial/Mercury.svg"
            alt="Mercury"
            className={`w-9 h-9 object-contain transition-all duration-300 ${targetPlanet === 'Mercury' && (isTargetLocked || isTransmitting)
                ? 'drop-shadow-[0_0_14px_#38bdf8]'
                : ''
              }`}
          />
          <span className="text-[8px] font-mono font-bold text-sky-300 tracking-wider">
            MERCURY
          </span>
        </div>
      </div>

      {/* 3. Signal Wave Energy Beam */}
      {isTransmitting && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <defs>
            <linearGradient id="m3SignalGrad" x1="50%" y1="90%" x2={targetPlanet === 'Venus' ? '22%' : '78%'} y2="22%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <line
            x1="50%"
            y1="82%"
            x2={targetPlanet === 'Venus' ? '22%' : '78%'}
            y2="22%"
            stroke="url(#m3SignalGrad)"
            strokeWidth="3"
            strokeDasharray="5 5"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* 4. Floating Message Packet Badge */}
      {isTransmitting && packetText && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-700"
          style={{
            left: targetPlanet === 'Venus' ? '32%' : '68%',
            top: '38%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="px-2.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/80 text-cyan-200 font-mono text-[8px] font-bold shadow-[0_0_16px_rgba(56,189,248,0.7)] backdrop-blur-xs flex items-center gap-1.5 animate-pulse">
            <Send size={9} className="text-cyan-300" />
            <span>&quot;{packetText}&quot;</span>
          </div>
        </div>
      )}

      {/* 5. Mars Horizon, Biodome & Radio Tower Antenna (Bottom) */}
      <div className="relative z-10 w-full flex flex-col items-center justify-end">
        {/* Radio Tower Antenna */}
        <div className="relative flex flex-col items-center">
          {/* Glowing Antenna Tip */}
          <div
            className={`w-2.5 h-2.5 rounded-full mb-0.5 transition-all duration-300 ${isTransmitting
                ? 'bg-cyan-300 animate-ping shadow-[0_0_12px_#38bdf8]'
                : isTowerOnline
                  ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]'
                  : 'bg-slate-600'
              }`}
          />
          {/* Antenna Mast */}
          <div className="w-1 h-7 bg-slate-400 shadow" />
          {/* Tower Lattice Legs */}
          <div className="w-7 h-5 border-x-2 border-t-2 border-slate-400 bg-slate-800/80 rounded-t flex items-center justify-center">
            <div
              className={`w-1 h-2 rounded-full transition-all duration-300 ${isTowerOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-500/40'
                }`}
            />
          </div>
        </div>

        {/* Mars Red Dunes & Colony Biodome */}
        <div className="w-full h-8 bg-gradient-to-t from-[#1b0606] to-[#4c0519] border-t border-red-500/40 flex items-center justify-center relative">
          <div
            className={`absolute -top-2.5 w-14 h-6 rounded-t-full border-t-2 border-x transition-all duration-300 flex items-center justify-center ${isTowerOnline
                ? 'bg-sky-950/70 border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900/60 border-slate-700/60'
              }`}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 1: Interplanetary Form
 * Dynamic Animation:
 * - Left: Form Container + Dropdown + Message Input are in place. Send Button is dragged and snapped into the blank trace slot.
 * - Right: Simulation fires radio pulse beam up to Venus, transmitting message packet.
 */
export function MarsLevel3Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Send Button into blank slot (20% - 34%) */
        @keyframes m3s1DragSendBtn {
          0%, 18% {
            transform: translate(-65px, 35px) scale(0.92);
            opacity: 0;
            box-shadow: 0 0 0 transparent;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 35px) scale(1.04);
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
          }
          32% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          35%, 88% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 35px) scale(0.92);
            opacity: 0;
          }
        }

        /* Cursor movements: grabs button, snaps, clicks */
        @keyframes m3s1CursorMotion {
          0%, 12% { transform: translate(-80px, 50px); opacity: 0; }
          18% { transform: translate(-50px, 40px); opacity: 1; }
          22% { transform: translate(-50px, 40px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          40%, 46% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          52% { transform: translate(30px, 25px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 50px); opacity: 0; }
        }

        @keyframes m3s1SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #10b981; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes m3s1TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        /* Simulation state transitions */
        @keyframes m3s1StatusReady {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m3s1StatusBroadcasting {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        /* Scene reaction after snap and click */
        @keyframes m3s1SceneTransmitting {
          0%, 38% { opacity: 0; }
          42%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes m3s1SceneIdle {
          0%, 38% { opacity: 1; }
          42%, 88% { opacity: 0; }
          93%, 100% { opacity: 1; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mars3ToolboxSidebar activeCategory="input" />

          {/* Form Block Assembly */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Form Container Header */}
            <div className="h-7 w-[195px] bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Form Container</span>
              <span className="bg-black/40 text-[8px] px-1 py-0.5 rounded text-purple-200 font-mono">&lt;form&gt;</span>
            </div>

            {/* Nested: Dropdown Menu */}
            <div className="h-6.5 w-[187px] bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Target Planet:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-amber-200 font-mono">Venus ▾</span>
            </div>

            {/* Nested: Message Input */}
            <div className="h-6.5 w-[187px] bg-[#0EA5E9] text-white text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Message:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-sky-200 font-mono truncate max-w-[95px]">
                &quot;Hello Venus!&quot;
              </span>
            </div>

            {/* Send Button Slot: Blank dashed trace before snap, Dragged button snaps in */}
            <div className="relative w-[187px] ml-2">
              {/* Silhouette trace slot (Blank with traces) */}
              <div
                className="h-6.5 rounded border border-dashed border-emerald-500/40 bg-emerald-950/10"
                style={{ animation: 'm3s1TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Send Button Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#10B981] text-white text-[9px] font-bold px-2 rounded flex items-center justify-between shadow border-t border-black/20 z-30"
                style={{
                  animation: 'm3s1DragSendBtn 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m3s1SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>Send Button</span>
                <span className="bg-black/40 px-1 py-0.5 rounded text-[8px] text-emerald-200 font-mono">Send</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm3s1CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Form Container Bottom */}
            <div className="h-5 w-[195px] bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 rounded-b flex items-center border-t border-black/20 shadow border-b border-x border-purple-400/20">
              <span>End Form</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Cosmic Space Radio Transmission Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 'm3s1StatusReady 7s ease-in-out infinite' }}
            >
              STANDBY
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'm3s1StatusBroadcasting 7s ease-in-out infinite' }}
            >
              BROADCASTING
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          {/* Idle scene before snap */}
          <div className="absolute inset-0" style={{ animation: 'm3s1SceneIdle 7s ease-in-out infinite' }}>
            <MarsTransmissionSpaceScene targetPlanet="Venus" isTransmitting={false} isTowerOnline={true} />
          </div>

          {/* Transmitting scene after snap & click */}
          <div className="absolute inset-0" style={{ animation: 'm3s1SceneTransmitting 7s ease-in-out infinite' }}>
            <MarsTransmissionSpaceScene
              targetPlanet="Venus"
              isTransmitting={true}
              isTargetLocked={true}
              isTowerOnline={true}
              packetText="Hello Venus!"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Build the Form Container
 * Dynamic Animation:
 * - Left: Form Container block is dragged from Form toolbox into workspace blank trace slot
 * - Right: AstroLink antenna tower lights turn online upon snap
 */
export function MarsLevel3Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Form Container into blank slot (20% - 35%) */
        @keyframes m3s2DragForm {
          0%, 18% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.04);
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
          }
          32% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          35%, 88% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }

        @keyframes m3s2CursorMotion {
          0%, 14% { transform: translate(-75px, 35px); opacity: 0; }
          18% { transform: translate(-50px, 25px); opacity: 1; }
          22% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35%, 45% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          50% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-75px, 35px); opacity: 0; }
        }

        @keyframes m3s2SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #a855f7; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes m3s2TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes m3s2StatusOffline {
          0%, 34% { opacity: 1; }
          38%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m3s2StatusOnline {
          0%, 34% { opacity: 0; }
          38%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes m3s2SceneOnline {
          0%, 35% { opacity: 0; }
          38%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes m3s2SceneOffline {
          0%, 35% { opacity: 1; }
          38%, 88% { opacity: 0; }
          93%, 100% { opacity: 1; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mars3ToolboxSidebar activeCategory="form" />

          {/* Form Container Slot: Blank trace slot before snap, dragged Form Container snaps in */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            <div className="relative w-[195px]">
              {/* Silhouette trace slot (Blank with traces) */}
              <div
                className="h-14 rounded border border-dashed border-purple-500/40 bg-purple-950/10"
                style={{ animation: 'm3s2TraceSlot 6.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Form Container */}
              <div
                className="absolute inset-0 flex flex-col z-30"
                style={{
                  animation: 'm3s2DragForm 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m3s2SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                {/* Form Header */}
                <div className="h-7 bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
                  <span>Form Container</span>
                  <span className="bg-black/40 text-[8px] px-1 py-0.5 rounded text-purple-200 font-mono">&lt;form&gt;</span>
                </div>

                {/* Form Title Input Field */}
                <div className="h-6.5 bg-[#7c3aed] text-white text-[9px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
                  <span>Title:</span>
                  <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-amber-200 font-mono">
                    &quot;AstroLink&quot;
                  </span>
                </div>

                {/* Form Bottom */}
                <div className="h-5 bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 rounded-b flex items-center border-t border-black/20 shadow border-b border-x border-purple-400/20">
                  <span>End Form</span>
                </div>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 top-3 pointer-events-none z-40"
                  style={{ animation: 'm3s2CursorMotion 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end min-w-[115px] h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-slate-400 drop-shadow-[0_0_6px_rgba(148,163,184,0.6)] whitespace-nowrap"
              style={{ animation: 'm3s2StatusOffline 6.5s ease-in-out infinite' }}
            >
              OFFLINE
            </span>
            <span
              className="absolute right-0 text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'm3s2StatusOnline 6.5s ease-in-out infinite' }}
            >
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'm3s2SceneOffline 6.5s ease-in-out infinite' }}>
            <MarsTransmissionSpaceScene targetPlanet="Venus" isTransmitting={false} isTowerOnline={false} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'm3s2SceneOnline 6.5s ease-in-out infinite' }}>
            <MarsTransmissionSpaceScene targetPlanet="Venus" isTransmitting={false} isTowerOnline={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Select Recipient Planet
 * Dynamic Animation:
 * - Left: Dropdown Menu block is dragged from Options toolbox and snapped into the Form Container
 * - Right: Simulation reticle locks onto Venus in deep space
 */
export function MarsLevel3Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Dropdown Menu into blank slot (20% - 35%) */
        @keyframes m3s3DragDropdown {
          0%, 18% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 20px) scale(1.04);
            box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
          }
          32% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          35%, 88% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0;
          }
        }

        @keyframes m3s3CursorMotion {
          0%, 14% { transform: translate(-75px, 35px); opacity: 0; }
          18% { transform: translate(-50px, 25px); opacity: 1; }
          22% { transform: translate(-50px, 25px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35%, 45% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          50% { transform: translate(30px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-75px, 35px); opacity: 0; }
        }

        @keyframes m3s3SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #f59e0b; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes m3s3TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes m3s3StatusSearching {
          0%, 34% { opacity: 1; }
          38%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m3s3StatusLocked {
          0%, 34% { opacity: 0; }
          38%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes m3s3SceneLocked {
          0%, 35% { opacity: 0; }
          38%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes m3s3SceneIdle {
          0%, 35% { opacity: 1; }
          38%, 88% { opacity: 0; }
          93%, 100% { opacity: 1; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mars3ToolboxSidebar activeCategory="options" />

          {/* Form Block Assembly */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Form Container Header */}
            <div className="h-7 w-[195px] bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Form Container</span>
              <span className="bg-black/40 text-[8px] px-1 py-0.5 rounded text-purple-200 font-mono">&lt;form&gt;</span>
            </div>

            {/* Dropdown Menu Slot: Blank dashed trace before snap */}
            <div className="relative w-[187px] ml-2">
              <div
                className="h-6.5 rounded border border-dashed border-amber-500/40 bg-amber-950/10"
                style={{ animation: 'm3s3TraceSlot 6.5s ease-in-out infinite' }}
              />

              {/* Animated Dragged Dropdown Menu */}
              <div
                className="absolute inset-0 h-6.5 bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 rounded flex items-center justify-between shadow border-t border-black/20 z-30"
                style={{
                  animation: 'm3s3DragDropdown 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m3s3SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Dropdown Menu:</span>
                <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-amber-200 font-mono">Venus ▾</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm3s3CursorMotion 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Form Container Bottom */}
            <div className="h-5 w-[195px] bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 rounded-b flex items-center border-t border-black/20 shadow border-b border-x border-purple-400/20">
              <span>End Form</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 'm3s3StatusSearching 6.5s ease-in-out infinite' }}
            >
              SEARCHING
            </span>
            <span
              className="absolute right-0 text-pink-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)] font-black whitespace-nowrap"
              style={{ animation: 'm3s3StatusLocked 6.5s ease-in-out infinite' }}
            >
              VENUS TARGETED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'm3s3SceneIdle 6.5s ease-in-out infinite' }}>
            <MarsTransmissionSpaceScene targetPlanet="Venus" isTransmitting={false} isTargetLocked={false} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'm3s3SceneLocked 6.5s ease-in-out infinite' }}>
            <MarsTransmissionSpaceScene targetPlanet="Venus" isTransmitting={false} isTargetLocked={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Input Message & Send
 * Dynamic Animation:
 * - Left: Send Button block is dragged from Input toolbox and snapped beneath Message Input
 * - Right: Signal broadcast confirmed with cosmic radio pulse
 */
export function MarsLevel3Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Send Button into blank slot (20% - 34%) */
        @keyframes m3s4DragSendBtn {
          0%, 18% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0;
          }
          22% {
            opacity: 1;
            transform: translate(-65px, 25px) scale(1.04);
            box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
          }
          32% {
            transform: translate(0px, 0px) scale(1.02);
            opacity: 1;
          }
          35%, 88% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0;
          }
        }

        @keyframes m3s4CursorMotion {
          0%, 12% { transform: translate(-80px, 40px); opacity: 0; }
          18% { transform: translate(-50px, 30px); opacity: 1; }
          22% { transform: translate(-50px, 30px) scale(0.85); opacity: 1; }
          32% { transform: translate(15px, 6px); opacity: 1; }
          35% { transform: translate(15px, 6px) scale(1); opacity: 1; }
          40%, 46% { transform: translate(15px, 6px) scale(0.82); opacity: 1; }
          52% { transform: translate(30px, 25px); opacity: 0; }
          94%, 100% { transform: translate(-80px, 40px); opacity: 0; }
        }

        @keyframes m3s4SnapPulse {
          0%, 33% { filter: brightness(1); }
          35%, 44% { filter: brightness(1.3); outline: 2px solid #10b981; }
          46%, 100% { filter: brightness(1); outline: none; }
        }

        @keyframes m3s4TraceSlot {
          0%, 32% { opacity: 1; }
          35%, 88% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }

        @keyframes m3s4StatusReady {
          0%, 36% { opacity: 1; }
          40%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m3s4StatusConfirmed {
          0%, 36% { opacity: 0; }
          40%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }

        @keyframes m3s4SceneTransmitting {
          0%, 38% { opacity: 0; }
          42%, 88% { opacity: 1; }
          93%, 100% { opacity: 0; }
        }
        @keyframes m3s4SceneIdle {
          0%, 38% { opacity: 1; }
          42%, 88% { opacity: 0; }
          93%, 100% { opacity: 1; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mars3ToolboxSidebar activeCategory="input" />

          {/* Form Block Assembly */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Form Container Header */}
            <div className="h-7 w-[195px] bg-[#8B5CF6] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-purple-400/40">
              <span>Form Container</span>
              <span className="bg-black/40 text-[8px] px-1 py-0.5 rounded text-purple-200 font-mono">&lt;form&gt;</span>
            </div>

            {/* Dropdown Menu */}
            <div className="h-6.5 w-[187px] bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Target Planet:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-amber-200 font-mono">Venus ▾</span>
            </div>

            {/* Message Input */}
            <div className="h-6.5 w-[187px] bg-[#0EA5E9] text-white text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Message:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-sky-200 font-mono truncate max-w-[95px]">
                &quot;Greetings!&quot;
              </span>
            </div>

            {/* Send Button Slot: Blank dashed trace before snap */}
            <div className="relative w-[187px] ml-2">
              <div
                className="h-6.5 rounded border border-dashed border-emerald-500/40 bg-emerald-950/10"
                style={{ animation: 'm3s4TraceSlot 7s ease-in-out infinite' }}
              />

              {/* Animated Dragged Send Button Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#10B981] text-white text-[9px] font-bold px-2 rounded flex items-center justify-between shadow border-t border-black/20 z-30"
                style={{
                  animation: 'm3s4DragSendBtn 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m3s4SnapPulse 7s ease-in-out infinite',
                }}
              >
                <span>Send Button</span>
                <span className="bg-black/40 px-1 py-0.5 rounded text-[8px] text-emerald-200 font-mono">Send</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm3s4CursorMotion 7s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Form Container Bottom */}
            <div className="h-5 w-[195px] bg-[#8B5CF6] text-white text-[8.5px] font-bold px-2 rounded-b flex items-center border-t border-black/20 shadow border-b border-x border-purple-400/20">
              <span>End Form</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center justify-end h-4 font-mono text-[9px] font-bold tracking-wider whitespace-nowrap">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] whitespace-nowrap"
              style={{ animation: 'm3s4StatusReady 7s ease-in-out infinite' }}
            >
              READY
            </span>
            <span
              className="absolute right-0 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)] font-bold whitespace-nowrap"
              style={{ animation: 'm3s4StatusConfirmed 7s ease-in-out infinite' }}
            >
              TRANSMITTED
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0" style={{ animation: 'm3s4SceneIdle 7s ease-in-out infinite' }}>
            <MarsTransmissionSpaceScene targetPlanet="Venus" isTransmitting={false} isTargetLocked={true} />
          </div>
          <div className="absolute inset-0" style={{ animation: 'm3s4SceneTransmitting 7s ease-in-out infinite' }}>
            <MarsTransmissionSpaceScene
              targetPlanet="Venus"
              isTransmitting={true}
              isTargetLocked={true}
              packetText="Greetings!"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
