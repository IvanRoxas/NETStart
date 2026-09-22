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
  backgroundBase?: string;
  username?: string;
  onMissionGate?: (title: string) => void;
  onFinished: () => void;
  summaryText?: string;
}

export interface VisualNovelCutsceneHandle {
  resume: () => void;
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
        ctx.resume().catch(() => {});
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

const noop = () => {};

const VisualNovelCutscene = forwardRef<VisualNovelCutsceneHandle, VisualNovelCutsceneProps>(
  function VisualNovelCutscene(
    {
      scenes = [],
      backgroundBase = "/scenes/backgrounds/",
      username = "Chief",
      onMissionGate = noop,
      onFinished = noop,
      summaryText,
    },
    ref
  ) {
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
    const displaySpeakerName = rawSpeakerName === "Operator" ? username : rawSpeakerName;
    const profile = SPEAKER_PROFILES[rawSpeakerName] || DEFAULT_PROFILE;
    const showCharacterCard =
      !isDivider && !!scene && !NO_SPRITE_SPEAKERS.has(rawSpeakerName) && rawSpeakerName.trim().length > 0;
      
    // Pre-process text so both typing and quick-skip use the username correctly
    const rawText = scene?.text || "";
    const processedText = rawText.includes("Operator") ? rawText.replace(/Operator/g, username) : rawText;

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
        setShownText(scene.title || "");
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
          {/* Background Image Layer */}
          {backgroundUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
              style={{ backgroundImage: `url('${backgroundUrl}')` }}
            />
          )}

          {/* Vignette Overlay & Subtle Scanlines */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06020f] via-transparent to-black/60 pointer-events-none" />
          <div 
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "100% 3px"
            }}
          />

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
              {/* STATE B: Character Visual Card (Rectangular Sci-Fi Hologram or Sprite) */}
              {showCharacterCard && (
                <div
                  className={`absolute right-6 sm:right-16 bottom-0 z-20 transition-all duration-500 ease-out flex items-end gap-6 ${
                    spriteIn
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8 pointer-events-none"
                  }`}
                >
                  {rawSpeakerName === "Operator" ? (
                    <>
                      {/* Operator Holo-card */}
                      <div
                        className={`w-36 sm:w-48 aspect-[3/4] rounded-2xl bg-gradient-to-b ${profile.color} border-2 ${profile.border} ${profile.glow} p-3.5 sm:p-4 flex flex-col justify-between relative overflow-hidden backdrop-blur-md mb-[10rem] sm:mb-[13rem] shrink-0`}
                      >
                        <div className="flex items-center justify-between text-[8px] font-mono text-white/50">
                          <span>[HUD_ID]</span>
                          <span className="text-[#ff912d] animate-pulse">LIVE</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center my-2">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner relative group">
                            <div className="absolute inset-0 bg-[#ff912d]/10 rounded-2xl animate-pulse" />
                            {profile.icon === "crown" && <Crown size={32} className="text-indigo-400 drop-shadow-md" />}
                            {profile.icon === "radio" && <Radio size={32} className="text-sky-400 drop-shadow-md" />}
                            {profile.icon === "alert" && <ShieldAlert size={32} className="text-amber-400 drop-shadow-md" />}
                            {profile.icon === "user" && <User size={32} className="text-[#ff912d] drop-shadow-md" />}
                          </div>
                        </div>
                        <div className="text-center space-y-1 bg-black/50 border border-white/10 p-2 rounded-xl">
                          <div className="font-display font-black text-xs sm:text-sm text-white uppercase tracking-wider truncate">
                            {displaySpeakerName}
                          </div>
                          <div className="text-[8px] font-mono text-white/60 uppercase tracking-tight truncate">
                            {profile.role}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none opacity-40 animate-pulse" />
                      </div>
                      
                      {/* Nova Companion Sprite */}
                      <img 
                        src={SPEAKER_PROFILES["Nova"]?.image} 
                        alt="Nova" 
                        className="h-72 sm:h-[26rem] object-contain object-bottom drop-shadow-2xl mb-[8rem] sm:mb-[10rem] shrink-0" 
                      />
                    </>
                  ) : profile.image ? (
                    /* Actual Character Sprite */
                    <img 
                      src={profile.image} 
                      alt={displaySpeakerName} 
                      className="h-[32rem] sm:h-[44rem] object-contain object-bottom drop-shadow-[0_0_40px_rgba(0,0,0,0.6)] mb-[8rem] sm:mb-[12rem]" 
                    />
                  ) : (
                    /* Fallback Holo-card if no image */
                    <div
                      className={`w-36 sm:w-48 aspect-[3/4] rounded-2xl bg-gradient-to-b ${profile.color} border-2 ${profile.border} ${profile.glow} p-3.5 sm:p-4 flex flex-col justify-between relative overflow-hidden backdrop-blur-md mb-[10rem] sm:mb-[13rem] shrink-0`}
                    >
                      <div className="flex items-center justify-between text-[8px] font-mono text-white/50">
                        <span>[HUD_ID]</span>
                        <span className="text-[#ff912d] animate-pulse">LIVE</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center my-2">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner relative group">
                          <div className="absolute inset-0 bg-[#ff912d]/10 rounded-2xl animate-pulse" />
                          {profile.icon === "crown" && <Crown size={32} className="text-indigo-400 drop-shadow-md" />}
                          {profile.icon === "radio" && <Radio size={32} className="text-sky-400 drop-shadow-md" />}
                          {profile.icon === "alert" && <ShieldAlert size={32} className="text-amber-400 drop-shadow-md" />}
                          {profile.icon === "user" && <User size={32} className="text-[#ff912d] drop-shadow-md" />}
                        </div>
                      </div>
                      <div className="text-center space-y-1 bg-black/50 border border-white/10 p-2 rounded-xl">
                        <div className="font-display font-black text-xs sm:text-sm text-white uppercase tracking-wider truncate">
                          {displaySpeakerName}
                        </div>
                        <div className="text-[8px] font-mono text-white/60 uppercase tracking-tight truncate">
                          {profile.role}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none opacity-40 animate-pulse" />
                    </div>
                  )}
                </div>
              )}

              {/* Dialogue Box Overlay */}
              <div className="absolute left-4 right-4 bottom-10 sm:left-12 sm:right-12 sm:bottom-16 z-30">
                {/* Main Dialogue Box */}
                <div
                  className={`w-full bg-[#130524]/95 backdrop-blur-xl border-2 border-[#ff912d] rounded-[40px] py-6 px-10 sm:py-8 sm:px-20 shadow-[0_15px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(255,145,45,0.25)] relative transition-all duration-150 ${
                    typing ? "ring-1 ring-[#ff912d]/50" : ""
                  }`}
                >
                  {/* Speaker Name Box */}
                  {displaySpeakerName && (
                    <div 
                      className="absolute -top-6 sm:-top-7 left-8 sm:left-12 px-6 sm:px-8 py-1.5 sm:py-2 bg-[#130524] border-2 border-[#ff912d] rounded-[20px] text-white font-display font-black text-xl sm:text-2xl uppercase tracking-wider shadow-[0_5px_20px_rgba(0,0,0,0.5)] z-10"
                    >
                      {displaySpeakerName}
                    </div>
                  )}

                  {/* Typed Text Content */}
                  <p className="text-white text-xl sm:text-3xl font-medium leading-relaxed font-sans min-h-[80px] sm:min-h-[100px]">
                    {shownText}
                    {typing && (
                      <span className="inline-block w-4 h-8 ml-2 bg-[#ff912d] animate-pulse align-middle" />
                    )}
                  </p>

                  {/* Advance Hint */}
                  <div className="flex items-center justify-end gap-2 text-lg sm:text-xl font-mono text-[#ff912d] mt-6 font-bold tracking-wider">
                    <span>{typing ? "Click to quick-reveal" : "Click to continue"}</span>
                    <ChevronRight size={24} className="animate-pulse" />
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
              <div className="relative w-full max-w-6xl bg-[#1a0b2e] border-[3px] border-[#ff912d] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col pt-14 pb-12 px-8 sm:px-12 mt-8">
                
                {/* Starry Background (14% Opacity) covering the whole box */}
                <div 
                  className="absolute inset-0 opacity-[0.14] pointer-events-none rounded-3xl bg-cover bg-center"
                  style={{ backgroundImage: "url('/scenes/stars_bg.png')" }}
                />
                
                {/* Overhanging Title Box */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1a0b2e] border-[3px] border-[#ff912d] rounded-xl px-16 py-2 shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                  <h2 className="text-4xl font-sans text-white tracking-wide">Story Summary</h2>
                </div>

                {/* Content Area */}
                <div className="relative flex flex-col sm:flex-row items-center gap-8 sm:gap-12 z-10 min-h-[350px]">

                  {/* Left: Wobbling Character Image */}
                  <div className="w-1/3 flex justify-center items-center z-10 shrink-0 relative mt-4 sm:mt-0">
                    <img 
                      src="/scenes/Nova_Shrug_Sideways.png" 
                      alt="Nova"
                      className="w-full max-w-[240px] object-contain animate-wobble drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    />
                  </div>

                  {/* Right: JSON Summary Text */}
                  <div className="w-2/3 z-10 text-white/95 text-lg sm:text-[22px] font-sans leading-[1.6] text-justify font-medium tracking-wide">
                    {summaryText || storySummaries.skip_summary}
                  </div>
                </div>

                {/* Overhanging Next Button */}
                <div className="absolute -bottom-6 right-8 sm:right-16 z-20">
                  <button
                    onClick={onFinished}
                    className="bg-[#ff912d] hover:bg-[#ff912d]/90 text-white font-sans text-3xl px-8 py-2 rounded-2xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_5px_15px_rgba(255,145,45,0.4)]"
                  >
                    Next &gt;
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
