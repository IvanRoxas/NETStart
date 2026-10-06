"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Radio } from 'lucide-react';
import type { MarsLevel3Validation } from '@/lib/mars/marsLevel3Definitions';

interface SimulationConsoleProps {
  validation: MarsLevel3Validation;
  isRunning: boolean;
  phase: 'assembly' | 'sandbox';
  setPhase: (p: 'assembly' | 'sandbox') => void;
  isMercuryPinged: boolean;
  isVenusPinged: boolean;
  isStatusOpened?: boolean;
  onPlanetPinged: (planet: 'mercury' | 'venus') => void;
  onPlanetStatusOpened?: (planet: 'mercury' | 'venus') => void;
  onSimulationComplete?: (success: boolean, failureReason?: string) => void;
}

interface FloatingPacket {
  id: string;
  direction?: 'forward' | 'return';
  target: 'mercury' | 'venus';
  text: string;
  isPizza: boolean;
  progress: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface SparkParticle {
  id: string;
  x: number;
  y: number;
  color: string;
}

interface PendingReply {
  planet: 'mercury' | 'venus';
  text: string;
  isStatusQuery: boolean;
}

// 10 kid-friendly, playful replies for Mercury
const MERCURY_RANDOM_REPLIES = [
  "Beep boop! Message received! It is super sunny and warm over here on Mercury!",
  "Hi from Mercury! Your message zoomed across space so fast!",
  "Hello Mars! We heard you loud and clear over the solar wind!",
  "Signal received! Our space antennas are spinning with joy!",
  "Whoosh! Your message just landed on our sunny space base!",
  "Greetings from Mercury! We are baking space cookies in the sunshine!",
  "Loud and clear! Thanks for saying hi to the fastest little planet!",
  "Ding! New message in our inbox! Everything is running great here!",
  "High five across space! Your message reached our radio dish!",
  "Hello down there! Thanks for sending a message to Mercury!",
];

// 10 kid-friendly, playful replies for Venus
const VENUS_RANDOM_REPLIES = [
  "Hello from Venus! The golden clouds are glowing brightly today!",
  "Yay, a message from Mars! It popped right through our yellow clouds!",
  "Hi there! Our radios caught your friendly signal in the sky!",
  "Beep beep! Message received! It is nice and cozy under our cloud blanket!",
  "Hello friend! Your message flew through space like a shooting star!",
  "We hear you loud and clear! Thanks for checking in on Venus!",
  "Greetings from the brightest planet in the night sky! Message received!",
  "Whoopee! Our antennas danced when your space ping arrived!",
  "Signal received! The winds are whistling a happy tune today!",
  "Hi from Venus! We are waving at you from high up in the clouds!",
];

// Lenient check for "How are you guys?" (ignoring case, punctuation, whitespace, and common abbreviations)
const isStatusQueryMessage = (msg: string): boolean => {
  const clean = msg
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    clean === 'how are you guys' ||
    clean === 'how are you' ||
    clean === 'how are u' ||
    clean === 'how r u' ||
    clean === 'how are you doing' ||
    clean === 'how are u guys' ||
    clean === 'how r u guys' ||
    clean === 'how r you guys' ||
    clean === 'how you guys' ||
    clean === 'how are you all' ||
    clean === 'how are guys' ||
    clean === 'status'
  ) {
    return true;
  }

  const statusRegex = /^how\s+(are|r|is)?\s*(you|u|ya|guys|all)?(\s*(guys|doing|all|there))?$/i;
  if (statusRegex.test(clean)) {
    return true;
  }

  return (
    clean.includes('how are you') ||
    clean.includes('how are u') ||
    clean.includes('how r u') ||
    clean.includes('how are guys') ||
    clean.includes('how you doing')
  );
};

export default function SimulationConsole({
  validation,
  isRunning,
  phase,
  setPhase,
  isMercuryPinged,
  isVenusPinged,
  isStatusOpened = false,
  onPlanetPinged,
  onPlanetStatusOpened,
  onSimulationComplete,
}: SimulationConsoleProps) {
  // Controlled Single Dashboard State
  const [targetPlanet, setTargetPlanet] = useState<'mercury' | 'venus'>('mercury');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localStatusOpened, setLocalStatusOpened] = useState(false);
  const [secondPlanet, setSecondPlanet] = useState<'mercury' | 'venus' | null>(null);
  const [secondPlanetMessageRead, setSecondPlanetMessageRead] = useState(false);
  const [openedPlanets, setOpenedPlanets] = useState<{ mercury: boolean; venus: boolean }>({
    mercury: false,
    venus: false,
  });

  // Sync selected target if only one planet option was assembled
  useEffect(() => {
    if (validation.hasMercuryOption && !validation.hasVenusOption) {
      setTargetPlanet('mercury');
    } else if (!validation.hasMercuryOption && validation.hasVenusOption) {
      setTargetPlanet('venus');
    }
  }, [validation.hasMercuryOption, validation.hasVenusOption]);

  // Tower & Visual State
  const [orbPulsing, setOrbPulsing] = useState(false);
  const [towerOverloaded, setTowerOverloaded] = useState(false);

  // Return message and modal state
  const [pendingReply, setPendingReply] = useState<PendingReply | null>(null);
  const [activeModalReply, setActiveModalReply] = useState<PendingReply | null>(null);

  const showAllSystemsOnline = isMercuryPinged && isVenusPinged && secondPlanetMessageRead && !activeModalReply;

  // Reset tracking on simulation stop or ping reset
  useEffect(() => {
    if (!isRunning || phase === 'assembly') {
      setSecondPlanet(null);
      setSecondPlanetMessageRead(false);
      setOpenedPlanets({ mercury: false, venus: false });
    }
  }, [isRunning, phase]);

  useEffect(() => {
    if (!isMercuryPinged && !isVenusPinged) {
      setSecondPlanet(null);
      setSecondPlanetMessageRead(false);
      setOpenedPlanets({ mercury: false, venus: false });
    }
  }, [isMercuryPinged, isVenusPinged]);

  // Floating packets & sparks
  const [packets, setPackets] = useState<FloatingPacket[]>([]);
  const [sparks, setSparks] = useState<SparkParticle[]>([]);

  // DOM Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Sound Synthesizer
  const getAudioContext = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
      return audioContextRef.current;
    } catch {
      return null;
    }
  };

  const playPingSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.52);
    } catch {}
  };

  const playLaunchSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } catch {}
  };

  const playOverloadSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.setValueAtTime(80, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.48);
    } catch {}
  };

  // Phase 1 -> Phase 2 Transition Handler
  useEffect(() => {
    if (isRunning) {
      if (validation.canDeploy) {
        setOrbPulsing(true);
        const t1 = setTimeout(() => {
          setPhase('sandbox');
          setOrbPulsing(false);
          setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
          }, 300);
        }, 1200);
        animTimeouts.current.push(t1);
      } else {
        if (onSimulationComplete) {
          onSimulationComplete(false, validation.deployErrorMessage || validation.failErrorMessage || 'Your form is incomplete!');
        }
      }
    } else {
      setPhase('assembly');
      setOrbPulsing(false);
    }
  }, [isRunning, validation, setPhase, onSimulationComplete]);

  // Clean timeouts on unmount
  useEffect(() => {
    return () => {
      animTimeouts.current.forEach((t) => clearTimeout(t));
      animTimeouts.current = [];
    };
  }, []);

  // Handle Form Submission in Single Dashboard
  const handleTransmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = message.trim();
    if (!trimmed) return;

    // 1.5s Spam Prevention
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1500);

    const lower = trimmed.toLowerCase();
    // Easter Egg: System Overload
    if (lower.includes('boom') || lower.includes('overload')) {
      playOverloadSound();
      setTowerOverloaded(true);

      const sparkList: SparkParticle[] = Array.from({ length: 12 }).map((_, i) => ({
        id: `spark-${Date.now()}-${i}`,
        x: 50 + (Math.random() - 0.5) * 8,
        y: 62 + (Math.random() - 0.5) * 12,
        color: ['#facc15', '#f97316', '#ef4444', '#38bdf8'][i % 4],
      }));
      setSparks(sparkList);

      setTimeout(() => {
        setTowerOverloaded(false);
        setSparks([]);
      }, 1000);
      return;
    }

    // Normal or Pizza Transmission
    playLaunchSound();
    const isPizza = lower.includes('pizza');
    const isStatusQuery = isStatusQueryMessage(trimmed);

    let replyText = '';
    if (isStatusQuery) {
      replyText =
        targetPlanet === 'venus'
          ? 'Hello there! We desperately need your help!'
          : 'Please come as soon as possible, we are in trouble!';
    } else {
      const pool = targetPlanet === 'venus' ? VENUS_RANDOM_REPLIES : MERCURY_RANDOM_REPLIES;
      replyText = pool[Math.floor(Math.random() * pool.length)];
    }

    const packetId = `pkt-${Date.now()}`;

    // Tower orb: (50%, 62%)
    // Destinations: Venus (12%, 16%), Mercury (88%, 16%)
    const startX = 50;
    const startY = 62;
    const endX = targetPlanet === 'venus' ? 12 : 88;
    const endY = 16;

    const newPacket: FloatingPacket = {
      id: packetId,
      direction: 'forward',
      target: targetPlanet,
      text: trimmed,
      isPizza,
      progress: 0,
      startX,
      startY,
      endX,
      endY,
    };

    setPackets((prev) => [...prev, newPacket]);

    const duration = 1200;
    const startTime = performance.now();

    const animatePacket = (now: number) => {
      const elapsed = now - startTime;
      const prog = Math.min(1, elapsed / duration);
      setPackets((curr) =>
        curr.map((p) => (p.id === packetId ? { ...p, progress: prog } : p))
      );

      if (prog < 1) {
        requestAnimationFrame(animatePacket);
      } else {
        // Forward impact at planet
        setPackets((curr) => curr.filter((p) => p.id !== packetId));
        playPingSound();

        // Target planet & tower lights up green
        onPlanetPinged(targetPlanet);

        // Record second planet if the other planet was already pinged
        if ((isMercuryPinged && targetPlanet === 'venus') || (isVenusPinged && targetPlanet === 'mercury')) {
          setSecondPlanet(targetPlanet);
        }

        // 2-second delay before planet sends response packet back to tower
        const tReturnDelay = setTimeout(() => {
          const retPacketId = `ret-${Date.now()}`;
          playLaunchSound();
          const retPacket: FloatingPacket = {
            id: retPacketId,
            direction: 'return',
            target: targetPlanet,
            text: isStatusQuery ? 'Distress Signal' : 'Incoming Signal',
            isPizza: false,
            progress: 0,
            startX: endX,
            startY: endY,
            endX: startX,
            endY: startY,
          };
          setPackets((curr) => [...curr, retPacket]);

          const retDuration = 1200;
          const retStartTime = performance.now();
          const animateReturn = (retNow: number) => {
            const retElapsed = retNow - retStartTime;
            const retProg = Math.min(1, retElapsed / retDuration);
            setPackets((curr) =>
              curr.map((p) => (p.id === retPacketId ? { ...p, progress: retProg } : p))
            );

            if (retProg < 1) {
              requestAnimationFrame(animateReturn);
            } else {
              // Return packet arrived back at tower!
              setPackets((curr) => curr.filter((p) => p.id !== retPacketId));
              playPingSound();
              setOrbPulsing(true);
              setTimeout(() => setOrbPulsing(false), 800);
              setPendingReply({
                planet: targetPlanet,
                text: replyText,
                isStatusQuery,
              });
            }
          };
          requestAnimationFrame(animateReturn);
        }, 2000);
        animTimeouts.current.push(tReturnDelay);
      }
    };
    requestAnimationFrame(animatePacket);
  };

  const handleOpenPlanetMessage = (reply: PendingReply) => {
    setActiveModalReply(reply);
    setPendingReply(null);
    setLocalStatusOpened(true);

    setOpenedPlanets((prev) => {
      const next = { ...prev, [reply.planet]: true };
      if (next.mercury && next.venus) {
        setSecondPlanetMessageRead(true);
      }
      return next;
    });

    if (isMercuryPinged && isVenusPinged) {
      if (!secondPlanet || reply.planet === secondPlanet) {
        setSecondPlanetMessageRead(true);
      }
    }

    if (onPlanetStatusOpened) {
      onPlanetStatusOpened(reply.planet);
    }
  };

  const hasOpenedStatus = isStatusOpened || localStatusOpened;

  const handleProceedClick = () => {
    if (!validation.hasTitle) {
      onSimulationComplete?.(false, "Give your form design a title first!");
      return;
    }
    if (!hasOpenedStatus) {
      onSimulationComplete?.(false, "Open and read an incoming transmission from space before proceeding!");
      return;
    }
    if (!isMercuryPinged || !isVenusPinged) {
      if (!validation.hasMercuryOption) {
        onSimulationComplete?.(false, "Option: Mercury was not included in your Dropdown Menu! Return to your workspace and add Option: Mercury to reach Mercury.");
        return;
      }
      if (!validation.hasVenusOption) {
        onSimulationComplete?.(false, "Option: Venus was not included in your Dropdown Menu! Return to your workspace and add Option: Venus to reach Venus.");
        return;
      }
      onSimulationComplete?.(false, "Send a message to both Mercury and Venus before proceeding!");
      return;
    }
    onSimulationComplete?.(true);
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col select-none cursor-default font-sans">
      <style>{`
        @keyframes towerShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px) rotate(-1deg); }
          40% { transform: translateX(4px) rotate(1deg); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
        .animate-tower-shake {
          animation: towerShake 0.4s ease-in-out infinite;
        }
        @keyframes floatSpin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>

      {/* SKY: Pastel Cosmic Twilight */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#141233] via-[#221845] via-55%-[#341d47] to-[#4d1f2b]" />

      {/* Soft Nebula Cloud Accents */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: `
            radial-gradient(circle at 20% 25%, rgba(186, 230, 253, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 80% 20%, rgba(244, 114, 182, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 50% 12%, rgba(216, 180, 254, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 65%, rgba(251, 146, 60, 0.08) 0%, transparent 60%)
          `,
        }}
      />

      {/* PASTEL STARS */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 8% 12%, #bae6fd, transparent),
            radial-gradient(1px 1px at 18% 22%, #fef08a, transparent),
            radial-gradient(2px 2px at 28% 8%, #ffffff, transparent),
            radial-gradient(1.5px 1.5px at 36% 16%, #e9d5ff, transparent),
            radial-gradient(1px 1px at 45% 28%, #fbcfe8, transparent),
            radial-gradient(2px 2px at 52% 10%, #bae6fd, transparent),
            radial-gradient(1.5px 1.5px at 64% 18%, #fef08a, transparent),
            radial-gradient(1px 1px at 72% 8%, #ffffff, transparent),
            radial-gradient(2px 2px at 84% 22%, #e9d5ff, transparent),
            radial-gradient(1.5px 1.5px at 92% 14%, #bae6fd, transparent)
          `,
        }}
      />

      {/* ========================================================================= */}
      {/* VENUS (Top Left Hovering Target)                                          */}
      {/* ========================================================================= */}
      <div className="absolute z-20" style={{ left: '6%', top: '8%' }}>
        <div className="relative flex flex-col items-center">
          <div
            className={`relative transition-all duration-700 ${
              isVenusPinged
                ? 'drop-shadow-[0_0_35px_rgba(52,211,153,0.95)]'
                : 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
            }`}
          >
            <img src="/assets/planets/celestial/Venus.svg" alt="Venus" className="w-20 h-20 sm:w-26 sm:h-26 object-contain" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center">
              <div
                className={`w-[1.5px] h-3.5 transition-all duration-500 ${
                  isVenusPinged
                    ? 'bg-emerald-300 shadow-[0_0_12px_#34d399] animate-pulse'
                    : 'bg-amber-200'
                }`}
              />
              <div
                className={`w-3 h-1 rounded-t-full border -mt-px transition-all duration-500 ${
                  isVenusPinged
                    ? 'border-emerald-300 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse'
                    : 'border-slate-400 bg-slate-500'
                }`}
              />
            </div>
          </div>

          {isVenusPinged && (
            <div className="mt-1 font-mono text-[10px] font-bold text-emerald-400 tracking-tight animate-in fade-in duration-300">
              ONLINE
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MERCURY (Top Right Hovering Target)                                       */}
      {/* ========================================================================= */}
      <div className="absolute z-20" style={{ right: '6%', top: '9%' }}>
        <div className="relative flex flex-col items-center">
          <div
            className={`relative transition-all duration-700 ${
              isMercuryPinged
                ? 'drop-shadow-[0_0_35px_rgba(52,211,153,0.95)]'
                : 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]'
            }`}
          >
            <img src="/assets/planets/celestial/Mercury.svg" alt="Mercury" className="w-18 h-18 sm:w-22 sm:h-22 object-contain" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center">
              <div
                className={`w-[1.5px] h-3 transition-all duration-500 ${
                  isMercuryPinged
                    ? 'bg-emerald-300 shadow-[0_0_12px_#34d399] animate-pulse'
                    : 'bg-sky-200'
                }`}
              />
              <div
                className={`w-2.5 h-1 rounded-t-full border -mt-px transition-all duration-500 ${
                  isMercuryPinged
                    ? 'border-emerald-300 bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse'
                    : 'border-slate-400 bg-slate-500'
                }`}
              />
            </div>
          </div>

          {isMercuryPinged && (
            <div className="mt-1 font-mono text-[10px] font-bold text-emerald-400 tracking-tight animate-in fade-in duration-300">
              ONLINE
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MARS TERRAIN & THE 3 GLASS BIODOMES                                       */}
      {/* ========================================================================= */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{ height: '33%' }}>
        <svg className="absolute w-0 h-0 pointer-events-none">
          <defs>
            <linearGradient id="marsBackHills" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7a271a" />
              <stop offset="70%" stopColor="#45140e" />
              <stop offset="100%" stopColor="#220704" />
            </linearGradient>
            <linearGradient id="marsMidDunes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#99351d" />
              <stop offset="60%" stopColor="#5c1c11" />
              <stop offset="100%" stopColor="#2c0b07" />
            </linearGradient>
            <linearGradient id="marsForegroundPlain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bd4826" />
              <stop offset="45%" stopColor="#7a2816" />
              <stop offset="100%" stopColor="#260905" />
            </linearGradient>

            <linearGradient id="domeGlassCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.48" />
              <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.22" />
              <stop offset="85%" stopColor="#0284c7" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="domeGlassEmerald" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.48" />
              <stop offset="35%" stopColor="#34d399" stopOpacity="0.22" />
              <stop offset="85%" stopColor="#059669" stopOpacity="0.08" />
            </linearGradient>

            <radialGradient id="interiorBioGlow" cx="50%" cy="80%" r="65%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#10b981" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="interiorHabGlow" cx="50%" cy="80%" r="65%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.7" />
              <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="domeBaseCollar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b1706" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#3b1706" />
            </linearGradient>
          </defs>
        </svg>

        {/* DEPTH LAYER 1: Distant Crater Plateau Rim */}
        <div className="absolute inset-0 z-0">
          <svg viewBox="0 0 1000 160" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path
              d="M0,62 C200,52 350,68 550,56 C750,44 880,58 1000,52 L1000,160 L0,160 Z"
              fill="url(#marsBackHills)"
              opacity="0.65"
            />
          </svg>
        </div>

        {/* DEPTH LAYER 2: Mid-Ground Red Dunes & Emerald Hydroponics Dome */}
        <div className="absolute inset-0 z-10">
          <svg viewBox="0 0 1000 160" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path
              d="M0,84 C250,74 420,96 680,82 C820,74 920,88 1000,84 L1000,160 L0,160 Z"
              fill="url(#marsMidDunes)"
              opacity="0.85"
            />
          </svg>

          {/* DOME 3: Grand Emerald Hydroponics Biosphere Hub */}
          <div className="absolute opacity-90" style={{ left: '15%', bottom: '44%' }}>
            <svg viewBox="0 0 110 74" className="w-18 sm:w-22 md:w-28 h-auto drop-shadow-[0_5px_15px_rgba(0,0,0,0.65)] z-10">
              <path d="M 12,65 A 43,43 0 0,1 98,65 Z" fill="url(#interiorBioGlow)" />
              <path d="M 22,65 Q 34,45 46,65 Q 58,40 70,65 Q 82,48 90,65 Z" fill="#064e3b" opacity="0.8" />
              <path d="M 32,65 Q 46,52 60,65 Q 74,46 86,65 Z" fill="#065f46" opacity="0.75" />
              <circle cx="46" cy="50" r="3.5" fill="#34d399" opacity="0.55" />
              <circle cx="70" cy="46" r="3.5" fill="#10b981" opacity="0.5" />
              <circle cx="58" cy="58" r="2.5" fill="#6ee7b7" opacity="0.6" />
              <path d="M 12,65 A 43,43 0 0,1 98,65 Z" fill="url(#domeGlassEmerald)" stroke="#34d399" strokeWidth="1.4" />
              <path d="M 32,65 C 32,43 55,22 55,22" fill="none" stroke="#a7f3d0" strokeWidth="1" opacity="0.45" />
              <path d="M 78,65 C 78,43 55,22 55,22" fill="none" stroke="#a7f3d0" strokeWidth="1" opacity="0.45" />
              <line x1="55" y1="22" x2="55" y2="65" stroke="#a7f3d0" strokeWidth="1" opacity="0.4" />
              <path d="M 20,51 Q 55,42 90,51" fill="none" stroke="#a7f3d0" strokeWidth="0.9" opacity="0.4" />
              <path d="M 22,53 A 35,35 0 0,1 46,27" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
              <rect x="7" y="63" width="96" height="6" rx="2" fill="url(#domeBaseCollar)" />
              <rect x="47" y="58" width="16" height="10" rx="3" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
              <circle cx="55" cy="63" r="2" fill="#34d399" />
              <circle cx="55" cy="21" r="2" fill="#34d399" />
            </svg>
          </div>
        </div>

        {/* DEPTH LAYER 3: Foreground Landing Plain & Two Flagship Biodomes */}
        <div className="absolute inset-0 z-20">
          <svg viewBox="0 0 1000 160" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path
              d="M0,108 C300,102 520,114 780,104 C880,100 950,106 1000,104 L1000,160 L0,160 Z"
              fill="url(#marsForegroundPlain)"
            />
          </svg>

          {/* DOME 1: Colony Metropolis (Lights up green on Venus ping) */}
          <div className="absolute opacity-95" style={{ left: '5%', bottom: '24%' }}>
            <svg viewBox="0 0 160 105" className="w-22 sm:w-26 md:w-32 h-auto drop-shadow-[0_5px_16px_rgba(0,0,0,0.65)]">
              <path d="M 12,88 A 68,64 0 0,1 148,88 Z" fill={isVenusPinged ? 'url(#interiorBioGlow)' : 'url(#interiorHabGlow)'} />
              <path d="M 28,88 L 28,74 L 132,74 L 132,88 Z" fill="#78350f" opacity="0.55" />
              <path d="M 38,74 L 38,60 L 122,60 L 122,74 Z" fill="#78350f" opacity="0.45" />
              <path d="M 52,60 L 52,48 L 108,48 L 108,60 Z" fill="#78350f" opacity="0.35" />

              {[34, 44, 54, 64, 74, 84, 94, 104, 114, 124].map((x) => (
                <circle key={`w1-${x}`} cx={x} cy="81" r="1.4" fill={isVenusPinged ? '#a7f3d0' : '#fef08a'} />
              ))}
              {[46, 56, 66, 76, 86, 96, 106, 114].map((x) => (
                <circle key={`w2-${x}`} cx={x} cy="67" r="1.4" fill={isVenusPinged ? '#a7f3d0' : '#fef08a'} />
              ))}
              {[58, 68, 78, 88, 98, 102].map((x) => (
                <circle key={`w3-${x}`} cx={x} cy="54" r="1.3" fill={isVenusPinged ? '#a7f3d0' : '#fef08a'} />
              ))}

              <path d="M 12,88 A 68,64 0 0,1 148,88 Z" fill={isVenusPinged ? 'url(#domeGlassEmerald)' : 'url(#domeGlassCyan)'} stroke={isVenusPinged ? '#34d399' : '#7dd3fc'} strokeWidth="1.8" />
              <path d="M 36,88 C 36,58 80,24 80,24" fill="none" stroke={isVenusPinged ? '#a7f3d0' : '#bae6fd'} strokeWidth="1.2" opacity="0.45" />
              <path d="M 124,88 C 124,58 80,24 80,24" fill="none" stroke={isVenusPinged ? '#a7f3d0' : '#bae6fd'} strokeWidth="1.2" opacity="0.45" />
              <line x1="80" y1="24" x2="80" y2="88" stroke={isVenusPinged ? '#a7f3d0' : '#bae6fd'} strokeWidth="1.2" opacity="0.4" />
              <path d="M 22,68 Q 80,54 138,68" fill="none" stroke={isVenusPinged ? '#a7f3d0' : '#bae6fd'} strokeWidth="1.0" opacity="0.4" />
              <path d="M 38,48 Q 80,38 122,48" fill="none" stroke={isVenusPinged ? '#a7f3d0' : '#bae6fd'} strokeWidth="0.9" opacity="0.35" />
              <path d="M 24,74 A 58,54 0 0,1 70,30" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />

              <rect x="6" y="86" width="148" height="9" rx="3" fill="url(#domeBaseCollar)" stroke="#b45309" strokeWidth="1.2" />
              <rect x="66" y="78" width="28" height="17" rx="4" fill="#0f172a" stroke={isVenusPinged ? '#34d399' : '#38bdf8'} strokeWidth="1.2" />
              <circle cx="80" cy="86" r="2.5" fill={isVenusPinged ? '#34d399' : '#38bdf8'} />

              <line x1="80" y1="14" x2="80" y2="24" stroke="#e0f2fe" strokeWidth="1.5" />
              <circle cx="80" cy="14" r="2.5" fill={isVenusPinged ? '#34d399' : '#facc15'} />
            </svg>
          </div>

          {/* DOME 2: Grand Biosphere Terrarium (Lights up green on Mercury ping) */}
          <div className="absolute" style={{ right: '4%', bottom: '5%' }}>
            <svg viewBox="0 0 150 100" className="w-32 sm:w-40 md:w-48 lg:w-56 h-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.75)]">
              <path d="M 12,84 A 63,60 0 0,1 138,84 Z" fill="url(#interiorBioGlow)" />
              <path d="M 22,84 Q 34,60 48,84 Q 66,46 84,84 Q 102,52 116,84 Q 126,62 132,84 Z" fill="#064e3b" opacity="0.8" />
              <path d="M 32,84 Q 48,68 62,84 Q 76,58 92,84 Q 106,66 120,84 Z" fill="#065f46" opacity="0.75" />

              <circle cx="48" cy="68" r="4.5" fill="#34d399" opacity="0.45" />
              <circle cx="66" cy="56" r="5.5" fill="#10b981" opacity="0.4" />
              <circle cx="84" cy="52" r="5" fill="#34d399" opacity="0.5" />
              <circle cx="102" cy="62" r="4.5" fill="#10b981" opacity="0.45" />
              <circle cx="68" cy="74" r="3" fill="#6ee7b7" opacity="0.6" />
              <circle cx="86" cy="68" r="3" fill="#6ee7b7" opacity="0.6" />

              <path d="M 12,84 A 63,60 0 0,1 138,84 Z" fill="url(#domeGlassEmerald)" stroke={isMercuryPinged ? '#34d399' : '#38bdf8'} strokeWidth="1.8" />
              <path d="M 34,84 C 34,56 75,24 75,24" fill="none" stroke="#a7f3d0" strokeWidth="1.2" opacity="0.45" />
              <path d="M 116,84 C 116,56 75,24 75,24" fill="none" stroke="#a7f3d0" strokeWidth="1.2" opacity="0.45" />
              <line x1="75" y1="24" x2="75" y2="84" stroke="#a7f3d0" strokeWidth="1.2" opacity="0.4" />
              <path d="M 22,64 Q 75,50 128,64" fill="none" stroke="#a7f3d0" strokeWidth="1.0" opacity="0.4" />
              <path d="M 36,44 Q 75,36 114,44" fill="none" stroke="#a7f3d0" strokeWidth="0.9" opacity="0.35" />
              <path d="M 24,70 A 53,50 0 0,1 66,29" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
              <path d="M 88,32 A 48,45 0 0,1 122,66" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />

              <rect x="6" y="82" width="138" height="9" rx="3" fill="url(#domeBaseCollar)" stroke="#b45309" strokeWidth="1.2" />
              <rect x="62" y="74" width="26" height="17" rx="4" fill="#0f172a" stroke={isMercuryPinged ? '#34d399' : '#38bdf8'} strokeWidth="1.2" />
              <circle cx="75" cy="82" r="2.5" fill={isMercuryPinged ? '#34d399' : '#38bdf8'} />
              <circle cx="75" cy="23.5" r="2.5" fill={isMercuryPinged ? '#34d399' : '#38bdf8'} />
            </svg>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE BROADCASTER: Central AstroLink Tower                                   */}
      {/* ========================================================================= */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-all ${
          towerOverloaded ? 'animate-tower-shake' : ''
        }`}
        style={{ bottom: '0%' }}
      >
        <div className="relative w-24 sm:w-28 md:w-32 aspect-[120/360] flex flex-col items-center">
          {/* Transmitter Orb Beacon & Pulses */}
          <div
            className="absolute pointer-events-none z-30"
            style={{
              left: '50%',
              top: `${(62 / 360) * 100}%`,
              width: `${(68 / 120) * 100}%`,
              aspectRatio: '1/1',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`absolute inset-0 rounded-full transition-all duration-300 ${
                orbPulsing
                  ? 'bg-cyan-300/80 blur-xl scale-175 animate-ping'
                  : towerOverloaded
                  ? 'bg-rose-500/80 blur-xl scale-150 animate-ping'
                  : 'bg-sky-400/25 blur-md'
              }`}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-sky-400 animate-ping opacity-60"
              style={{ animationDuration: '3.2s' }}
            />
          </div>

          <svg
            viewBox="0 0 120 360"
            className="w-full h-full overflow-visible"
            style={{
              overflow: 'visible',
              filter: towerOverloaded
                ? 'drop-shadow(0 0 25px rgba(244,63,94,0.9))'
                : orbPulsing
                ? 'drop-shadow(0 0 25px rgba(56,189,248,0.9))'
                : 'drop-shadow(0 6px 18px rgba(0,0,0,0.75))',
            }}
          >
            <defs>
              <linearGradient id="tSatinSkyBlue" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="35%" stopColor="#38bdf8" />
                <stop offset="70%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
              <radialGradient id="tSatinOrb" cx="42%" cy="38%" r="62%">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="85%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#075985" />
              </radialGradient>
              <linearGradient id="tBrushedGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="25%" stopColor="#d97706" />
                <stop offset="55%" stopColor="#facc15" />
                <stop offset="85%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
            </defs>

            <line x1="60" y1="6" x2="60" y2="28" stroke="url(#tBrushedGold)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="60" cy="6" r="3.5" fill={towerOverloaded ? '#f43f5e' : orbPulsing ? '#38bdf8' : '#eab308'} />
            <ellipse cx="60" cy="28" rx="10" ry="3.5" fill="url(#tBrushedGold)" />

            <circle cx="60" cy="62" r="34" fill="url(#tSatinOrb)" stroke="url(#tBrushedGold)" strokeWidth="2" />
            <ellipse cx="60" cy="62" rx="44" ry="11" fill="none" stroke="url(#tBrushedGold)" strokeWidth="2.5" transform="rotate(-14 60 62)" />
            <circle cx="18" cy="72" r="2.5" fill="#38bdf8" stroke="#ca8a04" strokeWidth="0.8" />
            <circle cx="102" cy="52" r="2.5" fill="#38bdf8" stroke="#ca8a04" strokeWidth="0.8" />

            <rect x="52" y="96" width="16" height="34" rx="3" fill="url(#tSatinSkyBlue)" stroke="url(#tBrushedGold)" strokeWidth="1.2" />
            <ellipse cx="60" cy="130" rx="18" ry="6" fill="url(#tBrushedGold)" />
            <rect x="53" y="130" width="14" height="66" rx="3" fill="url(#tSatinSkyBlue)" stroke="url(#tBrushedGold)" strokeWidth="1.2" />
            <ellipse cx="60" cy="196" rx="20" ry="6" fill="url(#tBrushedGold)" />
            <rect x="53" y="196" width="14" height="66" rx="3" fill="url(#tSatinSkyBlue)" stroke="url(#tBrushedGold)" strokeWidth="1.2" />
            <ellipse cx="60" cy="262" rx="22" ry="7" fill="url(#tBrushedGold)" />

            <path d="M 38,262 L 14,352 L 28,352 L 48,262 Z" fill="url(#tSatinSkyBlue)" stroke="url(#tBrushedGold)" strokeWidth="1.2" />
            <path d="M 82,262 L 106,352 L 92,352 L 72,262 Z" fill="url(#tSatinSkyBlue)" stroke="url(#tBrushedGold)" strokeWidth="1.2" />
            <rect x="56" y="286" width="8" height="68" rx="2" fill="url(#tSatinSkyBlue)" stroke="url(#tBrushedGold)" strokeWidth="1.2" />
            <rect x="6" y="352" width="108" height="5" rx="2" fill="url(#tBrushedGold)" />
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING TEXT PACKETS & PIZZA EASTER EGG                                  */}
      {/* ========================================================================= */}
      {packets.map((pkt) => {
        const curX = pkt.startX + (pkt.endX - pkt.startX) * pkt.progress;
        const curY = pkt.startY + (pkt.endY - pkt.startY) * pkt.progress;

        return (
          <div
            key={pkt.id}
            className="absolute z-35 pointer-events-none"
            style={{
              left: `${curX}%`,
              top: `${curY}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {pkt.direction === 'return' ? (
              <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 font-mono text-xs font-bold whitespace-nowrap shadow-[0_0_24px_#34d399] backdrop-blur-md animate-pulse">
                Return Signal: {pkt.target === 'venus' ? 'Venus' : 'Mercury'}
              </div>
            ) : pkt.isPizza ? (
              <div className="px-3.5 py-1.5 rounded-full bg-amber-500/95 border-2 border-amber-300 text-amber-950 font-mono text-xs font-black tracking-wider uppercase whitespace-nowrap shadow-[0_0_24px_#f59e0b] backdrop-blur-md animate-pulse">
                Special Delivery: Pizza Packet
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-300 text-cyan-100 font-mono text-xs font-bold whitespace-nowrap shadow-[0_0_24px_#38bdf8] backdrop-blur-md">
                {pkt.text}
              </div>
            )}
          </div>
        );
      })}

      {/* Sparks from Overload */}
      {sparks.map((s) => (
        <div
          key={s.id}
          className="absolute z-40 pointer-events-none rounded-full animate-ping"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: '8px',
            height: '8px',
            backgroundColor: s.color,
            boxShadow: `0 0 10px ${s.color}`,
          }}
        />
      ))}

      {/* Incoming Message Notification at Tower */}
      {pendingReply && !activeModalReply && (
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 z-45 animate-in zoom-in-95 duration-300 pointer-events-auto">
          <button
            type="button"
            onClick={() => handleOpenPlanetMessage(pendingReply)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(52,211,153,0.85)] border-2 border-emerald-300 animate-bounce hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Radio size={14} className="animate-spin text-emerald-200" />
            <span>Open Message from {pendingReply.planet === 'venus' ? 'Venus' : 'Mercury'}</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 4: ALL SYSTEMS ONLINE OVERLAY & PROCEED ACTION                      */}
      {/* ========================================================================= */}
      {showAllSystemsOnline && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 w-[min(94%,28rem)] animate-in fade-in slide-in-from-top-6 duration-500 pointer-events-auto">
          <div className="bg-gradient-to-b from-[#120926]/95 via-[#0b051a]/98 to-[#091a18]/95 border-2 border-emerald-400/90 rounded-2xl p-4 shadow-[0_0_40px_rgba(52,211,153,0.35)] backdrop-blur-xl flex flex-col items-center text-center gap-2 text-white">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <h3 className="text-base sm:text-lg font-black font-display tracking-wider uppercase text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                All Systems Online!
              </h3>
            </div>
            <p className="text-xs text-slate-200 font-sans max-w-sm">
              Both Mercury and Venus have acknowledged the Mars AstroLink network. Signals are fully verified.
            </p>
            <button
              type="button"
              onClick={handleProceedClick}
              className="mt-1 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-display font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Proceed
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 1: ASTROLINK TERMINAL STANDBY CRADLE                                */}
      {/* ========================================================================= */}
      {phase === 'assembly' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(90%,22rem)] pointer-events-none animate-in fade-in duration-300">
          <div className="bg-[#120824]/85 border-2 border-dashed border-cyan-400/30 rounded-2xl px-4 py-2.5 backdrop-blur-md flex flex-col items-center text-center gap-1 shadow-[0_0_24px_rgba(56,189,248,0.12)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-300">
                Terminal Offline
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-tight">
              Assemble your form on the left, then click <strong className="text-amber-300 font-semibold">Run Simulation</strong> to deploy.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: SINGLE CENTRAL HOLOGRAPHIC TRANSMISSION DASHBOARD                */}
      {/* ========================================================================= */}
      {phase === 'sandbox' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(92%,26rem)] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-400 pointer-events-auto">
          <form
            onSubmit={handleTransmitSubmit}
            className="bg-gradient-to-b from-[#160c2e]/95 to-[#0b051a]/98 border-2 border-cyan-400/80 rounded-2xl p-3.5 backdrop-blur-xl flex flex-col gap-2.5 text-white shadow-[0_0_35px_rgba(56,189,248,0.3)] transition-all"
          >
            {/* Simple Dashboard Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <Radio
                  size={14}
                  className="text-cyan-400 animate-pulse"
                />
                {validation.formTitle ? (
                  <span className="text-xs font-bold tracking-wide text-cyan-200">
                    {validation.formTitle}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Target Planet & Message Controls */}
            <div className="flex flex-col gap-2">
              {/* Planet Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-300 font-medium shrink-0">Send To:</span>
                <select
                  value={targetPlanet}
                  disabled={isSubmitting}
                  onChange={(e) => setTargetPlanet(e.target.value as 'mercury' | 'venus')}
                  className="flex-1 bg-[#090314] border border-amber-500/50 focus:border-amber-300 text-amber-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none transition-all cursor-pointer"
                >
                  {validation.hasMercuryOption && (
                    <option value="mercury">Mercury</option>
                  )}
                  {validation.hasVenusOption && (
                    <option value="venus">Venus</option>
                  )}
                  {!validation.hasMercuryOption && !validation.hasVenusOption && (
                    <option value="mercury" disabled>No options configured</option>
                  )}
                </select>
              </div>

              {/* Message Text Input */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={25}
                  disabled={isSubmitting}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#090314] border border-cyan-500/40 focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300 text-white rounded-xl px-3 py-2 text-xs focus:outline-none transition-all"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-500 pointer-events-none">
                  {message.length}/25
                </span>
              </div>
            </div>

            {/* Transmit Button */}
            <div className="flex items-center justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 ${
                  isSubmitting
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer'
                }`}
              >
                <Send size={13} />
                <span>{isSubmitting ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PLANET STATUS REPORT CUSTOM MODAL                                         */}
      {/* ========================================================================= */}
      {activeModalReply && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 pointer-events-auto">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#1a0f35] to-[#0c051a] border-2 border-emerald-400 rounded-3xl p-6 shadow-[0_0_60px_rgba(52,211,153,0.4)] flex flex-col items-center text-center gap-4 text-white animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center p-2 shadow-[0_0_24px_rgba(52,211,153,0.5)]">
                <img
                  src={activeModalReply.planet === 'venus' ? '/assets/planets/celestial/Venus.svg' : '/assets/planets/celestial/Mercury.svg'}
                  alt={activeModalReply.planet}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-400">
                  {activeModalReply.isStatusQuery ? 'Emergency Call!' : 'Incoming Message!'}
                </span>
                <h3 className="text-xl font-black font-display tracking-wide uppercase text-white">
                  {activeModalReply.planet === 'venus' ? 'Venus Station' : 'Mercury Station'}
                </h3>
              </div>
            </div>

            <div className="w-full bg-[#0a0414] border border-emerald-500/30 rounded-2xl p-4 text-left shadow-inner">
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{activeModalReply.isStatusQuery ? 'Status Report:' : 'Message Reply:'}</span>
              </div>
              <p className="text-sm font-sans font-semibold text-emerald-100 leading-relaxed italic">
                "{activeModalReply.text}"
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveModalReply(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-display font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-95 transition-all cursor-pointer"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
