"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, X, UserIcon, Check, Settings, Brain, Rocket } from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import './notifications.css';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl font-medium text-white shadow-xl z-50 flex items-center gap-3 animate-fade-in ${
            type === 'success' ? 'bg-[#ff912d]' : 'bg-red-500'
        }`}>
            {type === 'success' ? <Check size={18} /> : <X size={18} />}
            {message}
        </div>
    );
};

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [pageInfo, setPageInfo] = useState({
        count: 0,
        next: null as string | null,
        previous: null as string | null,
        current: 1
    });
    const [processingIds, setProcessingIds] = useState<number[]>([]);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const fetchNotifications = async (url = '/api/notifications?page=1') => {
        setLoading(true);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            
            setNotifications(data.results || data.notifications || data || []);

            if (data.count !== undefined) {
                const urlObj = new URL(url, window.location.origin);
                const pageNum = parseInt(urlObj.searchParams.get('page') || '1');

                setPageInfo({
                    count: data.count,
                    next: data.next,
                    previous: data.previous,
                    current: pageNum
                });
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
            showToast('Failed to load notifications.', 'error');
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const handleUpdate = () => fetchNotifications();
        window.addEventListener('notifications_updated', handleUpdate);
        return () => window.removeEventListener('notifications_updated', handleUpdate);
    }, []);

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

    const handleAccept = async (notif: any) => {
        if (processingIds.includes(notif.id)) return;
        setProcessingIds(prev => [...prev, notif.id]);

        try {
            await fetch(`/api/friends/accept/${notif.sender_id}`, { method: 'POST' });
            await fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' });
            showToast('Friend request accepted!');
            window.dispatchEvent(new Event('notifications_updated'));
        } catch (err) {
            showToast('Failed to accept request.', 'error');
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== notif.id));
        }
    };

    const handleReject = async (notif: any) => {
        if (processingIds.includes(notif.id)) return;
        setProcessingIds(prev => [...prev, notif.id]);

        try {
            await fetch(`/api/friends/reject/${notif.sender_id}`, { method: 'POST' });
            await fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' });
            showToast('Friend request rejected.');
            window.dispatchEvent(new Event('notifications_updated'));
        } catch (err) {
            showToast('Failed to reject request.', 'error');
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== notif.id));
        }
    };

    const handleDismiss = async (notif: any) => {
        if (processingIds.includes(notif.id)) return;
        setProcessingIds(prev => [...prev, notif.id]);

        setNotifications(prev => prev.filter(n => n.id !== notif.id));

        try {
            const res = await fetch(`/api/notifications/${notif.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            window.dispatchEvent(new Event('notifications_updated'));
        } catch (err) {
            showToast('Failed to dismiss notification.', 'error');
            fetchNotifications(); // revert
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== notif.id));
        }
    };

    const handleView = async (notif: any) => {
        if (notif.type === 'achievement_unlocked' || notif.notification_type === 'achievement_unlocked') {
            router.push('/achievements');
        } else if (notif.type === 'aptitude_completed' || notif.notification_type === 'aptitude_completed') {
            router.push('/aptitude-test');
        } else if (notif.type === 'planet_unlocked' || notif.notification_type === 'planet_unlocked') {
            router.push('/modules');
        } else if (notif.sender_id) {
            router.push(`/profile/${notif.sender_id}`);
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (!searchQuery) return true;
        const text = notif.data?.message?.toLowerCase() || '';
        const name = (notif.sender?.username || '').toLowerCase();
        const sq = searchQuery.toLowerCase();
        return text.includes(sq) || name.includes(sq);
    });

    const pageSize = 10;
    const startItem = ((pageInfo.current - 1) * pageSize) + 1;
    const endItem = Math.min(pageInfo.current * pageSize, pageInfo.count);

    return (
        <main className="flex-1 flex flex-col z-10 w-full h-full overflow-hidden bg-[#270d3c]">
            <TopHeader title="Notifications" />
            <div className="notifications-page-wrapper flex-1 overflow-y-auto">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header & Search */}
            <div className="neo-search-notif">
                <Search className="search-icon" size={20} />
                <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            <div className="notifications-header-row">
                <h1>Notifications</h1>

                {pageInfo.count > 0 && (
                    <div className="neo-pagination">
                        <span className="pagination-text">{startItem}-{endItem} of {pageInfo.count}</span>
                        <div className="pagination-controls">
                            <button
                                className="neo-btn-icon"
                                disabled={!pageInfo.previous}
                                onClick={() => pageInfo.previous && fetchNotifications(pageInfo.previous)}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                className="neo-btn-icon"
                                disabled={!pageInfo.next}
                                onClick={() => pageInfo.next && fetchNotifications(pageInfo.next)}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="notifications-list-container">
                {loading ? (
                    <div className="notif-loading">Loading notifications...</div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="notif-empty">
                        <p>{searchQuery ? 'No notifications match your search.' : "You're all caught up! No new notifications."}</p>
                    </div>
                ) : (
                    filteredNotifications.map(notif => {
                        const isProcessing = processingIds.includes(notif.id);

                        return (
                            <div key={notif.id} className="neo-notif-card flex-row">
                                <div className="neo-notif-avatar">
                                    {(notif.type === 'planet_unlocked' || notif.notification_type === 'planet_unlocked') ? (
                                        notif.data?.planetSrc ? (
                                            <img src={notif.data.planetSrc} alt={notif.data.planetName || 'Planet'} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#ff912d]/20 rounded-full text-[#ff912d]">
                                                <Rocket size={28} />
                                            </div>
                                        )
                                    ) : (notif.type === 'system_verify_reward' || notif.notification_type === 'system_verify_reward') ? (
                                        <div className="w-full h-full flex items-center justify-center bg-[#ff912d]/20 rounded-full shadow-inner text-[#ff912d]">
                                            <Settings size={28} />
                                        </div>
                                    ) : (notif.type === 'aptitude_completed' || notif.notification_type === 'aptitude_completed') ? (
                                        <div className="w-full h-full flex items-center justify-center bg-[#ff912d]/20 rounded-full shadow-inner text-[#ff912d]">
                                            <Brain size={28} />
                                        </div>
                                    ) : (notif.type === 'achievement_unlocked' || notif.notification_type === 'achievement_unlocked' || notif.type === 'level_up' || notif.notification_type === 'level_up') ? (
                                        notif.data?.badgeImage ? (
                                            <img src={notif.data.badgeImage} alt={notif.data.badgeName} />
                                        ) : (notif.type === 'level_up' || notif.notification_type === 'level_up') ? (
                                            <div className="w-full h-full flex items-center justify-center bg-[#ffb703] rounded-full shadow-inner">
                                                <span className="text-black font-black text-3xl">{notif.data?.level || notif.data?.badgeName?.replace(/\D/g, '') || ''}</span>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full">
                                                <span className="text-[#ff912d] font-bold text-xl">{notif.data?.badgeIcon || '🏆'}</span>
                                            </div>
                                        )
                                    ) : notif.sender?.avatar_url
                                        ? <img src={notif.sender.avatar_url} alt="" />
                                        : <div className="neo-avatar-placeholder"><UserIcon size={24} /></div>
                                    }
                                </div>

                                <div className="neo-notif-content">
                                    <div className="neo-notif-title">
                                        <span className="neo-notif-name">
                                            {(notif.type === 'planet_unlocked' || notif.notification_type === 'planet_unlocked')
                                                ? 'Planet Unlocked!'
                                                : (notif.type === 'system_verify_reward' || notif.notification_type === 'system_verify_reward') 
                                                ? 'Verification Reward!' 
                                                : (notif.type === 'aptitude_completed' || notif.notification_type === 'aptitude_completed')
                                                ? 'Aptitude Test'
                                                : (notif.type === 'achievement_unlocked' || notif.notification_type === 'achievement_unlocked') 
                                                ? 'Achievement Unlocked!' 
                                                : (notif.type === 'level_up' || notif.notification_type === 'level_up') 
                                                ? 'Level Up!' 
                                                : (notif.sender?.username || notif.sender?.name || 'System')}
                                        </span>
                                        <span className="neo-notif-time">{timeAgo(notif.created_at || notif.createdAt)}</span>
                                    </div>
                                    <p className="neo-notif-desc">
                                        {(notif.type === 'planet_unlocked' || notif.notification_type === 'planet_unlocked')
                                            ? `${notif.data?.planetName || 'A new planet'} is now accessible. Head to Missions to explore it!`
                                            : (notif.type === 'system_verify_reward' || notif.notification_type === 'system_verify_reward')
                                            ? `You received ${notif.data?.amount} Gears for verifying your account.`
                                            : (notif.type === 'aptitude_completed' || notif.notification_type === 'aptitude_completed')
                                            ? (notif.data?.message?.startsWith('Diagnostic Completed') 
                                                ? 'Your aptitude test is ready! Check it out to see your recommended learning path.' 
                                                : (notif.data?.message || 'Your aptitude test is ready! Check it out to see your recommended learning path.'))
                                            : (notif.type === 'friend_request' || notif.notification_type === 'friend_request') && notif.read_at
                                            ? 'Friend request accepted.'
                                            : (notif.type === 'achievement_unlocked' || notif.notification_type === 'achievement_unlocked')
                                            ? `You unlocked the "${notif.data?.badgeName}" achievement!`
                                            : (notif.type === 'level_up' || notif.notification_type === 'level_up')
                                            ? notif.data?.badgeName || 'You leveled up!'
                                            : notif.data?.message || notif.message || 'New notification received.'}
                                    </p>
                                </div>

                                <div className="neo-notif-actions">
                                    {(notif.type === 'friend_request' || notif.notification_type === 'friend_request') && !notif.read_at ? (
                                        <>
                                            <button
                                                className="neo-btn-accept"
                                                disabled={isProcessing}
                                                onClick={() => handleAccept(notif)}
                                            >
                                                <Check size={16} /> Accept
                                            </button>
                                            <button
                                                className="neo-btn-reject"
                                                disabled={isProcessing}
                                                onClick={() => handleReject(notif)}
                                            >
                                                <X size={16} /> Reject
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="neo-btn-view"
                                                disabled={isProcessing}
                                                onClick={() => handleView(notif)}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="neo-btn-dismiss neo-btn-icon"
                                                disabled={isProcessing}
                                                onClick={() => handleDismiss(notif)}
                                                title="Dismiss notification"
                                            >
                                                <X size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
        </main>
    );
}
