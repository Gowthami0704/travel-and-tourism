import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Calendar,
    Search,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    SlidersHorizontal,
    FileSpreadsheet,
    Eye,
    X
} from 'lucide-react';

export default function BookingIndex({ bookings, financialSummary = {}, filters = {}, isSuperAdmin }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [overrideStatus, setOverrideStatus] = useState('completed');
    const [overrideReason, setOverrideReason] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.bookings.index'), {
            search,
            status: statusFilter,
        }, { preserveState: true });
    };

    const handleOverrideSubmit = (e) => {
        e.preventDefault();
        if (!selectedBooking) return;
        router.post(route('admin.bookings.override', selectedBooking.id), {
            status: overrideStatus,
            reason: overrideReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedBooking(null);
                setOverrideReason('');
            }
        });
    };

    return (
        <AdminLayout
            title="Bookings & Revenue Oversight"
            subtitle="Monitor statewide reservation pipelines, dispute resolution & force overrides"
        >
            <Head title="Booking Oversight — Admin" />

            <div className="space-y-6">

                {/* FINANCIAL SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Total Confirmed Revenue</div>
                            <div className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono mt-1">
                                {isSuperAdmin ? `₹${(financialSummary.totalRevenue || 0).toLocaleString('en-IN')}` : '🔒 Restricted'}
                            </div>
                        </div>
                        <DollarSign className="w-8 h-8 text-teal-500/30" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Pending Escrow / Pipeline</div>
                            <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                                {isSuperAdmin ? `₹${(financialSummary.pendingRevenue || 0).toLocaleString('en-IN')}` : '🔒 Restricted'}
                            </div>
                        </div>
                        <Clock className="w-8 h-8 text-amber-500/30" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Total Reservations</div>
                            <div className="text-xl font-black text-[var(--text)] mt-1">{financialSummary.totalCount || 0}</div>
                        </div>
                        <Calendar className="w-8 h-8 text-[var(--primary)]/30" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Cancelled / Refunded</div>
                            <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{financialSummary.refundedCount || 0}</div>
                        </div>
                        <XCircle className="w-8 h-8 text-rose-500/30" />
                    </div>
                </div>

                {/* SEARCH & FILTERS */}
                <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--muted)]" />
                        <input
                            type="text"
                            placeholder="Search by ID, traveler name, phone, vendor, or listing..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] px-3 py-1.5 focus:outline-none focus:border-[var(--primary)]"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs cursor-pointer transition-all shadow-sm"
                        >
                            Filter
                        </button>
                    </div>
                </form>

                {/* BOOKINGS TABLE */}
                <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[var(--text)]">
                            <thead className="bg-[var(--bg)] text-[var(--muted)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">ID</th>
                                    <th className="px-4 py-3">Traveler Details</th>
                                    <th className="px-4 py-3">Vendor / Service</th>
                                    <th className="px-4 py-3">Dates & Guests</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {bookings.data?.map((b) => (
                                    <tr key={b.id} className="hover:bg-[var(--bg)] transition">
                                        <td className="px-4 py-3.5 font-mono text-[11px] text-[var(--muted)]">#{b.id}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-[var(--text)] text-sm">{b.customer_name || b.tourist?.name || 'Guest'}</div>
                                            <div className="text-[11px] text-[var(--muted)]">{b.customer_phone || b.tourist?.phone}</div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-medium text-[var(--text)] line-clamp-1">{b.listing?.title}</div>
                                            <div className="text-[10px] text-[var(--primary)] mt-0.5">
                                                Provider: {b.listing?.vendor?.business_name || 'Vendor'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-[var(--text)]">
                                            <div>{b.start_date} {b.end_date && b.end_date !== b.start_date ? `➔ ${b.end_date}` : ''}</div>
                                            <div className="text-[10px] text-[var(--muted)]">{b.travelers || 1} Travelers</div>
                                        </td>
                                        <td className="px-4 py-3.5 font-bold text-teal-600 dark:text-teal-400 font-mono text-sm">
                                            ₹{(b.total_amount || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                                b.status === 'accepted' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' :
                                                b.status === 'completed' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                                                b.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                                                'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                            }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button
                                                onClick={() => setSelectedBooking(b)}
                                                className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--card)] text-[var(--text)] text-[11px] font-semibold transition cursor-pointer shadow-sm"
                                            >
                                                Override
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* OVERRIDE STATUS MODAL */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)] space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <h4 className="text-base font-bold text-[var(--text)]">Override Booking #{selectedBooking.id} Status</h4>
                            <button onClick={() => setSelectedBooking(null)} className="text-[var(--muted)] hover:text-[var(--text)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleOverrideSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Target Status</label>
                                <select
                                    value={overrideStatus}
                                    onChange={(e) => setOverrideStatus(e.target.value)}
                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                                >
                                    <option value="completed">Force Complete (Release Escrow)</option>
                                    <option value="cancelled">Force Cancel & Refund</option>
                                    <option value="accepted">Force Accept</option>
                                    <option value="rejected">Force Reject</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Official Reason for Audit Log</label>
                                <textarea
                                    rows="2"
                                    required
                                    placeholder="e.g. Customer dispute resolution / Weather disruption / Vendor unresponsive"
                                    value={overrideReason}
                                    onChange={(e) => setOverrideReason(e.target.value)}
                                    className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setSelectedBooking(null)} className="px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-xs">
                                    Cancel
                                </button>
                                <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-[var(--primary)] text-white font-bold text-xs">
                                    Apply Override
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
