import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Image as ImageIcon, CheckCircle2, XCircle, Trash2, Plus, 
    Filter, ExternalLink, MapPin, Search, ShieldCheck, AlertCircle, X
} from 'lucide-react';

export default function PlaceImagesIndex({ images, districts = [], places = [], filters = {}, stats = {} }) {
    const [selectedDistrict, setSelectedDistrict] = useState(filters.district_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        place_id: places[0]?.id || '',
        url: '',
        source: 'Tamil Nadu Tourism Dept / Wikimedia Commons',
        credit: 'Photo by Tamil Nadu Tourism / CC BY-SA 4.0',
        alt_text: '',
        auto_approve: true,
    });

    const handleFilterChange = (districtId, status) => {
        router.get(route('admin.place-images.index'), {
            district_id: districtId || undefined,
            status: status !== 'all' ? status : undefined,
        }, { preserveState: true });
    };

    const handleApprove = (id) => {
        router.post(route('admin.place-images.approve', id), {}, { preserveScroll: true });
    };

    const handleReject = (id) => {
        router.post(route('admin.place-images.reject', id), {}, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this photo record?')) {
            router.delete(route('admin.place-images.destroy', id), { preserveScroll: true });
        }
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        post(route('admin.place-images.store'), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    return (
        <AdminLayout
            title="Place Photographs Approval & Curation"
            subtitle="Admin gatekeeper for authentic tourism imagery across 38 districts (Only approved photos render publicly)"
        >
            <Head title="Place Images Approval — Admin Control Panel" />

            <div className="space-y-6">
                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs text-[var(--muted)] font-semibold">Total Photo Records</span>
                            <div className="text-2xl font-black text-[var(--text)] mt-1">{stats.total || 0}</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Approved & Publicly Live</span>
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.approved || 0}</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Pending Approval Queue</span>
                            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pending || 0}</div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Filter & Action Controls */}
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <select
                            value={selectedDistrict}
                            onChange={(e) => {
                                setSelectedDistrict(e.target.value);
                                handleFilterChange(e.target.value, selectedStatus);
                            }}
                            className="px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] focus:outline-none focus:border-amber-500"
                        >
                            <option value="">All Districts</option>
                            {districts.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs font-semibold">
                            <button
                                onClick={() => {
                                    setSelectedStatus('all');
                                    handleFilterChange(selectedDistrict, 'all');
                                }}
                                className={`px-3 py-1.5 rounded-lg transition-all ${selectedStatus === 'all' ? 'bg-[var(--card)] shadow-xs text-[var(--text)] font-bold' : 'text-[var(--muted)]'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedStatus('approved');
                                    handleFilterChange(selectedDistrict, 'approved');
                                }}
                                className={`px-3 py-1.5 rounded-lg transition-all ${selectedStatus === 'approved' ? 'bg-emerald-600 text-white font-bold' : 'text-[var(--muted)]'}`}
                            >
                                Approved Only
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedStatus('pending');
                                    handleFilterChange(selectedDistrict, 'pending');
                                }}
                                className={`px-3 py-1.5 rounded-lg transition-all ${selectedStatus === 'pending' ? 'bg-amber-600 text-white font-bold' : 'text-[var(--muted)]'}`}
                            >
                                Pending Review
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add & Approve Real Photo</span>
                    </button>
                </div>

                {/* Photo Gallery Grid */}
                {images.data && images.data.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.data.map((img) => (
                            <div key={img.id} className="rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                                <div className="relative h-44 bg-[var(--bg)]">
                                    <img
                                        src={img.url}
                                        alt={img.alt_text || 'Place photo'}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2.5 right-2.5">
                                        {img.is_approved ? (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3 text-amber-500" />
                                                Pending Review
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm text-[var(--text)] line-clamp-1">{img.place?.name}</h4>
                                        <p className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5">
                                            <MapPin className="w-3 h-3 text-amber-500" />
                                            <span>{img.place?.district?.name || 'Tamil Nadu'}</span>
                                        </p>
                                        <p className="text-[11px] text-[var(--muted)] mt-2 line-clamp-1">
                                            <strong>Credit:</strong> {img.credit || 'Tamil Nadu Tourism Dept'}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                                        {img.is_approved ? (
                                            <button
                                                type="button"
                                                onClick={() => handleReject(img.id)}
                                                className="px-2.5 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--card)] text-[var(--text)] border border-[var(--border)] text-xs font-semibold cursor-pointer"
                                            >
                                                Unapprove
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleApprove(img.id)}
                                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Approve
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(img.id)}
                                            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                                            title="Delete image"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 bg-[var(--card)] rounded-2xl border border-[var(--border)] text-center text-[var(--muted)] text-xs">
                        No image records match your filters.
                    </div>
                )}
            </div>

            {/* ADD MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-[var(--card)] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[var(--border)] text-[var(--text)]">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <h3 className="font-bold text-base text-[var(--text)]">Add Genuine Place Photograph</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--text)] cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-[var(--text)] mb-1">Target Place / Attraction</label>
                                <select
                                    value={data.place_id}
                                    onChange={(e) => setData('place_id', e.target.value)}
                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-amber-500"
                                >
                                    {places.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-[var(--text)] mb-1">High-Resolution Photo URL</label>
                                <input
                                    type="url"
                                    value={data.url}
                                    onChange={(e) => setData('url', e.target.value)}
                                    placeholder="https://images.unsplash.com/... or Wikimedia Commons URL"
                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-amber-500"
                                    required
                                />
                                {errors.url && <p className="text-rose-500 mt-1">{errors.url}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-[var(--text)] mb-1">Source (e.g. Wikimedia / TN Tourism)</label>
                                <input
                                    type="text"
                                    value={data.source}
                                    onChange={(e) => setData('source', e.target.value)}
                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block font-semibold text-[var(--text)] mb-1">Photo Credit / License</label>
                                <input
                                    type="text"
                                    value={data.credit}
                                    onChange={(e) => setData('credit', e.target.value)}
                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-2 rounded-xl bg-[var(--bg)] hover:bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer disabled:opacity-50 shadow-sm"
                                >
                                    {processing ? 'Saving...' : 'Save & Approve'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
