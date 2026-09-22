import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Users, Store, ShieldCheck, CheckCircle, XCircle, Eye, EyeOff, Award, AlertTriangle, Search } from 'lucide-react';

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
                            ? 'bg-amber-500 text-black shadow-md'
                            : 'bg-white/5 text-gray-300 hover:text-white'
                    }`}
                >
                    👥 Registered Vendors ({vendors.length})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('listings')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'listings'
                            ? 'bg-amber-500 text-black shadow-md'
                            : 'bg-white/5 text-gray-300 hover:text-white'
                    }`}
                >
                    📦 Marketplace Listings ({listings.length})
                </button>
            </div>

            {activeTab === 'vendors' ? (
                <div className="p-6 rounded-2xl bg-navy-card border border-white/10 shadow-xl space-y-6">
                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by business, contact, or district..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-[#080C16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold"
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
                                            ? 'bg-gold text-black'
                                            : 'bg-white/5 text-gray-300 hover:text-white'
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Vendor Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-300">
                            <thead className="border-b border-white/10 text-gray-400 uppercase text-[10px]">
                                <tr>
                                    <th className="pb-3">Business</th>
                                    <th className="pb-3">Category</th>
                                    <th className="pb-3">District</th>
                                    <th className="pb-3 text-center">AI Trust</th>
                                    <th className="pb-3 text-center">Status</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredVendors.map((vendor) => {
                                    const trustPercent = Math.round(vendor.trust_score * 100);
                                    return (
                                        <tr key={vendor.id} className="hover:bg-white/[0.02]">
                                            <td className="py-3">
                                                <div className="font-bold text-white text-sm">
                                                    {vendor.business_name}
                                                </div>
                                                <div className="text-[11px] text-gray-400">
                                                    {vendor.user?.name} ({vendor.user?.email}) • {vendor.user?.phone || 'No phone'}
                                                </div>
                                            </td>

                                            <td className="py-3 capitalize">
                                                {vendor.service_type?.replace('_', ' ')}
                                            </td>

                                            <td className="py-3">
                                                📍 {vendor.district?.name}
                                            </td>

                                            <td className="py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                                                    trustPercent >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                                }`}>
                                                    {trustPercent}%
                                                </span>
                                            </td>

                                            <td className="py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                    vendor.status === 'active'
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                        : vendor.status === 'pending'
                                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                                                }`}>
                                                    {vendor.status}
                                                </span>
                                            </td>

                                            <td className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {vendor.status !== 'active' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(vendor.id)}
                                                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {vendor.status !== 'suspended' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReject(vendor.id)}
                                                            className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/40 text-xs font-semibold transition-all cursor-pointer"
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
                <div className="p-6 rounded-2xl bg-navy-card border border-white/10 shadow-xl space-y-4">
                    <h3 className="font-display text-lg font-bold text-white mb-2">
                        Marketplace Listings Audit
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {listings.map((l) => (
                            <div key={l.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between gap-3">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{l.title}</h4>
                                            <span className="text-xs text-gray-400">By {l.vendor?.business_name} (📍 {l.vendor?.district?.name})</span>
                                        </div>
                                        <span className="font-bold text-gold text-sm font-mono">₹{l.price}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{l.description}</p>
                                </div>

                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        l.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                        {l.is_active ? 'Visible on Tourist Site' : 'Hidden'}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => handleToggleListing(l.id)}
                                        className="px-3 py-1 rounded-lg bg-white/10 hover:bg-gold hover:text-black text-xs font-semibold cursor-pointer"
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
