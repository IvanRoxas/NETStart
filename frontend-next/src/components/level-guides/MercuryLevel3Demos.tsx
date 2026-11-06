"use client";

import React from 'react';
import { Radio, Send, Terminal, MessageSquare } from 'lucide-react';

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

function Mercury3ToolboxSidebar({ activeTab = "html" }: { activeTab?: "html" | "css" | "js" }) {
  return (
    <div className="flex flex-col gap-1.5 w-18 shrink-0 py-1.5 select-none font-mono">
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${
          activeTab === 'html'
            ? 'text-orange-300 bg-orange-950/80 border-l-2 border-orange-400'
            : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'
        }`}
      >
        HTML
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${
          activeTab === 'css'
            ? 'text-blue-300 bg-blue-950/80 border-l-2 border-blue-400'
            : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'
        }`}
      >
        CSS
      </div>
      <div
        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${
          activeTab === 'js'
            ? 'text-yellow-300 bg-yellow-950/80 border-l-2 border-yellow-400'
            : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'
        }`}
      >
        JS Logic
      </div>
    </div>
  );
}

/**
 * Slide 1: The Missing Interface (AstroLink Transceiver Linkage)
 * Dynamic Animation:
 * - Left: Attach Stylesheet block is grabbed from toolbox and dragged into workspace blank trace slot
 * - Right: Simulation starts with dormant/unlinked transceiver; ONLY turns online after snap
 */
export function MercuryLevel3Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Step 1 Drag Block Animation */
        @keyframes m3s1DragLink {
          0%, 12% {
            transform: translate(-65px, -10px) scale(0.92);
            opacity: 0.6;
          }
          32%, 85% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, -10px) scale(0.92);
            opacity: 0.6;
          }
        }
        @keyframes m3s1CursorDrag {
          0%, 12% { transform: translate(-65px, -10px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          38%, 85% { transform: translate(25px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-65px, -10px); opacity: 0; }
        }
        @keyframes m3s1SnapPulse {
          0%, 30% { filter: brightness(1); outline: none; }
          32% { filter: brightness(1.4); outline: 2px solid #38bdf8; box-shadow: 0 0 16px rgba(56, 189, 248, 0.9); }
          40%, 85% { filter: brightness(1.05); outline: 1px solid rgba(56, 189, 248, 0.5); }
          92%, 100% { filter: brightness(1); outline: none; }
        }

        /* Step 1 Simulation Reaction (Only applies AFTER block snaps at 32%) */
        @keyframes m3s1SimDormant {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m3s1SimActive {
          0%, 30% { opacity: 0; transform: scale(0.96); }
          34%, 88% { opacity: 1; transform: scale(1); }
          94%, 100% { opacity: 0; transform: scale(0.96); }
        }
        @keyframes m3s1StatusReady {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m3s1StatusOnline {
          0%, 30% { opacity: 0; }
          34%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2.5 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury3ToolboxSidebar activeTab="html" />

          {/* Blockly Assembly Area */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Slot for Attach Stylesheet: Blank trace silhouette */}
            <div className="relative mb-1">
              <div className="h-7 w-[195px] rounded border border-dashed border-rose-500/40 bg-rose-950/10" />

              {/* Animated Dragged Block */}
              <div
                className="absolute inset-0 h-7 w-[195px] bg-[#E11D48] text-white text-[9.5px] font-bold px-2 rounded flex items-center justify-between shadow border-t border-x border-rose-400/40 z-30"
                style={{
                  animation: 'm3s1DragLink 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m3s1SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Attach Stylesheet</span>
                <span className="bg-black/40 text-[8px] px-1 py-0.5 rounded text-rose-200 font-mono">style.css</span>

                {/* Animated Hand/Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm3s1CursorDrag 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Static Pre-existing structure */}
            <div className="h-7 w-[195px] bg-[#BE123C] text-white text-[9.5px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Attach Logic Script</span>
              <span className="bg-black/40 text-[8px] px-1 py-0.5 rounded text-rose-200 font-mono">logic.js</span>
            </div>

            <div className="h-7.5 w-[195px] bg-[#C2410C] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-orange-400/40 mt-1">
              <span>Main Screen Box</span>
            </div>
            <div className="h-6.5 w-[187px] bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-2 rounded-b flex items-center justify-between border-t border-black/20 shadow">
              <span>Main Title:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-white font-mono">AstroLink</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
              style={{ animation: 'm3s1StatusReady 6.5s ease-in-out infinite' }}
            >
              UNLINKED
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black"
              style={{ animation: 'm3s1StatusOnline 6.5s ease-in-out infinite' }}
            >
              RELAY ONLINE
            </span>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-2.5 bg-[#03131d]">
          {/* Top AstroLink Transceiver HUD */}
          <div className="w-full max-w-[270px] flex items-center justify-between px-2 py-1 rounded bg-[#100720] border border-purple-800/40 mb-2">
            <div className="flex items-center gap-1.5 font-mono text-[8.5px] text-purple-300 font-bold">
              <Radio size={11} className="text-cyan-400" />
              <span>ASTROLINK TRANSCEIVER</span>
            </div>
            <span className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-purple-950 border border-purple-700/50 text-purple-200 font-bold">
              STANDBY
            </span>
          </div>

          {/* DORMANT STATE (Before block snap: 0% - 30%): Clean dormant frame */}
          <div
            className="absolute w-full max-w-[270px] h-[130px] rounded-xl border border-dashed border-red-500/40 bg-[#091522]/90 p-3 flex flex-col justify-between shadow-lg pointer-events-none"
            style={{ animation: 'm3s1SimDormant 6.5s ease-in-out infinite' }}
          >
            <div className="w-full h-full rounded border border-dashed border-cyan-500/20 bg-black/40 flex items-center justify-center opacity-40">
              <div
                className="w-full h-full opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(6,182,212,0.4) 1px, transparent 1px)',
                  backgroundSize: '12px 12px',
                }}
              />
            </div>
          </div>

          {/* ACTIVE STATE (After block snap: 35% - 88%) */}
          <div
            className="w-full max-w-[270px] h-[130px] rounded-xl border-2 border-cyan-400 bg-[#061e2e] p-2.5 flex flex-col justify-between shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all"
            style={{ animation: 'm3s1SimActive 6.5s ease-in-out infinite' }}
          >
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1">
              <span className="text-[9px] font-mono text-cyan-300 font-bold">ASTROLINK COMMS RELAY</span>
              <span className="text-[8px] font-mono text-emerald-400 font-bold">CONNECTED</span>
            </div>

            <div className="flex flex-col gap-1.5 p-1.5 rounded bg-black/60 border border-cyan-500/30">
              <span className="text-[9.5px] font-bold text-slate-100">Terminal Online</span>
              <div className="h-5 px-2 rounded bg-slate-900 border border-slate-700 flex items-center text-[8.5px] text-cyan-300 font-mono">
                System linked successfully
              </div>
            </div>

            <div className="w-full flex items-center justify-between text-[8px] font-mono">
              <span className="text-slate-400">INTERFACE LINKED</span>
              <span className="text-emerald-400 font-bold">100% HEALTH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Build HTML Form Structure
 * Dynamic Animation:
 * - Left: Send Button block is dragged into Main Screen Box blank trace slot
 * - Right: Transmit button in Simulation only renders AFTER block snaps in!
 */
export function MercuryLevel3Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag Send Button Block */
        @keyframes m3s2DragSend {
          0%, 12% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0.6;
          }
          32%, 85% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 25px) scale(0.92);
            opacity: 0.6;
          }
        }
        @keyframes m3s2CursorDrag {
          0%, 12% { transform: translate(-65px, 25px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          38%, 85% { transform: translate(25px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-65px, 25px); opacity: 0; }
        }
        @keyframes m3s2SnapPulse {
          0%, 30% { filter: brightness(1); outline: none; }
          32% { filter: brightness(1.4); outline: 2px solid #10b981; box-shadow: 0 0 16px rgba(16, 185, 129, 0.9); }
          40%, 85% { filter: brightness(1.05); outline: 1px solid rgba(16, 185, 129, 0.5); }
          92%, 100% { filter: brightness(1); outline: none; }
        }

        /* Simulation Button Pop-in after snap */
        @keyframes m3s2BtnMissing {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m3s2BtnRendered {
          0%, 30% { opacity: 0; transform: scale(0.85); }
          34%, 88% { opacity: 1; transform: scale(1); }
          94%, 100% { opacity: 0; transform: scale(0.85); }
        }
        @keyframes m3s2StatusBuilding {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m3s2StatusComplete {
          0%, 30% { opacity: 0; }
          34%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2.5 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury3ToolboxSidebar activeTab="html" />

          {/* Blockly Assembly Stack */}
          <div className="flex-1 flex flex-col pt-0.5 relative z-20">
            {/* Main Screen Box */}
            <div className="h-7.5 w-[195px] bg-[#C2410C] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-orange-400/40">
              <span>Main Screen Box</span>
            </div>

            {/* Nested Title Block */}
            <div className="h-6.5 w-[187px] bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Main Title:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-white font-mono">AstroLink</span>
            </div>

            {/* Nested Text Input Block */}
            <div className="h-6.5 w-[187px] bg-[#10B981] text-white text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Text Input Area</span>
              <span className="bg-black/40 px-1 py-0.5 rounded text-[7.5px] text-emerald-200 font-mono">Signal check...</span>
            </div>

            {/* Send Button: Dragged and Snapped into blank trace slot */}
            <div className="relative ml-2 w-[187px] mt-0.5">
              <div className="h-6.5 rounded-b border border-dashed border-emerald-500/40 bg-emerald-950/10" />

              {/* Animated Dragged Send Button Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#059669] text-white text-[9.5px] font-bold px-2 rounded-b flex items-center justify-between shadow border-b border-x border-emerald-400/30 z-30"
                style={{
                  animation: 'm3s2DragSend 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m3s2SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Send Button:</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-emerald-200 font-mono">Transmit</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm3s2CursorDrag 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
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
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
              style={{ animation: 'm3s2StatusBuilding 6.5s ease-in-out infinite' }}
            >
              ASSEMBLING
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black"
              style={{ animation: 'm3s2StatusComplete 6.5s ease-in-out infinite' }}
            >
              STRUCTURE BUILT
            </span>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-2.5 bg-[#03131d]">
          <div className="w-full max-w-[270px] h-[135px] rounded-xl border border-cyan-500/40 bg-[#061e2e] p-2.5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1">
              <span className="text-[8.5px] font-mono text-cyan-300 font-bold">ASTROLINK FORM TERMINAL</span>
              <Radio size={11} className="text-cyan-400" />
            </div>

            {/* Terminal Elements */}
            <div className="flex flex-col gap-1.5 p-2 rounded bg-black/60 border border-cyan-500/30">
              <div className="text-[9.5px] font-bold text-center text-slate-100">AstroLink Comms</div>
              <div className="h-5 px-2 rounded bg-slate-900 border border-slate-700 flex items-center text-[8px] text-slate-300 font-mono">
                Signal check...
              </div>

              {/* BEFORE SNAP: Blank trace placeholder */}
              <div
                className="relative h-5 rounded border border-dashed border-emerald-500/30 bg-emerald-950/10"
                style={{ animation: 'm3s2BtnMissing 6.5s ease-in-out infinite' }}
              />

              {/* AFTER SNAP: Transmit Button Renders Dynamically */}
              <div
                className="absolute inset-x-2.5 bottom-2 h-5 rounded bg-emerald-600 text-[8.5px] font-bold text-white flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all"
                style={{ animation: 'm3s2BtnRendered 6.5s ease-in-out infinite' }}
              >
                <Send size={9} />
                <span>Transmit</span>
              </div>
            </div>

            <div className="w-full flex items-center justify-between text-[8px] font-mono">
              <span className="text-slate-400">INPUT + ACTION READY</span>
              <span className="text-cyan-300 font-bold">HTML VALID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: Style with CSS Flexbox
 * Dynamic Animation:
 * - Left: Arrange Direction: Vertical block is dragged into Link Styles to: Main Screen Box
 * - Right: Simulation starts with raw unstyled browser layout; transforms into styled centered terminal ONLY after snap!
 */
export function MercuryLevel3Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag CSS Flexbox Block */
        @keyframes m3s3DragFlex {
          0%, 12% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0.6;
          }
          32%, 85% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0.6;
          }
        }
        @keyframes m3s3CursorDrag {
          0%, 12% { transform: translate(-65px, 20px); opacity: 1; }
          32% { transform: translate(0px, 0px); opacity: 1; }
          38%, 85% { transform: translate(25px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-65px, 20px); opacity: 0; }
        }
        @keyframes m3s3SnapPulse {
          0%, 30% { filter: brightness(1); outline: none; }
          32% { filter: brightness(1.4); outline: 2px solid #7c3aed; box-shadow: 0 0 16px rgba(124, 58, 237, 0.9); }
          40%, 85% { filter: brightness(1.05); outline: 1px solid rgba(124, 58, 237, 0.5); }
          92%, 100% { filter: brightness(1); outline: none; }
        }

        /* Simulation Style Shift (Raw -> Styled at 32%) */
        @keyframes m3s3RawLayout {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; pointer-events: none; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m3s3StyledLayout {
          0%, 30% { opacity: 0; transform: scale(0.95); }
          34%, 88% { opacity: 1; transform: scale(1); }
          94%, 100% { opacity: 0; transform: scale(0.95); }
        }
        @keyframes m3s3StatusRaw {
          0%, 30% { opacity: 1; }
          34%, 90% { opacity: 0; }
          95%, 100% { opacity: 1; }
        }
        @keyframes m3s3StatusStyled {
          0%, 30% { opacity: 0; }
          34%, 90% { opacity: 1; }
          95%, 100% { opacity: 0; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2.5 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury3ToolboxSidebar activeTab="css" />

          {/* Blockly CSS Assembly */}
          <div className="flex-1 flex flex-col pt-0.5 relative z-20">
            {/* css_selector_wrapper: Link Styles to: Main Screen Box */}
            <div className="h-7.5 w-[195px] bg-[#2563EB] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-blue-400/40">
              <span>Link Styles to:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-cyan-200 font-mono">Main Screen Box ▾</span>
            </div>

            {/* Dragged Block with blank trace slot */}
            <div className="relative ml-2 w-[187px] mt-0.5">
              <div className="h-6.5 rounded border border-dashed border-purple-500/40 bg-purple-950/10" />

              {/* Animated Dragged Flex Block */}
              <div
                className="absolute inset-0 h-6.5 bg-[#7C3AED] text-white text-[9px] font-bold px-2 rounded flex items-center justify-between shadow border-t border-x border-purple-400/30 z-30"
                style={{
                  animation: 'm3s3DragFlex 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m3s3SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                <span>Arrange Direction:</span>
                <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-purple-200 font-mono">Vertical ▾</span>

                {/* Animated Cursor */}
                <div
                  className="absolute right-2 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm3s3CursorDrag 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
                >
                  <CursorPointer />
                </div>
              </div>
            </div>

            {/* Static CSS Children */}
            <div className="h-6.5 w-[187px] bg-[#8B5CF6] text-white text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow mt-0.5">
              <span>Align Items:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-violet-200 font-mono">Center ▾</span>
            </div>

            <div className="h-6.5 w-[187px] bg-[#EC4899] text-white text-[9px] font-bold px-2 ml-2 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-pink-400/20">
              <span>Color:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[7.5px] text-pink-200 font-mono">Pastel Orange ▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
              style={{ animation: 'm3s3StatusRaw 6.5s ease-in-out infinite' }}
            >
              RAW UNSTYLED
            </span>
            <span
              className="absolute right-0 text-[#06b6d4] drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] font-black"
              style={{ animation: 'm3s3StatusStyled 6.5s ease-in-out infinite' }}
            >
              FLEXBOX STYLED
            </span>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-2.5 bg-[#03131d]">
          {/* BEFORE SNAP: RAW UNSTYLED VIEW (0% - 30%) */}
          <div
            className="absolute w-full max-w-[270px] h-[130px] rounded-lg border border-red-500/40 bg-[#070b12] p-2 flex flex-col justify-between shadow"
            style={{ animation: 'm3s3RawLayout 6.5s ease-in-out infinite' }}
          >
            {/* Clumsy left-aligned unstyled HTML elements */}
            <div className="flex flex-col items-start gap-1 p-1 bg-white/5 rounded border border-white/10 font-sans">
              <span className="text-[8.5px] text-slate-300 font-bold">AstroLink Comms</span>
              <input
                readOnly
                value="Signal check..."
                className="h-4.5 w-32 px-1 text-[7.5px] bg-slate-800 border border-slate-600 text-slate-400 rounded-none"
              />
              <button className="h-4.5 px-2 text-[7.5px] bg-slate-700 text-slate-300 border border-slate-500 rounded-none">
                Transmit
              </button>
            </div>

            <div className="text-[7.5px] font-mono text-slate-400 text-right">
              display: block (default flow)
            </div>
          </div>

          {/* AFTER SNAP: STYLED & CENTERED TERMINAL (35% - 88%) */}
          <div
            className="w-full max-w-[270px] h-[130px] rounded-xl border-2 border-purple-500/70 bg-[#150E2D] p-2.5 flex flex-col justify-between shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all"
            style={{ animation: 'm3s3StyledLayout 6.5s ease-in-out infinite' }}
          >
            <div className="flex items-center justify-between border-b border-purple-600/40 pb-1">
              <span className="text-[8.5px] font-mono text-purple-200 font-bold">TERMINAL LAYOUT</span>
              <span className="text-[7.5px] font-mono text-cyan-300 font-bold">flex-col + center</span>
            </div>

            {/* Beautiful centered flexbox card with pastel orange button */}
            <div className="flex flex-col items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-black/40 border border-purple-600/30">
              <span className="text-[9.5px] font-bold text-white tracking-wide">AstroLink Comms</span>
              <div className="h-4.5 w-full max-w-[190px] px-2 rounded-md bg-[#0D051C] border border-purple-500/40 flex items-center text-[7.5px] text-purple-200 font-mono">
                Signal check...
              </div>
              <div className="px-3 py-0.5 rounded-md bg-[#FFB347] text-slate-950 font-bold text-[8px] flex items-center gap-1 shadow-[0_0_10px_rgba(255,179,71,0.5)]">
                <Send size={8} />
                <span>Transmit Signal</span>
              </div>
            </div>

            <div className="w-full flex items-center justify-between text-[8px] font-mono">
              <span className="text-purple-300">PERFECT CENTERING</span>
              <span className="text-emerald-400 font-bold">PASTEL ORANGE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Transmit with JavaScript
 * Dynamic Animation:
 * - Left: When Send Button is Clicked + Beam Signal block is dragged from JS toolbox into workspace blank trace slot
 * - Right: Simulation Transmit button is clicked by cursor -> Beams signal to Mars -> Mars online + incoming packet received!
 */
export function MercuryLevel3Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        /* Drag JS Event Listener Stack */
        @keyframes m3s4DragListener {
          0%, 10% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0.6;
          }
          28%, 85% {
            transform: translate(0px, 0px) scale(1);
            opacity: 1;
          }
          94%, 100% {
            transform: translate(-65px, 20px) scale(0.92);
            opacity: 0.6;
          }
        }
        @keyframes m3s4CursorDrag {
          0%, 10% { transform: translate(-65px, 20px); opacity: 1; }
          28% { transform: translate(0px, 0px); opacity: 1; }
          32%, 85% { transform: translate(25px, 20px); opacity: 0; }
          94%, 100% { transform: translate(-65px, 20px); opacity: 0; }
        }
        @keyframes m3s4SnapPulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28% { filter: brightness(1.4); outline: 2px solid #f97316; box-shadow: 0 0 16px rgba(249, 115, 22, 0.9); }
          38%, 85% { filter: brightness(1.05); outline: 1px solid rgba(249, 115, 22, 0.5); }
          92%, 100% { filter: brightness(1); outline: none; }
        }

        /* Simulation Cursor Click & Transmission Reaction */
        @keyframes m3s4SimCursor {
          0%, 30% { transform: translate(140px, 120px); opacity: 0; }
          34%, 42% { transform: translate(120px, 68px); opacity: 1; }
          44%, 48% { transform: translate(120px, 68px) scale(0.85); opacity: 1; }
          52%, 85% { transform: translate(140px, 90px); opacity: 0; }
          94%, 100% { transform: translate(140px, 120px); opacity: 0; }
        }
        @keyframes m3s4BtnClickPulse {
          0%, 42% { transform: scale(1); filter: brightness(1); }
          44%, 50% { transform: scale(0.94); filter: brightness(1.4); }
          54%, 100% { transform: scale(1); filter: brightness(1); }
        }
        @keyframes m3s4BeamPulse {
          0%, 43% { opacity: 0; transform: scaleX(0); }
          46%, 70% { opacity: 1; transform: scaleX(1); }
          75%, 100% { opacity: 0; transform: scaleX(0); }
        }
        @keyframes m3s4MarsNode {
          0%, 46% {
            background-color: rgba(26, 11, 51, 0.8);
            border-color: rgba(126, 34, 206, 0.5);
            color: #d8b4fe;
            box-shadow: none;
          }
          48%, 88% {
            background-color: rgba(6, 78, 59, 0.8);
            border-color: #34d399;
            color: #a7f3d0;
            box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
          }
          94%, 100% {
            background-color: rgba(26, 11, 51, 0.8);
            border-color: rgba(126, 34, 206, 0.5);
            color: #d8b4fe;
            box-shadow: none;
          }
        }
        @keyframes m3s4PacketFeed {
          0%, 48% { opacity: 0; transform: translateY(6px); }
          52%, 88% { opacity: 1; transform: translateY(0); }
          94%, 100% { opacity: 0; transform: translateY(6px); }
        }
        @keyframes m3s4NodeCounter {
          0%, 46% { opacity: 1; }
          48%, 90% { opacity: 0; }
          94%, 100% { opacity: 1; }
        }
        @keyframes m3s4NodeCounterOnline {
          0%, 46% { opacity: 0; }
          48%, 90% { opacity: 1; }
          94%, 100% { opacity: 0; }
        }
      `}</style>

      {/* LEFT PANE: Workspace */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-2.5 flex flex-row gap-2.5 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury3ToolboxSidebar activeTab="js" />

          {/* Blockly JS Assembly Stack */}
          <div className="flex-1 flex flex-col pt-1 relative z-20">
            {/* Slot for Event Listener: Blank trace slot */}
            <div className="relative w-[195px]">
              <div className="h-19 rounded border border-dashed border-orange-500/40 bg-orange-950/10" />

              {/* Animated Dragged Event Listener Block */}
              <div
                className="absolute inset-0 flex flex-col z-30"
                style={{
                  animation: 'm3s4DragListener 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite, m3s4SnapPulse 6.5s ease-in-out infinite',
                }}
              >
                {/* js_add_event_listener Header */}
                <div className="h-7 bg-[#F97316] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-orange-400/40">
                  <span>When</span>
                  <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-yellow-300 font-mono">Send Button ▾</span>
                  <span>is Clicked do:</span>
                </div>

                {/* js_beam_signal nested inside */}
                <div className="h-6.5 bg-[#6366F1] text-white text-[8.5px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
                  <span>Beam Signal to Planet:</span>
                  <span className="bg-black/50 px-1 py-0.5 rounded text-[7.5px] text-cyan-200 font-mono">Mars ▾</span>
                </div>

                {/* Message payload */}
                <div className="h-6 bg-[#6366F1] text-white text-[8.5px] font-bold px-2 ml-2 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-indigo-400/20">
                  <span>with Message:</span>
                  <span className="bg-[#14B8A6] px-1 py-0.5 rounded text-[7.5px] text-white font-mono">Typed Text</span>
                </div>

                {/* Animated Cursor */}
                <div
                  className="absolute right-3 -bottom-2 pointer-events-none z-40"
                  style={{ animation: 'm3s4CursorDrag 6.5s cubic-bezier(0.2, 0.9, 0.4, 1) infinite' }}
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
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span
              className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]"
              style={{ animation: 'm3s4NodeCounter 6.5s ease-in-out infinite' }}
            >
              0 / 4 ONLINE
            </span>
            <span
              className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] font-black"
              style={{ animation: 'm3s4NodeCounterOnline 6.5s ease-in-out infinite' }}
            >
              1 / 4 ONLINE
            </span>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-between p-2.5 bg-[#03131d]">
          {/* Planetary Destination Status Badges */}
          <div className="w-full flex items-center gap-1 shrink-0">
            <div
              className="flex-1 py-1 px-1.5 rounded border text-[8px] font-mono font-bold flex items-center justify-center gap-1 transition-all"
              style={{ animation: 'm3s4MarsNode 6.5s ease-in-out infinite' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>MARS</span>
            </div>
            <div className="flex-1 py-1 px-1.5 rounded border border-purple-800/40 bg-[#160a2c]/60 text-purple-400 text-[8px] font-mono font-bold flex items-center justify-center gap-1 opacity-70">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
              <span>VENUS</span>
            </div>
            <div className="flex-1 py-1 px-1.5 rounded border border-purple-800/40 bg-[#160a2c]/60 text-purple-400 text-[8px] font-mono font-bold flex items-center justify-center gap-1 opacity-70">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
              <span>JUPITER</span>
            </div>
            <div className="flex-1 py-1 px-1.5 rounded border border-purple-800/40 bg-[#160a2c]/60 text-purple-400 text-[8px] font-mono font-bold flex items-center justify-center gap-1 opacity-70">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
              <span>SATURN</span>
            </div>
          </div>

          {/* Interactive Terminal Window */}
          <div className="w-full max-w-[270px] h-[95px] rounded-lg border border-purple-500/40 bg-[#150E2D] p-2 flex flex-col justify-between shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono text-purple-200 font-bold">AstroLink Terminal</span>
              <span className="text-[7.5px] font-mono text-cyan-300 font-bold">Target: Mars</span>
            </div>

            {/* Glowing Signal Beam Line on transmit */}
            <div
              className="absolute inset-x-2 top-8 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 rounded-full shadow-[0_0_12px_#34d399] origin-left pointer-events-none"
              style={{ animation: 'm3s4BeamPulse 6.5s ease-in-out infinite' }}
            />

            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-5 px-2 rounded bg-[#0D051C] border border-purple-500/30 flex items-center text-[7.5px] text-purple-200 font-mono truncate">
                Hello Mars from Mercury!
              </div>

              {/* Transmit Button (Clicked by Cursor) */}
              <div
                className="h-5 px-3 rounded bg-orange-500 text-slate-950 font-bold text-[8px] flex items-center gap-1 shadow cursor-pointer select-none"
                style={{ animation: 'm3s4BtnClickPulse 6.5s ease-in-out infinite' }}
              >
                <Send size={8} />
                <span>Transmit</span>
              </div>
            </div>

            {/* Cursor moving to click Transmit button */}
            <div
              className="absolute pointer-events-none z-50"
              style={{ animation: 'm3s4SimCursor 6.5s ease-in-out infinite' }}
            >
              <CursorPointer />
            </div>

            <div className="text-[7px] font-mono text-slate-400">
              Click Transmit to beam signal
            </div>
          </div>

          {/* COMMS RELAY FEED */}
          <div className="w-full rounded border border-purple-700/40 bg-[#16092E]/95 px-2 py-1 flex items-center justify-between shadow">
            <div className="flex items-center gap-1.5 min-w-0">
              <MessageSquare size={10} className="text-purple-300 shrink-0" />
              <span className="text-[8px] font-mono font-bold text-purple-200">FEED:</span>
              <div
                className="text-[7.5px] font-mono text-emerald-300 truncate"
                style={{ animation: 'm3s4PacketFeed 6.5s ease-in-out infinite' }}
              >
                Mars: &quot;Woohoo! We hear you loud and clear out here!&quot;
              </div>
            </div>
            <span className="text-[7px] font-mono px-1 rounded bg-purple-950 text-purple-300 shrink-0 font-bold">
              PACKET IN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
