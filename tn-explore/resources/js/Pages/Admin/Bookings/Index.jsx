import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Calendar,
    Search,
    DollarSign,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    User,
    Store,
    Phone,
    SlidersHorizontal,
    X
} from 'lucide-react';

export default function BookingIndex({ bookings, districts = [], filters = {}, financialSummary = {}, isSuperAdmin }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [districtFilter, setDistrictFilter] = useState(filters.district_id || '');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [overrideStatus, setOverrideStatus] = useState('cancelled');
    const [overrideReason, setOverrideReason] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.bookings.index'), {
            search,
            status: statusFilter,
            district_id: districtFilter,
        }, { preserveState: true });
    };

    const handleOverrideSubmit = (e) => {
        e.preventDefault();
        if (!selectedBooking || !overrideReason) return;

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
                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-emerald-500/30 shadow-lg flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Total Confirmed Revenue</div>
                            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                                {isSuperAdmin ? `₹${(financialSummary.totalRevenue || 0).toLocaleString('en-IN')}` : '🔒 Restricted'}
                            </div>
                        </div>
                        <DollarSign className="w-8 h-8 text-emerald-400/50" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-amber-500/30 shadow-lg flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Pending Escrow / Pipeline</div>
                            <div className="text-xl font-black text-amber-400 font-mono mt-1">
                                {isSuperAdmin ? `₹${(financialSummary.pendingRevenue || 0).toLocaleString('en-IN')}` : '🔒 Restricted'}
                            </div>
                        </div>
                        <Clock className="w-8 h-8 text-amber-400/50" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-white/10 shadow-lg flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Total Reservations</div>
                            <div className="text-xl font-black text-white mt-1">{financialSummary.totalCount || 0}</div>
                        </div>
                        <Calendar className="w-8 h-8 text-purple-400/50" />
                    </div>

                    <div className="p-4 rounded-2xl bg-[#0E1526] border border-red-500/20 shadow-lg flex items-center justify-between">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">Cancelled / Refunded</div>
                            <div className="text-xl font-black text-red-400 mt-1">{financialSummary.refundedCount || 0}</div>
                        </div>
                        <XCircle className="w-8 h-8 text-red-400/50" />
                    </div>
                </div>

                {/* SEARCH & FILTERS */}
                <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-[#0E1526] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, traveler name, phone, vendor, or listing..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl text-xs text-gray-300 px-3 py-1.5 focus:outline-none"
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
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all"
                        >
                            Filter
                        </button>
                    </div>
                </form>

                {/* BOOKINGS TABLE */}
                <div className="p-6 rounded-2xl bg-[#0E1526] border border-white/10 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-300">
                            <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
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
                            <tbody className="divide-y divide-white/5">
                                {bookings.data?.map((b) => (
                                    <tr key={b.id} className="hover:bg-white/5 transition">
                                        <td className="px-4 py-3.5 font-mono text-[11px] text-gray-500">#{b.id}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-white text-sm">{b.customer_name || b.tourist?.name || 'Guest'}</div>
                                            <div className="text-[11px] text-gray-400">{b.customer_phone || b.tourist?.phone}</div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-medium text-gray-200 line-clamp-1">{b.listing?.title}</div>
                                            <div className="text-[10px] text-gold mt-0.5">
                                                Provider: {b.listing?.vendor?.business_name || 'Vendor'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-300">
                                            <div>{b.start_date} {b.end_date && b.end_date !== b.start_date ? `➔ ${b.end_date}` : ''}</div>
                                            <div className="text-[10px] text-gray-500">{b.travelers || 1} Travelers</div>
                                        </td>
                                        <td className="px-4 py-3.5 font-bold text-emerald-400 font-mono text-sm">
                                            ₹{(b.total_amount || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                                b.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' :
                                                b.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                                                b.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                                                'bg-red-500/20 text-red-300'
                                            }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button
                                                onClick={() => setSelectedBooking(b)}
                                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-gray-200 text-[11px] font-semibold transition cursor-pointer"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="relative w-full max-w-md bg-[#0E1526] border border-white/10 rounded-2xl p-6 text-white space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h4 className="text-base font-bold text-white">Override Booking #{selectedBooking.id} Status</h4>
                            <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleOverrideSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Status</label>
                                <select
                                    value={overrideStatus}
                                    onChange={(e) => setOverrideStatus(e.target.value)}
                                    className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white"
                                >
                                    <option value="completed">Force Complete (Release Escrow)</option>
                                    <option value="cancelled">Force Cancel & Refund</option>
                                    <option value="accepted">Force Accept</option>
                                    <option value="rejected">Force Reject</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Official Reason for Audit Log</label>
                                <textarea
                                    rows="2"
                                    required
                                    placeholder="e.g. Customer dispute resolution / Weather disruption / Vendor unresponsive"
                                    value={overrideReason}
                                    onChange={(e) => setOverrideReason(e.target.value)}
                                    className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <button type="button" onClick={() => setSelectedBooking(null)} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-xs">
                                    Cancel
                                </button>
                                <button type="submit" className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">
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
