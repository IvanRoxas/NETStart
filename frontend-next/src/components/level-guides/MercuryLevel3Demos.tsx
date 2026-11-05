"use client";

import React from 'react';
import { Radio, Send } from 'lucide-react';

function CursorPointer({ className = "" }: { className?: string }) {
  return (
    <svg
      width="30"
      height="30"
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
    <div className="flex flex-col gap-2 w-18 shrink-0 py-1.5 select-none font-mono">
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeTab === 'html' ? 'text-orange-300 bg-orange-950/80 border-l-2 border-orange-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        HTML
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeTab === 'css' ? 'text-blue-300 bg-blue-950/80 border-l-2 border-blue-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        CSS
      </div>
      <div className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-r shadow-xs ${activeTab === 'js' ? 'text-yellow-300 bg-yellow-950/80 border-l-2 border-yellow-400' : 'text-slate-400 bg-slate-900/40 border-l border-slate-700'}`}>
        JS Logic
      </div>
    </div>
  );
}

/**
 * Slide 1: How to Win Mercury Level 3 (The Missing Interface)
 * Authentic blocks: html_form_container, html_title_block, html_send_button
 */
export function MercuryLevel3Step1Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m3s1Ready { 0%, 25% { opacity: 1; } 30%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m3s1Running { 0%, 25% { opacity: 0; } 30%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m3s1RelayActive {
          0%, 30% { border-color: rgba(6, 182, 212, 0.3); }
          35%, 92% { border-color: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
          96%, 100% { border-color: rgba(6, 182, 212, 0.3); }
        }
      `}</style>

      {/* LEFT PANE */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-4 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury3ToolboxSidebar activeTab="html" />

          {/* Actual Blockly Stack: html_form_container, html_title_block, html_message_box, html_send_button */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* html_form_container */}
            <div className="h-7 bg-[#C2410C] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-orange-400/40">
              <span>Main Screen Box</span>
            </div>

            {/* html_title_block */}
            <div className="h-6 bg-[#F59E0B] text-slate-950 text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Main Title:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-white font-mono">AstroLink</span>
            </div>

            {/* html_message_box */}
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Text Input Area</span>
            </div>

            {/* html_send_button */}
            <div className="h-6 bg-[#059669] text-white text-[9px] font-bold px-2 ml-2 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-emerald-400/20">
              <span>Send Button:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-emerald-200">Transmit</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Authentic Simulation Terminal */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm3s1Ready 7s ease-in-out infinite' }}>STANDBY</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'm3s1Running 7s ease-in-out infinite' }}>RELAY ONLINE</span>
          </div>
        </div>

        {/* Relay Interface Console */}
        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#03131d]">
          <div
            className="w-full max-w-[260px] h-[145px] rounded-xl border-2 border-cyan-500/50 bg-[#061e2e] p-2.5 flex flex-col justify-between shadow-2xl transition-all"
            style={{ animation: 'm3s1RelayActive 7s ease-in-out infinite' }}
          >
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1">
              <span className="text-[8.5px] font-mono text-cyan-300 font-bold">ASTROLINK COMMS RELAY</span>
              <Radio size={12} className="text-cyan-400" />
            </div>

            {/* Terminal Inner Frame */}
            <div className="flex flex-col gap-1.5 p-1.5 rounded bg-black/60 border border-cyan-500/30">
              <span className="text-[9px] font-bold text-slate-200">Terminal Ready</span>
              <div className="h-5 px-2 rounded bg-slate-900 border border-slate-700 flex items-center text-[8px] text-slate-400">
                Signal check...
              </div>
              <button className="h-5 rounded bg-emerald-600 text-[8.5px] font-bold text-white flex items-center justify-center gap-1 shadow">
                <Send size={9} />
                Transmit
              </button>
            </div>

            <div className="w-full flex items-center justify-between text-[8px] font-mono">
              <span className="text-slate-400">STATUS:</span>
              <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 2: Attaching the Button Click Handler in JS Tab
 * Focus on js_add_event_listener & js_beam_signal
 */
export function MercuryLevel3Step2Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m3s2Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m3s2Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m3s2Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes m3s2Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #F97316; box-shadow: 0 0 16px rgba(249,115,22,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #F97316; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
      `}</style>

      {/* LEFT PANE */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-4 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury3ToolboxSidebar activeTab="js" />

          {/* Actual Blockly Stack: js_add_event_listener & js_beam_signal */}
          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* js_add_event_listener - Clicked */}
            <div
              className="relative h-7 bg-[#F97316] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-orange-400/40 z-20"
              style={{ animation: 'm3s2Pulse 6s ease-in-out infinite' }}
            >
              <span>When</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8.5px] text-yellow-300">Send Button ▾</span>
              <span>is Clicked do:</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm3s2Cursor 6s ease-in-out infinite' }}>
                <CursorPointer />
              </div>
            </div>

            {/* js_beam_signal inside listener */}
            <div className="h-7 bg-[#6366F1] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Beam Signal to Planet:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-cyan-200">Mars ▾</span>
            </div>

            {/* Payload socket */}
            <div className="h-6 bg-[#6366F1] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-indigo-400/20">
              <span>with Message:</span>
              <span className="bg-[#14B8A6] px-1 py-0.5 rounded text-[8px] text-white">Typed Text</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm3s2Ready 6s ease-in-out infinite' }}>READY</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'm3s2Running 6s ease-in-out infinite' }}>SIGNAL BEAMED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#03131d]">
          <div className="w-full max-w-[260px] h-[130px] rounded-xl border-2 border-orange-500/50 bg-[#061e2e] p-3 flex flex-col justify-between shadow-2xl">
            <span className="text-[9px] font-mono text-orange-300 font-bold">EVENT TRANSMISSION</span>
            <div className="w-full py-2 rounded bg-black/60 border border-orange-400/40 text-center font-mono text-[10px] text-emerald-300 font-bold">
              Click Transmit → Signal sent to Mars
            </div>
            <span className="text-[8.5px] font-mono text-center text-slate-300">Front-End software successfully connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 3: CSS Flexbox Layout & Color Styling
 * Focus on css_selector_wrapper, css_flex_direction, css_color_picker
 */
export function MercuryLevel3Step3Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m3s3Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m3s3Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m3s3Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes m3s3Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #06B6D4; box-shadow: 0 0 16px rgba(6,182,212,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #06B6D4; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
      `}</style>

      {/* LEFT PANE */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-4 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury3ToolboxSidebar activeTab="css" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* css_selector_wrapper: Target Box */}
            <div className="h-7 bg-[#1E293B] text-white text-[9.5px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-slate-500/40">
              <span>Target:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-cyan-300 font-mono">Main Box ▾</span>
            </div>

            {/* css_flex_direction - Clicked */}
            <div
              className="relative h-6 bg-[#06B6D4] text-slate-950 text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow z-20"
              style={{ animation: 'm3s3Pulse 6s ease-in-out infinite' }}
            >
              <span>Layout Direction:</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8.5px] text-cyan-200 font-mono">Column ▾</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm3s3Cursor 6s ease-in-out infinite' }}>
                <CursorPointer />
              </div>
            </div>

            {/* css_align_center */}
            <div className="h-6 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 flex items-center justify-between border-t border-black/20 shadow">
              <span>Center Content</span>
            </div>

            {/* css_color_picker */}
            <div className="h-6 bg-[#F97316] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-orange-400/20">
              <span>Button Color:</span>
              <span className="bg-black/50 px-1 py-0.5 rounded text-[8px] text-amber-200 font-mono">Pastel Orange ▾</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm3s3Ready 6s ease-in-out infinite' }}>RAW</span>
            <span className="absolute right-0 text-[#06b6d4] drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'm3s3Running 6s ease-in-out infinite' }}>STYLED</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#03131d]">
          <div className="w-full max-w-[260px] h-[130px] rounded-xl border-2 border-cyan-500/50 bg-[#061e2e] p-2.5 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1">
              <span className="text-[9px] font-mono text-cyan-300 font-bold">TERMINAL STYLING</span>
              <span className="text-[7.5px] font-mono text-cyan-400">flex-col centered</span>
            </div>

            <div className="w-full h-14 rounded-lg bg-black/60 border border-cyan-400/30 p-1 flex flex-col items-center justify-center gap-1">
              <span className="text-[8px] text-slate-300 font-mono">AstroLink Terminal</span>
              <div className="px-3 py-0.5 rounded bg-orange-500 text-slate-950 font-bold text-[8px] shadow">
                Transmit Signal
              </div>
            </div>

            <span className="text-[8.5px] font-mono text-center text-slate-300">Clean vertical alignment and branded button</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide 4: Full-Stack Communication Relay
 * Focus on complete system restoration across all 3 tabs
 */
export function MercuryLevel3Step4Demo() {
  return (
    <div className="relative w-full h-full flex rounded-xl border border-white/10 bg-[#0e041a] overflow-hidden select-none font-sans">
      <style>{`
        @keyframes m3s4Ready { 0%, 30% { opacity: 1; } 35%, 92% { opacity: 0; } 96%, 100% { opacity: 1; } }
        @keyframes m3s4Running { 0%, 30% { opacity: 0; } 35%, 92% { opacity: 1; } 96%, 100% { opacity: 0; } }
        @keyframes m3s4Cursor {
          0% { transform: translate(-45px, 35px); opacity: 0; }
          15%, 25% { transform: translate(0px, 0px); opacity: 1; }
          28%, 35% { transform: translate(0px, 0px) scale(0.85); opacity: 1; }
          45%, 85% { transform: translate(20px, 20px); opacity: 0; }
          95%, 100% { transform: translate(-45px, 35px); opacity: 0; }
        }
        @keyframes m3s4Pulse {
          0%, 26% { filter: brightness(1); outline: none; }
          28%, 38% { filter: brightness(1.4); outline: 2px solid #10B981; box-shadow: 0 0 16px rgba(16,185,129,0.9); }
          45%, 85% { filter: brightness(1.1); outline: 1px solid #10B981; }
          95%, 100% { filter: brightness(1); outline: none; }
        }
      `}</style>

      {/* LEFT PANE */}
      <div className="w-1/2 h-full flex flex-col border-r border-white/10 relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center shrink-0">
          <span className="text-[10px] font-bold text-slate-200">Workspace</span>
        </div>

        <div
          className="flex-1 p-3 flex flex-row gap-4 relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        >
          <Mercury3ToolboxSidebar activeTab="js" />

          <div className="flex flex-col w-[190px] sm:w-[205px] relative z-20">
            {/* HTML Link */}
            <div className="h-6 bg-[#E11D48] text-white text-[9px] font-bold px-2 rounded-t flex items-center justify-between shadow border-t border-x border-rose-400/40">
              <span>Attach Stylesheet</span>
            </div>

            {/* JS Link */}
            <div className="h-6 bg-[#BE123C] text-white text-[9px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>Attach Logic Script</span>
            </div>

            {/* Event Listener */}
            <div className="h-6 bg-[#F97316] text-white text-[9px] font-bold px-2 flex items-center justify-between border-t border-black/20 shadow">
              <span>When Send Button is Clicked:</span>
            </div>

            {/* Beam Signal - Clicked */}
            <div
              className="relative h-7 bg-[#10B981] text-white text-[9px] font-bold px-2 ml-3 rounded-b flex items-center justify-between border-t border-black/20 shadow border-b border-x border-emerald-400/20 z-20"
              style={{ animation: 'm3s4Pulse 6s ease-in-out infinite' }}
            >
              <span>Beam Signal to Planet</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded text-[8px] text-emerald-200 font-mono">Mars ▾</span>

              <div className="absolute right-4 -bottom-3 pointer-events-none z-30" style={{ animation: 'm3s4Cursor 6s ease-in-out infinite' }}>
                <CursorPointer />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div className="w-1/2 h-full flex flex-col bg-[#0b0314] relative">
        <div className="h-6 px-3 bg-[#170529] border-b border-white/10 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black tracking-wider uppercase font-mono text-purple-200">SIMULATION</span>
          <div className="relative flex items-center h-4 font-mono text-[9px] font-bold tracking-wider">
            <span className="text-[#00f5d4] drop-shadow-[0_0_6px_rgba(0,245,212,0.6)]" style={{ animation: 'm3s4Ready 6s ease-in-out infinite' }}>STANDBY</span>
            <span className="absolute right-0 text-[#10b981] drop-shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse whitespace-nowrap" style={{ animation: 'm3s4Running 6s ease-in-out infinite' }}>RELAY ONLINE</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 relative flex flex-col items-center justify-center p-3 bg-[#03131d]">
          <div className="w-full max-w-[260px] h-[130px] rounded-xl border-2 border-emerald-500/50 bg-[#061e2e] p-2.5 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1">
              <span className="text-[9px] font-mono text-emerald-300 font-bold">FULL-STACK RELAY ACTIVE</span>
              <span className="text-[8px] font-mono text-emerald-400">100% HEALTH</span>
            </div>

            <div className="w-full py-2 rounded bg-black/60 border border-emerald-400/40 text-center font-mono text-[10px] text-emerald-300 font-bold">
              HTML + CSS + JS fully restored
            </div>

            <span className="text-[8.5px] font-mono text-center text-slate-300">Mercury re-established link to all celestial stations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
