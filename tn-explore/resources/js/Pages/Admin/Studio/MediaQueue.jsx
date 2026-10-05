import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import {
    Image as ImageIcon,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ShieldAlert,
    Eye,
    Filter,
    Store,
    Check,
    X
} from 'lucide-react';

export default function AdminMediaQueue({ media = { data: [] }, stats = {}, currentStatus = 'pending', status }) {
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const handleApprove = (id) => {
        router.post(route('admin.studio.media.status', { id }), {
            status: 'approved',
        });
    };

    const handleReject = (e) => {
        e.preventDefault();
        if (!rejectingId) return;

        router.post(route('admin.studio.media.status', { id: rejectingId }), {
            status: 'rejected',
            reject_reason: rejectReason || 'Does not meet platform quality or duplicate image guidelines.',
        }, {
            onSuccess: () => {
                setRejectingId(null);
                setRejectReason('');
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Vendor Media & Photo Review Queue — Admin Center" />

            <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-slate-800">
                    <div>
                        <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-amber-500" />
                            <span>Vendor Media & Photo Moderation Queue</span>
                        </h1>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            Audit high-res photos, inspect duplicate perceptual hash (pHash) flags, and verify traveler memory submissions.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {['pending', 'approved', 'rejected', 'all'].map((st) => (
                            <button
                                key={st}
                                type="button"
                                onClick={() => router.get(route('admin.studio.media'), { status: st })}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    currentStatus === st
                                        ? 'bg-amber-500 text-stone-950 shadow-sm'
                                        : 'bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-stone-600 dark:text-stone-400'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                {status && (
                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{status}</span>
                    </div>
                )}

                {/* STATS STRIP */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-center space-y-1">
                        <span className="text-2xl font-black text-amber-500 font-mono">{stats.pending_count || 0}</span>
                        <span className="text-[11px] text-stone-500 block">Pending Review</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-center space-y-1">
                        <span className="text-2xl font-black text-emerald-500 font-mono">{stats.approved_count || 0}</span>
                        <span className="text-[11px] text-stone-500 block">Approved</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-center space-y-1">
                        <span className="text-2xl font-black text-rose-500 font-mono">{stats.rejected_count || 0}</span>
                        <span className="text-[11px] text-stone-500 block">Rejected</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 text-center space-y-1">
                        <span className="text-2xl font-black text-amber-400 font-mono">{stats.duplicate_flags_count || 0}</span>
                        <span className="text-[11px] text-amber-500 font-bold block">Duplicate pHash Flags</span>
                    </div>
                </div>

                {/* MEDIA GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {media.data?.map((m) => (
                        <div
                            key={m.id}
                            className="rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
                        >
                            <div>
                                <div className="relative aspect-[16/10] bg-stone-100 dark:bg-slate-800 overflow-hidden">
                                    <img src={m.medium_path || m.path} alt="Media" className="w-full h-full object-cover" />
                                    <div className="absolute top-2 left-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                            m.status === 'approved' ? 'bg-emerald-500 text-stone-950' : m.status === 'pending' ? 'bg-amber-500 text-stone-950' : 'bg-rose-500 text-white'
                                        }`}>
                                            {m.status}
                                        </span>
                                    </div>
                                    {m.phash && (
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-mono text-amber-300">
                                            pHash: {m.phash.substring(0, 8)}...
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 space-y-2">
                                    <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                                        {m.caption || 'Untitled Media'}
                                    </h4>
                                    <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                                        <Store className="w-3.5 h-3.5 text-amber-500" />
                                        <span>{m.vendor?.business_name || `Partner #${m.vendor_id}`}</span>
                                    </span>

                                    {m.reject_reason && (
                                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                                            ⚠️ {m.reject_reason}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Moderation Actions */}
                            <div className="p-4 pt-0 flex items-center gap-2 border-t border-stone-100 dark:border-slate-800 mt-2">
                                <button
                                    type="button"
                                    onClick={() => handleApprove(m.id)}
                                    className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRejectingId(m.id)}
                                    className="flex-1 py-1.5 px-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* REJECT REASON MODAL */}
                {rejectingId && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-stone-200 dark:border-slate-800 shadow-2xl space-y-4">
                            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-rose-500" />
                                <span>Reject Media Photo #{rejectingId}</span>
                            </h3>

                            <form onSubmit={handleReject} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                                        Rejection Reason (Visible to Vendor in Studio)
                                    </label>
                                    <textarea
                                        value={rejectReason}
                                        rows={3}
                                        required
                                        placeholder="e.g. Duplicate image detected from another vendor, low resolution, or inappropriate watermark..."
                                        className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-950 border border-stone-300 dark:border-slate-700 text-xs text-stone-900 dark:text-white"
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setRejectingId(null)}
                                        className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                                    >
                                        Confirm Rejection
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
