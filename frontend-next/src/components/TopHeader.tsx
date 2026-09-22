"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SessionContext, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Brain, AlertTriangle } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import VerifyModal from './VerifyModal';

interface TopHeaderProps {
  title: string;
}

export default function TopHeader({ title }: TopHeaderProps) {
  const router = useRouter();
  const sessionContext = React.useContext(SessionContext);
  const session = sessionContext?.data;
  const user = session?.user as any;
  const hasTakenAptitudeTest = user?.hasTakenAptitudeTest === true;
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  
  const bellRef = useRef<HTMLButtonElement>(null);
  const isInitialLoad = useRef(true);
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

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (showLoading) setNotifsLoading(true);
    try {
      const res = await fetch(`/api/notifications?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setNotifsLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(prev => {
          if (!isInitialLoad.current && data.count > prev) {
            if (localStorage.getItem('setting_sounds') !== 'false' && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(e => {
                if (e.name !== 'NotAllowedError') {
                  console.error('Audio playback failed:', e);
                }
              });
            }
          }
          return data.count || 0;
        });
        isInitialLoad.current = false;
      }
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications(true);
      fetchUnreadCount();

      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 30000);

      const handleUpdate = () => {
        fetchNotifications();
        fetchUnreadCount();
      };
      window.addEventListener('notifications_updated', handleUpdate);

      return () => {
        clearInterval(interval);
        window.removeEventListener('notifications_updated', handleUpdate);
      };
    }
  }, [session, fetchNotifications, fetchUnreadCount]);

  const handleDismissRequest = async (notif: any) => {
    if (processingIds.includes(notif.id)) return;
    setProcessingIds(prev => [...prev, notif.id]);

    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    
    try {
      await fetch(`/api/notifications/${notif.id}`, { method: 'DELETE' });
      window.dispatchEvent(new Event('notifications_updated'));
    } catch (err) {
      console.error(err);
      fetchNotifications();
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== notif.id));
    }
  };

  const handleBellClick = async () => {
    const willOpen = !showNotifDropdown;
    setShowNotifDropdown(willOpen);
    if (willOpen) {
      fetchNotifications();
      if (unreadCount > 0) {
        try {
          await fetch('/api/notifications/read-all', { method: 'POST' });
          window.dispatchEvent(new Event('notifications_updated'));
        } catch (err) {
          console.error('Failed to mark notifications as read', err);
        }
      }
    }
  };

  const handleAptitudeClick = () => {
    router.push('/aptitude-test?openModal=true');
  };

  const isAdmin = (session?.user as any)?.type === 'admin';
  const headerBgClass = isAdmin 
    ? "h-24 px-8 flex items-center justify-between border-b border-white/10 bg-[#180729] flex-shrink-0 relative z-50" 
    : "h-24 px-8 flex items-center justify-between border-b border-white/5 bg-[#150524]/40 backdrop-blur-md flex-shrink-0 relative z-50";

  return (
    <header className={headerBgClass}>
      <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
      
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Verification Button for Unverified Users */}
        {session?.user && (session.user as any).type !== 'admin' && !(session.user as any).isVerified && (
          <button 
            onClick={() => setIsVerifyModalOpen(true)}
            className="hidden md:flex items-center gap-2 bg-[#ff912d]/10 hover:bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/30 font-bold text-xs uppercase tracking-widest py-2 px-4 rounded-full transition-all active:scale-95 shadow-[0_0_10px_rgba(255,145,45,0.1)] cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Verify Email
          </button>
        )}
        
        {/* Top Bar Icon Controls: Aptitude Test & Notifications */}
        {session?.user && (session.user as any).type !== 'admin' && (
          <div className="flex items-center gap-3">
            {/* Aptitude Test Icon */}
            <div className="relative group/aptitude">
              <button
                onClick={handleAptitudeClick}
                className={`relative p-2.5 rounded-full transition-all cursor-pointer active:scale-95 border ${
                  hasTakenAptitudeTest
                    ? 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                    : 'bg-[#ff912d]/15 border-[#ff912d]/50 text-[#ff912d] animate-pulse shadow-[0_0_15px_rgba(255,145,45,0.4)]'
                }`}
                title={hasTakenAptitudeTest ? "Aptitude Diagnostics (Completed)" : "Please complete your Aptitude Test first."}
              >
                <Brain className="w-5 h-5" />
              </button>

              {/* Futuristic Glassmorphic Dropdown Container (Zero-gap Hover Bridge) */}
              <div className="absolute right-0 top-full pt-2 w-60 z-[60] opacity-0 group-hover/aptitude:opacity-100 transition-opacity duration-150 pointer-events-none group-hover/aptitude:pointer-events-auto">
                <div className="p-4 rounded-xl bg-[#130927]/98 backdrop-blur-xl border border-[#ff912d]/40 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(255,145,45,0.25)] flex flex-col items-center text-center">
                  <AlertTriangle size={18} className="text-[#ff912d] mb-1 animate-pulse" />
                  <h4 className="text-white font-bold text-sm tracking-wide mb-0.5 font-display">
                    {hasTakenAptitudeTest ? "Aptitude Verified" : "Diagnostic Pending"}
                  </h4>
                  <p className="text-gray-400 text-xs mb-3">
                    {hasTakenAptitudeTest ? "System calibrated." : "Calibration required."}
                  </p>
                  {!hasTakenAptitudeTest && (
                    <button
                      onClick={handleAptitudeClick}
                      className="w-full py-2 bg-[#ff912d] hover:bg-[#ff912d]/90 text-[#130927] font-black text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_12px_rgba(255,145,45,0.4)] cursor-pointer active:scale-95"
                    >
                      START TEST
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notification Bell */}
            <button 
              ref={bellRef} 
              onClick={handleBellClick} 
              className="relative p-2.5 bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        )}

      </div>

      {showNotifDropdown && (
        <NotificationDropdown 
          notifications={notifications}
          loadingNotifs={notifsLoading}
          onDismiss={handleDismissRequest}
          onClose={() => setShowNotifDropdown(false)}
          processingIds={processingIds}
          anchorRef={bellRef}
        />
      )}

      <VerifyModal isOpen={isVerifyModalOpen} onClose={() => setIsVerifyModalOpen(false)} />

    </header>
  );
}

