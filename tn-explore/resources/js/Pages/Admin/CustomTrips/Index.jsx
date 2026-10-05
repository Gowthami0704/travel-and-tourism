import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Shield, CheckCircle2, XCircle, Clock, MapPin, Users, Calendar, 
    IndianRupee, Sparkles, Filter, Trash2, Check, X, AlertTriangle, 
    Eye, ArrowRight, Building2, Search, Compass, ChevronRight
} from 'lucide-react';

export default function AdminCustomTripsIndex({ auth, trips, filters = {}, counts = {} }) {
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectTripId, setRejectTripId] = useState(null);
    const [rejectReason, setRejectReason] = useState('Insufficient contact information or unrealistic budget allocation.');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const { post: postVerify, processing: verifying } = useForm();
    const { delete: deleteTrip } = useForm();

    const handleVerify = (tripId) => {
        postVerify(route('admin.custom-trips.verify', tripId), {
            preserveScroll: true,
        });
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        router.post(route('admin.custom-trips.reject', rejectTripId), { 
            reason: rejectReason 
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectModalOpen(false);
                setRejectTripId(null);
            }
        });
    };

    const handleDelete = (tripId) => {
        if (confirm('Are you sure you want to permanently delete this custom trip?')) {
            deleteTrip(route('admin.custom-trips.destroy', tripId), {
                preserveScroll: true,
            });
        }
    };

    const handleFilterChange = (key, value) => {
        router.get(route('admin.custom-trips.index'), {
            ...filters,
            [key]: value
        }, { preserveState: true });
    };

    return (
        <AdminLayout
            title="Custom Trips Moderation & Clearance"
            subtitle="Review traveler custom itineraries, verify safety & route details, and publish to certified tour operators"
        >
            <Head title="Custom Trips Moderation — Admin Command Center" />

            <div className="space-y-6">
                {/* 4 TOP SUMMARY COUNTER CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {/* Pending Moderation */}
                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-amber-500/30 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between text-amber-600 dark:text-amber-300 text-xs font-semibold">
                            <span>Pending Moderation</span>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-300 mt-2">{counts.pending || 0}</div>
                        <span className="text-[10px] text-[var(--muted)] mt-1">Requires Admin Verification</span>
                    </div>

                    {/* Verified & Active */}
                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-emerald-500/30 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-300 text-xs font-semibold">
                            <span>Verified & Active</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{counts.verified || 0}</div>
                        <span className="text-[10px] text-[var(--muted)] mt-1">Open for Vendor Quotes</span>
                    </div>

                    {/* Kerala Circuits */}
                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-teal-500/30 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between text-teal-600 dark:text-teal-300 text-xs font-semibold">
                            <span>Kerala Circuits</span>
                            <Sparkles className="w-4 h-4 text-teal-500" />
                        </div>
                        <div className="text-2xl font-black text-[var(--text)] mt-2">{counts.kerala || 0}</div>
                        <span className="text-[10px] text-[var(--muted)] mt-1">Munnar, Alleppey & Wayanad</span>
                    </div>

                    {/* Booked & Locked */}
                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-blue-500/30 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between text-blue-600 dark:text-blue-300 text-xs font-semibold">
                            <span>Booked & Locked</span>
                            <Shield className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-black text-[var(--text)] mt-2">{counts.booked || 0}</div>
                        <span className="text-[10px] text-[var(--muted)] mt-1">Proposals finalized</span>
                    </div>
                </div>

                {/* FILTERS & REGION CONTROLS */}
                <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-[var(--muted)] mr-2 flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5 text-amber-500" /> Filter:
                        </span>

                        {[
                            { id: 'all', label: 'All' },
                            { id: 'pending_verification', label: 'Pending Verification' },
                            { id: 'verified_active', label: 'Verified Active' },
                            { id: 'booked', label: 'Booked' },
                            { id: 'rejected', label: 'Rejected' },
                        ].map(st => (
                            <button
                                key={st.id}
                                type="button"
                                onClick={() => handleFilterChange('status', st.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                    (filters.status || 'all') === st.id
                                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                                        : 'bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                                }`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--muted)] font-semibold">Region:</span>
                        <select
                            value={filters.region || 'all'}
                            onChange={e => handleFilterChange('region', e.target.value)}
                            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-xs text-[var(--text)] focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                            <option value="all">All Regions</option>
                            <option value="inside_tn">Inside Tamil Nadu</option>
                            <option value="kerala">Kerala Circuit</option>
                            <option value="outside_tn">Outside TN / Interstate</option>
                        </select>
                    </div>
                </div>

                {/* TABLE OF CUSTOM TRIPS */}
                <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs text-[var(--text)]">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] uppercase tracking-wider font-semibold">
                                    <th className="py-3.5 px-4">Trip Request</th>
                                    <th className="py-3.5 px-4">Tourist User</th>
                                    <th className="py-3.5 px-4">Region & Destinations</th>
                                    <th className="py-3.5 px-4">Group & Budget</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Bids</th>
                                    <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {trips.data && trips.data.length > 0 ? (
                                    trips.data.map(trip => {
                                        const destinationsList = Array.isArray(trip.destinations) ? trip.destinations : [];
                                        const fromEntry = destinationsList.find(d => typeof d === 'string' && d.startsWith('From:'))?.replace('From:', '').trim();
                                        const toEntry = destinationsList.find(d => typeof d === 'string' && d.startsWith('To:'))?.replace('To:', '').trim();

                                        return (
                                            <tr key={trip.id} className="hover:bg-[var(--bg)]/50 transition-colors">
                                                <td className="py-4 px-4 font-semibold text-[var(--text)] max-w-xs">
                                                    <div className="font-bold text-sm text-[var(--text)]">{trip.title}</div>
                                                    <span className="text-[11px] text-[var(--muted)]">
                                                        #{trip.id} • {trip.duration_days} Days • <span className="capitalize">{trip.trip_type?.replace('_', ' ')}</span>
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4 text-[var(--text)]">
                                                    <div className="font-semibold text-[var(--text)]">{trip.user?.name || 'Tourist'}</div>
                                                    <div className="text-[11px] text-[var(--muted)]">{trip.user?.email}</div>
                                                </td>

                                                <td className="py-4 px-4 text-[var(--text)] max-w-xs">
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] block mb-1 w-fit">
                                                        {trip.destination_region === 'inside_tn' ? '🏛️ Inside TN' : '🌴 Outside TN'}
                                                    </span>
                                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                                                        {fromEntry ? `${fromEntry} ➔ ${toEntry}` : destinationsList.join(', ')}
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4 text-[var(--text)]">
                                                    <div>{trip.adults_count} Adults {trip.children_count > 0 ? `+ ${trip.children_count} Kids` : ''}</div>
                                                    <div className="font-bold text-amber-600 dark:text-amber-400">
                                                        ₹{Number(trip.budget_min).toLocaleString()} - ₹{Number(trip.budget_max).toLocaleString()}
                                                    </div>
                                                </td>

                                                <td className="py-4 px-4">
                                                    {trip.status === 'pending_verification' && (
                                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                                                            <Clock className="w-3 h-3 text-amber-500" /> Pending
                                                        </span>
                                                    )}
                                                    {trip.status === 'verified_active' && (
                                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified Active
                                                        </span>
                                                    )}
                                                    {trip.status === 'booked' && (
                                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1 w-fit">
                                                            <Check className="w-3 h-3" /> Booked
                                                        </span>
                                                    )}
                                                    {trip.status === 'rejected' && (
                                                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                                                            <X className="w-3 h-3" /> Rejected
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4">
                                                    <span className="font-bold text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] px-2.5 py-1 rounded-lg">
                                                        {trip.proposals_count || 0} quotes
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {trip.status === 'pending_verification' && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    disabled={verifying}
                                                                    onClick={() => handleVerify(trip.id)}
                                                                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                                                                    title="Verify and publish to vendors"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" />
                                                                    <span>Verify & Publish</span>
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setRejectTripId(trip.id);
                                                                        setRejectModalOpen(true);
                                                                    }}
                                                                    className="px-2.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-300 font-semibold rounded-xl text-xs border border-rose-500/30 transition-all cursor-pointer"
                                                                    title="Reject request"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(trip.id)}
                                                            className="p-1.5 bg-[var(--bg)] hover:bg-rose-500/20 text-[var(--muted)] hover:text-rose-500 dark:hover:text-rose-300 rounded-xl border border-[var(--border)] transition-colors cursor-pointer"
                                                            title="Delete request"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-10 text-center text-[var(--muted)] text-sm">
                                            No custom trip requests found matching the selected filter criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {trips.links && trips.links.length > 3 && (
                        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between gap-2">
                            <span className="text-xs text-[var(--muted)]">
                                Showing {trips.from || 0} to {trips.to || 0} of {trips.total || 0} requests
                            </span>
                            <div className="flex items-center gap-1">
                                {trips.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            link.active
                                                ? 'bg-amber-500 text-slate-950 font-bold'
                                                : link.url
                                                ? 'bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
                                                : 'text-[var(--muted)]/40 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* REJECT MODAL */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl max-w-md w-full p-6 shadow-2xl text-[var(--text)]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-rose-500" />
                                <span>Reject Custom Trip Request</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(false)}
                                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)]"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-[var(--muted)] mb-4">
                            Provide a reason to the tourist user explaining why this request cannot be verified.
                        </p>

                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <textarea
                                rows="3"
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--text)] focus:outline-none focus:border-rose-500"
                                required
                            />

                            <div className="flex justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
                                <button
                                    type="button"
                                    onClick={() => setRejectModalOpen(false)}
                                    className="px-4 py-2 bg-[var(--bg)] hover:bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] text-xs font-semibold rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
