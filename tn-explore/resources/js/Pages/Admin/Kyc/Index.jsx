import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    FileCheck2,
    Check,
    X,
    ShieldCheck,
    AlertTriangle,
    Eye,
    FileText,
    Download,
    ZoomIn,
    Building2,
    MapPin,
    Phone,
    Mail,
    Sparkles
} from 'lucide-react';

export default function KycIndex({ pendingVendors = [], verifiedVendors = [] }) {
    const [selectedVendor, setSelectedVendor] = useState(pendingVendors[0] || null);
    const [rejectReasonType, setRejectReasonType] = useState('Illegible / Blurry Document');
    const [rejectNotes, setRejectNotes] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    const handleApprove = (vendorId) => {
        router.post(route('admin.kyc.approve', vendorId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                const remaining = pendingVendors.filter(v => v.id !== vendorId);
                setSelectedVendor(remaining[0] || null);
            }
        });
    };

    const handleReject = (e) => {
        e.preventDefault();
        if (!selectedVendor) return;
        router.post(route('admin.kyc.reject', selectedVendor.id), {
            rejection_reason_type: rejectReasonType,
            rejection_notes: rejectNotes,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectForm(false);
                setRejectNotes('');
                const remaining = pendingVendors.filter(v => v.id !== selectedVendor.id);
                setSelectedVendor(remaining[0] || null);
            }
        });
    };

    return (
        <AdminLayout
            title="KYC Verification Queue"
            subtitle="Split-screen audit workstation for inspecting tourism licenses, permits & Govt ID proofs"
        >
            <Head title="KYC Verification Queue — Admin" />

            <div className="space-y-6">

                {pendingVendors.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-[#0E1526] border border-white/10 space-y-3">
                        <FileCheck2 className="w-12 h-12 text-emerald-400 mx-auto" />
                        <h3 className="text-lg font-bold text-white">KYC Verification Queue is Clear</h3>
                        <p className="text-xs text-gray-400 max-w-sm mx-auto">
                            All registered travel vendors and tour operators have been audited and verified.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* LEFT COLUMN (7 COLS): DOCUMENT ZOOM & INSPECTOR */}
                        <div className="lg:col-span-7 rounded-3xl bg-[#0E1526] border border-white/10 p-6 flex flex-col justify-between space-y-4 shadow-2xl">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-amber-400" />
                                    <span className="text-sm font-bold text-white">Document Inspection Viewer</span>
                                </div>
                                {selectedVendor?.license_url && (
                                    <a
                                        href={selectedVendor.license_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                                    >
                                        <ZoomIn className="w-3.5 h-3.5" />
                                        <span>Open Full Resolution</span>
                                    </a>
                                )}
                            </div>

                            {/* DOCUMENT PREVIEW */}
                            <div className="h-96 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                                {selectedVendor?.license_url ? (
                                    selectedVendor.license_url.endsWith('.pdf') ? (
                                        <div className="text-center p-6 space-y-2">
                                            <FileText className="w-16 h-16 text-amber-400 mx-auto" />
                                            <p className="text-xs text-gray-300 font-semibold">PDF Document Uploaded</p>
                                            <a
                                                href={selectedVendor.license_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs inline-block"
                                            >
                                                Download & View PDF
                                            </a>
                                        </div>
                                    ) : (
                                        <img
                                            src={selectedVendor.license_url}
                                            alt="License preview"
                                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                                        />
                                    )
                                ) : (
                                    <div className="text-center text-gray-500 p-6">
                                        <AlertTriangle className="w-10 h-10 mx-auto text-amber-400/60 mb-2" />
                                        <p className="text-xs font-semibold text-gray-400">No Document Uploaded by Vendor</p>
                                        <p className="text-[11px] text-gray-500 mt-1">Vendor has registered basic details without attaching proof</p>
                                    </div>
                                )}
                            </div>

                            {/* PENDING QUEUE SELECTOR PILLS */}
                            <div className="space-y-2 pt-2 border-t border-white/10">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                    Pending Queue ({pendingVendors.length} Submissions)
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {pendingVendors.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => { setSelectedVendor(v); setShowRejectForm(false); }}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                                selectedVendor?.id === v.id
                                                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                                                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                                            }`}
                                        >
                                            {v.business_name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN (5 COLS): VENDOR DETAILS & ACTION BUTTONS */}
                        <div className="lg:col-span-5 rounded-3xl bg-[#0E1526] border border-white/10 p-6 flex flex-col justify-between space-y-5 shadow-2xl">
                            {selectedVendor ? (
                                <>
                                    <div className="space-y-4">
                                        <div className="border-b border-white/10 pb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase">
                                                    KYC #{selectedVendor.id}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mt-1">{selectedVendor.business_name}</h3>
                                            <p className="text-xs text-gray-400">{selectedVendor.district?.name}, Tamil Nadu</p>
                                        </div>

                                        {/* Meta Breakdown */}
                                        <div className="space-y-2.5 text-xs text-gray-300">
                                            <div className="flex justify-between py-1 border-b border-white/5">
                                                <span className="text-gray-400">Owner Name:</span>
                                                <span className="font-semibold text-white">{selectedVendor.owner_name || selectedVendor.user?.name}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-white/5">
                                                <span className="text-gray-400">Contact Phone:</span>
                                                <span className="font-semibold text-white">{selectedVendor.phone || selectedVendor.user?.phone}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-white/5">
                                                <span className="text-gray-400">Business Email:</span>
                                                <span className="font-semibold text-white">{selectedVendor.user?.email}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-white/5">
                                                <span className="text-gray-400">GST Registration:</span>
                                                <span className="font-mono font-bold text-gold">{selectedVendor.gst_number || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-white/5">
                                                <span className="text-gray-400">Specialties:</span>
                                                <span className="text-emerald-400 font-semibold capitalize">
                                                    {selectedVendor.specialties?.join(', ') || 'Tour packages'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Business Description</span>
                                            <p className="text-xs text-gray-300 bg-slate-950 p-3 rounded-xl border border-white/5 line-clamp-3">
                                                {selectedVendor.description || 'No description supplied.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="pt-4 border-t border-white/10 space-y-3">
                                        {!showRejectForm ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => handleApprove(selectedVendor.id)}
                                                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span>Approve & Verify</span>
                                                </button>

                                                <button
                                                    onClick={() => setShowRejectForm(true)}
                                                    className="py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span>Reject Submission</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleReject} className="space-y-3 p-3 rounded-2xl bg-slate-950 border border-red-500/30">
                                                <div className="flex items-center justify-between text-xs font-bold text-red-400">
                                                    <span>Specify Rejection Reason</span>
                                                    <button type="button" onClick={() => setShowRejectForm(false)} className="text-gray-400 hover:text-white">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <select
                                                    value={rejectReasonType}
                                                    onChange={(e) => setRejectReasonType(e.target.value)}
                                                    className="w-full p-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                                                >
                                                    <option value="Illegible / Blurry Document">Illegible / Blurry Document</option>
                                                    <option value="Expired Permit or License">Expired Permit or License</option>
                                                    <option value="Name / GST Mismatch">Name / GST Mismatch</option>
                                                    <option value="Incomplete Business Proof">Incomplete Business Proof</option>
                                                    <option value="Suspicious / Tampered Certificate">Suspicious / Tampered Certificate</option>
                                                </select>

                                                <textarea
                                                    rows="2"
                                                    placeholder="Additional officer notes for the vendor..."
                                                    value={rejectNotes}
                                                    onChange={(e) => setRejectNotes(e.target.value)}
                                                    className="w-full p-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
                                                />

                                                <button
                                                    type="submit"
                                                    className="w-full py-2 rounded-xl bg-red-500 text-white font-bold text-xs"
                                                >
                                                    Confirm Rejection
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-gray-500 text-xs">
                                    Select a pending submission from the queue.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
