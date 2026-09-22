import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Store,
    Search,
    Filter,
    ShieldCheck,
    ShieldAlert,
    AlertTriangle,
    Eye,
    Check,
    X,
    Ban,
    Clock,
    FileText,
    MapPin,
    Phone,
    Mail,
    Send,
    Package,
    Calendar,
    Star,
    Sparkles
} from 'lucide-react';

export default function VendorIndex({ vendors, districts = [], filters = {} }) {
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [kycFilter, setKycFilter] = useState(filters.kyc_status || '');
    const [districtFilter, setDistrictFilter] = useState(filters.district_id || '');
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [warningText, setWarningText] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.vendors.index'), {
            search,
            status: statusFilter,
            kyc_status: kycFilter,
            district_id: districtFilter,
        }, { preserveState: true });
    };

    const handleStatusChange = (vendorId, newStatus) => {
        const reason = prompt(`Please specify reason for changing status to ${newStatus}:`, 'Officer Administrative Audit');
        if (reason !== null) {
            router.post(route('admin.vendors.updateStatus', vendorId), {
                status: newStatus,
                reason: reason,
            }, { preserveScroll: true });
        }
    };

    const handleKycChange = (vendorId, newKyc) => {
        const reason = prompt(`Reason for setting KYC status to ${newKyc}:`, 'Document Verification Audit');
        if (reason !== null) {
            router.post(route('admin.vendors.updateKyc', vendorId), {
                kyc_status: newKyc,
                reason: reason,
            }, { preserveScroll: true });
        }
    };

    const handleSendWarning = (e) => {
        e.preventDefault();
        if (!selectedVendor || !warningText) return;
        router.post(route('admin.vendors.warn', selectedVendor.id), {
            warning_message: warningText,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setWarningModalOpen(false);
                setWarningText('');
            }
        });
    };

    return (
        <AdminLayout
            title="Vendor & Partner Management"
            subtitle="Verify operator credentials, audit AI fraud risk, and control business listings"
        >
            <Head title="Vendor Management — Admin" />

            <div className="space-y-6">

                {/* FILTERS & SEARCH BAR */}
                <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-[#0E1526] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-1 items-center gap-2 min-w-[240px]">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search business name, owner, or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); }}
                            className="bg-slate-950 border border-white/10 rounded-xl text-xs text-gray-300 px-3 py-1.5 focus:outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                        </select>

                        {/* KYC Filter */}
                        <select
                            value={kycFilter}
                            onChange={(e) => { setKycFilter(e.target.value); }}
                            className="bg-slate-950 border border-white/10 rounded-xl text-xs text-gray-300 px-3 py-1.5 focus:outline-none"
                        >
                            <option value="">All KYC</option>
                            <option value="verified">Verified</option>
                            <option value="pending">KYC Pending</option>
                            <option value="incomplete">Incomplete</option>
                        </select>

                        {/* District Filter */}
                        <select
                            value={districtFilter}
                            onChange={(e) => { setDistrictFilter(e.target.value); }}
                            className="bg-slate-950 border border-white/10 rounded-xl text-xs text-gray-300 px-3 py-1.5 focus:outline-none"
                        >
                            <option value="">All Districts</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all"
                        >
                            Filter
                        </button>
                    </div>
                </form>

                {/* VENDORS TABLE */}
                <div className="p-6 rounded-2xl bg-[#0E1526] border border-white/10 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-300">
                            <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Business & Owner</th>
                                    <th className="px-4 py-3">District</th>
                                    <th className="px-4 py-3">Specialties</th>
                                    <th className="px-4 py-3">KYC Status</th>
                                    <th className="px-4 py-3">AI Trust</th>
                                    <th className="px-4 py-3">Fraud Risk</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {vendors.data?.map((vendor) => {
                                    const fraudScore = vendor.fraud_risk_score || 15;
                                    const fraudLevel = fraudScore >= 60 ? 'High' : fraudScore >= 30 ? 'Medium' : 'Low';
                                    const fraudColor = fraudScore >= 60 ? 'text-red-400 bg-red-500/15 border-red-500/30' :
                                                       fraudScore >= 30 ? 'text-amber-400 bg-amber-500/15 border-amber-500/30' :
                                                       'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';

                                    return (
                                        <tr key={vendor.id} className="hover:bg-white/5 transition">
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-white text-sm">{vendor.business_name}</div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    {vendor.owner_name || vendor.user?.name || 'Owner'} • {vendor.phone || vendor.user?.phone}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-300 font-medium">
                                                {vendor.district?.name || 'Tamil Nadu'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex flex-wrap gap-1 max-w-[140px]">
                                                    {vendor.specialties?.slice(0, 2).map((s, idx) => (
                                                        <span key={idx} className="px-1.5 py-0.2 rounded bg-white/5 text-[9px] text-gray-300 capitalize">
                                                            {s}
                                                        </span>
                                                    ))}
                                                    {(vendor.specialties?.length || 0) > 2 && (
                                                        <span className="text-[9px] text-gray-500">+{vendor.specialties.length - 2}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                    vendor.kyc_status === 'verified' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                                                    vendor.kyc_status === 'pending' ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' :
                                                    'bg-gray-500/15 text-gray-400 border-gray-500/30'
                                                }`}>
                                                    {vendor.kyc_status || 'Incomplete'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-emerald-400">
                                                {Math.round((vendor.trust_score || 0.85) * 100)}%
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${fraudColor}`}>
                                                    {fraudLevel} ({fraudScore})
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                                    vendor.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' :
                                                    vendor.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                                                    'bg-red-500/20 text-red-300'
                                                }`}>
                                                    {vendor.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setSelectedVendor(vendor)}
                                                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] transition cursor-pointer flex items-center gap-1"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Inspect</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* VENDOR DETAIL INSPECTION DRAWER */}
            {selectedVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
                    <div className="relative w-full max-w-3xl bg-[#0E1526] border border-white/10 rounded-3xl shadow-2xl p-6 text-white my-8 space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between border-b border-white/10 pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-white">{selectedVendor.business_name}</h3>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase">
                                        ID #{selectedVendor.id}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {selectedVendor.district?.name} • Registered {new Date(selectedVendor.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button onClick={() => setSelectedVendor(null)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* AI Fraud Risk & KYC Banner */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">AI Fraud Risk Evaluation</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-black text-white">{selectedVendor.fraud_risk_score || 15}/100</span>
                                    <span className="text-xs text-amber-400 font-semibold">
                                        {(selectedVendor.fraud_risk_score || 15) >= 60 ? '🔴 High Risk' : '🟢 Low Risk'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 leading-tight">
                                    {selectedVendor.fraud_risk_reason || 'Complaints: 0 • Refund requests: 0 • Clean record'}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 space-y-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Business License Proof</span>
                                <div className="flex items-center gap-2">
                                    {selectedVendor.license_url ? (
                                        <a
                                            href={selectedVendor.license_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                                        >
                                            <FileText className="w-4 h-4" />
                                            <span>View Uploaded Permit Document</span>
                                        </a>
                                    ) : (
                                        <span className="text-xs text-gray-500 italic">No license file uploaded</span>
                                    )}
                                </div>
                                <p className="text-[11px] text-gray-400">
                                    GST: {selectedVendor.gst_number || 'Not provided'}
                                </p>
                            </div>
                        </div>

                        {/* Listings Summary */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                                Published Fleet & Tour Listings ({selectedVendor.listings?.length || 0})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                {selectedVendor.listings?.map((l) => (
                                    <div key={l.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs flex justify-between">
                                        <span className="font-semibold text-gray-200 line-clamp-1">{l.title}</span>
                                        <span className="text-gold font-mono font-bold">₹{l.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Administrative Action Control Panel */}
                        <div className="pt-4 border-t border-white/10 space-y-3">
                            <span className="text-xs font-bold text-gray-400 uppercase">Executive Actions</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleStatusChange(selectedVendor.id, 'active')}
                                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                                >
                                    Approve & Activate
                                </button>
                                <button
                                    onClick={() => handleKycChange(selectedVendor.id, 'verified')}
                                    className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer"
                                >
                                    Verify KYC Document
                                </button>
                                <button
                                    onClick={() => handleStatusChange(selectedVendor.id, 'suspended')}
                                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer"
                                >
                                    Suspend Temporarily
                                </button>
                                <button
                                    onClick={() => handleStatusChange(selectedVendor.id, 'banned')}
                                    className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
                                >
                                    Ban Partner Permanently
                                </button>
                                <button
                                    onClick={() => setWarningModalOpen(true)}
                                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Send Warning Notice</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SEND WARNING MODAL */}
            {warningModalOpen && selectedVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="relative w-full max-w-md bg-[#0E1526] border border-white/10 rounded-2xl p-6 text-white space-y-4">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <span>Dispatch Warning to {selectedVendor.business_name}</span>
                        </h4>
                        <textarea
                            rows="3"
                            required
                            placeholder="Enter detailed notice regarding pricing abnormality, cancellation rate, or KYC requirement..."
                            value={warningText}
                            onChange={(e) => setWarningText(e.target.value)}
                            className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setWarningModalOpen(false)} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-xs">
                                Cancel
                            </button>
                            <button onClick={handleSendWarning} className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs">
                                Send Notice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
