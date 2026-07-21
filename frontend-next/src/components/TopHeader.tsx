"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import NotificationDropdown from './NotificationDropdown';

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
  
  const bellRef = useRef<HTMLButtonElement>(null);

  const fetchNotifications = useCallback(async (showLoading = false) => {
    if (showLoading) setNotifsLoading(true);
    try {
      const res = await fetch('/api/notifications');
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
        setUnreadCount(data.count || 0);
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
        fetchUnreadCount();
        fetchNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [session, fetchNotifications, fetchUnreadCount]);

  const handleAcceptRequest = async (notif: any) => {
    if (processingIds.includes(notif.id)) return;
    setProcessingIds(prev => [...prev, notif.id]);

    setNotifications(prev => prev.map(n =>
      n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendshipId: notif.data?.friendshipId || '' })
      });
      await fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' });
      fetchNotifications();
      // RightSidebar will update itself via its own polling interval for friends
    } catch (err) {
      console.error(err);
      fetchNotifications();
      fetchUnreadCount();
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== notif.id));
    }
  };

  const handleRejectRequest = async (notif: any) => {
    if (processingIds.includes(notif.id)) return;
    setProcessingIds(prev => [...prev, notif.id]);

    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await fetch(`/api/friends?friendshipId=${notif.data?.friendshipId}`, { method: 'DELETE' });
      await fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' });
    } catch (err) {
      console.error(err);
      fetchNotifications();
      fetchUnreadCount();
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
          setUnreadCount(0);
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

        
        {/* Notification Bell */}
        <div className="flex items-center gap-2">
          <button ref={bellRef} onClick={handleBellClick} className="relative p-2.5 bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#1e0a2d]"></span>
            )}
          </button>
        </div>

      </div>

      {showNotifDropdown && (
        <NotificationDropdown 
          notifications={notifications}
          loadingNotifs={notifsLoading}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
          onClose={() => setShowNotifDropdown(false)}
          processingIds={processingIds}
          anchorRef={bellRef}
        />
      )}
    </header>
  );
}
