import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Store,
    Search,
    ShieldCheck,
    ShieldAlert,
    Ban,
    CheckCircle2,
    SlidersHorizontal,
    FileText,
    Sparkles,
    AlertTriangle,
    Eye,
    Send,
    UserCheck,
    X
} from 'lucide-react';

export default function VendorIndex({ vendors, districts, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [kycFilter, setKycFilter] = useState(filters.kyc_status || '');
    const [districtFilter, setDistrictFilter] = useState(filters.district_id || '');
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [warningText, setWarningText] = useState('');

    const [activeTab, setActiveTab] = useState('overview');
    const [credentialEmail, setCredentialEmail] = useState('');
    const [credentialName, setCredentialName] = useState('');
    const [credentialPassword, setCredentialPassword] = useState('');
    const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

    const handleSelectVendor = (v) => {
        setSelectedVendor(v);
        setActiveTab('overview');
        setCredentialEmail(v.user?.email || '');
        setCredentialName(v.user?.name || v.owner_name || '');
        setCredentialPassword('');
    };

    const handleSaveCredentials = (e) => {
        e.preventDefault();
        setIsUpdatingCreds(true);
        router.post(route('admin.vendors.updateCredentials', selectedVendor.id), {
            email: credentialEmail,
            name: credentialName,
            password: credentialPassword || undefined,
        }, {
            preserveScroll: true,
            onFinish: () => setIsUpdatingCreds(false)
        });
    };

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
        const actionLabel = newStatus === 'banned' ? 'ban' : (newStatus === 'active' ? 'approve' : 'update');
        const reason = prompt(`Administrative reason for setting status to '${newStatus}':`, `Admin status transition to ${newStatus}`);
        if (reason !== null) {
            router.post(route('admin.vendors.updateStatus', vendorId), {
                status: newStatus,
                admin_notes: reason,
            }, {
                preserveScroll: true,
                onSuccess: () => setSelectedVendor(null)
            });
        }
    };

    const handleKycChange = (vendorId, newKycStatus) => {
        const reason = prompt(`KYC verification note:`, `KYC manually updated to ${newKycStatus}`);
        if (reason !== null) {
            router.post(route('admin.vendors.updateKyc', vendorId), {
                kyc_status: newKycStatus,
                admin_notes: reason,
            }, {
                preserveScroll: true,
                onSuccess: () => setSelectedVendor(null)
            });
        }
    };

    const handleSendWarning = (e) => {
        e.preventDefault();
        if (!selectedVendor || !warningText) return;
        router.post(route('admin.vendors.warn', selectedVendor.id), {
            message: warningText,
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
                <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-1 items-center gap-2 min-w-[240px]">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--muted)]" />
                            <input
                                type="text"
                                placeholder="Search business name, owner, or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); }}
                            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] px-3 py-1.5 focus:outline-none focus:border-[var(--primary)]"
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
                            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] px-3 py-1.5 focus:outline-none focus:border-[var(--primary)]"
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
                            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] px-3 py-1.5 focus:outline-none focus:border-[var(--primary)]"
                        >
                            <option value="">All Districts</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs cursor-pointer transition-all shadow-sm"
                        >
                            Filter
                        </button>
                    </div>
                </form>

                {/* VENDORS TABLE */}
                <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-[var(--text)]">
                            <thead className="bg-[var(--bg)] text-[var(--muted)] uppercase text-[10px] font-bold tracking-wider border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Business & Owner</th>
                                    <th className="px-4 py-3">District</th>
                                    <th className="px-4 py-3">Specialties</th>
                                    <th className="px-4 py-3">KYC Status</th>
                                    <th className="px-4 py-3">Fraud Risk</th>
                                    <th className="px-4 py-3">Account Status</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {vendors.data?.map((v) => (
                                    <tr key={v.id} className="hover:bg-[var(--bg)] transition">
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-[var(--text)] text-sm">{v.business_name}</div>
                                            <div className="text-[11px] text-[var(--muted)]">{v.owner_name} • {v.phone}</div>
                                        </td>
                                        <td className="px-4 py-3.5 font-medium text-[var(--text)]">
                                            {v.district?.name || '—'}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-wrap gap-1">
                                                {v.specialties?.slice(0, 2).map((s, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[10px] text-[var(--text)]">
                                                        {s}
                                                    </span>
                                                )) || <span className="text-gray-400">—</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                v.kyc_status === 'verified' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' :
                                                v.kyc_status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                                                'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                            }`}>
                                                {v.kyc_status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`font-mono font-bold text-xs ${
                                                    (v.fraud_risk_score || 15) >= 60 ? 'text-rose-600 dark:text-rose-400' :
                                                    (v.fraud_risk_score || 15) >= 30 ? 'text-amber-600 dark:text-amber-400' :
                                                    'text-teal-600 dark:text-teal-400'
                                                }`}>
                                                    {v.fraud_risk_score || 15}/100
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                v.status === 'active' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' :
                                                v.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                                                'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                            }`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button
                                                onClick={() => handleSelectVendor(v)}
                                                className="px-3 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--card)] text-[var(--text)] font-semibold text-xs transition cursor-pointer flex items-center gap-1 ml-auto shadow-sm"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
                                                <span>Audit</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* VENDOR DETAIL INSPECTION DRAWER */}
            {selectedVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
                    <div className="relative w-full max-w-3xl bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl p-6 text-[var(--text)] my-8 space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-[var(--text)]">{selectedVendor.business_name}</h3>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-bold uppercase">
                                        ID #{selectedVendor.id}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--muted)] mt-0.5">
                                    {selectedVendor.district?.name} • Registered {new Date(selectedVendor.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button onClick={() => setSelectedVendor(null)} className="p-1.5 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs: Overview · User Account & Password · Activity Log */}
                        <div className="flex border-b border-[var(--border)] gap-4 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setActiveTab('overview')}
                                className={`pb-2 transition-colors cursor-pointer ${
                                    activeTab === 'overview'
                                        ? 'border-b-2 border-[#8B1E2D] text-[#8B1E2D] dark:text-[#E7A8AF]'
                                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                                }`}
                            >
                                Overview & Risk
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('credentials')}
                                className={`pb-2 transition-colors cursor-pointer ${
                                    activeTab === 'credentials'
                                        ? 'border-b-2 border-[#8B1E2D] text-[#8B1E2D] dark:text-[#E7A8AF]'
                                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                                }`}
                            >
                                User Account & Password
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('activities')}
                                className={`pb-2 transition-colors cursor-pointer ${
                                    activeTab === 'activities'
                                        ? 'border-b-2 border-[#8B1E2D] text-[#8B1E2D] dark:text-[#E7A8AF]'
                                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                                }`}
                            >
                                Partner Activities ({selectedVendor.bookings?.length || 0} Bookings)
                            </button>
                        </div>

                        {activeTab === 'overview' && (
                            <>
                                {/* AI Fraud Risk & KYC Banner */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
                                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase">AI Fraud Risk Evaluation</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-black text-[var(--text)]">{selectedVendor.fraud_risk_score || 15}/100</span>
                                            <span className="text-xs font-semibold text-amber-500">
                                                {(selectedVendor.fraud_risk_score || 15) >= 60 ? 'High Risk' : 'Low Risk'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[var(--muted)] leading-tight">
                                            {selectedVendor.fraud_risk_reason || 'Complaints: 0 • Refund requests: 0 • Clean record'}
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
                                        <span className="text-[10px] font-bold text-[var(--muted)] uppercase">Business License Proof</span>
                                        <div className="flex items-center gap-2">
                                            {selectedVendor.license_url ? (
                                                <a
                                                    href={`/admin/vendors/${selectedVendor.id}/document`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1 font-semibold"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    <span>View Uploaded Permit Document</span>
                                                </a>
                                            ) : (
                                                <span className="text-xs text-[var(--muted)] italic">No license file uploaded</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[var(--muted)]">
                                            GST: {selectedVendor.gst_number || 'Not provided'}
                                        </p>
                                    </div>
                                </div>

                                {/* Listings Summary */}
                                <div>
                                    <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-2">
                                        Published Fleet & Tour Listings ({selectedVendor.listings?.length || 0})
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                        {selectedVendor.listings?.map((l) => (
                                            <div key={l.id} className="p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs flex justify-between">
                                                <span className="font-semibold text-[var(--text)] line-clamp-1">{l.title}</span>
                                                <span className="font-mono font-bold text-[var(--primary)]">₹{l.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'credentials' && (
                            <form onSubmit={handleSaveCredentials} className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-1">
                                        Partner Login Credentials & Security Control
                                    </h4>
                                    <p className="text-[11px] text-[var(--muted)]">
                                        Admin can manage the username/email and directly reset the password for this vendor account.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--text)] mb-1">User Email / Username</label>
                                        <input
                                            type="email"
                                            value={credentialEmail}
                                            onChange={(e) => setCredentialEmail(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text)] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--text)] mb-1">Owner Display Name</label>
                                        <input
                                            type="text"
                                            value={credentialName}
                                            onChange={(e) => setCredentialName(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text)] outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                                        Set New Password (leave blank to keep current)
                                    </label>
                                    <input
                                        type="password"
                                        value={credentialPassword}
                                        onChange={(e) => setCredentialPassword(e.target.value)}
                                        placeholder="Enter new strong password"
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text)] outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[11px] text-[var(--muted)]">
                                        User ID #{selectedVendor.user_id} · Role: {selectedVendor.user?.role || 'vendor'}
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingCreds}
                                        className="px-4 py-2 rounded-xl bg-[#8B1E2D] hover:bg-[#721824] text-white text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
                                    >
                                        {isUpdatingCreds ? 'Saving Changes...' : 'Save Credentials'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'activities' && (
                            <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-3 max-h-60 overflow-y-auto">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                                    Recent Partner Bookings & Activities
                                </h4>
                                {(!selectedVendor.bookings || selectedVendor.bookings.length === 0) ? (
                                    <p className="text-xs text-[var(--muted)] italic">No recent bookings recorded yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedVendor.bookings.map((b) => (
                                            <div key={b.id} className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs flex items-center justify-between">
                                                <div>
                                                    <span className="font-bold text-[var(--text)]">{b.customer_name || 'Tourist'}</span>
                                                    <span className="text-[11px] text-[var(--muted)] ml-2">Booking #{b.id} ({b.start_date})</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[#8B1E2D] dark:text-[#E7A8AF]">₹{b.total_amount}</span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20 uppercase">
                                                        {b.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Administrative Action Control Panel */}
                        <div className="pt-4 border-t border-[var(--border)] space-y-3">
                            <span className="text-xs font-bold text-[var(--muted)] uppercase">Executive Actions</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleStatusChange(selectedVendor.id, 'active')}
                                    className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                                >
                                    Approve & Activate
                                </button>
                                <button
                                    onClick={() => handleKycChange(selectedVendor.id, 'verified')}
                                    className="px-3 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                                >
                                    Verify KYC Document
                                </button>
                                <button
                                    onClick={() => handleStatusChange(selectedVendor.id, 'suspended')}
                                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                                >
                                    Suspend Temporarily
                                </button>
                                <button
                                    onClick={() => handleStatusChange(selectedVendor.id, 'banned')}
                                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                                >
                                    Ban Partner Permanently
                                </button>
                                <button
                                    onClick={() => setWarningModalOpen(true)}
                                    className="px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--card)] text-[var(--text)] text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                                >
                                    <Send className="w-3.5 h-3.5 text-[var(--primary)]" />
                                    <span>Send Warning Notice</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SEND WARNING MODAL */}
            {warningModalOpen && selectedVendor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 text-[var(--text)] space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <h4 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <span>Dispatch Warning to {selectedVendor.business_name}</span>
                            </h4>
                            <button onClick={() => setWarningModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--text)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <textarea
                            rows="3"
                            required
                            placeholder="Enter detailed notice regarding pricing abnormality, cancellation rate, or KYC requirement..."
                            value={warningText}
                            onChange={(e) => setWarningText(e.target.value)}
                            className="w-full p-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--primary)]"
                        />
                        <div className="flex gap-2 justify-end pt-2">
                            <button onClick={() => setWarningModalOpen(false)} className="px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-xs">
                                Cancel
                            </button>
                            <button onClick={handleSendWarning} className="px-3.5 py-1.5 rounded-lg bg-[var(--primary)] text-white font-bold text-xs">
                                Send Notice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
