import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import SafeImage from '@/Components/Common/SafeImage';
import Card from '@/Components/UI/Card';
import StatusChip from '@/Components/UI/StatusChip';
import {
    FileCheck2,
    Check,
    X,
    ShieldCheck,
    AlertTriangle,
    Eye,
    FileText,
    Download,
    Building2,
    MapPin,
    Phone,
    Mail,
    Sparkles,
    CheckCircle2,
    Clock,
    AlertCircle,
    ExternalLink,
    Car,
    Package,
    Compass,
    User,
    Edit3,
    History,
    RefreshCw,
    Calendar,
    ArrowRight
} from 'lucide-react';

export default function KycIndex({ pendingVendors = [], verifiedVendors = [], pendingCount = 0 }) {
    const [selectedVendor, setSelectedVendor] = useState(pendingVendors[0] || null);
    
    // Reject modal state
    const [rejectReasonType, setRejectReasonType] = useState('Incomplete or Illegible Documents');
    const [rejectNotes, setRejectNotes] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Request changes modal state
    const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
    const [requestChangesNotes, setRequestChangesNotes] = useState('');
    const [deadlineDays, setDeadlineDays] = useState(7);
    const [selectedChecklist, setSelectedChecklist] = useState([]);

    const checklistOptions = [
        { id: 'owner_name_missing', label: 'Owner name missing or incomplete' },
        { id: 'phone_missing', label: 'Phone number missing or invalid' },
        { id: 'email_invalid', label: 'Email format or domain invalid' },
        { id: 'aadhaar_unclear', label: 'Aadhaar / ID proof image unclear or obscured' },
        { id: 'license_expired_unreadable', label: 'Trade / Tourism license expired, missing or unreadable' },
        { id: 'photo_unclear', label: 'Owner / Profile photograph unclear' },
        { id: 'gstin_missing', label: 'GSTIN certificate missing or invalid' },
        { id: 'district_proof_missing', label: 'Operational proof for requested districts missing' },
    ];
    
    // Admin district approval checkboxes for selected vendor
    const [approvedDistrictIds, setApprovedDistrictIds] = useState(() => {
        if (!selectedVendor) return [];
        return selectedVendor.district_ids || (selectedVendor.district_id ? [selectedVendor.district_id] : []);
    });

    const handleSelectVendor = (vendor) => {
        setSelectedVendor(vendor);
        const distIds = vendor.district_ids || (vendor.district_id ? [vendor.district_id] : []);
        setApprovedDistrictIds(distIds);
        setShowRejectModal(false);
        setShowRequestChangesModal(false);
        setSelectedChecklist([]);
        setRequestChangesNotes('');
    };

    const toggleDistrictApproval = (districtId) => {
        const numId = parseInt(districtId, 10);
        if (approvedDistrictIds.includes(numId)) {
            if (approvedDistrictIds.length === 1) return; // Keep at least 1 approved
            setApprovedDistrictIds(approvedDistrictIds.filter(id => id !== numId));
        } else {
            if (approvedDistrictIds.length >= 2) return;
            setApprovedDistrictIds([...approvedDistrictIds, numId]);
        }
    };

    const toggleChecklistItem = (itemId) => {
        if (selectedChecklist.includes(itemId)) {
            setSelectedChecklist(selectedChecklist.filter(id => id !== itemId));
        } else {
            setSelectedChecklist([...selectedChecklist, itemId]);
        }
    };

    const handleApprove = (vendorId) => {
        router.post(route('admin.kyc.approve', vendorId), {
            approved_district_ids: approvedDistrictIds,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                const remaining = pendingVendors.filter(v => v.id !== vendorId);
                const next = remaining[0] || null;
                handleSelectVendor(next);
            }
        });
    };

    const handleRequestChangesSubmit = (e) => {
        e.preventDefault();
        if (!selectedVendor || selectedChecklist.length === 0) return;

        router.post(route('admin.kyc.requestChanges', selectedVendor.id), {
            checklist_items: selectedChecklist,
            admin_notes: requestChangesNotes,
            deadline_days: deadlineDays,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRequestChangesModal(false);
                setSelectedChecklist([]);
                setRequestChangesNotes('');
                const remaining = pendingVendors.filter(v => v.id !== selectedVendor.id);
                const next = remaining[0] || null;
                handleSelectVendor(next);
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
                setShowRejectModal(false);
                setRejectNotes('');
                const remaining = pendingVendors.filter(v => v.id !== selectedVendor.id);
                const next = remaining[0] || null;
                handleSelectVendor(next);
            }
        });
    };

    const serviceIcons = {
        car: { icon: Car, label: 'Car & Fleet Rentals' },
        package: { icon: Package, label: 'Custom Tour Packages' },
        guide: { icon: Compass, label: 'Local Tourist Guide' },
    };

    return (
        <AdminLayout
            title="KYC Verification & Partner Onboarding Queue"
            subtitle="Review partner credentials, inspect proof documents, request changes, and grant operating authorizations"
        >
            <Head title="KYC Verification Queue — Admin" />

            <div className="space-y-6">
                {/* Header Stats Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <FileCheck2 className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block">
                                Pending Verification Queue
                            </span>
                            <span className="text-xl font-black text-[var(--text)]">
                                {pendingCount || pendingVendors.length} Submissions Awaiting Audit
                            </span>
                        </div>
                    </div>
                </div>

                {pendingVendors.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3 shadow-sm">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                        <h3 className="text-lg font-bold text-[var(--text)]">KYC Verification Queue is Clear</h3>
                        <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                            All registered travel vendors, cab operators, and guides have been audited and verified. Newly registered partners or resubmitted applications will appear here immediately.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT COLUMN (7 COLS): SELECTED VENDOR DOCUMENT & AUDIT INSPECTOR */}
                        {selectedVendor ? (
                            <div className="lg:col-span-7 rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 flex flex-col justify-between space-y-6 shadow-sm">
                                <div className="space-y-6">
                                    {/* Header Info */}
                                    <div className="flex items-start gap-4 pb-5 border-b border-[var(--border)]">
                                        <SafeImage
                                            src={selectedVendor.profile_photo_url}
                                            alt={selectedVendor.owner_name}
                                            className="w-16 h-16 rounded-2xl object-cover border border-amber-400 shadow-sm flex-shrink-0"
                                        />
                                        <div className="space-y-1 flex-1">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <h3 className="text-lg font-black text-[var(--text)]">
                                                    {selectedVendor.business_name}
                                                </h3>
                                                <div className="flex items-center gap-1.5">
                                                    {selectedVendor.kyc_status === 'resubmitted' && (
                                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 uppercase flex items-center gap-1">
                                                            <RefreshCw className="w-3 h-3 animate-spin" />
                                                            Resubmitted (Attempt {selectedVendor.correction_attempts || 1}/3)
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase">
                                                        {selectedVendor.kyc_status || selectedVendor.status || 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-[var(--muted)]">
                                                Owner: <strong className="text-[var(--text)]">{selectedVendor.owner_name}</strong>
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3.5 h-3.5 text-amber-500" />
                                                    {selectedVendor.user?.email}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                                                    {selectedVendor.phone}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DUPLICATE WARNINGS (IF ANY) */}
                                    {selectedVendor.duplicate_flags && selectedVendor.duplicate_flags.length > 0 && (
                                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                                <span>Potential Duplication Flagged</span>
                                            </div>
                                            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                                {selectedVendor.duplicate_flags.map((flag, idx) => (
                                                    <li key={idx}>{flag}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* RESUBMISSION DIFF (IF APPLICABLE) */}
                                    {selectedVendor.resubmission_diff && Object.keys(selectedVendor.resubmission_diff).length > 0 && (
                                        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                                                    <RefreshCw className="w-4 h-4" />
                                                    Revised Fields in this Resubmission
                                                </span>
                                                <span className="text-[10px] text-[var(--muted)]">
                                                    {new Date(selectedVendor.last_resubmitted_at || selectedVendor.updated_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                {Object.entries(selectedVendor.resubmission_diff).map(([k, item]) => (
                                                    <div key={k} className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] space-y-1">
                                                        <div className="font-bold text-[var(--text)] text-[11px]">{item.field || k}</div>
                                                        <div className="flex items-center gap-1.5 text-[11px]">
                                                            <span className="text-rose-500 line-through truncate max-w-[100px]">{String(item.old)}</span>
                                                            <ArrowRight className="w-3 h-3 text-[var(--muted)] shrink-0" />
                                                            <span className="text-emerald-500 font-bold truncate max-w-[130px]">{String(item.new)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Verification Proof Documents Grid */}
                                    <div className="space-y-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                                            <FileText className="w-4 h-4 text-amber-500" />
                                            Original Proof Documents (Admin-Only Secure Access)
                                        </span>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {/* Tourism License */}
                                            <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
                                                <span className="text-xs font-bold text-[var(--text)] block">
                                                    Trade / Tourism License
                                                </span>
                                                <a
                                                    href={`/admin/kyc/${selectedVendor.id}/document?type=license`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>View Document</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>

                                            {/* Aadhaar */}
                                            <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
                                                <span className="text-xs font-bold text-[var(--text)] block">
                                                    Aadhaar Identity Proof
                                                </span>
                                                <a
                                                    href={`/admin/kyc/${selectedVendor.id}/document?type=aadhaar`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>View Aadhaar</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>

                                            {/* GSTIN Certificate */}
                                            <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
                                                <span className="text-xs font-bold text-[var(--text)] block">
                                                    GSTIN Certificate
                                                </span>
                                                {selectedVendor.gstin_document_path ? (
                                                    <a
                                                        href={`/admin/kyc/${selectedVendor.id}/document?type=gstin`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>View GSTIN</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-[var(--muted)]">Not provided</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* District Authorization Selector (Approve 1 or both) */}
                                    <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-amber-500" />
                                                Authorize Operating Districts (Approve 1 or both)
                                            </span>
                                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                                {approvedDistrictIds.length} District(s) Authorized
                                            </span>
                                        </div>

                                        <p className="text-xs text-[var(--muted)]">
                                            Check the districts this vendor is licensed to serve. Approved vendors will only appear on the public pages of these districts.
                                        </p>

                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {(selectedVendor.selected_districts || []).map((dist) => {
                                                const isChecked = approvedDistrictIds.includes(dist.id);
                                                return (
                                                    <button
                                                        key={dist.id}
                                                        type="button"
                                                        onClick={() => toggleDistrictApproval(dist.id)}
                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                                                            isChecked
                                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                                : 'bg-[var(--card)] text-[var(--text)] border-[var(--border)] hover:border-[var(--muted)]'
                                                        }`}
                                                    >
                                                        <span>{isChecked ? '✓ Approved:' : '+ Include:'} {dist.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Services declaration */}
                                    <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                                            Registered Services
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {(selectedVendor.services || ['package']).map((srv) => {
                                                const conf = serviceIcons[srv] || { icon: Package, label: srv };
                                                const Icon = conf.icon;
                                                return (
                                                    <span key={srv} className="text-xs font-bold px-3 py-1 rounded-xl bg-[var(--card)] text-[var(--text)] border border-[var(--border)] flex items-center gap-1.5">
                                                        <Icon className="w-3.5 h-3.5 text-amber-500" />
                                                        {conf.label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* MESSAGE & ACTION HISTORY */}
                                    {selectedVendor.verification_messages && selectedVendor.verification_messages.length > 0 && (
                                        <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-3">
                                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                                                <History className="w-4 h-4 text-amber-500" />
                                                Verification History Thread ({selectedVendor.verification_messages.length})
                                            </span>
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                                {selectedVendor.verification_messages.map((msg) => (
                                                    <div key={msg.id} className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs space-y-1">
                                                        <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                                                            <span className="font-bold capitalize text-[var(--text)]">{msg.sender_role}: {msg.type.replace('_', ' ')}</span>
                                                            <span>{new Date(msg.created_at).toLocaleString()}</span>
                                                        </div>
                                                        {msg.note && <p className="text-[11px] text-[var(--text)] italic">"{msg.note}"</p>}
                                                        {msg.checklist_items && (
                                                            <div className="flex flex-wrap gap-1 pt-1">
                                                                {msg.checklist_items.map((it, i) => (
                                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
                                                                        {it}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* APPROVE / REQUEST CHANGES / REJECT ACTION BUTTONS */}
                                <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectModal(true)}
                                        className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Reject</span>
                                    </button>

                                    <div className="flex items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setShowRequestChangesModal(true)}
                                            className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Edit3 className="w-4 h-4 text-amber-500" />
                                            <span>Request Changes</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleApprove(selectedVendor.id)}
                                            disabled={approvedDistrictIds.length === 0}
                                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Check className="w-4 h-4 stroke-[3]" />
                                            <span>Approve ({approvedDistrictIds.length} Districts)</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* RIGHT COLUMN (5 COLS): PENDING QUEUE LIST */}
                        <div className="lg:col-span-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] p-5 space-y-4 shadow-sm">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-500" />
                                Submissions Queue ({pendingVendors.length})
                            </span>

                            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                                {pendingVendors.map((vendor) => {
                                    const isSelected = selectedVendor?.id === vendor.id;
                                    const isResubmitted = vendor.kyc_status === 'resubmitted';
                                    return (
                                        <button
                                            key={vendor.id}
                                            type="button"
                                            onClick={() => handleSelectVendor(vendor)}
                                            className={`w-full p-3.5 rounded-2xl text-left transition-all border cursor-pointer flex items-center gap-3.5 ${
                                                isSelected
                                                    ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-500/30 shadow-sm'
                                                    : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--muted)]'
                                            }`}
                                        >
                                            <SafeImage
                                                src={vendor.profile_photo_url}
                                                alt={vendor.owner_name}
                                                className="w-11 h-11 rounded-xl object-cover border border-amber-400 flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <h4 className="text-xs font-bold text-[var(--text)] truncate">
                                                        {vendor.business_name}
                                                    </h4>
                                                    {isResubmitted && (
                                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold shrink-0">
                                                            Resubmitted
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-[var(--muted)] truncate">
                                                    {vendor.owner_name} • {vendor.district?.name || 'Tamil Nadu'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] font-medium">
                                                        {(vendor.services || ['package']).join(', ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* REQUEST CHANGES MODAL */}
            {showRequestChangesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                            <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-amber-500" />
                                Request Corrections: {selectedVendor?.business_name}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowRequestChangesModal(false)}
                                className="text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleRequestChangesSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-2">
                                    Checklist of Flagged Items * (Select all that apply)
                                </label>
                                <div className="space-y-2">
                                    {checklistOptions.map((opt) => {
                                        const isChecked = selectedChecklist.includes(opt.id);
                                        return (
                                            <label
                                                key={opt.id}
                                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                                                    isChecked
                                                        ? 'bg-amber-500/15 border-amber-500/40 text-[var(--text)] font-semibold'
                                                        : 'bg-[var(--bg)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleChecklistItem(opt.id)}
                                                    className="rounded border-gray-400 text-amber-600 focus:ring-amber-500 mt-0.5"
                                                />
                                                <span>{opt.label}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-1">
                                        Correction Deadline (Days)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={deadlineDays}
                                        onChange={(e) => setDeadlineDays(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-1">
                                    Officer Instructions Note (Will be visible in vendor portal & email)
                                </label>
                                <textarea
                                    value={requestChangesNotes}
                                    onChange={(e) => setRequestChangesNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Specify exactly what document or detail needs to be updated (e.g. upload high-res scan of trade license)..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[var(--muted)] focus:ring-1 focus:ring-[var(--primary)]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border)]">
                                <button
                                    type="button"
                                    onClick={() => setShowRequestChangesModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] text-xs font-bold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={selectedChecklist.length === 0}
                                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Send Correction Request & Notify Vendor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* REJECT REASON MODAL */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                            <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                Reject Application: {selectedVendor?.business_name}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowRejectModal(false)}
                                className="text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleReject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-1.5">
                                    Primary Rejection Category *
                                </label>
                                <select
                                    value={rejectReasonType}
                                    onChange={(e) => setRejectReasonType(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)]"
                                >
                                    <option value="Incomplete or Illegible Documents">Incomplete or Illegible Documents</option>
                                    <option value="Expired Tourism License">Expired Tourism License</option>
                                    <option value="Identity Mismatch on Aadhaar">Identity Mismatch on Aadhaar</option>
                                    <option value="Unverifiable Business Address">Unverifiable Business Address</option>
                                    <option value="Exceeded Maximum Correction Attempts">Exceeded Maximum Correction Attempts</option>
                                    <option value="Other Compliance Issue">Other Compliance Issue</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-1.5">
                                    Detailed Feedback (Will be emailed to vendor) *
                                </label>
                                <textarea
                                    value={rejectNotes}
                                    onChange={(e) => setRejectNotes(e.target.value)}
                                    rows={3}
                                    required
                                    placeholder="Explain why the application cannot be approved..."
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] placeholder-[var(--muted)]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border)]">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] text-xs font-bold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow cursor-pointer"
                                >
                                    Confirm Rejection & Dispatch Email
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
