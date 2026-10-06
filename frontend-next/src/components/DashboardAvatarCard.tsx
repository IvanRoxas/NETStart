"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import AvatarDisplay, { AvatarLayers, DEFAULT_AVATAR_LAYERS } from '@/components/AvatarDisplay';
import AvatarCustomizeModal from '@/components/AvatarCustomizeModal';

interface DashboardAvatarCardProps {
  userDisplayName: string;
  initialLayers?: AvatarLayers;
}

export default function DashboardAvatarCard({
  userDisplayName,
  initialLayers,
}: DashboardAvatarCardProps) {
  const [layers, setLayers] = useState<AvatarLayers>(initialLayers || DEFAULT_AVATAR_LAYERS);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Sync avatar layers on mount and listen to real-time update events
  useEffect(() => {
    // 1. Check local storage for quick cached response
    if (typeof window !== 'undefined') {
      try {
        const cached = window.localStorage.getItem('netstart_avatar_layers');
        if (cached) {
          setLayers(JSON.parse(cached));
        }
      } catch {}
    }

    // 2. Fetch latest server state from /api/avatar
    let isMounted = true;
    async function fetchLayers() {
      try {
        const res = await fetch(`/api/avatar?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.layers) {
            setLayers(data.layers);
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('netstart_avatar_layers', JSON.stringify(data.layers));
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch avatar layers:', err);
      }
    }

    fetchLayers();

    // 3. Listen for cross-component update events
    const handleAvatarUpdate = (e: any) => {
      if (e.detail) {
        setLayers(e.detail);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('netstart_avatar_updated', handleAvatarUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('netstart_avatar_updated', handleAvatarUpdate);
      }
    };
  }, []);

  return (
    <>
      <div className="relative group/avatar-card">
        {/* Shadow Drop Box */}
        <div className="absolute inset-0 bg-[#090311]/75 rounded-3xl translate-x-2 translate-y-2 z-0 transition-all duration-300 group-hover/avatar-card:translate-x-3 group-hover/avatar-card:translate-y-3" />
        
        {/* Card Face */}
        <div className="relative z-10 bg-[#361d57] border-2 border-[#ff912d]/50 p-5 sm:p-6 rounded-3xl transition-all duration-300 shadow-xl group-hover/avatar-card:-translate-x-1 group-hover/avatar-card:-translate-y-1 flex flex-col justify-between gap-4 overflow-hidden min-h-[380px]">
          
          {/* Cosmic Backdrop Ambient Effects */}
          <img 
            src="/assets/global/ui/Landing Page BG.png" 
            alt="Stars" 
            className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a082c]/80 via-transparent to-[#1a082c]/90 pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#ff912d]/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#a855f7]/15 rounded-full blur-xl pointer-events-none" />

          {/* Header: User Display Name at the Top */}
          <div className="relative z-10 w-full flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-white font-display font-black text-base tracking-wide truncate max-w-[190px]">
              {userDisplayName}
            </h3>
            <span className="text-[10px] font-mono font-bold text-[#ff912d] bg-[#ff912d]/15 px-2 py-0.5 rounded border border-[#ff912d]/30">
              AVATAR
            </span>
          </div>

          {/* Middle Stage: Floor Stage with Character Standing & Shadow Below */}
          <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-end my-1 min-h-[260px] pb-1">
            <AvatarDisplay layers={layers} className="w-full h-64 sm:h-72" scale={1.20} />
          </div>

          {/* Trigger Button: Opens Customize Avatar Menu Modal */}
          <button 
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="relative z-10 w-full h-[36px] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ff912d]/50 rounded-xl text-sm font-black tracking-wide text-[#ff912d] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Customize Avatar</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Menu Modal */}
      <AvatarCustomizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAvatarUpdated={(newLayers) => setLayers(newLayers)}
      />
    </>
  );
}
