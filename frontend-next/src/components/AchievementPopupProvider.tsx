"use client";

import React, { useEffect, useState, useRef } from 'react';
import { SessionContext } from 'next-auth/react';
import Image from 'next/image';

export default function AchievementPopupProvider({ children }: { children: React.ReactNode }) {
  const sessionContext = React.useContext(SessionContext);
  const session = sessionContext?.data;
  const [queue, setQueue] = useState<any[]>([]);
  const [currentBadge, setCurrentBadge] = useState<any | null>(null);
  const [show, setShow] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio();
      const canPlayMp3 = audio.canPlayType && audio.canPlayType('audio/mpeg') !== '';
      audio.src = canPlayMp3 ? '/assets/global/ui/notification.mp3' : '/assets/global/ui/Notification.ogg';
      audio.volume = 0.2;
      audio.preload = 'auto';
      audioRef.current = audio;
    }
  }, []);
  const fetchUnreadAchievements = async () => {
    try {
      const res = await fetch(`/api/notifications?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) {
          const unreadPopups = data.notifications.filter(
            (n: any) => (n.type === 'achievement_unlocked' || n.type === 'level_up') && !n.read_at
          );
          if (unreadPopups.length > 0) {
            if (localStorage.getItem('setting_sounds') !== 'false' && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(e => {
                if (e.name !== 'NotAllowedError') {
                  console.error('Audio playback failed:', e);
                }
              });
            }
            setQueue(prev => {
              // Only add ones not already in queue or currently showing
              const newItems = unreadPopups.filter((n: any) => 
                !prev.find(p => p.id === n.id) && currentBadge?.id !== n.id
              );
              return [...prev, ...newItems];
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch achievements", err);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchUnreadAchievements();
      
      const handleUpdate = () => fetchUnreadAchievements();
      window.addEventListener('notifications_updated', handleUpdate);
      
      return () => window.removeEventListener('notifications_updated', handleUpdate);
    }
  }, [session, currentBadge]);

  useEffect(() => {
    if (!currentBadge && queue.length > 0) {
      const nextBadge = queue[0];
      setCurrentBadge(nextBadge);
      setShow(true);
    }
  }, [queue, currentBadge]);

  const dismissCurrent = async (badgeToDismiss: any) => {
    setShow(false);
    // Wait for the slide-out animation to finish (e.g. 500ms)
    setTimeout(async () => {
      // Mark as read in the backend
      try {
        await fetch(`/api/notifications/${badgeToDismiss.id}/read`, { method: 'POST' });
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
      
      // Remove from queue and clear current badge so the next one can pop
      setQueue(prev => prev.slice(1));
      setCurrentBadge(null);
    }, 500);
  };

  return (
    <>
      {children}
      
      {/* Sliding Dismissable Popup for Achievements */}
      <div 
        className={`fixed bottom-6 right-6 z-[999999] transition-all duration-500 ease-in-out transform ${
          show ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-[120%] opacity-0 scale-95'
        }`}
      >
        {currentBadge && (
          <div className="bg-[#1e0a2d] border-2 border-[#ffb703] rounded-2xl p-4 shadow-[0_10px_40px_rgba(255,183,3,0.3)] flex gap-4 items-center w-[340px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ffb703]/20 to-transparent pointer-events-none opacity-50"></div>
            
            {/* Close Button */}
            <button 
              onClick={() => dismissCurrent(currentBadge)}
              className="absolute top-2 right-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-6 h-6 flex items-center justify-center transition-colors z-10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-[#ffb703]/50 relative shadow-inner z-10 p-2">
              <div className="absolute -top-1 -right-1 bg-[#ffb703] text-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg z-20">
                <span className="font-bold text-[10px]">★</span>
              </div>
              {currentBadge.data?.badgeImage || (currentBadge.data?.badgeIcon && (currentBadge.data.badgeIcon.startsWith('/') || currentBadge.data.badgeIcon.startsWith('data:') || currentBadge.data.badgeIcon.startsWith('http'))) ? (
                <img src={currentBadge.data?.badgeImage || currentBadge.data?.badgeIcon} alt="Achievement" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(255,183,3,0.5)]" />
              ) : currentBadge.type === 'level_up' || currentBadge.notification_type === 'level_up' ? (
                <div className="w-full h-full flex items-center justify-center bg-[#ffb703] rounded-full shadow-inner">
                  <span className="text-black font-black text-2xl drop-shadow-sm">{currentBadge.data?.level || currentBadge.data?.badgeName?.replace(/\D/g, '') || ''}</span>
                </div>
              ) : (
                <span className="text-[#ff912d] font-bold text-2xl">{currentBadge.data?.badgeIcon || '🏆'}</span>
              )}
            </div>

            <div className="flex-1 flex flex-col z-10 pr-4">
              <span className="text-[#ffb703] font-sans font-bold text-[10px] uppercase tracking-widest mb-1">
                {currentBadge.type === 'level_up' ? 'Level Up!' : 'Achievement Unlocked!'}
              </span>
              <h4 className="text-white font-bold text-sm leading-tight mb-1 drop-shadow-md">
                "{currentBadge.data?.badgeName || "Secret Achievement"}"
              </h4>
              <p className="text-white/60 text-xs leading-tight line-clamp-2">
                {currentBadge.type === 'level_up' 
                  ? `Congratulations! You have reached Level ${currentBadge.data?.badgeName?.replace(/\D/g, '') || ''}.` 
                  : `Congratulations! You have achieved "${currentBadge.data?.badgeName}".`}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
