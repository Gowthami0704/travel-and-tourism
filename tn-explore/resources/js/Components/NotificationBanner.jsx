import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Bell, CheckCircle2, Sparkles, X, ChevronRight, ArrowRight, Info, AlertTriangle } from 'lucide-react';

/**
 * Toast Notification: Renders once when a new notification or flash message arrives,
 * auto-dismisses after 6 seconds or via 'X', and respects theme tokens.
 * Old notifications live permanently inside the Bell Dropdown menu, NOT pinned over forms.
 */
export default function NotificationBanner() {
    const { notifications = [], flash = {} } = usePage().props;
    const [seenToastIds, setSeenToastIds] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('tn_seen_toast_ids') || '[]');
        } catch {
            return [];
        }
    });

    const [activeToast, setActiveToast] = useState(null);

    useEffect(() => {
        // Flash message priority
        if (flash?.success) {
            setActiveToast({
                id: 'flash_success_' + Date.now(),
                type: 'success',
                title: 'Success',
                message: flash.success,
            });
            return;
        }
        if (flash?.error) {
            setActiveToast({
                id: 'flash_error_' + Date.now(),
                type: 'error',
                title: 'Attention',
                message: flash.error,
            });
            return;
        }

        // Check if there is an unseen high-priority notification
        const unseen = (notifications || []).find(n => !seenToastIds.includes(n.id));
        if (unseen) {
            setActiveToast(unseen);
        }
    }, [notifications, flash]);

    // Auto-dismiss toast after 6 seconds
    useEffect(() => {
        if (!activeToast) return;
        const timer = setTimeout(() => {
            handleDismissToast(activeToast.id);
        }, 6000);
        return () => clearTimeout(timer);
    }, [activeToast]);

    const handleDismissToast = (id) => {
        if (!id) return;
        const updated = [...seenToastIds, id];
        setSeenToastIds(updated);
        try {
            sessionStorage.setItem('tn_seen_toast_ids', JSON.stringify(updated));
        } catch (e) {
            console.error(e);
        }
        setActiveToast(null);
    };

    if (!activeToast) return null;

    const isSuccess = activeToast.type === 'booking_accepted' || activeToast.type === 'proposal_accepted' || activeToast.type === 'success';

    return (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl p-4 flex items-start gap-3 backdrop-blur-md">
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                    isSuccess 
                        ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30' 
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}>
                    {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-[var(--text)] tracking-tight">
                            {activeToast.title}
                        </h4>
                        <button
                            type="button"
                            onClick={() => handleDismissToast(activeToast.id)}
                            className="text-[var(--muted)] hover:text-[var(--text)] p-0.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            aria-label="Dismiss toast"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                        {activeToast.message}
                    </p>

                    {activeToast.formatted_amount && (
                        <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                            {activeToast.formatted_amount}
                        </div>
                    )}

                    {activeToast.link && (
                        <div className="mt-3">
                            <Link
                                href={activeToast.link}
                                onClick={() => handleDismissToast(activeToast.id)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B1E2D] dark:text-[#E7A8AF] hover:underline"
                            >
                                <span>View Details</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Notification Bell Dropdown: Holds persistent history with deduplicated entries and theme tokens.
 */
export function NotificationBellDropdown() {
    const { notifications = [] } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [dismissedIds, setDismissedIds] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('tn_read_notifications') || '[]');
        } catch {
            return [];
        }
    });

    // Deduplicate notifications by unique identifier
    const uniqueNotifications = React.useMemo(() => {
        const seen = new Set();
        return (notifications || []).filter(item => {
            const key = item.id || `${item.type}_${item.message}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [notifications]);

    const unreadCount = uniqueNotifications.filter(n => !dismissedIds.includes(n.id)).length;

    const markAllRead = () => {
        const allIds = uniqueNotifications.map(n => n.id);
        setDismissedIds(allIds);
        try {
            sessionStorage.setItem('tn_read_notifications', JSON.stringify(allIds));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800 transition-all focus:outline-none cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#8B1E2D] text-[10px] font-bold text-white shadow-sm ring-2 ring-[var(--card)] animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                                <span className="font-bold text-xs text-[var(--text)]">Notifications</span>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    className="text-[11px] font-medium text-[var(--primary)] hover:underline cursor-pointer"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
                            {uniqueNotifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-[var(--muted)] text-xs">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--muted)]" />
                                    No notifications yet. When a vendor accepts your booking, it will appear here.
                                </div>
                            ) : (
                                uniqueNotifications.map((n) => {
                                    const isRead = dismissedIds.includes(n.id);
                                    return (
                                        <div
                                            key={n.id}
                                            className={`p-3.5 transition-all hover:bg-stone-50 dark:hover:bg-stone-800/40 ${
                                                isRead ? 'opacity-60' : 'bg-stone-50/30 dark:bg-stone-800/20'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <p className="text-xs font-bold text-[var(--text)] truncate">
                                                            {n.title}
                                                        </p>
                                                        <span className="text-[10px] text-[var(--muted)] flex-shrink-0">
                                                            {n.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                    {n.formatted_amount && (
                                                        <div className="mt-1 text-[11px] font-bold text-teal-700 dark:text-teal-300">
                                                            {n.formatted_amount}
                                                        </div>
                                                    )}
                                                    {n.link && (
                                                        <Link
                                                            href={n.link}
                                                            onClick={() => setIsOpen(false)}
                                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] hover:underline mt-2 cursor-pointer"
                                                        >
                                                            <span>View Details</span>
                                                            <ChevronRight className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-2 border-t border-[var(--border)] bg-stone-50/50 dark:bg-stone-900/50 text-center">
                            <Link
                                href="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="text-xs text-[var(--muted)] hover:text-[var(--text)] font-medium transition-colors"
                            >
                                Go to Dashboard →
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
