import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, Store, ShieldCheck, CheckCircle, XCircle, Eye, EyeOff, Award, AlertTriangle, Search, MapPin } from 'lucide-react';

export default function VendorManagement({ vendors = [], listings = [] }) {
    const { post } = useForm();
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' | 'listings'

    const handleApprove = (id) => {
        post(route('admin.vendors.approve', id));
    };

    const handleReject = (id) => {
        post(route('admin.vendors.reject', id));
    };

    const handleToggleListing = (id) => {
        post(route('admin.listings.toggle', id));
    };

    const filteredVendors = vendors.filter((v) => {
        const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
        const matchesSearch = searchTerm === '' ||
            v.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.user?.name && v.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (v.district?.name && v.district.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    return (
        <AdminLayout
            title="Vendor & Listing Management"
            subtitle="Verify new registrations, audit listings, and manage merchant licenses"
        >
            <Head title="Vendor Management — TN Explore Admin" />

            {/* Top View Selector Tabs */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => setActiveTab('vendors')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'vendors'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                >
                    👥 Registered Vendors ({vendors.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('listings')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'listings'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                >
                    📦 Marketplace Listings ({listings.length})
                </button>
            </div>

            {activeTab === 'vendors' ? (
                <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-6">
                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by business, contact, or district..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {['all', 'pending', 'active', 'suspended'].map((st) => (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => setFilterStatus(st)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-all ${
                                        filterStatus === st
                                            ? 'bg-amber-500 text-slate-950 font-bold'
                                            : 'bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Vendor Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[var(--text)]">
                            <thead className="border-b border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] uppercase text-[10px]">
                                <tr>
                                    <th className="py-3 px-4 rounded-l-lg">Business</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">District</th>
                                    <th className="py-3 px-4 text-center">AI Trust</th>
                                    <th className="py-3 px-4 text-center">Status</th>
                                    <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {filteredVendors.map((vendor) => {
                                    const trustPercent = Math.round(vendor.trust_score * 100);
                                    return (
                                        <tr key={vendor.id} className="hover:bg-[var(--bg)]/50 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-[var(--text)] text-sm">
                                                    {vendor.business_name}
                                                </div>
                                                <div className="text-[11px] text-[var(--muted)]">
                                                    {vendor.user?.name} ({vendor.user?.email}) • {vendor.user?.phone || 'No phone'}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 capitalize text-[var(--muted)]">
                                                {vendor.service_type?.replace('_', ' ')}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <span className="flex items-center gap-1 text-[var(--text)]"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {vendor.district?.name}</span>
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                                                    trustPercent >= 80 ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' : 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                                                }`}>
                                                    {trustPercent}%
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    vendor.status === 'active'
                                                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                                        : vendor.status === 'pending'
                                                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse'
                                                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                                                }`}>
                                                    {vendor.status}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {vendor.status !== 'active' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(vendor.id)}
                                                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-sm"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {vendor.status !== 'suspended' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReject(vendor.id)}
                                                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
                                                        >
                                                            Suspend
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
                    <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                        Marketplace Listings Audit
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {listings.map((l) => (
                            <div key={l.id} className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex flex-col justify-between gap-3">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-bold text-[var(--text)] text-sm">{l.title}</h4>
                                            <span className="text-xs text-[var(--muted)]">By {l.vendor?.business_name} ({l.vendor?.district?.name})</span>
                                        </div>
                                        <span className="font-bold text-amber-600 dark:text-amber-400 text-sm font-mono">₹{l.price}</span>
                                    </div>
                                    <p className="text-xs text-[var(--muted)] mt-2 line-clamp-2">{l.description}</p>
                                </div>

                                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        l.is_active ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-gray-500/15 text-gray-600 dark:text-gray-400'
                                    }`}>
                                        {l.is_active ? 'Visible on Tourist Site' : 'Hidden'}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => handleToggleListing(l.id)}
                                        className="px-3 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:bg-amber-500 hover:text-slate-950 text-[var(--text)] text-xs font-semibold cursor-pointer transition-colors"
                                    >
                                        {l.is_active ? 'Hide Listing' : 'Publish Listing'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
