"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface NotificationDropdownProps {
  notifications: any[];
  loadingNotifs: boolean;
  onAccept: (notif: any) => void;
  onReject: (notif: any) => void;
  onClose: () => void;
  processingIds: string[];
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export default function NotificationDropdown({
  notifications,
  loadingNotifs,
  onAccept,
  onReject,
  onClose,
  processingIds,
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
      className="fixed z-[99999] w-80 bg-[#1e0a2d] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
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
                    {notif.sender?.avatar_url ? (
                      <Image src={notif.sender.avatar_url} alt="" width={40} height={40} className="object-cover" />
                    ) : (
                      <span className="text-[#ff912d] font-bold text-lg">{(notif.sender?.displayName || notif.sender?.name)?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-1">
                    <p className="text-sm text-white/90 leading-tight">
                      <strong className="text-white font-bold">{notif.sender?.displayName || notif.sender?.name}</strong>
                      {notif.type === 'friend_request' && ' sent you a friend request.'}
                      {notif.type === 'friend_accepted' && ' accepted your friend request.'}
                    </p>
                    <span className="text-xs text-white/40">{timeAgo(notif.created_at)}</span>
                    
                    {notif.type === 'friend_request' && (
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => onAccept(notif)}
                          disabled={isProcessing}
                          className="bg-green-500 hover:bg-green-400 text-green-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-50 flex-1"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => onReject(notif)}
                          disabled={isProcessing}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-50 flex-1"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isUnread && <div className="w-2 h-2 rounded-full bg-[#ff912d] mt-1 flex-shrink-0"></div>}
                </div>
              );
            })}
          </div>
        )}
        
        {hasMore && (
          <button className="w-full py-3 text-center text-xs text-[#ff912d] font-bold hover:bg-white/5 transition-colors">
            View All Notifications
          </button>
        )}
      </div>
    </div>
  );

  return createPortal(portalContent, document.body);
}
