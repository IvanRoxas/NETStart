"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Settings } from 'lucide-react';

interface NotificationDropdownProps {
  notifications: any[];
  loadingNotifs?: boolean;
  onDismiss?: (notif: any) => void;
  onClose: () => void;
  processingIds?: string[];
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export default function NotificationDropdown({
  notifications,
  loadingNotifs,
  onDismiss,
  onClose,
  processingIds = [],
  anchorRef
}: NotificationDropdownProps) {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right - 20),
      });
    }
  }, [anchorRef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Small timeout to prevent immediate close if clicking the bell itself
      setTimeout(() => {
        const portalEl = document.getElementById('notif-portal-content');
        if (portalEl && !portalEl.contains(e.target as Node)) {
          // ensure we didn't click the bell
          if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
            onClose();
          }
        }
      }, 10);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchorRef]);

  if (!mounted) return null;

  const displayedNotifs = notifications.slice(0, 5);
  const hasMore = notifications.length > 5;

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  const portalContent = (
    <div 
      id="notif-portal-content"
      className="fixed z-[99999] w-[420px] bg-[#1e0a2d] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
      style={{ top: pos.top, right: pos.right }}
    >
      <div className="bg-[#361d57] px-4 py-3 border-b border-white/5">
        <h4 className="text-white font-bold text-sm">Notifications</h4>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {loadingNotifs ? (
          <div className="p-4 flex flex-col gap-3">
             <div className="h-12 bg-white/5 animate-pulse rounded-xl"></div>
             <div className="h-12 bg-white/5 animate-pulse rounded-xl"></div>
          </div>
        ) : displayedNotifs.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-white/40 text-center gap-2">
            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <p className="text-sm">No new notifications right now.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {displayedNotifs.map((notif: any) => {
              const isProcessing = processingIds.includes(notif.id);
              const isUnread = !notif.read_at;
              
              return (
                <div key={notif.id} className={`p-4 border-b border-white/5 flex gap-3 hover:bg-white/5 transition-colors ${isUnread ? 'bg-[#ff912d]/5' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-[#361d57] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#ff912d]/30">
                    {(notif.type === 'system_verify_reward' || notif.notification_type === 'system_verify_reward') ? (
                      <div className="w-full h-full flex items-center justify-center bg-[#ff912d]/20 rounded-full shadow-inner text-[#ff912d]">
                        <Settings size={20} />
                      </div>
                    ) : (notif.type === 'achievement_unlocked' || notif.notification_type === 'achievement_unlocked' || notif.type === 'level_up' || notif.notification_type === 'level_up') ? (
                       notif.data?.badgeImage ? (
                         <img src={notif.data.badgeImage} alt="" className="w-full h-full object-cover" />
                       ) : (notif.type === 'level_up' || notif.notification_type === 'level_up') ? (
                         <div className="w-full h-full flex items-center justify-center bg-[#ffb703] rounded-full shadow-inner">
                           <span className="text-black font-black text-lg">{notif.data?.level || notif.data?.badgeName?.replace(/\D/g, '') || ''}</span>
                         </div>
                       ) : (
                         <span className="text-[#ff912d] font-bold text-lg">{notif.data?.badgeIcon || '🏆'}</span>
                       )
                    ) : notif.sender?.avatar_url ? (
                      <Image src={notif.sender.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#ff912d] font-bold text-lg">{(notif.sender?.displayName || notif.sender?.name)?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-1 pr-24 relative">
                    <p className="text-sm text-white/90 leading-tight">
                      {(notif.type === 'system_verify_reward' || notif.notification_type === 'system_verify_reward') ? (
                        <>
                          <strong className="text-[#ff912d] font-bold block mb-0.5">Verification Reward!</strong>
                          You received {notif.data?.amount} Gears for verifying your account.
                        </>
                      ) : (notif.type === 'achievement_unlocked' || notif.notification_type === 'achievement_unlocked') ? (
                        <>
                          <strong className="text-[#ff912d] font-bold block mb-0.5">Achievement Unlocked!</strong>
                          You earned "{notif.data?.badgeName}".
                        </>
                      ) : (notif.type === 'level_up' || notif.notification_type === 'level_up') ? (
                        <>
                          <strong className="text-[#ff912d] font-bold block mb-0.5">Level Up!</strong>
                          {notif.data?.badgeName}
                        </>
                      ) : (
                        <>
                          <strong className="text-white font-bold">{notif.sender?.displayName || notif.sender?.name || 'System'}</strong>
                          {notif.data?.message && <span className="block mt-1">{notif.data.message}</span>}
                        </>
                      )}
                    </p>
                    <span className="text-xs text-white/40">{timeAgo(notif.created_at)}</span>
                    
                  {isUnread && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#ff912d]"></div>}
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                       <button 
                         onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDismiss?.(notif); }}
                         disabled={isProcessing}
                         className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                       </button>
                    </div>
                </div>
                </div>
              );
            })}
          </div>
        )}
        
        <Link href="/notifications" onClick={onClose} className="block w-full py-3 border-t border-white/5 text-center text-xs text-[#ff912d] font-bold hover:bg-[#ff912d]/10 transition-colors">
          View All Notifications
        </Link>
      </div>
    </div>
  );

  return createPortal(portalContent, document.body);
}
