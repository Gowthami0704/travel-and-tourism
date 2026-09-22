import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    MessageSquare,
    Star,
    Check,
    X,
    Trash2,
    Eye,
    EyeOff,
    AlertTriangle,
    Sparkles,
    User,
    Store
} from 'lucide-react';

export default function ReviewIndex({ reviews, filters = {}, pendingCount = 0, flaggedCount = 0 }) {
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
        if (confirm('Are you sure you want to permanently remove this review?')) {
            router.delete(route('admin.reviews.destroy', reviewId), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout
            title="Review Moderation & Sentiment AI"
            subtitle="Evaluate traveler feedback, analyze sentiment trends, and filter suspicious / spam submissions"
        >
            <Head title="Review Moderation — Admin" />

            <div className="space-y-6">

                {/* SUMMARY STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-amber-500/30 shadow-lg flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Pending Approval</div>
                            <div className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</div>
                        </div>
                        <MessageSquare className="w-8 h-8 text-amber-400/50" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-red-500/30 shadow-lg flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">AI Spam & Abuse Flags</div>
                            <div className="text-2xl font-black text-red-400 mt-1">{flaggedCount}</div>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-red-400/50" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-emerald-500/30 shadow-lg flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Total Live Feedback</div>
                            <div className="text-2xl font-black text-emerald-400 mt-1">{reviews.total || 0}</div>
                        </div>
                        <Star className="w-8 h-8 text-emerald-400/50" />
                    </div>
                </div>

                {/* FILTERS */}
                <form onSubmit={handleFilter} className="p-4 rounded-2xl bg-[#0E1526] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl text-xs text-gray-300 px-3 py-1.5 focus:outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="hidden">Hidden</option>
                        </select>

                        <select
                            value={sentimentFilter}
                            onChange={(e) => setSentimentFilter(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl text-xs text-gray-300 px-3 py-1.5 focus:outline-none"
                        >
                            <option value="">All Sentiments</option>
                            <option value="positive">Positive</option>
                            <option value="neutral">Neutral</option>
                            <option value="negative">Negative</option>
                        </select>

                        <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all"
                        >
                            Apply Filters
                        </button>
                    </div>
                </form>

                {/* REVIEWS TABLE */}
                <div className="p-6 rounded-2xl bg-[#0E1526] border border-white/10 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-300">
                            <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
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
                            <tbody className="divide-y divide-white/5">
                                {reviews.data?.map((r) => (
                                    <tr key={r.id} className="hover:bg-white/5 transition">
                                        <td className="px-4 py-3.5 font-semibold text-white">
                                            {r.tourist?.name || 'Explorer'}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="text-gray-200 font-medium">
                                                {r.target_type === 'vendor' ? r.vendor?.business_name : r.place?.name}
                                            </div>
                                            <span className="text-[10px] text-gray-500 uppercase">{r.target_type}</span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex text-gold">
                                                {[...Array(r.rating || 5)].map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 fill-gold" />
                                                ))}
                                            </div>
                                            {r.title && <div className="text-gray-300 font-semibold mt-0.5">{r.title}</div>}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-300 max-w-sm line-clamp-2">
                                            {r.comment}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                r.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                                r.sentiment === 'neutral' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                                'bg-red-500/20 text-red-300 border border-red-500/30'
                                            }`}>
                                                {r.sentiment || 'Positive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 font-mono">
                                            {r.spam_score > 50 ? (
                                                <span className="text-red-400 font-bold">{r.spam_score}% (Spam Flagged)</span>
                                            ) : (
                                                <span className="text-emerald-400">Clean ({r.spam_score || 0}%)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                                r.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                                                r.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {r.status !== 'approved' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(r.id, 'approved')}
                                                        className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 transition cursor-pointer"
                                                        title="Approve Review"
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                {r.status !== 'hidden' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(r.id, 'hidden')}
                                                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 transition cursor-pointer"
                                                        title="Hide Review"
                                                    >
                                                        <EyeOff className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(r.id)}
                                                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition cursor-pointer"
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
