import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    MessageSquare,
    Search,
    Star,
    Check,
    EyeOff,
    Trash2,
    AlertTriangle,
    ShieldCheck,
    ThumbsUp,
    Filter
} from 'lucide-react';

export default function ReviewIndex({ reviews, pendingCount = 0, flaggedCount = 0, filters = {} }) {
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [sentimentFilter, setSentimentFilter] = useState(filters.sentiment || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.reviews.index'), {
            status: statusFilter,
            sentiment: sentimentFilter,
        }, { preserveState: true });
    };

    const handleStatusUpdate = (reviewId, newStatus) => {
        router.post(route('admin.reviews.updateStatus', reviewId), {
            status: newStatus,
        }, { preserveScroll: true });
    };

    const handleDelete = (reviewId) => {
        if (confirm('Permanently purge this review from the dataset?')) {
            router.delete(route('admin.reviews.destroy', reviewId), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout
            title="Review & Sentiment Moderation"
            subtitle="Audit real explorer reviews, filter automated spam, and verify rating distributions"
        >
            <Head title="Review Moderation — Admin" />

            <div className="space-y-6">

                {/* SUMMARY STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Pending Approval</div>
                            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</div>
                        </div>
                        <MessageSquare className="w-8 h-8 text-amber-500/30" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-[var(--muted)]">AI Spam & Abuse Flags</div>
                            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{flaggedCount}</div>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-rose-500/30" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Total Live Feedback</div>
                            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">{reviews.total || 0}</div>
                        </div>
                        <Star className="w-8 h-8 text-teal-500/30" />
                    </div>
                </div>

                {/* FILTERS */}
                <form onSubmit={handleFilter} className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] px-3 py-1.5 focus:outline-none focus:border-[var(--primary)]"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="hidden">Hidden</option>
                        </select>

                        <select
                            value={sentimentFilter}
                            onChange={(e) => setSentimentFilter(e.target.value)}
                            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] px-3 py-1.5 focus:outline-none focus:border-[var(--primary)]"
                        >
                            <option value="">All Sentiments</option>
                            <option value="positive">Positive</option>
                            <option value="neutral">Neutral</option>
                            <option value="negative">Negative</option>
                        </select>

                        <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs cursor-pointer transition-all shadow-sm"
                        >
                            Apply Filters
                        </button>
                    </div>
                </form>

                {/* REVIEWS TABLE */}
                <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[var(--text)]">
                            <thead className="bg-[var(--bg)] text-[var(--muted)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">User</th>
                                    <th className="px-4 py-3">Target Entity</th>
                                    <th className="px-4 py-3">Rating & Title</th>
                                    <th className="px-4 py-3">Feedback Text</th>
                                    <th className="px-4 py-3">AI Sentiment</th>
                                    <th className="px-4 py-3">Spam Score</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {reviews.data?.map((r) => (
                                    <tr key={r.id} className="hover:bg-[var(--bg)] transition">
                                        <td className="px-4 py-3.5 font-semibold text-[var(--text)]">
                                            {r.tourist?.name || 'Explorer'}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="text-[var(--text)] font-medium">
                                                {r.target_type === 'vendor' ? r.vendor?.business_name : r.place?.name}
                                            </div>
                                            <span className="text-[10px] text-[var(--muted)] uppercase">{r.target_type}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex text-amber-500">
                                                {[...Array(r.rating || 5)].map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 fill-amber-500" />
                                                ))}
                                            </div>
                                            {r.title && <div className="text-[var(--muted)] font-semibold mt-0.5">{r.title}</div>}
                                        </td>
                                        <td className="px-4 py-3.5 text-[var(--muted)] max-w-sm line-clamp-2">
                                            {r.comment}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                r.sentiment === 'positive' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' :
                                                r.sentiment === 'neutral' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                                                'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                            }`}>
                                                {r.sentiment || 'Positive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 font-mono">
                                            {r.spam_score > 50 ? (
                                                <span className="text-rose-600 dark:text-rose-400 font-bold">{r.spam_score}% (Spam Flagged)</span>
                                            ) : (
                                                <span className="text-teal-600 dark:text-teal-400">Clean ({r.spam_score || 0}%)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                                r.status === 'approved' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' :
                                                r.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                                                'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                                            }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {r.status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(r.id, 'approved')}
                                                        className="p-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 transition cursor-pointer shadow-sm"
                                                        title="Approve Review"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                {r.status !== 'hidden' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(r.id, 'hidden')}
                                                        className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition cursor-pointer shadow-sm"
                                                        title="Hide Review"
                                                    >
                                                        <EyeOff className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(r.id)}
                                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition cursor-pointer shadow-sm"
                                                    title="Delete Review"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
