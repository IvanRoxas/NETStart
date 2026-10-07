"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export type MusicTrackType = 'dashboard' | 'cutscene' | 'level';

interface MusicContextType {
  isMuted: boolean;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  volume: number; // 0.0 to 1.0
  setVolume: (volume: number) => void;
  currentTrack: MusicTrackType | null;
  isPlaying: boolean;
  setCutsceneState: (active: boolean, missionId?: string | null) => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

const DASHBOARD_TRACK_SRC = '/music/Dashboard.mp3';
const CUTSCENE_TRACK_SRC = '/music/Level_BG.mp3';
const LEVEL_TRACK_SRC = '/music/New_Level_BG.mp3';
const DEFAULT_VOLUME = 0.35;

export function isDashboardCutscene(missionId?: string | null): boolean {
  if (!missionId) return false;
  const m = missionId.toLowerCase();
  // Moon levels 1, 2, and 3 cutscenes use Level BG
  if (m.startsWith('moon') || m.includes('moon')) return false;
  // Prologue, Earth level cutscenes, and Epilogue use Dashboard background music
  if (m === 'prologue' || m.startsWith('prologue') || m.startsWith('intro')) return true;
  if (m.startsWith('earth') || m.startsWith('python')) return true;
  if (m === 'epilogue' || m.startsWith('epilogue')) return true;
  return false;
}

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const [isMuted, setIsMutedState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('netstart_bgm_muted') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [volume, setVolumeState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('netstart_bgm_volume');
        if (saved !== null) {
          const val = parseFloat(saved);
          if (!isNaN(val) && val >= 0 && val <= 1) return val;
        }
      } catch {}
    }
    return DEFAULT_VOLUME;
  });

  const [cutsceneState, setCutsceneStateInternal] = useState<{
    active: boolean;
    missionId?: string | null;
  }>({
    active: false,
    missionId: null,
  });

  const [currentTrack, setCurrentTrack] = useState<MusicTrackType | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const dashboardAudioRef = useRef<HTMLAudioElement | null>(null);
  const cutsceneAudioRef = useRef<HTMLAudioElement | null>(null);
  const levelAudioRef = useRef<HTMLAudioElement | null>(null);
  const userInteractedRef = useRef<boolean>(false);

  // Initialize audio elements once on client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dashAudio = new Audio(DASHBOARD_TRACK_SRC);
    dashAudio.loop = true;
    dashAudio.volume = volume;
    dashAudio.preload = 'auto';
    dashboardAudioRef.current = dashAudio;

    const cutAudio = new Audio(CUTSCENE_TRACK_SRC);
    cutAudio.loop = true;
    cutAudio.volume = volume;
    cutAudio.preload = 'auto';
    cutsceneAudioRef.current = cutAudio;

    const lvlAudio = new Audio(LEVEL_TRACK_SRC);
    lvlAudio.loop = true;
    lvlAudio.volume = volume;
    lvlAudio.preload = 'auto';
    levelAudioRef.current = lvlAudio;

    const markInteracted = () => {
      userInteractedRef.current = true;
    };
    window.addEventListener('click', markInteracted, { passive: true });
    window.addEventListener('keydown', markInteracted, { passive: true });
    window.addEventListener('touchstart', markInteracted, { passive: true });

    return () => {
      window.removeEventListener('click', markInteracted);
      window.removeEventListener('keydown', markInteracted);
      window.removeEventListener('touchstart', markInteracted);
      dashAudio.pause();
      cutAudio.pause();
      lvlAudio.pause();
    };
  }, []);

  // Update volume on audio elements when volume changes
  const setVolume = useCallback((vol: number) => {
    const clamped = Math.min(1, Math.max(0, vol));
    setVolumeState(clamped);
    try {
      localStorage.setItem('netstart_bgm_volume', String(clamped));
    } catch {}

    if (dashboardAudioRef.current) dashboardAudioRef.current.volume = clamped;
    if (cutsceneAudioRef.current) cutsceneAudioRef.current.volume = clamped;
    if (levelAudioRef.current) levelAudioRef.current.volume = clamped;
  }, []);

  const safePlay = useCallback((audio: HTMLAudioElement) => {
    audio.play().catch(() => {
      // Browser autoplay policy might block play before first user interaction
      const onUserGesture = () => {
        userInteractedRef.current = true;
        audio.play().catch(() => {});
        window.removeEventListener('click', onUserGesture);
        window.removeEventListener('keydown', onUserGesture);
        window.removeEventListener('touchstart', onUserGesture);
      };
      window.addEventListener('click', onUserGesture, { once: true });
      window.addEventListener('keydown', onUserGesture, { once: true });
      window.addEventListener('touchstart', onUserGesture, { once: true });
    });
  }, []);

  const setCutsceneState = useCallback((active: boolean, missionId?: string | null) => {
    setCutsceneStateInternal({ active, missionId: missionId ?? null });
  }, []);

  // Control playback based on authentication, route, cutscene, and mute status
  useEffect(() => {
    const dashAudio = dashboardAudioRef.current;
    const cutAudio = cutsceneAudioRef.current;
    const lvlAudio = levelAudioRef.current;
    if (!dashAudio || !cutAudio || !lvlAudio) return;

    const isAuthenticated = status === 'authenticated' && Boolean(session?.user);

    // If not authenticated, do not play music
    if (!isAuthenticated) {
      dashAudio.pause();
      cutAudio.pause();
      lvlAudio.pause();
      setCurrentTrack(null);
      setIsPlaying(false);
      return;
    }

    const isInLevel = Boolean(
      pathname?.startsWith('/sandbox') || pathname?.startsWith('/code-sandbox')
    );

    // Determine target track
    let targetTrack: MusicTrackType = 'dashboard';
    if (cutsceneState.active) {
      if (isDashboardCutscene(cutsceneState.missionId)) {
        targetTrack = 'dashboard';
      } else {
        targetTrack = 'cutscene';
      }
    } else if (isInLevel) {
      targetTrack = 'level';
    } else {
      targetTrack = 'dashboard';
    }

    if (isMuted) {
      dashAudio.pause();
      cutAudio.pause();
      lvlAudio.pause();
      setCurrentTrack(targetTrack);
      setIsPlaying(false);
      return;
    }

    if (targetTrack === 'dashboard') {
      cutAudio.pause();
      cutAudio.currentTime = 0;
      lvlAudio.pause();
      lvlAudio.currentTime = 0;
      safePlay(dashAudio);
      setCurrentTrack('dashboard');
      setIsPlaying(true);
    } else if (targetTrack === 'cutscene') {
      dashAudio.pause(); // Retain dashboard progress
      lvlAudio.pause();
      lvlAudio.currentTime = 0;
      safePlay(cutAudio);
      setCurrentTrack('cutscene');
      setIsPlaying(true);
    } else if (targetTrack === 'level') {
      dashAudio.pause(); // Retain dashboard progress
      cutAudio.pause();
      cutAudio.currentTime = 0;
      safePlay(lvlAudio);
      setCurrentTrack('level');
      setIsPlaying(true);
    }
  }, [status, session?.user, pathname, isMuted, cutsceneState, safePlay]);

  const toggleMute = useCallback(() => {
    setIsMutedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('netstart_bgm_muted', String(next));
      } catch {}
      return next;
    });
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setIsMutedState(muted);
    try {
      localStorage.setItem('netstart_bgm_muted', String(muted));
    } catch {}
  }, []);

  return (
    <MusicContext.Provider
      value={{
        isMuted,
        toggleMute,
        setMuted,
        volume,
        setVolume,
        currentTrack,
        isPlaying,
        setCutsceneState,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    return {
      isMuted: false,
      toggleMute: () => {},
      setMuted: () => {},
      volume: DEFAULT_VOLUME,
      setVolume: () => {},
      currentTrack: null,
      isPlaying: false,
      setCutsceneState: () => {},
    };
  }
  return context;
}
