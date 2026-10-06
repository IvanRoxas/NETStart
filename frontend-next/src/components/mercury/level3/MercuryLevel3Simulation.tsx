"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Terminal, CheckCircle2, AlertTriangle, Send, RefreshCw, Globe, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import {
  PlanetTarget,
  MERCURY_3_TARGET_PLANETS,
  Mercury3AuditStatus,
} from '@/lib/mercury/mercuryLevel3Definitions';

export interface MercuryLevel3SimulationProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  audit: Mercury3AuditStatus;
  isRunning: boolean;
  onSimulationComplete: () => void;
  onPlanetConnected?: (planet: PlanetTarget, allConnected: boolean) => void;
  onToastMessage?: (msg: string, type?: 'warning' | 'error' | 'success') => void;
  onResetSimulation?: () => void;
  onStopRunning?: () => void;
  onExitToModules?: () => void;
}

interface MessageLog {
  id: string;
  sender: 'outgoing' | 'incoming';
  planet: PlanetTarget;
  text: string;
  timestamp: string;
}

const PLANET_REPLIES: Record<PlanetTarget, string[]> = {
  Mars: [
    'Woohoo! We hear you loud and clear out here in the red dust!',
    'Greetings from Mars! The rovers are doing a happy little spin!',
    'Message received! Thanks for checking in on our cozy base!',
  ],
  Venus: [
    'Hello from high above the clouds! Everything looks so bright today!',
    'Yay, your note made it through the breeze! Sending warm sunny vibes back!',
    'Got it! Our float station is smiling and super glad you said hi!',
  ],
  Jupiter: [
    'Big greetings from the giant planet! That came through nice and crisp!',
    'Whoa, awesome! The Great Red Spot is swirling a big wave at you!',
    'Loud and clear! It is always super exciting to hear from you!',
  ],
  Saturn: [
    'Ring-a-ding! Your lovely note is surfing our shiny ice rings!',
    'Hello hello! The view from Titan is pretty, thanks for reaching out!',
    'Message caught right in our rings! Sending sparkly cosmic cheers back!',
  ],
  Earth: [
    'Mission Control here! Hooray, the whole team is cheering for you!',
    'Welcome home! That message looks bright, beautiful, and crystal clear!',
    'We read you! High fives all around from everyone back on Earth!',
  ],
};

export default function MercuryLevel3Simulation({
  htmlCode,
  cssCode,
  jsCode,
  audit,
  isRunning,
  onSimulationComplete,
  onPlanetConnected,
  onToastMessage,
}: MercuryLevel3SimulationProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [connectedPlanets, setConnectedPlanets] = useState<Record<PlanetTarget, boolean>>({
    Mars: false,
    Venus: false,
    Jupiter: false,
    Saturn: false,
    Earth: false,
  });

  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [isFeedExpanded, setIsFeedExpanded] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isLevelFinished, setIsLevelFinished] = useState(false);

  // Web Audio Synthesizer for Sonar Ping & Reply Chime
  const getAudioContext = useCallback(() => {
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
  }, []);

  const playSonarPing = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.35);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }, [getAudioContext]);

  const playReplyChime = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {}
  }, [getAudioContext]);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Assemble the compiled sandbox source code
  const iframeSrcDoc = useMemo(() => {
    const rawHtml = (htmlCode || '').trim();
    const rawCss = (cssCode || '').trim();
    const rawJs = (jsCode || '').trim();

    // Check if stylesheet is attached via <link rel="stylesheet" href="style.css">
    const isCssLinked = rawHtml.includes('rel="stylesheet"') || rawHtml.includes("rel='stylesheet'") || rawHtml.includes('style.css');
    // Check if script is attached via <script src="logic.js"></script>
    const isJsLinked = rawHtml.includes('<script') || rawHtml.includes('logic.js');

    // If completely blank, return empty document
    if (!rawHtml && !rawCss && !rawJs) {
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;background:transparent;}</style></head><body></body></html>`;
    }

    // When CSS is linked: full terminal theme + student CSS overrides.
    // When CSS is NOT linked: raw browser view without styling.
    const activeStyles = isCssLinked
      ? `
    * { box-sizing: border-box; }
    html, body {
      min-height: 100%;
      height: auto;
    }
    body {
      margin: 0;
      padding: 20px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      color: #F8FAFC;
      background: radial-gradient(circle at 50% 25%, #241144 0%, #130726 60%, #090314 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      overflow-y: auto;
    }
    #mainForm {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 320px;
      gap: 6px;
      background: rgba(30, 14, 58, 0.5);
      border: 1px solid rgba(168, 85, 247, 0.25);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(147, 51, 234, 0.1);
    }
    #mainForm:empty {
      min-height: 48px;
      border: 1px dashed rgba(168, 85, 247, 0.4);
      background: rgba(30, 14, 58, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #mainForm:empty::after {
      content: "Empty Screen Box (Snap elements inside)";
      color: rgba(216, 180, 254, 0.5);
      font-size: 11px;
      font-family: monospace;
    }
    #buttonGroup, #cardSection, .row-group {
      display: flex;
      flex-direction: row;
      gap: 8px;
      width: 100%;
      max-width: 320px;
      justify-content: center;
      align-items: center;
    }
    #buttonGroup button, #cardSection button, .row-group button {
      flex: 1;
      width: auto;
      margin: 0;
    }
    select, textarea, button {
      width: 100%;
      max-width: 320px;
      margin: 6px 0;
      font-family: inherit;
      border-radius: 8px;
      box-sizing: border-box;
    }
    textarea {
      min-height: 60px;
      background: #150E2D;
      color: #F8FAFC;
      border: 1px solid #3B2164;
      padding: 8px 10px;
      resize: vertical;
    }
    select {
      background: #150E2D;
      color: #F8FAFC;
      border: 1px solid #3B2164;
      padding: 8px 10px;
    }
    button {
      padding: 10px 16px;
      border: none;
      font-weight: 700;
      background: #4C1D95;
      color: #F8FAFC;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    #clearBtn {
      padding: 8px 16px;
      border: 1px solid #4C1D95;
      font-weight: 600;
      background: rgba(30, 16, 60, 0.7);
      color: #C4B5FD;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    #clearBtn:hover {
      background: rgba(76, 29, 149, 0.9);
      color: #FFFFFF;
      border-color: #7C3AED;
    }
    h1, h3, p {
      margin: 4px 0 8px 0;
      text-align: center;
    }
    /* Student CSS Overrides */
    ${rawCss}
`
      : `
    /* Unstyled Browser View (style.css is NOT linked) */
    body {
      margin: 16px;
      background: #0B0814;
      color: #CBD5E1;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .unlinked-alert {
      padding: 8px 12px;
      margin-bottom: 14px;
      border: 1px dashed #EF4444;
      border-radius: 6px;
      background: rgba(239, 68, 68, 0.12);
      color: #FCA5A5;
      font-size: 11px;
      font-family: monospace;
      text-align: center;
    }
    select, textarea, button {
      display: block;
      margin: 8px 0;
    }
`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${activeStyles}
  </style>
</head>
<body>
  ${!isCssLinked ? `<div class="unlinked-alert">&#9888; Stylesheet not linked: snap "Attach Stylesheet" in HTML to apply CSS</div>` : ''}
  ${!isJsLinked ? `<div class="unlinked-alert" style="border-color: #F59E0B; background: rgba(245, 158, 11, 0.12); color: #FCD34D;">&#9888; Script not linked: snap "Attach Logic Script" in HTML to enable events</div>` : ''}
  ${rawHtml}

  <script>
    // AstroLink Transmission Bridge Function
    window.__transmitCalled = false;
    window.transmitAstroLink = function(destination, payload) {
      window.__transmitCalled = true;
      var dropdown = document.getElementById('planetDropdown');
      var input = document.getElementById('messageInput');
      var btn = document.getElementById('submitBtn');

      window.parent.postMessage({
        type: 'ASTROLINK_TRANSMIT',
        destination: destination,
        payload: payload,
        domDest: dropdown ? dropdown.value : null,
        domMsg: input ? input.value : null
      }, '*');
    };

    // Cooldown feedback receiver from parent
    window.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'SET_COOLDOWN') {
        var btn = document.getElementById('submitBtn');
        if (btn) {
          if (event.data.cooldown) {
            btn.dataset.origText = btn.innerText;
            btn.innerText = 'Transmitting...';
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.65';
          } else {
            btn.innerText = btn.dataset.origText || 'Transmit';
            btn.style.pointerEvents = 'auto';
            btn.style.opacity = '1';
          }
        }
      }
    });

    ${(rawHtml.includes('<script') || rawHtml.includes('logic.js')) ? `
    // Execute Student JS Payload safely
    try {
      ${rawJs}
    } catch (err) {
      window.parent.postMessage({
        type: 'ASTROLINK_SCRIPT_ERROR',
        error: err && err.message ? err.message : String(err)
      }, '*');
    }

    // Unwired button detector (Capture phase resets flag, timeout checks if transmit was called)
    setTimeout(function() {
      var submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.addEventListener('click', function() {
          window.__transmitCalled = false;
        }, true);

        submitBtn.addEventListener('click', function() {
          setTimeout(function() {
            if (!window.__transmitCalled) {
              window.parent.postMessage({ type: 'ASTROLINK_UNWIRED_CLICK' }, '*');
            }
          }, 80);
        }, false);
      }
    }, 100);
    ` : `
    // Logic Script is NOT attached in HTML: buttons cannot execute student code
    document.addEventListener('DOMContentLoaded', function() {
      var submitBtn = document.getElementById('submitBtn');
      if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
          e.preventDefault();
          window.parent.postMessage({ type: 'ASTROLINK_UNLINKED_CLICK', button: 'submitBtn' }, '*');
        });
      }
      var clearBtn = document.getElementById('clearBtn');
      if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
          e.preventDefault();
          window.parent.postMessage({ type: 'ASTROLINK_UNLINKED_CLICK', button: 'clearBtn' }, '*');
        });
      }
    });
    // Also catch immediate clicks if already ready
    var sBtn = document.getElementById('submitBtn');
    if (sBtn) {
      sBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.parent.postMessage({ type: 'ASTROLINK_UNLINKED_CLICK', button: 'submitBtn' }, '*');
      });
    }
    var cBtn = document.getElementById('clearBtn');
    if (cBtn) {
      cBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.parent.postMessage({ type: 'ASTROLINK_UNLINKED_CLICK', button: 'clearBtn' }, '*');
      });
    }
    `}
  </script>
</body>
</html>`;
  }, [htmlCode, cssCode, jsCode]);

  // Listen to messages emitted from the sandboxed iframe
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      if (!event.data) return;

      // Handle unattached script attempt
      if (event.data.type === 'ASTROLINK_UNLINKED_CLICK') {
        onToastMessage?.('SCRIPT UNATTACHED: Buttons cannot respond because "Attach Logic Script" is missing from your HTML structure.', 'warning');
        return;
      }

      // Handle unwired button attempt
      if (event.data.type === 'ASTROLINK_UNWIRED_CLICK') {
        onToastMessage?.('BUTTON NOT WIRED: The Send button was clicked, but no action was triggered. Make sure you snap "Beam Signal to Planet:" inside "When Send Button is Clicked do:".', 'warning');
        return;
      }

      // Handle runtime script error
      if (event.data.type === 'ASTROLINK_SCRIPT_ERROR') {
        onToastMessage?.(`JAVASCRIPT ERROR: ${event.data.error || 'Execution failed'}. Check your blocks in the JS tab.`, 'error');
        return;
      }

      if (event.data.type !== 'ASTROLINK_TRANSMIT') return;

      const { destination, payload, domDest, domMsg } = event.data;

      // Situation A: Empty Payload
      if (!payload || typeof payload !== 'string' || !payload.trim()) {
        onToastMessage?.('TRANSMISSION HALTED: Message cannot be empty. Type a transmission message into the Text Input Area.', 'warning');
        return;
      }

      // Missing Destination
      if (!destination || typeof destination !== 'string') {
        onToastMessage?.('ERROR: Destination unknown. Select a planet choice from the dropdown menu.', 'error');
        return;
      }

      // Anti-Hardcoding Validation Check
      if (destination !== domDest || payload !== domMsg) {
        onToastMessage?.(
          'AUDIT FAILED: Hardcoded values detected. You must extract live data using "Get Selected Planet from: Choice Menu" and "Get Typed Text from: Text Input Area".',
          'error'
        );
        return;
      }

      // Situation B: Button Spamming Cooldown (1.5s)
      if (isTransmitting) return;
      setIsTransmitting(true);

      // Tell iframe to put button in "Transmitting..." state
      iframeRef.current?.contentWindow?.postMessage({ type: 'SET_COOLDOWN', cooldown: true }, '*');

      playSonarPing();

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const targetPlanet = destination as PlanetTarget;

      // Add Outgoing Transmission Log
      setMessageLogs(prev => [
        ...prev,
        {
          id: `out-${Date.now()}`,
          sender: 'outgoing',
          planet: targetPlanet,
          text: payload,
          timestamp: timeStr,
        },
      ]);

      // 1.5s Artificial Relay Propagation Delay
      setTimeout(() => {
        playReplyChime();

        // Release button cooldown in iframe
        iframeRef.current?.contentWindow?.postMessage({ type: 'SET_COOLDOWN', cooldown: false }, '*');
        setIsTransmitting(false);

        const replies = PLANET_REPLIES[targetPlanet] || ['Handshake confirmed. Comms online.'];
        const replyText = replies[Math.floor(Math.random() * replies.length)];

        // Add Incoming Transmission Log
        setMessageLogs(prev => [
          ...prev,
          {
            id: `in-${Date.now()}`,
            sender: 'incoming',
            planet: targetPlanet,
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
        ]);

        // Update Connected Planet HUD state
        setConnectedPlanets(prev => {
          const next = { ...prev, [targetPlanet]: true };
          const allDone = MERCURY_3_TARGET_PLANETS.every(p => next[p]);

          onPlanetConnected?.(targetPlanet, allDone);

          if (allDone && !isLevelFinished) {
            setIsLevelFinished(true);
            setTimeout(() => {
              onSimulationComplete();
            }, 1200);
          }
          return next;
        });
      }, 1500);
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [isTransmitting, isLevelFinished, playSonarPing, playReplyChime, onToastMessage, onPlanetConnected, onSimulationComplete]);

  const connectedCount = useMemo(() => {
    return MERCURY_3_TARGET_PLANETS.filter(p => connectedPlanets[p]).length;
  }, [connectedPlanets]);

  // Extract destination planets explicitly declared by the student inside their dropdown menu
  const declaredPlanets = useMemo(() => {
    const found: PlanetTarget[] = [];
    const selectMatch = (htmlCode || '').match(/<select[^>]*id="planetDropdown"[^>]*>([\s\S]*?)<\/select>/i);
    if (!selectMatch) return found;
    const selectContent = selectMatch[1];
    const regex = /<option\s+value="([^"]+)"/gi;
    let match;
    while ((match = regex.exec(selectContent)) !== null) {
      const planet = match[1] as PlanetTarget;
      if (MERCURY_3_TARGET_PLANETS.includes(planet) && !found.includes(planet)) {
        found.push(planet);
      }
    }
    return found;
  }, [htmlCode]);

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-gradient-to-b from-[#130826] via-[#0C041A] to-[#070210] border-l border-purple-800/40 overflow-hidden select-none">
      {/* Top Header & HUD Status Checklist */}
      <div className="shrink-0 bg-gradient-to-r from-[#1E0C38] via-[#2A104E] to-[#1E0C38] border-b border-purple-500/40 px-4 py-2.5 flex flex-col gap-2 shadow-[0_4px_25px_rgba(147,51,234,0.2)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={16} className={isRunning ? 'text-purple-300 animate-pulse drop-shadow-[0_0_8px_rgba(216,180,254,0.8)]' : 'text-purple-400'} />
            <span className="text-xs font-mono font-bold tracking-wider text-purple-100">
              ASTROLINK RELAY TERMINAL
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-purple-300/80">NODES:</span>
            <span className={`font-bold px-2 py-0.5 rounded border ${connectedCount === declaredPlanets.length && declaredPlanets.length > 0 ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-[#1F0E3D] border-purple-600/50 text-purple-200 shadow-[0_0_10px_rgba(147,51,234,0.2)]'}`}>
              {connectedCount} / {declaredPlanets.length || 5} ONLINE
            </span>
          </div>
        </div>

        {/* Dynamic Planetary Destination Status Indicators (Only shows choices currently placed in workspace) */}
        {declaredPlanets.length === 0 ? (
          <div className="py-1.5 px-3 rounded-md border border-dashed border-purple-800/70 bg-[#160a2c]/80 text-purple-300 text-[11px] font-mono flex items-center justify-between">
            <span className="text-purple-400/90 font-medium">Awaiting destination nodes</span>
            <span className="text-purple-300 text-[10px] bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">Drag planet choices into Choice Menu</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {declaredPlanets.map(planet => {
              const isOnline = connectedPlanets[planet];
              return (
                <div
                  key={planet}
                  className={`flex-1 min-w-[65px] flex items-center justify-center gap-1.5 py-1 px-2 rounded-sm border text-[11px] font-mono font-bold transition-all duration-300 ${
                    isOnline
                      ? 'bg-emerald-950/70 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                      : 'bg-[#1A0B33]/80 border-purple-700/50 text-purple-300/80'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]' : 'bg-purple-600'
                    }`}
                  />
                  <span className="truncate">{planet.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Simulation Viewport (Full Width Terminal Canvas + Collapsible Bottom Comms Console) */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative bg-[#0D051C]">
        {/* Full-Width Terminal Output / Sandboxed Iframe */}
        <div className="flex-1 w-full min-h-0 relative flex items-center justify-center overflow-hidden">
          <iframe
            ref={iframeRef}
            srcDoc={iframeSrcDoc}
            title="AstroLink Preview"
            sandbox="allow-scripts"
            className="w-full h-full border-none bg-transparent"
          />

          {/* Build Phase Shield: pointer-events-none so scrolling and scrollbar are completely unobstructed */}
          {!isRunning && (
            <div
              className="absolute inset-0 z-10 pointer-events-none"
            />
          )}
        </div>

        {/* Collapsible Bottom Transmission Comms Console */}
        <div className="shrink-0 w-full border-t border-purple-800/50 bg-[#16092E]/95 backdrop-blur-md shadow-2xl flex flex-col transition-all duration-200 ease-out z-20">
          {/* Console Header Bar (Clickable Toggle) */}
          <button
            type="button"
            onClick={() => setIsFeedExpanded(prev => !prev)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-purple-900/30 transition-colors cursor-pointer text-left select-none gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className={`p-1 rounded-sm border shrink-0 ${messageLogs.length > 0 ? 'bg-purple-950 border-purple-500/60 text-purple-300' : 'bg-purple-950/40 border-purple-800/40 text-purple-400/60'}`}>
                <MessageSquare size={13} />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-200 whitespace-nowrap">
                COMMS RELAY FEED
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-purple-950 border border-purple-700/50 text-purple-300 whitespace-nowrap shrink-0">
                {messageLogs.length} {messageLogs.length === 1 ? 'PACKET' : 'PACKETS'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-purple-300/90 hover:text-purple-100 whitespace-nowrap shrink-0">
              <span>{isFeedExpanded ? 'COLLAPSE' : 'EXPAND'}</span>
              {isFeedExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </div>
          </button>

          {/* Dedicated Clean Sub-bar for Latest Packet Ticker when Collapsed */}
          {!isFeedExpanded && messageLogs.length > 0 && (
            <div
              onClick={() => setIsFeedExpanded(true)}
              className="w-full px-3.5 py-2 bg-[#0e041e]/90 border-t border-purple-900/40 flex items-center gap-2 cursor-pointer hover:bg-purple-950/40 transition-colors text-[11px] font-mono select-none"
            >
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                LATEST
              </span>
              <span className="text-purple-300/90 truncate flex-1 min-w-0">
                {messageLogs[messageLogs.length - 1].sender === 'outgoing'
                  ? `TO ${messageLogs[messageLogs.length - 1].planet}: "${messageLogs[messageLogs.length - 1].text}"`
                  : `FROM ${messageLogs[messageLogs.length - 1].planet}: "${messageLogs[messageLogs.length - 1].text}"`}
              </span>
              <span className="text-[10px] text-purple-400/60 shrink-0 font-medium whitespace-nowrap">
                View All
              </span>
            </div>
          )}

          {/* Slide-Up Expandable Logs Container */}
          {isFeedExpanded && (
            <div className="h-44 sm:h-48 border-t border-purple-800/40 p-3 overflow-y-auto space-y-2 font-mono text-xs bg-[#0E041E]/95">
              {messageLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-3 text-purple-400/50 space-y-1">
                  <Globe size={22} className="opacity-40 mb-1 text-purple-400" />
                  <p className="text-[11px] text-purple-300/80">No transmissions recorded yet.</p>
                  <p className="text-[10px] text-purple-400/60">Select a planet, enter a message, and click Transmit.</p>
                </div>
              ) : (
                messageLogs.map(log => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-md border leading-relaxed text-[11px] animate-in fade-in duration-200 ${
                      log.sender === 'outgoing'
                        ? 'bg-gradient-to-r from-[#2A0E52] to-[#341164] border-purple-500/70 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                        : 'bg-gradient-to-r from-emerald-950/70 to-emerald-900/60 border-emerald-500/70 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${log.sender === 'outgoing' ? 'bg-purple-400' : 'bg-emerald-400 animate-pulse'}`} />
                        <span>{log.sender === 'outgoing' ? `OUTGOING • TO: ${log.planet}` : `INCOMING • FROM: ${log.planet}`}</span>
                      </span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="break-words pl-3">{log.text}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
