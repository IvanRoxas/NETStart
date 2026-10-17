"use client";

import React, { useEffect, useState, useRef } from 'react';
import { SessionContext } from 'next-auth/react';
import Image from 'next/image';
import QuillIcon from '@/components/icons/QuillIcon';

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
            (n: any) => (n.type === 'achievement_unlocked' || n.type === 'level_up' || n.type === 'title_unlocked' || n.type === 'sandbox_unlocked' || n.notification_type === 'sandbox_unlocked') && !n.read_at
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
      window.addEventListener('sandbox_unlocked', handleUpdate);
      
      return () => {
        window.removeEventListener('notifications_updated', handleUpdate);
        window.removeEventListener('sandbox_unlocked', handleUpdate);
      };
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
        {currentBadge && (() => {
          const isSandbox = currentBadge.type === 'sandbox_unlocked' || currentBadge.notification_type === 'sandbox_unlocked';
          const isTitle = currentBadge.type === 'title_unlocked' || currentBadge.notification_type === 'title_unlocked';
          const isLevelUp = currentBadge.type === 'level_up' || currentBadge.notification_type === 'level_up';

          return (
            <div className={`bg-[#1e0a2d] border-2 ${isSandbox ? 'border-[#ff912d] shadow-[0_10px_40px_rgba(255,145,45,0.4)]' : 'border-[#ffb703] shadow-[0_10px_40px_rgba(255,183,3,0.3)]'} rounded-2xl p-4 flex gap-4 items-center w-[350px] relative overflow-hidden group`}>
              <div className={`absolute inset-0 bg-gradient-to-r ${isSandbox ? 'from-[#ff912d]/20' : 'from-[#ffb703]/20'} to-transparent pointer-events-none opacity-50`}></div>
              
              {/* Close Button */}
              <button 
                onClick={() => dismissCurrent(currentBadge)}
                className="absolute top-2 right-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-6 h-6 flex items-center justify-center transition-colors z-10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              <div className={`w-16 h-16 shrink-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border ${isSandbox ? 'border-[#ff912d]/60' : 'border-[#ffb703]/50'} relative shadow-inner z-10 p-2`}>
                <div className={`absolute -top-1 -right-1 ${isSandbox ? 'bg-[#ff912d]' : 'bg-[#ffb703]'} text-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg z-20`}>
                  <span className="font-bold text-[10px]">★</span>
                </div>
                {isSandbox ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/30 to-amber-600/30 rounded-lg shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff912d] drop-shadow-[0_0_10px_rgba(255,145,45,0.9)]">
                      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
                    </svg>
                  </div>
                ) : isTitle ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/30 to-purple-600/30 rounded-lg shadow-inner">
                    <QuillIcon className="w-8 h-8 text-[#ffb703] drop-shadow-[0_0_10px_rgba(255,183,3,0.9)]" />
                  </div>
                ) : currentBadge.data?.badgeImage || (currentBadge.data?.badgeIcon && (currentBadge.data.badgeIcon.startsWith('/') || currentBadge.data.badgeIcon.startsWith('data:') || currentBadge.data.badgeIcon.startsWith('http'))) ? (
                  <img src={currentBadge.data?.badgeImage || currentBadge.data?.badgeIcon} alt="Achievement" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(255,183,3,0.5)]" />
                ) : isLevelUp ? (
                  <div className="w-full h-full flex items-center justify-center bg-[#ffb703] rounded-full shadow-inner">
                    <span className="text-black font-black text-2xl drop-shadow-sm">{currentBadge.data?.level || currentBadge.data?.badgeName?.replace(/\D/g, '') || ''}</span>
                  </div>
                ) : (
                  <span className="text-[#ff912d] font-bold text-2xl">{currentBadge.data?.badgeIcon || '🏆'}</span>
                )}
              </div>

              <div className="flex-1 flex flex-col z-10 pr-4">
                <span className={`${isSandbox ? 'text-[#ff912d]' : 'text-[#ffb703]'} font-sans font-bold text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1.5`}>
                  {isSandbox ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff912d] animate-pulse" />
                      Feature Unlocked!
                    </>
                  ) : isTitle ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffb703] animate-pulse" />
                      Title Unlocked!
                    </>
                  ) : isLevelUp ? (
                    'Level Up!'
                  ) : (
                    'Achievement Unlocked!'
                  )}
                </span>
                <h4 className="text-white font-bold text-sm leading-tight mb-1 drop-shadow-md">
                  {isSandbox ? "Code Sandbox Unlocked!" : `"${currentBadge.data?.titleName || currentBadge.data?.badgeName || "Secret Achievement"}"`}
                </h4>
                <p className="text-white/60 text-xs leading-tight line-clamp-2">
                  {isSandbox
                    ? (currentBadge.data?.message || "You've completed all Moon missions! The Code Sandbox is now unlocked in the sidebar.")
                    : isTitle
                    ? (currentBadge.data?.planetName 
                        ? `Awarded for conquering ${currentBadge.data.planetName}! Equip it in your Profile.`
                        : currentBadge.data?.description || `Congratulations! You unlocked the title "${currentBadge.data?.titleName || ''}".`)
                    : isLevelUp 
                    ? `Congratulations! You have reached Level ${currentBadge.data?.badgeName?.replace(/\D/g, '') || ''}.` 
                    : `Congratulations! You have achieved "${currentBadge.data?.badgeName}".`}
                </p>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
