"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import storySummaries from "@/data/story_summaries.json";
import {
  Volume2,
  VolumeX,
  FastForward,
  User,
  ShieldAlert,
  Crown,
  Radio,
  Sparkles,
  ChevronRight
} from "lucide-react";

import { useSession } from "next-auth/react";
import AvatarDisplay, { AvatarLayers, DEFAULT_AVATAR_LAYERS } from "@/components/AvatarDisplay";
import { getUserStorageItem, setUserStorageItem } from "@/lib/userStorage";
import { useMusic } from "@/context/MusicContext";

export interface SceneItem {
  slide?: string;
  type: "divider" | "dialogue" | "mission";
  title?: string;
  subtitle?: string;
  speaker?: string;
  text?: string;
  background?: string;
  mission?: string;
  level?: number;
  concept?: string;
}

export interface VisualNovelCutsceneProps {
  scenes: SceneItem[];
  missionId?: string;
  backgroundBase?: string;
  username?: string;
  userId?: string;
  avatarLayers?: AvatarLayers;
  onMissionGate?: (title: string) => void;
  onFinished: () => void;
  summaryText?: string;
}

export interface VisualNovelCutsceneHandle {
  resume: () => void;
}

export function sanitizeDialogueText(text: string): string {
  if (!text) return "";
  return text
    // Mojibake right single quote / apostrophe (Windows-1252 0x92 -> UTF-8 0xE2 0x80 0x99 decoded as windows-1252)
    .replace(/â€™/g, "’")
    .replace(/â€˜/g, "‘")
    .replace(/â€œ/g, "“")
    .replace(/â€\u009d/g, "”")
    .replace(/â€\u009c/g, "“")
    .replace(/â€”/g, "—")
    .replace(/â€“/g, "–")
    .replace(/â€¦/g, "…")
    .replace(/â‚¬/g, "€")
    .replace(/Â\u00a0/g, " ")
    .replace(/Â /g, " ")
    .replace(/Ã©/g, "é")
    .replace(/Ã¡/g, "á")
    .replace(/Ã±/g, "ñ");
}

// Matches divider titles like "HTML - Game 3", "Tutorial Game 2"
const MISSION_GATE_PATTERN = /game\s*\d/i;

// Speakers who don't get an on-screen character box (narration/system alerts)
const NO_SPRITE_SPEAKERS = new Set(["Narrator", "System"]);

interface SpeakerMetadata {
  color: string;
  border: string;
  glow: string;
  badgeBg: string;
  role: string;
  pitch: number;
  icon: "crown" | "alert" | "radio" | "user";
  image?: string;
  silhouette?: boolean;
}

const SPEAKER_PROFILES: Record<string, SpeakerMetadata> = {
  Oberion: {
    color: "from-[#111827] via-[#1e1b4b] to-[#0f172a]",
    border: "border-indigo-400/80",
    glow: "shadow-[0_0_35px_rgba(99,102,241,0.45)]",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    role: "MOON AMBASSADOR & LEADER",
    pitch: 150,
    icon: "crown",
    image: "/scenes/characters/OBERION.png",
  },
  Employee: {
    color: "from-[#082f49] via-[#0369a1] to-[#0c4a6e]",
    border: "border-sky-400/80",
    glow: "shadow-[0_0_35px_rgba(56,189,248,0.45)]",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    role: "NETSTART HQ STATION STAFF",
    pitch: 270,
    icon: "radio",
    image: "/scenes/characters/EMPLOYEE.png",
  },
  "Higher Head": {
    color: "from-[#451a03] via-[#9a3412] to-[#3b0764]",
    border: "border-amber-400/80",
    glow: "shadow-[0_0_35px_rgba(245,158,11,0.5)]",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    role: "EXECUTIVE CRISIS DIRECTOR",
    pitch: 130,
    icon: "alert",
    image: "/scenes/characters/HIGHER HEAD.png",
  },
  "Director Atlas": {
    color: "from-[#451a03] via-[#9a3412] to-[#3b0764]",
    border: "border-amber-400/80",
    glow: "shadow-[0_0_35px_rgba(245,158,11,0.5)]",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    role: "NETSTART HQ DIRECTOR",
    pitch: 130,
    icon: "alert",
    image: "/scenes/characters/HIGHER HEAD.png",
  },
  "The Architect": {
    color: "from-[#022c22] via-[#064e3b] to-[#0f172a]",
    border: "border-emerald-400/80",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.5)]",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    role: "ASTROLINK ARCHITECT",
    pitch: 95,
    icon: "radio",
    image: "/scenes/characters/ARCHITECT.png",
  },
  Nova: {
    color: "from-[#042f2e] via-[#0d9488] to-[#134e4a]",
    border: "border-teal-400/80",
    glow: "shadow-[0_0_35px_rgba(45,212,191,0.45)]",
    badgeBg: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    role: "FLIGHT SPECIALIST",
    pitch: 240,
    icon: "user",
    image: "/scenes/characters/Nova Idle.png",
  },
  "Operator": {
    color: "from-[#311042] via-[#701a75] to-[#1e1b4b]",
    border: "border-[#ff912d]",
    glow: "shadow-[0_0_35px_rgba(255,145,45,0.45)]",
    badgeBg: "bg-[#ff912d]/20 text-[#ff912d] border-[#ff912d]/40",
    role: "CHIEF ASTRONAUT",
    pitch: 170,
    icon: "user",
  },
  Mark: {
    color: "from-[#14532d] via-[#166534] to-[#052e16]",
    border: "border-green-400/80",
    glow: "shadow-[0_0_35px_rgba(74,222,128,0.45)]",
    badgeBg: "bg-green-500/20 text-green-300 border-green-500/40",
    role: "LOCAL RESIDENT",
    pitch: 120,
    icon: "user",
    image: "/scenes/characters/MARK.png",
  },
  "Emma G": {
    color: "from-[#831843] via-[#be185d] to-[#4c0519]",
    border: "border-pink-400/80",
    glow: "shadow-[0_0_35px_rgba(244,114,182,0.45)]",
    badgeBg: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    role: "MARS TWIN",
    pitch: 280,
    icon: "user",
    image: "/scenes/characters/EMMA_G.png",
  },
  "Penny G": {
    color: "from-[#831843] via-[#be185d] to-[#4c0519]",
    border: "border-pink-400/80",
    glow: "shadow-[0_0_35px_rgba(244,114,182,0.45)]",
    badgeBg: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    role: "MARS TWIN",
    pitch: 280,
    icon: "user",
    image: "/scenes/characters/PENNY_G.png",
  },
  "Emma G and Penny G": {
    color: "from-[#831843] via-[#be185d] to-[#4c0519]",
    border: "border-pink-400/80",
    glow: "shadow-[0_0_35px_rgba(244,114,182,0.45)]",
    badgeBg: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    role: "MARS TWINS",
    pitch: 280,
    icon: "user",
  },
  "??? (Spectrum)": {
    color: "from-[#27272a] via-[#3f3f46] to-[#18181b]",
    border: "border-zinc-500",
    glow: "shadow-[0_0_35px_rgba(113,113,122,0.45)]",
    badgeBg: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
    role: "UNKNOWN CALLER",
    pitch: 100,
    icon: "user",
    image: "/scenes/characters/PROF_SPECTRUM.png",
    silhouette: true
  },
  "??? (Hue)": {
    color: "from-[#27272a] via-[#3f3f46] to-[#18181b]",
    border: "border-zinc-500",
    glow: "shadow-[0_0_35px_rgba(113,113,122,0.45)]",
    badgeBg: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
    role: "UNKNOWN FIGURE",
    pitch: 110,
    icon: "user",
    image: "/scenes/characters/PROF_HUE.png",
    silhouette: true
  },
  "Professor Spectrum": {
    color: "from-[#172554] via-[#1e3a8a] to-[#1e40af]",
    border: "border-blue-400/80",
    glow: "shadow-[0_0_35px_rgba(96,165,250,0.45)]",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    role: "VENUS HEAD SCIENTIST",
    pitch: 100,
    icon: "user",
    image: "/scenes/characters/PROF_SPECTRUM.png",
  },
  "Professor Hue": {
    color: "from-[#7f1d1d] via-[#991b1b] to-[#b91c1c]",
    border: "border-red-400/80",
    glow: "shadow-[0_0_35px_rgba(248,113,113,0.45)]",
    badgeBg: "bg-red-500/20 text-red-300 border-red-500/40",
    role: "VENUS COLOR SPECIALIST",
    pitch: 110,
    icon: "user",
    image: "/scenes/characters/PROF_HUE.png",
  },
  "Professor Dominic": {
    color: "from-[#14532d] via-[#166534] to-[#052e16]",
    border: "border-green-400/80",
    glow: "shadow-[0_0_35px_rgba(74,222,128,0.45)]",
    badgeBg: "bg-green-500/20 text-green-300 border-green-500/40",
    role: "MERCURY BOTANIST",
    pitch: 90,
    icon: "user",
    image: "/scenes/characters/PROF_DOMINIC.png",
  },
  "Technician Io": {
    color: "from-[#9a3412] via-[#c2410c] to-[#7c2d12]",
    border: "border-orange-400/80",
    glow: "shadow-[0_0_35px_rgba(251,146,60,0.45)]",
    badgeBg: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    role: "JUPITER TECH SUPPORT",
    pitch: 220,
    icon: "user",
    image: "/scenes/characters/TECH_IO.png",
  },
  "The Core (Angry)": {
    color: "from-[#7f1d1d] via-[#991b1b] to-[#450a0a]",
    border: "border-red-600/90",
    glow: "shadow-[0_0_40px_rgba(220,38,38,0.6)]",
    badgeBg: "bg-red-600/30 text-red-200 border-red-500/50",
    role: "ROGUE AI INSTANCE",
    pitch: 50,
    icon: "alert",
    image: "/scenes/characters/Angry_AI.png",
  },
  "The Core (Good)": {
    color: "from-[#064e3b] via-[#047857] to-[#022c22]",
    border: "border-emerald-400/80",
    glow: "shadow-[0_0_40px_rgba(52,211,153,0.5)]",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    role: "ASTROLINK CENTRAL AI",
    pitch: 160,
    icon: "crown",
    image: "/scenes/characters/Good_AI.png",
  },
  "Engineer Titan": {
    color: "from-[#451a03] via-[#78350f] to-[#1e1b4b]",
    border: "border-amber-500/80",
    glow: "shadow-[0_0_35px_rgba(245,158,11,0.45)]",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    role: "SATURN LEAD SYSTEMS ENGINEER",
    pitch: 140,
    icon: "radio",
  },
  "Operator and Nova": {
    color: "from-[#311042] via-[#701a75] to-[#1e1b4b]",
    border: "border-[#ff912d]",
    glow: "shadow-[0_0_35px_rgba(255,145,45,0.45)]",
    badgeBg: "bg-[#ff912d]/20 text-[#ff912d] border-[#ff912d]/40",
    role: "RECON DUO",
    pitch: 200,
    icon: "user",
    image: "/scenes/characters/Nova Idle.png",
  },
  "???": {
    color: "from-[#18181b] via-[#27272a] to-[#09090b]",
    border: "border-zinc-500/80",
    glow: "shadow-[0_0_35px_rgba(113,113,122,0.45)]",
    badgeBg: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
    role: "UNKNOWN TRANSMISSION",
    pitch: 180,
    icon: "user",
  }
};

const DEFAULT_PROFILE: SpeakerMetadata = {
  color: "from-[#1e1b4b] via-[#3b0764] to-[#180729]",
  border: "border-purple-400/70",
  glow: "shadow-[0_0_35px_rgba(168,85,247,0.4)]",
  badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  role: "NETSTART OPERATIVE",
  pitch: 200,
  icon: "user",
};

function useProceduralBlip(isMuted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback((basePitch = 200) => {
    if (isMuted || typeof window === "undefined") return;
    try {
      if (!ctxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        ctxRef.current = new AudioContextClass();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => { });
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = basePitch + Math.random() * 30 - 15;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Audio context might be restricted before interaction
    }
  }, [isMuted]);

  return play;
}

const noop = () => { };

const VisualNovelCutscene = forwardRef<VisualNovelCutsceneHandle, VisualNovelCutsceneProps>(
  function VisualNovelCutscene(
    {
      scenes = [],
      missionId,
      backgroundBase = "/scenes/backgrounds/",
      username = "Chief",
      userId,
      avatarLayers,
      onMissionGate = noop,
      onFinished = noop,
      summaryText,
    },
    ref
  ) {
    const { setCutsceneState } = useMusic();
    const { data: session } = useSession();
    const effectiveUserId = userId || (session?.user as any)?.id;
    const [layers, setLayers] = useState<AvatarLayers>(avatarLayers || DEFAULT_AVATAR_LAYERS);

    useEffect(() => {
      const detectedMission =
        missionId ||
        scenes.find((s) => s.mission)?.mission ||
        scenes[0]?.title ||
        null;
      setCutsceneState(true, detectedMission);
      return () => {
        setCutsceneState(false, null);
      };
    }, [missionId, scenes, setCutsceneState]);

    useEffect(() => {
      if (avatarLayers) {
        setLayers(avatarLayers);
        return;
      }

      if (typeof window !== "undefined" && effectiveUserId) {
        try {
          const cached = getUserStorageItem("avatar_layers", effectiveUserId);
          if (cached) {
            setLayers(JSON.parse(cached));
          }
        } catch {}
      }

      let isMounted = true;
      async function fetchLayers() {
        try {
          const res = await fetch(`/api/avatar?t=${Date.now()}`);
          if (res.ok) {
            const data = await res.json();
            if (isMounted && data.layers) {
              setLayers(data.layers);
              if (typeof window !== "undefined" && effectiveUserId) {
                setUserStorageItem("avatar_layers", JSON.stringify(data.layers), effectiveUserId);
              }
            }
          }
        } catch (err) {
          console.warn("Failed to fetch avatar layers in cutscene:", err);
        }
      }

      fetchLayers();

      const handleAvatarUpdate = (e: any) => {
        if (e.detail) {
          setLayers(e.detail);
        }
      };

      if (typeof window !== "undefined") {
        window.addEventListener("netstart_avatar_updated", handleAvatarUpdate);
      }

      return () => {
        isMounted = false;
        if (typeof window !== "undefined") {
          window.removeEventListener("netstart_avatar_updated", handleAvatarUpdate);
        }
      };
    }, [effectiveUserId, avatarLayers]);

    const [index, setIndex] = useState(0);
    const [shownText, setShownText] = useState("");
    const [typing, setTyping] = useState(true);
    const [spriteIn, setSpriteIn] = useState(false);
    const [gated, setGated] = useState(false);
    const [muted, setMuted] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (typeof window !== "undefined") {
        const soundsEnabled = localStorage.getItem("setting_sounds") !== "false";
        setMuted(!soundsEnabled);
      }
    }, []);

    const playBlip = useProceduralBlip(muted);

    const scene = scenes[index];
    const isDivider = scene?.type === "divider";
    const isMissionGate =
      isDivider && index > 0 && MISSION_GATE_PATTERN.test(scene.title || "");
    const rawSpeakerName = scene?.speaker || "";
    const isArchitectLine = rawSpeakerName === "The Architect";
    const isArchitectTerminalScene = !!(scene?.background?.includes("earth_bg_003") || isArchitectLine);
    const sanitizedSpeaker = sanitizeDialogueText(rawSpeakerName);
    const displaySpeakerName = (sanitizedSpeaker === "Operator" || sanitizedSpeaker === "Y/N") ? username : sanitizedSpeaker.replace(/\s*\(.*?\)/g, "");
    const profile = SPEAKER_PROFILES[sanitizedSpeaker] || (sanitizedSpeaker === "Y/N" ? SPEAKER_PROFILES["Operator"] : DEFAULT_PROFILE);
    const showCharacterCard =
      !isDivider && !!scene && !NO_SPRITE_SPEAKERS.has(sanitizedSpeaker) && sanitizedSpeaker.trim().length > 0;
    const isOperatorSpeaking =
      sanitizedSpeaker === "Operator" ||
      rawSpeakerName === "Operator" ||
      sanitizedSpeaker === "Y/N" ||
      rawSpeakerName === "Y/N" ||
      sanitizedSpeaker === "Operator and Nova" ||
      rawSpeakerName === "Operator and Nova";
    const isSpeakerNova =
      sanitizedSpeaker.toLowerCase().includes("nova") ||
      rawSpeakerName.toLowerCase().includes("nova") ||
      isOperatorSpeaking;

    // Pre-process text so both typing and quick-skip use the username correctly and sanitize mojibake
    const rawText = sanitizeDialogueText(scene?.text || "");
    const processedText = rawText
      .replace(/Operator/g, username)
      .replace(/\bY\/N\b/g, username);

    const [lastRoomSpeaker, setLastRoomSpeaker] = useState<string>("Director Atlas");
    const isArchitectListenerNova =
      lastRoomSpeaker.toLowerCase().includes("nova") ||
      lastRoomSpeaker.toLowerCase().includes("operator");
    const isArchitectListenerOperator =
      lastRoomSpeaker === "Operator" ||
      lastRoomSpeaker === "Operator and Nova" ||
      lastRoomSpeaker === "Y/N";

    useEffect(() => {
      if (rawSpeakerName && rawSpeakerName !== "The Architect" && !NO_SPRITE_SPEAKERS.has(rawSpeakerName)) {
        setLastRoomSpeaker(rawSpeakerName);
      }
    }, [rawSpeakerName]);

    useImperativeHandle(ref, () => ({
      resume() {
        setGated(false);
        setIndex((i) => Math.min(i + 1, scenes.length - 1));
      },
    }));

    useEffect(() => {
      setSpriteIn(false);
      const t = setTimeout(() => setSpriteIn(true), 60);
      return () => clearTimeout(t);
    }, [index]);

    useEffect(() => {
      if (!scene) return;
      if (timerRef.current) clearInterval(timerRef.current);

      if (isDivider) {
        setShownText(sanitizeDialogueText(scene.title || ""));
        setTyping(false);
        if (isMissionGate) {
          setGated(true);
          onMissionGate(scene.title || "");
        }
        return;
      }

      setShownText("");
      setTyping(true);
      let charIdx = 0;

      timerRef.current = setInterval(() => {
        charIdx += 1;
        setShownText(processedText.slice(0, charIdx));

        if (charIdx % 2 === 0 && /\S/.test(processedText[charIdx - 1] || "")) {
          playBlip(profile.pitch);
        }

        if (charIdx >= processedText.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTyping(false);
        }
      }, 26);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [index, isDivider, isMissionGate, onMissionGate, playBlip, profile.pitch, scene]);

    const handleAdvance = () => {
      if (gated) return;
      if (!isDivider && typing) {
        if (timerRef.current) clearInterval(timerRef.current);
        setShownText(processedText);
        setTyping(false);
        return;
      }
      if (index < scenes.length - 1) {
        setIndex((prev) => prev + 1);
      } else {
        onFinished();
      }
    };

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    if (!scene || !isMounted) return null;

    const backgroundUrl = scene.background
      ? `${backgroundBase}${scene.background}`
      : undefined;

    const content = (
      <div className="fixed inset-0 z-[9999] w-full h-full bg-black">

        {/* Stage Container */}
        <div
          onClick={handleAdvance}
          className="relative w-full h-full overflow-hidden select-none cursor-pointer bg-black"
        >
          {/* Background Image Layer & Pinned In-World Elements */}
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none">
            <div
              className="relative shrink-0 pointer-events-auto"
              style={{
                width: 'max(100vw, calc(100vh * 2716 / 1568))',
                height: 'max(100vh, calc(100vw * 1568 / 2716))',
                aspectRatio: '2716 / 1568',
              }}
            >
              {backgroundUrl && (
                <img
                  src={backgroundUrl}
                  alt="Scene Background"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-700"
                />
              )}

              {/* Vignette Overlay & Subtle Scanlines */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06020f]/80 via-transparent to-black/60 pointer-events-none" />
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "100% 3px"
                }}
              />

              {/* The Architect Pinned Directly onto the Left Desk Monitor */}
              {isArchitectTerminalScene && !isDivider && (
                <div
                  className={`absolute transition-all duration-500 flex flex-col items-center justify-center overflow-hidden rounded-xl pointer-events-none ${spriteIn ? "opacity-100" : "opacity-0"
                    }`}
                  style={{
                    left: '17.2%',
                    top: '29.5%',
                    width: '19.0%',
                    height: '38.0%',
                  }}
                >
                  {/* Glowing Monitor Screen Tint & Active Bezel */}
                  <div className={`absolute inset-0 rounded-xl transition-all duration-500 ${isArchitectLine
                    ? "bg-cyan-950/40 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.65),inset_0_0_25px_rgba(6,182,212,0.45)]"
                    : "bg-cyan-950/15 border border-cyan-500/25"
                    }`} />

                  {/* Telemetry Header inside monitor */}
                  <div className="absolute top-1 left-2 right-2 z-10 flex items-center justify-between text-[7px] sm:text-[9px] font-mono text-cyan-300 font-bold pointer-events-none">
                    <span className="bg-black/60 px-1 py-0.5 rounded border border-cyan-500/30">CH: 00_CORE</span>
                    {isArchitectLine ? (
                      <span className="animate-pulse text-cyan-300 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-ping" />
                        TRANSMITTING
                      </span>
                    ) : (
                      <span className="text-cyan-500/70">IDLE</span>
                    )}
                  </div>

                  {/* The Architect Sprite INSIDE the Desk Monitor */}
                  <div className="relative w-full h-full flex items-center justify-center p-1 sm:p-2 z-0">
                    <img
                      src="/scenes/characters/ARCHITECT.png"
                      alt="The Architect"
                      className={`w-full h-full object-contain transition-all duration-500 ${isArchitectLine
                        ? "opacity-100 scale-100 brightness-110 filter drop-shadow-[0_0_20px_rgba(34,211,238,0.7)]"
                        : "opacity-45 scale-95 grayscale-[30%]"
                        }`}
                    />
                  </div>

                  {/* CRT Scanlines Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen z-10"
                    style={{
                      backgroundImage: "linear-gradient(rgba(34,211,238,0.25) 1px, transparent 1px)",
                      backgroundSize: "100% 3px"
                    }}
                  />

                  {/* Telemetry Footer inside monitor */}
                  <div className="absolute bottom-1 left-2 right-2 z-10 flex items-center justify-between text-[6px] sm:text-[8px] font-mono text-cyan-300/80 pointer-events-none">
                    <span>THE ARCHITECT</span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      ROW_0_LINK
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Control Bar (Scene Telemetry, Mute Button, Skip Button) */}
          <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
            {/* Progress Badge */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 shadow-lg w-40 sm:w-64">
              <span className="w-2 h-2 rounded-full bg-[#ff912d] animate-ping flex-shrink-0" />
              <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff912d] transition-all duration-300 rounded-full"
                  style={{ width: `${((index + 1) / scenes.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Quick Actions (Audio Toggle + Skip) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMuted(!muted);
                }}
                className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/80 hover:text-white hover:border-[#ff912d]/60 transition-all shadow-lg active:scale-95 cursor-pointer"
                title={muted ? "Unmute sound" : "Mute sound"}
              >
                {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSummaryModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#ff912d]/90 hover:bg-[#ff912d] text-black font-black font-mono text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,145,45,0.5)] transition-all active:scale-95 cursor-pointer"
                title="Skip to Dashboard"
              >
                <span>Skip</span>
                <FastForward size={13} />
              </button>
            </div>
          </div>

          {/* STATE A: Title Card Divider */}
          {isDivider ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/75 backdrop-blur-sm z-30 animate-in fade-in duration-300">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff912d]/15 border border-[#ff912d]/40 text-[#ff912d] font-mono text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles size={14} /> Mission Chapter
              </div>
              <h2 className="text-3xl sm:text-5xl font-black font-display text-white uppercase tracking-wider mb-2 drop-shadow-[0_0_20px_rgba(255,145,45,0.4)]">
                {scene.title}
              </h2>
              {scene.subtitle && (
                <p className="text-sm sm:text-base font-mono text-purple-200/80 max-w-md">
                  {scene.subtitle}
                </p>
              )}
              <div className="mt-8 px-5 py-2 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-white/70 animate-pulse flex items-center gap-2">
                <span>{gated ? "Preparing sector mission..." : "Click anywhere to begin ▸"}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Combined Dialogue Box & Character Stage Container */}
              <div className="absolute inset-x-4 bottom-4 sm:inset-x-8 sm:bottom-6 md:inset-x-12 md:bottom-8 z-30 flex justify-center pointer-events-none">
                <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl relative flex flex-col justify-end">

                  {/* STATE B2: Listener Characters on the side when The Architect is speaking */}
                  {isArchitectLine && (
                    <div
                      className={`absolute right-4 sm:right-8 md:right-12 ${isArchitectListenerNova
                        ? "bottom-[110px] sm:bottom-[130px] md:bottom-[145px]"
                        : "bottom-[100px] sm:bottom-[120px] md:bottom-[125px]"
                        } z-20 transition-all duration-500 ease-out flex items-end gap-3 pointer-events-none ${spriteIn
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-6 pointer-events-none"
                        }`}
                    >
                      {lastRoomSpeaker === "Nova" ? (
                        <img
                          src={SPEAKER_PROFILES["Nova"]?.image || "/scenes/characters/Nova Idle.png"}
                          alt="Nova"
                          className="h-[28vh] sm:h-[32vh] md:h-[35vh] max-h-[225px] sm:max-h-[265px] md:max-h-[285px] w-auto object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] opacity-90 transition-all duration-300"
                          style={{
                            maskImage: 'linear-gradient(to bottom, black 65%, transparent 97%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 97%)',
                          }}
                        />
                      ) : isArchitectListenerOperator ? (
                        <div className="flex items-end gap-3">
                          {/* Operator Avatar Sprite (Standalone, no border, no extras) */}
                          <div className="h-[44vh] sm:h-[50vh] md:h-[54vh] max-h-[380px] sm:max-h-[440px] md:max-h-[480px] aspect-[3/4] relative flex items-end justify-center shrink-0 drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)] translate-y-5 sm:translate-y-6 md:translate-y-7">
                            <AvatarDisplay
                              layers={layers}
                              className="w-full h-full"
                              scale={1.68}
                              showShadow={false}
                              offsetYClass="translate-y-0"
                              imgClassName="object-bottom"
                            />
                          </div>
                          {/* Nova Companion */}
                          <img
                            src={SPEAKER_PROFILES["Nova"]?.image || "/scenes/characters/Nova Idle.png"}
                            alt="Nova"
                            className="h-[25vh] sm:h-[29vh] md:h-[32vh] max-h-[195px] sm:max-h-[235px] w-auto object-contain object-bottom drop-shadow-2xl shrink-0 opacity-90"
                            style={{
                              maskImage: 'linear-gradient(to bottom, black 65%, transparent 97%)',
                              WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 97%)',
                            }}
                          />
                        </div>
                      ) : lastRoomSpeaker === "Oberion" ? (
                        <img
                          src={SPEAKER_PROFILES["Oberion"]?.image}
                          alt="Oberion"
                          className="h-[44vh] sm:h-[50vh] md:h-[54vh] max-h-[380px] sm:max-h-[440px] md:max-h-[480px] w-auto object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] opacity-90"
                        />
                      ) : (
                        /* Default / Director Atlas */
                        <img
                          src={SPEAKER_PROFILES["Director Atlas"]?.image || "/scenes/characters/HIGHER HEAD.png"}
                          alt="Director Atlas"
                          className="h-[44vh] sm:h-[50vh] md:h-[54vh] max-h-[380px] sm:max-h-[440px] md:max-h-[480px] w-auto object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] opacity-95 transition-all duration-300"
                        />
                      )}
                    </div>
                  )}

                  {/* STATE B3: Standard Active Speaker Card (Non-Architect) */}
                  {showCharacterCard && !isArchitectLine && (
                    <div
                      className={`absolute right-4 sm:right-8 md:right-12 ${isSpeakerNova
                        ? "bottom-[110px] sm:bottom-[130px] md:bottom-[145px]"
                        : "bottom-[100px] sm:bottom-[120px] md:bottom-[125px]"
                        } z-20 transition-all duration-500 ease-out flex items-end gap-3 pointer-events-none ${spriteIn
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-6 pointer-events-none"
                        }`}
                    >
                      {isOperatorSpeaking ? (
                        <>
                          {/* Operator Avatar Sprite (Standalone, no border, no extras) */}
                          <div className="h-[46vh] sm:h-[52vh] md:h-[56vh] max-h-[400px] sm:max-h-[460px] md:max-h-[500px] aspect-[3/4] relative flex items-end justify-center shrink-0 drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)] translate-y-5 sm:translate-y-7 md:translate-y-8">
                            <AvatarDisplay
                              layers={layers}
                              className="w-full h-full"
                              scale={1.68}
                              showShadow={false}
                              offsetYClass="translate-y-0"
                              imgClassName="object-bottom"
                            />
                          </div>

                          {/* Nova Companion Sprite */}
                          <img
                            src={SPEAKER_PROFILES["Nova"]?.image || "/scenes/characters/Nova Idle.png"}
                            alt="Nova"
                            className="h-[26vh] sm:h-[30vh] md:h-[33vh] max-h-[205px] sm:max-h-[245px] md:max-h-[265px] w-auto object-contain object-bottom drop-shadow-2xl shrink-0"
                            style={{
                              maskImage: 'linear-gradient(to bottom, black 65%, transparent 97%)',
                              WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 97%)',
                            }}
                          />
                        </>
                      ) : rawSpeakerName === "Emma G and Penny G" ? (
                        /* Twins Side-by-Side Sprites */
                        <div className="flex items-end gap-2 sm:gap-3">
                          <img
                            src={SPEAKER_PROFILES["Emma G"]?.image}
                            alt="Emma G"
                            className="h-[44vh] sm:h-[50vh] md:h-[54vh] max-h-[380px] sm:max-h-[440px] md:max-h-[480px] w-auto object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                          />
                          <img
                            src={SPEAKER_PROFILES["Penny G"]?.image}
                            alt="Penny G"
                            className="h-[44vh] sm:h-[50vh] md:h-[54vh] max-h-[380px] sm:max-h-[440px] md:max-h-[480px] w-auto object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                          />
                        </div>
                      ) : profile.image ? (
                        /* Actual Character Sprite */
                        <img
                          src={profile.image}
                          alt={displaySpeakerName}
                          className={`${isSpeakerNova ? "h-[28vh] sm:h-[32vh] md:h-[35vh] max-h-[225px] sm:max-h-[265px] md:max-h-[285px]" : "h-[44vh] sm:h-[50vh] md:h-[54vh] max-h-[380px] sm:max-h-[440px] md:max-h-[480px]"} w-auto object-contain object-bottom drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-500 ease-in-out ${profile.silhouette ? "brightness-0" : "brightness-100"}`}
                          style={
                            isSpeakerNova
                              ? {
                                maskImage: 'linear-gradient(to bottom, black 65%, transparent 97%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 97%)',
                              }
                              : undefined
                          }
                        />
                      ) : (
                        /* Fallback Holo-card if no image */
                        <div
                          className={`w-32 sm:w-40 md:w-44 aspect-[3/4] rounded-xl sm:rounded-2xl bg-gradient-to-b ${profile.color} border border-white/20 ${profile.glow} p-2.5 sm:p-3 flex flex-col justify-between relative overflow-hidden backdrop-blur-md shrink-0 shadow-xl`}
                        >
                          <div className="flex items-center justify-between text-[7px] sm:text-[8px] font-mono text-white/50">
                            <span>[HUD_ID]</span>
                            <span className="text-[#ff912d] animate-pulse">LIVE</span>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-center my-1.5">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner relative group">
                              <div className="absolute inset-0 bg-[#ff912d]/10 rounded-xl animate-pulse" />
                              {profile.icon === "crown" && <Crown size={24} className="text-indigo-400 drop-shadow-md" />}
                              {profile.icon === "radio" && <Radio size={24} className="text-sky-400 drop-shadow-md" />}
                              {profile.icon === "alert" && <ShieldAlert size={24} className="text-amber-400 drop-shadow-md" />}
                              {profile.icon === "user" && <User size={24} className="text-[#ff912d] drop-shadow-md" />}
                            </div>
                          </div>
                          <div className="text-center space-y-0.5 bg-black/50 border border-white/10 p-1.5 rounded-lg">
                            <div className="font-display font-black text-[11px] sm:text-xs md:text-sm text-white uppercase tracking-wider truncate">
                              {displaySpeakerName}
                            </div>
                            <div className="text-[7px] sm:text-[8px] font-mono text-white/60 uppercase tracking-tight truncate">
                              {profile.role}
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none opacity-40 animate-pulse" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Dialogue Box */}
                  <div
                    className={`w-full bg-[#130524] backdrop-blur-xl border-2 border-[#ff912d] rounded-2xl sm:rounded-3xl md:rounded-[32px] py-5 px-6 sm:py-7 sm:px-12 md:py-8 md:px-16 shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(255,145,45,0.25)] relative z-30 transition-all duration-150 pointer-events-auto ${typing ? "ring-2 ring-[#ff912d]/40" : ""
                      }`}
                  >
                    {/* Speaker Name Box */}
                    {displaySpeakerName && (
                      <div
                        className="absolute -top-4 sm:-top-5 md:-top-6 left-6 sm:left-10 md:left-14 px-5 sm:px-7 md:px-8 py-1.5 sm:py-2 md:py-2.5 bg-[#130524] border-2 border-[#ff912d] rounded-xl sm:rounded-2xl text-white font-display font-black text-xs sm:text-base md:text-lg uppercase tracking-wider shadow-[0_4px_20px_rgba(0,0,0,0.7)] z-10 flex items-center gap-2"
                      >
                        {displaySpeakerName}
                      </div>
                    )}

                    {/* Typed Text Content */}
                    <p className="text-white text-base sm:text-xl md:text-2xl font-medium leading-relaxed font-sans min-h-[64px] sm:min-h-[76px] md:min-h-[88px] pt-1">
                      {shownText}
                      {typing && (
                        <span className="inline-block w-3 h-5 sm:w-3.5 sm:h-6 md:h-7 ml-2 bg-[#ff912d] animate-pulse align-middle rounded-xs" />
                      )}
                    </p>

                    {/* Advance Hint */}
                    <div className="flex items-center justify-end gap-2 text-xs sm:text-sm md:text-base font-mono text-[#ff912d] mt-3 sm:mt-4 font-bold tracking-wide">
                      <span>{typing ? "Click to quick-reveal" : "Click to continue"}</span>
                      <ChevronRight size={18} className="animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Story Summary Modal Overlay */}
          {showSummaryModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
              <style>{`
                @keyframes wobbleMove {
                  0%, 100% { transform: translateX(-15px) rotate(-6deg); }
                  50% { transform: translateX(15px) rotate(6deg); }
                }
                .animate-wobble {
                  animation: wobbleMove 4s ease-in-out infinite;
                }
                @keyframes spriteJitter {
                  0%, 100% { transform: translateY(0); }
                  25% { transform: translateY(-8px); }
                  50% { transform: translateY(0); }
                  75% { transform: translateY(4px); }
                }
                .animate-jitter {
                  animation: spriteJitter 0.12s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite;
                }
              `}</style>

              {/* Blur backdrop overlay */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

              {/* Modal Container */}
              <div className="relative w-full max-w-3xl sm:max-w-4xl bg-[#1a0b2e] border-2 border-[#ff912d] rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col pt-10 pb-8 px-6 sm:px-10 mt-4">

                {/* Starry Background (14% Opacity) covering the whole box */}
                <div
                  className="absolute inset-0 opacity-[0.14] pointer-events-none rounded-2xl sm:rounded-3xl bg-cover bg-center"
                  style={{ backgroundImage: "url('/scenes/stars_bg.png')" }}
                />

                {/* Overhanging Title Box */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#1a0b2e] border-2 border-[#ff912d] rounded-xl px-8 sm:px-12 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.6)]">
                  <h2 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-wide">Story Summary</h2>
                </div>

                {/* Content Area */}
                <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8 z-10 min-h-[220px] sm:min-h-[260px]">

                  {/* Left: Wobbling Character Image */}
                  <div className="w-full sm:w-1/3 flex justify-center items-center z-10 shrink-0 relative mt-2 sm:mt-0">
                    <img
                      src="/scenes/Nova_Shrug_Sideways.png"
                      alt="Nova"
                      className="w-full max-w-[150px] sm:max-w-[180px] object-contain animate-wobble drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    />
                  </div>

                  {/* Right: JSON Summary Text */}
                  <div className="w-full sm:w-2/3 z-10 text-white/90 text-sm sm:text-base font-sans leading-relaxed text-justify font-normal tracking-wide">
                    {summaryText || storySummaries.skip_summary}
                  </div>
                </div>

                {/* Overhanging Next Button */}
                <div className="absolute -bottom-5 right-6 sm:right-12 z-20">
                  <button
                    onClick={onFinished}
                    className="bg-[#ff912d] hover:bg-[#ff912d]/90 text-white font-sans font-bold text-base sm:text-lg px-6 py-2 rounded-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(255,145,45,0.4)] cursor-pointer"
                  >
                    <span>Next &gt;</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return createPortal(content, document.body);
  }
);

export default VisualNovelCutscene;
