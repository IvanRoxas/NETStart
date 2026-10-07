"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sparkles, Lock, Unlock, Bug, Check, Info } from 'lucide-react';
import { useDemoMode, isDemoModeActive, setDemoModeActive } from '@/lib/demoMode';

interface DemoToggleProps {
  className?: string;
  compact?: boolean;
  canUseDemoMode?: boolean;
}

export default function DemoToggle({ className = "", compact = false, canUseDemoMode: canUseDemoModeProp }: DemoToggleProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const effectivePermission = typeof canUseDemoModeProp === 'boolean'
    ? canUseDemoModeProp
    : Boolean((session?.user as any)?.canUseDemoMode);

  useEffect(() => {
    if (status !== 'loading' && !effectivePermission && isDemoModeActive()) {
      setDemoModeActive(false);
    }
  }, [effectivePermission, status]);

  if (!effectivePermission) {
    return null;
  }

  const handleToggle = () => {
    const newState = toggleDemoMode();
    const msg = newState
      ? "Demo Mode Active: All planets unlocked. Progression & XP paused for debugging."
      : "Demo Mode Deactivated: Standard progression restored.";
    
    setToastMessage(msg);
    router.refresh();
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Interactive Toggle Button */}
      <button
        type="button"
        onClick={handleToggle}
        title={isDemoMode ? "Click to deactivate Demo Mode" : "Click to temporarily unlock all planets for debugging"}
        className={`group relative flex items-center gap-2.5 px-3.5 py-1.5 rounded-full font-mono text-xs font-bold transition-all duration-300 cursor-pointer select-none border ${
          isDemoMode
            ? "bg-amber-500/20 border-amber-400/70 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:bg-amber-500/30"
            : "bg-white/5 border-white/20 text-gray-400 hover:text-white hover:border-white/40 hover:bg-white/10 shadow-inner"
        }`}
      >
        {/* State Icon */}
        <div
          className={`flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-300 ${
            isDemoMode ? "bg-amber-400 text-black rotate-12 scale-105" : "bg-white/10 text-gray-400"
          }`}
        >
          {isDemoMode ? <Unlock size={11} strokeWidth={2.5} /> : <Lock size={11} strokeWidth={2.5} />}
        </div>

        {/* Text Label */}
        <div className="flex items-center gap-1.5 leading-none">
          <span className="uppercase tracking-wider">
            {compact ? "DEMO" : "DEMO UNLOCK"}
          </span>
          <span
            className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
              isDemoMode ? "bg-amber-400 text-black" : "bg-white/10 text-gray-400"
            }`}
          >
            {isDemoMode ? "ON" : "OFF"}
          </span>
        </div>

        {/* Glowing Pulsing Dot when active */}
        {isDemoMode && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
        )}
      </button>

      {/* Floating Status Toast (UI Notification Rule Compliance) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-none">
          <div className="flex items-center gap-3 bg-[#170928]/95 border border-amber-400/50 text-white px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-xl">
            <div className={`p-2 rounded-xl ${isDemoMode ? "bg-amber-500/20 text-amber-400 border border-amber-400/40" : "bg-white/10 text-gray-300"}`}>
              {isDemoMode ? <Unlock size={16} /> : <Info size={16} />}
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xs uppercase tracking-wider text-amber-400">
                {isDemoMode ? "Debug Demo Mode Active" : "Debug Demo Mode Normal"}
              </span>
              <span className="text-xs text-gray-200 font-medium">
                {toastMessage}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
