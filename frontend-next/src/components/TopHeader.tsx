"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { X } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import VerifyModal from './VerifyModal';

interface TopHeaderProps {
  title: string;
}

export default function TopHeader({ title }: TopHeaderProps) {
  const { data: session } = useSession();
  
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
      audioRef.current = new Audio('/Notification.mp3');
      audioRef.current.preload = 'auto';
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
            // Play sound if settings allow
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


  return (
    <header className="h-24 px-8 flex items-center justify-between border-b border-white/5 bg-[#150524]/40 backdrop-blur-md flex-shrink-0">
      <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
      
      <div className="flex items-center gap-6">

        {/* Verification Button for Unverified Users */}
        {session?.user && (session.user as any).type !== 'admin' && !(session.user as any).isVerified && (
          <button 
            onClick={() => setIsVerifyModalOpen(true)}
            className="hidden md:flex items-center gap-2 bg-[#ff912d]/10 hover:bg-[#ff912d]/20 text-[#ff912d] border border-[#ff912d]/30 font-bold text-xs uppercase tracking-widest py-2 px-4 rounded-full transition-all active:scale-95 shadow-[0_0_10px_rgba(255,145,45,0.1)]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Verify Email
          </button>
        )}
        
        {/* Notification Bell */}
        {session?.user && (session.user as any).type !== 'admin' && (
          <div className="flex items-center gap-2">
            <button ref={bellRef} onClick={handleBellClick} className="relative p-2.5 bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95">
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
