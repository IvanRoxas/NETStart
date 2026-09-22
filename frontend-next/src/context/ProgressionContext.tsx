"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { calculateLevel, getXPDetails, MAX_LEVEL, XPDetails } from "@/lib/leveling";
import { Sparkles, Trophy, Zap, X } from "lucide-react";

import { getUserStorageItem, setUserStorageItem, clearLegacyUnscopedData } from "@/lib/userStorage";

interface ProgressionContextType {
  currentXp: number;
  playerLevel: number;
  xpToNextLevel: number | "MAX";
  progressPercent: number;
  isMaxLevel: boolean;
  addXp: (amount: number, sourceLabel?: string) => void;
  removeXp: (amount: number) => void;
  levelUpModal: { isOpen: boolean; newLevel: number } | null;
  closeLevelUpModal: () => void;
  xpDetails: XPDetails;
}

const ProgressionContext = createContext<ProgressionContextType | undefined>(undefined);

export function ProgressionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update: updateSession } = useSession();
  const sessionUser = session?.user as any;
  const userId = sessionUser?.id as string | undefined;

  // Initialize XP strictly from session or user-scoped storage
  const [currentXp, setCurrentXp] = useState<number>(0);
  const [levelUpModal, setLevelUpModal] = useState<{ isOpen: boolean; newLevel: number } | null>(null);

  useEffect(() => {
    // Purge any old unscoped netstart data left by previous users
    clearLegacyUnscopedData();

    if (sessionUser?.xp !== undefined && typeof sessionUser.xp === "number") {
      setCurrentXp(sessionUser.xp);
    } else if (userId && typeof window !== "undefined") {
      const stored = getUserStorageItem("player_xp", userId);
      if (stored) {
        setCurrentXp(parseInt(stored, 10) || 0);
      } else {
        setCurrentXp(0);
      }
    } else {
      setCurrentXp(0);
    }
  }, [sessionUser?.xp, userId]);

  const xpDetails = getXPDetails(currentXp);
  const playerLevel = xpDetails.level;
  const xpToNextLevel = xpDetails.xpToNextLevel;
  const progressPercent = xpDetails.progress;
  const isMaxLevel = xpDetails.isMaxLevel;

  const triggerLevelUpUI = useCallback((newLevel: number) => {
    setLevelUpModal({ isOpen: true, newLevel });
  }, []);

  const addXp = useCallback((amount: number, sourceLabel?: string) => {
    if (amount <= 0) return;

    setCurrentXp(prevXp => {
      const oldLevel = calculateLevel(prevXp);
      const newXp = prevXp + amount;
      const newLevel = calculateLevel(newXp);

      if (typeof window !== "undefined") {
        if (userId) {
          setUserStorageItem("player_xp", String(newXp), userId);
        }
        window.dispatchEvent(new CustomEvent("netstart:xp_gained", {
          detail: { amount, newXp, newLevel, source: sourceLabel }
        }));
      }

      // If a threshold is crossed, trigger level up
      if (newLevel > oldLevel) {
        triggerLevelUpUI(newLevel);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("netstart:level_up", {
            detail: { oldLevel, newLevel, newXp }
          }));
        }
      }

      return newXp;
    });
  }, [triggerLevelUpUI, userId]);

  const removeXp = useCallback((amount: number) => {
    if (amount <= 0) return;
    setCurrentXp(prevXp => {
      const newXp = Math.max(0, prevXp - amount);
      if (typeof window !== "undefined" && userId) {
        setUserStorageItem("player_xp", String(newXp), userId);
      }
      return newXp;
    });
  }, [userId]);

  const closeLevelUpModal = () => {
    setLevelUpModal(null);
  };

  return (
    <ProgressionContext.Provider
      value={{
        currentXp,
        playerLevel,
        xpToNextLevel,
        progressPercent,
        isMaxLevel,
        addXp,
        removeXp,
        levelUpModal,
        closeLevelUpModal,
        xpDetails,
      }}
    >
      {children}

      {/* Global Level Up Modal UI Event */}
      {levelUpModal && levelUpModal.isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-b from-[#240c42] to-[#120324] border-2 border-amber-400/60 rounded-3xl p-7 max-w-sm w-full shadow-[0_0_60px_rgba(251,191,36,0.35)] flex flex-col items-center text-center relative animate-in zoom-in-95 duration-200">
            {/* Top Close Button */}
            <button
              onClick={closeLevelUpModal}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Glowing Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-[0_0_30px_rgba(251,191,36,0.5)] mb-4 animate-bounce">
              <div className="w-full h-full bg-[#1b0730] rounded-[22px] flex items-center justify-center text-amber-400">
                <Trophy size={32} className="fill-amber-400" />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-black uppercase tracking-widest mb-1">
              <Sparkles size={14} />
              <span>Rank Promotion</span>
              <Sparkles size={14} />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black font-display text-white uppercase tracking-wider mb-2">
              Level Up!
            </h3>

            <p className="text-sm text-gray-300 font-sans leading-relaxed mb-6">
              Congratulations! You have advanced to{" "}
              <span className="text-amber-400 font-bold font-mono">
                Level {levelUpModal.newLevel}
              </span>
              .
            </p>

            <button
              onClick={closeLevelUpModal}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-display font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer"
            >
              Continue Mission
            </button>
          </div>
        </div>
      )}
    </ProgressionContext.Provider>
  );
}

export function useProgression() {
  const context = useContext(ProgressionContext);
  if (!context) {
    throw new Error("useProgression must be used within a ProgressionProvider");
  }
  return context;
}
