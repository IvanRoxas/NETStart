"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Search, ChevronLeft, ChevronRight, X, UserIcon, Check,
    Settings, Brain, Rocket, Trash2, CheckSquare,
    Sparkles, Trophy, Users, BookOpen, Clock, Calendar, History, RotateCcw
} from 'lucide-react';
import TopHeader from '@/components/TopHeader';
import ConfirmModal from '@/components/ConfirmModal';
import QuillIcon from '@/components/icons/QuillIcon';
import './notifications.css';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'warning'; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bg = type === 'success' ? 'bg-[#ff912d]' : type === 'warning' ? 'bg-amber-600' : 'bg-red-500';

    return (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl font-medium text-white shadow-xl z-50 flex items-center gap-3 animate-fade-in ${bg}`}>
            {type === 'success' ? <Check size={18} /> : <X size={18} />}
            {message}
        </div>
    );
};

type CategoryType = 'all' | 'social' | 'rewards' | 'learning' | 'system';
type SortOrderType = 'newest' | 'oldest';

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
    const [sortOrder, setSortOrder] = useState<SortOrderType>('newest');
    
    // Batch selection state
    const [selectMode, setSelectMode] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Processing & modals
    const [processingIds, setProcessingIds] = useState<string[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [banner, setBanner] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel?: string;
        variant?: 'danger' | 'warning' | 'primary';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 15;

    const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        async function fetchUserBanner() {
            try {
                const res = await fetch(`/api/profile?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.user?.banner) {
                        setBanner(data.user.banner);
                    }
                }
            } catch (err) {
                console.error('Failed to load user background banner:', err);
            }
        }
        fetchUserBanner();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/notifications?t=${Date.now()}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();

            const rawList = data.results || data.notifications || data || [];
            const filteredList = Array.isArray(rawList)
                ? rawList.filter((n: any) => n.type !== 'daily_task_completed' && n.notification_type !== 'daily_task_completed')
                : [];
            setNotifications(filteredList);
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

    // Helper: Categorize notifications
    const getNotificationCategory = (notif: any): 'social' | 'rewards' | 'learning' | 'system' => {
        const type = (notif.type || notif.notification_type || '').toLowerCase();
        if (type.includes('friend')) return 'social';
        if (type.includes('achievement') || type.includes('level') || type.includes('reward') || type.includes('gear')) return 'rewards';
        if (type.includes('planet') || type.includes('aptitude') || type.includes('module') || type.includes('mission')) return 'learning';
        return 'system';
    };

    // Helper: relative time
    const timeAgo = (dateStr: string) => {
        if (!dateStr) return 'Just now';
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

    // Helper: Timeline grouping bucket
    const getTimelineGroup = (dateStr: string): 'Today' | 'Yesterday' | 'This Week' | 'Earlier' => {
        if (!dateStr) return 'Today';
        const date = new Date(dateStr);
        const now = new Date();

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = startOfToday - 86400000;
        const startOfWeek = startOfToday - (6 * 86400000);
        const itemTime = date.getTime();

        if (itemTime >= startOfToday) return 'Today';
        if (itemTime >= startOfYesterday) return 'Yesterday';
        if (itemTime >= startOfWeek) return 'This Week';
        return 'Earlier';
    };

    // Notification Titles
    const getNotifTitle = (notif: any) => {
        const type = notif.type || notif.notification_type || '';
        if (type === 'planet_unlocked') return 'Planet Unlocked!';
        if (type === 'title_unlocked') return 'Title Unlocked!';
        if (type === 'system_verify_reward') return 'Verification Reward!';
        if (type === 'aptitude_completed') return 'Aptitude Test';
        if (type === 'achievement_unlocked') return 'Achievement Unlocked!';
        if (type === 'level_up') return 'Level Up!';
        if (type === 'friend_request') return notif.sender?.name || notif.sender?.username || 'Friend Request';
        return notif.sender?.name || notif.sender?.username || 'System Notice';
    };

    // Notification Descriptions
    const getNotifDesc = (notif: any) => {
        const type = notif.type || notif.notification_type || '';
        if (type === 'planet_unlocked') {
            return `${notif.data?.planetName || 'A new planet'} is now accessible. Head to Missions to explore it!`;
        }
        if (type === 'title_unlocked') {
            return `You unlocked the title "${notif.data?.titleName || notif.data?.badgeName || 'New Title'}"${notif.data?.planetName ? ` for conquering ${notif.data.planetName}` : ''}! Equip it on your Profile page.`;
        }
        if (type === 'system_verify_reward') {
            return `You received ${notif.data?.amount || 225} Gears for verifying your account.`;
        }
        if (type === 'aptitude_completed') {
            return notif.data?.message || 'Your aptitude test is ready! Check it out to see your recommended learning path.';
        }
        if (type === 'friend_request') {
            return notif.read_at ? 'Friend request handled.' : 'Sent you a friend request!';
        }
        if (type === 'achievement_unlocked') {
            return `You unlocked the "${notif.data?.badgeName || 'Achievement'}" achievement!`;
        }
        if (type === 'level_up') {
            return notif.data?.badgeName || 'You reached a new level!';
        }
        return notif.data?.message || notif.message || 'New notification received.';
    };

    // Category Counts
    const counts = useMemo(() => {
        const total = notifications.length;
        const social = notifications.filter(n => getNotificationCategory(n) === 'social').length;
        const rewards = notifications.filter(n => getNotificationCategory(n) === 'rewards').length;
        const learning = notifications.filter(n => getNotificationCategory(n) === 'learning').length;
        const system = notifications.filter(n => getNotificationCategory(n) === 'system').length;
        return { total, social, rewards, learning, system };
    }, [notifications]);

    // Filter & Sort Logic
    const filteredAndSortedList = useMemo(() => {
        let list = [...notifications];

        // 1. Category Filter
        if (categoryFilter !== 'all') {
            list = list.filter(n => getNotificationCategory(n) === categoryFilter);
        }

        // 2. Search Query
        if (searchQuery.trim()) {
            const sq = searchQuery.toLowerCase().trim();
            list = list.filter(n => {
                const title = getNotifTitle(n).toLowerCase();
                const desc = getNotifDesc(n).toLowerCase();
                const sender = (n.sender?.name || n.sender?.username || '').toLowerCase();
                const badge = (n.data?.badgeName || '').toLowerCase();
                const planet = (n.data?.planetName || '').toLowerCase();
                return title.includes(sq) || desc.includes(sq) || sender.includes(sq) || badge.includes(sq) || planet.includes(sq);
            });
        }

        // 3. Date Sorting
        list.sort((a, b) => {
            const timeA = new Date(a.created_at || a.createdAt || 0).getTime();
            const timeB = new Date(b.created_at || b.createdAt || 0).getTime();
            return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
        });

        return list;
    }, [notifications, categoryFilter, searchQuery, sortOrder]);

    // Pagination calculations
    const totalCount = filteredAndSortedList.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredAndSortedList.slice(start, start + pageSize);
    }, [filteredAndSortedList, currentPage]);

    // Group paginated items into timeline sections
    const paginatedGrouped = useMemo(() => {
        const groups: { [key in 'Today' | 'Yesterday' | 'This Week' | 'Earlier']?: any[] } = {};
        paginatedItems.forEach(notif => {
            const groupKey = getTimelineGroup(notif.created_at || notif.createdAt);
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey]!.push(notif);
        });

        const orderedGroupKeys: ('Today' | 'Yesterday' | 'This Week' | 'Earlier')[] = [
            'Today', 'Yesterday', 'This Week', 'Earlier'
        ];

        return orderedGroupKeys
            .filter(key => groups[key] && groups[key]!.length > 0)
            .map(key => ({
                title: key,
                items: groups[key]!
            }));
    }, [paginatedItems]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryFilter, searchQuery, sortOrder]);

    // Actions
    const handleClearAll = () => {
        if (notifications.length === 0) {
            showToast('No notifications to clear.', 'warning');
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Clear All Notifications',
            message: `Are you sure you want to delete all ${notifications.length} notification${notifications.length > 1 ? 's' : ''}? This action cannot be undone.`,
            confirmLabel: 'Clear All',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    const res = await fetch('/api/notifications/clear-all', { method: 'POST' });
                    if (!res.ok) throw new Error();
                    
                    const count = notifications.length;
                    setNotifications([]);
                    setSelectedIds([]);
                    showToast(`Cleared ${count} notification${count > 1 ? 's' : ''}.`);
                    window.dispatchEvent(new Event('notifications_updated'));
                } catch (err) {
                    showToast('Failed to clear notifications.', 'error');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleDismiss = async (notif: any) => {
        if (processingIds.includes(notif.id)) return;
        setProcessingIds(prev => [...prev, notif.id]);

        // Optimistic remove
        setNotifications(prev => prev.filter(n => n.id !== notif.id));
        setSelectedIds(prev => prev.filter(id => id !== notif.id));

        try {
            const res = await fetch(`/api/notifications/${notif.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            showToast('Notification removed.');
            window.dispatchEvent(new Event('notifications_updated'));
        } catch (err) {
            showToast('Failed to dismiss notification.', 'error');
            fetchNotifications(); // revert
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== notif.id));
        }
    };

    const handleAccept = async (notif: any) => {
        if (processingIds.includes(notif.id)) return;
        setProcessingIds(prev => [...prev, notif.id]);

        try {
            await fetch(`/api/friends/accept/${notif.sender_id}`, { method: 'POST' });
            await fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' });
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n));
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
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
            showToast('Friend request rejected.');
            window.dispatchEvent(new Event('notifications_updated'));
        } catch (err) {
            showToast('Failed to reject request.', 'error');
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== notif.id));
        }
    };

    const handleView = async (notif: any) => {
        const type = notif.type || notif.notification_type;
        if (type === 'achievement_unlocked') {
            router.push('/achievements');
        } else if (type === 'aptitude_completed') {
            router.push('/aptitude-test');
        } else if (type === 'planet_unlocked') {
            router.push('/modules');
        } else if (type === 'title_unlocked') {
            router.push('/profile');
        } else if (notif.sender_id) {
            router.push(`/profile/${notif.sender_id}`);
        }
    };

    // Batch operations
    const handleSelectToggle = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAllVisible = () => {
        const visibleIds = paginatedItems.map(n => n.id);
        const allSelected = visibleIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
        }
    };

    const handleBatchDelete = () => {
        if (selectedIds.length === 0) return;

        setConfirmModal({
            isOpen: true,
            title: 'Delete Selected Notifications',
            message: `Are you sure you want to delete ${selectedIds.length} notification${selectedIds.length > 1 ? 's' : ''}?`,
            confirmLabel: 'Delete Selected',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await fetch('/api/notifications/batch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'delete', ids: selectedIds })
                    });

                    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
                    showToast(`Deleted ${selectedIds.length} notification${selectedIds.length > 1 ? 's' : ''}.`);
                    setSelectedIds([]);
                    setSelectMode(false);
                    window.dispatchEvent(new Event('notifications_updated'));
                } catch (err) {
                    showToast('Failed to delete selected notifications.', 'error');
                } finally {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    return (
        <main className="flex-1 flex flex-col z-10 w-full h-full overflow-hidden bg-[#270d3c] relative">
            {/* Background Override Layer */}
            {banner && (
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 transition-all duration-500"
                    style={{ backgroundImage: `url("${banner}")` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90 pointer-events-none" />
                </div>
            )}

            <TopHeader title="Notifications" />

            <div className="notifications-page-wrapper flex-1 overflow-y-auto relative z-10">
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

                {/* Custom Confirm Modal */}
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    confirmLabel={confirmModal.confirmLabel}
                    variant={confirmModal.variant}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                />

                {/* Search Bar */}
                <div className="neo-search-notif">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search notifications, senders, or rewards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button 
                            type="button" 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Header Row: Title & Action Buttons */}
                <div className="notifications-header-row">
                    <div className="flex items-center gap-3">
                        <h1>Notifications</h1>
                    </div>

                    <div className="notif-header-actions">
                        <button
                            type="button"
                            className="notif-action-btn danger"
                            disabled={notifications.length === 0}
                            onClick={handleClearAll}
                            title="Clear all notifications"
                        >
                            <Trash2 size={16} /> Clear All
                        </button>

                        <button
                            type="button"
                            className={`notif-action-btn ${selectMode ? 'active' : ''}`}
                            onClick={() => {
                                setSelectMode(!selectMode);
                                if (selectMode) setSelectedIds([]);
                            }}
                            title="Toggle batch selection mode"
                        >
                            <CheckSquare size={16} /> {selectMode ? 'Exit Select' : 'Select'}
                        </button>
                    </div>
                </div>

                {/* Toolbar: Category Tabs + Sort Controls */}
                <div className="notif-toolbar">
                    {/* Filter Tabs */}
                    <div className="notif-filter-tabs">
                        <button
                            type="button"
                            className={`notif-tab ${categoryFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setCategoryFilter('all')}
                        >
                            All
                            <span className="notif-tab-count">{counts.total}</span>
                        </button>

                        <button
                            type="button"
                            className={`notif-tab ${categoryFilter === 'social' ? 'active' : ''}`}
                            onClick={() => setCategoryFilter('social')}
                        >
                            <Users size={14} /> Social
                            <span className="notif-tab-count">{counts.social}</span>
                        </button>

                        <button
                            type="button"
                            className={`notif-tab ${categoryFilter === 'rewards' ? 'active' : ''}`}
                            onClick={() => setCategoryFilter('rewards')}
                        >
                            <Trophy size={14} /> Rewards
                            <span className="notif-tab-count">{counts.rewards}</span>
                        </button>

                        <button
                            type="button"
                            className={`notif-tab ${categoryFilter === 'learning' ? 'active' : ''}`}
                            onClick={() => setCategoryFilter('learning')}
                        >
                            <BookOpen size={14} /> Learning
                            <span className="notif-tab-count">{counts.learning}</span>
                        </button>

                        <button
                            type="button"
                            className={`notif-tab ${categoryFilter === 'system' ? 'active' : ''}`}
                            onClick={() => setCategoryFilter('system')}
                        >
                            <Settings size={14} /> System
                            <span className="notif-tab-count">{counts.system}</span>
                        </button>
                    </div>

                    {/* Sort Controls */}
                    <div className="notif-sort-group">
                        <select
                            className="notif-sort-select"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as SortOrderType)}
                            aria-label="Sort notifications by date"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>

                        {/* Pagination indicator */}
                        {totalCount > 0 && (
                            <div className="neo-pagination ml-2">
                                <span className="pagination-text">
                                    {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                                </span>
                                <div className="pagination-controls">
                                    <button
                                        type="button"
                                        className="neo-btn-icon"
                                        disabled={currentPage <= 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        title="Previous page"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        className="neo-btn-icon"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        title="Next page"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications List Container */}
                <div className="notifications-list-container">
                    {loading ? (
                        <div className="notif-loading">Loading notifications...</div>
                    ) : filteredAndSortedList.length === 0 ? (
                        <div className="notif-empty flex flex-col items-center justify-center gap-3">
                            <Rocket size={42} className="text-[#ff912d]/70 mb-1 animate-pulse" />
                            <p className="text-lg font-bold text-white/90">
                                {searchQuery || categoryFilter !== 'all'
                                    ? 'No notifications match your current filter.'
                                    : "You're all caught up! No notifications in your orbit."}
                            </p>
                            {(searchQuery || categoryFilter !== 'all') && (
                                <button
                                    type="button"
                                    className="notif-action-btn primary mt-1"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setCategoryFilter('all');
                                    }}
                                >
                                    <RotateCcw size={14} /> Reset Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        paginatedGrouped.map(group => (
                            <section key={group.title} className="timeline-section">
                                {/* Distinctive Color-Coded Header with Glowing Capsule & Accent Line */}
                                <div className="timeline-header-wrap">
                                    <div className={`timeline-badge-capsule timeline-${group.title.toLowerCase().replace(/\s+/g, '-')}`}>
                                        <span className="timeline-badge-icon">
                                            {group.title === 'Today' ? <Sparkles size={16} /> :
                                             group.title === 'Yesterday' ? <Calendar size={16} /> :
                                             group.title === 'This Week' ? <Clock size={16} /> :
                                             <History size={16} />}
                                        </span>
                                        <span className="timeline-badge-text">{group.title}</span>
                                        <span className="timeline-badge-count">{group.items.length}</span>
                                    </div>
                                    <div className={`timeline-accent-line timeline-line-${group.title.toLowerCase().replace(/\s+/g, '-')}`} />
                                </div>

                                {group.items.map(notif => {
                                    const isProcessing = processingIds.includes(notif.id);
                                    const isSelected = selectedIds.includes(notif.id);
                                    const category = getNotificationCategory(notif);

                                    return (
                                        <div 
                                            key={notif.id} 
                                            className={`neo-notif-card flex-row ${isSelected ? 'is-selected' : ''}`}
                                        >
                                            {/* Checkbox (if select mode active) */}
                                            {selectMode && (
                                                <div className="notif-checkbox-wrap">
                                                    <div 
                                                        className={`notif-checkbox ${isSelected ? 'checked' : ''}`}
                                                        onClick={() => handleSelectToggle(notif.id)}
                                                    >
                                                        {isSelected && <Check size={14} />}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Avatar / Icon */}
                                            <div className="neo-notif-avatar">
                                                {(notif.type === 'planet_unlocked' || notif.notification_type === 'planet_unlocked') ? (
                                                    <img
                                                        src={(() => {
                                                            const name = String(notif.data?.planetName || notif.data?.planetId || '').toLowerCase();
                                                            const rawSrc = String(notif.data?.planetSrc || notif.data?.planetImage || notif.data?.iconUrl || notif.data?.image || '');
                                                            if (name.includes('mars')) return '/assets/planets/celestial/Mars.svg';
                                                            if (name.includes('moon')) return '/assets/planets/celestial/Planet 7.svg';
                                                            if (name.includes('venus')) return '/assets/planets/celestial/Venus.svg';
                                                            if (name.includes('mercury')) return '/assets/planets/celestial/Mercury.svg';
                                                            if (name.includes('jupiter')) return '/assets/planets/celestial/Jupiter.svg';
                                                            if (name.includes('saturn')) return '/assets/planets/celestial/Saturn.svg';
                                                            if (name.includes('earth')) return '/assets/planets/celestial/Earth.svg';
                                                            if (rawSrc && (rawSrc.startsWith('/') || rawSrc.startsWith('http'))) {
                                                                if (rawSrc.startsWith('/assets/planets/') && !rawSrc.includes('/celestial/')) {
                                                                    const filename = rawSrc.split('/').pop();
                                                                    return `/assets/planets/celestial/${filename}`;
                                                                }
                                                                return rawSrc;
                                                            }
                                                            return '/assets/planets/celestial/Mars.svg';
                                                        })()}
                                                        alt={notif.data?.planetName || 'Planet'}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/assets/planets/celestial/Mars.svg';
                                                        }}
                                                    />
                                                ) : (notif.type === 'system_verify_reward' || notif.notification_type === 'system_verify_reward') ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-[#ff912d]/20 rounded-full shadow-inner text-[#ff912d]">
                                                        <Settings size={28} />
                                                    </div>
                                                ) : (notif.type === 'title_unlocked' || notif.notification_type === 'title_unlocked') ? (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 via-purple-600/30 to-amber-500/10 rounded-full shadow-inner text-[#ffb703]">
                                                        <QuillIcon className="w-7 h-7 text-[#ffb703] drop-shadow-[0_0_8px_rgba(255,183,3,0.8)]" />
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
                                                ) : notif.sender?.avatar_url ? (
                                                    <img src={notif.sender.avatar_url} alt="" />
                                                ) : (
                                                    <div className="neo-avatar-placeholder"><UserIcon size={24} /></div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="neo-notif-content">
                                                <div className="neo-notif-title">
                                                    <span className="neo-notif-name">
                                                        {getNotifTitle(notif)}
                                                    </span>
                                                    <span className={`notif-category-tag ${category}`}>
                                                        {category}
                                                    </span>
                                                    <span className="neo-notif-time">
                                                        {timeAgo(notif.created_at || notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="neo-notif-desc">
                                                    {getNotifDesc(notif)}
                                                </p>
                                            </div>

                                            {/* Quick Actions & Navigation */}
                                            <div className="neo-notif-actions">
                                                {/* Friend request specific buttons */}
                                                {(notif.type === 'friend_request' || notif.notification_type === 'friend_request') && !notif.read_at ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="neo-btn-accept"
                                                            disabled={isProcessing}
                                                            onClick={() => handleAccept(notif)}
                                                        >
                                                            <Check size={16} /> Accept
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="neo-btn-reject"
                                                            disabled={isProcessing}
                                                            onClick={() => handleReject(notif)}
                                                        >
                                                            <X size={16} /> Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* Direct Jump / View */}
                                                        <button
                                                            type="button"
                                                            className="neo-btn-view"
                                                            disabled={isProcessing}
                                                            onClick={() => handleView(notif)}
                                                        >
                                                            View
                                                        </button>

                                                        {/* Dismiss / Delete */}
                                                        <button
                                                            type="button"
                                                            className="notif-quick-btn delete"
                                                            disabled={isProcessing}
                                                            onClick={() => handleDismiss(notif)}
                                                            title="Delete notification"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        ))
                    )}
                </div>

                {/* Floating Batch Action Dock */}
                {selectedIds.length > 0 && (
                    <div className="batch-dock">
                        <div className="batch-dock-info">
                            <CheckSquare size={18} className="text-[#ff912d]" />
                            <span>{selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected</span>
                        </div>

                        <div className="batch-dock-actions">
                            <button
                                type="button"
                                className="notif-action-btn"
                                onClick={handleSelectAllVisible}
                            >
                                {paginatedItems.every(n => selectedIds.includes(n.id)) ? 'Deselect Page' : 'Select Page'}
                            </button>

                            <button
                                type="button"
                                className="notif-action-btn danger"
                                onClick={handleBatchDelete}
                            >
                                <Trash2 size={15} /> Delete
                            </button>

                            <button
                                type="button"
                                className="notif-action-btn"
                                onClick={() => setSelectedIds([])}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
